# CLIENT ACCOUNTS — website consumer portal ↔ CRM contract

Owner spec 2026-07-13: realtylt.com has a **client login/account**. Logged-in clients
**save/favorite listings, save searches**, and their **behavior is tracked** (viewed
listings, opens). All of it flows to the **CRM**, where the owner sees each client's
saved/liked listings, saved searches, viewed properties, and engagement timeline. The
website account is **linked to the CRM contact** (same person — "the login matches the CRM").

This doc is the shared data contract between the **website** (this repo — the client side)
and the **CRM** (`/root/realtylt-crm-fix` — the agent side). Both read/write the same
Supabase project `wpfmhmnceflfruhssqqb`.

## Identity — one auth, two account types

Website clients and CRM staff share **one `auth.users`**, so a client's login is the same
identity the CRM knows. They are told apart by `raw_user_meta_data->>'account_type'`:

- **`account_type = 'portal'`** → a website client. On signup a trigger creates a
  `public.portal_clients` row and links/creates a CRM contact. The client is **NOT** added
  to `public.users` (the CRM staff table) — `handle_new_user()` early-returns for portals.
- **anything else** (CRM staff) → unchanged: `handle_new_user()` inserts a `public.users` row.

> ⚠️ **CRM loop must preserve the `account_type='portal'` guard in `handle_new_user()`.**
> If a CRM migration redefines that function without the guard, every website signup would
> again create a stray CRM "agent". The guard is backward-compatible for all non-portal signups.

## Tables (all owned by the website loop; prefix `portal_`)

| table | purpose | key columns |
|---|---|---|
| `portal_clients` | 1:1 with `auth.users`; the account | `id`=auth uid, `email`, `full_name`, `phone`, **`contact_id`**→`contacts.id`, `created_at` |
| `portal_favorites` | saved/favorited listings | `client_id`, `listing_id` (MLS ListingId), `collection`, unique(client_id,listing_id) |
| `portal_saved_searches` | saved `/search` filter sets | `client_id`, `label`, `query` (URL query string), `alerts` bool |
| `portal_activity` | behavioral timeline | `client_id`, `type`, `listing_id?`, `meta` jsonb, `created_at` |

`portal_activity.type` values written by the website: `view_listing`, `save_listing`,
`unsave_listing`, `save_search`, `remove_search`, `view_search`, `open_photos`.

## RLS

Every `portal_*` table has RLS. A client may only touch rows where `client_id = auth.uid()`
(and `portal_clients` where `id = auth.uid()`). The **CRM reads with the service role**, which
bypasses RLS — that is how the agent side sees a client's activity. The website uses only the
**anon key + the client's JWT**; no service-role key ships to the browser.

## Linkage → CRM (how activity reaches the owner)

`portal_clients.contact_id` is the join key. On signup, `portal_link_contact()`
(BEFORE INSERT, SECURITY DEFINER):

1. Finds an existing non-deleted `contacts` row with the same (case-insensitive) email → links it.
2. Otherwise **creates** a contact in the single org, `source='Website Account'`,
   `stage='lead'`, `status='active'`, `tags={website-account}`, and links that.

So every website client is visible in the CRM as a contact. Because the lead→contact mirror
(`mirror_lead_to_contact`, migration 0014) also dedups by email, a later lead for the same
person attaches to the same contact rather than duplicating.

**CRM side (CRM loop's job):** on a contact's page, join
`portal_clients` (by `contact_id`) → `portal_favorites` / `portal_saved_searches` /
`portal_activity` to render that client's saved listings, saved searches, viewed properties,
and an engagement timeline.

## Website implementation (this repo)

- `lib/supabase/{config,client,server}.ts` — anon-key Supabase clients (browser via
  `@supabase/ssr` cookie storage; server client for the auth callback route).
- `components/auth/AuthProvider.tsx` — session/user context; `signUp` passes
  `data:{ full_name, phone, account_type:'portal' }` + `emailRedirectTo=/auth/callback`.
- `components/auth/SavedProvider.tsx` — account-aware favorites/searches: DB when signed in,
  device `localStorage` (`lib/saved.ts`) when signed out, one-time **migrate device→DB on login**.
- `app/auth/callback/route.ts` — OAuth / magic-link / email-confirm code exchange.
- `app/portal/*` — collections, searches, reports (see below), profile.

Env reused (no new vars): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (already power the blog).
CSP `connect-src` includes `https://*.supabase.co`.

## CMA + market reports — client-facing (owner spec §5b)

A logged-in client can **see, run, recalculate** CMA + market reports, **raise their hand**
(request the agent), and **message** their agent — all in `/portal/reports`. Two report kinds
(`cma`, `market`) come from two producers, unified in one website-owned table.

### Table `public.portal_reports` (website-owned; migration `portal_reports`)

| column | notes |
|---|---|
| `id` uuid pk | |
| `client_id` uuid | → `auth.users`; **RLS `client_id = auth.uid()`** (policy `portal_reports_rw`, ALL) |
| `kind` | `'cma'` \| `'market'` |
| `source` | `'client'` (self-serve) \| `'agent'` (mirrored from the CRM) |
| `status` | `'draft'` \| `'ready'` \| `'shared'` |
| `title` | e.g. `Home value — 12 Maple St, Beacon` |
| `subject` jsonb | CMA → `{address,city,county,propertyType,beds,baths,sqft}`; market → `{county,town}` |
| `criteria` jsonb | CMA client adjustments → `{conditionPct, includedIds[]}`; market → `{}` |
| `stats` jsonb | CMA → `{comps:Comp[], estimate:CmaEstimate, dataLastUpdated}`; market → `MarketStats` |
| `suggested_price_low` / `_high` numeric | CMA estimate band (nullable) |
| `agent_note` text | shown as the agent's message on a mirrored report |
| `cma_report_id` uuid | link back to `public.cma_reports.id` when `source='agent'` |
| `created_at` / `updated_at` | `updated_at` bumped by trigger `set_updated_at` |

Shapes live in `lib/reports/types.ts` (`Comp`, `CmaEstimate`, `MarketStats`).

### Website side (this repo — client self-serve, `source='client'`)

- **Generate** (`components/portal/ReportGenerator`): CMA pulls comparable ACTIVE listings from
  `/api/reports/comps` (computed from the committed snapshot, **no MLS/photo calls**); market pulls
  `/api/reports/market`. Both compute with the pure fns in `lib/reports/{cma,market}.ts` and INSERT a
  `portal_reports` row (RLS-checked, `client_id = auth.uid()`).
- **Recalculate** (`components/portal/ReportDetail`): the client toggles comps + nudges a condition
  slider; `estimateCma()` re-runs live in the browser; **Save** updates `criteria`/`stats`/`suggested_*`.
  Market has a **Refresh** that re-fetches current stats. Estimates are honestly labelled as an
  ASKING-price analysis of active comps (the snapshot has no solds).
- **Raise hand / message** (`components/portal/TalkToAgent`): both POST `/api/lead` (→ CRM lead +
  owner notification, the existing pipeline) prefilled from the client's profile, and write a
  `raise_hand` activity. New `portal_activity.type` values: `generate_report`, `view_report`,
  `recalc_report`, `raise_hand`.

### CRM side (CRM loop's job — agent reports, `source='agent'`)

Portal clients **cannot read `public.cma_reports` directly** — its `cma_reports_public_select` policy
targets the **`anon`** role only, and `cma_reports_all` requires `organization_id = current_org_id()`
which a portal client (no org) never satisfies. So when an agent **publishes / shares** a CMA (or a
market report) to a client, the **CRM must mirror a snapshot row into `portal_reports` via the service
role** (which bypasses RLS):

1. Resolve the client's `client_id` = `portal_clients.id` where `portal_clients.contact_id` = the
   report's `contacts.id` (skip if the contact has no portal account).
2. Insert/upsert `portal_reports` with `source='agent'`, `kind`, `title`, `subject`, `stats`
   (mirror `cma_reports.subject`/`stats` + comps; for market, the computed metrics), `suggested_price_low/high`,
   `agent_note`, `cma_report_id = cma_reports.id`, `status='shared'`.
3. Re-publishing updates the same row (dedup on `cma_report_id`).

The client then sees the agent report alongside their own; their view/recalc/raise-hand activity flows
back through `portal_activity` (read by the CRM via service role, per the linkage section above).

## Owner-gated (to turn the feature ON in production)

The feature is fully built + verified working locally against the real Supabase, but the
DEPLOYED site keeps it **dormant** (graceful "accounts unavailable"; device-local saves still
work) until these owner actions are taken:

1. **Add the anon Supabase config to Vercel Production** (the deploy blocker). The vars exist
   only in local `.env.local`, not in Vercel — so the deployed `/api/auth/config` returns
   `enabled:false` (this also means the blog silently serves static-only on prod). Both are
   non-secret (URL is public, anon key is publishable/RLS-protected):
   ```
   vercel env add SUPABASE_URL production
   vercel env add SUPABASE_ANON_KEY production   # values are in .env.local
   ```
   Then redeploy. (The loop's auto-mode classifier blocks writing production env vars.)
2. **Enable new-user signups** in Supabase Auth → Providers → Email ("Allow new users to sign
   up" is currently OFF → GoTrue returns "Signups not allowed for this instance"). Also set the
   **Site URL / redirect-URL allowlist** to the site origin so magic-link / email-confirm /
   password-reset land back on `/auth/callback`.
   - ⚠️ Because `handle_new_user()` still creates a CRM **staff** row for any signup WITHOUT
     `account_type='portal'`, review that path before opening public signups — the website
     always sends `account_type='portal'`, but a direct GoTrue call without it would mint a
     staff user. (CRM-loop coordination item.)
3. **OAuth providers** (Google/Facebook/Apple) — the modal has a wired "Continue with Google"
   button; it needs the provider enabled + credentials in Supabase Auth.
4. **Leaked-password protection** (HaveIBeenPwned) — advisor WARN; a dashboard toggle.
