# THE CHECKER'S REPORT — the third pass, by the one agent with no stake in it

**Date:** 2026-08-26 · **Scope:** the 20 flagship posts, the 20 service pages, and every surface
they join to · **Author:** a fresh-eyes agent that built none of this.

**Nothing in this report was fixed.** Every finding below is REPORTED, not changed. The reason is
stated in "What I fixed versus what I report", and it is deliberate rather than lazy: on this body
of work there was no defect whose correction did not require a judgement about what to say
instead, and a checker who silently rewrites is just another builder.

---

## WORST FINDING FIRST

### 1. Every claim this rollout spent eight rounds killing is live, today, at `realtylt.com/ai` — and this repo is what serves it there

`next.config.ts` lines 175-180 proxy a separate Vercel project under this domain:

```
{ source: "/ai",          destination: `${AI_PAGE_URL}/` },
{ source: "/ai/:path*",   destination: `${AI_PAGE_URL}/:path*` },
```

`AI_PAGE_URL = "https://realtylt-ai-page.vercel.app"`. **Twenty-nine links in twenty scene files
point into it** (`/ai#chat`, `/ai#reviews`, `/ai#agents`, and seventeen more). I opened each of the
twenty in a browser: all twenty resolve and open the right panel. What is in those panels, fetched
through this repo's own dev server at `http://localhost:3100/ai`, is:

| where | what it says | what this repo says |
|---|---|---|
| `/ai#chat` panel | *"**78% of deals close with whoever responds first**, yet most sites answer in hours."* | the chat flagship spends its whole second section proving this figure has no published report, no stated sample and no methodology, and ends *"So this article does not use it."* |
| `/ai` **FAQPage JSON-LD** | *"Because **78% of deals close with whoever responds first**, instant AI follow-up captures leads a human team would miss…"* — asserted twice, in machine-readable schema | as above |
| `/ai/llms.txt` | contains **78%** | as above |
| `/ai#reviews` panel | *"a rough one is caught privately first so you can make it right **before it ever goes public**"* · *"This asks every **happy** customer"* · *"**73% of customers read reviews before they book**"* | SERVICES-CRITIQUE §1 calls this "the most serious item on the whole services surface"; the review page was rewritten in Round A so that **everyone** gets the link; the 73% was killed in Round B as unsourceable |
| `/ai#agents` panel | *"**unlimited parallel agents**"* · *"you can run as many as you want, in parallel"* | killed on the /ai journey in Round D and swept out of `content/services/ai-agent-workforce.ts` by the orchestrator; the spec chip was changed in commit d8ce497, *"Nothing is unlimited"* |
| `/ai#crmsync` panel | *"**nothing lives in two places out of date**"* · *"the record you look at is the record that's true"* | the CRM-sync absolutes Round A's board records as corrected |

Verified in a real browser and by reading the served bundle (`/src/main.js?v=20260825d`), not from a
document. All six strings are `PRESENT` in what a visitor is served today.

**Why this is a seam and not a known item.** ROLLOUT-PLAN.md line 14 does record the /ai fix as
`LOCAL, owner-gated`, and the ai-page repo is another session's. Three things are *not* recorded
anywhere, and each of them is this repo's problem rather than the owner's:

1. **The reader path is a closed contradiction loop.** A person reads
   `/blog/automated-google-review-requests-real-estate`, which explains that Google's contribution
   policy forbids selectively soliciting positive reviews. The post links to `/ai#reviews`. That
   panel sells the mechanic the post just named as forbidden. From there, "THE SERVICE PAGE" leads
   to `/services/review-automation`, which says the opposite of the panel. Three surfaces, one
   domain, two answers. The same loop exists for 78% via `/ai#chat`.
2. **`lib/blog/zombie-claims.test.ts` cannot see any of it.** It reads `content/**`,
   `components/**` and `content/services/**` of *this* repo. The one surface on this domain where
   78% is still live is outside its `fs.readdirSync` and always was. The guard that exists
   specifically to stop this number coming back is blind to the place it never left.
3. **The JSON-LD is the worst copy of it.** Visible panel copy is read by people. A `FAQPage`
   `acceptedAnswer` is read by answer engines and quoted verbatim. The 78% under
   `realtylt.com/ai` is currently the most machine-liftable claim on the whole domain, and it is
   the one claim the domain elsewhere proves cannot be sourced.

**Not fixed**, and deliberately: `realtylt-ai-page` is out of scope by instruction, and the
marketing site's own copy is already correct. What is in scope and owed here is a decision. Three
options, in the order I would take them:

- **Cheapest and safest:** hold the launch of the twenty `/ai#…` deep links until the ai-page
  deploy lands. One constant, twenty scene files.
- **Correct:** deploy the already-written ai-page fix (the owner's call; the board has been waiting
  on it since Round A).
- **Structural:** widen `zombie-claims.test.ts` to fetch `${AI_PAGE_URL}/` and
  `${AI_PAGE_URL}/llms.txt` and fail on the killed list. It is the only guard that would have
  caught this, and the fetch is one network call in a test that already knows the strings.

---

## HOW I CHECKED, AND THE INSTRUMENT I GOT WRONG

Gates re-run for a baseline only, not as the audit: `npx tsc --noEmit` exit 0; `npm test` **93 files,
1321 tests, all passing**, exit 0. I did not re-run the content gates — the brief was to ask what a
green gate cannot see.

Instruments built for this pass, each proved before being believed:

- **Plate crops.** All 36 `kind: "plate"` scenes rendered at the shipped 16:9 phone crop with
  `sharp` (`fit: cover, position: centre`), which is the geometry `Plate.tsx` ships. First I
  checked the premise: every one of the 36 source photographs has an aspect ratio ≤ 1.78, so 16:9
  really is a vertical superset of 21:9 for the whole cohort and alt written from the phone crop
  covers the desktop one. Round F's rule holds across every plate, not just the ones it measured.
- **Slider grabbability** (`scripts/_scratch-checker-slider.mjs`). Proved both ways: a drag on the
  track centre moves the value (known-good), drags 8px and 12px above it do not (known-bad).
- **`/ai` deep links.** My first checker reported **20 of 20 anchors dead**, because it looked for
  elements with matching `id`s and the /ai app routes hashes in JavaScript. That is the exact
  failure the brief warned about — the orchestrator's link checker reporting all 89 links dead when
  the checker was what was broken. I threw it away and opened all twenty in Chromium instead. All
  twenty work. **The dead-anchor finding was mine and it was wrong; the finding that survived is
  about what the panels say, not whether they open.**
- **Scene figures without a body.** A first version flagged 150 "scene numbers not in the post
  body" and was useless: charts exist to carry numbers the prose does not repeat, and arXiv ids,
  page numbers and calculator `min`/`max` all trip it. Narrowed to **plate captions only** — the
  one scene field with no `source` and no `basis` — it returns six results and two of them matter.
  Recording the failed version because the negative result is the useful one: *"a figure a scene
  states and the body does not"* is **not** a defect signal and should not be built as a gate.

Browser work: Playwright against the existing `:3100` dev server (no second server started),
`**/api/lead**` intercepted on every context (0 posts reached it), `**/api/media/**` and
`media.mlsgrid.com` aborted, at 1440x900 DPR1 and 390x844 DPR3.

---

## HUNT 1 — the 27 older plates, re-read against the shipped crop

Round H predicted "a hit rate of one plate in two". Measured across all 36: **22 plates carry at
least one statement the photograph does not support**, of which **14 are unarguable** and 8 are
judgement. That is a higher rate than predicted, and it is concentrated in exactly the rounds that
never re-read their own work.

### Unarguable — the photograph plainly says otherwise

| file:line | what the alt or caption says | what the shipped crop shows |
|---|---|---|
| `content/blog/audit-scenes.ts:425` | *"the middle one stencilled **ZIP-0** above the lever"* | the stencil reads **ZSP-2**, and it is on the small separate enclosure **above the box**, not above the lever. What is above the lever is `I I I ZAP.` — **an invented key on a photograph, the identical class Round G caught** |
| `content/blog/audit-scenes.ts:425` | *"each with a **black** lever handle on its face"* | all three levers are **red**, the same paint as the boxes |
| `content/blog/document-scenes.ts:471` | *"filled with a looping **brown ink** hand"* | `deed-1825.jpg` is a **pure greyscale** scan — measured chroma spread **0** across all three channels. There is no brown in the file |
| `content/blog/custom-scenes.ts:406` | *"**dark lacing tape** running between them"* | the lacing is **pale cream cord**, plainly visible at both crops |
| `content/blog/invoicing-scenes.ts:376` | *"several columns of round **cream** number keys"* | the keypad alternates **cream and green**; roughly half the keys are green |
| `content/blog/invoicing-scenes.ts:525` | *"numbered 90, 80, 70, 9 and 8 **in dark blue on white**"* | inverted for three of the five: **90, 80 and 70 are white on dark blue**. Only the 9 and 8 are dark blue on white |
| `content/blog/marketing-automation-scenes.ts:326` | *"**each** drawer carrying a small white card … hand lettered with **a range of surnames**"* | the whole bottom tier reads **DISTRICT, DISTRICT, HANSARD, HANSARD, HANSARD, HANSARD**, and one label is blank. The same over-claim is repeated in `public/images/ATTRIBUTIONS.md` |
| `content/blog/marketing-automation-scenes.ts:326` | *"brass **cup** handles"* | they are elongated bail/bar pulls, not cup handles |
| `content/blog/scheduling-scenes.ts:413` | *"**most of them white** with red and yellow levers standing among them"* | **red is the dominant colour** by a clear margin; white, yellow, blue and black-and-white chequered levers stand among the red. The alt inverts the frame's colour |
| `content/blog/scheduling-scenes.ts:559` | *"**each** screen … carrying the operator name First ScotRail along the bottom"* | four of the six do. The `Subsequent Departures` and `Informat…` screens do not |
| `content/blog/workflow-scenes.ts:293` | *"**one hand on the trackpad** and the other keying the same figures into a separate desk calculator"* | **both hands are at the calculator.** The trackpad is visible and empty. The picture that carries this article's whole thesis is described wrongly |
| `content/blog/skip-tracing-scenes.ts:297` | *"a large hand painted 70 **on its side**"* | the 70 is on the box's **door**, under the embossed `U.S. MAIL / APPROVED BY THE POSTMASTER-GENERAL` |
| `content/blog/local-seo-scenes.ts:325` | *"standing in mature woodland behind an **unmown** lawn"* | the lawn is short, even and plainly mown |
| `content/blog/review-scenes.ts:335` | *"one **grey** with a mansard roof and one red brick"* | the left house is **white/cream** painted. Both houses have mansard roofs, which the phrasing denies to one of them |

### Judgement — defensible, but I would not have written it

| file:line | the statement | why it is soft |
|---|---|---|
| `content/blog/audit-scenes.ts:281` | *"Three gauges, **four needles** between them"* | I count **five** pointers: a black needle on each of the three gauges, plus a short red index pointer on the centre and right gauges. Four is only reachable by counting the centre's red one and not the right's |
| `content/blog/audit-scenes.ts:279` | *"a Cyrillic label stencilled **on the panel** above it … two further Cyrillic labels stencilled **along the bottom edge**"* | all four Cyrillic labels (`МАСЛО ОТКАЧКА`, `ВАКУУМ`, `…ЛЬТРОМ`, `ПОСЛЕ ФИЛЬТРА`) are on the **gauge bezels**, not on the yellow panel |
| `content/blog/custom-scenes.ts:267` | *"a saw and **shears** at the right against exposed brick"* | at the right there are two saws, a try-square, a hammer, safety goggles and a pair of dividers. No shears. The goggles and the square are the two most prominent objects and neither is mentioned |
| `content/blog/booking-scenes.ts:417` | *"small-paned windows, **each** hung with a Christmas wreath"* | the four gable-end windows carry no wreath. Only the front elevation does |
| `content/blog/document-scenes.ts:320` | *"a dark wooden handled stamp … **beside** a small red and white label reading AIR PARCEL POST FIRST CLASS MAIL"* | the red label **is the body of that same stamp** — a multi-message rotary — and it carries six lines, not two |
| `content/blog/enrichment-scenes.ts:323` | *"the letters at the top overlapping each other **so that no word can be read**"* | `MUTATOR` — i.e. `COMMUTATOR` — is legible at the shipped crop. `ATTRIBUTIONS.md` repeats the claim |
| `content/blog/clone-scenes.ts:259` | *"small **printed paper labels** tucked between some of the blocks"* | not resolvable at either crop; what is there reads as wood grain and ink. Round H's "unresolvable text" class |
| `content/blog/skip-tracing-scenes.ts:474` | *"a figure **in a broad hat** striding away"* | the hat is flying **off** the figure's head, with motion lines. The sign also carries `Thank You!` under `NO SOLICITATION`, which the alt omits and the caption's last line (*"The sign is the polite version"*) would have been better for |
| `content/blog/skip-tracing-scenes.ts:329` | *"An open page of an old **payroll journal**"* | it is a **1776 military muster/pay roll** — a single torn sheet, columns headed `Names / Commencing / Ending`, ranks `Capt.`, `Lieut.`, `Ensign`, `Drum`. In fairness this follows the photographer's own title ("Very Old payroll Journal"), which is why it is in this table and not the one above |

**Verified correct, so nobody re-checks them:** `mailboxes-row.jpg` is **four** boxes, not five — the
silver body between the `70` and the `60` is the `60` box seen at an angle, and the ledger agrees.
`house-13.jpg` really is a **saltbox** (the source title is "Saltbox house in Great Plain, Danbury,
Connecticut"). The `chalkboard list` on `house-17.jpg` is exactly six lines and reads milk, dog
food, coffee, bread, cheese, soap. `palimpsest-page.jpg` really is tagged `archimedes,
archimedespalimpsest, hyperides` by the Walters Art Museum's own photostream. Plates 3, 4 (partly),
9, 10, 11, 17, 18, 19, 23, 24, 26, 27, 34, 36 are clean.

---

## HUNT 2 — fabricated specifics, all 20 posts and all 20 service pages

**This hunt came back almost clean, and that is a real result after four rounds of hits.**

Swept the shipped copy of `content/blog/**` and `content/services/**` (block and line comments
stripped) for street addresses, personal names, telephone numbers, email addresses, prices,
reference numbers and dates.

- **Telephone numbers: one, and it is correct practice.** `content/services/ai-chat-assistant.ts:71`
  uses `845-555-0134` inside an illustrated transcript. `555-0100` to `555-0199` is the NANPA block
  reserved for fiction. Clean.
- **Street addresses: one, and it is a hypothetical.** `content/blog/ai-posts.ts:3321` — *"it cannot
  tell you whether **14 Willow Street** is still available"* — is an illustrative sentence, not a
  claimed listing. Clean, though it is the same shape as the three invented Hudson Valley addresses
  Round E killed and a reader could take it for real. Worth one word ("a house on Willow Street").
- **Email addresses: none.**
- **Every four-digit date in visitor-facing copy checked against a primary document.** Fifteen
  explicit dates; thirteen sit inside source-citation comments with the document named. The two
  that a reader sees:
  - **`content/blog/reactivation-scenes.ts:292`** — *"burned on the eighth of May, 1974 … stood
    unused for thirty five years … reopened on the third of October, 2009."* All three **verified**:
    the fire was 8 May 1974 (Poughkeepsie Journal, cited in the Walkway article), the walkway opened
    3 October 2009, and 1974→2009 is 35 years. Clean.
  - **`content/blog/ai-posts.ts:1944` and `content/blog/skip-tracing-scenes.ts:176`** — *"As of
    September 30, 2024, there were 254 million active registrations."* **Verified word for word** in
    the FTC's own *Do Not Call Data Book 2024* PDF, which I downloaded and read.
  - **`content/blog/ai-posts.ts:3535`** — *"a declaratory ruling adopted on February 2, 2024 and
    released six days later."* **Verified** in `FCC-24-17A1`: *"Adopted: February 2, 2024  Released:
    February 8, 2024."* Six days exactly.

### The one fabricated specific I did find, and it is a good one

**`content/blog/skip-tracing-scenes.ts:481`** — the `no-solicitation` plate caption:

> *"**Two million people** said the same thing to the Federal Trade Commission last year, and 254
> million numbers are registered saying it in advance."*

The FY2024 figure in the Data Book is **2,085,133 complaints** (1,099,223 robocall + 763,970 live
caller + 221,940 call type not reported). It is a count of **complaints**, not of **people** — one
person can file many, and the Data Book says the data is "unverified complaints reported by
consumers, not a consumer survey".

What makes this worth naming rather than nitpicking is **where it sits**. Three paragraphs above it,
the article's own prose says of the 254 million:

> *"That is not a count of people, and the Commission says why in the same document… One person can
> register several numbers. So treat it as an order of magnitude rather than a headcount."*

**The article refuses the registrations-as-people conflation in its body and commits it in the
caption of the plate that stages the same paragraph.** No gate can see this: it is not a repetition,
so the scene-echo gate is blind; it is not a killed claim, so the zombie guard is blind; the plate
primitive has no `source` field, so nothing demands one.

"Last year" is also a floating reference that will read wrong the moment FY2025 is out.

---

## HUNT 3 — cross-surface claim consistency

Every figure on every service page traced to its own flagship post, its JSON-LD, the sitemap, the
homepage and the `/services` index.

**A correction to the brief before the findings: `llms.txt` does not exist in this repo.** Neither
`public/llms.txt` nor `app/llms.txt`. There *is* one on the domain — `/ai/llms.txt`, HTTP 200, 3,761
bytes — and it belongs to the ai-page project and contains 78% (see finding 1). The marketing site
publishes none.

**What is clean.** Numbers rendered into JSON-LD are drawn from the same payload as the visible
copy, so there is nothing in the schema that is not on the page — I diffed every number in every
`ld+json` block against every number in `document.body.innerText` on eight pages at both widths and
the LD-only set was **empty on all eight**. Sitemap: 66 URLs, 20 services, 20 flagship posts plus
`/blog`, **0 placeholders**. Every `relatedPosts` id on all twenty service pages resolves to a real
post. The killed 78% and 73% appear nowhere in shipped copy in this repo — every hit is a debunk, a
`//` comment recording the kill, or a CSS value (`h-[78%]`, `78% 8%`). `VideoObject` schema is
emitted only where a film file actually exists (5 posts, 5 files in `public/video/`), so C3 being
honestly red on fifteen posts has not leaked into a schema claim.

### Where the surfaces disagree

**3a. `content/services/ai-chat-assistant.ts:52` — the only `stat` in the set with no `source`.**
Measured: 16 of 20 service pages carry a `stat`; **15 of those 16 carry a `source`; this one does
not.** Round H measured the same thing and recorded it; it is still open. The rendered chip prints
`23% / of 2,241 US companies never answered a website inquiry at all` with no source line while
every sibling chip has one — on the single page `SERVICES-CRITIQUE.md` §2 was written about, and
whose §2 recommendation ends *"If `stat` survives, give it `source` and make it required."*
The source is not missing from the page, only from the field: the file's own header comment and its
own FAQ both carry the HBR citation.

**3b. The same study is described two different ways, and the short surfaces overstate it.**
The HBR operative sentence, read in the primary document and quoted in this repo's own research
comment at `content/blog/ai-chat-scenes.ts:63`:

> *"Firms that tried to contact potential customers within an hour … were nearly seven times as
> likely **to qualify the lead (which we defined as having a meaningful conversation with a key
> decision maker)** as those that tried to contact the customer even an hour later."*

The long-form post gets this exactly right (`ai-posts.ts:3459` quotes the definition). Three short
surfaces do not:

- `content/services/ai-chat-assistant.ts:37` — *"nearly seven times likelier to **reach a decision
  maker**"*
- `content/blog/voice-agent-scenes.ts:49` — *"nearly seven times likelier to **reach a decision
  maker**"*
- `content/blog/voice-agent-scenes.ts:475` (the calculator note) — same phrasing

"Reach a decision maker" is a materially easier outcome than "have a meaningful conversation with a
key decision maker", and the 7x is attached to the easier one in every place a skimmer will see it.
The drift runs in one direction, across three surfaces, and it is the kind of softening that arrives
by compression rather than by intent.

**3c. A hedge lost between the post and the page.** Winkler's sentence is *"even high quality files
**might** contain more than 20 percent error in first name pairs"*. `content/services/crm-sync.ts`
prints it as a flat fact: *"20%+ of record pairs that are the same person disagree on the first
name."* The post drops the hedge too, one sentence later. Same figure, same source, correct
citation — only the modality moved.

**3d. Consistency checks that passed.** `87.5%` / `80.5%` (booking), `44.2%` (agent workforce),
`10.3%` (audit), `48.2%` / `50%` (clone), `61%` (scheduling), `94.36%` (document processing), `70%`
/ `13.8%` / `105 million` (geo), `0.3%` (marketing), `74%` / `47%` (review) and `100%` (skip tracing)
all appear in their own flagship post with the same value and the same framing. `$2.77 billion` on
`content/services/invoicing-and-payments.ts:145` rounds `$2,770,151,146` from the post — same figure,
same table, and both name the definitional trap (IC3's `Real Estate` crime type does not contain the
spoofed-closing-wire case; BEC does).

---

## HUNT 4 — do the citations say what the posts say they say?

Seventeen operative sentences read in the primary document. **Sixteen are exact. One is cited to the
wrong subdivision.**

| claim | source | result |
|---|---|---|
| NY Civil Rights Law §50 "fits in a single sentence", consent must be **written**, obtained **first**, offence is a **misdemeanour** | nysenate.gov CVR/50 | **exact.** One sentence, and all three emphases are literally in it |
| §51 — equitable action in the supreme court, damages, exemplary damages where knowing | nysenate.gov CVR/51 | **exact** |
| §50-f — "deceased personality", "digital replica" definitions, in force since 2020 | nysenate.gov CVR/50-F | **exact**, and the "since 2020" is carefully phrased as *"on the version history its own page carries"*, which is what the page shows (2020-12-04 is the earliest revision listed) |
| 16 CFR part 461 "has three short sections… it has no section 461.4 in it" | eCFR title-16 structure API | **exact and still true today**: `461.1`, `461.2`, `461.3`, `descendant_range: "461.1 – 461.3"`. A claim built to rot, checked, and it has not |
| 18 U.S.C. 2721(b)(8) — *"For use by any licensed private investigative agency or licensed security service for any purpose permitted under this subsection"* | law.cornell.edu | **exact, word for word** |
| 18 U.S.C. 2721(c) — 5-year records of recipient and permitted purpose | law.cornell.edu | **exact, word for word** |
| DPPA has fourteen permissible uses | law.cornell.edu | **correct**, (b)(1)–(b)(14) |
| 15 U.S.C. 7704(a)(3) — mechanism live "no less than 30 days" | law.cornell.edu | **exact** |
| 15 U.S.C. 7704(a)(4) — "more than 10 business days after the receipt of such request" | law.cornell.edu | **exact** |
| 15 U.S.C. 7704(a)(5) — "a valid physical postal address of the sender" | law.cornell.edu | **exact** |
| 12 CFR 229.10(b)(1) and (b)(2) — electronic payment availability and the two-part definition of "received" | law.cornell.edu | **exact**, including "in actually and finally collected funds" |
| 16 CFR 465.7(b) — misrepresenting that a review block represents most or all reviews while suppressing by rating, plus the equal-criteria carve-out | eCFR renderer | **exact**, and the post's insistence that "the load-bearing word is misrepresent" is right |
| Google contribution policy — *"Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers"* | support.google.com/contributionpolicy/answer/7400114 | **exact, and still on the live page today** |
| Cal. Penal Code §632(a) — "without the consent of all parties to a confidential communication" | leginfo.legislature.ca.gov | **exact** |
| 42 U.S.C. 3604(c) and (d) — "indicates any preference, limitation, or discrimination"; "is not available for inspection, sale, or rental when such dwelling is in fact so available" | law.cornell.edu | **exact, both** |
| NAR Code of Ethics Article 10 — "shall not deny equal professional services… sexual orientation, or gender identity" | nar.realtor 2025 Code | **exact**, and the post's point stands: those two categories are in Article 10 and not in 3604 |
| **NY Penal Law §250.00 — recording** | **nysenate.gov PEN/250.00** | **WRONG SUBDIVISION** |

### 4a. The one mis-citation

`content/blog/ai-posts.ts:3537`:

> *"Under [New York Penal Law section 250.00], recording counts as eavesdropping only when it is
> done **"without the consent of at least one party thereto, by a person not present thereat"**. If
> you are on the call, you are that party, so in New York you may record your own calls."*

That quoted sentence is §250.00(**2**), the definition of **"Mechanical overhearing of a
conversation"** — which governs in-person conversations. The paragraph is about **telephone calls**,
and the definition that governs those is §250.00(**1**), **"Wiretapping"**:

> *"the intentional overhearing or recording of a **telephonic or telegraphic communication** by a
> person other than a sender or receiver thereof, without the consent of either the sender or
> receiver…"*

The conclusion the post draws is still right — a participant is a sender or receiver, so recording
your own call is not wiretapping — but the sentence quoted to support it is the wrong one, and the
right one makes the argument *better and shorter*. On the legally heaviest paragraph in the voice
post, the reader who follows the link finds a different sentence than the one on the page. (Two
further precisions worth one line each: §250.00 is the **definitions** section; the offence is
§250.05. And "recording counts as eavesdropping" is doing the work of both definitions at once.)

**Not repeated on any service page** — `content/services/ai-voice-agents.ts` carries no recording
quote at all, which is a separate problem (see hunt 7).

---

## HUNT 5 — the reader's actual journey, 1440 and 390 DPR3

Walked `/blog → a post → its service page → /services → another post → another service page`, at
both widths, with the lead endpoint intercepted. **Zero console errors, zero page errors, zero
horizontal overflow at either width, zero broken images, zero images with a missing `alt`, zero
unparseable JSON-LD, zero placeholder text on any indexed page, and no request ever reached
`/api/lead`.** The mechanics of this site are in very good order and I want that on the record
before the two things that are not.

### 5a. "Keep reading" is the three newest posts. Every post shows the same three.

`app/blog/[slug]/page.tsx`:

```js
const related = (await getArticles()).filter((a) => a.slug !== post.slug).slice(0, 3);
```

Measured in the browser on five posts:

| post read | "Keep reading" offers |
|---|---|
| `/blog/ai-chat-assistant-real-estate-website` | custom-automation, ai-audit, ai-clone |
| `/blog/skip-tracing-real-estate-legal-owner-phone-numbers` | custom-automation, ai-audit, ai-clone |
| `/blog/local-seo-real-estate-map-pack-google-business-profile` | custom-automation, ai-audit, ai-clone |
| `/blog/ai-clone-real-estate-agent-video-avatar` | custom-automation, ai-audit, invoicing |
| **`/blog/packing-101-pro-tips-organized-move`** | **custom-automation, ai-audit, ai-clone** |

Three consequences a person actually hits:

1. **A reader who reads two flagships in a row sees an identical block twice**, in a body of work
   whose entire standard is that nothing is said twice. Sibling overlap is policed at 0 across the
   cohort; the recommendation block is at 100%.
2. **A consumer who came for packing tips is handed three enterprise-automation essays.** The
   placeholder consumer posts are `noindex, follow` and out of the sitemap, but a person with the
   link still lands there, and the only onward path offered is B2B.
3. **The commercial half of the site solves this and the editorial half does not.** All twenty
   service pages carry a curated `relatedPosts` (2 or 3 each, every id resolving). No blog post
   carries one — `content/blog/posts.ts` has no `relatedPosts` field at all. Two philosophies of
   "what to read next" on one site, and the better one is on the pages that were not the focus of
   this rollout.

Worth knowing alongside it: **15 of the 20 flagships are dated 2026-08-25 or 2026-08-26** — the two
days they were written. The `related` list is date-ordered, so ordering inside a 15-post tie is
array order, and "latest" is close to meaningless. On `/blog` a visitor meets a wall of one date.
Honest, and it will read at launch as twenty articles published in a weekend.

**The other direction of this seam is well built and should not be touched:** every one of the 20
flagships links to its own service page, and every service page links back to curated posts. It is
only the post-to-post hop that is unconsidered.

### 5b. The calculator slider has a 4-pixel touch target on a phone

The calculator is the flagship template's signature interaction and it is on every post. Measured at
390 DPR3: `input[type="range"]` renders **266 x 4 CSS px**. The element box *is* the hit area.

Proved by dragging rather than by measuring:

```
input box: 266x4   thumb: 266px x 4px   touch-action: auto
drag at dy=  0px : 400  -> 4350   GRABBED
drag at dy= -8px : 4350 -> 4350   MISSED
drag at dy=-12px : 4350 -> 4350   MISSED
```

Same result on a second post. A finger's contact patch is roughly 9mm, about 34 CSS px; the user has
to land within ±2px vertically. CLAUDE.md's own floor is **≥24px**, so this misses the house rule by
a factor of six, on the one element the whole template asks a reader to touch. `check-svg-crop.mjs`
cannot see it (not SVG text), `score-flagship.mjs` cannot see it (the calculator is present), and no
round has dragged one.

### 5c. Type, checked against the house rule rather than by eye

Body prose is ≥16px at 390 and **every form control is exactly 16px**, so the iOS-zoom floor holds.
The sub-16px text is all chrome — eyebrows at 11px, chart notes and figcaptions at 14px,
breadcrumbs at 12px. One item is worth a look rather than a fix: `text-[10px]` speaker labels
("Visitor" / "AI") on the service-page transcript figure, at 390, in uppercase with 0.18em tracking.

---

## HUNT 6 — what the gates cannot see, and one instance of the worst

| gate | what it actually measures | the class of defect that passes it |
|---|---|---|
| `scripts/flagship-standard.mjs` | counts against the cohort median: prose words, sections, citations, FAQ questions, body images, data graphics | **everything about whether any of it is true.** A post with 6 citations that each say something other than what it claims scores identically to one with 6 that do. Hunt 4's mis-citation and all 22 plate errors pass |
| `scripts/score-flagship.mjs` | presence, in the rendered page: a cited source exists, images exist, a data graphic exists, FAQ schema, cluster links, a freshness signal | **whether a present thing is the right thing.** "Cluster links exist" is green while every post links to the same three; "a freshness signal exists" is green while 15 posts share one date |
| `scripts/check-svg-crop.mjs` | `getBBox()` on real text nodes inside SVG, against the viewBox | **anything that is not text inside an SVG.** The 4px slider, contrast, tap targets, HTML clipped inside a scroll container |
| `lib/blog/zombie-claims.test.ts` | a fixed list of KILLED strings, over `content/**`, `components/**`, `content/services/**` of this repo | **(a)** any LIVE claim, however wrong; **(b)** any bad claim not yet on the list; **(c)** **any surface outside this repo** — including the proxied `/ai` that this repo's own `next.config.ts` serves under this domain |
| `lib/blog/flagship.test.ts` (content contract) | required fields exist and are non-empty; `sourceHref` matches `^https://`; charts have >1 bar and a >20-char caveat | **whether the required content is correct.** A `source` object pointing at the wrong document, a caveat that says nothing, a caption that miscounts — all green |
| the scene-echo gate (`flagship.test.ts`, commit 347dd94) | an 8-word verbatim run shared between any scene string and the body | **a scene that PARAPHRASES the prose, and a scene that CONTRADICTS it.** It is a repetition detector; disagreement is invisible to it by construction |

**One instance of the worst of those, found by looking for it.** The scene-echo gate's blind spot is
contradiction, and there is a live one: `content/blog/skip-tracing-scenes.ts:481` says *"Two million
**people** said the same thing to the Federal Trade Commission"* three paragraphs after
`content/blog/ai-posts.ts` says *"That is **not a count of people**"* about the very same kind of
figure — and the true number is 2,085,133 **complaints**. Not a repetition, not a killed claim, in
the one field with no `source`. Every gate green. Full working in hunt 2.

**A negative result worth recording so nobody builds it:** I tried to generalise this into a gate
("a figure a scene asserts that its own body never states") and it returns **150 hits across the
cohort, nearly all legitimate** — a chart's whole job is to carry numbers the prose does not repeat,
and arXiv identifiers, journal page numbers, licence versions and calculator `min`/`max` all trip
it. **Do not build that gate.** Narrowed to **plate captions only** — the one scene field with
neither `source` nor `basis` — it returns six, of which one is a defect (above), one is correct but
unsupported-by-construction (the Poughkeepsie dates, which I verified by hand), and one asserts an
age for a photographed object that the photograph cannot support (`custom-scenes.ts:406`, *"This is
a program, and it is two hundred years old"*, of punched cards whose date the source does not give).
**A six-line check over plate captions is the version worth building.**

---

## HUNT 7 — SERVICES-CRITIQUE.md, item by item: is each one genuinely closed?

| item | state | evidence |
|---|---|---|
| **§1** review gating described as compliant | **CLOSED, and closed well** | all four places now say the link goes to everyone: `lede`, `figure.footnote`, `whatItIs[1]`, `howItWorks[2]` — *"as well as, not instead of"*. Matches the Google policy sentence I read live today |
| **§2a** the 78% x3 on the chat page | **CLOSED** | replaced by 23% of 2,241 and the HBR seven-times figure. Zero live instances anywhere in this repo |
| **§2b** the unsourced 73% on the review page | **CLOSED** | replaced by BrightLocal 2026's 74% / 47% with the panel size on the page |
| **§3** lead-qual silent on fair housing | **CLOSED** | 42 U.S.C. 3604 and NAR Article 10 in `whatItIs` and in a dedicated FAQ; both quotes verified |
| **§4** no `limits` field anywhere | **CLOSED** | all 20 pages carry `limits`, 4–7 entries each |
| **§5** document-processing "never" | **CLOSED** | no "never" in that file's shipped copy |
| **§5** two pages with empty `relatedPosts` | **CLOSED** | geo and local-seo both carry 2 |
| **§5** `ServiceToc` sheet under the chat launcher | **CLOSED** | `ServiceToc.tsx:180` is `z-[1000000]` |
| **§5** none of the 20 has a `video` | **OPEN**, owner-held | unchanged and correctly so |
| **§5 the voice page never says whether calls are recorded** | **STILL OPEN, and it is the last one** | see below |
| **tier reassignment** | **OPEN**, owner call | unchanged |

### 7a. The one critique item that is still open is the one with legal exposure

`content/services/ai-voice-agents.ts` says *"it logs every call so the record is there"* and *"a
transcript records none of it"*. It still never says **whether audio is recorded**. The critique
raised it on 2026-08-03; eight rounds have passed; the page has gained consent and calling-window
language (*"you need consent to call, you must honor do-not-call requests, and the agent identifies
itself as an AI assistant"*) but not this. Its own flagship post spends a paragraph on New York's
one-party rule against California's all-party rule and advises assuming the stricter one when the
caller is out of state — and the page that sells the product is silent on the fact the paragraph
turns on. It is one sentence either way, and either sentence is a selling point.

### 7b. Also still open, from ROUND-H-LOG's own "defects found and NOT fixed"

`content/services/ai-clone.ts` still names two vendors as a quality benchmark — *"A HeyGen-class
video avatar plus an ElevenLabs-class voice clone"*, and the spec chips *"HeyGen-class avatar"*,
*"ElevenLabs-class voice"*. I agree with Round H's decision not to touch it and I would raise the
stakes: this is a **comparative advertising claim about a competitor's product quality**, made
without a measurement, on a page whose flagship post's whole argument is that likeness claims need
to be exact. It should come out, and taking it out is the owner's call because the avatar is his.

---

## WHAT I FIXED VERSUS WHAT I REPORT

**Fixed: nothing.** I looked for the cheap unambiguous corrections the brief invited and did not
find one that survived the test *"can this be corrected without deciding what it should say
instead?"*:

- `ZIP-0` → `ZSP-2` is not a token swap: the alt also puts the stencil in the wrong place, so the
  clause has to be rewritten.
- `black lever handle` → `red` changes a sentence whose surrounding clauses were written around the
  contrast.
- `brown ink` → nothing obvious; the whole clause describes a colour that is not there.
- *"Two million people"* → the honest version is *"two million complaints"*, which breaks the
  caption's cadence and its argument, so it is a writing decision.
- The missing `stat.source` on `ai-chat-assistant.ts` needs an `href`, and this repo's own note
  records that hbr.org paywalls the article — choosing between a paywalled primary and no field is
  a judgement.

**Reported, in priority order for whoever takes the next round:**

1. The `/ai` surface (finding 1) — decide before launch.
2. The 14 unarguable plate errors, plus 8 soft ones.
3. The "Two million people" caption.
4. "Keep reading" showing the same three posts on all 30 pages.
5. The 4px slider hit target.
6. The NY Penal Law §250.00 subdivision.
7. The missing `stat.source` on the chat page.
8. The voice page's recording silence (SERVICES-CRITIQUE §5, eight rounds old).
9. The "reach a decision maker" drift on three surfaces.
10. `ai-clone`'s vendor-comparison claim.

**Probes.** Eight read-only probes were written for this pass and left on disk at
`scripts/_scratch-checker-*.mjs`. They are **not committed** — `.gitignore:47` is `scripts/_scratch-*`,
"session artifacts, never committed" — so the two that are worth reproducing are written out here
rather than referenced:

*The slider check, which is the one that found a real defect and was proved both ways.* Open a post
at 390 DPR3 with touch, take `boundingBox()` of the first `input[type="range"]`, then
`mouse.down()` at `(x + 0.15w, y + h/2 + dy)` and drag to `0.85w` for `dy` of `0`, `-8` and `-12`,
reading `inputValue()` before and after each. A correct slider moves on all three. This one moves
only at `dy = 0`.

*The `/ai` deep-link check, which the next agent will want the moment the ai-page deploy lands.* For
each of the twenty keys, `goto("http://localhost:3100/ai#" + key)`, wait ~3s for the WebGL boot,
then read `document.querySelector("#panel").className` (expect `is-open`) and its `innerText`. Do
**not** check for an element with a matching `id` — the /ai app routes hashes in JavaScript, and an
id-based checker reports all twenty dead. Reading `innerText` is also how the killed claims in
finding 1 were found, so the same probe answers both questions.

---

## WHAT I LOOKED FOR AND DID NOT FIND

A clean bill on a specific hunt is a result. Do not re-do these.

- **Fabricated addresses, names, phone numbers or emails: none.** One reserved-for-fiction 555
  number used correctly; one hypothetical street name in an illustrative sentence.
- **Dates written from memory: none.** Every visitor-facing date verified against a primary
  document. The Poughkeepsie bridge caption, which is the most exposed one (three hard facts, no
  source field), is correct in all three.
- **A number that says one thing on a page and another in its schema: none**, across eight pages at
  two widths. The LD-only number set was empty every time.
- **Broken internal links: none.** Every `/blog/…`, `/services/…` and top-level route in blog and
  services copy resolves; all 20 service `relatedPosts` ids resolve; all 20 `/ai#…` deep links open
  the correct panel in a browser.
- **Dead `/ai` anchors: none** — and I say so loudly because my own first checker said twenty of
  twenty were dead, which was a checker fault, not a site fault.
- **A `VideoObject` claiming a film that does not exist: none.** Five posts emit it; five files
  exist in `public/video/`.
- **Placeholder leakage: none.** 0 placeholders in the sitemap, `noindex, follow` on each, none
  listed on `/blog`.
- **Console errors, page errors, horizontal overflow, broken images, missing `alt`, unparseable
  JSON-LD, an escaping `/api/lead` request: none,** on 16 page-loads across two viewports.
- **The 78% or 73% returning to this repo: no.** Every hit is a debunk, a comment recording the
  kill, or a CSS length.
- **The plate crop rule failing on any photograph: no.** All 36 sources are ≤1.78 aspect, so 16:9 is
  a vertical superset for the entire cohort.
- **A licence or photographer name that disagrees with the ledger: none** across all 36 plates. The
  `counties/putnam.jpg` row looked wrong — the ledger title is "Cold Spring Harbor, NY", which is a
  Long Island place, while the alt says the Hudson — and it is not: the photographer's own
  description on the source page reads *"Cold Spring is a small village located in the Hudson
  Highlands… across the river from West Point."* The site is right and the source title is loose.
- **The Archimedes Palimpsest attribution in `ATTRIBUTIONS.md`: correct**, on the Walters Art
  Museum's own keywords (`archimedes, archimedespalimpsest, hyperides`).
- **`mailbox-mist.jpg` still unspent, everything else spent: correct.** 33 of 34 editorial
  photographs are referenced in code; one is not; the ledger says exactly that.

---

## STALE DOCUMENTATION, reported not corrected

`docs/blog-flagship/ROLLOUT-PLAN.md` "Where the board stands (verified 2026-08-25)" carries three
statements that are now false, and contradicts its own progress table twelve lines above:

- *"17 flagship posts green as of Round G… 3 topics have no flagship post"* — there are 20 and none
  are missing.
- *"10 consumer placeholder posts are indexable and in the sitemap"* — verified today: 0 in the
  sitemap, `noindex, follow` on each.
- The "Also carried" block still reports `available` proseWords as **5,725** ("After Round G") and
  argues for a ratchet, three paragraphs below the section that already **decided** the ratchet.
  Round H measured 5,683.

An agent who reads that section and trusts it will re-do work. It is a five-minute edit and it is
somebody's next round rather than a checker's.

---

## VERDICT

**Launch-ready on the marketing site's own surfaces. Not launch-ready as a domain, because of one
thing, and it is fixable in an afternoon.**

The twenty posts and the twenty service pages are, on the evidence I gathered, the most carefully
sourced body of marketing writing I have audited. Seventeen operative sentences read in their
primary documents; sixteen exact, and the seventeenth is a wrong subdivision supporting a correct
conclusion. Every hard date correct. No fabricated person, address, phone number or email anywhere.
No claim in the schema that is not on the page. No broken link. No console error. The two most
serious items on the original critique — a legal-risk mechanic sold as compliant, and a hero
statistic the page's own recommended reading debunks — are properly, thoroughly closed, and the
compliant version is the better sales copy, which is the sign it was done for the right reason.

Against that: **`realtylt.com/ai`, which this repo's rewrite serves and which twenty-nine links in
these posts point into, still carries 78%, 73%, "unlimited parallel agents", the review-gating
sentence and the CRM absolute — including 78% inside FAQPage JSON-LD and inside `llms.txt`.** A
visitor who follows the site's own link from the article that debunks 78% is shown 78%. That is not
a copy problem; it is the domain contradicting itself in structured data. It blocks nothing on this
repo's side and everything about launching the deep links.

Below that, the defects are real but not launch-blocking: 14 plate alt-text errors (an
accessibility and honesty debt, invisible to sighted readers), one fabricated caption figure, a
recommendation block that offers the same three articles on all thirty pages, and a slider a phone
user cannot grab.

### The strongest argument against my own verdict

**It is this: I have graded the citations and the plates, which are the parts a checker can measure,
and I have barely graded the writing, which is the part that decides whether any of this works.**

Sixteen of seventeen citations exact is a fact about diligence, not about persuasion. I did not read
twenty posts end to end. I did not test whether the arguments land, whether a broker who is not
already interested finishes one, or whether "argued as subtraction rather than as a list" is a real
distinction or a house style that has started admiring itself. The rounds measured sibling overlap
at 0 and I confirmed no post repeats another's sentences — but I found that all thirty pages end
with the identical three recommendations, which is the same failure at a level no metric was
pointed at, and it makes me suspect there are others: a house voice that reads as one voice across
twenty topics may be a strength or may be the reason nobody finishes the second one.

There is also a specific way my verdict could be too kind. I sampled seventeen citations out of
106 external links in `ai-posts.ts` alone, weighted toward the legally-loaded ones, and found one
defect — a **6% miss rate on the sample that had the most eyes on it**. If that rate holds across
the other 89, there are five more mis-citations in this cohort and I did not find them. The honest
reading of "sixteen of seventeen exact" is not "the citations are clean"; it is "the citations are
good enough that finding the next fault will cost another full pass."

And one way it could be too harsh: the `/ai` finding is not this repo's code, and a reader who never
clicks an `/ai` link never meets it. If the owner deploys the ai-page fix that has been written
since Round A, my worst finding evaporates on somebody else's `git push` and this body of work is
straightforwardly ready.
