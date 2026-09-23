import { describe, expect, it } from "vitest";
import { cameraFrame, eyeOf, flightMillis, framingToCamera, fromEcef, headingDelta, project, toEcef, type MapCamera } from "./camera";
import { lngLatToWorld, over } from "../night/world";

const VP = { width: 1440, height: 900, fov: 35 };

describe("the earth", () => {
  it("round-trips a place through earth-centred coordinates", () => {
    for (const [lat, lng, h] of [
      [41.7, -73.92, 0],
      [40.75, -73.97, 250],
      [41.2, -74.03, 55_000],
    ]) {
      const back = fromEcef(toEcef(lat, lng, h));
      expect(back.lat).toBeCloseTo(lat, 7);
      expect(back.lng).toBeCloseTo(lng, 7);
      expect(back.altitude).toBeCloseTo(h, 2);
    }
  });
});

describe("the camera", () => {
  const cam: MapCamera = { center: { lat: 41.5, lng: -73.95, altitude: 0 }, range: 60_000, tilt: 60, heading: 20 };

  it("puts its center in the middle of the window", () => {
    const p = project(cam, VP, 41.5, -73.95)!;
    expect(p.x).toBeCloseTo(720, 3);
    expect(p.y).toBeCloseTo(450, 3);
  });

  it("stands the eye `range` from the center, `tilt` off the vertical, behind the heading", () => {
    const eye = eyeOf(cam);
    // tilt 60, range 60 km: 30 km up, 52 km back along 200 degrees (south-south-west of the center).
    expect(eye.altitude).toBeGreaterThan(29_900);
    expect(eye.altitude).toBeLessThan(30_300);
    expect(eye.lat).toBeLessThan(41.5);
    expect(eye.lng).toBeLessThan(-73.95);
  });

  it("is the same camera when written as the eye with range 0 (the form the element reports after a flight)", () => {
    const eye = eyeOf(cam);
    const asEye: MapCamera = { center: eye, range: 0, tilt: cam.tilt, heading: cam.heading };
    // The eye's own tilt is measured from ITS vertical, which leans 0.47 degrees from the
    // center's over 52 km (the element reported 59.53 for a camera set at 60 on the live map), so the
    // eye-form tilt is 0.47 less; the rest is its heading, which also bends a hair over that distance.
    for (const [lat, lng] of [
      [41.55, -73.9],
      [41.45, -74.05],
      [41.6, -73.8],
    ]) {
      const a = project(cam, VP, lat, lng)!;
      const b = project({ ...asEye, tilt: cam.tilt - 0.47 }, VP, lat, lng)!;
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(4);
    }
  });

  it("puts north up the screen when it looks north and east to the right", () => {
    const north: MapCamera = { ...cam, heading: 0 };
    const c = project(north, VP, 41.5, -73.95)!;
    const n = project(north, VP, 41.55, -73.95)!;
    const e = project(north, VP, 41.5, -73.9)!;
    expect(n.y).toBeLessThan(c.y);
    expect(Math.abs(n.x - c.x)).toBeLessThan(0.5);
    expect(e.x).toBeGreaterThan(c.x);
  });

  it("returns nothing for a place behind the eye", () => {
    expect(project({ ...cam, tilt: 80 }, VP, 40.5, -74.4)).toBeNull();
  });

  it("keeps its axes orthonormal", () => {
    const f = cameraFrame(cam);
    const d = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    expect(d(f.right, f.forward)).toBeCloseTo(0, 9);
    expect(d(f.up, f.forward)).toBeCloseTo(0, 9);
    expect(d(f.up, f.up)).toBeCloseTo(1, 9);
  });
});

describe("a night framing as Google's camera", () => {
  it("centers on the target and reads range, tilt and heading off the eye", () => {
    // An eye 30 km up, 40 km south of the target: range 50 km, tilt atan(40/30), looking north.
    const target = over(-73.95, 41.5, 0);
    const [tx, , tz] = lngLatToWorld(-73.95, 41.5);
    const f = { pos: [tx, 30, tz + 40] as [number, number, number], target, fov: 40, moon: [0, 0] as [number, number] };
    const c = framingToCamera(f);
    expect(c.center.lat).toBeCloseTo(41.5, 6);
    expect(c.center.lng).toBeCloseTo(-73.95, 6);
    expect(c.range).toBe(50_000);
    expect(c.tilt).toBeCloseTo(53.13, 1);
    expect(c.heading).toBeCloseTo(0, 1);
  });

  it("carries the heading clockwise from north (an eye to the east looks west)", () => {
    const target = over(-73.95, 41.5, 0);
    const f = { pos: [target[0] + 20, 10, target[2]] as [number, number, number], target, fov: 40, moon: [0, 0] as [number, number] };
    expect(framingToCamera(f).heading).toBeCloseTo(270, 1);
  });

  it("reads the target's height off the 6x-lifted terrain, and the eye's as plain kilometres", () => {
    const target: [number, number, number] = [0, 0.3, 0]; // 300 m of world height = 50 m of ground
    const f = { pos: [0, 10, 10] as [number, number, number], target, fov: 40, moon: [0, 0] as [number, number] };
    expect(framingToCamera(f).center.altitude).toBe(50);
  });
});

describe("a flight's length", () => {
  const a: MapCamera = { center: { lat: 41.5, lng: -73.95, altitude: 0 }, range: 30_000, tilt: 50, heading: 0 };
  it("stays inside 1.6 to 2.6 seconds and grows with the distance", () => {
    const near = flightMillis(a, { ...a, center: { ...a.center, lat: 41.52 } });
    const far = flightMillis(a, { ...a, center: { lat: 40.7, lng: -74, altitude: 0 } });
    expect(near).toBeGreaterThanOrEqual(1600);
    expect(far).toBeLessThanOrEqual(2600);
    expect(far).toBeGreaterThan(near);
    expect(flightMillis(a, a)).toBe(1600);
  });

  it("turns the short way round", () => {
    expect(headingDelta(350, 10)).toBe(20);
    expect(headingDelta(10, 350)).toBe(-20);
    expect(headingDelta(0, 180)).toBe(180);
  });
});
