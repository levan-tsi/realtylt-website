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
  photos: string[]; // paths under /public in fixture mode; feed URLs live
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

export type SortKey = "newest" | "price-asc" | "price-desc";

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

export interface IdxClient {
  search(params: SearchParams): Promise<SearchResult>;
  getListing(id: string): Promise<Listing | null>;
  getFeatured(limit?: number): Promise<Listing[]>;
  getNew(limit?: number): Promise<Listing[]>;
}
