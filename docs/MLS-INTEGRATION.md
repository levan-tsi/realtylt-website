# MLS Integration — OneKey MLS via MLS Grid v2 (LIVE)

Wired 2026-07-11 (Round 1). The site now serves REAL OneKey MLS listings with REAL
per-listing photos from the owner's MLS Grid replication feed — the same source the n8n
chatbot uses, plus `$expand=Media` (which the chatbot never fetched).

## Credentials (never committed)

`MLS_API_ENDPOINT` (`https://api.mlsgrid.com/v2`), `MLS_API_KEY` (bearer), `MLS_FEED_ID`
(`onekey2`) — Vercel envs on `realtylt-website`, **Production scope, sensitive** (so
`vercel env pull` writes them as EMPTY — pull cannot decrypt sensitive values; the deployed
app still gets them). For local dev they live only in `.env.local` (gitignored; verified
`git status` clean, no token in any committed file).

## The query (lib/idx/mls-grid.ts — MlsGridClient)

- `GET {endpoint}/Property` with headers `Authorization: Bearer …`, `Accept: application/json`,
  **`Accept-Encoding: gzip` (mandatory — 400 without it)**.
- `$filter=OriginatingSystemName eq 'onekey2' and MlgCanView eq true and StandardStatus eq
  'Active' and PropertyType in ('Residential','Residential Income')` — all four clauses
  verified accepted server-side ( `in`, not `or`). Everything else (county/price/beds/text)
  is filtered CLIENT-SIDE over the cached working set (replication API; only MlgCanView,
  ModificationTimestamp, OriginatingSystemName, StandardStatus, ListingId, PropertyType,
  ListOfficeMlsId are filterable).
- `$select` = the fields in SELECT_FIELDS. **This subscription rejects `UnparsedAddress`,
  `OnMarketDate`, and notably `Latitude`/`Longitude`** ("field does not exist or is unable
  to be retrieved"). `fetchPage` self-heals: any $select field the API 400s on is dropped
  exactly as named and logged (`[mls-grid] feed rejects $select field 'X'`).
- `$expand=Media` → `Media[].MediaURL` ordered by `Media[].Order`, capped at 16/listing.
- `$orderby=ModificationTimestamp desc`, `$top=500`, `$skip` paging; ≤8 pages/sync, stops
  early at 150+ kept listings; 600 ms between pages (2 req/sec cap).

## Rate-limit / compliance posture

- Module-level singleton + 15-min in-memory working-set cache; pages use ISR
  (`revalidate = 3600`). Feed is hit a few times/hour; a sync is 2 requests (~1–5 s).
- Stale-while-revalidate: stale cache is served instantly while a background sync runs;
  only the very first request on a cold instance waits. Sync failure → fixture fallback
  with a console error + 60 s retry cool-down (never crashes pages).
- `generateStaticParams` for /listing/[id] returns [] in live mode (on-demand ISR) — kept.
- Attribution intact on every surface: MlsAttribution block ("Information provided by
  One Key MLS…", data-last-updated from modificationTimestamp), "Listed with {office}"
  on every card + detail.

## Verified against the live feed (2026-07-11)

- Sync log (build + runtime): `2 page(s), scanned 1000, kept 251 … counties
  {westchester:100, orange:52, dutchess:35, rockland:33, ulster:20, putnam:11}
  mediaHosts ["media.mlsgrid.com"]`. **All six site counties have live inventory** —
  feed values are bare names ("Dutchess"); normalizer also strips a " County" suffix.
- Real rows rendering end-to-end (search cards + detail): e.g. KEY1020368 “45 Patricia
  Avenue, Fishkill 12524” $384,900; KEY1022207 “119 Rombout Avenue, Beacon 12508”
  $589,900 (Century 21 Alliance Rlty Group); KEY1024486 “86 Maple Street, Greenburgh
  10522” $899,000 4bd/2ba (remarks reference Dobbs Ferry — consistent with Greenburgh).
  External spot-check: see “Spot-check” below.

## Photos (the fixed bug) — served via /api/media proxy

Real per-listing photos come from `media.mlsgrid.com`, which has TWO hard constraints
(measured empirically 2026-07-11):

1. **MediaURLs are SIGNED + SHORT-LIVED** — `?token=…&expires=…` with **~1 hour** expiry.
2. **A per-ACCOUNT media request budget** — their AWS API Gateway usage plan returns
   429 "Request limit reached". Verified per-account (NOT per-IP): after heavy testing
   exhausted the window, a completely fresh IP (the n8n Hostinger VPS, via a temp
   workflow, since archived) got 429 on its FIRST-ever request; Vercel lambdas and the
   image optimizer got the same. Both hotlinking and next/image against raw URLs are
   therefore unshippable (the optimizer surfaces it as 502
   OPTIMIZED_EXTERNAL_IMAGE_REQUEST_INVALID).

**Architecture:** `Listing.photos` carry stable `/api/media/{listingId}/{idx}` paths.
`app/api/media/[id]/[idx]/route.ts` resolves the CURRENT signed URL from the client's
in-memory feed cache (never user-supplied — no SSRF) and streams the image with
`s-maxage=86400, stale-while-revalidate=604800`, so the Vercel CDN absorbs repeat
traffic and the MLS budget is spent ~once per photo per region per day. Rendered
`unoptimized` (isLiveMlsPhoto in ListingCard) so the optimizer doesn't multiply
upstream fetches per srcset width. Errors return 502 with `no-store` (CDN never caches
a throttled/expired response). CSP untouched: browsers only ever fetch same-origin.

**Long-term (launch)**: replicate media to owned storage (e.g. Vercel Blob) at sync
time — budget spent once per photo EVER; that is MLS Grid's intended replication model.

## Coordinates (feed limitation + workaround)

The subscription serves NO Latitude/Longitude. Map pins fall back to **zip centroids**
(`lib/idx/zip-centroids.json`, 530 zips, US-Census-derived public domain data; generator:
`scripts/build-zip-centroids.mjs`) plus a deterministic ~1 km jitter per listing id.
MapView overlays a "Locations approximate" note. Unknown zip → lat/lng 0 → dropped from
pins/bounds (existing guard). If the subscription ever adds coordinates, they're used
verbatim (`coordsOf`) — just re-add Latitude/Longitude to SELECT_FIELDS.

## Other mapping decisions

- Address = StreetNumber + StreetName + StreetSuffix (no UnparsedAddress on this feed).
- Baths: BathroomsTotalInteger counts halves as whole → shown as full + 0.5×half
  (e.g. 3 total w/ 1 half → 2.5).
- `listedAt` derived from DaysOnMarket (no OnMarketDate) — powers "New Listings" sort.
- Features synthesized: PropertySubType, "Built YYYY", "X acres", "Listed by {agent}".
- `isFeatured` = ListOfficeName matches /united real estate/i (the owner's office) —
  Featured rail shows own inventory first, topped up with freshest actives.
- getListing falls back to a direct `ListingId eq '…'` lookup for ids outside the cached
  window (saved favorites, old links); id sanitized to [A-Za-z0-9_-]{1,40}.

## Known limitations / Round-2 candidates

- **Working set = newest-modified ~150–250 six-county actives** (matches the n8n
  chatbot's 1500-row approach). Older-inventory listings appear via getListing direct
  fetch but not in search results. If fuller inventory is wanted: raise TARGET_KEPT /
  MAX_PAGES, or move to a build-time snapshot + Vercel Data Cache.
- Image-optimizer quota at LAUNCH: signed-URL churn means each photo re-optimizes about
  twice/day; fine now, keep an eye on Vercel image-transformation usage once public.
- Sitemap intentionally excludes live listing URLs (rotating inventory).
- MLS Grid production compliance review (attribution wording/placement) before launch.
