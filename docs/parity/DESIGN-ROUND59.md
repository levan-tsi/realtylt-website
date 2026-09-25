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
