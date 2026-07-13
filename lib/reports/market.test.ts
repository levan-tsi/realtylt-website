import { describe, expect, it } from "vitest";
import type { Listing } from "@/lib/idx";
import { computeMarketStats } from "./market";

function listing(over: Partial<Listing>): Listing {
  return {
    id: "x",
    price: 500_000,
    address: "1 Main St",
    city: "Beacon",
    state: "NY",
    zip: "12508",
    county: "dutchess",
    beds: 3,
    baths: 2,
    sqft: 2000,
    propertyType: "Residential",
    status: "Active",
    description: "",
    features: [],
    photos: [],
    lat: 0,
    lng: 0,
    listOfficeName: "Test Realty",
    originatingSystem: "OneKey MLS",
    modificationTimestamp: "2026-07-01T00:00:00Z",
    listedAt: "2026-07-01T00:00:00Z",
    ...over,
  };
}

describe("computeMarketStats", () => {
  const listings = [
    listing({ id: "a", price: 250_000, sqft: 1000, beds: 2 }), // $250/sqft
    listing({ id: "b", price: 500_000, sqft: 2000, beds: 3 }), // $250/sqft
    listing({ id: "c", price: 900_000, sqft: 3000, beds: 5, propertyType: "Multi-Family" }), // $300/sqft
  ];
  const stats = computeMarketStats(listings, "2026-07-10T00:00:00Z");

  it("counts and medians", () => {
    expect(stats.activeCount).toBe(3);
    expect(stats.medianPrice).toBe(500_000);
    expect(stats.medianSqft).toBe(2000);
    expect(stats.medianBeds).toBe(3);
    expect(stats.medianPricePerSqft).toBe(250);
    expect(stats.priceMin).toBe(250_000);
    expect(stats.priceMax).toBe(900_000);
  });

  it("bins prices into bands (upper bound exclusive)", () => {
    const band = (label: string) => stats.priceBands.find((b) => b.label === label)!.count;
    expect(band("Under $300K")).toBe(1); // 250k
    expect(band("$300K–$500K")).toBe(0); // 500k is excluded from the top of this band…
    expect(band("$500K–$750K")).toBe(1); // …and lands here
    expect(band("$750K–$1M")).toBe(1); // 900k
    expect(band("$1M+")).toBe(0);
  });

  it("splits property types", () => {
    expect(stats.propertyTypeSplit.find((b) => b.label === "Residential")!.count).toBe(2);
    expect(stats.propertyTypeSplit.find((b) => b.label === "Multi-Family")!.count).toBe(1);
  });

  it("distributes beds with a 5+ bucket", () => {
    expect(stats.bedsDistribution.find((b) => b.label === "5+ bd")!.count).toBe(1);
    expect(stats.bedsDistribution.find((b) => b.label === "3 bd")!.count).toBe(1);
  });

  it("ignores zero-price / zero-sqft rows in medians", () => {
    const withZeros = computeMarketStats(
      [...listings, listing({ id: "z", price: 0, sqft: 0, beds: 0 })],
      "2026-07-10T00:00:00Z",
    );
    expect(withZeros.medianPrice).toBe(500_000); // unchanged — 0 excluded
    expect(withZeros.activeCount).toBe(4); // but still counted as a listing
  });
});
