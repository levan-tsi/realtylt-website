/** "Keep reading" — the three articles offered at the foot of a post.
 *
 * WHY THIS FILE EXISTS. Until Round I the block was one line in the page component:
 *
 *   const related = (await getArticles()).filter((a) => a.slug !== post.slug).slice(0, 3);
 *
 * which is "the three newest, minus me". Fifteen of the twenty flagships share a publication
 * date, so "newest" is close to meaningless inside that tie and the array order decides it:
 * the checker measured the block in a browser on five posts and got the SAME THREE on all
 * five, including on a consumer post about packing boxes, which was handed three B2B
 * automation essays. Sibling overlap is policed at 0 across the cohort and the recommendation
 * block was at 100%. The service pages (since moved to the AI business's site) had already solved
 * this with a curated `relatedPosts`, and the editorial half had not.
 *
 * THE RULE, in order, taking the first three it finds:
 *
 *   1. the post's own CLUSTER. One word per post, on the post, in content/blog/posts.ts.
 *   2. the rest of the blog, in running order, starting AFTER this post and wrapping. Starting
 *      after the post rather than at the top is what stops two posts in a small cluster topping
 *      up with the identical pair.
 *   3. anything left, so the block is never empty even for a post with no cluster at all
 *      (a CRM-published post arrives without one, by construction).
 *
 * Never the post you are on, at every step.
 *
 * 2026-11-20: the twenty automation essays moved to the AI business's own site, and with
 * them the consumer/business cohort split that kept the two audiences apart. Every post here is
 * now real estate, so there is one cohort.
 *
 * WHY NOT DERIVE IT FROM THE POSTS' OWN LINKS, which would need no new metadata: measured
 * before choosing. Nine of the twenty flagships place no /blog/ link in their body at all
 * (custom-automation, ai-clone, invoicing, ai-scheduling, geo, local-seo, booking, review,
 * chat), and adding inbound links to outbound ones still leaves eight of them with no signal.
 * Those eight would have fallen straight through to the same three newest posts, which is the
 * defect. A link graph this sparse cannot carry the block; one word per post can.
 */
import type { Article } from "./types";

/** A cluster is "what a person who just finished this would want next", not a taxonomy. */
export type Cluster =
  /** The move itself. */
  | "moving"
  /** The house once you are in it. */
  | "owning"
  /** Buying a home, from the budget to the keys. */
  | "buying"
  /** Selling a home. */
  | "selling"
  /** Buying property to rent or hold. */
  | "investing";

export function relatedArticles(post: Article, all: Article[], count = 3): Article[] {
  const pool = all.filter((a) => a.slug !== post.slug);
  const picked: Article[] = [];
  const take = (candidates: Article[]) => {
    for (const a of candidates) {
      if (picked.length >= count) return;
      if (!picked.some((p) => p.slug === a.slug)) picked.push(a);
    }
  };

  // A real article is never offered a "[Placeholder draft...]" stub while anything real is
  // left; a stub may be offered real articles and other stubs.
  const offerable = (a: Article) => post.placeholder || !a.placeholder;

  // 1. its own cluster
  if (post.cluster) take(pool.filter((a) => a.cluster === post.cluster && offerable(a)));

  // 2. the rest of the blog, starting after it in the running order and wrapping
  const here = all.findIndex((a) => a.slug === post.slug);
  const rotated = here < 0 ? all : [...all.slice(here + 1), ...all.slice(0, here)];
  take(rotated.filter((a) => a.slug !== post.slug && offerable(a)));

  // 3. anything at all (a stub, while fewer than three real articles are left), so the block is
  //    never empty
  take(pool);

  return picked;
}
