/** FixtureIdxClient — the default IdxClient until owner MLS keys arrive.
 * Deterministic in-memory search over ~60 OneKey-shaped sample listings. */

import { FIXTURE_LISTINGS } from "./fixture-data";
import type { IdxClient, Listing, SearchParams, SearchResult } from "./types";

const DEFAULT_PAGE_SIZE = 12;

export class FixtureIdxClient implements IdxClient {
  private readonly listings: Listing[];

  constructor(listings: Listing[] = FIXTURE_LISTINGS) {
    this.listings = listings;
  }

  async search(params: SearchParams = {}): Promise<SearchResult> {
    const {
      q,
      county,
      priceMin,
      priceMax,
      bedsMin,
      bathsMin,
      sqftMin,
      propertyType,
      sort = "newest",
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
    } = params;

    let out = this.listings.filter((l) => {
      if (county && l.county !== county) return false;
      if (priceMin != null && l.price < priceMin) return false;
      if (priceMax != null && l.price > priceMax) return false;
      if (bedsMin != null && l.beds < bedsMin) return false;
      if (bathsMin != null && l.baths < bathsMin) return false;
      if (sqftMin != null && l.sqft < sqftMin) return false;
      if (propertyType && l.propertyType !== propertyType) return false;
      if (q) {
        const needle = q.trim().toLowerCase();
        if (needle) {
          const hay = `${l.address} ${l.city} ${l.zip} ${l.county}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
      }
      return true;
    });

    out = [...out].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return +new Date(b.listedAt) - +new Date(a.listedAt);
      }
    });

    const total = out.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      listings: out.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
      dataLastUpdated: this.dataLastUpdated(),
    };
  }

  async getListing(id: string): Promise<Listing | null> {
    return this.listings.find((l) => l.id === id) ?? null;
  }

  async getFeatured(limit = 8): Promise<Listing[]> {
    return this.listings.filter((l) => l.isFeatured).slice(0, limit);
  }

  async getNew(limit = 8): Promise<Listing[]> {
    return [...this.listings]
      .sort((a, b) => +new Date(b.listedAt) - +new Date(a.listedAt))
      .slice(0, limit);
  }

  private dataLastUpdated(): string {
    return this.listings.reduce(
      (max, l) => (l.modificationTimestamp > max ? l.modificationTimestamp : max),
      this.listings[0]?.modificationTimestamp ?? new Date(0).toISOString(),
    );
  }
}
