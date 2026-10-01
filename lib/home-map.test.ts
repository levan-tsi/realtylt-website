import { describe, expect, it } from "vitest";
import { homeMap } from "./home-map";

describe("which ground the home page stands on", () => {
  it("the plates by default (round 58)",() => {
    expect(homeMap({})).toBe("plates");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "" })).toBe("plates");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "something-else" })).toBe("plates");
  });

  it("the live MapLibre map when asked (the renderer and the comparison)", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "ml" })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: " ML " })).toBe("ml");
  });
});
