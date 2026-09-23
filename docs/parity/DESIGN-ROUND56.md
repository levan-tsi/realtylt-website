# Design round 56: the real map (Google's 3D map as the hero's ground, our lights on it)

Round 55 measured and fixed the lag and put a satellite glow under the contour valley. The owner
saw it on 2026-09-23 and rejected the picture, not the work. This document is the pivot: his
verdict, what was proven in his browser tonight, the facts about Google's 3D map with their
sources, the design decisions, and the phases an Opus builder runs (his order: Opus builds,
Fable orchestrates, from now).

## 1. The verdict (2026-09-23, verbatim)

> "I don't like it to be honest. When it starts, when I scroll down, that first page kind of
> freezes in the middle, and after a few seconds it disappears. It has to be smooth, no freezing
> or anything like that. But also, the map doesn't look realistic at all. The dots that you added
> in some areas, maybe they are better, but when it gets close and we zoom in some areas it
> becomes kind of pixelated, and we have to make it minimalistic, not too overcrowded or too many
> lights in one place; even though there is the city density expression it has to be still
> balanced. Now the lights are distributed all over and it looks like everywhere is covered. But
> most importantly, the map kind of lost its visual: you won't really understand which area
> you're looking at. So find that Google Maps 3D API or something, I know there's something that
> existed, that we can get just that area for our map and then add our dots, as we did on our AI
> page: I found the 3D brain somewhere and we copied it and made it ours. So find if there exists
> some 3D map that has good visuals, maybe shows the city, and then we add those lights, and maybe
> those lights will be interactive when the mouse is there, and smooth transitions, and when we
> zoom out to the city it should show the area, customers should understand what area that is.
> And we're changing to Opus builder and Fable orchestrator from now."

Four orders in it: (1) no freeze, ever; (2) a real, recognisable map; (3) our lights on it,
balanced and minimal, interactive on hover, smooth camera; (4) Opus builds.

## 2. Done tonight, proven in his Chrome (headed, real GPU)

- **The freeze is fixed** (commit `d86e43f`). Reproduced first: the poster still is absolute to the
  page, so a wheel at 1.5 s left it as a frozen picture across the top third of the window with a
  hard seam at 300 px until the intro's end at ~5.5 s (`scripts/_scratch-r56/freeze/t4.png`).
  Now a scroll past 24 px drops the still in 400 ms, and if the scroll came while the clouds were
  building it drops the moment the scene is ready; only where WebGL exists (without it the still
  is the hero). Measured after: opacity 0.06 at 0.4 s after the scroll, 0 by 1 s, no seam
  (`t3.png`). Three tests pin it. This stays whatever the hero becomes.
- **Google's 3D map renders with the site's existing key, no extra setup**
  (`scripts/_scratch-r56-g3d-test.mjs`, frames in `scripts/_scratch-r56/g3d/`): Manhattan in
  HYBRID mode is photorealistic with labels (`debug.png`), **Poughkeepsie has full photorealistic
  3D coverage** too (buildings, the Mid-Hudson bridge, terrain, street and place labels;
  `poughkeepsie.png`), and the valley at 60 km range shows the river, the terrain and every town's
  name from Kingston to Cold Spring (`valley.png`), which is exactly "customers should understand
  what area that is". No `gm_authFailure`, no `gmp-error`.
- Two traps found on the way, for the builder: the loader's `callback=` must be defined BEFORE
  the async script tag (an inline script after it lost the race and the map never initialised);
  and `gestureHandling` is an enum in UPPER CASE on the element (`'cooperative'` throws "not an
  accepted value" inside the async init, i.e. an unhandled rejection with no console error; the
  attribute form `gesture-handling="cooperative"` in the docs is lower case).

## 3. The facts, with sources (fetched 2026-09-23 in a real browser; the pages are JS-rendered)

| fact | source |
|---|---|
| Load: `https://maps.googleapis.com/maps/api/js?loading=async&key=…&libraries=maps3d`; element `<gmp-map-3d center="lat,lng,alt" tilt="…" range="…" heading="…" mode="hybrid">` or `new Map3DElement({center:{lat,lng,altitude}, range, tilt, heading, mode})` after `google.maps.importLibrary('maps3d')` | developers.google.com/maps/documentation/javascript/3d/get-started, /map-modes |
| Modes: `ROADMAP` (roadmap with labels), `SATELLITE` ("a photorealistic map based on aerial imagery"), `HYBRID` ("the satellite map view with basemap labels"); "Satellite and hybrid: ideal for real estate … where visual fidelity and terrain context" matter. The page notes pre-GA offerings are under the Service Specific Terms | /3d/map-modes |
| Camera: `flyCameraTo({endCamera, durationMillis})`, `flyCameraAround({camera, durationMillis, repeatCount})`, `gmp-animationend`, `stopCameraAnimation()`; camera = center (lat, lng, altitude), range, tilt, heading | /3d/animate-camera |
| Interaction: `bounds`, `minAltitude`/`maxAltitude`, `minTilt`/`maxTilt`; `gestureHandling` COOPERATIVE ("allows the user to scroll the page without impacting the map's zoom or pan"), GREEDY, AUTO | /3d/interaction |
| Events: `gmp-steadystate` (load your markers and animate after it), `gmp-error`, `gmp-centerchange`/`-headingchange`/`-rangechange`/`-tiltchange`/`-rollchange`; do not update overlays while the user pans or zooms | /3d/map-events, /3d/best-practices |
| Markers: `Marker3DElement` (fast; "for applications with more than 1,000 markers … strongly encouraged"), `Marker3DInteractiveElement` (click and keyboard, `gmpPopoverTargetElement`), `collisionBehavior`, altitude modes, `PinElement` glyph customisation; ~300 SVG markers load in 150 to 300 ms on a modern laptop | /3d/marker-overview, /3d/best-practices |
| Styling: cloud-based map styling by `mapId` (POI density and categories, feature fill/stroke); "You must select '3D Hybrid' and use 'light mode'" for a 3D style; `mapId` can change at runtime | /3d/customize-maps |
| Price: SKU "Immersive Maps", category Pro, billable event = map load, **5,000 free loads a month, then $7.00 per 1,000** (falling with volume); a 2D map on the same page is billed separately | /maps/billing-and-pricing/pricing, /sku-details |
| Policy: display the "Google Maps" attribution (the built-in logo must stay visible and unobscured); no pre-fetching, caching or storing of map content except as allowed (so **no screenshot of the map may be shipped as our poster or fallback**); Places content is not to be scraped | /maps/documentation/javascript/policies |

## 4. Decisions

1. **The hero's ground becomes Google's 3D map in HYBRID mode**, fixed behind the page like the
   canvas is today, `gestureHandling` COOPERATIVE so the page scrolls as it always has and the
   map never eats a wheel. Each section's `data-shot` becomes a preset camera (center, range,
   tilt, heading) and a section change is one `flyCameraTo` (1.6 to 2.6 s, eased by Google), the
   area chapter flies county by county exactly as the night flight did. The night-flight scene
   stays in the code as the fallback (no key, `gmp-error`, no WebGL, reduced motion = cut, JS off
   = the poster) and for /search's map language until that page is decided.
2. **Our lights = the homes for sale only.** No street-light carpet (the map supplies the city).
   `Marker3DElement` with a small warm glyph, thinned by altitude the way the search map thins
   pins (the establishing shot shows the towns' brightest few hundred, a county chapter its
   homes, a close shot every home), so it is never overcrowded and never pixelated; a hovered
   or focused marker brightens and names its town and price; a click opens the listing. Hover on
   markers is not documented for 3D: prototype `Marker3DInteractiveElement` plus pointer
   hit-testing on the page (the marker's screen position is not exposed, so hover may have to be
   nearest-marker by projected position from our own camera maths) and report what works.
3. **Look.** The map is daytime imagery under a black-and-white page: the builder renders BOTH
   the map at full brightness with a graded dark scrim only under the words (the quiet boxes)
   AND a dimmed map (a dark veil at 0.35 to 0.5 over the whole map, the words on it) at every
   section, at 1440 and 390, and the owner chooses. The attribution logo stays unobscured in
   either. No night mode exists for 3D maps; a cloud style (light mode, 3D Hybrid) can thin the
   POI clutter and that is worth one map ID.
4. **Cost is accepted by the owner's order**: every home-page view is one Immersive Maps load;
   5,000 a month free, then $7 per 1,000. Pre-launch traffic is far below the free tier. The
   figure goes into the handoff so it is never a surprise.
5. **Fallback and honesty.** The poster stays OUR artwork (the night-flight still); a Google
   screenshot cannot be stored. With JS off the poster carries the hero as today. The copy under
   the search says what the lights are (the homes for sale) and that the map is Google's.

## 5. Phases (Opus builder, one at a time; the orchestrator re-verifies each on the running app)

1. **The prototype in `/lab/g3d`** (RLT_LAB=1): the map with the six shots (hero, dutchess,
   highlands, westchester, harbour, region) as cameras and the eleven county chapters, our
   listings as thinned markers, a hover/focus treatment, both looks from §4.3, a `data-shot`
   driver that flies on section change. Frames at every shot at 1440 and 390 in
   `scripts/_scratch-r56/g3d/lab/`, a video, the CSP violations it hit (read the console; the
   orchestrator decides the `next.config.ts` change with the owner, never the builder), the
   frame-time probe (`scripts/_scratch-r55b-lag.mjs`, headed) on the lab page.
2. **Integration behind a flag** (`NEXT_PUBLIC_HOME_MAP=g3d`): the home page's ground becomes the
   map when the flag and the key are present and the map reports `gmp-steadystate`; the night
   flight otherwise. The copy follows. Tests for the shot-to-camera table, the thinning and the
   fallback order. The ledger of round 55 (`DESIGN-ROUND55.md` §7) binds: tsc, vitest only up,
   overflow, focus, tap targets, contrast under the words measured on the REAL map pixels, no-JS,
   reduced motion, day pages byte-identical.
3. **Polish rounds on frames and videos** until it is wow next to realtylt.com/ai, then the owner's
   verdict, then /search's map decides its own round.

## 6. What the owner should know now

- The map will show Google's labels and logo; that is the price of the real thing and the
  policy. A cloud style can calm the point-of-interest clutter.
- Each view of the home page is a metered Google load after the free 5,000 a month.
- The night flight does not disappear: it is the fallback and the poster.

## 7. Phase 1 measured (orchestrator, 2026-09-23; commits `8288958`, `0280a26`, CSP `deda59b`)

The lab is real: `/lab/g3d` on the production preview (`:3102`, `RLT_LAB=1`) renders Google's
3D map under the site's own CSP with zero violations, the page's own sections over it, our homes
as thinned warm lights (hero 339, section shots ~800, counties 80 to 658, phone ~200), hover by
our own projection (0.02 to 0.04 ms a test), a tap that names a home before it opens it, one
`flyCameraTo` per section, the eleven counties from the list. Videos for the owner:
`docs/design-r56-video/lab-desktop.mp4` (98 s) and `lab-phone.mp4` (79 s), untracked. Frames of
both looks at all 18 stops: `scripts/_scratch-r56/g3d/lab/{scrim,veil}/`, contact sheets
`lab/sheet-{1440,390}.png`. tsc clean, vitest 1665 -> **1703**.

**The look:** the scrim look (the map at full brightness, dark glass under the word columns and a
header shade) is the one that reads; measured with the round-54 kit on the real map pixels,
3 of 150 texts under the floor at 1440 (two are the kit reading button borders; one real:
"Start here" 2.8 at p99), 10 of 90 at 390 (rows passing the logo's hole). The veil look fails
(46 of 150) and muddies the lights. Seen in the frames: the region is recognisable at a glance,
NYC, the Hudson, Peekskill, Newburgh, Poughkeepsie named; the scrims still read as rectangles and
Google's POI labels show through them (a cloud map style thins those).

**The frame budget, re-measured by the orchestrator** (headed Chrome, RTX 2060, 144 Hz; worst
frame ms / frames over 34 ms per phase; the builder's numbers agree):

| phase | cold 1440 | warm 1440 | night flight (round 55, warm) |
|---|---|---|---|
| boot (to steady, ~6 s) | 417 / 33 | 160 / 20 | 118 / 3 |
| hold at dutchess (tiles streaming) | 326 / 11 | 104 / 10 | 7 / 0 |
| to highlands | 76 / 12 | 56 / 9 | 21 / 0 |
| to the areas chapter | 83 / 20 | 70 / 12 | 7 / 0 |
| to the harbour | 111 / 20 | 28 / 0 | 14 / 0 |
| flings | 56 / 5, 42 / 17 | 56 / 3, 56 / 13 | 14 / 0 |

**These stalls are Google's renderer streaming and decoding tiles during camera motion**: the
map-only run (`?homes=0`) shows the same numbers, none of them are main-thread long tasks, and
`qualityMode` does nothing on this version (3.66). Idle holds sit at 7 ms. A warm disk cache
does not remove them. This is the direct conflict with the owner's "it has to be smooth, no
freezing or anything like that", and it is Google's, not ours.

**Not possible on this version:** Tab into the map's markers (the featured cards fly the map on
focus instead); a poster of the map (policy forbids storing its content; the first 5 to 7 s are
a black cover today); a hover event on markers (ours works instead).

**Also seen:** page content scrolling past covers the Google logo (a layout rule is needed for
that corner: policy), the hero copy about "the towns' own light" is wrong on this map (the
lights are all homes again), and `lib/site.ts` / `Header.tsx` carry a lab-only route rule that
phase 2 removes.

### 7.1 The decision the owner has to make now

He asked for two things that the measurements put in tension: the real, recognisable 3D map,
and no freezing. On this map the section flights run at 30 to 70 fps with 50 to 100 ms hitches
while tiles stream, and the first screen is a black cover for 5 to 7 s. Three honest options:

1. **Take the real map and mitigate**: pre-warm every shot's tiles during the load (fly the
   camera through all shots under the cover before the page shows, then measure whether the
   flights are clean; untested), keep flights long (2.6 s) and altitudes similar so fewer tiles
   change, fly only after `gmp-steadychange`, and cover the first 5 to 7 s with OUR poster (the
   night-flight still, allowed) instead of black. Expected: better, not 7 ms.
2. **The real map only where it is still, our scene where it moves**: the night flight (7 ms,
   no vendor, no stalls) carries the scrolling page; Google's 3D map appears in the shots that
   hold still (the county chapters on hover, the harbour), where its realism pays and where its
   stalls cannot be felt.
3. **The real map as a still**: no camera flights at all; one photorealistic view per section,
   cut rather than flown, so nothing streams during motion. Loses "smooth transitions".

The orchestrator's recommendation: **option 1 for one polish round, measured; if the flights
still stall over 34 ms on a warm profile, option 2.** Either way the black load cover becomes
our poster now.


## 8. Phase 1b measured (builder, 2026-09-23; commits `53c592d` `f6efd69` `f2f5e30` `93505f1` `6e92e55` `128e127` and the hero fix)

Option 1 of §7.1 built and measured. Instrument: `scripts/_scratch-r56b-lag.mjs` (gitignored), the
phase-1 probe's phases and wheel unchanged so its per-phase table compares with §7, plus every
`flyCameraTo` logged as its own window (so a flight is judged by its own frames), every marker
add/remove timestamped against the map's last `gmp-steadychange`, element timing on our poster,
paint timings. Headed Chrome, RTX 2060, 144 Hz; cold = fresh profile, warm = persisted profile
after one untimed pass; `--phone` = 390x844 at DPR 3, touch. Tables: `scripts/_scratch-r56b-table.mjs`,
summaries in `scripts/_scratch-r56/lag1b/`. **Run-to-run noise on the same build is up to 1.5x on the
over-34 counts**, so single-run differences under that are not claims.

### 8.1 Before (phase 1, `f7cfc32`) and after (all of 1b), worst frame ms / frames over 34 ms

| phase | cold 1440 | warm 1440 | cold 390 | warm 390 |
|---|---|---|---|---|
| boot | 410/27 -> 472/26 | 160/22 -> 167/23 | 396/22 -> 403/20 | 160/17 -> 167/23 |
| hold at dutchess (first flight) | **299/5 -> 42/13** | 90/7 -> 49/5 | **299/6 -> 49/1** | 56/2 -> 35/1 |
| to highlands | 49/7 -> 62/2 | 42/7 -> 49/6 | 35/1 -> 35/1 | 21/0 -> 21/0 |
| to the areas chapter | 70/10 -> 56/11 | 77/13 -> 49/10 | 42/2 -> 28/0 | 28/0 -> 35/1 |
| to the harbour | 63/8 -> 69/15 | 76/14 -> 63/17 | 35/1 -> 35/1 | 21/0 -> 21/0 |
| fling up / down | 69/17, 28/0 -> 63/4, 49/14 | 56/17, 42/7 -> 42/3, 49/22 | 21/0, 35/1 -> 28/0, 35/1 | 28/0, 21/0 -> 21/0, 28/0 |
| worst frame of the whole scroll | 299 -> 104 | 104 -> 63 | 299 -> 90 | 56 -> 35 |
| flights: over 34 per flight | 11.4 -> 11.1 | 15.3 -> 12.4 | 1.5 -> 2.0 | 1.1 -> 0.4 |

What changed for the visitor: the cold first flight's 300 ms stall is gone (the pre-warm), the
worst frame anywhere drops to ~100 ms cold / ~60 ms warm, the black cover is our poster. What did
NOT change: on a laptop every flight still runs at 48 to 72 fps with 50 to 70 ms hitches (10 to 12
frames over 34 ms per flight). On the phone the flights are already near clean (Google draws less
there). **Option 1 does not reach "no freezing" on a laptop.** By §7.1's own rule the next step is
option 2 (the night flight moves; Google's map holds still where it pays).

### 8.2 Item 1, our poster as the load cover

First paint and our poster are the same frame (element timing = FCP): 0.8 to 1.0 s warm, 0.8 to
1.2 s cold. The map's first steady frame: 6.0 to 7.3 s at 1440, 4.5 to 6.6 s at 390. The poster
dissolves 400 ms after the map is drawn at the page's first camera, goes at once on a scroll past
24 px, or stays if the map fails (that path is written, not exercised by a probe). With the one-shot
pre-warm (8.3) the cover leaves at 9.6 s warm / 10.5 s cold at 1440, 8.0 / 8.6 s at 390 (it was a
black cover to 5 to 7 s). The intro flight is gone. The look jump at the dissolve is large: a night
still becomes a daylight satellite map (see the videos); the owner should see it.

### 8.3 Item 2, the pre-warm (the experiment)

| | none | full walk (17 shots) | lite (6 + 2) | full, flown 400 ms | ONE shot (default) |
|---|---|---|---|---|---|
| walk, warm 1440 | - | 29.5 s | 15.5 s | 45 s+ | 3.0 s |
| walk, warm 390 | - | 20.3 s | 10.9 s | 45 s+ | 2.5 to 3.9 s |
| first flight, cold 1440 | 319/6 | 42/3 | 35/6 | 49/12 | 49/5 |
| first flight, cold 390 | 292/8 | 35/1 | 48/1 | 21/0 | 49/1 |
| flights over-34 sum, warm 1440 | 174 | 205 | 211 | 464 | 139 |
| flights over-34 sum, warm 390 | 28 | 7 | 13 | 14 | 10 |

Verdict: **partly**. Each shot takes 1.4 to 2.1 s to draw even from a warm disk cache, so the whole
walk is far over the 6 s cap, and on a laptop it does not clean the flights (having visited every
shot, the flights still hitch as before; that tiles on disk are not tiles on the GPU is a
hypothesis, not measured inside Google's renderer). It removes the cold first flight's 300 ms
stall, and one shot is enough for that; on the phone the full walk makes the flights nearly clean
but costs 20 s. Default: a 1.5 s budget (the walk visits the next shot and stops). Policy question
for the orchestrator: the walk renders the map in the page under our poster, nothing is stored by
us, but it does render views before the visitor asks for them.

### 8.4 Item 3, flight discipline (each measured alone; before = items 1 and 2)

- **Steady gate** (`gate.ts`, 9 tests): with a 1.2 s wait, 5 flights in the run instead of 15,
  over-34 per flight 9.3 -> 16.8 (warm 1440), and the map trailing the page by 2.0 s on average,
  4.0 s at worst; with 0.3 s and longer flights, 16.7 per flight and 1.1 s / 1.9 s behind. Holding
  never made a flight cleaner (the map re-streams during every flight whatever state it started
  from). Built, tested, **off by default** (`?gate=1`).
- **Longer flights** 2.6 to 3.2 s: flights over-34 cold 1440 82 -> 177, warm 139 -> 109, 390
  22 -> 21 and 10 -> 1: inside the noise. Default stays 1.6 to 2.6 s.
- **The ladder** (`cameras.ts LADDER`, 8 tests): neighbours within 2x in range and 15 degrees in
  tilt (Dutchess 38 -> 60 km, Highlands 28 -> 30, Westchester 30 -> 48, Putnam 43 -> 56, Bronx
  22 -> 39, harbour 16 -> 30, the tail 200 -> 60 km: the city and the river instead of the whole
  region). Flights over-34: 82/139 -> 121/161 at 1440, 22/10 -> 11/8 at 390. Neutral on the
  laptop: the stalls do not scale with the range change. Kept (the shots stay recognisable,
  frames `scripts/_scratch-r56/g3d/lab1b/ladder/`); one commit to revert.

### 8.5 Item 4, marker work off the flight

Removals while the map was unsteady 851/270/125/125 -> 0 (cold/warm 1440, cold/warm 390); adds
inside a flight's duration 0 before and after; no job starts on an unsteady map. The remaining
"adds while unsteady" (993 at 1440, 250 at 390) are a job's own later frames (our first homes make
the map redraw; the job carries on at 25 a frame). Frame numbers unchanged beyond noise: our
markers were never the stalls.

### 8.6 Item 5, the look (contrast, round-54 kit, p99 of the real map pixels, 18 stops)

| | 1440 under the floor | 390 under the floor |
|---|---|---|
| phase 1 (§7) | 3 of 150 (AI, Connect = pill borders; "Start here" 2.8) | 10 of 90 |
| before item 5 (item-4 build) | 3 of 150 ("Start here" 3.33) | 8 of 90 ("Start here" 2.91; six index rows and the MLS line in the logo corner; "What is my home worth?" 2.43) |
| after (final) | **2 of 147** (AI, Connect: the kit reading the pills' own borders) | **0 of 82** outside the logo hole; 7 text-stops inside it, faded out on purpose |

Scrims: 28 px solid plus an 80 px eased fade (two crossed smoothstep ramps as a mask), six slots,
the header shade kept. They read as soft shadows now, still as a darker column behind the words
(`lab1b/i5c/cmp.jpg`). The logo corner: the words' layer is masked by a soft quarter-ellipse (solid
256 x 70 px) pinned to the window's bottom left and following the scroll, so "Google Maps (i)" is
clear at every scroll position, not only at the stops; A/B of the mask on the same build: no frame
cost above the noise. The phone hero's bottom padding grows 40 -> 96 px so its two links sit above
the corner.

### 8.7 Items 6 and 7

Copy: the hero count, the note under the search ("Map: Google. Every light is a home listed on
OneKey® MLS, standing where it stands. Point at one to see its town and price.") and the area line
now say every light is a home. Frames: all 18 stops at both widths,
`scripts/_scratch-r56/g3d/lab1b/*.png`. Videos (untracked): `docs/design-r56-video/lab1b-desktop.mp4`
(104 s) and `lab1b-phone.mp4` (82 s): the poster, the dissolve, a hover ("$997,000 · Mahopac") or a
tap ("$859,900 · Yorktown Heights"), every section, Queens from the list, back to the top. Gates:
tsc clean, vitest 1703 -> 1720.

### 8.8 Open

- The decision of §7.1 stands, now with numbers: on a laptop Google's flights hitch whatever we
  do around them; option 2 is the next measured step if "no freezing" is the bar.
- The night poster to daylight map dissolve is a hard change of look.
- Not exercised: the no-key / `gmp-error` path keeping the poster, reduced motion with the
  pre-warm, the owner's own machine (MacBook, 120 Hz), JS off.
