# Round 46, 2026-08-27: the checker's round-45 list, then ten more surfaces

Two parts in one run, one agent, no subagents. Built on `a0a5cb6`.

- **Part 1** closes the fresh checker's PASS WITH CONCERNS on round 45.
- **Part 2** is Beat B batch 2 of the owner's full-text relevance, story, truth and slop pass:
  the next five topics in `content/blog/posts.ts` order, both surfaces each, ten in total.

Eleven topics of twenty-one are now done. Ten remain.

---

## Part 1: the checker's defect list

| # | severity | what it was | what it is now | commit |
| --- | --- | --- | --- | --- |
| 1 | MEDIUM | the custom-automation dek said "eight hundred mornings" | "five hundred mornings", matching the body | `d3e3e5e` |
| 2 | MEDIUM-LOW | ai-scheduling `seo.description` ended "rescheduled without a human" | "rescheduled without a phone call" | `d3e3e5e` |
| 3 | LOW-MEDIUM | the Reflexion footnote implied Huang criticised the 91.0 | scoped to "for its reasoning results rather than its coding ones" | `d3e3e5e` |
| 4 | LOW | `/services/ai-audit` promised a plan in its chip and limits but not in the FAQ | the plan is back in the FAQ | `d3e3e5e` |
| 5 | LOW | "in any of the files this site's copy lives in" overstated the guard | "the files the blog and service copy lives in" | `d3e3e5e` |
| 6 | LOW | three record corrections | all three made, and the first one is recorded rather than quietly swapped | `1551a26` |

### 3. The Reflexion footnote, scoped rather than dropped

Both halves were re-read from the paper today rather than recalled. Huang et al. Table 1 files
Reflexion under *"Use of oracle labels"* for its **reasoning** experiments; Reflexion's own §4.3
argues its programming setup is pass@1 eligible precisely because the tests are self-generated:
*"The task of programming presents a unique opportunity to use more grounded self-evaluation
practices such as self-generated unit test suites. Thus, our Reflexion-based programming task
implementation is eligible for pass@1 accuracy reporting."*

So the clause stays and the sentence stays true, with the scope named. The round L `why` in
`lib/blog/zombie-claims.test.ts`, on the entry named *"the system cannot write or change code"*,
carried the same over-lean ("files Reflexion under 'Use of oracle labels' **for it**") and was
moved in step to "for its reasoning results".

### 6. The three record corrections

- **(a)** The round-45 log quoted *"self-generated unit tests that are used to score generated
  function implementations"* as Reflexion describing itself. It is Reflexion's related-work
  paragraph describing **CodeT**. Replaced with the paper's own words about its own setup. The
  mis-attribution is written into the log rather than swapped out, because a receipt that pointed
  at the wrong sentence is a fact about how that round worked.
- **(b)** `zombie-claims.test.ts:356` corrected to `:374`. **Superseded in round 47:** by then the
  same `why` sat at `:376`, which is what a line-number citation does to itself. Both records now
  name the entry instead, *"the system cannot write or change code"*, which is unique in the file
  and does not move.
- **(c)** The round K docstring said *"seven autonomy forms all red"*. The injection was four under
  round K and four under round L, which is what the round log itself says.

### Left alone, deliberately

The invoicing lede (*"until the money is in your account"*) and the scheduling lede (*"reschedules
on request without a human touching it"*) are owner COPY, escalated in round 45, untouched here.
The scheduling one is visible in this round's own screenshot of `/services/ai-scheduling` at 390.

---

## Part 2: ten surfaces, four axes

The standard is the AI Chat Assistant post. Every citation below was fetched from the primary
source **during this run**, not trusted from a previous round's log.

### Topic 7, data enrichment

**`data-enrichment-real-estate-stale-contact-records` — FIXED.** Two changes. Everything else
passes, including the long FTC section, which is the argument rather than decoration.

1. RELEVANCE. The SHIELD section closed by explaining that the New York Senate's website refuses
   programmatic requests. That is how a fetch failed, which is never the reader's problem. It now
   names what is missing instead: the section rests on the Attorney General's summary rather than
   on the statute text, and it says why that matters here, which is that the whole finding is a
   definition.
2. TRUTH. The decay-rate FAQ compressed the body's own spread ("thirty, twenty two and a half,
   twenty to thirty, and up to seventy for email") into "twenty two to seventy percent for the same
   claim". The seventy is email-only. Now says so.

Re-verified live, all correct as quoted: the FTC 2014 data broker report (December 2012 orders
under §6(b) to nine brokers; practices *"starting January 1, 2010"*; *"obtain most of their data
from other data brokers rather than directly from an original source"*; *"twenty different
sources"*; the raw-versus-derived passage with the boating, *Wired* and Ford examples; *"Only two
of the data brokers allow consumers to correct their personal information for marketing
purposes"*), BLS employee tenure (*"3.9 years in January 2024 ... the lowest since January 2002"*,
Table 1 as described), CCPA 1798.106 and the three 1798.140 thresholds, the NY Attorney General's
SHIELD page, and the HubSpot *Prevent property overwrite* documentation word for word.

**`/services/data-enrichment` — FIXED.** Two changes.

3. `seo.description` sold *"callable profiles"* on a page whose `limits` say *"It does not make a
   list callable in the legal sense"*. Same word, opposite claims. Now "reachable ones", which is
   the word `whatItIs` and the last limit already use.
4. The same decay-rate compression as the post, fixed the same way.

### Topic 8, document processing

**`document-processing-real-estate-contract-deadlines` — FIXED.** Two changes.

5. SLOP. The section on labelling and linking opened *"The same paper measured two harder things"*
   and then, one line later, *"The authors also measured two harder tasks."* The second is gone.
6. TRUTH, upgraded rather than corrected. The post asserted that consummation *"in some states
   falls on a different date"*, which is true and was unattributed. The regulator says it better:
   the official commentary on that definition is headed **State law governs**, and says when the
   obligation is created *"is a matter to be determined under applicable law"*. Quoted now, and it
   makes the section's own point, which is that the meaning of a date lives off the page.

Re-verified live, all correct as quoted: FUNSD (the 199 forms, the RVL-CDIP provenance at *"a low
resolution of around 100 dpi"*, the 25,000 to 3,200 to 199 sampling, and the sentence saying both
harder tasks were scored *"assuming that we know the optimal word grouping, word location, and
textual content"*), DocVQA (50,000 questions, 12,767 images, *"6,071 industry documents"*, 1900 to
2018, *"typewritten, printed, handwritten and born-digital text"*), Regulation Z 1026.19(a)(2) and
(f)(1)(ii), the two definitions of business day at 1026.2(a)(6) including the full paragraph list,
consummation at 1026.2(a)(13), the eleven holidays at 5 U.S.C. 6103(a), and ESIGN 15 U.S.C.
7001(a) and 7001(d).

**`/services/document-processing` — FIXED.** One change.

7. `howItWorks` split the output into "flagged" and *"Everything else is written"*. The page's own
   `limits[0]`, its figure footnote and `faqs[1]` all say a low-confidence value is held back too.
   The step now partitions the way the rest of the page does.

### Topic 9, marketing automation

**`marketing-automation-real-estate-email-deliverability` — FIXED.** Four changes, two of them
misquotes inside quotation marks, which is the class that survives every proofread.

8. TRUTH. The RFC 8058 block quote ended *"until the mail no longer arrives"*. The document says
   *"until the mail no longer appears in the recipient's inbox"*.
9. TRUTH. The quotation before it began *"and that makes the unsubscription process..."* with the
   "and" inside the quotation marks. It is not in the document. The "and" is now ours.
10. TRUTH. Yahoo's spam-rate sentence was quoted with its dash changed to a comma and its second
    half cut with no mark. It now quotes the exact clause and states the rest as ours.
    **Corrected in round 47.** The gloss printed here, *"Yahoo tells senders not to compute this
    figure themselves"*, inverts the page. Yahoo's line, refetched and read verbatim, is *"Spam
    rate is calculated in our system based on mail delivered to the inbox - keep this in mind
    when referencing"*. That is a statement about the DENOMINATOR, and the instruction attached
    to it is to keep the denominator in mind, not to abstain from the figure. Round 47 also moved
    the post's own gloss off *"when calculating the rate in their own system"*, which asserts a
    sender-side calculation Yahoo does not mention, onto the page's own word, referencing.
11. TRUTH. *"Yahoo puts it as a heading"* was a claim about a vendor page's layout that nothing
    here can check. Now "states it in as many words".
12. STORY. The cold open sends a note to fourteen hundred people and five press the button, which
    is 0.36 percent and over the published ceiling, and the section printing that ceiling never
    closed the loop. It does now, in the house form: *"is the market note at the top of this page"*.

Re-verified live, all correct as quoted: CAN-SPAM 7704(a)(3), (a)(4) and (a)(5), the FTC rules at
16 CFR 316.3 (the subject-line test) and 316.5 (the single-web-page rule), Google's sender
guidelines (both list headings, the whole all-senders list including *"Keep spam rates reported in
Postmaster Tools below 0.3%"*, and *"Consider unsubscribing recipients who don't open or read your
messages"*), Yahoo's best practices, and RFCs 7208, 6376, 7489 and 8058. **Checked rather than
assumed:** Google's page contains no figure in days for honouring an opt-out, so the post's claim
that Yahoo spells out two things Google does not stands.

**`/services/marketing-automation` — FIXED.** Two changes.

13. TRUTH. The deliverability step said both providers *"now require"* the whole authentication
    set. Google requires SPF **or** DKIM of every sender, and the DMARC policy and the From
    alignment above five thousand messages a day. Confusing those two lists is the exact error the
    post calls *"the single most misreported thing in this entire subject"*, and our own page was
    making it.
14. TRUTH. A use case ended *"which is the only way the last message before they decide is one of
    yours"*: an absolute plus an unsourced claim about how buyers decide, which is the shape round
    E removed from `why` and from two other use cases on this same page.

### Topic 10, skip tracing

**`skip-tracing-real-estate-legal-owner-phone-numbers` — PASS, untouched,** and it earned it. The
longest post in the set, and nothing on any of the four axes needed changing. The cold open's
question is paid off twice, in audit step 7 and in the close.

Re-verified live, all correct as quoted: the portability definition at 47 CFR 52.21(m), the DPPA
(the personal-information definition at 2725(3), the 2722(a) prohibition, **fourteen** permitted
uses at 2721(b), the licensed-agency loop at 2721(b)(8), the five-year records duty at 2721(c),
and the *"not less than liquidated damages in the amount of $2,500"* private right of action at
2724), the FCRA (1681a(d)(1), 1681b(f), and *"in connection with a business transaction that is
initiated by the consumer"* at 1681b(a)(3)(F)(i)), and the FCC reassigned-numbers order including
the footnote in which the Commission reports that its own 35 million has been challenged and that
it *"received no other credible estimate"*.

The FTC Do Not Call Data Book sentence resolved the hard way and is worth recording. A crude PDF
text extraction returned *"As of September 30, 20\_\_, there were 2\_\_ million active
registrations"* with the digits missing, because they are drawn from a separate font subset. The
glyph codes were decoded from the content stream instead: the year renders as 2024, which pins the
mapping, and the same mapping renders the count as **254**. The post's quote is exact. The FTC's
web page for the same report says *"over 253 million"*, which is the same figure described
differently and is not what the post quotes.

**`/services/skip-tracing-lead-generation` — FIXED.** One change.

15. A use case still said a bought list is one *"that ten other agents also bought"*. Nobody
    counted ten. It is the same claim about what other agents in the county are doing that round E
    removed from `whatItIs` and from two other use cases here, and it survived in this one.

The post's two self-referential claims about this page were checked against the page and are true:
it has a fifth step now, and its legality answer is no longer *"yes, it uses public records"*.

### Topic 11, AI agent workforce

**`ai-agent-workforce-real-estate-assistants` — PASS, untouched.** Every number re-verified:
tau-bench (both domains' statistics, pass^k, gpt-4o at 61.2 with *"pass^8 < 25% in retail"*, the
61.2→56.8 and 33.2→10.8 policy ablation, *"$0.38 / $0.23 per task"*, the *"95.9% / 4.1%"* input to
output split, and the 36 hand-examined failures whose largest group is *"the right type of tool
call(s) but fills in one or more arguments incorrectly"* at about 55 percent), the Berkeley MAST
paper at v3, and every BLS figure (median pay $47,460 and $22.82, the median definition quoted word
for word, real estate sales agents $56,320, all occupations $49,500, 3,453,100 jobs, 0 percent
outlook, minus 12,400).

**One verification gap, recorded rather than papered over.** The two New York provisions could not
be re-fetched: `dos.ny.gov`, `nysenate.gov` and `law.justia.com` all return **403** to a
programmatic request. They are recorded verbatim in `docs/blog-flagship/ROUND-D-LOG.md` from a read
of the Department's own PDF, and the post's paraphrases of RPL 442-c, RPL 440-a and 19 NYCRR 175.21
match those quotes exactly. Verified against the repo's record, not against the source, this round.

**The scene docstring for the failure chart — FIXED, and this is the most useful thing in the
round.** See below.

**`/services/ai-agent-workforce` — FIXED.** One change.

16. `whatItIs` said *"you can only afford so many people. Assistants have neither limit"*. The
    page's own `limits[4]` and `faqs[1]` both say the binding limit is how much output one person
    can read, the figure footnote says it, and the flagship is four thousand words about it. The
    sentence keeps the parallelism and drops the absolute.

---

## The chart this round almost broke

`content/blog/agent-workforce-scenes.ts` draws three bars: System Design Issues 44.2%, Inter-Agent
Misalignment 32.3%, Task Verification 23.5%. Its docstring said they were "read off Figure 1".

They are not printed anywhere in the paper. Searching for "44.2" or "32.3" returns nothing in v1,
v2 **or** v3, all three of which were downloaded and searched. What the paper does print, in the
legend of another figure, is a different split: 41.8 / 36.9 / 21.3. At that point the chart looks
fabricated and the obvious fix is to replace the bars with the legend's numbers.

That fix would have been wrong. The bars are the **sums of the per-mode percentages the v3 prose
states itself**, section by section, and every term is quoted in the paper:

| category | modes as v3 states them | sum |
| --- | --- | --- |
| FC1, system design | 11.8 + 1.5 + 15.7 + 2.80 + 12.4 | **44.20** |
| FC2, inter-agent misalignment | 2.20 + 6.80 + 7.40 + 0.85 + 1.90 + 13.2 | **32.35** |
| FC3, task verification | 6.20 + 8.20 + 9.10 | **23.50** |

Three exact hits and a total of 100.05. The legend that disagrees is the paper disagreeing with
itself, not with us. So the chart is untouched and the docstring now carries the arithmetic and an
explicit warning, because the next checker will run exactly the search this one ran and reach
exactly the wrong conclusion.

The general lesson, and it is the round's: **a derived number cannot be verified by searching for
it.** A provenance note that says "quoted" when the truth is "summed" converts a correct chart into
a defect on the next read.

### Round 47: this section reached the right chart by the wrong route, and both claims above are wrong

The bars survived, and they should have. Everything else in this section did not, and it is worth
writing down rather than swapping out, because the failure was an INSTRUMENT failure of exactly
the kind rounds 45 and 46 kept finding in themselves.

**The values ARE printed in the paper, and they ARE extractable.** Round 47 downloaded the
published v3 PDF from `arxiv.org/pdf/2503.13657v3` and ran `pdftotext` over it. It returns
`44.2%`, `32.3%` and `23.5%` on three consecutive lines, in `-layout`, plain and `-raw` alike.
They are drawn inside Figure 1, whose source file is `figures/taxonomy_neurips_final_10_23_25.pdf`
in the arXiv package and which `02_introduction.tex` includes. The bars are QUOTED. Round 46's
*"They are not printed anywhere in the paper"* and *"searching for 44.2 or 32.3 returns nothing in
v1, v2 or v3, which was checked in all three"* are both false about v3. They are true about v1 and
v2, which carry an older taxonomy figure reading 37.17 / 31.41 / 31.41, and true about the `.tex`
sources in every revision, which is the likely shape of the search that produced them.

**The 41.8 / 36.9 / 21.3 legend is not the paper contradicting itself.** It belongs to
`figures/masft_bar.pdf`, the per-system chart in section 6, and that figure's caption states its
own corpus: *"Distribution of failure in MAD with MAST labels on total 210 traces. This plot
visualizes the failure distributions of the first 30 traces for each system."* 210 traces against
Figure 1's 1,642. Two samples, two splits, no contradiction. Calling it a self-contradiction was
the softest available explanation and it was reached without opening the figure.

**The 100.05.** The correction above is right for the prose sums and worth keeping for that
reason, but it exists only because the prose gives FM-2.4, information withholding, as 0.85% where
Figure 1 prints 0.80%. On the figure's own numbers the three categories total exactly 100.

So round 46's general lesson stands, and a second one sits underneath it. A derived number cannot
be verified by searching for it. And **a number that a search cannot find has not been shown to be
absent** until the search itself has been shown to be able to find it. The docstring in
`content/blog/agent-workforce-scenes.ts` now carries the receipt for the real provenance, with the
sums kept as corroboration rather than as the citation.

## Tried and reverted

- **Rewriting `/services/ai-agent-workforce`'s title and lede** (*"Hire as many assistants as you
  want"*, *"you can run as many as you want, in parallel, around the clock"*). Same shape as the
  `whatItIs` sentence that was fixed, and bounded by `faqs[1]` one field below, but these are /ai
  COPY and round D's own comment on this file records that changing COPY here widens the drift
  with the journey. **Flagged for the owner instead**, alongside the two ledes round 45 flagged.
- **"Correcting" the multi-agent failure chart** to the paper's conflicting figure legend. Prepared
  and abandoned; see above.
- **Concluding that the Reflexion SPF-style quote in the marketing post was a misquote.** A grep
  for *place no restriction on what a sending host can use as the MAIL FROM* returned nothing
  because RFC 7208 puts quotation marks around `"MAIL FROM"` inside its own abstract. The post's
  quote is exact. An instrument error, not a product error, and the second of three this round.

## Gates

| gate | baseline | this round |
| --- | --- | --- |
| `npx tsc --noEmit` | clean | **clean** |
| `npm test` (foreground) | 99 files / 1384 tests | **99 files / 1384 tests, 0 failures** |
| `scripts/toc-align-probe.mjs` | 21/21 | **21/21 posts centred and clear of the launcher** |
| `scripts/score-flagship.mjs` | 17/19, C3 and D5 known-allowed | **17/19 on all five changed posts**, the same two reds on each: no film, and no modified date later than published |
| em dashes in visitor copy | 0 | **0** across all ten changed files with comments stripped, and **0** in the served text of all twelve changed pages |
| renders at 1440 and 390 | n/a | twelve pages, both widths, twice; `scripts/_scratch-r46-shots.mjs` (gitignored), shots in `docs/design-r46/` and `docs/design-r46b/`. **All twelve read by eye**: layout unbroken, pill centred, no overflow |

### The render instrument, again, and one column repaired

Round 45 recorded that this instrument lies and that the way it lies is that failures **move**. It
did it again: run 1 reported 13/24 clean and run 2 reported 17/24, with `post-custom` failing at
both widths in run 1 and passing at both in run 2, `svc-skip` doing the reverse, and `svc-agents`
returning no `<h1>` at all in run 1 and rendering perfectly in run 2. A page defect is
deterministic. This is the dev-server compile race.

Settled positively rather than by elimination, exactly as round 45 did it: all twelve pages were
fetched from the dev server and the **served HTML** checked directly. Twelve of twelve return 200
with an `<h1>`, the right `<h2>` count, no leaked `[[scene:...]]` marker, zero em dashes, and every
one of the eighteen strings edited this round present in the markup.

Two instrument repairs, both from round 45's own honest gaps:

- **The pill column now measures something.** Round 45 guessed the selector `[data-toc-pill]`,
  matched nothing and reported `pillOff=null` on every row. The real one is `[data-toc-trigger]`,
  which is in `scripts/toc-align-probe.mjs`. Every post row now reports **pillOff=0**.
- **The string check reads the DOM, not the rendered box.** The first run reported three edited FAQ
  strings "missing" from pages that were serving them correctly, because a service page's FAQ
  answers sit in a collapsed accordion and `innerText` omits anything not displayed. Reading
  `outerHTML` cleared all three. That was the third instrument error of the round, against zero
  product errors found by the same instrument.

## One finding outside this round's scope

`/blog` serves **one em dash in visitor copy**, in the excerpt of *"Hudson Valley Market Check-In:
What Buyers and Sellers Are Seeing Right Now"* (*"...actually differ this season — and what that
means for your timing."*). It is not in this repo: `lib/blog/db.ts` reads DB-backed posts from
Supabase `public.blog_posts`, which the CRM's Website section publishes into. Nothing here can fix
it, and the rule it breaks is a real one. For the owner.
