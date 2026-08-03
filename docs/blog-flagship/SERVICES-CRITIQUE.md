# The twenty service pages, read hard

**Owner's question, 2026-08-03:** *do the services pages explain things well, and do they state
things correctly?*

**Read, not edited.** `app/services/**` and `content/services/**` belong to a concurrent session.
Nothing here was changed. Everything below is a recommendation with the file, the sentence and the
primary document behind it, so it can be acted on without re-doing the reading.

**Short answer.** They explain well. The template is disciplined, the copy is plain, the figures are
drawn rather than stock, and the AI voice agent page in particular is more honest than most vendors
manage. Three things are stated **incorrectly**, and one of them is the kind of mistake that costs
money rather than credibility. There is also one structural gap that the blog standard already
solved and the commercial surface has not.

Severity order. Fix 1 and 2 before anything cosmetic.

---

## 1. The review automation page describes review gating while explaining that review gating is not allowed

`content/services/review-automation.ts`. This is the most serious item on the whole services
surface, and it is not a wording problem.

The page's own FAQ defines the rule correctly:

> *"What is not allowed is incentivising reviews, or only asking the people you expect to leave a
> good one, which is called review gating. **This asks everyone.**"*

Three other places on the same page describe the mechanism:

| where | what it says |
|---|---|
| `lede` | "a rough one is caught privately first so you can make it right **before it ever goes public**" |
| `figure.footnote` | "**A four or below never sees this link.** It routes to a private conversation" |
| `howItWorks[2]` | "A low score routes to a private conversation with you **instead of a public review link**" |

Everyone gets the *survey*. Only the fives get the *review link*. "This asks everyone" is true of the
first and false of the second, and the second is the one the rule is about.

**Google's own policy, read in the primary document** (`support.google.com/contributionpolicy/answer/7400114`),
lists under "We do not allow merchants to":

> *"Discourage or prohibit negative reviews, **or selectively solicit positive reviews from
> customers**"*

That sentence describes the product this page sells, in Google's words rather than in mine.

**There is a second exposure on the same page**, and it is federal rather than platform policy. The
page also promises:

> `lede`: *"The best reviews land on your site automatically"*
> FAQ: *"Can the best reviews go on my own website? Yes. Reviews can be pulled through to your site
> automatically so your best recent feedback appears..."*

**16 CFR § 465.7(b)**, the FTC's Rule on the Use of Consumer Reviews and Testimonials (89 FR 68077,
August 22 2024), read in the eCFR:

> *"It is an unfair or deceptive act or practice... For a business to materially misrepresent,
> expressly or by implication, that the consumer reviews... displayed in a portion of its website...
> represent most or all the reviews submitted... when reviews are being suppressed (i.e., not
> displayable) based upon their ratings or their negative sentiment."*

Read the whole subsection before reacting: it turns on **misrepresentation**, not on selection. A
site that labels the block "a selection of recent reviews" is in a different position from one whose
reviews section implies it is the whole set. The rule also lists criteria that may be applied
equally to all reviews regardless of sentiment. So this is fixable in a sentence, but it has to be
fixed deliberately rather than left to whoever writes the widget.

**Recommended:**

1. Send the Google link to **everyone**, and route the low scores to a private conversation **as
   well as**, not instead of. That is the version that is both compliant and, on the page's own
   argument, better: a business with only fives reads as filtered, and a four answered well reads as
   real.
2. If the product genuinely does gate, say so plainly and drop the FAQ that claims it does not. The
   worst position is the current one, which names the rule and then claims an exemption from it.
3. On the website-embed claim, say what the block is: "a selection of recent reviews", not "your
   best feedback" presented as the reviews section.

This is also the one place on the services surface where the flagship blog standard's rule would
have caught it: *"Never a claim the site has not already made"*, plus a required **what it does not
do** section. Review automation has neither.

---

## 2. Two service pages carry an unsourced statistic, and one of them is a number our own blog proves cannot be sourced

`content/services/types.ts` says of the `stat` field:

> *"Only when the number is one we already state and can stand behind."*

Two pages of twenty use it. Neither number can be stood behind.

### 2a. The chat page prints 78%, and links to the article that debunks it

`content/services/ai-chat-assistant.ts` asserts it **three times**:

- `why`: *"78% of leads close with whoever responds first, yet most sites answer in hours."*
- `stat`: `value: "78%", label: "of leads close with whoever responds first"`
- FAQ: *"roughly 78% of leads close with whoever responds first"*

The flagship blog post for the same service spends its entire second section on that figure and
concludes: *"It is attributed on hundreds of pages to a survey with no published report, no stated
sample, and no methodology... **So this article does not use it.**"*

And `relatedPosts` on that service page is:

```
relatedPosts: ["ai-chat-assistant-real-estate-website", "workflow-automation-real-estate-business"]
```

**The page's own recommended reading is the rebuttal of the page's own hero statistic.** A visitor
who follows the link we put there finds us saying nobody can source the number we just led with.

**Recommended:** replace it with the figure the blog actually rests on, which is checkable. Harvard
Business Review, *The Short Life of Online Sales Leads* (2011), Oldroyd, McElheran and Elkington:
firms contacting a lead within an hour were **nearly seven times** as likely to qualify it as firms
contacting an hour later, across 1.25 million leads at 29 B2C and 13 B2B companies. The same audit
of 2,241 US companies found **23% never answered at all**, which is a better hook than 78% because
it is true and because it is worse.

`components/blog/scenes/primitives/StatBars.tsx` already models the discipline: `note` and `basis`
are required fields, so a chart cannot ship without saying where it stops being evidence. The
`Service` type's `stat` has neither. If `stat` survives, give it `source` and make it required.

### 2b. The review page prints 73%, and a better number is one fetch away

`content/services/review-automation.ts` asserts *"73% of customers read reviews before they book"*
in the `why`, the `stat` and an FAQ. No source anywhere.

**BrightLocal, Local Consumer Review Survey 2026** (published 11 February 2026, a representative
panel of **1,002 US adults** via SurveyMonkey), read in the primary document:

- **97%** of consumers read reviews for local businesses
- **41%** "always" read reviews when browsing, up from 29% the year before
- **85%** are more likely to use a business after reading positive reviews; **77%** are deterred by
  negative ones
- **74%** only care about reviews written in the last three months

That last one is worth more to this page than any of the others, because **recency is the page's own
argument** and it currently has no number under it. "74% only care about reviews written in the last
three months" says exactly what `useCases[1]` is trying to say and can be checked.

---

## 3. The lead qualification page sells the exact mechanic its own blog post says is the line you must not cross

`content/services/lead-qualification.ts` contains no mention of fair housing, protected classes,
discrimination or steering. Measured across all twenty pages, it is the only regulated-risk service
whose page is silent about its own regulation.

Its own flagship post devotes a full section to it, cites **42 U.S.C. § 3604** and **NAR Code of
Ethics Article 10**, and states the rule as:

> *"Change your order, never their access. Qualification decides who you call first. It must never
> decide who gets to see a listing, who gets a straight answer, or who is allowed to reach a human
> being. The moment a low score means less service rather than a later call, you have crossed from
> ranking your time into rationing housing."*

The service page's `useCases[2]` sells:

> *"The right agent on the right lead — Routing **by area**, price band, or specialty, automatically,
> instead of by whoever happened to grab it."*

Routing by area is a defensible operational practice and it is also the classic fair-housing proxy.
The blog post knows this. The page that sells it does not say so.

**Recommended:** one paragraph, lifted from the post rather than newly invented, plus the FAQ the
post already carries (*"Is it legal to score and route leads with software?"*). The page currently
has three FAQs; the post has five, all researched.

---

## 4. The structural gap: there is nowhere on a service page for what the service will not do

`content/services/types.ts` defines `whatItIs`, `howItWorks`, `useCases`, `faqs`. There is no field
for limits, and `app/services/[slug]/page.tsx` renders no such section:

```
ServiceHero → Outcome → WhatItIs → HowItWorks → UseCases → SeeItLive → VideoBlock → Faq
   → RelatedPosts → ServiceLead → MoreServices
```

The flagship blog standard makes `hasLimitsSection` a **required boolean for every post**, on the
grounds that a business owner's fourth question is "what will it not do, where does this break"
(`docs/blog-flagship/STANDARD.md` §1). Every one of the five flagships carries *"What it does not
do, and should not pretend to."*

The commercial surface, which is the one that ranks and the one an AI answer lifts from, has no such
structure. Five of twenty pages contain no limiting language anywhere at all: **ai-audit, crm-sync,
custom-automation, lead-qualification, review-automation.**

**Recommended:** add `limits: string[]` to `Service`, render it between `UseCases` and `SeeItLive`,
and backfill twenty entries. Three of them can be lifted almost verbatim from the flagship posts
that already exist. It is the single change that would most raise the credibility of the whole
surface, and it costs one field, one component and twenty short lists.

The voice page shows this is not a hypothetical improvement. It already does it inside prose, and it
is the best page in the set as a result:

> *"It replaces the mechanical part of the ISA role... **It does not replace an experienced agent on
> a listing appointment.**"*
> *"The agent identifies itself as an assistant... **We do not build agents that pretend to be a
> specific human being.**"*
> *"**It will not invent a price, a legal position, or a fact about a property.** Anything it cannot
> verify becomes a booked call."*

That is the standard. It is just not a field, so nineteen pages do not have to meet it.

---

## 5. Smaller, verified

**`document-processing` guarantees something a document reader cannot guarantee.**
> *"Automated extraction pulls the critical dates and terms instantly, so deadlines **never** slip
> through a PDF."*

Misreading a date on a scanned rider is the whole failure mode of this category. "Never" turns a
good product into a promise nobody can keep, and this is a page about contract deadlines. Suggest:
"so a deadline is flagged the day the contract lands, not the week it expires."

**The voice page never says whether calls are recorded.** It says it "logs every call so the record
is there". The flagship post spends a paragraph on New York Penal Law § 250.00 (one-party consent)
against California Penal Code § 632 (all-party), and advises assuming the stricter rule when the
caller is out of state. If the product records audio, the page should say so and say what it does
about the caller's state. If it only stores a transcript, saying that plainly is a selling point.

**`review-automation`, `ai-audit`, `crm-sync`, `custom-automation` and `lead-qualification` have no
limits language at all.** See §4.

**Two pages have no related reading:** `geo-landing-pages` and `local-seo` carry `relatedPosts: []`.

**`components/services/ServiceToc.tsx` line 173 opens its mobile sheet under the chat launcher.**
Not a content problem, and it is the one code change worth making. The sheet is
`role="dialog" aria-modal="true"` at `z-[70]`; the launcher injected by `/rlt-chat.js` is
`position: fixed` at `z-index: 999998`. Measured on a 390px phone, a 60x60 button belonging to a
different widget paints on top of the bottom-right corner of the open dialog and covers navigation
rows. The rest of the site already knows this: `components/idx/ListingGallery.tsx` and
`components/leads/QualifyingWizard.tsx` use `z-[1000000]`, `components/leads/ListingLeadCTAs.tsx`
uses `z-[1000001]`. The two blog rails had the identical bug and were fixed to `z-[1000000]` on
2026-08-03; services is the third and it is the same one-token change.

**None of the twenty has a `video`.** The type supports it and the JSON-LD activates the moment one
exists, so the cost of the first one is a recording, not a build.

---

## What is genuinely good, and should not be touched in a tidy-up

- **One template, twenty content files.** The comment in `app/services/[slug]/page.tsx` gets this
  exactly right: twenty page files would drift within a month. This is the same decision the blog's
  primitive set made, and it is the reason a fix like §4 costs one field instead of twenty edits.
- **The figures are drawn, not stock.** `types.ts` says why: *"a stock photo of a headset would say
  nothing about what an AI voice agent does."* Four figure kinds across twenty pages, chosen by what
  the service's product actually is (a dialogue, a speed, a data change, a chain). Eight flows, five
  records, four timelines, three transcripts. That is a real system.
- **The FAQs are written the way people type**, not the way we would defend ourselves. "How do I get
  more Google reviews?" is a search query. "Will it annoy my visitors?" is an objection. The
  services surface mostly writes the first kind, which is the one an AI answer lifts. The blog
  learned this lesson later and wrote it into `STANDARD.md` §4.
- **The voice page's honesty.** See §4.
- **Consistency is real, not claimed.** Every page: 2 or 3 `whatItIs` paragraphs, 3 or 4
  `howItWorks`, 3 to 6 `useCases`, 3 to 7 FAQs. Nothing is a stub.

---

## One thing worth deciding rather than fixing

**The service tiers and the blog's flagship set disagree, and the services surface is losing by it.**

| service | services tier | has a 3,400-word researched blog post |
|---|---|---|
| ai-chat-assistant | flagship | yes |
| ai-voice-agents | flagship | yes |
| skip-tracing-lead-generation | **flagship** | **no** |
| database-reactivation | core | **yes** |
| workflow-automation | core | **yes** |
| lead-qualification | **more** | **yes** |

Lead qualification is tiered `more`: 591 words, 3 FAQs, 2 paragraphs of `whatItIs`. Behind it sits a
3,653-word post with four primary sources, five FAQs, a calculator and a fair-housing section.
Reactivation and workflow are the same story. **Three services have far more researched, audited
material than their own page uses**, and it is already written and already checked.

That is the cheapest quality available on this surface: not new writing, but moving what exists.
