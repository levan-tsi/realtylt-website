import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { POSTS } from "@/content/blog/posts";
import { generateMetadata } from "./[slug]/page";

/** THE TEN SEEDED STUBS MUST NOT BE OFFERED FOR INDEXING.
 *
 * content/blog/posts.ts renders "[Placeholder draft. The owner's final article replaces this
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
 */

const PLACEHOLDER_SLUG = "top-5-renovations-increase-home-value-ny";
const REAL_SLUG = "ai-chat-assistant-real-estate-website";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("placeholder posts stay out of the index", () => {
  it("the fixture slugs are what this test thinks they are", () => {
    // A probe aimed at a slug that has been renamed passes beautifully and checks nothing.
    const placeholder = POSTS.find((p) => p.slug === PLACEHOLDER_SLUG);
    const real = POSTS.find((p) => p.slug === REAL_SLUG);
    expect(placeholder?.placeholder, PLACEHOLDER_SLUG).toBe(true);
    expect(real?.placeholder, REAL_SLUG).toBe(false);
    expect(POSTS.filter((p) => p.placeholder).length).toBeGreaterThanOrEqual(10);
  });

  it("a placeholder post asks not to be indexed, but stays crawlable", async () => {
    const meta = await generateMetadata(params(PLACEHOLDER_SLUG));
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it("a real post says nothing about robots, so the site default applies", async () => {
    const meta = await generateMetadata(params(REAL_SLUG));
    expect(meta.robots).toBeUndefined();
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
});
