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
