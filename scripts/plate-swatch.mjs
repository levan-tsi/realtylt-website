/** Judge a plate candidate at its REAL crop, on its REAL band.
 *
 * object-cover at 21:9 throws away most of a 4:3 photograph, and a picture that looks good in a
 * contact sheet can come back as a wall of grass. This renders each candidate through the same
 * geometry the Plate primitive uses (max-w-6xl, aspect-[21/9], rounded-2xl, object-cover) on the
 * ink band, so what you look at is what the reader gets.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const files = process.argv.slice(3);
const out = process.argv[2];
if (!files.length) {
  console.log("usage: plate-swatch.mjs <out.png> <img path under public> ...");
  process.exit(1);
}

const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#0b0b0c;font:14px/1.5 system-ui;color:#eee}
  .wrap{max-width:1152px;margin:0 auto;padding:28px 0}
  .frame{position:relative;aspect-ratio:21/9;overflow:hidden;border-radius:16px;background:#0a0a0a}
  .frame img{width:100%;height:100%;object-fit:cover;display:block}
  .lab{padding:8px 2px 0;color:#9a9a9a;font-size:13px;letter-spacing:.02em}
</style>
${files
  .map(
    (f) =>
      `<div class="wrap"><div class="frame"><img src="http://localhost:3100${f}"></div><div class="lab">${f}</div></div>`,
  )
  .join("")}`;

const tmp = "scripts/.plate-swatch.tmp.html";
fs.writeFileSync(tmp, html);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("file://" + process.cwd().replace(/\\/g, "/") + "/" + tmp, { waitUntil: "networkidle" });
const missing = await p.evaluate(() =>
  [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute("src")),
);
if (missing.length) console.log("!! images that did not load: " + missing.join(", "));
await p.screenshot({ path: out, fullPage: true });
console.log(out);
await b.close();
fs.unlinkSync(tmp);
