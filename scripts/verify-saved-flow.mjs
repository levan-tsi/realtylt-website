// Drive the favorites + save-search flow end-to-end: heart a listing on /search,
// save a search, then confirm both appear on /saved and the header badge updates.
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3777";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const fail = (msg) => {
  console.error("FAIL:", msg);
  process.exitCode = 1;
};

await page.goto(`${base}/search`, { waitUntil: "load" });
await page.waitForSelector("article", { timeout: 15000 });

// 1. Heart the first listing
await page.locator('button[aria-label="Save this home"]').first().click();
const pressed = await page.locator('button[aria-pressed="true"]').count();
if (pressed < 1) fail("heart did not toggle");
else console.log("OK heart toggled");

// 2. Header badge shows 1
await page.waitForTimeout(300);
const badge = await page.locator('a[href="/saved"] span').last().textContent();
if (badge?.trim() !== "1") fail(`header badge expected 1, got "${badge}"`);
else console.log("OK header badge = 1");

// 3. Save the search (with a county filter applied first)
await page.getByRole("button", { name: /Dutchess County/i }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Save search/i }).click();
const note = await page.locator('p[role="status"]').first().textContent();
if (!note?.includes("Saved")) fail(`save-search note missing, got "${note}"`);
else console.log("OK save-search note:", note.trim().slice(0, 60));

// 4. /saved shows both
await page.goto(`${base}/saved`, { waitUntil: "load" });
await page.waitForTimeout(1500);
const savedHomes = await page.locator("article").count();
const savedSearches = await page.getByRole("link", { name: "Run search" }).count();
if (savedHomes < 1) fail("saved home card missing on /saved");
else console.log("OK /saved shows", savedHomes, "home(s)");
if (savedSearches < 1) fail("saved search row missing on /saved");
else console.log("OK /saved shows", savedSearches, "saved search(es)");

// 5. Alert opt-in form posts a lead
await page.fill('input[name="name"]', "Flow Test");
await page.fill('input[name="email"]', "flow@test.dev");
await page.getByRole("button", { name: "Turn On Alerts" }).click();
await page.waitForSelector('div[role="status"]', { timeout: 8000 });
console.log("OK alert opt-in submitted");

await browser.close();
console.log(process.exitCode ? "FLOW FAILED" : "FLOW PASSED");
