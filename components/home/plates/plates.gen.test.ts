import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PLATES } from "./plates.gen";
import { plateSrc, type PlateAspect } from "./plate-frame";
import { AREA_FLIGHT, FLIGHT } from "../night/shots";

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
        expect(a === "wide" ? [p.w, p.h] : [p.w, p.h]).toEqual(a === "wide" ? [1440, 900] : [390, 844]);
        expect(p.widths.length).toBeGreaterThanOrEqual(2);
        expect([...p.widths]).toEqual([...p.widths].sort((x, y) => y - x));
        expect(p.widths[0] / p.w).toBeCloseTo(a === "wide" ? 2 : 3);
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
