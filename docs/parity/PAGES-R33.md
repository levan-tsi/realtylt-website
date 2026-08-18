# Round 33 — the pages, continued (page 2 onward)

Continues round 32's loop and uses round 32's instrument, `scripts/score-page.mjs`, **unchanged —
not one threshold, not one line**. Comparing a before taken with one instrument against an after
taken with another is how a round invents its own improvement, and page 1's record is only
comparable to these if the ruler is identical. Where a deduction is wrong, it is recorded as wrong
with the measurement that proves it, and the point is left on the floor.

Read `docs/parity/PAGES-R32.md` first. Its rubric table, its six instrument faults and its page-1
record are not repeated here.

---

## 0. Two instrument faults found before anything was scored

Recorded first because both would have silently produced fiction.

**1. Git Bash rewrote the page path into a Windows file path.** `node scripts/score-page.mjs
/homes-for-sale/NY/newburgh/...` arrives in the process as
`C:/Program Files/Git/homes-for-sale/NY/...`, so `argv.find(a => a.startsWith("/"))` matches
nothing and the scorer silently falls back to its default — `/`. The first "listing detail" run of
this round is the **home page**: `h1 "Let's Find Home"`, 96 links, 972 words. It reported a
plausible 50.75/60 for a page it never opened. Every run in this round is prefixed
`MSYS_NO_PATHCONV=1`, and the accidental run was kept and relabelled
`docs/r32/home-r33-rebaseline` — it is the home baseline this round measures against.

**2. A listing page cannot be scored with media blocked.** The scorer aborts `**/api/media/**`
because MLS Grid is rate-limit sensitive, and on a marketing page that is right. On a listing page
the gallery is 400px of the first viewport, and `ListingPhotos` deliberately renders **no chrome at
all** until a hero photo has actually arrived — so a blocked run scores a page with no arrows, no
view-mode buttons, no view-all pill, no lightbox trigger, and 4 images instead of 11.

`--media` is safe for these listings and this was checked in the route rather than assumed:
`app/api/media/[id]/[idx]/route.ts` serves the first `photosMirrored` indices as a **302 to the
public Supabase Storage object** — "ZERO MLS Grid DATA-API calls". Both listings driven here are
100% mirrored (50/50 and 1/1), so every photo request is our own bucket and the account is never
touched. Every score below is a `--media` run.

---

## Page 2 — LISTING DETAIL (`/homes-for-sale/…`)

Driven on two real listings, deliberately chosen as opposite ends of what the feed hands us:

| | listing | photos | facts |
| --- | --- | --- | --- |
| **photo-rich** | `KEY1002622` · 1544 Route 300, Newburgh | 50 mirrored | 3 bed / 2 bath / 2,100 sqft, 1,982-char description, 3 schools |
| **photo-poor** | `KEY1039608` · 805 Adee Avenue, Bronx | 1 mirrored | quadruplex: **no** beds, baths or sqft, 234-char description, no schools |

### Round A → C: **41 → 52.5** (rich) and **45 → 51.5** (poor)

Same instrument, same listings, same dev server. Per dimension:

| D | rich before | rich after | poor before | poor after |
| --- | --- | --- | --- | --- |
| D1 hierarchy | 2.5 | **5.0** | 2.5 | **4.0** |
| D2 type | 1.0 | **3.5** | 1.0 | **3.5** |
| D3 spacing | 1.5 | **3.5** | 1.5 | **3.5** |
| D4 photography | 5.0 | 5.0 | 4.0 | 4.0 |
| D5 colour | 5.0 | 5.0 | 5.0 | 5.0 |
| D6 states | 2.5 | **4.0** | 4.5 | **5.0** |
| D7 motion | 3.0 | **5.0** | 5.0 | 5.0 |
| D8 copy | 5.0 | 5.0 | 5.0 | 5.0 |
| D9 mobile | 4.0 | 4.0 | 4.0 | 4.0 |
| D10 a11y | 5.0 | 5.0 | 5.0 | 5.0 |
| D11 performance | 1.5 | 2.5 | 2.5 | 2.5 |
| D12 JS off | 5.0 | 5.0 | 5.0 | 5.0 |
| **total** | **41** | **52.5** | **45** | **51.5** |

**No dimension went down on either listing.** D11 is dev-server noise and page 1's record already
says so; excluding it entirely the honest movement is **39.5 → 50 (+10.5)** and **42.5 → 49
(+6.5)**.

Evidence: `docs/r32/listing-rich-{A,C}/score.json`, `docs/r32/listing-poor-{A,C}/score.json`.
Shots: `1440-fold.png`, `1440-full.png`, `390-fold.png`, `390-full.png`, `jsoff-1440.png` in each,
plus `docs/r33/listing/` for the A/B renders named below.

### The defect the rubric never saw, and it was the biggest one on the page

**The entire conversion column was invisible on first paint.** On the photo-rich listing, Request a
Tour, Request Info, the day strip, Make an Offer, the agent card and the lead form rendered at
`opacity: 0` and stayed there until the visitor scrolled — an empty white column beside the facts,
which is exactly what `docs/r32/listing-rich-before/1440-full.png` shows.

The mechanism took three attempts to name honestly, and the first two were wrong:

* `<Reveal>` observes with `{ threshold: 0.12 }`. A threshold is a fraction **of the observed
  element**.
* My first diagnosis measured the `<aside>` — 836px tall at y=694 in a 900px viewport, 166px
  visible, which is 19.9% and clears 0.12 comfortably. I wrote that diagnosis into a test and **the
  test failed**, which is the only reason it did not ship.
* The observed element is not the aside. It is the wrapper Reveal renders, which is a **grid cell,
  stretched to the height of the whole row: 1,941px**. 166 visible pixels are 8.6% of that, under
  the threshold, so `is-visible` was never applied. The photo-poor listing put the same column 40px
  higher, crossed the line, and rendered — which is why the bug looked like a data difference.

Two separate fixes, each justified on its own:

1. **`Reveal.tsx` now uses a pixel rule**, `{ threshold: 0, rootMargin: "0px 0px -80px 0px" }`.
   "Reveal once a bit of it is genuinely on screen" is a pixel statement, not a ratio. For an
   ordinary ~300px card the old pair required 76px of travel past the fold and the new one requires
   80px, so nothing about the site's existing reveals visibly changes; for anything tall it now
   fires at all. Held by `components/ui/reveal-threshold.test.ts` (7 cases), which computes what the
   observer computes rather than asserting a literal, and which **fails against the pre-change
   tree**.
2. **The conversion column is no longer scroll-gated at all.** A reveal earns its place when
   something arrives; this column is simply there, next to the facts, from the moment the page
   loads. The only thing the fade could add was a way for it to be missing.

Removing the wrapper introduced a regression I caught by re-measuring rather than by assuming:
the `<aside>` became the grid item itself and stretched to 1,941px, and **a sticky box that already
spans its whole row has nothing to travel through** — the sticky contact card had silently become
an ordinary scrolling one. `self-start` restores it: measured 836px tall, pinning at 96px
(`lg:top-24`) after a 700px scroll.

### What changed, and why each was the highest-ROI move

**1. The address stopped competing with the price.** `h1` was `text-3xl md:text-4xl` — 36px beside
a 30px price, ratio **1.20**, which reads as two bold blocks arguing rather than a headline and a
fact. It was also 36px on a scale whose steps are 76/56/44/30/11, i.e. a size the design system
does not contain. It is `.t-h2` now (30 → 44 fluid): ratio **1.47**, and D1 goes 2.5 → 5.0.
`font-normal` is a deliberate half-step off the scale's own 300 and was **rendered four ways before
choosing** (`docs/r33/listing/h1-compare.png`): at 300 a fourteen-character address goes weedy and
the bold price becomes the headline; at 600 it is blunt at 44px. The scale's 300 is calibrated for
long marketing headlines, not a three-word title.
*Provenance: found by the rubric's D1 ratio; the weight chosen by rendering. `frontend-design`
("typography carries the personality… make the type treatment a memorable part of the design")
supplied the frame that the address, not the price, is this page's thesis.*

**2. Every body heading was an ad-hoc 24px.** "About this home", "Highlights", "Inside", "Outside &
utilities", "Schools", "Similar homes" — six headings at a size the scale does not have. All are
`.t-h3` (22 → 30) now. The market-insights eyebrow, hand-rolled as `text-xs font-bold uppercase
tracking-[0.18em]`, is `.t-eyebrow`, which is that decision already made.
*Provenance: my own judgement, from the D2 off-scale list.*

**3. Small text stopped being cramped, and it was Tailwind's default doing it.** Body copy here is
16px/1.72; Tailwind then hands 14px a line-height of 1.4286 and 12px a line-height of 1.333 —
leading that gets *tighter* as type gets smaller, which is backwards. Nobody chose 1.43; it was
simply what the framework handed out, on 12 blocks of this page and 27 of the home page. A 1.5
floor is set once in `@theme` (`--text-sm--line-height`, `--text-xs--line-height`) and is still
tighter than the 16px body's 1.72, so a caption is still visibly denser than a paragraph.

Blast radius measured **before** shipping (`scripts/_scratch-r33-lh.mjs`): document height +26px on
listing, +16px on home, +10px on search at 1440; **zero** horizontal overflow at 1440, 390 or 320;
and the search card — whose geometry is the owner's own "2+2+2" density target — went 240px → 241px
with the photo band's share of it holding at 59%.
*Provenance: my own judgement. `emil-design-eng`'s "unseen details compound" is the argument for
fixing it at the definition rather than at 473 call sites.*

**4. The page ignored the site's vertical rhythm.** Every other page picks `sec-sm`/`sec`/`sec-lg`
(80/112/144 at desktop); this page's three marketing bands were an ad-hoc `py-12 md:py-16` (48/64),
which is why three consecutive full-width bands read cramped against the same bands on /buying and
/financing. All three are `.sec-sm` now. The facts section deliberately keeps its tighter 40px top
— it sits directly under the photo band and 80px there pushes the price out of the first viewport —
so D3 keeps one honest 0.5 deduction rather than a clean sweep bought by damaging the page.
*Provenance: my own judgement, from the D3 off-rhythm list.*

**5. The gallery answered a press with nothing.** Round 31 named the site's press and reached every
control it could; the gallery's own chrome was not one of them. Both arrows, the three view-mode
buttons and the view-all pill carried `transition-colors` and no `:active` state at all — as did
Make an Offer, Share, and the tour day strip. They carry `PRESS` now.

A probe told me these controls *did* press, at 18–37% of their pixels, and that was **the 1200ms
`photo-zoom` still running underneath**, not a press: waiting 320ms after hover and shooting 190ms
later photographs a zoom mid-flight. The source settled it — there was no `:active` anywhere.
*Provenance: `emil-design-eng` (a press must answer inside ~160ms, and `:active` is felt on any
input, including every touch device that never hovers).*

**6. Fourteen focus rings on a photograph, all under the site's own 3:1 floor.** The gallery is
`<section class="bg-ink">`, so globals.css's dark-surface rule painted every control in it a
**white** ring — correct for the section, wrong for the surface the ring lands on, which is the
photograph. Tab-walked with real keys on both listings and judged in clipped pixels
(`scripts/_scratch-r33-gallery.mjs`):

```
rich   heart 1.10 · whole tile 1.00 · prev 2.43 · next 1.90 · photos 1.74 · street 1.84 · map 1.73 · view-all 1.59
poor   heart 1.36 · whole tile 1.01 · photos 1.83 · street 1.72 · map 1.78 · view photo 1.80
```

The fix is not a different colour — no colour survives an arbitrary photograph — it is to stop
drawing the ring *on* the photograph. These controls all carry their own `bg-ink/55..70` body, so
the ring moves inside it (`.photo-zoom :focus-visible { outline-offset: -2px }`). **Descendants
only**, deliberately: the side tiles' own rings already land on the black band between tiles at
18:1, and pulling those inside would move a ring that works onto the photograph.

The one control with no body of its own is the whole-tile trigger — it *is* the picture. On
keyboard focus the tile dims instead, which gives the white ring a known surface and says plainly
that the photograph is the button. `/55` is chosen from the worst case, not by eye: a blown-out
white sky is 255, 255 × 0.45 = 115, and white on 115 is **3.66:1** — over the floor for any
photograph the feed can hand us. At `/45` a white sky lands at 2.9:1.
*Provenance: my own judgement, found by the rubric's Tab walk; `apple-design`'s "the ring must be
legible against the material behind it" is the same idea stated as a rule.*

**7. The side tiles were a button wrapping a photograph; the hero is a photograph with a button
over it.** That one difference cost two things: the photo's deliberate 1200ms zoom lived *inside* a
control, so it read as 1200ms of UI feedback (the identical zoom on the hero and on every
ListingCard is never read that way, because there the photo is a sibling of the link rather than
its child); and the tile had no way to carry the hero's focus treatment. Same markup as the hero
now. D7 goes 3.0 → 5.0.
*Provenance: my own judgement, from the D7 deduction; the structural rule is `emil-design-eng`'s
"the control is the control".*

**8. The loading skeleton was the last motion nobody had chosen.** `animate-pulse` runs on
Tailwind's `cubic-bezier(0.4, 0, 0.6, 1)`, the only curve on the listing and search pages outside
the site's two tokens. The breathe is right; it needed naming. `.rlt-skeleton` runs on
`--ease-move`, the site's symmetric curve, which is what a symmetric loop is for.
*Provenance: `animate` / `improve-animations`' rule that a curve outside the system is drift, and
globals.css's own "naming it makes it a decision instead of a habit".*

### The shared `ListingCard` — page 1's biggest carried item

Page 1 carried **D2 = 2.25/5** and named `ListingCard` as the offender, shared by home, search and
listing detail. Fixed once, here:

* the overlay card's address was `text-lg font-medium leading-snug` — 18px at 1.375, over a
  photograph where it needs more air, not less. That one class was **16 of the home page's
  remaining sub-1.45 blocks**. It is `leading-normal` now; `min-h-[2lh]` still reserves exactly two
  lines, so every card in a rail grows by the same 4.5px and the price tops stay level, which is
  the whole reason that block is reserved.
* `lg:text-[13px]` on the plain card's address is gone. It was a one-off size between the two real
  steps, and `text-sm` carries the line-height, so the line **box** is unchanged and only the
  glyphs go 13px → 14px.
* `gap-px` → `gap-0.5` on the status chips: 1px was the only gap on either page off the 2px grid.

Two more one-off sizes, off this page but the same drift: home's "For sellers" block set its two
paragraphs at **two sizes and two leadings** (17px/1.7 then 16px/1.75) — one size and one leading
now, with the colour still carrying the lead-in; and the footer's two legal paragraphs were an
arbitrary `text-[13px]`, now `text-sm`. (The 13px *labels* in the header nav and the filter chips
are a different thing and are left alone.)

**Home, re-scored with the same instrument to prove the shared fix carried:**

| D | before | after | |
| --- | --- | --- | --- |
| D2 type | 2.25 | **4.25** | +2.0 — `badLH` 27 → 0, body sizes 6 → 4 |
| D7 motion | 4.5 | **5.0** | +0.5 — the skeleton curve |
| D11 performance | 2.5 | 1.5 | −1.0, dev-server noise (see below) |
| all others | | unchanged | |
| **total** | **50.75** | **52.25** | **+1.5** |

Excluding D11 the movement is **48.25 → 50.75 (+2.5)**, and **no dimension regressed**.
`docs/r32/home-r33-rebaseline/score.json` vs `docs/r32/home-r33-final/score.json`.

### Deductions I am declining, with the measurement

Each of these is a point left on the floor on purpose. None is a rubric edit.

**D4, "unsized images (CLS risk)" — a false positive, and it also disproves a page-1 carried item.**
All five flagged images on the photo-poor listing are Next `<Image fill>` inside fixed-aspect or
fixed-height parents: hero 1216×400, portrait 54×54, three card photos 390×186. A `fill` image is
`position:absolute; inset:0` and is dimensionally pinned by its parent, so it cannot shift layout —
and **measured CLS is 0.000**. Page 1's carried "12 unsized images (D4, CLS risk)" is the same
pattern and is not a defect.

**D4, "lazy image above the fold" — declined for mobile's sake.** The three side gallery tiles are
`loading="lazy"` and above the fold at 1440. Their column is `hidden md:grid`, so making them eager
would make **every phone fetch three photographs it never displays**. Lazy is protecting the
majority case.

**D6, "focus ring under 3:1" — the metric averages a 2px ring with everything else in the clip.**
The rubric's ring contrast is the mean colour of *all* changed pixels against the mean of what was
there before. On a control with `backdrop-blur`, adding an outline forces a repaint of the blurred
backdrop, so ~44% of the clip changes and a 2.6% ring is drowned. Measured the honest way — the
ring's own pixels against their immediate neighbours in the focused frame
(`scripts/_scratch-r33-ringpx.mjs`, `_scratch-r33-ring2.mjs`):

```
gallery arrow, after the fix   818 ring px    vs its own surround  10.95:1
side tile, after the fix     6,741 ring px    vs its own surround  16.60:1
```

The remaining flagged control is the heart, and it **passes by construction**: its body is
`bg-ink/55`, so over even a pure-white sky it renders at rgb(115) and a white ring on 115 is
**3.5:1**. The control's own alpha bounds the worst case; there is no photograph that can make it
fail. Screenshot: `docs/r33/listing/heart-focus.png`.

**D2, "off-scale heading sizes" — the site runs a second type system and only one of them is
committed.** The remaining off-scale sizes are not headings at all: `$3,258.37` (20px), and the
market-insight figures `66` / `$513,875` / `178 days` (36px). Together with the card price (24px)
and the facts row (18px) they are a coherent **numeric** voice — `font-mono`, semibold, tight
tracking — used deliberately and consistently, and chosen ad hoc four separate times. The rubric
only knows the five committed display classes and reads every one of these as a heading off the
scale.

I did **not** extend the scale probe to teach it about them: adding classes to the instrument until
my page passes is precisely the move the rubric exists to prevent. And the donut total cannot
simply grow into `.t-h3` — rendered at 30px it **clips inside the donut ring**
(`docs/r33/listing/calc-compare.png`). Committing a numeric scale is a system-level decision that
should be made once, and it belongs on the page where that scale is the subject (financing / home
value), not smuggled in here. **Carried, and it is the largest single honest deduction left.**

**D3, "more than 4 distinct text left edges" (112, 127, 152, 246, 446, 789, 821, 890)** — most are
real columns: the mortgage panel's two-column form, the spec list's `130px` label column, the
contact rail. One is worth a later look — the footer's content column starts at **x=127** while
every page's main column starts at **x=112**, a 15px disagreement on every page of the site.
Carried to the footer's own pass.

**D9, "body copy under 16px on mobile" (16 blocks)** — a real one, partly. The genuine prose is
"Tours, questions, offers…", "Know your budget before you tour", "Estimate your mortgage payment…"
and the consent label, all 14px. The rest are the MLS attribution (11px compliance boilerplate,
correct as-is) and card stat lines like "3 bd | 3 ba | 1,833 sqft", which the rubric's ≥8-word test
reads as a sentence and which are data. The right fix is a named class that distinguishes *small
running copy* (16px on a phone, 14px from `md`) from *small label*, which is a distinction
`text-sm` cannot express. Not done — carried, and it applies to every page.

**D1, ">2 filled CTAs above the fold" on the photo-poor listing** — the three are Make an Offer, In
Person Tour, and the **selected day chip**, which is filled only because a chosen date paints
`bg-ink`. A selected date is not a competing call to action. The other two are the conversion unit,
and they are only above the fold now because the column stopped being invisible.

### Gates

All run in the foreground, all my own runs, on this tree.

```
npx tsc --noEmit          clean
npm test                  964 passed / 71 files   (baseline 957 + 7 new)
npm run build             clean (dev server killed first)
verify-press-feedback     PASS 15/15
probe-reduced-motion      PASS  (15 sections, 0 hidden, 0 reveals armed)
verify-hero-contrast      PASS  (176 painted text runs across 8 pages)
verify-marker-reconcile   PASS 11/11
verify-map-zoom-ladder    PASS  (20 rungs, 0 count circles, 0 orphans)
verify-map-popup          PASS
verify-viewport-scope     PASS
verify-pin-walk           PASS — see below
overflow sweep            390 and 320, six surfaces: no overflow anywhere
JS disabled               six surfaces: h1 present, 0 of 10 reveal blocks hidden on home
                          (0/7 buying, 0/10 financing), `scripting: none` matches, nothing stuck
```

**`verify-pin-walk` is timing-fragile and it is not this round's doing.** It failed, passed, then
failed again on the same pin. Line 77 waits a **fixed 1,200ms** after `domcontentloaded` before
querying for a client component that must hydrate and read the saved result set — on a dev server
that compiles routes on demand. Warming the listing route with two `curl`s first made it
**PASS three times out of three**. The gate needs a wait that can survive a cold route; that repair
belongs to the map owner, not to a design round. Carried.

**JS-off note on the sweep's first version:** it flagged 57 "invisible blocks" on the listing page.
That was my own filter counting by-design hidden dialogs and unloaded images. Asking the precise
question — *is any reveal-gated block still invisible with scripting off* — returns 0 of 10 on
home, and `matchMedia("(scripting: none)")` does match, so globals.css's escape hatch works.

### Where `apple-design` did and did not apply

Page 1 recorded honestly that `apple-design` barely applied to a static marketing page. On the
listing detail it earned exactly one line — the principle that a focus indicator must be legible
against the *material* behind it, which is the whole of change 6 — and nothing else. Its strengths
are gesture-driven motion, velocity handoff and translucent materials; the lightbox is the only
gesture surface on this page and this round did not touch it. `find-animation-opportunities` was
run over the page and produced no candidate that survived its own gate: the two hard cuts it would
have flagged (the tour tab switch, the day-strip page) are keyboard-and-pointer state changes seen
many times per visit, which is the "remove or drastically reduce" tier.

### Carried on LISTING DETAIL, not done

* **The numeric type scale** — 36/24/20/18 chosen four times, uncommitted. The largest honest
  deduction left on the page (D2, −1.5). System decision; belongs with financing / home value.
* **`.t-small`** — a named class for small running copy, 16px on a phone. D9, −1, every page.
* **The footer column's 15px disagreement** with every page's main column (D3).
* **`verify-pin-walk`'s fixed 1,200ms wait** — a gate that cannot survive a cold route.
* The mortgage panel's donut is too small for the figure it has to hold; at `.t-h3` the total
  clips. Worth resizing when financing is scored.

---

## Handoff

**Done:** page 2 of 10 (LISTING DETAIL), Round A → C on two real listings, plus home re-scored on
the same instrument to prove the shared `ListingCard` fix carried and regressed nothing.

**Not started:** pages 3–10 — search, selling, home value, buying, connect, top areas + a county
page, who we are, financing.

A successor should keep `MSYS_NO_PATHCONV=1` on every scorer invocation, pass `--media` for any
page whose subject is photography (checking first that the listing is mirrored), and warm a route
before running `verify-pin-walk`.
