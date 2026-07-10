// Capture live realtylt.com as the visual + structural reference for the rebuild.
// Outputs to docs/reference/: <slug>-1280.png, <slug>-390.png, sitemap-live.json, page-inventory.json
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('docs/reference');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'https://realtylt.com';

// Pages named in the brief (slug -> path). County slugs get discovered from the nav and merged in.
const PAGES = {
  home: '/',
  search: '/search',
  buying: '/buying',
  selling: '/selling',
  top_areas: '/top_areas',
  financing: '/financing',
  homevalue: '/homevalue',
  who_we_are: '/realestateagent/search',
  blog: '/blog',
  connect: '/connect',
};

const browser = await chromium.launch();

async function newPage(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  return { ctx, page };
}

// ---- 1. Discover real nav + footer links from the live homepage ----
const { ctx: dctx, page: dpage } = await newPage(1280, 900);
await dpage.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => dpage.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }));
const linkMap = await dpage.evaluate(() => {
  const grab = (root) =>
    [...root.querySelectorAll('a[href]')].map((a) => ({
      text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      href: a.getAttribute('href'),
    })).filter((l) => l.text || l.href);
  const header = document.querySelector('header, nav, [class*="nav"], [class*="header"]');
  const footer = document.querySelector('footer, [class*="footer"]');
  return {
    header: header ? grab(header) : [],
    footer: footer ? grab(footer) : [],
    all: grab(document).slice(0, 300),
  };
});
fs.writeFileSync(path.join(OUT, 'sitemap-live.json'), JSON.stringify(linkMap, null, 2));
await dctx.close();

// Merge discovered county/reviews links into the page list
const seen = new Set(Object.values(PAGES));
for (const l of linkMap.all) {
  if (!l.href) continue;
  let p;
  try { p = new URL(l.href, BASE); } catch { continue; }
  if (p.origin !== BASE) continue;
  const full = p.pathname + p.search;
  const t = l.text.toLowerCase();
  if (/dutchess|westchester|putnam|rockland|ulster|review/.test(t + ' ' + p.pathname.toLowerCase())) {
    const slug = (t.replace(/[^a-z]+/g, '_') || p.pathname.replace(/[^a-z]+/gi, '_')).replace(/^_+|_+$/g, '').slice(0, 30);
    if (!seen.has(full) && slug) { PAGES[slug] = full; seen.add(full); }
  }
}

// ---- 2. Screenshot every page at 1280 and 390 + structural inventory ----
const inventory = {};
for (const [slug, urlPath] of Object.entries(PAGES)) {
  const url = urlPath.startsWith('http') ? urlPath : BASE + urlPath;
  for (const width of [1280, 390]) {
    const { ctx, page } = await newPage(width, width === 1280 ? 900 : 844);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }));
      await page.waitForTimeout(2500); // let carousels/IDX widgets settle
      await page.screenshot({ path: path.join(OUT, `${slug}-${width}.png`), fullPage: true });
      if (width === 1280) {
        inventory[slug] = await page.evaluate(() => ({
          url: location.href,
          title: document.title,
          h1: [...document.querySelectorAll('h1')].map((e) => e.textContent.trim().replace(/\s+/g, ' ')),
          h2: [...document.querySelectorAll('h2')].map((e) => e.textContent.trim().replace(/\s+/g, ' ')).slice(0, 25),
          forms: [...document.querySelectorAll('form')].map((f) => ({
            fields: [...f.querySelectorAll('input,select,textarea')].map((i) => i.name || i.placeholder || i.type).slice(0, 15),
          })),
          buttons: [...document.querySelectorAll('button, a.btn, [class*="button"], input[type=submit]')]
            .map((b) => (b.textContent || b.value || '').trim().replace(/\s+/g, ' '))
            .filter((t) => t && t.length < 60).slice(0, 30),
        }));
      }
      console.log(`OK  ${slug} @${width}`);
    } catch (e) {
      console.log(`ERR ${slug} @${width}: ${e.message.split('\n')[0]}`);
      inventory[slug] = inventory[slug] || { url, error: e.message.split('\n')[0] };
    } finally {
      await ctx.close();
    }
  }
}
fs.writeFileSync(path.join(OUT, 'page-inventory.json'), JSON.stringify(inventory, null, 2));
await browser.close();
console.log('DONE. Pages captured:', Object.keys(PAGES).join(', '));
