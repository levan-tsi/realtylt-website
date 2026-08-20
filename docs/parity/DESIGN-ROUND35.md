# Round 35 — the home page assessed, mostly left alone, and four real defects found elsewhere

Single agent, no subagents. Continues the handoff at the top of `POLISH_CHECKPOINT.md`. Read
`docs/parity/PAGES-R34.md` and `docs/parity/DESIGN-REVIEW-R32.md` first; neither is repeated here.

---

## 1. The headline result

**The home page was the target and it is largely not the problem.** R34's closing paragraph named
four defects it had left unowned on page 1, and the plan was to fix them. Driving the page and then
reading the source found that three of the four are *documented decisions*, and changing them would
have been churn against work that is already good.

| R34's item | Measured | Verdict |
|---|---|---|
| Five identical 44px `h2` with inconsistent alignment | Four at 44px, alternating start / center / start / center | **Not drift.** `app/page.tsx` states the rule: a heading centres only where it sits over a symmetric card grid ("the one case where centring is structure rather than decoration"), and reads left otherwise. Featured centres, New Listings reads left *on purpose*, to stop two identical sections reading as one repeated shape. |
| The seller block's 411px of copy in a 999px section | Section is 1,006px; the copy column is ~411px | **Deliberate.** `lg:items-center` is commented at length: the form is a tall panel, the copy is five lines shorter, and top-aligning it left ~545px of dead white. Centring is the fix already applied. |
| "Areas we serve" as a 1×1px heading | `h2`, 16px Lato, 1×1px | **Correct, not a bug.** It is `sr-only` — the standard accessible name for a section whose visible structure is the two group labels. 1×1px is what that technique produces. |
| The home page's phone hero photograph | Desktop ≥1024px gets `hero-vimeo-frame.jpg` (a drone shot of a house); every phone gets `valley-aerial.jpg` (Breakneck Ridge) | **Real, and not ours to fix.** The split is licence-driven: the desktop frame "is the one hero asset still carrying no licence record… it needs an owner decision, not a patch". Swapping the phone onto it would ship an unlicensed image. **Owner call, unchanged.** |

The one thing that *was* stale was a comment, not code: the areas strip justified its alignment
with "every other section below the hero centres its heading", which stopped being true when New
Listings moved left. Corrected to state the page's actual rule.

**The search strip the round-11-era brief still lists as an owner defect is already fixed.** Round
27 gave it concentric radii and real air: measured now at 1440, the form is 600×66 with 8px between
input and button and 9px to the container edge. That is the round-27 geometry exactly.

### What the home page does well, for the record
The type system (Newsreader at 200/300, one bold word in a 76px `h1`), the near-monochrome
photography, and the palette restraint — no gradient text, no purple, no neon, no arrow CTAs — all
hold. The listing cards and the device-mockup carousel showing the real product read expensive.

### What still reads generic, recorded for a future round, not changed
* The stat row (`11 / 24h / 100+ / 7`) is the "big number, small caps label" device that the
  `frontend-design` skill names as the default answer. It is a shared `StatCounter` used elsewhere,
  so it is a system decision rather than a page one.
* The areas strip leaves ~360px of empty container to the right of both pill rows at 1440.
* The MLS disclaimer runs ~138 characters per line at 11px.

None of these were touched. The owner's ask is elevation, and elevation is not the same as churn.

---

## 2. What was actually broken — four findings, all driven, all fixed

### 2a. A control named for something it cannot do
`ListingDetail.tsx`'s "Never miss a property" band labelled its CTA **"Sign Up"**. It opens the
save-search dialog, whose heading is **"Save this search"** — and with accounts shut,
`SaveSearchDialog` hides *both* sign-in affordances behind `accountsEnabled`, so the single thing
the label named was the one thing no visitor could do. Now "Save this search". Driven at 1440 and
390: CTA → `/search?county=dutchess` → dialog "Save this search". Guarded in
`components/save-search-flow.test.ts`.

### 2b. /search did not work without JavaScript, and its own no-JS message could not be read
`loading.tsx` wraps the route in a Suspense boundary, so the page — which awaits its results — is
**streamed**: React ships the body inside `<div hidden id="S:0">` and reveals it with an inline
`$RC(...)` call. Measured on a **production build**: 50 `<article>` elements in the DOM, **0
visible**, 4 `$RC(` calls, 5 `<template id="B:n">` boundaries. A visitor got a wall of grey
skeletons that would never resolve.

The trap: `page.tsx` already carried a `<noscript>` for those visitors — *"The homes below are
today's Hudson Valley listings"* — and `page.tsx` is the streamed part, so that message sat in the
hidden div too. It promised homes that were not on screen, to a reader who could not read it.

Fixed by moving the block to `loading.tsx`, which **is** the shell. The skeleton is marked
`data-js-only` and a sibling `<noscript>` retires it and offers all eleven area pages plus the
phone. Those destinations were driven with scripting off *before* being linked —
`/top-areas/dutchess` and `/top-areas/westchester` serve six linked homes each.

`loading.tsx` stays, and that is the trade. Deleting it un-streams the body and would hand no-JS
visitors the real grid, but it exists for a complaint the owner made and that was measured
("search listings is not doing anything when I click": 590 / 599 / 1,604 / 6,890ms to commit).

| | before | after |
|---|---|---|
| /search no-JS, visible links | 51 | 63 |
| /search no-JS, visible headings | 1 | 2 |
| /search no-JS, skeletons painted | 6 | 0 |
| /search **with** JS, articles visible | 50/50 | 50/50 |
| client nav /buying → /search pending state | shown | shown |

### 2c. Two AA contrast failures that only existed on phones
`verify-hero-contrast.mjs` had been reported passing for rounds. It was — **at 1440, the only width
it had ever been asked about.** A scrim gradient covers a different share of a narrow viewport, so
the pixels behind the same text are not the same pixels.

```
/connect  11px  paper/70  "Seven days a week"                 4.14:1 @390 · 3.66:1 @320
/selling  12px  paper/60  "No obligation • Zero pressure…"    4.32:1 @320
```

The home hero had already paid for this exact lesson in round 11 (its 11px eyebrow sits at `/85`);
these two call sites never got the message. `/connect` → `/85`, `/selling` → `/80`, and `/buying`'s
twin line moved with it although it measured fine, so the two cannot drift into different answers.

**The gate now sweeps 1440, 390 and 320 by default** and prints the viewport on every finding.

### 2d. The consent box, on the owner's direct instruction
Owner, mid-round: *"make it smaller box and optimize wherever we have that checkbox, smaller text,
people don't need huge box and text."* It was 308×162 at 390. One component feeds all six call
sites. The label had been `.t-small`, which steps **up** to 16px on a phone — a class for running
copy, honouring the iOS floor for form *controls*, which a `<span>` is not. Now `text-sm`.

Heights: /selling 390 **162 → 137**, /connect 390 **143 → 100**, /connect 1440 **94 → 83**.

The step between the two sizes was kept: consent has to be clear and conspicuous to be worth
anything, so the sentence being agreed to stays above the disclosure explaining it, rather than
dropping to the 11px tier with it.

---

## 3. A new gate, and the finding that the site passes

`scripts/verify-focus-paint.mjs`. `focus-ring-surface.test.ts` checks the *rules* exist in the
stylesheet; nothing checked a ring reaches a screen. This screenshots each element, focuses it,
screenshots again and diffs.

**182 focusable elements across seven pages, every one paints.** That is the result, and it is not
a disappointing one — it says rounds 27–33's focus work held.

---

## 4. The instruments lied more often than the product did

Six of this round's apparent findings were the measuring apparatus, not the site. Recording them
because the ratio is the lesson, not the anecdotes.

1. **A mutation test that mutated nothing.** Proving the save-search guard bites: the file is CRLF
   and the replacement matched `search\n`. The suite went green and looked like proof.
2. **A mutation that hit the comment.** The retry replaced the first occurrence of "Save this
   search" — which was inside the comment I had just written, not the label.
3. **A contrast probe that scored 1.00:1.** Hand-rolled, parsed colour strings, ignored alpha. That
   is the exact failure mode `verify-hero-contrast.mjs`'s own header documents. Deleted; used the
   committed gate.
4. **Three honeypots reported as focus failures.** They are off-screen with `tabIndex={-1}`, so no
   keyboard reaches them. A write-up saying "keyboard users can tab into the spam trap and have
   their lead silently discarded" was already started before the source was read.
5. **A working focus ring reported as dead.** /home-value draws its ring on the *container*, 8px
   out plus a 2px offset; an 8px crop cut it off. Verified by hand at dSF 2 with a real Tab: 5.06%
   of the crop changes.
6. **A failure counter that could not count failures.** `grep -cE "^\s+×"` never matched, because
   vitest emits ANSI codes between the whitespace and the `×`. It reported 0 failures for every
   mutation, including ones that genuinely failed.

Two dev-server A/B tests were also invalid — removing `loading.tsx` and removing the page's
`<Suspense>` both "changed nothing" in dev. The production build showed `loading.tsx` was the
cause outright. **Dev always streams; only a production build answers a streaming question.**

---

## 5. Gates

All foreground, on this tree.

```
npx tsc --noEmit           clean
npm test                   1037 passed / 79 files   (baseline 1006 + 31 new)
npm run build              clean, 81/81 static pages (dev server killed first)
verify-hero-contrast       PASS 315 runs / 8 pages at 1440 AND 390 AND 320
                           negative control: 3 failures, 2.03 @320 / 2.18 @390 / 2.64 @1440
verify-focus-paint         PASS 182/182   (negative control exits 1)
probe-reduced-motion       PASS (15 sections, 0 hidden, 0 reveals armed)
verify-press-feedback      PASS 15/15
no-JS sweep, production    6 pages; /search now serves a real page
```

---

## 6. Carried, not done

* **The phone hero photograph.** Owner decision, gated on the licence for
  `hero-vimeo-frame.jpg` (§1).
* **/search's real grid still cannot reach a no-JS visitor** — only the area pages can. Undoing
  that means dropping `loading.tsx` and replacing the pending state some other way
  (`useLinkStatus`), which trades a measured owner fix for a rare visitor. Not taken unilaterally.
* **The stat row, the areas strip's right-hand void, the 138-character MLS disclaimer** (§1).
* Everything in `PAGES-R34.md` §9 that this round did not touch.
