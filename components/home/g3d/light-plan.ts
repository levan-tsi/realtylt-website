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

/** A fixed random order of n homes (a stable integer hash of each index): the order the planner
 * takes them in, so a budget cut is a uniform sample and the same camera draws the same homes. */
export function hashOrder(n: number): Int32Array<ArrayBuffer> {
  const keys = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let h = (i + 0x9e3779b9) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    keys[i] = (h ^ (h >>> 16)) >>> 0;
  }
  const idx = new Int32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  idx.sort((a, b) => keys[a] - keys[b] || a - b);
  return idx;
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
}): number[] {
  const { ecef, order, frame, viewport: vp, budget, gap, county, focus, margin = 8 } = o;
  const f = focalOf(vp);
  const out: number[] = [];
  const p = { x: 0, y: 0, z: 0 };
  const cell = Math.max(1, gap);
  const cells = new Map<number, number[]>();
  const key = (cx: number, cy: number) => (cx + 4096) * 16384 + (cy + 4096);
  const g2 = gap * gap;
  for (let k = 0; k < order.length && out.length < budget; k++) {
    const i = order[k];
    if (focus && county && county[i] !== focus) continue;
    if (!projectHome(frame, vp, f, ecef, i, p)) continue;
    if (p.x < -margin || p.y < -margin || p.x > vp.width + margin || p.y > vp.height + margin) continue;
    if (gap > 0) {
      const cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell);
      let clear = true;
      for (let a = -1; a <= 1 && clear; a++)
        for (let b = -1; b <= 1 && clear; b++) {
          const bin = cells.get(key(cx + a, cy + b));
          if (!bin) continue;
          for (let j = 0; j < bin.length; j += 2) {
            const ex = bin[j] - p.x, ey = bin[j + 1] - p.y;
            if (ex * ex + ey * ey < g2) {
              clear = false;
              break;
            }
          }
        }
      if (!clear) continue;
      const kk = key(cx, cy);
      const bin = cells.get(kk);
      if (bin) bin.push(p.x, p.y);
      else cells.set(kk, [p.x, p.y]);
    }
    out.push(i);
  }
  return out;
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
