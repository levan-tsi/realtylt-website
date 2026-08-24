import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FixtureIdxClient } from "@/lib/idx/fixture";
import { FIXTURE_LISTINGS } from "@/lib/idx/fixture-data";
import type { Listing, ListingStatus } from "@/lib/idx/types";

/** THE COUNTY HERO'S COUNT AND THE PAGE IT OPENS MUST BE ANSWERING THE SAME QUESTION.
 *
 * Westchester's hero said "3,989 homes on market here" and the "See All 3,989 Listings" button
 * under it opened `/search?county=westchester`, which showed 1,954. Dutchess: 1,708 promised,
 * 1,150 shown. Measured 2026-08-24 on the dev server against the replicated table.
 *
 * ONE CAUSE. `search()` only narrows by status when it is asked to, so the county page's count
 * included Coming Soon, Pending and Under Contract; /search defaults to `quick=active`
 * (lib/idx/query.ts, the owner's call on 2026-08-06, because 41% of the default scope was
 * Pending and nothing on the page said so). Same defect the suggest dropdown had — see
 * app/api/idx/suggest/suggest-count-scope.test.ts, which this file deliberately mirrors.
 *
 * WHAT WAS NOT CHANGED, and the tests below hold it: which six homes the page features. The
 * owner's carried note was explicit that scoping the count must not move the selection, so the
 * featured rail still reads the unscoped `result`. After the fix the page prints 1,957 for
 * Westchester and 1,151 for Dutchess against /search's own unbounded Active totals of 1,957 and
 * 1,151 (/api/idx/search?county=…&status=Active). What is left between the two surfaces is the
 * map viewport, which /search states in its own words.
 */

const page = fs.readFileSync(path.join(process.cwd(), "app/top-areas/[county]/page.tsx"), "utf8");
const query = fs.readFileSync(path.join(process.cwd(), "lib/idx/query.ts"), "utf8");

/** A county's worth of listings with a known status mix: 3 Active, 2 Pending, 1 Coming Soon. */
function countyRows(): Listing[] {
  const statuses: ListingStatus[] = ["Active", "Active", "Active", "Pending", "Coming Soon", "Active"];
  return statuses.map((status, i) => ({
    ...FIXTURE_LISTINGS[i % FIXTURE_LISTINGS.length],
    id: `SCOPE${i}`,
    county: "westchester",
    status,
    // Above the $10k sale floor and not a rental, so only status separates these rows.
    price: 500_000 + i,
    propertyType: "Residential",
  }));
}

describe("the county hero counts the homes /search will show", () => {
  it("an Active-scoped count leaves out every other on-market status", async () => {
    const client = new FixtureIdxClient(countyRows());
    const all = await client.search({ county: "westchester", pageSize: 1 });
    const active = await client.search({ county: "westchester", status: "Active", pageSize: 1 });
    expect(all.total).toBe(6);
    expect(active.total).toBe(4);
  });

  it("the scoped count is what the hero and the See All button print", () => {
    expect(page, "the hero stat lost its Active-scoped count").toMatch(
      /<dd[^>]*>\{onMarket\.toLocaleString\("en-US"\)\}<\/dd>/,
    );
    expect(page, "the See All button lost its Active-scoped count").toContain(
      'See All {onMarket.toLocaleString("en-US")} Listings',
    );
    // The whole point: neither surface may go back to the unscoped total.
    expect(page).not.toContain("result.total.toLocaleString");
  });

  it("onMarket is the Active total for this area and nothing else", () => {
    const line = page.slice(page.indexOf("const onMarket"), page.indexOf("return (") );
    expect(line).toContain('status: "Active"');
    expect(line).toContain("county: areaSlug");
  });

  /** The count is only correct while /search still defaults to Active. If that default ever
   * moves, this number is silently wrong again — which is exactly how it got here. Fail loudly. */
  it("matches the status /search actually defaults to", () => {
    expect(query).toContain('const quick = q.get("quick") ?? "active"');
    expect(query).toContain('if (quick === "active") withQuick.set("status", "Active");');
  });

  /** OWNER-DIRECTED AND LOAD-BEARING: scoping the number must not change which six homes the
   * page features. The featured rail keeps reading the unscoped six-row query. */
  it("does not change which homes the page features", () => {
    expect(page).toContain("await getIdxClient().search({ county: areaSlug, pageSize: 6 })");
    expect(page).toContain("result.listings.map((l) =>");
    expect(page).toContain("result.listings.length === 0");
  });

  /** MLS Grid is rate-limit sensitive and none of this may ever reach it: every count comes
   * from our own replicated inventory. */
  it("reads only our own inventory, never the vendor API", () => {
    expect(page).not.toMatch(/mlsgrid/i);
  });
});
