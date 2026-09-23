/** Which of our homes the real map draws for a camera (round 56).
 *
 * The owner, on round 55: "minimalistic, not too overcrowded or too many lights in one place; even
 * though there is the city density expression it has to be still balanced". So the lights are
 * thinned the way /search thins its pins (components/idx/pin-thinning.ts `planMarkers`): every
 * home is projected to the window with our own camera maths, and a home is drawn only where it
 * does not crowd one already accepted, in a stable hash order (the same frame always draws the same
 * homes, and a sample that is not biased toward any price band). On top of that, since round 57.2,
 * a CEILING and a least SCREEN GAP by altitude (cameras.ts `budgetFor`, `lightGap`): ~130 lights
 * 30 px apart at the territory shot, a few hundred at a chapter, more when close. A county chapter
 * draws only that county's homes.
 *
 * Pure: the lights come in as arrays, the camera as numbers; tested without a map. */
import type { MapPin } from "@/lib/idx/types";
import { planMarkers } from "@/components/idx/pin-thinning";
import { cameraFrame, projectWith, type MapCamera, type Viewport } from "./camera";

export interface LightSet {
  lat: Float64Array;
  lng: Float64Array;
  /** The county (feed slug) each home is in, by index. */
  county: readonly string[];
}

/** A light as a pin the planner understands: its index is its id. */
export function lightPins(lights: LightSet): MapPin[] {
  const n = lights.lat.length;
  const out: MapPin[] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = { id: String(i), lat: lights.lat[i], lng: lights.lng[i], price: 0, address: "", city: "", zip: "", beds: 0, baths: 0, office: "", photoCount: 0 };
  }
  return out;
}

/** The homes to draw, as light indices, for a camera in a window. `pins` is lightPins(lights),
 * built once. */
export function planLights(opts: {
  lights: LightSet;
  pins: MapPin[];
  camera: MapCamera;
  viewport: Viewport;
  budget: number;
  focus?: string | null;
  /** Round 57.2: the least distance, css px, between two lights on screen (cameras.ts lightGap).
   * Applied over the planner's output in its own stable order, so the same frame still draws the
   * same homes; 0 leaves pin-thinning's own spacing alone. */
  gap?: number;
}): number[] {
  const { lights, camera, viewport, budget, focus, gap = 0 } = opts;
  const pins = focus ? opts.pins.filter((p) => lights.county[Number(p.id)] === focus) : opts.pins;
  const frame = cameraFrame(camera);
  const planned = planMarkers({
    pins,
    project: (lat, lng) => projectWith(frame, viewport, lat, lng),
    viewport: { left: 0, top: 0, right: viewport.width, bottom: viewport.height },
    maxMarkers: gap > 0 ? Infinity : budget,
  });
  if (gap <= 0) return planned.map((m) => Number(m.pin.id));
  // A grid of gap-sized cells: a light is kept only when no kept light within `gap` px stands in
  // its cell or the eight around it.
  const cells = new Map<number, { x: number; y: number }[]>();
  const key = (cx: number, cy: number) => cx * 100003 + cy;
  const out: number[] = [];
  const g2 = gap * gap;
  for (const m of planned) {
    if (out.length >= budget) break;
    const cx = Math.floor(m.x / gap), cy = Math.floor(m.y / gap);
    let clear = true;
    for (let dx = -1; dx <= 1 && clear; dx++)
      for (let dy = -1; dy <= 1 && clear; dy++)
        for (const p of cells.get(key(cx + dx, cy + dy)) ?? []) {
          const ex = p.x - m.x, ey = p.y - m.y;
          if (ex * ex + ey * ey < g2) {
            clear = false;
            break;
          }
        }
    if (!clear) continue;
    const k = key(cx, cy);
    const bin = cells.get(k);
    if (bin) bin.push({ x: m.x, y: m.y });
    else cells.set(k, [{ x: m.x, y: m.y }]);
    out.push(Number(m.pin.id));
  }
  return out;
}

/** What to change on the map to get from the homes drawn now to the homes planned: which to take
 * away and which to add, in the planner's order (so the most important arrive first). */
export function diffLights(current: ReadonlySet<number>, planned: readonly number[]): { add: number[]; remove: number[] } {
  const next = new Set(planned);
  const remove: number[] = [];
  for (const i of current) if (!next.has(i)) remove.push(i);
  const add = planned.filter((i) => !current.has(i));
  return { add, remove };
}

/** The drawn home nearest a pointer, within `radius` css px of where its light is on screen, or
 * -1. `xy` holds the drawn homes' screen positions as x, y pairs. */
export function nearestLight(xy: Float32Array, count: number, px: number, py: number, radius = 14): number {
  let best = -1;
  let bd = radius * radius;
  for (let k = 0; k < count; k++) {
    const dx = xy[2 * k] - px, dy = xy[2 * k + 1] - py;
    const d = dx * dx + dy * dy;
    if (d <= bd) {
      bd = d;
      best = k;
    }
  }
  return best;
}
