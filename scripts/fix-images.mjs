// Replace weak/wrong images found in the contact-sheet review. Tries queries in order,
// prefers titles matching `want`, skips results already used elsewhere.
import fs from "node:fs";
import path from "node:path";

const UA = { "User-Agent": "realtylt-website-build/1.0 (levan@realtylt.com)", Accept: "application/json" };
const ROOT = path.resolve(import.meta.dirname, "..", "public", "images");

const override = fs.existsSync(".fix-slots.json")
  ? JSON.parse(fs.readFileSync(".fix-slots.json", "utf8")).map((s) => ({ ...s, want: new RegExp(s.want, "i") }))
  : null;

const SLOTS = override ?? [
  { file: "hero/valley-aerial.jpg", queries: ["hudson highlands breakneck ridge", "hudson river valley view mountains"], want: /hudson|highlands|storm king|breakneck/i },
  { file: "counties/rockland.jpg", queries: ["hook mountain nyack hudson", "piermont pier hudson river", "harriman state park lake"], want: /hook|nyack|piermont|harriman|hudson|lake/i },
  { file: "counties/ulster.jpg", queries: ["minnewaska state park lake", "ashokan reservoir catskills", "kingston rondout lighthouse"], want: /minnewaska|ashokan|gunks|catskill|kingston|lake/i },
  { file: "lifestyle/buying.jpg", queries: ["moving day boxes truck", "sold sign real estate"], want: /mov|box|sold|home|house/i },
  { file: "lifestyle/selling.jpg", queries: ["american house front lawn", "house for sale sign"], want: /house|home|sale/i },
  { file: "lifestyle/financing.jpg", queries: ["calculating finances desk calculator", "signing contract paperwork"], want: /calc|financ|money|sign|contract|paper/i },
  { file: "listings/house-01.jpg", queries: ["brick colonial house front", "two story house exterior lawn"], want: /house|home|colonial/i },
  { file: "listings/house-02.jpg", queries: ["white house black shutters exterior", "house front yard america"], want: /house|home/i },
  { file: "listings/house-03.jpg", queries: ["cape cod style house", "small house exterior yard"], want: /house|home|cape/i },
  { file: "listings/house-08.jpg", queries: ["stone farmhouse exterior", "old stone house new york"], want: /house|stone/i },
  { file: "listings/house-12.jpg", queries: ["bungalow exterior street", "craftsman house exterior"], want: /house|bungalow|craftsman/i },
  { file: "listings/house-13.jpg", queries: ["front porch house columns", "house wraparound porch"], want: /porch|house|home/i },
  { file: "listings/house-15.jpg", queries: ["cozy bedroom interior", "bedroom home interior design"], want: /bedroom|room|interior/i },
  { file: "listings/house-16.jpg", queries: ["kitchen island granite", "renovated kitchen interior"], want: /kitchen/i },
  { file: "listings/house-18.jpg", queries: ["dining room table interior", "sunroom interior house"], want: /dining|sunroom|room|interior/i },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const used = new Set();
const attribution = [];

async function search(q) {
  const res = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=by,cc0&page_size=20&filter_dead=false`,
    { headers: UA },
  );
  if (!res.ok) return [];
  return (await res.json()).results ?? [];
}

async function grab(url, outFile) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA["User-Agent"] } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 30_000 || !(buf[0] === 0xff || buf[0] === 0x89)) return false;
    fs.writeFileSync(outFile, buf);
    return true;
  } catch {
    return false;
  }
}

for (const slot of SLOTS) {
  let done = false;
  for (const q of slot.queries) {
    if (done) break;
    const results = (await search(q)).filter(
      (r) => (r.width ?? 0) >= 900 && (r.height ?? 0) >= 600 && (r.width ?? 0) >= (r.height ?? 0) * 0.7 && !used.has(r.id),
    );
    const ranked = [...results.filter((r) => slot.want.test(r.title ?? "")), ...results];
    for (const r of ranked) {
      const big = /live\.staticflickr\.com/.test(r.url) && /_b\.jpg$/.test(r.url) ? r.url.replace(/_b\.jpg$/, "_h.jpg") : null;
      for (const u of [big, r.url].filter(Boolean)) {
        if (await grab(u, path.join(ROOT, slot.file))) {
          used.add(r.id);
          attribution.push(`| public/images/${slot.file} | ${(r.title ?? "Untitled").replace(/\|/g, "/").slice(0, 60)} | ${(r.creator ?? "Unknown").replace(/\|/g, "/")} | ${(r.license ?? "").toUpperCase()}${r.license_version ? " " + r.license_version : ""} | [source](${r.foreign_landing_url ?? r.url}) |`);
          console.log(`OK  ${slot.file}  <- "${(r.title ?? "").slice(0, 40)}" by ${r.creator} (q: ${q})`);
          done = true;
          break;
        }
      }
      if (done) break;
    }
    await sleep(800);
  }
  if (!done) console.error(`MISS ${slot.file}`);
}

// Rewrite ATTRIBUTIONS.md rows for replaced files
const attrPath = path.join(ROOT, "ATTRIBUTIONS.md");
let md = fs.readFileSync(attrPath, "utf8");
for (const line of attribution) {
  const file = line.split("|")[1].trim();
  const re = new RegExp(`^\\| ${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\|.*$`, "m");
  md = re.test(md) ? md.replace(re, line) : md.trimEnd() + "\n" + line + "\n";
}
fs.writeFileSync(attrPath, md);
console.log(`\nReplaced ${attribution.length}/${SLOTS.length}`);
