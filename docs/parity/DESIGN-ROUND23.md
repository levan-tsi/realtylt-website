# Design round 23 — the map becomes the instrument

Owner's brief, distilled: make the /search map behave like Zillow's, make the list agree with
the map, let the map take more of the page, and research (not copy) Zillow's side rail. This doc
carries the reasoning; the commits carry the diffs.

## 1. The marker language: price pills + dots, no count circles

**Measured today on production at 1440×900** (scripts/_scratch-r23-mapratio.mjs): default frame
renders 14 price chips + 10 cluster bubbles; one wheel zoom in (the moment the viewport fetch
takes over) it becomes **6 chips against 96 count bubbles**. That is the owner's complaint,
reproduced: the map answers "how many" when the visitor asked "how much".

**What Zillow renders** (one light look before its human-check gate; behavior also described in
the owner's own words, which match): exactly **two marker kinds** —

- a **price pill** for as many listings as the screen has room for, and
- a **small dot** for every other listing it draws — an individual, clickable home, not a count.

There are **no count circles** in Zillow's default experience. Density is handled by *label
thinning*: which homes get a pill is re-decided per viewport (that is why "some disappear when
you zoom out and appear in different places"), and zooming in converts dots into pills as pixel
room frees up. His line "some show price some are dots and when you get close shows the price"
is a description of that behavior — it is what he wants ours to do.

**Decision: replace supercluster's count bubbles with screen-space label thinning.**

- Project every fetched pin to pixels (both engines already have a projection).
- Walk pins in a **stable priority order** — selected first, then saved (hearted), then Active
  before Pending, then a deterministic hash of the id (so the sample looks arbitrary the way
  Zillow's does, but never flickers between two draws of the same viewport).
- A pin whose pill rectangle (estimated from its own price text width) fits without touching an
  already-accepted pill becomes a **pill**; one that collides becomes a **dot**; a dot that
  would sit invisibly under an accepted pill, or within a few px of an accepted dot, is
  **dropped** — it is unclickable at that zoom anyway, and the existing "Showing N of M — zoom
  in for more" banner already tells the truth about what is drawn.
- Hard cap on rendered markers (DOM nodes rebuilt on every idle) — measured, not guessed; see
  the commit that lands the cap for the number and the draw timings behind it.
- Dots carry the same interaction contract as pills: hover previews, press pins, keyboard
  focus previews, Enter pins. Visual language mirrors the chips — solid ink dot = for sale,
  hollow = pending, red ring = saved — with a ≥24px hit target around a ~12px mark (tap-target
  gate).

Why not keep clusters below some zoom: a count circle answers a question nobody at that zoom is
asking, and two vocabularies (counts here, prices there) is exactly the "three unrelated
states" reading he reported. One vocabulary, one rule: **every marker is a home; a pill when
its price fits, a dot when it does not.**

## 2. "on the new it says NEW instead of price"

Audited every chip renderer (GoogleMapView, Leaflet MapView, both popup paths): the chip text
is `chipPrice(price)` in every path — there is **no code path that can print NEW on a map
marker**. The card badges ("New", "Open House", status) never replace a price either. Most
plausible reading: the sentence describes Zillow's own map (its pins can carry secondary flags)
or a misread of a cluster bubble's count. Action taken anyway: the new thinning module's tests
assert a pill's label is always the floored price for every pin fed to it — the invariant he
asked for, held by a test rather than a promise.

## 3. Evidence note

Zillow's map itself sat behind a press-and-hold bot check on the one scripted visit made for
this round (screenshot in scripts/_scratch-r23/zillow.png), and that check was not bypassed.
What the visit did confirm before the gate: the five-item side rail (Search / Updates /
Favorites / Plan / Inbox) this round researches for §1e, the searched-place boundary polygon on
its map, and its result-count header ("246 results"). Marker-language details above rest on the
owner's description plus prior knowledge of the product, and the numbers chosen here are
verified against OUR map with the ratio probe, before/after.

(Sections for the viewport-scoped list, borough default scope, card density, and the side-rail
research follow as those land.)
