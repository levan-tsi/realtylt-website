/** THE LAND AS SILVER DUST. Pure generation (deterministic for a seed), tested on synthetic grids;
 * the scene uploads the arrays and ./shaders.ts lights them.
 *
 * Two ways to scatter the grains, used together:
 *  - CONTOURS (buildContourDust): grains strung along the terrain's contour lines, so steep ground
 *    gathers lines and flat ground stays dark, the way a topographic map draws a mountain, lifted
 *    into 3D; the shoreline is a line of its own, so the land's edge draws the river. This is what
 *    makes the Shawangunks and the Highlands read as landforms from 50 km away (round 54: a random
 *    scatter of the same budget read as television static).
 *  - A FILL (buildDust): a sparse scatter over the land, denser on slopes, so the flats between
 *    contours are faint dust rather than holes.
 * Only on land: the water is the absence of dust. Both thin out toward the map's edge along a
 * rounded outline, so the land dissolves into the night instead of ending at a ruled box. */
import { gradients, sampleField, sampleHeight, waterness, type ElevationGrid } from "./elevation";
import { lngLatToWorld, REGION } from "./world";

export interface DustCloud {
  count: number;
  /** World x, z and the REAL height in km (y); the shader applies the exaggeration (uExag), so
   * the relief is a live knob. */
  positions: Float32Array;
  /** Per grain, the ground's slope, rise over run, east and NORTH (unexaggerated). The shader
   * builds the exaggerated normal from it and lights it against the moon. */
  slopes: Float32Array;
  /** Per grain, how far the ground stands above (+) or below (-) its ~2 km neighbourhood,
   * squashed to -1..1: crests catch more light, hollows less. */
  ridges: Float32Array;
  /** 0..1 per grain: level-of-detail order, intro stagger. */
  seeds: Float32Array;
  /** What each grain belongs to: 0 = the scattered fill, 1 = a contour, 2 = an index contour
   * (every fifth), 3 = the shoreline. */
  kinds: Float32Array;
}

/** mulberry32: a small, fast, seeded PRNG. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Height above the mean of a (2r+1)^2 box of cells, in metres (a summed-area table). */
export function localRelief(grid: ElevationGrid, r = 5): Float32Array {
  const { w, h, heights } = grid;
  const sat = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += heights[y * w + x];
      sat[(y + 1) * (w + 1) + x + 1] = sat[y * (w + 1) + x + 1] + row;
    }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1), x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      const sum = sat[y1 * (w + 1) + x1] - sat[y0 * (w + 1) + x1] - sat[y1 * (w + 1) + x0] + sat[y0 * (w + 1) + x0];
      out[y * w + x] = heights[y * w + x] - sum / ((y1 - y0) * (x1 - x0));
    }
  return out;
}

/** 1 inside the served region, falling to 0 toward the grid's edge along a rounded rectangle
 * (a superellipse), with a slow wobble so the edge is a coast of dust, not a line. */
export function edgeWeight(lng: number, lat: number): number {
  const [x, , z] = lngLatToWorld(lng, lat);
  const [ex, , ez] = lngLatToWorld(REGION.east, REGION.south);
  const rx = Math.abs(ex) * 1.2, rz = Math.abs(ez) * 1.12;
  const p = 3.2;
  const r = Math.pow(Math.pow(Math.abs(x / rx), p) + Math.pow(Math.abs(z / rz), p), 1 / p);
  const wobble = 0.035 * Math.sin(x * 0.21 + 1.3) * Math.cos(z * 0.13 - 0.4) + 0.02 * Math.sin(x * 0.53 - z * 0.37);
  const t = (r + wobble - 0.84) / (1.02 - 0.84);
  return t <= 0 ? 1 : t >= 1 ? 0 : 1 - t * t * (3 - 2 * t);
}

/** The land's heights blurred (binomial 1-4-6-4-1, `passes` times each way), counting only land
 * cells, so the shore does not drag the land down. Contours are drawn on this: the stored heights
 * come in ~1 m steps near sea level, and a contour through a flat run of equal steps traces the
 * cells' square edges; blurred, it runs as a curve. */
export function smoothLand(grid: ElevationGrid, passes = 1): Float32Array {
  const { w, h, heights, water } = grid;
  let val = new Float32Array(w * h);
  let wt = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    wt[i] = water[i] ? 0 : 1;
    val[i] = water[i] ? 0 : heights[i];
  }
  const K = [1, 4, 6, 4, 1];
  const tmpV = new Float32Array(w * h);
  const tmpW = new Float32Array(w * h);
  for (let p = 0; p < passes; p++) {
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
    ]) {
      for (let r = 0; r < h; r++)
        for (let c = 0; c < w; c++) {
          let sv = 0, sw = 0;
          for (let k = -2; k <= 2; k++) {
            const cc = Math.min(w - 1, Math.max(0, c + k * dx)), rr = Math.min(h - 1, Math.max(0, r + k * dy));
            const j = rr * w + cc;
            sv += K[k + 2] * val[j];
            sw += K[k + 2] * wt[j];
          }
          tmpV[r * w + c] = sv;
          tmpW[r * w + c] = sw;
        }
      [val, wt] = [tmpV.slice(), tmpW.slice()];
    }
  }
  const out = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = water[i] ? 0 : wt[i] > 0 ? val[i] / wt[i] : heights[i];
  return out;
}

function emptyCloud(n: number): DustCloud {
  return { count: 0, positions: new Float32Array(n * 3), slopes: new Float32Array(n * 2), ridges: new Float32Array(n), seeds: new Float32Array(n), kinds: new Float32Array(n) };
}
function trim(c: DustCloud, k: number): DustCloud {
  return { count: k, positions: c.positions.subarray(0, k * 3), slopes: c.slopes.subarray(0, k * 2), ridges: c.ridges.subarray(0, k), seeds: c.seeds.subarray(0, k), kinds: c.kinds.subarray(0, k) };
}

/** The per-cell fields both builders sample (computed once, shared). */
export interface TerrainFields {
  east: Float32Array;
  north: Float32Array;
  relief: Float32Array;
}
export function terrainFields(grid: ElevationGrid): TerrainFields {
  const { east, north } = gradients(grid);
  return { east, north, relief: localRelief(grid) };
}

export interface DustOptions {
  count: number;
  fields?: TerrainFields;
  seed?: number;
  /** Extra density on steep ground: weight = 1 + reliefBias * min(1, slope / 0.25)^0.8. */
  reliefBias?: number;
  /** Fade the dust out toward the map's edge (off for tests on tiny grids). */
  edgeFade?: boolean;
}

/** The scattered FILL: `count` grains over the land, weighted toward slopes. */
export function buildDust(grid: ElevationGrid, opts: DustOptions): DustCloud {
  const { w, h, box } = grid;
  const rand = prng(opts.seed ?? 54);
  const reliefBias = opts.reliefBias ?? 1.3;
  const { east, north, relief } = opts.fields ?? terrainFields(grid);
  const weight = new Float64Array(w * h);
  let total = 0;
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++) {
      const i = r * w + c;
      if (grid.water[i]) continue;
      const slope = Math.hypot(east[i], north[i]);
      let wt = 1 + reliefBias * Math.pow(Math.min(1, slope / 0.25), 0.8);
      if (opts.edgeFade !== false) {
        const lng = box.west + ((c + 0.5) / w) * (box.east - box.west);
        const lat = box.north - ((r + 0.5) / h) * (box.north - box.south);
        wt *= edgeWeight(lng, lat);
      }
      weight[i] = wt;
      total += wt;
    }
  const out = emptyCloud(opts.count);
  if (total <= 0) return trim(out, 0);
  // Systematic sampling along the cumulative weight: exactly `count` draws, spread evenly, so the
  // density follows the weight without the clumps of independent draws.
  const step = total / opts.count;
  let next = rand() * step;
  let acc = 0;
  let k = 0;
  for (let i = 0; i < w * h && k < opts.count; i++) {
    if (!weight[i]) continue;
    acc += weight[i];
    const r = Math.floor(i / w), c = i % w;
    while (next < acc && k < opts.count) {
      next += step;
      // Jitter inside the cell; a grain that lands on the water (a cell on the shore) tries again,
      // twice, then is dropped: the shoreline is where the bilinear water fraction crosses one half.
      for (let attempt = 0; attempt < 3; attempt++) {
        const lng = box.west + ((c + rand()) / w) * (box.east - box.west);
        const lat = box.north - ((r + rand()) / h) * (box.north - box.south);
        if (waterness(grid, lng, lat) >= 0.5) continue;
        const [x, , z] = lngLatToWorld(lng, lat);
        out.positions[k * 3] = x;
        out.positions[k * 3 + 1] = sampleHeight(grid, lng, lat) / 1000;
        out.positions[k * 3 + 2] = z;
        out.slopes[k * 2] = sampleField(grid, east, lng, lat);
        out.slopes[k * 2 + 1] = sampleField(grid, north, lng, lat);
        out.ridges[k] = Math.tanh(sampleField(grid, relief, lng, lat) / 45);
        out.seeds[k] = rand();
        out.kinds[k] = 0;
        k++;
        break;
      }
    }
  }
  return trim(out, k);
}

export interface ContourOptions {
  /** Metres between contours; every fifth is an index contour. */
  intervalM: number;
  /** Kilometres between grains along a contour, at least (widened to fit maxPoints). */
  spacingKm: number;
  /** Grains along the shoreline, relative to a contour's (0: no shoreline). */
  shoreDensity: number;
  /** Sideways scatter of a grain off its line, km. */
  jitterKm: number;
  maxPoints: number;
  seed?: number;
  edgeFade?: boolean;
  /** Blur passes on the heights the contours follow (smoothLand). */
  smoothPasses?: number;
  fields?: TerrainFields;
}

/** CONTOURS OF DUST, by marching triangles over the grid (two triangles a cell: no ambiguous
 * saddles). Two passes: the first measures every line, the second strings the grains, spaced so
 * the whole region fits the budget evenly (a budget spent row by row would leave the south bare). */
export function buildContourDust(grid: ElevationGrid, opts: ContourOptions): DustCloud & { spacingKm: number } {
  const { w, h, box, water, waterFrac } = grid;
  const heights = smoothLand(grid, opts.smoothPasses ?? 1);
  const rand = prng(opts.seed ?? 54);
  const lngOf = (gx: number) => box.west + ((gx + 0.5) / w) * (box.east - box.west);
  const latOf = (gy: number) => box.north - ((gy + 0.5) / h) * (box.north - box.south);
  const I = opts.intervalM;
  const fadeOn = opts.edgeFade !== false;

  // Every segment of every line (kind 1 contour, 2 index contour, 3 shore), in grid coordinates.
  function walk(visit: (ax: number, ay: number, bx: number, by: number, kind: number, elev: number | null) => void) {
    const cut = (xs: number[], ys: number[], vs: number[], level: number, kind: number, elev: number | null) => {
      let n = 0, x0 = 0, y0 = 0, x1 = 0, y1 = 0;
      for (let e = 0; e < 3; e++) {
        const a = e, b = (e + 1) % 3;
        const va = vs[a] - level, vb = vs[b] - level;
        if (va < 0 !== vb < 0) {
          const t = va / (va - vb);
          const x = xs[a] + (xs[b] - xs[a]) * t, y = ys[a] + (ys[b] - ys[a]) * t;
          if (n === 0) (x0 = x), (y0 = y);
          else (x1 = x), (y1 = y);
          n++;
        }
      }
      if (n === 2) visit(x0, y0, x1, y1, kind, elev);
    };
    for (let r = 0; r < h - 1; r++)
      for (let c = 0; c < w - 1; c++) {
        const i00 = r * w + c, i10 = i00 + 1, i01 = i00 + w, i11 = i01 + 1;
        const wet = water[i00] + water[i10] + water[i01] + water[i11];
        for (let t = 0; t < 2; t++) {
          const xs = t ? [c, c + 1, c] : [c, c + 1, c + 1];
          const ys = t ? [r, r + 1, r + 1] : [r, r, r + 1];
          const ids = t ? [i00, i11, i01] : [i00, i10, i11];
          if (wet === 0) {
            const vs = [heights[ids[0]], heights[ids[1]], heights[ids[2]]];
            const lo = Math.min(vs[0], vs[1], vs[2]), hi = Math.max(vs[0], vs[1], vs[2]);
            for (let lv = Math.max(I, Math.ceil(lo / I) * I); lv < hi; lv += I) cut(xs, ys, vs, lv, Math.round(lv / I) % 5 === 0 ? 2 : 1, lv);
          }
          if (opts.shoreDensity > 0 && waterFrac[i00] + waterFrac[i10] + waterFrac[i01] + waterFrac[i11] > 0) {
            // The shoreline: where the cells' water fraction crosses a half (an anti-aliased edge,
            // so the line runs smoothly between cells).
            cut(xs, ys, [waterFrac[ids[0]], waterFrac[ids[1]], waterFrac[ids[2]]], 0.5, 3, null);
          }
        }
      }
  }
  const fadeAt = (ax: number, ay: number, bx: number, by: number) => (fadeOn ? edgeWeight(lngOf((ax + bx) / 2), latOf((ay + by) / 2)) : 1);

  // Pass 1: how much line there is, weighted as it will be strung.
  let weighted = 0;
  walk((ax, ay, bx, by, kind) => {
    const [x0, , z0] = lngLatToWorld(lngOf(ax), latOf(ay));
    const [x1, , z1] = lngLatToWorld(lngOf(bx), latOf(by));
    weighted += Math.hypot(x1 - x0, z1 - z0) * fadeAt(ax, ay, bx, by) * (kind === 3 ? opts.shoreDensity : 1);
  });
  const spacing = Math.max(opts.spacingKm, weighted / Math.max(1, opts.maxPoints * 0.985));

  // Pass 2: string the grains.
  const { east, north, relief } = opts.fields ?? terrainFields(grid);
  const out = emptyCloud(opts.maxPoints);
  let k = 0;
  walk((ax, ay, bx, by, kind, elev) => {
    const aLng = lngOf(ax), aLat = latOf(ay), bLng = lngOf(bx), bLat = latOf(by);
    const [x0, , z0] = lngLatToWorld(aLng, aLat);
    const [x1, , z1] = lngLatToWorld(bLng, bLat);
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.floor(((len * (kind === 3 ? opts.shoreDensity : 1)) / spacing) * fadeAt(ax, ay, bx, by) + rand());
    const px = len > 0 ? -(z1 - z0) / len : 0, pz = len > 0 ? (x1 - x0) / len : 0;
    for (let i = 0; i < n && k < opts.maxPoints; i++) {
      const t = (i + rand()) / n;
      const j = (rand() - 0.5) * 2 * opts.jitterKm;
      const lng = aLng + (bLng - aLng) * t, lat = aLat + (bLat - aLat) * t;
      out.positions[k * 3] = x0 + (x1 - x0) * t + px * j;
      out.positions[k * 3 + 1] = (elev ?? sampleHeight(grid, lng, lat)) / 1000;
      out.positions[k * 3 + 2] = z0 + (z1 - z0) * t + pz * j;
      out.slopes[k * 2] = sampleField(grid, east, lng, lat);
      out.slopes[k * 2 + 1] = sampleField(grid, north, lng, lat);
      out.ridges[k] = Math.tanh(sampleField(grid, relief, lng, lat) / 45);
      out.seeds[k] = rand();
      out.kinds[k] = kind;
      k++;
    }
  });
  return { ...trim(out, k), spacingKm: spacing };
}

/** A coarse copy of the terrain as a triangle mesh (real heights in km; the shader exaggerates and
 * sinks it), drawn into the depth buffer only, so ridges hide the dust and the lights behind them. */
export function buildDepthMesh(grid: ElevationGrid, stride = 2): { positions: Float32Array; index: Uint32Array } {
  const cols = Math.floor((grid.w - 1) / stride) + 1;
  const rows = Math.floor((grid.h - 1) / stride) + 1;
  const positions = new Float32Array(cols * rows * 3);
  const { box } = grid;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const gc = c * stride, gr = r * stride;
      const lng = box.west + ((gc + 0.5) / grid.w) * (box.east - box.west);
      const lat = box.north - ((gr + 0.5) / grid.h) * (box.north - box.south);
      // The mesh's triangles cut across valleys the bilinear dust follows, so each vertex takes the
      // LOWEST height of its stride block: the mesh sits under the dust everywhere.
      let lo = Infinity;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const rr = Math.min(grid.h - 1, Math.max(0, gr + dr * (stride >> 1)));
          const cc = Math.min(grid.w - 1, Math.max(0, gc + dc * (stride >> 1)));
          lo = Math.min(lo, grid.heights[rr * grid.w + cc]);
        }
      const [x, , z] = lngLatToWorld(lng, lat);
      const j = (r * cols + c) * 3;
      positions[j] = x;
      positions[j + 1] = lo / 1000;
      positions[j + 2] = z;
    }
  const index = new Uint32Array((cols - 1) * (rows - 1) * 6);
  let k = 0;
  for (let r = 0; r < rows - 1; r++)
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c, b = a + 1, d = a + cols, e = d + 1;
      index[k++] = a;
      index[k++] = d;
      index[k++] = b;
      index[k++] = b;
      index[k++] = d;
      index[k++] = e;
    }
  return { positions, index };
}

export function joinClouds(parts: DustCloud[]): DustCloud {
  if (parts.length === 1) return parts[0];
  const n = parts.reduce((a, p) => a + p.count, 0);
  const out = emptyCloud(n);
  out.count = n;
  let o = 0;
  for (const p of parts) {
    out.positions.set(p.positions, o * 3);
    out.slopes.set(p.slopes, o * 2);
    out.ridges.set(p.ridges, o);
    out.seeds.set(p.seeds, o);
    out.kinds.set(p.kinds, o);
    o += p.count;
  }
  return out;
}

/** Everything the scene needs from the terrain, in one call: the dust (contours plus fill, to a
 * budget) and the depth mesh. Pure, so it runs the same in a worker (./build.worker.ts, the normal
 * path: ~1 s of work on a desktop, ~4 s on a 4x-throttled phone, kept off the main thread so the
 * search box never waits for the scene) or, if no worker can start, on the main thread. */
export interface TerrainParams {
  budget: number;
  dustMode: "stipple" | "contour" | "mix";
  contourInterval: number;
  contourSpacing: number;
  contourSmooth: number;
  reliefBias: number;
  meshStride: number;
}
export function buildTerrainClouds(grid: ElevationGrid, p: TerrainParams): { dust: DustCloud; mesh: { positions: Float32Array; index: Uint32Array } } {
  const fields = terrainFields(grid);
  const parts: DustCloud[] = [];
  if (p.dustMode !== "stipple")
    parts.push(
      buildContourDust(grid, {
        intervalM: p.contourInterval,
        spacingKm: p.contourSpacing,
        shoreDensity: 1.1,
        jitterKm: 0.012,
        smoothPasses: p.contourSmooth,
        maxPoints: p.dustMode === "mix" ? Math.round(p.budget * 0.75) : p.budget,
        fields,
      }),
    );
  const used = parts.reduce((n, c) => n + c.count, 0);
  const fill = p.dustMode === "stipple" ? p.budget : p.dustMode === "mix" ? Math.max(0, p.budget - used) : 0;
  if (fill > 0) parts.push(buildDust(grid, { count: fill, reliefBias: p.reliefBias, fields }));
  return { dust: shuffleBySeed(joinClouds(parts)), mesh: buildDepthMesh(grid, p.meshStride) };
}

/** Shuffles the grains into a random order and gives grain i the seed (i + 0.5) / n, so the seed
 * ORDER is the array order: drawing only the first k grains (a draw range) is the same as keeping
 * the grains whose seed is under k / n, a uniform thinning that also saves the vertex work. */
export function shuffleBySeed(c: DustCloud, seed = 99): DustCloud {
  const rand = prng(seed);
  const n = c.count;
  const swap = (a: Float32Array, i: number, j: number, w: number) => {
    for (let k = 0; k < w; k++) {
      const t = a[i * w + k];
      a[i * w + k] = a[j * w + k];
      a[j * w + k] = t;
    }
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    swap(c.positions, i, j, 3);
    swap(c.slopes, i, j, 2);
    swap(c.ridges, i, j, 1);
    swap(c.kinds, i, j, 1);
  }
  for (let i = 0; i < n; i++) c.seeds[i] = (i + 0.5) / n;
  return c;
}
