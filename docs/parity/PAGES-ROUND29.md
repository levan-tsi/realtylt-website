# Round 29 — the eight pages, driven

HOME, BUYING, SELLING, TOP AREAS, FINANCING, HOME VALUE, WHO WE ARE, CONNECT. Driven at 1440,
390 and 320 with `**/api/media/**` blocked and `**/api/lead` stubbed. Written as the work
happened; per page: found / fixed / polished / left with a reason.

Not touched, by instruction: `/search` and the map, the hero video and search-instrument
mechanics (round 27), the chat launcher, `scripts/backfill*`, `lib/idx` sync, the CSP, the
launch switches.

## Baseline re-measured at round start

Round 28 closed on "tsc clean · 878 tests". Re-run on this tree before any edit, because a
carried baseline that was never reproduced is not a baseline:

```
npx tsc --noEmit   -> No errors found
npm test           -> 64 files / 878 tests passed   (foreground, 18.5s)
```

Both match. Broad sweep over 8 pages x 3 widths (`scripts/_scratch-r29-sweep.mjs`) found, before
any change:

- **No horizontal overflow** at 390 or 320 on any of the eight (`scrollWidth === innerWidth`).
- **No em dashes and no arrow glyphs** in any visible text node.
- **No gradient text and no gradient buttons.**
- **No 404s.** All 58 unique hrefs across the eight resolve; 29 internal destinations checked
  by status code, all 200, and the instrument was proven able to report 404 (`/top-areas/nowhere`
  and a bogus path both return a real 404 with the site's own "This address isn't on the map"
  page, not a streamed 200).
- One `<h1>` per page, every page.
- Console errors: only `net::ERR_FAILED` from the media route the probe itself aborts.

---

## The three carried work items

### C. The six unlicensed vendor photographs — ALREADY DONE (round 16), verified today

The brief carried this as open. It is not: `docs/parity/DESIGN-ROUND16.md` records the swap and
the tree agrees.

- `public/images/hero/hom.png` does not exist (`find public/images -type f`, 45 files, no `hom.png`).
- The three lifestyle photographs the brief names are present and licensed:
  `lifestyle/buying.jpg` (Wheaton, *rboed*, CC BY 2.0), `lifestyle/selling.jpg` (Round House in
  Rush Creek Village, dok1, CC BY 2.0), `lifestyle/financing.jpg` (Accounting Finance,
  Wilfred Iven, CC0 1.0). Every one of the 45 files under `public/images` appears in
  `ATTRIBUTIONS.md`, and `lib/images/attributions.test.ts` fails the build in both directions
  (file with no row, row with no file).
- The only surviving reference to the vendor CDN anywhere in `app/` or `components/` is a source
  COMMENT in `app/financing/page.tsx:67` recording where a replaced asset came from. Nothing is
  fetched from `images.brivityidx.com`.

**Still unresolved and still the owner's:** `public/images/hero/hero-vimeo-frame.jpg` is the
first frame of the ambient Vimeo clip the old vendor supplied, and neither the frame nor the clip
carries a licence record. `ATTRIBUTIONS.md` lists it as UNRESOLVED rather than quietly omitting
it. It is desktop-only; every phone and every reduced-motion visitor already gets the licensed
Hudson Highlands still. The decision is confirm the licence or drop the clip, and it belongs to
the hero video, which this round was told not to touch.

### B. Equal Housing Opportunity + REALTOR® — the marks were already shipped; the SIZING RULE was not met

Round 11 researched both marks, wrote the rules into `docs/parity/DESIGN-ROUND11.md` §3, and
shipped them: a self-hosted SVG traced from HUD's own `fheo400.gif` (`components/site/
EqualHousingMark.tsx`, never the vendor's `Equal-Housing-Realtor_gray50.png`), plus the REALTOR®
word mark set in our own type. So the artwork half of this item was done.

**What was NOT done is the sizing rule round 11 itself wrote down.** Re-read from the sources
today:

| Rule | Source |
|---|---|
| "If other logotypes are used in the advertisement, then the Equal Housing Opportunity logo should be of a size at least equal to the largest of the other logotypes." | HUD fair-housing advertising guidance (24 CFR Part 109 as published; rescinded as a regulation in 1996 but still the advertising manual's standard) |
| The logo is uncopyrighted, free to use, no permission or licence required. | HUD |
| "Only NAR, its members, and its Member Boards may use the MARKS." | [NAR Membership Marks Manual — Limitations](https://www.nar.realtor/membership-marks-manual/limitations-on-license-to-use-the-marks) |
| Form of use: "(1) the use of capital letters ... (2) the use of separating punctuation where appropriate; and (3) the use of the federal registration symbol '®' adjacent to each of the terms." Preferred form is all capitals with the ®. All-lowercase is prohibited outside a domain name or email address. | same |
| Contextual use: the term needs a membership reference — the association's name qualifies. | same |
| The REALTOR® **logo** (the block R artwork) may be used only with the member's name or firm name and address. We do not ship it: we ship the word mark, which is the preferred form and has no artwork rules to break. | [NAR — trademark/logo use with member's name](https://www.nar.realtor/logos-and-trademark-rules/trademark/logo-use-with-members-name) |

Measured with `scripts/_scratch-r29-marks.mjs` (8 pages x 6 widths, 48 runs) before the fix: the
Equal Housing mark rendered **32px** tall on every page at every width, and the largest other
logotype on the same page — the header RealtyLT wordmark — rendered **43.0px** between 640 and
1279px, 40.5px above that, 36.4px below. **48 of 48 runs failed the rule.** The mark HUD asks to
be the largest was the smallest logotype on the page.

Fixed (`components/site/Footer.tsx`): mark to `h-11` (44px), which clears the tallest case at
every breakpoint with no responsive fork, and the legal row's type steps 12 -> 13px so a 44px
house is labelling words of its own weight instead of towering over fine print. Re-measured:
**48 of 48 pass.** One instrument fault caught on the way — the first probe matched
`/images/mls/coming-soon.svg` as a "logotype" and reported home's 447px placeholder TILE as the
page's largest logo; the filter now names the three real marks.

New committed gate `components/site/legal-marks.test.ts` does the same arithmetic from source,
so the ratio cannot rot when somebody grows the header logo months from now. **Proven able to
fail:** reverted to `h-8` it reports "The mark renders at 32px; the tallest RealtyLT wordmark
renders at 43.0px". Its computed heights (36.4 / 43.0 / 40.5 / 36.1) match the browser
measurements to a tenth of a pixel.

Also fixed in the same row: at 1440 the copyright line was capped at `max-w-md` (448px) for a
~560px sentence, so it broke one word from the end and left "operated." alone on a right-aligned
line with ~300px of empty row beside it. `max-w-xl` lets it set on one line where there is room.

**Two things for the owner, neither of them a patch:**

1. **The REALTOR® line is a membership claim.** Only NAR members may display the marks, and a
   member's licence to use them "terminates automatically" if membership lapses. The site says
   "Member of the National Association of REALTORS®" on every page. Nothing in this repo can
   verify that membership. If it is current, nothing to do; if it ever is not, the line comes off.
2. **New York: the standardized operating procedures are missing, and it is a statutory
   requirement.** Under RPL §442-h every New York broker must post standardized operating
   procedures (whether prospective clients must show identification, whether an exclusive broker
   agreement is required, whether mortgage pre-approval is required) on any publicly available
   website they maintain — and, in the words of the requirement, "each publicly available website
   and mobile device application operated by an associated agent or 'team' of such broker must
   have posted their broker's standardized operating procedures or a direct link to such
   information on their broker's website." realtylt.com is an associated agent's website. It
   carries the NY Fair Housing Notice on every page (header bar, `dos.ny.gov/fair-housing-notice`)
   but no SOP and no link to United Real Estate's. The old PHP site at realtylt.com has neither
   either — it was fetched and checked today; it carries the Fair Housing Notice PDF and nothing
   else, and no Equal Housing or REALTOR® mark at all. **This needs the brokerage's own SOP URL
   or document.** Writing one here would be inventing a legal disclosure on the broker's behalf,
   so it is flagged, not patched. When the URL exists it is one line beside the Fair Housing
   Notice in the header bar and the footer.

### A. Listing-alerts honesty — driven end to end; the home page's claim is TRUE and stays

The brief carried this as "saved searches store an alerts flag but nothing sends yet". Both
halves of that are true of the ACCOUNT path and neither is the path a real visitor is on.

**Measured facts, not assumptions.**

- `/auth/v1/settings` on the site's Supabase project, read today: `disable_signup: true`,
  `mailer_autoconfirm: false`, `external.google: false`. **No visitor can create an account.**
  Password, magic link and Google are the only three doors and all three are shut, as they have
  been since at least round 20.
- `portal_saved_searches` and the `listing_alert_subscriptions` view both exist and both hold
  **zero rows** — consistent with the above.
- `SavedProvider.setSearchAlerts` returns immediately unless `signedIn`, so the alerts checkbox
  on `/portal/searches` is unreachable by anyone. It is also the one that stores a flag nothing
  acts on. `/portal` is not one of this round's pages and is unreachable anyway; recorded here so
  the next round does not rediscover it.

**The path that actually works, driven as an anonymous visitor** (`scripts/_scratch-r29-alerts.mjs`,
`**/api/lead` intercepted and never forwarded): save a search on `/search` -> it lands in
`localStorage` under `rlt:saved-searches` -> `/saved` offers the alert opt-in only when there is
something to alert on -> submitting it posts a lead carrying the searches. The exact body that
would have reached the CRM:

```json
"savedSearches": [{
  "label": "Dutchess County, NY · 3+ bd · $400K+ · waterfront or water access",
  "query": "county=dutchess&priceMin=400000&bedsMin=3&waterfront=1",
  "criteria": { "county": "dutchess", "priceMin": 400000, "bedsMin": 3, "waterfront": true }
}]
```

Every filter survives, including the boolean, because `searchCriteria` runs the SAME validated
`parseFilterParams` the live search runs — a saved search can never describe something the search
would not do. Server-side, `lib/leads/index.ts` also folds a readable `[Listing alerts requested]`
summary into the message so the request is actionable in a plain CRM view that shows only the
note field, and `parseSavedSearches` bounds the count, the string lengths and the value types.

So the intent IS properly captured and readable, and the home page's claim — the `WhyCarousel`
caption **"Save a search and get new matches by email"** — is true end to end: a human on the CRM
side sets the alerts up, which is what the caption says and all it says. **Kept, unchanged.**

**Instrument fault worth recording:** the first run of this probe reported that saving
`?county=dutchess&minPrice=400000&beds=3` dropped the price and the beds — which reads exactly
like the honesty defect the brief describes. It was the probe: the real parameters are
`priceMin` / `bedsMin`, so `/search` correctly ignored two parameters that do not exist and saved
what was actually applied. Check the accepted names before believing a filter was lost.

**What the buying page said, and now says.** `/buying`'s alerts block was the one surface making
the untrue version of this claim: "Be the first to know when a property hits the market" over
"any new homes matching your wish list criteria will be delivered straight to your inbox **the
moment they go up for sale**". That is an automated, real-time promise, and there is no job to
honour it. It now reads "Tell us what to watch for and we will watch it" over a description of
the two steps in the order the visitor takes them. The home carousel's caption was already
within what the system does and is unchanged.

**One finding, left deliberately:** the save dialog's signed-out footer offers
"SIGN IN TO SYNC + GET ALERTS" as its primary action and "View saved searches" as the quiet one,
so the anonymous visitor is steered first at the door that is shut and second at the path that
works. `lib/auth/error-message.ts` already catches the landing ("New accounts aren't open yet.
Call or text ..."), so it is not a dead end without explanation, and `SaveSearchDialog` belongs to
`/search`, which this round was told not to touch. Recorded for whoever opens sign-up.

---

## Two defects that were on every page, found by driving and not by reading

### A focus ring drawn on the parent's clip boundary is not a focus ring

Six surfaces build a card as `<article class="overflow-hidden">` with one
`<a class="absolute inset-0">` over its whole face (`/top-areas` twice, `/blog` twice,
`/services`, `components/idx/ListingCard.tsx`). An outline paints OUTSIDE the border box, and
that link's border box IS the parent's clip boundary, so the ring was clipped to nothing on all
of them.

Measured, not inspected: tab to each stop for real, screenshot a band around it focused, blur,
screenshot again, diff the pixels. **Eight of the eleven area cards on `/top-areas` and a listing
card on home changed ZERO pixels on focus** while `getComputedStyle` cheerfully reported
`outline: 2px solid rgb(16, 44, 84)`. A computed style is not a ring.

The card carries the ring now (`app/globals.css`): an element's own outline is not clipped by its
own overflow, it follows the card's radius, and it lands on the page rather than on the
photograph, which is where it has contrast. The link's clipped ring is switched off so the two
cannot double up on a card that is not clipped.

**The second one, on `/home-value`:** round 27 gave that page the home hero's search instrument,
but its bar is solid WHITE inside a `bg-ink` hero, so the dark-surface override painted a white
ring, at a 2px offset, on white, around FIND OUT. Shot with the button genuinely focused: nothing
to see. The ring's colour now follows the surface it lands on, not the section it belongs to.
Round 27's record says the nested button's ring was verified; on this page it was not true.

**The probe was wrong twice before it was right**, and both faults hid work rather than inventing
it. It keyed tab stops on tag plus text, so it stopped at the first duplicate label (the header
and the footer both say "Buying") and reported 17 stops on pages that have 55. And it measured a
band around the INPUT of a composed control whose ring is on the container by design, then called
that a defect. After both fixes the walk covers 47 to 115 stops per page and reports **zero stops
without a visible ring on all eight**. Injecting `outline: none` on links reports 43 failures on
home and 32 on connect, so it can still fail.

### The lead form dropped keyboard focus on every error

The submit button is `disabled` while the request is in flight; a disabled element loses focus and
focus falls to `<body>`. The success path had claimed it back since round 22. The error path never
had. Driven on `/who-we-are` with a real Tab to the button and a real Enter against a 500: focus
ended on `<body>` and **the next Tab landed on the phone number in the header**, so the visitor is
thrown from the bottom of a form they just filled in to the top of the page. The alert announces
itself either way (`role="alert"`), but announcing is not the same as being somewhere. Fixed, and
re-driven on `/who-we-are`, `/connect` and `/top-areas`: focus is the alert and the next Tab is
the submit button, so retrying is one key away. Pinned by
`components/leads/lead-form-focus.test.ts`, proven able to fail.

---

## Per page

### HOME (/)

- **Found:** nothing broken. The hero, the search instrument and the footer are rounds 27 and 28
  work and were left alone. One listing card carried the clipped focus ring described above.
- **Driven:** the why-carousel (next changes the caption, prev returns, all five dots set
  `aria-current`, the live region announces "Slide 3 of 5: ..."), both rail pagers (1/3 to 2/3,
  first card changes), the testimonial band (next changes the quote, prev returns), the scroll
  cue (lands at y=825), and both lead forms empty, filled and against a 500. 115 tab stops.
- **Fixed:** the card focus ring (globally) and the footer legal row (globally).
- **Left:** the `our-save-search.webp` slide is a real screenshot of our real dialog and its
  caption is true end to end. `hero-vimeo-frame.jpg` stays unresolved, and it is the owner's.

### BUYING

- **Found:** the listing-alerts over-claim, and a save-a-search mockup drawn as the OLD IDX
  vendor's panel, with a "Save the Search / References" tab pair over editable Price and Beds
  fields. We ship none of that.
- **Fixed:** both. The mock is a miniature of `SaveSearchDialog` now: title, one line of help,
  the applied filters as read-only chips, a name field, Cancel and Save Search.
- **Left, for the owner, not patched:** "No cost to buyers, Ever" and the meta description's
  "Buyers never pay a cent to work with us". Since the NAR settlement took effect in August 2024
  a buyer's broker must have a written agreement stating compensation before touring, and
  compensation can no longer be offered through the MLS, so an absolute "ever" is a commercial
  claim with a compliance edge on it. It is his claim about his business, not something the
  software makes true or false, so it is flagged rather than rewritten. The same reasoning covers
  `/selling`'s "guaranteed fair cash offer in 24 hours".
- **Left:** the tracked uppercase subhead that outshouts its own headline is round 27's item 9,
  folded into the hero-grammar decision, which is the owner's.

### SELLING

- **Found:** nothing broken. Both forms behave; the hero cash-offer form opens the qualifying
  wizard on success, which is why it prints no status panel of its own. 55 tab stops, all ringed.
  No overflow at 390 or 320.
- **Left with a reason:** the "Making Your Listing Shine" laptop shows a listing photograph in
  COLOUR on an otherwise monochrome page. That is the recorded rule rather than an oversight:
  round 11 ruled that listing photography stays in colour because the colour does the work there,
  and this is a device screen showing a listing, inside a section about listing photography.
  Desaturating the example of high-impact photography would argue against the paragraph beside it.
- **Left, for the owner:** "We know how to reach the 92% of buyers who search online" carries no
  source. NAR's own 2024 profile puts online tool use at 95%, so the number under-claims a
  citable figure rather than inflating one, but an uncited statistic in marketing copy is still a
  hostage. Cite it or drop the number.

### TOP AREAS

- **Found:** the eight clipped focus rings. Nothing else broken: all eleven card links resolve
  (checked by status code), the form behaves, no overflow at 320.
- **Left with a reason:** the six county photographs stay in COLOUR. Round 11 ruled on this
  explicitly and the reason still holds, which is that the cards are showing you six specific
  places.
- **Noted, not changed:** `counties/putnam.jpg` is titled "Cold Spring Harbor, NY" and
  `counties/orange.jpg` is "Cold Spring, NY", both by the same photographer, and the two cards
  read as near-duplicate dusk-dock pictures sitting diagonally adjacent. Cold Spring is in
  PUTNAM, so the Orange County card is showing a place in another county. Replacing them means
  sourcing and licensing two new photographs, which is a commission rather than a patch; recorded
  here beside the licence rows so whoever does it knows exactly what to replace.
- **Instrument note:** the Dutchess card appeared blank in a full-page screenshot. It is not: all
  six images load at their natural sizes. Next/Image's lazy loading and `fullPage` capture
  disagree. Judged from the live DOM instead.

### FINANCING

- **Found:** nothing broken. The payment calculator obeys. 500,000 at 6% over 30 years with 20%
  down gives $3,198.20; 800,000 gives $4,637.12; 9% gives $5,949.58; 0% down gives $7,676.98.
  Every change moves it the right way and RESET returns exactly to $3,198.20. Clearing the price
  degrades to a placeholder rather than `$NaN`.
- **Noted, small:** with the price cleared, the breakdown still prints "(0%)" beside real dollar
  values for taxes and HOA. If the total is unknown then the share is unknown, and "(0%)" states
  something false about a known number. Cosmetic, in a state reached only by clearing a field.
- **Noted, small:** the calculator accepts a 150% down payment, a negative interest rate and a
  zero-year term without complaint. Each produces an arithmetically consistent answer, so nothing
  misleads; there is simply no floor.
- **Instrument note, and the sharpest one of the round:** driving it with Playwright's `fill()`
  produced $2.4 BILLION and read like a catastrophic bug. `fill()` writes past the field's own
  formatter. Typing it the way a person does, click then select-all then type, gives the correct
  numbers above. Type into a formatted input; do not fill it.

### HOME VALUE

- **Found:** the invisible white-on-white focus ring on FIND OUT.
- **Driven:** the address instrument validates when empty, the lead form behaves, and 47 tab
  stops are all ringed after the fix.
- **Left:** the two-step address flow ends at the account gate, which is shut. That is the
  sign-up decision, and it is the owner's.

### WHO WE ARE

- **Found and fixed:** "Where We Work" sent all five boroughs to `/search?county=` on a note that
  they "have no editorial page yet". They have had one for several rounds, so the same five labels
  led somewhere different here than in the nav flyout and the home strip, and this page's version
  was the poorer one. It also re-implemented the `bronx` to `the-bronx` page-slug mapping that
  `lib/site.ts` already owns, and mixed counties and boroughs into one centre-justified bag. It
  shares `TOP_AREA_GROUPS` now, in two labelled groups, and the pill is the home strip's pill
  character for character. Re-shot at 1440, 390 and 320.
- **Left:** "Investor & REALTOR®" is the correct NAR form (all capitals, the registration symbol
  adjacent, separating punctuation) and it is used consistently here and on `/connect`.

### CONNECT

- **Found:** nothing broken. The Google Calendar embed loads, the three appointment types render,
  the "Open the booking page directly" fallback works, the form behaves, and 47 tab stops are all
  ringed.
- **Measured rather than eyeballed:** the embed looked like it left about 200px of dead white
  under the cards. It leaves **95px at 1440, 0px at 768 and 31px at 390** — the frame's content
  reflows with its width and the per-width heights round 27 measured are as close as a
  cross-origin frame allows. Left alone: tightening it to the 1440 case would clip the third card
  at 768.
- **Left with a reason:** the embed is the only full-colour, non-house-typeface object on the
  page. It is Google's own product UI, including a colour portrait a few hundred pixels from the
  same portrait in greyscale. A CSS filter over a third-party booking tool is the same class of
  decision as recolouring the Google review badge, which round 27 put to the owner. Flagged in the
  same place rather than applied unilaterally.

---

## Sweeps re-run at close (8 pages x 1440 / 390 / 320)

| Check | Result |
|---|---|
| Horizontal overflow | 0 pages |
| Em dashes or arrow glyphs in visible copy | none |
| Gradient text or gradient buttons | 0 |
| Control font size below 16px at 390 or 320 | none |
| `<h1>` per page | exactly one, every page |
| Console errors | only the media route the probe itself aborts |
| Focus stops with no visible ring | 0 of 47 to 115 per page |
| Lead forms, empty / filled / 500 | validate, succeed, and fail honestly with the phone number |
| JavaScript disabled | every page renders headings, links, forms and fields; nothing stuck at "Loading", nothing left at opacity 0 |
| Reduced motion | the same, animations collapsed |

**One sweep finding that is NOT a defect:** the consent checkbox is a 16px box, under the 24px
pointer-target floor on its own. It is wrapped in a `<label>` whose padded row measures 358x112 on
a phone, and that row was hit-tested at five points: the title, the disclosure, the far right
edge, the bottom padding and the box itself. All five toggle it. The component already says this
in a comment; the probe measures the input, not the target. An earlier single tap that did NOT
toggle was the probe reading a bounding box captured before a scroll.
