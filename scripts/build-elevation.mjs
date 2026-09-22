// Builds the home page's night-flight terrain (round 54): public/geo/valley-elevation.webp + .json.
//
//   node scripts/build-elevation.mjs      (tiles are cached in node_modules/.cache/terrarium)
//
// SOURCE. AWS Terrain Tiles (Mapzen/Tilezen "terrarium" PNGs on AWS Open Data), zoom 11 (~57 m a
// pixel here), averaged down to ~200 m cells. Zoom 11 because it is the first zoom whose tiles over
// the valley are built from USGS 3DEP (formerly NED: 1/3 arc-second statewide and the 2011 Hudson
// LiDAR at 1/9 arc-second), which is bare earth and public domain. MEASURED 2026-09-22 from each
// tile's x-amz-meta-x-imagery-sources header: the zoom 9 and 10 tiles over the valley cite only
// SRTM, GMTED and ETOPO1 (the joerd docs' zoom table says 3DEP from zoom 10; the headers disagree,
// and the headers are what was built). The script prints every source family it read and writes
// them into the JSON, so the credit in public/images/ATTRIBUTIONS.md is checked on every run.
//
// OUTPUT. One lossless WebP on an equirectangular grid over SERVED_REGION plus a margin: x linear in
// longitude, y linear in latitude, row 0 = north, the same frame lib/idx/lights.ts packs the
// listings in, so a light's x,y lands on the grid with one linear map.
//   R  0 = WATER, else 1 + round(254 * sqrt(e / maxM)). The square root spends the 8 bits where the
//      land is low (~1 m steps near sea level, ~10 m at the Catskill summits). A hillshade
//      recomputed in the browser from these 8 bits differs from one computed from the float source
//      by 1.6/255 RMS (measured), so the moonlight is computed there, where it can also move.
//   G  how much of the cell is water (0..255 of 36 subsamples): an anti-aliased coast, so the
//      shoreline is drawn between cells, not along their stair-stepped edges.
//
// WATER. Three rules, each measured against the source:
//   1. at or below WATER_M (0.5 m): the harbour, the Sound, the Kills, the tidal marsh;
//   2. RIVERS: the USGS National Hydrography Dataset's river polygons (NHD "Area - Small Scale",
//      FTYPE StreamRiver: the Hudson, the Harlem, the Rondout ...; public domain), rasterised onto
//      the grid. The DEM alone cannot draw the river above the Tappan Zee: 3DEP there holds a
//      trough one to ten pixels wide at 0 to 12 m where the Hudson is ~1 km wide (measured across
//      22 sections), so rule 1 found only 35% of the centreline and no DEM threshold fixes it;
//   3. LAKES AND RESERVOIRS: a hydro-flattened water body is flat to the millimetre, which land at
//      57 m never is, so a flat patch (3x3 range < 2 cm) of at least LAKE_MIN_PX pixels is water
//      (the Ashokan, Kensico and Croton reservoirs, Greenwood Lake ...).
// Values below -100 m are holes in the source tiles (322 pixels, all in the river north of
// Kingston, measured) and count as water. The Natural Earth centreline (lib/geo/hudson-water.ts)
// then checks the result: it reports how much of the river is black and burns a one-cell channel
// through any true gap (no water within 2 km), so the river can never be cut.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
// components/idx/county-bounds.ts SERVED_REGION, the lights' box (the unit test asserts they match).
const SERVED = { south: 40.49, north: 42.14, west: -74.75, east: -73.51 };
// A margin so the land runs on past the served box and can fade out instead of stopping at a
// ruled edge.
const MARGIN = { lat: 0.12, lng: 0.16 };
const BOX = {
  south: +(SERVED.south - MARGIN.lat).toFixed(4),
  north: +(SERVED.north + MARGIN.lat).toFixed(4),
  west: +(SERVED.west - MARGIN.lng).toFixed(4),
  east: +(SERVED.east + MARGIN.lng).toFixed(4),
};
const Z = Number(process.env.ZOOM || 11);
const TARGET_M = Number(process.env.GRID_M || 200); // metres per output cell
const WATER_M = 0.5;
const LAKE_FLAT_M = 0.02;
const LAKE_MIN_PX = 40; // ~0.1 km2 of 57 m pixels
const CACHE = path.join(ROOT, "node_modules", ".cache", "terrarium");
const OUT_DIR = path.join(ROOT, "public", "geo");
const OUT = "valley-elevation";

const LAT0 = (BOX.south + BOX.north) / 2;
const KM_LAT = 111.132;
const KM_LNG = 111.32 * Math.cos((LAT0 * Math.PI) / 180);
const W = Math.round(((BOX.east - BOX.west) * KM_LNG * 1000) / TARGET_M);
const H = Math.round(((BOX.north - BOX.south) * KM_LAT * 1000) / TARGET_M);
const cellX = ((BOX.east - BOX.west) * KM_LNG * 1000) / W;
const cellY = ((BOX.north - BOX.south) * KM_LAT * 1000) / H;

// ---- tiles ---------------------------------------------------------------------------------
const N = 2 ** Z;
const tileX = (lng) => ((lng + 180) / 360) * N;
const tileY = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N;
};
const x0 = Math.floor(tileX(BOX.west)), x1 = Math.floor(tileX(BOX.east));
const y0 = Math.floor(tileY(BOX.north)), y1 = Math.floor(tileY(BOX.south));
const tiles = [];
for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) tiles.push({ x, y });

async function fetchTile({ x, y }) {
  const file = path.join(CACHE, String(Z), String(x), `${y}.png`);
  const meta = file + ".sources";
  if (fs.existsSync(file)) return { file, sources: fs.existsSync(meta) ? fs.readFileSync(meta, "utf8") : "?" };
  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "realtylt-website build-elevation (one-off, cached)" } });
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      const buf = Buffer.from(await r.arrayBuffer());
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, buf);
      const sources = r.headers.get("x-amz-meta-x-imagery-sources") || r.headers.get("x-imagery-sources") || "";
      fs.writeFileSync(meta, sources);
      return { file, sources };
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
  }
}

const TW = (x1 - x0 + 1) * 256, TH = (y1 - y0 + 1) * 256;
const src = new Float32Array(TW * TH);
const sourceNames = new Map();
console.log(`zoom ${Z}: ${tiles.length} tiles (x ${x0}..${x1}, y ${y0}..${y1})`);
// Four at a time: polite to a public bucket, and cached, so it only ever happens once a machine.
for (let i = 0; i < tiles.length; i += 4) {
  const got = await Promise.all(tiles.slice(i, i + 4).map(fetchTile));
  for (let k = 0; k < got.length; k++) {
    const { x, y } = tiles[i + k];
    for (const s of new Set(got[k].sources.split(",").map((s) => s.trim().split("/")[0]).filter(Boolean))) {
      sourceNames.set(s, (sourceNames.get(s) ?? 0) + 1);
    }
    const { data, info } = await sharp(got[k].file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    if (info.width !== 256 || info.height !== 256 || info.channels !== 3) throw new Error(`odd tile ${x}/${y}`);
    const ox = (x - x0) * 256, oy = (y - y0) * 256;
    for (let py = 0; py < 256; py++)
      for (let px = 0; px < 256; px++) {
        const j = (py * 256 + px) * 3;
        src[(oy + py) * TW + ox + px] = data[j] * 256 + data[j + 1] + data[j + 2] / 256 - 32768;
      }
  }
}
console.log("tile sources (tiles citing each):", Object.fromEntries(sourceNames));

// ---- water, in the source's own pixels ------------------------------------------------------
const lngOfPx = (gx) => ((gx + 0.5 + x0 * 256) / (256 * N)) * 360 - 180;
const latOfPx = (gy) => {
  const n = Math.PI - (2 * Math.PI * (gy + 0.5 + y0 * 256)) / (256 * N);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
};
const range3 = new Float32Array(TW * TH).fill(1e9);
for (let y = 1; y < TH - 1; y++)
  for (let x = 1; x < TW - 1; x++) {
    let lo = Infinity, hi = -Infinity;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const v = src[(y + dy) * TW + x + dx];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    range3[y * TW + x] = hi - lo;
  }
const WET = { sea: 1, river: 2, lake: 3 };
const wet = new Uint8Array(TW * TH);
let holes = 0;
for (let i = 0; i < TW * TH; i++) {
  if (src[i] < -100) holes++;
  if (src[i] <= WATER_M) wet[i] = WET.sea;
}
// Rule 3: lakes, as flat components.
const seen = new Uint8Array(TW * TH);
const lakes = [];
for (let i = 0; i < TW * TH; i++) {
  if (seen[i] || wet[i] || range3[i] >= LAKE_FLAT_M) continue;
  const comp = [i];
  seen[i] = 1;
  for (let k = 0; k < comp.length; k++) {
    const j = comp[k];
    for (const n of [j - 1, j + 1, j - TW, j + TW])
      if (n > 0 && n < TW * TH && !seen[n] && !wet[n] && range3[n] < LAKE_FLAT_M) (seen[n] = 1), comp.push(n);
  }
  if (comp.length < LAKE_MIN_PX) continue;
  // A flat pixel's 3x3 neighbourhood is flat too: widen by one pixel so the shore is the lake's.
  let sx = 0, sy = 0;
  for (const j of comp) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!wet[j + dy * TW + dx]) wet[j + dy * TW + dx] = WET.lake;
    sx += j % TW;
    sy += Math.floor(j / TW);
  }
  lakes.push({ px: comp.length, lat: latOfPx(sy / comp.length), lng: lngOfPx(sx / comp.length), e: src[comp[0]] });
}
lakes.sort((a, b) => b.px - a.px);
console.log(`water: ${holes} source holes; ${lakes.length} lakes`);
for (const l of lakes.slice(0, 12))
  console.log(`  lake ${(l.px * 0.057 * 0.057 * 0.75).toFixed(2)} km2 at ${l.lat.toFixed(3)}, ${l.lng.toFixed(3)} surface ${l.e.toFixed(1)} m`);

// ---- resample: a 6x6 supersample per output cell --------------------------------------------
// Rule 2: rivers from the NHD, rasterised at the supersample resolution (scanline, even-odd).
async function nhdRivers() {
  const file = path.join(CACHE, "nhd-streamriver.geojson");
  if (!fs.existsSync(file)) {
    const q = new URLSearchParams({
      where: "FTYPE='StreamRiver'",
      geometry: `${BOX.west},${BOX.south},${BOX.east},${BOX.north}`,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "FTYPE,AREASQKM",
      returnGeometry: "true",
      outSR: "4326",
      maxAllowableOffset: "0.0002",
      geometryPrecision: "5",
      f: "geojson",
    });
    const r = await fetch(`https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/7/query?${q}`);
    if (!r.ok) throw new Error(`NHD ${r.status}`);
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, await r.text());
  }
  return JSON.parse(fs.readFileSync(file, "utf8")).features;
}
const S = 6;
const SW = W * S, SH = H * S;
const riverMask = new Uint8Array(SW * SH);
const rivers = await nhdRivers();
let riverKm2 = 0;
for (const f of rivers) {
  riverKm2 += f.properties.AREASQKM || 0;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const rings of polys) {
    const edges = [];
    for (const ring of rings)
      for (let k = 0; k < ring.length - 1; k++) {
        const X = (lng) => ((lng - BOX.west) / (BOX.east - BOX.west)) * SW - 0.5;
        const Y = (lat) => ((BOX.north - lat) / (BOX.north - BOX.south)) * SH - 0.5;
        edges.push([X(ring[k][0]), Y(ring[k][1]), X(ring[k + 1][0]), Y(ring[k + 1][1])]);
      }
    let yMin = Infinity, yMax = -Infinity;
    for (const e of edges) (yMin = Math.min(yMin, e[1], e[3])), (yMax = Math.max(yMax, e[1], e[3]));
    for (let y = Math.max(0, Math.ceil(yMin)); y <= Math.min(SH - 1, Math.floor(yMax)); y++) {
      const xs = [];
      for (const [ax, ay, bx, by] of edges)
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.max(0, Math.ceil(xs[k])); x <= Math.min(SW - 1, Math.floor(xs[k + 1])); x++) riverMask[y * SW + x] = 1;
    }
  }
}
console.log(`NHD rivers: ${rivers.length} polygons, ${riverKm2.toFixed(0)} km2`);

function sample(lng, lat) {
  const gx = tileX(lng) * 256 - x0 * 256 - 0.5;
  const gy = tileY(lat) * 256 - y0 * 256 - 0.5;
  const ix = Math.max(0, Math.min(TW - 2, Math.floor(gx)));
  const iy = Math.max(0, Math.min(TH - 2, Math.floor(gy)));
  const fx = Math.min(1, Math.max(0, gx - ix)), fy = Math.min(1, Math.max(0, gy - iy));
  const near = (fy < 0.5 ? iy : iy + 1) * TW + (fx < 0.5 ? ix : ix + 1);
  if (wet[near]) return null;
  const a = src[iy * TW + ix], b = src[iy * TW + ix + 1];
  const c = src[(iy + 1) * TW + ix], d = src[(iy + 1) * TW + ix + 1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}
const elev = new Float32Array(W * H);
const water = new Uint8Array(W * H);
// How much of each cell is water, 0..1 (S x S subsamples): the coast as an anti-aliased edge, so
// the browser can draw the shoreline between cells instead of along their stair-stepped edges.
const wetFrac = new Float32Array(W * H);
for (let r = 0; r < H; r++)
  for (let c = 0; c < W; c++) {
    let land = 0, sum = 0;
    for (let sy = 0; sy < S; sy++)
      for (let sx = 0; sx < S; sx++) {
        const lng = BOX.west + ((c + (sx + 0.5) / S) / W) * (BOX.east - BOX.west);
        const lat = BOX.north - ((r + (sy + 0.5) / S) / H) * (BOX.north - BOX.south);
        const e = riverMask[(r * S + sy) * SW + c * S + sx] ? null : sample(lng, lat);
        if (e !== null) (land++, (sum += e));
      }
    const i = r * W + c;
    wetFrac[i] = 1 - land / (S * S);
    if (land * 2 < S * S) water[i] = 1;
    else elev[i] = Math.max(WATER_M, sum / land);
  }

// ---- the Hudson check: is the river black all the way up? -----------------------------------
const hudsonSrc = fs.readFileSync(path.join(ROOT, "lib", "geo", "hudson-water.ts"), "utf8");
const centreBlock = hudsonSrc.slice(hudsonSrc.indexOf("HUDSON_CENTRELINE"), hudsonSrc.indexOf("SHORELINES"));
const centreLines = [...centreBlock.matchAll(/\[\[(.*?)\]\]/g)].map((m) =>
  [...m[1].matchAll(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g)].map((p) => [Number(p[1]), Number(p[2])]),
);
const cellOf = (lng, lat) => {
  const c = Math.floor(((lng - BOX.west) / (BOX.east - BOX.west)) * W);
  const r = Math.floor(((BOX.north - lat) / (BOX.north - BOX.south)) * H);
  return c > 0 && c < W - 1 && r > 0 && r < H - 1 ? r * W + c : -1;
};
const walk = [];
for (const line of centreLines)
  for (let k = 1; k < line.length; k++) {
    const [aLng, aLat] = line[k - 1], [bLng, bLat] = line[k];
    const n = Math.max(1, Math.ceil(Math.hypot((bLng - aLng) * KM_LNG, (bLat - aLat) * KM_LAT) / 0.05));
    for (let s = 0; s < n; s++) {
      const lng = aLng + ((bLng - aLng) * s) / n, lat = aLat + ((bLat - aLat) * s) / n;
      if (lat >= SERVED.south && lat <= SERVED.north && lng >= SERVED.west && lng <= SERVED.east) walk.push([lng, lat]);
    }
  }
// Within `tol` cells of a water cell. The 1:10m line runs up to ~600 m off the NHD channel (north
// of Kingston, at Newburgh, at the Peekskill bend: looked at with scripts/_scratch-r54-maskviz.mjs),
// and an earlier burn at a tight tolerance cut false second channels through the banks there. So
// the centreline only reports at 600 m, and burns only a true gap: no water within 2 km.
const nearWater = (lng, lat, tol) => {
  const i = cellOf(lng, lat);
  if (i < 0) return true;
  const r = Math.floor(i / W), c = i % W;
  for (let dr = -tol; dr <= tol; dr++)
    for (let dc = -tol; dc <= tol; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < H && cc >= 0 && cc < W && water[rr * W + cc]) return true;
    }
  return false;
};
const near600 = walk.filter(([lng, lat]) => nearWater(lng, lat, 3)).length;
const gaps = walk.filter(([lng, lat]) => !nearWater(lng, lat, 10));
console.log(
  `Hudson centreline: ${walk.length} samples at 50 m; ${((100 * near600) / walk.length).toFixed(1)}% within 600 m of water, ` +
    `${gaps.length} with no water within 2 km`,
);
let burned = 0;
for (const [lng, lat] of gaps) {
  const i = cellOf(lng, lat);
  if (i >= 0 && !water[i]) (water[i] = 1), (elev[i] = 0), (wetFrac[i] = 1), burned++;
}
if (burned) console.log(`  burned ${burned} cells where the river had a true gap`);

// ---- encode --------------------------------------------------------------------------------
let maxE = 0, minLand = Infinity, waterCells = 0;
for (let i = 0; i < W * H; i++) {
  if (water[i]) waterCells++;
  else (maxE = Math.max(maxE, elev[i])), (minLand = Math.min(minLand, elev[i]));
}
const maxM = Math.ceil(maxE / 10) * 10;
const px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = water[i] ? 0 : 1 + Math.round(254 * Math.sqrt(elev[i] / maxM));
  // A land cell keeps its fraction under a half, a water cell at or over it, so the two channels
  // never disagree about which side of the shore a cell is on.
  const f = Math.round(255 * wetFrac[i]);
  px[i * 3 + 1] = water[i] ? Math.max(128, f) : Math.min(127, f);
}
fs.mkdirSync(OUT_DIR, { recursive: true });
const img = await sharp(px, { raw: { width: W, height: H, channels: 3 } }).webp({ lossless: true, effort: 6 }).toBuffer();
// Prove the file decodes back to the exact bytes (lossless means lossless).
const back = await sharp(img).removeAlpha().raw().toBuffer();
if (back.length !== px.length || back.some((v, i) => v !== px[i])) throw new Error("round trip changed the bytes");
fs.writeFileSync(path.join(OUT_DIR, `${OUT}.webp`), img);
const meta = {
  v: 1,
  // The grid's own extent (served box + margin); cell (c, r) covers [c, c+1) / w of it, row 0 north.
  box: BOX,
  served: SERVED,
  w: W,
  h: H,
  metresPerCell: { x: +cellX.toFixed(1), y: +cellY.toFixed(1) },
  encoding: "R: 0 = water, else 1 + round(254 * sqrt(e / maxM)), e in metres; G: water fraction of the cell, 0..255 (>= 128 exactly where R = 0); B: 0",
  maxM,
  minLandM: +minLand.toFixed(2),
  water: { atOrBelowM: WATER_M, nhdRiverPolygons: rivers.length, lakesFlatToM: LAKE_FLAT_M, lakes: lakes.length, hudsonWithin600mPct: +((100 * near600) / walk.length).toFixed(1), hudsonGapSamples: gaps.length, burnedCells: burned },
  source: `AWS Terrain Tiles (Mapzen/Tilezen terrarium), zoom ${Z}`,
  // Source families the tiles cite (x-amz-meta-x-imagery-sources) and how many tiles cite each.
  sourceFamilies: Object.fromEntries([...sourceNames].sort((a, b) => b[1] - a[1])),
};
fs.writeFileSync(path.join(OUT_DIR, `${OUT}.json`), JSON.stringify(meta, null, 2) + "\n");
console.log(
  `wrote public/geo/${OUT}.webp ${W}x${H} (${cellX.toFixed(0)} x ${cellY.toFixed(0)} m cells) ${(img.length / 1024).toFixed(1)} KB; ` +
    `water ${((100 * waterCells) / (W * H)).toFixed(1)}%, land ${minLand.toFixed(1)}..${maxE.toFixed(1)} m`,
);
