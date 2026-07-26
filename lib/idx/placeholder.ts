/** The single branded "photo coming soon" artwork — shared by the /api/media route (served as an
 * image/svg+xml response) and the ListingCard <NoPhoto> component, so a listing with no available
 * photo reads identically whether the tile hits the route's 200/503 SVG or the client fallback.
 *
 * It is a DUOTONE ILLUSTRATION on purpose (a warm Hudson Valley twilight: deep indigo sky fading to
 * a warm horizon, a rising moon and a few stars, layered ridgelines, and a cozy gabled house with
 * amber-lit windows and one azure "porch-light" door — the RealtyLT motif), NOT a photograph: it is
 * unmistakably generic/branded so it can never be read as a real photo of THIS property. All
 * self-made vector (~2.5KB, no raster asset), so it scales crisply from a small card to a full
 * gallery frame. The house sits horizontally centered (x400) and the wordmark rides a dark ground
 * band (y410+), so object-cover / preserveAspectRatio="slice" cropping never clips the scene or the
 * wordmark on portrait cards (vertical slice) or landscape galleries (horizontal band). Palette =
 * the site's "Hudson Twilight" tokens: river navy #102c54, porchlight azure #28a8e0, warm scene
 * light amber #f6c46e (scene light only, per the design system), moonlight #fbf6ea, mist. */

/** Inner markup (no <svg> wrapper) — for inline rendering inside a React <svg>. */
export const PLACEHOLDER_INNER = `<defs>
<linearGradient id="rlt-ph-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#182a44"/><stop offset="0.5" stop-color="#375a7c"/><stop offset="0.78" stop-color="#b07f57" stop-opacity="0.5"/><stop offset="1" stop-color="#e7d3b3"/>
</linearGradient>
<radialGradient id="rlt-ph-moon" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fbf6ea"/><stop offset="0.5" stop-color="#fbf6ea" stop-opacity="0.35"/><stop offset="1" stop-color="#fbf6ea" stop-opacity="0"/>
</radialGradient>
<radialGradient id="rlt-ph-win" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#f6c46e" stop-opacity="0.85"/><stop offset="1" stop-color="#f6c46e" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="800" height="600" fill="url(#rlt-ph-sky)"/>
<circle cx="566" cy="150" r="78" fill="url(#rlt-ph-moon)"/>
<circle cx="566" cy="150" r="27" fill="#fbf6ea" opacity="0.96"/>
<circle cx="551" cy="143" r="27" fill="#375a7c" opacity="0.5"/>
<g fill="#eaf1f8" opacity="0.72"><circle cx="214" cy="118" r="2.6"/><circle cx="300" cy="86" r="1.8"/><circle cx="392" cy="126" r="1.6"/><circle cx="656" cy="250" r="2.1"/><circle cx="180" cy="210" r="1.5"/><circle cx="470" cy="72" r="1.7"/></g>
<path d="M0 358 Q210 316 430 348 T800 342 V600 H0 Z" fill="#2b4763"/>
<path d="M0 404 Q260 364 520 396 T800 392 V600 H0 Z" fill="#20374f"/>
<g fill="#152736"><path d="M116 430 l22 -72 l22 72 z"/><path d="M148 442 l27 -86 l27 86 z"/><path d="M652 438 l24 -78 l24 78 z"/><path d="M686 446 l20 -64 l20 64 z"/></g>
<circle cx="392" cy="330" r="66" fill="url(#rlt-ph-win)"/>
<rect x="420" y="198" width="17" height="46" fill="#12233a"/>
<path d="M322 318 L400 246 L478 318 L478 324 L464 324 L464 412 L336 412 L336 324 L322 324 Z" fill="#12233a"/>
<rect x="356" y="338" width="27" height="30" rx="2" fill="#f6c46e"/>
<rect x="417" y="338" width="27" height="30" rx="2" fill="#f6c46e"/>
<path d="M369.5 338 V368 M356 353 H383 M430.5 338 V368 M417 353 H444" stroke="#12233a" stroke-width="2.5"/>
<rect x="386" y="372" width="28" height="40" rx="1.5" fill="#28a8e0" fill-opacity="0.92"/>
<rect y="412" width="800" height="188" fill="#11213a"/>
<path d="M0 412 Q260 398 520 410 T800 408 V430 H0 Z" fill="#20374f" opacity="0.6"/>
<text x="400" y="474" text-anchor="middle" font-family="'Bricolage Grotesque', 'Segoe UI', Helvetica, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="7" fill="#eef3f9" fill-opacity="0.94">REALTYLT</text>
<text x="400" y="508" text-anchor="middle" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="19" letter-spacing="0.6" fill="#9fb0c4">Photo coming soon</text>`;

/** Full standalone SVG document — for the /api/media image/svg+xml response. */
export const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="RealtyLT — photo coming soon">${PLACEHOLDER_INNER}</svg>`;
