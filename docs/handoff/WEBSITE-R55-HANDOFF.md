# Handoff: website round 55 — Fable orchestrates, Opus builds (2026-09-22)

Read this first. It supersedes `docs/handoff/WEBSITE-R53-HANDOFF.md` and the `/website` command's
built-in brief (which is a stale round-11 text). Round 54 is built, local only, on this branch.

## 1. The owner's verdict on round 54 and his order for round 55 (2026-09-22, verbatim)

> "I definitely like the design, is definitely better, and this is what I wanted, and it's kind of on
> the level of our AI page, but it definitely needs multiple more rounds for polishing everything,
> because some transitions lag, and I think map could be better, maybe we could find a 3D type of map
> on New York that we could copy if it would be easier and then add those stars or lights or something
> and maybe make it a little bit more interactive as well and transitions are good but some lag so we
> need to update that as well. And brainstorm, what else could we add to make it even better? I
> definitely like this idea and it's really good. But if it would be like full 3D, that would be great
> and amazing. But if it's not, this type of minimalistic map and the lights and the transitions to the
> areas is amazing. And, but I think you could do way better, especially with Fable and Opus now. So
> start, map it out, do heavy and good things with Fable and then let Opus build and check their work,
> correct them. [Don't] go backwards or degrade."

So, for round 55:
1. **The direction is APPROVED.** The night flight, the minimalist map, the lights, the area
   transitions: keep them. Do not restart the concept. Do not regress anything (§6).
2. **Fix the lag in the transitions.** His words, seen in HIS browser (§4.1).
3. **Make the map better, ideally FULL 3D.** His idea: find an existing 3D map of New York we can
   build on rather than invent one, then put our lights/stars on it (§4.2).
4. **More interactive** (§4.3 has the brainstorm to start from; he asked for more ideas).
5. **Many more polish rounds.** Fable maps out the work and gates it; Opus subagents build; Fable
   re-verifies and corrects them.

## 2. Process for this session (his instruction)

- **Fable is the main agent**: brainstorm, scope, plan, adversarially gate, and re-verify every
  subagent claim against the running app (gates re-run in the FOREGROUND, frames looked at, flows
  driven). **Opus 5 subagents build** (`model: "opus"` on every Agent call — omitting it inherits
  Fable).
- **ONE subagent at a time on this box** ([[feedback-subagent-budget-workflow]]): parallel agents
  freeze this PC. Each subagent works long (roughly 500-700k tokens): build -> render -> look ->
  measure -> polish, and reports with numbers and frame paths.
- Subagents must be told: foreground everything (background waits end their loop early), explicit
  git pathspecs, never push, never touch `main`, never `next build` against a `.next` someone is
  serving, and **delete any repo mirror they make outside the worktree — two were left behind in
  round 54 with copies of `.env.local`** (the orchestrator deleted them).
- Round 54's own pattern worked and is worth repeating: orchestrator drives the production build
  himself, writes a defect list from what he SEES, and hands that list to the next builder.

## 3. Where everything is

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53`, 20 round-54 commits
  on top of `main` (`784dea6`). **Nothing is pushed. `main` and realtylt.com are untouched.**
  A push to `main` deploys the live site, so it needs his explicit, fresh go.
- **Preview**: a production build is being served on **:3102** (`npx next start -p 3102` from the
  worktree). A `next build` while it runs breaks it — stop it first (`Get-NetTCPConnection -LocalPort
  3102 -State Listen | %{ Stop-Process -Id $_.OwningProcess -Force }`), then rebuild and restart.
  Dev server for editing: `RLT_LAB=1 npx next dev -p 3101` (the lab route 404s without `RLT_LAB=1`;
  keep its log OUTSIDE the repo). Never :3100 (the main tree's).
- **Videos he has already seen**: `docs/design-r54-video/{home,search}-{desktop,phone}.mp4`
  (untracked).
- **The design record**: `docs/parity/DESIGN-ROUND54.md` (concept, shot table, section-by-section
  spec). The palette is in `app/globals.css` (`.nocturne`).
- **The scene**: `components/home/night/` — `world.ts` (lng/lat/elevation -> km world space, x east,
  z south, y up, `EXAGGERATION = 6`), `elevation.ts` (decode + bilinear sample + water), `dust.ts`
  (contour dust + fill), `lights.ts` (listing lights, haze, town centroids, county raster),
  `shots.ts` (shot data, `framingFor`, `blendFramings`, `FLIGHT`, `AREA_FLIGHT`), `shaders.ts`
  (dust/lights/haze/depth; veil, quiet windows, lantern, altitude ramp), `scene.ts` (renderer, loop,
  DPR caps, pause rules, adaptive governor, town picking, the imperative handle),
  `build.worker.ts`, `NightScene.tsx` (React shell, dynamic three import, WebGL fallback),
  `NightGround.tsx` (the fixed canvas + poster + quiet measuring), `driver.ts` (pure scroll ->
  shot/veil mapping, tested), `AreaChapter.tsx`, `areas.ts`, `NightLab.tsx` + `app/lab/night/page.tsx`.
- **The scene handle** (what the page drives it with): `setSequence(names, s)`, `flyTo(name, ms)`,
  `setShot(name, {immediate})`, `setVeil(0..1)`, `setQuiet(rects)` (up to FOUR boxes),
  `setFocus(countySlug|null)`, `setPointer/clearPointer`, `hoveredTown()`, `stats()`, `introEndsAt()`.
- **The terrain asset**: `public/geo/valley-elevation.webp` (281 KB, 652x1050 at 200 m) built by
  `scripts/build-elevation.mjs` from AWS Terrain Tiles (zoom 11; USGS 3DEP/SRTM/GMTED + NOAA ETOPO1,
  public domain) with water from USGS NHD polygons. Licences and required credits are recorded in
  `public/images/ATTRIBUTIONS.md`; the footer carries the credit line (`components/site/SceneCredit.tsx`).
  Lesson worth keeping: the joerd zoom table lies about which source a tile carries — read each tile's
  `x-amz-meta-x-imagery-sources` header ([[terrain-elevation-asset-lessons]]).
- **Probes** (gitignored, copy before reusing): `scripts/_scratch-r54c-verify.mjs` (the orchestrator's:
  home at 1440/390/320 + reduced motion + no-JS, writes JSON + frames), `_scratch-r54-video.mjs` and
  `-video2.mjs` (the owner's walkthrough videos), `_scratch-r54s-flows.mjs` (35 search flows),
  `_scratch-r54d-*` (builder 3's contrast/state kit), `_scratch-r54b-*`, `_scratch-r53-live-flows.mjs`.

## 4. The work for round 55

### 4.1 The lag he sees (highest priority — it is his own experience of the page)

**HE LOCATED IT (asked directly, 2026-09-22): "right after the page loads" and "when a section
changes", plus "it needs more smoother transition maybe better map too, overall everything should be
upgraded and polished multiple times".** That is two specific places, not general slowness:
- **Right after load**: the worker builds the terrain clouds (~1 s, measured), the poster dissolves into
  the live scene (1,100 ms), and the intro runs the lights on. Any of those can read as a stutter on a
  cold load. Measure time-to-first-smooth-frame on HIS machine, and consider building the clouds in two
  passes (a coarse one that can fly immediately, refined after) so the first flight never waits.
- **When a section changes**: the hand-off between shots. Suspects, in order: the camera's spring
  damping re-targeting when `setSequence`'s index crosses an anchor; the veil and quiet boxes being
  recomputed at the boundary (a forced layout read per frame); long flights (hero -> dutchess is a big
  jump) arriving too fast at the end of their arc; and the area chapter, where `flyTo` and the scroll
  driver can both be steering at once. Trace a real section change frame by frame before changing code.

What we measured in round 54 does NOT show it: headless Chromium with ANGLE D3D11 on the RTX 2060
gave scroll-frame p95 **16.8 ms** at 1440 and at 390 with 4x CPU throttle, 0 frames over 34 ms. So the
lag is either (a) somewhere our probe does not look, or (b) specific to HIS machine and browser.
Investigate in this order, and MEASURE, do not guess:
1. **Drive it in HIS Chrome**, not headless — his profile, his extensions (AVG), his GPU settings, real
   scrolling with a wheel and a trackpad. The `claude-in-chrome` MCP tools can do this. `chrome://gpu`
   tells you whether his Chrome is on the GPU at all; if it is on SwiftShader, everything below is moot
   and THAT is the finding.
2. **The camera's spring damping** (`scene.ts`, ~0.16 s follow on `setSequence`) is a deliberate lag: the
   camera arrives after the scroll. That reads as "smooth" to one person and "laggy" to another. Try a
   shorter time constant, and a scroll-velocity-aware one (tight while scrolling, soft when stopping).
3. **The veil/quiet recomputation** runs on scroll (rAF-throttled) and re-measures layout boxes; a forced
   reflow per frame would show as jank on a slower machine. Profile it.
4. **The worker build** (~1 s) and the poster dissolve at the start: on his machine the first seconds may
   be the "lag" he means. Measure time-to-first-flight on a cold load.
5. Check a 60 Hz vs 120 Hz display, and `prefers-reduced-motion` off/on.
Deliver: a measured cause, a fix, and a before/after frame-time trace from a real browser.

### 4.2 A better map, ideally full 3D (his main idea)

He asked whether we can "find a 3D type of map on New York that we could copy" and put our lights on it.
Options to evaluate on licence, cost, weight and looks BEFORE building (cite sources, do not reason from
memory — [[feedback-vendor-claims-need-citations]]):
- **NYC Open Data building footprints** (~1.1 M buildings with `heightroof`, city-published): free,
  extrudable into real 3D city blocks for the five boroughs. Heavy raw, but it can be simplified and
  tiled offline into a compact committed asset, the way the terrain was. This is the strongest
  candidate for "full 3D New York" without a vendor bill.
- **OpenStreetMap building footprints** (ODbL) for the Hudson Valley towns: free, attribution and
  share-alike obligations apply to derived data — read the terms before shipping.
- **Google Photorealistic 3D Tiles** / Mapbox 3D / Cesium ion: real photogrammetry, but paid per
  request, need a key on a page request path, and carry attribution rules. Weigh against the MLS/vendor
  rule that the brand is RealtyLT and no vendor URL appears to a visitor.
- Keep the fallback honest: whatever we add must degrade to today's scene on a phone, with reduced
  motion, with no WebGL and with JavaScript off.
His words also leave the door open: "if it's not [full 3D], this type of minimalistic map and the
lights and the transitions to the areas is amazing" — so the bar is that any 3D city must be BETTER
than what we have, not merely more 3D. Prototype it in `/lab/night` and put frames side by side before
integrating.

### 4.3 More interactive, and "what else could we add" (brainstorm seeds, not decisions)

Start the brainstorm from these, then bring him a shortlist with frames:
- Drag to orbit the territory in the hero; pinch/tilt on a phone (gyroscope) as an optional layer.
- Hovering a listing card lights that home's point in the scene and rises a thin beam (the spec's
  original idea, never built).
- Opening a listing flies the camera to that home; coming back flies out (a real transition between
  pages, not a cut).
- Saved searches drawn as their own constellation on /saved; "new today" lights switching on.
- Price or days-on-market expressed as the light's height or colour temperature (careful: warm white
  only, and every glow needs a source).
- Weather/season/time-of-day: the same territory at dusk vs deep night, or snow on the Catskills.
- The lantern naming neighbourhoods as well as towns, and a click-to-fly on the area index.
- A compass or mini-map so the visitor always knows where they are over the region.
- Sound is a "no" unless he asks (the /ai page has a mute button for a reason).

### 4.4 The fresh-eyes check that did NOT happen

Round 55 must still run it (round 54's checker was stopped by the owner before it reported): drive both
pages at 1440/390/320 as a visitor, tab everything, check the seams between home and /search, the
states nobody looks at (slow network, failed `/api/lights`, failed elevation asset, failed map, empty,
error, 320px, 200% zoom, reduced motion, no-JS), read every word of copy, and diff the day pages.
Two known-weak items it was asked to judge: the **Ulster and Orange area chapters still read
land-heavy** (traced to the shoreline grain's close-range gain, `kindLow[3] = 2.4` in `shaders.ts`,
which is global — changing it needs every chapter re-rendered to prove nothing got worse), and a bright
shoreline can run under a row's name in the area index and read as an accidental underline
(`scripts/_scratch-r54e/w1440-4-62.png`, under "Queens").

## 5. Two decisions waiting on the owner

1. **The lights are warm gold.** It is the only colour on the page besides the logo and the
   photographs. He asked for black and white; the gold is defensible (a city at night, and /ai's own
   gold), but he has not answered. Render an A/B before asking again.
2. **The chat launcher** covers a listing card's save heart at 390 (about one scroll position in five)
   and Google's "report a map error" link at 1440. It behaves the same on every day page, it is his
   shipped widget, and it keeps its brand blue. Moving it is a site-wide change, so it is his call.
   (Related: `body:has(.nocturne) .rlt-bubble { background: var(--color-porchlight) }` in globals.css
   is inert — the variable resolves on `<body>`, outside the scope — so the bubble stays day azure.
   Accidentally correct; clean it up deliberately one day.)

## 6. DO NOT GO BACKWARDS — the ledger round 55 must not break

Gates (run in the FOREGROUND; background runs lie):
- `npx tsc --noEmit` clean; `npx vitest run` **1621 passing** and only ever up. 117+ test files.
- Production build numbers to hold or beat: home **LCP 144-364 ms** at 1440 (the LCP element is text),
  **528-704 ms** at 390 with 4x CPU; **CLS 0.0002** at 1440, **0** at 390; scroll frames **p95 16.8 ms**
  at both. /search: LCP 100 ms at 1440 with maps blocked, CLS 0.0002; the map's own tiles are the LCP
  when maps are allowed (1976 ms, improved from 2360).
- **No horizontal overflow** at 1440, 768, 640, 390 or 320. Focus rings ≥3:1 (white, 18.16:1 today),
  tap targets ≥24 px, every phone control ≥16 px, text contrast ≥4.5:1 measured against the REAL pixels
  behind it (the scene moves — sample several scroll stops).
- **Works with JavaScript off** (the poster carries the hero, both rails render, the search form is a
  plain GET; /search still shows its documented "Search needs JavaScript" page), **works with no WebGL**,
  and **reduced motion** cuts instead of flying.
- **Day pages stay byte-identical** (`/buying`, `/selling`, `/who-we-are`, `/financing`, `/home-value`,
  `/connect`, `/plan`, `/reviews`, a listing page, `/blog`): render before/after at 1440 and 390 and diff.
- Round 53's behaviour fixes all still work: pre-hydration typing kept in the search box, the parallel
  suggest index with a cold retry, suggested town counts equal to the page's own counts, exact-city
  picks, Recent/Saved rows re-running their search, map popups kept inside the map.
- Round 54's own: the results row reads the ANSWER's scope (not the question in flight), the phone list
  does not follow the map until the visitor moves it (`components/search/map-follow.ts`), the listing
  card's focus ring lives on the card (the card is `overflow-hidden`, which clips a descendant's
  outline), the sign-in modal carries the night scope itself (it mounts outside the page wrapper).
- **Safety, absolute**: never add an MLS Grid or `media.mlsgrid.com` call to a page or request path; in
  probes block `**/api/media/**` unless a shot needs photos and keep those runs small; always abort
  `/api/lead` (it posts to the LIVE CRM); never touch `next.config.ts` CSP, auth or RLS; never commit
  secrets; no vendor names or non-realtylt.com URLs visible to a visitor.

## 7. Launch is still gated (do not trip it)

The site is `noindex` on purpose. Before it goes live the owner must, in this order: clear
`NEXT_PUBLIC_SITE_URL` in Vercel, point the realtylt.com apex here, then remove `PRELAUNCH=1`. Never
remove the noindex, and never push `main` without his fresh go.
