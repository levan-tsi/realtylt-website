// Side-by-side design comparison: LIVE realtylt.com (left) vs local build (right).
// Usage: node scripts/compare-live.mjs <localBase> <outDir> [slug ...]   (default: all @1280;
// pass WIDTH=390 env for the mobile pass). Produces <outDir>/<slug>-<width>-sxs.png sheets.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const PAGES = {
  home: ['https://www.realtylt.com/', '/'],
  search: ['https://www.realtylt.com/search?price=10000%3A&multi_search=Orange+County%2C+NY%7CDutchess+County%2C+NY&multi_cat=CountyState%7CCountyState&propertyType=Residential%7CMulti-Family&status=1&view=hybrid_view', '/search'],
  buying: ['https://www.realtylt.com/buying', '/buying'],
  selling: ['https://www.realtylt.com/selling', '/selling'],
  top_areas: ['https://www.realtylt.com/top_areas', '/top-areas'],
  financing: ['https://www.realtylt.com/financing', '/financing'],
  homevalue: ['https://www.realtylt.com/homevalue', '/home-value'],
  who_we_are: ['https://www.realtylt.com/realestateagent/search', '/who-we-are'],
  connect: ['https://www.realtylt.com/connect', '/connect'],
};

const [localBase = 'http://localhost:3777', outDir = 'docs/round1/compare', ...only] = process.argv.slice(2);
const width = Number(process.env.WIDTH || 1280);
const slugs = only.length ? only : Object.keys(PAGES);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

async function capture(url) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 1280 ? 900 : 844 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  // Kill Brivity signup/cookie modals if any appeared
  await page.evaluate(() => {
    document.querySelectorAll('.modal.show, .modal-backdrop, [class*="cookie"]').forEach((el) => el.remove());
    document.body.style.overflow = 'visible';
  });
  const buf = await page.screenshot({ fullPage: true });
  await ctx.close();
  return buf;
}

for (const slug of slugs) {
  const [liveUrl, localPath] = PAGES[slug];
  try {
    const [live, local] = [await capture(liveUrl), await capture(localBase + localPath)];
    const b64l = live.toString('base64');
    const b64r = local.toString('base64');
    const half = Math.round(width / 2);
    const html = `<!doctype html><body style="margin:0;background:#222;display:flex;align-items:flex-start;gap:4px">
      <div style="width:${half}px"><p style="color:#0f0;font:12px monospace;margin:2px">LIVE</p><img src="data:image/png;base64,${b64l}" style="width:100%"></div>
      <div style="width:${half}px"><p style="color:#ff0;font:12px monospace;margin:2px">LOCAL</p><img src="data:image/png;base64,${b64r}" style="width:100%"></div></body>`;
    const ctx = await browser.newContext({ viewport: { width: width + 8, height: 900 } });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, `${slug}-${width}-sxs.png`), fullPage: true });
    await ctx.close();
    console.log(`OK  ${slug} @${width}`);
  } catch (e) {
    console.log(`ERR ${slug}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
