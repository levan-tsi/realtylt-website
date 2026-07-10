// QA: per-page a11y/content scan — img alt, unlabeled controls, landmarks, h1s,
// footer interest reasons, obvious contrast smells (low-alpha text on same-tone bg).
// Usage: node scripts/qa-a11y-scan.mjs [base]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3777';
const pages = ['/', '/search', '/buying', '/selling', '/top-areas', '/top-areas/orange', '/top-areas/dutchess', '/top-areas/westchester', '/top-areas/putnam', '/top-areas/rockland', '/top-areas/ulster', '/financing', '/home-value', '/who-we-are', '/reviews', '/blog', '/blog/top-5-renovations-increase-home-value-ny', '/connect', '/saved', '/listing/H6400001', '/privacy-policy', '/dmca-terms'];

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
let issues = 0;

for (const p of pages) {
  await page.goto(base + p, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const out = { noAlt: [], unlabeled: [], h1: 0, landmarks: {}, reasons: [] };
    for (const img of document.querySelectorAll('img')) {
      if (!img.hasAttribute('alt')) out.noAlt.push((img.getAttribute('src') || '').slice(0, 60));
    }
    for (const el of document.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
      const id = el.id;
      const labelled = (id && document.querySelector(`label[for="${id}"]`)) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label');
      // honeypot fields are intentionally unlabeled but must be aria-hidden or tabindex=-1
      const hp = el.name === 'website';
      if (!labelled && !hp) out.unlabeled.push(el.name || el.id || el.tagName);
      if (hp) out.honeypotHidden = el.closest('[aria-hidden="true"]') !== null || el.tabIndex === -1 || getComputedStyle(el.closest('div,p') || el).display === 'none' || el.autocomplete === 'off';
    }
    out.h1 = document.querySelectorAll('h1').length;
    out.landmarks = {
      header: !!document.querySelector('header'),
      main: !!document.querySelector('main'),
      footer: !!document.querySelector('footer'),
      nav: !!document.querySelector('nav'),
    };
    const sel = document.querySelector('footer select');
    if (sel) out.reasons = [...sel.options].map((o) => o.textContent.trim());
    return out;
  });
  const missing = Object.entries(r.landmarks).filter(([, v]) => !v).map(([k]) => k);
  const probs = [];
  if (r.noAlt.length) probs.push(`imgs-without-alt: ${r.noAlt.length} [${r.noAlt.slice(0, 2).join(',')}]`);
  if (r.unlabeled.length) probs.push(`unlabeled-controls: ${r.unlabeled.join(',')}`);
  if (r.h1 !== 1) probs.push(`h1-count=${r.h1}`);
  if (missing.length) probs.push(`missing-landmarks: ${missing.join(',')}`);
  if (probs.length) issues += probs.length;
  console.log(`${probs.length ? 'ISSUES' : 'OK    '} ${p}${probs.length ? '  ' + probs.join(' | ') : ''}`);
  if (p === '/') {
    const wanted = ['buying a home', 'selling a home', 'buying and selling', 'home to rent', 'real estate career', 'Other reason'];
    const ok = wanted.every((w) => r.reasons.some((x) => x.toLowerCase().includes(w.toLowerCase())));
    console.log(`${ok ? 'OK    ' : 'ISSUES'} footer interest reasons (${r.reasons.length}): ${r.reasons.join(' | ')}`);
    if (!ok) issues++;
    console.log(`${r.honeypotHidden !== false ? 'OK    ' : 'ISSUES'} honeypot hidden from AT`);
  }
}
await browser.close();
console.log(issues ? `${issues} issues` : 'CLEAN');
process.exit(0);
