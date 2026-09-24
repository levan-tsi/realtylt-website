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
 *      Cohort is the consumer/business split (isConsumer): a consumer post never falls through to the
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
  | "owning"
  /** Consumer: buying a home, from the budget to the keys. */
  | "buying"
  /** Consumer: selling a home. */
  | "selling"
  /** Consumer: buying property to rent or hold. */
  | "investing";

/** The consumer clusters. Until 2026-09-24 the consumer cohort was simply "the placeholder
 * stubs", because every consumer post was one. The reposted Drive articles are real consumer
 * posts, so the cohort is now named by cluster; a stub still counts as consumer. */
const CONSUMER: ReadonlySet<Cluster> = new Set<Cluster>(["moving", "owning", "buying", "selling", "investing"]);

/** True for a consumer post (buying, selling, owning, moving, investing, or a stub). */
export function isConsumer(a: Pick<Article, "placeholder" | "cluster">): boolean {
  return a.placeholder || (a.cluster !== undefined && CONSUMER.has(a.cluster));
}

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

  // 2. the rest of its own cohort, starting after it in the running order and wrapping
  const sameCohort = all.filter((a) => isConsumer(a) === isConsumer(post) && (a.slug === post.slug || offerable(a)));
  const here = sameCohort.findIndex((a) => a.slug === post.slug);
  const rotated = here < 0 ? sameCohort : [...sameCohort.slice(here + 1), ...sameCohort.slice(0, here)];
  take(rotated.filter((a) => a.slug !== post.slug));

  // 3. a stub from its own cohort before crossing cohorts (only reachable while a cohort has
  //    fewer than four real articles)
  take(pool.filter((a) => isConsumer(a) === isConsumer(post)));

  // 4. anything at all, so the block is never empty
  take(pool);

  return picked;
}
