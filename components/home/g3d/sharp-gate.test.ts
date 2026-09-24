import { describe, expect, it } from "vitest";
import { COVER_CAP_MS, QUIET_MIN_MS, QUIET_MS, WALK_ROOM_MS, coverCap, holdLeft, quietBack, tilesQuiet, walkFits } from "./sharp-gate";

/** Round 57.10: the map is shown when its tiles have stopped arriving (measured sharp), not when
 * Google's steady event comes 0.6 to 1.7 s later; the cover never holds past 14 s once the map can
 * show. */
describe("the sharp gate", () => {
  it("a camera set with every tile resident is sharp once nothing has arrived for QUIET_MS", () => {
    expect(tilesQuiet({ now: 1000 + QUIET_MS - 1, since: 1000, lastTile: null })).toBe(false);
    expect(tilesQuiet({ now: 1000 + QUIET_MS, since: 1000, lastTile: null })).toBe(true);
    // A tile that came before the camera was set says nothing about this camera.
    expect(tilesQuiet({ now: 1000 + QUIET_MS, since: 1000, lastTile: 900 })).toBe(true);
  });

  it("waits while tiles are still arriving, and QUIET_MS after the last one", () => {
    expect(tilesQuiet({ now: 1500, since: 1000, lastTile: 1400 })).toBe(false);
    expect(tilesQuiet({ now: 1400 + QUIET_MS, since: 1000, lastTile: 1400 })).toBe(true);
  });

  it("never calls a camera sharp sooner than QUIET_MIN_MS after it was set", () => {
    expect(QUIET_MIN_MS).toBeLessThanOrEqual(QUIET_MS);
    expect(tilesQuiet({ now: 1000 + QUIET_MIN_MS - 1, since: 1000, lastTile: null, quietMs: 10 })).toBe(false);
    expect(tilesQuiet({ now: 1000 + QUIET_MIN_MS, since: 1000, lastTile: null, quietMs: 10 })).toBe(true);
  });

  it("calls a return drawn by quiet only when it goes back to the shot the map already drew", () => {
    expect(quietBack({ back: "hero", drawn: "hero" })).toBe(true);
    // The visitor scrolled under the cover: a shot never drawn streams its tiles, and pauses.
    expect(quietBack({ back: "dutchess", drawn: "hero" })).toBe(false);
    expect(quietBack({ back: "hero", drawn: null })).toBe(false);
  });

  it("the walk runs only if it can finish before the cover's cap", () => {
    expect(COVER_CAP_MS).toBe(14_000);
    // Round 57.11: the laptop's walk is three steps now (measured 2.6 to 3.5 s with its return).
    expect(WALK_ROOM_MS).toBe(3_400);
    expect(walkFits(COVER_CAP_MS - WALK_ROOM_MS)).toBe(true);
    expect(walkFits(COVER_CAP_MS - WALK_ROOM_MS + 1)).toBe(false);
  });

  it("the cap is the later of 14 s and the first draw plus the walk's room, so the walk always runs once the map has drawn (round 57.11)", () => {
    expect(coverCap(null)).toBe(COVER_CAP_MS);
    expect(coverCap(6_000)).toBe(COVER_CAP_MS);
    // The slow line of round 10: first draw at 11.8 s, the old cap skipped the walk.
    expect(walkFits(11_800)).toBe(false);
    expect(coverCap(11_800)).toBe(11_800 + WALK_ROOM_MS);
    expect(walkFits(11_800, coverCap(11_800))).toBe(true);
    // Counted from the walk's start, which comes a few ms after the draw, the walk still fits.
    expect(walkFits(11_803, coverCap(11_803))).toBe(true);
    expect(walkFits(11_803, coverCap(11_800))).toBe(false);
    // A very late draw still gets its walk.
    expect(walkFits(30_000, coverCap(30_000))).toBe(true);
  });

  it("a wait under the cover is cut at the cap, never below a short floor", () => {
    expect(holdLeft(5000, 2000)).toBe(2000);
    expect(holdLeft(13_000, 2000)).toBe(1000);
    expect(holdLeft(13_900, 2000)).toBe(QUIET_MIN_MS);
    expect(holdLeft(20_000, 2000)).toBe(QUIET_MIN_MS);
  });
});
