import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __seedMirroredForTests,
  __seedSnapshotMediaForTests,
  resetMediaCacheForTests,
} from "@/lib/idx/media";
import { __resetMlsGridDataCallCount, mlsGridDataCallCount } from "@/lib/idx/mls-fetch";
import { __resetStorageProbeCacheForTests } from "@/lib/idx/storage";
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
  __resetStorageProbeCacheForTests();
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

describe("GET /api/media/[id]/[idx] — STORAGE-FIRST (mirrored photos)", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co");
    __seedMirroredForTests("L1", 1); // photo 0 is mirrored, photo 1 is not
  });

  it("redirects a mirrored photo to the permanent public bucket object — no MLS fetch", async () => {
    const fetchMock = stubImage();
    const res = await call("L1", "0");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "https://proj.supabase.co/storage/v1/object/public/mls-photos/L1/0.jpg",
    );
    expect(res.headers.get("X-Media-Status")).toBe("storage");
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    expect(fetchMock).not.toHaveBeenCalled(); // storage is served without touching the media host
    expect(mlsGridDataCallCount()).toBe(0);
  });

  it("still serves storage after the source URL would have expired (storage never expires)", async () => {
    // No source URL seeded at index 0 here would matter — the route never looks at it once
    // mirrored. Prove it by seeding a junk (expired-style) source and confirming storage wins.
    __seedSnapshotMediaForTests("L1", ["https://media.mlsgrid.com/a/0.jpg?expires=1&token=dead"]);
    __seedMirroredForTests("L1", 1);
    const fetchMock = stubImage(403); // source URL is dead — would 403 if the route used it
    const res = await call("L1", "0");
    expect(res.status).toBe(302);
    expect(res.headers.get("X-Media-Status")).toBe("storage");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the proxy for an index beyond the mirrored prefix", async () => {
    const fetchMock = stubImage();
    const res = await call("L1", "1"); // index 1 not mirrored → proxy the (fresh) source URL
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Media-Status")).toBe("ok");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain("media.mlsgrid.com");
  });
});

describe("GET /api/media/[id]/[idx] — wiped-marker self-heal (storage probe)", () => {
  // Reproduces the reported bug: the hourly sync upserts with a full-JSONB replace, so a run without
  // a storage-write key wipes photosMirrored (mirror marker → 0) even though the storage objects
  // still exist and the signed source URL is long dead. The route must still serve the photo.
  function stubHeadAndImage(headStatus: number, imageStatus = 200) {
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      if (init?.method === "HEAD") return new Response(null, { status: headStatus });
      if (imageStatus !== 200) return new Response("busy", { status: imageStatus });
      return new Response(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { "Content-Type": "image/jpeg" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co");
    // NOTE: no __seedMirroredForTests → mirror marker is 0 (wiped), but the source URLs seeded at
    // the top level are the (now-dead) signed URLs the proxy would otherwise fall back to.
  });

  it("probes the permanent object and redirects to storage — no media-host GET, no MLS", async () => {
    const fetchMock = stubHeadAndImage(200); // storage object still exists
    const res = await call("L1", "0");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "https://proj.supabase.co/storage/v1/object/public/mls-photos/L1/0.jpg",
    );
    expect(res.headers.get("X-Media-Status")).toBe("storage-probe");
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    // ONLY a HEAD probe — the dead source URL is never fetched, and MLS is never touched.
    expect(fetchMock.mock.calls.every(([, init]) => (init as RequestInit)?.method === "HEAD")).toBe(true);
    expect(mlsGridDataCallCount()).toBe(0);
  });

  it("falls back to the proxy when the storage probe misses (object truly absent)", async () => {
    const fetchMock = stubHeadAndImage(404, 200); // no storage object, source URL still fetches
    const res = await call("L1", "0");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Media-Status")).toBe("ok");
    const methods = fetchMock.mock.calls.map(([, init]) => (init as RequestInit)?.method ?? "GET");
    expect(methods).toContain("HEAD"); // probed first
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes("media.mlsgrid.com"))).toBe(true);
  });

  it("does not probe when the marker is present (mirrored>0 already serves storage directly)", async () => {
    __seedMirroredForTests("L1", 1);
    const fetchMock = stubHeadAndImage(200);
    const res = await call("L1", "0"); // index 0 < mirrored → direct storage, no probe needed
    expect(res.status).toBe(302);
    expect(res.headers.get("X-Media-Status")).toBe("storage");
    expect(fetchMock).not.toHaveBeenCalled();
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
