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
