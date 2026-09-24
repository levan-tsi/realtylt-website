# Handoff: website round 58 (written 2026-09-24 at the close of round 57)

Read this first; it supersedes `WEBSITE-R57-HANDOFF.md` (keep its §2 facts about Google's 3D
map on 3.66 and its §5 rules). The record is `docs/parity/DESIGN-ROUND57.md`: §1 the bar, §3 the
briefs, §4 every round's builder numbers and the orchestrator's verification, §5 the owner's
mid-round verdict verbatim, §6 the close.

## 1. What round 57 built (seven rounds, one Opus builder at a time, Fable orchestrating)

The home page is Google's real 3D map, at night, with our listing lights on it:
1. The opening shot shows the whole territory (Staten Island to Poughkeepsie, the Sound to the
   Catskills) with our own county and borough names placed by projection (round 1).
2. Lights by altitude, satellite imagery under the chapters, the load cover drawn from our own
   data (round 2).
3. The address lights finished: hover label, lit light, click with a fly-in to the listing,
   phone tap-then-open, keyboard reach through the featured cards, town names (round 3).
4. The quarter-second freeze into Westchester diagnosed as a one-time GPU shader compile and
   removed by pre-flying that path under the cover (round 4).
5. The walkthrough: the projection calibrated to 2 px (the scrollbar and the geoid), the county
   rows navigate, the caption honest in every state, four invisible Tab stops removed (round 5).
6. THE NIGHT (his order): a tone-curve night grade over the imagery, our own canvas light layer
   at true coordinates (no Google markers, 0 marker adds), the cover rebuilt as the map's own
   first frame, the cover held through the warm-up on an early scroll (round 6).
7. The polish: SATELLITE at every stop, so our names, our lights and the night photograph are one
   language and Google's shields are gone (round 7, the orchestrator).

## 2. Where everything is

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53`, **124 commits
  over `main`, NOTHING pushed, `main` and realtylt.com untouched.** A push deploys and needs his go.
- Preview: `npx next start -p 3102` with `RLT_LAB=1` from PowerShell serves the production build
  (the R57 handoff §2 has the stop, build and start lines). Dev on :3101 only. Never :3100.
- The map's code is `components/home/g3d/`: `G3dGround.tsx` (the ground, the cover, the veil, the
  driver, the labels), `controller.ts` (the map element, camera, flights, the warm plan),
  `light-layer.ts` and `light-plan.ts` (our lights: projection per camera event, the eased glyph,
  density-true thinning), `night.ts` (the grade), `labels.ts` and `towns.ts` (our names),
  `interaction.ts` (label placement, click policy, tap state), `claims.ts` (the caption's truth),
  `warm-plan.ts` (the shader pre-fly), `map-options.ts` (map ID and mode), `cameras.ts`,
  `camera.ts`, `glyph.ts`, `thinning.ts`, `gate.ts`, `lab-query.ts`, `G3dAreaChapter.tsx`;
  `lib/home-map.ts` (g3d or night, the cover choice); `scripts/make-map-cover.mjs` (the covers);
  `components/site/SceneCredit.tsx` (the footer credit follows the sources).
- Query switches for a look: `?mode=split|hybrid|satellite`, `?night=0`, `?thin=lattice`,
  `?cover=dusk|day`, `?warm=full|0|path`, `?homes=0`, `?towns=0`.
- Instruments (gitignored): `scripts/_scratch-r57*-*.mjs`; frames under
  `scripts/_scratch-r57/<round>/`; the videos `docs/design-r57-video/r57-{desktop,phone}.mp4`
  (untracked).
- Gates at the close: tsc clean; vitest **1849** (138 files); overflow 0 at 1440/768/640/390/320;
  contrast 0 under the floor at 390 and 2 at 1440 (the two pills the kit misreads); cold 1440:
  steady 6.2 s, cover gone 9.9 s, the Westchester flight 28 ms, the worst flight frame 76 ms,
  marker adds 0; day pages unchanged by round 57 (verified against the round's base).

## 3. Decisions and actions that are the owner's

1. **His look.** The two videos, then the page itself on :3102 (or a deploy to the private
   noindex Vercel site on his go). Show him the FIRST SCREEN cold, not only the settled map.
2. **The Google map style** (thins Google's own pins if HYBRID ever returns): a map ID and a
   style made in his Cloud console (five steps in the record, round 2); the code reads
   `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`. With SATELLITE everywhere this is optional now.
3. **The MacBook.** Open the page in Chrome on the Mac in a fresh guest window, keep the tab in
   FRONT, scroll top to bottom; then again with `?warm=full`. The Chrome extension on the PC could
   not measure because its tab stayed hidden (record §4, round 4).
4. **Before any push**: confirm `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set on the Vercel project's
   production environment (the CLI hung on `vercel env ls` here and the MCP connection is not
   allowed to list variables). Without it the home page falls back to the night flight.
5. **The `/website` command text** is stale (a round-11 brief that says "single agent"); the
   auto-mode classifier refused to let me edit `~/.claude/commands/website.md`. Prepend a line
   that says to read the memory's NEXT WEBSITE SESSION block and its handoff first.

## 4. Open items, in the order a visitor would notice them

Record §6 "Left open, honestly": the 320 tap label overlap; the 200 % zoom search field in the
logo corner; a 278 ms phone landing frame in 1 of 3 runs; the warm-up missing once in 17 cold
runs; the hitch felt by someone scrolling during the compile; the flat cover outside our
elevation grid; three phone calibration outliers; scrims at 0.8. Plus the older carried ones:
the chat launcher over a save heart at 390; `info@realtylt.com` in the header only.

## 5. Rules that bind (each one cost a session)

ONE builder at a time, `model:"opus"`, the orchestrator re-verifies on the running app; foreground
gates only; explicit git pathspecs; never push; never touch `main`; no `.env` files; the Maps key
never printed; no MLS Grid or media.mlsgrid.com call anywhere; probes block `/api/media/` and
abort `/api/lead`; CSP, auth, RLS untouched; Google's attribution never covered; black ground,
white type, warm-white lights, no gradients, no new hues, radii 8/12/16/24, body 16 px+ on
mobile, tap 24 px+, focus 3:1+, reduced motion clean, JS off works (the cover), day pages
byte-identical; screenshot and LOOK; a headless p95 hides a 100 ms frame; never write TypeScript
through a bash heredoc.

## 6. Launch is still gated

The site is `noindex` on purpose. The owner clears `NEXT_PUBLIC_SITE_URL`, points the apex, then
removes `PRELAUNCH=1`, in that order. Never push `main` without his fresh go.

## 7. Rounds 8 to 11 (2026-09-24, after his two further verdicts; supersedes §1 to §4 where they differ)

He looked twice more (record §7 and §8, verbatim). Four more builder rounds, each verified by
the orchestrator on the running build:
8. **The lights, many and alive**: 445 at the opening shot (was 130), a 14 px on-screen gap so
   the mouse always picks one home, a smooth count by range with a stable choice (coming down
   adds lights, going up removes the latest), a neighbourhood glow weighted by the homes each
   light stands for.
9. **Moonlight**: the grade a third darker in silver-blue, the warm lights the only warmth; the
   cover re-rendered in the same grade with the real coast (Natural Earth) and the same lights
   (diff to the first live frame 6.9 at 1440, 4.2 at 390).
10. **The load**: the ugly stretch was OUR cover, soft, held 4 s past a sharp map; now it lifts
    about 2 s after the first draw, breathes while it holds, and is capped; the lights' order
    keyed by place so an hourly sync no longer re-lights the map.
11. **Closer, and the flight as the transition**: every chapter and county a close moonlit
    photograph (6 to 12 km) of one real place; the map dims to the lights as a flight starts and
    the photograph comes up once the landed tiles are sharp (2.5 s at most); the cover's cap
    never skips the shader walk, which now flies three steps.

State: HEAD `e03ee7a` plus this file, **vitest 1887** (140 files), tsc clean, overflow 0 at
five widths, contrast 0 under the floor at 390 (the two pills at 1440); cold 1440 on a slow
line: steady 7.3 s, cover gone 10.5 s, worst flight frame 97 ms, no stall; the videos re-cut
(`docs/design-r57-video/r57-desktop.mp4` 105 s, `r57-phone.mp4` 82 s).

Open, in the order a visitor would notice: on a slow line the laptop's close tiles keep
sharpening for a moment after the 2.5 s lift at some stops (an adaptive bound from the tile
arrival rate is the next step); Google's script failed to load twice in about forty runs and
the page stayed on the cover (retry once); the phone's Westchester flight is 90 ms in every
round; the close flights stream more tiles (16 to 20 frames over 34 ms per flight, hidden by
the veil); the map ID for a Google style is still his to create and still optional. If his
next look says the real map still is not "amazing", the fallback is a dark-styled vector map
(record §8, option 2), which needs his map ID first.
