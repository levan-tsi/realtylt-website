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
  "ai-scheduling-real-estate-showing-confirmations",
  "invoicing-and-payments-real-estate-brokerage",
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
  // There is deliberately NO "must contain a dollar figure" check. Owner, 2026-08-02: "it should
  // not be always exactly the dollar amount if possible... we can show how much time they would
  // save and they can calculate themselves with hourly $ value". Demanding a $ number is pressure
  // to invent one, and it would break the reactivation post specifically, which cites no response
  // rates BECAUSE no independent study exists.
  //
  // A "quantified stake" check was written and then removed: measured across the cohort, ALL FIVE
  // posts already quantify — chat in dollars ($6,000), voice in hours (42), workflow and
  // qualification in shares (57%, 77.2%, 15%, 43%). A gate everyone passes measures nothing.
  // What actually separates them is whether the reader can put THEIR OWN numbers in, which is
  // exactly the calculator below. The unit is the post's choice; the instrument is not.
  ["hasCalculator", "boolean", "an interactive calculator in the reader's own numbers (money OR time)"],
  ["hasLimitsSection", "boolean", "a section on what it will NOT do"],
  ["hasHowToSection", "boolean", "a section the reader can act on themselves"],
  // Lower is better. Owner: "not to repeat same things and details, all blogs should be unique to
  // their service". Counts 7-word phrases this post shares with its most similar sibling, MINUS
  // anything common to all five — a phrase in every post is chrome (author block, footer, lead
  // form) and is supposed to be identical. What is left is topic bleed.
  ["siblingOverlap", "max", "7-word phrases shared with the nearest sibling (chrome excluded)"],
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
      hasCalculator: !!art.querySelector("input[type='range'], [data-calculator]"),
      hasLimitsSection: anyHead(/does not|will not|cannot|limits|not do/i),
      hasHowToSection: anyHead(/how to|find your own|what to do|do it yourself|your own version/i),
      // Raw material for the sibling-overlap metric, computed across the cohort below.
      //
      // The ARTICLE'S OWN PROSE only: paragraphs that are not inside a scene. A scene is a
      // full-bleed <section>, so this drops film captions, chart source lines and chart
      // caveats, and keeps the writing.
      //
      // That distinction is not tidiness, it is the difference between measuring the right
      // thing and the wrong one. Measured 2026-08-02 on the reactivation/qualification pair,
      // which sat at 74 against a 71 ceiling: essentially the whole 74 was apparatus. About
      // twenty of the shared phrases were the two posts describing the SAME NAR survey in the
      // same words ("survey mailed to 167,750 recent buyers, 5,390 responses"), which is a
      // citation basis line and is supposed to be identical; rewording one of them to pass a
      // metric would be falsifying a source description. Another fifteen were the film
      // caption's standing disclosure that the narration is a licensed clone of the owner's
      // voice, which is a disclosure and belongs in every film. Those phrases escaped the
      // chrome filter only because it requires a phrase in ALL FIVE posts and these are in
      // two and four respectively.
      //
      // What is left after the change is prose the author chose, which is what the owner
      // actually objected to: "not to repeat same things and details".
      // Shingled PER PARAGRAPH, never across the joined text. Joining first manufactures
      // phrases nobody wrote out of the seam between two paragraphs, and those seams are where
      // the chrome is: measured 2026-08-03, three of the four phrases voice and qualification
      // still "shared" were windows straddling the end of the last body paragraph and the start
      // of the identical author bio ("at all i run realtylt in the hudson"). The bio is in all
      // five and is correctly excluded as chrome; only the seam survived, because the words
      // before it differ. A phrase that spans a paragraph break is an artifact of the ruler.
      shingles: (() => {
        const out = new Set();
        for (const p of art.querySelectorAll("p")) {
          if (p.closest("section")) continue;
          const t = p.textContent.trim();
          if (t.split(/\s+/).length < 25) continue;
          const w = t.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim().split(" ");
          for (let i = 0; i + 7 <= w.length; i++) out.add(w.slice(i, i + 7).join(" "));
        }
        return [...out];
      })(),
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

// ── sibling overlap. A phrase present in EVERY post is chrome (author block, footer, lead form)
// and is supposed to be identical, so it is subtracted first. What survives is topic bleed, and
// each post is scored against its most similar sibling rather than the average — the pair that
// reads as a template is the one that matters.
{
  const sets = Object.fromEntries(POSTS.map((s) => [s, new Set(rows[s].shingles)]));
  const chrome = new Set([...sets[POSTS[0]]].filter((p) => POSTS.every((s) => sets[s].has(p))));
  for (const a of POSTS) {
    let worst = 0;
    for (const b of POSTS) {
      if (a === b) continue;
      const shared = [...sets[a]].filter((p) => sets[b].has(p) && !chrome.has(p)).length;
      if (shared > worst) worst = shared;
    }
    rows[a].siblingOverlap = worst;
    delete rows[a].shingles;
  }
  console.log(`(${chrome.size} boilerplate phrases common to all five were excluded as chrome)`);
}

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

/** The point below which siblingOverlap stops measuring sameness and starts measuring the English
 * language. Two 3,300-word articles about adjacent parts of one industry will share domain
 * phrases by coincidence, and driving that to zero does not make the writing more distinct, it
 * makes it worse.
 *
 * MEASURED, not guessed. On 2026-08-03 the bar reached 0 and the single phrase keeping
 * reactivation and qualification at 1 was "they have a house to sell and" — which is simply how
 * an agent describes a seller-side lead, and which appears in four of the five content files
 * because it is the vocabulary of the business. The honest edit was to vary one of the two
 * sentences; the dishonest one would have been to keep going, and a ceiling of 0 demands exactly
 * that, forever, on every future round.
 *
 * So the RATCHET is clamped here. The check is not: a post above the recorded bar still fails.
 * This only stops the bar itself being recorded somewhere unreachable. Raising this number is
 * relaxing the standard and needs the same evidence this comment carries. */
const OVERLAP_NOISE_FLOOR = 2;

const prev = existsSync(STANDARD_PATH) ? JSON.parse(readFileSync(STANDARD_PATH, "utf8")) : { metrics: {} };
// Monotonic in the direction that means BETTER. `number` bars only rise; a `max` bar (overlap,
// where less is better) only tightens. Either way a weak round cannot relax the standard.
const raised = {};
for (const [k, kind] of METRICS) {
  const before = prev.metrics?.[k];
  if (kind === "boolean") raised[k] = Boolean(before) || proven[k];
  else if (kind === "max") {
    const floor = k === "siblingOverlap" ? OVERLAP_NOISE_FLOOR : 0;
    raised[k] = Math.max(floor, Math.min(Number(before ?? Infinity), proven[k]));
  } else raised[k] = Math.max(Number(before ?? 0), proven[k]);
}

// WHAT THE CHECK MEASURES AGAINST, and why it is the RECORDED bar rather than the live median.
//
// Both were the live median until 2026-08-02, and that made a green run arithmetically
// impossible. Sort five posts a<=b<=c<=d<=e; the median is c; "every post >= the median" requires
// a >= c, which requires a == b == c. So the two weakest posts were reported SHORT forever, on
// every numeric metric, however good they got. The bar moved every time anybody improved
// anything, and the round it moved fastest was the round the most work had been done.
//
// The fix keeps the ratchet and drops the moving target: `--ratchet` is the moment the bar rises
// to what the cohort has proved, and `check` measures against that recorded bar. Nothing is
// relaxed, because the recorded value is still monotonic and still derived from the cohort's own
// median. It just holds still long enough to be reached.
const standard = {};
for (const [k] of METRICS) standard[k] = prev.metrics?.[k] ?? raised[k];

const show = (o) => METRICS.map(([k, kind]) =>
  (kind === "boolean" ? (o[k] ? "yes" : "—") : String(o[k])).padStart(14)).join("");
console.log("\nSTANDARD  (the recorded bar. --ratchet raises it to what the cohort proves)");
console.log("".padEnd(22) + METRICS.map(([k]) => k.slice(0, 13).padStart(14)).join(""));
console.log("required".padEnd(22) + show(standard));
const pending = METRICS.filter(([k]) => String(raised[k]) !== String(standard[k]));
if (pending.length && MODE !== "ratchet") {
  console.log("available".padEnd(22) + show(raised) + "   <- --ratchet");
}

if (MODE === "ratchet") {
  // `raised`, not `standard`: standard is the bar as recorded, and ratcheting is precisely the
  // act of replacing it with what the cohort has since proved.
  const moved = METRICS.filter(([k]) => String(prev.metrics?.[k]) !== String(raised[k]));
  writeFileSync(STANDARD_PATH, JSON.stringify({
    note: "Derived by scripts/flagship-standard.mjs --ratchet. Monotonic: never lowered by hand.",
    // LOCAL date, not the ISO one: this machine is UTC-4, so after 20:00 `toISOString()` stamps
    // tomorrow. A standard that claims to have been raised on a day that has not happened yet is
    // a small lie in a file whose whole job is to be trusted.
    updated: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    metrics: raised,
  }, null, 2) + "\n");
  console.log(`\nratcheted ${moved.length} metric(s) -> ${STANDARD_PATH}`);
  moved.forEach(([k]) => console.log(`  ${k}: ${prev.metrics?.[k] ?? "—"} -> ${raised[k]}`));
  process.exit(0);
}
if (MODE === "measure") process.exit(0);

// ── check
let fails = 0;
console.log("\nGAP  (what each post owes the standard)");
for (const slug of POSTS) {
  const short = METRICS.filter(([k, kind]) =>
    kind === "boolean" ? standard[k] && !rows[slug][k]
    : kind === "max" ? rows[slug][k] > standard[k]
    : rows[slug][k] < standard[k]);
  if (!short.length) { console.log(`  ok    ${name(slug)}`); continue; }
  fails++;
  console.log(`  SHORT ${name(slug)}`);
  for (const [k, kind, label] of short) {
    const want = kind === "boolean" ? "yes" : kind === "max" ? `<=${standard[k]}` : standard[k];
    const got = kind === "boolean" ? "missing" : rows[slug][k];
    console.log(`          ${k.padEnd(18)} needs ${String(want).padEnd(7)} has ${String(got).padEnd(6)} — ${label}`);
  }
}
console.log(fails ? `\n${fails} of ${POSTS.length} posts are below the standard.` : `\nall ${POSTS.length} posts meet the standard.`);
process.exit(fails ? 1 : 0);
