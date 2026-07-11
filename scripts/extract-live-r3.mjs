// Round-3 ground-truth extraction: computed styles + region luminance, LIVE vs LOCAL.
// Usage: node scripts/extract-live-r3.mjs [localBase]
import { chromium } from 'playwright';

const LOCAL = process.argv[2] || 'http://localhost:3777';
const browser = await chromium.launch();

async function probe(url, jobs) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  } catch (e) {
    await ctx.close();
    return { error: e.message.split('\n')[0].slice(0, 100) };
  }
  await page.waitForTimeout(3000);
  const out = {};
  for (const [name, fn] of Object.entries(jobs)) {
    try {
      out[name] = await fn(page);
    } catch (e) {
      out[name] = `ERR ${e.message.split('\n')[0].slice(0, 90)}`;
    }
  }
  await ctx.close();
  return out;
}

// Mean luminance of a bounding box, via element screenshot decoded in a fresh page canvas.
async function lum(page, selector) {
  const el = page.locator(selector).first();
  const buf = await el.screenshot({ timeout: 8000 });
  const b64 = buf.toString('base64');
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  const v = await p2.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    const w = (c.width = Math.min(img.width, 400));
    const h = (c.height = Math.min(img.height, 400));
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    const d = c.getContext('2d').getImageData(0, 0, w, h).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return Math.round(s / (d.length / 4));
  }, b64);
  await ctx2.close();
  return v;
}

const css = (sel, props) => async (page) =>
  page.locator(sel).first().evaluate((el, props) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const o = { rect: `${Math.round(r.width)}x${Math.round(r.height)}` };
    for (const p of props) o[p] = s[p];
    return o;
  }, props);

const R = {};

// ---------- LIVE HOME ----------
R.liveHome = await probe('https://www.realtylt.com/', {
  h1: css('h1, .hero h1, [class*="hero"] h1', ['fontSize', 'fontWeight', 'color']),
  heroH: async (p) =>
    p.evaluate(() => {
      const h1 = document.querySelector('h1');
      let sec = h1;
      while (sec && sec.getBoundingClientRect().height < 200) sec = sec.parentElement;
      return sec ? Math.round(sec.getBoundingClientRect().height) : null;
    }),
  heroLum: (p) => lum(p, 'h1'),
  fairBar: css('[class*="fair"], [class*="housing"]', ['backgroundColor', 'height']),
  card: async (p) =>
    p.evaluate(() => {
      // find a listing card: element containing a $ price overlay
      const els = [...document.querySelectorAll('a,div')].filter(
        (e) => /^\$[\d,]+/.test(e.textContent?.trim() || '') && e.querySelector('img'),
      );
      const card = els.find((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 200 && r.width < 400 && r.height > 200;
      });
      if (!card) return null;
      const r = card.getBoundingClientRect();
      const img = card.querySelector('img');
      const ir = img.getBoundingClientRect();
      const price = [...card.querySelectorAll('*')].find((e) => /^\$[\d,]+$/.test(e.textContent?.trim() || ''));
      return {
        card: `${Math.round(r.width)}x${Math.round(r.height)}`,
        img: `${Math.round(ir.width)}x${Math.round(ir.height)}`,
        imgRatio: (ir.width / ir.height).toFixed(2),
        priceFont: price ? getComputedStyle(price).fontSize + '/' + getComputedStyle(price).fontWeight : null,
      };
    }),
  quote: async (p) =>
    p.evaluate(() => {
      const el = [...document.querySelectorAll('h1,h2,h3,h4,p,div,blockquote')].find((e) =>
        (e.textContent || '').trim().startsWith('"We found a home we love."') && e.children.length === 0,
      );
      if (!el) return null;
      const s = getComputedStyle(el);
      const band = el.closest('section,div[class*="section"],div[class*="testimonial"]');
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        color: s.color,
        bandBg: band ? getComputedStyle(band).backgroundColor : null,
      };
    }),
  searchStrip: async (p) =>
    p.evaluate(() => {
      const inp = document.querySelector('input[placeholder*="Search" i], input[placeholder*="search" i]');
      if (!inp) return null;
      let band = inp.parentElement;
      while (band && band.getBoundingClientRect().width < 900) band = band.parentElement;
      const s = getComputedStyle(band);
      return { bg: s.backgroundColor, h: Math.round(band.getBoundingClientRect().height) };
    }),
});

// ---------- LOCAL HOME ----------
R.localHome = await probe(LOCAL + '/', {
  h1: css('h1', ['fontSize', 'fontWeight', 'color']),
  heroLum: (p) => lum(p, 'section:has(h1), header + * h1'),
  fairBar: css('[class*="fair" i], [aria-label*="fair" i]', ['backgroundColor', 'height']),
  card: async (p) =>
    p.evaluate(() => {
      const card = document.querySelector('[class*="ListingCard"], article, a[href^="/listing/"]');
      if (!card) return null;
      const r = card.getBoundingClientRect();
      const img = card.querySelector('img');
      const ir = img?.getBoundingClientRect();
      return {
        card: `${Math.round(r.width)}x${Math.round(r.height)}`,
        img: ir ? `${Math.round(ir.width)}x${Math.round(ir.height)}` : null,
        imgRatio: ir ? (ir.width / ir.height).toFixed(2) : null,
      };
    }),
  quote: async (p) =>
    p.evaluate(() => {
      const el = [...document.querySelectorAll('p,div,blockquote,h2,h3,figure *')].find(
        (e) => (e.textContent || '').trim().startsWith('“We found') || (e.textContent || '').trim().startsWith('"We found'),
      );
      if (!el) return null;
      const s = getComputedStyle(el);
      return { fontSize: s.fontSize, fontWeight: s.fontWeight, fontStyle: s.fontStyle, color: s.color };
    }),
});

// ---------- LIVE HOMEVALUE ----------
R.liveHV = await probe('https://www.realtylt.com/homevalue', {
  h1: css('h1', ['fontSize', 'fontFamily', 'color']),
  heroH: async (p) =>
    p.evaluate(() => {
      const h1 = document.querySelector('h1');
      let sec = h1;
      while (sec && sec.getBoundingClientRect().height < 400) sec = sec.parentElement;
      return sec ? Math.round(sec.getBoundingClientRect().height) : null;
    }),
  findOutBtn: async (p) =>
    p.evaluate(() => {
      const b = [...document.querySelectorAll('button, input[type=submit], a')].find((e) =>
        /find out/i.test(e.textContent || e.value || ''),
      );
      return b ? { text: (b.textContent || b.value).trim(), tt: getComputedStyle(b).textTransform } : null;
    }),
});

// ---------- LIVE CONNECT ----------
R.liveConnect = await probe('https://www.realtylt.com/connect', {
  h1: css('h1', ['fontSize', 'color', 'fontWeight']),
  heroLum: (p) => lum(p, 'h1'),
});

// ---------- LOCAL CONNECT ----------
R.localConnect = await probe(LOCAL + '/connect', {
  h1: css('h1', ['fontSize', 'color', 'fontWeight']),
  heroLum: (p) => lum(p, 'section:has(h1)'),
});

// ---------- LIVE SELLING section bgs ----------
R.liveSelling = await probe('https://www.realtylt.com/selling', {
  shine: sectionBg('Making Your Listing Shine'),
  loop: sectionBg('Stay in the Loop'),
  pricing: sectionBg('Pricing Strategy'),
  clients: sectionBg('WHAT OUR CLIENTS SAY'),
});
R.localSelling = await probe(LOCAL + '/selling', {
  shine: sectionBg('Making Your Listing Shine'),
  loop: sectionBg('Stay in the Loop'),
  pricing: sectionBg('Pricing Strategy'),
});

// ---------- FINANCING ----------
R.liveFin = await probe('https://www.realtylt.com/financing', {
  preApproval: sectionBg('Get Pre-Approval'),
  heroLum: (p) => lum(p, 'h1'),
  h1: css('h1', ['fontSize', 'color', 'textAlign']),
});
R.localFin = await probe(LOCAL + '/financing', {
  preApproval: sectionBg('Get Pre-Approval'),
  heroLum: (p) => lum(p, 'section:has(h1)'),
  h1: css('h1', ['fontSize', 'color', 'textAlign']),
});

// ---------- BUYING hero ----------
R.liveBuy = await probe('https://www.realtylt.com/buying', {
  heroLum: (p) => lum(p, 'h1'),
  h1: css('h1', ['fontSize', 'color']),
});
R.localBuy = await probe(LOCAL + '/buying', {
  heroLum: (p) => lum(p, 'section:has(h1)'),
  h1: css('h1', ['fontSize', 'color']),
});

function sectionBg(text) {
  return async (page) =>
    page.evaluate((text) => {
      const el = [...document.querySelectorAll('h1,h2,h3,h4,p,span,div')].find(
        (e) => (e.textContent || '').trim().toLowerCase().includes(text.toLowerCase()) && e.children.length <= 2,
      );
      if (!el) return 'NOT FOUND';
      let sec = el;
      while (sec && sec !== document.body) {
        const bg = getComputedStyle(sec).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)') {
          const r = sec.getBoundingClientRect();
          return { bg, w: Math.round(r.width), h: Math.round(r.height) };
        }
        sec = sec.parentElement;
      }
      return 'transparent-to-body';
    }, text);
}

console.log(JSON.stringify(R, null, 1));
await browser.close();
