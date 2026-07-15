# Website polish checkpoint (read/updated by the /website command)

Updated 2026-07-15. The `/website` command reads this to know where to resume, and overwrites it when it
stops. Page-by-page: compare each page to LIVE realtylt.com, make ours match-or-beat, test live in Chrome.

═══════════════════════════════════════════════════════════════════════════════════════════════
## ⭐ PRIORITY 1 (do this FIRST, before page polish): rebuild MLS listings the "Brivity way"
═══════════════════════════════════════════════════════════════════════════════════════════════
This is a BIG, well-scoped build the owner explicitly approved. Do it thoroughly (this is the main use of
the ~700k budget), verify each piece live, commit as you go. Then continue the page-by-page polish below.

### Why (the decision, in full)
- The MLS Grid DATA API is REPLICATION-only: `$filter` can only match ListingId / ModificationTimestamp /
  status / type — NOT city/county/price/beds. So you CANNOT live-search it; you must keep a local copy and
  search THAT. Every IDX including Brivity works this way.
- The suspension (owner got API-suspended, 8-11 req/s vs the 2 req/s limit) was caused by calling the DATA
  API on every PAGE VIEW (the photo proxy). That is now FIXED + DEPLOYED (commit d02232a): page views make
  ZERO DATA-API calls; photos come from stored permanent MediaURLs. **Keep it that way** — the guard
  `lib/idx/mls-fetch.ts` (`mlsGridDataFetch` throws on any request-path DATA call) must stay. See `docs/mls-fix/`.
- Current setup is a SIMPLER version than Brivity: listings live in a COMMITTED file `data/mls-snapshot.json`,
  refreshed MANUALLY (run `scripts/export-snapshot.mjs` → commit → deploy). It goes STALE between refreshes
  (can show sold listings) and doesn't auto-remove delisted ones. And it won't scale to all of NYC (a huge
  committed JSON in git + loaded into memory is untenable).

### What to build (the real, always-current, self-healing model — how Brivity does it)
1. **Listings in a DATABASE, not a committed file.** Use the existing Supabase project `wpfmhmnceflfruhssqqb`
   (same one the CRM + leads + accounts use). CHECK what's already there first — a `mls_listings` table may
   already exist (it was in the schema). Reuse/extend it; don't duplicate. Store each listing's fields + its
   PERMANENT MediaURLs + a status + an `updated_at`/watermark + a soft-delete/inactive flag.
2. **Hourly incremental sync (a cron).** Vercel Cron hitting an API route, or a scheduled Supabase Edge
   Function — whichever is simplest and reliable. Each run:
   - Query MLS Grid with `ModificationTimestamp gt <last-watermark>` (ONLY what changed — tiny, a few calls,
     paced < 2 req/s). Upsert changed listings.
   - **Handle removals:** when a listing's status flips (Active → Closed/Pending/Withdrawn/Expired) or its
     `MlgCanView` goes false, mark it inactive / remove it from the served set. (MLS Grid compliance REQUIRES
     you stop showing delisted/non-viewable listings promptly.)
   - Advance the watermark. This is the ONLY thing that calls the DATA API, out-of-band — never a page view.
   - Incremental runs are small, so this will NOT re-trigger the suspension.
3. **The initial BASELINE pull** (the big one) — one paced, sanctioned full replication into the DB. This is
   the only large pull; do it once, carefully, under the rate limit. CRON_SECRET is in `.env.local`
   (`npx vercel env pull .env.local` to refresh); the endpoint uses `MLS_API_KEY` server-side (prod only).
4. **Coverage = the owner's full area, INCLUDING ALL 5 NYC BOROUGHS.** Served counties: Dutchess, Westchester,
   Putnam, Rockland, Ulster (Kingston), Orange, PLUS the 5 boroughs — Bronx, Kings (=Brooklyn),
   New York (=Manhattan), Queens, Richmond (=Staten Island). The feed labels boroughs by LEGAL COUNTY NAME,
   and the current matcher (`normalizeCounty` in `lib/idx/mls-grid.ts`, and `COUNTIES` in `lib/site.ts`)
   assumes single-word Hudson Valley names — so wire the borough mapping carefully (esp. multi-word
   "New York" county → don't let it collide with the state, and give boroughs friendly display names +
   URL-safe slugs) or the boroughs get silently dropped. Owner wants ALL active borough listings.
5. **Switch the site to read from the DB** — search, listings, listing detail, `/api/idx/pins` — all query the
   DB (fast, always current). Keep the committed JSON working as a fallback until the DB path is proven, so the
   site never breaks mid-migration. Keep photos served via the same-origin `/api/media` proxy from stored URLs.

### Verify (this is production-adjacent — prove it)
- Baseline pull populated the DB incl. borough listings (check counts per county). Site pages render listings
  from the DB with photos, ZERO `api.mlsgrid.com` calls on any page view (the guard + a network check).
- The hourly sync runs, upserts changes, and REMOVES a delisted listing (test with a status flip). Watermark
  advances. Incremental run makes only a few paced calls.
- `npm run build` clean, `npm test` green, live-drive search/listing/detail at desktop + 390px, no console errors.
- Do NOT hammer the live MLS API while testing — use the DB + mocks; the baseline pull is the only big call.

═══════════════════════════════════════════════════════════════════════════════════════════════

## PRIORITY 2 (after the MLS rebuild): page-by-page polish vs LIVE realtylt.com
The Next.js rebuild is built + on Vercel (private/noindex), ~71 pages. Design system "Hudson Twilight"
ink/paper + porchlight azure. Anti-AI-slop rules apply ([[design-anti-ai-slop-palette]]).

Pages — status:
- [ ] Home — compare vs live at desktop + 390px
- [ ] Search / Listings — will be much better after the MLS DB rebuild
- [ ] Listing detail
- [ ] Buying
- [ ] Selling
- [ ] Financing (mortgage calc)
- [ ] Home Value
- [ ] Top Areas + county pages (now incl. boroughs)
- [ ] Who We Are
- [x] Blog + article — redesigned this session; revisit only if issues
- [x] Services (20 pages) — built this session
- [ ] Connect

## Notes
- Website repo is PUBLIC on GitHub (owner flipping to private).
- Do NOT deploy to the realtylt.com apex — a push to `main` auto-deploys the private/noindex Vercel site.
- The photo/suspension fix (d02232a) is deployed; a JSON re-export for the CURRENT counties may still be
  pending to restore photos short-term — the DB rebuild supersedes it.

## NEXT: build PRIORITY 1 (the MLS DB rebuild). Then Home, then down the Priority-2 list.
