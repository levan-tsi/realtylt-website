import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** THE REVEAL RULE MUST BE A PIXEL RULE, NOT A RATIO.
 *
 * `IntersectionObserver`'s `threshold` is a fraction OF THE OBSERVED ELEMENT, so a block that is
 * large relative to the viewport can be plainly on screen and still never cross it. That is not
 * a hypothetical: measured at 1440x900 on the photo-rich listing
 * (/homes-for-sale/NY/newburgh/12550/1544-route-300/bid-38-KEY1002622), the contact aside is
 * 836px tall and sits at y=694, and it stayed at `opacity: 0` with `is-visible` never applied —
 * so Request a Tour, Make an Offer, the agent card and the lead form were an empty white column
 * on first paint. The photo-poor listing put the same aside 40px higher and it rendered, which
 * made the bug look like a data difference rather than a geometry one.
 *
 * These cases are the geometry, not the literal: each one computes what the observer would
 * compute and asserts the outcome, so a future edit that reintroduces a ratio threshold fails
 * here even if it picks a different number. */

const src = readFileSync(join(__dirname, "Reveal.tsx"), "utf8");

/** What an IntersectionObserver reports for a vertical-only case. */
function observe(
  { top, height }: { top: number; height: number },
  { viewport, threshold, bottomMargin }: { viewport: number; threshold: number; bottomMargin: number },
) {
  const rootBottom = viewport + bottomMargin; // rootMargin bottom is negative when it shrinks
  const visible = Math.max(0, Math.min(top + height, rootBottom) - Math.max(top, 0));
  const ratio = height > 0 ? visible / height : 0;
  // an observer fires `isIntersecting` once the ratio reaches the threshold; threshold 0 means
  // "any part of it", which the spec treats as ratio > 0.
  return threshold === 0 ? visible > 0 : ratio >= threshold;
}

const OLD = { viewport: 900, threshold: 0.12, bottomMargin: -40 };
const NEW = { viewport: 900, threshold: 0, bottomMargin: -80 };

describe("Reveal's observer options", () => {
  it("uses a pixel rule: threshold 0 with a bottom rootMargin", () => {
    const opts = /threshold:\s*([\d.]+),\s*rootMargin:\s*"0px 0px (-?\d+)px 0px"/.exec(src);
    expect(opts, "Reveal.tsx must configure one IntersectionObserver with these two options").not.toBeNull();
    expect(Number(opts![1]), "threshold must be 0 — any non-zero value is a ratio of the element").toBe(0);
    expect(Number(opts![2]), "the bottom rootMargin must hold the reveal back by real pixels").toBeLessThanOrEqual(-40);
  });
});

describe("the listing page's conversion column", () => {
  /** The measured geometry, and the part that matters is WHICH element is observed. The wrapper
   * Reveal renders is a GRID CELL, so it is stretched to the height of the whole row — 1941px,
   * not the 836px aside inside it. 166 visible pixels are 19.9% of the aside and 8.6% of the
   * cell, and the observer only ever sees the cell. Reading the aside's height was how the
   * first version of this test talked itself out of a correct diagnosis. */
  const cell = { top: 694, height: 1941 };

  it("was invisible under a ratio threshold", () => {
    expect(observe(cell, OLD)).toBe(false);
  });

  it("reveals under the pixel rule", () => {
    expect(observe(cell, NEW)).toBe(true);
  });

  it("stays hidden under a ratio rule however tall the row grows, and the pixel rule does not care", () => {
    for (const height of [1941, 3000, 6000]) {
      expect(observe({ top: 694, height }, OLD), `${height}px row under the ratio rule`).toBe(false);
      expect(observe({ top: 694, height }, NEW), `${height}px row under the pixel rule`).toBe(true);
    }
  });
});

describe("ordinary cards are unaffected", () => {
  // The point of the change is that nothing about the site's existing reveals visibly moves.
  // A ~300px card had to travel 76px past the fold under the old pair and 80px under the new.
  const card = (top: number) => ({ top, height: 300 });

  it("a card still below the fold stays hidden under both rules", () => {
    expect(observe(card(890), OLD)).toBe(false);
    expect(observe(card(890), NEW)).toBe(false);
  });

  it("a card 100px into view reveals under both rules", () => {
    expect(observe(card(760), OLD)).toBe(true);
    expect(observe(card(760), NEW)).toBe(true);
  });

  it("the two rules disagree by at most a few pixels of travel for a normal card", () => {
    const firstTop = (o: typeof OLD) => {
      for (let top = 900; top >= 0; top--) if (observe(card(top), o)) return top;
      return -1;
    };
    expect(Math.abs(firstTop(OLD) - firstTop(NEW))).toBeLessThanOrEqual(8);
  });
});
