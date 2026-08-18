# Inventory gap investigation — 2026-08-18

**Question.** The owner checked OneKey MLS's own public site, filtered by county, and reported
roughly 8,000–9,000 active listings in Manhattan and 4,000–5,000 in Queens. Our database holds
389 for-sale in Manhattan. If that were right, we would be missing most of the market.

**Answer.** Two separate things were true at once, and only one of them is a problem.

1. The 8,000–9,000 figure is the **Queens County** page on onekeymls.com, not Manhattan.
   Reproduced: Queens County reads **8,887**, Manhattan (New York County) reads **891**.
   The boroughs were transposed.
2. There *is* a real gap, and it is much smaller and much more specific than feared:
   **Manhattan only, about 400 listings.** We hold 494 of the 891 for-sale listings OneKey's
   own portal shows in New York County — **55%**. Every other county we serve is at 99–102%.
   Brooklyn is at 89%.

The missing Manhattan listings are **not in our MLS Grid feed at all** — not hidden by a flag,
not dropped by our code, not missed by the sync. They are never delivered to our subscription.
That is a licence/opt-out question for OneKey, not a bug we can fix in this repo.

---

## What each number counts

| number | what it actually is |
|---|---|
| 8,887 | onekeymls.com → **Queens County, NY** → For Sale, all types, all on-market statuses |
| 891 | onekeymls.com → **New York County, NY** → For Sale, all types, all on-market statuses |
| 13,960 | onekeymls.com → "New York, NY" (the **city** — all five boroughs) → For Sale |
| 494 | our mirror, Manhattan, `is_active`, excluding rentals (Active + Pending + Coming Soon) |
| 389 | our mirror, Manhattan, `is_active`, excluding rentals, **`status='Active'` only** |
| 30,717 / 30,728 | the feed's own `$count` of Active for the whole onekey2 territory, incl. Long Island |

The 389 in the brief is an **Active-only** number. OneKey's portal counts Active, Pending and
Coming Soon together (their cards carry "Pending" and "Coming Soon" badges). The like-for-like
comparison to their 891 is **494**, not 389. That accounts for part of the apparent shock but
not the gap itself.

Reproduction path for the owner's figure, exactly: onekeymls.com → Buy → type a borough →
pick the **County** entry from the autocomplete. Note the autocomplete offers both a *city*
entry ("Manhattan, NY") and a *county* entry ("New York County, NY"); for Queens the county
entry is what the plain "Queens" search resolves to. Both Manhattan entries agree (888 city /
891 county), so the city-vs-county choice is not what produced 8–9k.

I could not reproduce a 4,000–5,000 view for Queens on their site. The nearest number on the
portal is **Westchester County, 4,044**. Their Queens County page reads 8,887 under every
filter combination tried. Recorded as unexplained rather than guessed at.

---

## County-by-county parity (the measurement that matters)

Ours = `idx_listings` where `is_active` and `property_type <> 'Rental'` (Active + Pending +
Coming Soon), measured 2026-08-18. Theirs = the onekeymls.com county page, For Sale, no type
filter, same day.

| county | ours | OneKey portal | ratio | delta |
|---|---:|---:|---:|---:|
| queens | 9,068 | 8,887 | 102.0% | +181 |
| westchester | 4,087 | 4,044 | 101.1% | +43 |
| orange | 2,504 | 2,468 | 101.5% | +36 |
| bronx | 2,284 | 2,263 | 100.9% | +21 |
| dutchess | 1,710 | 1,685 | 101.5% | +25 |
| rockland | 1,561 | 1,534 | 101.8% | +27 |
| ulster | 965 | 969 | 99.6% | −4 |
| putnam | 603 | 592 | 101.9% | +11 |
| staten-island | 163 | 164 | 99.4% | −1 |
| **brooklyn** | **1,584** | **1,778** | **89.1%** | **−194** |
| **manhattan** | **494** | **891** | **55.4%** | **−397** |
| **total** | **25,023** | **25,275** | **99.0%** | **−252** |

Counties in OneKey's territory that we deliberately do not ingest, for scale: Nassau 5,767,
Suffolk 7,346, Sullivan 1,332 (their portal also lists Columbia). This is why the feed's
30,717 territory-wide Active count is so much larger than our mirror, and it is by design
(`SERVED_AREAS` in `lib/site.ts`, filtered client-side in `lib/idx/mls-grid.ts`).

Two honest caveats on this table:

- We read **1–2% higher** than the portal in seven counties. Small, in the safe direction, and
  not investigated. Likely candidates: their county pages use a geographic polygon while we use
  the feed's `CountyOrParish` string; their portal also carries the disclaimer *"Some IDX
  listings have been excluded from this website"*; and the two counts were taken minutes apart.
- Brooklyn's −194 is real but only partly explained (below). It is a smaller effect than
  Manhattan's and deserves its own follow-up.

---

## Cause: the missing listings are not in our feed

Method: take listing ids straight off OneKey's own Manhattan county page (their photo CDN paths
carry the OneKey `ListingId` — `.../mlsgrid/onekey/property/M00000489-<id>/...`), check them
against our mirror, then ask the MLS Grid API about the ones we lack. Every probe carried
controls — ids we *do* hold — so a query that silently returned nothing could not be mistaken
for a finding.

**Sample 1 — New York County, default sort, 30 ids.** 21 held, **9 missing**.
**Sample 2 — New York County, `sort=newest`, 30 ids.** 16 held, **14 missing**.
Combined: **23 of 60 (38%) of the Manhattan listings OneKey displays are absent from our
mirror.** The county totals imply 44.6%; the samples agree within sampling noise.

**Are they absent from the mirror, or from the feed?** Three MLS Grid requests settle it:

| request | filter | result |
|---|---|---|
| 1 | `OriginatingSystemName eq 'onekey2' and MlgCanView eq true and ListingId in (9 missing + 3 controls)` | 3 rows — **all 3 controls, none of the 9** |
| 2 | same, **MlgCanView filter removed** | 3 rows — **identical** |
| 3 | `ListingId in (...)` **only** — no originating system, no view flag, no status | 1 row — the control |

Repeated on the second, independent sample: asked for 16 ids (14 missing + 2 controls) with
**no** originating-system, view or status filter — **2 returned, 14 absent**.

Repeated in Brooklyn: 2 ids missing from a 29-id `sort=newest` sample, probed with the same
unfiltered query — **both absent, both controls returned.**

So the rows do not exist in our subscription under the widest question the replication API
permits. Our sync never had the chance to drop them.

The nine Manhattan listings from sample 1 are also absent by **address**, not just by id
(2 River Ter units 8L/21C/24D, 415 E 37th St 27F, 70 Little West St 5K, 269 W 87th St 6A,
136 E 56th St 9J, 63 E 9th St 4O, 440 E 56th St 2B) — the mirror holds no row at any of those
buildings. That rules out an id-format mismatch as the explanation.

---

## Hypotheses, and how each one died

**H1 — IDX display opt-out via `MlgCanView=false`. Mechanism refuted; substance confirmed.**
`OriginatingSystemName eq 'onekey2' and MlgCanView eq false and StandardStatus eq 'Active'`
returns **5 rows** across the entire territory. There is no hidden opt-out population to
un-hide. Withheld listings are not flagged — they are simply never sent. The *effect* the
hypothesis predicted (borough inventory we cannot display) is real; the *mechanism* is upstream
suppression, not a flag we filter on.

**H2 — the owner's number counts something else. Confirmed, and it is the headline.**
8,887 is the Queens County page. Manhattan is 891.

**H3 — county normalisation bug. Refuted.** `normalizeCounty` strips the parenthetical and the
" County" suffix and maps the legal names (`kings`→brooklyn, `new york`→manhattan,
`richmond`→staten-island). The feed rows we do receive carry `New York (Manhattan)` and
`Kings (Brooklyn)` and land correctly — confirmed on live rows returned by the probes. If the
normaliser were dropping rows, the loss would appear in Brooklyn, Staten Island and the Bronx
too; the Bronx (100.9%) and Staten Island (99.4%) are fine.

**H4 — a sync bound. Refuted.** `idx_sync_state`: `baseline_complete=true`, watermark
`2026-08-18T12:03:36Z`, last run `12:07:17Z` — minutes before this measurement, 0 upserted /
0 deactivated on that tick, 1,399 rows updated in the last 24h. A paging or kept-limit bound
would starve counties in proportion to their size, not take 45% out of Manhattan and 0% out of
Queens (the largest county we serve, which we hold at 102%).

**H5 — property-type filtering. Refuted.** Manhattan co-ops and condos are the bulk of what we
*do* hold: 203 Stock Cooperative + 178 Condominium of the 524 active Manhattan rows. They ride
inside RESO `PropertyType='Residential'` as `PropertySubType`, which `SERVED_PROPERTY_TYPES`
includes. OneKey's portal shows 291 Manhattan co-ops for sale against our 203 — the same shortfall
seen everywhere in the borough, not a type we exclude. The withheld addresses are ordinary
condos and co-ops spread across the whole borough (10012, 10021, 10022, 10024, 10036, 10282…),
not one product, one price band or one neighbourhood.

---

## What this means for the business

- **Our counts are correct for what we are licensed to display.** Across the eleven counties we
  serve we hold 99.0% of what OneKey's own consumer portal shows. Nine of eleven counties are at
  99–102%.
- **Manhattan cannot be served completely from this feed.** We are missing roughly 400 of 891
  for-sale listings, and they are withheld upstream. No change in this repo recovers them.
- **Brooklyn is missing roughly 194 (11%)**, same mechanism confirmed on a small sample, rate
  not yet pinned down.
- Everywhere else, including Queens — the borough that actually carries 8,887 listings — we are
  complete.

The one thing worth doing is an email, not a commit: ask MLS Grid / OneKey why ~400 New York
County and ~194 Kings County on-market listings are not present in the `onekey2` replication
dataset for our subscription, and whether that is per-listing IDX opt-out or a scope limit in
our data licence. The answer decides whether the boroughs are recoverable at all.

## No code change proposed

No defect was found in `lib/idx/mls-grid.ts`, `app/api/cron/idx-sync/route.ts` or the county
normaliser. Nothing here justifies touching the sync path, and it was not touched.

One presentational note, offered as an observation rather than a fix: the Active-only county
number (389 for Manhattan) is not comparable to anything a visitor sees on onekeymls.com, whose
counts include Pending and Coming Soon (891). We hold those Pending and Coming Soon rows —
they are simply not in that particular count. Whether the site's public county figures should
match the portal's convention is a product decision, not a bug.

## Cost

Seven MLS Grid DATA-API requests, all `$count` or `$top≤50` id lookups, paced, no media host
touched. Everything else came from Supabase and from read-only browsing of onekeymls.com.
