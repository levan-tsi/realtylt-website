# ROUND H — the last three, and what a fresh-eyes checker should look at first

**Built 2026-08-25 into 2026-08-26.** Scope: seven new editorial plates, then `ai-clone`,
`ai-audit` and `custom-automation` written to the flagship standard, their service pages synced,
the double-booking defect Round G carried, and the claims the research killed on the way. **This
closes the twenty-topic rollout.** Seven commits on `main`, **not pushed**: the orchestrator
verifies and pushes.

```
69c9a3a  H0   seven new editorial plates, and the alias rule proved to run in both directions
e404d61  H1   topic 18, the AI clone, argued as a likeness rather than as a video
ade1417  H2   topic 19, the AI audit, argued as subtraction rather than as a list
10977b2  H3   topic 20, custom automation, argued as the thing you now own
05a9a13  H4   the three service pages synced, ten claims killed, and the carried booking defect closed
f785ceb  H5   defects found by LOOKING, and the second pass that rewrote fifty one sentences
         H6   this log, and this line closes the list
```

Rounds E, F and G each had to amend their own commit list after writing it, and Round G's grew
twice even after counting afterwards. **A commit list inside the thing it is listing can only ever
be complete about the past**, so this one is written to include the commit that closes it.

**Three posts, ZERO new components.** Twenty topics on the template now and NINETEEN IN A ROW that
add none. The bespoke-component hatch was not opened and did not need the calculator-lesson test.

**The two sections a future round should read first are H5 and "What a fresh-eyes checker should
re-examine first".** H5 found five things wrong in alt text and captions, plus three dates and an
anecdote about a statute that were written from memory rather than read on a page.

---

## THE CONSTRAINT ON TOPIC 18, WHICH BECAME THE ARTICLE'S SPINE

The brief was absolute: films, HeyGen and the avatar are owner-held and must not be touched. So
`ai-clone` is an article about a digital twin written **without building, rendering or judging
one**, and rather than apologise for that, the piece is organised around what the constraint makes
it good at.

**The honest article about a synthetic likeness is mostly about what a likeness may and may not
do.** Nothing on the post describes how our avatar is produced, how convincing it is, or what tool
makes it. The one thing about our own product on the page is a POLICY, which is the one kind of
statement that needs no primary source because it is a commitment rather than a claim: we build a
likeness of the person who sat in front of the camera and said in writing that we could, and we do
not build a likeness of anybody else, living or dead.

That extends what the `/ai` page already says about voice ("We do not build agents that pretend to
be a specific human being") to a face, which is what the brief asked for.

---

## THE THREE SEAMS, and the hardest one is topic 19's

`ai-audit` sits directly on top of `workflow-automation`, which shipped in an earlier round and
whose teaching content is **the hour with a piece of paper**: follow one job end to end, note where
information is retyped, note what only happens if somebody remembers, order the result. That is
mapping, it is free, it is already on this site, and **topic 19 does not repeat a word of it.** It
links to it and starts one step later.

| | topic 5, workflow | topic 11, agent workforce | topic 19, audit | topic 20, custom | topic 18, clone |
|---|---|---|---|---|---|
| the unit | a step of WORK inside one job | an assistant doing a job | a CANDIDATE, across the business | the THING YOU NOW OWN | a LIKENESS |
| the question | what does the manual version cost | right once against right every time | should this one exist at all | what does it cost after it works | whose face, on whose consent |
| the method | map it, then order it | supervise it | subtract, then order | own it, or do not commission it | consent, bound, review, label |
| the held moment | 25 minutes | 10 mornings | **4 crossed off** | **1 new value** | **14 videos** |
| the calculator's unit | hours a year of busywork | cost of running several | a COUNT of candidates still standing | a COUNT of outside changes a year | HOURS to watch what goes out in your face |
| what it refuses | the 25 min 26 sec | the salary division | any failure rate, any payback period | any maintenance share, any lifespan | any response rate for personalised video |

**Measured: sibling overlap 0 for all three, and 0 across all twenty posts.** It opened at 3, 6 and
9, and every shared phrase was mine. See the bleed section below.

---

## H0 — SEVEN NEW PLATES, and the alias rule proved to run in BOTH directions

Three unspent plates came into this round and all three were used. Seven new ones were sourced,
**all seven shipped**, and **`mailbox-mist.jpg` is the only UNSPENT row left** after three rounds
of being passed over. Round F left it alone because the neighbouring post already carried three
mailboxes; this round left it alone because none of these three topics is about post.

### The finding: the index sometimes has a NAME and the page does not

Round G established that the photo page, not a search index, is the authority for the
photographer's name, because Openverse's `creator` field is sometimes the account alias. Two more
differed the same way this round: **`quinet` is Thomas Quine**, **`Wiki.will` is William**, and
**`mikecogh` is Michael Coghlan**.

**One went the other way, and it is the new case.** A store-mannequin photograph indexed to "Horia
Varlan" sits on an account whose page now displays, everywhere including its own `<title>` and the
profile page's `<h1>`, the string **"Old Photo Profile"**. The index has a person's name; the page
has interface-shaped text. **That photograph was dropped** rather than credited to a string a
reader cannot check, and a replacement (a gramophone) was sourced for the same scene. The rule
survives intact and is now two-sided: the page is the authority, and where the page has no name on
it, the photograph cannot be used here.

`scripts/_scratch-h-owner.mjs` (gitignored, like `_scratch-g-lic.mjs`) fixes the two defects Round
G's log recorded in its own probe: it **matches on the licence URL rather than on the anchor's
visible text** (the anchor reads "Some rights reserved", which is why the older script printed
`?? CHECK` on correctly licensed photographs), and it knows **CC0 lives under
`/publicdomain/zero/` rather than under `/licenses/`**, which the obvious pattern cannot see.

**One instrument note recorded rather than hidden:** the new probe's "names seen" heuristic, which
reads the text of `a[href*="/photos/"]`, returns navigation chrome ("Trending", arrows) on every
page and is useless. `.owner-name` is the field that works, and the one case where it returned
something odd was the one case where the odd thing was true.

### The ledger

| file | photographer | licence | where it went |
|---|---|---|---|
| `editorial/type-case.jpg` | Kyle Van Horn | BY 2.0 | SPENT this round: clone, plate one |
| `editorial/victrola.jpg` | Vince Alongi | BY 2.0 | clone, plate two AND cover |
| `editorial/empty-theatre.jpg` | Michael Coghlan | BY 2.0 | clone, cold-open field |
| `editorial/abacus.jpg` | jenny downing | BY 2.0 | audit, cold-open field |
| `editorial/dial-panel.jpg` | Thomas Quine | BY 2.0 | audit, plate one |
| `editorial/switch-box.jpg` | Vladimir Mokry | **CC0 1.0** | audit, plate two AND cover |
| `editorial/tool-wall.jpg` | huw-ogilvie | BY 2.0 | SPENT this round: custom, plate one |
| `editorial/jacquard-cards.jpg` | pedrik | BY 2.0 | custom, plate two AND cover |
| `editorial/patch-panel.jpg` | William | BY 2.0 | custom, cold-open field |
| **`editorial/mailbox-mist.jpg`** | Michele Dorsey Walfred | BY 2.0 | **UNSPENT, and now the only one** |

**Reconciled against the directory rather than against this table**, which is the check Round G
added after finding `office-stamps.jpg` reading UNSPENT while a scene had been using it since Round
F: `public/images/editorial/` holds 34 files. Thirty three are referenced and `mailbox-mist.jpg` is
not. **Four are referenced twice each** (`register-keys`, `victrola`, `switch-box`,
`jacquard-cards`) and every one of those four is plate-and-cover on the same post, which is safe
for the reason Round G verified in `app/blog/[slug]/page.tsx`: a flagship article never renders
`cover`.

### Nine candidates staged and rejected, and the reasons are the useful part

- **A halftone "Stereotyper" scan.** The most on-subject photograph found for the clone topic: a
  hand on a bank of stereotype plates, which is literally a cast duplicate used in place of the
  original. It is a photograph OF A PRINTED PHOTOGRAPH, visibly screened, and at the shipped crop
  the dot pattern reads as noise. Also black and white against a colour set, which is the call
  Round G made twice.
- **A shop window with mannequins.** A model's face on a poster occupies the top left of both
  crops. Same call Round G made about four identifiable people on a departures board.
- **A factory time clock** at 413px on the long edge: an unreadable brown blur at the crop.
- **A bike fork jig on a tool wall.** Redundant against `tool-wall.jpg`, which was already reserved
  for exactly this topic.
- **A circular slide rule.** The best-composed candidate of the whole round and 640x480, which is
  below the family (the shipped plates run 1024 to 2048 on the long edge) and would be upscaled
  1.7x into a 21:9 frame. Rejected on resolution and the number is the reason.
- **Cast faces mounted on a brick wall.** Striking, and the underlying sculpture is a third party's
  artwork that a photograph's CC licence does not speak for.
- **A drive-through bank window, an equal-arm balance from a museum collection, and an antique
  engine gauge** with a living manufacturer's name legible dead centre of the frame. The last one
  was the closest call in the round and it went the same way Round G's "Cambridge Trust Company"
  went.

---

## H1, H2 and H3 — the sources, each read in the primary document, none previously spent

Checked by grep across every post body, every scene file and every service page before writing:
nothing on this website had previously mentioned a likeness, a right of publicity, an
impersonation, a deep fake, a digital replica, a content credential, C2PA, maintenance,
deprecation, a breaking change or semantic versioning.

### Topic 18: `/blog/ai-clone-real-estate-agent-video-avatar`

*"Fourteen Videos Went Out in Your Face. You Have Watched None of Them."* Fifteen prose sections,
fourteen scenes, zero components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **New York Civil Rights Law section 50** | Read on nysenate.gov, whole section, and it is one sentence: *"A person, firm or corporation that uses for advertising purposes, or for the purposes of trade, the name, portrait, picture, likeness, or voice of any living person without having first obtained the written consent of such person, or if a minor of such minor's parent or guardian, is guilty of a misdemeanor."* Three words carry it and every summary softens one: the consent is WRITTEN, it is obtained FIRST, and the section is CRIMINAL. | nysenate.gov |
| **New York Civil Rights Law section 51** | The civil half, quoted for the remedy: a person may *"maintain an equitable action in the supreme court of this state against the person, firm or corporation so using such person's name, portrait, picture, likeness or voice, to prevent and restrain the use thereof; and may also sue and recover damages for any injuries sustained by reason of such use and if the defendant shall have knowingly used such person's name, portrait, picture, likeness or voice in such manner as is forbidden or declared to be unlawful by section fifty of this article, the jury, in its discretion, may award exemplary damages."* | nysenate.gov |
| **New York Civil Rights Law section 50-f** | Read in full, in the version the page shows as most recent (2025-12-19), with a version history whose earliest entry is 2020-12-04. The definition the whole topic needed and which nothing else on this site has: a digital replica is *"a newly created, computer-generated, highly realistic electronic representation that is readily identifiable as the voice or visual likeness of an individual that is embodied in a sound recording, image, audiovisual work... in which: (i) the actual individual did not actually perform or appear; or (ii) the actual individual did perform or appear, but the fundamental character of the performance or appearance has been materially altered."* Also quoted or used: the deceased-personality definition; subdivision 3, *"The rights recognized under this section are property rights, freely transferable or descendible"*; subdivision 7's registry with the secretary of state and the rule that *"A successor in interest... shall not have a cause of action for a use prohibited by this section that occurs before the successor in interest or licensee registers a claim of the rights"*; subdivision 2(c)(i)'s floor of *"the greater of two thousand dollars or the compensatory damages"* plus profits, with punitive damages available; and subdivision 8's forty year cut-off. | nysenate.gov |
| **16 CFR part 461, the FTC's Rule on Impersonation of Government and Businesses** | **Read in the eCFR itself rather than in a mirror**, at the 2026-08-01 point-in-time, which is how the round established what is actually in force. `Source: 89 FR 15030, Mar. 1, 2024`. Three sections, no 461.4. 461.3: it is a violation *"to: (a) materially and falsely pose as, directly or by implication, a business or officer thereof, in or affecting commerce"*. And the definition that reaches this trade, from 461.1: *"Officer includes executives, officials, employees, and agents."* | ecfr.gov |
| **FTC supplemental notice of proposed rulemaking, 1 March 2024** | Read in the Federal Register full text. The summary: the Commission proposes *"to revise the title of the Rule, add a prohibition on the impersonation of individuals, and extend liability for violations of the Rule to parties who provide goods and services with knowledge or reason to know that those goods or services will be used in impersonations of the kind that are themselves unlawful under the Rule."* The proposed 461.5, which is the half about the people who BUILD one: *"It is a violation of this part, and an unfair or deceptive act or practice to provide goods or services with knowledge or reason to know that those goods or services will be used to: (a) materially and falsely pose as, directly or by implication, a government entity or officer thereof, a business or officer thereof, or an individual."* And the proposed definition: *"Individual means a person, entity, or party, whether real or fictitious, other than those that constitute a business or government under this Part."* **Stated on the page as a proposal, checked against the eCFR the same day.** | federalregister.gov |
| **C2PA Technical Specification 2.1** | Read in the specification itself. The passage the whole disclosure section turns on, from section 1.2 quoting the coalition's own guiding principles: *"C2PA specifications SHOULD NOT provide value judgments about whether a given set of provenance data is 'good' or 'bad,' merely whether the assertions included within can be validated as associated with the underlying asset, correctly formed, and free from tampering."* The trust model, from 1.3.1: *"The basis of making trust decisions in C2PA, our trust model, is the identity of the signer associated with the cryptographic signing key used to sign the claim(s)."* And the machine-readable marker for generative output, quoted from the actions assertion: a `c2pa.created` action with *"a corresponding digitalSourceType value of http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"*. | c2pa.org |
| **Nightingale and Farid, PNAS 2022** | Read in the full text on PubMed Central. Experiment 1: *"315 participants classified, one at a time, 128 of the 800 faces as real or synthesized... The average accuracy is 48.2% (95% CI [47.1%, 49.2%]), close to chance performance of 50%, with no response bias."* Experiment 2: *"219 new participants, with training and trial-by-trial feedback... The average accuracy improved slightly to 59.0%... Despite providing trial-by-trial feedback, there was no improvement in accuracy over time, with an average accuracy of 59.3% for the first set of 64 faces and 58.8% for the second set."* Experiment 3, in the chart note rather than drawn: *"The average rating for real faces of 4.48 is less than the rating of 4.82 for synthetic faces."* | pmc.ncbi.nlm.nih.gov |
| **Dolhansky and others, The DeepFake Detection Challenge (DFDC) Dataset, Facebook AI** | Read in the arXiv PDF with `pdftotext`. The consent sentence, quoted because so few datasets in this field can say it: *"all recorded subjects agreed to participate in and have their likenesses modified during the construction of the face-swapped dataset."* Scale: *"over 100,000 total clips sourced from 3,426 paid actors."* The competition: *"During the course of the competition, 2,114 teams participated"*, and *"60% of submissions had a log loss lower than or equal to 0.69, which is roughly the score if one were to predict a probability of 0.5 for every video... many submissions were simply random."* Why precision rather than accuracy: *"In realistic distributions, the ratio of Deepfaked videos to real videos may be less than one in a million."* The three drawn bars are one row of the paper's Table 2, the winning entry's precision on real videos at recall 0.1, 0.3 and 0.9: 0.9803, 0.7610, 0.5389. | arxiv.org PDF |

**Cited data graphics: two charts and one diagram.** Both charts answer the same question from
opposite sides, which is deliberate: neither the audience nor the software can be relied on to work
out what a video is, which leaves exactly one party who reliably knows.

**The calculator's headline is HOURS TO WATCH WHAT GOES OUT IN YOUR FACE** and it is deliberately
small at rest (8 hours a year). That is the argument rather than a weakness in it: a few hours is
not a reason to say no to anything, which means there is no honest excuse for the second row going
out unwatched. It refuses **any response, reply or conversion figure for personalised video**
(every one that could be traced is published by a company selling video software and none states a
sample), **any comparison against recording it yourself** (nobody has timed that either), **any
dollar value**, and **any estimate of how many viewers would notice** (the research on the page
measures a different task).

### Topic 19: `/blog/ai-audit-small-business-what-not-to-automate`

*"You Had Eleven Ideas. The Hour Crossed Four of Them Off."* Thirteen prose sections, fourteen
scenes, zero components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **Zolas, Kroff, Brynjolfsson, McElheran, Beede, Buffington, Goldschlag, Foster and Dinlersoz, NBER Working Paper 28290** | Read in the NBER PDF with `pdftotext`. The instrument: *"The 2018 ABS is a large, nationally representative sample of over 850,000 firms covering all private, nonfarm sectors of the economy."* Why it beats the surveys these numbers usually come from: *"Response to the ABS is required by law, reducing selection bias, though certainly not eliminating it. In contrast, many privately funded surveys typically used in empirical work on technology adoption suffer from low response rates and significant selection bias."* Response rate 68.7 percent; *"About 67% of the firms sampled had fewer than 10 employees."* The two drawn figures: *"90.2% (75.6% non-imputed) of firms that collect at least one type of information stored at least one type of information in digital format"*, and *"only 10.3% (8.5% non-imputed) of firms adopt at least one of the listed advanced business technologies."* Machine learning, in the note rather than drawn: *"Machine learning comes second in use and testing rates, but the rates are quite low at 2.9% and 0.7%."* And the caveat about the public tables: *"If using the public-use tables to report aggregate adoption rates, those rates may be considered a lower bound."* | nber.org PDF |
| **Census Bureau, 2018 ABS digital technology module tables** | The public tables the paper describes, linked so a reader can go to the data rather than to the paper about it. | census.gov |
| **Budzier and Flyvbjerg, Double Whammy, Said Business School, Oxford (arXiv:1304.4590)** | Read in the arXiv PDF with `pdftotext`. The sample, quoted: *"in total our sample comprises 1,471 projects, which represents a total value of USD 241 billion (in 2010 USD), it is the largest academic dataset to date."* Its three parts are described separately: 142 projects from private-sector "project archaeology" (20 of about 200 organisations approached, a 10 percent response rate), 149 from published GAO and UK NAO reports, and 1,180 multi-year projects from US federal E300 filings. The three drawn regimes, which sum to 100: *"The probability of falling prey to budget cuts is relatively low but affects 6% of all projects."* *"The managed performance regime shows that normal projects have an average cost overrun of +3.6%, with a standard deviation of 14.8%. This regime has the highest probability of occurring a project stays within normal bounds of (-30%, +48%) with a 77% likelihood."* *"The probability of becoming a Black Swan is estimated at 17% a very high risk compared to thin-tailed distributions where outliers are happening with no more than 0.7% probability."* The size caveat, from the same page and carried in the chart note: *"The average project size is USD 122.1m (plan)... The median project size is USD 3.3m (plan)."* | arxiv.org PDF |
| **NIST AI Risk Management Framework 1.0 (NIST AI 100-1)** | Read in the NIST PDF with `pdftotext`. The pull quote, from 1.2.1: *"In cases where an AI system presents unacceptable negative risk levels, such as where significant negative impacts are imminent, severe harms are actually occurring, or catastrophic risks are present, development and deployment should cease in a safe manner until risks can be sufficiently managed."* MANAGE 1.1: *"A determination is made as to whether the AI system achieves its intended purposes and stated objectives and whether its development or deployment should proceed."* MANAGE 1.3: *"Risk response options can include mitigating, transferring, avoiding, or accepting."* And its honesty about its own limits, from 1.2.2: *"While the AI RMF can be used to prioritize risk, it does not prescribe risk tolerance... Risk tolerance and the level of risk that is acceptable to organizations or society are highly contextual and application and use-case specific."* | nvlpubs.nist.gov PDF |
| **Eveleens and Verhoef, The Rise and Fall of the Chaos Report Figures, IEEE Software** | Read in the PDF at the authors' own university. Affiliation taken from the paper's byline: *"J. Laurenz Eveleens and Chris Verhoef, Vrije Universiteit Amsterdam."* The method: *"We applied the Standish definitions to our extensive data consisting of 5,457 forecasts of 1,211 real-world projects totaling hundreds of millions of euros."* The finding: *"Our research shows that the Standish definitions of successful and challenged projects have four major problems: they're misleading, one-sided, pervert the estimation practice, and result in meaningless figures."* The mechanism, quoted because it is the part that makes the refusal specific: an organisation whose forecasts were independently checked and were genuinely accurate still scored *"only a 59 percent success rate"* on cost and 55 on functionality, and combined, *"the best-in-class organization Y obtains a success rate of 35 percent."* And the perverse incentive: an organisation that adopted those definitions internally had *"project managers to overstate budget requests to increase the safety margin for success. However, this practice perverted the forecasts' quality."* | cs.vu.nl PDF |

**THE ARTICLE REFUSES A FAILURE RATE IN THE OPEN**, and the refusal rests on a peer-reviewed
reconstruction rather than on an assertion of mine. That is the Round F data-broker move done with
a better source: somebody took the industry's most quoted figure, applied its own published
definitions to their own data, and showed it measures deviation from an estimate rather than
whether anything succeeded.

**The calculator's headline is a COUNT OF CANDIDATES STILL STANDING** and it is the only calculator
in the cohort whose output is a SMALLER list than the input (12 in, 3.3 out at rest). It refuses a
failure rate, a payback period, any figure for hours saved by an audit (an audit saves none), and
any build cost.

### Topic 20: `/blog/custom-automation-real-estate-bespoke-build`

*"It Ran Every Morning for Two Years. Then a Field Came Back With a New Word in It."* Fourteen prose
sections, thirteen scenes, zero components, no film.

| source | the operative sentence, as written | where |
|---|---|---|
| **Google Cloud Platform Terms of Service, section 1.4(e)** | Read in Google's own terms rather than in the deprecation-policy landing page, which only points at them. Quoted in full because every summary reports the twelve months and drops the sentence after it: *"Google will notify Customer at least 12 months before: (i) discontinuing any Service (or associated material functionality) unless Google replaces such discontinued Service or functionality with a materially similar Service or functionality; or (ii) significantly modifying a Customer-facing Google API in a backwards-incompatible manner. Nothing in this Section 1.4(e) (Discontinuation of Services) limits Google's ability to make changes required to comply with applicable law, address a material security risk, or avoid a substantial economic or material technical burden. This Section 1.4(e) (Discontinuation of Services) does not apply to Cloud Identity Services or pre-general availability Services."* | cloud.google.com |
| **Microsoft Modern Lifecycle Policy** | Quoted: *"For products governed by the Modern Lifecycle Policy, Microsoft will provide a minimum of 12 months' notification prior to ending support if no successor product or service is offered, excluding free services or preview releases."* | learn.microsoft.com |
| **Meta Graph API versioning** | Quoted, including the detail that makes the twenty four months shorter than it reads: *"Each version is guaranteed to operate for at least two years. A version will no longer be usable two years after the date that the subsequent version is released."* | developers.facebook.com |
| **Semantic Versioning 2.0.0** | Quoted as printed: *"Given a version number MAJOR.MINOR.PATCH, increment the: MAJOR version when you make incompatible API changes, MINOR version when you add functionality in a backward compatible manner, PATCH version when you make backward compatible bug fixes."* | semver.org |
| **Stripe API versioning reference** | The sentence that makes the cold open a documented behaviour rather than an anecdote. On open enums: *"The set of values for the enum can grow or change over time. Stripe can add new values as a backward-compatible change without requiring an API version upgrade."* And their own advice: *"Don't assume that the values documented for an open enum are exhaustive. When you read an open enum from an API response, your code should include a safe fallback."* | docs.stripe.com |
| **RTI for NIST, The Economic Impacts of Inadequate Infrastructure for Software Testing, Planning Report 02-3** | Read in the report PDF on nist.gov with `pdftotext`. Method: *"RTI conducted surveys with both software developers and industry users of software... Two industry groups were selected for detailed analysis: automotive and aerospace equipment manufacturers and financial services providers"*, then *"The per-employee impacts for these sectors were extrapolated to other manufacturing and service industries."* The drawn split, from Table ES-4: *"the national annual cost estimates of an inadequate infrastructure for software testing are estimated to be $59.5 billion... Software developers accounted for about 40 percent of total impacts, and software users accounted for the about 60 percent"*, being $21.2 billion and $38.3 billion. | nist.gov PDF |

**TWO REFUSALS, both FOLLOWED rather than asserted**, which is the discipline Rounds D, E and G all
had to learn the hard way.

1. **The maintenance share of lifetime cost.** The figure everybody quotes, usually as sixty to
   eighty percent, traces to a 1978 Communications of the ACM survey and a 2000 IT Professional
   article. Followed: Crossref confirms the 1978 record exists (ACM, June 1978, 22 references). The
   ACM Digital Library answers **403** to it, to a plain client and to headless Chromium alike, with
   a Cloudflare bot interstitial. The publisher's page for the 2000 article answers **200 with an
   8,211 byte JavaScript shell** containing no occurrence of "maintenance", of "80", or of the
   author's name. **Neither could be read in the primary, so no share is printed.** The page says
   the ACM library sits behind a bot check *no automated request cleared*, which is the precise
   claim rather than a claim about what a person would get. That precision is Round G's nysenate
   correction applied prospectively.
2. **The most reproduced table in software economics, which is not a measurement.** The relative
   cost of repairing a defect at each stage of development appears in Table 5-1 of the very NIST
   report the second chart comes from, and its own caption reads **"(Example Only)"**. It is an
   illustration the report uses to explain a concept. Drawing it would have been a fabrication with
   a footnote. It is refused on the page, with the reason.

**The calculator's headline is TIMES A YEAR SOMEBODY ELSE CHANGES SOMETHING THIS STANDS ON**, which
is the only calculator in the cohort whose headline is a thing that happens TO you rather than a
thing you do. It refuses the maintenance share, any lifespan for a custom build, any price, and any
comparison against what an off-the-shelf tool would have cost.

### Sources deliberately NOT used

- **EU AI Act Article 50, the transparency obligations for deep fakes.** The brief asked whether it
  reaches a US business with EU visitors, and said to check before asserting. **It could not be
  read.** EUR-Lex was tried at four URLs across two HTTP clients: the CELEX HTML and TXT routes,
  the ELI permalink and the OJ route all answered either **202 with zero bytes** or an empty
  content error. That is a different failure from Round G's JavaScript shell and the same outcome.
  A third-party mirror serves the text and a mirror is not the primary. **Nothing about the EU AI
  Act, its scope, or whether it applies to anybody is asserted anywhere on any of the three posts
  or service pages.**
- **New York Civil Rights Law 52-c**, the deepfake sexual-imagery cause of action. Read in full and
  deliberately left out. It is real, it is on point in a technical sense, and putting it on a page
  about marketing video would be sensational rather than useful. Its one transferable idea, that a
  disclaimer is expressly not a defence, is not needed for the argument the article makes.
- **16 CFR 465 and the FTC's Rytr consent order.** Genuinely on point for "what an audit tells you
  not to automate", and 16 CFR 465 is SPENT by the review-automation post. Building an audit
  section on a rule a neighbouring article already owns is the sibling bleed this project exists to
  prevent.
- **Salesforce's API version retirement schedule.** Wanted as a fourth bar on the vendor-notice
  chart. `help.salesforce.com` answers 200 with a 62-byte body reading "Sorry to interrupt / CSS
  Error / Refresh". Nothing about Salesforce is asserted.
- **GAO's work on federal legacy IT**, which carries the often-quoted share of the federal IT
  budget spent on operations and maintenance. `gao.gov` answers **403 to both a plain client and a
  browser-like one**, on the PDF and on the product page. Nothing from GAO is asserted.
- **Brynjolfsson, Mitchell and Rock's suitability-for-machine-learning rubric.** Wanted for the
  audit's ranking section and left out on budget once the round had four sources on that post that
  had each been read in full. Recorded as a candidate for whoever revisits topic 19.

---

## THE SIBLING BLEED, and every phrase was mine

**Topic 20 measured 9 against `workflow-automation`, 8 against `ai-clone` and 6 against `ai-audit`
on its first run.** Topic 18 opened at 3 and topic 19 at 6.

The single worst was a nine-phrase run against workflow, and it was a self-inflicted one: I had
lifted the custom-automation SERVICE page's own limits line ("a step built to guess where it should
have asked will eventually guess wrong in front of a client, in writing") into the post, and the
workflow post already carried it.

The rest were habits rather than facts: "the calculator above is the honest way to size it", "it is
a different conversation with its own scope", "whether the rule behind it is settled", "getting them
mixed up is how a", "if nobody is named for that job", "with no method behind it is not a", "this is
the single most common way a", "it is not dishonest it is just", "and it does not need to be", "is
worth stating plainly because it is", "there is no version of this where".

Twenty rewritten in total across three passes, plus four more that the second-pass edits themselves
introduced ("that is a separate piece of work" against local-seo, "is one sentence long and it is"
against ai-chat). **Cohort back to 0 on every one of the twenty. The bar was not touched.**

---

## H4 — the three service pages, and ten claims that did not survive

**FABRICATED SPECIFICS, checked first as the brief asked.** Round E found three invented street
addresses, Round F an invented person with an invented "verified" phone number, Round G an invented
key on a photograph. **One found this round**, on `ai-audit`'s own figure: three invented
hours-per-week values (`~6 hrs/week`, `~4 hrs/week`, `~3 hrs/week`) printed inside an illustration
of our own output, under a footnote that read as a claim rather than as an illustration. Nobody
measured those hours in anybody's business. The columns are now the three questions the article is
built on and the footnote says plainly that it is not a recording of anybody's business. The guard
entry written for it is deliberately general (`~\d+ hrs/week`) so it catches the class on any
service page.

`ai-clone` and `custom-automation` carry `flow` figures, which have no names, addresses or numbers
in them, and nothing was found on either.

| file | was | now |
|---|---|---|
| `ai-clone.useCases[2]` | a video instead of a fourth drip email, "**which is why they answer it**" | what it is instead of, plus an explicit line saying nobody has measured what that does to a reply rate |
| `ai-clone.howItWorks[2]` | "One listing can generate **a dozen individually addressed videos in an afternoon**" | split into two steps: deciding what it may never say and who watches, then producing with a spoken disclosure line |
| `ai-clone.faqs[1]` | "**Yes.** ... so what goes out **looks and sounds like you rather than a generic presenter**" | what the twin is built FROM, and an explicit statement that how convincing a result is depends on the recording and the platform and is worth judging on your own footage |
| `ai-audit.specs`, `.lede`, `.why`, `.seo`, `.whatItIs`, `howItWorks[1]`, `faqs[0]` | "**ranked by payback**", in six places | an order with the reason for each position attached, sorted by how contained the worst case is, then by whether the rule is settled, then by size. **specs, lede and why are /ai COPY** |
| `ai-audit.why` | "**Most owners know AI could help** but freeze... so you spend on the change with **the biggest return**" | the difference between knowing AI could help and knowing where to point it, and the shorter list of what you decided not to build. **This is /ai COPY** |
| `ai-audit.useCases[1]` | "The list tells you **what each fix is worth before you pay** to build any of it" | the list getting shorter rather than longer, for reasons you can apply yourself |
| `ai-audit.faqs[1]` | "In practice **the first win is usually** instant response to inbound inquiries" | the three questions, and the 10.3 percent adoption figure as the reason no general answer exists yet |
| `ai-audit.figure` | three invented hours-per-week values under a footnote that read as a claim | the three questions as columns, and a footnote that says it is an illustration |
| `custom-automation.why` + `howItWorks[2]` | "**Once, then forever**" and "**Built once, then it just runs**" | a thing you own from the day it works, and a chain that fails loudly rather than quietly. **`why` is /ai COPY** |
| `custom-automation.faqs[0]` | "The honest test is whether you could describe the task to a competent new hire, **because if you can, it can be built**" | describability as the first test and not the last, with frequency and where a wrong answer lands added |
| `custom-automation.faqs[2]` | "**By payback.** The step that costs the most hours and is cheapest to remove goes first" | containment, then settledness, then size, with the fat-tail finding as the reason |

All three pages gained a **sourced `stat`** (48.2 percent from PNAS; 10.3 percent from the 2018
ABS; 12 months from Google's own cloud terms), **limits lifted from their posts** (six each, up
from four), **`howItWorks` steps neither had** (deciding what a twin may never say and who watches;
cutting before ordering and ordering with reasons; handing a build over so somebody else could pick
it up), and **relatedPosts both ways** including `ai-voice-agents` now pointing at the clone article
and `workflow-automation` at both of this round's.

### THE CARRIED DEFECT, closed in the order Round G's log specified

`content/services/ai-appointment-booking.ts` carried the double-booking absolute in three places,
and Round G had already **checked rather than assumed** that its own new guard entry did not catch
them: the committed pattern required "nothing double-books AND nothing has to be undone" where the
booking page says "rearranged", and "can only ever offer" where it says "only ever offers". Run
against that file it matched zero lines.

Widened and rewritten **in the same commit**, because widening first turns the suite red on a page
nobody is fixing and this repo does not carry red tests. **Proved RED first**, naming all three
lines and their reasons, then rewritten, then green. The three now say which half a live calendar
can guarantee and which half it cannot, and the FAQ points at the scheduling article for the rest.

### The guard: ten new entries, every one proved RED

All ten were injected against the real files before being trusted green, and all ten fired.
**59 assertions passing** afterwards, the whole suite re-run.

**One `why` string was rewritten after it was first drafted**, and the reason belongs in this log.
The "ranked by payback" entry's first draft said the flagship's evidence shows the ranking rule is
*wrong*. It does not. Budzier and Flyvbjerg measured a fat tail; the conclusion that payback belongs
third is the flagship's ARGUMENT from that shape, and it is mine. What makes the service page a
defect is narrower and does not depend on the inference at all: **a commercial page was promising a
sort order that the article it links to argues against**, which is `SERVICES-CRITIQUE.md` section 2
exactly. The `why` now says which half is a measurement and which half is a conclusion.

---

## H5 — defects found by LOOKING, and the second pass

### FIVE THINGS WRONG IN ALT TEXT AND CAPTIONS

All six shipped plates were shot at BOTH crops and read, which is how Round G found a key that does
not exist in a photograph. Every alt is written from the 16:9 crop, the one a phone ships, which
Round F measured as the vertical superset.

- **type-case**: the alt enumerated a letter sequence (t, t, q, q, a, a, p) that does not match the
  crop and is not resolvable at the shipped size. It now names only the letters that are
  unambiguously legible, and says a few blocks are bare wood and most are darkened, which is what
  is actually visible.
- **dial-panel**: the central gauge carries TWO needles, one of them red, and there are three
  Cyrillic labels along the bottom rather than two. The alt also translated a stencil; it now
  describes the stencil without translating it.
- **dial-panel caption**: it said "three gauges, three needles". There are four needles between
  them. **This is the same class as Round G's invented CHARGE key**, arriving as a miscount rather
  than as an invention, and it was found the same way.
- **switch-box**: the wall is not identifiably concrete block, and two smaller enclosures sit below
  the levered boxes, one of which is the one carrying 500 V.
- **tool-wall**: the file comment claimed nothing in the photograph carries lettering. The phone
  crop has a labelled plastic bottle standing on the bench. The comment is corrected and the alt
  says "a labelled plastic bottle" without naming anything on a label it cannot read.
- **jacquard-cards**: four bands of cards are in the phone crop, not three, and "riding the head of
  a Jacquard loom" is an inference from the photograph's title rather than something visible.

### DATES AND A STORY WRITTEN FROM MEMORY

Rounds D and E caught themselves asserting an unverified fact as the STATED GROUND for a refusal.
This is the adjacent failure and it is worth naming separately: **an unverified fact asserted as
colour.**

The clone post opened its statute section with New York getting there first, in 1903, after a young
woman's picture appeared on flour advertisements and the courts found she had no remedy. Every part
of that is a thing I knew rather than a thing I read. **Checked directly: the nysenate pages for
CVR article 5 and for section 50 carry no enactment year, no chapter reference and no case name.**
The date, the superlative ("the oldest statute of its kind in the country") and the anecdote are
all gone. What replaced them is what the page does show: a single sentence, and a criminal one.

Section 50-f's "was added in 2020" became "has been in force since 2020, on the version history its
own page carries", which is a fact about the page rather than about the legislature.

**And the custom post's cold open failed its own arithmetic**: two years of weekdays is about five
hundred and twenty mornings, not eight hundred.

### TWENTY THREE UNCHECKED ASSERTIONS ABOUT THE WORLD

Swept for deliberately, because this is the class Round G found twenty six of. The pattern is the
useful part: *"most of the informal ethics of AI video rests on it"*, *"the most favourable
condition anybody has ever tested this under"*, *"not something most datasets in this field can
say"*, *"everybody in this trade already knows that"*, *"which never works"*, *"a credential nobody
will look at"*, *"Federal law is narrower than most people assume"*, *"Most people find the second
list is shorter"*, *"most submissions scored around what guessing would have scored"*, *"it has
never once been wrong in either direction"*, *"the data underneath it has never been open to
inspection"*, *"almost always the item with the most judgment in it"*, *"the workaround somebody
invented in 2022"*, *"Most people get to somewhere between eight and twenty"*, *"Most of what gets
sold under this name"*, *"usually measured in decades"*, *"A great deal of the most useful
functionality in any platform"*, *"the convention most of the software industry follows"*, *"usually
understood by exactly one person"*, *"almost nobody asks for it"*, *"Everybody who writes about
this"*, *"The most reproduced table in software economics"*, *"everybody who has owned one knows
that"*, *"The most common ending for a custom automation"*, *"usually takes one quiet quarter"*,
*"most of what gets built"*, *"usually within a year"*, *"the changes that break a chain are usually
not"*, *"it almost never gets noticed"*.

**Four of them were invented SPECIFICS rather than loose quantifiers**, and the worst was a
calculator hint claiming most people list between eight and twenty candidates, which is a number
about a population nobody has surveyed printed inside an instrument.

**One was a misreading of a source rather than an invention**, and it is the most important of the
twenty three: the DFDC scene said most submissions scored around what guessing would have scored.
The paper says 60 percent scored **at or better than** a coin flip and that many were simply
random. That is a different claim and the note now quotes the paper's shape.

### THIRTEEN SCENES RESTATING THE PROSE THEY STAGE

The class Round F caught six times and Round G four more, and **no gate in this repo can see it**:
`flagship.test.ts`'s echo test covers only `statement` scenes, and `siblingOverlap` deliberately
excludes scene text. That makes it **twenty three across three rounds**, which is now the strongest
standing argument in this file for building the test Round F specified.

Fixed on whichever side owns the material, using Round G's rule: a chart note keeps the CAVEAT
because a lifted chart has to carry its own, and the body keeps the quotes and the argument.

- the **tell-apart** note and the body both explained the trained group and the missing artefact;
- the **detector** note repeated a team count the body states two paragraphs above;
- the **credentials** grid was preceded by a paragraph defining a Content Credential and followed by
  a paragraph quoting the same guiding principle its middle card quotes;
- the **consent-path** diagram was preceded by a paragraph listing four of its six nodes;
- the **videos-calculator** note and the paragraph under it both argued that the smallness is the
  point;
- the **clone limits** line and the **wasted** grid both said the model has no sense of which
  sentences are expensive;
- the **adoption** note and the body both carried the 2017 reference-year caveat;
- the **subtractions** card one pre-empted the body's own worked example about a quarterly job;
- the **audit limits** line and the **wasted** grid both said the account is only as good as what
  people will say;
- the **notice** note enumerated the same three carve-outs the body then quotes in full;
- the **bearing** note and the body said the same two caveats in nearly the same words;
- the **custom limits** line and the **wasted** grid both said a build with no review date runs
  until a vendor breaks it.

### BAND RHYTHM, and two charts moved for a measured reason

`scripts/_scratch-e-bands.mjs`, unchanged.

| post | longest single-tone run | adjacent same-tone pairs |
|---|---|---|
| crm-sync (Round D, unchanged) | 4,176px (**14%**) | 8 |
| ai-clone | 5,140px (**17%**) | 9 |
| ai-audit | 2,746px (**10%**) | 6 |
| custom-automation | 4,424px (**16%**) | 7 |

**Reproducing Round D and Round G's published 4,176px exactly on an unchanged post is what
validates the instrument** before it is trusted about a new one.

Two charts were moved from light to dark, measured rather than chosen. With `outcomes` and
`bearing` on a light field, the prose either side of each ran as one pale band of **18 percent** and
**21 percent** of the article, against a shipped cohort range of 14 to 17. After the flip: 10 and
16. Clone's 17 percent is the calculator and the offer, both of which are FIXED light by their own
types, and it is inside the shipped range.

### The calculators and the charts were read at full size before they were kept

Every chart shot at 390 DPR3 at real size and read. **No bar label wraps at 390** on any of the six
charts. The smallest bar drawn anywhere this round is the audit outcomes chart's 6 percent, which
against a 100 axis is a short bar rather than a hairline; the two figures deliberately NOT drawn
(machine learning at 2.9 percent, and the chance line at 50) are in their notes with the reason,
which is the discipline Round G established when it removed a $25,000 bar.

All three calculators driven to their maximum at 390 and 1440 with `_scratch-calc.mjs`:
**`overflowX=0` on all six runs**, all three ladders reconcile with their headline at rest and at
maximum, and no resting state shows anything alarming before the reader touches it (8 hours a year;
3.3 candidates left; 10 changes a year).

---

## Verification

All gates FOREGROUND, on the disk as committed, against the single existing `:3100` dev server. No
second server was started. The Vercel build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1301 passed (1301)
   Duration  12.26s

$ node scripts/flagship-standard.mjs http://localhost:3100
COHORT
post                      proseWords      sections     citations  faqQuestions    bodyImages  dataGraphics ... siblingOverlap
ai-chat                         3597            19             4             7             6             2  ...   0
ai-voice                        3587            21             6             5             6             3  ...   0
database-reactivation           3675            19             4             5             6             2  ...   0
ai-lead                         3653            21             4             5             6             2  ...   0
workflow-automation             3667            19             4             6             7             2  ...   0
automated-google                5503            22             4             7             6             2  ...   0
ai-appointment                  4674            21             4             7             7             3  ...   0
local-seo                       5847            21             4             8             7             2  ...   0
geo-landing                     5783            21             6             8             7             3  ...   0
crm-sync                        6413            24             7             8             7             3  ...   0
ai-agent                        5488            23             5             8             7             3  ...   0
skip-tracing                    6710            22            10             8             8             3  ...   0
marketing-automation            5725            23            10             8             7             3  ...   0
document-processing             6156            23             6             8             7             4  ...   0
data-enrichment                 6441            24             7             8             7             4  ...   0
ai-scheduling                   6242            24             5             8             7             3  ...   0
invoicing-and                   6151            23             9             8             7             4  ...   0
ai-clone                        6120            23             8             8             7             3  ...   0
ai-audit                        5641            22             5             8             7             3  ...   0
custom-automation               5581            22             6             8             7             3  ...   0
required                        3587            19             4             5             6             2  ...   2
available                       5683            22             5             8             7             3   <- --ratchet

all 20 posts meet the standard.

$ node scripts/check-svg-crop.mjs http://localhost:3100
PASS  ai-clone-real-estate-agent-video-avatar        22 text nodes in role="img" graphics
PASS  ai-audit-small-business-what-not-to-automate   22 text nodes in role="img" graphics
PASS  custom-automation-real-estate-bespoke-build    22 text nodes in role="img" graphics

468 text node(s) checked, 0 cropped.
```

The seventeen shipped posts were re-proven green by the SVG guard in the same run before it was
trusted about the three new ones.

Test baseline: **93 files / 1271 tests** at the end of Round G, **93 / 1301** after this one. Up,
never sideways. The 30 new tests are the three topics joining the table-driven content contract in
`lib/blog/flagship.test.ts` (ten checks each). The ten new `ZOMBIES` entries add no test of their
own by design: each is checked against every file the guard already reads.

**Three tests failed on the way and every one of them was right.** `index.test.ts`'s
meta-description band caught two `seoDescription` strings at 175 and 174 characters against a 170
ceiling. And the zombie guard failed the red proof twice, for the right reasons, described in H4.

### score-flagship: 17/19 for all three, and both reds are true

```
$ node scripts/score-flagship.mjs ai-clone-real-estate-agent-video-avatar http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-26 modified=2026-08-26
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs ai-audit-small-business-what-not-to-automate http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-26 modified=2026-08-26
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs custom-automation-real-estate-bespoke-build http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-26 modified=2026-08-26
17/19 mechanical checks pass.
```

Same two honest reds as Rounds B to G, for the same two reasons. Films are owner-held. `updated` is
deliberately absent with a comment in `content/blog/posts.ts` saying so, because a post written and
shipped inside one day has not been revised. **Nothing was faked and no baseline was moved.**

### Rendered and read, at 1440 and 390 DPR3

Every scene of all three posts, all three service pages, the booking service page and the blog
index, with every `.reveal` asserted at opacity 1 before the shutter (`scripts/_scratch-h-scene.mjs`
prints the count of nodes still under opacity 1 and it was 0 on every shot).

```
scrollWidth == viewport width at 320, 390 AND 1440:
  /blog/ai-clone-real-estate-agent-video-avatar
  /blog/ai-audit-small-business-what-not-to-automate
  /blog/custom-automation-real-estate-bespoke-build
  /services/ai-clone   /services/ai-audit   /services/custom-automation
  /services/ai-appointment-booking   /blog
overflow=0px on every one of them.
```

Every plate was judged at BOTH shipped crops before it was chosen and again after it shipped, which
is how the four alt-text errors and the miscounted caption were found.

**Every external link on the three posts and the three service pages was fetched: 17 of 18 return
200.** The eighteenth is `dl.acm.org`, and it is 403 ON PURPOSE: it is linked precisely so a reader
can try the thing the article says could not be read. It was checked in headless Chromium as well as
in a plain client, and both get a Cloudflare bot interstitial, which is why the page says an
automated request rather than saying the library refuses everybody.

Probe rails held. `**/api/lead` was aborted in every browser run, including in the two new scratch
probes. No film, avatar or HeyGen work, and no vendor pricing was fetched. Nothing touched in
`next.config.ts`, the CSP, security controls or `lib/idx`. No MLS, DATA-API or media.mlsgrid.com
call exists in any page or probe path added this round.

**Two known probe limitations, recorded rather than papered over.** `_scratch-e-overflow.mjs` lists
one "offending" node on every service page at 320 and 390 (the hero wash), because it only looks for
an ancestor with `overflow-x: auto|scroll` and does not check `hidden`. The authoritative line is
`scrollWidth`, which is 0px over everywhere. And **`export MSYS_NO_PATHCONV=1` is required before
any probe taking a leading-slash path**, which Rounds F and G both recorded and which bit again
this round.

**One instrument error made and corrected**, worth recording because it produced the exact lie Round
G documented. `_scratch-h-bleed.mjs` first imported `POSTS` from `flagship-standard.mjs`. That file
is a script rather than a module, so the import RAN the whole measurement, and because one page
failed to load in that run it printed "18 of 18 posts are below the standard" with every post
reporting `siblingOverlap` of exactly 54, which is also the chrome count. **A uniform number equal
to the chrome count is the signature of a flaky page load, not a regression.** The probe now reads
the slug list out of the file as text.

---

## THE RATCHET WAS NOT RUN, and this is the SIXTH round to decline for the same reason

`available` measures **proseWords 5,683, sections 22, citations 5, faqQuestions 8, bodyImages 7,
dataGraphics 3**. Ratcheting would put **six of the seventeen older posts below the bar by
construction**: ai-chat (3,597), ai-voice (3,587), database-reactivation (3,675), ai-lead (3,653),
workflow-automation (3,667) and ai-appointment (4,674) are all under 5,683, five carry 2 data
graphics rather than 3, and six carry fewer than 8 FAQ questions.

Round G measured `available` proseWords at 5,725 and this round measures 5,683, which is the first
time the median has gone DOWN. That is not the gap closing. It is arithmetic: the median of twenty
sits between the tenth and eleventh values, and three new posts near 5,600 landed just below where
the seventeen-post median sat.

Closing it honestly is still a six-post writing job rather than a flag flip. Rounds C, D, E, F and G
measured it and declined for exactly this reason; the brief for this round says explicitly not to
ratchet. **So the bar was measured, reported and left where it is.**

**Recommendation for the orchestrator, unchanged and now six rounds old:** it is six posts, the set
is now complete so the median will stop moving, and it is a deliberate writing round rather than a
side effect of anything.

---

## Deliberately NOT done, and why

1. **The ratchet.** See above. Measured, reported, left where it is.
2. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on all three.
3. **`_scratch-echo.mjs` promoted to a committed test.** Rounds C, D and E recommended it; Round F
   wrote the specification (compare a scene's NOTE against the paragraphs adjacent to its MARKER,
   not a grep for shared strings anywhere); Round G found four more by eye. **This round found
   thirteen more, which makes twenty three across three rounds.** It is the single highest-value
   piece of instrument work left in this project. **Recommended, with Round F's specification
   unchanged.**
4. **`stat.source` made REQUIRED.** Measured this round rather than assumed: **16 of the 20 service
   pages carry a `stat` and 15 of those carry a `source`**, up from 12 with a source at the end of
   Round G. **The four with no stat are `ai-voice-agents`, `database-reactivation`,
   `lead-qualification` and `workflow-automation`; the one with a stat and no source is
   `ai-chat-assistant`.** That last one is the interesting entry, because it is the page
   SERVICES-CRITIQUE section 2 was written about. One short dedicated pass.
5. **Tier reassignment**, still an owner call. All three of this round's pages are `tier: "core"`
   and now carry flagships of 6,120, 5,641 and 5,581 words.
6. **The EU AI Act.** Unreachable through two clients and four URLs. Nothing asserted.
7. **The `/ai` COPY reconciliation.** Thirteen keys wide now. An owner decision, below.

## Defects found and NOT fixed

- **`ai-clone`'s `lede` and `specs` name two vendors as a quality benchmark**: "A HeyGen-class video
  avatar plus an ElevenLabs-class voice clone" and the chips "HeyGen-class avatar" and
  "ElevenLabs-class voice". That is a claim about how good our avatar is, made by comparison, on a
  pipeline this round was instructed not to touch. It is /ai COPY seeded verbatim. **Flagged rather
  than changed**, because changing it is both a widening of the drift and a statement about the
  avatar, and the avatar is the owner's.
- **The `/ai` COPY drift is now THIRTEEN keys wide.** `ai-audit.lede`, `ai-audit.specs`,
  `ai-audit.why` and `custom-automation.why` join the nine Round G recorded. All four were changed
  because the page could not support them, which is the same test every previous change met.
  Reconciling thirteen keys is an owner decision and it is getting less optional with each round.
- **`invoicing-and-payments.ts`'s `title` and `lede`**, flagged by Round G, are unchanged. Out of
  scope this round.
- **`scripts/_scratch-h-owner.mjs`'s "names seen" line is useless.** It reads the text of
  `a[href*="/photos/"]` and returns navigation chrome on every page. `.owner-name` is the field that
  works. Harmless, recorded so nobody trusts the wrong line.
- **The floating rail sits over a chart note or a calculator row** at one scroll position on all
  three posts at 390. Standing rail behaving as designed on every flagship since Round C, not a
  Round H regression, noted only because it appears in the shots.

## Unknown product facts, for the owner, not writable

**The clone topic's are the sharpest in the whole rollout, because the article's argument is that
the answers are the product.**

1. **Does a consent document exist, and what does it say?** The article says a consent should name
   the person, say what may be made from the recording, say how long it lasts and say what happens
   on revocation. If there is no such document, the service page's first `howItWorks` step is
   aspiration.
2. **What happens to an agent's model when they leave the brokerage?** The post says this should be
   written down before it is needed and the service page now says the same. Whether our builds
   handle it is a product fact.
3. **Is there a disclosure line in what we produce?** The service page now says every video says it
   was made with an AI avatar, and that is the single most load-bearing product claim added this
   round. If the build does not do it, the page over-claims on exactly the point the article says
   is the honest one.
4. **Is there a review step before a video sends, and who is named for it?** The whole calculator
   rests on the answer being yes and on somebody owning it.
5. **Does the script layer have a list of sentences it may not generate?** School districts, tax
   figures, boundaries, permits. The page says these are decided by a person in advance.
6. **Does the audit actually produce a written list of what NOT to build?** The entire argument of
   topic 19 and the fourth card of its main scene. If the deliverable is only the shortlist, the
   page is describing a better product than the one that ships.
7. **Does the audit end in one automation built and running?** Claimed on the page before this round
   and kept. It is the thing that distinguishes it from a sales call.
8. **What is the audit's price, and is a "no" genuinely cheap?** The post says it is deliberately
   priced so that the answer being no costs almost nothing. That is a commercial fact.
9. **Do custom builds fail loudly, and where does the alert go?** The custom post names this as the
   highest-return item in the subject and the service page now says the chain fails loudly.
10. **Is there a written handover document with each build, in the language of the business?** Added
    as a `howItWorks` step this round. If it is not produced, that step should come back out.
11. **Does a client's build run in an environment and on credentials they control?** The FAQ says it
    should be true rather than promised.
12. **Is there a review date on anything we have built?** The post says nothing retires itself and
    that a date in a calendar is the only mechanism that ever switches one off.
13. Rounds A to G's remain open, and Round G's first two are still the most consequential in the
    set: whether a scheduling build tells a client a TIME or a REQUEST, and whether it releases a
    held slot when a proposal dies. Plus the voice recording question, review automation's gating,
    the review widget's selection rule, the booking layer's calendar access, the Business Profile,
    the geo human-editing step, the CRM sync review queue, agent-workforce draft-or-send, the
    skip-tracing source and date, the enrichment permitted purpose, the do-not-call scrub, SPF DKIM
    and DMARC, Google Postmaster Tools, document-processing abstention, the flagged-value queue,
    stored source documents, enrichment overwrite behaviour, the BatchData age field, the invoicing
    event question, how a payment is judged received, the 3/7/14 cadence, and whether anything we
    build touches a client or escrow account.

---

## WHAT A FRESH-EYES CHECKER SHOULD RE-EXAMINE FIRST

The rollout is complete, so the next agent on this body of work is the checker. This is the
priority order, written by the person most likely to have been wrong.

1. **The alt text on every plate in the whole cohort, at the 16:9 crop.** Round G found an invented
   key. Round H found five more errors across three of its six plates, in the same pass, by the same
   method. **That is a hit rate of one plate in two.** Twenty seven plates from Rounds E, F and G
   have never been re-read against the shipped crop by anybody other than the round that wrote them.
   This is the single highest-yield check available and it takes an hour.
2. **Every DATE, YEAR and ORIGIN STORY on all twenty posts.** This round found three dates and an
   anecdote written from memory on one post. That class does not trip any gate, does not trip the
   zombie guard, and reads as authoritative. Grep for four-digit years and check each one against a
   page somebody actually opened.
3. **The scenes that restate the prose they stage.** Twenty three found across three rounds by eye,
   and the test to catch them has been recommended four times and never built. Read every chart note
   against the two paragraphs either side of its marker.
4. **The three refusals in this round, followed rather than accepted.** Round G's second pass found
   that BOTH of its refusals rested on reasons that were wrong. This round's three are: no
   maintenance share (ACM 403 behind a bot check, computer.org a shell), no automation failure rate
   (Eveleens and Verhoef), and no personalised-video response rate (all vendor, no stated sample).
   The third is the weakest, because it rests on a search rather than on a document. **Somebody
   should try harder to find a non-vendor measurement of what a personalised video does**, and if
   one exists, the clone post's calculator note is wrong.
5. **The one INFERENCE this round asserts**, which is that payback belongs third in an audit's
   sort order. The fat-tail measurement is Budzier and Flyvbjerg's; the conclusion is the flagship's.
   It is argued rather than measured and it now shapes two service pages. A checker who disagrees
   with it should say so.
6. **Whether the twelve product facts above are true.** Six of them are now asserted on a service
   page. If any is false, the page over-claims, and it over-claims on precisely the points the
   articles say are the honest ones, which is the worst place for it.
7. **`standard.json`, and whether the six older posts should be brought up.** Six rounds have
   measured and declined. The set is complete now, so the median will stop moving, which removes the
   only argument for waiting.
