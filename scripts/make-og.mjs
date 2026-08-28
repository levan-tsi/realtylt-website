// Generate the branded share card (1200x630) -> public/og-realtylt.png (+ public/og.png).
//
// REWRITTEN 2026-08-28. The card this replaced was drawn in the pre-round-11 design (Fraunces
// headline, a made-up "RT" monogram, "Six counties · One river") and it was what every shared
// link showed: the owner sent realtylt.com to a friend and the preview was a site that no
// longer exists. This one is the home hero as it actually renders: the real logo, Newsreader
// 200/600, Lato eyebrow at the site's tracking, and the Hudson Highlands photograph we hold a
// licence for, greyscale like every photograph on the site.
//
// TWO FILENAMES, SAME BYTES. iMessage, WhatsApp and Slack cache a preview by its image URL and
// keep the old bytes for days; the metadata now points at og-realtylt.png so the next share
// misses that cache, and og.png is regenerated too so anything still holding the old URL gets
// the new card whenever it does re-fetch.
//
// Run: node scripts/make-og.mjs   (needs the Playwright chromium already used by the probes)
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const root = process.cwd().replace(/\\/g, "/");
const photo = `file:///${root}/public/images/hero/valley-aerial.jpg`;
const logo = `file:///${root}/public/logo-realtylt.png`;

const html = `<!doctype html><html><head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@200;600&family=Lato:wght@700&display=block" rel="stylesheet">
<style>
  * { margin:0; box-sizing:border-box }
  body { width:1200px; height:630px; overflow:hidden; background:#ffffff; color:#000; font-family:Lato,Helvetica,Arial,sans-serif; display:flex }
  .type { width:560px; height:100%; padding:64px 0 60px 72px; display:flex; flex-direction:column; justify-content:space-between; position:relative; z-index:2 }
  .logo { width:236px; height:auto; display:block }
  .eyebrow { font-size:15px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:#6f6f6f; line-height:1.2 }
  h1 { margin-top:22px; font-family:Newsreader,Georgia,serif; font-weight:200; font-size:108px; line-height:1.02; letter-spacing:-0.022em; color:#000 }
  h1 strong { font-weight:600 }
  .site { margin-top:34px; font-size:15px; font-weight:700; letter-spacing:0.22em; text-transform:uppercase; color:#6f6f6f }
  .site b { color:#1c729a }
  .photo { position:absolute; left:560px; top:0; width:640px; height:630px; overflow:hidden }
  .photo img { width:100%; height:100%; object-fit:cover; object-position:42% 60%; filter:grayscale(1); display:block }
  .scrim { position:absolute; inset:0; background:linear-gradient(90deg, rgba(0,0,0,0.10), rgba(0,0,0,0) 40%) }
</style></head><body>
  <div class="type">
    <img class="logo" src="${logo}" alt="">
    <div>
      <p class="eyebrow">Hudson Valley &amp; New York City</p>
      <h1>Let&rsquo;s Find<br><strong>Home</strong></h1>
      <p class="site">realtylt<b>.com</b></p>
    </div>
  </div>
  <div class="photo"><img src="${photo}" alt=""><div class="scrim"></div></div>
</body></html>`;

const tmp = path.join("scripts", "_og.html");
fs.writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(`file:///${root}/${tmp.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
const loaded = await p.evaluate(() => ({
  newsreader: document.fonts.check('200 100px "Newsreader"') && document.fonts.check('600 100px "Newsreader"'),
  lato: document.fonts.check('700 15px "Lato"'),
}));
if (!loaded.newsreader || !loaded.lato) throw new Error(`fonts not loaded: ${JSON.stringify(loaded)}`);
// Palette PNG: a greyscale photograph plus five flat colours quantises cleanly, and the
// raw screenshot was 379 KB for a card every share fetches.
const png = await sharp(await p.screenshot()).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();
fs.writeFileSync("public/og-realtylt.png", png);
fs.writeFileSync("public/og.png", png);
await b.close();
fs.unlinkSync(tmp);
console.log("public/og-realtylt.png + public/og.png written", loaded);
