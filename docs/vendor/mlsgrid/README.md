# MLS Grid — what their OFFICIAL docs actually say (and what they don't)

Mirrored from docs.mlsgrid.com on 2026-08-09 by `scripts/mirror-mlsgrid-docs.mjs` (re-run to
refresh; the git diff shows upstream drift). This folder exists because sessions repeatedly
stated vendor "facts" from memory: a 3-day photo-outage misdiagnosis ("only MLS Grid can fix
it" — it was our own `$select`) and a rate-limit calibration nobody could cite. **The rule
now: a claim about MLS Grid needs a citation to a file in this folder or to a measured
experiment — otherwise it is a hypothesis and must be labelled as one.**

## Verified facts (citation → file:line as of this fetch)

| Fact | Their words | Where |
|---|---|---|
| Media URLs are SINGLE-USE | "the URL may be used to download its image only once. A second request using the same URL will fail." | `api-documentation--api-version-2.0.md:351` |
| Media URLs expire in 1 HOUR from generation | "the URL expires one hour after it is generated" | `api-documentation--api-version-2.0.md:352`, `upcoming-changes-to-media-delivery...md:40` |
| Never re-download the same media | "the media content itself never updates in place — if there are any changes... a new MediaKey and Media URL are issued, and there is never a reason to download the same media more than once" | `api-documentation--api-version-2.0.md` (media section) |
| Don't store URLs for later | "do not store or cache a Media URL for later use — retrieve it from the API and download the image promptly" | same section |
| Media downloads MUST send the OAuth token as User-Agent | "Any User-Agent that is not your Oauth 2 access token will be blocked" | `api-documentation--api-version-2.0.md:342` |
| Lookup resource: at most once per DAY | "do not pull from this resource more frequently than once a day... may result in interruption of service for inefficient usage practices" | `api-documentation--api-version-2.0.md:368` |
| S3 bucket-to-bucket transfer ends Sept 8, 2026 | migration doc | `upcoming-changes-to-media-delivery...md` |
| Replication limits are QUERY limits | single OriginatingSystemName per request; limited filter fields; ≤5000 records/request (1000 with $expand); ≤5 `or` operators | `api-documentation--api-version-2.0.md:60` ("Limitations of Replication API") |

## The RATE LIMITS live in the Best Practices Guide PDF, not the docs site

First written here as "their docs contain no rate limit" — TRUE only of docs.mlsgrid.com.
The **API Version 2 Best Practices Guide** (public, linked from mlsgrid.com/resources,
mirrored here as `MLS-Grid-Best-Practices-Guide-2.pdf`) publishes the complete caps:

1. **No more than 7,200 requests in any given hour**
2. **No more than 4 GB downloaded in any given hour**
3. **No more than 2 requests per second (RPS) at all times**
4. **No more than 40,000 requests in a ROLLING 24-hour period**
5. **No more than 60 GB downloaded in a given 24-hour period**

Plus, verbatim consequences and remedies:
- ">2 requests per second … may result in the MLS Grid placing a rate limit on your access
  or suspending access temporarily."
- Suspensions SELF-HEAL: "permissions for the token will be automatically reinstated once
  sufficient time has passed to decrease the number of requests submitted or the amount of
  data consumed to acceptable levels."
- **Grace Period:** "When conducting your initial import of data please reach out to
  support@mlsgrid.com in advance to request a 'Grace Period' to exceed normal rate limits
  and data caps." ← the legitimate fast path for bulk backfills.
- "DO NOT download the same media more than once." / "DO NOT link directly to the Media
  URLs … store and post to Media locally on your end."

The DLA, IDX Rules, and Developer Checklist PDFs are mirrored alongside.

## Measured history, re-read against the published caps

storage.objects shows 215,269 photos mirrored on 2026-07-18 and 33,839 on 07-17 — i.e. the
July bulk runs ran FIVE TIMES over the published 40k/24h cap, which is the likely cause of
that month's six suspensions (each self-healing per the guide's rolling-window model), not
just the unpaced bursts. 9–17k/day (July 19–27) and 25k (Aug 5) sat within the caps.
Do NOT read the 215k day as capacity; read it as the breach that proved the cap.

## Operational translation for scripts/backfill-photos.mjs

- 2 rps pacer and User-Agent token header: their rules, keep both.
- **Budget every run**: `--max-downloads N`, sized so backfill + the hourly sync's own
  media downloads stay under 40,000 requests per rolling 24h (sync spends ~2-6k/day).
  At 2 rps × ~415 KB avg the hourly caps (7,200 req / 4 GB) hold with ~25% headroom.
- Single request per URL, ever; a failed download is a SKIP (fresh URL next pass).
- Never re-mirror media whose marker/storage state is current — compliance, not thrift.
- 429s: escalating backoff, stop the RUN after `--max-429` strikes, wait out the rolling
  window, probe small, continue. (The old "one 429 = stop for the whole day" rule was OUR
  invention and is retired; their windows are rolling, not calendar days.)
- Avoid launching within the hourly sync's media window (tick at :07, a few minutes of
  media work after) — two of OUR OWN writers otherwise stack against one 2 RPS account cap.
- For a bulk finish, the sanctioned route is the Grace Period email, in advance.
