# Design round 38 — the emil + apple sweep, measured first

Written 2026-08-23 by the Fable orchestrator before any code was touched. The owner's ask for this
round: apply the `emil-design-eng` and `apple-design` skills to every page, fix the thank-you
photograph, give `/connect` a popup form, and keep the launch honest. This doc records what the
instrument measured today, what fresh eyes saw, and the ranked build list handed to the builder.

## Baseline, measured today (scripts/score-page.mjs, warm dev server on :3100)

`--break` was run first and collapsed the home page to **16.5/60**, so the instrument can fail.
Two artifacts were caught and re-run before believing them: /buying died on a mid-run navigation,
and /selling scored D12 0/5 cold that became 5/5 warm. Warm numbers:

| page | today | r36 reference |
|---|---|---|
| / | 51 | 53.5 |
| /buying | 50 | 52.0 |
| /financing | 51 | 52.5 |
| /selling | 50.5 | 53.5 |
| /home-value | 54 | 56.0 |
| /who-we-are | 54.25 | 57.25 |
| /connect | 55.25 | 57.75 |
| /thank-you | 54 | 57.5 |

The uniform ~2-3 point drop against r36 is environmental (D11 LCP/long-task on today's dev server
penalizes every page), not eight simultaneous regressions. What matters is the per-dimension
penalty map, and the before/after delta under identical conditions.

## The pooled penalty map (what the points actually leak on)

| penalty | pages hit | note |
|---|---|---|
| D9 body copy under 16px on mobile | **all 8** | one systematic fix, eight points |
| D2 off-scale heading sizes | 7 of 8 | type scale drift; the single biggest visual win |
| D11 long task over 200ms | all 8 | partly dev noise; verify on prod build before chasing |
| D3 more than 4 text left edges | 5 | alignment grid drift |
| D6 focus stops with no visible ring | home, who-we-are, connect | who-we-are loses 2.5 alone |
| D1 hero ratio < 1.35 and/or >90 words above fold | buying, financing, selling | the hero is over-written and under-sized |
| D4 unsized images (CLS) | home, buying | width/height or aspect-ratio missing |
| D5 radii outside the scale | buying, financing, selling | 8/12/16/24/full only |
| D5 colours outside the token set | home, selling | |
| D7/D11 scroll jank | selling | p95 over 20ms, worst frame over 33ms; find what runs on scroll |
| D10 text below AA | selling | one surface, -0.5 |

## Fresh eyes at 1440 (scorer screenshots, looked at, not skimmed)

**What already reads luxury and must not be churned:** the black-and-white photography treatment
with the restrained ink/paper palette; the serif display headlines that mix roman and bold weight
("Let's Find Home", "Thank you"); the home hero's 3D architectural render, which is distinctive
and not stock; the pill CTA language used consistently; the footer's existing Equal Housing
Opportunity mark and REALTOR® line.

**What reads generic or wrong:**

1. **The thank-you photograph** (`millerton-night.jpg`) is the owner's named complaint and he is
   right: a murky night street with power lines crossing the frame, blown-out light flares, a
   brown-orange cast, and parked cars. Nothing about it says "you are in good hands" or "home."
   The page around it is good. The photo needs to be an arrival image: warm, calm, residential.
2. **The buying/financing/selling heroes are over-written.** "Ready to Find Your Dream Home?" plus
   an eyebrow plus a two-line paragraph plus two CTAs plus a trust line is more than ninety words
   above the fold, and the H1 is not big enough to lead it (ratio under 1.35). The apple-design
   lens names this exactly: hierarchy comes from order, spacing, and contrast, and the most
   important thing must be the most obvious. Also "an army of experts" and the title-case question
   headline both break the house voice (professional, plain, no hype).
3. **`/connect`'s body offers only the Gmail booking.** A visitor who does not want to book a slot
   gets a phone number, an email address, and a scroll to the footer. The owner asked for a popup
   form; the modal pattern exists in `components/leads/ListingLeadCTAs.tsx` and must be reused,
   not reinvented.
4. **Focus is inconsistent.** Three pages have focus stops with no visible ring at all; the rest
   of the site earned its 3:1 rings rounds ago. This is a regression of consistency, the apple
   principle of familiarity: things that look the same must behave the same.

## The ranked build list (impact first)

1. **Mobile body floor.** Every text node that the rubric counts as body copy reaches 16px at 390.
   Eight pages, one point each. Find the shared source (likely a small-text utility or a
   component default) rather than patching per page.
2. **Type scale.** One heading scale, applied everywhere; kill the off-scale sizes on 7 pages.
   Tracking follows apple-design: tighten large display text (about -0.02em), body near 0.
3. **Hero discipline on buying/financing/selling.** Raise the H1 to the display scale, cut the
   above-fold word count under 90 by moving the reassurance line below the fold, and rewrite the
   headline in the house voice (statement, not a title-case question; no "army of experts"
   anywhere on the page).
4. **Focus rings** on home, who-we-are, connect: every focus stop visible, ≥3:1 against its
   backdrop, consistent with the site's existing ring style.
5. **Thank-you photograph** replaced with a licensed or generated arrival image; licence recorded
   in `public/images/ATTRIBUTIONS.md`; old file removed if unreferenced.
6. **`/connect` popup form** reusing the existing lead modal, placed as the equal alternative to
   the booking ("Would rather not pick a slot?" already invites it — make that a button that
   opens the form, keep the call/text line).
7. **Left-edge alignment pass** on the five D3 pages: one content grid, no ad-hoc indents.
8. **Unsized images** on home and buying get intrinsic dimensions.
9. **Radii and colour tokens** normalized on the D5 pages (8/12/16/24/full; token colours only).
10. **Selling scroll jank**: find what runs per scroll frame, bound it (passive listeners, rAF
    coalescing, content-visibility where apt). No new scroll-motion system — round 37 rejected
    parallax/pinning on merit and that decision stands.
11. **Press feedback per emil-design-eng** where missing: pressable elements get an active state
    (scale about 0.97, 100-160ms, strong ease-out), instant on pointer-down. Custom cubic-bezier
    curves rather than built-ins where transitions exist.
12. **D11 long tasks**: measure once on a prod build before optimizing anything; dev-server noise
    is not a defect.

## What this round must not do (carried from the round 38 brief, binding)

- The consent checkbox stays exactly as shipped: one required box, JS-validated, no `required`
  attribute, no decline option. Decided by the owner twice.
- New Listings does not drift; only Featured drifts.
- No parallax, no scroll-pinning, no new scroll-motion system.
- `OUTBOUND_FOLLOW_UP_LIVE` stays false.
- No CSP, auth, RLS, or security-control changes.
- No MLS Grid data-API or media call anywhere near a page path; probes block `**/api/media/**`.
- Anti-slop rules bind: no gradient text or buttons, no purple primary, no neon cyan, no em
  dashes in visitor copy, no arrow glyphs stapled to CTAs.
