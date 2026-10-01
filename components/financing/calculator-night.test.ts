import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** Round 62: the payment breakdown was a black ladder written for a light panel; after the site went
 * dark (round 60) it drew an empty bar and invisible legend dots. The hue is a token now. */
const src = fs.readFileSync(path.join(import.meta.dirname, "MortgageCalculator.tsx"), "utf8");

describe("the payment breakdown on the night", () => {
  it("draws with a colour token, never a hard-coded black or grey", () => {
    expect(src).toContain('const INK = "var(--color-stone)";');
    expect(src).not.toMatch(/rgb\(0 0 0/);
    expect(src).not.toMatch(/stroke: "#/);
    expect(src).not.toContain("#d9dde2");
  });
});

describe("the breakdown's amounts as a column (round 65)", () => {
  it("sets each share in its own right-aligned slot, so the amounts' right edges line up", () => {
    expect(src).toContain('<dd className="flex items-baseline justify-end gap-1.5 text-ink">');
    expect(src).toContain('<span className="min-w-[3.75rem] text-right text-stone">');
  });
});
