/** Price-banded selection for the home rails and the "mixed" search order.
 *
 * WHY (owner, 2026-08-02): "mix featured and new listings what they show, show balanced ratio of
 * high mid and average listings… few above 10-20m, few between 5-10m, 55% between 500k-5m… and
 * in search page as well, most of propertys when I filter is under a 1m, lets balance it out so
 * we show that we serve all the range."
 *
 * The inventory is genuinely bottom-heavy — measured over the six Hudson Valley counties:
 *
 *   under $500k  38.2%      $5M – $10M   0.9%
 *   $500k – $1M  39.9%      $10M – $20M  0.2%
 *   $1M – $5M    20.8%      $20M+        0.1%
 *
 * So a fair shuffle shows almost nothing above $1M, which is the complaint. A RAIL is an
 * editorial surface — a shop window — and deliberately spanning the range there is honest
 * curation, not a lie about what we hold: every card is a real listing, and the counts on
 * /search still report the truth.
 *
 * This is deliberately a pure function over rows the caller already fetched, so it can be
 * tested without a database and reused by both the rails and the search page's own ordering. */

export interface Priced {
  price: number;
}

/** The bands, cheapest first. `share` is how many of a selection SHOULD come from each band
 * when supply allows; leftovers cascade down to the bands that actually have stock. */
export const PRICE_BANDS: ReadonlyArray<{ label: string; min: number; max: number; share: number }> = [
  { label: "under $500k", min: 0, max: 500_000, share: 0.2 },
  { label: "$500k–$1M", min: 500_000, max: 1_000_000, share: 0.3 },
  { label: "$1M–$5M", min: 1_000_000, max: 5_000_000, share: 0.25 },
  { label: "$5M–$10M", min: 5_000_000, max: 10_000_000, share: 0.15 },
  { label: "$10M+", min: 10_000_000, max: Infinity, share: 0.1 },
];

export function bandOf(price: number): number {
  for (let i = 0; i < PRICE_BANDS.length; i++) {
    if (price >= PRICE_BANDS[i].min && price < PRICE_BANDS[i].max) return i;
  }
  return PRICE_BANDS.length - 1;
}

/** Pick `limit` rows spanning the price bands, preserving each band's incoming order (so a
 * newest-first pool still yields the newest within each band).
 *
 * Guarantees, in this order:
 *  1. Never invents or duplicates a row — the result is always a subset of `rows`.
 *  2. Never returns fewer than `min(limit, rows.length)`: a band with no stock hands its slots
 *     to the bands that have some, so a thin luxury market cannot leave holes in the rail.
 *  3. Prefers to fill the expensive bands first, because they are the scarce ones — filling
 *     cheap bands first would consume the budget before ever reaching a $10M home. */
export function pickPriceSpread<T extends Priced>(rows: readonly T[], limit: number): T[] {
  if (limit <= 0 || !rows.length) return [];
  const buckets: T[][] = PRICE_BANDS.map(() => []);
  for (const r of rows) buckets[bandOf(r.price)].push(r);

  // EVERY BAND THAT HAS STOCK GETS ONE SLOT FIRST, then the rest is shared out by `share`.
  // Doing it purely proportionally does not work at rail sizes: floor(8 × 0.1) is 0, so the
  // $10M+ band — the exact band the owner asked to see — was allotted nothing on an 8-card
  // rail. Spread is the entire point of this function, so it is guaranteed before proportion.
  const picked: T[] = [];
  const nonEmpty = buckets.map((b, i) => (b.length ? i : -1)).filter((i) => i >= 0);
  // Expensive bands first throughout: they are the scarce ones, and a cheap band will always
  // still have stock left when the backfill comes round.
  for (const i of [...nonEmpty].reverse()) {
    if (picked.length >= limit) break;
    picked.push(...buckets[i].splice(0, 1));
  }
  const remaining = limit - picked.length;
  if (remaining > 0) {
    const quota = PRICE_BANDS.map((b) => Math.floor(remaining * b.share));
    for (let i = PRICE_BANDS.length - 1; i >= 0; i--) {
      picked.push(...buckets[i].splice(0, quota[i]));
    }
  }
  // Backfill whatever the quotas left unspent, cheapest-band-first so the rail leans toward
  // what most visitors are actually shopping for.
  for (let i = 0; picked.length < limit && i < buckets.length; i++) {
    picked.push(...buckets[i].splice(0, limit - picked.length));
  }
  // Return in the caller's original order — the spread decides WHICH rows, never their order,
  // so a newest-first rail still reads newest-first.
  const chosen = new Set(picked);
  return rows.filter((r) => chosen.has(r)).slice(0, limit);
}

/** Reorder a page so consecutive cards do not all come from the same band — the "mixed" sort's
 * actual promise. Same rows in, same rows out: this NEVER drops or adds a listing, so the
 * page's count, its pagination and its map pins stay exactly as they were. */
export function interleaveByBand<T extends Priced>(rows: readonly T[]): T[] {
  const buckets: T[][] = PRICE_BANDS.map(() => []);
  for (const r of rows) buckets[bandOf(r.price)].push(r);
  const out: T[] = [];
  // Round-robin from the most expensive band down, so a page opens on range rather than on
  // fifteen consecutive starter homes.
  for (let n = 0; out.length < rows.length; n++) {
    let moved = false;
    for (let i = buckets.length - 1; i >= 0; i--) {
      const row = buckets[i][n];
      if (row) {
        out.push(row);
        moved = true;
      }
    }
    if (!moved) break; // every bucket exhausted
  }
  return out;
}
