# Flagship blog scorecard — rubric derived from research, THEN measured

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

## WHAT IT TAKES TO REACH 90-95

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

## Sources
- Google Search Central, "Creating helpful, reliable, people-first content" (primary source for
  A and B; the expertise questions explicitly name author background and links to an author page)
- Ahrefs SEO statistics 2026; SEO benchmarks 2026 (image and video correlation with ranking)
- GEO 2026 guides (Frase, Enrich Labs, LLMrefs, Omnibound): FAQPage as highest-impact schema,
  original data, direct-answer formatting, third-party trust signals
- Infographic and visual link-building guides (Backlinko, editorial.link, The HOTH): original
  charts and diagrams as the asset that earns citations
- Blog design and layout roundups 2026: sticky ToC, progress, skimmable depth, single column
