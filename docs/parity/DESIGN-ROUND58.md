# Design round 58: the plates (2026-09-25)

The record of the round the owner ordered at the close of round 57 (`docs/parity/DESIGN-ROUND57.md`
§11, his fifth verdict verbatim; the handoff `docs/handoff/WEBSITE-R58-HANDOFF.md` §10). One
session, working directly, no builders.

## 1. The brief, in his words and in numbers

> "The first image is terrible ... when it goes place to place, it needs a couple of seconds to
> load, and then some areas don't look that good ... Maybe we could just generate pictures, or take
> pictures ... and load that with our geocoding on the specific areas ... every zoom takes time to
> zoom in and give proper graphics ... the lights of the listings: a round yellow and the
> brightness around it is too big; it should be half, or even less, if not nothing at all ... Below
> the search there's 'Sell with us' and 'What's your home worth': that should be a small box."

Five items, in his order of pain: the first image; the seconds on every flight; the areas that do
not look good; the lights' glow; the two links. The first three have one cause: a live tile map
draws every picture at the moment it is looked at, from tiles it has to fetch, with one style for
every camera. The answer he names is the answer: pictures made once, our lights drawn on them.

## 2. The three small things, done first (verified on the running preview)

1. **The lights** (`components/home/g3d/glyph.ts`, commit `cbc1be2`). The halo is half round
   57.8's radius at every anchor (3 to 4 px, from 6 to 8) and the neighbourhood glow is off by
   default (its strength 0, its radius 0 with it, so a light's reach is its halo). The core is
   unchanged: the point was never the complaint. `?glow=0.12` shows round 57.8's glow and the new
   `?halo=` scales the halo, so three treatments compared on one build
   (`scripts/_scratch-r57/58/glow/sheet-*.png`): the old is the tan blanket he named; the halved
   halo reads as clean white points on the black; 0.7 of it adds nothing. Tests 2123 to 2125.
2. **The two links** (`app/page.tsx`, `f9f491b`): 40 px boxes in the search box's own glass, 12 px
   radius, a hairline in line-strong, 15 px semibold, black at 45 percent with the blur, the border
   and fill answering a hover, the site's ring answering the keyboard, no arrow. Measured: 210 x 40
   and 116 x 40, 12 px apart, one row at 390, two at 320, overflow 0 at 1440 / 390 / 320.
3. **The cover** (`scripts/make-ml-cover.mjs`, `4f9227e`): 2850 x 1800 at webp quality 82 (247 KB)
   and 780 x 1688 (80 KB), from the running map with the new lights; the dissolve to the live map a
   mean 2.1 levels at 1440 and 2.6 at 390 with the names hidden. This cover is the insurance: the
   plates below replace it with the territory plate itself.

## 3. The plates: the decisions

**What a plate is.** One picture per shot per aspect, rendered ONCE from our own MapLibre night
map (OpenStreetMap data, the AWS terrain, our style) at a fixed camera, at the screen's density,
delivered as AVIF with a WebP fallback at two widths each. Seventeen shots (the territory, the
three chapters, the eleven counties, the harbour, the tail) times two aspects (the laptop's
1440 x 900 and the phone's 390 x 844) = 34 pictures. **A plate carries no lights.** Our lights
are drawn live on top by the plate's own projection: at render time the map's pixel matrix for
that camera is recorded (`maplibre-gl`'s `transform._pixelMatrix3D`, the same matrix the live
layer read every frame in round 57.13), so a home lands on the plate exactly where the map would
have drawn it. The listings stay hourly-fresh, hover, tap and click stay as they are, and the
picture is the same on every machine at every visit.

**Why not bake the lights in.** A baked picture goes stale within the hour (round 57.10 measured
the cover drifting from its live lights as listings changed), cannot be hovered, and would draw
every visitor's screen the same lights whatever the window. Live lights over a fixed picture are
exact by construction and cost one canvas draw per landing.

**Why the live map leaves the page.** With plates, nothing needs a tile: the page never pans or
zooms on its own, the click's fly-in is a push into the picture, and a featured card's focus
shows the home on its county's plate. The MapLibre engine stays in the repository as the plates'
RENDERER (the script drives the same page with `?plate=<shot>`) and behind `NEXT_PUBLIC_HOME_MAP=ml`
for comparison; the visitor's page loads no library (292 KB gone), no tiles, no terrain PNGs, and
asks no third host. The CSP keeps its two hosts untouched (a removal is a measured change for a
later round).

**The transition: a fade-over with a settle, not a slideshow.** The incoming plate is laid on
top and fades in over 900 ms (ease-in-out) while it settles from 1.04 to 1.00 (ease-out, 1.1 s);
the outgoing plate holds at full strength underneath and pushes forward a little (1.00 to 1.02)
as it is covered. A fade OVER, not a cross-fade: two dark pictures cross-faded over black dip to
their product mid-way (in·k + out·(1-k)²); laid over, the frame is always in·k + out·(1-k), one
continuous picture. Each plate's lights sit on its own canvas inside its own layer, so the lights
fade with their picture. After the landing NOTHING moves: no long Ken Burns drift, which would
walk the county names and the hover label off their places, wake the main thread for the length
of every hold, and read as a screensaver. The motion is the transition, then stillness; the
lights are what is alive. Reduced motion: the fade alone, no scale. A hover during a transition
is refused as it is during a flight today.

**Rapid targets (the county list).** A new target during a transition is queued; the running fade
is brought to its end within 250 ms and the queued one starts from a whole picture. Never a snap
inside a fade, never two half-pictures.

**The first screen.** The territory plate is server-rendered in the first layer (`<picture>`,
AVIF then WebP, the tall or the wide by the 1024 px breakpoint, `fetchpriority="high"`, preloaded
with the document). It IS the cover: there is no dissolve any more and no wait for a map. The
lights arrive when the listings do (one 134 KB fetch, cached an hour) and fade in over the
picture; the elevation (63 KB) follows and lifts them onto the terrain. With JavaScript off the
plate stands alone, so the sentence "Every light on the map is one of them" leaves the page there
(`<noscript><style>`), as the claims discipline of round 57.5 asks.

**Loading the rest.** The next stop's plate (and the previous) is decoded as soon as the visitor
is within one stop of it, and the first chapter's right after the page is idle, so a scroll never
finds a plate missing. If one is asked for before it has decoded, the current picture holds and
the transition starts the moment it lands: nothing loads on screen, ever.

**Sizes.** Wide: 2880 x 1800 (2x) and 1440 x 900 (1x), `sizes="100vw"`, so a 1x Windows laptop
takes the 1440 and a MacBook or a 1920 screen the 2880. Tall: 1170 x 2532 (3x, the phones of the
last five years) and 780 x 1688 (2x). One camera per aspect: the projection is in the render's
css pixels and serves every density. The visitor's window rarely matches the plate's aspect
exactly: the plate is shown `object-fit: cover` and the projection is composed with the same cover
transform (scale = max(vw / W, vh / H), centred), so a light stays on its street on a 1920 x 1080
or a 1366 x 768 window alike. Tablets in portrait (768 x 1024) get the tall plate cropped hard;
left open, measured below.

**Per-plate tuning.** The complaint "some areas don't look that good" was the live style at those
cameras. A plate is one picture: it is rendered with per-shot overrides where the shared style
falls short and graded afterwards with sharp (levels, a gentle curve) where the eye asks, and the
contact sheet of all 34 is kept in this record's folder. Generated imagery (the Higgsfield and
ElevenLabs connectors) may dress a plate's atmosphere, never its geography: the lights are at
real addresses and need a plate rendered from map data under them.

**Measured before it is called done** (§5): total page weight cold, LCP and the first fifteen
seconds at 1440 and 390 (the territory plate sharp at the page's own first paint), the frames of
every transition on the ladder at both widths, the calibration of the projection against the
render (a light drawn by the live map and by the plate for the same home, same pixel), hover 50
of 50 and taps 30 of 30, contrast under the words, overflow at five widths, reduced motion, JS
off, and the day pages byte-identical.

## 4. What was built (2026-09-25, one session, working directly)

**The renderer** (`scripts/make-plates.mjs`). Two stages. `shoot` drives the running site's home
page pinned on one shot (`?plate=<shot>`, added to `MlGround.tsx`; `?pr=` sets the map's pixel
ratio; `?ground=ml` asks a plates page for the live map), everything but the map hidden, no
lights, no cover, waits for every tile of the shot, photographs the map's box and records the
camera, the map's 3D pixel matrix and its world size (raw PNG + JSON, gitignored). `encode`
grades each raw picture with a per-shot curve, writes AVIF and WebP at the render's density and
the one below (public/plates/, 136 files), generates the manifest
`components/home/plates/plates.gen.ts` and the contact sheets `docs/design-r58/plates-*.jpg`.
All 34 shot in 1 m 57 s; the encode about 3 minutes.

**The engine** (`components/home/plates/`). `plate-frame.ts` (pure, tested): which aspect a window
shows (the page's 1024 px breakpoint), the `object-fit: cover` fit, the projector (the recorded
matrix, then the fit), the range the window sees. `plate-motion.ts` (pure, tested): the fade over,
the queue, the hurry, the settle's curve, the neighbours to warm. `plate-controller.ts`: two
layers, each a picture with its own light canvas; the Web Animations for the fade (opacity), the
settle (scale 1.04 to 1, ease-out) and the push (1 to 1.02); the decode-ahead cache; the click's
fly-in as a scale about the home; a featured card's focus on the closest plate that holds the
home with 48 px of room. `ml/engine.ts`: the surface both engines offer the ground; `MlController`
implements it too, so `MlGround.tsx` drives either (the plates by default, `lib/home-map.ts`).

**The page.** The first layer is server-rendered with the territory (`<picture>`: AVIF then WebP,
tall or wide by media query, `sizes="100vw"`, `fetchpriority="high"`), preloaded with the
document together with the lights' fetch; no map library, no tile host, no terrain PNG. With JS
off the plate stands under the same shade the cover carried and the lights sentence leaves the
page (`<noscript><style>`). The footer's credit names the same sources (the plates are pictures of
that map). The elevation loads after the lights.

**The grade.** The valley counties and the chapters over the valley take a 0.85 curve (the
moonlit relief and the roads come up, the water stays black, the lights stay the brightest thing;
0.72 turned the land a flat grey), Westchester county, Staten Island and the tail 0.9, the
territory, the boroughs and the harbour as rendered (dense with hairlines; the approved black of
the first screen). Taller terrain (exag 2.4, 3.2) and a finer DEM were compared on Ulster and
Putnam and changed the relief only a little; the shared style stands. AVIF at quality 55
(4:4:4), measured against the raw render of the territory: 189 KB at 2880 wide, a mean 1.9
levels apart, p95 5 (the WebP fallback at 82: 229 KB, 2.0, 6).

**Not done, on purpose.** The live map's CSP hosts stay (a removal is its own measured change).
No long hold drift. No third aspect for tablets (a 768 x 1024 window takes the tall plate
cropped; looked at, acceptable, noted). No generated imagery: none of the 34 plates needed
dressing once graded.

## 5. Measured (the running production build on this PC, headed Chrome; probes gitignored under `scripts/_scratch-r58-*`)

**The projection is exact.** `_scratch-r58-calib.mjs`: every drawn light's position on the plates
against the live map for the same homes at the same shot, 1440: hero 443 common lights, Queens
754, Dutchess 328, Putnam 117: mean 0.00 px, p95 0.00, max 0.00. (The first cut stood 7.50 px
off at every shot: the fit used `window.innerWidth`, which counts the scrollbar; the picture is
fitted to the layer's box, which does not. The fit reads the box now.)

**Nothing loads on a flight, and the frames say so.** `_scratch-r58-transition.mjs`, a walk
through all 20 stops with a rAF logger: 1440: 4,315 frames, p50 6.9 ms, p95 7.1, p99 7.1; 15
flights, the worst in-flight frame 27.8 ms, no in-flight frame over 34; the phone: p50 6.9, the
worst in-flight 20.8. Two long frames outside any flight (97 and 49 ms at 1440, 49 and 35 on the
phone) sit exactly at the probe's instant scroll jumps; `_scratch-r58-trace.mjs` (a Chrome trace
of the same walk) finds 0 main-thread events of 25 ms or more, 209 image decodes totalling 230 ms
off the main thread, the longest GC 10 ms: the jumps are the page's own raster of a new screen of
content, the same on any ground (round 55 measured it on the night flight). The light layer's
draw: mean 1.0 ms, max 5.2, 19 to 26 draws over the walk (it draws on landings and hovers, not
per frame).

**The cold first visit** (`_scratch-r58-boot.mjs`, three runs, medians). 1440 at 2x: the plate's
bytes in at 86 to 271 ms, LCP 356 ms (the paragraph: Chrome does not count a full-viewport image
as an LCP candidate), the plate on (the engine's reveal, after hydration) 732 ms, the lights
drawn 788 ms, 1.84 MB in all (JS 378 KB, HTML 368, elevation 366, plates 228, fonts 153, lights
131, images 134). The phone at 3x: reveal 813 ms, lights 936, LCP 360, 1.49 MB (the 1170 wide
plate, 123 KB). Slow 4G: the plate on at 9.2 s and the lights with it (before the lights
preload: 8.6 and 11.5 s); the live map's whole was 13 to 15 s. The remaining lever is the page's
own weight (its HTML and script), as the round-57 handoff said.

**Behaviour.** Hover over Queens (`_scratch-r57l-hover.mjs`): 50 of 50 pointer positions named
the nearest light, hit test 0.017 ms mean; the click flew in and routed (817 ms). County row
hover flew to Queens in 922 ms with its towns named; the row's click navigated; a featured card's
focus lit its home and opened its label on the plate that holds it (`_scratch-r57l-behave.mjs`).
Reduced motion: one 400 ms opacity fade, no scale, landed at 450 ms (`_scratch-r58-reduced.mjs`).
JS off at 1440 and 390: the plate decoded and shown, the shade over the words, the lights
sentence gone, the pointing claim hidden (`_scratch-r58-nojs.mjs`).

**Words and widths.** Contrast under the words at every stop, both widths (`_scratch-r57l-contrast.mjs`):
0 under the floor at 390; at 1440 the same two header pills the kit misreads since round 57
("AI", "Connect"; not the ground's). Overflow 0 at 1440 / 390 / 320 and at 768 x 1024, 1024 x 768,
1366 x 768, 1920 x 1080, each with its plate fitted and its lights on it (315 to 763 drawn).

**Gates.** `tsc` clean; vitest 2123 to 2147 (147 to 151 files): the glyph's new truth, the
plate frame, the motion, the manifest (both aspects of every shot, a 16-number matrix that puts
the camera's centre within 1.5 px of the plate's middle, every file present), the ground's
default.

## 6. The close (2026-09-25)

Commits, in order: `cbc1be2` the lights; `f9f491b` the boxed links; `4f9227e` the cover at 2x;
`4010d6b` this record's first three sections; `8069212` the plates (the engine, the renderer, the
manifest, 136 pictures); `19f0412` the lights preloaded and the elevation after them; the graded
re-encode; this close. Branch `design/futuristic-r53`, nothing pushed: **his look comes first**
(`docs/handoff/WEBSITE-R59-HANDOFF.md` §4), then his go for the push, which deploys the private
noindex site.

What he should look at, in this order: the first screen cold at :3102 (the territory plate with
the lights arriving), a scroll top to bottom (every transition a fade over with a settle, no wait
anywhere), the county rows under "Where we work" (the plates by hover), a hover over Queens' lights
and a click (the push in, then the listing), the phone at 390; `?ground=ml` beside it for the live
map on the same build, `?glow=0.12&halo=2` for round 57's lights.

Left open, honestly (the handoff §5): the page's own weight on a slow line; a third aspect for
tablets; the lights sentence visible from the server render for the second before the lights
arrive; LCP being the paragraph; the carried items from round 57.

## 7. The owner's sixth verdict (2026-09-25, verbatim) and the next session's direction

> "It definitely looks better now; on the loading, it loads faster. But when you switch the dots to
> just white it kind of lost its brightness or vision on the city. Maybe make that yellow dots just
> yellow, like a light, but don't give brightness around it, maybe just a little bit, like five,
> ten percent, nothing more, or just a yellow dot. And also transitions: it was a smoother
> transition before, in a way that it would move the map and go to that county where you are, but
> now it just disappears and appears close to that one. Can we still do the transition? And also,
> yeah, the map is definitely better loading at the moment, but the upper regions, the counties
> such as Putnam and all of that, it just doesn't have any definition, and if there is no name you
> might even not know which county it is. For example when you stand on Dutchess you don't see the
> city or any buildings or street lines or anything, just highway lines and the river. And we need
> it really, really good, high definition map, in a way that if you see it, even if there is no name
> of Poughkeepsie or some other city, you would understand which city it is. A really, really good
> high definition that is not loading too long. Prepare a handoff and I'll clear this chat and
> start the new one. We need the same work type: Fable orchestrator, Opus builders."

**What he approved.** The loading. The plates as the ground stand.

**Three asks, with their causes.**

1. **The lights read white and the city lost its glow.** Round 58 kept the core warm white
   (255, 248, 236: `glyph.ts` CORE_RGB) and cut the halo to 3 to 4 px at 0.46; on the black plate
   the warmth was in the halo, so the point now reads as white. He wants a YELLOW dot, "like a
   light", with at most a 5 to 10 percent brightness round it, or none. The fix is in one file:
   the core takes the light's own warmth (the halo's 255, 212, 158 or a touch deeper), the halo
   goes to a whisper (alpha 0.05 to 0.10, about 1.5 to 2 core radii) or away, compared by frames
   at the territory and Queens on both widths; the galaxy's rule holds (whitish-yellow, never a
   saturated yellow; [[feedback-galaxy-gold-whitish-not-yellow]]).
2. **The transition no longer moves the map.** Round 58 replaced the live map's flight (a
   continuous camera move, 1.6 to 2.6 s, tiles arriving through it) with a fade over between two
   plates. He liked the move. The options and their costs are in the round 59 handoff §0; the
   recommendation is THE FLIGHT AS A FILM: each adjacent flight on the ladder recorded once from
   the live map at the screen's density (16 forward, 16 back) with the camera's pixel matrix
   recorded PER FRAME, played as a short muted clip between the two plates while our lights are
   drawn live on it from the frame's matrix (exact, as on the plates), the fade over kept for the
   non-adjacent jumps (a county row's hover) and for reduced motion. Nothing loads at the moment
   of the move (the next clip is decoded ahead like the next plate); the pictures never depend on
   the visitor's line.
3. **No definition in the counties.** The plates are 2880 x 1800 and 1170 x 2532: the pixels are
   there; what is missing is CONTENT. `components/home/ml/style.ts` draws minor roads from zoom 12
   at alpha 0.16 fading in over a zoom, tertiary from 10 at 0.2, buildings from 13: a ladder tuned
   so the LIVE map streamed few tiles. The county plates sit at zoom 12.1 to 12.6 (12 to 16 km),
   where the street grid is all but invisible and a town is two highway lines and the river. A
   plate is rendered once, so it can afford everything: a PLATE STYLE with the whole street grid
   drawn at the county cameras (minor and service roads at a readable alpha, tertiary and
   secondary brighter), residential and commercial land a shade up so a town reads as a place,
   buildings from zoom 12, parks and water bodies, and the county cameras brought down to 8 to 10
   km on their signature place (round 57.11's Google cameras were 6 to 9 km) so Poughkeepsie's grid,
   its bridges and its river bend are recognisable with no name. The test is his sentence: a stop
   with its names hidden (`?towns=0`, the county name covered) must still say which place it is.
   The cost is bytes per plate (more lines, bigger AVIF: measure; 250 to 400 KB at 2880 is
   acceptable for a lazy plate) and nothing else.

**Process he named:** a Fable orchestrator with Opus builders, one at a time, the orchestrator
verifying on the running build (the calibration probe at 0.00 px is the gate for any change to a
plate or its camera; the frames, the trace, the cold boot, the contact sheet).
