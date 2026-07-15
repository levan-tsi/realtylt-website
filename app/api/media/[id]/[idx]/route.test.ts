import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __seedSnapshotMediaForTests, resetMediaCacheForTests } from "@/lib/idx/media";
import { __resetMlsGridDataCallCount, mlsGridDataCallCount } from "@/lib/idx/mls-fetch";
import { GET } from "./route";

const call = (id: string, idx: string) =>
  GET(new Request(`http://localhost/api/media/${id}/${idx}`), {
    params: Promise.resolve({ id, idx }),
  });

/** fetch stub for the media-host IMAGE download (the route no longer calls the DATA API). */
function stubImage(status = 200) {
  const fetchMock = vi.fn(async (_url: string | URL, _init?: RequestInit) => {
    if (status !== 200) return new Response("busy", { status });
    return new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
      headers: { "Content-Type": "image/jpeg" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  resetMediaCacheForTests();
  __resetMlsGridDataCallCount();
  vi.stubEnv("MLS_API_KEY", "test-token");
  __seedSnapshotMediaForTests("L1", [
    "https://media.mlsgrid.com/a/0.jpg",
    "https://media.mlsgrid.com/a/1.jpg",
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/media/[id]/[idx] — validation", () => {
  it("404s malformed ids and out-of-range indexes", async () => {
    const fetchMock = stubImage();
    expect((await call("../secrets", "0")).status).toBe(404);
    expect((await call("L1", "-1")).status).toBe(404);
    expect((await call("L1", "61")).status).toBe(404); // bound tracks MAX_PHOTOS (50) + headroom
    expect((await call("L1", "1.5")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/media/[id]/[idx] — never calls the MLS Grid DATA API", () => {
  it("serves photos with ZERO DATA-API calls (reads the snapshot, fetches only the image host)", async () => {
    const fetchMock = stubImage();
    await call("L1", "0");
    await call("L1", "1");
    // Two image downloads, but NO api.mlsgrid.com/Property DATA lookups.
    expect(fetchMock.mock.calls.every(([u]) => String(u).includes("media.mlsgrid.com"))).toBe(true);
    expect(mlsGridDataCallCount()).toBe(0);
  });

  it("sends the OAuth token as User-Agent when downloading the image (MLS Grid requirement)", async () => {
    const fetchMock = stubImage();
    await call("L1", "0");
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.headers).toMatchObject({ "User-Agent": "test-token" });
  });
});

describe("GET /api/media/[id]/[idx] — failure contract (never a broken tile)", () => {
  it("serves the branded SVG as a 503 with no-store when the media host rejects (client retries)", async () => {
    stubImage(429);
    const res = await call("L1", "0");
    expect(res.status).toBe(503); // transient → <img onError> fires → MlsImage self-heals
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Media-Status")).toBe("unavailable");
    expect(await res.text()).toContain("Photo coming soon");
  });

  it("serves a CDN-cacheable SVG when the listing has no photo at that index", async () => {
    const fetchMock = stubImage();
    const res = await call("L1", "5");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=3000");
    expect(res.headers.get("Cache-Control")).not.toContain("no-store");
    expect(res.headers.get("X-Media-Status")).toBe("empty");
    expect(fetchMock).not.toHaveBeenCalled(); // no photo → no image fetch, no MLS
  });

  it("serves a CDN-cacheable SVG for a listing with no stored photos at all", async () => {
    resetMediaCacheForTests(); // clears the seed → snapshot has nothing for L1
    const res = await call("L1", "0");
    expect(res.headers.get("X-Media-Status")).toBe("empty");
  });
});

describe("GET /api/media/[id]/[idx] — success + aggressive caching", () => {
  it("streams the photo with a long SWR CDN cache (repeat views never re-hit the media host)", async () => {
    stubImage();
    const res = await call("L1", "0");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    );
    expect(res.headers.get("X-Media-Status")).toBe("ok");
  });
});
