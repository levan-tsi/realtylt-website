import { describe, expect, it } from "vitest";
import { searchCriteria } from "./criteria";

/** These criteria are what the CRM reads to decide who gets a listing alert, so the contract
 * that matters is: it never describes a search the site itself would not run, and it never
 * carries a key whose value is absent. Since round 41 the saved query string runs through the
 * PAGE grammar first (expandPageParams), so the criteria also carry the scope the visitor was
 * actually looking at — the quick chips, including the default Active-only view. */
describe("searchCriteria", () => {
  it("turns a saved search's query string into structured filters", () => {
    expect(searchCriteria("county=dutchess&priceMin=400000&priceMax=750000&bedsMin=3")).toEqual({
      county: "dutchess",
      priceMin: 400000,
      priceMax: 750000,
      bedsMin: 3,
      status: "Active",
    });
  });

  it("accepts a leading question mark", () => {
    expect(searchCriteria("?county=ulster")).toEqual({ county: "ulster", status: "Active" });
  });

  it("an empty search still means the page's default Active-only scope", () => {
    // An empty /search URL is not an empty question: the page defaults to quick=active
    // (owner's call, 2026-08-06), so that is what the subscriber was looking at.
    expect(searchCriteria("")).toEqual({ status: "Active" });
    expect(searchCriteria("?")).toEqual({ status: "Active" });
  });

  it("drops paging and sort — they are not what the search MEANS", () => {
    expect(searchCriteria("county=orange&page=3&sort=price-asc")).toEqual({ county: "orange", status: "Active" });
  });

  it("refuses an area we do not serve, exactly as a live query would", () => {
    expect(searchCriteria("county=miami-dade&bedsMin=2")).toEqual({ bedsMin: 2, status: "Active" });
  });

  it("refuses a property type that is not on the whitelist", () => {
    expect(searchCriteria("propertyType=Rental")).toEqual({ status: "Active" });
    expect(searchCriteria("propertyType=Residential")).toEqual({ propertyType: "Residential", status: "Active" });
  });

  it("drops a negative price rather than storing nonsense", () => {
    expect(searchCriteria("priceMin=-5&priceMax=900000")).toEqual({ priceMax: 900000, status: "Active" });
  });

  it("normalizes the truthy flags to real booleans", () => {
    expect(searchCriteria("rental=1&withPhotos=true")).toEqual({
      rental: true,
      withPhotosOnly: true,
      status: "Active",
    });
    expect(searchCriteria("rental=maybe")).toEqual({ status: "Active" });
  });

  it("drops a raw API newDays — the page grammar owns the window, and quick owns status", () => {
    // ?newDays= is an API-route spelling the /search page itself would ignore (see
    // expandPageParams). A saved search stores the PAGE grammar, so it is dropped here too;
    // the page's own spelling still clamps.
    expect(searchCriteria("newDays=400")).toEqual({ status: "Active" });
    expect(searchCriteria("listedDays=400")).toEqual({ newWithinDays: 365, status: "Active" });
  });

  // The quick chips are the page's status control, and the subscriber saved what they were
  // LOOKING AT. Until round 41 none of this reached the CRM: a saved "New listings" search
  // arrived with no window and the default Active view arrived with no status at all.
  it("carries the quick chip the visitor had selected", () => {
    expect(searchCriteria("quick=new&county=putnam")).toEqual({ county: "putnam", newWithinDays: 7 });
    expect(searchCriteria("quick=pending")).toEqual({ status: "Pending" });
    expect(searchCriteria("quick=all&bedsMin=2")).toEqual({ bedsMin: 2 });
  });

  it("composes quick=new with a Days-on-market max by taking the smaller window, like the page", () => {
    expect(searchCriteria("quick=new&listedDays=90")).toEqual({ newWithinDays: 7 });
  });

  // The saved query string is the /search page's own grammar, so BOTH ends of the
  // Days-on-market window have to survive it — the owner's "listed 3-6 months ago" reaches
  // the CRM as a window, not as "anything older than 3 months".
  it("stores both ends of the Days-on-market window", () => {
    expect(searchCriteria("listedMinDays=90&listedDays=180")).toEqual({
      listedMinDays: 90,
      newWithinDays: 180,
      status: "Active",
    });
  });

  it("keeps an absent window end an absent key, never a null", () => {
    expect(searchCriteria("listedMinDays=90")).toEqual({ listedMinDays: 90, status: "Active" });
    expect(searchCriteria("listedMinDays=0")).toEqual({ status: "Active" });
  });

  it("keeps the keyword but bounds it", () => {
    const long = "a".repeat(200);
    const out = searchCriteria(`q=${long}`);
    expect(String(out.q).length).toBe(100);
  });
});
