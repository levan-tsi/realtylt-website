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

## What their public docs DO NOT contain (checked 2026-08-09, keyword sweep over all 39 pages)

- **No requests-per-second limit.** The "2 req/sec" figure in our code comments appears
  NOWHERE in these docs. Its provenance is unwritten (possibly the Data License Agreement or
  a support email). Treat it as OUR conservative pacing choice, not their rule.
- **No hourly or daily request quota.**
- **No 429 policy, no Retry-After contract, no suspension criteria.** The only
  service-interruption language is the "inefficient usage practices" line attached to
  polling Lookup more than daily.
- The word "suspend" does not appear on the API page at all.

## Measured reality (our own storage.objects, so first-party evidence)

Paced downloads this feed has actually sustained without suspension:
**215,269 photos on 2026-07-18** (the bulk backfill day), 33,839 on 07-17, 9k–17k/day
routinely July 19–27, 25,222 on 2026-08-05. The six July suspensions correlate with
UNPACED concurrency bursts (measured double-digit RPS before the pacer existed) and with
retry storms against dead URLs — behaviours their docs do prohibit in spirit
("never a reason to download the same media more than once"), and which our runner has
since been fixed to avoid (single request per URL, skip on failure, marker-aware skips).

## Operational translation for scripts/backfill-photos.mjs

- Keep the 2 rps pacer (proven to deliver 200k+/day; cheap insurance) and the User-Agent
  token header.
- Single request per URL, ever; a failed download is a SKIP (fresh URL next pass).
- Never re-mirror media whose marker/storage state is current (their "never re-download"
  rule — our skip logic is now compliance, not just thrift).
- 429s: back off with escalation and stop the RUN after a few (`--max-429`); the
  "one 429 = stop for the whole day" rule was OUR invention during an unstable week, is
  cited nowhere in their docs, and is retired in favour of: stop the run, wait out the
  window (hours, or the next sync-quiet hour), probe small, continue.
- Avoid launching within the hourly sync's media window (tick at :07, media work for a few
  minutes after) — two of OUR OWN writers otherwise stack on one account.
