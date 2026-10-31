/** Contact sheets from the probe's frames: the AI scenes at 390 in page order, five per sheet,
 * side by side at half size; and the two open-rail frames. JPG, small enough to keep in git.
 *   node docs/blog-r16/sheets.mjs docs/blog-r16/shots docs/blog-r16 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const [dir, out] = process.argv.slice(2);
const report = JSON.parse(fs.readFileSync(path.join(dir, "report.json"), "utf8"));
const order = fs.readdirSync(dir).filter((f) => /^ai-390-scene-.*\.png$/.test(f));
// Page order: the probe wrote them in DOM order; mtime keeps it.
order.sort((a, b) => fs.statSync(path.join(dir, a)).mtimeMs - fs.statSync(path.join(dir, b)).mtimeMs);
const W = 195, GAP = 8;
for (let i = 0; i < order.length; i += 5) {
  const files = order.slice(i, i + 5);
  const imgs = await Promise.all(files.map(async (f) => {
    const buf = await sharp(path.join(dir, f)).resize({ width: W }).toBuffer();
    const m = await sharp(buf).metadata();
    return { buf, h: m.height };
  }));
  const H = Math.min(2400, Math.max(...imgs.map((x) => x.h)));
  const canvas = sharp({ create: { width: files.length * (W + GAP) + GAP, height: H + 2 * GAP, channels: 3, background: "#888" } });
  const comps = [];
  let x = GAP;
  for (const im of imgs) {
    const b = im.h > H ? await sharp(im.buf).extract({ left: 0, top: 0, width: W, height: H }).toBuffer() : im.buf;
    comps.push({ input: b, left: x, top: GAP });
    x += W + GAP;
  }
  const name = `ai-390-scenes-${i / 5 + 1}.jpg`;
  await canvas.composite(comps).jpeg({ quality: 72 }).toFile(path.join(out, name));
  console.log(name, files.join(", "));
}
for (const f of ["rail-1680-open-dark.png", "rail-1680-open-light.png", "sheet-390-ai.png", "ai-390-top.png", "ai-1440-top.png"]) {
  if (!fs.existsSync(path.join(dir, f))) continue;
  await sharp(path.join(dir, f)).resize({ width: f.includes("1680") || f.includes("1440") ? 1200 : 390 }).jpeg({ quality: 75 }).toFile(path.join(out, f.replace(".png", ".jpg")));
  console.log(f);
}
void report;
