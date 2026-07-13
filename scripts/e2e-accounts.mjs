// End-to-end client-accounts test against a LOCAL `next start` on the real Supabase.
// Usage: node scripts/e2e-accounts.mjs [signup|login]
//   env: BASE (default http://127.0.0.1:3799), TEST_EMAIL, TEST_PASSWORD
// Prints a RESULT: line the caller parses. Screenshots → docs/accounts/.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:3799";
const MODE = process.argv[2] || "signup";
const EMAIL = process.env.TEST_EMAIL || `portal.e2e.${Date.now()}@realtylt-test.com`;
const PASSWORD = process.env.TEST_PASSWORD || "PortalTest#2026";
const OUT = "docs/accounts";
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(...a);
let failures = 0;
const check = (cond, msg) => {
  log(`${cond ? "  ok" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// Safety net: never let a real lead leave the machine during this test.
await ctx.route("**/api/lead", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"stub":true}' }));
await ctx.route("**/functions/v1/website-lead", (r) => r.fulfill({ status: 200, body: "{}" }));
const page = await ctx.newPage();
const consoleErrors = [];
const cspViolations = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("response", (r) => {
  if (r.url().includes("csp") || r.status() === 0) {/* noop */}
});
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

async function openAuth(mode) {
  await page.getByRole("button", { name: "Sign In", exact: true }).first().click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 5000 });
  if (mode === "signup") {
    await page.getByRole("dialog").getByRole("button", { name: "Sign up", exact: true }).click();
    await page.getByRole("dialog").getByText("Sign up for free").waitFor({ timeout: 3000 });
  }
}

async function isLoggedIn() {
  try {
    await page.locator('header button[aria-haspopup="menu"]').waitFor({ timeout: 9000 });
    return true;
  } catch {
    return false;
  }
}

try {
  log(`\n=== accounts E2E — mode=${MODE} email=${EMAIL} base=${BASE} ===`);
  await page.goto(BASE, { waitUntil: "load" });

  // Grab a real listing id from the search API.
  const listingId = await page.evaluate(async () => {
    try {
      const r = await fetch("/api/idx/search?county=dutchess&limit=3");
      const j = await r.json();
      return j.listings?.[0]?.id ?? null;
    } catch {
      return null;
    }
  });
  check(!!listingId, `got a real listing id (${listingId})`);

  check(
    await page.getByRole("button", { name: "Sign In", exact: true }).first().isVisible(),
    'header shows "Sign In" when logged out',
  );

  // ── Auth ──
  await openAuth(MODE);
  await page.getByRole("dialog").locator('input[name="email"]').fill(EMAIL);
  await page.getByRole("dialog").locator('input[name="password"]').fill(PASSWORD);
  if (MODE === "signup") {
    await page.getByRole("dialog").locator('input[name="name"]').fill("Portal E2E Tester");
    await page.getByRole("dialog").getByRole("button", { name: "Create account" }).click();
  } else {
    await page.getByRole("dialog").getByRole("button", { name: "Sign in", exact: true }).click();
  }

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    const dialog = page.getByRole("dialog");
    const needsConfirm = await dialog.getByText(/confirm your account/i).isVisible().catch(() => false);
    await page.screenshot({ path: `${OUT}/auth-result.png` });
    if (needsConfirm) {
      log(`RESULT: NEEDS_CONFIRM email=${EMAIL}`);
    } else {
      const err = await dialog.locator('[role="alert"]').textContent().catch(() => "");
      log(`RESULT: NOT_LOGGED_IN email=${EMAIL} err=${(err || "").trim()}`);
    }
    await browser.close();
    process.exit(0);
  }
  check(true, "logged in (account menu present)");
  await page.screenshot({ path: `${OUT}/logged-in-home.png` });

  // ── View a listing (fires view_listing activity) ──
  const lid = listingId || "KEY1023749";
  await page.goto(`${BASE}/listing/${lid}`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const heart = page.getByRole("button", { name: "Save this home" });
  const alreadyRemoved = await page.getByRole("button", { name: "Remove from saved homes" }).isVisible().catch(() => false);
  if (!alreadyRemoved) {
    await heart.click();
  }
  await page.waitForTimeout(600);
  check(
    await page.getByRole("button", { name: "Remove from saved homes" }).isVisible(),
    "saved the listing (heart is now filled)",
  );

  // ── Save a search ──
  await page.goto(`${BASE}/search?county=dutchess`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /Save Search/i }).click();
  await page.waitForTimeout(800);
  check(
    await page.getByText(/to your account/i).isVisible().catch(() => false),
    'save-search note says "to your account"',
  );

  // ── Portal overview ──
  await page.goto(`${BASE}/portal`, { waitUntil: "load" });
  await page.waitForTimeout(1200);
  check(await page.getByText("Saved homes").first().isVisible(), "portal overview renders stat tiles");
  check(
    await page.getByText(/Saved a home|Viewed a home|Saved a search/i).first().isVisible().catch(() => false),
    "portal shows recent activity",
  );
  await page.screenshot({ path: `${OUT}/portal-overview-1280.png`, fullPage: true });

  // ── Collections ──
  await page.goto(`${BASE}/portal/collections`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const cards = await page.locator('a[href^="/listing/"]').count();
  check(cards > 0, `collections shows saved listing card(s) (${cards})`);
  await page.screenshot({ path: `${OUT}/portal-collections-1280.png`, fullPage: true });

  // ── Searches ──
  await page.goto(`${BASE}/portal/searches`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  check(await page.getByRole("link", { name: "Run search" }).first().isVisible(), "saved search listed with Run search");

  // ── Profile update ──
  await page.goto(`${BASE}/portal/profile`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.locator('input[name="fullName"]').fill("Portal E2E (edited)");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.waitForTimeout(800);
  check(await page.getByText("Saved.", { exact: true }).isVisible().catch(() => false), "profile save works");

  // ── Mobile 390 portal shot ──
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/portal`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/portal-overview-390.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Sign out ──
  await page.goto(`${BASE}/portal/profile`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForTimeout(1500);
  check(
    await page.getByRole("button", { name: "Sign In", exact: true }).first().isVisible().catch(() => false),
    'signed out — header shows "Sign In" again',
  );

  check(consoleErrors.length === 0, `zero console/page errors (saw ${consoleErrors.length})`);
  if (consoleErrors.length) consoleErrors.slice(0, 6).forEach((e) => log("   console:", e));

  log(`\nRESULT: ${failures === 0 ? "PASS" : "FAIL"} (${failures} failures) email=${EMAIL}`);
} catch (e) {
  log("RESULT: ERROR " + (e?.message || e));
  await page.screenshot({ path: `${OUT}/error.png` }).catch(() => {});
  failures++;
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
