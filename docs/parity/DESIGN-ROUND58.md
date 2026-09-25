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

## 4. What was built

(filled in as the round proceeds)

## 5. Measured

(filled in as the round proceeds)
