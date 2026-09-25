/** THE FLIGHT'S CAMERA PATH (round 59, docs/parity/DESIGN-ROUND59.md §3), pure and tested: the camera
 * of a MapLibre `flyTo` at any point of the flight, so a flight can be recorded frame by frame
 * offline (scripts/make-flights.mjs) and played back as a film with our lights drawn from each
 * frame's own matrix (./plate-controller.ts).
 *
 * A port of maplibre-gl 6.11's `Camera.flyTo` (src/ui/camera.ts) and the mercator helper's
 * `handleFlyTo` (src/geo/projection/mercator_camera_helper.ts): van Wijk and Nuij's optimal path,
 * "Smooth and efficient zooming and panning" (INFOVIS 2003). `rho` is the `curve` the live
 * controller passed (1.3, ../ml/controller.ts `go`); `w0` the window's larger side; `w1` the same
 * span at the target zoom; `u1` the path's length in world pixels at the start zoom. The zoom is
 * `startZoom + log2(1 / w(s))`, the centre moves along the straight mercator line by `u(s)`, the
 * pitch, the bearing (the shorter way round) and the centre's height change linearly in k, and
 * k is MapLibre's default easing, `bezier(0.25, 0.1, 0.25, 1)`, of the clock.
 *
 * At k = 0 the camera IS the start and at k = 1 it IS the target (both returned exactly, so the
 * film's first and last frames are the plates' own cameras). No imports: the recorder runs this file
 * in node directly (`--experimental-strip-types`). */

export interface PathCam {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
  /** The centre's height as drawn (metres, the map's `transform.elevation`). */
  elevation: number;
}

/** MapLibre's world: 512 * 2^zoom pixels wide (the same constant as ../ml/geo.ts). */
const TILE = 512;
const RAD = Math.PI / 180;

/** @mapbox/unitbezier, as maplibre-gl's `bezier()` uses it. */
export function bezier(p1x: number, p1y: number, p2x: number, p2y: number): (t: number) => number {
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solveX = (x: number, eps = 1e-6) => {
    if (x < 0) return 0;
    if (x > 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const x2 = sx(t) - x;
      if (Math.abs(x2) < eps) return t;
      const d2 = dx(t);
      if (Math.abs(d2) < 1e-6) break;
      t -= x2 / d2;
    }
    let t0 = 0, t1 = 1;
    t = x;
    for (let i = 0; i < 20; i++) {
      const x2 = sx(t);
      if (Math.abs(x2 - x) < eps) break;
      if (x > x2) t0 = t;
      else t1 = t;
      t = (t1 - t0) * 0.5 + t0;
    }
    return t;
  };
  return (t: number) => sy(solveX(t));
}

/** MapLibre's default easing (util.ts `defaultEasing`). */
export const defaultEasing = bezier(0.25, 0.1, 0.25, 1);

const wrap180 = (b: number) => {
  const w = (((b + 180) % 360) + 360) % 360 - 180;
  return w === -180 ? 180 : w;
};

/** The target bearing taken the shorter way round from the start (camera.ts `_normalizeBearing`). */
export function normalizeBearing(bearing: number, from: number): number {
  let b = wrap180(bearing);
  const diff = Math.abs(b - from);
  if (Math.abs(b - 360 - from) < diff) b -= 360;
  if (Math.abs(b + 360 - from) < diff) b += 360;
  return b;
}

const mx = (lng: number) => (180 + lng) / 360;
const my = (lat: number) => (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2))) / 360;
const lngOf = (x: number) => x * 360 - 180;
const latOf = (y: number) => (360 / Math.PI) * Math.atan(Math.exp(((180 - y * 360) * Math.PI) / 180)) - 90;

/** The camera at k (0..1, already eased) of the flight from `a` to `b` in a window this size. */
export function flightPath(a: PathCam, b: PathCam, view: { width: number; height: number }, curve = 1.3, minZoom = 0): (k: number) => PathCam {
  const ws0 = TILE * 2 ** a.zoom;
  const fx = mx(a.lng) * ws0, fy = my(a.lat) * ws0;
  const dxw = mx(b.lng) * ws0 - fx, dyw = my(b.lat) * ws0 - fy;
  const u1 = Math.hypot(dxw, dyw);
  const w0 = Math.max(view.width, view.height);
  const w1 = w0 / 2 ** (b.zoom - a.zoom);
  const lowest = Math.min(minZoom, a.zoom, b.zoom);
  const wMax = w0 / 2 ** (lowest - a.zoom);
  const rho = Math.min(curve, Math.sqrt((wMax / u1) * 2));
  const rho2 = rho * rho;
  const zoomOut = (descent: boolean) => {
    const q = (w1 * w1 - w0 * w0 + (descent ? -1 : 1) * rho2 * rho2 * u1 * u1) / (2 * (descent ? w1 : w0) * rho2 * u1);
    return Math.log(Math.sqrt(q * q + 1) - q);
  };
  const r0 = zoomOut(false);
  let w = (s: number) => Math.cosh(r0) / Math.cosh(r0 + rho * s);
  let u = (s: number) => (w0 * ((Math.cosh(r0) * Math.tanh(r0 + rho * s) - Math.sinh(r0)) / rho2)) / u1;
  let S = (zoomOut(true) - r0) / rho;
  let linearZoom = false;
  if (Math.abs(u1) < 0.000002 || !isFinite(S)) {
    if (Math.abs(w0 - w1) < 0.000001) linearZoom = true;
    else {
      const sign = w1 < w0 ? -1 : 1;
      S = Math.abs(Math.log(w1 / w0)) / rho;
      u = () => 0;
      w = (s) => Math.exp(sign * rho * s);
    }
  }
  const bearing = normalizeBearing(b.bearing, a.bearing);
  return (k: number): PathCam => {
    if (k <= 0) return { ...a };
    if (k >= 1) return { ...b };
    const lerp = (x: number, y: number) => x + (y - x) * k;
    let zoom: number, cx: number, cy: number;
    if (linearZoom) {
      zoom = lerp(a.zoom, b.zoom);
      cx = fx + dxw * k;
      cy = fy + dyw * k;
    } else {
      const s = k * S;
      zoom = a.zoom + Math.log2(1 / w(s));
      const f = u(s);
      cx = fx + dxw * f;
      cy = fy + dyw * f;
    }
    return { lng: lngOf(cx / ws0), lat: latOf(cy / ws0), zoom, pitch: lerp(a.pitch, b.pitch), bearing: wrap180(lerp(a.bearing, bearing)), elevation: lerp(a.elevation, b.elevation) };
  };
}

/** The frames of a recorded flight: n + 1 of them (0 and n are the two plates), frame i at the
 * clock i / n, eased. */
export function flightFrames(a: PathCam, b: PathCam, view: { width: number; height: number }, n: number, curve = 1.3): { i: number; k: number; cam: PathCam }[] {
  const at = flightPath(a, b, view, curve);
  const out: { i: number; k: number; cam: PathCam }[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i === 0 ? 0 : i === n ? 1 : defaultEasing(i / n);
    out.push({ i, k, cam: at(k) });
  }
  return out;
}

/** The frame of a clip a presented video frame shows: its media time at the clip's rate, rounded
 * (the container's timestamps are whole milliseconds), inside 0..n. */
export function frameAt(mediaTime: number, fps: number, n: number): number {
  const i = Math.round(mediaTime * fps);
  return i < 0 ? 0 : i > n ? n : i;
}
