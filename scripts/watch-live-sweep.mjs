// Phase-4 WATCH sweep: browser-probe the DEPLOYED site at 1280 + 390.
// Asserts per route: HTTP 200, 0 console errors, 0 CSP violations, 0 horizontal overflow, no 4xx subresources.
//
// BUDGET SAFETY (why this exists instead of final-probe.mjs): the media CDN has a trailing-window
// per-account 429 budget. A real browser loading /, /search or /listing fires one /api/media request
// PER CARD PHOTO — that is bulk photo testing and re-exhausts the budget. This script STUBS
// **/api/media/** at the network layer (fulfilled with a 1x1 PNG), so a full sweep costs ZERO MLS
// media calls. Verify real photos separately on 1-2 listings only (see AGENT_LEARNINGS.md).
//
// Usage: node scripts/watch-live-sweep.mjs [base]
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'https://realtylt-website.vercel.app';
const ROUTES = ['/', '/search', '/listing/KEY1023749', '/ai', '/financing', '/top-areas', '/saved', '/connect'];
const VIEWPORTS = [
  { name: '1280', width: 1280, height: 900, mobile: false },
  { name: '390', width: 390, height: 844, mobile: true },
];
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

let fail = 0;
let mediaStubbed = 0;
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  console.log(`\n===== VIEWPORT ${vp.name} =====`);
  for (const route of ROUTES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const page = await ctx.newPage();
    await page.route('**/api/media/**', (r) => {
      mediaStubbed++;
      return r.fulfill({ status: 200, contentType: 'image/png', body: PNG });
    });

    const errs = [];
    const csp = [];
    const bad = [];
    page.on('console', (m) => {
      const t = m.text();
      if (/content security policy|refused to (load|connect|execute|apply)/i.test(t)) csp.push(t.slice(0, 130));
      else if (m.type() === 'error') errs.push(t.slice(0, 130));
    });
    page.on('pageerror', (e) => errs.push(`pageerror: ${String(e.message).slice(0, 130)}`));
    page.on('requestfailed', (rq) => {
      // ERR_ABORTED is a CANCELLATION, not a load failure. Leaflet aborts in-flight tiles for the
      // old viewport when the map re-fits to the pins; those tiles were never needed. Counting them
      // as failures makes /search false-FAIL forever. Real failures (ERR_FAILED, blocked, refused)
      // still count.
      const err = rq.failure()?.errorText ?? '';
      if (err.includes('ERR_ABORTED')) return;
      if (!/\/api\/media\//.test(rq.url())) bad.push(`FAILED ${err} ${rq.url().slice(0, 80)}`);
    });
    page.on('response', (rs) => {
      if (rs.status() >= 400) bad.push(`${rs.status()} ${rs.url().slice(0, 90)}`);
    });

    try {
      const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(route === '/ai' ? 7000 : 3000);
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      const overflow = sw > cw + 1;

      let extra = '';
      let mapBroken = false;
      if (route === '/') extra = ` railCards=${await page.locator('a[href^="/listing/"]').count()}`;
      if (route === '/search') {
        const cards = await page.locator('a[href^="/listing/"]').count();
        const strip = await page.getByText(/listings found/i).first().textContent().catch(() => '');
        // Real map signal (replaces the ERR_ABORTED noise): tiles must actually RENDER.
        const tiles = await page.locator('img.leaflet-tile-loaded').count();
        mapBroken = tiles === 0;
        extra = ` cards=${cards} tilesLoaded=${tiles} strip="${(strip ?? '').trim().slice(0, 28)}"`;
      }
      if (route === '/ai') extra = ` canvases=${await page.locator('canvas').count()}`;
      if (route.startsWith('/listing/')) {
        const h1 = await page.locator('h1').first().textContent().catch(() => '');
        extra = ` h1="${(h1 ?? '').trim().slice(0, 34)}" zeroSpec=${/0 Bed|0 Bath|0 Sq/.test(await page.content())}`;
      }

      const ok = resp.status() === 200 && !errs.length && !csp.length && !bad.length && !overflow && !mapBroken;
      if (!ok) fail++;
      console.log(
        `${ok ? 'PASS' : 'FAIL'} ${route} [${resp.status()}] err=${errs.length} csp=${csp.length} 4xx=${bad.length} hOverflow=${overflow} (sw=${sw}/cw=${cw})${extra}`,
      );
      if (errs.length) console.log(`   ERRS: ${JSON.stringify([...new Set(errs)].slice(0, 4))}`);
      if (csp.length) console.log(`   CSP:  ${JSON.stringify([...new Set(csp)].slice(0, 3))}`);
      if (bad.length) console.log(`   BAD:  ${JSON.stringify([...new Set(bad)].slice(0, 5))}`);
    } catch (e) {
      fail++;
      console.log(`FAIL ${route} — ${e.message.split('\n')[0]}`);
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();
console.log(`\n/api/media requests stubbed (real MLS media calls made: 0): ${mediaStubbed}`);
console.log(fail ? `\n${fail} FAILURE(S)` : '\nALL PASS');
process.exit(fail ? 1 : 0);
