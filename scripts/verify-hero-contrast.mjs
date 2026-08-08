// Contrast for text sitting on PHOTOGRAPHY, measured from pixels.
//
// scripts/contrast.mjs cannot answer this: it resolves a text node against the first
// non-transparent ANCESTOR BACKGROUND COLOUR, and over a hero photo that ancestor is an image
// (or a transparent scrim), so it scores the text against a colour nobody can see. A checker
// that ignores what is actually painted behind the glyphs will happily pass illegible text.
//
// THREE TRAPS THIS PROBE'S OWN FIRST DRAFT FELL INTO — the reasons it is shaped this way:
//
//  1. COLOUR PARSING. Tailwind's `/85` opacity syntax computes to `oklab(0.99 0.00004 0.00002 /
//     0.85)`. Scraping numbers out of that string with a regex yields r=0.99 g=0.00004 b=0.00002
//     read as 0-255 — near-black — so WHITE hero text scored 1.00:1 against a dark photo. The fix
//     is to never parse colour: paint it on a canvas and let the browser resolve any syntax to
//     straight RGBA.
//  2. TRANSLUCENT TEXT. White at 0.6 alpha over a photo is not white. The effective foreground is
//     the text composited ONTO its own background, per pixel, so alpha is applied here rather
//     than assumed away.
//  3. SAMPLING THE BOX. A bounding box contains padding, borders and neighbours. Sampling it
//     scored the nav's #6f6f6f "Connect" at 1.20:1 (its true value on white is 5.02:1) because
//     the button's hairline border sat in the box. So the background is read ONLY at pixels the
//     glyphs actually cover, found by diffing a shot with the text against a shot without it.
//
// That diff-mask has a useful side effect: text that paints nothing (honeypot fields, clipped
// labels) produces an empty mask and drops out on its own, with no hand-maintained skip list.
//
// The score is WORST CASE, not average: for light text the enemy is the brightest patch of sky
// behind it, and an average over a mostly-dark photo hides exactly that.
//
// Usage: BASE=https://… node scripts/verify-hero-contrast.mjs
import { chromium } from "playwright";
import sharp from "sharp";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const PAGES = (process.env.PAGES ?? "/,/buying,/selling,/financing,/connect,/who-we-are,/home-value,/top-areas").split(",");
const W = Number(process.env.W ?? 1440);
const H = Number(process.env.H ?? 900);

const chan = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const b = await chromium.launch();
const rows = [];
let measured = 0;

for (const path of PAGES) {
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await c.route("**/api/media/**", (r) => r.continue());
  const p = await c.newPage();
  await p.goto(base + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(4500);

  // SELF-TEST HOOK. A gate that has never been seen to fail is not evidence. BREAK_CSS injects a
  // deliberate regression so the probe can be shown catching one on demand, e.g.
  //   BREAK_CSS='h1{color:#9aa0a6 !important}' node scripts/verify-hero-contrast.mjs
  // A run with it set MUST report failures; a run without it is only meaningful because of that.
  if (process.env.BREAK_CSS) await p.addStyleTag({ content: process.env.BREAK_CSS });

  // Resolve each text element's colour THROUGH THE BROWSER (canvas round-trip), so oklab(),
  // color-mix(), lab() and friends all come back as straight RGBA.
  const items = await p.evaluate((vh) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    const resolve = (css) => {
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = css;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    };
    const out = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.textContent.trim();
      if (t.length < 2) continue;
      const el = n.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 6 || r.top >= vh || r.bottom <= 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const size = parseFloat(cs.fontSize);
      const weight = Number(cs.fontWeight) || 400;
      out.push({
        text: t.slice(0, 44), size, weight,
        large: size >= 24 || (size >= 18.66 && weight >= 700),
        fg: resolve(cs.color),
        box: {
          x: Math.max(0, Math.floor(r.left)), y: Math.max(0, Math.floor(r.top)),
          w: Math.ceil(Math.min(r.width, innerWidth - r.left)), h: Math.ceil(Math.min(r.height, vh - r.top)),
        },
      });
    }
    return out;
  }, H);

  const withText = await p.screenshot();
  await p.evaluate(() => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const els = new Set();
    for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.textContent.trim().length >= 2 && n.parentElement) els.add(n.parentElement);
    for (const el of els) el.style.setProperty("color", "transparent", "important");
  });
  await p.waitForTimeout(500);
  const noText = await p.screenshot();

  const A = await sharp(withText).raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(noText).raw().toBuffer({ resolveWithObject: true });
  const { width: iw, channels: ch } = A.info;

  for (const it of items) {
    const x1 = Math.min(A.info.width, it.box.x + it.box.w);
    const y1 = Math.min(A.info.height, it.box.y + it.box.h);
    const bgLums = [];
    for (let y = it.box.y; y < y1; y++) {
      for (let x = it.box.x; x < x1; x++) {
        const i = (y * iw + x) * ch;
        // Glyph core: where painting the text changed the pixel a lot. Antialiased rims move
        // less and are deliberately excluded — they are not what legibility is judged on.
        const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
        if (d > 60) bgLums.push(lum(B.data[i], B.data[i + 1], B.data[i + 2]));
      }
    }
    if (bgLums.length < 6) continue; // painted nothing visible -> not a real text run
    measured++;
    bgLums.sort((a, z) => a - z);
    const pick = (q) => bgLums[Math.min(bgLums.length - 1, Math.floor(bgLums.length * q))];
    // Composite the (possibly translucent) text over the background, then score worst case.
    const score = (bgL, bgRGB) => {
      const fr = it.fg.a * it.fg.r + (1 - it.fg.a) * bgRGB[0];
      const fgg = it.fg.a * it.fg.g + (1 - it.fg.a) * bgRGB[1];
      const fb = it.fg.a * it.fg.b + (1 - it.fg.a) * bgRGB[2];
      return ratio(lum(fr, fgg, fb), bgL);
    };
    // Evaluate at both tails and keep the worse — correct whether the text is light or dark.
    const lo = pick(0.05), hi = pick(0.95);
    const toRGB = (l) => [Math.round(255 * l ** (1 / 2.2)), Math.round(255 * l ** (1 / 2.2)), Math.round(255 * l ** (1 / 2.2))];
    const cr = Math.min(score(lo, toRGB(lo)), score(hi, toRGB(hi)));
    const floor = it.large ? 3 : 4.5;
    if (cr < floor) {
      rows.push({ path, cr: Math.round(cr * 100) / 100, floor, size: Math.round(it.size), text: it.text, fg: it.fg });
    }
  }
  await c.close();
}
await b.close();

rows.sort((a, z) => a.cr - z.cr);
console.log(`measured ${measured} painted text runs across ${PAGES.length} pages at ${W}x${H}\n`);
if (!rows.length) console.log("PASS — every painted text run clears its AA floor against the pixels behind it.");
else {
  console.log(`${rows.length} BELOW their AA floor (worst first):\n`);
  for (const r of rows) {
    const fg = `rgba(${r.fg.r},${r.fg.g},${r.fg.b},${r.fg.a.toFixed(2)})`;
    console.log(`${r.cr.toFixed(2)}:1 (needs ${r.floor})  ${r.path.padEnd(12)} ${(r.size + "px").padEnd(6)} ${fg.padEnd(24)} "${r.text}"`);
  }
}
process.exit(rows.length ? 1 : 0);
