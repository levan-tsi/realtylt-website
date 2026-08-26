import { afterEach, describe, expect, it, vi } from "vitest";
import { FixtureIdxClient } from "./fixture";
import { FIXTURE_LISTINGS } from "./fixture-data";
import { getIdxClient } from "./index";
import { ReplicatedIdxClient } from "./replicated";
import { SEARCH_PAGE_SIZE } from "./types";
import type { Listing } from "./types";
import { COUNTIES } from "@/lib/site";

const client = new FixtureIdxClient();
const all = () => client.search({ pageSize: 500 });

describe("FixtureIdxClient — dataset", () => {
  it("holds ~60 listings covering all six counties", async () => {
    const r = await all();
    expect(r.total).toBeGreaterThanOrEqual(55);
    expect(r.total).toBeLessThanOrEqual(70);
    for (const c of COUNTIES) {
      expect(r.listings.some((l) => l.county === c.slug)).toBe(true);
    }
  });

  it("every listing carries the MLS compliance fields", async () => {
    const r = await all();
    for (const l of r.listings) {
      expect(l.listOfficeName.length).toBeGreaterThan(3);
      expect(l.originatingSystem).toBe("OneKey MLS");
      expect(new Date(l.modificationTimestamp).toString()).not.toBe("Invalid Date");
      expect(l.photos.length).toBeGreaterThanOrEqual(3);
      expect(l.lat).toBeGreaterThan(40.5);
      expect(l.lat).toBeLessThan(42.5);
      expect(l.lng).toBeGreaterThan(-75);
      expect(l.lng).toBeLessThan(-73);
    }
  });

  it("prices are believable per county (Westchester skews above Ulster)", async () => {
    const r = await all();
    const median = (slug: string) => {
      const p = r.listings.filter((l) => l.county === slug).map((l) => l.price).sort((a, b) => a - b);
      return p[Math.floor(p.length / 2)];
    };
    expect(median("westchester")).toBeGreaterThan(700_000);
    expect(median("ulster")).toBeLessThan(600_000);
    for (const l of r.listings) {
      expect(l.price).toBeGreaterThan(100_000);
      expect(l.price).toBeLessThan(4_000_000);
    }
  });
});

describe("FixtureIdxClient — filters", () => {
  it("filters by county", async () => {
    const r = await client.search({ county: "putnam", pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.county === "putnam")).toBe(true);
  });

  /** Round 23: the /search grid can be scoped to the map's viewport box so the list and the
   * map answer the same question. Obedience, not just presence: every returned row must sit
   * INSIDE the box, and an unlocated row (lat/lng 0) must never ride into a scoped answer. */
  it("bounds= returns only homes inside the box, and totals to exactly those", async () => {
    const base = FIXTURE_LISTINGS[0];
    const inside: Listing = { ...base, id: "IN-BOX", county: "dutchess", lat: 41.5, lng: -73.9 };
    const north: Listing = { ...base, id: "TOO-NORTH", county: "dutchess", lat: 42.5, lng: -73.9 };
    const west: Listing = { ...base, id: "TOO-WEST", county: "dutchess", lat: 41.5, lng: -74.9 };
    const unlocated: Listing = { ...base, id: "NO-COORDS", county: "dutchess", lat: 0, lng: 0 };
    const c = new FixtureIdxClient([inside, north, west, unlocated]);

    const r = await c.search({ bounds: { north: 42.0, south: 41.0, east: -73.5, west: -74.2 }, pageSize: 100 });
    expect(r.listings.map((l) => l.id)).toEqual(["IN-BOX"]);
    expect(r.total).toBe(1);
  });

  it("defaults to the WHOLE served scope — NYC boroughs included (owner's call, round 23)", async () => {
    const borough: Listing = { ...FIXTURE_LISTINGS[0], id: "BK-TEST", county: "brooklyn" };
    const seeded = new FixtureIdxClient([...FIXTURE_LISTINGS, borough]);
    const def = await seeded.search({ pageSize: 500 });
    expect(def.listings.some((l) => l.id === "BK-TEST")).toBe(true); // boroughs in the default
    const picked = await seeded.search({ county: "putnam", pageSize: 500 });
    expect(picked.listings.some((l) => l.id === "BK-TEST")).toBe(false); // a chosen county still narrows
  });

  /** The defect this closes (measured on production 2026-07-31): the location box was free text
   * over address+city+zip+county, so searching "Beacon" returned 82 homes of which 2 were on
   * Beacon Street in Middletown, and "Kingston" returned 32 of which 2 were on Kingston Avenue
   * in Poughkeepsie. Right for typed text, wrong for a place chosen off a list. */
  it("city= is exact and excludes a same-named STREET in another town", async () => {
    const base = FIXTURE_LISTINGS[0];
    const inBeacon: Listing = { ...base, id: "IN-BEACON", county: "dutchess", city: "Beacon", address: "12 Maple Street" };
    const beaconStreet: Listing = { ...base, id: "BEACON-ST", county: "orange", city: "Middletown", address: "40 Beacon Street" };
    const c = new FixtureIdxClient([inBeacon, beaconStreet]);

    const free = await c.search({ q: "Beacon", pageSize: 100 });
    expect(free.listings.map((l) => l.id).sort()).toEqual(["BEACON-ST", "IN-BEACON"]); // text: both

    const exact = await c.search({ city: "Beacon", pageSize: 100 });
    expect(exact.listings.map((l) => l.id)).toEqual(["IN-BEACON"]); // picked: only the town
  });

  it("city= ignores case and surrounding space", async () => {
    const base = FIXTURE_LISTINGS[0];
    const c = new FixtureIdxClient([{ ...base, id: "NR", county: "westchester", city: "New Rochelle" }]);
    expect((await c.search({ city: "  new rochelle " })).listings.map((l) => l.id)).toEqual(["NR"]);
  });

  it("city= combines with q rather than replacing it", async () => {
    const base = FIXTURE_LISTINGS[0];
    const c = new FixtureIdxClient([
      { ...base, id: "A", county: "dutchess", city: "Beacon", address: "12 Maple Street" },
      { ...base, id: "B", county: "dutchess", city: "Beacon", address: "9 Oak Lane" },
    ]);
    expect((await c.search({ city: "Beacon", q: "maple" })).listings.map((l) => l.id)).toEqual(["A"]);
  });

  it("filters by price range", async () => {
    const r = await client.search({ priceMin: 400_000, priceMax: 700_000, pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.price >= 400_000 && l.price <= 700_000)).toBe(true);
  });

  it("filters by minimum beds, baths and sqft", async () => {
    const r = await client.search({ bedsMin: 4, bathsMin: 2, sqftMin: 2000, pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.beds >= 4 && l.baths >= 2 && l.sqft >= 2000)).toBe(true);
  });

  it("filters by property type", async () => {
    const r = await client.search({ propertyType: "Multi-Family", pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(r.listings.every((l) => l.propertyType === "Multi-Family")).toBe(true);
  });

  it("New Listings quick filter keeps only rows listed within N days", async () => {
    const base = FIXTURE_LISTINGS[0];
    const fresh: Listing = {
      ...base,
      id: "FRESH",
      county: "orange",
      listedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    };
    const stale: Listing = {
      ...base,
      id: "STALE",
      county: "orange",
      listedAt: new Date(Date.now() - 40 * 86_400_000).toISOString(),
    };
    const c = new FixtureIdxClient([fresh, stale]);
    const r = await c.search({ newWithinDays: 7, pageSize: 100 });
    expect(r.listings.map((l) => l.id)).toEqual(["FRESH"]);
    // Without the filter both rows are returned.
    const all = await c.search({ pageSize: 100 });
    expect(all.total).toBe(2);
  });

  // The owner's ask: "listed 3-6 months ago", which a ceiling alone could never express.
  it("Days on market is a window: the two ends keep only what falls between them", async () => {
    const base = FIXTURE_LISTINGS[0];
    const at = (days: number, id: string): Listing => ({
      ...base,
      id,
      county: "orange",
      listedAt: new Date(Date.now() - days * 86_400_000).toISOString(),
    });
    const c = new FixtureIdxClient([at(10, "NEW"), at(120, "MIDDLE"), at(300, "OLD")]);

    // Floor alone: listed at least 90 days ago.
    expect((await c.search({ listedMinDays: 90, pageSize: 100 })).listings.map((l) => l.id)).toEqual([
      "MIDDLE",
      "OLD",
    ]);
    // Both ends: 90 to 180 days — the 3-to-6-months window, mirroring db.searchFilters'
    // listed_at gte/lte pair.
    expect(
      (await c.search({ listedMinDays: 90, newWithinDays: 180, pageSize: 100 })).listings.map((l) => l.id),
    ).toEqual(["MIDDLE"]);
    // An inverted pair narrows to nothing — the parser is what normalizes, not this filter.
    expect((await c.search({ listedMinDays: 180, newWithinDays: 90, pageSize: 100 })).total).toBe(0);
  });

  it("MORE panel: garage / lot / year / sqft-max / tax ranges filter numerically", async () => {
    const base = FIXTURE_LISTINGS[0];
    const mk = (id: string, f: Partial<Listing>): Listing => ({ ...base, id, county: "orange", ...f });
    const c = new FixtureIdxClient([
      mk("G10", { garageSpaces: 10, sqft: 1800, yearBuilt: 2018, lotAcres: 2.5, taxAnnual: 8000 }),
      mk("G2", { garageSpaces: 2, sqft: 2600, yearBuilt: 1995, lotAcres: 0.3, taxAnnual: 22000 }),
      mk("G0", { garageSpaces: 0, sqft: 4000, yearBuilt: 1960, lotAcres: 40, taxAnnual: 3000 }),
      mk("GNONE", { sqft: 5000 }), // no OPTIONAL facts (garage/lot/year/tax); sqft is mandatory
      mk("GZERO", { sqft: 0 }), // unmeasured sqft, stored as 0 the way the feed delivers it
    ]);
    // Numeric, not lexicographic: garage >= 3 keeps 10 but drops 2 (a text compare would drop 10).
    expect((await c.search({ garageMin: 3, pageSize: 100 })).listings.map((l) => l.id)).toEqual(["G10"]);
    // A listing missing the fact never satisfies a bound (honest — unknown ≠ pass).
    expect((await c.search({ garageMin: 1, pageSize: 100 })).listings.map((l) => l.id).sort()).toEqual(["G10", "G2"]);
    // GZERO's 0 sqft is "unmeasured", not "small": a MAX cap never matches it (round 41 —
    // before this rule, "under 750 sq ft" matched 5,199 Active rows with no sqft at all).
    expect((await c.search({ sqftMax: 2000, pageSize: 100 })).listings.map((l) => l.id)).toEqual(["G10"]);
    expect((await c.search({ sqftMax: 99999, pageSize: 100 })).listings.map((l) => l.id).sort()).toEqual(["G0", "G10", "G2", "GNONE"]);
    expect((await c.search({ yearMin: 2000, pageSize: 100 })).listings.map((l) => l.id)).toEqual(["G10"]);
    expect((await c.search({ lotMin: 1, lotMax: 10, pageSize: 100 })).listings.map((l) => l.id)).toEqual(["G10"]);
    expect((await c.search({ taxMax: 10000, pageSize: 100 })).listings.map((l) => l.id).sort()).toEqual(["G0", "G10"]);
  });

  it("MORE panel: without-photos toggle keeps only listings with a mirrored cover", async () => {
    const base = FIXTURE_LISTINGS[0];
    const withCover: Listing = { ...base, id: "HASPIX", county: "orange", photosMirrored: 3 };
    const noCover: Listing = { ...base, id: "NOPIX", county: "orange", photosMirrored: 0 };
    const c = new FixtureIdxClient([withCover, noCover]);
    expect((await c.search({ pageSize: 100 })).total).toBe(2); // default includes both
    expect((await c.search({ withPhotosOnly: true, pageSize: 100 })).listings.map((l) => l.id)).toEqual(["HASPIX"]);
  });

  it("matches free-text location against town / zip / address", async () => {
    const byTown = await client.search({ q: "beacon", pageSize: 100 });
    expect(byTown.total).toBeGreaterThan(0);
    expect(byTown.listings.every((l) => l.city.toLowerCase() === "beacon")).toBe(true);

    const zip = byTown.listings[0].zip;
    const byZip = await client.search({ q: zip, pageSize: 100 });
    expect(byZip.listings.some((l) => l.zip === zip)).toBe(true);
  });
});

describe("FixtureIdxClient — sort + pagination", () => {
  it("sorts by price ascending and descending", async () => {
    const asc = await client.search({ sort: "price-asc", pageSize: 100 });
    const prices = asc.listings.map((l) => l.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    const desc = await client.search({ sort: "price-desc", pageSize: 100 });
    const dprices = desc.listings.map((l) => l.price);
    expect(dprices).toEqual([...dprices].sort((a, b) => b - a));
  });

  it("default sort is newest (listedAt desc)", async () => {
    const r = await client.search({ pageSize: 100 });
    const times = r.listings.map((l) => +new Date(l.listedAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("sorts by oldest (listedAt asc)", async () => {
    const r = await client.search({ sort: "oldest", pageSize: 100 });
    const times = r.listings.map((l) => +new Date(l.listedAt));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("featured sort surfaces own-office listings before the rest", async () => {
    const r = await client.search({ sort: "featured", pageSize: 100 });
    const firstNonFeatured = r.listings.findIndex((l) => !l.isFeatured);
    // Every featured listing precedes the first non-featured one.
    expect(r.listings.slice(0, firstNonFeatured).every((l) => l.isFeatured)).toBe(true);
    expect(r.listings.slice(firstNonFeatured).some((l) => l.isFeatured)).toBe(false);
  });

  it("paginates with default pageSize 12 and consistent totals", async () => {
    const p1 = await client.search({ page: 1 });
    const p2 = await client.search({ page: 2 });
    expect(p1.pageSize).toBe(12);
    expect(p1.listings.length).toBe(12);
    expect(p1.totalPages).toBe(Math.ceil(p1.total / 12));
    expect(p2.page).toBe(2);
    expect(p1.listings[0].id).not.toBe(p2.listings[0].id);
  });

  it("honours the scoped 50-per-page search size without changing the 12 rail default", async () => {
    expect(SEARCH_PAGE_SIZE).toBe(50);
    const search = await client.search({ pageSize: SEARCH_PAGE_SIZE });
    expect(search.pageSize).toBe(50);
    expect(search.listings.length).toBe(50); // dataset holds ≥50 across the default counties
    expect(search.totalPages).toBe(Math.ceil(search.total / 50));
    // The unscoped default (rails/portal) stays at 12.
    expect((await client.search({})).pageSize).toBe(12);
  });

  it("reports dataLastUpdated as the max modificationTimestamp", async () => {
    const r = await all();
    const max = r.listings.map((l) => l.modificationTimestamp).sort().pop();
    expect(r.dataLastUpdated).toBe(max);
  });
});

describe("FixtureIdxClient — single, featured, new", () => {
  it("returns a listing by id and null for unknown ids", async () => {
    const r = await all();
    const first = r.listings[0];
    expect((await client.getListing(first.id))?.address).toBe(first.address);
    expect(await client.getListing("nope-404")).toBeNull();
  });

  it("getFeatured returns only featured listings, respecting limit", async () => {
    const f = await client.getFeatured(6);
    expect(f.length).toBe(6);
    expect(f.every((l) => l.isFeatured)).toBe(true);
  });

  it("getNew returns the most recently listed first", async () => {
    const n = await client.getNew(8);
    expect(n.length).toBe(8);
    const times = n.map((l) => +new Date(l.listedAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("getFeatured and getNew never overlap (home shows two distinct rails)", async () => {
    const [featured, fresh] = await Promise.all([client.getFeatured(8), client.getNew(8)]);
    const featuredIds = new Set(featured.map((l) => l.id));
    expect(fresh.filter((l) => featuredIds.has(l.id)).map((l) => l.id)).toEqual([]);
  });
});

describe("getIdxClient factory", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("serves the committed snapshot even when MLS env vars are absent", () => {
    vi.stubEnv("MLS_API_KEY", "");
    vi.stubEnv("MLS_API_ENDPOINT", "");
    expect(getIdxClient()).toBeInstanceOf(ReplicatedIdxClient);
  });

  it("serves the committed snapshot even with MLS keys set (requests never hit MLS Grid)", () => {
    vi.stubEnv("MLS_API_KEY", "test-key");
    vi.stubEnv("MLS_API_ENDPOINT", "https://api.mlsgrid.com/v2");
    expect(getIdxClient()).toBeInstanceOf(ReplicatedIdxClient);
  });
});
