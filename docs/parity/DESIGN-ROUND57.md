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
