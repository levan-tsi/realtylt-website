/**
 * GATE — every lead modal on the site, driven in a real browser at 1440, 390 and 320.
 *
 * WHY THIS IS A COMMITTED GATE AND NOT A SCRATCH PROBE. The modals are how a visitor hands us their
 * details, and the thing they must never get wrong is the consent contract: the owner decided that
 * box twice, and the bug he actually reported ("when I filled it up nothing happened") was a
 * refusal that was SILENT. jsdom cannot prove a refusal is visible, a focus trap holds, or that
 * nothing was POSTed. This can, so it does.
 *
 * ROUND 38 WIDENED IT FROM ONE MODAL TO THREE. The gate originally drove only /connect, which uses
 * the shared LeadForm and therefore inherited the enforcement for free. The listing sheets do not
 * use LeadForm — they build their own fields around the same ConsentCheckbox — and an adversarial
 * pass found both of them reading `consentToContact` straight into the POST with no check at all:
 * an unticked box produced a real lead and a "Tour requested." panel. A gate that covers one of
 * three lead surfaces is a gate that certifies the surface that was already fine, so it now drives
 * all three. Any fourth lead modal belongs in the MODALS list below on the day it ships.
 *
 * The checks, per modal per width:
 *   - the trigger renders and opens a dialog
 *   - no horizontal overflow while the modal is open
 *   - the consent input carries NO native `required` attribute (the tests assert its ABSENCE
 *     elsewhere; this asserts it on the rendered page)
 *   - submitting WITHOUT ticking shows a visible role=alert error AND posts NOTHING
 *   - ticking it posts EXACTLY ONE lead and shows the success panel in place, without navigating
 *
 * Plus, once per width on /connect, the shell battery — Escape closes and restores focus, focus
 * stays trapped over 22 tabs, a backdrop click closes. All three modals render through the same
 * LeadSheet, so proving the shell once proves it for all three; proving consent once would not,
 * because consent is enforced by each form.
 *
 * SAFETY. THE /api/lead ROUTE POSTS TO THE LIVE CRM. It is intercepted and fulfilled locally, so
 * no run of this gate can ever create a real lead. MLS media is blocked as in every probe here.
 *
 * Screenshots land outside the repo (see OUT). Exit 0 = pass, 1 = at least one check failed.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/** SCREENSHOTS LAND OUTSIDE THE REPO. Writing twenty-seven PNGs into docs/ mid-run churns the dev
 * server's file watcher, and a page load that lands during the recompile comes back a 500 with no
 * hydrated buttons on it — which is what the widened gate did on its first three runs, at a
 * different width each time. The gate is measuring the site, not the watcher. `LEAD_MODAL_SHOTS`
 * overrides the location for anyone who wants the frames somewhere specific. */
const OUT = process.env.LEAD_MODAL_SHOTS || path.join(os.tmpdir(), "realtylt-lead-modals");
fs.mkdirSync(OUT, { recursive: true });
console.log(`screenshots: ${OUT}`);
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const browser = await chromium.launch();

/** The listing sheets need a real listing, and which listing is live changes with the feed, so it
 * is read off /search the way a visitor would reach one rather than hard-coded to an id that goes
 * off-market. */
async function findListingPath() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route("**/api/media/**", (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto("http://localhost:3100/search", { waitUntil: "networkidle", timeout: 90000 });
  await page.locator('a[href^="/homes-for-sale/"]').first().waitFor({ state: "attached", timeout: 30000 });
  const href = await page.locator('a[href^="/homes-for-sale/"]').first().getAttribute("href");
  await ctx.close();
  return href;
}

const listingPath = await findListingPath();
console.log(`listing under test: ${listingPath}\n`);

/** A listing page carries the same CTA label more than once — the rail's button, the mobile
 * bottom-sheet pair, and the sticky sub-nav that collapses to 0x0 until you scroll past the hero.
 * `.first()` is whichever is first in the DOM, which is the collapsed one, so this takes the
 * largest laid-out match instead: the control a visitor at this width would actually press. */
async function pressable(page, name) {
  const all = page.getByRole("button", { name });
  try {
    await all.first().waitFor({ state: "attached", timeout: 30000 });
  } catch {
    // Nine page loads into a run, a dev server that is also recompiling can hand back a document
    // with nothing rendered on it. That is the instrument's problem, not the site's, and it cost
    // three runs of this gate before it was named. One reload separates it from a trigger that
    // has genuinely gone missing — if the button is really absent, this still fails.
    await page.reload({ waitUntil: "networkidle", timeout: 90000 });
    await all.first().waitFor({ state: "attached", timeout: 30000 });
  }
  const n = await all.count();
  let best = null, bestArea = 0;
  for (let i = 0; i < n; i++) {
    const box = await all.nth(i).boundingBox().catch(() => null);
    const area = box ? box.width * box.height : 0;
    if (area > bestArea) { bestArea = area; best = all.nth(i); }
  }
  return best;
}

/** The listing rail shows a different tour trigger either side of `lg`: the inline card's "In
 * Person Tour" on desktop, the bottom-sheet "Schedule a Tour" on a phone. Both open the same
 * TourModal, so the gate matches either and takes the one that is actually visible at this width.
 * Same for "Make an Offer", which exists twice for the same reason. */
const MODALS = [
  {
    key: "connect",
    label: "/connect message",
    url: "/connect",
    trigger: "Message us instead",
    success: /message sent/i,
    shell: true,
  },
  {
    key: "tour",
    label: "listing tour",
    url: listingPath,
    trigger: /^(in person tour|schedule a tour)$/i,
    success: /tour requested/i,
  },
  {
    key: "offer",
    label: "listing offer",
    url: listingPath,
    trigger: /^make an offer$/i,
    success: /offer started/i,
  },
];

for (const W of [1440, 390, 320]) {
  for (const M of MODALS) {
    const tag = `${W} ${M.label}`;
    const ctx = await browser.newContext({ viewport: { width: W, height: W < 500 ? 844 : 900 } });
    await ctx.route("**/api/media/**", (r) => r.abort());
    let leadPosts = 0;
    await ctx.route("**/api/lead", (r) => {
      leadPosts++;
      return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3100" + M.url, { waitUntil: "networkidle", timeout: 90000 });

    const trigger = await pressable(page, M.trigger);
    ok(`${tag}: trigger renders`, !!trigger);
    if (!trigger) { await ctx.close(); continue; }
    await trigger.waitFor({ state: "visible", timeout: 30000 });

    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible", timeout: 10000 });
    ok(`${tag}: modal opens`, true);
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(OUT, `${M.key}-open-${W}.png`) });

    const of = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
    ok(`${tag}: no horizontal overflow with modal open`, of.s <= of.c + 1, `${of.s}/${of.c}`);

    // the consent input must NOT carry the native required attribute (the owner's decision, twice)
    const req = await page.evaluate(() => {
      const b = document.querySelector('[role="dialog"] [data-consent-input]');
      return b ? { present: true, required: b.hasAttribute("required") } : { present: false };
    });
    ok(`${tag}: consent box present`, req.present);
    ok(`${tag}: consent input has NO required attribute`, req.present && req.required === false);

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
    ok(`${tag}: refusing consent shows a visible role=alert error`, !!alertText && /tick the box/i.test(alertText), String(alertText).slice(0, 60));
    ok(`${tag}: refusing consent posted NO lead`, leadPosts === 0, `posts=${leadPosts}`);
    // and the sheet is still open with the form still in it, rather than closed or "sent"
    ok(`${tag}: form stays open after the refusal`, (await page.locator('[role="dialog"] button[type="submit"]').count()) === 1);
    await page.screenshot({ path: path.join(OUT, `${M.key}-consent-error-${W}.png`) });

    // tick it, submit, and the lead goes
    await page.locator('[role="dialog"] [data-consent-input]').check();
    await page.locator('[role="dialog"] button[type="submit"]').click();
    await page.waitForTimeout(900);
    ok(`${tag}: ticking consent posts exactly one lead`, leadPosts === 1, `posts=${leadPosts}`);
    const success = await page.locator('[role="dialog"] [role="status"]').first().textContent().catch(() => null);
    ok(`${tag}: success panel shown in place`, !!success && M.success.test(success), String(success).slice(0, 40));
    ok(`${tag}: did not navigate away`, new URL(page.url()).pathname === M.url, page.url());
    await page.screenshot({ path: path.join(OUT, `${M.key}-success-${W}.png`) });

    if (M.shell) {
      // Escape closes, and focus returns to the trigger
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      ok(`${tag}: Escape closes the modal`, (await page.getByRole("dialog").count()) === 0);
      const restored = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 30) || "");
      ok(`${tag}: focus restored to the trigger`, /message us instead/i.test(restored), restored);

      // focus trap: reopen and Tab a full lap without escaping the dialog
      await trigger.click();
      await page.getByRole("dialog").waitFor({ state: "visible", timeout: 10000 });
      let escaped = false;
      for (let i = 0; i < 22; i++) {
        await page.keyboard.press("Tab");
        const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
        if (!inside) { escaped = true; break; }
      }
      ok(`${tag}: focus stays trapped over 22 tabs`, !escaped);

      // backdrop click closes
      await page.mouse.click(4, 4);
      await page.waitForTimeout(400);
      ok(`${tag}: backdrop click closes`, (await page.getByRole("dialog").count()) === 0);
    }

    await ctx.close();
  }
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
