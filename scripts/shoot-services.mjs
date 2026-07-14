/* Screenshot + audit driver for the /services surface.
 * Usage: node scripts/shoot-services.mjs [baseUrl]
 * Writes full-page shots to docs/services/ at 1440 and 390, and prints console errors,
 * horizontal-overflow, small-tap-target, and JSON-LD findings. */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = "docs/services";

const PAGES = [
  ["services", "/services"],
  ["chat", "/services/ai-chat-assistant"],
  ["voice", "/services/ai-voice-agents"],
  ["data", "/services/skip-tracing-lead-generation"],
  ["workflow", "/services/workflow-automation"],
  ["reviews", "/services/review-automation"],
  ["blog-chat", "/blog/ai-chat-assistant-real-estate-website"],
];

const VIEWPORTS = [
  ["1440", { width: 1440, height: 1000 }],
  ["390", { width: 390, height: 844 }],
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
let problems = 0;

for (const [label, viewport] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  for (const [name, path] of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    // Trip every IntersectionObserver so nothing is screenshotted mid-fade.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
      await new Promise((r) => setTimeout(r, 500));
    });

    await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: true });

    const audit = await page.evaluate(() => {
      const out = { overflow: null, tiny: [], jsonld: [], h1: 0, emdash: [] };

      const de = document.documentElement;
      if (de.scrollWidth > de.clientWidth + 1) {
        out.overflow = { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth };
        // name the widest offenders
        out.overflowCulprits = [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
          .slice(0, 6)
          .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 60)}`);
      }

      // Scoped to <main>: the site-wide header/footer inline links are 17-20px tall on
      // every page of realtylt.com and predate this work. Changing them is a whole-site
      // design decision, not a services one — flagged in the report, not silently fixed.
      const main = document.querySelector("main") || document.body;
      for (const el of main.querySelectorAll("a, button, summary, input, select, textarea")) {
        if (el.closest("header, footer")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.width <= 1 && r.height <= 1) continue; // sr-only skip link
        // WCAG 2.5.8 exempts a target "in a sentence or block of text" — an inline link
        // in a blog paragraph cannot be padded to 24px without wrecking the line box.
        const inline = el.tagName === "A" && /^(P|LI|BLOCKQUOTE)$/.test(el.parentElement?.tagName || "");
        if (inline) continue;
        if (r.height < 24 || r.width < 24) {
          out.tiny.push(`${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 32)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }

      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const j = JSON.parse(s.textContent);
          out.jsonld.push(j["@type"]);
        } catch (e) {
          out.jsonld.push(`PARSE ERROR: ${e.message}`);
        }
      }

      out.h1 = document.querySelectorAll("h1").length;

      // Text tells: em dash / arrow glyph anywhere a visitor can read.
      const text = document.body.innerText;
      for (const m of text.matchAll(/.{0,30}[—–→].{0,30}/g)) out.emdash.push(m[0]);

      return out;
    });

    const flags = [];
    if (errors.length) flags.push(`CONSOLE(${errors.length}): ${errors.slice(0, 2).join(" | ")}`);
    if (audit.overflow) flags.push(`H-OVERFLOW ${audit.overflow.scrollWidth}>${audit.overflow.clientWidth} :: ${(audit.overflowCulprits || []).join(", ")}`);
    if (audit.tiny.length) flags.push(`TINY-TAP(${audit.tiny.length}): ${audit.tiny.slice(0, 3).join(" | ")}`);
    if (audit.h1 !== 1) flags.push(`H1 COUNT = ${audit.h1}`);
    if (audit.emdash.length) flags.push(`TEXT-TELL(${audit.emdash.length}): ${audit.emdash.slice(0, 2).join(" | ")}`);

    if (flags.length) problems += flags.length;
    console.log(
      `${flags.length ? "FAIL" : "ok  "} ${label.padEnd(4)} ${path.padEnd(42)} jsonld=[${audit.jsonld.join(",")}]`,
    );
    for (const f of flags) console.log(`      ${f}`);

    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log(problems === 0 ? "\nALL CLEAN" : `\n${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
