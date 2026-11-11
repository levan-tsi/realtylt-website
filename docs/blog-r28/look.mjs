/** Round 28: one frame of the page around a given sentence (the closing line), at a given width.
 *   node docs/blog-r28/look.mjs http://127.0.0.1:3110 <slug> "<text to find>" <width> <out.png>
 * Prints the found element's text start and whether anything reaches past the right edge. */
import { chromium } from "playwright";

const [base, slug, needle, width = "390", out = "look.png"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.route("**/api/media/**", (r) => r.abort());
await page.route("**/api/lead**", (r) => r.fulfill({ status: 200, body: "{}" }));
await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle", timeout: 90000 });
const el = page.locator("p", { hasText: needle }).first();
await el.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -250));
await page.waitForTimeout(400);
await page.screenshot({ path: out });
const info = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
console.log(JSON.stringify({ found: (await el.innerText()).slice(0, 90), ...info }));
await browser.close();
