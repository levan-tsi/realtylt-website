/// <reference lib="webworker" />
/** Builds the night flight's heavy data off the main thread: the terrain clouds (./dust.ts
 * buildTerrainClouds, ~1 s on a desktop and ~4 s on a 4x-throttled phone, measured in round 54)
 * and then everything the lights need (./lights.ts buildLightBundle: the cloud, the haze, the
 * county raster, the dust painted with its counties, the towns), which on the main thread was 50
 * to 70 ms in the very frame that received the terrain (round 55, measured in the owner's
 * Chrome).
 *
 * Two requests, answered in the order they arrive:
 *  - { kind: "terrain", rgba, meta, params } -> the clouds' arrays (transferred), or { error }.
 *  - { kind: "lights", pts, areaGain } -> the light bundle (transferred), or { error }.
 * The worker KEEPS the grid and the dust it built (the terrain reply carries copies), so the
 * lights can stand on the terrain and the dust can learn its counties without either crossing
 * back. A lights request before any terrain (the elevation asset failed) is answered on a flat
 * sea level, which is what the page draws in that case anyway. */
import type { LightPoints } from "@/lib/idx/lights";
import { buildTerrainClouds, type DustCloud, type TerrainParams } from "./dust";
import { decodeElevation, type ElevationGrid, type ElevationMeta } from "./elevation";
import { buildLightBundle, bundleTransfer, type LightBundle } from "./lights";

export type BuildRequest =
  | { kind: "terrain"; rgba: Uint8ClampedArray; meta: ElevationMeta; params: TerrainParams }
  | { kind: "lights"; pts: LightPoints; areaGain: { pow: number; max: number } };

export interface TerrainReply {
  kind: "terrain";
  count: number;
  positions: Float32Array;
  slopes: Float32Array;
  ridges: Float32Array;
  seeds: Float32Array;
  kinds: Float32Array;
  meshPositions: Float32Array;
  meshIndex: Uint32Array;
  ms: number;
}
export interface LightsReply {
  kind: "lights";
  bundle: LightBundle;
  ms: number;
}
export type BuildReply = TerrainReply | LightsReply | { kind: "terrain" | "lights"; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;
let grid: ElevationGrid | null = null;
let dust: DustCloud | null = null;

ctx.onmessage = (e: MessageEvent<BuildRequest>) => {
  const req = e.data;
  try {
    const t0 = performance.now();
    if (req.kind === "terrain") {
      grid = decodeElevation(req.rgba, req.meta, 4);
      const built = buildTerrainClouds(grid, req.params);
      dust = built.dust;
      // Copies of the exact lengths (a subarray would send its whole backing buffer), which is
      // also what leaves the worker its own dust to paint when the lights arrive.
      const out: TerrainReply = {
        kind: "terrain",
        count: dust.count,
        positions: dust.positions.slice(),
        slopes: dust.slopes.slice(),
        ridges: dust.ridges.slice(),
        seeds: dust.seeds.slice(),
        kinds: dust.kinds.slice(),
        meshPositions: built.mesh.positions,
        meshIndex: built.mesh.index,
        ms: performance.now() - t0,
      };
      ctx.postMessage(out, [out.positions.buffer, out.slopes.buffer, out.ridges.buffer, out.seeds.buffer, out.kinds.buffer, out.meshPositions.buffer, out.meshIndex.buffer]);
    } else {
      const bundle = buildLightBundle(req.pts, grid, dust, req.areaGain);
      const out: LightsReply = { kind: "lights", bundle, ms: performance.now() - t0 };
      ctx.postMessage(out, bundleTransfer(bundle));
    }
  } catch (err) {
    ctx.postMessage({ kind: req.kind, error: String(err) });
  }
};
