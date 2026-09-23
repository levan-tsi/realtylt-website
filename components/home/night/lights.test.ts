import { describe, expect, it } from "vitest";
import type { LightPoints } from "@/lib/idx/lights";
import { decodeElevation, encodeElevation } from "./elevation";
import { buildHaze, buildLightBundle, buildLights, bundleTransfer, countyAreaGains, countyLightBoxes, COUNTY_SLUGS, countyAt, countyRaster, LIGHT_LIFT_M, paintCounties, townCentroids } from "./lights";
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

describe("the light bundle (what the worker hands the scene in one message)", () => {
  const grid = decodeElevation(new Array(9).fill(encodeElevation(100, 900)), { box: BOX, w: 3, h: 3, maxM: 900, metresPerCell: { x: 100, y: 100 } });
  const pts: LightPoints = {
    ...points(
      [
        ...Array.from({ length: 20 }, (_, i) => ({ x: 0.2 + (i % 4) * 0.001, y: 0.5, town: 0 })),
        ...Array.from({ length: 20 }, (_, i) => ({ x: 0.7 + (i % 4) * 0.001, y: 0.5, town: 1 })),
      ],
      ["West", "East"],
      [20, 20],
    ),
    townCounty: ["orange", "dutchess"],
  };
  // Three grains of dust: on the western town, on the eastern town, and in the empty middle.
  const dustAt = (u: number) => {
    const [lng, lat] = boxUVToLngLat(u, 0.5, BOX);
    const [x, , z] = lngLatToWorld(lng, lat);
    return [x, 0.1, z];
  };
  const dust = { count: 3, positions: Float32Array.from([...dustAt(0.2), ...dustAt(0.7), ...dustAt(0.45)]) };
  const b = buildLightBundle(pts, grid, dust, { pow: 0.3, max: 2.3 });

  it("is the same cloud, haze, raster, frames and lifts the scene used to build one by one", () => {
    const cloud = buildLights(pts, grid);
    expect(b.cloud.count).toBe(cloud.count);
    expect(Array.from(b.cloud.positions)).toEqual(Array.from(cloud.positions));
    expect(Array.from(b.cloud.gains)).toEqual(Array.from(cloud.gains));
    expect(b.haze.count).toBe(buildHaze(cloud).count);
    expect(Array.from(b.raster.data)).toEqual(Array.from(countyRaster(cloud).data));
    const boxes = countyLightBoxes(cloud);
    expect(b.boxes).toEqual(boxes);
    expect(b.areaGains).toEqual(countyAreaGains(cloud, boxes, { pow: 0.3, max: 2.3 }));
  });

  it("paints each grain of dust with the county of the homes around it", () => {
    expect(Array.from(b.dustCounties!)).toEqual([COUNTY_SLUGS.indexOf("orange") + 1, COUNTY_SLUGS.indexOf("dutchess") + 1, 0]);
    // ...exactly as a grain-by-grain read of the raster would, into a buffer the caller owns.
    const out = new Float32Array(3);
    expect(paintCounties(dust.positions, 3, b.raster, out)).toBe(out);
    expect(Array.from(out)).toEqual(Array.from(b.dustCounties!));
    expect(buildLightBundle(pts, grid, null, { pow: 0.3, max: 2.3 }).dustCounties).toBeNull();
  });

  it("carries the towns with their world positions on the terrain, in one order", () => {
    expect(b.towns.map((t) => t.name)).toEqual(townCentroids(pts).map((t) => t.name));
    expect(b.townWorld).toHaveLength(b.towns.length * 3);
    const [x, , z] = lngLatToWorld(b.towns[0].lng, b.towns[0].lat);
    expect(b.townWorld[0]).toBeCloseTo(x, 5);
    expect(b.townWorld[2]).toBeCloseTo(z, 5);
    // The real height in km (the scene exaggerates it when it picks).
    expect(b.townWorld[1]).toBeCloseTo(grid.heights[0] / 1000, 6);
    expect(buildLightBundle(pts, null, null, { pow: 0.3, max: 2.3 }).townWorld[1]).toBe(0);
  });

  it("owns every buffer it carries, so a worker can transfer the lot without a copy", () => {
    const buffers = bundleTransfer(b);
    // The cloud's five, the haze's two, the raster, the towns and the dust: ten distinct buffers.
    expect(buffers).toHaveLength(10);
    expect(new Set(buffers).size).toBe(10);
    for (const buf of buffers) expect(buf).toBeInstanceOf(ArrayBuffer);
    expect(buffers).toContain(b.cloud.positions.buffer);
    expect(buffers).toContain(b.dustCounties!.buffer);
    expect(bundleTransfer(buildLightBundle(pts, grid, null, { pow: 0.3, max: 2.3 }))).toHaveLength(9);
  });
});

describe("where a county's homes actually are (the area chapter's framing)", () => {
  // Ninety-five homes along the east edge of the box, five stragglers far to the west and south:
  // the robust box must follow the ninety-five (a county's bounding box holds mountains where
  // nothing is for sale, and the chapter frames the homes, not the mountains).
  const list = [
    ...Array.from({ length: 95 }, (_, i) => ({ x: 0.8 + (i % 10) * 0.004, y: 0.3 + (i % 9) * 0.01, town: 0 })),
    ...Array.from({ length: 5 }, (_, i) => ({ x: 0.02 + i * 0.001, y: 0.95, town: 1 })),
  ];
  const pts: LightPoints = { ...points(list, ["Kingston", "Far"], [95, 5]), townCounty: ["ulster", "ulster"] };
  const box = countyLightBoxes(buildLights(pts, null), 0.06)["ulster"]!;

  it("cuts the outliers off both ends", () => {
    expect(box.west).toBeGreaterThan(boxUVToLngLat(0.5, 0, BOX)[0]);
    expect(box.east).toBeLessThanOrEqual(BOX.east);
    // The stragglers sit at the very south of the box; the kept homes do not reach it.
    expect(box.south).toBeGreaterThan(boxUVToLngLat(0, 0.9, BOX)[1]);
  });

  it("keeps the whole spread when nothing is trimmed", () => {
    const all = countyLightBoxes(buildLights(pts, null), 0)["ulster"]!;
    expect(all.west).toBeLessThan(box.west);
    expect(all.south).toBeLessThan(box.south);
  });

  it("leaves out a county with too few homes to frame", () => {
    const thin: LightPoints = { ...points([{ x: 0.5, y: 0.5, town: 0 }], ["One"], [1]), townCounty: ["putnam"] };
    expect(countyLightBoxes(buildLights(thin, null))["putnam"]).toBeUndefined();
  });

  it("ignores lights whose county is not known", () => {
    const none: LightPoints = { ...points(list, ["Kingston", "Far"], [90, 10]), townCounty: ["", ""] };
    expect(Object.keys(countyLightBoxes(buildLights(none, null)))).toHaveLength(0);
  });
});

describe("how hard each county's homes have to burn for its own chapter", () => {
  /** A tight borough (many homes in a small box) and a sprawling county (the same number spread
   * over sixteen times the ground). */
  const cloud = {
    count: 400,
    counties: Float32Array.from(Array.from({ length: 400 }, (_, i) => (i < 200 ? 10 : 1))), // brooklyn, ulster
  };
  const boxes = {
    brooklyn: { west: -74.0, east: -73.9, south: 40.6, north: 40.7 },
    ulster: { west: -74.4, east: -74.0, south: 41.7, north: 42.1 },
  } as const;
  const gains = countyAreaGains(cloud, boxes, { pow: 0.25, max: 2.1 });

  it("leaves the densest county exactly as it is", () => {
    expect(gains.brooklyn).toBe(1);
  });

  it("lifts the sparse one, by the fourth root of how much emptier its frame is", () => {
    // Sixteen times the ground, the same homes: 16 ^ 0.25 = 2.
    expect(gains.ulster).toBeCloseTo(2, 6);
    expect(gains.ulster!).toBeGreaterThan(gains.brooklyn!);
  });

  it("never runs away: the lift is capped and never dims a county", () => {
    const empty = {
      count: 300,
      counties: Float32Array.from(Array.from({ length: 300 }, (_, i) => (i < 299 ? 10 : 1))),
    };
    const wide = { brooklyn: boxes.brooklyn, ulster: { west: -76, east: -73, south: 40, north: 43 } } as const;
    const g = countyAreaGains(empty, wide, { pow: 0.25, max: 2.1 });
    expect(g.ulster).toBe(2.1);
    for (const v of Object.values(g)) expect(v).toBeGreaterThanOrEqual(1);
  });

  it("says nothing about a county with no frame of its own", () => {
    expect(countyAreaGains(cloud, { brooklyn: boxes.brooklyn }, { pow: 0.25, max: 2.1 }).ulster).toBeUndefined();
  });
});
