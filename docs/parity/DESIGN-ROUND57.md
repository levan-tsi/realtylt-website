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

### Round 4 brief (for builder 4): the hitch, on this machine's terms

What the orchestrator tried first (2026-09-23): the Claude-in-Chrome extension IS connected on
this PC, so the page was opened in the owner's own Chrome at `http://127.0.0.1:3102/` to run an
in-page frame probe. It could not measure: the extension's tab reported `visibilityState:
"hidden"` for over 100 s (its window is not the active one on this desktop and could not be
raised from here), so Chrome paused rendering and Google's map never reached steady (`drawn 0`,
no error, WebGL fine: "ANGLE NVIDIA GeForce RTX 2060 D3D11"). The tab was closed. So the
measurement in his Chrome needs him to keep the tab in front, and his MacBook stays unmeasured.
For the Windows side this PC IS his machine: the headed Playwright Chrome uses the same binary,
the same GPU and the same 144 Hz screen, only the profile differs. Round 4 decides on those
numbers and leaves the other option one switch away.

The numbers that decide (orchestrator's own cold runs on `067b735` and the builders' tables):
flights at p50 7 ms with 0 to 3 frames over 34 each; ONE frame of 236 to 278 ms on the flight
from the Highlands to Westchester, cold only, every run (nine of nine for builder 1, two of two
for the orchestrator), unchanged by homes off, our layers hidden, Westchester pre-warmed, split
mode or the lighter markers; warm runs' worst 104 to 139 ms; the phone (390, emulated) worst 91
cold / 49 warm with no such stall; boot's 430 to 500 ms frames sit under the cover.

1. **Diagnose the Westchester stall by experiment**, cold, five runs each, the lag probe's
   per-flight window, before touching anything else: (a) the Westchester camera at three
   variants (range 40 / 48 / 60 km, tilt 45 / 50, the heading kept or turned): does the stall
   follow the camera or the destination? (b) a two-leg flight through an intermediate camera at
   the geometric mean range (two `flyCameraTo`): does splitting the level-of-detail change split
   the stall? (c) the flight's duration 2.35 s to 3.2 s; (d) a pre-warm that flies the exact
   Highlands-to-Westchester path once under the cover (today's pre-warm flies the hero only);
   (e) the mode change: HYBRID at the hero and SATELLITE below since round 2; does forcing one
   mode for the whole page move the stall? Every experiment its own table row; the best one
   ships if it removes the stall at no cost elsewhere (the other flights, boot, the phone), with
   a test where there is logic.
2. **If nothing removes it, build the CUT option behind a flag**, `NEXT_PUBLIC_HOME_FLIGHTS`
   = `fly` (default) | `cut`, and `?flights=cut` for a look: a section change dips the veil to
   near black over 200 ms, the camera jumps (the reduced-motion path already does this: no
   `flyCameraTo`), and the veil lifts when the map reports steady, so the visitor sees a fade,
   never tiles filling in. Measured cold at 1440: the worst frame during a cut, and the time from
   the scroll to the lifted veil. Phones keep flying whatever the flag says (their flights are
   clean).
3. **Record and report**: the experiment table, the option shipped as default and why, the
   owner's sentence (what he will see on a laptop, cold, on the first visit, and on a phone), and
   what the MacBook measurement would need from him.

Gates: the lag probe cold x5 and warm x2 at 1440 and cold x2 at 390 on the shipped build (per
flight worst / over 34, boot, marker adds); frames at every stop both widths if any camera moved
(and the contrast kit at that stop); tsc; vitest only up; overflow. Do not touch the address
lights, the labels, the covers, CSP, `/search`, the day pages.

### Round 4, the builder's numbers (commit `0b901fa`; for the orchestrator to re-run)

Instruments (gitignored): `scripts/_scratch-r57d-lag.mjs` (the round-57 lag probe plus the worst
frame's offset inside each flight, `--chrome=` for Chrome flags, `--coverShot` for a screenshot at
the reveal, and whether the map was steady when the cover left), `-sum.mjs` (one row from N runs),
`-shots.mjs` (the per-flight table), `-exp.sh` (N cold runs per query), `-overflow.mjs`. Outputs
in `scripts/_scratch-r57/4/` (`lag/*-summary.json`, `rows*.txt`, `lag/*-reveal.png`). Headed
Chrome, RTX 2060, 144 Hz, 1440 x 900; cold = a fresh profile every run; runs where Google's
script failed to load (e2-4, f7-3: `load: Cannot read properties of undefined`) are dropped and
said so.

**The finding: the stall is a one-time GPU shader compile inside Google's renderer, not tiles.**
The two decisive rows are the profile experiments (a warm profile is one untimed pass first):

| profile | Westchester flight worst, ms |
|---|---|
| cold (fresh), five runs | 236 / 236 / 243 / 229 / 236 |
| warm, as is | 56 / 49 |
| warm, `--disable-gpu-shader-disk-cache` (HTTP cache warm) | 229 / 236 / 243 |
| warm, HTTP cache and code cache deleted, shader cache kept | 48 / 48 |

The frame comes 375 to 395 ms into the flight, every run. Only a FLIGHT along that path compiles
the shader: round 57's pre-warm that JUMPED to Westchester left it (orchestrator's `diag-warm5`).

**The experiment table** (cold, five runs each unless said; "other flights" = every other flight
of the scroll; medians; cover = the poster gone, ms after navigation):

| row | query | Westchester worst (each run) | Westchester over 34 | other flights worst, med | other over-34 sum, med | boot worst, med | cover, med |
|---|---|---|---|---|---|---|---|
| base (before, `4a6bc03` code) | - | 236/236/243/229/236 | 2-3 | 91 | 70 | 424 | 10045 |
| base, rebuilt with the switches | - | 229/236/243/236/236 | 2-3 | 104 | 60 | 424 | 10044 |
| a1: 40 km, tilt 50 | `?cam=westchester:40000,50,250` | 236/236/236/243/236 | 3 | 83 | 63 | 424 | 10219 |
| a2: 60 km, tilt 45 | `?cam=westchester:60000,45,250` | 243/229/236/229/229 | 2-4 | 97 | 85 | 424 | 10069 |
| a3: 48 km, heading kept (no turn) | `?cam=westchester:48000,50,185` | 236/236/236/243/236 | 3-4 | 104 | 58 | 417 | 9866 |
| b: two legs, geometric-mean camera | `?legs=2` | 236/243/236/28/28 | 0-3 | **236** (the stall moved to the next flight) | 81 | 424 | 10165 |
| c: 3.2 s flight | `?dur=westchester:3200` | 236/236/243/243/236 | 2-4 | 83 | 56 | 424 | 10139 |
| e1: HYBRID everywhere | `?mode=hybrid` | 236/243/243/243/243 | 5-10 | 84 | 164 | 431 | 10216 |
| e2: SATELLITE everywhere (4 runs) | `?mode=satellite` | 236/229/236/229 | 2-3 | 70 | **21** | 417 | **8046** |
| d: pre-warm flies the exact path (2.35 s) | `?warm=path&warmShots=highlands,westchester&warmBudget=20000` | **35/28/28/35/35** | 0-1 | 83 | 66 | 424 | 16318 |
| f1: Dutchess set, 400 ms flight | `...warmShots=dutchess,westchester&warmFly=400` | 104/97/97/90/97 | 1-3 | 97 | 62 | 438 | 14317 |
| f2: Highlands set, 400 ms flight | `...warmShots=highlands,westchester&warmFly=400` | 28/35/49/28/28 | 0-1 | 97 | 67 | 431 | 14351 |
| f4: from the hero, 400 ms flight | `...warmShots=hero,westchester&warmFly=400` | 243/243/236/236/236 | 2-3 | 97 | 63 | 431 | 12944 |
| f3: f2, each step waits at most 600 ms | `...&warmSettle=600` | 28/35/28/35/35 | 0-1 | 83 | 65 | 431 | 12771 |
| f5: hero, Highlands, Westchester, 600 ms | `...warmShots=hero,highlands,westchester...` | 35/28/42/28/28 | 0-2 | 118 | 60 | 431 | 13265 |
| f6: f3, map opened at the Highlands | `...&warmOpen=1` | 28/42/42/35/28 | 0-2 | 97 | 63 | 424 | 11053; with the return capped at 2.5 s, 9294 but **the hero unsteady at the reveal** (3 of 3) |
| **f7: f3, the return waits at most 2 s (shipped)** (4 runs) | `...&warmSettle=600&warmBack=2000` | **42/42/28/28** | 0-2 | 76 | 51 | 430 | 10723 |

What the rows say: the stall does not follow the camera (a1 to a3), the duration (c) or the mode
(e1, e2); splitting the flight moves it (b); the path has to be FLOWN from the Highlands (f1 from
Dutchess leaves 97 ms, f4 from the hero leaves 236); the flight can be short (400 ms). The walk's
return to the hero never reports steady inside 4 s after that flight, so it waits 2 s (f7) and
the reveal screenshots (`lag/rv-*-reveal.png`, three runs each of base, f3, f7) show the same
drawn territory as before, the map steady at the reveal in every run; opening the map at the
Highlands (f6) saves a second but reveals an unsteady hero, so it lost. Side finding for the
orchestrator: SATELLITE everywhere (e2) cleans the other flights (over-34 sum 21 against 60 to 70)
and draws 2 s sooner, but the territory shot loses Google's names that round 2 kept on purpose;
not shipped, one query away.

**Shipped as the default** (`warm-plan.ts`, 5 tests; `lab-query.ts`, 7 tests): on a window 640 px
and wider that opens at the territory shot, the walk under the poster sets the Highlands (waits at
most 600 ms), flies to Westchester in 400 ms (waits at most 600 ms), returns to the hero (waits at
most 2 s), then reveals. A phone, or a page opened mid-scroll, keeps the round-56 one-shot jump.
The cut option was NOT built: the stall is removed.

**The shipped build's lag table** (`0b901fa`, per flight on the way down then the flings; median
worst ms / median frames over 34, max worst in brackets):

| flight | before, cold x5 | shipped, cold x5 | shipped, warm x2 | shipped, 390 cold x2 |
|---|---|---|---|---|
| to Dutchess | 56 / 6 (63) | 56 / 5 (56) | 35 / 2 | 35 / 1 |
| to the Highlands | 56 / 4 (70) | 56 / 4 (69) | 35 / 1 | 21 / 0 |
| **to Westchester** | **236 / 2 (243)** | **28 / 0 (56)** | 28 / 0 (35) | 90 / 2 |
| Dutchess County | 42 / 2 (56) | 48 / 1 (56) | 21 / 0 | 49 / 2 |
| Manhattan, Queens, Brooklyn | 42-49 / 2-3 (56) | 48-56 / 2-3 (56) | 21-35 / 0-3 | 49 / 2 |
| Staten Island | 91 / 4 (125) | 97 / 4 (132) | 35 / 1 (125) | 49 / 2 |
| fling up (Brooklyn, Queens, hero) | 91 / 11-12 (125) | 97 / 12 (132) | 125 / 5-8 | 49 / 2 |
| fling down (Westchester to the region) | 28-42 / 0-3 | 28-42 / 0-3 | 21-28 / 0 | 7-21 / 0 |
| worst flight frame of the scroll (median of runs) | 236 | 97 | 125 | 90 |
| boot worst / over 34 (under the poster) | 424 / 29 | 431 / 31 | 160 / 28 | 396 / 21 |
| poster gone, ms (median) | 10045 | 10936 | 9898 | 9680 |
| marker adds (median; during flights) | 518 (0) | 518 (0) | 518 (0) | 179 (0) |

The remaining worst frames (97 to 132 ms at Staten Island and the fling back up) were there before,
warm too, so they are not this shader; they are round 56's streaming hitches.

Gates: tsc clean; vitest **1807 -> 1819** (135 files); no horizontal overflow on `/` at 1440, 390
and 320 (scrollWidth = clientWidth). No camera moved, so no new stop frames or contrast runs; the
reveal frames are `lag/shipcold-*-reveal.png`.

**The owner's sentence.** On his laptop, cold, first visit: the poster for about 11 seconds (one
second longer than before), then the map, and every section flight runs at 60 to 144 fps with
short hitches of 50 to 130 ms; the quarter-second freeze on the way into Westchester is gone. If he
scrolls before the poster lifts, the warm-up stops and he may meet that freeze once. On a phone:
nothing changed; the flights were already clean (worst 90 ms).

**What the MacBook measurement needs from him.** The stall is a shader compile, so it depends on
the GPU and its driver: on the Mac (Metal, not ANGLE on D3D11) it may be longer, shorter or absent,
and another path may compile its own. We need him to open `http://<this PC>:3102/` or the preview
in Chrome on the MacBook, in a fresh guest window (a cold shader cache), keep the tab in front,
scroll once top to bottom slowly, and either run the lag probe there (Node and Playwright on the
Mac) or leave the Claude-in-Chrome extension connected with that window in front so an in-page
frame log can run. Twice: once as shipped, once with `?warm=full` (the old walk) to see whether
the Mac has this stall at all.

### Round 4, the orchestrator's verification (2026-09-23, HEAD `61f4d4a`, :3102 on `0b901fa`)

Re-run, not read: tsc clean; vitest **1819 / 1819** (135 files); `/` answers 200; no extra
worktree. The cold lag probe at 1440, my run on the shipped build: the flight to Westchester
worst frame **27.9 ms, 0 over 34** (rounds 1 to 3: 236 to 278 every cold run); the Highlands
69.6; the worst flight frame of the whole scroll 83.4 (the fling up); marker adds 518; first
steady 7.5 s; the cover gone at 11.2 s (about a second later than before, as the builder said).
The warm plan's two steps logged `ok:false` (their waits of 600 and 1,028 ms ran out before the
map called itself steady) and the compile still happened, which is the point. The shader-compile
diagnosis stands on the builder's profile experiments (the stall returns with Chrome's shader
disk cache off, stays gone with the web cache deleted). Round 4 accepted.

Carried to round 5: a visitor who scrolls under the cover in the first ~11 s stops the warm-up
and may meet the freeze once (unmeasured); two of the builder's runs lost Google's script at
load (the poster-stays path must hold); the MacBook stays unmeasured and needs the owner.

### Round 5 brief (for builder 5): the fresh-eyes walkthrough on the real-map build

The walkthrough that never ran. Move through the site as a visitor would, on a laptop (1440)
and a phone (390), front to back, and fix what makes you hesitate; then the states nobody
styled. Everything below is a defect list to close plus a sweep to run; each fix its own commit
with the frame that shows it.

A. Known defects (from rounds 1 to 4, all looked at by the orchestrator):
1. The phone's tap label lands on the hero words (`scripts/_scratch-r57/3/lights/phone/
   tap-1.png`): the label placement avoids the light, the logo corner and the header, not the
   hero's text boxes. Make it avoid the words' boxes (flip below or beside; the `data-g3d-avoid`
   idea already exists for the scroll cue), tested in `interaction.ts`.
2. The county row's two clicks: today the first click holds the map and turns the count into
   an underlined "See N homes", the second navigates. Decide on the running page: keep it with
   a clearer affordance (the count reads as the link from the start, the row's name as the
   flight), or make every click navigate and let hover or focus preview the flight. Whatever
   you choose, a visitor must never click a row and see nothing happen.
3. The label's anchor drifts from its light: about 8 px at the territory shot, about 30 px at
   the featured rail (builder 3's report). Calibrate the projection against Google's drawn
   positions (a marker's screen position can be read from a probe by pixel), or anchor the
   label to the marker element's own box if maps 3.66 exposes it; the label must sit on its
   light at every stop within 4 px.
4. The hero words stand over the map during the 600 ms fly-in to a listing; fade them (and the
   search control) over the first 200 ms so the dive is the picture; `motion-reduce` skips the
   fly-in already.
5. The town names' contrast is not measured; measure it with the kit at the chapters (4.5:1+
   on the real pixels) and adjust the halo if needed.
6. The 1440 hero's left scrim still reads as a soft column over New Jersey (builder 2's own
   note: mean brightness 40 against 88 for the map): try a lighter shade on the count block
   plus its own text-shadow, measured with the kit; the h1 does not need the shade the small
   text needs.
7. The phone's bottom edge shows a blue-grey glow under the Google logo (the foot shade over
   the Atlantic's haze); make it read as the map's own atmosphere or shade it fully; frames.
8. "Syracuse" at the phone's top edge under the header shade; harmless, but check it is dim
   enough not to read as a claim; if not, one more degree of tilt or the header shade a touch
   deeper at 390.

B. The sweep (every item a frame or a number in the record):
- Every page at 1440, 390 and 320: `/`, `/search` (list and map), a listing page, `/buying`,
  `/selling`, `/financing`, `/home-value`, `/who-we-are`, `/connect`, `/plan`, `/reviews`,
  `/blog` and one post, `/top-areas/<county>`, `/saved`, `/sitemap`, `/thank-you`; the day pages
  must be byte-identical to a render from `main` at 1440 and 390 (explain any diff by live data).
- Tab through the home page end to end: focus visible on every control (3:1+), no trap, the
  order sensible, the featured cards fly the map and light their home, Escape hides the label,
  the county rows reachable, the chat launcher reachable, the search suggest reachable.
- The seams: home search to `/search` (the query carried, the map there as it was), a light's
  click to the listing and back (the home page returns to the shot where it was, no double
  map load: count the Maps script loads and `Map3DElement` constructions per navigation).
- Slow network (Playwright `route` with a 3 s delay on the Maps script and on `/api/lights`):
  the cover holds, the words read, nothing jumps (CLS measured), the lights arrive quietly.
- Failed `/api/lights` (500 and a network abort): the map draws without lights, the copy still
  reads honestly (the "every light" sentence must not lie when there are none: decide what the
  caption says with 0 lights), no console error loop.
- Failed map (`gmp-error` simulated, and the script blocked): the cover stays, the caption
  makes no Google claim, the page scrolls and reads to the footer, the search works.
- Empty and error states of the featured rails (0 listings, a failed fetch): the rail's own
  empty state, no blank band.
- 200 % zoom at 1440 (a 720 px effective viewport): no overflow, the words wrap, the map still
  the ground, the labels placed or off.
- Reduced motion: cuts, no flights, no fades that read as motion, the cover dissolve instant.
- No JS: the cover carries the hero at both widths, the form is a plain GET, both rails render,
  the footer reads.
- No key (`NEXT_PUBLIC_HOME_MAP=night` or the key absent at build): the night flight returns
  with its own copy (prove with one frame; a real build or the tested resolver plus a dev frame).
- Every word of copy on the home page read aloud once: no em dashes, no arrow glyphs, no vendor
  name beyond Google's own attribution, the count sentence true at 0 and at 15,000 lights, the
  caption honest in every state.
- The ledger re-run and written into the record: tsc, vitest, LCP and CLS at 1440 and 390
  (production build), overflow at 1440/768/640/390/320, focus, tap targets, contrast at several
  stops, no-JS, no WebGL, reduced motion, day pages byte-identical, the safety rules.

Do not touch: CSP, `/search`'s own code, the covers' artwork, `lib/site.ts`, `Header.tsx`
(except a focus-order fix if the sweep finds one, named in the commit).

Added after round 4:
9. The early scroll under the cover: measure a scroll at 3 s and at 6 s after navigation (cold,
   1440): does the visitor meet the Westchester freeze once? If yes, decide by numbers: hold
   the cover until the warm path completes (bounded, about 1.6 s more at worst) or let the
   scroll lift it and accept one freeze; the cover must never hold past 14 s.
10. Google's script failing to load (seen twice in round 4's runs): prove the poster-stays path
    on a simulated failure (abort the script route on the first request only, then let it
    through on reload), no console error loop, the caption honest.

### Round 5, the builder's numbers (commits `42592fe`..`69fe7bf`; for the orchestrator to re-run)

Production build on :3102 (HEAD `69fe7bf`), headed Chrome, RTX 2060, cold profiles. Instruments
(gitignored): `scripts/_scratch-r57e-*.mjs`; outputs under `scripts/_scratch-r57/5/`. The
orchestrator's re-scope (the next round turns the map dark) arrived after A5 to A8 were already
built and committed; they stand as commits and can be reverted one by one if the dark round
replaces them. The LCP ledger and the contrast kit at six stops were NOT re-run (re-scope).

**A3, the projection (the next round depends on it).** Measured by pixel (`-calib.mjs`: each drawn
light's template swapped for a red dot, its centroid against our projection's anchor).

| stop | before dx / dy, max | after dx / dy, max |
|---|---|---|
| hero, Dutchess County, Orange, Queens, Manhattan (5 to 7 lights each) | -8.5 to -8.7 / -1.6 to -2.2, 9.1 px | -1.0 to -1.3 / -1.3 to -1.5, **2.3 px** |
| featured rail (2.6 km, the focused card's light) | (after the first fix) -0.9 / **-8.7** | 1.8 / 0.6, **1.9 px** |

Two causes, both found by the SHAPE of the error: (1) a constant 8.6 px in x at every range = the
window, not the maths: `innerWidth` counts the 17 px scrollbar, the map element does not, so our
centre sat half a scrollbar right of Google's (`controller.view()` now reads the element's client
size; the territory names, the towns and the focus camera use it). (2) 8.7 px in y only close up =
height: Google's landed camera reports its centre altitude as 185 m where our USGS grid reads 187 m
above sea level, so Google's altitudes are sea-level heights like ours and the -32 m geoid offset
was wrong (`GEOID = 0`). The remaining ~1.3 px is the red dot's anti-aliasing and the glyph anchor.

**A1** (`-tapwords.mjs`, every lone light at the territory shot tapped): 390 px, labels on the hero's
words 15 of 24 -> **0 of 24**, 0 over their light, 0 off screen (`a1-tapwords/after-frames-390/
tap-1.png`: "New Windsor $69,900" below its light, clear of "home."). 320 px: 15 of 15 -> 13 of 15:
at 320 the words fill the column and a 190 px label has no word-free place within 160 px of its
light, so the last resort (which may overlap words) stands; not fixable without a smaller label.

**A2, the row policy decided: every click (or Enter, or tap) opens the county page; hover and focus
fly the map.** `-rows.mjs`: hover Putnam -> map at putnam; click -> `/top-areas/putnam` in 54 ms;
focus Brooklyn -> map at brooklyn; Enter -> `/top-areas/brooklyn`; phone tap Orange -> `/top-areas/
orange` in 112 ms. (A pointer left resting on a row after Back fires that row's hover when the page
re-renders; a probe artefact, the pointer's own choice wins.)

**A4** (`flyin/sheet.png`): words and scrims fade over 200 ms at a fly-in click (content opacity 0.41
at the first sample, 0 at the next); the dive is the picture; Back returns the page at opacity 1.

**A5 to A8** (done before the re-scope): town names 20 of 25 under 4.5:1 -> 0 of 24 (lowest 4.92);
the 1440 hero's column mean 21 -> 33 against the map's 95 (every hero text still 4.3:1+ at p99); the
phone's foot shade eases to 0.15 so the logo sits on a faint band of sea (`foot/sheet.png`);
"Syracuse" at the phone's top edge max 32 -> 13 of 255.

**Item 9, decided by numbers: let the scroll lift the cover and accept one freeze; no hold.** Cold,
1440, the scroll starting N s after navigation (`-lag.mjs --early=`):

| scroll at | first steady | cover gone | warm walk | Westchester flight worst | worst frame of the scroll |
|---|---|---|---|---|---|
| 3.0 s (before, `0b901fa`) | 7.5 s | 4.9 s | aborted | 236 | 236 |
| 3.0 s | 7.6 s | 5.2 s | aborted | **257** | 257 |
| 4.5 s | 8.4 s | 6.2 s | aborted | **250** | 250 |
| 6.0 s | 8.1 s | 7.7 s | aborted | **236** | 236 |
| 6.0 s (before) | 6.8 s | 7.7 s | ran (scroll registered late) | 21 | 21 |
| 8.0 s | 8.3 s | 9.7 s | ran, 1.3 s | 35 / 56 | **257, under the cover, the walk's own 400 ms compile flight** |

Why no hold: the stall is a one-time shader compile that happens on the first FLIGHT along that
path, wherever it is flown. A visitor who scrolls before the walk has run meets it either at the
Westchester flight (3 to 6 s) or as a scroll hitch during the walk under the cover (8 s); holding
the cover cannot hide it (the cover is the first screen only and scrolls away with the hero; the
walk would fly visibly behind the next sections). The cover never held past 11.7 s in any cold run;
with Google's script delayed 3 s (slow network) it stayed until the map drew, 16.1 s, and was not
capped at 14 s on purpose: lifting it earlier shows an undrawn map.

**Item 10** (`-states.mjs --case=firstfail`): the script aborted on the first request only: the
cover stays ("load: Google Maps failed to load"), the caption says only "Every light is a home listed
on OneKey MLS, standing where it stands." (no Google, no pointing), the page scrolls to the footer,
the search lands on `/search?q=Beacon`, 4 console lines in 25 s (no loop); reload -> map drawn, 130
lights. `maps-loader.ts` now forgets a failed load so a later caller on the same page view retries.

**The sweep.**
- Every page at 1440/390/320 (`pages/sheet-*.png`, 51 loads): all 200, horizontal overflow 0 on
  every one, the only console error `/_vercel/insights` (local server only).
- Tab walk at 1440 (`-tab.mjs`): FOUND the map element taking four invisible Tab stops between the
  header and the search; fixed (`inert` host, `b6ce0f0`). After: 219 stops in a sensible order,
  no trap, every stop on screen, the chat launcher reachable, the featured card lights its home and
  names it on landing, Escape puts light and label out with the focus kept. Rings: every outline
  measured 5:1+ except the kit's misreads (the heart's dark ring beside its light disc, the carousel's
  ring on its own white border, the skip link which IS a white box) and one real one: the hero's
  scroll cue, white ring 2.5:1 over the daylight map (left for the dark round).
- The seams (`-seams.mjs`): home at Orange -> light click -> listing -> Back: ONE Maps script load,
  ONE Map3DElement (`loads` 1; the element re-attached, not rebuilt), back at the same scroll (4317)
  and the Orange shot, words at opacity 1. Home -> search "Beacon" -> `/search?q=Beacon` (the query
  carried; the form's GET is a full page load, so `/search` loads the script for its 2D map: 2nd load)
  -> Back: a full reload of home (3rd load, the cover again; Playwright runs without the back-forward
  cache, so on a real Chrome this Back may be a bfcache restore; unmeasured).
- Failed `/api/lights` (500 and abort): the map draws with 0 lights; the three light sentences leave,
  the caption reads "Map: Google." only; no console loop (3 lines). **Decided: at 0 lights on the live
  map the words claim nothing about lights** (`claims.ts`, 6 tests); under our cover (JS off, before
  the map, failed map) they stay, since the cover's lights are drawn from the same listings.
- Failed map (`gmp-error` dispatched, and the script blocked): the cover returns / stays, no Google
  claim, the page reads to the footer, the search works.
- The reveal moved the caption (CLS 0.0009 at 7.2 s): fixed (`69fe7bf`, the claims shown by
  visibility): CLS **0.0002**. In the 0-lights failure state the light sentences leave the flow:
  CLS 0.011 there.
- Empty rails (`states/empty-*.png`, the component's empty markup put in place): "No listings to show
  right now. Browse all homes." in its dashed box over the map, no blank band. A failed fetch serves
  the committed snapshot (lib/idx/db.ts), so a rail is never empty from an error.
- 200 % zoom (720 x 450 css): overflow 0 at five stops, the words wrap, the territory names off (the
  page is past its top). FOUND, not fixed: at this height the search field sits in Google's logo
  corner, where the words' layer is masked by policy, so the field's left half fades out.
- Reduced motion: 0 `flyCameraTo`, a cut (camera = element), no errors. No JS (1440, 390): the cover,
  the h1, GET form `q`, both rails, 0 Maps requests. No key (`NEXT_PUBLIC_HOME_MAP=night`, dev on
  :3101 from a temporary worktree, removed): the night flight with its own copy ("The bright lights
  below are them."), 0 Maps requests (`states/nokey-night-1440.png`).
- Copy read (193 lines of the rendered home page): no em or en dash, no arrow glyph, no vendor URL;
  Google named once, "Map: Google.". Note: the footer's scene credit still names NASA's night lights,
  true of the cover (the night still re-graded), not of the live map.
- Day pages: against this round's base `ce84d84` (built in a temporary worktree with this worktree's
  env, removed): 17 of 20 identical; `/blog`, `/buying` and the listing at 1440 differ, and differ
  the SAME way between two renders of the same build (the listing's gallery placeholders with media
  blocked, 8,788 px run to run), so nothing of this round. Against `main`: the branch's phone line
  ((914) 875-2424 and info@ in the header and footer, `d15ee73`) on every page, and `/connect`'s
  Google Calendar embed painting on the branch and blank on main (both load the iframe).
- Overflow on `/` at 1440/768/640/390/320, five scroll positions each: 0. Controls at 390/320: every
  field 16 px; one target under 24 px, the footer's 16 x 16 consent checkbox (shared, pre-existing).
- Cold lag at 1440 on the final build: Westchester flight **34.7 ms** (1 frame over 34), worst flight
  frame of the scroll **139 ms** (Staten Island and the fling up, round 56's streaming hitches), marker
  adds 518, 0 in flights; first steady 7.9 s, cover gone 11.7 s.
- Gates: `npx tsc --noEmit` clean; `npx vitest run` **1827 passing** (1819 - 2 row-hold tests + 10).

### Round 6, the builder's numbers (commits `e2ef45b` `20ca57e` `c72584a` `fb7f207`; for the orchestrator to re-run)

Production build on :3102 (the code of `fb7f207`), headed Chrome, RTX 2060, 144 Hz, cold = a fresh
profile per run. Instruments (gitignored): `scripts/_scratch-r57f-*.mjs` (`-camlive` the camera per
frame, `-frames`, `-grade.sh` the three strengths, `-samp` tones by box, `-dissolve` frames + the
cover-vs-map diff, `-lag` round 5's probe plus markers in the DOM and the layer's cost, `-sum.cjs`,
`-table.cjs`, `-calib` a red Google marker and our green dot per home, `-lights` round 3's hover /
tap / click / focus probe, `-hovercost`, `-contrast`, `-reddraw`, `-nojs`, `-states`,
`-overflow`). Outputs under `scripts/_scratch-r57/6/`.

**Measured before building.** During `flyCameraTo` the element's `center`, `range`, `tilt` and
`heading` change on every frame Google draws (225 changes in a 2.4 s flight; the `gmp-*change`
events as often) and reading all five costs under 0.1 ms (`camlive/log.json`). So a layer can follow
the camera frame by frame.

**1. The night grade** (`night.ts`, `e2ef45b`). Not a flat veil: a flat veil turns Google's white
names grey with the land. A tone curve on the map element (CSS `brightness`, then `contrast` about
middle grey, then `saturate`) and a deep blue-black screened into the shadows: the land's middle
tones (~0.35 of white) fall to 0.09..0.21, white stays 0.71..0.89, the order of tones is kept
(tested). Three strengths at four stops both widths (`grade/sheet-{1440,390}.png`): light, mid, deep.
Chosen: **deep** (`brightness(0.64) contrast(1.5) saturate(0.45)`, tint `rgb(5,8,19)`): the owner's
"a dark place", the /ai page's black; the satellite imagery still reads (the Queens frame: the
airports' runways, the coast, the water darker than the land); HYBRID's flat sea at the territory
shot stays a quiet navy, a little brighter than the land (the one place where water is not darker,
Google's own flat colour). Cost: the cold lag probe with `?night=0` gave the same flights (over-34
sum 142 vs 142 on that build): free. Google's logo is under the grade (white stays white; not
covered by anything of ours). `?night=light|mid|deep|0` compares. **Scrims kept at 0.8**: with our
lights under the words, 0.6 failed the kit (12 texts at 1440, 23 at 390, down to 2.06:1).

**2. Our light layer** (`light-layer.ts`, `light-plan.ts`, `glyph.ts`, `20ca57e`). One canvas over
the grade and under the scrims; no `Marker3DElement` anywhere (markers in the DOM at the end of every
lag run: 0; marker adds: 0, were 518). Every drawn home's place is precomputed (ECEF, ground height
from our grid); a frame projects them from the camera the element reports.
- *In Google's frame.* Drawn on our own animation frame alone, the lights trailed Google's drawing by
  up to 21 px mid-flight (our callback ran first and read last frame's camera). Now drawn on the
  element's camera events (a microtask gathers the four): mid-flight, a red Google marker and our
  green dot for the same home in ONE screenshot, median 1.9 to 3.2 px, max 5.4 px
  (`calib/flight-*.png`).
- *The glyph.* A warm-white core and a soft warm halo, one hue, no ring, ADDED to the ground (canvas
  "lighter", CSS `plus-lighter`), baked once per glyph at its device size and drawn unscaled. Sizes
  read continuously from the live range (log range between anchors), so the tiers are eased (tested:
  no step anywhere on the ladder): laptop core / halo / strength 1.9 / 9 / 0.54 at 145 km, 2.05 /
  9.5 / 0.54 at 60, 2.25 / 10.5 / 0.54 at 25, 2.6 / 13 / 0.56 at 3 km; phone 2.2 / 10 / 0.62 at
  156 km. Lit (hover, a card's focus): core x1.6 to pure white, halo x1.45, strength x1.9, eased
  140 ms. Featured homes: core +0.6, halo x1.2.
- *Per-frame cost at 1440* (whole scroll, cold x4): mean 0.44 to 0.45 ms, p95 0.8 ms, max 1.6 to
  12.2 ms (single frames); phone 0.28 / 0.5 to 0.6. The first build (two sprites a light scaled from
  64 px with "high" smoothing) cost 1.09 / 1.9 and doubled the flights' frames over 34 ms (142 vs 65
  with `?homes=0`); baked, it is back to the map-only level (41 to 67).
- *The distribution* (`planDensity`): the homes in one fixed random order until the altitude's
  ceiling (`budgetFor`, unchanged), a small gap only (half the lattice gap: 15 px at the territory)
  so glows never overlap. A uniform sample: more lights where there are more homes. Frames side by
  side (`thin/sheet-1440.png`, lattice left, density right, Queens / Westchester / territory):
  Westchester's south (Yonkers, Mount Vernon) dense and its north sparse, the territory's lights
  gathered on the city, where the lattice evened both. `?thin=lattice` keeps round 57.2's. Plan
  0.2 to 1.7 ms (the lattice 6.7 to 24 ms). Drawn per stop at 1440: territory 130, chapters 245 /
  380 / 356, counties 130 to 380, Staten Island 85; at 390: territory 72.
- *Over a flight* the destination's homes are planned at its start and the set cross-fades over 80 %
  of the flight (homes both shots draw stay lit; smoothstep per light); reduced motion cuts, one
  layer draw per cut (measured: 1 at Dutchess, 1 at Queens).
- *The pointer* uses the positions the layer drew last frame: hover (20 lights at 1440, 3 frames:
  middle, right edge, the logo corner), 0 labels over their light, 0 on the logo, label shown 4 to
  14 ms after the pointer arrives, label text 11.5:1 to 18:1 on the real pixels; the pointer's whole
  frame over Queens (380 lights) p95 0.5 ms, max 1.0 ms (and 1.4 over 150 samples: the first frame
  after a scroll had cost 9.7 ms reading the words' line boxes; they are now read when the scroll
  rests, `fb7f207`); click steady -> fly-in -> route asked 619 to 635 ms, URL 690 to 834 ms; not
  steady 26 to 31 ms. Phone: 10 of 10 taps named the home (3 to 17 ms), 0 over the light, the open
  686 ms steady, 58 ms not steady; overflow 0 with a label at the right edge. Keyboard: the
  featured cards light their homes and name them (Pleasant Valley, Staatsburg, Poughkeepsie);
  Escape puts both out; Tab leaves the rail.
- *Names under a label fade* (`namesOverlap`, 140 ms, tested): `lights/phone/tap-1.png`, the tap
  label on Cornwall has Rockland and Westchester stepped aside.
- *The calibration* (the layer's green dot against a red Google marker per home, each photographed
  with the other hidden): 38 lights at five stops (hero, Dutchess County, Orange, Queens,
  Manhattan): median 1.9 to 2.3 px, **max 2.6 px**; the error is a constant (+0.4, +1.9) px at every
  range from 145 km to 21 km, i.e. screen-space (the marker image's own anchor), not the projection's
  geometry. One red dot of 39 was half hidden by a Google label (23 px of 68) and gave 9.3 px; not
  counted. At 390 (40 lights, the same five stops): 37 within 2.4 px with the same constant
  (-0.1, +1.9); three far off (18.7 and 19.2 px at the territory, 11.3 at Queens), not diagnosed (at
  1440 the one such case was a red dot half hidden by a Google label).

**3. The cover** (`c72584a`). `make-map-cover.mjs --look=night`: our relief and water in the tones
measured on the graded live frame (land 21..39, the Sound and the harbour 24,33,58, offshore
30,40,68), built-up land from our own listings' density, NO lamp carpet, no NASA channel; the lights
planned by the live planner in the live css box and summed with the live glyph. Wide 1600x1000
13.7 KB, tall 780x1688 13.1 KB. The cover now stands over the map and under the SAME shades as the
live map (the shades moved to their own fixed layer), so the words and their shades do not change at
the dissolve; with JS off it keeps its own shades (`nojs/first-1440.png`). Measured: the cover's
lights land on the live layer's (`dissolve/default/overlay-city.png`, red = cover, green = live:
every light yellow) with the same energy (5,683 vs 5,743 summed levels a light, both peaks 253).
**Cover vs first steady frame, mean absolute difference: 12.9 levels at 1440 (13.5 % of pixels over
24), 7.6 at 390 (6.0 %)**; the old dusk cover under the same shades: 19.0 (24.8 %). What changes
is Google's detail: roads, names, the imagery of New Jersey and Connecticut (outside our elevation
grid the cover is flat dark land). Frames: `dissolve/default/sheet-{1440,390}.png` (before / 350 ms
into the 700 ms dissolve / after). The dusk and day covers left the default path (`?cover=`).
Credits: the footer's NASA line shows only when the ground is the night flight; ATTRIBUTIONS.md
records the new cover's sources.

**4. The reveal and the early scroll** (`warm-plan.ts earlyScroll / backWaitMs`). Cold 1440, the
scroll starting N s after navigation (`lag/final-early*`):

| scroll at | first steady | cover gone | held after the scroll | after first steady | the walk's compile flight | the page's Westchester flight | worst page flight |
|---|---|---|---|---|---|---|---|
| 3.0 s | 7.2 s | 11.2 s | 8.2 s | 3.9 s | 250 ms at 7.9 s, under the cover | 21.0 / 27.9 | 76 |
| 4.5 s | 8.5 s | 12.2 s | 7.7 s | 3.7 s | 250 ms at 9.1 s, under the cover | 20.9 | 97 |
| 6.0 s | 7.2 s | 11.1 s | 5.1 s | 4.0 s | 257 ms at 7.8 s, under the cover | 27.8 / 27.9 | 139 |
| 8.0 s | 7.1 s | 10.8 s | 2.8 s | 3.7 s | 236 ms at 7.7 s, under the cover | 41.7 | 70 |

The Westchester flight is under 60 ms in every case (round 5: 236 to 257). The longest hold after a
scroll: 8.2 s (the scroll at 3 s; the map had not drawn yet). The cover lifts 3.7 to 4.0 s after the
map first draws, the same as with no scroll (3.7): the path's steps (~1.7 s) then up to 2 s for the
visitor's shot to draw; so "the drawn map plus 2 s" holds only if "drawn" means the walk's end, not
the first steady frame. Said plainly: the compile's 236 to 257 ms frame still happens once, under
the cover; a visitor who is scrolling at that moment feels it as a scroll hitch with the cover up.

**5. Lag, before (round 5 final, `5/lag/final-cold`) -> after** (flights: worst ms; the walk's
compile flight is under the cover):

| | before cold | after cold x4 | after warm x1 | after 390 cold x3 |
|---|---|---|---|---|
| boot worst / over 34 | 493 / 41 | 424 to 479 / 27 to 32 | 292 / 39 | 396 to 424 / 19 to 23 |
| the page's Westchester flight | 34.7 | 27.8 to 34.7 | 41.7 | 90.3 / 90.3 / 90.4 |
| worst flight frame of the scroll | 139 | 76 / 97 / 104 / 125 | 83 | 90 / **278** / 90 |
| flights' frames over 34, sum | 89 | 62 / 41 / 65 / 67 | 74 | 12 / 31 / 21 |
| marker adds (in flights) | 518 (0) | 0 (0) | 0 | 0 |
| first steady / cover gone, s | 7.9 / 11.7 | 7.1-7.5 / 10.7-11.1 | 6.9 / 10.6 | 5.4-6.1 / 8.4-10.2 |
| our layer per frame, mean / p95 / max ms | - | 0.45 / 0.8 / 1.6-12.2 | 0.46 / 0.8 / 11.5 | 0.28 / 0.5-0.6 / 2.9-8.4 |

The phone's 278 ms (1 run of 3) is one frame at the landing of the first flight (Dutchess, 2.5 s
into 2.6 s); not seen in the other two runs; not diagnosed. In one earlier cold run on an
intermediate build the walk's compile flight did not compile (131.9 ms under the cover) and the
page's Westchester flight stalled 250 ms: 1 of the 17 cold 1440 runs of this round; not diagnosed.

**6. Gates.** Contrast kit, 18 stops: **1440 = 2** (AI and Connect, the pills the kit misreads),
**390 = 0** outside the logo hole (6 text-stops inside it, faded on purpose); lowest real texts 4.53
(the chapter headings over the lights). No horizontal overflow at 1440 / 390 / 320 at five scroll
positions each. No JS: the night cover at opacity 1 at both widths, the GET form, both rails, 0 Maps
requests. Blocked script and `gmp-error`: the cover stays, "load: Google Maps failed to load", no
Google claim; our lights stop and hide. Reduced motion: 0 flights, 1 layer draw per cut, the cover's
transition 0. tsc clean; vitest **1827 -> 1849** (136 -> 138 files).

**Decided here, for the owner**: the deep grade; density-true lights; the scrims unchanged (the
kit); the cover's hold ends at the reveal, never earlier; the dusk and day covers kept only behind
`?cover=`. **What he will see**: on a cold laptop, the dark territory with its lights for about 11 s
(our cover), which then gains Google's detail in place without the lights moving, and every section
flight carries its lights with it, growing as the camera comes down; on a phone, the same, sooner
(about 8 to 10 s).

**Left**: `thinning.ts diffLights` and the gate's marker hook (`canMark`) are no longer used by the
page (kept, tested; remove in a sweep); the 390 calibration; the phone's one 278 ms landing frame;
HYBRID's sea at the territory shot is a touch brighter than the land.

## 5. The owner's verdict mid-round (2026-09-23, verbatim, after rounds 1 to 4)

> "It's definitely getting better, the real map is better, but you have to work on the light
> dots and those listings, and can you make that real map in a dark mode, or is it a night
> also; when it starts it's still the old bad map with a lot of lights, then when you scroll
> down the real map shows up but sometimes it freezes, and when you go up you have the new and
> better clean real map instead of the old one if you go up later; so work on those, and make
> that real map a dark place, and those light dots, listings, distribute properly with
> geolocation, and make it really cool design and smooth transitions."

Read as orders:
1. **The real map is the direction; make it DARK.** Google's 3D map has no dark mode
   (`DESIGN-ROUND57.md` round 2 facts), so the night is ours: a night grade over the imagery.
2. **The lights and the listings are not finished**: they must sit exactly where the homes
   are, be distributed as the homes are (not thinned into a lattice, not a blob), and be
   designed ("really cool") with smooth transitions.
3. **What he saw at the start, "the old bad map with a lot of lights", is the LOAD COVER**: our
   night still with the round-55 lamp carpet (re-graded to dusk in round 2), which stands for
   10 to 11 s on a cold laptop before the real map is revealed; scrolling lifts it early and
   interrupts the shader warm-up, hence "sometimes it freezes". The cover must look like the
   dark real map's own first frame, and the early scroll must not freeze.
4. **Smooth transitions** everywhere: the cover to the map, the flights, the light tiers, the
   labels.

### Round 6 brief (for builder 6): the night real map, our lights on it

1. **The night grade.** A veil layer over the map element (below the words, above the map): a
   deep blue-black, not pure black (the imagery must still read: coastline, water darker than
   land, the river, the ridges), tuned by frames at three strengths at four stops both widths,
   the owner's taste reference is realtylt.com/ai (black and glow, one hue). With the map dark
   the word scrims can go much lighter or away (frames and the contrast kit decide). Google's
   attribution stays unobscured (the logo hole stays clear of the veil or the veil is light
   enough there; measure). HYBRID at the territory shot keeps Google's names, white on dark now.
2. **Our own light layer.** The listing lights leave Google's markers (`Marker3DElement`) and
   are drawn by us on a canvas above the veil, below the words: every drawn home projected by
   `camera.ts` from the map's camera each animation frame during a flight and once when steady
   (read the camera from the element's properties or its change events; measure the per-frame
   cost at the county ceilings: it must stay under 1.5 ms at 1440). This requires the
   projection CALIBRATED against Google's drawn positions to 2 px at every stop (builder 5's A3
   work if it landed, else do it here: draw a few Google markers at known coordinates in a
   probe, read their pixel positions, fit the error, fix the model: fov convention, the
   ellipsoid, the altitude reference). The glyph designed on the canvas: a warm-white core, a
   soft halo, additive blending, the size and halo by altitude with the tiers EASED (no pops
   between tiers), the hovered or focused light brighter and larger, the phone's lights visible.
   Distribution: the homes where they are; keep the by-altitude ceilings so the city is never
   a blob, but prefer a thinning that keeps the true density pattern (denser where homes are
   denser) over an even lattice; frames decide, side by side. Hover, tap, click and the label
   now use the same projection as the drawing, so the label sits on its light exactly. No
   Google markers means no marker adds at boot or on flights: report the boot and flight
   tables before and after.
3. **The cover, rebuilt.** A still that looks like the dark real map's first frame at the
   territory shot: our elevation render in the same night grade, the water and land as they
   read on the veiled imagery, NO lamp carpet, and the listing lights as the same glyphs in the
   same places (drawn from the same table and the same projection at the hero camera). Wide
   and tall. The dissolve from it to the live map must be a change of nothing but detail
   (frames before, during, after at both widths; a pixel diff of cover vs first steady frame
   reported as a number). The dusk and day covers retire from the default path (`?cover=`
   may keep them for comparison); `ATTRIBUTIONS.md` updated.
4. **The reveal and the early scroll.** Reveal at first steady plus the warm path (the
   shader compile stays under the cover); the cover holds through the warm path even if the
   visitor scrolls (bounded; never past 14 s; builder 5's item 9 numbers rule); when the cover
   lifts on a scrolled page the map must already be at that section's shot (no flight the
   visitor watches from the wrong place).
5. **Transitions.** The cover dissolve 600 to 800 ms; the light tiers eased over the flight;
   the labels fade with the flights; the section flights stay Google's eased flights; the
   fly-in to a listing fades the words (builder 5's A4). Reduced motion: cuts, our layer
   redraws once per cut.
6. **Fallbacks unchanged**: no key = the night flight, `gmp-error` or blocked script = the
   cover stays, JS off = the cover, no WebGL = the cover.

Gates: frames at every stop both widths (three veil strengths at four stops first, then the
chosen one everywhere); the cover-vs-first-frame diff; the cold lag probe x3 and warm x1 at
1440, cold x2 at 390, with boot marker adds gone and our layer's per-frame cost in the table;
the contrast kit at every stop (0 under 4.5:1 outside the logo corner at 390; at 1440 only the
two pills); the pointer probe of round 3 re-run (label on its light within 2 px at three stops);
tsc; vitest only up (the projection fit, the eased tiers, the cover-hold rule tested); overflow
at 1440/390/320; day pages untouched (`git diff --stat` outside the home page's files empty).
Do not touch: CSP, `/search`, `lib/site.ts`, `Header.tsx`, the fallback order.

### Round 5, the orchestrator's verification (2026-09-23, HEAD `f38a818`, :3102 on that code)

Re-run, not read: tsc clean; vitest **1827 / 1827** (136 files); `/` answers 200; both
temporary worktrees gone. Looked at `5/a1-tapwords/after-frames-390/tap-1.png`: the tap label
now sits below the headline, off the words; it lands on our "Rockland" territory name (a
round-6 item: names under an open label fade). The projection fix is the kind of finding that
survives the next round: a constant 8.6 px left at every range was the 17 px scrollbar
(`innerWidth` against the map element's own width), and the 8.7 px at 2.6 km was the geoid
offset (Google's landed camera reports sea-level heights); max error now 2.3 px. Accepted:
A1 to A8, the caption claims by state, the four invisible Tab stops removed, the reveal's CLS
back to 0.0002, the seams (one script load and one `Map3DElement` per listing round trip), the
failure states, the copy, the pages at three widths, day pages explained.

Overridden for round 6: the builder's "no hold" on item 9. Its own table says a visitor who
scrolls at 3, 4.5 or 6 s still meets the 236 to 257 ms freeze on the Westchester flight (the
warm path had not run); at 8 s the freeze moved under the cover. The owner's words are "sometimes
it freezes", so round 6 holds the cover through the warm path even on an early scroll (bounded
by the path's own 1.6 s, never past the drawn map plus 2 s) and lifts it onto the visitor's own
section. Carried: at 320 the tap label still overlaps words (no word-free spot within 160 px);
at 200 % zoom the search field fades in the logo corner's mask; the scroll cue's focus ring is
2.5:1 over the daylight map (re-measure on the dark grade); the footer still credits NASA's
night lights, true only of the old cover: when the cover is rebuilt without that data the credit
and `ATTRIBUTIONS.md` change with it.

### Round 6 brief, adjusted after round 5

Everything in "Round 6 brief (for builder 6)" above stands, with these adjustments:
- Item 2's calibration is DONE (`42592fe`): use the calibrated projection as it is (the map
  element's own size, sea-level heights); the layer's target stays 2 px; re-measure with
  `scripts/_scratch-r57e-calib.mjs` at five stops after the layer replaces the markers.
- Item 4's cover hold is decided, not open: hold through the warm path on an early scroll, lift
  onto the visitor's section, the numbers in the record (scrolls at 3, 4.5, 6 and 8 s cold; the
  Westchester flight must stay under 60 ms in every case; the cover's longest hold reported).
- The county rows navigate on every click (`2374ceb`); hover and focus preview the flight; the
  night layer must keep that preview.
- When a label is open, our territory and town names under its box fade (the layer draws
  them, so it knows).
- The footer credit and `public/images/ATTRIBUTIONS.md` follow the new cover's real sources
  (no NASA line if no NASA data is used).
- The caption's claims (`claims.ts`) stay as they are; the light sentence must stay true with
  our own layer (it counts what the layer draws).

## 6. Round 6 verified, and the orchestrator's polish round (2026-09-24)

**Round 6 verified** (:3102 on `fb7f207`): tsc clean; vitest **1849 / 1849** (138 files); fresh
frames from the running server: the territory shot 130 lights, 11 names, plan 0.4 ms, **marker
adds 0**; my cold lag run: the Westchester flight 27.8 ms max, the scroll's worst flight frame
97 ms (the fling), first steady 7.3 s, cover gone 10.9 s. Looked at `6/final/hero-1440.png`,
`hero-390.png`, `final/sheet-1440.png`, `dissolve/default/sheet-1440.png`, `final/orange-1440.png`:
the night grade keeps the photograph (ridges, water darker than land, the river), the lights are
warm points by true density, the city chapters read as cities at night, the cover is the map's
own first frame and the dissolve only adds detail. The loudest element left on the dark map was
Google's red and blue interstate shields at the territory shot (HYBRID there since round 2).
Round 6 accepted.

**The polish round, one change by frames** (`7aa6167`): the territory shot goes SATELLITE too
(`scripts/_scratch-r57/verify6/sat/hero-1440.png` against `verify6/hero-1440.png`, then every
stop both widths in `scripts/_scratch-r57/7/`). Our county and borough names orient a stranger
at that altitude since round 1, so Google's names and shields are not needed; the night
photograph, our lights and our names are one language at every stop, and the dissolve adds no
shields either. On the final build, cold at 1440: first steady **6.2 s**, cover gone **9.9 s**
(a second sooner than HYBRID), the Westchester flight 27.8 ms, the scroll's worst flight frame
**76 ms**, marker adds 0; the contrast kit 0 under the floor at 390 and 2 at 1440 (the AI and
Connect pills the kit misreads, unchanged since round 56); tsc clean; vitest 1849; frames: 130
lights and 11 names at 1440, 72 and 7 at 390.

**The videos** (untracked): `docs/design-r57-video/r57-desktop.mp4` (84 s) and `r57-phone.mp4`
(74 s), cut from the production build under the real CSP with photos loading; frames checked at
2 s (the cover: dark, our lights, the words) and 22 s (the live night map, our names fading as
the scroll begins).

**Left open, honestly** (from the builders' reports and mine): at 320 the tap label can still
overlap words (no word-free spot within 160 px); at 200 % zoom the search field's left half
fades inside the logo corner's mask; one 278 ms landing frame in 1 of 3 phone runs
(undiagnosed); the shader warm-up missed once in 17 cold runs (one 250 ms stall then); a
visitor scrolling DURING the compile under the cover still feels one hitch; the cover outside
our elevation grid (New Jersey, Connecticut) is flat dark land; three of forty phone lights were
11 to 19 px off in the calibration probe (undiagnosed); the word scrims stay at 0.8 because our
lights sit under the words; Google's names are gone with SATELLITE (`?mode=split` brings the
territory shot's back); the MacBook is unmeasured; the map ID for a Google style is the owner's
to create. Nothing pushed; `main` untouched. The successor brief is
`docs/handoff/WEBSITE-R58-HANDOFF.md`.
