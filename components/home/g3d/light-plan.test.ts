import { describe, expect, it } from "vitest";
import { cameraFrame, projectWith, type MapCamera } from "./camera";
import { GLOW_LEVELS, applyPlan, easeFade, focalOf, glowLevel, hashOrder, homesEcef, planDensity, projectHome, representedCounts, stepFades, type Fade } from "./light-plan";
import { lightPins, planLights, type LightSet } from "./thinning";

/** The round-57.2 test region: a dense "city" of 4,000 homes in a 6 km square and 1,000 scattered
 * over a 60 km valley. */
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
const E = homesEcef(L.lat, L.lng);
const ORDER = hashOrder(L.lat.length);
const VP = { width: 1440, height: 900, fov: 40 };
const WIDE: MapCamera = { center: { lat: 40.95, lng: -73.95, altitude: 0 }, range: 90_000, tilt: 45, heading: 0 };
const isCity = (i: number) => i < 4000;

describe("the per-frame projection", () => {
  it("is camera.ts's projection to a thousandth of a pixel, heights included", () => {
    const cam: MapCamera = { center: { lat: 41.2, lng: -74.0, altitude: 120 }, range: 60_000, tilt: 52, heading: 200 };
    const fr = cameraFrame(cam);
    const h = (la: number, ln: number) => 50 + 100 * Math.sin(la * 7 + ln * 3);
    const e = homesEcef(L.lat, L.lng, h);
    const out = { x: 0, y: 0, z: 0 };
    for (let i = 0; i < 5000; i += 97) {
      const want = projectWith(fr, VP, L.lat[i], L.lng[i], h(L.lat[i], L.lng[i]));
      const ok = projectHome(fr, VP, focalOf(VP), e, i, out);
      expect(ok).toBe(!!want);
      if (want) {
        expect(out.x).toBeCloseTo(want.x, 3);
        expect(out.y).toBeCloseTo(want.y, 3);
      }
    }
  });
});

describe("the order", () => {
  it("is a permutation, and the same every time", () => {
    const a = hashOrder(1000), b = hashOrder(1000);
    expect([...a]).toEqual([...b]);
    expect(new Set(a).size).toBe(1000);
    expect([...a].slice(0, 20)).not.toEqual(Array.from({ length: 20 }, (_, i) => i));
  });
});

describe("the density-true plan (round 57.6)", () => {
  const plan = (o: Partial<Parameters<typeof planDensity>[0]> = {}) => planDensity({ ecef: E, order: ORDER, frame: cameraFrame(WIDE), viewport: VP, budget: 150, gap: 8, ...o });

  it("never draws more than the ceiling, and draws it when there are homes enough", () => {
    expect(plan().length).toBe(150);
    expect(plan({ budget: 40 }).length).toBe(40);
  });

  it("keeps two lights at least `gap` px apart", () => {
    const fr = cameraFrame(WIDE);
    const pts = plan({ gap: 12 }).map((i) => projectWith(fr, VP, L.lat[i], L.lng[i])!);
    for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) expect(Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y)).toBeGreaterThanOrEqual(12);
  });

  it("draws only what is on screen, and only the focus county", () => {
    const fr = cameraFrame(WIDE);
    for (const i of plan()) {
      const p = projectWith(fr, VP, L.lat[i], L.lng[i])!;
      expect(p.x).toBeGreaterThan(-9);
      expect(p.x).toBeLessThan(VP.width + 9);
    }
    expect(plan({ county: L.county, focus: "westchester" }).every((i) => !isCity(i))).toBe(true);
  });

  it("is stable: the same camera draws the same homes", () => {
    expect(plan()).toEqual(plan());
  });

  it("keeps the TRUE density: the city, with most of the homes, gets most of the lights, where the round-57.2 lattice evened it out", () => {
    const dense = plan({ budget: 130, gap: 8 });
    const lattice = planLights({ lights: L, pins: lightPins(L), camera: WIDE, viewport: VP, budget: 130, gap: 30 });
    const share = (s: number[]) => s.filter(isCity).length / s.length;
    // 80 % of the homes are in the city; the lattice drew it as a few cells' worth.
    expect(share(dense)).toBeGreaterThan(0.5);
    expect(share(lattice)).toBeLessThan(0.3);
    expect(share(dense)).toBeGreaterThan(share(lattice) * 2);
  });
});

describe("the stable choice (round 57.8: zoom adds and takes away, never reshuffles)", () => {
  // The same place from the territory's height, then close in over the city, then back up.
  const HIGH: MapCamera = { center: { lat: 40.9, lng: -73.95, altitude: 0 }, range: 120_000, tilt: 45, heading: 0 };
  const LOW: MapCamera = { center: { lat: 40.76, lng: -73.97, altitude: 0 }, range: 25_000, tilt: 45, heading: 0 };
  const at = (cam: MapCamera, budget: number, gap: number, keep?: readonly number[]) => planDensity({ ecef: E, order: ORDER, frame: cameraFrame(cam), viewport: VP, budget, gap, keep });
  const onScreen = (cam: MapCamera, i: number) => {
    const p = projectWith(cameraFrame(cam), VP, L.lat[i], L.lng[i]);
    return !!p && p.x >= 0 && p.y >= 0 && p.x <= VP.width && p.y <= VP.height;
  };

  it("coming down keeps every light already lit that stands in the new view, and adds around them", () => {
    const high = at(HIGH, 300, 12);
    const low = at(LOW, 900, 16, high);
    const lowSet = new Set(low);
    const stay = high.filter((i) => onScreen(LOW, i));
    expect(stay.length).toBeGreaterThan(20);
    for (const i of stay) expect(lowSet.has(i)).toBe(true);
    expect(low.length).toBeGreaterThan(stay.length * 2);
  });

  it("without the lit set, the gap alone would drop some of them (why `keep` exists)", () => {
    const high = at(HIGH, 300, 12);
    const cold = new Set(at(LOW, 900, 16));
    expect(high.filter((i) => onScreen(LOW, i) && !cold.has(i)).length).toBeGreaterThan(0);
  });

  it("going back up takes away the latest and returns the lights the high camera drew", () => {
    // Exactly, but for a few homes at the low view's own edge: one just outside it was not lit
    // down there, so up here a lit neighbour of it may stand in its place (3 of 300 in this set).
    const back = (high: number[], low: number[], budget: number) => {
      const b = new Set(at(HIGH, budget, 12, low));
      return high.filter((i) => b.has(i)).length / high.length;
    };
    const high = at(HIGH, 300, 12);
    expect(back(high, at(LOW, 900, 16, high), 300)).toBeGreaterThanOrEqual(0.98);
    // and when the gap, not the budget, is what limits
    const highG = at(HIGH, 100_000, 12);
    expect(back(highG, at(LOW, 100_000, 16, highG), 100_000)).toBeGreaterThanOrEqual(0.98);
    // a flight that never left the view comes back exactly
    const wide = at(WIDE, 300, 12);
    expect(at(WIDE, 300, 12, wide)).toEqual(wide);
  });

  it("a kept light still honours the gap and the budget", () => {
    const low = at(LOW, 900, 16);
    const high = at(HIGH, 200, 12, low);
    expect(high.length).toBeLessThanOrEqual(200);
    const fr = cameraFrame(HIGH);
    const pts = high.map((i) => projectWith(fr, VP, L.lat[i], L.lng[i])!);
    for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) expect(Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y)).toBeGreaterThanOrEqual(12);
  });
});

describe("the glow stands for the homes (round 57.8: density-true when the gap is full)", () => {
  const fr = cameraFrame(WIDE);
  const plan = planDensity({ ecef: E, order: ORDER, frame: fr, viewport: VP, budget: 400, gap: 12 });
  const counts = representedCounts({ ecef: E, frame: fr, viewport: VP, plan, reach: 40 });

  it("gives every drawn light the homes nearest it, and every home on screen to one light", () => {
    expect(counts.length).toBe(plan.length);
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(1); // itself at least
    const onScreen = Array.from({ length: L.lat.length }, (_, i) => i).filter((i) => {
      const p = projectWith(fr, VP, L.lat[i], L.lng[i]);
      return !!p && p.x >= -8 && p.y >= -8 && p.x <= VP.width + 8 && p.y <= VP.height + 8;
    }).length;
    const sum = counts.reduce((a, b) => a + b, 0);
    expect(sum).toBeLessThanOrEqual(onScreen);
    expect(sum).toBeGreaterThan(onScreen * 0.9);
  });

  it("a light in the city stands for far more homes than one in the valley", () => {
    const med = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
    const city = plan.map((i, k) => (isCity(i) ? counts[k] : -1)).filter((c) => c >= 0);
    const valley = plan.map((i, k) => (!isCity(i) ? counts[k] : -1)).filter((c) => c >= 0);
    expect(med(city)).toBeGreaterThan(3 * med(valley));
  });

  it("the level of a light's glow: the median is 1, more homes more glow, held to a few steps", () => {
    expect(GLOW_LEVELS[glowLevel(10, 10)]).toBe(1);
    expect(glowLevel(40, 10)).toBeGreaterThan(glowLevel(10, 10));
    expect(glowLevel(1, 10)).toBeLessThan(glowLevel(10, 10));
    expect(glowLevel(10_000, 10)).toBe(GLOW_LEVELS.length - 1);
    expect(glowLevel(0, 10)).toBe(0);
    for (let c = 1; c < 200; c++) expect(glowLevel(c + 1, 10)).toBeGreaterThanOrEqual(glowLevel(c, 10));
    expect(Math.min(...GLOW_LEVELS)).toBeGreaterThan(0.3);
    expect(Math.max(...GLOW_LEVELS)).toBeLessThanOrEqual(1.8);
  });
});

describe("the cross-fade", () => {
  it("fades the old set out and the new in over the fade, then forgets the gone", () => {
    const f = new Map<number, Fade>();
    applyPlan(f, [1, 2, 3], true);
    expect([...f.values()].every((x) => x.a === 1)).toBe(true);
    applyPlan(f, [2, 3, 4], false);
    expect(f.get(1)!.to).toBe(0);
    expect(f.get(4)!.a).toBe(0);
    expect(f.get(2)!.a).toBe(1);
    expect(stepFades(f, 500, 1000)).toBe(true);
    expect(f.get(1)!.a).toBeCloseTo(0.5);
    expect(f.get(4)!.a).toBeCloseTo(0.5);
    expect(stepFades(f, 600, 1000)).toBe(false);
    expect(f.has(1)).toBe(false);
    expect(f.get(4)!.a).toBe(1);
  });

  it("a light planned again while fading out comes back from where it was (no pop)", () => {
    const f = new Map<number, Fade>();
    applyPlan(f, [7], true);
    applyPlan(f, [], false);
    stepFades(f, 300, 1000);
    applyPlan(f, [7], false);
    expect(f.get(7)!.a).toBeCloseTo(0.7);
    expect(f.get(7)!.to).toBe(1);
  });

  it("an instant plan (a cut) is there at once", () => {
    const f = new Map<number, Fade>();
    applyPlan(f, [1], true);
    applyPlan(f, [2], true);
    expect([...f.keys()]).toEqual([2]);
    expect(f.get(2)!.a).toBe(1);
  });

  it("the drawn alpha eases in and out with no jump at either end", () => {
    expect(easeFade(0)).toBe(0);
    expect(easeFade(1)).toBe(1);
    expect(easeFade(0.05)).toBeLessThan(0.01);
    expect(easeFade(0.5)).toBeCloseTo(0.5);
  });
});
