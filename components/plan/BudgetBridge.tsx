"use client";

import { useState } from "react";
import Link from "next/link";
import { priceForMonthly } from "@/lib/mortgage";

/** The /plan signature: start from the payment, not the price. Zillow's Plan asks for your
 * finances and answers through its lender; this answers immediately, asks for nothing, and
 * hands the number straight to the search. The inversion runs through calcMortgage itself
 * (priceForMonthly — binary search), so this can never drift from the /financing calculator.
 *
 * Same two-panel language as the calculator (ink inputs, mist answer) so the two read as one
 * instrument family; the ANSWER is the loud thing here, set in the display face. */

const DOWN_OPTS = [5, 10, 15, 20, 30];

export function BudgetBridge() {
  const [monthly, setMonthly] = useState(3200);
  const [downPct, setDownPct] = useState(20);
  const [ratePct, setRatePct] = useState(6);

  const price = priceForMonthly(monthly, { downPct, ratePct, termYears: 30 });
  const priceLabel =
    price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M` : `$${Math.round(price / 1000)}K`;

  return (
    <div className="grid overflow-hidden rounded-3xl lg:grid-cols-[1fr_1.15fr]">
      {/* Inputs — the calculator's ink panel, three questions only. */}
      <div className="bg-ink p-6 text-paper md:p-10">
        <h2 className="text-2xl font-bold uppercase tracking-wide">What feels comfortable each month?</h2>
        <p className="mt-3 max-w-md t-small leading-relaxed text-paper/70">
          Start from the payment, not the price. We turn your monthly number into a price range
          you can shop with today. Nothing to sign up for, nothing saved.
        </p>
        <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-3">
          <div>
            <label htmlFor="plan-monthly" className="mb-1 block text-xs font-bold text-paper">
              Monthly budget ($)
            </label>
            <input
              id="plan-monthly"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={Number.isNaN(monthly) ? "" : monthly}
              onChange={(e) => setMonthly(e.target.value === "" ? NaN : Number(e.target.value))}
              className="w-full border-0 border-b border-paper/40 bg-transparent px-0 py-1.5 text-sm text-paper transition-colors focus:border-paper focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="plan-down" className="mb-1 block text-xs font-bold text-paper">
              Down payment
            </label>
            <select
              id="plan-down"
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full cursor-pointer border-0 border-b border-paper/40 bg-transparent px-0 py-1.5 text-sm text-paper transition-colors focus:border-paper focus:outline-none [&>option]:text-ink"
            >
              {DOWN_OPTS.map((d) => (
                <option key={d} value={d}>
                  {d}%
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plan-rate" className="mb-1 block text-xs font-bold text-paper">
              Interest rate (%)
            </label>
            <input
              id="plan-rate"
              type="number"
              inputMode="decimal"
              min={1}
              max={10}
              step={0.125}
              value={Number.isNaN(ratePct) ? "" : ratePct}
              onChange={(e) => setRatePct(e.target.value === "" ? NaN : Number(e.target.value))}
              className="w-full border-0 border-b border-paper/40 bg-transparent px-0 py-1.5 text-sm text-paper transition-colors focus:border-paper focus:outline-none"
            />
          </div>
        </div>
        <p className="mt-6 max-w-md t-fine leading-relaxed text-paper/60">
          Assumes a 30-year loan and NY-style property taxes that scale with the price. Under 20%
          down, mortgage insurance is counted automatically. Your lender&rsquo;s exact numbers
          will vary; the range is for shopping, not for underwriting.
        </p>
      </div>

      {/* The answer — the page's one loud thing. aria-live so the number reads out as it moves. */}
      <div className="flex flex-col items-center justify-center bg-mist p-8 text-center md:p-12" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">You can shop up to about</p>
        <p className="font-display mt-3 text-6xl font-light tracking-tight text-ink md:text-7xl">
          {price > 0 ? `$${price.toLocaleString("en-US")}` : "$0"}
        </p>
        {price > 0 ? (
          <Link
            href={`/search?priceMax=${price}`}
            className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
          >
            See homes under {priceLabel}
          </Link>
        ) : (
          <p className="mt-6 max-w-xs t-small text-stone">
            Raise the monthly number a little and a price range will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
