import { describe, expect, it } from "vitest";
import { shotStops } from "../night/driver";
import { pinnedSpan } from "./MlGround";

describe("pinnedSpan (round 62, the phone's pinned county stage)", () => {
  it("spreads a pinned section's shots over the scroll during which its stage is pinned", () => {
    const vh = 800, top = 5000, height = 4.6 * vh;
    const stops = shotStops([{ shots: ["ulster", "dutchess-county", "orange"], ...pinnedSpan(top, height, vh), veil: 0 }], vh, 1e6);
    // Pinned from scroll = top to scroll = top + height - vh.
    for (const s of stops) {
      expect(s.anchor).toBeGreaterThan(top);
      expect(s.anchor).toBeLessThan(top + height - vh);
    }
    expect(stops.map((s) => s.name)).toEqual(["ulster", "dutchess-county", "orange"]);
  });

  it("never returns an empty span", () => {
    expect(pinnedSpan(0, 300, 800).height).toBe(1);
  });
});
