# The 10-year-old pass: CHECKER report, batch 1 (2026-09-18)

Method: BEFORE = `git show 6eab055:<file>`, AFTER = the working tree. Each post body was extracted
from both revisions and aligned paragraph by paragraph (structure held: same paragraph count in all
five, so line *n* before maps to line *n* after). Scenes and service files were read as full
`git diff 6eab055` hunks, old line beside new line, every hunk. `lede`, `why`, `specs` and `seo` on
the service pages are the orchestrator's and were skipped, except where a keyword or a retired claim
made them reportable; those cases are marked ORCHESTRATOR FIELD.

**783 paragraph/string pairs compared in total.** Per-topic counts at the end of each section.

---

## Cross-cutting, before the topics

**1. `content/blog/posts.ts` is not what the builder's log says it is.** The log's close-out states
"five `updated:` lines in `content/blog/posts.ts` ... Verified with `git diff --numstat` on
`posts.ts`: only `updated:` lines changed there." Against `6eab055` that file also carries a new
`seoTitle?` field on the `BlogPost` interface with its own provenance comment, **21 new `seoTitle:`
values**, **17 rewritten `seoDescription` values**, and the skip-tracing post's `/** */` comment has
been **rewritten** (playbook law 10: comments are never edited). The rewritten comment is accurate
(it names the 9.2 -> 5.9 grades and the invariants script, which match the builder's own table) and
it resolves the builder's open item 2, so this reads as the orchestrator's SEO lap landing on top of
the batch rather than a builder breach. Flagging only because the log's "nothing else changed"
sentence is now false and must not be relied on by whoever reviews next.

The five `updated:` bumps required by rule D5 are all present and correct: ai-clone, invoicing,
geo-landing-pages and local-seo moved `2026-08-27 -> 2026-09-18`, skip-tracing gained
`updated: "2026-09-18"` where it had none.

**2. Mechanical sweep, clean.** Zero em dashes, en dashes or arrow glyphs (`—  –  →  ⇒  ➔`) in any
prose string across the ten batch-1 files. The only em dashes in those files are inside `/** */`
provenance comments, which are untouched and pre-existing. Zero hype words (`seamless`,
`game-chang*`, `unlock`, `supercharge`, `revolutionar*`, `effortless`, `cutting-edge`).

**3. Retired claims, clean and better than the log says.** `callable` now appears **zero** times
anywhere in `content/`, except `content/services/data-enrichment.ts` ("It does not make a list
callable in the legal sense"), which is the sentence ABOUT the claim and is allowed, and is not a
batch-1 file. `verified` appears **zero** times in `content/services/skip-tracing-lead-generation.ts`
and `content/blog/skip-tracing-scenes.ts`; the only survivors in the topic are the FTC's own
"unverified complaints reported by consumers", which stays. **The builder's log item 1 for the
orchestrator ("`lede`, `specs` and `seo.description` still carry verified and callable") is now out
of date** — the orchestrator's own rewrite of those fields removed all of them.

**4. Zombie test re-run by me, not taken on trust.**
`npx vitest run lib/blog/zombie-claims.test.ts lib/blog/flagship.test.ts` -> `PASS (284) FAIL (0)`.

**5. Numbers.** Every spelled-out number, date, duration, percentage and count I compared is
unchanged in value, unit and subject: fourteen videos, three hundred and twelve properties, nine
towns, 315 / 48.2 / 219 / 59.0, 859,532 / $16.6bn / 256,256 / $19,372 / 21,442 / $2,770,151,146,
$6,725, $2,500, 254 million, 35 million, 17,168 / 2,364 / 13.8% / 70% / 105 million, 32,321 / 27,007
/ 82 / 74%, 5.6% / 0.529% / 99.5% / 4,100% / 1,400% / negative 63%, nineteen-of-twenty /
five-of-seven / ten-of-seventeen, 4.82 vs 4.48, 3,020 / 66 percent, 25.6 million, forty years, two
thousand dollars. One spelled-out-to-digits conversion, listed as LOW under INVOICING, and it passes
law 2 because the digit string is already on the page twice.

**6. Story.** All five cold opens keep their people, their times, their details and their order.
Nothing reordered, nothing lost. The register holds throughout: the worst damage is choppiness in a
few list-like passages (quoted below as LOW), not childishness and not robot voice.

---

## 1. INVOICING

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **HIGH** | `content/blog/ai-posts.ts`, `INVOICING_POST`, the paragraph quoting 12 U.S.C. 2607(a) (para 31 of the body) | "…that business incident to or a part of a real estate settlement service involving a federally related mortgage loan shall be referred to any person. Subsection (b) covers splitting." | "…shall be referred to any person. **In plain words, nobody may pay for a referral in that kind of deal, and nobody may take the pay.** Subsection (b) covers splitting." | The added plain-words sentence states the prohibition as absolute. 2607(c)(3) expressly permits "payments pursuant to cooperative brokerage and referral arrangements or agreements between real estate agents and brokers" — which **this same article relies on five paragraphs later** ("A referral fee from one brokerage to another is not what this law exists to stop") and which is the **premise of the cold open** ("It was a good referral. The deal between you was normal and legal."). Law 1 permits a plain sentence after a quotation only where the page already makes that claim or it is the unarguable meaning; here the page makes the opposite claim, and a reader arriving at para 31 is told the story at the top of the page describes a crime. | Either delete the added sentence, or: "In plain words, paying for a referral in that kind of deal is a crime unless the statute's own list of exceptions covers it. The list is a few paragraphs down, and one item on it is about your trade." |
| MED | `INVOICING_POST`, the IC3 crime-type paragraph (para 89) | "…and anybody quoting you a real estate **specific** figure from this report has taken it from the wrong table." | "Anyone who quotes you a real estate figure from this report took it from the wrong table." | "specific" carried the whole claim. The report **does** publish a Real Estate crime-type figure, and quoting that is not from the wrong table; the sentence's point was that there is no real-estate-*only* figure for this crime. As rewritten, a checkable claim about a cited primary source is false. | "Anyone who quotes you a real-estate-only figure for this crime from this report took it from the wrong table." |
| LOW | `INVOICING_POST`, the 12 U.S.C. 2602 scope paragraph (para 39) | "That definition reaches most ordinary **purchase mortgages** and it does not reach a cash sale" | "That reaches most everyday **home loans**. It does not reach a cash sale." | Drops "purchase". Not false (RESPA reaches refinances too), but the original's precision is gone in a paragraph whose job is precision about scope. | "That reaches most everyday purchase mortgages. It does not reach a cash sale." |
| LOW | `INVOICING_POST`, the Regulation CC 229.10(b) paragraph (para 57) | "For an electronic payment, which covers a wire and an ACH credit, the rule at 229.10(b) is that…" | "That covers a wire, which is a direct bank transfer. It also covers **an ACH credit, which is a payment sent from one bank account to another**." | The new gloss is true but does not distinguish an ACH credit from the wire glossed in the same breath (a wire is also a payment sent from one bank account to another), so it teaches nothing. Law 8 wants one plain clause that actually separates the term. | "It also covers an ACH credit, which is the slower, cheaper bank transfer most businesses use." |
| LOW | `INVOICING_POST`, the large-deposit paragraph (para 65) | "ask whether it was above **six thousand seven hundred and twenty five dollars**" | "Was it above **$6,725**?" | Spelled-out number converted to digits. Law 2 is satisfied (the digit string `$6,725` is already on the page twice, at paras 63 and 181, so the invariants script cannot read it as invented) and the value is identical. Flagged only because the spelled-out form looks deliberate. **No action needed.** | — |
| LOW | `content/blog/invoicing-scenes.ts`, `WHAT_IS_AN_INVOICE[1].body` | "which makes it one of the few genuinely ordinary receivables in the whole trade" | "That makes it one of the few plain **receivables in the whole trade, which is money other people owe you**." | The gloss's "which" dangles off "the whole trade", so it reads as if the trade is money other people owe you. | "A receivable is money other people owe you. That makes it one of the few plain ones in the whole trade." |
| LOW | `INVOICING_POST`, cost section (para 147) | "and the **ongoing** bill reflects that" | "The **monthly** bill reflects that." | Introduces a billing period the page never states. | "The ongoing bill reflects that." |
| LOW | `content/services/invoicing-and-payments.ts`, `limits[3]` | "When a deposit becomes **available to spend** is set by regulation and by your bank's policy inside it" | "When a deposit becomes **yours to spend** is set by regulation…" | On a page that is careful about money that is not yours (`limits[4]`, `WHAT_IS_AN_INVOICE[3]`), "yours" muddles ownership with availability. Reg CC governs when you may withdraw, not whose money it is. | "When you can spend a deposit is set by regulation, and by your bank's policy inside it." |
| LOW | `content/services/invoicing-and-payments.ts`, `useCases[2].body` | "Asking for money up front is uncomfortable and a link in the booking confirmation is not." | "Asking for money up front feels awkward. **A link in the booking confirmation does not.**" | Elliptical: "does not" has no verb to attach to after the split. | "Asking for money up front feels awkward. Sending a link in the booking confirmation does not." |

**Checked and clean:** the `pull-quote` scene (2607(b)) untouched; every 2607(a), (c)(3), (d) and 2603
fragment verbatim; Regulation CC 229.10(b), 229.12(b), 229.13(b) and (h) verbatim including
"in excess of $6,725 on any one banking day" and the subpart title; NY GBL 518 verbatim including
"inclusive of the surcharge" and the two-tier-pricing definition; all IC3 figures and the report's
own glossary wording; the QuickBooks self-description; "Nothing in this article is legal advice";
"this article does not claim to know how that arrives where you are"; "Read every bar as a ceiling
rather than as a measurement"; "an announced number and a number in force are different things";
"probably not"; "in particular". Two new glosses are plainly true and welcome: "Jointly and severally
means each one can be made to pay the whole sum." and "In plain words, the normal schedule covers
only the first $6,725 you pay in by cheque in one day."

**Verdict:** one real HIGH — a plain-words gloss that contradicts the article's own cold open and its
own reading of 2607(c)(3) — plus one qualifier drop that makes a claim about the IC3 report untrue.
Everything else is style.

**Compared:** 105 body paragraph units (39 identical, 66 rewritten) + 34 changed strings in
`invoicing-scenes.ts` + 25 in-scope changed strings in `invoicing-and-payments.ts` = **164**.

---

## 2. AI CLONE

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **HIGH** | `content/blog/ai-posts.ts`, `AI_CLONE_POST`, the section 50-f digital-replica paragraph (para 47) | "That is a careful definition and the second half is the part people miss. **Altering what somebody actually said, past the point where it is still their performance, is inside the definition as surely as inventing it from nothing.**" | "That is a careful definition. The second half is the part people miss. Changing what a person really said, past the point where it is still their performance, is inside the definition. **Inventing it from nothing is no more caught than that is.**" | The BEFORE uses the obvious case (inventing from nothing) to anchor the non-obvious one (altering a real performance): both are equally caught. The AFTER's last sentence is a downgrade construction — to a plain reader it says inventing a performance from nothing is *not really* caught by 50-f, which is false, and it is the reverse of the paragraph's point. The article's own FAQ kept the original sense ("So editing what they said into something better sits in the same territory as inventing it"), so the two surfaces now contradict each other on the scope of a statute. | "Changing what a person really said, past the point where it is still their performance, is inside the definition. It is caught just as surely as inventing it from nothing." |
| MED | `AI_CLONE_POST`, the DFDC paragraph (para 81) | "and note in the same paper that many **previously released** datasets in this field did not guarantee that" | "They note in the same paper that many **earlier** datasets in this field did not guarantee that." | This is reported content from the DFDC paper, sitting one clause after the sentence the builder's own log names as verbatim ("all recorded subjects agreed to participate in and have their likenesses modified during the construction of it"). "previously released" is paper register. I cannot confirm from the repo whether it is the paper's exact phrase; if it is, law 1 was broken. Restore unless someone re-reads the primary and confirms it was already a paraphrase. | "They note in the same paper that many previously released datasets in this field did not guarantee that." |
| LOW | `AI_CLONE_POST`, section 51 paragraph (para 35) | "when the whole product is a deliberate reproduction of a **specific** person" | "The whole product is a deliberate copy of **one named** person." | Adds "named". A likeness need not be of a *named* person for section 50/51 to bite; the test is identifiability. | "The whole product is a deliberate copy of one particular person." |
| LOW | `AI_CLONE_POST`, section 50-f paragraph (para 45) | "defining a deceased personality as a person domiciled in this state at death whose likeness had commercial value at the time of, or because of, their death" | "It defines a deceased personality as a person domiciled in this state at death. **Their likeness must have had** commercial value at the time of, or because of, their death." | Splitting a statutory definition turns a defining clause into what reads as a separate requirement. Not false, but law 1 says a long definitional sentence is allowed to stay long. | "It defines a deceased personality as a person who was domiciled in this state at death and whose likeness had commercial value at the time of, or because of, their death." |
| LOW | `AI_CLONE_POST`, C2PA paragraph (para 91) | "The **interesting** news is that there is a technical standard for the durable version of it" | "The **odd** news is that there is a technical standard for the lasting version of it." | "interesting" and "odd" are not synonyms, and nothing on the page says the standard is odd. | "The other news is that there is a technical standard for the lasting version of it." |
| LOW | `AI_CLONE_POST`, "what a twin honestly does" (para 123) | "which is a good test of whether a use is a **legitimate** one" | "That is a good test of whether a use is a **fair** one." | On a page whose whole subject is what a use is *allowed* to be, "legitimate" carried legal weight that "fair" does not. | "That is a good test of whether a use is an honest one." |
| LOW | `AI_CLONE_POST`, "the cost nobody quotes" (para 127) | "the story rather than an **anecdote**" | "the story rather than a **stray tale**" | "stray tale" is an invented phrase, not a plainer word. | "the story rather than a one-off." |
| LOW | `content/blog/clone-scenes.ts`, `DETECTOR.note` | "…would have scored, **with many of them simply random**." | "…would have scored. **Many of them were simply random.**" | An aside inside a reported finding becomes the page's own flat assertion, detached from "the organisers report that". | "The organisers add that many of them were simply random." |
| LOW | `content/blog/clone-scenes.ts`, `WASTED[0].body` | "The failure is not that the twin says something **outrageous**." | "The failure is not that the twin says something **wild**." | "wild" is vaguer, not simpler, and reads as slang beside the rest of the voice. | "…says something shocking." |
| LOW | `content/services/ai-clone.ts`, `howItWorks[2].body` | "The sentences that are expensive to get wrong in this trade look **completely ordinary**" | "The sentences that are costly to get wrong in this trade look **quite plain**." | "quite" hedges exactly where the original was absolute; the point is that these sentences look *totally* innocuous. | "…look completely plain." |
| note | `content/services/ai-clone.ts` keywords (ORCHESTRATOR FIELD) | `lede`: "A HeyGen-class video **avatar** plus an ElevenLabs-class **voice clone**…" | `lede`: "A video copy of you, with a copy of your voice." | Topic-wide counts: `avatar` 20 -> 19, `clone` 24 -> 23, `voice clone` 6 -> 5. Every lost instance is in the orchestrator's `lede`. `specs` and `whatItIs` still carry "avatar", "voice clone" and "digital twin", so the keyword phrases survive on the page. Flagged for the SEO lap, not a breach. | — |

**Checked and clean:** the `pull-quote` scene (Civil Rights Law 50) untouched; the 50-f digital-replica
definition verbatim with the new lead-in "Here is how it puts that, in its own words"; the 50-f
exemption list verbatim; 16 CFR 461's operative wording and its definition of officer verbatim; the
SNPRM's definition of an individual and the "means and instrumentalities" wording verbatim; the DFDC
consent sentence and the "may be less than one in a million" ratio verbatim including "may"; the C2PA
scope quotation verbatim; the `promise` scene untouched. Hedges intact: "most of them are shorter than
you would expect", "Nothing in this article is legal advice", "As of this writing, that proposal is
still a proposal", "it is the kind of thing that could change between this being written and you
reading it", "nobody has published a measurement of the familiar case", "it might cut either way",
"What that does to a reply rate is not something anybody has measured honestly". No "can" became a
"will". The gloss "Exemplary damages are an extra award meant to punish." and "Provenance here means a
record of where the file came from and what was done to it." are both plainly true.

**Verdict:** one HIGH — a statutory-scope sentence whose logic inverted on the rewrite and which now
contradicts the article's own FAQ — plus one source-wording change I could not verify against the
primary. The rest is style.

**Compared:** 116 body paragraph units (40 identical, 76 rewritten) + 25 changed strings in
`clone-scenes.ts` + 17 in-scope changed strings in `ai-clone.ts` = **158**.

---

## 3. SKIP TRACING

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| **HIGH** | `content/blog/ai-posts.ts`, `SKIP_TRACING_POST`, the FCRA definition paragraph (para 97) | "Most people assume the FCRA covers credit reports, meaning documents with credit scores in them, **and that** a name and a phone number is obviously not one of those. That is not how the definition is built." | "Most people assume the FCRA covers credit reports, meaning documents with credit scores in them. **A name and a phone number is obviously not one of those.** That is not how the definition is built." | The second clause was *reported belief* governed by "Most people assume … and that …". Splitting it turns it into the page's own assertion, which the very next sentence then refutes. The entire argument of this section is that a name and a phone number CAN be a consumer report. As written, the page states a falsehood about the FCRA in its own voice and then argues against itself. | "Most people assume the FCRA covers credit reports, meaning documents with credit scores in them. They assume a name and a phone number is obviously not one of those. That is not how the definition is built." |
| **HIGH** | `SKIP_TRACING_POST`, the "what changes the purpose" paragraph (para 103) | "But the moment a list is filtered or ranked by something that bears on a person's financial standing, **and** the filtering decides who gets an offer and who does not, the purpose has changed shape and the question is no longer rhetorical." | "But the moment a list is filtered or ranked by something that bears on a person's financial standing, **that changes.** Say the filtering decides who gets an offer and who does not. The purpose has changed shape, and the question is no longer rhetorical." | The BEFORE makes the trigger a conjunction of two conditions. The AFTER makes the *first condition alone* sufficient ("that changes") and demotes the second to a separate supposition with no connective back. That widens a statement about when FCRA duties attach, on a page whose whole thesis is that the status turns on the use, not the fields. | "But take the moment a list is filtered or ranked by something that bears on a person's financial standing, and that filtering decides who gets an offer and who does not. At that moment the purpose has changed shape, and the question is no longer rhetorical." |
| LOW | `SKIP_TRACING_POST`, the portability paragraph (para 43) | "go wrong for **completely** different reasons, at **completely** different rates" | "go wrong for different reasons. They also go wrong at different rates." | Both intensifiers dropped. This is the hinge of the next sentence ("a provider quoting you one accuracy figure covering both is quoting a number that does not describe anything") — the argument needs the two failures to be *unrelated*, not merely different. It is a weakening rather than a strengthening, so it is LOW, but the paragraph loses its point. | "…go wrong for completely different reasons. They also go wrong at completely different rates." |
| LOW | `SKIP_TRACING_POST`, the acquisition paragraph (para 25) | "every link in that chain is a place where somebody, **at some point**, had to have a reason to release the information" | "Every link in that chain is a place where someone had to have a reason to release the information." | "at some point" carried the article's point that the reason was formed long before the list reached you. Small, but it is a dropped qualifier. | "…a place where someone, at some point, had to have a reason to release the information." |
| LOW | `SKIP_TRACING_POST`, the licence paragraph (para 77) | "If you have ever asked a data provider about this you will have been told, quite correctly, that…" | "Ask a data provider about this and you will be told, quite correctly, that…" | Turns a report of the reader's likely past experience into an instruction and a prediction about the future. Harmless but it is now a promise about what a provider will say. | "Anyone who has asked a data provider about this was told, quite correctly, that…" |
| LOW | `content/services/skip-tracing-lead-generation.ts`, `useCases[3].body` | "Instead of paying a vendor for a stale list that was sold to everybody else who paid for it, you generate a fresh one…" | "**A stale list from a vendor was sold to everyone else who paid.** Instead of buying one, you generate a fresh list." | The new opening sentence asserts a specific past fact about an unnamed list, where the original was a generic contrast. Reads as a claim the page cannot support. | "A vendor's list is stale, and it was sold to everyone else who paid for it. Instead of buying one, you generate a fresh list." |
| LOW | `content/services/skip-tracing-lead-generation.ts`, `howItWorks[4].body` and `faqs[7].a` | "The point of building a **callable list** is that something calls it" / "Building a **callable list** only pays if something calls it" | "The point of building **a list you can work** is that something **works it**" / "Building **a list you can work** only pays if something **works it**" | The retired-claim substitution is correct and welcome, but "a list you can work … something works it" is a tautology. It also leaves `limits[5]` saying "A list you can work only pays if something **calls** it", so the same landed form is worded three different ways on one page. | "The point of building the list is that something works it." / "Building the list only pays if something works it." / and align `limits[5]` to "…only pays if something works it." |
| note | `content/services/skip-tracing-lead-generation.ts`, `faqs[0].a` and `limits[5]` | "a list of people they can **actually call**" / "only pays if something calls it" | "a list of people **you can call**" / unchanged | **Pre-existing, not a regression** — both phrasings are in the BEFORE. If the orchestrator wants the retired "callable" class fully dead in prose and not just as the word, these two are what survive. Raising it because this file was the one the retired-claim sweep ran on. | — |

**Checked and clean:** the woman's line "Can I ask where you got this number?" untouched; 47 CFR
52.21(m) verbatim in quote marks; 18 U.S.C. 2725(3), 2722(a), the two 2724 fragments, the "may"/"will"
single-word quotations, 2721(b)(8) and 2721(c) all verbatim; 15 U.S.C. 1681a(d)(1) and 1681b(f)
verbatim; "in connection with a business transaction that is initiated by the consumer" verbatim;
"financially motivated seller"; "is skip tracing legal" / "yes, it uses public records"; the FTC's
"As of September 30, 2024, there were 254 million active registrations." and "numbers that have been
disconnected but not reassigned remain on the registry"; both FCC passages including the footnote
that undercuts the 35 million figure; "bulk distribution for surveys, marketing or solicitations" and
"express consent"; the `pull-quote` scene untouched. Hedges intact: "which was probably half true",
"a court 'may' award it, which is not the same as 'will'", "We have no way of knowing what share of
them did", "nobody outside the compilers does", "treat it as an order of magnitude rather than a
headcount", "this article is not legal advice for your business", "no honest provider quotes 100%",
"It does not tell you anything about whether they are thinking of selling". The gloss "A suppression
list is simply the list of people who have said no." and the gloss on "the acquisition, which is how
the information was obtained in the first place" are both plainly true. The `tag: "verified" ->
"resolved"` change is figure data, the builder flagged it, `ServiceFigure.tsx` only prints it, and
nothing switches on the value — confirmed safe.

**Verdict:** the worst topic in the batch. Two HIGH findings, both in the FCRA section, both created
by the same move: a subordinate clause promoted to a standalone sentence, which loses the word that
governed it. One asserts a falsehood about the FCRA; the other widens when the FCRA bites.

**Compared:** 121 body paragraph units (47 identical, 74 rewritten) + 26 changed strings in
`skip-tracing-scenes.ts` + 29 in-scope changed strings in `skip-tracing-lead-generation.ts` = **176**.

---

## 4. LOCAL SEO

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| MED | `content/blog/ai-posts.ts`, `LOCAL_SEO_POST`, the profile-rules paragraph (para 75) | "A solo practitioner at a branded location is told **it is best to** share the organisation's profile **rather than start a competing one**." | "A solo practitioner at a branded location is told it is best to share the organisation's profile. **Do not start a competing one.**" | Google's guideline is a recommendation. Splitting the sentence leaves the second half as a flat prohibition in the page's own voice, which is a stronger rule than the guideline states. The same topic's scene file kept the original form — `local-seo-scenes.ts` `PROFILE_RULES[2].body` still reads "They are told it is best to share the organisation's profile rather than start a second one." So the two surfaces now disagree about how binding the guideline is, on a page whose whole argument is "read Google's own words". | "A solo practitioner at a branded location is told it is best to share the organisation's profile rather than start a competing one." |
| LOW | `LOCAL_SEO_POST`, cold open (para 7) | "Google publishes what decides it, in a paragraph almost nobody in this industry has read" | "Google publishes what decides it. **The paragraph is short**, and almost nobody in this industry has read it." | "The paragraph is short" is a new factual claim. The page's own later claim is that the *document* is short ("The document under it is short, public and free"), not the paragraph. Harmless but invented. | "Google publishes what decides it. Almost nobody in this industry has read that paragraph." |

**Checked and clean:** every reproduced Google phrase survives word for word — "There is no way to
request or pay for a better local ranking on Google"; "the algorithm details are kept confidential to
make the ranking system as fair as possible for everyone"; "mainly based on relevance, distance and
popularity"; "how well a Business Profile matches what someone is searching for"; "provide complete
and detailed business information"; "how far each business is from the customer who is searching";
"how well known a business is"; "how many websites link to your business and how many reviews you
have"; "should not extend farther than about two hours of driving time from where the business is
based"; "larger areas may be appropriate for some businesses"; the practitioner list and the
sales-associate exclusion; the virtual-office and co-working wording; "contactable at the verified
location during the hours stated". The Cornell paper's "none of the subjects had suspected any
manipulation" and its one-sentence conclusion verbatim; the `pull-quote` scene untouched. All eBay
figures and both study count sets intact. Hedges intact: "it is only partly true"; "these percentages
are not a benchmark for one"; "Nobody has run this experiment on a map pack"; "Be careful with this";
"which is exactly why the brand-keyword half does not transfer"; "It is not promised by anybody,
including us"; "not really"; "They may still be worth tidying"; "They allow that some businesses will
need more"; "this website was on the wrong side of the disagreement until this article was written"
(kept in full). The no-echo fix at para 85 keeps Google's phrase intact and did not touch the scene.
`difference-in-differences` kept as the method name, split onto its own sentence rather than glossed —
the right call. Keyword counts flat: `local seo` 9->9, `google business profile` 7->7, `map pack`
11->11, `prominence`/`relevance`/`distance` all unchanged.

**Verdict:** clean apart from one hedge lost inside a Google guideline, which the topic's own scene
file proves was avoidable. No HIGH.

**Compared:** 97 body paragraph units (37 identical, 60 rewritten) + 28 changed strings in
`local-seo-scenes.ts` + 16 in-scope changed strings in `local-seo.ts` = **141**.

---

## 5. GEO LANDING PAGES

| sev | file + locator | BEFORE | AFTER | what is wrong | proposed |
|---|---|---|---|---|---|
| MED | `content/services/geo-landing-pages.ts`, `lede` (ORCHESTRATOR FIELD) | "Give us your **service areas** and we build a real, on-brand landing page for each one…" | "Tell us the areas you serve, and we build a real page for each one, in your own look." | Keyword loss, law 9. This page's `keywords` array contains "local service area pages". After the rewrite the phrase "service area" appears **nowhere** in this topic's prose — not in the post body, not in `geo-pages-scenes.ts`, not anywhere in `geo-landing-pages.ts` except inside the `keywords` array itself. It was the only prose instance and it is gone. The change is in an orchestrator field, so it is theirs to fix, but it lands right before the SEO lap. | "Tell us the service areas you cover, and we build a real page for each one, in your own look." |
| LOW | `content/blog/ai-posts.ts`, `GEO_LANDING_PAGES_POST`, 24 CFR 100.75 paragraph (para 93) | "**Among the practices** the rule names as prohibited **is** selecting media or locations for advertising…" | "**The rule names as prohibited the practice of** selecting media or locations for advertising…" | Dropping "Among" makes this read as the practice the rule names, rather than one of several. The regulation text itself is untouched. | "Among the practices the rule names as prohibited is selecting media or locations for advertising the sale or rental of dwellings which deny…" |
| LOW | `GEO_LANDING_PAGES_POST`, school-ratings paragraph (para 111) | "and **if you publish them** you have made a statement about desirability using somebody else's numbers" | "**Publish them and** you have made a statement about desirability using someone else's numbers." | In a paragraph warning against publishing them, an imperative opening reads for a beat as advice to publish. | "If you publish them, you have made a statement about desirability using someone else's numbers." |
| LOW | `content/blog/geo-pages-scenes.ts`, `THE_TEST[2].body` | "because a target length is the only thing that can make a page about a town you know inside out and a page about a town you have never visited come out the same size" | "**A target length is the only thing that can make two pages come out the same size.** One is about a town you know inside out. The other is about a town you have never visited." | The first sentence, standing alone, is an overbroad claim (plenty of things make two pages the same size). The following two sentences recover it, but the claim is loose for a beat. | "Two pages should not come out the same size when one is about a town you know inside out and the other is about a town you have never visited. A target length is the only thing that makes them." |
| LOW | `content/blog/geo-pages-scenes.ts`, `WASTED[2].body` | "is telling every reader exactly how long it has been since you worked there" | "is telling every reader **something. It says** exactly how long it has been since you worked there." | Adds a filler sentence that says nothing; this is the one place in the batch where splitting made the prose weaker rather than plainer. | "…tells every reader exactly how long it has been since you worked there." |

**Checked and clean:** both Google spam-policy definitions and all four of their examples verbatim
(doorway abuse, scaled content abuse, the generative-AI example, the stitching example); all six
helpful-content self-assessment questions including "expertise that comes from having actually used a
product or service, or visiting a place" and the word-count bracket; the whole of 24 CFR 100.75's
second paragraph and its list of written statements verbatim; the "selecting media or locations for
advertising…" prohibition verbatim; both 24 CFR 100.70 steering examples verbatim; the protected
characteristics list identical in all four places it appears; the `pull-quote` scene untouched; the
two 44w/45w regulation sentences correctly left long. Hedges intact: "Nobody did anything wrong
here"; "Nobody is suggesting that choosing where to advertise is unlawful"; "so uneven pages are not
unlawful on their own, and nobody should tell you they are"; "Sometimes, and nobody can promise it";
"The honest limits are large"; "nobody has published a figure for it"; "It is not a guarantee"; "it is
worth being deliberate about it rather than pretending otherwise". No "may" became a "will". The
`IN_SHORT[2]` colon form is preserved as the log describes, so the no-echo fix held. Keyword counts
flat except the one above: `landing page` 8->8, `area page` 23->23, `doorway` 19->19, `near me` 2->2,
`ai search` 2->2.

**Verdict:** the cleanest topic on the law and the source text — every statute, regulation and Google
policy passage is byte-identical. The one thing to fix is a keyword the orchestrator's own `lede`
rewrite removed from the prose entirely.

**Compared:** 99 body paragraph units (36 identical, 63 rewritten) + 25 changed strings in
`geo-pages-scenes.ts` + 20 in-scope changed strings in `geo-landing-pages.ts` = **144**.

---

## Tally

| topic | HIGH | MED | LOW | pairs compared |
|---|---|---|---|---|
| INVOICING | 1 | 1 | 6 | 164 |
| AI CLONE | 1 | 1 | 8 (+1 note) | 158 |
| SKIP TRACING | 2 | 0 | 5 (+1 note) | 176 |
| LOCAL SEO | 0 | 1 | 1 | 141 |
| GEO LANDING PAGES | 0 | 1 | 4 | 144 |
| **total** | **4** | **4** | **24** | **783** |

## What I could not check

- **The DFDC "previously released datasets" wording** (AI CLONE, MED). The repo does not mirror that
  paper, and the playbook forbids fetching. Someone with the primary open should settle it in thirty
  seconds; until then treat it as a possible law-1 breach rather than a confirmed one.
- **`lede`, `why`, `specs` and `seo` on all five service pages, and `seoTitle`/`seoDescription` on all
  21 posts in `posts.ts`.** Out of scope by instruction. I read them only far enough to check for
  retired claims (clean) and for keyword phrases that vanished from the prose (two reported: the
  clone `avatar`/`voice clone` note, and the GEO `service area` MED).
- **Rendered output.** I did not start a server or drive a browser, so this report is about the source
  strings, not about what the pages look like at 1440 or 390.

## One pattern worth naming for batch 2

Three of the four HIGH findings are the same mistake, made three times in three different files: a
**subordinate clause promoted to a standalone sentence loses the word that governed it**.
"Most people assume … *and that* X" becomes "X". "…*and* the filtering decides who gets an offer"
becomes "Say the filtering decides…". "…is told it is best to share the profile *rather than* start a
competing one" becomes "Do not start a competing one." The splitting rule in the playbook says to
split at "and", "because", "which", "but" — that is right for description and wrong wherever the
governing word is a reporting verb, a condition or a hedge. Worth adding as a line under "How to make
a sentence simple": **never split away from a clause's governor.** If the first half is "Most people
assume", "the moment that", "it is best to", "unless" or "provided that", the whole condition stays in
one sentence, or the governor is repeated in the second one.
