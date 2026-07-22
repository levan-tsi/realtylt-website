import { describe, it, expect } from "vitest";
import { slugify, listingSlug, listingPath, listingIdFromSlug } from "./listing-url";

const base = { id: "KEY1027788", address: "215 Central Avenue", city: "White Plains", state: "NY", zip: "10606" };

describe("slugify", () => {
  it("lowercases and hyphenates, trimming edges", () => {
    expect(slugify("White Plains")).toBe("white-plains");
    expect(slugify("  Rye  ")).toBe("rye");
  });
  it("collapses runs of non-alphanumerics to a single hyphen", () => {
    expect(slugify("35 East Street")).toBe("35-east-street");
    expect(slugify("A -- B / C")).toBe("a-b-c");
  });
});

describe("listingSlug (address edge cases)", () => {
  it("keeps a directional prefix", () => {
    expect(listingSlug({ address: "937 E 225th Street" })).toBe("937-e-225th-street");
  });
  it("drops the # from a co-op unit and folds it in", () => {
    expect(listingSlug({ address: "215 Central Avenue #10E" })).toBe("215-central-avenue-10e");
    expect(listingSlug({ address: "150-10 71st Avenue #3B" })).toBe("150-10-71st-avenue-3b");
  });
  it("handles a plain street with a direction word", () => {
    expect(listingSlug({ address: "35 East Street" })).toBe("35-east-street");
  });
  it("falls back to 'home' for an empty address", () => {
    expect(listingSlug({ address: "" })).toBe("home");
  });
});

describe("listingPath", () => {
  it("builds the live-shaped canonical path", () => {
    expect(listingPath(base)).toBe("/homes-for-sale/NY/white-plains/10606/215-central-avenue/bid-38-KEY1027788");
  });
  it("carries the FULL key (prefix varies: KEY live, H6 fixtures)", () => {
    expect(listingPath({ ...base, id: "H6400001" })).toContain("/bid-38-H6400001");
  });
  it("falls back when city/zip/state are missing", () => {
    expect(listingPath({ id: "KEY1", address: "1 Main St", city: "", zip: "", state: "" }))
      .toBe("/homes-for-sale/NY/ny/00000/1-main-st/bid-38-KEY1");
  });
  it("normalizes a lowercase or noisy state", () => {
    expect(listingPath({ ...base, state: "ny" })).toContain("/homes-for-sale/NY/");
  });
  it("strips non-digits from a messy zip", () => {
    expect(listingPath({ ...base, zip: "10606-1234" })).toContain("/10606/");
  });
});

describe("listingIdFromSlug", () => {
  it("extracts the key from the trailing bid-38 segment", () => {
    expect(listingIdFromSlug(["NY", "white-plains", "10606", "215-central-avenue", "bid-38-KEY1027788"]))
      .toBe("KEY1027788");
  });
  it("extracts a fixture (H6) key too", () => {
    expect(listingIdFromSlug(["NY", "rye", "10580", "1-main-st", "bid-38-H6400001"])).toBe("H6400001");
  });
  it("returns null when there is no bid segment", () => {
    expect(listingIdFromSlug(["NY", "white-plains", "10606", "215-central-avenue"])).toBeNull();
    expect(listingIdFromSlug([])).toBeNull();
    expect(listingIdFromSlug(undefined)).toBeNull();
  });
  it("round-trips with listingPath", () => {
    for (const l of [base, { ...base, id: "H6400098" }, { ...base, address: "937 E 225th Street #10E" }]) {
      const segments = listingPath(l).split("/").filter(Boolean).slice(1); // drop "homes-for-sale"
      expect(listingIdFromSlug(segments)).toBe(l.id);
    }
  });
});
