import { describe, expect, it } from "vitest";
import { calcMortgage, donutArcs, representativeRate } from "./mortgage";

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
    // 0% down -> PMI applies: 55 * (360000 / 100000) = 198
    expect(r.pmi).toBeCloseTo(198, 2);
    expect(r.monthlyTotal).toBeCloseTo(1198, 2);
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
    const { principalInterest, tax, pmi, hoa, insurance } = r.breakdownPct;
    expect(principalInterest + tax + pmi + hoa + insurance).toBeCloseTo(100, 5);
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

/** PMI + NY-style empty-tax fallback (round-6 financing reconcile — live behavior spec). */
describe("calcMortgage — PMI (down payment under 20%)", () => {
  const base = { price: 500_000, annualTax: 6_000, termYears: 30, downPct: 10, ratePct: 6, monthlyHoa: 0, monthlyInsurance: 0 } as const;

  it("charges $55 per $100k financed per month when down < 20%", () => {
    // 10% down on $500k -> $450k financed -> 55 * 4.5 = $247.50
    const r = calcMortgage(base);
    expect(r.pmi).toBeCloseTo(247.5, 2);
    expect(r.monthlyTotal).toBeCloseTo(r.principalInterest + r.monthlyTax + r.pmi, 2);
  });

  it("is exactly 0 at 20% down (row/segment hidden)", () => {
    expect(calcMortgage({ ...base, downPct: 20 }).pmi).toBe(0);
  });

  it("is 0 for 20%+ down and never negative for huge down payments", () => {
    expect(calcMortgage({ ...base, downPct: 35 }).pmi).toBe(0);
    expect(calcMortgage({ ...base, downPct: 150 }).pmi).toBe(0);
  });
});

describe("calcMortgage — NY-style empty-tax fallback", () => {
  const base = { price: 500_000, termYears: 30, downPct: 20, ratePct: 6, monthlyHoa: 0, monthlyInsurance: 0 } as const;

  it("estimates tax when the field is EMPTY (NaN): 85% assessed, $9 per $1,000/yr", () => {
    // (500000 * 0.85 / 1000 * 9) / 12 = 3825 / 12 = 318.75
    const r = calcMortgage({ ...base, annualTax: NaN });
    expect(r.monthlyTax).toBeCloseTo(318.75, 2);
  });

  it("uses an explicit annual tax verbatim (no fallback), and 0 stays 0", () => {
    expect(calcMortgage({ ...base, annualTax: 9_600 }).monthlyTax).toBeCloseTo(800, 2);
    expect(calcMortgage({ ...base, annualTax: 0 }).monthlyTax).toBe(0);
  });

  it("does not throw and yields NaN tax when BOTH price and tax are empty", () => {
    const r = calcMortgage({ ...base, price: NaN, annualTax: NaN });
    expect(Number.isFinite(r.monthlyTax)).toBe(false);
  });
});

/** The payment donut is driven by the SAME breakdown percentages the rows list — donutArcs
 * turns those pcts into ring arcs, so proving the arcs track the pcts proves donut == rows. */
describe("donutArcs (payment donut == breakdown rows)", () => {
  const C = 2 * Math.PI * 54;

  it("each arc's dash is its pct share of the circumference, offsets accumulate", () => {
    const arcs = donutArcs([40, 60], 100);
    expect(arcs[0]).toEqual({ dash: 40, offset: -0 });
    expect(arcs[1]).toEqual({ dash: 60, offset: -40 });
  });

  it("uses the exact calcMortgage breakdown percentages", () => {
    const r = calcMortgage({
      price: 400_000, annualTax: 6_000, termYears: 30, downPct: 10, ratePct: 6.5, monthlyHoa: 100, monthlyInsurance: 90,
    });
    const pcts = [r.breakdownPct.principalInterest, r.breakdownPct.tax, r.breakdownPct.pmi, r.breakdownPct.hoa, r.breakdownPct.insurance];
    const arcs = donutArcs(pcts, C);
    // Dash length of each arc reflects its exact share of the ring.
    arcs.forEach((a, i) => expect(a.dash).toBeCloseTo((pcts[i] / 100) * C, 6));
    // Full breakdown (~100%) fills the whole ring.
    const total = arcs.reduce((s, a) => s + a.dash, 0);
    expect(total).toBeCloseTo(C, 4);
  });

  it("ignores non-positive / non-finite pcts (no negative dash, no NaN)", () => {
    const arcs = donutArcs([0, NaN, 25], 100);
    expect(arcs[0].dash).toBe(0);
    expect(arcs[1].dash).toBe(0);
    expect(arcs[2].dash).toBe(25);
  });
});

/** Clicking a rate-strip term seeds the calculator with {termYears, representativeRate}. */
describe("representativeRate (term-seeding)", () => {
  it("30-year term uses the calculator's rate verbatim (source of truth)", () => {
    expect(representativeRate(6.5, 30)).toBe(6.5);
  });
  it("shorter terms carry the usual small discount", () => {
    expect(representativeRate(6.5, 20)).toBe(6.25);
    expect(representativeRate(6.5, 15)).toBe(6.0);
  });
  it("falls back to a sane base and never goes negative", () => {
    expect(representativeRate(NaN, 30)).toBe(6);
    expect(representativeRate(0.1, 15)).toBe(0);
  });
});
