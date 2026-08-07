// Round 24 §2: a map pin's home must arrive with a working Previous/Next LISTING walk, even
// when that home was never in the grid's saved page (the characterized defect: grid saves its
// 150, the map draws from the 3,000-pin viewport fetch, so most pins landed pager-less).
//
// The probe deliberately hunts a marker whose home is NOT in the pre-click saved set, follows
// its popup's View Listing, and asserts (1) the pager group exists, (2) it is the HOMES pager
// ("Next listing:" labels — the photo arrows say "Next photo" and false-positived a round-23
// probe), (3) its count is the PIN set's count, and (4) "Next listing" navigates to exactly
// the next stored item's path. Membership, not presence.
import { chromium } from "playwright";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.route("**/api/media/**", (r) => r.abort());
const p = await c.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).slice(0, 110)));

await p.goto(base + "/search", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(14000); // map + viewport pin fetch + grid save settle

const readSet = () =>
  p.evaluate(() => {
    try {
      return JSON.parse(sessionStorage.getItem("rlt:result-set:v1"));
    } catch {
      return null;
    }
  });

const pre = await readSet();
const preIds = new Set((pre?.items ?? []).map((i) => i.id));
console.log("grid's saved set before any pin click:", preIds.size, "items");

// Every visible marker centre, pills then dots, clamped to the visible viewport.
const targets = await p.evaluate(() => {
  const box = document.querySelector(".gm-style")?.getBoundingClientRect();
  if (!box) return [];
  const right = Math.min(box.right, window.innerWidth);
  const bottom = Math.min(box.bottom, window.innerHeight);
  const out = [];
  for (const e of document.querySelectorAll(".rlt-price-chip, .rlt-map-dot")) {
    const r = e.getBoundingClientRect();
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    if (x > box.x + 80 && x < right - 120 && y > box.y + 120 && y < bottom - 120 && r.width > 0)
      out.push({ x, y });
  }
  return out;
});
console.log("clickable markers in view:", targets.length);

// Click markers until one's popup home is OUTSIDE the grid's saved set.
let href = null;
for (const t of targets.slice(0, 25)) {
  await p.mouse.click(t.x, t.y);
  await p.waitForTimeout(600);
  const h = await p.evaluate(() => document.querySelector(".gm-style-iw a[href*='bid-38-']")?.getAttribute("href") ?? null);
  if (!h) continue;
  const id = /bid-38-(.+)$/.exec(h)?.[1];
  if (id && !preIds.has(id)) { href = h; break; }
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
}
if (!href) {
  console.log("FAIL: no beyond-grid pin found among", Math.min(targets.length, 25), "markers");
  process.exit(1);
}
console.log("beyond-grid pin found:", href);

// Follow View Listing — the click writes the viewport pin set, then navigates.
await Promise.all([
  p.waitForURL("**" + href.split("/").pop() + "**", { timeout: 30000 }),
  p.click(".gm-style-iw a[href*='bid-38-']"),
]);
await p.waitForLoadState("domcontentloaded");
await p.waitForTimeout(1200);

const saved = await readSet();
console.log("set after View Listing:", saved?.items?.length ?? 0, "items (grid page was " + preIds.size + ")");

const pager = await p.evaluate(() => {
  const group = document.querySelector('[role="group"][aria-label="Browse listings"]');
  if (!group) return null;
  const next = group.querySelector('a[aria-label^="Next listing:"]');
  const prev = group.querySelector('a[aria-label^="Previous listing:"]');
  return {
    count: group.textContent?.match(/of ([\d,]+)/)?.[1] ?? null,
    nextHref: next?.getAttribute("href") ?? null,
    prevHref: prev?.getAttribute("href") ?? null,
  };
});
if (!pager) {
  console.log("FAIL: no Browse-listings pager on a pin-opened listing page");
  process.exit(1);
}
console.log("pager present. count:", pager.count, "| next:", !!pager.nextHref, "prev:", !!pager.prevHref);

// The pager's universe must be the PIN set, and Next must go to the set's own next item.
const id = /bid-38-(.+)$/.exec(href)[1];
const idx = saved.items.findIndex((i) => i.id === id);
const expectNext = idx >= 0 && idx < saved.items.length - 1 ? saved.items[idx + 1].path : null;
const countOk = Number(String(pager.count).replace(/,/g, "")) === saved.items.length;
const nextOk = pager.nextHref === expectNext;
console.log("count equals pin-set size:", countOk ? "yes" : `NO (${pager.count} vs ${saved.items.length})`);
console.log("Next goes to the set's next item:", nextOk ? "yes" : `NO (${pager.nextHref} vs ${expectNext})`);

if (expectNext) {
  await Promise.all([p.waitForURL("**" + expectNext.split("/").pop() + "**", { timeout: 30000 }), p.click('a[aria-label^="Next listing:"]')]);
  await p.waitForLoadState("domcontentloaded");
  console.log("walked Next: landed on", p.url().split("/").pop());
}

console.log("page errors:", errs.length ? errs : "none");
const pass = countOk && nextOk && (saved?.items?.length ?? 0) > preIds.size;
console.log(pass ? "PASS" : "FAIL");
process.exit(pass ? 0 : 1);
