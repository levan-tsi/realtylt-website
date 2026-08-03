# FLAGSHIP BLOG — handoff brief (single agent, ~700k, build it scene by scene)

## STATUS 2026-08-03 (session 15): the graphics round, and the retracted number that was still on the page. Resume HERE.

**The most important thing in this round was not a graphic.** The chat flagship spends its second
section proving that "78% of leads close with whoever responds first" has no published report, no
stated sample and no methodology, and ends "So this article does not use it." About nine hundred
pixels below that, the `response-gap` scene printed the figure in twenty point type on full-bleed
black. It was live on production. Two earlier audits missed it and the reason is structural:
`scripts/_scratch-claims.mjs` reads the prose and the scene PAYLOADS, and a bespoke component's copy
is in neither, because it is a string literal in a `.tsx` file. **The chat post is the only post in
the cohort with bespoke components, which is exactly why it is the only one where a dead claim could
keep talking.** `lib/blog/zombie-claims.test.ts` now reads every file where visible scene copy can
live and guards all three figures this repo has killed. Proved red before it was trusted green.

The same class of defect is still live on the SERVICES surface and is worse there. See
`docs/blog-flagship/SERVICES-CRITIQUE.md`: `content/services/ai-chat-assistant.ts` leads with the
same 78% three times, and its own `relatedPosts` links to the article that debunks it.

### What changed, and what was measured to decide it

| finding, measured on the rendered page | before | after |
|---|---|---|
| chat's longest run with no scene of any kind | 1,584 words | 969 + 575 |
| longest unbroken LIGHT surface, reactivation | 5,732px (25%) | 3,215px (14%) |
| longest unbroken LIGHT surface, qualification | 6,973px (29%) | 4,031px (17%) |
| cited data graphics, voice | 2 | 3 |
| flagships sharing a photograph | chat + reactivation | none |
| statement scenes lifting a body sentence | 1 of 10 | 0 |
| blog ToC sheets opening under the chat launcher | 2 | 0 |

**Four scratch probes are worth keeping and are how each of those was found.** They are gitignored,
so they live on this machine only; re-create them if they are gone.

- `_scratch-gfxmap.mjs` — classifies every scene by what is INSIDE it (photo / chart / film /
  instrument / cards / text) rather than by its kind name, then prints the longest runs of prose
  with no scene at all. This is what showed chat was a 1,584-word outlier against a 550 cohort.
- `_scratch-bands.mjs` — the light/dark rhythm as RENDERED. The declared rule ("no two adjacent
  bands share a background") is satisfied by all five posts and cannot see a quarter of a page in
  one tone. **Read the comment in it about transparent backgrounds**: the first version parsed
  `rgba(0,0,0,0)` as a colour and scored every prose band as DARK, which is the exact inversion of
  what it exists to find, and it reported a confident 1,256px.
- `_scratch-strip.mjs` / `_scratch-mstrip.mjs` — the whole 24,000px article as one scaled strip.
  "Does this get boring" is a question about the SHAPE of the page and the shape is only visible
  all at once. The 78% was found by reading a mobile strip.
- `_scratch-look.mjs` — shoots one scene by aria-label at 1440 and 390/DPR3. **It asserts that no
  `.reveal` is still at opacity 0 before it shoots**, because a tight `scrollTo` loop outruns the
  IntersectionObserver and the screenshot comes back a black rectangle that looks exactly like a
  product bug. That cost twenty minutes before the assertion existed.

### The three judgements, so they are not re-litigated

1. **house-01 replaced the Poughkeepsie bridge on the chat post.** Two flagships were running the
   same photograph and `siblingOverlap` reads text, so it could never see it. Every remaining
   licensed image was shot at the plate's real 21:9 crop on the ink band before choosing
   (`_scratch-plateswatch.mjs`). The bridge stays on reactivation, where a crossing that sat unused
   for thirty five years IS the argument.
2. **The voice post got a third cited graphic and the other four did not.** Its central claim
   ("latency is not a specification on a phone agent, it is the product") had no number under it.
   Stivers and ten co-authors, PNAS 2009, ten languages on five continents: mean gap between a
   question ending and an answer starting of 208 ms. **The axis is pinned to one second on purpose**
   — left to scale itself the slowest bar fills the track and reads as the maximum a person could
   wait, which is the opposite of the finding. Pinned, the empty right half of every track is the
   point. Not one number on it is ours.
3. **Chat did NOT get a second photograph, deliberately.** The obvious move was a plate at the
   fine-print boundary and every remaining licensed image was shot at the real crop to find one.
   None of them carries an argument. That section is a legal briefing with no held moment in it,
   and the Plate primitive's own rule is that a photograph which is decoration does not deserve a
   band. It got an action grid instead, which is what every sibling already does after a rules
   section and what this post alone did not.

### A thing I believed about the ruler for two hours, and it was false

I spent real time designing around "`proseWords` counts words OUTSIDE a scene, so staging a
comparison as a grid is penalised and would push chat under the floor". **That is wrong.** Read
`scripts/flagship-standard.mjs` line 83: `paras` is every `<p>` inside `#article-root` with 25 or
more words, scenes included. Moving prose into a grid does not cost a single word, and chat rose
from 3,469 to 3,597 in the round that moved 66 words of prose INTO one.

The metric that excludes scenes is `siblingOverlap`, not `proseWords`, and the two sit forty lines
apart in the same file. I caught it because the number moved the opposite way to my prediction and
I went and read the script instead of explaining the number away.

Two things follow.

1. **The label is imprecise, not the metric.** "words of real prose" actually measures total
   substantive text, which is arguably the right thing to measure. A grid body, a chart's `note`
   and a plate caption all count, so a post can raise it with longer captions. Worth knowing before
   trusting a rise.
2. **Chat's "two groups" section still has no graphic, and now for one reason instead of two.** The
   comparison in "What makes an answer true" is the one place in the cohort where a side-by-side
   would beat paragraphs on scannability. It was left alone because the prose builds sympathy for
   the weak option ("a better search box is genuinely worth having"), then turns on one sentence
   ("It also cannot tell you whether 14 Willow Street is still available"), then gives the strong
   option. A grid shows both at once and destroys that order. **If a future session disagrees, the
   metric is not an argument either way. Argue it on the writing.**

**Also NOT done: the ratchet.** `available` currently shows proseWords 3,469 and siblingOverlap 2.
Ratcheting first is the discipline this file records, and this round did not, because the scope was
graphics and reading experience rather than the numeric floor. Ratcheting proseWords to 3,469 puts
workflow (3,334) below the bar and the honest way to close that is writing, not padding.

---

## STATUS 2026-08-03 (session 14): ALL FIVE MEET THE STANDARD, measured on production.

`node scripts/flagship-standard.mjs` prints **all 5 posts meet the standard**, and
`node scripts/score-flagship.mjs <slug>` prints **Mechanically ready** for all five, including
qualification, which had been 18/19 since it shipped. The cohort is tightly banded for the first
time: 3,301 to 3,594 prose words, 18 to 21 sections, 4 to 5 citations, sibling overlap 0 to 1.

**Videos stayed on hold, as instructed. Nothing in this round touched a film, the avatar or HeyGen.**

### 1. The calculator is a primitive now, and that is what closed four posts at once

`components/blog/scenes/primitives/Calculator.tsx`, scene `kind: "calculator"`. The old
`LeadsCalculator` is deleted and `cold-open-calculator` is gone from `ComponentId`.

It sat behind the bespoke-component hatch for five topics on the stated grounds that its model
was "genuinely per-topic and cannot be expressed as data". That judgement is what cost four posts
their calculator, because nobody was ever going to hand-write a fifth bespoke component. What
varies between topics is arithmetic, and arithmetic IS data.

**The shape is the honesty.** A chain starts at 1 and every step multiplies it, so no multiplier
can be applied off screen. Each step renders as a row: the running total, and beside it whether
the multiplier was the reader's number ("your $6,000") or a rate we are asserting ("a 5% close
rate"). The ladder cannot disagree with the headline because they are the same computation. That
is what stops the failure the old file's comment records, where an earlier draft multiplied every
missed inquiry by a full commission.

`format: "percent"` is input-only: it reads as 40% and multiplies as 0.40, so a content file
cannot write 40 where it meant 0.4.

**Each of the five refuses a different number, on purpose.** They are not one model with the nouns
swapped:

| post | chain | headline | what it refuses |
|---|---|---|---|
| chat | inquiries, share handed over, year, 5% close, commission | $57,600 a year | the unsourced 78% (see below) |
| voice | missed calls, real inquiries, callback speed, year, 5% close, commission | $27,000 a year | building the multiplier from the 7x/60x odds, which would produce a number nobody should believe |
| reactivation | contacts, legally reachable, answer and moving, become a deal, commission | $21,600 **once** | any rate of ours at all, and any "a year" row: a database is finite |
| qualification | leads, minutes triaging, year, hours, share not moving | 50 **hours** a year | the dollar figure. The expensive half is the seller who had to be out by spring sitting third |
| workflow | steps a week, minutes each, 52 weeks, hours, hourly value | 104 **hours** a year | multiplying by 25 min 26 sec, for the reason the article itself gives |

Verify one with `node scripts/_scratch-calc.mjs <slug> [out] [base]`. It shoots both widths, reads
the ladder back out of the DOM, and drives every control to its maximum. **Drive a range with
`fill()`, never by setting `.value` and dispatching an event** — that races React's own value
tracker and one of two sliders silently did not move, which made the probe under-report.

### 2. The sameness metric was measuring citation apparatus, and under it the posts really were the same article

Two findings, and the second only became visible after the first was fixed.

**`siblingOverlap` drew from every paragraph on the page.** So the reactivation/qualification pair
scored 74 against a 71 ceiling on things that are SUPPOSED to be identical: about twenty of the
shared phrases were the two posts describing the same NAR survey in the same words, which is a
citation basis line, and rewording one to pass a gate would be falsifying a source description.
Fifteen more were the film's standing disclosure that the narration is a licensed clone of the
owner's voice. Both escaped the chrome filter only because it needs a phrase in ALL FIVE and these
sit in two and four. **It now reads paragraphs that are not inside a scene `<section>`** — the
article's own prose, which is the thing the owner objected to.

**It also joined the paragraphs before shingling**, which manufactures phrases nobody wrote out of
the seam between two of them. Three of the last four "shared" phrases were windows straddling the
end of the final paragraph and the start of the identical author bio. **Shingled per paragraph now.**

That left the real bleed, and it was real: **the voice post's limits section was the chat post's
with the synonyms swapped**, down to the same divorce sale and the same contingency question, and
**all five posts closed on one sentence with the nouns changed**. Both rewritten. Every post now
ends by returning to its own opening and handing the reader something to do tonight that costs
nothing: ask your own site the question at midnight, ring your own office from a number it does not
know, open one 2023 record, score your last ten leads from what is already on file, take a
highlighter to one deal.

Measured on article prose: **74/74/71/71/50 to 0/0/1/1/0.**

`node scripts/_scratch-overlap.mjs [base] --phrases` prints the actual shared phrases. A number
cannot be fixed surgically; the sentences can.

### 3. The gate had a bar that could never be reached

Both the check and the ratchet used the LIVE median. Sort five posts a<=b<=c<=d<=e, the median is
c, and "every post at or above c" requires a >= c, which requires a == b == c. **So the two weakest
posts were reported SHORT forever, on every numeric metric, however good they got**, and the bar
moved fastest in the round the most work had been done.

`--ratchet` is now the moment the bar rises to what the cohort has proved; `check` measures the
recorded bar in `standard.json`. Nothing is relaxed, and a run prints an `available` row showing
what the ratchet would raise it to.

**The discipline that follows from this, and it is the important part: ratchet at the START of a
round, not the end.** Ratcheting opens a gap by construction. This round ratcheted mid-way
(proseWords 2,906 to 3,295, sections 17 to 18, overlap 71 to 1), which left reactivation and
workflow short, and then closed it — workflow gained how to RANK the audit list, reactivation
gained the limit that the second pass is fishing in a pond already emptied. Ending green means the
next session inherits a signal rather than a permanent red.

### 4. Chat was the long pole and it was resting on a number nobody can source

It opened on "78% of leads close with whoever responds first" with **no citation at all**, and its
one external link was the HBR piece the voice post already used, so it effectively had no source of
its own. We went looking: that figure is attributed on hundreds of pages to a survey with no
published report, no stated sample and no methodology, and every citation leads to another article
citing a third. **The post now says so** and rests on the research it can actually show you. The
calculator's note follows it: the reply curve is labelled a judgement shaped by that research
rather than derived from it, and explicitly not from the 78%.

Three new sources, each read in the primary document, none shared with another post:

- **Cal. Bus. & Prof. Code 17941** (SB 1001, chaptered Stats. 2018 Ch. 892). The definitions matter
  more than the summaries do: the ten-million-visitor threshold everybody reports belongs to
  "online platform" in 17940(c), a term the prohibition in 17941 does not use.
- **Google's Core Web Vitals thresholds** (web.dev), quoted exactly: INP "200 milliseconds or
  less", LCP within "2.5 seconds".
- **WCAG 2.2, No Keyboard Trap (Level A)**, because a chat widget you cannot tab out of is a front
  door that locks.

Plus four sections its successors had and it did not: what makes an answer true (website-trained
versus connected to something live, the only distinction that matters and the one no vendor
volunteers), what it costs, how to test one before you buy it, and a second `plate`. The FAQ was
three objections, which is what WE are defensive about; it now leads with the definitional question
an AI answer lifts. **1,030 words to 3,355.**

### 5. Two defects found by looking, not by a gate

- **A renamed heading left its short rail label pointing at a dead anchor**, so the floating rail
  showed the full 58-character heading instead of "The number". The `headingLabels` test caught
  exactly what it was built to catch. Three other tests encoded the old article's shape and were
  updated to the new one, keeping their intent that a missing heading still fails.
- **On every flagship, an H2 following a paragraph had 0px above it and 24px below**, so a section
  heading sat glued to the paragraph it ended and floated away from the one it introduced. It reads
  correctly on the standard template only by accident of structure: a heading there opens its own
  `<section>` and picks the space up from `section + section`. The flagship layout flattens a prose
  band into one container, so there was no boundary left to carry it. Fixed in `app/globals.css`
  with the same 3.25rem, scoped to a direct child of `.prose-custom` so the sectioned path cannot
  match, and to `* +` so a heading opening a band after a scene is not pushed off it.

### 6. D5 can now be told the truth

Qualification shipped 07-31 with no `updated`, deliberately, because a post written and shipped in
one day has not been revised. **The revision has now happened**, so the date is a true statement
rather than a fix, and all five posts pass their mechanical gate. Each `updated` in
`content/blog/posts.ts` carries a comment saying what actually changed.

### What is owed next

- **The 10 consumer placeholder posts** are still live, indexable, in the sitemap and rendering the
  literal string "[Placeholder draft. The owner's final article replaces this text.]". One line to
  noindex them and drop them from the sitemap. Cheap, and untouched by this round.
- **Original data of our own (`A1`, -3 on the rubric)** is still blocked on public traffic, not on
  effort.
- **Ratchet FIRST next round**, then close the gap it opens. `available` currently shows
  proseWords 3,320 and overlap 0.
- `scripts/_scratch-toc.mjs` times out: it waits for `nav[data-toc]`, which since session 13b only
  mounts from about 1728px up. Not a regression. The rail was verified directly instead: 16 rows on
  chat at 1920, all resolving, longest label 19 characters.
- `node_modules` was missing the whole `@jridgewell` scope, so vitest could not start. Repaired
  with `npm i @jridgewell/sourcemap-codec --no-save`, which does not touch `package.json`. 635
  tests green.

## THE PREVIOUS ROUND'S BRIEF (owner 2026-08-02) — kept for the reasoning. The gap table below is CLOSED.

**Videos are on hold by the owner.** Do not touch the films, the avatar or HeyGen this round.

The spec is already written and enforced: `docs/blog-flagship/STANDARD.md` (the judgement half) and
`node scripts/flagship-standard.mjs` (the measurable half, floored at the cohort median and
ratcheted in `standard.json`). **Read STANDARD.md first — it carries the owner's brief verbatim.**

Run `node scripts/flagship-standard.mjs` to get the live gap list. As of 2026-08-02:

| post | owes |
|---|---|
| **chat** | prose 1,030 → 2,906 · sections 14 → 17 · citations 1 → 4 · FAQ 3 → 5 · images 5 → 6 |
| voice | calculator |
| reactivation | calculator · sibling overlap 74 → ≤71 |
| qualification | prose 2,641 → 2,906 · citations 3 → 4 · cost section · calculator · overlap 74 → ≤71 |
| workflow | calculator |

**Two owner corrections landed after the first draft of this brief, and they change the job:**

1. **The stake does NOT have to be a dollar figure.** *"It should not be always exactly the dollar
   amount... we can show how much time they would save and they can calculate themselves with
   hourly $ value."* A `hasQuantifiedStake` check was written and deleted — calibrated against the
   cohort, all five posts already quantify (chat in dollars, voice in 42 hours, workflow and
   qualification in shares), so it separated nothing. The calculator may output **money OR time**.
   Do not force a `$` into reactivation: it cites no response rates because no independent study
   exists, and inventing one would destroy its whole argument.
2. **Sameness is now measured.** `siblingOverlap` counts 7-word phrases shared with the nearest
   sibling, minus chrome. Reactivation and qualification sit at 74 against a ≤71 ceiling — they are
   each other's nearest and were written in the same session. Reusing a COMPONENT is the point of
   the primitive set; reusing a SENTENCE is not. The ceiling only ever tightens.

### Do the CALCULATOR first. It closes four posts and it is the owner's actual brief.

`components/blog/scenes/LeadsCalculator.tsx` (173 lines) is hard-wired to chat's economics. Generalise
it into a primitive the way `StatBars`, `Diagram` and `Conversation` were generalised — declarative
inputs, every assumption rendered on screen, and a REQUIRED `note` like the other honest primitives.

**The trap is the arithmetic, not the React.** The comment at the top of that file records why: an
earlier draft multiplied every missed INQUIRY by a full commission, so 192 missed inquiries read as
192 lost closings. The chain has to stay explicit and get smaller at every step — inquiries →
conversations won at your reply speed → closings at a stated close rate → commission — and the
commission must be the READER's input, never a figure asserted for them.

Four chains to build, each needing the same discipline:

- **voice** — missed calls/month → share that were real inquiries → share you win by answering live
  → closings → commission. The post already argues the caller rings the next agent; the model must
  not double-count that against the reactivation one.
- **reactivation** — dormant contacts → share still in market → share that answer → closings. The
  post deliberately cites NO response-rate figure because there is no independent study
  (see the zombie-stat list below), so this one's assumptions must be openly labelled as the
  reader's own guesses, not sourced rates. That is a feature: it is the honest version.
- **qualification** — leads/month → minutes triaging each → hours/year, AND the deals mis-ranked.
  Time saved is the weaker half; the stronger half is the good lead that got worked third.
- **workflow** — manual steps/week × minutes each → hours/year → the reader's own hourly cost. The
  post already owns the 25 min 26 sec interruption figure (Mark, Gonzalez and Harris, CHI 2005),
  which is the one sourced multiplier available here.

### Then chat, which is the long pole and is mostly RESEARCH

It needs +1,876 words of prose and **+3 external citations**, and the bar is unforgiving: a
DIFFERENT primary source per topic, read in the primary document, never a summary. That rule has
already caught two zombie stats — "23 minutes and 15 seconds" (the real figure is 25 min 26 sec) and
"$16,000 per text" (a real number from the wrong statute). Chat has already spent its source
(Oldroyd / HBR). Budget real time for finding three more that survive checking, and add the sections
its own successors have and it does not: **what it costs and how long it takes**, and a practical
section the reader can act on.

Its FAQ also needs reshaping, not just extending. Today's three entries are objections — *"Will it
annoy my visitors?"* — which is what WE are defensive about. Workflow's six are the model because
they include what people actually search: the definitional one ("what IS this, in plain terms") is
mandatory, because that is the entry an AI answer lifts.

### Two things that are NOT this round

- **Original data (`A1`, −3 on the rubric)** is genuinely blocked, not deferred: 37 chat sessions in
  30 days, mostly the owner's own testing. It needs public traffic, not effort.
- **The 10 consumer placeholder posts** are live, indexable, in the sitemap and render the literal
  string "[Placeholder draft. The owner's final article replaces this text.]". One line to noindex
  them and drop them from the sitemap. Cheap, and separate from the standard work.

## STATUS 2026-08-02 (session 13b): the floating ToC, the footage defects, and why NOT HyperFrames

### The floating rail was covering the text on EVERY service page, at EVERY width

The owner reported it on services; the audit found it was worse than that. `scripts/_scratch-toc-audit.mjs`
hovers the rail and compares the expanded card's right edge against the narrowest real text
block: **43 of 54 combinations overlapped** — all five service pages at all seven widths (75px at
1360, 39px elsewhere), plus reactivation, qualification and workflow at 1360/1440/1512 (17px, over
the lead form). `ArticleToc` was never affected: it is a sticky in-column rail and cannot overlap.

**The root cause is that both rails derived their safe edge from an ASSUMED container width.**
`FlagshipToc` was "fixed" on 2026-07-29 with `calc(max((100vw - 72rem) / 2, 0px) + 2rem)`, and
`ServiceToc` never got even that. A container width is a proxy for the thing that actually matters,
and it was wrong: measured at 1512 the flagship's narrowest text starts at **163px** while the
formula predicted 212px. So `lib/toc/safe-edge.ts` now MEASURES the left edge of the narrowest text
on the page and both rails clamp to that. It re-measures on resize, on fonts.ready, and through a
ResizeObserver, because measuring once on mount silently produced a rail that never appeared at all.

**A consequence worth knowing:** where the gutter cannot hold a readable label the rail is not shown
at all and the bottom pill + sheet takes over — a rail clamped to an 8px label satisfies "never
overlaps" while being useless. In practice that means the rail from ~1728px up and the sheet below,
on both surfaces. If you would rather keep the rail at narrower widths, the lever is
`LABEL_MIN_USEFUL` in that file.

**Result, measured on the same harness: 43 overlaps of 54 → 0 of 35, with 42 combinations on the
sheet.** Services at 1920 now end the card at 219 against text at 352 (was 391 against 352).

### A stale dev-server chunk cost an hour, and it looks exactly like a product bug

Mid-fix the rail started vanishing non-deterministically on service pages, and a probe reported
"no rail" where the maths said there should be one. It was neither: Next's dev server was serving a
**broken cached compile** after rapid edits, and the page threw `Invalid or unexpected token` before
hydration — so no effect ran, so no rail. `tsc` was clean and the unit suite was green the whole
time. A `git stash` / `git stash pop` forced a recompile and both surfaces came back.

Two lessons, both paid for here:
- **On this dev server, a hydration-time syntax error with clean `tsc` means a stale chunk, not your
  code.** Listen for `pageerror` in the probe — that one line named the real cause immediately, and
  everything before it was guesswork.
- **A probe that cannot find the thing it is measuring reports a PASS.** The first "0 overlaps" was
  measured while the rail was not mounting on services at all; it was worthless and was thrown away.
  Any overlap harness must also assert the rail EXISTS and its labels are non-zero, which
  `_scratch-toc-shot.mjs` now does.

### Two films shipped with a generated-footage defect ON SCREEN

Measured at 0.2s steps, not taken from the audit's prose:

| film | clip | what was on screen | fix |
|---|---|---|---|
| workflow, the close | `shot10-laptop-close` | first ~1.0s: **silver lid with an Apple logo over a black base**, turning space-grey as it shuts | enter at 1.05 |
| reactivation, "and nobody called" | `shot11-old-records` | the push-in holds to ~7.2 then **hard-cuts to an unrelated filing cabinet**; the beat ran to 8.0 | `srcEnd: 7.15` |

**Correction to the earlier status in this file: workflow's HOOK was never the problem.** The melt in
`shot12-typing-notes` starts at ~5.0s and the hook uses 0.4→4.8, so it stops just before it. Only
the close was broken.

Both defects sit at a clip boundary, so the usable span is shorter than the beat. `bg.mjs` gained
**`srcEnd`** — the last usable source second, stretched with `setpts` to fill the beat — so a defect
comes out without moving a beat boundary and sliding the picture off the voice. 8% and 12% on two
near-static shots, invisible. `setpts` goes BEFORE `fps` or the output is no longer true CFR. With
the field absent the filter chain is byte-identical, so the other three films are untouched.

### HyperFrames: evaluated, and it is the wrong tool for THIS job

The owner asked whether to use HeyGen's HyperFrames instead of the local pipeline. No, for two
reasons that have nothing to do with its quality:

1. **It animates HTML; it does not generate or repair footage.** The problem here was broken
   AI-generated video, which HyperFrames has no opinion about. It could replace the *type and
   motion* layer — which is the part that already works, is committed, and renders from the same
   PLAN the picture is cut from.
2. **From Claude Code its `compose` and `render_video` are disabled by design** (the MCP rejects
   them for clients with a local filesystem and points at `npx skills add heygen-com/hyperframes`).
   That local route produces standalone HTML/GSAP files — which is what the Playwright type layer
   already is.

Keep it in mind for a different deliverable: a pure motion-graphics explainer with no live footage.
That is close to what the HeyGen Video Agent already produces for the avatar cuts.

## STATUS 2026-08-02 (session 13): THE LIKENESS IS FIXED. It was never the face model — it was what the face model had been trained on.

**Read this before touching the avatar again.** The previous session's diagnosis (below) was that the
footage is too wide and the face too small. That is true and still worth fixing, but it was not the
binding constraint. The binding constraint was that **the five "designed looks" on the avatar are
generative re-renders of a stranger**, and every judgement the owner made was made against those.

### What was done, and what it proves

1. **Trained a personal model on 37 frames of his own 4K footage.** `app.heygen.com/avatar/design-look`
   → **"Improve likeness with a personal model"** → **Train your personal model**. 60 credits,
   ~12 minutes, minimum 10 images, 30+ scores "Great". Once trained the pill becomes a
   **Personal model** toggle on the prompt bar and every look generation uses it.
2. **NEVER train on the existing looks.** The picker offers the avatar's 6 looks pre-selected and 5 of
   them are AI-generated pictures of a man who is not him. Training on those bakes the drift in.
   Upload real frames and select only those.
3. **Controlled A/B, and this is the part that makes the claim honest.** The same prompt, the same
   lighting, run twice — personal model ON and personal model OFF. The sheet is committed at
   `docs/blog-flagship/avatar/likeness-ab.png`: real him, then two model-ON renders, then two
   model-OFF renders. Model-OFF regresses to a younger, slimmer man with a patchy beard. **The gain
   is the training, not the prompt and not the flattering light.**

### The five faults, named, because "make it more realistic" fixes nothing

Judge every attempt against a native frame of `IMG_7153.MOV`, never against the last attempt. What
the untrained looks got wrong, in the order they read as wrong:

| his real face | what the generic look did |
|---|---|
| thick, straight, **dark brows sitting low** over the eye | thin, arched, lifted |
| narrow **hooded** eyes, heavy upper lid | round and wide open |
| receding hairline **with hair at the temples** | smooth shiny dome |
| broad, heavy lower face | slimmed and lengthened |
| dense beard with a **high cheek line** | thin, cheek line dropped |

The personal model corrects all five. It still slightly narrows the jaw and slightly over-darkens the
brows; that is the residual, and it is small enough that the renders read as the same man.

### The training-set recipe (`scripts/_scratch-video/avatar/v2/extract.mjs`, gitignored)

- **Three SITTING takes only** — `IMG_7153`, `IMG_7156`, `IMG_7239`. **Skip `IMG_7091`**: its face is
  ~190px, so a 1024 crop is a 5x upscale and teaches the model softness.
- **720px square crops at y=1731**, which is 120px *below* the face centre. That is deliberate: it
  pushes the oil painting's bottom edge out of frame. A prop repeating in all 37 images is a
  background the model can learn as part of him. Take C sits lower, so its box is y=1861.
- 18 candidates per take → contact sheet → **cull by eye**: blinks, hands over the face, the black
  folder, and anything looking down. ~11 keepers per take.
- Plus **3 chest-up frames** so the model learns his build. The generic looks all slimmed him.
- 37 total, ~1.5MB, JPEG q3 at 1024².

### Driving the upload without opening a native file dialog

The upload tile looks like a button but contains a **hidden `input[type=file]`**. Do not click the
tile — that opens an OS picker that blocks the session. `find` the input, then `file_upload` against
**the input's ref**. Uploads **append** across calls, so batch them (12/13/12 worked). Each uploaded
frame also becomes a selectable **"Photo Avatar" look**, which is how a video can be rendered from a
real photograph of him with zero identity drift.

### THREE VIDEOS EXIST FOR HIM TO JUDGE. Same script, same 16:9, same voice. Only the PLATE differs.

| | plate | file in `C:/Users/Levan/Downloads` |
|---|---|---|
| **V1** | a **real photograph** of him — his chair, his mint wall, his olive sweatshirt | `Realty LT - The Gap_1080p.mp4` |
| **V2** | **personal-model**, medium: dim charcoal room, him right, cards in the empty wall left | `Realty LT - The Gap Built For_1080p.mp4` |
| **V3** | the wide plate + the three fixes — **right rules, wrong crop** (read below) | `Realty LT_ The Gap Built For_1080p.mp4` (note the underscore) |

Side by side: `docs/blog-flagship/avatar/v1-vs-v2.png`.

**Nothing here is finished, and the reason is worth carrying: V2 has the right crop and the wrong
rules; V3 has the right rules and the wrong crop.** They have never both been true in one render.

**V1's verdict, and it is the useful one: the identity is perfect and the plate is wrong.** It is
unarguably him, because it is a photograph. But his real footage is a *bright mint-green wall, flat
webcam light, olive sweatshirt, shot portrait*, and the Video Agent's editorial style is near-black
`#101014` with a Didone serif. Dropped into that frame it pillar-boxes into a tall strip and reads as
a webcam pasted onto a magazine page. **The graphics and type in V1 are genuinely good — keep them.**
It also printed the fabricated "$850,000 / 123 Maple Street, Austin".

**V2 is the direction.** One dark room, one warm lamp, one amber accent, edge to edge. The cards sit
in the empty wall beside him and never touch his body. The listing card is honest — *LIVE FROM THE
MLS / MLS LISTING RETRIEVED* over a line-drawn house, no address and no price. The closing
`RealtyLT.com/AI` in the Didone with the amber rule is the strongest frame in either cut.

**V2's three remaining faults, which is what V3 fixes:**
1. He is still ~65% of frame height, not the quarter that was asked for — **because the framing is a
   property of the LOOK, not of the video prompt.** The Video Agent cannot make him smaller than the
   plate. V3 regenerates the look wider.
2. **Frame one carries no card**; the $6,000 arrives about 1.5s in. Frame one is the thumbnail and
   the number is the reason anyone presses play — this repo's own ad rule, and V1 got it right.
3. It invented a `REF: 2026-MLS-0802`, and it ends on black instead of holding the CTA.

**How wide is too wide, measured:** a full-room wide plate put his face at ~4% of frame height —
unreadable, which defeats the point of putting a real person on camera at all. The usable band is
**him at a third to a half of frame height, face still readable**. Both plates are in
`scripts/_scratch-video/avatar/v2/wide-cmp.png` and `med-cmp.png`.

### V3: all three content fixes landed, and the framing went BACKWARDS

Verified on the finished file, not on the plan:
- ✅ **Frame one carries the card** — `TRANSACTION VERIFIED / $6,000 / 11:40 PM` at full opacity on
  frame zero. That is the thumbnail fix.
- ✅ **The CTA holds to the last frame.** No fade to black.
- ✅ **Nothing is invented.** No address, no price, no reference number anywhere. The card sequence
  (`Contact Form` → `LIVE FROM THE MLS` → `CALL BOOKED` → `9:00 AM AGENT NOTIFIED` →
  `RealtyLT.com/AI`) actually dramatises the script beat by beat, which V2's did not.
- ❌ **He got BIGGER, not smaller** — roughly 70% of frame height with his hands large in frame.
  **The Video Agent cropped into the wide plate even though the instruction said "never crop into his
  face, never zoom".** So the plate constrains the *maximum* width, and the agent still re-frames
  inside it. That is the open problem.
- ❌ The `LIVE FROM THE MLS` card has empty grey boxes in it that read as a loading skeleton.
- ❌ It closes on praying hands. Off-brand; the wide plate exposed his hands and the model animated
  them enthusiastically throughout.

**The next pass is one render, not a new direction:** V3's instructions plus a plate that survives
the agent's re-crop. Worth trying the `Edit a copy in AI Studio` route, where the avatar's size and
position on the canvas are set by hand instead of being negotiated with the agent.

### Three things the Video Agent gets wrong unless told

1. **It invents listing data.** V1 printed **"$850,000 / 123 Maple Street, Austin"** — a fabricated
   address in the wrong state, on a brand whose entire argument is that the details are checkable.
   Forbid it explicitly: no address, no house number, no city, no price. The only numbers allowed on
   screen are $6,000, 11:40 PM and 9:00 AM.
2. **It obeys an explicit framing rule, and only an explicit one.** Told "presenter must remain small,
   about a quarter of frame height, never filling the screen", it wrote exactly that into its own
   plan. The owner's own mitigation is therefore free — just say it.
3. **It renders quiet: −24.7 LUFS integrated.** Social wants −14 to −16. Normalise before anything
   ships.

### Cost, measured

Creator plan, 600 credits/month, resets Sep 2. This round spent **85**: 60 model training, 5 look
generations (2–3 each), 20 for a Video Agent video. 497 left at the time of writing. Digital Twin
slots: 2 of 5 used.

### Still true, still owed

- **The reshoot is still the biggest single lever** and the recipe below is unchanged. The personal
  model raised the floor; a chest-up take at 40% face would raise the ceiling.
- **Identity verification is the owner's to do.** Three failed avatar generations still sit at the top
  of `my-avatars`. Do not attempt the verification flow.
- The three bad b-roll clips are still on production (see the footage-audit section below).

---

## THE ORIGINAL BRIEF (owner 2026-08-02) — kept because the sequence and the reshoot recipe still stand

Still the `/blog` command. **Single agent, one long session, no subagents.**

Build a **long-form video of the owner presenting the blog's own material** - graphics, b-roll,
hooks, pattern changes to hold attention - for **AI chat assistant** and **AI voice agent**, then
cut it into shorts. He has a **paid HeyGen subscription** (bought 2026-08-02) and wants the quality
proven before committing to a full production run.

### DO THESE IN ORDER. He was explicit about the sequence.

1. **Get the avatar as close to the real him as you can** using the three likeness levers below.
   Spend credits; he expects several attempts.
2. **Then make ONE video for ONE service** (start with AI chat assistant), **in 2-3 versions, to
   compare.** Not a batch. One service, a few treatments, judged side by side.
3. **Polish it and try a few times.** He is explicit that this is iterative.
4. **If it still is not close enough after a genuine effort, say so plainly and stop** - he will
   shoot new footage, and the recipe for that shoot is at the end of this section. Do not burn the
   whole session grinding a likeness that is not converging; a clear "this needs new footage, here
   is what to shoot" is a better outcome than twenty mediocre renders.
5. Only after he has judged the one video, scale to the rest.

**And the mitigation he suggested, which is a good one and should be in every version:** keep his
head SMALL in frame and let the graphics carry the screen. A smaller talking head hides avatar
artifacts, and it is better information design regardless. If the likeness stays imperfect, a
head-small treatment is the version most likely to ship.

### THE AVATAR IS WEAK FOR A MEASURED REASON, AND IT IS NOT THE ACCOUNT TIER

The source is `C:/Users/Levan/Downloads/IMG_7091.MOV`: **3840x2160, 30fps, 42s, portrait**
(rotation -90). That is a 4K file, so "free account" and "low quality source" are both wrong
diagnoses. Measured on the actual frames:

- **His face is ~330px tall inside a 2160x3840 frame - about 8% of frame height.** It is a
  FULL-BODY WIDE shot, standing, filmed from across the room. The file is 4K; the FACE never was.
  This is the dominant cause and it dwarfs the others.
- **A busy, high-contrast oil painting sits directly behind his head** - brown and ochre
  architecture exactly where the model has to separate head from background. That is a matting
  nightmare and produces edge artifacts.
- **Flat ambient room light, no key.** The face has no modeling.
- **He stands still, arms down, full body.** Almost no gesture for the model to learn.

**He then shot two better takes**, and the current avatar is built from them. All three measured
from the frames, identical native crops in `scripts/_scratch-video/avatar/heads.png`:

| file | shot | face in frame | detail | behind his head |
|---|---|---|---|---|
| `IMG_7091.MOV` | standing, full body | ~5% | soft | **the oil painting** |
| **`IMG_7153.MOV`** | **sitting, medium** | **~8%, largest** | **crisp** | **plain wall** |
| `IMG_7239.MOV` | sitting, medium | ~7% | crisp | painting, chair wing beside head |

`IMG_7153` is the best source of the three and is what the current avatar should be using. The two
real gains over 7091 are sharpness and a clean background behind the head, not size.

**THE RESHOOT RECIPE, if the tweaks do not converge.** All three takes are still MEDIUM shots at
~8% face; the target is 40%+. This is 90 seconds of work and is the largest remaining lever, bigger
than any plan tier or setting:

- Sit, phone at **eye level** on a tripod or a stack of books, **arm's length to ~1.2m** away.
  Chest-up, top of head near the top of frame.
- **Plain wall behind the head only.** No painting, no chair wing. A plain stool against the teal
  wall is ideal.
- **Face a window**, or a lamp slightly off to one side at face height. The side light is what
  gives the face shape - all three existing takes are flat ambient, which is why he looks washed.
- **Talk naturally with normal hand gestures for ~90 seconds.** He is very still in all three
  takes, and gesture is what the model learns.
- 4K, 30fps.

### THE AVATAR WAS REGENERATED FROM BETTER FOOTAGE AND IS STILL NOT HIM

**Owner's verdict 2026-08-02: "I regenerated, it's still far, but maybe with some tweaks it can
work."** So this is the job: **spend the tweaks, make ONE video, polish it, try a few times. If it
still is not close enough, he will shoot new footage.** He has credits; use them. He is fine with
several attempts, and he will judge.

**There are now TWO avatars, both called "Levan Tsiklauri". Use the SITTING one.**

| avatar | id | built from | thumbnail |
|---|---|---|---|
| **NEW, use this** | `87f6dc9a26684cf1bca69d6a3dd40a9c` | the sitting take (IMG_7153 / IMG_7239) | him in the leather chair |
| old, ignore | `0956f43471c14b24a68d8ca9a3a4da0c` | IMG_7091, full-body standing | him standing |

Both have 6 looks. The new one is built on measurably better source (see the footage comparison
above): sharper face, and crucially a **plain wall behind his head instead of the oil painting**.

### THE THREE LIKENESS LEVERS, found on the Design-with-AI screen

`app.heygen.com/avatar/design-look` (reached via an avatar -> **Design with AI**) is the "chat frame
by frame edit / edit a person" surface the owner meant. It has three things worth spending credits
on, in this order:

1. **"Improve likeness with a personal model"** - a button on the prompt bar, and the most direct
   lever there is. Try this FIRST, before any prompt wording.
2. **"References"** - attach reference images. Feed it real stills of him. Pull clean frames
   straight out of the source with ffmpeg rather than hunting for photos; `IMG_7153.MOV` at t=15
   with `crop=700:700:764:1641` is a good head crop, and `scripts/_scratch-video/avatar/heads.png`
   already holds a three-way comparison.
3. **The chat box** ("Describe the edits you'd like to make to this look") - plain-language
   correction of what is off. Be specific about what is wrong rather than asking for "more
   realistic": beard shape, hairline, face width, skin tone.

Also on that screen: **Remix this look**, **Recent creations**, and Look Packs (Studio Streamer,
Coastal Linen, Cool Tech / Slate). A device/aspect selector sits beside the prompt.

**Judge each attempt against the REAL him, not against the last attempt.** The reference is
`IMG_7153.MOV`; build a side-by-side of the render against a native frame from it before deciding
anything. Drifting toward a nicer-looking stranger is the failure mode.

### HEYGEN STATE, as actually inspected 2026-08-02

- Logged in, Chrome. Avatars at `app.heygen.com/avatar/my-avatars`.
- **His voice is ALREADY CLONED in HeyGen**: voice "Levan Tsiklauri", tagged *From Avatar,
  ElevenLabs, Multilingual, Male*. So HeyGen pulled the voice off the avatar video by itself, and
  it is ElevenLabs underneath. Two others exist: "New Recording 2.m4a" and "Custom voice - Voice 1".
- **There is an "Import from 3rd party" button on the Voices page.** If HeyGen's auto-clone is worse
  than the known-good ElevenLabs clone (`LT`, id `7AxhG2AEa5XhwSrAudqY`), import that instead. **A/B
  the two voices as one of the comparison axes** - the owner has said the LT voice is the best part
  of the existing films, so keep that variable controlled.
- **THREE FAILED avatar generations** are sitting at the top of the list, all named
  `6067c5df5ccc46899ff2605107dca61f`, with three different causes: identity mismatch ("Reset"),
  identity not verified ("Verify identity"), and a Google Drive share-permission failure.

**IDENTITY VERIFICATION IS THE OWNER'S TO DO, NOT THE AGENT'S.** Two of those failures need a
consent/identity check that proves the person in the footage is the account holder. Do not attempt
it, do not upload footage on his behalf to clear it, and do not click through a verification flow.
Surface it and ask him to complete it. Same for any purchase or plan change.

### WHAT THE RESEARCH SAYS TO BUILD, so this is not re-derived

Full detail in `[[research-video-hooks-that-convert]]`; the operative parts:

- **Do NOT shoot long and slice it into shorts.** A slice has a middle, not a hook. Hook changes
  swing performance **50-200%**; body edits move 20-30%. Shorts and long-form are different
  audiences at roughly **11% crossover**. **Shoot atomic units, each written with its own hook, and
  assemble the long video FROM them.** Same effort, far better shorts.
- **Length:** completion is 74% at 7-15s, 49% at 30-60s, **46% past 60s**. The long video is its own
  product; the shorts must be genuinely short.
- **Open on a checkable number the page underneath can defend.** No greeting, no warm-up.
- **AI-looking footage is now a liability**, not a saving - brands have pulled campaigns and real
  estate has started disclosing AI use. That is the whole argument for putting him on camera, and
  it also means the generated b-roll must stay subordinate and audited.
- **Charts are the safest and strongest visual asset we own.** StatBars, Diagram, Conversation and
  Timeline already exist on the blog and were designed from day one to be chopped into video. Prefer
  them over generated b-roll. Zero slop risk, maximum credibility.
- **Mitigation he suggested and it is a good one:** keep his head small in frame and let the
  graphics carry the screen. A smaller talking head hides avatar artifacts and is also better
  information design.

### THE SCRIPT THAT IS ALREADY WRITTEN AND APPROVED IN SHAPE

Use this as unit 1 / the quality test. Paste EXACTLY - no stage directions, no brackets, HeyGen
reads the text field literally, and the URL must be spelled phonetically or TTS mangles it:

> Last night a six thousand dollar lead messaged a real estate website at eleven forty at night.
> Real question, real listing. Most sites answer that with a contact form. This one answered the
> question, pulled live listings from the MLS, said plainly what it could not confirm, and booked
> the call before morning. The agent found out at nine. That is the gap I build for. Realty L T dot
> com, slash A I.

The other units come from the two posts' own scene copy in
`content/blog/ai-chat-scenes.ts` and the voice post's content file - the numbers there are already
sourced and defensible, which is the standard ($6,000 is the LeadsCalculator's own default).

### WHAT TO JUDGE WHEN THE FIRST RENDER LANDS

Not "does it look like him". Look for the things that make people bounce, in this order:
1. **Lip sync on the numbers** - "six thousand" and "eleven forty" are where sync slips, and they
   are the two words the hook rests on.
2. **Blink rate and hands.** No blinking or one frozen gesture reads uncanny within ~4 seconds,
   which is inside the window that decides reach.
3. **The first two seconds specifically** - ~80% of completion variance.
4. **Watch it on a phone with sound off**, because 85% of feed video plays muted.

### THE THREE BAD CLIPS ARE STILL ON PRODUCTION

Unrelated to the avatar work but owed: `shot10-laptop-close`, `shot11-old-records` and
`shot12-typing-notes` failed the footage audit (see the section below) and are cut into the live
workflow and reactivation films. Either replace them or pull them back to the previous clips.
`node scripts/film/audit-footage.mjs` builds the sheets; READ them before any clip enters a cut.

## THE FILMS ROUND IS DONE (2026-08-01, session 12). What is left is below.

Three of the four asks are shipped and verified on the finished files. The fourth, the research
question, is answered as a decision rather than a document. **The one thing still owed to the
owner is that he LISTENS to a film** - see the honesty note at the end of this section.

### 0. THE FOOTAGE AUDIT, and the three clips that failed it

The owner watched the films and caught what no check in this repo could: in `shot10-laptop-close`
a laptop closes **backwards**, with a **second laptop** on the same table. On audit it was worse -
the laptop is **silver in frame one and space-grey a second later**. `node
scripts/film/audit-footage.mjs` now builds a 12-frame contact sheet per clip into
`docs/blog-flagship/footage-audit/`. It deliberately judges nothing; there is no measurement that
replaces looking, so its only job is to make looking fast.

| clip | verdict |
|---|---|
| `shot8-porch-callback` | **GOOD** - clean throughout, real arc (worried, then smiles at ~6.5s) |
| `shot9-desk-callback` | OK |
| `shot10-laptop-close` | **BAD** - identity drift, duplicate prop, lid backwards |
| `shot11-old-records` | **BAD** - hard cut to an unrelated scene at ~7.5s, hallucinated tab text ("MISSY", "OAKBERY") |
| `shot12-typing-notes` | **BAD** - keyboard melts into nonsense keys, a red nail appears mid-shot |
| `shot13-three-folders` | OK **only** 0.3-5.6s; three folders become one after 7.5s |

**The failure taxonomy, all five found in one batch of six:** identity drift, duplicate props,
hallucinated text (despite "no text" in the prompt), a cut inside the clip, and melted mechanisms.
Prompt against these, not just for the subject: no keyboards or screens in frame, ONE hero object,
a single continuous action. And record a clip's SAFE RANGE in the ledger, not just its filename.

### 1. The sameness is fixed. `keys-porch` no longer closes every film.

| film | close, before | close, now |
|---|---|---|
| reactivation | shot6-keys-porch | **shot8-porch-callback** - the call being taken, and the moment it turns |
| qualify | shot6-keys-porch | **shot9-desk-callback** - sitting down to work the list |
| workflow | shot6-keys-porch | **shot10-laptop-close** - the laptop shuts and the room empties |

Six new clips, two per re-cut film: a close plus one beat that only makes sense for that topic
(`shot11-old-records`, `shot12-typing-notes`, `shot13-three-folders`). `shot6-keys-porch` now
appears in ONE film instead of four, `shot2-empty-office` in two instead of four. Every prompt is
in `scripts/film/footage/FOOTAGE.md`. **Flow's download path changed and the old recipe in that
ledger no longer works** - the fix is written down there, read it before generating more.

**Not done: the owner asked for 3-4 new clips per post and this is 2, and the voice film was not
re-cut at all** (it is the older single-layer pipeline and still uses keys-porch). Six clips, 90
credits. More footage is the cheapest remaining upgrade.

### 2. Every film has a sound bed. There was none before.

`scripts/film/sfx/` is a committed library of 6 beds and 4 events with a prompt ledger, and
`scripts/film/bed.mjs` builds a film's bed **from the same PLAN the picture is cut from**, so a
beat cannot have a picture without a sound. Levels are measured at build time from each source's
own loudness, not typed. Black cards get `amb-void` rather than silence, because a hole in the
sound is heard as a fault and not as a pause.

**Each film's one event is deliberately different** - a notification for workflow, a ring for
reactivation, a buzz for qualify - for the same reason the footage had to change. Restraint is the
rule: one or two events in a 60-second film, never over a word.

### 3. Transitions are a grammar, derived from the plan

In `scripts/film/beats.mjs`. Footage into black **dips**, black into footage **lifts**, and
footage into footage stays a **hard cut** because two real shots meeting needs no help - the note
"do not just crossfade everything" was right. Two exemptions that would be defects otherwise: the
first beat never lifts (the poster is frame zero and must be the picture), and the last never dips
(assemble already fades at FADE_AT).

### 4. The surface question, decided rather than split

The honest tension was "organic reach rewards scrappy, native video" against the Apple-minimalist
house style. **They are different surfaces and should not be averaged.** The on-page film is
`controls`, no `autoPlay`, no `muted`, `preload="none"` behind a poster (verified in
`components/blog/scenes/primitives/Film.tsx`): it is only ever watched by someone who clicked into
a 3,000-word technical article and then deliberately pressed play. There is no scroll competition
and no sound-off default, so cinematic restraint is correct there and sound design pays off. The
scrappy/sound-off/captions-are-the-script rules belong to the 9:16 feed cut, which is a different
deliverable and lives in `realtylt-stories`. Do not import feed instincts into the on-page film.

### THE AUDIO IS NOW MEASURED, BUT STILL NOT HEARD

`scripts/film/verify-audio.mjs` transcribes the SHIPPED mp4 and diffs it against the schedule that
produced it. All five films return **100% of every line**, with the beds under them, which is what
makes "the bed does not drown the voice" a measurement instead of an opinion. `sfx-verify.mjs`
proves every bed is speech-free, steady and not music, calibrated against deliberately generated
music as a negative control.

**That is not the same as listening.** Nobody has heard whether the bed is TASTEFUL, whether the
notification sounds cheap, or whether the porch ambience suits the close. Those are judgement, a
script cannot judge them, and this round did not fake it. **Ask the owner to play one film.**

### The pipelines, and which is which

- **`scripts/film/reactivation/`, `qualify/`, `workflow/` are the CURRENT pattern**: two-layer, where
  ffmpeg cuts the picture bed from real footage and Playwright draws transparent type over it,
  authored at 1280x720 (the footage's native size), crf 23. **All three now have a `cut.mjs`** that
  derives `FILM_LEN` and `FADE_AT` from the measured schedule and holds the beat PLAN, so the fade
  trap is structurally gone from every one of them rather than just from workflow. Copy any of them.
- **`scripts/film/voice/` is the older single-layer stage**, with `broll.mjs` compositing footage
  under it afterwards. It has NO bed, NO transitions and still uses keys-porch. It is the obvious
  next film to bring up to the others.
- B-roll lives at `scripts/film/footage/` with a ledger. `shot7-signup-callback` has no recorded
  prompt, so it cannot be regenerated. **Record the prompt for every new clip.**

### The order to run a film, now that sound exists

| step | command |
|---|---|
| 1 | `node scripts/film/<topic>/vo.mjs` - narration, MEASURED into `schedule.json`. `--keep` reuses audio. |
| 2 | `node scripts/film/<topic>/bg.mjs` - the picture bed, with the transition grammar applied. |
| 3 | `node scripts/film/<topic>/render.mjs` - transparent type PNGs. `--probe 0,17,25` for single frames. |
| 4 | `node scripts/film/<topic>/assemble.mjs` - builds the sound bed, mixes it under the voice, encodes. |
| 5 | `node scripts/film/verify-audio.mjs` - transcribes the SHIPPED file. Must stay at 100%. |

`node scripts/film/sfx-gen.mjs` and `sfx-verify.mjs` only need re-running if you add a sound.

### Sound and measurement traps, paid for 2026-08-01

- **Never ask a generator for a QUIET sound.** The first seven bed prompts described how the beds
  should sit in the finished film - "very faint", "barely audible", "almost inaudible" - and
  generation obeyed exactly, returning seven files at -68 to -70 LUFS. That is the noise floor:
  lifting one to a usable level brings its own codec noise with it. Ask for the SOUND, name a
  loud real source ("microphone close beside a refrigerator"), and set level in the mix.
- **Words like "soft", "gentle" and "smooth" also push it toward silence.** The takes that landed
  at a usable level all named a continuous mechanical source. "Nothing starts or stops" is what
  stops a bed being a series of events.
- **`ebur128=framelog=verbose` prints NOTHING in this ffmpeg build.** A steadiness probe built on
  it measured nothing, reported null, and the gate read null as a failure - so every bed "failed"
  on a probe that was not measuring. Use `astats=metadata=1` with `ametadata=mode=print`.
- **The integrated loudness is the LAST `I:` in an ebur128 log, not the first.** Taking the first
  reported a flat -70 LUFS for every file in the library, including events peaking at -5.
- **`astats` `reset` counts DECODER FRAMES, not seconds**, and the ratio varies by file. Re-bucket
  the windows using the measured duration instead of assuming a frame size.
- **Calibrate a "is this music" gate against music you generated ON PURPOSE.** A flatness threshold
  picked by intuition (0.06) rejected a real air-conditioner bed. Generating an ambient music pad
  (0.0099) and a synth drone (0.0134) as negative controls showed real beds sit at 0.0455 and up,
  so the gate belongs between them. The idea that FAILED the same test is worth remembering too:
  "music moves in pitch, machines do not", measured as spectral-centroid variation, ranked
  `amb-void` as more musical than the synth drone. It separates nothing.
- **A plain max-minus-min range is not "steadiness".** It called every bed unsteady for two
  innocent reasons: generated clips often fade up from digital silence, and birdsong is supposed to
  punctuate a porch. Use p95 over p50, and count how many windows are loud - recurring texture is
  content, one spike is an incident.
- **Guard an imported module's CLI block.** `bed.mjs` ran its `process.argv` block on import and
  exited the whole assembly before it started. Compare `import.meta.url` to `process.argv[1]`.
- **A sound needs somewhere to GO.** Every gap in these narrations is 0.40-0.90s, so an event is
  trimmed to its gap and faded rather than ringing under the next sentence. When the picture
  changed, workflow's second event had no gap within two seconds of the thing it described, and
  the right answer was to drop it, not to place it early.

### Film traps, every one of them paid for. Do not relearn these.

- **A fade-to-black constant does NOT follow from the schedule.** The voice film grew from 45s to 60s
  and `FADE_AT` stayed at 44.5, so the entire new beat and the CTA faded to black. Derive it, or move
  it every single time the length changes.
- **A higher z-index does not clear what is behind it.** Two centred beats both visible render
  straight through each other. Every beat needs an explicit `out`.
- **Probe individual frames before committing to a full render.** Both faults above were found by
  probing three frames and would have cost a full render each.
- **`colorchannelmixer` takes TWELVE parameters.** Feeding it a 3x3 silently misassigns channels; a
  cut came back entirely VIOLET, the exact palette the house rules ban.
- **A `lighten` blend contaminates coloured type.** It takes the per-channel max, and the azure accent
  is low-red, so warm footage behind it drags the colour toward magenta (measured: V chroma 125 to
  130, past neutral). **Key on the film's own luma instead** so a text pixel is 100% film.
- **Bright footage destroys thin type, and gain alone cannot fix it.** Dark enough for the small type
  is too dark to see the picture. Use a scrim: image bright at the edges, darkened through the middle
  where the type sits. The voice film's `broll.mjs` has a working one.
- **Chroma must be pulled toward neutral in the same pass as luma**, or darkened warm shots come back
  magenta.
- **Never run a B-roll script with its own output as its input.** It is not idempotent.

### Google Flow, as actually operated

Owner's PERSONAL Google account `levan.realtylt@gmail.com` holds the AI Pro subscription (the
Workspace account lost Flow bundling; settled, do not reopen). **15 credits per clip**, ~1000
available. Settings that are already correct: confirm-before-generating ON, 16:9, x1, Omni Flash,
visible watermarking OFF.

- **Omni Flash generates 720p.** Its "1080p" download is an AI upscale, and it is only offered for
  clips generated in the current project. Do not mix upscaled and native clips in one film: the
  inconsistent sharpness looks worse than uniform 720p.
- Download via the item's ⋮ menu → Download → **720p Original Size**. The big toolbar download button
  fetches a ~23MB export that **stalled indefinitely** and never completed.
- **Never click a menu item by coordinate** — the page re-lays out between screenshot and click, and
  a Download click once landed on the wrong item. Use `find` to get an element ref, click the ref.
- **The approval card sometimes renders with no buttons.** Do not re-prompt the generation; type
  "Approve" as a chat message and the buttons come back.
- Downloads land in `C:/Users/Levan/Downloads`.
- **Every generated screen is unreadable pseudo-text.** Never plan a shot whose payoff is words on a
  device; caption typography carries the meaning.

### State at handoff

Five AI-service posts, all measured on PRODUCTION 2026-08-01: chat 19/19, voice 19/19, reactivation
19/19, workflow 19/19, qualification 18/19 (D5 only, and it cannot pass honestly until that post
takes a real revision). 565 tests green. Fifteen posts total; the other ten are consumer topics the
owner has explicitly put OUT OF SCOPE.

`/ai` has 20 service nodes, 5 wired with a blog card, but **only 3 are live** — the page needs an
explicit `vercel promote` and the owner approves those. `robots.txt` is `Disallow: /`; everything
stays dark for a single go-live.

**Open, owner-gated:** promote `/ai` (3 cards to 5) · `/search` ships 13MB of unresized MLS photos
because full-size Supabase originals are served straight into small cards (the mirror is fine, the
resizer is missing; those files belong to the concurrent session) · **original data of our own is
gated on LAUNCH**, not on effort: 37 chat sessions and 18 exchanges in 30 days, mostly the owner's
own testing, because there is no public traffic yet.


## STATUS (2026-08-01, session 11: TOPIC 5 IS LIVE, and every AI-service post is now a flagship)

**Five flagships are live.** Measured on production with `node scripts/score-flagship.mjs <slug>`:

| topic | slug | gate | film |
|---|---|---|---|
| 1 chat | `ai-chat-assistant-real-estate-website` | 19/19 | 39s |
| 2 voice | `ai-voice-agent-missed-calls-real-estate` | 19/19 | 60s |
| 3 reactivation | `database-reactivation-old-real-estate-leads` | 19/19 | 49s, real footage |
| 4 qualification | `ai-lead-qualification-real-estate-scoring` | 18/19 (D5, see below) | 53s, real footage |
| 5 workflow | `workflow-automation-real-estate-business` | **19/19** | **59s, real footage** |

Topic 5 added **ZERO new components**, four topics in a row. There is no longer an untreated
AI-service post: the 9/19 the gate used to score is gone.

**Topic 5 passes D5 honestly**, which is worth understanding rather than copying. It shipped
2026-07-13 as a plain 1,200 word article and was genuinely rebuilt on 08-01, so `updated` is a
true statement about a real revision. That is the ONLY way to pass D5. Topic 4 still cannot, and
still should not fake it.

### THE ZOMBIE STAT THIS TOPIC ALMOST PUBLISHED, and the rule that caught it

The interruption research everybody quotes is Mark, Gonzalez and Harris, *No Task Left Behind?*
(CHI 2005, UC Irvine). The figure attributed to it across the entire internet is **"23 minutes and
15 seconds"** to return to interrupted work, usually beside **"81.9 percent resumed the same
day"**. **Neither number is in the paper.** Verified by extracting the text of a freshly fetched
copy: `23 min. 15` and `81.9` are both ABSENT. The published figures are **25 min 26 sec** and
**77.2 percent**, and both are on the page.

This is now the second correction of this shape (topic 3 corrected "$16,000 per text"). The rule
that produced both: **read the operative sentence in the primary source, never a summary of it,
even when the summary is unanimous.** `pdftotext` is on this machine and handles a two-column
CHI paper fine; use it without `-layout`, which interleaves the columns and scrambles the numbers.

### A REAL DEFECT NO PROBE COULD SEE, and why it is worth remembering

`StatBars` reserved a fixed 78px for its value text. That is correct for `15%` and `60x`, which is
everything the first four topics charted, and it silently **crops** `25 min 26 sec` to
`25 min 26`. **An SVG does not overflow, it crops**, so no overflow check, no scrollWidth check
and no DOM assertion can find it. Only looking at the picture finds it.

Fixed in the primitive rather than worked around in content: the reserve is derived from the
longest `display` string and floored at the old 90, so the four shipped charts keep byte-identical
geometry (verified live: track width still exactly 550 on all four, 506 on the new one).

**`node scripts/check-svg-crop.mjs` is the standing guard**, and it is committed rather than
scratch. It calls `getBBox()` on every `text` node in every `svg[role="img"]` across all five
posts and fails if any ink reaches more than 1.5 user units past an edge. Its first version was
WRONG and flagged two shipped charts, because a label anchored at x=0 reports x = -0.83 from its
glyph side bearing; the threshold is documented in the file with the measurement that sets it (the
real defect was 24.7u, the widest innocent bearing is 0.83u). **Run it against the shipped posts
before believing it about a new one.**

### THE FADE TRAP IS NOW STRUCTURALLY GONE

The three earlier films wrote the film's length into two scripts by hand and the fade point into
one, and a render was lost when the cut grew and the hardcoded fade did not move. `scripts/film/
workflow/cut.mjs` derives `FILM_LEN` and `FADE_AT` from the measured schedule and every other
script imports them. `bg.mjs` additionally asserts each beat starts exactly where the previous one
ended, so a mistyped boundary fails the cut instead of quietly shifting the picture off the voice.
**Copy `scripts/film/workflow/` rather than `qualify/` for the next film.**

Verify a finished film on the FINISHED FILE, not on the stage: a 30-frame contact sheet
(`fps=1/2,scale=256:-1,tile=6x5`) read against the schedule, `silencedetect` against the line
boundaries, and `signalstats` YAVG sampled through the tail to prove the fade lands where the
schedule says (this one: 41 at t=58.4, 21 at t=58.9).

### Sources used, so topic 6 does not reuse one

Five topics, five different bodies of evidence. Topic 5 used:
- **Mark, Gonzalez and Harris, CHI 2005**, `https://ics.uci.edu/~gmark/CHI2005.pdf` (author-hosted,
  free, complete). 24 information workers, 700+ hours, timed to the second. The ACM DOI page
  bot-blocks and could not be read, so it is deliberately NOT cited.
- **Zapier's own help pages** for the 95-percent-in-7-days auto-pause default and the run status
  vocabulary. Both re-checked live for the operative phrase after deploy.
- **n8n's docs** for the error workflow and Error Trigger.

**Vendor PRICING was investigated and deliberately not cited**: n8n's and Zapier's pricing pages
render their numbers in JavaScript, so the figures could not be read from the source. The post
refuses to print a price instead, which is the topic-3 pattern.

### Remaining topics, in the order I would do them

`review-automation`, `ai-appointment-booking`, `local-seo`, `geo-landing-pages`, `crm-sync`,
`ai-agent-workforce`, `skip-tracing-lead-generation`, `marketing-automation`,
`document-processing`, `data-enrichment`, `ai-scheduling`, `invoicing-and-payments`, `ai-clone`,
`ai-audit`, `custom-automation`.

**Each needs its own DIFFERENT third-party study**, and the bar is now five in a row.

## EARLIER STATUS (2026-07-31, session 10: TOPICS 3 AND 4 ARE LIVE, and the films now use real footage)

**Four flagships are live.** Measured on production with `node scripts/score-flagship.mjs <slug>`:

| topic | slug | gate | film |
|---|---|---|---|
| 1 chat | `ai-chat-assistant-real-estate-website` | 19/19 | 39s |
| 2 voice | `ai-voice-agent-missed-calls-real-estate` | 19/19 | 45s |
| 3 reactivation | `database-reactivation-old-real-estate-leads` | **19/19** | **49s, real footage** |
| 4 qualification | `ai-lead-qualification-real-estate-scoring` | **18/19** (D5, see below) | **53s, real footage** |

Topics 3 and 4 each added **ZERO new components**. Three topics in a row now. The primitive set
is right and should be left alone.

### THE ONE CHECK TOPIC 4 DOES NOT PASS, and why it is the gate that is wrong

**D5 wants `dateModified` later than `datePublished`. A post written and shipped in one day has
not been revised, so it cannot pass D5 without a fabricated date.** Topics 1, 2 and 3 pass it only
because each was genuinely revised on a later day than it was written. Topic 4 was not, so it is
18/19 and `updated` is deliberately unset with a comment in `content/blog/posts.ts` saying so.

Do not "fix" this by inventing a date. Either set `updated` when the article takes its first real
revision, or change the check to distinguish "has been maintained" from "was published today".
The self-grading rule in SCORECARD.md exists for exactly this shape of temptation.

### THE FILM RECIPE CHANGED: real footage, two layers

`scripts/film/reactivation/` and `scripts/film/qualify/` are the pattern now. Both are committed,
both run from a clean checkout, and the b-roll they need is committed too at
`scripts/film/footage/` (6 clips, 13MB, with the ledger). **Do not touch `scripts/film/voice/` or
`public/video/film-942pm.mp4`** — the owner was reworking that film in parallel.

| step | command | note |
|---|---|---|
| 1 | `node scripts/film/<topic>/vo.mjs` | ElevenLabs LT clone. Generates, MEASURES, writes `schedule.json`. `--keep` reuses audio. |
| 2 | `node scripts/film/<topic>/bg.mjs` | Cuts the b-roll into the picture bed. **Every segment boundary is a measured line boundary.** |
| 3 | `node scripts/film/<topic>/render.mjs` | Transparent PNGs (`omitBackground`). `--probe 0,17,25` composites single frames OVER the real bg. |
| 4 | `node scripts/film/<topic>/assemble.mjs` | Overlay onto bg, VO mix, one encode, poster from frame zero, `silencedetect`. |

**Why two layers and not a `<video>` in the stage.** Putting the clips inside the HTML would make
the bundled Chromium decode H.264 (it often cannot) and would make every frame depend on a seek
completing before the screenshot fires. Compositing in ffmpeg is deterministic and cannot land on
a stale frame.

**Authored at 1280x720, not 1920x1080.** That is the footage's native resolution, so nothing is
upscaled and there is one encode generation. The earlier films authored at 1920 because their
pictures were drawn rather than shot; both shipped at 1280x720 anyway.

**CRF 23, not 16.** Flat dark graphics compress to almost nothing (the voice film is 45s in
1.3MB). Real moving footage does not. 23 lands a 50s film at ~4.7MB, in the same range as the
chat film, and `preload="none"` with a poster means a reader who scrolls past downloads none of it.

**A black bed is a design choice, not a gap.** Three of topic 4's nine picture beats are black,
because the beats that ask a viewer to stop and read a regulation are worse with footage under
them.

### Faults found by LOOKING, that the gate cannot see

- **`text-transform: uppercase` corrupts a legal citation.** It rendered `64.1200(f)(5)` as
  `(F)(5)`. On pages whose argument is that the details are checkable, that is not cosmetic.
- **An alpha that reads as restraint over a photograph reads as a rendering fault over black.**
  The fair housing footnote at `rgba(255,255,255,.44)` was nearly invisible on a black bed; .62.
- **A foot-only scrim leaves the top third unprotected.** Both films put type in the TOP third
  over sunlit kitchens. Gradients are two-ended now: dark at both ends, clear through the middle.
- **A probe frame landing mid-fade lies.** The footnote above looked dimmer than it is because
  t=42 was 0.1s into a 0.5s fade. Sample after the fade completes before believing a probe.
- **The FIRST node of a `diagram` needs the SHORTEST caption.** Captions are centred under their
  node and the first node sits at the very start of the scroll container, so anything wider than
  the node spacing is clipped by the container edge at 390px. 33 characters lost a letter; 19 is
  safe. The existing comment warned about the third node, which was the wrong node.
- **Eyebrows run ~40% wider than the same words in body text** (uppercase plus tracking). 45
  characters wrapped to two rows at 390 with one word alone. Keep them near 33.

### RESEARCH FINDINGS worth carrying to every future topic

A full sweep of what practitioners say plus a hunt for primary statistics produced a **zombie
stat list. Do not cite any of these**, they are repeated everywhere and none survive checking:

- **"80% of sales require 5 follow-ups" / "44% give up after one"**, attributed to the National
  Sales Executive Association. **That association does not exist.**
- **"82% of real estate transactions come from repeat and referral"** — no primary source, and
  NAR's own Member Profile contradicts it.
- **"Only 3% of the market is ready to buy now"** — Chet Holmes asked for a show of hands at
  seminars. It is a heuristic, not research.
- **Every response-rate figure for cold database SMS** ("30-60% response", "5-25% conversion").
  All vendor marketing. **There is no independent study of this in any vertical**, which is itself
  a finding and is why topic 3 quotes none.
- **"$16,000 per text"** — a real number from a different statute (FTC), not the TCPA. Agents
  believe it; correcting it is a credibility win and topic 3 does.

Sources that DID survive and are reusable:
- **NAR 2025 Home Buyers and Sellers Generational Trends** (free, NAR-hosted, complete, all
  exhibits): `https://cms.nar.realtor/sites/default/files/2025-03/2025-home-buyers-and-sellers-generational-trends-report-04-01-2025.pdf`.
  Topic 3 uses Exhibit 7-1, topic 4 uses Exhibit 6-23. **Note the period**: published 2025, survey
  mailed July 2024, covers the twelve months to June 2024. Say so on screen.
  NAR's newer full 2025 Profile is a **paid** product and its free "highlights" PDF is 6 pages of
  front matter, so this is the best free primary available.
- **Cornell LII** for federal law. eCFR blocks programmatic access; LII does not and carries the
  same text.
- **Twilio's own docs** for messaging deliverability thresholds.

### Remaining topics, in the order I would do them

`review-automation`, `ai-appointment-booking`, `local-seo`, `geo-landing-pages`, `crm-sync`,
`ai-agent-workforce`, `skip-tracing-lead-generation`, `marketing-automation`,
`document-processing`, `data-enrichment`, `ai-scheduling`, `invoicing-and-payments`, `ai-clone`,
`ai-audit`, `custom-automation`. `workflow-automation` still has an untreated post at 9/19.

**Each topic needs its own DIFFERENT third-party study.** Four topics have now used four
different ones and reusing a fifth time would make the citations decorative. Search for the
evidence that fits the argument before writing the argument.

## EARLIER STATUS (2026-07-30, session 9: TOPIC 2 IS LIVE and the template is proven)

**`/blog/ai-voice-agent-missed-calls-real-estate` passes 19/19 on the gate**, verified on
production 2026-07-31 (`node scripts/score-flagship.mjs ai-voice-agent-missed-calls-real-estate`,
`published=2026-07-30 modified=2026-07-31`). The shipped chat post still passes 19/19 too, so the
primitive extraction caused no regression. An earlier line here said 18/19; that was written
before the post took its first real revision and was stale, not wrong at the time.

**The template worked. Topic 2 added ZERO bespoke components.** The four scenes it needed were
generalised out of topic 1's one-off code instead of copied:

| new primitive | generalised from | what a topic now varies |
|---|---|---|
| `StatBars` | `ResponseCurve` | bars, which one is lit, `max` (100 for shares, omit for ratios), source, **required caveat** |
| `Diagram` | `SystemDiagram` | steps, eyebrow/heading/lede, band, `idBase` |
| `Conversation` | `Teardown` | turns, events, side labels, and `layout: "bubbles" | "transcript"` |
| `Plate` | (new) | a photograph plus a caption that does real work |

`ColdOpen` now takes `moment`, `suffix`, `photo` and `signature` as props (`"porchlight"` for
the chat piece's breath, `"ring"` for a phone nobody answers), so a topic owns its hero without
a second hero component. Defaults reproduce topic 1 exactly.

**Two honesty rules are now STRUCTURAL rather than cultural.** `StatBars` requires a `note` and
`Conversation` requires a `note`, so a topic physically cannot ship a cited chart without saying
where the evidence stops, or a staged demonstration that does not admit it is staged.
`lib/blog/flagship.test.ts` is now `describe.each` over a TOPICS table rather than a block to
copy per topic, and it asserts those notes are non-empty and that every `sourceHref` is https.

**What is left of the primitive plan:** only `Timeline` (from `ResponseGap`), and the chat
post's own `ResponseCurve` / `SystemDiagram` / `Teardown` have NOT yet been migrated onto the
primitives that were extracted from them. That migration is safe to do with
`_scratch-shots.mjs before / after --diff` (noise floor ~0.0007) and is the obvious next job.
The calculator stays bespoke by design.

### THE VOICE FILM, and why the recipe is now committed

`public/video/film-942pm.mp4` (45s, 1280x720, 1.3MB) is topic 2's own film. The chat film was
never an option here: it is narrated around a buyer MESSAGING a website and being texted
listings, so reusing it would have put a video about the wrong channel on a page arguing that
you should say what is true.

**The sources are COMMITTED, under `scripts/film/voice/`, not scratch.** The chat film's stage
and pipeline live under gitignored `scripts/_scratch-*`, which means the shipped artifact cannot
be regenerated from a clean checkout. That is fixed for this one:

| step | command | note |
|---|---|---|
| 1 | `node scripts/film/voice/vo.mjs` | ElevenLabs LT clone. Generates the lines, MEASURES them, writes `schedule.json`. `--keep` reuses existing audio. |
| 2 | `node scripts/film/voice/render.mjs` | 1350 lossless PNGs at 1920x1080. **Headless is fine** here: no /ai galaxy, so no GPU. `--probe 0,17,35` frames single moments instead. |
| 3 | `node scripts/film/voice/assemble.mjs` | VO mix, crf 16 master, crf 18 web copy, poster from FRAME ZERO, and a `silencedetect` pass that proves every gap is a scheduled beat. |

Needs `npm i ffmpeg-static --no-save` (it is not in package.json) and `ELEVENLABS_API_KEY`.

Rules this film encodes, on top of the ad rules already in this file:
- **The cut is DERIVED FROM THE VOICE.** Step 1 runs before the stage exists; the stage's beat
  times ARE the measured line boundaries. Never speed up a real person's voice to fit a stage.
- **The poster is frame zero.** The hook number is the reason anyone presses play, so the still
  the player shows must be the frame the film opens on.
- **The narration discloses that it is a clone**, in the on-page caption. On a piece arguing
  that an AI voice must say what it is, narrating with a synthetic copy of a real person and
  staying quiet about it is the exact hypocrisy the piece warns about.

Faults found by probing frames, both of which a single still would have hidden:
- **A higher z-index does not clear what is behind it.** "They call the next agent." rendered
  straight through the 9:42 clock, because the clock's fade-out was scheduled 2.3s too late.
  Sequence the outgoing beat against the narration, then check the frame.
- **Do not run the caption band under a beat that is already a held statement.** Two of the
  eight lines printed the same sentence twice at two sizes. Those captions were dropped; the
  words are still on screen, larger, so it is not a dropout.

### PREMISES THAT WERE WRONG, corrected against primary sources

The brief for this session asserted **"NY is two-party consent for recording"**. It is not.
[NY Penal Law 250.00](https://www.nysenate.gov/legislation/laws/PEN/250.00) defines mechanical
overhearing as recording *"without the consent of at least one party thereto, by a person not
present thereat"*, so a participant may record. New York is ONE-party. The post says so and
argues we should disclose anyway, which is a better section than the wrong premise would have
produced. **Verify every factual premise before building on it, including the brief's.**

Every external claim on the page carries a link that was checked for a 200 before shipping:
HBR/Oldroyd, the FCC's Feb 2024 declaratory ruling, NY Penal 250.00, Cal. Penal 632, CA AB 2905.

### Known, and NOT fixed here

**The /ai page's "from the blog" cards point at a 500 on the live site.** On production
`SERVICES_BASE` resolves to `https://realtylt.com/...`, and the rebuilt marketing site is not on
the apex yet, so `realtylt.com/blog/<slug>` redirects to www and returns **500**. This already
affected the shipped `chat` card. The voice entry was added to `BLOG_POST` and pushed, but the
deployment was deliberately **left on preview and NOT promoted**: promoting would put a second
broken link on a live page. Promote both once the marketing site is on the apex.

## EARLIER STATUS (updated 2026-07-30, session 8: the first ad is CUT)

**"The $6,000 lead" is DONE and rendered in both formats.** Watch these two files, then decide
what the next ad is:

- `C:/Users/Levan/realtylt-stories/out/six-thousand-lead-9x16.mp4` — 1080x1920, 32.5s, 15.7MB.
  **This is the ad format** (Facebook/IG Reels/Shorts).
- `C:/Users/Levan/realtylt-stories/out/six-thousand-lead-16x9.mp4` — 1920x1080, 32.5s, 25.6MB.
  For YouTube and the site.

Both are gitignored (`out/`); the repo holds everything needed to re-render them.

**The story, six shots:** a $6,000 lead messages at 11:40pm / the office is dark / something
answers anyway, and it never guesses / it sends real riverfront listings in Beacon from the live
MLS / the call is booked before the coffee finishes / that commission stays with the agent,
closing on realtylt.com/ai. Narrated in the owner's own cloned voice (LT).

**Every number in it is defensible.** $6,000 is the blog's LeadsCalculator default commission,
11:40pm is the post's own frame, and "it never guesses" is the product's documented behaviour.
There is deliberately no invented response-time figure ("answers in 8 seconds") — nobody has
measured one, and the whole pitch is that the assistant does not make things up.

### What was built, and the three rules it encodes

`C:/Users/Levan/realtylt-stories` is now the content factory. `src/ads/six-thousand-lead.ts` is
the cut as DATA; `src/ads/Ad.tsx` renders it; one definition drives both deliveries so the two
formats cannot drift apart. A second ad is a second data file, not new components.

1. **Shot lengths are DERIVED FROM THE VOICE, not guessed.** `scripts/vo-gen.py <slug>` generates
   the lines, `scripts/vo-prep.mjs <slug>` measures each one into `timing.json`, and every shot is
   its line's length plus headroom. Retime the cut to the voice; never speed up a real person's
   voice.
2. **Nothing is spliced.** Each line is an independent `<Audio>` at an absolute frame, so the
   assembly physically cannot clip a tail — that was the fault the owner heard in the ffmpeg-mixed
   blog film, and it is now structurally impossible rather than patched. `silencedetect` confirms
   every gap is a deliberate beat (1.2s / 1.4s / 1.3s).
3. **The vertical cut never upscales.** A 1080x720 window over the 1280x720 source is a modest
   side crop at native resolution. Cropping 16:9 to 9:16 the obvious way would have meant a 2.67x
   blowup of 720p footage.

### Two faults only a contact sheet could find

Single stills looked perfect while the cut had both of these. Build the sheet
(`fps=1,scale=270:480,tile=6x6`) for every ad:

- **Frame one carried no text.** Frame one is the thumbnail and the number is the whole reason
  anyone stops scrolling. The hook shot's caption now sits at full opacity from frame 0, no delay,
  no fade.
- **Text dropped out for ~0.6s at every cut.** In a sound-off format the captions ARE the script,
  so that is a dropout, not a beat. Now ~0.26s.

Caveat on the sheet: at 1fps it lands mid-fade and reads as a missing caption. Confirm any
suspected gap by sampling the caption band at 15fps across that cut, not from the sheet.

### Google Flow, as actually operated

Owner's personal Google AI Pro account `levan.realtylt@gmail.com` (the Workspace account lost Flow
bundling 2026-07-07; settled, do not reopen). **1050 credits before this session, 15 per clip**, so
two clips cost 30. Settings that were already correct: confirm-before-generating ON, video 16:9,
x1, Omni Flash, visible watermarking OFF. Download via the item's ⋮ menu → Download → **720p
Original Size** (1080p is an upscale of the same 720p source and would not match the other clips).

Gotchas that cost time here:
- **The approval card sometimes renders with no buttons.** Typing "Approve" as a chat message
  re-prompts it and the buttons appear. 
- **Menu coordinates shift between the screenshot and the click** (the page re-lays out). Use
  `find` to get an element ref and click the ref, never a coordinate, for menu items.
- Prompts and the full footage ledger live in `public/footage/FOOTAGE.md`, including what
  generation reliably gets wrong: **every phone screen is gibberish pseudo-text**, so never plan a
  shot whose payoff is words on a device — the caption typography carries the meaning instead.

### What is NOT done

- **The owner has not watched it yet.** That is the next thing.
- **His voice clone still wants a fresh 2-3 minute recording.** He knows; one gentle reminder max.
- The other queued ideas below (click-to-listen blog audio, blog-as-video, davinci.ai) are
  untouched, as is the blog TEMPLATE work (5 of 9 scenes still bespoke — see TEMPLATE PLAN).

**The hook rule (r/NewTubers 349-video study; applies to EVERY video):** open with a concrete,
checkable number that pays off the promise; no atmosphere, no greeting, no warmup.

**Owner ideas queued (2026-07-30, his direction — scope before building):**
- **Click-to-listen on every blog post**: NotebookLM-generated audio (podcast-hosts style) or
  LT-voice TTS read-through, in a floating player that follows the reader with pause/play
  while they scroll. Decide the voice per lane; the player is a real build item.
- **Blog-as-video**: each post also as a full watchable video (talking-head avatar — his clone
  once the new voice recording lands, or Flow's experimental avatar). He wants a credit-cost +
  quality analysis BEFORE committing; run a small test and show him.
- **davinci.ai** (davinci.ai/app/home): third-party AI suite he has an account on (image,
  video, music, voice, browser editor, Nano Banana Pro). Logged in; driveable via Chrome.
- **Gemini app** on the personal account can also generate images/video — alternate surface.

**Chrome-driving notes:** the claude-in-chrome extension disconnects every few actions
(service-worker restarts) — reconnect via tabs_context_mcp createIfEmpty and continue; batch
actions; never schedule a critical click after a long wait. Flow downloads land in
`C:/Users/Levan/Downloads` (the owner often downloads himself — check there first).

**The blog film is DONE for now** (v4, 39s, live + byte-verified): slow galaxy drift → one
scroll-speed dive → labeled brain with ignition cascade + idle spin; LT-clone VO with the
$6,000 hook. Capture recipe = pinned golden path + CDP virtual time (below — never re-learn
it). Only re-voice it after his new clone recording, and only if he asks.

## EARLIER STATUS (2026-07-29, session 6: the film is narrated + /ai links in)

**The film is narrated by the OWNER'S OWN CLONED VOICE.** The ask was "an ElevenLabs voice
explaining details"; mid-session the owner saved `ELEVENLABS_API_KEY` as a **Windows user env
var** (read it via `(Get-ItemProperty HKCU:\Environment).ELEVENLABS_API_KEY` — a running session
does not inherit a fresh setx). The account carries his clone: voice **`LT`,
id `7AxhG2AEa5XhwSrAudqY`** — use it for RealtyLT narration; he confirmed it is his. The first
pass used free Edge TTS (`edge-tts` + truststore, voice AndrewMultilingualNeural) — keep that as
the no-key fallback. **The clone reads ~1.4x slower than Edge: retime the FILM to the voice,
never speed up a real person's voice.** The close and CTA beats moved later in film.html and the
cut is now **36s** (fade 35.5-36.0). The flight was retaken per the owner (other agents were
loading the GPU during the old capture); measured old-vs-new bright-pixel density 0.215% vs
0.227% — the master was never actually dim, the **crf 20 web encode was crushing the dark
starfield**, so the web copy now encodes at **crf 18** (1436 kb/s, 6.2MB).

The narration (LT clone, natural rate; STORY V2, owner 2026-07-29: hook + sell the money).
Grounded in the r/NewTubers 349-video hits-vs-flops study (found via the last30days skill):
hits open with a CONCRETE, CHECKABLE number or claim that pays off the promise; atmospheric
warmups and greetings correlate with flops; pace is baseline, not a differentiator. The $6,000
is the LeadsCalculator's own default commission, so the page defends the film's hook number.

| start | line |
|---|---|
| 0.30 | Last night, a six thousand dollar lead messaged your website. |
| 4.90 | A real question. Most sites would answer with a form. |
| 9.10 | This is the AI that answers for you. And it never guesses. |
| 13.85 | It says so, honestly. Then it texts real listings from the live MLS. |
| 20.10 | Search, text, transcript, all in the CRM. The call: booked by morning. |
| 26.20 | It answered at eleven forty. You called at nine. |
| 30.80 | Keep the next one. Realty L T dot com, slash A I. |

**THE FLIGHT IS CAPTURED IN PINNED MODE — never scroll-record it again.** Two supersessions of
the old recipe, both measured:
1. The quality governor dims a scroll capture (screenshot cadence reads as single-digit fps) —
   pinning it (`__qt.force(0)` + truncate `__qt.tiers`) helps but is NOT enough, because
2. **the real-user scroll path draws a ~7x sparser galaxy than the pinned golden path** (bright
   pixels 0.128% vs 0.957% at p=0.05), and settling does not recover it (0.3-4s tested, flat).
   Every scroll-driven capture was structurally dim — this was the owner's "galaxy still dimmed".
The recorder is now `_scratch-film-flight3.mjs` (v3, 2026-07-29 evening): after the REAL-TIME
boot, CDP virtual time advances the page exactly one film frame per capture, so all real-time
motion (ignition wave, twinkle, drift) plays at natural speed instead of ~9x fast - the owner
read that compression as "stopping and shaking". At the hold, `__pinwave` fires the page's own
arrival cascade and `__pinspin` eases in the hub idle spin (~2x live rate, reads on film).
Screenshot starvation under paused virtual time is handled by a nudge-and-retry. v2
(`_scratch-film-flight2.mjs`) is the same pinned sweep without virtual time: serve the ai-page repo locally, boot
`#p=...,noscroll` (pinned), sweep journey-p per frame via the page's `__pinp` hook (added
2026-07-29, pinned-only, deployed). One more trap it fixes: the OLD keys were SCROLL FRACTIONS,
which land deeper in the journey than the same journey-p — that is why the old hold showed the
hub labels. Labels need journey p > 0.85; the keys now end at 0.92 so the hold is the fully
labeled brain ("AI chat assistant" lit) at golden density.

Retimed beats in film.html: .close in 25.30 / text up 25.80, out 29.30; .cta in 29.60 / .in up
29.90 / .f 30.90. Stage render range is [0,6]+[12,36]. Pipeline: `_scratch-vo/gen11.py lt` (per
line: `gen11.py lt 1.0 <i>`), then `_scratch-vo/assemble36.mjs` (VO mix, master crf 16 from the
frame sequence, web crf 18). Narrated 1080p master for YouTube:
`scripts/_scratch-video/film-master-1080-vo-lt.mp4`, local only.

Traps that cost time in this pass:
- **AVG MITMs Python TLS too**: `pip install truststore` + `truststore.inject_into_ssl()` before
  edge-tts, or every request dies on CERTIFICATE_VERIFY_FAILED.
- **`tpad stop_mode=clone` clones the LAST frame, which is mid-fade** on this cut. Measure the
  fade with signalstats YAVG (16.8 clean, 0.2 black), trim to the clean frame, hold THAT.
- **astats `reset` is in FRAMES, not seconds** — `reset=0.25` silently gives a cumulative average
  that reads flat and proves nothing. Verify alignment with `silencedetect` against the schedule.
- **The player had `muted` + `loop`** from its silent days; a narrated film needs neither (play is
  user-initiated, and a looping narration restarts itself forever). Both removed.
- The VO pipeline (gen.py + assemble.mjs) is gitignored under `scripts/_scratch-vo/`; the words
  and offsets above are the durable copy. One generation from the 1080p master
  (`scripts/_scratch-video/film-master-1080.mp4`, local only): crf 14 narrated master, then the
  web 720 copy from it. A narrated master for YouTube sits beside it as
  `film-master-1080-vo.mp4`.

**The /ai page now links back to this post.** In repo `realtylt-ai-page` (branch `windows-main`,
deploys by push + `npx vercel promote`): each service panel shows a bordered "from the blog" card
below "Read the use cases and FAQ", driven by a `BLOG_POST` map keyed like `SERVICE_SLUG`, plus a
crawlable link in the sr-only SEO mirror. Only `chat` is mapped today; add one line there as each
new topic ships. The owner explicitly did NOT want a services directory in the /ai outro (built,
then removed on his correction).

## EARLIER STATUS (2026-07-28, session 5: the film re-cut and the template)

**The page is live and green.** `node scripts/score-flagship.mjs ai-chat-assistant-real-estate-website`
passes 19/19 mechanical checks. The same gate scores the untreated workflow post 9/19 and exits 1,
which is how you know it is a gate and not a rubber stamp.

### What this session changed

**1. The film was re-cut.** 50s to 31s, and rebuilt from scratch rather than re-encoded.
- The old cut opened on 18 seconds of near-static galaxy with the /ai page's nav, hero copy and
  "Work with me" button in shot. It read as a screen recording of a website.
- **The quality fix was the capture method, not the bitrate.** Playwright's `recordVideo` is a
  fixed low-bitrate VP8 encoder with no quality knob (881 kb/s), and a moving starfield is the
  worst case there is for it. Every frame is now a LOSSLESS PNG screenshot. Result: shorter film,
  higher bitrate, SMALLER file (4.7MB / 1267 kb/s, was 5.3MB / 881 kb/s).
- Structure: the hook is a question landing at 11:40pm in the first two seconds; the flight is
  3.6s of travel plus a held brain; it ends on `/ai#chat` instead of trailing off.
- 30fps, not 60. The flight cannot be captured at 60 (each frame costs ~230ms of real time, so
  60fps would double both the capture time and the ambient drift baked into it).

**2. A real hydration bug, found and fixed.** The post threw React #418 on every load and the
hydrated DOM carried TWO `RealEstateAgent` JSON-LD blocks. A previous session saw the duplicate,
called it "a transient hydration artifact" and moved on. It reproduced on every load. Cause: the
system diagram's `<title>` had two text children, and React treats `<title>` as document metadata
and does not reconcile several children inside it. React threw away and regenerated the whole page
tree on the client every time. See the commit for the diagnosis path (control post, unminified dev
error, component stack).

**3. The template landed.** See TEMPLATE PLAN below for what is done and what is left.

### The film: how to rebuild or re-cut it

Everything is scripted. `npm i ffmpeg-static --no-save` gives ffmpeg without touching package.json.

| step | script | note |
|---|---|---|
| 1 | `scripts/_scratch-stage/film.html` | The stage. ONE film clock, with a deliberate 6.0s to 12.0s hole for the flight, so both sources share a timeline and the fades line up. `__seek(t)` freezes and seeks it. |
| 2 | `node scripts/_scratch-film-stage.mjs` | Renders the stage beats to lossless PNGs at 1920x1080, numbered on the film clock. |
| 3 | `node scripts/_scratch-film-flight.mjs` | Records the galaxy-to-brain flight, **headed**, into the same numbered sequence. ~5 min. |
| 4 | ffmpeg | See the encode command in the commit; master is crf 16 at 1920x1080, web is crf 20 at 1280x720. |

Traps, each of which cost real time:

- **The /ai page cannot be captured headless.** No real GPU, so the page detects no acceleration
  and drops into reduced mode: the galaxy and brain are never drawn. Launch
  `chromium.launch({headless:false, channel:"chrome"})`.
- **Do not try to pin the page's clock.** Virtualising `requestAnimationFrame` and
  `performance.now` to make the scene advance one frame per captured frame trips the /ai page's
  own boot health check, and it falls back to "the real-time 3D experience couldn't start on this
  device". `scripts/_scratch-film-pin.mjs` is the evidence. Capture in real time and keyframe the
  ramp instead.
- **The journey is not linear in `p`.** `scripts/_scratch-film-calib.mjs` measures the settled
  mapping: 0.05 to 0.28 grows the galaxy, 0.28 to 0.40 is the collapse, the brain only resolves
  its labels past 0.55. An even ramp spends four of six seconds on a brain that has stopped
  changing, which is exactly what the old cut did.
- **Strip the /ai furniture with `opacity`, never `display:none`.** `#chapters` is what gives that
  document its scroll height, and scroll is what drives the journey. Hide it and the flight dies.
  The strip list is `#topbar, #totop, #chapters, #brainhint`. Keep the brain's node labels: they
  are drawn on the canvas, and "AI chat assistant" lit on the brain is the whole point of the shot.
- **ffmpeg's `fade` filter blacks out everything OUTSIDE its window.** `fade=t=in:st=6` makes the
  first six seconds black. Use a per-frame brightness expression for fades at interior cut points.
- **The 1080p master is NOT committed.** A 13MB binary three scripts can regenerate does not belong
  in git. Rebuild it for a YouTube upload.

### Hosting: decided, with evidence

**The film stays first-party in `/public`.** The owner asked to consider Vercel Blob first.
Checked: the only Blob store on this project (`realtylt-mls`, 135MB, 281 files) is **SUSPENDED**,
so Blob is not currently a working host and moving the film there would put it behind a disabled
store. Beyond that, the page is not slower today: `preload="none"` with a poster means zero bytes
load until someone presses play, so 4.7MB in `/public` costs a reader nothing and is served by the
same CDN as every other asset, with no third-party script and no cookies. `VideoObject` JSON-LD is
emitted either way, driven by the article's own `film` field so the page cannot advertise a video
it does not serve.

**Revisit when films multiply, not before.** Nineteen topics at ~5MB each is ~95MB of binaries in
git, and THAT is the real argument for moving off-repo. The template already reduces the pressure:
the /ai flight is a shared segment cut once, so only a topic's own demonstration is new footage.

**YouTube is a separate job, and worth doing.** Rebuild the 1080p master and upload it to the
owner's channel for reach. Keep the on-page player first-party regardless, so the page carries no
third-party cookies.

### The one thing the film still needs

A **9:16 cut** for Reels, Shorts and TikTok. At 390px the 16:9 film's body text is ~4px and
unreadable inline; a viewer has to go fullscreen. The stage is authored at a fixed 1920x1080, so a
vertical version means a second layout in `film.html` at 1080x1920 (phone centred, event track
below it instead of beside it) and a second render pass. The recorder and the encode need no
changes.

## EARLIER STATUS (2026-07-26, session 2)

**Live and verified on production** (`realtylt-website.vercel.app/blog/ai-chat-assistant-real-estate-website`),
read by eye at 1440 and 390 DPR3, zero page errors, no horizontal overflow, 0 em dashes, 0 arrow
glyphs, 1 H1 / 9 H2 / 3 JSON-LD blocks intact:

| # | scene | key | state |
|---|---|---|---|
| 1 | Cold open (11:40pm as a lit clock) | hero, `ColdOpen` | DONE |
| 2 | Response gap (two stamps, the cooling line) | `response-gap` | DONE |
| 3 | Leads calculator (interactive) | `leads-calculator` | DONE |
| 4 | Four moves | `four-moves` | DONE |
| 5 | The teardown / watch it handle a real lead | `teardown` | DONE |
| 6 | Where it goes wrong (three failure modes) | `failure-modes` | DONE |
| 7 | Animated flow diagram | — | **DELIBERATELY NOT BUILT** (see below) |
| 8 | The pull quote | `pull-quote` | DONE |
| 9 | The funnel | `funnel` | DONE |
| + | "In short" (skimmable summary) | `in-short` | DONE (added from research) |
| + | Floating table of contents | `FlagshipToc` | DONE |

**The storyboard is complete.** Scene 9 also suppresses the template's generic "Ask us" band on
the flagship, so the piece has one ending rather than two.

**SCENE 7 WAS CUT ON PURPOSE.** The storyboard called for an animated flow diagram
(visitor / chat / MLS / text / CRM / booked). That is exactly the chain the teardown's "what
happened behind it" column already shows. Building it would have been the same content twice
with different graphics. The stretch it was meant to fill is now broken by scene 6 instead.

Verified band order (no two adjacent bands share a background, longest band ~1128px):
cold open (black) / prose / in-short / prose / gap (black) / calc (mist) / prose /
four moves (black) / prose / quote (navy) / teardown (mist) / prose / failure modes (mist) /
prose / funnel (black). Re-measure with `scripts/_scratch-rhythm.mjs`.

## THE FLOATING ToC (owner asked for it, 2026-07-26 session 3)

`components/blog/FlagshipToc.tsx`, rows curated in `content/blog/ai-chat-scenes.ts`
(`FLAGSHIP_TOC`). Ports the service-page rail (tick spine in the left gutter, expands on hover
or focus, pill + bottom sheet below 1360px) and shares scroll-spy / jumps / reduced-motion via
`lib/toc/scroll-spy`. Three things it does that the services rail does not:

1. **It flips contrast with the band underneath it.** The flagship alternates BLACK, NAVY,
   MIST and WHITE full-bleed bands and the rail sits over all of them. Every band is tagged
   `data-band`; scenes get theirs from the scene registry. `useBandTone` finds whichever band
   owns the rail's own vertical position (geometry, not hit-testing, so it is cheap on scroll).
2. **Scenes are real destinations** (`scene-<key>` anchors), ticked slightly heavier so the
   reader can see there is something to LOOK at before jumping.
3. **Rows above the active one are mid-toned**, so the spine shows progress, not just position.

**THE FOCUS-RING TRAP (cost two attempts).** `globals.css` says it outright: its
`:focus-visible` rule is UNLAYERED and Tailwind v4 emits utilities inside `@layer utilities`,
so the global rule beats EVERY `focus-visible:outline-*` utility regardless of specificity.
globals.css handles dark SURFACES with `.bg-ink :focus-visible`, but this rail is
`position:fixed` outside `<article>`, so it is never a descendant and never inherits that fix.
The only thing that wins is an **inline `outlineColor`**, which overrides just the colour and
leaves width/offset to the site-wide rule. River navy is 1.5:1 on ink; white is 21:1.

**THE ARCHITECTURE IS BUILT — read this before adding a scene.**
- `lib/blog/markdown.tsx` treats a standalone `[[scene:key]]` line as a scene slot. Every
  non-flagship render path DROPS the marker, so it can never leak as literal text.
  `hasScenes()` IS the flagship flag (no extra field to keep in sync); `renderFlagshipBands()`
  splits a body into alternating prose / scene bands.
- `components/blog/scenes/registry.tsx` maps key -> component. Unknown key renders nothing.
- Scene COPY lives in `content/blog/ai-chat-scenes.ts`, not in the components. That is the
  shape the other ~19 topics clone.
- Adding a scene = component + one registry line + one marker in the markdown. That is all.

**Two rules learned the hard way (do not relearn these):**
1. **Scenes REPLACE the markdown they stage, they do not decorate it.** Scenes 4 and 8 lifted
   their text out of the body; leaving the markdown in place makes the reader read the same
   sentences twice. The scene probe asserts each staged sentence appears exactly once.
2. **Resting style must BE the final state**; only attach animation under
   `.reveal.is-visible`. Never pair a delay with `animation-fill-mode: both` — it paints the
   `from` state during the delay, so no-JS readers, reduced-motion readers and every static
   screenshot catch an empty frame. That bug ate a pass.

**HARNESS CORRECTION (the previous session's note was wrong, verified on this machine).**
`:3000` is **`wslrelay.exe`** (the WSL CRM port forward), NOT this repo. The realtylt-website
dev server runs on **:3100** and that is correct here, not a mistake. Test via `127.0.0.1:3100`.
Do not "fix" this back to :3000.

**KNOWN ISSUE — local dev server is wedged.** The shared :3100 server (PID owned by the
concurrent session, up since 05:39) started returning HTTP 500 on **every** route mid-session,
after a watched file was deleted. `tsc` and `vitest` are clean, so it is a wedged dev compiler,
not a code fault. I could not restart another session's process. Everything since is verified
against the **Vercel production build** instead, which is authoritative and cannot interfere.
To restore the local loop: `npx kill-port 3100 && npm run dev -- -p 3100`.

**Verification harness** (all gitignored under `scripts/_scratch-*`):
- `scripts/_scratch-scenes.mjs [baseUrl]` — frames EVERY scene at 1440 + 390 DPR3 and probes
  H1/H2/JSON-LD, marker leak, em dashes, arrow glyphs, overflow and duplicate staged text.
- `scripts/_scratch-calc.mjs [baseUrl]` — drives the calculator's controls and asserts the
  result changes (default 16/month, next-day 27, within-minutes correctly 0).
- `scripts/_scratch-rhythm.mjs` — prints every band's height and background colour in order, so
  you can see the light/dark alternation and find the gaps that still need a scene.
- `scripts/_scratch-toc.mjs` — asserts every curated ToC row resolves to a real element (a
  curated list rots silently), that the rail flips contrast over dark vs light bands, that a
  jump lands and sets `aria-current`, and that the mobile pill + sheet work.
- `scripts/_scratch-audit.mjs` — the polish audit: display-type scale across every scene (catches
  a heading that has drifted out of its role), focus-ring colour over dark AND light bands,
  every internal link's status code, mobile tap targets, and whether the ToC pill collides with
  the site chat launcher.
- All default to production. Pass `http://127.0.0.1:3100` once the local server is back.

**CONCURRENT EDITOR — confirmed active this session.** The other session is building the IDX
photo band (`components/idx/MlsImage.tsx`, `lib/idx/photo-band.ts` + its 12 new tests) in this
same working tree. Their work was left unstaged and untouched throughout; every commit here was
staged file-by-file. Run `git status --short` before every `git add` and never `git add -A`.
`npx vitest run` covers both of us, so a green 394/394 also confirms nothing of theirs broke.

**Note on scene 6 ("what it does NOT do"):** the prose section already IS that content and it
is strong. A scene there would duplicate it unless it REPLACES the section (rule 1). Decide
deliberately rather than adding a decorative band.


Written 2026-07-26 by the previous session (Fable→Opus 4.8). This is the complete, self-contained
brief for building the RealtyLT flagship content piece. A fresh agent should be able to execute the
whole thing from this file. Read it fully before touching code.


## TEMPLATE PLAN — turning one great post into ~19

**Goal: a new topic = one content file + a markdown body with markers, and NO new components.**

### Where it stands (2026-07-28)

| step | state |
|---|---|
| 1. Collapse bespoke scenes into primitives | **4 of 9 done.** `Grid`, `Statement`, `Summary`, `Film` exist and cover 6 scenes. 5 bespoke scenes remain. |
| 2. One typed content file per topic | **DONE.** `lib/blog/flagship.ts` holds the shape; `content/blog/ai-chat-scenes.ts` holds this topic's words and exports `AI_CHAT_FLAGSHIP`. |
| 3. Derive the ToC instead of curating it | **DONE.** `parseOutline` + `flagshipToc`. The curated array is deleted. |
| 4. Make the scorecard a gate | **DONE.** `scripts/score-flagship.mjs <slug>`. |
| 5. The per-topic content checklist | **DONE**, and it is executable: it IS the gate's output. |
| 6. The film as a repeatable recipe | **DONE.** See the film section above. Segment A (the /ai flight) is shared across topics; only a topic's own demonstration is new. |

**How it works now.** A `[[scene:key]]` marker resolves against the CURRENT POST's content object
(`Article.flagship`), not a global table. So two topics can both place `[[scene:four-moves]]` and
get their own words, their own column count and their own band. A key with no payload renders
nothing, so a typo in a CRM-published body degrades to a missing scene rather than a broken page.

`kind: "component"` is the honest escape hatch: it names a scene that is not yet a primitive, and
the calculator, whose model is genuinely per-topic and cannot be data. That is what lets the rest
migrate one at a time.

**How to verify a conversion changed nothing.** `node scripts/_scratch-shots.mjs before`, do the
work, `node scripts/_scratch-shots.mjs after`, then `--diff`. It frames all 12 scenes at 1440 and
390 DPR3 and prints SSIM. The harness's own noise floor is about 0.0007 (scenes you did not touch
move by that much), so anything at 0.999+ is unchanged and anything below it is real.

### What is left, in order

1. **`Timeline`** from `ResponseGap` (two stamps, a cooling line, a duration).
2. **`Conversation`** from `Teardown` (turns plus a parallel event track). The film's stage is the
   same idea, so the two should agree on shape.
3. **`Diagram`** from `SystemDiagram` (n labelled nodes on a spine, each with what it connects to).
   Watch the `<title>` trap: ONE text child, or the page throws away its hydrated tree.
4. **`StatBars`** from `ResponseCurve` (caption, n bars, a source, a caveat).
5. **`Calculator` stays bespoke.** Its model is per-topic and is not expressible as data. Give it
   props rather than imports and leave it as a `component`.
6. Then write topic 2 and see what the shape actually gets wrong. Do not build primitives 5 through
   8 speculatively for topics that do not exist yet.

### The original analysis (kept for reference)

Every scene on the page is really an instance of one of these:

| primitive | today's instances | shape |
|---|---|---|
| `Summary` | In short | eyebrow + n one-line claims |
| `StatBars` | Response curve | caption + n bars + source + caveat |
| `Timeline` | Response gap | two stamps + a cooling/building line + duration |
| `Grid` | Four moves, Failure modes | n items (lead + body), 2 or 3 col, dark or light |
| `Conversation` | Teardown | turns + a parallel event track |
| `Diagram` | System diagram | n labelled nodes on a spine, each with what it connects to |
| `Statement` | Pull quote, Funnel close | one held line, optional actions |
| `Film` | Reel | video + poster + caption |
| `Calculator` | Leads calculator | the ONE genuinely per-topic component |

Each takes its content as **props**, not imports. Eight primitives cover every topic.

### Adding a topic, concretely

1. Write the markdown body with `[[scene:key]]` markers where the scenes go. An FAQ-shaped
   section is required for `FAQPage`: its heading must match `FAQ_SECTION_RE` and the questions
   must be `###`.
2. Write the content file next to `content/blog/ai-chat-scenes.ts`, exporting a
   `FlagshipContent`: a payload per marker, a `band` on each, a `label` on the ones that are
   navigation destinations, short `headingLabels` for the prose rows, and the `film`.
3. Set `markdown`, `film` and `flagship` on the post in `content/blog/posts.ts`.
4. Run the gate: `node scripts/score-flagship.mjs <slug> http://127.0.0.1:3100`.

`lib/blog/flagship.test.ts` is the wiring guard: every marker has a payload, every payload is
placed, no short label points at a heading that no longer exists, every scene declares a band.
Copy that describe block for a new topic.

### What a topic must SUPPLY to pass the gate

The gate prints this list and fails on any of it: a cited third-party source · imagery through
the body (2+, all with alt) · an original data graphic or diagram as a real `role="img"` asset ·
a film · FAQPage + BlogPosting + BreadcrumbList + VideoObject schema · a direct-answer summary ·
3+ cluster links · a real freshness signal (visible "Updated" AND `dateModified` later than
`datePublished`) · 1200+ words · 5+ scene anchors · no overflow, no page errors, no em dashes,
no arrow glyphs, no leaked markers.

It deliberately does NOT score A1, A2, A3, B3 or the qualitative half of E2. Those are judgement,
a script cannot judge them, and a script that pretended to would be the build grading its own
homework. A human reads for those.

## THE MISSION (owner's words, distilled)
Turn the **AI Chat Assistant blog post** into the single most valuable, memorable, high-end piece of
content on the site — so generous it builds real trust, so well-designed it can be **chopped into a
video, carousels, and photos for every platform**, and every view funnels the reader back to RealtyLT.
The strategy is **give-give-give**: teach so much, so beautifully, that the reader thinks *"I could
never do this myself — I'll just hire him."* This piece is the TEMPLATE; once it's great, the same
treatment gets cloned for the other ~19 service topics, and the scenes become the storyboard for
short-form video + Instagram/LinkedIn carousels that drive leads.

Owner's emphasis (2026-07-26, verbatim intent): the blog itself does NOT have to carry every
interaction — the real prize is **rich VISUALS, ANIMATIONS, design graphs/graphics, and visual
examples**, "really really high-end, minimalistic Apple-style design," built so parts can be cut into
video and carousels. Interactivity (like the calculator below) is a welcome bonus, not the point. If
we can take the on-page experience up to that level too, do it — but the north star is
**beautiful, teaching, repurposable-into-content**.

## THE TARGET
- Post: **`/blog/ai-chat-assistant-real-estate-website`** — "Your Website Answered That Buyer at
  11:40pm. Did You?"
- Content source: `content/blog/ai-posts.ts` → `AI_CHAT_ASSISTANT_POST` (markdown string). **The
  writing is already excellent** — genuinely valuable, honest, teaches the mechanics, the objections,
  the failure modes. Do NOT rewrite it wholesale; STAGE it. Keep the voice (no em dashes, no arrow
  glyphs — house rule).
- Repo: `C:\Users\Levan\realtylt-website` (Next 15 / TS / Tailwind v4). Branch `main`.

## CURRENT STATE (what renders today)
`/blog/[slug]/page.tsx` renders a **conventional text article**: a dark hero (title + excerpt +
author/date/read-time + share row), one 16:9 cover photo, then the body in a constrained ~44rem
column with a sticky ToC rail on the left, "Keep reading" related cards, and an "Ask us" CTA. The body
comes from a small **safe markdown renderer** (`lib/blog/markdown.tsx`) that emits React nodes (never
HTML) — headings, paragraphs, lists, one pull-quote style, links. **There are zero in-article visuals,
zero interactivity, zero memorable scenes.** That is the entire opportunity.

## THE ARCHITECTURE REALITY + DECISION (important — read before building)
The generic markdown template renders a **narrow text column**. It physically cannot deliver
full-bleed, Apple-minimalist, interactive/animated SCENES. So this post needs a **bespoke flagship
rendering path**. Recommended approach (pick/refine, but this is the clean one):
1. Add a **flagship flag** to the article (e.g. `post.flagship === true` in the content/types) OR
   special-case this slug in `app/blog/[slug]/page.tsx`, so it renders a **bespoke full-width
   composition** instead of the 44rem markdown column.
2. Build a **registry of scene components** (`components/blog/scenes/*`) — each scene a self-contained,
   full-bleed React section. A tiny **embed mechanism** lets scenes interleave with prose: either
   (a) a marker in the markdown (e.g. a line `[[scene:teardown]]`) that `markdown.tsx` maps to a
   registered component, or (b) a hand-authored scene array for this post. (a) scales to all 19 later;
   (b) is faster for one. Recommend (a) for the long game.
3. Keep SEO/structured-data intact (the JSON-LD in the page). Scenes are visual; the crawlable prose
   must still be in the DOM (accessibility + SEO — the whole point of the post is to be quotable by
   search + AI assistants).

## THE STORYBOARD — 9 SCENES (each = a scroll moment + a carousel card + a video beat)
Design language: **Apple-minimalist** — huge whitespace, big confident type, ONE accent (porchlight
azure `#28a8e0`), restrained purposeful motion (scroll-reveal, not confetti), alternating light/dark
full-bleed "scenes." Reuse the visual language already established on the /services pages (see below).
Every scene MUST be screenshot-clean (a carousel slide) and screen-record-clean (a video beat).

1. **Cold open — "11:40pm."** Cinematic near-black, huge type, one glowing phone/clock detail. The
   hook + the carousel cover + the video's first frame.
2. **The response-gap visualizer** (animated) — the 78% stat as "9 hours vs. 8 seconds," an animated
   race/timeline. Signature motion beat.
3. **The leads-lost calculator** (interactive) — ALREADY STARTED, see below. Give + repurposable tool.
4. **"What it actually does" — the 4 moves** as clean animated cards (each = one carousel slide).
5. **The teardown / "watch it handle a real lead"** (the centerpiece) — the real 11:40pm conversation,
   animated: messages appear, MLS search fires, the text goes out, the appointment books. The
   demonstration + the money video segment. This is where the graphics/animation budget goes.
6. **"What it does NOT do"** — the honest, trust-building scene as stark minimalist type.
7. **Animated flow diagram** — visitor → chat → MLS → text → voice → CRM → booked, Apple-style motion.
   (This is literally the /services "how it works" flow, elevated to animation.)
8. **The big pull-quote** — one cinematic full-screen line (carousel/video quote card). The post
   already has the perfect line: "The measure of an AI assistant is not how human it sounds…"
9. **The funnel** — "talk to it live right now" → `/ai#chat` (the REAL assistant) → work-with-me /
   `/services/ai-chat-assistant`.

## WHAT'S ALREADY BUILT (starting assets)
- **`components/blog/LeadsLostCalculator.tsx`** — a polished, self-contained CLIENT component for
  scene 3. Two inputs (monthly inquiries slider + reply-speed buttons) → a big result ("leads you're
  likely losing / month" + $/year), Apple-minimalist, give-give-give (shows results freely, no email
  wall), CTA into /services/ai-chat-assistant. **STATUS: written, NOT wired into any page, NOT
  verified in the browser.** Next agent: wire it via the embed mechanism, verify on phone+PC, and
  adapt its styling into the final scene language. It's a strong start, not sacred — reshape as needed.

## THE DESIGN SYSTEM TO STAY WITHIN (reuse for consistency)
Tokens in `app/globals.css` @theme: `--color-river #102c54` (navy), `--color-porchlight #28a8e0`
(azure accent), ink/paper/mist neutrals, **Lato** everywhere. The previous session established a
coherent "signal" language on the /services/* pages that this flagship should echo: rounded corners
(rounded-xl/2xl/3xl), a low-alpha **porchlight signal-glow** on ink sections (radial-gradient behind
content via `isolate`+`-z-10`), a CSS **live-dot** breathing dot, a **svc-ping** sonar pulse, short
**porchlight signal-lead** accents, hover-lift cards, top-edge **light-catch** on dark panels
(`inset_0_1px_0_rgb(255_255_255/0.07)` in the shadow). All CSS animations collapse under the global
`@media (prefers-reduced-motion: reduce)` block — HONOR IT (this site's a11y standard). No arrow
glyphs, no `///`-style tech garnish (the owner had me strip a `///` this session — he reads that as
AI-generated). Restraint = luxury; the owner rejects anything that looks vibe-coded/AI-generic.

## RENDER + VERIFY HARNESS (gotchas that cost real time — don't relearn them)
- **SAME repo as `/website` → SAME dev-server discipline: ONE Next process per repo.** Two
  servers share one `.next` and serve broken JS chunks, so never run a second.
  `netstat -ano | grep -E ':300[0-9]|:3100'` FIRST and REUSE whatever is already up.
  **The port is :3100, and that is correct** — `:3000` on this machine is `wslrelay.exe` (the
  WSL CRM forward), not this repo, so a Next server cannot have it. Test via
  **127.0.0.1:3100**. (An earlier note in this file claimed :3100 was a mistake and told the
  next agent to move to :3000. That was wrong, verified by process inspection; it has been
  corrected here so nobody burns time on it again.)
- **Playwright IS in realtylt-website** — use `scripts/_scratch-shot.mjs <url> <outbase> [width]`
  (quick shot) and `scripts/_scratch-map.mjs <url> <outbase>` (deep map, 1440+390 + inventory); write
  scratch probes as `scripts/_scratch-*.mjs` (gitignored). Prefix node with
  `export NODE_OPTIONS='--use-system-ca'` (AVG MITM). `MSYS_NO_PATHCONV=1` if a leading-slash URL arg
  gets mangled to `C:/Program Files/Git/...`.
- Full-page captures show sections BLACK/empty because `.reveal` sits at opacity:0 until the scroll
  observer fires → capture with Playwright `reducedMotion: 'reduce'` (the CSS forces reveal content
  visible under reduced-motion). READ every PNG with your own eyes.
- Next dev "Fast Refresh had to perform a full reload" can make `generateStaticParams` routes 404
  until a clean dev-server restart — NOT a code bug (it compiles clean); restart to confirm.

## DEPLOY
Vercel git-linked: push to `main` auto-deploys **production** (`realtylt-website.vercel.app` — the
realtylt.com rebuild, NOT the live realtylt.com yet). Poll `npx vercel inspect <newest>` until Ready,
then verify the prod URL serves the change. **Concurrent editor caution:** another session actively
builds the IDX/listing gallery in this same repo and pushes to `main`. Commit PATH-SCOPED (only your
blog/scene files), check `git status` before each commit, leave their IDX + `docs/services/*.png` QA
artifacts alone. `git pull`/be in sync before pushing.

## GUARDRAILS (owner's standing rules)
Single agent, work to ~700k. Build scene by scene: commit-before → build → render FOREGROUND at 1440
desktop + 390 DPR3 mobile → READ the PNGs → keep only if clearly better → commit-after → deploy
incrementally so the owner checks on Vercel. Apple-minimalist RESTRAINT — the wow comes from craft +
whitespace + one signature per scene, NOT from piling on effects. Phone AND PC must both be perfect.
Verify (don't trust): every scene read with your own eyes on both form factors, zero JS errors,
reduced-motion respected, a11y (crawlable prose stays in the DOM).

## AFTER THE FLAGSHIP (the payoff, for context)
This post becomes: (1) the template cloned to the other ~19 service topics; (2) the storyboard for a
screen-recorded demo VIDEO; (3) carousel decks (each scene = a slide) for IG/LinkedIn; (4) still
photos. All of it funnels to `/services/*`, `/ai#chat` (the live assistant), and work-with-me. That
lead-gen loop — give enormous value everywhere → remind them RealtyLT built it → they reach out — is
the actual goal. Build the flagship so every scene is a ready content asset.

## VIDEO / AVATAR / VISUAL-GENERATION (owner ideas 2026-07-26 — the content-production layer)
The blog scenes above ARE the video storyboard. To produce the actual video + platform content:
- **Talking-avatar presenter (HeyGen / "HyperFrames by HeyGen" MCP).** Owner's idea: a talking
  avatar narrates the piece. Script = the blog's own words (they're already tight). Needs the HeyGen
  MCP authenticated (`mcp__claude_ai_HyperFrames_by_HeyGen__authenticate`) + a chosen avatar/voice.
- **Reuse the LIVE 3D brain as premium B-roll.** `realtylt.com/ai` (repo `realtylt-ai-page`) is a
  real-time Three.js galaxy→brain journey. Screen-record it (the render harness + deep-link stages
  `#p=` / `galaxy|solar|brain|paths` exist in that repo) → instant high-end B-roll for the videos, no
  new production. This ties every video back to the flagship /ai experience.
- **Higgsfield MCP (image/video/animation) — BLOCKED ON CREDITS.** Checked 2026-07-26: account is
  free plan, **0 credits**, so it can't generate anything yet. It IS connected. Owner: top up /
  subscribe, then it can produce the cold-open image, animated graphics, and short video clips. Models
  worth trying once funded: `nano_banana_pro` (4K/text/diagrams — good for the design graphs),
  `soul_2` (editorial/portrait), plus `generate_video` for the animated scene clips.
- **Recipe for one high-end explainer video:** avatar intro → blog scene cards (screen-record the
  scroll) → live 3D brain B-roll → the real chat teardown → CTA. Then chop the scene cards into
  IG/LinkedIn carousels and stills. Every asset does double duty (page + video + carousel).
- **First cheap proof (no credits needed):** screen-record the finished blog scenes + the live 3D
  brain, and cut a 30-60s silent motion reel — proves the "high-end Apple-minimalist content" bar
  before spending on avatar/generation.

## STATUS AT HANDOFF
Service-page design (the prior task) is DONE + deployed (prod, all ~20 /services pages elevated;
the `///` garnish removed). This flagship blog is NET-NEW and barely started: only the plan (this
file) + the unwired `LeadsLostCalculator.tsx` exist. Everything is committed to `main`. Related
memory: `[[project-flagship-blog]]`, `[[project-website-service-pages-design]]`,
`[[design-anti-ai-slop-palette]]`.
