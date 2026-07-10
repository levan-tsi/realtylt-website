// Screenshot local pages for visual verification: node scripts/shot.mjs <baseUrl> <outDir> <path...>
// Captures each path at 1280 and 390, fullPage, into <outDir>/<slug>-<width>.png
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [base = 'http://localhost:3000', outDir = 'docs/verify', ...paths] = process.argv.slice(2);
const targets = paths.length ? paths : ['/'];
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
let failures = 0;
for (const p of targets) {
  const slug = p === '/' ? 'home' : p.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '_');
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: width === 1280 ? 900 : 844 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    try {
      // 'networkidle' never settles on the Next.js runtime — use 'load' + settle wait
      await page.goto(base + p, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1200);
      // Scroll through the page so reveal-on-scroll (IntersectionObserver) content becomes
      // visible — otherwise below-fold sections screenshot as blank.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(outDir, `${slug}-${width}.png`), fullPage: true });
      console.log(`OK  ${p} @${width}${errors.length ? '  CONSOLE-ERRORS: ' + JSON.stringify(errors) : ''}`);
    } catch (e) {
      failures++;
      console.log(`ERR ${p} @${width}: ${e.message.split('\n')[0]}`);
    } finally {
      await ctx.close();
    }
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
