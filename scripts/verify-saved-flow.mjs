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

// 2. Header saved link shows the count — rendered as text "Saved (1)", not a badge span.
// Poll rather than read once: the header re-renders on the rlt:saved-change event, which
// can lag the click by a frame or two (a fixed timer here is a flaky gate).
await page
  .waitForFunction(
    () => {
      const a = document.querySelector('a[href="/saved"]');
      return !!a && /\(1\)/.test(a.textContent || "");
    },
    { timeout: 5000 },
  )
  .then(() => console.log("OK header saved count = (1)"))
  .catch(async () => {
    const badge = await page.locator('a[href="/saved"]').first().textContent();
    fail(`header saved count expected "(1)", got "${badge?.trim()}"`);
  });

// 3. Save the search (with a county filter applied first). Read the note by its TEXT — the
// results-count strip ("N listings found") is ALSO role="status", so a positional
// p[role="status"] selector can grab the wrong live region before the note renders.
await page.getByRole("button", { name: /Dutchess County/i }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Save search/i }).click();
const note = page.getByText(/to this device/i).first();
try {
  await note.waitFor({ timeout: 8000 });
  console.log("OK save-search note:", (await note.textContent())?.trim().slice(0, 60));
} catch {
  fail("save-search note missing (no 'to this device' status appeared)");
}

// 4. /saved shows both
await page.goto(`${base}/saved`, { waitUntil: "load" });
await page.waitForTimeout(1500);
const savedHomes = await page.locator("article").count();
const savedSearches = await page.getByRole("link", { name: "Run search" }).count();
if (savedHomes < 1) fail("saved home card missing on /saved");
else console.log("OK /saved shows", savedHomes, "home(s)");
if (savedSearches < 1) fail("saved search row missing on /saved");
else console.log("OK /saved shows", savedSearches, "saved search(es)");

// 5. Alert opt-in form posts a lead — scope to the alerts section (the page has other
// LeadForms, e.g. the footer, so unscoped input[name] fills can target the wrong form)
// and wait for the /api/lead round-trip, not just a timer.
const alerts = page.locator('section[aria-labelledby="alerts-heading"]');
await alerts.scrollIntoViewIfNeeded();
await alerts.locator('input[name="name"]').fill("Flow Test");
await alerts.locator('input[name="email"]').fill("flow@test.dev");
await alerts.getByRole("button", { name: "Turn On Alerts" }).click();
// On success LeadForm swaps the form for its own div[role="status"] inside this section.
try {
  await alerts.locator('div[role="status"]').waitFor({ timeout: 8000 });
  console.log("OK alert opt-in submitted");
} catch {
  fail("alert opt-in: no success status appeared");
}

await browser.close();
console.log(process.exitCode ? "FLOW FAILED" : "FLOW PASSED");
