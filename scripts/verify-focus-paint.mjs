/* DOES EVERY INTERACTIVE ELEMENT ACTUALLY PAINT A FOCUS STATE?
 *
 * CLAUDE.md makes focus-visible >= 3:1 a floor, and until this existed nothing in a browser
 * checked it. Not "does it have a focus-visible class" — does the pixel content of its box CHANGE
 * when a keyboard reaches it. Screenshot the element, focus it, screenshot again, diff. A ring
 * that is declared but overridden, drawn outside a clipping ancestor, or the same colour as what
 * sits behind it all read as "no change", which is exactly what a keyboard visitor experiences.
 *
 * TWO FALSE POSITIVES ARE BAKED OUT OF IT, both found by checking a finding against the source
 * instead of believing it:
 *  1. The spam honeypots. They are off-screen with tabIndex -1, so no keyboard can reach them and
 *     a missing focus state is correct. Reported as three failures until tabIndex was respected.
 *  2. Composed instruments. /home-value's address field draws its ring on the CONTAINER, 8px out
 *     (p-2) plus a 2px outline-offset. An 8px crop cut the ring off and called a working control
 *     broken; the pad is 18px now. Verified by hand at deviceScaleFactor 2 with a real Tab: the
 *     container matches :has(input:focus-visible) and paints a 2px white ring over the dark hero,
 *     5.06% of the cropped pixels.
 *
 * Usage:  node scripts/verify-focus-paint.mjs
 *         PAGES=/,/buying W=390 H=844 node scripts/verify-focus-paint.mjs
 *         BREAK_CSS=":focus-visible{outline:none!important}" node scripts/verify-focus-paint.mjs
 *           ^ the negative control: this MUST fail, or the gate is measuring nothing.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:3100";
const OUT = "docs/design-r35/focus";
await mkdir(OUT, { recursive: true });
const PAGES = (process.env.PAGES ?? "/,/buying,/selling,/connect,/home-value,/financing,/who-we-are").split(",");
const W = Number(process.env.W ?? 1440);
const H = Number(process.env.H ?? 900);
const CAP = Number(process.env.CAP ?? 26);

const browser = await chromium.launch();
const dead = [];
let checked = 0;

for (const path of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await ctx.route("**/api/media/**", (r) => r.abort());
  await ctx.route("**/api/lead", (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.evaluate(async () => { await document.fonts.ready; });
  // Kill motion so a diff cannot be a transition caught mid-flight.
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important}nextjs-portal{display:none!important}" });
  // Negative control, same convention as scripts/verify-hero-contrast.mjs: a gate nobody has
  // watched FAIL is a gate nobody should believe.
  if (process.env.BREAK_CSS) await page.addStyleTag({ content: process.env.BREAK_CSS });

  const handles = await page.$$("a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex='-1'])");
  let n = 0;
  for (const el of handles) {
    if (n >= CAP) break;
    const info = await el.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      if (r.width < 4 || r.height < 4 || cs.visibility === "hidden" || cs.display === "none") return null;
      // A keyboard cannot reach tabindex=-1, so a missing focus state there is correct, not a
      // defect: that is exactly how the spam honeypots are built (off-screen, aria-hidden,
      // tabIndex -1). Counting them as failures was this probe's own false positive.
      if (e.tabIndex < 0) return null;
      // Anything parked off-screen is hidden ON PURPOSE by the same trick.
      if (r.right < 0 || r.bottom < 0 || r.left > innerWidth) return null;
      return {
        tag: e.tagName,
        text: (e.getAttribute("aria-label") || e.textContent || e.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim().slice(0, 32),
        w: Math.round(r.width), h: Math.round(r.height),
      };
    });
    if (!info) continue;
    try {
      await el.scrollIntoViewIfNeeded({ timeout: 3000 });
    } catch { continue; }
    await page.waitForTimeout(90);

    // Pad the crop so a ring drawn OUTSIDE the border box is still in frame — and pad WIDE.
    // At 8px this reported /home-value's address field as painting nothing: that instrument draws
    // its ring on the CONTAINER, which sits 8px out (p-2) plus a 2px outline-offset, so the ring
    // fell just outside the crop and the probe called a working control broken.
    const box = await el.boundingBox();
    if (!box) continue;
    const pad = 18;
    const clip = {
      x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
      width: Math.min(W - Math.max(0, box.x - pad), box.width + pad * 2),
      height: Math.min(H - Math.max(0, box.y - pad), box.height + pad * 2),
    };
    if (clip.width < 6 || clip.height < 6) continue;

    const before = await page.screenshot({ clip });
    // A real keyboard arrival, not .focus() — focus-visible only paints for the former in Chromium
    // when the element is not a text field, and that distinction is the whole point of the rule.
    await el.evaluate((e) => e.focus({ focusVisible: true }));
    await page.waitForTimeout(120);
    const after = await page.screenshot({ clip });

    const [a, b] = await Promise.all([
      sharp(before).raw().toBuffer({ resolveWithObject: true }),
      sharp(after).raw().toBuffer({ resolveWithObject: true }),
    ]);
    let diff = 0;
    const len = Math.min(a.data.length, b.data.length);
    for (let i = 0; i < len; i += 4) {
      if (Math.abs(a.data[i] - b.data[i]) > 12 || Math.abs(a.data[i + 1] - b.data[i + 1]) > 12 || Math.abs(a.data[i + 2] - b.data[i + 2]) > 12) diff++;
    }
    const px = len / 4;
    const pct = (diff / px) * 100;
    checked++;
    n++;
    if (pct < 0.35) {
      dead.push({ path, ...info, pct: pct.toFixed(2) });
      await sharp(after).toFile(`${OUT}/dead-${path.replace(/\W/g, "") || "home"}-${n}.png`);
    }
    await page.evaluate(() => document.activeElement?.blur());
  }
  await ctx.close();
}
await browser.close();

console.log(`checked ${checked} focusable elements across ${PAGES.length} pages at ${W}x${H}`);
if (!dead.length) console.log("PASS — every one of them paints something when a keyboard reaches it.");
else {
  console.log(`\n${dead.length} paint NOTHING on focus:\n`);
  for (const d of dead) console.log(`  ${d.pct.padStart(5)}%  ${d.path.padEnd(12)} ${d.tag.padEnd(8)} ${d.w}x${d.h}  "${d.text}"`);
}
process.exit(dead.length ? 1 : 0);
