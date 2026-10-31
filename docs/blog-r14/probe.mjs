/** Round 14 probe: the two refreshed posts on a production build.
 * node docs/blog-r14/probe.mjs <base> <outdir>
 * Full-page shots at 390x844 and 1440x900, one shot per scene at 390, and the gate facts:
 * console errors, horizontal overflow, the rail and the reading progress, scenes visible after
 * scroll, every figure's words at reading size. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:3107";
const out = process.argv[3] ?? "shots";
fs.mkdirSync(out, { recursive: true });
const SLUGS = [
  ["seller", "seller-disclosure-requirements-new-york"],
  ["ai", "ai-audit-small-business-what-not-to-automate"],
];
const VIEWS = [
  ["390", { width: 390, height: 844 }],
  ["1440", { width: 1440, height: 900 }],
];

const browser = await chromium.launch();
const report = [];
for (const [short, slug] of SLUGS) {
  for (const [vname, viewport] of VIEWS) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.route("**/api/media/**", (r) => r.abort());
    await page.route("**/api/lead**", (r) => r.fulfill({ status: 200, body: "{}" }));
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const resp = await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
    // Walk the page so every reveal fires, the way a reader would.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    let progressMid = null;
    for (let y = 0; y < total; y += Math.round(viewport.height * 0.7)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(140);
      if (progressMid === null && y > total / 2) {
        progressMid = await page.evaluate(() => {
          const bar = document.querySelector(".fixed.inset-x-0.top-0 > .origin-left");
          return bar ? getComputedStyle(bar).transform : "missing";
        });
      }
    }
    await page.waitForTimeout(600);
    const facts = await page.evaluate(() => {
      const scenes = [...document.querySelectorAll('[id^="scene-"]')];
      const hiddenReveals = scenes.flatMap((s) =>
        [...s.querySelectorAll(".reveal")].filter((r) => getComputedStyle(r).opacity !== "1").map(() => s.id),
      );
      // Smallest rendered text inside the figure scenes (the words a phone reader must read).
      let minFont = 99;
      let minAt = "";
      for (const s of scenes) {
        for (const el of s.querySelectorAll("p, span, li, a")) {
          if (!el.textContent.trim() || el.closest(".sr-only") || el.classList.contains("sr-only")) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const f = parseFloat(getComputedStyle(el).fontSize);
          if (f < minFont) ((minFont = f), (minAt = `${s.id}: ${el.textContent.trim().slice(0, 40)}`));
        }
      }
      const wide = scenes
        .map((s) => [s.id, Math.max(...[...s.querySelectorAll("*")].map((e) => e.getBoundingClientRect().right))])
        .filter(([, r]) => r > window.innerWidth + 0.5);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        scenes: scenes.map((s) => s.id),
        hiddenReveals,
        minFont,
        minAt,
        wide,
        rail: !!document.querySelector("nav[data-toc]"),
        railLinks: [...document.querySelectorAll("nav[data-toc] a")].length,
        h2: document.querySelectorAll("#article-root h2").length,
      };
    });
    // The contents: below 1600 it is the "On this page" button and its sheet; click the third
    // link in the sheet and see that the page lands on that target.
    let railJump = "no trigger";
    const trig = page.locator("[data-toc-trigger]");
    if (await trig.isVisible()) {
      await page.evaluate(() => window.scrollTo(0, 2500));
      await page.waitForTimeout(400);
      await trig.click();
      await page.waitForTimeout(600);
      const links = page.locator('[aria-label="On this page"]:visible a[href^="#"]');
      const n = await links.count();
      const href = await links.nth(2).getAttribute("href");
      await links.nth(2).click();
      await page.waitForTimeout(1400);
      railJump = await page.evaluate(
        ([h, count]) => {
          const t = document.getElementById(h.slice(1));
          return t ? `${count} links in the sheet; ${h} lands at top ${Math.round(t.getBoundingClientRect().top)}px` : `${h}: no target`;
        },
        [href, n],
      );
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `${short}-${vname}-full.png`), fullPage: true });
    if (vname === "390") {
      // Fixed chrome (the progress bar, the contents button, the chat launcher) would stand on
      // every scene shot; hide it for these frames only.
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("body *"))
          if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
      });
      await page.addStyleTag({ content: "[data-toc-trigger]{visibility:hidden !important}" });
      for (const id of facts.scenes) {
        const el = page.locator(`#${id}`);
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await el.screenshot({ path: path.join(out, `${short}-390-${id}.png`) });
      }
    }
    report.push({ slug, view: vname, status: resp?.status(), errors, progressMid, railJump, ...facts });
    await ctx.close();
  }
}
// The two free files.
const ctx = await browser.newContext();
for (const f of ["/downloads/seller-disclosure-prep-sheet-ny.pdf", "/downloads/three-question-sheet.pdf"]) {
  const r = await ctx.request.get(`${base}${f}`);
  report.push({ file: f, status: r.status(), type: r.headers()["content-type"], bytes: (await r.body()).length });
}
await browser.close();
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
