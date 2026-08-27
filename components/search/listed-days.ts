import { LISTED_MAX_DAYS } from "@/lib/idx/query";

/** Days on market — a RANGE, in the panel's own min→max grammar, because the owner could
 * not ask the one question he wanted: "I wanted to filter properties that was listed 3-6
 * months ago and it was only up to 3 months." As a single ceiling this control could say
 * "listed within 3 months" and nothing else — never "at least 3 months ago", never past 90
 * days at all. Measured on the live table 2026-08-26: 8,971 of 15,254 Active for-sale
 * listings are inside 90 days, so 6,283 homes sat outside every setting this control had.
 * Both ends share this ladder, so 3 months → 6 months is exactly the window he asked for.
 * The top rung IS the parser's cap, imported rather than repeated. */
export const LISTED_DAY_OPTS = [1, 3, 7, 14, 30, 90, 180, LISTED_MAX_DAYS];

/** A hand-typed URL day count lands on the rung the select can show.
 *
 * The server honours ANY positive value, clamped to LISTED_MAX_DAYS (listedBound clamps, it
 * does not drop), so ?listedDays=100 really filters to 100 days. The old client treated
 * off-ladder as "" — the select read "No max" over a filtered result set, and the first touch
 * of any control silently repainted a broader one. Nearest rung is the closest thing the
 * select can say to what the server did; a tie snaps down, the broader reading. */
export function snapListedDays(v: string | null): string {
  const d = Number(v);
  if (!v || !Number.isFinite(d) || d <= 0) return "";
  let best = LISTED_DAY_OPTS[0];
  for (const n of LISTED_DAY_OPTS) if (Math.abs(n - d) < Math.abs(best - d)) best = n;
  return String(best);
}
