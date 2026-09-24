// THE HOME PAGE'S LOAD COVER, FROM THE MAPLIBRE NIGHT MAP ITSELF (round 57.13).
//
// Since round 57.13 the home page's ground is the MapLibre night map (components/home/ml/). Its load
// cover must be a frame of THAT map from its own opening camera, so the dissolve from the cover to
// the live map changes nothing (round 57.12's cover was drawn for Google's camera, and at 390 its city
// stood lower and larger than the map's). So this photographs the map as the page draws it: the
// running site's home page with `?cover=0` (no cover over it), everything but the map and our lights
// hidden, the territory's tiles all drawn (MapLibre's idle), the homes planned and drawn by the live
// light layer (the same plan, count, gap and glow), the elevation under them loaded, then the map's
// box screenshotted at the cover's pixel size:
//
//   wide: the laptop's css box, 1425 x 900 (1440 minus the scrollbar), at 1000 / 900 device pixels
//         per css pixel = 1583 x 1000; shown with `bg-cover` in that box it is scaled by exactly 0.9;
//   tall: the phone's 390 x 844 at 2x = 780 x 1688.
//
// What is in the picture: OpenStreetMap data in OpenMapTiles tiles from OpenFreeMap, the AWS terrain
// (USGS 3DEP, SRTM, GMTED2010, NOAA ETOPO1) as the moonlit relief, and our own listings as the lights.
// The same credits as the live map (components/site/SceneCredit.tsx, public/images/ATTRIBUTIONS.md).
//
//   node scripts/make-ml-cover.mjs [--base=http://127.0.0.1:3102] [--only=wide|tall] [--q=35] [--headless]
//
// The server must be running the production build with the MapLibre ground (the default). No MLS Grid
// call: `/api/media/` and `/api/lead` are blocked (the page's listing photos are not in the frame).
import fs from "node:fs";
import { chromium } from "playwright";
import sharp from "sharp";

const flag = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const base = flag("base", "http://127.0.0.1:3102");
const only = flag("only", "");
const quality = Number(flag("q", "35"));
const SHOTS = [
  { name: "wide", out: "public/images/home-night-cover.webp", vp: { width: 1440, height: 900 }, dpr: 1000 / 900, mobile: false },
  { name: "tall", out: "public/images/home-night-cover-tall.webp", vp: { width: 390, height: 844 }, dpr: 2, mobile: true },
].filter((s) => !only || s.name === only);

const browser = await chromium.launch({ channel: "chrome", headless: process.argv.includes("--headless") });
for (const s of SHOTS) {
  const ctx = await browser.newContext({ viewport: s.vp, deviceScaleFactor: s.dpr, isMobile: s.mobile, hasTouch: s.mobile });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setBlockedURLs", { urls: ["*/api/media/*", "*/api/lead*"] });
  // Only the map and our lights are seen: every other element hidden by visibility (which a child may
  // override), so nothing reflows and the map's box is the page's own.
  await page.addInitScript(() => {
    const css = document.createElement("style");
    css.textContent = "body *{visibility:hidden!important}[data-ml-ground],[data-ml-ground] *{visibility:visible!important}";
    document.addEventListener("DOMContentLoaded", () => document.head.append(css));
  });
  await page.goto(`${base}/?cover=0`, { waitUntil: "domcontentloaded" });
  // The territory drawn, the homes in, the elevation under them, and the plan's fade finished.
  await page.waitForFunction(() => {
    const s = window.__ml?.stats();
    return s && s.firstIdleAt != null && s.planned > 0 && s.drawn === s.planned && !s.flying;
  }, null, { timeout: 60000 });
  await page.waitForTimeout(2500);
  const st = await page.evaluate(() => {
    const s = window.__ml.stats();
    const r = document.querySelector("[data-ml-map]").getBoundingClientRect();
    return { box: { x: r.x, y: r.y, width: r.width, height: r.height }, drawn: s.drawn, zoom: s.zoom, slow: s.slow, error: s.error, scrollY };
  });
  if (st.error || st.slow?.by || st.scrollY !== 0) throw new Error(`not a clean frame: ${JSON.stringify(st)}`);
  const png = await page.screenshot({ clip: st.box, type: "png" });
  const img = sharp(png);
  const meta = await img.metadata();
  await img.webp({ quality, effort: 6, smartSubsample: true }).toFile(s.out);
  const kb = Math.round(fs.statSync(s.out).size / 102.4) / 10;
  console.log(`${s.name}: ${meta.width} x ${meta.height}, ${st.drawn} lights, zoom ${st.zoom} -> ${s.out} ${kb} KB (q${quality})`);
  if (process.argv.includes("--png")) fs.writeFileSync(s.out.replace(/\.webp$/, ".png"), png);
  await ctx.close();
}
await browser.close();
