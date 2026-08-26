/** FixtureIdxClient — the default IdxClient until owner MLS keys arrive.
 * Deterministic in-memory search over ~60 OneKey-shaped sample listings. */

import { FIXTURE_LISTINGS } from "./fixture-data";
import { BASEMENT_FINISHED_VALUE, BASEMENT_WALKOUT_VALUE, DEFAULT_PAGE_SIZE, HEATING_VALUES, HOME_TYPE_VALUES, NEAR_TRANSIT_VALUE, PARKING_VALUES, REAL_BASEMENT, WATERFRONT_FEATURES } from "./types";
import type { IdxClient, Listing, SearchParams, SearchResult } from "./types";
import { DEFAULT_COUNTY_SLUGS } from "@/lib/site";

export class FixtureIdxClient implements IdxClient {
  private readonly listings: Listing[];

  constructor(listings: Listing[] = FIXTURE_LISTINGS) {
    this.listings = listings;
  }

  async search(params: SearchParams = {}): Promise<SearchResult> {
    const {
      q,
      city,
      status,
      county,
      priceMin,
      priceMax,
      bedsMin,
      bathsMin,
      sqftMin,
      sqftMax,
      garageMin,
      garageMax,
      lotMin,
      lotMax,
      yearMin,
      yearMax,
      taxMax,
      withPhotosOnly,
      homeType,
      centralAir,
      basement,
      waterfront,
      firstFloorBed,
      eatInKitchen,
      washerDryer,
      formalDining,
      municipalUtilities,
      heating,
      parking,
      basementFinished,
      basementWalkout,
      nearTransit,
      keywords,
      views,
      propertyType,
      newWithinDays,
      listedMinDays,
      sort = "newest",
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
    } = params;
    // The Days-on-market window's two ends, as timestamps: newSince is the newest-end bound
    // (listed after it) and listedUntil the oldest-end one (listed before it). Mirrors
    // db.searchFilters, which pushes the same pair of comparisons against listed_at.
    const newSince = newWithinDays ? Date.now() - newWithinDays * 86_400_000 : null;
    const listedUntil = listedMinDays ? Date.now() - listedMinDays * 86_400_000 : null;

    let out = this.listings.filter((l) => {
      if (county) {
        if (l.county !== county) return false;
      } else if (!(DEFAULT_COUNTY_SLUGS as readonly string[]).includes(l.county)) {
        // No area picked → the whole served scope (all eleven areas since round 23). Still
        // enforced so an out-of-scope row in a seeded fixture can never leak into a default
        // search.
        return false;
      }
      if (priceMin != null && l.price < priceMin) return false;
      if (priceMax != null && l.price > priceMax) return false;
      if (bedsMin != null && l.beds < bedsMin) return false;
      if (bathsMin != null && l.baths < bathsMin) return false;
      if (sqftMin != null && l.sqft < sqftMin) return false;
      // Same rule as db.ts (round 41): an unmeasured sqft (stored as 0) never satisfies a
      // MAX cap — without this, "under 750 sq ft" matched every row with no sqft at all.
      if (sqftMax != null && (l.sqft > sqftMax || l.sqft < 1)) return false;
      // MORE-panel range filters. A missing structured fact fails its range (honest: an
      // unknown garage/lot/year/tax can't satisfy a user's bound) — mirrors the DB, where a
      // null jsonb value never passes a gte/lte comparison.
      if (garageMin != null && !((l.garageSpaces ?? -1) >= garageMin)) return false;
      if (garageMax != null && !((l.garageSpaces ?? Infinity) <= garageMax)) return false;
      if (lotMin != null && !((l.lotAcres ?? -1) >= lotMin)) return false;
      if (lotMax != null && !((l.lotAcres ?? Infinity) <= lotMax)) return false;
      if (yearMin != null && !((l.yearBuilt ?? -1) >= yearMin)) return false;
      if (yearMax != null && !((l.yearBuilt ?? Infinity) <= yearMax)) return false;
      if (taxMax != null && !((l.taxAnnual ?? Infinity) <= taxMax)) return false;
      if (withPhotosOnly && !((l.photosMirrored ?? 0) > 0)) return false;
      // Home type + feature toggles. Same semantics as the generated columns the DB path
      // filters on (supabase/migrations/idx_search_facet_columns.sql): an ABSENT array is a
      // miss, never a match, because a listing that does not state whether it has central air
      // must not appear under "Central air".
      if (homeType && !(HOME_TYPE_VALUES[homeType] as readonly string[]).includes(l.propertySubType ?? "")) return false;
      if (centralAir && !l.cooling?.includes("Central Air")) return false;
      if (basement && !l.basement?.some((v) => (REAL_BASEMENT as readonly string[]).includes(v))) return false;
      if (waterfront && !l.lotFeatures?.some((v) => (WATERFRONT_FEATURES as readonly string[]).includes(v))) return false;
      if (firstFloorBed && !l.interiorFeatures?.includes("First Floor Bedroom")) return false;
      if (eatInKitchen && !l.interiorFeatures?.includes("Eat-in Kitchen")) return false;
      if (washerDryer && !l.interiorFeatures?.includes("Washer/Dryer Hookup")) return false;
      if (formalDining && !l.interiorFeatures?.includes("Formal Dining")) return false;
      // One toggle, two facts — mirrors db.searchFilters: BOTH must be stated and municipal.
      if (municipalUtilities && !(l.waterSource?.includes("Public") && l.sewer?.includes("Public Sewer"))) return false;
      // Round-24 selects — one token means one exact feed value (HEATING_VALUES /
      // PARKING_VALUES in types.ts), same absent-is-a-miss rule as every facet above.
      if (heating && !l.heating?.includes(HEATING_VALUES[heating])) return false;
      if (parking && !l.parkingFeatures?.includes(PARKING_VALUES[parking])) return false;
      if (basementFinished && !l.basement?.includes(BASEMENT_FINISHED_VALUE)) return false;
      if (basementWalkout && !l.basement?.includes(BASEMENT_WALKOUT_VALUE)) return false;
      if (nearTransit && !l.lotFeatures?.includes(NEAR_TRANSIT_VALUE)) return false;
      if (views && !l.lotFeatures?.includes("Views")) return false;
      // Keywords (round 24b). The DB path is stemmed websearch full text; this path is the
      // plain reading of the same promise — every asked word appears in the remarks. The
      // fixture does not stem and ignores websearch negation, which the tests acknowledge.
      if (keywords) {
        const hay = (l.description ?? "").toLowerCase();
        const terms = keywords.toLowerCase().replace(/"/g, "").split(/\s+/).filter((t) => t && !t.startsWith("-"));
        if (terms.length && !terms.every((t) => hay.includes(t))) return false;
      }
      if (propertyType && l.propertyType !== propertyType) return false;
      if (newSince != null && +new Date(l.listedAt) < newSince) return false;
      if (listedUntil != null && +new Date(l.listedAt) > listedUntil) return false;
      // Map-viewport box (round 23). Mirrors db.searchFilters: a 0/absent coordinate can
      // never sit inside a valid NY box, so unlocated rows are excluded from a scoped grid.
      if (params.bounds) {
        const b = params.bounds;
        if (!(l.lat >= b.south && l.lat <= b.north && l.lng >= b.west && l.lng <= b.east)) return false;
      }
      // Exact city (suggest-dropdown pick), case-insensitive to match PostgREST's `eq` on the
      // normalised city column. Mirrors db.searchFilters.
      if (city && l.city.toLowerCase() !== city.trim().toLowerCase()) return false;
      // On-market status ("Active" / "Pending" quick filters). Mirrors db.searchFilters.
      if (status && l.status !== status) return false;
      if (q) {
        const needle = q.trim().toLowerCase();
        if (needle) {
          const hay = `${l.address} ${l.city} ${l.zip} ${l.county}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
      }
      return true;
    });

    // Daily-seeded id hash — a comparator-shaped shuffle, so "mixed" interleaves price
    // bands deterministically (stable within a day, different tomorrow).
    const day = Math.floor(Date.now() / 86_400_000);
    const mixRank = (id: string) => {
      let x = day;
      for (const c of id) x = (Math.imul(x, 31) + c.charCodeAt(0)) | 0;
      return x;
    };
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "mixed":
          return mixRank(a.id) - mixRank(b.id) || (a.id < b.id ? -1 : 1);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "oldest":
          return +new Date(a.listedAt) - +new Date(b.listedAt);
        case "featured":
          // Own-office listings first, then freshest — mirrors the DB `featured` order.
          return (
            (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) ||
            +new Date(b.listedAt) - +new Date(a.listedAt)
          );
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
    // Exclude featured listings so the home page's two rails never repeat a card.
    return this.listings
      .filter((l) => !l.isFeatured)
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
