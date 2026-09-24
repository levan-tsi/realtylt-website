import { describe, expect, it } from "vitest";
import { EARTH_C, mercX, mercY, mlFrame, projectMl, rangeForZoom, zoomForRange, type MlCamera } from "./geo";

const cam = (o: Partial<MlCamera> = {}): MlCamera => ({ lng: -73.95, lat: 41, zoom: 10, pitch: 0, bearing: 0, fov: 40, elevation: 0, ...o });
const vp = { width: 1440, height: 900 };
const at = (c: MlCamera, lat: number, lng: number, h = 0) => {
  const f = mlFrame(c, vp);
  const out = { x: 0, y: 0, z: 0 };
  const ok = projectMl(f, mercX(lng), mercY(lat), h, out);
  return ok ? out : null;
};

describe("web mercator", () => {
  it("puts the prime meridian and the equator in the middle of the world", () => {
    expect(mercX(0)).toBeCloseTo(0.5, 12);
    expect(mercY(0)).toBeCloseTo(0.5, 12);
    expect(mercX(180)).toBeCloseTo(1, 12);
    expect(mercY(41)).toBeLessThan(0.5); // north is up (smaller y)
  });
});

describe("range and zoom (the Google camera's range, MapLibre's zoom)", () => {
  it("round-trips", () => {
    for (const r of [1_500, 8_000, 60_000, 145_000]) {
      const z = zoomForRange(r, 41, 900, 40);
      expect(rangeForZoom(z, 41, 900, 40)).toBeCloseTo(r, 3);
    }
  });
  it("is the eye's distance: half the window's height over tan(fov/2), in metres at the centre's latitude", () => {
    const z = 10;
    const ppm = (512 * 2 ** z) / (EARTH_C * Math.cos((41 * Math.PI) / 180));
    const d = 450 / Math.tan((20 * Math.PI) / 180);
    expect(rangeForZoom(z, 41, 900, 40)).toBeCloseTo(d / ppm, 6);
  });
  it("a taller window at the same range needs a higher zoom (the same ground fills more pixels)", () => {
    expect(zoomForRange(145_000, 41, 1800, 40) - zoomForRange(145_000, 41, 900, 40)).toBeCloseTo(1, 9);
  });
});

describe("the projection (MapLibre's mercator camera, rebuilt)", () => {
  it("puts the centre in the middle of the window whatever the pitch and bearing", () => {
    for (const pitch of [0, 30, 60]) {
      for (const bearing of [0, 90, 200]) {
        const p = at(cam({ pitch, bearing }), 41, -73.95)!;
        expect(p.x).toBeCloseTo(720, 6);
        expect(p.y).toBeCloseTo(450, 6);
      }
    }
  });
  it("north is up at bearing 0 and east is right", () => {
    const c = cam();
    expect(at(c, 41.05, -73.95)!.y).toBeLessThan(450);
    expect(at(c, 41, -73.9)!.x).toBeGreaterThan(720);
  });
  it("bearing 90 looks east: a place east of the centre is up the screen", () => {
    const p = at(cam({ bearing: 90 }), 41, -73.9)!;
    expect(p.y).toBeLessThan(450);
    expect(Math.abs(p.x - 720)).toBeLessThan(1e-6);
  });
  it("matches the flat top-down scale at pitch 0 (pixels per metre)", () => {
    const c = cam({ zoom: 12 });
    const ppm = (512 * 2 ** 12) / (EARTH_C * Math.cos((41 * Math.PI) / 180));
    const east = 1000 / (EARTH_C * Math.cos((41 * Math.PI) / 180)) * 360; // 1 km east in degrees of longitude
    const p = at(c, 41, -73.95 + east)!;
    expect(p.x - 720).toBeCloseTo(ppm * 1000, 1);
  });
  it("tilted, the far side shrinks and the near side grows", () => {
    const c = cam({ pitch: 60, zoom: 11 });
    const far = at(c, 41.05, -73.95)!, near = at(c, 40.95, -73.95)!;
    expect(450 - far.y).toBeLessThan(near.y - 450);
  });
  it("a hill stands up the screen from where its foot would be (tilted camera)", () => {
    const c = cam({ pitch: 60, zoom: 12 });
    const foot = at(c, 40.99, -73.95, 0)!, top = at(c, 40.99, -73.95, 400)!;
    expect(top.y).toBeLessThan(foot.y);
  });
  it("the centre's own elevation lifts the camera with it: a place at that height is back in the middle", () => {
    const p = at(cam({ pitch: 50, elevation: 300 }), 41, -73.95, 300)!;
    expect(p.x).toBeCloseTo(720, 6);
    expect(p.y).toBeCloseTo(450, 6);
  });
  it("a place behind the eye is refused", () => {
    // Looking north at 80 degrees from low down, a place well south of the centre is behind.
    expect(at(cam({ pitch: 80, zoom: 14 }), 40.5, -73.95)).toBeNull();
  });
});
