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
export const TUNED: Record<ShotName, { wide: G3dCamera; tall?: G3dCamera }> = {
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
  //
  // Round 57.11, CLOSE (the owner's third verdict, record section 8: "buildings and blocks look like
  // bad quality lines ... zoom closer so it's not low quality pixelated lines"). Measured by the
  // orchestrator: at the chapters' 30 to 90 km Google's imagery is a black slab with grey road
  // lines; at 8 km it is a sharp photograph. So every chapter and county is now a PHOTOGRAPH of one
  // signature place (SIGNATURE below) at 6 to 9 km and tilt 58 to 60, chosen by eye from candidates
  // at both widths (scripts/_scratch-r57/11/compose*/, the record's round 11). On a laptop the "Where
  // we work" list takes the left half, so each county's place stands right of it (the look point
  // is moved screen-left by ~0.45 of the half width); on a phone the words fill the top and bottom
  // and the place stands in the middle (`tall`, fov 58). The territory (hero) and the tail
  // (region, under the footer's 0.86 veil) stay high.
  // The Highlands and Westchester chapters stand under the featured and new-listings cards (the
  // photograph barely shows), so they sit at 12 km, the brief's upper bound: measured cold, the
  // flight between them at 8 to 9 km made 97 / 55 / 104 ms, at 12 km 42 / 70 / 35 (lag f1..f3).
  dutchess: { wide: cam(41.7259, -73.964, 8_000, 60, 5, 40), tall: cam(41.71, -73.945, 8_000, 60, 5, 58) },
  highlands: { wide: cam(41.43, -73.975, 12_000, 60, 190, 40), tall: cam(41.43, -73.975, 12_000, 60, 190, 58) },
  westchester: { wide: cam(41.07, -73.895, 12_000, 60, 265, 40), tall: cam(41.07, -73.895, 12_000, 60, 265, 58) },
  ulster: { wide: cam(41.9061, -73.99, 8_000, 60, 270, 40), tall: cam(41.922, -73.99, 8_000, 60, 270, 58) },
  "dutchess-county": { wide: cam(41.7213, -73.9388, 7_000, 60, 80, 40), tall: cam(41.705, -73.935, 7_000, 60, 80, 58) },
  orange: { wide: cam(41.4835, -74.01, 7_000, 60, 270, 40), tall: cam(41.5, -74.01, 7_000, 60, 270, 58) },
  putnam: { wide: cam(41.4, -73.7282, 9_000, 58, 0, 40), tall: cam(41.4, -73.7, 9_000, 58, 0, 58) },
  rockland: { wide: cam(41.0779, -73.9441, 8_000, 60, 320, 40), tall: cam(41.09, -73.925, 8_000, 60, 320, 58) },
  "westchester-county": { wide: cam(40.9233, -73.7889, 7_000, 60, 30, 40), tall: cam(40.915, -73.77, 7_000, 60, 30, 58) },
  bronx: { wide: cam(40.8398, -73.9325, 6_000, 60, 20, 40), tall: cam(40.835, -73.915, 6_000, 60, 20, 58) },
  manhattan: { wide: cam(40.7771, -73.9912, 6_000, 60, 30, 40), tall: cam(40.77, -73.975, 6_000, 60, 30, 58) },
  queens: { wide: cam(40.7248, -73.8575, 6_000, 60, 20, 40), tall: cam(40.72, -73.84, 6_000, 60, 20, 58) },
  brooklyn: { wide: cam(40.6652, -73.9875, 6_000, 60, 340, 40), tall: cam(40.67, -73.97, 6_000, 60, 340, 58) },
  "staten-island": { wide: cam(40.5971, -74.1214, 7_000, 58, 350, 40), tall: cam(40.615, -74.088, 7_000, 58, 350, 58) },
  harbour: { wide: cam(40.685, -74.03, 6_000, 60, 40, 40), tall: cam(40.682, -74.042, 6_000, 60, 40, 58) },
  region: { wide: cam(40.98, -73.98, 60_000, 48, 10, 40) },
};

function cam(lat: number, lng: number, range: number, tilt: number, heading: number, fov: number): G3dCamera {
  return { center: { lat, lng, altitude: 0 }, range, tilt, heading, fov };
}

/** The two shots that stay HIGH: the territory (the page's first picture: our lights and names over
 * the whole region) and the tail under the footer. Every other shot is CLOSE. */
export const HIGH: readonly ShotName[] = ["hero", "region"];
export const CLOSE: readonly ShotName[] = (Object.keys(TUNED) as ShotName[]).filter((n) => !HIGH.includes(n));

/** Each close shot's subject, the place the photograph is of (tested: in the window at both widths,
 * right of the list on a laptop for the counties). */
export const SIGNATURE: Record<Exclude<ShotName, "hero" | "region">, { place: string; lat: number; lng: number }> = {
  dutchess: { place: "Walkway over the Hudson", lat: 41.7106, lng: -73.9447 },
  highlands: { place: "Cold Spring, under Storm King", lat: 41.4201, lng: -73.9546 },
  westchester: { place: "the Tappan Zee from Tarrytown", lat: 41.0707, lng: -73.8898 },
  ulster: { place: "Kingston's Rondout", lat: 41.9187, lng: -73.9837 },
  "dutchess-county": { place: "Poughkeepsie's riverfront", lat: 41.7004, lng: -73.935 },
  orange: { place: "Newburgh's waterfront", lat: 41.5023, lng: -74.0086 },
  putnam: { place: "Carmel on Lake Gleneida", lat: 41.43, lng: -73.6804 },
  rockland: { place: "Nyack", lat: 41.0907, lng: -73.9179 },
  "westchester-county": { place: "New Rochelle on the Sound", lat: 40.9115, lng: -73.7824 },
  bronx: { place: "the Grand Concourse at Yankee Stadium", lat: 40.8296, lng: -73.9262 },
  manhattan: { place: "Central Park and Midtown", lat: 40.774, lng: -73.9708 },
  queens: { place: "Flushing Meadows", lat: 40.7461, lng: -73.8448 },
  brooklyn: { place: "Prospect Park and Park Slope", lat: 40.6602, lng: -73.969 },
  "staten-island": { place: "St. George", lat: 40.6437, lng: -74.0736 },
  harbour: { place: "the Upper Bay", lat: 40.6892, lng: -74.0445 },
};

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
/* Round 57.11, the ladder re-examined for the close shots: the chapters and counties now sit at 6 to
 * 9 km, within 1.5x of each other, so the rule binds nowhere between them; kept, so a later shot
 * cannot break it. The two ALTITUDE steps (the territory down to the first chapter, 145 -> 8 km; the
 * harbour up to the tail, 6 -> 60 km) are exempt: pulling the close shots back behind a high
 * neighbour (the old rule: Dutchess 72.5 km, the harbour 30 km) is exactly the "bad quality lines"
 * altitude. Their cost is measured by the lag probe (the record's round 11) and the imagery streams
 * under the flight's veil (G3dGround). Round 57's first-step exception (`?ladder=first`) is gone:
 * the first step is now always free. */

const ladderCache = new Map<string, Map<ShotName, G3dCamera>>();

/** Every shot on the ladder at this aspect, with the range floors applied. */
export function ladderCameras(aspect: number): Map<ShotName, G3dCamera> {
  const key = `${Math.round(aspect * 1000)}`;
  const hit = ladderCache.get(key);
  if (hit) return hit;
  const cams = LADDER.map((n) => rawCamera(n, aspect));
  // The allowed ratio between rung i and rung i + 1.
  const ratio = (i: number) => (HIGH.includes(LADDER[i]) || HIGH.includes(LADDER[i + 1]) ? Infinity : MAX_RANGE_RATIO);
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

/** HOW MANY HOMES A SHOT DRAWS, BY ALTITUDE (round 57.8; round 57.2's tiers before it). The owner
 * on round 57.7's 130 lights at the territory and 245 to 380 at the chapters, against 15,689
 * listings: "the map has way less lights than there are listings and it should be more, and on zoom
 * in zoom out it should balance it out how much it shows ... in cities it should be a little more
 * ... but don't put them too close so people can move the mouse".
 *
 * So the count is ONE smooth function of the range (round 57.2's hard tiers of 130 / 380 / 900
 * jumped): one light per `pxPerLight(range)` square pixels of window, a power law of the range, so
 * coming down 2 % adds a couple of percent and never a step. High up it is the ceiling that binds
 * (the territory: a few hundred, the map still the picture); from the chapters down it is set high
 * enough that the GAP (`densityGap`, the mouse's rule) is what limits: "as many as the gap allows".
 * A phone gets more lights for its area (its territory band is small and its lights are its map).
 * Numbers chosen by frames at every stop, both widths (scripts/_scratch-r57/8/, the record in
 * docs/parity/DESIGN-ROUND57.md §7 "Round 8, the builder's numbers"). */
export function pxPerLight(rangeMetres: number, narrow = false): number {
  const wide = Math.min(8_000, Math.max(800, PX_AT_30KM * Math.pow(rangeMetres / 30_000, PX_POWER)));
  return Math.round(narrow ? wide * NARROW_PX_SHARE : wide);
}
const PX_AT_30KM = 2_100;
/** Nearly flat (the first build's 1.1 drew 971 lights at the Dutchess chapter, a starfield over the
 * whole frame and under the words): the lights' density ON SCREEN stays about the same as the
 * camera comes down, which is the owner's "balance", and the cities are held by the gap. */
const PX_POWER = 0.2;
const NARROW_PX_SHARE = 0.42;
/** The most lights the layer is asked to draw in one frame (its cost, light-layer.ts). */
export const MAX_LIGHTS = 2_400;

/** Below this width a window is a phone for the lights' count and glyph (glyph.ts `narrow`). */
export const NARROW = 640;
export const isNarrow = (viewport?: { width: number }) => !!viewport && viewport.width < NARROW;

export function budgetFor(rangeMetres: number, viewport: { width: number; height: number } = { width: 1440, height: 900 }): number {
  return Math.min(MAX_LIGHTS, Math.floor((viewport.width * viewport.height) / pxPerLight(rangeMetres, isNarrow(viewport))));
}

/** The least distance, in css px, between two lights on screen (thinning.ts): wide apart at the
 * territory's height so the city reads as a scatter of points, never a glow; closer as the camera
 * comes down. */
export function lightGap(rangeMetres: number): number {
  return Math.round(Math.min(30, Math.max(14, 17 * Math.pow(rangeMetres / 25_000, 0.45))));
}

/** THE GAP THAT KEEPS THE MOUSE HONEST (round 57.8; light-plan.ts planDensity takes the homes in one
 * fixed order until the budget, density-true, and skips a home closer than this to one it took).
 * The pointer's hit test is a 14 px radius (G3dGround nearestLight), so two lights nearer than
 * about 16 px on screen cannot both be picked cleanly: at the chapters and cities, where the pointer
 * is used, the floor is CITY_GAP, tuned by the hover probe (scripts/_scratch-r57g-hover.mjs, 50
 * pointer positions over Queens at 1440, each a light plus a random aim error): at 16 px, 50 of 50
 * named the light they were put on with an error up to 8 px, 396 lights; at 14 px, 50 of 50 up to
 * 7 px, 478 lights. The owner asked for more in the cities, and both resolve every position, so
 * 14 (the lowest the brief allows; the nearest light wins where a second is within reach); at the territory
 * shot, a scatter over the whole region, 12 px; between the two it eases in log range. A finger is
 * wider and less exact: 14 px on a phone at every height (its tap takes the nearest light within
 * 22 px). Round 57.6's density gap (half the old lattice gap, 8 to 15 px) went down to 9 px at the
 * boroughs, under the pointer's reach. */
export const CITY_GAP = 14;
export const TERRITORY_GAP = 12;
export const FINGER_GAP = 14;
export function densityGap(rangeMetres: number, narrow = false, cityGap = CITY_GAP): number {
  if (narrow) return FINGER_GAP;
  const city = cityGap >= 8 && cityGap <= 30 ? cityGap : CITY_GAP;
  const t = Math.min(1, Math.max(0, Math.log(rangeMetres / 60_000) / Math.log(120_000 / 60_000)));
  return Math.round(city + (TERRITORY_GAP - city) * t);
}

/** The county an area shot keeps its homes to (the others are not drawn there), or null. */
export function focusOf(name: ShotName): string | null {
  return (AREA_COUNTY_OF as Partial<Record<ShotName, string>>)[name] ?? null;
}

export const FLIGHT_SHOTS = FLIGHT;
