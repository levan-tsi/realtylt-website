// ─────────────────────────────────────────────────────────────────────────────
// THE R32 PAGE RUBRIC — a committed, reusable instrument.
//
// Round 32 scores every page on the same twelve dimensions, and every dimension
// scores from a MEASUREMENT, never from an impression. This file IS the rubric:
// the thresholds below are the written rule, applied identically to page 1 and
// page 10, before and after. A score is a number this program produced.
//
// It is built to be able to score LOW. `node scripts/score-page.mjs / --break`
// injects a stylesheet that commits the exact defects each dimension hunts for;
// if the score does not collapse, the instrument is broken, not the page.
// (memory: feedback-no-self-graded-scores, verify-instrument-that-cannot-fail)
//
// Twelve dimensions x 5 points = 60.
//   D1  first-impression hierarchy      D7  motion quality
//   D2  type scale and rhythm           D8  copy honesty and voice
//   D3  spacing and optical alignment   D9  mobile ergonomics
//   D4  photography treatment           D10 accessibility floors
//   D5  colour restraint                D11 performance feel
//   D6  state completeness              D12 resilience (JS off)
//
// Blocks **/api/media/** unless --media is passed: MLS Grid is rate-limit
// sensitive and a scoring run must never cost the account a request.
//
// Usage:
//   node scripts/score-page.mjs /              --label home
//   node scripts/score-page.mjs /listing/KEY.. --label listing --media
//   node scripts/score-page.mjs / --break            (prove it can fail)
// ─────────────────────────────────────────────────────────────────────────────
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PROBE_BASE || "http://localhost:3100";
const argv = process.argv.slice(2);
const PATHNAME = argv.find((a) => a.startsWith("/")) || "/";
const LABEL = (argv[argv.indexOf("--label") + 1] || PATHNAME.replace(/\W+/g, "-") || "page").replace(/^-|-$/g, "");
const ALLOW_MEDIA = argv.includes("--media");
const BREAK = argv.includes("--break");
const SHOTDIR = path.join("docs", "r32", LABEL + (BREAK ? "-BROKEN" : ""));
fs.mkdirSync(SHOTDIR, { recursive: true });

// ── The design system's own values. Anything outside this set is off-token.
const TOKENS = {
  ink: "#000000", inkSoft: "#222222", paper: "#ffffff", mist: "#f3f5f8",
  stone: "#6f6f6f", line: "#dddddd", lineStrong: "#cccccc", graphite: "#20262e",
  river: "#102c54", porchlight: "#28a8e0", porchlightDeep: "#1c729a",
};
const TOKEN_RGB = Object.values(TOKENS).map(hexToRgb);
const RADII = [0, 2, 4, 8, 12, 16, 24, 9999];

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function nearToken(rgb, tol = 10) {
  return TOKEN_RGB.some((t) => Math.abs(t[0] - rgb[0]) <= tol && Math.abs(t[1] - rgb[1]) <= tol && Math.abs(t[2] - rgb[2]) <= tol);
}
const clamp5 = (n) => Math.max(0, Math.min(5, Math.round(n * 4) / 4));

// The stylesheet that must make the score collapse. Each rule is aimed at one
// dimension, so a dimension that does NOT drop is a dimension that cannot fail.
// A BREAK MUST BE ADDITIVE. The first version of this stylesheet set `p{13px}`,
// `li{15px}`, `span{14.5px}` across the whole document, which HOMOGENISED the six
// real body sizes the home page runs (12/13/14/16/17/18) down to four and CANCELLED
// the very deduction D2 exists to take — the broken page scored a full point HIGHER
// than the clean one. A rule that removes variety cannot test a rule that punishes
// variety, and a rule that deletes declarations (`transition:none`) cannot test D7,
// every one of whose checks looks for a bad declaration's PRESENCE.
//
// So: injected defects are ADDED, on nodes this file appends, and the page's own
// type, motion and headings are left exactly as they are. The only blanket rules
// left are the ones whose defect genuinely IS a removal (D6's missing ring, D1's
// shrunken headline).
const BREAK_CSS = `
  /* D1 — collapse the hierarchy: the headline stops being the biggest thing */
  h1{font-size:19px !important}
  /* D3 — off the rhythm scale and asymmetric */
  section{padding-top:37px !important;padding-bottom:23px !important}
  /* D6 — no ring, no hover, no press */
  a,button{outline:none !important}
  a:focus-visible,button:focus-visible{outline:none !important;box-shadow:none !important}
  .lift:hover{translate:0 0 !important}
  /* D5 — a gradient control in two off-token colours */
  button,a[class*="bg-"]{background-image:linear-gradient(90deg,#7b2ff7,#f107a3) !important;color:#e6ff00 !important;border-radius:7px !important}
  /* D4 — stretch the photography */
  img{object-fit:fill !important}
  /* D9 — something wider than the phone */
  body::after{content:"";display:block;width:520px;height:8px;background:#f107a3}

  /* D2 — off-scale headings, tight body leading, extra body sizes, loose display
     tracking. All scoped to the injected block, so they ADD to the page's own set. */
  #r32-break h2{font-size:37px !important;letter-spacing:0.04em !important}
  #r32-break h3{font-size:29px !important} #r32-break h4{font-size:23px !important}
  #r32-break h5{font-size:21px !important}
  #r32-break .r32-lead{font-size:48px !important;letter-spacing:0.05em !important}
  #r32-break .r32-b1{font-size:13px !important;line-height:1.12 !important}
  #r32-break .r32-b2{font-size:15px !important;line-height:1.18 !important}
  #r32-break .r32-b3{font-size:19px !important;line-height:1.2 !important}

  /* D7 — REAL motion defects, which the old sheet contained none of: an over-budget
     interactive transition, on a layout property, on a banned curve, plus an infinite
     animation that must not survive reduced motion. */
  @keyframes r32-break-throb{0%{opacity:1}50%{opacity:.35}100%{opacity:1}}
  #r32-break button, #r32-break a{transition:width 900ms ease-in, background-color 900ms ease-in !important}
  #r32-break .r32-throb{animation:r32-break-throb 1.4s ease-in infinite !important}
`;
// D8, D10 and D12 are content defects, not CSS defects — a stylesheet cannot create
// an em dash, a heading skip, a second h1 or a nameless control. The break run
// injects them into the DOM so those checks are proven able to fail too.
const BREAK_DOM = () => {
  const box = document.createElement("div");
  box.id = "r32-break";
  // D8 — hype, an em dash, an arrow CTA and a vague label
  box.innerHTML = `
    <p>We are a world-class team — seamlessly unlocking unparalleled value.</p>
    <a href="#">Learn more →</a>
    <a href="#">Get started</a>
    <div class="r32-lead">Ag</div>
    <h2>Injected heading two</h2><h3>Injected heading three</h3>
    <h4>Injected heading four</h4><h5>Injected heading five</h5>
    <p class="r32-b1">one two three four five six seven eight nine ten eleven</p>
    <p class="r32-b2">one two three four five six seven eight nine ten eleven</p>
    <p class="r32-b3">one two three four five six seven eight nine ten eleven</p>
    <button class="r32-throb">Throbbing control</button>`;
  document.body.appendChild(box);

  // D10 — a second h1, a heading-level skip, two controls with no accessible name,
  // and four text runs under the AA floor on a RESOLVED (non-gradient) background,
  // since the contrast walk delegates anything over media to verify-hero-contrast.
  const h1 = document.createElement("h1");
  h1.textContent = "A second h1";
  box.appendChild(h1);
  const skip = document.createElement("h6");
  skip.textContent = "A level six straight after a level one";
  box.appendChild(skip);
  for (let i = 0; i < 2; i++) {
    const nameless = document.createElement("button");
    nameless.style.cssText = "width:44px;height:44px;display:block";
    box.appendChild(nameless);
  }
  for (let i = 0; i < 4; i++) {
    const faint = document.createElement("p");
    faint.style.cssText = "color:rgb(226,226,226);background-color:rgb(255,255,255)";
    faint.textContent = "this run of text sits far below the AA contrast floor for its size";
    box.appendChild(faint);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// The in-page collector. Everything it returns is a measurement.
// ─────────────────────────────────────────────────────────────────────────────
const COLLECT = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity) > 0.05;
  };
  const ownText = (el) => {
    let s = "";
    for (const n of el.childNodes) if (n.nodeType === 3) s += n.textContent;
    return s.replace(/\s+/g, " ").trim();
  };
  // ONLY rgb()/rgba() is a resolved colour. Tailwind v4 emits `bg-white/60` as
  // `oklab(0.969 -0.0008 -0.0044 / 0.6)`, and reading its first three numbers as
  // RGB yields [1,0,0] — near black. That made black-on-white read as 1.00:1 and
  // manufactured every contrast failure on the first run of this probe.
  // (memory: verify-contrast-oklab-alpha)
  const parseRGB = (s) => {
    const str = String(s).trim();
    if (!/^rgba?\(/.test(str)) return null;
    const m = str.match(/-?[\d.]+/g);
    if (!m) return null;
    if (m.length >= 4 && parseFloat(m[3]) < 0.06) return null; // effectively transparent
    return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])];
  };
  const all = [...document.querySelectorAll("body *")].filter(vis);
  const fold = innerHeight;

  // ── type
  const textEls = all.filter((el) => ownText(el).length > 1);
  const type = textEls.map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName, size: Math.round(parseFloat(cs.fontSize) * 10) / 10,
      weight: +cs.fontWeight, lh: cs.lineHeight === "normal" ? 0 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
      ls: parseFloat(cs.letterSpacing) || 0, family: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
      color: cs.color, top: r.top + scrollY, y: r.top, words: ownText(el).split(/\s+/).length,
      text: ownText(el).slice(0, 90),
    };
  });

  // the scale probe: render the committed classes and read what they actually produce here
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;left:-9999px;top:0;width:1200px";
  probe.innerHTML = ["t-display", "t-h1", "t-h2", "t-h3", "t-eyebrow"].map((c) => `<div class="${c}">Ag</div>`).join("");
  document.body.appendChild(probe);
  const scaleSizes = [...probe.children].map((c) => Math.round(parseFloat(getComputedStyle(c).fontSize) * 10) / 10);
  const scaleLS = [...probe.children].map((c) => parseFloat(getComputedStyle(c).letterSpacing) || 0);
  probe.remove();

  // the rhythm probe: what sec-sm / sec / sec-lg produce at this width
  const rp = document.createElement("div");
  rp.style.cssText = "position:absolute;left:-9999px;top:0";
  rp.innerHTML = ["sec-sm", "sec", "sec-lg"].map((c) => `<div class="${c}"></div>`).join("");
  document.body.appendChild(rp);
  const rhythm = [...rp.children].map((c) => Math.round(parseFloat(getComputedStyle(c).paddingTop)));
  rp.remove();

  // ── sections + alignment
  const sections = [...document.querySelectorAll("section, main > div")].filter(vis).map((el) => {
    const cs = getComputedStyle(el);
    return { pt: Math.round(parseFloat(cs.paddingTop)), pb: Math.round(parseFloat(cs.paddingBottom)), h: Math.round(el.getBoundingClientRect().height) };
  });
  const gaps = new Set();
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display.includes("flex") || cs.display.includes("grid")) {
      for (const g of [cs.rowGap, cs.columnGap]) { const v = parseFloat(g); if (v > 0) gaps.add(Math.round(v)); }
    }
  }
  // left edges of the text columns — an optically aligned page has few
  const leftEdges = {};
  for (const el of textEls) {
    if (el.getBoundingClientRect().width < 120) continue;
    const x = Math.round(el.getBoundingClientRect().left);
    leftEdges[x] = (leftEdges[x] || 0) + 1;
  }

  // ── images
  const imgs = [...document.querySelectorAll("img")].filter(vis).map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      alt: el.getAttribute("alt"), hasAlt: el.hasAttribute("alt"),
      fit: cs.objectFit, lazy: el.loading === "lazy", aboveFold: r.top < fold,
      w: Math.round(r.width), h: Math.round(r.height),
      nw: el.naturalWidth, nh: el.naturalHeight,
      sizedByAttr: !!(el.getAttribute("width") && el.getAttribute("height")) || cs.aspectRatio !== "auto",
      radius: Math.round(parseFloat(cs.borderTopLeftRadius)),
    };
  });

  // ── colour + radii + gradients
  const colours = {}, radii = {}, gradientCtl = [];
  for (const el of all) {
    const cs = getComputedStyle(el);
    for (const key of ["color", "backgroundColor", "borderTopColor"]) {
      if (key === "borderTopColor" && parseFloat(cs.borderTopWidth) < 0.5) continue;
      const rgb = parseRGB(cs[key]);
      if (rgb) { const k = rgb.join(","); colours[k] = (colours[k] || 0) + 1; }
    }
    // Tailwind v4 emits `rounded-full` as calc(infinity * 1px) -> 33554400px, and
    // a CSS `50%` parses to 50. Both are the pill/circle, not a rogue radius.
    let rr = Math.round(parseFloat(cs.borderTopLeftRadius));
    if (cs.borderTopLeftRadius.includes("%") || rr >= 999) rr = 9999;
    if (rr > 0 && el.getBoundingClientRect().width > 24) radii[rr] = (radii[rr] || 0) + 1;
    if (/gradient/.test(cs.backgroundImage)) {
      const t = el.tagName;
      if (t === "A" || t === "BUTTON" || el.getAttribute("role") === "button") gradientCtl.push(el.textContent.trim().slice(0, 40));
    }
    if (/gradient/.test(cs.backgroundImage) && cs.webkitBackgroundClip === "text") gradientCtl.push("TEXT:" + el.textContent.trim().slice(0, 30));
  }

  // ── interactive inventory
  const SEL = 'a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]), summary';
  // A skip link is 1x1 and clipped until it takes focus; an sr-only label lives
  // at -9999px. Neither is a tap target a thumb can miss, so neither may cost a
  // point. `clipped` is recorded rather than silently dropped.
  const isHidden = (el, r) => {
    const cs = getComputedStyle(el);
    if (r.right < -200 || r.left > innerWidth + 2000) return true;
    if (cs.clipPath && cs.clipPath !== "none" && /inset\(\s*50%/.test(cs.clipPath)) return true;
    if (r.width <= 2 && r.height <= 2) return true;
    return false;
  };
  const controls = [...document.querySelectorAll(SEL)].filter(vis).map((el, i) => {
    const r = el.getBoundingClientRect();
    // THE TAP TARGET IS WHAT A THUMB CAN HIT, not the painted control. A 16px
    // checkbox inside a padded <label> row has a 400px target — the consent
    // checkbox says so in its own source — and scoring the input's box called
    // two correct controls a failure.
    const lab = el.closest("label");
    const tr = lab && lab !== el ? lab.getBoundingClientRect() : r;
    const cs = getComputedStyle(el);
    el.setAttribute("data-r32", String(i));
    // THE ACCESSIBLE NAME, resolved the way a screen reader resolves it. Reading
    // only aria-label/textContent reports every correctly-labelled <input> on the
    // site as nameless, because an input's name comes from its associated
    // <label for>, which is not its text content. That cost every page 1.5 points
    // for markup that was already right.
    const byId = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
    const wrap = el.closest("label");
    const ref = el.getAttribute("aria-labelledby");
    const refEl = ref ? document.getElementById(ref.split(/\s+/)[0]) : null;
    const name = (
      el.getAttribute("aria-label") ||
      (refEl && refEl.textContent) ||
      (byId && byId.textContent) ||
      (wrap && wrap !== el && wrap.textContent) ||
      el.getAttribute("title") ||
      el.textContent ||
      el.getAttribute("alt") ||
      ""
    ).replace(/\s+/g, " ").trim();
    const bgc = parseRGB(cs.backgroundColor);
    return {
      i, tag: el.tagName, name: name.slice(0, 50), hasName: name.length > 0,
      w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top),
      tw: Math.round(tr.width), th: Math.round(tr.height),
      aboveFold: r.top < fold && r.bottom > 0, fontSize: Math.round(parseFloat(cs.fontSize) * 10) / 10,
      transProp: cs.transitionProperty, transDur: cs.transitionDuration, transEase: cs.transitionTimingFunction,
      isInput: ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName),
      clipped: isHidden(el, r),
      filled: !!(bgc && !(bgc[0] > 245 && bgc[1] > 245 && bgc[2] > 245)),
      area: Math.round(r.width * r.height),
    };
  });

  // ── copy
  const bodyText = document.body.innerText.replace(/\s+/g, " ");
  const ctaText = controls.map((c) => c.name);

  // ── motion declarations.
  //    A naive `.split(",")[0]` cuts `cubic-bezier(0.22, 1, 0.36, 1)` into
  //    `cubic-bezier(0.22` and every curve on the site then reads as unknown.
  //    Split on top-level commas only.
  const splitTop = (s) => {
    const out = []; let depth = 0, cur = "";
    for (const ch of s) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  const INTERACTIVE = new Set(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY", "LABEL"]);
  const motion = [];
  for (const el of all) {
    const cs = getComputedStyle(el);
    const interactive = INTERACTIVE.has(el.tagName) || el.getAttribute("role") === "button" || !!el.closest("a,button");
    if (cs.transitionDuration !== "0s") {
      const durs = splitTop(cs.transitionDuration).map((d) => parseFloat(d) * (d.includes("ms") ? 1 : 1000));
      motion.push({ kind: "transition", props: cs.transitionProperty, max: Math.max(...durs), ease: splitTop(cs.transitionTimingFunction)[0], interactive, tag: el.tagName });
    }
    if (cs.animationName !== "none") {
      motion.push({ kind: "animation", props: cs.animationName, max: parseFloat(cs.animationDuration) * 1000, ease: splitTop(cs.animationTimingFunction)[0], iter: cs.animationIterationCount, interactive, tag: el.tagName });
    }
  }

  // ── headings + landmarks
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(vis).map((h) => ({ lvl: +h.tagName[1], t: h.textContent.replace(/\s+/g, " ").trim().slice(0, 60) }));
  const landmarks = { main: !!document.querySelector("main"), nav: !!document.querySelector("nav"), footer: !!document.querySelector("footer"), h1: document.querySelectorAll("h1").length };

  // ── text contrast (resolve against the first painted ancestor).
  //    TEXT OVER A PHOTOGRAPH IS NOT SCORED HERE. Walking up for a painted
  //    background resolves white-on-a-dark-hero to white-on-white and reports
  //    1.00:1 — the first run of this probe invented four such failures on the
  //    home page. Text sitting over media is delegated to
  //    scripts/verify-hero-contrast.mjs, which samples real rendered pixels.
  const overMedia = (el) => {
    const r = el.getBoundingClientRect();
    let p = el;
    while (p && p !== document.body) {
      const pc = getComputedStyle(p);
      if (/url\(|gradient/.test(pc.backgroundImage)) return true;
      // A PHOTO FRAME, whether or not the photo loaded: a fixed aspect box that
      // clips its contents is what every card on this site wraps a picture in.
      // The probe blocks MLS media, so the <img> may never paint at all.
      if (pc.aspectRatio !== "auto" && pc.overflow === "hidden" && p.getBoundingClientRect().width > 60) return true;
      // a positioned photo/video/canvas that covers this text
      // OVERLAP, not full cover. This probe blocks **/api/media/** (MLS Grid is
      // rate-limit sensitive), so a listing card's photo never paints and its
      // scrim text was being measured against the empty placeholder — the first
      // run invented five "1.09:1" failures that way. Any text sharing a box with
      // a photo slot, loaded or not, is delegated to verify-hero-contrast.
      for (const m of p.querySelectorAll("img,video,canvas,picture,[data-photo]")) {
        const mr = m.getBoundingClientRect();
        if (mr.width < 40 || mr.height < 40) continue;
        if (mr.right > r.left && mr.left < r.right && mr.bottom > r.top && mr.top < r.bottom) return true;
      }
      p = p.parentElement;
    }
    return false;
  };
  const contrastFails = [], overMediaText = [];
  for (const el of textEls) {
    const cs = getComputedStyle(el);
    const fg = parseRGB(cs.color);
    if (!fg) continue;
    let bg = null, p = el;
    while (p && p !== document.documentElement) {
      const pc = getComputedStyle(p);
      if (/gradient|url\(/.test(pc.backgroundImage)) { bg = "IMAGE"; break; }
      const c = parseRGB(pc.backgroundColor);
      if (c) { bg = c; break; }
      p = p.parentElement;
    }
    if (!bg || bg === "IMAGE") { overMediaText.push(ownText(el).slice(0, 30)); continue; }
    if (overMedia(el)) { overMediaText.push(ownText(el).slice(0, 30)); continue; }
    const L = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const [hi, lo] = [L(fg), L(bg)].sort((a, b) => b - a);
    const cr = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(cs.fontSize), large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 700);
    if (cr < (large ? 3 : 4.5)) contrastFails.push({ t: ownText(el).slice(0, 40), cr: Math.round(cr * 100) / 100, size });
  }

  return {
    fold, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    docH: document.documentElement.scrollHeight,
    type, scaleSizes, scaleLS, sections, rhythm, gaps: [...gaps].sort((a, b) => a - b), leftEdges,
    imgs, colours, radii, gradientCtl, controls, bodyText: bodyText.slice(0, 60000), ctaText, motion,
    headings, landmarks, contrastFails, overMediaText: overMediaText.length,
  };
};

// find the widest element that overflows the viewport
const OVERFLOW = () => {
  const w = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.right > w + 1 || r.left < -1) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" && cs.visibility === "hidden") continue;
      bad.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) });
    }
  }
  return { scrollW: document.documentElement.scrollWidth, clientW: w, bad: bad.slice(0, 6) };
};

// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  const browser = await chromium.launch();
  const out = { label: LABEL, path: PATHNAME, broken: BREAK, at: new Date().toISOString() };
  const ev = {}; // evidence

  const newCtx = async (extra = {}) => {
    const ctx = await browser.newContext({ deviceScaleFactor: 1, ...extra });
    if (!ALLOW_MEDIA) await ctx.route("**/api/media/**", (r) => r.abort());
    await ctx.route("**://player.vimeo.com/**", (r) => r.abort()); // a moving background is a frame lottery
    return ctx;
  };
  const settle = async (page) => {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    if (BREAK) { await page.addStyleTag({ content: BREAK_CSS }); await page.evaluate(BREAK_DOM); }
    await page.waitForTimeout(300);
  };

  // ── DESKTOP 1440 ───────────────────────────────────────────────────────────
  const ctx = await newCtx({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const perf = [];
  await page.addInitScript(() => {
    window.__lt = []; window.__cls = 0; window.__lcp = 0;
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: "longtask", buffered: true }); } catch {}
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
    try { new PerformanceObserver((l) => { const e = l.getEntries().at(-1); if (e) window.__lcp = Math.round(e.startTime); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
  });
  const t0 = Date.now();
  await page.goto(BASE + PATHNAME, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(page);
  ev.perf = await page.evaluate(() => ({
    lcp: window.__lcp, cls: Math.round(window.__cls * 1000) / 1000,
    longTasks: window.__lt.length, worstTask: window.__lt.length ? Math.max(...window.__lt) : 0,
    fcp: Math.round((performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime || 0),
  }));
  ev.wall = Date.now() - t0;
  const D = await page.evaluate(COLLECT);
  ev.d = D;
  await page.screenshot({ path: path.join(SHOTDIR, "1440-fold.png") });
  await page.screenshot({ path: path.join(SHOTDIR, "1440-full.png"), fullPage: true });

  // scroll smoothness — a real programmatic scroll, frames sampled by rAF
  ev.scroll = await page.evaluate(async () => {
    const f = [];
    let last = performance.now(), stop = false;
    const tick = (t) => { f.push(t - last); last = t; if (!stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const H = document.body.scrollHeight, steps = 40;
    for (let i = 1; i <= steps; i++) { window.scrollTo(0, (H / steps) * i); await new Promise((r) => setTimeout(r, 30)); }
    stop = true;
    const s = f.slice(3).sort((a, b) => a - b);
    return { p50: Math.round(s[Math.floor(s.length * 0.5)] * 10) / 10, p95: Math.round(s[Math.floor(s.length * 0.95)] * 10) / 10, worst: Math.round(Math.max(...s) * 10) / 10, n: s.length };
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  // ── STATES: a real Tab walk, judged in clipped PIXELS (memory: computed
  //    outlineColor lies; a programmatic .focus() is not a focus-visible)
  const stops = [];
  await page.evaluate(() => { document.body.setAttribute("tabindex", "-1"); document.body.focus(); });
  // 26 was the cap, not the wrap. The home page carries 135 focusable elements and the
  // walk stopped at exactly 26 every time, always the same 26 — five utility links, the
  // nav, the hero and three form inputs. NOTHING below the first screen and a half had
  // ever been focus-tested: not a listing card, not a rail arrow, not the footer, not a
  // single control on any page's second half. A focus regression in any of them shipped
  // green. 120 covers the whole document on every page in this campaign.
  const MAXSTOPS = 120;
  for (let i = 0; i < MAXSTOPS; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      const cs = getComputedStyle(el);
      // THE WRAP IS AN ELEMENT WE HAVE ALREADY STOOD ON, not a string that looks
      // familiar. The old key was `tag|name|rounded x,y`, and two adjacent listing
      // cards each carry a "Save this home" button at the same document Y — an
      // identical key — so on any page with a repeated card control the walk ended
      // early and reported a healthy partial page as a complete one. Element
      // identity cannot collide with itself.
      const seen = el.hasAttribute("data-r32-focus");
      el.setAttribute("data-r32-focus", "1");
      return { tag: el.tagName, name: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
        x: r.x, y: r.y, w: r.width, h: r.height, inView: r.top >= -2 && r.bottom <= innerHeight + 2,
        seen, outlineW: parseFloat(cs.outlineWidth) || 0, outlineC: cs.outlineColor };
    });
    if (!info) break;
    if (info.seen) break; // the walk has come back round to a control it already graded
    const key = info.tag + "|" + info.name + "|" + Math.round(info.x) + "," + Math.round(info.y);
    if (!info.inView) { await page.evaluate(() => document.activeElement.scrollIntoView({ block: "center", behavior: "instant" })); await page.waitForTimeout(150); }
    // THE RING IS NOT ALWAYS ON THE FOCUSED ELEMENT. The hero search input carries
    // `focus:outline-none` and hands its focus state to the instrument around it,
    // whose ring lands ~12px outside the input's own box — so an 8px clip
    // photographed the one place the ring is guaranteed not to be, and reported the
    // site's primary control as ringless. Clip to whichever ancestor actually draws
    // an outline while this element holds focus.
    const pre = await page.evaluate(() => {
      let el = document.activeElement, drawn = el;
      for (let n = el, i = 0; n && i < 4; n = n.parentElement, i++) {
        const cs = getComputedStyle(n);
        if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) { drawn = n; break; }
      }
      const r = drawn.getBoundingClientRect();
      const pad = 14;
      return { y: window.scrollY, onAncestor: drawn !== el, r: {
        x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad),
        width: Math.min(r.width + pad * 2, 1400), height: Math.min(r.height + pad * 2, 800) } };
    });
    const box = pre.r;
    if (box.width < 4 || box.height < 4) continue;
    const withFocus = await page.screenshot({ clip: box });
    // blur() removes the ring WITHOUT scrolling; focus({preventScroll}) puts the
    // Tab cursor back without moving the page. The first version used
    // body.focus() + focus(), which scrolled between the two shots and reported a
    // 99.7% "ring".
    await page.evaluate(() => { const a = document.activeElement; a.setAttribute("data-r32-was", "1"); a.blur(); });
    await page.waitForTimeout(70);
    const without = await page.screenshot({ clip: box });
    const post = await page.evaluate(() => {
      const a = document.querySelector("[data-r32-was]");
      if (a) { a.focus({ preventScroll: true }); a.removeAttribute("data-r32-was"); }
      return window.scrollY;
    });
    const diff = await pixelDiff(withFocus, without);
    const moved = Math.abs(post - pre.y) > 1;
    // A RING IS A THIN ANNULUS. With no upper bound, any page-state change that
    // happens to be triggered by focus was being graded as a ring: on production,
    // focusing the Top Areas nav link OPENED THE MEGAMENU, changed 99.75% of the clip,
    // and scored 5.26:1 — an excellent focus indicator, according to an instrument
    // that had just photographed a menu. The skip link appearing scored 57.83% the
    // same way. Past this much change the clip is no longer showing a ring around a
    // control, so the stop is recorded as unmeasurable and graded neither way rather
    // than being counted as a healthy ring.
    const RING_MAX_PCT = 40;
    const stateChanged = !moved && diff.pct > RING_MAX_PCT;
    stops.push({ ...info, key, diffPct: moved ? -1 : diff.pct, ringContrast: moved || stateChanged ? 0 : diff.contrast,
      ring: diff.ring, invalid: moved, stateChanged, ringOnAncestor: pre.onAncestor });
    if (i < 3 || diff.pct < 0.4) {
      fs.writeFileSync(path.join(SHOTDIR, `focus-${i}-${info.tag}.png`), withFocus);
    }
  }
  ev.focusStops = stops;
  // BACK TO THE TOP BEFORE THE NEXT DIMENSION USES THE PAGE. The walk scrolls each stop
  // into view, and widening it from 26 stops to 120 meant it now ends deep in the
  // document instead of just past the hero. The hover/press probe that runs next reads
  // `aboveFold` coordinates captured at scroll 0 and skips any control whose clip falls
  // outside the 900px viewport — so on the first widened run it probed almost nothing and
  // charged the home page 2.5 points for controls that answer both a hover and a press.
  // A dimension must not inherit the page state the previous dimension left behind.
  // (memory: verify-scorer-run-order-pollution)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(350);

  // ── HOVER + PRESS on the primary controls, judged in pixels.
  //    The first version took the first 8 above-fold controls in DOM order and
  //    therefore only ever probed the site header — it never reached a single
  //    hero CTA and concluded "no control answers a press". Probe by PROMINENCE:
  //    the filled controls first, then the largest.
  const ctlProbe = D.controls
    .filter((c) => c.aboveFold && c.w >= 40 && c.h >= 20 && !c.clipped)
    .sort((a, b) => (b.filled ? 1e9 : 0) + b.area - ((a.filled ? 1e9 : 0) + a.area))
    .slice(0, 8);
  // Pressing a control means mouse-down AND mouse-up on it, which on an <a> is a
  // click — the probe navigated away mid-run and the next lookup died with
  // "Execution context was destroyed". Activation is suppressed in the capture
  // phase so :active still paints and nothing follows the href.
  await page.evaluate(() => {
    window.__r32NoNav = (e) => { e.preventDefault(); e.stopPropagation(); };
    document.addEventListener("click", window.__r32NoNav, true);
    document.addEventListener("submit", window.__r32NoNav, true);
  });
  const inter = [];
  for (const c of ctlProbe) {
    const sel = `[data-r32="${c.i}"]`;
    const el = await page.$(sel);
    if (!el) continue;
    const box = await el.boundingBox();
    if (!box || box.width < 4) continue;
    const clip = { x: Math.max(0, box.x - 6), y: Math.max(0, box.y - 6), width: Math.min(box.width + 12, 1400), height: Math.min(box.height + 12, 780) };
    if (clip.y + clip.height > 900) continue;
    const rest = await page.screenshot({ clip });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(320);
    const hov = await page.screenshot({ clip });
    await page.mouse.down();
    await page.waitForTimeout(190);
    const press = await page.screenshot({ clip });
    await page.mouse.up();
    await page.mouse.move(2, 2);
    await page.waitForTimeout(220);
    inter.push({ name: c.name || c.tag, hoverPct: (await pixelDiff(rest, hov)).pct, pressPct: (await pixelDiff(hov, press)).pct, filled: c.filled });
  }
  ev.inter = inter;
  await page.evaluate(() => {
    document.removeEventListener("click", window.__r32NoNav, true);
    document.removeEventListener("submit", window.__r32NoNav, true);
  });

  // reduced motion: every movement must be GONE, not merely fast
  const rmCtx = await newCtx({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const rmPage = await rmCtx.newPage();
  await rmPage.goto(BASE + PATHNAME, { waitUntil: "domcontentloaded", timeout: 60000 });
  await rmPage.waitForTimeout(1500);
  // The break has to reach THIS context too. Reduced motion runs in its own browser
  // context that `settle()` never touches, so D7's "infinite animation survives
  // reduced motion" rule had no way to fail — the injection simply never arrived here.
  if (BREAK) { await rmPage.addStyleTag({ content: BREAK_CSS }); await rmPage.evaluate(BREAK_DOM); await rmPage.waitForTimeout(200); }
  ev.reducedMotion = await rmPage.evaluate(() => {
    const moving = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.animationName !== "none" && cs.animationIterationCount === "infinite" && parseFloat(cs.animationDuration) > 0.05) {
        moving.push(cs.animationName);
      }
    }
    return { infiniteAnims: [...new Set(moving)] };
  });
  await rmCtx.close();
  await ctx.close();

  // ── MOBILE 390 + 320 ───────────────────────────────────────────────────────
  for (const W of [390, 320]) {
    const mctx = await newCtx({ viewport: { width: W, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const mp = await mctx.newPage();
    await mp.goto(BASE + PATHNAME, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(mp);
    ev["m" + W] = await mp.evaluate(COLLECT);
    ev["of" + W] = await mp.evaluate(OVERFLOW);
    await mp.screenshot({ path: path.join(SHOTDIR, `${W}-fold.png`) });
    if (W === 390) await mp.screenshot({ path: path.join(SHOTDIR, "390-full.png"), fullPage: true });
    await mctx.close();
  }

  // ── JS OFF ─────────────────────────────────────────────────────────────────
  const nctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  if (!ALLOW_MEDIA) await nctx.route("**/api/media/**", (r) => r.abort());
  const np = await nctx.newPage();
  await np.goto(BASE + PATHNAME, { waitUntil: "domcontentloaded", timeout: 60000 });
  await np.waitForTimeout(1200);
  ev.jsOff = await np.evaluate(() => ({
    h1: (document.querySelector("h1") || {}).innerText?.replace(/\s+/g, " ").trim().slice(0, 70) || "",
    words: document.body.innerText.split(/\s+/).filter(Boolean).length,
    links: document.querySelectorAll("a[href]").length,
    stuck: /loading|Loading…|Loading\.\.\./.test(document.body.innerText),
  }));
  await np.screenshot({ path: path.join(SHOTDIR, "jsoff-1440.png") });
  await nctx.close();
  await browser.close();

  ev.jsOnWords = D.bodyText.split(/\s+/).filter(Boolean).length;
  score(out, ev);
  fs.writeFileSync(path.join(SHOTDIR, "score.json"), JSON.stringify({ out, ev: slimEvidence(ev) }, null, 1));
  report(out, ev);
}

// ── A REAL pixel comparator. sharp is already a dependency, so the diff is
//    computed on decoded RGB, not on compressed PNG bytes — a byte compare can
//    only ever answer "different or not", and a focus ring has to be judged on
//    how many pixels changed and to WHAT COLOUR.
//    (memory: verify-focus-visible-needs-real-tab — computed outlineColor lies,
//     judge rings by clipped PIXELS.)
async function pixelDiff(aBuf, bBuf) {
  const A = await sharp(aBuf).raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(bBuf).raw().toBuffer({ resolveWithObject: true });
  if (A.data.length !== B.data.length) return { pct: 100, ring: null, contrast: 0 };
  const ch = A.info.channels, n = A.info.width * A.info.height;
  let changed = 0;
  let sr = 0, sg = 0, sb = 0;      // mean colour of the pixels that APPEARED
  let br = 0, bg = 0, bb = 0, bn = 0; // mean colour of what was there before
  for (let p = 0; p < n; p++) {
    const i = p * ch;
    const d = Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]);
    if (d > 24) {
      changed++;
      sr += A.data[i]; sg += A.data[i + 1]; sb += A.data[i + 2];
      br += B.data[i]; bg += B.data[i + 1]; bb += B.data[i + 2];
      bn++;
    }
  }
  const pct = Math.round((changed / n) * 10000) / 100;
  if (!bn) return { pct, ring: null, contrast: 0 };
  const ring = [Math.round(sr / bn), Math.round(sg / bn), Math.round(sb / bn)];
  const base = [Math.round(br / bn), Math.round(bg / bn), Math.round(bb / bn)];
  return { pct, ring, base, contrast: Math.round(ratio(ring, base) * 100) / 100 };
}

function slimEvidence(ev) {
  const s = JSON.parse(JSON.stringify(ev));
  for (const k of ["d", "m390", "m320"]) if (s[k]) { delete s[k].bodyText; delete s[k].type; }
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE RUBRIC. Every deduction below is a written rule with a measured input.
// ─────────────────────────────────────────────────────────────────────────────
function score(out, ev) {
  const D = ev.d, M = ev.m390 || ev.d, S = out.scores = {}, N = out.notes = {};
  const pen = (label, cond, amount) => (cond ? (N[label] = amount, amount) : 0);

  // D1 — FIRST-IMPRESSION HIERARCHY
  {
    const fold = D.type.filter((t) => t.y < D.fold && t.y > -20);
    const sizes = [...new Set(fold.map((t) => t.size))].sort((a, b) => b - a);
    const h1 = sizes[0] || 0, second = sizes.find((s) => s < h1 * 0.92) || h1;
    const r = second ? h1 / second : 1;
    const big = fold.filter((t) => t.size >= 24).length;
    const filled = D.controls.filter((c) => c.aboveFold && c.filled && c.w > 60).length;
    const words = fold.reduce((a, t) => a + t.words, 0);
    const largestIsH1 = fold.some((t) => t.size === h1 && /^H1$/.test(t.tag));
    let v = 5;
    v -= pen("D1 ratio<1.35", r < 1.35, 1.5);
    v -= pen("D1 >4 big blocks above fold", big > 4, 1);
    v -= pen("D1 >2 filled CTAs above fold", filled > 2, 1);
    v -= pen("D1 >90 words above fold", words > 90, 1);
    v -= pen("D1 largest type is not the h1", !largestIsH1, 1);
    S.D1 = clamp5(v);
    ev.D1 = { h1, second, ratio: Math.round(r * 100) / 100, big, filled, words, largestIsH1 };
  }

  // D2 — TYPE SCALE AND RHYTHM
  {
    const heads = D.type.filter((t) => t.size >= 20);
    const scale = new Set(D.scaleSizes.map((s) => Math.round(s)));
    const offScale = [...new Set(heads.map((t) => Math.round(t.size)))].filter((s) => ![...scale].some((k) => Math.abs(k - s) <= 1));
    const body = D.type.filter((t) => t.size >= 12 && t.size < 20 && t.words >= 6);
    const badLH = body.filter((t) => t.lh > 0 && t.lh < 1.45).length;
    const bodySizes = [...new Set(body.map((t) => Math.round(t.size)))];
    const looseDisplay = D.type.filter((t) => t.size >= 40 && t.ls >= 0).length;
    let v = 5;
    v -= pen("D2 off-scale heading sizes", offScale.length > 0, Math.min(2, offScale.length * 0.75));
    v -= pen("D2 body line-height under 1.45", badLH > 2, 1);
    v -= pen("D2 >4 distinct body sizes", bodySizes.length > 4, 1);
    v -= pen("D2 display type not tracked in", looseDisplay > 0, 1);
    S.D2 = clamp5(v);
    ev.D2 = { scaleSizes: D.scaleSizes, offScale, offScaleSamples: [...new Set(heads.filter((t) => offScale.includes(Math.round(t.size))).map((t) => `${Math.round(t.size)}px "${t.text.slice(0, 30)}"`))].slice(0, 4),
      bodySizes, badLH, badLHSamples: body.filter((t) => t.lh > 0 && t.lh < 1.45).slice(0, 4).map((t) => `${t.size}px/${Math.round(t.lh * 100) / 100} "${t.text.slice(0, 30)}"`), looseDisplay };
  }

  // D3 — SPACING AND OPTICAL ALIGNMENT
  {
    const ok = new Set(D.rhythm);
    const secs = D.sections.filter((s) => s.h > 200 && s.pt > 0);
    const offRhythm = secs.filter((s) => ![...ok].some((k) => Math.abs(k - s.pt) <= 2)).map((s) => s.pt);
    // Tailwind's own spacing scale is 4px with legitimate .5 half-steps (2px, 6px,
    // 10px), so "off the 4px grid" failed this codebase for using its framework
    // correctly. The real grid here is 2px; 7px or 13px is drift, 6px is not.
    const offGrid = D.gaps.filter((g) => g % 2 !== 0);
    const edges = Object.entries(D.leftEdges).filter(([, n]) => n >= 3).map(([x]) => +x).sort((a, b) => a - b);
    let v = 5;
    v -= pen("D3 sections off the rhythm scale", offRhythm.length > 0, Math.min(2, offRhythm.length * 0.5));
    v -= pen("D3 gaps off the 4px grid", offGrid.length > 0, Math.min(1, offGrid.length * 0.5));
    v -= pen("D3 >4 distinct text left edges", edges.length > 4, 1);
    v -= pen("D3 asymmetric section padding", secs.filter((s) => Math.abs(s.pt - s.pb) > 8).length > 2, 1);
    S.D3 = clamp5(v);
    ev.D3 = { rhythm: D.rhythm, offRhythm, gaps: D.gaps, offGrid, edges };
  }

  // D4 — PHOTOGRAPHY TREATMENT
  {
    const I = D.imgs;
    const squashed = I.filter((i) => i.nw > 0 && i.fit !== "cover" && i.fit !== "contain" && Math.abs(i.nw / i.nh - i.w / i.h) / (i.nw / i.nh) > 0.03);
    const noAlt = I.filter((i) => !i.hasAlt);
    const unsized = I.filter((i) => !i.sizedByAttr);
    const lazyTop = I.filter((i) => i.aboveFold && i.lazy);
    const radiiUsed = [...new Set(I.filter((i) => i.w > 80).map((i) => i.radius))];
    const oddRadius = radiiUsed.filter((r) => !RADII.some((k) => Math.abs(k - r) <= 1) && r < 400);
    let v = 5;
    if (I.length === 0) { v = 5; N["D4 no photography on this page"] = 0; }
    else {
      v -= pen("D4 stretched images", squashed.length > 0, Math.min(2, squashed.length));
      v -= pen("D4 missing alt", noAlt.length > 0, Math.min(1.5, noAlt.length * 0.5));
      v -= pen("D4 unsized images (CLS risk)", unsized.length > 2, 1);
      v -= pen("D4 lazy image above the fold", lazyTop.length > 0, 1);
      v -= pen("D4 corner radius off the scale", oddRadius.length > 0, 1);
    }
    S.D4 = clamp5(v);
    ev.D4 = { n: I.length, squashed: squashed.length, noAlt: noAlt.length, unsized: unsized.length, lazyTop: lazyTop.length, radiiUsed, oddRadius };
  }

  // D5 — COLOUR RESTRAINT
  {
    const entries = Object.entries(D.colours).map(([k, n]) => [k.split(",").map(Number), n]);
    const off = entries.filter(([rgb, n]) => n >= 2 && !nearToken(rgb) && !(rgb[0] > 248 && rgb[1] > 248 && rgb[2] > 248));
    const offList = off.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([rgb, n]) => `rgb(${rgb.join(" ")})x${n}`);
    const accentFold = D.controls.filter((c) => c.aboveFold && c.filled).length;
    const badRadii = Object.keys(D.radii).map(Number).filter((r) => !RADII.some((k) => Math.abs(k - r) <= 1));
    let v = 5;
    v -= pen("D5 gradient on a control or text", D.gradientCtl.length > 0, 2);
    v -= pen("D5 colours outside the token set", off.length > 0, Math.min(2, off.length * 0.5));
    v -= pen("D5 radii outside the scale", badRadii.length > 0, Math.min(1, badRadii.length * 0.5));
    S.D5 = clamp5(v);
    ev.D5 = { distinct: entries.length, offToken: off.length, offList, gradients: D.gradientCtl.slice(0, 4), radii: Object.keys(D.radii), badRadii, accentFold };
  }

  // D6 — STATE COMPLETENESS
  {
    const all = (ev.focusStops || []).filter((s) => !s.invalid);
    // Stops whose clip changed past the ring bound are page-state changes, not rings.
    // They are neither credited nor penalised, and they are COUNTED so a page that
    // hides its focus problems behind opening menus is visible in the evidence.
    const stops = all.filter((s) => !s.stateChanged);
    const unmeasurable = all.filter((s) => s.stateChanged);
    const noRing = stops.filter((s) => s.diffPct >= 0 && s.diffPct < 0.4);
    const weakRing = stops.filter((s) => s.diffPct >= 0.4 && s.ringContrast > 0 && s.ringContrast < 3);
    const hovered = (ev.inter || []).filter((i) => i.hoverPct >= 0.25);
    const pressed = (ev.inter || []).filter((i) => i.pressPct >= 0.15);
    const claimPress = D.controls.filter((c) => /scale|transform/.test(c.transProp)).length;
    let v = 5;
    v -= pen("D6 focus stops with no visible ring", noRing.length > 0, Math.min(2.5, noRing.length * 1.25));
    v -= pen("D6 focus ring under 3:1", weakRing.length > 0, Math.min(1, weakRing.length * 0.5));
    v -= pen("D6 controls that ignore hover", (ev.inter || []).length > 0 && hovered.length / ev.inter.length < 0.6, 1);
    v -= pen("D6 controls that ignore a press", (ev.inter || []).length > 0 && pressed.length === 0, 1.5);
    v -= pen("D6 no control claims a press transition", claimPress === 0, 0.5);
    S.D6 = clamp5(v);
    ev.D6 = { stops: stops.length, walked: all.length,
      unmeasurable: unmeasurable.map((s) => `${s.tag}"${s.name}" changed ${s.diffPct}% of the clip`),
      noRing: noRing.map((s) => `${s.tag}"${s.name}"@${Math.round(s.x)},${Math.round(s.y)} ${Math.round(s.w)}x${Math.round(s.h)}`),
      ringContrast: { min: stops.length ? Math.min(...stops.filter((s) => s.ringContrast > 0).map((s) => s.ringContrast)) : 0, under3: weakRing.map((s) => `${s.tag}:${s.name}@${s.ringContrast}`) },
      hovered: hovered.length, pressed: pressed.length, probed: (ev.inter || []).length, claimPress };
  }

  // D7 — MOTION QUALITY
  {
    const m = D.motion;
    // Only INTERACTIVE transitions are held to the 300ms UI budget. A card's slow
    // photo zoom (1200ms) and a section reveal (500ms) are deliberate, documented
    // decorative motion, and the first version of this rule failed the page for
    // both of them.
    const longUId = m.filter((x) => x.kind === "transition" && x.max > 300 && x.interactive);
    const layoutPropsD = m.filter((x) => x.kind === "transition" && /\b(width|height|margin|padding|top|left|right|bottom)\b/.test(x.props));
    const uniq = (arr, f) => [...new Set(arr.map(f))];
    // The curves actually in use. Anything outside the site's own two, plus the
    // three CSS keywords a non-moving transition may legitimately carry, is drift.
    const OK_CURVES = ["cubic-bezier(0.22, 1, 0.36, 1)", "cubic-bezier(0.77, 0, 0.175, 1)", "ease", "linear", "ease-in-out", "cubic-bezier(0.25, 0.1, 0.25, 1)", "cubic-bezier(0.42, 0, 0.58, 1)"];
    const curves = uniq(m, (x) => x.ease);
    const offCurves = curves.filter((c) => !OK_CURVES.includes(c));
    const infinite = (ev.reducedMotion || {}).infiniteAnims || [];
    const p95 = (ev.scroll || {}).p95 || 0;
    let v = 5;
    v -= pen("D7 UI transitions over 300ms", longUId.length > 0, Math.min(1.5, longUId.length * 0.5));
    v -= pen("D7 transitions on layout properties", layoutPropsD.length > 0, Math.min(1.5, layoutPropsD.length * 0.5));
    v -= pen("D7 curves outside the two site tokens", offCurves.length > 0, Math.min(1, offCurves.length * 0.5));
    v -= pen("D7 infinite animation survives reduced motion", infinite.length > 0, 1);
    v -= pen("D7 scroll p95 over 20ms", p95 > 20, 1.5);
    S.D7 = clamp5(v);
    ev.D7 = { decls: m.length, longUI: uniq(longUId, (x) => `${x.props.slice(0, 40)}@${x.max}ms`),
      layoutProps: uniq(layoutPropsD, (x) => x.props.slice(0, 60)), curves, offCurves, infinite, scroll: ev.scroll };
  }

  // D8 — COPY HONESTY AND VOICE
  {
    const t = D.bodyText;
    const emDash = (t.match(/—/g) || []).length;
    const arrows = D.ctaText.filter((c) => /[→➔»›⟶↗]/.test(c));
    const HYPE = /\b(world[- ]class|cutting[- ]edge|seamless(ly)?|revolutioni[sz]e|unlock|elevate your|unparalleled|best[- ]in[- ]class|game[- ]chang|synerg|leverage our|premier|unrivalled|unrivaled|state[- ]of[- ]the[- ]art)\b/gi;
    const hype = [...new Set((t.match(HYPE) || []).map((s) => s.toLowerCase()))];
    const VAGUE = /^(learn more|submit|click here|get started|read more|find out more|explore|discover)$/i;
    const vague = D.ctaText.filter((c) => VAGUE.test(c.trim()));
    let v = 5;
    v -= pen("D8 em dash in visitor copy", emDash > 0, 2);
    v -= pen("D8 arrow-glyph CTA", arrows.length > 0, 2);
    v -= pen("D8 unverifiable superlatives", hype.length > 0, Math.min(1.5, hype.length * 0.75));
    v -= pen("D8 vague CTA labels", vague.length > 0, Math.min(1.5, vague.length * 0.5));
    S.D8 = clamp5(v);
    ev.D8 = { emDash, arrows, hype, vague: [...new Set(vague)] };
  }

  // D9 — MOBILE ERGONOMICS
  {
    const of390 = ev.of390 || {}, of320 = ev.of320 || {};
    const over390 = of390.scrollW > of390.clientW + 1, over320 = of320.scrollW > of320.clientW + 1;
    const small = M.controls.filter((c) => (c.tw < 24 || c.th < 24) && c.tw > 0 && !c.clipped);
    const tinyText = M.type.filter((t) => t.size < 16 && t.words >= 8);
    const tinySamples = tinyText.slice(0, 6).map((t) => `${t.size}px "${t.text.slice(0, 34)}"`);
    const tinyInputs = M.controls.filter((c) => c.isInput && c.fontSize < 16);
    let v = 5;
    v -= pen("D9 horizontal overflow at 390", over390, 2);
    v -= pen("D9 horizontal overflow at 320", over320, 2);
    v -= pen("D9 tap targets under 24px", small.length > 0, Math.min(1.5, small.length * 0.5));
    v -= pen("D9 body copy under 16px on mobile", tinyText.length > 3, 1);
    v -= pen("D9 form control under 16px (iOS zooms)", tinyInputs.length > 0, 1);
    S.D9 = clamp5(v);
    ev.D9 = { over390: of390.scrollW + "/" + of390.clientW, over320: of320.scrollW + "/" + of320.clientW,
      offenders390: (of390.bad || []).slice(0, 3), offenders320: (of320.bad || []).slice(0, 3),
      smallTargets: small.slice(0, 5).map((c) => `${c.tag}"${c.name}" target ${c.tw}x${c.th}`), tinyText: tinyText.length, tinySamples, tinyInputs: tinyInputs.length };
  }

  // D10 — ACCESSIBILITY FLOORS
  {
    const cf = D.contrastFails;
    const noName = D.controls.filter((c) => !c.hasName && !c.clipped);
    const H = D.headings;
    let skips = 0;
    for (let i = 1; i < H.length; i++) if (H[i].lvl - H[i - 1].lvl > 1) skips++;
    const lm = D.landmarks;
    let v = 5;
    v -= pen("D10 text below the AA contrast floor", cf.length > 0, Math.min(2, cf.length * 0.5));
    v -= pen("D10 control with no accessible name", noName.length > 0, Math.min(1.5, noName.length * 0.75));
    v -= pen("D10 heading level skipped", skips > 0, Math.min(1, skips * 0.5));
    v -= pen("D10 landmark or single-h1 missing", !lm.main || !lm.nav || !lm.footer || lm.h1 !== 1, 1);
    S.D10 = clamp5(v);
    ev.D10 = { contrastFails: cf.slice(0, 5), noName: noName.slice(0, 4).map((c) => `${c.tag}@${c.x},${c.y}`), skips, landmarks: lm,
      overMediaTextDelegated: D.overMediaText };
  }

  // D11 — PERFORMANCE FEEL
  {
    const p = ev.perf || {};
    let v = 5;
    v -= pen("D11 LCP over 2500ms", p.lcp > 2500, 1.5);
    v -= pen("D11 CLS over 0.1", p.cls > 0.1, 1.5);
    v -= pen("D11 long task over 200ms", p.worstTask > 200, 1);
    v -= pen("D11 scroll worst frame over 33ms", (ev.scroll || {}).worst > 33, 1);
    S.D11 = clamp5(v);
    // MEASURED ON THE DEV SERVER. LCP/FCP/long-task numbers here are inflated by
    // on-demand compilation and are only ever a BEFORE-vs-AFTER signal on the same
    // server; they are not production numbers. CLS and the scroll frame budget are
    // build-independent and can be read as-is.
    ev.D11 = { ...p, scroll: ev.scroll, wallMs: ev.wall, note: "dev server — LCP/FCP/longTask are relative only" };
  }

  // D12 — RESILIENCE (JS OFF)
  {
    const j = ev.jsOff || {};
    const ratioW = ev.jsOnWords ? j.words / ev.jsOnWords : 0;
    let v = 5;
    v -= pen("D12 no h1 without JS", !j.h1, 2);
    v -= pen("D12 under half the copy without JS", ratioW < 0.5, 2);
    v -= pen("D12 stuck on a loading placeholder", j.stuck, 1.5);
    v -= pen("D12 fewer than 5 links without JS", j.links < 5, 1);
    S.D12 = clamp5(v);
    ev.D12 = { h1: j.h1, words: j.words, jsOnWords: ev.jsOnWords, wordRatio: Math.round(ratioW * 100) / 100, links: j.links, stuck: j.stuck };
  }

  out.total = Object.values(S).reduce((a, b) => a + b, 0);
}

const NAMES = { D1: "first-impression hierarchy", D2: "type scale and rhythm", D3: "spacing and optical alignment",
  D4: "photography treatment", D5: "colour restraint", D6: "state completeness", D7: "motion quality",
  D8: "copy honesty and voice", D9: "mobile ergonomics", D10: "accessibility floors", D11: "performance feel", D12: "resilience (JS off)" };

function report(out, ev) {
  console.log(`\n${"═".repeat(74)}`);
  console.log(`  R32 RUBRIC — ${out.label}  (${out.path})${out.broken ? "   [BREAK_CSS INJECTED]" : ""}`);
  console.log("═".repeat(74));
  for (const k of Object.keys(NAMES)) {
    const s = out.scores[k];
    const bar = "█".repeat(Math.round(s * 4)).padEnd(20, "·");
    console.log(`  ${k.padEnd(4)} ${NAMES[k].padEnd(32)} ${bar} ${String(s).padStart(4)}/5`);
    console.log(`       ${JSON.stringify(ev[k])}`.slice(0, 500));
  }
  console.log("─".repeat(74));
  console.log(`  TOTAL  ${out.total} / 60`);
  console.log("─".repeat(74));
  console.log("  deductions taken:");
  for (const [k, v] of Object.entries(out.notes)) console.log(`   -${v}  ${k}`);
  console.log(`\n  shots + score.json -> ${SHOTDIR}\n`);
}

run().catch((e) => { console.error(e); process.exit(1); });
