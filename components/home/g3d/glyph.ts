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
  /** THE NEIGHBOURHOOD GLOW (round 57.8): a wide, soft, faint warm halo, its radius in css px. */
  glow: number;
  /** Its strength at the centre, 0..1 (0.08 to 0.18: many overlap into one warm ground). */
  glowAlpha: number;
}

type Anchor = readonly [range: number, glyph: Omit<Glyph, "glowAlpha">];

/** A laptop's lights by range (metres). Round 57.8: with three to four times the lights, 12 to 16
 * px apart, round 57.6's near halo (9 to 13 px at 0.54) would sum into a blob, so it tightens to a
 * bloom that makes the point read (6 to 8 px), and the reach moves to the GLOW: 20 px at the
 * territory to 32 px close in (about one and a half times the gap: the first build's 31 px at
 * Queens, 16 px apart, summed into a flat tan blanket), faint, so the glows of a street's homes overlap into lamplight on
 * the ground while each core still stands on its own. */
export const WIDE_ANCHORS: readonly Anchor[] = [
  [3_000, { core: 2.6, halo: 8, haloAlpha: 0.5, glow: 32 }],
  [25_000, { core: 2.25, halo: 7, haloAlpha: 0.5, glow: 26 }],
  [60_000, { core: 2.05, halo: 6.5, haloAlpha: 0.5, glow: 24 }],
  [145_000, { core: 1.9, halo: 6, haloAlpha: 0.5, glow: 20 }],
];

/** A phone's (round 57.3: the phone's territory lights were faint beside its words, so its far
 * lights are a touch larger and stronger; closer in the two meet). */
export const NARROW_ANCHORS: readonly Anchor[] = [
  [3_000, { core: 2.6, halo: 8, haloAlpha: 0.52, glow: 30 }],
  [25_000, { core: 2.35, halo: 7.5, haloAlpha: 0.54, glow: 24 }],
  [60_000, { core: 2.25, halo: 7, haloAlpha: 0.56, glow: 22 }],
  [156_000, { core: 2.2, halo: 6.5, haloAlpha: 0.58, glow: 22 }],
];

/** The glow's strength (chosen by frames at three strengths, 0.08 / 0.12 / 0.18, record §7 round 8;
 * the page's `?glow=` compares). */
export const GLOW_ALPHA = 0.12;
const GLOW_MIN = 0.08;
const GLOW_MAX = 0.18;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The light for a camera this far from its centre: interpolated in log range between the
 * anchors, held at the ends. `glow` is the glow's strength (0 = none; else held to 0.08..0.18). */
export function glyphAt(rangeMetres: number, opts: { narrow?: boolean; glow?: number } = {}): Glyph {
  const A = opts.narrow ? NARROW_ANCHORS : WIDE_ANCHORS;
  const s = opts.glow ?? GLOW_ALPHA;
  const glowAlpha = s <= 0 ? 0 : Math.min(GLOW_MAX, Math.max(GLOW_MIN, s));
  const r = Math.max(1, rangeMetres);
  if (r <= A[0][0]) return { ...A[0][1], glowAlpha };
  const last = A[A.length - 1];
  if (r >= last[0]) return { ...last[1], glowAlpha };
  let k = 1;
  while (A[k][0] < r) k++;
  const [r0, g0] = A[k - 1], [r1, g1] = A[k];
  const t = Math.log(r / r0) / Math.log(r1 / r0);
  return { core: lerp(g0.core, g1.core, t), halo: lerp(g0.halo, g1.halo, t), haloAlpha: lerp(g0.haloAlpha, g1.haloAlpha, t), glow: lerp(g0.glow, g1.glow, t), glowAlpha };
}

/** THE LIGHT ANSWERS (round 57.3, now on the canvas): the hovered light, or the featured home whose
 * card has focus, `k` of the way lit (0..1, eased by the layer over LIT_MS): the core half again as
 * large and pure white, the halo wider and stronger. Same centre, so it brightens in place. */
export function litGlyph(g: Glyph, k: number): Glyph {
  if (k <= 0) return g;
  // Round 57.8: its glow swells too, half again as wide and twice as strong (the home lights its
  // street a little more while it is pointed at).
  return {
    core: g.core * (1 + 0.6 * k),
    halo: g.halo * (1 + 0.45 * k),
    haloAlpha: Math.min(0.95, g.haloAlpha * (1 + 0.9 * k)),
    glow: g.glow * (1 + 0.5 * k),
    glowAlpha: Math.min(0.36, g.glowAlpha * (1 + k)),
  };
}

/** The featured homes (the rails' cards): a touch larger than the rest at every range, so they are
 * found. */
export function featuredGlyph(g: Glyph): Glyph {
  return { core: g.core + 0.6, halo: g.halo * 1.2, haloAlpha: Math.min(0.9, g.haloAlpha + 0.08), glow: g.glow * 1.15, glowAlpha: g.glowAlpha };
}

/** How far a light reaches on screen, css px (its sprite's radius; culling and keep-outs). */
export const reachOf = (g: Glyph) => Math.max(g.halo, g.glow);

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

/** The glow's strength at `u` = distance / glow radius: a broad soft shoulder (squared, not cubed
 * like the halo), so overlapping glows sum into an even warmth rather than a string of beads. */
export function glowProfile(u: number): number {
  if (u >= 1) return 0;
  const s = 1 - u * u;
  return s * s;
}

/** The glow's colour: the halo's warmth a little deeper, lamplight on a street (the same hue). */
export const GLOW_RGB = [255, 196, 132] as const;

/** What one light adds to a pixel `d` css px from its centre, sRGB 0..255 (the cover script sums
 * this; the canvas draws the same three profiles as one sprite with "lighter"). */
export function glyphAdd(g: Glyph, d: number, alpha = 1, core: readonly number[] = CORE_RGB): [number, number, number] {
  const c = coreProfile(d / g.core) * alpha;
  const h = haloProfile(d / g.halo) * g.haloAlpha * alpha;
  const w = g.glow > 0 ? glowProfile(d / g.glow) * g.glowAlpha * alpha : 0;
  return [core[0] * c + HALO_RGB[0] * h + GLOW_RGB[0] * w, core[1] * c + HALO_RGB[1] * h + GLOW_RGB[1] * w, core[2] * c + HALO_RGB[2] * h + GLOW_RGB[2] * w];
}
