# Round 55, phase 3: the scene answers the visitor (interactions)

The owner: "make it a little bit more interactive ... lights and more interactions and whatever
else could be added ... make it wow like our AI page." The rule from round 54 stands: every
interaction is an optional layer on a page that already works with JavaScript off, no WebGL and
reduced motion; nothing hijacks scrolling; no sound; warm white only and every glow has a source.

Ranked by wow per effort. Build 1, 2 and 3 in that order, each behind its own commit with frames;
4 and 5 only if 1 to 3 land clean.

## 1. Hover a listing card, its home answers in the scene

Every card on the home page carries the listing's `lat` and `lng` (`lib/idx/types.ts`, the
`Listing` type). On `pointerenter` (mouse only, like the lantern) and on `focus-visible`, the rail
calls a new handle method `setHighlight({ lng, lat } | null)`:
- the scene finds the nearest listing light (the light cloud already has world positions; a
  linear scan of 15k points is under 1 ms, or reuse the town-picking structure), and raises a
  **thin vertical beam** from that light: a short line or two-triangle quad in world space, a
  few hundred metres tall, warm white, fading up, plus the light's own gain lifted for the hover
  (a uniform `uHighlight` index and mix, eased 120 ms in, 300 ms out, in `step()` like the focus
  ease; no per-frame allocation).
- the camera does NOT move (the beam is enough; moving the camera under a hover reads as jitter).
- on a phone there is no hover; a tap goes to the listing as today.
- reduced motion: the beam appears without the ease.
- the beam must be visible through the veil at the featured section's veil level (0.74 on a
  laptop): measure its contrast against the veiled scene; if it drowns, lift only the beam above
  the veil (draw order after the veil, or exempt it in the shader).
Gate: hover any of the 12 featured cards at 1440 and see the right home rise in the scene (frames
for three cards, before/after); no frame over 16 ms while hovering along the row; tests for the
nearest-light search and the highlight easing.

## 2. Open a listing: the camera flies to the home first

A click on a card (mouse or keyboard) on the home page: prevent the default for up to 900 ms,
`flyTo` a new close framing over that home (a `framingFor` built from the light's world position,
the way `areaShot` builds county framings, at the harbour shot's altitude scaled down), then
`router.push` the listing URL. If the flight cannot start (reduced motion, no WebGL, the scene not
ready, a modifier key or middle click) navigate immediately. The listing page itself is a day
page and stays byte-identical. Coming back (`popstate`) the page restores its scroll and the
driver puts the camera where the scroll says; no fly-out is needed to feel right, and one would
fight the browser's back-forward cache.
Gate: the flight reads as a single motion into the home and the page changes at its end (a
walkthrough video, 1440 and 390); keyboard activation works; `/api/lead` untouched; no regression
in the round-53 Recent/Saved flows.

## 3. Click-to-fly on the area index, and the lantern names neighbourhoods

- The "Where we work" rows already `point()` the chapter on hover/focus (`useAreaChapter`). Add a
  click on a phone (no hover there): the first tap flies, the second opens the county page; the
  row says so for a screen reader (`aria-describedby`).
- The lantern over the hero names towns from `townCentroids`. The boroughs' neighbourhoods
  (Astoria, Riverdale, Park Slope ...) come from the same feed field if the listings carry one
  (`neighborhood`/`subdivision`; check `lib/idx/types.ts` and the packed payload), otherwise skip
  this half; do not invent a gazetteer.
Gate: frames on a phone at 390 for the two-tap flow; the town/neighbourhood label never overlaps
the headline or the search instrument (quiet boxes).

## 4. Drag to orbit in the hero (mouse), tilt on a phone (opt-in)

Pointer drag on the hero's lantern surface rotates the establishing shot's camera around its
target by up to ±18 degrees of azimuth and ±6 degrees of elevation, spring-returning on release
(the parallax `par` already exists; this is the same idea with a larger, gesture-driven range).
On a phone, only if `DeviceOrientationEvent` permission is granted after a tap on a small "tilt"
control (iOS requires the request from a gesture); default off; reduced motion off. The scroll
driver keeps ownership the moment the visitor scrolls (the override clears on the first scroll
event, like `point(null)`).
Gate: 60 fps during the drag at 1440 (headed probe with a synthetic drag), the search instrument
and headline never move, keyboard and touch scrolling unaffected.

## 5. "New today" lights switch on when the page opens

The lights payload does not carry listing dates; add a second packed array (`ageDays` per point,
one byte) to `/api/lights` (the static route, still one DB read an hour) and have the intro run
the newest lights on LAST, a beat after the rest, with a brief brighter flicker (the `uTwinkle`
path exists). Subtle: a visitor should feel that something just arrived, not read a legend.
Gate: payload growth under 20 KB; intro timing unchanged for the poster dissolve.

## Not doing
Sound; a compass or mini-map (nothing on the page needs one: the lantern and the chapter names
already say where you are); price or days-on-market as light colour (a second colour breaks the
black-and-white rule and would need a legend).
