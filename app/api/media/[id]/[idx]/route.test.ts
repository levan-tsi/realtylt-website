import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetMediaCacheForTests } from "@/lib/idx/media";
import { GET } from "./route";

const call = (id: string, idx: string) =>
  GET(new Request(`http://localhost/api/media/${id}/${idx}`), {
    params: Promise.resolve({ id, idx }),
  });

/** fetch stub: MLS data lookups get a Media list; media-CDN URLs get image bytes. */
function stubFetch(opts: { photos?: string[]; dataStatus?: number; imageStatus?: number } = {}) {
  const { photos = ["https://media.example.com/a/0.jpg"], dataStatus = 200, imageStatus = 200 } = opts;
  const fetchMock = vi.fn(async (url: string | URL) => {
    const u = String(url);
    if (u.includes("/Property?")) {
      if (dataStatus !== 200) return new Response("err", { status: dataStatus });
      return new Response(
        JSON.stringify({
          value: [{ ListingId: "L1", Media: photos.map((p, i) => ({ MediaURL: p, Order: i, MediaCategory: "Photo" })) }],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
    if (imageStatus !== 200) return new Response("busy", { status: imageStatus });
    return new Response(new Uint8Array([0xff, 0xd8, 0xff]), {
      headers: { "Content-Type": "image/jpeg" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  resetMediaCacheForTests();
  vi.stubEnv("MLS_API_KEY", "test-key");
  vi.stubEnv("MLS_API_ENDPOINT", "https://mls.example.com/v2");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/media/[id]/[idx] — validation", () => {
  it("404s malformed ids and out-of-range indexes", async () => {
    const fetchMock = stubFetch();
    expect((await call("../secrets", "0")).status).toBe(404);
    expect((await call("L1", "-1")).status).toBe(404);
    expect((await call("L1", "41")).status).toBe(404);
    expect((await call("L1", "1.5")).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("GET /api/media/[id]/[idx] — failure contract (never a broken tile)", () => {
  it("serves the branded SVG with no-store when MLS data lookup fails (e.g. 429)", async () => {
    stubFetch({ dataStatus: 429 });
    const res = await call("L1", "0");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Media-Status")).toBe("unavailable");
    expect(await res.text()).toContain("Photo coming soon");
  });

  it("serves the branded SVG with no-store when the media CDN rejects (budget 429)", async () => {
    stubFetch({ imageStatus: 429 });
    const res = await call("L1", "0");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(res.headers.get("X-Media-Status")).toBe("unavailable");
  });

  it("serves a CDN-cacheable SVG when the listing has no photo at that index", async () => {
    stubFetch({ photos: ["https://media.example.com/a/0.jpg"] });
    const res = await call("L1", "5");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=3000");
    expect(res.headers.get("Cache-Control")).not.toContain("no-store");
    expect(res.headers.get("X-Media-Status")).toBe("empty");
  });
});

describe("GET /api/media/[id]/[idx] — success + caching", () => {
  it("streams the photo with the 50-min CDN cache header (under signed-URL validity)", async () => {
    stubFetch();
    const res = await call("L1", "0");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=300, s-maxage=3000, stale-while-revalidate=86400",
    );
    expect(res.headers.get("X-Media-Status")).toBe("ok");
  });

  it("shares ONE MLS data lookup across all of a listing's photos", async () => {
    const fetchMock = stubFetch({
      photos: ["https://media.example.com/a/0.jpg", "https://media.example.com/a/1.jpg"],
    });
    await call("L1", "0");
    await call("L1", "1");
    const dataCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes("/Property?"));
    expect(dataCalls.length).toBe(1); // 3 fetches total: 1 data + 2 images
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
