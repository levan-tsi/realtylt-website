/** The night flight's LIGHTS: every active listing (app/api/lights, unpacked by lib/idx/lights.ts)
 * as a point on the terrain, and the towns the lantern names. Pure: the scene turns the arrays into
 * a point cloud. */
import type { LightPoints } from "@/lib/idx/lights";
import { sampleHeight, type ElevationGrid } from "./elevation";
import { boxUVToLngLat, lngLatToWorld } from "./world";

/** How high a light sits above the dust, in real metres (it is exaggerated with the land). */
export const LIGHT_LIFT_M = 12;

export interface LightCloud {
  count: number;
  /** World x, z and the real height in km (y) per light; the shader exaggerates y. */
  positions: Float32Array;
  /** Seconds after the lights begin that this one comes on: the harbour first, then up the valley. */
  delays: Float32Array;
  /** Brightness per light, tone-mapped by how many share its few hundred metres, so the city reads
   * as a sea of windows rather than one white flare. */
  gains: Float32Array;
  seeds: Float32Array;
}

/** Deterministic 0..1 per index, so every visit shows the same windows twinkling. */
export function hash01(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Light positions and attributes. `introSpan` is how long the wave takes from the harbour to the
 * north edge; each light also gets up to `jitter` seconds of its own. */
export function buildLights(pts: LightPoints, grid: ElevationGrid | null, introSpan = 1.9, jitter = 0.5, cellKm = 0.3): LightCloud {
  const n = pts.x.length;
  const positions = new Float32Array(n * 3);
  const delays = new Float32Array(n);
  const gains = new Float32Array(n);
  const seeds = new Float32Array(n);
  const cellOf = new Int32Array(n);
  const dense = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const [lng, lat] = boxUVToLngLat(pts.x[i], pts.y[i], pts.box);
    const h = grid ? sampleHeight(grid, lng, lat) : 0;
    const [x, , z] = lngLatToWorld(lng, lat);
    positions[i * 3] = x;
    positions[i * 3 + 1] = (h + LIGHT_LIFT_M) / 1000;
    positions[i * 3 + 2] = z;
    // y is 0 at the north edge and 1 at the south: the harbour (south) lights first.
    delays[i] = (1 - pts.y[i]) * introSpan + hash01(i + 1) * jitter;
    seeds[i] = hash01(i + 7);
    const k = Math.floor(x / cellKm) * 100003 + Math.floor(z / cellKm);
    cellOf[i] = k;
    dense.set(k, (dense.get(k) ?? 0) + 1);
  }
  for (let i = 0; i < n; i++) gains[i] = (0.55 + 0.45 * seeds[i]) / Math.pow(dense.get(cellOf[i]) ?? 1, 0.4);
  return { count: n, positions, delays, gains, seeds };
}

export interface HazeCloud {
  count: number;
  /** World x, z and the real height in km (y) of each patch of glow. */
  positions: Float32Array;
  /** 0..1: how much light is under each patch. */
  strengths: Float32Array;
}

/** THE CITY'S OWN GLOW: where many homes stand close together, a faint haze hangs over them, lit
 * from below by their windows (the only haze in the scene, and it has a source). One patch per
 * `cellKm` square holding at least `min` lights, at the lights' mean position, a little above them. */
export function buildHaze(cloud: LightCloud, cellKm = 1.6, min = 6, liftKm = 0.12): HazeCloud {
  const cells = new Map<number, { n: number; x: number; y: number; z: number }>();
  for (let i = 0; i < cloud.count; i++) {
    const x = cloud.positions[i * 3], y = cloud.positions[i * 3 + 1], z = cloud.positions[i * 3 + 2];
    const k = Math.floor(x / cellKm) * 100003 + Math.floor(z / cellKm);
    const c = cells.get(k);
    if (c) (c.n++, (c.x += x), (c.y += y), (c.z += z));
    else cells.set(k, { n: 1, x, y, z });
  }
  const kept = [...cells.values()].filter((c) => c.n >= min);
  const positions = new Float32Array(kept.length * 3);
  const strengths = new Float32Array(kept.length);
  kept.forEach((c, i) => {
    positions[i * 3] = c.x / c.n;
    positions[i * 3 + 1] = c.y / c.n + liftKm;
    positions[i * 3 + 2] = c.z / c.n;
    strengths[i] = Math.min(1, Math.log1p(c.n - min + 1) / Math.log1p(80));
  });
  return { count: kept.length, positions, strengths };
}

export interface TownMark {
  town: number;
  name: string;
  /** Homes for sale in the town, including the ones too roughly placed to be drawn. */
  count: number;
  /** Where its drawn lights are, on average. */
  lng: number;
  lat: number;
  /** How many of its lights are drawn. */
  lit: number;
}

/** One mark per town that has at least one drawn light: the mean of its lights' positions, and
 * the town's real count. */
export function townCentroids(pts: Pick<LightPoints, "x" | "y" | "town" | "towns" | "counts" | "box">): TownMark[] {
  const sx = new Float64Array(pts.towns.length);
  const sy = new Float64Array(pts.towns.length);
  const n = new Uint32Array(pts.towns.length);
  for (let i = 0; i < pts.x.length; i++) {
    const t = pts.town[i];
    sx[t] += pts.x[i];
    sy[t] += pts.y[i];
    n[t]++;
  }
  const out: TownMark[] = [];
  for (let t = 0; t < pts.towns.length; t++) {
    if (!n[t] || !pts.towns[t]) continue;
    const [lng, lat] = boxUVToLngLat(sx[t] / n[t], sy[t] / n[t], pts.box);
    out.push({ town: t, name: pts.towns[t], count: pts.counts[t] ?? n[t], lng, lat, lit: n[t] });
  }
  return out;
}
