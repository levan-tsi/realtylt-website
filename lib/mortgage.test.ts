import { describe, expect, it } from "vitest";
import { calcMortgage } from "./mortgage";

describe("calcMortgage", () => {
  it("matches the live-site worked example ($3,198.20 total)", () => {
    // Brivity financing page default: $500k, 20% down, 6%, 30yr, $9,600/yr tax
    const r = calcMortgage({
      price: 500_000,
      annualTax: 9_600,
      termYears: 30,
      downPct: 20,
      ratePct: 6,
      monthlyHoa: 0,
      monthlyInsurance: 0,
    });
    expect(r.principalInterest).toBeCloseTo(2398.2, 2);
    expect(r.monthlyTax).toBeCloseTo(800, 2);
    expect(r.monthlyTotal).toBeCloseTo(3198.2, 2);
  });

  it("adds HOA and insurance to the monthly total", () => {
    const r = calcMortgage({
      price: 500_000,
      annualTax: 9_600,
      termYears: 30,
      downPct: 20,
      ratePct: 6,
      monthlyHoa: 150,
      monthlyInsurance: 120,
    });
    expect(r.hoa).toBe(150);
    expect(r.insurance).toBe(120);
    expect(r.monthlyTotal).toBeCloseTo(3468.2, 2);
  });

  it("handles the zero-rate edge case (straight-line principal)", () => {
    const r = calcMortgage({
      price: 360_000,
      annualTax: 0,
      termYears: 30,
      downPct: 0,
      ratePct: 0,
      monthlyHoa: 0,
      monthlyInsurance: 0,
    });
    // 360,000 / 360 months
    expect(r.principalInterest).toBeCloseTo(1000, 2);
    expect(r.monthlyTotal).toBeCloseTo(1000, 2);
  });

  it("returns a percentage breakdown that sums to ~100", () => {
    const r = calcMortgage({
      price: 400_000,
      annualTax: 6_000,
      termYears: 30,
      downPct: 10,
      ratePct: 6.5,
      monthlyHoa: 100,
      monthlyInsurance: 90,
    });
    const { principalInterest, tax, hoa, insurance } = r.breakdownPct;
    expect(principalInterest + tax + hoa + insurance).toBeCloseTo(100, 5);
    expect(principalInterest).toBeGreaterThan(tax);
  });

  it("returns all-zero breakdown when total is zero (no divide-by-zero NaN)", () => {
    const r = calcMortgage({
      price: 0,
      annualTax: 0,
      termYears: 30,
      downPct: 0,
      ratePct: 6,
      monthlyHoa: 0,
      monthlyInsurance: 0,
    });
    expect(r.monthlyTotal).toBe(0);
    expect(r.breakdownPct.principalInterest).toBe(0);
    expect(Number.isNaN(r.breakdownPct.tax)).toBe(false);
  });

  it("respects the down payment percentage (100% down = no P&I)", () => {
    const r = calcMortgage({
      price: 500_000,
      annualTax: 12_000,
      termYears: 30,
      downPct: 100,
      ratePct: 6,
      monthlyHoa: 0,
      monthlyInsurance: 0,
    });
    expect(r.principalInterest).toBeCloseTo(0, 5);
    expect(r.monthlyTotal).toBeCloseTo(1000, 2);
  });
});

/** Garbage/edge inputs — the calculator UI feeds whatever the user types (including empty
 * fields → NaN, negatives, and absurd magnitudes) straight into calcMortgage. It must never
 * throw or leak an Infinity into arithmetic; the component renders any non-finite result as
 * an em dash, so we assert exactly what the guards guarantee here. */
describe("calcMortgage — garbage & edge inputs degrade sanely", () => {
  const base = {
    price: 500_000,
    annualTax: 6_000,
    termYears: 30,
    downPct: 20,
    ratePct: 6,
    monthlyHoa: 100,
    monthlyInsurance: 200,
  } as const;

  it("negative price clamps principal & interest to 0 (loan <= 0), total stays finite", () => {
    const r = calcMortgage({ ...base, price: -500_000 });
    expect(r.principalInterest).toBe(0);
    expect(Number.isFinite(r.monthlyTotal)).toBe(true);
  });

  it("down payment over 100% leaves no loan and no NaN", () => {
    const r = calcMortgage({ ...base, downPct: 150, annualTax: 0, monthlyHoa: 0, monthlyInsurance: 0 });
    expect(r.principalInterest).toBe(0);
    expect(Number.isFinite(r.monthlyTotal)).toBe(true);
  });

  it("zero term clamps principal & interest to 0 (n <= 0) — only the fixed costs remain", () => {
    const r = calcMortgage({ ...base, termYears: 0 });
    expect(r.principalInterest).toBe(0);
    // 6000/12 tax + 100 HOA + 200 insurance
    expect(r.monthlyTotal).toBeCloseTo(800, 5);
  });

  it("an empty field (NaN input) never throws — total is NaN, which the UI renders as '—'", () => {
    expect(() => calcMortgage({ ...base, price: NaN })).not.toThrow();
    const r = calcMortgage({ ...base, price: NaN });
    expect(Number.isFinite(r.monthlyTotal)).toBe(false);
    // all-NaN body must also survive without throwing
    expect(() =>
      calcMortgage({
        price: NaN,
        annualTax: NaN,
        termYears: NaN,
        downPct: NaN,
        ratePct: NaN,
        monthlyHoa: NaN,
        monthlyInsurance: NaN,
      }),
    ).not.toThrow();
  });

  it("absurdly large price stays finite (no overflow to Infinity at realistic magnitudes)", () => {
    const r = calcMortgage({ ...base, price: 1e9, annualTax: 1e6 });
    expect(Number.isFinite(r.monthlyTotal)).toBe(true);
  });

  it("negative interest rate degrades to a finite total (never NaN/Infinity)", () => {
    const r = calcMortgage({ ...base, ratePct: -3 });
    expect(Number.isFinite(r.principalInterest)).toBe(true);
    expect(Number.isFinite(r.monthlyTotal)).toBe(true);
  });
});
