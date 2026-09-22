/** The night flight's terrain: decoding public/geo/valley-elevation.webp and sampling it.
 *
 * The asset (scripts/build-elevation.mjs) is an equirectangular grid over the served region plus a
 * margin, row 0 = north. Red: 0 = water, else 1 + round(254 * sqrt(e / maxM)). Green: how much of
 * the cell is water, 0..255, so the coast is an anti-aliased edge. Everything here but
 * `loadElevation` is pure, so it is tested on tiny synthetic grids. */
import type { LngLatBox } from "./world";

export interface ElevationMeta {
  v: 1;
  box: LngLatBox;
  served: LngLatBox;
  w: number;
  h: number;
  maxM: number;
  metresPerCell: { x: number; y: number };
}

export interface ElevationGrid {
  box: LngLatBox;
  w: number;
  h: number;
  /** Metres per cell, east-west and north-south. */
  cellM: { x: number; y: number };
  /** Metres above sea level, 0 on water. */
  heights: Float32Array;
  /** 1 on water, 0 on land. */
  water: Uint8Array;
  /** How much of each cell is water, 0..1 (>= 0.5 exactly where `water` is 1). */
  waterFrac: Float32Array;
}

/** Interleaved pixels, `channels` bytes a cell (4 for canvas RGBA): the first byte is the height,
 * the second (when there is one) the water fraction. With one channel the fraction is 0 or 1. */
export function decodeElevation(values: ArrayLike<number>, meta: Pick<ElevationMeta, "box" | "w" | "h" | "maxM" | "metresPerCell">, channels = 1): ElevationGrid {
  const n = meta.w * meta.h;
  const heights = new Float32Array(n);
  const water = new Uint8Array(n);
  const waterFrac = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = values[i * channels];
    if (v === 0) water[i] = 1;
    else {
      const f = (v - 1) / 254;
      heights[i] = meta.maxM * f * f;
    }
    waterFrac[i] = channels > 1 ? values[i * channels + 1] / 255 : water[i];
  }
  return { box: meta.box, w: meta.w, h: meta.h, cellM: meta.metresPerCell, heights, water, waterFrac };
}

/** The encoding, for tests and tools: metres (or null for water) to the stored byte. */
export function encodeElevation(elevM: number | null, maxM: number): number {
  if (elevM === null) return 0;
  return 1 + Math.round(254 * Math.sqrt(Math.min(maxM, Math.max(0, elevM)) / maxM));
}

/** Continuous grid coordinates of a place: cell (c, r)'s centre is at (c, r). */
export function gridCoord(grid: Pick<ElevationGrid, "box" | "w" | "h">, lng: number, lat: number): [number, number] {
  const { box, w, h } = grid;
  return [((lng - box.west) / (box.east - box.west)) * w - 0.5, ((box.north - lat) / (box.north - box.south)) * h - 0.5];
}

function bilinear(field: ArrayLike<number>, w: number, h: number, gx: number, gy: number): number {
  const x = Math.min(w - 1, Math.max(0, gx));
  const y = Math.min(h - 1, Math.max(0, gy));
  const x0 = Math.min(w - 2, Math.floor(x));
  const y0 = Math.min(h - 2, Math.floor(y));
  const fx = x - x0, fy = y - y0;
  const i = y0 * w + x0;
  return (
    field[i] * (1 - fx) * (1 - fy) +
    field[i + 1] * fx * (1 - fy) +
    field[i + w] * (1 - fx) * fy +
    field[i + w + 1] * fx * fy
  );
}

/** Metres above sea level at a place, bilinear between cell centres (water counts as 0 m, so the
 * land runs down to the shore). Outside the grid it clamps to the edge. */
export function sampleHeight(grid: ElevationGrid, lng: number, lat: number): number {
  const [gx, gy] = gridCoord(grid, lng, lat);
  return bilinear(grid.heights, grid.w, grid.h, gx, gy);
}

/** How much of a place is water, 0..1, bilinear in the cells' water fractions: a shoreline that
 * runs between cells instead of along their edges. */
export function waterness(grid: ElevationGrid, lng: number, lat: number): number {
  const [gx, gy] = gridCoord(grid, lng, lat);
  return bilinear(grid.waterFrac, grid.w, grid.h, gx, gy);
}

export function isWater(grid: ElevationGrid, lng: number, lat: number): boolean {
  return waterness(grid, lng, lat) >= 0.5;
}

/** Slope per cell, Horn's 3x3: rise over run in metres per metre, east and NORTH. */
export function gradients(grid: ElevationGrid): { east: Float32Array; north: Float32Array } {
  const { w, h, heights: e } = grid;
  const east = new Float32Array(w * h);
  const north = new Float32Array(w * h);
  const at = (r: number, c: number) => e[Math.max(0, Math.min(h - 1, r)) * w + Math.max(0, Math.min(w - 1, c))];
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++) {
      const a = at(r - 1, c - 1), b = at(r - 1, c), cc = at(r - 1, c + 1);
      const d = at(r, c - 1), f = at(r, c + 1);
      const g = at(r + 1, c - 1), hh = at(r + 1, c), ii = at(r + 1, c + 1);
      east[r * w + c] = (cc + 2 * f + ii - (a + 2 * d + g)) / (8 * grid.cellM.x);
      north[r * w + c] = (a + 2 * b + cc - (g + 2 * hh + ii)) / (8 * grid.cellM.y);
    }
  return { east, north };
}

export function sampleField(grid: Pick<ElevationGrid, "box" | "w" | "h">, field: ArrayLike<number>, lng: number, lat: number): number {
  const [gx, gy] = gridCoord(grid, lng, lat);
  return bilinear(field, grid.w, grid.h, gx, gy);
}

/** Browser only: fetch the asset and its metadata, decode the pixels exactly (no colour
 * management, no premultiplication), and build the grid. */
export async function loadElevation(base = "/geo/valley-elevation", signal?: AbortSignal): Promise<ElevationGrid> {
  const [metaRes, imgRes] = await Promise.all([fetch(`${base}.json`, { signal }), fetch(`${base}.webp`, { signal })]);
  if (!metaRes.ok || !imgRes.ok) throw new Error("elevation asset missing");
  const meta = (await metaRes.json()) as ElevationMeta;
  const bitmap = await createImageBitmap(await imgRes.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const canvas = document.createElement("canvas");
  canvas.width = meta.w;
  canvas.height = meta.h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const rgba = ctx.getImageData(0, 0, meta.w, meta.h).data;
  return decodeElevation(rgba, meta, 4);
}
