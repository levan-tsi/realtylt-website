# Round 34 — pages 3 onward, and the two system decisions they were waiting for

Continues rounds 32 and 33 and uses `scripts/score-page.mjs` **unchanged — not one threshold, not
one line**. Read `docs/parity/PAGES-R32.md` (the rubric), `docs/parity/PAGES-R33.md` (page 2 and
the instrument's hardening) and `docs/parity/DESIGN-REVIEW-R32.md` (the adversarial review whose
framing governs this campaign) first. None of that is repeated here.

**The framing, kept:** nine of the twelve dimensions are floors any competent modern real-estate
site clears untouched, so a total in the low 50s means "nothing is broken", not "this is good".
The score is a regression gate. Everything in this round that mattered most was found by driving
the page, and most of it is invisible to the rubric.

Branch `design/pages-r34`, two commits: `afef364` (page 3) and `a72bd4f` (the system decisions).
Two commits on this branch are **not mine** and are excluded from every number below —
`44cf331` (`scripts/verify-active-count.mjs`) and `e50b3ab` (the nightly sold-photo ledger); they
landed here because my `checkout -b` moved the shared working tree.

---

## The measured result

Generated from `score.json`, never transcribed — round 32 put three hand-copied errors into its
record that way.

| page | before | after | Δ | ex-D11 before | ex-D11 after | Δ ex-D11 | dimensions that moved |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /search | 44.75 | **47.25** | +2.50 | 40.75 | **43.75** | +3.00 | D5 4.5→5, D6 1.5→4, D11 4→3.5 |
| /selling | 46 | **49.5** | +3.50 | 43.50 | **46.50** | +3.00 | D3 2→4, D6 4→5, D11 2.5→3 |
| /home-value | 53.5 | **53.5** | +0.00 | 49.50 | **49.50** | +0.00 | D2 3.5→3, D3 3.5→4 |
| /buying | 47.5 | **49** | +1.50 | 45.00 | **46.50** | +1.50 | D3 3.5→5 |
| /connect | 53 | **54.25** | +1.25 | 49.00 | **51.75** | +2.75 | D6 1→3.75, D11 4→2.5 |
| /top-areas | 48.5 | **47** | −1.50 | 44.50 | **43.00** | −1.50 | D3 3→4, **D6 3.5→1** |
| /top-areas/westchester | 47.5 | **47** | −0.50 | 43.50 | **44.50** | +1.00 | D3 3→4, D11 4→2.5 |
| /who-we-are | 53.25 | **53.75** | +0.50 | 49.25 | **49.75** | +0.50 | D3 4→5, D6 3→2.5 |
| /financing | 46.5 | **50.5** | +4.00 | 43.50 | **46.50** | +3.00 | D3 2.5→4, D7 3.5→5, D11 3→4 |
| **all nine** | **440.50** | **451.75** | **+11.25** | **408.50** | **421.75** | **+13.25** | |

D11 is excluded from the honest column because it is dev-server noise: it moved on six pages this
round with no performance work done at all, in both directions, and round 32 measured 2.5 points of
variance on an unchanged tree.

**Evidence:** `docs/r32/r34-<page>-A/score.json` and `docs/r32/r34-<page>-D/score.json`, each with
`1440-fold.png`, `1440-full.png`, `390-fold.png`, `390-full.png`, `jsoff-1440.png`.
Ring measurements in `docs/r34/rings/`, the overflow sweep in `docs/r34/sweep-final.json`,
after-shots in `docs/r34/after-*.png`. The probes that produced them
(`_scratch-r34-rings.mjs`, `_scratch-r34-inspect.mjs`, `_scratch-r34-sweep.mjs`) are local, because
`scripts/_scratch-*` is gitignored — the same convention round 33's probes ran under.

---

## 0. Three ways the instrument lied, found before anything was believed

**1. `/search` cannot be scored with media blocked, and the first run said 5/5 for photography.**
The scorer aborts `**/api/media/**`, and on a results page that leaves `D4 n = 3` images on a page
showing fifty homes, plus 36 focus stops measured against an empty placeholder. `--media` was
checked in the route rather than assumed: all twenty covers on the first page answer
`X-Media-Status: storage`, a 302 to our own Supabase bucket, so a `--media` run costs the MLS Grid
account nothing. Every /search number here is a `--media` run; the blocked run is discarded.

**2. I hot-reloaded the server during /financing's baseline and it scored an empty page.**
`r34-financing-A` reports `D12 = 0/5` with `h1: "", words: 0, links: 0`. Its run started 28 seconds
before I saved `globals.css`. Re-run clean on a quiet tree, /financing's real baseline is **46.5,
not 39.5** — a 7-point difference that would have been reported as this round's improvement.
The rule from round 33 is right and I broke it once: **do not edit anything while a scorer runs.**
The three baselines that completed before that save were checked against the file's mtime and kept.

**3. D6's `noRing` fired on eleven controls whose rings paint.** See §4 — it is this round's one
score regression and it is not a regression.

---

## 1. Page 3 — SEARCH: two focus rings that could not be seen

`44.75 → 47.25` (ex-D11 `40.75 → 43.75`). Commit `afef364`.

The rubric put D6 at **1.5/5** and named two controls with no ring and 37 under 3:1. Rather than
believe the number, each was isolated: tab to it with real keys, shoot the focused frame, shoot the
same frame with **only the outline suppressed**, and diff. That leaves the ring's own pixels and
nothing else.

```
                       BEFORE                                   AFTER
FOR SALE      0 ring pixels                            440 px, white ring, on its own black body
FOR RENT     68 px, all on the black neighbour 1.51:1  458 px, river ring, 10.81:1
GRID          0 ring pixels                            350 px, river ring,  9.71:1
MAP          68 px sliver only                         332 px, white ring, on its own black body
card ← →    194 px, WHITE ring inside a WHITE pill     276 px, ink ring,    5.13:1
card ← →    184 px, WHITE ring inside a WHITE pill     300 px, ink ring,    3.57:1
```

**Defect 1 — a segmented control clips its own ring.** Round 31 made the group
`flex overflow-hidden rounded-xl border` deliberately and photographed why: the parent owns the
radius so the press scales the whole toggle instead of opening a pale sliver along one half's
straight edge. That decision stands. What it also does is eat the focus ring — three sides of each
segment's outline land outside the clip, and the fourth, facing the neighbour, is painted over by
that neighbour's opaque background. So the site's two primary mode toggles had **no usable keyboard
indicator at all**, and the one sliver that did paint was under the site's own 3:1 floor.

The clip stays. The ring moves inside the segment, where nothing can clip it and no sibling can
paint over it, and its colour follows `aria-pressed` — the semantic name for "this half is the
black one" — rather than a utility class.
*Provenance: found by the rubric's Tab walk, diagnosed in pixels. `apple-design`'s rule that an
indicator must be legible against the material behind it is the same idea stated once.*

**Defect 2 — round 33's own fix, leaking.** `.photo-zoom :focus-visible` was written for the
listing gallery, where every control carries a `bg-ink/55..70` body, and it paints the ring paper
and pulls it inside. `.photo-zoom` is also the photo frame on **every listing card** — and a card's
pager arrows are `bg-white/90`. Computed on a card arrow:
`outline: solid 2px rgb(255,255,255)` at `-2px`, over `rgb(255 255 255 / 0.9)`. **A white ring
drawn inside a white pill**, on 36 stops on /search and on the home page's rails.

The inset was right for both — a ring belongs on the control's own body, never on somebody's
photograph. Only the colour depends on how dark that body is, and only the control knows, so it is
a variable now defaulting to paper. The gallery was re-driven on a real listing afterwards: every
one of its eight controls still computes `rgb(255,255,255)` at `-2px`. **Round 33's work is
byte-for-byte unchanged.**
*Provenance: my own judgement, found by refusing to accept the rubric's 37-under-3:1 at face value.*

Also: the county chips carried `#555555` and `#e2e6ea`, the only off-token colour the rubric found
painted on /search (D5 ×6). `stone` was chosen precisely so it clears AA on mist (4.60:1); `line`
gives the hover a definite step, paired with `ink` at 15.3:1 because stone on line would not clear.

`components/ui/focus-ring-surface.test.ts` — 7 cases, **6 of which fail against the pre-change
tree**. The seventh guards round 33's inset so a future round cannot revert it.

### What /search's number cannot see, and it is the biggest thing on the page

**On a phone the first home is 942px down — 1.12 screenfuls.** Measured at 390×844:

```
header      0 → 113
filter card 125 → 446   (321px: a mode toggle, a place field, six dropdowns, MORE/SEARCH, SAVE)
county chips 462 → 642  (180px: six chips wrapping to four rows, plus an expander)
meta band   654 → 910   (256px: the count, four status tabs, Saved, Plan, Sort, GRID|MAP — six rows)
first card  942
```

A visitor who came to look at homes meets ~800px of controls first, in an 844px viewport. The
category norm is 110–150px (Zillow, Redfin) before the first result. **This is the page's real
design problem and I did not fix it**, because every one of those three bands is the product of
explicit owner direction — round 24b rebuilt the dropdown row as a stacked two-column grid to
retire a scrolling strip, and put Saved and Plan beside Pending on his ask. Fixing it properly is a
mobile filter redesign that re-opens both. **The case for the owner is the four numbers above.**
The one redundancy worth naming while he looks: on a phone, `SAVED` in the meta band is the same
link as `SAVED` in the utility bar 646px above it.

**With JavaScript off, /search is a wall of empty grey skeletons.** The source says the Suspense
boundary "never fires on a fresh load — the real UI is in the HTML". Measured: 50 `<article>`
elements are in the DOM and **0 are visible**, all fifty inside six `<div hidden>` blocks, which is
Next's streaming — the inline script that moves them into place never runs. 240 words against
1,924. D12 = 3/5 and the deduction is correct. Recorded rather than fixed: re-architecting the
data path of the site's primary page is not a design round's business, and the page is noindex.

---

## 2. The type-scale decision, carried since round 33

**The site runs two type scales and only one of them was written down.** The committed scale is
five classes and all five are the display face. Everything set in Lato above body size — which is
most of the site's headings — had no name at all. Counted across the eight pages I own:

| what it is | sizes actually used | call sites |
| --- | --- | --- |
| a card or panel title | 20px Lato 700, once 18px | 9 |
| a sentence leading into a pair of buttons | 20 / 24 / 24→30, Lato 300 | 3 |
| a figure | 20 / 24 / 28 / 36, Lato 700 | 6 |

Every one chosen ad hoc, and the rubric reads all of them as headings off the scale — 0.75 to 2.0
on D2, on six pages. Round 33 met the same thing on the listing page and carried it as "a
system-level decision that belongs on the page where that scale is the subject".

**The decision is two scales, not one.** A 20px bold Lato card title and a 30px light Newsreader
heading are different jobs, and round 33 already rendered a light serif at a title's length and
measured it going weedy. What was wrong was never that a second scale exists — it is that it was
re-invented at every call site. `.t-title` (20px Lato 700) and `.t-lead` (fluid 20→24, Lato 300)
name it, and thirteen ad-hoc declarations collapse onto them.

**Two things deliberately not done, and both are the point:**

* **`scripts/score-page.mjs` is untouched.** It probes exactly the five display classes, so it
  keeps calling 20px and 24px off-scale and keeps deducting on these pages. Teaching the instrument
  about classes I have just written would make the number measure agreement with its author — the
  one move the rubric exists to prevent. **The points stay on the floor.**
* **The numeric voice stays forked.** The site runs `font-mono` semibold with tight tracking on the
  listing and CMA surfaces (round 33) and `font-bold` Lato on these marketing pages — and
  /financing uses both, in one component. Unifying it is one decision that spans pages 1 and 2 as
  well; doing half of it here would make the codebase say three things instead of two. **Carried,
  and it is now the largest honest type deduction left.**

**It cost half a point and I am reporting the cost, not hiding it.** `.t-lead` is 24px at 1440;
/home-value's line was 20px before. So its D2 went **3.5 → 3.0** — a third off-scale size where
there were two. The page is more consistent with /top-areas and the county pages and its score is
lower. That is the instrument working exactly as it should.

Also left, and recorded rather than forced: **/buying's four step headings** are
`text-3xl md:text-4xl font-light` with a hand-rolled `<strong className="font-bold">` — 30→36px
Lato carrying the site's signature mixed-weight treatment in the wrong face. `.t-h2` exists and
would put every section-level heading on the site in the display face. I left them because
changing the face and size of four headings that currently work is a redesign of a working band,
not a fix, and "respect convergence" applies. The class is there if the owner wants it.

### `.t-small` — round 33's other carried item

Small **running copy** is not a small label, and `text-sm` cannot tell them apart. D9 finds
sub-16px prose on every page (22 blocks on /selling, 8 on /home-value, 7 on /buying and /connect),
and most of it is real sentences set at 14px because `text-sm` was the nearest thing to reach for.
`.t-small` is 16px on a phone — the floor the same stylesheet already enforces on form controls for
iOS — and 14px from `md`.

Applied where the copy is genuinely prose: the **consent sentence**, which is the one piece of copy
on the site whose comprehension is legally load-bearing, and the **footer form's paragraph**, whose
words are the owner's and are untouched; only the size changed. /selling's tiny-text count went
22 → 15. **D9's deduction did not move and will not**: its ≥8-word test also counts card stat lines
and the 12px compliance disclosure, which are data and small print and are correct as they are.

---

## 3. The vertical rhythm had grown a sixth ad-hoc padding, and now it has a gate

Round 11 replaced "the five ad-hoc paddings that were shipping" with three named steps. By round 34
there were six again:

```
py-16 md:py-24   64/96    eleven bands      py-14          56/56   three bands
py-16 md:py-20   64/80    three bands       + four hero paddings, all different
```

96px is not a step; it sits exactly between `sec-sm` (56/80) and `sec` (72/112). Twenty-one bands
are on the scale now — `sec` for the full-width marketing bands, `sec-sm` for the tighter ones —
and the rubric's "sections off the rhythm scale" is **gone from every page that had it**: /selling
−2.0 → 0, /financing −1.5 → 0, /buying −1.5 → 0, /top-areas, the county page, /who-we-are and
/home-value all −1 or −0.5 → 0. That single change is most of D3's movement in the table above.

`components/ui/type-and-rhythm.test.ts` is the gate, and it is the point of the exercise: **a
`<section>` that paints its own background may not carry its own `py-*`.** Tokens re-rot without
one — that is exactly what happened between rounds 11 and 34.

The gate is site-wide, so it also caught three bands on /blog, two on /reviews and four on
/services. Those were converted mechanically, with no other change to those pages, because the
alternative was either a red test or a gate scoped so narrowly it would not catch the next drift.
Heroes are exempt on purpose: a hero is a `<div>` sizing itself around a photograph, not a band.

---

## 4. The one score regression, and why it is the instrument

**/top-areas D6 3.5 → 1.0**, from `noRing` naming all eleven county and borough cards. It
reproduced on a second run. The cards' rings are fine, and here is the proof:

* The rule matches and the ring is configured **after a real Tab**, not a programmatic focus:
  `article` computes `outline: solid 2px rgb(16, 44, 84)` at `2px`, and
  `:has(> a.absolute.inset-0:focus-visible)` matches.
* An isolated focused-vs-blurred capture on a settled page measures **5.485%** of the clip
  changing, with **2,606 river-coloured pixels** in the focused frame.
* **The control that settles it:** two screenshots of the *identical* state, taken back to back,
  differ by **1.886%**. This page is never pixel-stable between captures. The scorer recorded
  `diffPct = 0` — *exactly* zero — on all eleven stops, which is unreachable against a 1.886% noise
  floor. It compared one compositor frame with itself.

The same run's before-measurement of those same eleven controls was `diff 1.51–2.78, contrast
12.47`. So the page did not change; the reading did.

**I did not touch the rubric to make this go away.** The −2.5 stands in /top-areas' score and this
section is the record. What the next builder needs is the general form: **D6's `noRing` can fire on
a page whose rings are correct**, so a `noRing` entry is a lead to measure, never a verdict. The
same caution applies to /who-we-are's D6 3 → 2.5 (two form inputs at 2.89 and 2.93 — a 2px ring
averaged against a backdrop repaint, the flaw round 33 already documented) and to the eight
card-arrow readings on the county page, which measure 1.17–2.8 in the rubric while the ring is ink
on a `bg-white/90` pill whose alpha floors it at rgb(230), i.e. **≥15:1 by construction**.

---

## 5. What else changed, and why each was the highest-ROI move on its page

**A form that does not answer the pointer reads as inert.** `Field.tsx`'s controls had a rest
border and a focus border and nothing between: Name, Email, Phone and Property address each changed
**0.00%** of their pixels under the cursor on /selling. The hover is the missing middle step, so
the progression is rest < hover < focus instead of nothing-then-everything. Colour only, on a
border the control already transitions. Measured after: **0.00% → 3.5–3.85%**, and /selling's D6
went 4.0 → 5.0. Tailwind v4 gates its own `hover:` variants behind `@media (hover: hover)`, so a
tap cannot stick it on.
*Provenance: `emil-design-eng` — "unseen details compound"; found by the rubric's hover probe.*

**/connect had nothing to contact anyone with on its first screen.** 34 words above the fold and
zero pressable controls: the hero is an eyebrow and a headline and then it stops, with the phone
number ~400px further down inside a sticky rail. It now carries the same phone button /selling and
/buying already use — no new copy, the number already in `SITE`, in the component already used for
it. **D6 1.0 → 3.75**, and the page's job is available where a visitor arrives.
*Provenance: `frontend-design` — "the hero is a thesis"; a contact page's thesis is how to reach us.*

**The payment-breakdown bar transitioned `width` for one second.** The last layout-property
transition on the site, and /financing's only D7 deduction. Two things were wrong and only one was
the rule: `width` relayouts the row every frame with no transform equivalent available (the
segments are flex siblings whose widths *are* the layout); and because the bar updates as somebody
types, at 1000ms it spent most of its life showing a breakdown true of neither the old numbers nor
the new ones, while the total above it changed instantly. Round 33 removed the home page's count-up
on exactly that ground. **D7 3.5 → 5.0.**
*Provenance: `animate`'s gate — data the user is reading does not move for style.*

**The laptop foot was a fourth grey.** `#9aa1ab` ×3, the only off-token colour on /selling apart
from the Google gold star. The device body already has `graphite` as a token precisely because a
material used more than once is a token; the foot is `line-strong` now.

---

## 6. Deductions declined, each with the measurement

**D4 "unsized images (CLS risk)" — the same false positive round 33 disproved.** /buying 11,
/top-areas 7, the county page 7. Every one is a `next/image` with `fill` inside a fixed-aspect
`overflow-hidden` parent: `position: absolute; inset: 0`, dimensionally pinned by the parent, so it
cannot shift layout. Measured CLS on these pages is 0.000–0.007.

**D5 "radii outside the scale" — a phone is not a button.** /selling 14px, /buying 14/19/28,
/financing 27/39. Every one is a **device bezel**, computed by `DeviceMock`'s
`radius = round(width × 0.13)` from three real measured devices. The 8/12/16/24 scale governs UI
chrome; an illustration of a physical object carries the object's geometry, and a 300px laptop with
a 16px corner is not a laptop.

**D10 "text below the AA contrast floor" on /selling — the honeypot.** The single failure is
`"Leave this field empty"` at 1.00:1: the lead form's bot trap, `aria-hidden="true"`, 1×1px, parked
9,999px off-canvas. The scorer's own `isHidden()` helper excludes exactly this shape from the
control census and is not applied to the text census.

**D1 on /search — the rubric is a marketing-hero rule on a tool page.** Three of its four
deductions are structural facts about a search page: the `h1` is `sr-only` by a documented
live-parity decision, 232 words above the fold is a filter bar plus card data, and the "9 filled
CTAs" are the six county chips, which count as filled only because mist (243,245,248) fails the
rubric's `>245` white test. A results page whose loudest element is the result count is correct.

**D1 ratio on /buying (1.27)** — the 44px block is "The Home Buying Process" at y≈810, peeking into
the bottom 90px of the fold. The hero is complete and unambiguous at 56px above it.

**D6 "controls that ignore a press" on the header nav** — probed on five pages, because those pages
have no filled CTA above the fold so the probe reaches only the site header. A text link in a menu
bar is `animate`'s 100+/day tier, where the rule is to remove motion, not add it. Hover and the
focus ring already answer.

---

## 7. Where the skills did and did not apply

* **`frontend-design`** drove the /connect hero decision ("the hero is a thesis") and framed the
  type-scale decision as naming a system rather than deleting one.
* **`emil-design-eng`** drove the `Field` hover ("unseen details compound") and supplied the frame
  for fixing `.photo-zoom`'s colour at the definition rather than at the call sites.
* **`animate`** drove the removal of the `width` transition — its gate is that data the user is
  reading does not move for style, and its hard rule bans layout-property transitions.
* **`apple-design` contributed one line to this round, honestly**, the same as rounds 32 and 33
  recorded: a focus indicator must be legible against the *material* behind it, which is the whole
  of both ring fixes. Its strengths are gesture-driven motion, velocity handoff and translucent
  materials, and these are static marketing pages. Nothing else it says applied.
* **`find-animation-opportunities`** was run over the seven marketing pages and their shared
  components. **Two candidates survived its gate, and both are the same defect:** the mortgage
  calculator's Reset button (`MortgageCalculator.tsx:135`) and its representative-rate rows
  (`:265`) are pressable controls carrying `transition-colors` and **no `:active` state at all** —
  Feedback, at the occasional/rare tier, well inside a 100–160ms budget. The right answer was not
  new motion: round 31 already exported `PRESS`, and these two controls simply never used it. Both
  carry it now, which is a consistency repair rather than an animation.

  Rejected, with the gate question that killed each:
  - the calculator's figures updating as you type — **functional data the visitor is reading;
    decoration hinders.** This is also the reason the `width` transition came out (§5).
  - `/buying`'s and `/selling`'s `isLiveMlsPhoto(src) ? … : …` branches — **not a state change;
    a build-time branch that never animates between two states.**
  - `/top-areas`' six-card grid entrance — **already staggered** by `Reveal delay={(i % 3) * 110}`,
    and a scroll reveal on a marketing page is the tier where a longer beat is correct.
  - the header nav — **100+/day, keyboard-and-pointer navigation. Never animate.**
  - the lead form's success panel — **already carries `.rlt-pop-in`** from round 32.

* **`review-animations` was NOT run, and could not be.** The harness refuses it
  (`disable-model-invocation`): it is reserved for explicit invocation by the owner. I did not
  reconstruct its workflow by other means, because the skill says not to. **The motion in this
  round's diff is therefore unreviewed by that instrument** — it is two `PRESS` applications, one
  hover colour step and one *removal*, all on the site's existing tokens, but the owner should run
  `/review-animations` over `main...design/pages-r34` if he wants that check.

* Everything else — the segmented ring, the rhythm gate, `.t-small`, the token repairs, every
  declined deduction — was **my own judgement**, found by driving the pages and by refusing the
  rubric's first answer.

---

## 8. Gates

All foreground, all my own runs, on this tree, dev server restarted before the proof.

```
npx tsc --noEmit          clean
npm test                  983 passed / 74 files   (baseline 970 + 13 new)
npm run build             clean, 81/81 static pages (dev server killed first)
verify-press-feedback     PASS 15/15
probe-reduced-motion      PASS (15 sections, 0 hidden, 0 reveals armed)
verify-hero-contrast      PASS (173 painted text runs across 8 pages)
verify-plan-quiz          PASS 19/0
verify-viewport-scope     PASS
verify-marker-reconcile   PASS 11/11
verify-map-popup          PASS
verify-map-zoom-ladder    PASS (20 rungs, 0 count circles, 0 orphans)
verify-pin-walk           PASS (route warmed with two curls first)
overflow sweep            1440 / 390 / 320 on ten surfaces: no horizontal overflow anywhere
```

**`verify-saved-flow` fails and it is not this round's.** It defaults to port 3777 and, pointed at
3100, times out on `section[aria-labelledby="alerts-heading"]` inside `SavedClient.tsx` — a file
this round does not modify, on a page it does not touch. It is not in round 33's gate list either.
Flagged for whoever owns /saved.

**`verify-pin-walk` is still timing-fragile** (a fixed 1,200ms wait after `domcontentloaded`).
Warming the route with two curls made it pass first time, as round 33 found. Still carried.

---

## 9. Carried, not done

* **The numeric type scale**, forked between `font-mono` semibold and `font-bold` Lato, with
  /financing using both. One decision, spanning pages 1, 2 and these. §2.
* **/search on a phone: 942px of controls before the first home.** The measurement is in §1; the
  fix is a mobile filter redesign that re-opens two rounds of owner direction. **Owner call.**
* **/search with JS off** renders 50 articles into `<div hidden>` and shows skeletons. §1.
* **/buying's four step headings** — the last large-Lato display step. §2.
* **D6's `noRing` can fire on correct rings.** §4. A `noRing` entry is a lead, not a verdict.
* **`verify-pin-walk`'s fixed 1,200ms wait**, and **`verify-saved-flow`'s port + locator**. §8.
* **`#3b82f6` on /selling and /buying** — the phone-icon stroke, marked in the source as the
  owner's accent blue. It is Tailwind's `blue-500`, i.e. the most default blue on the web, on a
  site whose accent token is `#28a8e0`. Two call sites. **Recorded for the owner, not changed.**
* **The chat widget is still a foreign object on every page** and the review's finding reproduces:
  a `rgb(21,87,176)` bubble and a `rgb(52,168,83)` badge — Google's green — against a palette whose
  blues are `#28a8e0` and `#102c54`. On /search at 390 it sits bottom-left over the results.
  Another project owns it; **recorded, not touched**, as instructed.
* **/selling's hero photograph is not visible.** The source says the scrim "clears toward the
  twilight sky/mansion (right) so the house reads". Measured across six vertical bands at 1440, the
  hero's mean luminance runs 9.1 / 16.5 / 22.6 / 24.8 / 40.4 / 33.6 out of 255 — against /buying's
  23.4 → 58.8, where the house genuinely does read. The claim is not met. **Not changed**: a dark,
  quiet hero is a defensible reading of the brand, brightening it fights the AA floor rounds 27–33
  earned, and which photograph the page wants is the owner's call. **Prepared for him with the
  numbers**, alongside the home-page hero item the review raised.

**Pages 3–10 of the campaign are complete.** What remains from the review's list and is not on any
page I owned: the home page's phone hero photograph, the five identical 44px `h2` with inconsistent
alignment, the seller block's 411px of copy in a 999px section, and "Areas we serve" with its
1×1px heading — all on page 1, which was merged before this round began.
