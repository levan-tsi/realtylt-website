import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_COVER, fetchDbArticles, rowToArticle, safeCover } from "./db";

const SUPA = "https://wpfmhmnceflfruhssqqb.supabase.co";

const row = (over: Record<string, unknown> = {}) => ({
  slug: "hudson-valley-market-check-in",
  title: "Hudson Valley Market Check-In",
  excerpt: "An excerpt.",
  body: "## Hello\n\nSome **markdown**.",
  cover_image_url: "/images/listings/house-12.jpg",
  author_name: "Levan Tsiklauri",
  published_at: "2026-07-13 15:45:26.798964+00",
  seo_title: "SEO title",
  seo_description: "SEO description",
  ...over,
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("safeCover — only our own images ever reach next/image", () => {
  it("accepts a site-relative path", () => {
    expect(safeCover("/images/listings/house-01.jpg")).toBe("/images/listings/house-01.jpg");
  });

  it("accepts a Supabase Storage public URL on OUR project", () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    const url = `${SUPA}/storage/v1/object/public/blog-media/cover.jpg`;
    expect(safeCover(url)).toBe(url);
  });

  it("falls back for a foreign host, a protocol-relative URL, and junk", () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    expect(safeCover("https://evil.example/x.jpg")).toBe(DEFAULT_COVER);
    expect(safeCover("//evil.example/x.jpg")).toBe(DEFAULT_COVER);
    expect(safeCover("javascript:alert(1)")).toBe(DEFAULT_COVER);
    expect(safeCover(null)).toBe(DEFAULT_COVER);
    expect(safeCover("")).toBe(DEFAULT_COVER);
    expect(safeCover(42)).toBe(DEFAULT_COVER);
  });

  it("rejects a Supabase URL from a DIFFERENT project", () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    expect(safeCover("https://someoneelse.supabase.co/storage/v1/object/public/x/y.jpg")).toBe(
      DEFAULT_COVER,
    );
  });
});

describe("rowToArticle", () => {
  it("maps a good row and derives the display date from published_at", () => {
    const a = rowToArticle(row())!;
    expect(a.slug).toBe("hudson-valley-market-check-in");
    expect(a.date).toBe("2026-07-13");
    expect(a.source).toBe("db");
    expect(a.placeholder).toBe(false);
    expect(a.body).toEqual({ kind: "markdown", markdown: "## Hello\n\nSome **markdown**." });
    expect(a.seoTitle).toBe("SEO title");
  });

  it("drops rows that can't be rendered or routed", () => {
    expect(rowToArticle(row({ slug: "Not A Slug" }))).toBeNull();
    expect(rowToArticle(row({ slug: "../../etc/passwd" }))).toBeNull();
    expect(rowToArticle(row({ title: "  " }))).toBeNull();
    expect(rowToArticle(row({ body: "   " }))).toBeNull();
  });

  it("defaults the author when the column is blank", () => {
    expect(rowToArticle(row({ author_name: "" }))!.author).toBe("Levan Tsiklauri");
  });
});

describe("fetchDbArticles", () => {
  it("returns [] (and never fetches) when the CMS env is not configured", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await fetchDbArticles()).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("asks Supabase for PUBLISHED posts only, with the anon key and the blog cache tag", async () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify([row()]), { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const posts = await fetchDbArticles();
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("hudson-valley-market-check-in");

    const [url, opts] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit & { next?: unknown }];
    expect(url).toContain(`${SUPA}/rest/v1/blog_posts`);
    expect(url).toContain("status=eq.published");
    expect((opts.headers as Record<string, string>).apikey).toBe("anon-key");
    expect(opts.next).toEqual({ revalidate: 300, tags: ["blog"] });
  });

  it("degrades to static-only ([]) on an error status, a throw, or a junk payload", async () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");

    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    expect(await fetchDbArticles()).toEqual([]);

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));
    expect(await fetchDbArticles()).toEqual([]);

    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ oops: true }), { status: 200 })));
    expect(await fetchDbArticles()).toEqual([]);
  });

  it("skips unrenderable rows instead of failing the whole page", async () => {
    vi.stubEnv("SUPABASE_URL", SUPA);
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify([row({ slug: "BAD SLUG" }), row()]), { status: 200 })),
    );
    const posts = await fetchDbArticles();
    expect(posts.map((p) => p.slug)).toEqual(["hudson-valley-market-check-in"]);
  });
});
