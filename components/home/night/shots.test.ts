import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { decodeElevation, sampleHeight, type ElevationGrid, type ElevationMeta } from "./elevation";
import {
  AREA_FLIGHT,
  ARC_PER_KM,
  blendFramings,
  CLEARANCE_KM,
  FLIGHT,
  framingFor,
  MOON,
  sequenceFraming,
  SHOTS,
  smootherstep,
  type Framing,
} from "./shots";
import { heightToWorld, worldToLngLat } from "./world";

const A: Framing = { pos: [0, 10, 50], target: [0, 0, 0], fov: 40, moon: [250, 24] };
const B: Framing = { pos: [30, 6, -40], target: [20, 0, -80], fov: 56, moon: [200, 30] };
const ts = Array.from({ length: 101 }, (_, i) => i / 100);

describe("smootherstep", () => {
  it("runs 0 to 1 with flat ends", () => {
    expect(smootherstep(0)).toBe(0);
    expect(smootherstep(1)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 12);
    expect(smootherstep(0.001)).toBeLessThan(1e-7);
    expect(smootherstep(-3)).toBe(0);
    expect(smootherstep(4)).toBe(1);
  });
});

describe("the flight between two shots", () => {
  it("starts and lands exactly on the shots", () => {
    expect(blendFramings(A, B, 0)).toEqual(A);
    expect(blendFramings(A, B, 1)).toEqual(B);
  });

  it("moves forward over the ground, and widens the lens, monotonically", () => {
    const dir = [B.pos[0] - A.pos[0], B.pos[2] - A.pos[2]];
    let lastProgress = -Infinity, lastFov = -Infinity;
    for (const t of ts) {
      const f = blendFramings(A, B, t);
      const progress = (f.pos[0] - A.pos[0]) * dir[0] + (f.pos[2] - A.pos[2]) * dir[1];
      expect(progress).toBeGreaterThanOrEqual(lastProgress);
      expect(f.fov).toBeGreaterThanOrEqual(lastFov - 1e-12);
      lastProgress = progress;
      lastFov = f.fov;
    }
  });

  it("arcs: climbs above the straight line by ARC_PER_KM of the travel, at the middle", () => {
    const travel = Math.hypot(B.pos[0] - A.pos[0], B.pos[2] - A.pos[2]);
    const mid = blendFramings(A, B, 0.5);
    expect(mid.pos[1] - (A.pos[1] + B.pos[1]) / 2).toBeCloseTo(ARC_PER_KM * travel, 9);
    for (const t of ts) {
      const straight = A.pos[1] + (B.pos[1] - A.pos[1]) * smootherstep(t);
      expect(blendFramings(A, B, t).pos[1]).toBeGreaterThanOrEqual(straight - 1e-9);
    }
  });

  it("turns the moon the short way round", () => {
    const m = blendFramings({ ...A, moon: [350, 20] }, { ...B, moon: [10, 20] }, 0.5).moon;
    expect(m[0]).toBeCloseTo(0, 9);
  });

  it("never goes below a ridge standing between the shots", () => {
    // A 25 km-high wall across the path, far above the arc's own height.
    const wall = (_x: number, z: number) => (Math.abs(z) < 8 ? 25 : 0);
    for (const t of ts.slice(1, -1)) {
      const f = blendFramings(A, B, t, wall);
      expect(f.pos[1]).toBeGreaterThanOrEqual(wall(f.pos[0], f.pos[2]) + CLEARANCE_KM - 1e-9);
    }
  });

  it("walks a sequence one flight per step", () => {
    const frames = [A, B, { ...A, pos: [-10, 20, 0] as [number, number, number] }];
    expect(sequenceFraming(frames, 0)).toEqual(frames[0]);
    expect(sequenceFraming(frames, 1)).toEqual(frames[1]);
    expect(sequenceFraming(frames, 2)).toEqual(frames[2]);
    expect(sequenceFraming(frames, 1.5)).toEqual(blendFramings(frames[1], frames[2], 0.5));
    expect(sequenceFraming(frames, -1)).toEqual(frames[0]);
    expect(sequenceFraming(frames, 9)).toEqual(frames[2]);
  });
});

describe("the shots", () => {
  it("has every chapter and every area, each with a wide and a tall framing", () => {
    for (const n of [...FLIGHT, ...AREA_FLIGHT]) {
      expect(SHOTS[n].wide.fov).toBeGreaterThan(20);
      expect(SHOTS[n].tall.fov).toBeGreaterThanOrEqual(SHOTS[n].wide.fov);
      expect(SHOTS[n].wide.moon).toBeDefined();
    }
    expect(AREA_FLIGHT).toHaveLength(11);
    expect(SHOTS.hero.wide.moon).toEqual(MOON);
  });

  it("uses the wide framing on a landscape window and the tall one on a portrait phone", () => {
    expect(framingFor(SHOTS.hero, 1440 / 900)).toEqual(SHOTS.hero.wide);
    expect(framingFor(SHOTS.hero, 390 / 844)).toEqual(SHOTS.hero.tall);
    const between = framingFor(SHOTS.hero, 0.8);
    expect(between.fov).toBeGreaterThan(SHOTS.hero.wide.fov);
    expect(between.fov).toBeLessThan(SHOTS.hero.tall.fov);
  });

  it("looks down at its subject (targets below the camera)", () => {
    for (const n of [...FLIGHT, ...AREA_FLIGHT]) for (const k of ["wide", "tall"] as const) expect(SHOTS[n][k].pos[1]).toBeGreaterThan(SHOTS[n][k].target[1]);
  });
});

describe("the home page's flight over the real terrain", () => {
  const dir = path.resolve(import.meta.dirname, "..", "..", "..", "public", "geo");
  let grid: ElevationGrid;
  const ground = (px: number, pz: number) => {
    const [lng, lat] = worldToLngLat(px, pz);
    return heightToWorld(sampleHeight(grid, lng, lat));
  };
  const load = async () => {
    const meta = JSON.parse(fs.readFileSync(path.join(dir, "valley-elevation.json"), "utf8")) as ElevationMeta;
    grid ??= decodeElevation(await sharp(path.join(dir, "valley-elevation.webp")).removeAlpha().raw().toBuffer(), meta, 3);
  };

  it("keeps every shot's camera above the land", async () => {
    await load();
    for (const n of [...FLIGHT, ...AREA_FLIGHT])
      for (const k of ["wide", "tall"] as const) {
        const f = SHOTS[n][k];
        expect(f.pos[1] - ground(f.pos[0], f.pos[2]), `${n} ${k}`).toBeGreaterThan(CLEARANCE_KM);
      }
  });

  it("never flies below the terrain between shots, at any aspect", async () => {
    await load();
    for (const seq of [FLIGHT, AREA_FLIGHT])
      for (const aspect of [1440 / 900, 390 / 844]) {
        const frames = seq.map((n) => framingFor(SHOTS[n], aspect));
        let least = Infinity;
        for (let s = 0; s <= seq.length - 1; s += 0.01) {
          const f = sequenceFraming(frames, s, ground);
          least = Math.min(least, f.pos[1] - ground(f.pos[0], f.pos[2]));
        }
        expect(least).toBeGreaterThanOrEqual(CLEARANCE_KM - 1e-9);
      }
  });

  it("clears the terrain between shots even without the clamp (the arc alone)", async () => {
    await load();
    const frames = FLIGHT.map((n) => framingFor(SHOTS[n], 1440 / 900));
    for (let s = 0; s <= FLIGHT.length - 1; s += 0.01) {
      const f = sequenceFraming(frames, s);
      expect(f.pos[1] - ground(f.pos[0], f.pos[2]), `s=${s.toFixed(2)}`).toBeGreaterThan(0);
    }
  });
});
