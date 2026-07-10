// Download license-safe imagery (Openverse API → CC0/CC-BY photos) into public/images
// and record every source + license in public/images/ATTRIBUTIONS.md.
// Usage: node scripts/fetch-images.mjs
import fs from "node:fs";
import path from "node:path";

const UA = { "User-Agent": "realtylt-website-build/1.0 (levan@realtylt.com)", Accept: "application/json" };
const ROOT = path.resolve(import.meta.dirname, "..", "public", "images");

/** One Openverse search per group; `picks` = output files filled from distinct results, in order. */
const GROUPS = [
  { query: "hudson river sunset mountains", picks: ["hero/hudson-twilight.jpg"] },
  { query: "hudson valley aerial river", picks: ["hero/valley-aerial.jpg"] },
  { query: "walkway over the hudson poughkeepsie", picks: ["counties/dutchess.jpg"] },
  { query: "tarrytown lighthouse hudson river", picks: ["counties/westchester.jpg"] },
  { query: "cold spring new york hudson river", picks: ["counties/putnam.jpg"] },
  { query: "nyack new york hudson river", picks: ["counties/rockland.jpg"] },
  { query: "shawangunk ridge mohonk", picks: ["counties/ulster.jpg"] },
  { query: "storm king mountain hudson river", picks: ["counties/orange.jpg"] },
  { query: "family moving new home boxes", picks: ["lifestyle/buying.jpg"] },
  { query: "house front porch summer", picks: ["lifestyle/selling.jpg"] },
  { query: "house keys hand door", picks: ["lifestyle/financing.jpg"] },
  {
    query: "colonial house exterior",
    picks: ["listings/house-01.jpg", "listings/house-02.jpg", "listings/house-03.jpg"],
  },
  {
    query: "victorian house exterior",
    picks: ["listings/house-04.jpg", "listings/house-05.jpg", "listings/house-06.jpg"],
  },
  {
    query: "farmhouse exterior",
    picks: ["listings/house-07.jpg", "listings/house-08.jpg"],
  },
  {
    query: "suburban house exterior front yard",
    picks: ["listings/house-09.jpg", "listings/house-10.jpg", "listings/house-11.jpg"],
  },
  {
    query: "cottage house exterior garden",
    picks: ["listings/house-12.jpg", "listings/house-13.jpg"],
  },
  {
    query: "living room interior fireplace",
    picks: ["listings/house-14.jpg", "listings/house-15.jpg"],
  },
  {
    query: "kitchen interior home",
    picks: ["listings/house-16.jpg", "listings/house-17.jpg"],
  },
  { query: "house backyard deck", picks: ["listings/house-18.jpg"] },
];

const attributions = [];
const failures = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchOpenverse(query) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license=by,cc0&page_size=20&filter_dead=false`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  const j = await res.json();
  return j.results ?? [];
}

async function download(url, outFile) {
  const res = await fetch(url, { headers: { "User-Agent": UA["User-Agent"] } });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  // must be a real JPEG/PNG and non-trivial
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  if (buf.length < 30_000 || (!isJpeg && !isPng)) return false;
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  return true;
}

/** Try a larger Flickr size first (_h = 1600) before the default (_b = 1024). */
function candidates(result) {
  const u = result.url ?? "";
  const list = [];
  if (/live\.staticflickr\.com/.test(u) && /_b\.jpg$/.test(u)) list.push(u.replace(/_b\.jpg$/, "_h.jpg"));
  list.push(u);
  return list.filter(Boolean);
}

for (const group of GROUPS) {
  let results = [];
  try {
    results = await searchOpenverse(group.query);
  } catch (e) {
    console.error(`SEARCH FAIL "${group.query}": ${e.message}`);
  }
  const usable = results.filter(
    (r) => (r.width ?? 0) >= 900 && (r.height ?? 0) >= 600 && (r.width ?? 0) >= (r.height ?? 0) * 0.7,
  );
  let ri = 0;
  for (const pick of group.picks) {
    const outFile = path.join(ROOT, pick);
    let done = false;
    while (!done && ri < usable.length) {
      const r = usable[ri++];
      for (const url of candidates(r)) {
        if (await download(url, outFile)) {
          attributions.push({
            file: `public/images/${pick.replace(/\\/g, "/")}`,
            title: r.title ?? "Untitled",
            creator: r.creator ?? "Unknown",
            license: `${(r.license ?? "").toUpperCase()}${r.license_version ? " " + r.license_version : ""}`,
            sourceUrl: r.foreign_landing_url ?? r.url,
            fileUrl: url,
          });
          console.log(`OK  ${pick}  <- ${r.creator} (${r.license})`);
          done = true;
          break;
        }
      }
    }
    if (!done) {
      failures.push(pick);
      console.error(`MISS ${pick} (query "${group.query}")`);
    }
  }
  await sleep(800); // be polite to the API
}

// ATTRIBUTIONS.md
const md = [
  "# Image attributions",
  "",
  "All photos sourced via the [Openverse](https://openverse.org) catalog under CC0 or CC BY licenses.",
  "CC BY images require this attribution to remain with the project. Owner may replace any image",
  "with their own photography — update this file when swapping.",
  "",
  "| File | Title | Creator | License | Source |",
  "|---|---|---|---|---|",
  ...attributions.map(
    (a) => `| ${a.file} | ${a.title.replace(/\|/g, "/").slice(0, 60)} | ${a.creator.replace(/\|/g, "/")} | ${a.license} | [source](${a.sourceUrl}) |`,
  ),
  "",
].join("\n");
fs.mkdirSync(ROOT, { recursive: true });
fs.writeFileSync(path.join(ROOT, "ATTRIBUTIONS.md"), md);

console.log(`\nDownloaded ${attributions.length} images, ${failures.length} misses.`);
if (failures.length) console.log("Misses:", failures.join(", "));
