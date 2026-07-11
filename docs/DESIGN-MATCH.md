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
| /search | NOT STARTED | next up |
| /selling | NOT STARTED | |
| /buying | NOT STARTED | |
| /financing | NOT STARTED | |
| /home-value | NOT STARTED | |
| /connect | NOT STARTED | |
| /top-areas + 6 county pages | NOT STARTED | uses ValleyMap — restyle/neutralize |
| /who-we-are | NOT STARTED | |
| /reviews | NOT STARTED | |
| /blog (+ posts) | NOT STARTED | |
| /listing/[id] | NOT STARTED | check after card restyle |
| /saved, /privacy-policy, /dmca-terms, 404 | NOT STARTED | inherit shell; spot-check |

## NEXT STEP FOR SUCCESSOR

1. `/search`: view docs/reference/search-1280.png + search-390.png, restyle
   components/search/SearchClient.tsx (filter bar, grid, map toggle) to live
   look (white bg, gray text, black buttons, live-style cards already done).
2. Then Selling → Buying → Financing → Home Value → Connect → Top Areas(+counties)
   → Who We Are → Reviews → Blog, committing per page.
3. Verify recipe: `npm run build`; kill port 3777 (PowerShell Get-NetTCPConnection);
   `(npx next start -p 3777 &)`; `MSYS_NO_PATHCONV=1 node scripts/shot.mjs
   http://localhost:3777 docs/design-match /search ...` (bare `/` = home, no arg).
   Read both shots vs reference. NOTE: after rebuild, RESTART the server (stale
   chunk hashes → MIME console errors).
4. Deploy at the end (see brief): Start-Process npx.cmd vercel deploy --prod.
5. Remaining cleanup candidates: valley-line components once no page uses them;
   scripts/extract-live-tokens*.mjs are one-offs (kept for reference).
