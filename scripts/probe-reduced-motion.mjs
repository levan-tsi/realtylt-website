/* Reduced-motion check: the article must degrade to a clean static read — every section
 * visible, no reveal armed, hero visible. Usage: node scripts/probe-reduced-motion.mjs [baseUrl] [path] */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3002";
const PATH = process.argv[3] || "/blog/workflow-automation-real-estate-business";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
await page.goto(`${BASE}${PATH}`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const res = await page.evaluate(() => {
  const secs = [...document.querySelectorAll(".prose-custom section")];
  const hidden = secs.filter((s) => parseFloat(getComputedStyle(s).opacity) < 0.99).length;
  const willReveal = document.querySelectorAll(".prose-custom .will-reveal").length;
  const h1 = document.querySelector("h1");
  return {
    sections: secs.length,
    hidden,
    willReveal,
    h1Opacity: h1 ? getComputedStyle(h1).opacity : "none",
  };
});

console.log("reduced-motion:", JSON.stringify(res));
console.log(
  res.hidden === 0 && res.willReveal === 0 && res.h1Opacity === "1"
    ? "PASS: static read, nothing hidden, no reveal armed"
    : "FAIL: content hidden under reduced motion",
);
await browser.close();
