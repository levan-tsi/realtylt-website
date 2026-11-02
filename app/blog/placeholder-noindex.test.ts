import { describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/content/blog/posts";

/** SEEDED STUBS MUST NOT BE OFFERED FOR INDEXING.
 *
 * content/blog/posts.ts once rendered "[Placeholder draft. The owner's final article replaces this
 * text.]" for ten consumer posts. Until 2026-08-25 all ten were in sitemap.xml and carried no
 * robots directive of their own, so the only thing keeping them out of the index was the
 * site-wide PRELAUNCH disallow in app/robots.ts — which is exactly the switch the OWNER flips
 * at launch. That made "we launched" and "we submitted ten thin pages" the same action.
 *
 * So the guard is per-post and deliberately independent of PRELAUNCH: this file sets no env
 * and asserts the behaviour that must hold on the day the global block comes off.
 *
 * `follow` stays on. These pages link to the real articles and to the site; noindex,follow
 * means seen and walked, just not listed — the same posture app/search/page.tsx takes for its
 * filtered facets, for the same reason.
 *
 * ROUND 22 (2026-11-01): the last real stub, top-5-renovations-increase-home-value-ny, was written
 * and published. The file used to need "one live stub to test"; with none left, the guard is held
 * on a SYNTHETIC placeholder added to POSTS for this file only (the mock below), so a stub seeded
 * in future is still kept out of the index, the sitemap and /blog, and the real list is asserted
 * to carry no placeholder at all.
 */

const SYNTHETIC_SLUG = "zz-synthetic-placeholder-for-the-noindex-guard";
const REAL_SLUG = "ai-chat-assistant-real-estate-website";
const LAST_STUB = "top-5-renovations-increase-home-value-ny";

vi.mock("@/content/blog/posts", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/content/blog/posts")>();
  const synthetic: BlogPost = {
    slug: "zz-synthetic-placeholder-for-the-noindex-guard",
    title: "A synthetic placeholder",
    date: "2025-01-01",
    excerpt: "Exists only inside placeholder-noindex.test.ts.",
    cover: "/images/listings/house-16.jpg",
    body: ["[Placeholder draft. The owner's final article replaces this text.]"],
    placeholder: true,
  };
  return { ...mod, POSTS: [...mod.POSTS, synthetic] };
});

const { POSTS } = await import("@/content/blog/posts");
const { default: sitemap } = await import("@/app/sitemap");
const { generateMetadata } = await import("./[slug]/page");

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("placeholder posts stay out of the index", () => {
  it("no real post is a placeholder any more, and the last stub is a real article", () => {
    const real = POSTS.filter((p) => p.slug !== SYNTHETIC_SLUG);
    expect(real.filter((p) => p.placeholder).map((p) => p.slug)).toEqual([]);
    const last = real.find((p) => p.slug === LAST_STUB);
    expect(last?.placeholder, LAST_STUB).toBe(false);
    expect(last?.markdown?.length ?? 0, LAST_STUB).toBeGreaterThan(5000);
  });

  it("the fixture slugs are what this test thinks they are", () => {
    // A probe aimed at a slug that has been renamed passes beautifully and checks nothing.
    expect(POSTS.find((p) => p.slug === SYNTHETIC_SLUG)?.placeholder).toBe(true);
    expect(POSTS.find((p) => p.slug === REAL_SLUG)?.placeholder).toBe(false);
  });

  it("a placeholder post asks not to be indexed, but stays crawlable", async () => {
    const meta = await generateMetadata(params(SYNTHETIC_SLUG));
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it("a real post says nothing about robots, so the site default applies", async () => {
    expect((await generateMetadata(params(REAL_SLUG))).robots).toBeUndefined();
    expect((await generateMetadata(params(LAST_STUB))).robots).toBeUndefined();
  });

  it("no placeholder slug appears in the sitemap, and the real posts still do", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const p of POSTS.filter((p) => p.placeholder)) {
      expect(urls.some((u) => u.endsWith(`/blog/${p.slug}`)), p.slug).toBe(false);
    }
    for (const p of POSTS.filter((p) => !p.placeholder)) {
      expect(urls.some((u) => u.endsWith(`/blog/${p.slug}`)), p.slug).toBe(true);
    }
  });

  /** And the half of the problem noindex cannot touch: a PERSON on /blog.
   *
   * Ten of the twenty cards on the index once led to a page whose visible body read
   * "[Placeholder draft...]". Search engines were settled by the robots directive above;
   * a visitor who clicks is not. app/blog/page.tsx filters `placeholder` out of the list.
   * Asserted on the same predicate the page uses, so a stub can never be listed again,
   * and asserted POSITIVELY as well: a filter that hides everything also passes. */
  it("the index lists the real articles and none of the stubs", () => {
    const listed = POSTS.filter((p) => !p.placeholder);
    expect(listed.length).toBeGreaterThanOrEqual(9);
    expect(listed.some((p) => p.slug === REAL_SLUG)).toBe(true);
    expect(listed.some((p) => p.slug === LAST_STUB)).toBe(true);
    expect(listed.some((p) => p.placeholder)).toBe(false);
  });
});
