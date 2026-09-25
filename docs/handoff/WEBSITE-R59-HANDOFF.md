# Website round 59 handoff (written 2026-09-25 at the close of round 58)

Read this first, then `docs/parity/DESIGN-ROUND58.md` (§7 his sixth verdict verbatim with the
causes, §3 the plates' decisions, §4 what was built, §5 what was measured). The `/website` command
text is stale (a round-11 brief); this file and the memory's NEXT WEBSITE SESSION block carry the
live order. The process he named for round 59: **a Fable orchestrator, Opus builders one at a time
(`model: "opus"`, each to ~700k tokens, never closed early), the orchestrator re-verifying every
builder's work on the running build before the next starts.**

## 0. START HERE: his sixth verdict (2026-09-25) and the round 59 program

He approved the loading and the plates as the ground. Three asks, in the order he gave them, each
a builder's round; the causes are in the record §7.

**Builder 1: the lights, yellow like a light.** `components/home/g3d/glyph.ts` only. The core
takes the light's own warmth (start from the halo's 255, 212, 158; whitish-yellow, never a
saturated yellow), the halo becomes a whisper at 5 to 10 percent (alpha 0.05 to 0.10, about 1.5
to 2 core radii) or goes; the lit and featured glyphs follow; the cover script's numbers are the
same file. Compare by frames at the territory and Queens at 1440 and 390 (the round 58 sheet:
`scripts/_scratch-r58-sheet.mjs`; `?halo=` and a new `?core=` if it helps him compare), then
re-render nothing (the lights are live). Tests: glyph.test.ts's colour and reach truths.

**Builder 2: the county plates with definition.** Two things at once, because they are one
picture: (a) a PLATE STYLE in `components/home/ml/style.ts` (a `plate: true` option, used only by
the renderer's `?plate=` path): every road class drawn at the county zooms (minor and service at
a readable alpha, no fade-in ladder), residential and commercial land a shade up, buildings from
zoom 12, water bodies and parks, the shore and streams as now; (b) the eleven county cameras in
`components/home/ml/shots.ts` brought down to 8 to 10 km on each signature place (`SIGNATURE` in
`g3d/cameras.ts`; round 57.11 stood at 6 to 9 km on Google's map), the three valley chapters
likely with them, the territory and the tail untouched. Then `node scripts/make-plates.mjs`
(shoot, encode), the grade table re-judged (a denser plate may need less lift), the contact
sheets, and HIS TEST: each county stop with `?towns=0` and the county's name covered must still
say which place it is (Poughkeepsie's bridges and river bend, Kingston's Rondout, Newburgh's
waterfront, Carmel's lakes, Nyack under the bridge, New Rochelle on the Sound). Measure the bytes
per plate (250 to 400 KB at 2880 is acceptable, lazy) and re-run the calibration probe
(`scripts/_scratch-r58-calib.mjs` must print 0.00 px: a camera change is safe only with the
matrix re-recorded, which the script does). The live map's own style stays as it is (its ladder
is for streaming).

**Builder 3: the flight as a film (the transition that moves).** The recommendation, with the
alternatives so the orchestrator can decide with him:

- **Recommended: recorded flights.** For each adjacent pair on the ladder (hero to dutchess ...
  harbour to region: 16 forward, 16 back), record the live map's own flight ONCE at the screen's
  density (a Playwright screencast or CDP frame capture of `?ground=ml` flying from A to B, 30 or
  60 fps, both aspects), encode as a short muted clip (WebM VP9 with an MP4 H.264 fallback, about
  1.6 to 2.6 s, target 300 to 600 KB at 1440), and record the camera's pixel matrix PER FRAME
  (the same `_pixelMatrix3D` the plates carry, 16 numbers a frame, a few KB a clip). At playback
  the clip sits between the two plates: plate A fades to the clip's first frame (identical by
  construction), the clip plays, plate B is under its last frame; our lights are drawn live on
  the clip from the matrix of the frame at `video.currentTime` (exact, as on the plates). The next
  and previous clips decode ahead like the plates. The fade over of round 58 stays for the
  non-adjacent jumps (a county row's hover, a featured card's focus) and for reduced motion. Cost:
  32 clips, roughly 12 to 20 MB in `public/flights/`, none loaded until its plate is near; the
  renderer grows a `flights` stage; the controller grows a video layer and a per-frame projector.
  Risks to measure: autoplay (muted, inline: allowed everywhere), the phone's decode, the sync
  between the clip's frame and the lights (aim under one frame), the join at each end (the diff
  between the clip's first frame and plate A must be under 3 levels, as the cover's was).
- **Alternative: intermediate plates.** Three to five extra pictures along each adjacent flight,
  played with the round 58 fade over and a scale toward the next (a flip book). Cheaper to build,
  but the motion is stepped and 50 to 80 more pictures weigh as much as the clips.
- **Alternative: the live map for flights only.** Bring `maplibre` back at the first scroll, fly
  it between plates and swap to the plate on landing. It is the motion he liked, but every flight
  streams tiles again (the very wait he rejected in his fifth verdict), 292 KB of library returns,
  and the picture differs by line and machine. Only if the film fails.

Order: builders 1 and 2 first (they change what every picture and light look like, and the
clips must be recorded from the final style and cameras), builder 3 last. The orchestrator's gates
after each: tsc, vitest (2147, only up), the calibration probe, the frames at all stops both
widths, the cold boot (`_scratch-r58-boot.mjs`), the transition frames and trace
(`_scratch-r58-transition.mjs`, `_scratch-r58-trace.mjs`), hover 50 of 50, contrast, overflow,
reduced motion, JS off, and a LOOK at every frame. Nothing pushed without his go.

## 1. What round 58 did (one session, working directly, no builders)

His fifth verdict (`DESIGN-ROUND57.md` §11): the first image terrible, seconds place to place, some
areas not good, the lights' glow too big, the two links not buttons. All five, in order:

1. **The lights** (`cbc1be2`): the halo half round 57.8's (3 to 4 px), the neighbourhood glow off
   (`?glow=0.12` and `?halo=` compare on any build).
2. **The two links under the search** (`f9f491b`): 40 px boxed controls in the search box's glass.
3. **The cover** (`4f9227e`): 2x at quality 82 (247 / 80 KB), its dissolve to the live map a mean
   2.1 / 2.6 levels. Insurance only: the plates replaced it.
4. **THE PLATES** (`8069212`, then `19f0412` and the graded re-encode): the home page's ground is
   seventeen pictures of our own MapLibre night map, one per shot per aspect, rendered ONCE at the
   screen's density by `scripts/make-plates.mjs` with the map's 3D pixel matrix recorded beside
   each, our lights drawn live on every plate by that matrix (measured 0.00 px against the live
   map), a fade over with a settle between plates and then stillness, the territory plate
   server-rendered and preloaded as the first screen, the next and previous plates decoded ahead.
   No map library, no tile, no terrain PNG, no third host on the visitor's page. The live map
   stays as the plates' renderer and behind `NEXT_PUBLIC_HOME_MAP=ml` (or `?ground=ml`).
5. **"Some areas don't look that good"**: a per-plate grade (the valley plates and chapters a 0.85
   curve; contact sheets `docs/design-r58/plates-{wide,tall}.jpg`).

Numbers (the record §5): every in-flight frame under 28 ms at 1440 and 21 on the phone through a
walk of all 20 stops; a Chrome trace of the walk: 0 main-thread events over 25 ms; cold at 1440:
the plate's bytes in at 86 to 271 ms, LCP 356 ms, the plate on (after hydration) 732 ms, the
lights drawn 788 ms, 1.84 MB in all; the phone 813 / 936 ms, 1.49 MB; Slow 4G: the plate and the
lights at 9.2 s (the live map's whole was 13 to 15 s). Hover 50 of 50; reduced motion one 400 ms
fade; JS off the plate stands; contrast 0 under the floor at 390; overflow 0 at seven windows;
tsc clean; vitest 2147.

## 2. Where everything is

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53`, about 215 commits
  over `main`, **NOTHING pushed** (a push deploys the private noindex site; his go).
- The plates: `components/home/plates/` (`plate-frame.ts` the arithmetic, `plate-motion.ts` the
  transition's rules, `plate-controller.ts` the engine, `plates.gen.ts` the GENERATED manifest:
  never edit it, re-run the script), `public/plates/` (136 files), `scripts/make-plates.mjs`
  (shoot, encode, RENDER and GRADE tables, `--only`, `--aspect`, `--render`, `--raw`).
- The ground: `components/home/ml/MlGround.tsx` drives either engine through `ml/engine.ts`;
  `lib/home-map.ts` picks the ground (`plates` default, `ml`, `g3d` with a key, `night`).
- Probes (gitignored): `scripts/_scratch-r58-*.mjs` (calib, transition, trace, boot, console,
  reduced, nojs, widths, cta, sheet, diff, avifq, grade) and round 13's `_scratch-r57l-*` (frames,
  hover, contrast, overflow, behave, see). Frames under `scripts/_scratch-r57/58/`.

## 3. How to run

ONE server on the shared `.next`: the production preview on :3102 (PowerShell: stop the listener,
`npx next build` with `NODE_OPTIONS=--use-system-ca`, then `Start-Process node
node_modules\next\dist\bin\next start -p 3102` with `RLT_LAB=1`); never a dev server beside it.
Foreground gates: `npx tsc --noEmit`, `npx vitest run` (2147, only up). Explicit git pathspecs
(`git add <new files>` first: a pathspec commit does not take untracked files); never `git add -A`;
no `.env`; never push; CSP untouched except with a measured reason; never write TypeScript through
a bash heredoc; in git-bash never `cd` away from the worktree inside a probe command (the shell's
cwd persists and a parallel command then ran from the wrong directory).

**To re-render the plates** (a style change, a camera change, a new shot): the server up, then
`node scripts/make-plates.mjs --stage=shoot` (all 34, ~2 min, headed Chrome), look at
`scripts/_scratch-r57/58/plates/raw/`, then `--stage=encode` (~3 min; writes public/plates, the
manifest and the contact sheets), then `node scripts/_scratch-r58-calib.mjs` (must print 0.00 px),
tsc, vitest, rebuild, look. A shot's camera lives in `components/home/ml/shots.ts`; a per-plate
tone in the script's GRADE; a per-plate render override in RENDER (the runtime lifts the homes by
the plate's own recorded exaggeration, so an override is safe).

## 4. His actions

1. **His look**: `http://127.0.0.1:3102/` cold (the first screen), a scroll top to bottom, a hover
   over Queens' lights and a click, the county rows, the phone (390). `?ground=ml` shows the live
   map for comparison on the same build; `?glow=0.12&halo=2` shows round 57's lights.
2. If the look passes: the push to `main` deploys the private noindex site (his word); the Maps key
   on Vercel matters only for `/search` and the listing pages.
3. The stale `/website` command text (auto mode refuses my edit): prepend "read the memory's NEXT
   WEBSITE SESSION block and its handoff first".
4. The MacBook look (2x: the 2880 plates).

## 5. Open, in the order a visitor would notice

- The page's own weight on a slow line: the HTML (368 KB) and the script (378 KB) gate the plate's
  reveal at 9 s on Slow 4G though its bytes are in far earlier; a lighter first bundle is the lever.
- A tablet in portrait (768 x 1024) takes the tall plate cropped (looked at, acceptable); a third
  aspect would serve it exactly.
- The lights sentence is visible from the server render and true about a second later for a JS
  visitor (the lights fade in); the claims discipline hides it with JS off.
- LCP is the paragraph, not the plate (Chrome excludes a full-viewport image); fine, but a Core Web
  Vitals reader should know.
- The featured card's focus lands on the closest plate that holds the home; if none holds it with
  48 px of room nothing moves (no such featured home today).
- Carried from round 57: the blog template's alt text and stock covers; the five missing seller
  articles; the 320 tap label overlap; OpenFreeMap's continuity (the renderer's source, not the
  visitor's page any more).

## 6. Rules that bind (unchanged)

Black ground, white type, warm-white lights the only warmth, no gradients, no new hues, radii
8/12/16/24, body 16 px plus on mobile, tap 24 px plus, focus 3:1 plus, reduced motion clean, JS off
works (the plate), day pages byte-identical, no em dashes in visitor copy, no MLS Grid or
media.mlsgrid.com call anywhere, probes block `/api/media/` and `/api/lead` by CDP. Launch stays
gated: the owner clears `NEXT_PUBLIC_SITE_URL`, points the apex, then removes `PRELAUNCH=1`.
