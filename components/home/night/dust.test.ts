import { describe, expect, it } from "vitest";
import { buildContourDust, buildDepthMesh, buildDust, edgeWeight, prng, smoothLand } from "./dust";
import { decodeElevation, encodeElevation, isWater, waterness, type ElevationGrid } from "./elevation";
import { KM_PER_DEG_LAT, KM_PER_DEG_LNG, ORIGIN, REGION, worldToLngLat } from "./world";

/** An N x N grid over a small box near the region's middle, 100 m cells, from a height function
 * of the cell (c, r); null = water. */
function grid(n: number, height: (c: number, r: number) => number | null): ElevationGrid {
  const half = (n * 0.1) / 2; // km: square 100 m cells
  const box = { west: ORIGIN.lng - half / KM_PER_DEG_LNG, east: ORIGIN.lng + half / KM_PER_DEG_LNG, south: ORIGIN.lat - half / KM_PER_DEG_LAT, north: ORIGIN.lat + half / KM_PER_DEG_LAT };
  const values: number[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) values.push(encodeElevation(height(c, r), 1000));
  return decodeElevation(values, { box, w: n, h: n, maxM: 1000, metresPerCell: { x: 100, y: 100 } });
}

describe("the scattered fill", () => {
  // West half land (a ramp), east half water.
  const g = grid(40, (c) => (c < 20 ? 10 + c * 10 : null));
  const dust = buildDust(g, { count: 5000, edgeFade: false });

  it("draws the grains it was asked for, deterministically", () => {
    expect(dust.count).toBeGreaterThan(4900);
    expect(dust.count).toBeLessThanOrEqual(5000);
    const again = buildDust(g, { count: 5000, edgeFade: false });
    expect(Array.from(again.positions.subarray(0, 30))).toEqual(Array.from(dust.positions.subarray(0, 30)));
  });

  it("never puts a grain on the water", () => {
    for (let i = 0; i < dust.count; i++) {
      const [lng, lat] = worldToLngLat(dust.positions[i * 3], dust.positions[i * 3 + 2]);
      expect(isWater(g, lng, lat)).toBe(false);
    }
  });

  it("gathers more grains on steep ground than on flat", () => {
    // Left quarter flat, second quarter steep.
    const s = grid(40, (c) => (c < 10 ? 50 : c < 20 ? 50 + (c - 10) * 40 : 450));
    const d = buildDust(s, { count: 8000, edgeFade: false, reliefBias: 3 });
    const xs = Array.from({ length: d.count }, (_, i) => d.positions[i * 3]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const q = (x: number) => Math.floor(((x - x0) / (x1 - x0 + 1e-9)) * 4);
    const perQuarter = [0, 0, 0, 0];
    xs.forEach((x) => perQuarter[q(x)]++);
    expect(perQuarter[1]).toBeGreaterThan(perQuarter[0] * 1.8);
  });
});

describe("contours of dust", () => {
  // A cone: 500 m at the centre, falling 20 m a cell.
  const n = 50;
  const cone = grid(n, (c, r) => Math.max(1, 500 - 20 * Math.hypot(c - 24.5, r - 24.5)));
  const d = buildContourDust(cone, { intervalM: 50, spacingKm: 0.02, shoreDensity: 0, jitterKm: 0, maxPoints: 200_000, edgeFade: false, smoothPasses: 0 });

  it("strings grains exactly on the contour levels, every fifth an index contour", () => {
    expect(d.count).toBeGreaterThan(1000);
    const levels = new Set<number>();
    for (let i = 0; i < d.count; i++) {
      const m = Math.round(d.positions[i * 3 + 1] * 1000);
      levels.add(m);
      expect(m % 50).toBe(0);
      expect(d.kinds[i]).toBe(m % 250 === 0 ? 2 : 1);
    }
    expect([...levels].sort((a, b) => a - b)).toEqual([50, 100, 150, 200, 250, 300, 350, 400, 450]);
  });

  it("draws each level as a ring round the peak, at the radius the slope puts it", () => {
    // The 300 m ring should sit (500 - 300) / 20 = 10 cells = 1 km from the centre.
    const [cx, cz] = [0, 0].map((_, k) => {
      let s = 0;
      for (let i = 0; i < d.count; i++) s += d.positions[i * 3 + (k ? 2 : 0)];
      return s / d.count;
    });
    const radii: number[] = [];
    for (let i = 0; i < d.count; i++) if (Math.round(d.positions[i * 3 + 1] * 1000) === 300) radii.push(Math.hypot(d.positions[i * 3] - cx, d.positions[i * 3 + 2] - cz));
    const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
    expect(mean).toBeGreaterThan(0.9);
    expect(mean).toBeLessThan(1.1);
  });

  it("fits any budget by spacing the grains further apart, evenly over the whole map", () => {
    const small = buildContourDust(cone, { intervalM: 50, spacingKm: 0.02, shoreDensity: 0, jitterKm: 0, maxPoints: 500, edgeFade: false, smoothPasses: 0 });
    expect(small.count).toBeLessThanOrEqual(500);
    expect(small.count).toBeGreaterThan(450);
    expect(small.spacingKm).toBeGreaterThan(0.02);
    // Every level survives the thinning (a row-by-row budget would have kept only the north).
    const levels = new Set(Array.from({ length: small.count }, (_, i) => Math.round(small.positions[i * 3 + 1] * 1000)));
    expect(levels.size).toBe(9);
  });

  it("draws the shoreline where the water fraction crosses a half", () => {
    const island = grid(30, (c, r) => (Math.hypot(c - 14.5, r - 14.5) < 8 ? 40 : null));
    const s = buildContourDust(island, { intervalM: 50, spacingKm: 0.02, shoreDensity: 1, jitterKm: 0, maxPoints: 50_000, edgeFade: false });
    const shore = Array.from({ length: s.count }, (_, i) => i).filter((i) => s.kinds[i] === 3);
    expect(shore.length).toBeGreaterThan(100);
    for (const i of shore) {
      const [lng, lat] = worldToLngLat(s.positions[i * 3], s.positions[i * 3 + 2]);
      // On the line the water fraction is a half (the grains follow the cells' triangles, the
      // sampler is bilinear, so inside a cell they differ by up to a quarter).
      expect(Math.abs(waterness(island, lng, lat) - 0.5)).toBeLessThanOrEqual(0.26);
    }
  });
});

describe("smoothing and edges", () => {
  it("smooths the land without pulling the shore down or wetting the land", () => {
    const g = grid(12, (c) => (c < 6 ? 100 : null));
    const s = smoothLand(g, 2);
    for (let r = 0; r < 12; r++)
      for (let c = 0; c < 12; c++) {
        const i = r * 12 + c;
        if (g.water[i]) expect(s[i]).toBe(0);
        else expect(s[i]).toBeCloseTo(g.heights[i], 3);
      }
  });

  it("keeps the whole served region and fades beyond it", () => {
    expect(edgeWeight(ORIGIN.lng, ORIGIN.lat)).toBe(1);
    expect(edgeWeight(-74.01, 40.7)).toBe(1); // the Battery
    expect(edgeWeight(-73.93, 41.7)).toBe(1); // Poughkeepsie
    expect(edgeWeight(REGION.west - 0.15, REGION.north + 0.11)).toBe(0); // the grid's far corner
  });

  it("builds a closed depth mesh under the land", () => {
    const g = grid(9, () => 200);
    const m = buildDepthMesh(g, 2);
    expect(m.positions.length / 3).toBe(25);
    expect(m.index.length).toBe(4 * 4 * 6);
    for (let i = 0; i < 25; i++) expect(m.positions[i * 3 + 1]).toBeCloseTo(g.heights[0] / 1000, 6);
  });

  it("has a seeded generator that repeats", () => {
    const a = prng(7), b = prng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
