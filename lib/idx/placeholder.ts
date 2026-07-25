/** The single branded "photo coming soon" artwork — shared by the /api/media route (served as an
 * image/svg+xml response) and the ListingCard <NoPhoto> component, so a listing with no available
 * photo reads identically whether the tile hits the route's 200/503 SVG or the client fallback.
 *
 * It is a DUOTONE ILLUSTRATION on purpose (a soft Hudson Valley dusk: pale sky, navy hills, a
 * gabled house with one lit "porch-light" window — the RealtyLT motif), NOT a photograph: it must
 * be unmistakably generic/branded so it can never be read as a real photo of THIS property. All
 * self-made vector (~2KB, no raster asset), so it scales crisply from a small card to a full
 * gallery frame and stays the final fallback. Content sits in a vertical safe band (~y210–500) so
 * object-cover / preserveAspectRatio="slice" cropping (portrait cards, landscape galleries) never
 * clips the house or the wordmark. Palette = the site tokens: river navy #102c54, porchlight azure
 * #28a8e0, mist #f3f5f8, stone #6f6f6f. */

/** Inner markup (no <svg> wrapper) — for inline rendering inside a React <svg>. */
export const PLACEHOLDER_INNER = `<defs>
<linearGradient id="rlt-ph-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#e9eef5"/><stop offset="1" stop-color="#f4f6f9"/>
</linearGradient>
<radialGradient id="rlt-ph-glow" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#28a8e0" stop-opacity="0.5"/><stop offset="0.6" stop-color="#28a8e0" stop-opacity="0.14"/><stop offset="1" stop-color="#28a8e0" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="800" height="600" fill="url(#rlt-ph-sky)"/>
<path d="M0 392 Q200 342 400 382 T800 374 V600 H0 Z" fill="#102c54" opacity="0.045"/>
<path d="M0 444 Q250 402 500 434 T800 430 V600 H0 Z" fill="#102c54" opacity="0.075"/>
<circle cx="367" cy="346" r="52" fill="url(#rlt-ph-glow)"/>
<g fill="none" stroke="#102c54" stroke-opacity="0.82" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<path d="M316 302 L400 234 L484 302"/>
<path d="M342 298 V404 H458 V298"/>
<path d="M388 404 V350 H414 V404"/>
</g>
<g stroke="#102c54" stroke-opacity="0.82" stroke-width="4.5" stroke-linejoin="round">
<rect x="352" y="330" width="32" height="34" rx="1.5" fill="#28a8e0" fill-opacity="0.92"/>
<path d="M368 330 V364 M352 347 H384" stroke="#eaf6fc" stroke-opacity="0.9" stroke-width="3"/>
</g>
<text x="400" y="456" text-anchor="middle" font-family="'Bricolage Grotesque', 'Segoe UI', Helvetica, Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="7" fill="#102c54" fill-opacity="0.74">REALTYLT</text>
<text x="400" y="490" text-anchor="middle" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="20" letter-spacing="0.5" fill="#6f6f6f">Photo coming soon</text>`;

/** Full standalone SVG document — for the /api/media image/svg+xml response. */
export const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="RealtyLT — photo coming soon">${PLACEHOLDER_INNER}</svg>`;
