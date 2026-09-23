# Design round 55: the lag, measured; the map; the interaction round

Round 54's night flight is approved in direction (`docs/handoff/WEBSITE-R55-HANDOFF.md` §1). This
document is the round-55 record: what the owner asked for in his own words, what the lag turned out
to be when measured on the real GPU (it was not what the handoff guessed), what the map can honestly
become and at what licence and cost, the interaction shortlist, and the phases the builder runs.

Session shape (owner's order 2026-09-22, evening): Fable orchestrates AND one Fable subagent builds
this session; after the five-hour window the builder goes back to Opus. One subagent at a time.

## 1. The owner's asks (2026-09-22, verbatim)

From the handoff: "some transitions lag ... map could be better, maybe we could find a 3D type of
map on New York ... make it a little bit more interactive ... [don't] go backwards or degrade."

Mid-session, message 1: "focus the light on the map where the actual cities are, distribute properly
... mimic where the cities are and make map as realistic as possible, maybe some spots 3D too if we
go close ... maybe Google offers some type of 3D map API call or something like we have integrated
in the search, so if that's easier; if not, as close as possible ... lights and more interactions and
whatever else could be added ... multiple rounds of polish, make it wow like our AI page."

Mid-session, message 2: "on the top left it has a number on the page ... replace that number [with]
the number that we have from Twilio in the CRM ending 2424, and next to that add email
info@realtylt.com, and also test it, send the email there ... and the number has to be changed
anywhere that we have in the website: contacts, header, footer, everywhere."

## 2. The lag, measured (2026-09-22, this session)

### 2.1 Method

The Chrome extension was not connected, so the owner's own profile could not be driven. The next
best instrument: **his installed Chrome, headed, on the real GPU** (`ANGLE D3D11, NVIDIA GeForce RTX
2060`), 1440x900, a **144 Hz** display (frames are 6.9 ms at rest), real wheel scrolling (100 px
notches every 16 ms), a Chrome trace per run, an in-page requestAnimationFrame log, the long-task
observer, and for the boot a CDP sampling profile. Probes (gitignored): `scripts/_scratch-r55-lag.mjs`
(the run; `--css=` injects a stylesheet for A/B, `--nogl`, `--nocontent`, `--bootonly`, `--profile`,
`--gpucat`), `_scratch-r55-trace.mjs` and `_scratch-r55-trace-stream.mjs` (what filled each slow
frame, any process), `_scratch-r55-profile2.mjs` (which functions), `_scratch-r55-css-scan.mjs`.

Round 54's headless number (p95 16.8 ms) was true and beside the point: p95 hides a single 100 ms
frame, and headless ANGLE never showed the GPU-raster stalls below.

### 2.2 What the page does on a cold load (boot)

| when | what | measured |
|---|---|---|
| 0 to 0.5 s | hydration: initial Layout of ~1,400 boxes, script evaluation | Layout 92 to 147 ms, EvaluateScript 42 to 92 ms, one React call 76 ms. ~400 ms of main thread before `load`. Ordinary Next.js cost; not the owner's "lag". |
| 0.9 to 2.5 s | the worker builds the terrain clouds | **1.95 s** in the worker (the handoff said ~1 s). Off the main thread; the poster covers it. |
| +2.45 s | the worker's result is consumed on the main thread (`HandlePostMessage` -> `buildTerrain` continuation: geometry, centroids, GC) | **60 to 91 ms** frame. The arrays are already transferred; the cost is the geometry build itself. |
| +2.52 s | **the first render with the light and haze materials** | **199 to 227 ms** frame. Profile: `render -> renderBufferDirect -> getUniforms -> WebGLProgram`, i.e. three.js linking the two new shader programs and blocking on `getProgramParameter` while ANGLE compiles them (198 ms of GPU-process work under it). This is the stutter the owner sees "right after the page loads": the dust is mid-intro and freezes for a quarter second. |
| 6.4 s | the poster dissolves | as designed (`introEndsAt`). |

### 2.3 What happens when a section changes (scroll)

Every boundary except two is clean at 7 ms. The two that stall, on every run (18 runs):

| where | frame | what filled it |
|---|---|---|
| entering the **featured listings** carousel (shot `highlands`) | **62 to 132 ms**, 2 to 4 frames over 34 ms, compositor `DroppedFrame` x8 to x15 | GPU process, `RendererRasterWorker -> RasterDecoderImpl::DoEndRasterCHROMIUM -> Skia FillRectOp` x180 to x576 in one flush of 55 to 95 ms. **Content rasterisation on the GPU.** Main thread idle, WebGL idle. |
| arriving at the **footer** (the tail of a downward fling) | **76 to 90 ms** | the same class of raster flush. |

The A/B ledger (each row = one full run with a stylesheet injected after load, numbers = the
`to:highlands` max / the fling max):
- baseline 111 / 111. WebGL disabled (`--nogl`) 77 / 104: **the stall is not the scene.**
- page content `visibility:hidden`, scene running: 7 / 69: **the scene flies clean at 144 Hz.**
- backdrop-filter off 83 / 83; image filters off 83 / 97; will-change off 125 / 90; the rail's
  mask-image off 77 / 132; every animation and transition off 63 / 84; skeleton shimmer off 90 / 42;
  card gradient off 83 / 14; all border-radius off 69 / 21; the chat widget alone hidden 83 / 104.
- the carousel track `display:none` 35 / 7 (**clean**); the footer hidden: fling 14 (**clean**).

So the cost is not one property. It is the **amount of card chrome rasterised at once**: the rail is
a 5,760 px wide `will-change: transform` layer (twelve 340x540 cards, duplicated for the loop) whose
tiles are rastered on entry and again after eviction (`used_bytes` in the GPU process climbs 37 -> 86
MB across the run), each card carrying a rounded clip, a gradient scrim, two `backdrop-blur` badges,
three `backdrop-blur` buttons and a no-op `filter: brightness(1) saturate(1)` on its image. The footer
is the same pattern at smaller scale. The camera spring, the veil recomputation, the quiet boxes and
the worker were all suspects in the handoff (§4.1) and are all innocent: the driver's scroll handler
costs under 1 ms per frame in every trace.

### 2.4 Fixes, ranked (builder phase 1), with the number each must reach

1. **Compile the scene's shader programs before the assets arrive.** Create the three `Points`
   with empty placeholder geometry at construction and `await renderer.compileAsync(scene, camera)`
   (three 0.186 has it; it uses `KHR_parallel_shader_compile`) while the worker builds, so the link
   stall overlaps the poster instead of the intro. Gate: no frame over 34 ms between `night:terrain`
   and the poster dissolve; the boot's `over100` count 0 (today 2 to 4).
2. **Take the geometry build off the hot path.** Build the `BufferGeometry` attributes in the worker
   (it already transfers the arrays) or split the main-thread continuation into two frames, and move
   `townCentroids` / `countyRaster` off the frame that consumes the message. Gate: `HandlePostMessage`
   under 16 ms.
3. **Un-promote the carousel.** Drive the drift by `scrollLeft` on the existing `overflow-x: auto`
   rail (requestAnimationFrame, pause on hover/focus as now, honour reduced motion) instead of a
   transform animation on a 5,760 px layer; drop the duplicated card set (wrap by resetting
   `scrollLeft`); `content-visibility: auto` with `contain-intrinsic-size` on each `li`. Cheapen the
   card: remove the no-op `filter`, replace `backdrop-blur` on badges and buttons with the solid
   `bg-ink/80` they already carry (invisible on a 36 px control over a photo). Gate: `to:highlands`
   max under 34 ms in the headed run, both flings under 34 ms, and the round-38 keyboard rules still
   hold (a focused card is visible; `scripts/verify-focus-paint.mjs`).
4. **The footer.** Trace it the same way (`--css="footer{visibility:hidden}"` proved it), find the
   fill, and fix it. Gate: `fling:down` max under 34 ms.
5. Then re-run the whole ledger at 390 (`--phone`) and with `--throttle=4`, and record the numbers
   here. The owner's other machine is a MacBook; the raster budget is what carries there.

### 2.4a Measured after (builder, 2026-09-23; branch head `c3664ae`, four commits `d40e9b0`,
`04f588a`, `2018ca0`, `c3664ae`)

Same instrument, same machine (RTX 2060, ANGLE D3D11, 144 Hz), the same wheel and flings. One
thing the method did not say in §2.1 and turned out to decide half the numbers: **every run
launches a fresh Chrome profile, so its GPU shader cache is empty and every Skia and ANGLE
pipeline the page needs is compiled during the run.** A `--persist=DIR` mode of the probe copy
(`scripts/_scratch-r55b-lag.mjs`) keeps the profile, and the second run on it is "warm", which
is what the owner's Chrome is except right after a Chrome or driver update. Both columns are
below; the cold column is the one §2.3 measured.

1440x900, worst frame in ms (over34 in brackets where it matters), before = `a6d8408`, after = head:

| phase | before, cold | before, warm | after, cold | after, warm |
|---|---|---|---|---|
| boot: the frame that receives the clouds (2.0 s) | 235 (the link stall) | 104 | 7 to 28 across 6 runs | 21 |
| boot over100 / long-task ms | 1 to 2 / 414 to 493 | 1 / 173 | 0 to 1 / 89 to 274 | 0 / 208 |
| to:highlands (the featured rail) | 76 to 90 [4] | 20.8 [0] | 41.5 to 56 [2 to 4] | 20.8 and 14 [0] |
| to:harbour | 14 | 13.8 | 35 to 49 [1] | 13.8 |
| fling:up | 90 to 111 | 27.9 | 42 to 63 [1 to 2] | 14 |
| fling:down (the footer) | 76 to 90 | 13.9 | **13.9** [0] | 13.9 |

The boot's `over100` after is the page's own hydration when it is 1 (first `Layout` of ~1,400
boxes 50 to 86 ms plus two `EvaluateScript` of ~38 ms and `RunMicrotasks` ~35 ms, unchanged in
content across every run; the worst single rAF gap there varies 63 to 167 ms with how those
tasks fall between frames). The scene's own frames from `night:start` on are 7 ms except the
frame the first dust piece is uploaded in (14 to 28) and three.js's 44 ms module evaluation,
which was there before.

390x844 `--phone` (DPR 3, touch), worst frame: before cold / warm, after cold / warm:
boot scene phase 201 / 83 (the link), 7 / 7; to:highlands 34.8 / 7.2, 34.7 / 14; to:harbour
20.9 / 20.8, 41.6 / 13.8; fling:up 7.2 / 7.2, 14 / 7.2; fling:down 76.2 / 13.9, 13.9 / 14.

1440 `--throttle=4` (one cold run each; noisy, the boot alone has 24 to 36 frames over 34):
before boot 458 max (over100 9), to:highlands 104 then 62.6 (p50 13.9 / 27.7), to:harbour 41.6,
flings 55.6 / 62.5; after boot 417 (over100 7), to:highlands 104 then 125 (p50 20.9 / 20.9),
to:harbour 48.6, flings 76.3 / 62.5. **Not better under a 4x CPU**: there the rail's entry is
main-thread bound, and the profile of the unthrottled run puts ~150 ms of React rendering into
the 342 ms window of `to:highlands` (present before and after; §2.4b), plus `content-visibility`
now lays the cards out during the scroll-in instead of at load.

What each item did, with the attribution after it:
1. `compileAsync` against stand-in geometries the moment the materials exist, then the uniform
   locations fetched off-frame. The 141 ms link and the ~14 ms introspection left the first
   frame; `night:programs` is marked ~110 ms after `night:start`, 1.3 s before the terrain.
2. The light math (`buildLightBundle`) runs in the worker, the dust goes up in 160k-grain
   pieces one per frame. No `HandlePostMessage` over 12 ms in the profiled run; the first
   render is 14 to 28 ms (one 5.8 MB piece plus VAO setup); `night:terrain` to `night:lights` is
   76 ms of the worker's wall time (was 61 ms of the main thread's).
3. The rail scrolls instead of translating, its cards skip paint out of view, the badges and
   heart lose their backdrop blur on night pages and the develop animation fills backwards.
   Cold: FillRectOp x66 to 70 per flush (was x180 to x576), one op of ~20 ms in a 23 ms flush,
   i.e. a pipeline compile; a 3 px gradient in a rounded box pre-rastered at load did not remove
   it, so it is not the scrim's gradient alone. Warm: 20.8 and 14 ms.
4. The footer's stall was `StrokeTessellateOp` x4, one of 79 to 80 ms: Skia's hardware-
   tessellation stroke pipeline compiling for Chrome's native textarea resize grip (short
   diagonal stroked lines). Removing every SVG stroke on the page changed nothing; `resize:
   none` dropped the fling to 41.8. `.nocturne textarea::-webkit-resizer` now carries a filled
   two-capsule glyph (Blink paints that box instead of the platform lines; dragging still
   resizes), and the three stroked data-URI glyphs are filled paths too. 13.9 ms cold.

### 2.4b Seen on the way, not fixed (outside the brief)

- **The section-change stalls of §2.3 were cold-cache compiles.** On a warm profile the baseline
  already had the rail at 20.8 ms, the footer at 13.9 and both flings under 28, so on the
  owner's warm Chrome those two stalls did not exist as measured; the boot stall (104 ms warm)
  did. What he sees as "lag when a section changes" on his machine is therefore not yet
  explained by the probe, and its cold profile is a measuring artefact to keep in mind
  (`--persist`, two runs).
- **React renders ~150 ms during the rail's scroll-in** (profile: `uv`/`ug` in the React chunk,
  `window.scrollY` forcing layout for 11 ms, `page-*.js:622` 14 ms), against nothing of the
  kind at `to:dutchess`. Something re-renders as the featured section arrives; on a 4x CPU this
  is what holds the rail at 20 ms a frame. Worth a profile with source maps.
- The heart on night cards is now the badges' ink/80 solid, slightly lighter and more opaque
  than ink/55 with blur (frames in `scripts/_scratch-r55/rail-{before,after}-*.png`); one line
  (`night:bg-ink/55`) restores the old tone if that is preferred.
- With scripting off the rail no longer moves (it is a 16-card scroller); a CSS-only drift was
  the promoted layer this round removed.

## 3. The map: what it can honestly become

The owner's words leave two bars: "as realistic as possible", "3D if we go close", and "if it's
not full 3D, this type of minimalistic map and the lights and the transitions is amazing". Any change
must be BETTER than round 54, not merely more 3D, and must degrade to today's scene with no WebGL,
reduced motion and JavaScript off.

### 3.1 Where the lights are today, and why the cities do not read

`/api/lights` packs 15,649 active homes (304 towns), every one a measured address (the geocode
runner has cleared the zip-centroid fallback; `packLights` drops the rest). So the lights ARE where
the homes are. What they are not is where the cities are: the picture is the for-sale inventory,
so Queens burns with 5,741 lights while Manhattan (370) is nearly dark and the Bronx and Staten
Island barely exist, and the Hudson Valley towns read as scattered sparks with no town glow around
them. That is the mismatch the owner sees.

### 3.2 Options, with sources

| option | what it gives | licence and cost | verdict |
|---|---|---|---|
| **A. A real night-lights underlay** under our lights: NOAA/EOG **VIIRS Nighttime Lights** annual composite, cropped to the served region and resampled to the terrain grid (200 m), drawn as the town glow (the haze layer's job today, but true) | the cities and the roads glow exactly where they are, at their real brightness; Manhattan blazes, the Catskills stay black; listings stay warm points on top | "available under Creative Commons Attribution 4.0 International license. Please cite EOG as the data source" (https://eogdata.mines.edu/products/vnl/, fetched 2026-09-22). One committed asset like `valley-elevation.webp`; zero runtime calls; a credit line in the footer next to the terrain credit | **do this first.** It is the direct answer to "focus the light where the actual cities are" and it costs nothing at runtime |
| **B. Real building volumes for the close shots**: NYC Open Data **Building Footprints** (`height_roof`, `ground_elevation`, `construction_year` per building; attribution "Office of Technology and Innovation (OTI)"; https://data.cityofnewyork.us/api/views/5zhs-2jue.json, fetched 2026-09-22), simplified and tiled offline into a compact asset, extruded as faint prisms that catch the lights | "3D when we go close" over the five boroughs, on brand (black ground, silver edges) | city-published open data; the terms-of-use page blocks scripted reads (403) and must be read by hand in a browser before shipping and cited here. Hudson Valley towns would need OpenStreetMap (ODbL: "credit OpenStreetMap and its contributors", https://www.openstreetmap.org/copyright) | **prototype in `/lab/night` after A**, frames side by side; ship only if it beats round 54 |
| **C. Google "3D Maps in Maps JavaScript"** (photorealistic 3D, `Map3DElement`) | photogrammetry of the real city | SKU "Immersive Maps", category Pro, billable event: map load, **5,000 free loads a month, then $7.00 per 1,000** (pricing page and SKU table, fetched 2026-09-22); styling limited to "visibility and styling of basemap points of interest (POIs) and roads"; custom markers, popovers, polylines, glTF models; needs a key on the page and Google attribution | **not for the home page.** It replaces the approved look (a black valley of light) with satellite photography that cannot be restyled, and puts a metered vendor call on every visit. Worth a later "see it in 3D" button on a listing page, if he wants it |
| D. Mapbox / Cesium ion | photorealistic tiles | paid per request, attribution rules | not evaluated further; same verdict as C |

Recommendation: A now, B as the "3D when close" prototype, C never on the home page.

### 3.3 Realism moves that cost nothing (builder phase 2, with A)

- Roads as the faint filaments they are at night: OSM primary/secondary roads for the region as
  thin lines, brightness from VIIRS. (ODbL credit.)
- The water darker than the land and the land darker than the lights (already), plus the
  shoreline grain fix the handoff names (`kindLow[3]`, Ulster and Orange chapters).
- Altitude-true camera: the light points already sit on the terrain; the underlay must be
  draped on the same grid so the glow follows the valley floor.

## 4. Interactivity: the shortlist to show him with frames

From the handoff's seeds (§4.3) plus his ask. Ranked by wow per effort, all optional layers that
degrade cleanly:
1. **Hover a listing card, its light rises a thin beam** in the scene (the spec's original idea).
2. **Open a listing: the camera flies to that home**; back flies out (a real page transition).
3. **Drag to orbit** in the hero (mouse), gyroscope tilt on a phone (opt-in, reduced motion off).
4. **Click-to-fly on the area index**, and the lantern naming neighbourhoods as well as towns.
5. **"New today" lights switching on** when the page opens (data already carries listing dates).
6. A compass or mini-map so the visitor always knows where they are over the region.
No sound.

## 5. Phases (one Fable subagent this session; the orchestrator re-verifies each with the probes)

1. **Lag** (§2.4 items 1 to 5), gates as written, commit per item, numbers into this document.
2. **The night-lights underlay (A)** with the asset script, credit line and tests; re-render every
   shot and the poster; frames side by side with round 54 before and after.
3. **Interactions 1 and 2** from §4, then 4.
4. **The 3D-when-close prototype (B)** in `/lab/night` only, frames for the owner.
5. Fresh-eyes walkthrough (handoff §4.4) and the full gate ledger (handoff §6).

## 6. The contact change (done by the orchestrator this session)

- `lib/site.ts`: phone `(914) 875-2424`, `tel:+19148752424`, `+19148752424`; new `infoEmail`
  `info@realtylt.com`. Every surface that reads `SITE.phone` follows: header, footer, /connect,
  sign-in modal, thank-you, portal, listing pages, wizard, 404, llms.txt, JSON-LD.
- Hardcoded copies replaced: `public/rlt-chat.js` (two error strings), `content/blog/posts.ts`
  (placeholder draft), `scripts/email-templates.mjs` (historical, the CRM owns the templates),
  `docs/accounts/OWNER-RUNBOOK.md`.
- Header: `info@realtylt.com` beside the phone, same sm-and-up rule.
- **Delivery proven**: a message sent from levan@realtylt.com to info@realtylt.com at 02:08 UTC
  2026-09-23 (subject "RealtyLT info@ forwarding test RLT-0922-A7") arrived in the levan@ inbox as
  the same thread, labelled INBOX. So info@ delivers to him.
- Not changed on purpose: the footer, thank-you and privacy pages still show `levan@realtylt.com`
  as the email; he asked for info@ in the header only. One line in the report asks whether he wants
  info@ everywhere.

## 7. Do not go backwards

The ledger is `docs/handoff/WEBSITE-R55-HANDOFF.md` §6 and binds every phase: tsc clean, vitest
1621 and up, LCP / CLS / overflow / focus / tap / contrast numbers, no-JS, no-WebGL, reduced motion,
day pages byte-identical, rounds 53 and 54's behaviour fixes, the safety rules (no MLS call on a
page path, `/api/lead` aborted in probes, CSP/auth/RLS untouched, no vendor URL visible).
