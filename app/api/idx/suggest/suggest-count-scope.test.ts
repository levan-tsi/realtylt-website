import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE DROPDOWN'S COUNT AND THE PAGE IT LEADS TO MUST BE ANSWERING THE SAME QUESTION.
 *
 * Typing "Beacon" suggested "128 homes" and the results page then showed 116 of them. Two
 * separate causes, both in one query:
 *
 *  1. The index counted EVERY status. /search defaults to quick=active (lib/idx/query.ts,
 *     the owner's call on 2026-08-06, because 41% of the default scope was Pending and nothing
 *     on the page said so). Beacon holds 158 rows and 116 Active ones.
 *  2. It paged 20 x 1000 rows of a 27,632-row table in id.asc order and stopped, so towns late
 *     in that order were undercounted as well as over-counted. 128 was neither true figure.
 *
 * Scoping the index to Active fixes both: it is the number the results page will show, and
 * 17,727 rows fit inside the page budget instead of being cut off at 20,000.
 *
 * Measured after the fix, suggested against the table's own Active count: Beacon 116/116,
 * Kingston 120/120, Nyack 86/86, Saugerties 56/56, Poughkeepsie 352/352. What is left between
 * the dropdown and the page is the map viewport, which the page states in its own words
 * ("95 homes in this map area") rather than silently.
 */

const route = fs.readFileSync(path.join(process.cwd(), "app/api/idx/suggest/route.ts"), "utf8");
const query = fs.readFileSync(path.join(process.cwd(), "lib/idx/query.ts"), "utf8");

describe("the suggest index counts the same homes /search shows", () => {
  it("scopes the city/zip index to Active", () => {
    const build = route.slice(route.indexOf("async function buildIndex"), route.indexOf("async function addressMatches"));
    expect(build, "the index query lost its status scope").toContain("status=eq.Active");
  });

  /** If /search's default ever stops being Active, this count is wrong again — and it will be
   * wrong silently, which is how it got here. Fail loudly instead. */
  it("matches the status /search actually defaults to", () => {
    expect(query).toContain('const quick = q.get("quick") ?? "active"');
    expect(query).toContain('if (quick === "active") withQuick.set("status", "Active");');
  });

  /** The page loop must have headroom over the live Active row count (17,727 on the day this
   * was written) or it truncates in silence again. 40 pages of 1000 is 40,000. */
  it("pages far enough to reach every Active row", () => {
    const cap = Number(route.match(/for \(let page = 0; page < (\d+); page\+\+\)/)?.[1]);
    expect(cap, "no page cap found").toBeGreaterThan(0);
    expect(cap * 1000, "the index would truncate before it reached every Active listing").toBeGreaterThan(25_000);
  });

  /** The address lookup was already Active-scoped and must stay that way — suggesting a home
   * that sold last spring is worse than suggesting nothing. */
  it("keeps the address lookup Active-only too", () => {
    const addr = route.slice(route.indexOf("async function addressMatches"), route.indexOf("export async function GET"));
    expect(addr).toContain("status=eq.Active");
  });

  /** MLS Grid is rate-limit sensitive and none of this may ever reach it: every count comes
   * from our own replicated table. */
  it("reads only our own inventory, never the vendor API", () => {
    expect(route).not.toMatch(/mlsgrid/i);
    expect(route).toContain("/rest/v1/idx_listings");
  });
});
