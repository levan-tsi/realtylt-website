# Round 28 — the /search map: what the owner is actually seeing, and what was fixed

**The report.** "When you zoom into the cities, some areas are batched in circles but not
distributed properly", the map "is not showing listings properly", and it should display
properties "visibly and properly and aesthetically and not clumped into the places."

Three separate things are inside that sentence. They were measured separately, and they have
three different answers. Screenshots: `docs/map-r28/`. Probe: `scripts/verify-map-zoom-ladder.mjs`.

---

## 1. There are no count circles anywhere. That part of the map is sound.

A zoom ladder was driven over seven markets — Queens, Brooklyn, Yonkers, White Plains, New City,
Poughkeepsie and Ulster — from region zoom down to street zoom, at 1440x900. **Twenty rungs,
zero count circles, zero `[object` labels.** Round 23's replacement of clustering with price
pills and dots is intact, on this tree and on the deployment.

So whatever the owner is looking at, it is not a count bubble. Two candidates remain, and both
turned out to be real.

---

## 2. What he is seeing as "batched in circles": the coordinates are synthetic, and every zip
gets the same fixed-size box.

**This subscription serves no coordinates.** Verified by experiment today, not from a note —
two `$select` calls 1.5s apart against the live feed:

```
A. ListingKey,ListingId,PostalCode,StandardStatus            -> HTTP 200
B. …same + Latitude,Longitude                                -> HTTP 400
   "The field 'Latitude' does not exist or is unable to be retrieved."
```

So `lib/idx/mls-grid.ts#coordsOf` places every listing at its **zip centroid plus a deterministic
jitter**: `lat ± 0.008°`, `lng ± 0.011°`, uniform. That is a **1.77 km x 1.86 km rectangle, the
same size for every zip**, whatever the zip's real shape, size or inventory.

Measured on live data (Queens, `n >= 20` per zip):

| zip | listings | coordinate footprint |
|---|---|---|
| 11354 | 177 | 1.74 km x 1.82 km |
| 11375 | 132 | 1.74 km x 1.84 km |
| 11355 | 126 | 1.75 km x 1.83 km |
| 11374 | 96 | 1.75 km x 1.83 km |
| 11357 | 93 | 1.71 km x 1.85 km |

Every zip, the same box. Median spacing between neighbouring zip centroids in Queens is 1.91 km,
so in a dense borough the boxes roughly tile — but in a city like Yonkers, where zips are far
larger, each zip's entire inventory is compressed into a ~1.8 km patch with **empty ground
between the patches**. A density grid over north-central Queens shows it directly: hard-edged
rectangular concentrations, **57.5% of cells empty**.

At borough zoom the arithmetic is brutal: 1 px is ~58 m at z11, so a zip's 177 homes occupy a
**30 x 32 px square**. That is the "batch". `docs/map-r28/yonkers-r0.png` is the clearest
exhibit — three discrete blobs of pins with Tuckahoe, Bronxville and Eastchester blank between
them, and one blob sitting across the Hudson palisades.

**Not fixed this round, deliberately.** The fix is a data change: a different `coordsOf` plus a
backfill of ~28k stored `lat`/`lng`. `lib/idx` sync code was out of bounds for this round, the
mixed state during a partial re-sync would be worse than either end, and re-placing pins in the
map or the API instead would break bbox agreement — the viewport query filters on the stored
column, so a rendered position that differs from it makes the grid and the map disagree at every
viewport edge. **This is the round's main recommendation and it needs an owner decision.** Two
options, both real:

- **Size the spread to the zip.** Give each zip a radius from the distance to its nearest
  neighbouring centroid (a Voronoi-ish estimate) instead of a constant, and place listings on a
  golden-angle lattice rather than uniform-random — even coverage at every scale instead of
  Poisson clumps and hard edges. No new data needed; `zip-centroids.json` already has what it
  takes. Costs one backfill.
- **Buy real coordinates.** Geocode the street addresses once (they are complete in the feed)
  and store the result. This is the only option that makes the map *true* rather than tidier,
  and it retires the "Locations approximate" caveat.

---

## 3. What "not showing listings properly" actually was: two real defects, both fixed.

### 3a. Zooming onto empty ground deleted the map (the trapdoor)

`components/search/SearchClient.tsx` tested `listings.length === 0` **above** the
`filters.view === "map"` branch, so an empty viewport replaced the entire split with a
full-width "No homes match those filters." panel. The map — the one instrument that could get
the visitor back — was the thing removed, and the copy blamed their filters for what was really
"you zoomed one block too far".

Reproduced on the deployment, not just locally: White Plains, three wheel-zooms in, `.gm-style`
count goes 1 → 1 → 0 with the component root gone (`docs/map-r28/DEFECT-map-gone-1440.png`).

**Fixed:** the empty state now renders as a card **inside the results column**, and the map
panel stays mounted with its viewport intact. The copy is viewport-aware — "No homes in this map
area. / Zoom out or move the map to see more homes." when the grid is scoped to the map, the
original filter copy otherwise — and "Clear all filters" only appears when filters are actually
set. Verified at 1440, 390 and 320 (`docs/map-r28/FIX-empty-viewport-1440.png`,
`empty-390.png`, `empty-320.png`); no horizontal overflow at any width.

### 3b. A 3px separation margin was deleting homes from the map

`components/idx/pin-thinning.ts` decided "is this home hidden?" by testing the anchor against
the **pill collision rect** — which carries `PILL_GAP` (3px) on all four sides, plus a 2px slop
box around the anchor. That rect exists so two labels never touch. It is not a claim about what
a visitor can see. The result: a home whose anchor merely grazed a neighbouring label's
breathing room was dropped from the map entirely.

Measured at street zoom over Poughkeepsie — 15 homes in the viewport, **9 drawn**, and every one
of the six missing was *outside* the neighbouring pill's painted face:

```
DRAWN  (  26, 173) $459K — 38 Kelsey Road
  --   (  35, 151) $500K — 17 Carroll Street     <- 4px above the face, deleted
  --   (  65,  95) $950K — 140 Union Street      <- 4px above the face, deleted
  --   (  86,  73) $450K — 13 Riverview Circle
```

**Fixed:** the visibility test now runs against the pill's **painted face** (no margin) and is a
point test on the dot's centre — a rect covers more than half a dot exactly when it contains its
centre, and half a dot is still a mark you can see and press (the hit target is 24px and reaches
out from under any label). A home genuinely behind a label is still dropped; it could not be
seen either way.

Pinned by `components/idx/pin-thinning.test.ts` — "a home beside a pill keeps its dot". The
first draft of that test placed its fixtures where both rules agree and **passed against the
defect it was written for**; the coordinates now sit in the band that discriminates, and the
test was re-proven failing on the old rule before its green was believed.

---

## The zoom ladder, before and after

Local, 1440x900, five markets x four rungs. "in view" is the API's own count for the settled
viewport box; "drawn" is markers whose anchor is inside the map pane.

BEFORE is the same probe run against the deployment (`BASE=https://realtylt-website.vercel.app`),
so the two columns are the same instrument on the two trees.

| market | zoom | drawn BEFORE | drawn AFTER | in view | change |
|---|---|---|---|---|---|
| Queens | 11 | 202 (40 pill / 162 dot) | **274** (40 / 234) | 3,000 of 5,526 | +36% |
| Queens | 13 | 508 (132 / 376) | **599** (128 / 471) | 1,901 | +18% |
| Queens | 15 | 127 | **146** | 156 | 81% → 94% |
| Queens | 17 | 13 | **13** | 13 | full both |
| Yonkers | 13 | 128 (39 / 89) | **167** (39 / 128) | 352 | +30% |
| Yonkers | 15 | 62 | **68** | 78 | 79% → 87% |
| Yonkers | 17 | 8 | **8** | 8 | full both |
| Yonkers | 19 | **map deleted** | map alive, 0 homes | 0 | trapdoor |
| White Plains | 13 | 85 (38 / 47) | **105** (38 / 67) | 163 | +24% |
| White Plains | 15 | 36 (29 / 7) | **39** (29 / 10) | 43 | 84% → 91% |
| White Plains | 19 | **map deleted** | map alive, 0 homes | 0 | trapdoor |
| Poughkeepsie | 13 | 61 (18 / 43) | **85** (18 / 67) | 265 | +39% |
| Poughkeepsie | 15 | **9** | **14** | 15 | 60% → 93% |
| Poughkeepsie | 17 | **map deleted** | map alive, 0 homes | 0 | trapdoor |
| Ulster | 10 | 77 (45 / 32) | **98** (45 / 53) | 703 | +27% |
| Ulster | 12 | 35 (14 / 21) | **44** (14 / 30) | 81 | +26% |
| Ulster | 14 | **map deleted** | map alive, 0 homes | 0 | trapdoor |

**Four of the five markets lose the map entirely within four zoom steps on the live
deployment.** Only Queens survives the ladder, and only because it still has homes in view at
z17 and z19.

Pill counts are essentially unchanged, so the map is no more crowded with labels than it was;
what rose is the number of homes a visitor can see exists at all. Worst undrawn-to-nearest-marker
gap across all 20 rungs after the fix: **37px**. Orphans (a home with no marker within 60px):
**zero**, at every rung of every market.

---

## The committed gate

`scripts/verify-map-zoom-ladder.mjs` — five markets, four rungs each, ~7 minutes.
Fails on: a count circle, `[object`, the map disappearing, a home drawn nowhere (no marker
within 60px), fewer than 80% drawn when 20 or fewer are in view, or a banner that disagrees with
what was painted.

Proven able to fail three ways by injection (`BREAK=circles|map|orphans`) **and** against
reality: run with `BASE=https://realtylt-website.vercel.app` it reports, on the current
deployment,

```
FAIL yonkers r3:      THE MAP IS GONE (component root removed)
FAIL whiteplains r3:  THE MAP IS GONE (component root removed)
FAIL poughkeepsie r1: only 9 of 15 homes drawn (60%) — at 20 or fewer there is room for at least 80%
FAIL poughkeepsie r2: THE MAP IS GONE (component root removed)
FAIL ulster r2:       THE MAP IS GONE (component root removed)
5 failure(s) across 18 rungs.
```

— exactly the two defects this round fixed, in four of five markets. On this tree it passes
**20/20 rungs**. A gate that reports green on the fixed tree and red on the tree that carries
the defect is the only kind worth committing.

---

## Instrument faults found along the way (all of them read as app defects first)

Recorded because each cost real time and each would recur.

1. **Clipping markers to the window instead of the map pane.** At 1440x900 the map pane is
   757x754 and runs below the fold; the app asks the API for the *pane's* bounds. Intersecting
   with the window reported a third of the drawn markers missing — "88 of 155 with 70% of the
   pane empty" was entirely this.
2. **Clipping on a marker's box centre instead of its anchor.** A pill hangs above its anchor, so
   its box centre sits ~12px higher; pills near the top edge were counted as undrawn and became
   phantom orphans (one showed as a 157px gap).
3. **One map box held for a whole ladder.** When a rung emptied the results column the page
   shortened and the sticky map moved, so the wheel landed off it — which read as the map zooming
   itself back out (Poughkeepsie z17 → z14). Re-read the box before every wheel.
4. **One page reused across markets.** Every second market hung on settle. Each passed when run
   alone. A fresh page per market.
5. **Settling on "there are markers".** Zero markers is a legitimate settled state at street
   zoom; the ladder hung forever on it.
6. **The location dropdown that opens itself on every `?city=`/`?q=` deep link is
   DEVELOPMENT ONLY.** `LocationSuggest` has a `firstRunRef` guard against exactly this, and
   React Strict Mode's double-invoked effects consume it on the first pass. Checked against the
   deployment: clean there, at 3s, 6s and 12s, on both URL shapes. Not a defect, not changed —
   but it sits over the results column in every dev screenshot of a city search, so shoot
   `?county=` URLs when a clean frame is wanted.

---

## Found, not fixed

- **The synthetic coordinates** (§2) — the round's main recommendation, needs an owner decision
  and a backfill.
- **The phone map sits ~48,000px down the page** in map view: all 150 result cards render above
  it, and the Google map is not constructed until it is near the viewport, so on arrival there is
  no map at all. The MAP toggle scrolls to it (round 25's fix) and that works. The ordering was
  round 25's deliberate call — listings lead on a phone — so it was left alone, but "map view"
  meaning "fifty-seven screens of cards, then a map" is worth revisiting.
- **Tabbing between markers goes through Google's own focus layer.** The markers are real
  buttons and carry `tabIndex 0`, but a Tab pressed on one lands on an unclassed `<div>` that
  the Maps SDK owns, and twelve further Tabs never reach the next marker. Measured identically
  on the deployment, so it is pre-existing and nothing this round touched — but "focus a pin,
  Enter to pin it" is a contract the code deliberately implements (`click` with `detail === 0`)
  and a keyboard visitor may not be able to reach it. Worth its own round.
- **`PIN_CAP` (3,000) binds at borough zoom** — Queens z11 has 5,529 homes in view and 3,000 are
  fetched. It changes nothing on screen (the blobs saturate at 274 markers long before the cap)
  and the banner reports the true total, so this is honest today. It would start to matter if §2
  were fixed and the pins spread out.

---

# Round 28, adversarial review

A second pass whose brief was to refute the above. Markets round 28 never used
(New Rochelle, Mount Vernon, Newburgh, Carmel, Suffern), a separately written probe, and the
database instead of the doc. What follows is what changed; everything not listed here was
re-measured and held.

## Confirmed

- **The trapdoor (§3a).** Five fresh markets, driven to an empty viewport by wheel (2–7 steps):
  map alive every time, viewport-aware copy, no horizontal overflow, and zooming back out
  repopulated both the map and the column in all five. The empty card was also checked at 1440,
  390 and 320 by forcing the state with an impossible price floor: 193x44 button inside a 288px
  card at 320, zero overflow at every width.
- **The margin fix (§3b) — direction and size.** Re-derived as a true A/B: same tree, same data,
  one line differing. Drawn markers rose at every rung that had dots (+3% to +43%), pill counts
  were IDENTICAL at all eleven rungs, worst undrawn gap fell in every market, and the two >30px
  gaps the old rule left in Mount Vernon went to zero.
- **The gate can fail (§ committed gate).** Its three injections all exit 1, and with the exact
  pre-round-28 planner restored it reports `poughkeepsie r1: only 9 of 15 homes drawn (60%)` —
  reproducing the doc's own number independently.
- **The coordinates (§2), from the DATABASE alone.** 283 zips with 20+ listings, 31,840 rows:
  every row inside its own zip's box, none outside. Worst deviation 0.007996 lat / 0.010989 lng
  against caps of 0.008 / 0.011. Real geography cannot do that. Separately, ONE MLS Grid request
  returned `400 — The field 'Latitude' does not exist or is unable to be retrieved.`
  Also: **60 rows carry no coordinates at all** (zip absent from the centroid table) and can
  never appear on the map.

## Corrected

- **"The visibility test now runs against the pill's painted face" was not true.** The box was
  modelled flush to the anchor (y-18..y). The chip button carries 4px of transparent padding
  whose bottom edge sits on the anchor, and that padding doubles as the teardrop tail, so the
  ink runs y-21..y-4 — measured on 50 of 50 rendered chips, no spread. The box was 4px off in a
  17px element, and the new test's `justAbove` fixture had been placed at y-19.5, INSIDE the
  real face: the suite was asserting that a home buried under a label should be drawn.
- **A dot could still be buried.** A dot is tested only against pills placed BEFORE it, but
  priority order keeps accepting pills afterwards and both engines paint every dot UNDER every
  pill. 21 dots across three markets had their centre inside painted ink, up to 96% of the mark
  covered, each counting itself in "N of M homes shown". Fixed; buried dots are now 0 at every
  rung and the worst covered mark is 49%, which is what "half a dot is still visible" means.
- **The trapdoor had a second door.** The `state === "error"` branch also sat above the map
  branch, and in map view the grid refetches on EVERY settle — so one failed request during an
  ordinary wheel-zoom deleted a working map drawn from a DIFFERENT endpoint. Reproduced with a
  settled 77-marker map and a single aborted `/api/idx/search`. Fixed the same way.
- **The keyboard finding's mechanism.** Tab from a marker does not land on "an unclassed div":
  it lands in the popup that the focus opened (Close, Save, Prev, Next, View Listing), then in
  Google's own controls, and never on another marker — 14 Tabs, confirmed. `Enter` on a focused
  marker DOES open the popup, so that contract is intact. The deeper cause is that
  `overlay.draw()` clears the container with `innerHTML = ""` and rebuilds every marker, so any
  redraw destroys the focused node and focus falls to `<body>`. Still worth its own round: the
  cheap repair is to remember the focused pin id across a draw and restore it, but that runs
  straight through the popup's hard-won open/close guards and should not be bolted on at the
  end of a review.

## Open

- **The gate's coverage rule has a blind band.** It only checks the drawn share when 20 or fewer
  homes are in view. Carmel z14 draws 18 of 25 (72%) on the fixed tree and the gate says nothing;
  with the old planner, White Plains z13 fell 105 -> 85 drawn and still passed. The 80%-at-20
  threshold is fitted to observed data, not derived.
- **`scripts/verify-map-markers.mjs` cannot fail.** 48 lines, no assertion, no `process.exit`,
  always green. It is a round-23 diagnostic wearing a `verify-` name, and the zoom ladder now
  covers what it was watching. It should be renamed to `_scratch-` or deleted.
- **Dots may overlap each other.** `DOT_CLEARANCE` is 10px tested as a box, but the painted mark
  is 12px inside a 2px ring, so two dots 11px apart both survive and their ink touches. Left
  alone deliberately: tightening it would DELETE homes, which is the opposite of this round.
