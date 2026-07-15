import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyIdxSync, DbIdxClient, getDbMediaUrls, normalizeForDb } from "./db";
import type { Listing } from "./types";

const LISTING: Listing = {
  id: "KEY777", price: 650_000, address: "9 Harbor Lane", city: "Nyack", state: "NY",
  zip: "10960", county: "rockland", beds: 4, baths: 2.5, sqft: 2100,
  propertyType: "Residential", status: "Active", description: "test row", features: [],
  photos: ["https://media.example.com/a.jpg", "https://media.example.com/b.jpg"],
  lat: 41.09, lng: -73.92, listOfficeName: "Example Realty", originatingSystem: "OneKey MLS",
  modificationTimestamp: "2026-07-14T08:00:00.000Z", listedAt: "2026-07-01T00:00:00.000Z",
  isFeatured: false,
};

const READY_STATE = [{ watermark: "2026-07-14T08:00:00.000Z", baseline_complete: true, last_synced_at: "2026-07-15T10:00:00.000Z" }];

/** Route stubbed fetch by URL substring; records every requested URL. */
function stubFetch(handler: (url: string) => { body: unknown; total?: number }) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url);
      const { body, total } = handler(url);
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: total != null ? { "content-range": `0-9/${total}` } : {},
      });
    }),
  );
  return calls;
}

beforeEach(() => {
  process.env.SUPABASE_URL = "https://test-project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "test-anon-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
});

describe("DbIdxClient.search", () => {
  it("filters over the generated columns, maps rows to cover-proxy cards", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 37 };
    });

    const result = await new DbIdxClient().search({
      county: "brooklyn", priceMin: 100_000, priceMax: 900_000, bedsMin: 3,
      q: "harbor", sort: "price-asc", page: 2, pageSize: 12,
    });

    const listingCall = calls.find((u) => u.includes("idx_listings"))!;
    expect(listingCall).toContain("county=eq.brooklyn");
    expect(listingCall).toContain("price=gte.100000");
    expect(listingCall).toContain("price=lte.900000");
    expect(listingCall).toContain("beds=gte.3");
    expect(listingCall).toContain(`search_hay=ilike.${encodeURIComponent("*harbor*")}`);
    expect(listingCall).toContain("order=price.asc,id.asc");
    expect(listingCall).toContain("limit=12");
    expect(listingCall).toContain("offset=12"); // page 2
    expect(result.total).toBe(37);
    expect(result.totalPages).toBe(4);
    expect(result.dataLastUpdated).toBe("2026-07-15T10:00:00.000Z");
    // Cards must NEVER carry raw MediaURLs — one stable same-origin cover path.
    expect(result.listings[0].photos).toEqual(["/api/media/KEY777/0"]);
  });

  it("serves the snapshot fallback until the baseline completes", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state"))
        return { body: [{ ...READY_STATE[0], baseline_complete: false }] };
      throw new Error("must not query idx_listings before the baseline");
    });

    const result = await new DbIdxClient().search({ pageSize: 3 });
    expect(calls.filter((u) => u.includes("idx_listings"))).toHaveLength(0);
    expect(result.listings.length).toBeGreaterThan(0); // committed snapshot serves
  });
});

describe("DbIdxClient.searchPins", () => {
  it("pages the whole filtered set in 1000-row chunks and drops Null Island rows", async () => {
    const pin = (id: string, lat = 41.1) => ({
      id, price: 1, lat, lng: -73.9, address: "x", city: "y", zip: "z", beds: 1, baths: 1, office: "o",
    });
    const page1 = Array.from({ length: 1000 }, (_, i) => pin(`P${i}`));
    page1[3] = pin("NULLISH", 0); // no coords → dropped
    const page2 = [pin("LAST")];
    let listingCalls = 0;
    stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      listingCalls++;
      return listingCalls === 1 ? { body: page1, total: 1001 } : { body: page2 };
    });

    const { pins, total } = await new DbIdxClient().searchPins({ county: "queens" });
    expect(total).toBe(1001);
    expect(pins).toHaveLength(1000); // 1001 rows minus the coordinate-less one
    expect(listingCalls).toBe(2);
  });
});

describe("write helpers", () => {
  it("normalizeForDb makes every timestamp toISOString-uniform so text sorts chronologically", () => {
    const n = normalizeForDb({ ...LISTING, listedAt: "2026-07-01T00:00:00Z", modificationTimestamp: "2026-07-14T08:00:00+00:00" });
    expect(n.listedAt).toBe("2026-07-01T00:00:00.000Z");
    expect(n.modificationTimestamp).toBe("2026-07-14T08:00:00.000Z");
  });

  it("applyIdxSync posts the secret-gated RPC body", async () => {
    let posted: { url: string; body: string } | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        posted = { url: String(input), body: String(init?.body) };
        return new Response(JSON.stringify({ upserted: 1, deactivated: 2 }), { status: 200 });
      }),
    );

    const out = await applyIdxSync({
      secret: "s3cret", upserts: [LISTING], deactivateIds: ["GONE1"], watermark: "2026-07-15T00:00:00.000Z",
    });
    expect(out).toEqual({ upserted: 1, deactivated: 2 });
    expect(posted!.url).toContain("/rest/v1/rpc/idx_sync_apply");
    const body = JSON.parse(posted!.body);
    expect(body._secret).toBe("s3cret");
    expect(body._upserts[0].id).toBe("KEY777");
    expect(body._deactivate_ids).toEqual(["GONE1"]);
    expect(body._watermark).toBe("2026-07-15T00:00:00.000Z");
  });
});

describe("getDbMediaUrls", () => {
  it("returns the stored photo array for an active listing", async () => {
    stubFetch((url) =>
      url.includes("idx_listings") ? { body: [{ photos: LISTING.photos }] } : { body: [] },
    );
    expect(await getDbMediaUrls("KEY777")).toEqual(LISTING.photos);
  });

  it("returns null when Supabase is unconfigured (caller falls back to the snapshot)", async () => {
    delete process.env.SUPABASE_URL;
    expect(await getDbMediaUrls("KEY777")).toBeNull();
  });
});
