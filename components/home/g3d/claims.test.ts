import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { claims } from "./claims";

/** Round 57.5: the caption stays honest in every state of the map and the lights. */
describe("what the home page's words may claim", () => {
  it("under our cover (JS off, or before the map is drawn): the lights, no Google, nothing to point at", () => {
    for (const l of ["pending", "some", "none"] as const) expect(claims("cover", l)).toEqual({ map: false, point: false, lights: true });
  });

  it("on the live map with lights: every claim", () => {
    expect(claims("live", "some")).toEqual({ map: true, point: true, lights: true });
  });

  it("on the live map while the lights are on their way: Google, the lights, not yet the pointing", () => {
    expect(claims("live", "pending")).toEqual({ map: true, point: false, lights: true });
  });

  it("on the live map with no lights (the route failed or was empty): no sentence about lights", () => {
    expect(claims("live", "none")).toEqual({ map: true, point: false, lights: false });
  });

  it("when the map failed, our still stays and says only what the still backs", () => {
    for (const l of ["pending", "some", "none"] as const) expect(claims("failed", l)).toEqual({ map: false, point: false, lights: true });
  });

  it("the page renders the cover state: the Google and pointing claims hidden, the lights shown", () => {
    const page = readFileSync("app/page.tsx", "utf8");
    expect(page).toMatch(/<span data-map-claim hidden>/);
    expect(page).toMatch(/<span data-point-claim hidden>/);
    expect((page.match(/data-lights-claim(?! hidden)/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
