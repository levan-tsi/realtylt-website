# Design round 24 — the quiz, and the round's ledger

Owner's brief, verbatim: "plan and those on the left should be more interaqtive maybe when you
click on things poup quiz with shapes that u can choose to help you plan your journy more and
for us to get more info." Two goals in one feature: the visitor leaves with a plan they can
use, and RealtyLT learns who they are — in that order, because the second only happens when
the first is worth trading for.

## 1. What the quiz is

A step-by-step takeover, launched from /plan (its hero CTA) and from the rail's Plan item
(which now lands on `/plan?quiz=1`, opening the takeover over the page — "click on things,
popup quiz", literally). Each step is one question answered by choosing a large illustrated
option card — his "shapes". Every answer visibly extends a plan being drawn on the panel
itself, and the end state is not a thank-you: it is a TAILORED PLAN rendered into /plan —
their monthly budget turned into a price ceiling, their chosen areas with live home counts,
their next concrete stage, and one pre-filtered search link built from their answers.

The quiz asks for NO contact information until the plan is already on screen. The final,
skippable step offers to send the plan + matching homes; that form is the existing lead
pipeline with the existing ConsentCheckbox (unchecked, optional, the LEAD-CONSENT-CONTRACT
wording). Skip it and nothing leaves the page — answers live in React state, no storage, no
tracking. Privacy is part of the design, not a compliance patch.

## 2. Why this is not QualifyingWizard again

The template answer here is "modal with radio cards and a progress bar" — which the site
already owns (QualifyingWizard, post-lead-submit). Three deliberate departures:

1. **Progress is a route, not a bar.** The panel carries a thin drawn line — the same visual
   as the rail's Plan icon, a route between two dots — and each answered step adds a labelled
   stop along it. The metaphor is the site's own: "budget to keys" is a journey, and your
   answers are the stops. This is the one signature element; everything else stays quiet.
2. **The reward is real.** The wizard ends in "we'll call you". The quiz ends in a plan the
   visitor can use without giving anything: a price ceiling computed by `priceForMonthly`
   (binary search over the same calcMortgage as /financing — cannot drift), live counts for
   their areas from /api/idx/search, and a /search URL carrying their county, home type,
   price ceiling and must-haves — the round-24 facet tokens, so the quiz and the MORE panel
   speak one vocabulary.
3. **Identity comes last and is optional.** The wizard opens with identity already in hand.
   The quiz inverts it: plan first, hand-off offered after, consent strict and unchecked.

## 3. The steps

Buyer path (Both = buyer path + a selling stage in the plan):

1. **Path** — Buying / Selling / Both. Three shapes. (Renting deliberately absent: rentals
   are a separate surface and not the business's focus; the plan this quiz builds is a
   purchase/sale plan.)
2. **Timeline** — Ready now / 3 to 6 months / Next year or later. Tailors the first stage
   ("get pre-approved this week" vs "watch the market from the rail").
3. **Monthly comfort** — a picker of monthly amounts ($1,500 to $10,000). The plan shows the
   ceiling immediately: "$3,200/mo at 20% down and 6% ≈ $585,000." Assumptions editable
   later on /financing; stated inline in one quiet sentence.
4. **Pre-approval** — Yes / Not yet / Paying cash.
5. **Areas** — the eleven served areas as shapes, multi-pick, county names in the site's
   chip language. The plan step shows live Active counts for the picks.
6. **Home type** — House / Condo / Co-op / Multi-family (HOME_TYPE_OPTS, the honest set).
7. **Must-haves** — multi-pick over the honest facet vocabulary: central air, basement,
   garage, waterfront, first-floor bedroom, municipal utilities, near public transit. Each
   is a real generated column; nothing the search cannot answer is offered.
8. **The plan** — rendered into the page: ceiling, areas + counts, next stage, the search
   link, and the optional send-me-this hand-off (name/email/phone + ConsentCheckbox →
   existing /api/lead with `qualifier` carrying every answer and the built search URL, source
   "/plan#quiz").

Seller path: 1 → timeline → the plan (selling stages + /home-value CTA + the hand-off).
Short on purpose — a seller's next real step is a valuation conversation, not a facet list.

## 4. The visual language

- **Shapes** = option cards: 16px corners (card scale), 1.8-stroke round-cap line icons in
  the rail's drawing style (house gable, key, route, calendar, columns for a co-op — drawn
  for this site, no emoji, no clip-art). Rest: paper on mist border. Hover: mist fill.
  Selected: ink fill, paper text — the county chips' grammar. Focus: river ring, always
  visible.
- **The route spine**: desktop, a vertical line down the panel's left with a dot per
  answered step and the chosen word beside it; phones, the spine lies horizontally under
  the header, dots only. Thin ink lines, nothing animated except the new dot's single
  ease-in (and none under reduced motion).
- **Type**: the site's display face for the question (t-h3 scale), body for option labels,
  the uppercase-tracking utility style for the eyebrow ("Step 3 · Budget"). No new faces,
  no new colours, zero em dashes in visitor copy.
- **Takeover chrome**: full-screen sheet on phones, centered 640px panel on desktop over an
  ink/60 scrim; Escape closes, focus trapped, close restores focus — QualifyingWizard's
  accessibility contract, reused not reinvented.

## 5. Honesty rules the quiz binds to

- Every must-have is a live facet; the search link uses only whitelisted tokens.
- Live counts come from the same /api/idx/search the site answers everyone with.
- The ceiling states its assumptions ("20% down · 6.0% · 30 years · taxes estimated") in
  the same sentence, and its number is floored to $5k like /plan's bridge.
- No answer is required; every step has a quiet "Skip" that leaves that stop undrawn.
- Closing mid-way keeps the page's plan exactly as tailored so far. Nothing is stored.
- JS off: /plan renders as today; the quiz never replaces the static page, it layers on it.

## 6. Implementation shape

- `lib/plan-quiz.ts` — pure: step graph, answer model, `planFor(answers)` (ceiling via
  priceForMonthly, stage selection, search URL builder over the facet tokens). Unit-tested,
  including "the URL parses back through parseFilterParams to the same filters".
- `components/plan/PlanQuiz.tsx` — the takeover + shapes + spine (client).
- /plan wires the CTA + `?quiz=1`; SearchRail's Plan href becomes `/plan?quiz=1`.
- Lead POST reuses /api/lead verbatim; `qualifier` = flat answer record + searchUrl.
- Probe: `scripts/verify-plan-quiz.mjs` — drives the full buyer path, asserts the ceiling
  equals priceForMonthly's answer for the chosen monthly, the search link carries exactly
  the chosen tokens, and the hand-off POST body carries qualifier + consent. **The probe
  intercepts `**/api/lead` — the local form posts to the LIVE CRM webhook otherwise.**

## 7. Round-24 ledger (what else this round shipped, and why)

1. **The map's Escape race, closed twice.** The stress run (34 attempts, five zooms) caught
   Escape failing during post-zoom settle. First fix: the focus handler's 400ms suppress
   window on mouseenter — held on dev, failed on production (2/6), whose slower pin fetch
   lands after any window. Real fix: a positional guard — the pointer's coordinates at the
   deliberate close, released by the first real movement past 4px. Time was the wrong
   instrument; movement is the honest signal.
2. **The popup probe's picker lied.** It chose a dot at y=915 in a 900px viewport and
   reported the site broken. Instruments must pick what a hand could touch; the picker now
   clamps to the visible viewport.
3. **The pin walk.** The grid saved 150; the map draws 3,000. The popup's View Listing now
   writes the whole viewport pin set (fetch order = the grid's order) via one popupNode
   onNavigate hook in both engines. Verified by navigation on production: set 150 → 3,000,
   pager "Listing … of 3,000", Next lands on the set's own next item.
4. **Filters.** Enumerated his live Brivity search (33 selects, 126 checkables) and
   Zillow's More panel; measured everything in-surface first; shipped Heating fuel,
   Parking, Basement depth, Days on market, Near public transit. 431 live row-predicate
   checks, zero violations. Refused: ExteriorFeatures (top value: "Mailbox"). Deferred with
   reasons: style/stories/55+/fireplace/pool/hardwood/HOA (SELECT_FIELDS sync changes),
   school district (needs a dynamic values source).
