// THE FLIGHTS AS FILMS (round 59, docs/parity/DESIGN-ROUND59.md §3): for each adjacent pair of the
// home page's plates (hero to dutchess ... harbour to region, 16), the live map's own flight recorded
// ONCE, frame by frame, in exactly the plates' geometry, with the camera's pixel matrix per frame, and
// encoded as a short muted clip each way. The page plays the clip between the two plates and draws
// our lights on every presented frame from that frame's matrix (components/home/plates/).
//
// Deterministic, not a screencast: the camera of every frame is computed here (flight-path.ts, a port
// of maplibre-gl's flyTo at the live controller's curve 1.3, MapLibre's default easing, 30 frames a
// second, the length the live flight took: shots.ts flightMs), the map is jumped to it, every tile
// waited for, then photographed. So frame 0 is plate A's camera and frame n plate B's, exactly.
//
// Stages, each repeatable on its own:
//   shoot   drives the running site pinned on a plate (`?plate=`, the renderer's own path) in the
//           plate's geometry (the deep render: 2880 x 1800 css at scale 1, the phone 780 x 1688 at
//           1.5; the plain hero and region at 1440 x 900 at 2 and 390 x 844 at 3: the same device
//           pixels), the centre's height held per frame (`?elev=`, then `jumpTo({ elevation })`);
//           raw PNGs and frames.json (camera, world size, matrix per frame) under RAW, gitignored.
//           A pair whose two plates were drawn differently (the plain hero or region beside a deep
//           plate; two deep plates on different terrain levels) is shot twice, once as each plate
//           was, and the two are dissolved across the middle of the flight (DISSOLVE), so each end
//           is its own plate.
//   grade   the frames graded as the plates are (make-plates.mjs GRADE and its LUT), the grade
//           interpolated by k between plate A's and plate B's, piped into a lossless master (FFV1).
//   encode  WebM VP9 and MP4 H.264, forward and reversed, at the plate's device size (and the laptop's
//           at 1440 as well), into public/flights/, plus the frames' matrices as JSON there and the
//           manifest components/home/plates/flights.gen.ts.
//
//   node --experimental-strip-types scripts/make-flights.mjs [--stage=shoot|grade|encode|all]
//        [--only=dutchess-county--orange,...] [--aspect=wide|tall] [--fps=30] [--headless]
//        [--base=http://127.0.0.1:3102] [--crf=34] [--keep]
//
// The server must be the production build on :3102. No MLS Grid call: `/api/media/` and `/api/lead`
// are blocked. The pictures are of the same map as the plates (OpenStreetMap data in OpenMapTiles
// tiles from OpenFreeMap, the AWS terrain): the same credits.
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";
import sharp from "sharp";
import { flightFrames } from "../components/home/plates/flight-path.ts";
import { GRADE, SHOTS } from "./make-plates.mjs";

const flag = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const base = flag("base", "http://127.0.0.1:3102");
const stage = flag("stage", "all");
const only = flag("only", "") ? flag("only", "").split(",") : null;
const aspectOnly = flag("aspect", "");
const FPS = Number(flag("fps", "30"));
const headless = process.argv.includes("--headless");
const keep = process.argv.includes("--keep");

const PLATE_RAW = "scripts/_scratch-r57/58/plates/raw";
const ROOT = "scripts/_scratch-r57/58/flights";
const OUT = "public/flights";
const GEN = "components/home/plates/flights.gen.ts";

/** The two geometries each aspect's plates were drawn in: the deep render (round 59) and the plain
 * one (the hero and the region, round 58). The same device pixels either way.
 * pixel widths, the device size first. */
const GEOM = {
  wide: { deep: { vp: { width: 2880, height: 1800 }, dpr: 1 }, plain: { vp: { width: 1440, height: 900 }, dpr: 2 }, mobile: false, px: { w: 2880, h: 1800 } },
  tall: { deep: { vp: { width: 780, height: 1688 }, dpr: 1.5 }, plain: { vp: { width: 390, height: 844 }, dpr: 3 }, mobile: true, px: { w: 1170, h: 2532 } },
};

/** Where the two renders of a two-way pair cross: plate A's drawing wholly until k = LO, plate B's
 * from HI, a smoothstep between (the flight is highest and fastest there, the two drawings of the
 * same camera closest). */
const DISSOLVE = { lo: 0.3, hi: 0.7 };

/** THE ENCODES (the record §3 has the measurements that chose them). Pixel widths per codec: the
 * laptop's clip at 1440 x 900 for every screen (a 2880 clip is 1 MB and more, and the film is motion:
 * the plate it lands on is the sharp picture), the phone's at 780 x 1688. VP9 first, H.264 for the
 * browsers that decode it better (Safari; the page asks mediaCapabilities). A clip over CAP is
 * encoded again at a lower quality and the table says so. */
const ENC = { wide: { vp9: [1440], h264: [1440] }, tall: { vp9: [780], h264: [780] } };
const CRF = { wide: { vp9: Number(flag("crf", "40")), h264: 27 }, tall: { vp9: Number(flag("crft", "40")), h264: 27 } };
const CRF_MAX = { vp9: 48, h264: 32 };
const CAP = 900 * 1024;

export const PAIRS = SHOTS.slice(0, -1).map((a, i) => [a, SHOTS[i + 1]]);
const pairName = (a, b) => `${a}--${b}`;
const wantedPairs = PAIRS.filter(([a, b]) => !only || only.includes(pairName(a, b)));
const aspects = Object.keys(GEOM).filter((a) => !aspectOnly || a === aspectOnly);

const plateRec = (shot, aspect) => JSON.parse(fs.readFileSync(`${PLATE_RAW}/${shot}-${aspect}.json`, "utf8"));
/** A plate's camera in the deep geometry (a plain plate: the same ground one zoom deeper). */
const deepCam = (rec) => ({ lng: rec.cam.lng, lat: rec.cam.lat, zoom: rec.cam.zoom + (rec.deep ? 0 : 1), pitch: rec.cam.pitch, bearing: rec.cam.bearing, elevation: rec.cam.elevation });
/** How a plate was drawn: plain, or deep on which terrain level (style.ts deepDemMaxzoom). */
const cfgOf = (rec) => (rec.deep ? `deep${Math.min(12, Math.floor(rec.cam.zoom - 1) - 1)}` : "plain");

/** shots.ts flightMs and geo.ts rangeForZoom (the numbers the live controller flew by; the manifest
 * test holds every clip's frame count to them). */
const EARTH_C = 40_075_016.686;
const rangeOf = (cam, heightPx, fov) => ((0.5 * heightPx) / Math.tan((fov * Math.PI) / 360)) * EARTH_C * Math.cos((cam.lat * Math.PI) / 180) / (512 * 2 ** cam.zoom);
function flightMs(a, b, min = 1600, max = 2600) {
  const km = Math.hypot((a.lat - b.lat) * 111.13, (a.lng - b.lng) * 84.1);
  const alt = Math.abs(Math.log2(Math.max(1, a.range) / Math.max(1, b.range)));
  const k = Math.min(1, Math.max(km / 120, alt / 4));
  return Math.round(min + (max - min) * Math.sqrt(k));
}

/** The flight's plan for a pair and an aspect: its frames' cameras (deep geometry), who draws which. */
function planOf(a, b, aspect) {
  const G = GEOM[aspect];
  const ra = plateRec(a, aspect), rb = plateRec(b, aspect);
  const A = deepCam(ra), B = deepCam(rb);
  const fov = ra.cam.fov;
  const ms = flightMs({ lat: A.lat, lng: A.lng, range: rangeOf(A, G.deep.vp.height, fov) }, { lat: B.lat, lng: B.lng, range: rangeOf(B, G.deep.vp.height, fov) });
  const n = Math.round((ms * FPS) / 1000);
  const frames = flightFrames(A, B, G.deep.vp, n, 1.3);
  const two = cfgOf(ra) !== cfgOf(rb);
  const passes = two ? [{ shot: a, rec: ra, from: 0, to: DISSOLVE.hi }, { shot: b, rec: rb, from: DISSOLVE.lo, to: 1 }] : [{ shot: a, rec: ra, from: 0, to: 1 }];
  return { a, b, aspect, fov, ms, n, frames, two, passes, ra, rb };
}

const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** Plate B's share of a two-way pair's frame at k. */
const shareB = (k) => smooth((k - DISSOLVE.lo) / (DISSOLVE.hi - DISSOLVE.lo));

async function shoot() {
  const browser = await chromium.launch({ channel: "chrome", headless });
  for (const aspect of aspects) {
    const G = GEOM[aspect];
    for (const [a, b] of wantedPairs) {
      const P = planOf(a, b, aspect);
      const dir = `${ROOT}/raw/${pairName(a, b)}-${aspect}`;
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const t0 = Date.now();
      const rec = { pair: pairName(a, b), aspect, fps: FPS, n: P.n, ms: P.ms, two: P.two, dissolve: P.two ? DISSOLVE : null, A: deepCam(P.ra), B: deepCam(P.rb), cfg: P.passes.map((p) => cfgOf(p.rec)), frames: P.frames.map((f) => ({ i: f.i, k: f.k, cam: f.cam })) };
      for (let pi = 0; pi < P.passes.length; pi++) {
        const pass = P.passes[pi];
        const deep = !!pass.rec.deep;
        const g = deep ? G.deep : G.plain;
        const ctx = await browser.newContext({ viewport: g.vp, deviceScaleFactor: g.dpr, isMobile: G.mobile, hasTouch: G.mobile });
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send("Network.enable");
        await cdp.send("Network.setBlockedURLs", { urls: ["*/api/media/*", "*/api/lead*"] });
        await page.addInitScript(() => {
          const css = document.createElement("style");
          css.textContent = "html{overflow:hidden!important}body *{visibility:hidden!important}[data-ml-ground],[data-ml-map],[data-ml-map] *{visibility:visible!important}[data-g3d-lights],[data-g3d-shades],[data-g3d-cover]{display:none!important}";
          document.addEventListener("DOMContentLoaded", () => document.head.append(css));
        });
        // The page pinned on this pass's plate exactly as make-plates.mjs drew it: the deep render in
        // the plate style, the plain one in the live style (round 58's), its centre's height held.
        const q = new URLSearchParams({ ground: "ml", plate: pass.shot, cover: "0", homes: "0", slow: "0", pr: String(g.dpr), elev: String(pass.rec.cam.elevation), ...(deep ? { deep: "1" } : { pstyle: "0" }) });
        await page.goto(`${base}/?${q}`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => {
          const s = window.__ml?.stats();
          return !!s && (s.error || (s.firstIdleAt != null && !s.flying));
        }, null, { timeout: 90000 });
        await page.waitForTimeout(1800);
        const box = await page.evaluate(() => {
          const r = document.querySelector("[data-ml-map]").getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        });
        if (box.width !== g.vp.width || box.height !== g.vp.height) throw new Error(`${rec.pair}/${aspect}: the map's box is ${box.width} x ${box.height}`);
        const zoomShift = deep ? 0 : -1;
        const tag = deep ? "deep" : "plain";
        const cfgDir = `${dir}/${pi}`;
        fs.mkdirSync(cfgDir, { recursive: true });
        // The matrices of EVERY frame from this pass (instant: a jump computes the transform; the
        // tiles do not matter to it), then the pictures of the frames this pass draws.
        const mats = await page.evaluate(
          ({ cams, zoomShift }) => {
            const c = window.__ml.ctl, m = c.map;
            const out = [];
            for (const x of cams) {
              m.jumpTo({ center: [x.lng, x.lat], zoom: x.zoom + zoomShift, pitch: x.pitch, bearing: x.bearing, elevation: x.elevation });
              const f = c.liveFrame();
              const t = m.transform ?? m._camera?.transform;
              out.push({ ws: f.ws, m: Array.from(f.m), elev: t.elevation, zoom: m.getZoom() });
            }
            return out;
          },
          { cams: P.frames.map((f) => f.cam), zoomShift },
        );
        mats.forEach((x, i) => {
          if (Math.abs(x.elev - P.frames[i].cam.elevation) > 1e-6) throw new Error(`${rec.pair}/${aspect} frame ${i}: the centre stands at ${x.elev}, not ${P.frames[i].cam.elevation}`);
          if (Math.abs(x.zoom - (P.frames[i].cam.zoom + zoomShift)) > 1e-9) throw new Error(`${rec.pair}/${aspect} frame ${i}: zoom ${x.zoom}`);
          rec.frames[i][tag] = { ws: x.ws, m: x.m };
        });
        const todo = P.frames.filter((f) => f.k >= pass.from - 1e-9 && f.k <= pass.to + 1e-9 && (!P.two || (pi === 0 ? shareB(f.k) < 1 : shareB(f.k) > 0) || f.i === 0 || f.i === P.n));
        for (const f of todo) {
          const cam = f.cam;
          const slow = await page.evaluate(async ({ cam, zoomShift }) => {
            const m = window.__ml.ctl.map;
            const t0 = performance.now();
            const idle = () => new Promise((r) => m.once("idle", r));
            const wait = idle();
            m.jumpTo({ center: [cam.lng, cam.lat], zoom: cam.zoom + zoomShift, pitch: cam.pitch, bearing: cam.bearing, elevation: cam.elevation });
            m.triggerRepaint();
            await wait;
            // A tile (a terrain PNG most often) can land after the first idle and re-shade: settle
            // until 250 ms pass with no new render.
            for (let tries = 0; tries < 20; tries++) {
              let renders = 0;
              const on = () => renders++;
              m.on("render", on);
              await new Promise((r) => setTimeout(r, 250));
              m.off("render", on);
              if (!renders && m.areTilesLoaded()) break;
              await (m.isMoving() || !m.areTilesLoaded() || renders ? idle() : Promise.resolve());
            }
            return Math.round(performance.now() - t0);
          }, { cam, zoomShift });
          const png = await page.screenshot({ clip: box, type: "png" });
          fs.writeFileSync(`${cfgDir}/f${String(f.i).padStart(4, "0")}.png`, png);
          rec.frames[f.i].shotMs = (rec.frames[f.i].shotMs ?? 0) + slow;
        }
        await ctx.close();
        console.log(`${rec.pair.padEnd(34)} ${aspect} pass ${pi} (${cfgOf(pass.rec)}, pinned ${pass.shot}): ${todo.length} frames`);
      }
      fs.writeFileSync(`${dir}/frames.json`, JSON.stringify(rec));
      console.log(`${rec.pair.padEnd(34)} ${aspect} n ${P.n} (${P.ms} ms)${P.two ? " two renders" : ""}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
  }
  await browser.close();
}

/** The LUT of a grade (make-plates.mjs graded(): out = 255 * (in / 255) ^ curve * gain). */
function lutOf(curve, gain) {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) lut[i] = Math.max(0, Math.min(255, Math.round(255 * Math.pow(i / 255, curve) * gain)));
  return lut;
}

/** THE MOTION BLUR: a frame is blurred by how far the picture moves at it (a gaussian, sigma in
 * device pixels = BLUR x the motion per frame, at most BLUR_MAX), as a camera's shutter would smear
 * it. Mid-flight the ground moves 150 to 300 device pixels a frame: no hairline is readable there,
 * and a sharp one costs the encode its bytes (measured on the spike, the record §3). The ends move
 * a few pixels a frame and stay sharp. */
const BLUR = Number(flag("blur", "0.01"));
const BLUR_MAX = Number(flag("blurmax", "2.5"));
const mxOf = (lng) => (180 + lng) / 360;
const myOf = (lat) => (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))) / 360;
/** How far the picture moves between two cameras, device px: the centre's travel at the later zoom,
 * the zoom's push at half the half-diagonal, the turn at the same radius. */
function motionPx(a, b, G) {
  const dpr = G.px.w / G.deep.vp.width;
  const ws = 512 * 2 ** b.zoom * dpr;
  const R = Math.hypot(G.px.w, G.px.h) / 2;
  const d = Math.hypot((mxOf(b.lng) - mxOf(a.lng)) * ws, (myOf(b.lat) - myOf(a.lat)) * ws);
  return d + 0.5 * R * Math.abs(2 ** (b.zoom - a.zoom) - 1) + ((Math.abs(b.bearing - a.bearing) * Math.PI) / 180) * 0.5 * R;
}
const sigmaAt = (frames, i, G) => {
  const f = frames;
  const v = ((i > 0 ? motionPx(f[i - 1].cam, f[i].cam, G) : 0) + (i < f.length - 1 ? motionPx(f[i].cam, f[i + 1].cam, G) : 0)) / (i > 0 && i < f.length - 1 ? 2 : 1);
  return Math.min(BLUR_MAX, BLUR * v);
};

const rawRgb = async (file) => {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

async function grade() {
  for (const aspect of aspects) {
    const G = GEOM[aspect];
    for (const [a, b] of wantedPairs) {
      const name = `${pairName(a, b)}-${aspect}`;
      const dir = `${ROOT}/raw/${name}`;
      const rec = JSON.parse(fs.readFileSync(`${dir}/frames.json`, "utf8"));
      const ga = GRADE[a] ?? {}, gb = GRADE[b] ?? {};
      fs.mkdirSync(`${ROOT}/master`, { recursive: true });
      fs.mkdirSync(`${ROOT}/ends`, { recursive: true });
      const master = `${ROOT}/master/${name}.mkv`;
      const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${G.px.w}x${G.px.h}`, "-r", String(rec.fps), "-i", "-", "-c:v", "ffv1", "-level", "3", "-g", "1", master], { stdio: ["pipe", "inherit", "inherit"] });
      const done = new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error(`ffmpeg ${c}`)))));
      const f = (pi, i) => `${dir}/${pi}/f${String(i).padStart(4, "0")}.png`;
      for (const fr of rec.frames) {
        const k = fr.k;
        const wB = rec.two ? shareB(k) : 0;
        let px;
        if (!rec.two || wB === 0) px = await rawRgb(f(0, fr.i));
        else if (wB === 1) px = await rawRgb(f(1, fr.i));
        else {
          const [p0, p1] = await Promise.all([rawRgb(f(0, fr.i)), rawRgb(f(1, fr.i))]);
          const out = Buffer.alloc(p0.data.length);
          for (let j = 0; j < out.length; j++) out[j] = Math.round(p0.data[j] * (1 - wB) + p1.data[j] * wB);
          px = { data: out, w: p0.w, h: p0.h };
        }
        if (px.w !== G.px.w || px.h !== G.px.h) throw new Error(`${name} frame ${fr.i}: ${px.w} x ${px.h}`);
        // The grade, interpolated by k from plate A's to plate B's (at the ends, exactly the plates').
        const curve = (ga.curve ?? 1) + ((gb.curve ?? 1) - (ga.curve ?? 1)) * k;
        const gain = (ga.gain ?? 1) + ((gb.gain ?? 1) - (ga.gain ?? 1)) * k;
        if (curve !== 1 || gain !== 1) {
          const lut = lutOf(curve, gain);
          for (let j = 0; j < px.data.length; j++) px.data[j] = lut[px.data[j]];
        }
        const sigma = fr.i === 0 || fr.i === rec.n ? 0 : sigmaAt(rec.frames, fr.i, G);
        if (sigma >= 0.3) px.data = await sharp(px.data, { raw: { width: px.w, height: px.h, channels: 3 } }).blur(sigma).raw().toBuffer();
        fr.sigma = Math.round(sigma * 100) / 100;
        if (fr.i === 0 || fr.i === rec.n) await sharp(px.data, { raw: { width: px.w, height: px.h, channels: 3 } }).png().toFile(`${ROOT}/ends/${name}-${fr.i === 0 ? "first" : "last"}.png`);
        if (!ff.stdin.write(px.data)) await new Promise((r) => ff.stdin.once("drain", r));
      }
      ff.stdin.end();
      await done;
      // The joins against the plates' own raw pictures, graded as the plates were.
      for (const [end, shot, g] of [["first", a, ga], ["last", b, gb]]) {
        const plate = await rawRgb(`${PLATE_RAW}/${shot}-${aspect}.png`);
        const mine = await rawRgb(`${ROOT}/ends/${name}-${end}.png`);
        const lut = lutOf(g.curve ?? 1, g.gain ?? 1);
        let sum = 0, big = 0;
        const n = plate.data.length / 3;
        for (let j = 0; j < plate.data.length; j += 3) {
          let d = 0;
          for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(lut[plate.data[j + c]] - mine.data[j + c]));
          sum += d;
          if (d > 16) big++;
        }
        console.log(`${name.padEnd(40)} ${end} frame vs plate ${shot}: mean ${(sum / n).toFixed(2)} levels, over 16: ${((100 * big) / n).toFixed(2)}%`);
      }
      if (!keep) for (const pi of fs.readdirSync(dir).filter((x) => /^\d$/.test(x))) for (const png of fs.readdirSync(`${dir}/${pi}`)) if (!/f0000|f00[1-9]0/.test(png)) fs.rmSync(`${dir}/${pi}/${png}`);
      console.log(`${name.padEnd(40)} master ${(fs.statSync(master).size / 1048576).toFixed(0)} MB, ${rec.frames.length} frames, blur sigma ${rec.frames.map((x) => x.sigma).join(" ")}`);
    }
  }
}

const ffmpeg = (args) => {
  const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
};
/** Video is limited range (16 to 235) in BT.709, tagged as such (the browsers read the tags; an
 * untagged clip is guessed differently by each). */
const TAGS = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"];
const vf = (w, h, G, reverse) => [reverse ? "reverse" : null, w !== G.px.w ? `scale=${w}:${h}:flags=lanczos` : null, "scale=out_color_matrix=bt709:out_range=tv", "format=yuv420p"].filter(Boolean).join(",");

function encodeOne(master, out, codec, w, h, G, reverse, crf, n) {
  // A key frame at each end: the two frames the plates meet are the clip's sharpest (the joins).
  const keys = ["-force_key_frames", `expr:eq(n,0)+eq(n,${n})`];
  if (codec === "vp9") ffmpeg(["-i", master, "-vf", vf(w, h, G, reverse), ...keys, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf), "-row-mt", "1", "-deadline", "good", "-cpu-used", "1", "-g", "600", "-an", ...TAGS, out]);
  else ffmpeg(["-i", master, "-vf", vf(w, h, G, reverse), ...keys, "-c:v", "libx264", "-crf", String(crf), "-preset", "slow", "-profile:v", "high", "-an", "-movflags", "+faststart", ...TAGS, out]);
  return fs.statSync(out).size;
}

async function encode() {
  fs.mkdirSync(OUT, { recursive: true });
  const table = [];
  for (const aspect of aspects) {
    const G = GEOM[aspect];
    for (const [a, b] of wantedPairs) {
      const name = `${pairName(a, b)}-${aspect}`;
      const rec = JSON.parse(fs.readFileSync(`${ROOT}/raw/${name}/frames.json`, "utf8"));
      const master = `${ROOT}/master/${name}.mkv`;
      for (const [from, to, reverse] of [[a, b, false], [b, a, true]]) {
        for (const codec of ["vp9", "h264"]) {
          for (const w of ENC[aspect][codec]) {
            const h = Math.round((w * G.px.h) / G.px.w);
            const ext = codec === "vp9" ? "webm" : "mp4";
            const out = `${OUT}/${from}--${to}-${aspect}-${w}.${ext}`;
            let crf = CRF[aspect][codec];
            let size = encodeOne(master, out, codec, w, h, G, reverse, crf, rec.n);
            while (size > CAP && crf < CRF_MAX[codec]) {
              crf += 2;
              size = encodeOne(master, out, codec, w, h, G, reverse, crf, rec.n);
            }
            table.push({ clip: `${from}--${to}-${aspect}-${w}.${ext}`, kb: Math.round(size / 1024), crf });
            console.log(`${`${from}--${to}-${aspect}-${w}.${ext}`.padEnd(48)} ${String(Math.round(size / 1024)).padStart(5)} KB  crf ${crf}`);
          }
        }
      }
      // The frames' cameras and matrices (the deep geometry's), read backwards for the back clip.
      const data = { fps: rec.fps, n: rec.n, frames: rec.frames.map((f) => ({ cam: roundCam(f.cam), ws: f.deep.ws, m: f.deep.m.map((v) => Number(v.toPrecision(15))) })) };
      fs.writeFileSync(`${OUT}/${pairName(a, b)}-${aspect}.json`, JSON.stringify(data));
    }
  }
  fs.mkdirSync(`${ROOT}/tables`, { recursive: true });
  fs.writeFileSync(`${ROOT}/tables/encode-${aspectOnly || "all"}-${Date.now()}.json`, JSON.stringify(table, null, 1));
  writeManifest();
}

const roundCam = (c) => ({ lng: Math.round(c.lng * 1e9) / 1e9, lat: Math.round(c.lat * 1e9) / 1e9, zoom: Math.round(c.zoom * 1e9) / 1e9, pitch: Math.round(c.pitch * 1e9) / 1e9, bearing: Math.round(c.bearing * 1e9) / 1e9, elevation: Math.round(c.elevation * 1e6) / 1e6 });

/** The manifest: every pair recorded, both aspects (a pair missing an aspect is left out whole, so
 * the page never plays half a ladder). */
function writeManifest() {
  const lines = ["// GENERATED by scripts/make-flights.mjs (round 59). Do not edit: re-run the script.", "// Each recorded flight between two adjacent plates: its rate, its frames (n + 1, frame 0 plate A's", "// camera, frame n plate B's), its length, the css geometry its matrices are in (the deep render's,", "// k = 2), and the pixel widths its clips are served at. The matrices themselves are in", "// public/flights/<a>--<b>-<aspect>.json, fetched with the clip (components/home/plates/plate-frame.ts).", 'import type { FilmManifest } from "./plate-frame";', "", "export const FLIGHTS: FilmManifest = {"];
  for (const [a, b] of PAIRS) {
    const per = {};
    for (const aspect of Object.keys(GEOM)) {
      const f = `${ROOT}/raw/${pairName(a, b)}-${aspect}/frames.json`;
      const G = GEOM[aspect];
      const files = [...ENC[aspect].vp9.map((w) => [w, "webm"]), ...ENC[aspect].h264.map((w) => [w, "mp4"])];
      const ok = fs.existsSync(f) && fs.existsSync(`${OUT}/${pairName(a, b)}-${aspect}.json`) && files.every(([w, e]) => fs.existsSync(`${OUT}/${a}--${b}-${aspect}-${w}.${e}`) && fs.existsSync(`${OUT}/${b}--${a}-${aspect}-${w}.${e}`));
      if (!ok) continue;
      const rec = JSON.parse(fs.readFileSync(f, "utf8"));
      per[aspect] = `{ fps: ${rec.fps}, n: ${rec.n}, ms: ${rec.ms}, w: ${G.deep.vp.width}, h: ${G.deep.vp.height}, k: 2, webm: [${ENC[aspect].vp9.join(", ")}], mp4: [${ENC[aspect].h264.join(", ")}] }`;
    }
    if (!per.wide || !per.tall) continue;
    lines.push(`  "${pairName(a, b)}": {`, `    wide: ${per.wide},`, `    tall: ${per.tall},`, "  },");
  }
  lines.push("};", "");
  fs.writeFileSync(GEN, lines.join("\n"));
  console.log(`wrote ${GEN}`);
}

if (stage === "shoot" || stage === "all") await shoot();
if (stage === "grade" || stage === "all") await grade();
if (stage === "encode" || stage === "all") await encode();
