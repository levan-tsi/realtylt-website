/**
 * DOES ANY TEXT IN A DATA GRAPHIC RUN OFF THE EDGE OF ITS OWN VIEWBOX?
 *
 *   node scripts/check-svg-crop.mjs [baseUrl] [slug ...]
 *
 * WHY THIS EXISTS. The flagship charts and diagrams are real inline SVG, drawn so another site
 * can lift them out and credit them. That choice has one failure mode nothing else on this repo
 * can catch: AN SVG DOES NOT OVERFLOW, IT CROPS. A label wider than the space reserved for it is
 * simply not drawn past the viewBox edge. `documentElement.scrollWidth` stays clean, no element
 * reports a bad bounding box in page coordinates, the readiness gate passes, every test is green,
 * and the shipped page quietly reads "25 min 26" where it should read "25 min 26 sec".
 *
 * That is exactly what shipped-and-was-caught-by-eye on the workflow topic: `StatBars` reserved a
 * fixed 78px for its value, which fits "15%" and "60x" and crops a duration. The primitive now
 * derives the reserve from the longest value, and this is the guard that stops the next topic
 * finding out the same way.
 *
 * It measures INK: `getBBox()` on the real text node inside SVG user units, compared against the
 * viewBox width. And it runs against EVERY flagship rather than the one being worked on, because
 * a check that a shipped page fails is a wrong check, not a found bug. The first version of this
 * file had exactly that fault and flagged two shipped charts, because a bar label anchored at
 * x=0 reports `x = -0.83` from its glyph side bearing. Hence the tolerance below.
 *
 * WHY 1.5 USER UNITS. Measured on the live page: the widest side bearing on any shipped label is
 * 0.83u, and the defect this exists to catch was 24.7u ("25 min 26 sec" measures 102.67u and the
 * old geometry started it at x=562 in a 640 viewBox, so it ended at 664.7). Anything between a
 * rounding artifact and a real crop is a factor of thirty apart, so the threshold is not delicate.
 *
 * Exit code 1 on any cropped text, so this can sit in front of a deploy.
 */
/** How far past an edge the ink may reach before it counts as a crop, in SVG user units. */
const TOLERANCE = 1.5;
import { chromium } from "playwright";

const args = process.argv.slice(2);
const base = args[0]?.startsWith("http") ? args.shift() : "https://realtylt-website.vercel.app";
const SLUGS = args.length
  ? args
  : [
      "ai-chat-assistant-real-estate-website",
      "ai-voice-agent-missed-calls-real-estate",
      "database-reactivation-old-real-estate-leads",
      "ai-lead-qualification-real-estate-scoring",
      "workflow-automation-real-estate-business",
      "automated-google-review-requests-real-estate",
      "ai-appointment-booking-no-shows-real-estate",
      "local-seo-real-estate-map-pack-google-business-profile",
      "geo-landing-pages-real-estate-doorway-pages",
      "crm-sync-real-estate-duplicate-contact-records",
      "ai-agent-workforce-real-estate-assistants",
      "skip-tracing-real-estate-legal-owner-phone-numbers",
      "marketing-automation-real-estate-email-deliverability",
      "document-processing-real-estate-contract-deadlines",
      "data-enrichment-real-estate-stale-contact-records",
    ];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
let cropped = 0;
let checked = 0;

for (const slug of SLUGS) {
  await page.goto(`${base}/blog/${slug}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(500);

  const rows = await page.evaluate(() => {
    const out = [];
    for (const svg of document.querySelectorAll("#article-root svg[role='img']")) {
      const vb = svg.viewBox.baseVal;
      if (!vb || !vb.width) continue;
      for (const t of svg.querySelectorAll("text")) {
        let b;
        try {
          b = t.getBBox();
        } catch {
          continue;
        }
        out.push({
          txt: (t.textContent || "").slice(0, 40),
          // How far past the right edge, and how far before the left edge, the ink reaches.
          right: +(b.x + b.width - vb.width).toFixed(2),
          left: +(-b.x).toFixed(2),
        });
      }
    }
    return out;
  }, TOLERANCE);

  const bad = rows.filter((r) => r.right > TOLERANCE || r.left > TOLERANCE);
  checked += rows.length;
  cropped += bad.length;
  console.log(
    `${bad.length ? "FAIL" : "PASS"}  ${slug.padEnd(46)} ${rows.length} text nodes in role="img" graphics`,
  );
  for (const r of bad) {
    const side = r.right > TOLERANCE ? `${r.right}u past the right edge` : `${r.left}u before the left edge`;
    console.log(`        cropped, ${side}: "${r.txt}"`);
  }
}

await ctx.close();
await browser.close();
console.log(`\n${checked} text node(s) checked, ${cropped} cropped.`);
process.exit(cropped ? 1 : 0);
