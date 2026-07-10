// QA drive of the DEPLOYED site (Vercel) at 1280 + 390 across every route.
// Usage: node scripts/qa-deploy.mjs [baseUrl]
// Screenshots + report.json -> docs/qa-deploy/
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "https://realtylt-website.vercel.app";
const OUT = path.join(process.cwd(), "docs", "qa-deploy");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  "/", "/search", "/buying", "/selling", "/financing", "/home-value",
  "/connect", "/top-areas",
  "/top-areas/dutchess", "/top-areas/westchester", "/top-areas/putnam",
  "/top-areas/rockland", "/top-areas/ulster", "/top-areas/orange",
  "/who-we-are", "/reviews", "/blog", "/saved",
  "/privacy-policy", "/dmca-terms", "/this-page-does-not-exist",
];

const slugOf = (r) =>
  r === "/" ? "home" : r === "/this-page-does-not-exist" ? "404" : r.slice(1).replace(/\//g, "-");

const report = { base: BASE, when: new Date().toISOString(), pages: {}, flows: {}, meta: {} };

async function drivePage(browser, route, width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 300)));
  page.on("requestfailed", (r) => {
    const f = r.failure()?.errorText || "";
    if (!/ERR_ABORTED/.test(f)) failed.push(`${r.url().slice(0, 140)} ${f}`.trim());
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("this-page-does-not-exist"))
      failed.push(`${r.status()} ${r.url().slice(0, 140)}`);
  });

  const res = await page.goto(BASE + route, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(opts.settle ?? 1200);

  // scroll through to trigger lazy content / reveals, then back to top
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(opts.postScroll ?? 800);

  const checks = await page.evaluate(() => {
    const se = document.scrollingElement;
    const hscroll = se.scrollWidth > window.innerWidth + 1;
    const h1s = document.querySelectorAll("h1").length;
    const title = document.title;
    const desc = document.querySelector('meta[name="description"]')?.content || "";
    const canonical = document.querySelector('link[rel="canonical"]')?.href || "";
    const imgs = [...document.querySelectorAll("img")];
    const brokenImgs = imgs
      .filter((i) => i.complete && i.naturalWidth === 0 && !i.loading?.includes("lazy"))
      .map((i) => (i.currentSrc || i.src).slice(0, 120));
    let jsonLdOk = true, jsonLdCount = 0;
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      jsonLdCount++;
      try { JSON.parse(s.textContent); } catch { jsonLdOk = false; }
    }
    const landmarks = {
      header: !!document.querySelector("header"), nav: !!document.querySelector("nav"),
      main: !!document.querySelector("main"), footer: !!document.querySelector("footer"),
    };
    return { hscroll, h1s, title, desc, canonical, imgCount: imgs.length, brokenImgs, jsonLdOk, jsonLdCount, landmarks };
  });

  const shot = path.join(OUT, `${opts.slug || slugOf(route)}-${width}.png`);
  await page.screenshot({ path: shot, fullPage: opts.fullPage ?? true });

  const out = { status: res?.status(), errors: [...new Set(errors)], failedReqs: [...new Set(failed)].slice(0, 10), ...checks };
  await ctx.close();
  return out;
}

const browser = await chromium.launch();

// --- listing + blog slugs from live data ---
const idx = await (await fetch(BASE + "/api/idx/search?county=dutchess")).json();
const listingId = idx?.results?.[0]?.id || idx?.listings?.[0]?.id;
report.meta.listingId = listingId;

// blog first slug
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto(BASE + "/blog", { waitUntil: "load" });
  const slug = await p.evaluate(() => document.querySelector('a[href^="/blog/"]')?.getAttribute("href"));
  report.meta.blogPost = slug;
  await ctx.close();
  if (slug) ROUTES.push(slug);
}
if (listingId) ROUTES.push(`/listing/${listingId}`);

// --- drive every route at both widths ---
for (const route of ROUTES) {
  const slug = slugOf(route).replace(/[^a-z0-9-]/gi, "-");
  report.pages[route] = {};
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    try {
      report.pages[route][w] = await drivePage(browser, route, w, h, { slug });
    } catch (e) {
      report.pages[route][w] = { crash: String(e).slice(0, 300) };
    }
    process.stdout.write(`${route} @${w} done\n`);
  }
}

// --- /ai (heavy Three.js — longer settle, no fullPage scroll value) ---
for (const [w, h] of [[1280, 800], [390, 844]]) {
  try {
    report.pages["/ai"] = report.pages["/ai"] || {};
    report.pages["/ai"][w] = await drivePage(browser, "/ai", w, h, { slug: "ai", settle: 9000, postScroll: 2000, fullPage: false });
    process.stdout.write(`/ai @${w} done\n`);
  } catch (e) {
    report.pages["/ai"][w] = { crash: String(e).slice(0, 300) };
  }
}

await browser.close();
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

// --- summary ---
let problems = 0;
for (const [route, widths] of Object.entries(report.pages)) {
  for (const [w, r] of Object.entries(widths)) {
    const issues = [];
    if (r.crash) issues.push("CRASH " + r.crash);
    if (r.status && r.status >= 400 && route !== "/this-page-does-not-exist") issues.push("HTTP " + r.status);
    if (r.errors?.length) issues.push("console: " + r.errors.join(" | "));
    if (r.failedReqs?.length) issues.push("failedReqs: " + r.failedReqs.join(" | "));
    if (r.hscroll && w === "390") issues.push("HORIZONTAL SCROLL");
    if (r.h1s !== 1 && route !== "/ai") issues.push("h1 count " + r.h1s);
    if (r.brokenImgs?.length) issues.push("broken imgs: " + r.brokenImgs.join(","));
    if (r.jsonLdOk === false) issues.push("INVALID JSON-LD");
    if (issues.length) { problems++; console.log(`\n[${route} @${w}] ` + issues.join("\n   ")); }
  }
}
// title/desc uniqueness at 1280
const titles = {};
for (const [route, widths] of Object.entries(report.pages)) {
  const t = widths["1280"]?.title;
  if (!t) continue;
  (titles[t] = titles[t] || []).push(route);
}
for (const [t, routes] of Object.entries(titles))
  if (routes.length > 1) { problems++; console.log(`\nDUPLICATE TITLE "${t}": ${routes.join(", ")}`); }

console.log(`\n=== ${problems === 0 ? "ALL CLEAN" : problems + " problem groups"} — full data in docs/qa-deploy/report.json ===`);
