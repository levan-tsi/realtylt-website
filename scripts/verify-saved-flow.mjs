// Drive the favorites + save-search flow end-to-end: heart a listing on /search,
// save a search, then confirm both appear on /saved and the header badge updates.
//
// WHY THIS GATE WAS REWRITTEN (2026-08-18). It reported "OK save-search note" on every run and
// then failed at the alerts section, and both facts had the same cause: pressing "Save search"
// on /search OPENS A DIALOG whose own submit button carries the same label. The gate read the
// dialog's pre-submit hint ("Saving to this device…"), called that success, and navigated away
// without ever submitting — so nothing was saved, `searches.length` stayed 0, and /saved
// correctly declined to render the alert opt-in (it is gated on having something to alert on).
// An instrument that passes before the action it is testing has happened cannot fail for the
// right reason. It now presses the dialog's submit and waits for the SUCCESS panel.
//
// It also used to submit a REAL lead: /api/lead posts to the production CRM. Intercepted now.
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3777";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const fail = (msg) => {
  console.error("FAIL:", msg);
  process.exitCode = 1;
};

// /api/lead reaches the live CRM. A gate must never post to it.
let leadPayload = null;
await page.route("**/api/lead", (route) => {
  leadPayload = route.request().postDataJSON();
  route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
});

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

// 3. Save the search (with a county filter applied first). TWO presses: the toolbar button
// opens the name-it dialog, the dialog's own "Save search" commits it. Scope the second press
// to the dialog — both buttons carry the same accessible name, which is exactly what fooled
// the previous version of this gate.
await page.getByRole("button", { name: /Dutchess County/i }).click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: /Save search/i }).first().click();
const dialog = page.locator('[role="dialog"][aria-modal="true"]').filter({ hasText: "Save this search" });
try {
  await dialog.waitFor({ timeout: 8000 });
  console.log("OK save-search dialog opened");
} catch {
  fail("save-search dialog did not open");
}
await dialog.getByRole("button", { name: /^Save search$/i }).click();
// The success panel REPLACES the form; that swap is the only proof the search was written.
try {
  await page.getByRole("heading", { name: /Search saved/i }).waitFor({ timeout: 8000 });
  console.log("OK save-search committed (success panel shown)");
} catch {
  fail("save-search: success panel never appeared — the search was not saved");
}

// 4. /saved shows both. Wait for the rendered rows rather than a fixed pause: the favourites
// grid resolves each id through /api/idx/listing, which lands ~3s after load on a cold dev
// server and beat the old 1500ms timer often enough to flake.
await page.goto(`${base}/saved`, { waitUntil: "load" });
try {
  await page.locator("article").first().waitFor({ timeout: 20000 });
  console.log("OK /saved shows", await page.locator("article").count(), "home(s)");
} catch {
  fail("saved home card missing on /saved");
}
const savedSearches = await page.getByRole("link", { name: "Run search" }).count();
if (savedSearches < 1) fail("saved search row missing on /saved");
else console.log("OK /saved shows", savedSearches, "saved search(es)");

// 5. Alert opt-in posts a lead. This section is NOT behind the account wall — it is a lead
// form, it works signed out, and it is the only alert path that currently reaches a human. It
// is gated on having at least one saved search, so it can only be asserted after step 3 really
// committed. Scope to the section (the page has other LeadForms, e.g. the footer) and wait for
// the /api/lead round-trip, not a timer.
const alerts = page.locator('section[aria-labelledby="alerts-heading"]');
try {
  await alerts.waitFor({ timeout: 10000 });
} catch {
  fail("alerts section missing on /saved (expected once a search is saved)");
}
if (await alerts.count()) {
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
  // The ask is only honest if the searches travel with it — a request to "watch my searches"
  // that carries no searches is a request the CRM cannot act on.
  const carried = Array.isArray(leadPayload?.savedSearches) ? leadPayload.savedSearches.length : 0;
  if (carried < 1) fail(`alert lead carried ${carried} saved searches (expected >= 1)`);
  else console.log("OK alert lead carried", carried, "saved search(es)");
}

await browser.close();
console.log(process.exitCode ? "FLOW FAILED" : "FLOW PASSED");
