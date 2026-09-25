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

## 8. Queued for a SEPARATE session (his order 2026-09-24, relayed by the CRM session)

Repost the Brivity buyer-automation blog posts (all in his Google Drive) to the site: one
agent checks the SEO to our standard (the realtylt.com/ai page is the bar): keywords, the
site map, every claim re-verified as still true, links to the sources (public government data
or reputable sites), then stable URLs. The CRM's plans link 34 dead posts
(`realtylt-crm/docs/parity/BRIVITY-SELL-24-2026-09-22.md`, and the four stock buyer plans in
`BRIVITY-BUYER-PLANS-2026-09-22.md`); when the posts are live, leave the URL list in the CRM
repo's `docs/handoff/` so the plans can be rebuilt. Not started here (he said another session,
while this one is on the design; the `/blog` command is the natural runner); confirm with him
before starting.

Also done 2026-09-24 outside the map: Rachel's line (914) 506-5884 is the visitor-facing
number everywhere and the CRM line (914) 875-2424 only on /connect (`299f011`); consent-mode
defaults and Do Not Track for the analytics, with the policy updated (`5b3a9c6`).

### 8a. The blog repost ran the same day (2026-09-24 afternoon, in parallel by his order)

Done on branch `content/blog-repost-0924` (worktree `C:\Users\Levan\realtylt-website-blog`, 37
commits on top of `2c90117`, verified by the orchestrator: tsc clean, vitest 2110, every post
rendered at 1440 and 390, the SEO check 35 of 35): all 35 Drive drafts reposted (10 buyer, 5
seller, 10 investing, 5 homeownership, 5 moving), every claim sourced or removed, dates spread
(each post's reason in `docs/handoff/BLOG-REPOST-URLS-2026-09-24.md` on that branch), 29 of the
34 Sell 24 slugs answering 200 at their exact old slug, 39 old stub slugs redirecting (308).
Still 404, no draft exists: `when-to-sell-house-hudson-valley`, `how-to-price-home-hudson-valley`,
`home-staging-tips-highest-roi`, `seller-closing-costs-new-york-state-guide`,
`high-roi-renovations-new-york` (five new articles for the next blog session). The pipeline is
`docs/blog-repost/PIPELINE.md` on that branch. MERGE into `design/futuristic-r53` after round 13
lands (the orchestrator does it), then remove the blog worktree. Known: the template gives cover
and card photos empty alt text (pre-existing); the cover photos are the template's stock set,
not chosen per topic (a polish item).

## 9. The state at the close of 2026-09-24 (rounds 12 and 13 and the blog merge; supersedes §2 to §4 and §7 where they differ)

**The home page's ground is now the MapLibre night map** (round 12 built it in a lab, the
orchestrator measured it against Google, round 13 moved it onto the home page): open source,
no key, vector tiles from OpenFreeMap (OpenStreetMap data, OpenMapTiles schema; "as-is", may be
discontinued: the fallback is a self-hosted PMTiles copy), terrain and hillshade from AWS
Terrain Tiles (USGS and NOAA data), 3D buildings close in, our light layer, names, flights and
click on top; a cover rendered from the map itself; a flat coarse territory on slow lines. The
CSP gained `tiles.openfreemap.org` and `s3.amazonaws.com` under connect-src (measured, `2a15e8a`).
`NEXT_PUBLIC_HOME_MAP`: `ml` (default), `g3d` (Google's photographic map, needs the Maps key),
`night` (the round-54 scene). The Google lab and the MapLibre lab are deleted: one home page.

Numbers, cold, verified by the orchestrator on the running preview: the map's first paint
1.2 s, the whole territory idle 2.0 s (Google: 5.3 to 12 s to steady, 9 to 13 s to reveal), the
worst in-flight frame 28 ms (the builder's five runs: 28 to 62.5), the phone 21 to 34 ms; Slow
4G whole at 13 to 15 s (Google never within 25 s); the cover to the first frame 2.4 / 2.6
levels; contrast 0 under the floor at 390 (the two pills at 1440); hover 50 of 50, taps 30 of
30; tsc clean; **vitest 2123** (147 files) on the merged tree; the blog's 35 posts merged
(`b3884d5`). Branch `design/futuristic-r53`, **204 commits over `main`, NOTHING pushed.** The
videos (untracked, round 13's cut): `docs/design-r57-video/r57-desktop.mp4`, `r57-phone.mp4`.

**The owner's actions now:**
1. His look at :3102 (first screen cold, a scroll, a click on a light, the phone).
2. Before any push: the Maps key on Vercel matters only for `/search` and the listing pages now
   (the home page needs none); `NEXT_PUBLIC_HOME_MAP` unset means MapLibre.
3. The five missing seller articles (no drafts in his Drive) if he wants the Sell 24 plan's
   day 7, 14, 22, 64 and 78 links to resolve: the next blog session writes them.
4. The stale `/website` command text (auto mode refused my edit); the MacBook look.
5. Optional and no longer needed: a Google map ID; a Mapbox token (the higher-wow photographic
   night variant, if he ever wants photographs back).

**Open, in the order a visitor would notice:** Slow 4G at 13 to 15 s (the page's own 650 KB
plus the 292 KB library gate the map's import; a lighter page or a smaller first bundle is the
lever); one cold laptop flight at 62.5 ms in one of five runs; the blog template's empty alt
text on cover and card photos and its stock covers not chosen per topic; the 320 px tap label
overlap and the 200 % zoom search field from round 5; with JS off the browser still fetches
the two preloaded library modules; OpenFreeMap's continuity.

Verification debts from the blog agent's own close-out, for the next blog session: the
basement post's Cost vs. Value figures ($52,012 cost, $36,905 resale value, 71 %) come from
secondary sources because the JLC page blocks fetches (confirm against the report itself); the
NY DMV 10-day address and 30-day licence rules in the relocating post were confirmed from
search snippets, not the DMV page; the 1031 post's commit message says the Form 8824
safe-harbor text was added and it was not (the post is right, the message is wrong).

## 10. START HERE for the next session (his order 2026-09-24 night: a fresh chat, Opus, working directly)

His fifth verdict is in the record §11, verbatim, with the answers. In one line: the idea is
right, the execution is at 20 % of what he wants: the first image is terrible (our cover was
rendered at webp quality 35), every flight waits seconds for tiles, some areas do not look good,
the lights' glow is far too big, and the two links under the search do not read as buttons.

**Do these in this order, each verified on the running preview (frames, then his look):**
1. **The cover at full quality.** `scripts/make-ml-cover.mjs` photographs the page at quality
   35; render it at 2x and quality 80 plus (webp, or avif with a webp fallback), both widths,
   and check the dissolve diff still under 3 levels; the first screen must look finished.
2. **The glow halved or gone** (`components/home/g3d/glyph.ts` and `light-layer.ts`: the halo
   radius and alpha by tier; `?glow=` compares). He said "half or even less, if not nothing at
   all": ship the tight version, keep `?glow=0.12` for comparison, frames at the territory and
   Queens both widths.
3. **The two CTAs under the search** ("What is my home worth?", "Sell with us") as small boxed
   controls: 12 px radius, a hairline border, the site's type, hover and focus states, no arrow
   glyph; both widths; the tap target 24 px plus.
4. **The plates round** (record §11): one high-quality picture per shot rendered once at 2x
   from our own map with the style tuned per plate (17 plates: the territory and every chapter
   and county), avif/webp, the first with the page and the rest lazy by section; the lights
   drawn live on top by each plate's fixed-camera projection (`components/home/ml/geo.ts`);
   transitions as crossfades with a slow move, no tile loads on any flight; the live MapLibre
   map only when the visitor pans or zooms (swap at the same camera), or removed if the plates
   alone reach his bar. Measure: total page weight, LCP, the first-fifteen-seconds probe (the
   territory plate must be sharp within the page's own first paint), frames on every crossfade,
   contrast, hover and tap probes, the cover-to-plate dissolve (the plate IS the cover now).
   Generated imagery (the Higgsfield connector is in the session) may dress atmosphere, never
   define geography: lights at real addresses need real map plates.
5. **"Some areas don't look that good"**: with plates, tune each one by eye (water, land,
   roads, terrain exaggeration, the county's lights) and keep a contact sheet of all 17.

**How to run.** Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53`
(206 commits over `main`, nothing pushed; a push deploys and needs his go). ONE server on the
shared `.next`: the production preview on :3102 (PowerShell: stop the listener, `npx next build`
with `NODE_OPTIONS=--use-system-ca`, `RLT_LAB=1` and `npx next start -p 3102`), never a dev
server beside it (it broke the preview's CSS for 25 minutes on 09-24). Foreground gates: `npx
tsc --noEmit`, `npx vitest run` (2123, only up). Probes are gitignored `scripts/_scratch-r57*`
(the round-13 set `_scratch-r57l-*`: lag with per-flight windows, boot, frames, contrast,
calib, hover, see; block `/api/media/` and `/api/lead` by CDP, not by `route`, which disables
the cache). Explicit git pathspecs, never `git add -A`; no `.env` files; keys never printed;
CSP untouched except with a measured reason; never write TypeScript through a bash heredoc.
Design: black ground, white type, warm-white lights the only warmth, no gradients, no new hues,
radii 8/12/16/24, body 16 px plus on mobile, tap 24 px plus, focus 3:1 plus, reduced motion
clean, JS off works (the cover), day pages byte-identical, no em dashes in visitor copy.

**His actions** stay as in §9: his look; the five missing seller articles; the stale
`/website` command text (this file supersedes it); the MacBook look. The Maps key matters only
for `/search` and the listing pages now.
