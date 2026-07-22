/** Pure mortgage calculator — brief §5C. No external services. */

export interface MortgageInput {
  price: number;
  annualTax: number;
  termYears: number;
  downPct: number;
  ratePct: number;
  monthlyHoa: number;
  monthlyInsurance: number;
}

export interface MortgageResult {
  monthlyTotal: number;
  principalInterest: number;
  monthlyTax: number;
  hoa: number;
  insurance: number;
  /** Share of the monthly total, in percent; all zeros when total is 0. */
  breakdownPct: {
    principalInterest: number;
    tax: number;
    hoa: number;
    insurance: number;
  };
}

/** ── Donut chart geometry ──────────────────────────────────────────────────────────────
 * Turn a list of breakdown percentages into stroke-dash arcs for the payment donut. Each
 * arc's `dash` is its share of the ring circumference and `offset` advances the start point
 * clockwise. Pure so the donut is provably driven by the SAME breakdown the rows show. */
export interface DonutArc {
  dash: number;
  offset: number;
}

export function donutArcs(pcts: number[], circumference: number): DonutArc[] {
  let acc = 0;
  return pcts.map((pct) => {
    const p = Number.isFinite(pct) && pct > 0 ? pct : 0;
    const dash = (p / 100) * circumference;
    const arc = { dash, offset: -acc };
    acc += dash;
    return arc;
  });
}

/** ── Representative term rates ──────────────────────────────────────────────────────────
 * We have no live rate feed, so the "Representative rates" strip is derived from the
 * calculator's own editable rate (the source of truth = the 30-year term). Shorter terms
 * carry the usual small discount. Clicking a term seeds the calculator with {termYears, rate}. */
export const REP_RATE_SPREADS: Record<number, number> = { 30: 0, 20: -0.25, 15: -0.5 };
export const REP_RATE_TERMS = [30, 20, 15] as const;

export function representativeRate(baseRate: number, termYears: number): number {
  const spread = REP_RATE_SPREADS[termYears] ?? 0;
  const base = Number.isFinite(baseRate) ? baseRate : 6;
  return Math.max(0, Math.round((base + spread) * 100) / 100);
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const { price, annualTax, termYears, downPct, ratePct, monthlyHoa, monthlyInsurance } = input;

  const loan = price * (1 - downPct / 100);
  const n = termYears * 12;
  const r = ratePct / 1200;

  // P&I = L·r / (1 − (1+r)^−n); straight-line when rate is zero
  const principalInterest = n <= 0 || loan <= 0 ? 0 : r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);

  const monthlyTax = annualTax / 12;
  const monthlyTotal = principalInterest + monthlyTax + monthlyHoa + monthlyInsurance;

  const pct = (part: number) => (monthlyTotal === 0 ? 0 : (part / monthlyTotal) * 100);

  return {
    monthlyTotal,
    principalInterest,
    monthlyTax,
    hoa: monthlyHoa,
    insurance: monthlyInsurance,
    breakdownPct: {
      principalInterest: pct(principalInterest),
      tax: pct(monthlyTax),
      hoa: pct(monthlyHoa),
      insurance: pct(monthlyInsurance),
    },
  };
}
