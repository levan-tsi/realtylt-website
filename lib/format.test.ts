import { describe, it, expect } from "vitest";
import { fmtM, listingStats, specParts } from "./format";

describe("fmtM", () => {
  it("renders median price shorthand", () => {
    expect(fmtM(480_000)).toBe("$480K");
    expect(fmtM(1_150_000)).toBe("$1150K");
  });
});

describe("specParts — drops feed zeros so a listing never shows '0 Bed'", () => {
  const units = { bed: "Bed", bath: "Bath", sqft: "Sq. Ft." };

  it("keeps all three when populated", () => {
    expect(specParts({ beds: 3, baths: 2, sqft: 2030 }, units)).toEqual([
      "3 Bed",
      "2 Bath",
      "2,030 Sq. Ft.",
    ]);
  });

  it("omits a zero sqft (multi-family with no LivingArea)", () => {
    expect(specParts({ beds: 5, baths: 4, sqft: 0 }, units)).toEqual(["5 Bed", "4 Bath"]);
  });

  it("returns [] when the feed gives nothing (land / 0-bed multi-family)", () => {
    expect(specParts({ beds: 0, baths: 0, sqft: 0 }, units)).toEqual([]);
  });

  it("honors caller units", () => {
    expect(specParts({ beds: 2, baths: 1, sqft: 1440 }, { bed: "bd", bath: "ba", sqft: "sqft" })).toEqual([
      "2 bd",
      "1 ba",
      "1,440 sqft",
    ]);
  });
});

describe("listingStats — Land/lot fallback to acreage", () => {
  const units = { bed: "Bed", bath: "Bath", sqft: "Sq. Ft.", acre: "Acres", acreOne: "Acre" };

  it("keeps beds/baths/sqft when the home has them (no acreage clutter)", () => {
    expect(listingStats({ beds: 3, baths: 2, sqft: 2030, lotAcres: 0.5, propertyType: "Residential" }, units)).toEqual([
      "3 Bed",
      "2 Bath",
      "2,030 Sq. Ft.",
    ]);
  });

  it("shows acreage for a Land row with no beds/baths/sqft", () => {
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 4.2, propertyType: "Land" }, units)).toEqual(["4.2 Acres"]);
  });

  it("uses the singular label for exactly one acre", () => {
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 1, propertyType: "Land" }, units)).toEqual(["1 Acre"]);
  });

  it("shows nothing when a lot-only row has no acreage either (never a blank clutter)", () => {
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, propertyType: "Land" }, units)).toEqual([]);
  });

  it("rounds feed-precision acreage to something a person would say (round 36: a card printed '0.0449 Acres')", () => {
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 0.0449, propertyType: "Land" }, units)).toEqual(["0.04 Acres"]);
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 686.62, propertyType: "Land" }, units)).toEqual(["686.6 Acres"]);
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 23.1, propertyType: "Land" }, units)).toEqual(["23.1 Acres"]);
  });

  it("treats acreage that rounds to one as one, and acreage that rounds to nothing as nothing", () => {
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 1.004, propertyType: "Land" }, units)).toEqual(["1 Acre"]);
    expect(listingStats({ beds: 0, baths: 0, sqft: 0, lotAcres: 0.004, propertyType: "Land" }, units)).toEqual([]);
  });

  it("keeps a commercial building's sqft (no acreage fallback needed)", () => {
    expect(listingStats({ beds: 0, baths: 0, sqft: 6000, lotAcres: 1.5, propertyType: "Commercial" }, units)).toEqual([
      "6,000 Sq. Ft.",
    ]);
  });
});
