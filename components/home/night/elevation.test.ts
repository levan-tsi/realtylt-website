import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SERVED_REGION } from "@/components/idx/county-bounds";
import { decodeElevation, encodeElevation, gradients, isWater, sampleGlow, sampleHeight, waterness, type ElevationGrid, type ElevationMeta } from "./elevation";

/** A tiny grid: 3 x 3 cells over a 3 x 3 degree box, so cell centres fall on whole degrees + 0.5. */
const BOX = { west: 0, east: 3, south: 0, north: 3 };
const META = { box: BOX, w: 3, h: 3, maxM: 900, metresPerCell: { x: 100, y: 100 } };
const at = (c: number, r: number): [number, number] => [BOX.west + c + 0.5, BOX.north - r - 0.5];

describe("elevation encoding", () => {
  it("round-trips heights within the square-root step, water as zero", () => {
    expect(encodeElevation(null, 900)).toBe(0);
    for (const e of [0.6, 5, 40, 200, 650, 900]) {
      const v = encodeElevation(e, 900);
      const grid = decodeElevation([v], { ...META, w: 1, h: 1 });
      // The step at height e is about 2 * sqrt(e * maxM) / 254 metres.
      expect(Math.abs(grid.heights[0] - e)).toBeLessThanOrEqual(Math.sqrt(e * 900) / 254 + 0.5);
      expect(grid.water[0]).toBe(0);
    }
    const w = decodeElevation([0], { ...META, w: 1, h: 1 });
    expect(w.water[0]).toBe(1);
    expect(w.heights[0]).toBe(0);
  });

  it("spends its precision low: ~1 m steps near sea level, ~7 m near the top", () => {
    const step = (e: number) => {
      const v = encodeElevation(e, 1250);
      const lo = decodeElevation([v], { ...META, w: 1, h: 1, maxM: 1250 }).heights[0];
      const hi = decodeElevation([v + 1], { ...META, w: 1, h: 1, maxM: 1250 }).heights[0];
      return hi - lo;
    };
    expect(step(10)).toBeLessThan(1.2);
    expect(step(1200)).toBeLessThan(10.5);
  });

  it("reads the water fraction from the second channel when there is one", () => {
    // RGBA pixels: height byte, water fraction byte, 0, 255.
    const px = [encodeElevation(50, 900), 64, 0, 255, 0, 200, 0, 255];
    const g = decodeElevation(px, { ...META, w: 2, h: 1 }, 4);
    expect(g.water[0]).toBe(0);
    expect(g.waterFrac[0]).toBeCloseTo(64 / 255, 6);
    expect(g.water[1]).toBe(1);
    expect(g.waterFrac[1]).toBeCloseTo(200 / 255, 6);
  });

  it("reads the night glow from the third channel when there is one, 0 otherwise", () => {
    const px = [encodeElevation(50, 900), 64, 255, 255, 0, 200, 51, 255];
    const g = decodeElevation(px, { ...META, w: 2, h: 1 }, 4);
    expect(g.glow[0]).toBe(1);
    expect(g.glow[1]).toBeCloseTo(51 / 255, 6);
    const one = decodeElevation([encodeElevation(50, 900)], { ...META, w: 1, h: 1 });
    expect(one.glow[0]).toBe(0);
    const two = decodeElevation([encodeElevation(50, 900), 64], { ...META, w: 1, h: 1 }, 2);
    expect(two.glow[0]).toBe(0);
  });
});

describe("elevation sampling (synthetic 3 x 3 grid)", () => {
  // Heights in metres, row 0 north; the centre-right cell is water.
  const heights = [
    [100, 200, 300],
    [100, 200, null],
    [100, 200, 300],
  ];
  const grid: ElevationGrid = decodeElevation(
    heights.flat().map((e) => encodeElevation(e, 900)),
    META,
  );
  const exact = (c: number, r: number) => grid.heights[r * 3 + c];

  it("is exact at cell centres", () => {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const [lng, lat] = at(c, r);
        expect(sampleHeight(grid, lng, lat)).toBeCloseTo(exact(c, r), 6);
      }
  });

  it("is bilinear between them", () => {
    // Halfway between the first two columns of the top row.
    const [lng0, lat0] = at(0, 0);
    expect(sampleHeight(grid, lng0 + 0.5, lat0)).toBeCloseTo((exact(0, 0) + exact(1, 0)) / 2, 6);
    // The middle of four cells is their mean.
    expect(sampleHeight(grid, lng0 + 0.5, lat0 - 0.5)).toBeCloseTo((exact(0, 0) + exact(1, 0) + exact(0, 1) + exact(1, 1)) / 4, 6);
    // Water counts as 0 m, so the land runs down to the shore.
    const [lngW, latW] = at(2, 1);
    expect(sampleHeight(grid, lngW, latW)).toBe(0);
  });

  it("clamps outside the grid to its edge", () => {
    expect(sampleHeight(grid, -5, 1.5)).toBeCloseTo(exact(0, 1), 6);
  });

  it("samples the glow bilinearly, like the height", () => {
    // RGB cells: the top row glows 255, 0, 255; everything else dark.
    const rgb = heights.flat().flatMap((e, i) => [encodeElevation(e, 900), 0, i === 0 || i === 2 ? 255 : 0]);
    const g = decodeElevation(rgb, META, 3);
    const [lng0, lat0] = at(0, 0);
    expect(sampleGlow(g, lng0, lat0)).toBe(1);
    expect(sampleGlow(g, lng0 + 0.5, lat0)).toBeCloseTo(0.5, 6);
    expect(sampleGlow(g, lng0 + 1, lat0)).toBe(0);
    expect(sampleGlow(g, lng0, lat0 - 0.5)).toBeCloseTo(0.5, 6);
    expect(sampleGlow(g, lng0, lat0 - 2)).toBe(0);
  });

  it("finds the water, with the shore halfway between a wet and a dry cell", () => {
    const [lngW, latW] = at(2, 1);
    expect(isWater(grid, lngW, latW)).toBe(true);
    expect(waterness(grid, lngW, latW)).toBe(1);
    const [lngL, latL] = at(1, 1);
    expect(isWater(grid, lngL, latL)).toBe(false);
    expect(waterness(grid, (lngW + lngL) / 2, latW)).toBeCloseTo(0.5, 6);
    expect(isWater(grid, lngL + 0.4, latL)).toBe(false);
    expect(isWater(grid, lngL + 0.6, latL)).toBe(true);
  });

  it("measures slope east and north (Horn), rise over run", () => {
    // A plane rising 100 m a cell eastward, flat north-south, cells 100 m wide: slope 1 east, 0 north.
    const plane = decodeElevation(
      [100, 200, 300, 100, 200, 300, 100, 200, 300].map((e) => encodeElevation(e, 900)),
      META,
    );
    const { east, north } = gradients(plane);
    expect(east[4]).toBeCloseTo((plane.heights[5] - plane.heights[3]) / 200, 6);
    expect(Math.abs(north[4])).toBeLessThan(1e-9);
  });
});

describe("the committed terrain asset", () => {
  const dir = path.resolve(import.meta.dirname, "..", "..", "..", "public", "geo");
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "valley-elevation.json"), "utf8")) as ElevationMeta & { box: typeof BOX };
  let grid: ElevationGrid;
  const load = async () => {
    grid ??= decodeElevation(await sharp(path.join(dir, "valley-elevation.webp")).removeAlpha().raw().toBuffer(), meta, 3);
    return grid;
  };

  it("covers the lights' box (SERVED_REGION) with a margin, and stays small", () => {
    expect(meta.served).toEqual(SERVED_REGION);
    expect(meta.box.west).toBeLessThan(SERVED_REGION.west);
    expect(meta.box.east).toBeGreaterThan(SERVED_REGION.east);
    expect(meta.box.south).toBeLessThan(SERVED_REGION.south);
    expect(meta.box.north).toBeGreaterThan(SERVED_REGION.north);
    // 281 KB with R and G (round 54); the night lights in B took it to the size below (round 55).
    expect(fs.statSync(path.join(dir, "valley-elevation.webp")).size).toBeLessThan(400 * 1024);
  });

  it("has the night lights where the cities are: the metro brightest, the valley towns as towns, the Catskills dark", async () => {
    const g = await load();
    const glowAt = (lng: number, lat: number) => sampleGlow(g, lng, lat);
    const midtown = glowAt(-73.985, 40.755), flushing = glowAt(-73.83, 40.76), yonkers = glowAt(-73.87, 40.93);
    const newburgh = glowAt(-74.02, 41.5), poughkeepsie = glowAt(-73.92, 41.7), kingston = glowAt(-73.99, 41.93);
    const slide = glowAt(-74.39, 42.0), harriman = glowAt(-74.1, 41.25), ashokan = glowAt(-74.2, 41.95);
    expect(midtown).toBeGreaterThan(0.95);
    expect(flushing).toBeGreaterThan(0.9);
    expect(yonkers).toBeGreaterThan(0.75);
    // The valley towns: the brief's 60..130 of 255, and each one below the metro.
    for (const [name, v] of [["Newburgh", newburgh], ["Poughkeepsie", poughkeepsie], ["Kingston", kingston]] as const) {
      expect(v, name).toBeGreaterThan(60 / 255);
      expect(v, name).toBeLessThan(135 / 255);
    }
    expect(kingston).toBeLessThan(newburgh);
    for (const [name, v] of [["Slide Mountain", slide], ["Harriman", harriman], ["the Ashokan", ashokan]] as const) expect(v, name).toBeLessThan(0.02);
  });

  it("has the Hudson as water all the way up, and the harbour", async () => {
    const g = await load();
    for (const [name, lng, lat] of [
      ["the Narrows", -74.04, 40.607],
      ["the Hudson off Midtown", -74.005, 40.76],
      ["the Tappan Zee", -73.9, 41.07],
      ["Haverstraw Bay", -73.93, 41.18],
      ["the Hudson at West Point", -73.947, 41.395],
      ["Newburgh Bay", -73.995, 41.5],
      ["the Hudson at Poughkeepsie", -73.945, 41.705],
      ["the Hudson at Kingston", -73.955, 41.93],
    ] as const)
      expect(isWater(g, lng, lat), name).toBe(true);
  });

  it("has the land where the land is, with its heights", async () => {
    const g = await load();
    // Storm King (~400 m), Bear Mountain (~390 m) and the Shawangunk ridge at Sam's Point (~690 m);
    // a 200 m cell averages the summit down, so these are floors, not the survey heights.
    expect(sampleHeight(g, -74.003, 41.426)).toBeGreaterThan(250);
    expect(sampleHeight(g, -74.007, 41.312)).toBeGreaterThan(250);
    expect(sampleHeight(g, -74.357, 41.67)).toBeGreaterThan(500);
    // Central Park is land, low.
    expect(isWater(g, -73.965, 40.782)).toBe(false);
    expect(sampleHeight(g, -73.965, 40.782)).toBeLessThan(60);
  });
});
