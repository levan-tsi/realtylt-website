# Round 30 — motion and interaction feel

Mission B of round 30, run after the coordinate work with the budget that remained. A smaller
slice, finished and measured, in preference to a large rough one.

The palette, type and radii are untouched. Nothing here adds a colour, a radius or a font. This
is only about how the interface *answers* when you touch it.

---

## 1. The site had a curve. It did not have a name.

`cubic-bezier(0.22, 1, 0.36, 1)` appeared **thirteen times, hardcoded**, across `globals.css` —
the hero zoom, the section reveals, the sheet, the heart pop, the service ping. That is a system
that exists but cannot be referenced: anything new could only match it by copying a magic number
out of an unrelated rule, which is precisely how a system rots.

It is now `--ease-out`, and the thirteen copies point at it.

**Overriding Tailwind's `ease-out` rather than inventing `ease-rlt`** was deliberate, and safe to
do because it was measured first: only **2** call sites in the entire codebase use the `ease-out`
utility, so the blast radius is two elements and both are improved by it. The payoff is that
`ease-out` in any class list now means *this site's* curve. Tailwind's built-in is much weaker
and reads as mush beside it.

`--ease-move` (`cubic-bezier(0.77, 0, 0.175, 1)`) is added for things travelling **across** the
screen, where acceleration at both ends is what makes a move look deliberate. Entering and
exiting elements must never use it — starting slow wastes the moment the eye is most attentive,
which is the whole reason `ease-in` is banned on UI here.

## 2. The button, which is most of both pages

| Before | After | Why |
| --- | --- | --- |
| `transition-all duration-200` | `transition-[translate,scale,background-color,box-shadow,color] duration-150` | `all` also transitioned the **focus outline**, so a keyboard Tab faded its own ring in over 200ms — the one moment that must be instantaneous. 200 → 150ms because a press that answers slower than ~160ms reads as the control thinking. |
| `active:translate-y-0` (primary/light) | `active:scale-[0.97]` on every variant | The old "press" only *cancelled the hover lift*, so it did nothing at all for anyone who never hovered — i.e. every touch device. A scale is felt on any input. |
| `active:translate-y-px` (outline variants) | same `active:scale-[0.97]` | Three variants had three different press behaviours and two of them were invisible. One press, one value. |
| no reduced-motion handling on the press | `motion-reduce:transition-none motion-reduce:active:scale-100` | The global reduced-motion rule only shortens durations; it does not remove the transform. This removes the movement itself and keeps the control usable. |

**`translate` and `scale` are listed explicitly** because Tailwind v4 emits them as their own CSS
properties, *not* inside `transform`. A transition naming only `transform` would animate neither,
and both the hover lift and the new press would snap. This is the kind of thing that looks
correct in a diff and is wrong on screen.

**Measured, not asserted** (`scripts/_scratch-r30-motion.mjs`, real browser, real mouse):

```
HOME — primary CTA
  OK   Button variant=primary: rest 159.9px  hover 159.9px  press 155.1px
HOME — reduced motion: the press must NOT scale
  OK   press width under reduced motion: 159.9px vs rest 159.9px (must match)
```

Evidence crops: `docs/design-r30/cta-rest.png`, `cta-hover.png`, `cta-press.png` (3.0% smaller),
`focus-30ms-after-tab.png` — the ring, fully painted 30ms after the key.

## 3. Map markers

The price chips and dots now ease on `var(--ease-out)` instead of bare `ease`, so the map's
micro-motion belongs to the same system as everything else. At 120ms the difference is small,
but it is the difference between a chip that answers and one that eases into answering.

## 4. What was built, measured, and taken back out

A press state was written for the price chips and dots — the surfaces a phone visitor actually
taps — and then **removed**, because measurement showed it could never fire.

**Hovering one price chip destroys and rebuilds every marker in the layer.** Measured on
`/search?county=dutchess` with a `MutationObserver`:

```
baseline idle 2s:
  removals during idle: 0
after HOVER -> removals: 62 additions: 62
```

Zero churn while idle; one hover, and all 62 markers are torn out and recreated. The node the
browser is pressing does not exist by the time `:active` would paint. Shipping the rule would
have shipped dead CSS that reads in the source like a working feature — the worst kind, because
the next person maintains it.

The comment now standing in its place says so, and this is the more valuable finding of the two:

- It is very likely the **same root cause** as round 28's open item, *"keyboard focus dies on
  overlay redraw (`innerHTML = ""`)"*. Both are the marker layer being rebuilt wholesale.
- It is a real cost: at Queens z12 the ladder draws **572 markers**, so a single hover is a
  572-node teardown and rebuild.
- **It blocks every future map micro-interaction**, not just this one. Pin hover motion, popup
  origin animation and marker focus all need a marker that survives being touched.

Fixing it means diffing the plan against the drawn set and mutating in place instead of
rebuilding — a real piece of work in the draw path that round 28 spent a whole round inside, and
not something to attempt on the tail end of a data round.

## 5. Instrument faults (both of these read as app defects first)

1. **`getComputedStyle().transform` is blind to Tailwind v4.** The first motion probe reported
   `scale 1.000` at rest, hover *and* press on all three surfaces — including a chip hover that
   has demonstrably worked since round 23. Tailwind v4 emits `active:scale-[0.97]` as the
   standalone `scale:` property and `transform` computes to `none`. The probe now measures the
   **rendered box width**, which changes whichever property did the scaling.
2. **The first chip it measured was at y=909, below a 900px viewport.** Off-screen elements still
   have a bounding box (the round-28 trap, again), so the mouse never touched it and every state
   read identical. The probe now picks a chip provably inside both the viewport and the map pane.
   A third fault sits behind those two: a `.nth()` locator **re-resolves after every redraw**, so
   three measurements can come from three different chips — which is exactly what produced the
   plausible-looking `rest 58.2 / hover 65.2 / press 53.2` that briefly suggested the press was
   working.

## 6. Gates

- `npx tsc --noEmit` — clean
- `npm test` — **920 passed / 0 failed**
- Motion probe — press verified in pixels, and verified absent under `prefers-reduced-motion`
- Map probes unaffected: zoom ladder 20/20, viewport-scope, pin-walk, popup all PASS

## 7. Not done

- **`/review-animations` was not run.** That skill is reserved for explicit invocation by the
  owner and cannot be triggered programmatically. Worth running against this diff.
- **The search page's own controls** (county chips, GRID/MAP toggle, filter dropdowns) still have
  `transition-colors` and no press feedback. They are ordinary DOM, not the rebuilt marker layer,
  so the Button treatment applies cleanly — this is the obvious next slice.
- **Popup enter/exit origin** — should scale from the pin it belongs to rather than Google's
  default. Blocked behind the marker-rebuild issue in §4.
