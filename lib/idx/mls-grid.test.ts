import { afterEach, describe, expect, it, vi } from "vitest";
import { mapProperty, MlsGridClient } from "./mls-grid";

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
    // OneKey abbreviates the owner's office — the feed's actual string must match.
    expect(mapProperty({ ...row, ListOfficeName: "United RE Hudson Valley Edge" })!.isFeatured).toBe(true);
    // Other "united" offices in the feed must NOT ride the owner's rail.
    expect(mapProperty({ ...row, ListOfficeName: "United Realty NY Inc" })!.isFeatured).toBe(false);
    expect(mapProperty({ ...row, ListOfficeName: "KW Hudson Valley United" })!.isFeatured).toBe(false);
    expect(mapProperty(row)!.isFeatured).toBe(false);
  });
});

describe("replicateDeep (rolling full-inventory pass)", () => {
  afterEach(() => vi.unstubAllGlobals());

  const mkRow = (id: string, ts: string, county = "Dutchess") => ({
    ...row,
    ListingId: id,
    ModificationTimestamp: ts,
    CountyOrParish: county,
  });

  it("pages via @odata.nextLink, advances the watermark, keeps signed photo URLs", async () => {
    const page1 = {
      value: [mkRow("K1", "2026-01-01T00:00:00.000Z"), mkRow("OUT", "2026-01-02T00:00:00.000Z", "Nassau")],
      "@odata.nextLink": "https://api.example.com/v2/Property?$skip=500",
    };
    const page2 = { value: [mkRow("K2", "2026-01-03T00:00:00.000Z")] }; // no nextLink → done
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        calls.push(String(url));
        return new Response(JSON.stringify(calls.length === 1 ? page1 : page2), { status: 200 });
      }),
    );

    const client = new MlsGridClient("https://api.example.com/v2", "test-key", "onekey2");
    const out = await client.replicateDeep({
      watermark: "1970-01-01T00:00:00Z",
      maxPages: 8,
      deadline: Date.now() + 60_000,
    });

    expect(out.complete).toBe(true);
    expect(out.pages).toBe(2);
    expect(out.scanned).toBe(3); // includes the dropped Nassau row
    expect(out.listings.map((l) => l.id)).toEqual(["K1", "K2"]);
    expect(out.watermark).toBe("2026-01-03T00:00:00.000Z");
    // Photos stay as the ORIGINAL signed source URLs — the cron copies them into Blob.
    expect(out.listings[0].photos[0]).toMatch(/^https:\/\/media\.example\.com\//);
    // First request is self-built with the watermark filter (unquoted OData datetime);
    // the second follows @odata.nextLink verbatim.
    expect(calls[0]).toContain("ModificationTimestamp%20gt%201970-01-01T00%3A00%3A00Z");
    expect(calls[0]).not.toContain("%24orderby"); // default order IS ModificationTimestamp asc
    expect(calls[1]).toBe("https://api.example.com/v2/Property?$skip=500");
  }, 15_000);

  it("stops at maxPages mid-pass and reports an incomplete pass with progress", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            value: [mkRow("K9", "2026-02-01T00:00:00.000Z")],
            "@odata.nextLink": "https://api.example.com/v2/Property?$skip=500",
          }),
          { status: 200 },
        ),
      ),
    );

    const client = new MlsGridClient("https://api.example.com/v2", "test-key", "onekey2");
    const out = await client.replicateDeep({
      watermark: "1970-01-01T00:00:00Z",
      maxPages: 1,
      deadline: Date.now() + 60_000,
    });

    expect(out.complete).toBe(false); // next run resumes with `gt` the new watermark
    expect(out.pages).toBe(1);
    expect(out.watermark).toBe("2026-02-01T00:00:00.000Z");
    expect(out.listings).toHaveLength(1);
  });
});

describe("replicateNewest (priority photo set)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("orders by ModificationTimestamp desc, keeps signed URLs, stops on a short page", async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        calls.push(String(url));
        return new Response(
          JSON.stringify({
            value: [
              { ...row, ListingId: "N1" },
              { ...row, ListingId: "OUT", CountyOrParish: "Nassau" },
            ],
          }),
          { status: 200 },
        );
      }),
    );

    const client = new MlsGridClient("https://api.example.com/v2", "test-key", "onekey2");
    const out = await client.replicateNewest({ maxPages: 3, deadline: Date.now() + 60_000 });

    expect(calls).toHaveLength(1); // short page (< $top) → head exhausted, no page 2
    expect(calls[0]).toContain("$orderby=ModificationTimestamp%20desc");
    expect(calls[0]).toContain("$skip=0");
    expect(out.map((l) => l.id)).toEqual(["N1"]); // six-county filter still applies
    // Photos stay as the ORIGINAL signed source URLs — the cron copies them into Blob.
    expect(out[0].photos[0]).toMatch(/^https:\/\/media\.example\.com\//);
  }, 15_000);
});
