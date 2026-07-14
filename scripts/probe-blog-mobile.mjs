/* Mobile (390) probe: hero, floating Contents pill, bottom-sheet open, and the jump.
 * Usage: node scripts/probe-blog-mobile.mjs [baseUrl] [path] */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3001";
const PATH = process.argv[3] || "/blog/workflow-automation-real-estate-business";
const OUT = "docs/blog-redesign/probe";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(`${BASE}${PATH}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);

const overflow = () =>
  page.evaluate(() => {
    const de = document.documentElement;
    return de.scrollWidth > de.clientWidth + 1 ? `${de.scrollWidth}>${de.clientWidth}` : "none";
  });

await page.screenshot({ path: `${OUT}/m-00-hero.png` });
console.log("hero overflow:", await overflow());

// Scroll into the body so the floating "On this page" pill is present.
await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.32)));
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/m-01-body-pill.png` });

const pill = await page.$("[data-toc-trigger]");
console.log("floating pill present:", !!pill);

if (pill) {
  await pill.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/m-02-sheet-open.png` });

  // Tap the 4th section; expect the sheet to close and the heading to be near the top.
  const links = await page.$$('[role="dialog"] a[href^="#"]');
  const targetHref = links.length ? await links[3].getAttribute("href") : null;
  if (links.length) await links[3].click();
  await page.waitForTimeout(700);
  const sheetGone = (await page.$('[role="dialog"]')) === null;
  const pos = targetHref
    ? await page.evaluate((h) => {
        const el = document.getElementById(h.slice(1));
        return el ? Math.round(el.getBoundingClientRect().top) : null;
      }, targetHref)
    : null;
  await page.screenshot({ path: `${OUT}/m-03-after-jump.png` });
  console.log(`sheet closed after tap: ${sheetGone}; target "${targetHref}" top=${pos}px (want ~0-160)`);
}

console.log("body overflow:", await overflow());
console.log(errors.length ? `CONSOLE ERRORS: ${errors.slice(0, 3).join(" | ")}` : "no console errors");
await browser.close();
