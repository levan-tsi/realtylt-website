import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** THE MOTION SYSTEM, ASSERTED FROM SOURCE.
 *
 * The browser gates (scripts/verify-press-feedback.mjs, scripts/verify-marker-reconcile.mjs)
 * prove the behaviour on screen and are the ones that matter. These are the cheap ratchets that
 * run on every commit: they catch a second motion vocabulary being started, a banned curve
 * appearing, or the focus-ring repair being reverted — none of which needs a browser to see. */

const root = join(__dirname, "..", "..");
const css = readFileSync(join(root, "app", "globals.css"), "utf8");
const button = readFileSync(join(root, "components", "ui", "Button.tsx"), "utf8");

describe("motion tokens", () => {
  it("names exactly two curves, and both are defined once", () => {
    expect(css.match(/--ease-out:\s*cubic-bezier\(0\.22, 1, 0\.36, 1\)/g)).toHaveLength(1);
    expect(css.match(/--ease-move:\s*cubic-bezier\(0\.77, 0, 0\.175, 1\)/g)).toHaveLength(1);
  });

  it("makes the site's curve the DEFAULT curve, so an unstyled transition still belongs", () => {
    expect(css).toMatch(/--default-transition-timing-function:\s*var\(--ease-out\)/);
  });

  it("bans ease-in on UI: it starts slow at exactly the moment the eye is most attentive", () => {
    // `ease-in-out` is a different curve and is not what this bans; `--ease-move` is the site's
    // own name for the both-ends case. Only a bare `ease-in` in a transition/animation counts.
    const offenders = css
      .split("\n")
      .map((l, i) => [i + 1, l])
      .filter(([, l]) => /(transition|animation)[^;]*\bease-in\b(?!-out)/.test(String(l)));
    expect(offenders, `ease-in found at ${offenders.map(([n]) => n).join(", ")}`).toHaveLength(0);
  });

  it("keeps a focus ring out of every colour transition", () => {
    // Tailwind's own `transition-colors` lists outline-color; the unlayered override drops it.
    const rule = css.match(/^\.transition-colors\s*\{[^}]*\}/m)?.[0];
    expect(rule, "the .transition-colors override is missing").toBeTruthy();
    expect(rule).not.toMatch(/outline-color/);
    expect(rule).toMatch(/color/);
    // And only transition-property may be set, or a call site's duration-*/ease-* would lose.
    expect(rule).not.toMatch(/transition-duration|transition-timing-function/);
  });
});

describe("the press", () => {
  const press = button.match(/export const PRESS =\s*\n?\s*"([^"]+)"/)?.[1] ?? "";
  const group = button.match(/export const PRESS_GROUP =\s*\n?\s*"([^"]+)"/)?.[1] ?? "";

  it("is exported once, so a hand-rolled control cannot invent its own", () => {
    expect(press).not.toBe("");
    expect(group).not.toBe("");
  });

  it("names the properties it animates instead of using `all`", () => {
    // `all` also transitions the focus outline — the round-30 defect this replaced.
    expect(press).not.toMatch(/transition-all/);
    expect(press).toMatch(/transition-\[[^\]]*translate[^\]]*\]/);
    // Tailwind v4 emits these as their OWN properties, not inside `transform`: a transition
    // naming only `transform` animates neither, and both the lift and the press would snap.
    expect(press).toMatch(/scale/);
  });

  it("presses at 0.97 and answers inside 160ms", () => {
    expect(press).toMatch(/active:scale-\[0\.97\]/);
    const ms = Number(press.match(/duration-(\d+)/)?.[1]);
    expect(ms).toBeLessThanOrEqual(160);
  });

  it("removes the movement under reduced motion, not merely the duration", () => {
    // The global reduced-motion block only collapses durations to 0.01ms, so an un-opted-out
    // scale still moves — instantly, which is worse.
    expect(press).toMatch(/motion-reduce:active:scale-100/);
    expect(group).toMatch(/motion-reduce:\[&:has\(button:active\)\]:scale-100/);
  });

  it("scales the GROUP for a segmented control, never the half", () => {
    expect(group).toMatch(/\[&:has\(button:active\)\]:scale-\[0\.97\]/);
    // Same value as the single-control press: one press, two mounting points.
    expect(group).toContain("scale-[0.97]");
    expect(group).toContain("duration-150");
  });

  it("is what <Button> itself is built from", () => {
    expect(button).toMatch(/const base = `[^`]*\$\{PRESS\}/);
  });
});

describe("hover states on a device that cannot hover", () => {
  // A :hover written by hand is not gated by anything: on a phone a tap fires it and it never
  // releases. Measured at 390 with touch emulation before this was fixed — a tapped card kept
  // `translate: 0 -4px` for the rest of the session, and its photograph stayed zoomed.
  // Tailwind v4 already wraps its own `hover:` variants, so only hand-written CSS is exposed.
  const HAND_WRITTEN_HOVERS = [".lift:hover", ".photo-zoom:hover img", ".rlt-price-chip:hover", ".rlt-map-dot:hover"];

  /** Is `selector` inside an @media (hover: hover) block? Walks the braces from the top. */
  const guarded = (selector: string) => {
    // At the start of a line, with any indent — a guarded rule is indented inside its @media.
    const at = css.search(new RegExp(`^[ \\t]*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s,{]`, "m"));
    if (at === -1) return null;
    let depth = 0;
    let inHoverQuery = false;
    let hoverDepth = -1;
    for (let i = 0; i < at; i++) {
      if (css[i] === "{") {
        depth++;
      } else if (css[i] === "}") {
        depth--;
        if (inHoverQuery && depth <= hoverDepth) inHoverQuery = false;
      } else if (css.startsWith("@media (hover: hover)", i)) {
        inHoverQuery = true;
        hoverDepth = depth;
      }
    }
    return inHoverQuery;
  };

  for (const sel of HAND_WRITTEN_HOVERS) {
    it(`${sel} only applies where hovering exists`, () => {
      const g = guarded(sel);
      expect(g, `${sel} is not in globals.css at all`).not.toBeNull();
      expect(g, `${sel} is not inside @media (hover: hover)`).toBe(true);
    });
  }

  it("keeps :focus-visible OUT of the hover query — a keyboard works on a phone too", () => {
    expect(guarded(".rlt-price-chip:focus-visible")).toBe(false);
    expect(guarded(".rlt-map-dot:focus-visible")).toBe(false);
  });

  it("keeps the press OUT of the hover query — a finger is the input that presses", () => {
    expect(guarded(".rlt-price-chip:active")).toBe(false);
    expect(guarded(".lift:active")).toBe(false);
  });
});

describe("map markers", () => {
  it("gives the pin a press, which round 30 could not ship", () => {
    expect(css).toMatch(/\.rlt-price-chip:active\s*\{/);
    expect(css).toMatch(/\.rlt-map-dot:active\s*\{/);
  });

  it("puts :active AFTER :hover so a hovered pin still answers a press", () => {
    expect(css.indexOf(".rlt-price-chip:active")).toBeGreaterThan(css.indexOf(".rlt-price-chip:hover"));
    expect(css.indexOf(".rlt-map-dot:active")).toBeGreaterThan(css.indexOf(".rlt-map-dot:hover"));
  });

  it("opens the preview from its own pin, not from nowhere", () => {
    expect(css).toMatch(/\.rlt-map-pop\s*\{[^}]*transform-origin:\s*var\(--pop-origin/);
    // Nothing real appears out of nothing — the entrance starts from a visible size.
    const kf = css.match(/@keyframes rlt-map-pop\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(kf).toMatch(/scale:\s*0\.9\d/);
    expect(kf).not.toMatch(/scale:\s*0;/);
  });
});
