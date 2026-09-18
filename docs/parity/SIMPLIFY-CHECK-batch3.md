# The 10-year-old pass: CHECKER report, batch 3 (2026-09-18)

Method: BEFORE = `git show 6eab055:<file>`, AFTER = the working tree (= commit `561b44e`, identical to
the working tree for everything under `content/`). Each of the five post bodies was extracted from both
revisions with a local copy of `post-body.mjs`'s locator, split on blank lines and aligned by LCS on
exact-equal paragraphs. **All five bodies hold their paragraph count exactly** (109/109, 134/134,
113/113, 120/120, 97/97) and every change block aligns one-to-one, so nothing was added, dropped or
reordered. The ten scenes and service files were read as full `git diff 6eab055` hunks, old line beside
new line, every hunk. `lede`, `why`, `specs` and `seo` on the service pages were skipped by instruction,
except for the keyword sweep and the notes marked ORCHESTRATOR FIELD.

**573 body paragraph pairs and 208 changed strings compared in total.** Per-topic counts at the end of
each section.

Mechanical checks I ran myself rather than taking from the log:

| check | result |
|---|---|
| Keyword phrases from all five `keywords` arrays, present in BEFORE prose | **0 lost**; no `keywords` array changed |
| Every number token in body + scenes + service, BEFORE vs AFTER | **0 lost, 0 invented**, all five topics |
| 31 verbatim source fragments (ESIGN, 12 CFR 1026.2/.19, 442-c, 440-a, 175.21, BLS, pass^k, CACE, config debt, Microsoft, semver, Stripe, Google Cloud 1.4(e), FUNSD, DocVQA) | **all survive byte-identical** |
| Em dashes / en dashes / arrow glyphs in the ten files and five bodies | none, and the 36 em dashes in the files are all inside `/** */` headers, unchanged |
| Hype list (`seamless`, `game-chang*`, `unlock`, `supercharge`, `revolutionar*`, `effortless`, `cutting-edge`, `turnkey`) | **0 in AFTER**; one pre-existing `unlock` removed |
| Retired claims: `verified`, `callable` | 0 occurrences |
| `npx vitest run lib/blog/zombie-claims.test.ts lib/blog/flagship.test.ts` | **PASS (284) FAIL (0)**, run in the foreground |
| Singularity gate vocabulary, BEFORE vs AFTER body | `approv` 13/13 · `a person` 20/20 · `ship(s/ped)` 8/8 · `only` 13/13 · `a person has` 3/3 · `approves it` 2/2 |
| Comment lines changed in the 5 scenes files, 5 service files, `ai-posts.ts` | **0** |

---

## Cross-cutting, before the topics

**C1. (MED, process) The batch-3 commit DID edit two provenance comments, and the log says three times
that it did not.** `git diff cab7925 561b44e -- content/blog/posts.ts` rewrites the `/** NO \`updated\` ... */`
block above `SINGULARITY_POST` and the one above `AI_AGENT_WORKFORCE_POST`. The log's topic sections both
say "the comment was left untouched ... it now contradicts the line above it and is the orchestrator's to
update", and the close-out repeats it as orchestrator item 1 and adds "`git diff` over `content/` filtered
to comment lines returns nothing, so no provenance comment moved" and "`git diff --numstat` on `posts.ts`
is 5 insertions and 3 deletions". The real numstat is **20 insertions and 21 deletions**.

This is not a copy-meaning error and the rewritten comments are, in substance, better than the
contradiction they replace. It matters for two reasons: playbook law 10 says a comment is never the
builder's to edit, and the orchestrator would otherwise go and fix something already fixed.

Two checkable claims inside the new comments disagree with the log's own table:

- `SINGULARITY_POST` comment: "grade 8.4 to 5.9". The log's table for `/blog/the-singularity-self-improving-ai-system`: **8.3** to 5.9.
- `AI_AGENT_WORKFORCE_POST` comment: "grade 8.5 to 5.9". The log's table for `/blog/ai-agent-workforce-real-estate-assistants`: **8.3** to 5.9.

I cannot re-measure a BEFORE grade without reverting the tree, so I report the disagreement rather than
adjudicate it. One of the two numbers in the repo is wrong in each case, and the comment is the one that
will outlive the log. The rest of the Singularity comment's claim is TRUE and I verified it: the
two-gate vocabulary counts are identical before and after (table above).

**C2. Scope is otherwise clean.** `git diff --numstat cab7925 561b44e` touches only the five scenes
files, `ai-posts.ts`, `posts.ts`, the five service files and the log. Nothing else.

**C3. ORCHESTRATOR FIELD, two new curly apostrophes (U+2019).** `content/services/ai-agent-workforce.ts`
`why` now reads "You can’t hire a person for every task that repeats" (BEFORE: `can't`, straight), and
`content/services/review-automation.ts` `lede` now has "Google’s policy rules it out". These are the only
two non-ASCII apostrophes in the twenty files and both are in fields I was told to skip. Flagging in case
the byte-sibling audit in the other repo cares.

**C4. ORCHESTRATOR FIELD, note only.** `content/services/review-automation.ts` carries a provenance
comment ending "So the number here is now that one, quoted as written, with the survey named beside it",
directly above `why`. Neither the BEFORE nor the AFTER `why` contains a number. That mismatch predates
this batch (it is in `6eab055`) and `why` is not the builder's field; recorded so it is not read as a
batch-3 regression.

---

## 1. AI AGENT WORKFORCE

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 1.1 | **MED** | `content/blog/ai-posts.ts`, `AI_AGENT_WORKFORCE_POST`, Berkeley paragraph | "...and then checked that the taxonomy was reliable by having **independent annotators** apply it and measuring how often they agreed. Their agreement measure came out at 0.88" | "Then they checked that the taxonomy was reliable. They had **separate annotators** apply it, and they measured how often those annotators agreed. Their agreement measure came out at 0.88, which is high." | "Independent" is the word that makes an inter-annotator agreement figure mean anything: agreement between annotators who were NOT independent proves nothing, and the next sentence leans the whole "opinion rather than a finding" argument on that 0.88. "Separate" only says they were different people. The sibling scene was not changed and still reads "tested for consistency between **independent** annotators, which is the step that separates a taxonomy from an opinion" (`content/blog/agent-workforce-scenes.ts`, `WHERE_FAIL.basis`), so the page now describes the same method two ways. `independent` fell 4 to 1 in this body; the survivor is the verbatim pass^k definition. | "They had independent annotators apply it, and they measured how often those annotators agreed." (one word restored, no other change; the grade cost is nil) |
| 1.2 | LOW | body, cost section | "The model is a **commodity** and it improves every few months without you doing anything." | "The model is an **off-the-shelf part**, and it improves every few months without you doing anything." | "Commodity" means interchangeable and undifferentiated, which is the contrast the next three sentences draw ("The brief is yours. It is specific to your business. Nobody else can write it."). "Off-the-shelf part" says ready-made, which is close but not the same axis. Acceptable; noted because it is the one swap in this topic that moves an economic term. | "The model is a standard part anybody can buy, and it improves every few months without you doing anything." |
| 1.3 | LOW | body, last paragraph | "The individual jobs are written up on their own: [answering the website at midnight](...)" | "Each of these jobs is written up on its own. There is [answering the website at midnight](...)" | "These jobs" has no antecedent in the preceding sentence, which is about writing one brief with us. In the BEFORE, "The individual jobs" pointed back to the three assistants named at the top of the article; "these" makes the reader look one sentence back and find nothing. | "Each of those jobs is written up on its own. There is [answering the website at midnight](...)", or name them: "The individual jobs are written up on their own. There is ..." |
| 1.4 | LOW | `content/blog/agent-workforce-scenes.ts`, `NOT_A_CHATBOT[3].body` | "**Nobody costs that in**, which is why the calculator further down this page works out the reviewing rather than the saving." | "**Nobody adds that up**, which is why the calculator further down this page works out the reviewing rather than the saving." | "Costs that in" means it is left out of the price of the thing; "adds that up" means nobody totals it. The calculator's whole argument is that the reviewing is an unpriced cost, so the original verb was the precise one. | "Nobody puts that in the price, which is why the calculator further down this page works out the reviewing rather than the saving." |
| 1.5 | LOW | body, tau-bench paragraph | "It puts a language agent into a **simulated** business with a real database" | "It puts a language agent into a **pretend** business. That business has a real database" | "Pretend" is the one word in this batch that reads to a child rather than to an adult reading plainly; "simulated" is the paper's own register and the page keeps harder words than that elsewhere ("ablation table", "arbitrary"). Shade only. | "It puts a language agent into a made-up business." |

**Checked and correct, for the record:** Section 442-c's 36-word statutory sentence and Section 440-a's
list survive verbatim, and the colon before the list was reopened with "The list runs:". Section 175.21's
"regular, frequent and consistent personal guidance, instruction, oversight and superintendence, with
respect to the brokerage business and all matters relating to it" is verbatim, and the split put
"It writes it down as ..." in front of it rather than bending it. The BLS median definition is verbatim
and the restored "the Bureau's own words are worth quoting / That is because ..." keeps the reason. The
pass^k definition is verbatim with an added, accurate "they defined it as". "Now run the same tasks eight
times each, and require all eight to be right." keeps both conditions in one sentence. The three-part
"It is that they are quoted per million tokens ... It is also that ... And it is that ..." keeps all
three governors. The four glosses ("A trace is the record of one whole run.", "which is a named list of
the kinds of failure", "A token is a small piece of text.", "It is standing context, meaning it does not
start from nothing each time.") are each plainly true and add no claim; the fourth is already asserted by
the service page's own "A general chatbot starts from zero every session".

**Verdict: no meaning error that reaches a reader, one methodological word weakened against its own
sibling scene, and the law and BLS passages are intact.** Compared: 109 body paragraph pairs, 24 scenes
strings, 15 service-page lines.

---

## 2. THE SINGULARITY

I read every sentence in the topic against the reposition checklist (on its own, by itself, always,
never, every, learns, remembers, improves, approves, ships, tests, a person, "only ... if/when") in the
body, all 13 changed scene strings and all 24 changed service-page lines. **No AFTER sentence claims more
autonomy, more memory, more certainty, less human approval or a stronger result than its BEFORE.** The
mechanical evidence is in the table at the top: `approv` 13/13, `a person` 20/20, `ship` 8/8, `only`
13/13. Both halves of every gate survive, including the two hardest splits:

- "It is that nothing it writes reaches anybody until **two things have happened**. A test suite that cannot be talked round has to run over it. **And** a person has to read the change and say yes."
- "A change ships **only if** it wins, **and only after** a person approves it."
- service `limits[0]`: "Not one of them reaches a client until the tests have run over it **and** you have read it **and** approved it."
- memory: "It keeps what it has learned about your business in files it has to read again before it starts anything" is verbatim; the scene's "kept in files rather than inside a model" is verbatim; "What persists is files. Not a model that has quietly learned you" is verbatim.
- autonomy: "It can work unattended for hours or days **depending on the task**, saving its place as it goes, **while the gate stays exactly where it was**" keeps both qualifiers.

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 2.1 | **MED** | `content/blog/ai-posts.ts`, `SINGULARITY_POST`, "Ask to see last month's changes" | "If that list does not exist, or it has to be assembled for you, then nothing has been keeping receipts **and** nothing can be undone in six weeks when something turns out to have been wrong." | "If that list does not exist, or it has to be put together for you, then nothing has been keeping receipts. **And nothing can be undone in six weeks when something turns out to have been wrong.**" | Two consequences of one condition; the second was promoted to its own sentence and lost the "then". Read alone, the page now says flatly that nothing can be undone in six weeks, which is the opposite of what this system claims three paragraphs later ("a change that turns out to be wrong can be found and undone"). The builder's own "Say ... Then ..." frame, used four times in CUSTOM AUTOMATION, is the fix. | "If that list does not exist, or it has to be put together for you, then nothing has been keeping receipts. And then nothing can be undone in six weeks when something turns out to have been wrong." |
| 2.2 | LOW | body, "That is a smaller claim..." | "Almost nothing else a business buys has any mechanism at all for noticing that it has been wrong in the same way hundreds of times, and **that absence** is so normal that nobody thinks to ask about it." | "Almost nothing else a business buys has any way at all of noticing that it has been wrong in the same way hundreds of times. **That gap** is so normal that nobody thinks to ask about it." | "Absence" names the thing precisely: the mechanism is missing entirely. "Gap" suggests a partial shortfall, and the same body uses "the gap between those two lists" later for something else. | "That missing piece is so normal that nobody thinks to ask about it." |
| 2.3 | LOW | body, the person's three jobs | "The second is catching the change that **optimises the measurement** rather than the business." | "The second is catching the change that **improves the measurement** rather than the business." | "Improves the measurement" can be read as making the measuring better, which is the opposite of the failure being described. The next sentence rescues it ("Whatever the replay counts as a win is what the system will slowly become good at"), so this is shade, not a meaning error. | "The second is catching the change that pushes the measurement up rather than the business." |
| 2.4 | LOW | body, "Then ask the boring one" | "Then ask the boring one, **which is** where the record lives, who can read it, **whether** the conversations are used to train anything general, and **whether** they can be deleted on request." | "Then ask the boring one. **Where does the record live, who can read it, are the conversations used to train anything general, and can they be deleted on request.**" | Four indirect questions became four direct ones punctuated with a full stop. It reads as a question mark is missing. (`whether` fell 17 to 15 in this body and both losses are here.) The content is intact. | "Then ask the boring one. Ask where the record lives, who can read it, whether the conversations are used to train anything general, and whether they can be deleted on request." |
| 2.5 | LOW | `content/services/the-singularity.ts`, `faqs[3]` | "...and they are worth asking in writing rather than assuming: **that** your conversations are stored in an environment you control, **that** they are not used to train anything general, and **that** they can be deleted on request." | "Both are worth asking in writing rather than assuming. **Ask for three things.** That your conversations are stored in an environment you control. That they are not used to train anything general. And that they can be deleted on request." | The three "that"s are correctly kept, and the count of three matches the next sentence's "the same three lines". The one thing added is an imperative where the original only recommended. It is mild because the recommendation survives verbatim in the sentence immediately before it, and the page's voice is already imperative elsewhere. Reported so the orchestrator can see it, not because it needs changing. | (no change needed; if the orchestrator wants the recommendation to stay the only mood: "Three things are worth asking for.") |

**Checked and correct, for the record:** the CACE quotation, the configuration-debt pair, the Microsoft
"only about one-third" sentence with its exclamation mark, and "if the answer is already correct, no
further self correction will be performed" are all byte-identical. "Most Ideas Fail to Show Value" is
unchanged. 75.9/84.3/75.8/89.7/95.5/97.5/91.0/80.1/39/0.56 all present. The gloss "A compiler is the
program that turns written code into something a machine can run." is plainly true and adds nothing. The
gloss "saving its place as it goes" for `checkpointing` is a fair plain rendering (saving progress so the
next session can resume) and the sentence around it keeps "while the gate stays exactly where it was".
The comparison in "A brokerage running a phone system ... is one piece of work. A brokerage running four
CRMs ... is a different one." did NOT flip. `WHERE_IT_STALLS`, `SELF_REVIEW` and `OFFLINE_ESTIMATE` keep
every figure, `sourceText` and caveat; "probability" was correctly left alone in the chart note.

**Verdict: the reposition is intact, and the one MED is a conditional that lost its "then", not a claim
about the product.** Compared: 134 body paragraph pairs, 13 scenes strings, 24 service-page lines.

---

## 3. CUSTOM AUTOMATION

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 3.1 | **MED** | `content/blog/ai-posts.ts`, `CUSTOM_AUTOMATION_POST`, FAQ "Why would anybody build this rather than buy something?" | "**Because** a product solves the version of a problem enough businesses share to be worth making a living from, and the step capping you is often not that version. The honest sequence is to look hard for a product first, **since one with thousands of customers has had its awkward edges found by people who were not paying to find them**, and to build only where the search genuinely comes up empty." | "A product solves the version of a problem enough businesses share to be worth making a living from. And the step capping you is often not that version. The honest order is to look hard for a product first, and to build only where the search truly comes up empty. **One with thousands of customers has had its awkward edges found by people who were not paying to find them.**" | Two losses in one answer. The answer to a "Why" question no longer begins with the reason, so it reads as an unprompted assertion. And the "since" clause, which was the REASON for looking at products first, was moved after the conclusion and stripped of its governor, so it lands as a bare neighbour whose subject "One" now has no antecedent ("one" what? the nearest noun is "the search"). This is the batch-2 `because` class plus the batch-2 relative-clause-lands-on-a-new-noun class in the same paragraph. | "Because a product solves the version of a problem enough businesses share to be worth making a living from. And the step capping you is often not that version. The honest order is to look hard for a product first, and to build only where the search truly comes up empty. That is because a product with thousands of customers has had its awkward edges found by people who were not paying to find them." |
| 3.2 | **MED** | body, "what it does not do" list, last item | "**The only mechanism that ever switches one of these off is** a date in somebody's calendar **and** a person willing to ask the question on that date." | "**Only two things ever switch one of these off.** A date in somebody's calendar, and a person willing to ask the question on that date." | One mechanism made of two parts that are both required became a count of two things, each of which reads as sufficient on its own. The page's point is that a diary date with nobody to act on it switches nothing off. Compare the same builder's correct handling of a genuine two-item list in REVIEW AUTOMATION ("Only two things ever change it. One is you answering it, and one is you fixing what caused it."), where the BEFORE really did say "The only two things". | "Only one thing ever switches one of these off. It is a date in somebody's calendar, plus a person willing to ask the question on that date." |
| 3.3 | **MED** | `content/blog/custom-scenes.ts`, `BEARING.note` | "That is true of a product you buy and it is true twice over of something built for you alone, **because** there is no other customer to notice the fault first and no vendor whose next release fixes it." | "That is true of a product you buy, and it is true twice over of something built for you alone. **There is no other customer to notice the fault first, and no vendor whose next release fixes it.**" | The reason for "twice over" became a bare neighbour. The builder's `because` repair pass was run on the five BODIES only (the log counts `because` "in the body"); the scenes files were never counted, and this is one of five drops across three scenes files. | "That is true of a product you buy, and it is true twice over of something built for you alone. That is because there is no other customer to notice the fault first, and no vendor whose next release fixes it." |
| 3.4 | LOW | body, "Who pays when software does not work" | "that is not a criticism of anybody's integrity, it is simply where **the incidence** falls" | "That is not a criticism of anybody's integrity. It is simply where **the cost** falls." | The sentence before it already says "will carry most of the cost when it goes wrong", so "It is simply where the cost falls" is now close to a tautology. "Incidence" was carrying the idea that this is a structural fact about who bears a burden, not a moral one. | "It is simply who ends up carrying it." |
| 3.5 | LOW | body, "The number this page will not print" | "So nobody writing this page can tell you what was actually measured, on how many systems, in what industry, **in a decade when software was written and deployed in ways that no longer exist**." | "So nobody writing this page can tell you what was really measured, on how many systems, or in what industry. **It was a decade when software was written and put to work in ways that no longer exist.**" | "It" has no antecedent; the nearest noun is "what industry". The reader can recover the meaning, but the sentence as written says "it was a decade". | "Those studies come from a decade when software was written and put to work in ways that no longer exist." |
| 3.6 | LOW | body, the preview paragraph (the builder flagged this one itself) | "building on a preview is building on something whose owner **has explicitly promised you nothing**." | "building on a preview is building on something **the owner's own policy leaves out of the promise**." | I checked this against the paragraph above it and I do not think it bends: the operative sentence "The commitment does not apply to anything that has not reached general availability." is verbatim two sentences earlier, and pointing at the policy is if anything more checkable. What is lost is rhetorical force, not fact. Recording it so the flag is answered rather than left open. | (no change needed) |
| 3.7 | LOW | body, "How to test a builder" | "A builder with nothing on that list has **either** never seen one of these go wrong **or** is not going to tell you about it." | "A builder with nothing on that list has never seen one of these go wrong, or is not going to tell you about it." | Dropping "either" leaves the "or" doing the work alone; it still reads as a disjunction, but the first clause can be misread as an assertion before the reader reaches the comma. | "A builder with nothing on that list has either never seen one of these go wrong, or is not going to tell you about it." |

**Checked and correct, for the record:** the semver rule (33 words), Stripe's "new values can be added as
a backward-compatible change without requiring an API version upgrade" and "Do not assume that the
documented values are exhaustive, and write code that handles a value it has never seen", "a substantial
economic or material technical burden", Microsoft's "a minimum of twelve months' notice where no successor
product is offered" and its exclusion of free services and preview releases, Meta's two years counted
from the NEXT version, the "Example Only" caption, and 59.5 / 38.3 / 21.2 / 1,471 / 241 billion / 17
percent / one percent are all intact. The three "Say ... Then ..." frames all open the consequence with
"Then", so the condition stays live. "Something nobody would miss for a month is one of two things.
Either it is not worth automating, or ..." correctly makes the either/or explicit. The `pull-quote` scene
(Google Cloud Terms 1.4(e)) is untouched.

**Verdict: three MED, and two of them are the same "a reason became a neighbour" shape the batch-2 checker
named; the vendor-policy and standards text is untouched.** Compared: 113 body paragraph pairs, 25 scenes
strings, 16 service-page lines.

---

## 4. DOCUMENT PROCESSING

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 4.1 | **MED** | `content/blog/ai-posts.ts`, `DOCUMENT_PROCESSING_POST`, DocVQA paragraph | "[DocVQA](...), published by researchers at IIIT Hyderabad and the Computer Vision Center in Barcelona, is a set of 50,000 questions asked about 12,767 document images, **drawn from** \"6,071 industry documents\" dating from as early as 1900 to as recent as 2018" | "[DocVQA](https://arxiv.org/abs/2007.00398) is a set of 50,000 questions asked about 12,767 document images. It was published by researchers at IIIT Hyderabad and the Computer Vision Center in Barcelona. **They are drawn from** \"6,071 industry documents\" dating from as early as 1900 to as recent as 2018, and including \"typewritten, printed, handwritten and born-digital text\"." | The relative clause was promoted across an intervening sentence and its subject landed on the wrong noun. The nearest plural before "They" is "researchers": the sentence as written says the researchers are drawn from 6,071 industry documents. The intended subject, the 12,767 document images, is now two sentences back. This is the batch-2 "relative clause lands on a new noun after the split" case, on a sourced passage. | "The images are drawn from \"6,071 industry documents\" dating from as early as 1900 to as recent as 2018, and including \"typewritten, printed, handwritten and born-digital text\"." |
| 4.2 | **MED** | `content/blog/document-scenes.ts`, `UNRELIABLE_ORIGINAL[1].body` | "The printed body is easy to read and carries nothing specific to your deal, **because** it is identical on every copy in the state." | "The printed body is easy to read and carries nothing specific to your deal. **It is identical on every copy in the state.**" | The reason the printed body carries nothing specific became a bare neighbour, so the two facts now sit side by side with no stated link. It is the load-bearing reason for the whole card ("how readable a thing is and how much it matters run in opposite directions"). | "The printed body is easy to read and carries nothing specific to your deal. That is because it is identical on every copy in the state." |
| 4.3 | **MED** | `content/blog/document-scenes.ts`, the calculator `note` (three drops in one string) | (a) "The headline is the fourth row rather than the hours, **because** the hours are the reassuring half and the count is the one worth sitting with." (b) "That is affordable, and it is not what happens, **because** the whole reason the system exists is so that nobody opens the page." (c) "And there is no dollar figure for a missed deadline, which is the number this category invites you to imagine, **because** the honest version of it depends on the contract, the state, the counterparty..." | (a) "The headline is the fourth row rather than the hours. **The hours are the reassuring half, and the count is the one worth sitting with.**" (b) "That is affordable, and it is not what happens. **The whole reason the system exists is so that nobody opens the page.**" (c) "...which is the number this category invites you to imagine. **The honest version of it depends on the contract, the state, the counterparty and whether anybody was willing to be reasonable that week.**" | Three reasons in one string turned into three bare neighbours. (c) is the worst of them: this note is the page's own account of what it refuses to put a number on and why, so the "why" is the entire content. `because` in this file fell 16 to 12 and all four losses are 4.2 plus these three. Note that two OTHER refusals in the same string kept theirs correctly ("That is because we have not measured one on your paperwork", "That is partly because ... It is also because ..."), which is what makes these three read as slips rather than as a decision. | (a) "...rather than the hours. That is because the hours are the reassuring half, and the count is the one worth sitting with." (b) "That is affordable, and it is not what happens. That is because the whole reason the system exists is so that nobody opens the page." (c) "...invites you to imagine. That is because the honest version of it depends on the contract, the state, the counterparty and whether anybody was willing to be reasonable that week." |
| 4.4 | LOW | body, after the three TRID deadlines | "They are quoted because they are the clearest published example of the thing this whole topic turns on: **a deadline written on a document whose meaning lives somewhere else**." | "They are quoted because they are the clearest published example of the thing this whole topic turns on. **A deadline written on a document can have its meaning living somewhere else.**" | The colon's appositive named the thing; the split turned the name into a hedged general claim with a modal ("can have"), and "can have its meaning living somewhere else" is awkward. No fact changed. | "They are quoted because they are the clearest published example of the thing this whole topic turns on. That thing is a deadline written on a document whose meaning lives somewhere else." |
| 4.5 | LOW | `content/blog/document-scenes.ts`, `NOT_THE_WORK[2].body` | "You can put it next to the output and check, line by line, which is the whole reason this is **a tractable problem** and the reason the fix is boring rather than clever." | "You can put it next to the output and check, line by line. That is the whole reason **this problem can be solved at all**, and the reason the fix is boring rather than clever." | "Tractable" means workable in practice; "can be solved at all" implies the alternative is unsolvable, which is a slightly larger claim than the card makes about the enrichment comparison next door. Shade. | "That is the whole reason this problem is a workable one, and the reason the fix is boring rather than clever." |

**Checked and correct, for the record. This is the topic with the most reproduced law, and all of it
holds.** The ESIGN retention rule: both quoted fragments are byte-identical, and the new join, "It has to
be a record which also \"remains accessible ...\"", keeps the two conditions JOINT ("has to be" carries
the requirement, "also" carries the conjunction) and adds no claim. The three 12 CFR 1026.19 deadlines,
12 CFR 1026.2's second definition with its paragraph numbers, the "State law governs" commentary and
"is a matter to be determined under applicable law", the ESIGN opening clause, the FUNSD "low resolution
of around 100 dpi" / "various types of noise" pair, the FUNSD sampling sentence, the FUNSD optimal word
grouping caveat and the DocVQA corpus wording are all verbatim; 94.4 / 76.4 / 0.57 / 0.04 / 99.2 / 2.1 /
94.36 / 87.0 / 77.0 / 199 / 25,000 / 3,200 / 5,188 all present. The `pull-quote` scene (Consummation) is
untouched. Every `should` in the abstention argument survives as `should`. **The provenance comment's ban
on the word "never" on `content/services/document-processing.ts` holds: zero occurrences outside
comments.** "Think of a page where ... On those pages, that line is a judgement about layout." is a clean
way to keep a condition live across a split.

**Verdict: the statutes and the studies are untouched; the three MED are one broken pronoun and four
dropped reasons in the scenes file, which the builder's body-only `because` check could not have seen.**
Compared: 120 body paragraph pairs, 29 scenes strings, 16 service-page lines.

---

## 5. REVIEW AUTOMATION

| # | sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|---|
| 5.1 | **MED** | `content/blog/ai-posts.ts`, `REVIEW_AUTOMATION_POST`, the 16 CFR 465.7 section | "The same block, **unlabelled, sitting under a heading that implies it is your reviews, while a filter quietly holds back everything under four stars, is the thing the paragraph describes**." | "**The same block is different when it is unlabelled, sitting under a heading that implies it is your reviews.** Put a filter behind it that quietly holds back everything under four stars, and that is the thing the paragraph describes." | Three joint conditions became one standalone judgement plus a second condition. Sentence one now says an unlabelled block under such a heading "is different" (from honest) on its own, with no filter involved. The FTC rule turns on misrepresentation, and the misrepresentation in this example only exists when all three hold together. This is the batch-1 "TWO JOINT CONDITIONS became one" error on the one rule-adjacent paragraph in the topic. | "The same block is the thing the paragraph describes when three things are true together. It is unlabelled. It sits under a heading that implies it is your reviews. And a filter quietly holds back everything under four stars." |
| 5.2 | **MED** | body, "what it does not do", last item | "...and it is also **the reason to start with one trigger rather than switching it on across everything in one afternoon**." | "It is also the reason to start with one trigger. **Do not switch it on across everything in one afternoon.**" | A recommendation expressed as a comparison became a flat order. This is the exact shape batch 1 scored HIGH ("It is best to share the profile rather than start a competing one." becoming "...share the profile. Do not start a competing one."). | "It is also the reason to start with one trigger, rather than switching it on across everything in one afternoon." |
| 5.3 | **MED** | `content/blog/review-scenes.ts`, `YELP_LIFT.basis` | "Yelp displays a rating rounded to the nearest half star, so **restaurants whose true average sat a hair either side of a threshold** were shown different ratings for the same underlying reviews." | "Yelp displays a rating rounded to the nearest half star. So **two restaurants can sit a hair either side of a threshold.** They are shown different ratings for the same underlying reviews." | "Whose true average" is the identification strategy: it is the restaurants' TRUE averages that straddle the rounding cut, which is why the displayed rating is exogenous to everything else about them. Without it, the restaurants themselves "sit a hair either side of a threshold", which is not a thing a restaurant does. The body keeps the precise version ("Take two restaurants whose true averages sit a hair either side of a rounding threshold"), so the chart's basis line is now the looser of the two. | "So two restaurants whose true averages sit a hair either side of a threshold are shown different ratings for the same underlying reviews." |
| 5.4 | **MED** | `content/blog/review-scenes.ts`, `PROFILE_SCAN[2].body` | "People go looking for the bad one on purpose, **because** it is the only part of the page they believe has not been managed, and they read it to find out what you are like when something goes wrong." | "People go looking for the bad one on purpose. **It is the only part of the page they believe has not been managed.** They read it to find out what you are like when something goes wrong." | The reason people go looking became a bare neighbour, and this card's whole claim is the causal one. `because` in this file fell 5 to 2; the other two losses are fine (one became "It is quoted here for two reasons.", which keeps the causal frame, and one is in an orchestrator field). | "People go looking for the bad one on purpose. That is because it is the only part of the page they believe has not been managed. They read it to find out what you are like when something goes wrong." |
| 5.5 | **MED** | `content/blog/review-scenes.ts`, the `offer` scene `text` | "...we will send back what a stranger sees in the first fifteen seconds: **the date on your newest review, the worst one on the first screen, and which of them have never been answered**." | "We will send back what a stranger sees in the first fifteen seconds. **That is the date on your newest review. It is the worst one on the first screen, and which of them have never been answered.**" | The colon's three-item list was split into two false identifications: the stranger's view "is the date", then "is the worst one ... and which of them have never been answered", which does not parse (a thing cannot be "which of them have never been answered"). This is live CTA copy and it is the worst-reading passage in the batch. | "We will send back what a stranger sees in the first fifteen seconds. That is three things. The date on your newest review. The worst one on the first screen. And which of them have never been answered." |
| 5.6 | LOW | body, "what it does not do", last item | "A steady flow of honest reviews of an experience people did not enjoy is **simply** a faster and more public way of finding that out." | "A steady flow of honest reviews of an experience people did not enjoy is a faster and more public way of finding that out." | "Simply" is a qualifier and qualifiers are content (batch 1). It carried "nothing more sinister than". The service page's own version kept it: `limits[4]` still reads "is simply a faster way to find out", so the two surfaces now differ. | "...is simply a faster and more public way of finding that out." |
| 5.7 | LOW | body, Google's contribution policy | "The second is a single sentence, and it is the whole argument: **discourage or prohibit negative reviews, or selectively solicit positive reviews from customers**." | "The second is a single sentence, and it is the whole argument. **Merchants may not discourage or prohibit negative reviews, or selectively solicit positive reviews from customers.**" | Reopening the colon with the governor is the right move and "may not" is accurate (the page has just said "a section listing what merchants may not do"). The small cost is that the sentence introduced as "a single sentence" of the policy is now the page's sentence with a prefix on it. The reproduced clause itself is intact. | "The second is a single sentence, and it is the whole argument. The policy says merchants may not discourage or prohibit negative reviews, or selectively solicit positive reviews from customers." |
| 5.8 | LOW | body, the cold open | "There is no notification for it and no line in any report. **Nothing in the CRM records that** a Tuesday evening in August went somewhere else on the strength of a date." | "There is no alert for it and no line in any report. **Nothing in the CRM records what happened. A Tuesday evening in August went somewhere else on the strength of a date.**" | The content clause of "records that ..." was promoted to a standalone assertion. It happens to be a fact the story has already established, so nothing false is said, but the sentence the reader is left with is broader ("records what happened") than the specific absence the paragraph is about. | "There is no alert for it and no line in any report. Nothing in the CRM records that a Tuesday evening in August went somewhere else on the strength of a date." |
| 5.9 | LOW | body, "Is this any different from what my CRM does" | "There is very little **proprietary technology** in this category and a great deal of variation in what the default settings do." | "There is very little **technology of their own** in this category. There is a great deal of variation in what the default settings do." | "Their" reaches back past two sentences to "Most CRMs". It resolves, but "technology of their own" in a sentence with no owner in it is looser than "proprietary". | "There is very little technology of the vendors' own in this category." |
| 5.10 | LOW | body, "what it does not do" | "Reviews pulled through to your own website are labelled as a selection of recent ones, **because that is what they are** and because of the paragraph above." | "Reviews pulled through to your own website are labelled as a selection of recent ones. **That is because it is what they are**, and because of the paragraph above." | "That is because it is what they are" has the pronoun twice over and reads as a stutter; the antecedent of "it" is the label, of "they" the reviews. | "They are labelled that way because that is what they are, and because of the paragraph above." |
| 5.11 | LOW | `content/blog/review-scenes.ts`, `GATING_LINE[0].body` | "The policy's own permission is to solicit content that represents a genuine experience, **without incentives and without trying to influence the rating or what the review says**." | "The policy's own permission is to solicit content that represents a genuine experience. **It says to do that without incentives, and without trying to influence the rating or what the review says.**" | On a compliance card, the two conditions on the permission are now in a second sentence. "It says to do that without ..." is an explicit governor and does hold them, so this passes; recorded because the BODY kept the same permission whole ("It allows you to solicit or encourage content that represents a genuine experience, without offering incentives and without attempting to influence...") and a reader who stops at the first sentence sees an unconditional permission. | (holds as written; if the orchestrator wants it airtight: "The policy's own permission is to solicit content that represents a genuine experience, and it holds only without incentives and without trying to influence the rating or what the review says.") |
| 5.12 | LOW | `content/blog/review-scenes.ts`, `FOUR_MOVES[1].body` | "...why the alternative is the one thing **in this category** that is actually against the rules." | "...why the alternative is the one thing **here** that is actually against the rules." | "Here" can be read as "on this page" rather than "in this product category", which is what the sentence means. | "...why the alternative is the one thing in this line of products that is actually against the rules." |

**Checked and correct, for the record:** the retired 73% is still dead and still disowned. "the unsourced
figure" survives verbatim inside the test's two-line window, the 97% / 41% / 10% / 68% / 47% / 9% / 74% /
1,002 / 5.4% / 9% / 3,582 / 1,587 figures are all present with the question they answered, and I re-ran
`lib/blog/zombie-claims.test.ts` myself: green. Google's policy language ("selectively solicit positive
reviews", "discourage or prohibit negative reviews", "solicit or encourage content that represents a
genuine experience, without offering incentives and without attempting to influence the rating or the
contents of the review", "request that specific content be included") and 16 CFR 465.7's carve-out list
(48 words, colon intact) and its 55-word restatement are verbatim. "legitimate", "independent",
"exogenous", "statistically insignificant", "premises", "solicit" all survive. The gloss "Exogenous here
means the change came from the rounding rather than from the restaurant." is exactly what Luca's rounding
design does and is set up by the two sentences before it. The `pull-quote` scene is untouched. "Only two
things ever change it. One is you answering it, and one is you fixing what caused it." is a correct
rendering of a genuine two-item list.

**Verdict: five MED, none of them in the reproduced rules; the FTC example lost its joint conditions and
one CTA sentence is broken English.** Compared: 97 body paragraph pairs, 30 scenes strings, 16
service-page lines.

---

# Totals

| topic | HIGH | MED | LOW |
|---|---|---|---|
| AI AGENT WORKFORCE | 0 | 1 | 4 |
| THE SINGULARITY | 0 | 1 | 4 |
| CUSTOM AUTOMATION | 0 | 3 | 4 |
| DOCUMENT PROCESSING | 0 | 3 | 2 |
| REVIEW AUTOMATION | 0 | 5 | 7 |
| cross-cutting | 0 | 1 (C1, process) | 2 (C3, C4) |
| **total** | **0** | **14** | **23** |

**The single most useful pattern for batch 4, if there is one:** the builder ran its `because` repair on
the five post BODIES and got them to 17/17, 31/31, 16/16, 17/17, 14/14. It never ran the same check on
the scenes and service files, and that is where five of the fourteen MED findings live (3.3, 4.2, 4.3 x3,
5.4). `because` fell 10 to 9 in `custom-scenes.ts`, 16 to 12 in `document-scenes.ts` and 5 to 2 in
`review-scenes.ts`. One command over all twenty files would have caught them.

**What I could not check:** the BEFORE readability grades quoted in the two rewritten `posts.ts`
provenance comments (8.4 and 8.5), because measuring them means rendering the old text, which needs the
tree reverted; I report only that they disagree with the log's own table (8.3 and 8.3). I did not run
`readability-gate.mjs` or `rewrite-invariants.mjs`: they read the rendered pages from the dev server, and
starting or driving one is outside this brief. I checked the four orchestrator fields (`lede`, `why`,
`specs`, `seo`) only for keyword survival and for the two typographic notes in C3 and C4.
