/** Judge a plate candidate at its REAL crops, on its REAL band.
 *
 * object-cover at 21:9 throws away most of a 4:3 photograph, and a picture that looks good in a
 * contact sheet can come back as a wall of grass. This renders each candidate through the same
 * geometry the Plate primitive uses (max-w-6xl, rounded-2xl, object-cover) on the ink band, so
 * what you look at is what the reader gets.
 *
 * TWO CROPS, NOT ONE, and this was measured in round F rather than assumed. The Plate primitive
 * does NOT ship 21:9 everywhere. Measured on the rendered page: 1088 x 466 at a 1440 viewport,
 * which is 2.33 and is 21:9, and 358 x 201 at a 390 viewport, which is 1.78 and is 16:9. Because
 * both frames fill the container width, the phone crop is a VERTICAL SUPERSET of the desktop one:
 * a reader on a phone sees a taller slice of the photograph than a reader on a laptop.
 *
 * That has one practical consequence and it is the reason for this change. Round E's rule was
 * "write the alt text from the shipped 21:9 crop", and the shipped 21:9 crop is the SMALLER of
 * the two. Alt written from it is accurate and incomplete, because it omits whatever the phone
 * shows above and below. Write it from the 16:9 pane on the right.
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
  .pair{display:flex;gap:16px;align-items:flex-start}
  .col{flex:1;min-width:0}
  .frame{position:relative;overflow:hidden;border-radius:16px;background:#0a0a0a}
  .d{aspect-ratio:21/9}
  .m{aspect-ratio:16/9}
  .frame img{width:100%;height:100%;object-fit:cover;display:block}
  .lab{padding:8px 2px 0;color:#9a9a9a;font-size:13px;letter-spacing:.02em}
  .sub{padding:6px 2px 0;color:#6a6a6a;font-size:12px}
</style>
${files
  .map(
    (f) =>
      `<div class="wrap"><div class="pair">
         <div class="col"><div class="frame d"><img src="http://localhost:3100${f}"></div><div class="sub">21:9, what a 1440 viewport ships</div></div>
         <div class="col"><div class="frame m"><img src="http://localhost:3100${f}"></div><div class="sub">16:9, what a phone ships. WRITE THE ALT FROM THIS ONE</div></div>
       </div><div class="lab">${f}</div></div>`,
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
