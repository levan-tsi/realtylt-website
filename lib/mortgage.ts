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
