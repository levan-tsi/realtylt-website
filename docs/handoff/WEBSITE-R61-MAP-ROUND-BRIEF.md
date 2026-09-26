# The map round (round 61) brief, written 2026-09-25 by the round 60 orchestrator

His seventh verdict's map asks, in the order to build them, each measured before the next. Runs after
the dark site is deployed (round 60). One Opus builder at a time, the orchestrator verifying on the
running production preview (:3102) before the next; nothing pushed by a builder; realtylt.com is
LIVE, a push to `main` is a public deploy after the gates.

## 1. The first second ("it still takes like a second before it loads")

Measured (`scripts/_scratch-r57l-see.mjs`, a cold headed profile at 1440): 500 ms black below the
header; 750 ms the plate on and the hero text mid-rise; 1,250 ms the county names; 1,500 to 1,750 ms
the lights. Facts established: the plates ground has NO cover (`coverOn = engine === "ml"`); the first
plate slot is opacity 1 from the server; the plate controller's `start()` does not fade it. What
gates what:

- The hero text: `.rise` (a 0.7 s rise-in with 0.08 / 0.16 s delays, `app/globals.css`) starts at
  first paint, so the text is at partial opacity for about half a second after paint. Approved
  motion (round 54); a 0.45 s rise on the same curve keeps the gesture and gives 0.25 s back.
  Measure, do not guess.
- The plate: its bytes at ~90 ms warm and ~300 ms cold, its decode 100 to 200 ms (AVIF 189 KB at
  2880): on at 400 to 600 ms cold. The HTML is 368 KB: the hero is near the top, but the document's
  size and the blocking CSS decide the first paint. Measure what fills the 368 KB (the rails' cards,
  the county rows, inline SVG, the intake) and cut or defer what the first screen does not need.
- The lights: the fetch starts at ~100 ms (round 59's early fetch), but the draw waits for HYDRATION
  (the script, 378 KB over the wire, then React) at 620 ms warm and 1.1 s cold, then the elevation
  (366 KB WebP) lifts them. Levers: (a) split the film engine (the film layer, the flight matrices,
  the video code), `LocationSuggest` (24 KB of source, needed on focus), the intake and the carousel
  out of the first bundle (dynamic import on the first scroll, focus, or idle); (b) confirm the
  first light draw does not wait on the elevation; (c) draw the lights right after hydration, before
  the labels' plan.
- The home page's script today (uncompressed, `.next/static/chunks`, the build of 2026-09-25 20:55):
  the page chunk 212 KB; shared chunks 253 KB (9da6db1e), 169 KB (1255), 168 KB (4bd1b696), 156 KB
  (5402), 109 KB polyfills, 61 KB (44530001), then 22, 20 (layout), 19, 16, 13 KB: about 1.2 MB,
  378 KB over the wire. Run `@next/bundle-analyzer` (or source-map-explorer on the build) to name
  what is in 1255 / 4bd1b696 / 5402 before splitting; the polyfills chunk (109 KB) should not ship
  to a modern browser at all (check `browserslist`).

Gate: the see probe at 1440 and 390 on a cold profile, plus a Slow 4G and 4x CPU run: the plate and
the text by ~400 ms warm, the lights by ~800 ms warm; the boot probe's medians; no regression in the
transition walk, the calibration (0.00 px with the live map's light counts), hover 50 of 50, JS off.

## 2. Light density ("if we're zooming in at least put whatever can fit")

Measured (`scripts/_scratch-r59-density.mjs`), drawn / homes in the window at 1440: territory 450 /
15,704; Dutchess county 256 / 399; Queens 768 / 5,016; Brooklyn 240 / 1,053; Westchester county 543 /
1,074; Manhattan 170 / 1,827; the Bronx 275 / 1,951. The phone: territory 257 / 15,476, Queens 282 /
4,182, Dutchess 141 / 314. The limiter is `budgetFor(range)` (`components/home/g3d/cameras.ts`: the
window's area over `pxPerLight`, capped at `MAX_LIGHTS` 2,400) and the gap (`densityGap`: `CITY_GAP`
14 px at the cities for the pointer, 12 at the territory, `FINGER_GAP` 14 on a phone).

The territory stays a scatter (his approved look). At the county and borough PLATES (still pictures;
the pointer picks the nearest light within 22 px), raise the budget so the drawn count approaches
what a ~9 px gap allows (Queens ~2,500, Manhattan ~1,500, Dutchess all 399); keep the hover honest
(the hover probe 50 of 50 at Queens at the new density; a 9 px gap means two lights can share the
14 px hit radius: the nearest wins, prove it); keep the frame budget (the layer draws on landings, not
per frame; the film's per-frame draw at three times the lights must stay under 3 ms mean: measure).
Phones: the finger gap stays 14 but the budget may rise. `?gap=` exists; add `?budget=` for his
comparison. Frames at every stop, both widths, looked at.

## 3. Parks a dark green, water a little blue ("to stay in our colors")

HIS DECISION from a side-by-side. Render THREE plates (dutchess-county, putnam, queens) in two or
three tint strengths beside the current (parks and wood a few percent above the land toward green,
about `#0b120e` and `#0d1610`; the water lifted toward blue-black, about `#03081a` and `#051030`; both
under the lights' brightness) as one contact sheet at 1440 and one at 390, with the lights on. NO film
re-record until he chooses (a tint changes every frame: about an hour of recording, 30 minutes of
encoding, the joins re-measured). The style variant lives behind the `plate: true` options; the live
style is untouched (its fingerprint test holds).

## 4. Carried, not asked for this round

`public/plates` is 23.7 MB, mostly WebP fallbacks (AVIF decodes in every browser of the last three
years; the WebP serves Safari before 16.4 and old Chrome): keeping the WebP at the 1x width only would
halve it; note it, do not spend the round on it. The tablet aspect (768 x 1024 takes the tall plate
cropped). Few lights mid-flight (0.7 to 1.3 s of a county flight). The first move up the page fades.
A second film's long opening frame. Real iPhone, Safari and Firefox unverified. Two old blog URLs
Google still asks for (404 on the live site): `/blog/when-to-sell-house-hudson-valley` (no post of
that slug exists; a redirect to the nearest seller post) and the OLD listing URL form with
underscores and upper-case state (`/homes-for-sale/NY/kew_gardens/...`), which returns 404 for
listings that left the market: a 410 or a redirect to the town's search is the SEO answer.

## Gates for every builder in this round

tsc clean, vitest only up (2218 at the close of builder 4), the calibration probe at 0.00 px with the
live map's light counts, the transition walk (`_scratch-r58-transition.mjs`), the trace, the boot
(`_scratch-r58-boot.mjs`), hover 50 of 50 ALONE, contrast, overflow, reduced motion, JS off, the
film's joins and light sync if anything in the film changes, the crawler ALL PASS, and a LOOK at
every frame. Probes block `/api/media/` and `/api/lead` by CDP; never an MLS Grid call; never a push.
