/** The night flight's LIGHTS: every active listing (app/api/lights, unpacked by lib/idx/lights.ts)
 * as a point on the terrain, and the towns the lantern names. Pure: the scene turns the arrays into
 * a point cloud. */
import type { LightPoints } from "@/lib/idx/lights";
import { sampleHeight, type ElevationGrid } from "./elevation";
import { boxUVToLngLat, lngLatToWorld } from "./world";

/** The served areas, in the order the "where we work" chapter flies them; a light's county is
 * its index here plus one (0 = not known). The slugs are the feed's (lib/idx/lights.ts townCounty). */
export const COUNTY_SLUGS = ["ulster", "dutchess", "orange", "putnam", "rockland", "westchester", "bronx", "manhattan", "queens", "brooklyn", "staten-island"] as const;
export type CountySlugName = (typeof COUNTY_SLUGS)[number];

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
  /** 1 + the light's county in COUNTY_SLUGS (by its town's county), 0 when not known. */
  counties: Float32Array;
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
  const counties = new Float32Array(n);
  const countyOfTown = (pts.townCounty ?? []).map((c) => (COUNTY_SLUGS as readonly string[]).indexOf(c) + 1);
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
    counties[i] = countyOfTown[pts.town[i]] ?? 0;
    const k = Math.floor(x / cellKm) * 100003 + Math.floor(z / cellKm);
    cellOf[i] = k;
    dense.set(k, (dense.get(k) ?? 0) + 1);
  }
  for (let i = 0; i < n; i++) gains[i] = (0.55 + 0.45 * seeds[i]) / Math.pow(dense.get(cellOf[i]) ?? 1, 0.4);
  return { count: n, positions, delays, gains, seeds, counties };
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

export interface CountyRaster {
  x0: number;
  z0: number;
  cellKm: number;
  w: number;
  h: number;
  /** 1 + county index (COUNTY_SLUGS), 0 = none within reach. */
  data: Uint8Array;
}

/** Which county each patch of land belongs to, as far as the homes say: every cell takes the
 * county of the nearest cell holding lights (a breadth-first flood from all of them at once, so
 * the border falls about halfway between two counties' homes), up to `reachKm` from any home. No
 * county polygons are shipped; the listings draw the map. Used to light the land of the county
 * the page is talking about. */
export function countyRaster(cloud: LightCloud, cellKm = 1.5, reachKm = 6): CountyRaster {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < cloud.count; i++) {
    const x = cloud.positions[i * 3], z = cloud.positions[i * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const pad = reachKm + cellKm;
  const x0 = minX - pad, z0 = minZ - pad;
  const w = Math.max(1, Math.ceil((maxX - minX + 2 * pad) / cellKm));
  const h = Math.max(1, Math.ceil((maxZ - minZ + 2 * pad) / cellKm));
  const data = new Uint8Array(w * h);
  const dist = new Uint16Array(w * h).fill(65535);
  // Votes per cell: the county with the most homes in it seeds the cell.
  const votes = new Map<number, Map<number, number>>();
  for (let i = 0; i < cloud.count; i++) {
    const c = cloud.counties[i];
    if (!c) continue;
    const cx = Math.floor((cloud.positions[i * 3] - x0) / cellKm), cz = Math.floor((cloud.positions[i * 3 + 2] - z0) / cellKm);
    const k = cz * w + cx;
    const v = votes.get(k) ?? new Map<number, number>();
    v.set(c, (v.get(c) ?? 0) + 1);
    votes.set(k, v);
  }
  let queue: number[] = [];
  for (const [k, v] of votes) {
    let best = 0, n = 0;
    for (const [c, m] of v) if (m > n) (best = c), (n = m);
    data[k] = best;
    dist[k] = 0;
    queue.push(k);
  }
  const maxSteps = Math.ceil(reachKm / cellKm);
  for (let step = 1; step <= maxSteps && queue.length; step++) {
    const next: number[] = [];
    for (const k of queue) {
      const cx = k % w, cz = Math.floor(k / w);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= w || nz >= h) continue;
        const j = nz * w + nx;
        if (dist[j] <= step) continue;
        dist[j] = step;
        data[j] = data[k];
        next.push(j);
      }
    }
    queue = next;
  }
  return { x0, z0, cellKm, w, h, data };
}

export function countyAt(r: CountyRaster, x: number, z: number): number {
  const cx = Math.floor((x - r.x0) / r.cellKm), cz = Math.floor((z - r.z0) / r.cellKm);
  return cx < 0 || cz < 0 || cx >= r.w || cz >= r.h ? 0 : r.data[cz * r.w + cx];
}
