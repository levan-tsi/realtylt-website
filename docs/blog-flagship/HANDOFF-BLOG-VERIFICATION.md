# HANDOFF — verify all twenty blog posts before launch

**The owner's ask, 2026-08-26, verbatim in substance:** check that every blog we built is
*genuinely relevant*, that the *information is true*, that the *design and text meet the AI Chat
Assistant standard*, that *links and things work*, and specifically — **"make sure the numbers are
correct from proper sources, because it was supposed to do deep research and brainstorm on those
first, and I am not sure it did."**

That last clause is the brief. This is not another polish pass. **You are testing whether the
research actually happened**, on twenty posts written across eight rounds in two days.

---

## Why this is worth a full round, stated honestly

Each build round verified itself, and an orchestrator verified each round. A fresh-eyes checker
then audited the lot. Between them they found — **in already-verified work**:

- three fabricated street addresses with invented owner names, live on the page about finding
  who lives at an address
- an invented person with an invented "verified" phone number on the enrichment page
- three invented hours-per-week figures inside our own audit illustration
- three dates and an origin story written from memory
- a citation quoted from the **wrong subdivision** of the right statute
- a source **misread** (a paper's "60% scored at or better than a coin flip" written up as "most
  scored around guessing")
- 24 of 36 photograph descriptions that stated something the photograph does not show
- a caption saying "two million **people**" where the source counts **2,085,133 complaints** —
  contradicting that article's own prose three paragraphs above

**Every one was found by a human-style read, not by a gate.** The checker sampled 17 citations,
found 1 wrong, and said plainly that a 6% miss rate implies roughly **five more** among the other
89. Round I then read 15 more and found zero. So the true rate is somewhere between those two
results and **nobody has read them all**. That is the gap this round closes.

---

## THE PRIMARY JOB: every number, every source, on all twenty posts

There are ~89 distinct external citations. All resolve (verified). Nobody has checked that **the
sentence the post attributes to a source is actually in that source**.

For **every** cited figure, on **every** post:

1. Open the primary document and find the **operative sentence**. Not a summary, not an abstract,
   not a secondary article. If it is a PDF, `pdftotext` without `-layout` (two-column papers
   scramble with it).
2. Check the number, the units, the population, the year, **and the subdivision or table it comes
   from**. Round I's one defect was a correct conclusion sourced to the wrong subdivision of the
   right statute — the kind of error that only appears if you read the actual clause.
3. Check the post's sentence says what the source says. Watch for softening and hardening: an
   "up to" that became a "typically", a "may" that became a "does", a study's own definition
   swapped for a looser one (the HBR study defines its outcome as "a meaningful conversation with
   a key decision maker", and three of our surfaces had shortened that to "reach a decision
   maker").
4. Check the number is *relevant* to the claim it supports, not merely true. A real figure about
   a different population is still a wrong citation.
5. **Quote the operative sentence in your log for every check**, passed or failed. A check with no
   quote behind it did not happen.

Where a post **refuses** a figure (several do, deliberately), verify the refusal's stated REASON.
Two rounds asserted reasons for refusing that turned out to be false when followed
("every published figure traces to a vendor" — unfollowed; "vendor pricing always renders in
JavaScript" — simply untrue). **A refusal resting on a wrong reason is the same defect as a claim
resting on a wrong source.**

## SECOND JOB: relevance and whether the research is real

For each post, answer in the log, in one paragraph each:

- **Would somebody searching for this service find this post answers their actual question?**
  Not "is it good writing" — is it the thing they came for?
- **Does it show evidence of real research**, or is it fluent prose around a thin centre? The tell
  is specificity: a named study with a stated sample beats an adjective every time.
- **Is anything in it obsolete or wrong for 2026?** Statutes get amended, vendor docs get
  rewritten, survey years roll over.
- **Does it contradict any other page on the estate?** The single most repeated defect in this
  whole body of work was one surface disagreeing with another.

## THIRD JOB: the AI Chat Assistant standard, applied to the other nineteen

That post is the design benchmark by the owner's instruction. Open it, then open each of the other
nineteen beside it, at **1440 and at 390 DPR3**, and judge:

- scene rhythm and whether any stretch reads as a wall of text
- whether every scene earns its band (a photograph that is decoration does not deserve one)
- typography, spacing, and the light/dark band alternation
- the calculator: does it open on something sensible, is every assumption visible, does it refuse
  the number it says it refuses
- the ToC, the "In short" block, the ending
- **mobile specifically** — the plate crop is 16:9 on a phone and 21:9 on a laptop, so a phone
  shows MORE of each photograph, not less

Score each post against the chat post and **rank them**. Name the weakest three and say exactly
what would fix them. A ranking with no bottom three is not a ranking.

## FOURTH JOB: links and mechanics

- Every internal link on every post resolves (blog to service, service to blog, cluster links,
  ToC anchors, the "keep reading" block).
- No post recommends itself; consumer posts do not recommend the B2B cohort.
- Zero horizontal overflow at **320, 390, 1440**.
- Zero console errors. **One `SyntaxError` was seen once in ten observations on
  `/services/ai-chat-assistant` and never reproduced** — every inline script, JSON-LD block and
  same-origin script parsed clean. Watch for it; if you catch it, capture the stack.
- Calculator sliders grab at every offset (they were a 4px target until Round I made them 44).
- JSON-LD on every post is valid and its numbers agree with the visible page.

---

## RAILS
Repo `C:\Users\Levan\realtylt-website`, branch `main`. Pathspec commits, never `git add -A`.
**Do NOT push** — the orchestrator verifies and pushes. `export NODE_OPTIONS='--use-system-ca'`.
Reuse the `:3100` dev server, never start a second. Intercept `**/api/lead` in every probe — it
posts to the live CRM. No MLS/DATA-API/`media.mlsgrid.com` calls anywhere. No films, HeyGen or
avatar work. Do not touch `next.config.ts`, CSP, security, RLS or `lib/idx/**`.

**Verify per-item facts in a real browser, not by curl-grep.** Flickr serves curl a JS shell with
no licence in it; `bls.gov` and `dos.ny.gov` block browser-like agents but answer a plain one;
`nysenate.gov` returns 200 to a DEFAULT curl agent and 403 to anything browser-like; EUR-Lex
serves a JS shell. **Prove every instrument against a known-good AND a known-bad before believing
it** — an orchestrator's own link checker once reported all 89 citations dead when the checker was
what was broken.

**Fix what is unambiguous; report what needs judgement.** A wrong number, a dead link, a
mis-stated subdivision: fix it, in a labelled commit. Anything where fixing means deciding what it
should say instead: report it. Never re-baseline a red gate. Never invent a number, a fact, a
reason or a specific — this round exists because earlier rounds did.

## GATES
`npx tsc --noEmit` · `npm test` (baseline **1333**, only goes up) ·
`node scripts/flagship-standard.mjs http://localhost:3100` (all 20 green) ·
`node scripts/check-svg-crop.mjs http://localhost:3100` · `node scripts/score-flagship.mjs <slug>
http://localhost:3100` on anything touched. **Do not ratchet `standard.json`** — the decision is
recorded in ROLLOUT-PLAN.md.

## DELIVERABLE
`docs/blog-flagship/BLOG-VERIFICATION-REPORT.md`, committed:

- a **table of all ~89 citations**: post, claim, source, operative sentence quoted, verdict
- the relevance paragraph per post
- the design ranking, with the weakest three named and what fixes them
- the link and mechanics results
- **what you looked for and did NOT find** — a clean bill on a specific hunt is a real result and
  stops the next agent repeating it
- an honest verdict: **is this launch-ready**, and the strongest argument against your own verdict

Final message: compact honest report, worst finding first.
