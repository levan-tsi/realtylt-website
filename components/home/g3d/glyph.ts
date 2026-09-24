/** THE HOME'S LIGHT (round 57.6): drawn by us on a canvas over the night-graded map
 * (light-layer.ts), and by the cover script into the load cover (scripts/make-map-cover.mjs), from
 * the SAME numbers here, so the cover's lights and the live ones are the same lights.
 *
 * The light is two things added onto the ground (additive, "lighter"): a small warm-white CORE and
 * a soft warm HALO around it, one hue, no ring (round 56's dark ring was for daylight imagery; on
 * the night grade a light needs no outline). It stands centred ON the home, not above it (the
 * Google marker it replaces anchored its image's bottom edge on the home).
 *
 * SIZE FOLLOWS RANGE, CONTINUOUSLY (the owner: "smooth transitions"). Round 57.2 drew three tiers
 * because a marker's image was fixed once drawn and a change of tier re-added it, which popped.
 * On our canvas the glyph is redrawn every frame of a flight, so its core, halo and halo strength
 * are read from the live range between a few anchors, in log range: the tiers are EASED, the light
 * grows as the camera comes down, never in a step. The anchors keep round 57.2's rule (points at
 * the territory's height, fuller close in), re-tuned by frames on the dark ground
 * (scripts/_scratch-r57/6/), where a light reads with far less size than it needed on daylight. */

export interface Glyph {
  /** The core's radius, css px (the bright point). */
  core: number;
  /** The halo's radius, css px (where the glow reaches nothing). */
  halo: number;
  /** The halo's strength at its centre, 0..1. */
  haloAlpha: number;
}

type Anchor = readonly [range: number, glyph: Glyph];

/** A laptop's lights by range (metres). */
export const WIDE_ANCHORS: readonly Anchor[] = [
  [3_000, { core: 2.6, halo: 13, haloAlpha: 0.56 }],
  [25_000, { core: 2.25, halo: 10.5, haloAlpha: 0.54 }],
  [60_000, { core: 2.05, halo: 9.5, haloAlpha: 0.54 }],
  [145_000, { core: 1.9, halo: 9, haloAlpha: 0.54 }],
];

/** A phone's (round 57.3: the phone's territory lights were faint beside its words, so its far
 * lights are a touch larger and stronger; closer in the two meet). */
export const NARROW_ANCHORS: readonly Anchor[] = [
  [3_000, { core: 2.6, halo: 13, haloAlpha: 0.56 }],
  [25_000, { core: 2.35, halo: 11, haloAlpha: 0.58 }],
  [60_000, { core: 2.25, halo: 10.5, haloAlpha: 0.6 }],
  [156_000, { core: 2.2, halo: 10, haloAlpha: 0.62 }],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The light for a camera this far from its centre: interpolated in log range between the
 * anchors, held at the ends. */
export function glyphAt(rangeMetres: number, opts: { narrow?: boolean } = {}): Glyph {
  const A = opts.narrow ? NARROW_ANCHORS : WIDE_ANCHORS;
  const r = Math.max(1, rangeMetres);
  if (r <= A[0][0]) return A[0][1];
  const last = A[A.length - 1];
  if (r >= last[0]) return last[1];
  let k = 1;
  while (A[k][0] < r) k++;
  const [r0, g0] = A[k - 1], [r1, g1] = A[k];
  const t = Math.log(r / r0) / Math.log(r1 / r0);
  return { core: lerp(g0.core, g1.core, t), halo: lerp(g0.halo, g1.halo, t), haloAlpha: lerp(g0.haloAlpha, g1.haloAlpha, t) };
}

/** THE LIGHT ANSWERS (round 57.3, now on the canvas): the hovered light, or the featured home whose
 * card has focus, `k` of the way lit (0..1, eased by the layer over LIT_MS): the core half again as
 * large and pure white, the halo wider and stronger. Same centre, so it brightens in place. */
export function litGlyph(g: Glyph, k: number): Glyph {
  if (k <= 0) return g;
  return { core: g.core * (1 + 0.6 * k), halo: g.halo * (1 + 0.45 * k), haloAlpha: Math.min(0.95, g.haloAlpha * (1 + 0.9 * k)) };
}

/** The featured homes (the rails' cards): a touch larger than the rest at every range, so they are
 * found. */
export function featuredGlyph(g: Glyph): Glyph {
  return { core: g.core + 0.6, halo: g.halo * 1.2, haloAlpha: Math.min(0.9, g.haloAlpha + 0.08) };
}

/** How long the lit light takes to come up and go down (the label's own 120 / 160 ms). */
export const LIT_MS = 140;

/** The light's two colours, sRGB 0..255: the core warm white, the halo the same warmth deeper. One
 * hue (the site's warm-white lights), no other. */
export const CORE_RGB = [255, 248, 236] as const;
export const HALO_RGB = [255, 212, 158] as const;
export const LIT_RGB = [255, 255, 255] as const;

/** The core's coverage at `u` = distance / core radius: solid to 55 %, then a soft edge (so a
 * 1.5 px core is a point, not a hard dot). */
export function coreProfile(u: number): number {
  if (u >= 1) return 0;
  if (u <= 0.55) return 1;
  const t = (1 - u) / 0.45;
  return t * t * (3 - 2 * t);
}

/** The halo's strength at `u` = distance / halo radius: a smooth hill, gone at the edge. */
export function haloProfile(u: number): number {
  if (u >= 1) return 0;
  const s = 1 - u * u;
  return s * s * s;
}

/** What one light adds to a pixel `d` css px from its centre, sRGB 0..255 (the cover script sums
 * this; the canvas draws the same two profiles as sprites with "lighter"). */
export function glyphAdd(g: Glyph, d: number, alpha = 1, core: readonly number[] = CORE_RGB): [number, number, number] {
  const c = coreProfile(d / g.core) * alpha;
  const h = haloProfile(d / g.halo) * g.haloAlpha * alpha;
  return [core[0] * c + HALO_RGB[0] * h, core[1] * c + HALO_RGB[1] * h, core[2] * c + HALO_RGB[2] * h];
}
