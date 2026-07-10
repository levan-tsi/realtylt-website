// QA part 2: favorites, save-search, saved page + alert opt-in, mobile menu,
// mortgage calculator, lead forms (stub + honeypot + invalid), keyboard a11y,
// prefers-reduced-motion.
// Usage: node scripts/qa-flows2.mjs [base]
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:3777';
const LEADS = '.leads-dev.jsonl';
const leadCount = () => (fs.existsSync(LEADS) ? fs.readFileSync(LEADS, 'utf8').trim().split('\n').filter(Boolean).length : 0);

const browser = await chromium.launch();
let fails = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails++;
};

// ---------- 1. favorites: heart -> badge -> /saved -> reload ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/search', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.click('article >> nth=0 >> button[aria-label="Save this home"]');
  await page.waitForTimeout(400);
  const badge = await page.evaluate(() => document.querySelector('a[aria-label^="Saved homes"]')?.getAttribute('aria-label'));
  check('fav: header badge shows (1)', /\(1\)/.test(badge || ''), badge);
  await page.click('article >> nth=1 >> button[aria-label="Save this home"]');
  await page.waitForTimeout(400);
  const badge2 = await page.evaluate(() => document.querySelector('a[aria-label^="Saved homes"]')?.getAttribute('aria-label'));
  check('fav: badge increments to (2)', /\(2\)/.test(badge2 || ''), badge2);
  await page.goto(base + '/saved', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  let n = await page.evaluate(() => document.querySelectorAll('article').length);
  check('fav: /saved lists 2 homes', n === 2, `${n}`);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);
  n = await page.evaluate(() => document.querySelectorAll('article').length);
  check('fav: persists across reload', n === 2, `${n}`);
  // unfavorite from /saved
  await page.click('button[aria-label="Remove from saved homes"] >> nth=0');
  await page.waitForTimeout(500);
  n = await page.evaluate(() => document.querySelectorAll('article').length);
  check('fav: unheart removes from /saved', n === 1, `${n}`);

  // ---------- 2. save-search from /search, then alert opt-in on /saved ----------
  await page.goto(base + '/search?county=dutchess&bedsMin=3', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.click('button:has-text("Save search")');
  await page.waitForTimeout(400);
  check('save-search: confirmation note', await page.locator('[role="status"]:has-text("Saved")').count() > 0);
  await page.goto(base + '/saved', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const ss = await page.evaluate(() => document.body.innerText.match(/Dutchess[^\n]*3\+ bd/i)?.[0] ?? '');
  check('save-search: appears on /saved with label', !!ss, ss);
  const before = leadCount();
  // alert opt-in lead form
  await page.fill('section[aria-labelledby="alerts-heading"] input[name="name"]', 'QA Tester');
  await page.fill('section[aria-labelledby="alerts-heading"] input[name="email"]', 'qa@example.com');
  const phoneSel = 'section[aria-labelledby="alerts-heading"] input[name="phone"]';
  if (await page.locator(phoneSel).count()) await page.fill(phoneSel, '(914) 555-0100');
  await page.click('section[aria-labelledby="alerts-heading"] button[type="submit"]');
  await page.waitForTimeout(1500);
  check('alerts: success state shown', (await page.locator('section[aria-labelledby="alerts-heading"]').innerText()).includes("We'll confirm"), '');
  check('alerts: lead written to stub', leadCount() === before + 1, `${before} -> ${leadCount()}`);
  await ctx.close();
}

// ---------- 3. mobile menu (390) incl. Top Areas ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.click('button[aria-label="Open menu"]');
  await page.waitForTimeout(400);
  const nav = page.locator('nav[aria-label="Mobile"]');
  check('mobile: menu opens', await nav.isVisible());
  const links = await nav.locator('a').allTextContents();
  const wanted = ['Home', 'Search Listings', 'Buying', 'Selling', 'Financing', 'Home Value', 'Who We Are', 'Blog', 'Connect'];
  check('mobile: nav links complete', wanted.every((w) => links.some((l) => l.includes(w))), links.join('|').slice(0, 160));
  const topAreas = await nav.locator('a[href^="/top-areas"], button:has-text("Top Areas")').count();
  check('mobile: Top Areas reachable', topAreas > 0, `${topAreas}`);
  await page.click('nav[aria-label="Mobile"] a[href="/buying"]');
  await page.waitForTimeout(1200);
  check('mobile: menu link navigates', page.url().includes('/buying'), page.url());
  await ctx.close();
}

// ---------- 4. mortgage calculator ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/financing', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const payment = () => page.evaluate(() => document.body.innerText.match(/\$3,198\.20|\$[\d,]+\.\d{2}/)?.[0]);
  check('calc: default shows live worked example $3,198.20', (await payment()) === '$3,198.20', await payment());
  await page.fill('#calc-price', '600000');
  await page.waitForTimeout(600);
  const after = await payment();
  check('calc: recomputes on input', after !== '$3,198.20' && /\$[\d,]+\.\d{2}/.test(after || ''), after);
  await page.fill('#calc-ratePct', '7');
  await page.waitForTimeout(600);
  const after2 = await payment();
  check('calc: rate change recomputes', after2 !== after, `${after} -> ${after2}`);
  await page.click('button:has-text("Reset")');
  await page.waitForTimeout(600);
  check('calc: Reset restores $3,198.20', (await payment()) === '$3,198.20', await payment());
  const priceVal = await page.inputValue('#calc-price');
  check('calc: Reset restores inputs', priceVal === '500000', priceVal);
  await ctx.close();
}

// ---------- 5. lead forms: footer form + honeypot + invalid ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  // valid footer submit from /buying
  await page.goto(base + '/buying', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const before = leadCount();
  const footer = page.locator('footer');
  await footer.locator('input[name="name"]').fill('QA Footer');
  await footer.locator('input[name="email"]').fill('qa-footer@example.com');
  await footer.locator('input[name="phone"]').fill('(914) 555-0100');
  await footer.locator('button[type="submit"]').click();
  await page.waitForTimeout(1500);
  check('lead: footer form success state', /thank|we usually reply|got it|received/i.test(await footer.innerText()), (await footer.innerText()).replace(/\s+/g, ' ').slice(0, 120));
  check('lead: footer lead written', leadCount() === before + 1, `${before} -> ${leadCount()}`);
  const last = fs.readFileSync(LEADS, 'utf8').trim().split('\n').pop();
  const lead = JSON.parse(last);
  check('lead: payload has source page + reason + timestamp', !!lead.source && !!lead.interestReason && !!lead.timestamp, JSON.stringify({ source: lead.source, interestReason: lead.interestReason, timestamp: lead.timestamp }).slice(0, 140));

  // honeypot via API — must return ok silently and NOT write
  const hpBefore = leadCount();
  const hp = await page.evaluate(async () => {
    const r = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bot', email: 'bot@spam.io', phone: '000', interestReason: 'Other reason to contact an agent', sourcePage: '/qa', rlt_hp: 'http://spam.example' }),
    });
    return { status: r.status, body: await r.text() };
  });
  check('lead: honeypot returns 200 (silent)', hp.status === 200, `status ${hp.status}`);
  check('lead: honeypot NOT written', leadCount() === hpBefore, `${hpBefore} -> ${leadCount()}`);

  // invalid input shows inline errors, nothing written
  const invBefore = leadCount();
  await page.goto(base + '/connect', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  const main = page.locator('main form').first();
  await main.locator('input[name="name"]').fill('QA Invalid');
  await main.locator('input[name="email"]').fill('not-an-email');
  await main.locator('button[type="submit"]').click();
  await page.waitForTimeout(1200);
  const errText = await main.innerText();
  check('lead: invalid email shows error', /valid|email/i.test(errText) && !/thank/i.test(errText), errText.replace(/\s+/g, ' ').slice(0, 100));
  check('lead: invalid NOT written', leadCount() === invBefore, `${invBefore} -> ${leadCount()}`);
  // invalid direct API -> 400
  const inv = await page.evaluate(async () => (await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '', email: 'x' }) })).status);
  check('lead: API rejects invalid with 400', inv === 400, `status ${inv}`);
  await ctx.close();
}

// ---------- 6. keyboard a11y: skip link + Top Areas dropdown ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href'), visible: (() => { const el = document.activeElement; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && (r.left > -50 && r.top > -50); })() }));
  check('a11y: first Tab is skip link', /skip/i.test(first.text || ''), JSON.stringify(first));
  check('a11y: skip link visible on focus', first.visible === true, '');
  // walk to Top Areas dropdown
  let opened = false;
  for (let i = 0; i < 20 && !opened; i++) {
    await page.keyboard.press('Tab');
    const cur = await page.evaluate(() => document.activeElement?.textContent?.trim() || '');
    if (/Top Areas/i.test(cur)) {
      const tag = await page.evaluate(() => document.activeElement.tagName);
      if (tag === 'BUTTON') await page.keyboard.press('Enter');
      await page.waitForTimeout(400);
      // county links reachable?
      await page.keyboard.press('Tab');
      const next = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
      opened = /county|dutchess|westchester|putnam|rockland|ulster|orange/i.test((next.text || '') + (next.href || ''));
      check('a11y: Top Areas dropdown keyboard-operable', opened, JSON.stringify(next));
    }
  }
  if (!opened) check('a11y: Top Areas dropdown keyboard-operable', false, 'never reached Top Areas via Tab');
  // focus ring visible on nav link
  const ring = await page.evaluate(() => {
    const a = document.querySelector('nav[aria-label="Primary"] a');
    a.focus();
    const s = getComputedStyle(a);
    return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
  });
  check('a11y: focus indicator on nav links', ring);
  await ctx.close();
}

// ---------- 7. prefers-reduced-motion ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  // without scrolling, below-fold reveal content must already be visible
  const hidden = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll('main *')) {
      const s = getComputedStyle(el);
      if (parseFloat(s.opacity) === 0 && el.textContent.trim()) n++;
    }
    return n;
  });
  check('a11y: reduced-motion shows all content without scroll', hidden === 0, `${hidden} hidden els`);
  await ctx.close();
}

await browser.close();
console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
process.exit(fails ? 1 : 0);
