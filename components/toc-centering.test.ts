import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** The floating "On this page" pill is centred on the VIEWPORT, on every page that has one.
 *
 * WHY THIS EXISTS. The owner reported on 2026-08-26 that "on phone some blogs, the hovering
 * listing on the bottom where you can click and jump to different places in the blog was
 * misaligned". Measured at 390 DPR3: the pill on all twenty flagship posts sat at centre 161
 * against a viewport centre of 195, the same 34px on every one, while the service pages next
 * door measured dead centre. "Some blogs" was the twenty flagships; the ten legacy posts render
 * no trigger at all, which is why it read as some rather than all.
 *
 * The cause was a horizontal dodge. `components/blog/FlagshipToc.tsx` centred the pill inside
 * the band that EXCLUDES the chat launcher (`fixed inset-x-4 bottom-5 right-[5.25rem]` plus
 * `justify-center`), which does keep the pill off the launcher and does it by moving the pill
 * half the excluded gutter to the left. That is invisible in code review and obvious on a phone.
 *
 * The launcher is dodged on WIDTH now (a centred pill capped at `100% - 10.5rem` clears the
 * 60px bubble by 8px at every width), so this test guards the thing that regressed: the
 * horizontal placement of the trigger wrapper. A future session that reaches for `right-[...]`
 * again to solve an overlap gets a red test and this docstring.
 *
 * Source-level rather than rendered, deliberately: the rendered check lives in
 * scripts/toc-align-probe.mjs, which measures all twenty posts in a real browser. This one runs
 * in `npm test` on every commit, which is where a class edit actually gets caught.
 */

const ROOT = process.cwd();

/** Every component that renders a floating [data-toc-trigger] pill. */
const TOCS = [
  "components/blog/FlagshipToc.tsx",
  "components/blog/ArticleToc.tsx",
  "components/services/ServiceToc.tsx",
];

/** The `fixed` class string that places the trigger.
 *
 * It can sit EITHER on a wrapper above the button (FlagshipToc) or on the button element itself
 * (ArticleToc, ServiceToc), so this takes the nearest one in either direction rather than
 * assuming an order. The first version of this test only looked backwards and reported "no
 * fixed wrapper" on the two components whose class follows the attribute, which would have been
 * a green-looking hole in exactly half the surface it claims to cover. */
function triggerPlacement(src: string): string {
  const i = src.indexOf("data-toc-trigger");
  expect(i, "data-toc-trigger not found").toBeGreaterThan(-1);
  // `bottom-` narrows it to the floating pill. Without it the nearest `fixed` string in
  // ServiceToc is the DESKTOP RAIL (`group fixed top-1/2 ... min-[1360px]:block`), which is
  // vertically centred in the gutter and has no horizontal centring to assert. A test that
  // silently measured the wrong element would have failed for the right-sounding wrong reason.
  const all = [...src.matchAll(/className=\{?"([^"]*\bfixed\b[^"]*\bbottom-[^"]*)"/g)];
  expect(all.length, "no fixed bottom-anchored placement class in the file").toBeGreaterThan(0);
  let best = all[0];
  for (const m of all) {
    if (Math.abs((m.index ?? 0) - i) < Math.abs((best.index ?? 0) - i)) best = m;
  }
  return best[1];
}

describe("the floating table-of-contents pill is centred on the viewport", () => {
  it("names every component that has one", () => {
    expect(TOCS.length).toBe(3);
    for (const f of TOCS) expect(fs.existsSync(path.join(ROOT, f)), f).toBe(true);
  });

  for (const file of TOCS) {
    const src = () => fs.readFileSync(path.join(ROOT, file), "utf8");

    it(`${file} centres its trigger`, () => {
      const cls = triggerPlacement(src());
      // Two legitimate ways to centre: translate off the midpoint, or a full-width flex row.
      const translated = /\bleft-1\/2\b/.test(cls) && /-translate-x-1\/2/.test(cls);
      const flexCentred = /\binset-x-0\b/.test(cls) && /\bjustify-center\b/.test(cls);
      expect(
        translated || flexCentred,
        `neither centring pattern found in: ${cls}`,
      ).toBe(true);
    });

    it(`${file} does not dodge the chat launcher by moving sideways`, () => {
      const cls = triggerPlacement(src());
      // An asymmetric horizontal inset shifts the centre off the viewport centre. Dodging the
      // launcher is legitimate; doing it with `right-[...]`/`left-[...]` on the wrapper is what
      // produced the 34px offset the owner saw.
      const asymmetric = cls.match(/\b(right|left)-\[[^\]]+\]/);
      expect(asymmetric?.[0] ?? null, `asymmetric inset on the wrapper: ${cls}`).toBe(null);
      // `inset-x-4` with a `right-*` override is the same trick spelled differently.
      const insetPlusOverride = /\binset-x-\d/.test(cls) && /\b(right|left)-/.test(cls);
      expect(insetPlusOverride, `inset-x with a side override: ${cls}`).toBe(false);
    });
  }

  it("FlagshipToc caps the pill's width instead, so a centred pill still clears the launcher", () => {
    // The replacement for the sideways dodge. If this disappears, the pill is centred and
    // overlapping, which is the bug the sideways dodge was invented to solve.
    expect(src2()).toMatch(/max-w-\[calc\(100%-10\.5rem\)\]/);
  });
});

function src2(): string {
  return fs.readFileSync(path.join(ROOT, "components/blog/FlagshipToc.tsx"), "utf8");
}
