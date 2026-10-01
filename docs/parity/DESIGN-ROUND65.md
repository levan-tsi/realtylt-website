# Round 65: the motion, the frame, the look (2026-09-30)

The orchestrator's brainstorm and measurements, written before any builder starts. His words are in
`docs/handoff/WEBSITE-R65-HANDOFF.md` §1; the rules that bind in its §2 and §5. Team: Fable 5.1
orchestrates, Opus 5.5 builders one at a time, five or more builder rounds, the orchestrator's own
polish last, a PREVIEW to him before anything with a look change reaches `main`.

## 1. Measured on the fresh production build (HEAD 81c0fe1 == live 1d74f01 + this doc), 2026-09-30

Transition walks (`scripts/_scratch-r58-transition.mjs`, desktop Chrome, software decode, 1.5 s a stop):

| walk | films | fades | frames over 34 ms | max frame |
|---|---|---|---|---|
| laptop 1440 x 900 | 9 | 7 | 1 (staten-island) | 55.7 ms (still at dutchess) |
| phone 390 x 844 | 15 | 1 (the harbour jump) | 8 (highlands 2, the county route 6) | 83 ms |

The laptop's seven fades ALTERNATE with its films: dutchess (the first move), ulster, putnam,
westchester-county, manhattan, brooklyn, harbour fade; highlands, westchester, dutchess-county, orange,
rockland, bronx, queens, staten-island, region play. Reading `plate-controller.ts warmFilms`: on the
laptop the next clip is only fetched by `calm()`, 350 ms after the page is still and NO transition
runs; a film runs 1.8 to 2.5 s (`flights.gen.ts`), so a visitor who scrolls on before it lands has
the next request queued with its clip never asked for, and the queued move falls to the fade. Round
63 fixed exactly this on the phone (load the next hop's clip during the motion, a third decoder for
the route) and kept it OFF the laptop because the laptop was approved then. That is his "some move,
some just appear" on the desktop, and it is the first transition too (hero to dutchess faded).

The phone: every adjacent move is a film; the cost is decode frames (83 ms worst) on this desktop's
software decoder, which a real iPhone (hardware H.264) has never been measured for.

Darkness in numbers: site ground `--color-night #050505` (1.5 % luminance), raised `#111111`, card
`#0d0d0d`, line `#242424`; the map's land `#0a0c10`, town `#0f1218`, water `#010309`, wood `#07090c`
(`components/home/ml/style.ts NIGHT`). The hero plate's mean luminance is 14.9 of 255 (wide) and
12.7 (tall), with 96 % of its pixels under 32; Queens, the brightest plate, 25.3. His friend's "really
dark" is a measurement, not an opinion.

The logo's own pixels (`public/logo-realtylt.png`, unquantised modal colours): wordmark navy `#0e2d52`
(79.8 % of the opaque pixels), the R mark's blue `#27a7df` (20.2 %). The night logo swaps the navy for
`#e8eef6`. On the `#050505` ground the navy is 1.5:1 (invisible), the R mark's blue 7.5:1.

Type today: on the night root every face is Bricolage Grotesque (`.nocturne` sets `--font-display`,
`--font-sans` and `--font-mono` to `--font-grotesk`; the self-hosted `public/fonts/bricolage.woff2`,
75 KB). Lato and Newsreader are loaded through `next/font/google` and used only under `.daylight`
and print. So "a better font for all the text" is one family swap on the night root.

Cameras: laptop hero `s(40.8866, -74.3111, 110_800, 60, 345)` (zoom 10.37); phone hero
`s(40.93, -73.9, 140_000, 55, 340)` (zoom 9.33). Assets baked from them: 17 plates x 2 aspects
(24 MB), 16 films x 2 aspects (89 MB).

## 2. The assessment (1440 x 900 and 390 x 844 first screens, looked at)

What already reads as luxury: the one idea (the territory at night, every home a lamp), the black
ground with white type, the restraint (no gradients, no colour but the lamps and one blue mark), the
sentence-case voice, the county names set in the map's own type, the boxed CTAs. It is a design with
a point of view; nothing here should be louder.

What reads as less than it could:
1. **The laptop first screen gives New Jersey the middle.** The words own the left 40 %; the land
   between the words and the Hudson (Bergen, Passaic, Rockland's west) is dark, unlit and half the
   picture. The territory (Ulster to Staten Island) spans about 600 of 1440 px. He is right that it
   reads as "a lot of Jersey".
2. **The phone first screen is the whole territory in 390 px.** Every road is a one-pixel hairline and
   the highways fuse; the lamps and the eleven names sit on top of each other (the Bronx, Manhattan,
   Queens, Brooklyn within 240 px). It is faithful and it is squeezed. He rejected the 60 km answer
   (lights read as on the ocean, the valley counties lost); the answer is between 140 and 60 km, and
   it is shown to him before it ships.
3. **Darkness.** The ground is 1.5 % grey; the map's land 4 %. The lamps read, but the place under
   them does not: hills and water are the same black. Lighter land and a blue water would give the
   map its geography back without giving up the night.
4. **The transitions on the laptop** (§1): every second scroll appears instead of moves.
5. **The type.** Bricolage Grotesque was his pick for /ai and it is a good display face (the
   "Let's find home." is right). At 16 to 18 px body it is busy: the single-storey a, the tight
   counters, the quirky f and g, all read as "tech startup" on a page that wants "quiet, expensive".
   His ask is for one family that is calm at body size and has character at display size.
6. **The white wordmark** on black is neutral; the brand is blue. The navy itself will not show
   (1.5:1); the logo's own second blue does.

## 3. The moves, ranked by what he will see

1. Every adjacent scroll MOVES, on the laptop too (the round-63 phone logic on both surfaces, the
   first move included), with the frame cost measured before and after. Code only, no assets.
2. The laptop first screen re-framed with less New Jersey: the words cover the NJ land; the territory
   larger and to the right; Staten Island may crop. Shown against the current one.
3. The phone first screen closer, between 140 and 60 km, lights on land, valley counties named;
   three candidates on the real page, side by side, for his phone.
4. The lighter look: the site's greys a step up, the map's land a step up, the water blue, the
   hillshade a touch stronger; parks unchanged unless the lifted land needs them a step up too. One
   palette decision from rendered studies (hero + one county, both aspects), then ONE re-render of
   every plate and film.
5. The logo in blue: the wordmark in the logo's own `#27a7df`, or a lifted tint of the navy; both on
   the real header over the hero and over an inner page; he sees both.
6. The type: three candidate families rendered on the real pages (home, /selling, a listing, a blog
   post) at 1440 and 390; one is chosen and its licence recorded.
7. Quality at 1:1: dense borough plates at AVIF q50 to q56 if the bytes allow, phone films crf 28 to
   26 (measure the frames over 34 ms), the phone hero's density solved by move 3.
8. Polish at every size (390 x 844, 390 x 664, 320 x 568 at 3x; 1440 x 900 at 2x; 1920 x 1080;
   1920 x 940) until nothing makes the orchestrator hesitate.

## 4. The order and why

Framing (2, 3) changes the hero plate and the hero--dutchess film; the palette (4) changes every
plate and film. So: transitions first (no assets), then the framing candidates and the palette
studies (small renders, no shipping assets), then the decisions, then ONE full re-render with the
chosen palette and the chosen framing, then the logo and the type (code), then polish. The re-render
is about two hours of machine time; nothing else waits on it if the code work is sequenced first.

Builders, one at a time, each re-verified by the orchestrator on the running build before the next:

- **A: transitions** (move 1). Target: laptop walk 16 films 0 fades (the harbour jump may route or get
  a new clip), phone unchanged 15/1 or better, no new frames over 34 ms in the walk; the first move
  on both a film; `ml:reveal` on load looked at.
- **B: framing** (moves 2, 3). Renders candidates with the round-64 mock tools on the real page
  (`scripts/_scratch-r64-heromock.mjs`, `_scratch-r64-phonemock.mjs`); no shipping plates yet. The
  orchestrator picks one laptop frame and two phone candidates.
- **C: the palette** (move 4). Tint studies as plates of hero and Queens at both aspects on the real
  page: current / lifted land / lifted land + blue water, with the site greys lifted beside them;
  contrast floors measured. The orchestrator picks; then C re-renders every plate and re-records
  every film with the chosen palette AND the chosen laptop frame, plus the phone candidates as extra
  hero renders kept aside for the preview branches.
- **D: the logo and the type** (moves 5, 6). Renders, the orchestrator picks, D implements.
- **E: polish** (moves 7, 8) at every size on both surfaces.
- **Orchestrator:** the final polish, the gate, two preview branches (`r65-preview-a`: the new look
  on the current framing; `r65-preview-b`: the new look on the new framing) and the side-by-side
  sheets for him.

## 5. What is deliberately NOT changed

The parks (his 09-26 word, not revisited on 09-30), the lamp colour and glow (approved in round 59),
the county-name type on the map, the sentence-case rule, the boxed CTAs, the search strip, the
credit, the chat launcher. Nothing ships to `main` but bug fixes until he has seen the preview.

## 6. Decisions taken by the orchestrator before the builders (2026-09-30, from rendered sheets)

- **Type shortlist** (`scripts/_scratch-r65/type-specimen.mjs`: nine families on the night ground,
  headline 92 px, lead 22 px, body 17 px, buttons, county labels): three go to the real pages,
  against the current Bricolage. (1) **Schibsted Grotesk**, one family for everything: editorial,
  a little character in the t and a, calm at 17 px. (2) **Instrument Sans**, one family: crisp,
  slightly narrow, the cleanest body of the nine. (3) **Newsreader** (already in the repo) for the
  headlines with **Hanken Grotesk** for everything else: the only one that changes the feel
  outright, a magazine's serif over the night map, quiet at body size. Rejected on the sheet:
  Onest and Albert Sans (correct and anonymous), Familjen Grotesk (condensed, hard), Geist (a
  developer tool's face). All are SIL Open Font License, served through `next/font/google` as
  Lato and Newsreader already are (self-hosted at build).
- **The logo's blue** (`scripts/_scratch-r65/logo-mock.mjs`: the wordmark recoloured on the real
  header over the hero and over /selling): the wordmark in the mark's own `#27a7df` reads as one
  brand colour and holds 7.5:1 on the ground; a lifted navy (`#4a82d0`, `#5b93dd`) reads as a
  second, weaker blue beside the mark. Ship the mark blue in the preview; show him the lifted navy
  beside it on the sheet.
- **The phone framing bracket:** round 64's sheet (`scripts/_scratch-r64/phone/SHEET-390x844.jpg`)
  shows 95 km (P3, heading 350) keeping Dutchess, Putnam, Rockland, Westchester and Staten Island
  and losing Ulster and Orange under the headline; 60 km was rejected. Candidates go between 140
  and 95 km with the four valley names kept right of the words and no lamp at the water's edge.

## 7. Added by his word during the round (2026-09-30): the simplification sweep

Before the round ends, ONE Opus 5.5 builder (F, after E, before the orchestrator's final pass) goes
through the whole code and makes it simpler: dead code removed, anything extra that makes the code
heavy and is not needed removed, under these guards: (a) every removal is PROVEN unused (an
unused-export analysis, a grep for every symbol, the routes and the tests), (b) the site is A/B'd
against the pre-sweep build in the same session at every stop and size (frames identical, the walk
numbers identical, calibration 0.00 px, taps and hover unchanged, JS off and reduced motion clean,
the crawler green), and the bundle and the page weight are measured before and after, (c) nothing in
security, consent, CSP, RLS, the MLS sync or the lead path is touched, (d) removal only, no
rewrites, no "improvements" beyond what a removal needs, (e) tests: green, and the count may fall
only by tests that tested deleted dead code, each one named. The orchestrator then re-verifies its
work on the running build and makes the final run itself.

## 8. The framing decision (2026-09-30, builder B's sheets in `scripts/_scratch-r65/frame/sheets/`)

Builder B rendered seven laptop and seven phone candidates as production would shoot them (its
renderer reproduces the shipped plates to encoding noise), composed them on the real page with the
lights and names placed by the page itself, and measured each: the lights' span, the unserved land
in view (a hand-drawn NJ/PA polygon, Sullivan/Greene, Long Island/Connecticut), lights over water,
the names placed per size. Two findings bind: hiding New Jersey entirely under the words only
exposes Long Island and the Sound on the right (W1 to W3: unserved land unchanged at 43 to 48 %),
and a Bergen wedge cannot vanish while Rockland and Orange stay in view. What works is turning and
tilting so the valley lies diagonally and fills the right side.

- **Laptop: W10** `s(40.9075, -74.1464, 79_077, 68, 330)`. The lights span x 367 to 1413 of 1440
  (today 607 to 1365); unserved land in view 45 % to 33 % at 1440 and 55 % to 40 % at 1920x940; no
  light on water; Ulster and Dutchess named at every size including 1920x940, where today's frame
  drops Ulster under the header; Staten Island, Tottenville and the Rockaway shore crop (his word:
  Staten Island may go). Fallback **W12** `s(40.9333, -74.1811, 91_888, 66, 334)`: milder, nothing
  cut on the east, all eleven names at 940.
- **Phone: T1 and T2, both shown to him live.** T1 `s(40.9620, -73.9485, 119_000, 60, 342)` is the
  safe step: the only new frame that keeps Ulster, Dutchess, Putnam and Rockland at 390x664 (what an
  iPhone with Safari's bars shows). T2 `s(40.9596, -73.9593, 111_000, 64, 350)` is closer (225 lights
  in the window against 173 today), no light on water; it loses Ulster at 664. Both put the south
  shore and the ocean under the lead and the search block. P3 (95 km) loses Orange and Ulster at
  844; T5 (95 km) has the dot on the Rockaway shore he rejected.
- Open, not a camera question: at 320x568 the words cover nearly the whole map in every frame (2 to
  3 names survive); a layout change, for the polish round.
- Previews: `r65-preview-a` = the new look on today's framing; `r65-preview-b` = W10 + T1;
  `r65-preview-c` = W10 + T2.

## 9. The palette decision (2026-09-30, builder C's studies in `scripts/_scratch-r65/look/sheets/`)

Builder C rendered three lifted palettes (its P1 to P3) as hero and Queens plates at both aspects,
composed them on the real page with today's greys and two lifted sets, and measured everything:
plate luminance (hero wide 14.9 to 28.8 of 255 under P1; the page's own mean at 1440 from 15.9 to
26.5 with the greys lifted), road-over-land contrast (held or improved, 2.21 to 2.31 at the Queens
grid), every text token on every ground (no floor broken in any set), the parks (a matching step
up is needed or they read as black blotches), the covers (not served on the plates ground, so not
re-made).

- **Map: P1.** Land `#151922`, town `#1d2330`, wood and park `#0f1319`, live buildings
  `#12151c`/`#1c212b`, horizon `#151b27`, fog `#0e1118`, plate town `#1f2636`, plate buildings
  `#1e2530`/`#2a3240`, hillshade highlight 0.38 and exaggeration 0.7, every road class +0.04 alpha,
  water `#071a3d`, stream `#12325f`. The water is about level with the land in luminance and
  clearly blue: his "very blue" said plainly. P2 (`#0b2452`) turns the phone's lower third into a
  bright blue panel and lights up New Jersey's lakes; P3 (`#061534`, a touch under the land) is the
  calmer fallback if he finds P1's phone band too blue.
- **Site greys: G3**, one step past the builder's G2, because a lift he cannot see counts as
  nothing: night `#131417`, raise `#1b1d21`, card `#171a1e`, line `#2a2b2f`, line-strong lifted to
  the first value at or above 3.2:1 on the raised ground (the builder's `#6e6e68` class; today's
  `#5e5e5a` is 2.9:1 there, under the floor already). Text floors at G3: moon 16.4:1, ink-soft
  11.8:1, haze 6.6:1, brand-r 6.8:1.
- **Carried into the re-render:** the home map's hard-coded black scrims (`MlGround.tsx` the
  per-word boxes and the top band, the JS-off shades, `#050505` in globals.css) move onto the night
  token or they read as black patches on the lifted map; the listing page's photo band is not on
  the tokens and would show as a black seam; the map credit (11 px at 60 % alpha) is 3.4:1 today
  and must go to full opacity or its own backing.
- The renderer-only `?pal=` option (ef678e6) served the study; the chosen values are baked into
  the style and the option removed, with the style test's fingerprints re-pinned on purpose.

## 10. The look baked and the one re-render (builder C2, 2026-09-30; orchestrator-verified)

Commits 5bb8b93 (P1 into the style, the `?pal=` study option removed, fingerprints re-pinned),
3eb7705 (G3 greys; every hard-coded black on the night surfaces onto the tokens: the home map's
word scrims and top band, the JS-off shades, the chip inks and rings, the popup, about forty
`.daylight bg-ink` bands including the listing photo band, the blog's dark scenes; the map credit
at full opacity, 11.05:1), 637344c (the laptop hero at W10), 71f2a75 (the plate renderer waits for
a picture that has stopped changing: W10's steep foreground came back bare three times), 33c970b
(the phone's see-through words kept at 4.5:1 on the lighter map), 6172c8c (every plate re-rendered,
23.9 to 25.8 MB), 717e505 (every film re-recorded, 92.3 to 98.9 MB). `line-strong` is `#6d6d67`
(3.24:1 on the raised ground; today's `#5e5e5a` was 2.9:1 there). The logo's wordmark in the mark's
blue went in beside it (1baf57e).

Orchestrator's own gate on the rebuilt branch: tsc clean; vitest 2304 of 2304, exit 0 (the four
study-only tests left with the option, one added); calibration and the laptop walk below; the home
first screen at 1440 and the phone sheet looked at. The preview variants (today's laptop hero;
the phone's T1 and T2) sit uncommitted under `scripts/_scratch-r65/variants/` with a README of the
files and manifest lines each needs; each calibrates at 0.00 px when swapped in.

Known and accepted: the region plate's 0.10 px (laptop) / 0.06 px (phone) predates the round
(round 64 recorded the same); seven phone valley film ends differ from their plates only in the
top eighth (far terrain the film draws where the plate leaves sky), as the round-59 set did.

## 11. The type and the logo (builder D, 2026-09-30; orchestrator-verified)

Commit 3e030b5: **Schibsted Grotesk** (SIL OFL, through `next/font/google`, one latin woff2 of
46.9 KB against Bricolage's 76.9) is the night root's one family: `--font-grotesk` now points at
`--font-schibsted`, so display, body, controls, the map's county names (the canvas reads the
label's computed family), the /search popup and the chat widget (`var(--font-sans)` with the old
system stack as its fallback) all follow. Bricolage's `@font-face`, its woff2 and two preloads
are gone; a copy of the file sits under `scripts/_scratch-r65/type/`. Headline tracking opened a
step (display -0.028 em, h1 -0.03, h2 -0.026, h3 -0.015; the words had closed up), every night
heading at 600, body 400. Tabular figures are OFF on the night root: Schibsted's tabular setting
gives the comma a full figure's width ("15 , 691"); the cost is a counting number's trailing edge
moving a few pixels. Layout shift from the font swap 0.0003 at most; body 16 px at 390; every
input 16 px; the nav row 942 px inside its 1250 at 1280 and 1440; the hero headline on two lines
at 390 and 320. The home testimonial keeps Newsreader italic (round 53's "a person's own voice";
his call if he wants it in Schibsted too). Correction to §1: Lato and Newsreader were not used
under `.daylight` or print either; Lato never loaded.

The alternative (Newsreader headlines with Hanken Grotesk) is rendered beside Schibsted on the
same pages for the record (`scripts/_scratch-r65/type/sheets/schibsted-vs-alt-*.jpg`).

The logo (1baf57e) verified on the header at 1440, 1920x940, 390 and 320 over the map and on
inner pages, the footer, the phone menu, print (6.74:1 on the night ground, 6.17:1 on the raised
header; the share card and favicon keep the day logo). Brand note for him: realtylt.com/ai (its
own repo) still sets Bricolage, so the two no longer share a face until /ai follows.

Orchestrator's gate: tsc clean, vitest 2309 of 2309 (exit 0), the before/after sheets looked at
(home 1440, /selling 390). One finding handed to the polish round: on /selling at 390 the chat
launcher sits hidden (`opacity: 0; pointer-events: none`) over the form's Email input 2.5 s after
load, so a tap at its spot focuses the input (`scripts/_scratch-r65/launcher-why.mjs`).

## 12. The polish round (builder E, 2026-09-30; orchestrator-verified)

Thirteen commits, 9dc3a68 to 8ab0b42. The named items: (1) the first plate eases in over 320 ms
the first frame its picture is complete (`plate-reveal.ts`; a fade started on the image's `load`
event flashed in one run of six because the event can fire after the paint), boot medians
unchanged (reveal 553 to 557 ms at 1440, LCP 312 to 304, text); (2) the still map's 500 ms hold
stops as soon as the clip's own download rate says it cannot land in time (`clipEta`): on a
20 Mbps phone an early first scroll faded at +90 to +256 ms instead of standing 500 ms and fading
anyway; (3) the phone's close plates draw lights 11 px apart (`FINGER_CLOSE_GAP`, easing to 14 at
24 km): Queens 276 to 356, the harbour 195 to 275, the hero and region unchanged, taps 30 of 30 at
the hero and at Queens; (4) under 375 px the first hero link takes its short label so both links
sit on one row: the map window at 320x568 40 to 77 px, 2 county names, 360x640 65 to 117 px;
(5) a tucked phone chat launcher is `visibility: hidden` as well (it was a focusable invisible
button over /selling's Email field), checked hittable where shown on 17 pages at both widths;
(6) the mortgage breakdown's amounts line up (the share has its own right-aligned slot; tabular
figures stay off); (7) a new `--color-night-sink #0e0f12` for the footer's legal strip and every
form field's well (true black read as a seam and as holes); (8) the chat panel on the G3 greys,
thirteen light-variant buttons from pure white to the moon, all eleven dialogs, the 404 and the
blog looked at. The walkthrough: a class of Title Case that round 63's string checks could not
see (words split around a `<strong>`) in headings, buttons and labels on 22 pages and the
dialogs, each with a test; 2309 to 2319 tests.

Orchestrator's gate on the rebuilt HEAD: tsc clean; vitest 2319 of 2319 (exit 0); laptop walk 16
films / 0 fades (max frame 48.7 ms), phone walk 16 / 0 (5 frames over 34 ms); calibration 0.00 px
at hero and Queens on both surfaces; Queens phone taps 30 of 30 on 229 lights; the three phone
first screens looked at. Left on purpose: the blog post titles' Title Case (his call), product
names, the MLS status chips, the "Staten Island" name near the words at 1920x940 (a placement
question for the final pass).

## 13. The sweep and the orchestrator's final pass (2026-10-01)

Builder F's sweep (02be366 to eb6bef2): the retired Google 3D and three.js night-flight grounds
(their components, the /lab/night route, the other-grounds split, the g3d/night branches of the
page and of lib/home-map.ts), the `three` package, SceneCredit (it rendered nothing on any page),
G3dController and the five modules only it used, the night scene's light builders and four
helpers, six unreferenced exports: 7,676 lines deleted, 51 files, 109 tests that tested deleted
code (named in the commits), vitest 2319 to 2210, all green; the home route's first load 262 to
254 kB. The site proved unchanged against the pre-sweep build frame by frame at every stop and
size (21 frames and three first screens identical, the rest live-data drift), the walks, calib,
hover, taps, crawler, walker, scan, JS off and reduced motion identical. The orchestrator then
removed what the sweep left for its call (44da9bb): the Google and dusk/day covers, the old no-JS
poster, their two maker scripts and `g3d/night.ts` (only those scripts imported it), with the
seven ATTRIBUTIONS rows. Kept on purpose: Lato (live on the /search map's labels), the night
covers (the renderer's live-map ground), the hero and editorial assets recorded as kept.

The orchestrator's own pass on the rebuilt HEAD: tsc clean; vitest 2210 (exit 0); every page's
first screen at 1440 and 390 (`scripts/_scratch-r65/final/pages-*.jpg`), the seventeen home stops
on both surfaces (`stops-*.jpg`), the reveal strip, all looked at; crawler ALL PASS; JS off dark
on every page at the new ground; reduced motion one 400 ms fade; the light scan at its baseline;
the contrast walker clean. Left: the "Staten Island" name under the footnote at 1920x940 (the
island enters the wider frame; the name is right, its spot is busy).
