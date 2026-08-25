/** ROUND E — pull shortlisted candidates and stage them for judging at the real plate crop.
 *
 * STAGES OUTSIDE public/images ON PURPOSE. lib/images/attributions.test.ts fails on any file
 * under public/images that is not in ATTRIBUTIONS.md, so dropping twenty candidates there to
 * look at them would turn the test suite red for the length of the round. They land in
 * public/_ecand/, which the dev server serves and the licence test does not read; only the ones
 * that survive the crop get moved in and written into the ledger.
 *
 * Encoding matches scripts/compress-images.mjs, which is the repo's convention: max width 1920,
 * JPEG quality 72, mozjpeg. The shipped listings/house-*.jpg run 90KB to 390KB, so anything much
 * over 400KB is out of family and gets re-encoded harder.
 *
 * Usage: node scripts/fetch-plates.mjs <name>=<flickr photo page url> ...
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

sharp.cache(false);

const OUT = path.resolve(import.meta.dirname, "..", "public", "_ecand");
fs.mkdirSync(OUT, { recursive: true });

const UA = { "User-Agent": "realtylt-website-build/1.0 (levan@realtylt.com)" };

/** Flickr serves size suffixes off the same static host. Largest first: _k is 2048 on the long
 * edge, _h is 1600, _b is 1024. A miss answers 404 with a tiny body, so the size is discovered
 * rather than assumed. */
const SIZES = ["k", "h", "b"];

async function flickrDirect(pageUrl) {
  const res = await fetch(pageUrl, { headers: UA });
  if (!res.ok) return null;
  const html = await res.text();
  // The photo page carries a JSON blob of every size it has; the largest _<suffix> URL in it is
  // what we want. Matching on the static host keeps avatars and sprites out.
  const urls = [...html.matchAll(/https:\/\/live\.staticflickr\.com\/[0-9]+\/[0-9a-z_]+_[a-z]\.jpg/gi)].map(
    (m) => m[0],
  );
  if (!urls.length) return null;
  const base = urls[0].replace(/_[a-z]\.jpg$/i, "");
  return SIZES.map((s) => `${base}_${s}.jpg`);
}

if (process.argv.length <= 2) {
  console.log('usage: node scripts/fetch-plates.mjs <name>=<flickr photo page url> ...');
  console.log("  then: node scripts/plate-swatch.mjs <out.png> /_ecand/<name>.jpg ...");
  process.exit(1);
}

for (const arg of process.argv.slice(2)) {
  const [name, page] = arg.split("=");
  if (!name || !page) {
    console.log(`SKIP  bad argument: ${arg}`);
    continue;
  }
  const candidates = (await flickrDirect(page)) ?? [];
  let buf = null;
  let got = "";
  for (const u of candidates) {
    const r = await fetch(u, { headers: UA });
    if (!r.ok) continue;
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length < 40_000 || b[0] !== 0xff || b[1] !== 0xd8) continue;
    buf = b;
    got = u;
    break;
  }
  if (!buf) {
    console.log(`MISS  ${name}  ${page}`);
    continue;
  }
  const meta = await sharp(buf).metadata();
  const out = path.join(OUT, `${name}.jpg`);
  const enc = await sharp(buf)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(out, enc);
  const w = Math.min(meta.width ?? 0, 1920);
  const h = Math.round(((meta.height ?? 0) * w) / (meta.width || 1));
  console.log(
    `OK    ${name}  ${meta.width}x${meta.height} -> ${w}x${h}  ${Math.round(enc.length / 1024)}KB  ratio ${(w / h).toFixed(2)}  ${got.slice(-12)}`,
  );
}
