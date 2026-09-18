// THE READABILITY GATE (final round, owner 2026-09-18): "a 10 year old can understand
// everything ... just make it simpler." The bar, as a committed scorer rather than a claim:
//
//   Flesch-Kincaid GRADE <= 6 on every surface's rendered prose, and
//   median sentence length <= 15 words,
//
// measured on what actually ships: the gate fetches each page from the dev server and scores
// the PROSE inside <main> (the <p> and <li> blocks - headings, buttons and chrome are not
// sentences and would flatter the average). Surfaces: every /blog/<slug>, every
// /services/<slug>, and the home page - the lists are collected from the rendered /blog and
// /services indexes so a new topic can never dodge the gate by not being hard-coded here.
//
// DOMAIN WHITELIST: the words the subject cannot avoid (AI, CRM, MLS, automation ...) are
// scored at a fixed two syllables so the metric pressures SENTENCES and STRUCTURE, not the
// vocabulary the reader came to learn. Each still must be explained in plain words at first
// use - that is the checker's job, not this formula's.
//
// Usage:
//   node scripts/readability-gate.mjs                     # gate: exit 1 if any surface fails
//   node scripts/readability-gate.mjs --report out.json   # also write the full per-surface JSON
//   node scripts/readability-gate.mjs --only /blog/x      # one surface, with the worst sentences
//   BASE=http://127.0.0.1:3100 (default; realtylt.com is bot-challenged - real browsers only)

import fs from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:3100";
const GRADE_MAX = 6;
const MEDIAN_MAX = 15;

/** Unavoidable domain vocabulary, scored flat at 2 syllables. Keep this list SHORT - every
 * entry is a word the rewrite is excused from, and the owner's bar is a ten year old. */
const WHITELIST = new Map(
  [
    "ai", "crm", "mls", "idx", "seo", "api", "sms", "faq", "llm", "gpt", "url", "pdf", "ocr",
    "automation", "automations", "automated", "automate", "automatically",
    "realtylt", "realtor", "realtors", "brokerage", "zillow", "supabase", "vercel",
    "listing", "listings", "database", "chatbot", "webhook", "email", "emails", "voicemail",
  ].map((w) => [w, 2]),
);

const dec = (s) =>
  s
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(rsquo|lsquo);/g, "'").replace(/&(rdquo|ldquo);/g, '"').replace(/&quot;/g, '"')
    .replace(/&middot;/g, "·").replace(/&reg;/g, "").replace(/&[a-z]+;/g, " ");

/** The prose of a page: <p> and <li> inside <main>, tags stripped.
 *
 * A LISTING CARD IS NOT PROSE. The home page's <li> blocks are live MLS cards ("20 W 53rd Street
 * #18 B/C, New York, $24,995,000 Pending ... 5 bd · 7 ba · 4,600 sqft Listed with ..."): data
 * that turns over with every hourly sync. Scored as sentences they decided the home page's median
 * on their own, and when the card link gained real anchor text for crawlers (2026-09-18) each
 * "sentence" grew six words and the page went 15w -> 16w with no copy change at all. A block that
 * links to a listing is a card and is left out. */
export function extractProse(html) {
  const main = html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0] ?? html;
  const noScript = main.replace(/<(script|style|noscript|svg)[\s>][\s\S]*?<\/\1>/gi, " ");
  const blocks = [...noScript.matchAll(/<(p|li)[\s>][\s\S]*?<\/\1>/gi)]
    .filter((m) => !/href="\/homes-for-sale\//.test(m[0]))
    .map((m) => dec(m[0].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim());
  return blocks.filter((b) => b.length > 0);
}

export function syllables(rawWord) {
  const w = rawWord.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (WHITELIST.has(w)) return WHITELIST.get(w);
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:ed|es|e)$/, "").replace(/^y/, "");
  const groups = stripped.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 1;
  if (/le$/.test(w) && !/[aeiou]le$/.test(w)) n += 1;
  return Math.max(1, n);
}

/** Sentences from prose blocks: split on ., ! or ? followed by space-or-end; a block with no
 * terminator is one sentence (a short <li> is a sentence to a reader). Fragments under three
 * words (labels, "Yes.", nav-like scraps) are dropped so they cannot flatter the average. */
export function sentencesOf(blocks) {
  const out = [];
  for (const b of blocks) {
    for (const s of b.split(/(?<=[.!?])\s+/)) {
      const words = s.trim().split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
      if (words.length >= 3) out.push({ text: s.trim(), words });
    }
  }
  return out;
}

export function score(blocks) {
  const sentences = sentencesOf(blocks);
  const words = sentences.flatMap((s) => s.words);
  if (sentences.length === 0 || words.length === 0) return null;
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  const asl = words.length / sentences.length;
  const asw = syl / words.length;
  const grade = 0.39 * asl + 11.8 * asw - 15.59;
  const lens = sentences.map((s) => s.words.length).sort((a, b) => a - b);
  const median = lens[Math.floor(lens.length / 2)];
  const worst = [...sentences].sort((a, b) => b.words.length - a.words.length).slice(0, 5)
    .map((s) => `${s.words.length}w: ${s.text.slice(0, 140)}`);
  return { grade: Math.round(grade * 10) / 10, median, sentences: sentences.length, words: words.length, longest: lens[lens.length - 1], worst };
}

async function page(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.text();
}

async function collectSurfaces() {
  const hrefs = new Set(["/"]);
  for (const index of ["/blog", "/services"]) {
    const html = await page(index);
    for (const m of html.matchAll(/href="(\/(?:blog|services)\/[a-z0-9-]+)"/g)) hrefs.add(m[1]);
  }
  return [...hrefs];
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("readability-gate.mjs");
if (isMain) {
  const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
  const reportPath = process.argv.includes("--report") ? process.argv[process.argv.indexOf("--report") + 1] : null;
  const surfaces = only ? [only] : await collectSurfaces();
  const rows = [];
  let failed = 0;
  for (const path of surfaces) {
    try {
      const s = score(extractProse(await page(path)));
      if (!s) { rows.push({ path, error: "no prose" }); continue; }
      const pass = s.grade <= GRADE_MAX && s.median <= MEDIAN_MAX;
      if (!pass) failed++;
      rows.push({ path, pass, ...s });
      console.log(`${pass ? "PASS" : "FAIL"}  ${path}  grade ${s.grade}  median ${s.median}w  (${s.sentences} sentences, longest ${s.longest}w)`);
      if (only) for (const w of s.worst) console.log("   worst:", w);
    } catch (e) {
      failed++;
      rows.push({ path, error: String(e).slice(0, 120) });
      console.log(`ERR   ${path}  ${String(e).slice(0, 100)}`);
    }
  }
  const passed = rows.filter((r) => r.pass).length;
  console.log(`\n${passed}/${rows.length} surfaces at grade <= ${GRADE_MAX} and median <= ${MEDIAN_MAX}w`);
  if (reportPath) {
    fs.writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), base: BASE, gradeMax: GRADE_MAX, medianMax: MEDIAN_MAX, rows }, null, 1));
    console.log("report:", reportPath);
  }
  process.exit(failed ? 1 : 0);
}
