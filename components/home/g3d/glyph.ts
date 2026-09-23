/** The home's light on the real map (round 56): a small warm-white point with a soft glow, not a
 * Google pin. Drawn by Map3DElement from an SVG in a <template> (the marker's documented custom
 * glyph); the image's BOTTOM edge sits on the home (measured: the marker anchors bottom-centre), so
 * the light's own centre is size / 2 px above the place, which the hover maths accounts for.
 *
 * The core carries a thin dark ring: over daytime imagery a white dot on a white roof or a
 * sunlit field would vanish, and the ring keeps it a light wherever it stands.
 *
 * Round 57.2: SIZE FOLLOWS RANGE. At the territory's height an 18 px glow per home merged the city
 * into one blob of light (round 57.1's frames); the light is now a 12 px point with a faint halo
 * from 100 km up, 14 px from 40 km, and the full 18 px only close in. Three tiers, not a continuous
 * size: a marker's image is fixed once it is drawn, so a change of tier re-adds it. In "Where we
 * work" the boroughs (21 to 39 km) are near, the valley's counties mid, and Orange (113 km at 1440,
 * 142 at 390: a big county seen whole) and the phone's Ulster far. */
export const GLYPH = 18;

export type GlyphTier = "far" | "mid" | "near";

export interface Glyph {
  tier: GlyphTier;
  /** The image's side, css px. */
  size: number;
  /** The halo's opacity at its inner stop (the core stays bright). */
  halo: number;
  /** The bright core's radius in the 18-unit box: a larger share when the glyph is small, so a far
   * light stays a readable point (round 57.2's first frames at 11 px / 2.9 lost it on the imagery). */
  core: number;
}

const TIERS: Record<GlyphTier, Glyph> = {
  far: { tier: "far", size: 12, halo: 0.3, core: 3.7 },
  mid: { tier: "mid", size: 14, halo: 0.38, core: 3.3 },
  near: { tier: "near", size: GLYPH, halo: 0.5, core: 2.9 },
};

export function glyphFor(rangeMetres: number): Glyph {
  return rangeMetres >= 100_000 ? TIERS.far : rangeMetres >= 40_000 ? TIERS.mid : TIERS.near;
}

/** The featured homes (controller.ts setFeatured): one size at every shot, a touch above a county's
 * lights so they are found, well under round 56's 24 px. */
export const FEATURED_GLYPH = 16;

/** The light at a size, drawn in the 18-unit box it was designed in and scaled by the viewBox, so
 * the core, ring and halo keep their proportions. */
export function lightSvg(size: number, halo: number, core = 2.9): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 18 18">` +
    `<defs><radialGradient id="g"><stop offset="0" stop-color="#fff8ea" stop-opacity=".95"/>` +
    `<stop offset=".42" stop-color="#ffe4b8" stop-opacity="${halo}"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="9" cy="9" r="9" fill="url(#g)"/>` +
    `<circle cx="9" cy="9" r="${core}" fill="#fffdf7" stroke="rgba(18,12,4,.6)" stroke-width="1"/></svg>`
  );
}
