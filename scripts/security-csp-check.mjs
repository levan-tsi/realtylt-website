// Security verification: drive every key page under the new CSP and report any
// Content-Security-Policy violations, console errors, or failed requests.
// Usage: node scripts/security-csp-check.mjs [baseUrl]   (default http://localhost:3310)
// Evidence + screenshots -> docs/security/
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3310";
const OUT = path.join(process.cwd(), "docs", "security");
fs.mkdirSync(OUT, { recursive: true });

// [route, settleMs, waitForSelector?]
const ROUTES = [
  ["/", 3000],
  ["/search?view=map", 6000, ".leaflet-container"],
  ["/financing", 3000],
  ["/listing/H6400001", 3500],
  ["/blog/top-5-renovations-increase-home-value-ny", 3000],
  ["/who-we-are", 2500],
  ["/connect", 2500],
  ["/ai", 7000],
];

const results = [];

const browser = await chromium.launch();
for (const [route, settle, sel] of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  // Capture CSP violations as DOM events (fired the instant a resource is refused).
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__csp.push({ directive: e.violatedDirective, blocked: e.blockedURI, line: e.lineNumber });
    });
  });
  const consoleErrors = [];
  const cspConsole = [];
  const failed = [];
  page.on("console", (m) => {
    if (m.type() === "error") {
      const t = m.text();
      consoleErrors.push(t);
      if (/content security policy|refused to (load|execute|connect|apply)/i.test(t)) cspConsole.push(t);
    }
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => {
    const f = r.failure();
    // Ignore benign aborts (e.g. cancelled prefetch).
    if (f && !/ERR_ABORTED/.test(f.errorText)) failed.push(`${r.url()} :: ${f.errorText}`);
  });

  let httpStatus = 0;
  try {
    const resp = await page.goto(BASE + route, { waitUntil: "load", timeout: 45000 });
    httpStatus = resp ? resp.status() : 0;
    if (sel) await page.waitForSelector(sel, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(settle);
  } catch (e) {
    consoleErrors.push("nav error: " + e.message);
  }

  const cspEvents = await page.evaluate(() => window.__csp || []).catch(() => []);
  // Map-specific health: did OSM tiles actually paint?
  let mapInfo = null;
  if (route.includes("view=map")) {
    mapInfo = await page
      .evaluate(() => {
        const tiles = [...document.querySelectorAll("img.leaflet-tile")];
        return {
          container: !!document.querySelector(".leaflet-container"),
          tiles: tiles.length,
          tilesLoaded: tiles.filter((t) => t.complete && t.naturalWidth > 0).length,
        };
      })
      .catch(() => null);
  }
  let aiInfo = null;
  if (route === "/ai") {
    aiInfo = await page
      .evaluate(() => ({ canvas: document.querySelectorAll("canvas").length }))
      .catch(() => null);
  }

  const shot = path.join(OUT, "csp-" + route.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") + ".png");
  await page.screenshot({ path: shot }).catch(() => {});

  results.push({ route, httpStatus, cspEvents, cspConsole, mapInfo, aiInfo, failed, consoleErrorCount: consoleErrors.length, consoleErrors: consoleErrors.slice(0, 6) });
  await ctx.close();
}
await browser.close();

fs.writeFileSync(path.join(OUT, "csp-report.json"), JSON.stringify(results, null, 2));
for (const r of results) {
  const viol = r.cspEvents.length + r.cspConsole.length;
  console.log(`\n${r.route}  [HTTP ${r.httpStatus}]  CSPviolations=${viol}  failedReq=${r.failed.length}  consoleErr=${r.consoleErrorCount}`);
  if (r.mapInfo) console.log("   map:", JSON.stringify(r.mapInfo));
  if (r.aiInfo) console.log("   ai:", JSON.stringify(r.aiInfo));
  if (viol) console.log("   CSP:", JSON.stringify([...r.cspEvents, ...r.cspConsole].slice(0, 8)));
  if (r.failed.length) console.log("   FAILED:", JSON.stringify(r.failed.slice(0, 5)));
  if (r.consoleErrors.length) console.log("   errsample:", JSON.stringify(r.consoleErrors.slice(0, 3)));
}
console.log("\nWrote docs/security/csp-report.json + screenshots");
