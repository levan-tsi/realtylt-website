// Third pass: top-of-page row structure (bars above/around header), nav row borders,
// dropdown menu styling, plus logo pixel sample via same-origin fetch->dataURL.
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("https://realtylt.com", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3000);

const out = await page.evaluate(() => {
  const rows = [];
  // Walk top-level visible blocks in first 320px of the page
  const walk = (el, depth) => {
    if (depth > 4) return;
    for (const c of Array.from(el.children || [])) {
      const r = c.getBoundingClientRect();
      if (r.height > 8 && r.height < 260 && r.top < 330 && r.width > 600) {
        const s = getComputedStyle(c);
        rows.push({
          depth,
          tag: c.tagName,
          cls: (c.className || "").toString().slice(0, 70),
          top: Math.round(r.top),
          h: Math.round(r.height),
          bg: s.backgroundColor,
          borderTop: s.borderTop,
          borderBottom: s.borderBottom,
          text: c.textContent.trim().replace(/\s+/g, " ").slice(0, 70),
        });
      }
      walk(c, depth + 1);
    }
  };
  walk(document.body, 0);
  return rows.slice(0, 30);
});

// hover color of nav link
const navHover = await page.evaluate(() => {
  const a = [...document.querySelectorAll("header a, nav a")].find((e) => e.textContent.trim() === "BUYING");
  return a ? getComputedStyle(a).color : null;
});
await page.hover("text=BUYING").catch(() => {});
await page.waitForTimeout(400);
const navHoverAfter = await page.evaluate(() => {
  const a = [...document.querySelectorAll("header a, nav a")].find((e) => e.textContent.trim() === "BUYING");
  return a ? getComputedStyle(a).color : null;
});

// TOP AREAS dropdown
await page.hover("text=TOP AREAS").catch(() => {});
await page.waitForTimeout(600);
const dropdown = await page.evaluate(() => {
  const items = [...document.querySelectorAll("a")].filter((e) => /dutchess|westchester/i.test(e.textContent) && e.offsetParent);
  if (!items.length) return null;
  const it = items[0];
  const s = getComputedStyle(it);
  const menu = it.closest("ul,div");
  const ms = menu ? getComputedStyle(menu) : null;
  return {
    item: { color: s.color, bg: s.backgroundColor, fs: s.fontSize, fw: s.fontWeight, tt: s.textTransform, pad: s.padding },
    menu: ms ? { bg: ms.backgroundColor, border: ms.border, shadow: ms.boxShadow, pad: ms.padding } : null,
    texts: items.map((e) => e.textContent.trim()).slice(0, 8),
  };
});

// logo sample: fetch via Playwright request API (bypasses CORS) -> dataURL -> canvas
const logoSrc = await page.evaluate(() => {
  const logo = document.querySelector("img[src*='LOGO' i], img[src*='logo' i]");
  return logo ? logo.src : null;
});
let logoDataUrl = null, logoBytes = null;
if (logoSrc) {
  const resp = await page.request.get(logoSrc);
  logoBytes = await resp.body();
  logoDataUrl = "data:image/png;base64," + logoBytes.toString("base64");
}
const logoBlue = !logoDataUrl ? "no logo" : await page.evaluate(async (url) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  const counts = {};
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
    if (a < 200) continue;
    if (b > r + 30 && b > g + 20) {
      const key = `${Math.round(r / 4) * 4},${Math.round(g / 4) * 4},${Math.round(b / 4) * 4}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, n]) => `rgb(${k}) x${n}`);
}, logoDataUrl);

console.log(JSON.stringify({ rows: out, navHover, navHoverAfter, dropdown, logoBlue }, null, 1));

// Save the live logo PNG to public/ (curl is blocked in this env)
if (logoBytes) {
  const { writeFileSync } = await import("fs");
  writeFileSync("public/logo-realtylt.png", logoBytes);
  console.error("LOGO SAVED public/logo-realtylt.png bytes=" + logoBytes.length);
}
await browser.close();
