import { describe, expect, it } from "vitest";
import { mapIdFrom, modeChoice, modeFor } from "./map-options";

/** Round 57.2: the owner's cloud style arrives as one env var; the map's mode is decided per shot. */
describe("the map ID", () => {
  it("is absent (the map unstyled) when the variable is unset, empty or blank", () => {
    expect(mapIdFrom(undefined)).toBeNull();
    expect(mapIdFrom("")).toBeNull();
    expect(mapIdFrom("   ")).toBeNull();
  });

  it("is the trimmed value when it looks like a Cloud map ID", () => {
    expect(mapIdFrom(" 8f348c1e2b0c5e9a ")).toBe("8f348c1e2b0c5e9a");
    expect(mapIdFrom("DEMO_MAP_ID")).toBe("DEMO_MAP_ID");
  });

  it("refuses anything that cannot be a map ID (quotes pasted with it, spaces, a URL)", () => {
    expect(mapIdFrom('"8f348c1e2b0c5e9a"')).toBeNull();
    expect(mapIdFrom("8f34 8c1e")).toBeNull();
    expect(mapIdFrom("https://console.cloud.google.com/x")).toBeNull();
  });
});

describe("the map's mode", () => {
  it("reads the page's ?mode= switch loosely, and falls back to the default on anything else", () => {
    expect(modeChoice("satellite", "hybrid")).toBe("satellite");
    expect(modeChoice(" HYBRID ", "split")).toBe("hybrid");
    expect(modeChoice("split", "hybrid")).toBe("split");
    expect(modeChoice(null, "split")).toBe("split");
    expect(modeChoice("terrain", "split")).toBe("split");
  });

  it("keeps Google's names at the territory shot and drops them in the chapters when split", () => {
    expect(modeFor("hero", "split")).toBe("HYBRID");
    expect(modeFor("dutchess", "split")).toBe("SATELLITE");
    expect(modeFor("bronx", "split")).toBe("SATELLITE");
    expect(modeFor("region", "split")).toBe("SATELLITE");
    expect(modeFor(null, "split")).toBe("SATELLITE");
  });

  it("is one mode everywhere when not split", () => {
    for (const s of ["hero", "dutchess", "bronx", null] as const) {
      expect(modeFor(s, "hybrid")).toBe("HYBRID");
      expect(modeFor(s, "satellite")).toBe("SATELLITE");
    }
  });
});
