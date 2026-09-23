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
// Two looks, the owner chooses (docs/parity/DESIGN-ROUND57.md §4 "Round 2"):
//   --look=dusk  (A, the default cover) the land at dusk: warm, dark, lit by the homes;
//   --look=day   (B, one flag away)     the same land by day, muted to meet the satellite imagery.
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
  let col = mix(PAL.unknown, PAL.water, clamp01(sea));
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
    col = mix(mix(PAL.unknown, PAL.water, clamp01(sea)), col, k);
  }
  // Air: the far land goes to haze (the satellite map's own look at this range).
  return mix(col, PAL.haze, 0.7 * (1 - Math.exp(-Math.max(0, dist - 110_000) / 380_000)));
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
