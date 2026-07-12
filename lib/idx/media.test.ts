import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getListingMedia, getProxiedPhotoPaths, resetMediaCacheForTests } from "./media";

/** RESO /Property?$expand=Media response with the given Media rows. */
function mlsResponse(media: unknown[] | undefined) {
  return new Response(JSON.stringify({ value: media === undefined ? [] : [{ ListingId: "L1", Media: media }] }), {
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  resetMediaCacheForTests();
  vi.stubEnv("MLS_API_KEY", "test-key");
  vi.stubEnv("MLS_API_ENDPOINT", "https://mls.example.com/v2");
  vi.stubEnv("MLS_FEED_ID", "onekey2");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getListingMedia", () => {
  it("resolves Order-sorted Photo URLs via one $expand=Media lookup", async () => {
    const fetchMock = vi.fn(async (url: string | URL) => {
      expect(String(url)).toContain("$expand=Media");
      expect(decodeURIComponent(String(url))).toContain("ListingId eq 'L1'");
      return mlsResponse([
        { MediaURL: "https://media.example.com/2.jpg", Order: 2, MediaCategory: "Photo" },
        { MediaURL: "https://media.example.com/0.jpg", Order: 0 },
        { MediaURL: "https://media.example.com/doc.pdf", Order: 1, MediaCategory: "Document" },
        { MediaURL: "https://media.example.com/1.jpg", Order: 1, MediaCategory: "Photo" },
      ]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const urls = await getListingMedia("L1");
    expect(urls).toEqual([
      "https://media.example.com/0.jpg",
      "https://media.example.com/1.jpg",
      "https://media.example.com/2.jpg",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches the per-listing lookup — repeat views cost ZERO extra MLS calls", async () => {
    const fetchMock = vi.fn(async () => mlsResponse([{ MediaURL: "https://media.example.com/0.jpg", Order: 0 }]));
    vi.stubGlobal("fetch", fetchMock);

    await getListingMedia("L1");
    await getListingMedia("L1");
    await getListingMedia("L1");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null on an MLS 429 and negative-caches so errors never hammer", async () => {
    const fetchMock = vi.fn(async () => new Response("throttled", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await getListingMedia("L1")).toBeNull();
    expect(await getListingMedia("L1")).toBeNull(); // within the 90s negative-cache window
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns [] (stable no-photos fact) for an unknown listing id", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => mlsResponse(undefined)));
    expect(await getListingMedia("NOPE")).toEqual([]);
  });

  it("returns null without any network call when MLS creds are absent", async () => {
    vi.stubEnv("MLS_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await getListingMedia("L1")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed ids without any network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await getListingMedia("../etc/passwd")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("getProxiedPhotoPaths", () => {
  it("maps the resolved media count to /api/media proxy paths", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        mlsResponse([
          { MediaURL: "https://media.example.com/0.jpg", Order: 0 },
          { MediaURL: "https://media.example.com/1.jpg", Order: 1 },
        ]),
      ),
    );
    expect(await getProxiedPhotoPaths("L1")).toEqual(["/api/media/L1/0", "/api/media/L1/1"]);
  });

  it("falls back to the single primary path when MLS can't answer", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 500 })));
    expect(await getProxiedPhotoPaths("L1")).toEqual(["/api/media/L1/0"]);
  });
});
