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
// /thank-you joined the default list in round 37: it carries white text over the ONE colour
// photograph on the site and had never been measured — the round-36 phone rendering ("a dark
// brown smear") shipped precisely because no instrument was looking at this hero.
const PAGES = (process.env.PAGES ?? "/,/buying,/selling,/financing,/connect,/who-we-are,/home-value,/top-areas,/thank-you").split(",");

/** EVERY WIDTH, NOT JUST THE DESKTOP ONE. This gate ran at 1440 by default and was reported
 *  PASSING for rounds, while /connect's 11px eyebrow sat at 4.14:1 on a phone and 3.66:1 at 320,
 *  and /selling's reassurance line at 4.32:1 at 320. Nothing was wrong with the measurement — it
 *  was simply never asked the question, because a scrim gradient covers a different share of a
 *  narrow viewport than a wide one, so the pixels behind the same text are not the same pixels.
 *  A contrast gate with one viewport is a contrast gate for one viewport.
 *  W/H still override for a single-size run: `W=320 H=800 node scripts/verify-hero-contrast.mjs`. */
const VIEWPORTS = process.env.W
  ? [{ w: Number(process.env.W), h: Number(process.env.H ?? 900) }]
  : [
      { w: 1440, h: 900 },
      { w: 390, h: 844 },
      { w: 320, h: 800 },
    ];

const chan = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const b = await chromium.launch();
const rows = [];
let measured = 0;

for (const { w: W, h: H } of VIEWPORTS) {
for (const path of PAGES) {
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // BLOCKED, and it used to be `continue()`. This gate measures text against the pixels behind
  // it, and every hero photograph it cares about is a static file under /images/ — it never
  // needed a listing photo. But /api/media/ is storage-first with a PROXY FALLBACK to the media
  // host for anything not yet mirrored, so allowing it meant each run of this gate (8-11 pages x
  // 3 viewports, with two listing rails on the home page alone) spent against the same account
  // cap a photo window is sized against. On 2026-08-21 a window 429'd while these were running.
  // The rule was already written down in CLAUDE.md: block it unless a screenshot genuinely needs
  // photos. This one does not.
  await c.route("**/api/media/**", (r) => r.abort());
  const p = await c.newPage();
  await p.goto(base + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(4500);
  // Settle the paint before measuring. A hero photo that has not decoded yet leaves the scrim
  // over an empty box, and text scored against THAT is scored against a background the visitor
  // never sees: one batch run flagged the home hero's white SEARCH button at 1.01:1, and two
  // re-runs of the same page passed. Waiting for fonts and for every in-viewport image to
  // report complete removes that whole class of false finding.
  await p.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 0 && r.top < innerHeight && r.bottom > 0;
    });
    await Promise.all(
      imgs.map((i) => (i.complete ? null : new Promise((res) => { i.addEventListener("load", res, { once: true }); i.addEventListener("error", res, { once: true }); }))),
    );
  });
  await p.waitForTimeout(600);

  // MEASURE THE POSTER, NOT THE FRAME LOTTERY. The home hero layers an ambient Vimeo loop
  // over its poster, and a single screenshot scores whichever frame the loop happens to be
  // on: the same tree measured the eyebrow's background at p95 luminance 0.061 (poster) and
  // 0.238 (a bright frame of the moving footage) minutes apart — pass at 14:00, fail at
  // 14:03, no code change. A verdict that depends on the loop's clock is not a measurement.
  // The static poster IS the visitor contract for every reduced-motion, no-JS and phone
  // visitor and for any profile that blocks autoplay (the owner's Chrome among them), and
  // both states share the same scrims, so the poster is the deterministic ground this gate
  // scores. The moving state is bounded by design instead: the type column carries its own
  // left vignette (app/page.tsx, round 27).
  await p.addStyleTag({ content: 'iframe[src*="player.vimeo.com"] { display: none !important; }' });

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

  /** One with-text / without-text pair. Repeatable, because a failure gets re-measured before
   * it is believed: the elements this hides are tagged so the page can be put back exactly. */
  const capturePair = async () => {
    await p.evaluate(() => {
      for (const el of document.querySelectorAll("[data-rlt-hidden]")) {
        el.style.removeProperty("color");
        el.removeAttribute("data-rlt-hidden");
      }
    });
    await p.waitForTimeout(250);
    const withText = await p.screenshot();
    await p.evaluate(() => {
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const els = new Set();
      for (let n = walk.nextNode(); n; n = walk.nextNode()) if (n.textContent.trim().length >= 2 && n.parentElement) els.add(n.parentElement);
      for (const el of els) { el.style.setProperty("color", "transparent", "important"); el.setAttribute("data-rlt-hidden", "1"); }
    });
    await p.waitForTimeout(500);
    const noText = await p.screenshot();
    return [
      await sharp(withText).raw().toBuffer({ resolveWithObject: true }),
      await sharp(noText).raw().toBuffer({ resolveWithObject: true }),
    ];
  };

  let [A, B] = await capturePair();
  const { width: iw, channels: ch } = A.info;

  /** Score one text run against the current capture pair. Returns null when the run painted
   * nothing visible (hidden or clipped text), which is how those drop out without a skip list. */
  const measure = (it) => {
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
    if (bgLums.length < 6) return null;
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
    return { cr: Math.min(score(lo, toRGB(lo)), score(hi, toRGB(hi))), bgLums };
  };

  const suspects = [];
  for (const it of items) {
    const m = measure(it);
    if (!m) continue;
    measured++;
    if (m.cr < (it.large ? 3 : 4.5)) suspects.push(it);
  }

  // CONFIRM BEFORE REPORTING. A hero whose reveal or photo has not settled paints the text over
  // the wrong background for a frame, and that produced an intermittent 1.0-1.2:1 on the home
  // hero's WHITE search button — whose true value is 21:1 — on roughly one sweep in three,
  // while the same page measured alone always passed. A gate that cries wolf gets ignored, so a
  // suspect is re-captured after a further settle and only kept if it fails twice.
  if (suspects.length) {
    await p.waitForTimeout(2500);
    [A, B] = await capturePair();
  }
  for (const it of suspects) {
    const m = measure(it);
    if (!m) continue;
    const cr = m.cr;
    const bgLums = m.bgLums;
    const floor = it.large ? 3 : 4.5;
    if (cr < floor) {
      rows.push({
        path, vp: `${W}x${H}`, cr: Math.round(cr * 100) / 100, floor, size: Math.round(it.size), text: it.text, fg: it.fg,
        // Where and how much, so a failure can be re-cropped and looked at rather than argued
        // about — a bare ratio cannot distinguish a real one from a paint race.
        at: `${it.box.x},${it.box.y} ${Math.round(it.box.w)}x${Math.round(it.box.h)}`,
        px: bgLums.length,
        bg: `p05=${bgLums[Math.floor(bgLums.length * 0.05)].toFixed(3)} p95=${bgLums[Math.floor(bgLums.length * 0.95)].toFixed(3)}`,
      });
    }
  }
  await c.close();
}
}
await b.close();

rows.sort((a, z) => a.cr - z.cr);
const sizes = VIEWPORTS.map((v) => `${v.w}x${v.h}`).join(", ");
console.log(`measured ${measured} painted text runs across ${PAGES.length} pages at ${sizes}\n`);
if (!rows.length) console.log("PASS — every painted text run clears its AA floor against the pixels behind it.");
else {
  console.log(`${rows.length} BELOW their AA floor (worst first):\n`);
  for (const r of rows) {
    const fg = `rgba(${r.fg.r},${r.fg.g},${r.fg.b},${r.fg.a.toFixed(2)})`;
    // The VIEWPORT is part of the finding, not context for it: the same run passes at 1440 and
    // fails at 320, so a row without its width cannot be reproduced.
    console.log(`${r.cr.toFixed(2)}:1 (needs ${r.floor})  ${r.vp.padEnd(9)} ${r.path.padEnd(12)} ${(r.size + "px").padEnd(6)} ${fg.padEnd(24)} "${r.text}"  @${r.at} glyphpx=${r.px} bg ${r.bg}`);
  }
}
process.exit(rows.length ? 1 : 0);
