// QA: home carousels + full /search flow assertions against fixture data.
// Usage: node scripts/qa-search-flows.mjs [base]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3777';
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
let fails = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) fails++;
};

// ---------- HOME carousels ----------
await page.goto(base + '/', { waitUntil: 'load' });
await page.waitForTimeout(800);
const rails = await page.evaluate(() => {
  const out = {};
  for (const h of document.querySelectorAll('h2')) {
    const t = h.textContent.trim();
    if (/Featured Listings|New Listings/i.test(t)) {
      const sec = h.closest('section') || h.parentElement;
      out[t] = [...sec.querySelectorAll('a[href^="/listing/"]')]
        .map((a) => a.getAttribute('href').split('/').pop())
        .filter((v, i, arr) => arr.indexOf(v) === i);
    }
  }
  return out;
});
const feat = rails['Featured Listings'] || [];
const news = rails['New Listings'] || [];
console.log('featured:', feat.join(','));
console.log('new:', news.join(','));
check('home: Featured rail has cards', feat.length >= 4, `${feat.length}`);
check('home: New rail has cards', news.length >= 4, `${news.length}`);
check('home: rails lead with different listings', feat[0] !== news[0], `${feat[0]} vs ${news[0]}`);
const overlap = feat.filter((id) => news.includes(id));
check('home: rails meaningfully different (overlap < 3)', overlap.length < 3, `overlap: ${overlap.join(',')}`);

// ---------- SEARCH ----------
await page.goto(base + '/search', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const cardSel = 'a[href^="/listing/"]';
const cardCount = async () => page.evaluate((s) => new Set([...document.querySelectorAll(s)].map((a) => a.getAttribute('href'))).size, cardSel);
const initial = await cardCount();
check('search: initial results render', initial > 0, `${initial} cards`);
const attribution = await page.evaluate(() => /One Key/i.test(document.body.innerText));
check('search: One Key attribution rendered', attribution);
const sample = await page.evaluate(() => /sample/i.test(document.body.innerText));
check('search: sample-data notice rendered', sample);
const listedWith = await page.evaluate(() => /Listed with/i.test(document.body.innerText));
check('search: "Listed with" on cards', listedWith);

// helper: read visible prices
const readPrices = () => page.evaluate(() => {
  const txt = [...document.querySelectorAll('a[href^="/listing/"]')].map((a) => a.textContent);
  return txt.map((t) => (t.match(/\$([\d,]{6,})/) || [])[1]).filter(Boolean).map((s) => parseInt(s.replace(/,/g, '')));
});

// location text filter
const locInput = page.locator('input[placeholder*="ity" i], input[placeholder*="ocation" i], input[placeholder*="ddress" i], input[type="search"]').first();
if (await locInput.count()) {
  await locInput.fill('Beacon');
  await locInput.press('Enter');
  await page.waitForTimeout(1200);
  const beaconOnly = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[href^="/listing/"]')];
    if (!cards.length) return { n: 0, all: false };
    const all = cards.every((c) => /Beacon/i.test(c.textContent));
    return { n: cards.length, all };
  });
  check('search: location "Beacon" filters results', beaconOnly.n > 0 && beaconOnly.all, `${beaconOnly.n} cards, allBeacon=${beaconOnly.all}`);
  check('search: URL syncs location', /Beacon|q=|location=/i.test(page.url()), page.url());
  await locInput.fill('');
  await locInput.press('Enter');
  await page.waitForTimeout(800);
} else {
  check('search: location input exists', false);
}

// price filter via selects or inputs
const priceApplied = await page.evaluate(() => {
  const els = [...document.querySelectorAll('select, input')];
  return els.map((e) => e.name || e.getAttribute('aria-label') || e.placeholder || e.id).filter(Boolean);
});
console.log('search controls:', JSON.stringify(priceApplied));

// use URL-driven filtering (the UI syncs to URL; assert engine correctness through URL params)
await page.goto(base + '/search?minPrice=500000&maxPrice=700000', { waitUntil: 'load' });
await page.waitForTimeout(1200);
let prices = await readPrices();
check('search: price 500k-700k via URL', prices.length > 0 && prices.every((p) => p >= 500000 && p <= 700000), `${prices.length} cards [${Math.min(...prices)}..${Math.max(...prices)}]`);

await page.goto(base + '/search?beds=4', { waitUntil: 'load' });
await page.waitForTimeout(1200);
let bedsOk = await page.evaluate(() => {
  const cards = [...new Set([...document.querySelectorAll('a[href^="/listing/"]')])];
  const beds = cards.map((c) => parseInt((c.textContent.match(/(\d+)\s*(bd|bed)/i) || [])[1])).filter((n) => !isNaN(n));
  return { n: beds.length, ok: beds.every((b) => b >= 4) };
});
check('search: beds>=4 via URL', bedsOk.n > 0 && bedsOk.ok, `${bedsOk.n} cards`);

await page.goto(base + '/search?county=ulster', { waitUntil: 'load' });
await page.waitForTimeout(1200);
const ulsterChip = await page.evaluate(() => {
  const pressed = [...document.querySelectorAll('[aria-pressed="true"], .chip-active, [data-active="true"]')].map((e) => e.textContent.trim());
  const text = document.body.innerText;
  return { pressed, hasUlsterCards: /Ulster|Kingston|Woodstock|New Paltz|Saugerties/i.test(text) };
});
check('search: county=ulster chip reflects URL', ulsterChip.pressed.some((t) => /ulster/i.test(t)) || ulsterChip.hasUlsterCards, JSON.stringify(ulsterChip.pressed));

// sort
await page.goto(base + '/search?sort=price-asc', { waitUntil: 'load' });
await page.waitForTimeout(1200);
prices = await readPrices();
const sortedAsc = prices.every((p, i) => i === 0 || p >= prices[i - 1]);
check('search: sort=price-asc ordered', prices.length > 1 && sortedAsc, prices.slice(0, 5).join(','));

// pagination
await page.goto(base + '/search', { waitUntil: 'load' });
await page.waitForTimeout(1200);
const page1First = await page.evaluate(() => document.querySelector('a[href^="/listing/"]')?.getAttribute('href'));
const pag = page.locator('button:has-text("2"), a:has-text("2")').first();
if (await pag.count()) {
  await pag.click();
  await page.waitForTimeout(1200);
  const page2First = await page.evaluate(() => document.querySelector('a[href^="/listing/"]')?.getAttribute('href'));
  check('search: pagination page 2 changes results', page2First && page2First !== page1First, `${page1First} -> ${page2First}`);
  check('search: pagination syncs URL', /page=2/.test(page.url()), page.url());
} else {
  check('search: pagination control exists', false);
}

// map toggle
await page.goto(base + '/search', { waitUntil: 'load' });
await page.waitForTimeout(1200);
const mapBtn = page.locator('button:has-text("Map"), [role="tab"]:has-text("Map")').first();
if (await mapBtn.count()) {
  await mapBtn.click();
  await page.waitForTimeout(2500);
  const mapState = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('.leaflet-tile')];
    const imgs = tiles.filter((t) => t.tagName === 'IMG');
    const loaded = imgs.filter((t) => t.complete && t.naturalWidth > 0).length;
    const pins = document.querySelectorAll('.leaflet-marker-icon, .leaflet-marker-pane > *').length;
    return { container: !!document.querySelector('.leaflet-container'), tiles: imgs.length, loaded, pins };
  });
  check('search: map renders container', mapState.container);
  check('search: map has price pins', mapState.pins > 0, `${mapState.pins} pins`);
  check('search: OSM tiles load (headless)', mapState.tiles > 0 && mapState.loaded > 0, `${mapState.loaded}/${mapState.tiles} tiles loaded`);
} else {
  check('search: map toggle exists', false);
}

console.log(errors.length ? 'CONSOLE ERRORS: ' + JSON.stringify(errors) : 'console clean');
await browser.close();
process.exit(fails ? 1 : 0);
