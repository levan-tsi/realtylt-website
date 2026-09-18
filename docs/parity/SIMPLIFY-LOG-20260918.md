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
