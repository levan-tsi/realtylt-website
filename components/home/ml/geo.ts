/** THE MAPLIBRE NIGHT MAP'S CAMERA (round 57.12), as pure arithmetic: no DOM, no MapLibre, tested.
 *
 * MapLibre GL draws the world flat, in web mercator, and describes its camera by a CENTRE, a ZOOM
 * (the world is 512 * 2^zoom pixels wide), a PITCH (degrees off straight down), a BEARING (degrees
 * clockwise from north) and a vertical field of view. Google's 3D map, whose shots the page was
 * composed for (../g3d/cameras.ts), describes the same camera by a RANGE: the eye's distance to the
 * centre in metres. The two meet here: the eye stands `cameraToCenterDistance` pixels from the
 * centre (half the window's height over tan(fov / 2)), and a pixel is so many metres at the centre's
 * latitude, so a range is a zoom for a given window height and lens (`zoomForRange`).
 *
 * The projection rebuilds MapLibre's own mercator matrix (maplibre-gl 6.11,
 * MercatorTransform._calcMatrices: perspective, flip y, back off by the eye's distance, pitch,
 * bearing, the centre, metres to pixels in height, the centre's own elevation), written out as
 * vector steps. The page projects our homes with it for a camera the map is FLYING TO (the plan at a
 * flight's start); while the map draws, the layer reads the map's own matrix instead
 * (`matrixFrame`), and a probe measures the two against `map.project()`. */

/** The earth's circumference at the equator, metres (MapLibre's own constant). */
export const EARTH_C = 40_075_016.686;
const RAD = Math.PI / 180;
/** MapLibre's tile size: the world is TILE * 2^zoom pixels wide. */
const TILE = 512;

export const mercX = (lng: number) => (180 + lng) / 360;
export const mercY = (lat: number) => (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2))) / 360;

/** The camera as MapLibre holds it, plus the centre's elevation (metres, as drawn: exaggerated). */
export interface MlCamera {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
  /** Vertical field of view, degrees. */
  fov: number;
  elevation: number;
}

/** The eye's distance from the centre in pixels. */
const eyePx = (heightPx: number, fov: number) => (0.5 * heightPx) / Math.tan((fov * RAD) / 2);
const metresPerWorld = (lat: number) => EARTH_C * Math.cos(lat * RAD);

/** The zoom at which the eye stands `range` metres from the centre, in a window this tall. */
export function zoomForRange(range: number, lat: number, heightPx: number, fov: number): number {
  return Math.log2((eyePx(heightPx, fov) * metresPerWorld(lat)) / (TILE * range));
}

/** The eye's distance from the centre, metres (the range our glyph and light counts are tuned in). */
export function rangeForZoom(zoom: number, lat: number, heightPx: number, fov: number): number {
  return (eyePx(heightPx, fov) * metresPerWorld(lat)) / (TILE * 2 ** zoom);
}

/** A camera ready to project with: either our rebuilt steps or the map's own pixel matrix. */
export type MlFrame =
  | { kind: "steps"; ws: number; cx: number; cy: number; ppm: number; elev: number; cb: number; sb: number; cp: number; sp: number; d: number; hw: number; hh: number }
  | { kind: "matrix"; ws: number; m: ArrayLike<number> };

export function mlFrame(cam: MlCamera, vp: { width: number; height: number }): MlFrame {
  const ws = TILE * 2 ** cam.zoom;
  const b = cam.bearing * RAD, p = cam.pitch * RAD;
  return {
    kind: "steps",
    ws,
    cx: mercX(cam.lng) * ws,
    cy: mercY(cam.lat) * ws,
    ppm: ws / metresPerWorld(cam.lat),
    elev: cam.elevation,
    cb: Math.cos(b),
    sb: Math.sin(b),
    cp: Math.cos(p),
    sp: Math.sin(p),
    d: eyePx(vp.height, cam.fov),
    hw: vp.width / 2,
    hh: vp.height / 2,
  };
}

/** The map's own frame: its transform's 3D pixel matrix (world pixels and metres of height to
 * screen pixels, times w) and its world size. */
export const matrixFrame = (m: ArrayLike<number>, ws: number): MlFrame => ({ kind: "matrix", ws, m });

/** A place (mercator x, y in 0..1 and its height in metres as drawn) to css pixels, written into
 * `out` (z: its depth, larger is further); false if it is behind the eye. */
export function projectMl(f: MlFrame, mx: number, my: number, h: number, out: { x: number; y: number; z: number }): boolean {
  if (f.kind === "matrix") {
    const m = f.m, X = mx * f.ws, Y = my * f.ws;
    const w = m[3] * X + m[7] * Y + m[11] * h + m[15];
    if (w <= 1e-9) return false;
    out.x = (m[0] * X + m[4] * Y + m[8] * h + m[12]) / w;
    out.y = (m[1] * X + m[5] * Y + m[9] * h + m[13]) / w;
    out.z = w;
    return true;
  }
  const dx = mx * f.ws - f.cx, dy = my * f.ws - f.cy, dz = (h - f.elev) * f.ppm;
  const x1 = dx * f.cb + dy * f.sb;
  const y1 = -dx * f.sb + dy * f.cb;
  const y2 = y1 * f.cp - dz * f.sp;
  const zc = f.d - (y1 * f.sp + dz * f.cp);
  if (zc <= 1e-6) return false;
  out.x = f.hw + (f.d * x1) / zc;
  out.y = f.hh + (f.d * y2) / zc;
  out.z = zc;
  return true;
}
