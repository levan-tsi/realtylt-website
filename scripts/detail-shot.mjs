/* Viewport close-ups centered on given anchors (or pixel offsets) of a blog article.
 * Usage: node scripts/detail-shot.mjs <baseUrl> <path> <width> <prefix> <anchorOrY...> */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [, , BASE = "http://localhost:3002", PATH = "/blog/workflow-automation-real-estate-business", W = "1440", PREFIX = "d", ...targets] = process.argv;
const OUT = "docs/blog-redesign/probe";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(W), height: 860 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}${PATH}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);

for (const t of targets) {
  if (/^\d+$/.test(t)) {
    await page.evaluate((y) => window.scrollTo(0, Number(y)), t);
  } else {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120);
    }, t);
  }
  await page.waitForTimeout(500);
  const name = t.slice(0, 24).replace(/[^a-z0-9]/gi, "-");
  await page.screenshot({ path: `${OUT}/${PREFIX}-${name}.png` });
  console.log(`shot ${PREFIX}-${name}`);
}
await browser.close();
