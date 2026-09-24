/** OUR LIGHT LAYER'S ARITHMETIC (round 57.6), pure and tested: where each home is in the camera's
 * space, which homes a camera draws, and how the drawn set changes over a flight.
 *
 * Why this exists: until round 57.5 the lights were Google's Marker3DElements. Each one cost a DOM
 * node and a task (1,500 at once froze the page 547 ms, so they went in 25 a frame), their glyph
 * was fixed once drawn (a tier change re-added them, which popped), they had no hover, and they
 * were thinned into an even lattice. Now the homes are drawn by us on a canvas over the night grade
 * (light-layer.ts), projected every frame of a flight from the camera the map reports, so the
 * lights sit where the homes are (camera.ts, calibrated to Google's drawing in round 57.5), the
 * glyph eases with the range (glyph.ts), and the set cross-fades instead of being re-added.
 *
 * THE DISTRIBUTION (the owner: "those light dots, listings, distribute properly with
 * geolocation"). Round 57.2's planner kept a light only where no other stood within a wide screen
 * gap (30 px at the territory), which fills every cell once and so draws an EVEN LATTICE: Queens
 * and a Dutchess hillside got the same spacing. Here the homes are taken in one fixed random order
 * (a stable hash, so the same camera always draws the same homes) until the altitude's ceiling is
 * reached: a uniform sample of the homes, so where there are more homes there are more lights. A
 * small screen gap still keeps two glows from sitting on one another (the city stays a scatter of
 * points, never a blob). The ceilings by altitude (cameras.ts budgetFor) stay. */
import { toEcef, type CameraFrame, type Viewport } from "./camera";

/** Every home's place in earth-centred metres (x, y, z per home), its ground height included. */
export function homesEcef(lat: ArrayLike<number>, lng: ArrayLike<number>, height: (lat: number, lng: number) => number = () => 0): Float64Array<ArrayBuffer> {
  const n = lat.length;
  const out = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = toEcef(lat[i], lng[i], height(lat[i], lng[i]));
    out[3 * i] = p[0];
    out[3 * i + 1] = p[1];
    out[3 * i + 2] = p[2];
  }
  return out;
}

/** The focal length in px for a viewport (fov spans the height; camera.ts). */
export const focalOf = (vp: Viewport) => vp.height / 2 / Math.tan((vp.fov * Math.PI) / 180 / 2);

/** Home `i` on screen, written into `out` (x, y, depth); false if it is behind the eye. The same
 * maths as camera.ts `projectWith`, from the precomputed place (no trigonometry per frame). */
export function projectHome(frame: CameraFrame, vp: Viewport, f: number, ecef: Float64Array, i: number, out: { x: number; y: number; z: number }): boolean {
  const dx = ecef[3 * i] - frame.eye[0], dy = ecef[3 * i + 1] - frame.eye[1], dz = ecef[3 * i + 2] - frame.eye[2];
  const z = dx * frame.forward[0] + dy * frame.forward[1] + dz * frame.forward[2];
  if (z <= 1) return false;
  out.x = vp.width / 2 + ((dx * frame.right[0] + dy * frame.right[1] + dz * frame.right[2]) / z) * f;
  out.y = vp.height / 2 - ((dx * frame.up[0] + dy * frame.up[1] + dz * frame.up[2]) / z) * f;
  out.z = z;
  return true;
}

/** A fixed random order of the homes (a stable integer hash of each home's KEY): the order the
 * planner takes them in, so a budget cut is a uniform sample and the same camera draws the same
 * homes. Homes with one key (the units of one building: one place) keep their order in the list.
 *
 * THE KEY (round 57.10). Until round 57.9 the key was the home's INDEX in the list, and the route
 * lists the homes by listing id, so one listing added by the hourly sync shifted the index of every
 * home after it and the page lit different homes: the cover (baked at the hero, the same order) no
 * longer matched the live lights (its diff rose from 6.9 to 8.0 levels within an hour, round 9).
 * Keyed by something the listing keeps across syncs, only the new and the gone homes change. The
 * lights carry no listing id (6 bytes a home, lib/idx/lights.ts; an id would grow the load), so
 * the key is the home's place on the lights' own grid (`placeKeys`): the listing's, as stable as its
 * coordinates, and all the page and the cover script both have. */
export function keyOrder(keys: ArrayLike<number>): Int32Array<ArrayBuffer> {
  const n = keys.length;
  const h32 = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let h = (keys[i] + 0x9e3779b9) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    h32[i] = (h ^ (h >>> 16)) >>> 0;
  }
  const idx = new Int32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  idx.sort((a, b) => h32[a] - h32[b] || a - b);
  return idx;
}

/** Each home's key for `keyOrder`: its place on the lights' 65,536-step grid (x step * 65536 + y
 * step), recovered exactly from the unpacked 0..1 coordinates (lib/idx/lights.ts unpackLights). */
export function placeKeys(x: ArrayLike<number>, y: ArrayLike<number>): Uint32Array<ArrayBuffer> {
  const out = new Uint32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = (Math.round(x[i] * 65535) * 65536 + Math.round(y[i] * 65535)) >>> 0;
  return out;
}

/** The homes a camera draws, density-true (see the file's note), as home indices in draw order. */
export function planDensity(o: {
  ecef: Float64Array;
  order: Int32Array;
  frame: CameraFrame;
  viewport: Viewport;
  budget: number;
  /** The least screen distance between two lights, css px (two glows never on one another). */
  gap: number;
  /** Only this county's homes (a county chapter), by index. */
  county?: readonly string[];
  focus?: string | null;
  /** How far outside the window a light may stand and still be planned (its halo shows). */
  margin?: number;
  /** THE STABLE CHOICE (round 57.8): the homes lit now. Among the homes this camera would reach in
   * the fixed order on its own (up to where its budget fills), the lit ones are taken first, still
   * held to the gap and the budget, then the rest. Coming down, the screen spreads and every lit
   * home in the new view stays, the new ones arriving around them; going up, the order decides who
   * goes (the latest first), and the high camera gets back exactly the lights it drew before
   * (tested). Without it the gap alone swaps some lights for their neighbours on the way down (a
   * reshuffle; measured on the real homes, scripts/_scratch-r57g-sim.mjs). */
  keep?: Iterable<number>;
  /** The homes already projected for this camera (projectAll), if the caller has them. */
  proj?: Projected;
}): number[] {
  const reach = { k: 0 };
  const oo = { ...o, proj: o.proj ?? projectAll(o.ecef, o.frame, o.viewport, o.margin ?? 8, o.county, o.focus) };
  const cold = greedy(oo, null, o.order.length, reach);
  if (!o.keep) return cold;
  const kept = new Uint8Array(o.order.length);
  let any = false;
  for (const i of o.keep) if (i >= 0 && i < kept.length && oo.proj.ok[i]) kept[i] = 1, (any = true);
  // Nothing lit in this view: the cold plan is the plan.
  return any ? greedy(oo, kept, reach.k, reach) : cold;
}

/** One greedy pass over `order` (see planDensity): with `kept`, first the kept homes among the
 * first `upTo` of the order, then every other home. `reach.k` gets how far into the order the
 * pass went before the budget filled. */
function greedy(o: Parameters<typeof planDensity>[0], kept: Uint8Array | null, upTo: number, reach: { k: number }): number[] {
  const { order, viewport: vp, budget, gap, margin = 8 } = o;
  const proj = o.proj ?? projectAll(o.ecef, o.frame, vp, margin, o.county, o.focus);
  const out: number[] = [];
  const grid = gap > 0 ? new Grid(vp, margin, gap, Math.min(budget, order.length)) : null;
  const g2 = gap * gap;
  let k = 0;
  for (let pass = kept ? 0 : 1; pass < 2; pass++) {
    const end = pass === 0 ? Math.min(upTo, order.length) : order.length;
    for (k = 0; k < end && out.length < budget; k++) {
      const i = order[k];
      // Pass 0 takes only the kept homes; pass 1 every home pass 0 did not look at.
      if (kept && (pass === 0 ? kept[i] !== 1 : kept[i] === 1 && k < upTo)) continue;
      if (!place(i)) continue;
      out.push(i);
    }
  }
  reach.k = out.length >= budget ? k : order.length;
  return out;

  function place(i: number): boolean {
    if (!proj.ok[i]) return false;
    const x = proj.x[i], y = proj.y[i];
    if (grid) {
      if (grid.nearest(x, y, g2) >= 0) return false;
      grid.add(x, y);
    }
    return true;
  }
}

/** Every home on screen for a camera (in the focus county), in css px: the plan and the counts
 * read it once instead of projecting each home again (round 57.8: the plan's cost). */
export interface Projected {
  x: Float32Array;
  y: Float32Array;
  ok: Uint8Array;
}
export function projectAll(ecef: Float64Array, frame: CameraFrame, vp: Viewport, margin = 8, county?: readonly string[], focus?: string | null): Projected {
  const n = ecef.length / 3;
  const x = new Float32Array(n), y = new Float32Array(n), ok = new Uint8Array(n);
  const f = focalOf(vp);
  const p = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < n; i++) {
    if (focus && county && county[i] !== focus) continue;
    if (!projectHome(frame, vp, f, ecef, i, p)) continue;
    if (p.x < -margin || p.y < -margin || p.x > vp.width + margin || p.y > vp.height + margin) continue;
    x[i] = p.x;
    y[i] = p.y;
    ok[i] = 1;
  }
  return { x, y, ok };
}

/** Points in square cells over the window (typed arrays, a linked list per cell): the gap test and
 * the nearest light, three by three cells around a place. */
class Grid {
  private cell: number;
  private gw: number;
  private gh: number;
  private off: number;
  private head: Int32Array;
  private next: Int32Array;
  readonly px: Float32Array;
  readonly py: Float32Array;
  size = 0;
  constructor(vp: Viewport, margin: number, cell: number, cap: number) {
    this.cell = Math.max(1, cell);
    this.off = margin + this.cell;
    this.gw = Math.ceil((vp.width + 2 * this.off) / this.cell) + 1;
    this.gh = Math.ceil((vp.height + 2 * this.off) / this.cell) + 1;
    this.head = new Int32Array(this.gw * this.gh).fill(-1);
    this.next = new Int32Array(Math.max(1, cap));
    this.px = new Float32Array(Math.max(1, cap));
    this.py = new Float32Array(Math.max(1, cap));
  }
  private cx(x: number) {
    return Math.min(this.gw - 2, Math.max(1, Math.floor((x + this.off) / this.cell)));
  }
  private cy(y: number) {
    return Math.min(this.gh - 2, Math.max(1, Math.floor((y + this.off) / this.cell)));
  }
  add(x: number, y: number): number {
    const id = this.size++;
    this.px[id] = x;
    this.py[id] = y;
    const c = this.cy(y) * this.gw + this.cx(x);
    this.next[id] = this.head[c];
    this.head[c] = id;
    return id;
  }
  /** The nearest point within sqrt(r2) px (closer than, not equal to), or -1. */
  nearest(x: number, y: number, r2: number): number {
    const cx = this.cx(x), cy = this.cy(y);
    let best = -1, bd = r2;
    for (let b = cy - 1; b <= cy + 1; b++)
      for (let a = cx - 1; a <= cx + 1; a++)
        for (let id = this.head[b * this.gw + a]; id >= 0; id = this.next[id]) {
          const dx = this.px[id] - x, dy = this.py[id] - y;
          const d = dx * dx + dy * dy;
          if (d < bd) {
            bd = d;
            best = id;
          }
        }
    return best;
  }
}

// ---- the glow stands for the homes --------------------------------------------------------------------

/** HOW MANY HOMES EACH DRAWN LIGHT STANDS FOR (round 57.8). Where the gap is full (a borough, a
 * county at 13 px) the lights stand as evenly as a lattice whatever the homes beneath them: Yonkers
 * and northern Westchester looked the same. So each light's glow is weighted by the homes it
 * stands for: every home on screen (and in the focus county) goes to the nearest drawn light within
 * `reach` px, itself included. Its glow then carries the true density while its point keeps the
 * mouse's gap. Counts in the plan's order. A grid of `reach`-sized cells: one pass over the homes. */
export function representedCounts(o: {
  ecef: Float64Array;
  frame: CameraFrame;
  viewport: Viewport;
  plan: readonly number[];
  reach: number;
  county?: readonly string[];
  focus?: string | null;
  margin?: number;
  /** The homes already projected for this camera (projectAll), if the caller has them. */
  proj?: Projected;
}): Float32Array {
  const { ecef, frame, viewport: vp, plan, reach, county, focus, margin = 8 } = o;
  const proj = o.proj ?? projectAll(ecef, frame, vp, margin, county, focus);
  const f = focalOf(vp);
  const p = { x: 0, y: 0, z: 0 };
  const grid = new Grid(vp, margin + reach, Math.max(4, reach), plan.length);
  const ofId = new Int32Array(plan.length);
  for (let k = 0; k < plan.length; k++) {
    const i = plan[k];
    if (proj.ok[i]) ofId[grid.add(proj.x[i], proj.y[i])] = k;
    else if (projectHome(frame, vp, f, ecef, i, p)) ofId[grid.add(p.x, p.y)] = k;
  }
  const out = new Float32Array(plan.length);
  const n = proj.ok.length;
  const r2 = reach * reach + 1e-6;
  for (let i = 0; i < n; i++) {
    if (!proj.ok[i]) continue;
    const id = grid.nearest(proj.x[i], proj.y[i], r2);
    if (id >= 0) out[ofId[id]]++;
  }
  return out;
}

/** The glow's strength steps, as a share of the glyph's glow (the median light is 1): a few steps
 * so the layer bakes a few sprites a frame, not one per light. */
export const GLOW_LEVELS = [0.4, 0.7, 1, 1.35, 1.7] as const;

/** The step for a light standing for `count` homes when the median light stands for `median`: by
 * the square root of the ratio (a light for four times the homes glows twice as strong), nearest
 * step in log terms. */
export function glowLevel(count: number, median: number): number {
  if (count <= 0 || median <= 0) return 0;
  const w = Math.sqrt(count / median);
  let best = 0;
  for (let l = 1; l < GLOW_LEVELS.length; l++) if (Math.abs(Math.log(w / GLOW_LEVELS[l])) < Math.abs(Math.log(w / GLOW_LEVELS[best]))) best = l;
  return best;
}

// ---- the cross-fade ---------------------------------------------------------------------------------

/** A drawn light's presence: `a` 0..1 now, heading to `to`. */
export interface Fade {
  a: number;
  to: 0 | 1;
}

/** A new plan: the planned homes head to 1 (new ones start at 0), every other drawn home heads to
 * 0. `instant` (reduced motion, a cut, the first plan under the cover) sets them there at once. */
export function applyPlan(fades: Map<number, Fade>, plan: readonly number[], instant: boolean): void {
  const want = new Set(plan);
  for (const [i, f] of fades) {
    if (want.has(i)) continue;
    if (instant) fades.delete(i);
    else f.to = 0;
  }
  for (const i of plan) {
    const f = fades.get(i);
    if (f) {
      f.to = 1;
      if (instant) f.a = 1;
    } else fades.set(i, { a: instant ? 1 : 0, to: 1 });
  }
}

/** Moves every fade `dt` ms along a `ms`-long fade; drops the lights that have gone. Returns true
 * while any is still moving. */
export function stepFades(fades: Map<number, Fade>, dt: number, ms: number): boolean {
  const d = ms > 0 ? dt / ms : 1;
  let moving = false;
  for (const [i, f] of fades) {
    if (f.to === 1 && f.a < 1) f.a = Math.min(1, f.a + d);
    else if (f.to === 0) {
      f.a = Math.max(0, f.a - d);
      if (f.a <= 0) {
        fades.delete(i);
        continue;
      }
    }
    if (f.a !== f.to) moving = true;
  }
  return moving;
}

/** The drawn alpha of a fade (smoothstep: no visible start or end to the change). */
export const easeFade = (a: number) => a * a * (3 - 2 * a);
