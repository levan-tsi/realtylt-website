/* Focus-ring audit. Tabs through the page with a REAL keyboard (programmatic .focus()
 * does not match :focus-visible, so getComputedStyle would report Chrome's default ring
 * and lie to you), then measures each ring's contrast against the surface it sits on.
 * WCAG 1.4.11 floor for a non-text focus indicator is 3:1.
 * Usage: node scripts/focus.mjs <baseUrl> */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3111";
const PAGES = [
  "/services",
  "/services/ai-chat-assistant",
  "/services/ai-voice-agents",
  "/services/skip-tracing-lead-generation",
];
const MAX_TABS = 70;

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
    // Button carries `transition-all`, and outline-color/width are animatable — measuring
    // immediately reads frame 0 of the transition (currentColor at `medium` width), not
    // the ring the user sees. Let it settle past the 200ms duration first.
    await page.waitForTimeout(280);
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
      // The ring sits OUTSIDE the element (outline-offset), so the surface it must be
      // seen against is the nearest opaque ancestor background, not the element's own.
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
      const label = (el.textContent || el.placeholder || el.tagName).trim().slice(0, 30);
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
