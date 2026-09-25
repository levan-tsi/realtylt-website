import { describe, expect, it } from "vitest";
import { bezier, defaultEasing, flightFrames, flightPath, frameAt, normalizeBearing, type PathCam } from "./flight-path";
import { PLATES } from "./plates.gen";

const camOf = (shot: keyof typeof PLATES, deep = true): PathCam => {
  const p = PLATES[shot].wide;
  // a plain plate's camera in the deep geometry: the same ground one zoom deeper
  const up = deep && (p.k ?? 1) === 1 ? 1 : 0;
  return { lng: p.cam.lng, lat: p.cam.lat, zoom: p.cam.zoom + up, pitch: p.cam.pitch, bearing: p.cam.bearing, elevation: p.cam.elevation };
};
const DEEP = { width: 2880, height: 1800 };

describe("the easing", () => {
  it("is MapLibre's default bezier(0.25, 0.1, 0.25, 1): 0 and 1 at the ends, rising, slow in and out", () => {
    expect(defaultEasing(0)).toBe(0);
    expect(defaultEasing(1)).toBeCloseTo(1, 9);
    let last = -1;
    for (let t = 0; t <= 1.0001; t += 0.01) {
      const v = defaultEasing(Math.min(1, t));
      expect(v).toBeGreaterThanOrEqual(last - 1e-9);
      last = v;
    }
    // CSS's `ease`: known values
    expect(defaultEasing(0.5)).toBeCloseTo(0.8024, 3);
    expect(bezier(0, 0, 1, 1)(0.3)).toBeCloseTo(0.3, 5);
  });
});

describe("the bearing", () => {
  it("goes the shorter way round", () => {
    expect(normalizeBearing(190, 5)).toBe(-170);
    expect(normalizeBearing(-90, 170)).toBe(270);
    expect(normalizeBearing(10, 8)).toBe(10);
  });
});

describe("the flight's path", () => {
  const pairs: [keyof typeof PLATES, keyof typeof PLATES][] = [
    ["hero", "dutchess"],
    ["dutchess-county", "orange"],
    ["queens", "brooklyn"],
    ["harbour", "region"],
    ["westchester", "ulster"],
  ];

  it("is the start at k = 0 and the target at k = 1, exactly (the plates' own cameras)", () => {
    for (const [a, b] of pairs) {
      const A = camOf(a), B = camOf(b);
      const at = flightPath(A, B, DEEP);
      expect(at(0)).toEqual(A);
      expect(at(1)).toEqual(B);
      const f = flightFrames(A, B, DEEP, 60);
      expect(f.length).toBe(61);
      expect(f[0].cam).toEqual(A);
      expect(f[60].cam).toEqual(B);
    }
  });

  it("is continuous at the ends (frame 1 and n - 1 are near the plates)", () => {
    for (const [a, b] of pairs) {
      const A = camOf(a), B = camOf(b);
      const f = flightFrames(A, B, DEEP, 60);
      expect(Math.abs(f[1].cam.zoom - A.zoom)).toBeLessThan(0.1);
      expect(Math.abs(f[59].cam.zoom - B.zoom)).toBeLessThan(0.1);
      // the first step a few percent of the way at most (the easing starts slow)
      const all = Math.abs(B.lng - A.lng) + Math.abs(B.lat - A.lat);
      expect(Math.abs(f[1].cam.lng - A.lng) + Math.abs(f[1].cam.lat - A.lat)).toBeLessThan(0.05 * all);
    }
  });

  it("zooms out and back in once: the zoom falls then rises, never the other way", () => {
    for (const [a, b] of pairs) {
      const f = flightFrames(camOf(a), camOf(b), DEEP, 80).map((x) => x.cam.zoom);
      const lo = f.indexOf(Math.min(...f));
      for (let i = 1; i <= lo; i++) expect(f[i]).toBeLessThanOrEqual(f[i - 1] + 1e-9);
      for (let i = lo + 1; i < f.length; i++) expect(f[i]).toBeGreaterThanOrEqual(f[i - 1] - 1e-9);
    }
  });

  it("the centre moves along the line from A to B, never back", () => {
    const A = camOf("dutchess-county"), B = camOf("orange");
    const f = flightFrames(A, B, DEEP, 60);
    let last = -1;
    for (const x of f) {
      const t = Math.abs(B.lng - A.lng) > Math.abs(B.lat - A.lat) ? (x.cam.lng - A.lng) / (B.lng - A.lng) : (x.cam.lat - A.lat) / (B.lat - A.lat);
      expect(t).toBeGreaterThanOrEqual(last - 1e-9);
      last = t;
    }
  });

  it("does not depend on the window's scale: twice the css size one zoom deeper is the same flight", () => {
    const A = camOf("hero", false), B = { ...camOf("dutchess"), zoom: camOf("dutchess").zoom - 1 };
    const plain = flightFrames(A, B, { width: 1440, height: 900 }, 60);
    const deep = flightFrames(camOf("hero"), camOf("dutchess"), DEEP, 60);
    for (let i = 0; i <= 60; i++) {
      expect(deep[i].cam.zoom - plain[i].cam.zoom).toBeCloseTo(1, 9);
      expect(deep[i].cam.lng).toBeCloseTo(plain[i].cam.lng, 9);
      expect(deep[i].cam.lat).toBeCloseTo(plain[i].cam.lat, 9);
    }
  });
});

describe("the frame a video shows", () => {
  it("is its media time at the clip's rate, whole milliseconds rounded, inside the clip", () => {
    expect(frameAt(0, 30, 60)).toBe(0);
    expect(frameAt(0.033, 30, 60)).toBe(1);
    expect(frameAt(0.067, 30, 60)).toBe(2);
    expect(frameAt(59 / 30 + 0.0004, 30, 60)).toBe(59);
    expect(frameAt(2.5, 30, 60)).toBe(60);
    expect(frameAt(-0.1, 30, 60)).toBe(0);
    for (let i = 0; i <= 60; i++) expect(frameAt(Math.round((i * 1000) / 30) / 1000, 30, 60)).toBe(i);
  });
});
