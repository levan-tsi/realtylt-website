import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PLATES } from "./plates.gen";
import { plateSrc, type Plate, type PlateAspect } from "./plate-frame";
import { AREA_COUNTY_OF, AREA_FLIGHT, FLIGHT, type ShotName } from "../night/shots";
import { rangeForZoom } from "../ml/geo";

/** 1 for a plate rendered at the window's css size, 2 for a deep render (round 59). */
const deepOf = (p: Plate, a: PlateAspect) => {
  const k = p.w / (a === "wide" ? 1440 : 390);
  // the manifest says so itself (plate-frame.ts plateRange reads it)
  expect(p.k ?? 1).toBe(k);
  return k;
};

/** THE MANIFEST IS THE PAGE'S GROUND (round 58): every shot the page flies needs both pictures,
 * each with the camera the map reported and its 16-number pixel matrix, and every file the sources
 * name must be in public/plates/ (a missing plate would leave a section without a picture). */
const SHOTS = [...FLIGHT, ...AREA_FLIGHT];
const ASPECTS: PlateAspect[] = ["wide", "tall"];

describe("the plates manifest", () => {
  it("has both aspects of every shot on the page's ladder", () => {
    for (const s of SHOTS) for (const a of ASPECTS) expect(PLATES[s]?.[a], `${s}/${a}`).toBeTruthy();
  });

  it("each plate carries its render size, its served widths, a camera and the map's own matrix", () => {
    for (const s of SHOTS)
      for (const a of ASPECTS) {
        const p = PLATES[s][a];
        // a plain render at the window's css size, or a deep one (round 59) at twice it
        const k = deepOf(p, a);
        expect([p.w, p.h]).toEqual(a === "wide" ? [1440 * k, 900 * k] : [390 * k, 844 * k]);
        expect(p.widths.length).toBeGreaterThanOrEqual(2);
        expect([...p.widths]).toEqual([...p.widths].sort((x, y) => y - x));
        expect(p.widths[0] / p.w).toBeCloseTo((a === "wide" ? 2 : 3) / k);
        expect(p.m).toHaveLength(16);
        for (const v of p.m) expect(Number.isFinite(v)).toBe(true);
        expect(p.ws).toBeGreaterThan(0);
        expect(p.ex).toBeGreaterThan(0);
        expect(p.cam.zoom).toBeGreaterThan(5);
        expect(p.cam.zoom).toBeLessThan(16);
        expect(p.cam.pitch).toBeGreaterThanOrEqual(50);
        expect(p.cam.pitch).toBeLessThanOrEqual(70);
        expect(p.cam.fov).toBeGreaterThan(30);
        expect(Math.abs(p.cam.lat - 41)).toBeLessThan(1.5);
        expect(Math.abs(p.cam.lng + 74)).toBeLessThan(1.5);
      }
  });

  it("the matrix projects the camera's own centre to the middle of the plate", () => {
    const RAD = Math.PI / 180;
    for (const s of SHOTS)
      for (const a of ASPECTS) {
        const p = PLATES[s][a];
        const X = ((180 + p.cam.lng) / 360) * p.ws, Y = ((180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (p.cam.lat * RAD) / 2))) / 360) * p.ws;
        const m = p.m, h = p.cam.elevation;
        const w = m[3] * X + m[7] * Y + m[11] * h + m[15];
        const x = (m[0] * X + m[4] * Y + m[8] * h + m[12]) / w, y = (m[1] * X + m[5] * Y + m[9] * h + m[13]) / w;
        expect(Math.abs(x - p.w / 2), `${s}/${a} x`).toBeLessThan(1.5);
        expect(Math.abs(y - p.h / 2), `${s}/${a} y`).toBeLessThan(1.5);
      }
  });

  it("round 59: every county plate stands at most 10 km from its place, the chapters at most 12, the territory as it was", () => {
    // the range read back from the recorded camera for the render's own height and lens: a deep
    // plate's doubled height and zoom + 1 give the same metres
    const range = (p: Plate) => rangeForZoom(p.cam.zoom, p.cam.lat, p.h, p.cam.fov);
    for (const a of ASPECTS) {
      for (const s of Object.keys(AREA_COUNTY_OF) as ShotName[]) expect(range(PLATES[s][a]), `${s}/${a}`).toBeLessThanOrEqual(10_000 + 1);
      for (const s of ["dutchess", "highlands", "westchester"] as const) expect(range(PLATES[s][a]), `${s}/${a}`).toBeLessThanOrEqual(12_000 + 1);
    }
    expect(Math.round(range(PLATES.hero.wide))).toBe(145_000);
    expect(Math.round(range(PLATES.hero.tall))).toBe(140_000);
    expect(Math.round(range(PLATES.region.wide))).toBe(60_000);
  });

  it("a deep plate is the plain render's camera one zoom deeper at twice the css size: the same range, the same ground", () => {
    for (const s of SHOTS)
      for (const a of ASPECTS) {
        const p = PLATES[s][a];
        const k = deepOf(p, a);
        const plain = rangeForZoom(p.cam.zoom - Math.log2(k), p.cam.lat, p.h / k, p.cam.fov);
        expect(plain, `${s}/${a}`).toBeCloseTo(rangeForZoom(p.cam.zoom, p.cam.lat, p.h, p.cam.fov), 3);
        // the world is k times wider, so a place lands k times further from the corner
        expect(p.ws / (512 * 2 ** p.cam.zoom), `${s}/${a}`).toBeCloseTo(1, 6);
      }
  });

  it("every file the page can ask for is in public/plates", () => {
    const missing: string[] = [];
    for (const s of SHOTS)
      for (const a of ASPECTS)
        for (const w of PLATES[s][a].widths)
          for (const f of ["avif", "webp"] as const) {
            const rel = plateSrc(s, a, w, f);
            if (!fs.existsSync(path.join(process.cwd(), "public", rel))) missing.push(rel);
          }
    expect(missing).toEqual([]);
  });
});
