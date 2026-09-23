/** Which of our homes the real map draws for a camera (round 56).
 *
 * The owner, on round 55: "minimalistic, not too overcrowded or too many lights in one place; even
 * though there is the city density expression it has to be still balanced". So the lights are
 * thinned the way /search thins its pins (components/idx/pin-thinning.ts `planMarkers`): every
 * home is projected to the window with our own camera maths, and a home is drawn only where it
 * does not crowd one already accepted, in a stable hash order (the same frame always draws the same
 * homes, and a sample that is not biased toward any price band). On top of that a CEILING per shot
 * (cameras.ts `budgetFor`): a few hundred for the whole region, a county's homes up to ~1,500, every
 * home in view when close. A county chapter draws only that county's homes.
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
}): number[] {
  const { lights, camera, viewport, budget, focus } = opts;
  const pins = focus ? opts.pins.filter((p) => lights.county[Number(p.id)] === focus) : opts.pins;
  const frame = cameraFrame(camera);
  const planned = planMarkers({
    pins,
    project: (lat, lng) => projectWith(frame, viewport, lat, lng),
    viewport: { left: 0, top: 0, right: viewport.width, bottom: viewport.height },
    maxMarkers: budget,
  });
  return planned.map((m) => Number(m.pin.id));
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
