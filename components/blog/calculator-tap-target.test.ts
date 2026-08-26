import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** THE CALCULATOR SLIDER IS THE ONE ELEMENT THE FLAGSHIP TEMPLATE ASKS A READER TO TOUCH, and
 * until Round I it was a 4-pixel tap target on every one of the twenty posts.
 *
 * The class was `h-1 w-full appearance-none rounded-full bg-[#dfe4ea]`, so the element box WAS
 * the hit area: 4px of ink and 4px of target. Measured by dragging rather than by reading the
 * CSS, at 390 DPR3 with touch, on two different posts:
 *
 *     input box 266x4    drag at dy=  0px : 50 -> 4350   GRABBED
 *                        drag at dy=-10px : 50 ->   50   MISSED
 *                        drag at dy= +8px : 50 ->   50   MISSED
 *
 * A finger's contact patch is roughly 34 CSS px and CLAUDE.md floors tap targets at 24px, so
 * this missed the house rule by a factor of six. After the fix the same probe reports 266x44
 * and GRABBED at every offset out to +/-12px, at 390 DPR3 and at 1440 with a mouse, with the
 * arrow keys still stepping the value.
 *
 * WHY THIS TEST READS THE SOURCE instead of rendering. The defect is geometric and jsdom has no
 * layout, so a rendered assertion here would be theatre: jsdom would report the same box for
 * `h-1` and `h-11`. The real proof is the drag probe, which is a browser job and lives in the
 * round log. What this file can do, cheaply and honestly, is hold the SHAPE of the fix in place
 * so it cannot be undone by somebody tidying the class list — which is exactly how a 4px target
 * shipped in the first place.
 *
 * It is deliberately three narrow assertions rather than a snapshot: a snapshot of a class
 * string fails on every unrelated edit and gets updated without being read, which is worse than
 * no test.
 */
const SRC = readFileSync(
  join(process.cwd(), "components/blog/scenes/primitives/Calculator.tsx"),
  "utf8",
);

const rangeInput = SRC.slice(SRC.indexOf('type="range"'));
const rangeClass = (rangeInput.match(/className="([^"]+)"/) ?? [])[1] ?? "";

describe("the calculator slider's tap target", () => {
  it("gives the range input a box at least 24px tall, which is CLAUDE.md's floor", () => {
    // Tailwind heights are in 0.25rem steps: h-11 is 44px, h-6 is the 24px floor.
    const h = rangeClass.match(/(?:^|\s)h-(\d+)(?:\s|$)/);
    expect(h, `no height class on the range input; class was "${rangeClass}"`).not.toBeNull();
    const px = Number(h![1]) * 4;
    expect(px, `range input is ${px}px tall, below the 24px tap-target floor`).toBeGreaterThanOrEqual(24);
  });

  it("keeps the 4px of ink on a separate element, so the target can grow without the track", () => {
    // The track is the aria-hidden span behind the input. If somebody moves the grey back onto
    // the input, the ink and the target become one box again and the fix is gone.
    expect(SRC).toContain('aria-hidden="true"');
    expect(SRC).toMatch(/absolute inset-0 rounded-full bg-\[#dfe4ea\]/);
    expect(rangeClass, "the range input must not paint the track itself").toContain("bg-transparent");
  });

  it("still centres the input on the track rather than pushing the layout around", () => {
    expect(rangeClass).toContain("top-1/2");
    expect(rangeClass).toContain("-translate-y-1/2");
    // The wrapper stays 4px so the flex row's baseline alignment does not move.
    expect(SRC).toMatch(/relative block h-1 w-full/);
  });
});
