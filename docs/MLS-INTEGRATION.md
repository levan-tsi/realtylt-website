# MLS Integration — OneKey MLS via MLS Grid v2 (REPLICATED)

Round 1 (2026-07-11) wired the feed; Round 2 (same day) re-architected it to **scheduled
replication into Vercel Blob** after the Round-1 per-request design failed in production.

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
  1. `MlsGridClient.replicate()` — the six-county Active working set (same proven $filter/
     $select; 2-3 sequential pages, 1.1s gap = strictly < 2 req/sec). **The ONLY place
     api.mlsgrid.com is ever called.**
  2. Incremental photo replication to Blob `mls/photos/{listingId}/{idx}.jpg`: budget-
     bounded (default 150/run, `?photoBudget=N` override, env `MLS_PHOTO_BUDGET`), paced
     250ms, time-boxed 240s, **photo 0 of every listing first** (cards get covered before
     galleries deepen), stops cleanly on the media CDN's per-account 429 and resumes next
     run. Budget spent once per photo EVER (MLS Grid's intended replication model).
  3. Publishes `mls/listings.json` `{syncedAt, listings[]}` — photos are permanent public
     Blob URLs (only cached ones; empty array → branded NoPhoto block in the UI).
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
- `$orderby=ModificationTimestamp desc`, `$top=500`, `$skip` paging; ≤8 pages/sync, stops
  at 150+ kept; working set ≈ newest ~250 six-county actives (n8n parity). Fuller depth =
  raise TARGET_KEPT/MAX_PAGES in lib/idx/mls-grid.ts (photo-budget math scales with it).

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

- 2026-07-11 (Round 2): architecture deployed. First successful sync + photo-budget probe:
  see CHECKPOINT.md "ROUND 2" section for the latest state, including whether the MLS
  data-API hourly block (self-inflicted during Rounds 1-2 testing) had lifted and how much
  photo coverage the budget allowed.
