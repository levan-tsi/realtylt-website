# Round 45, 2026-08-27: the checker's Beat A list, then the relevance pass begins

Two beats in one run, one agent, no subagents.

- **Beat A** closes the fresh checker's PASS WITH CONCERNS on round 44's Singularity work.
- **Beat B batch 1** is the first ten surfaces of the full-text relevance, story, truth and slop
  pass the owner asked for: *"is it what business owners want, and is it sold as a story, no
  hallucination or AI slop"*, on service pages as well as posts. Forty-two surfaces in total.
  This run covers the first five topics in `content/blog/posts.ts` order, skipping the Singularity,
  which Beat A covers.

---

## Beat A: the checker's defect list

| # | severity | what it was | what it is now | commit |
| --- | --- | --- | --- | --- |
| 1 | HIGH | the Reflexion pivot said the code "gets run against a suite of tests, so wrong is a fact that arrives from outside the model" | only the EXECUTION is external, and the post now prints the footnote: Reflexion writes its own tests | `33fae3a` |
| 2 | MEDIUM | "the panel there is the same claim in about forty words" | about eighty. The panel `p` is 77 words, counted | `0b4e896` |
| 3 | MEDIUM-LOW | five sentences still framed our loop as weekly | recast to the cadence-honest form | `a02a7c5` |
| 4 | MEDIUM-LOW | zombie round K did not catch its own name | widened, proved red on four audit forms, green on all 60 files | `b030e33` |
| 5 | MEDIUM-LOW | zombie round L missed three shapes including the FAQ form | widened, proved red on four forms | `b030e33` |
| 6 | LOW | six sentences slightly larger than the truth, plus one docstring misquote | all six fixed; misquote quoted exactly | `03ce56c`, `b030e33` |
| 7 | INFO | first-value timing said day one / first fortnight / from the week it is switched on | LEFT, and why is below | n/a |

### 1. The Reflexion claim, narrowed (HIGH)

The checker was right and the papers say so in their own words. Both were read today rather than
recalled:

- Reflexion (arXiv:2303.11366), §Programming: **"The task of programming presents a unique
  opportunity to use more grounded self-evaluation practices such as self-generated unit test
  suites. Thus, our Reflexion-based programming task implementation is eligible for pass@1
  accuracy reporting. To generate a test suite, we use Chain-of-Thought prompting to produce
  diverse, extensive tests"**, and it criticises competing methods that *"rely upon ground truth
  test cases that invalidate pass@1 eligibility"*. Its abstract offers feedback signals that are
  *"external or internally simulated"*.
  **Corrected in round 46.** This bullet originally quoted *"self-generated unit tests that are
  used to score generated function implementations"* as Reflexion describing itself. The round-45
  checker caught it: that sentence is Reflexion's related-work paragraph describing **CodeT**, not
  Reflexion. The claim the bullet was making survives the correction, because the paper says the
  same thing about itself two sections later in the words now quoted, but the receipt was pointing
  at the wrong sentence and a receipt that does that is not a receipt.
- Huang et al. (arXiv:2310.01798), Table 1, *Summary of issues in previous LLM self-correction
  evaluation*: **"RCI (Kim et al. 2023); Reflexion (Shinn et al. 2023) — Use of oracle labels
  (Section 3)"**.

So the sentence claimed an outside ORACLE where the paper only supports an outside EXECUTION. The
post now says the code gets executed and a run that fails is a fact, then adds a paragraph that
prints the footnote and turns it into the argument it actually is: the agent wrote its own exam,
and the suite in this system is the other kind, human-approved, one test per thing that went wrong
once, and it only ever grows. The 91.0 against 80.1 numbers were verified correct and kept.

The round L `why` in `lib/blog/zombie-claims.test.ts`, on the entry named **"the system cannot
write or change code"**, repeated the wrong framing and was corrected in the same commit.
(This citation carried a line number until round 47. It said `:356`, which round 46 corrected to
`:374`, and by round 47's HEAD the same `why` had moved again, to `:376`. A line number is a
citation that rots every time anything above it is edited, so the entry is named here instead:
`name` is unique in that file, stable across edits, and greppable.)

### 3. The weekly-loop residues

The checker named four. A sweep found a fifth of the same class and it went with them.

| file | was | is |
| --- | --- | --- |
| `content/blog/singularity-scenes.ts` plate caption | a weekly improvement loop is borrowing | an improvement loop is borrowing |
| `content/blog/singularity-scenes.ts` calculator note | the material a weekly loop would have to read | the material the loop would have to read |
| `content/blog/ai-posts.ts` closing step | the thing a weekly loop exists to find | the thing the loop exists to find |
| `content/services/the-singularity.ts` useCases[0] | reads all of them every week | reads all of them |
| `content/blog/ai-posts.ts` small-business FAQ (the fifth) | better than software doing it weekly | better than software doing it on a schedule |

The vendor-facing uses of *every week* stayed: *"a weekly summary of what your agents did is a
reporting feature with an impressive vocabulary"* and *"If every week produces an improvement,
either the system is not honest or the grader is not real"* are the thing being warned about, not
a claim about this loop.

### 4 and 5. The guards, proved both ways

Round K is named *it improves without anybody approving it* and did not match that sentence. It
knew `human`, `person`, `approval`, `supervision`; it did not know `anybody`, `anyone`, *without
your approval*, or *with nobody watching*. Four audit forms, four misses. Round L missed *"It means
the instructions change, not the software"*, which is the third form round 44's own log names and
the one that shipped in the service page FAQ, plus *"does not write or change any software"* and a
`this system` subject.

Both widened. **Red first**: eight forms injected into `content/services/the-singularity.ts`
limits, all eight reported by name and line (four under round L, four under round K), then
reverted. **Green after**: the two patterns swept over all 60 files in `SOURCES` with zero hits.

The green half is the one that mattered here, because the true claim on this topic is *nothing
ships without approval* and it is a live spec chip on both the service page and the /ai panel. A
guard hunting the opposite of that sentence can very easily kill the sentence itself. Round K's
`ships` alternative is therefore anchored on a subject (`it` / `this` / `the system`) and requires
a determiner before `approval`, so *nothing ships without approval* cannot trip it while *It ships
without your approval* does.

### 7. The timing wording, left alone deliberately

`the-singularity.ts:122` says the shared memory changes what a client experiences **on day one**;
`:156` says that on **day one** it is a handful of agents and an empty memory; the post says
**within the first fortnight** and **from the week it is switched on**. These are not in conflict:
the mechanism is live immediately, the client-visible effect accumulates over the first days. No
one-word harmonisation exists that stays true, and inventing one would trade an accurate range for
a tidier sentence. Recorded here for the owner rather than changed.

---

## Beat B batch 1: ten surfaces, four axes

The standard is the AI Chat Assistant post (`ai-chat-assistant-real-estate-website`), read in full
first to calibrate. What it does that the others are measured against: one concrete scene to open,
research used only where it changes what the reader should do, a refusal section that states what
is MISSING from a source rather than how the fetch failed, and roughly three thousand words.

Zero em dashes and zero arrow glyphs across all twelve surfaces read, checked mechanically.

### Topic 1, custom automation

**`custom-automation-real-estate-bespoke-build` — FIXED.** Relevance, story and slop all pass; the
cold open pays off three sections later at *"That is the Tuesday at the top of this page"*, and the
for-building / against-building / FAQ-recap structure is not the redundancy it first looks like.

1. §*The number this page will not print* explained HOW its two sources failed to load, down to
   *"an eight kilobyte shell containing none of the article's text, no occurrence of the word
   maintenance, and no occurrence of the number"*. That is instrument detail serving the citation
   rather than the reader. The calibration post refuses its own number in three sentences by naming
   what is missing, and this post's OWN calculator note already does it at that length, which is
   the tell. Trimmed; both sources and the refusal stay.
2. A stray double blank line under the cold open.

**`/services/custom-automation` — FIXED.** One claim.

3. The FAQ said *"on the largest academic sample of technology projects"*. That superlative about
   the literature is nobody's measurement here. It now names what the flagship's own chart names:
   a sample of 1,471 technology projects worth 241 billion dollars. Same inference, checkable
   premise. (The post's version was already honest, attributing the superlative: *"what they
   describe as the largest academic dataset of its kind"*.)

### Topic 2, AI audit

**`ai-audit-small-business-what-not-to-automate` — FIXED.** One clause. Everything else passes,
including the two dense methodology paragraphs, which earn their place because the argument of the
section is that the confident answers a reader is being given rest on nothing.

4. *"Two researchers at Vrije Universiteit Amsterdam, whose paper carries that affiliation on its
   own byline, did the next best thing"*. The receipt is real and it already lives in
   `docs/blog-flagship/ROUND-H-LOG.md`. In the middle of the argument it is a stumble.

**`/services/ai-audit` — FIXED.** A page contradicting its own limits, which is the exact failure
`SERVICES-CRITIQUE` §2 is about.

5. The FAQ *What do I actually get at the end?* promised *"a ranked list of what to automate and
   what each one is worth"*. Four entries later the same page's limits say *"It does not put a
   price on each candidate ... a number attached to a candidate before anybody has looked at the
   systems is a guess with a decimal point in it"*, and the post's version of the same answer
   claims no valuation. It also omitted the removed-candidates list, which `whatItIs` and the post
   both call the deliverable that separates this from a sales meeting. Now says the four things the
   rest of the surface says.

### Topic 3, AI clone

**`ai-clone-real-estate-agent-video-avatar` — FIXED.** Two things, one of them a date about federal
law.

6. TRUTH. The post said 16 CFR part 461 *"took effect in March 2024"*. Federal Register document
   2024-04335: `publication_date` 2024-03-01, `effective_on` **2024-04-01**. Published in March,
   in force from 1 April. The same error was live in `content/blog/clone-scenes.ts` (*"in force
   since March 2024"*) and both are fixed.
7. RELEVANCE. The §50-f paragraph ran through intestacy rules and a successor's standing to sue
   over a use predating registration. That is lawyer detail inside a section whose own conclusion
   is that a brokerage should not go near this. Cut to what an owner can act on: the right is
   property, there is a public register, forty years, and the damages floor is real. The scene
   version of the same statute was already at that length.

Re-verified while there, because the post asserts it about current law: **16 CFR part 461 today has
exactly three sections** — 461.1 Definitions, 461.2 Impersonation of government prohibited, 461.3
Impersonation of businesses prohibited. No 461.4. Read from the eCFR structure for title 16, and
the only final rule ever to touch part 461 is still the 2024 one. The post's sentence stands.

**`/services/ai-clone` — PASS, untouched.** The licensed-not-owned correction is carried on every
surface of it, and `useCases[2]` refuses the unmeasured reply-rate claim in the copy itself.

### Topic 4, invoicing and payments

**`invoicing-and-payments-real-estate-brokerage` — FIXED.** One arithmetic misreading, the kind
that survives a proofread.

8. It said the 2024 IC3 report records *"$16.6 billion in reported losses, with 256,256 of those
   complaints reporting an actual loss and an average reported loss of $19,372"*. That construction
   hangs the average on the 256,256 subset, which would put the total at $5.0bn rather than
   $16.6bn. The report's own sentence, quoted verbatim in the scene file, is *"256,256 complaints
   reported an actual loss. For complaints, the average reported loss was $19,372"*, and
   19,372 x 859,532 = $16.65bn. The average is across ALL complaints. The post now says which
   denominator it is, because a reader repeating it would otherwise be out by 3.3x.

§*What this article refuses to tell you about your commission* is the strongest relevance move in
the batch and was not touched.

**`/services/invoicing-and-payments` — PASS, with one note for the owner.** The lede carries
*"follows up politely on anything unpaid ... until the money is in your account"*. Read as the
stopping condition of the sequence it is fine; read as a promise of collection it is denied
outright by the same page's `limits[0]` (*"It does not collect a debt"*) and by the post. It is
owner COPY carried verbatim from the `/ai` panel, so it is flagged here rather than rewritten.

### Topic 5, AI scheduling

**`ai-scheduling-real-estate-showing-confirmations` — FIXED.** One citation pointing at the wrong
page of the two it had just named.

9. The paragraph cites `findMeetingTimes` and then the `meetingTimeSuggestion` resource page, and
   then says *"The same page carries a caveat"*. The fine-tuning caveat is on `findMeetingTimes`
   and does not appear on the resource page at all. Now named.

Everything checkable here was re-verified live rather than trusted, since this post's whole
argument rests on primary sources:

| claim | verified against | result |
| --- | --- | --- |
| 178 participants, 1,981 invitees, 1,626 meetings, 15,659 emails | Calendar.help, Table 1 | correct |
| escalations 32 / 27 / 26 percent | Table 3, quoted verbatim in the scene docstring | correct |
| 84% two-party, 15% with three or more, eleven the largest | paper body | correct |
| 39% never reached the expert, and it is NOT "no human touched it" | *"completed entirely within the microtasking workflows of Tiers 1 and 2"* | correct, and the post's careful reading matches the paper's wording |
| eight delivery status codes | RFC 6638 §3.2.9 | correct: 1.0, 1.1, 1.2, then five failure codes |
| the "likelhood" typo, `minimumAttendeePercentage`, the fine-tuning sentence | both Microsoft Graph pages, fetched today | all three still live and worded as quoted |

**`/services/ai-scheduling` — PASS, untouched.** Round G already killed the double-booking absolute
and the page now states both halves of it correctly.

---

## Tried and reverted

- **Cutting the survey-methodology paragraph from the audit post** (§*You are almost certainly not
  behind*: 850,000 firms, answering required by law, two thirds under ten employees, uncorrected
  sample weights, the authors' own note about selection bias in private surveys). Considered as
  research-paper drift and rejected. The section's argument is that the confident answers a reader
  is given rest on nothing checkable, and the methodology IS that argument. Cutting it would leave
  the conclusion standing on the same air the post is criticising.
- **Rewriting two service-page ledes** that overrun their own limits (`invoicing-and-payments`,
  *"until the money is in your account"*; `ai-scheduling`, *"reschedules on request without a human
  touching it"*). Both are owner COPY carried verbatim from `/ai`, both are bounded by the `limits`
  four entries below, and the repo's convention is that a divergence from COPY is a deliberate,
  documented decision rather than a tidy-up. Noted for the owner instead.
- **Harmonising the Singularity first-value timing** (Beat A item 7). No one-word version stays
  true. Left, and recorded.
- **An edit call against `content/blog/singularity-scenes.ts` with a placeholder string** issued by
  mistake mid-run. It failed on a no-match, which is the tool behaving correctly, and nothing was
  written.

## Gates

| gate | baseline | this round |
| --- | --- | --- |
| `npx tsc --noEmit` | clean | **clean** |
| `npm test` (foreground) | 99 files / 1384 tests | **99 files / 1384 tests, 0 failures.** The count is unchanged ON PURPOSE and it is worth saying so rather than quietly reporting a flat number: rounds K and L were WIDENED, not added to, so the coverage went up inside two existing patterns while the case count stayed put. The added coverage was proved by injection instead, eight forms red then reverted |
| `scripts/toc-align-probe.mjs` | 21/21 | **21/21 posts centred and clear of the launcher** |
| `scripts/score-flagship.mjs` on the Singularity | 17/19, reds C3 and D5 known-allowed | **17/19**, same two reds: C3 (this topic has no film) and D5 (no modified date later than published). Both are true statements about the page and both pre-date this round |
| em dashes in visitor copy | 0 | **0**, checked mechanically across all twelve surfaces read AND in the served HTML of all nine changed pages |
| renders at 1440 and 390 | n/a | nine changed pages, `scripts/_scratch-r45-shots.mjs` (gitignored), shots in `docs/design-r45/` and `docs/design-r45b/`, four read by eye |

### The render instrument lied, and the way it lied is worth recording

The first render run reported 10/18 clean, with `SyntaxError: Unexpected end of JSON input`, no `<h1>`
and `h2=0` on several pages. Round 44 saw the same thing and called it a dev compile race. That is a
diagnosis, and a diagnosis carried forward without re-testing is just a story, so it was tested: the
run was repeated unchanged.

**The failures moved.** `post-scheduling` failed at both widths in run 1 and passed at both in run 2.
`svc-singularity` passed at both in run 1 and failed at 1440 in run 2. `post-invoicing` did the same
in reverse. A page defect is deterministic; this is not, so it is the instrument.

Confirmed positively rather than by elimination: every one of the nine pages was fetched from the dev
server and the SERVER HTML checked directly. All nine return 200 with an `<h1>`, the right `<h2>`
count, no leaked `[[scene:...]]` marker and zero em dashes, and every string edited this round is
present in the served markup. Screenshots at both widths were then read by eye for
`post-clone` 390, `post-invoicing` 1440, `post-scheduling` 1440 and `svc-audit` 390: layout intact,
no overflow, the table-of-contents pill centred at the foot of each.

One honest gap in the instrument. `scripts/_scratch-r45-shots.mjs` tries to measure the pill offset
itself and its selector matched nothing, so every row reports `pillOff=null`. Pill centring in this
round is certified by `scripts/toc-align-probe.mjs` at 21/21 and by reading the screenshots, not by
that column.
