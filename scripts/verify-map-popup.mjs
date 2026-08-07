// Round 23: the popup contract, re-proven on the THINNED markers (pills + dots).
// Rules earned in round 22, kept:
//  · Google Maps ignores SYNTHETIC events — use p.mouse at real coordinates.
//  · Assert the popup is OPEN before asserting it closes.
//  · Poll after closing — the original bug was a popup that closed and then REOPENED itself.
// New this round: the same contract must hold when the marker is a DOT, and a marker click
// must never NAVIGATE (his "it just goes to page" report).
import { chromium } from "playwright";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.route("**/api/media/**", (r) => r.abort());
const p = await c.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).slice(0, 110)));

await p.goto(base + "/search", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(14000); // map + viewport pin fetch settle

const center = (sel) =>
  p.evaluate((s) => {
    const els = [...document.querySelectorAll(s)];
    const box = document.querySelector(".gm-style")?.getBoundingClientRect();
    if (!box) return null;
    // prefer one well inside the map (not clipped at an edge, not under the count strip).
    // Clamp to the VISIBLE viewport too — .gm-style's rect can extend below the fold, and
    // this probe once picked a dot at y=915 in a 900px viewport: a real mouse cannot touch
    // what is not painted, and the "failure" it reported was the instrument's own.
    const right = Math.min(box.right, window.innerWidth);
    const bottom = Math.min(box.bottom, window.innerHeight);
    for (const e of els) {
      const r = e.getBoundingClientRect();
      const x = r.x + r.width / 2, y = r.y + r.height / 2;
      if (x > box.x + 80 && x < right - 120 && y > box.y + 120 && y < bottom - 120 && r.width > 0)
        return { x, y };
    }
    return null;
  }, sel);

const popupOpen = () => p.evaluate(() => !!document.querySelector(".gm-style-iw"));
const url0 = p.url();

async function contract(kind, sel) {
  const pt = await center(sel);
  if (!pt) { console.log(kind + ": NO TARGET FOUND"); return; }
  // 1. hover previews
  await p.mouse.move(pt.x, pt.y);
  await p.waitForTimeout(700);
  console.log(kind + " hover preview:", (await popupOpen()) ? "OPEN" : "closed");
  // 2. click pins — and stays open
  await p.mouse.click(pt.x, pt.y);
  await p.waitForTimeout(500);
  const afterClick = await popupOpen();
  await p.waitForTimeout(2200);
  console.log(kind + " click pins:", afterClick ? "OPEN" : "closed", "| still open 2.7s later:", (await popupOpen()) ? "yes" : "NO");
  console.log(kind + " click navigated:", p.url() === url0 ? "no" : "YES -> " + p.url());
  // 3. Escape closes and STAYS closed
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  const closed = !(await popupOpen());
  await p.waitForTimeout(1500);
  console.log(kind + " Escape closes:", closed ? "yes" : "NO", "| stays closed:", !(await popupOpen()) ? "yes" : "NO");
  // 4. reopen by click, outside-click closes
  await p.mouse.move(pt.x + 3, pt.y + 3);
  await p.mouse.click(pt.x, pt.y);
  await p.waitForTimeout(500);
  const reopened = await popupOpen();
  const box = await p.locator(".gm-style").first().boundingBox();
  await p.mouse.click(box.x + box.width - 40, box.y + box.height - 40); // map corner = outside
  await p.waitForTimeout(400);
  const closedOut = !(await popupOpen());
  await p.waitForTimeout(1500);
  console.log(kind + " reopen:", reopened ? "OPEN" : "NO", "| outside closes:", closedOut ? "yes" : "NO", "| stays closed:", !(await popupOpen()) ? "yes" : "NO");
}

await contract("PILL", ".rlt-price-chip");
await contract("DOT", ".rlt-map-dot");

console.log("page errors:", errs.length ? errs : "none");
await b.close();
