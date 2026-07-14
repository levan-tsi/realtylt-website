// E2E for the client-facing CMA + market reports portal (owner spec §5b).
// LOGIN mode against a LOCAL `next start` on the real Supabase. Safe: /api/lead + media stubbed.
//   env: BASE (default http://127.0.0.1:3799), TEST_EMAIL, TEST_PASSWORD
//
// Signups are disabled on the project, so the test user must be SQL-created first (Supabase MCP),
// and DELETED after (zero residue). Recreate recipe:
//   do $$ declare uid uuid := gen_random_uuid(); begin
//     insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
//       created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,
//       email_change,email_change_token_new)
//     values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',
//       'portal.reports.e2e@realtylt-test.com',crypt('PortalTest#2026',gen_salt('bf')),now(),now(),now(),
//       '{"provider":"email","providers":["email"]}',
//       '{"full_name":"Reports E2E Tester","account_type":"portal"}','','','','');
//     insert into auth.identities (id,user_id,identity_data,provider,provider_id,created_at,updated_at,last_sign_in_at)
//     values (gen_random_uuid(),uid,jsonb_build_object('sub',uid::text,'email','portal.reports.e2e@realtylt-test.com'),
//       'email',uid::text,now(),now(),now()); end $$;
// Cleanup (contact is SET NULL, not cascaded — delete by email too):
//   delete from public.contacts where lower(email)='portal.reports.e2e@realtylt-test.com';
//   delete from auth.users where email='portal.reports.e2e@realtylt-test.com';
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE || "http://127.0.0.1:3799";
const EMAIL = process.env.TEST_EMAIL || "portal.reports.e2e@realtylt-test.com";
const PASSWORD = process.env.TEST_PASSWORD || "PortalTest#2026";
const OUT = "docs/accounts";
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(...a);
let failures = 0;
let leadHits = 0;
const check = (cond, msg) => {
  log(`${cond ? "  ok" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
};
const num = (s) => Number(String(s || "").replace(/[^0-9]/g, "")) || 0;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// Lead safety: never let a real lead leave the machine.
await ctx.route("**/api/lead", (r) => {
  leadHits++;
  r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true,"stub":true}' });
});
await ctx.route("**/functions/v1/website-lead", (r) => r.fulfill({ status: 200, body: "{}" }));
// Budget guard: stub MLS photos.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
await ctx.route("**/api/media/**", (r) => r.fulfill({ status: 200, contentType: "image/png", body: PNG }));

const page = await ctx.newPage();
page.on("dialog", (d) => d.accept()); // auto-accept the delete confirm()
const consoleErrors = [];
const cspViolations = [];
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const t = m.text();
  if (/content security policy/i.test(t)) cspViolations.push(t);
  else consoleErrors.push(t);
});
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

async function login() {
  await page.goto(BASE, { waitUntil: "load" });
  await page.getByRole("button", { name: "Sign In", exact: true }).first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Sign In", exact: true }).first().click();
  const d = page.getByRole("dialog");
  await d.waitFor({ state: "visible", timeout: 5000 });
  await d.locator('input[name="email"]').fill(EMAIL);
  await d.locator('input[name="password"]').fill(PASSWORD);
  await d.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.locator('header button[aria-haspopup="menu"]').waitFor({ timeout: 12000 });
}

try {
  log(`\n=== reports E2E — ${EMAIL} @ ${BASE} ===`);
  await login();
  check(true, "logged in");

  // noindex header on the portal
  const resp = await page.goto(`${BASE}/portal/reports`, { waitUntil: "load" });
  check(/noindex/i.test(resp.headers()["x-robots-tag"] || ""), "portal/reports sends x-robots-tag noindex");
  await page.getByText("Run a new report").waitFor({ timeout: 10000 });
  check(true, "generator visible");

  // ── Generate a CMA ──
  await page.getByLabel("Street address").fill("12 Maple Street");
  await page.getByLabel("Town / city").fill("Beacon");
  await page.getByLabel("County").selectOption("dutchess");
  await page.getByLabel("Approx. sq ft").fill("2000");
  await page.getByLabel("Beds").fill("3");
  await page.getByRole("button", { name: /Generate my estimate/i }).click();
  await page.waitForURL(/\/portal\/reports\/[0-9a-f-]{36}/, { timeout: 15000 });
  const mid0 = num(await page.getByTestId("cma-mid").textContent());
  check(mid0 > 0, `CMA estimate rendered ($${mid0.toLocaleString()})`);
  const comps0 = await page.getByRole("checkbox").count();
  check(comps0 > 1, `comps table has ${comps0} comparables`);

  // ── Recalculate: condition +12% → estimate should rise ──
  await page.locator("#cond").evaluate((el) => {
    // React tracks the input's value internally — set via the prototype setter so its
    // change tracker fires onChange, then dispatch a bubbling input event.
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    set.call(el, "12");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector('[data-testid="cma-mid"]');
      return el && Number(el.textContent.replace(/[^0-9]/g, "")) > prev;
    },
    mid0,
    { timeout: 5000 },
  ).catch(() => {});
  const mid1 = num(await page.getByTestId("cma-mid").textContent());
  check(mid1 > mid0, `condition +12% raised the estimate ($${mid0.toLocaleString()} → $${mid1.toLocaleString()})`);

  // ── Recalculate: drop a comp → "Based on N" count decreases ──
  const basedText = () => page.getByText(/Based on \d+ comparable/i).first().textContent();
  const n0 = num((await basedText())?.match(/Based on (\d+)/)?.[1]);
  const boxes = page.getByRole("checkbox");
  // uncheck the first CHECKED box
  const count = await boxes.count();
  for (let i = 0; i < count; i++) {
    if (await boxes.nth(i).isChecked()) {
      await boxes.nth(i).uncheck();
      break;
    }
  }
  await page.waitForTimeout(300);
  const n1 = num((await basedText())?.match(/Based on (\d+)/)?.[1]);
  check(n1 === n0 - 1, `dropping a comp lowered the comp count (${n0} → ${n1})`);

  // ── Save adjustments ──
  await page.getByRole("button", { name: /Save adjustments/i }).click();
  const saved = await page
    .getByText(/Saved to your report/i)
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  check(saved, "recalculated adjustments saved");
  await page.screenshot({ path: `${OUT}/reports-cma-1280.png`, fullPage: true });

  // ── Raise hand from the CMA ──
  await page.getByRole("button", { name: /Raise my hand/i }).click();
  const raised = await page
    .getByText(/your agent has been notified/i)
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  check(raised, "raise-hand confirmed (lead stubbed)");
  check(leadHits > 0, `lead POST fired through /api/lead (${leadHits} stubbed)`);

  // ── Mobile 390 CMA shot ──
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/reports-cma-390.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Generate a MARKET report ──
  await page.goto(`${BASE}/portal/reports`, { waitUntil: "load" });
  await page.getByRole("tab", { name: /Market report/i }).click();
  await page.getByRole("button", { name: /Run market report/i }).click();
  await page.waitForURL(/\/portal\/reports\/[0-9a-f-]{36}/, { timeout: 15000 });
  await page.getByText(/Median list price/i).waitFor({ timeout: 10000 });
  const median = num(await page.getByText(/Median list price/i).locator("xpath=../p[1]").textContent().catch(() => "0"));
  check(median > 0, `market median list price rendered ($${median.toLocaleString()})`);
  check(await page.getByText(/Where prices land/i).isVisible(), "market report shows price bands");
  check(await page.getByText(/Active market/i).isVisible(), "market report shows active count");
  await page.screenshot({ path: `${OUT}/reports-market-1280.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/reports-market-390.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Overview reflects reports ──
  await page.goto(`${BASE}/portal`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  check(
    await page.getByRole("link", { name: /^\d+ Reports$/ }).isVisible().catch(() => false),
    "overview shows a Reports stat tile",
  );
  check(
    await page.getByText(/Ran a report|Opened a report|Reached out/i).first().isVisible().catch(() => false),
    "overview activity shows report events",
  );
  await page.screenshot({ path: `${OUT}/reports-overview-1280.png`, fullPage: true });

  // ── Delete a report ──
  await page.goto(`${BASE}/portal/reports`, { waitUntil: "load" });
  await page.waitForTimeout(900);
  const before = await page.locator('a[href^="/portal/reports/"]').count();
  await page.locator('a[href^="/portal/reports/"]').first().click();
  await page.waitForURL(/\/portal\/reports\/[0-9a-f-]{36}/, { timeout: 10000 });
  await page.getByRole("button", { name: /Delete report/i }).click();
  await page.waitForURL(/\/portal\/reports$/, { timeout: 10000 });
  await page.waitForTimeout(900);
  const after = await page.locator('a[href^="/portal/reports/"]').count();
  check(before > 0 && after === before - 1, `deleted a report (cards ${before} → ${after})`);

  check(consoleErrors.length === 0, `zero console errors (saw ${consoleErrors.length})`);
  check(cspViolations.length === 0, `zero CSP violations (saw ${cspViolations.length})`);
  consoleErrors.slice(0, 6).forEach((e) => log("   console:", e));
  cspViolations.slice(0, 4).forEach((e) => log("   csp:", e));

  log(`\nRESULT: ${failures === 0 ? "PASS" : "FAIL"} (${failures} failures)`);
} catch (e) {
  log("RESULT: ERROR " + (e?.message || e));
  await page.screenshot({ path: `${OUT}/reports-error.png` }).catch(() => {});
  failures++;
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
