// Second pass: logo blue, section headings, top bars, outline buttons, card fonts, hover colors.
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("https://realtylt.com", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3000);

const out = await page.evaluate(() => {
  const cs = (el, props) => {
    if (!el) return null;
    const s = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    return o;
  };
  const tp = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color", "text-transform", "text-align"];
  const bp = ["background-color", "border", "border-radius", "padding"];
  const all = (sel) => [...document.querySelectorAll(sel)];

  // headings by text
  const byText = (txt) => all("h1,h2,h3,h4,div,span,p,a").find((e) => e.textContent.trim() === txt && e.offsetParent);
  const featured = byText("Featured Listings");
  const why = byText("Why Work With Us?");
  const fair = all("*").find((e) => /FAIR HOUSING NOTICE/i.test(e.textContent.trim()) && e.children.length <= 1 && e.offsetParent);
  const seeMore = all("a,button").find((e) => /SEE MORE LISTINGS/i.test(e.textContent.trim()) && e.offsetParent);
  const connect = all("header a, nav a").find((e) => e.textContent.trim() === "CONNECT");
  const signIn = all("a,span,button").find((e) => /sign in/i.test(e.textContent.trim()) && e.textContent.trim().length < 12 && e.offsetParent);
  // logo
  const logo = document.querySelector("header img, a[href='/'] img, img[alt*='ealty' i], img[src*='logo' i]");
  // hero search area buttons
  const heroBtns = all("a,button").filter((e) => /^(SEARCH|SELL YOUR HOME|SEE HOME VALUE)$/i.test(e.textContent.trim()) && e.offsetParent);
  // listing card price element (big $ text)
  const price = all("div,span,h2,h3,h4").find((e) => /^\$[\d,]+$/.test(e.textContent.trim()) && e.offsetParent);
  // top bar (parent of social icons / sign in)
  const topBar = signIn ? signIn.closest("div,section,header") : null;
  // "Listed With" attribution
  const listed = all("div,span,p").find((e) => /^Listed With/i.test(e.textContent.trim()) && e.children.length === 0 && e.offsetParent);
  // bottom brivity bar
  const powered = all("a,div,span,p").find((e) => /Powered by Brivity/i.test(e.textContent.trim()) && e.children.length <= 2 && e.offsetParent);
  const poweredBar = powered ? powered.closest("div,footer,section") : null;
  // beds/baths line
  const bedbath = all("div,span,p,li").find((e) => /\d+ bd \| \d+ ba/i.test(e.textContent.trim()) && e.children.length <= 2 && e.offsetParent);

  return {
    featured: featured ? { tag: featured.tagName, style: cs(featured, tp) } : null,
    why: why ? { tag: why.tagName, style: cs(why, tp), parentBg: cs(why.closest("section,div"), ["background-color"]) } : null,
    fair: fair ? { tag: fair.tagName, style: { ...cs(fair, tp), ...cs(fair.parentElement, bp) } } : null,
    seeMore: seeMore ? { tag: seeMore.tagName, style: { ...cs(seeMore, tp), ...cs(seeMore, bp) } } : null,
    connect: connect ? { style: { ...cs(connect, tp), ...cs(connect, bp) } } : null,
    signIn: signIn ? { tag: signIn.tagName, style: cs(signIn, tp) } : null,
    topBar: topBar ? { cls: (topBar.className || "").toString().slice(0, 60), style: cs(topBar, [...bp, "height"]) } : null,
    logo: logo ? { src: logo.src, w: logo.width, h: logo.height, alt: logo.alt } : null,
    heroBtns: heroBtns.map((b) => ({ text: b.textContent.trim(), style: { ...cs(b, tp), ...cs(b, bp) } })),
    price: price ? { tag: price.tagName, style: cs(price, tp) } : null,
    listed: listed ? { text: listed.textContent.trim().slice(0, 40), style: cs(listed, tp) } : null,
    bedbath: bedbath ? { text: bedbath.textContent.trim().slice(0, 40), style: cs(bedbath, tp) } : null,
    poweredBar: poweredBar ? { style: { ...cs(poweredBar, bp), color: getComputedStyle(poweredBar).color } } : null,
    linkDefault: (() => { const a = all("main a, section a").find((e) => e.offsetParent && !e.querySelector("img")); return a ? cs(a, tp) : null; })(),
  };
});

// Sample the logo's dominant blue via canvas
const logoBlue = await page.evaluate(async () => {
  const logo = document.querySelector("header img, a[href='/'] img, img[alt*='ealty' i], img[src*='logo' i]");
  if (!logo) return null;
  try {
    const c = document.createElement("canvas");
    c.width = logo.naturalWidth; c.height = logo.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(logo, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const counts = {};
    for (let i = 0; i < d.length; i += 4) {
      const [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
      if (a < 200) continue;
      // blue-ish pixels only
      if (b > r + 30 && b > g + 20) {
        const key = `${Math.round(r / 8) * 8},${Math.round(g / 8) * 8},${Math.round(b / 8) * 8}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    const top = Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 5);
    return top.map(([k, n]) => ({ rgb: k, n }));
  } catch (e) { return { error: String(e) }; }
});

console.log(JSON.stringify({ ...out, logoBlue }, null, 1));
await browser.close();
