# Handoff: website round 56 (written 2026-09-23 during round 55)

Read this first. It supersedes `WEBSITE-R55-HANDOFF.md` (keep that one for §3 "where everything
is" and §6 the ledger; both still bind). Round 55's record is `docs/parity/DESIGN-ROUND55.md`
(the lag measured, the map options with sources, the gates), `docs/parity/R55-PHASE2-NIGHTLIGHTS.md`
(the city glow underlay) and `docs/parity/R55-PHASE3-INTERACTIONS.md` (the interaction brief, not
started).

## 1. What round 55 did (all on `design/futuristic-r53`, NOTHING pushed, `main` untouched)

1. **The contact change** the owner asked for mid-session: the CRM line `(914) 875-2424`
   everywhere the site prints a number (`lib/site.ts` is the source; three hardcoded copies fixed),
   `info@realtylt.com` beside the phone in the header. Delivery to info@ was proven (a test from
   his account landed in the levan@ inbox as the same thread). Commit `d15ee73`.
2. **The lag, measured** in his installed Chrome headed on the real GPU (the Chrome extension was
   not connected). The boot freeze was three.js linking two shader programs on first render
   (199 to 235 ms) plus the geometry build after the worker (60 to 91 ms). Both are gone:
   `compileAsync` before the assets, the light math in the worker, the dust uploaded in pieces.
   The section-change stalls the probe showed (62 to 132 ms at the featured rail and the footer)
   turned out to be **cold shader-cache compiles**: the probe used a fresh Chrome profile per run.
   They were fixed anyway (the rail drifts by scroll position with no promoted 5,760 px layer; the
   footer's stall was Chrome's native textarea resize grip, a stroked path, now a filled glyph on
   night pages) and matter for first visits and after Chrome/driver updates. On a WARM profile the
   baseline already had those two under 28 ms. Numbers: `DESIGN-ROUND55.md` §2.4a and §2.4c.
3. **The city glow** (phase 2, DONE and gated, head `9c034a3`): NASA Black Marble 2016 (NASA
   content, credited in the footer) cropped to the served region and written into the terrain
   asset's blue channel (asset 281 -> 365 KB, R and G byte-identical). The brief's haze plan was
   built, measured and rejected by the builder (grey fog over land with no homes); what shipped
   is a CARPET of 116,176 faint warm street lamps in proportion to the satellite glow, kept to the
   served territory with a soft fade, plus a lighter haze over the densest light only. Manhattan
   is lit for the first time, the valley towns read as towns, the Catskills and the river stay
   dark. Three lines of copy that said "every light is a home" now say the BRIGHT lights are the
   homes and the faint ones the towns' own light. The owner has NOT seen it yet: his verdict on
   the frames (`scripts/_scratch-r55/glow/pairs/`) decides the carpet's weight. Record:
   `R55-PHASE2-NIGHTLIGHTS.md` §5. The phase-2 builder was cut off by the session limit; its
   last tweaks were gated and committed by the orchestrator.
4. Gates at the end of round 55: tsc clean, vitest 1621 -> 1662, ten day pages 0 differing
   pixels at 1440 and 390 (after phase 1; phase 2 touched nothing they render), the round-54
   verify probe clean at 1440/390/320, reduced motion and no-JS on the final build, cold boot
   worst 76 ms (was 235 to 291), warm section changes 21 ms or under.

## 2. The one thing still unexplained, and how to settle it

The owner sees lag "when a section changes" on HIS machine. Our probe on a warm profile does not
reproduce it (every phase under 21 ms at 144 Hz on the RTX 2060). Settle it by measuring HIS
browser, not ours:
- Connect the Claude-in-Chrome extension in his Chrome (it was not connected in round 55) and
  drive the page there: `chrome://gpu` first (is it on the GPU at all, which ANGLE backend), then
  the same wheel scroll with the in-page frame log the probe uses.
- His primary machine is a **MacBook**: Chrome on macOS uses Metal via ANGLE and a 60 or 120 Hz
  panel; the React work the builder saw during the featured rail's scroll-in (~150 ms in the
  unthrottled profile, main-thread bound under 4x CPU) could be the whole story there. Profile
  with source maps (`productionBrowserSourceMaps` in a local build only) to name the component.
- The camera's deliberate 0.16 s spring follow may read as lag to him; the handoff's idea of a
  scroll-velocity-aware time constant is untested. Make a video A/B (tight vs today) for him
  rather than guessing.

## 3. What comes next, in order (REWRITTEN 2026-09-23 after the owner's verdict on round 55)

The owner saw round 55 and rejected the picture: "I don't like it ... the map doesn't look
realistic at all ... you won't really understand which area you're looking at ... find that
Google Maps 3D API ... add our dots ... interactive ... smooth transitions ... Opus builder and
Fable orchestrator from now" (`docs/parity/DESIGN-ROUND56.md` §1 has it verbatim, memory
`feedback-website-r55-verdict-real-3d-map`). So:

1. **The real map** (`DESIGN-ROUND56.md`): Google's 3D map in HYBRID mode becomes the hero's
   ground, our listing lights on it as thinned markers, hover-interactive, one `flyCameraTo` per
   section, the night flight kept as the fallback and the poster. Proven with the site's own key:
   Manhattan AND Poughkeepsie have photorealistic coverage, the valley at 60 km shows every
   town's name. **Phase 1 is BUILT and measured** (`/lab/g3d` on :3102 with `RLT_LAB=1`, commits
   `8288958` `0280a26`, CSP `deda59b`, vitest 1703; videos `docs/design-r56-video/lab-*.mp4`;
   record `DESIGN-ROUND56.md` §7): the scrim look wins on contrast, the region reads at a
   glance, hover and tap work, BUT Google's renderer stalls 50 to 100 ms (326 cold) while it
   streams tiles during the section flights, with or without our markers, against the night
   flight's 7 ms. **Phase 1b (option 1, mitigate) is BUILT and measured too** (commits `53c592d` `f6efd69`
   `f2f5e30` `93505f1` `6e92e55` `128e127` `e5f4757` `362c9d2`, vitest 1720, record §8): our
   poster covers the load instead of black, a one-shot pre-warm removes the cold first flight's
   300 ms stall, markers never move during a flight, soft scrims, the logo corner kept clear,
   honest copy. What it could NOT do: on a laptop every flight still hitches 40 to 90 ms (the
   orchestrator re-measured warm: harbour flight worst 90 ms, 19 frames over 34); on a phone the
   whole scroll is clean (35 ms worst). Pre-warming every shot, a steady gate, longer flights and
   a gentler ladder each changed nothing on the laptop: the stall is Google's renderer. So **the
   owner decides between §7.1's options 2 and 3, or accepts the laptop hitches** (the night flight
   moves and Google's map holds still in the county and harbour shots / stills / accept) before
   phase 2 (integration behind `NEXT_PUBLIC_HOME_MAP=g3d`) starts. He should also see the
   night-poster-to-daylight-map dissolve in the videos (`docs/design-r56-video/lab1b-*.mp4`). Cost: 5,000 free
   loads a month, then $7 per 1,000; the owner ordered it knowing it is Google's.
2. The freeze he saw is already fixed (`d86e43f`): the poster still drops on the first scroll.
3. The lamp carpet of round 55 (phase 2) is NOT to be carried onto the real map; it stays only in
   the night-flight fallback, where its weight is still his call.
4. The fresh-eyes walkthrough, still owed, runs on the real-map build, not before.
5. `R55-PHASE3-INTERACTIONS.md` (hover beam, fly-to-listing) is re-read against the real map:
   the hover and the click-to-fly ideas transfer; the beam and the orbit do not.

## 4. Decisions waiting on the owner

- The listing lights are warm gold (carried from round 54).
- The chat launcher covers a card's save heart at 390 and the last word of the testimonial
  (seen again in round 55's 390 frames); site-wide, his widget, his call.
- The heart disc on night cards is the badges' ink/80 solid now (was ink/55 with blur); one line
  restores the old tone if he prefers it quieter.
- `info@realtylt.com` is in the header only; the footer, thank-you and privacy pages still show
  `levan@realtylt.com`. One email everywhere, or two on purpose?
- With scripting off the featured rail no longer drifts (it is a plain scroller); accepted in
  round 55 because the CSS drift was the promoted layer that stalled.

## 5. Process

Round 55 ran Fable as orchestrator with ONE Fable subagent per phase (his order for that
session's five-hour window); the standing order is Fable orchestrates, Opus builds, one at a
time on this box, and the orchestrator re-measures every claim. The probes that found the lag
are gitignored in `scripts/_scratch-r55*.mjs` (headed Chrome on the real GPU, `--persist=DIR` for
a warm profile, `--css=` injection for A/B, a streaming trace reader for `--gpucat` traces). The
memory record is `website-round55-lag-measured-2026-09-22` and the technique is
`verify-headed-chrome-trace-and-css-ab` in `~/realtylt-claude-config/memory/`.

## 6. Launch is still gated

The site is `noindex` on purpose. The owner clears `NEXT_PUBLIC_SITE_URL`, points the apex, then
removes `PRELAUNCH=1`, in that order. Never push `main` without his fresh go; a push deploys.
