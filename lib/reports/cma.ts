/** Pure CMA math — runs identically on the server (initial generation) and in the browser
 * (live recalculation as the client toggles comps / nudges condition). No I/O, no deps
 * beyond the shared types, so it is trivially unit-testable and safe to import anywhere.
 *
 * The snapshot holds ACTIVE listings only (MLS Grid is a replication feed, no solds), so
 * the estimate is honestly an ASKING-price analysis of comparable homes on the market —
 * the UI labels it as such. The agent's CRM CMA (with solds) remains the authoritative one. */

import type { CmaAdjustments, CmaEstimate, Comp } from "./types";

/** Linear-interpolated percentile of a numeric sample (p in [0,1]). */
export function percentile(values: number[], p: number): number {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return 0;
  if (xs.length === 1) return xs[0];
  const idx = (xs.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return xs[lo];
  return xs[lo] + (xs[hi] - xs[lo]) * (idx - lo);
}

export const median = (values: number[]) => percentile(values, 0.5);

/** Round to the nearest $1,000 — valuations are ranges, not to-the-dollar figures. */
const roundK = (n: number) => Math.round(n / 1000) * 1000;

/** The comps that actually count toward an estimate: included by the client's selection
 * (default all) AND carrying a usable $/sqft (both price and sqft present). */
export function usableComps(comps: Comp[], adjustments: CmaAdjustments): Comp[] {
  const included =
    adjustments.includedIds && adjustments.includedIds.length > 0
      ? comps.filter((c) => adjustments.includedIds!.includes(c.id))
      : comps;
  return included.filter((c) => c.pricePerSqft > 0);
}

/**
 * Estimate the subject's value from comparable $/sqft.
 *  mid  = median comp $/sqft × subject sqft × condition factor
 *  low  = 25th-percentile $/sqft × … ;  high = 75th-percentile $/sqft × …
 * Needs ≥2 usable comps and a subject sqft > 0, else `insufficient`.
 */
export function estimateCma(
  subjectSqft: number,
  comps: Comp[],
  adjustments: CmaAdjustments,
): CmaEstimate {
  const used = usableComps(comps, adjustments);
  const ppsf = used.map((c) => c.pricePerSqft);
  const medPpsf = median(ppsf);

  if (used.length < 2 || subjectSqft <= 0 || medPpsf <= 0) {
    return {
      insufficient: true,
      compCount: used.length,
      medianPricePerSqft: Math.round(medPpsf),
      low: 0,
      mid: 0,
      high: 0,
    };
  }

  const factor = 1 + clampCondition(adjustments.conditionPct) / 100;
  const lowPpsf = percentile(ppsf, 0.25);
  const highPpsf = percentile(ppsf, 0.75);

  return {
    insufficient: false,
    compCount: used.length,
    medianPricePerSqft: Math.round(medPpsf),
    low: roundK(lowPpsf * subjectSqft * factor),
    mid: roundK(medPpsf * subjectSqft * factor),
    high: roundK(highPpsf * subjectSqft * factor),
  };
}

/** Condition nudge is bounded to ±15% so the estimate can't be pushed to nonsense. */
export function clampCondition(pct: number): number {
  if (!Number.isFinite(pct)) return 0;
  return Math.max(-15, Math.min(15, Math.round(pct)));
}
