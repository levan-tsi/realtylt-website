// Build the "Why Work With Us?" carousel art (public/images/why/*.webp) from OUR OWN site.
//
// The live site's version of this carousel is the IDX vendor's stock product mockups — a
// Seattle search page, a seller dashboard we do not ship, "Your Agent / 555-1212" contacts.
// These are real screenshots of this app instead. Re-run with the dev server up on :3100
// whenever those surfaces change, so the homepage never advertises a UI we no longer ship:
//
//   node scripts/build-why-slides.mjs                  # capture + frame all five
//   node scripts/build-why-slides.mjs --frame-only     # re-frame the cached raw shots
//   node scripts/build-why-slides.mjs --only=our-search
//
// Two passes per slide:
//   1. Playwright screenshots the real page at deviceScaleFactor 2 (1440x900 -> 2880x1800).
//   2. That PNG is composited into a CSS-drawn laptop shell (our artwork, nothing borrowed)
//      and re-shot at deviceScaleFactor 2 on a transparent background -> 1600x1000.
//   3. sharp encodes WebP for /public/images/why/.
//
// The chat widget is blocked and the Next dev badge hidden so neither lands in marketing art.
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";

const TMP = "docs/why-carousel/_raw";
const OUT = "public/images/why";
fs.mkdirSync(TMP, { recursive: true });

const BASE = "http://localhost:3100";

/** Each slide: where to go, what to bring into frame, and the asset name. */
const SLIDES = [
  {
    name: "our-listing-gallery",
    url: `${BASE}/listing/KEY1030151`,
    // Top of the photo band, with the listing sub-nav above it.
    anchor: 'section[aria-label="Photos"]',
    offset: 42,
    wait: 8000,
  },
  {
    name: "our-search",
    url: `${BASE}/search?county=dutchess`,
    // Keep the logo + nav in frame (this has to read as OUR site); drop the two thin
    // utility strips above it.
    scrollY: 84,
    wait: 9000,
  },
  {
    name: "our-home-value",
    url: `${BASE}/home-value`,
    scrollY: 84,
    wait: 6000,
  },
  {
    name: "our-market-insights",
    url: `${BASE}/listing/KEY1030151`,
    anchorText: "The market around",
    // 89 (h2 inset in its section) + 53 (sticky sub-nav) lands the section top exactly
    // under the nav, so no slice of the dark band above it bleeds into frame.
    offset: 142,
    wait: 8000,
  },
  {
    name: "our-save-search",
    url: `${BASE}/search?county=dutchess`,
    anchor: "#main",
    offset: 0,
    wait: 9000,
    act: async (page) => {
      await page.getByRole("button", { name: /save search/i }).first().click();
      await page.waitForTimeout(1600);
      // The name field opens with its text selected; collapse the selection so the shot
      // shows a caret and focus ring rather than a blue highlight block.
      await page.keyboard.press("End");
      await page.waitForTimeout(400);
    },
  },
];

const HIDE_CSS = `
  nextjs-portal { display: none !important; }
  #rlt-chat-launcher, .rlt-chat-launcher, [id^="rlt-chat"] { display: none !important; }
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
});
await ctx.route("**/rlt-chat.js", (r) => r.abort());

// `--frame-only` reuses the raw shots (no page loads, so no repeat MLS media/detail traffic
// while iterating on the frame). `--only=name,name` limits the capture pass; framing always
// runs for all five.
const frameOnly = process.argv.includes("--frame-only");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",") : null;

for (const s of frameOnly ? [] : SLIDES.filter((s) => !only || only.includes(s.name))) {
  const page = await ctx.newPage();
  await page.goto(s.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(s.wait);
  await page.addStyleTag({ content: HIDE_CSS });

  if (typeof s.scrollY === "number") {
    await page.evaluate((y) => window.scrollTo(0, y), s.scrollY);
  } else if (s.anchorText) {
    await page.evaluate(
      ([text, off]) => {
        const el = Array.from(document.querySelectorAll("h1,h2,h3")).find((h) =>
          h.textContent.includes(text)
        );
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
      },
      [s.anchorText, s.offset]
    );
  } else if (s.anchor) {
    await page.evaluate(
      ([sel, off]) => {
        const el = document.querySelector(sel);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
      },
      [s.anchor, s.offset]
    );
  }
  await page.waitForTimeout(1500);
  if (s.act) await s.act(page);
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${TMP}/${s.name}.png` });
  console.log("raw", s.name);
  await page.close();
}

// ── Pass 2: frame each raw shot in our own laptop shell. ────────────────────────
const frame = await ctx.newPage();
await frame.setViewportSize({ width: 800, height: 500 });

for (const s of SLIDES) {
  // Inline as a data URI: a setContent page has an opaque origin and cannot read file://.
  const dataUri = `data:image/png;base64,${fs.readFileSync(`${TMP}/${s.name}.png`).toString("base64")}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 800px; height: 500px; background: transparent; }
    .stage { width: 800px; height: 500px; display: grid; place-items: center; }
    .laptop { width: 780px; }
    /* box-shadow, not filter: drop-shadow — a filter on a transparent page leaves a
       coloured low-alpha fringe across the whole canvas. */
    .lid {
      width: 700px; margin: 0 auto; background: #16181d;
      border-radius: 12px 12px 4px 4px; padding: 9px 8px 14px;
      box-shadow: 0 18px 28px -12px rgba(16, 44, 84, 0.3);
    }
    .cam { width: 4px; height: 4px; border-radius: 50%; background: #34383f; margin: 0 auto 5px; }
    .screen { border-radius: 4px; overflow: hidden; background: #ffffff; line-height: 0; }
    .screen img { width: 100%; display: block; }
    .base {
      width: 780px; height: 9px; background: #c3c8d0; border-radius: 0 0 7px 7px;
      position: relative; box-shadow: 0 10px 16px -8px rgba(16, 44, 84, 0.28);
    }
    .base::after {
      content: ""; position: absolute; left: 50%; top: 0; transform: translateX(-50%);
      width: 92px; height: 4px; background: #a8afb9; border-radius: 0 0 4px 4px;
    }
  </style></head><body><div class="stage"><div class="laptop">
    <div class="lid"><div class="cam"></div><div class="screen"><img src="${dataUri}"></div></div>
    <div class="base"></div>
  </div></div></body></html>`;

  await frame.setContent(html, { waitUntil: "load" });
  await frame.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.decode())));
  await frame.waitForTimeout(400);
  await frame.locator(".stage").screenshot({
    path: `${TMP}/${s.name}-framed.png`,
    omitBackground: true,
  });

  const buf = await sharp(`${TMP}/${s.name}-framed.png`).webp({ quality: 82, effort: 6 }).toBuffer();
  fs.writeFileSync(`${OUT}/${s.name}.webp`, buf);
  console.log("framed", s.name, (buf.length / 1024).toFixed(1) + "KB");
}

await browser.close();
