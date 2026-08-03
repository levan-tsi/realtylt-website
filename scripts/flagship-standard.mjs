/**
 * THE FLAGSHIP STANDARD — a floor the posts set for each other, and that only ever rises.
 *
 *   node scripts/flagship-standard.mjs            check every post against the standard
 *   node scripts/flagship-standard.mjs --measure  print the cohort table and stop
 *   node scripts/flagship-standard.mjs --ratchet  raise the standard to what the cohort now proves
 *
 * WHY THIS EXISTS. `score-flagship.mjs` is a checklist of ABSOLUTE floors — one citation, two
 * images, 1,200 words — and every post cleared it while drifting a long way apart. Measured
 * 2026-08-02: the chat post carried 1,034 words of prose and 3 citations, its four successors
 * carried ~2,900 and 5-7. All five scored 19/19. A floor nobody is near has stopped being a
 * standard.
 *
 * So this one is RELATIVE and MONOTONIC:
 *
 *   - Numeric metrics floor at the cohort MEDIAN. Not the maximum: a max floor forces the whole
 *     set to chase one outlier and rewards padding. The median pulls the laggard up, and as it
 *     rises the median rises with it, so the set converges upward on its own.
 *   - Boolean metrics floor at ANY. If one post proves a thing is worth doing — a working
 *     calculator, an explicit cost section, real money arithmetic — every post owes it. This is
 *     the "learn from each other" rule and it is the one that cannot be gamed.
 *   - `--ratchet` never lowers a bar. The standard is a high-water mark, committed to
 *     docs/blog-flagship/standard.json, so a weak round cannot quietly relax it.
 *
 * WHAT IT DELIBERATELY DOES NOT MEASURE. Storytelling, whether the money case persuades, whether
 * a business owner finishes it. Those are the point of the writing and a script that scored them
 * would be the build grading its own homework (see feedback in SCORECARD.md). They live in
 * docs/blog-flagship/STANDARD.md as prose, and they are judged by a human.
 *
 * THE HONEST WEAKNESS: word count is padding-gameable. It is here because a post a third the
 * length of its siblings is a real signal, not because long is good. Read the writing.
 */
import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "https://realtylt-website.vercel.app";
const MODE = process.argv.includes("--ratchet") ? "ratchet" : process.argv.includes("--measure") ? "measure" : "check";
const STANDARD_PATH = "docs/blog-flagship/standard.json";

/** The AI-service flagships. Consumer topics are deliberately out of scope. */
export const POSTS = [
  "ai-chat-assistant-real-estate-website",
  "ai-voice-agent-missed-calls-real-estate",
  "database-reactivation-old-real-estate-leads",
  "ai-lead-qualification-real-estate-scoring",
  "workflow-automation-real-estate-business",
];

/** Every metric is a FACT about the served page. `kind` decides how the floor is derived. */
const METRICS = [
  ["proseWords", "number", "words of real prose (paragraphs of 25+ words)"],
  ["sections", "number", "H2 sections"],
  ["citations", "number", "distinct external sources"],
  ["faqQuestions", "number", "questions in FAQPage schema"],
  ["bodyImages", "number", "images in the body"],
  ["dataGraphics", "number", "svg[role=img] data graphics"],
  ["hasCostSection", "boolean", "a section that names what it costs"],
  ["hasMoneyMath", "boolean", "an explicit dollar figure the reader can check"],
  ["hasCalculator", "boolean", "an interactive money calculator"],
  ["hasLimitsSection", "boolean", "a section on what it will NOT do"],
  ["hasHowToSection", "boolean", "a section the reader can act on themselves"],
];

async function measure(page, slug) {
  await page.goto(`${BASE}/blog/${slug}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1200);
  return page.evaluate(() => {
    const art = document.querySelector("#article-root") ?? document.body;
    const heads = [...art.querySelectorAll("h2")].map((h) => h.textContent.trim());
    const paras = [...art.querySelectorAll("p")]
      .map((p) => p.textContent.trim())
      .filter((t) => t.split(/\s+/).length >= 25);
    const text = art.textContent ?? "";
    const links = [...art.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "");
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => s.textContent ?? "")
      .join(" ");
    const anyHead = (re) => heads.some((h) => re.test(h));
    return {
      proseWords: paras.reduce((a, p) => a + p.split(/\s+/).length, 0),
      sections: heads.length,
      citations: [...new Set(links.filter((h) => /^https?:\/\//i.test(h)))].filter(
        (h) => !/realtylt|vercel\.app|schema\.org|twitter|facebook|linkedin/i.test(h),
      ).length,
      faqQuestions: (ld.match(/"@type"\s*:\s*"Question"/g) ?? []).length,
      bodyImages: art.querySelectorAll("img").length,
      dataGraphics: art.querySelectorAll("svg[role='img']").length,
      hasCostSection: anyHead(/cost|price|worth it|what you pay|invest/i),
      // A four-figure sum with a separator: the kind of number a reader can argue with.
      hasMoneyMath: /\$\s?\d{1,3},\d{3}/.test(text),
      hasCalculator: !!art.querySelector("input[type='range'], [data-calculator]"),
      hasLimitsSection: anyHead(/does not|will not|cannot|limits|not do/i),
      hasHowToSection: anyHead(/how to|find your own|what to do|do it yourself|your own version/i),
    };
  });
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.floor((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const rows = {};
for (const slug of POSTS) rows[slug] = await measure(page, slug);
await browser.close();

// ── the cohort table
const name = (s) => s.split("-").slice(0, 2).join("-").padEnd(22);
console.log("\nCOHORT");
console.log("post".padEnd(22) + METRICS.map(([k]) => k.slice(0, 13).padStart(14)).join(""));
for (const slug of POSTS) {
  console.log(name(slug) + METRICS.map(([k, kind]) =>
    (kind === "boolean" ? (rows[slug][k] ? "yes" : "—") : String(rows[slug][k])).padStart(14)).join(""));
}

// ── what the cohort currently proves is achievable
const proven = {};
for (const [k, kind] of METRICS) {
  const vals = POSTS.map((s) => rows[s][k]);
  proven[k] = kind === "boolean" ? vals.some(Boolean) : median(vals);
}

const prev = existsSync(STANDARD_PATH) ? JSON.parse(readFileSync(STANDARD_PATH, "utf8")) : { metrics: {} };
// Monotonic: the bar is the higher of what was already required and what the cohort now proves.
const standard = {};
for (const [k, kind] of METRICS) {
  const before = prev.metrics?.[k];
  standard[k] = kind === "boolean"
    ? Boolean(before) || proven[k]
    : Math.max(Number(before ?? 0), proven[k]);
}

console.log("\nSTANDARD  (numbers = cohort median, booleans = any post proves it, never lowered)");
console.log("".padEnd(22) + METRICS.map(([k]) => k.slice(0, 13).padStart(14)).join(""));
console.log("required".padEnd(22) + METRICS.map(([k, kind]) =>
  (kind === "boolean" ? (standard[k] ? "yes" : "—") : String(standard[k])).padStart(14)).join(""));

if (MODE === "ratchet") {
  const raised = METRICS.filter(([k]) => String(prev.metrics?.[k]) !== String(standard[k]));
  writeFileSync(STANDARD_PATH, JSON.stringify({
    note: "Derived by scripts/flagship-standard.mjs --ratchet. Monotonic: never lowered by hand.",
    // LOCAL date, not the ISO one: this machine is UTC-4, so after 20:00 `toISOString()` stamps
    // tomorrow. A standard that claims to have been raised on a day that has not happened yet is
    // a small lie in a file whose whole job is to be trusted.
    updated: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    metrics: standard,
  }, null, 2) + "\n");
  console.log(`\nratcheted ${raised.length} metric(s) -> ${STANDARD_PATH}`);
  raised.forEach(([k]) => console.log(`  ${k}: ${prev.metrics?.[k] ?? "—"} -> ${standard[k]}`));
  process.exit(0);
}
if (MODE === "measure") process.exit(0);

// ── check
let fails = 0;
console.log("\nGAP  (what each post owes the standard)");
for (const slug of POSTS) {
  const short = METRICS.filter(([k, kind]) =>
    kind === "boolean" ? standard[k] && !rows[slug][k] : rows[slug][k] < standard[k]);
  if (!short.length) { console.log(`  ok    ${name(slug)}`); continue; }
  fails++;
  console.log(`  SHORT ${name(slug)}`);
  for (const [k, kind, label] of short) {
    const want = kind === "boolean" ? "yes" : standard[k];
    const got = kind === "boolean" ? "missing" : rows[slug][k];
    console.log(`          ${k.padEnd(16)} needs ${String(want).padEnd(6)} has ${String(got).padEnd(6)} — ${label}`);
  }
}
console.log(fails ? `\n${fails} of ${POSTS.length} posts are below the standard.` : `\nall ${POSTS.length} posts meet the standard.`);
process.exit(fails ? 1 : 0);
