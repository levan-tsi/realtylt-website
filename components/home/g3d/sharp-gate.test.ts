import { describe, expect, it } from "vitest";
import { COVER_CAP_MS, QUIET_MIN_MS, QUIET_MS, WALK_ROOM_MS, holdLeft, quietBack, tilesQuiet, walkFits } from "./sharp-gate";

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
    expect(walkFits(COVER_CAP_MS - WALK_ROOM_MS)).toBe(true);
    expect(walkFits(COVER_CAP_MS - WALK_ROOM_MS + 1)).toBe(false);
  });

  it("a wait under the cover is cut at the cap, never below a short floor", () => {
    expect(holdLeft(5000, 2000)).toBe(2000);
    expect(holdLeft(13_000, 2000)).toBe(1000);
    expect(holdLeft(13_900, 2000)).toBe(QUIET_MIN_MS);
    expect(holdLeft(20_000, 2000)).toBe(QUIET_MIN_MS);
  });
});
