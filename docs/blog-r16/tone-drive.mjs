/** Round 16, fix 2: the rail-tone drive.
 *
 *   node docs/blog-r16/tone-drive.mjs http://127.0.0.1:3108 [slug] [width]
 *
 * Walks the page top to bottom in 200 px steps. At each step it reads the colours the floating
 * contents rail chose (its label colour and its card's background; at narrow widths the pill's
 * colours) and samples the REAL page pixels under the viewport's middle where the rail's card
 * sits, with the rail and the pill hidden for the sample. Two contrasts per step: the label on
 * the page (the rail at rest) and the label on its translucent card over the page (the rail
 * open, which is when the labels show). A step fails when the open rail reads under 4.5:1.
 * It also names the band the rail's own rule picked (data-band) and what sits under the middle.
 * Exported as `toneDrive` for probe.mjs. */
import sharp from "sharp";

const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = ([r1, g1, b1, a = 1], [r0, g0, b0]) => [
  r1 * a + r0 * (1 - a),
  g1 * a + g0 * (1 - a),
  b1 * a + b0 * (1 - a),
];

export async function toneDrive(browser, base, slug, width) {
  const h = width < 800 ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width, height: h } });
  const page = await ctx.newPage();
  await page.route("**/api/media/**", (r) => r.abort());
  await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const rows = [];
  for (let y = 0; y + h <= total + 200; y += 200) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(140);
    const s = await page.evaluate(() => {
      // Colours come back as oklab() under the site's night tokens, so a canvas turns them into rgba.
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const rgba = (c) => {
        cv.clearRect(0, 0, 1, 1);
        cv.fillStyle = c;
        cv.fillRect(0, 0, 1, 1);
        const d = cv.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], +(d[3] / 255).toFixed(3)];
      };
      const mid = innerHeight / 2;
      const nav = document.querySelector("nav[data-toc]");
      const navVisible = nav && getComputedStyle(nav).display !== "none";
      let label = null;
      let cardBg = null;
      let box = null;
      if (navVisible) {
        const spans = [...nav.querySelectorAll("a > span:last-child")];
        const plain = spans.find((sp) => !sp.closest("a").hasAttribute("aria-current")) ?? spans[0];
        label = plain ? rgba(getComputedStyle(plain).color) : null;
        const card = nav.querySelector(":scope > div[aria-hidden]");
        cardBg = card ? rgba(getComputedStyle(card).backgroundColor) : null;
        const r = nav.getBoundingClientRect();
        box = { x: Math.max(0, Math.round(r.left)), w: 200 };
      }
      const pill = document.querySelector("[data-toc-trigger]");
      const pillInfo = pill ? { color: rgba(getComputedStyle(pill).color), bg: rgba(getComputedStyle(pill).backgroundColor) } : null;
      let band = null;
      for (const el of document.querySelectorAll("[data-band]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          band = `${el.dataset.band}:${el.id || el.className.toString().slice(0, 30)}`;
          break;
        }
      }
      const x = box ? box.x + 100 : innerWidth / 2;
      const stack = document
        .elementsFromPoint(x, mid)
        .filter((e) => !e.closest("nav[data-toc]") && !e.closest("[data-toc-trigger]"));
      let region = stack[0];
      while (region && region.parentElement && region.parentElement !== document.body && !region.matches("section,footer,header,[data-band]"))
        region = region.parentElement;
      const name = (e) =>
        e
          ? `${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${e.dataset?.band ? "[band=" + e.dataset.band + "]" : ""}.${e.className.toString().split(" ").slice(0, 3).join(".")}`
          : "none";
      return { label, cardBg, box, pill: pillInfo, band, under: name(region), mid };
    });
    // Sample the page pixels where the rail's card would sit, with the fixed controls hidden.
    const hide = await page.addStyleTag({ content: "nav[data-toc],[data-toc-trigger]{visibility:hidden !important}" });
    const clip = s.box
      ? { x: s.box.x, y: Math.round(s.mid - 60), width: s.box.w, height: 120 }
      : { x: Math.round(width / 2 - 80), y: h - 70, width: 160, height: 50 };
    const png = await page.screenshot({ clip });
    await hide.evaluate((el) => el.remove());
    const { data } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let r = 0, g = 0, b = 0;
    const n = data.length / 3;
    for (let i = 0; i < data.length; i += 3) ((r += data[i]), (g += data[i + 1]), (b += data[i + 2]));
    const bg = [r / n, g / n, b / n].map(Math.round);
    let contrast = null;
    let onCard = null;
    if (s.label) {
      contrast = ratio(over(s.label, bg), bg);
      const card = s.cardBg ? over(s.cardBg, bg) : bg;
      onCard = ratio(over(s.label, card), card);
    } else if (s.pill) {
      const pbg = over(s.pill.bg, bg);
      contrast = onCard = ratio(over(s.pill.color, pbg), pbg);
    }
    rows.push({
      y,
      band: s.band,
      under: s.under,
      rail: !!s.label,
      label: s.label && `rgba(${s.label.join(",")})`,
      card: s.cardBg && `rgba(${s.cardBg.join(",")})`,
      bg: `rgb(${bg.join(",")})`,
      contrast: contrast && +contrast.toFixed(2),
      onCard: onCard && +onCard.toFixed(2),
    });
  }
  await ctx.close();
  const low = rows.filter((x) => x.onCard !== null && x.onCard < 4.5);
  const railSteps = rows.filter((x) => x.rail).length;
  const minOnCard = Math.min(...rows.filter((x) => x.onCard !== null).map((x) => x.onCard));
  return { slug, width, steps: rows.length, railSteps, minOnCard: +minOnCard.toFixed(2), low, rows };
}

if (process.argv[1] && process.argv[1].endsWith("tone-drive.mjs")) {
  const { chromium } = await import("playwright");
  const base = process.argv[2] ?? "http://127.0.0.1:3108";
  const slugs = process.argv[3] ? [process.argv[3]] : ["ai-assessment-small-business-what-not-to-automate", "seller-disclosure-requirements-new-york"];
  const widths = process.argv[4] ? [+process.argv[4]] : [390, 1440, 1680];
  const browser = await chromium.launch();
  for (const slug of slugs)
    for (const w of widths) {
      const res = await toneDrive(browser, base, slug, w);
      console.log(`${slug} @${w}: ${res.steps} steps (${res.railSteps} with the rail shown, the rest the pill), lowest ${res.minOnCard}:1, ${res.low.length} under 4.5:1`);
      for (const x of res.low)
        console.log(`  y=${x.y} open ${x.onCard}:1, at rest ${x.contrast}:1; label ${x.label} card ${x.card} over ${x.bg}; band rule: ${x.band ?? "NO TAGGED BAND"}; under: ${x.under}`);
    }
  await browser.close();
}
