// THE HOME PAGE'S FIRST SCREEN, BEFORE ANYTHING RUNS.
//
// The night flight is a WebGL scene (components/home/night/). Someone with JavaScript off, with
// WebGL unavailable, or simply on the first 300 ms of a cold visit must not meet a black
// rectangle where the territory should be, so the hero carries a still of the scene's own
// establishing shot as its CSS background and the canvas fades in over it.
//
// This script renders that still from the running site, so the poster is never a hand-made
// picture that drifts away from the scene: it is the scene, one frame, with the intro finished.
//
//   1. Start a server that serves /lab/night  (RLT_LAB=1):
//        dev:   RLT_LAB=1 npx next dev -p 3101
//        build: RLT_LAB=1 npx next build && RLT_LAB=1 npx next start -p 3102
//   2. node scripts/make-night-poster.mjs [--base=http://127.0.0.1:3101] [--out=public/images/home-night-poster.webp]
//      [--from=g3d|night]
//
// ROUND 57: the home page's ground is Google's 3D map, and the poster is its load cover, so by
// default (`--from=g3d`) the still is shot from the MAP's hero camera (components/home/g3d/
// cameras.ts at the poster's aspect), converted to a night framing by camera.ts cameraToFraming
// and handed to the lab as `?f=`: the dissolve from our still to the map keeps the composition.
// `--from=night` shoots the night flight's own hero, as before round 57. The TypeScript is read
// through jiti (installed with Tailwind), so no build step is needed.
//
// It writes ONE landscape still (1600x1000, ~55 KB of webp) that both the laptop and the phone
// crop from: the establishing shot puts the region across the middle of the frame, so a narrow
// crop of the centre still holds the whole shape of light.
//
// Safety: the lab page touches no lead route and no MLS Grid; the probe aborts /api/lead and
// /api/media anyway.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const flag = (k, d) => {
  const f = process.argv.find((a) => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};
const base = flag("base", process.env.BASE || "http://127.0.0.1:3101");
const out = flag("out", "public/images/home-night-poster.webp");
const W = Number(flag("width", 1600));
const H = Number(flag("height", 1000));
const from = flag("from", "g3d");
let framing = "";
if (from === "g3d") {
  const { createJiti } = await import("jiti");
  const jiti = createJiti(import.meta.url, { alias: { "@": process.cwd() } });
  const { cameraFor } = await jiti.import(path.resolve("components/home/g3d/cameras.ts"));
  const { cameraToFraming } = await jiti.import(path.resolve("components/home/g3d/camera.ts"));
  const cam = cameraFor("hero", W / H);
  const f = cameraToFraming(cam, cam.fov);
  framing = `&f=${[...f.pos, ...f.target, f.fov].map((x) => +x.toFixed(4)).join(",")}`;
  console.log("from the map's hero camera", JSON.stringify(cam), framing);
}

const browser = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.route(/api\/lead|api\/media\/|rlt-chat\.js|googletagmanager|google-analytics|_vercel\/insights|posthog/, (r) => r.abort());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));

let ready = false;
for (let attempt = 1; attempt <= 3 && !ready; attempt++) {
  await page.goto(`${base}/lab/night?shot=hero&still=1&ui=0${framing}`, { waitUntil: "load", timeout: 180_000 });
  ready = await page
    .waitForFunction(() => document.documentElement.dataset.nightReady === "1", null, { timeout: 120_000 })
    .then(() => true, () => false);
  if (!ready) console.log(`not ready (attempt ${attempt})`, errors.join(" | "));
}
if (!ready) {
  console.error("the scene never became ready; is the server up with RLT_LAB=1?");
  process.exit(1);
}
await page.addStyleTag({ content: "nextjs-portal,.rlt-bubble,[data-js-only]{display:none!important}" });
// THE POSTER IS THE SCENE WITH NOTHING ON IT. Every page that carries the scene tells it where its
// words sit (`data-quiet`) and the scene settles underneath them — including the site footer, which
// the lab route renders like any other page. Shot without clearing that, the still has the page's
// quiet zones baked in, and since round 54 takes the lights to a hundredth under a sentence the
// result came out a near-black picture (measured: frame mean 0.0011 against 0.0202 cleared).
await page.evaluate(() => (window.__night ? window.__night.setQuiet([]) : undefined));
await page.waitForTimeout(1200);
const png = await page.screenshot({ type: "png" });
await ctx.close();
await browser.close();

fs.mkdirSync(path.dirname(out), { recursive: true });
// Quality 72: the scene is soft light on black, where webp is very efficient; measured against
// 80 and 90, no visible difference at any crop and a third of the bytes.
const info = await sharp(png).webp({ quality: 72, effort: 6 }).toFile(out);
console.log(`${out}  ${W}x${H}  ${(info.size / 1024).toFixed(1)} KB`);
if (errors.length) console.log("page errors:", errors.join(" | "));
