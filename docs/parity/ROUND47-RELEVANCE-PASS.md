# Round 47, 2026-08-27: the checker's round-46 list, then five more topics

Two parts in one run, one agent, no subagents. Built on `c72f010`.

- **Part 1** closes the fresh checker's list on round 46, and reverses two of its own findings
  against the primary document.
- **Part 2** is Beat B batch 3 of the owner's full-text relevance, story, truth and slop pass:
  the next five topics in `content/blog/posts.ts` order, both surfaces each, ten in total.

Sixteen topics of twenty-one are now done. Five remain: lead qualification, database
reactivation, AI voice agents, workflow automation, AI chat assistant.

---

## Part 1: the checker's defect list

| # | severity | what it was | what it is now | commit |
| --- | --- | --- | --- | --- |
| 1 | MEDIUM | the MAST docstring defended a correct chart with two wrong arguments | the values are QUOTED from Figure 1 and the receipt is in the docstring; the conflicting legend is a different corpus | `c4c292b` |
| 2 | LOW-MEDIUM | the decay-rate floor read "twenty two and a half" on the post and "about twenty two" on the service page | "twenty to thirty percent" on both, matching the post's own evidence sentence | `c4c292b` |
| 3 | LOW-MEDIUM | the round-L zombie entry cited by a line number that had moved twice | cited by `name` in both records, with the reason written down | `0f304c1` |
| 4 | LOW | ROUND-E-LOG still carried the three misquotes round 46 fixed in the post | all three corrected, and the record says the round-46 checker caught them | `0f304c1` |
| 5 | LOW | eight revised posts carried no revision date | `updated: "2026-08-27"` where the copy actually changed; four correctly still carry none | `c4c292b` |
| 6 | LOW | ROUND46's Yahoo gloss inverted the source | corrected, with the page's verbatim sentence | `0f304c1` |
| 7 | LOW | ROUND46 said the modes total 100 | 100.05, and why | `0f304c1` |
| 8 | INFO | ROUND-D-LOG's 37.17 / 31.41 / 31.41 reported as untraceable in v3 | **VERIFIED in v3**, with the file and the line it renders on | `0f304c1` |

### 1 and 8. The MAST paper, opened rather than searched

Round 46's chart section is the most useful thing in this round because it was wrong twice and
right about the chart both times. The full correction is written into
`docs/parity/ROUND46-RELEVANCE-PASS.md` under *"Round 47: this section reached the right chart by
the wrong route"*, and the short version is:

- The three bar values **are printed in the paper**, in Figure 1, and `pdftotext` on the published
  v3 PDF returns `44.2%`, `32.3%` and `23.5%` on three consecutive lines in `-layout`, plain and
  `-raw` alike. Round 46 wrote *"They are not printed anywhere in the paper"* into the scene
  docstring. The bars are **quoted**, not derived, and the per-mode sums are now corroboration
  rather than the citation.
- The conflicting 41.8 / 36.9 / 21.3 is not the paper contradicting itself. It is
  `figures/masft_bar.pdf`, the per-system chart in section 6, whose caption states its own corpus:
  *"Distribution of failure in MAD with MAST labels on total 210 traces. This plot visualizes the
  failure distributions of the first 30 traces for each system."* 210 traces against Figure 1's
  1,642.
- The 37.17 / 31.41 / 31.41 that round 46 could find no trace of renders at lines 251 to 253 of
  `pdftotext -layout` on the same v3 PDF, drawn inside `figures/arxiv_figure_neurips_cropped.pdf`,
  which `04_methodology.tex:6` includes. It is the split v1 carried, reproduced inside the
  methodology workflow figure. ROUND-D-LOG's sentence about it was right.

The checker's proposed wording for the docstring, *"not present as extractable text"*, was also
tested and is also false: it extracts in every mode. Both the checker's finding and the round it
was checking failed the same way, and the lesson is one sentence: **a number a search cannot find
has not been shown to be absent until the search has been shown able to find it.**

### 5. The `updated` dates, and a correction to the premise

The field is `updated`, not `modified`, and the premise that these posts "still carry modified
08-25/08-26" was wrong in a way worth recording: they carried **none at all**, and
`lib/blog/structured-data.ts:41` falls back to `date`, so `dateModified` equalled `datePublished`.

Eight posts had visitor copy changed on 2026-08-27 by rounds 45 and 46 and now carry
`updated: "2026-08-27"`: custom automation, AI audit, AI clone, invoicing, AI scheduling, data
enrichment, document processing, marketing automation. Four more were added in Part 2 below, for
twelve in total.

Four posts that were read those days deliberately still carry none, and that is the field working:

- **the Singularity**, whose `date` is already 2026-08-27. A `dateModified` equal to
  `datePublished` is not a freshness signal, it is a duplicate.
- **skip tracing**, read in full by round 46 and changed in nothing.
- **AI agent workforce**, where rounds 46 and 47 both changed the scene file's provenance
  docstring, which is a comment, and left the article alone.
- **CRM sync**, read in full this round and changed in nothing.

D5 goes green on all twelve as a consequence rather than as the reason, and every one of them
moves 17/19 to 18/19. The stale phrase *"topics 6 to NN carry none"* is gone from the three
entries that keep the field, because it stopped being true the moment eight of them got one.

---

## Part 2: ten surfaces, four axes

The standard is the AI Chat Assistant post. **Every citation below was fetched from the primary
source during this run**, not trusted from a previous round's log, and the ones that could not be
fetched say so.

### Topic 12, two-way CRM sync

**`crm-sync-real-estate-duplicate-contact-records` — PASS, untouched,** and it earned it on all
four axes. The cold open is Kathy and Katherine and the close is *"Katherine is one person"*.

Re-verified live, all correct: Winkler's Census Bureau overview (the four first-name pairs
*"(Bill, William), (Mr, William), (William, James), or (William, Willam)"*; *"even high quality
files might contain 20+% error in first name pairs and 10+% error in last name pairs among pairs
that are true matches"*; the Zabrinsky against Smith sentence word for word; blocking credited to
*"Newcombe (1962, 1988)"*; the three-part decision rule and *"a priori error bounds on false
matches and false nonmatches"*; *"the no-decision region or clerical review region"*; the 1990
Census *"3000 individuals over 3 months to 200 individuals over 6 weeks"* and the reason the 200
were still needed), the 2010 Census surname file (*"the complete list of 162,253 names"*, Brown at
1,437,026), RFC 9110 (the PUT sentence, the idempotence definition, *"A client SHOULD NOT
automatically retry a request with a non-idempotent method..."*, *"Some clients take a riskier
approach and attempt to guess when an automatic retry is possible"*, and *"lost update"* in
exactly those words), RFC 5789 (*"A new method is necessary to improve interoperability and
prevent errors"* as the second sentence of its introduction; the atomicity MUST; the
more-dangerous-collisions warning), and HubSpot's contacts guide (the upsert `idProperty`
sentence, *"Partial upserts are not supported when using email as the idProperty for contacts"*,
and the additional-emails behaviour after a merge).

**`/services/crm-sync` — FIXED.** Three changes, two of them survivors of round D's own fix in
this same file.

1. TRUTH. `seo.description` still ended *"so the record you are looking at is true"*. That is the
   exact claim round D removed from `why` four fields above, and its comment says why: this page's
   subject is a body of research about how records fail to be true. The retraction reached `why`
   and not the field search engines read.
2. TRUTH. The figure's last node still read *"One record, true in both places, all the time."*
   Same unqualified "true", plus an absolute the flagship contradicts twice.
3. The rewrite of (1) ran to 180 characters against the 170 the content quality gate enforces, and
   `npm test` caught it. Fixed in `90da976`. Recorded rather than quietly folded in, because a
   gate catching the round's own change is the gate working.

### Topic 13, area and GEO pages

**`geo-landing-pages-real-estate-doorway-pages` — FIXED.** One thing, and it is in the legal
section.

4. TRUTH. The post summarised 24 CFR 100.70's second example as *"discouraging the purchase or
   rental of a dwelling by exaggerating drawbacks or failing to inform any person of desirable
   features"*, dropping the clause the prohibition hangs on: **because of race, color, religion,
   sex, handicap, familial status, or national origin**. It then argued from the unqualified
   version that a set of unevenly written pages is itself exposure. It is not. The post already
   carried the nexus correctly in the FIRST example one sentence earlier, which is how it hid.
   Restored in the body and in the fair housing FAQ, and the argument survives it in the stronger
   form: an uneven set is the record a reason gets read off, not the offence.

Re-verified live, all correct: Google's spam policy (doorway abuse defined word for word, the
*"Having multiple domain names or pages targeted at specific regions or cities that funnel users
to one page"* example, scaled content abuse, and **confirmed as the first listed example**
*"Using generative AI tools or other similar tools to generate many pages without adding value for
users"*), the helpful-content self-assessment (*"first-hand expertise and a depth of knowledge (for
example, expertise that comes from having actually used a product or service, or visiting a
place)"*, the two automation warning signs, and *"Are you writing to a particular word count
because you've heard or read that Google has a preferred word count? (No, we don't.)"*), the WWW
2006 spam paper (Ntoulas at UCLA with three Microsoft Research co-authors, the 105 million
collection, *"a uniform random sample, henceforth named DS, of 17,168 pages"*, 2,364 spam at
13.8%, and *"in aggregate, 70% of all sampled pages with a compression ratio of at least 4.0 were
judged to be spam"*), and both CFR sections.

**`/services/geo-landing-pages` — FIXED.** Two changes.

5. The same missing nexus in `faqs[3]`, fixed the same way. A page that overstates a fair housing
   rule is not a safer page.
6. RELEVANCE. The flagship lists five things this does not do and the page carried four. The one
   missing was that these pages do not survive being left alone, which is also the one the lede's
   *"Evergreen pages"* reads against. Added as a sixth limit.

### Topic 14, local SEO

**`local-seo-real-estate-map-pack-google-business-profile` — FIXED.** One modality.

7. TRUTH. *"The boundaries of a profile's overall service area ... should not extend farther than
   about two hours of driving time ... That is generous, and it is also a hard statement."* The
   guidelines' very next sentence is *"For some businesses, larger service areas may be
   appropriate."* Same class as the round-I fix that put *"might"* back into the crm-sync stat.
   Now names the exception and keeps the point.

Everything else verified live and correct, including the sharpest observation in this batch, which
is worth recording because it looks like an error and is not: **Google's ranking page says
"popularity" in its summary sentence and "Prominence" in the heading three lines below.** Both were
read on the live page today. The rest: *"There's no way to request or pay for a better local
ranking on Google. We do our best to keep the search algorithm details confidential to make the
ranking system as fair as possible for everyone"*; the three definitions word for word; **a checked
absence**, that the page names links and reviews under prominence and mentions directory
consistency nowhere; the guidelines' *"about 2 hours of driving time"*, the individual-practitioner
list naming real estate agents, *"Sales associates or lead generation agents for corporations
aren't individual practitioners and aren't eligible for a Business Profile"*, the specialisations
rule, the practitioner-title rule, the virtual-office rule and the co-working conditions; the
Cornell eye-tracking study (*"22 participants were recruited for Phase II of the study and we were
able to record usable eye tracking data for 16 of them"*, *"When asked after their session, none of
the subjects had suspected any manipulation"*, Table 1's 19/1, 5/2 and, in the swapped condition,
10/7, and the trust-bias conclusion sentence); and the eBay experiment (Yahoo! and MSN off with
Google as control, March of 2012, 5.6 percent naive, 99.5 percent retained, the -0.00529
interaction, and *"a ROI of over 4,100% without time and geographic controls, and a ROI of over
1,400% with such controls ... a ROI of -63%"*).

**`/services/local-seo` — FIXED.** Two changes.

8. TRUTH. The ads FAQ said *"the one large field experiment on that"* and named no experiment. A
   superlative about a literature nobody here has surveyed, which is the shape round 45 removed
   from `/services/custom-automation`. It now names eBay's and says what the flagship says about
   what transfers.
9. The same service-area modality as the post: *"capped by Google's own guidelines at roughly two
   hours"* now reads as the guidelines read.

### Topic 15, AI appointment booking

**`ai-appointment-booking-no-shows-real-estate` — FIXED.** One invented fact.

10. TRUTH. The limitation paragraph on the Hangzhou reminder trial said the participants *"had
    already paid for the appointment they were being reminded about"*. The paper does not say that
    anywhere. What it does say is that they made a reservation at a health promotion centre, which
    carries the same caution honestly.

Every number verified live and correct: McMullen and Netland (51,529 appointments over 12 months
at the University of Virginia Eye Clinic, 21.7% and 6.6%, 9.1% and 2.4% at nought to two weeks,
38.3% and 6.9% at six months, and, checked because the abstract does not qualify it, the paper's
body does: *"the no-show rate would be reduced in the resident clinic population by nearly 60% if
all appointments were scheduled 0-2 weeks in advance"*, which is exactly the clinic the post names)
and the Hangzhou RCT (*"A total of 1 859 participants ... randomly assigned into 3 groups"*, 1,848
analysed, four authors at Sir Run Run Shaw Hospital, *"A reminder was sent to both SMS and
telephone groups 72 h prior to the appointment"*, 80.5 / 87.5 / 88.3, SMS against telephone at
P=0.670, and 0.31 against 0.48 Yuan). Also Google's freeBusy reference (*"List of time ranges
during which this calendar should be regarded as busy"*) and RFC 5545's METHOD paragraph verbatim.

**`/services/ai-appointment-booking` — FIXED.** Three changes, all three retractions that missed a
copy.

11. TRUTH. The figure note said the reminder *"is what turns a booking into an attendance"*, stated
    as a certainty, which `limits[0]` denies one screen below and which the trial on this same page
    measures at seven points.
12. TRUTH. A use case read *"The inquiries lost to that friction are lost quietly, which is why
    almost nobody counts them"*. That is the sentence shape round D removed from
    `/services/crm-sync` (*"The deals lost to a stale CRM are lost quietly, which is why nobody
    counts them"*) for asserting a loss nobody measured. The retraction did not reach this page.
13. TRUTH. Another use case ended *"and they had already booked with someone else"*, the narrative
    form of *"Most jobs go to whoever books first"*, which round C removed from `why` and from the
    figure footnote on this page. `why` now says somebody else CAN answer; this one said they did.

### Topic 16, review automation

**`automated-google-review-requests-real-estate` — FIXED.** One reading of a survey.

14. TRUTH. *"only 10% of that panel said they would use nothing below five stars, while 68% said
    four or better was enough"*. BrightLocal reports *"Seven in ten (68%) will only use a business
    with four or more stars"*, which is a floor and not a sufficiency: 31% of them require 4.5 and
    10% require 5. The same figure is rendered correctly further down the post (*"68% of that panel
    wanted four stars or better"*), which is how it survived. Now "put their floor at four", and
    the argument, which rests on the 10%, is untouched.

The post's central move survives verification cleanly and it is the best thing on the page:
**73% appears in the 2026 survey zero times**, which is what the post says. So do the method
(*"conducted using a representative panel of 1,002 US adult consumers via SurveyMonkey"*), the age
split (22 / 25 / 28 / 25 across four bands), 97%, 41% "always", 10%, 68%, *"47% of consumers won't
use a business with fewer than 20 reviews, and only 9% are willing to use one with five or fewer"*
and the 74% recency figure the service page's stat quotes.

**A verification-route note, recorded because the next checker will hit it.** `brightlocal.com`
returns an empty response to a direct programmatic request, with no status line at all. The page
was read through a text-extraction proxy, which returned the live 2026 article with its
2026-02-11 publication time and its full methodology block. Read from the live page, not from the
repo's own record, but not read by a direct fetch either.

Also verified live: Luca's HBS working paper (Yelp against Washington State Department of Revenue
records for Seattle, January 2003 to October 2009, *"there are 3,582 restaurants during the period
of interest. On average, there are 1,587 restaurants open during a quarter"*, *"A one-star increase
is associated with a 5.4% increase in revenue"*, the rounding-to-the-nearest-half-star
discontinuity, *"This paper shows that a one-star increase leads roughly to a 9% increase in
revenue"*, chains unaffected, and the response largest where there are more reviews), Google's
contribution policy (the incentives entry, *"Discourage or prohibit negative reviews, or
selectively solicit positive reviews from customers"*, the on-the-premises and specific-content
prohibitions with both of their own examples, and the permission sentence in full), and 16 CFR
465.7(b) with its whole carve-out list.

**`/services/review-automation` — FIXED.** Two changes, both survivors of round B's rewrite of this
page.

15. TRUTH. A use case read *"Asking every **happy** customer, every time"*. The mechanic round B
    rewrote this entire page for is that everyone is asked whatever they scored, and the lede,
    `whatItIs`, `howItWorks[2]`, the figure footnote and `limits[0]` all now say so. The retraction
    swept five fields and missed the sixth, and the word it missed is the word the page exists to
    remove. Its title, *"The rating that climbs on its own"*, went with it: on this page's own
    argument the rating moves toward the truth rather than upward, which is `limits[4]`'s point.
16. TRUTH. The first step claimed *"the difference between asking today and asking on Friday is
    most of your reviews"*, a magnitude nobody has measured. The flagship makes the same point with
    a mechanism instead.

---

## For the owner: one lede, flagged rather than rewritten

`/services/local-seo`'s lede ends *"so you hold the top of local search instead of paying for every
click"*. That is a position promise, and this page's own `limits[0]` says *"Google's own page says
there is no way to request or pay for a better local ranking, so anybody promising one is selling
something that does not exist"*, and the flagship quotes the same sentence in bold. It is the
sharpest of the flagged ledes so far, because the page does not merely fail to support the claim,
it names the claim as a thing not to trust.

It is `/ai` COPY and rounds 45 and 46 escalated ledes rather than rewriting them, so it is
escalated here alongside the invoicing, scheduling and agent-workforce ones. Worth noting that
round C already diverged this page's `why` from COPY deliberately and documented it, so the
precedent for changing it exists if the owner wants that instead.

Two smaller ones, not escalated, both bounded by their own page a screen below and neither of them
false: `/services/ai-appointment-booking`'s *"so they actually show up"* (against `limits[0]`), and
`/services/geo-landing-pages`'s *"Evergreen pages"*, which the new sixth limit now answers.

## Tried and reverted

- **Rewriting `/services/local-seo`'s lede.** Prepared and abandoned; see above.
- **"Correcting" the MAST docstring to the checker's wording**, *"not present as extractable
  text"*. Tested against the PDF in three extraction modes and abandoned, because they extract in
  all three. The checker was right that round 46's claim was an overreach and wrong about which
  way.
- **Annotating ROUND-D-LOG's 37.17 line as unverified**, which is what the checker's list asked
  for. The numbers are in v3. It is recorded as verified, with the figure file and the line.
- **Changing the post's gloss on the Cornell study's debrief.** *"when asked afterwards"* looked
  like an added procedural detail until the paper turned out to say *"When asked after their
  session"*. An instrument suspicion, not a product error.
- **Softening `/services/review-automation`'s `useCases[3]`** (*"Prospects read the low reviews and
  the replies to them first"*). An unsourced ordering claim about behaviour, and a real one, but it
  is in the same register as the flagship's own advice and changing it would have been manufacturing
  a change on a page that had already given up two real ones. Noted instead.

## Gates

| gate | baseline | this round |
| --- | --- | --- |
| `npx tsc --noEmit` | clean | **clean** |
| `npm test` (foreground) | 99 files / 1384 tests | **99 files / 1384 tests, 0 failures.** It went RED once mid-round, on the round's own change, and the failure is recorded above as item 3 rather than smoothed over |
| `scripts/toc-align-probe.mjs` | 21/21 | **21/21 posts centred and clear of the launcher** |
| `scripts/score-flagship.mjs` | 17/19, C3 and D5 known-allowed | **18/19 on all twelve changed posts.** D5 is now green on every one of them, because `updated` is set and true. C3 stays red on all twelve: none of these topics has a film. The AI Chat Assistant standard-bearer was not touched and scores **19/19**, re-measured this round |
| em dashes in visitor copy | 0 | **0** across all nine changed files with comments stripped, and **0** in the served text of all eighteen changed pages. Arrow glyphs also 0 |
| renders at 1440 and 390 | n/a | eighteen pages, both widths, twice; `scripts/_scratch-r47-shots.mjs` (gitignored), shots in `docs/design-r47/` and `docs/design-r47b/`. Six read by eye: `post-localseo-390`, `post-geo-1440`, `post-booking-390` (r47b), `svc-booking-390`, `svc-geo-390`, `svc-reviews-1440`. Layout unbroken, pill centred, no overflow, and the new Updated line sits correctly in the byline at both widths |

### The render instrument lied again, in the way rounds 45 and 46 both recorded

Run 1 reported 23/36 clean and run 2 reported 23/36 clean, and they were not the same 23. The
failures **moved**: `post-enrich` 390 and `post-booking` 390 failed with no `<h1>` in run 1 and
passed in run 2; `post-custom` 390 and `svc-reviews` 390 did the reverse; `post-clone` 1440 and
`svc-enrich` 1440 flipped too. A page defect is deterministic. This is the dev-server compile race,
re-tested rather than assumed.

Settled positively, as rounds 45 and 46 settled it: all eighteen pages were fetched from the dev
server and the **served HTML** checked directly. Eighteen of eighteen return 200 with an `<h1>`,
the right `<h2>` count, no leaked `[[scene:...]]` marker, zero em dashes, and every one of the
seventeen strings edited this round present in the markup.

**A third instrument error, mine, worth writing down.** That served-HTML check reported `upd=false`
on all twelve posts while Playwright reported `upd=true` on the same pages, and the temptation was
to believe the one that agreed with the change. Neither was believed. The raw markup was opened,
and the answer is that React emits the attribute as `dateTime="2026-08-27"` while the check matched
lowercase `datetime`. Playwright was right because the DOM lowercases attribute names. Re-run
correctly, and against all three surfaces the field is supposed to reach, **12/12 posts carry the
visible `Updated August 27, 2026` line, `"dateModified":"2026-08-27"` in the JSON-LD, and
`article:modified_time` in the meta.**

That is three instrument errors this round against three product errors found by instruments, which
is a better ratio than the 6:1 the memory records and is still not a comfortable one.

## One finding outside this round's scope

`content/blog/posts.ts:476` carries an **en dash** in the visible title of a local guide post:
*"Moving to the Hudson Valley: Rental vs. Buying – What Makes the Most Sense?"*. It predates this
round, it is not one of the twenty-one flagship posts, and the house rule it brushes is a real one.
For a later round or for the owner, along with round 46's finding about the DB-backed excerpt on
`/blog`.
