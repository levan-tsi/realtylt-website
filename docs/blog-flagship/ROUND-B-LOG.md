# ROUND B — the first two new flagship posts, and the numbers that did not survive

**Built 2026-08-25.** Scope: `review-automation` and `ai-appointment-booking` written to the
ratcheted flagship standard, their service pages synced, and the unsourced-claim kills Round A
carried forward. Seven commits on `main`, **not pushed**: the orchestrator verifies and pushes.

```
1a9a697  B0   ratchet first, and record the gap it opened
9e6f7bb  B4   five unsourced claims leave the services surface, and stat gains a source
9fc7d05  B5a  close the gap the ratchet opened, by writing
b64de40  B1   topic 6, review automation, and the 73% it was going to inherit
7518a4b  B2   topic 7, AI appointment booking, and the half the other posts do not cover
c0c0eb8  B5b  five defects found by looking at the rendered pages, not by a gate
6cb3fd2  B6   the second pass, and three invented numbers it caught in my own copy
```

**Two posts, ZERO new components.** Seven topics on the template now and six in a row that add
none. The bespoke-component hatch was not opened and did not need the calculator-lesson test.

---

## B0 — the ratchet, run FIRST, and the one thing it did that a ratchet is not supposed to do

`node scripts/flagship-standard.mjs --ratchet`, before any content was touched:

```
ratcheted 3 metric(s) -> docs/blog-flagship/standard.json
  proseWords: 3320 -> 3587
  sections: 18 -> 19
  siblingOverlap: 0 -> 2
```

**The gap it opened, measured on production:**

| post | proseWords | owes | sections | owes |
|---|---|---|---|---|
| ai-chat | 3597 | ok | 19 | ok |
| ai-voice | 3587 | ok (exactly the bar) | 21 | ok |
| database-reactivation | 3408 | **179 words** | 18 | **1 section** |
| ai-lead | 3653 | ok | 21 | ok |
| workflow-automation | 3375 | **212 words** | 18 | **1 section** |

Both gaps are well under the 500-word threshold in the brief, so both were closed by WRITING a
section each post genuinely lacked. See B5a.

### `siblingOverlap` went the wrong way, and it is not a typo. Read this before next round.

The recorded bar was 0 and the ratchet raised it to 2, which is a relaxation on a metric where
lower is better. `scripts/flagship-standard.mjs:210` sets `OVERLAP_NOISE_FLOOR = 2` and line 221
applies it as `Math.max(floor, Math.min(prev, proven))`, so the clamp fires unconditionally and
cannot help pulling a recorded 0 up to 2.

**Investigated rather than patched, and the conclusion is that this is the author's intent finally
taking effect.** The comment above the constant records the measurement that set it: on 2026-08-03
the bar reached 0, the single phrase holding two posts at 1 was "they have a house to sell and",
which is simply how an agent describes a seller-side lead, and the author concluded that a ceiling
of 0 "demands exactly that, forever, on every future round". The clamp was added in that session
and `--ratchet` was not run again until this round, so `standard.json` kept the 0 the clamp existed
to prevent.

**Left at 2, deliberately, and nothing is loosened in practice: all seven posts measure 0.** The
recorded 2 is headroom for genuine domain vocabulary, not slack that anything is using. Tightening
it back to 0 by hand would be undone by the next `--ratchet` anyway, which is a trap rather than a
standard. **If the orchestrator disagrees, the fix is in the script (apply the floor only when
there is no recorded bar), not in the JSON.**

---

## B1 — topic 6: `/blog/automated-google-review-requests-real-estate`

*"Twelve Five-Star Reviews. The Newest One Is From 2023."*

Thirteen scenes, zero components, no film. `content/blog/review-scenes.ts` + the body in
`content/blog/ai-posts.ts`.

### THE 73% IS RESOLVED, and the answer was to kill it

Round A left it flagged: *"It is still an unsourced number on a page I otherwise rewrote for
honesty."* It was on `review-automation.ts` in `why`, in `stat` and in an FAQ.

**Hunted in the primary document.** BrightLocal's Local Consumer Review Survey is the only survey
of this behaviour that repeats annually and publishes its sample and method on the same page as
its findings, and it is what most of this category is paraphrasing. The operative method sentence,
quoted from the page:

> "The Local Consumer Review Survey 2026 was conducted using a representative panel of 1,002 US
> adult consumers via SurveyMonkey."

**73 is not a figure in it.** What is in it, quoted as written:

> "97% of consumers read reviews for local businesses"
> "In 2026, 41% of consumers 'always' read reviews when browsing for businesses, a huge jump from
> last year (29%)."
> "74% seek reviews written in the last three months."
> "47% of consumers won't use a business with fewer than 20 reviews, and only 9% are willing to use
> one with five or fewer."
> "Seven in ten (68%) will only use a business with four or more stars, up from 55% in 2025."
> "just 10% of consumers say they will only use businesses with a five-star rating"

So the number died. The post names it, says it is unsourced and says what is actually in the
survey; the service page's `stat` is now the 74% recency figure, because recency is that page's own
argument; and `zombie-claims.test.ts` guards it. **The survey's own weakness is on screen in the
chart's caveat**: it is self-reported behaviour, collected by a company that sells review software,
about local businesses in general rather than about agents.

### Four sources, each read in the primary document, none shared with a sibling

| source | what was read | where |
|---|---|---|
| **Google contribution policy** | Under "We do not allow merchants to": *"Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers"*, and the incentives entry. Plus the two nobody quotes: *"merchants should not require or pressure users to leave ratings or write reviews while on the premises, nor should they request that specific content be included"*, whose own examples are staff being asked to solicit a set number of reviews or reviews naming a member of staff. The permission side is one sentence long. | support.google.com/contributionpolicy/answer/7400114 |
| **16 CFR 465.7** | Review suppression turns on *"materially misrepresent, expressly or by implication, that the consumer reviews ... represent most or all the reviews submitted"*. The carve-out for criteria *"applied equally to all reviews submitted without regard to sentiment"* is quoted in full, including its five listed grounds. | law.cornell.edu/cfr/text/16/465.7 (**eCFR blocks programmatic access**, as the handoff records; LII carries the same text) |
| **Luca, HBS WP 12-016** | Yelp matched by hand to Washington State Department of Revenue records for every restaurant in Seattle, Jan 2003 to Oct 2009. 3,582 restaurants, ~1,587 open per quarter, 143 chain affiliated, 69% on Yelp by Oct 2009. OLS: *"A one-star increase is associated with a 5.4% increase in revenue"*. RD around Yelp's half-star rounding: *"an exogenous one-star improvement leads to a roughly 9% increase in revenue"*. Chains: *"statistically insignificant and close to zero"*. | hbs.edu PDF, read with `pdftotext` |
| **BrightLocal LCRS 2026** | the six sentences above | brightlocal.com/research/local-consumer-review-survey |

Cited data graphics: the four thresholds (max 100, lit on 74%) and the two Luca estimates.
**The four thresholds answer four different questions and the basis line says so**, because four
numbers side by side invite a reader to treat them as one distribution. That is the same defect the
workflow chart had to be corrected for.

### The calculator refuses the 5 to 9 percent revenue lift

Chain: jobs a month, times three months, times the share that get asked, times the share who write
one, times four quarters. **The headline is the QUARTER row and not the year row**, which is the
only calculator in the cohort whose headline is not its largest number: 74% of the panel look for
reviews from the last three months, so a calculator headlining the annual total would be arguing
for volume on a page whose evidence is about recency.

What it refuses, in the visible note: turning Luca's 5 to 9 percent into a commission forecast,
because that was measured on Seattle restaurants against quarterly sales tax records and the effect
was an independent-restaurant effect. And the conversion rate is the reader's input because no
published figure exists for review requests in any vertical.

---

## B2 — topic 7: `/blog/ai-appointment-booking-no-shows-real-estate`

*"You Booked the Showing for Nine Days Out. Nobody Came."*

Thirteen scenes, zero components, no film.

**Written away from its siblings on purpose.** The obvious version of this post is "answer fast",
which is topic 1's argument and topic 2's. So this one is about the SECOND gap, between the moment
a time is agreed and the moment somebody stands in the house. None of the response-speed research
the other two rest on appears here. It measured sibling overlap 0 on its first run.

### Four sources, each read in the primary document

| source | what was read |
|---|---|
| **McMullen MJ, Netland PA**, *Lead time for appointment and the no-show rate in an ophthalmology clinic*, Clin Ophthalmol 2015;9:513-516 (`pmc.ncbi.nlm.nih.gov/articles/PMC4370946/`) | 51,529 appointments from one university eye clinic's scheduling database over 12 months. Year averages 21.7% (resident) and 6.6% (faculty). At 0-2 weeks lead time, 9.1% and 2.4%; at six months, 38.3% and 6.9%, both P<0.001. The paper's own model: the resident clinic's rate would fall by nearly 60% if every appointment were booked within two weeks. |
| **Chen Z, Fang L, Chen L, Dai H**, *Comparison of an SMS text messaging and phone reminder to improve attendance at a health promotion center: a randomized controlled trial*, J Zhejiang Univ Sci B 2008;9(1):34-38 (`pmc.ncbi.nlm.nih.gov/articles/PMC2170466/`) | 1,859 enrolled, 1,848 analysed, three arms, one reminder 72 hours out. Attendance 80.5% / 87.5% (SMS) / 88.3% (phone). OR vs control 1.698 (1.224-2.316, P=0.001) and 1.829 (1.333-2.509, P<0.001). **SMS vs phone: no difference, P=0.670.** Cost per attendance 0.31 Yuan against 0.48. |
| **RFC 5545 (iCalendar)**, section 3.7.2 | *"If this property is not present in the iCalendar object, then a scheduling transaction MUST NOT be assumed. In such cases, the iCalendar object is merely being used to transport a snapshot of some calendar information; without the intention of conveying a scheduling semantic."* Section 3.6.6 defines VALARM, the reminder that lives on the recipient's device. |
| **Google Calendar API**, `freebusy.query` | *"Returns free/busy information for a set of calendars"*, and each calendar's answer is *"List of time ranges during which this calendar should be regarded as busy"*. That is the narrow access a booking layer actually needs, which is a real buyer's question nobody asks. |

Cited data graphics: no-show rate by lead time (both clinics, max 100) and attendance by reminder
type (three arms, max 100). **The 0.8 point gap between the text and the call is not a finding and
the basis line says so out loud** (P=0.670): a chart is exactly the object that invites a reader to
draw the conclusion the paper explicitly refused.

### The calculator refuses the seven-point reminder lift

Chain: people asking a week, times 52, times the share answered the same day, times the share that
reach an agreed slot, times the share where somebody turns up. **There is no "with reminders" row
and no second column**, and the missing row is the stated refusal: applying a 2007 Hangzhou health
check-up result to listing appointments would be the most flattering arithmetic on this website and
nobody has done it. All four rates are the reader's, because three of them have never been measured
for this industry by anybody and a default we typed in would become the number they remember.

---

## B3 — service pages synced

**review-automation** (Round A's compliant mechanic PRESERVED word for word; the post agrees with
it): `stat` 73% to the sourced 74%, `why` rewritten off the dead figure, the "how do I get more
Google reviews" FAQ now carries the survey with its panel size and the vendor's own interest,
`relatedPosts` leads with its own flagship. Its five `limits` already matched the post's and were
left alone.

**ai-appointment-booking**: `relatedPosts` leads with its own flagship (the chat post came off; the
booking post is the better link for all of it). `stat` added, carrying the trial and its source.
`why` rewritten off *"Most jobs go to whoever books first"*, which had nothing under it, **and the
same claim was still alive one field lower in `figure.footnote`** and is gone from there too. The
"no-shows FAQ" now carries the trial with its caveat, a fifth limit was lifted from the post, and
two absolutes came down: *"recovers most of the inquiries lost to friction"* and the use-case title
*"No-shows that stop happening"*, which contradicted its own limits section.

**`Service["stat"]` gained an optional `source`**, rendered under the number by
`components/services/Outcome.tsx`. Round A recommended the field and the source together; a figure
in 96-point type is the most quoted thing on the page and it is the one that most needs a
derivation. Optional rather than required because two numbers on this surface are product facts
with no external document to point at.

---

## B4 — the claim kills carried from Round A

| file | was | now |
|---|---|---|
| `database-reactivation.why` | "The average database holds tens of thousands in unworked commission" | what the post can actually say: the names were paid for once, the only real cost is the asking, and what it is worth depends on the reader's own list |
| `skip-tracing.why` and one FAQ | "at a fraction of vendor pricing" (x2) | gone. The FAQ now says plainly that what it saves depends on the vendor and the volume, so the page does not print a multiple it cannot show the working for |
| `skip-tracing.useCases[1]` | "A list where 40% of the numbers are dead" | "a lot of dead numbers", plus the finding: nobody publishes an honest figure for this, which is the argument for checking before you dial |
| `ai-voice-agents.whatItIs[2]` | "in seconds rather than the industry-standard hours" | the HBR audit of 2,241 companies and its 42-hour average, with the caveat that it is cross-industry work about web forms |
| `ai-voice-agents.useCases` | "runs every hour of every day at a fraction of that [an ISA salary]" | gone. What is left is true: no rota, no bad mornings, and a cost that tracks calls rather than headcount |

All four figures are guarded in `lib/blog/zombie-claims.test.ts`. **Proved RED before trusting it
green**, against real content rather than a synthetic string: two of the rewritten files were
stashed back to their old copy and the test failed naming lines 14, 71 and 125 with the reason for
each. Restored, green.

---

## B5a — closing the ratchet gap by writing

| post | new section | why it was the honest one |
|---|---|---|
| workflow-automation | *"The first month, and the two things to do in it"* | read one chain's run history line by line in week one, and break it on purpose to find out whether anybody is actually told. Both free, and both are the article's own silent-failure argument executed once instead of explained twice. 3,375 to 3,667 words, 18 to 19 sections. |
| database-reactivation | *"What to ask before you let anybody text that list"* | four questions that test the EVIDENCE rather than repeat the law: the consent date for a record the reader picks at random, what happens to a message that would land at nine at night, a real opt-out round trip in the room, and who owns the number. 3,408 to 3,675 words, 18 to 19 sections. |

---

## B5b — five defects found by LOOKING, that no gate could see

**Three of them are photographs described wrongly**, and all three alt texts were written from the
image file's catalogue title rather than from the image:

- the review plate called `house-10.jpg` *"a terrace of near-identical row houses, every front the
  same"*. It is two visibly different houses behind heavy planting, and the caption's whole argument
  rested on the sameness. Rewritten to the argument the picture does carry.
- the booking plate called `house-05.jpg` *"bare windows, flat afternoon light"* with the lights on
  inside. It is an ornate Victorian in bright daylight with curtains in every window.
- the second booking plate called `house-13.jpg` *"autumn, front door standing open"*. It is a
  winter photograph with wreaths in the windows and the door shut.

**An alt text is a factual claim about a picture.** On pages arguing that the details are
checkable, three wrong ones are not cosmetic, and only opening the PNG finds them.

Also found by looking: the review post's three-item grid sat on the scene key `four-moves`, which
`registry.tsx` maps through a hardcoded `GRID_LABELS` entry, so it announced itself to a screen
reader as "The four moves"; and the gating-line card claimed Google's own example was a client
being asked to mention a neighbourhood, when the policy's example is a merchant asking staff to
solicit reviews naming a member of staff.

### Band rhythm, measured, with a probe that had to be fixed twice before it could be believed

`scripts/_scratch-lookb.mjs` (gitignored, so it lives on this machine only; recreate from the
docstring). Its first version read `#article-root`'s direct children and reported the wrapper div
as one 25,122px light band, a 97% single-tone run. Its second read each `<section>`'s own
`backgroundColor` and reported **every dark scene on every flagship as white**, because a full-bleed
band paints its colour on a child rather than on the section. Both are the same class of error the
handoff records about `_scratch-bands.mjs`, and both were caught by the number being obviously
wrong rather than by reading the code.

Longest unbroken single-tone run, against 24% on the worst shipped post (workflow):

| post | before | after |
|---|---|---|
| review | 7,296px (28%) | 4,697px (**17%**) |
| booking | 5,001px (20%) | 4,052px (**16%**) |

One band flipped on each, the failure-modes grid, which splits the cost section from the FAQ.

**The reveal assertion earned its keep.** The probe refused to photograph a service page with 33
`.reveal` still at opacity 0, which turned out to be its own scroll step outrunning the
IntersectionObserver rather than a product bug. A probe that photographs an empty box and reports
success is worse than no probe.

---

## B6 — the second pass, against STANDARD.md, and what it caught in my own copy

Three invented numbers, all mine, all in the first draft:

- *"the difference between a 4% response and a real one"* — a conversion rate I made up, in the cost
  section of a post whose second section is about a made-up number.
- *"they scan them for about fifteen seconds"* — an unsourced behavioural claim with a figure in it,
  which had also become a scene heading and a rail label.
- *"tens of dollars a month, not the hundreds"* — a carrier messaging price nobody here has read in
  a published document.

Two scene notes echoed the body verbatim, breaking the rule that a scene REPLACES the prose it
stages. Both rewritten, and the booking body gained the two clinic averages in place of the phrase
it was sharing with its own chart's basis line.

**A comparative FAQ added to each**, which is the half of STANDARD.md section 4 both were missing:
every question answered what the thing IS and none answered how it differs from what the reader
already has. Writing those two answers put 10 shared phrases between the new posts, all in the cost
sections, because review's paragraph got rewritten in booking's words. Caught by the metric, fixed
in the sentences, cohort back to 0.

---

## Verification

All gates FOREGROUND, on the disk as committed, against the single existing `:3100` dev server (no
second server was started). The Vercel build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1163 passed (1163)
   Duration  13.52s

$ node scripts/flagship-standard.mjs http://localhost:3100
post                      proseWords      sections     citations  faqQuestions    bodyImages  dataGraphics ... siblingOverlap
ai-chat                         3597            19             4             7             6             2  ...   0
ai-voice                        3587            21             6             5             6             3  ...   0
database-reactivation           3675            19             4             5             6             2  ...   0
ai-lead                         3653            21             4             5             6             2  ...   0
workflow-automation             3667            19             4             6             7             2  ...   0
automated-google                5503            22             4             7             6             2  ...   0
ai-appointment                  4674            21             4             7             7             3  ...   0
required                        3587            19             4             5             6             2  ...   2

all 7 posts meet the standard.

$ node scripts/check-svg-crop.mjs http://localhost:3100
PASS  ai-chat-assistant-real-estate-website          20 text nodes in role="img" graphics
PASS  ai-voice-agent-missed-calls-real-estate        30 text nodes in role="img" graphics
PASS  database-reactivation-old-real-estate-leads    24 text nodes in role="img" graphics
PASS  ai-lead-qualification-real-estate-scoring      20 text nodes in role="img" graphics
PASS  workflow-automation-real-estate-business       22 text nodes in role="img" graphics
PASS  automated-google-review-requests-real-estate   12 text nodes in role="img" graphics
PASS  ai-appointment-booking-no-shows-real-estate    28 text nodes in role="img" graphics

156 text node(s) checked, 0 cropped.
```

The five shipped posts were re-proven green by the SVG guard in the same run before it was trusted
about the two new ones.

Test baseline: **92 files / 1118 tests** before Round A, **93 / 1143** after Round A, **93 / 1163**
after this round. Up, never sideways. The 20 new tests are the two topics joining the table-driven
content contract, two frozen rails, and four new zombie guards.

### score-flagship: 17/19 for BOTH new posts, and both reds are true

```
$ node scripts/score-flagship.mjs automated-google-review-requests-real-estate http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs ai-appointment-booking-no-shows-real-estate http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.
```

**The brief expected 18/19 with C3 the only red. It is 17/19, and the second red is D5.** D5 wants
`dateModified` later than `datePublished`, and a post written and shipped inside one day has not
been revised. Topic 4 shipped 18/19 for exactly this reason and the handoff's rule is explicit: set
`updated` when the article takes its first real revision, never to satisfy a gate. Each `updated`
is deliberately absent with a comment in `content/blog/posts.ts` saying so. **Nothing was faked and
no baseline was moved.** Both slugs become 18/19 the day they are genuinely revised, and 19/19 the
day the owner records a film.

### Rendered and read, at 1440 and 390 DPR3

Every scene of both posts (12 and 13 scenes), both service pages, with every `.reveal` asserted at
opacity 1 before the shutter. Shots in `docs/blog-flagship/r-b/`.

```
no horizontal overflow, docW == winW at 320 AND 390:
  /blog/automated-google-review-requests-real-estate
  /blog/ai-appointment-booking-no-shows-real-estate
  /services/review-automation          /services/ai-appointment-booking
  /services/database-reactivation      /services/skip-tracing-lead-generation
  /services/ai-voice-agents            /blog
0 page errors on every one of them.
```

Probe rails held: `**/api/lead` and `**/api/media/**` aborted in every browser run. No MLS or
DATA-API call on any page or probe path. No film, avatar or HeyGen work. Nothing touched in
`next.config.ts`, the CSP, security controls or `lib/idx`.

---

## Deliberately NOT done, and why

1. **`stat.source` made REQUIRED.** The field exists and two pages carry it. Making it required
   forces the other eighteen to either find a source or drop their number in one sweep, which is a
   bigger and more interesting piece of work than a Round B side effect, and two of those numbers
   are product facts with no external document to point at. **Recommend a dedicated pass.**
2. **The `siblingOverlap` clamp.** See B0. Behaviour left as the author intended, reported rather
   than patched.
3. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on both.
4. **Tier reassignment**, still an owner call, still not taken.
5. **The `/ai` page COPY drift** (different repo, `~/realtylt-ai-page`): the 78% is still alive
   there and now the review page's 73% has died here too, so the journey and the services surface
   disagree in two places rather than one.

## Defects found and NOT fixed

- **`content/services/ai-appointment-booking.ts` `lede` uses curly quotation marks** around "let me
  check my calendar". Pre-existing, house rules do not mention them, left alone.
- **`review-automation` H1 "More 5-star reviews, without the awkward ask"** was flagged by Round A
  as drifting toward the gating mechanic and kept deliberately. Reading it again beside the post,
  which spends a section on why asking everybody is the rule, the headline still reads as an
  outcome rather than a mechanic. Flagged again, still not changed: it is `/ai` COPY.
- **The Luca chart's larger bar fills its track**, because a ratio chart scales to its own maximum.
  That is the same geometry the voice post's turn-gap chart deliberately avoided by pinning its
  axis, and the judgement here is different because there is no natural ceiling for "percentage
  change in revenue" the way there is for "how long a person will wait". Worth an argument if
  somebody disagrees; it is on the writing, not on the metric.

## Unknown product facts, for the owner, not writable

1. **Does the booking layer send a real calendar invitation, or a text with a time in it?** The post
   makes the RFC 5545 distinction the buyer's test and the service page says "confirmation". If it
   sends an invitation with an alarm, the page should say so, because it is a genuine differentiator
   and the post now teaches readers to ask for it.
2. **What calendar access does it actually request?** Free/busy, or full read of the events. The
   post tells readers to ask; we should be able to answer it about ourselves.
3. Round A's three are still open: whether the voice agent records audio, whether review automation
   as built sends the Google link to everybody, and what the website review widget's selection rule
   and on-screen label actually are. **The second of those now has a 5,500-word article resting on
   the answer.**
