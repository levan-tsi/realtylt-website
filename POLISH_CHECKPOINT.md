# Website polish checkpoint (read/updated by the /website command)

Updated 2026-07-15 (PM). The `/website` command reads this to know where to resume, and overwrites it
when it stops. Page-by-page: compare each page to LIVE realtylt.com, make ours match-or-beat, test live.

═══════════════════════════════════════════════════════════════════════════════════════════════
## ✅ PRIORITY 1 DONE 2026-07-15: MLS listings rebuilt the "Brivity way" (DB + hourly sync)
═══════════════════════════════════════════════════════════════════════════════════════════════
Commits a9e9186 → eba698b, deployed + verified live in prod. The site now serves listings from
Supabase (project wpfmhmnceflfruhssqqb) instead of the committed JSON, kept fresh by an hourly
incremental sync. **11,136 active listings** at completion.

### The architecture (all verified end-to-end)
- **Store**: `idx_listings` (listing JSONB + GENERATED filter columns + `is_active`), `idx_sync_state`
  (watermark), `idx_sync_config` (sha256 of CRON_SECRET; NO RLS policies = invisible). Deliberately
  SEPARATE from `mls_listings` — that is the CRM's org-scoped CMA table with a different shape/lifecycle.
- **Writes**: `idx_sync_apply` SECURITY DEFINER RPC gated by CRON_SECRET (hash-checked in-DB).
  **No service-role key exists anywhere in the website stack** — anon key + secret-gated RPC only.
- **Reads**: `DbIdxClient` (lib/idx/db.ts) over PostgREST; RLS serves ACTIVE rows only, so a
  deactivated listing vanishes from every surface instantly (verified with a live removal drill on
  prod). Falls back internally to the committed snapshot on DB error (snapshot + fallback stay ON
  PURPOSE). Slim `searchPins` pages the whole filtered map set in 1000-row chunks.
- **Hourly sync**: Supabase **pg_cron job `idx-hourly-sync` (7 * * * *)** fires
  `/api/cron/idx-sync` (Vercel Hobby = daily crons only, so the DB schedules it; installed via
  `node scripts/schedule-idx-sync.mjs`). The delta is DELIBERATELY UNFILTERED by
  status/MlgCanView — that's how removals are seen: raw-Active served rows upsert, everything else
  modified deactivates. Watermark advances only after writes land. ≤8 feed pages/run, 1.1s gaps.
  First real scheduled run verified: scanned 42, 1 page, 691ms, upserted 13, watermark advanced.
- **Baseline**: `node scripts/baseline-to-db.mjs` (one-time, done — 16,315 rows scanned via the
  deployed export endpoint, paced <2 req/s, 13 calls). Resumable via scripts/.baseline-watermark.local.
  Final watermark REWINDS to script start so the first delta catches mid-baseline flips.
- **ZERO request-path MLS DATA calls** — the `lib/idx/mls-fetch.ts` guard is untouched; only the
  cron route calls MLS Grid. `/api/media` resolves stored PERMANENT MediaURLs DB-first.
- Env: SUPABASE_URL + SUPABASE_ANON_KEY added to Vercel **Production+Preview** (they were dev-only;
  this also fixed prod /blog DB reads). `vercel env pull` gives the DEVELOPMENT env — remember that.

### Counts after re-baseline 2026-07-15 PM (active, ~12.3k total): queens 4,599 · westchester 1,729 ·
orange 1,273 · bronx 1,191 · dutchess 849 · brooklyn 777 · rockland 732 · ulster 513 · manhattan 324 ·
putnam 264 · staten-island 92 — **ALL 11 areas populated.**

### KNOWN ISSUES / follow-ups
1. ~~Brooklyn/Manhattan/SI = 0~~ **RESOLVED (owner corrected the wrong "feed has none" call):** the
   feed sends PARENTHESIZED legal county names — "Kings (Brooklyn)", "New York (Manhattan)",
   "Richmond (Staten Island)". normalizeCounty now strips the parenthetical (990d0c7), fresh
   re-baseline captured all three, verified live on prod (search/detail/photo/pins). A secret-gated
   feed diagnostic exists at `GET /api/cron/mls-probe` (tallies raw CountyOrParish/PropertyType —
   use it before assuming feed contents). Also: the feed sets City="New York" on every NYC row —
   map-time rewrite to the borough postal city (4d87c16) + one-time SQL backfill (Manhattan
   correctly stays "New York"). Feed also carries Sullivan/Columbia/Greene counties + rentals
   (Residential Lease) if the owner ever wants them.
2. **media.mlsgrid.com intermittently 429s** (pre-existing, account-level). Failures serve the
   branded placeholder with no-store and self-heal per view; successes CDN-pin for a day. Verified
   BOTH cases live on prod (KEY1026260/0 → 429→placeholder; KEY000036/0 → real jpeg, status ok).
   Long-term per MLS Grid best practices ("download locally; never hot-link"): mirror photos into
   Supabase Storage during the sync — good candidate for a future round.
3. Reports APIs (`/api/reports/comps`, `/api/reports/market`) still read the committed snapshot —
   unchanged behavior, migrate to the DB in a later pass.
4. Local dev has no MLS_API_KEY → photos always show the placeholder locally (media host requires
   the token as User-Agent). Prod is fine.
5. The Chrome extension died mid-session, so the **visual/mobile (390px) browser pass of /search,
   listing detail + map perf profiling is still owed** — do it FIRST next round (it overlaps with
   the Search page polish below anyway). All render paths verified server-side meanwhile.
6. Committed data/mls-snapshot.json still ships as the fallback (correct for resilience). Once the
   DB path has run quietly for a while, it can be shrunk/refreshed via the old export flow.

═══════════════════════════════════════════════════════════════════════════════════════════════

## PRIORITY 2 (NOW): page-by-page polish vs LIVE realtylt.com
Design system "Hudson Twilight" ink/paper + porchlight azure. Anti-AI-slop rules apply
([[design-anti-ai-slop-palette]]). Compare at desktop AND 390px, drive real functionality, fix, verify
live, commit page-scoped.

Pages — status:
- [ ] **Search / Listings — START HERE**: finish the browser pass Priority 1 owed (desktop + 390px,
      map perf with 4.6k-pin counties, county chips wrap on mobile with 11 chips, photo fill), then
      compare vs live realtylt.com search. Note: the Chrome extension was extremely flaky this
      session (screenshots time out; service worker flaps) — if it persists, ask the owner to check
      the extension. "All Hudson Valley listings" saved-search copy now undersells NYC coverage.
- [ ] Home — hero, rails (getFeatured/getNew now DB-backed), county links, vs live
- [ ] Listing detail — gallery, lead form, attribution, vs live
- [ ] Buying
- [ ] Selling
- [ ] Financing (mortgage calc)
- [ ] Home Value
- [ ] Top Areas + county pages (borough Top-Areas pages = new editorial content, owner input useful)
- [ ] Who We Are
- [x] Blog + article — redesigned earlier session; prod now reads DB (env fix); revisit only if issues
- [x] Services (20 pages) — built earlier session
- [ ] Connect

## Notes
- Website repo is PUBLIC on GitHub (owner flipping to private).
- Do NOT deploy to the realtylt.com apex — pushes to `main` auto-deploy the private/noindex Vercel site.
- ONE dev server per repo. Never `next build` while dev runs. Use 127.0.0.1:3000 (NOT localhost —
  wslrelay squats [::1]:3000 and can swallow IPv6 localhost).
- Supabase schema changes for idx_* go through MCP `apply_migration` (migrations
  `idx_listings_replication_store`, `idx_sync_hourly_schedule_rpc`, `idx_listings_decimal_safe_int_columns`).
- Feed gotcha discovered live: onekey2 sends DECIMAL LivingArea ("2005.06") — int generated columns
  must round through numeric (already fixed).

## NEXT: Priority 2, starting with the Search page browser pass (desktop + 390px + map perf).
