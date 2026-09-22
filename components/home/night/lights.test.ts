import { describe, expect, it } from "vitest";
import type { LightPoints } from "@/lib/idx/lights";
import { decodeElevation, encodeElevation } from "./elevation";
import { buildHaze, buildLights, COUNTY_SLUGS, countyAt, countyRaster, LIGHT_LIFT_M, townCentroids } from "./lights";
import { boxUVToLngLat, lngLatToWorld } from "./world";

const BOX = { west: -74, east: -73, south: 41, north: 42 };

function points(list: { x: number; y: number; town: number }[], towns: string[], counts: number[]): LightPoints {
  return {
    box: BOX,
    x: Float32Array.from(list.map((p) => p.x)),
    y: Float32Array.from(list.map((p) => p.y)),
    town: Uint16Array.from(list.map((p) => p.town)),
    towns,
    counts,
    townCounty: towns.map(() => ""),
    countyCounts: {},
  };
}

describe("town centroids (the lantern's marks)", () => {
  const pts = points(
    [
      { x: 0.2, y: 0.2, town: 0 },
      { x: 0.4, y: 0.4, town: 0 },
      { x: 0.8, y: 0.9, town: 2 },
    ],
    ["Beacon", "Nowhere", "Harrison"],
    [80, 3, 19],
  );
  const marks = townCentroids(pts);

  it("puts each town's mark at the mean of its drawn lights", () => {
    const beacon = marks.find((m) => m.name === "Beacon")!;
    const [lng, lat] = boxUVToLngLat(0.3, 0.3, BOX);
    expect(beacon.lng).toBeCloseTo(lng, 5);
    expect(beacon.lat).toBeCloseTo(lat, 5);
    expect(beacon.lit).toBe(2);
  });

  it("names the town's real count, not the number of its drawn lights", () => {
    expect(marks.find((m) => m.name === "Beacon")!.count).toBe(80);
    expect(marks.find((m) => m.name === "Harrison")!.count).toBe(19);
  });

  it("leaves out towns with no light to point at", () => {
    expect(marks.map((m) => m.name).sort()).toEqual(["Beacon", "Harrison"]);
  });
});

describe("the light cloud", () => {
  // A flat 3 x 3 grid at 100 m everywhere, so every light sits at 100 m + the lift.
  const grid = decodeElevation(new Array(9).fill(encodeElevation(100, 900)), { box: BOX, w: 3, h: 3, maxM: 900, metresPerCell: { x: 100, y: 100 } });
  const flat = grid.heights[0];

  it("places each light at its address, on the terrain, a little above the dust (real km in y)", () => {
    const pts = points([{ x: 0.5, y: 0.5, town: 0 }], ["Town"], [1]);
    const c = buildLights(pts, grid);
    const [lng, lat] = boxUVToLngLat(0.5, 0.5, BOX);
    const [x, , z] = lngLatToWorld(lng, lat);
    expect(c.positions[0]).toBeCloseTo(x, 5);
    expect(c.positions[2]).toBeCloseTo(z, 5);
    expect(c.positions[1]).toBeCloseTo((flat + LIGHT_LIFT_M) / 1000, 6);
  });

  it("lights the harbour first and the north last", () => {
    const pts = points(
      [
        { x: 0.5, y: 0.98, town: 0 }, // south
        { x: 0.5, y: 0.02, town: 0 }, // north
      ],
      ["T"],
      [2],
    );
    const c = buildLights(pts, grid, 1.9, 0);
    expect(c.delays[0]).toBeLessThan(c.delays[1]);
    expect(c.delays[1] - c.delays[0]).toBeCloseTo(1.9 * 0.96, 4);
  });

  it("dims each light where many share a few hundred metres, so the city does not burn white", () => {
    const crowd = Array.from({ length: 40 }, () => ({ x: 0.5, y: 0.5, town: 0 }));
    const pts = points([...crowd, { x: 0.1, y: 0.1, town: 0 }], ["T"], [41]);
    const c = buildLights(pts, grid);
    const lone = c.gains[40];
    const inCrowd = Math.max(...Array.from(c.gains.subarray(0, 40)));
    expect(inCrowd).toBeLessThan(lone * 0.5);
    // ...but the crowd's total still outshines the lone light: the city stays the brightest place.
    const crowdTotal = Array.from(c.gains.subarray(0, 40)).reduce((a, b) => a + b, 0);
    expect(crowdTotal).toBeGreaterThan(lone * 5);
  });

  it("hangs a haze only over dense places, stronger where more lights are", () => {
    const dense = Array.from({ length: 60 }, (_, i) => ({ x: 0.45 + (i % 5) * 0.0005, y: 0.5, town: 0 }));
    const sparse = Array.from({ length: 3 }, () => ({ x: 0.1, y: 0.1, town: 0 }));
    const medium = Array.from({ length: 10 }, () => ({ x: 0.9, y: 0.9, town: 0 }));
    const c = buildLights(points([...dense, ...sparse, ...medium], ["T"], [73]), grid);
    const haze = buildHaze(c);
    expect(haze.count).toBe(2);
    const s = Array.from(haze.strengths).sort((a, b) => a - b);
    expect(s[1]).toBeGreaterThan(s[0]);
    expect(s[1]).toBeLessThanOrEqual(1);
  });
});

describe("the county raster (which land belongs to the county the page is on)", () => {
  const grid = decodeElevation(new Array(9).fill(encodeElevation(100, 900)), { box: BOX, w: 3, h: 3, maxM: 900, metresPerCell: { x: 100, y: 100 } });
  // Two towns 40 km apart, one in Dutchess, one in Orange.
  const pts: LightPoints = {
    ...points(
      [
        ...Array.from({ length: 5 }, () => ({ x: 0.2, y: 0.5, town: 0 })),
        ...Array.from({ length: 5 }, () => ({ x: 0.7, y: 0.5, town: 1 })),
      ],
      ["West", "East"],
      [5, 5],
    ),
    townCounty: ["orange", "dutchess"],
  };
  const cloud = buildLights(pts, grid);
  const r = countyRaster(cloud, 1.5, 6);
  const at = (u: number) => {
    const [lng, lat] = boxUVToLngLat(u, 0.5, BOX);
    const [x, , z] = lngLatToWorld(lng, lat);
    return countyAt(r, x, z);
  };

  it("tags each light with its town's county", () => {
    expect(cloud.counties[0]).toBe(COUNTY_SLUGS.indexOf("orange") + 1);
    expect(cloud.counties[9]).toBe(COUNTY_SLUGS.indexOf("dutchess") + 1);
  });

  it("gives the land around each town to its county, out to the reach, and nothing beyond", () => {
    expect(at(0.2)).toBe(COUNTY_SLUGS.indexOf("orange") + 1);
    expect(at(0.7)).toBe(COUNTY_SLUGS.indexOf("dutchess") + 1);
    // ~4 km from each town: still its own.
    expect(at(0.25)).toBe(COUNTY_SLUGS.indexOf("orange") + 1);
    expect(at(0.65)).toBe(COUNTY_SLUGS.indexOf("dutchess") + 1);
    // Halfway (~21 km from both): past the 6 km reach, no county.
    expect(at(0.45)).toBe(0);
  });
});
