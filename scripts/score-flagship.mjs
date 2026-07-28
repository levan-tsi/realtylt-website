/**
 * FLAGSHIP READINESS GATE
 *
 *   node scripts/score-flagship.mjs <slug> [baseUrl]
 *
 * Every service topic that gets the flagship treatment has to clear this before it ships. It
 * exists because the risk with a template is not that topic 1 is good, it is that topics 2 to
 * 19 quietly are not.
 *
 * WHY IT IS A CHECKLIST AND NOT A SCORE. The rubric in docs/blog-flagship/SCORECARD.md was
 * derived from research BEFORE anything was measured, and roughly 40 of its 100 points are
 * judgement: whether the analysis is original, whether the insight goes beyond the obvious,
 * whether the writing shows first-hand experience. A script cannot judge those, and a script
 * that pretended to would be the build grading its own homework. So this checks only what a
 * machine can actually verify, reports the judgement criteria as UNSCORED, and fails the build
 * on any mechanical criterion that is missing. A topic either has a cited source, imagery, a
 * real data graphic, a film, FAQ schema, a direct answer, cluster links and a freshness signal,
 * or it does not.
 *
 * Exit code 1 on any failure, so this can sit in front of a deploy.
 */
import { chromium } from "playwright";

const slug = process.argv[2];
const base = process.argv[3] || "https://realtylt-website.vercel.app";
if (!slug) {
  console.error("usage: node scripts/score-flagship.mjs <slug> [baseUrl]");
  process.exit(2);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 160)));
await page.goto(`${base}/blog/${slug}`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForLoadState("networkidle", { timeout: 40000 }).catch(() => {});
await page.waitForTimeout(1500);

const m = await page.evaluate(() => {
  const art = document.getElementById("article-root");
  if (!art) return null;
  const txt = art.innerText;
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => {
      try {
        return JSON.parse(s.textContent);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const types = ld.flatMap((o) => (Array.isArray(o) ? o.map((x) => x["@type"]) : [o["@type"]]));
  const dated = ld.flat().find((x) => x && (x.datePublished || x.dateModified)) || {};
  // Related-post thumbnails are page furniture, not article imagery.
  const imgs = [...art.querySelectorAll("img")].filter(
    (i) => !i.closest("section[aria-labelledby='related-heading']"),
  );
  const links = [...art.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") || "");
  const de = document.documentElement;
  return {
    words: txt.trim().split(/\s+/).length,
    images: imgs.length,
    altMissing: imgs.filter((i) => !i.hasAttribute("alt")).length,
    // A real graphic declares itself as one. An icon does not carry role="img" with a title.
    graphics: [...art.querySelectorAll("svg[role='img'], canvas")].length,
    video: art.querySelectorAll("video, iframe[src*='youtu'], iframe[src*='vimeo']").length,
    schemaTypes: [...new Set(types)],
    citations: [...new Set(links.filter((h) => /^https?:\/\//i.test(h)))].filter(
      (h) => !/twitter|facebook|linkedin|mailto|realtylt/i.test(h),
    ).length,
    authorPageLink: links.some((h) => /\/about|\/who-we-are|\/author|\/team/i.test(h)),
    clusterLinks: [...new Set(links.filter((h) => /^\/(services|ai|blog)/.test(h)))].length,
    visibleUpdated: /updated/i.test(txt),
    datePublished: dated.datePublished || null,
    dateModified: dated.dateModified || null,
    summaryBlock: !!art.querySelector("section[aria-label='In short'], [data-summary]"),
    scenes: art.querySelectorAll("[id^='scene-']").length,
    rail: !!document.querySelector("nav[data-toc], nav[aria-label='Article sections']"),
    overflow: de.scrollWidth > de.clientWidth ? `${de.scrollWidth}>${de.clientWidth}` : null,
    emDash: (txt.match(/—/g) || []).length,
    arrowGlyph: (txt.match(/[→⇒➡]/g) || []).length,
    markerLeak: /\[\[scene:/.test(txt),
  };
});
await ctx.close();
await browser.close();

if (!m) {
  console.error(`FAIL: /blog/${slug} did not render an #article-root`);
  process.exit(1);
}

/** [rubric id, what it is, passing?, detail] */
const checks = [
  ["A4/B2", "a citable third-party source", m.citations >= 1, `${m.citations} external citations`],
  ["B1", "author identity linking to an author page", m.authorPageLink, String(m.authorPageLink)],
  ["C1", "imagery distributed through the body", m.images >= 2, `${m.images} images`],
  ["C1", "every image has an alt attribute", m.altMissing === 0, `${m.altMissing} missing`],
  ["C2", "an original data graphic or diagram", m.graphics >= 1, `${m.graphics} role="img" graphics`],
  ["C3", "a film or animated explainer", m.video >= 1, `${m.video} video`],
  ["D1", "FAQPage schema", m.schemaTypes.includes("FAQPage"), m.schemaTypes.join(", ")],
  [
    "D2",
    "BlogPosting and BreadcrumbList schema",
    m.schemaTypes.includes("BlogPosting") && m.schemaTypes.includes("BreadcrumbList"),
    m.schemaTypes.join(", "),
  ],
  ["C3", "VideoObject schema when a film is served", m.video === 0 || m.schemaTypes.includes("VideoObject"), m.schemaTypes.join(", ")],
  ["D3", "a direct-answer summary an engine can lift", m.summaryBlock, String(m.summaryBlock)],
  ["D4", "internal links into the topic cluster", m.clusterLinks >= 3, `${m.clusterLinks} links`],
  [
    "D5",
    "a real freshness signal",
    m.visibleUpdated && !!m.dateModified && m.dateModified !== m.datePublished,
    `visible=${m.visibleUpdated} published=${m.datePublished} modified=${m.dateModified}`,
  ],
  ["A2", "substantial length", m.words >= 1200, `${m.words} words`],
  ["E1", "scenes are real navigation destinations", m.scenes >= 5, `${m.scenes} scene anchors`],
  ["E2", "no horizontal overflow", !m.overflow, m.overflow || "none"],
  ["E2", "no page errors", pageErrors.length === 0, pageErrors.join(" | ") || "none"],
  ["house", "no em dashes", m.emDash === 0, `${m.emDash}`],
  ["house", "no arrow glyphs", m.arrowGlyph === 0, `${m.arrowGlyph}`],
  ["house", "no leaked [[scene:...]] marker", !m.markerLeak, String(m.markerLeak)],
];

console.log(`\nFLAGSHIP READINESS — /blog/${slug}\n${"=".repeat(58)}`);
for (const [id, what, ok, detail] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${id.padEnd(6)} ${what.padEnd(46)} ${detail}`);
}

const failed = checks.filter((c) => !c[2]);
console.log(`\n${checks.length - failed.length}/${checks.length} mechanical checks pass.`);
console.log(
  [
    "",
    "NOT CHECKED HERE, and still required before shipping a topic. A human reads for these:",
    "  A1  original information, reporting or analysis, not a rewrite of what already ranks",
    "  A2  comprehensive: cost, setup, and the limits, not only the argument",
    "  A3  insight beyond the obvious",
    "  B3  demonstrated first-hand experience with the thing being described",
    "  E2  craft: whether it is actually beautiful on a phone and on a desktop",
  ].join("\n"),
);

if (failed.length) {
  console.error(`\nNOT READY: ${failed.length} mechanical check(s) failed.`);
  process.exit(1);
}
console.log("\nMechanically ready.");
