# Design round 54: the night flight (home, then /search)

Branch `design/futuristic-r53` in the worktree `~/realtylt-website-r53`. LOCAL ONLY: nothing is
pushed, nothing deploys, the owner reviews on a local production build.

## 1. The brief, in the owner's words

- 2026-09-21: make home and search listings "really, really good and amazing futuristic ... on the at
  least same level, if not more, [as] our AI page ... maybe different animations, transitions".
  Home first, then search. Do not touch /ai or the other pages. Local only.
- 2026-09-22, on round 53: "black and white color is on each other was better. And it's not even
  near close to our AI page. It needs way more multiple rounds of polish and subagents."
- 2026-09-22, round 54 start (his answers): **black ground, white type**; subagents one at a time.

## 2. Why round 53 missed

/ai is one scene the camera travels through: galaxy, Earth, brain. Scroll is the camera; the sections
are chapters of one journey; the particles answer the pointer. Round 53 re-coloured the old page
(hero, intake, featured rail, review, new listings, areas, carousel, ledger, footer) and put a flat
2D canvas at the top. Below the first screen it was a conventional stack of bands, and the navy
ground read as a theme, not a place. A palette cannot close that gap. A scene can.

## 3. The concept: a night flight down the Hudson

The home page is one aerial scene, fixed behind the whole page, and scrolling flies the camera
through it.

- **The land is silver dust.** The terrain of the served region (Ulster and Orange down to Staten
  Island) comes from a public-domain elevation model, drawn as tens of thousands of faint points,
  lifted by height. The Shawangunks, the Hudson Highlands, the Palisades appear as landforms made
  of light dust, the way LiDAR draws a hillside. It is monochrome by nature.
- **The water is black.** Nothing is drawn where the elevation says water. The Hudson, the Tappan
  Zee, the harbour and the Sound are the absence of dust: the river is the darkest thing on the page,
  and nobody drew it.
- **Every home for sale is a warm light,** sitting on the terrain at its measured address, from the
  same hourly packed data round 53 built (15,084 lights, our Supabase only, never MLS Grid). The
  lights are the only warm tone on the page. The city is a sea of them; the valley is scattered.
- **The pointer is a lantern.** Near the cursor the dust brightens slightly and the nearest town is
  named with its real count; a click opens that town's search (round 53's behaviour, now in 3D).

Each section of the page is a camera SHOT, and scrolling between sections is the flight between
shots (scrubbed by scroll, spring-damped, never time-jacked):

| Section | Shot |
|---|---|
| Hero: "Let's find home." + search | Establishing: high over the harbour looking north up the valley; the city's lights in the foreground, the river a black ribbon to the horizon. The lights come on south to north, once. |
| Intake (buy / sell / both) | The camera climbs the river to Dutchess (our office is in Lagrangeville). |
| Featured listings | Low along the river through the Highlands; the scene dims under the cards (a veil in the shader, not a black band), the flight keeps moving behind them. |
| Testimonial | A held, slow drift: one quiet shot. |
| New listings | Westchester and Rockland, veiled. |
| Where we work | THE chapter where the scene is the content: a pinned flight county by county (the six counties, then the five boroughs), each named with its live count and a link, the camera arriving over each. Replaces round 53's eleven tiles. |
| Why us + ledger | Arriving over the harbour: the densest light. |
| Footer | The camera rises and pulls back to the whole region: the page ends where it began, from higher up. |

Listing cards talk to the scene: hovering a card lights that home's point in the valley behind it
(a thin beam rising from its light). A glow with a source, which is the site's own rule.

## 4. Visual system (black and white)

- Ground near-black neutral (no blue cast; round 53's navy is gone). Raised surfaces one step up.
- Type white (slightly warm), muted grey for secondary text, hairline rules at low white alpha.
- Actions: a white button with black type (primary), a white hairline outline (secondary). No hue.
- The only colours: the lights' warm white, listing photographs, and the logo's own mark.
- Display face Bricolage Grotesque (the /ai file, already preloaded), sentence case, tight tracking.
  Body face unchanged.
- The scoped theme mechanism from round 53 stays (`.nocturne` re-points tokens on `/` and
  `/search`; every other page byte-identical). Only its values change.
- Rules that bind: no gradient text or buttons, no purple primary, no neon cyan, no em dashes in
  visitor copy, no arrow-glyph CTAs, every glow has a source in the scene. Radii scale unchanged.

## 5. How it is built

- `three` from npm, imported dynamically after first paint, so the headline and search box are the
  LCP and paint with no JavaScript. One `<canvas>` fixed behind the page.
- Elevation: a small committed heightmap image of the served region, prepared once by a script from
  public-domain elevation data; source and licence recorded in `public/images/ATTRIBUTIONS.md`.
  Water mask = elevation at sea level. Lights sample their height from the same map.
- Points are drawn with a small custom shader: soft round sprites, additive light (no bloom pass),
  distance fog, a uniform for the intro reveal, one for the veil, one for the lantern.
- Shots are data (position, target, field of view, per aspect ratio). A pure function maps the
  sections' positions in the viewport to a blend between shots: unit-tested.
- Reduced motion: no flight and no drift; each section cuts to its shot (a short cross-fade) and
  the lights are simply on. No JavaScript or no WebGL: a still of the establishing shot is the
  hero's background, and every section is ordinary content on black.
- Phones: fewer dust points, pixel ratio capped, rendering paused when the tab is hidden and when
  nothing moves. Budgets are measured, not assumed (frame times on a 4x-throttled CPU).
- Safety carried from round 53: no MLS Grid call anywhere, `/api/lead` aborted in probes,
  `/api/media` blocked unless a shot needs photos.

## 6. Keep from round 53 (behaviour, not styling)

Pre-hydration typing kept in the search box; parallel suggest index with a cold retry; suggested
town counts equal the page counts; exact-city picks; Recent rows re-run their search; /search CLS
fix; map popups kept inside the map; the scoped-theme mechanism; the packed lights route.

## 7. Phases (one subagent at a time; the orchestrator re-verifies each)

1. **Scene spike (builder 1).** Heightmap asset + licence, dust + water + lights, the shots, rendered
   stills at 1440 and 390. The orchestrator judges the look before anything is integrated; if the
   dust terrain does not read as beautiful, it changes here, cheaply.
2. **Integration (builder 2).** The fixed scene on the home page, the scroll-shot driver, veils, the
   intro, the lantern, the areas flight, reduced motion, no-JS still, black-and-white restyle of every
   home section, performance budgets.
3. **Fresh-eyes check (checker).** Gates, flows, 1440 / 390 / 320, keyboard, no-JS, reduced motion,
   the anti-slop scan, performance on a production build.
4. **Polish (polisher).** Transitions, card-to-light beams, type rhythm, states.
5. **/search in black and white** (builder), then check and polish again.
6. **Walkthrough** as a buyer and a seller, phone and laptop, then a production build, a short video
   and the URLs for the owner.

## 8. Success criteria

- Side by side with /ai at 1440 and 390, the home reads as the same studio's work: one scene, a
  journey, motion that answers the visitor. Judged on rendered frames, not code.
- Search remains the first action: the search box works before the scene loads, with no JavaScript,
  and with reduced motion.
- Production build: home LCP is the text (under 1s at 1440), CLS under 0.05, scroll frames p95 under
  20ms on desktop and under 34ms on a 4x-throttled CPU at 390.
- `npx tsc --noEmit` clean, `npx vitest run` at or above 1504 (round 53's count) with new tests for
  the shot blend, the height sampling and the water mask.
- No horizontal overflow at 390 or 320; tap targets at least 24px; focus rings visible on black.

## 9. Open owner decisions carried from round 53

1. /search on a phone: the list shows 50, then 150 when the map mounts. Recommendation for phase 5:
   on a phone the list does not follow the map until the visitor moves the map.
2. The listing page stays the day design (out of scope by his instruction).
3. The home footer form repeats the intake's contact fields.
4. A county chip keeps a typed town in the box.
