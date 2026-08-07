// Round 23 §1b: the list and the map must answer the SAME question.
// Verifies on a real browser: scoped count line, list ⊆ viewport (via a direct API call for
// the same box), pan changes both, NO fetch loop after settle, page-2 does not move the map,
// and the saved result-set is the viewport set.
import { chromium } from "playwright";

const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
await c.route("**/api/media/**", (r) => r.abort());
const p = await c.newPage();

const searchCalls = [];
p.on("request", (r) => {
  if (r.url().includes("/api/idx/search")) searchCalls.push(r.url());
});

await p.goto(base + "/search", { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(16000); // map + pins + scoped grid settle (dev DB can be slow)

const countLine = () => p.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim() ?? "(none)");
const cardCount = () => p.evaluate(() => document.querySelectorAll('ul[aria-label="Search results"] > li').length);

console.log("count line:", await countLine());
console.log("cards:", await cardCount());

// The box the LAST scoped fetch used — replay it against the API and compare totals.
const lastScoped = searchCalls.filter((u) => u.includes("north=")).at(-1);
console.log("scoped fetches so far:", searchCalls.filter((u) => u.includes("north=")).length, "unscoped:", searchCalls.filter((u) => !u.includes("north=")).length);
if (lastScoped) {
  const apiTotal = await p.evaluate(async (u) => (await (await fetch(u)).json()).total, lastScoped);
  const uiTotal = (await countLine()).match(/^([\d,]+)/)?.[1]?.replace(/,/g, "");
  console.log("API total for the same box:", apiTotal, "| count line says:", uiTotal, "| agree:", String(apiTotal) === uiTotal ? "YES" : "NO");
}

// LOOP CHECK: no further /api/idx/search calls while idle.
const before = searchCalls.length;
await p.waitForTimeout(6000);
console.log("fetch loop check: +", searchCalls.length - before, "searches in 6 idle seconds (must be 0)");

// PAN: drag the map west; count line and cards must change; exactly ~1 new scoped fetch.
const box = await p.locator(".gm-style").first().boundingBox();
const preCount = await countLine();
const prePan = searchCalls.length;
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await p.mouse.down();
await p.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2 + 60, { steps: 12 });
await p.mouse.up();
await p.waitForTimeout(9000);
console.log("after pan:", await countLine(), "| cards:", await cardCount());
console.log("pan fetches:", searchCalls.slice(prePan).filter((u) => u.includes("north=")).length, "scoped (expect 1)");
console.log("count changed on pan:", (await countLine()) !== preCount ? "yes" : "NO");

// PAGE 2 (only if the pager exists at this scope): map must NOT move.
const mapCenterPx = async () => {
  const r = await p.locator(".gm-style").first().boundingBox();
  return `${r.x},${r.y},${r.width},${r.height}`;
};
const hasPager = await p.evaluate(() => !!document.querySelector('nav[aria-label="Results pages"]'));
console.log("pager exists at this scope:", hasPager);
if (hasPager) {
  const preURLs = searchCalls.length;
  await p.evaluate(() => document.querySelector('nav[aria-label="Results pages"] button[aria-label="Page 2"]')?.click());
  await p.waitForTimeout(6000);
  const pageFetches = searchCalls.slice(preURLs);
  console.log("page-2 fetch carries the SAME box:", pageFetches.at(-1)?.includes("north=") ? "yes" : "NO", "page=2:", pageFetches.at(-1)?.includes("page=2") ? "yes" : "NO");
}

// RESULT SET: what prev/next will walk — must equal the viewport list, not a 50-page.
const rs = await p.evaluate(() => {
  try {
    const raw = sessionStorage.getItem("rlt:result-set:v1") ?? localStorage.getItem("rlt:result-set:v1");
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { items: d.items?.length, page: d.page, totalPages: d.totalPages };
  } catch { return null; }
});
console.log("saved result set:", JSON.stringify(rs), "| cards on screen:", await cardCount());

await p.screenshot({ path: "scripts/_scratch-r23/viewport.png" });
await b.close();
