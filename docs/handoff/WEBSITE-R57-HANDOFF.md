# Handoff: website round 57 — the real map becomes the home page, and it must be finished

Written 2026-09-23 at the close of round 56. Read this first; it supersedes
`WEBSITE-R56-HANDOFF.md` (keep §2 "the unexplained lag on HIS machine" and §4 "decisions waiting
on the owner" there; `WEBSITE-R55-HANDOFF.md` §3 "where everything is" and §6 "the ledger" still
bind). The design records are `docs/parity/DESIGN-ROUND56.md` (the pivot: his verdict, the facts
with sources, §7 phase 1 measured, §8 phase 1b measured) and `DESIGN-ROUND55.md` §7 (the ledger).

## 1. The owner's verdict on round 56, verbatim (2026-09-23)

> "It's getting better, but it's still not what I want. Also, when you look at it from the main
> homepage, how it starts, it's kind of not clear of the area; if you know, you'll figure it out,
> but it's not visibly understood that it's New York's five boroughs and Westchester and up. Maybe
> you could show everything from higher: those five boroughs and Westchester and those areas that
> we cover. The map has to be more realistic; now it's kind of switched to more lights. The idea
> that you have where it shows the addresses and you could click and it takes you to that listing,
> that's great, but it needs more polishing and work. Similar work: Fable orchestrator and Opus 5.5
> builders, do around five agents, work on it, and at the end the orchestrator finishes it up and
> polishes the last round, and let's see how it goes after that."

Read as orders:
1. **The direction is confirmed**: a real 3D map with our address lights, click to the listing.
2. **The opening shot must show the territory**: from higher, the five boroughs, Westchester and
   the Hudson Valley counties all in frame, so a stranger reads where this is without knowing.
3. **More realistic**: the map is the picture; the lights sit on it, calm and few at altitude.
4. **Polish the address-light interaction** until it is finished.
5. **Process**: Fable orchestrates; about five Opus 5.5 builder rounds, ONE at a time on this box
   (parallel agents freeze the PC); then the orchestrator's own final polish round; then his look.

## 2. Where everything is (state at the close of round 56)

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53`, **81 commits over
  `main` (`784dea6`), NOTHING pushed, `main` and realtylt.com untouched.** A push to `main` deploys
  the live site and needs his fresh go.
- **Preview**: `npx next start -p 3102` from the worktree with `RLT_LAB=1` serves the production
  build; the home page is still the night flight (round 55, with its lamp carpet); the real map is
  at **`/lab/g3d`**. Stop the listener before any `next build`
  (`Get-NetTCPConnection -LocalPort 3102 -State Listen | %{ Stop-Process -Id $_.OwningProcess -Force }`),
  build with `cmd /c "npx next build > <log outside the repo> 2>&1"` (~60 s), restart with
  `Start-Process cmd.exe -ArgumentList "/c npx next start -p 3102" ... -NoNewWindow` and
  `$env:RLT_LAB='1'`. Dev on :3101 only, never alongside :3102 (shared `.next`; if the cache
  corrupts, delete `.next` and rebuild). Never :3100.
- **The real map's code**: `components/home/g3d/` — `controller.ts` (the map element, the steady
  tracking, the marker jobs at 25 a frame, the pre-warm walk, hover projection), `G3dGround.tsx`
  (the fixed ground, the poster cover, the scrims, the logo-corner mask, the scroll driver reusing
  `components/home/night/driver.ts`), `cameras.ts` (the six section cameras and the eleven county
  cameras, the `LADDER` rule), `camera.ts` (projection maths, tested), `thinning.ts` (the per-shot
  and per-pixel ceilings over `components/idx/pin-thinning.ts`), `gate.ts` (the steady gate, OFF by
  default), `glyph.ts`, `G3dAreaChapter.tsx`; the lab page `app/lab/g3d/page.tsx` (the home page's
  sections copied as they are, with the corrected copy). Lab query flags: `?homes=0`,
  `?warm=0|lite|full|fly`, `?warmBudget=`, `?gate=1`, `?flight=2600,3200`.
- **Facts about Google's 3D map on this version (3.66)**, all measured, in `DESIGN-ROUND56.md` §3
  and §7: `libraries=maps3d`, `Map3DElement`, HYBRID mode; the steady event is `gmp-steadychange
  {isSteady}`; `gestureHandling` and modes are UPPER-CASE enums; `defaultUIHidden:true` keeps the
  Google logo; `fov` is vertical and animates in `flyCameraTo`; `Marker3DElement` + SVG in a
  `<template>`, `collisionBehavior:"REQUIRED"` keeps Google's place names; markers have NO hover
  event and Tab cannot reach them (hover = our projection + 14 px hit test; focus = the featured
  cards fly the map); 1,500 markers at once = a 547 ms task, so 25 per frame; `qualityMode` does
  nothing; the loader `callback` must exist BEFORE the async script tag.
- **CSP**: `connect-src` carries exactly `keyhole-pa.googleapis.com`, `mw1.gstatic.com`,
  `www.gstatic.com` (commit `deda59b`, measured blank map first; test in `lib/chat-csp.test.ts`).
  Nothing else in `next.config.ts` changes without a measured reason.
- **Policy and cost** (sources in `DESIGN-ROUND56.md` §3): the "Google Maps" attribution stays
  visible and unobscured (the logo-corner mask exists for that); no screenshot of the map is ever
  stored (the load cover is OUR night still); Immersive Maps SKU: 5,000 free loads a month, then
  $7 per 1,000; one load per page view (verified: one element, one script).
- **Instruments** (gitignored `scripts/_scratch-*`; copy before editing):
  `_scratch-r56b-lag.mjs` (headed Chrome on the real GPU, `--persist=DIR` for a warm profile,
  `--phone`, every `flyCameraTo` logged as its own window, marker adds/removes against
  `gmp-steadychange`, poster timing), `_scratch-r56b-table.mjs` (the tables),
  `_scratch-r56b-contrast.mjs` (the round-54 kit on the real map pixels at 18 stops, logo-hole texts
  reported separately), `_scratch-r56-g3d-test.mjs` (a static page on :3199 with the key, the
  first proof), `_scratch-r54c-verify.mjs` (1440/390/320/reduced/no-JS), `_scratch-r55b-lag.mjs`
  (the night flight's probe). Frames: `scripts/_scratch-r56/g3d/lab1b/` (18 stops, both widths),
  `lab/{scrim,veil}/` (the two looks of phase 1). Videos (untracked):
  `docs/design-r56-video/lab1b-{desktop,phone}.mp4`.
- **Gates at the close**: tsc clean; vitest **1720 passing**; the night-flight home page still
  passes the round-55 ledger (day pages 0-pixel, verify probe clean).

## 3. What round 56 measured that round 57 must not forget

- **On a laptop, Google's map hitches 40 to 90 ms during every camera flight** (10 to 20 frames
  over 34 ms per flight at 144 Hz), with or without our markers; **on a phone the whole scroll is
  clean (35 ms worst)**. Pre-warming every shot, a steady gate, longer flights and a gentler ladder
  each changed nothing on the laptop; pre-warming one shot removes the cold first flight's 300 ms
  stall and is on by default (1.5 s budget). The owner has not chosen among hybrid / stills /
  accept; he said "getting better", so the flying map stands, but the hitch is a standing risk
  against "no freezing" and must be measured on HIS machine (his MacBook; the Chrome extension
  was never connected).
- **Time to the map**: first steady frame 6 to 7 s at 1440, 4.5 to 6.6 s at 390; our poster
  covers it from first paint (0.8 to 1.2 s) and leaves ~9.6 s warm with the one-shot pre-warm.
  The dissolve from our NIGHT still into a DAYLIGHT satellite map is a hard change of look.
- **Contrast** on the real pixels: 0 texts under the floor at 390 outside the logo corner, 2 at
  1440 that are the kit reading the AI/Connect pill borders.
- **The scrims** read as soft shadows but still as a darker column behind the words.
- **The ladder pulled the shots back** (Dutchess 60 km, harbour 30 km, tail 60 km): the page no
  longer has a close shot. He now asks for the OPENING shot to be even higher and wider.

## 4. The five builder rounds (Opus 5.5, `model:"opus"`, one at a time), then the orchestrator's

Each round: read this file, `DESIGN-ROUND56.md`, the code above; build; render frames at every
stop at 1440 and 390 and LOOK; run the lag probe cold and warm at both widths and the contrast
kit; tests only up; commit per concern with numbers; report with frame paths; the orchestrator
re-runs every probe and looks at the frames before the next round starts.

1. **The territory shot and the integration.** (a) The opening camera shows the WHOLE covered
   area at once: the five boroughs, Westchester, Rockland, Putnam, Orange, Dutchess, Ulster, from
   high enough that the coastline, the Sound, the Hudson and the Catskills all read, with our own
   quiet labels for the areas we cover where Google's are too small at that altitude (our type,
   the county and borough names, placed by projection, fading as the camera descends), so a
   stranger reads "New York City and the Hudson Valley" without knowing. Frames at 1440 and 390
   first; the owner's sentence is the bar. (b) Then the real map becomes the HOME PAGE behind
   `NEXT_PUBLIC_HOME_MAP=g3d` (default on when the key is present): the night flight and its
   round-55 carpet leave the home path (the night scene stays only as the fallback for no key,
   `gmp-error`, no WebGL, reduced motion = cut, JS off = the poster); the lab-only route rule in
   `lib/site.ts` / `Header.tsx` goes; the copy is the lab's honest copy; day pages stay
   byte-identical (render before/after); `/search` untouched.
2. **More realistic: the map is the picture.** Fewer and calmer lights at altitude (a lower
   ceiling and a smaller glyph at the territory shot; the count grows only as the camera comes
   down), the imagery vivid (scrims only where words are, tone tuned by frames), a cloud map style
   (one map ID, "3D Hybrid", light mode) that thins Google's POI clutter near our words (the owner
   creates the map ID in the Cloud console if the builder cannot; say so in the report), and a
   decision on the load cover: a dusk-toned still that meets the daylight map without a jolt, OR
   the page's top made day-consistent; frames of both, the owner chooses.
3. **The address lights, finished.** The hover label designed (town, price, beds and baths if
   cheap, our type, never covering the light), the light's brighten on hover and on the featured
   card's focus, the click to the listing with a short fly-in before the route change where the
   map is steady (skip it when it is not), the phone's tap-then-open, keyboard reach for at least
   the featured homes, and the county chapters from the list; all measured for frame cost.
4. **The hitch, again, on his terms.** Measure on HIS machine (connect the Chrome extension, or
   his MacBook), then choose with numbers: keep flying (phones are clean), or the hybrid (our night
   flight moves, Google's map holds still in the county and harbour shots), or stills. Build the
   chosen one behind a flag so the other stays one switch away.
5. **The fresh-eyes walkthrough, at last**, on the real-map build: every page at 1440, 390 and
   320, tab everything, the seams between home and /search, slow network, failed `/api/lights`,
   failed map, empty, error, 200% zoom, reduced motion, no-JS, no key; every word of copy; the
   ledger gates re-run and written into the record.

**Then the orchestrator's own final polish round** (the owner's explicit ask): drive the built
page as a visitor on a laptop and a phone, fix what makes him hesitate, re-run every gate, cut the
two videos, write the record and this handoff's successor, and only then show him.

## 5. Rules that bind every round (each one cost a session)

- ONE builder at a time; `model:"opus"`; the orchestrator re-verifies every claim on the running
  app before the next round. Foreground gates: `npx tsc --noEmit`, `npx vitest run` (1720, only
  up). Explicit git pathspecs, never `git add -A`; never push; never touch `main`; no repo copies
  outside the worktree; no `.env` files; the Maps key never printed or committed.
- git-bash: `export NODE_OPTIONS='--use-system-ca'`; `MSYS_NO_PATHCONV=1` for `/path` values; the
  bash tool's rtk wrapper eats `npx next start`, so servers and builds run from PowerShell.
- Safety: no MLS Grid or `media.mlsgrid.com` call anywhere; probes block `/api/media/` and abort
  `/api/lead`; never loosen CSP, auth or RLS; the Google attribution never covered; no vendor URL
  visible beyond Google's own attribution.
- Design: black ground, white type, warm-white lights; no gradient text/buttons, no new hues,
  radii 8/12/16/24, body 16px+ on mobile, tap targets 24px+, focus-visible 3:1+, reduced motion
  clean, works with JS off (the poster), day pages byte-identical.
- Screenshot and LOOK; "it compiles" is not verification; a headless p95 hides a 100 ms frame
  (use the headed probe, cold and warm).

## 6. Decisions still waiting on the owner (carried)

The laptop hitch (round 4 above decides with numbers); night-to-day at the dissolve (round 2
shows both); the listing lights' colour (warm white on the real map, gold in the night fallback);
the chat launcher covering a save heart at 390; `info@realtylt.com` in the header only.

## 7. Launch is still gated

The site is `noindex` on purpose. The owner clears `NEXT_PUBLIC_SITE_URL`, points the apex, then
removes `PRELAUNCH=1`, in that order. Never push `main` without his fresh go; a push deploys.
