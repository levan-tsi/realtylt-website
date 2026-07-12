# MLS Integration — OneKey MLS via MLS Grid v2

> **⚠ CURRENT STATE (Round 6, 2026-07-11): photos are ON-DEMAND (live, shipped);
> listing DATA is still the committed snapshot.**
>
> **Photos — the real-IDX model the owner asked for:** `/api/media/{id}/{idx}`
> (backed by `lib/idx/media.ts`) fetches a listing's Media from MLS Grid ONLY when
> that listing is viewed — one `ListingId eq '<id>' … $expand=Media` data call per
> listing (20-min in-memory cache, 600ms-paced queue < 2 req/s, 90s negative cache),
> then streams each photo same-origin with `s-maxage=3000` (50 min CDN cache, under
> the ~1h signed-URL validity) + `stale-while-revalidate`. Cost ≈ one media fetch per
> unique photo per 50-min window regardless of viewers. Any MLS/media failure or
> budget 429 serves the branded "Photo coming soon" SVG with `no-store` — never a
> broken tile. Photos are NEVER stored: no Vercel Blob, no bulk download, no image
> DB. Cards use photo 0 via the proxy; `/listing/[id]` renders the full gallery
> through it. Verified live: 40/40 real photos on a detail page, `x-vercel-cache`
> MISS→HIT on repeat requests, 0 console/CSP errors (CHECKPOINT.md Round 6).
>
> **Listing DATA (Round 5 stopgap, still current):** listings ship as a **committed
> snapshot** (`data/mls-snapshot.json`, 5,362 six-county Active listings, photos
> stripped) bundled into the deploy; `/api/cron/sync-mls` is a Blob-free paged EXPORT
> endpoint driven by `scripts/export-snapshot.mjs` (**manual refresh**: run + commit +
> deploy); the vercel.json cron schedule was removed; `@vercel/blob` is uninstalled.
> A durable auto-refresh store for the TEXT data (vs a full on-demand search
> re-architecture — hard because MLS Grid's `$filter` cannot express search queries)
> is the remaining owner decision. Everything below documents the Blob-era pipeline
> for history/root-cause reference; the Blob sections no longer describe running code.

Round 1 (2026-07-11) wired the feed; Round 2 (same day) re-architected it to **scheduled
replication into Vercel Blob** after the Round-1 per-request design failed in production.
Round 4 (same day) deepened replication to the **FULL six-county Active inventory**
(5,360 listings from a 19,324-row feed window) via rolling watermark passes — see
"Rolling full-inventory passes" below.

## ROUND 2 ROOT CAUSE — why the live site served fixture data

Verified from Vercel runtime logs (`npx vercel logs --json`, deployment dpl_4uL41ue4…):

```
[mls-grid] sync failed — serving fixture sample data until retry: Error: MLS Grid 429:
{"error":{"code":429,"message":"Too many requests","details":[{"code":429,"message":
"Your hourly 6.0 requests per second exceeded the 2 requests per second limit.",
"target":"https://app.mlsgrid.com/subs/view/usage/68e4298931b88b0fe8bc15f2"}]}}
```

Mechanism (all confirmed in the logs, 05:58:00 UTC burst):
1. A page load fanned out ~10 concurrent requests (/api/idx/search, /listing/*, /api/media/*).
2. Each hit a COLD serverless instance; each instance has its own module-level cache, so
   **seven+ instances each ran their own 2-request MLS sync in the same second** (the
   identical "sync: 2 page(s), scanned 1000, kept 249" line appears per-instance).
3. ~6 req/sec against MLS Grid's **per-ACCOUNT 2 req/sec cap** → the account gets blocked
   (~rest of the hour; further attempts while blocked appear to re-arm it).
4. Every later sync attempt 429'd → `ensureSynced` fixture fallback → the live site served
   the fixture set (24 Verplanck Ave / house-01.jpg) with `fixtureMode:false`.

Conclusion: **per-request replication is architecturally wrong on serverless** — the
"module singleton + 15-min cache" assumption multiplies by instance count. (A second herd
was then reproduced during Round-2 development itself: with no snapshot present, the new
client's stale-self-trigger fired from parallel `next build` prerender workers → concurrent
cron invocations → concurrent MLS syncs → fresh 429s. Both herd paths are now guarded —
see "Concurrency guards" below.)

## Architecture (Round 2) — scheduled replication into Vercel Blob

Store: Vercel Blob **realtylt-mls** (store_ODYPytsRSdNGVvlO, public, iad1), linked to the
`realtylt-website` project (`BLOB_READ_WRITE_TOKEN` in all envs).

- **`app/api/cron/sync-mls`** (maxDuration 300, `CRON_SECRET`-gated — Vercel Cron sends
  `Authorization: Bearer $CRON_SECRET` automatically):
  1. `MlsGridClient.replicateDeep()` advances a **rolling full-inventory pass** (details
     below): ≤25 sequential pages/run, 1.1s gap = strictly < 2 req/sec, time-boxed 130s.
     **The ONLY place api.mlsgrid.com is ever called.**
  2. Incremental photo replication to Blob `mls/photos/{listingId}/{idx}.jpg`: budget-
     bounded (default **1000/run** since Round 5, clamp 2000; `?photoBudget=N` override,
     env `MLS_PHOTO_BUDGET`), downloaded by **3 paced workers** (150ms per-worker gap ≈
     4-5 req/s aggregate — the media CDN's limit is a per-window request BUDGET, not the
     data API's 2 req/s), time-boxed 240s, **photo 0 of every listing first** (cards get
     covered before galleries deepen), first 429 stops ALL workers cleanly and resumes
     next run. Budget spent once per photo EVER (MLS Grid's intended replication model).
     **Visible-first ordering (Round 5)**: a 2-page `replicateNewest()` head refetch
     ($orderby=ModificationTimestamp desc — gapped 1.1s incl. BEFORE its first request so
     the seam with the pass slice stays < 2 req/s) puts the listings users actually see
     first at the FRONT of the plan (Featured/own-office rows, then newest-listed —
     the home rails + /search default-sort page 1), then this run's freshly-scanned
     slice newest-first (only fresh rows carry live ~1h-signed URLs; rows re-enter the
     plan each time a pass re-scans them; `mergeListings` dedupes by id). The published
     photo set per listing is re-derived every run from the Blob cache ground truth
     (`photosByListing`), so accumulated listings keep their cached photos.
  3. Publishes `mls/listings.json` `{syncedAt, listings[]}` — photos are permanent public
     Blob URLs (only cached ones; empty array → branded NoPhoto block in the UI) — and
     `mls/pass-state.json` (the pass cursor).

### Rolling full-inventory passes (Round 4)

MLS Grid's documented replication model, encoded in `replicateDeep`:
- Responses are ordered by **ModificationTimestamp ascending by default** (no `$orderby`
  sent); pages follow **`@odata.nextLink`** within a run; an interrupted import resumes
  with **`ModificationTimestamp gt <watermark>`** — all three straight from
  docs.mlsgrid.com. So a *pass* walks the ENTIRE `Active` window oldest-modified →
  newest across however many cron runs it takes (~19.3k rows ≈ 39 pages ≈ 2 runs),
  persisting `{watermark, scanned, listings}` in `mls/pass-state.json` between runs.
- Mid-pass, newly scanned six-county rows **merge into the live snapshot immediately**
  (coverage only grows). When a pass **completes** (page without nextLink), its kept-set
  IS the complete six-county Active inventory: it **replaces the snapshot wholesale** —
  which is also how listings that went Pending/Closed/off-market get dropped — and the
  next run starts a new pass from the epoch. Staleness window for status changes ≈ one
  pass (~2 runs; intraday with traffic thanks to the >4h self-refresh, worst case ~2 days
  on the daily cron alone).
- **`CountyOrParish` is NOT server-filterable** (verified against docs.mlsgrid.com:
  "There are only a few fields you can query the service with… timestamp and status
  fields" — the queryable set is OriginatingSystemName, MlgCanView, ModificationTimestamp,
  StandardStatus, PropertyType, ListingId, ListOfficeMlsId). County narrowing stays local
  over the replicated rows. `$count=true` is not documented either — the pass itself
  measures the feed (19,324 Active rows on 2026-07-11).
- Snapshot sanity cap: 8,000 listings (newest-modified kept) — actual six-county Active
  inventory is ~5.4k.
- **Schedule**: vercel.json cron daily 06:00 UTC (Hobby-safe) **+** stale self-refresh:
  any request seeing a snapshot >4h old fires ONE background secret-gated call to the cron
  route (waitUntil, 10-min per-instance cool-down) — intraday freshness on any plan.
- **`ReplicatedIdxClient`** (lib/idx/replicated.ts) — what the site reads: fetches
  listings.json (minute cache-buster; 60s per-instance TTL; ~1 small fetch per instance),
  then delegates search/filter/sort/paging to FixtureIdxClient over the snapshot.
  `dataLastUpdated` = snapshot `syncedAt` (the replication timestamp). `getListing` is
  snapshot-only — ids outside the working set 404 (no per-request MLS fallback, by design;
  /saved already handles rotated-out favorites). Factory order (lib/idx/index.ts):
  BLOB token → replicated; MLS keys only → direct MlsGridClient (local dev; NOT
  serverless-safe); neither → fixture.
- **`/api/media/{id}/{idx}`** kept for stale HTML: 302 → Blob photo when cached, else a
  branded "Photo coming soon" SVG (200, short cache). Never 502s, never calls MLS.
- **CSP img-src + next/image remotePatterns** allow `*.public.blob.vercel-storage.com`;
  blob photos render `unoptimized` (isLiveMlsPhoto) so the optimizer doesn't multiply cost.

### Concurrency guards (the 429 lessons, encoded)

1. Cron route Guard 1: skip if the snapshot is <5 min old (unless `?force=1`).
2. Cron route Guard 2: a **cluster-wide attempt claim** (`mls/sync-state.json` in Blob,
   its uploadedAt = last attempt) — at most one MLS attempt per 10 min across ALL
   instances, success or failure; claim written BEFORE replicating.
3. Self-trigger fires only when a snapshot EXISTS (no cold-bootstrap stampede) and never
   during `next build` (NEXT_PHASE check). Bootstrap = the daily cron or one manual call.
4. `?force=1` is for one-off operator calls only — never script it in a loop.

Manual trigger (probing — keep photoBudget tiny):
`fetch('https://realtylt-website.vercel.app/api/cron/sync-mls?photoBudget=2&force=1',
{headers:{authorization:'Bearer <CRON_SECRET>'}})` — CRON_SECRET is in Vercel env + local
.env.local.

## Credentials (never committed)

`MLS_API_ENDPOINT` (`https://api.mlsgrid.com/v2`), `MLS_API_KEY` (bearer), `MLS_FEED_ID`
(`onekey2`) — Vercel envs, **Production scope, sensitive** (pull returns them EMPTY).
Plus `BLOB_READ_WRITE_TOKEN` (all envs, auto-added by `vercel blob create-store`) and
`CRON_SECRET` (all envs). ⚠️ **`vercel blob create-store` / `vercel env pull` OVERWRITE
.env.local** — Round 2 lost the hand-placed local MLS keys this way (production copies
are intact; Levan must re-paste them into .env.local for local live-mode dev).

## The feed query (lib/idx/mls-grid.ts — unchanged facts from Round 1)

- `GET {endpoint}/Property`, headers `Authorization: Bearer …`, `Accept: application/json`,
  **`Accept-Encoding: gzip` (mandatory — 400 without it)**.
- `$filter=OriginatingSystemName eq 'onekey2' and MlgCanView eq true and StandardStatus eq
  'Active' and PropertyType in ('Residential','Residential Income')`; everything else
  (county/price/beds/text) is filtered locally over the replicated set (only MlgCanView,
  ModificationTimestamp, OriginatingSystemName, StandardStatus, ListingId, PropertyType,
  ListOfficeMlsId are filterable).
- **This subscription rejects `UnparsedAddress`, `OnMarketDate`, `Latitude`/`Longitude`**;
  `fetchPage` self-heals by dropping any $select field the API 400s on (logged).
- `$expand=Media` → MediaURL ordered by Media[].Order, ≤16/listing; URLs are SIGNED with
  ~1h expiry AND `media.mlsgrid.com` has a hard per-ACCOUNT request budget (verified from
  three unrelated networks in Round 1) — hence replication to Blob, never hotlinking.
- Cron path (`replicateDeep`): NO `$orderby` (default = ModificationTimestamp asc, the
  documented replication order), `$top=500`, `@odata.nextLink` paging, `ModificationTimestamp
  gt <watermark>` cross-run resume, ≤25 pages/run. The legacy direct-live dev path
  (`sync()`, used only when MLS keys are set without a Blob store) still scans
  `$orderby=ModificationTimestamp desc` + `$skip`, ≤8 pages, stops at 150+ kept.
- A standalone `/v2/Media` resource also exists (per-MLS availability) — not used; it
  draws on the same per-account media budget as `$expand=Media`, so nothing is gained.

## Compliance

- MlgCanView filter server-side; non-Residential types dropped in mapProperty.
- MlsAttribution ("Information provided by One Key MLS…", © year) near ALL IDX content;
  "Listed with {ListOfficeName}" on every card + detail.
- "Data last updated" = replication `syncedAt` on search/county surfaces (listing detail
  shows the listing's own ModificationTimestamp).
- Coordinates: feed has none → zip-centroid fallback (lib/idx/zip-centroids.json) + ~1km
  deterministic jitter + "Locations approximate" note on the map. If the subscription adds
  Latitude/Longitude they're used verbatim.
- Sitemap excludes listing URLs (rotating inventory). Production compliance review of
  attribution wording/placement still recommended before public launch.

## External spot-check (Round 1, feed vs Zillow/Redfin/Homes.com — still valid)

1. **KEY1020368 — 45 Patricia Ave, Fishkill 12524**: $384,900 · 3/1 · 1,025 sqft ·
   K. Fortuna Realty · 1960 · 0.42 ac — identical on Homes.com/RE-MAX/Redfin. MATCH.
2. **KEY1024486 — 86 Maple Street, Greenburgh 10522**: $899,000 · 4/2 · 1,679 sqft ·
   1880 — matches Trulia/Compass/Redfin for 86 Maple St **Dobbs Ferry** (RESO `City` is
   the TOWNSHIP; expect township names on cards).
3. **KEY1022207 — 119 Rombout Ave, Beacon 12508**: $589,900 · 3/1.5 (Century 21
   Alliance) — fresh listing, consistent with public records.

## Status log

- **2026-07-11 07:27 UTC (Round 2)**: architecture deployed AND first successful
  replication. `/api/cron/sync-mls` published `mls/listings.json` = **251 real listings,
  all six counties** (orange 53, westchester 100, dutchess 33, rockland 33, ulster 19,
  putnam 13). Live site verified: `/api/idx/search` returns real addresses/offices,
  `fixtureMode:false`, warm latency 69-125ms; `/search` renders 12 real cards + hybrid map
  with real geo-spread price pins; a listing detail SSR page renders address + "Listed
  with" + One Key MLS attribution; 0 console errors, 0 CSP violations
  (scripts/verify-live-mls.mjs ALL PASS; screenshot docs/round2/live-search-real.png).
- **The DATA API block lifted** (it had been self-inflicted by Rounds 1-2 testing volume —
  a trailing-window average, not calendar-hour aligned; it cleared once the account went
  quiet). **The MEDIA CDN budget is STILL exhausted**: a photoBudget=16 run returned
  `budgetExhausted:true` on the very first photo (429). So **photos = 0 cached**; every
  card/detail shows the branded "Photo coming soon" placeholder SVG (200, never a broken
  tile or 502). This is expected and self-healing: the daily 06:00 UTC cron + >4h stale
  self-refresh retry photo-0-first every run and will fill coverage once the media budget
  window clears (likely a longer/daily window than the data API's). To accelerate once
  clear: a few manual `?force=1` calls ≥1h apart, watching `budgetExhausted`.
- Handoff rule reaffirmed: do NOT loop force calls; each cron run also spends up to 25
  DATA requests (the pass slice runs first), and hammering re-armed the account block
  twice already.
- **2026-07-11 ~11:00 UTC (Round 4)**: rolling-pass replication deployed. First pass
  completed in exactly 2 cron runs (25 + 14 pages, 1.1s-gapped, zero 429s): **feed window
  = 19,324 Active Residential/Residential-Income onekey2 rows; complete six-county
  inventory = 5,360 listings** (westchester 1,746 / orange 1,276 / dutchess 840 /
  rockland 730 / ulster 502 / putnam 266) — up from the previous 251-listing working set.
  **The media CDN budget CLEARED**: 128 photos replicated across the two runs
  (46 + 82, `budgetExhausted:false` throughout) and a real Blob photo verified rendering
  on a live listing page (docs/fixes/live-listing-photo.png). Photo-0 coverage of all
  ~5.4k listings fills over subsequent runs at ≤150/run — self-healing, no action needed.
  Live site at 5,360 listings: /api/idx/search 287ms warm, /api/idx/pins 316ms
  (~1MB raw / CDN-cached 300s), 0 console errors, 0 CSP violations.
