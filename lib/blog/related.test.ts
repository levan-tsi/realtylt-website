/** The "Keep reading" block, which until Round I offered the SAME THREE articles at the foot
 * of all thirty posts.
 *
 * The checker measured it in a browser on five posts and got custom-automation, ai-audit and
 * ai-clone every time, including on `packing-101-pro-tips-organized-move`, a consumer post
 * about packing boxes. The cause was one line: `.filter((a) => a.slug !== post.slug).slice(0, 3)`
 * over a date-sorted list in which fifteen of the twenty flagships share a publication date,
 * so "newest" was decided by array order and array order does not move.
 *
 * These tests are written against the REAL cohort rather than against fixtures, because the
 * defect was a property of the real cohort and a fixture of three invented posts would have
 * passed the old code.
 */
import { describe, expect, it } from "vitest";
import { POSTS } from "@/content/blog/posts";
import { staticToArticle } from "./index";
import { relatedArticles } from "./related";
import type { Article } from "./types";

const ALL: Article[] = POSTS.map(staticToArticle);
const bySlug = (s: string) => ALL.find((a) => a.slug === s)!;

describe("relatedArticles", () => {
  it("never recommends the post you are on", () => {
    for (const post of ALL) {
      const picked = relatedArticles(post, ALL).map((a) => a.slug);
      expect(picked, `${post.slug} recommends itself`).not.toContain(post.slug);
    }
  });

  it("gives every post three recommendations", () => {
    for (const post of ALL) {
      expect(relatedArticles(post, ALL), post.slug).toHaveLength(3);
    }
  });

  it("never recommends the same article twice in one block", () => {
    for (const post of ALL) {
      const picked = relatedArticles(post, ALL).map((a) => a.slug);
      expect(new Set(picked).size, post.slug).toBe(3);
    }
  });

  /** THE DEFECT ITSELF. A consumer post handed three B2B automation essays was the concrete
   * thing the checker found; this is the assertion that would have caught it. */
  it("keeps a consumer post inside the consumer cohort", () => {
    for (const post of ALL.filter((a) => a.placeholder)) {
      const picked = relatedArticles(post, ALL);
      expect(
        picked.filter((a) => !a.placeholder).map((a) => a.slug),
        `${post.slug} recommends the automation cohort`,
      ).toEqual([]);
    }
    // and specifically the one that was measured
    const packing = relatedArticles(bySlug("packing-101-pro-tips-organized-move"), ALL);
    expect(packing.map((a) => a.slug)).not.toContain("custom-automation-real-estate-bespoke-build");
    expect(packing.map((a) => a.slug)).not.toContain("ai-audit-small-business-what-not-to-automate");
    expect(packing.map((a) => a.slug)).not.toContain("ai-clone-real-estate-agent-video-avatar");
  });

  it("keeps a flagship post inside the flagship cohort", () => {
    for (const post of ALL.filter((a) => !a.placeholder)) {
      expect(
        relatedArticles(post, ALL).filter((a) => a.placeholder).map((a) => a.slug),
        `${post.slug} recommends a placeholder stub`,
      ).toEqual([]);
    }
  });

  /** The relevance rule: what a post offers first is a sibling on its own subject. */
  it("leads with a post from the same cluster wherever the cluster has a sibling", () => {
    for (const post of ALL) {
      const siblings = ALL.filter((a) => a.cluster === post.cluster && a.slug !== post.slug);
      if (!siblings.length) continue;
      const first = relatedArticles(post, ALL)[0];
      expect(first.cluster, `${post.slug} leads with an unrelated post`).toBe(post.cluster);
    }
  });

  /** The measurement that names the defect: how many DISTINCT blocks the cohort produces.
   * MEASURED BOTH WAYS before this floor was chosen. The old rule produces 4 blocks across
   * the 30 posts; this one produces 27. The floor is set at 20 so a new post cannot quietly
   * collapse the block back toward one, and is deliberately below 27 so that adding a post to
   * an existing cluster is not a test failure. */
  it("does not put the same block on every page", () => {
    const blocks = new Set(ALL.map((p) => relatedArticles(p, ALL).map((a) => a.slug).sort().join("|")));
    expect(blocks.size).toBeGreaterThanOrEqual(20);
  });

  /** A CRM-published post arrives with no cluster. It must still get a full, cohort-correct
   * block rather than an empty one or a crash. */
  it("still fills the block for a post with no cluster", () => {
    const orphan: Article = { ...bySlug("workflow-automation-real-estate-business"), slug: "db-published-post", cluster: undefined };
    const picked = relatedArticles(orphan, [orphan, ...ALL]);
    expect(picked).toHaveLength(3);
    expect(picked.map((a) => a.slug)).not.toContain("db-published-post");
    expect(picked.filter((a) => a.placeholder)).toEqual([]);
  });

  it("every post carries a cluster, so the fallback is never load-bearing on a shipped post", () => {
    expect(ALL.filter((a) => !a.cluster).map((a) => a.slug)).toEqual([]);
  });
});
