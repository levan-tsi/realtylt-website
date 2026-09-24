import { describe, expect, it } from "vitest";
import { LADDER } from "../g3d/cameras";
import { AREA_COUNTY_OF } from "../night/shots";
import { mercX, mercY, mlFrame, projectMl, rangeForZoom } from "./geo";
import { LENS, MAX_PITCH, MIN_PITCH, ML_SHOTS, SIGNATURE, flightMs, lensFor, mlShot } from "./shots";

const LAPTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const where = (name: Parameters<typeof mlShot>[0], vp: { width: number; height: number }, lat: number, lng: number) => {
  const f = mlFrame(mlShot(name, vp), vp);
  const p = { x: 0, y: 0, z: 0 };
  return projectMl(f, mercX(lng), mercY(lat), 0, p) ? p : null;
};

describe("the shot table", () => {
  it("has every shot the page flies to", () => {
    for (const n of LADDER) expect(ML_SHOTS[n], n).toBeDefined();
  });
  it("tilts every shot 55 to 65 degrees", () => {
    for (const [n, t] of Object.entries(ML_SHOTS))
      for (const c of [t.wide, t.tall]) {
        expect(c.pitch, n).toBeGreaterThanOrEqual(MIN_PITCH);
        expect(c.pitch, n).toBeLessThanOrEqual(MAX_PITCH);
      }
  });
  it("keeps the Google map's lens (40 degrees on a laptop, 58 on a phone)", () => {
    expect(lensFor(LAPTOP)).toBe(LENS.wide);
    expect(lensFor(PHONE)).toBe(LENS.tall);
  });
  it("turns the range into a zoom for the window: the eye stands at the shot's range", () => {
    for (const vp of [LAPTOP, PHONE, { width: 1920, height: 1080 }]) {
      const c = mlShot("westchester", vp);
      expect(rangeForZoom(c.zoom, c.lat, vp.height, c.fov)).toBeCloseTo(c.range, 3);
    }
  });
  it("opens high over the territory and comes down for the chapters (zoom 8 to 10 against 11.5 to 15)", () => {
    expect(mlShot("hero", LAPTOP).zoom).toBeGreaterThan(8);
    expect(mlShot("hero", LAPTOP).zoom).toBeLessThan(10);
    for (const n of ["dutchess", "highlands", "westchester", "manhattan", "harbour"] as const) {
      expect(mlShot(n, LAPTOP).zoom, n).toBeGreaterThan(11.5);
      expect(mlShot(n, LAPTOP).zoom, n).toBeLessThan(15);
    }
  });
});

describe("what each shot shows", () => {
  it("the territory: Staten Island to Poughkeepsie, the Sound to the Shawangunks, in the laptop's free side", () => {
    const places: [string, number, number][] = [
      ["Staten Island's south shore", 40.52, -74.2],
      ["the Rockaways", 40.585, -73.82],
      ["Port Chester on the Sound", 41.0, -73.665],
      ["Poughkeepsie", 41.7, -73.92],
      ["New Paltz", 41.75, -74.087],
      ["Middletown", 41.446, -74.422],
      ["Nyack", 41.09, -73.918],
    ];
    for (const [what, lat, lng] of places) {
      const p = where("hero", LAPTOP, lat, lng);
      expect(p, what).not.toBeNull();
      // right of the headline's column (x 560) and inside the window
      expect(p!.x, what).toBeGreaterThan(560);
      expect(p!.x, what).toBeLessThan(LAPTOP.width - 10);
      expect(p!.y, what).toBeGreaterThan(90);
      expect(p!.y, what).toBeLessThan(LAPTOP.height - 10);
    }
  });
  it("the territory on a phone: the city, Long Island's west and the river to Poughkeepsie inside the window", () => {
    for (const [what, lat, lng] of [
      ["Manhattan", 40.78, -73.97],
      ["Poughkeepsie", 41.7, -73.92],
      ["the Rockaways", 40.585, -73.82],
      ["White Plains", 41.034, -73.763],
    ] as const) {
      const p = where("hero", PHONE, lat, lng);
      expect(p, what).not.toBeNull();
      expect(p!.x, what).toBeGreaterThan(0);
      expect(p!.x, what).toBeLessThan(PHONE.width);
      expect(p!.y, what).toBeGreaterThan(80);
      expect(p!.y, what).toBeLessThan(PHONE.height);
    }
  });
  it("every close shot holds its signature place in the window at both widths; on a laptop the counties' right of the list", () => {
    for (const [name, sig] of Object.entries(SIGNATURE) as [keyof typeof SIGNATURE, (typeof SIGNATURE)[keyof typeof SIGNATURE]][]) {
      for (const vp of [LAPTOP, PHONE]) {
        const p = where(name, vp, sig.lat, sig.lng);
        expect(p, `${name} ${vp.width}`).not.toBeNull();
        expect(p!.x, `${name} ${vp.width} x`).toBeGreaterThan(0);
        expect(p!.x, `${name} ${vp.width} x`).toBeLessThan(vp.width);
        expect(p!.y, `${name} ${vp.width} y`).toBeGreaterThan(0);
        expect(p!.y, `${name} ${vp.width} y`).toBeLessThan(vp.height);
        // a county on a laptop: right of the "Where we work" list, which ends at x 728
        if (vp === LAPTOP && name in AREA_COUNTY_OF) expect(p!.x, `${name} right of the list`).toBeGreaterThan(740);
      }
    }
  });
});

describe("a flight's duration", () => {
  it("is 1.6 s for no journey and 2.6 s for the long ones", () => {
    const a = { lat: 41, lng: -74, range: 8000 };
    expect(flightMs(a, a)).toBe(1600);
    expect(flightMs(a, { lat: 39.8, lng: -74, range: 8000 })).toBe(2600);
    expect(flightMs(a, { lat: 41, lng: -74, range: 145_000 })).toBe(2600);
  });
});
