// Scratch (gitignored) — render the VOICE film stage as a LOSSLESS PNG SEQUENCE.
//
// Why not record video: Playwright's recordVideo is a fixed low-bitrate VP8 encoder (the first
// film came out at 881 kb/s) and type is exactly what that destroys. Seeking a frozen timeline
// and screenshotting gives a perfect frame every time, at the final resolution, with the frame
// interval decided by the cut rather than by whatever the page managed to paint.
//
// This one runs HEADLESS, unlike the chat film's flight pass. There is no WebGL here: the whole
// cut is the stage, so there is no /ai galaxy that needs a real GPU to draw.
//
//   export NODE_OPTIONS='--use-system-ca'
//   node scripts/film/voice/render.mjs [--probe 0,7.5,13,20,34,40]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const FPS = 30;
const LEN = 60.0; // last word ends at 58.83; the tail is the hold before the fade (beat E added 2026-07-31)
const OUT = "scripts/_scratch-video/voice-frames";
const STAGE = "scripts/film/voice/stage.html";

const probeArg = process.argv.indexOf("--probe");
const probes = probeArg > -1 ? process.argv[probeArg + 1].split(",").map(Number) : null;

fs.mkdirSync(OUT, { recursive: true });
const file = "file:///" + path.resolve(STAGE).split(path.sep).join("/");

const browser = await chromium.launch({ args: ["--hide-scrollbars", "--force-device-scale-factor=1"] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(file, { waitUntil: "load", timeout: 60000 });
await page.evaluate(() => window.__ready);
await page.waitForTimeout(500);

// Which font actually rendered. A Google Fonts fetch can fail behind the local TLS interception
// and silently fall back to Arial, which does not look like the site.
const font = await page.evaluate(() => {
  const el = document.querySelector(".stat .u");
  return { family: getComputedStyle(el).fontFamily, lato: document.fonts.check("300 44px Lato") };
});
console.log(`font: ${font.family} | Lato loaded: ${font.lato}`);

if (probes) {
  fs.mkdirSync("scripts/_scratch-video/voice-probe", { recursive: true });
  for (const t of probes) {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.screenshot({ path: `scripts/_scratch-video/voice-probe/t${t}.png` });
    console.log(`  probe t=${t}`);
  }
} else {
  let wrote = 0;
  for (let n = 0; n < Math.round(LEN * FPS); n++) {
    const t = n / FPS;
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.screenshot({ path: `${OUT}/f${String(n).padStart(5, "0")}.png`, type: "png" });
    wrote++;
    if (wrote % 150 === 0) console.log(`  ${wrote} frames (t=${t.toFixed(2)}s)`);
  }
  console.log(`stage: ${wrote} frames in ${OUT}`);
}
await ctx.close();
await browser.close();
