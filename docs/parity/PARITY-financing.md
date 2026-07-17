# PARITY MAP — /financing vs live realtylt.com/financing

Written 2026-07-16 by the orchestrator (Playwright deep-map + inventory diff + visual compare).
GOAL: ~99% structural/functional parity with live, our design system, anti-AI-slop rules.
Evidence (gitignored): docs/_audit/financing-parity/{live,ours}-{1440,390}.png + .json.

## Live anatomy (1440), top to bottom
1. HERO: full-width photo (signing loan documents at a desk), centered mixed-weight title
   "The Home Loan Process". Short hero.
2. DEMYSTIFYING HOME LOANS (white, centered): H2 + intro paragraph (pre-approval to closing,
   we partner with the best lenders...).
3. GET PRE-APPROVAL (black): text LEFT (Loan Officer, income/assets/debts, credit report,
   W-2s, pay stubs, tax returns, loan programs); RIGHT white mockup card "Loan Pre-Approval
   Letter": circled check top, LOAN AMOUNT $455,000 (accent color), MONTHLY PAYMENT $3,500,
   REPAYMENT TERM 30 years, signature squiggle + red APPROVED stamp, progress dots.
4. ESTIMATE YOUR MONTHLY PAYMENT (split black form / white result):
   fields Price 500000 · Annual Tax 6000 · Loan Term (Years) 30 · Down Payment % 20 ·
   Interest Rate % 6 · Monthly HOA 100 · Monthly Insurance 200 · RESET.
   Result: huge "$3,198.20" + "Estimated Monthly Payment" + segmented progress bar +
   dot-bulleted breakdown: Principal $2,398.20 (75.0%) · Taxes $500.00 (15.6%) ·
   HOA $100.00 (3.1%) · Insurance $200.00 (6.3%). Live updates as inputs change.
5. HELPING YOU GET THE BEST LOAN (white): LEFT H2 + H3 "START THE PROCESS" + para + inline
   form First Name / Last Name / Email / Phone / Your Message (message REQUIRED on live) +
   "LET'S GET STARTED"; RIGHT: black iPhone mockup — Brivity "Estimated Value of
   Homeownership" screen (Appreciation $21,920 · Principal Reduction · Tax Savings ·
   Total +$33,078).
6. APPLICATION & PROCESSING (light gray): LEFT H2 + H3 'WHAT HAPPENS WHEN A LOAN GOES
   "LIVE"' + para; RIGHT: browser-window mockup with an "Application" checklist.
7. CLOSING (black): H2 + H3 "SIGNING AND FINALIZING THE DEAL" + para ("...Congratulations,
   happy homeowner!"). No mockup.
8. FOOTER BAND: standard First/Last form + REACH OUT block. reCAPTCHA on live (we skip).
9. HIDDEN WIZARD: the same 8-step post-submit qualifying popup as /selling exists in this
   page's DOM (see docs/parity/PARITY-selling.md for the full spec) — live attaches it to
   every lead form site-wide.

## Our current state
app/financing/page.tsx + the MortgageCalculator component (checkpoint: reproduces live's
$3,198.20 with defaults; regression-free `initial` prop used by listing pages — DO NOT
break). Sections 1-8 all present in order; footer already First/Last. Console: 12 errors,
all third-party gtag noise (0 ours). Heights: live 6135 vs ours 4187 @1440 — the delta is
mostly the missing right-side mockups.

## GAP LIST (prioritized)
F1. WIZARD ON /financing — the QualifyingWizard (built for /selling) must also fire here:
    after successful submit of the "LET'S GET STARTED" inline form AND the footer form on
    this page. Generalize the pathname gate (e.g. an allowlist or provider prop) WITHOUT
    changing /selling behavior and WITHOUT enabling other pages yet. Same qualifier
    follow-up POST. Full a11y already exists — keep it.
F2. BEST-LOAN SECTION PARITY — split the inline form First/Last (live's field set: First,
    Last, Email, Phone, Message-required, no select visible), and add the RIGHT-side phone
    mockup: our own "value of homeownership" phone card (design-system styled, realistic
    illustrative numbers, labeled illustrative). Live rhythm: text+form LEFT, phone RIGHT.
F3. APPLICATION & PROCESSING mockup — add the browser-window application-checklist mockup
    on the right (CSS mockup like selling's laptop frames; our own content).
F4. PRE-APPROVAL LETTER CARD — enrich to live's card: circled check, signature squiggle
    (SVG), progress dots. Keep our type/colors.
F5. RESET BUTTON — "↺ RESET" uses an arrow glyph (anti-slop violation): replace ↺ with an
    inline SVG icon or plain text.
F6. CALCULATOR interactions hardening — drive it live: change price/rate/term → result +
    breakdown update correctly; garbage inputs (0/negative/letters/empty) degrade sanely;
    RESET restores defaults. Add unit tests for edge cases if missing. Keep the `initial`
    prop contract intact (listing pages depend on it).
F7. 390 PASS — both pages' shots exist; fix stacking/tap targets/no h-overflow (currently
    none — keep). Calculator usable at 390.
F8. CONSOLE — 0 errors from our code (12 current are third-party; leave the gtag include).

## Match-or-beat rules
Keep ours where better: breakdown label "Principal & Interest" (more accurate than live's
"Principal"), the estimate disclaimer line, the 3 value checkmarks, "SEE THE FULL BUYING
PROCESS" cross-link, our hero photo (equivalent mood). NO em dashes, NO arrow glyphs, no
gradient text/buttons, no purple/cyan, focus-visible ≥3:1, tap ≥24px, body ≥16px mobile,
reduced-motion clean. Live's reCAPTCHA and required-Message are noted: keep Message
optional (friendlier) — that's a deliberate improvement, not a miss.
