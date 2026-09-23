# Design round 57: the real map becomes the home page, and it gets finished

Orchestrator's record, opened 2026-09-23. The brief is `docs/handoff/WEBSITE-R57-HANDOFF.md`
(his verdict verbatim in its §1). This file carries the plan, the bar each round has to clear,
and what the orchestrator measured after each builder. Round 56's facts (`DESIGN-ROUND56.md` §3,
§7, §8) stand; nothing here repeats them.

## 1. The bar, in his words and in numbers

His sentence: *"it's not visibly understood that it's New York's five boroughs and Westchester
and up ... show everything from higher ... the map has to be more realistic ... the addresses and
you could click ... needs more polishing."*

What "done" means for each of his four points:

1. **The territory reads without knowing.** At the first steady frame, at 1440 and at 390, the
   frame holds Staten Island, the whole of Long Island's western end, Westchester to the Sound,
   Rockland and Orange, Putnam, Dutchess to Poughkeepsie and the Ulster shore. Our own labels name
   the counties and the boroughs in our type where Google's are too small at that altitude. Test:
   a person who has never seen the site says "New York City and the Hudson Valley" from the
   frame alone, no copy. The frames go in the record.
2. **The map is the picture.** At the territory shot the lights are few and small (a ceiling well
   under the current 350 and a smaller glyph), and they grow only as the camera comes down. The
   imagery is not veiled; scrims sit only under words. Google's POI clutter near our words is
   thinned by a cloud map style if one is available to us.
3. **The address lights are finished.** Hover names the home (town, price, beds and baths when
   cheap) without covering the light; the light brightens on hover and on its featured card's
   focus; a click flies in briefly and opens the listing; a phone tap opens it; the featured
   homes are reachable by keyboard. Every one measured for frame cost.
4. **No freezing, on his terms.** The laptop hitch is measured on HIS machine before we choose
   among flying, hybrid and stills; the chosen one ships behind a flag with the other one switch
   away.

And the standing ledger (`WEBSITE-R55-HANDOFF.md` §6): tsc clean, vitest 1720 and only up, no
horizontal overflow at 1440/768/640/390/320, focus 3:1+, tap 24px+, phone controls 16px+, text
contrast 4.5:1+ on the REAL map pixels at several stops, JS off works (the poster), no WebGL
works, reduced motion cuts, day pages byte-identical, the safety rules, no vendor URL visible
beyond Google's own attribution.

## 2. Process

Fable orchestrates. Opus 5.5 builds, ONE builder at a time (parallel agents freeze this PC),
each round one concern. After every round the orchestrator re-runs the gates and the probes on
the running app, LOOKS at the frames, and writes §4 below before the next round starts. After
the fifth round the orchestrator runs its own polish round as a visitor on a laptop and a phone,
then writes the successor handoff, and only then does the owner look.

## 3. The rounds, with the orchestrator's adversarial notes

### Round 1: the territory shot, then the map becomes the home page

(a) **The opening camera.** Higher and wider than today's hero (120 km range, 50 degrees, from
41.05/-74.2 looking north, which cuts the city off at the bottom of the frame at 1440 and shows
Albany at 390). The camera stands south of the harbour looking north so the city is at the front
and the valley runs up the frame, or stands over the region looking straight enough down that
the whole territory sits in one frame; the builder renders both at 1440 and 390 and keeps the one
where a stranger reads the place. Our own labels for the areas we cover (the boroughs, the
counties; our type, small caps or the site's label style, white, quiet), placed by projection
from `camera.ts` at the steady frame, fading out at the start of the first flight and never
drawn at any other shot (Google's labels take over below). The 390 frame is tall: the territory
is roughly 130 km north to south and 80 km east to west, so portrait fits it at a smaller range;
tune `tall` separately.

Watch for: Google's globe horizon and atmosphere appear when tilt is high at range; the words
need a quiet ground so the sky band, if any, stays thin. The ladder (`cameras.ts`, ratio 2)
will pull Dutchess back toward half the new hero range; phase 1b measured that the ladder's
rule changed nothing on the laptop, so the hero-to-Dutchess step may exceed the ratio if the
lag probe says it costs nothing; assert nothing, measure. The one-shot pre-warm must warm the
NEW hero camera. Our load cover is the night still framed for the OLD hero; re-render it from
the new framing (`scripts/make-night-poster.mjs`) so the dissolve does not also change the
composition.

(b) **The integration.** `app/page.tsx` renders `G3dGround` when `NEXT_PUBLIC_HOME_MAP` is
`g3d` or unset and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is present; `NightGround` otherwise (the
flag `night` forces the night flight; no key means night). At runtime: `gmp-error`, no WebGL and
a blocked script keep the poster for good (a still, our artwork; loading a second WebGL scene
after the first failed is waste); reduced motion shows the map and cuts between shots; JS off is
the poster with the hero words. ONE home page, no copy: the lab page's honest copy and its
query flags move to the home page (`?homes=0`, `?warm=`, `?gate=1`, `?flight=`, `?look=`,
`?scrim=`, `?veil=`), the lab copy at `app/lab/g3d/page.tsx` is deleted, `"/lab/g3d"` leaves
`NIGHT_ROUTES`, and the test in `components/search-instrument.test.ts` that knew about the lab
copy is updated. `/search` untouched. The footer rule in `FooterShell.tsx` for "/" stays.

Gates for round 1: frames at every stop at 1440 and 390 in `scripts/_scratch-r57/1/`, the headed
lag probe cold and warm at both widths, the contrast kit at the new stops, day pages rendered
before and after and diffed at 1440 and 390 (0 pixels), the no-JS probe, the blocked-script
probe (poster stays), the flag `night` (the night flight returns), tsc, vitest only up with tests
for the label placement and the flag resolution.

### Round 2: more realistic, the map is the picture

A lower ceiling and a smaller glyph at the territory shot, growing on the way down; the scrims
tuned by frames; one cloud map ID ("3D Hybrid", light mode) that thins POIs, created by the
builder if the Cloud console allows it and by the owner otherwise (the report says which); the
load cover decided by frames of both (dusk-toned still, or the page's top made day-consistent).

### Round 3: the address lights, finished

The hover label, the brighten, the click's fly-in when steady, the phone's tap-then-open,
keyboard reach for the featured homes, the county chapters from the list; frame cost measured.

### Round 4: the hitch, on his terms

His machine measured (the Chrome extension, or his MacBook), then flying, hybrid or stills
chosen with numbers, built behind a flag.

### Round 5: the fresh-eyes walkthrough

Every page at 1440, 390 and 320; tab everything; the seams between home and /search; slow
network; failed `/api/lights`; failed map; empty; error; 200% zoom; reduced motion; no-JS; no
key; every word of copy; the ledger re-run and written here.

## 4. Measured after each round (orchestrator)

(appended as the rounds close)

### Round 1, the builder's numbers (commits `4ee3fde` `dd07ca6` `5de2953` `ae83446`; for the orchestrator to re-run)

Instruments (gitignored): `scripts/_scratch-r57-frames.mjs` (every stop on `/`, reports how many
territory names are placed), `-lag.mjs` (the round-56b probe on `/`, `--path=`), `-table.mjs`,
`-contrast.mjs` (`--only=`, `--css=`), `-daypages.mjs` / `-daydiff.mjs` (ten day pages),
`-nojs.mjs`, `-blocked.mjs`, `-reduced.mjs`, `-dissolve.mjs`, `-night.mjs`, `-overflow.mjs`,
`-explore.mjs` + `-solve*.mjs` (the composition search), `-count.mjs` (label placement offline).

**The territory shot.** Solved by our projection (ten points of the territory fitted into the
window's free side), then looked at. Kept: 1440 = from south of the harbour looking north (145 km,
tilt 55, heading 8, fov 40); 390 = 156 km, tilt 50, heading 340, fov 62 (the phone's words leave
a ~220 px band; looking NNW puts the city, Long Island and the Sound in it). Frames:
`scripts/_scratch-r57/1/hero-{1440,390}.png`, contact sheets `1/sheet-{1440,390}.png`. Lost
(`scripts/_scratch-r57/1/losing/`): straight down at 15 and 25 degrees (`B15`, `B25`: a road
atlas of New Jersey with the city in a corner); 45 degrees from further back (`A45`: the city
small); on the phone, heading 10 at tilt 35 to 45 (`T35`, `T40`, `T45`: the city under the
count), tilt 60 to 65 (`P60`, `P65`: Montreal and Quebec on the horizon), and a 230 km pull-back
(`Q45`: the territory too small to read). Our names: 11 of 11 placed at 1440, 7 at 390 (on the
phone Google's own "New York" carries Manhattan; the Bronx and Staten Island find no clear spot
beside Google's town names), on at the hero only, off at the other 17 stops at both widths.

**The ladder, measured** (headed, RTX 2060, 144 Hz; the FIRST flight, hero to Dutchess, worst
frame ms / frames over 34 ms; cold twice):

| | exception (Dutchess 60 km, `?ladder=first`) | ladder (Dutchess 72.5 / 78 km, default) |
|---|---|---|
| cold 1440 | 83/27, 63/39 | 76/29, 56/33 |
| warm 1440 | 90/46 | 63/39 |
| cold 390 | **243/5, 271/4** | 118/7, 70/3 |
| warm 390 | 56/6 | 49/4 |

**The lag probe, before (the round-56 lab page, `/lab/g3d`) and after (`/`, final build)**, per
phase worst ms / over 34 ms, and the flights summed. Run-to-run noise on the same build is up to
1.5x on the over-34 counts (round 56 §8).

| | cold 1440 | warm 1440 | cold 390 | warm 390 |
|---|---|---|---|---|
| boot | 500/41 -> 444/51 | 167/55 -> 243/76 | 396/23 -> 542/44 | 174/28 -> 201/46 |
| first flight (to Dutchess) | 118/37 -> 90/53 | 69/49 -> 77/42 | 111/14 -> 90/7 | 70/17 -> 49/1 |
| worst frame, whole scroll | 118 -> **250** | 111 -> 104 | 111 -> 97 | 70 -> 56 |
| flights: sum over 34 | 268 -> 449 | 494 -> 381 | 73 -> 51 | 75 -> 38 |
| over 34 per flight | 15.8 -> 24.9 | 27.4 -> 21.2 | 4.9 -> 3.6 | 5.4 -> 2.5 |
| poster painted / map steady / cover gone (s) | 1.2 / 8.9 / 12.7 -> 0.4 / 8.7 / 12.0 | 0.8 / 7.3 / 10.6 -> 0.4 / 8.0 / 11.6 | 1.0 / 6.3 / 8.9 -> 0.5 / 7.3 / 10.1 | 1.0 / 6.2 / 8.9 -> 0.4 / 5.5 / 9.4 |

**Open: a cold-laptop stall on the flight to Westchester.** Every cold 1440 run on the new build
(nine of nine, including the four diagnostic runs) shows ONE frame of 243 to 264 ms on the flight from the Highlands to Westchester
(before: 118). Not ours by three experiments: no main-thread long task in that window (longtask
observer), the same 257 ms with `?homes=0` (map only), the same 257 ms with our new layers hidden
(the names and the tail veil), and the same 257 ms with Westchester pre-warmed (`?warmBudget=5000`
walks Dutchess, the Highlands and Westchester). Warm runs do not show it (warm 1440 worst: 104).
Hypothesis, unmeasured inside Google's renderer: the higher hero no longer brings in the
mid-level tiles over Westchester that the old 120 km hero did. Round 4's question.

**Contrast** (round-54 kit on the real map pixels, all 18 stops, texts under the floor at p99
outside the logo corner): 1440 = 2 (AI and Connect: the kit reading the pills' own borders, as in
round 56) plus, in one of three runs, the carousel caption caught mid-crossfade at the harbour
(re-run twice: 11.82:1); 390 = **0** (10 text-stops inside the logo hole, faded out on purpose).
Before `ae83446` the phone headline read 1.51:1 because our "Dutchess" stood inside its
column-wide box; with the names hidden it read 11.85:1; the h1 is now `w-fit`.

**Day pages** (ten pages, 1440 and 390, `before` and `before2` rendered on the old build, `final`
and `final2` on this one): 15 of 20 renders 0 px against both. The rest are the instrument or the
data: /buying matches one of the two befores at each width (the two befores differ by 806 / 758
px themselves); /blog 1440 differs 89 to 581 px in its photo cards (the befores differ 492 px from
each other; photo resampling); /connect 1440 differed once by 33,536 px when Google's booking
iframe loaded before the shot, 0 px on the re-run; the listing page differs because the MLS data
changed between the renders ("Data last updated 2:09 -> 3:09 PM", "See all 170 -> 171", one more
photo tile). No file a day page renders changed (`git diff --stat 89a12be` outside the home page:
the deleted lab, lib/site.ts and Header.tsx back to their pre-round-56 bytes, one test).

**No JS** (`/`, 1440 and 390): the poster at opacity 1 carries the hero, the form is a plain GET
(`name="q"`, lands on `/search?q=Beacon`), the featured rail 16 items and the new rail 8, 0 Maps
requests. **Blocked Maps script**: the poster stays on at the top and after scrolling the whole
page, one `[g3d]` warning, no loop, the page scrolls to the footer and reads. **Reduced motion**:
0 `flyCameraTo` calls, the element at Dutchess (72.5 km) 400 ms after the scroll, no console
error, the names on at the top and off after. **`NEXT_PUBLIC_HOME_MAP=night`** (a real production
build): the night flight's canvas, its own copy, 0 Maps requests; rebuilt without the flag.
**Overflow**: 0 px at 1440, 768, 640, 390 and 320, at five scroll positions each. **Gates**: tsc
clean; vitest 1720 -> **1748** (129 files).

**The dissolve**, looked at (`scripts/_scratch-r57/1/dissolve/`): at 1440 the poster is shot from
the map's hero camera and the city's light sits where the map's city appears; the change of look
(night still to daylight imagery) stays the owner's decision (round 2). On the phone the poster is
still the landscape still cropped at 78%, and the phone's camera looks NNW, so the composition
shifts at the dissolve: a portrait poster from the tall camera is the fix (not built).

### Round 1, the orchestrator's verification (2026-09-23, HEAD `7044771`, :3102 on that build)

Re-run, not read: tsc clean; vitest **1748 / 1748** (129 files); `/` answers 200 with the map
ground (`g3d-poster`, the honest caption) and `/lab/g3d` answers 404; fresh hero frames from the
running server (`scripts/_scratch-r57/verify1/`): 1440 = 339 lights drawn, 11 names placed, settle
818 ms; 390 = 200 lights, 7 names, settle 820 ms. The lag probe cold at 1440, my run: the flight
to Westchester's worst frame **277.8 ms** (builder: 243 to 264 on nine runs), the Highlands 131.7,
the rest under 112; so the cold stall is real and reproducible, and the builder's three
experiments (homes off, our layers hidden, Westchester pre-warmed: unchanged) put it inside
Google's renderer. Round 4 owns it.

Looked at: `1/hero-1440.png` reads as the territory (the harbour and Staten Island at the front,
the boroughs, Long Island's west end, the Sound, the valley to Kingston, our eleven names on
land); `1/hero-390.png` reads too (the city, Long Island and the Sound in the band between the
words, seven names). The bar of §1.1 is met at both widths. `1/sheet-1440.png` shows what round
2 is for: the county chapters draw a white carpet of 1,500 lights over Westchester, the Bronx,
Queens and Brooklyn, Google's coloured POI pins clutter the city shots, the hero's left scrim
reads as a dark column over New Jersey, and the harbour and tail stops are near-black under their
veils. `1/dissolve/sheet-390.png` shows the phone's composition jump at the dissolve (the night
still's city glow lower-left, the map's city mid-frame). Round 1 accepted.

### Round 2 brief, refined after round 1 (for builder 2)

Facts first (read in Google's docs in a real browser, `scripts/_scratch-r57-gdocs.mjs`): a cloud
style for a 3D map is made ONLY in the Cloud console (create a map ID on the Map Management page,
create a style choosing "2D hybrid" since 3D preview is unavailable, associate, publish; dark mode
unsupported); there is no API; `map3DElement.mapId` can be set at runtime. The 2D search map has
no map ID. So the builder cannot create one; the owner will, from a five-step recipe in the
report, and the code takes `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` (absent = unstyled) so his ID is one
env var away.

1. **Lights, calm.** Ceilings by altitude, tuned by frames, tested: the territory shot a scatter
   (today 339 at 1440 / 200 at 390 reads as a city blob; the owner's words are "minimalistic,
   not too overcrowded, still balanced"); a county chapter never a carpet (today 1,500); a close
   shot may grow. The glyph smaller and its halo fainter at range (size follows range, tested),
   so lights never merge into blobs; warm white stays. Fewer markers is also cheaper: the boot's
   marker adds and the flights' over-34 counts go in the table, before and after.
2. **Clutter.** Wire the map ID env var. Then decide the mode by frames, since the style is not
   in our hands today: HYBRID (Google's names and POI pins, today) against SATELLITE (imagery
   only) at the county chapters and the city shots, at both widths; check whether `mode` can
   change at runtime (the territory shot may keep HYBRID for orientation while the chapters go
   SATELLITE), and what each costs in frames. Keep the one that reads as the picture; say why.
3. **Scrims and veils.** The hero's left scrim must read as shadow, not a column: wider
   feather, less opacity where the type is large and bold, measured on the real pixels (0 texts
   under 4.5:1 outside the logo corner stays the rule). The harbour and tail veils: let the map
   show through where the words allow, by frames.
4. **The load cover.** Render A: our night still re-graded toward dusk (warmer, lighter, so the
   dissolve into daylight imagery is not a jolt) and, if our own assets allow it, B: the page's
   top made day-consistent (never a Google screenshot). And a PORTRAIT poster shot from the tall
   camera for the phone, so the dissolve keeps the composition at 390 as it does at 1440. Frames
   of the dissolve (before, during, after) at both widths for each; the owner chooses A or B.
5. **The phone territory shot, two edges.** The top edge shows Ottawa, Kingston ON and Watertown
   under the header shade; the bottom shows a pale haze band under the search control. Try tilt
   45 to 48 and a slightly narrower fov, keeping the city, Long Island and the Sound in the band;
   frames decide; the names' placement must still pass its test.
6. **Honest note.** "Map: Google." follows the runtime state (no map, JS off: no claim).

Do not touch: `labels.ts` placement (only its fade timing if a shot changes), the fallback order,
CSP, `/search`, the day pages. Gates as round 1 (frames at every stop both widths, the lag probe
cold and warm both widths, the contrast kit, day pages at 1440, no-JS, tsc, vitest only up with
tests for the ceiling and glyph rules and the map ID resolution, overflow).

### Round 2, the builder's numbers (commits `5bf1943` `73e356d` `ca8a0dc` `9befadd`; for the orchestrator to re-run)

Instruments (gitignored, copies of round 1's as `scripts/_scratch-r57b-*.mjs`, outputs in
`scripts/_scratch-r57/2/`): `-frames` (now prints the mode and glyph per stop), `-lag` (`--q=?mode=`),
`-table`, `-contrast`, `-daypages`/`-daydiff`, `-nojs` (expects the dusk cover), `-blocked`,
`-overflow`, `-dissolve` (`--q=cover=dusk|day`), plus `-phonecam` (sets candidate cameras on the
live element), `-count` (label placement for candidate phone cameras, offline), `-claim` ("Map:
Google." with JS off, the Maps script blocked, the map drawn), `-h1` (the background behind the
phone headline). Baselines on HEAD `6151b2a` before any change: `2/lag/before-*`, `2/day/before-*`.

**1. Lights, calm.** Count, screen gap and glyph follow the range (`cameras.ts` `pxPerLight`,
`ceilingFor`, `budgetFor`, `lightGap`; `glyph.ts` `glyphFor`; tested). Ceiling: one light per
`2000 * (range / 25 km)^0.9` sq px, clamped 2,000..10,000, and 130 from 100 km up, 380 from 25 km,
900 closer. Gap: `17 * (range / 25 km)^0.45` px, clamped 14..30. Glyph: 12 px / halo 0.30 / core 3.7
(of 18 units) from 100 km, 14 / 0.38 / 3.3 from 40 km, 18 / 0.50 / 2.9 closer; featured 16 px (was
24). A first pass at 11 px with the 2.9 core lost the lights on the imagery (`2/a/hero-crop.png`).
Drawn per stop (`1/frames-*.txt` -> `2/final/report-*.json`):

| stop | 1440 before -> after | 390 before -> after |
|---|---|---|
| hero (territory) | 339 -> **130** | 200 -> **32** |
| Dutchess / Highlands / Westchester | 800 / 795 / 796 -> 248 / 380 / 360 | 203 / 201 / 199 -> 59 / 110 / 74 |
| Ulster / Dutchess Co. / Orange / Putnam / Rockland / Westchester Co. | 395 / 495 / 447 / 218 / 359 / 536 -> 148 / 159 / 120 / 112 / 180 / 147 | 192 / 205 / 194 / 133 / 196 / 200 -> 39 / 64 / 34 / 42 / 97 / 69 |
| Bronx / Manhattan / Queens / Brooklyn / Staten Island | 234 / 145 / 655 / 476 / 80 -> 88 / 72 / 228 / 286 / 65 | 168 / 121 / 197 / 200 / 68 -> 67 / 69 / 65 / 138 / 47 |
| harbour / region | 782 / 346 -> 380 / 294 | 204 / 201 -> 124 / 74 |

Looked at (`2/final/sheet-{1440,390}.png`, `2/final/hero-1440.png`): the territory shot is a
scatter of small warm points over the valley and the city, no blob; the county chapters are points
with ground between them; Queens and Brooklyn at 1440 still read as an even lattice (228 / 286), not
a carpet. On the phone the territory's 32 lights are faint beside the words; the phone's chapters
are mostly covered by words anyway.

**2. Clutter.** `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` is wired (`map-options.ts` `mapIdFrom`: absent,
blank or not shaped like a map ID = unstyled; tested). **The owner's recipe** (Cloud console, the
project that owns the site's Maps key): (1) Google Maps Platform > Map Management > Create map ID,
map type **JavaScript**, name it "RealtyLT home"; (2) Map Styles > Create style, choose **2D
hybrid** (3D preview is unavailable; dark mode is unsupported for 3D); (3) in the style, turn Points
of interest off or down (Business, Attractions, Transit stations), keep Locality and Neighborhood
labels, save; (4) Map Management > the new map ID > associate the style; (5) Publish, then put the
map ID in Vercel as `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` and redeploy (a `NEXT_PUBLIC_` variable is read
at build time). Until then the map is unstyled.

**The mode, by frames** (`2/mode/ab-1440.png`, `ab-390.png`: Westchester Co., Orange, Manhattan,
Brooklyn; HYBRID top row, SATELLITE bottom): HYBRID draws coloured POI pins, route shields and street
names over every chapter and they fight our words and lights; SATELLITE is the photograph. `mode`
**is settable at runtime on 3.66**: with `?mode=split` the element reports HYBRID at the hero and
SATELLITE after the first flight, and the frames show the pins gone (`2/mode/split/`). Chosen:
**split** (HYBRID at the territory shot for orientation, SATELLITE everywhere else). Cost, the
headed lag probe on the same build (flights: worst ms / sum of frames over 34 ms):

| | cold 1440 | warm 1440 | cold 390 | warm 390 |
|---|---|---|---|---|
| hybrid everywhere (`?mode=hybrid`) | 243 / 310 | 70 / 145 | 90 / 13 | 56 / 7 |
| split (shipped) | 236 / **111** | 139 / **66** | 91 / 18 | 49 / 8 |

**3. Scrims.** Pad 28 -> 20 px, feather 80 -> 150 px, opacity 0.8 kept: 0.72 and 0.62 with pad 0
failed the chapter list's 15 px labels (3.5 to 4.0:1). The eyebrow and the headline are now their
own quiet blocks; the headline's shade is 0.62 of the full at lg only; the hero's small words carry
a soft text-shadow; the h1's break is explicit so `w-fit` hugs "Let's find" (it had taken the
column, 358 px, and on the phone our Dutchess and Putnam labels sat inside its box: 1.45:1). Mean
brightness of the 1440 words column (x 0..700) 35.6 -> 40.4 (the map right of it 88): lighter under
the headline, but the column still reads darker than the map; see "left". The harbour stop now
shows the map through its words (`2/final/harbour-1440.png`, was near-black); the tail veil is
unchanged (behind the footer's form). Phone: a foot shade while the hero is up takes most of the
ocean's pale band; the logo corner stays clear by the mask, so a little of the band shows there.

**Contrast kit** (18 stops, p99, outside the logo corner): **1440 = 2** (AI and Connect, the pills
the kit misreads, as in rounds 56 and 57.1); **390 = 0** (8 text-stops inside the logo hole, faded
on purpose). Hero at 1440: eyebrow 6.99, h1 7.22, count 10.2, note 5.08. (Run on the build before
the cover's header shade was added; that change touches only the cover, which is gone by then.)

**4. The cover.** `scripts/make-map-cover.mjs` draws each pixel as a ray from the map's hero camera
to the ellipsoid, shaded from our own `public/geo/valley-elevation` (USGS relief, water mask, Black
Marble glow). **A (default, dusk)**: that land at dusk with the night still from the same camera
screen-blended over it; **B (day)**: the same land by day, no lights, `NEXT_PUBLIC_HOME_COVER=day`
(or `?cover=day` to compare). Both wide (1600x1000) and **tall** (780x1688, from the phone's own
camera): dusk 156.8 / 120.2 KB, day 19.1 / 16.3 KB. Dissolve frames (`2/dissolve/sheet-1440.png`,
`sheet-390.png`: before / 150 ms into the fade / 600 ms after, A top, B bottom): the composition
holds at both widths now (the phone's city stays mid-frame); A is still night-to-day but warm and
lit, a softer turn; B meets the daylight imagery in tone but reads as a relief model, not a
photograph. The owner chooses.

**5. The phone's two edges.** Tilt 50 / fov 62 -> tilt 46 / fov 58 (`2/phonecam/sheet*.png`):
Ottawa, Kingston ON and Watertown are gone from the top; the city, Long Island and the Sound stay in
the band. Names placed at 390: 7 (floor 7; fov 56 placed 6). The bottom's pale band is the ocean at
every candidate, so it is shaded (above), not framed away.

**6. Honest note** (`-claim`): JS off: no "Map: Google"; Maps script blocked: none (`load: Google
Maps failed to load`); before the map draws: none; after: shown.

**Lag, before (HEAD `6151b2a`) -> after (final)**, headed, per phase worst ms / over 34:

| | cold 1440 | warm 1440 | cold 390 | warm 390 |
|---|---|---|---|---|
| boot | 542/50 -> 431/40 | 188/41 -> 181/40 | 438/37 -> 403/27 | 180/33 -> 160/22 |
| first flight (to Dutchess) | 90/36 -> 56/7 | 104/46 -> 35/5 | 97/9 -> 35/2 | 49/7 -> 49/2 |
| flight to Westchester, worst | 257 -> **236** | 76, 111 -> 56 | 111 -> 91 | 49 -> 35 |
| flights: worst / sum over 34 | 257/607 -> 236/111 | 118/551 -> 139/66 | 111/82 -> 91/18 | 63/63 -> 49/8 |
| marker adds (whole scroll) | 1046 -> 518 | 1046 -> 518 | 343 -> 150 | 343 -> 150 |
| poster painted / map steady / cover gone (s) | 0.5/9.2/12.4 -> 0.5/7.2/10.4 | 0.5/7.1/10.5 -> 0.5/6.7/10.0 | 0.5/6.7/9.4 -> 0.5/5.3/9.5 | 0.3/5.6/8.2 -> 0.3/4.5/7.1 |

Fewer markers are cheaper: with the new lights and HYBRID kept, the flights' over-34 sum fell 607
-> 310 cold and 551 -> 145 warm at 1440; SATELLITE took it to 111 and 66. The cold 1440 stall on the
flight to Westchester is unchanged in kind (257 before, 243 hybrid, 236 split): not ours, as round 1
found. The warm 1440 worst of 139 was one frame in the upward fling. One run each: round 56 §8
puts run-to-run noise at up to 1.5x on the over-34 counts; these drops are 4x to 8x.

**Day pages** (1440 and 390, `before` on HEAD vs `after`): 16 of 20 at 0 px. /buying 1440 806 px,
and a re-render of the same build (`after2`) is 0 px against `before`; /blog 1440 458 px, and two
renders of the same build differ 62,264 px (photo cards); the listing page is live MLS data (26,726
px at 1440, 57 at 390). No file a day page renders changed (`git diff --stat 6151b2a` outside the
home page's files is empty). **No-JS**: 1440 and 390 OK (the dusk cover at opacity 1, wide and tall
respectively, form GET to `/search?q=Beacon`, rails 16 and 8, 0 Maps requests, no Google claim).
**Blocked script**: the cover stays at the top and after scrolling, one `[g3d]` warning.
**Overflow**: 0 px at 1440, 768, 640, 390, 320 at five scroll positions. **Gates**: tsc clean;
vitest 1748 -> **1767** (131 files).

**Left for the next round**: the 1440 words column still reads as shade over New Jersey (lighter,
not gone; the next lever is a soft share on the count block with its own text-shadow, measured);
Queens and Brooklyn at 1440 read as a lattice and might take a wider near-tier gap; the cover (A or
B) and the map ID are the owner's.

### Round 2, the orchestrator's verification (2026-09-23, HEAD `067b735`, :3102 on that build)

Re-run, not read: tsc clean; vitest **1767 / 1767** (131 files); `/` answers 200; fresh frames
from the running server (`scripts/_scratch-r57/verify2/`): hero 1440 = 130 lights, 11 names;
hero 390 = 32 lights, 7 names (Manhattan now placed); Queens 1440 = 230; hero at 320 x 640 = 20
lights, names off, the h1 breaks "Let's find / home." cleanly, no overflow. The cold lag probe at
1440, my run: flights at p50 7 ms, most with 0 to 3 frames over 34 (round 1: 12 to 34), marker
adds 518 (round 1: 697), the flight to Westchester still one frame of 236 ms (Google's stall,
unchanged as the builder said), the fling up 111 ms. The builder's before/after table holds.

Looked at: `2/final/hero-1440.png`: the lights are a scatter of small points and the imagery
is the picture; the territory still reads; the left scrim still reads as a soft column over New
Jersey (lighter than round 1). `2/final/hero-390.png`: Ottawa gone (Syracuse remains at the
very top, dim), seven names, the band reads; **the 32 phone lights are faint to invisible while
the copy says "every light on the map is one of them"** (round 3 fixes this). `2/final/
sheet-1440.png`: the county chapters and the city shots sit on satellite imagery with a scatter
of lights, no POI pins, no carpet; they carry no town names now (SATELLITE), which reads as the
picture but gives a stranger no orientation inside a county (a round 3/5 option: our own names
for a county's two or three principal towns at the chapter shot, by frames). `2/dissolve/
sheet-1440.png`: cover A (dusk) keeps the composition and softens the night-to-day jolt; B (day)
matches tone but reads as a relief model; A shipped, B one flag away, the owner picks. Round 2
accepted.

### Round 3 brief, refined (for builder 3): the address lights, finished

His words: "the idea ... where it shows the addresses and you could click and it takes you to
that listing, that's great, but it needs more polishing and work."

1. **The hover label.** Appears when the pointer rests over a light (the projection + 14 px hit
   test in `controller.ts`), within 100 ms, one at a time. Content in this order: the town, the
   price, then beds and baths when both are known ("3 bd, 2 ba"; no glyph separators beyond a
   comma or a middle dot). Our type: 13 to 14 px, white on the site's black panel at 8 px radius
   (a chip), a 1 px hairline at low alpha, no shadow blur wider than 12 px, no arrow glyph, no
   "View" verb on desktop (the cursor is the pointer). Placed above and to the right of the light
   with a 10 px offset, flipped left or below when within 24 px of an edge, NEVER covering the
   light or the Google logo corner. Transform-only positioning (no layout on pointermove), 120 ms
   in, 160 ms out, `motion-reduce` = no fade. Fixed and tested: the placement maths (flip rules,
   the never-cover rule) as a pure function.
2. **The light answers.** On hover and on its featured card's focus the light brightens (the
   core to white, the halo about 1.6x) and returns on leave; only one light lit at a time; the
   change is a class or attribute swap on the marker's SVG, never a marker remove/add.
3. **The click.** If the map is steady: a short fly-in (600 to 900 ms, to about 1.5 km range,
   tilt about 60, heading kept) and then the route change to `listingPath(home)`; if the map is
   mid-flight or not steady: route at once. From click to route change never more than 1.0 s.
   Modifier clicks (ctrl, cmd, middle) open the listing in a new tab with no fly-in; the light is
   rendered with a real `href` in its label so "open in new tab" is honest. The fly-in must
   never leave the visitor stranded: if the route change fails, the map stays usable.
4. **The phone.** Tap-then-open: the first tap on a light shows the label with the listing's
   address line as the tap target ("View" is allowed here, no arrow); a second tap on the label
   opens; a tap elsewhere dismisses; the hit target is at least 28 px (the 14 px radius). No
   hover state sticks after a touch. Measured on the 390 probe with `hasTouch`.
5. **Keyboard.** The featured cards already fly the map on focus; on focus the card's light also
   brightens and shows its label; Escape hides it. Google's markers cannot take focus (measured in
   round 56), so the cards are the keyboard path; say so in a comment and in the record.
6. **The county chapters from the list.** In "Where we work", clicking or pressing Enter on a
   county row flies the map to that county and marks the row current, without scrolling the page
   away; the existing scroll-driven chapter flight stays.
7. **Cost.** pointermove work under 2 ms at 1440 with the county carpet's marker count (the
   round-2 ceilings), the label's paint transform-only (no layout in the pointermove path,
   checked in a trace), the fly-in's frames in the lag table, boot unchanged.

Gates: frames of hover (three lights at 1440 including one near the right edge and one near the
logo corner), of the phone's tap state (two at 390), of the focus state (one), and of the fly-in
(three frames); a pointer probe hovering 20 lights at 1440 and tapping 10 at 390 with the click
path timed steady and mid-flight; the lag probe cold and warm at 1440; contrast on the label
(4.5:1+ on the real pixels); tsc; vitest only up with the placement maths and the click policy
tested; overflow at 390 and 320 with a label open near the right edge.

Added after round 2's frames:
8. **The phone's lights must be seen.** At 390 the territory shot draws 32 lights that are faint
   to invisible against the imagery while the copy promises "every light on the map is one of
   them". Raise the phone's territory ceiling and the glyph's smallest tier's brightness until a
   visitor sees a scatter of lights in the band between the words (frames decide, the count and
   the tier in the commit), without going back to a blob; the 1440 shot stays as it is.
9. **Orientation inside a county (optional, by frames).** The chapters are SATELLITE and carry
   no names. Try our own quiet names for two or three principal towns per county at the chapter
   shot (the same label style as the territory names, a smaller size), and keep them only if the
   frames read better; if not, say so and leave it.

### Round 3, the builder's numbers (commits `bea3e46` `b7087d0`; for the orchestrator to re-run)

Instruments (gitignored): `scripts/_scratch-r57c-lights.mjs --mode=desk|phone [--w=320]` (hover
frames, label latency and contrast, the 20-light cost + a 400-move sweep + a trace, the clicks,
the keyboard, the taps, the overflow), `-cost.mjs` (the cost part alone), `-rows.mjs [--phone]`,
`-towns.mjs [--phone]`, `-lag.mjs` (round 2's, plus a `flyin` phase: a click on a light at the
territory shot, its flight logged as its own window; `flyin-setup` is the scroll back up), `-table`,
`-contrast`, `-markerexp.mjs` (can a drawn marker change its look). Outputs in
`scripts/_scratch-r57/3/`. The "before" build is HEAD `3373b62` built in a throwaway worktree and
served on :3103 for the lag probe only (removed after).

**What Google allows, measured first** (`-markerexp.mjs`, `3/exp/sheet.png`): an attribute change
inside a drawn marker's `<template>` does nothing; REPLACING the template redraws the same marker
(no remove/add). So the lit light is a template swap (`controller.ts lightHome/lightFeatured`),
the same size and anchor (it brightens in place: core to pure white, radius +1.6 units, halo x1.6),
and round 56's DOM halo overlay is gone. The same experiment showed our projection ~8 px off
Google's drawing in x at the territory shot, so the label keeps 4 px of slack around the lit glyph.

**1. The hover label** (`interaction.ts placeHoverLabel`, 32 tests incl. "never covers the light"
over a grid at 1440/390/320 and "never on the logo corner"): town (13 px, ink-soft), then price
(14 px semibold) with "3 bd, 2 ba" (13 px) when both are known, on rgba(8,8,8,0.94), 8 px radius,
1 px white/14 hairline, 0 6 12 shadow; above-right, 10 px clear; flips; the last resort keeps a
vertical side. Frames `3/lights/desk/hover-{middle,right-edge,logo-corner}.png` (+ `-full`,
`zoom-*`): middle "Pearl River $1,900,000" above-right; right edge "Far Rockaway $449,000 2 bd, 1 ba"
flipped above-left; logo corner (a light at x 117, y 756 at the Highlands stop) above-right, clear
of the logo. Covers the light: 0 of 3; on the logo: 0. Label shown 4 to 8 ms after the pointer
arrives (p50 5 ms over 20 lights; the town at once, the price when the pins route answers).
Contrast on the real pixels (text hidden, panel kept): town 11.9:1, price 16.5:1 at p99.

**2. The light answers**: `lit()` reports the hovered home on every hover and the featured id on
focus; one at a time; swaps 174 in the cost run, max 0.4 ms each.

**3. The click** (click -> route asked / -> URL changed, ms): steady, fly-in: 616/918, 624/680,
617/669 (the 918 is the first, cold listing render); not steady: 0/32, 0/28. Phone tap-then-open:
steady 700 (390), 665 (320); not steady 39, 39. All under 1,000. The fly-in: 600 ms to a sixth of
the range (floor 1.5 km), tilt 60, heading kept. **Decided by frames**: straight to 1.5 km from the
territory's 145 km, the middle frame was a grey smear of unstreamed tiles; to 24 km it stays the
Hudson all the way (`3/lights/desk/flyin-{120,380,640}.png`, `flyin-sheet.png`: the territory, the
river at the Tappan Zee, the listing). "Not steady" was produced by setting the controller's steady
flag false with the pointer on a light (hover is off while the map flies, so a true mid-flight
click on a light cannot happen); the policy itself is tested.

**4. The phone** (390, `hasTouch`, `3/lights/phone/`): 10 of 10 taps showed the label (4 to 11 ms),
all with the street address and "View", 0 covering the light, the lit light the tapped one; a tap
elsewhere closed 10 of 10 and put the light out; the document cursor stayed "" (no stuck hover).
Frames `tap-1.png` ("New Windsor $69,900 2 bd, 2 ba / 3146 Route 9w #8A View", it covers the
headline for as long as it is open), `tap-2-crop.png`, `tap-right-edge.png`. Label contrast at
390: 11.6 to 18.0:1. The first right-edge frame put the label at y -97 (the header pushed it up
off screen); the last resort was rewritten and tested ("stays on screen and off the phone's
header"); now y 183 at 390 and 153 at 320, inside the window.

**5. Keyboard** (`focus-card.png`, `focus-escape.png`): Tab from "Featured listings" into the rail:
each card's focus lit its featured light and, on landing, showed "Pleasant Valley $1,395,000 3 bd,
2.5 ba" (and the next two cards'); Escape put the label and the light out with the focus still on
the card; Tabbing on left the rail (no trap) and the map went back to the scroll's shot with nothing
lit. The first frame had the home in the middle of the window, under a card, with its label over
the NEXT card; the focus now flies the map so the home stands on open map (`openPoint` +
`cameraShowing`, tested to 2 px): the lit light in the left gutter with its label above the focused
card. Markers cannot take focus on 3.66 (round 56); the comment is in `interaction.ts` and
`G3dGround.tsx`.

**6. Where we work** (`-rows.mjs`, `3/lights/rows/`): click Putnam -> path "/", held "putnam", map
at putnam, row `aria-current`, count "See 373 homes"; Enter on Brooklyn -> same, page scroll moved
0; a 400 px wheel let go (held null); Orange click held, a second click opened `/top-areas/orange`.
(The 34 px on the first click is Playwright scrolling the row into view.)

**7. Cost** at 1440 over Queens (230 lights drawn, the county ceiling): the pointer's whole frame
(hit test + label + glyph swap) over 20 lights and a 400-move sweep: p50 0 / p95 0.5 / **max 0.7
ms**; hit test max 0.1 ms. Trace of 8 hovers: 0 layouts and 0 style recalcs inside pointermove or
rAF handlers. (Before the fix, 2.8 to 3.7 ms max: the canvas font set after the text writes forced a
recalc; measuring first and deferring the price fetch by a task took it under 1 ms.)

**Lag, before (HEAD `3373b62`, :3103) -> after**, headed, per phase worst ms / over 34 (two cold
runs after):

| | cold 1440 | warm 1440 |
|---|---|---|
| boot | 479/30 -> 486/28, 431/29 | 167/31 -> 167/29 |
| to:highlands | 49/3 -> 42/5, 56/2 | 28/0 -> 28/0 |
| to:ulster... / to:harbour | 35/2, 35/2 -> 28/0 + 35/1, 28/0 + 35/1 | 28/0, 21/0 -> 28/0, 28/0 |
| fling:up / fling:down | 77/8, 56/4 -> 139/8 + 56/5, 97/6 + 56/3 | 111/6, 62/15 -> 69/7, 56/6 |
| over-34 per flight / worst per flight (mean) | 4.1 / 64 -> 4.7 / 80, 5.1 / 72 | 5.0 / 57 -> 5.2 / 62 |
| poster / map steady / cover gone (s) | 0.6/7.0/10.2 -> 0.4/6.7/9.9 | 0.3/6.7/9.8 -> 0.3/5.9/9.1 |
| **fly-in** (600 ms flight + 250 ms) | - -> 52 frames, p50 13.9, max 146, 1 over 34 | - -> 71 frames, p50 7, max 139, 1 over 34 |

Boot unchanged. The flights are within round 56's 1.5x run-to-run noise. The fly-in's one long
frame (139 to 153 ms) sits where the route is asked for (620 ms after the click): the listing page's
render; the descent itself runs at p50 7 to 14 ms. (An earlier "after" pair folded the fly-in's
scroll back up into `fling:down`, which read as a regression; the `flyin-setup` phase separates it.)

**8. The phone's lights**: 32 -> **61** drawn at 390 (floor 72, the 30 px gap plans 61), 44 at 320;
the far tier on a phone 14 px / halo 0.46 / core 4.4 (laptop 12 / 0.30 / 3.7, unchanged, 130 at
1440). `3/lights/phone/hero-390.png`: a scatter of points up the valley and across the city between
the headline and the count, no blob. Contrast kit, all 18 stops: **390 = 0 under the floor** (8
text-stops in the logo hole, faded on purpose); 1440 = 2 (AI and Connect, the pills the kit
misreads, as in rounds 56 to 57.2).

**9. Town names, kept** (`3/towns/{orange,queens}-1440-{on,off}.png`): at Orange "Newburgh" on the
river, "Goshen" and "Middletown" inland turn a green photograph into a place; at Queens "Flushing"
and "Jamaica" read among the lights ("Astoria" falls under the words and is not drawn). At 390 the
list covers the map at every county stop, so none is placed (`placed: []`), which is right. Their
contrast is not in the kit (the ground layer is `aria-hidden`, like the territory names); they use
the territory names' shadow.

**Gates**: tsc clean; vitest 1767 -> **1807** (133 files); overflow 0 px at 1440/768/640/390/320
at five scroll positions, and with a label open at the right edge at 390 and 320.

**Probe caveat**: a second page load in the same emulated-phone browser twice stalled before the
map was steady (60 to 150 s); the same load in a fresh browser was fine every time, so the phone
probes start a fresh browser per load. Not seen on a real phone; noted for the orchestrator.

**Left**: the lit light is a real brightening but small at the territory's 12 px (a larger lit
glyph would need a taller SVG whose anchor shifts; not tried); the focus label's gap to its light
is ~30 px at the rail (projection error at 2.6 km); the first click's listing render (918 ms to
the URL) is the thin margin under 1 s; the owner has not seen the fly-in depth decision.

### Round 3, the orchestrator's verification (2026-09-23, HEAD `4cb883f`, :3102 on `b7087d0`)

Re-run, not read: tsc clean; vitest **1807 / 1807** (133 files); `/` answers 200; no stray
worktree (the builder's temporary :3103 worktree is gone); a fresh phone hero from the running
server: 61 lights drawn, 7 names (`scripts/_scratch-r57/verify3/`).

Looked at: `3/lights/desk/hover-right-edge-full.png`: "Far Rockaway, $449,000, 2 bd, 1 ba" on a
black chip above-left of the light near the right edge, quiet, in the site's type; reads well.
`3/lights/desk/flyin-sheet.png`: the territory, then the Hudson at the Tappan Zee 380 ms in with
the hero words still standing, then the listing page; reads as a dive to the home. `3/towns/
orange-1440-ab.png`: Middletown, Goshen and Newburgh in small quiet type turn the Orange chapter
into a place; kept. `3/lights/phone/hero-390.png` and `tap-1.png`: the phone's lights are now a
visible scatter between the words.

Defects for the polish list (not blocking the round):
- **The phone's tap label lands on the headline** (`3/lights/phone/tap-1.png`: the chip for a
  light at New Windsor sits over "Let's find"). The placement avoids the light, the logo corner
  and the header, not the words' boxes. Fix: the label avoids the hero's text boxes the way it
  avoids the header (flip below or beside), tested.
- **The county row's two-click dance.** A row was a link; now the first click holds the map and
  turns the count into an underlined "See N homes", and the second click navigates. Defensible,
  but a link that does not navigate on the first click is a hesitation. Decide in the polish
  round on the running page: keep with a clearer affordance, or make the name the flight and the
  count the link at all times.
- The builder reports our projection about 8 px off Google's drawing at the territory shot and
  about 30 px at the featured rail (the label's anchor drifts from its light). Calibrate in the
  polish round or round 5.
- Option: fade the hero words during the 600 ms fly-in (they stand over the diving map today).

Round 3 accepted.
