// THE REWRITE INVARIANTS (final round, owner 2026-09-18): "don't lose the idea and what we're
// trying to say and the story and everything. Just make it simpler."
//
// readability-gate.mjs proves the prose got SIMPLER. This proves the simplification did not
// eat the page. It compares what ships now against a snapshot taken BEFORE the first rewrite
// commit (docs/parity/REWRITE-INVARIANTS-BEFORE-20260918.json, HEAD 6eab055), per surface:
//
//   links     every href inside <main> survives, none appear (citations are the E-E-A-T asset
//             and the internal links are the SEO lap's raw material)
//   numbers   every numeric token survives (no fact lost) and none appear (no invented number).
//             <time> and the reading-time chip are excluded: `updated` dates are SUPPOSED to move.
//   quotes    every quoted passage of 4+ words and every <blockquote> survives verbatim
//             ("quotes are sacred: verbatim or gone" - a dropped quote is reported, a BENT one
//             cannot pass)
//   headings  h1-h4 text is identical, in order (anchors, TOC, keywords)
//   emdash    zero em dashes in visitor copy
//   length    words after/before within [0.85, 1.25] - splitting sentences adds a few words;
//             a page that shrank by a fifth lost something
//
// WHAT IT CANNOT SEE: a statute reproduced WITHOUT quote marks, a softened caveat, a claim that
// became slightly more confident when it got shorter. Those are the full-text checker's job and
// the orchestrator's spot-read. This script is the floor, not the verdict.
//
// Usage:
//   node scripts/rewrite-invariants.mjs                    # all surfaces vs the committed BEFORE
//   node scripts/rewrite-invariants.mjs --only /blog/x     # one surface, full diff lists
//   node scripts/rewrite-invariants.mjs --snapshot out.json [--from-dir dir]
//        write a snapshot (from the dev server, or from saved <main> html files named like
//        blog__slug.html / services__slug.html / home.html)
//   ALLOW: docs/parity/REWRITE-INVARIANTS-ALLOW.json = { "<path>": { "numbers+": [], "numbers-": [],
//        "quotes-": [], "links+": [], "links-": [], "headings": true, "why": "..." } }
//        every entry is an adjudicated exception with its reason - never a silent pass.

import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE || "http://127.0.0.1:3100";
const BEFORE_PATH = "docs/parity/REWRITE-INVARIANTS-BEFORE-20260918.json";
const ALLOW_PATH = "docs/parity/REWRITE-INVARIANTS-ALLOW.json";
const LEN_MIN = 0.85;
const LEN_MAX = 1.25;

const dec = (s) =>
  s
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;|&quot;/g, '"')
    .replace(/&middot;/g, "·").replace(/&[a-z]+;/g, " ");

const squash = (s) => s.replace(/\s+/g, " ").trim();
const textOf = (html) => squash(dec(html.replace(/<[^>]+>/g, " ")));

export function mainOf(html) {
  return html.match(/<main[\s>][\s\S]*?<\/main>/i)?.[0] ?? html;
}

/** The invariants of one rendered <main>. Pure: html in, plain data out. */
export function invariantsOf(mainHtml) {
  const clean = mainHtml.replace(/<(script|style|noscript|svg)[\s>][\s\S]*?<\/\1>/gi, " ");
  const links = [...clean.matchAll(/<a\s[^>]*?href="([^"]+)"/gi)].map((m) => dec(m[1])).sort();
  const headings = [...clean.matchAll(/<(h[1-4])[\s>][\s\S]*?<\/\1>/gi)].map((m) => textOf(m[0]));
  const blockquotes = [...clean.matchAll(/<blockquote[\s>][\s\S]*?<\/blockquote>/gi)].map((m) => textOf(m[0]));

  // Dates and the reading-time chip move on purpose; keep them out of the number ledger.
  const noTime = clean.replace(/<time[\s>][\s\S]*?<\/time>/gi, " ");
  const text = textOf(noTime).replace(/\b\d+\s+min(?:ute)?\s+read\b/gi, " ");

  const numbers = [...new Set(
    [...text.matchAll(/\$?\d[\d,]*(?:\.\d+)?%?/g)].map((m) => m[0].replace(/[,.]+$/, "")),
  )].sort();

  const quoted = [];
  for (const m of text.matchAll(/["“]([^"“”]{12,600}?)["”]/g)) {
    const q = squash(m[1]);
    if (q.split(" ").length >= 4) quoted.push(q);
  }
  const quotes = [...new Set([...blockquotes, ...quoted])];
  const emdash = (text.match(/—/g) || []).length;
  const words = text.split(" ").filter((w) => /[a-z0-9]/i.test(w)).length;
  return { links, headings, numbers, quotes, emdash, words, text };
}

const minus = (a, b) => { const s = new Set(b); return a.filter((x) => !s.has(x)); };

/** Compare AFTER against BEFORE. Returns the list of violations (empty = clean). */
export function compare(before, after, allow = {}) {
  const v = [];
  const ok = (key, item) => (allow[key] || []).includes(item);
  for (const l of minus(before.links, after.links)) if (!ok("links-", l)) v.push(`link LOST: ${l}`);
  for (const l of minus(after.links, before.links)) if (!ok("links+", l)) v.push(`link ADDED: ${l}`);
  for (const n of minus(before.numbers, after.numbers)) if (!ok("numbers-", n)) v.push(`number LOST: ${n}`);
  for (const n of minus(after.numbers, before.numbers)) if (!ok("numbers+", n)) v.push(`number ADDED: ${n}`);
  for (const q of before.quotes) {
    if (!after.text.includes(q) && !ok("quotes-", q)) v.push(`quote BENT or LOST: "${q.slice(0, 110)}${q.length > 110 ? "..." : ""}"`);
  }
  if (!allow.headings) {
    const a = after.headings.join(" | "), b = before.headings.join(" | ");
    if (a !== b) {
      for (const h of minus(before.headings, after.headings)) v.push(`heading LOST/CHANGED: ${h}`);
      for (const h of minus(after.headings, before.headings)) v.push(`heading NEW: ${h}`);
      if (minus(before.headings, after.headings).length === 0 && minus(after.headings, before.headings).length === 0) v.push("heading ORDER changed");
    }
  }
  if (after.emdash > 0) v.push(`em dashes: ${after.emdash}`);
  const ratio = after.words / before.words;
  if (ratio < LEN_MIN || ratio > LEN_MAX) v.push(`length ratio ${ratio.toFixed(2)} outside [${LEN_MIN}, ${LEN_MAX}] (${before.words} -> ${after.words} words)`);
  return v;
}

/** A snapshot keeps the ledgers, not the page: `text` is only ever needed on the AFTER side. */
const slim = ({ text, ...inv }) => inv;
const fileFor = (p) => (p === "/" ? "home" : p.slice(1).replace(/\//g, "__")) + ".html";
const pathFor = (f) => (f === "home.html" ? "/" : "/" + f.replace(/\.html$/, "").replace(/__/g, "/"));

async function page(p) {
  const res = await fetch(`${BASE}${p}`, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${p} -> ${res.status}`);
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

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("rewrite-invariants.mjs");
if (isMain) {
  const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
  const snapshotOut = arg("--snapshot");
  const fromDir = arg("--from-dir");
  const only = arg("--only");

  if (snapshotOut) {
    const surfaces = {};
    if (fromDir) {
      for (const f of fs.readdirSync(fromDir).filter((x) => x.endsWith(".html"))) {
        surfaces[pathFor(f)] = slim(invariantsOf(fs.readFileSync(path.join(fromDir, f), "utf8")));
      }
    } else {
      for (const p of await collectSurfaces()) surfaces[p] = slim(invariantsOf(mainOf(await page(p))));
    }
    fs.writeFileSync(snapshotOut, JSON.stringify({ at: new Date().toISOString(), surfaces }, null, 0));
    console.log(`snapshot: ${Object.keys(surfaces).length} surfaces -> ${snapshotOut}`);
    process.exit(0);
  }

  const before = JSON.parse(fs.readFileSync(BEFORE_PATH, "utf8")).surfaces;
  const allowAll = fs.existsSync(ALLOW_PATH) ? JSON.parse(fs.readFileSync(ALLOW_PATH, "utf8")) : {};
  const surfaces = only ? [only] : Object.keys(before);
  let failed = 0;
  for (const p of surfaces) {
    // A surface the snapshot has never seen is a FAIL, not a skip: a gate that counts "could
    // not check" as a pass is lying (git-bash mangles a leading-slash arg: MSYS_NO_PATHCONV=1).
    if (!before[p]) { failed++; console.log(`ERR   ${p}  not in the BEFORE snapshot`); continue; }
    try {
      const after = invariantsOf(mainOf(await page(p)));
      const v = compare(before[p], after, allowAll[p] || {});
      const ratio = (after.words / before[p].words).toFixed(2);
      if (v.length) failed++;
      console.log(`${v.length ? "FAIL" : "PASS"}  ${p}  (${before[p].words} -> ${after.words} words, x${ratio}${v.length ? `, ${v.length} violations` : ""})`);
      for (const line of only ? v : v.slice(0, 6)) console.log("   ", line);
      if (!only && v.length > 6) console.log(`    ... ${v.length - 6} more (--only ${p})`);
    } catch (e) {
      failed++;
      console.log(`ERR   ${p}  ${String(e).slice(0, 100)}`);
    }
  }
  console.log(`\n${surfaces.length - failed}/${surfaces.length} surfaces keep their links, numbers, quotes, headings and length`);
  process.exit(failed ? 1 : 0);
}
