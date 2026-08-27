/** The phone floating "On this page" pill, measured on every flagship post. PER POST.
 *
 * WHY. The owner reported on 2026-08-26 that the pill was misaligned on phones. It was: on all
 * twenty flagship posts it sat at centre 161 against a viewport centre of 195 at 390 DPR3,
 * because `components/blog/FlagshipToc.tsx` dodged the chat launcher by moving the pill left
 * instead of by capping its width. The unit guard for the CLASS is components/toc-centering.
 * test.ts; this is the guard for the RENDERED RESULT, which is the thing the owner actually saw.
 *
 * Per post rather than one representative page on purpose: the offset came from a class that is
 * identical on every post, but the WIDTH that decides whether a centred pill still clears the
 * launcher is per post, because it is set by that post's longest scene label. One page passing
 * proves nothing about the other nineteen.
 *
 * Fails on: a pill missing, off the viewport centre by more than 2px, overlapping the chat
 * launcher, or a page that overflows horizontally while the pill is up.
 *
 * Usage: node scripts/toc-align-probe.mjs [baseUrl]   (default http://127.0.0.1:3100)
 * MLS: routes **\/api\/media\/** are blocked and **\/api\/lead is stubbed, per repo law. */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3100";
const ROOT = process.cwd();

/** Flagship slugs, read from the post registry so this cannot drift when topic 21 lands. */
function flagshipSlugs() {
  const src = fs.readFileSync(path.join(ROOT, "content/blog/posts.ts"), "utf8");
  const out = [];
  // Each post is an object literal; a flagship one carries a `flagship:` key.
  for (const block of src.split(/\n  \{\n/).slice(1)) {
    const slug = block.match(/slug:\s*"([^"]+)"/);
    if (slug && /\n\s*flagship:\s*\w/.test(block)) out.push(slug[1]);
  }
  return out;
}

const SLUGS = flagshipSlugs();
if (SLUGS.length < 20) {
  console.error(`FAIL: expected at least 20 flagship slugs from posts.ts, parsed ${SLUGS.length}.`);
  process.exit(1);
}

const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await ctx.route("**/api/lead", (r) =>
  r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }),
);
await ctx.route("**/api/media/**", (r) => r.abort());

const fails = [];
console.log(`toc-align-probe @390 DPR3 — ${SLUGS.length} flagship posts\n`);
console.log("slug".padEnd(54) + "cx".padStart(5) + "delta".padStart(7) + "gap".padStart(7) + "  verdict");

for (const slug of SLUGS) {
  const p = await ctx.newPage();
  let m;
  try {
    await p.goto(`${BASE}/blog/${slug}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.waitForSelector("h1", { timeout: 30000 });
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
    await p.waitForTimeout(1800);
    m = await p.evaluate(() => {
      const de = document.documentElement;
      const t = document.querySelector("[data-toc-trigger]");
      if (!t) return { missing: true };
      const r = t.getBoundingClientRect();
      const bub = document.querySelector(".rlt-bubble");
      const br = bub ? bub.getBoundingClientRect() : null;
      return {
        cx: Math.round(r.x + r.width / 2),
        vc: Math.round(de.clientWidth / 2),
        gap: br ? Math.round(br.left - r.right) : null,
        overlap: br
          ? !(r.right <= br.left || r.left >= br.right || r.bottom <= br.top || r.top >= br.bottom)
          : false,
        overflow: de.scrollWidth > de.clientWidth + 1,
      };
    });
  } catch (e) {
    m = { error: String(e).slice(0, 90) };
  }
  await p.close();

  const why = [];
  if (m.error) why.push("error " + m.error);
  else if (m.missing) why.push("no pill rendered");
  else {
    if (Math.abs(m.cx - m.vc) > 2) why.push(`off centre by ${m.cx - m.vc}px`);
    if (m.overlap) why.push("overlaps the chat launcher");
    if (m.overflow) why.push("page overflows horizontally");
  }
  if (why.length) fails.push(`${slug}: ${why.join("; ")}`);
  console.log(
    slug.padEnd(54) +
      String(m.cx ?? "-").padStart(5) +
      String(m.cx != null ? m.cx - m.vc : "-").padStart(7) +
      String(m.overlap ? "OVER" : (m.gap ?? "-")).padStart(7) +
      "  " +
      (why.length ? "FAIL " + why.join("; ") : "ok"),
  );
}
await b.close();

console.log(`\n${SLUGS.length - fails.length}/${SLUGS.length} posts centred and clear of the launcher.`);
if (fails.length) {
  console.error("\nFAILURES:");
  for (const f of fails) console.error("  " + f);
  process.exit(1);
}
