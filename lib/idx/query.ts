/** Shared URL-param → SearchParams parsing for the IDX API routes
 * (/api/idx/search and /api/idx/pins) — one validation story, no drift. */

import { SERVED_AREAS, type CountySlug } from "@/lib/site";
import { HOME_TYPES, RENTAL_ONLY_HOME_TYPES, SEARCH_PAGE_SIZE, type HomeType, type ListingStatusFilter, type MapBounds, type PropertyType, type SearchParams, type SortKey } from "./types";

/** Status values a URL may ask for. Anything else falls back to "no status filter". */
export const STATUS_FILTERS: ListingStatusFilter[] = ["Active", "Pending"];

export const SORTS: SortKey[] = ["mixed", "newest", "oldest", "featured", "price-asc", "price-desc"];
/** The sale property types the /search Type dropdown offers (validation whitelist). "Rental"
 * is intentionally NOT here — the For-Rent surface is selected via the `rental` flag, not this
 * dropdown, so a sale search can never be tricked into `propertyType=Rental`. */
export const TYPES: PropertyType[] = ["Residential", "Multi-Family", "Land", "Commercial"];

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
    // Exact city, from the suggest dropdown. Not whitelisted against an enum — the city list
    // is our own inventory and changes hourly — but length-bounded and always compared with
    // an equality operator, never interpolated into a pattern.
    city: q.get("city")?.trim().slice(0, 80) || undefined,
    status: STATUS_FILTERS.includes(q.get("status") as ListingStatusFilter)
      ? (q.get("status") as ListingStatusFilter)
      : undefined,
    county: county && SERVED_AREAS.some((c) => c.slug === county) ? county : undefined,
    priceMin: num(q.get("priceMin")),
    priceMax: num(q.get("priceMax")),
    bedsMin: num(q.get("bedsMin")),
    bathsMin: num(q.get("bathsMin")),
    sqftMin: num(q.get("sqftMin")),
    propertyType: type && TYPES.includes(type) ? type : undefined,
    // "For Rent" mode — rentals only, sale $10k floor exempt (see db.searchFilters).
    rental: flag(q.get("rental")),
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
    // Home type + feature toggles. The type is whitelisted against HOME_TYPE_VALUES, so a
    // crafted `homeType` can never reach the query builder; the toggles are yes-only flags.
    homeType: (() => {
      const t = q.get("homeType") as HomeType;
      if (!HOME_TYPES.includes(t)) return undefined;
      // A rental-only type on a for-sale search can never match, so it is dropped rather than
      // silently returning nothing (see RENTAL_ONLY_HOME_TYPES).
      if (RENTAL_ONLY_HOME_TYPES.has(t) && !flag(q.get("rental"))) return undefined;
      return t;
    })(),
    centralAir: flag(q.get("centralAir")),
    basement: flag(q.get("basement")),
    waterfront: flag(q.get("waterfront")),
    firstFloorBed: flag(q.get("firstFloorBed")),
    eatInKitchen: flag(q.get("eatInKitchen")),
    washerDryer: flag(q.get("washerDryer")),
    formalDining: flag(q.get("formalDining")),
    municipalUtilities: flag(q.get("municipalUtilities")),
    // "New Listings" quick filter — bounded to a sane window so a crafted value can't ask
    // for an absurd range.
    newWithinDays: (() => {
      const d = num(q.get("newDays"));
      return d && d > 0 ? Math.min(d, 90) : undefined;
    })(),
  };
}

/** The /search surface's own defaults, applied to a raw page URL. The server render
 * (app/search/page.tsx) and the client's /api/idx/search fetch must ask the SAME question or
 * the visitor sees one set of homes in the HTML and a different set a beat later, so both go
 * through here. Mirrors SearchClient's `fromParams`/`toQuery`: sort defaults to "mixed", the
 * "New Listings" quick filter means listed within NEW_LISTING_DAYS, and the grid is 36 a page.
 * Anything unrecognised falls back to the default rather than erroring — this is a URL a
 * visitor can type. */
export const NEW_LISTING_DAYS = 7;

export function parseSearchRequest(q: URLSearchParams): SearchParams {
  const sort = q.get("sort") as SortKey | null;
  const withQuick = new URLSearchParams(q);
  // On /search, `quick` is the ONLY status control. Raw ?status= / ?newDays= are API-route
  // params the SearchClient has never read — honoring them here would render an HTML answer
  // the client immediately disagrees with (?quick=all&status=Active: Active-only homes in the
  // HTML, every on-market status after the first client fetch). Drop them before translating.
  withQuick.delete("status");
  withQuick.delete("newDays");
  // The count-line quick filter is ONE control with four mutually exclusive answers, but they
  // are not all the same kind of question: "new" is a time window, "active"/"pending" are a
  // status. Translate here so the server render and the client's own fetch ask the SAME
  // question — if they drifted, the visitor would see one set of homes in the HTML and a
  // different set a beat later.
  // DEFAULTS TO "active" (owner's call, 2026-08-06). Measured on production the day it changed:
  // the default six-county scope held 11,611 listings, of which 4,777 — 41% — were Pending.
  // Two in five homes a visitor scrolled past could not be bought, and nothing on the page said
  // so until they opened one. "all" is still one click away on the same control; it just has to
  // be asked for now, which is why it is the value that travels in the URL.
  const quick = q.get("quick") ?? "active";
  if (quick === "new") withQuick.set("newDays", String(NEW_LISTING_DAYS));
  if (quick === "active") withQuick.set("status", "Active");
  if (quick === "pending") withQuick.set("status", "Pending");
  return {
    ...parseFilterParams(withQuick),
    sort: sort && SORTS.includes(sort) ? sort : "mixed",
    page: Math.max(1, Math.floor(num(q.get("page")) ?? 1)),
    pageSize: SEARCH_PAGE_SIZE,
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
