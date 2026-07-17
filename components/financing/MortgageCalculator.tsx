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

export function MortgageCalculator({ initial }: { initial?: Partial<MortgageInput> } = {}) {
  const seeded = { ...DEFAULTS, ...initial };
  const [values, setValues] = useState<MortgageInput>(seeded);
  const r = calcMortgage(values);

  /* Live: monochrome breakdown — black principal, graduating grays. */
  const rows = [
    { label: "Principal & interest", amount: r.principalInterest, pct: r.breakdownPct.principalInterest, color: "bg-ink" },
    { label: "Taxes", amount: r.monthlyTax, pct: r.breakdownPct.tax, color: "bg-[#555555]" },
    { label: "HOA", amount: r.hoa, pct: r.breakdownPct.hoa, color: "bg-[#999999]" },
    { label: "Insurance", amount: r.insurance, pct: r.breakdownPct.insurance, color: "bg-[#cccccc]" },
  ];

  return (
    <div className="grid gap-0 overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      {/* Inputs — live: black panel, underline inputs */}
      <div className="bg-ink p-6 text-paper md:p-10">
        <h2 id="calc-heading" className="text-2xl font-bold uppercase tracking-wide">
          Estimate Your Monthly Payment
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-paper/70">
          Estimate your mortgage payment, including the principal and interest, taxes, insurance,
          HOA, and Private Mortgage Insurance.
        </p>
        <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label
                htmlFor={`calc-${f.key}`}
                className="mb-1 block text-xs font-bold text-paper"
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
                className="w-full border-0 border-b border-paper/40 bg-transparent px-0 py-1.5 text-sm text-paper transition-colors focus:border-paper focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setValues(seeded)}
          className="mt-6 inline-flex min-h-6 items-center gap-2 py-1 text-xs font-bold uppercase tracking-[0.14em] text-paper/80 transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>

      {/* Output — live: light panel, centered total, dark bar, monochrome rows */}
      <div className="flex flex-col justify-center bg-mist p-6 md:p-10" aria-live="polite">
        <p className="text-center text-4xl font-light tracking-tight text-ink md:text-5xl">
          {Number.isFinite(r.monthlyTotal) ? money(r.monthlyTotal) : "—"}
        </p>
        <p className="mt-2 text-center text-sm text-stone">Estimated Monthly Payment</p>

        {/* Stacked breakdown bar */}
        <div className="mt-7 flex h-3 overflow-hidden rounded-full bg-[#d9dde2]" aria-hidden>
          {rows.map(
            (row) =>
              row.pct > 0 && (
                <div key={row.label} className={`${row.color} h-full`} style={{ width: `${row.pct}%` }} />
              ),
          )}
        </div>

        <dl className="mt-6 space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-stone">
                <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                {row.label}
              </dt>
              <dd className="text-ink">
                {Number.isFinite(row.amount) ? money(row.amount) : "—"}{" "}
                <span className="text-stone">
                  ({Number.isFinite(row.pct) ? row.pct.toFixed(1) : "0"}%)
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 border-t border-[#d9dde2] pt-4 text-xs leading-relaxed text-stone">
          Estimate only. Your lender's numbers will vary with credit, points, and insurance.
        </p>
      </div>
    </div>
  );
}
