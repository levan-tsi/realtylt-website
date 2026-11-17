/** Round 28: does the page really scroll sideways at a width? Tries to scroll right at five depths and reads scrollX. */
import { chromium } from "playwright";
const [base, slug, width = "390"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.route("**/api/media/**", (r) => r.abort());
await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
const r = await page.evaluate(async () => {
  const H = document.documentElement.scrollHeight, out = [];
  for (const f of [0, 0.25, 0.5, 0.75, 0.98]) {
    window.scrollTo(400, H * f);
    await new Promise((ok) => setTimeout(ok, 250));
    out.push({ at: f, scrollX: Math.round(window.scrollX), sw: document.documentElement.scrollWidth, bodySw: document.body.scrollWidth, ox: getComputedStyle(document.documentElement).overflowX + "/" + getComputedStyle(document.body).overflowX });
  }
  return out;
});
console.log(JSON.stringify(r));
await browser.close();
