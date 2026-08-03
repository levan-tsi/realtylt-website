# Design assessment — round 19

Written 2026-08-03, before any code changed. Every number here was measured, and where a thing
was checked in a browser it says so.

The owner's brief for this round was **"general boxes and all"** and his standing note that the
site is *"great but I think we could do it better."* He also gave two verdicts at the start of the
round: **run the photo backfill in chunks**, and **none of the four hero candidates ships** — keep
looking. So the hero stays as it is and this round spends itself on the box vocabulary and the
detail work.

---

## 1. What already reads luxury

Worth writing down, because the temptation in a design round is to churn work that is already
good.

- **The monochrome discipline holds.** Black, white, `#f3f5f8` mist, one photograph. No purple, no
  gradient text, no neon. On a page of 16 listing cards it still reads calm.
- **The type system is genuinely good.** A display serif used *only* for headlines over Lato for
  everything else, on a fluid four-step scale (`.t-display` / `.t-h1` / `.t-h2` / `.t-h3`) with a
  single signature move: the emphasised half of a headline goes one weight up in the same face,
  never a second colour and never a second family. That is a real point of view.
- **Vertical rhythm is already tokenised** — `.sec-sm` / `.sec` / `.sec-lg`, three steps, replacing
  five ad-hoc paddings. Sections do not drift.
- **The listing card** is the strongest object on the site: photo, price and address in a dark
  gradient over the image, status chip, hover lift. It survives a grid of eight without noise.
- **The accessibility and no-JS floor is real, not claimed.** `.reveal` is forced visible under
  `@media (scripting: none), (prefers-reduced-motion: reduce)`, so the scroll reveals cannot hide
  content from a visitor whose browser will not run the observer. Verified this round.

## 2. What reads generic, and why

### 2a. The box vocabulary has re-rotted. This is his complaint, and it is measurable.

The tokens exist and are well argued. `app/globals.css` declares exactly two hairlines with a
comment explaining that greys had once "drifted into seventeen near-identical greys … which is not
a set of decisions, it is a set of accidents".

**A previous round fixed this, and it came straight back.** Measured across 119 `.tsx` files in
`components/` and `app/`:

| | count | what the system allows |
|---|---|---|
| distinct corner radii | **26** | 5 (`lg` 8 · `xl` 12 · `2xl` 16 · `3xl` 24 · `full`) |
| hardcoded hairline greys | **13** | 2 (`line` `#ddd`, `line-strong` `#ccc`) |
| distinct arbitrary shadows | **16** | none declared |

The 13 greys, none of them tokens: `#e3e6ea` (12 uses) · `#e5e7eb` (8) · `#dfe4ea` (4) · `#d8dce1`
· `#eceff2` · `#d9dde3` · `#d9dde2` · `#c3c9d2` · `#d5dbe2` · `#cfd4da` · `#eef1f4` · `#dcdcdc` ·
`#eee`. Several are a single unit apart. Nobody chose these against each other; they were each
chosen alone.

**The shadows are the worse half, because they carry light.** Sixteen arbitrary values, and they
are in *two different hues*: `rgba(0,0,0,…)` pure black and `rgb(16 24 32 / …)` blue-black. Four
of them are the same "medium raise" idea at -18px, -20px and -22px spread. A luxury surface has
one light source. This one has two, and the difference is visible where a `services` card sits
near a `blog` card.

**Why it re-rots: there is no gate.** Tokens with no enforcement are a style guide, and a style
guide loses to whoever is typing. That is the actual finding, and the fix that makes this stick is
a test, not a find-and-replace.

### 2b. The same object is drawn twice, and the two copies have already drifted

`LaptopFrame` exists **verbatim in both** `app/buying/page.tsx:274` and `app/selling/page.tsx:526`
(14px bezel / 10px border / 4px screen / 10px + 8px hinge), along with a copy-pasted browser
chrome block. The phone did not stay in sync:

| | buying | selling |
|---|---|---|
| body radius | `rounded-[30px]` | `rounded-[20px]` |
| bezel | `border-[9px]` | `border-[6px]` |
| screen radius | `rounded-[22px]` | `rounded-[14px]` |
| mini-card border | `border-white/10` | `border-[#eceff2]` |

Two different phones for one idea, on two pages a visitor sees in the same session. This is what
"the same thing drawn three different ways" looks like in the code.

**Important: their radii are not violations.** These are representational drawings — a laptop
screen really does have a small corner inside a big bezel. Forcing them onto the 8/12/16/24 UI
scale would make the drawings wrong. The correct rule is that the corner scale governs **UI
chrome**, and representational artwork is exempt and scales its radii to the object it depicts.
That exemption has to be *declared*, or the next round re-flags it as rot.

### 2c. "Find Your Home Value" is the weakest block on the site

It is the **second thing a visitor sees**, directly under the hero, and on mobile it is roughly ten
lines of grey text followed by six stacked inputs. The copy is inherited vendor boilerplate —
*"So, you're ready to sell your home! Congratulations, you've come to the right place."* — and it
opens by assuming a visitor who arrived at a home-search site wants to sell. Three paragraphs, no
image, no hierarchy, no structure. Everything around it is disciplined; this block is not.

### 2d. Section rhythm is monotonous

Every section on the home page is the same shape: a centred `.t-h2`, a grid, and a small outline
pill. Heading, grid, pill. Heading, grid, pill. There are no eyebrows, no supporting lines and no
rules between them, so the page has no cadence — the sections do not know they are different from
each other. The type scale has four steps and the home page uses one of them.

---

## 3. The ranked list

Ordered by leverage, which is not the same as size.

| # | move | why it is where it is |
|---|---|---|
| 1 | **Declare a shadow scale (3 steps, one hue) and adopt it** | 16 values in 2 hues is the most visible "vibe-coded" tell left, and shadows are what make boxes read cheap |
| 2 | **Replace all 13 hardcoded greys with `line` / `line-strong`** | mechanical, safe, and it is exactly the accident the tokens were created to end |
| 3 | **Commit a design-system test that fails on a new hardcoded hairline, off-scale radius or ad-hoc shadow** | the thing that makes 1 and 2 permanent instead of a third cleanup next round |
| 4 | **Extract one `DeviceMock` primitive; delete both copies** | two drifted phones become one, and the drawing can never drift again |
| 5 | **Normalise off-scale radii on real UI chrome; declare artwork exempt in writing** | closes the remaining radius spread without breaking the mockups |
| 6 | **Rebuild "Find Your Home Value"** | the biggest single visual gap on the highest-traffic page |
| 7 | **Give sections a cadence** — eyebrow + supporting line where the content earns it | turns "heading, grid, pill" into a page with structure |
| 8 | **Consent to call or text on every lead surface** | not cosmetic: the CRM has a live dialer and live SMS pointed at these leads (handoff §2) |

Items 1–5 are the owner's "boxes and all" and they are the spine of this round. 8 is carried from
the handoff and is a compliance gap, not a design one, but it lands in the same components.

---

## 4. Two probes that lied, recorded so the next round does not pay for them

- **A `fullPage` screenshot never scroll-triggers an `IntersectionObserver`.** Every `.reveal`
  below the fold photographs at `opacity: 0`, so the home page appeared to have a 710px blank
  section ("Find Your Home Value") and a blank "Why Work With Us?", and the stat counters read
  `0 / 0h / 0+ / 0`. All four were the probe. Scroll the page a viewport at a time first, let the
  observers fire, return to the top, then shoot — and assert `.reveal` count at `opacity != 1` is
  zero so the harness tells you when it has lied.
- **Reveal counts stuck at 0 opacity in a batch run were a timing artifact.** `financing` reported
  10 stuck at 1440; a dedicated run with a fresh context reported **0**. Re-run alone before
  filing.
