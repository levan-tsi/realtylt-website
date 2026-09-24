/** THE SHOTS ON THE MAPLIBRE NIGHT MAP (round 57.12): the home page's six chapters and eleven
 * counties as MapLibre cameras.
 *
 * Kept from the Google map (../g3d/cameras.ts, rounds 1 to 11): WHAT each shot is of (the territory
 * from south of the harbour looking up the valley; every chapter and county a close picture of one
 * signature place, `SIGNATURE`, right of the list on a laptop, between the words on a phone) and the
 * lens (40 degrees on a laptop, 58 on a phone). Changed: a shot is written as a centre, a RANGE (the
 * eye's distance, metres), a pitch and a bearing, and turned into MapLibre's zoom for the window it
 * is shown in (./geo.ts zoomForRange), so a taller window sees the same ground, not more of it. The
 * pitch is 55 to 65 degrees everywhere (the brief): at the Google map's 40 to 50 the vector map is a
 * flat plan, tilted it is a place with a horizon.
 *
 * Numbers chosen by frames at both widths (scripts/_scratch-r57/12/, the record's round 12). */
import type { ShotName } from "../night/shots";
import { SIGNATURE, aspectMix } from "../g3d/cameras";
import { zoomForRange, type MlCamera } from "./geo";

export interface MlShot {
  lat: number;
  lng: number;
  /** Metres from the eye to the centre. */
  range: number;
  pitch: number;
  bearing: number;
}

const s = (lat: number, lng: number, range: number, pitch: number, bearing: number): MlShot => ({ lat, lng, range, pitch, bearing });

/** The lens, degrees of the window's height: the Google map's (../g3d/cameras.ts TUNED). */
export const LENS = { wide: 40, tall: 58 } as const;
export const MIN_PITCH = 55;
export const MAX_PITCH = 65;

export const ML_SHOTS: Record<ShotName, { wide: MlShot; tall: MlShot }> = {
  hero: { wide: s(41.0093, -74.3582, 145_000, 55, 8), tall: s(40.8319, -73.858, 156_000, 55, 340) },
  dutchess: { wide: s(41.7259, -73.964, 16_000, 60, 5), tall: s(41.71, -73.945, 16_000, 60, 5) },
  highlands: { wide: s(41.43, -73.975, 20_000, 60, 190), tall: s(41.43, -73.975, 20_000, 60, 190) },
  westchester: { wide: s(41.07, -73.895, 16_000, 60, 265), tall: s(41.07, -73.895, 16_000, 60, 265) },
  ulster: { wide: s(41.8884, -73.9953, 14_000, 60, 270), tall: s(41.9187, -73.9837, 14_000, 60, 270) },
  "dutchess-county": { wide: s(41.7318, -73.9307, 14_000, 60, 80), tall: s(41.7004, -73.935, 14_000, 60, 80) },
  orange: { wide: s(41.472, -74.0201, 14_000, 60, 270), tall: s(41.5023, -74.0086, 14_000, 60, 270) },
  putnam: { wide: s(41.4386, -73.7208, 14_000, 60, 0), tall: s(41.43, -73.6804, 14_000, 60, 0) },
  rockland: { wide: s(41.0778, -73.9561, 14_000, 60, 320), tall: s(41.0907, -73.9179, 14_000, 60, 320) },
  "westchester-county": { wide: s(40.9309, -73.8073, 12_000, 60, 30), tall: s(40.9115, -73.7824, 12_000, 60, 30) },
  bronx: { wide: s(40.8415, -73.9479, 9_000, 60, 20), tall: s(40.8296, -73.9262, 9_000, 60, 20) },
  manhattan: { wide: s(40.7885, -73.9894, 9_000, 60, 30), tall: s(40.774, -73.9708, 9_000, 60, 30) },
  queens: { wide: s(40.7593, -73.8689, 10_000, 60, 20), tall: s(40.7461, -73.8448, 10_000, 60, 20) },
  brooklyn: { wide: s(40.6586, -73.9986, 10_000, 60, 340), tall: s(40.6602, -73.969, 10_000, 60, 340) },
  "staten-island": { wide: s(40.6465, -74.109, 12_000, 60, 350), tall: s(40.6437, -74.0736, 12_000, 60, 350) },
  harbour: { wide: s(40.685, -74.03, 10_000, 60, 40), tall: s(40.682, -74.042, 10_000, 60, 40) },
  region: { wide: s(40.98, -73.98, 60_000, 55, 10), tall: s(40.98, -73.98, 60_000, 55, 10) },
};

export { SIGNATURE };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The lens for a window (portrait to landscape, blended as the shots are). */
export const lensFor = (vp: { width: number; height: number }) => lerp(LENS.tall, LENS.wide, aspectMix(vp.width / Math.max(1, vp.height)));

/** The shot in this window: the phone's and the laptop's blended by aspect, the range turned into a
 * zoom for this window's height and lens. `elevation`: the centre's height as drawn (the map clamps
 * its centre to the ground). */
export function mlShot(name: ShotName, vp: { width: number; height: number }, elevation = 0): MlCamera & { range: number } {
  const t = ML_SHOTS[name];
  const k = aspectMix(vp.width / Math.max(1, vp.height));
  const dh = ((((t.wide.bearing - t.tall.bearing) % 360) + 540) % 360) - 180;
  const lat = lerp(t.tall.lat, t.wide.lat, k), lng = lerp(t.tall.lng, t.wide.lng, k);
  const range = lerp(t.tall.range, t.wide.range, k);
  const fov = lensFor(vp);
  return {
    lat,
    lng,
    range,
    zoom: zoomForRange(range, lat, vp.height, fov),
    pitch: lerp(t.tall.pitch, t.wide.pitch, k),
    bearing: (((t.tall.bearing + dh * k) % 360) + 360) % 360,
    fov,
    elevation,
  };
}

/** A flight's duration: longer for a longer or higher journey (1.6 to 2.6 s, the Google map's). */
export function flightMs(a: { range: number; lat: number; lng: number }, b: { range: number; lat: number; lng: number }, min = 1600, max = 2600): number {
  const km = Math.hypot((a.lat - b.lat) * 111.13, (a.lng - b.lng) * 84.1);
  const alt = Math.abs(Math.log2(Math.max(1, a.range) / Math.max(1, b.range)));
  const k = Math.min(1, Math.max(km / 120, alt / 4));
  return Math.round(min + (max - min) * Math.sqrt(k));
}
