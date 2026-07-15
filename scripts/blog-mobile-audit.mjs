// blog-mobile-audit.mjs — is the redesigned blog genuinely mobile-optimized?
// Checks the index + an article across real phone widths: no h-overflow, tap targets >=24px,
// the ToC bottom sheet opens/jumps/closes, body text isn't too small, images fit, no console errors.
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/blog-redesign/mobile';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = process.env.BASE || 'http://localhost:3000';
const ART = '/blog/ai-chat-assistant-real-estate-website';
const res = [];
const check = (ok, name, d = '') => res.push([ok, name, d]);

const browser = await chromium.launch({ args: ['--hide-scrollbars'] });

// three real phones: small, standard, large
const PHONES = [
  ['iPhone SE', { width: 375, height: 667 }],
  ['iPhone 13', devices['iPhone 13'].viewport],
  ['Pixel 7',   { width: 412, height: 915 }],
];

for (const [label, viewport] of PHONES) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  // ---- article
  await page.goto(`${BASE}${ART}`, { waitUntil: 'load', timeout: 45000 });
  await sleep(1500);

  const ov = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth, win: window.innerWidth,
    // any element wider than the viewport (the real cause of h-scroll)?
    wide: [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .map((el) => el.tagName + '.' + (el.className?.toString().slice(0, 30) || '')).slice(0, 4),
  }));
  check(ov.doc <= ov.win + 1, `${label}: article no horizontal overflow`, `${ov.doc}>${ov.win} :: ${ov.wide.join(', ')}`);

  const type = await page.evaluate(() => {
    const p = document.querySelector('article p, main p');
    const cs = p ? getComputedStyle(p) : null;
    return cs ? { size: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight) } : null;
  });
  check(type && type.size >= 16, `${label}: body text >=16px (no zoom needed)`, type && `${type.size}px`);

  // tap targets: real links/buttons in the article + nav, ignoring the 1px sr-only stuff
  const tiny = await page.evaluate(() => [...document.querySelectorAll('a, button')]
    .filter((b) => !b.closest('.sr-only') && getComputedStyle(b).display !== 'none')
    .filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.width < 24 || r.height < 24); })
    .map((b) => (b.textContent || b.getAttribute('aria-label') || b.tagName).trim().slice(0, 24)).slice(0, 6));
  check(tiny.length === 0, `${label}: all tap targets >=24px`, tiny.join(' | '));

  // ---- the mobile ToC bottom sheet: find the pill, open it, jump, confirm it moved
  await page.evaluate(() => window.scrollTo(0, 1400));
  await sleep(600);
  const pill = await page.$('[data-toc-trigger], [aria-controls*="toc"], button:has-text("On this page")')
    .catch(() => null);
  let tocWorks = false, tocDetail = 'no pill found';
  if (pill) {
    await pill.click().catch(() => {});
    await sleep(500);
    const links = await page.$$('[role="dialog"] a, [data-toc-sheet] a, nav[aria-label*="page" i] a');
    if (links.length > 1) {
      const yBefore = await page.evaluate(() => window.scrollY);
      await links[links.length - 1].click().catch(() => {});
      await sleep(800);
      const yAfter = await page.evaluate(() => window.scrollY);
      tocWorks = Math.abs(yAfter - yBefore) > 100;
      tocDetail = `${links.length} links, scroll ${yBefore}->${yAfter}`;
    } else { tocDetail = `pill opened but ${links.length} links`; }
  }
  check(tocWorks, `${label}: ToC bottom-sheet opens + jumps to a section`, tocDetail);

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({ path: `${OUT}/${label.replace(/\s+/g, '')}-article.png` });

  // ---- index
  await page.goto(`${BASE}/blog`, { waitUntil: 'load', timeout: 45000 });
  await sleep(1200);
  const idxOv = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check(idxOv, `${label}: index no horizontal overflow`);
  await page.screenshot({ path: `${OUT}/${label.replace(/\s+/g, '')}-index.png` });

  check(errs.length === 0, `${label}: zero console errors`, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

await browser.close();
console.log('');
let fail = 0;
for (const [ok, name, d] of res) { if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${d && !ok ? `   [${d}]` : ''}`); }
console.log(`\n${res.length - fail}/${res.length} passed`);
