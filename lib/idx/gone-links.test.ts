import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { goneListingSearch } from "./listing-url";
import { PENDING_STAND_INS, missingPostTarget } from "@/lib/blog";
import { POSTS } from "@/content/blog/posts";

/** DEAD LINKS GO SOMEWHERE USEFUL (2026-09-26): a sold or withdrawn home's old address lands on
 * its town's search, an old or unwritten blog address on its stand-in or the blog. */
describe("a gone listing's address", () => {
  it("sends the visitor to the search for its own town, from either URL form", () => {
    expect(goneListingSearch(["NY", "forest_hills", "11375", "46_slocum_crescent", "bid-38-966009"])).toBe("/search?q=Forest%20Hills");
    expect(goneListingSearch(["ny", "new-rochelle", "10804", "1273-north-avenue", "bid-38-995381"])).toBe("/search?q=New%20Rochelle");
    expect(goneListingSearch(["NY", "kew_gardens", "11415", "84_51_beverly_road_2_s", "mailtolevan@realtylt.com"])).toBe("/search?q=Kew%20Gardens");
  });

  it("falls back to the ZIP, then to the whole search, and lets nothing odd into the query", () => {
    expect(goneListingSearch(["NY", "ny", "12601", "x", "bid-38-1"])).toBe("/search?q=12601");
    expect(goneListingSearch(["NY", "<script>", "abc", "x"])).toBe("/search");
    expect(goneListingSearch(["NY", "%E0%A4%A", "12601"])).toBe("/search?q=12601");
    expect(goneListingSearch([])).toBe("/search");
    expect(goneListingSearch(undefined)).toBe("/search");
  });

  it("the listing routes redirect instead of answering not found", () => {
    const route = fs.readFileSync(path.join(process.cwd(), "app/homes-for-sale/[...slug]/page.tsx"), "utf8");
    expect(route).toContain("redirect(goneListingSearch(slug))");
    expect(route).not.toContain("notFound()");
    const legacy = fs.readFileSync(path.join(process.cwd(), "app/listing/[id]/page.tsx"), "utf8");
    expect(legacy).toContain('redirect("/search")');
    expect(legacy).not.toContain("notFound()");
  });
});

describe("an unknown blog address", () => {
  it("each pending article has a stand-in that exists, and it is not a live slug yet", () => {
    const live = new Set(POSTS.map((p) => p.slug));
    for (const [slug, to] of Object.entries(PENDING_STAND_INS)) {
      expect(live.has(slug)).toBe(false);
      if (to.startsWith("/blog/")) expect(live.has(to.slice(6)) || POSTS.some((p) => p.aliases?.includes(to.slice(6)))).toBe(true);
    }
  });

  it("anything else goes to the blog, and the page never answers not found", () => {
    expect(missingPostTarget("no-such-post")).toBe("/blog");
    expect(missingPostTarget("when-to-sell-house-hudson-valley")).toBe("/blog/timeline-selling-a-house-ny");
    const page = fs.readFileSync(path.join(process.cwd(), "app/blog/[slug]/page.tsx"), "utf8");
    expect(page).toContain("redirect(missingPostTarget(slug))");
    expect(page).not.toMatch(/notFound\(\)/);
  });
});
