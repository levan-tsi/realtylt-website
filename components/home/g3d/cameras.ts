/** The home page's shots as cameras on Google's 3D map (round 56).
 *
 * Every shot starts from the night flight's own framing (../night/shots.ts, the composition the
 * owner approved in round 54: which way the camera looks, what is in the middle, where the words
 * leave room), converted exactly (./camera.ts `framingToCamera`), with the field of view carried
 * across too: Map3DElement takes a vertical `fov`, the same convention three.js uses, and it
 * animates in `flyCameraTo` (measured in Chrome, maps 3.66). A portrait phone and a landscape
 * window blend the two framings by aspect exactly as the night flight does.
 *
 * The night flight lifted its terrain 6x and its lights were drawn on a black ground, so the six
 * chapters framed for that world read differently over real imagery: TUNED holds them as set by
 * eye, with the reason. The eleven county shots are the derived cameras unchanged. */
import { AREA_COUNTY_OF, AREA_FLIGHT, FLIGHT, SHOTS, framingFor, type ShotName } from "../night/shots";
import { framingToCamera, type MapCamera } from "./camera";

export interface G3dCamera extends MapCamera {
  /** Vertical field of view, degrees. */
  fov: number;
}

/** The chapters as tuned by eye over the real imagery (round 56, frames in
 * scripts/_scratch-r56/g3d/tune/). Why they moved from the derived cameras: the night framings
 * tilt 62 to 72 degrees, which on a black ground looked at black sky; on Google's globe the same
 * tilt shows the horizon, the atmosphere and place names from Montreal to Virginia Beach (seen on
 * every chapter frame). So every chapter keeps its derived HEADING (which way it looks) and its
 * subject, comes down to 50 to 55 degrees, and comes in until the subject fills the frame. The
 * hero also moves its center west so the valley and the city stand to the right of the words.
 * `tall` is the portrait phone; a shot without one uses `wide` with the phone's wider lens. */
export const TUNED: Partial<Record<ShotName, { wide: G3dCamera; tall?: G3dCamera }>> = {
  // The phone puts its words above and below the map, so the valley stands in the middle.
  //
  // Round 56 phase 1b, THE LADDER (below): the ranges were 120, 38, 28, 30 km, then the counties at
  // 21 to 113 km, the harbour at 16 and the region at 200; they are now within 2x of their
  // neighbours and the tilts within 15 degrees (50 for the chapters, 40 for the counties), so each
  // flight brings in fewer new tiles. Dutchess pulls back to 60 km (the bend at Newburgh to
  // Poughkeepsie), the Highlands to 30, Westchester to 48 (the Tappan Zee with both shores), the
  // harbour to 30 (the Upper Bay, lower Manhattan and Brooklyn), and the tail is no longer the
  // whole region from 200 km but the city and the river from 60 km (the page's last flight
  // was a 12x pull-back).
  hero: { wide: cam(41.05, -74.2, 120_000, 50, 0, 40), tall: cam(41.12, -73.97, 135_000, 45, 0, 58) },
  dutchess: { wide: cam(41.62, -73.95, 60_000, 50, 0, 40) },
  highlands: { wide: cam(41.4, -73.97, 30_000, 52, 185, 40) },
  westchester: { wide: cam(41.07, -73.87, 48_000, 50, 250, 40) },
  harbour: { wide: cam(40.7, -74.02, 30_000, 50, 30, 40), tall: cam(40.7, -74.0, 34_000, 48, 30, 58) },
  region: { wide: cam(40.98, -73.98, 60_000, 48, 10, 40) },
};

function cam(lat: number, lng: number, range: number, tilt: number, heading: number, fov: number): G3dCamera {
  return { center: { lat, lng, altitude: 0 }, range, tilt, heading, fov };
}

/** Google's 3D map will not tilt past this; a camera above it flies to a different picture. */
export const MAX_TILT = 80;

const clampTilt = (t: number) => Math.min(MAX_TILT, Math.max(0, t));
const round = (x: number, k: number) => Math.round(x * k) / k;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The camera straight from the night flight's framing, before any tuning. */
export function derivedCamera(name: ShotName, aspect: number): G3dCamera {
  const f = framingFor(SHOTS[name], aspect);
  return { ...framingToCamera(f), fov: round(f.fov, 100) };
}

/** Portrait below 0.62, landscape above 1.0, blended between (the night flight's own rule). */
export const aspectMix = (aspect: number) => Math.min(1, Math.max(0, (aspect - 0.62) / (1.0 - 0.62)));

/** THE LADDER (round 56 phase 1b). The order a reader meets the shots, one flight after another:
 * the chapters, the eleven counties of "Where we work", the harbour, the tail. Phase 1 measured
 * Google's renderer stalling while it streams tiles during a flight, and a flight that changes
 * range 3x or 12x brings in a whole new level of detail. So neighbours on the ladder differ in range
 * by at most MAX_RANGE_RATIO (the nearer shot is pulled back until they do; pulling back never
 * crops a county, it only shows more round it) and in tilt by at most MAX_TILT_STEP (tuned by hand
 * in TUNED and the area tilt, tested). */
export const LADDER: readonly ShotName[] = ["hero", "dutchess", "highlands", "westchester", ...AREA_FLIGHT, "harbour", "region"];
export const MAX_RANGE_RATIO = 2;
export const MAX_TILT_STEP = 15;

const ladderCache = new Map<number, Map<ShotName, G3dCamera>>();

/** Every shot on the ladder at this aspect, with the range floors applied. */
export function ladderCameras(aspect: number): Map<ShotName, G3dCamera> {
  const key = Math.round(aspect * 1000);
  const hit = ladderCache.get(key);
  if (hit) return hit;
  const cams = LADDER.map((n) => rawCamera(n, aspect));
  // Raise the nearer of any two neighbours until the ratio holds, both ways, until nothing moves
  // (raising only, so it converges; each pass can only lift a range to half a neighbour's).
  for (let pass = 0; pass < LADDER.length; pass++) {
    let moved = false;
    for (let i = 0; i < cams.length; i++) {
      const floor = Math.max(i > 0 ? cams[i - 1].range : 0, i + 1 < cams.length ? cams[i + 1].range : 0) / MAX_RANGE_RATIO;
      if (cams[i].range < floor - 0.5) {
        cams[i] = { ...cams[i], range: Math.ceil(floor) };
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Map(LADDER.map((n, i) => [n, cams[i]]));
  ladderCache.set(key, out);
  return out;
}

/** The camera for a shot in a window of this aspect (width / height), on the ladder. */
export function cameraFor(name: ShotName, aspect: number): G3dCamera {
  return ladderCameras(aspect).get(name) ?? rawCamera(name, aspect);
}

/** The shot's own camera, before the ladder's range floors. */
export function rawCamera(name: ShotName, aspect: number): G3dCamera {
  const t = TUNED[name];
  if (!t) {
    const d = derivedCamera(name, aspect);
    return { ...d, tilt: clampTilt(d.tilt) };
  }
  const tall = t.tall ?? { ...t.wide, fov: derivedCamera(name, 0.46).fov };
  const k = aspectMix(aspect);
  const dh = ((((t.wide.heading - tall.heading) % 360) + 540) % 360) - 180;
  return {
    center: { lat: round(lerp(tall.center.lat, t.wide.center.lat, k), 1e6), lng: round(lerp(tall.center.lng, t.wide.center.lng, k), 1e6), altitude: 0 },
    range: Math.round(lerp(tall.range, t.wide.range, k)),
    tilt: clampTilt(round(lerp(tall.tilt, t.wide.tilt, k), 100)),
    heading: round((((tall.heading + dh * k) % 360) + 360) % 360, 100),
    fov: round(lerp(tall.fov, t.wide.fov, k), 100),
  };
}

/** How many homes a shot draws at most, so the map is never a carpet. Two ceilings, the lower wins:
 * by shot (the establishing shots a few hundred, a chapter or a county up to 1,500, a close shot,
 * the eye under 25 km away, up to 2,500), and by the WINDOW: one light per PX_PER_LIGHT square
 * pixels. The frames at 1,500 per county read as a carpet over Westchester, the Bronx and Queens
 * (scripts/_scratch-r56/g3d/lab/scrim/, first pass); the owner asked for "minimalistic, not too
 * overcrowded ... still balanced". Screen spacing is pin-thinning's job; this is the ceiling. */
export const PX_PER_LIGHT = 1600;

export function budgetFor(name: ShotName, rangeMetres: number, viewport?: { width: number; height: number }): number {
  const byShot = name === "hero" || name === "region" ? 350 : rangeMetres < 25_000 ? 2500 : 1500;
  if (!viewport) return byShot;
  return Math.min(byShot, Math.floor((viewport.width * viewport.height) / PX_PER_LIGHT));
}

/** The county an area shot keeps its homes to (the others are not drawn there), or null. */
export function focusOf(name: ShotName): string | null {
  return (AREA_COUNTY_OF as Partial<Record<ShotName, string>>)[name] ?? null;
}

export const FLIGHT_SHOTS = FLIGHT;
