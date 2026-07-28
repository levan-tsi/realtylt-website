/**
 * The Equal Housing Opportunity mark.
 *
 * HUD publishes this logo uncopyrighted and free to use, with no licence or permission
 * required. The geometry here is TRACED from HUD's own artwork rather than drawn from memory:
 * `scripts/_scratch-fetch-fheo.mjs` downloads `fheo400.gif` from
 * hud.gov/sites/dfiles/FHEO/images/ and `scripts/_scratch-fheo-trace.mjs` reads the dark-pixel
 * runs off it row by row. Measured on the 283x302 original: apex at x=141, roof slope 1.5,
 * inner apex 49px below the outer one, eave to y=130, walls x 19-48 and 234-264, base
 * y 206-244, and the two equal-sign bars at x 93-190 / y 101-141 and y 149-188.
 *
 * Drawn as a vector rather than shipped as HUD's GIF so it is sharp at any size and inherits
 * the surrounding text colour — HUD asks only that the mark be clearly visible, not that it be
 * a specific colour. The words "Equal Housing Opportunity" are set beside it in the page's own
 * type rather than baked into the artwork, which is the same combination HUD publishes.
 */
export function EqualHousingMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 282 244"
      aria-hidden
      focusable="false"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      className={className}
    >
      {/* House: outer silhouette with the interior cut out (evenodd). */}
      <path d="M141 0 L282 94 V130 H264 V244 H19 V130 H0 V94 Z M141 49 L49 110 V206 H233 V110 Z" />
      {/* The equal sign. */}
      <path d="M93 101 H190 V141 H93 Z M93 149 H190 V189 H93 Z" />
    </svg>
  );
}
