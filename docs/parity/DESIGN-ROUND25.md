# Design round 25 — the assessment, and what it changed

Written after looking at every main surface at 1440 and 390 on production, and after the
round-24 work was re-verified (all six probes hold; see the checkpoint). The site is good. This
is about the gap between good and considered.

## What already reads luxury

- **The restraint is real and it is systematised.** One display face (Newsreader) used only for
  headlines, one body face (Lato), a palette that is black, white, `#f3f5f8` mist and one stone
  grey, plus the logo's navy and azure held back for accents. Three shadow steps in one hue,
  with the reasoning for each written in `globals.css`. Two hairline weights, chosen because
  seventeen near-identical greys were found and killed. This is a system, not a theme.
- **The search surface earns its complexity.** The one-row filter bar, the price pills over
  count-free dots, the count line in light numerals reading "15,195 homes in this map area" —
  that is a dense product surface that still feels calm.
- **The listing detail page is the best-composed page on the site.** The sub-nav, the price and
  the estimate under it, `STATUS / ON SITE` as a labelled pair, and the tour panel as the one
  raised object all sit in a clear hierarchy.
- **The selling hero is the best hero.** Asymmetric, headline left and a dark form panel right,
  with a real job on both sides.

## What reads generic, ranked by leverage

1. **The agent's own photograph was rendered two different ways.** *(fixed)* One file,
   `/images/levan-portrait.jpg`, is used on five surfaces and only `who-we-are` desaturated it.
   So the face of the brand appeared in colour on the blog author card, the listing tour panel,
   the service lead panel and `/connect` — the last of these a few hundred pixels from its own
   greyscale copy in the booking panel. On a site where every hero photograph is greyscale, the
   colour version is the outlier, and it is also the weaker image: flash-lit, beige cast. Now
   greyscale on all five, held by `components/agent-portrait.test.ts`.
2. **The `/home-value` hero promised nothing.** *(fixed)* "Join the homeowners across the Hudson
   Valley and NYC in finding your home's value" is a fragment left behind when an unverifiable
   count was correctly stripped out of a template. It was the first sentence under the biggest
   headline on a lead-capture page. Replaced with what the page actually does, taken from its own
   three steps: "Fifteen comparable sales, read by a person. Usually back within a day."
3. **The booking calendar was cut off on a phone.** *(fixed)* The iframe was a flat 899px at
   every width. Measured against the embed itself, it needs 1031px at 390 (the three appointment
   cards stack) and 900px from 768 up, so the third card was sliced mid-sentence. It does scroll
   internally, but a nested scroller is a bad way to discover a card exists.
4. **The selling trust row orphaned its third item.** *(fixed)* At 390 the three items measure
   ~423px against 358px of usable width, so one always wrapped and "Free Consultation" landed
   alone on line two looking like a mistake. The rating now takes the full row below `sm`, which
   makes the break a decision: rating, then both claims together.
5. **The map's default frame is mostly not the market.** *(recommended, not taken)* `/search`
   opens fitted to the extent of the seed pins, and because the market is a north-south corridor
   (Hudson Valley plus NYC) squeezed into a wide panel, the opening view runs from Albany to
   Philadelphia to Hartford. The pins occupy roughly a quarter of the most expensive surface on
   the site; the rest is Pennsylvania and Connecticut, where there is no inventory. The obvious
   fix — fit to a percentile of the pins rather than their extremes — is **not** a pure design
   change: the grid is viewport-scoped, so cropping outliers changes the headline count from
   15,195 to something smaller. That is the owner's number to move, and round 24 built and
   verified the viewport-scope contract deliberately. Wants a decision, not a patch.
6. **The Google review badge is the only colour on the site.** *(recommended, not taken)* On
   `/selling`, a full-colour Google wordmark and gold stars sit in an otherwise strictly
   monochrome composition, and at 390 they are the loudest thing above the fold. Google publishes
   an all-white logo variant for dark backgrounds, which this hero is, and that would be both
   permitted and far more elegant. Left alone because recolouring a third-party mark is a brand
   compliance question rather than a taste one, and it should be answered before it is shipped.
7. **Three hero grammars across seven pages.** *(observation)* Home is left-aligned and full
   bleed; buying and home-value are centred and full height; who-we-are and connect are short
   centred banners; selling is the asymmetric one. Each is defensible alone. Together they mean
   the site does not have a hero language, and the strongest of them (selling) is the one used
   least. Worth a deliberate choice in a future round rather than a sweep now.

## What was suspected and disproved

**Small print on the dark hero photos fails AA.** It does not. This looked obviously true —
12px white at 60% opacity over near-black photography on `/buying` and `/selling` — and the
first probe written to check it agreed, reporting 24 failures. Every one was the instrument:

- Tailwind's `/85` opacity computes to `oklab(...)`, and pulling numbers out of that string with
  a regex read white as near-black, scoring white hero text at 1.00:1 against a dark photo.
- Translucent text was scored as though it were opaque.
- Sampling the bounding box caught borders: it scored the nav's `#6f6f6f` "Connect" at 1.20:1
  when the token file documents 5.02:1 on white.

`scripts/verify-hero-contrast.mjs` was rewritten to resolve colour through a canvas, composite
alpha over the measured background, and read background pixels **only where the glyphs actually
paint** (by diffing a shot with the text against one without it). It now reports 173 painted text
runs across 8 pages, zero below floor, and it was made to fail on demand first — an injected
dark-on-dark headline scores 1.28:1 against a floor of 3, injected 10%-alpha small print scores
1.27:1 against 4.5. The hero small print needs no work.

Also disproved: the top of the search grid is **not** full of "Photograph coming soon" cards.
That is what the first screenshot showed, but the probe had capped media requests at 80 and the
home page had already spent the budget. With media allowed, all eight cards load real images.
Only 7.4% of active listings (1,478 of 20,086) have no servable photo.

## The standing note on instruments

Five separate measurements lied in this round's first hour, in both directions: a media cap
invented missing photos, a `fullPage` screenshot invented blank bands and a stat row of zeroes
(the real page is 7,529px, not the 15,058px it stitched, and the counters read 11 / 24h / 100+ /
7 when actually scrolled), `curl -I` reported `no-cache` on objects that serve a year-long cache
to a GET, a regex read `oklab()` white as black, and a dev-only Next.js indicator looked like a
stray floating button on four mobile screenshots. Nothing here was believed until it was
measured twice by different means.
