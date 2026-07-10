"use client";

import { useState } from "react";
import { calcMortgage, type MortgageInput } from "@/lib/mortgage";

/** Mortgage calculator UI (brief §5C) — live math via lib/mortgage, Reset button.
 * Defaults reproduce the live site's worked example: $3,198.20. */

const DEFAULTS: MortgageInput = {
  price: 500_000,
  annualTax: 6_000,
  termYears: 30,
  downPct: 20,
  ratePct: 6,
  monthlyHoa: 100,
  monthlyInsurance: 200,
};

const FIELDS: { key: keyof MortgageInput; label: string; step?: number; max?: number }[] = [
  { key: "price", label: "Price ($)" },
  { key: "annualTax", label: "Annual tax ($)" },
  { key: "termYears", label: "Loan term (years)", max: 50 },
  { key: "downPct", label: "Down payment (%)", step: 0.5, max: 100 },
  { key: "ratePct", label: "Interest rate (%)", step: 0.125, max: 25 },
  { key: "monthlyHoa", label: "Monthly HOA ($)" },
  { key: "monthlyInsurance", label: "Monthly insurance ($)" },
];

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function MortgageCalculator() {
  const [values, setValues] = useState<MortgageInput>(DEFAULTS);
  const r = calcMortgage(values);

  const rows = [
    { label: "Principal & interest", amount: r.principalInterest, pct: r.breakdownPct.principalInterest, color: "bg-porchlight" },
    { label: "Taxes", amount: r.monthlyTax, pct: r.breakdownPct.tax, color: "bg-river" },
    { label: "HOA", amount: r.hoa, pct: r.breakdownPct.hoa, color: "bg-stone" },
    { label: "Insurance", amount: r.insurance, pct: r.breakdownPct.insurance, color: "bg-paper/60" },
  ];

  return (
    <div className="grid gap-0 overflow-hidden rounded-[2px] border border-paper/15 lg:grid-cols-[1.1fr_1fr]">
      {/* Inputs */}
      <div className="bg-ink-soft p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label
                htmlFor={`calc-${f.key}`}
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-paper/60"
              >
                {f.label}
              </label>
              <input
                id={`calc-${f.key}`}
                type="number"
                inputMode="decimal"
                min={0}
                max={f.max}
                step={f.step ?? 1}
                value={Number.isNaN(values[f.key]) ? "" : values[f.key]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value === "" ? NaN : Number(e.target.value) }))
                }
                className="w-full rounded-[2px] border border-paper/25 bg-transparent px-3.5 py-2.5 font-mono text-sm text-paper transition-colors focus:border-paper/50 focus:outline-none focus:ring-2 focus:ring-porchlight/60"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setValues(DEFAULTS)}
          className="mt-6 inline-flex items-center gap-2 rounded-[2px] border border-paper/30 px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-porchlight"
        >
          <span aria-hidden>↺</span> Reset
        </button>
      </div>

      {/* Output */}
      <div className="flex flex-col justify-center bg-paper p-6 md:p-8" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone">
          Estimated monthly payment
        </p>
        <p className="mt-2 font-mono text-5xl font-semibold tracking-tight text-ink">
          {Number.isFinite(r.monthlyTotal) ? money(r.monthlyTotal) : "—"}
        </p>

        {/* Stacked breakdown bar */}
        <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-mist" aria-hidden>
          {rows.map(
            (row) =>
              row.pct > 0 && (
                <div key={row.label} className={`${row.color} h-full`} style={{ width: `${row.pct}%` }} />
              ),
          )}
        </div>

        <dl className="mt-5 space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-stone">
                <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                {row.label}
              </dt>
              <dd className="font-mono text-ink">
                {Number.isFinite(row.amount) ? money(row.amount) : "—"}{" "}
                <span className="text-stone">
                  ({Number.isFinite(row.pct) ? row.pct.toFixed(1) : "0"}%)
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 border-t border-ink/10 pt-4 text-xs leading-relaxed text-stone">
          Estimate only — your lender's numbers will vary with credit, points, and insurance.
        </p>
      </div>
    </div>
  );
}
