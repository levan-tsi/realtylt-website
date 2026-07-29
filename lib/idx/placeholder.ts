/** The single branded "photo coming soon" artwork — shared by the /api/media route (served as an
 * image/svg+xml response) and the ListingCard <NoPhoto> component, so a listing with no available
 * photo reads identically whether the tile hits the route's 200/503 SVG or the client fallback.
 *
 * It is a DUOTONE ILLUSTRATION on purpose (a Hudson Valley night: a true crescent moon with a soft
 * glow, varied stars and two faint four-point sparkles, three ridgelines with a moonlit RIVER pool
 * glinting in the right valley — the Hudson itself — curved-shoulder conifers, and a cozy gabled
 * house with a roof overhang, capped chimney, two quiet smoke wisps, amber-lit windows, a lantern
 * pinprick and one azure "porch-light" door — the RealtyLT motif), NOT a photograph: it is
 * unmistakably generic/branded so it can never be read as a real photo of THIS property. All
 * self-made vector (~4.2KB, no raster asset), so it scales crisply from a small card to a full
 * gallery frame. The house sits horizontally centered (x400) and the wordmark rides a dark ground
 * band (y410+), so object-cover / preserveAspectRatio="slice" cropping never clips the scene or the
 * wordmark on portrait cards (vertical slice) or landscape galleries (horizontal band); the river
 * sits BEHIND the house's right shoulder so no crop ever shows it cutting through the building.
 * Reworked round 13 after the owner's "the coming-soon photo needs work" — the old art faked its
 * crescent with a translucent occluding disc that read as a smudge at every size. Palette = the
 * site's "Hudson Twilight" tokens: river navy #102c54, porchlight azure #28a8e0, warm scene light
 * amber #f6c46e (scene light only, per the design system), moonlight #fbf6ea, mist. */

/** Inner markup (no <svg> wrapper) — for inline rendering inside a React <svg>. */
export const PLACEHOLDER_INNER = `<defs>
<linearGradient id="rlt-ph-sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#14263d"/><stop offset="0.55" stop-color="#2f4c68"/><stop offset="0.88" stop-color="#55636e"/><stop offset="1" stop-color="#79726a"/>
</linearGradient>
<radialGradient id="rlt-ph-moon" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fbf6ea" stop-opacity="0.5"/><stop offset="0.55" stop-color="#fbf6ea" stop-opacity="0.16"/><stop offset="1" stop-color="#fbf6ea" stop-opacity="0"/>
</radialGradient>
<radialGradient id="rlt-ph-win" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#f6c46e" stop-opacity="0.7"/><stop offset="1" stop-color="#f6c46e" stop-opacity="0"/>
</radialGradient>
<linearGradient id="rlt-ph-river" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#a9c4dc" stop-opacity="0"/><stop offset="0.45" stop-color="#a9c4dc" stop-opacity="0.28"/><stop offset="0.72" stop-color="#d8e6f2" stop-opacity="0.4"/><stop offset="1" stop-color="#a9c4dc" stop-opacity="0.05"/>
</linearGradient>
</defs>
<rect width="800" height="600" fill="url(#rlt-ph-sky)"/>
<g fill="#eaf1f8"><circle cx="214" cy="118" r="2.4" opacity="0.8"/><circle cx="300" cy="86" r="1.6" opacity="0.55"/><circle cx="392" cy="128" r="1.4" opacity="0.5"/><circle cx="668" cy="236" r="1.9" opacity="0.65"/><circle cx="180" cy="212" r="1.3" opacity="0.45"/><circle cx="470" cy="70" r="1.6" opacity="0.6"/><circle cx="94" cy="96" r="1.8" opacity="0.6"/><circle cx="726" cy="120" r="1.4" opacity="0.5"/></g>
<path d="M137 160 v10 M132 165 h10" stroke="#eaf1f8" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/>
<path d="M636 84 v12 M630 90 h12" stroke="#eaf1f8" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
<circle cx="566" cy="148" r="64" fill="url(#rlt-ph-moon)"/>
<path d="M577 122 A27 27 0 1 0 577 174 A33 33 0 0 1 577 122 Z" fill="#fbf6ea" opacity="0.95"/>
<path d="M0 344 Q200 306 420 330 T800 322 V600 H0 Z" fill="#3d5872" opacity="0.6"/>
<path d="M470 358 Q560 350 650 354 T800 350 V376 Q640 372 470 366 Z" fill="url(#rlt-ph-river)"/>
<path d="M536 358 h64" stroke="#e8f1f9" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
<path d="M556 364 h34" stroke="#e8f1f9" stroke-width="1.4" stroke-linecap="round" opacity="0.28"/>
<path d="M0 372 Q210 334 430 362 T800 356 V600 H0 Z" fill="#2b4763"/>
<path d="M0 410 Q260 372 520 402 T800 398 V600 H0 Z" fill="#20374f"/>
<g fill="#152736"><path d="M118 432 C123 406 127 396 137 378 C147 396 151 406 156 432 Z"/><path d="M150 442 C156 412 161 400 172 380 C183 400 188 412 194 442 Z"/><path d="M648 438 C653 412 657 402 666 384 C675 402 679 412 684 438 Z"/><path d="M680 446 C685 424 688 415 696 398 C704 415 707 424 712 446 Z"/></g>
<circle cx="396" cy="336" r="58" fill="url(#rlt-ph-win)"/>
<path d="M428 196 C433 186 424 178 429 166" fill="none" stroke="#cfd9e6" stroke-width="3" stroke-linecap="round" opacity="0.3"/>
<path d="M434 182 C438 175 432 170 435 162" fill="none" stroke="#cfd9e6" stroke-width="2.2" stroke-linecap="round" opacity="0.2"/>
<g fill="#12233a">
<rect x="420" y="204" width="17" height="44"/><rect x="416" y="199" width="25" height="7" rx="1.5"/>
<path d="M308 330 L400 244 L492 330 L479 330 L400 256 L321 330 Z"/>
<path d="M400 252 L474 322 L474 412 L326 412 L326 322 Z"/>
</g>
<rect x="356" y="338" width="27" height="30" rx="2" fill="#f6c46e"/>
<rect x="417" y="338" width="27" height="30" rx="2" fill="#f6c46e"/>
<path d="M369.5 338 V368 M356 353 H383 M430.5 338 V368 M417 353 H444" stroke="#12233a" stroke-width="2.5"/>
<rect x="386" y="372" width="28" height="40" rx="1.5" fill="#28a8e0" fill-opacity="0.92"/>
<circle cx="379" cy="384" r="2.2" fill="#f6c46e" opacity="0.9"/>
<rect y="412" width="800" height="188" fill="#11213a"/>
<path d="M0 412 Q260 398 520 410 T800 408 V430 H0 Z" fill="#20374f" opacity="0.6"/>
<text x="400" y="474" text-anchor="middle" font-family="'Bricolage Grotesque', 'Segoe UI', Helvetica, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="8" fill="#eef3f9" fill-opacity="0.94">REALTYLT</text>
<text x="400" y="507" text-anchor="middle" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="18" letter-spacing="0.6" fill="#9fb0c4">Photo coming soon</text>`;

/** Full standalone SVG document — for the /api/media image/svg+xml response. */
export const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="RealtyLT — photo coming soon">${PLACEHOLDER_INNER}</svg>`;
