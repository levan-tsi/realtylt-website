/** The night flight's LIGHTS: every active listing (app/api/lights, unpacked by lib/idx/lights.ts)
 * as a point on the terrain, and the towns the lantern names. Pure: the scene turns the arrays into
 * a point cloud. */
import type { LightPoints } from "@/lib/idx/lights";
import { sampleHeight, type ElevationGrid } from "./elevation";
import { boxUVToLngLat, lngLatToWorld, worldToLngLat, type LngLatBox } from "./world";

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
export function buildLights(pts: LightPoints, grid: ElevationGrid | null, introSpan = 1.6, jitter = 0.45, cellKm = 0.3): LightCloud {
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

/** WHERE A COUNTY'S HOMES ACTUALLY ARE: the middle `1 - 2 * tail` of its lights in longitude and
 * in latitude. The area chapter frames a county on this, not on its bounding box, because the box
 * is the extent of the listings' ZIP centroids and a county like Ulster spends most of its box on
 * the Catskills, where nothing is for sale: framed on the box, the county arrives as a field of
 * contour lines with a few lamps at one edge; framed on its homes, it arrives as its own shape of
 * light. Counties with fewer than `min` drawn lights are left out (the caller keeps the box). */
export function countyLightBoxes(cloud: LightCloud, tail = 0.04, min = 12): Partial<Record<CountySlugName, LngLatBox>> {
  const lngs = new Map<number, number[]>();
  const lats = new Map<number, number[]>();
  for (let i = 0; i < cloud.count; i++) {
    const c = cloud.counties[i];
    if (!c) continue;
    const [lng, lat] = worldToLngLat(cloud.positions[i * 3], cloud.positions[i * 3 + 2]);
    (lngs.get(c) ?? lngs.set(c, []).get(c)!).push(lng);
    (lats.get(c) ?? lats.set(c, []).get(c)!).push(lat);
  }
  const at = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))))];
  const out: Partial<Record<CountySlugName, LngLatBox>> = {};
  for (const [c, xs] of lngs) {
    const ys = lats.get(c)!;
    if (xs.length < min) continue;
    xs.sort((a, b) => a - b);
    ys.sort((a, b) => a - b);
    out[COUNTY_SLUGS[c - 1]] = { west: at(xs, tail), east: at(xs, 1 - tail), south: at(ys, tail), north: at(ys, 1 - tail) };
  }
  return out;
}

/** HOW HARD A COUNTY'S HOMES HAVE TO BURN for its own chapter to read.
 *
 * The "where we work" chapter gives every area the same frame: the camera stands back until the
 * county fills it. That means a chapter over Ulster holds a tenth of the lamps a chapter over
 * Brooklyn does, each one further away and so smaller, over a frame of exactly the same contours —
 * and it arrived as a contour drawing with a few sparks in it (round 54, builder 3, measured).
 *
 * The lift is the ratio of the DENSEST county's homes per square kilometre to this one's, raised to
 * `pow` and capped at `max`, so the densest borough is untouched (gain 1) and the emptiest county
 * is lifted the most. No light is invented — one light is still one home. Only how hard it burns
 * changes. */
export function countyAreaGains(
  cloud: Pick<LightCloud, "count" | "counties">,
  boxes: Partial<Record<CountySlugName, LngLatBox>>,
  opts: { pow: number; max: number },
): Partial<Record<CountySlugName, number>> {
  const counts = new Map<number, number>();
  for (let i = 0; i < cloud.count; i++) {
    const c = cloud.counties[i];
    if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const density: [CountySlugName, number][] = [];
  for (const [c, n] of counts) {
    const slug = COUNTY_SLUGS[c - 1];
    const b = slug ? boxes[slug] : undefined;
    if (!b) continue;
    const km2 = Math.max(1, (b.east - b.west) * 83.594 * ((b.north - b.south) * 111.132));
    density.push([slug, n / km2]);
  }
  const ref = Math.max(...density.map(([, d]) => d), 1e-9);
  const out: Partial<Record<CountySlugName, number>> = {};
  for (const [slug, d] of density) out[slug] = Math.min(opts.max, Math.max(1, (ref / Math.max(d, 1e-9)) ** opts.pow));
  return out;
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

/** Where the lantern's click goes: the town's EXACT city, the homes the label just counted.
 * (Round 53's hero opened `/search?q=Harrison`, free text, which answered with forty homes on
 * every Harrison Street; guarded by app/api/idx/suggest/suggest-count-scope.test.ts.) Both the
 * page's hero and the lab's canvas call this, so there is one answer to copy wrong. */
export function townSearchHref(town: string): string {
  return `/search?city=${encodeURIComponent(town)}`;
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

/** 1 + the county of each grain of dust, read off the raster, so the "where we work" chapter can
 * light a county's land along with its homes. A plain loop, but over a million grains: the worker
 * runs it (build.worker.ts), so the frame that receives the lights never pays for it. */
export function paintCounties(positions: Float32Array, count: number, r: CountyRaster, out: Float32Array = new Float32Array(count)): Float32Array {
  for (let i = 0; i < count; i++) out[i] = countyAt(r, positions[i * 3], positions[i * 3 + 2]);
  return out;
}

/** EVERYTHING THE LIGHTS NEED, built in one place so the worker and the main-thread fallback
 * cannot disagree: the cloud, the haze over it, the county raster, the dust painted with its
 * counties, each county's own frame and lift, and the towns the lantern names. Measured in the
 * owner's Chrome (round 55): built on the main thread this was 50 to 70 ms in the very frame
 * that received the terrain. Every array is fresh and owns its buffer (bundleTransfer lists
 * them), so a worker hands the whole thing over without a copy. */
export interface LightBundle {
  cloud: LightCloud;
  haze: HazeCloud;
  raster: CountyRaster;
  /** paintCounties over the dust, when the dust was given; null when there is no dust to paint. */
  dustCounties: Float32Array | null;
  boxes: Partial<Record<CountySlugName, LngLatBox>>;
  areaGains: Partial<Record<CountySlugName, number>>;
  towns: TownMark[];
  /** World x, the REAL height in km, z per town, in `towns` order (the lantern's picking). */
  townWorld: Float32Array;
}

export function buildLightBundle(
  pts: LightPoints,
  grid: ElevationGrid | null,
  dust: { positions: Float32Array; count: number } | null,
  areaGain: { pow: number; max: number },
): LightBundle {
  const cloud = buildLights(pts, grid);
  const haze = buildHaze(cloud);
  const raster = countyRaster(cloud);
  const dustCounties = dust ? paintCounties(dust.positions, dust.count, raster) : null;
  const boxes = countyLightBoxes(cloud);
  const areaGains = countyAreaGains(cloud, boxes, areaGain);
  const towns = townCentroids(pts);
  const townWorld = new Float32Array(towns.length * 3);
  towns.forEach((t, i) => {
    const h = grid ? sampleHeight(grid, t.lng, t.lat) : 0;
    const [x, , z] = lngLatToWorld(t.lng, t.lat);
    townWorld[i * 3] = x;
    townWorld[i * 3 + 1] = h / 1000;
    townWorld[i * 3 + 2] = z;
  });
  return { cloud, haze, raster, dustCounties, boxes, areaGains, towns, townWorld };
}

/** The bundle's buffers, for postMessage's transfer list (each once, whatever shares one). */
export function bundleTransfer(b: LightBundle): ArrayBuffer[] {
  const arrays = [b.cloud.positions, b.cloud.delays, b.cloud.gains, b.cloud.seeds, b.cloud.counties, b.haze.positions, b.haze.strengths, b.raster.data, b.townWorld];
  if (b.dustCounties) arrays.push(b.dustCounties);
  return [...new Set(arrays.map((a) => a.buffer as ArrayBuffer))];
}
