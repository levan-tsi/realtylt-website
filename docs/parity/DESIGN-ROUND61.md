# Round 61, the map round

His seventh verdict's map asks (brief: `docs/handoff/WEBSITE-R61-MAP-ROUND-BRIEF.md`). §1 is the first
second; §2 (light density) and §3 (parks and water) are the next builders'.

## §1 The first second

His words (2026-09-25, on the plates home page): "It loads very fast and it's better, but it still
takes like a second before it loads."

### How it was measured

All on the production build on :3102 (this PC, headed Chrome, `/api/media/` and `/api/lead` blocked by
CDP). New probes under `scripts/_scratch-r61/` (gitignored):

- `analyze-hook.cjs`: `@next/bundle-analyzer`'s plugin on the client compiler WITHOUT touching
  `next.config.ts` (a `--require` hook wraps Next's own `loadConfig`; `R61_ANALYZE=1`). `union.mjs`
  lists every chunk the home page needs to hydrate (the `/layout` and `/page` entries) with its
  contents; `html.mjs` and `flight.mjs` take the document and its RSC payload apart.
- `first.mjs`: the first second on the navigation's own clock, per run: FCP; the plate's reveal
  (`stats.revealAt`); the lights (`performance.mark("ml:lights")`, added to the controller this round,
  the moment the first lights are planned; the old probes polled for it and were late by a frame and a
  task); the hero's words at full strength; the lights' fetch; the elevation. A fresh context per run
  (cold cache, warm browser).
- `ab.sh` + `serve.ps1`: THE BASE BUILD AGAINST THE FINAL, INTERLEAVED. The base (`b694ffa`, the tip
  before this round) is built in a detached worktree in the scratchpad (node_modules joined, its own
  `.next`) and the two builds take turns on :3102, blocks of runs alternating twice, so the PC's load
  falls on both alike. Every "before / after" below from `first.mjs` is such a pair.
- `plate-paint.mjs`: when the plate is ON SCREEN from the pixels (a screencast, a patch of the ground
  where no word stands); `--coldbrowser` starts a new Chrome per run like the see probe.
- `trace.mjs`, `layout-cold.mjs`, `longtasks.mjs`, `rec-profile.mjs`: the main thread, what the first
  layout costs, the long tasks of the first six seconds, the CPU profile of the worst one.

### The bytes, named (before)

What the home page needed before it could hydrate (`union.mjs`, the build of the round's start):
**20 JS files, 1,185.5 KB parsed, 363.5 KB gzipped**, and three render-blocking stylesheets.

| chunk | parsed / gzip KB | what it is |
|---|---|---|
| 9da6db1e | 253.9 / 82.0 | **posthog-js**, whole, in the LAYOUT's bundle (every page) |
| page | 212.2 / 68.0 | MlGround 30.4, **G3dGround 27.8**, plate-controller 19.6, **g3d/controller 13.8**, plates.gen 13.1, **ml/controller 10.6**, **ml/style 9.2**, light-layer 6.7, HomeIntake 5.8, **NightGround 4.6**, WhyCarousel 4.1, flights.gen 2.9, flight-path 2.4 ... |
| 4bd1b696 | 169.0 / 53.0 | react-dom |
| 1255 | 169.2 / 45.1 | Next's client runtime |
| 5402 + 44530001 | 218.3 / 56.0 | @supabase (auth-js, storage, postgrest, realtime), the layout's AuthProvider |
| 5376 | 22.1 / 6.9 | Node's `buffer`, compiled in by Next |
| 1986 | 19.1 / 6.6 | LeadForm + QualifyingWizard (layout and page share it) |
| layout | 20.2 / 6.4 | the Header, AccountMenu |
| 1240 | 16.7 / 6.6 | night/lights, shots, **NightScene**, elevation |
| 3198 | 9.8 / 3.9 | **map-shared, maps-loader** (the Google map's) |
| 9306 | 7.1 / 2.9 | LocationSuggest 5.9, result-set |
| the rest | 60.7 / 26 | six small shared chunks (Next's image, Field/Button, auth UI, SavedProvider, ListingCard) |
| css bf7ffc84 | 81.3 / 10.3 | **maplibre-gl.css, whole** (83 KB of the 83), render-blocking, on the plates page |
| css 0619950a + 9d30515a | 148.8 + 12.0 | the site's CSS and the fonts' faces |

Bold: what the first screen never uses. The polyfills chunk (109 KB) is `<script noModule>` and a
modern browser never fetches it (checked in the HTML); there is no `browserslist`, so Next's default
targets apply (left: a build setting for every page).

**The HTML** (354 KB, 56.5 KB gzipped): the head 5.7 KB; the RSC payload **190.8 KB** (40 KB
gzipped, 105 scripts): the two rails' 32 listings handed to client cards WHOLE (descriptions,
schools, appliances, interior features: 53 KB of objects plus ~60 KB of outlined description text);
the visible markup 156 KB (16 KB gzipped): 857 class attributes 87 KB, inline style 24 KB, 40 inline
SVGs 9.7 KB; by section: the featured rail 42 KB (its duplicated drift track is the design), the hero
32 KB, New listings 24 KB, the header 14 KB, the footer 12 KB. **The head preloaded, with the
document and ahead of the plate: the Why carousel's first screenshot (106 KB, six screens down; on
Slow 4G it landed at 5.8 s, the plate at 6.6 s) and the featured rail's first two listing photos** (both
`priority` flags from rounds 6 and 31, when those sat near the top).

**The main thread** (trace, warm, 1440): the first layout 114 to 160 ms and a second full one 60 to
85 ms (1,084 layout objects both times); the scripts' evaluation ~95 ms; hydration in slices to
~650 ms; the reveal at ~700. **The reveal waited ~200 ms after the ground's effect had run**: the
controller's `start()` awaited `img.decode()` on the server's picture, and that promise resolved
only after the rest of the page had hydrated (a task queued behind React's), though the picture had
been on screen since ~250 ms. The lights, fetched at ~100 ms, waited on that reveal.

### What was done

1. **The other grounds split out** (`c3c5f3b`). Google's 3D map and the night flight are chosen by
   env and never shown beside the plates. `next/dynamic` from the SERVER page did NOT split them
   (measured: the page chunk kept all of them; client references imported by a server page stay in
   its entry), so the split lives on the client side: `components/home/other-grounds.ts` ("use
   client", four `dynamic(() => import(...))`), still server-rendered when chosen. The page chunk
   **212.2 to 136.2 KB parsed (68.0 to 46.3 gzipped)**; the night scene and the Google map loader
   left the shared chunks.
2. **The live map's controller on demand** (same commit): MlGround imports `./controller` only when
   the live map is the ground (`?ground=ml`, the plates' renderer), and **MapLibre's stylesheet moved
   into that module**, so the plates page lost an 83 KB render-blocking stylesheet. The plates'
   calibration (which drives `?ground=ml`) proves the renderer path still works.
3. **PostHog after the page** (same commit): `import("posthog-js")` once the browser is idle (at most
   2 s), init and options unchanged. 254 KB parsed / 82 KB left the bundle every page hydrates from.
4. **The lights at the first opportunity** (`227e0c8`): no `decode()` wait on a picture already in
   (`complete && naturalWidth > 0`; any other first shot still decodes first); the early script now
   parses the lights' JSON before hydration (`EARLY_LIGHTS_SCRIPT` in `lib/idx/lights-client.ts`,
   tested: once, parsed, a non-OK answer rejects and the client fetches afresh); the `ml:lights` mark.
   **The elevation never gated the first draw** (confirmed: it is asked for after the lights, in the
   lights' `finally`; the lights are planned flat and lifted when it lands, at ~540 to 600 ms warm).
   The lights are planned before the labels' placement (`start()` replans, then `onReveal` places the
   names).
5. **The HTML and its early requests** (`ad0dc81`): `forCard` (`lib/idx/card-listing.ts`) gives the
   rails' cards their listings without the 22 fields no card reads (descriptions and features
   emptied; a test reads every file on a card's path and fails if one starts to read a dropped
   field). **The document 354 to 275 KB, 56.5 to 32.3 KB gzipped; the RSC payload 191 to 113 KB.**
   The carousel's and the featured rail's `priority` removed: the three images now load lazily; the
   visible markup is otherwise identical to the base build's (compared tag by tag: only
   `loading="lazy"` on those three `<img>`).
6. **The hero's rise 0.45 s** (`7a5ec2a`), on the same curve, the same delays, scoped to the hero
   (`[data-shot="hero"] .rise`: the root is `.nocturne` since round 60, so a night scope would have
   reached the blog's entrance, which keeps 0.7 s). Looked at frame by frame at 1440 and 390, 50 ms
   apart from the first paint (`docs/design-r61/rise-*.jpg`): the same gesture, the headline, then the
   lead, then the search and the links rising into place in order; at 0.45 the words are whole at
   FCP+384 / +512 ms (1440, headline / links) against +601 / +697 at 0.7; it does not read rushed:
   the stagger keeps the order visible and the travel is still 14 px. Reduced motion collapses it as
   before.
7. **Tried and taken back** (`0a9ab4a`): a `<Suspense>` round everything below the hero, so the
   ground would commit before the rails hydrate. It was worth ~90 ms of the reveal in its A/B, BUT the
   prerender streamed the sections into `<div hidden id="S:0">` for an inline script to reveal:
   **with JavaScript off nothing below the hero showed.** Caught by comparing the visible markup with
   the base build; removed; the guard test now forbids it. The lever stays open (below).
8. **Measured and left:** the film engine's own code (flight-path 2.5, flights.gen 3.1 and ~6 KB of the
   controller's film methods, ~12 KB parsed, ~4 KB gzipped, a few ms to evaluate) stays in the
   bundle: splitting it means cutting the class that plays the films whose joins and light sync were
   measured frame by frame in round 59, for ~4 KB; not worth the risk. LocationSuggest (5.9 KB
   parsed, a shared chunk the header's pages use too), HomeIntake (7.9) and WhyCarousel (4.1): each a
   few KB; a lazy hydration of any of them needs a Suspense boundary, which (7) showed streams them
   hidden. Starting the plate's decode from an inline script as its `<img>` is parsed: measured, no
   change (plate on screen 332 ms without, 333 with).

### The bytes, after

**19 JS files, 856.6 KB parsed, 259.7 KB gzipped (from 1,185.5 / 363.5: -28%)**; two stylesheets
(149 + 12 KB; MapLibre's 81 KB gone); the document 275 KB / 32.3 KB gzipped (from 354 / 56.5).
PostHog (254 KB) arrives after the page is idle. The page chunk: MlGround 31.9, plate-controller
20.7, plates.gen 13.5, light-layer 6.7, HomeIntake 5.8, light-plan 4.2, WhyCarousel 4.1 and small
helpers. What remains big is the framework (react-dom 169, Next's runtime 169, `buffer` 22) and
**@supabase, 218 KB parsed / 56 KB gzipped, from the layout's AuthProvider**: the largest remaining
lever, and auth code, which this builder does not touch.

### The numbers (medians; ms from navigation start)

`first.mjs`, base and final interleaved, cold cache, warm browser, 6 runs each:

| | 1440 base | 1440 final | 390 base | 390 final |
|---|---|---|---|---|
| FCP | 248 | 276 | 248 | 228 |
| the plate's reveal (engine) | 712 | **533** | 614 | **526** |
| the lights planned | 731 | **589** | 701 | **584** |
| the headline whole | 852 | 724 | 785 | 687 |
| the last words whole (the links) | 1045 | **883** | 1398 | **839** |
| JS before the reveal (KB over the wire) | 371 | 266 | 371 | 266 |

The plate ON SCREEN (`plate-paint.mjs`, pixels): 1440 warm browser 358 / 425 base, 441 / 333 final
(the same within the noise: at 1440 the 2880 AVIF's decode after the first paint sets it); 390
**~270 base, ~137 final**. A cold browser per run: 1440 ~500 to 560 base, ~475 to 525 final; 390
~400 to 460 both: **unchanged**, bound by Chrome's own start and the first layout.

Slow 4G (1440, 2 runs each, interleaved): reveal **9,092 to 7,848**, lights **9,103 to 7,888**, the
plate decoded 6,660 to 6,319, the script done 8,901 to 7,791. 4x CPU (1440, 4 each): reveal
**2,570 to 1,959**, lights **2,708 to 2,103**.

The round 58 boot probe (`_scratch-r58-boot.mjs`, polling, medians of 3; before = the round's start):
1440 reveal 821 and 687 (two series) to **587**, lights 854 and 723 to 736, LCP 328 and 288 to 368
(the paragraph; its spread in both is 210 to 590 ms); 390 reveal 655 to **430**, lights 716 to
**602**, LCP 312 to 264; Slow 4G reveal 9,126 to **7,803**, lights 9,147 to **7,916**, LCP 3,344 to
3,216. The total bytes read 1.8 to 2.0 MB before, 2.2 MB after: the first film (355 KB) and the next
plate are now fetched INSIDE the probe's window because the page goes idle sooner; images 134 to 28 KB
(the carousel's preload gone).

**The targets.** The plate and the hero text by ~400 ms warm at 1440: the plate on screen ~330 to
440 and the words visible from the first paint (~250), whole at ~720 (headline) to ~880 (links):
**the plate yes, the text's full strength no** (the rise itself takes 0.45 s plus its 0.24 s stagger).
The lights by ~800 warm: **planned at ~590 at 1440 and ~584 at 390**; they fade up over 600 ms (round
58's approved soft arrival), so they read at ~800 and are whole at ~1.2 s. On a cold profile the
black below the header was NOT halved at 1440: the plate's first appearance in a fresh Chrome is
unchanged (~500 to 625 ms), set by Chrome's start, the first layout and the plate's decode.

### The frames, looked at (cold browser, a frame every 125 ms: `docs/design-r61/see-*.jpg`)

- **1440 before** (`see-before-1440.jpg`): 250 nothing painted; 500 black below the header, the
  headline faint; 750 the plate on and the words whole; 1,000 the same, no names, no lights; 1,125
  the county names; 1,250 the first lights; 1,375 to 1,500 the lights.
- **1440 after**, two runs (`see-final-1440.jpg`, FCP 568, a slow Chrome start; `see-final-1440-b.jpg`,
  FCP 464): 250 and 500 nothing painted yet (Chrome still starting); 625 the plate on with the
  headline and the lead rising (run b) or black with the headline rising (run a); 750 the words
  whole on the plate; 875 the county names; 1,000 the first lights coming up; 1,125 the lights
  clear. **The names and the lights about 250 ms sooner; the plate's first frame the same.**
- **390 before** (`see-before-390.jpg`): 500 the plate faint and the headline mid-rise; 625 to 750
  the words; 1,000 the names; 1,125 the first lights; 1,250 the lights.
- **390 after** (`see-final-390.jpg`): 375 the plate and the headline, the lead rising; 500 the words
  (the links rising); 625 all whole; 750 the names; 1,000 the lights coming; 1,125 the lights.
  **Everything ~125 to 250 ms sooner.**

What a visitor sees now, warm, at 1440 (the medians above): at 250 ms the header and the headline
rising, the plate a moment behind them; at 500 the plate on, the words rising, the engine up at about
530; at 750 the words nearly whole and the county names coming in; at 1,000 the lights coming up
across the valley and the city, whole by about 1.2 s.

### The gates (the final build, `0a9ab4a`)

- tsc clean; vitest **2,236 to 2,248** (159 files): `components/home/first-bundle.test.ts` (no
  static import of the other grounds, the live map's controller or PostHog; no below-fold preload;
  no decode wait on a picture already in; the hero's rise; no Suspense round the sections),
  `lib/idx/card-listing.test.ts`, two new cases in `lights-client.test.ts`.
- Calibration (`_scratch-r58-calib.mjs --shots=hero,queens,dutchess-county`): 0.00 px mean, p95 and
  max at all three; the live map 445 / 756 / 252 lights, the plates 445 / 757 / 251, **identical to
  the base build run the same hour** (the ±1 is the base's too).
- The transition walk: 1440, the worst in-flight frame 41.6 ms (four final walks: 20.8, 41.6, 41.7,
  28.1; four base walks: 35.0, 41.6, 20.9, 20.8: the same distribution, the 41.6 at the end of the
  Highlands flight in both); 390, 27.8 (base 27.8). p50 6.9, p99 7.2 in all. The films still play:
  the first film ready 0.6 to 0.8 s after load, and the first move played it (`films.mjs`, 1440 WebM
  and 390 MP4: played 1, fades 0).
- Hover at Queens, alone: **50 of 50**, hit test 0.015 ms.
- Reduced motion: one 400 ms opacity fade, no scale. JS off: the plate stands at both widths, the
  claims hidden (`_scratch-r58-nojs.mjs`); ALL DARK (`_scratch-r60-nojs.mjs`); every section shown
  with no hidden streamed div (`nojs-sections.mjs`, 1440 and 390).
- The crawler ALL PASS. The light-surface scan: 60 suspects, the same 60 as the base build (white
  primary buttons with dark text). The credit: the line at 1 s, the (i) at 5.4 s, the panel on click,
  closed on Escape, the line with JS off.
- Driven: the hero's search opens its suggestions on focus ("Pough": Poughkeepsie, Poughquag, ...),
  and the intake completes at 1440 and 390 (buy, the questions, the details, consent, "Send my
  details": one `/api/lead` answered by the probe, never the CRM, landing on /thank-you).

### Open, said plainly

- **PostHog's session replay freezes the page for ~1.6 s about 1.2 to 1.8 s after load** (a long
  task of 1,626 to 1,629 ms in both runs, `longtasks.mjs`; the CPU profile puts 1,640 ms in the
  recorder's element serializer). The cause: the project's remote config has **`recordCanvas: true`**
  (read from `/relay-ph/.../config.js`: `"recordCanvas":true,"canvasFps":3`), and the recorder calls
  `toDataURL()` on each of our light canvases (2880 x 1800 on a 2x laptop), twice each, in its first
  snapshot, then captures them 3 times a second. It happened before this round too (PostHog then
  started at hydration). The recorder reads a client override first
  (`config.session_recording.captureCanvas?.recordCanvas ?? remote.canvasRecording.enabled`, in the
  shipped `posthog-recorder.js` 1.418.16), so `session_recording: { maskAllInputs: true,
  captureCanvas: { recordCanvas: false } }` in `components/site/PostHogInit.tsx`, or the "capture
  canvas" setting off in his PostHog project, would end it. **Not changed here**: it is his analytics
  product's setting (replays would show the plates without the lights). The orchestrator's or his call.
- @supabase (218 KB parsed, 56 KB gzipped) in the layout's bundle through AuthProvider: the largest
  remaining piece of the first bundle; auth code, not touched by a builder.
- The below-fold content's hydration still gates the reveal by ~90 ms (the Suspense experiment); a
  boundary that does not stream hidden (or less hydration work in the rails: 24 cards, 8 of them the
  drift's duplicates) is the lever.
- The testimonial's Newsreader italic (63 KB) is fetched as soon as the page is laid out and triggers a
  relayout; on Slow 4G it lands before the plate (4.9 s vs 6.2 s). The quote is three screens down.
- Slow 4G on this PC is HTTP/1.1 from `next start`; Vercel serves HTTP/2 with priorities, so the
  order of the plate, the fonts and the script on a real slow line is not this. Not measured live.
- The cold-browser first frame at 1440 (the plate at ~500 to 625 ms) is unchanged; the owner's "a
  second" on a first visit is now about 0.75 s to the plate with its names and ~1 s to the lights.
- The lights' 600 ms fade-in is round 58's approved arrival; shortening it would bring them whole
  ~300 ms sooner. Not changed (motion he approved).

### The orchestrator's verification of §1 and the replay fix (2026-09-26)

Re-run on a rebuild from HEAD: tsc clean, vitest 2248, the crawler ALL PASS, JS off dark with the
plate standing and the claims hidden, the light scan unchanged, calibration 0.00 px at the territory,
Queens and Dutchess county with matching counts, hover 50 of 50 alone, the walk p50 6.9 ms, reduced
motion one 400 ms fade. Builder 6's open item was the biggest thing on the first screen: PostHog's
session replay, told by the project's remote config to record canvases at 3 fps, serialised the
2880 x 1800 light canvases in ONE main-thread task of 1,735 to 1,773 ms about 1.3 s after every load
(`scripts/_scratch-r61-longtask.mjs`). Fixed in our init (`captureCanvas: { recordCanvas: false }`,
read before the remote setting; replays keep pages, clicks and masked inputs): after, no task over
115 ms and the lights drawn at 464 to 559 ms. Committed as `e5b1dd3` and deployed with builder 6's
work (`8804a61..e5b1dd3`).
