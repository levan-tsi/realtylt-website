# The 10-year-old pass: CHECKER report, batch 2 (2026-09-18)

Method: BEFORE = `git show 6eab055:<file>`, AFTER = the working tree (= commit `d8a0aca`, which is
identical to the working tree for everything under `content/`). Each post body was extracted from both
revisions with a local copy of `post-body.mjs`'s locator, split into paragraphs, and aligned by LCS on
exact-equal paragraphs; all five bodies hold their paragraph count exactly (122/122, 105/105, 126/126,
110/110, 99/99), so the alignment is one-to-one and nothing was added, dropped or reordered. Scenes and
service files were read as full `git diff 6eab055` hunks, old line beside new line, every hunk.
`lede`, `why`, `specs` and `seo` on the service pages were skipped by instruction, except for the
keyword sweep and two notes marked ORCHESTRATOR FIELD.

**614 paragraph/string pairs compared in total.** Per-topic counts at the end of each section.

---

## Cross-cutting, before the topics

**1. Scope of the batch-2 commit is clean, and the log's close-out is accurate *against the checkpoint*.**
`git diff --numstat 74f6480 d8a0aca` shows the commit touched only `content/blog/ai-posts.ts`, the five
scenes files, the five service files, `content/blog/posts.ts` (**5 lines, and they are exactly the five
`updated:` values**) and the log. `git diff 74f6480 d8a0aca -- content/services/` contains **zero**
`lede:`, `why:`, `specs:`, `keywords:`, `seo`, `stat`, `eyebrow:` or `title:` lines. The builder did not
touch an orchestrator field.

Read against `6eab055` instead, `posts.ts` also carries a new `seoTitle?` interface field with its own
comment, 21 `seoTitle:` values, rewritten `seoDescription` and `excerpt` strings on all 21 posts, and a
rewritten skip-tracing `/** */` comment. **All of that predates this batch** (it is in the checkpoint
`74f6480`) and batch 1's checker already reported it. Not a batch-2 finding; recorded here only so the
next reader does not double-count it.

**2. Provenance comments: untouched.** A diff of the ten content files filtered to comment lines
(`^[+-]\s*(\*|/\*|//)`) returns **nothing**. Law 10 held.

**3. Mechanical sweep.** Zero em dashes, en dashes or arrow glyphs added to any prose string in the ten
files. Zero hype words (`seamless`, `game-chang*`, `unlock`, `supercharge`, `revolutionar*`,
`effortless`, `cutting-edge`, `leverage`, `robust`, `turnkey`). Two curly apostrophes appear in
`content/services/data-enrichment.ts` `why:` where `6eab055` had straight ones — that is an
**ORCHESTRATOR FIELD** and is logged as a LOW note under DATA ENRICHMENT. The four curly quotes in
`content/services/ai-scheduling.ts` `why:` are pre-existing at `6eab055`; not a regression.

**4. Retired claims: clean.** `callable` appears once in the batch, in
`content/services/data-enrichment.ts` `limits[4]`: "It does not make a list callable in the legal
sense." That is the sentence ABOUT the claim and is allowed; it is byte-identical to `6eab055`.
`verified` appears in that topic's prose twice, in `seo.description` (orchestrator) and inside a
`/** */` comment — neither is visible page prose, and both are unchanged from `6eab055`.

**5. Tests and scorers re-run by me, not taken on trust.**
`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`.
`node scripts/rewrite-invariants.mjs --only <surface>` on all ten surfaces -> **PASS on all ten**, at
x1.00 / x1.00 / x1.00 / x1.00 / x1.00 on the bodies and x1.04 / x1.03 / x1.03 / x1.03 / x1.02 on the
service pages. (The marketing-automation service page now measures x1.04 where the log recorded x1.03;
still far inside the x0.85-x1.25 band.)

**6. Numbers.** A token-level tally of every digit string and every spelled-out number word across each
topic's three files, before against after: **no value, unit or subject changed anywhere.** The only
count differences are punctuation-attached duplicates (`2014,` vs `2014.`) and new number *words* the
builder introduced as counts of items already present. I checked each of those by hand and each one is
correct: "quoted four ways" = 4 figures; "five messages" = 5 listed; "the sensible sequence has five
steps" = 5 listed; "A rule ... has two halves" = 2; "Three things matter" = 3; "Those nine include" =
the same nine.

**7. Hedges, counted.** Occurrences of ` may `, ` might `, ` probably `, ` usually `, ` often ` and
` most ` across each topic's prose, before against after: **flat or up in every topic** (marketing
`most` 12 -> 13, scheduling `may` 4 -> 5, everything else identical). No hedge was lost by attrition.

**8. The batch's one systemic habit: the dropped causal connective.** ` because ` falls from **158 to
110** across the five topics, and ` which ` from **204 to 122**. The `which` drop is the intended
simplification. The 48 lost `because`s are not, and they are this batch's equivalent of batch 1's
governor problem, in a much milder form: the builder split "A, because B" into "A. B." roughly fifty
times. In most of them the reasoning survives on adjacency and a reader loses nothing. The instances
where it does cost something are listed as LOW rows under each topic; the worst are named. This is the
one thing worth telling the next builder, because it is systematic rather than accidental.

**9. Story.** All five cold opens keep their people, their times, their details and their order: the
Tuesday market note to fourteen hundred people, the list of eleven written in twenty minutes, the woman
in her own kitchen three years ago, Kathy/Katherine Brown in March and June, eleven on Saturday. Nothing
reordered, nothing lost. The register holds. The worst damage is a handful of choppy list-like passages,
quoted below as LOW.

**10. Keywords (law 9).** For every one of the five topics, no `keywords` phrase that appeared in the
prose before has fallen to zero after. Counts, prose only, comments and the `keywords` array excluded:
`real estate marketing automation` 3 -> 3, `real estate data enrichment` 1 -> 1, and all remaining
phrases were 0 -> 0 (they have never been in the prose). **Nothing to report under law 9 this batch** —
which is the one thing batch 2 did better than batch 1.

---

## 1. MARKETING AUTOMATION

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **MED** | `content/blog/ai-posts.ts`, `MARKETING_AUTOMATION_POST`, the 15 U.S.C. 7704(a)(3) paragraph | "The message must contain \"a functioning return electronic mail address or other Internet-based mechanism, clearly and conspicuously displayed\" **that a recipient can use to** ask not to receive future messages, and that mechanism must remain \"capable of receiving…\"" | "The message must contain \"a functioning return electronic mail address or other Internet-based mechanism, clearly and conspicuously displayed\". **A recipient uses it to ask not to receive future messages.** That mechanism must remain \"capable of receiving such messages or communications for no less than 30 days after the transmission of the original message\"." | The relative clause is part of the statutory requirement: the statute requires a mechanism a recipient **may use** (7704(a)(3)(A)(i): "that … a recipient may use to submit … a request not to receive future commercial electronic mail messages"). Split off, it becomes a flat assertion about what recipients do, which is not what the law requires and not what happens. Playbook law 3: a shorter sentence may not drop a modal. This is the one place in the batch where a statutory paraphrase lost a word that was doing work. | "The message must contain \"a functioning return electronic mail address or other Internet-based mechanism, clearly and conspicuously displayed\". A recipient can use it to ask not to receive future messages. That mechanism must remain \"capable of receiving such messages or communications for no less than 30 days after the transmission of the original message\"." |
| LOW | `MARKETING_AUTOMATION_POST`, the RFC 8058 section 4 paragraph | "Every extra step between somebody deciding to leave and being gone **is a step during which their alternative is** the button that costs you three tenths of a percent." | "Every extra step between someone deciding to leave and being gone **is a step. During that step,** their alternative is the button that costs you three tenths of a percent." | The split leaves "Every extra step … is a step", which is a tautology and reads as a mistake. The meaning survives but the sentence no longer says anything. | "Every extra step between someone deciding to leave and being gone gives them another option. That option is the button that costs you three tenths of a percent." |
| LOW | `MARKETING_AUTOMATION_POST`, the Postmaster Tools paragraph | "It is also, for a sender without an enterprise deliverability contract, the only **measurement** of their own reputation available to them anywhere" | "For a sender without an enterprise deliverability contract, it is also the only **measure** of their own reputation available to them anywhere." | The page's own argument turns on "measurement": opens and clicks are "a proxy … rather than a measurement of attention" (limits, and `WASTED[2]` in the scenes). This is the one number the page calls a real measurement, and it is now a "measure". The contrast the section is built on is blunted. The builder logged this swap; it is the one instance where it costs something. | "For a sender without an enterprise deliverability contract, it is also the only measurement of their own reputation available to them anywhere." |
| LOW | `MARKETING_AUTOMATION_POST`, the cost paragraph | "it becomes an **archaeology project**, and the honest sequencing is to finish it before writing a single campaign rather than after" | "it becomes **a dig through history**. The honest order is to finish it before writing a single campaign rather than after." | "A dig through history" is a new figure of speech, not a plainer word for the old one, and it reads oddly next to the concrete nouns around it. A ten year old knows "archaeology" from school; if it has to go, go plainer, not sideways. | "it becomes a long dig. The honest order is to finish it before writing a single campaign rather than after." |
| LOW | `content/blog/marketing-automation-scenes.ts`, `WASTED[2]` and the calculator `note` (two instances of one move) | "will show a healthy campaign right up to the point where the mail stops arriving, **because** nothing in it is a measurement of the only thing that matters" / "The headline is the third row rather than the yearly figure, **because** a single send is the unit a person actually decides about **and because** the number is small enough to be startling." | "will show a healthy campaign right up to the point where the mail stops arriving. **Nothing in it is a measurement of the only thing that matters.**" / "The headline is the third row rather than the yearly figure. **A single send is the unit a person actually decides about, and the number is small enough to be startling.**" | Two reasons stop being reasons and become adjacent assertions. Nothing false results; the note simply stops explaining itself, which is what the note is for. Representative of the batch-wide pattern (item 8 above). | "…right up to the point where the mail stops arriving. That is because nothing in it is a measurement of the only thing that matters." / "The headline is the third row rather than the yearly figure. It is there because a single send is the unit a person actually decides about, and because the number is small enough to be startling." |

**Checked and clean:** every CAN-SPAM and 16 CFR fragment in quote marks byte-identical, including the
whole 64-word 16 CFR 316.5 sentence (correctly left long) and both 316.3 clauses — and the 316.3
disjunction was handled exactly right ("deemed commercial **in either of two cases. The first is if…
The second is if…**"), so neither condition can be read as sufficient alone. Google's "Requirements for
all senders" list, the 0.3% line, "Consider unsubscribing recipients who don't open or read your
messages."; Yahoo's "honor unsubscribes within 2 days", "doesn't require users to log in" and "Spam
rate is calculated in our system based on mail delivered to the inbox"; RFC 7208, 6376 and 8058
quotations; the RFC 7489 pull-quote scene untouched; the Englehardt/Han/Narayanan limit sentence
verbatim, with an added "They write:" lead-in that is accurate. The reported-belief opener was handled
correctly and is the model for the batch: "Almost everyone assumes … **They assume** you may not email
someone unless they agreed." Hedges intact: "completely separate judgement", "uniformly innocent",
"in particular", "may not arrive", "roughly a fortnight", "probably do not know", "nobody has published
a figure for that with a method under it", "the majority" -> "most" (same quantity). The added gloss
"The denominator, which is the bottom of the fraction, is not what you sent." is the page's own next
sentence and is plainly true. `preferential treatment` -> `better treatment` was judged and **accepted**:
the verbatim being glossed is "DMARC does not produce or encourage elevated delivery privilege of
authenticated email", and "better treatment" renders "elevated … privilege" without narrowing it.
`proxy` -> `reroute` for image proxying was judged and accepted.

**Verdict:** one statutory modal dropped on a split, which is the only meaning change on the page;
everything reproduced from a statute, a regulation, a vendor page or a paper is byte-identical.

**Compared:** 79 body paragraph units (48 identical, 31 rewritten) + 25 changed strings in
`marketing-automation-scenes.ts` + 21 in-scope changed strings in `marketing-automation.ts` = **125**.

---

## 2. AI AUDIT

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **MED** | `content/blog/audit-scenes.ts`, `DO_NOT[2]` ("Anything whose failure is silent") | "If nothing in the business goes visibly wrong when it fails, then nobody will notice for months, **and the thing you automated has become a thing you believe is happening**." | "If nothing in the business goes visibly wrong when it fails, then nobody will notice for months. **The thing you automated has become a thing you believe is happening.**" | The second clause was inside the "If … then …" condition. Standing alone it is a flat claim about **anything** you automated, which is the opposite of the item's point (the item exists to separate silent failures from visible ones). This is the batch-1 condition-orphan pattern, the only clear instance in batch 2. | "If nothing in the business goes visibly wrong when it fails, then nobody will notice for months. And then the thing you automated has become a thing you believe is happening." |
| LOW | `content/blog/ai-posts.ts`, `AI_AUDIT_POST`, the consequence-question paragraph | "the reason it gets skipped is that it feels **pessimistic** in a conversation that is going well" | "It gets skipped because it feels **gloomy** in a conversation that is going well." | The builder logged this swap. "Pessimistic" names the specific thing the question sounds like — expecting it to fail — which is exactly why it gets skipped in an optimistic conversation. "Gloomy" is a mood, not a stance, and does not carry the reason. | "It gets skipped because it feels like expecting the worst, in a conversation that is going well." |
| LOW | `AI_AUDIT_POST`, the detection paragraph | "Everything anybody builds has a day when it stops working, **usually because** something it depends on changed **and** nobody sent a letter." | "Everything anyone builds has a day when it stops working. **Usually something it depends on changed. Nobody sent a letter.**" | "Usually" governed both halves. After the split the second half is unhedged and reads as a universal ("nobody ever sent a letter"). The intended reading survives on adjacency, but a hedge was dropped from a sentence that had one. | "Everything anyone builds has a day when it stops working. Usually something it depends on changed, and nobody sent a letter." |
| LOW | `AI_AUDIT_POST`, NIST paragraph; `audit-scenes.ts` `DELIVERABLE[2]`, `SUBTRACTIONS[0]`, `WASTED[0]`, the calculator `note`; `AI_AUDIT_POST` audit-cost and FAQ paragraphs (six instances of one move) | "It is still worth ten minutes, **because** it was written by people with nothing to sell" / "**The reason it is an hour rather than a week is that** the questions above are quick" / "Often enough that somebody would notice within a week if it stopped, **because** the frequency of a job is what decides whether its failure ever gets found." | "It is still worth ten minutes. **It was written by people with nothing to sell.**" / "**It is an hour rather than a week. The questions above are quick, and the answers are already in your head.**" / "Often enough that someone would notice within a week if it stopped. **The frequency of a job is what decides whether its failure ever gets found.**" | This topic lost the most causal connectives in the batch (` because ` 42 -> 29). Nothing false results in any of the six, but the page stops showing its reasoning in exactly the places its argument is "here is why". | Restore the connective in the second sentence, e.g. "It is still worth ten minutes. That is because it was written by people with nothing to sell." / "It is an hour rather than a week because the questions above are quick, and the answers are already in your head." / "…if it stopped. That is because the frequency of a job is what decides whether its failure ever gets found." |
| LOW | `content/blog/audit-scenes.ts`, `IN_SHORT[1]` | "found that **while** 90.2 percent of the firms that collect any information at all held some of it digitally, **only** 10.3 percent used even one of the nine advanced business technologies on the list" | "It found that 90.2 percent of the firms that collect any information at all held some of it digitally. **Only 10.3 percent used even one of the nine advanced business technologies on the list.**" | "Only" and "even one" both survive, as the log says, so the contrast is recoverable — but the second sentence also loses "It found that", so a survey finding is now stated in the page's own voice one sentence after the same survey was named. Harmless here because the figure is true and the sentence before names the source; flagged because it is one step from the batch-1 error. | "It found that 90.2 percent of the firms that collect any information at all held some of it digitally. It found that only 10.3 percent used even one of the nine advanced business technologies on the list." |

**Checked and clean:** every NIST passage reproduced word for word — "a determination as to whether the
system achieves its intended purposes and stated objectives and whether its development or deployment
should proceed", "mitigating, transferring, avoiding, or accepting", and the two-part limits sentence,
where the governor was correctly repeated ("**It says** plainly that while it can be used to prioritise
risk, it does not prescribe risk tolerance. **It says** that the level of risk which is acceptable is
highly contextual and specific to the application."). The NIST pull-quote scene untouched. The NBER
authors' "low response rates and significant selection bias" and "uncorrected for sample weights and
should therefore be read as a lower bound" verbatim with "the paper notes" kept. The Oxford "largest
academic dataset of its kind" and the whole VU Amsterdam conclusion verbatim, including "misleading,
one-sided, they pervert the estimation practice, and they result in meaningless figures". Every
percentage, count and dollar figure identical, including "three point three million dollars" left
spelled out. Hedges intact: "almost certainly not behind", "may be larger", "usually", "very often",
"plausible", "It cannot say anything about 2026", "Do not take 17 percent home as your own number",
"nobody can tell you what share of automation projects fail", "a small proportion". The comparison in
the sorting-rule paragraph was split and **did not flip** ("Take a candidate with a modest payback…
**It beats** a candidate with triple the payback…"). The 22-word "Asking three people how something
gets decided, separately, and getting three answers…" sentence was correctly left whole. Word swaps
judged and accepted: obligation/duty, consensus/agreement, criterion/test, symptom/sign,
reconstructed/rebuilt, distributed/spread out (the statistical noun "distribution" survives in both
places that need it), enthusiastic/eager, deliberately/on purpose, arithmetic/sums.

**Verdict:** one condition orphaned in a scene, one qualifier weakened, and the batch's heaviest run of
dropped `because`s. No source text touched, no number touched.

**Compared:** 72 body paragraph units (44 identical, 28 rewritten) + 30 changed strings in
`audit-scenes.ts` + 15 in-scope changed strings in `ai-audit.ts` = **117**.

---

## 3. DATA ENRICHMENT

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **MED** | `content/blog/ai-posts.ts`, `DATA_ENRICHMENT_POST`, the two-guesses paragraph | "So the number in your CRM is the end of a chain of at least two guesses**:** this record is about your person, and this number belongs to that record." | "So the number in your CRM is the end of a chain of at least two guesses**.** **This record is about your person, and this number belongs to that record.**" | The colon made those two clauses the *content of the guesses*. As a standalone sentence the page asserts both of them, one sentence before "Neither guess is shown to you" retroactively withdraws them. This is the batch-1 reported-belief pattern with a colon instead of a reporting verb, and the whole section exists to argue that neither statement is known to be true. | "So the number in your CRM is the end of a chain of at least two guesses. The first is that this record is about your person. The second is that this number belongs to that record." |
| **MED** | `DATA_ENRICHMENT_POST`, the four-disagreement-behaviours passage, the review-queue item | "it is worth knowing that it is the same shape as the clerical review step in the published record-linkage model **that the CRM sync article covers, which exists for exactly this reason**." | "It is also worth knowing that it is the same shape as the clerical review step in the published record-linkage model. **The CRM sync article covers that model, which exists for exactly this reason.**" | The referent of "which exists for exactly this reason" moves from **the clerical review step** to **the model**. The step does exist for exactly this reason (a pair a machine should not settle). The Fellegi-Sunter model does not — it exists to formalise record linkage, as this site's own CRM sync post says. The rewrite makes a small false claim about a named 1969 paper. | "It is also worth knowing that it is the same shape as the clerical review step in the published record-linkage model, which the CRM sync article covers. That step exists for exactly this reason." |
| LOW | `DATA_ENRICHMENT_POST`, the three-shopfronts paragraph | "a label that is a fact about the **transaction** rather than about the record" | "And a label that is a fact about the **deal** rather than about the record." | The builder logged this as a one-instance swap. On a real estate page, "the deal" reads as the property transaction; the sentence means the *sale of the data*. The preceding sentence already supplies the right plain word ("relabelled at the point of sale"). | "And a label that is a fact about the sale rather than about the record." |
| LOW | `content/blog/enrichment-scenes.ts`, `WASTED[0]` | "nothing in the interface **distinguishes** a number a client typed in herself **from** a number a file suggested" | "Nothing in the interface **tells apart** a number a client typed in herself from a number a file suggested." | "Tells apart A from B" is not English; the verb takes "tell A from B" or "tell A and B apart". The same swap in `WHAT_A_FIELD_ASSERTS[0]` ("Nothing in the row tells them apart") is correct, which is what makes this one read as a slip. | "In the interface, a number a client typed in herself looks exactly like a number a file suggested." |
| LOW | `enrichment-scenes.ts` `NOT_THE_NEIGHBOURS[1]`, the calculator `note` (x2), `DATA_ENRICHMENT_POST` provenance-retrofit paragraph, `content/services/data-enrichment.ts` `limits[0]` (five instances of one move) | "is a question you can answer, **because** you can open both" / "There is no figure for how often the appended value turns out to be the correct one, **because** the only person who can measure that is you" / "A record that will not resolve comes back flagged as thin or unreachable, **because** a dead number that looks live costs you more than a blank field." | "is a question you can answer. **You can open both.**" / "There is no figure for how often the appended value turns out to be the correct one. **The only person who can measure that is you, on a couple of hundred of your own records where you already know the answer.**" / "A record that will not resolve comes back flagged as thin or unreachable. **A dead number that looks live costs you more than a blank field.**" | Same batch-wide pattern (` because ` 32 -> 22). Each reason still reads as a reason by adjacency; none is false. | Restore the connective in the second sentence, e.g. "…comes back flagged as thin or unreachable. That is because a dead number that looks live costs you more than a blank field." |
| note | `content/services/data-enrichment.ts` `why:` (ORCHESTRATOR FIELD) | `"You can't work a lead you can't reach. …"` (straight apostrophes) | `"You can’t work a lead you can’t reach. Enrichment means filling the gaps in records you already own. …"` (**U+2019 curly apostrophes**) | Two curly apostrophes where `6eab055` had straight ones, and the only ones anywhere in the batch's prose. Not a meaning change and not the builder's field, but it is a byte difference in a field the /ai byte-sibling audit reads. | Replace the two `’` with `'`. |
| note | `DATA_ENRICHMENT_POST`, limits ("It does not verify a person") | "Our own service page uses the word \"verified\" and this is the sentence that qualifies it." | "Our own service page uses the word \"verified\", and this is the sentence that qualifies it." | **The builder's open item 2, confirmed.** `verified` now appears on `content/services/data-enrichment.ts` only in `seo.description` and inside a `/** */` comment; the visible prose says "Verify what is there" and "validation". Law 1 keeps the body sentence (it is about the claim), but it is no longer literally true of what a reader sees on that page. The orchestrator's call, not the builder's. | Either restore "verified" to a visible string on the service page, or reword the body to "Our own service page uses the word verify, and this is the sentence that qualifies it." |

**Checked and clean:** the FTC pull-quote scene untouched; "obtain most of their data from other data
brokers rather than directly from an original source" and "from twenty different sources" verbatim, with
"The Commission states the consequence plainly" kept as the governor; the raw/derived data quotations and
the whole boating-licence inference example left at 58 words; "only two of the data brokers allow
consumers to correct their personal information for marketing purposes" verbatim; both HubSpot passages
verbatim, including the whole "the import will update the property for new records…" sentence; both
Civil Code 1798.106 quotations and the 63-word 1798.140 threshold sentence untouched; the NY Attorney
General's "any person or business that maintains private information to adopt administrative, technical,
and physical safeguards" verbatim; "press release content distributed by XPR Media" and "were not
involved in the creation of this content" verbatim, and the split correctly re-attributed the second one
("**The same notice says** the paper's editorial staff…"); "3.9 years" intact. The FTC "most of their
data" finding was correctly **not** split — the builder's log says it drafted the split and threw it
away, and the AFTER confirms it. The four-way decay spread keeps every figure and the word
"specifically". Hedges intact: "to a substantial degree", "mostly bought it as well", "probably does not
apply to you", "it is mostly not about the fields enrichment appends", "a checked absence rather than an
omission", "no honest provider quotes a rate before seeing the list", "it would be a mistake to say your
appended phone number is an inference". `indistinguishable from` -> `looks exactly like` was judged in
all three places and **accepted**: each one is about what the CRM shows, which is what "looks exactly
like" says; and the one place the word carries a different load — "Asking someone a question can fail in
a great many ways. From your side they are indistinguishable" in the scheduling post — kept the original
word.

**Verdict:** two real meaning changes, both created by splitting a list away from the word that framed
it. No statute, regulation, report or quotation touched.

**Compared:** 85 body paragraph units (53 identical, 32 rewritten) + 28 changed strings in
`enrichment-scenes.ts` + 18 in-scope changed strings in `data-enrichment.ts` = **131**.

---

## 4. CRM SYNC

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **MED** | `content/blog/ai-posts.ts`, `CRM_SYNC_POST`, the conflict-rule paragraph | "Neither is right. **What matters is that** your rule is written down somewhere you can read it, **that** it was chosen by somebody who understood what each field is for, **and that** you can find out what it is without opening a support ticket." | "Neither is right. **Three things matter. Your rule is written down somewhere you can read it. It was chosen by someone who understood what each field is for. And you can find out what it is without opening a support ticket.**" | "What matters is **that** X" is a requirement. Stripped of "that", the three sentences are declaratives: the page now tells the reader their rule **is** written down, **was** chosen by someone who understood the fields, and **can** be looked up — which is the opposite of what the paragraph before it argues ("the build either contains a decision or it contains an accident"). The same topic's own service page did not make this move: `faqs[3]` still reads "The important part is **that** yours is written down somewhere you can read it." So the two surfaces now disagree about whether this is a description or a requirement, which is the batch-1 LOCAL SEO shape exactly. | "Neither is right. Three things matter. That your rule is written down somewhere you can read it. That it was chosen by someone who understood what each field is for. And that you can find out what it is without opening a support ticket." |
| LOW | `CRM_SYNC_POST`, the replace-vs-patch paragraph | "**If** your sync uses the first one **and** the sending system has an empty box where the receiving system has a mobile number somebody typed in by hand two years ago, the mobile number is gone." | "**Say your sync uses the first one. The sending system has an empty box where the receiving system has a mobile number someone typed in by hand two years ago. The mobile number is gone.**" | Two joint conditions became a supposition plus a flat assertion plus a flat consequence. The "Say …" frame does hold across the three sentences by convention, so this is not the batch-1 error — but it is the exact construction batch 1 named as the failure ("Say the filtering decides…"), and the second condition is no longer grammatically inside the frame. One comma fixes it. | "Say your sync uses the first one, and the sending system has an empty box where the receiving system has a mobile number someone typed in by hand two years ago. The mobile number is gone." |
| LOW | `CRM_SYNC_POST`, the idempotence paragraph and the lost-update paragraph | "**The specification** also says what a careful system does about it" / "**The specification** calls this the lost update problem" | "**The standard** also says what a careful system does about it." / "**The standard** calls this the lost update problem, and names it in exactly those words." | The builder's justification for this swap is that "the page already calls the same document 'the standard' a sentence later". That does not hold for the first instance: the nearest prior "the standard" in the article is two paragraphs earlier, in "**the standard** says it must not be allowed to exist", and it refers to **RFC 5789**, not RFC 9110. After the swap the article uses "the standard" for two different documents a paragraph apart. No reader is likely to misread it (the paragraph opens by naming and linking RFC 9110), but on a page whose whole argument is "go and read the published document", the referent should not wobble. | "The HTTP specification also says what a careful system does about it." / "The HTTP specification calls this the lost update problem, and names it in exactly those words." |
| LOW | `CRM_SYNC_POST`, FAQ "will it merge…" | "The safe default on a first build is **to** automate only the pairs that are not in any doubt, **put** everything else in a review queue, **and widen** it later once you have watched what the queue actually contains." | "The safe default on a first build is to automate only the pairs that are not in any doubt. **Put everything else in a review queue. Widen it later, once you have watched what the queue actually contains.**" | Two of the three parts of a described default become imperatives in the page's own voice. Milder than the batch-1 "recommendation became an order" because the original was already advice, but it is the same move. | "The safe default on a first build is to automate only the pairs that are not in any doubt. It is to put everything else in a review queue. And it is to widen that later, once you have watched what the queue actually contains." |
| LOW | `content/blog/crm-sync-scenes.ts`, `THREE_ANSWERS[0]` | "When this one is wrong you have fused two people, **and somebody opens** a contact expecting one conversation and finds a stranger's in it." | "When this one is wrong you have fused two people. **Someone opens a contact expecting one conversation and finds a stranger's in it.**" | The second clause was inside "When this one is wrong". Alone it reads as something that simply happens. Recoverable from the sentence before, but the condition is gone. | "When this one is wrong you have fused two people. Then someone opens a contact expecting one conversation and finds a stranger's in it." |
| LOW | `crm-sync-scenes.ts` `SURNAMES.note`, `TWO_OF_HER[2]`, the calculator `note`; `CRM_SYNC_POST` identity paragraph, HubSpot-remedy paragraph, "none of that is exotic" paragraph (six instances of one move) | "Surnames are distributed very unevenly by place, **so** a name that is unremarkable nationally can be the only one in a village" / "There is no mistake in either record and no training that would have prevented it, **because** both systems did the correct thing" / "absent from most small business integrations, **because** the cheap way to build a sync is to write the newest thing you have" | "Surnames are spread very unevenly by place. **A name that is unremarkable nationally can be the only one in a village, and truly useful evidence there.**" / "There is no mistake in either record, and no training that would have prevented it. **Both systems did the correct thing with the information they were given.**" / "…absent from most small business integrations. **The cheap way to build a sync is to write the newest thing you have and not ask what was there before.**" | The batch-wide pattern again (` because ` 31 -> 24). The third one is the costliest: the page stated a *cause* of the absence, and now states two unconnected facts. | Restore the connective, e.g. "…absent from most small business integrations. That is because the cheap way to build a sync is to write the newest thing you have and not ask what was there before." |

**Checked and clean:** the whole Fellegi and Sunter decision rule verbatim, including all three branches
and "designate it a possible match and hold it for clerical review"; "no-decision region"; Winkler's
definition of a typographical error ("any difference in the way corresponding fields are written between
two records that are in fact a match") and all four name pairs; the 20 percent / 10 percent sentence
verbatim **with "might" intact** and the sentence that tells the reader to read it; the Zabrinsky/Smith
comparison with "Winkler makes the same point … **He notes that** …"; blocking credited to Newcombe in
1962; 162,253 and 1,437,026; the 1990 Census 3,000-over-3-months and 200-over-6-weeks figures with
"Winkler records" kept as the governor, and the missing-field sentence with "a small proportion" intact;
RFC 9110's PUT sentence, its idempotence definition and its retry guidance; RFC 5789's introduction
wording and the whole atomicity rule ("must apply the entire set of changes atomically and must never
provide a partially modified representation"); "the lost update problem"; the HubSpot upsert,
partial-upsert and merge passages with "**It says that** you can use email or a custom unique identifier
property" keeping the attribution; the `pull-quote` scene untouched. The two repairs the builder logged
are both in the AFTER and both correct: "published a formal mathematical model **for** ideas Newcombe had
introduced ten years earlier" is one sentence again, and "It is the clearest **because** the Census has
the hardest version of this problem in the country" repeats the governor. The joint-condition splits were
handled right in three places ("A rule that works for a lot of small businesses **has two halves**", the
same on the service page, and "You get to pick how often … **You get to pick** how often …"). Hedges
intact: "almost never the product of somebody being sloppy", "probably the same person", "usually in a
band somewhere between ten and forty percent", "no honest build will promise", "usually means the
matching is too confident", "it is quoted here almost exactly as Winkler writes it". The 41-word "What
no honest build will promise…" sentence correctly left long. `immaculate` -> `spotless`, `substitutes
for` -> `makes up for`, `propagates out` -> `goes back out`, `distributed unevenly` -> `spread unevenly`
and `unambiguous` -> `unmistakable` judged and accepted (the last one keeps "that means this and nothing
else" beside it, which carries the load).

**Verdict:** one requirement turned into a description, and the topic's own service page proves it was
avoidable. Everything reproduced from Fellegi-Sunter, Winkler, the Census, the RFCs and HubSpot is
byte-identical.

**Compared:** 72 body paragraph units (44 identical, 28 rewritten) + 24 changed strings in
`crm-sync-scenes.ts` + 19 in-scope changed strings in `crm-sync.ts` = **115**.

---

## 5. AI SCHEDULING

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **MED** | `content/blog/scheduling-scenes.ts` `IN_SHORT[2]` **and** `content/services/ai-scheduling.ts` `faqs[3]` (the same move, twice) | "The standard that governs how calendar servers do scheduling **requires that** when the start time changes, every attendee's answer is thrown away and set back to unanswered." / "The standard that governs how calendar servers do scheduling **requires that** a change to the start time, end time or duration resets every attendee's status to unanswered, **because** the agreement was to a particular time." | "The standard that governs how calendar servers do scheduling **has a rule about this.** When the start time changes, every attendee's answer is thrown away and set back to unanswered." / "The standard that governs how calendar servers do scheduling **has a rule about this.** A change to the start time, end time or duration resets every attendee's status to unanswered. That is because the agreement was to a particular time." | The normative verb is gone from both surfaces. RFC 6638 section 3.2.8 **requires** this of a server; "has a rule about this" could be advisory, and the sentence that follows now reads as a plain description of what always happens rather than as what the standard mandates. The article's whole argument rests on the requirement, and the body says so in the very next breath — "Section 3.2.8 sets out what a server has to do when the appointment moves. **It is not a suggestion.**" The post body also kept the verb: "The specification that governs how calendar servers do scheduling **requires that** any change to the start time, end time or duration resets every attendee's participation status to needs action." So the summary card and the service FAQ now understate what the post body asserts, about the same section of the same RFC. The scenes file's own provenance comment says these three lines must each be "checkable by somebody else in the primary document". | `IN_SHORT[2]`: "The standard that governs how calendar servers do scheduling requires this. When the start time changes, every attendee's answer is thrown away and set back to unanswered." / `faqs[3]`: "The standard that governs how calendar servers do scheduling requires it. A change to the start time, end time or duration resets every attendee's status to unanswered. That is because the agreement was to a particular time." |
| LOW | `content/blog/ai-posts.ts`, `AI_SCHEDULING_POST`, the end of the "two versions of this business" section | "It is the agreement you do not have yet, **and the whole argument is that** a business which does not track those separately from the ones it does have will eventually tell a client something that is not true." | "It is the agreement you do not have yet. **And the whole argument is simple.** A business which does not track those separately from the ones it does have will eventually tell a client something that is not true." | The governor survives in substance, but "is simple" is a new evaluative claim added to fill the split, of the same family as batch 1's "The paragraph is short". The article never says its argument is simple, and the paragraph before it has just said the difference "is not a matter of degree". | "It is the agreement you do not have yet. And here is the whole argument. A business which does not track those separately from the ones it does have will eventually tell a client something that is not true." |
| LOW | `AI_SCHEDULING_POST`, FAQ "what is AI scheduling" | "The intelligent part is narrow**:** understanding a request that arrives as three lines of lower case text, **and** keeping one negotiation straight across several threads at once." | "The intelligent part is narrow. **It is understanding a request that arrives as three lines of lower case text. It is keeping one negotiation straight across several threads at once.**" | Two halves joined by "and" became two competing definitions: each sentence says the intelligent part **is** one thing, so the second reads as a correction of the first rather than as the other half. One word fixes it. | "The intelligent part is narrow. It is understanding a request that arrives as three lines of lower case text. And it is keeping one negotiation straight across several threads at once." |
| LOW | `AI_SCHEDULING_POST`, six FAQ and body paragraphs (one move) | "worth knowing by name, **because** it describes what the listing agent in the opening story was actually doing" / "It cannot stop the listing side promising the same two o'clock to somebody else, **because** it has no visibility of their diary" / "whether the product has anywhere to put an answer that is not a decision, **because** that answer is going to arrive constantly" | "worth knowing by name. **It describes what the listing agent in the opening story was actually doing.**" / "It cannot stop the listing side promising the same two o'clock to someone else. **It has no visibility of their diary and no authority over it.**" / "…anywhere to put an answer that is not a decision. **That answer is going to arrive constantly.**" | The batch-wide pattern (` because ` 27 -> 20). The second is the one worth fixing: the service page's version of the same answer **kept** the connective ("It cannot see or control another office's diary. **So** if a listing agent promises the same slot to somebody else…"), so the two surfaces explain the same limit differently. | "It cannot stop the listing side promising the same two o'clock to someone else. That is because it has no visibility of their diary and no authority over it." |

**Checked and clean:** the RFC 6638 pull-quote scene untouched; the RFC 5546 section 2.1.1 sentence and
NEEDS-ACTION; the COUNTER description verbatim ("used by an attendee to negotiate a change, giving the
request to change a proposed event time as the example"); the eight delivery-status codes and the
"has no explicit information about whether it was delivered" wording verbatim, with "**It then says, in
as many words,**" keeping the attribution; the Microsoft Graph wording including "likelhood" and the note
that it is "spelled exactly like that on the page", plus "minimumAttendeePercentage" and the
fine-tuning caveat with "**It says that**" kept; the Cranshaw `sourceText` lines untouched; 178 / 1,981 /
1,626 / 15,659, 32 / 27 / 26 percent, 84 / 15 / eleven, 39 and 61 percent, 14% / 8% / 7% / 2% all
intact. The 36-word joint-condition sentence at the heart of the article was correctly left whole ("If
the start time, the end time or the duration of an appointment changes, every attendee's answer is
deleted and set back to unanswered, on every affected occurrence, and it applies to everyone except the
organiser."), and the builder's logged repair held: "It is entirely recoverable **by saying**, on
Thursday, that you are waiting on the listing side." remains one sentence. The comparison in
`WHO_AGREES[2]` was split without flipping ("A code that works between ten and four is a constraint on
the appointment. **It constrains it exactly as much as** a seller who works from home does."). Hedges
intact: "which the authors are careful to say includes small pieces of work done by non-expert people",
"a snapshot of one system at one point in its life, rather than a ceiling", "nobody has run anything
like this on property appointments", "it may or may not be", "identical inputs may produce different
results over time", "it is not a forecast for your Saturdays", "an escalation means a trained person
picked it up, not that the meeting failed". The `replied` -> `answered` change in `IN_SHORT[0]` is the
flagship-test fix the log describes, the body keeps the paper's own word, and the `sourceText` is
untouched. The two new counts are correct ("five messages" = the five listed; "Four of them take the
time" = the four listed).

**Verdict:** one normative verb dropped from a statement about what an internet standard requires, in
two places, leaving the summary card and the service FAQ weaker than the post body on the same clause.
Everything else on the page is intact, including the long conjunction the whole argument rests on.

**Compared:** 72 body paragraph units (43 identical, 29 rewritten) + 31 changed strings in
`scheduling-scenes.ts` + 23 in-scope changed strings in `ai-scheduling.ts` = **126**.

---

## Tally

| topic | HIGH | MED | LOW | notes | pairs compared |
|---|---|---|---|---|---|
| MARKETING AUTOMATION | 0 | 1 | 4 | 0 | 125 |
| AI AUDIT | 0 | 1 | 4 | 0 | 117 |
| DATA ENRICHMENT | 0 | 2 | 3 | 2 | 131 |
| CRM SYNC | 0 | 1 | 5 | 0 | 115 |
| AI SCHEDULING | 0 | 1 | 3 | 0 | 126 |
| **total** | **0** | **6** | **19** | **2** | **614** |

## What I could not check

- **Rendered output.** I did not start a server or drive a browser, so this report is about the source
  strings, not about what the pages look like at 1440 or 390.
- **`lede`, `why`, `specs` and `seo` on all five service pages.** Out of scope by instruction. I read
  them only far enough to run the keyword sweep (clean, item 10) and the retired-claim sweep (clean,
  item 4), and to record the two notes under DATA ENRICHMENT.
- **Nothing else.** Every primary source this batch reproduces is either quoted in the file, mirrored in
  a `/** */` provenance comment, or stated with enough of its own register to be checked against the
  BEFORE line beside it. There is no batch-2 equivalent of batch 1's unresolved DFDC wording.

## One pattern worth naming for the next batch

Batch 1's lesson was **never split a clause away from its governor**, and the builder followed it: every
reported belief, joint condition, comparison and recommendation I checked either stayed in one sentence
or repeated its governor, and the log's three self-caught repairs are real and present in the AFTER.
Batch 2's residue is the softer cousin of that rule: **the connective is a governor too.** Across the
five topics ` because ` fell from 158 to 110. Nothing false came out of it, but the pages explain
themselves less than they did, and three of the six MED findings are the same shape one level up — a
colon, a "that", or a normative verb that was holding a list or a requirement together, removed on a
split.

The rule that would have caught all six: **before you split at a colon, a "that", or a modal, ask what
the first half was doing to the second half.** If the first half was introducing a list ("a chain of at
least two guesses:"), stating a requirement ("What matters is that…", "The standard requires that…"), or
supplying a modal ("a mechanism a recipient can use"), the second half is not a sentence yet. Either
keep one sentence, or open the second one with the word the first one was lending it: "The first is
that…", "That is because…", "It requires…", "can use it to…".
