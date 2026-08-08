/* Reduced-motion check: the article must degrade to a clean static read — every section
 * visible, no reveal armed, hero visible. Usage: node scripts/probe-reduced-motion.mjs [baseUrl] [path] */

import { chromium } from "playwright";

// BASE from the environment as well as argv: every other probe in this directory takes
// `BASE=…`, and this one silently ignored it and went to a hardcoded localhost:3002 instead —
// so a run aimed at production either measured whatever happened to be on that port or died
// with ECONNREFUSED, depending on the day.
const BASE = process.argv[2] || process.env.BASE || "http://localhost:3100";
const PATH = process.argv[3] || process.env.PATHNAME || "/blog/workflow-automation-real-estate-business";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
await page.goto(`${BASE}${PATH}`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const res = await page.evaluate(() => {
  // `.prose-custom section` matched 15 sections when this probe was written and matches ZERO
  // now: the article's sections are no longer nested inside .prose-custom (which still exists,
  // 9 of them, which is why nothing looked broken). The probe kept reporting PASS on an empty
  // set. Anchored to `article section` instead, which is the structure the page actually has.
  const secs = [...document.querySelectorAll("article section")];
  const hidden = secs.filter((s) => parseFloat(getComputedStyle(s).opacity) < 0.99).length;
  const willReveal = document.querySelectorAll("article .will-reveal").length;
  const h1 = document.querySelector("h1");
  return {
    sections: secs.length,
    hidden,
    willReveal,
    h1Opacity: h1 ? getComputedStyle(h1).opacity : "none",
  };
});

console.log("reduced-motion:", JSON.stringify(res));
// `sections: 0` used to PASS: with nothing found, "none of them are hidden" and "none of them
// arm a reveal" are both vacuously true, so the gate reported green while measuring nothing at
// all. A run that finds no sections has produced no evidence, which is a failure of the check
// and not a pass for the page.
const measured = res.sections > 0;
const ok = measured && res.hidden === 0 && res.willReveal === 0 && res.h1Opacity === "1";
console.log(
  !measured
    ? `FAIL: found 0 sections at ${BASE}${PATH} — nothing was measured, so this is not a pass`
    : ok
      ? "PASS: static read, nothing hidden, no reveal armed"
      : "FAIL: content hidden under reduced motion",
);
await browser.close();
process.exit(ok ? 0 : 1);
