# Round 66: his real logo, darker water, the land and the greys, the parks study, the geocoding check (2026-10-04)

The orchestrator's record, written before any builder starts. Team as he set it on 2026-10-04: Fable 5.1
orchestrates, Haiku scouts, Opus 5.5 builders one subagent at a time; a preview to him (`r66-preview`)
before anything reaches `main`.

## 0. His verdict on round 65 (2026-10-04, a voice note, lightly cleaned; this IS the brief)

"I like a. But let's bring my actual logo back, whatever colour it has. Make the water a little bit darker
blue. I think it needs more polish on the grey areas and some other details. I'm not sure about adding a
little green in the park areas: show me with a very dark green that would blend in there; if not, continue
with the greyish, blurred area. It's good, we're going great, but maybe more polish. Also check on the
geocoding: if the properties are almost the same, whatever ratio we have, and on the zoom when you get
closer, if it adds up. And whatever else is left: the titles or the font and similar work. Orchestrator:
you; Haiku; and Opus builders, one subagent at a time."

What that decides:
- **Framing: today's cameras on both surfaces** (preview a). W10, T1 and T2 are rejected; the "Staten
  Island at 1920x940" question is moot. The look of round 65 stands: palette P1 land, greys G3, Schibsted
  Grotesk, a film on every scroll, the sweep.
- **The logo goes back to his own colours.** His file (`public/logo-realtylt.png`, 5670x1167) is the navy
  wordmark and frame `#0e2d52` with the R mark and the Y's stroke in `#27a7df`. The navy is 1.5:1 on the
  night ground (`#131417`), which he half expected on 09-30 ("I don't know if it's gonna show"). He sees
  the options rendered on the real header before one ships (section 6).
- **Water a step darker** than P1's `#071a3d`. Round 65 recorded P3 `#061534` as the calmer fallback.
- **Parks: a study**, very dark green against the grey, on the real page; his criterion is "blend in".
- **The land and the greys: polish.** Read as the map's land (his "greyish, blurred area") first, the
  site's grey surfaces second; both get a pass.
- **Geocoding checked end to end** (section 1b), then the second geocoder pass.
- **The leftover calls, as recommended on 10-04 and not contested:** blog titles to sentence case; /ai keeps
  Bricolage for now; the home testimonial keeps Newsreader italic.

## 1. Measured before the builders (2026-10-04)

### 1a. The palette and the code (a Haiku scout's map, the load-bearing lines re-read by the orchestrator)

- **The map palette** is round 65's P1, baked in `components/home/ml/style.ts` (NIGHT ~35-51, PLATE ~93-98,
  ROADS ~65-71, PLATE_ROADS ~82-88): land `#151922`, town `#1d2330`, wood and park `#0f1319`, water
  `#071a3d`, stream `#12325f`, buildings `#12151c`/`#1c212b`, horizon `#151b27`, fog `#0e1118`, plate town
  `#1f2636`, plate buildings `#1e2530`/`#2a3240`, hillshade highlight 0.38 and exaggeration 0.7, road alphas
  0.20 to 0.40 live and +0.14 on the plates. The study option (`?pal=`) was wired in ef678e6 and removed in
  5bb8b93; `style.test.ts` pins the served style documents byte for byte, so a restored option must be inert
  without its parameter.
- **The baked pictures:** `public/plates` 25 MB, `public/flights` 95 MB, made by `scripts/make-plates.mjs`
  and `scripts/make-flights.mjs` against the production build on :3102 (`scripts/_scratch-r62-rebuild.ps1`),
  two to four hours for the set. The hero at today's laptop camera is applied (4d794ac: the preview-a-wide
  variant, the range test at 110.8 km); every plate and film is re-rendered once more after this round's
  palette decision.
- **The lights** (`lib/idx/db.ts` getLightRows, ~1004-1022): the rows a default /search calls active and
  for sale (the served counties, the $10k floor, rentals excluded, status Active), the same set the hero
  counts (getActiveSaleCount), fetched in pages up to 30,000 rows (MAX_PINS x 2, so the ~15,700 are all
  read); only `geocoded = true` rows become lights (`lib/idx/lights.ts`). The budget
  (`components/home/g3d/cameras.ts`): MAX_LIGHTS 2,400 at the territory (his approved scatter), rising as a
  power of the range below CLOSE_FROM 24 km to 3x at CLOSE_AT 12 km, where the GAP limits instead: 9 px on
  the laptop (CLOSE_GAP), 11 px on a phone (FINGER_CLOSE_GAP), easing to 14 px at 24 km, 12 px at the
  territory. So at a county or borough plate the lights are as many as fit at 9 or 11 px, not every home:
  round 65 counted Queens at 356 (phone) against about 5,000 in view. Every light is a listing; whether
  every listing is a light at the close zoom is the question of section 1b.
- **The geocoder:** the U.S. Census Bureau's batch geocoder (free, keyless) runs inside the hourly sync
  (`lib/idx/geocode-runner.ts`, `lib/idx/geocode.mjs`; candidates from `listPendingGeocodes`: `geocoded`
  null AND no `geocodeTried` marker). Nothing writes `idx_geocodes` but the secret-gated
  `idx_geocode_apply` RPC, which stores the hit and projects it onto the row; `idx_sync_apply` merges
  `idx_geocodes` over every later upsert. A home census cannot place gets the `geocodeTried` marker and
  is never re-asked by the sync. `scripts/backfill-geocodes.mjs --retry` re-asks; its `--google` mode asks
  Google for the rest and accepts ROOFTOP and RANGE_INTERPOLATED only, with the key named
  `GOOGLE_MAPS_API_KEY` (falling back to the browser key, which since the 09-26 split is locked to
  referrers and will not serve a script). The last Google pass wrote on 2026-08-15, before the split.
- **The logo:** `components/Header.tsx` (~182) and `components/Footer.tsx` (~60) serve
  `public/logo-realtylt-night.png`, whose wordmark 1baf57e recoloured to the mark's `#27a7df` (before that,
  `#e8eef6`). `public/logo-realtylt.png` is his file: navy `#0e2d52` wordmark, frame and the T, the R
  mark and the Y's stroke in `#27a7df`. `scripts/_scratch-r65/logo-mock.mjs` recolours the night file's
  light pixels and composites it on header screenshots.
- **The blog titles:** 58 posts in `content/blog/*.ts` (`title:` fields), rendered by
  `app/blog/[slug]/page.tsx` as the h1 and the page title; `app/sentence-case.test.ts` (round 63) covers
  the pages' headings and labels and leaves the post titles alone.

### 1b. The geocoding, measured on the live database (2026-10-04 12:30 UTC, read-only queries)

| what | count |
|---|---|
| `idx_listings` rows with `is_active` | 27,182 (Active, Pending and Coming Soon; Residential, Rental, Multi-Family, Commercial, Land) |
| `geocoded` true | 26,335 |
| `geocoded` null (tried, not placed; hidden from the map since a61994b / e2507d9) | 847 |
| `geocoded` false | 0 |
| `lat` null | 0 (the sync writes a zip-centre lat/lng for every row; that is the square he saw) |
| null with NO `idx_geocodes` row | 830 |
| null WITH an `idx_geocodes` row | 17 (to understand: a row the packer still skips) |

Geocode sources in `idx_geocodes` (37,012 rows): census Exact 31,890 (22,686 active), census Non_Exact
3,920 (2,821 active), google ROOFTOP 1,041 (719 active), google RANGE_INTERPOLATED 161 (126 active). The
census pass runs with the sync (114 rows in the last 24 h, 1,471 in 7 days); the google pass last wrote
on 2026-08-15. So every home that census could not place since mid-August has had no second try.

The unplaced by type: Land 339 of 847 (40 %), Residential 358, Rental 83, Commercial 46, Multi-Family 21.
The clusters: Newburgh 12550 (44), Slate Hill 10973 (22), Carmel 10512 (21), Middletown 10940 (17),
Poughkeepsie 12603 (16), Flushing 11354 (16). A random sample of fourteen addresses: lots with no number
("Walnut Street", "Lot 13 Sachem Way", "Pine Road & Pepperidge Road", "County Hwy 60", "tbd Lake Shore
Drive"), Queens hyphenated numbers with a unit ("71-32 Little Neck Parkway #148B"), and new subdivisions
census does not know ("8 Black Gum Court, Newburgh", "2055 Summit Loop #95, Carmel").

Per county, unplaced of active: Ulster 120 of 1,064 (11.3 %), Orange 216 of 2,809 (7.7 %), Dutchess 157 of
2,050 (7.7 %), Rockland 58 of 1,573 (3.7 %), Putnam 39 of 648 (6.0 %), Westchester 127 of 4,589 (2.8 %),
Queens 104 of 9,670 (1.1 %), Bronx 14, Brooklyn 6, Manhattan 3, Staten Island 3. The valley is where the
map is thinnest and where the gap is largest.

What "it adds up" means, to be measured on the code (section 1a): which rows the hero's count and the
lights share (the count read 15,698 against 27,182 active rows, so the lights are a defined subset); and at
the county plates, how many of a county's placed homes are drawn under the spacing budget (round 65 §12:
Queens 356 lights at the phone plate). Every light is a listing; whether every listing is a light at the
close zoom is the question he is asking.

## 2. The assessment (the first screens of preview a at 1440x900 and 390x844, looked at again today)

What already reads as considered: the one idea (the territory at night, every home a lamp); the lifted land
with the road grid as a fine engraving; the blue water giving the land its shape; Schibsted calm at body
size and plain at display size; the county names in the map's own type; the boxed links; no colour but the
lamps, the water and one blue mark.

What reads as less than it could, in the order he will notice:
1. **The water is the loudest thing on the laptop screen.** At 1440 the Hudson, the Sound and the harbour
   are a bright ribbon against a grey land; round 65's own record says P1's water is "about level with the
   land in luminance and clearly blue". His "a little darker" is the right call: the water should sit a
   half-step under the land so the lamps and the words lead and the water reads as depth, not as a shape.
2. **The land is a flat grey wash.** At 110 km the relief (hillshade 0.38 / 0.7) barely shows; the hills,
   the built-up grids and the open land are one grey. "The greyish, blurred area" is his read of exactly
   that. The polish he asks for is definition, not brightness: relief up, the built-up fills a step.
3. **The parks are grey-blue patches** (`#0f1319`) that read as nothing. Either they take a hue so dark
   that a park is a shape and not a blotch (a green at the land's luminance), or they stay the land's grey.
   His criterion is "blend in"; the 1:1 crop decides, not the sheet.
4. **The wordmark in the mark's cyan is a second voice** beside the lamps and the R mark. His own navy
   (`#0e2d52`) is 1.5:1 on the night ground, so this is a legibility question before a taste one: the
   nearest navy that reads, his exact file where a light ground exists, and both shown to him.
5. **The honesty of the lamps at the close plates.** The hero promises "every light is one of them"; at
   Queens a phone draws 356 of about 5,000 in view. True, and not the whole truth; he is asking.
6. The site's grey surfaces (G3) are right as values; what a walkthrough must check is where the tokens
   meet (the legal strip's sink, the field wells, the cards on the raised ground) and the first screen's
   rhythm after the font swap.

## 3. The moves, ranked by what he will see

1. Water a half-step under the land (the `w2` class, the stream with it), chosen from the rendered steps.
2. The land's definition: the relief up (`l1`); the built-up fills a step (`l2`) if the road-over-land
   contrast holds at the Queens grid.
3. Parks: a dark green at the land's luminance IF the 1:1 crop shows a hue without a patch; else grey stays
   and the record says why. Both go on his sheet.
4. The logo in his colours: the night wordmark as the nearest navy at or above 4.5:1 that still reads as
   his navy (not the mark's cyan), his exact file composited on a light plate shown beside it, the real
   file on any light ground the site has (print, the share card already). He sees the sheet.
5. The geocoding: a one-off Google pass over the 847 (ROOFTOP and RANGE_INTERPOLATED only, through the
   existing script and RPC), then the ratio per county at the territory and at every close plate on both
   surfaces, written into this record; a copy decision for the county chapters once the numbers are in.
6. The blog titles to sentence case (57 posts; proper nouns, places and acronyms kept; the page titles
   follow).
7. The polish walkthrough after the re-render: every page at 1440, 390 and 320 with fresh eyes, the
   tokens' meeting points, the first screen's rhythm, the films' first frames against the new plates.
8. The gate, the `r66-preview` branch, the sheets for him; nothing on `main`.

## 4. The order and why

The re-render of every plate and film is about two hours of machine time and follows EVERY palette decision
(water, parks, land), so: studies first on the real page with the renderer's study option, his criteria
applied, ONE re-render, then the logo (code and one PNG), the geocoding pass (data), the titles (content),
the polish walkthrough, the gate, the preview.

## 5. What is deliberately not changed

The cameras (his "I like a"), the lamps (round 59), the county-name type on the map, sentence case, the
boxed CTAs, the search strip, the credit, the chat launcher, Schibsted Grotesk, the G3 tokens' structure
(values may move a step under "polish"), security, consent, CSP, RLS, the MLS sync, the lead path.

## 6. Decisions taken by the orchestrator

### 6a. The look (2026-10-04, from builder 1's studies on the real page; sheets and crops under `scripts/_scratch-r66/look/sheets/`, the numbers in `scripts/_scratch-r66/look/tables.md` and `measure.json`)

Builder 1 restored the renderer-only `?pal=` option (e37bc0d, inert without its parameter: the four
pinned style fingerprints hold, 32 of 32 in `style.test.ts`), proved the pipeline reproduces today's
plates (the w0 control decodes to the shipped plates within 0.00 to 0.80 levels), and rendered every
study as hero, Queens, Dutchess and the Highlands' second stop at both aspects, composed on the real
page at `/?film=0` with the page's own lights and names (84 composites, one server state), with the
round-57l contrast kit run on each. Three findings bind:

1. **The plate style's park layer drew nothing.** Its filter was `class == "park"`, and no feature in the
   Queens, Manhattan, Brooklyn, Dutchess or Highlands views carries that class (0 rendered features in all
   five), so Central Park, Flushing Meadows, Forest Park and Prospect Park were dark only because they are
   not "town" land. A park colour alone reaches only the forests (landcover wood: 1.8 % of the Queens
   laptop plate, 5.3 % on the phone). The borough parks need the layer to read landcover `grass`/`park`
   (OSM leisure=park): builder 1's extra `g2p`. The live style (the hero, and the films are recorded from
   it) has no park layer either; both styles get the same fill so a film agrees with the plate it lands on.
2. **The Dutchess camera holds almost no wood** (1.1 % laptop, 1.8 % phone); the state land is in the
   Highlands' frame (53 % / 60 % of the plate). So the parks study was judged on the Highlands (forest
   against Beacon) and on Flushing Meadows, at 1:1.
3. **w1 cannot be told from w2** (0.007 in OKLab; the other steps 0.018 to 0.020). A step he is meant to
   see must be at least about 0.02 OKLab from its neighbour; the extra `w1b` (`#061838`, today darkened
   14 % with its hue kept) is the honest half step.

The picks, each against his words:

- **Water: w2** `#061534` (stream `#0f2a55`): "a little bit darker blue". The only named step darker
  enough to see (0.023 from today) while plainly blue (OKLCH chroma 0.065, hue 262; water-to-land
  luminance 0.57 against 0.74 today); the phone's lower third calms; no text moves (the hero words stay
  at 12.6 to 14.0 on the phone, 15.0 on the laptop). w3 (`#05122c`) goes on his sheet as the louder
  step; w1 is dropped (indistinguishable); w1b is kept in the record as the gentle step he could ask for.
- **Parks: g2p**: woods `#0c1810` and the borough parks from landcover grass/park at the same value:
  "a very dark green that would blend in there". g2 keeps the forest a step under the land (1.06 to 1.10
  against the land within 24 px; today 1.09 to 1.13) with a quiet hue, so it still reads as his "greyish,
  blurred area"; the 1:1 crop of Flushing Meadows reads as a park, not a patch. g1 and g3 flatten the
  forest to the land and read green rather than blending (g3 adds 4.7 grey levels to the Highlands
  plate). Grey (g0) goes on his sheet beside it; his "if not" is one re-render away and the record says
  so plainly.
- **Land: l1** (hillshade highlight 0.50, exaggeration 0.9, both styles): "more polish on the grey
  areas". The hills read (the land's 90th-over-10th luminance spread: Dutchess 2.57 to 4.24, the
  Highlands 3.62 to 5.42, the hero 2.01 to 2.52) and the Queens road-over-land contrast holds (2.33 /
  2.80). l2 (the built-up fills a step up) is rejected: the roads lose contrast (2.25 / 2.72), its lift
  barely shows, and it pushes a phone text further under the floor. l1's one cost: at the Dutchess stop
  at 390 the paragraph "Selling gets real comps..." reads 4.02 (4.59 today; floor 4.5), so it gets its
  own ink step before the bake, re-measured.
- An instrument note: at 1440 the "AI" and "Connect" header pills read 1.13 in every study and in the
  control; each outlined pill's own border falls inside the measured box. Not a map effect.

Then ONE re-render of every plate and film with the three picks baked (the `?pal=` option removed, the
fingerprints re-pinned on purpose), run by the orchestrator as a background process so the box stays
free for the next builder.

### 6b. The geocoding and the titles (builder 2, 2026-10-04; the orchestrator's calls)

**The pipeline, as read:** a row is "tried, not placed" when `geocoded` is null and `listing.geocodeTried`
carries the stamp `idx_geocode_apply` writes for a miss; the hourly pass never re-asks a stamped row,
`--retry` asks every active null row. An address goes to the Census as written, with one second ask
without its unit; the gate accepts a point inside the territory and within 15 km of the stored zip's
centroid (Exact and Non_Exact alike), and Google answers only at ROOFTOP or RANGE_INTERPOLATED. The 17
null rows that already held a geocode fail the address-key condition (the geocode was measured for an
address or zip the feed has since changed; in at least seven the old answer was a different place), which
is the rule working as meant.

**The 847, classified:** no house number 360 (bare road 262, tbd 42, "Lot N" 33, number 0 15,
intersections 5, unit only 3); numbered and missed 273; unit suffix 131; Queens hyphenated numbers 70;
ranges 9; "Lot N" plus a number 4. Read-only experiments on the misses: the Queens hyphen restored placed
33 of 38, all on the same house and street; a unit list written with "/" placed 1; the numberless streets
0 of 360, the ranges' first number 0 of 9, "Lot N" stripped 0 of 4, asking without the city or the zip
placed wrong towns (Sunset Lane, New Hampton to East Hampton, 193 km).

**Done (04e516a):** `retryStreet(address, zip)` builds the second ask: the unit off, and in a Queens zip a
4-to-5-digit number gets its hyphen back; `withoutUnit` accepts "/" in a unit token; the acceptance rule
unchanged; eight tests. The real `--retry` wrote 45 placements through the RPC (Queens hyphen 35, unit 5,
numbered 5; Exact 41, Non_Exact 4) and re-stamped 790. Headline: `geocoded` true 26,336 to 26,381, null
847 to 802. In the lights' scope (Active, for sale, the $10k floor): 15,039 of 15,608 placed, 96.4 %;
Queens 5,594 of 5,644 (99.1 %), the Bronx 99.1 %, Brooklyn 99.5 %, Manhattan 99.4 %, Staten Island
97.2 %, Rockland 96.9 %, Westchester 96.1 %, Putnam 94.5 %, Orange 90.8 %, Dutchess 89.7 %, Ulster
88.9 %. The valley's gap is the numberless land lots (309 of the 360 are Land).

**The orchestrator wired the same second ask into the hourly sync's geocode step** (the two calls in
`app/api/cron/idx-sync/route.ts`, off-limits to a builder; no MLS call is touched), so a new Queens
listing gets its hyphen retry every tick instead of waiting for a one-off run.

**What is left, sized for his Google pass (blocked: `GOOGLE_MAPS_API_KEY` is not on this box and the
Vercel connector cannot list the CRM's variables):** 430 numbered rows a ROOFTOP or RANGE_INTERPOLATED
answer could place (278 in the lights' scope), 12 the gate rejects on a zip typo in the feed, 360 with no
house number that no geocoder places at building grade. Cost at the script's own estimate: about $4 for
the 802 (`node scripts/backfill-geocodes.mjs --google --retry` once the key is in `.env.local`; without a
server key the script falls back to the referrer-locked browser key and would re-stamp every row
placing nothing). Round 30's Google pass placed 56 % of what it asked; about 240 of the 430 is a guess,
not a measurement.

**Two rule changes NOT made, for a later call:** (1) a Non_Exact census answer can land on the wrong
street (KEY1041042 "50 North Broadway #6H, White Plains" placed at "50 S Broadway"): a check that the
matched street's directional and name agree with the ask would refuse it; (2) the 12 gate rejections are
the right building against a zip typo (12545 vs 12546, 11023 vs 10023 and the like) or five Kingston
homes 15.1 to 16.5 km from the 12401 centroid; measuring against the matched zip when the city agrees
would place about ten. Both are agent-executable in `lib/idx/geocode.mjs` `rejectReason` with tests.
Also found: 21 active rows sit at 0,0 in `idx_listings` (none geocoded, all hidden).

**"Does it add up" at the close zoom** is measured after the re-render (section 6c).

**The titles (aec7e67):** the 57 post titles in `content/blog/posts.ts` to sentence case by hand (names,
places, months, acronyms and I kept; the first word after a "?" or a quoted question capitalised; after a
colon lowercase, as the posts' own headings are); every surface reads the one field (the post h1, og and
twitter titles, the image alt, the share row, the related cards, the index cards, RelatedPosts, the JSON-LD
headline and breadcrumb, the directory that feeds /sitemap and llms.txt), so nothing else changed;
`content/blog/titles.test.ts` fails a Title Case title under an explicit allowlist (red before, green
after). Kept as they were, on purpose: the `<title>` tags (`seoTitle`; round 63 ruled page titles are not
headings and `app/sentence-case.test.ts` pins that), and the one CRM-authored post in `blog_posts`
("Hudson Valley Market Check-In: ...", a database row the CRM owns).

