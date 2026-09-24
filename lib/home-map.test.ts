import { describe, expect, it } from "vitest";
import { COVERS, homeCover, homeMap } from "./home-map";

/** Round 57: which ground the home page stands on, decided in one place. */
describe("homeMap", () => {
  const KEY = "k";

  it("is the real map when the key is present and the flag is unset", () => {
    expect(homeMap({ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
  });

  it("is the real map when the flag says g3d and the key is present", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
  });

  it("is the night flight when the flag says night, key or not", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "night", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "night" })).toBe("night");
  });

  it("is the night flight when there is no key, whatever the flag says", () => {
    expect(homeMap({})).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d" })).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "" })).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "   " })).toBe("night");
  });

  it("reads the flag without regard to case or spaces, and treats an unknown value as unset", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: " Night ", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "G3D", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "something", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
  });
});

/** Round 57.6: the real map's load cover is the night map's first frame; round 57.2's dusk (A) and
 * day (B) stay one flag (or `?cover=`) away for comparison. */
describe("homeCover", () => {
  it("is night unless the flag names dusk or day", () => {
    expect(homeCover({})).toBe("night");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "" })).toBe("night");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "night" })).toBe("night");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "purple" })).toBe("night");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: " Day " })).toBe("day");
    expect(homeCover({ NEXT_PUBLIC_HOME_COVER: "dusk" })).toBe("dusk");
  });

  it("names a wide and a tall still for each, all under public/images", () => {
    for (const c of ["night", "dusk", "day"] as const) {
      expect(COVERS[c].wide).toMatch(/^\/images\/home-.+\.webp$/);
      expect(COVERS[c].tall).toMatch(/^\/images\/home-.+-tall\.webp$/);
    }
  });
});
