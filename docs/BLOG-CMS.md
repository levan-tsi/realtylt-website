# BLOG CMS — the contract between the CRM "Website" section and realtylt.com

**Owner requirement #6:** the CRM gets a *Website* section that lets the owner post blog articles to the
marketing site. This document is the whole contract. The CRM agent can build against it without guessing.

- **Website side (built, live):** reads PUBLISHED posts from Supabase and merges them with the existing
  static posts. `/blog`, `/blog/[slug]`, `/sitemap.xml`.
- **CRM side (to build):** create / edit / publish / unpublish rows in `public.blog_posts`, then ping the
  website's revalidate hook.
- **Shared DB:** Supabase project `wpfmhmnceflfruhssqqb` (the CRM's project). Migration
  `website_blog_posts`, applied 2026-07-13; version-controlled copy at
  `supabase/migrations/website_blog_posts.sql` in the `realtylt-website` repo.

---

## 1. The table — `public.blog_posts`

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `organization_id` | `uuid` NOT NULL → `organizations(id)` | **stamped automatically** from `current_org_id()` if you omit it |
| `slug` | `text` NOT NULL **UNIQUE** | this *is* the public URL: `/blog/<slug>`. `^[a-z0-9]+(?:-[a-z0-9]+)*$`, 3–120 chars |
| `title` | `text` NOT NULL | 1–200 chars |
| `excerpt` | `text` NOT NULL, default `''` | ≤400 chars. Shown on the index card and in the post header |
| `body` | `text` NOT NULL, default `''` | **Markdown** — supported subset in §4. ≤100,000 chars |
| `cover_image_url` | `text` NULL | site-relative (`/images/...`) **or** an https URL. See §5 |
| `author_name` | `text` NOT NULL, default `'Levan Tsiklauri'` | used in the BlogPosting JSON-LD |
| `status` | `text` NOT NULL, default `'draft'` | **`draft` \| `published`** — the only two values |
| `published_at` | `timestamptz` NULL | **stamped automatically** the first time `status` becomes `published`. Drives the display date and the newest-first sort |
| `seo_title` | `text` NULL | ≤200. Falls back to `title` |
| `seo_description` | `text` NULL | ≤400. Falls back to `excerpt` |
| `created_by` | `uuid` NULL → `auth.users(id)` | optional |
| `created_at` / `updated_at` | `timestamptz` NOT NULL | `updated_at` is stamped on every write |

**CHECK constraints that will reject a bad write** (surface these as form validation in the CRM):
`blog_posts_slug_format`, `blog_posts_status_chk`, `blog_posts_title_len`, `blog_posts_excerpt_len`,
`blog_posts_body_len`, `blog_posts_seo_t_len`, `blog_posts_seo_d_len`, `blog_posts_cover_url`
(cover must be `/…` or `https://…/…`), and **`blog_posts_publishable`** — *a post cannot be set to
`published` with an empty title or an empty body.*

**Trigger `blog_posts_stamp_trg` (BEFORE INSERT OR UPDATE)** fills `organization_id` (from
`current_org_id()`), stamps `published_at` on first publish, and bumps `updated_at`. So the CRM only ever
has to write `slug/title/excerpt/body/cover_image_url/status` (+ optional SEO fields).

**Indexes:** `(organization_id)`, `(status, published_at desc)`, `(created_by)`.

### RLS (verified live against the deployed policies)

| role | may |
|---|---|
| `anon` (the website's key) | **SELECT only, and only `status = 'published'`.** A draft is invisible. INSERT → `401 / 42501`; UPDATE and DELETE affect **0 rows**. |
| `authenticated` (a CRM user) | **full CRUD** on rows where `organization_id = current_org_id()` — drafts included. This is the policy the CRM's normal Supabase client already runs under; nothing special to configure. |
| `service_role` | everything (bypasses RLS). |

Policies: `blog_posts_public_select` (anon, `using (status = 'published')`) and `blog_posts_org_all`
(authenticated, `for all`, `organization_id = current_org_id()` in both `using` and `with check`).

### Cover-image storage

Public bucket **`blog-media`** exists in the same project. `authenticated` may INSERT / UPDATE / DELETE in
it (policies `blog_media_authenticated_*`); reads are public. Upload from the CRM with the normal storage
client and store the resulting public URL:

```
https://wpfmhmnceflfruhssqqb.supabase.co/storage/v1/object/public/blog-media/<path>.jpg
```

The website only renders covers that are **site-relative** or on **that exact origin + prefix** — anything
else silently falls back to a default cover (`lib/blog/db.ts` → `safeCover`), so a bad or hostile URL can
never point `next/image` at a foreign host.

---

## 2. Publishing flow (what the CRM does)

1. **Create / edit** → `insert`/`update` a row with `status = 'draft'`. Nothing appears on the website.
2. **Publish** → set `status = 'published'` (the trigger stamps `published_at`).
3. **Ping the website** → `POST https://realtylt-website.vercel.app/api/revalidate` (§3). Within a second
   the post is live at `/blog/<slug>` and on the index.
4. **Unpublish** → set `status = 'draft'` and ping again. The page 404s and drops out of the index/sitemap.
5. **Delete** → `delete` the row and ping. (Deleting a slug that Google has indexed leaves a 404 — prefer
   unpublish unless the post was a mistake.)

Without the ping the site still catches up on its own within **5 minutes** (ISR). The ping just makes it
instant.

### Replacing one of the 10 seeded stubs

The website ships 10 hand-written placeholder posts (`content/blog/posts.ts`). **A DB post with the same
slug replaces the stub entirely** (same URL, no duplicate, no "Draft stub" note). So the migration path for
the owner's real articles is: publish from the CRM using the existing slug, e.g.
`top-5-renovations-increase-home-value-ny`. With `blog_posts` empty, the blog renders exactly as it does
today.

---

## 3. The revalidate hook

```
POST https://realtylt-website.vercel.app/api/revalidate
Authorization: Bearer <BLOG_REVALIDATE_SECRET>      # or:  x-revalidate-secret: <secret>
Content-Type: application/json

{"slug": "my-new-post"}        # optional — omit to refresh only the index + sitemap
```

**Responses**

| code | meaning |
|---|---|
| `200 {"ok":true,"revalidated":["tag:blog","/blog","/blog/my-new-post","/sitemap.xml"],"now":…}` | done |
| `401 {"ok":false,"error":"Unauthorized."}` | missing or wrong secret |
| `413` | body > 4 KB |
| `400` | malformed JSON |
| `429 {"ok":false,"error":"Too many requests."}` | > 10 calls/min from one IP |
| `503 {"ok":false,"error":"Revalidation is not configured."}` | `BLOG_REVALIDATE_SECRET` unset on the site — the hook is **disabled, never open** |

Notes:
- The secret is compared in **constant time** over SHA-256 digests, so it leaks neither length nor prefix.
- A `slug` that isn't a valid blog slug is **ignored** (the index still refreshes) — the endpoint can never
  be used to revalidate an arbitrary path.
- Always send the request **after** the DB write commits, or the site will re-cache the old state.
- Call it once per publish. It is cheap but rate-limited.

---

## 4. Markdown subset the `body` supports

The website renders the body to **React nodes, never HTML** (`lib/blog/markdown.tsx`) — so raw
`<script>`/`<img onerror>` in a post is displayed as plain text and XSS is impossible by construction. The
trade is a deliberately small syntax; give the CRM editor exactly these controls:

| syntax | renders as |
|---|---|
| `# Heading` / `## Heading` | `<h2>` (the page owns the `<h1>`) |
| `### Heading` | `<h3>` |
| `#### Heading` | small caps `<h4>` |
| blank-line-separated text | `<p>` (consecutive lines join into one paragraph) |
| `- item` / `* item` | bullet list |
| `1. item` | numbered list |
| `> quote` | pull-quote |
| `---` | horizontal rule |
| `**bold**` · `*italic*` · `` `code` `` | inline emphasis |
| `[text](https://…)` | link — opens in a new tab with `rel="noopener noreferrer"` |
| `[text](/connect)` · `[text](mailto:…)` | in-tab link |

Anything else (tables, images, raw HTML, footnotes) renders as literal text. `javascript:`, `data:` and
protocol-relative `//host` links are stripped to plain words.

---

## 5. Website env (set on the Vercel project `realtylt-website`)

| var | value |
|---|---|
| `SUPABASE_URL` | `https://wpfmhmnceflfruhssqqb.supabase.co` |
| `SUPABASE_ANON_KEY` | the project's anon key (public by design; RLS is what protects drafts) |
| `BLOG_REVALIDATE_SECRET` | random 32+ chars; the CRM sends the same value |

If `SUPABASE_URL`/`SUPABASE_ANON_KEY` are missing, or Supabase is down, or a row is unrenderable, the blog
**degrades to the static posts** and logs a warning — it never errors out.

---

## 6. Seeding a post by hand (for a quick end-to-end check)

```sql
insert into public.blog_posts (organization_id, slug, title, excerpt, body, cover_image_url, status)
values (
  '00000000-0000-0000-0000-000000000001',      -- RealtyLT
  'my-test-post',
  'My Test Post',
  'One-line summary shown on the index card.',
  '## Hello' || chr(10) || chr(10) || 'A **markdown** body.',
  '/images/listings/house-12.jpg',
  'published'
);
```
Then `POST /api/revalidate` and load `/blog`.
