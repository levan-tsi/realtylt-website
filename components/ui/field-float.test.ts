import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** ROUND 32, PAGE 1 (HOME) — the repairs, asserted from source.
 *
 * The browser proved each of these on screen (docs/parity/PAGES-R32.md carries the
 * measurements). These are the cheap ratchets that run on every commit and catch a
 * revert: a placeholder going back to being the only label, a stat counter going back
 * to announcing zeros, a layout property being animated again.
 *
 * Every assertion here was checked against the PRE-round-32 file first — each one fails
 * on it, which is the only reason to trust it. */

const root = join(__dirname, "..", "..");
const read = (...p: string[]) => readFileSync(join(root, ...p), "utf8");
const field = read("components", "ui", "Field.tsx");
const stat = read("components", "ui", "StatCounter.tsx");
const why = read("components", "home", "WhyCarousel.tsx");
const rail = read("components", "idx", "RailPager.tsx");
const lead = read("components", "leads", "LeadForm.tsx");

describe("a placeholder is not a label", () => {
  it("floats the label instead of hiding it, whenever a field has a placeholder to swap", () => {
    expect(field).toMatch(/const floating = !!hideLabel && !!rest\.placeholder/);
    expect(field).toMatch(/hideLabel && floating/);
  });

  it("animates translate and scale, never transform or font-size", () => {
    // Tailwind v4 emits `translate` and `scale` as their own properties: a transition
    // naming `transform` animates neither and the label teleports.
    expect(field).toMatch(/transition-\[translate,scale,color\]/);
    expect(field).not.toMatch(/transition-\[transform/);
    expect(field).not.toMatch(/transition-\[font-size|transition-\[.*\bfont-size/);
  });

  it("keeps the label's floated position as the default and excludes focus from the resting rule", () => {
    // If the resting rule did not exclude :focus, whether an empty focused field floats
    // its label would depend on Tailwind's variant emit order.
    expect(field).toMatch(/peer-\[:placeholder-shown:not\(:focus\)\]/);
  });

  it("makes the placeholder's suppression unloseable", () => {
    // `controlBase` sets placeholder:text-stone; same group, same variant, so without the
    // important modifier which one wins is emit order, not source order.
    expect(field).toMatch(/placeholder:!text-transparent/);
  });

  it("does not let the dark tone re-colour a floating field's placeholder", () => {
    expect(field).toMatch(/floating \? "" : "placeholder:text-paper\/60"/);
  });

  it("still names every control for assistive tech", () => {
    // The floated label is a real <label htmlFor>, not a decoration.
    expect(field).toMatch(/<label htmlFor=\{id\} className=\{`\$\{floatLabel\}/);
  });
});

describe("a stat counter must never state a number that is not true", () => {
  /** These cases used to assert the GUARD on the count-up: that the zero was only written while
   * the block was below the fold. That guard was real and it worked, but it was the wrong thing to
   * hold. A review measured the count still printing "0 / 0h / 0+ / 0" between the block's top edge
   * entering the viewport and it becoming half visible (the observer's threshold was 0.5), and
   * printing "7 / 16h / 66+ / 5" mid-count for the full 1,400ms it ran. No threshold fixes the
   * second one: showing wrong numbers on the way to the right one IS a count-up.
   *
   * So the assertion moved from the mechanism to the property. There is no count, therefore there
   * is no frame in which a wrong number can be on screen. */
  // Assert on CODE, not on prose. The first version of these cases scanned the whole file and
  // failed on the comment above them, which explains at length which mechanisms were removed and
  // therefore names every one of them.
  const statCode = stat.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  it("does not animate the value at all — no timer, no observer, no interim state", () => {
    for (const banned of ["requestAnimationFrame", "IntersectionObserver", "setDisplay", "useState", "durationMs"]) {
      expect(statCode, `StatCounter must not reintroduce ${banned}`).not.toMatch(new RegExp(banned));
    }
  });

  it("renders the true value directly, and on the server", () => {
    expect(statCode).toMatch(/\{value\.toLocaleString\("en-US"\)\}/);
    expect(statCode, 'a stat with nothing to animate needs no "use client"').not.toMatch(/"use client"/);
  });
});

describe("no layout property is animated on the home page", () => {
  it("carries the carousel dot's shape on clip-path, not width", () => {
    expect(why).toMatch(/transition-\[clip-path,background-color\]/);
    expect(why).not.toMatch(/transition-\[width/);
  });

  it("keeps the dot's ends round through the whole transition", () => {
    expect(why).toMatch(/clip-path:inset\(0_8px_round_4px\)/);
    expect(why).toMatch(/clip-path:inset\(0_round_4px\)/);
  });
});

describe("a swap of eight cards is not a hard cut", () => {
  it("reuses round 31's arrival rather than starting a second vocabulary", () => {
    expect(rail).toMatch(/rlt-view-in/);
    // no new keyframe, no new curve, no new duration
    expect(rail).not.toMatch(/@keyframes|cubic-bezier|duration-\d/);
  });

  it("replays on a page change and stays silent on first paint", () => {
    expect(rail).toMatch(/key=\{page\}/);
    expect(rail).toMatch(/swapped \? "rlt-view-in" : ""/);
    expect(rail).toMatch(/setSwapped\(true\)/);
  });
});

describe("the success panel answers the most committed thing on the page", () => {
  it("arrives with the panel entrance the wizard already uses", () => {
    expect(lead).toMatch(/rlt-pop-in rounded-2xl border p-6 text-center/);
  });
});
