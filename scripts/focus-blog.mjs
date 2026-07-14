/* Focus-ring audit for the /blog surface (same method as scripts/focus.mjs — real Tab key,
 * settle past the transition, measure ring contrast vs the surface behind it, 3:1 floor).
 * Usage: node scripts/focus-blog.mjs <baseUrl> */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3002";
const PAGES = [
  "/blog",
  "/blog/workflow-automation-real-estate-business",
  "/blog/ai-chat-assistant-real-estate-website",
];
const MAX_TABS = 90;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
let fails = 0;

for (const path of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.body.focus());

  const bad = [];
  const seen = new Set();

  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(240);
    const info = await page.evaluate(() => {
      const parse = (c) => {
        const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
        return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
      };
      const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
      const lum = ([r, g, b]) => {
        const f = (v) => {
          const s = v / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const ratio = (a, b) => {
        const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (l1 + 0.05) / (l2 + 0.05);
      };

      const el = document.activeElement;
      if (!el || el === document.body) return null;
      if (el.closest("header, footer")) return { skip: true };

      const cs = getComputedStyle(el);
      let n = el.parentElement;
      let surface = [255, 255, 255];
      while (n) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c[3] === 1) {
          surface = [c[0], c[1], c[2]];
          break;
        }
        n = n.parentElement;
      }

      const oc = parse(cs.outlineColor);
      const width = parseFloat(cs.outlineWidth) || 0;
      const label = (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 34);
      if (!oc || width === 0 || cs.outlineStyle === "none") {
        return { label, ratio: 0, width, note: "NO RING" };
      }
      const ring = oc[3] < 1 ? over(oc, surface) : [oc[0], oc[1], oc[2]];
      return { label, ratio: Math.round(ratio(ring, surface) * 100) / 100, width };
    });

    if (!info) break;
    if (info.skip) continue;
    const key = `${info.label}|${info.ratio}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (info.ratio < 3) bad.push(info);
  }

  if (bad.length) {
    fails += bad.length;
    console.log(`FAIL ${path}`);
    for (const b of bad) console.log(`   ${b.ratio}:1 (need 3) ${b.note || ""} "${b.label}"`);
  } else {
    console.log(`ok   ${path}  (${seen.size} focusable checked)`);
  }
}

await browser.close();
console.log(fails === 0 ? "\nFOCUS RINGS CLEAN" : `\n${fails} focus failure(s)`);
process.exit(fails === 0 ? 0 : 1);
