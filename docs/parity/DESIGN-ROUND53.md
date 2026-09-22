# Design round 53 (2026-09-21): home + search, from "built in 2020" to the /ai level

LOCAL ONLY. Branch `design/futuristic-r53` in the worktree `realtylt-website-r53`. Nothing is
pushed: a push to `main` deploys realtylt.com, and the owner asked to see this locally first.

## 0. The final test, before any design work (live realtylt.com, main 784dea6)

| check | result |
|---|---|
| `scripts/verify-final-round-prod.mjs` (headful, media + analytics blocked) | **31/31** |
| every sitemap URL (71) + 4 extras, at 1440 and 390, plus 320 on nine key pages | **0 real failures**, 0 console errors, 0 broken images |
| live flows: hero search + suggestions, results, listing page, county chip, intake step | **11/11**, and 0 requests reached `/api/lead` |
| `tsc --noEmit` / `vitest run` (worktree) | clean / **1466 passed** |

What the crawl flagged and why none of it is a site defect:
- `/ai` "no `<main>`": it is the separate static AI page; it renders (screenshotted).
- `/homes-for-sale` 404: my own guessed URL; only `/homes-for-sale/[...slug]` exists and nothing links the bare path.
- `/selling` 14px overflow at 320: headful Windows Chromium reserves a 15px classic scrollbar
  (clientWidth 305). Headless on the same code measures 0. No phone has that scrollbar.
- Three flow "fails" were my probe (an address suggestion ranked first; clicking before
  hydration; intake options are links, not buttons, so they work with JavaScript off).

One real finding to carry into the build: typing into the hero search BEFORE hydration lost the
text once (Enter submitted `q=` empty). Fix it where the new hero is built.

## 1. Assessment: why the owner's developer friend said "2020"

It is not one thing, it is the template. Every part of the home page is the 2020 IDX-site kit,
because it was copied from the 2020 site:

- a grey utility strip over a white bar of 13px bold UPPERCASE links (Lato), a boxed CONNECT;
- a greyscale photo with a serif headline where ONE word is bold ("Let's Find **Home**"), the
  commonest generated-headline tell;
- uppercase tracked pills and buttons everywhere (SEARCH, SELL YOUR HOME, SEE HOME VALUE);
- sections that are the same shape repeated: centred serif heading, card grid, outline button;
- a testimonial slider with side arrows; a stats ledger; a laptop mock carousel;
- on /search, a phone's whole first screen is filters (six uppercase dropdowns, two buttons,
  seven county chips) and not one home.

What already reads well and is KEPT: the listing photography (it is the product), the honest
copy, the intake flow, the attribution and legal lines, and every accessibility floor the
earlier rounds built (focus rings on photos, 16px controls, the press, reduced motion, no-JS).

The /ai page reads "futuristic" because it has ONE living idea (a galaxy that becomes a brain,
driven by scroll), a heavy grotesque in sentence case, a near-black ground and two accents with
jobs. It does not read futuristic because of glow or effects.

## 2. The design plan

**The idea: blue hour on the Hudson.** Luxury homes are photographed at blue hour: a deep blue
sky and warm lit windows. The home page opens at that hour over the whole territory. It is a
map drawn only in light, and **every light is a real home for sale right now** (active listing
coordinates from our own database; no MLS call). The river is the dark ribbon between them,
Poughkeepsie at the top and the five boroughs at the bottom. It is the real-estate twin of the
/ai galaxy (points of light that are real things), in the brand's own colours.

**Colour** (named, four jobs):
- `night` #0b1a2e: the ground. The logo's navy #0f2e53, taken down to blue hour.
- `night-deep` #07121f: the far end of the page and the lowest layer of the map.
- `night-raise` #122640: panels and cards that sit ON the night.
- `moon` #e8eef6 (text) and `haze` #93a3b8 (secondary text), both measured AA on `night`.
- `porchlight` #28a8e0: the logo's R blue. Brand + every action + focus. Nothing else.
- `window` #f6c781: the light IN the scene only (the lights on the map). Never a button, never
  text: the owner rejected yellow CTAs on /ai, and the same grammar is used here (/ai: violet =
  action, gold = light in the scene).

**Type:** Bricolage Grotesque, the face the owner picked for /ai, so realtylt.com and
realtylt.com/ai read as one company. Variable (opsz 12-96, wght 200-800): display at the large
optical size, weight 620, tight tracking; UI and body at the text optical size. Newsreader
italic is kept for exactly one job: a person's own words (the testimonial). Sentence case
everywhere. No uppercase tracked labels, no one-bold-word headline.

**Scale** (Bringhurst's): 12 · 14 · 16 · 18 · 21 · 24 · 36 · 48 · 60 · 72 · 96, fluid between
steps with clamp(). Measure under 70 characters.

**Layout (home, 1440):**
```
[logo]   Search  Buying  Selling  Areas  Home value  Blog  AI   (Connect)   <- glass, over the map
                                                     .  :.:.
Let's find home.                                   .:.::::.:      <- the map column: 15k lights,
                                                   .:::.::.        Poughkeepsie at the top,
15,644 homes for sale right now, from              .:::::.         the boroughs at the bottom
Poughkeepsie to the five boroughs. Every            .::::::.
light on the map is one of them.                      .:::::.     hover = lantern: the town under
                                                       .::::::.   the cursor and how many homes
[ Town, zip or address              (Search) ]           .::::::  click = search that town
What is my home worth?     Sell with us                   .::::.
```
On a phone the map is the whole background (the corridor is taller than it is wide, like a
phone) and the words sit on its lower third.

**Motion, deliberately few:**
1. ONE orchestrated moment: the lights come on. The sky deepens from blue hour to night while
   each window lights at its own moment (~2s). Reduced motion gets the finished frame.
2. Answers to the visitor: the lantern under the cursor; the header turns to glass once the
   page scrolls; card photos ease on hover; the press everywhere.
3. Listing photos "develop" as they scroll into view (dark to full, CSS view timeline, no JS).
   The blue-hour idea again: things light up. Browsers without view timelines show them plain.

**Principles:** spend the boldness on the map; everything around it is quiet. Numbers are live
and true or absent. Every glow has a source (a window, the moon on the water). The page still
works with JavaScript off (a static picture of the lights and a plain form).

## 3. Review against the generic default

- "Dark page, one bright accent" is default #2. What makes this not that: the ground is the
  logo's navy at blue hour, not a tinted black; the bright points are warm WINDOW light with a
  source; the accent is the logo's own blue and only marks actions.
- "Dotted world map" is a SaaS trope. This is not decoration: each point is a listing, the count
  in the headline is the same data, hovering names a real town, a click runs that search.
- I first reached for a serif display (luxury real estate's usual choice). Rejected: it is
  exactly the 2020 look being replaced, and /ai already established the company's face.
- Eyebrow labels above headings were in my first sketch; cut (all-caps label tell, and they
  said nothing the heading did not).

## 4. Ranked moves (built in this order)

1. The blue-hour hero: live light map, lantern, lights-come-on moment, poster fallback, fixed
   search instrument (spacing + pre-hydration text kept).
2. The night palette + Bricolage type system, scoped to home and search (other pages untouched).
3. Header: glass over the hero on home, sentence-case nav, light logo on night.
4. Listing card: photo-first on night, price in the display face, calmer meta, hover ease.
5. Home sections re-set on night: intake panel, featured gallery, one quote, new listings,
   areas index, the "why" ledger, footer on night.
6. /search: compact filter bar in sentence case, mobile filters in a sheet so the first phone
   screen shows homes, night map style, result count in the display face.
7. Photo develop-on-scroll.
8. Three polish passes at 1440 / 390 / 320, reduced motion, no-JS, keyboard.

## 5. What was built (build pass 1, local commits on `design/futuristic-r53`)

| move | where | measured |
|---|---|---|
| Blue-hour hero: map of 15,084 listing lights, the river (Natural Earth, public domain), lights come on N to S, lantern names the town + real count, click = that town's search | `components/home/HeroLights.tsx`, `app/api/lights` (static, hourly, our DB only), `lib/idx/lights.ts` | payload ~72KB brotli; intro p95 66.7ms -> 16.8ms at 1440 after the accumulate rewrite; throttled-phone max frame 733ms -> 267ms (a no-lights control run carries 9 of the remaining long frames) |
| Night tokens + Bricolage, scoped by `.nocturne`; `night:` variant; `.daylight` escape | `app/globals.css`, `lib/site.ts` NIGHT_ROUTES | every other page byte-identical; tests pin the scope (`lib/night.test.ts`) |
| Header over the hero, light logo, sentence-case nav; footer on night | `Header.tsx`, `FooterShell.tsx`, `public/logo-realtylt-night.png` | |
| Home sections re-set: intake tiles, sentence-case headings, serif-italic testimonial, ledger figures in display size, ghost links on the text edge | `app/page.tsx`, `TestimonialBand`, `Button` | |
| "Where we work": a tile per area drawing its own lights + count | `components/home/AreaLights.tsx` | Queens 5,721 / Manhattan 369 / Staten Island 107 ... |
| /search: night bar, phone "Filters" fold, swipeable chips + quick filters, night basemap + moonlight chips, night "coming soon" tile, popups kept inside the map | `SearchClient.tsx`, `GoogleMapView.tsx`, `map-shared.ts` | phone: first home ~575px down (was below 900px); overflow 0 at 390 / 320 |
| Photos develop on scroll (CSS view timeline) | `app/globals.css` | no JS; off under reduced motion |
| No-JS picture of the lights | `scripts/make-lights-poster.mjs`, `public/images/hero/lights-poster.webp` | 218KB, loaded only inside `<noscript>` |
| Bugs found on the way | pre-hydration typing wiped (live), invisible night focus ring on the hero search, white-on-white Save search field, the carousel advertising the OLD /search | each fixed + verified |

## 6. Rounds after the build (all re-verified by the orchestrator)

| round | who | what | result |
|---|---|---|---|
| review | fresh-eyes subagent | 17 findings, ranked, measured | 16 fixed (cc063b6), 1 pre-existing carried |
| perf | orchestrator | next build + next start | /search CLS 0.477 -> 0.015; home LCP 144-212ms; font preloaded |
| polish 2 | builder subagent | checkboxes/select/skip link on night, cue, 320 search box, rail clipping, review band, baselines, even dropdowns, panel edges, pager, pending state in the page's frame | 4 commits, 1483 -> 1492 tests |
| check | checker subagent | verified the 4; day pages equal live (12/12 x 8); fixed 4 focus/hover defects | 1 commit, 1495 tests |
| leftovers | orchestrator | phone "Showing 1-50" line, map note into the legend, typographic apostrophe | f7f09cd |
| walkthrough | visitor subagent (seller + phone buyer) | carousel shift, cold towns, town counts = page counts, exact-city picks + lantern, Recent rows, count keeps shape | 5 commits, 1504 tests; flows 11/11 re-driven |

Open for the owner: the phone /search 50 -> 150 growth when the map mounts (it also costs page 2 on a
laptop's first settle and changes what Back restores); the listing page is still the day design (next
round's first move); the home footer form repeats the intake fields; a county chip keeps a typed town.
