/** Typed IDX layer — the boundary behind which fixture data and the live MLS Grid feed are
 * interchangeable (ARCHITECTURE.md "lib/idx"). */

import type { CountySlug } from "@/lib/site";

export type PropertyType = "Residential" | "Multi-Family";

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
