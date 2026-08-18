import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** THE FRONT DOOR'S SHOP WINDOW MUST CONTAIN HOMES.
 *
 * An adversarial review photographed the home page's featured rail showing a $10M Chinatown
 * tenement with a signpost through the frame, a fried-chicken storefront and a graffitied
 * warehouse. Nothing was broken — those are real MLS photographs of real listings — and no scored
 * dimension could see it, because the defect is WHICH LISTINGS THE RAIL PICKS.
 *
 * Measured against the live feed at the time of the fix: the top 100 by price, which is what
 * `RAIL_LUXURY_POOL` draws on, is 73 non-residential to 27 residential, with a median photo count
 * of 12 against residential's 36. So the rail now excludes Commercial and Land and requires a
 * listing to have been photographed rather than snapped.
 *
 * These assert the PREDICATE, because the predicate is the decision. The rail's behaviour against
 * live data belongs to scripts/verify-facets-live.mjs and the page itself. */

// Normalised: this repo checks out CRLF on Windows, and anchoring on ";\n" silently matched
// nothing, which made four of these cases fail against a file that was already correct.
const db = readFileSync(join(__dirname, "db.ts"), "utf8").replace(/\r\n/g, "\n");
const railWorthy = /const railWorthy = \(\) =>([\s\S]*?);\n/.exec(db)?.[1] ?? "";

describe("railWorthy", () => {
  it("was found", () => {
    expect(railWorthy.length, "railWorthy's definition must be readable from db.ts").toBeGreaterThan(20);
  });

  it("excludes Commercial and Land — a homes rail contains homes", () => {
    expect(railWorthy).toMatch(/property_type=not\.in\.\(Commercial,Land\)/);
  });

  it("keeps Multi-Family: a two-to-four family is a home somebody buys to live in", () => {
    // dropping it would cut the boroughs out of the shop window
    expect(railWorthy).not.toMatch(/Multi-Family/);
    expect(railWorthy).not.toMatch(/property_type=eq\.Residential/);
  });

  it("requires a photographed listing, not a single street snapshot", () => {
    const floor = /photos_servable=gte\.\$\{RAIL_MIN_PHOTOS\}/.test(railWorthy);
    expect(floor, "the rail's photo floor must come from the named constant").toBe(true);
    const n = Number(/const RAIL_MIN_PHOTOS = (\d+)/.exec(db)?.[1]);
    expect(n, "a floor of 1 is the defect this replaced").toBeGreaterThanOrEqual(3);
    // and it must stay well under the pool depth, or the rail starves
    const pool = Number(/const RAIL_POOL = (\d+)/.exec(db)?.[1]);
    expect(pool).toBeGreaterThan(100);
  });

  it("still excludes Coming Soon and future on-market dates", () => {
    expect(railWorthy).toMatch(/status=neq\./);
    expect(railWorthy).toMatch(/listed_at=lte\./);
  });
});

describe("the rail's rules are the RAIL's, not the search's", () => {
  it("/search is not filtered by the rail's predicate", () => {
    // searchFilters builds the search query; railWorthy must not appear in it. A shop window may
    // be choosier than a search; a search that quietly hid 224 commercial listings would be lying.
    const search = /function searchFilters[\s\S]*?\n}/.exec(db)?.[0] ?? "";
    expect(search.length).toBeGreaterThan(50);
    expect(search).not.toMatch(/railWorthy/);
    expect(search).not.toMatch(/RAIL_MIN_PHOTOS/);
  });
});
