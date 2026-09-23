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
