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
    excerpt: post.excerpt,
    cover: post.cover,
    author: "Levan Tsiklauri",
    source: "static",
    placeholder: post.placeholder,
    body: { kind: "paragraphs", paragraphs: post.body },
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

/** One article by slug — undefined for unknown slugs AND for unpublished ones (a draft
 * is invisible to the anon key, so it simply isn't in the list) → the page 404s. */
export async function getArticle(slug: string): Promise<Article | undefined> {
  const all = await getArticles();
  return all.find((a) => a.slug === slug);
}
