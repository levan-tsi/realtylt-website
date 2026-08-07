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
  /** Private mortgage insurance — only non-zero when the down payment is under 20%. */
  pmi: number;
  hoa: number;
  insurance: number;
  /** Share of the monthly total, in percent; all zeros when total is 0. */
  breakdownPct: {
    principalInterest: number;
    tax: number;
    pmi: number;
    hoa: number;
    insurance: number;
  };
}

// PMI: $55 per $100k financed, per month, while the down payment is under 20% (live spec).
const PMI_PER_100K = 55;
// NY-style tax estimate when the tax field is left empty: 85% assessed, $9 per $1,000/yr.
const NY_ASSESSED_RATIO = 0.85;
const NY_TAX_PER_1000 = 9;

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

/** ── The budget → price bridge (round 23, /plan) ────────────────────────────────────────
 * Zillow's Plan asks for your finances and answers through its lender; ours inverts the
 * question with what it already knows: given the monthly payment someone is comfortable
 * with, what price can they shop at? Inverted by BINARY SEARCH over calcMortgage itself —
 * one source of truth, so the bridge can never drift from the calculator on /financing.
 * `annualTax: NaN` keeps calcMortgage's NY-style estimate scaling with the price, which is
 * exactly right here (nobody knows the taxes of a home they haven't found yet).
 * Monotonic in price for any sane inputs, so the search converges; answers are floored to
 * $5k so the number reads like a budget, not an actuarial table. */
export function priceForMonthly(
  monthlyBudget: number,
  a: { downPct: number; ratePct: number; termYears: number; monthlyHoa?: number; monthlyInsurance?: number },
): number {
  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) return 0;
  const at = (price: number) =>
    calcMortgage({
      price,
      annualTax: NaN,
      termYears: a.termYears,
      downPct: a.downPct,
      ratePct: a.ratePct,
      monthlyHoa: a.monthlyHoa ?? 0,
      monthlyInsurance: a.monthlyInsurance ?? 0,
    }).monthlyTotal;
  if (at(0) > monthlyBudget) return 0; // fixed costs alone exceed the budget
  let lo = 0;
  let hi = 10_000_000;
  if (at(hi) <= monthlyBudget) return hi; // budget beyond the ladder's top — cap, honestly rare
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) <= monthlyBudget) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo / 5_000) * 5_000;
}

export function calcMortgage(input: MortgageInput): MortgageResult {
  const { price, annualTax, termYears, downPct, ratePct, monthlyHoa, monthlyInsurance } = input;

  const loan = price * (1 - downPct / 100);
  const n = termYears * 12;
  const r = ratePct / 1200;

  // P&I = L·r / (1 − (1+r)^−n); straight-line when rate is zero
  const principalInterest = n <= 0 || loan <= 0 ? 0 : r === 0 ? loan / n : (loan * r) / (1 - (1 + r) ** -n);

  // Taxes: annual/12. When the tax field is EMPTY (NaN) fall back to a NY-style estimate
  // (85% assessed value, $9 per $1,000 assessed, per year). An explicit 0 stays 0.
  const monthlyTax = Number.isFinite(annualTax)
    ? annualTax / 12
    : Number.isFinite(price)
      ? ((price * NY_ASSESSED_RATIO) / 1000) * NY_TAX_PER_1000 / 12
      : NaN;

  // PMI only applies while the down payment is under 20%, at $55 per $100k financed.
  const pmi =
    Number.isFinite(loan) && loan > 0 && Number.isFinite(downPct) && downPct < 20
      ? PMI_PER_100K * (loan / 100_000)
      : 0;

  const monthlyTotal = principalInterest + monthlyTax + pmi + monthlyHoa + monthlyInsurance;

  const pct = (part: number) => (monthlyTotal === 0 ? 0 : (part / monthlyTotal) * 100);

  return {
    monthlyTotal,
    principalInterest,
    monthlyTax,
    pmi,
    hoa: monthlyHoa,
    insurance: monthlyInsurance,
    breakdownPct: {
      principalInterest: pct(principalInterest),
      tax: pct(monthlyTax),
      pmi: pct(pmi),
      hoa: pct(monthlyHoa),
      insurance: pct(monthlyInsurance),
    },
  };
}
