// Round 17 frames: the service page hero and the post's two-routes section, at 390 and 1440.
// node docs/blog-r17/shots.mjs http://127.0.0.1:3108 docs/blog-r17/shots
import { chromium } from "playwright";
import path from "node:path";
const [base, out] = process.argv.slice(2);
const browser = await chromium.launch();
for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 } });
  const page = await ctx.newPage();
  await page.route("**/api/media/**", (r) => r.abort());
  await page.goto(`${base}/services/ai-readiness-assessment`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, `service-${w}-top.png`) });
  await page.goto(`${base}/blog/ai-assessment-small-business-what-not-to-automate`, { waitUntil: "networkidle" });
  const el = page.locator("#two-routes-from-the-plan");
  await el.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, `ai-${w}-two-routes.png`) });
  await ctx.close();
}
await browser.close();
