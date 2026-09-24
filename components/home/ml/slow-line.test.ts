import { describe, expect, it } from "vitest";
import { FIRST_TILE_BUDGET_MS, slowConnection, slowFirstTile } from "./slow-line";

/** Round 57.13: on a slow line the map drops its heaviest loads (the terrain, the hillshade and the
 * full-detail tiles at the territory) so the territory is whole in seconds, not in half a minute. */
describe("slowConnection", () => {
  it("is slow when the browser reports a 3g, 2g or slow-2g line", () => {
    expect(slowConnection({ effectiveType: "3g" })).toBe(true);
    expect(slowConnection({ effectiveType: "2g" })).toBe(true);
    expect(slowConnection({ effectiveType: "slow-2g" })).toBe(true);
  });

  it("is not slow on a 4g line, or when the browser says nothing (Safari and Firefox have no connection API)", () => {
    expect(slowConnection({ effectiveType: "4g" })).toBe(false);
    expect(slowConnection({})).toBe(false);
    expect(slowConnection(undefined)).toBe(false);
    expect(slowConnection(null)).toBe(false);
  });
});

describe("slowFirstTile", () => {
  it("allows the first vector tile two seconds from the map's creation", () => {
    expect(FIRST_TILE_BUDGET_MS).toBe(2000);
  });

  it("is slow once two seconds pass with no vector tile", () => {
    expect(slowFirstTile(null, 1000, 2999)).toBe(false);
    expect(slowFirstTile(null, 1000, 3000)).toBe(false);
    expect(slowFirstTile(null, 1000, 3001)).toBe(true);
  });

  it("is slow when the first tile came after the budget, and not when it came in time", () => {
    expect(slowFirstTile(3500, 1000, 3600)).toBe(true);
    expect(slowFirstTile(2900, 1000, 9000)).toBe(false);
  });
});
