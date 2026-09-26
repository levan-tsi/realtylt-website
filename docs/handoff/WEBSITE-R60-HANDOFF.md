# Website round 60 handoff (written 2026-09-25 at the close of round 59; state updated 2026-09-25 evening)

## STATE AT 2026-09-25 EVENING (read this before §0 if you are picking the session up)

- **UPDATE 22:30: ROUND 60 IS CLOSED AND DEPLOYED.** Builder 5 finished (`2bcd899` to `8804a61`), the
  orchestrator's gate passed on a rebuild from HEAD (vitest 2236, the crawler, the light scan, the
  dialogs, the contrast walker, JS off, calibration 0.00 px, hover 50 of 50), `8804a61` was pushed
  to `main` at 22:25:59 and verified LIVE at realtylt.com (`docs/parity/DESIGN-ROUND60.md` §3).
  **The next session is the MAP ROUND: `docs/handoff/WEBSITE-R61-MAP-ROUND-BRIEF.md`.** The
  paragraphs below describe the state before that push and stay for the record.
- **22:40: BUILDER 6 (Opus) STARTED on the map round's §1, THE FIRST SECOND** (the bundle map, the splits, the lights' first draw, the rise, the HTML), from `docs/handoff/WEBSITE-R61-MAP-ROUND-BRIEF.md`; its record goes to `docs/parity/DESIGN-ROUND61.md` §1. If this session ended: verify its commits with the round 58/59 gate set on a rebuild from HEAD (boot, see, calibration 0.00 px, the walk, hover alone, reduced motion, JS off, the crawler, the light scan), look at the see frames, then push and probe live.

- **LIVE**: `c07889f` on `main` at realtylt.com (public): round 59 (yellow lights, county plates,
  the film), the lights fetched once, the map credit at its legal minimum (five seconds, then the
  (i); phones the (i) only; nothing in the footer). Verified live with a browser probe.
- **THE DARK SITE (round 60), his order "we're making it dark"**: builder 4 DONE and verified
  (`79c0c35` to `bf0bdc8` + `ea8085b`: the root is `.nocturne`, `color-scheme: dark`, /search's
  filters are pills and the Bed list is dark, the chat launcher navy, every Call label carries the
  number; vitest 2218). **Builder 5 was RUNNING when this was written** (an Opus agent on the rest:
  the chat PANEL dark, which the owner repeated as a must, every dialog and overlay, /portal, the
  blog's light scenes, /auth/reset, the old /listing route, the listing card's own ground, dead day
  markup, one weight per heading). Its record is "§2 The rest of the dark site" in
  `docs/parity/DESIGN-ROUND60.md`; its commits are on the branch after `ea8085b`.
- **WHAT TO DO WHEN BUILDER 5 IS DONE (or if it never reported): verify, then push.** On a rebuild
  from HEAD (PowerShell: stop the :3102 listener, `npx next build`, `Start-Process node ... next
  start -p 3102` with `RLT_LAB=1`): `npx tsc --noEmit`; `npx vitest run` (2218 or more, 0 failed);
  `node scripts/qa-crawl.mjs http://127.0.0.1:3102` ALL PASS; `node scripts/_scratch-r60-light.mjs`
  (every hit a white primary button with dark text, nothing else; also with the dialogs open);
  `node scripts/_scratch-r60-contrast.mjs` (0 of ours under the floor at 1440 and 390);
  `node scripts/_scratch-r60-nojs.mjs`; `node scripts/_scratch-r58-calib.mjs --shots=hero,queens`
  (0.00 px); `node scripts/_scratch-r57l-hover.mjs` ALONE (50 of 50); the chat panel opened in a
  headed Chrome at 1440 and 390 and LOOKED at; the sheets under `docs/design-r60/` looked at. Then
  `git push origin HEAD:main` (a public deploy; the owner said "deploy yourself once all the pages are
  in dark mode and everything works properly and white background is not covering text"), then the
  live probe `node scripts/_scratch-r59-live.mjs --base=https://realtylt.com` (expect the two
  noindex checks to FAIL, correctly: the site is indexable) and `scripts/_scratch-r59-challenge.mjs`.
- **THEN the map round**: `docs/handoff/WEBSITE-R61-MAP-ROUND-BRIEF.md` (the first second, the light
  density, the parks and water tints for his decision, the carried items).
- **Vercel**: no firewall config, no password; Vercel's own bot mitigation challenges non-browser
  fetches (429); real browsers get 200. Runtime errors in the deploy's first hours: one DB timeout on
  one listing page's area insights, one media ECONNRESET (a long-standing class); no 5xx cluster.
- The owner's Fable quota was at 99 percent when this was written: the next session may run on
  Opus; everything needed is in this file, `POLISH_CHECKPOINT.md`, `docs/parity/DESIGN-ROUND60.md`
  and the memory (`~/realtylt-claude-config/memory/MEMORY.md`, the NEXT WEBSITE SESSION block).

Read this first, then `docs/parity/DESIGN-ROUND59.md` (§1 the lights, §2 the county plates, §3 the
film, §4 the orchestrator's close). The `/website` command text is stale (a round-11 brief); this
file and the memory's NEXT WEBSITE SESSION block carry the live order. Round 59 ran as he named it:
a Fable orchestrator, three Opus builders one at a time, the orchestrator re-verifying each on the
running build before the next started.

## 0. START HERE: his look, then his go

Round 59 answered his sixth verdict in full; nothing is pushed. **His look comes first**, at
`http://127.0.0.1:3102/` on the production preview (§3 below to rebuild it if the PC restarted):

1. **The first screen, cold.** The territory plate with the lights arriving: yellow like lamps now
   (core 255, 212, 158, a halo at 0.08), no bloom. `?core=255,248,236&ha=0.46` shows round 58's
   white points on the same build; `?core=255,222,172` and `?core=255,200,140` the paler and the
   deeper candidates; `?ha=0` a bare dot.
2. **A scroll top to bottom.** Between adjacent stops the map MOVES again: a recorded flight plays
   between the two plates with our lights riding it (1.6 to 2.6 s, a 140 ms dissolve in, 180 ms
   out). `?film=0` shows round 58's fade over on the same build for comparison.
3. **The counties.** Each county stop is a close picture at 9 to 10 km with the whole street grid,
   the built land a shade up and buildings where the tiles carry them; his test is `?towns=0`: with
   no name, Poughkeepsie (the grid, both bridges, the bend), Kingston's Rondout, Newburgh's bay,
   Nyack under the Tappan Zee, New Rochelle on the Sound, Central Park, Flushing Meadows, Prospect
   Park, the Verrazzano. Putnam reads as its lake district with Carmel's strip.
4. **Hover Queens' lights and click** (the push in, then the listing); the county rows under "Where
   we work" (the plates by hover, a fade: those are non-adjacent jumps).
5. **The phone** (390): the same, the films H.264 there.
6. **The MacBook** (2x): the plates are 2880 wide; the film's clip is 1440 and softer than the
   plate on that screen (open item).

**DEPLOYED 2026-09-25 (his word "first deploy that two pages"): `c07889f` is on `main` and LIVE at
realtylt.com.** The Vercel project's aliases are realtylt.com, www.realtylt.com and the vercel.app
hosts; the site is indexable (no noindex header or meta): it has been the public site since the
September SEO rounds. Every push to `main` is therefore a PUBLIC deploy, verified first (the older
"private noindex preview" wording in earlier handoffs and in the `/website` command is stale). Verified
on realtylt.com after the deploy (`scripts/_scratch-r59-live.mjs`, `_scratch-r59-challenge.mjs`): the
plates ground at 1440 and 390, the plate revealed and 450 / 257 lights drawn, the credit collapsing to
the (i), one request for the lights, the first film fetched and ready, CSP silent, no page errors, a
fresh browser's documents all 200 with no challenge. Vercel's bot mitigation answers NON-browser
clients (a plain fetch, whatever its user agent) with a 429 challenge page, so link checks against the
live site must run through a browser, not fetch(); the local crawl is the gate. If the film is too
soft or too heavy: the lossless masters are on disk (§3) and a re-encode at another crf is a
30-minute job with no re-recording.

## 1. What round 59 did

His sixth verdict (`DESIGN-ROUND58.md` §7): the lights read white, the transition no longer moves,
the counties have no definition.

1. **The lights** (builder 1, `ed1a263`, `26161c3`): the core takes the lamp's own warmth (255, 212,
   158), the halo a whisper (0.08, the phone 0.10), the neighbourhood glow off; the `?core=` and
   `?ha=` knobs; `glyph.ts` only plus the plumbing; six tests. Contact sheets
   `docs/design-r59/lights-*.jpg`.
2. **The county plates with definition** (builder 2, `67e87e7` to `0673c53`): a PLATE STYLE
   (`nightStyle({ plate })`, every road class at a constant alpha from zoom 10, the built land a
   shade up, buildings from zoom 12, rails faint, footpath bridges), the county cameras at 9 to 10
   km and the valley chapters at 11 to 12 km, and THE DEEP RENDER (each plate shot at twice the css
   size and half the device scale, so the tiles are one zoom deeper with the same ground and the
   same pixels; two traps held: the centre's terrain height and the light count, see memory);
   calibration 0.00 px at all fifteen re-rendered plates and the territory, both widths, with the
   live map's light counts. The evidence that started it: the street grid was already in the z12
   tiles at the county cameras; the live style's fade-in ladder hid it. `public/plates` 23.7 MB.
   Sheets `docs/design-r59/plates-*.jpg` and his names-off test `definition-{wide,tall}.jpg`.
3. **The lights fetched once** (the orchestrator, `27f579f`): round 58's `as=fetch` preload was
   never matched; an inline early fetch the client adopts; one request per visit at ~100 ms.
4. **The flight as a film** (builder 3, `61ff457`, `b2e431c`, `709e571`, `9807e6e`, `963f484`): the
   sixteen adjacent flights recorded frame by frame from the live map in the plates' geometry with
   MapLibre's own flyTo path ported (`flight-path.ts`), the camera's pixel matrix per frame, graded
   as the plates, encoded from lossless masters: VP9 WebM for the laptop (crf 46), H.264 MP4 for the
   phone (crf 30), forward and back, 64 clips, 30.1 MB. At playback the clip sits between the two
   plates in a third layer, our lights drawn on every presented frame (`requestVideoFrameCallback`,
   0.00 px against the live map at the same cameras), clips decoded ahead like the plates, the fade
   over kept for non-adjacent jumps, reduced motion, a refused play or a codec the browser lacks.
   The history was rewritten before any push so the branch carries the final clips only.

Numbers (§4): vitest 2189, tsc clean; the walk p50 6.9 ms, the worst in-flight frame 34.7 ms at the
probe's instant jump; boot at 1440 (medians): the plate on 635 ms, the lights 664 ms, LCP 268 ms,
1.83 MB, no clip in it; a full read fetches 6.4 MB of film on a laptop and 9.1 MB on a phone.

## 2. Where everything is

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53`, about 235 commits
  over `main`; `c07889f` pushed and live at realtylt.com on 2026-09-25 (a push is a PUBLIC deploy).
- The film: `components/home/plates/flight-path.ts` (the path, pure), `flights.gen.ts` (GENERATED:
  never edit, re-run the script), `plate-controller.ts` (the film layer, `filmFormat`, the warming,
  the fallbacks), `plate-motion.ts` (the rules, tested), `public/flights/` (64 clips + 32 matrix
  files), `scripts/make-flights.mjs` (record, encode; `--only=`, `--aspect=`, `--crf=`, `--crft=`,
  `--stage=`). The plates: `components/home/plates/`, `public/plates/`, `scripts/make-plates.mjs`
  (`--deep`, `--only`, `--aspect`). The plate style: `components/home/ml/style.ts`
  `nightStyle({ plate })`. The cameras: `components/home/ml/shots.ts`.
- Knobs on any build: `?core=r,g,b`, `?ha=`, `?halo=`, `?glow=` (the lights); `?film=0` (the fade
  over); `?towns=0` (names off); `?ground=ml` (the live map: the plates' renderer).
- Probes (gitignored): `scripts/_scratch-r58-*` (calib, transition, trace, boot, reduced, nojs,
  widths), `_scratch-r57l-*` (frames, hover, contrast), `_scratch-r59-*` (omt census, tap,
  lights-fetch, preload-why, the builders' histest, filmcal, cmp, grid, cons, href, peaks, stack,
  lit). Frames and screencasts under `scripts/_scratch-r57/58/` and `scripts/_scratch-r59/`.
- Scratch worth knowing: the film's lossless masters, 4.1 GB, `scripts/_scratch-r57/58/flights/master/`
  (a re-encode needs them; a re-record takes about an hour). The PC's disk is 97 percent full
  (16 GB free): `scripts/_scratch-r57/` holds 8.8 GB of frames from this and earlier rounds.

## 3. How to run

ONE server on the shared `.next`: the production preview on :3102 (PowerShell: stop the listener,
`npx next build` with `NODE_OPTIONS=--use-system-ca`, then `Start-Process node
node_modules\next\dist\bin\next start -p 3102` with `RLT_LAB=1`); never a dev server beside it.
Foreground gates: `npx tsc --noEmit`, `npx vitest run` (2189, only up). Explicit git pathspecs
(`git add <new files>` first); never `git add -A`; no `.env`; never push; CSP untouched except with
a measured reason; never write TypeScript through a bash heredoc; in git-bash never `cd` away from
the worktree inside a probe command. Pointer, tap and frame-timing probes run ALONE (beside another
Chrome the hover probe reported 15 of 50; 50 of 50 alone).

**To re-encode the films** (another crf, another size): `node scripts/make-flights.mjs --stage=encode
--crf=<vp9> --crft=<h264>` from the masters (about 30 minutes), then tsc, vitest, rebuild, the joins
and the lights-on-film probes (`scripts/_scratch-r59-filmcal.mjs`), the walk, the boot. **To
re-record** (a camera or style change): the server up, `--stage=all` (about an hour), then the same.
**To re-render a plate**: `docs/handoff/WEBSITE-R59-HANDOFF.md` §3, now with `--deep` and the
calibration probe at 0.00 px with the SAME light count as the live map.

## 4. His actions

1. The look (§0), then his go for the push.
2. The stale `/website` command text (auto mode refuses my edit): prepend "read the memory's NEXT
   WEBSITE SESSION block and its handoff first".
3. The disk: 16 GB free of 466. `scripts/_scratch-r57/` (8.8 GB) and the film masters (4.1 GB) can
   go once the film's crf is settled.

## 5. Open, in the order a visitor would notice

- The film's weight on a phone (9.1 MB over a full read, lazy, never blocking) against its motion:
  his call; the masters allow a re-encode.
- The 1440 clip is softer than the 2880 plate on a 2x screen; the dissolves carry the change.
- Mid-flight (0.7 to 1.3 s of a county flight) few lights are on screen: plate A's have left, plate
  B's are fading in (the live map's own rule). A second film of a visit can open with one 27 to 118
  ms frame inside its still dissolve. The first move up the page fades.
- Not verified on real devices: an iPhone's MP4 path and decoder, Safari, Firefox.
- The joins at 2x and on the phone on the Queens and Brooklyn films (5 to 7.6 levels under the
  dissolve; no visible step frame by frame).
- Carried: `public/plates` 23.7 MB (the WebP fallbacks carry most of it); the tablet aspect (a
  768 x 1024 window takes the tall plate cropped); the page's own weight on a slow line (HTML and
  script gate the plate's reveal at ~9 s on Slow 4G); the blog template's alt text and covers; the
  five missing seller articles; the 320 tap label overlap.

## 6. Rules that bind (unchanged)

Black ground, white type, the warm lights the only warmth (whitish-yellow, never a saturated
yellow), no gradients, no new hues, radii 8/12/16/24, body 16 px plus on mobile, tap 24 px plus,
focus 3:1 plus, reduced motion clean, JS off works (the plate), day pages byte-identical, no em
dashes in visitor copy, no MLS Grid or media.mlsgrid.com call anywhere, probes block `/api/media/`
and `/api/lead` by CDP. The site is LIVE and indexable at realtylt.com (the old launch-gate sentence
about `PRELAUNCH=1` and the apex is history): a push to `main` goes to the public, after the gates.
