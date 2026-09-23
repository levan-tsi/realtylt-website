# Design round 57: the real map becomes the home page, and it gets finished

Orchestrator's record, opened 2026-09-23. The brief is `docs/handoff/WEBSITE-R57-HANDOFF.md`
(his verdict verbatim in its §1). This file carries the plan, the bar each round has to clear,
and what the orchestrator measured after each builder. Round 56's facts (`DESIGN-ROUND56.md` §3,
§7, §8) stand; nothing here repeats them.

## 1. The bar, in his words and in numbers

His sentence: *"it's not visibly understood that it's New York's five boroughs and Westchester
and up ... show everything from higher ... the map has to be more realistic ... the addresses and
you could click ... needs more polishing."*

What "done" means for each of his four points:

1. **The territory reads without knowing.** At the first steady frame, at 1440 and at 390, the
   frame holds Staten Island, the whole of Long Island's western end, Westchester to the Sound,
   Rockland and Orange, Putnam, Dutchess to Poughkeepsie and the Ulster shore. Our own labels name
   the counties and the boroughs in our type where Google's are too small at that altitude. Test:
   a person who has never seen the site says "New York City and the Hudson Valley" from the
   frame alone, no copy. The frames go in the record.
2. **The map is the picture.** At the territory shot the lights are few and small (a ceiling well
   under the current 350 and a smaller glyph), and they grow only as the camera comes down. The
   imagery is not veiled; scrims sit only under words. Google's POI clutter near our words is
   thinned by a cloud map style if one is available to us.
3. **The address lights are finished.** Hover names the home (town, price, beds and baths when
   cheap) without covering the light; the light brightens on hover and on its featured card's
   focus; a click flies in briefly and opens the listing; a phone tap opens it; the featured
   homes are reachable by keyboard. Every one measured for frame cost.
4. **No freezing, on his terms.** The laptop hitch is measured on HIS machine before we choose
   among flying, hybrid and stills; the chosen one ships behind a flag with the other one switch
   away.

And the standing ledger (`WEBSITE-R55-HANDOFF.md` §6): tsc clean, vitest 1720 and only up, no
horizontal overflow at 1440/768/640/390/320, focus 3:1+, tap 24px+, phone controls 16px+, text
contrast 4.5:1+ on the REAL map pixels at several stops, JS off works (the poster), no WebGL
works, reduced motion cuts, day pages byte-identical, the safety rules, no vendor URL visible
beyond Google's own attribution.

## 2. Process

Fable orchestrates. Opus 5.5 builds, ONE builder at a time (parallel agents freeze this PC),
each round one concern. After every round the orchestrator re-runs the gates and the probes on
the running app, LOOKS at the frames, and writes §4 below before the next round starts. After
the fifth round the orchestrator runs its own polish round as a visitor on a laptop and a phone,
then writes the successor handoff, and only then does the owner look.

## 3. The rounds, with the orchestrator's adversarial notes

### Round 1: the territory shot, then the map becomes the home page

(a) **The opening camera.** Higher and wider than today's hero (120 km range, 50 degrees, from
41.05/-74.2 looking north, which cuts the city off at the bottom of the frame at 1440 and shows
Albany at 390). The camera stands south of the harbour looking north so the city is at the front
and the valley runs up the frame, or stands over the region looking straight enough down that
the whole territory sits in one frame; the builder renders both at 1440 and 390 and keeps the one
where a stranger reads the place. Our own labels for the areas we cover (the boroughs, the
counties; our type, small caps or the site's label style, white, quiet), placed by projection
from `camera.ts` at the steady frame, fading out at the start of the first flight and never
drawn at any other shot (Google's labels take over below). The 390 frame is tall: the territory
is roughly 130 km north to south and 80 km east to west, so portrait fits it at a smaller range;
tune `tall` separately.

Watch for: Google's globe horizon and atmosphere appear when tilt is high at range; the words
need a quiet ground so the sky band, if any, stays thin. The ladder (`cameras.ts`, ratio 2)
will pull Dutchess back toward half the new hero range; phase 1b measured that the ladder's
rule changed nothing on the laptop, so the hero-to-Dutchess step may exceed the ratio if the
lag probe says it costs nothing; assert nothing, measure. The one-shot pre-warm must warm the
NEW hero camera. Our load cover is the night still framed for the OLD hero; re-render it from
the new framing (`scripts/make-night-poster.mjs`) so the dissolve does not also change the
composition.

(b) **The integration.** `app/page.tsx` renders `G3dGround` when `NEXT_PUBLIC_HOME_MAP` is
`g3d` or unset and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is present; `NightGround` otherwise (the
flag `night` forces the night flight; no key means night). At runtime: `gmp-error`, no WebGL and
a blocked script keep the poster for good (a still, our artwork; loading a second WebGL scene
after the first failed is waste); reduced motion shows the map and cuts between shots; JS off is
the poster with the hero words. ONE home page, no copy: the lab page's honest copy and its
query flags move to the home page (`?homes=0`, `?warm=`, `?gate=1`, `?flight=`, `?look=`,
`?scrim=`, `?veil=`), the lab copy at `app/lab/g3d/page.tsx` is deleted, `"/lab/g3d"` leaves
`NIGHT_ROUTES`, and the test in `components/search-instrument.test.ts` that knew about the lab
copy is updated. `/search` untouched. The footer rule in `FooterShell.tsx` for "/" stays.

Gates for round 1: frames at every stop at 1440 and 390 in `scripts/_scratch-r57/1/`, the headed
lag probe cold and warm at both widths, the contrast kit at the new stops, day pages rendered
before and after and diffed at 1440 and 390 (0 pixels), the no-JS probe, the blocked-script
probe (poster stays), the flag `night` (the night flight returns), tsc, vitest only up with tests
for the label placement and the flag resolution.

### Round 2: more realistic, the map is the picture

A lower ceiling and a smaller glyph at the territory shot, growing on the way down; the scrims
tuned by frames; one cloud map ID ("3D Hybrid", light mode) that thins POIs, created by the
builder if the Cloud console allows it and by the owner otherwise (the report says which); the
load cover decided by frames of both (dusk-toned still, or the page's top made day-consistent).

### Round 3: the address lights, finished

The hover label, the brighten, the click's fly-in when steady, the phone's tap-then-open,
keyboard reach for the featured homes, the county chapters from the list; frame cost measured.

### Round 4: the hitch, on his terms

His machine measured (the Chrome extension, or his MacBook), then flying, hybrid or stills
chosen with numbers, built behind a flag.

### Round 5: the fresh-eyes walkthrough

Every page at 1440, 390 and 320; tab everything; the seams between home and /search; slow
network; failed `/api/lights`; failed map; empty; error; 200% zoom; reduced motion; no-JS; no
key; every word of copy; the ledger re-run and written here.

## 4. Measured after each round (orchestrator)

(appended as the rounds close)
