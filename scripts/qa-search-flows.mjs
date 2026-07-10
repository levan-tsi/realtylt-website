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
const settle = () => page.waitForTimeout(1800);

// card helpers — the card is an <article>; its overlay link carries an aria-label
const cards = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('article')]
      .map((a) => {
        const link = a.querySelector('a[href^="/listing/"]');
        if (!link) return null;
        return { id: link.getAttribute('href').split('/').pop(), text: a.textContent };
      })
      .filter(Boolean),
  );
const prices = async () => (await cards()).map((c) => parseInt((c.text.match(/\$([\d,]+)/) || ['', '0'])[1].replace(/,/g, '')));

// ---------- HOME carousels ----------
await page.goto(base + '/', { waitUntil: 'load' });
await settle();
const rails = await page.evaluate(() => {
  const out = {};
  for (const sec of document.querySelectorAll('section')) {
    const h = sec.querySelector('h2');
    if (!h || !/Featured listings|New listings/i.test(h.textContent)) continue;
    out[h.textContent.trim()] = [
      ...new Set([...sec.querySelectorAll('a[href^="/listing/"]')].map((a) => a.getAttribute('href').split('/').pop())),
    ];
  }
  return out;
});
const feat = rails['Featured listings'] || [];
const news = rails['New listings'] || [];
check('home: Featured rail has cards', feat.length >= 4, `${feat.length}`);
check('home: New rail has cards', news.length >= 4, `${news.length}`);
const overlap = feat.filter((id) => news.includes(id));
check('home: rails share no listings', feat.length > 0 && overlap.length === 0, overlap.length ? 'overlap: ' + overlap.join(',') : '');

// ---------- SEARCH: UI-driven flows ----------
await page.goto(base + '/search', { waitUntil: 'load' });
await settle();
check('search: initial results render', (await cards()).length === 12, `${(await cards()).length} cards`);

// location text filter via the real input
await page.fill('#search-q', 'Beacon');
await page.click('button[type="submit"]:has-text("Search")');
await settle();
let cs = await cards();
check('search: location "Beacon" filters', cs.length >= 1 && cs.every((c) => /Beacon/i.test(c.text)), `${cs.length} cards`);
check('search: URL syncs q', page.url().includes('q=Beacon'), page.url());

// clear location
await page.fill('#search-q', '');
await page.click('button[type="submit"]:has-text("Search")');
await settle();

// price via selects
await page.selectOption('#f-priceMin', '500000');
await settle();
await page.selectOption('#f-priceMax', '700000');
await settle();
let ps = await prices();
check('search: price 500K-700K via UI', ps.length > 0 && ps.every((p) => p >= 500000 && p <= 700000), `${ps.length} cards [${Math.min(...ps)}..${Math.max(...ps)}]`);
check('search: URL syncs price', /priceMin=500000/.test(page.url()) && /priceMax=700000/.test(page.url()), page.url());
await page.selectOption('#f-priceMin', '');
await settle();
await page.selectOption('#f-priceMax', '');
await settle();

// beds
await page.selectOption('#f-beds', '4');
await settle();
cs = await cards();
let bedsOk = cs.map((c) => parseInt((c.text.match(/(\d+)\s*bd/i) || [])[1])).filter((n) => !isNaN(n));
check('search: beds 4+ via UI', bedsOk.length > 0 && bedsOk.every((b) => b >= 4), `${bedsOk.length} cards`);
await page.selectOption('#f-beds', '');
await settle();

// baths
await page.selectOption('#f-baths', '3');
await settle();
cs = await cards();
let bathsOk = cs.map((c) => parseFloat((c.text.match(/([\d.]+)\s*ba/i) || [])[1])).filter((n) => !isNaN(n));
check('search: baths 3+ via UI', bathsOk.length > 0 && bathsOk.every((b) => b >= 3), `${bathsOk.length} cards`);
await page.selectOption('#f-baths', '');
await settle();

// sqft
await page.selectOption('#f-sqft', '2500');
await settle();
cs = await cards();
let sq = cs.map((c) => parseInt((c.text.match(/([\d,]+)\s*sqft/i) || ['', '0'])[1].replace(/,/g, '')));
check('search: sqft 2500+ via UI', sq.length > 0 && sq.every((s) => s >= 2500), `${sq.length} cards`);
await page.selectOption('#f-sqft', '');
await settle();

// type
await page.selectOption('#f-type', 'Multi-Family');
await settle();
cs = await cards();
check('search: type Multi-Family via UI', cs.length > 0 && cs.every((c) => /Multi-Family/i.test(c.text)), `${cs.length} cards`);
await page.selectOption('#f-type', '');
await settle();

// county chip + URL sync both directions
await page.click('button:has-text("Ulster County, NY")');
await settle();
check('search: county chip pressed', await page.getAttribute('button:has-text("Ulster County, NY")', 'aria-pressed') === 'true');
check('search: county syncs URL', /county=ulster/.test(page.url()), page.url());
cs = await cards();
check('search: county chip filters to Ulster towns', cs.length > 0 && cs.every((c) => /Kingston|Woodstock|New Paltz|Saugerties|Ulster|Stone Ridge|Gardiner|Ellenville|Highland|Marlboro|Esopus|Hurley|Rosendale|Phoenicia|Shandaken|Olivebridge|West Hurley|Accord|Kerhonkson|Wallkill|Milton|Plattekill|Modena|Clintondale|Tillson|Rifton|Port Ewen|Lake Katrine|Glasco|Malden|Mount Marion|Ruby|Saxton|Veteran|West Camp|Woodstock/i.test(c.text)), `${cs.length} cards`);
// URL -> chip (deep link)
await page.goto(base + '/search?county=putnam', { waitUntil: 'load' });
await settle();
check('search: deep-linked county activates chip', await page.getAttribute('button:has-text("Putnam County, NY")', 'aria-pressed') === 'true');

// sort via UI
await page.goto(base + '/search', { waitUntil: 'load' });
await settle();
await page.selectOption('#f-sort', 'price-asc');
await settle();
ps = await prices();
check('search: sort price-asc via UI', ps.length > 1 && ps.every((p, i) => i === 0 || p >= ps[i - 1]), ps.slice(0, 4).join(','));
await page.selectOption('#f-sort', 'price-desc');
await settle();
ps = await prices();
check('search: sort price-desc via UI', ps.length > 1 && ps.every((p, i) => i === 0 || p <= ps[i - 1]), ps.slice(0, 4).join(','));

// pagination via the numbered nav
await page.goto(base + '/search', { waitUntil: 'load' });
await settle();
const p1 = (await cards())[0]?.id;
await page.click('nav[aria-label="Results pages"] button:text-is("2")');
await settle();
const p2 = (await cards())[0]?.id;
check('search: page 2 shows different results', p1 && p2 && p1 !== p2, `${p1} -> ${p2}`);
check('search: page syncs URL', /page=2/.test(page.url()), page.url());
check('search: page 2 marked current', await page.getAttribute('nav[aria-label="Results pages"] button:text-is("2")', 'aria-current') === 'page');

// map toggle with patient tile wait
await page.goto(base + '/search', { waitUntil: 'load' });
await settle();
await page.click('div[role="group"][aria-label="View"] button:has-text("map")');
await page.waitForTimeout(6000);
const mapState = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img.leaflet-tile')];
  return {
    container: !!document.querySelector('.leaflet-container'),
    tiles: imgs.length,
    loaded: imgs.filter((t) => t.complete && t.naturalWidth > 0).length,
    pins: document.querySelectorAll('.leaflet-marker-icon').length,
    attribution: /OpenStreetMap/.test(document.querySelector('.leaflet-control-attribution')?.textContent || ''),
  };
});
check('search: map container renders', mapState.container);
check('search: map price pins present', mapState.pins === 12, `${mapState.pins} pins`);
check('search: OSM tiles load', mapState.tiles > 0 && mapState.loaded / mapState.tiles > 0.8, `${mapState.loaded}/${mapState.tiles}`);
check('search: OSM attribution shown', mapState.attribution);
// toggle back
await page.click('div[role="group"][aria-label="View"] button:has-text("grid")');
await settle();
check('search: grid toggle returns cards', (await cards()).length === 12);

console.log(errors.length ? 'CONSOLE ERRORS: ' + JSON.stringify(errors) : 'console clean');
await browser.close();
process.exit(fails ? 1 : 0);
