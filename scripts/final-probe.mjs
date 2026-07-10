// Independent live-site verification: console errors, 404 resources, CSP violations, render checks.
import { chromium } from 'playwright';
const BASE = 'https://realtylt-website.vercel.app';
const pages = ['/', '/search', '/ai', '/financing', '/top-areas'];
const browser = await chromium.launch();
for (const p of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrs = [], failed = [], csp = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text().slice(0, 160)); });
  page.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 100)}`));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 110)}`); });
  page.on('console', (m) => { if (/content security policy|refused to/i.test(m.text())) csp.push(m.text().slice(0, 140)); });
  try {
    await page.goto(BASE + p, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(p === '/ai' ? 6000 : 2500);
    // render probes
    let extra = '';
    if (p === '/search') {
      const tiles = await page.locator('img.leaflet-tile, .leaflet-tile-loaded').count();
      const cards = await page.locator('[class*="listing"], article').count();
      extra = ` | leaflet-tiles=${tiles} cards=${cards}`;
    }
    if (p === '/ai') {
      const canv = await page.locator('canvas').count();
      extra = ` | canvases=${canv}`;
    }
    console.log(`\n=== ${p} ===${extra}`);
    console.log(`  console-errors(${consoleErrs.length}): ${JSON.stringify(consoleErrs.slice(0, 6))}`);
    console.log(`  failed/4xx(${failed.length}): ${JSON.stringify([...new Set(failed)].slice(0, 8))}`);
    console.log(`  CSP-violations(${csp.length}): ${JSON.stringify(csp.slice(0, 4))}`);
  } catch (e) {
    console.log(`\n=== ${p} === ERROR ${e.message.split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await browser.close();
