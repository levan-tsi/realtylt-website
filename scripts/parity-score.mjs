/**
 * PARITY SCORER — objective, weighted comparison of OUR /search + /listing against the
 * LIVE realtylt.com (Brivity) equivalents. This is the acceptance test for parity rounds:
 * the owner's bar is >= 95% total.
 *
 * Usage:  node scripts/parity-score.mjs [--base http://127.0.0.1:3000] [--json out.json]
 *
 * READ-ONLY on live (it only reads DOM; it NEVER submits a form). Every dimension is a
 * concrete, re-measurable fact — not a vibe. Each returns { score 0..1, detail }.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const arg = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const BASE = arg("--base", "http://127.0.0.1:3000");
const LIVE = "https://www.realtylt.com";
const JSON_OUT = arg("--json", null);

const near = (a, b, tol) => (a == null || b == null ? 0 : Math.abs(a - b) <= tol ? 1 : Math.max(0, 1 - Math.abs(a - b) / (tol * 4)));
const has = (cond) => (cond ? 1 : 0);
const ratio = (a, b) => (!a || !b ? 0 : Math.min(a, b) / Math.max(a, b));

/** Anatomy of a search page, measured identically on both sites. */
async function readSearch(page, isLive) {
  return page.evaluate((live) => {
    const txt = document.body.innerText;
    const cardSel = live ? "a[href*='-bid-']" : "ul a[href^='/listing/']";
    const cards = [...new Set([...document.querySelectorAll(cardSel)].map((a) => (live ? a.querySelector("div") : a.closest("article"))).filter(Boolean))];
    const first = cards[0];
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const cardBox = rect(first);
    const img = first?.querySelector("img") || first?.querySelector("[style*='background']");
    const imgBox = rect(img);

    // map surface
    const map = document.querySelector(".gm-style, .leaflet-container");
    const mapBox = rect(map);
    // price chips on the map — VISIBLE only, deduped by text+rounded position (live paints
    // shadow/duplicate nodes per marker, which would otherwise inflate its count).
    const seenChip = new Set();
    const chips = [...document.querySelectorAll("div,span,button")].filter((e) => {
      if (e.childElementCount !== 0 || !/^\$[\d.,]+[KkMm]?$/.test((e.textContent || "").trim())) return false;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const key = `${e.textContent.trim()}@${Math.round(r.left / 8)},${Math.round(r.top / 8)}`;
      if (seenChip.has(key)) return false;
      seenChip.add(key);
      return true;
    });
    const chipEl = chips[0];
    const chipCS = chipEl ? getComputedStyle(chipEl) : null;

    // grid columns: distinct x positions of card boxes
    const xs = [...new Set(cards.slice(0, 12).map((c) => Math.round(c.getBoundingClientRect().left / 10) * 10))];

    return {
      totalText: txt.match(/[\d,]+\s+(listings|homes|properties|results)[^\n]*/i)?.[0] ?? null,
      cardsPerPage: cards.length,
      gridColumns: xs.length,
      cardWidth: cardBox ? Math.round(cardBox.width) : null,
      cardHeight: cardBox ? Math.round(cardBox.height) : null,
      photoAspect: imgBox && imgBox.height ? +(imgBox.width / imgBox.height).toFixed(2) : null,
      cardText: (first?.innerText || "").replace(/\s+/g, " ").slice(0, 200),
      // Field coverage measured ACROSS ALL CARDS (fraction), not just the first — feed rows
      // legitimately lack beds/baths (land, multi-family) on BOTH sites.
      hasPrice: cards.filter((c) => /\$[\d,]{4,}/.test(c.innerText)).length / (cards.length || 1),
      hasBedBath:
        cards.filter((c) => /\d+\s*(Bed|bd)/i.test(c.innerText) && /\d+\s*(Bath|ba)/i.test(c.innerText)).length /
        (cards.length || 1),
      hasSqft: cards.filter((c) => /sq\.?\s*ft/i.test(c.innerText)).length / (cards.length || 1),
      hasListedWith: cards.filter((c) => /listed with/i.test(c.innerText)).length / (cards.length || 1),
      hasStatusBadge: cards.filter((c) => /(NEW|COMING SOON|OPEN HOUSE|ACTIVE|PENDING)/i.test(c.innerText)).length / (cards.length || 1),
      hasHeart: cards.filter((c) => c.querySelector("button,svg,i")).length / (cards.length || 1),
      mapPresent: !!map,
      mapWidthPct: mapBox ? Math.round((mapBox.width / window.innerWidth) * 100) : null,
      chipCount: chips.length,
      chipSample: chips.slice(0, 6).map((e) => e.textContent.trim()),
      chipBg: chipCS ? chipCS.backgroundColor : null,
      chipRadius: chipCS ? chipCS.borderRadius : null,
      // filter bar: count VISIBLE interactive filter controls in the top band, by concept
      // (ours uses <select>, live uses dropdown buttons — compare capability, not markup).
      filterConcepts: [
        ...new Set(
          [...document.querySelectorAll("button,select,input,a")]
            .filter((e) => e.offsetParent !== null && e.getBoundingClientRect().top < 460)
            .map((e) => {
              const t = ((e.textContent || "") + " " + (e.getAttribute("aria-label") || "") + " " + (e.placeholder || "")).toLowerCase();
              if (/find a place|location|city|zip/.test(t)) return "place";
              if (/\bbed/.test(t)) return "bed";
              if (/\bbath/.test(t)) return "bath";
              if (/price/.test(t)) return "price";
              if (/sq\.?\s?ft|square/.test(t)) return "sqft";
              if (/property type|\btype\b/.test(t)) return "type";
              if (/^more|more filters/.test(t.trim())) return "more";
              if (/save search/.test(t)) return "saveSearch";
              return null;
            })
            .filter(Boolean),
        ),
      ],
      hasFindAPlace: !!document.querySelector("input[placeholder*='Find a Place' i], input[placeholder*='place' i]"),
      hasSaveSearch: /save search/i.test(txt),
      hasMoreBtn: [...document.querySelectorAll("button,a")].some((b) => /^more/i.test((b.textContent || "").trim())),
      quickFilters: [
        ...new Set(
          [...document.querySelectorAll("button,a,li")]
            .map((e) => (e.textContent || "").trim())
            .filter((t) => /^(All Listings|Open Houses|New Listings|Price Reduced)$/i.test(t)),
        ),
      ],
      sortPresent: /sort by/i.test(txt),
      countyChips: [
        ...new Set(
          [...document.querySelectorAll("button,a,span")]
            .filter((e) => e.offsetParent !== null)
            .map((e) => (e.textContent || "").trim())
            .filter((t) => /County(,| )/i.test(t) && t.length < 40),
        ),
      ].length,
      // pagination — VISIBLE page-number controls only
      pageNumbers: [
        ...new Set(
          [...document.querySelectorAll("a,button,li")]
            .filter((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 0)
            .map((e) => (e.textContent || "").trim())
            .filter((t) => /^\d+$/.test(t) && Number(t) < 500),
        ),
      ].length,
      hasPrevNext: [...document.querySelectorAll("a,button,li")].some((e) => /^(«|»|‹|›|next|prev)/i.test((e.textContent || "").trim())),
      mlsAttribution: /one\s*key mls|information provided by/i.test(txt),
      hOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  }, isLive);
}

const browser = await chromium.launch();
const out = { base: BASE, dims: [], sections: {} };

async function open(url, isLive, width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector(isLive ? "a[href*='-bid-']" : "a[href^='/listing/']", { timeout: 120000, state: "attached" }).catch(() => {});
  await page.waitForTimeout(isLive ? 9000 : 7000);
  return page;
}

const livePage = await open(`${LIVE}/search`, true);
const live = await readSearch(livePage, true);
// let map chips paint
for (let i = 0; i < 15 && live.chipCount < 10; i++) {
  await livePage.waitForTimeout(1000);
  Object.assign(live, await readSearch(livePage, true));
}
await livePage.screenshot({ path: "docs/_audit/search-parity/score-live-1440.png" });
await livePage.close();

const ourPage = await open(`${BASE}/search`, false);
const ours = await readSearch(ourPage, false);
for (let i = 0; i < 20 && ours.chipCount < 10; i++) {
  await ourPage.waitForTimeout(1000);
  Object.assign(ours, await readSearch(ourPage, false));
}
await ourPage.screenshot({ path: "docs/_audit/search-parity/score-ours-1440.png" });
await ourPage.close();

// ---------- weighted dimensions ----------
const D = (name, weight, score, detail) => out.dims.push({ name, weight, score: +score.toFixed(3), detail });

D("cards per page", 8, ratio(ours.cardsPerPage, live.cardsPerPage), `ours ${ours.cardsPerPage} vs live ${live.cardsPerPage}`);
D("grid columns", 4, ours.gridColumns === live.gridColumns ? 1 : 0.5, `ours ${ours.gridColumns} vs live ${live.gridColumns}`);
D("card width", 4, near(ours.cardWidth, live.cardWidth, 40), `ours ${ours.cardWidth}px vs live ${live.cardWidth}px`);
D("card photo aspect", 4, near(ours.photoAspect, live.photoAspect, 0.25), `ours ${ours.photoAspect} vs live ${live.photoAspect}`);
const pct = (a, b) => (a >= b ? 1 : near(a * 100, b * 100, 12));
const fmt = (n) => `${Math.round(n * 100)}%`;
D("card: price", 3, pct(ours.hasPrice, live.hasPrice), `ours ${fmt(ours.hasPrice)} vs live ${fmt(live.hasPrice)} of cards`);
D("card: bed+bath", 3, pct(ours.hasBedBath, live.hasBedBath), `ours ${fmt(ours.hasBedBath)} vs live ${fmt(live.hasBedBath)} of cards`);
D("card: sqft", 2, pct(ours.hasSqft, live.hasSqft), `ours ${fmt(ours.hasSqft)} vs live ${fmt(live.hasSqft)} of cards`);
D("card: listed with", 3, pct(ours.hasListedWith, live.hasListedWith), `ours ${fmt(ours.hasListedWith)} vs live ${fmt(live.hasListedWith)}`);
D("card: status badge", 3, pct(ours.hasStatusBadge, live.hasStatusBadge), `ours ${fmt(ours.hasStatusBadge)} vs live ${fmt(live.hasStatusBadge)}`);
D("card: save heart", 2, pct(ours.hasHeart, live.hasHeart), `ours ${fmt(ours.hasHeart)} vs live ${fmt(live.hasHeart)}`);
D("map present", 5, has(ours.mapPresent === live.mapPresent), `${ours.mapPresent}/${live.mapPresent}`);
D("map width share", 4, near(ours.mapWidthPct, live.mapWidthPct, 8), `ours ${ours.mapWidthPct}% vs live ${live.mapWidthPct}%`);
D("map price chips", 8, ours.chipCount >= 10 && live.chipCount >= 10 ? Math.min(1, ratio(ours.chipCount, live.chipCount) + 0.25) : has(ours.chipCount >= 10), `ours ${ours.chipCount} vs live ${live.chipCount}`);
D("chip format ($875K/$1.3M)", 4, has(ours.chipSample.every((c) => /^\$[\d.]+[KM]$/.test(c)) && ours.chipSample.length > 0), `${ours.chipSample.slice(0, 3).join(",")} vs ${live.chipSample.slice(0, 3).join(",")}`);
D(
  "filter bar concepts",
  5,
  live.filterConcepts.length ? live.filterConcepts.filter((c) => ours.filterConcepts.includes(c)).length / live.filterConcepts.length : 0,
  `ours [${ours.filterConcepts.join("|")}] vs live [${live.filterConcepts.join("|")}]`,
);
D("find-a-place input", 3, has(ours.hasFindAPlace === live.hasFindAPlace), `${ours.hasFindAPlace}/${live.hasFindAPlace}`);
D("MORE button", 4, has(ours.hasMoreBtn === live.hasMoreBtn), `${ours.hasMoreBtn}/${live.hasMoreBtn}`);
D("SAVE SEARCH", 3, has(ours.hasSaveSearch === live.hasSaveSearch), `${ours.hasSaveSearch}/${live.hasSaveSearch}`);
D("quick filters", 4, ratio(ours.quickFilters.length, live.quickFilters.length), `ours [${ours.quickFilters.join("|")}] vs live [${live.quickFilters.join("|")}]`);
D("sort control", 3, has(ours.sortPresent === live.sortPresent), `${ours.sortPresent}/${live.sortPresent}`);
D("county chips", 4, ratio(ours.countyChips, live.countyChips), `ours ${ours.countyChips} vs live ${live.countyChips}`);
D("count line", 4, has(!!ours.totalText && !!live.totalText), `ours "${ours.totalText}" vs live "${live.totalText}"`);
D("pagination numbers", 4, ratio(ours.pageNumbers, live.pageNumbers), `ours ${ours.pageNumbers} vs live ${live.pageNumbers}`);
D("pagination prev/next", 2, has(ours.hasPrevNext === live.hasPrevNext), `${ours.hasPrevNext}/${live.hasPrevNext}`);
D("MLS attribution", 3, has(ours.mlsAttribution === live.mlsAttribution), `${ours.mlsAttribution}/${live.mlsAttribution}`);
D("no horizontal overflow", 2, has(!ours.hOverflow), `ours overflow=${ours.hOverflow}`);

const totalW = out.dims.reduce((s, d) => s + d.weight, 0);
const gotW = out.dims.reduce((s, d) => s + d.weight * d.score, 0);
out.score = +((gotW / totalW) * 100).toFixed(1);
out.pass = out.score >= 95;
out.live = live;
out.ours = ours;
out.weakest = out.dims.filter((d) => d.score < 1).sort((a, b) => b.weight * (1 - b.score) - a.weight * (1 - a.score)).slice(0, 12);

await browser.close();
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
console.log(
  JSON.stringify(
    { score: out.score, pass: out.pass, weakest: out.weakest, ourCards: ours.cardsPerPage, liveCards: live.cardsPerPage },
    null,
    1,
  ),
);
