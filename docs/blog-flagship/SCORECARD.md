# Flagship blog scorecard — rubric derived from research, THEN measured

## 2026-08-03 (session 14): the facts moved. I am not posting a new total.

The chat post changed more in this round than in any since it was built, and two of the named
deductions below are objectively addressed. I am deliberately not printing a new number, because
the two that moved (A2, C1) are judgement rows and this file exists because the owner called a
self-graded score "cheating to pass the score". **Re-measure it, or have somebody who did not build
it read the page.** What follows is what changed, measured on production.

`words: 4418` (was 1889) · `imagesInBody: 3` (was 2) · `externalCitations: 8` (was 5) ·
`h2: 18` · `dateModified: 2026-08-02` · schema unchanged and complete
(RealEstateAgent, BlogPosting, BreadcrumbList, FAQPage, VideoObject) · FAQ entries 3 to 7.

**A2, −1.5, was "silent on cost, setup time and privacy/compliance". All three are now on the
page**: a "What it costs, and how long it takes" section naming the three drivers and the timing,
and "The part nobody selling you a chat widget mentions" covering bot disclosure under Cal. Bus. &
Prof. Code 17941, the page-speed cost of a third-party widget against Google's published Core Web
Vitals thresholds, and the WCAG keyboard-trap criterion. That deduction is answerable now in a way
it was not before.

**C1, −2, was "two body images is thin for a 1,900-word piece; the middle third has none".** The
middle third now has one, a `plate` in Dutchess County placed where the argument turns. But the
piece is 3,355 prose words rather than 1,900, so three body images is still arguably thin, and I
would not claim the full two points back. Somebody should look and decide.

**A1, −3, has NOT moved and cannot be fixed with effort.** Original data of our own is gated on
public traffic: 37 chat sessions in 30 days, most of them the owner's own testing.

### A correction to this file's own plan

Fix #1 in the table at the bottom says: *"Cite the 78% stat. It traces to Dr James Oldroyd's Lead
Response Management Study."* **It does not.** This round went looking for it: the 78% figure is
attributed on hundreds of pages to a survey with no published report, no stated sample and no
methodology, and every citation leads to another article citing a third. What Oldroyd's work
actually supports is the response-time odds the post already charts, which is a different and
smaller claim. The post now says the number cannot be sourced rather than sourcing it, which is the
opposite of what this file planned and the only honest version. **The plan was wrong; leaving it
uncorrected would be worse than the original error.**

## STILL 90.5 / 100 (2026-08-02, session 13: the avatar round)

**Not re-measured, and deliberately so.** This session touched no page and no component — it worked
entirely inside HeyGen on the talking-head avatar and three comparison videos. Nothing the rubric
scores was changed, so re-running the scorer would only reprint the same number with a newer date on
it. The work is in `FLAGSHIP-HANDOFF.md` and `docs/blog-flagship/avatar/`.

## STILL 90.5 / 100 (re-measured 2026-08-01, session 12: the films round)

**The page score did not move, and it should not have.** This session worked on the FILMS, not on
the pages: new topic-specific footage, a sound bed under every re-cut film, and a transition
grammar. The rubric scores what is ON the page, and C3 asks whether a film exists, not whether it
is well cut. All five posts still pass their mechanical gate unchanged - chat, voice, reactivation
and workflow at 19/19, qualification at 18/19 for the D5 reason it has always failed honestly.

Reporting it as a gain would be exactly the self-grading this file exists to prevent. What
improved is measurable, but on the artifact rather than the rubric:

| measured on the FINISHED file | before | after |
|---|---|---|
| lines transcribed intact from the shipped mp4 | never checked | **100% of every line, all 5 films** |
| films with any sound under the narration | 0 of 5 | 3 of 5 (voice and chat still bare) |
| films whose close is `shot6-keys-porch` | 4 of 4 | **1 of 4** |
| picture transitions | hard cuts only | dip/lift/cut grammar, derived from the plan |

**The rubric has no dimension for any of that**, which is a gap worth naming rather than papering
over: a film that is present and captioned scores the same as a film that is well made. If a
future round wants credit for craft here, the honest move is to add a dimension a script can
actually measure - and to accept that "is it tasteful" will never be one of them.


Written 2026-07-27. The rubric below was written **before** measuring the page, from the sources
listed at the bottom, so the page is graded against the reference rather than against itself.
Weights follow how hard each source ties the item to organic traffic, AI citation, or design
quality. Measurement is `scripts/_scratch-score.mjs` run against the live production page.

## The rubric (100 pts)

### A. Substance and originality — 25
Google's own self-assessment questions are the primary source here.
| # | Criterion | Pts |
|---|---|---|
| A1 | Original information, reporting, research or analysis (not rewritten from others) | 10 |
| A2 | Substantial, complete, comprehensive description of the topic | 5 |
| A3 | Insightful analysis beyond the obvious | 5 |
| A4 | No easily-verified factual errors; no unsupported claims | 5 |

### B. Trust and E-E-A-T — 20
| # | Criterion | Pts |
|---|---|---|
| B1 | Author identity: byline linking to an author page / About, with credentials | 8 |
| B2 | Clear sourcing: claims and statistics attributed to a citable source | 7 |
| B3 | Demonstrated first-hand experience with the thing being described | 5 |

### C. Visual and media richness — 25
The category the owner flagged. Sources: pages with at least one image rank higher on average;
pages with video are far likelier to reach page one; original charts, diagrams and infographics
are the visual assets that actually earn links and citations; interactive charts raise
engagement ~30% over static.
| # | Criterion | Pts |
|---|---|---|
| C1 | At least one image, and imagery distributed through the piece (not just a cover) | 8 |
| C2 | Original custom graphics, diagrams or data charts (the link-earning asset) | 9 |
| C3 | Video or animated explainer | 8 |

### D. Structure for search and AI/GEO — 20
| # | Criterion | Pts |
|---|---|---|
| D1 | FAQPage schema (named the highest-impact structured data for GEO) | 6 |
| D2 | BlogPosting + BreadcrumbList schema, valid | 4 |
| D3 | Direct-answer formatting: a quotable summary an engine can lift | 4 |
| D4 | Internal links into a topic cluster | 3 |
| D5 | Freshness signal (visible updated date + dateModified) | 3 |

### E. Reading experience and design — 10
| # | Criterion | Pts |
|---|---|---|
| E1 | Navigation: ToC, scroll-spy, progress, skimmability | 4 |
| E2 | Typography, whitespace, craft, responsive, accessibility floor | 6 |

## MEASURED RESULT — 48.5 / 100 (2026-07-27)

Measured on the live production page with `scripts/_scratch-score.mjs`. Raw findings first,
because they are blunter than any summary:

- **0 images in the article body.** The only 3 `<img>` on the page are related-post thumbnails
  in "Keep reading". The flagship deliberately dropped the cover photo and never replaced it.
- **0 charts, 0 diagrams, 0 canvas.** The 8 inline `<svg>` are UI icons (menu, share), not
  graphics. The scenes are typography and hairlines, which photograph well but are not diagrams
  and are not embeddable assets another site can credit.
- **0 video, 0 animated explainer.**
- **0 citations.** All 4 external links are share buttons.
- **The 78% statistic has no source**, and it appears three times (In short, the gap scene, the
  prose). It is the load-bearing claim of the whole argument.
- **No author page link, no bio, no credentials.** Byline is a name string.
- **No FAQPage schema**, though "The honest objections" is already question-shaped.
- **dateModified === datePublished (2026-07-12)** despite heavy revision on 07-26 and 07-27,
  and no visible "updated" date.
- Good: BlogPosting + BreadcrumbList valid, 7 internal links into the service cluster, the
  "In short" direct-answer block, floating ToC, 1,596 words, all alt attributes present.

| Cat | Item | Score | Why |
|---|---|---|---|
| A1 | Original info/analysis | 7/10 | Genuinely original first-hand writing, but no original DATA. We run a live assistant with real transcripts and publish none of it. |
| A2 | Comprehensive | 3.5/5 | Focused and complete on its argument; silent on cost, setup, privacy/compliance. |
| A3 | Insight beyond obvious | 4.5/5 | "Being first buys the conversation", the refusal-to-guess teardown, "a lead with a transcript is a different object". |
| A4 | No unsupported claims | 2.5/5 | The 78% is unsourced and repeated 3x. The calculator's model is disclosed, which saves this from zero. |
| B1 | Author identity | 2/8 | Name only. Google's expertise questions explicitly ask for background and a link to an author page or About. |
| B2 | Clear sourcing | 0.5/7 | No citations anywhere. |
| B3 | First-hand experience | 4.5/5 | Strongest signal on the page: "the version we run", and it links to the assistant actually running at /ai#chat. |
| C1 | Imagery | 0/8 | None in the body. |
| C2 | Original graphics/charts | 3/9 | The scenes are original and custom, but they are not data visualisations or diagrams, and not embeddable. |
| C3 | Video / animated explainer | 0/8 | None. |
| D1 | FAQPage schema | 0/6 | Absent. |
| D2 | BlogPosting + Breadcrumb | 4/4 | Valid. |
| D3 | Direct-answer summary | 4/4 | "In short". |
| D4 | Internal cluster links | 3/3 | 7 links into /services and /ai. |
| D5 | Freshness | 0.5/3 | dateModified never updated; no visible updated date. |
| E1 | Navigation | 4/4 | Contrast-adapting ToC, scroll-spy, progress, mobile sheet. |
| E2 | Craft / responsive / a11y | 5.5/6 | Verified type system, focus rings, reduced motion, no overflow, zero errors. |

**A 17.5/25 · B 7/20 · C 3/25 · D 11.5/20 · E 9.5/10 → 48.5/100**

The shape matters more than the number. On **craft and reading experience the page is ~95%**.
On **everything that makes a page earn organic traffic and get cited, it is under 50%**, because
45 of the 100 points live in visual media and trust signals and the page scores 10 of those 45.
The owner's instinct was right: a flagship with no pictures, no graphs and no explainers is not
a flagship, however good the typography is.

## RE-MEASURED — 74 / 100 (2026-07-27, after the first fix round)

Same rubric, same script, nothing moved. Deltas measured on the live page:

| Was | Now | Item |
|---|---|---|
| no FAQ schema | **`FAQPage` emitted** | Needed no new code. The repo already emitted FAQPage for an FAQ-shaped body; renaming "The honest objections" to "Common questions, answered honestly" matched `FAQ_SECTION_RE` and promoting the three objections to `###` let `extractFaqs` pair them. |
| `authorPageLink: false` | **`true`** | Author block with portrait, first-hand claim, links to /who-we-are and the live assistant. |
| 0 real citations | **1, with study, sample and year** | HBR 2011 / Oldroyd, ~1.25M leads, 29 companies, plus an on-screen note that it is cross-industry not real-estate. |
| 0 charts | **1 real SVG data graphic** | Relative odds of qualifying by response speed (60x / 8.6x / 1x), `role="img"` with the numbers also in the DOM. |
| 0 body images | **1** | The author portrait. |

| Cat | Was | Now |
|---|---|---|
| A Substance | 17.5/25 | **19.5/25** (A4 2.5 → 4.5, the load-bearing stat is sourced) |
| B Trust | 7/20 | **18.5/20** (B1 2 → 8, B2 0.5 → 6) |
| C Visual media | 3/25 | **9/25** (C1 0 → 3, C2 3 → 6, C3 still 0) |
| D Search/GEO | 11.5/20 | **17.5/20** (D1 0 → 6) |
| E Experience | 9.5/10 | 9.5/10 |

**48.5 → 74/100.** Trust and GEO structure are now close to maxed. **Visual media is still the
whole gap: 9 of 25.**

## FINAL — 90.5 / 100 (2026-07-27, after the second fix round)

Same rubric, same script, third run. Measured on the live page:

`video: 1` · `imagesInBody: 2` · `inlineSvg: 10` (two of them real data graphics) ·
`hasFaqSchema: true` · `authorPageLink: true` · `visibleUpdated: true` ·
`dateModified: 2026-07-27` (was 2026-07-12) · `words: 1889` · webm serves 200 at 4.2MB.

| Cat | Start | Round 1 | Final |
|---|---|---|---|
| A Substance | 17.5/25 | 19.5/25 | **19.5/25** |
| B Trust | 7/20 | 18.5/20 | **18.5/20** |
| C Visual media | 3/25 | 9/25 | **23/25** |
| D Search/GEO | 11.5/20 | 17.5/20 | **20/20** |
| E Experience | 9.5/10 | 9.5/10 | **9.5/10** |
| | **48.5** | **74** | **90.5** |

C went 3 → 23 on the strength of two real embeddable SVG graphics (the cited response curve and
the system diagram), a 38s silent reel served from our own origin, and photography in the cold
open and the author block. D is maxed.

**What the remaining 9.5 is, honestly:**
- **A1, 7/10 (-3): still no ORIGINAL data.** Deferred by decision, not oversight (see below).
  This is the single biggest remaining item and the only one nobody else could copy.
- **A2, 3.5/5 (-1.5):** silent on cost, setup time and privacy/compliance.
- **C1, 6/8 (-2):** two body images is thin for a 1,900-word piece; the middle third has none.
- **A3/B3/E2 (-1):** rounding on judgement criteria that are already strong.

Note: a transient duplicate `RealEstateAgent` block appeared in one DOM measurement. The served
HTML carries exactly 4 blocks (RealEstateAgent, BlogPosting, BreadcrumbList, FAQPage), so it is
a hydration artifact rather than a crawlable duplicate.

## WHAT IT TOOK TO REACH 90-95

Ordered by points per unit of effort. Total available: +48, landing at ~96.

| # | Fix | Pts | Needs |
|---|---|---|---|
| 1 | **Cite the 78% stat.** It traces to Dr James Oldroyd's Lead Response Management Study (MIT / InsideSales, 1.25M leads, 29 companies), popularised by HBR. Cite it, and note honestly that it is cross-industry lead-response research rather than real-estate-specific. | +6.5 (A4,B2) | nothing |
| 2 | **Author block**: byline linking to an About/author page, with credentials and a line on why this person knows. | +6 (B1) | nothing |
| 3 | **FAQPage schema** over "The honest objections", which is already Q&A shaped. Named the highest-impact schema for AI citation. | +6 (D1) | nothing |
| 4 | **Original charts/diagrams as real, embeddable graphics**: a response-time decay curve, and a labelled system diagram. Must be actual SVG/image assets, not CSS type, so other sites can embed and credit them. | +6 (C2) | nothing |
| 5 | **Photography through the piece**: the cold open wants a real photograph (a lit window at night), and the body wants 2-3 more. | +8 (C1) | asset decision |
| 6 | **Video / animated explainer**: cheapest version is a screen-recorded reel of the scenes plus the live 3D brain. | +8 (C3) | owner go-ahead |
| 7 | **Original data from our own chatbot.** We hold real transcripts in Supabase. An anonymised aggregate ("the questions people actually ask after 10pm, from N real conversations") is the single best link-earning asset available to us and nobody else can publish it. | +3 (A1) + compounds C2 | owner go-ahead on using transcript data |
| 8 | **Freshness**: real dateModified plus a visible "Updated" line. | +2.5 (D5) | nothing |
| 9 | Broaden coverage slightly: cost, setup time, privacy. | +1.5 (A2) | nothing |

Items 1-4, 8 and 9 need no assets and no permission: **+22.5, which alone moves 48.5 to 71.**
Items 5-7 are the ones that need the owner: they are worth **+19** and are the difference
between 71 and 90+.

## REMAINING PLAN FROM 74 TO ~94 (owner decisions taken 2026-07-27)

| # | Fix | Pts | Status |
|---|---|---|---|
| 1 | **Video: screen-recorded scene reel.** Owner chose this over the HeyGen avatar. Record the finished scenes scrolling plus the live 3D brain at /ai as B-roll, 30-60s. No credits, no auth. | +8 | approved, not built |
| 2 | **Photography through the body.** Owner: reuse repo images, generate, or free stock without watermark, whichever is cheapest. `public/images/` already holds lifestyle, hero, counties and listings sets, and `ATTRIBUTIONS.md` is the existing licence ledger to append to. | +5 | approved, not built |
| 3 | **A second original diagram**: the labelled system diagram (visitor, assistant, MLS, text, CRM, booked) as real SVG. Earlier judged duplicative of the teardown as a TEXT list, but as an embeddable GRAPHIC it is the asset other sites credit, which the text list can never be. | +3 | not built |
| 4 | **Freshness**: real `dateModified` plus a visible "Updated" line. `Article` currently carries only `date`, so this needs an optional `updated` field threaded through the type, both producers and the JSON-LD. | +2.5 | not built |
| 5 | Broaden coverage: cost, setup time, privacy. | +1.5 | not built |

74 + 20 = **~94**.

**Original data from our own transcripts is DEFERRED, not skipped.** Measured 2026-07-27 in
Supabase (`wpfmhmnceflfruhssqqb`): **33 distinct chat sessions**, 64 chat_log rows, 128 messages,
3 leads, spanning 2026-06-15 to 2026-07-22 — and most of those are the owner's own testing during
the build. Publishing "based on 33 conversations" on a page whose argument is honesty would cost
credibility rather than build it. Revisit at a few hundred genuine public conversations, at which
point it becomes the single best link-earning asset available, because nobody else can publish it.
For reference, anonymous chats ARE retained: `n8n_chat_histories` keyed by a random `session_id`
(the bot's context memory) and a `chat_logs` row per exchange, with no `leads` row unless contact
details are given.


## THE FILM (2026-07-27, replacing the scroll reel)

The first video scored the C3 points but was, honestly, a screen recording of the page
scrolling. Replaced with a cut of three takes that demonstrates the product:

1. The galaxy flight into the neural brain, live from the AI page (real Three.js, flown by its
   own scroll-driven journey in 130 eased steps).
2. The brain with the "AI chat assistant" node lit, beside the REAL assistant answering a
   question typed on camera.
3. The 11:40pm demonstration, purpose-built: message lands, the reply refuses to invent an
   answer, the machinery fires behind it.

**The blocker, and the fix, for anyone re-cutting this.** The AI page CANNOT be recorded
headless: headless Chromium has no real GPU, the page detects no acceleration and drops into
reduced mode, and the galaxy and brain are never drawn. The first capture was UI text over an
empty void with a visible GPU warning banner. Launch headed against installed Chrome and the
canvas goes 640x360 to 2560x1440 and the scene renders. Playwright recordVideo works headed.

Two more traps: Playwright only finalises a recording on context.close(), so a tool timeout that
kills the process mid-run leaves a truncated unplayable file (record long takes in the
background). And do not test "did WebGL render" by drawing the canvas into a 2D canvas and
measuring pixel variance: without preserveDrawingBuffer that always reads blank and will lie.

Assembly: ffmpeg-static installed with --no-save so package.json is untouched. Shipped mp4 only,
because the VP9 encode came out LARGER than H.264 at matched quality. Stage file for segment 3 is
scripts/_scratch-stage/phone.html; recorders are scripts/_scratch-film-a.mjs and -film-b.mjs.

## RE-MEASURED 2026-07-29 — still 90.5 / 100 (the film gained narration)

Session 6 gave the film a timed voiceover (edge-tts Andrew, seven lines, 33s cut with the CTA held
clean through the URL line) and unmuted the player. Same reasoning as the re-cut before it: C3 was
already satisfied by having a video, so a better video moves QUALITY, not the rubric. A narrated
explainer is closer to what the C3 sources actually measure ("video or animated explainer"), but
nudging my own score for my own work is the self-grading this file exists to prevent. 90.5 stands.
The remaining 9.5 is unchanged: A1 original data (deferred on honest sample-size grounds), A2
cost/setup/privacy coverage, C1 body imagery in the middle third, and judgement rounding.

## RE-MEASURED 2026-07-28 — still 90.5 / 100, and why that is the honest number

This session re-cut the film, fixed a hydration fault, and turned the page into a template. The
measured score did not move, and it should not have:

- **The film re-cut is a QUALITY change, not a rubric change.** C3 was already satisfied by having
  a video at all. Going from a 50s screen-recording-ish cut at 881 kb/s to a 31s cut built from
  lossless frames at 1267 kb/s makes the asset worth uploading. It does not add points.
- **`VideoObject` schema is new**, but the rubric's D1/D2 name FAQPage, BlogPosting and
  BreadcrumbList specifically, and D was already 20/20. Adding a correct block to a maxed category
  scores nothing. It is still worth having.
- **The hydration fix** arguably touches E2 (5.5/6). Nudging my own score by half a point for a bug
  I both found and fixed is exactly the self-grading this file exists to avoid. Left at 5.5.
- **The template work changes the ARCHITECTURE, not the page.** All 12 scenes were framed at 1440
  and 390 DPR3 before and after: worst deviation 0.072%, which is the capture harness's own noise.
  A refactor that changed the score would have been a refactor that changed the design.

The remaining 9.5 is unchanged and still ordered the same way: **A1 (-3) no original data** is the
single biggest item and the only one nobody else could copy; **A2 (-1.5)** silent on cost, setup
and privacy; **C1 (-2)** two body images is thin for a 1,900-word piece and the middle third has
none; **A3/B3/E2 (-1)** rounding on judgement criteria that are already strong.

**What IS now automated.** `scripts/score-flagship.mjs <slug>` checks the mechanical subset of this
rubric and exits non-zero on any failure. The flagship passes 19/19. The untreated workflow post
scores 9/19 and fails, which is both the proof the gate discriminates and the work order for
topic 2. It deliberately refuses to score A1, A2, A3, B3 and the qualitative half of E2, and says
so in its own output: a script cannot judge originality or craft, and one that pretended to would
turn this rubric back into a self-graded number.

## TOPIC 2 — ai voice agents (2026-07-30/31)

`/blog/ai-voice-agent-missed-calls-real-estate`. **19/19 on the mechanical gate**, measured on
the live production page with `node scripts/score-flagship.mjs <slug>`.

**No /100 is recorded here for this post, deliberately.** Roughly 40 of the rubric's 100 points
are judgement (A1 originality, A2 comprehensiveness, A3 insight, B3 first-hand experience, and
the qualitative half of E2), and the agent that wrote the post is the last thing that should be
scoring those. This file exists because a previous session graded its own homework and the
owner called it. The mechanical number is objective and is what gets recorded; a human reads
for the rest.

What is measurable, against topic 1 at the same checkpoint:

| | topic 1 (chat) | topic 2 (voice) |
|---|---|---|
| external citations | 1 | **5** |
| body images | 2 | 3 |
| `role="img"` graphics | 2 | 2 |
| film | 39s | 45s, its own |
| scene anchors | 9 | **11** |
| words | 1,889 | 3,489 (incl. scene copy) |
| bespoke components added | 5 | **0** |

Every one of the five citations was checked for a 200 before shipping: HBR/Oldroyd (the 2,241
company response audit AND the 1.25M lead study), the FCC's Feb 2024 declaratory ruling that AI
voices are "artificial" under the TCPA, NY Penal Law 250.00, Cal. Penal Code 632, and California
AB 2905. Topic 1 leaned on one citation; the difference is not diligence, it is that the legal
section is this piece's actual contribution and it could not be written without them.

**Where this post is honestly weaker than its gate score suggests:**
- **Still no original data.** Same A1 gap as topic 1, same reason: our own call volume is not
  publishable in a way that would build rather than cost credibility. This remains the single
  biggest item nobody else could copy.
- **Cost and setup time are still not covered.** The post covers the limits and the law well and
  says nothing about what any of it costs, which is the first question a reader actually has.
- **The middle third has one photograph.** Better than topic 1's zero, not yet good.

## TOPICS 3 AND 4 — database reactivation, lead qualification (2026-07-31)

`/blog/database-reactivation-old-real-estate-leads` — **19/19**.
`/blog/ai-lead-qualification-real-estate-scoring` — **18/19**.

**No /100 is recorded for either, deliberately, for the same reason as topic 2.** Roughly 40 of
the rubric's 100 points are judgement, and the agent that wrote the post is the last thing that
should score those.

| | topic 1 chat | topic 2 voice | topic 3 reactivation | topic 4 qualification |
|---|---|---|---|---|
| external citations | 1 | 5 | 4 | 3 |
| body images | 2 | 3 | 3 | 3 |
| `role="img"` graphics | 2 | 2 | 2 | 2 |
| film | 39s | 45s | **49s, real footage** | **53s, real footage** |
| scene anchors | 9 | 11 | 11 | 12 |
| words (incl. scene copy) | 1,889 | 3,489 | 3,887 | 3,510 |
| bespoke components added | 5 | 0 | **0** | **0** |

**Why topic 4 is 18/19, and why that is the honest number.** D5 asks for a `dateModified` later
than `datePublished`. A post written, built and shipped inside one day has not been revised, so
the only way to turn that check green is to write a date that is not true. On a page whose own
argument is that the inputs have to be honest, and in a file that exists because a previous
session graded its own homework, that trade is not available. `updated` is unset with a comment
saying why. It becomes true the first time the article is genuinely revised.

That makes D5 the first criterion in this rubric that a brand-new page **cannot** satisfy without
fiction. Worth fixing in the gate rather than in the content.

**Every citation on both pages was read in the source before it shipped**, not taken from a
summary: 47 CFR 64.1200 (a)(2), (a)(10) and (f)(5); 47 U.S.C. 227(b)(3); 42 U.S.C. 3604(c) and
(d); NAR Code of Ethics Article 10; NAR 2025 Generational Trends Exhibits 7-1 and 6-23; and
Twilio's published opt-out threshold. All returned 200 with the operative text present when
re-checked after deploy.

**Where these two are honestly weaker than their gate scores suggest:**
- **Still no original data**, four topics running. Same reason: our own volume is not publishable
  in a way that would build rather than cost credibility. This remains the one thing on the list
  nobody else could copy.
- **Cost is covered on topic 3 and dodged on topic 4.** Topic 3 refuses to invent a price and
  instead quantifies what getting it wrong costs, which is the honest version. Topic 4 says
  nothing about cost at all.
- **The reactivation plate is a weak photograph.** The Poughkeepsie bridge shot is a flat grey
  winter frame. It stays because the caption is doing real work that no prettier picture could,
  but it is the least beautiful image across the four pieces.

## TOPIC 5 — workflow automation (2026-08-01)

`/blog/workflow-automation-real-estate-business` — **19/19**, measured on the live production page
with `node scripts/score-flagship.mjs <slug>`.

**No /100 is recorded, deliberately, for the same reason as topics 2, 3 and 4.** Roughly 40 of
this rubric's 100 points are judgement, and the agent that wrote the post is the last thing that
should be scoring those.

| | t1 chat | t2 voice | t3 reactivation | t4 qualification | t5 workflow |
|---|---|---|---|---|---|
| external citations | 1 | 5 | 4 | 3 | 4 |
| body images | 2 | 3 | 3 | 3 | **4** |
| `role="img"` graphics | 2 | 2 | 2 | 2 | 2 |
| film | 39s | 60s | 49s | 53s | **59s, real footage** |
| scene anchors | 9 | 11 | 11 | 12 | 12 |
| words (incl. scene copy) | 1,889 | 3,489 | 3,887 | 3,510 | **3,832** |
| bespoke components added | 5 | 0 | 0 | 0 | **0** |

**This is the first topic to close the A2 gap this file has flagged on all four earlier posts.**
Every previous flagship was silent, or nearly silent, on what any of it costs and how long it
takes. This one has a section for each, and it refuses to print a price rather than inventing one:
it names the three things the price actually depends on, says what determines the timeline, and
names the recurring cost everybody forgets, which is who owns the chain when it breaks. It also
has a "what it does not do" section, which topic 1 had and topics 3 and 4 only partly did.

**Where this post is honestly weaker than its 19/19 suggests:**
- **Still no original data**, five topics running. Same reason as every previous topic: our own
  run volume is not publishable in a way that would build rather than cost credibility. This
  remains the one item on the list nobody else could copy, and it is now the ONLY substantial gap
  left in this rubric that has never moved.
- **The evidence is borrowed from another field.** The cited study measured software developers
  and analysts at a technology company in 2004, not estate agents, and the page says so twice, on
  screen in the chart's caveat and again in the prose. That is the honest handling, and it is
  still a weaker foundation than a real-estate-specific measurement would be. None exists that
  survived checking.
- **The second photograph is a heavily processed HDR sunset.** It is the strongest image left in
  `public/images/` that no other flagship had used as a plate, and its caption does real work, but
  it is a stock-feeling frame on a page whose other picture is genuinely on-topic.

**Every citation was read in the source before it shipped**, and re-checked live afterwards: the
three HTML sources were fetched in a real browser and asserted to still contain the operative
phrase, and the PDF was re-downloaded and its text re-extracted to confirm all six figures used on
the page are present, and that the two figures the internet attributes to it are not.

## Sources
- Google Search Central, "Creating helpful, reliable, people-first content" (primary source for
  A and B; the expertise questions explicitly name author background and links to an author page)
- Ahrefs SEO statistics 2026; SEO benchmarks 2026 (image and video correlation with ranking)
- GEO 2026 guides (Frase, Enrich Labs, LLMrefs, Omnibound): FAQPage as highest-impact schema,
  original data, direct-answer formatting, third-party trust signals
- Infographic and visual link-building guides (Backlinko, editorial.link, The HOTH): original
  charts and diagrams as the asset that earns citations
- Blog design and layout roundups 2026: sticky ToC, progress, skimmable depth, single column
