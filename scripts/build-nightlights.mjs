// Builds the NIGHT LIGHTS channel of the home page's terrain asset (round 55, phase 2): the blue
// channel of public/geo/valley-elevation.webp, which build-elevation.mjs leaves at 0.
//
//   node scripts/build-nightlights.mjs      (the tile is cached in node_modules/.cache/blackmarble)
//
// build-elevation.mjs calls this at its end, so one run builds the whole asset; run alone it rewrites
// only B in the existing file and proves R (elevation) and G (water) came through byte for byte.
//
// SOURCE. NASA Earth Observatory, "Black Marble" 2016: Suomi NPP VIIRS day-night band, cloud-free
// composite, the 500 m tile for 0..90 N, 90 W..0 (BlackMarble_2016_B1_geo.tif, 310,401,888 bytes,
// 21600 x 21600 RGB, 240 px a degree = 348 x 463 m a pixel here). Licence: NASA Media Usage
// Guidelines, quoted in public/images/ATTRIBUTIONS.md; the footer credit names NASA as the source.
//
// WHAT THE TILE IS (measured 2026-09-23, scripts/_scratch-r55c-glow-explore*.mjs). An 8-bit
// VISUALISATION, not radiance: every town centre saturates at 255 (Midtown, Poughkeepsie, Kingston,
// Newburgh all 255,255,255), and the darkness floor is 6..25 everywhere (Slide Mountain 10, Harriman
// 16, the Sound 25, the Ashokan 13). So intensity cannot rank Midtown above Poughkeepsie; EXTENT can:
// within 8 km, Midtown is 96% saturated pixels, Newark 90%, Hempstead 97%, Yonkers 58%, Poughkeepsie
// 13%, Newburgh 16%, Kingston 6%, New Paltz 1%. (The whole metro is one saturated block: Manhattan,
// Brooklyn, Newark and Nassau cannot be told apart by this file. A radiance product would; it sits
// behind a registration, not this round.)
//
// METHOD. Luminance (the RGB is a warm ramp: black, orange, yellow, white) less the floor, resampled
// bilinearly onto the terrain grid, then TWO Gaussians of it: S at 1.75 km, the SHAPE, which keeps
// the river dark and the roads as filaments; E at 6 km, the EXTENT, which is high only where a
// large area is lit. B = 255 * (S / max S) * sqrt(E / max E). Measured with that: Midtown 255,
// Flushing 249, Yonkers 227, White Plains 191, Newburgh 122, Poughkeepsie 130, Kingston 70,
// Middletown 86, Peekskill 76, New Paltz 23, Slide Mountain 0, Harriman 1, the Sound 5. A 1.75 km
// blur alone (the first plan, then a log curve) left Poughkeepsie at 0.8 of Midtown, because a
// valley town's saturated blob is 6 km across; a log curve lifts the low end, the wrong way.
// Water cells keep their value: the glow over the harbour and across the Tappan Zee is in the
// source (the towns on both banks), and the scene decides what to draw over water.
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";

export const TILE = "BlackMarble_2016_B1_geo.tif";
export const TILE_URL = `https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/${TILE}`;
export const SOURCE_NAME = "NASA Earth Observatory, Black Marble 2016 (Suomi NPP VIIRS day-night band, cloud-free composite)";
export const LICENCE =
  "NASA Media Usage Guidelines (nasa.gov/nasa-brand-center/images-and-media/, read 2026-09-22): NASA content used in a factual manner that does not imply endorsement may be used without needing explicit permission. NASA should be acknowledged as the source of the material.";
/** The tile's darkness floor, in 8-bit luminance (measured 6..25 over wilderness and open water). */
export const FLOOR = 20;
export const SHAPE_KM = 1.75;
export const EXTENT_KM = 6;
export const EXTENT_POW = 0.5;

/** Bilinear resample of `src` (sw x sh) onto a w x h grid; `toSrc(c, r)` gives the continuous
 * source coordinates of output cell (c, r)'s centre, where source pixel (i, j)'s centre is (i, j).
 * Clamps to the source's edge. */
export function resampleBilinear(src, sw, sh, w, h, toSrc) {
  const out = new Float32Array(w * h);
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++) {
      const [gx, gy] = toSrc(c, r);
      const x = Math.min(sw - 1, Math.max(0, gx)), y = Math.min(sh - 1, Math.max(0, gy));
      const x0 = Math.min(sw - 2, Math.floor(x)), y0 = Math.min(sh - 2, Math.floor(y));
      const fx = x - x0, fy = y - y0, i = y0 * sw + x0;
      out[r * w + c] = src[i] * (1 - fx) * (1 - fy) + src[i + 1] * fx * (1 - fy) + src[i + sw] * (1 - fx) * fy + src[i + sw + 1] * fx * fy;
    }
  return out;
}

/** Separable Gaussian, radius 3 sigma, the kernel renormalised where it runs off the edge (so the
 * edge is unknown, not black). sigma in cells; sigma <= 0 returns a copy. */
export function gaussianBlur(field, w, h, sigma) {
  if (!(sigma > 0)) return Float32Array.from(field);
  const rad = Math.ceil(3 * sigma);
  const k = new Float64Array(2 * rad + 1);
  for (let i = -rad; i <= rad; i++) k[i + rad] = Math.exp(-(i * i) / (2 * sigma * sigma));
  const pass = (src, dst, stride, len, count) => {
    for (let line = 0; line < count; line++) {
      const base = stride === 1 ? line * len : line;
      for (let x = 0; x < len; x++) {
        let s = 0, n = 0;
        for (let i = -rad; i <= rad; i++) {
          const xx = x + i;
          if (xx < 0 || xx >= len) continue;
          s += src[base + xx * stride] * k[i + rad];
          n += k[i + rad];
        }
        dst[base + x * stride] = s / n;
      }
    }
  };
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  pass(field, tmp, 1, w, h); // along rows
  pass(tmp, out, w, h, w); // down columns
  return out;
}

/** The stored byte: the shape, scaled by the square root of the extent, both against their maxima. */
export function encodeGlow(shape, extent, shapeMax, extentMax, pow = EXTENT_POW) {
  if (!(shapeMax > 0) || !(extentMax > 0)) return 0;
  const v = (shape / shapeMax) * Math.pow(Math.max(0, extent) / extentMax, pow);
  return Math.round(255 * Math.min(1, Math.max(0, v)));
}

export const PROBES = {
  "Manhattan (Midtown)": [-73.985, 40.755],
  "Queens (Flushing)": [-73.83, 40.76],
  Yonkers: [-73.87, 40.93],
  "White Plains": [-73.76, 41.03],
  Newburgh: [-74.02, 41.5],
  Poughkeepsie: [-73.92, 41.7],
  Kingston: [-73.99, 41.93],
  "Catskills (Slide Mtn)": [-74.39, 42.0],
  "Harriman woods": [-74.1, 41.25],
  "Hudson mid-river Tappan Zee": [-73.92, 41.07],
};

async function fetchTile(file) {
  if (fs.existsSync(file)) return;
  console.log(`fetching ${TILE} (310 MB, once a machine) -> ${file}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const r = await fetch(TILE_URL, { headers: { "User-Agent": "realtylt-website build-nightlights (one-off, cached)" } });
  if (!r.ok || !r.body) throw new Error(`${r.status} ${TILE_URL}`);
  const part = file + ".part";
  await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(part));
  fs.renameSync(part, file);
}

export async function buildNightLights({ root = path.resolve(import.meta.dirname, "..") } = {}) {
  const outDir = path.join(root, "public", "geo");
  const webp = path.join(outDir, "valley-elevation.webp");
  const jsonFile = path.join(outDir, "valley-elevation.json");
  const meta = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
  const { box, w: W, h: H } = meta;
  // From a buffer, not the path: sharp keeps a path input mapped until it is collected, and on
  // Windows that handle made the rewrite below fail (errno -4094, measured).
  const before = await sharp(fs.readFileSync(webp)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (before.info.width !== W || before.info.height !== H || before.info.channels !== 3) throw new Error("the terrain asset does not match its JSON");

  const file = path.join(root, "node_modules", ".cache", "blackmarble", TILE);
  await fetchTile(file);
  const info = await sharp(file, { limitInputPixels: false }).metadata();
  // Equirectangular over 90 x 90 degrees: verify before trusting the arithmetic.
  if (info.width !== info.height || info.channels !== 3 || info.depth !== "uchar") throw new Error(`unexpected tile: ${info.width}x${info.height} ${info.channels}ch ${info.depth}`);
  const ppd = info.width / 90;
  // One pixel of margin each side, so the bilinear sample at the grid's edge has its neighbour.
  const left = Math.floor((box.west + 90) * ppd) - 1, top = Math.floor((90 - box.north) * ppd) - 1;
  const right = Math.ceil((box.east + 90) * ppd) + 1, bottom = Math.ceil((90 - box.south) * ppd) + 1;
  const sw = right - left, sh = bottom - top;
  const { data } = await sharp(file, { limitInputPixels: false }).extract({ left, top, width: sw, height: sh }).raw().toBuffer({ resolveWithObject: true });
  console.log(`tile ${info.width}x${info.height} ${info.channels}ch, ${ppd} px/deg; window left ${left} top ${top} ${sw}x${sh}`);

  // Luminance less the floor, in the tile's own pixels.
  const lum = new Float32Array(sw * sh);
  for (let i = 0; i < sw * sh; i++) lum[i] = Math.max(0, (data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 3 - FLOOR);
  // Is this the right place? The brightest quarter of the window must be the south (the metro).
  const rowSum = (r0, r1) => { let s = 0; for (let y = r0; y < r1; y++) for (let x = 0; x < sw; x++) s += lum[y * sw + x]; return s / ((r1 - r0) * sw); };
  const northMean = rowSum(0, sh >> 2), southMean = rowSum(sh - (sh >> 2), sh);
  console.log(`window check: north quarter mean ${northMean.toFixed(1)}, south quarter mean ${southMean.toFixed(1)} (the metro must be south)`);
  if (southMean < 4 * northMean) throw new Error("the window does not look like the Hudson valley: wrong tile or wrong arithmetic");

  const toSrc = (c, r) => {
    const lng = box.west + ((c + 0.5) / W) * (box.east - box.west);
    const lat = box.north - ((r + 0.5) / H) * (box.north - box.south);
    return [(lng + 90) * ppd - left - 0.5, (90 - lat) * ppd - top - 0.5];
  };
  const onGrid = resampleBilinear(lum, sw, sh, W, H, toSrc);
  const cellKm = meta.metresPerCell.x / 1000;
  const shape = gaussianBlur(onGrid, W, H, SHAPE_KM / cellKm);
  const extent = gaussianBlur(onGrid, W, H, EXTENT_KM / cellKm);
  let shapeMax = 0, extentMax = 0, iMax = 0;
  for (let i = 0; i < W * H; i++) {
    if (shape[i] > shapeMax) (shapeMax = shape[i]), (iMax = i);
    if (extent[i] > extentMax) extentMax = extent[i];
  }
  const glow = new Uint8Array(W * H);
  const hist = new Array(8).fill(0);
  for (let i = 0; i < W * H; i++) {
    glow[i] = encodeGlow(shape[i], extent[i], shapeMax, extentMax);
    hist[glow[i] >> 5]++;
  }
  const maxLng = box.west + (((iMax % W) + 0.5) / W) * (box.east - box.west), maxLat = box.north - ((Math.floor(iMax / W) + 0.5) / H) * (box.north - box.south);
  console.log(`shape max ${shapeMax.toFixed(1)} at ${maxLng.toFixed(3)}, ${maxLat.toFixed(3)}; extent max ${extentMax.toFixed(1)}`);
  console.log(`B histogram (32-wide bins): ${hist.join(" ")}  (${((100 * (W * H - hist[0])) / (W * H)).toFixed(1)}% of cells at 32 or more)`);
  const at = (lng, lat) => {
    const gx = ((lng - box.west) / (box.east - box.west)) * W - 0.5, gy = ((box.north - lat) / (box.north - box.south)) * H - 0.5;
    const x0 = Math.min(W - 2, Math.max(0, Math.floor(gx))), y0 = Math.min(H - 2, Math.max(0, Math.floor(gy)));
    const fx = gx - x0, fy = gy - y0, i = y0 * W + x0;
    return glow[i] * (1 - fx) * (1 - fy) + glow[i + 1] * fx * (1 - fy) + glow[i + W] * (1 - fx) * fy + glow[i + W + 1] * fx * fy;
  };
  const probed = {};
  for (const [name, [lng, lat]] of Object.entries(PROBES)) {
    probed[name] = Math.round(at(lng, lat));
    console.log(`  ${name.padEnd(28)} ${String(probed[name]).padStart(4)}`);
  }

  // Write B, keep R and G byte for byte, and prove both.
  const px = Buffer.from(before.data);
  for (let i = 0; i < W * H; i++) px[i * 3 + 2] = glow[i];
  const img = await sharp(px, { raw: { width: W, height: H, channels: 3 } }).webp({ lossless: true, effort: 6 }).toBuffer();
  const back = await sharp(img).removeAlpha().raw().toBuffer();
  if (back.length !== px.length || back.some((v, i) => v !== px[i])) throw new Error("round trip changed the bytes");
  for (let i = 0; i < W * H; i++)
    if (back[i * 3] !== before.data[i * 3] || back[i * 3 + 1] !== before.data[i * 3 + 1]) throw new Error(`R or G changed at cell ${i}`);
  const sizeBefore = fs.statSync(webp).size;
  fs.writeFileSync(webp + ".tmp", img);
  fs.renameSync(webp + ".tmp", webp);
  meta.encoding =
    meta.encoding.split("; B:")[0] +
    `; B: night lights, 255 * (S / max S) * sqrt(E / max E), S and E Gaussian blurs (${SHAPE_KM} km, ${EXTENT_KM} km) of the Black Marble 2016 luminance less a floor of ${FLOOR}; water cells keep theirs`;
  meta.sources = { ...(meta.sources ?? {}), nightLights: { name: SOURCE_NAME, url: TILE_URL, tile: TILE, licence: LICENCE } };
  fs.writeFileSync(jsonFile, JSON.stringify(meta, null, 2) + "\n");
  console.log(`wrote public/geo/valley-elevation.webp ${W}x${H}: ${(sizeBefore / 1024).toFixed(1)} KB -> ${(img.length / 1024).toFixed(1)} KB; R and G byte-identical, round trip exact`);
  return { probed, hist, size: img.length, sizeBefore };
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("build-nightlights.mjs");
if (isMain) await buildNightLights();
