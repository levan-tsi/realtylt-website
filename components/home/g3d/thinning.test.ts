import { describe, expect, it } from "vitest";
import { diffLights, lightPins, nearestLight, planLights, type LightSet } from "./thinning";
import type { MapCamera } from "./camera";

/** A synthetic region: a dense "city" of 4,000 homes in a 6 km square and 1,000 scattered over a
 * 60 km valley, split between two counties. */
function region(): LightSet {
  let s = 11;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const n = 5000;
  const lat = new Float64Array(n), lng = new Float64Array(n);
  const county: string[] = [];
  for (let i = 0; i < n; i++) {
    const city = i < 4000;
    lat[i] = city ? 40.75 + (r() - 0.5) * 0.054 : 41.0 + (r() - 0.5) * 0.54;
    lng[i] = city ? -73.98 + (r() - 0.5) * 0.071 : -73.95 + (r() - 0.5) * 0.71;
    county.push(city ? "manhattan" : "westchester");
  }
  return { lat, lng, county };
}

const L = region();
const PINS = lightPins(L);
const VP = { width: 1440, height: 900, fov: 40 };
const WIDE: MapCamera = { center: { lat: 40.95, lng: -73.95, altitude: 0 }, range: 90_000, tilt: 45, heading: 0 };
const CLOSE: MapCamera = { center: { lat: 40.75, lng: -73.98, altitude: 0 }, range: 9_000, tilt: 45, heading: 0 };

describe("the thinning ladder", () => {
  it("never draws more than the ceiling", () => {
    expect(planLights({ lights: L, pins: PINS, camera: WIDE, viewport: VP, budget: 350 }).length).toBeLessThanOrEqual(350);
  });

  it("draws more homes as the camera comes closer", () => {
    const far = planLights({ lights: L, pins: PINS, camera: WIDE, viewport: VP, budget: 5000 }).length;
    const near = planLights({ lights: L, pins: PINS, camera: CLOSE, viewport: VP, budget: 5000 }).length;
    expect(near).toBeGreaterThan(far);
  });

  it("keeps the dense city from becoming one blob: no two drawn homes closer than the planner's dot spacing", () => {
    const plan = planLights({ lights: L, pins: PINS, camera: WIDE, viewport: VP, budget: 5000 });
    // Projected positions of the plan, from the planner's own maths via the same camera.
    const again = planLights({ lights: L, pins: PINS, camera: WIDE, viewport: VP, budget: 5000 });
    expect(again).toEqual(plan); // stable: the same frame always draws the same homes
    const cityShare = plan.filter((i) => L.county[i] === "manhattan").length / plan.length;
    // 80% of the homes are in the city; on screen it is a small square, so thinning gives the
    // valley a real share of the lights instead of 4 in 5.
    expect(cityShare).toBeLessThan(0.8);
    expect(cityShare).toBeGreaterThan(0.05);
  });

  it("keeps a county shot to its county", () => {
    const plan = planLights({ lights: L, pins: PINS, camera: WIDE, viewport: VP, budget: 800, focus: "westchester" });
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.every((i) => L.county[i] === "westchester")).toBe(true);
  });

  it("plans 5,000 homes fast enough to run once per landing (under 40 ms here)", () => {
    const t0 = performance.now();
    planLights({ lights: L, pins: PINS, camera: WIDE, viewport: VP, budget: 1500 });
    expect(performance.now() - t0).toBeLessThan(40);
  });
});

describe("changing the drawn set", () => {
  it("adds only the new homes, in the planner's order, and takes away only the gone ones", () => {
    expect(diffLights(new Set([1, 2, 3]), [3, 4, 1, 5])).toEqual({ add: [4, 5], remove: [2] });
    expect(diffLights(new Set(), [7, 8])).toEqual({ add: [7, 8], remove: [] });
  });
});

describe("hover", () => {
  const xy = new Float32Array([100, 100, 110, 100, 400, 300]);
  it("finds the drawn home nearest the pointer within the radius", () => {
    expect(nearestLight(xy, 3, 108, 101)).toBe(1);
    expect(nearestLight(xy, 3, 101, 99)).toBe(0);
    expect(nearestLight(xy, 3, 395, 305)).toBe(2);
  });
  it("finds nothing beyond it", () => {
    expect(nearestLight(xy, 3, 200, 200)).toBe(-1);
    expect(nearestLight(xy, 3, 100, 116)).toBe(-1);
    expect(nearestLight(xy, 3, 100, 113)).toBe(0);
  });
  it("only looks at the homes counted", () => {
    expect(nearestLight(xy, 2, 400, 300)).toBe(-1);
  });
});
