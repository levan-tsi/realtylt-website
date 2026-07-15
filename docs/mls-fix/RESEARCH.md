# MLS Grid + IDX photo/rate-limit research (suspension fix)

Goal: stop the recurring MLS Grid **suspension notices**. Establish, from the source, (a) MLS
Grid's real rate limits + what trips a suspension, and (b) how MLS Grid *intends* photos to be
served — and how real IDX platforms (Brivity et al.) do it — so the fix is the simplest correct one.

## 1. MLS Grid API v2 — rate limits & suspension (authoritative)

From MLS Grid's docs + best-practices guide:

- **Hard rate limit: 2 requests/second, 7,200/hour, 40,000/24h** on the **DATA API**
  (`api.mlsgrid.com/v2`). The cap is **per ACCOUNT/token**, not per IP or per process.
- Exceeding it returns **HTTP 429**. Sustained/repeat violations → **the access token is
  suspended** and an email goes to the primary contact. While suspended, *every* request 429s.
- The limit is a **trailing-window** measure (not calendar-hour aligned); it clears once the
  account goes quiet, and hammering while blocked re-arms it.
- Exceptions are negotiated via support@mlsgrid.com.

**This is a REPLICATION API, not a live-search proxy.** `$filter` is deliberately limited to a
handful of fields (`OriginatingSystemName`, `ModificationTimestamp`, `StandardStatus`,
`PropertyType`, `ListingId`, `ListOfficeMlsId`, `MlgCanView`). You are expected to:
1. Filter by `OriginatingSystemName` + `ModificationTimestamp`, persist the greatest
   `ModificationTimestamp` seen as your **watermark**.
2. Page through **`@odata.nextLink`** until exhausted.
3. `$expand=Media,Rooms,UnitTypes` inline on `Property`.
4. On error mid-import, **resume** from the watermark (`ModificationTimestamp gt <watermark>`),
   never restart.
5. Keep a **local data store**; serve your site from it. Refresh incrementally.

The unavoidable consequence: **the DATA API must be called ONLY by a scheduled/background
replication job — NEVER from a page or request path.** A request-path call multiplies by
serverless instance count and by crawler volume and blows past 2 req/s → suspension. (This site
already learned this once — see AUDIT.md "Round 2".)

## 2. MLS Grid MEDIA / photos — the rule that reshapes this fix (authoritative, verbatim)

From `docs.mlsgrid.com/api-documentation/api-version-2.0` (Media resource):

> "In order to retrieve the photo associated with the media record, you will need to use the URL
> provided in the **MediaURL** field to download the image. The URL is for the highest resolution
> photo that the MLS provides to us. **The URLs contained in the Media resource are to be used
> ONLY for the purpose of downloading a local copy of the file. DO NOT use these URLs on your
> website or in your application.**"

> "ALL requests to download the expanded media using the Media URL **MUST include the HTTP header
> User-Agent**. The User-Agent value **MUST be the OAuth 2 access token** you are provided by MLS
> Grid... Any User-Agent that is not your OAuth 2 access token will be blocked by our service.
> **The media never updates and retains the original Media URL. If there are ANY changes to the
> media a new Media URL is issued. There is NEVER a reason to download the same media more than
> once.** Starting **June 1, 2026** if the User-Agent value is not your provided OAuth 2 access
> token your access to media will be denied."

Signals that drive incremental media refresh (replication):
- **`PhotosChangeTimestamp`** (on Property) changes when a listing's media set changes.
- **`MediaModificationTimestamp`** (on each Media row) changes when *that image file* changed →
  re-download it. Match rows by **`MediaKey`**; a `MediaKey` that disappears = deleted media.

### What this means (and what it overturns)

1. **MediaURLs are PERMANENT / stable**, not short-lived signed URLs. "The media never updates and
   retains the original Media URL." → It is safe to **capture the MediaURL once at refresh time and
   store the URL** (the repo's prior "signed URLs expire in ~1h, never commit them" belief is a
   **false premise** for the current MLS Grid model, and is the reason photos were being re-resolved
   live on every view — the suspension cause).
2. **You must download a local copy; do NOT hotlink the MediaURL from the browser.** Media
   downloads also require **`User-Agent: <OAuth token>`** (hard-enforced since June 1, 2026), so a
   browser literally cannot load a MediaURL directly — a **server-side proxy that attaches the
   token** is required.
3. **Download each image at most once, ever.** "There is NEVER a reason to download the same media
   more than once." → serve images from an aggressive/immutable cache; only re-fetch when
   `MediaModificationTimestamp`/`MediaKey` changes (i.e., in the scheduled refresh).
4. The **media host budget is separate** from the DATA API's 2 req/s cap, but media should still be
   pulled ~once per image (immutable) — not per page view.

## 3. How real IDX/CRM platforms (Brivity et al.) serve photos efficiently

Consistent pattern across IDX vendors / RESO Web API importers (Brivity, MLSimport, SimplyRETS,
Bright/Stellar guidance):

- **Replicate out-of-band, serve from your own store/cache** — never call the MLS on a page view.
  The MLS feed is pulled by a scheduled job; the website reads a local snapshot/DB + a CDN.
- **Photos: pull the image URL from the RESO feed once, serve it behind a CDN** with long cache
  lifetimes. Repeat viewers hit the CDN edge, not the MLS. Vendors that stay compliant download the
  file (or proxy it once) rather than hotlinking the raw MLS URL to browsers.
- **No thousands of static pages.** Listings are server-rendered / paginated from the local store;
  inventory rotates, so pages are dynamic, not pre-generated per listing (also why sitemaps exclude
  rotating listing URLs).
- **Net effect:** a listing with 40 photos feels instant, hosting/storage stays modest, and the MLS
  source is hit ~once per image and a few times per hour for data — never per view, never per card.

## 4. The correct, simple design for this site (derived from §1–§3)

- **DATA:** keep the committed snapshot model (already correct — replication, not live search).
  Server-render/paginate from it. No 5,000 static pages. **Zero DATA-API calls on any request path.**
- **PHOTOS:** capture the (permanent) MediaURLs into the snapshot at refresh time (URLs, **not**
  image bytes — owner constraint). Serve each photo through the same-origin `/api/media` proxy,
  which (a) reads the URL from the snapshot (zero DATA-API calls), (b) fetches the image server-side
  **with `User-Agent: <token>`**, (c) returns it with a **long stale-while-revalidate CDN cache**
  (fresh a day, stale-served a week while revalidating) so repeat views never re-hit the media host
  and each image is pulled ~once/day/edge — not `immutable`, because the proxy path is stable while a
  listing's photo can be replaced, so SWR self-heals a changed cover. A dead/rotated URL is refreshed
  by the **next scheduled export**, never re-resolved per view.
- **Guard:** a single `mlsGridDataFetch()` wrapper is the only gateway to the DATA API; it throws if
  called outside the scheduled-refresh context, so no future request-path code can re-introduce the
  suspension.

This satisfies all three otherwise-conflicting constraints as closely as possible: owner ("don't
store all the pictures/bytes; don't hit MLS per view; don't make 5,000 pages; simplest correct
way"), MLS Grid ("local copy, don't hotlink, download once, User-Agent=token"), and the 2 req/s cap.

## Sources

- MLS Grid API v2 docs (Overview + Media resource, verbatim quotes above):
  https://docs.mlsgrid.com/api-documentation/api-version-2.0
- MLS Grid docs home: https://docs.mlsgrid.com/
- MLS Grid Best Practices Guide 2.1 (rate limits, replication, "download MediaURL locally; never
  hot-link"): https://www.mlsgrid.com/resources (PDF: MLS-Grid-Best-Practices-Guide-2.pdf)
- Stellar MLS "Transitioning from RETS to Web API" (MLS Grid replication model):
  https://www.stellarmls.com/content/uploads/2019/05/Stellar_MLS-MLS_Grid-TransitioningFromRETStoWebAPI.pdf
- IDX photo/CDN patterns (serve remote MLS/CDN image URLs, cache, don't bloat local storage):
  https://mlsimport.com/host-mlsimport-listings-images-own-server-cdn/ ,
  https://mlsimport.com/mlsimport-image-speed-lazy-loading-cdn/ , https://simplyrets.com/idx-developer-api
