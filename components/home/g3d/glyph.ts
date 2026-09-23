/** The home's light on the real map (round 56): a small warm-white point with a soft glow, not a
 * Google pin. Drawn by Map3DElement from an SVG in a <template> (the marker's documented custom
 * glyph); the image's BOTTOM edge sits on the home (measured: the marker anchors bottom-centre), so
 * the light's own centre is GLYPH / 2 px above the place, which the hover maths accounts for.
 *
 * The core carries a thin dark ring: over daytime imagery a white dot on a white roof or a
 * sunlit field would vanish, and the ring keeps it a light wherever it stands. */
export const GLYPH = 18;

export const LIGHT_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${GLYPH}" height="${GLYPH}" viewBox="0 0 18 18">` +
  `<defs><radialGradient id="g"><stop offset="0" stop-color="#fff8ea" stop-opacity=".95"/>` +
  `<stop offset=".42" stop-color="#ffe4b8" stop-opacity=".5"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient></defs>` +
  `<circle cx="9" cy="9" r="9" fill="url(#g)"/>` +
  `<circle cx="9" cy="9" r="2.7" fill="#fffdf7" stroke="rgba(18,12,4,.6)" stroke-width=".9"/></svg>`;
