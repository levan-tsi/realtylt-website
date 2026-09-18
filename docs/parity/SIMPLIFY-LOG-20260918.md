# The 10-year-old pass: builder log, batch 1 (2026-09-18)

Method and laws: `SIMPLIFY-PLAYBOOK-20260918.md`. Scorers re-run after every file.
Baselines below are the numbers measured on the dev server at the start of this batch, so
INVOICING's blog baseline (6.1) is already post-body-rewrite; its original was 9.5.

---

## 1. INVOICING (scenes + service page; body was already done by the orchestrator)

Files: `content/blog/invoicing-scenes.ts`, `content/services/invoicing-and-payments.ts`,
`updated:` in `content/blog/posts.ts`.

| Page | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/invoicing-and-payments-real-estate-brokerage` | 6.1 | **5.2** | 12w | 11w | PASS (7435 -> 7465 words, x1.00) |
| `/services/invoicing-and-payments` | 7.7 | **5.5** | 15w | 11w | PASS (1975 -> 1987 words, x1.01) |

vitest: `PASS (387) FAIL (0)`.

### Judgment calls

- **Left verbatim, untouched:** the `pull-quote` scene (12 U.S.C. 2607(b)); the phrase
  "cooperative brokerage and referral arrangements" in `IN_SHORT[1]` (statute wording from
  2607(c)(3)); the Regulation CC subpart title "availability of funds and disclosure of funds
  availability policies" in `AVAILABILITY.note`; the QuickBooks report's self-description
  ("based on a 2025 survey of more than two thousand small businesses") in the calculator note.
- **Gloss added (law 8), invoicing-scenes.ts `IN_SHORT[1]`:** "Treble damages means three times
  the charge." The page already carries this claim in the body ("three times the amount of any
  charge paid for that service", 2607(d)(2)), so the gloss states nothing new. Worth a second
  look because it is the one place I added a sentence to a statutory summary.
- **Gloss added (law 8), services/invoicing-and-payments.ts `howItWorks[4].body`:** rewritten to
  open "To reconcile is to check what was asked for against what really arrived." Same gloss the
  post body uses. The FAQ answer below it still says "reconcile" on purpose.
- **Hedges I nearly cut and kept:** "almost certainly not" (commission card lead, untouched);
  "probably not part of the exchange"; "Read every bar as a ceiling rather than as a
  measurement"; "an announced number and a number in force are different things"; "this article
  does not claim to know how that arrives where you are"; "There is also no figure anywhere in
  that report ... for how much of this touches a brokerage in particular" (I changed
  "specifically" to "in particular" and kept the qualifier rather than dropping it).
- **Terms glossed elsewhere, so NOT re-glossed here:** "a wire" (body glosses it before the
  RAILS scene), "same day origination" (body glosses it in the FAQ), "ledger" (left as plain
  English).
- **Not touched, by rule:** `eyebrow`/`title`/`lede`/`specs`/`why`/`keywords`/`seo`/`stat` on the
  service page; all `alt` text and photo credits; chart bar `label`/`value`/`display`;
  `sourceText`/`sourceHref`; the staged transcript `turns[].text` in `THE_CHASE` (dialogue, and
  already plain); `MONEY_PATH` labels; `headingLabels`.
- **Two long sentences I could not reach:** the service page `lede` (49w) is an owner-decided
  field, and the post `excerpt` in `posts.ts` (47w) is out of scope for this pass. Both still
  render inside `<main>` and both pages pass anyway. Flagging for the orchestrator's joint pass.
- **Invariants violations:** none.

---

## 2. AI CLONE (body + scenes + service page)

Files: `content/blog/ai-posts.ts` (AI_CLONE_POST, via post-body.mjs), `content/blog/clone-scenes.ts`,
`content/services/ai-clone.ts`, `updated:` in `content/blog/posts.ts`.

| Page | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/ai-clone-real-estate-agent-video-avatar` | 9.4 | **5.7** | 19w | 11w | PASS (7481 -> 7527 words, x1.01) |
| `/services/ai-clone` | 7.7 | **5.4** | 15w | 11w | PASS (2028 -> 2051 words, x1.01) |

vitest: `PASS (387) FAIL (0)`.

### Judgment calls

- **Left verbatim, untouched:** the `pull-quote` scene (Civil Rights Law section 50); the section
  50-f digital replica definition, given its own sentence with the lead-in "Here is how it puts
  that, in its own words"; the 50-f exemption list ("works of political or newsworthy value,
  parody, satire, commentary, criticism, biographical work with some degree of fictionalisation");
  the 16 CFR 461 operative wording and its definition of officer; the SNPRM's definition of an
  individual and the "means and instrumentalities" wording; the DFDC sentence "all recorded
  subjects agreed to participate in and have their likenesses modified during the construction of
  it"; the DFDC "ratio of faked videos to real ones may be less than one in a million"; the C2PA
  scope quotation inside `CREDENTIALS[1].body`; the `promise` statement scene (our own commitment,
  quote-styled) was not touched at all.
- **Gloss added (law 8), body, section 51 paragraph:** "Exemplary damages are an extra award meant
  to punish." This is the one factual addition in the topic and it is a dictionary definition
  rather than a claim about the page's subject. Worth a second pair of eyes.
- **Gloss added (law 8), body, C2PA paragraph:** "Provenance here means a record of where the file
  came from and what was done to it." Unarguable, and the scene beneath it already relies on the
  reader knowing the word.
- **Vocabulary swaps, the honest note:** the page would not come under 6.0 on sentence splitting
  alone, so I also swapped heavy words the reader gains nothing from: somebody -> someone/a person,
  anybody -> anyone, actually -> really (never inside a quotation), conversation -> talk,
  ordinary -> plain, individual company -> single firm. Meaning is unchanged in every case; I am
  flagging it because it is a metric-aware change as well as a readability one.
- **Hedges I nearly cut and kept:** "most of them are shorter than you would expect"; "Nothing in
  this article is legal advice"; "As of this writing, that proposal is still a proposal"; "it is
  the kind of thing that could change between this being written and you reading it"; "the
  transfer is not exact, and nobody has published a measurement of the familiar case"; "What that
  does to a reply rate is not something anybody has measured honestly" (service page); "it might
  cut either way". No "can" became a "will".
- **One real regression caught by the test suite, then fixed:** my FAQ sentence "They reached 59.0
  percent, and got no better with practice." became byte-identical to the `IN_SHORT[2]` claim and
  `lib/blog/flagship.test.ts` failed on the no-echo rule. The body sentence was rewritten ("That
  group reached 59.0 percent. Practice made them no better."), not the scene. Green after.
- **Not touched, by rule:** service page `eyebrow`/`title`/`lede`/`specs`/`why`/`keywords`/`seo`/
  `stat`; all `alt` text and photo credits; chart bar labels and values; `sourceText`/`sourceHref`;
  `CONSENT_PATH` captions (a provenance comment marks one of them as an owner correction);
  `headingLabels`.
- **Invariants violations:** none.

---

## 3. SKIP TRACING (body + scenes + service page)

Files: `content/blog/ai-posts.ts` (SKIP_TRACING_POST, via post-body.mjs),
`content/blog/skip-tracing-scenes.ts`, `content/services/skip-tracing-lead-generation.ts`,
`updated:` in `content/blog/posts.ts`.

| Page | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/skip-tracing-real-estate-legal-owner-phone-numbers` | 9.2 | **5.9** | 17w | 11w | PASS (8311 -> 8313 words, x1.00) |
| `/services/skip-tracing-lead-generation` | 8.3 | **5.6** | 17w | 12w | PASS (2620 -> 2660 words, x1.02) |

vitest: `PASS (388) FAIL (0)`.

### Retired claims (orchestrator instruction, 2026-08-27 class)

All in `content/services/skip-tracing-lead-generation.ts`. The post body and the scenes file were
grepped and carry neither word in the retired sense (the only "unverified" hits are the FTC's own
wording about its complaint data, which stays).

| Was | Now | Where |
|---|---|---|
| `after: "What you can call"` | `after: "What comes back"` | `figure.headers` |
| `tag: "verified"` | `tag: "resolved"` | `figure.rows[0]` |
| "an owner name, a verified phone number, and an email address" | "an owner name, a phone number, and an email address" | `whatItIs[0]` |
| "The point of building a callable list is that something calls it" | "The point of building a list you can work is that something works it" | `howItWorks[4].body` |
| "A callable list only pays if something calls it" | "A list you can work only pays if something calls it" | `limits[5]` |
| "Building a callable list only pays if something calls it" | "Building a list you can work only pays if something works it" | `faqs[7].a` |

`tag` was checked first: `content/services/types.ts` types it `string`, and `ServiceFigure.tsx`
only prints it, so nothing switches on the value. Flagging it anyway because it is figure data
rather than prose. `lede`, `specs` and `seo.description` still carry "verified" and "callable";
they are the orchestrator's fields and were left alone.

### Judgment calls

- **Left verbatim, untouched:** the woman's line "Can I ask where you got this number?"; the
  47 CFR 52.21(m) portability definition; 18 U.S.C. 2725(3); 2722(a); the two 2724 fragments and
  the "may" / "will" single-word quotations; 2721(b)(8); 2721(c); 15 U.S.C. 1681a(d)(1); the
  1681b(f) prohibition; "in connection with a business transaction that is initiated by the
  consumer"; "financially motivated seller"; "is skip tracing legal" / "yes, it uses public
  records"; the FTC's "As of September 30, 2024..." and "numbers that have been disconnected but
  not reassigned remain on the registry"; both FCC passages including the footnote that undercuts
  the 35 million figure; "bulk distribution for surveys, marketing or solicitations" and "express
  consent" in `THREE_EXCEPTIONS[2]`; the `pull-quote` scene (our own statement) untouched.
- **Gloss added (law 8), body, "What a trace is actually made of":** "A suppression list is simply
  the list of people who have said no." The audit section further down already defines it the same
  way, so this moves the definition to first use rather than inventing one.
- **Gloss added (law 8), body, "the acquisition, which is how the information was obtained in the
  first place."** The term carries the whole argument and had no gloss.
- **Vocabulary swaps:** somebody -> someone, anybody -> anyone, everybody -> everyone, ordinary ->
  plain, conversation -> talk (once), least interesting -> dullest. Same metric-aware note as the
  clone topic: meaning unchanged, but these were chosen partly because this page cannot lose its
  long statutory quotations and had to find the grade elsewhere.
- **Hedges I nearly cut and kept:** "which was probably half true"; "a court 'may' award it, which
  is not the same as 'will'"; "We have no way of knowing what share of them did"; "the honest
  position is that nobody outside the compilers does"; "so treat it as an order of magnitude rather
  than a headcount"; "this article is not legal advice for your business"; "no honest provider
  quotes 100%"; "it might cut either way" equivalents; "It does not tell you anything about
  whether they are thinking of selling".
- **One real regression caught by the test suite, then fixed:** my FAQ sentence "They are bands of
  roughly 70 to 90 percent." matched the calculator note's sentence and tripped the no-echo rule in
  `lib/blog/flagship.test.ts`. The body sentence was rewritten, not the scene. Green after.
- **`updated` note worth a second pair of eyes:** this post had NO `updated` field at all, and the
  `/** */` comment right below the date explains why ("Set it when the article takes its first real
  revision"). I added `updated: "2026-09-18"` per rule D5 and did NOT edit the comment, because
  comments are law. The comment now reads as stale against the field above it. That is the
  orchestrator's call, not mine.
- **Invariants violations:** none.

---

## 4. LOCAL SEO (body + scenes + service page)

Files: `content/blog/ai-posts.ts` (LOCAL_SEO_POST, via post-body.mjs),
`content/blog/local-seo-scenes.ts`, `content/services/local-seo.ts`, `updated:` in
`content/blog/posts.ts`.

| Page | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/local-seo-real-estate-map-pack-google-business-profile` | 9.2 | **5.9** | 19w | 11w | PASS (6949 -> 6969 words, x1.00) |
| `/services/local-seo` | 7.6 | **5.9** | 14w | 11w | PASS (1706 -> 1723 words, x1.01) |

vitest: `PASS (388) FAIL (0)`.

### Judgment calls

- **Left verbatim, untouched:** everything reproduced from Google's own two pages, which on this
  topic is most of the load-bearing text and none of it carries quote marks. "There is no way to
  request or pay for a better local ranking on Google"; "the algorithm details are kept
  confidential to make the ranking system as fair as possible for everyone"; "Local results ...
  are mainly based on relevance, distance and popularity"; "how well a Business Profile matches
  what someone is searching for"; "provide complete and detailed business information"; "how far
  each business is from the customer who is searching"; "how well known a business is"; "how many
  websites link to your business and how many reviews you have"; "should not extend farther than
  about two hours of driving time from where the business is based"; "larger areas may be
  appropriate for some businesses"; the practitioner list and the sales-associate exclusion; the
  virtual-office and co-working wording. Also the Cornell paper's "none of the subjects had
  suspected any manipulation" and its one-sentence conclusion, and the `pull-quote` scene.
- **Terms I did NOT gloss, on purpose:** relevance, distance, prominence, popularity, map pack,
  individual practitioner. Every one is Google's own word and the page's whole argument is that
  you should read Google's words. Glossing them would have put my paraphrase beside the primary.
  "Difference-in-differences" is the paper's method name and stays; I split it onto its own
  sentence rather than explaining it, because I am not sure enough of a one-clause definition.
- **Vocabulary swaps:** somebody -> someone, anybody -> anyone, genuinely -> truly, underneath ->
  under, actually -> really or deleted where it was throat-clearing. Never inside a quotation, and
  never inside a heading (`post-body.mjs inject` enforces that).
- **Hedges I nearly cut and kept:** "it is only partly true"; "these percentages are not a
  benchmark for one"; "Nobody has run this experiment on a map pack"; "Be careful with this";
  "which is exactly why the brand-keyword half does not transfer"; "Position is slower, and is not
  promised by anybody, including us"; "not really" (can I rank in another town); "They may still
  be worth tidying"; "allowing that some businesses will need more"; "and this website was on the
  wrong side of the disagreement until this article was written" (kept in full).
- **Two-pass note, honestly:** the first body rewrite landed at 7.0 and the scenes pass took it to
  6.3. Only the second body pass (more splits plus the vocabulary swaps) cleared 6.0. The page has
  an unusual amount of unavoidable three-syllable vocabulary because Google's own nouns are the
  subject.
- **One real regression caught by the test suite, then fixed:** splitting a body sentence created
  an exact match with `THE_WORK[0]` ("Google's own advice for the relevance half is simply to
  provide complete and detailed information.") and tripped the no-echo rule. The body was reworded
  to "For the relevance half, Google's own advice is simply to provide complete and detailed
  information.", which keeps Google's phrase intact. The scene was not touched. Green after.
- **Not touched, by rule:** `eyebrow`/`title`/`lede`/`specs`/`why`/`keywords`/`seo`/`stat` on the
  service page; `alt` text and photo credits; chart bar labels and values; `sourceText`/
  `sourceHref`; `headingLabels`. The service page `lede` is 52w and is the longest sentence left on
  that surface; it still passes.
- **Invariants violations:** none.

---

## 5. GEO LANDING PAGES (body + scenes + service page)

Files: `content/blog/ai-posts.ts` (GEO_LANDING_PAGES_POST, via post-body.mjs),
`content/blog/geo-pages-scenes.ts`, `content/services/geo-landing-pages.ts`, `updated:` in
`content/blog/posts.ts`.

| Page | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/geo-landing-pages-real-estate-doorway-pages` | 9.1 | **5.9** | 19w | 12w | PASS (6929 -> 6948 words, x1.00) |
| `/services/geo-landing-pages` | 7.6 | **5.8** | 14w | 11w | PASS (1899 -> 1913 words, x1.01) |

vitest: `PASS (388) FAIL (0)`.

### Judgment calls

- **Left verbatim, untouched:** both Google spam policy definitions and all four of their examples
  (doorway abuse, scaled content abuse, the generative-AI example, the stitching example); all six
  helpful-content self-assessment questions including "expertise that comes from having actually
  used a product or service, or visiting a place" and the "(No, we don't.)" bracket; the whole of
  24 CFR 100.75's second paragraph and its list of written statements; the "selecting media or
  locations for advertising..." prohibition; both 24 CFR 100.70 steering examples; the protected
  characteristics list, which appears four times and is identical every time. The `pull-quote`
  scene was not touched.
- **Kept the long ones long, on purpose:** the two 44w and 45w sentences left on the blog page are
  both 24 CFR 100.70/100.75 reproduced word for word. Law 1 allows that, and breaking them would
  bend a regulation.
- **Vocabulary swaps:** somebody -> someone, anybody -> anyone, everybody -> everyone, actually ->
  really (never inside Google's own wording and never inside a heading), "your particular town" ->
  "your own town".
- **Hedges I nearly cut and kept:** "Nobody did anything wrong here"; "Nobody is suggesting that
  choosing where to advertise is unlawful"; "so uneven pages are not unlawful on their own, and
  nobody should tell you they are"; "Sometimes, and nobody can promise it"; "The honest limits are
  large"; "nobody has published a figure for it"; "It is not a guarantee"; "and it is worth being
  deliberate about it rather than pretending otherwise". None of this page's "may" became a "will".
- **One real regression caught by the test suite, then fixed:** I had split `IN_SHORT[2]` so that
  "Because of race, colour, religion, sex, handicap, familial status or national origin." became
  its own sentence, which made it an exact match for the body's verbatim regulation text and
  tripped the no-echo rule. The scene was put back to the colon form ("Both prohibitions hang on
  the same clause: because of race, ..."); the body's verbatim text was not touched. Green after.
- **Not touched, by rule:** `eyebrow`/`title`/`lede`/`specs`/`why`/`keywords`/`seo`/`stat` on the
  service page; `alt` text and photo credits; chart bar labels and values; `sourceText`/
  `sourceHref`; `PAGE_PATH` captions; `headingLabels`.
- **Invariants violations:** none.

---

## Batch close-out

All ten surfaces re-measured in one sweep at the end of the batch, after every file was in its
final state:

| Page | grade | median | invariants |
|---|---|---|---|
| `/blog/invoicing-and-payments-real-estate-brokerage` | 5.1 | 11w | PASS x1.01 |
| `/services/invoicing-and-payments` | 5.5 | 11w | PASS x1.02 |
| `/blog/ai-clone-real-estate-agent-video-avatar` | 5.7 | 11w | PASS x1.01 |
| `/services/ai-clone` | 5.4 | 11w | PASS x1.01 |
| `/blog/skip-tracing-real-estate-legal-owner-phone-numbers` | 5.9 | 11w | PASS x1.00 |
| `/services/skip-tracing-lead-generation` | 5.6 | 12w | PASS x1.02 |
| `/blog/local-seo-real-estate-map-pack-google-business-profile` | 5.9 | 11w | PASS x1.00 |
| `/services/local-seo` | 5.9 | 11w | PASS x1.01 |
| `/blog/geo-landing-pages-real-estate-doorway-pages` | 5.9 | 12w | PASS x1.00 |
| `/services/geo-landing-pages` | 5.8 | 11w | PASS x1.01 |

`npx vitest run lib/blog lib/services content app/blog` at the end of the batch: `PASS (388)
FAIL (0)`.

Files modified in this batch, and nothing else: `content/blog/ai-posts.ts` (four bodies, via
post-body.mjs), `content/blog/{invoicing,clone,skip-tracing,local-seo,geo-pages}-scenes.ts`,
`content/services/{invoicing-and-payments,ai-clone,skip-tracing-lead-generation,local-seo,
geo-landing-pages}.ts`, five `updated:` lines in `content/blog/posts.ts`, and this log. Verified
with `git diff --numstat` on `posts.ts`: only `updated:` lines changed there. Nothing was
committed, staged or stashed.

### Two things for the orchestrator to decide

1. `content/services/skip-tracing-lead-generation.ts` still carries "verified" in `specs` and
   `lede`, and "callable" in `seo.description`. Those are the fields the orchestrator reserved.
2. The skip-tracing post's `/** */` comment in `posts.ts` still says it has no `updated` field. I
   added the field per rule D5 and left the comment alone, because comments are law.

---

# BATCH 2

Builder: second batch of five topics (marketing automation, AI audit, data enrichment, CRM sync,
AI scheduling). Same method as batch 1, plus the rule batch 1 paid for: never split a clause away
from its governor. BEFORE = `6eab055`.

## 1. MARKETING AUTOMATION

| surface | grade before | grade after | median after | invariants |
|---|---|---|---|---|
| `/blog/marketing-automation-real-estate-email-deliverability` | 8.9 (median 17w) | 5.9 | 12w | PASS x1.00 |
| `/services/marketing-automation` | 6.9 (median 13w) | 5.5 | 10w | PASS x1.03 |

Files: `MARKETING_AUTOMATION_POST` body (via post-body.mjs), `content/blog/marketing-automation-scenes.ts`,
`content/services/marketing-automation.ts`, `updated:` line in `content/blog/posts.ts`
(`2026-08-27` -> `2026-09-18`).

### Judgment calls

- **Governor kept, did not split.** "Almost everybody assumes American email marketing law works
  like a consent regime: you may not email somebody unless they agreed." The colon clause is a
  REPORTED BELIEF. Rewritten as two sentences with the governor repeated: "Almost everyone assumes
  American email marketing law works like a consent regime. They assume you may not email someone
  unless they agreed." (The batch-1 skip-tracing HIGH, avoided.)
- **Governor kept, did not split.** The 16 CFR 316.3 mixed-message test is a disjunction of two
  conditions. Kept as "the primary purpose is deemed commercial in either of two cases. The first
  is if ... The second is if ...", so neither condition can be read as sufficient on its own.
- **Governor kept, did not split.** "If that is the phrase you have heard, the natural conclusion
  is that a small business is exempt from all of it" stays one sentence (condition).
  Same for every "If your mail ...", "If it asks you to log in ...", "If you recognise someone ..."
  item in the audit list, and "because that rule keeps running for years ..." in FAQ 1.
- **Gloss added (one, word for word):** "The denominator, which is the bottom of the fraction, is
  not what you sent." The page's own next sentence already says "is not in the bottom of that
  fraction", so the gloss is the page's own words, not a new claim.
- **Gloss-ish rewording, logged because it is not a pure word swap:** FAQ "Will automated marketing
  annoy my leads?" had "irrelevance is what makes people press it"; now "sending people things they
  do not care about is what makes them press it".
- **Qualifiers deliberately kept:** "completely separate judgement", "uniformly innocent",
  "in particular", "possibly ... and possibly", "may not arrive", "roughly a fortnight",
  "probably do not know", "nobody has published a figure for that with a method under it".
  "the majority of the address leaks" became "most of the address leaks" (same quantity).
- **Verbatim left alone:** every CAN-SPAM and 16 CFR fragment in quote marks, the whole 64-word
  16 CFR 316.5 sentence (left long on purpose), both 316.3 test clauses, Google's "Requirements
  for all senders" list and its 0.3% line, Yahoo's two lines, RFC 7208 / 6376 / 8058 quotations,
  the RFC 8058 blockquote, the RFC 7489 pull-quote scene, the Englehardt/Han/Narayanan limit
  sentence, "Keep your spam rate below 0.3%", "Spam rate is calculated in our system based on mail
  delivered to the inbox".
- **Word swaps for the grade, meaning-identical:** somebody -> someone, anybody -> anyone outside
  headings (the heading "Do I need permission to email somebody in the United States?" and
  "The requirement everybody files under bulk sending" are untouched); genuine -> true;
  preferential treatment -> better treatment; configuration -> set-up; consequence -> result.
- **`measurement` -> `measure`** in one body sentence only ("the only measure of their own
  reputation available to them anywhere"); every other "measurement of attention" is intact.
- No invariants violation. No numbers changed. Zero em dashes, arrow glyphs or hype words added.

## 2. AI AUDIT

| surface | grade before | grade after | median after | invariants |
|---|---|---|---|---|
| `/blog/ai-audit-small-business-what-not-to-automate` | 8.8 (median 17w) | 5.9 | 11w | PASS x1.00 |
| `/services/ai-audit` | 6.2 (median 12w) | 5.4 | 10w | PASS x1.03 |

Files: `AI_AUDIT_POST` body, `content/blog/audit-scenes.ts`, `content/services/ai-audit.ts`,
`updated:` line in `content/blog/posts.ts` (`2026-08-27` -> `2026-09-18`).

### Judgment calls

- **Governor kept, did not split.** "Asking three people how something gets decided, separately,
  and getting three answers is not a sign that anybody is doing it wrong." Left as one 22-word
  sentence. Turning it into "Ask three people ... and you will get three answers" would make a
  prediction out of a description (the batch-1 skip-tracing LOW).
- **Governor repeated, not dropped.** The NIST framework passage: "It says plainly that while it
  can be used to prioritise risk, it does not prescribe risk tolerance. It says that the level of
  risk which is acceptable is highly contextual and specific to the application." The second
  sentence repeats "It says" so the framework stays the speaker.
- **Governor kept, did not split.** "It cannot be read as nobody using AI, because a firm buying a
  service that happens to run on it is not a firm adopting a technology on this list";
  "This article will not name a specific first thing, because the survey evidence says a settled
  answer does not exist yet"; "It is not on the list above, because it is not really a candidate".
- **The "while ... only ..." contrast in `IN_SHORT[1]` was split, and the contrast word was kept.**
  "It found that 90.2 percent ... held some of it digitally. Only 10.3 percent used even one of
  the nine advanced business technologies on the list." "Only" and "even one" both survive.
- **No glosses added on this topic.** Nothing needed one that the page did not already define.
- **Qualifiers deliberately kept:** "almost certainly not behind", "may be larger", "usually",
  "very often", "roughly the right size", "plausible", "specifically" (on the 2.9 percent line),
  "uncorrected for sample weights and should therefore be read as a lower bound", "It cannot say
  anything about 2026", "Do not take 17 percent home as your own number", "nobody can tell you
  what share of automation projects fail", "not always when that happens".
- **Verbatim left alone:** the NIST pull-quote scene; the NIST "determination as to whether the
  system achieves its intended purposes and stated objectives and whether its development or
  deployment should proceed"; "mitigating, transferring, avoiding, or accepting"; the "highly
  contextual and specific to the application" wording; the NBER authors' "low response rates and
  significant selection bias"; the Oxford "largest academic dataset of its kind"; the VU Amsterdam
  "misleading, one-sided, they pervert the estimation practice, and they result in meaningless
  figures"; every percentage, count and dollar figure.
- **Word swaps for the grade, meaning-identical:** somebody -> someone, anybody -> anyone,
  everybody -> everyone outside headings; genuinely -> truly; obligation -> duty; consensus ->
  agreement; pessimistic -> gloomy; distributed -> spread out; symptom -> sign; posture -> stance;
  reconstructed -> rebuilt; annually -> every year; internally -> inside the business;
  criterion -> test; enthusiastic -> eager; arithmetic -> sums; resolve -> settle (one instance,
  "Building software over the top of that does not settle it").
- **`deliberately` -> `on purpose` in four places only** (the method being small, the audit being
  priced, the choice being made, the calculator refusing numbers). It is a six-syllable word and
  it was the single most expensive word on the page. Kept where it still reads best.
- No invariants violation. No numbers changed.

## 3. DATA ENRICHMENT

| surface | grade before | grade after | median after | invariants |
|---|---|---|---|---|
| `/blog/data-enrichment-real-estate-stale-contact-records` | 8.8 (median 17w) | 5.9 | 11w | PASS x1.00 |
| `/services/data-enrichment` | 6.9 (median 12w) | 5.8 | 11w | PASS x1.02 |

Files: `DATA_ENRICHMENT_POST` body, `content/blog/enrichment-scenes.ts`,
`content/services/data-enrichment.ts`, `updated:` line in `content/blog/posts.ts`
(`2026-08-27` -> `2026-09-18`).

### Judgment calls

- **Governor kept, did not split.** The FTC finding "most of their data comes from other companies
  like them rather than from an original source" stays in one sentence. I drafted a split
  ("It does not come from an original source") and threw it away: it drops "most" and turns a
  partial finding into an absolute one.
- **Governor kept, did not split.** "Where a field was not empty it wrote anyway, because that is
  what the default was and nobody was asked"; "It is worth asking for by name, because a response
  that does not carry it looks exactly like one that does"; "It is worth seeing how that behaviour
  is presented by the software, because it tells you which way the tooling leans"; every
  "unless the provider is asked for it and passes it through" clause.
- **Gloss NOT added.** The article uses "provenance" twice and never defines it; I left it alone
  rather than glossing it, because the page's own working definition ("where the value came from
  and when it was written") is already the sentence beside it.
- **Wording I changed and want on the record:**
  "indistinguishable from something you knew" -> "look exactly like something you knew";
  "nothing in the row distinguishes them" -> "nothing in the row tells them apart";
  "a conclusion ... is indistinguishable from a measurement" -> "looks exactly like a
  measurement"; "whether a bad pass is reversible" -> "whether a bad pass can be undone";
  "retrofitting provenance" -> "adding provenance"; "converts a budget into fullness" ->
  "turns a budget into fullness"; "the arithmetic" -> "the sums" (twice); "a fact about the
  transaction" -> "a fact about the deal" (once, in the body; the scene copy was not touched).
  None of these strengthens or weakens a claim.
- **The four-way decay spread was reformatted, not changed.** "quoted at thirty percent, at twenty
  two and a half percent, at twenty to thirty percent, and, for email addresses specifically, at
  up to seventy" became "quoted four ways. At thirty percent. At twenty two and a half percent.
  At twenty to thirty percent. And, for email addresses specifically, at up to seventy."
  Every figure and the word "specifically" survive.
- **Qualifiers deliberately kept:** "to a substantial degree", "mostly bought it as well",
  "probably does not apply to you", "it is mostly not about the fields enrichment appends",
  "a checked absence rather than an omission", "no honest provider quotes a rate before seeing
  the list", "unless the provider passes that through", "which is worth holding next to",
  "it would be a mistake to say your appended phone number is an inference".
- **Verbatim left alone:** the FTC pull-quote scene; "obtain most of their data from other data
  brokers rather than directly from an original source"; "from twenty different sources"; the raw
  data and derived data quotations and the whole boating-licence inference example (left at 58
  words on purpose); "only two of the data brokers allow consumers to correct their personal
  information for marketing purposes"; both HubSpot passages; both Civil Code 1798.106
  quotations and the whole 63-word 1798.140 threshold sentence; the NY Attorney General's
  "any person or business that maintains private information..."; "press release content
  distributed by XPR Media"; "were not involved in the creation of this content"; "3.9 years".
- **Observation for the orchestrator, not a change I made.** The body still says "Our own service
  page uses the word 'verified' and this is the sentence that qualifies it." On the current
  service page the visible prose says "Verify what is there" and "validation"; the literal word
  "verified" now survives only in `seo.description` ("appended and verified"), which is an
  orchestrator field. The sentence is about the claim, so law 1 says it stays, but the two
  surfaces no longer match word for word. Reported, not worked around.
- No invariants violation. No numbers changed.

## 4. CRM SYNC

| surface | grade before | grade after | median after | invariants |
|---|---|---|---|---|
| `/blog/crm-sync-real-estate-duplicate-contact-records` | 8.7 (median 18w) | 5.9 | 11w | PASS x1.00 |
| `/services/crm-sync` | 7.6 (median 14w) | 5.9 | 11w | PASS x1.03 |

Files: `CRM_SYNC_POST` body, `content/blog/crm-sync-scenes.ts`, `content/services/crm-sync.ts`,
`updated:` line in `content/blog/posts.ts` (`2026-08-27` -> `2026-09-18`).

### Judgment calls

- **`lib/blog/flagship.test.ts` failed once and was fixed the way the playbook says: in the SCENE,
  not the body.** My body split produced the short sentence "How many systems have to be joined."
  and "How many fields have to be mapped by hand rather than by name", which the funnel scene's
  footnote echoed. The footnote now reads "How many systems there are to join" and "How many
  fields need mapping by hand". The body kept its wording. Green after the fix: `PASS (388) FAIL (0)`.
- **Governor kept, did not split.** "Any true match whose blocking field is wrong on one side will
  never be looked at, because the two records were never in the same pile"; "It warns that
  collisions between two of them can be more dangerous than collisions between two replaces,
  because some kinds of change need to start from a known base point"; "What no honest build will
  promise is that the matching is never wrong in either direction, because the published model ...
  says you choose between two kinds of error and cannot have zero of both" (left at 41 words in
  the body on purpose); "In June she was talking to a person and gave the formal version, because
  that is what you give a person who is writing something down".
- **A "because" clause I did split, and how the link was kept.** On the service page, FAQ
  "Will it create duplicate contacts?" now reads "... never wrong in either direction. **That is
  because** the published model behind all of this sets its thresholds from the two error rates you
  are willing to accept, and cannot drive both to zero." The causal word is repeated, not dropped.
- **Two sentences that state a joint condition were split with the conjunction preserved.**
  "A rule that works for a lot of small businesses **has two halves.** The most recently changed
  value wins for anything factual ... **And** the CRM wins for anything about the relationship ..."
  Same on the service page's "A common arrangement **has two halves.**" Neither half can now be
  read as the whole rule.
- **"What matters is that A, that B, and that C" became "Three things matter."** followed by the
  three, so none of them reads as the only one.
- **Word swap I want on the record:** two instances of "the specification" became "the standard",
  in the two places where the page already calls the same document "the standard" a sentence later.
  Five other instances of "specification" are untouched. Also: "immaculate" -> "spotless";
  "substitutes for" -> "makes up for"; "unambiguous" -> "unmistakable"; "distributed unevenly" ->
  "spread unevenly"; "propagates out" -> "goes back out"; "the arithmetic" -> "the sums".
- **Qualifiers deliberately kept:** the "might" in the Winkler 20 percent finding, and the sentence
  that tells the reader to read it ("This is the upper end of what a careful file can look like,
  not a property of every file"); "almost never the product of somebody being sloppy"; "probably
  the same person"; "usually in a band somewhere between ten and forty percent"; "no honest build
  will promise"; "a small proportion of the Census forms"; "usually means the matching is too
  confident"; "it is quoted here almost exactly as Winkler writes it".
- **Verbatim left alone:** the whole Fellegi and Sunter decision rule; "no-decision region"; the
  1990 Census 3,000/3 months and 200/6 weeks figures and the missing-field sentence that explains
  them; the RFC 9110 PUT sentence; the RFC 5789 introduction wording and its atomicity rule; the
  idempotence definition and the retry guidance; "the lost update problem"; the HubSpot upsert and
  partial-upsert passages; 162,253, 1,437,026 and the Zabrinsky/Smith comparison; the `pull-quote`
  scene untouched.
- No invariants violation. No numbers changed.

## 5. AI SCHEDULING

| surface | grade before | grade after | median after | invariants |
|---|---|---|---|---|
| `/blog/ai-scheduling-real-estate-showing-confirmations` | 8.5 (median 17w) | 6.0 | 11w | PASS x1.00 |
| `/services/ai-scheduling` | 7.8 (median 14w) | 6.0 | 11w | PASS x1.02 |

Files: `AI_SCHEDULING_POST` body, `content/blog/scheduling-scenes.ts`,
`content/services/ai-scheduling.ts`, `updated:` line in `content/blog/posts.ts`
(`2026-08-27` -> `2026-09-18`).

### Judgment calls

- **`/services/ai-scheduling` lands at exactly 6.0, not in the 5.6-5.9 band.** Every remaining
  long sentence on that page is either an off-limits field (`lede`, `stat`) or a related-post
  excerpt from `posts.ts`. I stopped rather than bend a sentence I own to buy a tenth of a point.
- **`lib/blog/flagship.test.ts` failed once and was fixed in the SCENE.** My body split produced
  "An attendee replied in a way the system did not expect." and the `in-short` scene carried the
  same sentence. The scene now says "An attendee **answered** in a way the system did not expect."
  The body kept the paper's own word. Green after the fix: `PASS (388) FAIL (0)`.
- **Governor kept, did not split.** "It is worth counting them deliberately, because they are not
  all people and they do not all fail the same way"; "There are eight rather than two because the
  standard takes seriously how many different ways a message can fail"; "The standard treats a
  rescheduled appointment as a new question, because that is what it is"; "It cannot see or control
  another office's diary. **So** if a listing agent promises the same slot to somebody else..."
  (the causal word is repeated across the split, not dropped).
- **A conjunction I refused to break.** "If the start time, the end time or the duration of an
  appointment changes, every attendee's answer is deleted and set back to unanswered, on every
  affected occurrence, and it applies to everyone except the organiser." Left at 36 words, because
  splitting it would let the reader take any one of the three triggers, or the exception, on its own.
- **Lists turned into short sentences rather than summarised.** "The three commonest reasons are,
  in order, these. An attendee replied ... None of the offered times worked for everyone. And an
  attendee never replied at all." "A single appointment can produce five messages. A request out.
  A chase. A counter coming back. A confirmation to the other office. And a note to your own
  client." The count "five" is the count of the items already in the sentence, not a new fact.
- **Qualifiers deliberately kept:** "which the authors are careful to say includes small pieces of
  work done by non-expert people"; "a snapshot of one system at one point in its life, rather than
  a ceiling"; "nobody has run anything like this on property appointments"; "it may or may not be";
  "sometimes slower"; "identical inputs may produce different results over time"; "it is not a
  forecast for your Saturdays"; "an escalation means a trained person picked it up, not that the
  meeting failed".
- **Verbatim left alone:** the RFC 6638 pull-quote scene; the RFC 5546 section 2.1.1 sentence and
  NEEDS-ACTION; the COUNTER description; the Microsoft Graph wording including the source page's
  own misspelling "likelhood" and the note that it is "spelled exactly like that on the page";
  "minimumAttendeePercentage" and its description; the fine-tuning caveat; 178 / 1,981 / 1,626 /
  15,659; 32, 27 and 26 percent; 84 / 15 / eleven; 39 and 61 percent; 14%, 8%, 7%, 2%; the
  Cranshaw `sourceText` lines untouched.
- **Word swaps for the grade, meaning-identical:** somebody -> someone, anybody -> anyone,
  everybody -> everyone outside headings; "genuinely good result" -> "truly good result";
  "immaculate" -> "spotless" (in the "look immaculate for a fortnight" test question).
- No invariants violation. No numbers changed.

---

## BATCH 2 CLOSE-OUT

`npx vitest run lib/blog lib/services content app/blog` at the end of the batch:
`PASS (388) FAIL (0)`.

Final scorer sweep, all ten surfaces, run after the last edit:

| surface | grade | median | invariants |
|---|---|---|---|
| `/blog/marketing-automation-real-estate-email-deliverability` | 5.9 | 12w | PASS x1.00 |
| `/services/marketing-automation` | 5.5 | 10w | PASS x1.03 |
| `/blog/ai-audit-small-business-what-not-to-automate` | 5.9 | 11w | PASS x1.00 |
| `/services/ai-audit` | 5.4 | 10w | PASS x1.03 |
| `/blog/data-enrichment-real-estate-stale-contact-records` | 5.9 | 11w | PASS x1.00 |
| `/services/data-enrichment` | 5.8 | 11w | PASS x1.02 |
| `/blog/crm-sync-real-estate-duplicate-contact-records` | 5.9 | 11w | PASS x1.00 |
| `/services/crm-sync` | 5.9 | 11w | PASS x1.03 |
| `/blog/ai-scheduling-real-estate-showing-confirmations` | 6.0 | 11w | PASS x1.00 |
| `/services/ai-scheduling` | 6.0 | 11w | PASS x1.02 |

Files modified in this batch, and nothing else: `content/blog/ai-posts.ts` (five bodies, via
post-body.mjs), `content/blog/{marketing-automation,audit,enrichment,crm-sync,scheduling}-scenes.ts`,
`content/services/{marketing-automation,ai-audit,data-enrichment,crm-sync,ai-scheduling}.ts`,
five `updated:` lines in `content/blog/posts.ts`, and this log. Verified with
`git diff --numstat` on `posts.ts`: 5 lines changed, 5 lines removed, and they are the five
`updated:` values. Verified with a diff filter that no `/** */` or `//` comment line changed in any
of the ten content files. Verified that `eyebrow`, `title`, `lede`, `specs`, `why`, `keywords`,
`seo` and `stat` were not touched on any service page (their diffs against `6eab055` are the
orchestrator's own earlier rewrite, already in the working tree before this batch started).
Zero em dashes, en dashes or arrow glyphs added: the only ones in these files are pre-existing and
inside provenance comments. Nothing was committed, staged or stashed.

### For the orchestrator

1. `/services/ai-scheduling` sits at exactly 6.0. It passes, but it has no headroom, and every
   further long sentence on it belongs to an orchestrator field or to a related-post excerpt.
2. The data enrichment body still says "Our own service page uses the word 'verified' and this is
   the sentence that qualifies it." On the service page the word "verified" now survives only in
   `seo.description`; the visible prose says "Verify what is there" and "validation". Law 1 keeps
   the body sentence (it is about the claim), but the two surfaces no longer match word for word.

### Late self-check, after the close-out table was first written

Re-reading my own AFTER against the BEFORE turned up three splits that had bent something, and all
three were reverted or repaired before the final scorer run. They are listed here because they are
exactly the class of error batch 1 shipped.

1. **AI SCHEDULING body.** "It is entirely recoverable by saying, on Thursday, that you are waiting
   on the listing side" had become "It is entirely recoverable. Say, on Thursday, ..." That turns a
   description of how it is recoverable into an instruction. Reverted to the one sentence.
2. **CRM SYNC body.** "published a formal mathematical model **for** ideas Newcombe had introduced
   ten years earlier" had become "published a formal mathematical model. It set out ideas Newcombe
   had introduced ten years earlier", which reads as restating rather than formalising. Reverted.
3. **CRM SYNC body.** The "because" that explains why Winkler's overview is the clearest had been
   dropped on a split. The governor is now repeated: "It is the clearest **because** the Census has
   the hardest version of this problem in the country, and has been working on it since the 1950s."

The two repairs cost one sentence each, which moved the crm sync post from 5.8 to 5.9 and the
scheduling post from 5.9 to 6.0. Both still pass. Final numbers above are post-repair, and
`npx vitest run lib/blog lib/services content app/blog` was re-run afterwards: `PASS (388) FAIL (0)`.

---

# BATCH 3

Builder: batch-3 agent, 2026-09-18. Method and laws: `SIMPLIFY-PLAYBOOK-20260918.md`, plus the
two sections batches 1 and 2 paid for (never split a clause away from its governor; before you
split at a colon, a "that" or a modal, ask what the first half was doing to the second half).
BEFORE = `6eab055`. Baselines below were measured on the dev server at the start of this batch,
so they already include the orchestrator's excerpt and author-card work.

## 1. AI AGENT WORKFORCE

| surface | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/ai-agent-workforce-real-estate-assistants` | 8.3 | **5.9** | 15w | 12w | PASS x1.03 |
| `/services/ai-agent-workforce` | 6.5 | **5.4** | 12w | 11w | PASS x1.05 |

`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`.
` because ` in the body: 17 -> 16. ` which `: 22 -> 16. Paragraph count 109 -> 109.

### `updated` date

`AI_AGENT_WORKFORCE_POST` had **no** `updated` line and a `/** NO \`updated\` ... */` comment
explaining why. Per the brief, `updated: "2026-09-18"` was added directly ABOVE that comment and
the comment was left untouched. **The comment now contradicts the line above it and is the
orchestrator's to update.**

### Glosses added (word for word)

1. body, Berkeley paragraph: "A trace is the record of one whole run."
2. body, same paragraph: "...built a taxonomy of what went wrong, **which is a named list of the
   kinds of failure**, by having six human experts read a hundred and fifty traces closely."
3. body, cost section: "The reason is that they are quoted per million tokens. **A token is a
   small piece of text.** That price means nothing until somebody knows how many tokens your job
   takes."
4. scenes `NOT_A_CHATBOT[0]`: "It is standing context, **meaning it does not start from nothing
   each time**." (the body's own "A general chat session starts empty" is the same claim.)

### Non-trivial word swaps

- "domain" -> "task set" for tau-retail / tau-airline, and "Two domains:" -> "There are two of
  these businesses." Safe on THIS page because the chart labels already read "Simple task set" /
  "Complex task set" and `RULES_REMOVED.basis` already equates them ("The simple task set is a
  retail domain of 115 tasks"). "domain" survives in that basis line, untouched.
- "The model is a commodity" -> "The model is an off-the-shelf part."
- "the honest specification for what running this well requires" -> "the honest list of ...".
- "delegating licensed work" -> "handing out licensed work". "delegable" is gone from all four
  places it appeared in this topic: two body sentences ("cannot yet be handed to anybody at all",
  "can truly be handed over"), the `offer` and `funnel` scenes, and the service page's
  `howItWorks[0]` ("Repeating is what makes a job one you can hand over"). It is not a keyword.
- "indistinguishable in tone from the nine" -> "a piece of work whose tone was exactly like the
  nine" (the batch-2-approved rendering; "in tone" kept, because it was the precise claim).
- "did not hallucinate anything" -> "did not make anything up".
- "configuration change" kept in the scene, "settings change" used in the body (they were already
  two different sentences; keeping them different keeps `flagship.test.ts` green).
- "buys unpredictability nobody asked for" -> "makes the result harder to predict, which nobody
  asked for".
- FAQ "buys accountability, judgement and somebody who notices when the job changes" -> "buys
  somebody who can be held responsible, somebody with judgement, and somebody who notices when the
  job changes" (same three things, named the way the body names them).
- service page `whatItIs[1]`: "The unlock is parallelism." -> "The gain is that they all run at
  once." **"unlock" is on the playbook's banned hype list and this was a pre-existing instance in
  a field that IS mine; it is gone.** "in parallel" also became "at the same time" in
  `howItWorks[2]` and `faqs[1]`; the phrase survives untouched in `specs`, which is not mine.
- service page: "triages overnight email" -> "sorts the overnight email by what matters";
  "the expiring contingency" -> "the contingency about to run out".

### Places I deliberately did NOT split

- "Now run the same tasks eight times each, and require all eight to be right." Two joint
  conditions; the original was one sentence and stays one.
- "Give it an input with a contradiction in it, or a case the brief does not cover, and find out
  whether it stops and asks or whether it decides." Same reason.
- "Set that beside four assistants running overnight with nobody reading the output after day
  four, and you have the honest list of what running this well requires." Imperative + consequence
  in one sentence; splitting would make the first half a standalone order.
- "Two parts of [the booklet] are worth reading, because neither is about artificial intelligence
  and both are about you." Kept whole so the "because" and the "neither/both" pair stay attached.
- Section 442-c's 36-word statutory sentence ("actual knowledge of the violation ... after notice
  of the misconduct") is left long and verbatim. It is the longest sentence on the page.
- Section 175.21's "regular, frequent and consistent personal guidance, instruction, oversight and
  superintendence, with respect to the brokerage business and all matters relating to it" left
  verbatim; only the lead-in around it was split.
- BLS's "the median wage is the wage at which half the workers in an occupation earned more than
  that amount and half earned less" left verbatim.
- tau-bench's "the chance that all k independent attempts are successful, averaged across tasks"
  left verbatim, with a plain lead-in ("They named it pass hat k, and they defined it as ...").
- "arbitrary" kept in "where the rules are specific and arbitrary in the way real business rules
  are". It is a hard word, but glossing it would have added a claim about who set the rules.
- Every "should" in the service page FAQ about what a serious build does was kept as "should".
- The colons that were introducing lists were all reopened with the word the colon was lending:
  "It is system design. **That group covers** ...", "is the document. **It holds** ...",
  "**That category holds** ...", "**That means** the right permissions ...", "Two more limits are
  worth knowing. **The first is that** ... **The second is that** ...", "There is no price here ...
  **The first is** ... **The second is** ... **The third is** ...".

### Self-check repairs made before the final scorer run

1. "And it produced work that sounded exactly like the nine that were correct" had dropped the
   original's "in tone". Restored as "a piece of work whose tone was exactly like the nine".
2. "The most common single mode, at 15.7 percent of everything, is step repetition" had dropped
   "Their", which was attributing the figure to the paper. Restored to "Their most common single
   mode ...".

### Unresolved

None. No invariants violation on either surface.

## 2. THE SINGULARITY

| surface | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/the-singularity-self-improving-ai-system` | 8.3 | **5.9** | 17w | 13w | PASS x1.02 |
| `/services/the-singularity` | 6.6 | **5.2** | 13w | 11w | PASS x1.03 |

`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`.
` because ` in the body: 31 -> 30. ` which `: 51 -> 33. ` only `: 11 -> 11. Paragraphs 134 -> 134.

### `updated` date

`SINGULARITY_POST` had **no** `updated` line and a `NO updated, for the same reason ...` provenance
comment explaining why. `updated: "2026-09-18"` was added directly ABOVE that comment; the comment
was not touched. **It now contradicts the line above it and is the orchestrator's to update.**

### The repositioning, checked line by line

Every sentence that carries the owner's 2026-08-27 reposition was re-read against the BEFORE and
is intact. The gate sentences, in full, after the rewrite:

- body: "It is that nothing it writes reaches anybody until two things have happened. A test suite
  that cannot be talked round has to run over it. And a person has to read the change and say yes."
  (BEFORE was one sentence joined with "and"; the split names both halves as required, not either.)
- body: "However long it worked alone, nothing it wrote ships until the tests have run and a person
  has said yes." (wording unchanged, only the colon before it removed.)
- body limits: "Not one of them reaches a client until the tests have run over it and a person has
  read it and approved it." (kept whole, deliberately not split.)
- FAQ: "A change ships only if it wins, and only after a person approves it." (both "only"s kept.)
- FAQ: "Every change runs against a test suite first, and a person reads it and approves it before
  it ships." (unchanged.)
- service `limits[0]`, `howItWorks[3]`, `faqs[1]`: "only if it wins, and only after you approve it",
  and "until the tests have run over it and you have read it and approved it". Both "only"s and the
  conjunction are kept in every one.
- memory: "It keeps what it has learned about your business in files it has to read again before it
  starts anything", and the scene's "kept in files rather than inside a model", are intact in
  substance. Nothing was reworded into a model that learns you.
- autonomy: "it proposes one change at a time" is verbatim. "unattended for hours or days" keeps
  "depending on the task" and keeps "while the gate stays exactly where it was".

` only ` in the body is 11 before and 11 after, which is the mechanical check on this.

### Glosses added (word for word)

1. body, compiler section: "In software there is a compiler and a test suite. **A compiler is the
   program that turns written code into something a machine can run.** Both of them will tell you
   flatly that you are wrong, and neither cares how confident you sounded."
2. service `whatItIs[1]`: "checkpointing as it goes" became "**saving its place** as it goes".
3. service `faqs[3]`: the three contract asks were re-opened with the word the colon had been
   lending them, and a count was added: "Both are worth asking in writing rather than assuming.
   **Ask for three things.** That your conversations are stored in an environment you control. That
   they are not used to train anything general. And that they can be deleted on request." The count
   matches the next sentence's own "the same three lines".

### Non-trivial word swaps

- "intrinsic self correction", "oracle condition", "ablation", "ground truth", "CACE", "Reflexion",
  "HumanEval" and "proprietary" all KEPT. Source register, source names, or the paper's own term.
- "a fluent sentence" became "a smooth sentence"; "plausible" became "believable" in three places;
  "the review manufactures a reason" became "the review makes up a reason".
- "arrangement" became "setup" in three places ("Neither setup had a memory", "Nothing about the
  setup produces an hour", "whether anything in the setup is able to tell it no"). One
  "arrangement" survives, in the scenes file, where it reads best.
- "capable of saying no" became "able to say no", twice. The claim is identical.
- "a very particular signature" became "a shape all of its own".
- "reconcile it by hand" became "match the four sets up by hand".
- "optimises the measurement" became "improves the measurement".
- "the majority of proposed changes will fail" became "most proposed changes will fail" (batch 2
  judged that pair as the same quantity).
- "the apparatus for measuring it" became "the tools for measuring it". ONE instance only; the
  second, "the argument for the whole apparatus", is kept.
- "it removes repetition from the first conversation onwards" became "it stops a client having to
  repeat themselves from the first conversation onwards", in the body and in service `faqs[4]`.
- "standing constraints" became "the limits that always apply" in the body's list of what persists.
  The service page's `faqs[1]` keeps "standing constraints", which is where the phrase is
  load-bearing.
- "compounding" became "building up" in `limits[6]`. "identified and reversed rather than debated"
  became "spotted and reversed rather than argued about".
- service `useCases[1]`: "not a feature so much as the removal of" became "not so much a feature as
  the removal of". Word order only; the original reads as a slip.

### Places I deliberately did NOT split

- "Not one of them reaches a client until the tests have run over it and a person has read it and
  approved it." Both gates in one sentence, on purpose.
- "If it comes out better you cannot say which change did it, which one to keep, or whether two of
  them are cancelling each other out." Condition plus list.
- "If a person explains their situation on the phone on Tuesday and then explains it again to the
  website on Thursday, that is not a technical fault a smarter model fixes." Two joint conditions,
  which is the batch-1 shape exactly. Left at 31 words.
- "To be exact: if the change that shipped three weeks ago turns out to be the reason something got
  worse, what is the sequence, who runs it, and how long does it take." One question.
- "When the change is code, what they are reading is the difference between two files, and the list
  of tests that went green underneath it." Joint object.
- "And the paper behind the first chart on this page lists Reflexion, for its reasoning results
  rather than its coding ones, in its own table of studies whose reported gains lean on knowing the
  right answer." 36 words, left whole: the two qualifiers are the whole point of the footnote.
- Both verbatim block quotations (the CACE "applies not only to input signals ..." sentence and the
  configuration-debt pair) and the Microsoft sentence ("Evaluating well-designed and executed
  experiments ... only about one-third were successful at improving the key metric!") are untouched,
  exclamation mark included. "In the paper's words, if the answer is already correct, no further
  self correction will be performed" is untouched.
- "Most Ideas Fail to Show Value" left exactly as the section title it is.
- Colons that were introducing lists were reopened with the word they had been lending: "It changes
  two things. **The first is** ... **The second is** ..."; "Two things ... **The first is** one
  memory ... **The second is** a loop ..."; "Everything is held constant. **That means** the same
  model, the same questions, the same three step prompting."; "And it can do something about it.
  **It can change** the instructions. **It can change** the routing."

### Unresolved

None. No invariants violation on either surface. Nothing in `lib/blog/zombie-claims.test.ts` came
back: "improves faster than you can shop for a replacement", "remembers everything" and "gets
better with every deal" are all still absent, and the suite is green.

### One flag for the orchestrator, raised honestly

The brief's line "The MAST chart copy stays as adjudicated" sits under this topic, but MAST
(arXiv:2503.13657) is not cited on the Singularity pages at all. It is topic 1's `WHERE_FAIL`
chart. I read that as being about the adjudicated NUMBERS and their framing, and on that reading
nothing moved: the bars 44.2 / 32.3 / 23.5, the caption, the 1,642-trace sample, the `sourceText`
and the whole provenance comment (including the trap about 41.8 / 36.9 / 21.3 and the 210-trace
figure) are byte-identical. What I did change in that scene is prose only, in `basis` and `note`:
four sentence splits, "transfers" to "carries over", and nothing else. The one word swap I drafted
there ("probability" to "chance") I reverted, because it is a statistical term inside a chart note.
If "stays as adjudicated" was meant to freeze those two strings entirely, they are the two to
revert, and topic 1's blog page has 0.1 of headroom, so a revert would need a compensating split
elsewhere.

## 3. CUSTOM AUTOMATION

| surface | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/custom-automation-real-estate-bespoke-build` | 8.2 | **5.9** | 16w | 13w | PASS x1.01 |
| `/services/custom-automation` | 6.7 | **5.9** | 13w | 12w | PASS x1.05 |

`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`.
` because ` in the body: 16 -> 16. ` which `: 13 -> 5. Paragraphs 113 -> 113.
`updated:` in `content/blog/posts.ts` moved `2026-08-27` -> `2026-09-18` (that line only).

### Glosses added

None. This topic needed no new definition: the two technical terms it turns on (a breaking change,
and an open versus a closed fixed-value field) are already defined in the body by Stripe's own
wording, which is left verbatim.

### Non-trivial word swaps

- "it is simply where the incidence falls" became "it is simply where the cost falls". "Incidence"
  is the economics term for exactly this and it is the one word on the page a ten year old could
  not get from context.
- "every specific accommodation is a thing the next change has to be careful of" became "every
  special fitting is a thing the next change has to be careful of".
- "fit is also what makes it rigid" became "fit is also what makes it hard to change".
- "The resolution is not to build something generic" became "The answer is not to build something
  generic".
- "a conservative estimate" became "a cautious estimate"; "deployed" became "put to work";
  "catastrophic" became "terrible"; "the technology being immature" became "the technology not
  being ready"; "credentials" became "logins" (the page's own calculator hint already says
  "Count anything with its own login").
- "reconciling what does not match" became "matching up what does not agree" (scene).
- "the cost of the next change stopped being proportional to the size of the change" became
  "stopped rising in step with the size of the change" (scene).
- "It accumulates, one tool at a time" became "It builds up, one tool at a time"; "a wall nobody
  maintains" became "a wall nobody looks after" (plate caption).
- "genuinely" became "truly" in three body places and one scene place; "actually" became "really"
  in three body places. Never inside a quotation.
- "the constraint is manual process" became "the thing holding you back is manual process";
  "a reason to migrate your CRM" became "a reason to move your CRM" (service page).
- Left alone on purpose: "commission", "infrastructure", "extrapolated", "organisations",
  "documentation", "incompleteness", "exhaustive" (Stripe's word), "bespoke".

### One rewrite that changes an emphasis, flagged

The body's "building on a preview is building on something whose owner has **explicitly promised
you nothing**" became "building on a preview is building on something **the owner's own policy
leaves out of the promise**." Same fact, and it keeps the explicitness where the original put it
(in the policy), but it is the one sentence in this topic where I moved the emphasis rather than
only the words. The paragraph above it still carries the operative sentence verbatim: "The
commitment does not apply to anything that has not reached general availability."

### Places I deliberately did NOT split

- The semver rule, 33 words, verbatim from semver.org: "Increase the major version when you make
  incompatible API changes, the minor version when you add functionality in a backward compatible
  manner, and the patch version when you make backward compatible bug fixes."
- Stripe's "new values can be added as a backward-compatible change without requiring an API
  version upgrade", and their advice, "Do not assume that the documented values are exhaustive,
  and write code that handles a value it has never seen."
- The `pull-quote` scene (Google Cloud Terms 1.4(e)) untouched, and the phrase "a substantial
  economic or material technical burden" left verbatim everywhere it appears.
- Microsoft's "a minimum of twelve months' notice where no successor product is offered" and its
  exclusion of free services and preview releases; Meta's "guaranteed for two years" with the
  clock starting on the NEXT version; the "Example Only" caption; all of 59.5 / 38.3 / 21.2 /
  1,471 / 241 billion / 17 percent / one percent.
- "When the expensive part of your week is carrying something from one system to another, and
  matching up what does not agree, there is no product to buy." A condition, kept whole at 28
  words.
- "The more the first version was made to fit exactly how you worked in the month it was written,
  the more expensive the second version is." A correlative; splitting it breaks the comparison.
- "Where the answer is that the missing output would tell you, ask what that output looks like on
  a quiet week, and watch what happens." Condition plus two joined instructions.
- "Something nobody would miss for a month is one of two things. **Either** it is not worth
  automating, **or** it is worth automating and nobody has been made responsible for it." The
  either/or was made explicit rather than split into two flat claims.
- FAQ "The honest order is to look hard for a product first, **and to build only** where the
  search truly comes up empty." Both halves are one described sequence, so both stayed
  infinitives rather than becoming an order.
- Three splits use a "Say ... Then ..." frame ("Say the decisions are gathered in one step ...",
  "Say a build keeps a plain record of every run ...", "Say the same decision is written in four
  places ..."). Batch 1 warned about that frame, so in every one of the three the consequence
  sentence opens with "Then", which keeps the condition grammatically live.

### Unresolved

None. No invariants violation on either surface.

## 4. DOCUMENT PROCESSING

| surface | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/document-processing-real-estate-contract-deadlines` | 8.2 | **5.9** | 16w | 12w | PASS x1.01 |
| `/services/document-processing` | 6.5 | **5.6** | 12w | 11w | PASS x1.03 |

`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`.
` because ` in the body: 17 -> 17. ` which `: 29 -> 22. Paragraphs 120 -> 120.
`updated:` in `content/blog/posts.ts` moved `2026-08-27` -> `2026-09-18` (that line only).

This topic has the highest proportion of verbatim source text in the batch, and the four longest
sentences on the finished page are all quotations. That is why it is the one page in the batch
that took two rounds of ordinary splitting to reach 5.9.

### Glosses added

None. The one technical term that needed explaining, Levenshtein similarity, was already glossed
in the scene's `basis` line; that gloss was split into two sentences and not changed.

### Non-trivial word swaps

- "the lender's obligations rather than yours" became "the lender's duties rather than yours"
  (the obligation/duty pair batch 2 judged and accepted).
- "Those are conversations rather than configuration" became "rather than settings".
- "Extraction is a convenience layer" became "Extraction is a handy layer".
- "has made a substitution nobody asked it to make" became "has made a swap nobody asked it to
  make".
- "genuinely ambiguous" (scene) became "truly unclear"; "genuinely hard" became "truly hard";
  "aspirational" became "hopeful"; "brings in an assertion from a company" became "brings in a
  claim from a company"; "a tractable problem" became "a problem that can be solved at all".
- "legibility and importance run in opposite directions" became "how readable a thing is and how
  much it matters run in opposite directions".
- "that geometry is baked in" became "that shape is baked in"; "is not recoverable further down
  the chain" became "cannot be got back further down the chain".
- "demonstration" became "demo" in three of six places; the FAQ's "offers to show you a demo
  instead has answered a sixth question you did not ask" keeps the sting.
- Left alone on purpose: "consummation", "rescission", "contingency", "addendum", "abstention"/
  "abstains", "Levenshtein", "F1", "precision", "recall", "corpus", "born digital", "dpi".

### Places I deliberately did NOT split

- The ESIGN retention rule. It was 81 words; it is now two sentences of 25 and 56, and BOTH
  quoted fragments are byte-identical ("accurately reflects the information set forth in the
  contract or other record" / "remains accessible to all persons who are entitled to access by
  statute, regulation, or rule of law, for the period required by such statute, regulation, or
  rule of law, in a form that is capable of being accurately reproduced for later reference,
  whether by transmission, printing, or otherwise"). The join was changed from "and which" to
  "It has to be a record which also", which keeps the requirement and adds no new claim.
- 12 CFR 1026.2's second definition, with its whole list of paragraph numbers, left at 47 words.
- 12 CFR 1026.19's three quoted deadlines, the FUNSD corpus description, the FUNSD sampling
  sentence, the FUNSD caveat about optimal word grouping, the DocVQA corpus wording, the ESIGN
  opening clause, and the commentary's "State law governs" and "is a matter to be determined
  under applicable law": all untouched.
- The `pull-quote` scene (12 CFR 1026.2(a)(13), "Consummation means the time that a consumer
  becomes contractually obligated on a credit transaction") untouched.
- "Suppose the printed clauses are located and read cleanly, and two lines written into a margin
  are not located at all." Two joint conditions in one sentence.
- "It cannot know which of those two definitions the drafter had in mind, because that
  information was never on the page." The because is the whole point.
- Every `should` on the service page and in the body's design argument ("anything the system is
  not confident about **should** be flagged for a person") kept as `should`. The provenance
  comment on `content/services/document-processing.ts` bans the word "never" on that page; I
  checked the finished file and introduced none.
- All three charts keep every number, label, `display` string, `sourceText` and `sourceHref`:
  94.4 / 76.4, 0.57 / 0.04 with 99.2 and 2.1 in the note, and 94.36 / 87.0 / 77.0.

### Self-check repair made before the final scorer run

The ` because ` count came back 17 -> 13 on the first pass. I found the four dropped connectives
by diffing the because-bearing sentences and restored all four: the "three articles sit near this
one" opener, "the output is data rather than a document", "now read that first bar against the
thing it is really competing with", and "one more thing is worth knowing before you build any of
this". Count after the repair: 17 -> 17.

**Two more of the same class were found and repaired in earlier topics by the same check**, after
those topics had already been logged:

- AI AGENT WORKFORCE, the BLS paragraph: "Median means what the Bureau says it means, and the
  Bureau's own words are worth quoting. **That is because** half of the sums in this field depend
  on people not knowing them." (the `because` had been dropped on the split.) Both scorers re-run:
  gate 5.9, invariants PASS at x1.03.
- THE SINGULARITY, after the loop diagram: "That is worth knowing when somebody shows you one.
  **That is because** a weekly summary of what your agents did is a reporting feature with an
  impressive vocabulary." Both scorers re-run: gate 5.9, invariants PASS at x1.02.

### Unresolved

None. No invariants violation on either surface.

## 5. REVIEW AUTOMATION

| surface | grade before | grade after | median before | median after | invariants |
|---|---|---|---|---|---|
| `/blog/automated-google-review-requests-real-estate` | 8.3 | **5.9** | 16w | 12w | PASS x1.02 |
| `/services/review-automation` | 6.8 | **5.9** | 14w | 12w | PASS x1.01 |

`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`.
` because ` in the body: 14 -> 14. ` which `: 18 -> 7. Paragraphs 97 -> 97.
`updated:` in `content/blog/posts.ts` moved `2026-08-27` -> `2026-09-18` (that line only).

### Gloss added (word for word)

One, in the body, after the Luca ablation sentence: "On that comparison, an exogenous one-star
improvement leads to roughly a 9% increase in revenue. **Exogenous here means the change came
from the rounding rather than from the restaurant.**" The paper's own word is kept, and the gloss
is exactly what the two sentences before it have already set up.

### Non-trivial word swaps

- "a large asset in your credibility" became "a large asset in how much you are believed".
- "it is simply where the incidence falls" does not appear on this page; the parallel swap here
  was "articulated" to "put into words" and "optimise for" to "aim at".
- "What actually recurs is the messaging" became "What actually comes round again and again is
  the messaging".
- "there is very little proprietary technology in this category" became "very little technology
  of their own".
- "a small and unglamorous piece of plumbing" became "a small and dull piece of plumbing".
- "There is no notification for it" became "There is no alert for it"; "extremely common" became
  "very common"; "you get told immediately" (service) became "you get told straight away";
  "the automatable half" (scene) became "the half you can automate".
- "asking is genuinely awkward" became "asking is truly awkward"; "genuinely useful to a small
  business" (scene) became "truly useful".
- "almost nobody asks consistently" (service `whatItIs[0]`) became "almost nobody asks every
  time", and the FAQ's "the ask is inconsistent and late" became "the ask is late, and it does
  not happen every time". Both keep the claim; neither is a hedge change.
- Left alone on purpose: every word of Google's contribution policy and of 16 CFR 465.7,
  including "selectively solicit positive reviews", "discourage or prohibit negative reviews",
  "materially misrepresent, expressly or by implication", "regardless of sentiment", and the
  whole carve-out list; "review gating", "recency", "exogenous", "statistically insignificant",
  "independent", "misrepresentation", "incentives", "solicit", "premises".

### Places I deliberately did NOT split

- 16 CFR 465.7(b) as the body states it, 55 words. It is the longest sentence on the page and it
  is a careful restatement of a rule in the rule's own register.
- The carve-out list, 48 words, left as one sentence with its colon intact.
- Google's permission sentence ("solicit or encourage content that represents a genuine
  experience, without offering incentives and without attempting to influence the rating or the
  contents of the review"), and the FAQ's shorter version of the same.
- "A block of reviews that implies it represents most or all of what customers submitted, while
  quietly holding back the low ones, is the thing the rule describes."
- "If you have ever been told to ask clients to mention the town you want to rank for, that is
  the sentence it collides with."
- The `pull-quote` scene ("A profile with nothing but fives on it has told a stranger one thing,
  and it is not that you are good...") is untouched. **I split it once by mistake and the
  invariants script caught it as "quote BENT or LOST"; it was reverted before the final run.**
  That is the only invariants failure anywhere in this batch and it is resolved, not worked
  around. Neither `REWRITE-INVARIANTS-BEFORE-20260918.json` nor the ALLOW file was edited.
- The staged transcript turns in the service page `figure` and in the `the-ask` scene are
  dialogue and were not touched.

### One repair the zombie test caught, and it is worth the next builder's attention

`lib/blog/zombie-claims.test.ts` went red on my first pass at this topic. The retired claim is
the unsourced 73%, and the test lets a line mention it only when a disowning phrase sits within
two lines of it. The BEFORE carried that phrase as "the **unsourced** figure"; my rewrite had
swapped it to "the sourceless figure", which is a plainer word and which silently removed the
page's own disavowal from the test's window. Restored to "the unsourced figure", and the suite is
green. **The lesson for the next batch: a word can be load-bearing for a committed test as well
as for a reader, and on this cohort the disowning vocabulary ("unsourced", "does not use",
"refuses", "no published") is exactly that.**

A second repair, from the same ` because ` diff used on the other topics: "The average is the
least interesting thing on the page after the first two seconds. **That is because** everybody in
your market has a good one."

### Unresolved

None. Both scorers PASS on both surfaces and the suite is green.

---

# BATCH 3 CLOSE-OUT

| surface | grade before | grade after | median after | invariants |
|---|---|---|---|---|
| `/blog/ai-agent-workforce-real-estate-assistants` | 8.3 | 5.9 | 12w | PASS x1.03 |
| `/services/ai-agent-workforce` | 6.5 | 5.4 | 11w | PASS x1.05 |
| `/blog/the-singularity-self-improving-ai-system` | 8.3 | 5.9 | 13w | PASS x1.02 |
| `/services/the-singularity` | 6.6 | 5.2 | 11w | PASS x1.03 |
| `/blog/custom-automation-real-estate-bespoke-build` | 8.2 | 5.9 | 13w | PASS x1.01 |
| `/services/custom-automation` | 6.7 | 5.9 | 12w | PASS x1.05 |
| `/blog/document-processing-real-estate-contract-deadlines` | 8.2 | 5.9 | 12w | PASS x1.01 |
| `/services/document-processing` | 6.5 | 5.6 | 11w | PASS x1.03 |
| `/blog/automated-google-review-requests-real-estate` | 8.3 | 5.9 | 12w | PASS x1.02 |
| `/services/review-automation` | 6.8 | 5.9 | 12w | PASS x1.01 |

`npx vitest run lib/blog lib/services content app/blog` -> `PASS (388) FAIL (0)`, run in the
foreground after every topic and again at the end.

**Paragraph counts are identical in all five bodies** (109, 134, 113, 120, 97), so nothing was
added, dropped or reordered.

**` because ` is flat in all five bodies**: 17/17, 31/31, 16/16, 17/17, 14/14. That is batch 2's
residue closed. It took a deliberate repair pass on four of the five topics: I diffed the
because-bearing sentences BEFORE against AFTER and restored eight dropped connectives as
"That is because ...". ` which ` fell from 137 to 83 across the five, which is the intended half
of the same trade.

**Files touched**, and nothing else: `content/blog/ai-posts.ts` (five bodies, all via
`post-body.mjs inject`), the five scenes files, the five service files, five `updated:` lines in
`content/blog/posts.ts`, and this log. `git diff` over `content/` filtered to comment lines
returns **nothing**, so no provenance comment moved. `git diff --numstat` on `posts.ts` is
5 insertions and 3 deletions, which is the three date replacements plus the two date lines added
above their "NO `updated`" comments.

**Mechanical sweep, clean:** zero em dashes, en dashes or arrow glyphs anywhere in the ten files'
prose or in the five rewritten bodies, and zero hype words (`seamless`, `game-chang*`, `unlock`,
`supercharge`, `revolutionar*`, `effortless`, `cutting-edge`, `turnkey`). One PRE-EXISTING
"unlock" was removed: `content/services/ai-agent-workforce.ts` `whatItIs[1]` opened "The unlock is
parallelism"; that field is mine to edit and it now reads "The gain is that they all run at once."

### Two things for the orchestrator

1. **Two `updated:` lines were ADDED above provenance comments that say the post has none.**
   `SINGULARITY_POST` and `AI_AGENT_WORKFORCE_POST` both had a `/** NO \`updated\` ... */` block
   explaining the absence. Per the brief the line went in directly above each comment and the
   comments were left untouched, so both comments now contradict the line above them. Those two
   comments are the orchestrator's to update.
2. **The brief's line "The MAST chart copy stays as adjudicated"** is filed under the Singularity
   topic, but MAST (arXiv:2503.13657) is cited only on the AGENT WORKFORCE pages, in the
   `WHERE_FAIL` chart. I read it as being about the adjudicated numbers and kept every one of
   them, the caption, the sample, the `sourceText` and the whole provenance comment byte for
   byte. What did change in that scene is prose only, in `basis` and `note`: four sentence splits
   plus "transfers" to "carries over". The one word swap I drafted there ("probability" to
   "chance") was reverted, because it is a statistical term inside a chart note. If the intent
   was to freeze those two strings entirely, they are the two to revert, and that page has only
   0.1 of headroom, so a revert needs a compensating split elsewhere on it.

# BATCH 4

Six topics: AI appointment booking, workflow automation, AI voice agents, lead qualification,
database reactivation, AI chat assistant. BEFORE = `6eab055`. Both scorers run per surface after
every file. ` because ` counted over the topic's THREE files together (body md + scenes + service),
before and after, which is what batch 3's checker asked for.

## 1. AI APPOINTMENT BOOKING

| surface | grade before -> after | median before -> after | invariants |
|---|---|---|---|
| `/blog/ai-appointment-booking-no-shows-real-estate` | 8.1 -> **5.9** | 17w -> 12w | PASS (5895 -> 5953 words, x1.01) |
| `/services/ai-appointment-booking` | 6.6 -> **5.8** | 12w -> 11w | PASS (1578 -> 1616 words, x1.02) |

` because ` over body + `booking-scenes.ts` + `ai-appointment-booking.ts`: **30 -> 30** (body 19 -> 19,
scenes 8 -> 8, service 3 -> 3). Every reason that was a reason still is one; four splits reopened with
"That is because ...". `git diff 6eab055` on the scenes file changes **0 comment lines**. Vitest
`lib/blog lib/services content app/blog`: PASS (388) FAIL (0). `updated:` set to 2026-09-18 (the post
already had the line; the provenance comment under it was left alone).

Judgment calls, word for word:

- **No gloss was added anywhere in this topic.** Nothing needed one: the two technical terms the post
  introduces (a free and busy query, the METHOD property) are already explained by the page in its own
  next sentence, and adding a second explanation would have been a new claim about a standard.
- **Systematic swap: `somebody` -> `someone`, `anybody` -> `anyone`, `everybody` -> `everyone` in prose.**
  Pure register, no meaning change, and it is what the invoicing exemplar did. `nobody` was NOT swapped
  (the register change to "no one" is bigger than the gain). The two FAQ headings that contain
  "somebody" ("How is this different from sending somebody a booking link?", "What if somebody wants a
  time I do not have?") are headings and are untouched, as is "The gap nobody measures".
- Non-trivial word swaps, all in the body or scenes: "motivated" -> "keen" (of the person who messaged
  on Sunday); "obligation" -> "duty" (`WHY_THEY_DROP[1]`); "none of it is recoverable" -> "none of it
  can be won back" (`WHY_THEY_DROP[0]`); "volume amplifier" -> "turns up the volume"
  (`FAILURE_MODES[0]`); "element" -> "part" (`FAILURE_MODES[2]`); "arithmetic" -> "sums" (twice, the
  calculator note and the body's "ran the arithmetic the other way"); "proportion" -> "share";
  "industry" -> "trade" in one body sentence only (the calculator note's "for this industry" is the
  keyword-adjacent one and was left); "competitor" -> "rival" (`whatItIs[0]`); "consistently" ->
  "every time" (`useCases[2]`); "mutually free hour" -> "an hour that is free for both"
  (`useCases[1]`); "distinction" -> "difference" twice; "demonstrate" -> "show".
- **Colons reopened with their governor, never split flat.** `REMINDERS.note`'s "Two things do carry"
  became "The first is that ... The second is that ...". The offer scene's two-item colon became
  "One is ... The other is ...". The funnel footnote's two-item colon became "The first is ... The
  second is ...". The calculator note's "for the same reason:" kept its reason in one following
  sentence rather than two.
- **"then" added to close an "if"** in two places, per batch 3: the body's "Say you already override
  the calendar three times a week because it is wrong. Then a machine reading it will be wrong three
  times a week too."; `limits[4]` "If half your commitments live in someone's head, **then** a system
  reading the calendar will offer a slot ..."; `FAILURE_MODES[0]` "If nothing sits between the inquiry
  and the calendar, **then** you will spend Saturday ...".
- **Conditional rewritten with an explicit subject** in `howItWorks[1]`: "Where an appointment also
  needs somebody outside your office, **their** agreement is ..." became "Say an appointment also needs
  someone outside your office. Then **that person's** agreement is ...". "Their" would have pointed at
  "appointments" after the split; naming the person fixes it and changes nothing else.
- Places I deliberately did NOT split:
  - The RFC 5545 sentence (40w). It reproduces the specification and stays verbatim, with its lead-in
    moved out in front of it ("The standard says that ...").
  - The Google Calendar API documentation sentence (37w). Same reason; the lead-in was split off.
  - "It is whether the person on the other end gets something their calendar treats as an invitation,
    with an alarm attached, **and whether** you find out when they accept it." (30w) Two joint tests of
    one question; splitting would make either one sufficient.
  - "They estimated that **if** every appointment in the resident clinic had been booked within two
    weeks, the overall no-show rate would fall by nearly sixty percent." (26w) A reported conditional
    estimate; the condition and the estimate stay in one sentence.
  - "The trial on this page found one reminder worth about seven percentage points of attendance, in
    China, in 2007, among people who had made a reservation for a routine health check-up." (31w) Every
    clause after the number is a limit on it; splitting would leave the number alone in a sentence.
  - "Nine days is long enough for an offer to be accepted on something else, for a mortgage conversation
    to go badly, or for a job to change." (27w) One governor, three alternatives.
  - `LEAD_TIME.basis` and `REMINDERS.basis` were left almost entirely alone: both are the chart's own
    "what this measures and what it does not" lines and both are already short-sentenced.
- Counts I introduced, each checked against the list it counts: "Every business with a calendar in it
  tracks **two** things" (two listed); "**Four** decisions take the time" (four listed); "It is software
  that does **four** things" (four listed, and the section they summarise is already called "four small
  things in a row"); "Here, **two** things change" (two listed).
- Not touched, on purpose: every `alt` string (they carry ROUND-I provenance comments recording exactly
  what was counted in the photograph, so they are records, not prose); the pull-quote `text`; the
  `THE_BOOKING` visitor turns; all `sourceText`/`sourceHref`; `eyebrow`, `title`, `lede`, `specs`,
  `why`, `keywords`, `seo`, `stat` on the service page; the FILM-class data (this topic has none).
- One assistant turn in `THE_BOOKING` was split ("I have sent a calendar invitation to this number so
  it lands on your phone. Levan will meet you there."). It promises, declines and discloses exactly
  what it did before.

## 2. WORKFLOW AUTOMATION

| surface | grade before -> after | median before -> after | invariants |
|---|---|---|---|
| `/blog/workflow-automation-real-estate-business` | 7.0 -> **5.8** | 14w -> 12w | PASS (4781 -> 4859 words, x1.02) |
| `/services/workflow-automation` | 6.1 -> **5.9** | 12w -> 12w | PASS (1961 -> 2018 words, x1.03) |

` because ` over body + `workflow-scenes.ts` + `workflow-automation.ts`: **20 -> 21** (body 10 -> 10,
scenes 7 -> 8, service 3 -> 3). The one addition is deliberate: `FRAGMENTED.basis` had a colon
carrying a reason ("is not a third category: nine resumptions in ten were self-started...") and the
split reopened it as "That is because ...". Nothing lost a reason. `git diff 6eab055` on the scenes
file changes **0 comment lines**. Vitest: PASS (388) FAIL (0). `updated:` set to 2026-09-18.

**`WORKFLOW_FILM` is byte-identical**: `git diff 6eab055 -- content/blog/workflow-scenes.ts` contains
no `src`, `poster`, `width`, `height`, `seconds`, `duration`, `name` or `description` line from that
object. I also left the `reel` scene's own `caption` array untouched, because it is caption copy
attached to the film and the brief puts captions attached to a FILM out of bounds. It contains the
page's longest remaining sentence (40w) and that is why it is still there.

Judgment calls, word for word:

- **No gloss was added.** The two terms a reader might not know (an Error Trigger, a per-run history)
  are both already named and explained in the sentence that introduces them.
- Non-trivial word swaps: "arithmetic" -> "sums" (body, "the sums are the easy part"); "recurring" ->
  "ongoing"; "migrated" -> "moved" (FAQ); "converts it into a dollar figure" -> "turns it into a
  dollar figure"; "consistent ... consistency" -> "the same every time ... that" in the "does not fix
  a bad process" limit. That last one is the only swap in this topic that drops a noun the page used
  twice; the meaning ("wiring makes a process repeatable, which only helps if it was right") is
  unchanged and the sentence after it is untouched.
- **"asymmetry" was NOT swapped** ("The same asymmetry is in the tools that do it properly"). The
  playbook lists asymmetry/gap as an allowed swap, but here the word names an imbalance between loud
  failures and silent ones, and "gap" does not mean that. Left as it was.
- **"knowledge work" was NOT swapped to "desk work"**, even though the scene note next to it says
  "desk work". The sentence is about what interruption does to a class of work the paper defines, and
  changing the term would have made the page name two different things.
- Colons reopened with their governor: the cost section's "three things nobody can guess from an
  article:" became "The first is ... The second is ... The third is ..."; the ranking paragraph's
  "Sort by two things ...:" became "The first is ... The second is ..."; the funnel footnote's
  two-item colon became "One is ... The other is ...".
- **"They found that ..." was repeated rather than dropped.** The CHI 2005 paragraph reported two
  findings under one reporting verb ("They found that X, and that Y"); the split repeats "They found
  that" on the second one so neither becomes the page's own claim.
- **The three judgment-call examples kept their colon.** "...the small judgment calls that used to
  need a person: is this the same Sarah Miller who inquired in March, is this lead actually hot, does
  this message need a human being rather than a template." I split only the lead-in and reopened the
  list with "They sound like this:". Turning the three into standalone sentences would have produced
  the batch-3 defect of direct questions punctuated with full stops.
- **"one of three things" added as a count** in the first-month section, then the three items kept
  their "That ..." so they stay the content of "you discover", not three flat statements about the
  reader's own chains. Same move on "two things" in the funnel footnote (two listed).
- "then" added to close an "if" in five places: "If the answer is nobody, **then** you have found ...";
  "If nothing arrives, **then** you have learned ..."; "If the manual version of the job loses leads,
  **then** the automated version loses them faster ..."; `WATCHABLE[0]` "If you cannot answer did it
  run ..., **then** you have not built an automation"; the plate caption "if the picture looks
  unremarkable, **then** that is the finding".
- Places I deliberately did NOT split:
  - The Zapier quotation (34w with its lead-in). Verbatim, in quote marks, left whole; only the
    second citation was moved into its own sentence.
  - The n8n error-workflow sentence in `WATCHABLE[1]`, which describes a documented pattern; I split
    the body sentence that reproduces the same thing at the "so", not inside the description.
  - `IN_SHORT[1]` "You are automating one through eight, **because** the chain is where the reloading
    happens **and** a chain is exactly what these tools are good at." One because governing two
    reasons; splitting would have made either reason sufficient.
  - `howItWorks[1]` "Rank that list by how often the step happens **and** how little judgment it
    needs" on the service page. Two joint sort keys, one sentence.
  - "The top of that list is always something dull and frequent, a field being copied from one system
    into another twenty times a week." The comma is an apposition, not an example; writing "like a
    field being copied" would have turned an identity into an instance.
  - `useCases[0]` on the service page (five things one submission becomes, one governor).
- Not touched: the `reel` caption (above), `plate` and `plate-two` `alt` strings, the pull-quote
  `text`, `REBUILT_CHAIN` labels, every `sourceText`/`sourceHref`, and all eight orchestrator fields
  on the service page.

## 3. AI VOICE AGENTS

| surface | grade before -> after | median before -> after | invariants |
|---|---|---|---|
| `/blog/ai-voice-agent-missed-calls-real-estate` | 7.0 -> **5.9** | 13w -> 12w | PASS (4880 -> 4938 words, x1.01) |
| `/services/ai-voice-agents` | 7.0 -> **6.0** | 14w -> 12w | PASS (2384 -> 2442 words, x1.02) |

` because ` over body + `voice-agent-scenes.ts` + `ai-voice-agents.ts`: **19 -> 19** (body 11 -> 11,
scenes 7 -> 7, service 1 -> 1). `git diff 6eab055` on the scenes file changes **0 comment lines**.
**`VOICE_FILM` is byte-identical** (0 diff lines touching that object), and the `reel` caption was
left alone for the same reason as the workflow film. Vitest: PASS (388) FAIL (0). `updated:` set to
2026-09-18.

The service page landing at exactly 6.0 is deliberate. It carries two statutes, the FCC ruling and
the consent rule in prose, and the remaining long sentences are the statutory ones. I stopped
splitting rather than break a rule into fragments.

**TWO INVARIANT FAILURES I CAUSED AND THEN REVERTED. Worth reading before batch-5 anything.**
The invariants script pairs quote marks, so the text BETWEEN two quotations is itself recorded as a
"quote" whenever it is 12 to 600 characters long. The legal section has three quotation marks close
together (`"artificial"`, the 250.05 passage, the 250.00 passage), which makes two such spans:

1. from the close of `"artificial"` to the open of `"when he unlawfully engages in wiretapping..."`;
2. from the close of that passage to the open of `"a telephonic or telegraphic communication..."`.

My first draft rewrote inside both spans and the script reported `quote BENT or LOST` twice. I
reverted both edits to the BEFORE wording rather than work around the scorer:

- "In practice that means the rules already governing prerecorded outbound calls, getting consent,
  identifying who is calling, and honoring an opt-out, apply in exactly the same way when the voice
  is generated." is back exactly as it was. (My draft had split the appositive into "Those rules
  include ...", which was also a small risk of its own: the original list is an apposition, not an
  exhaustive set, and any wording that implied "there are three rules" would have been a
  strengthening.)
- "The one of those three that governs a telephone call is defined in [section 250.00](...)**:**
  wiretapping means recording ..." keeps its colon.

Judgment calls, word for word:

- **No gloss was added.** Nothing on this page needed one; every legal term is either quoted with its
  citation or already explained in the sentence beside it.
- Systematic `somebody/anybody/everybody` -> `someone/anyone/everyone` in prose, as in topic 1, EXCEPT
  inside the quoted phrase "somebody at the office picked up", which is illustrative speech in quote
  marks and stays.
- Non-trivial word swaps: "resolve that ambiguity ... they resolve it badly" -> "settle that question
  ... they settle it badly"; "looks identical to a wrong number" -> "looks exactly like a wrong
  number"; "arithmetic" -> "sums" in the calculator note (with "it is far gentler" -> "they are far
  gentler" to agree); "a volume amplifier" does not appear here. **"attorney" was NOT swapped to
  "lawyer"**, in the body or in the offer scene, because the register is deliberate and both surfaces
  have to say the same word.
- **"commitment to wait" was kept.** I drafted "promise to wait" and threw it away: a commitment to
  wait is something the caller takes on, and "promise" implies a promise made to somebody.
- Colons reopened with their governor: "silence means one of three things" now introduces three
  fragments that are plainly the three readings; "the entire difference between two things. One is
  ... The other is ..."; the offer scene's "the line that says ... and the line that says ..." became
  "One line says it is an assistant. The other says the call is recorded."; the outbound-legality FAQ's
  three rules each keep their own modal ("You need ...", "You have to honor ...", "And the agent
  identifies itself ...") under the governor sentence "The same rules that govern your own outbound
  calling apply."
- **Reporting verbs repeated rather than dropped**, twice: "Firms that tried to make contact within an
  hour were nearly seven times likelier ... **They were** more than sixty times likelier than firms
  that waited a day." and, in the calculator note, "**The same study found them** more than sixty times
  likelier than firms that waited a day." Also "The authors **also note** that speakers are sensitive
  to shifts of a hundred milliseconds."
- "then" added to close an "if" in three places (`VENDOR_QUESTIONS[1]`, the body's past-client limit,
  the service page's past-client limit).
- **The three-item list "An unanswered call left no name, no number ..., and no record ..." kept its
  verb on every item** ("It left no number ... And it left no record ...") so none of the three
  becomes a claim about something else.
- Places I deliberately did NOT split:
  - The FCC declaratory-ruling sentence (36w). One reported ruling with its date, its release and its
    holding; "confirmed that" governs all of it.
  - Penal Law 250.05 and 250.00 and Penal Code 632, in the body and in `faqs[6]` on the service page.
    Every "makes a person guilty", "makes it an offense", "without the consent of all parties" and
    "may record" is untouched; I only split at sentence boundaries outside the quotations, and only
    outside the two protected spans above.
  - "If the caller is a past client, or your seller's neighbor, or anyone whose relationship is the
    actual asset, then ..." (32w). Three alternatives under one condition.
  - `IN_SHORT[1]` was left byte-identical. Its provenance comment records that "reach a decision
    maker" was corrected to "get a meaningful conversation with a decision maker" in an earlier round,
    and the sentence is the study's own definition.
  - "even though someone who dialled you is warmer than someone who filled in a form" (a concession
    clause) stays inside its sentence.
  - `RESPONSE_AUDIT.basis` and `.note` were left as they were; both are already short-sentenced and
    both are the chart's own caveat.
- Not touched: the `reel` caption, `CALL_TURNS` (both the caller's lines and the agent's disclosure
  lines, which say what is recorded and what it will not guess at), `CALL_EVENTS`, the pull-quote,
  every `sourceText`/`sourceHref`, the `plate` alt, and all eight orchestrator fields.

## 4. LEAD QUALIFICATION

| surface | grade before -> after | median before -> after | invariants |
|---|---|---|---|
| `/blog/ai-lead-qualification-real-estate-scoring` | 6.8 -> **5.9** | 13w -> 12w | PASS (4719 -> 4751 words, x1.01) |
| `/services/lead-qualification` | 5.9 -> **5.7** | 12w -> 12w | PASS (1845 -> 1903 words, x1.03) |

` because ` over body + `qualify-scenes.ts` + `lead-qualification.ts`: **20 -> 20** (body 10 -> 10,
scenes 8 -> 8, service 2 -> 2). `git diff 6eab055` on the scenes file changes **0 comment lines**.
**`QUALIFY_FILM` is byte-identical** (0 diff lines touching it); the `reel` caption is untouched.
Vitest: PASS (388) FAIL (0). `updated:` set to 2026-09-18.

The service page already passed at 5.9 before I touched it. I made five light splits on it rather
than a full pass, because §3 of the house rules says touch only what you must and the page is on the
site's hardest legal ground. They are listed below.

Judgment calls, word for word:

- **No gloss was added.** The only candidate was "median", which the page uses three times, and the
  NAR sentences around it already define the idea by example.
- Non-trivial word swaps: "the underlying population" -> "the group of people" (the assumption
  paragraph; it means the set of leads, not a statistical population attached to a figure);
  "somebody/anybody" -> "someone/anyone" in scene prose and in a few body sentences, as in topics 1
  and 3. **"Anybody will type spring into a form" became "Anyone will type spring into a form"** and
  keeps its universal force.
- **"It is that ..." kept on the reported assumption.** "There is a comfortable assumption underneath
  every CRM, which is that the leads ... are roughly interchangeable and that working them in order is
  therefore fair" became "There is a comfortable assumption underneath every CRM. **It is that** the
  leads in it are roughly interchangeable, **and that** working them in order is therefore fair." Both
  "that"s survive, so neither half becomes the page's own claim one sentence before it is refuted.
- **"They are not" was made explicit** as "They are not equally ready", because after the split the
  bare "They are not" pointed at nothing.
- **"three things follow" added as a count** in the traceability paragraph, so the three "You cannot
  ..." sentences stay inside the "If you cannot open a lead ..." condition instead of becoming three
  flat statements about the reader.
- "then" added to close an "if" in six places: "If everybody were equally ready, **then** ...";
  "If they got less of your SERVICE, **then** it stopped being a ranking"; "If you cannot open a lead
  ..., **then** three things follow"; `FAIR_PLAY[0]` "If an input would be indefensible said out loud,
  **then** it is indefensible in a weight"; `FAILURE_MODES[2]` "If the ranking had no relationship to
  the outcome, **then** you do not have a scoring system"; the service page's `useCases[4]` "If they
  got less of your service, **then** ...".
- **Reported "said" kept on both halves** of `IN_SHORT[1]`: "Fifteen percent of sellers **said** they
  needed to sell as quickly as possible. Forty three percent **said** they were in no hurry."
- The three-alternative list in `howItWorks`-style prose ("a field update in some systems, an
  integration project in others, and in one or two well-known ones ...") was split with its verb
  repeated ("**It is** an integration project in others. **And in** one or two well-known ones **it
  is** a support ticket and a fortnight."), so no alternative reads as the only one.
- Places I deliberately did NOT split:
  - **The whole 42 U.S.C. 3604 sentence (51w).** It reproduces two statutory prohibitions in quote
    marks with the connective "and to represent to somebody, because of a protected characteristic"
    between them. Splitting would have separated a prohibition from the phrase that scopes it, and it
    is also the span the invariants script watches. Untouched, and it is the page's longest sentence
    on purpose.
  - The Article 10 sentence (37w), for the same reason; only the two short sentences after it moved.
  - **The whole HUD-limits paragraph.** "It says nothing about CRMs, nothing about lead scoring, and
    nothing about a real estate agent ordering their own call list, and it is not authority for
    anything in this article." is the page's disowning sentence, and the sentence after it carries
    the one recommendation it does transfer, with the quotation attached. Both left byte for byte.
  - "The moment a low score results in fewer listings, a slower answer to a direct question, or a
    person who can never reach a human being, you have stopped ranking your own time and started
    rationing access to housing." (39w) Three alternatives inside one condition; any of them alone is
    enough, which is exactly what the sentence says and exactly what a split would have blurred. Only
    the trailing clause was moved into its own sentence.
  - "A score you cannot trace is one you cannot explain to a client, cannot correct when it is wrong,
    and cannot defend to anybody who asks a harder question than your client would." (`FAIR_PLAY[1]`)
  - "Keep the inputs to the plans people describe, keep every score traceable to their own words, and
    never let the ranking change what anybody is allowed to see or ask." (three joint rules)
  - "It must never decide who gets to see a listing, who gets a straight answer, or who is allowed to
    reach a human being." (normative, three items)
  - The service page's `faqs[4]` (48w), which carries 42 U.S.C. 3604 and Article 10 in one sentence,
    and `useCases[2]`'s area-routing rule.
- The five service-page edits: `whatItIs[1]` split at "and routes it" with "Then it routes it: ...";
  `whatItIs[2]` split at the last "and" ("And every point of it traces back ...");
  `howItWorks[3]` split the "which is what makes it" relative clause into "That is what makes it ...";
  `useCases[4]` gained a "then"; `faqs[0]` reopened its colon with "That is whether they are
  pre-approved ...".
- Not touched: the `reel` caption, the pull-quote, `QUALIFY_TURNS` and `QUALIFY_EVENTS`, the figure
  `rows`/`tag` data on the service page, every `sourceText`/`sourceHref` (including the NAR
  methodology line, which is the page's longest remaining scene sentence), the `plate` alt, and all
  eight orchestrator fields.

## 5. DATABASE REACTIVATION

| surface | grade before -> after | median before -> after | invariants |
|---|---|---|---|
| `/blog/database-reactivation-old-real-estate-leads` | 6.7 -> **5.8** | 12w -> 12w | PASS (4825 -> 4887 words, x1.01) |
| `/services/database-reactivation` | 6.1 -> **5.5** | 12w -> 12w | PASS (1882 -> 1930 words, x1.03) |

` because ` over body + `reactivation-scenes.ts` + `database-reactivation.ts`: **21 -> 21** (body 8 -> 8,
scenes 9 -> 9, service 4 -> 4). `git diff 6eab055` on the scenes file changes **0 comment lines**.
**`REACTIVATION_FILM` is byte-identical** (0 diff lines touching it); the `reel` caption is untouched.
Vitest: PASS (388) FAIL (0). `updated:` set to 2026-09-18.

Judgment calls, word for word:

- **ONE GLOSS ADDED, and it is the only gloss in this batch.** In the TCPA paragraph, after "a court
  that finds the violation was willful or knowing may treble it", I added: **"To treble a sum is to
  make it three times as big."** It is plainly true, it adds no claim, the page does not say it
  anywhere else, and it is the same move the invoicing exemplar made with "Treble damages means three
  times the charge." The "may" in front of it is untouched, so the gloss does not turn a court's
  discretion into a certainty. The word "three" is spelled out, so it introduces no digit string.
- Non-trivial word swaps: "the rest is arithmetic, and it is arithmetic nobody can do for you" ->
  "the rest is sums. And they are sums nobody can do for you"; "somebody/anybody" -> "someone" in the
  cold open and a handful of places (the cold open now reads "someone filled in the home valuation
  form", "Someone else listed it").
- **The cold open's hardest sentence was rebuilt rather than trimmed.** BEFORE: "It is that following
  up with a person who said not right now, three years later, in the one month it stopped being not
  right now, is not a thing a human being is built to do." (53w, with the subject and the verb 40
  words apart.) AFTER: "It is that a person who said not right now needs following up three years
  later, in the one month it stopped being not right now. That is not a thing a human being is built
  to do." Both halves survive and the claim is still about the timing, not about following up in
  general. I drafted a version that said "following up is not a thing a human being is built to do"
  and threw it away, because that is a much larger claim than the page makes.
- Colons reopened with their governor: "What reactivation changes is **two things. One is that** ...
  **The other is that** ..."; the calculator note's three refusals became "**There are three reasons.**
  ..."; the service page's "Before a single message: ..." became "**Before a single message, three
  things get checked.** ..."; the close's "Two earlier moments in the same story are written out
  elsewhere:" now opens two sentences instead of one.
- "then" added to close an "if" in seven places: "if that number is on the registry, **then** warmth
  is not a defense"; "If a vendor cannot tell you ..., **then** the campaign is not ready to send";
  "If the answer is a general assurance ..., **then** nothing has been checked"; "If the second message
  goes out, **then** the suppression list is decoration"; "If the records do not carry a date and a
  source, **then** the honest first project is not a campaign"; `FAILURE_MODES[1]` "If the first line
  would work on anybody, **then** it will work on nobody"; the offer scene's "If you would rather have
  a second pair of eyes on it, **then** tell us ...".
- Places I deliberately did NOT split:
  - The whole 47 CFR 64.1200(f)(5) sentence (58w, the page's longest). It reproduces the definition
    verbatim, and both date windows live inside one quotation.
  - "The same regulation, at paragraph (a)(2), **bars** a telemarketing call or text ... **unless** you
    have the prior express written consent of the person you are calling." (43w) A prohibition and its
    exception; splitting at "unless" would leave a flat ban.
  - "Written consent is defined narrowly: a signed agreement, with a clear and conspicuous disclosure
    that the person is authorizing automated calls, and a statement that agreeing is not a condition
    of buying anything." Three joint parts of one definition.
  - `CONSENT_CHECK[0]` (40w): "the rule wants a signed agreement **that says** ... **and that**
    agreeing is not a condition of getting anything". Both "that" clauses are inside what the
    agreement must say.
  - "a person can recover their actual loss "or to receive $500 in damages for each such violation,
    whichever is greater", and a court that finds the violation was willful or knowing **may** treble
    it." The modal and the quotation stay in one sentence.
  - `limits[0]` on the service page: "What changes is that somebody finally asked, and the few whose
    situation moved get found in the week it moved." The second "that" is elided, so a split would
    have stranded it. Left whole. (The post body's version of the same sentence WAS split, and there
    the governor is repeated explicitly as "One is that ... The other is that ...".)
  - The Twilio threshold quotation and its lead-in.
- Not touched: the `reel` caption, the pull-quote, `REVIVAL_TURNS` and `REVIVAL_EVENTS`, the service
  page's `figure.turns` transcript (both the AI's lines and the visitor's), every
  `sourceText`/`sourceHref` including the NAR methodology line, the `plate` alt and its dated caption,
  and all eight orchestrator fields.

## 6. AI CHAT ASSISTANT (the story standard: language only)

| surface | grade before -> after | median before -> after | invariants |
|---|---|---|---|
| `/blog/ai-chat-assistant-real-estate-website` | 6.5 -> **5.9** | 12w -> 11w | PASS (4756 -> 4798 words, x1.01) |
| `/services/ai-chat-assistant` | 7.1 -> **5.9** | 14w -> 12w | PASS (1946 -> 2005 words, x1.03) |

` because ` over body + `ai-chat-scenes.ts` + `ai-chat-assistant.ts`: **21 -> 21** (body 13 -> 13,
scenes 6 -> 6, service 2 -> 2). Vitest: PASS (388) FAIL (0). `updated:` set to 2026-09-18.

**`content/blog/ai-chat-scenes.ts` was NOT TOUCHED AT ALL.** `git status` does not list it. The brief
says this post gets the lightest touch of the six and that its structure, scenes, order, cold open,
people, times and details do not move; once the body alone brought the page to 5.9 with median 11w,
no sentence in the scenes needed changing to pass, so none was changed. That also means `FILM`, the
`reel` caption, `RESPONSE_CURVE` with its two quoted HBR fragments, `IN_SHORT`, `SELF_CHECKS`,
`TEARDOWN_TURNS`, `TEARDOWN_EVENTS`, `FOUR_MOVES`, `FAILURE_MODES`, the leads-calculator note with its
"deliberately not by the unsourced 78% figure this article declines to use" line, the pull-quote and
the plate caption are all byte-identical.

**The 78% retraction is untouched.** The sentence that states the retired figure is byte for byte
where it was, and so is every sentence of the paragraph that refuses it. The only change inside that
paragraph is one sentence boundary: "...no published report, no stated sample, and no methodology**.
And** every citation leads to another article citing a third." The disowning sentences ("There is not
one that anybody can produce", "nobody quoting it knows whether it is right", "So this article does
not use it") are unchanged.

Judgment calls, word for word:

- **No gloss was added.**
- **THE WHOLE "fine print" SECTION IS UNTOUCHED FROM ITS FIRST QUOTATION ONWARD.** Business and
  Professions Code 17941, the escape-hatch sentence, the clear-and-conspicuous phrase, the
  ten-million-visitor definition, the definition of online, the Core Web Vitals INP and LCP
  thresholds, and the WCAG No Keyboard Trap criterion are all byte for byte, together with every
  sentence between them. That is partly editorial (reproduced law and published thresholds) and
  partly mechanical: see the note at the end of this batch about how the invariants script pairs
  quote marks. The three longest sentences left on this page are those three quotations.
- Non-trivial word swaps: exactly one, "That **distinction** matters more here" became "That
  **difference** matters more here". Nothing else on this page had a word changed; every other edit
  is a sentence boundary.
- Colons reopened with their governor: "the harder half: what happens ..." became "the harder half.
  **It is** what happens ..."; "What is not free is the reading: somebody has to ..." became "What is
  not free is the reading. **Somebody** has to ...", with both of that sentence's reasons kept
  ("That is because ... It is also because ..."); "On timing, the honest shape is **that** A, B and C"
  became "On timing, the honest shape is **this.** A. B. And C."
- "then" added to close an "if" in three places, twice in the body and once on the service page.
- Counts introduced: "**There are three of them**, and only one is the software" (three listed, and
  the sentence before it already said the number depends on three things).
- Places I deliberately did NOT split:
  - Everything named two bullets above.
  - "It does not read a room, it does not know when a seller is lying about their timeline, and it
    has no instinct for what is really going on in a divorce sale." in the POST body. On the service
    page the same sentence WAS split into three, each keeping its own "It does not" or "it has no",
    so the two surfaces say the same three things with the same force.
  - The FAQ "The difference is whether it can answer a question nobody scripted in advance, and
    whether the answer comes from live data or from a page written eight months ago." Two joint tests.
  - The service page's "What the assistant changes is **that** the inquiry gets answered while the
    person is still on the page", and "becomes a booked call **rather than** a confident wrong answer".
- Service-page edits worth naming: `faqs[1]` carried the batch's longest sentence (61w). The study's
  own definition of qualifying sat nested between the multiple and its comparison; it is now its own
  sentence with the reporters kept ("**The researchers defined** qualifying the lead as a real
  conversation with somebody who could decide"), and the multiple keeps its comparison intact
  ("nearly seven times likelier to qualify the lead **than firms that waited one more hour**").
  `whatItIs[0]`'s three example questions each kept the modal ("**They can** ask what the taxes look
  like ... **And they can** get a straight answer to each one in the same conversation"), so the page
  still describes what a visitor may do rather than what happens.

---

# BATCH 4 CLOSE-OUT

**All twelve surfaces PASS both scorers**, re-run at the end of the batch in one pass:

| surface | grade | median | invariants |
|---|---|---|---|
| `/blog/ai-appointment-booking-no-shows-real-estate` | 5.9 | 12w | PASS x1.01 |
| `/services/ai-appointment-booking` | 5.8 | 11w | PASS x1.02 |
| `/blog/workflow-automation-real-estate-business` | 5.8 | 12w | PASS x1.02 |
| `/services/workflow-automation` | 5.9 | 12w | PASS x1.03 |
| `/blog/ai-voice-agent-missed-calls-real-estate` | 5.9 | 12w | PASS x1.01 |
| `/services/ai-voice-agents` | 6.0 | 12w | PASS x1.02 |
| `/blog/ai-lead-qualification-real-estate-scoring` | 5.9 | 12w | PASS x1.01 |
| `/services/lead-qualification` | 5.7 | 12w | PASS x1.03 |
| `/blog/database-reactivation-old-real-estate-leads` | 5.8 | 12w | PASS x1.01 |
| `/services/database-reactivation` | 5.5 | 12w | PASS x1.03 |
| `/blog/ai-chat-assistant-real-estate-website` | 5.9 | 11w | PASS x1.01 |
| `/services/ai-chat-assistant` | 5.9 | 12w | PASS x1.03 |

` because ` over all three files per topic, before to after: booking 30 to 30, workflow 20 to 21,
voice 19 to 19, qualification 20 to 20, reactivation 21 to 21, chat 21 to 21. **Nothing fell.**

Scope, measured rather than asserted (`git diff` against HEAD `2cb5905`):

- Files changed: `content/blog/ai-posts.ts`, five scenes files (booking, workflow, voice-agent,
  qualify, reactivation), `content/blog/posts.ts`, six service files, this log. Nothing else.
- `content/blog/ai-chat-scenes.ts` is **not** in the changed set.
- `content/blog/posts.ts`: **6 insertions, 6 deletions, and every one is an `updated:` line** moving
  2026-08-27 to 2026-09-18.
- **Zero comment lines changed** in any content file. A grep for changed lines beginning with an
  asterisk returns ten, and all ten are markdown bold lead-ins inside post bodies.
- **Zero** changed `eyebrow`, `title`, `lede`, `specs`, `why`, `keywords`, `seo` or `stat` lines on
  any service page.
- **Zero** changed `sourceText`, `sourceHref`, `alt` or `credit` lines in any scenes file.
- **Zero** lines touching any FILM object or any `reel` caption.
- Zero em dashes, en dashes or arrow glyphs added; zero hype words added.

## THE ONE THING THE NEXT BUILDER SHOULD READ

`rewrite-invariants.mjs` finds quotations by scanning left to right and pairing each opening quote
mark with a closing one, requiring between 12 and 600 characters in between. Normally that pairs each
quotation with its own end and the prose BETWEEN quotations is never recorded. That holds **until a
quoted string is shorter than twelve characters or longer than six hundred**. Then the match starting
at its opening quote fails, the scan resumes at its CLOSING quote, and every pairing downstream is off
by one: from that point the script records the prose BETWEEN quotations as if it were a quotation, and
any rewrite inside those gaps is reported as `quote BENT or LOST`.

That happened once in this batch, on the voice post, where the FCC ruling is quoted as the single word
"artificial", ten characters long. Two gaps in the legal section became protected spans and my first
draft rewrote inside both. I reverted to the BEFORE wording in both places rather than work around the
scorer, and the page passes.

Practical rule: before rewriting near a run of quotations, look for a quoted fragment under a dozen
characters. If there is one, treat the prose between the quotations after it as frozen, or expect the
gate to tell you. The chat post's fine-print section was left whole for the same reason, because it
quotes the word online on its own; the reactivation and qualification posts were safe because every
quoted fragment on them clears twelve characters.

## Open items for the orchestrator

1. `/services/ai-voice-agents` finishes at exactly 6.0. It passes, and its remaining long sentences
   are Penal Law 250.05, section 250.00 and Penal Code 632 in `faqs[6]` and `limits[5]`. More
   headroom there would have to come out of the statutes, and that trade did not look like mine.
2. `/blog/ai-lead-qualification-real-estate-scoring` keeps a 51-word sentence (42 U.S.C. 3604 with
   both prohibitions and the phrase that scopes the second one) and `/services/lead-qualification` a
   48-word one (3604 plus Article 10). Both are deliberate and both pages pass.
3. Nothing in this batch was left unresolved and nothing was worked around. The BEFORE snapshot and
   the ALLOW file were not touched.
