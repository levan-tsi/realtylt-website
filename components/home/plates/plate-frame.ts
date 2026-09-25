/** THE PLATES' ARITHMETIC (round 58, docs/parity/DESIGN-ROUND58.md §3), pure and tested: which
 * picture a window shows, how it is fitted, and how a home's place on the map lands on the window.
 *
 * A plate is one picture of the MapLibre night map at one camera, photographed once by
 * scripts/make-plates.mjs at the render's css size (the laptop's 1440 x 900, the phone's 390 x 844)
 * and recorded with the map's own pixel matrix for that camera (the matrix the live layer read every
 * frame in round 57.13, geo.ts `matrixFrame`). The page shows the plate `object-fit: cover`, centred,
 * so a window of another aspect sees the middle of the picture at the scale that fills it; a home is
 * projected by the recorded matrix into the render's pixels and then by that same fit into the
 * window's, so a light stands on its street on any screen. */
import { matrixFrame, projectMl, rangeForZoom, type MlCamera } from "../ml/geo";
import type { ShotName } from "../night/shots";

export type PlateAspect = "wide" | "tall";

export interface Plate {
  /** The render's css size. */
  w: number;
  h: number;
  /** The pixel widths the picture is served at, largest first (the render's density, then lower). */
  widths: readonly number[];
  /** The camera the map reported at the render (its centre clamped to the terrain: `elevation`). */
  cam: MlCamera;
  /** The terrain exaggeration the plate was drawn with (our homes' heights are lifted by it). */
  ex: number;
  /** The map's world size and 3D pixel matrix for that camera (geo.ts projectMl, kind "matrix"). */
  ws: number;
  m: readonly number[];
}

export type PlateManifest = Record<ShotName, Record<PlateAspect, Plate>>;

/** The tall picture under the page's `lg` breakpoint, the wide one from it (the same line the
 * page's own layout turns on, so the picture and the words agree). */
export const PLATE_BREAKPOINT = 1024;
export const aspectFor = (viewportWidth: number): PlateAspect => (viewportWidth >= PLATE_BREAKPOINT ? "wide" : "tall");
/** The media query the server-rendered `<picture>` uses for the same choice. */
export const TALL_MEDIA = `(max-width: ${PLATE_BREAKPOINT - 1}px)`;
export const WIDE_MEDIA = `(min-width: ${PLATE_BREAKPOINT}px)`;

export type PlateFormat = "avif" | "webp";

/** Where a plate's file lives (public/plates/, written by the script). */
export const plateSrc = (shot: ShotName, aspect: PlateAspect, width: number, format: PlateFormat) => `/plates/${shot}-${aspect}-${width}.${format}`;

/** The `srcset` for a plate in one format: every width with its descriptor, so the browser takes
 * the density its screen needs (`sizes` is the window: 100vw). */
export const plateSrcSet = (shot: ShotName, aspect: PlateAspect, plate: Pick<Plate, "widths">, format: PlateFormat) => plate.widths.map((w) => `${plateSrc(shot, aspect, w, format)} ${w}w`).join(", ");

/** `object-fit: cover`, centred: the scale from the plate's css pixels to the window's, and where
 * the plate's origin lands (negative when the plate overhangs). */
export interface CoverFit {
  s: number;
  ox: number;
  oy: number;
}
export function coverFit(plate: { w: number; h: number }, vp: { width: number; height: number }): CoverFit {
  const s = Math.max(vp.width / Math.max(1, plate.w), vp.height / Math.max(1, plate.h));
  return { s, ox: (vp.width - plate.w * s) / 2, oy: (vp.height - plate.h * s) / 2 };
}

export type Projector = (mx: number, my: number, h: number, out: { x: number; y: number; z: number }) => boolean;

/** A place (mercator x, y in 0..1 and its drawn height, metres) to the window's css pixels: the
 * recorded matrix, then the cover fit. False behind the eye. */
export function plateProjector(plate: Plate, fit: CoverFit): Projector {
  const f = matrixFrame(plate.m, plate.ws);
  return (mx, my, h, out) => {
    if (!projectMl(f, mx, my, h, out)) return false;
    out.x = out.x * fit.s + fit.ox;
    out.y = out.y * fit.s + fit.oy;
    return true;
  };
}

/** The eye's distance from the plate's centre as the window sees it, metres: the render's range
 * over the fit's scale (a window that enlarges the picture is a nearer eye), the number the glyph
 * and the light counts are tuned in (glyph.ts, cameras.ts). */
export function plateRange(plate: Plate, fit: CoverFit): number {
  return rangeForZoom(plate.cam.zoom, plate.cam.lat, plate.h, plate.cam.fov) / Math.max(1e-6, fit.s);
}

/** The window's part of the plate, in the plate's css pixels (what is on screen; a light outside it
 * is not drawn). */
export function visiblePlateRect(plate: { w: number; h: number }, fit: CoverFit, vp: { width: number; height: number }): { x: number; y: number; w: number; h: number } {
  return { x: -fit.ox / fit.s, y: -fit.oy / fit.s, w: vp.width / fit.s, h: vp.height / fit.s };
}
