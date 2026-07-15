# AUDIT — every MLS Grid call path, and the one causing the suspension

Rule (from RESEARCH.md): **the MLS Grid DATA API (`api.mlsgrid.com/v2`, 2 req/s per-account cap)
must be called ONLY from the scheduled refresh — NEVER from a page/request path.** The media host
(`media.mlsgrid.com`) may be fetched from a request path only behind an immutable CDN cache (~once
per image). Below is every code path that touches MLS, classified request-time vs refresh-time.

## Data source selection (`lib/idx/index.ts`)

`getIdxClient()`:
1. **Committed snapshot present → `ReplicatedIdxClient`** (production path). Serves listings from
   `data/mls-snapshot.json` (bundled into the deploy). **Never calls MLS.** ✅
2. Snapshot absent + MLS keys present → `MlsGridClient` (local-dev live mode, documented
   NOT-serverless-safe). Request-path DATA calls — but only when there is no snapshot to serve.
3. Neither → fixture.

Production always has a snapshot → path (1). So listing **DATA** is already safe.

## The MLS-calling code paths

| # | Path | File | When | Hits MLS? | Verdict |
|---|------|------|------|-----------|---------|
| 1 | Photo proxy `GET /api/media/[id]/[idx]` → `getListingMedia(id)` → `fetchMedia(id)` | `app/api/media/[id]/[idx]/route.ts`, `lib/idx/media.ts` | **REQUEST time** (every listing card / gallery image, incl. crawlers) | **YES — DATA API** `GET /Property?$filter=ListingId eq '<id>'&$expand=Media` **+** media-host image fetch | ❌ **THE SUSPENSION CAUSE** |
| 2 | `MlsGridClient.replicateDeep()` | `lib/idx/mls-grid.ts` via `app/api/cron/sync-mls` | Refresh (cron/export, secret-gated) | YES — DATA API, paced <2 req/s, `@odata.nextLink` | ✅ correct (refresh only) |
| 3 | `MlsGridClient.search/getListing/...` | `lib/idx/mls-grid.ts` | Request time — but **only** in local-dev live mode (no snapshot) | YES — DATA API | ✅ acceptable (non-production, no snapshot to serve) |
| 4 | `scripts/export-snapshot.mjs` | offline driver | Manual refresh | Calls the cron route only | ✅ |
| 5 | `ReplicatedIdxClient.search/getListing/getFeatured/getNew` | `lib/idx/replicated.ts` | Request time (production) | **NO** — snapshot only | ✅ |
| 6 | `/api/idx/search`, `/api/idx/pins`, `/listing/[id]`, `/api/reports/*` | app routes | Request time | NO — all go through `getIdxClient()` → `ReplicatedIdxClient` | ✅ |

## Root cause (path #1) — evidence

The listing **DATA** path was fixed (committed snapshot, path 5/6). But the **PHOTO** path was
left as a Round-1-style *per-request live fetch*:

1. The snapshot ships with `photos: []` for every listing (all 5,362 — verified).
2. `ReplicatedIdxClient` therefore rewrites each listing's photos to the on-demand proxy path
   `"/api/media/<id>/0"` (`lib/idx/replicated.ts:31-33`). Detail pages resolve the full gallery via
   `getProxiedPhotoPaths` (`app/listing/[id]/page.tsx:46-47`).
3. When a browser (or crawler) loads `"/api/media/<id>/<idx>"`, the route calls
   `getListingMedia(id)` → `fetchMedia(id)`, which issues a **live MLS Grid DATA API call**
   `GET /Property?$filter=ListingId eq '<id>' … &$expand=Media` (`lib/idx/media.ts:91-118`).

So **every distinct listing shown on any page triggers a DATA-API call** on a cold instance:
- home page featured + new rails ≈ 16 cards → up to 16 DATA calls,
- a `/search` result page ≈ 12–24 cards → 12–24 DATA calls,
- **a crawler indexing listings → one DATA call per listing → thousands.**

Mitigations in `lib/idx/media.ts` (20-min in-memory per-listing cache, 90s negative cache, 600 ms
paced queue) and the proxy's 50-min CDN image cache **do not remove the calls** — they only bound
them *within a single warm instance*. On Vercel the instances are **ephemeral and numerous**; each
cold instance has its own empty cache and its own 600 ms pacer, so N instances aggregate to N×
the rate. This is the **identical mechanism** MLS-INTEGRATION.md documents for the "Round 2" data
suspension ("seven+ instances each ran their own sync in the same second… ~6 req/sec against the
per-ACCOUNT 2 req/sec cap"), only now it is the *photo* path doing it. A single deployed QA sweep
was measured at **~125 `/api/media` calls** (AGENT_LEARNINGS.md) — i.e. ~125 request-path DATA
lookups from one crawl.

**Conclusion:** path #1 is the abuse. It calls the 2 req/s-capped DATA API from the request path,
once per distinct listing, unbounded by crawlers and multiplied by serverless instance count →
429 → token suspension.

## What the fix must do

1. **Remove the DATA-API call from the request path entirely.** `/api/media` must serve photo URLs
   from the committed snapshot (zero DATA calls), never re-resolve them live.
2. **Capture the (permanent) MediaURLs into the snapshot at refresh time** (`sync-mls` +
   `export-snapshot.mjs`) so the proxy has URLs to serve. URLs, not bytes (owner constraint).
   Permanent per MLS Grid docs, so committing them is durable.
3. **Proxy fetches the image server-side with `User-Agent: <token>`, long stale-while-revalidate
   CDN cache** → repeat views never re-hit the media host (~once/day/edge); dead URLs refreshed by
   the next export.
4. **Guard:** route all DATA-API fetches through `mlsGridDataFetch()`, which **throws** if called
   outside the scheduled-refresh context — so this class of bug cannot return.
