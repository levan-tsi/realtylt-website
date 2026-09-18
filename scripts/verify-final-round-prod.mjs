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
    // textContent, not innerText: a collapsed <details> FAQ answer is not rendered, so innerText
    // leaves it out and the probe reported a shipped fix as missing (2026-09-18, the instrument).
    text: document.querySelector("main").textContent.replace(/\s+/g, " "),
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

// ---- batch 2 + the excerpt pass (website 810a03b) ------------------------------------------
d = await open("/blog/marketing-automation-real-estate-email-deliverability");
ok("marketing post: CAN-SPAM modal restored by the checker", d.text.includes("A recipient can use it to ask not to receive future messages."));
ok("marketing post: the dek is the plain one", d.text.includes("What marketing automation really decides on your behalf."));

d = await open("/services/ai-scheduling");
ok("scheduling page: the RFC 'requires' it", d.text.includes("requires it. A change to the start time, end time or duration") && !d.text.includes("has a rule about this"));
ok("service pages: the shared 'touch it' paragraph is split", d.text.includes("because that one is truly live"));

d = await open("/blog/crm-sync-real-estate-duplicate-contact-records");
ok("CRM sync post: three requirements, not three descriptions", d.text.includes("That your rule is written down somewhere you can read it."));

// ---- batch 3 (website 52e6229) -------------------------------------------------------------
d = await open("/blog/the-singularity-self-improving-ai-system");
ok("Singularity post: the 'if ... then ... and then' condition is whole", d.text.includes("And then nothing can be undone in six weeks"));
ok("Singularity post: nothing ships on its own", d.text.includes("It does not ship anything on its own."));

d = await open("/blog/ai-agent-workforce-real-estate-assistants");
ok("agent workforce post: the annotators are independent", d.text.includes("They had independent annotators apply it"));

d = await open("/blog/automated-google-review-requests-real-estate");
ok("review post: the 465.7 example needs three things together", d.text.includes("when three things are true together"));
ok("review CTA: a list of three, in English", d.text.includes("That is three things. The date on your newest review."));

// ---- batch 4 (website bb2aa64) -------------------------------------------------------------
d = await open("/blog/ai-chat-assistant-real-estate-website");
ok("chat post: the refused 78% is still refused", d.text.includes("So this article does not use it"));
ok("chat post: people do not object to being helped", d.text.includes("People do not object to being helped by software."));

d = await open("/blog/database-reactivation-old-real-estate-leads");
ok("reactivation post: 'Per message.' still scopes the damages", d.text.includes("may treble it. Per message."));

d = await open("/blog/ai-lead-qualification-real-estate-scoring");
ok("qualification post: the HUD guidance is about how the ACT applies", d.text.includes("The guidance covers how the Act applies when an algorithm"));

d = await open("/blog/geo-landing-pages-real-estate-doorway-pages");
ok("GEO post: the sibling-overlap rewording is live", d.text.includes("It is the one with the map above it."));

d = await open("/top-areas/queens");
const median = d.text.match(/\$[\d,.]+[KM]?/);
ok("/top-areas/queens renders with a median", /median/i.test(d.text) && !!median, median ? median[0] : "none");

await browser.close();
const failed = checks.filter((c) => !c).length;
console.log(`\n${checks.length - failed}/${checks.length} prod checks pass`);
process.exit(failed ? 1 : 0);
