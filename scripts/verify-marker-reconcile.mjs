// COMMITTED GATE — the map's marker layer must be RECONCILED, never rebuilt.
//
// Round 30 measured the defect and refused to ship motion on top of it: hovering one price
// chip destroyed and recreated every marker in the layer (0 DOM removals while idle, then 62
// removals and 62 additions from a single hover), because overlay.draw() opened with
// `container.innerHTML = ""` and Google calls draw() on every projection change — including
// the one that opening an InfoWindow causes. The node the browser was pressing did not exist
// by the time `:active` would paint, and keyboard focus was thrown to <body> on every redraw
// (round 28's open item, same root cause).
//
// THE INVARIANT THIS GATE TESTS IS NODE IDENTITY, NOT NODE COUNT. Counting is not enough: a
// full rebuild produces the same count. Every marker is stamped with a unique attribute, a
// gesture is performed, and every home that is on screen BOTH BEFORE AND AFTER must still be
// carrying its own stamp. A rebuild loses every stamp; reconciliation loses none.
//
// Proven able to fail: run against the pre-round-31 GoogleMapView (the innerHTML rebuild) and
// every survival check reports 0%.
//
//   node scripts/verify-marker-reconcile.mjs [url]
//
// Blocks **/api/media/** — MLS Grid is rate-limit sensitive and this probe needs no photos.
import { chromium } from "playwright";

const URL = process.argv[2] || process.env.PROBE_URL || "http://localhost:3100/search?county=dutchess";
const MARKER_CAP = 600; // pin-thinning.ts — the drawn-marker budget; an orphan leak breaches it

const results = [];
const check = (ok, line) => {
  results.push(ok);
  console.log(`  ${ok ? "OK  " : "FAIL"} ${line}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route("**/api/media/**", (r) => r.abort());
const page = await context.newPage();

console.log(`\nMARKER RECONCILIATION — ${URL}`);
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForSelector(".rlt-price-chip", { state: "attached", timeout: 90000 });
await page.waitForTimeout(7000); // the viewport pin fetch has to land before the set is stable

// The marker container, and a childList counter on it.
await page.evaluate(() => {
  const container = document.querySelector(".rlt-price-chip, .rlt-map-dot")?.parentElement;
  window.__c = container;
  window.__ops = { adds: 0, removes: 0 };
  new MutationObserver((rs) => {
    for (const r of rs) {
      window.__ops.adds += r.addedNodes.length;
      window.__ops.removes += r.removedNodes.length;
    }
  }).observe(container, { childList: true });
});

/** Stamp every marker on screen and remember which homes were there. */
const stamp = () =>
  page.evaluate(() => {
    window.__ops = { adds: 0, removes: 0 };
    let n = 0;
    const before = new Set();
    for (const el of window.__c.children) {
      el.dataset.probeStamp = String(n++);
      before.add(el.getAttribute("aria-label"));
    }
    window.__before = before;
    return n;
  });

/** Of the homes on screen BOTH before and after, how many kept their own DOM node? */
const survival = () =>
  page.evaluate(() => {
    let shared = 0;
    let kept = 0;
    for (const el of window.__c.children) {
      const label = el.getAttribute("aria-label");
      if (!window.__before.has(label)) continue;
      shared++;
      if (el.dataset.probeStamp !== undefined) kept++;
    }
    return { shared, kept, total: window.__c.children.length, ops: { ...window.__ops } };
  });

// WHY TWO THRESHOLDS. Where the viewport does not change, the pin set does not change, so the
// guarantee is absolute: 100%, no excuses. A zoom is different — it refetches, and thinning is
// a pixel calculation, so a home can genuinely fall out of the plan across two settled moments
// and be restored by a later fetch. That home has legitimately lost its node. 95% keeps real
// discriminating power: the pre-round-31 rebuild scores 0 here, and reverting only the
// retire-late grace scores 65.
const survived = async (label, { minShared = 5, minPct = 100 } = {}) => {
  const r = await survival();
  const pct = r.shared ? (100 * r.kept) / r.shared : 0;
  if (r.shared < minShared) {
    check(false, `${label}: only ${r.shared} home(s) on screen before AND after — too few to judge (the gesture moved too far, or the pin fetch never landed)`);
    return r;
  }
  check(pct >= minPct, `${label}: ${r.kept}/${r.shared} homes that stayed on screen kept their own DOM node (${pct.toFixed(0)}%, floor ${minPct}%) · layer now ${r.total} markers, ${r.ops.removes} removed / ${r.ops.adds} added`);
  return r;
};

// A chip provably inside BOTH the viewport and the map pane. An off-screen element still has a
// bounding box (round 28's trap, and round 30's again), so a mouse sent to one touches nothing.
const targetChip = () =>
  page.evaluate(() => {
    const map = document.querySelector(".gm-style")?.getBoundingClientRect();
    if (!map) return null;
    for (const el of document.querySelectorAll(".rlt-price-chip")) {
      const r = el.getBoundingClientRect();
      if (r.top > map.top + 80 && r.bottom < map.bottom - 80 && r.left > map.left + 80 && r.right < map.right - 80 && r.top > 0 && r.bottom < innerHeight)
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, label: el.getAttribute("aria-label") };
    }
    return null;
  });

// ── 1. IDLE is the control. If this churns, nothing below means anything.
await stamp();
await page.waitForTimeout(2000);
{
  const r = await survival();
  check(r.ops.removes === 0 && r.ops.adds === 0, `idle 2s: ${r.ops.removes} removals / ${r.ops.adds} additions (must be 0/0) · ${r.total} markers`);
}

// ── 2. HOVER — the gesture round 30 caught. Opening the InfoWindow makes Google repaint the
// overlay pane, which is what used to delete the layer out from under the pointer.
const t = await targetChip();
if (!t) {
  check(false, "no price chip sits fully inside the map pane — cannot test hover");
} else {
  await stamp();
  await page.mouse.move(t.x, t.y);
  await page.waitForTimeout(1200);
  await survived("hover one chip");
  const state = await page.evaluate(() => {
    const el = document.querySelector(".rlt-price-chip:hover");
    return { hovered: !!el, stamped: el?.dataset.probeStamp !== undefined, popup: !!document.querySelector(".gm-style-iw") };
  });
  check(state.hovered && state.stamped, `the hovered chip is the SAME node the pointer arrived on (hovered ${state.hovered}, stamp intact ${state.stamped})`);
  check(state.popup, "the hover preview opened (the redraw trigger is still exercised)");

  // ── 3. PRESS — :active can only paint on a node that outlives the press.
  await page.mouse.move(10, 10);
  await page.waitForTimeout(500);
  await page.mouse.move(t.x, t.y);
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.waitForTimeout(200);
  const active = await page.evaluate(() => !!document.querySelector(".rlt-price-chip:active"));
  await page.mouse.up();
  check(active, "a chip paints :active while pressed");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
}

// ── 4. KEYBOARD FOCUS must survive a redraw (round 28's open finding).
// Focus the chip NEAREST THE MAP CENTRE, not the first in DOM order. A zoom-in shrinks the
// viewport toward its centre, so an arbitrary chip may legitimately leave the plan and take
// its node with it — that is correct behaviour, and testing it would be testing nothing.
await page.evaluate(() => {
  const map = document.querySelector(".gm-style").getBoundingClientRect();
  const cx = map.left + map.width / 2;
  const cy = map.top + map.height / 2;
  let best = null;
  let bestD = Infinity;
  for (const el of document.querySelectorAll(".rlt-price-chip")) {
    const r = el.getBoundingClientRect();
    const d = Math.hypot(r.x + r.width / 2 - cx, r.y + r.height / 2 - cy);
    if (d < bestD) {
      bestD = d;
      best = el;
    }
  }
  best?.focus();
  window.__focusWanted = best?.getAttribute("aria-label");
});
await stamp();
await page.mouse.move(700, 500);
await page.mouse.wheel(0, -120);
await page.waitForTimeout(2500);
{
  const f = await page.evaluate(() => ({
    onMarker: !!document.activeElement?.classList?.contains("rlt-price-chip") || !!document.activeElement?.classList?.contains("rlt-map-dot"),
    same: document.activeElement?.getAttribute?.("aria-label") === window.__focusWanted,
  }));
  check(f.onMarker && f.same, `keyboard focus survives a zoom redraw (still on a marker: ${f.onMarker}, still the SAME home: ${f.same})`);
  await survived("zoom in one step", { minPct: 95 });
}

// ── 5. PAN.
await stamp();
await page.mouse.move(700, 500);
await page.mouse.down();
for (let i = 0; i < 20; i++) {
  await page.mouse.move(700 + i * 4, 500 + i * 2);
  await page.waitForTimeout(16);
}
await page.mouse.up();
await page.waitForTimeout(2500);
await survived("pan");

// ── 6. AN APP-DRIVEN REDRAW WITH NO VIEWPORT CHANGE. Hovering a result card selects its
// listing, and the map redraws to ink that chip azure. Nothing about the viewport moved, so
// EVERY marker must keep its node — and the azure chip is the proof a redraw really ran, which
// is what stops this check being one that cannot fail (the earlier pushState version passed on
// the old rebuild because nothing redrew at all).
{
  const card = page.locator("article.lift").first();
  await card.scrollIntoViewIfNeeded().catch(() => {});
  await stamp();
  await card.hover();
  await page.waitForTimeout(1200);
  const redrew = await page.evaluate(() => {
    for (const el of document.querySelectorAll(".rlt-price-chip")) {
      if (el.style.getPropertyValue("--chip-bg").toLowerCase() === "#1c729a") return true;
    }
    return false;
  });
  check(redrew, "hovering a result card inks its chip azure (proof the redraw under test actually ran)");
  await survived("app-driven redraw, viewport unchanged", { minShared: 3 });
  await page.mouse.move(10, 10);
  await page.waitForTimeout(400);
}

// ── 7. No orphan accumulation: a keyed layer that never retires anything grows without bound.
{
  const n = await page.evaluate(() => window.__c.children.length);
  check(n > 0 && n <= MARKER_CAP, `layer holds ${n} markers (must be 1..${MARKER_CAP} — 0 means the layer died, over cap means retired nodes are leaking)`);
}

await browser.close();

const failed = results.filter((r) => r === false).length;
console.log(`\n${failed ? `FAIL — ${failed} of ${results.length} checks` : `PASS — ${results.length}/${results.length} checks`}`);
process.exit(failed ? 1 : 0);
