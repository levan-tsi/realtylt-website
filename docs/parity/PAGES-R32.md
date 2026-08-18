# Round 32 — the pages, one at a time

Ten pages, in owner-value order, each through the same loop: measure and score before
touching anything, plan from the scored gaps, execute, refine with fresh eyes, re-score with
the same instrument. Nothing here adds a colour, a radius, a font or a gradient. Every
animation is transform or opacity on the two existing curve tokens.

---

## 0. The rubric, and why it is a program

A score somebody chooses is not a score. `scripts/score-page.mjs` is the rubric: twelve
dimensions, five points each, sixty total, and every deduction is a written threshold applied
to a measured input. The same file scores page 1 and page 10, before and after.

| # | Dimension | What it measures, and how |
| --- | --- | --- |
| D1 | first-impression hierarchy | above-fold type sizes; ratio of the headline to the next distinct size; count of blocks ≥24px; count of filled CTAs; word count above the fold; is the largest type actually the `h1` |
| D2 | type scale and rhythm | every rendered heading size compared against what `t-display`/`t-h1`/`t-h2`/`t-h3`/`t-eyebrow` produce *at that viewport* (measured by injecting the classes, not assumed); body line-height; count of distinct body sizes; tracking on display sizes |
| D3 | spacing and optical alignment | section padding compared against what `sec-sm`/`sec`/`sec-lg` produce; flex/grid gaps against the 2px grid Tailwind actually uses; distinct left edges of the text columns; padding symmetry |
| D4 | photography treatment | stretched images (natural vs rendered ratio with no `object-fit`); missing `alt`; unsized images (CLS risk); lazy images above the fold; corner radii against the 8/12/16/24/full scale |
| D5 | colour restraint | every `color`/`background-color`/`border-color` on the page resolved and compared against the eleven `@theme` tokens; gradients on any control or text; radii off the scale |
| D6 | state completeness | a **real Tab walk**, each stop judged by clipped-pixel diff and the ring's measured contrast; hover and press on the page's most prominent controls, also in pixels |
| D7 | motion quality | every transition/animation declaration on the page: duration against the 300ms UI budget (interactive elements only), layout-property transitions, curves against the site's two tokens, infinite animations surviving reduced motion, scroll frame p50/p95/worst |
| D8 | copy honesty and voice | em dashes in visitor copy; arrow-glyph CTAs; a fixed list of unverifiable superlatives; vague CTA labels |
| D9 | mobile ergonomics | horizontal overflow at 390 **and** 320 with the offending element named; tap targets under 24px; body copy under 16px; form controls under 16px (iOS zoom) |
| D10 | accessibility floors | AA text contrast (text over photography delegated to `verify-hero-contrast`); controls with no accessible name; heading level skips; landmarks and a single `h1` |
| D11 | performance feel | LCP, CLS, long tasks, scroll frame budget. **Dev-server measured** — LCP/FCP/long-task are before-vs-after signals on the same server, not production numbers. CLS and frame budget are build-independent |
| D12 | resilience (JS off) | renders with JavaScript disabled: is there an `h1`, what share of the copy survives, how many links, is anything stuck on a loading placeholder |

### It is proven able to fail

`node scripts/score-page.mjs / --break` injects a stylesheet and three DOM nodes that commit
the exact defects each dimension hunts. On the home page the same tree scores:

```
              clean   broken
D1  hierarchy   5.0     3.5
D2  type        2.25    3.25   (see note)
D3  spacing     4.0     0.0
D4  photography 4.0     2.0
D5  colour      4.5     2.0
D6  states      3.75    1.0
D7  motion      3.0     1.0
D8  copy        5.0     0.0
D9  mobile      3.0     0.0
D10 a11y        3.5     1.5
D11 performance 3.0     0.0
D12 JS off      5.0     5.0    (unreachable by injection — see below)
TOTAL          46      19.25
```

**This table is SUPERSEDED and the claim above it was wrong. See `docs/parity/PAGES-R33.md` §1.**

An adversarial review re-ran the pair against the committed instrument and got **eight** of twelve
collapsing, not eleven: D7 and D10 were never attacked by the injection at all, and **D2 went UP by
a full point** because the blanket `p{13px} / li{15px} / span{14.5px}` rules homogenised the page's
six real body sizes down to four and cancelled the deduction D2 exists to take. A rule that removes
variety cannot test a rule that punishes variety.

Worse, the numbers above were **stale when they were published**: `home-BROKEN/score.json` is
stamped 23:27 and `home-after/score.json` 00:03, so the proof was run 36 minutes before the
instrument was materially changed and was never re-run. The round record correctly re-measured the
page's *before* with the final instrument and then forgot to re-measure the *instrument's own*
proof.

Round 33 rewrote `BREAK_CSS`/`BREAK_DOM` to be **additive** and re-proved it. The current numbers
live in PAGES-R33.md; the rule now is that the break is re-run after every instrument edit, in the
same session, and the timestamps must post-date the edit.

**D12 still cannot be broken by injection** because the JS-off render runs in its own browser
context the injection never reaches; it is proven able to fail empirically instead, on a
client-rendered page (recorded per page below).

### Six ways this instrument lied on its first run

Recorded because each is a trap the next session will otherwise re-walk.

1. **`oklab()` read as RGB.** Tailwind v4 emits `bg-white/60` as
   `oklab(0.969 -0.0008 -0.0044 / 0.6)`. Taking its first three numbers as RGB yields `[1,0,0]`
   — near black — so black-on-white measured **1.00:1** and the probe invented five AA failures
   on the home page. Only `rgb()`/`rgba()` resolves a background now.
2. **Text over a photograph measured against the placeholder.** The probe blocks
   `**/api/media/**` (MLS Grid is rate-limit sensitive), so a listing card's photo never paints
   and its scrim text was scored against the empty mist frame — `1.09:1`, 24px, five times. Text
   sharing a box with a photo *slot* (an `<img>` overlap **or** a clipped fixed-aspect frame,
   loaded or not) is now delegated to `verify-hero-contrast`, which samples real pixels.
3. **The Tab walk looped.** It reported 26 focus stops on a page with 13: `body.focus()` plus
   `focus()` scrolled the page between the two shots, one stop measured a 99.7% "ring", and
   focus fell back to `<body>` so Tab restarted from the top. Now `blur()` /
   `focus({preventScroll})`, scrollY asserted unchanged across the pair, and a repeated stop
   ends the walk.
4. **`rounded-full` read as a rogue radius.** Tailwind v4 emits it as `calc(infinity * 1px)`,
   which computes to `33554400px`. The page was losing a point for using its own pill token.
5. **The press probe never left the header.** It took the first eight above-fold controls in DOM
   order, which on every page is the site header, and concluded "no control answers a press" on a
   page whose hero CTAs answer one. It probes by prominence now — filled controls first, then by area.
6. **The 300ms UI budget fired on a photograph.** A card's deliberate 1200ms photo zoom and a
   500ms section reveal are documented decorative motion, not UI feedback. The budget applies to
   interactive elements only.

Two more thresholds were corrected rather than fixed: the grid check was "off 4px", which failed
this codebase for using Tailwind's own legitimate half-steps (2/6/10px) — it is the 2px grid now;
and the curve check was splitting `cubic-bezier(0.22, 1, 0.36, 1)` at the first comma, so every
curve on the site read as unknown.

### Where the skills bite, page by page

The four craft skills were invoked with the Skill tool at the start of the campaign
(`emil-design-eng`, `apple-design`, `animate`, `frontend-design`), plus `improve-animations`
once site-wide and `find-animation-opportunities` per page. Provenance is tagged on every change
below. Stated plainly up front: **`apple-design` contributes little to most of these pages.**
Its strengths are fluid gesture-driven motion, velocity handoff, translucent materials, and
typographic craft; these are static marketing pages whose largest gaps are hierarchy, spacing,
photography and copy. Where it earns a line it gets one; where it did not drive the work, it is
not credited. The owner's anti-slop palette and his own luxury language remain boss on colour,
type choice and layout.

### The site-wide motion audit, run once

`improve-animations` recon over 213 source files: **0** `scale(0)` entrances, **0** live bare
`ease-in` (the only match is the comment in `globals.css` that bans it), `transition-all` only
inside comments in `Button.tsx` plus six live instances confined to services/blog components
(`Faq`, `UseCases`, `ServiceToc`, `RelatedPosts`, `FlagshipToc`, `app/blog/page.tsx`) — none on
this round's page list. `transform-origin` is set only on the map popup. Reduced motion is
handled globally with six explicit opt-outs.

**Verdict: motion is not the lever on pages 1–10.** Rounds 30 and 31 spent themselves on it and
the discipline held. The budget this round goes to static craft, with motion touched only where a
page measurably teleports.

---

## Page 1 — HOME (`/`)

### Round A — before: **46 / 60**

`docs/r32/home/score.json`, run 2026-08-17 against `localhost:3100`.
Shots: `1440-fold.png`, `1440-full.png`, `390-fold.png`, `390-full.png`, `jsoff-1440.png`,
`band-00..04.png`, `rg-sellers-1440.png`, `rg-areas-1440.png`.

| D | Score | The measurement behind it |
| --- | --- | --- |
| D1 hierarchy | **5.0** | h1 76px vs next 16px = ratio 4.75; 2 blocks ≥24px above the fold; 0 filled CTAs; 48 words; largest type *is* the h1 |
| D2 type | **2.25** | heading size 24px is off the scale (`76/56/44/30/11`), used by the card prices; 27 body blocks at line-height < 1.45 (e.g. `18px/1.38` on every card address); 6 distinct body sizes (12/13/14/16/17/18) |
| D3 spacing | **4.0** | sections all on the rhythm (80/112/144); gaps all on the 2px grid; **8 distinct text left edges** (127, 143, 432, 445, 746, 793, 821, 1048) |
| D4 photography | **4.0** | 17 images, 0 stretched, 0 missing alt, 0 lazy above the fold, radii on scale; **12 unsized** (CLS risk) |
| D5 colour | **4.5** | 10 distinct colours, 0 gradients, radii all on scale; one off-token: `rgb(251 188 4)` ×11 — Google's gold star in the review badge (owner-decision item, untouched) |
| D6 states | **3.75** | 13 real Tab stops, every one paints a ring, minimum ring contrast **4.49:1**; hover answers on 6 of 7 probed; **press answers on 3 of 7** |
| D7 motion | **3.0** | 171 declarations; 0 over-budget interactive transitions; **1 transitions a layout property** (`width, background-color`); one curve off the two tokens; scroll p50 16.7 / p95 16.8 / worst 33.4ms |
| D8 copy | **5.0** | 0 em dashes, 0 arrow-glyph CTAs, 0 superlatives from the list, 0 vague CTA labels |
| D9 mobile | **3.0** | no overflow at 390 or 320; **2 tap targets under 24px** (the consent checkboxes, 16×16); **18 body blocks under 16px** on the phone |
| D10 a11y | **3.5** | 0 AA text failures once the oklab bug was fixed; landmarks and single h1 present; 0 heading skips; **4 controls with no accessible name** (form inputs) |
| D11 performance | **3.0** | LCP 1472ms, CLS 0.000, worst long task 338ms, worst scroll frame 33.4ms (dev server) |
| D12 JS off | **5.0** | h1 renders, 972 words vs 946 with JS (ratio 1.03), 96 links, nothing stuck |

### What the numbers could not see

Driving the page at 1440 and 390 found four things no dimension scores:

1. **The stats row can read `0 counties served, 0h turnaround, 0+ sites, 0 days a week we
   answer`.** Captured in `1440-full.png`. Verified four ways: with JS off the server renders the
   true values (11 / 24h / 100+ / 7); with a real wheel scroll it counts up correctly; but
   `StatCounter.tsx:29` calls `setDisplay(0)` on mount **unconditionally**, so between hydration
   and the observer firing the page is stating four falsehoods about the business. A visitor who
   lands deeper in the page, or whose viewport already contains the block, reads them.
2. **On a phone the first screen is roughly 700px of empty sky.** `390-fold.png`. The mobile hero
   is a hillside under a large blank sky and the `object-position` crop puts the subject in the
   bottom third, so the headline and the search instrument are jammed against the fold and
   everything above them is featureless grey.
3. **Three controls of near-equal weight sit in one row in the hero** — the search instrument,
   `SELL YOUR HOME`, `SEE HOME VALUE` — and the two secondary pills are adjacent, same size, same
   uppercase tracking, which reads as a segmented control offering alternatives rather than two
   different destinations.
4. **Every form field is labelled by its placeholder only** (both the home-value form and the
   footer form: First Name, Last Name, Email Address, Phone Number, Property Address, Your
   Message). The label disappears the moment the visitor types, and it is the same defect D10
   counts as "4 controls with no accessible name".

Two more, lower down: the **"For sellers" copy is template filler** ("We belong to one of the
strongest real estate brokerages in the area. We have great confidence in our brand and you can,
too.") set in a column that floats in ~290px of empty white; and the **Top Areas block is eleven
hairline pills in a void**, ending at x≈950 of 1440 with no heading, on the page's only statement
of where this business actually works.

### `find-animation-opportunities` — the home page

Two candidates survived the gate; the rest were rejected.

| # | Location | Today | Purpose | Frequency | Motion |
| --- | --- | --- | --- | --- | --- |
| 1 | `LeadForm.tsx:170` | the form is replaced by the success panel as a hard cut | state indication (delight tier) | rare | opacity + 6px rise, 220ms `--ease-out` |
| 2 | `RailPager.tsx:51` | `shown` is a slice, so paging swaps all 8 cards instantly | preventing a jarring change | occasional | the arrival round 31 already shipped for search GRID↔MAP: 6px, 200ms `--ease-out` |

Rejected, with the gate question that killed each:

- `ScrollCue.tsx:20` — a bobbing or nudging chevron. **Rejected: decoration on a navigational
  affordance, and a bobbing chevron is the most templated motion on the web.**
- `LeadForm.tsx:258` — animating the error message in. **Rejected: an error must arrive, not
  animate; the fix for the jolt is reserving the space, not easing it.**
- `LeadForm.tsx:277` — blur-crossfading the button label `Send Message → Sending…`.
  **Rejected: instant is correct for a system response; this is gilding.**
- `WhyCarousel.tsx:119` — the 500ms slide dissolve reads as over budget. **Rejected: an
  auto-advancing marketing carousel is the "marketing/explanatory can be longer" tier, and the
  slower dissolve is the right personality.**
- Hero CTAs, rail arrows, testimonial arrows — **rejected: already carry round 31's press.**

The one genuine motion *defect* on the page is not an opportunity but a rule break:
`WhyCarousel.tsx:176` transitions `width` on the slide dots — a layout property, and the single
D7 deduction.

### Round B/C — what changed, and why each was the highest-ROI move

Provenance is tagged. Where a change came from my own judgement rather than a skill, it says so.

**1. The stats stopped lying.** `StatCounter.tsx` — the zero is now only written while the block
is still below the fold. Highest ROI on the page because it is the only defect that makes the
business look like it has done nothing, and it says so in four sentences at once.
*Provenance: my own judgement, found by driving the page; `emil-design-eng` supplied the frame
("handle edge cases invisibly" — the counter's initial state is an edge case that was reaching
visitors).*

**2. A placeholder is not a label.** `Field.tsx` — every `hideLabel` field now floats its label
instead of hiding it: identical at rest, rises and shrinks on focus or fill. Pure CSS
(`:placeholder-shown` + `:focus`), no JS, works with scripting off. It affects both forms on this
page and every form on the site.
*Provenance: `frontend-design`'s writing section ("a label labels, an example demonstrates, and
nothing quietly does double duty"); `apple-design` §16 on grouping and mapping; the
scale-by-transform technique and the reduced-motion reasoning from `animate` / `emil-design-eng`.*
Measured, before and after:

```
before  the label is sr-only; typing leaves six anonymous boxes
after   rest    label translate 0 15px  scale 1     field h=50
        focus   label translate 0 6px   scale 0.78  transition translate,scale,color 0.15s
        filled  label translate 0 6px   scale 0.78
```

The first attempt measured `transform: none` and a 6px teleport: Tailwind v4 emits `translate`
and `scale` as their own properties, so `transition-[transform]` animates neither. Round 30 lost
half a day to the same trap on the Button's press.

**3. The hero search field had almost no focus state.** `app/page.tsx` — the input carries
`focus:outline-none` and hands its focus state to the instrument, which answered with
`bg-black/45 → /55`: over the photograph that is about **4 in 255 per channel**, under **0.4%** of
the pixels in the field's own box, against the site's own `focus-visible ≥ 3:1` floor. The
instrument now takes a white ring, scoped `has-[input:focus-visible]` so tabbing on to Search
shows one ring rather than two. Measured after: `outline 2px solid rgb(255,255,255) offset 2px`.
*Provenance: my own judgement, found by the rubric's Tab walk.*

**4. The page's only layout-property transition.** `WhyCarousel.tsx` transitioned `width` on the
slide dots. The dot is a full 24px pill at all times now and its shape is carried by `clip-path`
(composited), with `round 4px` keeping the ends round through the transition — a `scaleX` would
have flattened the circle into a bar.
*Provenance: `emil-design-eng` / `animate` hard rule (transform and opacity only; `clip-path` is
the sanctioned fourth).*

**5. Paging a rail swapped eight cards as a hard cut.** `RailPager.tsx` — reuses round 31's
`.rlt-view-in` (6px, 200ms), replayed by `key={page}` and gated by `swapped` so it stays silent on
first paint, where the section's own `.reveal` is already arriving.
*Provenance: `find-animation-opportunities` (row 2), executed against the site's existing
vocabulary.*

**6. The success panel.** `LeadForm.tsx` — arrives with `.rlt-pop-in`, the entrance the qualifying
wizard already uses. The visitor has just handed over a phone number; a jump cut was the interface
saying nothing at the one moment it should.
*Provenance: `find-animation-opportunities` (row 1) — rare/first-time tier, where the delight
budget legitimately lives.*

### Round C — refused, with the evidence

**The mobile hero's empty sky. Not fixable in CSS, and the measurement that said otherwise was
wrong.** On a phone the first screen is roughly 700px of featureless grey. The source is
`valley-aerial.jpg` at **1024×682**; a phone hero box is narrower than the photo's aspect, so
`object-cover` always scales by height and shows the photo's *full* height — the sky is 30% of the
picture and no `object-position` can crop it away. Horizontally there is a choice, and measuring
the 37.6% slice a phone actually sees pointed hard to the right-hand side on all three criteria at
once: detail 66.8 → 91.1, the bottom 45% darker (mean 82.6 → 49.6, more contrast headroom under
the type) and quieter (sd 52.3 → 44.4). **Rendering both crops disproved it**
(`docs/r32/home/crop-compare.png`): at 85% the extra "detail" is a blown highlight beside dark
foliage and the ridge line goes flat, while the centre crop keeps the diagonal sweep and the
foreground rock. Kept `object-center`. Fixing this properly needs a different photograph — an
owner decision, alongside the licence note already in `app/page.tsx`.

**The two secondary hero CTAs.** They read as a segmented control offering alternatives rather
than two destinations, which was on my list until I read the source: they are **owner-directed**,
twice in one day ("give it a box or proper recognizable CTA", then "similar box shape type as
search but see through background"). Settled decision, not re-litigated.

**The "For sellers" copy.** Template filler by any writing standard, and marked in the source as
**the owner's own words, verbatim**. Untouched. A prepared alternative for him to accept or
reject, built only from facts the site already states elsewhere:

> Selling starts with knowing the number. We work 11 counties and boroughs, we can put a cash
> offer in front of you inside 24 hours, and your listing reaches over 100 sites. Tell us the
> address and we will come back with what your home is worth and what we would do to sell it.

**The consent checkbox.** Scored as a 16px tap target; the source already documents that the
padded `<label>` row carries the target. The instrument was wrong, not the page.

### Re-score — **48.25 → 51.75 / 60**

The before figure is **not** the 46 first measured. The instrument changed materially during the
round (accessible names resolved from `<label for>`, tap targets measured on the wrapping label,
focus rings followed to whichever ancestor draws them), so the pre-round-32 tree was re-scored
with the **final** instrument by restoring the five source files from `60c0921` and running it
again. Comparing a before taken with one instrument against an after taken with another is how a
round invents its own improvement.

| D | before | after | what moved |
| --- | --- | --- | --- |
| D1 hierarchy | 5.0 | 5.0 | — |
| D2 type | 2.25 | 2.25 | untouched this round (see carried list) |
| D3 spacing | 4.0 | 4.0 | — |
| D4 photography | 4.0 | 4.0 | — |
| D5 colour | 4.5 | 4.5 | — |
| D6 states | 5.0 | 4.5 | see note |
| D7 motion | 3.0 | **4.5** | the layout-property transition is gone |
| D8 copy | 5.0 | 5.0 | — |
| D9 mobile | 4.0 | 4.0 | — (corrected: see the note below this table) |
| D10 a11y | 5.0 | 5.0 | — |
| D11 performance | 1.5 | 4.0 | see note — this dimension flaps on a dev server |
| D12 JS off | 5.0 | 5.0 | — |
| **total** | **48.25** | **51.75** | **+3.5** |

**Correction, made in round 33 after an adversarial review, verified against
`docs/r32/home-after/score.json` and `docs/r32/home-before-final/score.json`.** Three numbers in
this section were transcribed by hand and three of them were wrong:

* The after-table printed **D9 = 5.0** with the note "tap targets clean once measured on the real
  target". Both JSON files say **D9 = 4.0**. D9 did not move during round 32 at all — the 3.0 → 4.0
  it appeared to gain happened between the first run and the re-baseline and was caused by the
  *instrument* change (tap targets measured on the wrapping label), not by any change to the page.
  The table above is corrected.
* With the wrong D9 the after column **summed to 52.75 while reporting 51.75**. With the real 4.0 it
  sums to 51.75, which was right all along; the table was the error, not the total.
* The decomposition below read "+1.0 measured (D7 +1.5, D9 +1.0, D6 −0.5)", which sums to **+2.0**.
  The headline +1.0 is correct; the attribution was not. It is **D7 +1.5, D6 −0.5, D9 0.0**.
* The table also contradicted its own carried list, which said "18 body blocks under 16px on a phone
  (D9's remaining deduction)". A dimension cannot be full marks and carry a deduction.

The lesson is mechanical, not moral: **generate these tables from `score.json`, never by hand.**

Three honest notes on that table:

* **D6 went DOWN 0.5, and the rubric is right to say so.** Before, the hero search stop registered
  as "has a ring" only because the enlarged clip caught the form's background wash; after, the
  form draws a real ring and one *other* stop now measures a ring contrast under 3:1. The page is
  better and the score is lower — that is the instrument working, and the sub-3:1 stop is carried
  below rather than papered over.
* **D11 flaps run to run on the dev server** (1.5 / 3.0 / 4.0 / 4.0 across four runs of the same
  tree; LCP 1448–2324ms, one dropped scroll frame appearing and disappearing). Its movement here
  is **noise, not a gain**, and I am not claiming it.
* Without D11's noise the honest movement is **+1.0 measured (D7 +1.5, D6 −0.5, D9 0.0)** plus
  three defects the rubric does not score at all: the stats that read zero, the labels that
  vanished on typing, and the two hard cuts.

### Carried on HOME, not done

* **D2, 2.25/5 — the biggest remaining number on this page.** 24px card prices sit off the type
  scale; 27 body blocks run at line-height under 1.45 (card addresses at `18px/1.38`); six
  distinct body sizes (12/13/14/16/17/18). This is `ListingCard`, shared with /search and the
  listing detail, so it belongs to page 2 or 3 rather than being patched twice.
* **18 body blocks under 16px on a phone** (D9's remaining deduction) — same `ListingCard` origin.
* **12 unsized images** (D4, CLS risk).
* **8 distinct text left edges** at 1440 (D3) — the "For sellers" column floating in ~290px of
  white is the visible symptom.
* **One focus stop under 3:1** (D6).
* **The Top Areas block**: eleven hairline pills ending at x≈950 of 1440, no heading, on the
  page's only statement of where this business works. Real design work, not a patch.
* **The Google badge** (`rgb(251 188 4)` ×11, the page's only off-token colour) — owner-decision
  item, untouched.

---

## Handoff

**Done:** the rubric and its instrument (`scripts/score-page.mjs`), and **page 1 of 10 (HOME)**
through Round A → B → C with a before and after measured by the same instrument.

**Not started:** pages 2–10 — listing detail, search, selling, home value, buying, connect, top
areas + a county page, who we are, financing.

A successor starts by running `node scripts/score-page.mjs <path> --label <name>` against a dev
server on :3100 and reading the deductions. The instrument faults recorded above are all fixed, so
the next page's first run should be trustworthy — but treat it as a shakedown anyway and check
each deduction against the real DOM before assigning blame. `--break` re-proves the instrument can
fail before you trust any number.
