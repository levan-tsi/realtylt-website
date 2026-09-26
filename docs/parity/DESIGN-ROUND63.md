# Round 63: the phone, second pass (2026-09-26)

The owner looked at round 62 on his phone the same evening ("much better on the phone") and asked
for four things (`docs/handoff/WEBSITE-R63-HANDOFF.md` §0 has his words): no black behind the
words, the map edge to edge from the header down; the zoomed-out map looks "a little pixelated";
a thumb scroll through the counties should move the map the way a chip tap does; titles in
sentence case and the small items, site-wide. Parks and water colours: keep. One agent (the
/website order), every change verified on a production build, and the laptop proven unchanged by
an A/B against the pre-round build.

Before and after in one look: `docs/design-r63/before-after-phone.jpg` (the pre-round build and
this one, at 390 x 844, 390 x 664 and 320 x 568, same data, same session).

## 1. The words straight on the map (no black behind them)

What made the black on a phone: a 0.8 black scrim under every `[data-quiet]` block (the lead
block's covered Brooklyn), the top scrim (230 px from the logo down), and the glass fills of the
search box, the two links and the county panel's chips.

Now, below lg: no scrim is placed (`placeScrims` places none), the top scrim is hidden, and the
boxes are glass with no fill (a hairline and a 2 px blur, `.phone-glass`). Legibility moved into
the words: `.phone-halo` and every `[data-quiet]` column inside a map section carry the map's own
county-label shadow (`LABEL_SHADOW`: 1 px, 3 px, 12 px black), so the words read the way the
county names already did; dark words on a light button keep none. The header's utility row
carries it too.

Measured, not assumed (the home contrast kit on a phone, 48 texts over 20 stops): 0 under the
floor at p95 (1 before the column halo was added: "Every screen above is our own product" at the
harbour, 4.23; now 4.69). The p99 misses are single lights crossing a letter.

The black that remains at the foot of the first screen is the Atlantic in the plate itself, south
of Long Island: map, not a shade.

## 2. "Pixelated"

Looked at on device pixels (3x) before touching anything:
- the plate: rendered at 3x (1170 x 2532), and its AVIF and WebP hold the lines (compared at 1:1
  against the render); not the cause;
- the lights: the light canvas was capped at 2x, so on a 3x phone every light was drawn at two
  thirds of the screen's density and stretched. **Fixed** (`LightLayer.resize`: cap 3); a laptop
  (1x, 2x) is unchanged. The phone's worst long task in the first six seconds stays under 150 ms.
- the hero's tall plate as a deep render: tried into a scratch folder. The deep style is the
  county plates' and drops the territory's road network at this camera; and a plain re-shoot today
  also came back without roads (the renderer's tiles did not arrive: `make-plates` reported
  console errors). Not shipped; the live plate stands. **Open**: fix the renderer's tiles, then
  compare a deep territory style at 1:1.

## 3. The scroll flies like the chip

Diagnosed first (`scripts/_scratch-r63-swipe.mjs`: flicks driven frame by frame at iOS's momentum
decay, 0.998 per ms, through the pinned "Where we work" stage at 390 x 844, 3x):

| | map starts after the page crosses a stop | six flicks down |
|---|---|---|
| before | 1.5 to 2.3 s (waited for the momentum to die) | 2 films, 3 fades |
| after | about 90 ms | 11 films, 1 fade |

Three causes, three fixes, all below lg (the laptop keeps its settle and its straight transitions):
1. `MlGround.apply`: on a phone the map is asked for the moment the page crosses a stop.
2. `plate-motion.routeHop` + `plate-frame.filmLadder`: a jump of two or three plates flies through
   the ones between, a hop only when its film is ready, the far target queued, the hop played
   hurried (the queued request's rule); a farther jump, or a hop not ready, fades as before.
3. `plate-controller.warmFilms`: clips loaded only when the map was still (never, in a flick); the
   phone's two decoders were asked for three clips and let go the one the next hop needed; a job
   made mid-flick ran at the landing and let go the clips round the page. Now a phone in flight
   loads the route's next clip at once, each hop asks for its successor, the landing remakes the
   waiting job from where it is, and one more decoder is kept for the length of the route (none
   torn down mid-film).

Six flicks back up: 11 films, 1 fade (the first move back, whose films behind are fetched only
once the visitor turns, by design). Chip taps land on their county.

The cost, measured against the pre-round build on the same machine (`_scratch-r58-transition
--phone`, desktop Chrome, software video decode): the walk plays 15 films and fades 1 (was 9 and
7); frames over 34 ms 7, worst 90 ms (was 1). Loading a clip while a film plays is the known cost
(round 59). **Open**: his iPhone is the verdict; if a flick stutters there, the lever is fewer
clips loaded mid-flight (the route's hop only when its clip is already in).

## 4. Sentence case, site-wide

Found by what renders (`scripts/_scratch-r63-caps.mjs`: every text on 20 pages and a listing whose
computed text-transform is uppercase or that is written in capitals, and every heading or button
in Title Case), then by a source sweep of JSX text and labels.

- One rule, `.nocturne .uppercase { text-transform: none }` (every page is .nocturne), plus the
  capitals' letter-spacing reset where a label has no night tracking of its own. It lives outside
  `@layer`: inside `@layer components` the utility wins whatever the specificity (the first
  placement changed nothing, caught by the probe).
- /who-we-are's county chips printed stored capitals ("DUTCHESS") at 11 px bold: `areaName()` at
  14 px now.
- Headings and buttons to sentence case on /buying, /selling, /financing, /home-value, /top-areas
  and the county pages, /reviews, the listing page, the calculator, the portal, the header's "All
  top areas", the sitemap's section titles. Proper nouns kept.
- Left as they are: page `<title>`s (not headings), the service names on /services (product
  names), and **the blog's post titles** (about fifty editorial headlines in Title Case that are
  also each post's `<title>`: his call; they now stand out against the sentence-case cards).

## 5. The small items

- 320 x 568: "Sell with us" wrapped below the first screen and under the credit's (i). One row
  needs 13 px type (under the controls' floor), so below 360 only the count is its first sentence
  and the lead block sits tighter; both 15 px links end at 524 px, the (i)'s corner clear.
- The search field's placeholder carries the halo (at 320 the glass shows the lit city behind it).

## 6. The gate (production build, :3102)

- `tsc --noEmit` clean; vitest **2282** passing (round 62: 2272; new: the route, the ladder, the
  sentence-case pins, round 62's phone test rewritten to his new rule).
- **The laptop, A/B**: the pre-round build (`2e0fabd`, a temporary worktree) and this one served in
  turn on :3102, same data, the home's 20 stops at 1440: the hero frames byte-identical; the other
  stops differ only by the hourly sync's county counts (1,453 / 1,452) or the featured carousel's
  timing (the same build twice differs there by 110k px). This found one regression, fixed
  (`e8e9719`: the capitals rule had widened the header nav's tracking).
- Calibration `--shots=hero,queens,dutchess-county`, laptop and phone: 0.00 px mean / p95 / max,
  light counts matching.
- Transitions: 1440 unchanged (the 97 ms Dutchess hold frame is the pre-existing one); phone walk
  15 films, 1 fade (pre-round 9 and 7), frames over 34 ms 7 (pre-round 1), see §3.
- Phone taps 30 of 30; hover at 1440 50 of 50. Long tasks on a phone at 3x: none over 150 ms
  (worst 100 ms).
- Contrast: home kit on a phone 0 under the floor at p95; the walker over 20 pages: 0 of ours
  (Google's own map credit on /search excepted, as before). Light-surface scan: only the white
  primary buttons with dark text.
- Reduced motion OK (one 400 ms opacity fade, no scale); JS off: the plate stands at both widths,
  every page dark.
- `qa-crawl` ALL PASS; no horizontal overflow at 390 or 320.

## 7. Open, for the next round

- His look on a real iPhone: the words on the map, the flick through the counties (smooth? the
  7 long frames above were desktop Chrome's software decode), the lights at 3x.
- The plate renderer's tiles (both shoots today came back without roads), then a deep territory
  plate compared at 1:1.
- The blog post titles' case (his call).
- The 1440 hold frame at Dutchess (97 ms, pre-existing, unchanged).

## 8. Live, after the push (`1f6014d`)

Deployed within about 60 s (the /who-we-are chips in sentence case on realtylt.com); the live phone
first screens photographed at 390 x 664, 390 x 844 and 320 x 568, no overflow.
`_scratch-r59-live.mjs --base=https://realtylt.com`: plates, lights drawn and fetched once, the
credit's (i), CSP silent, no page errors, the first film played on scroll, at 1440 and 390. Its
failures, each read: the two noindex checks (by design, the site is public); six plain GETs answered
429 (Vercel's bot protection challenges non-browser fetches; the same resources loaded in the
browser); "no film in the first screen" at both widths: the first film is warmed on purpose once
the page has loaded and the lights are in (`openFilms`, round 59), and the laptop's path is
untouched this round (the A/B), so the check predates that design, not this round.
