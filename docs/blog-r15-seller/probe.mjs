/** Round 15 seller lane probe: the author card and the footer on four posts, plus the seller
 * page's two form links and the free files.
 * node docs/blog-r15-seller/probe.mjs <base> <outdir>
 * At 320, 390 and 1440: HTTP status, console errors, sideways scroll, the card's words, the
 * contact row's tap heights and text size, the footer's contact lines; a JPEG of the card and of
 * the footer's contact block per page and width. Round 14's probe (docs/blog-r14/probe.mjs)
 * still covers the scenes. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:3109";
const out = process.argv[3] ?? "shots";
fs.mkdirSync(out, { recursive: true });
const PAGES = [
  ["seller", "seller-disclosure-requirements-new-york"],
  ["ai", "ai-audit-small-business-what-not-to-automate"],
  ["inspection", "home-inspection-checklist-hudson-valley-ny"],
  ["chat", "ai-chat-assistant-real-estate-website"],
];
const VIEWS = [
  ["320", { width: 320, height: 720 }],
  ["390", { width: 390, height: 844 }],
  ["1440", { width: 1440, height: 900 }],
];

const browser = await chromium.launch();
const report = [];
for (const [short, slug] of PAGES) {
  for (const [vname, viewport] of VIEWS) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.route("**/api/media/**", (r) => r.abort());
    await page.route("**/api/lead**", (r) => r.fulfill({ status: 200, body: "{}" }));
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const resp = await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(viewport.height * 0.8)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(500);
    const facts = await page.evaluate(() => {
      const card = document.querySelector('aside[aria-label^="About "]');
      const contacts = card ? [...card.querySelectorAll('ul[aria-label^="Contact"] a, a[href="/who-we-are"]')] : [];
      const foot = document.querySelector("footer address");
      const realForm = [...document.querySelectorAll("#article-root a")]
        .filter((a) => /dos\.ny\.gov/.test(a.href))
        .map((a) => `${a.textContent.trim()} -> ${a.href}`);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        cards: document.querySelectorAll('aside[aria-label^="About "]').length,
        cardText: card ? card.innerText.replace(/\s+/g, " ").trim() : null,
        contacts: contacts.map((a) => {
          const r = a.getBoundingClientRect();
          return `${a.textContent.trim()} [${a.getAttribute("href")}] ${Math.round(r.width)}x${Math.round(r.height)} ${getComputedStyle(a).fontSize}`;
        }),
        cardRight: card ? Math.max(...[...card.querySelectorAll("*")].map((e) => e.getBoundingClientRect().right)) : null,
        footer: foot ? [...foot.querySelectorAll("p")].map((p) => p.textContent.trim()) : null,
        footerLinks: foot ? [...foot.querySelectorAll("a")].map((a) => a.getAttribute("href")) : null,
        realForm,
        broker: card ? /broker/i.test(card.innerText) : null,
      };
    });
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("body *")) if (getComputedStyle(el).position === "fixed") el.style.visibility = "hidden";
    });
    const card = page.locator('aside[aria-label^="About "]');
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({ path: path.join(out, `card-${short}-${vname}.jpg`), type: "jpeg", quality: 80 });
    }
    const addr = page.locator("footer address");
    await addr.scrollIntoViewIfNeeded();
    await addr.locator("xpath=..").screenshot({ path: path.join(out, `footer-${short}-${vname}.jpg`), type: "jpeg", quality: 80 });
    report.push({ slug, view: vname, status: resp?.status(), errors, ...facts });
    await ctx.close();
  }
}
const ctx = await browser.newContext();
for (const f of ["/downloads/seller-disclosure-prep-sheet-ny.pdf", "/downloads/three-question-sheet.pdf"]) {
  const r = await ctx.request.get(`${base}${f}`);
  report.push({ file: f, status: r.status(), type: r.headers()["content-type"], bytes: (await r.body()).length });
}
await browser.close();
fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
