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
