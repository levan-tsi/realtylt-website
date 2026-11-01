/** Which elements reach past the right edge at a phone width, for any page.
 *   node docs/blog-r21/overflow.mjs http://127.0.0.1:3110 /blog/best-places-to-invest-hudson-valley 390 */
import { chromium } from "playwright";

const [base = "http://127.0.0.1:3110", route = "/", width = "390"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 844 } });
await page.route("**/api/media/**", (r) => r.abort());
await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 90000 });
const out = await page.evaluate(() => {
  const cw = document.documentElement.clientWidth;
  return [...document.querySelectorAll("body *")]
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .filter(({ r }) => r.right > cw + 0.5 && r.width > 0)
    .filter(({ e }) => ![...e.children].some((c) => c.getBoundingClientRect().right > cw + 0.5))
    .slice(0, 12)
    .map(({ e, r }) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 50)} right=${Math.round(r.right)} text="${(e.textContent || "").trim().slice(0, 70)}"`);
});
console.log(out.join("\n") || "nothing past the edge");
await browser.close();
