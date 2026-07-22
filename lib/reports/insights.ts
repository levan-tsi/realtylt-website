/** Pure market-insight math for the listing detail page's "Market Insights" cards.
 *
 * Live realtylt.com shows three N/A cards (Current Listings / Average Price / Average Days
 * on Market) for the listing's city. We compute the real figures from the active idx_listings
 * set. Kept pure + I/O-free so the aggregation and the <5-active city→county fallback are
 * unit-testable; the DB fetch lives in lib/idx/db.ts (getAreaInsights). */

export interface InsightRow {
  price: number;
  /** ISO listed-at timestamp. */
  listedAt: string;
}

export interface AreaInsights {
  /** Which set the numbers describe — a city with enough actives, or its county fallback. */
  scope: "city" | "county";
  /** Human label for the set, e.g. "Bronx, NY" or "Dutchess County". */
  label: string;
  activeCount: number;
  /** Listings that came on market within the last 30 days. */
  newLast30: number;
  /** Mean list price of the set (whole dollars). */
  avgPrice: number;
  /** Mean days on market (clamped ≥ 0; future-dated listings count as 0). */
  avgDom: number;
  dataLastUpdated: string;
}

/** A city needs at least this many active listings for its own numbers to be meaningful;
 * below it we show the county aggregate instead (labeled). */
export const MIN_CITY_ACTIVES = 5;

const DAY_MS = 86_400_000;

/** Aggregate a set of active listings into the three headline metrics. */
export function computeInsights(rows: InsightRow[], now = Date.now()) {
  const prices = rows.map((r) => r.price).filter((p) => p > 0);
  const since = now - 30 * DAY_MS;

  let newLast30 = 0;
  const doms: number[] = [];
  for (const r of rows) {
    const t = Date.parse(r.listedAt);
    if (!Number.isFinite(t)) continue;
    if (t >= since) newLast30 += 1;
    doms.push(Math.max(0, (now - t) / DAY_MS));
  }

  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  return {
    activeCount: rows.length,
    newLast30,
    avgPrice: Math.round(mean(prices)),
    avgDom: Math.round(mean(doms)),
  };
}

/** Decide whether to describe the city or fall back to the county, then aggregate. */
export function pickAreaInsights(opts: {
  city: string;
  countyName: string;
  cityRows: InsightRow[];
  countyRows: InsightRow[];
  dataLastUpdated: string;
  now?: number;
}): AreaInsights {
  const now = opts.now ?? Date.now();
  const useCity = opts.cityRows.length >= MIN_CITY_ACTIVES;
  const rows = useCity ? opts.cityRows : opts.countyRows;
  return {
    scope: useCity ? "city" : "county",
    label: useCity ? `${opts.city}, NY` : opts.countyName,
    dataLastUpdated: opts.dataLastUpdated,
    ...computeInsights(rows, now),
  };
}
