import { describe, expect, it } from "vitest";
import { followsMap, NO_FOLLOW, settleBox, type FollowState } from "./map-follow";

const A = "north=42&south=41&east=-73&west=-74";
const B = "north=42.1&south=41.1&east=-73.1&west=-74.1";
const C = "north=43&south=42&east=-72&west=-73";

/** Replay a run of settle reports, the way a map fires them. */
const run = (boxes: string[], from: FollowState = NO_FOLLOW) => boxes.reduce(settleBox, from);

describe("map-follow", () => {
  it("remembers the map's own first frame without adopting it", () => {
    const s = settleBox(NO_FOLLOW, A);
    expect(s).toEqual({ home: A, moved: false });
    expect(followsMap(true, s)).toBe(false);
  });

  it("still scopes the list on a laptop, where the map is beside it", () => {
    expect(followsMap(false, NO_FOLLOW)).toBe(true);
    expect(followsMap(false, settleBox(NO_FOLLOW, A))).toBe(true);
  });

  it("counts a different box as the visitor moving the map", () => {
    const s = run([A, B]);
    expect(s.moved).toBe(true);
    expect(followsMap(true, s)).toBe(true);
  });

  it("ignores a repeat of the home box (a settle with no movement)", () => {
    const s = run([A, A, A]);
    expect(s).toEqual({ home: A, moved: false });
    expect(followsMap(true, s)).toBe(false);
  });

  it("keeps following once moved, even if the map lands back on its first frame", () => {
    const s = run([A, B, A]);
    expect(s.moved).toBe(true);
    expect(followsMap(true, s)).toBe(true);
  });

  it("returns the same object when nothing changed, so React does not re-render", () => {
    const one = settleBox(NO_FOLLOW, A);
    expect(settleBox(one, A)).toBe(one);
    const moved = settleBox(one, B);
    expect(settleBox(moved, C)).toBe(moved);
  });

  it("a new place starts over: the next frame is that place's home box", () => {
    const moved = run([A, B]);
    expect(moved.moved).toBe(true);
    // SearchClient resets to NO_FOLLOW when the place changes; the map then refits.
    const afterNewPlace = settleBox(NO_FOLLOW, C);
    expect(afterNewPlace).toEqual({ home: C, moved: false });
    expect(followsMap(true, afterNewPlace)).toBe(false);
  });
});
