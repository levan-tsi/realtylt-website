/** THE REAL MAP'S CAMERA (round 56), as pure arithmetic: no DOM, no Google, testable.
 *
 * Google's 3D map (Map3DElement) describes its camera the way a person points one: a CENTER on
 * the ground (lat, lng, altitude in metres), a RANGE (metres from the eye to that center), a
 * TILT (degrees off straight down: 0 looks at the ground, 90 at the horizon) and a HEADING
 * (degrees clockwise from north, the way the eye faces). The night flight's shots (../night/shots.ts)
 * are written in its own world kilometres as an eye position and a target. This module turns one
 * into the other, and it projects a longitude and latitude to a pixel for a given camera, which
 * is what the page needs for the two things the API does not give it: which of our homes are on
 * screen and far enough apart to draw (thinning), and which one the pointer is over (hover).
 *
 * Measured in Chrome, maps API 3.66 (scripts/_scratch-r56-exp.mjs): after a flight the element
 * reports its camera with RANGE 0 and the CENTER at the eye itself, altitude and all. Both forms
 * describe the same camera: the eye is always `center - range * forward`, so everything here goes
 * through the eye and works for either.
 *
 * The earth is the WGS84 ellipsoid, in earth-centred coordinates, so a camera 140 km from its
 * target still projects to the pixel (the curvature over 140 km is 1.5 km of drop, which a flat
 * approximation would put tens of pixels wrong). Heights are above the ellipsoid; the ground in
 * this region is 30 m below it at sea level (geoid) to a few hundred metres above it in the
 * Highlands, which moves a projected home by a pixel or two at the ranges the page flies. */
import { EXAGGERATION, lngLatToWorld, worldToLngLat } from "../night/world";
import { MOON, type Framing } from "../night/shots";

export interface LatLngAlt {
  lat: number;
  lng: number;
  altitude: number;
}

/** The camera as Map3DElement takes it (`flyCameraTo({ endCamera })`, or the element's own
 * properties). */
export interface MapCamera {
  center: LatLngAlt;
  /** Metres from the eye to the center. */
  range: number;
  /** Degrees off straight down. */
  tilt: number;
  /** Degrees clockwise from north. */
  heading: number;
}

type V3 = [number, number, number];

const A = 6378137;
const E2 = 6.69437999014e-3;
const RAD = Math.PI / 180;

export function toEcef(lat: number, lng: number, h = 0): V3 {
  const p = lat * RAD, l = lng * RAD;
  const s = Math.sin(p), c = Math.cos(p);
  const n = A / Math.sqrt(1 - E2 * s * s);
  return [(n + h) * c * Math.cos(l), (n + h) * c * Math.sin(l), (n * (1 - E2) + h) * s];
}

/** East, north and up at a place, in earth-centred coordinates. */
function enu(lat: number, lng: number): { e: V3; n: V3; u: V3 } {
  const p = lat * RAD, l = lng * RAD;
  const sp = Math.sin(p), cp = Math.cos(p), sl = Math.sin(l), cl = Math.cos(l);
  return { e: [-sl, cl, 0], n: [-sp * cl, -sp * sl, cp], u: [cp * cl, cp * sl, sp] };
}

const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The camera's eye and its three axes (right, up, forward), in earth-centred metres. */
export interface CameraFrame {
  eye: V3;
  right: V3;
  up: V3;
  forward: V3;
}

export function cameraFrame(cam: MapCamera): CameraFrame {
  const { e, n, u } = enu(cam.center.lat, cam.center.lng);
  const t = cam.tilt * RAD, h = cam.heading * RAD;
  const along: V3 = add(add([0, 0, 0], e, Math.sin(h)), n, Math.cos(h));
  const forward = add(add([0, 0, 0], along, Math.sin(t)), u, -Math.cos(t));
  const right = add(add([0, 0, 0], e, Math.cos(h)), n, -Math.sin(h));
  const up = cross(right, forward);
  const c = toEcef(cam.center.lat, cam.center.lng, cam.center.altitude);
  return { eye: add(c, forward, -cam.range), right, up, forward };
}

/** How the element's `fov` reads, measured by projecting known markers on the live map
 * (scripts/_scratch-r56-proj.mjs): the angle spans the window's HEIGHT. */
export type Viewport = { width: number; height: number; fov: number };

/** A place to the window's pixels (css px, top left 0,0), or null if it is behind the eye. */
export function projectWith(frame: CameraFrame, vp: Viewport, lat: number, lng: number, alt = 0): { x: number; y: number; depth: number } | null {
  const p = toEcef(lat, lng, alt);
  const d: V3 = [p[0] - frame.eye[0], p[1] - frame.eye[1], p[2] - frame.eye[2]];
  const z = dot(d, frame.forward);
  if (z <= 1) return null;
  const f = vp.height / 2 / Math.tan((vp.fov * RAD) / 2);
  return { x: vp.width / 2 + (dot(d, frame.right) / z) * f, y: vp.height / 2 - (dot(d, frame.up) / z) * f, depth: z };
}

export function project(cam: MapCamera, vp: Viewport, lat: number, lng: number, alt = 0) {
  return projectWith(cameraFrame(cam), vp, lat, lng, alt);
}

/** The same camera written the other way: the eye itself as the center, range 0. The element
 * reports this form after a flight; converting both to it makes two cameras comparable. */
export function eyeOf(cam: MapCamera): LatLngAlt {
  const { eye } = cameraFrame(cam);
  return fromEcef(eye);
}

export function fromEcef([x, y, z]: V3): LatLngAlt {
  // Bowring's method, one iteration is sub-millimetre at these heights.
  const b = A * Math.sqrt(1 - E2);
  const ep2 = (A * A - b * b) / (b * b);
  const p = Math.hypot(x, y);
  const th = Math.atan2(z * A, p * b);
  const lat = Math.atan2(z + ep2 * b * Math.sin(th) ** 3, p - E2 * A * Math.cos(th) ** 3);
  const lng = Math.atan2(y, x);
  const n = A / Math.sqrt(1 - E2 * Math.sin(lat) ** 2);
  return { lat: lat / RAD, lng: lng / RAD, altitude: p / Math.cos(lat) - n };
}

/** A night-flight framing (world km: x east, z south, y up; the eye's height plain, the target's
 * height on the 6x-lifted terrain) as Google's camera: centered on the target, the range the eye's
 * true distance, the tilt and heading the direction it looks. The field of view is Google's own. */
export function framingToCamera(f: Framing): MapCamera {
  const [tx, ty, tz] = f.target;
  const [px, py, pz] = f.pos;
  const targetKm = ty / EXAGGERATION;
  const east = tx - px, north = -(tz - pz);
  const ground = Math.hypot(east, north);
  const drop = py - targetKm;
  const [lng, lat] = worldToLngLat(tx, tz);
  return {
    center: { lat, lng, altitude: Math.round(targetKm * 1000) },
    range: Math.round(Math.hypot(ground, drop) * 1000),
    tilt: round2(Math.atan2(ground, drop) / RAD),
    heading: round2(((Math.atan2(east, north) / RAD) % 360 + 360) % 360),
  };
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/** The inverse of framingToCamera (round 57): a map camera as a night-flight framing, so our poster
 * (scripts/make-night-poster.mjs, the night scene's still) is shot from the map's own hero camera
 * and the dissolve from the poster to the map does not also change the composition. The night
 * world is flat; at the hero's 145 km the earth's curve moves the far edge by a few pixels. */
export function cameraToFraming(cam: MapCamera, fov: number, moon: [number, number] = MOON): Framing {
  const [tx, , tz] = lngLatToWorld(cam.center.lng, cam.center.lat);
  const targetKm = cam.center.altitude / 1000;
  const km = cam.range / 1000;
  const t = (cam.tilt * Math.PI) / 180, h = (cam.heading * Math.PI) / 180;
  const ground = km * Math.sin(t), drop = km * Math.cos(t);
  const east = ground * Math.sin(h), north = ground * Math.cos(h);
  return { pos: [tx - east, targetKm + drop, tz + north], target: [tx, targetKm * EXAGGERATION, tz], fov, moon };
}

/** The short way round between two headings, in degrees (-180..180]. */
export function headingDelta(a: number, b: number): number {
  const d = (((b - a) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

/** A flight's length, for its duration: how far the eye travels (km) and how far it turns. */
export function flightMillis(a: MapCamera, b: MapCamera, min = 1600, max = 2600): number {
  const ea = toEcef(eyeOf(a).lat, eyeOf(a).lng, eyeOf(a).altitude);
  const eb = toEcef(eyeOf(b).lat, eyeOf(b).lng, eyeOf(b).altitude);
  const km = Math.hypot(ea[0] - eb[0], ea[1] - eb[1], ea[2] - eb[2]) / 1000;
  const turn = Math.abs(headingDelta(a.heading, b.heading));
  // 0 km -> min; ~120 km or a half turn -> max.
  const k = Math.min(1, Math.max(km / 120, turn / 180));
  return Math.round(min + (max - min) * Math.sqrt(k));
}
