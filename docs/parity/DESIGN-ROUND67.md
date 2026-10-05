# Design round 67: polish round 66's look (the green's hue), then the listed details

Written 2026-10-04 evening by the orchestrator (Fable 5.1), on `design/futuristic-r53` in the worktree
`C:\Users\Levan\realtylt-website-r53`. Nothing from rounds 65 to 67 is on `main` (live realtylt.com =
`e2507d9`). The preview he looks at is branch `r66-preview`. This record continues
`docs/parity/DESIGN-ROUND66.md`; the brief is `docs/handoff/WEBSITE-R67-HANDOFF.md`.

## 0. The brief (his words, 2026-10-04 evening)

"I'm not sure on the green, I kind of like it. Should we bring another colour or keep it with just dark
ones? Recommend, or continue polishing both and see which is best." Then: "Let's keep green, but prepare
the handoff for the next session to work and polish more." The orchestrator's answer he accepted: keep
it, keep it dark, no third colour family; polish the HUE, not the amount.

What this round does, in the handoff's order: (1) the green's hue, one study on the real page, three
tiles for him, and the one re-render only on his pick; (3) the two geocoder rules with tests; (4) a
listing page with JavaScript off; (5) the phone's Highlands horizon; (6) the /connect booking card;
(7) /financing's phone hero; (10) the cleanup. Item 2 (the Google geocoding pass) was done at the close
of round 66 (its record §6g). Deploy is not ordered; section 3 of the handoff is the procedure when it is.

## 1. The green's hue: the arithmetic before the render, then the study

**What round 66 measured.** On the rendered plates the woods read OKLCH hue 171 to 186 (the Highlands
176, the hero 166), a touch teal against the blue-grey land (hue 262 to 267). The shipped fill
`#0c1810` is hue 154 in isolation, lightness L 0.195, chroma 0.024. So the plate adds 15 to 20 degrees of
blue to whatever fill is set: the moonlit relief (the hillshade's highlight is the moon's blue at alpha
0.50) and the blend with the land tint the woods. A fill at hue 135 to 140 should land near a forest
green (about 145 to 155) once rendered.

**The step he can see.** Round 66's lesson (the water study): two fills 0.007 apart in OKLab could not be
told apart; steps of 0.018 to 0.020 could. At the shipped chroma a hue move alone is small: from hue 154
to 135, the chord is 2 x 0.024 x sin(9.5 degrees) = 0.008; even to hue 127 it is 0.011. A pure hue polish
at the same darkness and the same amount of colour is therefore UNDER the visible step, by the round's own
rule; a visible step needs a little more chroma. The study brackets that honestly, so his sheet shows the
subtle move and what a visible one costs, side by side.

**The candidates, every one at the shipped darkness (OKLab L within 0.0015 of 0.195, pinned by
`style.test.ts`):**

| id | fill | OKLCH hue / chroma | OKLab distance from the shipped fill | what it is |
|---|---|---|---|---|
| h0 | `#0c1810` | 154 / 0.024 | 0 | as shipped (the control: the pipeline must reproduce today's plates) |
| h1 | `#10170c` | 135 / 0.024 | 0.008 | the hue alone, the amount of colour unchanged |
| h2 | `#0d1809` | 138 / 0.033 | 0.012 | the same hue with a touch more colour |
| h3 | `#0b1907` | 139 / 0.040 | 0.018 | the first step the 0.02 rule calls visible |
| h4 | `#071a06` | 142 / 0.046 | 0.024 | plainly a step; the loud end of the bracket |

**The method (round 66's, re-created under `scripts/_scratch-r67/hue/`, gitignored):** the renderer-only
`?pal=<id>` option restored (commit 7f9cf37: `PALETTES` holds one tone, the woods' and the city parks'
fill; absent or unknown ids are the shipped document, the four fingerprints hold; MlGround passes the id
into both pinned styles); the production build rebuilt on :3102 and the option proved to reach the served
style (`palcheck.mjs`: `queens -` reads `#0c1810`, `queens h3` and `hero h3 live` read `#0b1907`, a bogus
id reads the shipped fill); every study shot as deep plates of the hero (live style), Dutchess, Queens
and the Highlands at both aspects (`make-plates.mjs --stage=shoot --deep=1 --render=pal=<id> --raw=...`);
encoded exactly as the shipped plates are (`encode.mjs`, h0 compared to `public/plates/`); composed on the
REAL home page at `/?film=0` with the study's encodes served in place of the shipped plates
(`page.mjs`), so the page's own words, lights and names sit on the study; measured on the decoded served
AVIF (`measure.mjs`: the green mask from this study's own raws, h0 against h4, which differ only in that
fill; the green's mean OKLCH, its OKLab distance from h0 ON THE PLATE, the WCAG blend against the land
within 24 px, the land's mean, which must not move); sheets and 1:1 crops (`sheets.mjs`).

**What decides:** the measured OKLab distance on the plate (is the step there to see), the hue on the
plate (did it leave teal), the blend against the land (his "blend in", 1.06 to 1.13 in round 66), and
the orchestrator's own look at the 1:1 crops of the Highlands' forest, Flushing Meadows and Central Park.
Then THREE tiles for him and a recommendation; the re-render (about 85 minutes, both manifests unchanged)
only on his pick. If the honest finding is that no same-darkness hue move is visible, the recommendation
is to leave the green as it is and say so; a round he cannot see counts as nothing.

## 2. The other items, as read before building

**(3) The geocoder rules** are with an Opus builder (one at a time, re-verified here): a Non_Exact Census
answer whose street directional or name differs from the street SENT is refused (KEY1041042 "50 North
Broadway" placed at "50 S BROADWAY"); when the 15 km gate fails against the feed zip but the matched zip
differs and the matched city agrees, the gate is measured against the matched zip (12545 vs 12546,
11023 vs 10023). The five Kingston 12401 homes at 15.1 to 16.5 km are not placed by either rule (their
matched zip is the asked zip); the gate is not widened.

**(4) A listing page with JavaScript off.** The controls that do nothing are in three client components:
the lead CTAs (`components/leads/ListingLeadCTAs.tsx`: "Schedule a tour", "Make an offer", the seven
tour-day chips, the desktop card's two tabs, its day strip and arrows, each opening a sheet that posts
with `fetch`), the photo viewer (`components/idx/ListingPhotos.tsx`: nine buttons that open the lightbox
or step the gallery), and the sticky sub-nav (`components/listing/ListingSubNav.tsx`: Share, Save, the
"On this page" menu; its anchors keep working as links). The site's rule is already in place
(`globals.css` `[data-js-only]` under `@media (scripting: none)`, used by the header's menu and the page
pill). The call: the photo viewer's open buttons and the gallery arrows step aside (the photos are on
the page as images); Share and Save step aside (Save needs the account or the device record; Share is the
browser's share sheet); the tour and offer controls step aside AND a `<noscript>` block in their place
carries the plain path that works without scripting: the agent's number as a `tel:` link and the
booking page link (both already true on /connect). Every control hidden gets the one attribute; a source
scan test in the idiom of `app/search/nojs.test.ts` holds the set together.

**(5) The phone's Highlands horizon.** The tall camera at the Highlands (`shots.ts`: range 12 km, pitch
60) sees to the horizon, and a dense row of far lamps sits behind "Featured listings" (2,609 homes in the
frame's top tenth). The lights are one `stamp()` per home in `components/home/g3d/light-layer.ts`, each
with its fade's alpha; the layer already carries one per-frame exclusion (`avoid`, Google's logo corner).
The design: a per-shot horizon band for the tall aspect only (shots.ts, the Highlands), read by the plate
controller for the slot showing that plate and handed to its layer as a top fade (alpha 0 at the band's
top to 1 at its bottom, multiplied into each stamp's alpha, a flat ramp in screen y, so the far lamps
dim into the horizon the way distant lights do). Positions never change, so the calibration stays 0.00;
the phone contrast kit at that stop decides the band's depth (the floor 4.5:1 for the words it clears).
The plate itself is not touched (no re-render for this).

**(6) /connect's booking card.** Google's appointment-schedule embed has no dark theme: dark mode in
Calendar is a per-viewer setting of the signed-in product, and the booking page embed takes no theme
parameter (Google's own help, "Use Dark theme in Calendar", and the Workspace update of October 2024
describe the Calendar app's theme only; read 2026-10-04). So the card stays white, and the design is the
frame around it: the white card is made a deliberate paper card on the night page (the site's `paper`
token, the 24 px large-panel radius it already has, a hairline of the site's `line` token so its edge is
ours and not the iframe's), with the site's own "Call or text" and the direct booking link kept first in
the sticky column, as they are. No dark form that posts to the calendar: Google's booking pages have no
API for a third party to take a slot, and a form that only sends an email would promise a booking it does
not make.

**(7) /financing's phone hero.** The hero is the desk photo at `opacity-70 grayscale` under a flat
`bg-black/50` scrim with the headline and the paragraph in `text-paper` and `text-paper/85`, centred.
No probe has measured the words against the photo at 390. The contrast kit decides first: if the p95
background behind the paragraph keeps 4.5:1 the item closes as measured; if not, the scrim takes a
grade under the words (darker behind the text column, the photo kept at the edges) rather than the words
moving off the photo. Measured before anything is changed.

**(10) Cleanup.** Done at the start of the round: round 66's study encodes and page composites deleted
(`look/enc`, `look/page`, `look/page-batch1`, and the raws the hue study does not need: 1.17 GB); kept
`look/sheets`, `logo/sheets`, `final/`, `owner/`, `ratio/` and the `w0`, `w2`, `g2`, `g2p`, `l1` raws.
The `r65-preview-a/b/c` branches on origin are his to release (the handoff names them).

## 3. Results

### 3a. The green's hue, measured and looked at (2026-10-04 evening)

Forty plates shot (five studies, four shots, both aspects; 0 errors), the control re-encoded against the
shipped plates at a mean 0.00 to 1.22 levels apart (queens-tall the 1.22: the tiles moved a little since
round 66's render; nothing a study can see), the forty composites each served their own plate, the numbers
in `scripts/_scratch-r67/hue/measure.json`, the sheets in `hue/sheets/`, his tiles in `owner/`.

**On the plate, the shipped green is bluer than its fill.** The fill is hue 154; the green's mean on the
plate reads hue 166 at Queens, 175 to 179 at the hero and Dutchess, and 201 to 205 at the Highlands (the
forest, 52 to 58 % of that plate), at chroma 0.016 to 0.021. The Highlands are the bluest because the
moonlit relief owns the colour there: the hillshade's blue highlight over steep woods. That is his round 66
pick (l1) and is not touched; it means no fill makes the Highlands a true forest green, only less teal.

**The step, measured as OKLab distance from the shipped green on the plate** (round 66 read 0.007 as
no step and 0.018 to 0.020 as one):

| study | distance, hero / Dutchess / Queens / Highlands | hue on the plate (Queens / Highlands) | chroma on the plate | by eye at 1:1 |
|---|---|---|---|---|
| h1, the hue alone | 0.006 / 0.008 / 0.007 / 0.006 | 146 / 183 to 189 | 0.011 to 0.018 (drops) | cannot be told from today |
| h2, a touch more colour | 0.010 / 0.012 / 0.012 / 0.009 | 145 / 169 to 173 | 0.016 to 0.027 | a hint |
| h3, the first visible step | 0.015 / 0.017 / 0.017 / 0.013 | 144 / 163 to 167 | 0.020 to 0.033 | the forest and Flushing Meadows read green, quietly |
| h4, plainly a step | 0.019 / 0.023 / 0.021 / 0.017 | 147 / 164 to 166 | 0.025 to 0.040 | plainly green |

What does not move, by design: the blend against the land within 24 px (1.003 to 1.114 across every study,
within 0.005 of today's at each plate), the land's mean lightness, the plate's grey mean (within 0.15 of
255). The darkness is held; only the colour of the green changes.

**The finding.** The pure hue polish (h1) is the arithmetic's prediction come true: at the shipped chroma
the move is under the visible step everywhere and the chroma on the plate even drops (a bluer land under
a less blue fill cancels). It would be an 85-minute re-render he could not see. The first version he can
see is h3, and at 1:1 it is the right one: the Highlands forest and Flushing Meadows read as green ground
rather than slate, the lamps are still the only bright thing, the water keeps its place as the one strong
colour (its chroma 0.065 against the green's 0.03), and nothing gets lighter. h4 is the same move a step
louder: plainly green, still dark, still blending by the numbers; it reads as "a green map" more than "a
night map with woods".

**Recommendation: h3 (`#0b1907`).** His three tiles are `scripts/_scratch-r67/owner/green-close.jpg` (the
real pixels: the Highlands forest and Flushing Meadows, phone and laptop), `green-phone.jpg` and
`green-laptop.jpg` (the Highlands and Queens stops as he sees them), labelled 1 Today, 2 Recommended, 3
More green. His decision page: https://claude.ai/artifact/6BzWKcRVtjtPvfVAVWtb1b (the three sheets, the
recommendation, what happens on his pick; the page's source is the session scratchpad's
`round67-green-pick.html`, built by `build-decision.mjs` from the owner sheets). On his pick: bake the value into
`NIGHT.wood` and `NIGHT.park`, remove `PALETTES` and the `pal` plumbing, re-pin the four fingerprints on
purpose, ONE re-render with round 66's five steps (both manifests unchanged), then calibration, walks,
contrast, hover, taps. If he picks 1, the option is removed and nothing is rendered.

### 3b. The other items

- **(3) The geocoder rules: built by the Opus builder, verified here** (commit 1bf6777). The diff read in
  full: rule A compares a reduced "directional|name" of the street SENT (Census echoes its input in the
  batch line's second field, kept as `askedAddress`; the Google ask stores its own query) against the
  matched street, Non_Exact hits only; rule B runs only after the 15 km test has failed and only turns a
  refusal into an acceptance. The two test files re-run by the orchestrator: 65 of 65 (geocode 34 to 50,
  runner 13 to 15); the builder's full suite 2,243, tsc clean, re-run at the round's gate. Limits the
  builder named and the orchestrator accepts: rule A can refuse a Non_Exact answer whose asked street
  carries a trailing word `withoutUnit` does not strip ("Rear", "Upper") or a route spelling outside its
  list; nothing already stamped is re-judged (the 16 refused rows need an owner-approved `--retry`).
- **(7) /financing's phone hero: measured, closes.** The words against the real photo pixels (the ink made
  transparent, the box's 95th and 99th percentile luminance): at 390 the headline 7.69, the paragraph
  7.62 at its 85 % ink, the button 18.7; at 1440 7.69 / 9.03 / 18.7; floors 3 and 4.5. The flat scrim is
  doing its job; nothing changes.
- **(4) A listing page with JavaScript off: built by the second Opus builder (28a3f78), verified
  here.** The tour and offer controls, the photo viewer's triggers, the sub-nav's offer, Share and Save
  (the last two inside their shared components, so every card hides them the same way) carry
  `data-js-only`; one `<noscript>` block in the lead card reads "To see this home or talk about an
  offer, call or text us, or book a time that suits you." with the main line as a tel: button and
  "Book a time" to /connect (the main line, not the CRM line: the owner's 09-24 order keeps that one
  on /connect alone, and the card's own line below already names the main one). Visible buttons with
  scripting off: 21 to 12 at 390, 32 to 13 at 1440; with scripting on the full-page screenshots before
  and after are pixel-identical at both sizes; /search and /saved render their cards only with
  scripting (unchanged); /top-areas/dutchess, which renders six cards without it, lost six dead hearts
  and each card is 14 px shorter with no gap (the orchestrator looked at the side-by-side). The
  source-scan test `components/listing/nojs.test.ts` holds the set (18 assertions, 15 red first).
  Full suite 2,262, tsc clean. Two things the builder found outside its remit, done by the orchestrator
  (the lead path is not a builder's): **the lead form on every surface** posted JSON from onSubmit with
  no method or action, so a no-script submit was a GET reload with the visitor's name, email and phone
  in the address bar and no lead; it now steps aside with a noscript line offering the number and the
  email (the route keeps JSON only: a form-encoded post is a cross-site simple request, and the
  content-type check is the guard; making the form post without scripting means accepting form bodies
  behind an origin check, a security decision left open below). **A listing's photos** sat at opacity
  0 under their skeletons without scripting (MlsImage reveals in onLoad); `[data-mls-img]` is lifted to
  opacity 1 under `@media (scripting: none)`, held tiles stay hidden so nothing bursts the media host.
  And the card photo arrows step aside. Seven more assertions in the same test; 154 of 154 in the
  touched suites. Still doing nothing without scripting, left as is: the mortgage calculator's four
  buttons (its figure is server-rendered in the header), the header's top-areas caret at 1440, the
  closed photo grid's 33 tiles (`role="button"` could wait for hydration).
- **(6) /connect's booking sheet in a mount** (f98e547), the design of §2, verified on the rebuilt
  server: the wrapper measures `rgb(27, 29, 33)` (the night's raise), a `rgb(42, 43, 47)` hairline,
  24 px radius, 8 px padding, the sheet inside at 16 px, 340 px wide at 390 and 744 at 1440 (the
  column's width less the mount). Headless Chrome does not paint Google's page, so the look was
  checked with a white page served in its place (`scripts/_scratch-r67/connect/after-*-corner.png`):
  the white sheet sits in a dark mount with a drawn edge and nested corners, a document on the page
  rather than a hole in it. The real embed is the owner's look on the preview.
- **(5) The phone's Highlands horizon: built by the third Opus builder (1e8c0be), verified here.**
  `MlShot.horizon` (a share of the window's height) on `highlands.tall` only, 0.16, a linear ramp:
  `horizonRamp(y, band)` multiplies every stamp's alpha (unlit, lit, featured), a light under 0.2 of
  the ramp leaves the hit test, positions never change; the slot's layer reads its shot's band in the
  current aspect, the film layer blends the source and destination bands by the frame shown so a
  landing has no pop (measured: the band ends on the landed plate's 135.04 px exactly, and is null
  everywhere on the laptop). Why 0.16: every text at the two Highlands stops already met its p95
  floor, so the depth was settled on p99 (single lamps behind "Featured listings", 36 px, floor 3):
  2.16 to 7.90 at the stop, and 30 px before it 1.90 to 3.04, the smallest band that clears both
  (0.15 gives 2.80). The orchestrator looked at the 1:1 pairs (`scripts/_scratch-r67/horizon/pair-*`):
  the far row dims into the horizon like distant lights, no edge where the band ends. Calibration
  `--phone` 0.00 px at the hero, Queens, Dutchess County and the Highlands (133 of 133); taps 30 of 30
  at the hero and Queens, 25 of 25 at the Highlands' second stop; the laptop at both stops changed in
  the MLS line's timestamp alone (the lights 0 pixels). Tests: seven in `light-layer.test.ts`, one in
  `shots.test.ts` (only `highlands.tall` carries a band); full suite 2,277, tsc clean. Left as found:
  "See more listings" at the second stop keeps a p99 of 1.24 (mid-distance lamps under the button; a
  0.3 band would dim the top third of the frame: not taken), and the MLS line 50 to 80 px above the
  second stop reads 4.26 to 4.45 at p95 on the plate's horizon haze (pre-existing, no band moves it):
  the line's grey is lifted one step below and re-measured.
