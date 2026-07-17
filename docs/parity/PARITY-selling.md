# PARITY MAP — /selling vs live realtylt.com/selling

Written 2026-07-16 by the orchestrator after a full Playwright mapping pass (screenshots +
structural inventory + CTA behavior probe + hidden-DOM wizard extraction). This is the work
order for the page agent. GOAL: bring our /selling as close as possible to the live page —
same structure, same functionality, every popup and click working — while keeping our design
system (Hudson Twilight ink/paper + porchlight azure) and the anti-AI-slop rules.

Evidence on disk (gitignored): docs/_audit/selling-parity/{live,ours}-{1440,390}.png,
{live,ours}.json (full inventories: headings/links/buttons/forms/images/console errors),
live-cta-*.png, live-hero-validation.png.

## Live page anatomy (1440), section by section

1. HERO (tall, ~900px, dark twilight house photo, readable):
   - Left: H2 "See Your Home's Cash Value vs Market List Price" (mixed-weight emphasis),
     sub "Get a guaranteed fair Cash Offer in 24 hours OR list with us for maximum profit.
     You compare, you decide." Google ★★★★★ 5.0 badge + "Fast Response" chip +
     "Free Consultation" + "No obligation • Zero pressure • Honest advice" bullets +
     phone chip "(917) 905-7923" (tel: link).
   - Right: form card "Get Your Cash Offer & Home Value" — 4 stacked required fields:
     Full Name / Email Address / Phone Number / Full Property Address; submit
     "GET MY FREE OFFER & ANALYSIS"; microcopy "Takes less than 60 seconds" UNDER the button.
     Native required validation (no custom error UI).
2. CHOOSE THE PATH: centered H2 + sub, then two cards w/ floating numbered circles (1)(2):
   - Card headers are SOLID BLACK BLOCKS holding title + subtitle in white:
     "FAST CASH OFFER / Get cash in 15-30 days - perfect for homes that need work or
     sellers who need speed" · "TRADITIONAL LISTING / Get maximum value - perfect for
     move-in ready homes and sellers who have time".
   - Banner strip: "Free Cash offer in 24-48 hours" / "Get top market value".
   - 2-col ✓ lists — CASH: Sell AS-IS - zero repairs · Guaranteed closing · No agent fees ·
     No showings · Choose closing date · Skip the hassle. LISTING: Pro photos & tours ·
     Staging consult · MLS + 100+ sites · Full marketing · Expert pricing · Max exposure.
   - "PERFECT IF YOU HAVE:" / "PERFECT IF YOU WANT:" italic qualifier lists.
   - CTAs "GET YOUR FREE CASH OFFER" / "GET FREE CONSULTATION" (live: arrow glyphs — we
     do NOT copy the glyphs, anti-slop rule).
3. BLACK BANNER: "NOT SURE WHICH OPTION IS BEST? WE'LL SHOW YOU BOTH - NO PRESSURE." + sub.
4. WHAT OUR CLIENTS SAY: 3 Google-review cards (Google logo + stars header) +
   "See all our Google reviews" link.
5. OUR PRICING STRATEGY (black bg): text left (H2, H3 "WE USE THE MOST ACCURATE METHOD...",
   para on 15 comparables — 5 active / 5 pending / 5 sold, H3 "WANT TO KNOW WHAT YOUR HOME
   IS WORTH?", CTA "GET MY HOME VALUE & CASH OFFER"); right: WHITE card "Comparable
   Property Statistics" with blue bar rows + "Suggested List Price $461,110 - $511,445".
6. MAKING YOUR LISTING SHINE (white): text LEFT (H2 + H3 "PHOTOGRAPHS, VIRTUAL TOURS, 3D
   WALKTHROUGHS AND VIDEOS" + para); RIGHT: laptop-frame mockup with a playable virtual
   tour (video play button).
7. INNOVATIVE INTERNET MARKETING (light gray): text LEFT (H2 + H3 "WE KNOW HOW TO REACH
   THE 92% OF BUYERS WHO SEARCH ONLINE" + para); RIGHT: multi-device collage of the
   listing marketed across portals.
8. STAY IN THE LOOP - EVERY STEP OF THE WAY (black): text LEFT (H2 + H3 "REAL-TIME UPDATES
   UNTIL YOUR HOME IS SOLD" + para), CTA "GET YOUR FREE CASH OFFER & ANALYSIS" +
   "Takes less than 60 seconds • No obligation"; RIGHT: laptop mockup of the seller portal
   (timeline of showings/feedback/offers).
9. CONTACT BAND + FOOTER: form (First Name / Last Name SPLIT, Email, Phone, lead-type
   select, Your Message textarea, SEND US A MESSAGE) + "REACH OUT" block (logo, 2247 Route
   55 Suite 9 Lagrangeville NY 12540, tel, email). reCAPTCHA Enterprise on live (we skip).

CTA behavior (probed): ALL section CTAs scroll to the hero form — none navigate, none open
a modal pre-submit. The wizard below fires AFTER form submit.

## THE QUALIFYING WIZARD (live's post-submit popup — extracted from hidden DOM, exact)

Brivity `.popupCTA` modal, steps (icon → headline → round option buttons):
1. followUp (house icon): "Are you buying or selling a home?" → Buying / Selling / Both
2. buyTimeline (search icon): "When are you planning on buying a new home?" →
   1-3 Mo / 3-6 Mo / 6+ Mo (+ Back)
3. mortgage (contract icon): "Are you pre-approved for a mortgage?" →
   Yes / No / Using Cash (+ Back)
4. consult (house icon): "Would you like to schedule a consultation now?" → Yes / No (+ Back)
5. scheduleConsult: "When would you like us to call?" → textarea "What times work for you?"
   + Submit
6. confirmConsult: "Thanks! We'll give you a call as soon as possible." → Done
7. sellTimeline (search icon): "When are you planning on selling your home?" →
   1-3 Mo / 3-6 Mo / 6+ Mo (+ Back)
8. consultOrValue: "Would you like to schedule a consultation or see your home value?" →
   Schedule Consultation / My Home Value (+ Back)

Branching: submit → (1). Buying → 2 → 3 → 4. Selling → 7 → 8. Both → 2 → 3 → 7 → 8 (or a
sensible merge — document what you choose). (4) Yes → 5 → 6; No → thank-you/close.
(8) Schedule Consultation → 5; My Home Value → route to /home-value with address prefilled.
Wizard answers must reach the lead record (extend the /api/lead payload or follow-up POST —
read app/api/lead/route.ts first and keep its tests green; add tests for the new shape).

## OUR CURRENT STATE (main branch)

app/selling/page.tsx renders all 8 content sections in the right ORDER using
components/leads/LeadForm.tsx (POSTs /api/lead), ui/{Button,Reveal,SectionHeading,Stars,
TestimonialCard}. Heights: live 7152px vs ours 5239px @1440. No wizard. 12 console errors
on ours in headless (gtag/doubleclick noise — verify benign, silence if trivial).

## GAP LIST (prioritized)

G1. QUALIFYING WIZARD — build it (components/leads/QualifyingWizard.tsx or similar):
    fires after successful LeadForm submit on /selling (hero + footer forms), accessible
    (focus trap, Esc closes, aria-modal, keyboard operable), reduced-motion clean, styled
    to OUR design system, mobile-friendly at 390. Answers persist to the lead. Add
    unit/integration tests for branching + the API payload.
G2. HERO PARITY — taller hero with the house photo actually visible (live uses a real
    twilight estate photo; ours renders almost black), mixed-weight headline, Google 5.0 +
    Fast Response + Free Consultation + bullets row, tel chip. Form card: 4 stacked fields
    matching live's order/labels (keep our honeypot + optional interest select if it fits
    cleanly; live's hero has NO select), microcopy under the button.
G3. PATH CARDS — black header blocks w/ white title+sub (live look), floating numbered
    circles, checklist copy EXACTLY live's 6+6 items/order, PERFECT IF blocks, CTAs.
G4. SHOWCASE SECTIONS RIGHT-SIDE MEDIA — 6: laptop-frame mockup w/ playable tour video (a
    stock/own clip or an elegant animated stand-in; NO copyrighted material), 7: device
    collage (build from our own screenshots of /search etc.), 8: laptop mockup of a seller-
    updates timeline (can reuse our timeline, framed in the laptop). Match live's
    text-left/media-right rhythm and section backgrounds (white / light gray / black).
G5. PRICING CARD — switch to live's WHITE "Comparable Property Statistics" card treatment
    with a realistic "Suggested List Price $X - $Y" range readout.
G6. CONTACT BAND — split First/Last name like live (api/lead may need name handling),
    match field order + select + message; REACH OUT block parity (address/tel/mailto).
G7. 390 PASS — compare docs/_audit/selling-parity/{live,ours}-390.png, fix stacking,
    spacing, tap targets ≥24px, body ≥16px, no h-overflow (currently none — keep it that way).
8.  CONSOLE — get ours to 0 unexpected console errors on load.

## Match-or-beat rules

Live's arrow glyphs (→ ↑), em dashes, and reCAPTCHA are NOT copied. No gradient text/
buttons, no #8b5cf6-family purple, no neon cyan. Keep focus-visible ≥3:1. WCAG: the wizard
must be fully keyboard + screen-reader usable (live's isn't — beat them there).
Copy: match live's copy where listed above; where ours is already better (richer review
cards with attribution, honest stats), KEEP ours — better beats identical.
