import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetRevalidateRateLimitForTests } from "@/lib/blog/revalidate";

// next/cache only works inside a Next render/request scope — stub it so the route's own
// auth/validation logic is what's under test, and assert WHAT it asked to revalidate.
const revalidateTag = vi.fn();
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...a: unknown[]) => revalidateTag(...a),
  revalidatePath: (...a: unknown[]) => revalidatePath(...a),
}));

const { POST } = await import("./route");

const SECRET = "s3cr3t-publish-token-abcdefghijklmnop";

function post(opts: { secret?: string; bearer?: string; body?: string; ip?: string } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.secret) headers["x-revalidate-secret"] = opts.secret;
  if (opts.bearer) headers["authorization"] = `Bearer ${opts.bearer}`;
  headers["x-forwarded-for"] = opts.ip ?? "203.0.113.5";
  return POST(
    new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers,
      body: opts.body ?? "",
    }),
  );
}

beforeEach(() => {
  resetRevalidateRateLimitForTests();
  revalidateTag.mockClear();
  revalidatePath.mockClear();
  vi.stubEnv("BLOG_REVALIDATE_SECRET", SECRET);
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/revalidate — auth", () => {
  it("rejects a MISSING secret with 401 and revalidates nothing", async () => {
    const res = await post();
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a WRONG secret with 401", async () => {
    const res = await post({ secret: "not-the-secret" });
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a secret that is a PREFIX of the real one", async () => {
    const res = await post({ secret: SECRET.slice(0, -1) });
    expect(res.status).toBe(401);
  });

  it("is DISABLED (503), not open, when no secret is configured", async () => {
    vi.stubEnv("BLOG_REVALIDATE_SECRET", "");
    const res = await post({ secret: "anything" });
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("accepts the secret in the x-revalidate-secret header", async () => {
    const res = await post({ secret: SECRET });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it("accepts the secret as an Authorization: Bearer token", async () => {
    const res = await post({ bearer: SECRET });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/revalidate — behaviour", () => {
  it("with no body: refreshes the blog tag, the index and the sitemap", async () => {
    const res = await post({ secret: SECRET });
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect((await res.json()).revalidated).toEqual(["tag:blog", "/blog", "/sitemap.xml"]);
  });

  it("with a slug: also refreshes that post's page", async () => {
    const res = await post({ secret: SECRET, body: JSON.stringify({ slug: "my-new-post" }) });
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/blog/my-new-post");
    expect((await res.json()).revalidated).toContain("/blog/my-new-post");
  });

  it("ignores a slug that isn't a real blog slug (no arbitrary path revalidation)", async () => {
    const res = await post({ secret: SECRET, body: JSON.stringify({ slug: "../../search" }) });
    expect(res.status).toBe(200);
    expect(revalidatePath).not.toHaveBeenCalledWith("/blog/../../search");
    expect((await res.json()).revalidated).toEqual(["tag:blog", "/blog", "/sitemap.xml"]);
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await post({ secret: SECRET, body: "{not json" });
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects an oversized body with 413", async () => {
    const res = await post({ secret: SECRET, body: JSON.stringify({ slug: "a".repeat(5000) }) });
    expect(res.status).toBe(413);
  });

  it("throttles a hammering caller with 429", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await post({ secret: SECRET, ip: "198.51.100.4" })).status).toBe(200);
    }
    expect((await post({ secret: SECRET, ip: "198.51.100.4" })).status).toBe(429);
    // other callers unaffected
    expect((await post({ secret: SECRET, ip: "198.51.100.9" })).status).toBe(200);
  });
});
