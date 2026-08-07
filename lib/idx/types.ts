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
// ≥ VIEWPORT_PAGE_SIZE below — the map-view grid asks for a whole viewport in one page.
export const MAX_PAGE_SIZE = 150;
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
/** Map-view page size once the grid is scoped to the map viewport (round 23). The owner's ask
 * — "if you zoomed and there is 150 show 150 on the list" — sets the number: a viewport worth
 * of homes should be ONE list, and paging only starts above it. Measured before shipping (see
 * DESIGN-ROUND23.md): 150 compact cards render and scroll cleanly in the results panel, and
 * the payload stays linear at ~2.5KB/listing (~375KB, one request per map settle, CDN-cached).
 * Zillow paginates at 40 but its seamless feel comes from viewport scoping, not page size. */
export const VIEWPORT_PAGE_SIZE = 150;

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
  washerDryer?: boolean;
  formalDining?: boolean;
  /** ONE toggle over TWO facts (has_public_water AND has_public_sewer): the buyer question it
   * answers is "no well, no septic", which is a single decision in this market. */
  municipalUtilities?: boolean;
  // ── Round 24 (owner: "drop down filters are still less and needs adding more"). Selects,
  // not more checkboxes, because that is the word he used and each has several real answers.
  // Backed by generated columns in supabase/migrations/idx_round24_facet_columns.sql; counts
  // measured in-surface 2026-08-07 (25,130 for-sale on-market rows ≥ $10k) before building.
  /** Heating fuel — one token, one Heating array value (HEATING_VALUES). Gas 8,854 · Oil
   * 3,610 · Electric 2,281 · Heat pump 703 · Propane 567. */
  heating?: HeatingType;
  /** Parking kind — one token, one ParkingFeatures value (PARKING_VALUES). Driveway 9,238 ·
   * Attached 2,582 · Assigned 2,033 · Detached 1,384. */
  parking?: ParkingType;
  /** Basement, one level deeper than the yes/no `basement` flag: Finished 6,545 ·
   * Walk-out 4,193. The UI offers one select (Any / Yes / Finished / Walk-out) that sets
   * exactly one of the three basement params. */
  basementFinished?: boolean;
  basementWalkout?: boolean;
  /** lotFeatures "Near Public Transit" — 2,871. Commuter-belt question, his live site asks it. */
  nearTransit?: boolean;
  // ── Round 24b (the Zillow completeness audit, DESIGN-ROUND24.md §8).
  /** Zillow's Keywords box over the listing remarks (99.8% filled): websearch full text on a
   * generated tsvector (idx_round24b_keywords_views.sql). Stemmed and word-bounded — "pool"
   * 3,388 · "fireplace" 3,620 — which answers the two most-wanted sync-gated facts honestly. */
  keywords?: string;
  /** lotFeatures "Views" — 804. Zillow's views must-have, one honest toggle. */
  views?: boolean;
  /** Scope results to a map viewport (round 23: the grid and the map must answer the SAME
   * question — he caught page 2 of the county scope contradicting what the map showed). Set
   * by /api/idx/search from north/south/east/west params; never part of the page URL, so the
   * server render stays place-scoped and the client adds the box once the map settles. */
  bounds?: MapBounds;
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

/** Round-24 select facets: token → the ONE feed value it means. Same duplication contract as
 * REAL_BASEMENT above — the SQL in idx_round24_facet_columns.sql repeats these literals in its
 * generated columns, and lib/idx/facets.test.ts pins the two together so they cannot drift.
 * "Finished" deliberately does NOT match "Partially Finished": jsonb array containment is
 * exact-element, and a buyer asking for a finished basement is not asking for half of one. */
export const HEATING_VALUES = {
  "natural-gas": "Natural Gas",
  oil: "Oil",
  electric: "Electric",
  propane: "Propane",
  "heat-pump": "Heat Pump",
} as const satisfies Record<string, string>;
export type HeatingType = keyof typeof HEATING_VALUES;
export const HEATING_TYPES = Object.keys(HEATING_VALUES) as HeatingType[];

export const PARKING_VALUES = {
  attached: "Attached",
  detached: "Detached",
  driveway: "Driveway",
  assigned: "Assigned",
} as const satisfies Record<string, string>;
export type ParkingType = keyof typeof PARKING_VALUES;
export const PARKING_TYPES = Object.keys(PARKING_VALUES) as ParkingType[];

export const BASEMENT_FINISHED_VALUE = "Finished";
export const BASEMENT_WALKOUT_VALUE = "Walk-Out Access";
export const NEAR_TRANSIT_VALUE = "Near Public Transit";

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

/** Max pins returned for a bounded (viewport) map fetch. Raised from 800 once the map stopped
 * drawing one DOM chip per pin (round 22 clustered; round 23 thins — components/idx/
 * pin-thinning.ts plans pills + dots and carries its own render cap, MARKER_CAP), so the real
 * ceiling here is PAYLOAD, not compute. At ~181 bytes/pin (measured on the slim MapPin JSON
 * shape), 3,000 pins is ~530KB — comparable to the ~972KB this route already shipped unbounded
 * before it required a viewport, and it covers every county except the densest NYC boroughs at
 * their widest zoom. When a viewport truncates, `total` still reports the true in-bounds count
 * so the UI can say "N of M homes shown". Unbounded callers are never capped. */
export const PIN_CAP = 3000;

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
