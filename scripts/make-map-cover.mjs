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
//   the towns' own light:        the same asset's night-glow channel (NASA Black Marble 2016);
//   the lights (dusk only):      the night flight's still (make-night-poster.mjs) from the same
//                                camera, laid over with a screen blend.
//
// Three looks:
//   --look=night (round 57.6, THE cover) the night map's own first frame: the live map is graded
//                to night (components/home/g3d/night.ts) and carries our lights (light-layer.ts),
//                so this draws our land in that grade's tones (measured on the graded frames,
//                scripts/_scratch-r57/6/) and our lights with the SAME glyph (glyph.ts) at the SAME
//                places (the same planner, light-plan.ts planDensity, at the same camera and in the
//                same css viewport), so the dissolve changes nothing but detail. Built-up land is
//                told by our own homes' density (the listings, /api/lights), not by any night-light
//                imagery: no NASA data is in it.
//                  --homes=http://127.0.0.1:3102/api/lights  --vp=1423x900 (the live map's css box)
//                  [--narrow=1 for the phone's glyph and floor]
//   --look=dusk  (round 57.2's A, now only `?cover=dusk`) the land at dusk, lit by the homes;
//   --look=day   (round 57.2's B, only `?cover=day`)     the same land by day.
//
// Every pixel is a ray from the map's hero camera (cameras.ts `cameraFor("hero", W / H)`, camera.ts
// `cameraFrame`) to the ellipsoid; where it lands, the elevation grid says land or water and how the
// slope faces the sun. Outside the grid (Connecticut, eastern Long Island, the Atlantic) the land
// fades into haze; beyond the horizon, sky.
//
//   node scripts/make-map-cover.mjs --look=dusk|day --width=1600 --height=1000 [--lights=night.webp] --out=public/images/...
//
// Needs no server and no network. The TypeScript is read through jiti (as make-night-poster.mjs).
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

// Colours, linear-ish sRGB 0..255. Chosen against the frames of the live map (round 57.1): the
// satellite's land is a dark olive with grey towns, its water in HYBRID a flat mid blue.
const PAL = {
  // Round 57.6: the tones of the night-graded live map, measured (scripts/_scratch-r57f-samp.mjs on
  // the graded territory frame): open land 10..24, hills 24..32 with their lit faces, the sea
  // 24,33,58 in the Sound and the harbour to 32,43,72 offshore (HYBRID's flat sea through the grade), the lit city
  // a grey ~70, the sky 5,6,8.
  night: { forest: [21, 26, 30], field: [30, 35, 39], town: [50, 52, 56], water: [24, 33, 58], haze: [26, 30, 37], skyTop: [4, 5, 8], skyLow: [12, 15, 22], unknown: [24, 28, 33], ocean: [30, 40, 68] },
  day: { forest: [52, 64, 42], field: [84, 90, 64], town: [96, 96, 90], water: [52, 80, 122], haze: [132, 146, 160], skyTop: [88, 116, 152], skyLow: [160, 174, 190], unknown: [70, 78, 58] },
  dusk: { forest: [30, 31, 27], field: [42, 41, 34], town: [58, 52, 45], water: [18, 23, 32], haze: [50, 46, 44], skyTop: [20, 20, 25], skyLow: [58, 50, 46], unknown: [34, 33, 30] },
}[look];
if (!PAL) throw new Error(`unknown look ${look}`);

const A = 6378137, B = A * Math.sqrt(1 - 6.69437999014e-3);
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
// The sun from the north-west, 40 degrees up (the cartographer's convention), relief exaggerated 3x.
const SUN = (() => {
  const az = (315 * Math.PI) / 180, alt = (40 * Math.PI) / 180;
  return [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
})();
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
    const glow = look === "night" ? builtAt(lat, lng) : E.sampleGlow(grid, lng, lat);
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
    const x0 = Math.max(0, Math.min(gw - 2, Math.floor(x))), y0 = Math.max(0, Math.min(gh - 2, Math.floor(y)));
    const fx = clamp01(x - x0), fy = clamp01(y - y0);
    const v = dens[y0 * gw + x0] * (1 - fx) * (1 - fy) + dens[y0 * gw + x0 + 1] * fx * (1 - fy) + dens[(y0 + 1) * gw + x0] * (1 - fx) * fy + dens[(y0 + 1) * gw + x0 + 1] * fx * fy;
    return clamp01(Math.sqrt(v / 6));
  };
}

const SS = 2; // 2x2 samples a pixel
const img = Buffer.alloc(W * H * 3);
const [ex, ey, ez] = fr.eye;
const ox = ex / A, oy = ey / A, oz = ez / B;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let r = 0, g = 0, bl = 0;
    for (let sy = 0; sy < SS; sy++)
      for (let sx = 0; sx < SS; sx++) {
        const px = x + (sx + 0.5) / SS, py = y + (sy + 0.5) / SS;
        const u = (px - W / 2) / f, v = (H / 2 - py) / f;
        const d = [fr.forward[0] + fr.right[0] * u + fr.up[0] * v, fr.forward[1] + fr.right[1] * u + fr.up[1] * v, fr.forward[2] + fr.right[2] * u + fr.up[2] * v];
        const dx = d[0] / A, dy = d[1] / A, dz = d[2] / B;
        const qa = dx * dx + dy * dy + dz * dz, qb = 2 * (ox * dx + oy * dy + oz * dz), qc = ox * ox + oy * oy + oz * oz - 1;
        const disc = qb * qb - 4 * qa * qc;
        let c;
        if (disc < 0) {
          // Sky: haze at the horizon to a deeper tone above it.
          c = mix(PAL.skyLow, PAL.skyTop, smooth(0, 0.35, v - 0));
        } else {
          const t = (-qb - Math.sqrt(disc)) / (2 * qa);
          const p = [ex + d[0] * t, ey + d[1] * t, ez + d[2] * t];
          const ll = fromEcef(p);
          c = shade(ll.lat, ll.lng, t * Math.hypot(d[0], d[1], d[2]));
        }
        r += c[0];
        g += c[1];
        bl += c[2];
      }
    const i = (y * W + x) * 3;
    img[i] = Math.round(r / (SS * SS));
    img[i + 1] = Math.round(g / (SS * SS));
    img[i + 2] = Math.round(bl / (SS * SS));
  }
}

let pipe = sharp(img, { raw: { width: W, height: H, channels: 3 } });
if (homes) {
  // THE LIGHTS: planned exactly as the live layer plans them (controller.ts replan: budgetFor,
  // densityGap, planDensity over the same fixed order) in the live map's css viewport, then drawn
  // with the same glyph, scaled to this image (bg-cover: the css box fills the image's height).
  const G = await jiti.import(path.resolve("components/home/g3d/glyph.ts"));
  const P = await jiti.import(path.resolve("components/home/g3d/light-plan.ts"));
  const C = await jiti.import(path.resolve("components/home/g3d/cameras.ts"));
  const [vw, vh] = flag("vp", W + "x" + H).split("x").map(Number);
  const narrow = flag("narrow", "0") === "1";
  const vp = { width: vw, height: vh, fov: cam.fov };
  const ecef = P.homesEcef(homes.lat, homes.lng, (la, ln) => E.sampleHeight(grid, ln, la));
  const order = P.hashOrder(homes.n);
  const plan = P.planDensity({ ecef, order, frame: fr, viewport: vp, budget: C.budgetFor(cam.range, vp), gap: C.densityGap(cam.range), county: homes.county, focus: null });
  const g = G.glyphAt(cam.range, { narrow });
  const s = H / vh; // css px to image px
  const f2 = P.focalOf(vp);
  const acc = Float32Array.from(img);
  const q = { x: 0, y: 0, z: 0 };
  let drawn = 0;
  for (const i of plan) {
    if (!P.projectHome(fr, vp, f2, ecef, i, q)) continue;
    // Google's logo corner: the live layer draws no light there (light-layer.ts avoid).
    if (q.x - g.halo < 180 && q.y + g.halo > vh - 54) continue;
    const cx = W / 2 + (q.x - vw / 2) * s, cy = q.y * s;
    const R = Math.ceil(g.halo * s) + 1;
    for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(H - 1, Math.ceil(cy + R)); y++)
      for (let x = Math.max(0, Math.floor(cx - R)); x <= Math.min(W - 1, Math.ceil(cx + R)); x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / s;
        const [ar, ag, ab] = G.glyphAdd(g, d);
        const o = (y * W + x) * 3;
        acc[o] += ar;
        acc[o + 1] += ag;
        acc[o + 2] += ab;
      }
    drawn++;
  }
  const out8 = Buffer.alloc(W * H * 3);
  for (let i = 0; i < acc.length; i++) out8[i] = Math.min(255, Math.round(acc[i]));
  pipe = sharp(out8, { raw: { width: W, height: H, channels: 3 } });
  console.log("lights:", plan.length, "planned,", drawn, "drawn, glyph core", g.core.toFixed(2), "halo", g.halo.toFixed(1), "(css px), scale", s.toFixed(3));
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
