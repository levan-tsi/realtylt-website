# Design round 56: the real map (Google's 3D map as the hero's ground, our lights on it)

Round 55 measured and fixed the lag and put a satellite glow under the contour valley. The owner
saw it on 2026-09-23 and rejected the picture, not the work. This document is the pivot: his
verdict, what was proven in his browser tonight, the facts about Google's 3D map with their
sources, the design decisions, and the phases an Opus builder runs (his order: Opus builds,
Fable orchestrates, from now).

## 1. The verdict (2026-09-23, verbatim)

> "I don't like it to be honest. When it starts, when I scroll down, that first page kind of
> freezes in the middle, and after a few seconds it disappears. It has to be smooth, no freezing
> or anything like that. But also, the map doesn't look realistic at all. The dots that you added
> in some areas, maybe they are better, but when it gets close and we zoom in some areas it
> becomes kind of pixelated, and we have to make it minimalistic, not too overcrowded or too many
> lights in one place; even though there is the city density expression it has to be still
> balanced. Now the lights are distributed all over and it looks like everywhere is covered. But
> most importantly, the map kind of lost its visual: you won't really understand which area
> you're looking at. So find that Google Maps 3D API or something, I know there's something that
> existed, that we can get just that area for our map and then add our dots, as we did on our AI
> page: I found the 3D brain somewhere and we copied it and made it ours. So find if there exists
> some 3D map that has good visuals, maybe shows the city, and then we add those lights, and maybe
> those lights will be interactive when the mouse is there, and smooth transitions, and when we
> zoom out to the city it should show the area, customers should understand what area that is.
> And we're changing to Opus builder and Fable orchestrator from now."

Four orders in it: (1) no freeze, ever; (2) a real, recognisable map; (3) our lights on it,
balanced and minimal, interactive on hover, smooth camera; (4) Opus builds.

## 2. Done tonight, proven in his Chrome (headed, real GPU)

- **The freeze is fixed** (commit `d86e43f`). Reproduced first: the poster still is absolute to the
  page, so a wheel at 1.5 s left it as a frozen picture across the top third of the window with a
  hard seam at 300 px until the intro's end at ~5.5 s (`scripts/_scratch-r56/freeze/t4.png`).
  Now a scroll past 24 px drops the still in 400 ms, and if the scroll came while the clouds were
  building it drops the moment the scene is ready; only where WebGL exists (without it the still
  is the hero). Measured after: opacity 0.06 at 0.4 s after the scroll, 0 by 1 s, no seam
  (`t3.png`). Three tests pin it. This stays whatever the hero becomes.
- **Google's 3D map renders with the site's existing key, no extra setup**
  (`scripts/_scratch-r56-g3d-test.mjs`, frames in `scripts/_scratch-r56/g3d/`): Manhattan in
  HYBRID mode is photorealistic with labels (`debug.png`), **Poughkeepsie has full photorealistic
  3D coverage** too (buildings, the Mid-Hudson bridge, terrain, street and place labels;
  `poughkeepsie.png`), and the valley at 60 km range shows the river, the terrain and every town's
  name from Kingston to Cold Spring (`valley.png`), which is exactly "customers should understand
  what area that is". No `gm_authFailure`, no `gmp-error`.
- Two traps found on the way, for the builder: the loader's `callback=` must be defined BEFORE
  the async script tag (an inline script after it lost the race and the map never initialised);
  and `gestureHandling` is an enum in UPPER CASE on the element (`'cooperative'` throws "not an
  accepted value" inside the async init, i.e. an unhandled rejection with no console error; the
  attribute form `gesture-handling="cooperative"` in the docs is lower case).

## 3. The facts, with sources (fetched 2026-09-23 in a real browser; the pages are JS-rendered)

| fact | source |
|---|---|
| Load: `https://maps.googleapis.com/maps/api/js?loading=async&key=…&libraries=maps3d`; element `<gmp-map-3d center="lat,lng,alt" tilt="…" range="…" heading="…" mode="hybrid">` or `new Map3DElement({center:{lat,lng,altitude}, range, tilt, heading, mode})` after `google.maps.importLibrary('maps3d')` | developers.google.com/maps/documentation/javascript/3d/get-started, /map-modes |
| Modes: `ROADMAP` (roadmap with labels), `SATELLITE` ("a photorealistic map based on aerial imagery"), `HYBRID` ("the satellite map view with basemap labels"); "Satellite and hybrid: ideal for real estate … where visual fidelity and terrain context" matter. The page notes pre-GA offerings are under the Service Specific Terms | /3d/map-modes |
| Camera: `flyCameraTo({endCamera, durationMillis})`, `flyCameraAround({camera, durationMillis, repeatCount})`, `gmp-animationend`, `stopCameraAnimation()`; camera = center (lat, lng, altitude), range, tilt, heading | /3d/animate-camera |
| Interaction: `bounds`, `minAltitude`/`maxAltitude`, `minTilt`/`maxTilt`; `gestureHandling` COOPERATIVE ("allows the user to scroll the page without impacting the map's zoom or pan"), GREEDY, AUTO | /3d/interaction |
| Events: `gmp-steadystate` (load your markers and animate after it), `gmp-error`, `gmp-centerchange`/`-headingchange`/`-rangechange`/`-tiltchange`/`-rollchange`; do not update overlays while the user pans or zooms | /3d/map-events, /3d/best-practices |
| Markers: `Marker3DElement` (fast; "for applications with more than 1,000 markers … strongly encouraged"), `Marker3DInteractiveElement` (click and keyboard, `gmpPopoverTargetElement`), `collisionBehavior`, altitude modes, `PinElement` glyph customisation; ~300 SVG markers load in 150 to 300 ms on a modern laptop | /3d/marker-overview, /3d/best-practices |
| Styling: cloud-based map styling by `mapId` (POI density and categories, feature fill/stroke); "You must select '3D Hybrid' and use 'light mode'" for a 3D style; `mapId` can change at runtime | /3d/customize-maps |
| Price: SKU "Immersive Maps", category Pro, billable event = map load, **5,000 free loads a month, then $7.00 per 1,000** (falling with volume); a 2D map on the same page is billed separately | /maps/billing-and-pricing/pricing, /sku-details |
| Policy: display the "Google Maps" attribution (the built-in logo must stay visible and unobscured); no pre-fetching, caching or storing of map content except as allowed (so **no screenshot of the map may be shipped as our poster or fallback**); Places content is not to be scraped | /maps/documentation/javascript/policies |

## 4. Decisions

1. **The hero's ground becomes Google's 3D map in HYBRID mode**, fixed behind the page like the
   canvas is today, `gestureHandling` COOPERATIVE so the page scrolls as it always has and the
   map never eats a wheel. Each section's `data-shot` becomes a preset camera (center, range,
   tilt, heading) and a section change is one `flyCameraTo` (1.6 to 2.6 s, eased by Google), the
   area chapter flies county by county exactly as the night flight did. The night-flight scene
   stays in the code as the fallback (no key, `gmp-error`, no WebGL, reduced motion = cut, JS off
   = the poster) and for /search's map language until that page is decided.
2. **Our lights = the homes for sale only.** No street-light carpet (the map supplies the city).
   `Marker3DElement` with a small warm glyph, thinned by altitude the way the search map thins
   pins (the establishing shot shows the towns' brightest few hundred, a county chapter its
   homes, a close shot every home), so it is never overcrowded and never pixelated; a hovered
   or focused marker brightens and names its town and price; a click opens the listing. Hover on
   markers is not documented for 3D: prototype `Marker3DInteractiveElement` plus pointer
   hit-testing on the page (the marker's screen position is not exposed, so hover may have to be
   nearest-marker by projected position from our own camera maths) and report what works.
3. **Look.** The map is daytime imagery under a black-and-white page: the builder renders BOTH
   the map at full brightness with a graded dark scrim only under the words (the quiet boxes)
   AND a dimmed map (a dark veil at 0.35 to 0.5 over the whole map, the words on it) at every
   section, at 1440 and 390, and the owner chooses. The attribution logo stays unobscured in
   either. No night mode exists for 3D maps; a cloud style (light mode, 3D Hybrid) can thin the
   POI clutter and that is worth one map ID.
4. **Cost is accepted by the owner's order**: every home-page view is one Immersive Maps load;
   5,000 a month free, then $7 per 1,000. Pre-launch traffic is far below the free tier. The
   figure goes into the handoff so it is never a surprise.
5. **Fallback and honesty.** The poster stays OUR artwork (the night-flight still); a Google
   screenshot cannot be stored. With JS off the poster carries the hero as today. The copy under
   the search says what the lights are (the homes for sale) and that the map is Google's.

## 5. Phases (Opus builder, one at a time; the orchestrator re-verifies each on the running app)

1. **The prototype in `/lab/g3d`** (RLT_LAB=1): the map with the six shots (hero, dutchess,
   highlands, westchester, harbour, region) as cameras and the eleven county chapters, our
   listings as thinned markers, a hover/focus treatment, both looks from §4.3, a `data-shot`
   driver that flies on section change. Frames at every shot at 1440 and 390 in
   `scripts/_scratch-r56/g3d/lab/`, a video, the CSP violations it hit (read the console; the
   orchestrator decides the `next.config.ts` change with the owner, never the builder), the
   frame-time probe (`scripts/_scratch-r55b-lag.mjs`, headed) on the lab page.
2. **Integration behind a flag** (`NEXT_PUBLIC_HOME_MAP=g3d`): the home page's ground becomes the
   map when the flag and the key are present and the map reports `gmp-steadystate`; the night
   flight otherwise. The copy follows. Tests for the shot-to-camera table, the thinning and the
   fallback order. The ledger of round 55 (`DESIGN-ROUND55.md` §7) binds: tsc, vitest only up,
   overflow, focus, tap targets, contrast under the words measured on the REAL map pixels, no-JS,
   reduced motion, day pages byte-identical.
3. **Polish rounds on frames and videos** until it is wow next to realtylt.com/ai, then the owner's
   verdict, then /search's map decides its own round.

## 6. What the owner should know now

- The map will show Google's labels and logo; that is the price of the real thing and the
  policy. A cloud style can calm the point-of-interest clutter.
- Each view of the home page is a metered Google load after the free 5,000 a month.
- The night flight does not disappear: it is the fallback and the poster.
