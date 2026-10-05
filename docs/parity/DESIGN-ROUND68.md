# Round 68 (2026-10-05): the polish pass while his green pick is pending

One agent (Fable 5.1), on `design/futuristic-r53` in the worktree, against the :3102 production build.
Live realtylt.com is still `e2507d9`; nothing from rounds 65 to 68 is on `main`.

## 0. The state the round found, and what it could do

- **His pick on the park green is still pending.** The decision page
  (https://claude.ai/artifact/6BzWKcRVtjtPvfVAVWtb1b) carried no comment, and no message named a
  number. **Deploy is not ordered.** `origin/main` is unchanged at `e2507d9`; `r67-preview` was at
  the branch head (`90f650a`).
- So the round did the work that depends on neither: the open items of the round 67 handoff §4 that
  are not owner calls (4.2 the no-script controls, 4.4 the horizon band at other phone sizes), the
  three polish passes the `/website` brief asks for (every page at 1440, 390 and 320, looked at;
  the states; the walk as a visitor), and the fixes those found. Round 67's handoff §1 and §3 stay
  the procedure for his pick and for the deploy.

## 1. The site with fresh eyes (the brief's §1b, through the frontend-design lens)

**What reads as a point of view, not a template.** The home page is the one memorable thing: a
real night map of the territory with every listed home as a lamp, the counties as camera stops,
the flights as films. Nothing else in the category looks like it. One typeface (Schibsted Grotesk)
set large, in sentences, in sentence case, with no eyebrow shouting and no gradient anywhere. The
photography is black and white under a flat scrim, so the only colour on the site is the lamp
yellow, the two blues of the mark, and the Google marks. CTAs are boxes, not arrows. The footer is
composed (the form first, then the reference block of contact details and links, the marks last).
The copy says what we do for the reader in the first line of every hero.

**What still reads as a kit.** (a) Three-across identical rounded cards appear on `/services` (the
hub, 11 cards), `/who-we-are` ("What you can hold us to"), `/home-value` (the three steps), the
listing page's market insights and the thank-you page; the card is the same object each time, so
the eye reads "section of cards" before it reads the content. (b) A small label sits above most
headings ("Saved", "Plan", "Legal", "Index", "Questions", "Start here", "The hub"); sentence case
keeps them quiet, but a reader meets twenty of them. (c) `/services`' "plumbing" list wears 01 to
07 markers on content that is not a sequence. (d) On the short pages the h1 and the first section h2
sit within one step of each other (`/reviews`: "What our clients say" over "In their words"), so
the page reads as two titles. (e) The listing page's calculator and the financing page's calculator
are the one surface still built from a black-panel-plus-light-panel idea; on the night site the
light panel has become a dark one, and the pair now reads as two greys.

**The ranked moves, and the recommendation.** The owner's standing order since round 60 is "polish
more, deploy on my word", and he has approved the look through seven previews; the brief's own rule
is to respect convergence. So these are offered as his calls, not built:

1. Give the three-across card sections a second form (a ruled list for steps and promises, cards only
   where a card is a thing you open). Highest leverage on the "kit" reading; a half-day.
2. Drop the eyebrow labels where the heading already says it ("Saved" over "Your homes & searches",
   "Legal" over "Privacy Policy", "Index" over "Site map"); keep the ones that carry a fact ("Step 2
   of 3", "Request received"). An hour.
3. `/services` plumbing list: the numbers become a plain rule. Minutes.
4. `/reviews`: the h1 carries the rating line and the Google button; "In their words" becomes the
   quiet lead of the quotes rather than a second display heading. An hour.
5. The calculators: one panel, the inputs and the figure on the same ground, the figure the only
   large object. Half a day, with the listing page's seeded variant.
6. The blog index hero's "The RealtyLT journal" label and the post pages' "7 months" number glow are
   the two places the blog still has its own dialect; the number glow is the only glow on the site.
7. The service pages' Title Case product names ("AI Chat Assistant") against the site's sentence
   case: his call, they are names.
8. The legal page titles in Title Case ("Privacy Policy", "DMCA & Terms of Service") match their
   footer links; a sentence-case pass would touch both. His call.

None of these were built this round; what was built is the defect list below.

## 2. What was done, each verified on the rebuilt :3102 build

### 2a. The no-script leftovers (handoff §4.2) — `d0dc227`
- The closed photo grid's 33 tiles carried `role="button"`, a tab stop and a "View photo N full
  screen" label before anything could answer a click; the role, the stop, the label and the zoom
  cursor now arrive with hydration. JS off: 33 tiles, 0 with a role; JS on: 33 of 33 with the role
  and the tab stop.
- The header's desktop top-areas caret (its flyout opens by state alone) and the mortgage
  calculator's Reset button and representative-rate rows carry `data-js-only`; the calculator says
  in one noscript line that the figures stay at the example until scripting is on, with the number.
  JS off at 1440 and 390 on a listing, /financing and the home page: visible `[data-js-only]` 0, the
  caret hidden, the noscript line present. `components/listing/nojs.test.ts` holds the three (28
  assertions, was 25).

### 2b. The horizon band at other phone sizes (handoff §4.4) — measured, closes
The round 67 band (`highlands.tall`, `horizon: 0.16`) measured at 390x844 only. The phone contrast
kit (`scripts/_scratch-r68-contrast.mjs`, the round 57 kit with `--w --h`) at the two Highlands
stops:

| window | texts | below floor at p95 | below floor at p99 |
|---|---|---|---|
| 320x568 | 7 | 0 | 0 (the headings sit outside the frame at these stops) |
| 390x844 | 11 | 0 | 1: "See more listings" 1.24 (the accepted single-lamp class) |
| 430x932 | 13 | 0 | 1: "See more listings" 1.43 (the same class) |

"Featured listings" reads 8.75 at p99 at 430x932 (7.90 at 390). Looked at
(`scripts/_scratch-r68/horizon/*.png`): the far row dims into the band at both sizes with no edge.
No change.

### 2c. The listing page's "On this page" bar stuck on the last section — `fc07f93`
Found by the walk: on a fresh load "Overview" was current; after a scroll to the bottom and back to
the top "Payment" stayed underlined. The scroll-spy is an IntersectionObserver over a 5 % band at
mid-viewport; once the last section has left the band (over the footer) a jump to the top changes
no intersection, so no callback fires. One passive, rAF-gated scroll listener marks the first anchor
whenever the first section still sits below the band. Probed on the rebuilt build
(`scripts/_scratch-r68-subnav.mjs`): fresh Overview, after the scroll Overview, 1.2 s later Overview.

### 2d. Copy and type details from the walk — `23ff5d1`
- `/buying`: the hero set "We find the home. We" / "negotiate the price." (balanced wrapping treats
  the two sentences as one pool). A no-break space in "We&nbsp;negotiate" gives the two sentences
  their own lines at 1440 (2 lines) and four balanced lines at 390. Looked at.
- `/selling`: the video badge read "3D Walkthrough" beside a chip reading "3D walkthrough".
- `/financing`: the closing paragraph rendered "title company,where" (JSX drops the line break on
  both sides of the comment between the halves); an explicit space before the comment. DOM check on
  the rebuilt build: "company, where". And "Loan Officer" mid-sentence is "loan officer".

### 2e. A mock thumbnail that loses its photo — `528c76c`
The browser and phone mockups on `/buying` and `/selling` are built from real listings through
`MlsImage`, whose failure state is the branded placeholder with "Photograph coming soon" at card
size; in a 48 to 160 px tile the caption overflowed (seen at 390 with the media route blocked; a 429
from the media host does the same). `MlsImage` gains `blankWhenUnavailable`, a boolean because these
are server pages and a callback cannot cross into the client component (the first attempt passed a
function and the build failed on `/selling`'s export). With the media route blocked: `/selling`'s
mock tiles plain, `/buying` 0 placeholder captions.

### 2f. The walk itself
- First screens of 22 routes at 1440 and 390 (`scripts/_scratch-r68-shot.mjs`), looked at.
- 15 pages tiled down their length at 1440 (87 tiles) and 12 at 390 (111 tiles)
  (`scripts/_scratch-r68-tiles.mjs`), looked at tile by tile.
- 22 routes at 320: no horizontal overflow on any.
- Every dialog and overlay at 1440 and 390 (the round 60 probe): light-surface 0 inside each except
  the tour sheet's selected day (a white primary with dark text at 16.4:1, the known class), contrast
  0, small controls 0, the wizard reaching its fields.
- The light-surface scan over every route: 60 suspects, all the white primary buttons and the white
  status chips with dark text (16.4 to 18.7:1), the baseline class since round 60.
- The chat launcher and panel at both widths: the computed colours unchanged.
- /search as a visitor (`scripts/_scratch-r68-search.mjs`): see §3.
- Focus states (`verify-focus-paint.mjs` pointed at :3102): see §3.

## 3. Gates on the final build

- `npx tsc --noEmit` clean.
- `npx vitest run` in the foreground: 2,282 of 2,282, exit 0 (the floor was 2,277).
- `node scripts/qa-crawl.mjs http://127.0.0.1:3102`: ALL PASS (251 internal links, 390 no overflow,
  six county pages in-county).
- Focus paint and the /search walk: recorded below once run (§3a).

### 3a. Focus paint and the search walk
- **Focus paint** (`verify-focus-paint.mjs` is pinned to :3100; `scripts/_scratch-r68-focus.mjs` is the
  same file pointed at :3102): 421 focusable elements over 7 pages at 1440 and 322 at 390 paint a
  focus state; the one it reported as painting nothing, the credit line's "© OpenStreetMap
  contributors" link on the home page, had no focus style of its own (a hover underline only). The
  credit's anchors now underline and draw the 2 px ring on `:focus-visible` (commit on
  `MlGround.tsx`). The probe still reports that one link after the fix, so it was re-tested the way a
  visitor reaches it: Tab to the link on the production build and a pixel diff of the corner, 1,111
  of 9,000 pixels change when focus lands on either credit link (`scripts/_scratch-r68/verify/
  credit-focus.png`). The probe's reading there is the instrument (it measures an 81x44 box at the
  viewport's bottom edge where the link's own box is 158x14), not the page.
- **The search walk** (`scripts/_scratch-r68-search.mjs`): the bed minimum is a native `<select>`
  styled as a pill (`#f-beds`, options "Bed, 1+ Bed, 2+ Bed, 3+ Bed ..."); choosing 3+ writes
  `?bedsMin=3`, the pill reads "3+ Bed" and the count line becomes "7,658 homes in this map area ·
  showing 1-150" with the map's pins and the cards refreshed (looked at). At 390 "Filters" unfolds
  the six pills in place, no sheet. Nothing to fix.

## 4. Open after this round

1. **His pick on the green** (handoff R68 §1): unchanged. If a `r68-green2-preview` branch exists,
   it is the recommended `#0b1907` baked and re-rendered on top of this round's work, for his look
   on the real page beside `r68-preview` (today's green).
2. **The deploy** (handoff R68 §3): unchanged, on his word; this round's commits ride along.
3. The lead form could WORK without scripting behind an origin check (a security decision, his).
4. The eight design moves in §1, his calls.
5. The `<title>` tags' case, the CMA enumeration and raw MediaURL items, the preview-branch and
   scratch cleanup once the round is live (handoff R68 §4.5 to 4.8).
