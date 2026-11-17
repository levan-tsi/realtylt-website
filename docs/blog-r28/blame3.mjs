/** Round 28: walk down from <body> to the element whose hiding brings the page back to the screen's width. */
import { chromium } from "playwright";
const [base, slug, width = "390"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.route("**/api/media/**", (r) => r.abort());
await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
const out = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth, sw = () => document.documentElement.scrollWidth, path = [];
  let node = document.body;
  for (let depth = 0; depth < 25; depth++) {
    let culprit = null;
    for (const c of node.children) { const d = c.style.display; c.style.display = "none"; const w = sw(); c.style.display = d; if (w <= cw) { culprit = c; break; } }
    if (!culprit) break;
    const r = culprit.getBoundingClientRect();
    path.push(`${culprit.tagName.toLowerCase()}#${culprit.id}.${String(culprit.className).slice(0, 70)} w=${Math.round(r.width)} right=${Math.round(r.right)}`);
    node = culprit;
  }
  return { sw: sw(), cw, path };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
