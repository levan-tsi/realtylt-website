// THE HOME PAGE'S LOAD COVER ON THE REAL MAP (round 57.2).
//
// The home page's ground is Google's 3D map (components/home/g3d/); for its first 5 to 9 s our own
// still covers it (G3dGround's poster), because a still of Google's map may never be stored or
// shipped. Until round 57.1 that still was the night flight's (lights on black), and the dissolve
// into a DAYLIGHT satellite map was a hard change of look. This script draws the cover from OUR OWN
// data instead, shot from the map's own hero camera, so the dissolve keeps the composition and
// comes much closer in tone:
//
//   the land, water and relief:  public/geo/valley-elevation.{webp,json} (USGS 3DEP elevation and
//                                the water mask, scripts/build-elevation.mjs), hill-shaded here;
//   the coast beyond that grid:  scripts/data/ne10m-land-nyc.json (Natural Earth 1:10m land, public
//                                domain; round 57.9, the night look only);
//   the towns' own light:        the same asset's night-glow channel (NASA Black Marble 2016; dusk
//                                and day only);
//   the lights (dusk only):      the night flight's still (make-night-poster.mjs) from the same
//                                camera, laid over with a screen blend.
//
// Three looks:
//   --look=night (round 57.6, THE cover; round 57.9, MOONLIGHT) the night map's own first frame.
//                The live map is Google's satellite imagery graded to night by a CSS filter
//                (components/home/g3d/night.ts) with our lights added over it (light-layer.ts). So
//                this draws our land in the imagery's own DAYLIGHT tones (measured on the ungraded
//                live frames, below) and passes every pixel through the SAME grade (night.ts
//                gradeRgb, the filter's colour matrices, which predict Chrome's graded pixels to
//                0.2 levels), then adds our lights planned and drawn exactly as the live layer
//                does at the hero camera (round 57.8's plan: the count, the gap, the glow steps).
//                So the dissolve changes nothing but detail. Built-up land is told by our own
//                homes' density (the listings, /api/lights), not by any night-light imagery.
//                  --homes=http://127.0.0.1:3102/api/lights  --vp=1425x900 (the live map's css box)
//                  [--grade=moon2 (night.ts NIGHT_DEFAULT)] [--check=live.json (the page's own
//                  drawn lights at the hero, dumped by a probe: the cover's plan is compared)]
//   --look=dusk  (round 57.2's A, now only `?cover=dusk`) the land at dusk, lit by the homes;
//   --look=day   (round 57.2's B, only `?cover=day`)     the same land by day.
//
// Every pixel is a ray from the map's hero camera (cameras.ts `cameraFor("hero", W / H)`, camera.ts
// `cameraFrame`) to the ellipsoid; where it lands, the elevation grid says land or water and how the
// slope faces the light. Outside the grid the night look reads the coastline (land, sea, and how far
// from the shore); the dusk and day looks fade into haze there.
//
//   node scripts/make-map-cover.mjs --look=night --width=1600 --height=1000 --homes=... --vp=1425x900 --out=public/images/home-night-cover.webp
//   node scripts/make-map-cover.mjs --look=night --width=780 --height=1688 --homes=... --vp=390x844 --out=public/images/home-night-cover-tall.webp
//   node scripts/make-map-cover.mjs --look=dusk|day --width=1600 --height=1000 [--lights=night.webp] --out=public/images/...
//
// The TypeScript is read through jiti (as make-night-poster.mjs).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createJiti } from "jiti";

const flag = (k, d) => {
  const f = process.argv.find((a) => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};
const W = Number(flag("width", 1600));
const H = Number(flag("height", 1000));
const look = flag("look", "dusk");
const out = flag("out", `public/images/home-${look}-cover.webp`);
const lightsPath = flag("lights", "");
const quality = Number(flag("quality", 70));

const jiti = createJiti(import.meta.url, { alias: { "@": process.cwd() } });
const { cameraFor } = await jiti.import(path.resolve("components/home/g3d/cameras.ts"));
const { cameraFrame, fromEcef } = await jiti.import(path.resolve("components/home/g3d/camera.ts"));
const E = await jiti.import(path.resolve("components/home/night/elevation.ts"));

const meta = JSON.parse(fs.readFileSync("public/geo/valley-elevation.json", "utf8"));
const raw = await sharp("public/geo/valley-elevation.webp").ensureAlpha().raw().toBuffer();
const grid = E.decodeElevation(raw, meta, 4);
const grad = E.gradients(grid);

const cam = cameraFor("hero", W / H);
const fr = cameraFrame(cam);
const f = H / 2 / Math.tan((cam.fov * Math.PI) / 180 / 2);
console.log(`${look} ${W}x${H} from the hero camera`, JSON.stringify(cam));

// Colours, sRGB 0..255. Dusk and day: chosen against the frames of the live map (round 57.2).
const PAL = {
  // Round 57.9, the night look: the IMAGERY'S OWN DAYLIGHT TONES (the grade makes them night), box
  // means measured on the ungraded live frames at the hero camera, both widths
  // (scripts/_scratch-r57/9/model/raw/, `--measure`): forest on the uplands, fields and villages in
  // the valleys, the built city grey, the water near the shore dark (the imagery's own photograph
  // of the Hudson, the harbour, the bays), the open sea the imagery's flat blue further out.
  night: null,
  day: { forest: [52, 64, 42], field: [84, 90, 64], town: [96, 96, 90], water: [52, 80, 122], haze: [132, 146, 160], skyTop: [88, 116, 152], skyLow: [160, 174, 190], unknown: [70, 78, 58] },
  dusk: { forest: [30, 31, 27], field: [42, 41, 34], town: [58, 52, 45], water: [18, 23, 32], haze: [50, 46, 44], skyTop: [20, 20, 25], skyLow: [58, 50, 46], unknown: [34, 33, 30] },
}[look];
if (PAL === undefined) throw new Error(`unknown look ${look}`);
// Measured (`--measure`, the 1440 and 390 frames agree within 5 levels): land under 60 m (the
// Jersey and Long Island lowlands, suburban) 91..96,99..103,79..82; 60 to 160 m 69,85,64; the uplands
// 66..69,83..85,60..64; our densest homes 112,112..114,94; land outside the grid 72..74,91..97,76..91;
// water within 1 km of the shore 22..29,52..58,47..51, 1 to 2 km 40..48,71..79,87..100, from 2 km out
// the flat sea 78..87,103..111,157..172.
// The far land is hazier and bluer (Google's atmosphere; by distance from the eye, 150-200 km
// 66,83,61, 200-260 km 68,87,68, 260-340 km 72,93,80, beyond 78,103,108): the land mixes toward
// HAZE by `hazeAt(km)`, fitted to those four.
const MOON_PAL = {
  low: [93, 101, 80], field: [68, 84, 63], forest: [67, 84, 62], town: [116, 116, 97], outside: [72, 87, 64],
  shore: [25, 55, 49], near: [44, 75, 93], sea: [85, 109, 168], haze: [89, 121, 150],
};
const hazeAt = (km) => Math.min(0.8, Math.pow(Math.max(0, km - 190) / 300, 1.4));

const A = 6378137, B = A * Math.sqrt(1 - 6.69437999014e-3);
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
// The sun (dusk, day) from the north-west, 40 degrees up (the cartographer's convention), relief
// exaggerated 3x. Round 57.9: the MOON for the night look, from the west-north-west and lower (30
// degrees), so the ridges of the Highlands and the Shawangunks catch it on their western faces.
const light = (azDeg, altDeg) => {
  const az = (azDeg * Math.PI) / 180, alt = (altDeg * Math.PI) / 180;
  return [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
};
const SUN = light(315, 40);
const MOON = light(292, 30);
const RELIEF = 3;

function shade(lat, lng, dist) {
  const b = grid.box;
  // How far inside the grid, in degrees: the grid's edge fades over 0.3 degrees into the land's
  // average tone, so it never reads as a slab.
  const inside = Math.min(lat - b.south, b.north - lat, lng - b.west, b.east - lng);
  const k = smooth(-0.02, 0.3, inside);
  // Outside the grid the ocean is the one thing the phone's camera sees a lot of (south of Long
  // Island and the Jersey shore): water there, the land's average tone elsewhere.
  const sea = smooth(40.6, 40.52, lat) * smooth(-74.12, -74.02, lng) + smooth(40.36, 40.3, lat);
  const SEA = PAL.ocean ?? PAL.water;
  let col = mix(PAL.unknown, SEA, clamp01(sea));
  if (k > 0) {
    const w = E.waterness(grid, lng, lat);
    const h = E.sampleHeight(grid, lng, lat);
    const glow = E.sampleGlow(grid, lng, lat);
    const ge = E.sampleField(grid, grad.east, lng, lat) * RELIEF, gn = E.sampleField(grid, grad.north, lng, lat) * RELIEF;
    const n = [-ge, -gn, 1];
    const nl = Math.hypot(n[0], n[1], n[2]);
    const lit = clamp01((n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2]) / nl);
    const flatLit = SUN[2];
    const relief = 0.72 + 0.5 * (lit - flatLit + 0.45);
    // Low valleys are fields and towns, uplands are forest; the night glow marks built-up land.
    let land = mix(PAL.field, PAL.forest, smooth(60, 260, h));
    land = mix(land, PAL.town, smooth(0.2, 0.85, glow));
    land = land.map((c) => c * relief);
    col = mix(land, PAL.water, w);
    col = mix(mix(PAL.unknown, SEA, clamp01(sea)), col, k);
  }
  // Air: the far land goes to haze (the satellite map's own look at this range).
  return mix(col, PAL.haze, 0.7 * (1 - Math.exp(-Math.max(0, dist - 110_000) / 380_000)));
}

// ---- round 57.9: the coast (the night look) ----------------------------------------------------------
// A land mask over the coastline's box, 0.004 degrees a cell (~340 x 445 m): inside the elevation
// grid its own water mask (the Hudson, the lakes, the harbour at 200 m), outside it Natural Earth's
// land. Then every cell's distance to the shore (km, a chamfer transform), which draws the
// imagery's dark water along the shore and its flat blue further out.
let coast = null;
function buildCoast() {
  const ne = JSON.parse(fs.readFileSync("scripts/data/ne10m-land-nyc.json", "utf8"));
  const bx = ne.box, C = 0.004;
  const cw = Math.round((bx.e - bx.w) / C), ch = Math.round((bx.n - bx.s) / C);
  const land = new Uint8Array(cw * ch);
  // Natural Earth's land, even-odd scanline fill at each row's centre.
  for (let y = 0; y < ch; y++) {
    const lat = bx.s + (y + 0.5) * C;
    const xs = [];
    for (const r of ne.rings)
      for (let i = 0; i < r.length; i++) {
        const a = r[i], b = r[(i + 1) % r.length];
        if ((a[1] <= lat) !== (b[1] <= lat)) xs.push(a[0] + ((lat - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil((xs[k] - bx.w) / C - 0.5)), x1 = Math.min(cw - 1, Math.floor((xs[k + 1] - bx.w) / C - 0.5));
      for (let x = x0; x <= x1; x++) land[y * cw + x] ^= 1;
    }
  }
  // Inside the elevation grid its own water mask decides (finer, and it has the rivers and lakes).
  const g = grid.box;
  for (let y = 0; y < ch; y++) {
    const lat = bx.s + (y + 0.5) * C;
    if (lat < g.south || lat > g.north) continue;
    for (let x = 0; x < cw; x++) {
      const lng = bx.w + (x + 0.5) * C;
      if (lng < g.west || lng > g.east) continue;
      land[y * cw + x] = E.waterness(grid, lng, lat) < 0.5 ? 1 : 0;
    }
  }
  // Distance to the shore, km, for water cells (land cells 0): two chamfer passes.
  const kmx = C * 111.32 * Math.cos((41 * Math.PI) / 180), kmy = C * 110.95, kmd = Math.hypot(kmx, kmy);
  const d = new Float32Array(cw * ch);
  for (let i = 0; i < d.length; i++) d[i] = land[i] ? 0 : 1e9;
  const relax = (i, j, w) => {
    if (d[j] + w < d[i]) d[i] = d[j] + w;
  };
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) {
      const i = y * cw + x;
      if (x > 0) relax(i, i - 1, kmx);
      if (y > 0) {
        relax(i, i - cw, kmy);
        if (x > 0) relax(i, i - cw - 1, kmd);
        if (x < cw - 1) relax(i, i - cw + 1, kmd);
      }
    }
  for (let y = ch - 1; y >= 0; y--)
    for (let x = cw - 1; x >= 0; x--) {
      const i = y * cw + x;
      if (x < cw - 1) relax(i, i + 1, kmx);
      if (y < ch - 1) {
        relax(i, i + cw, kmy);
        if (x < cw - 1) relax(i, i + cw + 1, kmd);
        if (x > 0) relax(i, i + cw - 1, kmd);
      }
    }
  // Bilinear samples of the mask (0..1 land) and the distance.
  const sample = (field, lat, lng) => {
    const x = (lng - bx.w) / C - 0.5, y = (lat - bx.s) / C - 0.5;
    const x0 = Math.max(0, Math.min(cw - 2, Math.floor(x))), y0 = Math.max(0, Math.min(ch - 2, Math.floor(y)));
    const fx = clamp01(x - x0), fy = clamp01(y - y0);
    const i = y0 * cw + x0;
    return field[i] * (1 - fx) * (1 - fy) + field[i + 1] * fx * (1 - fy) + field[i + cw] * (1 - fx) * fy + field[i + cw + 1] * fx * fy;
  };
  const landF = Float32Array.from(land);
  coast = { landAt: (lat, lng) => sample(landF, lat, lng), shoreKm: (lat, lng) => sample(d, lat, lng) };
}

/** The night look's DAYLIGHT colour at a place (the grade makes it night; see the header). */
function moonBase(lat, lng, dist) {
  const b = grid.box;
  const inside = Math.min(lat - b.south, b.north - lat, lng - b.west, b.east - lng);
  const k = smooth(-0.02, 0.2, inside);
  const P = MOON_PAL;
  // Water: dark along the shore, the imagery's flat blue from a couple of km out.
  const km = coast.shoreKm(lat, lng);
  const water = km < 1.5 ? mix(P.shore, P.near, smooth(0.3, 1.5, km)) : mix(P.near, P.sea, smooth(1.5, 2.6, km));
  // Land: fields in the valleys, forest on the uplands, grey where our homes are dense.
  let h = 0, w = 1 - coast.landAt(lat, lng), relief = 1;
  let built = builtAt(lat, lng);
  if (k > 0) {
    h = E.sampleHeight(grid, lng, lat);
    w = w * (1 - k) + E.waterness(grid, lng, lat) * k;
    const ge = E.sampleField(grid, grad.east, lng, lat) * RELIEF, gn = E.sampleField(grid, grad.north, lng, lat) * RELIEF;
    const nl = Math.hypot(ge, gn, 1);
    const lit = clamp01((-ge * MOON[0] - gn * MOON[1] + MOON[2]) / nl);
    // Subtle: a slope facing the moon a little brighter, one facing away a little darker.
    relief = 1 + MOON_RELIEF * (lit - MOON[2]) * k;
  }
  let land = mix(mix(P.low, P.field, smooth(20, 90, h)), P.forest, smooth(160, 300, h));
  land = mix(P.outside, land, k);
  land = mix(land, P.town, smooth(0.3, 0.9, built));
  land = land.map((c) => c * relief);
  land = mix(land, P.haze, hazeAt(dist / 1000));
  return mix(land, water, clamp01(w));
}
const MOON_RELIEF = Number(flag("relief", "0.5"));

// ---- round 57.6: our homes (the night look) ------------------------------------------------------
const homesUrl = flag("homes", "");
let homes = null;
let builtAt = () => 0;
if (look === "night") {
  if (!homesUrl) throw new Error("--look=night needs --homes=<url of /api/lights>");
  const L = await jiti.import(path.resolve("lib/idx/lights.ts"));
  const W0 = await jiti.import(path.resolve("components/home/night/world.ts"));
  const packed = await (await fetch(homesUrl)).json();
  const pts = L.unpackLights(packed);
  const n = pts.x.length;
  const lat = new Float64Array(n), lng = new Float64Array(n), county = new Array(n);
  for (let i = 0; i < n; i++) {
    const [a, b] = W0.boxUVToLngLat(pts.x[i], pts.y[i], pts.box);
    lng[i] = a;
    lat[i] = b;
    county[i] = pts.townCounty[pts.town[i]] ?? "";
  }
  homes = { lat, lng, county, n };
  // Built-up land: homes per 0.01-degree cell, blurred, as 0..1 (a borough ~1, a village ~0.3).
  const b = grid.box, CW = 0.01;
  const gw = Math.ceil((b.east - b.west) / CW), gh = Math.ceil((b.north - b.south) / CW);
  let dens = new Float32Array(gw * gh);
  for (let i = 0; i < n; i++) {
    const cx = Math.floor((lng[i] - b.west) / CW), cy = Math.floor((lat[i] - b.south) / CW);
    if (cx >= 0 && cy >= 0 && cx < gw && cy < gh) dens[cy * gw + cx]++;
  }
  for (let pass = 0; pass < 3; pass++) {
    const nx = new Float32Array(gw * gh);
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      let s = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < gw && Y < gh) { s += dens[Y * gw + X]; c++; } }
      nx[y * gw + x] = s / c;
    }
    dens = nx;
  }
  builtAt = (la, ln) => {
    const x = (ln - b.west) / CW - 0.5, y = (la - b.south) / CW - 0.5;
    if (x < -1 || y < -1 || x > gw || y > gh) return 0;
    const x0 = Math.max(0, Math.min(gw - 2, Math.floor(x))), y0 = Math.max(0, Math.min(gh - 2, Math.floor(y)));
    const fx = clamp01(x - x0), fy = clamp01(y - y0);
    const v = dens[y0 * gw + x0] * (1 - fx) * (1 - fy) + dens[y0 * gw + x0 + 1] * fx * (1 - fy) + dens[(y0 + 1) * gw + x0] * (1 - fx) * fy + dens[(y0 + 1) * gw + x0 + 1] * fx * fy;
    return clamp01(Math.sqrt(v / 6));
  };
  buildCoast();
}

/** Where the ray through image pixel (px, py) meets the ground, or null (sky). */
const [ex, ey, ez] = fr.eye;
const ox = ex / A, oy = ey / A, oz = ez / B;
function ground(px, py, w = W, h = H, ff = f) {
  const u = (px - w / 2) / ff, v = (h / 2 - py) / ff;
  const d = [fr.forward[0] + fr.right[0] * u + fr.up[0] * v, fr.forward[1] + fr.right[1] * u + fr.up[1] * v, fr.forward[2] + fr.right[2] * u + fr.up[2] * v];
  const dx = d[0] / A, dy = d[1] / A, dz = d[2] / B;
  const qa = dx * dx + dy * dy + dz * dz, qb = 2 * (ox * dx + oy * dy + oz * dz), qc = ox * ox + oy * oy + oz * oz - 1;
  const disc = qb * qb - 4 * qa * qc;
  if (disc < 0) return { sky: true, v };
  const t = (-qb - Math.sqrt(disc)) / (2 * qa);
  const ll = fromEcef([ex + d[0] * t, ey + d[1] * t, ez + d[2] * t]);
  return { sky: false, lat: ll.lat, lng: ll.lng, dist: t * Math.hypot(d[0], d[1], d[2]) };
}

// ---- `--measure=<ungraded frame.png>` (round 57.9): the imagery's tones by what our data says is there
const measure = flag("measure", "");
if (measure && look === "night") {
  const [vw, vh] = flag("vp", W + "x" + H).split("x").map(Number);
  const { data, info } = await sharp(measure).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const sc = info.height / vh; // the frame's device pixels per css px
  const fv = vh / 2 / Math.tan((cam.fov * Math.PI) / 180 / 2);
  const bins = new Map();
  const add = (k, o) => {
    const b = bins.get(k) ?? [0, 0, 0, 0];
    b[0] += data[o]; b[1] += data[o + 1]; b[2] += data[o + 2]; b[3]++;
    bins.set(k, b);
  };
  const g = grid.box;
  for (let y = 0; y < vh - 60; y += 2)
    for (let x = 0; x < vw; x += 2) {
      if (x < 200 && y > vh - 70) continue;
      const q = ground(x + 0.5, y + 0.5, vw, vh, fv);
      if (q.sky) continue;
      const o = (Math.round(y * sc) * info.width + Math.round(x * sc)) * 3;
      const inGrid = q.lat > g.south + 0.05 && q.lat < g.north - 0.05 && q.lng > g.west + 0.05 && q.lng < g.east - 0.05;
      const lnd = coast.landAt(q.lat, q.lng);
      const w = inGrid ? E.waterness(grid, q.lng, q.lat) : 1 - lnd;
      if (w > 0.9) {
        const km = coast.shoreKm(q.lat, q.lng);
        add(`water km ${km < 1 ? "0-1" : km < 2 ? "1-2" : km < 4 ? "2-4" : km < 8 ? "4-8" : "8+"}`, o);
      } else if (w < 0.1) {
        const bt = builtAt(q.lat, q.lng);
        if (bt > 0.6) add("land built>0.6", o);
        else if (bt > 0.3) add("land built 0.3-0.6", o);
        else {
          const km = q.dist / 1000;
          const dk = km < 150 ? "<150" : km < 200 ? "150-200" : km < 260 ? "200-260" : km < 340 ? "260-340" : "340+";
          if (!inGrid) add(`land outside grid, km ${dk}`, o);
          else {
            const h = E.sampleHeight(grid, q.lng, q.lat);
            add(`land h ${h < 60 ? "<60" : h < 160 ? "60-160" : "160+"}, km ${dk}`, o);
          }
        }
      }
    }
  for (const [k, b] of [...bins].sort()) console.log(k.padEnd(22), [b[0] / b[3], b[1] / b[3], b[2] / b[3]].map((v) => v.toFixed(0)).join(","), "n", b[3]);
  process.exit(0);
}

const N = look === "night" ? await jiti.import(path.resolve("components/home/g3d/night.ts")) : null;
const gradeKey = flag("grade", N?.NIGHT_DEFAULT ?? "");
const gradeOf = (() => {
  if (!N) return null;
  const g = N.NIGHT[gradeKey];
  if (!g) throw new Error(`unknown grade ${gradeKey}`);
  const cache = new Map();
  return (c) => {
    const r = Math.round(c[0]), gg = Math.round(c[1]), b = Math.round(c[2]);
    const key = (r << 16) | (gg << 8) | b;
    let v = cache.get(key);
    if (!v) cache.set(key, (v = N.gradeRgb([r, gg, b], g)));
    return v;
  };
})();

const SS = 2; // 2x2 samples a pixel
const img = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let r = 0, g = 0, bl = 0;
    for (let sy = 0; sy < SS; sy++)
      for (let sx = 0; sx < SS; sx++) {
        const q = ground(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS);
        let c;
        if (q.sky) c = PAL ? mix(PAL.skyLow, PAL.skyTop, smooth(0, 0.35, q.v)) : [0, 0, 0];
        else c = PAL ? shade(q.lat, q.lng, q.dist) : moonBase(q.lat, q.lng, q.dist);
        r += c[0];
        g += c[1];
        bl += c[2];
      }
    let c = [r / (SS * SS), g / (SS * SS), bl / (SS * SS)];
    // The night look: the pixel as the browser grades it (the imagery's pixel, then the filter).
    if (gradeOf) c = gradeOf(c);
    const i = (y * W + x) * 3;
    img[i] = Math.round(c[0]);
    img[i + 1] = Math.round(c[1]);
    img[i + 2] = Math.round(c[2]);
  }
}

let pipe = sharp(img, { raw: { width: W, height: H, channels: 3 } });
if (homes && flag("nolights", "0") !== "1") {
  // THE LIGHTS, as the live layer draws them at the hero (controller.ts replan, light-layer.ts
  // draw; round 57.8): the budget and the gap for the live map's css box and width (a phone's gap
  // and glyph below 640 px), the density plan over the same fixed hash order (the first plan under
  // the cover keeps nothing), each light's glow step by the homes it stands for, the logo corner
  // left dark, every light the glyph's three profiles to its full reach, added.
  const G = await jiti.import(path.resolve("components/home/g3d/glyph.ts"));
  const P = await jiti.import(path.resolve("components/home/g3d/light-plan.ts"));
  const C = await jiti.import(path.resolve("components/home/g3d/cameras.ts"));
  const [vw, vh] = flag("vp", W + "x" + H).split("x").map(Number);
  const vp = { width: vw, height: vh, fov: cam.fov };
  const narrow = C.isNarrow(vp);
  const ecef = P.homesEcef(homes.lat, homes.lng, (la, ln) => E.sampleHeight(grid, ln, la));
  const order = P.hashOrder(homes.n);
  const gap = C.densityGap(cam.range, narrow);
  const proj = P.projectAll(ecef, fr, vp, 8, homes.county, null);
  const planAt = (c, keep, pj) =>
    P.planDensity({ ecef, order, frame: cameraFrame(c), viewport: { ...vp, fov: c.fov }, budget: C.budgetFor(c.range, vp), gap: C.densityGap(c.range, narrow), county: homes.county, focus: null, keep, proj: pj });
  let plan = planAt(cam, undefined, proj);
  // THE WALK UNDER THE COVER (warm-plan.ts): on a wide window the map is set at the Highlands under
  // the cover (a cut, planned with the lit homes kept, planDensity `keep`), flies to Westchester and
  // comes back to the hero before the reveal, so the revealed hero keeps a few of the walk's homes.
  // Measured against a dump of the page's own lights at the hero (--check): the cold plan shares 436
  // of 445 homes, the Highlands step then the hero 442, the Highlands and Westchester steps 431; so
  // the cover takes the Highlands step. The phone's walk is a timed jump through the page's shots,
  // not reproducible here: its cover keeps the cold plan.
  const walk = flag("walk", narrow ? "" : "highlands").split(",").filter(Boolean);
  if (walk.length) {
    for (const s of walk) {
      const c = cameraFor(s, vw / vh);
      plan = planAt(c, plan, P.projectAll(ecef, cameraFrame(c), { ...vp, fov: c.fov }, 8, homes.county, null));
    }
    plan = planAt(cam, plan, proj);
  }
  const counts = P.representedCounts({ ecef, frame: fr, viewport: vp, plan, reach: 1.5 * gap, county: homes.county, focus: null, proj });
  const median = [...counts].sort((a, b) => a - b)[Math.floor(counts.length / 2)] ?? 1;
  const g = G.glyphAt(cam.range, { narrow });
  const stepped = P.GLOW_LEVELS.map((l) => ({ ...g, glowAlpha: g.glowAlpha * l }));
  const s = H / vh; // css px to image px
  const f2 = P.focalOf(vp);
  const acc = Float32Array.from(img);
  const q = { x: 0, y: 0, z: 0 };
  const r0 = G.reachOf(g), reach = r0 * 1.6;
  // Google's logo corner (G3dGround LOGO_CORNER 180 x 54 at the window's foot): no light there.
  const av = { x: 0, y: vh - 54, w: 180, h: 54 };
  const drawnAt = [];
  for (let k = 0; k < plan.length; k++) {
    const i = plan[k];
    if (!P.projectHome(fr, vp, f2, ecef, i, q)) continue;
    if (q.x < -reach || q.y < -reach || q.x > vw + reach || q.y > vh + reach) continue;
    if (q.x + r0 > av.x && q.x - r0 < av.x + av.w && q.y + r0 > av.y && q.y - r0 < av.y + av.h) continue;
    const gl = stepped[P.glowLevel(counts[k], median)];
    drawnAt.push([i, q.x, q.y]);
    const cx = W / 2 + (q.x - vw / 2) * s, cy = q.y * s;
    const R = Math.ceil(G.reachOf(gl) * s) + 1;
    for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(H - 1, Math.ceil(cy + R)); y++)
      for (let x = Math.max(0, Math.floor(cx - R)); x <= Math.min(W - 1, Math.ceil(cx + R)); x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / s;
        const [ar, ag, ab] = G.glyphAdd(gl, d);
        const o = (y * W + x) * 3;
        acc[o] += Math.min(255, ar);
        acc[o + 1] += Math.min(255, ag);
        acc[o + 2] += Math.min(255, ab);
      }
  }
  const out8 = Buffer.alloc(W * H * 3);
  for (let i = 0; i < acc.length; i++) out8[i] = Math.min(255, Math.round(acc[i]));
  pipe = sharp(out8, { raw: { width: W, height: H, channels: 3 } });
  console.log("lights:", plan.length, "planned,", drawnAt.length, "drawn; gap", gap, "narrow", narrow, "glyph", JSON.stringify(g), "scale", s.toFixed(3));
  const check = flag("check", "");
  if (check) {
    // The page's own lights at the hero (a probe's dump): the same homes, at the same places?
    const live = JSON.parse(fs.readFileSync(check, "utf8"));
    const mine = new Map(drawnAt.map(([i, x, y]) => [i, [x, y]]));
    let same = 0, worst = 0, sum = 0, levels = 0;
    const lv = new Map(plan.map((i, k) => [i, P.glowLevel(counts[k], median)]));
    for (const [i, x, y, l] of live.lights) {
      const m = mine.get(i);
      if (!m) continue;
      same++;
      const e = Math.hypot(m[0] - x, m[1] - y);
      sum += e;
      worst = Math.max(worst, e);
      if (lv.get(i) === l) levels++;
    }
    console.log(`check: live ${live.lights.length}, cover ${drawnAt.length}, same homes ${same}, place error mean ${(sum / Math.max(1, same)).toFixed(2)} px max ${worst.toFixed(2)} px, same glow step ${levels}`);
  }
}
if (lightsPath) {
  // The homes' light from the night flight's still, same camera, screen-blended over the land.
  const lights = await sharp(lightsPath).resize(W, H, { fit: "fill" }).removeAlpha().raw().toBuffer();
  const base = await pipe.raw().toBuffer();
  const gain = look === "day" ? 0.55 : 1;
  for (let i = 0; i < base.length; i++) base[i] = Math.round(255 - ((255 - base[i]) * (255 - lights[i] * gain)) / 255);
  pipe = sharp(base, { raw: { width: W, height: H, channels: 3 } });
}
fs.mkdirSync(path.dirname(out), { recursive: true });
const info = await pipe.webp({ quality, effort: 6 }).toFile(out);
console.log(`${out}  ${W}x${H}  ${(info.size / 1024).toFixed(1)} KB`);
