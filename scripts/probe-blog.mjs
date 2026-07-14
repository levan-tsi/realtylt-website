/* Close-up probe of the article reading experience.
 * Captures viewport (not full-page) screenshots at key scroll offsets, and verifies the
 * scroll-spy active state changes as you scroll.
 * Usage: node scripts/probe-blog.mjs [baseUrl] [path] [width] [outPrefix] */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3001";
const PATH = process.argv[3] || "/blog/workflow-automation-real-estate-business";
const WIDTH = Number(process.argv[4] || 1440);
const PREFIX = process.argv[5] || "probe";
const OUT = "docs/blog-redesign/probe";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(`${BASE}${PATH}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);

const activeToc = () =>
  page.evaluate(() => {
    const a = document.querySelector('[data-toc] a[aria-current="location"]');
    return a ? a.textContent.trim() : null;
  });

const shot = async (name) => page.screenshot({ path: `${OUT}/${PREFIX}-${name}.png` });

// Hero
await shot("00-hero");

// Scroll continuously (small steps, like a reader) and record the ORDER of active
// sections. A correct scroll-spy lights each section in document order as you reach it.
const height = await page.evaluate(() => document.body.scrollHeight);
const sequence = [];
for (let y = 0; y <= height; y += 180) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(60);
  const a = await activeToc();
  if (a && sequence[sequence.length - 1] !== a) sequence.push(a);
}
await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.22)));
await page.waitForTimeout(300);
await shot("01-body");

console.log("scroll-spy active order (deduped):");
sequence.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
console.log(`distinct active sections while scrolling: ${new Set(sequence).size} of 6`);
console.log(errors.length ? `CONSOLE ERRORS: ${errors.slice(0, 3).join(" | ")}` : "no console errors");

await browser.close();
