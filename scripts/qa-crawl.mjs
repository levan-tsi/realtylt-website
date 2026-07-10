// QA: crawl every internal link from every page (status must be <400),
// scan every page for horizontal overflow at 390, and verify each county page
// lists only its own county's listings.
// Usage: node scripts/qa-crawl.mjs [base]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3777';
const pages = ['/', '/search', '/buying', '/selling', '/top-areas', '/top-areas/orange', '/top-areas/dutchess', '/top-areas/westchester', '/top-areas/putnam', '/top-areas/rockland', '/top-areas/ulster', '/financing', '/home-value', '/who-we-are', '/reviews', '/blog', '/blog/top-5-renovations-increase-home-value-ny', '/connect', '/saved', '/listing/H6400001', '/privacy-policy', '/dmca-terms'];
let fails = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails++;
};

const browser = await chromium.launch();

// ---- 1. collect internal hrefs from every page, then HEAD/GET each once ----
{
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const hrefs = new Map(); // href -> first seen on
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    const found = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && (h.startsWith('/') || h.startsWith(location.origin)) && !h.startsWith('//')),
    );
    for (const h of found) {
      const clean = h.replace(/^https?:\/\/[^/]+/, '').split('#')[0];
      if (clean && !hrefs.has(clean)) hrefs.set(clean, p);
    }
  }
  await page.close();
  let broken = [];
  for (const [href, seenOn] of hrefs) {
    const res = await fetch(base + href, { redirect: 'follow' });
    if (res.status >= 400) broken.push(`${res.status} ${href} (on ${seenOn})`);
  }
  check(`crawl: all ${hrefs.size} internal links resolve`, broken.length === 0, broken.slice(0, 6).join(' ; '));
}

// ---- 2. horizontal overflow at 390 ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const bad = [];
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    await page.evaluate(async () => { const s = innerHeight * 0.8; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } scrollTo(0, 0); });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 1) bad.push(`${p} overflows by ${over}px`);
  }
  check('mobile 390: no horizontal overflow on any page', bad.length === 0, bad.join(' ; '));
  await ctx.close();
}

// ---- 3. each county page shows only its county's listings ----
{
  const counties = ['orange', 'dutchess', 'westchester', 'putnam', 'rockland', 'ulster'];
  const api = async (q) => (await (await fetch(`${base}/api/idx/search?${q}`)).json()).listings;
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  for (const c of counties) {
    const expected = new Set((await api(`county=${c}&pageSize=60`)).map((l) => l.id));
    await page.goto(`${base}/top-areas/${c}`, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    const shown = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/listing/"]')].map((a) => a.getAttribute('href').split('/').pop()))]);
    const wrong = shown.filter((id) => !expected.has(id));
    check(`county /top-areas/${c}: ${shown.length} cards all in-county`, shown.length > 0 && wrong.length === 0, wrong.join(','));
  }
  await page.close();
}

await browser.close();
console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
process.exit(fails ? 1 : 0);
