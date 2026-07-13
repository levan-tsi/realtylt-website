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
- `app/portal/*` — collections, searches, reports (CMA placeholder), profile.

Env reused (no new vars): `SUPABASE_URL`, `SUPABASE_ANON_KEY` (already power the blog).
CSP `connect-src` includes `https://*.supabase.co`.

## Owner-gated (auth config the loop can't set)

- **Email confirmations / redirect-URL allowlist** in Supabase Auth (needed for magic-link &
  email-confirm to land back on the site). The UI handles both "instant session" and
  "confirm your email" states.
- **OAuth providers** (Google/Facebook/Apple) — the modal shows a wired "Continue with Google"
  button, but it needs the provider enabled + credentials in Supabase Auth.
- **Leaked-password protection** (HaveIBeenPwned) — advisor WARN; a dashboard toggle.
