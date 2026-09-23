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

/** THE TOWNS' OWN GLOW (round 55): the region's real light at night, from the terrain asset's
 * blue channel (elevation.ts `glow`: NASA's Black Marble 2016 draped on the grid, the metro 1, a
 * valley town ~0.3..0.5, the Catskills 0). One patch per `cellKm` square whose mean glow clears
 * `floor`, on the terrain (the square's mean height + `liftKm`), strength the mean glow. buildHaze
 * above hung the glow only where many homes FOR SALE stood together, so it drew the market, not
 * the region: Manhattan (370 homes) was nearly dark and Newburgh, Poughkeepsie and Kingston had no
 * glow at all. This is where the cities are, whether or not anything is for sale there; the
 * listings stay the warm points on top.
 *
 * `within` keeps the glow to the served territory: the county raster the area chapter paints the
 * land with (every cell within reach of a home). Without it the satellite lights all of northern
 * New Jersey and Nassau, which are as bright as Queens in the tile and NOT where we work: measured
 * in the first frame, that flooded the hero's lower left (the headline's dark ground since round
 * 54) and the whole foreground with grey. With it the metro's glow bleeds a little across the
 * Hudson and the county line, then stops, as round 54's own lights do.
 *
 * Each patch is moved a deterministic fraction of its square off the grid: rows of patches at one
 * spacing, seen at a grazing angle, drew as horizontal bands (measured, the same frame). */
export function buildGlowHaze(grid: ElevationGrid, within: CountyRaster | null = null, cellKm = 1.6, floor = 0.35, liftKm = 0.12): HazeCloud {
  const stepC = Math.max(1, Math.round((cellKm * 1000) / grid.cellM.x));
  const stepR = Math.max(1, Math.round((cellKm * 1000) / grid.cellM.y));
  const pos: number[] = [], str: number[] = [];
  const { box, w, h } = grid;
  for (let r0 = 0; r0 < h; r0 += stepR)
    for (let c0 = 0; c0 < w; c0 += stepC) {
      const r1 = Math.min(h, r0 + stepR), c1 = Math.min(w, c0 + stepC);
      let g = 0, m = 0, n = 0;
      for (let r = r0; r < r1; r++)
        for (let c = c0; c < c1; c++) {
          const i = r * w + c;
          g += grid.glow[i];
          m += grid.heights[i];
          n++;
        }
      g /= n;
      if (g < floor) continue;
      // Cell (c, r)'s centre is at grid coordinate (c, r) (elevation.ts gridCoord), so the block's
      // centre is the mean of its first and one-past-last cell edges; then the jitter, up to 40% of
      // the block each way.
      const jc = (hash01(r0 * 7919 + c0 + 1) - 0.5) * 0.8 * (c1 - c0);
      const jr = (hash01(r0 + c0 * 104729 + 3) - 0.5) * 0.8 * (r1 - r0);
      const lng = box.west + (((c0 + c1) / 2 + jc) / w) * (box.east - box.west);
      const lat = box.north - (((r0 + r1) / 2 + jr) / h) * (box.north - box.south);
      const [x, , z] = lngLatToWorld(lng, lat);
      const edge = within ? reachAt(within, x, z) : 1;
      if (edge <= 0) continue;
      pos.push(x, m / n / 1000 + liftKm, z);
      // The breath over the DENSEST light only: from the floor up to the metro's 1. Below the floor
      // a town is carried by its street lights alone (buildStreetLights); the haze drawn over every
      // lit cell was grey fog wherever no warm light sat under it (measured, the first frames).
      str.push(((g - floor) / (1 - floor)) * edge);
    }
  return { count: str.length, positions: Float32Array.from(pos), strengths: Float32Array.from(str) };
}

/** THE STREETS (round 55): the region's real light at night as a carpet of faint warm points on
 * the ground, one to a few per 200 m cell in proportion to the cell's glow (elevation.ts `glow`:
 * NASA's Black Marble draped on the grid). From high up a city is a dense carpet of small lights,
 * which is exactly what the satellite saw and what the haze could not be (a haze with no lights
 * under it is fog); close in they are the street lights between the homes for sale, which stay
 * the brighter, larger points. Same buffers as the listing lights, drawn with the same shader,
 * a smaller and dimmer lamp. `within` keeps them to the served land (the county raster), and
 * gives each its county so an area chapter lifts a county's streets with its homes.
 *
 * Deterministic: every visit lays the same streets. `perCell` is the count at glow 1; a cell's
 * expected count is perCell * glow, the fraction drawn by a hash. */
export function buildStreetLights(grid: ElevationGrid, within: CountyRaster | null, perCell = 2.4, floor = 0.08, liftM = 6, introSpan = 1.6, jitter = 0.45): LightCloud {
  const { box, w, h } = grid;
  const pos: number[] = [], delays: number[] = [], gains: number[] = [], seeds: number[] = [], counties: number[] = [];
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      const g = grid.glow[i];
      if (g < floor) continue;
      // Fewer lamps toward the edge of the served land, so the carpet thins out instead of ending.
      const cLng = box.west + ((c + 0.5) / w) * (box.east - box.west);
      const cLat = box.north - ((r + 0.5) / h) * (box.north - box.south);
      const [cx, , cz] = lngLatToWorld(cLng, cLat);
      const edge = within ? reachAt(within, cx, cz) : 1;
      if (edge <= 0) continue;
      const expected = perCell * g * edge;
      const n = Math.floor(expected) + (hash01(i * 3 + 1) < expected - Math.floor(expected) ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const s = i * 5 + k;
        const lng = box.west + ((c + hash01(s * 2 + 11)) / w) * (box.east - box.west);
        const lat = box.north - ((r + hash01(s * 2 + 12)) / h) * (box.north - box.south);
        const [x, , z] = lngLatToWorld(lng, lat);
        const county = within ? countyAt(within, x, z) : 0;
        if (within && !county) continue;
        pos.push(x, (grid.heights[i] + liftM) / 1000, z);
        // The same wave as the homes: the harbour (south) first, then up the valley.
        delays.push((1 - (r + 0.5) / h) * introSpan + hash01(s + 13) * jitter);
        gains.push(g * (0.7 + 0.3 * hash01(s + 14)));
        seeds.push(hash01(s + 15));
        counties.push(county);
      }
    }
  return { count: gains.length, positions: Float32Array.from(pos), delays: Float32Array.from(delays), gains: Float32Array.from(gains), seeds: Float32Array.from(seeds), counties: Float32Array.from(counties) };
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
  /** How many flood steps from the nearest cell holding homes, 0 at the homes; 255 = beyond reach. */
  reach: Uint8Array;
  /** The flood's last step (reachKm / cellKm). */
  maxSteps: number;
}

/** Which county each patch of land belongs to, as far as the homes say: every cell takes the
 * county of the nearest cell holding lights (a breadth-first flood from all of them at once, so
 * the border falls about halfway between two counties' homes), up to `reachKm` from any home. No
 * county polygons are shipped; the listings draw the map. Used to light the land of the county
 * the page is talking about, and (round 55) to keep the towns' glow and street lights to the
 * served land: `reach` lets them fade over the flood's last rings rather than stop at a stair of
 * cells (measured at the hero: a 1.5 km staircase down Staten Island's shore and a straight cut
 * across Nassau). The cells are 0.75 km so those rings are fine enough to read as a gradient. */
export function countyRaster(cloud: LightCloud, cellKm = 0.75, reachKm = 6): CountyRaster {
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
  const reach = new Uint8Array(w * h).fill(255);
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
    reach[k] = 0;
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
        reach[j] = step;
        data[j] = data[k];
        next.push(j);
      }
    }
    queue = next;
  }
  return { x0, z0, cellKm, w, h, data, reach, maxSteps };
}

export function countyAt(r: CountyRaster, x: number, z: number): number {
  const cx = Math.floor((x - r.x0) / r.cellKm), cz = Math.floor((z - r.z0) / r.cellKm);
  return cx < 0 || cz < 0 || cx >= r.w || cz >= r.h ? 0 : r.data[cz * r.w + cx];
}

/** How much of the served land a place is on: 1 near the homes, easing to 0 over the flood's
 * outer rings (from `from` of the reach), 0 beyond it. */
export function reachAt(r: CountyRaster, x: number, z: number, from = 0.4): number {
  const cx = Math.floor((x - r.x0) / r.cellKm), cz = Math.floor((z - r.z0) / r.cellKm);
  if (cx < 0 || cz < 0 || cx >= r.w || cz >= r.h) return 0;
  const s = r.reach[cz * r.w + cx];
  if (s === 255) return 0;
  const t = Math.min(1, Math.max(0, (s / r.maxSteps - from) / (1 - from)));
  return 1 - t * t * (3 - 2 * t);
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
  /** The street lights (buildStreetLights); empty when the terrain carries no glow. */
  streets: LightCloud;
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
  const raster = countyRaster(cloud);
  // The towns' real glow when the terrain carries it, kept to the land the homes say is ours; the
  // homes' own haze when there is no terrain (the page then draws on a flat sea) or the asset has
  // no night-lights channel.
  const glowHaze = grid ? buildGlowHaze(grid, raster) : null;
  const haze = glowHaze && glowHaze.count ? glowHaze : buildHaze(cloud);
  const streets = grid ? buildStreetLights(grid, raster) : buildStreetLights({ ...EMPTY_GRID }, null);
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
  return { cloud, haze, streets, raster, dustCounties, boxes, areaGains, towns, townWorld };
}

/** A grid with nothing on it, for a bundle built with no terrain: no streets. */
const EMPTY_GRID: ElevationGrid = { box: { west: 0, east: 1, south: 0, north: 1 }, w: 1, h: 1, cellM: { x: 1, y: 1 }, heights: new Float32Array(1), water: new Uint8Array(1), waterFrac: new Float32Array(1), glow: new Float32Array(1) };

/** The bundle's buffers, for postMessage's transfer list (each once, whatever shares one). */
export function bundleTransfer(b: LightBundle): ArrayBuffer[] {
  const arrays = [b.cloud.positions, b.cloud.delays, b.cloud.gains, b.cloud.seeds, b.cloud.counties, b.haze.positions, b.haze.strengths, b.raster.data, b.raster.reach, b.townWorld];
  for (const s of [b.streets]) arrays.push(s.positions, s.delays, s.gains, s.seeds, s.counties);
  if (b.dustCounties) arrays.push(b.dustCounties);
  return [...new Set(arrays.map((a) => a.buffer as ArrayBuffer))];
}
