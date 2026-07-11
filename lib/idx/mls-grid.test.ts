import { describe, expect, it } from "vitest";
import { mapProperty } from "./mls-grid";

/** Minimal valid onekey2 row (real field shape — no UnparsedAddress on this feed). */
const row = {
  ListingId: "KEY123456",
  ListPrice: 550_000,
  StreetNumber: "12",
  StreetName: "Main",
  StreetSuffix: "Street",
  City: "Beacon",
  StateOrProvince: "NY",
  PostalCode: "12508",
  CountyOrParish: "Dutchess",
  BedroomsTotal: 3,
  BathroomsTotalInteger: 3,
  BathroomsHalf: 1,
  LivingArea: 1850,
  PropertyType: "Residential",
  StandardStatus: "Active",
  ListOfficeName: "Example Realty",
  ModificationTimestamp: "2026-07-01T12:00:00Z",
  Latitude: 41.5,
  Longitude: -73.96,
  Media: [
    { MediaURL: "https://media.example.com/2.jpg", Order: 2 },
    { MediaURL: "https://media.example.com/0.jpg", Order: 0 },
    { MediaURL: "https://media.example.com/1.jpg", Order: 1 },
  ],
};

describe("mapProperty", () => {
  it("maps a feed row to a Listing with joined address and ordered photos", () => {
    const l = mapProperty(row);
    expect(l).not.toBeNull();
    expect(l!.id).toBe("KEY123456");
    expect(l!.address).toBe("12 Main Street");
    expect(l!.county).toBe("dutchess");
    expect(l!.photos).toEqual([
      "https://media.example.com/0.jpg",
      "https://media.example.com/1.jpg",
      "https://media.example.com/2.jpg",
    ]);
  });

  it("normalizes 'X County' / case variants to the site slug", () => {
    expect(mapProperty({ ...row, CountyOrParish: "Westchester County" })!.county).toBe("westchester");
    expect(mapProperty({ ...row, CountyOrParish: "ORANGE" })!.county).toBe("orange");
  });

  it("shows half baths as .5 (BathroomsTotalInteger counts halves whole)", () => {
    expect(mapProperty(row)!.baths).toBe(2.5); // 3 total incl. 1 half → 2 full + 0.5
    expect(mapProperty({ ...row, BathroomsHalf: 0 })!.baths).toBe(3);
  });

  it("drops rows outside the six served counties", () => {
    expect(mapProperty({ ...row, CountyOrParish: "Nassau" })).toBeNull();
    expect(mapProperty({ ...row, CountyOrParish: undefined })).toBeNull();
  });

  it("drops non-residential types and unviewable/priceless rows", () => {
    expect(mapProperty({ ...row, PropertyType: "Land" })).toBeNull();
    expect(mapProperty({ ...row, MlgCanView: false })).toBeNull();
    expect(mapProperty({ ...row, ListPrice: undefined })).toBeNull();
  });

  it("maps Residential Income to Multi-Family", () => {
    expect(mapProperty({ ...row, PropertyType: "Residential Income" })!.propertyType).toBe("Multi-Family");
  });

  it("derives listedAt from DaysOnMarket when present", () => {
    const l = mapProperty({ ...row, DaysOnMarket: 10 })!;
    const days = (Date.now() - +new Date(l.listedAt)) / 86_400_000;
    expect(days).toBeGreaterThan(9.9);
    expect(days).toBeLessThan(10.1);
  });

  it("falls back to a jittered zip centroid when the feed has no coordinates", () => {
    const { Latitude: _lat, Longitude: _lng, ...noCoords } = row;
    const l = mapProperty(noCoords)!;
    expect(Math.abs(l.lat - 41.496)).toBeLessThan(0.01); // Beacon 12508 centroid ± jitter
    expect(Math.abs(l.lng - -73.9536)).toBeLessThan(0.015);
    expect(mapProperty(noCoords)!.lat).toBe(l.lat); // deterministic
    expect(mapProperty({ ...noCoords, PostalCode: "99999" })!.lat).toBe(0); // unknown zip → dropped by map
  });

  it("uses feed coordinates verbatim when present", () => {
    expect(mapProperty(row)!.lat).toBe(41.5);
    expect(mapProperty(row)!.lng).toBe(-73.96);
  });

  it("flags the owner's own office listings as featured", () => {
    expect(mapProperty({ ...row, ListOfficeName: "United Real Estate LLC" })!.isFeatured).toBe(true);
    expect(mapProperty(row)!.isFeatured).toBe(false);
  });
});
