# Round 55, phase 2: the cities glow where they are (the night-lights underlay)

The owner's ask (2026-09-22): "focus the light on the map where the actual cities are, distribute
properly ... mimic where the cities are and make the map as realistic as possible". Today's lights
are the for-sale inventory on measured addresses (15,649 homes), so the picture is the market, not
the region: Queens burns with 5,741 lights, Manhattan (370) is nearly dark, the valley towns are
sparks with no glow around them. The fix is a second, TRUE layer under the listings: the real
light the region gives off at night, from satellite, draped on the same terrain grid.

## 1. Source and licence (fetched and read 2026-09-22)

- **NASA Earth Observatory, "Black Marble" 2016**, Suomi NPP VIIRS day-night band, cloud-free
  composite. Public downloads, no login, from `eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/`:
  - `BlackMarble_2016_B1_geo.tif` (HEAD 200, image/tiff, **310,401,888 bytes**): the 500 m
    tile for latitude 0..90 N, longitude 90 W..0, which holds the whole served region.
  - `BlackMarble_2016_3km_geo.tif` (64 MB, global, 3 km): too coarse for a 200 m grid; a fallback
    for a first look only.
- Licence: NASA Media Usage Guidelines (https://www.nasa.gov/nasa-brand-center/images-and-media/,
  fetched 2026-09-22): "NASA content – images, audio, video, and media files used in the rendition
  of 3-dimensional models, such as texture maps and polygon data in any format – generally are not
  subject to copyright in the United States. ... NASA content used in a factual manner that does
  not imply endorsement may be used without needing explicit permission. NASA should be
  acknowledged as the source of the material." Record this verbatim in
  `public/images/ATTRIBUTIONS.md` under `public/geo/`, and add to the footer credit line
  (`components/site/SceneCredit.tsx`): "Night lights: NASA Earth Observatory (Black Marble 2016,
  Suomi NPP VIIRS)". No NASA insignia or logotype anywhere (those are protected).
- Alternative, if the 2016 composite disappoints: EOG VIIRS annual VNL (Colorado School of Mines),
  CC BY 4.0, "cite EOG as the data source" (https://eogdata.mines.edu/products/vnl/), but its
  downloads sit behind a free registration. Not needed unless NASA's 2016 tile fails.

### 1a. The tile, read (orchestrator, 2026-09-22 late)

The B1 tile is already in the cache: `node_modules/.cache/blackmarble/BlackMarble_2016_B1_geo.tif`
(310,401,888 bytes, 21600x21600, RGB 8-bit; 240 px per degree = ~348 m per pixel east-west at
41.3 N). The served box is the window `left 3621, top 11457, 376 x 455` px (probe script:
`scripts/_scratch-r55-blackmarble-check.mjs`, preview `scripts/_scratch-r55/blackmarble-window.png`,
looked at: the metro blazing at the bottom, the Hudson a dark ribbon up the middle, Poughkeepsie,
Newburgh and Kingston as clusters, the Catskills black). Probed luminance: Midtown 255, Flushing
255, Yonkers 255, White Plains 255, Newburgh 255, Poughkeepsie 255, Kingston 255, Slide Mountain
10, Harriman woods 16, the river at the Tappan Zee 115.

**So this file is an 8-bit visualisation, not radiance: every town saturates at 255.** Intensity
cannot rank Midtown above Poughkeepsie. Rank by EXTENT instead: blur the luminance with a
Gaussian of about 1.5 to 2 km before resampling, so a large lit area keeps a high peak and a small
town's peak falls with its size; take luminance only (the RGB is a warm tint) and drop the water
tint by masking with the G channel where it is mostly water. If a truer ranking is wanted later,
the radiance products need a free registration (EOG VNL, or NASA VNP46A4 via Earthdata); not this
round.

## 2. The asset: one more channel in the file we already ship

`public/geo/valley-elevation.webp` is a lossless RGB WebP (652x1050, 200 m cells, row 0 north,
x linear in longitude, y linear in latitude) with R = elevation, G = water fraction, **B unused**.
Put the night radiance in B: one fetch, no new request, the same `elevation.ts` decode.

`scripts/build-elevation.mjs` gains a step (or a sibling `scripts/build-nightlights.mjs` that
rewrites B in the existing file; either way the JSON's `encoding` string documents it):
1. Download `BlackMarble_2016_B1_geo.tif` once into `node_modules/.cache/blackmarble/` (the same
   cache pattern as the terrain tiles; 310 MB, a one-off per machine; a polite User-Agent like the
   terrain fetch). `sharp` (installed, libvips 8.18 with TIFF input) reads it: `sharp(file,
   { limitInputPixels: false }).extract({ left, top, width, height }).raw()` for the window over
   the asset's `box` (south 40.37, north 42.26, west -74.91, east -73.35). The tile is
   equirectangular, so pixel = (lng + 90) / 90 * width, row = (90 - lat) / 90 * height; verify
   the GeoTIFF's actual width/height and origin from `sharp(file).metadata()` before trusting
   that arithmetic, and print the window's corner values so a wrong tile is caught (the harbour
   must be the brightest thing in the window, the Catskills the darkest).
2. Resample the window (about 380x450 px at 500 m) onto the 652x1050 grid bilinearly.
3. Encode B = round(255 * clamp(log1p(k * radiance) / log1p(k * max), 0, 1)) with k chosen so
   the valley towns sit around 60 to 120 and Manhattan near 255; print the histogram. Water cells
   keep whatever they have (the harbour's glow is real and belongs).
4. Keep the round-trip proof (`back` equals the bytes), write the JSON's new `encoding` line and
   `sources`, and a unit test for the pure resample/encode functions (`elevation.test.ts` style).

## 3. Using it in the scene (the builder decides the look with frames, the bar is below)

- `elevation.ts`: decode B into a `glow` array beside `height` and `water`; `sampleGlow(grid,
  lng, lat)` bilinear like `sampleHeight`.
- **The haze becomes the true town glow.** `buildHaze` (lights.ts) today makes one patch per
  1.6 km cell holding 6 or more listings. Replace or augment its input with the glow grid: a patch
  wherever the glow exceeds a floor, strength from the glow, position on the terrain (height from
  the grid + lift), so Manhattan, the Bronx, Yonkers, Newburgh, Poughkeepsie, Kingston and the
  roads between them glow at their real brightness whether or not anything is for sale there.
  Listings stay the warm points on top (unchanged).
- Optionally, in `shaders.ts`, let the dust take a faint floor from the glow so a lit town reads
  even between haze patches at the establishing altitude. Warm white only; every glow has a source.
- Reduced motion, no WebGL, no JS: unchanged paths, and the poster is re-rendered afterwards
  (`scripts/make-night-poster.mjs`) so the first screen matches.

The bar: put frames side by side, round 54 vs after, for the hero, the dutchess shot, the harbour
shot and three area chapters at 1440 and 390. "The cities are where they are" must be true at a
glance: Manhattan is the brightest thing in the harbour shot; the valley towns read as towns; the
Catskills and the Highlands stay dark; the listings still read as individual homes; nothing in
the round-54 ledger (contrast under the words, quiet boxes, LCP/CLS, frame budget: no frame over
34 ms in the headed probe) got worse. If the frames are not clearly better than round 54, do not
integrate: leave the asset and the lab page, and say so.

## 4. Gates

- `npx tsc --noEmit` clean; `npx vitest run` up from the current count, with tests for the
  resample/encode and the glow sampling.
- The asset stays small: `valley-elevation.webp` today is 281 KB; report the new size (lossless
  B will add some; if it passes ~400 KB, quantise B to 6 bits or blur it one cell and re-measure).
- Headed probe (`scripts/_scratch-r55-lag.mjs`, copied): boot and section changes no worse than
  phase 1 left them.
- ATTRIBUTIONS.md and SceneCredit updated in the same commit as the asset.

## 5. Built and measured (builder, 2026-09-23)

Three commits on `design/futuristic-r53`: `9a47e69` (the asset, its decode and the credits),
`4f8eae8` (the scene: the towns' street lights, the glow haze, the territory raster), and the last
one (the final look tweaks and the re-rendered poster; hash in §5.6). Nothing pushed.

### 5.1 The asset step (`scripts/build-nightlights.mjs`, commit 9a47e69)

- Reads the cached tile (`node_modules/.cache/blackmarble/BlackMarble_2016_B1_geo.tif`, verified
  21600 x 21600 RGB 8-bit, 240 px a degree; downloads it once with a polite User-Agent if missing,
  never into the repo), crops the asset's box with one pixel of margin (window left 3620, top
  11456, 378 x 457), and checks the crop is the valley (the south quarter's mean must be at least
  four times the north's: 119.6 vs 4.4).
- **What the tile is, measured (`scripts/_scratch-r55c-glow-explore.mjs`, `-explore2.mjs`).** An
  8-bit visualisation, as §1a said, and worse than expected for ranking: the darkness floor is
  6..25 everywhere (Slide Mountain 10, Harriman 16, the Ashokan 13, the Sound 25); the "water
  tint" is not a hue (the Tappan Zee pixel is 148,117,81, WARM: Tarrytown's and Nyack's light
  bleeding across a 3 km river at 348 m a pixel), so the fix is a black-level subtraction, not a
  mask. And the plan's 1.5 to 2 km blur cannot put the valley towns at 60..120: a valley town's
  saturated blob is 6 km across, so after a 1.75 km blur Poughkeepsie sits at 0.84 of Midtown,
  Newburgh 0.75, Kingston 0.62 (raw 197, 175, 147 of 235). A log curve lifts the LOW end, the
  wrong direction. What does separate them is extent at a larger radius: within 8 km, Midtown is
  96% saturated pixels, Yonkers 58%, White Plains 28%, Poughkeepsie 13%, Newburgh 16%, Kingston
  6%, New Paltz 1%. The whole metro is one saturated block (Newark 90%, Flatbush 85%, Hempstead
  97%): **Manhattan cannot be told from Brooklyn or Newark by this file**; that needs the
  radiance product behind a registration (not this round).
- **Encoding, chosen from the sweep:** luminance less a floor of 20, resampled bilinearly onto the
  652 x 1050 grid, then two Gaussians on the grid: S at 1.75 km (the SHAPE: the river stays dark,
  the roads stay filaments) and E at 6 km (the EXTENT); `B = 255 * (S / max S) * sqrt(E / max
  E)`. Linear, no log (k = 0 in the brief's formula). Water cells keep their value.
- **Probed bytes:** Midtown 255, Flushing 249, Yonkers 227, White Plains 192, Newburgh 122,
  Poughkeepsie 130, Kingston 70, Slide Mountain 0, Harriman 1, the Tappan Zee 107 (the two banks'
  spill; the scene decides what to draw over water). Histogram, 32-wide bins: 459552 48976 32021
  27539 30523 22119 21365 42505; 32.9% of cells at 32 or more.
- **Size:** 281.0 KB -> 364.9 KB (287,766 -> 373,702 bytes), under the 400 KB budget, so B stays
  at 8 bits. R and G proved byte-identical before and after (the script compares every cell);
  the lossless round trip proved as before. `valley-elevation.json`: the `encoding` line and
  `sources.nightLights` (name, URL, tile, the licence sentence).
- `build-elevation.mjs` runs the step at its end, so `node scripts/build-elevation.mjs` still
  builds the whole asset. A Windows lesson: sharp keeps a path input mapped until it is
  collected, and the rewrite of the same file failed with errno -4094 until the input was read
  into a buffer (and the write goes through a temp file and a rename).
- Credits: `ATTRIBUTIONS.md` under `public/geo/` (a row for the blue channel; the NASA Media
  Usage Guidelines quoted verbatim, the source sentence on one line; no insignia anywhere) and
  `SceneCredit.tsx` ("Night lights: NASA Earth Observatory (Black Marble 2016, Suomi NPP
  VIIRS)."), pinned by `home-scene.test.ts` (which also checks the credit is text, never an
  image or SVG).
- Tests: `lib/geo/night-lights.test.ts` (resample, blur incl. the rank-by-extent property,
  encode: 11), `elevation.test.ts` (the third channel decodes to `glow`, `sampleGlow` is
  bilinear, the committed asset's probes: metro > 0.95, the valley towns in 60..135 of 255 and
  each below the metro, the Catskills < 0.02).

### 5.2 Decode and sample (same commit)

`elevation.ts`: `ElevationGrid.glow` (0..1, from the third byte when there is one, else 0) and
`sampleGlow(grid, lng, lat)`, bilinear like `sampleHeight`. The worker already decodes with four
channels, so it holds the glow with the grid.

### 5.3 The scene: what the frames decided (commits 4f8eae8 and the last)

The brief's plan (the haze rebuilt from the glow grid) was built first and looked at:
`scripts/_scratch-r55/glow/lab1/hero-1440.png` (glow haze over every lit cell) and
`lab2/hero-1440.png` (kept to the served land, patches jittered). Four things were wrong and each
one is measured in those frames:

1. A haze with no warm light under it is GREY FOG. Where the listings are dense the haze reads as
   the city's breath; over lit land with few homes (Staten Island, the Bronx, the Jersey shore)
   it is a grey wash with visible strata.
2. The satellite lights all of northern New Jersey and Nassau, as bright as Queens, and neither is
   where we work: unmasked (lab1) it flooded the hero's lower left, the headline's dark ground
   since round 54, and the whole foreground.
3. Rows of patches at one spacing draw as horizontal bands at grazing angles (round 54's patches
   sat at irregular listing centroids).
4. In the harbour shot the haze is invisible whatever it holds: that camera stands under the
   haze's 7 km altitude ramp (`uHazeLow`). The one shot where "Manhattan is lit" matters most got
   nothing from it.

What a city looks like from above is what the satellite saw: a CARPET of small lights on the
ground. So the glow is carried by a second point cloud, and the haze goes back to being the breath
over the densest light:

- **`buildStreetLights`** (lights.ts, in the worker's bundle): one to a few faint warm lamps per
  200 m cell in proportion to the cell's glow (`perCell` 2.4 at glow 1, floor 0.08, the fraction
  drawn by a hash; deterministic), on the terrain 6 m up, with the homes' intro wave (harbour
  first) and each lamp's county. **116,452 lamps.** Drawn with the homes' own lamp shader through
  a second material (`scene.ts` `streetMat`; the look's `streetSize` 0.03 km, `streetAlpha` 0.8,
  `streetSpread` 2.4), sharing every uniform OBJECT with the homes (intro, veil, quiet floor,
  focus, lantern), so under a sentence and in an area chapter the carpet behaves as the homes do.
  The homes stay the larger, brighter lamps (0.06 km, alpha 2.8, halo x5).
- **Close-in range stretch, the homes' mechanism turned round.** `streetLowGain` is the close-in
  factor for the DENSE lamps (the metro's carry the highest gains): first tried at 3.2, it took
  the harbour's Brooklyn foreground from 36 to 86 mean (lab4), so it is 0.6, a borough's carpet
  steps back as its homes do (`lowCityGain`). `streetLowCity` 6 lifts the sparse lamps, a valley
  town's, so Poughkeepsie and Kingston read as lit towns under their homes at the dutchess and
  Ulster shots.
- **The served territory.** The county raster (every cell within 6 km of a home; the one the
  area chapter paints the land with) keeps the carpet and the glow to where we work, so the
  metro's light bleeds a little across the Hudson and the county line and then stops, as round
  54's own lights do. It now carries `reach` (flood steps) and `reachAt()` eases both out over its
  outer rings (from 40% of the reach) instead of stopping at a stair of cells (measured at the
  hero in lab3: a 1.5 km staircase down Staten Island's shore, a straight cut across Nassau);
  its cells are 0.5 km. Each lamp reads its county up to 0.4 km off itself, so the line where one
  county's carpet dims for another's chapter is a soft band of mixed lamps, not the raster's stair
  (measured at the Queens and Westchester chapters on the first production build).
- **`buildGlowHaze`**: a patch per 1.6 km square of served land whose mean glow clears 0.35,
  strength from the floor to the metro's 1 times the reach fade, jittered off the grid; **930
  patches** (round 54's listing haze was of that order). `haze` 0.08 -> 0.045 and a near fade in
  the shader (`smoothstep(1.5, 4.0) x uNear`). Measured at the hero (`lab6c0` no haze, `lab6c`
  haze 0.06, `lab7` haze 0.045; mean luminance of the same pixel regions): the metro 70 / 116 /
  104, Staten Island 18 / 45 / 37 against round 54's 90 and 10. The haze, not the carpet, was the
  cream blob. Falls back to the homes' own haze when the terrain carries no glow.
- Not done, on purpose: the optional glow floor in the dust shader. The carpet does that job
  from the ground, warm, and the dust stays the silver paper it was.

Numbers from the lab (production build 1, `scripts/_scratch-r55/glow/lab1..7`, look overrides
through the lab's `look=` parameter; regions are fixed pixel boxes on the 1440 x 900 frames,
mean luminance 0..255, round 54's frames in `glow/before/`):

| shot, region | round 54 | final look |
|---|---|---|
| hero: metro core (Brooklyn/Queens) | 89.7 | 104.2 |
| hero: Manhattan strip | 68.4 | 87.4 |
| hero: Staten Island foreground | 9.6 | 37.4 |
| hero: New Jersey under the headline | 7.2 | 7.8 |
| hero: the valley top (Poughkeepsie) | 23.0 | 24.7 |
| dutchess: Poughkeepsie | 51.5 | 53.8 |
| dutchess: rural east | 9.4 | 9.4 |
| harbour: Manhattan strip | 96.8 | 130.5 |
| harbour: Brooklyn foreground | 36.4 | 60.4 |
| Ulster chapter: Kingston | 45.7 | 57.5 |
| Ulster chapter: the empty west | 0.1 | 0.1 |
| Westchester chapter, whole frame | 15.7 | 23.0 |
| Queens chapter, whole frame | 61.0 | 77.5 |
| region shot, whole frame | 7.5 | 10.2 |

(Those are the first production build's numbers, before `streetLowGain` went from 1 to 0.6 and
the county dither; the final build's are in §5.4.)

### 5.4 The orchestrator's gate (2026-09-23, after the builder was cut off by the session limit)

The builder's last work was uncommitted when the window closed: the county read 0.4 km off each
lamp (a soft band where one county's carpet dims for another's chapter), the territory raster at
0.5 km cells, `streetLowGain` 1 -> 0.6, and the re-rendered poster. Those are committed here as
the builder's, with this gate run on the production build that carried them.

- **Frames, looked at** (`scripts/_scratch-r55/glow/after/*` against `before/*`, pairs in
  `glow/pairs/`): the hero reads truer, the metro a continuous carpet of light with Manhattan lit,
  the Jersey shore and Long Island's north shore glowing where they really are, the valley towns
  denser; the harbour shot has Manhattan lit at all (it was not) with the carpet under the homes;
  the Ulster chapter has Kingston as a lit town and the Catskills black; the words on the hero at
  1440 and 390 sit on dark ground as before. Nothing greyer or noisier than round 54 where it was
  good. The lab page's compass mark does not appear on the home page.
- **Text contrast** (the builder's kit, 298 texts at 1440 and 137 at 390, before and after): no
  text's p95 fell below 4.5:1; by the single worst pixel, 9 texts under 4.5 at 1440 after against
  10 before, 4 against 4 at 390. The area index rows lost margin because the region under them
  glows more ("New York City" 7.07 -> 5.83, "1,043 homes" 10.65 -> 5.99), still above the bar.
- **Frame budget** (headed Chrome, real GPU, `scripts/_scratch-r55b-lag.mjs`): cold boot worst
  76 ms (over100 0), `to:highlands` 34.7, harbour 34.6, fling up 62.5, fling down 20.8; warm
  (second run on a kept profile) every section phase 21 ms or under, boot worst 118 ms, which is
  the page's own hydration (63 to 167 ms run to run before and after phase 2). 116,176 extra
  lamps and 937 haze patches cost nothing the probe can see at 144 Hz.
- **Verify probe** (`_scratch-r54c-verify.mjs`, `scripts/_scratch-r55/verify2/`): 1440, 390, 320,
  reduced motion and no-JS all clean: overflow 0, console errors 0, the search instrument in view.
- `npx tsc --noEmit` clean; `npx vitest run` **1662 passing**.
- **The copy had to follow the picture.** Three lines said every light is a home ("Every light
  below is one of them", "Every light is a home listed on OneKey MLS", "Every light is a home for
  sale there right now"); with the towns' own light on the ground that stopped being true. They
  now say the BRIGHT lights are the homes and the faint ones are the towns' own light, seen from
  orbit (`app/page.tsx`). A claim the page cannot keep is not kept.
- **Judgement against the bar (§3):** integrate. "The cities are where they are" is true at a
  glance for the first time; the listings still read as the brighter, larger lamps; nothing in
  the round-54 ledger got worse. Not done, honestly: the 8-bit tile cannot rank Manhattan above
  Brooklyn or Newark (a radiance product behind a registration would), and the owner has not seen
  it yet: his verdict on the frames decides whether the carpet's weight (`streetAlpha`,
  `streetLowCity`, `haze`) moves.

