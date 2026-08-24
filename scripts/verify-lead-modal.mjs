/**
 * GATE — the /connect lead modal, driven in a real browser at 1440, 390 and 320.
 *
 * WHY THIS IS A COMMITTED GATE AND NOT A SCRATCH PROBE. The modal is one of only two ways a
 * visitor can hand us their details, and the thing it must never get wrong is the consent
 * contract: the owner decided that box twice, and the bug he actually reported ("when I filled it
 * up nothing happened") was a refusal that was SILENT. jsdom cannot prove a refusal is visible, a
 * focus trap holds, or that nothing was POSTed. This can, so it does.
 *
 * The checks, per width:
 *   - the trigger renders and opens a dialog
 *   - no horizontal overflow while the modal is open
 *   - the consent input carries NO native `required` attribute (the tests assert its ABSENCE
 *     elsewhere; this asserts it on the rendered page)
 *   - submitting WITHOUT ticking shows a visible role=alert error AND posts NOTHING
 *   - ticking it posts EXACTLY ONE lead and shows the success panel in place, still on /connect
 *   - Escape closes and focus returns to the trigger
 *   - focus stays inside the dialog over 22 tabs
 *   - a backdrop click closes
 *
 * SAFETY. THE /api/lead ROUTE POSTS TO THE LIVE CRM. It is intercepted and fulfilled locally, so
 * no run of this gate can ever create a real lead. MLS media is blocked as in every probe here.
 *
 * Screenshots land in docs/design-r38/connect-modal/. Exit 0 = pass, 1 = at least one check failed.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("docs", "design-r38", "connect-modal");
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await chromium.launch();
for (const W of [1440, 390, 320]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: W < 500 ? 844 : 900 } });
  await ctx.route("**/api/media/**", (r) => r.abort());
  let leadPosts = 0;
  await ctx.route("**/api/lead", (r) => {
    leadPosts++;
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/connect", { waitUntil: "networkidle", timeout: 90000 });

  const trigger = page.getByRole("button", { name: "Message us instead" });
  await trigger.waitFor({ state: "visible", timeout: 30000 });
  ok(`${W}: trigger button renders`, true);

  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 10000 });
  ok(`${W}: modal opens`, true);
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(OUT, `open-${W}.png`) });

  // no horizontal overflow while the modal is open
  const of = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  ok(`${W}: no horizontal overflow with modal open`, of.s <= of.c + 1, `${of.s}/${of.c}`);

  // the consent input must NOT carry the native required attribute (the owner's decision, twice)
  const req = await page.evaluate(() => {
    const b = document.querySelector('[role="dialog"] [data-consent-input]');
    return b ? { present: true, required: b.hasAttribute("required") } : { present: false };
  });
  ok(`${W}: consent box present`, req.present);
  ok(`${W}: consent input has NO required attribute`, req.present && req.required === false);

  // submitting WITHOUT ticking must be refused loudly and must not post
  await page.fill('[role="dialog"] input[name="name"]', "Round Thirtyeight");
  await page.fill('[role="dialog"] input[name="email"]', "r38@example.com");
  const phone = page.locator('[role="dialog"] input[name="phone"]');
  if (await phone.count()) await phone.first().fill("9175550123");
  const msg = page.locator('[role="dialog"] textarea[name="message"]');
  if (await msg.count()) await msg.first().fill("Testing the consent gate from round 38.");
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForTimeout(700);
  const alertText = await page.locator('[role="dialog"] [role="alert"]').first().textContent().catch(() => null);
  ok(`${W}: refusing consent shows a visible role=alert error`, !!alertText && /tick the box/i.test(alertText), String(alertText).slice(0, 60));
  ok(`${W}: refusing consent posted NO lead`, leadPosts === 0, `posts=${leadPosts}`);
  await page.screenshot({ path: path.join(OUT, `consent-error-${W}.png`) });

  // tick it, submit, and the lead goes
  await page.locator('[role="dialog"] [data-consent-input]').check();
  await page.locator('[role="dialog"] button[type="submit"]').click();
  await page.waitForTimeout(900);
  ok(`${W}: ticking consent posts exactly one lead`, leadPosts === 1, `posts=${leadPosts}`);
  const success = await page.locator('[role="dialog"] [role="status"]').first().textContent().catch(() => null);
  ok(`${W}: success panel shown in place (no redirect)`, !!success && /message sent/i.test(success), String(success).slice(0, 40));
  ok(`${W}: still on /connect`, new URL(page.url()).pathname === "/connect", page.url());
  await page.screenshot({ path: path.join(OUT, `success-${W}.png`) });

  // Escape closes, and focus returns to the trigger
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  ok(`${W}: Escape closes the modal`, (await page.getByRole("dialog").count()) === 0);
  const restored = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 30) || "");
  ok(`${W}: focus restored to the trigger`, /message us instead/i.test(restored), restored);

  // focus trap: reopen and Tab a full lap without escaping the dialog
  await trigger.click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });
  let escaped = false;
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    if (!inside) { escaped = true; break; }
  }
  ok(`${W}: focus stays trapped over 22 tabs`, !escaped);

  // backdrop click closes
  await page.mouse.click(4, 4);
  await page.waitForTimeout(400);
  ok(`${W}: backdrop click closes`, (await page.getByRole("dialog").count()) === 0);

  await ctx.close();
}
await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("FAILED:");
  for (const f of failed) console.log("  " + f.name + "  " + f.detail);
  process.exit(1);
}
console.log("PASS");
