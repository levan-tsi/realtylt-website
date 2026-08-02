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

describe("GET /api/media/[id]/[idx] — failure contract (never a FAKE photo)", () => {
  it("answers a transient failure with an UNDECODABLE 503 so <img onError> actually fires", async () => {
    // THE 2026-07-26 BUG. This used to return the branded SVG alongside the 503. Chromium decodes
    // and DISPLAYS an image body regardless of the error status (measured: naturalWidth 200 /
    // naturalHeight 150, the placeholder's intrinsic size), so `load` fired instead of `error`.
    // Every throttled tile silently painted "Photo coming soon" as if it were a photo of the
    // house, and MlsImage's retry/drop ladder never ran. The failure body must not be an image.
    stubImage(429);
    const res = await call("L1", "0");
    expect(res.status).toBe(503);
    expect(res.headers.get("Content-Type")).not.toContain("image/");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Media-Status")).toBe("unavailable");
    const body = await res.text();
    expect(body).not.toContain("<svg");
    expect(body).not.toContain("Photo coming soon");
  });

  it("redirects to the branded coming-soon still when the listing has no photo at that index", async () => {
    const fetchMock = stubImage();
    const res = await call("L1", "5");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/images/mls/coming-soon.svg");
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

  it("keeps the branded artwork ONLY for the stable 'no photo here' case", async () => {
    // The placeholder is legitimate in exactly one situation: this index has no photo and never
    // will for this sync. Anything transient must stay undecodable so the client can drop the tile.
    const res = await call("L1", "5");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/images/mls/coming-soon.svg");
  });
});

describe("GET /api/media/[id]/[idx] — transient DB failure (the gray-card bug)", () => {
  it("storage rescues the tile when the DB drops; a true miss is no-store 503, never cacheable 'empty'", async () => {
    resetMediaCacheForTests(); // no snapshot data for LX
    __resetStorageProbeCacheForTests();
    vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    // Every PostgREST read drops (burst contention); the storage HEAD probe finds the
    // permanent object → the route must serve the mirrored copy, not a 503/empty.
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        if (String(url).includes("/rest/v1/")) throw new Error("socket dropped");
        return new Response(null, { status: 200 }); // storage HEAD → object exists
      }),
    );
    const rescued = await call("LX", "0");
    expect(rescued.status).toBe(302);
    expect(rescued.headers.get("X-Media-Status")).toBe("storage-probe");

    // And when storage really has nothing either, the failure must be no-store 503
    // (retryable), never the CDN-cacheable "empty" that pins a gray tile for real photos.
    __resetStorageProbeCacheForTests();
    resetMediaCacheForTests();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        if (String(url).includes("/rest/v1/")) throw new Error("socket dropped");
        return new Response(null, { status: 404 }); // storage HEAD → missing
      }),
    );
    const failed = await call("LX", "0");
    expect(failed.status).toBe(503);
    expect(failed.headers.get("Cache-Control")).toBe("no-store");
    expect(failed.headers.get("X-Media-Status")).toBe("unavailable");
  });
});

describe("GET /api/media/[id]/[idx] — marker under-counts surviving gallery (round-7 regression)", () => {
  it("serves gallery photos beyond the mirrored prefix when their Storage objects survive", async () => {
    // The re-baseline reset photosMirrored to the cover count (1) but the full gallery objects
    // 1.jpg..N.jpg still live in Storage. photos.length claims 3 → the route must probe + serve
    // idx 1 and 2 from Storage, not 503 them into placeholders.
    resetMediaCacheForTests();
    __resetStorageProbeCacheForTests();
    vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    __seedSnapshotMediaForTests("L3", [
      "https://media.mlsgrid.com/a/0.jpg",
      "https://media.mlsgrid.com/a/1.jpg",
      "https://media.mlsgrid.com/a/2.jpg",
    ]);
    __seedMirroredForTests("L3", 1); // marker says only the cover is mirrored…
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => new Response(null, { status: 200 })), // …but every Storage HEAD finds the object
    );
    const p1 = await call("L3", "1");
    expect(p1.status).toBe(302);
    expect(p1.headers.get("X-Media-Status")).toBe("storage-probe");
    expect(p1.headers.get("Location")).toBe("https://proj.supabase.co/storage/v1/object/public/mls-photos/L3/1.jpg");
    const p2 = await call("L3", "2");
    expect(p2.status).toBe(302);
    expect(p2.headers.get("Location")).toBe("https://proj.supabase.co/storage/v1/object/public/mls-photos/L3/2.jpg");
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

  it("falls back to the proxy for an index beyond the mirrored prefix with no Storage object", async () => {
    // idx 1 is beyond the mirrored prefix AND absent from Storage (HEAD 404) → the route probes
    // Storage, misses, and proxies the (fresh) source URL. (When the object DOES survive, the
    // marker-under-count test above proves it serves Storage instead — the better path.)
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      if (init?.method === "HEAD") return new Response(null, { status: 404 }); // no Storage object
      return new Response(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { "Content-Type": "image/jpeg" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await call("L1", "1");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Media-Status")).toBe("ok");
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes("media.mlsgrid.com"))).toBe(true);
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

describe("GET /api/media/[id]/[idx] — cover substitute (round-7 cover-photo bug)", () => {
  // A listing whose cover (idx 0) failed to mirror while later photos uploaded ends up with
  // photosMirrored=0 and NO 0.jpg object. The detail gallery still renders idx 1..n via the
  // storage probe, but the CARD asks idx 0 and would 503 → gray placeholder. The route must 302
  // idx 0 to the first real photo it finds (a genuine cover beats a placeholder). Measured on prod
  // 2026-07-25: 95 active listings, every one's first present index was 1 or 2.
  function stubHeadByIndex(present: (idx: number) => boolean) {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (init?.method === "HEAD") {
        const m = /\/(\d+)\.jpg$/.exec(String(url));
        return new Response(null, { status: present(m ? Number(m[1]) : -1) ? 200 : 404 });
      }
      return new Response("dead", { status: 403 }); // any source-URL GET is the dead signed URL
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co");
    // L1 is seeded with 2 photos (top-level beforeEach); its mirror marker is 0 (not seeded).
  });

  it("302s idx 0 to the first present later photo when the cover object is missing", async () => {
    const fetchMock = stubHeadByIndex((idx) => idx >= 1); // 0.jpg missing, 1.jpg present
    const res = await call("L1", "0");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "https://proj.supabase.co/storage/v1/object/public/mls-photos/L1/1.jpg",
    );
    expect(res.headers.get("X-Media-Status")).toBe("storage-cover-sub");
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    // Only HEAD probes — the dead source URL is never GET-fetched, MLS never touched.
    expect(fetchMock.mock.calls.every(([, init]) => (init as RequestInit)?.method === "HEAD")).toBe(true);
    expect(mlsGridDataCallCount()).toBe(0);
  });

  it("only substitutes the COVER (idx 0) — a gallery slot never borrows another index", async () => {
    stubHeadByIndex((idx) => idx === 2); // 2.jpg present, but idx 1 is being requested
    const res = await call("L1", "1");
    expect(res.headers.get("X-Media-Status")).not.toBe("storage-cover-sub");
    expect(res.status).toBe(503); // its own object missing + dead source URL → transient placeholder
  });

  it("falls back to the UPSTREAM cover substitute when nothing is mirrored yet", async () => {
    // Brand-new listing: no storage objects at all, but the signed URLs are still fresh. idx 0's
    // download fails while photo 1 downloads fine — serve photo 1 as the cover rather than the
    // placeholder. Bounded to COVER_SUBSTITUTE_MAX, media host only, never the DATA API.
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (init?.method === "HEAD") return new Response(null, { status: 404 }); // nothing mirrored
      if (String(url).endsWith("/0.jpg")) return new Response("dead", { status: 403 });
      return new Response(new Uint8Array([0xff, 0xd8, 0xff]), { headers: { "Content-Type": "image/jpeg" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await call("L1", "0");
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Media-Status")).toBe("ok-cover-sub");
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate");
    expect(mlsGridDataCallCount()).toBe(0);
  });

  it("does not substitute upstream for a gallery slot — only the cover borrows", async () => {
    const fetchMock = vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (init?.method === "HEAD") return new Response(null, { status: 404 });
      return new Response("dead", { status: 403 }); // every source URL is dead
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await call("L1", "1");
    expect(res.status).toBe(503);
    expect(res.headers.get("X-Media-Status")).toBe("unavailable");
    // idx 1 tried exactly its own URL — no fan-out across the gallery.
    const gets = fetchMock.mock.calls.filter(([, init]) => (init as RequestInit)?.method !== "HEAD");
    expect(gets).toHaveLength(1);
  });

  it("skips the substitute for a genuinely photo-less listing (cacheable empty SVG, not a probe fan-out)", async () => {
    resetMediaCacheForTests(); // L1 no longer seeded → photos.length 0, dbOk true
    __resetStorageProbeCacheForTests();
    vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co");
    stubHeadByIndex(() => false); // nothing in storage
    const res = await call("L1", "0");
    expect(res.headers.get("X-Media-Status")).toBe("empty"); // stable fact, not storage-cover-sub
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
