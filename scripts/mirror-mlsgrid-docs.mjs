// Mirror MLS Grid's OFFICIAL documentation (docs.mlsgrid.com) into the repo as markdown.
//
// WHY (owner's instruction, 2026-08-09): sessions repeatedly encoded vendor "facts" from
// memory — a 3-day misdiagnosis and an invented rate-limit calibration both trace to claims
// nobody could cite. This mirror makes the real docs greppable in-repo. A constraint about
// MLS Grid that cannot be cited to a file in docs/vendor/mlsgrid/ (or to a measured
// experiment) is a HYPOTHESIS and must be labelled as one.
//
// Usage: node scripts/mirror-mlsgrid-docs.mjs   (re-run any time to refresh; commits show drift)
// Zero MLS Grid API traffic — this reads only the public GitBook documentation site.

import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/vendor/mlsgrid";
const UA = { "User-Agent": "Mozilla/5.0 (docs mirror; realtylt-website)" };

const decode = (s) => s
  .replace(/&amp;/g, "&").replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d));

/** Crude HTML → markdown: good enough to read and grep; not a rendering engine. */
function toMarkdown(html) {
  let s = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  s = s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, c) => `\n\n\`\`\`\n${decode(c.replace(/<[^>]+>/g, ""))}\n\`\`\`\n\n`)
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, c) => `\n\n${"#".repeat(+n)} ${decode(c.replace(/<[^>]+>/g, "")).trim()}\n\n`)
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|tr|ul|ol|table|section)>/gi, "\n")
    .replace(/<(td|th)[^>]*>/gi, " | ")
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return decode(s)
    .split("\n").map((l) => l.replace(/[ \t]+/g, " ").trimEnd()).join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const sm = await (await fetch("https://docs.mlsgrid.com/sitemap-pages.xml", { headers: UA })).text();
const pages = [...sm.matchAll(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?(?:<lastmod>([^<]+)<\/lastmod>)?\s*<\/url>/g)]
  .map((m) => ({ url: m[1], lastmod: m[2] ?? "" }));
if (!pages.length) throw new Error("sitemap parse produced zero pages");

mkdirSync(OUT, { recursive: true });
const fetched = new Date().toISOString();
const index = [];
for (const { url, lastmod } of pages) {
  const slug = (new URL(url).pathname.replace(/^\/|\/$/g, "") || "home").replace(/\//g, "--");
  const res = await fetch(url, { headers: UA });
  if (!res.ok) { console.error(`SKIP ${url}: HTTP ${res.status}`); continue; }
  const md = toMarkdown(await res.text());
  const title = md.match(/^#{1,3} (.+)$/m)?.[1] ?? slug;
  writeFileSync(
    `${OUT}/${slug}.md`,
    `---\nsource: ${url}\nfetched: ${fetched}\nsitemap_lastmod: ${lastmod}\n---\n\n${md}\n`,
  );
  index.push(`- [${title}](${slug}.md) — [source](${url})${lastmod ? ` — upstream lastmod ${lastmod.slice(0, 10)}` : ""}`);
  console.log(`ok ${slug} (${md.length} chars)`);
  await new Promise((r) => setTimeout(r, 300)); // polite to their doc host
}
writeFileSync(`${OUT}/INDEX.md`, `# MLS Grid official docs — local mirror\n\nFetched ${fetched} by scripts/mirror-mlsgrid-docs.mjs. Re-run it to refresh; the diff shows upstream drift.\nRead README.md in this folder for the verified operational facts and their citations.\n\n${index.join("\n")}\n`);
console.log(`\nDONE — ${index.length}/${pages.length} pages mirrored to ${OUT}/`);
