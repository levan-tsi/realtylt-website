/** Typed IDX layer — the boundary behind which fixture data and the live MLS Grid feed are
 * interchangeable (ARCHITECTURE.md "lib/idx"). */

import type { CountySlug } from "@/lib/site";

export type PropertyType = "Residential" | "Multi-Family";

/** Search paging bounds — shared by the API route and the fixture client. */
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

export type ListingStatus = "Active" | "Coming Soon" | "Pending";

export interface Listing {
  id: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: CountySlug;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: PropertyType;
  status: ListingStatus;
  openHouse?: boolean;
  description: string;
  features: string[];
  /** Structured facts (rows stored before 2026-07-15 fall back to the `features` strings). */
  yearBuilt?: number;
  lotAcres?: number;
  propertySubType?: string;
  listAgentName?: string;
  /** Detail-page facts replicated from the feed 2026-07-15 — absent on older rows. */
  taxAnnual?: number;
  hoaFee?: number;
  garageSpaces?: number;
  schoolDistrict?: string;
  elementarySchool?: string;
  middleSchool?: string;
  highSchool?: string;
  appliances?: string[];
  basement?: string[];
  interiorFeatures?: string[];
  exteriorFeatures?: string[];
  lotFeatures?: string[];
  heating?: string[];
  cooling?: string[];
  sewer?: string[];
  waterSource?: string[];
  parkingFeatures?: string[];
  photos: string[]; // paths under /public in fixture mode; feed URLs live
  /** Photo mirroring (docs/mls-fix/PHOTO-MIRRORING.md): count of leading `photos` whose bytes
   * are copied into Supabase Storage at mls-photos/<id>/<idx>.jpg. MLS Grid MediaURLs are SIGNED
   * and expire ~1h after the sync captures them, so the /api/media route serves the first
   * `photosMirrored` photos from storage (permanent) and only falls back to the source URL for
   * the rest. Absent/0 = nothing mirrored yet (route uses the existing proxy/placeholder path). */
  photosMirrored?: number;
  /** The `modificationTimestamp` the current mirror corresponds to. A newer value means the
   * photo set may have changed, so the sync re-mirrors that listing from index 0. */
  photosMirroredTs?: string;
  lat: number;
  lng: number;
  /** MLS compliance — always rendered ("Listed with …"). */
  listOfficeName: string;
  originatingSystem: string; // "OneKey MLS"
  modificationTimestamp: string; // ISO — "Data last updated"
  isFeatured?: boolean;
  listedAt: string; // ISO — powers "New Listings" sort
}

/** Lightweight map-pin projection of a Listing — /api/idx/pins returns the ENTIRE
 * filtered result set in this shape so the map can plot every match (Zillow-style)
 * while the grid stays paginated. */
export interface MapPin {
  id: string;
  price: number;
  lat: number;
  lng: number;
  address: string;
  city: string;
  zip: string;
  beds: number;
  baths: number;
  /** MLS compliance — popups keep the "Listed with …" line. */
  office: string;
}

export type SortKey = "newest" | "oldest" | "featured" | "price-asc" | "price-desc";

export interface SearchParams {
  q?: string; // free-text location: town, zip, address fragment
  county?: CountySlug;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  sqftMin?: number;
  propertyType?: PropertyType;
  sort?: SortKey;
  page?: number; // 1-based
  pageSize?: number; // default 12
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Max modificationTimestamp in the result set — attribution "Data last updated". */
  dataLastUpdated: string;
}

/** Lat/lng bounding box for viewport-scoped map loading (north/south/east/west degrees). */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Max pins returned for a bounded (viewport) map fetch. A dense borough holds 4k+
 * listings; loading them all is the /search slowness this cap kills. When a viewport
 * truncates, `total` still reports the true in-bounds count so the UI can say
 * "showing N of M — zoom in to see all". Unbounded callers are never capped. */
export const PIN_CAP = 800;

/** Pin set for the map + the matching listing count. With a viewport bbox, `pins` is
 * capped at PIN_CAP while `total` is the true count inside the box (see /api/idx/pins). */
export interface PinsResult {
  pins: MapPin[];
  total: number;
}

export interface IdxClient {
  search(params: SearchParams): Promise<SearchResult>;
  getListing(id: string): Promise<Listing | null>;
  getFeatured(limit?: number): Promise<Listing[]>;
  getNew(limit?: number): Promise<Listing[]>;
  /** Optional slim path for the map. With `bounds`, returns only listings inside the
   * viewport box (capped at PIN_CAP) in a single query — the fast /search path. Without
   * bounds, pages the whole filtered set server-side (PostgREST caps one response at
   * 1000 rows, so search() can't) — kept for callers that need every match. */
  searchPins?(params: SearchParams, bounds?: MapBounds): Promise<PinsResult>;
}
