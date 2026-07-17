# PARITY MAP — /home-value vs live realtylt.com/home_value

Written 2026-07-17 by the orchestrator (Playwright deep-map + inventory diff + visual compare).
GOAL: ~99% parity + beat live where we already do. Our design system, anti-AI-slop rules.
Evidence (gitignored): docs/_audit/homevalue-parity/{live,ours}-{1440,390}.png + .json.

## Live anatomy (short page, 1440 = 2049px)
1. HERO (near-full-viewport dusk house photo): H1 "How Much Is Your Home Really Worth?",
   an address bar — "Enter Home Address" + "Unit # (optional)" + black "Find Out" — reCAPTCHA
   fine-print, then H4 "Join over 300,000 homeowners in finding your home's value".
2. FOOTER BAND: standard First/Last/Email/Phone/lead-type-select/Message + "SEND US A
   MESSAGE" + REACH OUT block. That's the whole page.
3. HIDDEN WIZARD: the same 8-step post-submit qualifying popup as /selling + /financing lives
   in this page's DOM (spec in docs/parity/PARITY-selling.md). Live attaches it site-wide.

## Our current state (already BETTER than live)
app/home-value/page.tsx (server component) + components/leads/HomeValueForm.tsx (client):
- Hero with our own bright house photo, same address bar (address REQUIRED on ours), honest
  coverage line "Join the homeowners across the Hudson Valley and NYC..." (live's "300,000"
  is a Brivity-network vanity number — ours is truthful; KEEP ours).
- Address bar submit REVEALS an inline contact card (shared LeadForm) with the address
  prefilled → POSTs /api/lead. The /selling wizard's "My Home Value" branch already deep-links
  here via ?address= (server reads searchParams, seeds HomeValueForm) — verified working in
  the selling probe.
- A "A Valuation You Can Actually Act On" 3-step section (Tell us about your home / We run the
  comps / You get both numbers) — real, honest, better than live's bare page.
- Cross-link "Thinking cash offer instead? Compare both paths on the selling page".
- Footer already First/Last. Console: 12 third-party gtag errors (0 ours).

## GAP LIST (small — this page is mostly ahead)
H1. WIZARD ON /home-value — add "/home-value" to WIZARD_PATHS in QualifyingWizard so the
    revealed contact-card submit AND the footer form open the qualifying wizard (parity with
    live's site-wide attach). A home-value visitor is a SELLER — make the confirm copy
    seller-appropriate (comps/cash-offer wording, like /selling), and it's fine if they still
    pick buying/selling/both first (matches live). Do NOT change /selling or /financing
    behavior; /buying etc. must still NOT open it. qualifier follow-up POST carries
    source:/home-value. Full a11y already built — keep it.
H2. DRIVE THE VALUATION FLOW (the checkpoint's owed item) — verify end-to-end: address bar →
    reveal card (address shown + prefilled) → submit → wizard → confirm; the ?address= deep
    link from /selling still seeds correctly; empty address handled; the revealed card's
    "Find Out" submit label reads well post-reveal.
H3. 390 PASS — ours 390 = 3126px; check hero legibility over the photo, address bar stacking
    (address + unit + button), tap targets ≥24px, body ≥16px, no h-overflow (currently none).
H4. CONSOLE — 0 from our code (12 current are third-party gtag; leave them).
H5. HERO POLISH (optional, only if time) — the mapped hero photo reads a touch busy behind the
    headline at 1440; ensure the scrim keeps the H1 at ≥4.5:1. Don't redesign; just verify/tune.

## Match-or-beat rules
KEEP everything ours already does better (honest coverage copy, the 3-step section, the
selling cross-link, required address). NO em dashes, no arrow glyphs, no gradient text/buttons,
no purple/cyan, focus-visible ≥3:1, tap ≥24px, body ≥16px mobile, reduced-motion clean. Live's
reCAPTCHA + "300,000 homeowners" claim are deliberately NOT copied. This is a light page — do
H1+H2 to a high bar, harden, then a genuine 390 + a11y sweep; don't invent scope.
