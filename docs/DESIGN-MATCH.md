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

## NEXT STEP FOR SUCCESSOR

All pages are matched/restyled. Remaining polish candidates (optional):
- 390px pass page-by-page vs *-390.png references (spot-checked home only).
- privacy/dmca/legal pages still carry harmless font-display/font-mono classes.
- scripts/extract-live-tokens*.mjs are one-off extraction tools (kept for reference).
Deploy after any change: PowerShell Start-Process npx.cmd -ArgumentList
vercel,deploy,--prod,--yes -Wait; prod alias https://realtylt-website.vercel.app;
then node scripts/final-probe.mjs against the live URL.
3. Verify recipe: `npm run build`; kill port 3777 (PowerShell Get-NetTCPConnection);
   `(npx next start -p 3777 &)`; `MSYS_NO_PATHCONV=1 node scripts/shot.mjs
   http://localhost:3777 docs/design-match /search ...` (bare `/` = home, no arg).
   Read both shots vs reference. NOTE: after rebuild, RESTART the server (stale
   chunk hashes → MIME console errors).
4. Deploy at the end (see brief): Start-Process npx.cmd vercel deploy --prod.
5. Remaining cleanup candidates: valley-line components once no page uses them;
   scripts/extract-live-tokens*.mjs are one-offs (kept for reference).
