/** Pure market-report math over a set of Listings (already filtered to the area).
 * Computed server-side from the committed MLS snapshot — the client can run a real,
 * current-market report for any of the six counties (and drill to a town) with no CRM
 * round-trip, because the whole active-listing set ships inside the deploy bundle. */

import type { Listing } from "@/lib/idx";
import { median } from "./cma";
import type { Bucket, MarketStats } from "./types";

const PRICE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "Under $300K", min: 0, max: 300_000 },
  { label: "$300K–$500K", min: 300_000, max: 500_000 },
  { label: "$500K–$750K", min: 500_000, max: 750_000 },
  { label: "$750K–$1M", min: 750_000, max: 1_000_000 },
  { label: "$1M+", min: 1_000_000, max: Infinity },
];

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

/** Compute the headline stats + distributions for a set of active listings. */
export function computeMarketStats(listings: Listing[], dataLastUpdated: string): MarketStats {
  const prices = listings.map((l) => l.price).filter((p) => p > 0);
  const ppsf = listings.filter((l) => l.sqft > 0 && l.price > 0).map((l) => l.price / l.sqft);
  const sqfts = listings.map((l) => l.sqft).filter((s) => s > 0);
  const beds = listings.map((l) => l.beds).filter((b) => b > 0);

  const now = Date.now();
  const freshCount = listings.filter((l) => {
    const t = Date.parse(l.listedAt);
    return Number.isFinite(t) && now - t <= THIRTY_DAYS;
  }).length;

  const priceBands: Bucket[] = PRICE_BANDS.map((b) => ({
    label: b.label,
    count: listings.filter((l) => l.price >= b.min && l.price < b.max).length,
  }));

  const bedsBuckets = [1, 2, 3, 4] as const;
  const bedsDistribution: Bucket[] = [
    ...bedsBuckets.map((n) => ({
      label: `${n} bd`,
      count: listings.filter((l) => l.beds === n).length,
    })),
    { label: "5+ bd", count: listings.filter((l) => l.beds >= 5).length },
  ];

  const propertyTypeSplit: Bucket[] = [
    { label: "Residential", count: listings.filter((l) => l.propertyType === "Residential").length },
    { label: "Multi-Family", count: listings.filter((l) => l.propertyType === "Multi-Family").length },
  ];

  return {
    activeCount: listings.length,
    medianPrice: Math.round(median(prices)),
    medianPricePerSqft: Math.round(median(ppsf)),
    medianSqft: Math.round(median(sqfts)),
    medianBeds: Math.round(median(beds)),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    freshCount,
    priceBands,
    bedsDistribution,
    propertyTypeSplit,
    dataLastUpdated,
  };
}
