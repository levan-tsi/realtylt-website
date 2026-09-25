import { describe, expect, it } from "vitest";
import { PLATE_BREAKPOINT, TALL_MEDIA, WIDE_MEDIA, aspectFor, coverFit, plateProjector, plateRange, plateSrc, plateSrcSet, visiblePlateRect, type Plate } from "./plate-frame";
import { mercX, mercY, rangeForZoom } from "../ml/geo";

/** A matrix that maps world pixels straight to css pixels (w = 1): x = X, y = Y. Column-major as
 * geo.ts reads it: x = m[0] X + m[4] Y + m[8] h + m[12]; w = m[3] X + m[7] Y + m[11] h + m[15]. */
const FLAT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const plate = (w: number, h: number): Plate => ({ w, h, widths: [w * 2, w], cam: { lng: -74, lat: 41, zoom: 9, pitch: 55, bearing: 8, fov: 40, elevation: 0 }, ex: 1.6, ws: 1000, m: FLAT });

describe("which plate a window shows", () => {
  it("the tall picture under the page's lg breakpoint, the wide one from it", () => {
    expect(aspectFor(390)).toBe("tall");
    expect(aspectFor(1023)).toBe("tall");
    expect(aspectFor(1024)).toBe("wide");
    expect(aspectFor(1920)).toBe("wide");
    expect(PLATE_BREAKPOINT).toBe(1024);
    expect(TALL_MEDIA).toBe("(max-width: 1023px)");
    expect(WIDE_MEDIA).toBe("(min-width: 1024px)");
  });

  it("names its files by shot, aspect, width and format, and lists every width in the srcset", () => {
    expect(plateSrc("queens", "wide", 2880, "avif")).toBe("/plates/queens-wide-2880.avif");
    expect(plateSrcSet("hero", "tall", { widths: [1170, 780] }, "webp")).toBe("/plates/hero-tall-1170.webp 1170w, /plates/hero-tall-780.webp 780w");
  });
});

describe("object-fit: cover, centred", () => {
  it("a window of the plate's own aspect fits exactly", () => {
    expect(coverFit({ w: 1440, h: 900 }, { width: 1440, height: 900 })).toEqual({ s: 1, ox: 0, oy: 0 });
    expect(coverFit({ w: 1440, h: 900 }, { width: 2880, height: 1800 })).toEqual({ s: 2, ox: 0, oy: 0 });
  });

  it("a wider window fills its width and crops the plate's top and bottom evenly", () => {
    const f = coverFit({ w: 1440, h: 900 }, { width: 1920, height: 1080 });
    expect(f.s).toBeCloseTo(1920 / 1440);
    expect(f.ox).toBe(0);
    expect(f.oy).toBeCloseTo((1080 - 900 * (1920 / 1440)) / 2);
    expect(f.oy).toBeLessThan(0);
  });

  it("a taller window fills its height and crops the sides evenly", () => {
    const f = coverFit({ w: 1440, h: 900 }, { width: 1280, height: 1024 });
    expect(f.s).toBeCloseTo(1024 / 900);
    expect(f.oy).toBe(0);
    expect(f.ox).toBeCloseTo((1280 - 1440 * (1024 / 900)) / 2);
    expect(f.ox).toBeLessThan(0);
  });

  it("the visible rectangle is the window mapped back into the plate", () => {
    const p = { w: 1440, h: 900 }, vp = { width: 1920, height: 1080 };
    const f = coverFit(p, vp);
    const r = visiblePlateRect(p, f, vp);
    expect(r.x).toBeCloseTo(0);
    expect(r.w).toBeCloseTo(1440);
    expect(r.h).toBeCloseTo(1080 / f.s);
    expect(r.y).toBeCloseTo((900 - r.h) / 2);
  });
});

describe("the plate's projector", () => {
  it("is the recorded matrix, then the fit: a place lands at its plate pixel scaled and shifted", () => {
    const p = plate(1440, 900);
    const fit = { s: 2, ox: 10, oy: -20 };
    const at = plateProjector(p, fit);
    const out = { x: 0, y: 0, z: 0 };
    // mercator (0.25, 0.5) * ws 1000 = plate pixel (250, 500)
    expect(at(0.25, 0.5, 0, out)).toBe(true);
    expect(out.x).toBeCloseTo(250 * 2 + 10);
    expect(out.y).toBeCloseTo(500 * 2 - 20);
  });

  it("refuses a place behind the eye (w <= 0), as the map does", () => {
    const behind = { ...plate(1440, 900), m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1] };
    const out = { x: 0, y: 0, z: 0 };
    expect(plateProjector(behind, { s: 1, ox: 0, oy: 0 })(mercX(-74), mercY(41), 0, out)).toBe(false);
  });

  it("the range the window sees is the render's range over the fit's scale", () => {
    const p = plate(1440, 900);
    const r0 = rangeForZoom(p.cam.zoom, p.cam.lat, p.h, p.cam.fov);
    expect(plateRange(p, { s: 1, ox: 0, oy: 0 })).toBeCloseTo(r0);
    expect(plateRange(p, { s: 4 / 3, ox: 0, oy: 0 })).toBeCloseTo(r0 * 0.75);
  });
  it("a deep plate (round 59: twice the css size, one zoom deeper) gives the window the plain plate's range", () => {
    const plain = plate(1440, 900);
    const deep: Plate = { ...plate(2880, 1800), cam: { ...plain.cam, zoom: plain.cam.zoom + 1 }, k: 2 };
    const vp = { width: 1440, height: 900 };
    expect(plateRange(deep, coverFit(deep, vp))).toBeCloseTo(plateRange(plain, coverFit(plain, vp)), 6);
    const big = { width: 1920, height: 1080 };
    expect(plateRange(deep, coverFit(deep, big))).toBeCloseTo(plateRange(plain, coverFit(plain, big)), 6);
    // without its k the deep plate would read as twice as far (the bug the calibration probe caught)
    expect(plateRange({ ...deep, k: undefined }, coverFit(deep, vp))).toBeCloseTo(2 * plateRange(plain, coverFit(plain, vp)), 6);
  });
});
