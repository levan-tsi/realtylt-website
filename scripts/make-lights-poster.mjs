// Round 53: the no-JavaScript picture of the home hero's lights. Renders the live canvas
// (reduced motion = the finished frame, no shimmer offsets, no lantern) at 2x, crops it to the
// lit area and writes public/images/hero/lights-poster.webp. Re-run whenever the picture should
// catch up with the inventory; it is a picture of where the homes were on the day it was made.
// Usage (dev server running): node scripts/make-lights-poster.mjs [base]
import { chromium } from "playwright";
import fs from "node:fs";
import sharp from "sharp";
const base = process.argv[2] || "http://127.0.0.1:3101";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.route(/api\/media\/|api\/lead|googletagmanager|posthog|player\.vimeo/, (r) => r.abort());
await page.goto(base + "/", { waitUntil: "load" });
await page.waitForResponse((r) => r.url().includes("/api/lights"), { timeout: 60000 });
await page.waitForTimeout(1500);
const dataUrl = await page.evaluate(() => {
  const c = document.querySelector("section canvas");
  const g = c.getContext("2d");
  const { width: w, height: h } = c;
  const d = g.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const m = 8;
  x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w - 1, x1 + m); y1 = Math.min(h - 1, y1 + m);
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
  out.getContext("2d").drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
});
const png = Buffer.from(dataUrl.split(",")[1], "base64");
const file = "public/images/hero/lights-poster.webp";
// 760px wide is plenty for a picture only visitors without JavaScript ever load.
sharp.cache(false);
await sharp(png).resize({ width: 760 }).webp({ quality: 80, alphaQuality: 85, effort: 6 }).toFile(file);
const meta = await sharp(file).metadata();
console.log(file, meta.width + "x" + meta.height, fs.statSync(file).size, "bytes");
await browser.close();
