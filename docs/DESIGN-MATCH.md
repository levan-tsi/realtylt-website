# DESIGN-MATCH — restyle to match LIVE realtylt.com (Brivity)

Living checklist for the design-match effort. Goal: page-by-page fidelity to the
live site (docs/reference/*.png). Small deviations only where clearly better.

## Extracted live design tokens (Playwright getComputedStyle, 2026-07-10)

- **Font: Lato** everywhere (`Lato, Helvetica, Arial, sans-serif`) — NOT Nunito
  (brief §2 guessed Nunito; computed reality is Lato). Weights: 300 light
  (h1/h2/footer links), 400 body, 600→700 buttons, 700 nav/bold headings.
- Body: 16px/27.55 #808080 on #ffffff. Paragraph #555555.
- Nav links: 16px 700 UPPERCASE #808080, hover #000000. CONNECT boxed:
  1px solid #808080, padding 10px 20px.
- Header stack (top→bottom): utility bar 41px bg **#f3f5f8** (Sign In #aaa right)
  → Fair Housing bar 48px bg **#d3d6d9** → white logo row (logo 300x62)
  → nav row; header border-bottom 1px **#dddddd**; NOT sticky.
- H1 hero: 60px/300 white. H2 sections: 36px, weight 300 or 700, gray/black mix.
- Buttons: primary = **black bg**, white, 14px/600 UPPERCASE, ls 1.4px,
  radius 4px, pad 12px 20px. Outline = 2px solid #000, radius 0 (SEE MORE
  LISTINGS). Hero outline = 1px solid #fff on dark.
- Listing cards: photo tile + dark bottom gradient; white bold price (~24px),
  white address, "N bd | N ba | N sqft", tiny "Listed With …", black View chip.
- Alt section bg: **#f3f5f8**. Footer: white, ~100px pad, links 14px/300 #222222.
- Logo colors: navy **#102c54** + azure **#28a8e0** (sampled from the PNG).
  Live logo saved to `public/logo-realtylt.png` (from cdn1.brivityidx.com).
- Hero overlay: rgba(0,0,0,0.5); hero photo is desaturated/B&W.

## Token mapping (app/globals.css @theme)

| token | old (Hudson Twilight) | new (live-match) |
|---|---|---|
| ink | #101820 | **#000000** |
| ink-soft | #1b2530 | **#222222** |
| paper | #fafaf8 | **#ffffff** |
| mist | #edf0ef | **#f3f5f8** |
| stone | #646c77 | **#767676** (live #808080, nudged for WCAG AA 4.54:1) |
| river | #2b6cb0 | **#102c54** (logo navy — focus rings/accents) |
| porchlight | #e8b04b amber | **#28a8e0** (logo azure — tiny accents only) |
| porchlight-deep | #8a5f10 | **#1c729a** |
| font-display/sans/mono | Fraunces/Nunito/Spline | **all → Lato** (300/400/700) |

## Decisions / deviations (recorded, all "clearly better" or forced)

1. **Lato not Nunito** — live computed styles are ground truth over brief §2.
2. Grays nudged for WCAG AA: body/nav #808080→#767676; Fair Housing bar text
   #808080→#3f4952 (live fails AA on #d3d6d9); constraint says keep a11y.
3. Utility top bar: live has social icons + "Sign In" (Brivity IDX login).
   We have no login; kept the bar with phone (left) + Saved ♤ link (right).
4. Footer bottom black bar: live says "Powered by Brivity" — false for us;
   black bar kept with © + Privacy/DMCA/Sitemap links instead.
5. LeadForm keeps single "Name" field (API contract) vs live First/Last split;
   placeholder-driven look with sr-only labels (a11y kept).
6. Kept extra sections live-home doesn't have (counties pills, testimonials) —
   constraint "don't remove sections"; restyled neutral to fit live look.
7. Kept subtle Reveal fade-ups + hover lifts (don't fight the live aesthetic).
8. ListingCarousel component now unused (home uses live-style 4-col grid);
   file kept in repo intentionally.

## Shared shell — DONE

- app/layout.tsx — Lato via next/font (self-hosted, no CSP change needed);
  FairHousingBar moved inside Header.
- app/globals.css — tokens above; selection azure.
- components/site/Header.tsx — full live stack (utility/fair/logo/nav+dropdown),
  non-sticky, boxed CONNECT, mobile sheet.
- components/site/FairHousingBar.tsx — #d3d6d9 strip.
- components/site/Footer.tsx — white 3-col (links / form / logo+REACH OUT),
  legal line, black bottom bar.
- components/ui/Button.tsx — live variants (black primary, 2px outline, white
  outline-light, ghost black).
- components/ui/Field.tsx — #ccc borders, square, placeholder-gray.
- components/ui/SectionHeading.tsx — Lato 36px light, no ValleyUnderline.
- components/ui/StatCounter.tsx — light-bg (ink number / stone label).
- components/leads/LeadForm.tsx — placeholder look, neutral success box.
- components/idx/ListingCard.tsx — live overlay tile (gradient/price/View chip).

## Per-page status

| page | status | note |
|---|---|---|
| shell (header/footer/tokens) | DONE | verified home 1280+390 vs reference |
| Home / | DONE | hero B/W + search strip, value split, 4-col Featured/New grids, centered SEE MORE, Why gray section; shots in docs/design-match/home-*.png |
| /search | DONE | live filter bar (slim uppercase dropdowns + black SEARCH/SAVE SEARCH), gray chips + meta strip, white-body `plain` card variant, gray pagination |
| /selling | DONE | light+bold hero + dark form card, numbered 1/2 path cards w/ black bands, black no-pressure band, white CLIENTS SAY, black Pricing/Loop w/ white `light` buttons |
| /buying | DONE | centered hero (phone + white CTA), black steps 1-2, white Save&See, black Offer&Closing |
| /financing | DONE | thin hero, Demystifying, black Pre-Approval + letter card (red APPROVED), calculator = black inputs/light results (heading inside), gray App&Processing, black Closing |
| /home-value | DONE | live minimal page: full photo, centered SERIF headline (live uses serif here), white centered form, serif subline; kept How-it-works below |
| /connect | DONE | thin photo band, portrait left (live asset public/images/levan-portrait.jpg) + appointment cards right, Send Us A Message section |
| /top-areas + 6 county pages | DONE | live /top_areas is BLANK (dropdown-only) and county links = pre-filtered /search (which matches); our SEO hub+county pages kept, restyled neutral (ValleyMap removed, plain cards) |
| /who-we-are | DONE | live match: team-bg band + "Who We Are", circular B/W portrait, CALL/CONTACT stacked; bio + values kept below |
| /reviews | DONE | no live equivalent — neutral restyle (light/bold hero, gold stars, white light button) |
| /blog (+ posts) | DONE | live match: laptop band "Stay Up To Date", featured split w/ black READ MORE, centered date/title grid; post page neutralized |
| /listing/[id] | DONE | badges/checks/breadcrumbs neutralized; heart = red |
| /saved, 404 | DONE | neutralized (light/bold headings, no porchlight) |
| /privacy-policy, /dmca-terms | OK AS-IS | plain legal pages; font-display classes now render Lato via tokens |

Also: components/valley-line/* DELETED (fully orphaned by restyle) + .vl-draw CSS
removed; FavoriteButton saved-state is red (was amber).

## ROUND 1 REFINEMENT PASS (2026-07-11) — LIVE-Playwright side-by-side

New tool: `scripts/compare-live.mjs` — captures the LIVE realtylt.com page and the local
build fresh (same viewport, full page, scrolled) and composes a side-by-side sheet into
docs/round1/compare/<slug>-<width>-sxs.png. Run: `node scripts/compare-live.mjs
http://localhost:3777 docs/round1/compare [slug…]`; `WIDTH=390` env for mobile. Local
server should run in FIXTURE mode for design shots (move .env.local aside + rebuild) so
screenshot loops never spend the MLS media budget.

Changes made this round (all verified against fresh LIVE captures, not just the static
references):
- **Home**: hero subtitle removed + band shortened (live shows the headline alone);
  the 3-card "Kind Words" section replaced by `TestimonialBand` (ONE centered quote,
  prev/next arrows, gray strip) placed between Featured and New — exactly live's flow.
  Mobile: both listing rails are now swipeable snap carousels (<sm) like live, grid ≥sm
  (page height 11.5k→6.4k px at 390). TestimonialCard remains for /reviews.
- **Buying**: hero photo was nearly invisible (opacity-40 + black/50) — now opacity-75 +
  black/40, matching live's clearly readable interior.
- **Home Value**: hero rebuilt to live's layout — taller centered photo, serif headline,
  ONE horizontal bar [address][unit #][black FIND OUT] (`HomeValueForm`, two-step: bar
  first, contact card revealed on submit so lead capture is preserved), serif subline.
- **Financing**: sheet suggested the Pre-Approval band was white; computed-style check
  proved it black (rgb(0,0,0)) — no change (lesson: verify via getComputedStyle when a
  scaled sheet is ambiguous).

Similarity estimates after this round (vs fresh live captures, 1280): home ~92%,
search ~90% (live defaults to hybrid list+map; ours grid+map toggle — recorded
deviation), selling ~92%, buying ~90%, financing ~90%, home-value ~93%, connect ~90%,
top-areas n/a (live page is dropdown-only/blank — ours intentionally richer),
who-we-are n/a (live is an agent-search product page — ours is the matched band +
bio), reviews/saved/404 = no live equivalent (neutral restyle). Mobile 390 sheets
captured for home/search/selling/buying/financing/homevalue/connect — selling+home
verified in detail; no horizontal scroll anywhere (QA suite).

## ROUND 2 REFINEMENT PASS (2026-07-11) — sheets in docs/round2/compare

- **/search — hybrid list+map is now the DEFAULT** (live pins `view=hybrid_view`): 2-col
  card list left + sticky Leaflet map right at lg; `?view=grid` keeps the grid and is the
  only view value written to the URL (map = default = clean URL). Mobile: cards stack,
  map renders below at 55vh — verified at 390, no overflow. Filter bar now fits ONE row
  at 1280 (input basis-44, gap-x-4, buttons px-4) with SAVE SEARCH inside the bar like live.
- **/connect hero flipped to live's LIGHT band** — washed photo (opacity-70 + white/50
  overlay) with dark `text-ink-soft` title on bg-mist (was dark w/ white text).
- **/buying hero** py-28 md:py-36 (was py-20/24) — live's band is ~1.5-2x taller.
- **/financing checked, NOT changed**: the sheet again suggested a white Pre-Approval band;
  getComputedStyle proves section bg rgb(0,0,0) — the Round-1 lesson holds (sheets can lie
  at scale; computed styles are ground truth).
- Mobile 390 sheet-checks done for the previously unchecked pages: county page
  (top-areas/dutchess) + /reviews — clean, no overflow (docs/round2/*-390.png).
- Similarity after this round (vs fresh live captures @1280): search ~95 (hybrid default
  closed the biggest structural gap), connect ~94, buying ~93, home/selling/home-value
  unchanged ~92-93, financing ~90 (remaining gap = live's laptop/phone mockup assets we
  don't have — recorded deviation).

## NEXT STEP FOR SUCCESSOR

- Optional remaining polish: live "Why Work With Us" product-screenshot carousel has no
  equivalent asset (text cards kept — recorded deviation); search hybrid list+map default;
  privacy/dmca legal pages carry harmless font-display/font-mono classes.
- Verify recipe: `npm run build`; kill port 3777 (PowerShell Get-NetTCPConnection);
  `(npx next start -p 3777 &)`; `MSYS_NO_PATHCONV=1 node scripts/shot.mjs
  http://localhost:3777 docs/design-match /search ...` (bare `/` = home, no arg) — or the
  live side-by-side via scripts/compare-live.mjs. NOTE: after rebuild, RESTART the server
  (stale chunk hashes → MIME console errors).
- Deploy: PowerShell Start-Process npx.cmd -ArgumentList vercel,deploy,--prod,--yes -Wait;
  prod alias https://realtylt-website.vercel.app; then node scripts/final-probe.mjs.
- Cleanup candidates: components/idx/ListingCarousel.tsx is now fully orphaned (home
  rails use inline snap-scroll); scripts/extract-live-tokens*.mjs are one-offs.
