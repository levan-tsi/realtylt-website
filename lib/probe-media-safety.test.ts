import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** NO COMMITTED PROBE MAY LET MLS MEDIA THROUGH.
 *
 * CLAUDE.md: "In Playwright probes BLOCK `**\/api/media/**` unless a screenshot genuinely needs
 * photos, and keep those runs small." That rule existed because this site has been measured
 * bursting the media host into 429s.
 *
 * On 2026-08-21 a sold-photo window took a real 429. The cause was never established, but the one
 * variable the previous fourteen clean windows did not have was `verify-hero-contrast.mjs`
 * calling `route("**\/api/media/**", (r) => r.continue())` — an EXPLICIT allow, committed, run
 * repeatedly across 8-11 pages x 3 viewports while the window was live. `/api/media/` is
 * storage-first but falls back to PROXYING the media host for any photo not yet mirrored, so a
 * probe that allows it spends the same account budget a photo window is sized against.
 *
 * A rule in a markdown file did not stop that, and would not stop the next one. This does.
 *
 * SCOPE, deliberately narrow. It catches the thing that actually happened — a probe *choosing* to
 * allow media — rather than every script that simply never mentions the route. Six committed
 * probes fall in that second group (probe-blog, probe-blog-mobile, probe-reduced-motion,
 * verify-calc-menu, verify-saved-flow, verify-services-toc); each was checked and every one drives
 * a blog, services or /saved page carrying no listing rails, so none of them requests the route at
 * all. Widening this to "must mention api/media" would mean editing six working scripts to add a
 * no-op, and a guard that forces busywork gets deleted by whoever is in a hurry.
 */

/** Lives in lib/ because vitest.config.ts only includes lib|app|components|content —
 *  a guard parked in scripts/ is never collected and never runs, which is the quietest way for a
 *  guard to be useless. Verified by watching it FAIL before trusting it. */
const SCRIPTS = path.resolve(__dirname, "..", "scripts");

function browserScripts(): string[] {
  return fs
    .readdirSync(SCRIPTS)
    .filter((f) => f.endsWith(".mjs"))
    // `scripts/_scratch-*` is gitignored: those are one-off probes belonging to whoever is at the
    // keyboard, and some legitimately need photos (_scratch-photo-firstpaint.mjs measures how long
    // a listing photo takes to paint, which it cannot do with the route aborted). A test that
    // failed on every leftover scratch file on every machine would be noise, and a noisy guard
    // gets deleted by whoever is in a hurry. The rule for those stays CLAUDE.md's convention.
    // What this file defends is the COMMITTED surface, which is what ran during the 429.
    .filter((f) => !f.startsWith("_scratch-"))
    .filter((f) => fs.readFileSync(path.join(SCRIPTS, f), "utf8").includes("chromium.launch"));
}

/** A route handler for the media path that hands the request onward instead of stopping it. */
const ALLOWS_MEDIA = /route\(\s*["'`][^"'`]*\/api\/media\/[^"'`]*["'`]\s*,[^)]*?\br\.continue\(\)|route\(\s*["'`][^"'`]*\/api\/media\/[^"'`]*["'`]\s*,[^;]{0,200}?\.continue\(\)/;

describe("committed probes and MLS media", () => {
  it("finds browser scripts to check at all (the scan must not silently match nothing)", () => {
    // A regex that matches zero files passes for ever and proves nothing. This is the tripwire.
    expect(browserScripts().length).toBeGreaterThan(5);
  });

  it("never lets a probe explicitly allow /api/media through", () => {
    const offenders = browserScripts().filter((f) =>
      ALLOWS_MEDIA.test(fs.readFileSync(path.join(SCRIPTS, f), "utf8")),
    );
    expect(
      offenders,
      `These probes hand /api/media requests onward. That route proxies the MLS media host for any\n` +
        `photo not yet mirrored, so running them spends the same budget a photo window is sized\n` +
        `against — and one of them was live during the 2026-08-21 429. Use r.abort(), or\n` +
        `r.fulfill({ status: 204, body: "" }) if the page needs the request to resolve.`,
    ).toEqual([]);
  });

  it("still catches the exact line that was committed before the 429", () => {
    // Proves the matcher bites, rather than passing because it matches nothing (see above).
    expect(ALLOWS_MEDIA.test(`await c.route("**/api/media/**", (r) => r.continue());`)).toBe(true);
    expect(ALLOWS_MEDIA.test(`await page.route('**/api/media/**', (r) => r.continue())`)).toBe(true);
    // ...and does not fire on the correct forms.
    expect(ALLOWS_MEDIA.test(`await c.route("**/api/media/**", (r) => r.abort());`)).toBe(false);
    expect(ALLOWS_MEDIA.test(`await p.route("**/api/media/**", (r) => r.fulfill({ status: 204 }));`)).toBe(false);
    // A continue() on an UNRELATED route is not this rule's business.
    expect(ALLOWS_MEDIA.test(`await c.route("**/api/idx/**", (r) => r.continue());`)).toBe(false);
  });
});
