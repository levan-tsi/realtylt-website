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
