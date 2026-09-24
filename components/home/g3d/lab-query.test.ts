import { describe, expect, it } from "vitest";
import { camOverrides, durOverrides } from "./lab-query";
import { midCamera } from "./controller";

/** Round 57.4: the Westchester stall experiments are switched from the query; nothing changes
 * unless the query asks. */
describe("the camera override switch (?cam=)", () => {
  it("is empty when absent or blank", () => {
    expect(camOverrides(null)).toEqual({});
    expect(camOverrides("")).toEqual({});
  });

  it("reads range, tilt and heading for a shot, any of them left empty", () => {
    expect(camOverrides("westchester:40000,45,250")).toEqual({ westchester: { range: 40000, tilt: 45, heading: 250 } });
    expect(camOverrides("westchester:,45,")).toEqual({ westchester: { tilt: 45 } });
    expect(camOverrides("westchester:60000")).toEqual({ westchester: { range: 60000 } });
  });

  it("takes several shots and wraps the heading", () => {
    expect(camOverrides("westchester:48000,50,-110;highlands:30000")).toEqual({ westchester: { range: 48000, tilt: 50, heading: 250 }, highlands: { range: 30000 } });
  });

  it("ignores unknown shots, junk numbers and an impossible tilt", () => {
    expect(camOverrides("nowhere:1000,40,0")).toEqual({});
    expect(camOverrides("westchester:abc,95,")).toEqual({});
    expect(camOverrides("westchester")).toEqual({});
  });
});

describe("the duration override switch (?dur=)", () => {
  it("reads a shot's flight ms, within 100 ms to 10 s", () => {
    expect(durOverrides("westchester:3200")).toEqual({ westchester: 3200 });
    expect(durOverrides("westchester:3200;dutchess:50")).toEqual({ westchester: 3200 });
    expect(durOverrides("westchester:x")).toEqual({});
    expect(durOverrides(undefined)).toEqual({});
  });
});

describe("the halfway camera of a two-leg flight", () => {
  const cam = (lat: number, lng: number, range: number, tilt: number, heading: number, fov = 40) => ({ center: { lat, lng, altitude: 0 }, range, tilt, heading, fov });

  it("takes the geometric mean of the ranges and the mid centre", () => {
    const m = midCamera(cam(41.4, -73.97, 36_250, 52, 185), cam(41.07, -73.87, 48_000, 50, 250));
    expect(m.range).toBe(Math.round(Math.sqrt(36_250 * 48_000)));
    expect(m.center.lat).toBeCloseTo(41.235, 6);
    expect(m.center.lng).toBeCloseTo(-73.92, 6);
    expect(m.tilt).toBe(51);
    expect(m.heading).toBeCloseTo(217.5, 6);
  });

  it("turns the short way round through north", () => {
    expect(midCamera(cam(41, -74, 1000, 50, 350), cam(41, -74, 1000, 50, 30)).heading).toBeCloseTo(10, 6);
    expect(midCamera(cam(41, -74, 1000, 50, 30), cam(41, -74, 1000, 50, 350)).heading).toBeCloseTo(10, 6);
  });
});
