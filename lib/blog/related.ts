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
 * block was at 100%. The commercial half of the site already solved this — every service page
 * carries a curated `relatedPosts` — and the editorial half did not.
 *
 * THE RULE, in order, taking the first three it finds:
 *
 *   1. the post's own CLUSTER. One word per post, on the post, in content/blog/posts.ts.
 *   2. the rest of its own COHORT, in running order, starting AFTER this post and wrapping.
 *      Cohort is the flagship/placeholder split: a consumer post never falls through to the
 *      automation essays and vice versa. Starting after the post rather than at the top is
 *      what stops two posts in a small cluster topping up with the identical pair.
 *   3. anything left, so the block is never empty even for a post with no cluster at all
 *      (a CRM-published post arrives without one, by construction).
 *
 * Never the post you are on, at every step.
 *
 * WHY NOT DERIVE IT FROM THE POSTS' OWN LINKS, which would need no new metadata: measured
 * before choosing. Nine of the twenty flagships place no /blog/ link in their body at all
 * (custom-automation, ai-clone, invoicing, ai-scheduling, geo, local-seo, booking, review,
 * chat), and adding inbound links to outbound ones still leaves eight of them with no signal.
 * Those eight would have fallen straight through to the same three newest posts, which is the
 * defect. A link graph this sparse cannot carry the block; one word per post can.
 */
import type { Article } from "./types";

/** The six clusters the twenty flagships fall into, plus the two the consumer stubs do.
 * A cluster is "what a person who just finished this would want next", not a taxonomy. */
export type Cluster =
  /** The inbound conversation: somebody is trying to reach you right now. */
  | "answering"
  /** Getting two people into a room at an agreed time. */
  | "appointments"
  /** The records underneath everything, and the people in them. */
  | "records"
  /** Being found and being chosen. */
  | "visibility"
  /** The paperwork and the money after the deal is agreed. */
  | "back-office"
  /** Deciding what to build, and owning it afterwards. */
  | "building"
  /** Consumer: the move itself. */
  | "moving"
  /** Consumer: the house once you are in it. */
  | "owning";

export function relatedArticles(post: Article, all: Article[], count = 3): Article[] {
  const pool = all.filter((a) => a.slug !== post.slug);
  const picked: Article[] = [];
  const take = (candidates: Article[]) => {
    for (const a of candidates) {
      if (picked.length >= count) return;
      if (!picked.some((p) => p.slug === a.slug)) picked.push(a);
    }
  };

  // 1. its own cluster
  if (post.cluster) take(pool.filter((a) => a.cluster === post.cluster));

  // 2. the rest of its own cohort, starting after it in the running order and wrapping
  const sameCohort = all.filter((a) => a.placeholder === post.placeholder);
  const here = sameCohort.findIndex((a) => a.slug === post.slug);
  const rotated = here < 0 ? sameCohort : [...sameCohort.slice(here + 1), ...sameCohort.slice(0, here)];
  take(rotated.filter((a) => a.slug !== post.slug));

  // 3. anything at all, so the block is never empty
  take(pool);

  return picked;
}
