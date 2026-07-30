import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __seedMirroredForTests,
  __seedSnapshotMediaForTests,
  getProxiedPhotoPaths,
  getSnapshotMediaUrls,
  resetMediaCacheForTests,
} from "./media";
import { __resetMlsGridDataCallCount, mlsGridDataCallCount } from "./mls-fetch";

beforeEach(() => {
  resetMediaCacheForTests();
  __resetMlsGridDataCallCount();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSnapshotMediaUrls — reads the committed snapshot, never MLS", () => {
  it("returns the listing's ordered permanent MediaURLs from the snapshot", () => {
    __seedSnapshotMediaForTests("L1", [
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
    expect(getSnapshotMediaUrls("L1")).toEqual([
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
  });

  it("returns [] for a listing with no stored photos or an unknown id", () => {
    expect(getSnapshotMediaUrls("UNKNOWNID")).toEqual([]);
  });

  it("rejects malformed ids", () => {
    expect(getSnapshotMediaUrls("../etc/passwd")).toEqual([]);
  });

  it("makes ZERO MLS Grid DATA-API calls (never fetches)", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    __seedSnapshotMediaForTests("L1", ["https://media.mlsgrid.com/a/0.jpg"]);
    getSnapshotMediaUrls("L1");
    getSnapshotMediaUrls("L1");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mlsGridDataCallCount()).toBe(0);
  });
});

describe("getProxiedPhotoPaths", () => {
  it("maps the snapshot's photo count to /api/media proxy paths", async () => {
    __seedSnapshotMediaForTests("L1", [
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
    expect(await getProxiedPhotoPaths("L1")).toEqual({
      paths: ["/api/media/L1/0", "/api/media/L1/1"],
      mirrored: 0,
    });
  });

  it("reports how many photos are mirrored, so the page knows when a count is a FACT", async () => {
    __seedSnapshotMediaForTests("L1", [
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
    ]);
    __seedMirroredForTests("L1", 2);
    expect(await getProxiedPhotoPaths("L1")).toEqual({
      paths: ["/api/media/L1/0", "/api/media/L1/1"],
      mirrored: 2,
    });
  });

  it("never reports more mirrored photos than the listing claims", async () => {
    __seedSnapshotMediaForTests("L1", ["https://media.mlsgrid.com/a/0.jpg"]);
    __seedMirroredForTests("L1", 9); // stale marker from a wiped/re-baselined sync
    expect((await getProxiedPhotoPaths("L1")).mirrored).toBe(1);
  });

  it("returns NO paths for a genuinely photo-less listing (the page shows branded markup)", async () => {
    // Claiming /api/media/L1/0 here put an <img> on the page whose only possible content is the
    // "photo coming soon" artwork, and listed it in the page's JSON-LD as a photo of the home.
    expect(await getProxiedPhotoPaths("L1")).toEqual({ paths: [], mirrored: 0 });
  });
});

/** The owner's 2026-07-30 repro: a card promising 8 photos, a listing page showing 1. The gallery
 * is bound by photos_servable now, so the page renders exactly what the proxy can serve — the same
 * number the card and the map popup print. */
describe("getProxiedPhotoPaths — bound by photos_servable (DB path)", () => {
  const seedDb = (body: unknown) => {
    process.env.SUPABASE_URL = "https://test-project.supabase.co";
    process.env.SUPABASE_ANON_KEY = "test-anon-key";
    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        calls.push(String(input));
        return new Response(JSON.stringify(body), { status: 200 });
      }),
    );
    return calls;
  };

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("truncates a 6-photo claim to the 2 the proxy can actually serve", async () => {
    const photos = Array.from({ length: 6 }, (_, i) => `https://media.mlsgrid.com/a/${i}.jpg`);
    const calls = seedDb([{ photos, mirrored: 0, servable: 2 }]);

    expect(await getProxiedPhotoPaths("KEY949886")).toEqual({
      paths: ["/api/media/KEY949886/0", "/api/media/KEY949886/1"],
      mirrored: 2,
    });
    // mirrored === paths.length is what lets the page PRINT the count instead of proving it tile
    // by tile, and it is read off the column — never off the wiped JSONB marker.
    expect(calls[0]).toContain("servable:photos_servable");
  });

  it("keeps one speculative path when nothing is mirrored yet, and does not claim it as a fact", async () => {
    const photos = ["https://media.mlsgrid.com/a/0.jpg", "https://media.mlsgrid.com/a/1.jpg"];
    seedDb([{ photos, mirrored: 0, servable: 0 }]);

    expect(await getProxiedPhotoPaths("KEY000001")).toEqual({
      paths: ["/api/media/KEY000001/0"],
      mirrored: 0,
    });
  });

  it("renders every claimed photo when the column has not been computed for the row", async () => {
    const photos = ["https://media.mlsgrid.com/a/0.jpg", "https://media.mlsgrid.com/a/1.jpg"];
    seedDb([{ photos, mirrored: 1, servable: null }]);

    expect(await getProxiedPhotoPaths("KEY000002")).toEqual({
      paths: ["/api/media/KEY000002/0", "/api/media/KEY000002/1"],
      mirrored: 1,
    });
  });
});
