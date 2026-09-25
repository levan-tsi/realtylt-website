# Design round 59: the home page, the owner's sixth verdict

Branch `design/futuristic-r53`, worktree `~/realtylt-website-r53`, nothing pushed. The verdict
(2026-09-25, verbatim in `DESIGN-ROUND58.md` §7) asked three things, built one at a time:

1. **The lights, yellow like a light.** "Maybe make that yellow dots just yellow, like a light, but
   don't give brightness around it, maybe just a little bit, like five, ten percent, nothing more,
   or just a yellow dot."
2. **The counties with definition.** The county plates draw the whole street grid, the land and the
   buildings, and the county cameras come down to 8 to 10 km, so Poughkeepsie reads with no name.
3. **The flight back.** The transition moves the map again (a recorded film per adjacent flight).

## §1 The lights

### The cause

Round 58 halved the halo (3 to 4 px, alpha 0.46) and turned the neighbourhood glow off. The core
was warm white, `255, 248, 236`; the warmth had lived in the halo `255, 212, 158`. With the halo
halved, the point read WHITE on the black plate and the city "lost its brightness or vision".
Measured on the round 58 build: the light centres in Queens at 1440 averaged `226, 226, 222`
(`scripts/_scratch-r59-peaks.mjs`, local maxima with R at least 200 and R above B).

### The candidates

All on one build through two new knobs, `?core=r,g,b` (the core's colour) and `?ha=` (the halo's
strength), beside round 58's `?halo=` (the halo's radius scale) and `?glow=`. Frames at the
territory (145 km), Queens (10 km) and Dutchess (16 km), 1440 x 900 and 390 x 844, raw under
`scripts/_scratch-r59/1/` (gitignored), one directory a variant.

Core colour, halo alpha 0.08:

| | core | Queens 1440, mean light centre | reads as |
|---|---|---|---|
| r58 | 255, 248, 236, halo 0.46 | 226, 226, 222 | white, the complaint |
| D | 255, 232, 190 | 249, 249, 221 | white again beside the blue-white roads |
| B | 255, 222, 172 | 249, 247, 206 | pale yellow |
| **A** | **255, 212, 158** | **249, 240, 194** | **lamplight, apart from the roads** |
| C | 255, 200, 140 | 249, 230, 179 | leans amber, toward orange |

The centres read paler than the core because the sprite is ADDED to the plate (the ground under a
light adds its own grey-blue) and the halo adds its share; R clips first.

Halo strength with core A (radii unchanged, about 1.5 core radii, 3 to 4 px):

| halo alpha | Queens 1440, mean light centre | reads as |
|---|---|---|
| 0, a bare dot | 249, 227, 185 | a shade deeper and flatter, the edge hard |
| 0.05 | 249, 236, 192 | nearly the bare dot |
| **0.08** | **249, 240, 194** | **the edge of a lamp, no ring** |
| 0.10 | 249, 243, 197 | the same as 0.08 at a glance |
| 0.08 at 2 core radii (`?halo=1.25`) | 249, 240, 195 | no visible difference from 1.5 radii |

### The contact sheets

Each sheet is one crop across nine columns (r58 white, D, B, A, C at halo 0.08; A at 0, 0.05,
0.10; the final default), 1440 above and 390 below, at 2x nearest neighbour so a light's pixels
show:

- `docs/design-r59/lights-territory.jpg` (New York City at the territory's height; the phone row is
  the Bronx's edge at its own territory)
- `docs/design-r59/lights-queens.jpg`
- `docs/design-r59/lights-poughkeepsie.jpg` (the Dutchess stop)

### The default

- **Core `255, 212, 158`** (A): the halo's own warmth, a whitish-yellow lamp. D and B slip back
  toward the white he rejected, and at the territory they blend with the blue-white roads; C leans
  amber. A is one hue with the halo, never a saturated yellow.
- **Halo alpha 0.08 on a laptop, 0.10 on a phone** (`HALO_ALPHA`, `HALO_ALPHA_NARROW` in
  `components/home/g3d/glyph.ts`): inside his five to ten percent. The phone keeps round 57.3's
  rule of a slightly stronger light because its lights are read smaller.
- **Halo radius unchanged** (3 to 4 px, 1.48 to 1.58 core radii; the test holds it under 2).
- `HALO_RGB` is the same colour as the core. The neighbourhood glow stays off.
- **Overall brightness went down, not up** (the rule from his galaxy verdict): the mean of the NYC
  region at the territory, 1440, went from 22.23 to 21.69, and at Queens from 18.55 to 17.71.
- **The lit light** (hover, a focused card) still eases to white and 1.6x the core: a white point
  among yellow ones stands out more than before (`scripts/_scratch-r59/1/lit.png`).
- **The featured light's** halo is now a fifth up (x 1.2), not +0.08: on a halo of 0.08 the old
  term would have doubled it into a ring.
- With `?ha=0` the halo's radius falls to the core's, and a light's reach (culling, the keep-outs)
  counts the core too (`reachOf` = the largest of core, halo, glow).

### The comparison URLs for the owner

On the one build, the default beside the others:

- `/?core=255,248,236&ha=0.46` round 58's white
- `/?core=255,232,190` D, `/?core=255,222,172` B, `/?core=255,200,140` C
- `/?ha=0` a bare yellow dot, `/?ha=0.05`, `/?ha=0.10`

### The gates (the default build, :3102)

- tsc clean; vitest 2153 green (2147 before; six new truths in `glyph.test.ts`: the core's band,
  the halo at most 0.10 and 2 core radii, `?ha=`, `?core=` through lit and featured, the lit
  light brighter at the centre, the featured halo a whisper).
- Frames at all 20 stops at 1440 and 390 (`scripts/_scratch-r59/1/final/`).
- Hover 50 of 50 at Queens, 1440. The probe's phone path stopped on its own error
  (`window.__ml` undefined after a tap), not in the lights; not investigated in this section.
- Calibration 0.00 px (mean, p95, max) at hero, Queens, Dutchess county and Putnam, both widths:
  no light moved.
- Reduced motion: one 400 ms opacity fade, no scale.
- Contrast at 390: 0 texts under the floor at p95 and p99.

### The live map's cover

`scripts/make-ml-cover.mjs` loaded `/?cover=0`, which since round 58 is the plates page, so it
found no map. It now loads `/?cover=0&ground=ml`; the two covers
(`public/images/home-night-cover*.webp`, the `?ground=ml` comparison's load cover) were
re-photographed with the yellow lights. The visitor's default page (the plates) draws its lights
live and does not use them.

### Open

- On the phone, the lights under the words' scrim (the county list, the lead form) read as dim
  tan dots whatever their colour: the scrim, not the light. A question for the owner's look, not
  changed here.

### The orchestrator's verification of §1 (2026-09-25)

Re-run on the rebuilt :3102, nothing else running: tsc clean; vitest 2153 passed, 0 failed; the
calibration probe at the territory and Queens 0.00 px mean, p95 and max (443 and 754 common
lights); hover at Queens 1440: 50 of 50 named the nearest light, hit test 0.015 ms mean; the
phone's taps at the territory 30 of 30 and at Queens 5 of 5. Two instrument findings, not product:
the same hover probe run BESIDE the calibration probe (two headed Chromes) named 15 of 50 and
35 none, so a pointer probe is run alone; the hover probe's phone mode died at Queens because its
"hide" tap aims at `document.querySelector('h1,h2')`, the hero heading, off screen at Queens, so
the label stayed open and a later tap landed on it, which opens the listing (by design). Looked
at: the Queens frame at 2x (small pale-yellow lamps, apart from the blue-grey roads, no bloom),
the territory at 1440 and 390 (a warm scatter over the valley and the city). The default A stands.

## §2 The county plates with definition

### The cause, measured

The orchestrator's census (`scripts/_scratch-r59-omt.mjs`, `querySourceFeatures` on the loaded
tiles at the Dutchess county camera of round 58):

| window | map zoom | minor roads | service | buildings |
|---|---|---|---|---|
| 1440 x 900 as shot in round 58 (14 km) | 12.33 | 275 | 25 | 3 |
| 1440 x 900 at zoom 12.5 | 12.5 | 247 | 453 | 10 |
| 1440 x 900 at zoom 13.0 | 13.0 | 236 | 416 | 7 |
| 1440 x 900 at zoom 13.5 | 13.5 | 222 | 358 | 39 |
| 1440 x 900 at zoom 14.0 | 14.0 | 204 | 577 | 99 |
| 390 x 844 as shot in round 58 (14 km) | 11.63 | 216 | 0 | 0 |
| 390 x 844 at zoom 12.5 | 12.5 | 180 | 239 | 4 |
| 390 x 844 at zoom 13.5 | 13.5 | 175 | 295 | 108 |

The street grid was in the tiles; the live ladder drew `road-minor` at alpha 0.05 at zoom 12.33 (a
fade-in from zoom 12 to 13). Service roads arrive with the z13 tiles, buildings worth the name with
z14. A county camera at 9 km stands at map zoom 12.3 to 13.0, whose tiles are z12. So the style had
to draw the grid, the cameras had to come down, and the buildings needed tiles one zoom deeper than
the picture's own (the deep render below).

### The plate style (`components/home/ml/style.ts`, `nightStyle({ plate })`)

Used only by the renderer's pinned shot (`?plate=` in `MlGround.tsx`; `?pstyle=0` renders a pinned
shot in the live style for comparison). The live style is unchanged: a test holds the SHA-256 of
`JSON.stringify(nightStyle())`, of the slow line's and of the no-buildings variant to the values
taken before the option existed.

| layer | live | plate |
|---|---|---|
| minor, service | from z12, fading in to 0.16 | from z10, 0.30 constant |
| tertiary | from z10, fading in to 0.20 | 0.36 |
| secondary | from z8, fading in to 0.24 | 0.42 |
| primary, trunk | from z6, fading in to 0.30 | 0.48 |
| motorway | from z5, fading in to 0.36 | 0.56 |
| widths, px at z8 / z16 | 0.3 to 0.55 / 1.0 to 1.6 | 0.4 to 0.7 / 1.4 to 2.0 |
| path, track | none | only as bridges, 0.30 (the Walkway over the Hudson is a path) |
| rail | none | 0.16 |
| built land (residential, commercial, industrial, retail, railway) | `#0f1218` | `#141922` |
| parks (class park) | none | `#07090c`, the wood's tone (Central Park, Prospect Park, Flushing Meadows) |
| buildings | from z13, `#080a0e` to `#12161e` | from z12, `#151a23` to `#1f2632`, a shade above the town |
| water, shore, streams, wood, relief, sky | as live | as live |

One hue for every line (`NIGHT.road`, the moon's `#9fb0cc`); every colour's blue at or above its
red (the no-warmth truth is tested on the plate style too). The alphas are one step apart from the
street to the motorway, so a town reads as a grid with its arteries on it.

### The cameras (`components/home/ml/shots.ts`)

Each laptop centre keeps its signature where round 57.12 put it on the screen, right of the list:
the offset from the signature to the centre is scaled with the range. The phone centres stay on the
signature. Pitch 60 throughout. The zoom is the window's (a deep plate renders at one more).

| shot | range before | range now | zoom at 1440 | zoom at 390 |
|---|---|---|---|---|
| dutchess (chapter) | 16 km | 11 km | 12.68 | 11.98 |
| highlands (chapter) | 20 km | 12 km | 12.56 | 11.86 |
| westchester (chapter) | 16 km | 11 km | 12.70 | 12.00 |
| ulster | 14 km | 9 km | 12.97 | 12.27 |
| dutchess-county | 14 km | 9 km | 12.97 | 12.27 |
| orange | 14 km | 9 km | 12.98 | 12.28 |
| putnam | 14 km | 10 km | 12.82 | 12.13 |
| rockland | 14 km | 9 km | 12.98 | 12.28 |
| westchester-county | 12 km | 9 km | 12.99 | 12.29 |
| bronx | 9 km | 9 km | 12.99 | 12.29 |
| manhattan | 9 km | 9 km | 12.99 | 12.29 |
| queens | 10 km | 10 km | 12.84 | 12.14 |
| brooklyn | 10 km | 10 km | 12.84 | 12.14 |
| staten-island | 14 km wide, 18 km tall (heading 230) | 10 km both (tall heading 240) | 12.84 | 12.14 |
| harbour | 10 km | 10 km (re-rendered in the plate style) | 12.84 | 12.14 |
| hero, region | 145 and 140 km, 60 km | untouched, not re-rendered | 8.98 | 8.33 |

Staten Island's phone at heading 200 and 10 km was mostly harbour water; at 240 it looks over the
ferry slips at St. George into the island. Its lights in the window: 60 at 1440 and 45 at 390
(round 58's wider cameras held 97 and 89): the island's homes are few and spread south, the price
of standing close enough to read St. George.

### The deep render: adopted

A plate is rendered once, so it can ask for tiles one zoom deeper without changing its picture's
geometry: the same shot at twice the css size (2880 x 1800 at device scale 1; the phone's 780 x
1688 at 1.5), the same device pixels. `zoomForRange` depends on the window's height, so doubling
the css size alone puts the map one zoom deeper at the same range: no `?zplus=` switch was needed
(it would have made two). The style keeps its lines the picture's size (`plate: { deep: true }`:
every zoom stop up one, every width doubled). Compared on Dutchess county and Putnam at both widths
(`scripts/_scratch-r59/2/dc-wide*.jpg`, `pu-*.jpg`, `dc-tall.jpg`): the deep render draws the whole
residential grid and the buildings where the plain one draws the arteries. Adopted for all fifteen.

Two things had to be solved before the calibration probe printed 0.00:

1. **The camera centre's height.** The map clamps its centre to whichever terrain level has arrived
   when it settles, and one zoom deeper that is another level. Measured: Newburgh's centre stood at
   69.81 m plain and 60.08 m deep, which moved every light 0.90 px (mean) against the live map. The
   renderer now makes a plain pass first (the window's own css size), reads the centre's height,
   and the deep render holds it (`?elev=`: `setCenterClampedToGround(false)`,
   `setCenterElevation`); the script refuses a render whose centre is not at that height. The
   terrain level is the plain render's (`deepDemMaxzoom`: floor(zoom - 1) - 1), so the relief is
   what round 58 approved.
2. **The range the lights are planned at.** `plateRange` divided the render's range by the fit's
   scale, so a 2880 plate shown at 0.5 read as twice as far: the probe showed Queens with 660 lights
   on the plate against 755 on the live map. The manifest now records `k: 2` for a deep plate and
   the fit is read against the window the plate was composed for (tested: a deep plate gives the
   plain plate's range at 1440 and at 1920 x 1080).

After both: **0.00 px mean, p95 and max at all fifteen re-rendered shots and the territory, at 1440
and 390**, the same light counts on the plate as on the live map (from 45 lights in common at
Staten Island's phone to 754 at Queens).

### The grade

Compared at 1.0, 0.92 and 0.85 on Dutchess county and Putnam, then a linear gain
(`scripts/_scratch-r59/2/grade-*.jpg`, `gain-dc.jpg`): round 58's 0.85 curve turned the hillsides
grey round the denser streets; 0.92 kept the land dark but the streets dim. **The valley plates (the
three chapters, Ulster, Dutchess, Orange, Putnam, Rockland) take a linear gain of 1.25 and no
curve**: the streets come up most, the near-black land least, black stays black, and the lights
(drawn live, never graded) stay the brightest thing. Westchester county, Staten Island, the
boroughs and the harbour as rendered: they are grids edge to edge now.

### The bytes (AVIF, KB, `public/plates`)

| shot | wide 2880, r58 | wide 2880 | wide 1440 | tall 1170, r58 | tall 1170 | tall 780 |
|---|---|---|---|---|---|---|
| dutchess | 85 | 203 | 72 | 47 | 87 | 54 |
| highlands | 119 | 165 | 59 | 67 | 69 | 39 |
| westchester | 113 | 257 | 82 | 67 | 105 | 63 |
| ulster | 81 | 159 | 55 | 48 | 84 | 48 |
| dutchess-county | 74 | 209 | 72 | 41 | 98 | 58 |
| orange | 92 | 199 | 71 | 48 | 134 | 76 |
| putnam | 93 | 161 | 60 | 52 | 87 | 54 |
| rockland | 105 | 219 | 71 | 54 | 88 | 45 |
| westchester-county | 159 | 365 | 116 | 75 | 163 | 86 |
| bronx | 168 | 412 | 118 | 78 | 208 | 107 |
| manhattan | 155 | 367 | 109 | 76 | 193 | 103 |
| queens (AVIF 50) | 174 | 366 | 102 | 62 | 209 | 106 |
| brooklyn | 145 | 433 | 114 | 70 | 260 | 122 |
| staten-island | 89 | 245 | 67 | 76 | 115 | 57 |
| harbour | 127 | 290 | 82 | 53 | 104 | 53 |
| hero (untouched) | 188 | 188 | 64 | 99 | 99 | 53 |
| region (untouched) | 202 | 202 | 73 | 140 | 140 | 80 |

Wide 2880: min 159 (Ulster), median 219, max 433 (Brooklyn). Tall 1170: min 69, median 104, max
260. Queens came out at 450 KB at quality 55 and is written at 50 (366 KB; against the raw render a
mean 3.21 levels apart, p95 11, against 2.87 and 10 at 55): the script now does that for any plate
over 450 KB. `public/plates` is 23.7 MB in all (136 files; 11 MB in round 58): the WebP fallbacks
carry most of the growth, and a visitor fetches one AVIF per plate, lazily, decoded ahead of the
scroll. The first screen is untouched: the hero's and the tail's files are byte-identical (checked
by md5 against round 58).

### His test (`docs/design-r59/definition-wide.jpg`, `definition-tall.jpg`)

Every stop on the plates page with `?towns=0` and every word of the page hidden (no list, no county
name, no card): the plate and its lights only (`scripts/_scratch-r59-histest.mjs`). The sheets are
numbered, not named, so a reader can take the test cold. The key, and what identifies each:

1. Dutchess chapter: the Hudson running north with Poughkeepsie's grid on the east bank and the two
   crossings below the city.
2. Highlands chapter: the river's bend through the Highlands between steep moonlit ridges, Cold
   Spring's small grid on the east shore.
3. Westchester chapter: the Tappan Zee's long crossing, Tarrytown's grid in front, Nyack across.
4. Ulster: Kingston's grid over the river, the Rondout creek cutting diagonally down to the Hudson.
5. Dutchess county: Poughkeepsie's grid beyond the river, the Mid-Hudson Bridge and the Walkway.
6. Orange: Newburgh's waterfront grid across the bay, the Newburgh-Beacon bridge at the edge,
   Beacon in front.
7. Putnam: the reservoirs' branching lakes, Carmel's strip along Lake Gleneida.
8. Rockland: Nyack's grid on the shore and the Tappan Zee leaving it across the widest reach.
9. Westchester county: the Sound's ragged shore with New Rochelle's grid down to it.
10. The Bronx: the Harlem River between two grids, the Hudson and the George Washington Bridge.
11. Manhattan: Central Park's dark rectangle, Midtown's towers below it.
12. Queens: Flushing Bay and LaGuardia's runways, the dark field of Flushing Meadows.
13. Brooklyn: Prospect Park's dark shape, the harbour and the piers behind it.
14. Staten Island: the Verrazzano's line to Bay Ridge's loop on a laptop; the ferry slips at St.
    George on the island's tip on a phone.

The weakest are the Highlands chapter and Putnam (hillsides and lakes more than a town) and the
Westchester chapter on a phone; each still reads by its water. On a laptop every county picture
stands right of the list as before (the frames at all stops, `scripts/_scratch-r59/2/final-1440/`
and `final-390/`; the town names sit on their towns).

### The gates (the final build on :3102)

- tsc clean; vitest 2163 (2153 before; new truths: the plate style's six, the live style's
  fingerprint, the deep plate's range, the county and chapter ranges read back from the manifest,
  the deep manifest's `k` and camera).
- Calibration (`_scratch-r58-calib.mjs`): 0.00 px mean, p95 and max at all fifteen re-rendered
  shots and the territory, at 1440 and 390.
- Transition walk (`_scratch-r58-transition.mjs`): 1440 worst in-flight frame 20.9 ms (round 58:
  27.8), p50 6.9; 390 worst in-flight 20.8 ms. The long frames outside a flight (97 ms at 1440, 42
  at 390) sit at the probe's instant scroll jumps, as in round 58.
- Cold boot (`_scratch-r58-boot.mjs`, medians of three): 1440 reveal 738 ms, lights 837, LCP 324;
  390 reveal 692, lights 788, LCP 308. The hero plate is the same 189 KB.
- Hover at Queens, 1440, run alone: 50 of 50 named the nearest light, hit test 0.015 ms mean.
- Contrast: 390, 0 under the floor at p95 and p99 over every stop; 1440, the same two header pills
  the kit misreads since round 57.
- Overflow 0 at 768 x 1024, 1024 x 768, 1366 x 768, 1920 x 1080; reduced motion one 400 ms opacity
  fade, no scale; JS off, the plate stands at 1440 and 390 and the lights sentence is gone.

### Open

- The boot probe counted the lights' fetch twice in five of six runs (263 KB: `api/lights` at about
  100 ms and again at about 630 ms). No loading code changed in this section; worth a look.
- The hover probe's click routes at about 800 ms as in round 58; the opened page lands on
  `chrome-error://` inside the probe. The listing route was not touched here and was not
  investigated.
- The far third of each valley plate is still quiet hillside: the pitch keeps a horizon by design.
  A lower pitch would fill the frame with town and flatten the place.
- The Bronx and Manhattan stand at window zoom 12.99 at 1440. Their plates are deep, so it does not
  matter to the picture, but a later camera change there should be re-measured.

### The orchestrator's verification of §2 (2026-09-25)

Re-run on the rebuilt :3102: tsc clean; vitest 2163 passed, 0 failed; the calibration probe on the
re-rendered plates, Dutchess county, Putnam, Staten Island and Orange at 1440 and Dutchess county
and Queens at 390: 0.00 px mean, p95 and max, with the plates drawing the same number of lights as
the live map at every one (253, 96, 60, 281, 139, 278); the transition walk at 1440: 16 flights,
the worst in-flight frame 7.2 ms, 0 over 34, the light layer 0.69 ms mean; the cold boot at 1440
(medians of 3): the plate on 619 ms, the lights 769 ms, LCP 320 ms, 1953 KB. The hero and region
plates are byte-identical to round 58's (git shows no change under public/plates for either).

His test, taken cold on both sheets before reading the key: Poughkeepsie (5) is unmistakable at
1440 (the grid, the Mid-Hudson Bridge and the Walkway side by side, the built mass); the Tappan
Zee names 3 and 8; Central Park 11, Flushing Meadows and the runways 12, Prospect Park 13, the
Verrazzano 14; Kingston's Rondout 4 and Newburgh's bay 6 read to someone who knows the valley;
Putnam (7) reads as the reservoirs' lake district with Carmel's strip, which is what Putnam is;
the Highlands chapter (2) by its gorge. Staten Island's camera trades lights in the window (60 at
1440, 45 at 390, from 97 and 89) for the Verrazzano and St. George: accepted, the ask was
recognition. The valley plates are lifted by a gain of 1.25 and the hillsides carry a moonlit
sheen; the lights stay the brightest thing.

Open from this verification: `public/plates` is 23 MB (from 11; the WebP fallbacks carry most of
it); the boot fetched `/api/lights` twice in 2 of 3 runs (131 KB became 263), which the builder
also saw and did not touch: the orchestrator is looking into it (the page preloads it with
`crossOrigin: "anonymous"` and the client fetches it plain).

## §3 The flight as a film

His sixth verdict: "it would move the map and go to that county where you are, but now it just
disappears and appears close to that one." The design kept both halves of his fifth and sixth
verdicts: nothing loads at the moment of a move, and the map moves. **The film is in.**

### As built

- **The path** (`components/home/plates/flight-path.ts`, pure, 8 tests): maplibre-gl 6.11's `flyTo`
  ported (van Wijk and Nuij, `curve` 1.3 as the live controller passed, MapLibre's default easing
  `bezier(0.25, 0.1, 0.25, 1)`, the bearing the shorter way round, pitch and the centre's height
  linear in k). At k 0 it returns plate A's camera and at k 1 plate B's, exactly. Frame count
  `round(flightMs(A, B) * 30 / 1000)` by `ml/shots.ts` flightMs: 55 to 78 frames, 1.84 to 2.56 s.
- **The recorder** (`scripts/make-flights.mjs`, run with `node --experimental-strip-types`): for each
  of the 16 adjacent pairs and both aspects, the running site pinned on the plate (`?plate=`) in the
  plate's own geometry (deep: 2880 x 1800 css at 1, 780 x 1688 at 1.5; the plain hero and region:
  1440 x 900 at 2, 390 x 844 at 3), and for every frame `jumpTo` its camera with the centre's height
  held, wait for `idle` and then 250 ms with no render, read `liveFrame()` (the matrix and world
  size), photograph. A pair whose plates were drawn differently (the plain hero or region beside a
  deep plate; the phone's chapters on terrain level 10 beside the counties on 11) is shot twice, once
  as each plate was, and the two renders dissolve between k 0.3 and 0.7 (5 of the 32 clips). The
  grade is interpolated by k between plate A's and plate B's (make-plates.mjs GRADE and its LUT,
  now exported). A speed-driven gaussian blur (sigma 0.01 x the frame's motion in device pixels, at
  most 2.5; 0 at the two ends) stands for a shutter: mid-flight the ground moves 150 to 300 device
  pixels a frame, no hairline is readable there, and a sharp one is what costs the encode its bytes.
  Graded frames go to a lossless FFV1 master; the encodes come from it.
- **Render-level joins**: the film's first and last frames against the plates' own raw pictures,
  graded as the plates were: 64 joins, mean 0.03 levels, the worst 0.28.
- **The encodes (after the orchestrator's decision, below)**: ONE codec an aspect. The laptop's clip
  is VP9 in WebM at 1440 x 900, crf 46; the phone's is H.264 in MP4 at 780 x 1688, crf 30 (the
  900 KB cap loop never had to raise either). 4:2:0, BT.709 limited range, tagged; a key frame
  forced on the first and the last frame (the two frames a plate meets); the back clip is the master
  reversed. The first encode (VP9 crf 40 and H.264 crf 27 for both aspects, 88.5 MB) is in the
  history at `8929467`. The frames' cameras and matrices beside each pair
  (`public/flights/<a>--<b>-<aspect>.json`, 13 to 18 KB), the manifest `plates/flights.gen.ts`
  (generated; its truths in `flights.gen.test.ts`).
- **The engine** (`plate-controller.ts`, `plate-motion.ts`, `plate-frame.ts`): a third layer above the
  plates (`[data-plate-film]`: the clips' video elements and their own light canvas). A request for
  an adjacent stop whose film is decoded (every byte buffered, frame 0 decoded, the matrices in)
  plays it: the film's first frame dissolves in over plate A for 140 ms while both are still, the
  clip plays, the lights are drawn on each presented frame (`requestVideoFrameCallback`, the frame
  index from `mediaTime`; rAF and `currentTime` where it is missing) through that frame's matrix,
  plate A's set of lights fading out and plate B's in over 80 percent of the flight (the live map's
  rule), then at `ended` plate B is put under it and the film dissolves out onto it for 180 ms,
  still. A request during a film hurries it (`filmHurry`: up to 4x, within 250 ms; a cut to plate B
  past that, which a 2.6 s clip never reaches). Anything else is round 58's fade over: a
  non-adjacent jump, a film not decoded, reduced motion, `?film=0`, and a refused `play()` (after
  one refusal the page stops asking and fetches no more clips).
- **Loading**: nothing before the page has loaded, its lights have arrived and the browser is idle;
  then the film from the stop the page is on to the nearest different stop ahead (and behind, only
  once the visitor has turned back up the page), each asked for after the plate it lands on is
  decoded, the work done while the page is still (loading or letting go of a clip while a film
  started cost that film a 50 to 110 ms frame, measured), at most four films kept. The formats the
  browser plays are ranked by `mediaCapabilities` (a power-efficient decoder first), and a clip is
  played in the first of them it was encoded in (`plate-frame.ts filmFormat`); if none, there is no
  film: no video element, no fetch, the fade over. Proven with a `canPlayType` and `decodingInfo`
  stub: at 1440 with WebM refused, and at 390 with MP4 refused, the move was a fade and the page held
  0 video elements and fetched 0 clips; at 390 with WebM refused the phone's MP4 film played.
- **Video elements held**: one per film decoded ahead (a src is never swapped on a playing element).
  Measured over a walk of every stop: at most 4 at once on a laptop (`FILMS_KEPT.wide`), at most 2
  on the phone (`FILMS_KEPT.tall`: the next film ahead and the one just played), and on the phone
  they are MP4, not WebM. Where `requestVideoFrameCallback` is missing (Safari before 15.4) the
  lights follow `currentTime` on each animation frame.

### The spike (dutchess-county to orange, then hero to dutchess)

The chain proved on one pair first: recorded in 82 s, render joins 0.00 and 0.01 levels, then hero to
dutchess (the plain-to-deep pair: two renders dissolved) 0.00 and 0.00. The encode was the finding:
at the plate's device size the content is expensive. Dutchess county to Orange, VP9, no blur:

| encode | KB | levels off the master, first / mid / last frame |
|---|---|---|
| 2880, crf 32 | 4997 | 2.17 / 2.96 / 3.04 |
| 2880, crf 44 | 1897 | 2.72 / 3.77 / 3.93 |
| 2880, crf 56 | 604 | 3.81 / 4.80 / 5.21 |
| 1440, crf 40 | 788 | 2.77 / 4.01 / 4.10 |
| 1440, crf 46 | 435 | 3.28 / 4.57 / 4.74 |
| AV1 (SVT, preset 5) 2880, crf 48 | 1179 | 3.86 / 4.09 / 3.60 (no gain over VP9 here) |
| the 4:2:0 limited-range conversion alone (lossless VP9) | | 1.68 |

With the speed blur: 2880 crf 46 1028 KB (the two key frames are 405 KB of it), 1440 crf 40
559 KB. So the laptop's clip is 1440 wide for every screen (the film is motion; the plate it lands on
is the sharp picture) and the phone's 780 wide.

### The joins on screen (Chrome, the clip and the plate in one window, `_scratch-r59-join.mjs`)

Levels apart (mean of the per-pixel largest channel difference), the clip's first frame against
plate A and its last against plate B. The final encodes (wide VP9 crf 46, phone H.264 crf 30), with
the first encode's (VP9 crf 40 both) in brackets:

| pair | 1440 at 1x | 1440 at 2x | 390 at 3x |
|---|---|---|---|
| hero to dutchess | 2.75 / 3.21 (2.48 / 2.85) | 3.33 / 4.08 (3.02 / 3.70) | 3.66 / 3.64 (2.86 / 2.68) |
| dutchess-county to orange | 3.21 / 3.21 (2.87 / 2.84) | 4.27 / 4.24 (3.91 / 3.84) | 4.02 / 5.12 (2.92 / 3.74) |
| queens to brooklyn | 5.44 / 5.02 (5.24 / 4.68) | 7.19 / 7.25 (6.65 / 6.75) | 6.71 / 7.65 (4.89 / 5.71) |
| harbour to region | 4.04 / 2.98 (3.75 / 2.60) | 5.61 / 3.61 (5.21 / 3.19) | 4.30 / 4.56 (3.37 / 3.07) |

Only the valley pairs at 1x in the first encode sat under 3; the dense city plates (Queens,
Brooklyn: grids edge to edge, their AVIF itself at quality 50) and every 2x screen (a 1440 clip
against a 2880 plate) never did. That is why neither end is a cut: the film dissolves in over
plate A (140 ms) and out onto plate B (180 ms) while both pictures are still, so the codec's levels
arrive as a soft focus, never a step. Looked at frame by frame: Queens to Brooklyn at 2x (first
encode) and on the phone (final encode, `cast/v2-qb-390/`, the landing frame by frame): no visible
cut at either end.

### The lights ride the film (`_scratch-r59-filmcal.mjs`)

A film paused at a frame; its drawn lights against the live map jumped to that frame's recorded
camera (the same homes, the live map's own matrix): **0.00 px mean, p95 and max** at hero to
dutchess frames 19, 35, 55 (1440; 13 to 281 lights), queens to brooklyn 12, 30, 48, dutchess-county
to orange 30, 50, and hero to dutchess on the phone at 20, 40, 60 (165 lights). The sync with the
picture, by eye on a Queens to Brooklyn frame mid-flight (the 2x screencast): every light on land,
none on the water, along the streets as on a plate.

### The main thread and the frames

- A walk of every stop with the films playing out (`_scratch-r59-walk.mjs --mode=stops`, 3.2 s a
  stop): 16 of 16 transitions films, 0 dropped frames; the worst frame inside a film 27.8 ms at 1440
  (0 over 34) and 20.9 ms on the phone (390, 3x); the film's light draw 0.58 to 0.85 ms mean, 2.6 ms
  max at 1440, 0.31 ms mean on the phone; 0 long tasks during a film. A Chrome trace of that walk:
  0 main-thread events of 50 ms or more; the video decoded by the GPU process's hardware decoder
  (`D3D11VideoDecoder`, `MojoVideoDecoder` on the Media and GPU threads, not the main thread).
- Round 58's walk (`_scratch-r58-transition.mjs`, a stop every 1.5 s, so the films are hurried or
  queued): 1440 worst in-flight frame 34.7 ms, at the probe's instant scroll to the second Highlands
  stop landing mid-film (the page's own raster of a new screen, as round 58 found for its 97 ms still
  frames); the phone 20.9 ms. Its trace: 0 main-thread events of 25 ms or more.
- After the re-encode (final clips): the stops walk 16 of 16 films at both widths, the worst in-film
  frame 27.9 ms at 1440 in 2 of 4 walks (104 and 118 ms in the other two, at the second film's
  start) and 27.6 ms on the phone; the light draw 0.70 ms mean at 1440, 0.35 on the phone. Round
  58's walk: 1440 worst in-flight 41.6 ms (in flight to Staten Island, at the probe's instant jump),
  the phone worst in-flight 27.7 ms.
- The second film of a visit can open with one long frame (27 to 118 ms: a second hardware decoder
  starting); it falls inside the 140 ms still dissolve, where no motion shows it.

### Nothing loads on a move

- A reader (`--mode=read`, one screen every 1.5 s, smooth scroll): 4 films and 4 fades; the fades are
  the stops the reader passes in one step (highlands to ulster, ulster to putnam, putnam to queens,
  queens to staten-island: not adjacent, so a fade by design), none a film not ready. That read
  fetched 16 files, 3.0 MB. A read that stops at every stop fetches the 16 forward clips and their
  matrices: 6.4 MB at 1440, 9.1 MB on the phone (the first encode: 10.5 and 10.5).
- Outrun (Slow 4G, a scroll to the Dutchess chapter the moment the page shows): a fade, not a wait
  for the clip; it landed 3.8 s later because the Dutchess PLATE was still arriving (the same with
  `?film=0`: 3.7 s; the round 58 rule, the current picture holds until the next plate is in). Clips
  are asked for only after the plate they land on is decoded, so a clip never delays a plate.
- `play()` refused (a stub rejecting it, phone): the fade over ran, landed in 943 ms, and the page
  stopped asking for films.

### The cold boot (`_scratch-r58-boot.mjs`, medians of 3, 1440 at 2x)

First encode: reveal 767 ms, lights 804 ms, LCP 260 ms, 1826 KB, no clip in it. Final encode:
reveal 635 ms, lights 664 ms, LCP 268 ms, 1827 KB (a first series on the same build, the PC busier:
862 / 1003 / 328; one run of the three fetched the Dutchess plate early, 2031 KB) (a second series on a busier PC:
937 / 1056 / 328 with films, 894 / 981 / 408 with `?film=0`: the same within the noise). The phone:
reveal 835, lights 934, LCP 348. The first clip (hero to dutchess, 355 KB now, 609 KB at the first
encode, and its 15 KB of matrices) is asked for at 2.6 to 2.9 s, after the page's own half-second task at about 1.3 s and
the browser's idle, and is in 5 ms later on this machine. A visitor scrolling in the first 2.6 s
reaches the Dutchess stop only three screens down (the territory holds three stops), so the first
film is there in practice; if not, that one move fades.

### Reduced motion, JS off, the rest

Reduced motion: no film layer, no clip fetched, no video element; one 400 ms opacity fade. JS off:
the plate stands, nothing fetched. `?film=0`: round 58's fade over on the same build, no clip
fetched. Calibration on the plates unchanged: 0.00 px at hero, Queens, Dutchess county, Putnam
(1440) and hero, Queens (390). Hover at Queens 50 of 50 (run alone), hit test 0.009 ms. Contrast:
390 zero under the floor; 1440 the same two header pills. Overflow 0 at 768 x 1024, 1024 x 768,
1366 x 768, 1920 x 1080. tsc clean; vitest 2163 to 2189 (the path, the film's rules, the film
neighbours, the manifest, one codec an aspect, the film's format).

### The bytes (KB, `public/flights`)

| clip set | n | min | median | max | total |
|---|---|---|---|---|---|
| wide 1440 VP9 WebM, crf 46 | 32 | 263 | 384 | 508 | 12.0 MB |
| tall 780 H.264 MP4, crf 30 | 32 | 399 | 549 | 663 | 17.3 MB |
| the frames' matrices (JSON) | 32 | 13 | 16 | 18 | 0.5 MB |

`public/flights` is **30.1 MB** (96 files), inside the orchestrator's expected 30 to 36 MB. A visitor
fetches one aspect's clips, lazily: 6.4 MB on a laptop and 9.1 MB on a phone for a read that stops
at every stop, 3.0 MB for a quick read.

**The levers, and what was taken (the orchestrator's decision, 2026-09-25).** The first encode was
88.5 MB (VP9 crf 40 and H.264 crf 27, both aspects, both codecs). Taken:

1. The laptop's H.264 set dropped (23.6 MB): the only desktop browser without VP9 in WebM is Safari
   before 14.1 (April 2021), which gets the fade.
2. The phone's VP9 set dropped (20.3 MB): iOS Safari plays WebM only from iOS 15 (September 2021),
   decodes VP9 in hardware only from the A14 (iPhone 12 and later) and in software before it, and
   there are reproducible reports of Safari crashing on iOS 17 and 18 on pages holding several WebM
   video elements; H.264 decodes in hardware on every phone. Sources: https://caniuse.com/webm ,
   https://en.wikipedia.org/wiki/WebM , https://github.com/fyrd/caniuse/issues/7541 ,
   https://salivity.github.io/libvpx-vp9/article/does-ios-safari-support-vp9-video-playback .
   `requestVideoFrameCallback` is Safari 15.4 and later
   (https://caniuse.com/mdn-api_htmlvideoelement_requestvideoframecallback), so the `currentTime`
   fallback is the path on older iOS.
3. VP9 at crf 46 (the laptop's set 20.0 to 12.0 MB) and the phone's H.264 at crf 30 (23.7 to
   17.3 MB).

Not taken: back flights as fades (they are fetched only once a visitor turns up the page anyway),
a lower frame rate, smaller clips.

**What crf 46 and H.264 30 changed, looked at** (the same mid-flight frame, Queens to Brooklyn frame
30, 2x crops): on the laptop the fine side streets in the far half of the frame go from faint lines
to haze while the arterials and the near grid still read
(`scripts/_scratch-r57/58/flights/look/qb-wide-crf40-vs-46.png`, crf 40 above, 46 below); on the
phone the grid stays whole, its lines a touch softer with a little ringing
(`look/qb-tall-vp9crf40-vs-h264crf30.png`, VP9 crf 40 left, H.264 crf 30 right). At 30 frames a
second in flight neither shows; the plates the films land on are unchanged.

### What a visitor sees (the frames looked at)

- Hero to Dutchess, 1440 (`scripts/_scratch-r57/58/flights/cast/final-hero-1440/`): the territory
  turns and sinks toward the valley, the city's lights sliding off the bottom, and the camera settles
  over the Hudson with Poughkeepsie's grid coming up and its lights fading in.
- Dutchess county to Orange, 1440 (`cast/final-dutchess-county-1440/`): Poughkeepsie's grid wheels
  away, the river turns under the camera, and it lands over Newburgh's waterfront with its lights.
- Queens to Brooklyn, 1440 (`cast/final-queens-1440/`): Flushing Meadows slides off to the right as
  the map rotates south, the borough's lights drift with the streets, and Brooklyn's grid settles
  with its lights.
- Dutchess county to Orange, 390 (`cast/final-dco-390/`): the motion shows only above and below the
  county list (the list's scrim covers the middle of the phone's screen): lights drifting in the
  gaps.

### Open

- The joins rose with the lighter encode (above); the dissolves carry them, and the eye meets them
  only as a film settles. The Queens and Brooklyn films on a 2x screen and on the phone are the
  furthest from their plates (6.7 to 7.7 levels).
- Mid-flight, between about 0.7 and 1.3 s of a county flight, the frame carries few lights: plate A's
  lights have left the view and plate B's are still fading in (the live map's own plan rule). The
  ground moves; the lights return as it lands.
- The second film of a visit can open with one frame of 27 to 118 ms (a second hardware decoder
  starting): seen in 2 of 4 walks at 1440 after the re-encode, inside the still 140 ms dissolve.
- The first move up the page fades (the back films are asked for once the visitor turns).
- Not verified: a real phone's decoder (Chrome's phone emulation on this PC decodes with the desktop
  GPU), iOS Safari's MP4 path (built, served, stubbed; no iPhone here), Firefox.
- Scratch on disk, gitignored: the lossless masters (4.1 GB) and sample raw frames (1.3 GB) under
  `scripts/_scratch-r57/58/flights/`, kept for a re-encode; the orchestrator deletes them.

## §4 The orchestrator's verification of §3 and the round's close (2026-09-25)

**Verified on the final build (:3102, built after the last engine change), nothing else running.**
tsc clean; vitest 2189 passed, 0 failed (2147 at the round's start: +6 the lights, +10 the plates,
+3 the lights fetched once, +23 the film). The transition walk at 1440 (round 58's cadence, a stop
every 1.5 s): 4,333 frames, p50 6.9 ms, p95 7.1, p99 7.2; the worst in-flight frame 34.7 ms in the
flight to Staten Island where the probe's instant scroll jump lands mid-film (the 90 ms frame is
the same jump on a still, as in round 58); a visitor's scroll is not an instant jump. Hover at
Queens 50 of 50 alone. The mid-flight frames looked at (`scripts/_scratch-r57/58/flights/cast/`):
the map moves again, Poughkeepsie's grid wheeling away and the river turning under the camera to
Newburgh, Flushing sliding off as the map rotates onto Brooklyn, the lights riding the streets.
The crf 46 crop beside crf 40 (`flights/look/qb-wide-crf40-vs-46.png`): the far side streets go
from faint lines to haze, the near grid and the main roads read; in motion at 1x it passes, and
the lossless masters stay on disk for a re-encode after his look.

**Three decisions taken by the orchestrator, with their evidence.**
1. **The bytes.** The first encode (both codecs, both aspects) was 88.5 MB in `public/flights`,
   four times the handoff's estimate, and was committed. The decision: one codec an aspect, VP9
   WebM for the laptop (only Safari before 14.1, April 2021, lacks it; it fades) and H.264 MP4 for
   the phone (iOS Safari plays WebM only from iOS 15, in hardware only from the A14, and crashes on
   pages holding several WebM video elements; H.264 decodes in hardware on every phone; sources in
   §3), at crf 46 and 30. Result 30.1 MB (64 clips, 32 matrix files): a read that stops at every
   stop fetches 6.4 MB on a laptop and 9.1 MB on a phone, a quick read 3.0 MB, and no clip is in
   the first screen. The history was then rewritten (nothing was pushed): the film's six commits
   became three, and the branch carries the final clips only; the tree was proven identical to the
   pre-rewrite head by an empty diff before the safety tag was removed.
2. **The lights fetched once** (`27f579f`, §2's open item): round 58's `<link rel="preload"
   as="fetch">` for `/api/lights` was never matched by the client's fetch on Chrome (a request-level
   probe: two network fetches with their own timings on every cold visit, 136 KB twice, the lights
   waiting for the second at ~550 ms). Replaced by one line of inline script at the top of the
   page that starts the fetch with the document and leaves the promise on the window, taken once
   by `lib/idx/lights-client.ts`; measured after: one request per visit, from the script at ~100 ms.
   Three tests. The site's CSP allows the inline script (`'unsafe-inline'`, no nonce).
3. **The dissolves at the film's ends** (builder 3's deviation, accepted): the encode puts the
   on-screen joins at 2.75 to 7.65 levels (worst on the Queens and Brooklyn grids at 2x), so the
   film's first frame dissolves in over plate A for 140 ms while both are still and its last frame
   dissolves out onto plate B for 180 ms; looked at frame by frame, no visible step. It adds 320 ms
   to a transition of 1.6 to 2.6 s.

**Two instrument findings, recorded so the next session does not chase them.** A pointer probe
run beside another headed Chrome under-counts (15 of 50 and 14 of 50 in two such runs across the
round; 50 of 50 alone every time). The hover probe's phone mode dies at Queens because its hide tap
aims at the hero's heading, off screen there, so a later tap lands on the open label, which opens
the listing by design; at the territory 30 of 30 taps pass.

**The state at the close.** Branch `design/futuristic-r53`, about 235 commits over `main`, NOTHING
pushed. `public/plates` 23.7 MB (136 files), `public/flights` 30.1 MB (96 files). Scratch on disk,
gitignored: the lossless masters (4.1 GB, `scripts/_scratch-r57/58/flights/master/`, kept for a
re-encode at another crf after his look) and the screencasts and crops (`cast/`, `look/`); the
raw frames, the join and end renders (1.7 GB) deleted. The PC's disk is 97 percent full (16 GB
free of 466): `scripts/_scratch-r57/` holds 8.8 GB of this and earlier rounds' frames.

**Open, in the order a visitor would notice.** The film's weight on a phone (9.1 MB over a full
read, lazy, never blocking; his call between crf and motion). The 1440 clip is softer than the
2880 plate on a 2x screen (the MacBook); the dissolves carry the change. Mid-flight, from about
0.7 to 1.3 s of a county flight, few lights are on screen (plate A's have left, plate B's are
fading in: the live map's own rule). A second film of a visit can open with one 27 to 118 ms
frame inside its still dissolve (a second hardware decoder starting). The first move up the page
fades (the back films are warmed once the visitor turns). Not verified on real devices: an
iPhone's MP4 path and its decoder, Safari, Firefox. Carried: `public/plates` at 23.7 MB (the WebP
fallbacks), the tablet aspect, the page's own weight on a slow line, the blog template's alt text
and covers, the five seller articles, the 320 tap label overlap.
