import { describe, expect, it } from "vitest";
import { searchCriteria } from "./criteria";

/** These criteria are what the CRM reads to decide who gets a listing alert, so the contract
 * that matters is: it never describes a search the site itself would not run, and it never
 * carries a key whose value is absent. */
describe("searchCriteria", () => {
  it("turns a saved search's query string into structured filters", () => {
    expect(searchCriteria("county=dutchess&priceMin=400000&priceMax=750000&bedsMin=3")).toEqual({
      county: "dutchess",
      priceMin: 400000,
      priceMax: 750000,
      bedsMin: 3,
    });
  });

  it("accepts a leading question mark", () => {
    expect(searchCriteria("?county=ulster")).toEqual({ county: "ulster" });
  });

  it("is empty for an empty search rather than full of nulls", () => {
    expect(searchCriteria("")).toEqual({});
    expect(searchCriteria("?")).toEqual({});
  });

  it("drops paging and sort — they are not what the search MEANS", () => {
    expect(searchCriteria("county=orange&page=3&sort=price-asc")).toEqual({ county: "orange" });
  });

  it("refuses an area we do not serve, exactly as a live query would", () => {
    expect(searchCriteria("county=miami-dade&bedsMin=2")).toEqual({ bedsMin: 2 });
  });

  it("refuses a property type that is not on the whitelist", () => {
    expect(searchCriteria("propertyType=Rental")).toEqual({});
    expect(searchCriteria("propertyType=Residential")).toEqual({ propertyType: "Residential" });
  });

  it("drops a negative price rather than storing nonsense", () => {
    expect(searchCriteria("priceMin=-5&priceMax=900000")).toEqual({ priceMax: 900000 });
  });

  it("normalizes the truthy flags to real booleans", () => {
    expect(searchCriteria("rental=1&withPhotos=true")).toEqual({
      rental: true,
      withPhotosOnly: true,
    });
    expect(searchCriteria("rental=maybe")).toEqual({});
  });

  it("clamps the new-listing window the same way the search route does", () => {
    expect(searchCriteria("newDays=400")).toEqual({ newWithinDays: 365 });
  });

  // The saved query string is the /search page's own grammar, so BOTH ends of the
  // Days-on-market window have to survive it — the owner's "listed 3-6 months ago" reaches
  // the CRM as a window, not as "anything older than 3 months".
  it("stores both ends of the Days-on-market window", () => {
    expect(searchCriteria("listedMinDays=90&listedDays=180")).toEqual({
      listedMinDays: 90,
      newWithinDays: 180,
    });
  });

  it("keeps an absent window end an absent key, never a null", () => {
    expect(searchCriteria("listedMinDays=90")).toEqual({ listedMinDays: 90 });
    expect(searchCriteria("listedMinDays=0")).toEqual({});
  });

  it("keeps the keyword but bounds it", () => {
    const long = "a".repeat(200);
    const out = searchCriteria(`q=${long}`);
    expect(String(out.q).length).toBe(100);
  });
});
