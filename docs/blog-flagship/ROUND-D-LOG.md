# ROUND D — the two plumbing topics, argued as a record and as a workforce

**Built 2026-08-25.** Scope: `crm-sync` and `ai-agent-workforce` written to the flagship standard,
their service pages synced, and the unsourced claims the research killed on the way. Six commits on
`main`, **not pushed**: the orchestrator verifies and pushes.

```
0d40b20  D1  topic 10, two-way CRM sync, argued as a system of record rather than as plumbing
2eccd73  D2  topic 11, the AI agent workforce, argued as what supervising several agents costs
8f9b210  D3  the sibling bleed, caught by the metric and fixed in the sentences
0c7e79a  D4  the two service pages synced, and six claims that did not survive the research
b12253b  D5  nine defects found by LOOKING at the rendered pages, that no gate could see
d4eb241  D6  the second pass, and two things it caught that were worse than an invented number
```

**Two posts, ZERO new components.** Eleven topics on the template now and ten in a row that add
none. The bespoke-component hatch was not opened and did not need the calculator-lesson test.

---

## D0 — the ratchet was NOT run, and that is the same decision Round C made, for the same reason

`--measure` first, before any content was written:

```
STANDARD  (the recorded bar)
required                        3587            19             4             5             6             2  ...  2
available                       3675            21             4             7             6             2   <- --ratchet
```

Ratcheting would have raised `proseWords` to 3,675, `sections` to 21 and `faqQuestions` to 7, which
puts **five of the nine shipped posts below the bar by construction**: ai-chat (3,597 words, 19
sections), ai-voice (3,587, 5 FAQ), database-reactivation (19 sections, 5 FAQ), ai-lead (5 FAQ) and
workflow-automation (3,667, 19 sections). Closing that honestly means writing a new section into
five articles that are not this round's topics.

The repo's discipline is "ratchet at the START of a round". Round B ratcheted this cycle, Round C
measured and declined for exactly this reason, and the brief for this round states the bar as a
given. So the bar was measured, reported and left where it is, and the two new posts were built
well clear of it (6,413 and 5,488 prose words, 24 and 23 sections, 8 FAQ entries each) so the next
ratchet is not made harder by them.

**The available row has moved since Round C** and it is worth recording: `bodyImages` is now 7
rather than 6, because seven of eleven posts carry seven. `proseWords` is available at 4,674 rather
than 3,675, because the median has walked up as the new posts land.

**Recommendation for the orchestrator, unchanged from Round C:** the next ratchet is a five-post
writing job, not a flag. It is worth doing deliberately in a round that has room for it.

---

## The risk this round was set up to fail, and how the two seams were drawn

Both topics are "plumbing", and `workflow-automation` is the nearest sibling to BOTH. It was read
in full before a word was written. It owns busywork: the manual step, what an interruption costs,
the chain that fires by itself, the platforms that switch a chain off at a 95 percent error rate.
It mentions a duplicate record **exactly once**, as step five of an eight step example, and that
single line is the whole seam with topic 10.

| | topic 5, workflow (shipped) | topic 10, CRM sync | topic 11, agent workforce |
|---|---|---|---|
| the unit | a step of WORK | one FACT, in two places | many agents, DIFFERENT jobs |
| the question | what does the manual version cost | are these two rows the same woman | is it right every time, and who is answerable |
| the held moment | a highlighter over one deal | two contact records for one seller | nine good mornings and a tenth |
| the hero | none (film) | `2` records | `10` mornings |
| the evidence | one field study of desk workers | record linkage, from the Census Bureau | two agent benchmarks, plus BLS and NY licence law |
| the hard constraint | a chain that fails quietly | two error rates that cannot both be zero | a success rate that falls when you repeat it |
| the calculator's unit | hours a year of typing | a COUNT of pairs a person must settle | hours a year of READING |
| what the calculator refuses | the 25 min 26 sec interruption cost | any duplicate rate at all, and any dollar per stale record | any hours-saved row, and any division by a salary |
| the charts | one, light | two, one light one dark | two, one dark one light |

Topic 10's comparison FAQ hands the work question to topic 5; topic 11's hands the judgement
question back. Neither summarises the other, and neither summarises topic 10.

**Measured: sibling overlap 0 for both, and 0 across all eleven posts.** It was **15 and 18** on the
first run and every shared phrase was mine. See D3.

---

## D1 and D2 — the sources, each read in the primary document, none of them previously spent

### Topic 10: `/blog/crm-sync-real-estate-duplicate-contact-records`

*"She Is In Your CRM Twice. Only One of Them Knows She Sold."* Thirteen scenes, zero components,
no film.

| source | what was read | where |
|---|---|---|
| **William E. Winkler, "Overview of Record Linkage and Current Research Directions", U.S. Census Bureau Research Report Series (Statistics #2006-2), 8 February 2006** | The document this post rests on, read end to end with `pdftotext`. The decision rule, quoted as written: *"If R > T_mu, then designate pair as a match. If T_lambda <= R <= T_mu, then designate pair as a possible match and hold for clerical review. If R < T_lambda, then designate pair as a nonmatch."* And the sentence underneath it, which is the article's spine: *"The cutoff thresholds T_mu and T_lambda are determined by a priori error bounds on false matches and false nonmatches."* Plus *"Rule (2) partitions the set into three disjoint subregions. The region T_lambda <= R <= T_mu is referred to as the no-decision region or clerical review region."* The measurement: *"even high quality files might contain 20+% error in first name pairs and 10+% error in last name pairs among pairs that are true matches."* The workload: *"In a very large 1990 Decennial Census application, the computerized procedures were able to reduce the need for clerks and field follow-up from an estimated 3000 individuals over 3 months to 200 individuals over 6 weeks"*, and the half nobody quotes, *"The reason for the need for 200 clerks is that both first name and age were missing from a small proportion of Census forms and Post Enumeration Survey forms."* The four examples of what counts as a difference between two records for the same person: *"first name pairs such as (Bill, William), (Mr, William), (William, James), or (William, Willam)"*. Blocking, credited to *"Newcombe (1962, 1988)"*. And the counter-intuitive one: *"Generally, having more fields than 6-10 fields for matching is not needed."* | census.gov PDF |
| **United States Census Bureau, "Frequently Occurring Surnames from the 2010 Census"** | Read on the Bureau's own page, which carries both the method and the top ten in the page itself: *"Tabulations of all surnames occurring 100 or more times in the 2010 Census returns are provided in the files listed below"* and *"the complete list of 162,253 names."* Smith 2,442,977 / Johnson 1,932,812 / Williams 1,625,252 / Brown 1,437,026 / Jones 1,425,470. | census.gov |
| **RFC 9110, HTTP Semantics** | Two sections. 9.2.2: *"A request method is considered 'idempotent' if the intended effect on the server of multiple identical requests with that method is the same as the effect for a single such request."* · *"Idempotent methods are distinguished because the request can be repeated automatically if a communication failure occurs before the client is able to read the server's response."* · *"A client SHOULD NOT automatically retry a request with a non-idempotent method unless it has some means to know that the request semantics are actually idempotent"* · and the dry one the post quotes, *"Some clients take a riskier approach and attempt to guess when an automatic retry is possible."* 13.1.1 names the failure: *"If-Match is most often used with state-changing methods (e.g., POST, PUT, DELETE) to prevent accidental overwrites when multiple user agents might be acting in parallel on the same resource (i.e., to prevent the 'lost update' problem)."* | rfc-editor.org, plain text |
| **RFC 5789, HTTP PATCH** | *"The PUT method is already defined to overwrite a resource with a complete new body, and cannot be reused to do partial changes."* · *"In a PUT request, the enclosed entity is considered to be a modified version of the resource stored on the origin server, and the client is requesting that the stored version be replaced. With PATCH, however, the enclosed entity contains a set of instructions describing how a resource currently residing on the origin server should be modified to produce a new version."* · *"Collisions from multiple PATCH requests may be more dangerous than PUT collisions because some patch formats need to operate from a known base-point or else they will corrupt the resource."* · and the all-or-nothing rule: *"The server MUST apply the entire set of changes atomically and never provide ... a partially modified representation. If the entire patch document cannot be successfully applied, then the server MUST NOT apply any of the changes."* | rfc-editor.org, plain text |
| **HubSpot CRM API, Contacts** | The vendor primary that is deliberately NOT Zapier or n8n, and it is one of the three CRMs this service page names. *"You can also batch create and update contacts at the same time using the upsert endpoint. For this endpoint, you can use email or a custom unique identifier property... if the contacts already exist, they'll be updated and if the contacts don't exist, they'll be created."* · *"Partial upserts are not supported when using email as the idProperty for contacts. To complete a partial upsert, use a custom unique identifier property as the idProperty instead."* · *"Additional email addresses ... can be added automatically following a contact merge. Additional emails are still unique identifiers for contacts, so multiple contacts cannot have the same additional email addresses."* · *"Batch operations are limited to 100 records at a time."* Page footer: last modified 13 April 2026. | developers.hubspot.com |

**Fellegi and Sunter 1969 is credited and deliberately NOT quoted.** It is the origin and the
article says so, but every free copy traced to a dead university course link and the publisher's
copy is paywalled. What is quoted is Winkler's restatement, which was read in full. The scene file
records this so a future session does not assume the 1969 paper was read.

**Cited data graphics:** the five commonest surnames (five bars, **no axis maximum**, Brown lit
because it is the surname in the cold open, and the smallest bar is 58% of the largest so nothing
renders as a hairline) and the 1990 Census clerical load (two bars, **no axis maximum**, and the
200 bar is a sliver on purpose). **The 20%/10% name-error finding stays in the prose**, because
"20+%" is a lower bound and drawing a bar at exactly 20 would turn a bound into a measurement.

**The calculator refuses the duplicate rate.** Chain: contacts in your CRM, times the share who
could have reached you more than one way, times the share of those where the details would not
match exactly, times the minutes to decide one, into hours. **The headline is the middle row**, the
count of pairs a computer should not settle on its own, because that is the number that decides
whether the project is an afternoon or a fortnight and it is the one nobody quotes on. What it
refuses, on screen: any figure for how many duplicates the reader has, and any dollar value for a
stale record.

### Topic 11: `/blog/ai-agent-workforce-real-estate-assistants`

*"Four Assistants Ran Overnight. Nobody Read What They Did."* Thirteen scenes, zero components,
no film.

| source | what was read | where |
|---|---|---|
| **Yao, Shinn, Razavi and Narasimhan, "tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains", arXiv:2406.12045, 17 June 2024** | Read in the arXiv PDF with `pdftotext`. The metric, quoted: pass^k is *"the chance that all k i.i.d. task trials are successful, averaged across tasks"*, proposed because real deployments need *"reliability and consistency"* rather than one good attempt. The finding: *"Even for the best-performing gpt-4o function calling agent which has a > 60% average task success, pass^8 drops to < 25%."* Table 1: tau-retail is 500 users, 50 products, 1,000 orders and 115 tasks; tau-airline is 500 users, 300 flights, 2,000 reservations and 50 tasks. Table 3, the ablation: gpt-4o 61.2 to 56.8 in retail, 33.2 to 10.8 in airline, and the paper's own gloss, *"removing the policy hurts gpt-4o significantly (-22.4%)"*. The failure breakdown of 36 hand-examined failures: wrong argument 33.3%, wrong decision 25.0%, wrong info 22.2%, partial resolution 19.4%. The cost: *"the agent / user simulation costs are $0.38 / $0.23 per task respectively"* and *"the input prompt / completion output take up 95.9% / 4.1% of the price respectively, so the cost is mainly due to long system prompt."* | arxiv.org |
| **Cemri and twelve co-authors (UC Berkeley), "Why Do Multi-Agent LLM Systems Fail?", arXiv:2503.13657v3, 26 October 2025** | Read in the arXiv PDF with `pdftotext`. Method: *"we first collect 150 traces from five MAS frameworks, which are closely examined by six human experts"*; the taxonomy is validated through inter-annotator agreement studies reported at 0.88; the full set is *"1642 annotated execution traces"* from seven frameworks. Figure 1's caption states its own sample: *"The percentages shown represent the prevalence of each failure mode and category as observed in our analysis of 1642 MAS execution traces."* Categories: System Design Issues 44.2%, Inter-Agent Misalignment 32.3%, Task Verification 23.5%. Individual modes: step repetition 15.7%, reasoning-action mismatch 13.2%, unaware of termination conditions 12.4%, disobey task specification 11.8%. And the headline: *"analysis reveals 41% to 86.7% failure rate on 7 state-of-the-art (SOTA) open-source MAS."* | arxiv.org |
| **U.S. Bureau of Labor Statistics, Occupational Outlook Handbook** | The real wage, replacing the unsourced salary comparison this whole category runs on. *"The median annual wage for secretaries and administrative assistants was $47,460 in May 2024"*, which the Quick Facts table gives as $22.82 an hour; 3,453,100 jobs; job outlook 2024-34 *"0% (Little or no change)"*; employment change -12,400. The Bureau's own definition, quoted because half of this category's arithmetic depends on people not knowing it: *"The median wage is the wage at which half the workers in an occupation earned more than that amount and half earned less."* From the second page: *"The median annual wage for real estate sales agents was $56,320 in May 2024"* and the median for all occupations, $49,500. | bls.gov, two pages |
| **New York Department of State, Real Estate License Law (January 2024)** | The accountability half, read in the Department's own PDF. Section 442-c: *"No violation of a provision of this article by a real estate salesperson or employee of a real estate broker shall be deemed to be cause for the revocation or suspension of the license of the broker, unless it shall appear that the broker had actual knowledge of such violation or retains the benefits, profits or proceeds of a transaction wrongfully negotiated by their salesperson or employee after notice of the salesperson's or employee's misconduct."* Section 440-a lists who may be licensed: *"No person, co-partnership, limited liability company or corporation shall engage in or follow the business or occupation of, or hold themselves or itself out or act temporarily or otherwise as a real estate broker or real estate salesperson in this state without first procuring a license therefor."* And 19 NYCRR 175.21(a), borrowed **openly as an analogy** rather than applied as a rule: supervision *"shall consist of regular, frequent and consistent personal guidance, instruction, oversight and superintendence by the real estate broker with respect to the general real estate brokerage business conducted by the broker, and all matters relating thereto."* 175.21(b) adds the written-records duty. | dos.ny.gov PDF |

**Cited data graphics:** the three MAST failure categories (three bars, axis 100, the design
category lit) and the tau-bench policy ablation (four bars, axis 100, the collapse lit). **The
pass^k finding stays in the PROSE**, and that is the same judgement the local SEO post made about a
negative ROI: the paper states it as *"pass^8 drops to < 25%"*, a bound is not a value, and a bar
drawn at 25 for "under 25" would be a measurement nobody made.

**Two tables in one paper disagree, and the chart uses one of them.** tau-bench's Table 2 reports
gpt-4o at 35.2 in the airline domain; Table 3, the ablation, reports 33.2 as its own baseline for
the same model. Mixing them would have produced a chart whose arithmetic matched neither table, so
all four bars come from Table 3 and the basis line says so. The MAST paper likewise carries a
second, uncaptioned copy of its taxonomy figure with different percentages (37.17 / 31.41 / 31.41);
the chart uses Figure 1, whose caption names its sample, and the scene file records that the other
one was seen and refused.

> **Verified 2026-08-27 (round 47), and it needed verifying.** The round-46 checker searched the
> v3 source for 37.17 / 31.41 / 31.41, found nothing, and reported this sentence as unsupported.
> Round 47 pulled the published v3 PDF and the arXiv source package and found all three: they
> render at lines 251 to 253 of `pdftotext -layout`, drawn inside
> `figures/arxiv_figure_neurips_cropped.pdf`, which `04_methodology.tex:6` includes as the
> methodology workflow figure. They are also the ONLY category split in v1, which is where that
> older taxonomy panel comes from. One refinement to the wording above: the figure carrying it does
> have a caption, about the workflow rather than about the taxonomy, so the taxonomy panel inside
> it is what is uncaptioned, and the point the sentence is making, that nothing there names a
> sample, holds. Round 46's own conclusion about this paper was reversed the same way; see
> `docs/parity/ROUND46-RELEVANCE-PASS.md`, "Round 47: this section reached the right chart by the
> wrong route".

**The calculator computes what the service COSTS, which is the first one on this website that
does.** Chain: assistants you would run, times pieces of work each produces a week, times 52, times
the share you would actually read, times the minutes to read one, into hours. Headline: hours a
year reading their work. It refuses an hours-saved row, because nobody has published a measurement
of how long an assistant's draft takes a person to check in this industry, and it refuses any
division by the BLS median that the same article quotes, because that wage buys accountability,
judgement and somebody who notices the job has changed.

### Sources deliberately NOT used

- **GAIA (Mialon et al., arXiv 2311.12983).** Read in the PDF, and it is a good paper: 466
  questions, human respondents 92%, GPT-4 with plugins 15%, and the authors' own caution that the
  plugin score is *"an oracle estimate"* because plugins were chosen by hand per question. It was
  left out because it is November 2023 and its headline model number is now three model
  generations stale, so using it would have cost a paragraph of disclaiming to buy a fact the
  other two papers already carry better.
- **Fellegi and Sunter 1969 itself.** See above. Credited, not quoted.
- **Google People API and Stripe's idempotency reference**, both considered as the non-Zapier
  vendor primary. Both render their documentation in JavaScript: the served HTML for
  `developers.google.com/people/v1/read-people` carries under 5KB of text and comes back in
  Turkish, and `docs.stripe.com/api/idempotent_requests` is 1.2MB of HTML carrying 10KB of
  navigation. HubSpot's contacts page is server-rendered and is the CRM the service page names, so
  it is the one used.
- **nysenate.gov and law.justia.com both return 403 to a programmatic request.** The Department of
  State publishes the same statute as a PDF and that is what was read.

---

## D3 — the sibling bleed, and it was 18 phrases of my own writing

`flagship-standard.mjs` put crm-sync at 15 and ai-agent at 18 against a ceiling of 2 on the first
run. `_scratch-overlap.mjs --phrases` printed them and every one was mine:

- a whole sentence lifted from workflow automation: *"...will eventually guess wrong in front of a
  client, in writing, at a time of its own choosing."*
- that post's definition of automation (*"so that finishing one step starts the next"*), its
  close (*"on the RealtyLT AI page, and what..."*, *"if you would rather somebody sat..."*), and
  *"with somebody arguing with you about it"*.
- the two NEW posts sharing their own cost-section opening (*"There is no price on this page, and
  the reason is..."*, which ai-chat also has), their own comparison FAQ (*"They are usually built
  with the same tools and they answer different questions"*) and their own close.
- the CRM cold open echoing the reactivation post's first line: *"filled in the home valuation form
  on your website"*.

Twelve sentences rewritten. Cohort back to **0 on every post**. The bar was not touched.

---

## D4 — the service pages, and six claims that did not survive the research

Both pages lead with their own flagship and carry the other new post second. The chat and voice
posts came off `crm-sync.relatedPosts`; workflow stays third on both because it is genuinely the
adjacent read.

| file | was | now |
|---|---|---|
| `crm-sync.why` | "Agents lose deals to stale, half-updated CRMs" and "the record you look at is the record that's true" | the mechanism, which needs no figure under it. **This is /ai COPY drift** |
| `crm-sync.figure.footnote` | "The deals lost to a stale CRM are lost quietly, which is why nobody counts them" | the same claim one field lower, which is the Round B and C pattern exactly. Replaced by what the arrows actually are: three decisions somebody made |
| `crm-sync.howItWorks[2]` | "Deduping and conflict rules mean one contact stays one contact" | the mechanism including the third outcome. A flat guarantee is not available when the published model sets its thresholds from two error rates |
| `crm-sync.faqs[2]` | a flat **"No."** to whether it creates duplicates | what a build actually promises, and what no honest build promises |
| `crm-sync.useCases[1] and [2]` | "a large share of admin hours" and "entirely avoidable" | gone, both unsourced |
| `ai-agent-workforce.figure.footnote` | "adding a fifth costs a conversation, not a salary" | the same comparative-salary claim Round B killed on the voice page. What grows is the reading, not the payroll |

Both pages gained a sourced `stat` (Winkler's 20%+ first-name error; the Berkeley 44.2%), a fifth
`limit` lifted from the post, and a new FAQ each (which side wins a conflict; what happens when an
assistant is wrong). `ai-agent-workforce.howItWorks[1]` gained the brief, because the ablation is
the argument for writing one.

Three of the six are guarded in `lib/blog/zombie-claims.test.ts`, **proved RED before being
trusted green** against the real files rather than a synthetic string: restoring all three failed
the test naming lines 55, 59 and 96 with a reason for each. Restored, green.

---

## D5 — nine defects found by LOOKING, that no gate could see

**An alt text wrong in three ways at once, and it is the fourth round running for this class.** The
CRM post's closing plate was written as *"A low wall faced in rounded river stones ... its flat roof
planted as a garden."* Photographed at the plate's real 21:9 geometry it is a stone-faced building
front with a small gable; the number 1734 sits high on that gable rather than at eye level; the
digits are picked out in the stonework and are not obviously paler; and the planted roof runs off
to the right rather than belonging to the wall. Three wrong claims in one sentence, none of them
visible from the content file. The other three plates were checked the same way and hold.

**An invented count in my own caption.** The agent post's brief plate said *"Six words on a board"*
and the board reads MILK / DOG FOOD / COFFEE / BREAD / CHEESE / SOAP. That is six lines and seven
words, on a page whose argument is that precision in a written brief is the product.

**A staged conversation that contradicted itself.** The events track said the assistant read *"Four
messages, none of which mention Friday"* while the panel beside it showed four bubbles, one of
which is the text about Friday and one of which is the assistant's own reply. The column was also
headed "The thread" while carrying a message that was deliberately NOT in the thread, which is the
entire point of the scene. Two emails now, the column is "The morning, in order".

**Invented precision in a scene, against the body it stages.** The two-records grid said "Created
14 March", "Created 2 June" and "at a quarter past ten at night". The article says March, June and
late evening. This is the same class as Round C's *"the twenty-one pages you should not publish"*.

**Two errors inside the CRM calculator.** Its note said "the three shares above" when there are
two, and a chain row was labelled "At your reading speed" for an input that asks how long it takes
to decide.

**Three scene payloads with no marker placing them**, caught by the table-driven content contract
rather than by eye: the CRM post was shipping one plate instead of two and the agent post was
shipping neither its conversation nor its offer. That contract earned its place on the day it was
extended.

### Band rhythm, measured, and both plates moved because of it

`scripts/_scratch-lookb.mjs` (gitignored; recreate from its docstring):

| post | article height | longest run, before | after |
|---|---|---|---|
| crm-sync | 29,711px | 4,252px (14%) | **4,177px (14%)** |
| ai-agent-workforce | 28,550px | 5,049px (18%) | **3,934px (14%)** |

Against 15% on Round C's two, 16-17% on Round B's, and 24% on the worst shipped post before that.
Both posts had their closing plate sitting directly against the dark "three ways this is wasted"
grid, which is two adjacent bands on the same background and a 1,542px and 1,520px black run.
Moving each plate to the far side of the cost section fixed both. **No two adjacent bands share a
background on either post**, and the probe's per-band `run=` column now equals each dark band's own
height, which is the check.

### The charts were read at full width before they were kept

The surnames chart has no axis maximum because these are counts: Smith fills the track and the
smallest of the five is 58% of it, so nothing renders as a hairline. The census chart also has no
maximum, and there the 200 bar IS a sliver, which is the finding rather than a defect, so the note
tells the reader to read the second bar. Both agent charts are pinned to 100 because they are
shares. The longest label on any of the four is 32 characters, inside the shipped range Round C
measured (42 characters is the longest on any shipped chart; small SVG type at 390 is the reason).

---

## D6 — the second pass, and two things worse than an invented number

**Two claims I asserted without checking, and both were used as a REASON to refuse a figure.**

1. *"The published pricing for every major model renders its numbers in JavaScript rather than in
   the page."* **False.** Session 11 established that about n8n and Zapier and I generalised it
   forward. Checked this round: Anthropic's `docs.claude.com` pricing page serves `$10 / MTok`,
   `$12.50 / MTok` and the rest as readable text, and `ai.google.dev/pricing` serves `$0.075`,
   `$0.15` and the rest the same way. Only `openai.com/api/pricing` refused, with a 403, which is
   bot-blocking rather than JavaScript. The refusal is still right and the reason is now the true
   one: the figures are per million tokens and mean nothing until somebody knows how many tokens a
   job takes, they move several times a year, and which model sits behind an assistant is a build
   decision that changes without anything visible happening at the reader's end.
2. *"Every one traced back to a company that sells data cleaning software."* I had not followed
   one of them. Followed this round: the circulating band is ten to forty percent and the trail
   ends at either a deduplication vendor quoting its own customers or an analyst rule of thumb
   with no report behind it. The post names the band and disowns it in the same sentence, which is
   the pattern the chat post set with the 78%.

**Five facts that were not in the primary document, found by going back to it:**

- *"Ivan Fellegi and Alan Sunter"* and *"Howard Newcombe"*. Winkler's reference list gives
  initials; the first names were mine.
- *"a team at Sierra and Princeton"*. The tau-bench author block names one affiliation, Sierra.
- *"six human experts read a hundred and fifty of THOSE traces"*. The 150 grounded-theory traces
  came from five frameworks, not from the seven the 1,642 were drawn from.
- *"one of the largest matching operations ever run in the United States"*. Winkler's own words
  are *"a very large 1990 Decennial Census application"*, and those are used now.
- *"regulated in New York for the better part of a century"*. The booklet does not date the
  article's enactment and I did not check it.

**Five invented quantities, all mine:** a reviewer who *"decides in about two seconds"*, *"ten
minutes on a Friday"*, *"a standing few minutes a week"*, *"an hour or two per assistant"* to write
a brief, and *"an afternoon spread over a fortnight"* to test one. Plus *"ten thousand contacts is
fifty million pairs"*, which is just under fifty million.

**Three assertions about what people do** (*"most people find"*, *"people are startled by this
one"*) became statements about the work instead.

**The scene-echo probe found nothing real.** `scripts/_scratch-echo.mjs`, extended to both new
topics, reports 10 and 11 hits and every one is a heading-id key or a source URL, which is exactly
the false-positive class Round C recorded when it recommended promoting this probe to a committed
test. Both new scene files carry seven em dashes and all fourteen are inside docstrings, identical
to the shipped `geo-pages-scenes.ts`; rendered visitor copy measures zero on both posts.

---

## Verification

All gates FOREGROUND, on the disk as committed, against the single existing `:3100` dev server. No
second server was started. The Vercel build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1211 passed (1211)
   Duration  14.85s

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
required                        3587            19             4             5             6             2  ...   2
available                       4674            21             4             7             7             2   <- --ratchet

all 11 posts meet the standard.

$ node scripts/check-svg-crop.mjs http://localhost:3100
PASS  ai-chat-assistant-real-estate-website          20 text nodes in role="img" graphics
PASS  ai-voice-agent-missed-calls-real-estate        30 text nodes in role="img" graphics
PASS  database-reactivation-old-real-estate-leads    24 text nodes in role="img" graphics
PASS  ai-lead-qualification-real-estate-scoring      20 text nodes in role="img" graphics
PASS  workflow-automation-real-estate-business       22 text nodes in role="img" graphics
PASS  automated-google-review-requests-real-estate   12 text nodes in role="img" graphics
PASS  ai-appointment-booking-no-shows-real-estate    28 text nodes in role="img" graphics
PASS  local-seo-real-estate-map-pack-google-business-profile 10 text nodes in role="img" graphics
PASS  geo-landing-pages-real-estate-doorway-pages    26 text nodes in role="img" graphics
PASS  crm-sync-real-estate-duplicate-contact-records 26 text nodes in role="img" graphics
PASS  ai-agent-workforce-real-estate-assistants      26 text nodes in role="img" graphics

244 text node(s) checked, 0 cropped.
```

The nine shipped posts were re-proven green by the SVG guard in the same run before it was trusted
about the two new ones.

Test baseline: **93 files / 1189 tests** at the start of this round (Round C's log records 1188;
one test was added between), **93 / 1211** after it. Up, never sideways. The 22 new tests are the
two topics joining the table-driven content contract (nine checks each), two frozen rails, and the
two new `content/blog` scene files the zombie-claims guard now reads from the directory. The three
new entries in the `ZOMBIES` table add no test of their own by design: each one is checked against
every file the guard already reads.

### score-flagship: 17/19 for BOTH new posts, and both reds are true

```
$ node scripts/score-flagship.mjs crm-sync-real-estate-duplicate-contact-records http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=true published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs ai-agent-workforce-real-estate-assistants http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.
```

Same two honest reds as Rounds B and C, for the same two reasons. Films are owner-held. `updated`
is deliberately absent with a comment in `content/blog/posts.ts` saying so, because a post written
and shipped inside one day has not been revised. **Nothing was faked and no baseline was moved.**

**`visible=true` on the CRM post is an INSTRUMENT error, not a claim on the page.** Line 74 of
`score-flagship.mjs` sets `visibleUpdated` from `/updated/i.test(txt)` over the whole page text,
and this post has a section called "The same update, arriving twice" and a paragraph about the lost
update problem. Checked directly: there is no visible "Updated" line anywhere on the article, and
D5 still fails correctly on the date comparison, which is the half that matters. Worth knowing
before somebody reads that `true` as a freshness fiction.

### Rendered and read, at 1440 and 390 DPR3

Every scene of both posts, both service pages and the blog index, with every `.reveal` asserted at
opacity 1 before the shutter. Shots in `docs/blog-flagship/r-d/`.

```
no horizontal overflow, docW == winW at 320, 390 AND 1440:
  /blog/crm-sync-real-estate-duplicate-contact-records
  /blog/ai-agent-workforce-real-estate-assistants
  /services/crm-sync          /services/ai-agent-workforce          /blog
0 page errors on every one of them.
```

Both calculators driven at both widths with `scripts/_scratch-calc.mjs`, controls read back out of
the DOM, every range driven to its maximum: `overflowX=0` on all four runs, and both ladders
reconcile with their headline at rest and at maximum.

Every external link was fetched and returned 200 before it shipped, and the three RFC anchors
(`#name-put`, `#name-idempotent-methods`, `#name-if-match`) were checked to exist in the served
HTML rather than assumed.

Probe rails held: `**/api/lead` and `**/api/media/**` aborted in every browser run. No MLS or
DATA-API call on any page or probe path. No film, avatar or HeyGen work. Nothing touched in
`next.config.ts`, the CSP, security controls or `lib/idx`.

### Two transient failures that were NOT product errors, and how that was established

A `SyntaxError: Invalid or unexpected token` appeared twice, once with "26 .reveal blocks still at
opacity 0", both times within seconds of an edit to a scene file. `_scratch-errloop.mjs` then
loaded the page four times with a full scroll on each and reported **0 page errors and 0 responses
over 400 on every run**, and `_scratch-revealdiag.mjs` reported 26 reveals of which 0 stay hidden
after a scroll walk. Both were the dev server recompiling under a probe. The dev server was NOT
restarted and no cache was cleared, because the diagnosis said not to. Recorded because a probe
that reports a transient compile as a product bug is exactly the class of instrument error that has
cost this project time before.

---

## Deliberately NOT done, and why

1. **The ratchet.** See D0. Measured, reported, left where it is, with the same recommendation
   Round C made.
2. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on both.
3. **`_scratch-echo.mjs` promoted to a committed test.** Round C recommended it and this round is
   the second data point for the recommendation: extended to two new topics it found nothing real
   and printed 21 false positives, all of them heading ids and URLs. Promoting it means deciding
   what to do about those, which is a small piece of design rather than a side effect of a build
   round. **Still recommended, and now with the false-positive shape measured twice.**
4. **`stat.source` made REQUIRED.** Six of twenty pages now carry one, up from four. Still the
   right call and still a dedicated pass.
5. **The `/ai` COPY drift.** `crm-sync.why` no longer matches the COPY object in
   `~/realtylt-ai-page`, joining `local-seo.why` and Round B's two. The journey and the services
   surface now disagree in four places.
6. **Tier reassignment**, still an owner call, still not taken. `crm-sync` is `tier: "more"` and now
   carries a 6,400-word flagship, which is the tier mismatch `SERVICES-CRITIQUE.md` records.

## Defects found and NOT fixed

- **`content/services/crm-sync.ts` `lede` still says "n8n keeps both sides in lockstep so nothing
  lives in two places out of date", and `seo.description` still ends "so the record you are looking
  at is true."** Both are the same absolute this round softened out of `howItWorks`, `faqs` and
  `whatItIs`. They are `/ai` COPY, seeded verbatim, so changing them widens the drift in item 5
  above. **Flagged for the owner rather than changed.**
- **`content/services/ai-agent-workforce.ts` `specs` still leads with "unlimited parallel
  agents".** Technically defensible about the platform and contradicted in spirit by the post,
  which argues the binding limit is how much output one person can read. The FAQ now carries that
  answer. `specs` is COPY. Flagged.
- **The licensed photo set is effectively exhausted.** Every county, hero and lifestyle image is
  already a cover or a plate, and `house-11.jpg` was the last file unused anywhere; it is now the
  CRM post's cover. The four plates this round therefore share photographs with four of the ten
  consumer PLACEHOLDER post covers, and the two new covers reuse an image that is another
  flagship's hero photo, which is the pattern already shipped (`rockland.jpg` is the booking post's
  cover and the area pages post's hero). **No flagship shares a PLATE with another flagship**,
  which is the rule the handoff records. Topic 12 will have to reuse or the owner will have to add
  images.
- **`house-03.jpg` was rejected again**, for the reason Round C recorded: it is the most on-topic
  photograph in the set for several of these articles and its for-sale sign carries a competitor
  brokerage's trademark, a named agent and a real phone number.
- **The floating rail sits over the calculator note** at one scroll position on both posts at 1440.
  It is the standing rail behaving as designed on every flagship, not a Round D regression, and it
  is noted only because it appears in the shot.

## Unknown product facts, for the owner, not writable

1. **Does the CRM sync as built have a review queue at all?** The post's central argument, and the
   service page's new `howItWorks[2]` and fifth `limit`, both say ambiguous pairs go to a short
   list for a person rather than being merged on a guess. That is what a correct build does and it
   is what the published model requires. Whether the builds we ship actually expose such a list,
   and where the reader would find it, is a fact about the product that neither surface states.
2. **What is the default conflict rule we ship?** The page says the rule gets agreed when it is
   built, and the post tells readers to demand it in writing. If there is a house default we start
   from, saying so would be a genuine differentiator and it is currently unwritten.
3. **Do the agent workforce builds draft or send by default?** The post's limits section and the
   service page both say an assistant that drafts is worth more than one that sends. The article's
   cold open turns on an assistant that sent. If sending is the default and drafting is the option,
   the page is over-claiming and it should be corrected before launch.
4. **Is there a run log a client can read?** The staged conversation's fourth event is "the run log
   is green and it is accurate", and the supervision section tells readers to ask for a readable
   record. We should be able to answer that about ourselves.
5. Rounds A, B and C's remain open: whether the voice agent records audio, whether review
   automation as built sends the Google link to everybody, what the website review widget's
   selection rule is, whether the booking layer sends a real calendar invitation, what calendar
   access it requests, whether RealtyLT manages the Google Business Profile or advises on it, and
   whether area pages ship with a human editing step by default.
