import { describe, expect, it } from "vitest";
import { homeMap } from "./home-map";

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
