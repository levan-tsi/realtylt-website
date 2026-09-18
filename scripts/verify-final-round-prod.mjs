// PROD probe for the final round (2026-09-18): node scripts/verify-final-round-prod.mjs
// realtylt.com sits behind Vercel's bot challenge, so this is a real HEADFUL Chromium; analytics
// and MLS media are blocked so the probe leaves no trace in the owner's numbers and never touches
// the media host. 15/15 on website 64007d9 (2026-09-18).
import { chromium } from "playwright";

const B = process.env.BASE || "https://realtylt.com";
const checks = [];
const ok = (name, pass, detail = "") => { checks.push(pass); console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  :: " + detail : ""}`); };

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.route(/api\/media\/|googletagmanager|google-analytics|doubleclick|_vercel\/insights|relay-ph|posthog/, (r) => r.abort());

async function open(path) {
  await page.goto(B + path, { waitUntil: "domcontentloaded", timeout: 90_000 });
  // The challenge page swaps itself for the real one; wait until <main> exists.
  await page.waitForSelector("main", { timeout: 60_000 });
  await page.waitForTimeout(800);
  return page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href || "",
    ogUrl: document.querySelector('meta[property="og:url"]')?.content || "",
    ogTitle: document.querySelector('meta[property="og:title"]')?.content || "",
    robots: document.querySelector('meta[name="robots"]')?.content || "",
    text: document.querySelector("main").innerText,
    emptyAnchors: [...document.querySelectorAll("main a[href^='/']")].filter((a) => !a.textContent.trim() && !a.querySelector("img[alt]:not([alt=''])") && !a.title).length,
  }));
}

let d = await open("/");
ok("home canonical is / (not /index)", /^https:\/\/realtylt\.com\/?$/.test(d.canonical), d.canonical);
ok("home og:url is / (not /index)", /^https:\/\/realtylt\.com\/?$/.test(d.ogUrl), d.ogUrl);
ok("home listing cards carry anchor text", d.emptyAnchors === 0, `empty=${d.emptyAnchors}`);
ok("home is indexable", !/noindex/i.test(d.robots), d.robots || "(no robots meta)");

d = await open("/buying");
ok("/buying og:url is its own URL", d.ogUrl.replace(/\/$/, "") === "https://realtylt.com/buying", d.ogUrl);

d = await open("/blog/invoicing-and-payments-real-estate-brokerage");
ok("post <title> is the keyword title", d.title.startsWith("Invoicing and Payments in a Real Estate Brokerage"), d.title);
ok("post og:title is the story headline", d.ogTitle.startsWith("The Referral Closed in July"), d.ogTitle);
ok("post body is the rewrite, with the corrected RESPA gloss", d.text.includes("is a crime unless the law's own list of exceptions covers it") && !d.text.includes("nobody may pay for a referral"));
ok("post related cards carry anchor text", d.emptyAnchors === 0, `empty=${d.emptyAnchors}`);

d = await open("/blog");
ok("blog index cards carry anchor text", d.emptyAnchors === 0, `empty=${d.emptyAnchors}`);

d = await open("/services");
ok("services index: the payback claim is gone", !/pays back/i.test(d.text) && d.text.includes("We cut the ideas that should not be built"));
ok("services index cards carry anchor text", d.emptyAnchors === 0, `empty=${d.emptyAnchors}`);

d = await open("/services/skip-tracing-lead-generation");
ok("skip tracing page: no 'verified' / 'callable'", !/\bverified\b|\bcallable\b/i.test(d.text));
ok("skip tracing page: the /ai lede", d.text.includes("It pulls owner leads from Google Maps."));

d = await open("/top-areas/queens");
const median = d.text.match(/\$[\d,.]+[KM]?/);
ok("/top-areas/queens renders with a median", /median/i.test(d.text) && !!median, median ? median[0] : "none");

await browser.close();
const failed = checks.filter((c) => !c).length;
console.log(`\n${checks.length - failed}/${checks.length} prod checks pass`);
process.exit(failed ? 1 : 0);
