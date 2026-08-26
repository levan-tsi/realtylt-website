import { describe, expect, it } from "vitest";
import { flag, inBounds, parseBounds, parseFilterParams, parseSearchRequest } from "./query";
import { SEARCH_PAGE_SIZE } from "./types";

const q = (s: string) => new URLSearchParams(s);

describe("parseFilterParams — newDays (New Listings quick filter)", () => {
  it("parses a positive window", () => {
    expect(parseFilterParams(q("newDays=7")).newWithinDays).toBe(7);
  });
  it("clamps an absurd window to a year", () => {
    expect(parseFilterParams(q("newDays=99999")).newWithinDays).toBe(365);
  });
  it("ignores absent / zero / negative / non-numeric values", () => {
    expect(parseFilterParams(q("")).newWithinDays).toBeUndefined();
    expect(parseFilterParams(q("newDays=0")).newWithinDays).toBeUndefined();
    expect(parseFilterParams(q("newDays=-5")).newWithinDays).toBeUndefined();
    expect(parseFilterParams(q("newDays=abc")).newWithinDays).toBeUndefined();
  });
});

describe("parseFilterParams — city (an exact place, not a text match)", () => {
  it("parses a picked city", () => {
    expect(parseFilterParams(q("city=Beacon")).city).toBe("Beacon");
  });
  it("carries a multi-word city intact", () => {
    expect(parseFilterParams(q("city=New+Rochelle")).city).toBe("New Rochelle");
  });
  it("trims and bounds the length so a crafted value cannot be huge", () => {
    expect(parseFilterParams(q("city=%20%20Kingston%20%20")).city).toBe("Kingston");
    expect(parseFilterParams(q(`city=${"x".repeat(200)}`)).city).toHaveLength(80);
  });
  it("is absent for an empty or missing value", () => {
    expect(parseFilterParams(q("")).city).toBeUndefined();
    expect(parseFilterParams(q("city=")).city).toBeUndefined();
    expect(parseFilterParams(q("city=%20%20")).city).toBeUndefined();
  });
  it("is independent of q — the two are different questions", () => {
    const p = parseFilterParams(q("city=Beacon&q=maple"));
    expect(p).toMatchObject({ city: "Beacon", q: "maple" });
  });
});

describe("parseFilterParams — MORE panel filters", () => {
  it("parses every MORE range field + the without-photos toggle", () => {
    const p = parseFilterParams(
      q("garageMin=2&garageMax=4&sqftMax=3000&lotMin=1&lotMax=10&yearMin=1990&yearMax=2020&taxMax=15000&withPhotos=1"),
    );
    expect(p).toMatchObject({
      garageMin: 2, garageMax: 4, sqftMax: 3000,
      lotMin: 1, lotMax: 10, yearMin: 1990, yearMax: 2020,
      taxMax: 15000, withPhotosOnly: true,
    });
  });

  it("decimals survive (lot acres)", () => {
    expect(parseFilterParams(q("lotMin=0.25")).lotMin).toBe(0.25);
  });

  it("omits absent / blank MORE fields (so a bare /search carries none)", () => {
    const p = parseFilterParams(q("county=orange"));
    for (const k of ["garageMin", "garageMax", "sqftMax", "lotMin", "lotMax", "yearMin", "yearMax", "taxMax", "withPhotosOnly"] as const) {
      expect(p[k]).toBeUndefined();
    }
  });

  it("flag(): truthy tokens → true, everything else → undefined", () => {
    for (const v of ["1", "true", "on", "yes"]) expect(flag(v)).toBe(true);
    for (const v of ["0", "false", "", "no", null]) expect(flag(v)).toBeUndefined();
    // A falsey withPhotos value never sets the toggle (default = include all).
    expect(parseFilterParams(q("withPhotos=0")).withPhotosOnly).toBeUndefined();
  });
});

/** The server render of /search and SearchClient's own fetch must ask the feed the SAME
 * question — otherwise the HTML shows one set of homes and hydration swaps in another. These
 * lock the defaults that make the two agree (SearchClient: fromParams + toQuery). */
describe("parseSearchRequest — the /search page's own defaults", () => {
  it("a bare /search is mixed sort, page 1, a 36-card grid, six-county scope", () => {
    expect(parseSearchRequest(q(""))).toMatchObject({
      sort: "mixed",
      page: 1,
      pageSize: SEARCH_PAGE_SIZE,
      county: undefined,
      newWithinDays: undefined,
    });
  });

  it("keeps a valid sort and falls back to mixed for anything else", () => {
    expect(parseSearchRequest(q("sort=newest")).sort).toBe("newest");
    expect(parseSearchRequest(q("sort=price-asc")).sort).toBe("price-asc");
    expect(parseSearchRequest(q("sort=cheapest")).sort).toBe("mixed");
    expect(parseSearchRequest(q("sort=")).sort).toBe("mixed");
  });

  it("translates the quick filter to a 7-day window, exactly like the client does", () => {
    expect(parseSearchRequest(q("quick=new")).newWithinDays).toBe(7);
    expect(parseSearchRequest(q("quick=all")).newWithinDays).toBeUndefined();
    // A raw ?newDays= is an API-route param the SearchClient never reads — /search ignores it,
    // or the server HTML answers a question the client's own fetch immediately re-asks without.
    expect(parseSearchRequest(q("newDays=30")).newWithinDays).toBeUndefined();
    expect(parseSearchRequest(q("quick=new&newDays=30")).newWithinDays).toBe(7);
  });

  // On /search, `quick` is the ONLY status control — SearchClient's fromParams has no status
  // field at all, so a server render that honoured ?status= would show homes the client's very
  // first fetch disagrees with (?quick=all&status=Active was live drift before this).
  it("ignores a raw ?status= — quick alone decides", () => {
    expect(parseSearchRequest(q("quick=all&status=Active")).status).toBeUndefined();
    expect(parseSearchRequest(q("status=Pending")).status).toBe("Active"); // quick defaults
    expect(parseSearchRequest(q("quick=new&status=Pending")).status).toBeUndefined();
  });

  // The default is Active, not every on-market status. Measured on production the day it
  // changed: 11,611 listings in the default six-county scope, 4,777 of them Pending — two in
  // five homes a visitor scrolled past could not be bought. SearchClient's `fromParams` must
  // default to the same value; if these two ever disagree the visitor gets one set of homes in
  // the server HTML and a different set when the client refetches a beat later.
  it("defaults to Active, and only 'all' widens it to every on-market status", () => {
    expect(parseSearchRequest(q("")).status).toBe("Active");
    expect(parseSearchRequest(q("county=dutchess")).status).toBe("Active");
    expect(parseSearchRequest(q("quick=all")).status).toBeUndefined();
    expect(parseSearchRequest(q("quick=pending")).status).toBe("Pending");
    expect(parseSearchRequest(q("quick=active")).status).toBe("Active");
  });

  it("leaves status alone for the New Listings window — 'new' is a date, not a status", () => {
    const p = parseSearchRequest(q("quick=new"));
    expect(p.newWithinDays).toBe(7);
    expect(p.status).toBeUndefined();
  });

  // Apartment is 1,162 Rental against exactly 1 Residential in this feed, and the for-sale
  // search excludes rentals outright — so offering it to a buyer returned zero results, always.
  // Hiding the option in the dropdown is not enough: ?homeType=apartment stays typeable, and a
  // filter the control cannot show is a ghost that narrows the query invisibly.
  it("drops a rental-only home type on a for-sale search, but honours it under ?rental=1", () => {
    expect(parseSearchRequest(q("homeType=apartment")).homeType).toBeUndefined();
    expect(parseSearchRequest(q("homeType=apartment&rental=1")).homeType).toBe("apartment");
    // Types that exist on both sides are untouched either way.
    expect(parseSearchRequest(q("homeType=condo")).homeType).toBe("condo");
    expect(parseSearchRequest(q("homeType=condo&rental=1")).homeType).toBe("condo");
  });

  it("clamps page to a whole number ≥ 1 (a typed URL is not to be trusted)", () => {
    expect(parseSearchRequest(q("page=4")).page).toBe(4);
    expect(parseSearchRequest(q("page=0")).page).toBe(1);
    expect(parseSearchRequest(q("page=-3")).page).toBe(1);
    expect(parseSearchRequest(q("page=abc")).page).toBe(1);
    expect(parseSearchRequest(q("page=2.7")).page).toBe(2);
  });

  it("carries the filters through, and drops an unknown county rather than querying it", () => {
    expect(parseSearchRequest(q("county=orange&bedsMin=3&withPhotos=1&rental=1"))).toMatchObject({
      county: "orange",
      bedsMin: 3,
      withPhotosOnly: true,
      rental: true,
    });
    expect(parseSearchRequest(q("county=narnia")).county).toBeUndefined();
  });
});

describe("parseBounds", () => {
  it("parses a full valid box", () => {
    expect(parseBounds(q("north=41&south=40&east=-73&west=-74"))).toEqual({
      north: 41, south: 40, east: -73, west: -74,
    });
  });

  it("rejects a partial box (all four are required)", () => {
    expect(parseBounds(q("north=41&south=40"))).toBeUndefined();
    expect(parseBounds(q(""))).toBeUndefined();
  });

  it("rejects NaN and degenerate boxes", () => {
    expect(parseBounds(q("north=x&south=40&east=-73&west=-74"))).toBeUndefined();
    expect(parseBounds(q("north=40&south=41&east=-73&west=-74"))).toBeUndefined(); // north<=south
    expect(parseBounds(q("north=41&south=40&east=-74&west=-73"))).toBeUndefined(); // east<=west
  });
});

describe("inBounds", () => {
  const b = { north: 41, south: 40, east: -73, west: -74 };
  it("includes points inside (edges inclusive)", () => {
    expect(inBounds({ lat: 40.5, lng: -73.5 }, b)).toBe(true);
    expect(inBounds({ lat: 41, lng: -74 }, b)).toBe(true);
  });
  it("excludes points outside", () => {
    expect(inBounds({ lat: 42, lng: -73.5 }, b)).toBe(false); // north of box
    expect(inBounds({ lat: 40.5, lng: -72 }, b)).toBe(false); // east of box
    expect(inBounds({ lat: 0, lng: 0 }, b)).toBe(false); // Null Island
  });
});

describe("listedDays — the Days-on-market select (round 24)", () => {
  it("translates a page listedDays into the API's newDays window", () => {
    const p = parseSearchRequest(new URLSearchParams("listedDays=30"));
    expect(p.newWithinDays).toBe(30);
  });

  it("composes with quick=new by taking the SMALLER window — both constraints hold", () => {
    expect(parseSearchRequest(new URLSearchParams("quick=new&listedDays=30")).newWithinDays).toBe(7);
    expect(parseSearchRequest(new URLSearchParams("quick=new&listedDays=3")).newWithinDays).toBe(3);
  });

  it("is bounded by the same one-year cap as raw newDays, and garbage is ignored", () => {
    expect(parseSearchRequest(new URLSearchParams("listedDays=5000")).newWithinDays).toBe(365);
    expect(parseSearchRequest(new URLSearchParams("listedDays=banana")).newWithinDays).toBeUndefined();
    expect(parseSearchRequest(new URLSearchParams("listedDays=-3")).newWithinDays).toBeUndefined();
  });
});

/** The owner's ask, in his words: "I wanted to filter properties that was listed 3-6 months ago
 * and it was only up to 3 months." Days on market is a WINDOW now — newWithinDays is its
 * newest end, listedMinDays its oldest — and these lock both ends and the guard between them. */
describe("listedMinDays — the Days-on-market window's oldest end", () => {
  it("parses a positive floor", () => {
    expect(parseFilterParams(q("listedMinDays=90")).listedMinDays).toBe(90);
  });

  it("carries BOTH ends, so 'listed 3 to 6 months ago' is finally sayable", () => {
    const p = parseFilterParams(q("listedMinDays=90&newDays=180"));
    expect(p.listedMinDays).toBe(90);
    expect(p.newWithinDays).toBe(180);
  });

  it("clamps and refuses the same values the newest end does", () => {
    expect(parseFilterParams(q("listedMinDays=99999")).listedMinDays).toBe(365);
    expect(parseFilterParams(q("")).listedMinDays).toBeUndefined();
    expect(parseFilterParams(q("listedMinDays=0")).listedMinDays).toBeUndefined();
    expect(parseFilterParams(q("listedMinDays=-5")).listedMinDays).toBeUndefined();
    expect(parseFilterParams(q("listedMinDays=abc")).listedMinDays).toBeUndefined();
  });

  it("needs no page→API translation: /search and the API spell it the same", () => {
    expect(parseSearchRequest(q("listedMinDays=90")).listedMinDays).toBe(90);
    expect(parseSearchRequest(q("listedMinDays=90&listedDays=180")).newWithinDays).toBe(180);
  });

  // "6 months ago to 3 months ago" is the window said backwards, not a request for nothing —
  // and SearchClient's normalizeListed swaps it identically, so the HTML and the client agree.
  it("swaps an inverted page pair rather than answering nothing", () => {
    const p = parseSearchRequest(q("listedMinDays=180&listedDays=90"));
    expect(p.listedMinDays).toBe(90);
    expect(p.newWithinDays).toBe(180);
  });

  // The swap is deliberately NOT applied at API level: there, the newest end may have come
  // from quick=new, and "new listings AND listed 3+ months ago" is a genuine contradiction
  // that must narrow to nothing instead of being tidied into a window nobody asked for.
  it("leaves quick=new contradicting a floor as the contradiction it is", () => {
    const p = parseSearchRequest(q("quick=new&listedMinDays=90"));
    expect(p.newWithinDays).toBe(7);
    expect(p.listedMinDays).toBe(90);
  });

  // A saved search stores the PAGE query string, and criteria.ts runs parseFilterParams over
  // it — so the newest end has to be readable under the page's own spelling too, or a saved
  // "3 to 6 months" would reach the CRM as "anything older than 3 months".
  it("reads the page's listedDays spelling as the newest end when newDays is absent", () => {
    const p = parseFilterParams(q("listedMinDays=90&listedDays=180"));
    expect(p.newWithinDays).toBe(180);
    expect(p.listedMinDays).toBe(90);
  });
});
