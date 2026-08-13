// Round 28: the /search map, walked down a ZOOM LADDER over five markets.
//
// The owner's report was "when you zoom into the cities, some areas are batched in circles but
// not distributed properly… it is not showing listings properly". This gate answers the three
// questions that complaint actually contains, at every rung of every market:
//
//   1. NO COUNT CIRCLES. Round 23 replaced clustering with price pills + dots. A marker whose
//      face is a bare integer is a count bubble; `[object` anywhere in the map is the
//      `label:{text:''}` defect that once shipped green past every probe.
//   2. THE MAP SURVIVES THE ZOOM. Zooming onto ground with nothing for sale used to delete the
//      whole map: the results-empty branch sat ABOVE the map branch, so the one instrument the
//      visitor needed to get back out was the one removed (reproduced on the deployment,
//      2026-08-13). The map must still be there at every rung.
//   3. NO ORPHANED INVENTORY. Thinning is allowed to leave a home undrawn only when a drawn
//      marker is standing on the same spot. A home the map does not draw with NOTHING near it
//      is inventory a visitor cannot see, whatever the count line says. And when the viewport
//      holds few enough homes to draw them all, all of them must be drawn.
//
// PROBE DISCIPLINE (each of these was a real fault of an earlier draft of this file):
//   - clip to the MAP PANE, never the window. The bounds the app asks the API for are the
//     pane's, and at 1440x900 the pane runs below the fold — intersecting with the window
//     reported a third of the drawn markers as missing.
//   - a FRESH PAGE per market. One reused page hung every second market.
//   - re-read the map's box before every wheel. One box held for a whole ladder made an
//     empty rung look as though the map had zoomed itself back out.
//   - settle on "the pins request answered and the marker count stopped moving", never on
//     "there are markers": zero markers is a legitimate settled state at street zoom.
//   - park the pointer off the map before counting. A hovered marker is drawn as a pill
//     whatever the plan said; `hovered` is asserted 0, not assumed.
//   - markers are matched to API rows by aria-label. A marker's price is NOT the innerText of
//     its titled node.
//
// SELF-TEST: BREAK=circles|map|orphans injects the corresponding defect after the settle, so
// each dimension is proven able to fail before its green is believed.
//
// Usage: node scripts/verify-map-zoom-ladder.mjs [--json]
//        BASE=https://… ONLY=queens,ulster BREAK=map node scripts/verify-map-zoom-ladder.mjs
import { chromium } from "playwright";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const BREAK = process.env.BREAK ?? "";
const RUNGS = Number(process.env.RUNGS ?? 4);

/** A home may be left undrawn only if a drawn marker is within this many pixels of it. Measured
 * on this tree: the worst gap over 5 markets x 4 rungs was 34px, so 60 leaves real headroom
 * while still failing the moment a whole neighbourhood stops being drawn. */
const ORPHAN_PX = 60;
/** At or below this many homes in view there is room for nearly all of them. Not ALL: a home
 * standing directly behind another's price label genuinely cannot be drawn, and pretending
 * otherwise would make this a rule the map can never satisfy. Measured after the round-28 fix:
 * 14/15, 7/8, 13/13, 3/3 — so 0.8 holds with headroom while still failing the defect it was
 * written for (production drew 9 of 15 = 0.60 at this rung). */
const DRAW_ALL_AT_OR_BELOW = 20;
const DRAW_SHARE_AT_LOW_DENSITY = 0.8;

const MARKETS = [
  { slug: "queens", url: "/search?county=queens", label: "Queens — dense borough" },
  { slug: "yonkers", url: "/search?city=Yonkers", label: "Yonkers — dense city" },
  { slug: "whiteplains", url: "/search?city=White+Plains", label: "White Plains — small city" },
  { slug: "poughkeepsie", url: "/search?city=Poughkeepsie", label: "Poughkeepsie — mid city" },
  { slug: "ulster", url: "/search?county=ulster", label: "Ulster — sparse exurb" },
];

const instrument = () => {
  window.__pins = [];
  const orig = window.fetch;
  window.fetch = function (input) {
    const u = typeof input === "string" ? input : input?.url ?? "";
    const pr = orig.apply(this, arguments);
    if (u.includes("/api/idx/pins")) {
      const q = new URLSearchParams(u.split("?")[1] ?? "");
      const rec = {
        north: +q.get("north"), south: +q.get("south"), east: +q.get("east"), west: +q.get("west"),
        done: false, rows: null, total: null,
      };
      window.__pins.push(rec);
      pr.then((r) => r.clone().json())
        .then((d) => { rec.done = true; rec.rows = d.pins ?? []; rec.total = d.total ?? 0; })
        .catch(() => { rec.done = true; });
    }
    return pr;
  };
};

async function settle(p, timeout = 75000) {
  const t0 = Date.now();
  let last = -1, stable = 0;
  while (Date.now() - t0 < timeout) {
    const s = await p.evaluate(() => {
      const recs = window.__pins ?? [];
      return {
        pending: recs.filter((r) => !r.done).length,
        answered: recs.some((r) => r.done && r.rows),
        n: document.querySelectorAll(".rlt-price-chip, .rlt-map-dot").length,
      };
    }).catch(() => null);
    if (!s) return false;
    if (s.pending === 0 && s.answered && s.n === last) { if (++stable >= 2) return true; }
    else { stable = 0; last = s.n; }
    await p.waitForTimeout(700);
  }
  return false;
}

const measure = (p) =>
  p.evaluate(() => {
    const root = document.querySelector("div.relative.h-full.min-h-96.w-full");
    const style = document.querySelector(".gm-style");
    if (!style) return { mapMissing: true, componentRoot: !!root };
    const box = style.getBoundingClientRect();
    const clip = { l: box.left, r: box.right, t: box.top, b: box.bottom };
    const pts = [];
    const drawnKeys = new Set();
    let pills = 0, dots = 0, withinPlannerMargin = 0;
    // The planner keeps pins up to EDGE_MARGIN (48px) outside the viewport so a chip does not
    // pop in mid-pan, and the banner counts everything it planned. Compare the banner against
    // the SAME margin the planner uses — the memory's rule: one margin constant, both sides.
    const EDGE_MARGIN = 48;
    for (const e of document.querySelectorAll(".rlt-price-chip, .rlt-map-dot")) {
      const r = e.getBoundingClientRect();
      const pill = e.classList.contains("rlt-price-chip");
      // Compare ANCHORS with anchors. A pill hangs above its anchor, so its box centre sits
      // ~12px higher — clipping on the box centre dropped pills whose anchor was inside the
      // pane near the top edge, and each one then read as a home drawn nowhere. That was a
      // phantom orphan, not a defect.
      const x = r.x + r.width / 2;
      const y = pill ? r.bottom : r.y + r.height / 2;
      if (x >= clip.l - EDGE_MARGIN && x <= clip.r + EDGE_MARGIN && y >= clip.t - EDGE_MARGIN && y <= clip.b + EDGE_MARGIN)
        withinPlannerMargin++;
      if (x < clip.l || x > clip.r || y < clip.t || y > clip.b) continue; // off-pane pins keep a box
      pill ? pills++ : dots++;
      pts.push({ x, y });
      drawnKeys.add((e.getAttribute("aria-label") ?? "").split(" — ").slice(0, 2).join(" — "));
    }
    // A count bubble's signature is a bare integer on a marker-shaped node inside the map.
    const strays = [];
    for (const e of style.querySelectorAll("button, span, div")) {
      if (e.classList.contains("rlt-price-chip") || e.classList.contains("rlt-map-dot")) continue;
      if (e.closest(".rlt-price-chip, .rlt-map-dot, .gm-style-iw")) continue;
      if (e.children.length) continue; // leaves only
      const t = (e.textContent ?? "").trim();
      if (/^\d{1,4}$/.test(t) && e.getBoundingClientRect().width > 0) strays.push(t);
    }
    const rec = (window.__pins ?? []).filter((r) => r.done && r.rows).pop() ?? null;
    let coverage = null, zoom = null;
    if (rec) {
      zoom = Math.round(Math.log2((box.width * 360) / (256 * Math.abs(rec.east - rec.west))) * 100) / 100;
      const price = (n) => (n >= 1e6 ? `$${(Math.floor(n / 1e4) / 100).toFixed(2).replace(/\.?0+$/, "")}M` : `$${Math.floor(n / 1000)}K`);
      const inBox = rec.rows.filter((r) => r.lat <= rec.north && r.lat >= rec.south && r.lng <= rec.east && r.lng >= rec.west);
      let matched = 0;
      const gaps = [];
      for (const r of inBox) {
        if (drawnKeys.has(`${price(r.price)} — ${r.address}`)) { matched++; continue; }
        const qx = clip.l + ((r.lng - rec.west) / (rec.east - rec.west)) * (clip.r - clip.l);
        const qy = clip.t + ((rec.north - r.lat) / (rec.north - rec.south)) * (clip.b - clip.t);
        let best = Infinity;
        for (const pt of pts) { const d = Math.hypot(qx - pt.x, qy - pt.y); if (d < best) best = d; }
        gaps.push(best);
      }
      gaps.sort((a, b) => a - b);
      coverage = {
        inBox: inBox.length, apiTotal: rec.total, matched, undrawn: gaps.length,
        maxGapPx: gaps.length ? Math.round(gaps[gaps.length - 1]) : 0,
        orphans: gaps.filter((g) => g > 60).length,
      };
    }
    const banner = document.body.innerText.match(/([\d,]+) of ([\d,]+) homes shown/);
    return {
      mapMissing: false, componentRoot: !!root,
      pane: `${Math.round(box.width)}x${Math.round(box.height)}`,
      zoom, pills, dots, drawn: pills + dots, strays,
      objectObject: (style.innerText ?? "").includes("[object"),
      bannerDrawn: banner ? Number(banner[1].replace(/,/g, "")) : null,
      plannedInMargin: withinPlannerMargin,
      hovered: document.querySelectorAll(".gm-style-iw").length,
      coverage,
    };
  });

const inject = (p, mode) =>
  p.evaluate((mode) => {
    const style = document.querySelector(".gm-style");
    if (mode === "map") { style?.remove(); return; }
    if (mode === "circles") {
      const s = document.createElement("span");
      s.textContent = "37"; // what a count bubble puts on its face
      s.style.cssText = "position:absolute;left:200px;top:200px;width:34px;height:34px;border-radius:9999px;background:#000;color:#fff";
      style?.appendChild(s);
      return;
    }
    if (mode === "orphans") {
      // Delete every marker in the left third of the pane: the API rows there keep existing,
      // so they become homes with nothing drawn anywhere near them.
      const box = style.getBoundingClientRect();
      for (const e of document.querySelectorAll(".rlt-price-chip, .rlt-map-dot")) {
        const r = e.getBoundingClientRect();
        if (r.x + r.width / 2 < box.left + box.width / 3) e.remove();
      }
    }
  }, mode);

const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
// MLS Grid is rate-limit sensitive and an overnight photo job shares the budget.
await c.route("**/api/media/**", (r) => r.abort());
await c.route("**/api/lead", (r) => r.abort()); // posts to the LIVE CRM

const failures = [];
const rows = [];
for (const m of MARKETS) {
  if (ONLY && !ONLY.includes(m.slug)) continue;
  const p = await c.newPage();
  await p.addInitScript(instrument);
  await p.goto(base + m.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.mouse.move(5, 5); // nothing hovered while a plan is read
  if (!(await settle(p))) { failures.push(`${m.slug}: never settled on arrival`); await p.close(); continue; }
  // The map refits when a new place's RESULTS land, which can arrive after the first pin
  // settle — a wheel spent before that is silently undone. Wait for the frame to hold still.
  let z0 = null;
  for (let i = 0; i < 8; i++) {
    const z = (await measure(p)).zoom;
    if (z !== null && z === z0) break;
    z0 = z;
    await p.waitForTimeout(1500);
  }

  for (let rung = 0; rung < RUNGS; rung++) {
    if (BREAK && rung === 1) await inject(p, BREAK);
    const r = await measure(p);
    const at = `${m.slug} r${rung}`;
    rows.push({ market: m.slug, rung, ...r });

    if (r.mapMissing) {
      failures.push(`${at}: THE MAP IS GONE (component root ${r.componentRoot ? "present" : "removed"}) — zooming must never delete the map`);
      break;
    }
    if (r.strays.length) failures.push(`${at}: ${r.strays.length} COUNT CIRCLE(S) on the map: ${r.strays.slice(0, 5).join(",")}`);
    if (r.objectObject) failures.push(`${at}: the map contains "[object" — a marker label was given an object`);
    if (r.hovered) failures.push(`${at}: a popup was open while the plan was read — the count cannot be trusted`);
    if (r.coverage) {
      const cv = r.coverage;
      if (cv.orphans > 0)
        failures.push(`${at}: ${cv.orphans} home(s) in view drawn NOWHERE — nearest marker over ${ORPHAN_PX}px away (max gap ${cv.maxGapPx}px)`);
      if (cv.inBox > 0 && cv.inBox <= DRAW_ALL_AT_OR_BELOW && cv.matched < cv.inBox * DRAW_SHARE_AT_LOW_DENSITY)
        failures.push(
          `${at}: only ${cv.matched} of ${cv.inBox} homes drawn (${Math.round((100 * cv.matched) / cv.inBox)}%) — ` +
          `at ${DRAW_ALL_AT_OR_BELOW} or fewer in view there is room for at least ${Math.round(DRAW_SHARE_AT_LOW_DENSITY * 100)}%`,
        );
      if (r.bannerDrawn !== null && r.bannerDrawn !== r.plannedInMargin)
        failures.push(`${at}: the banner says ${r.bannerDrawn} drawn, the map drew ${r.plannedInMargin} (${r.drawn} inside the pane)`);
    }
    console.log(
      `${at.padEnd(20)} z${String(r.zoom).padEnd(6)} pills=${String(r.pills).padStart(4)} dots=${String(r.dots).padStart(4)} ` +
      `drawn=${String(r.drawn).padStart(4)} inView=${String(r.coverage?.inBox ?? "?").padStart(5)} ` +
      `ofTotal=${String(r.coverage?.apiTotal ?? "?").padStart(5)} maxGap=${String(r.coverage?.maxGapPx ?? "?").padStart(4)}px ` +
      `orphans=${r.coverage?.orphans ?? "?"} circles=${r.strays.length}`,
    );
    if (rung === RUNGS - 1) break;
    const live = await p.locator(".gm-style").first().boundingBox().catch(() => null);
    if (!live) { failures.push(`${at}: the map vanished between rungs`); break; }
    await p.mouse.move(live.x + live.width / 2, Math.min(live.y + live.height / 2, 880));
    await p.mouse.wheel(0, -240);
    await p.waitForTimeout(400);
    await p.mouse.wheel(0, -240);
    await p.mouse.move(5, 5);
    await settle(p);
  }
  await p.close();
}
await b.close();

if (process.argv.includes("--json")) console.log("\nJSON " + JSON.stringify(rows));
console.log("");
if (failures.length) {
  for (const f of failures) console.log("FAIL " + f);
  console.log(`\n${failures.length} failure(s) across ${rows.length} rungs.`);
  process.exit(1);
}
console.log(`PASS — ${rows.length} rungs, no count circles, the map survived every zoom, no orphaned inventory.`);
