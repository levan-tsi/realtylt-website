/* Contrast audit: walks every text node on a page, resolves its computed colour against
 * the first non-transparent ancestor background, and reports anything under the WCAG AA
 * floor (4.5:1 for body, 3:1 for large text >=24px or >=18.66px bold).
 * Usage: node scripts/contrast.mjs <baseUrl> */

import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3111";
const PAGES = [
  "/services",
  "/services/ai-chat-assistant",
  "/services/ai-voice-agents",
  "/services/skip-tracing-lead-generation",
  "/services/workflow-automation",
  "/blog/ai-chat-assistant-real-estate-website",
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
let fails = 0;

for (const path of PAGES) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  });

  const bad = await page.evaluate(() => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
    };
    const over = (fg, bg) => {
      // composite fg (with alpha) onto an opaque bg
      const a = fg[3];
      return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
    };
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

    const bgOf = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c[3] > 0) {
          if (c[3] === 1) return [c[0], c[1], c[2]];
          const under = bgOf(n.parentElement);
          return over(c, under);
        }
        n = n.parentElement;
      }
      return [255, 255, 255];
    };

    const out = [];
    const main = document.querySelector("main") || document.body;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;

      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = bgOf(el);
      const composited = fg[3] < 1 ? over(fg, bg) : [fg[0], fg[1], fg[2]];
      const c = ratio(composited, bg);

      const size = parseFloat(cs.fontSize);
      const weight = Number(cs.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const floor = large ? 3 : 4.5;

      if (c < floor) {
        out.push({
          text: text.slice(0, 44),
          ratio: Math.round(c * 100) / 100,
          floor,
          size,
          cls: (el.className || "").toString().slice(0, 50),
        });
      }
    }
    return out;
  });

  if (bad.length) {
    fails += bad.length;
    console.log(`FAIL ${path}`);
    for (const b of bad) console.log(`   ${b.ratio}:1 (need ${b.floor}) ${b.size}px "${b.text}"  .${b.cls}`);
  } else {
    console.log(`ok   ${path}`);
  }
}

await browser.close();
console.log(fails === 0 ? "\nCONTRAST CLEAN" : `\n${fails} contrast failure(s)`);
process.exit(fails === 0 ? 0 : 1);
