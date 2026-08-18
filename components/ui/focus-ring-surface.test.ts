import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** A FOCUS RING IS JUDGED AGAINST THE SURFACE IT LANDS ON, NOT THE SECTION IT BELONGS TO.
 *
 * Two ways that went wrong, both measured in round 34 by tabbing with real keys and diffing
 * clipped pixels (scripts/_scratch-r34-rings.mjs), both on /search — the site's primary surface:
 *
 * 1. THE RING DREW WHITE ON A WHITE CONTROL. Round 33 fixed the listing gallery, where every
 *    control carries a `bg-ink/55..70` body, by pulling the ring inside the control and painting
 *    it paper. The rule it wrote is `.photo-zoom :focus-visible`, and `.photo-zoom` is also the
 *    photo frame on every listing CARD — where the pager arrows are `bg-white/90`. Measured on a
 *    card arrow: `outline: solid 2px rgb(255,255,255)`, `outline-offset: -2px`, over a white
 *    body. 36 controls on /search, plus the home page's rails. The ring is right to sit on the
 *    control's own body; only its COLOUR depends on how dark that body is, so the colour became
 *    a variable the light-bodied control can answer.
 *
 * 2. A SEGMENTED CONTROL CLIPPED ITS OWN RING TO NOTHING. Round 31 made the group
 *    `flex overflow-hidden rounded-xl border` on purpose, so the parent owns the radius and the
 *    press scales the whole toggle. That clip also eats three sides of a segment's outline, and
 *    the fourth side is painted over by the next segment's opaque background. Measured in pixels
 *    on /search: FOR SALE 0 ring pixels, GRID 0 ring pixels, FOR RENT 68 pixels landing on the
 *    black active segment at 1.51:1 — under the site's own 3:1 floor. The clip stays; the ring
 *    moves inside the segment, where nothing can clip it, and follows `aria-pressed` for colour.
 */

const root = join(__dirname, "..", "..");
const css = readFileSync(join(root, "app", "globals.css"), "utf8");
const cardPhotos = readFileSync(join(root, "components", "idx", "CardPhotos.tsx"), "utf8");
const searchClient = readFileSync(join(root, "components", "search", "SearchClient.tsx"), "utf8");

const ruleFor = (selector: string): string | null => {
  const i = css.indexOf(selector);
  if (i < 0) return null;
  const open = css.indexOf("{", i);
  const close = css.indexOf("}", open);
  return open < 0 || close < 0 ? null : css.slice(open + 1, close);
};

describe("a control sitting on a photograph", () => {
  const rule = ruleFor(".photo-zoom :focus-visible");

  it("still draws its ring on its own body rather than on the picture", () => {
    expect(rule, ".photo-zoom :focus-visible is missing").toBeTruthy();
    expect(rule).toMatch(/outline-offset:\s*-2px/);
  });

  it("lets a LIGHT-bodied control answer with a dark ring instead of an invisible white one", () => {
    // The whole defect: one hard-coded colour cannot serve both a bg-ink/55 pill and a
    // bg-white/90 pill. A variable with the dark-body default keeps the gallery unchanged.
    expect(rule).toMatch(/outline-color:\s*var\(--rlt-ring-on-photo,\s*var\(--color-paper\)\)/);
  });

  it("is answered by the card pager arrows, whose body is bg-white/90", () => {
    expect(cardPhotos).toMatch(/bg-white\/90/);
    expect(
      cardPhotos,
      "the white arrow must set --rlt-ring-on-photo, or its ring is white on white",
    ).toMatch(/\[--rlt-ring-on-photo:var\(--color-ink\)\]/);
  });
});

describe("a segmented control that clips its own outline", () => {
  const inset = ruleFor(".rlt-seg :focus-visible");
  const pressed = ruleFor('.rlt-seg [aria-pressed="true"]:focus-visible');

  it("pulls the ring inside the segment, where the group's overflow cannot clip it", () => {
    expect(inset, ".rlt-seg :focus-visible is missing").toBeTruthy();
    expect(inset).toMatch(/outline-offset:\s*-2px/);
  });

  it("flips the ring to paper on the pressed segment, which is the one painted bg-ink", () => {
    expect(pressed, '.rlt-seg [aria-pressed="true"]:focus-visible is missing').toBeTruthy();
    expect(pressed).toMatch(/outline-color:\s*var\(--color-paper\)/);
  });

  it("is carried by every group on /search that clips its children", () => {
    // Both toggles: "Sale or rent" and "View". Matching on the aria-label keeps this readable
    // when the class list changes.
    for (const label of ["Sale or rent", "View"]) {
      const tag = searchClient
        .split("\n")
        .find((l) => l.includes(`aria-label="${label}"`) && l.includes("overflow-hidden"));
      expect(tag, `the "${label}" group is not a clipped segmented group any more`).toBeTruthy();
      expect(tag, `the "${label}" group clips its ring and does not carry rlt-seg`).toMatch(/rlt-seg/);
    }
  });
});

describe("the county chips paint from the token set", () => {
  // D5 on /search: rgb(85 85 85) x6 was the page's only off-token colour, alongside a raw
  // #e2e6ea hover. Both are literals a token already names.
  it("holds no raw hex literals", () => {
    const at = searchClient.indexOf("const renderChip");
    // ASSERT ON CODE, NOT ON THE COMMENT THAT EXPLAINS THE CODE. The first version of this
    // failed against the FIXED tree, because the note recording which literals were removed
    // necessarily quotes them. (Round 33 lost a cycle to the identical mistake.)
    const chip = searchClient.slice(at, at + 1200).replace(/\/\/[^\n]*/g, "");
    expect(chip).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
