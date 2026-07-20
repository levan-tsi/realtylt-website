/** Shared URL-param → SearchParams parsing for the IDX API routes
 * (/api/idx/search and /api/idx/pins) — one validation story, no drift. */

import { SERVED_AREAS, type CountySlug } from "@/lib/site";
import type { MapBounds, PropertyType, SearchParams, SortKey } from "./types";

export const SORTS: SortKey[] = ["newest", "oldest", "featured", "price-asc", "price-desc"];
export const TYPES: PropertyType[] = ["Residential", "Multi-Family"];

export function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Truthy URL flags: "1"/"true"/"on"/"yes" → true; anything else → undefined. */
export function flag(v: string | null): boolean | undefined {
  return v === "1" || v === "true" || v === "on" || v === "yes" ? true : undefined;
}

/** The filter fields only — paging/sort are the caller's business. */
export function parseFilterParams(q: URLSearchParams): SearchParams {
  const county = q.get("county") as CountySlug | null;
  const type = q.get("propertyType") as PropertyType | null;
  return {
    q: q.get("q")?.slice(0, 100) || undefined,
    county: county && SERVED_AREAS.some((c) => c.slug === county) ? county : undefined,
    priceMin: num(q.get("priceMin")),
    priceMax: num(q.get("priceMax")),
    bedsMin: num(q.get("bedsMin")),
    bathsMin: num(q.get("bathsMin")),
    sqftMin: num(q.get("sqftMin")),
    propertyType: type && TYPES.includes(type) ? type : undefined,
    // "MORE" panel range filters (jsonb/generated-column numeric filters, honest ≥/≤).
    sqftMax: num(q.get("sqftMax")),
    garageMin: num(q.get("garageMin")),
    garageMax: num(q.get("garageMax")),
    lotMin: num(q.get("lotMin")),
    lotMax: num(q.get("lotMax")),
    yearMin: num(q.get("yearMin")),
    yearMax: num(q.get("yearMax")),
    taxMax: num(q.get("taxMax")),
    withPhotosOnly: flag(q.get("withPhotos")),
    // "New Listings" quick filter — bounded to a sane window so a crafted value can't ask
    // for an absurd range.
    newWithinDays: (() => {
      const d = num(q.get("newDays"));
      return d && d > 0 ? Math.min(d, 90) : undefined;
    })(),
  };
}

/** north/south/east/west → a valid MapBounds, or undefined. Guards NaN/degenerate boxes
 * (a request must supply all four and satisfy north>south, east>west) so a garbled bbox
 * falls back to the unbounded path rather than querying nonsense. NY is well east of the
 * antimeridian, so no wrap handling is needed. */
export function parseBounds(q: URLSearchParams): MapBounds | undefined {
  const north = Number(q.get("north"));
  const south = Number(q.get("south"));
  const east = Number(q.get("east"));
  const west = Number(q.get("west"));
  if (![north, south, east, west].every(Number.isFinite)) return undefined;
  if (north <= south || east <= west) return undefined;
  return { north, south, east, west };
}

/** In-memory bbox test — used by the snapshot/fixture pin paths (the DB path filters
 * server-side in PostgREST). */
export function inBounds(p: { lat: number; lng: number }, b: MapBounds): boolean {
  return p.lat >= b.south && p.lat <= b.north && p.lng >= b.west && p.lng <= b.east;
}
