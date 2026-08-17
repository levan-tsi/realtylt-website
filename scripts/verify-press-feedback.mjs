// COMMITTED GATE — the two primary surfaces must answer a press, and must never animate a
// focus ring.
//
// Round 30 fixed both defects on <Button> and measured that the rest of the site still had
// them. This holds the round-31 repair open in three independent ways, because each catches a
// different way for it to rot:
//
//   1. CLAIM vs REALITY. An element whose computed transition lists `scale` is claiming a
//      press. The claim is then checked in PIXELS under a real mouse press — round 30 lost half
//      a day to `getComputedStyle().transform` reading `none` for a working scale, because
//      Tailwind v4 emits `scale` as its own property. A rendered box changes size whichever
//      property did the scaling.
//   2. COVERAGE. A named list of this round's controls must each still claim a press, so a
//      refactor that quietly drops the class fails here rather than in front of the owner.
//   3. THE RING. No control may transition `outline-color`. Measured before the fix: the header
//      nav's ring walked ten colours over 260ms, starting mid-grey.
//
// And under prefers-reduced-motion the press must be GONE, not merely fast — the global
// reduced-motion block only shortens durations, so an un-opted-out scale still moves.
//
// Blocks **/api/media/** — MLS Grid is rate-limit sensitive.
import { chromium } from "playwright";

const BASE = process.env.PROBE_BASE || "http://localhost:3100";
const results = [];
const check = (ok, line) => {
  results.push(ok);
  console.log(`  ${ok ? "OK  " : "FAIL"} ${line}`);
};

/** Controls this round gave a press to. Matched on the accessible name, which is what a visitor
 * actually reaches for — a class name would just be testing that a string exists twice. */
const COVERAGE = {
  "/search?county=dutchess": ["More", "Search", "Save Search", "All Listings", "Saved", "Page 1"],
  "/": ["Search", "Sell Your Home", "See Home Value", "Show slide 1 of 5", "Previous review"],
};

const named = (page, name) =>
  page.evaluate((n) => {
    for (const el of document.querySelectorAll("button, a[href], [role=button]")) {
      const label = (el.getAttribute("aria-label") || el.textContent || "").trim();
      if (label !== n) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const cs = getComputedStyle(el);
      el.setAttribute("data-press-probe", "1");
      return { claims: cs.transitionProperty.includes("scale"), x: r.x, y: r.y, w: r.width, h: r.height, top: r.top };
    }
    return null;
  }, name);

const browser = await chromium.launch();

for (const [path, names] of Object.entries(COVERAGE)) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route("**/api/media/**", (r) => r.abort());
  const page = await context.newPage();
  console.log(`\nPRESS FEEDBACK — ${path}`);
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(6000);

  // ── 3. THE RING, page-wide. One offender is a failure: it is the same defect everywhere.
  const ringy = await page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("button, a[href], summary, input, select, [role=button]")) {
      // The chat widget ships its own stylesheet and is not part of this repair.
      if (el.closest(".rlt-panel, .rlt-bubble")) continue;
      if (getComputedStyle(el).transitionProperty.includes("outline-color")) {
        bad.push((el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30));
      }
    }
    return bad;
  });
  check(ringy.length === 0, `no control animates its focus ring (${ringy.length} offender(s)${ringy.length ? ": " + ringy.slice(0, 4).join(", ") : ""})`);

  // ── 1 + 2. Coverage, then the pixels behind each claim.
  for (const name of names) {
    const info = await named(page, name);
    if (!info) {
      check(false, `"${name}": control not found on the page`);
      continue;
    }
    if (!info.claims) {
      check(false, `"${name}": no press — its transition does not list \`scale\``);
      continue;
    }
    // Off-screen elements still have a bounding box (round 28's trap), so scroll it into view
    // and re-read before the mouse is sent anywhere.
    const el = page.locator("[data-press-probe]").first();
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(150);
    const rest = await el.boundingBox();
    await page.mouse.move(rest.x + rest.width / 2, rest.y + rest.height / 2);
    await page.waitForTimeout(220); // let any hover state settle, so the press is the only delta
    const hover = await el.boundingBox();
    await page.mouse.down();
    await page.waitForTimeout(220);
    const press = await el.boundingBox();
    // RELEASE SOMEWHERE ELSE. A click only fires when down and up land on the same element, so
    // moving away first measures the press without following the link — otherwise this gate
    // navigates off the page it is testing (it did, on "Sell Your Home").
    await page.mouse.move(4, 4);
    await page.mouse.up();
    await page.evaluate(() => document.querySelector("[data-press-probe]")?.removeAttribute("data-press-probe"));
    await page.waitForTimeout(150);
    const ok = press.width < hover.width - 0.3 && press.width < rest.width - 0.3;
    check(ok, `"${name}" answers a press: rest ${rest.width.toFixed(1)}px  hover ${hover.width.toFixed(1)}px  press ${press.width.toFixed(1)}px`);
  }
  await context.close();
}

// ── 4. REDUCED MOTION: the press must be absent, not merely instant.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await context.route("**/api/media/**", (r) => r.abort());
  const page = await context.newPage();
  console.log("\nREDUCED MOTION — the press must not move anything");
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(6000);
  const info = await named(page, "Sell Your Home");
  const el = page.locator("[data-press-probe]").first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  const rest = await el.boundingBox();
  await page.mouse.move(rest.x + rest.width / 2, rest.y + rest.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  const press = await el.boundingBox();
  await page.mouse.up();
  check(
    Math.abs(press.width - rest.width) < 0.3,
    `"Sell Your Home" does not scale under reduced motion: rest ${rest.width.toFixed(1)}px vs press ${press.width.toFixed(1)}px (must match). Its transition list here is "${info.claims ? "scale" : "none"}" — motion-reduce:transition-none is expected to empty it.`,
  );
  await context.close();
}

// ── 5. A TAP MUST NOT LEAVE A HOVER STATE BEHIND. On a touch device a tap fires :hover and
// nothing ever fires the leave, so an un-gated hover rule sticks for the rest of the session.
// Measured at 390 before the fix: a tapped card held `translate: 0 -4px` permanently, and the
// photograph inside it stayed zoomed. The source-level ratchet is components/ui/motion.test.ts;
// this is the one that watches the rendered page, where a new hover rule would show up first.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await context.route("**/api/media/**", (r) => r.abort());
  const page = await context.newPage();
  console.log("\nTOUCH — a tap must not leave a hover state behind (390)");
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(6000);
  const card = page.locator("article.lift").first();
  if (!(await card.count())) {
    check(false, "no .lift card on the home page — cannot test");
  } else {
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const box = await card.boundingBox();
    const before = await card.evaluate((e) => `${getComputedStyle(e).translate}|${getComputedStyle(e).boxShadow}`);
    // Tap the card's top edge: inside the card, clear of its links' own destinations.
    await page.touchscreen.tap(box.x + box.width / 2, box.y + 20).catch(() => {});
    await page.waitForTimeout(700);
    const after = await card.evaluate((e) => `${getComputedStyle(e).translate}|${getComputedStyle(e).boxShadow}`).catch(() => before);
    check(after === before, `a tapped card returns to its resting state (before "${before.slice(0, 40)}" / after "${after.slice(0, 40)}")`);
  }
  await context.close();
}

await browser.close();
const failed = results.filter((r) => r === false).length;
console.log(`\n${failed ? `FAIL — ${failed} of ${results.length} checks` : `PASS — ${results.length}/${results.length} checks`}`);
process.exit(failed ? 1 : 0);
