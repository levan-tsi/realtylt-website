/** Typed IDX layer — the boundary behind which fixture data and the live MLS Grid feed are
 * interchangeable (ARCHITECTURE.md "lib/idx"). */

import type { CountySlug } from "@/lib/site";

export type PropertyType = "Residential" | "Multi-Family" | "Land" | "Commercial" | "Rental";
/** The statuses a visitor can filter down to. Deliberately NOT every value the feed carries —
 * these are the two people ask for by name ("show me what is still available", "show me what is
 * already spoken for"). Closed/Withdrawn/Expired never reach the site at all. */
export type ListingStatusFilter = "Active" | "Pending";

/** Search paging bounds — shared by the API route and the fixture client. */
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;
/** The /search results grid paints a fuller page than the portal/home rails. Scoped to the
 * search surface via an explicit pageSize param so the 12-per-rail default is never inflated
 * elsewhere.
 *
 * 50, raised from 36 on the owner's ask 2026-08-02 ("can we raise it to 50 per page, it would
 * not slow things right?"). Measured on warm requests before changing it, so the answer is not
 * a guess: 36 -> 177ms median, 50 -> 215ms, 60 -> 227ms; payload 87KB -> 123KB -> 150KB. The
 * per-listing cost is flat (~2.5KB), so this is linear and small, and it divides evenly by the
 * grid's 2 / 3 / 4 columns where 36 left a ragged row at 4-up. Stopped at 50 rather than 60
 * because the map plots exactly this page as chips and each card can pull a photo — both scale
 * with the number, and the media host is the one resource here with a history of pushing back. */
export const SEARCH_PAGE_SIZE = 50;

export type ListingStatus = "Active" | "Coming Soon" | "Pending" | "Under Contract";

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
  /** The listing's REAL photo total, surviving the card slimming (search cards keep ONE cover
   * URL in `photos`, so `photos.length` is always 1 there — this is the pager/popup bound).
   * The /api/media route serves any index: storage first, proxy fallback, branded still last. */
  photoCount?: number;
  /** Photo mirroring (docs/mls-fix/PHOTO-MIRRORING.md): count of leading `photos` whose bytes
   * are copied into Supabase Storage at mls-photos/<id>/<idx>.jpg. MLS Grid MediaURLs are SIGNED
   * and expire ~1h after the sync captures them, so the /api/media route serves the first
   * `photosMirrored` photos from storage (permanent) and only falls back to the source URL for
   * the rest. Absent/0 = nothing mirrored yet (route uses the existing proxy/placeholder path). */
  photosMirrored?: number;
  /** The `modificationTimestamp` the current mirror corresponds to. Kept for rows mirrored
   * before `photosMirroredCount` existed, which still fall back to comparing it. */
  photosMirroredTs?: string;
  /** How many photos the listing had when the mirror was built. THIS is the change-detection
   * signal: comparing modification timestamps reset the mirror on every price or status edit,
   * and a budget-bounded run then re-mirrored only the cover — which is why 84% of Pending
   * listings were serving a single photo against feed sets of 7 to 38. See planRange. */
  photosMirroredCount?: number;
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
  /** How many photos /api/media/{id}/{n} can serve — the popup pager's bound (0 = none). */
  photoCount: number;
  /** On-market status, so the map can tell a home you can still buy from one that is already
   * spoken for. Without it every chip looked identical and 4,775 Pending listings were
   * indistinguishable from 6,763 Active ones. */
  status?: string;
  /** Client-only: the visitor has hearted this listing (SavedProvider) — the chip shows it. */
  saved?: boolean;
}

/** "mixed" (the default) interleaves price bands and rotates daily, so the first page is
 * never the same parade of listings — owner's ask. */
export type SortKey = "mixed" | "newest" | "oldest" | "featured" | "price-asc" | "price-desc";

export interface SearchParams {
  q?: string; // free-text location: town, zip, address fragment
  /** An EXACT city, set when the visitor picks one from the suggest dropdown rather than
   * typing. `q` is a substring over address+city+zip+county, which is right for typed text
   * and wrong for a chosen place: "Beacon" as free text also returns Beacon Street in
   * Middletown, and "Kingston" returns Kingston Avenue in Poughkeepsie. */
  city?: string;
  /** Narrow to one on-market status. The site shows Active, Coming Soon, Pending and Under
   * Contract together by default (OneKey's own portal does the same), but "only show me what I
   * can actually buy today" is a real question and it was unanswerable. */
  status?: ListingStatusFilter;
  county?: CountySlug;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  sqftMin?: number;
  propertyType?: PropertyType;
  /** "For Rent" mode: true → rentals only (property_type "Rental"), and the SALE $10k price
   * floor is not applied. Default/false → the for-sale experience, which EXCLUDES rentals from
   * every count, median, rail, and total. Rentals are a deliberately separate surface. */
  rental?: boolean;
  /** "New Listings" quick filter — keep only rows listed within the last N days. */
  newWithinDays?: number;
  // ── "MORE" panel filters (structured facts replicated 2026-07-15). Older rows missing a
  // fact are excluded by that fact's range filter — honest (we can't claim an unknown value).
  sqftMax?: number;
  garageMin?: number;
  garageMax?: number;
  lotMin?: number; // acres
  lotMax?: number; // acres
  yearMin?: number;
  yearMax?: number;
  taxMax?: number; // annual property tax, USD
  /** Exclude listings without a mirrored cover photo (the branded-placeholder rows). */
  withPhotosOnly?: boolean;
  /** Home type — RESO PropertySubType, which is a finer cut than PropertyType: condos, co-ops
   * and townhouses are all `Residential`. One token can cover several feed values (see
   * HOME_TYPE_VALUES), so this filters with `in.()`, not equality. */
  homeType?: HomeType;
  // ── Feature toggles, backed by generated boolean columns (supabase/migrations/
  // idx_search_facet_columns.sql). Each is "yes" only — nobody searches for "no basement" —
  // and a row whose feed record omits the source array yields NULL and is honestly excluded.
  centralAir?: boolean;
  basement?: boolean;
  waterfront?: boolean;
  firstFloorBed?: boolean;
  eatInKitchen?: boolean;
  sort?: SortKey;
  page?: number; // 1-based
  pageSize?: number; // default 12
}

/** Home-type tokens the /search "Home type" control offers, and the RESO PropertySubType
 * values each one covers. Grouped where a group is genuinely ONE concept to a buyer: nobody
 * shopping for a two-family thinks in terms of Duplex vs Triplex vs Quadruplex, but everybody
 * knows the difference between a condo and a co-op — which is why those stay apart.
 *
 * Counts measured across active inventory 2026-08-06 (31,536 rows): Single Family 10,349,
 * Co-op 962*, Condo 733*, Duplex 596*, Apartment 243* (*sampled at 6,000). Every token below
 * maps to real inventory; a token that could never return a home would be a filter that
 * cannot answer, which this project does not ship. */
export const HOME_TYPE_VALUES = {
  house: ["Single Family Residence"],
  condo: ["Condominium"],
  coop: ["Stock Cooperative"],
  "multi-family": ["Duplex", "Triplex", "Quadruplex", "Multi Family"],
  apartment: ["Apartment"],
  manufactured: ["Manufactured Home", "Mobile Home"],
} as const satisfies Record<string, readonly string[]>;

export type HomeType = keyof typeof HOME_TYPE_VALUES;

export const HOME_TYPES = Object.keys(HOME_TYPE_VALUES) as HomeType[];

/** Home types that only exist as RENTALS in this feed, so asking for them on the for-sale
 * search is asking for nothing. Apartment is 1,162 Rental against exactly 1 Residential, and
 * the for-sale search excludes rentals outright — so every buyer who picked it got zero
 * results, always. Enforced in parseFilterParams (server AND the client's own fetch go through
 * it) rather than only hidden in the dropdown, because a hidden option still leaves
 * `?homeType=apartment` typeable, and a filter the control cannot show is a ghost. */
export const RENTAL_ONLY_HOME_TYPES = new Set<HomeType>(["apartment"]);

/** Basement values that count as HAVING one. None / Common / Crawl Space / Storage Space /
 * See Remarks / Bilco Door(s) all appear in this feed and none is what someone ticking the box
 * is asking for. WATERFRONT is the same idea for lotFeatures.
 *
 * These two lists are DUPLICATED, deliberately and unavoidably, in the generated columns in
 * supabase/migrations/idx_search_facet_columns.sql — SQL cannot import TypeScript. The DB path
 * reads the column and the fixture path reads these arrays, so if they ever drift the two
 * would answer the same question differently. lib/idx/facets.test.ts pins them together. */
export const REAL_BASEMENT = ["Finished", "Full", "Partially Finished", "Partial", "Walk-Out Access"] as const;
export const WATERFRONT_FEATURES = ["Waterfront", "Water Access"] as const;

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Attribution "Data last updated": when our copy of the feed was last refreshed. DB path
   * = idx_sync_state.last_synced_at; the snapshot/fixture paths have no sync clock and
   * report the max modificationTimestamp in the set instead. */
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
