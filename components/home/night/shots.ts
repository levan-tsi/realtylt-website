/** The night flight's camera SHOTS, as data, and the pure function that flies between them.
 *
 * A shot is where the camera is, what it looks at, and its vertical field of view, in world
 * kilometres (./world.ts), written as "over this place, at this height". Every shot has two
 * framings: `wide` for a landscape window and `tall` for a portrait phone, where the page puts its
 * words at the top and the bottom and the scene has to hold the middle. `framingFor` blends the two
 * by aspect ratio, so a window being resized never jumps.
 *
 * `blendFramings(a, b, t)` is the flight: eased (smootherstep, so a scrubbed flight starts and
 * lands without a jolt), and ARCED: the camera rises in proportion to how far it travels and comes
 * back down, the way an aircraft climbs out and descends, so a long flight never skims the ridges
 * between two shots. With a `ground` function it is also clamped above the terrain. */
import { COUNTY_BOUNDS } from "@/components/idx/county-bounds";
import { over, type Vec3 } from "./world";

export interface Framing {
  pos: Vec3;
  target: Vec3;
  /** Vertical field of view, degrees. */
  fov: number;
  /** Where the moon stands for this shot, [azimuth clockwise from north, altitude], degrees: the
   * light that models the land. A flight carries it across, so the ridges catch it as we pass. */
  moon: [number, number];
}

export interface Shot {
  wide: Framing;
  tall: Framing;
}

/** The home page's chapters, in the order the page flies them. */
export const FLIGHT = ["hero", "dutchess", "highlands", "westchester", "harbour", "region"] as const;
/** The "where we work" chapter: county by county, then the boroughs. */
export const AREA_FLIGHT = [
  "ulster",
  "dutchess-county",
  "orange",
  "putnam",
  "rockland",
  "westchester-county",
  "bronx",
  "manhattan",
  "queens",
  "brooklyn",
  "staten-island",
] as const;
export type FlightShot = (typeof FLIGHT)[number];
export type AreaShot = (typeof AREA_FLIGHT)[number];
export type ShotName = FlightShot | AreaShot;

/** The moon most shots use: low in the west-south-west, so the valley's north-south ridges are
 * lit on one flank and shadowed on the other as the camera looks up the river. */
export const MOON: [number, number] = [250, 24];
const f = (pos: Vec3, target: Vec3, fov: number, moon: [number, number] = MOON): Framing => ({ pos, target, fov, moon });

/** The named chapters. Places are [longitude, latitude]; heights are world km (the terrain is
 * lifted 6x, so the Highlands' 400 m ridges stand ~2.4 km tall and the Catskills ~7.5 km). */
export const CHAPTERS: Record<FlightShot, Shot> = {
  // Establishing: high over the ocean south of the harbour, looking north up the valley. The whole
  // region is one shape of light floating in the dark, the way /ai opens on its galaxy: the boroughs
  // burn in the foreground with the city's own glow over them, the river is the black ribbon up the
  // middle, and the lower left (New Jersey: land, no listings, so no lights) takes the headline.
  hero: {
    wide: f(over(-73.95, 40.0, 55), over(-74.03, 41.2, 0), 40),
    tall: f(over(-73.97, 39.98, 62), over(-74.02, 41.15, 0), 58),
  },
  // Up the river to Dutchess: high over Newburgh Bay, looking up the valley. The Hudson runs up the
  // middle of the frame as a black thread with a lit shore, Poughkeepsie burns to the right of it
  // (Lagrangeville, the office, beyond), and the left of the frame stays dark for the page's words.
  // (Round 54 builder 2: the old shot stood at 8 km, where a 20 m contour is a white rope across the
  // whole frame and the homes disappeared between the ropes. Raised, the light leads.)
  dutchess: {
    wide: f(over(-73.95, 41.32, 18), over(-73.92, 41.72, 0), 40),
    tall: f(over(-73.95, 41.26, 23), over(-73.93, 41.76, 0), 58),
  },
  // Into the Highlands: from over Newburgh Bay looking SOUTH down the gorge. The river leaves the
  // burning bend at Peekskill as a black ribbon and threads between Storm King, Breakneck and Bear
  // Mountain, which stand as dark masses against the light beyond them: the one shot on the page
  // where a ridge is a silhouette. (Looking north up the gorge, tried at five heights, gave a field
  // of contour lines and no subject.)
  highlands: {
    wide: f(over(-73.94, 41.62, 16), over(-73.95, 41.2, 0.3), 40),
    tall: f(over(-73.94, 41.7, 21), over(-73.95, 41.16, 0.3), 58),
  },
  // Westchester and Rockland across the Tappan Zee, from over the Sound looking west: the river a
  // wide black band cut diagonally through the frame with Yonkers' lights along its near shore and
  // Rockland's beyond, and the top left dark.
  westchester: {
    wide: f(over(-73.6, 41.12, 16), over(-73.95, 41.05, 0), 42),
    tall: f(over(-73.54, 41.14, 21), over(-73.95, 41.03, 0), 60),
  },
  // The harbour: over the Upper Bay, looking up Manhattan. The densest light on the map.
  harbour: {
    wide: f(over(-74.1, 40.55, 8), over(-73.96, 40.75, 0), 44),
    tall: f(over(-74.07, 40.5, 11), over(-73.97, 40.74, 0), 64),
  },
  // The whole region from high above the ocean: where the page ends, the way it began, higher.
  region: {
    wide: f(over(-74.1, 40.0, 140), over(-74.1, 41.3, 0), 40),
    tall: f(over(-74.13, 40.28, 212), over(-74.13, 41.28, 0), 56),
  },
};

/** Each area shot's county, by the feed's slug (lights.ts COUNTY_SLUGS; scene setFocus). */
export const AREA_COUNTY_OF: Record<AreaShot, keyof typeof COUNTY_BOUNDS> = {
  ulster: "ulster",
  "dutchess-county": "dutchess",
  orange: "orange",
  putnam: "putnam",
  rockland: "rockland",
  "westchester-county": "westchester",
  bronx: "bronx",
  manhattan: "manhattan",
  queens: "queens",
  brooklyn: "brooklyn",
  "staten-island": "staten-island",
};

/** How far the area shots lean off vertical, degrees: 40 is high enough that a county reads as its
 * own shape of light (the way the hero reads the region) and tilted enough that the land still has
 * relief. A low oblique turns a county into a field of contour lines. */
export const AREA_TILT = 40;
/** Never closer than this, so a small borough is a borough and not a street. */
export const AREA_MIN_KM = 15;

/** A county or borough as its own SHAPE OF LIGHT: the camera stands high above it, AREA_TILT off
 * vertical, south of it, far enough back that the area's extent fills `fill` of the frame. The
 * extent it is given is where the HOMES are (lights.ts countyLightBoxes), falling back to the
 * listings' bounding box before the lights have loaded. */
export function areaShot(b: { south: number; north: number; west: number; east: number }, opts?: { tilt?: number }): Shot {
  const tilt = ((opts?.tilt ?? AREA_TILT) * Math.PI) / 180;
  const lng = (b.west + b.east) / 2, lat = (b.south + b.north) / 2;
  const wKm = (b.east - b.west) * 83.594, hKm = (b.north - b.south) * 111.132;
  const frame = (fovDeg: number, aspect: number, fillV: number, fillH: number): Framing => {
    const fovV = (fovDeg * Math.PI) / 180;
    const fovH = 2 * Math.atan(aspect * Math.tan(fovV / 2));
    // The north-south extent is foreshortened by the lean; the east-west extent is not.
    const d = Math.max(AREA_MIN_KM, (hKm * Math.cos(tilt)) / (fillV * fovV), wKm / (fillH * fovH));
    return f(over(lng, lat - (d * Math.sin(tilt)) / 111.132, d * Math.cos(tilt)), over(lng, lat, 0), fovDeg);
  };
  // A phone's frame is narrow: a broad county is allowed to run past its sides rather than shrink
  // into a thin band across the middle of it.
  return { wide: frame(40, 1440 / 900, 0.78, 0.78), tall: frame(56, 390 / 844, 0.74, 1.15) };
}

/** The area shots from the listings' bounding boxes: what the scene flies before the lights have
 * loaded, and what the tests measure. The scene refines them from the lights themselves. */
export const AREA_SHOTS: Record<AreaShot, Shot> = Object.fromEntries(AREA_FLIGHT.map((a) => [a, areaShot(COUNTY_BOUNDS[AREA_COUNTY_OF[a]])])) as Record<AreaShot, Shot>;

export const SHOTS: Record<ShotName, Shot> = { ...CHAPTERS, ...AREA_SHOTS };

// ---- the maths ---------------------------------------------------------------------------------

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
/** 6t^5 - 15t^4 + 10t^3: zero velocity AND acceleration at both ends. */
export const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** Azimuth the short way round, altitude straight. */
function lerpMoon(a: [number, number], b: [number, number], t: number): [number, number] {
  const d = ((((b[0] - a[0]) % 360) + 540) % 360) - 180;
  return [(a[0] + d * t + 360) % 360, lerp(a[1], b[1], t)];
}

const copyFraming = (f: Framing): Framing => ({ pos: [...f.pos], target: [...f.target], fov: f.fov, moon: [f.moon[0], f.moon[1]] });

/** Portrait below 0.62, landscape above 1.0, blended between. */
export function framingFor(shot: Shot, aspect: number): Framing {
  const k = smootherstep((aspect - 0.62) / (1.0 - 0.62));
  return {
    pos: lerp3(shot.tall.pos, shot.wide.pos, k),
    target: lerp3(shot.tall.target, shot.wide.target, k),
    fov: lerp(shot.tall.fov, shot.wide.fov, k),
    moon: lerpMoon(shot.tall.moon, shot.wide.moon, k),
  };
}

/** How much a flight climbs, per kilometre it travels over the ground. */
export const ARC_PER_KM = 0.16;
/** The least height above the terrain the camera is ever allowed, in world km. */
export const CLEARANCE_KM = 0.6;

/** The flight from `a` to `b` at t in 0..1. Endpoints are exact; the ground position and the field
 * of view move monotonically; height arcs up by ARC_PER_KM of the ground travelled, peaking
 * mid-flight. `ground(x, z)` (world height of the terrain) keeps the camera CLEARANCE_KM above it. */
export function blendFramings(a: Framing, b: Framing, t: number, ground?: (x: number, z: number) => number): Framing {
  const e = smootherstep(t);
  if (e <= 0) return copyFraming(a);
  if (e >= 1) return copyFraming(b);
  const pos = lerp3(a.pos, b.pos, e);
  const travel = Math.hypot(b.pos[0] - a.pos[0], b.pos[2] - a.pos[2]);
  pos[1] += ARC_PER_KM * travel * Math.sin(Math.PI * e);
  if (ground && e > 0 && e < 1) pos[1] = Math.max(pos[1], ground(pos[0], pos[2]) + CLEARANCE_KM);
  return { pos, target: lerp3(a.target, b.target, e), fov: lerp(a.fov, b.fov, e), moon: lerpMoon(a.moon, b.moon, e) };
}

/** A position along a sequence of framings: s = 0 is the first, s = n - 1 the last; each whole
 * step is one flight. */
export function sequenceFraming(frames: readonly Framing[], s: number, ground?: (x: number, z: number) => number): Framing {
  const n = frames.length;
  if (n === 1) return frames[0];
  const c = Math.min(n - 1, Math.max(0, s));
  const i = Math.min(n - 2, Math.floor(c));
  return blendFramings(frames[i], frames[i + 1], c - i, ground);
}
