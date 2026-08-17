# Round 31 — the marker layer, and the motion it was blocking

Round 30 named the blocker and refused to build on it: hovering one map price chip destroyed and
recreated every marker in the layer, so a press state written for the pins was dead CSS before it
shipped. This round found the cause, fixed it, and then spent the rest of the budget on the
motion that fix made possible — plus the same class of defect wherever else it was standing.

Nothing here adds a colour, a radius, a font or a gradient. Every animation is transform or
opacity. The two curve tokens from round 30 are the only curves used.

---

## 1. THE BLOCKER: draw() was not a per-settle callback

`overlay.draw()` opened with `container.innerHTML = ""` and rebuilt every marker. That reads as
cheap if you believe draw runs once per settle. It does not. **Google calls `draw()` on every
projection change** — every frame of a pan or a zoom — **and again whenever anything joins the
overlay panes, which is exactly what opening an InfoWindow does.**

So the sequence round 30 measured was: hover a chip → the preview opens → the preview repaints
the pane → all 37 markers are destroyed and recreated, including the one under the pointer.

The instrumentation that named it: a `MutationObserver` callback runs asynchronously and carries
no stack, so it can say the layer was rebuilt but never who asked. Wrapping the `innerHTML`
setter and capturing `Error().stack` at the write named the caller in one run:

```
after HOVER: removals 37  additions 37
  at HTMLDivElement.set [as innerHTML]
  at GoogleMapView.useEffect [as draw]        <- ours
  at JAa.draw   (maps-api-v3/.../overlay.js)  <- Google, driving the repaint
  at KAa.ti     (overlay.js)
  at vza        (map.js)
```

### The fix — reconcile, keyed by listing

`GoogleMapView` now keeps a `Map<listingId, MarkerRec>`. Each draw plans as before, then:

* reuses the existing node, writing only what changed (a pan writes `left`/`top` and nothing
  else — repainting is gated behind a `look` key of everything that decides the marker's ink);
* **the pill and the dot are one element in two costumes.** Thinning flips a home between the two
  as the zoom crosses a density threshold. When they were separate elements, every flip was a
  teardown: 356 of the 1,000 node operations in a single zoom step, every one of them a home that
  never left the screen;
* **retires late.** A draw Google drives only *hides* a marker that left the plan; the draws we
  drive — a settle, a landed pin fetch, a filter change — call `settle()`, and a marker must be
  missing across two of those before it is deleted. Thinning is a pixel calculation, so a home
  can drop out on one frame of a zoom and be back on the next; that alone was 35 of 101 homes
  losing their node on one zoom step;
* **never hides the focused marker.** `display:none` on the element holding focus hands focus to
  `<body>`, so a zoom threw a keyboard visitor off the map — and it *flapped* run to run,
  because whether it happened depended on whether thinning dropped that particular pin on one
  intermediate frame. The focused home is always drawn, at the cost of one extra projection;
* keeps z-order explicit (dot 1, pill 2, saved 500, active 1000, hover/focus 1200). Pills used to
  sit above dots because dots were appended first and DOM order is paint order. A reconciled node
  keeps its creation order forever, so the rule that used to come free is now stated.

Listeners are attached once at creation and read the **record**, never a captured pin, so a
reused node can never act on the listing it was created for.

### Measured, same server, same gestures, before and after

| gesture | DOM node ops | p95 frame | frames > 20ms |
| --- | --- | --- | --- |
| pan, 30 steps — **before** | **21,660** | 33.3ms | 13 |
| pan, 30 steps — **after** | **2** | **16.7ms** | 2 |
| hover one chip — before | 570 | 16.7ms | 1 |
| hover one chip — **after** | **0** | 16.7ms | 1 |
| zoom in ×3 — before | 1,781 | 16.7ms | 3 |
| zoom in ×3 — **after** | **373** | 16.8ms | 5 |

A p95 of 33.3ms on a pan is a dropped frame every other frame. 16.7ms is 60fps.

### What it unblocked, all of it now asserted

* **A pin paints `:active` while pressed.** Round 30 measured `false`; it is `true`.
* **Keyboard focus survives a redraw** — round 28's open finding, *"keyboard focus dies on
  overlay redraw (`innerHTML = ''`)"*, closed, and it was the same root cause as predicted.
* **A latent focus loop the rebuild had been hiding.** With the marker persisting, focusing one
  exposed a cycle: the preview took focus on open → the marker's `blur` scheduled a close → the
  close handed focus back (Google restores it) → the focus handler reopened the preview. Measured
  at ~190ms, running forever. Two fixes, both principled rather than defensive: **a preview is
  not a dialog**, so it opens with `shouldFocus: false` and leaves focus where the visitor put it
  (only a deliberate Enter/Space moves focus in, where the popup's own controls are); and blur
  into `.gm-style-iw` is focus *reaching for the card*, not focus leaving the home.

### The gate — `scripts/verify-marker-reconcile.mjs`

It tests **node identity, not node count**, because a full rebuild produces the same count. Every
marker is stamped, a gesture is performed, and every home still on screen must carry its own
stamp. Thresholds are split honestly: **100%** where the viewport does not change (idle, hover,
pan, an app-driven redraw), **95%** across a zoom, where the pin set is genuinely refetched and a
home can legitimately fall out of the plan for good.

Proven able to fail: against the pre-round-31 file it reports **0% survival and fails 6 of 10
checks**. One check was strengthened after it passed on the old code for the wrong reason — the
original "filter change" used `pushState`, which does not re-render, so nothing redrew and the
survival assertion was vacuously true. It now hovers a result card and requires the matching chip
to actually turn azure before it will believe a redraw happened.

---

## 2. The press, everywhere it was missing

Round 30 put a press on `<Button>`. The survey this round found the rest of both pages answering a
press with **nothing at all**: the /search filter chips, the SEARCH and SAVE SEARCH buttons, the
quick filters, the county buttons, the pagination, the GRID/MAP toggle, the hero's own search
button and its two outline CTAs, every rail arrow, the carousel dots, and the heart on every card.

`PRESS` is now exported from `components/ui/Button.tsx` and `<Button>` is built from it. One
string, one source of truth: a control that presses on this site presses in exactly this way.

| Before | After | Why |
| --- | --- | --- |
| `transition-colors` on ~20 controls, no press | `${PRESS}` | A control that answers nothing reads as a page that is not listening. |
| `transition-all` on FavoriteButton | `${PRESS}` | `all` also transitions the focus outline — round 30's defect, still standing on the heart that sits on every card. |
| `transition-colors` on the selects and inputs | `transition-[color,border-color,background-color]` | Not pressable — you do not press a text field — but the ring must still be instant. |
| `active:scale-[0.97]` on a segmented HALF | `PRESS_GROUP` on the group | Measured, not argued. |
| map pin: no press | `:active { scale(1.04) }` | A pin grows where a button shrinks. |

### The segmented control, photographed rather than argued

The GRID/MAP toggle is `flex overflow-hidden rounded-xl border`, so the **parent** owns the radius
and the border. Scaling one half pulls it inside that clip and opens a pale sliver along its
straight edges — the press reads as a rendering artifact
(`docs/design-r31/seg-black-forced-097.png`). Scaled at the container, the border and corners stay
perfect and the whole control dips as one object
(`docs/design-r31/seg-container-forced-097.png`) — which is also the truer statement: you pressed
the toggle, not one half of it. `PRESS_GROUP` is the same 0.97, the same 150ms, the same curve,
the same reduced-motion opt-out, applied via `:has(button:active)` at the element that can carry
it. Verified in pixels: **130.9px → 126.9px, ratio 0.970.**

### A pin grows on press where a button shrinks

Deliberate, not drift. A button is under a cursor; a map pin is under a **finger**, which covers
it completely, so shrinking on press hides the only confirmation the visitor has that they hit the
home they aimed at. Measured on the rendered pin:

```
rest 64.61px   hover 72.36px (1.120)   press 67.19px (1.040)   press/hover 0.929
```

On a mouse it reads as pushed in; on a touch it rises 4% and reads as picked up. Both answer
instantly, which is the part that matters.

---

## 3. The focus ring that was fading in on every control but one

Round 30 caught `transition-all` fading `<Button>`'s ring over 200ms. Tailwind's
`transition-colors` carries the same defect **by design**: its property list includes
`outline-color`. Measured on the header nav, sampling the computed outline frame by frame:

```
before: 10 distinct outline colours in 260ms
        5ms rgb(111,111,111) -> 20ms rgb(108,109,110) -> 38ms rgb(94,99,106)
        -> 58ms rgb(68,80,99) -> 71ms rgb(45,64,92) -> 90ms rgb(31,55,88)
after:  1 value, at 3ms — rgb(16,44,84)
```

For the first tenth of a second after a Tab, the ring on ~60 controls was mid-grey, well under the
site's own 3:1 floor.

Fixed at the **definition**, not at sixty call sites, so it cannot rot the way sixty edited class
strings can: an unlayered `.transition-colors` rule setting the property list minus
`outline-color`. Unlayered is not a style choice — `@utility transition-colors` emits into the same
layer as the core utility and Tailwind writes its own copy after it, so theirs simply won (read
off the served stylesheet: two rules, theirs last). Only `transition-property` is set, so a call
site's `duration-*` and `ease-*` still work.

While there: `--default-transition-timing-function` is now `var(--ease-out)`. Tailwind's own
default curve was what every un-suffixed transition on the site used — a weaker curve applied by
default to everything nobody had thought about, which is most things.

---

## 4. The rest of the two surfaces

**Result cards.** `.lift` was 350ms — a card thinking about it. A hover is the fastest, most
repeated interaction on the results grid; at 350ms the lift was arriving after the eye had moved
on. Now 220ms. And **a card is a control that answered nothing**: every card is a link across its
whole surface, and pressing it did nothing until the next page began to load. It now settles back
toward the page (`-4px → -1px`, `scale 0.995`) rather than scaling like a button — 0.97 on a 380px
card is a 12px lurch. Measured: `rest y=341.7 w=299.5 | hover y=337.7 w=299.5 | press y=341.3
w=298.0`.

**The map preview now arrives from its own pin.** Google's InfoWindow simply appears, losing the
one thing the motion could carry: which home this card is about, on a map holding hundreds of
pins. The card grows from the edge nearest its marker — 0.96 → 1 over 180ms, origin set from
`popupPlacement`. Verified in both directions, and verified to actually run (a declared animation
that never fires is exactly the dead-CSS trap round 30 refused to ship):

```
chip near the top    -> popup opens BELOW -> transform-origin 126px 0px      (50% 0%)
chip near the bottom -> popup opens ABOVE -> transform-origin 126px 275.4px  (50% 100%)
one animationstart per open: +84ms, ends +242ms
```

**No exit animation, and that is a decision.** Every dismissal guard in `GoogleMapView` — Escape,
outside press, the pointer leaving — is built on `info.close()` being synchronous with the state
flags. Deferring the close to play an exit would put a live timer between "the visitor dismissed
this" and "it is gone", and those guards were expensive to get right. `verify-map-popup` passes
unchanged.

**GRID ↔ MAP.** The two views replaced each other's entire results region as a hard cut. The
results list now arrives (6px, 200ms). Applied to the list only, never to the map, whose arrival
frame is the owner's decision. Verified in **both** directions, because a check that only proves
it does not fire is a check that cannot fail: **1** play on a real view switch, **0** on an
ordinary filter change.

**The refetch dim.** `opacity-60` snapped on and snapped off — a state change announced by a hard
cut. It transitions now.

**Home page section reveals — measured, nothing to fix.** `.reveal` is 0.5s with a 140ms stagger
on the site curve; `.rise` (the hero arrival, round 27's) is 0.7s with an 80ms stagger. A full
7,534px scroll of the home page: **p50 16.7ms, p95 16.8ms, worst 16.8ms, zero frames over 20ms.**
Not janky, not over-long. Left alone.

---

## 5. The adversarial pass, and what it caught

`/review-animations` is reserved for the owner's explicit invocation and **cannot be triggered
from a session** — round 30 recorded the same. The checklist was run by hand instead, as
measurements rather than opinions (`scripts/_scratch-r31-adversarial.mjs`). It caught one real
defect and confirmed seven other lines clean.

**THE DEFECT: on a phone, a tap left the card stuck lifted.** Measured at 390 with touch
emulation — before the tap `translate: none`, after it `translate: 0px -4px`, and it stayed
there for the rest of the session, with the photograph inside it stuck zoomed too. A `:hover`
written by hand is gated by nothing; a tap fires it and nothing ever fires the leave. Tailwind v4
already wraps its own `hover:` variants in `@media (hover: hover)`, so only the four hand-written
hover rules on this site were exposed: `.lift`, `.photo-zoom`, `.rlt-price-chip`, `.rlt-map-dot`.
All four are gated now — with `:focus-visible` and `:active` deliberately left **outside** the
query, because a keyboard and a finger both work on a phone. Re-measured: `before "none" / after
"none"`.

Both halves of that finding are permanent ratchets now: the source-level one in
`components/ui/motion.test.ts` (proven able to fail by un-gating `.lift:hover`), and the rendered
one in `verify-press-feedback.mjs`, which taps a card at 390 and requires it to come back.

Also checked and clean: no `transition: all` survives on either page; nothing enters from
`scale(0)`; no `ease-in`; the popup is origin-aware rather than centre-scaled; nothing animates on
a repeated keyboard action; every UI duration is ≤ 220ms; zero horizontal overflow at 390 and 320.

**Reduced motion, checked 1:1 rather than assumed.** The global block only collapses *durations* —
it does not remove a transform, so every movement on the site still happened under reduced motion,
instantly. An instant 4px jump is not a gentler version of a 4px glide; it is a worse one. The
surfaces that move on hover or press are now explicitly stilled, and measured that way: card
`rest y=341.7 hover y=341.7 press y=341.7`; map pin `rest 58.2 hover 58.2 press 58.2`; "Sell Your
Home" `rest 155.8px vs press 155.8px`.

---

## 6. Instrument faults (each read as an app defect first)

1. **A probe picked a map chip 69px below the fold.** The round-28 trap, third round running: an
   off-screen element still has a bounding box, so `elementFromPoint` returned `none`, no popup
   opened, and it looked exactly like "the origin animation does not work for pins near the
   bottom". Constraining to the **intersection** of the map's box and the viewport — and requiring
   the chip to be provably hittable — showed both directions working.
2. **A press gate that navigated off the page it was testing.** `mouse.down()` then `mouse.up()`
   on a link is a click. Releasing somewhere else measures the press without following the link.
3. **A press gate that opened a modal and then measured through it.** Clicking SAVE SEARCH opened
   the save dialog, and every control measured afterwards reported rest = hover = press because
   the pointer never reached them. Same root cause as (2), different symptom — a probe must not
   change the state it is about to measure.
4. **`${PLACEHOLDER}` inside a `"…"` string is literal text.** A bulk edit inserted the press into
   twenty class strings, eleven of which were plain quoted strings, not template literals. `tsc`
   was clean because the strings were still valid strings. Caught by checking, for every inserted
   placeholder, whether the quote opening its string was a backtick.
5. **A reveal probe read `transitionDuration` and fell through to `animationDuration` with `||`.**
   `"0s"` is truthy, so it reported every `.rise` element as `0s / ease` and would have had the
   round doc claim the hero has no arrival animation at all.

---

## 7. Gates

* `npx tsc --noEmit` — clean
* `npm test` — **939 passed / 0 failed / 69 files** (baseline 920 + 19 new in
  `components/ui/motion.test.ts`; 6 of the 19 proven able to fail by injecting the old values)
* `scripts/verify-marker-reconcile.mjs` — **11/11**, and **6/10 FAIL** against the pre-round-31 file
* `scripts/verify-press-feedback.mjs` — **15/15**
* `scripts/verify-map-zoom-ladder.mjs` — **PASS, 20 rungs**, no count circles, no orphans
* `scripts/verify-map-popup.mjs` — PASS, pill and dot, hover / pin / Escape / outside-click / reopen
* `scripts/verify-viewport-scope.mjs` — PASS
* `scripts/verify-pin-walk.mjs` — PASS
* `scripts/verify-geocode-truth.mjs` — PASS, n=45, median 31m, p90 90m, KEY918376 51m, addrKey 0
  mismatches

## 8. Found, not fixed

* **Zoom still costs 373 node operations** (down from 1,781). What remains is homes genuinely
  entering and leaving the viewport as it shrinks, plus a residual ~2% that fall out of the plan
  across two settled moments and are restored by a later fetch. The gate's 95% floor is set where
  that lives. Chasing 100% means giving a departed marker more than one settle of grace, which
  trades a real leak for a cosmetic gain.
* **The chat widget** (`.rlt-bubble` / `.rlt-panel`) has its own stylesheet and is untouched: its
  Send, Reset and Close buttons have **no transition at all** (`all 0s ease`) and no press. It is
  excluded from both gates by selector so the exclusion is visible rather than silent.
* **`prefers-reduced-transparency` and `prefers-contrast`** are not handled anywhere on the site.
  The hero's `backdrop-blur` search instrument and the map's translucent legend are the two
  surfaces that would want them.
* **The header/footer nav links** got the ring fix and the site curve but no press. A scale on a
  bare text link reads as a wobble rather than a press; the right treatment there is probably an
  underline that draws rather than appears, which is a typography decision, not this round's.
