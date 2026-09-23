import { describe, expect, it } from "vitest";
import { driftAdvance, driftSpeed, scrolledByHand } from "./drift";

describe("the drifting rail's speed", () => {
  it("is the marquee's: one set of cards in cards x seconds-per-card", () => {
    // Eight 340px cards and their gaps: 2,880px of set, 56 s, as the CSS animation had it
    // (--drift-duration = 8 x 7 s for -50% of a 5,760px doubled track).
    expect(driftSpeed(2880, 8, 7)).toBeCloseTo(2880 / 56, 9);
    // Four homes drift at the same speed as eight, not at the same tempo.
    expect(driftSpeed(1440, 4, 7)).toBeCloseTo(driftSpeed(2880, 8, 7), 9);
  });

  it("stands still when there is nothing to move", () => {
    expect(driftSpeed(0, 8, 7)).toBe(0);
    expect(driftSpeed(2880, 0, 7)).toBe(0);
    expect(driftSpeed(2880, 8, 0)).toBe(0);
  });
});

describe("advancing the rail", () => {
  it("moves by the step and never rounds it away", () => {
    // 51.4 px/s at 144 Hz is a third of a pixel a frame; the driver keeps the fraction.
    expect(driftAdvance(0, 0.357, 2880)).toBeCloseTo(0.357, 9);
    expect(driftAdvance(100.5, 0.357, 2880)).toBeCloseTo(100.857, 9);
  });

  it("wraps by exactly one set width, so the pixels before and after the wrap are the same", () => {
    expect(driftAdvance(2879.9, 0.4, 2880)).toBeCloseTo(0.3, 9);
    expect(driftAdvance(2880, 0, 2880)).toBe(0);
    // A long pause (a hidden tab) never overshoots past a whole set either.
    expect(driftAdvance(2000, 6000, 2880)).toBeCloseTo(2240, 9);
  });

  it("keeps a negative position inside the set too", () => {
    expect(driftAdvance(1, -3, 2880)).toBeCloseTo(2878, 9);
  });

  it("does not move at all without a set width", () => {
    expect(driftAdvance(12, 5, 0)).toBe(12);
    expect(driftAdvance(12, 5, -1)).toBe(12);
  });
});

describe("telling a person's scroll from the driver's own", () => {
  it("ignores the rounding a browser applies to what was written", () => {
    expect(scrolledByHand(100, 100.4)).toBe(false);
    expect(scrolledByHand(101, 100.4)).toBe(false);
  });

  it("notices a flick, a drag or a wheel", () => {
    expect(scrolledByHand(140, 100.4)).toBe(true);
    expect(scrolledByHand(0, 100.4)).toBe(true);
  });
});
