# Parity round 4 (2026-07-22): Home + Buying + hero-asset parity

Orchestrator map from a fresh full-site sweep (evidence: `docs/_audit/sweep-0722/*.png`,
`live-nav.txt`). The owner's read is "a lot of things are still not the same" — the sweep
confirms the gaps below. Live is PUBLIC; extract read-only, NEVER submit live forms.

## What the sweep found (site state 2026-07-22)

At-or-above parity, DO NOT rebuild: selling (structure matches live's new cash-offer design),
financing, home-value, who-we-are (live's is now a bare agent card at /realestateagent/search;
old /who-we-are is 410), blog (ours richer, same posts), connect (structure matches), search
(scored 97.7 on scripts/parity-score.mjs), listing detail (ours has richer real data).

Below-parity pages this round: **HOME** (worst), **BUYING**, plus targeted touch-ups.

## PAGE 1 — HOME (`app/page.tsx`)

### H1. Hero is a VIDEO on live, a static kitchen photo on ours  [BIGGEST]
Live desktop hero = Vimeo background video, extracted from live DOM:
`https://player.vimeo.com/video/398379426?autoplay=1&loop=1&title=0&byline=0&portrait=0&background=1`
inside `.video-background > .video-foreground` (classes `hidden-sm hidden-xs` = DESKTOP ONLY;
mobile gets a static image). Build ours the same:
- Desktop (>= lg): the same Vimeo iframe as an ambient, muted, non-interactive background
  (pointer-events-none, aria-hidden, title attr for a11y scanners), current scrim kept so the
  white "Let's Find Home" text still clears contrast.
- Mobile / prefers-reduced-motion / no-JS: keep the current static `/images/hero/hom.png`
  (it IS live's own uploaded asset). Reduced-motion users must NOT get the video (respect
  `(prefers-reduced-motion: reduce)` — render image instead, not just paused).
- CSP: `next.config` frame-src currently allows calendar.google.com + td.doubleclick.net —
  add `player.vimeo.com`. Do not widen anything else.
- Lazy: the iframe must not block LCP; load it after first paint (e.g. mount on idle) with the
  image underneath as the poster so there is never a black flash (live shows black until the
  video arrives — beat that, don't copy it).

### H2. "Why Work With Us?" must be live's laptop CAROUSEL
Live: bootstrap carousel `#promo-slider-1` on `#F3F5F8` background, centered h2, one slide =
device screenshot + h3 caption, side arrows. 5 active slides (alt text describes each image):
1. `promo-slide-1.png` — "We make listings shine with stunning photos, virtual tours, 3D walkthroughs and videos"
2. `promo-slide-3.png` — "Search all available homes for sale"
3. `promo-slide-4.png` — "See everything your agent does to get your property sold"
4. `promo-slide-5v2.png` — "Stay up-to-date, receive reports on your neighborhood"
5. `save_a_search.png` — "We have a list of buyers that receive listing alerts every day"
Asset base: `https://images.brivityidx.com/assets/images/uploads/219/`. Download the 5 PNGs
into `public/images/why/` (they are the site's own uploads; keep filenames) and build our own
accessible carousel: prev/next buttons (inline SVG chevrons, focus ring >= 3:1), slide
announcement via aria-live, swipe on touch, no auto-advance under reduced motion, dots or
"N / M" indicator like the home rails. Keep our existing stat counters + TALK TO US CTA BELOW
the carousel (ours-better, owner liked the numbers) — the carousel replaces only the 4 static
text cards.

### H3. "Tell Us About Your Home" form layout
Live home-page form (extracted): stacked single-column fields in this order —
First Name + Last Name (2-up row), Email Address, Phone Number, Property Address, Your
Message, SEND MESSAGE. Ours = 2-col compact grid + interest select. Match live's field
order/stacking on the home page (keep our /api/lead wiring + honeypot + validation exactly as
is; this is layout only). Keep our 3 checkmark bullets under the left copy (ours-better).

### H4. New Listings rail placeholders — DATA, NOT YOURS
6 of 8 "New Listings" cards show placeholder glyphs because listings added after 2026-07-20
aren't photo-mirrored. The ORCHESTRATOR is running the bounded backfill concurrently with
your build. Do NOT touch backfill scripts, sync code, or anything MLS. If placeholders remain
when you verify, screenshot and move on — the orchestrator owns it.

## PAGE 2 — BUYING (`app/buying/page.tsx`)

Reference `docs/_audit/sweep-0722/buying-live.png` vs `buying-ours.png`. Our copy + section
order + colors already match; the MOCKUPS don't. Height: live 5706 vs ours 3984 — live's
device mockups are large; scale ours to match.

### B1. Hero background
Use live's own hero asset `https://images.brivityidx.com/assets/images/bg5.jpg` (download to
`public/images/hero/buying-bg5.jpg`; it's the interior-with-staircase photo) with the same
dark scrim treatment as now. Keep every existing hero element (phone + Book Free Consultation
CTAs, microcopy) — checked and already at parity.

### B2. "Start Your Home Search" — LAPTOP mockup, not a photo collage
Live: black section, copy left, right = a laptop-frame mockup whose screen is a listings GRID
(6-8 small cards with prices). Replace our 2×2 photo collage with a laptop frame (reuse/adapt
the CSS laptop pattern already built on /selling "Making Your Listing Shine") whose screen
shows OUR real cards: render 6 compact listing tiles from the same data source the home rails
use (server-fetched, no client MLS calls, photos via our own /api/media route). START
SEARCHING button stays.

### B3. "Get Listing Alerts" — PHONE + "SAVE A SEARCH" modal mockup
Live: right side = phone mockup + an overlapping "SAVE A SEARCH" panel mockup. Build: phone
frame (CSS, like /financing's phone mockup) showing a mini listing-alert feed, overlapped by
a white "Save a Search" card mockup (name field + SAVE THE SEARCH button visual, non-
functional decoration, aria-hidden). Our current single alert-card is too thin vs live.

### B4. "Save and See Listings" — TOUR-SCHEDULER card mockup
Live: right side = a listing-card mockup with photo, price "$850,000", "3 Bed | 2 Bath",
address line, tabs [Schedule a Tour | Request Info], a 3-date strip (e.g. Sat 10 / Sun 11 /
Mon 12) and an IN PERSON TOUR black button; a thin-line octagon/compass ornament sits behind
the left copy. Rebuild our card to this anatomy (decorative, aria-hidden, no live handlers),
using one of OUR real listings' photo/price for honesty. Keep the YOUR SAVED HOMES CTA.

### B5. Keep
Hero CTA row, The Home Buying Process copy, Making An Offer And Closing (incl. our extra
BOOK YOUR FREE CONSULTATION button — ours-better), footer. Don't touch them.

## PAGE 3 — targeted touch-ups (after Home + Buying are verified)

### S1. Selling hero visibility
`selling-ours.png` renders near-black; live (`resized_image_1600x1066.png` — twilight
mansion) is clearly visible. Use live's own asset (download to public/images/hero/) or lift
our scrim so the house reads. Compare rendered shots side by side; the mansion must be
visible at 1440 while the white headline still clears 4.5:1.

### S2. Selling "Innovative Internet Marketing" collage
Ours = laptop with EMPTY white boxes; live = recognizable portal screenshots collage. Fill
our mockup screens with real-looking content (our own /search UI screenshot is honest and
on-brand: take a Playwright screenshot of our live /search at a listing-grid state, save to
public/images/selling/, and use it inside the laptop frame + phone).

### S3. Hero-asset parity, remaining pages (only if budget remains)
- connect: live hero = woman-with-coffee photo (color). Extract its URL from live DOM
  (background-image on the hero block) and use it. Ours is a grayscale generic.
- financing: live = `blogmanpaperwork.jpg` (hands signing). Ours (laptop+calculator) is
  close in spirit; swap only if trivial.
- blog: live hero = photo (`9087/woman-on-social-media-website.jpg`) with dark scrim;
  ours = flat black band. Put the photo behind our existing band (keep our copy).

## Match-or-beat rules (binding)
- Anti-AI-slop: no gradient text/buttons, no purple primaries, no neon cyan, ZERO em dashes
  in visitor copy, no arrow-glyph CTAs (SVG chevrons fine), focus-visible >= 3:1, tap targets
  >= 24px, body >= 16px mobile, no h-overflow at 390 or 320, reduced-motion clean.
- Where live uses reCAPTCHA/em-dashes/text-arrows we deliberately do NOT copy those.
- Every downloaded live asset goes under `public/images/` with a comment noting its source
  URL in the component that uses it.
- Verify every change in the RUNNING dev server (127.0.0.1:3000 — reuse it, NEVER start a
  second; never `next build` while it runs) with Playwright shots at 1440 AND 390; keep
  `npx tsc --noEmit` + `npm test` green (foreground); commit page-scoped as you go; never push.
- Do NOT touch: MLS sync/backfill code, /api/cron/*, security headers beyond the single CSP
  frame-src addition, Supabase policies, other pages not listed here.
