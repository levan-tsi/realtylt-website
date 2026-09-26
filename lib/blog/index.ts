/** The blog's single read API: static stubs + DB posts, merged into one list.
 *
 * Merge rules
 *  - A DB post with the same slug as a static post REPLACES it. That is the migration
 *    path: the ten seeded stubs keep their URLs, and publishing a real article from the
 *    CRM under the same slug swaps the placeholder for the real thing.
 *  - Sorted newest-first by date; the sort is stable, so with an empty blog_posts table
 *    the output is byte-for-byte the existing static ordering.
 */

import { POSTS, type BlogPost } from "@/content/blog/posts";
import { fetchDbArticles } from "./db";
import type { Article } from "./types";

export { fmtDate } from "@/content/blog/posts";
export { BLOG_CACHE_TAG, BLOG_REVALIDATE_SECONDS, DEFAULT_COVER, safeCover } from "./db";
export type { Article } from "./types";

export function staticToArticle(post: BlogPost): Article {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    updated: post.updated,
    excerpt: post.excerpt,
    cover: post.cover,
    author: "Levan Tsiklauri",
    source: "static",
    placeholder: post.placeholder,
    cluster: post.cluster,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    film: post.film,
    flagship: post.flagship,
    // A hand-authored post can carry a full markdown body (headings, lists, quotes); the
    // seeded stubs carry a flat paragraph array. Same renderer as the CRM-published posts.
    body: post.markdown
      ? { kind: "markdown", markdown: post.markdown }
      : { kind: "paragraphs", paragraphs: post.body },
  };
}

/** Pure merge — DB wins on slug collisions, newest first (stable). */
export function mergeArticles(dbArticles: Article[], staticArticles: Article[]): Article[] {
  const fromDb = new Set(dbArticles.map((a) => a.slug));
  const merged = [...dbArticles, ...staticArticles.filter((a) => !fromDb.has(a.slug))];
  // Stable sort: equal dates keep insertion order, so DB posts lead on a tie and the
  // static-only list comes out exactly as authored.
  return merged.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Every article the site should render, newest first. */
export async function getArticles(): Promise<Article[]> {
  const db = await fetchDbArticles();
  return mergeArticles(db, POSTS.map(staticToArticle));
}

/** The live slug an OLD slug now answers to, or undefined. Static posts only: a CRM-published
 * post has one slug and no history. */
export function aliasTarget(slug: string): string | undefined {
  return POSTS.find((p) => p.aliases?.includes(slug))?.slug;
}

/** THE STAND-INS (2026-09-26). Five old addresses the CRM's seller emails still link to have no
 * article yet (lib/blog/aliases.test.ts PENDING_CRM); until each is written, its visitor goes to
 * the closest page we have, by a TEMPORARY redirect, so the day the article is published it answers
 * at its own address with nothing to undo. Any other unknown /blog/ address goes to the blog. */
export const PENDING_STAND_INS: Readonly<Record<string, string>> = {
  "when-to-sell-house-hudson-valley": "/blog/timeline-selling-a-house-ny",
  "how-to-price-home-hudson-valley": "/home-value",
  "home-staging-tips-highest-roi": "/blog/high-roi-home-improvements-under-1000",
  "high-roi-renovations-new-york": "/blog/high-roi-home-improvements-under-1000",
  "seller-closing-costs-new-york-state-guide": "/blog/timeline-selling-a-house-ny",
};

export function missingPostTarget(slug: string): string {
  return PENDING_STAND_INS[slug] ?? "/blog";
}

/** One article by slug — undefined for unknown slugs AND for unpublished ones (a draft
 * is invisible to the anon key, so it simply isn't in the list) → the page 404s. */
export async function getArticle(slug: string): Promise<Article | undefined> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug);
}
