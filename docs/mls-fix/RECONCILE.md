# Feed reconciliation — why a sold home can show as active, and the daily check that ends it

Written 2026-10-19 (round 69, Fable 5.1 alone), on the owner's report of a caller who found a
listing active on our page that Zillow and the MLS showed sold.

## 1. The listing he was called about

`KEY1014212`, 72 Gleneida Avenue, Carmel 10512, $299,950.

| Source | What it says (2026-10-19 17:30 UTC) |
|---|---|
| Our store | `is_active` true, status Active, PropertyType **Commercial** (Mixed Use), listed 2026-06-16, last feed change 2026-10-14 20:40 UTC (a price change), upserted by the 21:07 sync that hour |
| The feed, asked by id, unfiltered | `StandardStatus` **Active**, `MlsStatus` Active, `MlgCanView` true, `OnMarketDate` 2026-06-16, `StatusChangeTimestamp` 2026-06-16, `PropertyType` Commercial Sale, Putnam County, list office Keller Williams Realty Partner |
| Zillow | "Sold for $400,000", SingleFamily, the Zestimate chart's sale marker in early 2026 |

The page mirrors the MLS correctly: OneKey carries the building as an ACTIVE commercial listing
(the remarks offer it for sale and for rent), and Zillow shows the house's last residential sale,
a different record. Whether that commercial listing should still be open is the listing agent's
MLS data, not ours. It is not in `idx_sold` (62,995 closed sales, none commercial).

## 2. The full check he asked for (read-only)

`scripts/reconcile-feed.mjs`, 17:31 to 17:34 UTC, one `$top=500` page per 1.3 s:

| Measure | Value |
|---|---|
| Feed on-market set (`MlgCanView eq true`, status Active / Active Under Contract / Coming Soon / Pending, all onekey2 counties) | **46,614** rows, 94 pages, **0** out-of-order timestamps |
| Rows we serve (`is_active`) | **27,507** |
| STALE: we serve, the feed does not list on-market | **28** |
| MISSING: feed on-market in a served county and type, we do not serve | 7, all with timestamps 17:08 to 17:31 (newer than the 17:07 sync; the 18:07 tick takes them) |
| DRIFT: both sides, the feed newer than us | 58, all timestamps 17:07 to 17:30 (same: pending the next tick); 4 of them status Active here, Pending there |

The 28 stale rows, asked of the feed by id, unfiltered:

| What the feed answered | Rows | Reading |
|---|---|---|
| Closed / Hold / Canceled with `StatusChangeTimestamp` 17:09 to 17:28 **today** | 14 | closings from this hour; the 18:07 sync deactivates them as designed |
| **Absent** from the feed entirely | 12 | hidden (`MlgCanView=false`) more than 7 days ago and purged (the docs: hidden rows leave the feed after 7 days). Ours were last changed by the feed 2026-03 to 2026-08 and last written 2026-08-11 to 08-19 |
| Closed, `StatusChangeTimestamp` 2026-08-26, **`ModificationTimestamp` still 2026-08-14** | 1 | `KEY1005904`, Dutchess, Pending here since 08-15 |
| Active, **`MlgCanView=false`**, `ModificationTimestamp` unchanged since 2026-10-12 18:54 (the row our 19:07 sync upserted as viewable) | 1 | `KEY1050913`, Queens |

So 14 real misses out of 27,507 (0.05%) over about ten weeks. They have TWO causes, and the first
reading of them (one cause, "the feed changed these rows without moving the timestamp") was wrong
for 13 of the 14; the production run's own numbers exposed it (§5):

**Cause 1, ours, 13 of 14 (the twelve purged rows and `KEY1050913`): the sync never asked the feed
for `MlgCanView`.** `SELECT_FIELDS` in `lib/idx/mls-grid.ts` listed every field the delta projects and
that flag was not among them. The delta is unfiltered precisely so it can see a row go hidden, and
`mapProperty` drops a row whose `MlgCanView` is false, but a row that never carries the field passes.
So when OneKey hid a listing that still read Active or Pending (the timestamp DID move), the next
hourly tick upserted it as active; seven days later MLS Grid purged it from the feed, and from then
on no delta could ever correct it. The twelve purged rows were all last written by the hourly sync
or an August backfill slice on the hour they changed (2026-08-11, 08-15, 08-19), which fits. The
test for the delta even said "both fields still ride along in $select" and never checked.
`KEY1050913` is the same story caught before the purge: hidden on 2026-10-12 18:54, upserted active
by our 19:07 tick. **Fixed by adding the field** (one line; the feed serves it, the measurement script
had selected it all along), with a test that reads the `$select` the client sends.

**Cause 2, the feed's, 1 of 14 (`KEY1005904`): a status change with no `ModificationTimestamp` move.**
Closed on 2026-08-26 (`StatusChangeTimestamp`), timestamp still 2026-08-14. A timestamp delta
(`ModificationTimestamp gt <watermark>`, MLS Grid's documented replication model and the right one)
can never see a change that carries no timestamp. MLS Grid's documentation says the timestamp moves
on every change; the feed shows it does not always.

Cause 1 is closed at the source. Cause 2 cannot be closed by any delta, so the daily reconciliation
below is not a patch for a bug but a second instrument beside the first, and it is what caught cause 1.

What the check also settled: the feed's default order is ModificationTimestamp ascending without
exception across 46,614 rows (the delta's resume model holds); the 8-page cap and the time budget
cannot lose rows in that order; every hourly run of the last day reported `complete:true`; the
photo backfill's re-upsert path (which sets `is_active=true`) was not involved (the twelve purged rows
were last written by the hourly sync and two August backfill slices while the feed still listed them).

Not a defect, but worth knowing: 764 rows we serve as Pending have a feed `ModificationTimestamp` more
than a year old (352 from December 2024). The feed lists every one of them as on-market Pending today;
OneKey's stuck pendings are the MLS's data, and we show them as Pending, not Active.

## 3. The cure: a daily set comparison

No timestamp query can see a change with no timestamp, so once a day the store is compared with the
feed as a SET:

1. **Walk** the feed's whole on-market set, ids only (`ListingId, StandardStatus, MlgCanView,
   ModificationTimestamp, PropertyType, CountyOrParish`; about 94 pages of 500 at one page per 1.1 s,
   about 100 KB each), writing each page into `idx_reconcile_seen` with the feed's `nextLink` beside
   it in `idx_sync_state.reconcile`, so a tick that dies loses a page, not the walk. A Vercel function
   has 300 s; a walk that does not finish in one tick resumes at the next.
2. **Diff** (`idx_reconcile_candidates`): rows we serve that the walk did not see; served on-market rows
   the walk saw that we do not hold.
3. **Ask the feed by id** (25 ids a request, unfiltered) what every unexplained row is today, and judge
   each answer with `isShowable`, which is the hourly delta's own upsert gate (sale status, viewable,
   served county and type, mappable). Off-market or absent: deactivate through `idx_reconcile_apply`
   (the sync's own statement: `is_active=false`, never a delete). Still on the market (the walk skipped
   it; pages shift as the feed changes under them): leave it alone and record it as seen.
4. **Restore** served on-market rows we do not hold: full rows with media, mirrored like the sync
   mirrors, upserted through `idx_sync_apply` (bounded to 100 a run).
5. **Refuse** to judge a walk that saw less than half of what we serve (`sanityOk`); the state carries
   the error and the health watch names it.

`app/api/cron/idx-reconcile/route.ts` (the orchestration), `lib/idx/reconcile.ts` (planning,
classification, state; unit-tested), `lib/idx/mls-grid.ts` (`walkOnMarket`, `probeByIds`,
`fetchFullByIds`, `isShowable`, `toOnMarketRow`), `lib/idx/db.ts` (the RPC calls),
`supabase/migrations/idx_round69_reconcile.sql` (applied 2026-10-19). The pg_cron job
`idx-daily-reconcile` fires four ticks, 09:05 to 09:50 UTC; `planTick` makes a tick start, resume,
finish or do nothing. `?force=1` ignores the once-a-day rule; `?dry=1` judges and writes nothing to
listings. The health watch reports the last run's numbers every hour and raises a problem after two
days without a completed run, or on a refused one (families `reconcile-stale`, `reconcile-refused`
in `lib/watch/instructions.ts`).

Budget: about 100 to 130 feed requests a day, all at or under one per 1.1 s, beside the hourly sync's
few. The account caps are 7,200 an hour and 40,000 a rolling day.

## 4. What a visitor sees after a deactivation

The listing page is ISR with `revalidate = 600`, so a page rendered in the ten minutes before the
deactivation can be served from the cache for up to ten more minutes; after that the row is gone
from the store's RLS view and the page redirects to the search for its area
(`goneListingSearch`). Search, the rails and the map read the store live and drop it at once.

## 5. The first production runs (2026-10-19)

| Run | What happened |
|---|---|
| `?force=1&dry=1` on `c518cec`, 17:53 UTC | One tick, 119 s: the walk saw **44,694** on-market rows in 90 pages (the route's filter also limits to served PropertyTypes, hence fewer than the script's 46,614); 27,507 served; **37** candidates, every one asked by id: 24 off-market (Closed 10, Hold 8, Canceled 4, Expired 1, Withdrawn 1), 12 absent, **1 kept as still on the market**; 18 served rows missing. Nothing written. |
| `?force=1`, 17:55 UTC | The finish phase from the same walk, 34 s: **36 deactivated**, **18 restored** (with photos), 0 left. Active rows 27,507 to 27,489. `idx_sync_state.reconcile` carries `completedAt` and the summary; `idx_health_snapshot()` returns it; the listing page of a deactivated row (`/listing/KEY1005904`) redirects to the area search. |
| The one "kept" row | `KEY1050913`, the hidden-but-Active row. The probe projected `SELECT_FIELDS`, which had no `MlgCanView`, so the probe could not see it hidden either. That is how cause 1 in §2 was found. Fixed in `84840c4` (the field added); the re-run after that deploy is the last row of this table. |
| `?force=1` on `84840c4`, 18:08 UTC | A fresh walk and finish in one tick, 151 s: 44,689 on-market rows; **6** candidates, all off-market by the feed's own answer, now WITH the flag: Closed 2, and four hidden rows (Canceled, Hold, Withdrawn, and the **Active (hidden)** one, `KEY1050913`); **6 deactivated**, 5 restored, 0 kept. Active rows 27,489 to 27,488. The hourly sync on the new code (18:07 UTC) ran clean. |

pg_cron job `idx-daily-reconcile` installed 17:56 UTC (`scripts/schedule-idx-reconcile.mjs`): `5,20,35,50 9 * * *`.
