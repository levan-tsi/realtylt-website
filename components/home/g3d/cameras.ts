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
  //
  // Round 57, THE TERRITORY SHOT (the owner: "show everything from higher: those five boroughs and
  // Westchester and those areas that we cover"). The camera stands south of the harbour and looks
  // north, so the city, the harbour and Staten Island are at the front and the valley runs up the
  // frame to Kingston with the Catskills on the horizon. Solved, not guessed: ten points of the
  // territory (Staten Island's south shore, the Rockaways, Nassau's west, Port Chester, the
  // Westchester and Dutchess corners on the state line, Poughkeepsie, New Paltz, Middletown,
  // Rockland) fitted by our own projection into the window's free side (1440: x 640..1420, right
  // of the words), then looked at. The losing composition, straight down at 15 to 25 degrees,
  // read as a road atlas of New Jersey with the city in a corner (frames in
  // docs/parity/DESIGN-ROUND57.md §4).
  // The phone is the hard one: its words take the top third and the bottom half, leaving a band
  // of ~220 px (y 280..500). Fitted there from the south looking NORTH-NORTH-WEST (heading 340),
  // the city, Long Island and the Sound sit in the band, "New York" readable, and the river runs
  // up to Poughkeepsie beside the headline; looking north (heading 10) put the city under the
  // count, where nobody could see it.
  // Round 57.2, the phone's two edges: at tilt 50 / fov 62 the top of the frame reached Ottawa,
  // Kingston ON and Watertown under the header's shade. Tilt 46 and fov 58 from the same place end
  // the frame at the Mohawk (Utica, faint, under the shade) and keep the city, Long Island and the
  // Sound where they were in the band between the words (frames scripts/_scratch-r57/2/phonecam/;
  // tilt 45 at 172 km and 48 at 162 km lost, one showing Schenectady, one Syracuse). The pale band
  // at the bottom is the ocean at every candidate, so it is shaded, not framed away (G3dGround).
  hero: { wide: cam(41.0093, -74.3582, 145_000, 55, 8, 40), tall: cam(40.8319, -73.858, 156_000, 46, 340, 58) },
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
/** Round 57: the hero rose to 145 to 156 km to hold the whole territory, and the ladder pulls
 * Dutchess back behind it (60 -> 72.5 km at 1440, 78 km at 390). The alternative, letting the
 * FIRST step (hero to Dutchess) differ by up to this ratio and Dutchess stay at 60 km, was built
 * and measured with the headed lag probe, cold, twice at each width (docs/parity/DESIGN-ROUND57.md
 * §4): on the phone the first flight's worst frame was 243 and 271 ms with the exception against
 * 118 and 70 ms on the ladder; at 1440, 83 and 63 against 76 and 56. It costs, so the ladder
 * holds. `{ firstStep: true }` (the page's `?ladder=first`) keeps the exception one switch away. */
export const FIRST_STEP_RATIO = 2.75;

const ladderCache = new Map<string, Map<ShotName, G3dCamera>>();

/** Every shot on the ladder at this aspect, with the range floors applied. */
export function ladderCameras(aspect: number, opts: { firstStep?: boolean } = {}): Map<ShotName, G3dCamera> {
  const key = `${Math.round(aspect * 1000)}${opts.firstStep ? "f" : ""}`;
  const hit = ladderCache.get(key);
  if (hit) return hit;
  const cams = LADDER.map((n) => rawCamera(n, aspect));
  // The allowed ratio between rung i and rung i + 1.
  const ratio = (i: number) => (i === 0 && opts.firstStep ? FIRST_STEP_RATIO : MAX_RANGE_RATIO);
  // Raise the nearer of any two neighbours until the ratio holds, both ways, until nothing moves
  // (raising only, so it converges; each pass can only lift a range to half a neighbour's).
  for (let pass = 0; pass < LADDER.length; pass++) {
    let moved = false;
    for (let i = 0; i < cams.length; i++) {
      const floor = Math.max(i > 0 ? cams[i - 1].range / ratio(i - 1) : 0, i + 1 < cams.length ? cams[i + 1].range / ratio(i) : 0);
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
export function cameraFor(name: ShotName, aspect: number, opts: { firstStep?: boolean } = {}): G3dCamera {
  return ladderCameras(aspect, opts).get(name) ?? rawCamera(name, aspect);
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

/** HOW MANY HOMES A SHOT DRAWS, BY ALTITUDE (round 57.2). The owner: "minimalistic, not too
 * overcrowded ... still balanced", and round 57.1's frames showed why the old rule failed it: 339
 * lights at the territory shot read as one blob over the city, and the county chapters drew up to
 * 810 (the old one-per-1,600-px window cap) as a white carpet over Westchester, the Bronx and
 * Queens. So the count, the spacing on screen and the glyph (glyph.ts) all follow the RANGE: high
 * up, few lights, far apart and small; they grow only as the camera comes down.
 *
 * Two ceilings, the lower wins: one light per `pxPerLight(range)` square pixels of window (2,000
 * close in, rising smoothly to 10,000 at the territory's height), and a hard count by altitude.
 * Numbers tuned by frames at every stop, 1440 and 390 (scripts/_scratch-r57/2/, the record in
 * docs/parity/DESIGN-ROUND57.md §4 "Round 2"). */
export function pxPerLight(rangeMetres: number): number {
  return Math.round(Math.min(10_000, Math.max(2_000, 2_000 * Math.pow(rangeMetres / 25_000, 0.9))));
}

/** The hard count by altitude: the territory (100 km and up), every chapter and county (25 to 100
 * km: Queens at 35 km drew 655 in round 57.1, the carpet), and a close shot under 25 km. */
export function ceilingFor(rangeMetres: number): number {
  return rangeMetres >= 100_000 ? 130 : rangeMetres >= 25_000 ? 380 : 900;
}

/** THE PHONE'S TERRITORY, SEEN (round 57.3). At 390 x 844 the density rule leaves the territory
 * shot 32 lights, and in the ~220 px band between the phone's words they were faint to invisible
 * while the copy says "every light on the map is one of them" (round 2's frames). A narrow window
 * draws at least this many at any height; closer in the density rule already draws more, so the
 * count still only grows as the camera comes down. Chosen by frames at 390 (the record in
 * docs/parity/DESIGN-ROUND57.md §4 "Round 3"). */
export const PHONE_FLOOR = 72;
/** Below this width a window is a phone for the lights' count and glyph (glyph.ts `narrow`). */
export const NARROW = 640;
export const isNarrow = (viewport?: { width: number }) => !!viewport && viewport.width < NARROW;

export function budgetFor(rangeMetres: number, viewport?: { width: number; height: number }): number {
  const hard = ceilingFor(rangeMetres);
  if (!viewport) return hard;
  const byDensity = Math.min(hard, Math.floor((viewport.width * viewport.height) / pxPerLight(rangeMetres)));
  return isNarrow(viewport) ? Math.max(byDensity, Math.min(hard, PHONE_FLOOR)) : byDensity;
}

/** The least distance, in css px, between two lights on screen (thinning.ts): wide apart at the
 * territory's height so the city reads as a scatter of points, never a glow; closer as the camera
 * comes down. */
export function lightGap(rangeMetres: number): number {
  return Math.round(Math.min(30, Math.max(14, 17 * Math.pow(rangeMetres / 25_000, 0.45))));
}

/** THE DENSITY-TRUE GAP (round 57.6, light-plan.ts planDensity): the planner now takes the homes in
 * one random order until the ceiling, so where homes are denser more lights are drawn; this small
 * gap only keeps two glows from standing on one another. A share of round 57.2's lattice gap (which
 * set the spacing of the even lattice), chosen by frames side by side (scripts/_scratch-r57/6/thin/). */
export const DENSITY_GAP_SHARE = 0.5;
export function densityGap(rangeMetres: number): number {
  return Math.round(lightGap(rangeMetres) * DENSITY_GAP_SHARE);
}

/** The county an area shot keeps its homes to (the others are not drawn there), or null. */
export function focusOf(name: ShotName): string | null {
  return (AREA_COUNTY_OF as Partial<Record<ShotName, string>>)[name] ?? null;
}

export const FLIGHT_SHOTS = FLIGHT;
