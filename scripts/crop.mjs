/* Crop specific regions of a page at full resolution, so a real human eye (or mine) can
 * judge type, spacing, and contrast instead of squinting at a 400px-wide full-page shot.
 * Usage: node scripts/crop.mjs <url> <outPrefix> <width> [selector ...] */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [url, prefix, widthArg, ...selectors] = process.argv.slice(2);
const width = Number(widthArg) || 1440;

await mkdir("docs/services", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 1000 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  await new Promise((r) => setTimeout(r, 400));
});

for (const [i, sel] of selectors.entries()) {
  const el = page.locator(sel).first();
  await el.screenshot({ path: `docs/services/${prefix}-${i}.png` });
  console.log(`docs/services/${prefix}-${i}.png  <- ${sel}`);
}

await browser.close();
