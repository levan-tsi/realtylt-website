# Round 62: the phone (2026-09-26)

The owner, after testing realtylt.com on his phone: the computer is "amazing", the phone "lost all
the effect": "map is not really shown", "a dark cloud" bottom left, "it needs a lot of polish". The
handoff (`docs/handoff/WEBSITE-R62-PHONE-POLISH-HANDOFF.md`) asked for a design decision first,
then three builders. This round ran as ONE agent (his `/website` order that session: single agent,
no subagents), doing the three builders' scopes in turn, each verified on a production build.

Before and after, one look each: `docs/design-r62/before-after-hero-390.jpg` (live today at
390 x 664 | this round at 390 x 664 | at 390 x 844) and `docs/design-r62/before-after-county-390.jpg`
(live Dutchess | Dutchess | Queens).

## 1. The design decision: where the effect lives on a phone

On a laptop the effect is the lit night map as the page's ground with the words beside it. On a
phone the words were stacked over it. Three first-screen compositions were framed side by side at
390 x 664 on the running build (CSS injected, `scripts/_scratch-r62-compose.mjs`):

| | composition | what showed |
|---|---|---|
| cur | words as they were | the county names in a thin strip; the city under the count paragraph |
| A | headline at the top, search at the foot, the rest below the fold | **the lit city (the Bronx, Manhattan, Queens, Brooklyn) in the open middle** |
| B | all the words at the foot | the headline sat on the city |

The tall plate already has the city in its middle band; the old layout simply covered it. A wins,
with a two-line count kept over the search (it is what makes the lights mean something). A closer
phone camera was tried on the live MapLibre ground and set aside: at 390 x 844 A shows the whole
territory, the city and Long Island, so no plate re-render or film re-record was needed (the plates,
films and calibration are untouched: 0.00 px).

The light density at the phone's first screen is bound by the finger's 14 px gap, not the budget
(`?budget=1..5` drew the same picture); it was left alone (taps 30 of 30 depend on it).

## 2. What changed (all scoped below lg unless said)

**The first screen** (`app/page.tsx`, `components/home/ml/MlGround.tsx`): the count as a 17 px
caption ("15,709 homes for sale right now. Every light on the map is one of them."), the two boxed
links just below the first screen (`HeroLinks`, rendered once per layout), the foot 56 px up
instead of 96, the phone's shades hug their words (56 px feather, 12 px pad; the laptop keeps 150).

**The dark cloud**: a phone-only foot shade (bottom 26svh at 0.86, with an ellipse cut round the
old two-line credit) and three credit-corner holes (in the words, the shades and the veil) made a
dark ring round the (i). All removed below lg; the corner kept clear of names and lights on a phone
is the (i)'s own 48 x 44. The laptop's credit corner is unchanged.

**Where we work** (`app/globals.css .rlt-areas`, `MlAreaChapter.tsx`, `MlGround.tsx pinnedSpan/goTo`):
on a phone with JavaScript the section is 460svh with its stage pinned; the map is the picture and a
short panel at the foot holds the heading, the area under the camera (name, homes for sale, "See
homes" to its page) and a row of chips. The scroll is the flight (about a third of a screen per
area); a chip scrolls the page to its area's stop. The stops of a pinned section are spread over
the pinned scroll only. Entering, the map gets a wordless moment before the panel arrives. Without
JavaScript (`scripting: none`) or on a laptop: the lists as before.

**Found walking the site on a phone** (these also fix the laptop, where they were equally wrong):
- /search opened on one street number ("34 Lawrence Lane, 34 Old Mountain Road, 34 Simonson
  Place, 34 Mott Street...", live): the Mixed sort ordered by address and a page is a contiguous
  block. It orders by listing id now (`lib/idx/db.ts ORDER.mixed`).
- The mortgage calculator's breakdown (the bar on /financing, the donut on every listing, the legend
  dots) was a hard-coded black ladder from the light theme: invisible on the night panel. One
  token hue (stone) with the same ladder; the rates dividers on the line token.
- A phone's section heading left one word alone ("What You Can Hold Us / To"): `text-wrap: pretty`
  on .t-h2/.t-h3 below lg (not `balance`, per the note in globals.css).
- Market Insights on a listing: three 130 px cards became one row each below sm.
- "when a Orange County home hits the market" reads "an Orange County home".

Looked at and left, with the reason: /search's Grid/Map toggle reads "Map" on a phone while the
cards show first (a deliberate round-54 decision: the map sits under the cards, the toggle scrolls
to it); /connect shows (914) 875-2424 (the owner's order, lib/site.ts); Google's booking calendar on
/connect is white (Google's iframe); the Title Case and ALL CAPS headings on /buying and /selling
(parity copy; a site-wide casing pass would change the laptop too, the owner's call).

## 3. Verification (production build on :3102)

- tsc clean; vitest 2272 (from 2259; 13 new: source pins for the phone rules, pinnedSpan, the mixed
  order, the calculator's colours).
- 1440: all 20 home stops diffed pixel for pixel against the pre-round build: identical, except the
  hero's count line (sub-pixel antialiasing at one word gap, max 15/765 per channel, invisible).
- Phone frames at every stop at 390 x 844 and 390 x 664, the entry and exit of the pinned stage, and
  320 x 568, all looked at. No horizontal overflow on 15 pages at 320 and 390.
- Calibration `--shots=hero,queens,dutchess-county`, laptop and phone: 0.00 px mean/p95/max.
- Transitions: phone 9 films played, no frame over 34 ms; 1440 one 90 ms frame holding at Dutchess
  that the pre-round build shows identically (pre-existing, not this round's).
- Taps 30 of 30 (phone hero), hover 50 of 50 (1440 Queens). Chip taps land on their stops exactly.
- Long tasks on a phone: none over 150 ms (max 117 ms, run 1; none over 100 ms, run 2).
- Light-surface scan: only the white primary buttons and light chips with dark text. Contrast walker
  20 pages at 1440 and 390: 0 of ours under the floor (Google's own map credit on /search excepted).
  The home kit on a phone: two chip boxes at Queens under 4.5 at p99 only (the chip's own border in
  its box; p95 6.86); at 1440 the header's outline buttons at the hero, identical pixels to before.
- Reduced motion OK; JS off: the plate stands, every page dark, the lists shown.
- qa-crawl ALL PASS.

## 4. Open

- A real iPhone (Safari's toolbar changes svh; the pinned stage and the first screen should be looked
  at on one).
- The pinned stage's length (460svh) is a feel call: shorten if he finds the county walk long.
- The parks-and-water tint (his choice pending), /search on MapLibre, the /ai repo's white chat copy,
  a site-wide heading casing pass, the 1440 hold frame at Dutchess (90 ms, pre-existing).
