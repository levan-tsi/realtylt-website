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
3. **The city glow** (phase 2): NASA Black Marble 2016 (public domain-class NASA content,
   credited in the footer) cropped to the served region and written into the terrain asset's blue
   channel (asset 281 -> 365 KB, R and G byte-identical), so the haze can glow where the cities
   really are. Scene integration: see `R55-PHASE2-NIGHTLIGHTS.md` §5 for what shipped and the
   frames.
4. Gates at the end of phase 1: tsc clean, vitest 1621 -> 1639 (-> 1657 after the asset), ten
   day pages 0 differing pixels at 1440 and 390, the round-54 verify probe clean at 1440/390/320,
   reduced motion and no-JS.

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

## 3. What comes next, in order

1. Phase 3, interactions, from `R55-PHASE3-INTERACTIONS.md`: the hover beam, fly-to-listing,
   tap-to-fly on the area index; then orbit and "new today" if those land clean.
2. The 3D-when-close prototype: NYC Open Data Building Footprints (`height_roof`) extruded as
   faint prisms over the boroughs in `/lab/night` only, frames side by side; the terms-of-use page
   must be read by hand (it 403s scripted reads) and cited in `ATTRIBUTIONS.md` before anything
   ships. Google's Immersive Maps SKU is not for the home page (`DESIGN-ROUND55.md` §3.2).
3. The fresh-eyes walkthrough that has now been skipped twice (`WEBSITE-R55-HANDOFF.md` §4.4).
4. Many more polish rounds, judged on frames and videos against realtylt.com/ai.

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
