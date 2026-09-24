import { describe, expect, it } from "vitest";
import { POSTS } from "@/content/blog/posts";
import { aliasTarget } from "./index";

/** OLD BLOG URLS MUST KEEP RESOLVING, and new internal links must not dangle.
 *
 * The CRM's Sell 24 drip plan has been emailing links of the form
 * https://www.realtylt.com/blog/<slug> since 2025. On 2026-09-22 all 34 returned "Post not
 * found" (docs/handoff/BRIVITY-DEAD-BLOG-LINKS-2026-09-22.md). Each reposted article answers at
 * that slug, either as its own slug or as an alias that app/blog/[slug]/page.tsx permanently
 * redirects. PENDING_CRM is the honest list of what is not reposted yet: it may only shrink,
 * and a slug that starts resolving must be taken off it (the second test fails otherwise). */

const CRM_SLUGS = [
  "when-to-sell-house-hudson-valley",
  "how-to-price-home-hudson-valley",
  "home-staging-tips-highest-roi",
  "high-roi-home-improvements-under-1000",
  "cost-vs-value-finishing-basement-hudson-valley",
  "high-roi-renovations-new-york",
  "seller-closing-costs-new-york-state-guide",
  "timeline-selling-a-house-ny",
  "common-home-seller-mistakes-hudson-valley",
  "fsbo-vs-agent-new-york-guide",
  "seasonal-home-maintenance-checklist-hudson-valley",
  "lower-energy-bills-new-york-homeowners",
  "packing-tips-hacks-for-moving",
  "ultimate-8-week-moving-checklist",
  "seller-guide-prepare-home-inspection",
  "how-to-hire-local-movers-ny",
  "seller-disclosure-requirements-new-york",
  "how-to-buy-your-first-rental-property-in-the-hudson-valley",
  "house-hacking-hudson-valley-ny",
  "calculate-roi-cap-rate-investment-property-ny",
  "multi-family-vs-single-family-investing-ny",
  "brrrr-method-hudson-valley",
  "best-places-to-invest-hudson-valley",
  "1031-exchange-rules-new-york",
  "how-to-find-screen-tenants-ny",
  "short-term-vs-long-term-rentals-hudson-valley",
  "hiring-property-management-company-hudson-valley",
  "fha-va-conventional-mortgage-loans-ny",
  "how-much-house-can-i-afford-ny-guide",
  "why-you-need-real-estate-attorney-ny",
  "relocating-to-hudson-valley-ny-guide",
  "rent-vs-buy-hudson-valley-ny",
  "winning-offer-competitive-market-ny-hudson-valley",
  "new-homeowner-toolkit-essentials",
];

/** Not reposted yet. Shrinks as articles land; never grows. */
const PENDING_CRM = new Set<string>([
  "when-to-sell-house-hudson-valley",
  "how-to-price-home-hudson-valley",
  "home-staging-tips-highest-roi",
  "high-roi-home-improvements-under-1000",
  "cost-vs-value-finishing-basement-hudson-valley",
  "high-roi-renovations-new-york",
  "seller-closing-costs-new-york-state-guide",
  "seasonal-home-maintenance-checklist-hudson-valley",
  "lower-energy-bills-new-york-homeowners",
  "packing-tips-hacks-for-moving",
  "ultimate-8-week-moving-checklist",
  "how-to-hire-local-movers-ny",
  "house-hacking-hudson-valley-ny",
  "calculate-roi-cap-rate-investment-property-ny",
  "multi-family-vs-single-family-investing-ny",
  "brrrr-method-hudson-valley",
  "best-places-to-invest-hudson-valley",
  "1031-exchange-rules-new-york",
  "how-to-find-screen-tenants-ny",
  "short-term-vs-long-term-rentals-hudson-valley",
  "hiring-property-management-company-hudson-valley",
  "relocating-to-hudson-valley-ny-guide",
  "rent-vs-buy-hudson-valley-ny",
  "new-homeowner-toolkit-essentials",
]);

/** Internal /blog/ links written into a reposted body ahead of the article they point at.
 * Same rule: may only shrink, and must be empty when the round is done. */
const PENDING_LINK_TARGETS = new Set<string>([
  "best-places-to-invest-hudson-valley",
  "calculate-roi-cap-rate-investment-property-ny",
  "how-to-find-screen-tenants-ny",
  "hiring-property-management-company-hudson-valley",
  "house-hacking-hudson-valley-ny",
]);

const LIVE = new Set(POSTS.map((p) => p.slug));
const resolves = (slug: string) => LIVE.has(slug) || aliasTarget(slug) !== undefined;

describe("old blog URLs", () => {
  it("every alias is unique and is never also a live slug", () => {
    const all = POSTS.flatMap((p) => p.aliases ?? []);
    expect(new Set(all).size).toBe(all.length);
    for (const a of all) expect(LIVE.has(a), `${a} is both an alias and a live slug`).toBe(false);
  });

  it("every CRM drip link resolves, except the ones honestly listed as pending", () => {
    for (const s of CRM_SLUGS) {
      expect(resolves(s), `${s}: ${PENDING_CRM.has(s) ? "resolves now, take it off PENDING_CRM" : "does not resolve"}`).toBe(
        !PENDING_CRM.has(s),
      );
    }
  });

  it("an alias points at a live, real article", () => {
    for (const p of POSTS.filter((x) => x.aliases?.length)) {
      expect(p.placeholder, p.slug).toBe(false);
      for (const a of p.aliases!) expect(aliasTarget(a)).toBe(p.slug);
    }
  });
});

describe("internal links in the static bodies", () => {
  const links = POSTS.flatMap((p) =>
    [...(p.markdown ?? "").matchAll(/\]\(\/blog\/([a-z0-9-]+)[)#]/g)].map((m) => ({ from: p.slug, to: m[1] })),
  );

  it("point at a live slug (never at an alias, which would cost a redirect hop)", () => {
    for (const { from, to } of links) {
      if (PENDING_LINK_TARGETS.has(to)) continue;
      expect(LIVE.has(to), `${from} links /blog/${to}`).toBe(true);
    }
  });

  it("the pending link list only names articles that do not exist yet", () => {
    for (const to of PENDING_LINK_TARGETS) expect(LIVE.has(to), `${to} is live: take it off PENDING_LINK_TARGETS`).toBe(false);
  });
});
