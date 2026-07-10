import { afterEach, describe, expect, it, vi } from "vitest";
import { FixtureIdxClient } from "./fixture";
import { getIdxClient } from "./index";
import { MlsGridClient } from "./mls-grid";
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

  it("paginates with default pageSize 12 and consistent totals", async () => {
    const p1 = await client.search({ page: 1 });
    const p2 = await client.search({ page: 2 });
    expect(p1.pageSize).toBe(12);
    expect(p1.listings.length).toBe(12);
    expect(p1.totalPages).toBe(Math.ceil(p1.total / 12));
    expect(p2.page).toBe(2);
    expect(p1.listings[0].id).not.toBe(p2.listings[0].id);
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
});

describe("getIdxClient factory", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("returns the fixture client when MLS env vars are absent", () => {
    vi.stubEnv("MLS_API_KEY", "");
    vi.stubEnv("MLS_API_ENDPOINT", "");
    expect(getIdxClient()).toBeInstanceOf(FixtureIdxClient);
  });

  it("returns the MLS Grid client when key + endpoint are set", () => {
    vi.stubEnv("MLS_API_KEY", "test-key");
    vi.stubEnv("MLS_API_ENDPOINT", "https://api.mlsgrid.com/v2");
    expect(getIdxClient()).toBeInstanceOf(MlsGridClient);
  });
});
