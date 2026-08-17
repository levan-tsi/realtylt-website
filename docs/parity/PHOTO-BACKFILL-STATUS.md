# Photo backfill — status 2026-08-07

**BOTTOM LINE: the backfill is BLOCKED UPSTREAM and no photos were mirrored. This is not a pacing,
auth, quota or rate-limit problem — MLS Grid is currently serving photo URLs that point at objects
that do not exist.** Running any further sweep today would generate thousands of media requests for
zero photos and would actively degrade existing mirror markers. Work was stopped deliberately.

Zero 429s were seen by the backfill itself. See "The one 429" below for full disclosure.

---

## The defect

Every `Media[].MediaURL` the feed returns has the literal string `undefined` where the
originating-system key segment belongs:

```
https://media.mlsgrid.com/token=<sig>&expires=1786140320&id=68e4298931b88b0fe8bc15f2/images/undefined/13f71a06-0efa-4722-99dc-ef902a9d410c.jpeg
                                                                                    ^^^^^^^^^
```

Compare the documented shape in `docs/mls-fix/PHOTO-MIRRORING.md`:
`…/images/<KEY>/<uuid>.jpeg`.

Fetched with the correct auth (`User-Agent: <OAuth token>`) while the signature was **still valid for
60 minutes**, that URL returns:

```
HTTP 404  content-type=application/xml
<?xml version="1.0" encoding="UTF-8"?><Error><Code>NoSuchKey</Code>
<Message>The specified key does not exist.</Message></Error>
```

`NoSuchKey` is the object store saying the path is wrong. It is **not** an expiry (docs: expired → 400),
**not** a stripped signature (→ 403), and **not** a throttle (→ 429 `Request limit reached`).

### It is not our bug

`lib/idx/mls-grid.ts:642-646` maps photos **verbatim** out of the feed:

```js
const photos = (p.Media ?? [])
  .filter((m) => !!m.MediaURL && (!m.MediaCategory || m.MediaCategory === "Photo"))
  .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
  .slice(0, MAX_PHOTOS)
  .map((m) => m.MediaURL as string);
```

We do not build, sign, or rewrite that path. The `undefined` arrives already inside MLS Grid's own
signed URL, which means it was substituted into the path **before** they signed it.

### Blast radius — 100% of the live feed, and worsening

One fresh feed page (303 listings carrying photos, 6,709 photo URLs):

| measure | value |
|---|---|
| photo URLs containing `/images/undefined/` | **6,709 / 6,709 (100.0%)** |
| listings where every URL is bad | **303 / 303** |
| listings with even one good URL | **0** |

Stored URLs in `idx_listings` show it arriving recently and spreading (a row's stored URLs are
replaced on every re-sync, so this tracks *when a row was last touched*):

| rows first seen | urls sampled | `undefined` | share |
|---|---|---|---|
| last 2 days | 1,337 | 1,337 | **100.0%** |
| 2-7 days ago | 1,733 | 402 | 23.2% |
| 7-30 days ago | 1,843 | 171 | 9.3% |

This also explains why the previous backfill run stopped on 2026-08-05 and never resumed.

---

## Impact on the live site

**The site is not broken — it is frozen.** Already-mirrored photos live permanently in Supabase
Storage and are unaffected by the upstream defect. Verified against production (`/api/media`, our own
route + public bucket, zero MLS contact):

| listing | servable | `/api/media/<id>/0` |
|---|---|---|
| KEY1033981 | 14 | HTTP 200 · image/jpeg · 136,148 B · magic `ffd8ff` — REAL JPEG |
| KEY1032893 | 28 | HTTP 200 · image/jpeg · 528,283 B · magic `ffd8ff` — REAL JPEG |
| KEY1003912 | 18 | HTTP 200 · image/jpeg · 170,772 B · magic `ffd8ff` — REAL JPEG |
| KEY1025047 | 0 (new 08-06) | HTTP 503 · text/plain · 17 B — placeholder |
| KEY841910 | 0 (new 08-06) | HTTP 503 · text/plain · 17 B — placeholder |

**The consequence is that the zero-photo cohort can now only grow.** ~150-250 new listings arrive per
day and not one of them can obtain a photo while the feed serves `undefined` keys. The hourly sync
cannot fix it either — it downloads from the same URLs.

---

## Measurements

### BEFORE (`node scripts/inventory-health.mjs`, 2026-08-07)

```
live rows              : 27764
photos_servable = 0    : 1238   (these show the coming-soon logo)
photos_servable >= 1   : 26526
photos_servable >= 5   : 14589
photos_servable >= 20  : 8530

zero-photo rows BY AGE
  first seen in last 24h : 252
  first seen in last 7d  : 852
  OLDER THAN 7d          : 386   <-- THE REAL BACKLOG

freshness
  modified in last 24h    : 1651     (feed itself is LIVE — data sync is healthy)
  modified in last 7d     : 6977
  first seen in last 7d   : 2547
```

### AFTER

**Not re-run — nothing changed it.** Zero photos were mirrored, so the AFTER numbers are the BEFORE
numbers. Re-running the gate would only have re-measured the same state and invited a false "we made
progress" reading. The data feed is healthy (1,651 rows modified in 24h); only the *media* leg is down.

### The probe that caught it

```
node scripts/backfill-photos.mjs --max-pages 2 --max-listings 12 --max-429 1

slice: kept 270, took 12, mirrored 0 photos (skipped 0 already-mirrored, fetched 274, downloaded 0)
  download failures by status: 404:274
DONE (live) — 12 listings, 0 photos mirrored, 1 feed pages.
```

274 fetched, 0 downloaded, **404 on every single one, zero 429s**. The standing 12-listing probe rule
did exactly its job: it cost 274 requests instead of the ~290,000 a full pass would have spent to
mirror nothing.

---

## Session ledger

| item | value |
|---|---|
| Listings mirrored | **0** |
| Photos mirrored | **0** |
| 429s seen by the backfill | **0** |
| Media requests spent | 274 (probe) + 2 (diagnostic) |
| Feed pages pulled | 3, all via the deployed `/api/cron/sync-mls` (never the DATA API directly) |
| Covers-only sweep | **NOT RUN** — impossible, see above |
| Gallery pass (`--cap 8`) | **NOT RUN** — impossible, see above |

### Watermark state

**`scripts/.photo-backfill-watermark.local` = `2026-08-05T09:01:39.121Z` — restored to its pre-session
value.**

The 12-listing probe advanced it to `2026-08-05T15:36:36.493Z` and stamped `photosMirrored: 0` on those
12 rows. Since **zero** photos were actually mirrored, leaving the cursor advanced would have caused a
successor to silently skip those listings once upstream is repaired. It was reset by hand to the exact
prior value. `scripts/.photo-backfill-watermark.dry.local` was not touched.

### The one 429 — full disclosure

The backfill run itself saw **zero** 429s (the histogram reads `404:274`). One 429 was returned to a
**deliberately unauthenticated control request** in my diagnostic — sent with no `User-Agent` token
precisely to prove that the 404 was not a throttle. It returned the documented rate-limit body
(`HTTP 429 · text/plain · 21 B · "Request limit reached"`), while the authenticated request one second
earlier returned a clean `NoSuchKey` 404. That contrast is what proved the URL, not our pacing, is at
fault. No further media traffic was sent afterwards.

Regardless of how that single 429 is classified, **all backfill work is stopped for the day** — under
the standing rule, and independently because the pass cannot mirror anything anyway.

---

## Watermark sharing — the question the owner asked

**Covers-only and the gallery pass SHARE one watermark file.** From `scripts/backfill-photos.mjs:40`:

```js
const RESUME_FILE = DRY ? "scripts/.photo-backfill-watermark.dry.local" : "scripts/.photo-backfill-watermark.local";
```

The filename keys off `--dry-run` **only**. `--covers-only` and `--cap N` get no separate cursor.
Three consequences a successor must know:

1. **A covers sweep that runs to FEED COMPLETE deletes the file** (`rmSync(RESUME_FILE)` on
   `slice.complete`), so the gallery pass that follows starts from epoch on its own. **No `--fresh`
   needed** in that case.
2. **A covers sweep that is INTERRUPTED leaves the cursor mid-feed.** Starting the gallery pass then
   would resume from that point and **silently skip every listing before it**. In that case the gallery
   pass MUST be started with `--fresh` (or the watermark reset to `1970-01-01T00:00:00Z`).
3. **Per-listing top-up is safe and incremental — nothing is ever re-downloaded.** `mirrorSlice`
   computes `start = min(prior.photosMirrored, end)` when the stored `photosMirroredTs` still matches
   the live `modificationTimestamp`. A covers-only row (`photosMirrored: 1`) re-entered under `--cap 8`
   resumes at index 1 and tops up to 8. A later top-up to 12 or 50 behaves the same way.

**Owner's chosen gallery depth for this pass is `--cap 8`** (revised down from 12 during the session).
A later pass can top up to 12 or full at no repeat cost, per point 3.

---

## What a successor must do

### Do NOT start by running the backfill. It will mirror zero photos.

**Step 1 — re-check whether upstream is fixed (costs one feed page, zero media requests):**

```bash
export NODE_OPTIONS='--use-system-ca'
node scripts/backfill-photos.mjs --dry-run --max-pages 1 --max-listings 5
```

That plans without downloading. Then confirm the URL shape directly — the pass is only viable when
`/images/undefined/` is **gone** from the feed's photo URLs. (The two throwaway diagnostics used this
session, `scripts/_scratch-media-404-diag.mjs` and `scripts/_scratch-media-serve-check.mjs`, are
gitignored `_scratch-*` files and exist on this machine only; the first one prints the exact
undefined-share percentages reproduced above.)

**Step 2 — only if the URLs are clean, re-run the standing 12-listing probe:**

```bash
node scripts/backfill-photos.mjs --max-pages 2 --max-listings 12 --max-429 1
```

Require: zero 429s, `downloaded` ≈ `fetched`, and a non-zero `mirrored` count. If the histogram shows
`404:` again, upstream is still broken — stop and report, do not sweep.

**Step 3 — covers-only sweep first (repeated foreground chunks; the watermark resumes each time):**

```bash
node scripts/backfill-photos.mjs --covers-only --max-pages 999 --max-listings 999999 --max-429 1
```

Photo #0 is what flips a listing from zero-photo to servable, so this clears the whole invisible cohort
at ~1/8th the volume of the gallery pass. Re-run `node scripts/inventory-health.mjs` when it reports
FEED COMPLETE and record the milestone here.

**Step 4 — gallery pass at the owner's chosen depth of 8:**

```bash
node scripts/backfill-photos.mjs --cap 8 --max-pages 999 --max-listings 999999 --max-429 1
```

Mind the `--fresh` rule in point 2 above if the covers sweep did not reach FEED COMPLETE.

### Standing rules for every one of those commands

- Prefix every shell with `export NODE_OPTIONS='--use-system-ca'` (AVG MITM on this machine).
- Always `--max-429 1`. **One 429 stops all backfill work for the day** — no retry, no rps change, no
  restart. The account has been suspended six times before and a suspension freezes the whole inventory.
- Never raise `--rps` above 2; never raise `--concurrency` above its default of 4.
- Never call the MLS Grid DATA API directly — only this script, which routes feed pulls through the
  deployed `/api/cron/sync-mls`.
- One runner at a time.

---

## Escalation — this needs the owner, not another backfill agent

The blocker is on MLS Grid's side and no amount of retrying will clear it. Recommended action:

1. **Open a support ticket with MLS Grid** quoting a full malformed URL, the `NoSuchKey` XML body, and
   the fact that the signature was valid for another 60 minutes when it 404'd. The `undefined` in
   `/images/undefined/` is being substituted into the path before they sign it — that is a bug in
   their media-URL generator, most likely a missing key field on the media record.
2. **Check `app.mlsgrid.com` → Media Access first.** Per `infra-mlsgrid-account-facts` (2026-08-03) the
   **Media Access method radio is BLANK** — none of the three options selected. We rely on
   "Pulling photo URL". It is worth confirming that setting still reads the same before filing, since a
   blank/changed media-access mode is a plausible cause of an unpopulated key segment in the URL, and
   it may be self-service to fix. **Look at the account before composing the question about it.**
3. Nothing in this repo needs changing. `lib/idx/mls-grid.ts` passes the URLs through untouched and is
   correct as written.

Until then the site continues to serve its ~26,500 already-mirrored listings normally, and the
zero-photo cohort grows by roughly 150-250 rows per day.

---

*Note: a parallel read-only auditor agent was reconciling Supabase Storage against `photos_servable`
during this session. It touches no MLS traffic and no watermark; its findings are independent of this
document.*

## Round 24c addendum — root cause CONFIRMED upstream, no self-heal possible (2026-08-07, main session)

Verified first-hand after the owner challenged the diagnosis (rightly — the Media Access
lead below was wrong):

- **Our sync is innocent**: `lib/idx/mls-grid.ts` maps `Media[].MediaURL` verbatim
  (filter/sort/slice/map, no string building) and requests a plain `$expand=Media` with no
  inner `$select`. The `undefined` arrives inside MLS Grid's payload.
- **The missing segment is `KEY<ResourceRecordKey>`**: healthy URLs (Aug 5 and earlier)
  read `/images/KEY426086573/<file>.jpeg`; current ones `/images/undefined/<file>.jpeg`.
- **Their media schema migrated ~Aug 5**: media records now carry hex MediaKeys
  (`6a5eda85…`) alongside numeric ResourceRecordKey; their URL builder evidently reads a
  field that no longer exists and substitutes `undefined`.
- **Signatures bind the path**: rewriting the segment (tested once via the probe's
  mediaTest with a fresh token) flips 404 NoSuchKey → 403. No downstream repair can work.
- **Media Access setting is NOT the cause** — it is set to "Pulling photo URL" (owner
  verified on screen). An earlier claim that it was unset came from a slow-painting SPA
  panel plus an old memory note, not from reading the radio state. Do not chase it again.
- The probe gained `?ids=…&media=1` (raw media records, ≤3/row) for exactly this class of
  question — one paced request, no bulk.

**The only fix is MLS Grid's.** Ticket drafted and handed to the owner 2026-08-07. When
they fix it: `--dry-run --max-pages 1 --max-listings 5` must show `/images/KEY…/` paths
again, then the 12-listing probe, then covers-only, then `--cap 8`, per the plan above.

Separately recovered today with zero MLS traffic: 240 listings / 959 already-mirrored
photos that were miscounted as unservable (photos_servable + photosMirrored reconciled
against storage.objects; spot-verified serving deep gallery indexes on production).

## Docs verbatim read (2026-08-08, owner asked): one new operational rule

docs.mlsgrid.com "Media Files", read raw: URLs are **single-use** ("the URL may be used to
download its image only once. A second request using the same URL will fail"), on top of
signed + 1h expiry, and "any modification… will invalidate it" (their words for our 403
test). Their migration paragraph directs CDN/transition issues to support@mlsgrid.com —
the ticket's address is confirmed right.

**For the restart:** backfill-photos.mjs retries a failed download with the SAME URL
(the Cloudflare-socket retry loop). Under single-use, that retry burns a request to fail.
Change before the next run: on download failure, skip the photo and let a later slice
re-pull a fresh URL for it. Also confirms our architecture is the required one (mirror
once, serve own copies, never hotlink) — nothing to change there.

## Full docs sweep + mechanism proof (2026-08-08, owner asked for the no-stone-unturned pass)

Read: llms.txt (complete page index), master.md Media Files (verbatim), the migration
notice ("Upcoming Changes to Media Delivery", single hard cutover Sept 8 noon MT, no
published early waves), "Changes to MLS Grid Media Access" (the June-1 User-Agent rule —
we comply, proven by Aug 5's 25k downloads), the OneKey field-change notice (March 2025
cosmetic renames — unrelated), api-version-2.0.md (only /v2 exists; "Prefixed KeyField
Values" defines the KEY<native> scheme the URL segment uses; Media section: "media never
updates and retains the original Media URL" — the PATH is minted once at media creation,
only token/expires re-sign per response).

That last sentence predicted the decisive split, and the DB confirmed it: listings that
entered the market ON/AFTER Aug 5 are broken 383/383 in the last 24h; only pre-migration
media still carries healthy original KEY paths. THE BUG IS THEIR URL MINTING FOR NEW
MEDIA RECORDS. Eliminated by evidence: our request shape (plain $expand=Media), the
User-Agent rule, API version, Media Access setting, payment/license status, any
self-construction or rewrite (signature-bound, 403). No consumer-side remedy exists in
any of their documentation. The ticket (Gmail draft, full un-redacted expired specimens +
the cohort finding) is the fix. Untested long-shot noted for the owner only: the
subscription page shows an unclicked "Accept AI Addendum" button — a legal agreement,
HIS call, no evidence linking it to media.

## Partial-backfill-now idea: tested and closed (2026-08-08, owner's suggestion)

Reasonable theory — old listings' media might still mint healthy wave-1 URLs, letting the
gallery gap finish now with new listings deferred. Measured (one paced probe, 3 random
one-pic gallery-gap listings incl. one listed 2025-08-01): fresh pulls return
/images/undefined/ on ALL their media, 3/3 listings, 60/60 photos. Minting is broken for
everything it re-mints, old or new. The scattered healthy stored URLs belong to
already-fully-mirrored listings (which is also why storage has zero uploads since Aug 5
despite them). NO partial harvest exists — every cohort waits on MLS Grid's fix. Do not
re-test this without new upstream evidence.

## ═══ RESOLVED ON OUR SIDE — 2026-08-08. The adversarial second opinion found it. ═══

The three-day "only MLS Grid can fix it" conclusion was WRONG. Root cause: the migrated
feed builds each MediaURL at RESPONSE TIME as /images/<ListingKey>/<file>, read from the
PROJECTED Property document — and SELECT_FIELDS never included ListingKey, so every
response since their early rollout (~Aug 5) carried "undefined" in the path. Proven by
controlled A/B (same listing, seconds apart, only $select differing), replicated
independently in the main session before shipping. Fix: "ListingKey" added to
SELECT_FIELDS (commit 307458e). Stored ids unchanged. Full analysis:
docs/parity/PHOTO-OUTAGE-SECOND-OPINION.md.

Why every earlier pass missed it: "our request shape" was ELIMINATED BY READING DOCS
(plain $expand=Media is documented as fine) instead of by EXPERIMENT. A response-time
builder reading the projection is invisible to document reasoning; only the A/B could
surface it. The reviewer also found: no collateral field damage from their migration
(full jsonb key diff, fill rates flat), zero-photo growth is ~60/day not 150-250, and
/api/media's stored-URL proxy fallback (route line ~176) violates the new single-use
rule — REMOVE OR GATE IT BEFORE SEPT 8 (queued).

RESTART LADDER (next session): the media host answered 429 to the reviewer's single byte
fetch, so no downloads today. 1) confirm the hourly sync now stores /images/KEY…/ URLs
and storage.objects shows fresh uploads; 2) the standing 12-listing probe with
--max-429 1; 3) covers-only sweep; 4) --cap 8 galleries. Plus the single-use retry fix
in backfill-photos.mjs (skip on failure, never re-request a URL) BEFORE the sweep.
Follow-up email drafted for the owner telling MLS Grid the trigger + suggesting their
builder fall back to ResourceRecordKey before other consumers hit this on Sept 8.

## Breakage #2, unmasked by fixing #1 (2026-08-08 ~17:20 UTC)

The first post-fix sync tick (17:07) DOWNLOADED photos again — and failed every UPLOAD:
storage answered `Invalid Compact JWS / AccessDenied` on all 28 attempts (Vercel runtime
logs). The DEPLOYED `SUPABASE_SERVICE_ROLE_KEY` was stale/invalid; the local key passed an
auth-proving test write (mime-rejection 415 = auth OK). The URL outage had been masking
this completely — with every download 404ing, the upload step never ran.

Fixed: production env var replaced with the verified local key (Vercel CLI, value never
printed), redeployed via this commit. The sync reported `mirrorDebt: 82` — it tracks what
it owes and catches up on subsequent ticks once uploads succeed. VERIFY after the next
tick: `storage.objects` rows with `created_at` > deploy time, and the log line's
`mirroredPhotos` > 0. If JWS errors persist, the key in Supabase itself was rotated again —
mint a fresh service key in the dashboard and update BOTH .env.local and Vercel.

## ═══ 2026-08-09 — THE LADDER RAN. Covers 22% downloaded (1,043 of 4,738 owed; the "27%"
## ═══ first written here was an unfounded number — corrected). Two real defects shipped.
## ═══ NOTE: the "429 = stop for the day" framing below is RETIRED — see the late-night
## ═══ section: the official docs contain no such rule, it was ours. ═══

RUNG 0 re-verified before anything: 236/236 rows modified in the prior 8h carry
/images/KEY…/ paths (zero undefined); storage.objects took uploads in EVERY hour of the
prior 24 (72-773/hr, ~5,400 objects); pg_cron `idx-hourly-sync` and
`idx-photos-servable-refresh` both green. The dry-run upstream check makes ZERO media-host
requests (verified in code: DRY short-circuits before downloadPhoto).

RUNG 2 (12-listing probe, --max-429 1): 272/272 fetched, downloaded, mirrored. Zero 429s,
zero failures.

RUNG 3 (covers-only, full feed via --fresh): three slices ran EPOCH → 2025-10-17
(1,061 listings, 1,043 covers, zero 429s) — and every slice read "skipped 0". That was a
LATENT BUG CAUGHT LIVE, not a queue: mirrorSlice keyed skips off listing->photosMirroredTs,
which is wiped/absent on the old band, and worse, the rpc write-back stamped the covers-cap
outcome (1) onto EVERY slice listing through idx_sync_apply's wholesale jsonb replace — a
skipped 42-deep listing would have been flattened to 1. 19,589 intact markers sat in the
blast radius ahead of the watermark. Killed the run before it reached them.

THE FIX, two halves, both verified:
· Script (740ceb0): a ts-matching marker is now the FLOOR the outcome can never dip below,
  and only listings with queued work are written back at all. Dry-run proof: the band that
  re-downloaded 353/353 before the fix now reads "skipped 40/40, fetched 0, wrote 0".
· DB repair (SQL, direct): 8,652 rows whose marker was absent/zero/mismatched while storage
  PROVABLY holds current photos (every object's created_at AFTER the row's modification_ts —
  computed via a scratch min(created_at)-per-listing table, since dropped) got
  photosMirrored = photos_servable + matching ts. 206 markers claiming MORE than storage
  holds were stripped for honest re-mirroring. marker-current rows: 23,304 of 26,628
  servable actives. The 5,144 rows whose objects predate their modification stay dead-marker
  ON PURPOSE — their photos cannot be vouched for and the sweep re-mirrors them honestly.

THE 429 AND THE DAY-STOP: the resumed run 429'd inside its first slice (~17:15-17:20 UTC)
and --max-429 1 killed it, as designed. Standing rule honoured: ANY 429 = STOP FOR THE DAY,
never "lower the rate and try again". Diagnosis for the record: the hourly sync's tick
started 17:07:00 UTC and its own mirror catch-up downloads at the same ~2/s against the
SAME account cap — the first run coexisted with the 16:07 tick by luck; the resume landed
square on the 17:07 tick's media window. Alternate: a longer-window quota counting the
day's ~1,300 downloads. Indistinguishable without spending requests we may not spend.

RUNG 5a SHIPPED (156e39e): the /api/media stored-URL proxy fallback is GATED on row
freshness — modification_ts older than 3h means the signed URL is dead by definition
(capture ≤1h after modification, expiry ~1h after capture), so the route now answers the
same transient 503 with ZERO media-host contact. Unknown ts = fresh (snapshot fallback,
failed DB reads, and test seeds keep old behaviour). The "remove/gate before Sept 8" item
is RETIRED. Rung 5b (cache-control S3 sweep) still waits on owner-minted S3 keys —
.env.local has none.

## RESUME LADDER (next session — downloads allowed again the NEXT DAY, not sooner)
1. Watermark stands at 2025-10-17T07:01:36.797Z in scripts/.photo-backfill-watermark.local.
   DO NOT --fresh: the EPOCH→2025-10-17 band is done and skip-proven.
2. LAUNCH IN THE SYNC'S QUIET WINDOW: the tick fires at :07 and its media work runs a few
   minutes; start the runner at ~:20 past the hour. Expect the :07 window each hour —
   at 2 rps the collision risk repeats hourly, and one 429 ends the day again.
3. Probe first per the standing procedure (~250 photos, read the histogram), then:
   node scripts/backfill-photos.mjs --covers-only --max-pages 999 --max-listings 999999 --max-429 1
   The REAL gap cohort (outage-era zero-photo rows) lives at the END of the feed order, so
   the visible zero-photo count (1,139 at close) moves late in the sweep, not early.
4. Then rung 4 galleries: --cap 8 --max-pages 999 --max-listings 999999 --max-429 1.
   With the repaired markers the skip math now starts from truth: only genuine gaps
   download. Storage note (+~20 GB) and the covers-keep prune stand as before.

## ═══ 2026-08-09 LATE NIGHT — THE RULES RE-EXAMINED AGAINST THE OFFICIAL DOCS ═══
## ═══ Owner's challenge: "double check with real docs... do not hallucinate." He was right
## ═══ on the substance. The docs are now MIRRORED IN-REPO: docs/vendor/mlsgrid/ (39 pages,
## ═══ scripts/mirror-mlsgrid-docs.mjs regenerates). Claims need citations from now on. ═══

WHAT THEIR DOCS ACTUALLY SAY (docs/vendor/mlsgrid/README.md has the citation table):
· Media URLs single-use + 1h expiry: CONFIRMED VERBATIM (api page lines 351-352). The
  stale-source gate and single-request-per-URL rules stand on their words.
· "Never a reason to download the same media more than once": their rule — our marker-aware
  skip logic is compliance, not just thrift.
· RATE LIMITS: THEIR PUBLIC DOCS CONTAIN NONE. No req/sec, no hourly/daily quota, no 429
  policy, no suspension criteria. The only frequency rule is Lookup ≤ once/day. The
  "2 req/sec" in our code comments is cited NOWHERE public — provenance unknown (possibly
  DLA or support email). Keep it as OUR conservative pacer, labelled as such.
· "ANY 429 = stop for the day" was OUR invention (written 2026-08-03 during an unstable
  week). RETIRED. New policy: escalating backoff, stop the RUN after --max-429 strikes,
  wait out a window (hours / next sync-quiet hour), probe small, continue.

MEASURED CAPACITY (our own storage.objects — first-party): 215,269 photos mirrored on
2026-07-18 alone; 33,839 on 07-17; 9-17k/day routine; 25,222 on 08-05. The July
suspensions correlate with UNPACED bursts and retry storms, both since fixed. A paced
2 rps runner is proven at 200k+/day scale.

CORRECTED ACCOUNTING for today: covers done 1,043 of 4,738 owed (22%); feed scan 1,061 of
~27,785 rows (3.8%); galleries owed ~95,590 at close of day. The earlier "27% swept" and
"1-3 days" lines were not derived from these numbers and should not have been written.

RESUMED TONIGHT under the new policy (~23:45 local): covers with --max-429 3, then
galleries --cap 8 chained behind it. At 2 rps the remaining work is ~35 min covers +
~13.2h galleries of download time plus ~80 feed pages of scan overhead.

## ═══ 2026-08-10 ~00:30 — THE BEST PRACTICES GUIDE PDF SETTLES THE LIMITS QUESTION ═══
The late-night section above said "their public docs contain no rate limits" — true of
docs.mlsgrid.com only. The API v2 BEST PRACTICES GUIDE (public PDF on mlsgrid.com/resources,
NOW MIRRORED at docs/vendor/mlsgrid/MLS-Grid-Best-Practices-Guide-2.pdf with the DLA, IDX
Rules and Developer Checklist) publishes the full caps: 2 RPS at all times · 7,200 req/hr ·
4 GB/hr · 40,000 req per ROLLING 24h · 60 GB/24h. Suspensions self-heal as the rolling
window drains. A "Grace Period" (email support@mlsgrid.com in advance) lifts the caps for
initial imports. Consequences for the plan:
· The 2026-07-18 bulk day (215,269 photos) was ~5x over the 24h cap — the likely cause of
  July's suspensions. Never read it as capacity again.
· Galleries (~92k downloads owed) are QUOTA-bound: ~3 days inside the caps (sync shares the
  budget, ~2-6k/day), or ~1 day if the owner's Grace Period request is approved.
· backfill-photos.mjs gained --max-downloads N so every run carries an explicit budget;
  tonight's galleries run is budgeted ~28k, leaving sync headroom inside the rolling 24h.
· A Grace Period request draft was prepared for the owner to send from his Gmail.

## ═══ 2026-08-10 ~04:40 — NIGHT LEDGER: COVERS COMPLETE, GALLERIES 1/3 DONE ═══
· Rung 3 COVERS: FEED COMPLETE. 26,716 listings / 89 pages scanned, 3,700 covers mirrored,
  histogram ok:3700 429:1 (the one 429 absorbed by backoff mid-run — the rewritten policy
  working as designed). Watermark file deleted by feed-complete, as the script defines.
· VERIFIED on the committed gate: zero-photo live rows 1,139 → 45 (1 fresh + 8 <7d + 37
  old rows the feed sends no photos for; those self-heal on their next feed touch).
  27,731 of 27,776 live rows (99.84%) now show real photos.
· Rung 4 GALLERIES first budgeted run: 28,509 photos on 6,405 listings, 20 pages, ZERO
  failures, ZERO 429s, stopped cleanly at the 28k budget. Resume watermark
  2026-06-01T19:14:36.633Z. photos_servable ≥5 moved 14,762 → 18,087.
· Rolling-24h spend after the run: ~35k of the 40k cap — by design. Next windows: a small
  morning top-up (~2-3k), then the big night runs. Galleries complete ~Aug 11 night /
  Aug 12 early, inside the caps — or in one run if the Grace Period email is answered.

## 2026-08-10 09:30 — morning check: window saturated BY DESIGN, no run until tonight
Trailing-24h media spend 33,978 of the 40k cap → budget under the 3k floor → correctly NO
morning run. No backfill runner live; gallery resume watermark 2026-06-01T19:14 intact.
Gate: zero-photo holds at 45; ≥5-photo listings grew 18,087 → 18,941 overnight (sync
deepening modified rows). MLS Grid has answered NONE of the owner's emails (both Aug 8
outage reports sit unreplied; Grace Period draft still unsent in his Gmail). Next gallery
run scheduled 00:26 tonight with a freshly measured budget (~28-30k as the window drains).

## 2026-08-11 ~08:30 — night-2 gallery ledger
26,384 photos on 6,234 listings, 21 pages, zero failures, zero 429s; stopped at the 26k
budget. Watermark 2026-06-01 → 2026-07-10. Cumulative galleries 54,893. MEASURED remaining
(marker formula over live rows): 33,749 downloads — one more full window + a small tail.
Gate: zero-photo 46 · ≥5 photos 22,205 (14,762 at round start) · ≥20 photos 8,758.
Next window 2026-08-12 04:26 (~26k budget), tail top-up when the rolling window frees.

## 2026-08-12 morning — the 2 RPS ceiling found by two 429 trips, rate cut to 1.7
Run 3 (08:36, 2 rps): 10,148 photos then THREE 429s ~09:5x. Instant-retry at 10:11 got
three more 429s on its first requests — the host was still cooling. Diagnosis with the
numbers: 2 rps flat = 7,200/hr = EXACTLY the published hourly cap, zero headroom for the
hourly sync's own media spend (daytime ticks run 200-800/hr). The overnight runs survived
at ~7,040/hr effective only because night sync ticks are light. The 4 GB/hr cap sits at
the same edge (7,200 × ~450 KB ≈ 3.2 GB + sync). NEW STANDING RATE for long runs:
--rps 1.7 (≈6,120/hr, ≈2.7 GB/hr) — headroom under both hourly caps at any time of day.
Relaunched 10:52 at 1.7 rps with the window's remaining 15.5k budget, watermark
2026-07-30. Suspensions self-heal per their guide; both trips cost only minutes.

## 2026-08-12 ~11:15 — the penalty decoded by A/B: leaky bucket, not a block
While my local runner instant-429'd at 10:11 and 10:52, the 10:07 SYNC tick mirrored 582
photos from Vercel — same token, different egress. Direct A/B from this machine (2 media
requests + 2 paced probe calls): first fresh URL 500'd (edge flake), then 429, then TWO
CLEAN 200s seconds apart. Verdict: a leaky-bucket limiter that was nearly drained — NOT a
hard IP or account block. The morning's "instant triple-429s" were 4 concurrent workers
hitting an almost-empty allowance in second one and burning --max-429 3 instantly; my +18
and +40-minute relaunches were too eager and deepened nothing but wasted strikes. Policy
refinement: after a RateLimited trip, the next attempt carries --max-429 6 (absorb
residual drips with escalating backoff) and at least an hour of cool-off. Relaunched
11:15, rps 1.7, 15.5k budget, watermark 2026-07-30.

## 2026-08-12 11:05 — stand-down until tonight, and an honest correction
The --max-429 6 leg also died at zero downloads (~10:58-11:00) — the local bucket is
empty in daytime, full stop, and the A/B's two 200s were only the drip refill. CORRECTION
to the entry above: my relaunch spacing was ~5 minutes, not the hour the refinement had
just prescribed — that churn is exactly what the retired day-stop rule used to prevent,
and the honest reading is that BOTH extremes are wrong: not one-429-kills-the-day, and
not relaunch-in-minutes either. Standing procedure now: after a RateLimited trip, ONE
attempt per multi-hour window. Today's daytime attempts are over. Tonight 22:33: single
attempt, rps 1.7, --max-429 6, budget ~18k vs ~15.5k remaining — should reach FEED
COMPLETE. The hourly sync (Vercel egress) is unaffected throughout and keeps chipping.

## ═══ 2026-08-13 ~04:50 — BACKFILL FINISHED. FEED COMPLETE ON THE GALLERY PASS. ═══
Tail run: 1,843 photos, 15 pages, zero failures, zero 429s, FEED COMPLETE — watermark
deleted by the script, nothing left to resume. FINAL VERIFICATION (committed gate + SQL):
· zero-photo live rows: 45 of 27,750 (round start: 1,139) — 5 arrived today, 36 are old
  rows the feed sends no photos for; the hourly sync heals them on their next feed touch
· ≥5 photos: 24,895 (round start: 14,762, +69%) · ≥20 photos: 9,008 · ≥1 photo: 99.84%
· marker_current: 27,703 of 27,750 (99.8%; was 23,304 after the repair, rotten before)
· remaining owed by the marker formula: 22 — pure churn, the hourly sync's normal job
· storage.objects total: 459,899 (+~51k this round)
Round total mirrored: ~88,900 photos (3,700 covers + 84,900 galleries + probe) across
five night windows and one daytime lesson. From here the hourly sync alone keeps the
mirror current — the one-time bulk pass this doc has tracked since July is CLOSED.
Still open, unchanged: covers-keep prune (~10 GB reclaim, owner-decided policy, ready to
run any time) · cache-control S3 sweep (needs owner-minted S3 keys) · Grace Period email
never needed (draft can be discarded or kept for a future bulk need).

## 2026-08-14 ~02:15 — cap-20 deepening, night 1 of ~3
21,879 photos on 4,850 listings, 15 pages, zero failures, zero 429s at rps 1.7; stopped at
the 21.8k budget. Watermark 2026-05-17. Remaining of the measured 78,964: ~57k — two more
night windows. Next: 2026-08-14 22:33.

## 2026-08-15 ~05:45 — cap-20 night 2 (two legs)
Leg 1 (22:35): 6,603 photos / 1,209 listings. Leg 2 (02:27): 21,077 photos / 3,898
listings. Night total 27,680, zero failures, zero 429s at rps 1.7. Watermark 2026-07-01.
Cumulative cap-20: 49,559 of the measured 78,964 (63%). Final window tonight 22:33
(~29k remaining, budget ~20k + the leg pattern) — FEED COMPLETE expected tonight or the
following early morning.

## ═══ 2026-08-17 06:30 — CAP-20 DEEPENING COMPLETE (the photo project closes) ═══
The last leg tripped the 6-strike 429 guard with the work already done: the marker
formula reports **36 downloads remaining** at cap 20 — ordinary churn the hourly sync
absorbs, not a gap. Watermark had reached 2026-08-16T20:39 (yesterday's feed).

FINAL STATE (committed gate + SQL, 27,705 live rows):
· zero-photo 47 (4 arrived today, 35 older rows the feed sends no photos for)
· ≥1 photo 27,656 (99.83%) · ≥5 photos 24,918 · ≥10 photos 21,787 · ≥20 photos 13,848
· Half the inventory now carries a FULL 20-photo gallery; 79% carries 10+.

CAP-20 PHASE TOTAL: ~113,700 photos over 8 legs across 4 nights + one proven daytime run.
PROJECT TOTAL (since 2026-08-09): ~202,600 photos mirrored — covers pass, gallery pass to
8, then deepening to 20 — from a start of 1,139 photo-less listings and rotten markers.

THE OPERATING LAW THAT DID IT (all cited in docs/vendor/mlsgrid/README.md):
rps 1.7 (2.0 flat = exactly their 7,200/hr cap, zero headroom for the sync) · budget every
run with --max-downloads sized from a MEASURED trailing-24h storage count against the
40k/rolling-24h cap · ONE attempt per window after a RateLimited trip · night windows
preferred, but 2026-08-16 proved daytime works at 1.7 when the quota has room (18,775
clean) · every stop is resumable, nothing is ever lost.

REMAINING PHOTO WORK (owner-gated, not blocking): covers-keep prune (~10 GB reclaim) ·
cache-control S3 sweep (needs owner-minted S3 keys) · sold-photo private prefix (ON HOLD
by owner's order, 2026-08-10).

═══ 2026-08-17 — THE SOLD-PHOTO MIRROR (a new project, opened by the owner) ═══
"Brivity shows these, so we should too." The CMA's closed comparables had no photographs at
all. Diagnosed, fixed at the policy level, and the historical backfill started.

WHY THERE WERE NONE — measured, not assumed. ZERO of the 49,311 sales closed in the last
twelve months held a single object in mls-photos, in EVERY cohort including sales closed in
the last seven days. Not a gap in the mirror: `cleanupOffMarketPhotos` was doing its job.
Closing is how a sale leaves the market, so the cleanup deleted exactly the pictures the CMA
needed — and they had already been paid for in MLS Grid requests.

THE POLICY FIX (owner, 2026-08-17): "if they transfer we would not download, they just move
from active or pending to sold instead of deleting or downloading again — new logic should be
proper so we don't have any data loss." A closed sale is now EXEMPT from cleanup outright: it
keeps its FULL mirrored set, no delete, no marker clear, no re-download ever. Withdrawn /
expired / cancelled are unchanged — everything still goes. Two independent guards, because
this is the only destructive path in the sync and a wrong delete is unrecoverable:
 1. `public.idx_photo_cleanup_queue` — the work queue, with idx_sold rows excluded IN THE
    QUERY. This is not belt-and-braces, it fixes a separate STARVATION bug: a sale is
    off-market-with-photos for ever and its updated_at stops moving, so it would sit at the
    head of the updated_at-ascending queue permanently and spend the whole 60-row budget on
    rows it must not touch, leaving genuine withdrawals never reclaimed.
 2. `cleanupOffMarketPhotos`'s `soldIds` dep — unit-tested, and it THROWS rather than guessing
    if the lookup fails. An empty set would read as "none of these are sales", the one wrong
    answer that costs photographs.

THE STORAGE KEY: `mls-photos/<idx_sold.listing_key>/<i>.jpg`. Decided by measurement, not
taste. (a) The CMA already reads exactly that path — `sold-comps.ts` maps `listingKey:
row.listing_key`, `sold-provider.ts` carries it as `mlsNumber`, and the report surfaces call
`mirroredPhotoUrls(comp.mlsNumber, …)`. (b) It cannot collide: `listing_key` ∩ `idx_listings.id`
= 0 across all 52,595 sold rows and ∩ the bucket's 27,644 folders = 0, because listing_key is
the ListingKey (KEY424858527) and listing_id the ListingId (KEY998053). Writing under
listing_id WOULD collide — 1,968 sold rows share one with an idx_listings row. (c) A `sold/`
prefix is unservable: both readers guard the key with /^[A-Za-z0-9_-]{1,40}$/, which a slash
fails. (d) It matches the feed's own /images/<ListingKey>/ media path.

RESUME IS A COLUMN, NOT A FILE: `idx_sold.photos_mirrored_at` stamps each finished row and
`photos_mirrored` carries the contiguous count — which is also the CMA's `photosServable` for
a sold comp. Every batch asks for the newest UNSTAMPED rows, so an interrupted run resumes
exactly where it stopped and can never re-download a row already paid for.

WHY THE RUNNER CALLS THE DATA API DIRECTLY: /api/cron/sync-mls walks the ACTIVE feed and
cannot see a closed listing; /api/cron/mls-probe?ids=…&media=1 does return closed rows with
healthy media but hard-codes Media.slice(0,3) — three photos where the owner asked for five,
and raising it needs a deploy. So the DATA read lives in the CLI runner, which is what the ban
actually protects (no MLS from a PAGE OR REQUEST PATH). It is also strictly safer on pacing:
DATA and media share ONE pacer here, where splitting them stacks two rates against one 2 RPS
account cap.

SCOPE / COST / TIME — the owner's decision table (all figures MEASURED, 2026-08-17).
Downloads = sum(least(photos_count,5)) over the cohort, computed on the whole population, not
extrapolated. Realized yield in the live run tracked it closely (~4.9 photos/listing). Storage
uses the measured mean of 424 KB/photo (10-object sample: 185 KB - 761 KB). A "day" is one
budgeted window of ~24,000 requests — what the 40,000/rolling-24h cap leaves after the hourly
sync's ~10,000/day and a safety margin — which is ~3.9 hours of runner time at 1.7 rps.

  cohort        listings   downloads   window-days   storage
  0-30 days        4,632      22,617          0.9      9.2 GB
  0-90 days       13,240      64,703          2.7     26.2 GB
  0-6 months      23,119     112,815          4.7     45.7 GB
  0-12 months     49,311     240,437         10.0     97.3 GB   (the full ask)

RECOMMENDED STAGING — and the reason is the product's own rule, not a guess. The CMA searches
a FLAT TWELVE-MONTH sold window (`lib/cma/sold-window.ts`, SOLD_WINDOW_MONTHS = 12) and marks
every comp older than six months with a "6M+" dated chip. So six months is the boundary the
product itself draws between current and dated evidence:
  · Stage 1 — 0-90 days (2.7 window-days, 26 GB). The comps an agent reaches for first.
  · Stage 2 — to 6 months (another 2.0 window-days, +20 GB). Completes every comp that renders
    WITHOUT the dated chip. This is the recommended stopping point to review.
  · Stage 3 — to 12 months (another 5.3 window-days, +52 GB). Worth doing only if dated comps
    turn out to be picked often; the 6M+ chip already tells the client they are dated.
Storage is not the binding constraint at Supabase Pro rates (~$0.021/GB/month puts the full
12 months at roughly $2/month). MLS REQUEST QUOTA is. Nothing here needs a Grace Period email:
every stage fits inside the normal caps, it just takes the number of nights shown.

VERIFIED BY EXPERIMENT, not by reasoning (each of these could have broken the project):
· The CRM's sold cron upserts idx_sold with onConflict=listing_key. A partial-payload upsert
  was run against a stamped row: photos_mirrored and photos_mirrored_at SURVIVED untouched.
  PostgREST only SETs the columns present in the payload, so the mirror state is safe.
· The bucket-internal copy path (the zero-MLS route for future sales) works: copy → 200, read
  back 865,827 B, magic ffd8ff, and it INHERITS Cache-Control. Scratch object removed.
· The deployed /api/media already serves a sold key with no code change — `storage-probe`
  302s to the object, and index 9 (past the mirrored prefix) correctly returns the
  coming-soon placeholder rather than a broken tile.

WINDOW 1 — 2026-08-17, 18:27-19:27 UTC (daytime, launched at :27 past the hour, clear of the
hourly sync's :07 media window).
  budget: trailing-24h storage count measured at 9,659 → 36,000 - 9,659 - 2,000 = 24,341
          allowed. Run budgeted at 6,000 downloads, well inside it.
  result: 1,232 sold listings · 6,003 photos · 6,005 downloads · 61 DATA requests · ~61 min
  outcomes: ok 6,003 · timeout 2 · 429s ZERO · HTTP errors ZERO · upload failures ZERO
  depth: 1,181 listings at the full 5 · 51 partial (the feed served fewer) · 0 at zero
  reach: close dates 2026-08-16 back to 2026-08-07 — the ten freshest days of sales, which is
         exactly what close_date DESC is for.

The run was KILLED by the harness at 59.7 minutes, ~45 downloads short of its budget. It is
worth recording what that cost, because the answer is nothing: the resume marker is a column
stamped per batch, so every completed batch was already durable and the batch in flight simply
stayed unstamped and pending. Verified after the kill — 1,232 stamped rows, 6,003 recorded
photos, 6,003 objects in the bucket, 1,232 rows where the recorded count EQUALS the object
count, 0 disagreements, 0 rows stamped with no objects behind them. The 2 timeouts account for
the 2-photo gap against 6,005 downloads exactly. A timeout is a SKIP, never a retry: the URL
is spent, and a later pass gets a fresh one.

VERIFICATION BY SAMPLING (two independent samples, 20 objects total):
· 20/20 fetched back from the public bucket as REAL JPEGs — HTTP 200, magic ffd8ff, sizes
  120 KB - 761 KB, mean ~424 KB. No truncation, no HTML error body wearing a .jpg name.
· OWNERSHIP, the check that matters: for 10 listings the feed was re-asked for its own record
  and ITS media path segment compared to the folder we wrote. 10/10 MATCH. The photographs are
  under the listing they belong to, not merely under a plausible-looking key.

REMAINING IN THE 12-MONTH WINDOW: 48,079 listings / ~234,400 downloads. Budget left in today's
rolling window after this run: ~18,275 requests. The next window resumes with no flags beyond
the budget — the column knows where it stopped:
  node scripts/backfill-sold-photos.mjs --max-downloads 18000

## 2026-08-17 16:20 — the budget formula gains its missing half: check the HOUR
Sold window 2 was launched immediately after window 1 finished, on a trailing-24h of
15,233 (budget 18,000 — correct against the 40k/rolling-24h cap). It took SIX 429s in six
seconds and stopped, having downloaded 5. The 24h number was never the binding constraint:
window 1 had just spent 6,003 downloads inside the previous HOUR, and the cap that bit is
7,200/hr (measured at the moment of failure: 5,766 in the trailing hour, plus the sync's
own share). Cost: nothing — resume state is a column, and the guard stopped it in seconds.

BUDGET RULE, CORRECTED — a run needs BOTH doors open:
  trailing_24h  = objects created in the last 24h   → daily budget  = 36,000 - trailing_24h - 2,000
  trailing_1h   = objects created in the last hour  → hourly budget = 6,000 - trailing_1h
  launch only if BOTH > 3,000; size --max-downloads to the SMALLER of the two.
A window that ran hard in the last hour must WAIT ~1h even when the day looks wide open.
This is the same class of error as the Aug-12 daytime trip (2 rps flat = exactly 7,200/hr):
the hourly cap is the one that bites first, and it is invisible in a 24h count.
