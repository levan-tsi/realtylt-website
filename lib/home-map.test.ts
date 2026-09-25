import { describe, expect, it } from "vitest";
import { COVERS, G3D_COVER, coverFor, homeCover, homeMap } from "./home-map";

describe("which ground the home page stands on", () => {
  it("the plates by default (round 58), with or without a Maps key", () => {
    expect(homeMap({})).toBe("plates");
    expect(homeMap({ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "k" })).toBe("plates");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "" })).toBe("plates");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "something-else" })).toBe("plates");
  });

  it("the live MapLibre map when asked (the renderer and the comparison)", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "ml" })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: " ML " })).toBe("ml");
  });

  it("Google's map only when asked AND the key is there; without the key, the default", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "k" })).toBe("g3d");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d" })).toBe("plates");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "  " })).toBe("plates");
  });

  it("the night flight when asked", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "night" })).toBe("night");
  });
});

describe("the load cover", () => {
  it("is the night frame unless the flag names dusk or day", () => {
    expect(homeCover({})).toBe("night");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "Dusk" })).toBe("dusk");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "day" })).toBe("day");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "x" })).toBe("night");
  });

  it("each ground loads under its own first frame; Google's keeps its own night cover", () => {
    expect(coverFor("ml", "night")).toEqual(COVERS.night);
    expect(coverFor("plates", "night")).toEqual(COVERS.night);
    expect(coverFor("g3d", "night")).toEqual(G3D_COVER);
    expect(coverFor("g3d", "dusk")).toEqual(COVERS.dusk);
  });
});
