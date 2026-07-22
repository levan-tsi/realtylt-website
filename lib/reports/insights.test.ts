import { describe, expect, it } from "vitest";
import { computeInsights, pickAreaInsights, MIN_CITY_ACTIVES, type InsightRow } from "./insights";

const DAY = 86_400_000;
const NOW = Date.parse("2026-07-22T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW - n * DAY).toISOString();

describe("computeInsights", () => {
  it("aggregates count, new-in-30-days, average price and average DOM", () => {
    const rows: InsightRow[] = [
      { price: 400_000, listedAt: daysAgo(5) },
      { price: 600_000, listedAt: daysAgo(20) },
      { price: 800_000, listedAt: daysAgo(90) },
    ];
    const r = computeInsights(rows, NOW);
    expect(r.activeCount).toBe(3);
    expect(r.newLast30).toBe(2); // 5 and 20 days ago; 90 is outside
    expect(r.avgPrice).toBe(600_000);
    expect(r.avgDom).toBe(Math.round((5 + 20 + 90) / 3)); // 38
  });

  it("clamps future-dated listings to 0 DOM and still counts them as new", () => {
    const rows: InsightRow[] = [
      { price: 500_000, listedAt: daysAgo(-3) }, // 3 days in the future
      { price: 500_000, listedAt: daysAgo(10) },
    ];
    const r = computeInsights(rows, NOW);
    expect(r.newLast30).toBe(2);
    expect(r.avgDom).toBe(Math.round((0 + 10) / 2)); // 5
  });

  it("empty set yields zeros, never NaN", () => {
    const r = computeInsights([], NOW);
    expect(r).toEqual({ activeCount: 0, newLast30: 0, avgPrice: 0, avgDom: 0 });
  });
});

describe("pickAreaInsights (city → county fallback under MIN_CITY_ACTIVES)", () => {
  const cityRow = (): InsightRow => ({ price: 500_000, listedAt: daysAgo(10) });

  it("uses the city set when it has at least MIN_CITY_ACTIVES actives", () => {
    const cityRows = Array.from({ length: MIN_CITY_ACTIVES }, cityRow);
    const out = pickAreaInsights({
      city: "Rosedale", countyName: "Queens", cityRows, countyRows: [], dataLastUpdated: "x", now: NOW,
    });
    expect(out.scope).toBe("city");
    expect(out.label).toBe("Rosedale, NY");
    expect(out.activeCount).toBe(MIN_CITY_ACTIVES);
  });

  it("falls back to the county set when the city has too few actives", () => {
    const cityRows = Array.from({ length: MIN_CITY_ACTIVES - 1 }, cityRow);
    const countyRows = Array.from({ length: 40 }, cityRow);
    const out = pickAreaInsights({
      city: "Tinytown", countyName: "Dutchess County", cityRows, countyRows, dataLastUpdated: "x", now: NOW,
    });
    expect(out.scope).toBe("county");
    expect(out.label).toBe("Dutchess County");
    expect(out.activeCount).toBe(40);
  });
});
