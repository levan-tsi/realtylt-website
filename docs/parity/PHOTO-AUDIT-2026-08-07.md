# Photo storage audit — 2026-08-07

Read-only reconciliation of `idx_listings.photos_servable` against what the `mls-photos` bucket
actually holds. **Zero MLS traffic was generated**: every fact below comes from our own Postgres,
our own Storage listing API, and five production `/api/media` fetches for listings whose object was
confirmed present in storage first.

A backfill runner was mirroring photos *while this ran*, so counts drift by tens of rows between
the paragraphs below. Measurement windows are noted where it matters; nothing here moves by more
than ~1%.

**Surface under audit:** `is_active = true AND property_type <> 'Rental'` — **25,116 rows**
(Active 15,214 · Pending 9,777 · Coming Soon 125). The full live surface including rentals is
27,764.

---

## 1. The truth table

Exact (not sampled) — a `LEFT JOIN` of the surface against `storage.objects` grouped by listing id,
run 2026-08-07:

| `photos_servable` | storage folder | `<id>/0.jpg` present | rows |
|---|---|---|---|
| **> 0** | yes | **yes** | **24,408** |
| **> 0** | yes | no | **0** |
| **> 0** | **no folder at all** | no | **0** |
| **= 0** | yes | **yes** | **1** |
| **= 0** | yes | no (objects start at index ≥ 1) | **10** |
| **= 0** | no folder at all | no | **676** |

Independent sample verification (per-id bucket listing, not the column, not the folder index):

- `ps>0 + folder` — **260 sampled at random, 260/260 had `0.jpg`**, 0 errors. 255 had exactly
  `photos_servable` objects, 5 had *more*, 0 had fewer.
- `ps=0 + no folder` — **250 sampled at random, 0/250 had any object.** The folder-level listing
  was telling the truth.
- `ps=0 + folder` — all **11** listed individually (below).

### Overcounted (`photos_servable > 0` but storage lacks photo 0) — **0 rows**

Nothing on the sale surface claims a photo it cannot serve. There are no broken covers from this
cause. This was the failure mode most worth finding and it does not exist today.

### Undercounted (storage holds photos the column does not admit to)

Three distinct shapes, **270 rows / 1,788 already-downloaded photos currently miscounted**:

**(a) `photos_servable = 0`, `0.jpg` present — 1 row.** Serves nothing today; a DB-side bump alone
fixes it, no MLS traffic.

```
KEY1015083   storage idx=[0]   feed photos array: EMPTY   Pending / queens / first_seen 2026-07-25
```

Note this one is odd in the other direction: the mirror has the cover but the *feed row* no longer
carries a `photos` array at all, so a normal re-sync will never restore the count.

**(b) `photos_servable = 0`, objects present but starting at index ≥ 1 — 10 rows.** The cover
download failed while the rest of the gallery uploaded; `photosMirrored` is a *contiguous prefix
from 0*, so one missing byte-range zeroes the whole listing. **194 downloaded photos are stranded
here.** All 10 ids (this is the complete set, not a sample):

```
KEY1012609  idx 1..47   Active / westchester / 2026-07-24    (47 photos stranded)
KEY1022836  idx 2..37   Active / westchester / 2026-07-24    (36 photos stranded)
KEY1030681  idx 1..32   Active / dutchess    / 2026-07-25
KEY1030750  idx 1..29   Active / queens      / 2026-07-26
KEY1030257  idx 1..28   Active / queens      / 2026-07-25
KEY1030726  idx 1..9    Active / queens      / 2026-07-25
KEY946123   idx 1..7    Active / queens      / 2026-07-15
KEY1030706  idx 1..3    Active / westchester / 2026-07-26
KEY1030714  idx 1..2    Active / queens      / 2026-07-25
KEY1030704  idx 1       Active / queens      / 2026-07-25
```

These are **not** invisible to a visitor: `app/api/media/[id]/[idx]/route.ts` has a
`storage-cover-sub` branch that probes indices 1–3 when index 0 is missing, and every one of the
ten has a photo within that window. They render — the *card count* and any `photos_servable`-based
filter/sort under-report them.

**(c) `photos_servable > 0` but storage holds MORE objects than the column claims — 259 rows,
1,593 extra photos.** Typically `ps=1` against a 30–50 photo gallery: the cover was counted, the
full mirror landed later, the count never caught up. Worst 10:

```
KEY1029707(ps=1,obj=49)  KEY1008527(ps=3,obj=50)  KEY1012647(ps=1,obj=48)
KEY1030103(ps=1,obj=40)  KEY1030098(ps=1,obj=39)  KEY1026357(ps=1,obj=38)
KEY1028138(ps=1,obj=32)  KEY1004476(ps=1,obj=30)  KEY1025313(ps=1,obj=28)
KEY1020025(ps=1,obj=28)
```

(The gallery still renders these via the route's `storage-probe` branch; the count is what is wrong.)

**No row anywhere on the surface has `photos_servable` GREATER than its object count.** The column
only ever under-promises. That is the safe direction to be wrong in.

---

## 2. The zero-photo cohort, characterized

**687 rows** with `photos_servable = 0` on the sale surface (down from 1,705 on 2026-08-04 — the
runner is working). Split by whether the row's `listing` jsonb even carries a `photos` array:

| | rows |
|---|---|
| **fixable** — feed row has a `photos` array | **646** |
| **UNFIXABLE by backfill** — no `photos` in the feed row | **41** |

Nothing can mirror what the feed never sent. The 41 are a permanent floor until the listing agent
uploads photos and the MLS re-exports the row.

### By age

| bucket | all 687 | fixable 646 | unfixable 41 |
|---|---|---|---|
| first seen < 24h | 178 | 175 | 3 |
| first seen 1–7d | 454 | 449 | 5 |
| first seen 7–30d | 55 | 22 | 33 |
| first seen > 30d | 0 | 0 | 0 |

By `listed_at` instead: 204 listed in the last day, 356 in the last week, 50 at 7–30d, and **77
listed more than 30 days ago** (45 of those fixable) — old listings that came to us late.

**The real backlog is 22 rows.** Everything else is a queue that drains on its own. Oldest fixable:

```
KEY946123 (2026-07-15, queens, Active)    KEY1020105 (2026-07-15, bronx, Pending)
KEY1014561 (2026-07-15, dutchess, Pending) KEY1021227 (2026-07-15, bronx, Active)
KEY1020679 (2026-07-15, ulster, Pending)   KEY1021823 (2026-07-15, ulster, Active)
KEY1030148 (2026-07-23, westchester, Active) KEY1022836 (2026-07-24, westchester, Active)
KEY1012609 (2026-07-24, westchester, Active) KEY1030681 (2026-07-25, dutchess, Active)
```

### By status

| status | rows on surface | zero-photo | rate |
|---|---|---|---|
| Active | 15,214 | 570 | 3.7% |
| Pending | 9,777 | 44 | 0.5% |
| **Coming Soon** | **125** | **73** | **58.4%** |

### By county (zero-photo rows)

| county | all | fixable |
|---|---|---|
| queens | 241 | 219 |
| westchester | 115 | 111 |
| orange | 81 | 81 |
| bronx | 61 | 56 |
| dutchess | 50 | 49 |
| rockland | 45 | 42 |
| brooklyn | 36 | 30 |
| ulster | 26 | 26 |
| putnam | 20 | 20 |
| staten-island | 7 | 7 |
| manhattan | 5 | 5 |

By property type: Residential 513, Multi-Family 97, Commercial 51, Land 26.

**Unfixable ids (10 examples of 41):**
`KEY1010724, KEY1015083, KEY1034279, KEY1035435, KEY1035441, KEY1035613, KEY1036029, KEY1036135,
KEY1036233, KEY815573` — concentrated in queens (22), brooklyn (6), bronx (5); 24 of the 41 are
Pending and 32 were listed more than 30 days ago.

---

## 3. Prioritization for the runner

- **Queens alone is 34% of the fixable cohort** (219 of 646); queens + westchester + orange = 63%.
  If the walk order is by county, those three first clears most of it.
- **By status, the cohort is 86% Active** (555 of 646 fixable), 11% Coming Soon (71), 3% Pending
  (20). Active is also what the site sells, so status order and value order agree — no tradeoff.
- **Coming Soon is not worth chasing.** It is 58% zero-photo *by nature* (the listing exists before
  the shoot) but only **125 rows on the whole surface**. Clearing every one of them changes the
  site's photo coverage by 0.3 percentage points. Do not let a Coming Soon-heavy slice look like
  progress.
- **The 22 rows older than 7 days are the only genuine backlog** — the other 624 fixable rows
  arrived in the last week and the hourly sync reaches them without the backfill.
- **Cheapest win available: 270 rows / 1,788 photos are already downloaded and sitting in the
  bucket** (§1a–c). Recounting them is a DB-side operation against `storage.objects` with zero MLS
  traffic — it is worth more than the next 270 listings the runner mirrors, and it costs no quota.

---

## 4. Spot serving checks

Five listings whose `<id>/0.jpg` was confirmed present in the bucket immediately before the fetch
(no MLS fallback possible), against `https://realtylt-website.vercel.app`:

| id | status | content-type | bytes | `X-Media-Status` |
|---|---|---|---|---|
| KEY1006179 | 200 | image/jpeg | 975,565 | storage |
| KEY1027626 | 200 | image/jpeg | 483,157 | storage |
| KEY1006774 | 200 | image/jpeg | 144,140 | storage |
| KEY1000658 | 200 | image/jpeg | 246,866 | storage |
| KEY987403 | 200 | image/jpeg | 886,375 | storage |

Three more, chosen because they have `photos_servable > 0` but `listing->photosMirrored = 0`
(again confirmed in storage first) — all 302 correctly, via the fallback branch:

```
KEY000018 ps=38 pm=0 → 302 X-Media-Status: storage-probe
KEY000024 ps=35 pm=0 → 302 X-Media-Status: storage-probe
KEY000036 ps=30 pm=0 → 302 X-Media-Status: storage-probe
```

**8,933 rows on the sale surface are in that state** (`photos_servable > 0`, `photosMirrored = 0`)
— 36% of the surface. They serve correctly, but every photo request pays an extra
`storageObjectExists` HEAD before the redirect instead of taking the direct `n < mirrored` path.

**Serving-cost finding.** The route's own 302 carries `public, max-age=3600, s-maxage=86400,
stale-while-revalidate=604800`, but the Supabase object it points at answers with
**`cache-control: no-cache`**:

```
ROUTE   302  cache-control: public, max-age=3600   X-Media-Status: storage
STORAGE 200  cache-control: no-cache   content-type: image/jpeg   975,565 bytes
```

Uploads do not set a cache header — `scripts/backfill-photos.mjs:81` and `lib/idx/storage.ts:99`
send only `Content-Type` and `x-upsert`, so Supabase applies its `no-cache` default. Against a
115 GiB bucket averaging ~300 KB per object, that means browsers and the storage CDN revalidate
(and largely re-transfer) on every view. This is the single largest egress lever on the site.

---

## 5. Storage footprint

Exact, from `storage.objects` metadata (not sampled):

| | value |
|---|---|
| objects in `mls-photos` | **410,928** |
| bytes | **123,252,300,329** (114.79 GiB / 123.3 GB decimal) |
| listing folders | **30,289** |
| folders holding a `0.jpg` | 30,264 (25 bucket-wide lack index 0) |
| mean objects per folder | 13.6 |
| mean object size | ~300 KB |

A 320-folder random sample taken independently before the SQL estimated 424k objects / 123.2 GiB —
+3.2% on object count and +7.3% on bytes, which is the cross-check that the folder enumeration was
complete and the exact figures are not an artefact of one query.

Where the bytes live:

| cohort | folders | objects | GiB |
|---|---|---|---|
| live for-sale rows | 24,419 | 351,838 | 99.51 |
| **rows now inactive** (sold / off-market) | 3,764 | 39,058 | **10.73** |
| live rentals | 2,106 | 20,032 | 4.55 |
| folders with no matching row at all | 0 | 0 | 0 |

**Plan implication.** 114.79 GiB is ~115× the free tier (1 GB) and already above the 100 GB
included with Pro; the overage is billed per GB-month and grows with intake. **10.73 GiB (9.3%) is
photos for listings that are no longer active** — a retention rule that drops storage for rows
inactive more than N days is the obvious first cut, and it needs no MLS contact. There are no
orphan folders, so nothing is leaking outside the listing lifecycle.

---

## What the runner should do differently

1. **Set a cache header on upload.** Add `cache-control: public, max-age=31536000, immutable` (or
   any long max-age) to the storage PUT in `scripts/backfill-photos.mjs:81` / `lib/idx/storage.ts:99`.
   Every object written from now on becomes CDN- and browser-cacheable instead of revalidating per
   view. This is a one-line change with a larger dollar effect than the rest of the backfill.
2. **Recount before you re-download.** 270 rows / 1,788 photos are already in the bucket and not
   counted — 10 of them show `photos_servable = 0` on a fully mirrored 30–47 photo gallery. A
   reconcile pass that sets `photos_servable` from the actual contiguous object prefix (and
   `photosMirrored` with it) costs zero MLS calls and recovers more inventory than the next several
   hours of mirroring.
3. **Repair the missing cover specifically.** All 10 stranded galleries are missing exactly index 0
   (one starts at 2) while holding 1..N. A targeted "re-fetch index 0 only" pass is ~11 media
   requests, not 194. Worth doing as its own tiny job rather than re-mirroring whole listings.
4. **Don't chase Coming Soon.** 73 of the 687 zero-photo rows are Coming Soon and mostly have no
   photos to fetch yet; only 125 such rows exist site-wide. Weight the walk to Active in queens /
   westchester / orange, which is 63% of the fixable cohort.
5. **Skip the 41 unfixable rows explicitly.** Their `listing.photos` array is empty — every attempt
   is wasted quota and they will keep re-entering any "zero photos" work queue. They belong on a
   deny-list keyed to `photosMirroredTs`, revisited only when `modificationTimestamp` changes.
6. **Nothing is currently broken for visitors from the mirror's side** — zero rows promise a photo
   they cannot serve. The remaining work is accounting and cost, not correctness.
