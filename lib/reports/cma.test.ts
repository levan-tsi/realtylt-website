import { describe, expect, it } from "vitest";
import { clampCondition, estimateCma, median, percentile, usableComps } from "./cma";
import type { CmaAdjustments, Comp } from "./types";

function comp(id: string, price: number, sqft: number): Comp {
  return {
    id,
    address: `${id} Main St`,
    city: "Beacon",
    price,
    beds: 3,
    baths: 2,
    sqft,
    pricePerSqft: sqft > 0 ? price / sqft : 0,
    propertyType: "Residential",
    listOfficeName: "Test Realty",
  };
}

describe("percentile", () => {
  it("interpolates linearly", () => {
    expect(percentile([10, 20, 30, 40], 0.5)).toBe(25);
    expect(percentile([10, 20, 30, 40], 0.25)).toBeCloseTo(17.5, 5);
    expect(percentile([10, 20, 30, 40], 0.75)).toBeCloseTo(32.5, 5);
  });
  it("handles empty and singletons", () => {
    expect(percentile([], 0.5)).toBe(0);
    expect(percentile([42], 0.9)).toBe(42);
    expect(median([5, 1, 3])).toBe(3);
  });
});

describe("clampCondition", () => {
  it("bounds to ±15 and rounds", () => {
    expect(clampCondition(0)).toBe(0);
    expect(clampCondition(9.4)).toBe(9);
    expect(clampCondition(50)).toBe(15);
    expect(clampCondition(-99)).toBe(-15);
    expect(clampCondition(NaN)).toBe(0);
  });
});

describe("usableComps", () => {
  const comps = [comp("a", 400_000, 2000), comp("b", 600_000, 0), comp("c", 500_000, 2500)];
  it("keeps only comps with a usable $/sqft", () => {
    expect(usableComps(comps, { conditionPct: 0 }).map((c) => c.id)).toEqual(["a", "c"]);
  });
  it("respects an explicit inclusion set", () => {
    const adj: CmaAdjustments = { conditionPct: 0, includedIds: ["a"] };
    expect(usableComps(comps, adj).map((c) => c.id)).toEqual(["a"]);
  });
});

describe("estimateCma", () => {
  // Three comps at $200, $250, $300 /sqft → median 250, p25 225, p75 275.
  const comps = [comp("a", 400_000, 2000), comp("b", 500_000, 2000), comp("c", 600_000, 2000)];

  it("prices from median $/sqft × subject sqft", () => {
    const e = estimateCma(2000, comps, { conditionPct: 0 });
    expect(e.insufficient).toBe(false);
    expect(e.compCount).toBe(3);
    expect(e.medianPricePerSqft).toBe(250);
    expect(e.mid).toBe(500_000); // 250 × 2000
    expect(e.low).toBe(450_000); // 225 × 2000
    expect(e.high).toBe(550_000); // 275 × 2000
  });

  it("applies the condition nudge multiplicatively", () => {
    const e = estimateCma(2000, comps, { conditionPct: 10 });
    expect(e.mid).toBe(550_000); // 500k × 1.10
  });

  it("flags insufficient data with <2 comps or no sqft", () => {
    expect(estimateCma(2000, [comp("a", 400_000, 2000)], { conditionPct: 0 }).insufficient).toBe(true);
    expect(estimateCma(0, comps, { conditionPct: 0 }).insufficient).toBe(true);
  });

  it("rounds to the nearest $1,000", () => {
    const odd = [comp("a", 401_111, 2000), comp("b", 502_777, 2000)];
    const e = estimateCma(2000, odd, { conditionPct: 0 });
    expect(e.mid % 1000).toBe(0);
  });
});
