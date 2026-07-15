/** Shared URL-param → SearchParams parsing for the IDX API routes
 * (/api/idx/search and /api/idx/pins) — one validation story, no drift. */

import { SERVED_AREAS, type CountySlug } from "@/lib/site";
import type { PropertyType, SearchParams, SortKey } from "./types";

export const SORTS: SortKey[] = ["newest", "price-asc", "price-desc"];
export const TYPES: PropertyType[] = ["Residential", "Multi-Family"];

export function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
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
  };
}
