/** Shared display formatters. */

/** Median-price shorthand for county cards and the Valley map, e.g. 480_000 → "$480K". */
export const fmtM = (n: number) => `$${Math.round(n / 1000)}K`;

/** Beds/baths/sqft display pieces, dropping any value the feed left at 0 (common on
 * OneKey multi-family / land rows) so a listing never renders "0 Bed • 0 Bath • 0 Sq. Ft."
 * Returns only the populated parts, formatted with the caller's unit labels. */
export function specParts(
  l: { beds: number; baths: number; sqft: number },
  units: { bed: string; bath: string; sqft: string },
): string[] {
  const parts: string[] = [];
  if (l.beds > 0) parts.push(`${l.beds} ${units.bed}`);
  if (l.baths > 0) parts.push(`${l.baths} ${units.bath}`);
  if (l.sqft > 0) parts.push(`${l.sqft.toLocaleString("en-US")} ${units.sqft}`);
  return parts;
}

/** Card/detail stat pieces with a Land fallback: Land and other lot-only rows carry no
 * beds/baths/sqft, so surface the lot ACREAGE instead of rendering a blank stat line.
 * `units.acre` is the label (e.g. "acres" / "ac"); the singular is handled for exactly 1. */
export function listingStats(
  l: { beds: number; baths: number; sqft: number; lotAcres?: number; propertyType?: string },
  units: { bed: string; bath: string; sqft: string; acre: string; acreOne: string },
): string[] {
  const parts = specParts(l, units);
  // Only fall back to acreage when there is nothing else to show (Land, raw lots) — a home that
  // already lists beds/baths/sqft keeps its normal stat line.
  if (parts.length === 0 && l.lotAcres && l.lotAcres > 0) {
    // Feed precision is survey precision, not display precision: a card printed "0.0449 Acres"
    // (round 36). Two decimals under ten acres, one at ten and over — the difference a buyer
    // cares about shrinks as the lot grows — with trailing zeros dropped by Number(). A value
    // that rounds to nothing prints nothing rather than "0 Acres".
    const acres = Number(l.lotAcres.toFixed(l.lotAcres < 10 ? 2 : 1));
    if (acres > 0) parts.push(`${acres} ${acres === 1 ? units.acreOne : units.acre}`);
  }
  return parts;
}
