# Round 68 (2026-10-05): the polish pass while his green pick is pending

One agent (Fable 5.1), on `design/futuristic-r53` in the worktree, against the :3102 production build.
Live realtylt.com is still `e2507d9`; nothing from rounds 65 to 68 is on `main`.

## 0. The state the round found, and what it could do

- **His pick on the park green is still pending.** The decision page
  (https://claude.ai/artifact/6BzWKcRVtjtPvfVAVWtb1b) carried no comment, and no message named a
  number. **Deploy is not ordered.** `origin/main` is unchanged at `e2507d9`; `r67-preview` was at
  the branch head (`90f650a`).
- So the round did the work that depends on neither: the open items of the round 67 handoff §4 that
  are not owner calls (4.2 the no-script controls, 4.4 the horizon band at other phone sizes), the
  three polish passes the `/website` brief asks for (every page at 1440, 390 and 320, looked at;
  the states; the walk as a visitor), and the fixes those found. Round 67's handoff §1 and §3 stay
  the procedure for his pick and for the deploy.

## 1. The site with fresh eyes (the brief's §1b, through the frontend-design lens)

**What reads as a point of view, not a template.** The home page is the one memorable thing: a
real night map of the territory with every listed home as a lamp, the counties as camera stops,
the flights as films. Nothing else in the category looks like it. One typeface (Schibsted Grotesk)
set large, in sentences, in sentence case, with no eyebrow shouting and no gradient anywhere. The
photography is black and white under a flat scrim, so the only colour on the site is the lamp
yellow, the two blues of the mark, and the Google marks. CTAs are boxes, not arrows. The footer is
composed (the form first, then the reference block of contact details and links, the marks last).
The copy says what we do for the reader in the first line of every hero.

**What still reads as a kit.** (a) Three-across identical rounded cards appear on `/services` (the
hub, 11 cards), `/who-we-are` ("What you can hold us to"), `/home-value` (the three steps), the
listing page's market insights and the thank-you page; the card is the same object each time, so
the eye reads "section of cards" before it reads the content. (b) A small label sits above most
headings ("Saved", "Plan", "Legal", "Index", "Questions", "Start here", "The hub"); sentence case
keeps them quiet, but a reader meets twenty of them. (c) `/services`' "plumbing" list wears 01 to
07 markers on content that is not a sequence. (d) On the short pages the h1 and the first section h2
sit within one step of each other (`/reviews`: "What our clients say" over "In their words"), so
the page reads as two titles. (e) The listing page's calculator and the financing page's calculator
are the one surface still built from a black-panel-plus-light-panel idea; on the night site the
light panel has become a dark one, and the pair now reads as two greys.

**The ranked moves, and the recommendation.** The owner's standing order since round 60 is "polish
more, deploy on my word", and he has approved the look through seven previews; the brief's own rule
is to respect convergence. So these are offered as his calls, not built:

1. Give the three-across card sections a second form (a ruled list for steps and promises, cards only
   where a card is a thing you open). Highest leverage on the "kit" reading; a half-day.
2. Drop the eyebrow labels where the heading already says it ("Saved" over "Your homes & searches",
   "Legal" over "Privacy Policy", "Index" over "Site map"); keep the ones that carry a fact ("Step 2
   of 3", "Request received"). An hour.
3. `/services` plumbing list: the numbers become a plain rule. Minutes.
4. `/reviews`: the h1 carries the rating line and the Google button; "In their words" becomes the
   quiet lead of the quotes rather than a second display heading. An hour.
5. The calculators: one panel, the inputs and the figure on the same ground, the figure the only
   large object. Half a day, with the listing page's seeded variant.
6. The blog index hero's "The RealtyLT journal" label and the post pages' "7 months" number glow are
   the two places the blog still has its own dialect; the number glow is the only glow on the site.
7. The service pages' Title Case product names ("AI Chat Assistant") against the site's sentence
   case: his call, they are names.
8. The legal page titles in Title Case ("Privacy Policy", "DMCA & Terms of Service") match their
   footer links; a sentence-case pass would touch both. His call.

None of these were built this round; what was built is the defect list below.

## 2. What was done, each verified on the rebuilt :3102 build

### 2a. The no-script leftovers (handoff §4.2) — `d0dc227`
- The closed photo grid's 33 tiles carried `role="button"`, a tab stop and a "View photo N full
  screen" label before anything could answer a click; the role, the stop, the label and the zoom
  cursor now arrive with hydration. JS off: 33 tiles, 0 with a role; JS on: 33 of 33 with the role
  and the tab stop.
- The header's desktop top-areas caret (its flyout opens by state alone) and the mortgage
  calculator's Reset button and representative-rate rows carry `data-js-only`; the calculator says
  in one noscript line that the figures stay at the example until scripting is on, with the number.
  JS off at 1440 and 390 on a listing, /financing and the home page: visible `[data-js-only]` 0, the
  caret hidden, the noscript line present. `components/listing/nojs.test.ts` holds the three (28
  assertions, was 25).

### 2b. The horizon band at other phone sizes (handoff §4.4) — measured, closes
The round 67 band (`highlands.tall`, `horizon: 0.16`) measured at 390x844 only. The phone contrast
kit (`scripts/_scratch-r68-contrast.mjs`, the round 57 kit with `--w --h`) at the two Highlands
stops:

| window | texts | below floor at p95 | below floor at p99 |
|---|---|---|---|
| 320x568 | 7 | 0 | 0 (the headings sit outside the frame at these stops) |
| 390x844 | 11 | 0 | 1: "See more listings" 1.24 (the accepted single-lamp class) |
| 430x932 | 13 | 0 | 1: "See more listings" 1.43 (the same class) |

"Featured listings" reads 8.75 at p99 at 430x932 (7.90 at 390). Looked at
(`scripts/_scratch-r68/horizon/*.png`): the far row dims into the band at both sizes with no edge.
No change.

### 2c. The listing page's "On this page" bar stuck on the last section — `fc07f93`
Found by the walk: on a fresh load "Overview" was current; after a scroll to the bottom and back to
the top "Payment" stayed underlined. The scroll-spy is an IntersectionObserver over a 5 % band at
mid-viewport; once the last section has left the band (over the footer) a jump to the top changes
no intersection, so no callback fires. One passive, rAF-gated scroll listener marks the first anchor
whenever the first section still sits below the band. Probed on the rebuilt build
(`scripts/_scratch-r68-subnav.mjs`): fresh Overview, after the scroll Overview, 1.2 s later Overview.

### 2d. Copy and type details from the walk — `23ff5d1`
- `/buying`: the hero set "We find the home. We" / "negotiate the price." (balanced wrapping treats
  the two sentences as one pool). A no-break space in "We&nbsp;negotiate" gives the two sentences
  their own lines at 1440 (2 lines) and four balanced lines at 390. Looked at.
- `/selling`: the video badge read "3D Walkthrough" beside a chip reading "3D walkthrough".
- `/financing`: the closing paragraph rendered "title company,where" (JSX drops the line break on
  both sides of the comment between the halves); an explicit space before the comment. DOM check on
  the rebuilt build: "company, where". And "Loan Officer" mid-sentence is "loan officer".

### 2e. A mock thumbnail that loses its photo — `528c76c`
The browser and phone mockups on `/buying` and `/selling` are built from real listings through
`MlsImage`, whose failure state is the branded placeholder with "Photograph coming soon" at card
size; in a 48 to 160 px tile the caption overflowed (seen at 390 with the media route blocked; a 429
from the media host does the same). `MlsImage` gains `blankWhenUnavailable`, a boolean because these
are server pages and a callback cannot cross into the client component (the first attempt passed a
function and the build failed on `/selling`'s export). With the media route blocked: `/selling`'s
mock tiles plain, `/buying` 0 placeholder captions.

### 2f. The walk itself
- First screens of 22 routes at 1440 and 390 (`scripts/_scratch-r68-shot.mjs`), looked at.
- 15 pages tiled down their length at 1440 (87 tiles) and 12 at 390 (111 tiles)
  (`scripts/_scratch-r68-tiles.mjs`), looked at tile by tile.
- 22 routes at 320: no horizontal overflow on any.
- Every dialog and overlay at 1440 and 390 (the round 60 probe): light-surface 0 inside each except
  the tour sheet's selected day (a white primary with dark text at 16.4:1, the known class), contrast
  0, small controls 0, the wizard reaching its fields.
- The light-surface scan over every route: 60 suspects, all the white primary buttons and the white
  status chips with dark text (16.4 to 18.7:1), the baseline class since round 60.
- The chat launcher and panel at both widths: the computed colours unchanged.
- /search as a visitor (`scripts/_scratch-r68-search.mjs`): see §3.
- Focus states (`verify-focus-paint.mjs` pointed at :3102): see §3.

## 3. Gates on the final build

- `npx tsc --noEmit` clean.
- `npx vitest run` in the foreground: 2,282 of 2,282, exit 0 (the floor was 2,277).
- `node scripts/qa-crawl.mjs http://127.0.0.1:3102`: ALL PASS (251 internal links, 390 no overflow,
  six county pages in-county).
- Focus paint and the /search walk: recorded below once run (§3a).

### 3a. Focus paint and the search walk
- **Focus paint** (`verify-focus-paint.mjs` is pinned to :3100; `scripts/_scratch-r68-focus.mjs` is the
  same file pointed at :3102): 421 focusable elements over 7 pages at 1440 and 322 at 390 paint a
  focus state; the one it reported as painting nothing, the credit line's "© OpenStreetMap
  contributors" link on the home page, had no focus style of its own (a hover underline only). The
  credit's anchors now underline and draw the 2 px ring on `:focus-visible` (commit on
  `MlGround.tsx`). The probe still reports that one link after the fix, so it was re-tested the way a
  visitor reaches it: Tab to the link on the production build and a pixel diff of the corner, 1,111
  of 9,000 pixels change when focus lands on either credit link (`scripts/_scratch-r68/verify/
  credit-focus.png`). The probe's reading there is the instrument (it measures an 81x44 box at the
  viewport's bottom edge where the link's own box is 158x14), not the page.
- **The search walk** (`scripts/_scratch-r68-search.mjs`): the bed minimum is a native `<select>`
  styled as a pill (`#f-beds`, options "Bed, 1+ Bed, 2+ Bed, 3+ Bed ..."); choosing 3+ writes
  `?bedsMin=3`, the pill reads "3+ Bed" and the count line becomes "7,658 homes in this map area ·
  showing 1-150" with the map's pins and the cards refreshed (looked at). At 390 "Filters" unfolds
  the six pills in place, no sheet. Nothing to fix.

## 4. Open after this round

1. **His pick on the green** (handoff R68 §1): unchanged. If a `r68-green2-preview` branch exists,
   it is the recommended `#0b1907` baked and re-rendered on top of this round's work, for his look
   on the real page beside `r68-preview` (today's green).
2. **The deploy** (handoff R68 §3): unchanged, on his word; this round's commits ride along.
3. The lead form could WORK without scripting behind an origin check (a security decision, his).
4. The eight design moves in §1, his calls.
5. The `<title>` tags' case, the CMA enumeration and raw MediaURL items, the preview-branch and
   scratch cleanup once the round is live (handoff R68 §4.5 to 4.8).

## 5. The green, rendered for his look (added at the close)

Baking round 67's recommended `#0b1907` into `NIGHT.wood` trips two laws of the night style in
`style.test.ts`: "carry no warmth: every colour is as blue as it is red (the listings' lights are the
only warm thing)" and the plate's "adds no hue" (blue 7 against red 11). The study had been
renderer-only, so it never met them. The nearest lawful hex is `#0a190a`: OKLCH L 0.195 (the same
darkness), chroma 0.036 against 0.040, hue 144 against 139; 0.005 from tile 2 in OKLab (under the
study's own invisible band of 0.006 to 0.008) and 0.013 from today's `#0c1810`. Tile 3's `#071a06`
breaks the same law (blue 6, red 7); its lawful neighbour is `#071a07`.

Branch `r68-green2` (`f81c5df`) bakes `#0a190a`, re-pins the six style fingerprints on purpose, drops
the `h3` study option, and `46e1f11` carries the ONE re-render (`scripts/_scratch-r68/rr.sh`, 68
minutes: 34 plates 25.8 MB, 96 clips 100 MB, both manifests unchanged, the grade's worst first/last
frame 0.64 levels against round 66's 0.60). On the rebuilt build: calibration 0.00 px at the hero,
Queens, Dutchess County and Putnam on both surfaces, the region 0.10 / 0.06; the walks 16 films / 0
fades on both. Against today's plates the pictures differ by a mean of 1.4 to 3.4 levels (p99 9 to
11; the Highlands 56 % of pixels over 2 levels, Dutchess 20 %): the quiet step round 67 described,
seen in the 1:1 pairs `scripts/_scratch-r68/green/pair-queens-1x.png` and `pair-dutchess-1x.png`
(Flushing Meadows and the Highlands woods a touch greener, nothing lighter). Pushed as
`r68-green2-preview`.

Two instrument notes. A calibration run while another job used the CPU read 40 to 147 px mean and
"common 85 of 470"; alone it read 0.00: never run the calibration beside anything. The phone walk on
the fresh green films read 4 to 6 frames over 34 ms at the Westchester stops where today's films
read 0 to 2 in the same probe (the maxima, 84 to 118 ms, are single frames at a flight's start on
both builds): possibly the file cache on files never read before; to be settled on the merged head
before any push.

## 6. His evening orders (2026-10-05): every park green, then deploy; and the MLS email

**His words:** "I saw today's green, but the park green didn't open ... not all the parks are green as
they should; some parks are gray or just dark when you get close; make similar green on all of them, and
then deploy." And: "check our MLS API, I got an email that it is stale."

**The preview that did not open** was my link: the predicted alias
`realtylt-website-git-r68-green2-preview-...` is 64 characters in its first DNS label, one over the cap,
so Vercel had shortened it to `realtylt-website-git-r68-green2-b4810c-levans-projects-a543d940.vercel.app`.
The deploy was READY the whole time. Lesson in memory (preview branch names of 17 characters or fewer
for this project, and read the alias from the deployment before handing out a link).

**The parks (one Opus builder, verified here; commit `2210bf6`; the builder's report at
`scripts/_scratch-r68/parks/REPORT.md`, the census at `census.md`).** The census found the cause: the
map painted only landcover grass/park (the four city parks) and the woods; cemeteries (481 of 484 screen
samples bare, Queens 143 of 143), golf courses (337 of 434), recreation grounds, pitches, the State
Parks (Rockefeller State Park Preserve 120 of 120 at the Westchester stop), nature reserves and state
forests were bare land, the "gray or just dark" he saw. Now every park-like class draws in the same
green token on the live style and every plate style: the `park` filter covers six grass subclasses
(park, garden, golf_course, recreation_ground, village_green, allotments), `park-landuse` adds cemetery,
pitch, playground, zoo and recreation_ground, `park-reserve` adds the State Park, County Park, national
park, nature reserve, forest reserve, conservation, wilderness and shore reserve classes. Left out, each
measured: lawns and open country (grass/grass, meadow, scrub, heath), campuses (school, university,
hospital: 10 to 39 % of samples on a building), the stadium, and the park-layer boundaries that enclose
towns or reservoirs (the Catskill Park's conservation_district, watershed_reserve, protected_area with
Kingston's downtown, historic districts, easements and hunting land): filling those would have changed
10.2 % of the Ulster frame against 3.2 % for the chosen list. Order unchanged (under the town fill and
the relief; only 8 of 1,785 city-park samples lie under a town fill). Proven on the rebuilt build: 4.0 to
7.1 % of pixels change at the five close cameras, 0 chosen-class samples remain bare, roads, water and
buildings unchanged; the pairs looked at here (`pair-queens.png`: the cemeteries beside Flushing Meadows
go green; `pair-westchester.png`: Rockefeller and the Sleepy Hollow course; `pair-dutchess.png`: the
Poughkeepsie cemetery and the west-bank preserves). Two things stay as they are, named for him: the hero
changes by 5.4 % (Delaware State Forest, the Water Gap, Jamaica Bay) because one rule everywhere avoids
a mid-flight fade; and the pale ridges (Hook Mountain, Breakneck) are the moonlit relief over a green
that is already there, a relief decision, not a missing fill. Tests: style.test.ts 37 of 37 (four new),
the six fingerprints re-pinned on purpose, full suite 2,286, tsc clean.

**The MLS email** was our own health watch (pg_cron at 23 past the hour -> `/api/cron/health-watch`),
not MLS Grid. The hourly sync's watermark stuck at 16:06Z: the 17:07, 18:07, 19:07 and 20:07Z runs each
ended `502 The operation was aborted due to timeout`, the 19:07 run also logging Supabase Storage `429
too_many_connections`. The 21:07Z run caught up on its own (3 pages, 1,338 rows, 680 upserted, 129
deactivated) and every run since was on time (22:07 to 01:07Z, 23 to 165 s). Credentials and the feed
were never the problem; the alert worked as designed. Open improvement: a DB write that times out
aborts the whole run; one retry with backoff would shorten such a stall. Memory
`infra-idx-sync-stall-too-many-connections`.

**The deploy** carries today's green (`#0c1810`) with every park in it; `r68-green2` (the quieter
`#0a190a`) stays a preview he can ask for later. The render and the gates: §7.

## 7. The render and the gates before the deploy (2026-10-05, 21:52 to 23:35 ET)

The one re-render on the parks build (`bash scripts/_scratch-r68/rr.sh`, 75 minutes, logs under
`scripts/_scratch-r68/`): 34 plates shot deep and encoded (25.7 MB), 32 pairs of flights shot both
aspects, graded (first and last frames against their plates: worst mean 0.61 levels; round 66's worst
0.60) and encoded (96 clips, 100 MB); `plates.gen.ts` and `flights.gen.ts` unchanged (line endings only).

Gates on the rebuilt build, the calibration run ALONE (a first laptop run beside nothing else still read
"common 164 of 470, mean 16 px" on the fresh files; the second read 0.00: the probe's settle on files
never read before, the same as this morning's lesson):

| gate | result |
|---|---|
| calibration laptop (hero, Queens, Dutchess County, Putnam) | 0.00 px mean, p95, max (Dutchess County 0.51 once, 0.00 on two re-runs alone) |
| calibration phone | 0.00 px at all four |
| calibration region | 0.10 px laptop, 0.06 phone (as every round since 58) |
| walks | laptop 16 films / 0 fades, 1 frame over 34 ms; phone 16 / 0, 6 frames over 34 ms (today's baseline 1 and 2 to 4; the maxima are single frames at a flight's start on both builds) |
| phone contrast kit, seven stops | 0 under the floor at p95; p99 the known single-lamp class only |
| crawler `qa-crawl.mjs` | ALL PASS (251 links, no overflow at 390, six county pages in-county) |
| `npx tsc --noEmit` | clean |
| `npx vitest run` (foreground) | 2,286 of 2,286, exit 0 (floor 2,282) |

Then: `origin/main` confirmed at `e2507d9`, the pictures in ONE commit, the docs, and the push of the
branch head to `main` (a public deploy of realtylt.com); the live verification in §8.

## 8. Live (2026-10-05, 23:19 ET push; verified 23:50 ET in a real browser)

`origin/main` carried one commit the branch already had by content (`e2507d9`, the geocoded-null fix,
the branch's `a61994b`); merged (`48e8cb4`, no code change, tsc clean, vitest 2,286) and pushed to
`main`. Vercel production `dpl_EyYYMFPuDzdYKSW8msuP7W7JSQac` on `48e8cb4`. `scripts/_scratch-r68-live.mjs`
against https://realtylt.com, 26 of 28 checks pass and the two "fails" are the instrument (it looked for
a literal `/logo-realtylt-navy.png` request; the logo is served through Next's optimizer as
`/_next/image?url=%2Flogo-realtylt-navy.png`, decoded 384 x 79, confirmed by hand):

- a regenerated home page (RSC `["","index"]`, age 273 s) with the header and footer;
- 1440 and 390: status 200, indexable (no robots header), the plates ground, the plate revealed and
  the lights drawn (475 / 258), the lights fetched once, the hero plate requested (2880 avif / 1170
  avif), the first stop reached after a scroll with a film fetched (`hero--dutchess-wide-1440.webm` /
  `hero--dutchess-tall-1170.mp4`), CSP silent, no page errors;
- **the served Queens plate is byte-equal to the parks render** (sha256 `ccd8f4594af8...` live and
  local), a film served (200, 464 KB);
- /search 200 with 150 card links, a listing page with its lead card, /connect with the booking mount.

`r68-preview` re-pointed to the same head; `r68-green2` is behind main (its fingerprints would need
re-taking on the head if the quieter green is ever wanted).
