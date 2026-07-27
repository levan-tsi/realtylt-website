// Verifier for the owner's "photo coming soon" rule on listing pages (added 2026-07-26).
//
// The owner's rule, verbatim intent: if a listing has ANY real photo, show ONLY real photos —
// never a coming-soon tile beside real ones; render exactly the photos that exist; only a
// listing with ZERO real photos shows the branded placeholder.
//
// Encoded here as measurable pass/fail so it can be re-checked every round. Written by the
// orchestrator BEFORE the fix was built, deliberately, so the metric grades the build rather
// than being shaped by it.
//
// THE RULES
//   R1  If ANY real photo renders, NO branded placeholder may render anywhere. (the owner's rule)
//   R2  A listing whose page claims zero photos MUST show the branded placeholder.
//   R3  A visitor-facing photo count ("Show all N photos" / "View All (N Photos)") must equal the
//       number of distinct photos the page still OFFERS in the DOM — so a page that prunes dead
//       tiles must lower its count too, and can never advertise photos it cannot show.
//   R4  No broken frames (an <img> that finished loading at naturalWidth 0).
//   R5  At most ONE branded placeholder may render — never a padded grid of them.
//
// "claimed" comes from the page's own JSON-LD `image` array, i.e. what the page promises.
// peakInFlight reports our own request pressure on the media host (see SAFETY below).
//
// SAFETY: this script must never become a load generator. It judges the photo band the visitor
// lands on and leaves lazy tiles lazy. Proven 2026-07-26 from Vercel runtime logs: force-opening
// a 48-photo <details> fires ~48 concurrent media requests, the MLS host answers 429, and OTHER
// listings' cover photos get 429'd as collateral. Do NOT "improve" this by forcing the gallery
// open — the account is already rate-limited and at suspension risk.
//
// Usage: BASE=http://127.0.0.1:3100 TAG=after IDS=KEY1,KEY2 node scripts/verify-photo-rule.mjs
// Pick specimens per shape with scripts/_scratch-find-specimens.mjs (0-photo / dead-cover /
// covers-only / fully-mirrored).
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE ?? "https://realtylt-website.vercel.app";
const IDS = (process.env.IDS ?? "").split(",").filter(Boolean);
const OUT = process.env.OUT ?? "docs/_audit/listing-round9/rule";
const TAG = process.env.TAG ?? "before";
const WIDTHS = (process.env.WIDTHS ?? "1440,390").split(",").map(Number);
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const id of IDS) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: "reduce" });
    let verdict = {};
    // Watch our own request pressure on the media host: peak concurrent /api/media requests.
    // A page that bursts is a page that manufactures 429s (and therefore placeholders).
    let inFlight = 0, peakInFlight = 0, upstream429 = 0;
    page.on("request", (r) => { if (r.url().includes("/api/media/")) { inFlight++; peakInFlight = Math.max(peakInFlight, inFlight); } });
    page.on("requestfinished", (r) => { if (r.url().includes("/api/media/")) inFlight--; });
    page.on("requestfailed", (r) => { if (r.url().includes("/api/media/")) inFlight--; });
    page.on("response", (r) => { if (r.url().includes("/api/media/") && r.status() === 503) upstream429++; });
    try {
      await page.goto(`${BASE}/listing/${id}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});

      // DO NOT force the full gallery open. Proven 2026-07-26 via Vercel runtime logs: opening a
      // 48-photo <details> fires ~48 concurrent media requests and the MLS host answers 429 —
      // including on OTHER listings' covers. The verifier must not be a load generator. We judge
      // the photo band the visitor actually lands on (hero + thumbnails), which is where the
      // owner reported the bug, and let lazy tiles stay lazy.
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      // outlast MlsImage's 2s + 8s retry ladder
      await page.waitForTimeout(14000);

      verdict = await page.evaluate((listingId) => {
        const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map((s) => { try { return JSON.parse(s.textContent || "{}"); } catch { return {}; } })
          .find((o) => Array.isArray(o.image));
        const claimed = ld ? ld.image.length : null;

        // Scope to THIS listing's own photos. The similar-homes rail carries OTHER listings'
        // cards, and a card for a genuinely photo-less listing is *supposed* to show the branded
        // placeholder — counting those made R1 report a violation that wasn't one (2026-07-26).
        const ofThisListing = (el) => ((el.currentSrc || el.src || "").match(/\/api\/media\/([^/]+)\//) || [])[1] === listingId;
        const tiles = Array.from(document.querySelectorAll("img")).filter((i) => {
          const r = i.getBoundingClientRect();
          return (i.currentSrc || i.src || "").includes("/api/media/") && r.width > 30 && r.height > 30 && ofThisListing(i);
        });
        const isPlaceholder = (i) => {
          const s = i.currentSrc || i.src || "";
          // the branded SVG is served by the media route; it decodes at its viewBox size
          return s.includes("svg") || (i.complete && i.naturalWidth === 200 && i.naturalHeight === 150);
        };
        // The hero + thumb rail repeat indices that also appear in the <details> grid, so count
        // DISTINCT photo indices, not <img> elements — otherwise a correct page fails R3.
        const idxOf = (i) => ((i.currentSrc || i.src || "").match(/\/api\/media\/[^/]+\/(\d+)/) || [])[1];
        // Every distinct photo index the page still OFFERS (loaded or lazy). After a correct fix,
        // tiles proven dead are removed from the DOM, so this is the page's honest photo count —
        // which is what any visitor-facing "N photos" label must agree with.
        const offered = new Set();
        for (const i of document.querySelectorAll("img")) {
          if (!ofThisListing(i)) continue;
          const k = idxOf(i);
          if (k != null) offered.add(k);
        }
        const realIdx = new Set(), phIdx = new Set(), brokenIdx = new Set();
        for (const i of tiles) {
          const k = idxOf(i) ?? Math.random().toString();
          if (isPlaceholder(i)) phIdx.add(k);
          else if (i.complete && i.naturalWidth > 0) realIdx.add(k);
          else if (i.complete) brokenIdx.add(k);
        }
        // an index that recovered on retry in one slot but not another counts as real
        for (const k of realIdx) phIdx.delete(k);
        const placeholderTiles = { length: phIdx.size };
        const real = realIdx.size;
        const broken = brokenIdx.size;
        const pending = tiles.filter((i) => !i.complete).length;

        // NoPhoto rendered as markup (not an <img>) — again only inside THIS listing's photo
        // section, never the similar-homes rail below it.
        const photoSection = document.querySelector("section[aria-label='Photos']") || document.body;
        const noPhotoBlocks = Array.from(photoSection.querySelectorAll("*")).filter(
          (e) => e.children.length === 0 && /photo coming soon/i.test(e.textContent || ""),
        ).length;

        let label = null;
        for (const e of document.querySelectorAll("summary,button,a,span,p")) {
          const m = (e.textContent || "").match(/(?:show all|view all)\s*\(?(\d+)\)?\s*photos/i);
          if (m) { label = Number(m[1]); break; }
        }
        return { claimed, tiles: tiles.length, offered: offered.size, real, placeholders: placeholderTiles.length + noPhotoBlocks, broken, pending, label };
      }, id);
      await page.screenshot({ path: `${OUT}/${TAG}-${id}-${width}.png`, fullPage: false });
    } catch (e) {
      verdict = { error: String(e).split("\n")[0].slice(0, 110) };
    }

    const fails = [];
    if (!verdict.error) {
      const ph = verdict.placeholders ?? 0;
      if (verdict.real > 0 && ph > 0) fails.push(`R1 ${ph} placeholder(s) beside ${verdict.real} real`);
      if (verdict.claimed === 0 && ph === 0) fails.push("R2 zero-photo listing shows no placeholder");
      if (verdict.label != null && verdict.offered != null && verdict.label !== verdict.offered)
        fails.push(`R3 label ${verdict.label} vs ${verdict.offered} offered`);
      if (verdict.broken > 0) fails.push(`R4 ${verdict.broken} broken frames`);
      if (ph > 1) fails.push(`R5 ${ph} placeholders (max 1)`);
      // R6 guards the metric itself: a page that rendered no photo surface AND no JSON-LD is a
      // failed render (e.g. Next's dev "clientReferenceManifest" invariant), not a clean pass.
      if (verdict.claimed == null && verdict.tiles === 0 && ph === 0) fails.push("R6 page rendered no photo surface at all (failed render?)");
    }
    const ok = fails.length === 0 && !verdict.error;
    results.push({ id, width, ...verdict, peakInFlight, mediaFailures: upstream429, fails });
    console.log(
      `${ok ? "PASS" : "FAIL"} ${id} @${width}  claimed=${verdict.claimed ?? "?"} tiles=${verdict.tiles ?? "?"} real=${verdict.real ?? "?"} ph=${verdict.placeholders ?? "?"} label=${verdict.label ?? "-"} peakInFlight=${peakInFlight} 503s=${upstream429}` +
        `${fails.length ? "  << " + fails.join(" | ") : ""}${verdict.error ? "  ERR " + verdict.error : ""}`,
    );
    await page.close();
  }
}

fs.writeFileSync(`${OUT}/${TAG}-verdicts.json`, JSON.stringify(results, null, 1));
const failed = results.filter((r) => r.fails?.length || r.error);
console.log(`\n${results.length - failed.length}/${results.length} PASS  (${TAG})`);
await browser.close();
process.exit(failed.length ? 1 : 0);
