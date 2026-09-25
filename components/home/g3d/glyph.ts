/** THE HOME'S LIGHT (round 57.6): drawn by us on a canvas over the night-graded map
 * (light-layer.ts), and by the cover script into the load cover (scripts/make-map-cover.mjs), from
 * the SAME numbers here, so the cover's lights and the live ones are the same lights.
 *
 * The light is two things added onto the ground (additive, "lighter"): a small whitish-yellow CORE
 * (round 59; warm white before) and a faint warm HALO around it, one hue, no ring (round 56's dark ring was for daylight imagery; on
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
  /** The core's colour, sRGB 0..255, when the page's `?core=` asks for another than CORE_RGB
   * (round 59: the comparison knob). Absent: CORE_RGB. */
  coreRgb?: readonly number[];
}

type Anchor = readonly [range: number, glyph: Omit<Glyph, "glowAlpha">];

/** A laptop's lights by range (metres). Round 58 (the owner's fifth verdict: "a round yellow and
 * the brightness around it is too big; it should be half, or even less, if not nothing at all"):
 * the halo is HALF round 57.8's (3 to 4 px, from 6 to 8), a tight bloom that makes the point read
 * as a light and no more, and the neighbourhood glow is OFF by default (GLOW_ALPHA 0; its radii
 * stay here for `?glow=`). The core is unchanged: the point itself was never the complaint.
 *
 * Round 59 (the owner's sixth verdict: "make that yellow dots just yellow, like a light, but don't
 * give brightness around it, maybe just a little bit, like five, ten percent, nothing more"): the
 * halo is a WHISPER, HALO_ALPHA 0.08 on a laptop (0.10 on a phone, below), at the same radii, about
 * 1.5 core radii (3 to 4 px). Compared by frames at 0, 0.05, 0.08 and 0.10 and at 2 core radii
 * (docs/parity/DESIGN-ROUND59.md §1): 0 leaves the dot a shade deeper and flatter, 0.08 gives its
 * edge the round softness of a lamp without a visible ring, and 2 core radii read the same as 1.5. */
export const HALO_ALPHA = 0.08;
export const WIDE_ANCHORS: readonly Anchor[] = [
  [3_000, { core: 2.6, halo: 4, haloAlpha: HALO_ALPHA, glow: 32 }],
  [25_000, { core: 2.25, halo: 3.5, haloAlpha: HALO_ALPHA, glow: 26 }],
  [60_000, { core: 2.05, halo: 3.25, haloAlpha: HALO_ALPHA, glow: 24 }],
  [145_000, { core: 1.9, halo: 3, haloAlpha: HALO_ALPHA, glow: 20 }],
];

/** A phone's (round 57.3: the phone's territory lights were faint beside its words, so its far
 * lights are a touch larger and stronger; closer in the two meet). Round 59: its halo at the
 * verdict's ceiling, 0.10, for the same reason (a phone's lights are read smaller). */
export const HALO_ALPHA_NARROW = 0.1;
export const NARROW_ANCHORS: readonly Anchor[] = [
  [3_000, { core: 2.6, halo: 4, haloAlpha: HALO_ALPHA_NARROW, glow: 30 }],
  [25_000, { core: 2.35, halo: 3.75, haloAlpha: HALO_ALPHA_NARROW, glow: 24 }],
  [60_000, { core: 2.25, halo: 3.5, haloAlpha: HALO_ALPHA_NARROW, glow: 22 }],
  [156_000, { core: 2.2, halo: 3.25, haloAlpha: HALO_ALPHA_NARROW, glow: 22 }],
];

/** The glow's strength. Round 57.8 chose 0.12 by frames at three strengths (record §7 round 8);
 * round 58 turned it OFF on the owner's word ("if not nothing at all"). `?glow=0.12` shows it for
 * comparison; a non-zero strength is still held to 0.08..0.18. */
export const GLOW_ALPHA = 0;
const GLOW_MIN = 0.08;
const GLOW_MAX = 0.18;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The light for a camera this far from its centre: interpolated in log range between the
 * anchors, held at the ends. `glow` is the glow's strength (0 = none: the glow's radius is 0 too,
 * so the light's reach is its halo; else held to 0.08..0.18). `halo` scales the halo's radius
 * (1 = the anchors'; the page's `?halo=` compares, round 58). Round 59's two knobs: `ha` is the
 * halo's strength at every range (0 = a bare dot: the halo's radius falls to the core's, so the
 * light reaches no further than its point), `core` the core's colour (three 0..255 numbers). */
export function glyphAt(
  rangeMetres: number,
  opts: { narrow?: boolean; glow?: number; halo?: number; ha?: number; core?: readonly number[] } = {},
): Glyph {
  const A = opts.narrow ? NARROW_ANCHORS : WIDE_ANCHORS;
  const s = opts.glow ?? GLOW_ALPHA;
  const glowAlpha = s <= 0 ? 0 : Math.min(GLOW_MAX, Math.max(GLOW_MIN, s));
  const hs = opts.halo !== undefined && opts.halo > 0 ? opts.halo : 1;
  const ha = opts.ha !== undefined && opts.ha >= 0 ? Math.min(0.95, opts.ha) : undefined;
  const core = opts.core && opts.core.length === 3 && opts.core.every((v) => v >= 0 && v <= 255) ? opts.core : undefined;
  const finish = (g: Omit<Glyph, "glowAlpha">): Glyph => {
    const haloAlpha = ha ?? g.haloAlpha;
    const out: Glyph = { ...g, halo: haloAlpha > 0 ? g.halo * hs : g.core, haloAlpha, glow: glowAlpha > 0 ? g.glow : 0, glowAlpha };
    if (core) out.coreRgb = core;
    return out;
  };
  const r = Math.max(1, rangeMetres);
  if (r <= A[0][0]) return finish(A[0][1]);
  const last = A[A.length - 1];
  if (r >= last[0]) return finish(last[1]);
  let k = 1;
  while (A[k][0] < r) k++;
  const [r0, g0] = A[k - 1], [r1, g1] = A[k];
  const t = Math.log(r / r0) / Math.log(r1 / r0);
  return finish({ core: lerp(g0.core, g1.core, t), halo: lerp(g0.halo, g1.halo, t), haloAlpha: lerp(g0.haloAlpha, g1.haloAlpha, t), glow: lerp(g0.glow, g1.glow, t) });
}

/** THE LIGHT ANSWERS (round 57.3, now on the canvas): the hovered light, or the featured home whose
 * card has focus, `k` of the way lit (0..1, eased by the layer over LIT_MS): the core half again as
 * large and pure white, the halo wider and stronger. Same centre, so it brightens in place. */
export function litGlyph(g: Glyph, k: number): Glyph {
  if (k <= 0) return g;
  // Round 57.8: its glow swells too, half again as wide and twice as strong (the home lights its
  // street a little more while it is pointed at).
  const out: Glyph = {
    core: g.core * (1 + 0.6 * k),
    halo: g.halo * (1 + 0.45 * k),
    haloAlpha: Math.min(0.95, g.haloAlpha * (1 + 0.9 * k)),
    glow: g.glow * (1 + 0.5 * k),
    glowAlpha: Math.min(0.36, g.glowAlpha * (1 + k)),
  };
  if (g.coreRgb) out.coreRgb = g.coreRgb;
  return out;
}

/** The featured homes (the rails' cards): a touch larger than the rest at every range, so they are
 * found. Round 59: the halo's strength a proportion up (a fifth), no longer a fixed +0.08, which on
 * the whisper of a halo would have doubled it into a visible ring. */
export function featuredGlyph(g: Glyph): Glyph {
  const out: Glyph = { core: g.core + 0.6, halo: g.halo * 1.2, haloAlpha: Math.min(0.9, g.haloAlpha * 1.2), glow: g.glow * 1.15, glowAlpha: g.glowAlpha };
  if (g.coreRgb) out.coreRgb = g.coreRgb;
  return out;
}

/** How far a light reaches on screen, css px (its sprite's radius; culling and keep-outs). Round 59:
 * the core counts too (with the halo off the halo's radius is the core's, and a lit or featured
 * core grows past it). */
export const reachOf = (g: Glyph) => Math.max(g.core, g.halo, g.glow);

/** How long the lit light takes to come up and go down (the label's own 120 / 160 ms). */
export const LIT_MS = 140;

/** The light's two colours, sRGB 0..255. Round 59: the core takes the halo's own warmth, a
 * whitish-yellow like an incandescent lamp (was the warm white 255, 248, 236: with round 58's halo
 * halved, the warmth that had lived in the halo was gone and the point read WHITE, "it lost its
 * brightness or vision on the city"). Chosen by frames among 255, 212, 158 (this), 255, 222, 172,
 * 255, 200, 140 and 255, 232, 190: the palest reads white again beside the blue-white roads, the
 * deepest leans amber; this one reads as lamplight and stands apart from the roads. Never a
 * saturated yellow, one hue; on the plate the added ground lifts it to about 249, 240, 194 at a
 * light's centre, and where lights overlap the sum clips toward white. The halo is the same colour
 * (one hue); `?core=r,g,b` compares another core on the same build. */
export const CORE_RGB = [255, 212, 158] as const;
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
export function glyphAdd(g: Glyph, d: number, alpha = 1, core: readonly number[] = g.coreRgb ?? CORE_RGB): [number, number, number] {
  const c = coreProfile(d / g.core) * alpha;
  const h = haloProfile(d / g.halo) * g.haloAlpha * alpha;
  const w = g.glow > 0 ? glowProfile(d / g.glow) * g.glowAlpha * alpha : 0;
  return [core[0] * c + HALO_RGB[0] * h + GLOW_RGB[0] * w, core[1] * c + HALO_RGB[1] * h + GLOW_RGB[1] * w, core[2] * c + HALO_RGB[2] * h + GLOW_RGB[2] * w];
}
