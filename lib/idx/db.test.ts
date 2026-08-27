import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyIdxSync, DbIdxClient, getDbMediaUrls, normalizeForDb, resetRotationCacheForTests } from "./db";
import { PIN_CAP, type Listing } from "./types";

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
  resetRotationCacheForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
});

describe("DbIdxClient.search", () => {
  it("retries a dropped first query instead of serving the snapshot (cold-start resilience)", async () => {
    let listingCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("idx_sync_state")) return new Response(JSON.stringify(READY_STATE), { status: 200 });
        listingCalls += 1;
        if (listingCalls === 1) throw new TypeError("fetch failed"); // cold connection drop
        return new Response(JSON.stringify([{ listing: LISTING }]), {
          status: 200,
          headers: { "content-range": "0-0/755" },
        });
      }),
    );

    const result = await new DbIdxClient().search({ garageMin: 2 });

    expect(listingCalls).toBe(2);
    expect(result.total).toBe(755); // real data, not the snapshot fallback
  });

  // Observed on the home page 2026-07-30: one dropped PostgREST read made the Featured rail
  // fall back to the shape-stale committed snapshot, while search() recovered from the same
  // blip because it was wrapped. Every visitor-facing card read is wrapped now.
  it("retries a dropped read on the home rails instead of serving the snapshot", async () => {
    let featuredCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("idx_sync_state")) return new Response(JSON.stringify(READY_STATE), { status: 200 });
        featuredCalls += 1;
        if (featuredCalls === 1) throw new TypeError("fetch failed"); // cold connection drop
        return new Response(JSON.stringify([{ listing: LISTING, photos_servable: 2 }]), { status: 200 });
      }),
    );

    const rail = await new DbIdxClient().getFeatured(1);

    // 3, not 2: the rail draws TWO pools now — the newest, plus a price-descending one so the
    // scarce high-end bands are represented (only 1.2% of inventory is above $5M, so freshness
    // alone never surfaces a $10M home). The first call is the injected drop, then both pools.
    expect(featuredCalls).toBe(3);
    expect(rail[0]?.id).toBe("KEY777"); // real row, not the snapshot fallback
  });

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

  // Round 23: the grid can be scoped to the map's viewport, so the list and the map answer
  // the same question — he caught page 2 of the county scope contradicting what the map
  // showed. The box uses the exact clause set /api/idx/pins always used (one builder).
  it("scopes the grid to a viewport box, and skips the mixed ring for it", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 151 };
    });

    const result = await new DbIdxClient().search({
      sort: "mixed", page: 1, pageSize: 150,
      bounds: { north: 41.8, south: 41.2, east: -73.6, west: -74.4 },
    });

    const listingCalls = calls.filter((u) => u.includes("idx_listings"));
    // No rotationTotal pre-count: a viewport query is ephemeral, so `mixed` serves it straight
    // (one query, not two) instead of building a daily ring per panned box.
    expect(listingCalls).toHaveLength(1);
    expect(listingCalls[0]).toContain("lat=gte.41.2");
    expect(listingCalls[0]).toContain("lat=lte.41.8");
    expect(listingCalls[0]).toContain("lng=gte.-74.4");
    expect(listingCalls[0]).toContain("lng=lte.-73.6");
    expect(listingCalls[0]).toContain("limit=150");
    expect(listingCalls[0]).toContain("offset=0");
    expect(result.total).toBe(151);
    expect(result.totalPages).toBe(2); // paging still exists ABOVE the viewport page size
  });

  // "I wanted to filter properties that was listed 3-6 months ago and it was only up to 3
  // months." Both ends are comparisons against the SAME listed_at column, inverted: the newest
  // end is a gte (listed since), the oldest end an lte (listed before).
  it("asks the feed for a Days-on-market WINDOW, not just a ceiling", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 12 };
    });
    const now = Date.now();

    await new DbIdxClient().search({ listedMinDays: 90, newWithinDays: 180, sort: "newest" });

    const listingCall = decodeURIComponent(calls.find((u) => u.includes("idx_listings"))!);
    const since = /listed_at=gte\.([^&]+)/.exec(listingCall)?.[1];
    const until = /listed_at=lte\.([^&]+)/.exec(listingCall)?.[1];
    expect(since).toBeDefined();
    expect(until).toBeDefined();
    // 180 days back and 90 days back, to the second the query was built.
    expect(Math.round((now - Date.parse(since!)) / 86_400_000)).toBe(180);
    expect(Math.round((now - Date.parse(until!)) / 86_400_000)).toBe(90);
    // The oldest end is its own filter — asking only for it must not smuggle in a ceiling,
    // or "listed at least 3 months ago" would quietly become a window.
    const floorCalls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 12 };
    });
    await new DbIdxClient().search({ listedMinDays: 90, sort: "newest" });
    const floorCall = decodeURIComponent(floorCalls.find((u) => u.includes("idx_listings"))!);
    expect(floorCall).toMatch(/listed_at=lte\./);
    expect(floorCall).not.toMatch(/listed_at=gte\./);
  });

  // The owner's "it takes you to page 2 and that's it" bug. `mixed` used to add a day-seeded
  // ROW offset to every page, and that offset can be nearly the whole set — so page 2 ran off
  // the end. Measured on production before the fix: Orange county with 3+ beds is 1,720
  // listings over 48 pages, and page 2 returned FOUR of them.
  describe("the mixed rotation must never break paging", () => {
    /** The page query selects cards; the rotation's count query selects ids. */
    const CARD_MARKER = "photos_servable";

    /** Walk pages of a `rows`-row set with the rotation on; collect the offsets asked for. */
    const walkPages = async (rows: number, size: number, pages: number[]) => {
      const offsets: number[] = [];
      stubFetch((url) => {
        if (url.includes("idx_sync_state")) return { body: READY_STATE };
        const m = /offset=(\d+)/.exec(url);
        if (m && url.includes(CARD_MARKER)) offsets.push(Number(m[1]));
        // The count query asks for one id; the page query asks for cards.
        if (!url.includes(CARD_MARKER)) return { body: [{ id: "x" }], total: rows };
        const offset = Number(m?.[1] ?? 0);
        const n = Math.max(0, Math.min(size, rows - offset));
        return { body: Array.from({ length: n }, () => ({ listing: LISTING })), total: rows };
      });
      const results = [];
      for (const p of pages) results.push(await new DbIdxClient().search({ sort: "mixed", page: p, pageSize: size }));
      return { offsets, results };
    };

    it("asks for an offset inside the set on every page, and fills every page", async () => {
      const { offsets, results } = await walkPages(1720, 36, [1, 2, 3, 4, 47, 48]);
      // No request may ever point past the last row.
      for (const o of offsets) expect(o).toBeLessThan(1720);
      // Every offset is page-aligned — the rotation moves whole pages, never part of one.
      for (const o of offsets) expect(o % 36).toBe(0);
      // 47 full pages + one short tail page = 48. Only ONE page in the whole ring is short.
      const short = results.filter((r) => r.listings.length < 36).length;
      expect(short).toBeLessThanOrEqual(1);
      // And the page/total arithmetic the pager prints stays honest.
      expect(results[0].totalPages).toBe(48);
      expect(results[0].total).toBe(1720);
    });

    it("visits a different page each step — no page repeats within the run", async () => {
      const { offsets } = await walkPages(1720, 36, [1, 2, 3, 4]);
      const pageOffsets = offsets.filter((o, i) => offsets.indexOf(o) === i);
      expect(pageOffsets.length).toBe(offsets.length);
    });

    it("does not rotate a set that fits on one page", async () => {
      const { offsets } = await walkPages(10, 36, [1]);
      expect(offsets).toEqual([0]);
    });
  });

  // The owner's "8 pics on the map, one photo on the page" bug: the card pager used to be bound by
  // the photos ARRAY (the feed's claim), which 46% of active listings over-state.
  it("binds the card's photo count to photos_servable, not the feed's claim", async () => {
    stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      // LISTING claims two photos; storage can serve one.
      return { body: [{ listing: LISTING, photos_servable: 1 }], total: 1 };
    });

    const result = await new DbIdxClient().search({});
    expect(result.listings[0].photoCount).toBe(1);
  });

  it("falls back to the claim when photos_servable has not been computed for the row", async () => {
    stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      // A listing inserted since the last refresh — the column is still null.
      return { body: [{ listing: LISTING, photos_servable: null }], total: 1 };
    });

    const result = await new DbIdxClient().search({});
    expect(result.listings[0].photoCount).toBe(2);
  });

  it("serves map pins their photo count from photos_servable", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return {
        body: [{ id: "KEY777", price: 650_000, lat: 41.09, lng: -73.92, address: "9 Harbor Lane", city: "Nyack", zip: "10960", beds: 4, baths: 2.5, office: "Example Realty", photoCount: 6 }],
        total: 1,
      };
    });

    const { pins } = await new DbIdxClient().searchPins({}, { north: 42, south: 41, east: -73, west: -74 });
    const pinCall = calls.find((u) => u.includes("idx_listings") && !u.includes("idx_sync_state"))!;
    expect(pinCall).toContain("photoCount:photos_servable");
    expect(pinCall).not.toContain("photosMirrored");
    expect(pins[0].photoCount).toBe(6);
  });

  it("emits jsonb NUMERIC filters for the MORE panel (single arrow -> so 10 sorts above 2)", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 1 };
    });

    await new DbIdxClient().search({
      county: "orange", sqftMax: 3000, garageMin: 2, garageMax: 4,
      lotMin: 1, lotMax: 10, yearMin: 1990, yearMax: 2020, taxMax: 15000, withPhotosOnly: true,
    });

    const listingCall = calls.find((u) => u.includes("idx_listings") && !u.includes("idx_sync_state"))!;
    // EVERY fact is a real column. The four MORE-panel ones used to read out of the `listing`
    // jsonb, which timed out under PostgREST's exact count and silently fell back to the
    // committed snapshot — "Built 2000+" answered zero while the feed held 4,713 such homes.
    expect(listingCall).toContain("sqft=lte.3000");
    expect(listingCall).toContain("garage_spaces=gte.2");
    expect(listingCall).toContain("garage_spaces=lte.4");
    expect(listingCall).toContain("lot_acres=gte.1");
    expect(listingCall).toContain("lot_acres=lte.10");
    expect(listingCall).toContain("year_built=gte.1990");
    expect(listingCall).toContain("year_built=lte.2020");
    expect(listingCall).toContain("tax_annual=lte.15000");
    // "With photos" rides the photos_servable COLUMN, never the JSONB mirror marker: the sync's
    // full-JSONB upsert wipes the marker, so the old filter hid listings that do have photos.
    expect(listingCall).toContain("photos_servable=gt.0");
    expect(listingCall).not.toContain("listing->photosMirrored");
    // No filter may go back to reading the fat jsonb: that is what made these silently stale.
    expect(listingCall).not.toContain("listing->");
  });

  it("a sqft MAX never matches an unmeasured (0) sqft; an explicit MIN is its own guard", async () => {
    // Unlike lot/garage/tax (NULL when unknown), sqft defaults to 0 — measured round 41:
    // sqftMax alone matched 5,199 Active rows with no sqft, including 100% of Land.
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 1 };
    });
    const c = new DbIdxClient();
    await c.search({ sqftMax: 750 });
    const maxOnly = calls.find((u) => u.includes("sqft=lte.750"))!;
    expect(maxOnly).toContain("sqft=gte.1");
    await c.search({ sqftMin: 500, sqftMax: 3000 });
    const withMin = calls.find((u) => u.includes("sqft=lte.3000"))!;
    expect(withMin).toContain("sqft=gte.500");
    expect(withMin).not.toContain("sqft=gte.1");
  });

  it("defaults to the WHOLE served scope — HV counties AND NYC boroughs (owner's call, round 23)", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 5402 };
    });

    const result = await new DbIdxClient().search({});
    const listingCall = calls.find((u) => u.includes("idx_listings") && !u.includes("idx_sync_state"))!;
    expect(listingCall).toContain(
      "county=in.(dutchess,westchester,putnam,rockland,ulster,orange,bronx,brooklyn,manhattan,queens,staten-island)",
    );
    expect(listingCall).not.toContain("county=eq.");
    expect(result.total).toBe(5402);
  });

  it("clamps a past-the-end ?page= to the last real page instead of dropping to the snapshot", async () => {
    // PostgREST answers an offset past the end with 416 PGRST103, not an empty 200 — and its
    // Content-Range still carries the true count as `*/579`. Measured 2026-08-26 on
    // /api/idx/search?county=putnam&page=13: rest() threw, search() caught, and the visitor got
    // the committed snapshot — total 266, page 6 of 6, "Data last updated 2026-07-12" — against
    // a live 579 / 12 pages / 2026-08-27. Six-week-old prices under a live attribution line.
    const TOTAL = 579;
    const offsets: number[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("idx_sync_state")) return new Response(JSON.stringify(READY_STATE), { status: 200 });
        const offset = Number(new URL(url).searchParams.get("offset") ?? 0);
        offsets.push(offset);
        if (offset >= TOTAL) {
          return new Response(
            JSON.stringify({ code: "PGRST103", message: "Requested range not satisfiable" }),
            { status: 416, headers: { "content-range": `*/${TOTAL}` } },
          );
        }
        return new Response(JSON.stringify([{ listing: LISTING }]), {
          status: 200,
          headers: { "content-range": `${offset}-${offset}/${TOTAL}` },
        });
      }),
    );

    const r = await new DbIdxClient().search({ county: "putnam", pageSize: 50, page: 13, sort: "newest" });
    expect(offsets).toContain(600); // asked for the stale page
    expect(offsets).toContain(550); // then for the last real one
    expect(r.total).toBe(TOTAL); // the LIVE total, never the snapshot's
    expect(r.page).toBe(12);
    expect(r.totalPages).toBe(12);
    expect(r.listings).toHaveLength(1);
    expect(r.dataLastUpdated).toBe(READY_STATE[0].last_synced_at);
  });

  it("asks for every feed spelling of a manufactured home, not just two", async () => {
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [{ listing: LISTING }], total: 197 };
    });
    await new DbIdxClient().search({ homeType: "manufactured" });
    const call = calls.find((u) => u.includes("property_sub_type=in."))!;
    for (const v of ["Manufactured%20Home", "Mobile%20Home", "Manufactured%20On%20Land", "Mobile%20Home%20with%20Land"]) {
      expect(call).toContain(v);
    }
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

  it("bounded viewport: bbox query in 1000-row slices up to PIN_CAP (a single limit=3000 is silently clamped by PostgREST max-rows), drops Null Island", async () => {
    const pin = (id: string, lat = 40.7, lng = -73.85) => ({
      id, price: 1, lat, lng, address: "x", city: "y", zip: "z", beds: 1, baths: 1, office: "o",
    });
    const slice = (n: number, from: number) => Array.from({ length: n }, (_, i) => pin(`P${from + i}`));
    let listingCalls = 0;
    const urls: string[] = [];
    stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      listingCalls++;
      urls.push(url);
      // A real PostgREST answers at most max-rows (1000) per request, whatever the limit says.
      // Seen live: limit=3000 shipped exactly 1,000 pins under a banner reading "of 6,714".
      if (url.includes("offset=1000")) return { body: slice(1000, 1000) };
      if (url.includes("offset=2000")) {
        const rows = slice(1000, 2000);
        rows[2] = pin("NULLISH", 0, 0); // no coords → dropped
        return { body: rows };
      }
      return { body: slice(1000, 0), total: 4602 }; // content-range total = true in-bounds count
    });

    const { pins, total } = await new DbIdxClient().searchPins(
      { county: "queens" },
      { north: 40.7943, south: 40.5705, east: -73.6697, west: -73.9633 },
    );

    expect(listingCalls).toBe(3); // 1000-row slices up to PIN_CAP, never the 15k loop
    for (const u of urls) {
      expect(u).toContain("county=eq.queens");
      expect(u).toContain("lat=gte.40.5705");
      expect(u).toContain("lat=lte.40.7943");
      expect(u).toContain("lng=gte.-73.9633");
      expect(u).toContain("lng=lte.-73.6697");
      expect(u).toContain("limit=1000");
      expect(u).toContain("order=listed_at.desc");
    }
    expect(urls[1]).toContain("offset=1000");
    expect(urls[2]).toContain("offset=2000");
    expect(total).toBe(4602); // in-bounds count, so the UI can flag truncation
    expect(pins).toHaveLength(PIN_CAP - 1); // the coordinate-less row is dropped
    expect(new Set(pins.map((p) => p.id)).size).toBe(PIN_CAP - 1); // slices never overlap
  });

  it("bounded viewport under 1000 in-bounds rows: exactly one query", async () => {
    const pin = (id: string) => ({
      id, price: 1, lat: 40.7, lng: -73.85, address: "x", city: "y", zip: "z", beds: 1, baths: 1, office: "o",
    });
    let listingCalls = 0;
    stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      listingCalls++;
      return { body: Array.from({ length: 42 }, (_, i) => pin(`P${i}`)), total: 42 };
    });
    const { pins, total } = await new DbIdxClient().searchPins(
      { county: "queens" },
      { north: 40.7943, south: 40.5705, east: -73.6697, west: -73.9633 },
    );
    expect(listingCalls).toBe(1);
    expect(total).toBe(42);
    expect(pins).toHaveLength(42);
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

describe("getCountyActiveSlim (reports data)", () => {
  it("pages the county's slim rows and carries the sync time", async () => {
    const slim = { id: "K1", address: "1 A St", city: "Brooklyn", price: 500000, beds: 3, baths: 2, sqft: 1200, propertyType: "Residential", listOfficeName: "X" };
    const calls = stubFetch((url) => {
      if (url.includes("idx_sync_state")) return { body: READY_STATE };
      return { body: [slim] };
    });
    const out = await import("./db").then((m) => m.getCountyActiveSlim("brooklyn"));
    expect(out).not.toBeNull();
    expect(out!.rows).toEqual([slim]);
    expect(out!.dataLastUpdated).toBe("2026-07-15T10:00:00.000Z");
    const listingCall = calls.find((u) => u.includes("idx_listings"))!;
    expect(listingCall).toContain("county=eq.brooklyn");
    expect(listingCall).toContain("propertyType:property_type");
  });

  it("returns null before the baseline (caller falls back to the snapshot)", async () => {
    stubFetch((url) =>
      url.includes("idx_sync_state") ? { body: [{ ...READY_STATE[0], baseline_complete: false }] } : { body: [] },
    );
    expect(await import("./db").then((m) => m.getCountyActiveSlim("queens"))).toBeNull();
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
