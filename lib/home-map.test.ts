import { describe, expect, it } from "vitest";
import { COVERS, G3D_COVER, coverFor, homeCover, homeMap } from "./home-map";

/** Round 57.13: which ground the home page stands on, decided in one place. The MapLibre night map
 * ("ml") is the default; Google's 3D map ("g3d") only when the flag asks AND the key is present; the
 * night flight ("night") only when the flag asks. */
describe("homeMap", () => {
  const KEY = "k";

  it("is the MapLibre night map when the flag is unset, key or not", () => {
    expect(homeMap({})).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("ml");
  });

  it("is the MapLibre night map when the flag says ml", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "ml" })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "ml", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("ml");
  });

  it("is Google's map only when the flag says g3d and the key is present", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
  });

  it("falls back to the MapLibre map, which needs no key, when g3d is asked without one", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d" })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "" })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "g3d", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "   " })).toBe("ml");
  });

  it("is the night flight when the flag says night, key or not", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "night", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "night" })).toBe("night");
  });

  it("reads the flag without regard to case or spaces, and treats an unknown value as unset", () => {
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: " Night ", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("night");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "G3D", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("g3d");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: " ML " })).toBe("ml");
    expect(homeMap({ NEXT_PUBLIC_HOME_MAP: "something", NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: KEY })).toBe("ml");
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
    for (const c of [COVERS.night, COVERS.dusk, COVERS.day, G3D_COVER]) {
      expect(c.wide).toMatch(/^\/images\/home-.+\.webp$/);
      expect(c.tall).toMatch(/^\/images\/home-.+-tall\.webp$/);
    }
  });
});

/** Round 57.13: each ground's cover is a frame of ITS OWN map from its own camera, so the dissolve
 * is a change of detail only. The MapLibre map's night cover is rendered from MapLibre
 * (scripts/make-ml-cover.mjs); Google's keeps its own (the frame from Google's hero camera). */
describe("coverFor", () => {
  it("gives the MapLibre map its own night cover, whatever the cover flag says", () => {
    expect(coverFor("ml", "night")).toBe(COVERS.night);
    expect(coverFor("ml", "dusk")).toBe(COVERS.night);
  });

  it("gives Google's map the cover from Google's camera, and dusk or day when the flag asks", () => {
    expect(coverFor("g3d", "night")).toBe(G3D_COVER);
    expect(coverFor("g3d", "dusk")).toBe(COVERS.dusk);
    expect(coverFor("g3d", "day")).toBe(COVERS.day);
    expect(G3D_COVER.wide).not.toBe(COVERS.night.wide);
  });
});
