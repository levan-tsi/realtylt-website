# Parity round 6 (2026-07-24): reconcile against the owner-pasted BlueRoof source code

The owner is pasting each live page's sitebuilder Custom Code panel — the SOURCE OF TRUTH.
Saved under `docs/live-source/` (README has the standing rules). This round: HOME, BUYING,
SELLING. More pages will arrive; this doc will grow.

OWNER'S RULES (binding): match the source, BUT (1) strip every Brivity/BlueRoof sign —
names, product screenshots, "Powered by" — replacing with our own equivalents; (2) improve
where clearly better (anti-slop: no arrow/↑ glyphs even where live has them, no inline-style
soup, React implementations replace their inline scripts); (3) their inline <script>s are
behavior specs to reimplement properly, not code to copy.

## Verified deltas to fix (ours vs source)

### HOME (docs/live-source/home.html)
H1. MOBILE hero poster: source serves hom.png on mobile (`img-overlay visible-sm visible-xs`),
    video on desktop only. Ours currently uses the Vimeo first-frame poster everywhere.
    -> Mobile/reduced-motion poster = hom.png (live parity); desktop poster stays the Vimeo
    first frame (our no-black improvement while the player spins up). Verify both at 390+1440.
H2. "Find Your Home Value" left column: use live's exact three paragraphs (in home.html)
    instead of our shortened copy + checkmark bullets. Keep our shorter response-time note off;
    match live copy verbatim (it is the owner's copy).
H3. Lead enrichment (behavior spec from their parser scripts): on submit, parse the Property
    Address field ("123 Main St, Hyde Park, NY 12044") into structured street/city/state/zip
    and include them in our /api/lead payload (server-side parse in the API is fine too; add
    unit tests for the regex edge cases: ZIP+4, missing state, no commas). Do NOT mutate the
    visible field value (their script rewrites the input — ours should keep UX clean and send
    the parts alongside the full string).
H4. Why-carousel: confirm slide set/order matches the 5 active slides, and add the closing
    paragraph BELOW the carousel (inside the band): "From the best tools and technology to
    transparency throughout the entire process, we're the top choice for buyers and sellers."
    (Ours currently has intro copy above; match live's placement.)
H5. Featured Listings heading: plain white band, h2 in primary color, weight 700 (ours is
    close — verify against source geometry, col-md-10 offset-1 alignment).

### BUYING (docs/live-source/buying.html)
B1. "Book Free Consultation" must link to /connect (ours may still open a modal or other
    target) — internal link, no _blank needed for same-site (improvement over source).
B2. Phone SVG icon color: source uses BLUE #3b82f6 fill on both hero buttons — check ours
    (we shipped a white/neutral icon); match the blue accent EXACTLY on the phone icon only
    (it is the owner's chosen accent, not AI-slop — documented owner choice).
B3. Analytics: source fires gtag events on phone/book clicks (category Phone / Booking).
    We have gtag site-wide: add the same two click events (no fbq — we have no FB pixel).
B4. Mobile spec: buttons stack full-width max 350px centered at <=768px; verify ours matches.

### SELLING (docs/live-source/selling.html)
S1. REVIEWS — REAL QUOTES: replace our three testimonial texts with the exact Google review
    texts + attributions in the source file (Giorgi Sokhadze / Grace Nyambura / Mariam
    Kereselidze), and point "See all our Google reviews" at the exact Google Maps URL from
    the source (target=_blank rel=noopener). No arrow glyph.
S2. TRUST BAR: use the Google logo image (self-host a copy under public/images/, do not
    hotlink google.com) + gold #fbbc04 stars + "5.0", with the source's divider styling.
    Ours currently renders the word "Google" as text.
S3. HERO FORM behavior spec: single Full Name field parsed into first/last on submit
    (1 word -> first only; 2 -> first/last; 3+ -> first + rest joined as last) and address
    parsed into street/city/state/zip — send all parts in the /api/lead payload (tests).
    Confirm our field set matches: Full Name / Email+Phone 2-up / Full Property Address.
S4. scrollToForm behavior: the dual-path card CTAs and the pricing/stay-in-loop CTAs must
    smooth-scroll to the hero form with ~-100px offset AND focus the first input after the
    scroll (ours scrolls but verify the focus handoff; respect prefers-reduced-motion with
    an instant jump).
S5. Dual-path card details vs source: number badges 60px black circles floating -30px above
    card top (verify ours), key-benefit line over a translucent top border, benefit ✓ size
    ratio, "PERFECT IF YOU HAVE/WANT" exact bullet lists (source file has them verbatim),
    bottom black band copy "Not sure which option is best? We'll show you both - no
    pressure." — match copy exactly.
S6. LISTING SHINE: add the subtle parallax backdrop (sell-img-4.jpg at 0.25 opacity behind
    the section — download live's asset; static attachment is fine under reduced-motion).
S7. Confirm our de-Brivited replacements stay: pricing stats card (theirs: stats-img.png),
    marketing collage (theirs: marketing-brivity-2021), seller-portal mockup (theirs:
    brivity-laptop.png). Copy updates from source where wording differs (e.g. "Real-time
    updates until your home is sold", the 24/7 line).

### SEARCH
Source custom code is just a map placeholder image — Brivity injects their native app.
Nothing to copy; ours already surpasses. NO work.

## ADDENDUM 2026-07-24 PM (owner pasted more pages): FINANCING + FOOTER + SEO METAS

### FINANCING (docs/live-source/financing.html)
F1. CALCULATOR MATH vs source (the big one): reimplement + unit-test the source's exact
    behaviors in our shared MortgageCalculator WITHOUT breaking the listing-page seed/donut:
    (a) PMI: down% < 20 -> $55 per $100k financed per month, appears as its own breakdown
    row + bar segment; hidden at >= 20. (b) Empty annual tax -> NY-style fallback: assessed
    = 85% of price, $9 per $1,000 yearly. (c) HOA/insurance rows hide when 0. (d) Input
    constraints: rate max 10 step .125, down 1-99 step .125, term 1-30.
F2. FINANCING page results layout = source's ROUNDED SEGMENTED BAR (40px tall, radius-200
    pill, single hue at opacities 1/.85/.7/.55/.4 — use our ink/azure tokens) + color-dot
    breakdown rows + 48px total. The round-5 donut STAYS on the LISTING page; financing
    shows the source's bar layout. Reset control with a refresh SVG (no fa glyphs).
F3. Parallax photo backdrops the source has and we may lack: lending-stats.jpg at 0.45
    behind Get Pre-Approval; Financing-closing-the-deal.jpg at 0.45 behind Closing.
    Download live's assets to public/images/financing/, static under reduced-motion.
F4. Best-loan form: verify tags/fields match (First/Last/Email/Phone/Message, honeypot,
    "Let's Get Started"); the right phone mockup hides on mobile in the source — match.
F5. Keep our de-branded mockups where the source uses Brivity product shots
    (Brivity-Mortgage-Calculator-app2.png, processing-img.png).

### FOOTER (docs/live-source/footer.html) — site-wide
FT1. Lead-type select must offer ALL SIX source options (buyer / seller / seller+buyer /
     tenant / recruit "real estate career" / other) — check ours; wire values through
     /api/lead unchanged.
FT2. Do NOT copy the social row: live's icons all link to Brivity's own accounts
     (uncustomized template). No social row until the owner supplies his real URLs.
FT3. Keep our correct tel/mailto (live's template has Brivity's 866 number + a broken
     mailto). Verify legal row matches (year (c) Levan Tsiklauri | United Real Estate,
     Equal Housing logo, independently owned line) — ours has this; confirm wording.

### SEO/GEO METADATA PASS (owner ask: "proper title and meta description ... for seo geo")
META1. Audit EVERY page's <title> + meta description (home, search, buying, selling,
     financing, home-value, who-we-are, connect, blog + articles, top-areas + 6 counties +
     5 boroughs, services, listing template): unique title <= 60 chars in one consistent
     pattern ("<Page intent> | RealtyLT <geo>"), description 140-160 chars, geo terms
     (Hudson Valley, the county/borough names, NY) written naturally, no keyword stuffing,
     no em dashes. Listing + area pages: dynamic geo titles from data (verify slug pages
     emit address + city titles and canonical). Confirm OG/twitter mirrors, and that
     app/robots + sitemap still cover everything indexable.
META2. Verify JSON-LD still valid where present (services, listings) and add
     RealEstateAgent org schema site-wide if missing (name, url, logo, address, phone,
     areaServed) — honest fields only.

### NO-CODE PAGES (owner confirmed)
Top Areas source = nav template stub only; county pages have no custom code -> our
editorial pages stay (beat live). Home Value + Who We Are show no custom code (Brivity-
native) -> already at/above parity from rounds 4-5. Connect: DONE (owner confirmed).

## After the fixes: POLISH LOOP (the owner's ask)
Re-shoot every reconciled section at 1440+390 side-by-side with live (screenshot pairs into
docs/_audit/round6/), fix visual deltas (spacing, sizes, weights per the source's rem values —
note live's root font-size makes 1rem = 10px, so 1.8rem = 18px), then run the standing
hardening: tsc + npm test green, keyboard, reduced-motion, no-JS, 320px, zero console errors
of ours. Iterate section by section until the pairs read as the same page or better.

## Guardrails
Standard set: ONE dev server (127.0.0.1:3000, reuse), NODE_OPTIONS=--use-system-ca, probes in
scripts/_scratch-*.mjs run foreground, page-scoped commits, never push, never submit live
forms (intercept /api/lead), no MLS/security/Supabase/auth changes, anti-slop rules bind.
