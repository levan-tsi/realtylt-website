# Round 30 — true coordinates

The owner: *"all of the active listings should be exactly where they have to be and no
cramped-down circles."*

Round 28 diagnosed this and deliberately did not fix it, because the fix is a data change and
needed an owner decision. This round made it. **27,242 of 27,741 active listings (98.2%) now
stand on their own geocoded street address**, measured to a **median of 32 m** against an
independent geocoder. The owner's own example, KEY918376 / 7 Ferris Lane, moved from **729 m
wrong to 51 m**.

---

## 1. What was actually wrong

The onekey2 subscription serves no `Latitude`/`Longitude` — a `$select` naming them returns
`400 The field 'Latitude' does not exist or is unable to be retrieved`. Round 28 proved this
three times; **it was not re-tested this round and this round made zero MLS Grid calls.**

So `lib/idx/mls-grid.ts#coordsOf` places every listing at its **zip centroid plus a
deterministic jitter**, `lat ± 0.008°` / `lng ± 0.011°` — a **1.77 x 1.86 km rectangle, the same
size for every zip**. Every home in a zip lands in that one small square, whatever street it is
on. At borough zoom a zip's whole inventory is a 30 x 32 px blob with empty ground between
blobs. That is the "cramped-down circles".

His Street View comparison is the tell, and it is exact: the detail page's Street View geocodes
the **address**, so it showed the real house; the search map read the **stored coordinate**, so
it put the pin 729 m away.

## 2. Where the coordinates came from

| source | rows | what it is |
|---|---|---|
| census / Exact | 23,199 | U.S. Census Bureau batch geocoder, exact street match |
| census / Non_Exact | 2,833 | Census matched the street, not the exact number |
| google / ROOFTOP | 1,047 | paid fallback, building |
| google / RANGE_INTERPOLATED | 163 | paid fallback, interpolated along the block |
| **total** | **27,242** | |

**24,007 came free**, imported from `listing_geocodes` — the CRM had already run this exact
Census pipeline against **this same table** on 2026-08-06 (it is the same Supabase project).
Re-geocoding them would have been ~24,000 pointless requests. They were not trusted blindly:
every row went through the same quality gate as a fresh one, and its `source_address` had to
still describe the address the listing carries **today**.

**Paid spend: $10.83 total** (2,167 Google lookups at $5/1000), well under the $20 ceiling in
the brief. Google was opt-in via `--google` and only ever accepted at `ROOFTOP` or
`RANGE_INTERPOLATED` — `GEOMETRIC_CENTER` and `APPROXIMATE` are a street or a postcode, which is
the very thing this round exists to stop showing, and Google answers `OK` with one of those for
almost any junk it is handed.

## 3. The quality gate, and what it caught

A geocoder's one real failure mode here is matching a same-named street in another county. The
gate rejects any answer more than **15 km from the listing's own zip centroid** — chosen from
measurement, not taste: over the 24,041 geocodes already in hand the 99th percentile distance
from the home's own zip centroid is 7.8 km (Exact) and 9.0 km (Non_Exact), and large rural NY
zips legitimately reach past 10 km.

Rejected across all passes:

| reason | n |
|---|---|
| source address no longer matches the listing | 43 |
| more than 15 km from its own zip centroid | 59 |
| no zip centroid to check against, and not building-grade | 29 |
| outside the served region | 2 |

The 43 address-drift rejections are real: the feed corrected those street lines after the CRM
geocoded them, and reusing the old coordinate would have pinned a precise-looking marker at a
place nobody asked about.

### The wrong-zip discovery

Twelve active rows carried **no zip at all** and so had no centroid, no geocode, and **no
coordinate whatsoever** — they could never appear on the map. Several others carry a zip that is
not in the served region: a Kingston listing stamped **43164 (Ohio)**, a Carmel one stamped
**14477 (Albion, 500 km away)**, a Clinton Corners one stamped 13323. Handing those to a
geocoder moves the home hundreds of miles.

So the runner now sends the **city** and blanks the zip whenever the stored zip is not one we
serve, while still keying the geocode on the zip the listing actually stores. Zip-less rows are
accepted only on a building-grade answer, never a street-level guess.

**Rows with no coordinate at all: 60 (round 28) → 45 (round start) → 10.**

The remaining 10 are honest failures, listed in full: 8 are vacant land with no house number
("Stonecrest Lot #18 Court", "Van Wyck Street", "0 Corner Oak Poplar Street"), which no geocoder
can place, and **2 are OneKey TEST LISTINGS** — `KEY1037844` and `KEY1037856`, both
"9876 Test Listing Road, Nyack" in zip 12345. **Those two are worth the owner's attention: they
are fake homes being served as real inventory**, the same class of thing as the E2E rows that
appeared in his publish dropdown in round 27. They are not a map problem and were not patched
here.

Giving the other 8 a city-centroid position was considered and rejected: inventing an
approximate coordinate is exactly the practice this round removed.

## 4. The design constraint: one coordinate source

The brief's hard rule — the viewport query, the grid and the map must all read one source — is
satisfied **by construction**, and nothing on the read path changed to achieve it.

`idx_listings.lat`/`lng` are `GENERATED ALWAYS` from `listing->>'lat'`/`'lng'`. `searchFilters()`
builds the bbox clauses on those columns and the grid and the pins query share it (round 23). So
writing the geocode into the JSONB makes every surface — bbox filter, grid, map, detail page —
move together automatically. Re-placing pins at render time, the tempting shortcut, is what
round 28 warned would break bbox agreement at every viewport edge.

## 5. Durability: the sync cannot undo this

This is the part that had to be right, because getting it wrong fails **silently**.

`idx_sync_apply` upserts with `set listing = excluded.listing` — a **full JSONB replace**. A
geocode written into the JSONB alone survives exactly until that listing's next feed touch and
then reverts to the centroid, with no error anywhere. All 27,242 homes would drift back one sync
at a time.

The geocode therefore lives in **`idx_geocodes`**, a table the MLS sync does not write, and the
upsert **merges it in**:

```sql
when g.id is not null and g.addr_key = public.idx_addr_key(r.listing)
  then r.listing || jsonb_build_object('lat', g.lat, 'lng', g.lng, 'geocoded', true)
  else r.listing
```

The rule sits in the **one write path every producer goes through** — the hourly cron,
`baseline-to-db.mjs`, `backfill-photos.mjs`, anything added later — rather than in each caller,
because a caller that forgets is a caller that moves 27,000 homes and breaks nothing visibly.

**Why a new table rather than the CRM's `listing_geocodes`:** that table lets any authenticated
CRM user `UPDATE` any row (`qual: true`). Arbitrary CRM users being able to move website map
pins is not a coupling worth having. `idx_geocodes` has RLS on with **no policies at all** —
only the `SECURITY DEFINER` RPCs can touch it — which also keeps coordinates for off-market
listings out of anon reach, as MLS Grid compliance requires.

### Proven, with a control

`scripts/verify-geocode-durability.mjs` (committed gate) drives the real RPCs against the real
database:

```
control — the same attack on a listing with no geocode MUST move it:
  OK    the upsert path actually writes coordinates  — KEY1038341 40.77980 -> 40.78980
  OK    control listing restored
the rule — a geocoded listing must survive a sync carrying the feed's centroid:
  OK    the sync could not move a geocoded pin  — KEY1032289 still at 41.065681, -73.765905
the guard — a geocode measured for another address must NOT be reused:
  OK    a renamed street falls back to the centroid instead of keeping a stale pin
  OK    restoring the address restores the geocode
the contract — JS addrKey() and SQL idx_addr_key() must agree:
  OK    25 real rows key identically in JS and SQL
PASS — geocodes are durable against the sync.
```

**The control is the point.** "The coordinate did not move" is also what an upsert that never
happened produces. So the same attack runs against a non-geocoded listing, which must move — if
it does not, the attack is not landing and the pass above proves nothing.

The **address-drift guard** is the other half: a geocode is an answer about an address, not
about an id. A renamed street falls back to the centroid rather than keeping a precise-looking
pin measured somewhere else.

The **cross-language contract** is checked because it cannot be unit-tested: JS `addrKey()`
writes the keys and SQL `idx_addr_key()` compares them, and if they ever drift, every geocode
silently stops being honoured and the map quietly reverts with nothing failing.

That check earned its keep immediately. A unit test caught that `addrKey` trimmed the **joined**
string, so `"7 Ferris Lane "` keyed as `"7 ferris lane |12601"` — one feed row with a trailing
space would have keyed differently from the same home without one. Both implementations now
normalise each part. Verified a no-op on live data first: 0 of 27,741 active rows carry an
untrimmed address or zip, so every key already stored still matches.

## 6. New listings

The hourly cron now geocodes what arrived since the last tick (`geocodePending`, up to 300
addresses, 25 s wall), running **last, after the watermark, inside its own try** — the same rule
as the photo cleanup: a free geocoder having a bad minute must never cost a sync.

Addresses nothing can place are stamped `listing->'geocodeTried'` so each tick spends its budget
on listings nobody has tried rather than re-asking the same ~500 unanswerable addresses every
hour. That marker is deliberately **not** defended by the merge — a full JSONB replace drops it,
so any listing the feed touches again earns a fresh attempt.

The gate is **shared** with the backfill (`lib/idx/geocode.mjs#rejectReason`), not
reimplemented: a backfill and a cron that disagree about which coordinates are believable is how
a map ends up with a house in the wrong county.

## 7. Verification

`scripts/verify-geocode-truth.mjs` (committed gate) samples homes evenly across the whole active
geocoded set and asks a **different geocoder** about each — Google where the stored value came
from Census, the Census one-line API where it came from Google. Checking the backfill against
its own geocoder would only prove the copy worked.

**n = 60, median 32 m, p90 161 m, max 433 m, 0 skipped.**

```
  <=   25m   16  ################ (27% cumulative)
  <=   50m   24  ######################## (67% cumulative)
  <=  100m    7  ####### (78% cumulative)
  <=  150m    7  ####### (90% cumulative)
  <=  300m    4  #### (97% cumulative)
  <=  600m    2  ## (100% cumulative)
  <= 1200m    0
  > 1200m     0
```

**KEY918376, 7 Ferris Lane, Poughkeepsie: 51 m** from an independent rooftop geocode (was 729 m
on the zip centroid). The owner's acceptance test, passed.

### Both outliers investigated

| id | address | stored vs Google | stored vs Census |
|---|---|---|---|
| KEY1035237 | 10 Pheasant Crossing Lane, Brewster | 379 m | **0 m** |
| KEY1015138 | 34 Palmer Circle, Poughquag | 433 m | **0 m** |

Neither is an error in this pipeline. In both cases our stored coordinate **is the Census answer
exactly**, and Census and Google simply disagree about where that address sits on a rural lane —
both name the same street and the same house number. This is geocoder-versus-geocoder
disagreement on low-density roads, which is the expected shape of the tail.

### The map, looked at

`docs/map-r30/` against round 28's `docs/map-r28/AFTER-*.png`:

- **yonkers-city** — the exhibit. Round 28 showed three discrete blobs with *"Tuckahoe,
  Bronxville and Eastchester blank between them"*. Those towns now have homes, and the pins
  follow the Yonkers street grid instead of banding diagonally.
- **poughkeepsie-street** — homes sit on Cannon Street, S Grand Avenue, College Avenue, Hooker
  Avenue individually.
- **queens-city / queens-street**, **poughkeepsie-city**, **yonkers-street** for the rest.

### Committed probes, all still green

| probe | result |
|---|---|
| `verify-map-zoom-ladder` | **PASS, 20/20 rungs** — no count circles, map survived every zoom, no orphans. No fixture changes needed: its rules are structural, so the legitimately changed in-view counts did not move it. |
| `verify-viewport-scope` | PASS — API total 15,303 = count line 15,303, 1 scoped fetch, page-2 carries the same box. **Grid–map agreement holds.** |
| `verify-pin-walk` | PASS — 135 clickable markers, set of 3,000, Next walks the pin set |
| `verify-map-popup` | PASS — pill and dot, hover/click/Escape/outside all correct |

## 8. Two things the new coordinates made wrong, and fixed

**The 175 m fan-out.** `spreadPins` fans coincident pins apart so they stay clickable. At
`0.0016°` (~175 m per √ring) that was harmless when every coordinate was a zip centroid — but it
had become **the largest error in a pin's position, five times the geocoding error underneath
it**, and a 67-unit co-op (the biggest coincident group in live data) sprawled **1.4 km** across
its neighbourhood: the same lie, in miniature. Coincident coordinates are now genuinely
coincident — 6,605 pins in 1,967 groups averaging 3.4, which is condos and co-ops sharing one
rooftop — so the fan only has to keep them separately clickable, not visually separate; the
collision thinning already stops chips overlapping. Now **7.8 m per √ring**, which keeps even
that 67-unit building inside a 63 m radius, its own footprint.

**"Locations approximate" on every view.** True for 100% of homes yesterday, untrue for 98.2%
today. The caveat now reads **"Some locations approximate"** and appears only when a pin that is
actually on screen is still on its zip centroid, measured over what was *planned for drawing*,
not the whole fetch. It starts `true` until a draw has measured — a caveat that appears late is
worse than one that disappears. Absent `geocoded` counts as approximate: never claim precision
we have not measured. Verified discriminating in the shot run: present in Poughkeepsie and
Queens, absent in Yonkers.

## 9. Gates

- `npx tsc --noEmit` — clean
- `npm test` — **920 passed / 0 failed** (baseline 885 + 35 new)
- `verify-geocode-durability` PASS · `verify-geocode-truth` PASS · `verify-map-zoom-ladder`
  20/20 · `verify-viewport-scope`, `verify-pin-walk`, `verify-map-popup` all PASS

## 10. Open / for the owner

- **Two fake test listings are live inventory** — `KEY1037844`, `KEY1037856`, "9876 Test Listing
  Road, Nyack" 12345. Not a map issue; they should be filtered or reported to OneKey.
- **499 homes remain on their zip centroid**, mostly vacant land and lot-number addresses that
  no geocoder can place. They are honestly labelled by the caveat and will be retried whenever
  the feed touches them.
- **Feed zips are wrong on a handful of rows** (Ohio and Albion zips on Hudson Valley homes).
  Worked around for geocoding; the listings still *display* the wrong zip.
- `PIN_CAP` (3,000) now binds more often than it did — round 28 noted it would start to matter
  once pins spread out, and Queens z11 fetches 3,000 of 5,570. The banner reports the true
  total, so it is honest, but it is the next thing to look at on the map.
