/// <reference lib="webworker" />
/** Builds the night flight's terrain clouds off the main thread (./dust.ts buildTerrainClouds):
 * ~1 s of work on a desktop and ~4 s on a 4x-throttled phone (measured, round 54), which on the
 * main thread froze the page, search box included, while the scene got ready.
 *
 * In: the elevation asset's RGBA pixels (transferred), its metadata, and the build parameters.
 * Out: the clouds' arrays (transferred back), or { error }. */
import { buildTerrainClouds, type TerrainParams } from "./dust";
import { decodeElevation, type ElevationMeta } from "./elevation";

export interface BuildRequest {
  rgba: Uint8ClampedArray;
  meta: ElevationMeta;
  params: TerrainParams;
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;
ctx.onmessage = (e: MessageEvent<BuildRequest>) => {
  try {
    const t0 = performance.now();
    const grid = decodeElevation(e.data.rgba, e.data.meta, 4);
    const { dust, mesh } = buildTerrainClouds(grid, e.data.params);
    const ms = performance.now() - t0;
    // Copies of the exact lengths (a subarray would send its whole backing buffer).
    const out = {
      count: dust.count,
      positions: dust.positions.slice(),
      slopes: dust.slopes.slice(),
      ridges: dust.ridges.slice(),
      seeds: dust.seeds.slice(),
      kinds: dust.kinds.slice(),
      meshPositions: mesh.positions,
      meshIndex: mesh.index,
      ms,
    };
    ctx.postMessage(out, [out.positions.buffer, out.slopes.buffer, out.ridges.buffer, out.seeds.buffer, out.kinds.buffer, out.meshPositions.buffer, out.meshIndex.buffer]);
  } catch (err) {
    ctx.postMessage({ error: String(err) });
  }
};
