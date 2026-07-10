// One-shot maintenance: re-encode every public/images file >400KB in place
// (max width 1920, JPEG quality 72). Requires sharp: `npm i -D sharp`, run
// `node scripts/compress-images.mjs`, then `npm remove sharp`.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// sharp holds input file handles open by default, which blocks the in-place
// rewrite on Windows — disable its file cache.
sharp.cache(false);

const ROOT = 'public/images';
const LIMIT = 400 * 1024;

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.jpe?g$/i.test(e.name) && fs.statSync(p).size > LIMIT) files.push(p);
  }
})(ROOT);

let savedTotal = 0;
for (const f of files) {
  const before = fs.statSync(f).size;
  const buf = await sharp(f)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();
  if (buf.length < before) fs.writeFileSync(f, buf);
  const after = fs.statSync(f).size;
  savedTotal += before - after;
  console.log(`${f}: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`);
}
console.log(`${files.length} files, ${Math.round(savedTotal / 1024)}KB saved`);
