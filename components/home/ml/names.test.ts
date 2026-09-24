import { describe, expect, it } from "vitest";
import { projectedItems } from "./names";
import { projectAllMl } from "./controller";
import { mercX, mercY, mlFrame } from "./geo";

describe("our names on the MapLibre map", () => {
  const vp = { width: 800, height: 600 };
  const labels = [
    { id: "a", text: "Here", tier: "county" as const, lat: 1, lng: 1 },
    { id: "b", text: "Off", tier: "borough" as const, lat: 2, lng: 2 },
    { id: "c", text: "Behind", tier: "borough" as const, lat: 3, lng: 3 },
  ];
  const screenOf = (lat: number) => (lat === 1 ? { x: 400, y: 300 } : lat === 2 ? { x: 900, y: 10 } : null);
  it("projects each name with the map's own projection and leaves out what is off the window or behind the eye", () => {
    const items = projectedItems(screenOf, vp, (t) => ({ w: t.length * 9, h: 20 }), labels);
    expect(items).toEqual([{ id: "a", text: "Here", tier: "county", x: 400, y: 300, w: 36, h: 20 }]);
  });
});

describe("every home on screen, by the MapLibre projection (the planner's input)", () => {
  const vp = { width: 1440, height: 900 };
  const f = mlFrame({ lng: -73.95, lat: 41, zoom: 11, pitch: 0, bearing: 0, fov: 40, elevation: 0 }, vp);
  const pts = new Float64Array([mercX(-73.95), mercY(41), 0, mercX(-70), mercY(41), 0, mercX(-73.96), mercY(41.01), 0]);
  it("keeps the homes in the window, in css px", () => {
    const p = projectAllMl(pts, f, vp);
    expect([...p.ok]).toEqual([1, 0, 1]);
    expect(p.x[0]).toBeCloseTo(720, 3);
    expect(p.y[0]).toBeCloseTo(450, 3);
  });
  it("keeps only the focus county's homes at a county chapter", () => {
    const p = projectAllMl(pts, f, vp, 8, ["putnam", "putnam", "orange"], "putnam");
    expect([...p.ok]).toEqual([1, 0, 0]);
  });
});
