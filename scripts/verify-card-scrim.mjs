// The listing card's scrim, MEASURED — not hoped at.
//
// The overlay card (components/idx/ListingCard.tsx's home-rail variant) prints white type
// over photographs we do not control. The scrim under it is therefore carrying an AA claim
// over an unknown background, and round 36's brief said the quiet part out loud: "measured
// for AA contrast, not hoped at". This gate is that measurement.
//
// METHOD — the same pixel-diff instrument as verify-hero-contrast.mjs (colour resolved
// through canvas so oklab()/colour-mix() cannot lie; the background read only at glyph
// pixels found by diffing a with-text/without-text capture pair; translucent text composited
// onto its background before scoring; worst-case tails, not averages). Three card-specific
// hardenings on top of it:
//
//  1. WORST CASE IS CONSTRUCTED, NOT SAMPLED. Media is blocked (standing MLS-safety order)
//     and the photo layer is forced to PURE WHITE — the brightest photograph the feed could
//     ever deliver. If the scrim holds white type over a white picture it holds it over
//     anything; a real photo could only be darker.
//  2. THE DRIFT IS FROZEN. The rail animates, and a capture pair taken 750ms apart would
//     diff a moved card against itself and mask garbage. `animation: none` pins the track at
//     translate 0. The edge fade mask is disabled for the run too: it dims whatever card is
//     mid-dissolve, which is a transient state of motion, not the standing scrim claim this
//     gate scores. (The suppressions live in one style tag; if the class names drift the
//     run-count floor below fails the gate rather than silently measuring the wrong thing.)
//  3. TEXT THAT PAINTS NOTHING IS A FAILURE HERE, NOT A SKIP. The hero gate lets unpaintable
//     runs drop out because pages legitimately hold invisible text (honeypots). Inside a
//     listing card nothing is legitimately invisible — white-on-white text produces an EMPTY
//     diff mask, so an instrument that skips empty masks would PASS the exact catastrophe it
//     exists to catch. A run inside the rail that cannot be diffed from its background fails,
//     and a viewport that yields fewer than MIN_RUNS measured runs fails outright.
//
// SELF-TEST (watched failing on 2026-08-21, both modes):
//   FALSIFY=1  — removes the scrim gradients; the gate must report paints-nothing failures.
//   BREAK_CSS='.rlt-drift article p{color:#bbb !important}' — dims the type; must fail floors.
//
// Usage: node scripts/verify-card-scrim.mjs   (BASE=… overrides the target)
import { chromium } from "playwright";
import sharp from "sharp";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const VIEWPORTS = [
  { w: 1440, h: 900 },
  { w: 390, h: 844 },
  { w: 320, h: 800 },
];
// price + street + city + stats + credit per fully-visible card. The rail shows 3 full cards
// at 1440 and exactly one 78vw card on a phone, so the floor follows the layout — the first
// run of this gate expected 8 at every width and failed its own phone sweep on run count.
const minRuns = (w) => (w >= 640 ? 10 : 5);

const chan = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const b = await chromium.launch();
const failures = [];
let totalMeasured = 0;

for (const { w: W, h: H } of VIEWPORTS) {
  const c = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // Media is BLOCKED — this gate constructs its own background, it never needs a photograph,
  // and the MLS account budget is not a test fixture.
  await c.route("**/api/media/**", (r) => r.abort());
  const p = await c.newPage();
  await p.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.evaluate(async () => { await document.fonts.ready; });

  await p.addStyleTag({
    content: [
      // (2) determinism: freeze the drift, drop the edge fade, hide the ambient video.
      ".rlt-drift-track { animation: none !important; }",
      ".rlt-drift { mask-image: none !important; -webkit-mask-image: none !important; }",
      'iframe[src*="player.vimeo.com"] { display: none !important; }',
      // (1) the constructed worst case: the photograph is pure white.
      ".rlt-drift .photo-zoom img, .rlt-drift .photo-zoom picture { visibility: hidden !important; }",
      ".rlt-drift .photo-zoom > div:first-child { background: #fff !important; }",
      ".rlt-drift .photo-zoom { background: #fff !important; }",
    ].join("\n"),
  });
  if (process.env.FALSIFY) {
    await p.addStyleTag({ content: ".rlt-drift .photo-zoom div[aria-hidden] { display: none !important; }" });
  }
  if (process.env.BREAK_CSS) await p.addStyleTag({ content: process.env.BREAK_CSS });

  // Bring the rail fully into view and let the reveal/settle finish.
  await p.evaluate(() => document.querySelector(".rlt-drift")?.scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(1200);

  // Text runs inside the REAL track's cards only (the duplicate track is inert scenery).
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
    for (const card of document.querySelectorAll(".rlt-drift article")) {
      if (card.closest("[inert]")) continue;
      const cr = card.getBoundingClientRect();
      // Only cards FULLY inside the viewport: a clipped card cannot be sampled honestly.
      if (cr.left < 0 || cr.right > innerWidth || cr.top < 0 || cr.bottom > vh) continue;
      for (const el of card.querySelectorAll("p")) {
        const t = (el.textContent || "").trim();
        if (t.length < 2) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 6) continue;
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        const weight = Number(cs.fontWeight) || 400;
        out.push({
          text: t.slice(0, 40), size, weight,
          large: size >= 24 || (size >= 18.66 && weight >= 700),
          fg: resolve(cs.color),
          box: { x: Math.floor(r.left), y: Math.floor(r.top), w: Math.ceil(r.width), h: Math.ceil(r.height) },
        });
      }
    }
    return out;
  }, H);

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
      for (const el of document.querySelectorAll(".rlt-drift article p")) {
        el.style.setProperty("color", "transparent", "important");
        el.setAttribute("data-rlt-hidden", "1");
      }
    });
    await p.waitForTimeout(350);
    const noText = await p.screenshot();
    return [
      await sharp(withText).raw().toBuffer({ resolveWithObject: true }),
      await sharp(noText).raw().toBuffer({ resolveWithObject: true }),
    ];
  };

  const [A, B2] = await capturePair();
  const { width: iw, channels: ch } = A.info;

  let measuredHere = 0;
  for (const it of items) {
    const x1 = Math.min(A.info.width, it.box.x + it.box.w);
    const y1 = Math.min(A.info.height, it.box.y + it.box.h);
    const bgLums = [];
    for (let y = Math.max(0, it.box.y); y < y1; y++) {
      for (let x = Math.max(0, it.box.x); x < x1; x++) {
        const i = (y * iw + x) * ch;
        const d = Math.abs(A.data[i] - B2.data[i]) + Math.abs(A.data[i + 1] - B2.data[i + 1]) + Math.abs(A.data[i + 2] - B2.data[i + 2]);
        if (d > 60) bgLums.push(lum(B2.data[i], B2.data[i + 1], B2.data[i + 2]));
      }
    }
    // (3) an unpaintable run inside a card IS the failure mode this gate exists for.
    if (bgLums.length < 6) {
      failures.push({ vp: `${W}x${H}`, cr: 0, floor: it.large ? 3 : 4.5, size: it.size, text: it.text, why: "paints nothing distinguishable from its background" });
      continue;
    }
    measuredHere++;
    bgLums.sort((a, z) => a - z);
    const pick = (q) => bgLums[Math.min(bgLums.length - 1, Math.floor(bgLums.length * q))];
    const score = (bgL) => {
      const g = Math.round(255 * bgL ** (1 / 2.2));
      const fr = it.fg.a * it.fg.r + (1 - it.fg.a) * g;
      const fgg = it.fg.a * it.fg.g + (1 - it.fg.a) * g;
      const fb = it.fg.a * it.fg.b + (1 - it.fg.a) * g;
      return ratio(lum(fr, fgg, fb), bgL);
    };
    const cr = Math.min(score(pick(0.05)), score(pick(0.95)));
    const floor = it.large ? 3 : 4.5;
    if (cr < floor) failures.push({ vp: `${W}x${H}`, cr: Math.round(cr * 100) / 100, floor, size: it.size, text: it.text, why: `over a WHITE photograph` });
  }
  totalMeasured += measuredHere;
  if (measuredHere < minRuns(W)) {
    failures.push({ vp: `${W}x${H}`, cr: 0, floor: minRuns(W), size: 0, text: `(only ${measuredHere} runs measured)`, why: "expected card text did not paint — instrument or scrim is broken" });
  }
  await c.close();
}
await b.close();

console.log(`measured ${totalMeasured} card text runs over a constructed white photograph at 1440, 390, 320\n`);
if (!failures.length) {
  console.log("PASS — every line on the overlay card clears its AA floor over a pure-white photo.");
} else {
  console.log(`${failures.length} FAILURES:\n`);
  for (const f of failures.sort((a, z) => a.cr - z.cr)) {
    console.log(`${(f.cr || 0).toFixed(2)}:1 (needs ${f.floor})  ${f.vp.padEnd(9)} ${Math.round(f.size)}px "${f.text}" — ${f.why}`);
  }
}
process.exit(failures.length ? 1 : 0);
