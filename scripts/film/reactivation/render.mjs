// Renders the reactivation film's OVERLAY as a transparent lossless PNG sequence.
//
// `omitBackground: true` is the whole point: the stage has no background, so each PNG carries
// alpha and assemble.mjs lays it over the b-roll cut that bg.mjs built. Nothing here decodes
// video, so nothing here can screenshot a stale frame.
//
// Headless is fine: no WebGL, no /ai galaxy, so no real GPU is needed.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/reactivation/render.mjs [--probe 0,7.5,14,21,29,36,42]
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import fs from "node:fs";
import path from "node:path";

const FPS = 30;
const LEN = 48.6; // last word ends at 47.08; the tail is the hold before the fade
const OUT = "scripts/_scratch-video/reactivation-frames";
const STAGE = "scripts/film/reactivation/stage.html";

const probeArg = process.argv.indexOf("--probe");
const probes = probeArg > -1 ? process.argv[probeArg + 1].split(",").map(Number) : null;

fs.mkdirSync(OUT, { recursive: true });
const file = "file:///" + path.resolve(STAGE).split(path.sep).join("/");

const browser = await chromium.launch({ args: ["--hide-scrollbars", "--force-device-scale-factor=1"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(file, { waitUntil: "load", timeout: 60000 });
await page.evaluate(() => window.__ready);
await page.waitForTimeout(500);

// Which font actually rendered. A Google Fonts fetch can fail behind the local TLS interception
// and silently fall back to Arial, which does not look like the site.
const font = await page.evaluate(() => ({
  family: getComputedStyle(document.querySelector(".hook .u")).fontFamily,
  lato: document.fonts.check("300 30px Lato"),
}));
console.log(`font: ${font.family} | Lato loaded: ${font.lato}`);
if (!font.lato) console.warn("WARNING: Lato did not load. The film will not look like the site.");

if (probes) {
  // A probe of a transparent overlay ON ITS OWN proves nothing: the question is always whether
  // the scrim gives the type enough contrast over the FOOTAGE. So each probe is composited over
  // the real background frame at the same timestamp, which is the frame the film will show.
  const dir = "scripts/_scratch-video/reactivation-probe";
  const BG = "scripts/_scratch-video/reactivation-bg/bg.mp4";
  fs.mkdirSync(dir, { recursive: true });
  for (const t of probes) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.screenshot({ path: `${dir}/_ov${t}.png`, omitBackground: true });
    if (fs.existsSync(BG)) {
      const r = spawnSync(ffmpegPath, ["-ss", String(t), "-i", BG, "-i", `${dir}/_ov${t}.png`,
        "-filter_complex", "[0:v]trim=end_frame=1,setpts=PTS-STARTPTS[b];[b][1:v]overlay=0:0",
        "-frames:v", "1", "-y", `${dir}/t${t}.png`], { encoding: "utf8", maxBuffer: 32e6 });
      if (r.status !== 0) console.error((r.stderr || "").slice(-600));
    }
    console.log(`  probe t=${t}`);
  }
} else {
  let wrote = 0;
  for (let n = 0; n < Math.round(LEN * FPS); n++) {
    const t = n / FPS;
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.screenshot({ path: `${OUT}/f${String(n).padStart(5, "0")}.png`, type: "png", omitBackground: true });
    wrote++;
    if (wrote % 180 === 0) console.log(`  ${wrote} frames (t=${t.toFixed(2)}s)`);
  }
  console.log(`overlay: ${wrote} transparent frames in ${OUT}`);
}
await ctx.close();
await browser.close();
