# Website round 63 handoff: the phone, second pass (written 2026-09-26)

## 0. START HERE

Round 62 (record `docs/parity/DESIGN-ROUND62.md`, live at realtylt.com since `4830990`) made the map
show on a phone. The owner looked again on his phone the same evening. His words, lightly cleaned of
filler, are the brief:

> "Brooklyn is not visible because at Brooklyn this black part starts, and that black part should be
> see-through, or just nothing, and it should be the map itself, and the text 15,000 homes and then the
> boxes where they are. Just make them see-through so the map is fully visible. And even on the top,
> 'Let's find home', till the logo and the menu, it doesn't need to be dark, it could be map. Isn't
> that better? We're limiting the map really bad."

> "The quality still needs polishing: it looks like low quality because we're zoomed out and it looks a
> little pixelated, and in some parts things are black and the map is covered. Maybe we should make
> those parts not black. Just put the text as is, and that would be it."

> "When I scroll with the phone, if I click a different county it brings me there and moves the map,
> but if we scroll up and down it takes time before it loads the map and it just appears. With the
> scroll, make the same thing as the click: it takes you there with the map moving."

> "Don't touch the parks and the colors, we're keeping them as they are."

> "The small items you noticed and didn't touch, all caps and stuff like that, fix those, and any we
> missed."

Process: the /website skill's rules (single agent unless he says otherwise, gates in the foreground,
push only after the gate, realtylt.com is LIVE so every push is public). The desktop is approved:
tasks 1 to 3 are PHONE work (below lg), prove the 1440 home frames unchanged (the round-62 method:
`scripts/_scratch-r62/base-1440/` is the pre-62 reference; after 62 only the hero's count line
differs by antialiasing). Task 4 changes words at every width, which he asked for.

## 1. The words straight on the map (no black behind them)

What makes the black today, all in `components/home/ml/MlGround.tsx` and `app/page.tsx`:
- the SCRIMS: every `[data-quiet]` block gets a black rectangle (rgba 0 0 0 0.8, on a phone 12 px pad
  and a 56 px feather, `PHONE_SCRIM_*`; `shareOf` gives 1 on a phone). On the first screen the eyebrow,
  the headline and the lead block (the count + the search + the links) all have one; the lead block's is
  what covers Brooklyn;
- the TOP SCRIM (`topScrim`, 230 px, 0.86 to 0 from the top, plus a 72 px 0.6 band below lg): the
  dark from the logo down to "Let's find home.";
- the search box's own glass (`bg-night-deep/70 backdrop-blur-md`) and the two links' (`/45`), and the
  pinned county panel's shade and chips (`bg-night-deep/80`).

His ask: on a phone, none of that black. The words sit on the map with their own text shadow (the
`halo` class, the `LABEL_SHADOW` recipe); the boxes become see-through (a hairline and a light blur at
most, or no fill), so the map runs edge to edge from the header to the bottom. The header itself may
keep a hairline of legibility for the nav (look at it; he said "till the logo and the menu").

Guard rails: legibility stays measured, not assumed. Run the home contrast kit on the phone
(`node scripts/_scratch-r57l-contrast.mjs --phone`); where a word over the densest lights drops under
4.5 (p95), fix it with the TEXT (a stronger shadow, weight, size), not a black box. Show him the
before / after at 390 x 844 and 390 x 664 in one image, as in round 62.

## 2. "Pixelated" when zoomed out, and black patches

- The hero's tall plate is a PLAIN render (390 x 844 css at 3x, zoom 8.33), not a deep one; the
  county plates are deep. Try the hero tall plate as a DEEP render (`node scripts/make-plates.mjs
  --only=hero --aspect=tall --deep=1`, then calibrate `--phone`; the film `hero--dutchess` tall starts
  from this plate, check its first frame joins, re-encode with `scripts/_scratch-r62-reencode.sh`'s
  settings if its end must change). Compare at 1:1 on device pixels before deciding.
- Look at the lights at the territory on a phone (glyph size, the halo) at device pixels: soft dots
  can read as "pixelated" too.
- "Parts are black": the scrims again (task 1), and the plate's own black (ocean, the plate's grade).
  Do not change the palette or the parks/water (his word: keep them); only the covering shades go.

## 3. The scroll should fly like the chip does

Today a chip tap scrolls the page smoothly to the county's stop (`MlGround goTo`, `window.scrollTo`
smooth) and the flight film plays. A thumb scroll through the pinned stage (`.rlt-areas`, 460svh, 11
stops ~33svh apart) "takes time before it loads the map and it just appears": diagnose before fixing
(superpowers:systematic-debugging). Candidates to measure, not assume:
- the controller waits for the scroll to settle (`SETTLE_MS` 110 in MlGround, `schedule`) and a fast
  thumb passes stops, so it JUMPS (the fade over, `fades` in `window.__ml.stats().plates.films`)
  instead of playing films;
- films are warmed only for the neighbours of the current stop (`warm(neighbours, filmNeighbours)`)
  and the 1170 phone clips are 1.1 to 1.3 MB each since round 62: a clip not yet decoded falls back to
  the fade;
- momentum scrolling on iOS delivers scroll events differently from the probe's `scrollTo`.
Measure with a real swipe (Playwright touch `page.touchscreen` / CDP `Input.synthesizeScrollGesture`
with momentum) through the stage, log `played` vs `fades` and the time from crossing a stop to the new
plate. Fix options once the cause is known: fly each stop crossed in order (queue the films), snap the
pinned stage to its stops (CSS scroll-snap on the section only, test on iOS), warm more clips ahead
inside the pinned stage, or lower the phone clip weight if decoding is the wait. The chip path must
keep working.

## 4. Titles in sentence case, and the small items

He said fix them. Site-wide, visitor-facing copy only:
- ALL CAPS headings and labels written in capitals or `uppercase` classes: /selling ("NOT SURE WHICH
  OPTION IS BEST? ...", "WHAT OUR CLIENTS SAY", "FAST CASH OFFER", "TRADITIONAL LISTING", "FASTEST",
  "HIGHEST PRICE", "GET TOP MARKET VALUE", "PERFECT IF YOU HAVE"), the listing page ("SCHEDULE A
  TOUR", "MAKE AN OFFER", "SAVE THIS SEARCH", "OFFER / SHARE / SAVE", "SEARCH / ORANGE COUNTY", the
  Market Insights sublabels, "RESET", "REPRESENTATIVE RATES"), /who-we-are's county chips, /buying,
  /financing ("LOAN PRE-APPROVAL LETTER"...), /connect ("MESSAGE US INSTEAD"), the blog's "THE REALTYLT
  JOURNAL", "READ ARTICLE", "LATEST", "MORE READING". Find them by code (`uppercase`, `tracking-[0.1`,
  strings in capitals), not by eye.
- Title Case headings to sentence case ("The Home Buying Process" -> "The home buying process",
  "Making An Offer And Closing", "Find The Right Loan", "Demystifying Home Loans", "Our Pricing
  Strategy", "Innovative Internet Marketing", "Stay in the Loop, Every Step of the Way", "What You Can
  Hold Us To", "How Much Is Your Home Really Worth?", "A Valuation You Can Actually Act On", "Who We
  Are", "Where We Work", buttons like "Book Free Consultation", "Get My Free Offer & Analysis", "See The
  Full Buying Process"). Keep proper nouns (RealtyLT, OneKey MLS, Hudson Valley, county names, REALTOR).
- Check the words are not pinned by tests or by the SEO audit (titles and meta stay as they are unless a
  test says otherwise); the page `<title>`s are not headings, leave them.
- The rest from round 62's list: at 320 x 568 "Sell with us" wraps below the first screen (make both
  links fit, e.g. 14 px and tighter padding under 360); the 1440 90 ms hold frame at Dutchess (pre-existing,
  look only if time).

## 5. Decisions recorded

- Parks and water colours: KEEP AS THEY ARE (his words, 2026-09-26). The round-61 tint options are closed.
- Round 62's phone films at 1170 stay unless task 3 shows their weight is the wait.

## 6. Where things are

Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53` (== main `4830990`+).
Preview: ONE server on :3102, rebuild with `scripts/_scratch-r62-rebuild.ps1` (stop, `next build`, start
with RLT_LAB=1; ~50 s). Probes of round 62 in `scripts/_scratch-r62-*.mjs`: `first` (first screens at
390x664 / 390x844 / 320x568), `walk` (frames at scroll offsets), `scroll` (a page walked screen by
screen, montaged; use this, not fullPage shots: reveals never fire in those), `el` (one element),
`chip` (chip taps), `ov` (overflow on 15 pages), `montage`, `diff` (pixel diff), `livecheck`/`live2`
(the live site in a phone browser; plain fetch/curl is challenged by Vercel's bot protection).
The gate list is the round-62 handoff's §5 (`docs/handoff/WEBSITE-R62-PHONE-POLISH-HANDOFF.md`).
