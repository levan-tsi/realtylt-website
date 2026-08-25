# ROUND C — the two topics that are each other's nearest sibling, argued as different products

**Built 2026-08-25.** Scope: `local-seo` and `geo-landing-pages` written to the flagship standard,
their service pages synced, and the unsourced claims the research killed on the way. Four commits
on `main`, **not pushed**: the orchestrator verifies and pushes.

```
d3fda51  C1  topics 8 and 9, local SEO and area pages, written as two different products
aab9f2b  C2  the two service pages synced, and six claims that did not survive the research
050b022  C3  seven defects found by looking at the rendered pages, not by a gate
f9ee07e  C4  the second pass, and nine things it caught in my own copy
```

**Two posts, ZERO new components.** Nine topics on the template now and eight in a row that add
none. The bespoke-component hatch was not opened and did not need the calculator-lesson test.

---

## C0 — the ratchet was NOT run, and that is a decision rather than an omission

`--measure` first, before any content was written:

```
STANDARD  (the recorded bar)
required                        3587            19             4             5             6             2  ...  2
available                       3675            21             4             6             6             2   <- --ratchet
```

Ratcheting would have raised `proseWords` to 3,675, `sections` to 21 and `faqQuestions` to 6,
which puts **five of the seven shipped posts below the bar by construction**: ai-chat (3,597 words,
19 sections), ai-voice (3,587, 5 FAQ), database-reactivation (19 sections, 5 FAQ), ai-lead (5 FAQ)
and workflow (3,667, 19 sections). Closing that honestly means writing a new section into five
articles that are not this round's topics.

The repo's discipline is "ratchet at the START of a round". It is written for the round that owns
the whole cohort; **Round B ratcheted this cycle already** and the brief for this round states the
bar as a given rather than asking for it to move. So the bar was measured, reported and left where
it is, and the two new posts were built well clear of it (5,847 and 5,783 prose words, 21 sections,
8 FAQ entries each) so the next ratchet is not made harder by them.

**Recommendation for the orchestrator:** the next ratchet is a five-post writing job, not a flag.
It is worth doing deliberately in a round that has room for it.

---

## The one risk this round was set up to fail, and how the seam was drawn

Local SEO and area pages are the closest pair of topics in the whole rollout, and the brief was
explicit that they had to be argued as different products or the reader would catch two posts
wearing each other's clothes. The seam was decided before a word was written and it is a real one:

| | topic 8, local SEO | topic 9, area pages |
|---|---|---|
| what is being ranked | a **business** | a **page** |
| the surface | the local pack, above the blue links | the ordinary organic long tail |
| the governing document | Google's Business Profile ranking + eligibility guidelines | Google's Search spam policies + helpful-content guidance |
| the hard constraint | **distance**, which is an input you cannot move | **the doorway line**, which is a quality judgement |
| the regulated risk | none specific to it | fair housing advertising and steering, 24 CFR part 100 |
| the held moment | three names on a stranger's phone | two of your own pages, side by side |
| the hero | `3` results | `1` word |
| the calculator's unit | money a year | a count of pages, and hours |
| what the calculator refuses | any uplift from a better ranking | any traffic or ranking estimate at all |
| the charts | both **dark** | both **light** |

Topic 8 ends by handing the out-of-area question to topic 9 in one FAQ, and topic 9 opens by
handing the profile question back. Neither summarises the other.

**Measured: sibling overlap 0 for both, and 0 across all nine posts.** It was 3 on the first run
and the five shared phrases were all mine (three between the two new posts, one with ai-voice, one
with workflow, one with review). `scripts/_scratch-overlap.mjs --phrases` printed them; they were
fixed in the sentences, not in the metric.

---

## C1 — the sources, each read in the primary document, none of them previously spent

### Topic 8: `/blog/local-seo-real-estate-map-pack-google-business-profile`

*"Three Businesses Show Up. Yours Is Not One of Them."* Thirteen scenes, zero components, no film.

| source | what was read | where |
|---|---|---|
| **Google, "Tips to improve your local ranking on Google"** | Read as a vendor primary the way Zapier's help pages were. The operative sentences, quoted: *"There's no way to request or pay for a better local ranking on Google."* · *"We do our best to keep the search algorithm details confidential to make the ranking system as fair as possible for everyone."* · *"Local results are mainly based on relevance, distance, and popularity."* · *"Distance refers to how far each business is from the customer who's searching. If a customer doesn't share where they are, Google uses what it knows about their location."* · *"Prominence means how well-known a business is... This factor's also based on info like how many websites link to your business and how many reviews you have."* **The summary sentence says popularity and the subheading under it says Prominence**, which is on the page because a document this heavily quoted deserves to be read rather than paraphrased. | support.google.com/business/answer/7091 |
| **Google, "Guidelines for representing your business on Google"** | The eligibility rules, and they name this industry out loud: *"Doctors, dentists, lawyers, financial planners, and insurance or real estate agents are all individual practitioners."* · *"Sales associates or lead generation agents for corporations aren't individual practitioners and aren't eligible for a Business Profile."* · *"A practitioner shouldn't have multiple Business Profiles to cover all of their specializations."* · *"The title of the Business Profile for the practitioner should include only the name of the practitioner, and shouldn't include the name of the organization."* · *"If your business rents a physical mailing address but doesn't operate out of that location, also known as a virtual office, that location isn't eligible for a Business Profile."* · *"Businesses can't list an office at a co-working space unless that office maintains clear signage, receives customers at the location during business hours, and is staffed during business hours by your business staff."* · *"The boundaries of your profile's overall service area shouldn't extend farther than about 2 hours of driving time from where your business is based."* | support.google.com/business/answer/3038177 |
| **Joachims, Granka, Pan, Hembrooke and Gay, SIGIR 2005** (Cornell) | 22 participants in Phase II, usable eye-tracking for 16, three conditions, with *"a proxy that intercepted the HTTP request to Google"*, and *"None of the changes were detectable by the subjects... none of the subjects had suspected any manipulation."* Table 3, read cell by cell: in the normal condition, when the first-shown abstract was judged better the click went to it 19 times of 20; when the second-shown was judged better the click still went to the top 5 times of 7; in the swapped condition, 10 of 17. The paper: *"we can reject this hypothesis with high probablility, since 19/20 is significantly different from 2/7"* and *"users have substantial trust in the search engine's ability to estimate the relevance of a page, which influences their clicking behavior."* | cs.cornell.edu PDF, read with `pdftotext` |
| **Blake, Nosko and Tadelis, NBER WP 20171 / Econometrica 2015;83(1):155-174** | eBay halted brand-keyword advertising on two engines in March 2012 and kept buying the same terms on a third as the control. *"Column 1 shows the results which suggest that click volume was 5.6 percent lower in the period after advertising was suspended."* · *"In fact, only 0.529 percent of the click traffic is lost so 99.5 percent is retained."* · *"we calculate Return on Investment (ROI) using typical OLS methods, which result in a ROI of over 4,100% without time and geographic controls, and a ROI of over 1,400% with such controls. We then use our experimental methods that control for endogeneity to find a ROI of -63%, with a 95% confidence interval of [-124%, -3%]."* | nber.org PDF, read with `pdftotext` |

**Cited data graphics:** the trust-bias counts (three bars, axis 100) and the eBay click loss (two
bars, **axis pinned to 10**, see C3). The ROI figures live in the prose because one of them is
negative and a bar chart cannot draw a negative honestly.

**The calculator refuses the ranking uplift.** Chain: calls from the Business Profile a month,
times twelve, times the share that were somebody you could help, times the share that became a
client, times your commission. **The first input is the only one in the cohort that is not a
guess** — the reader reads it off the profile's own performance screen. What it refuses, on
screen: any row at all for what a better position would add, because Google publishes the inputs
without weights, says in the same breath that no position can be requested or paid for, and
nobody outside Google has published a measurement of the local pack that states its sample and
method.

### Topic 9: `/blog/geo-landing-pages-real-estate-doorway-pages`

*"Nine Town Pages. The Only Thing That Changed Was the Town."* Thirteen scenes, zero components,
no film.

| source | what was read | where |
|---|---|---|
| **Google Search spam policies** | Two entries, and the wording has changed since most advice about location pages was written: it is **doorway abuse**, not doorway pages. *"Doorway abuse is when sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination."* with the example *"Having multiple domain names or pages targeted at specific regions or cities that funnel users to one page."* And *"Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users"*, whose **first** example is *"Using generative AI tools or other similar tools to generate many pages without adding value for users."* Neither entry forbids one page per area, and the post says so. | developers.google.com/search/docs/essentials/spam-policies |
| **Google, "Creating Helpful, Reliable, People-First Content"** | The self-assessment. *"Does your content clearly demonstrate first-hand expertise and a depth of knowledge (for example, expertise that comes from having actually used a product or service, or visiting a place)?"* — Google's own example of first-hand expertise is **having visited a place**, which is the whole test for an area page and it is inside a bracket. Plus *"Are you producing lots of content on many different topics in hopes that some of it might perform well in search results?"*, *"Are you using extensive automation to produce content on many topics?"*, *"Is the content mass-produced by or outsourced to a large number of creators...?"* and *"Are you writing to a particular word count because you've heard or read that Google has a preferred word count? (No, we don't.)"* | developers.google.com/search/docs/fundamentals/creating-helpful-content |
| **24 CFR 100.75 and 100.70** | The fair housing treatment, built on the REGULATION rather than on 42 U.S.C. 3604, which the lead-qualification post already rests on. 100.75(b): the prohibitions *"apply to all written or oral notices or statements by a person engaged in the sale or rental of a dwelling"*, and written statements *"include any applications, flyers, brochures, deeds, signs, banners, posters, billboards or any documents used with respect to the sale or rental of a dwelling."* 100.75(c)(3): *"Selecting media or locations for advertising the sale or rental of dwellings which deny particular segments of the housing market information about housing opportunities because of race, color, religion, sex, handicap, familial status, or national origin."* 100.70(c)(1) and (c)(2), the steering examples: discouraging somebody *"because of the race... of persons in a community, neighborhood or development"*, and *"by exaggerating drawbacks or failing to inform any person of desirable features of a dwelling or of a community, neighborhood, or development."* **Failing to inform is the one nobody expects and it is the one that bites a set of area pages**, because uneven effort across the set is invisible from inside any single page. | law.cornell.edu/cfr/text/24/100.75 and /100.70 (**eCFR blocks programmatic access**, as the handoff records; LII carries the same text) |
| **Ntoulas, Najork, Manasse and Fetterly, WWW 2006, pp. 83-92** | A 105 million page crawl; *"We drew a uniform random sample, henceforth named DS, of 17,168 pages out of the English-written portion... In DS, 2,364 pages (13.8%) were labeled as spam."* And section 4.6: *"We measure the redundancy of web pages by the compression ratio... in aggregate, 70% of all sampled pages with a compression ratio of at least 4.0 were judged to be spam."* Ntoulas was at **UCLA**; the other three at Microsoft Research. Section 4 tests **ten** content heuristics, 4.1 to 4.10. | WWW2006 proceedings PDF, read with `pdftotext` |
| **National Fair Housing Alliance, 2025 Fair Housing Trends Report** (2024 data) | *"There were 32,321 fair housing complaints received by FHOs, HUD, FHAP agencies, and the DOJ in 2024... Eighty-two (82) private, non-profit fair housing organizations (FHOs) processed 74.12 percent of complaints."* By transaction: rental 27,007 (83.56%), harassment 815, sales 659, HOA/condo 203, **advertising 108**, appraisal 39. The report's own sentence: *"Other housing-related transactions included 108 complaints of discriminatory advertising by housing providers."* | nationalfairhousing.org PDF |

**Cited data graphics:** the compressibility finding (two bars, axis 100) and the complaint counts
(five bars, rental deliberately excluded and the exclusion in the chart title, see C3).

**The calculator refuses everything about traffic.** Chain: areas you would want a page for, times
the share where you have actually done the work, times the hours it takes to write one properly.
**The headline is the middle row**, the count of pages you can honestly write, because that is the
number that decides whether the project is an asset or a folder of filler, and it is almost always
smaller than the one in the first meeting. Three steps, the shortest chain in the cohort, for a
stated reason: there are only three numbers in this subject that anybody can honestly supply and
all three are the reader's. Nobody publishes search volume for a service in a particular town with
a stated method, Google publishes no per-page traffic model, and the figures circulating in this
category come from tools that estimate them and do not show their working.

### Sources deliberately NOT used

- **Census Bureau town-level data**, which would have made a good "these eight towns are not eight
  versions of the same town" chart. `api.census.gov` now returns a `Missing Key` HTML page for an
  unauthenticated request, and signing this project up for an API key to get one chart was not
  worth doing without asking. **Reported rather than worked around.**
- **Vendor pricing of any local SEO or page-building tool.** Same reason as topics 3 and 5: the
  numbers render in JavaScript and cannot be read from the source, so both posts refuse to print
  one and say what drives the cost instead.
- **Any local-pack click-through study.** There are several in circulation. Every one traced back
  to a vendor's own click data with no published sample or method, which is the zombie-stat shape
  this repo has been caught by twice. Both posts say out loud that the figure does not exist.

---

## C2 — the service pages, and ten claims that did not survive the research

Both pages now lead with their own flagship and carry each other's second. The chat post came off
both: it was a stand-in while these topics had no post, and its own file said so.

| file | was | now |
|---|---|---|
| `local-seo.figure.nodes[1]` | "The citations: your name, address and phone identical everywhere they appear", presented as a thing that moves the map pack | "The links: other people's websites mentioning yours, which Google's page names under prominence" |
| `local-seo.figure.nodes[2]` | reviews "recent and frequent, which is the signal that compounds fastest" | the other thing that page names, and the one that only arrives if somebody asks |
| `local-seo.howItWorks[1]` | "Inconsistency is a ranking drag that nobody sees until it is fixed" | the two inputs the document actually names |
| `local-seo.faqs[0]` | "Three things move the map pack more than anything else", with directory consistency as one of the three | the published model, with the weights it does not give, and directory consistency named as worth keeping right but **not** on that page |
| `local-seo.why` | "the agent they call is usually the one they find first" | what the page can show. **This is /ai COPY drift** |
| `local-seo.figure.footnote` | the same claim one field lower, which is the Round B pattern exactly | Google's own "no way to request or pay" |
| `local-seo.useCases[0]` | "worth more than any single ad you will run this year" | gone, unsourced comparative |
| `local-seo.useCases[1]` | "A page for each one ranks for each one" | a promise the post it now links to explicitly refuses to make |
| `local-seo.howItWorks[0]` | "most profiles are about two thirds filled in" | gone (caught in the C4 pass, see below) |
| `geo.figure.footnote` | "Twenty thin pages are a doorway page and Google treats them as one" | a mechanism claim we cannot source, replaced by what the policy names |
| `geo.howItWorks[1]` | "Being quotable is the new being ranked" | gone |
| `geo.useCases[1]` | "the citation is the new click" | gone |
| `geo.faqs[1]` | "Google explicitly treats those as doorway pages" | the current wording, which is doorway ABUSE, and what the entry actually describes |

**The critique's identical-tagline finding was checked and is already fixed.** Both pages carry
`eyebrow` "... · Get found nearby", which is the last trace of it; the `title` and `lede` are now
distinct and both were left alone because they are seeded verbatim from the `/ai` COPY object.
**Flagged for the owner rather than changed.**

Both pages gained a sourced `stat` (Google's three inputs; the 70% compressibility finding), geo
gained a fifth limit and a **fair housing FAQ** built on 24 CFR 100.75 and 100.70, and local gained
a fourth FAQ that hands the out-of-area question to the area pages post instead of over-promising.

---

## C3 — seven defects found by LOOKING, that no gate could see

**Two of them are photographs described wrongly**, and both alt texts were written from the whole
image rather than from the 21:9 crop the plate actually shows. This is the third round in a row
that has found this class and the second in a row where it was the crop rather than the catalogue
title:

- the local plate called `house-02.jpg` ended *"with two terracotta pots of red geraniums either
  side of the step"*. Both pots and the step are below the crop line.
- the geo plate called `house-04.jpg` had the house *"standing on a mown green lawn"* with a
  utility pole at the left edge. The crop ends at the porch rail; there is no lawn on the page.

**An invented number in my own caption.** The geo plate's caption said *"the twenty-one pages you
should not publish"*. Twenty-one appears nowhere in an article whose opening is about nine towns.

**A third candidate photograph was rejected by looking at it.** `house-03.jpg` is a cedar Cape with
a for-sale sign in the yard and is the single most on-topic image in the licensed set for a local
search article. The sign carries a competitor brokerage's trademark, a named agent and a real phone
number. Not used.

**The eBay chart drew a 5.6% LOSS as a full-width bar**, because with no axis a chart scales to its
own largest value. That is the defect the Round B log records against the Luca chart. The axis is
pinned to 10 with the choice disclosed in the basis line, the way the voice post declares its
one-second axis.

**The complaints chart put "rental left off" only in the basis line**, so a reader taking the title
away took an 815 bar filling its track with it. Rental is 27,007 of the 32,321. The omission is in
the chart title now.

**The geo calculator's default read "5.6 pages"**, and six tenths of a page is not a thing. Default
areas 15 rather than 14, and the note says what a fractional answer means, because dragging still
produces one.

**The local calculator opened on $66,528** before the reader had touched anything, built from 14
calls a month at an 8% close rate, on a page whose argument is that nobody can promise a ranking.
**A default is a claim.** It opens at $24,300 now and the close-rate slider stops at 25% rather
than 40%.

### Bar labels are small type, and length is the author's problem

Shot beside the shipped booking chart at 390: SVG label text renders at roughly two thirds the size
of body copy whatever it says, because it is drawn at a fixed size in user units. The longest label
on any shipped chart is 42 characters. The first draft of the trust-bias chart had one at 86, which
renders as a full-width line of small type. All four charts were shortened to the shipped range.

### The dark charts, which are a deliberate difference between the two posts

`StatBars` has supported `band: "dark"` since it was written and nothing had ever used it. Topic 8's
two charts are dark and topic 9's two are light, decided as a pair so that the two nearest siblings
in the cohort do not share a rhythm either. Rendered and read at 1440 and 390 before it was kept.

### Band rhythm, measured

`scripts/_scratch-lookb.mjs` (gitignored; recreate from its docstring):

| post | article height | longest single-tone run |
|---|---|---|
| local-seo | 27,938px | **4,167px (15%)** |
| geo-landing-pages | 27,368px | **3,998px (15%)** |

Against 17% and 16% on Round B's two, and 24% on the worst shipped post before that round. No two
adjacent bands share a background except the opening (hero photo, then the cold open) and one
white-then-mist pair, which are different tones.

---

## C4 — the second pass, against STANDARD.md, and nine things it caught in my own copy

**Six invented numbers, all mine, all in the first draft:**

- *"about eleven times a year"* in the local pull quote, and *"eleven times a week"* in the same
  post's closing paragraph. The same made-up figure, disagreeing with itself two screens apart.
- *"Somebody stands here for four seconds"* on a plate caption. Same shape as the *"about fifteen
  seconds"* Round B killed.
- *"most profiles in this industry are about two thirds filled in"*, asserted on the blog scene AND
  on the service page.
- *"Every thin area page in this industry is six hundred words long"*.
- *"Two or three of them will need half an hour a year"*, a maintenance figure with nothing under it.

**Three facts that were not in the primary document, found by going back to it:**

- *"In 2004 a group at Cornell..."* The Joachims paper states SIGIR'05, August 2005 and **never says
  when the study was run**. The year was my inference from the publication date. Gone.
- *"four researchers at Microsoft"*. Ntoulas's affiliation on the paper is UCLA Computer Science.
- *"one signal among nine"*. Section 4 of that paper runs 4.1 to 4.10.

**Three scene copies that ECHOED the body rather than replacing it.** The committed test only
covers `statement` scenes, because that is where the failure was found in session 14. The geo
policy grid quoted both spam-policy definitions and both example lists word for word, directly
under the prose section that quotes them, so a reader met the same two sentences twice inside one
screen. The grid is now the four questions those two entries put to a buyer, its fourth card is the
paragraph that has been **deleted** from the body, and the word-count card says something the body
does not.

`scripts/_scratch-echo.mjs` is the probe that found them (gitignored by convention; recreate from
its docstring). It reads every string literal in a scene file against the topic's markdown, not
only the held statements. **It is worth promoting to a committed test** and that is a
recommendation rather than a thing this round did.

**A guard that had already rotted, fixed.** `lib/blog/zombie-claims.test.ts` listed six
`content/blog` scene files by hand, and Round B added two that were never added to the list, so
`review-scenes.ts` and `booking-scenes.ts` were outside the retracted-claims guard entirely. It
reads the directory now, with an assertion on the count, which is the same fix the file's own
comment already prescribes for `content/services`.

---

## Verification

All gates FOREGROUND, on the disk as committed, against a single `:3100` dev server. The Vercel
build is authoritative and this builder cannot push.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1188 passed (1188)
   Duration  12.31s

$ node scripts/flagship-standard.mjs http://localhost:3100
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
required                        3587            19             4             5             6             2  ...   2

all 9 posts meet the standard.

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

192 text node(s) checked, 0 cropped.
```

The seven shipped posts were re-proven green by the SVG guard in the same run before it was trusted
about the two new ones.

Test baseline: **93 files / 1163 tests** after Round B, **93 / 1188** after this round. Up, never
sideways. The 25 new tests are the two topics joining the table-driven content contract (nine
checks each), two frozen rails, and the five `content/blog` scene files the zombie-claims guard had
never been reading.

### score-flagship: 17/19 for BOTH new posts, and both reds are true

```
$ node scripts/score-flagship.mjs local-seo-real-estate-map-pack-google-business-profile http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.

$ node scripts/score-flagship.mjs geo-landing-pages-real-estate-doorway-pages http://localhost:3100
FAIL  C3     a film or animated explainer                   0 video
FAIL  D5     a real freshness signal   visible=false published=2026-08-25 modified=2026-08-25
17/19 mechanical checks pass.
```

Same two honest reds as Round B, for the same two reasons. Films are owner-held. `updated` is
deliberately absent with a comment in `content/blog/posts.ts` saying so, because a post written and
shipped inside one day has not been revised. **Nothing was faked and no baseline was moved.**

### Rendered and read, at 1440 and 390 DPR3

Every scene of both posts, both service pages and the blog index, with every `.reveal` asserted at
opacity 1 before the shutter. Shots in `docs/blog-flagship/r-c/`.

```
no horizontal overflow, docW == winW at 320, 390 AND 1440:
  /blog/local-seo-real-estate-map-pack-google-business-profile
  /blog/geo-landing-pages-real-estate-doorway-pages
  /services/local-seo          /services/geo-landing-pages          /blog
0 page errors on every one of them.
```

Both calculators driven at both widths with `scripts/_scratch-calc.mjs`, controls read back out of
the DOM, every range driven to its maximum: `overflowX=0` on all four runs.

Every external link was fetched and returned 200 before it shipped, including the four PDFs.

Probe rails held: `**/api/lead` and `**/api/media/**` aborted in every browser run. No MLS or
DATA-API call on any page or probe path. No film, avatar or HeyGen work. Nothing touched in
`next.config.ts`, the CSP, security controls or `lib/idx`.

### The dev server was restarted once, and that is worth recording

Three page loads in a row failed with `Invariant: Expected clientReferenceManifest to be defined`
and `Unexpected end of JSON input`, which is the corrupt-cache signature `CLAUDE.md` names. The
documented repair was applied: kill, `rm -rf .next/cache node_modules/.cache`, start **exactly
one** server on 3100. Still one server, and the errors stopped.

**A separate class of "transient server error" turned out to be my own probe.** Running
`_scratch-look.mjs /services/local-seo` from git-bash has MSYS rewrite the leading-slash argument
into `C:/Program Files/Git/services/local-seo`, so the probe requested
`/blog/C:/Program%20Files/Git/services/geo-landing-pages`, got a 500, and photographed a 404 page
without complaining. `MSYS_NO_PATHCONV=1` is the fix and it belongs in the docstring of every
scratch probe that takes a path-shaped argument.

---

## Deliberately NOT done, and why

1. **The ratchet.** See C0. Measured, reported, left where it is, with a recommendation.
2. **Films.** Owner-held, out of scope by instruction. C3 stays honestly red on both.
3. **`_scratch-echo.mjs` promoted to a committed test.** It found three real defects in one run and
   covers a rule the committed test only half covers. Making it a test means deciding what to do
   about the URL and heading-id false positives it currently prints, which is a small piece of
   design rather than a side effect of this round. **Recommend it.**
4. **`stat.source` made REQUIRED.** Still the right call and still a dedicated pass: four of twenty
   pages now carry one.
5. **The `/ai` COPY drift.** `local-seo.why` no longer matches the COPY object in
   `~/realtylt-ai-page`, and neither did two of Round B's rewrites. The journey and the services
   surface now disagree in several places rather than one.

## Defects found and NOT fixed

- **Both service pages still share the eyebrow suffix "· Get found nearby".** It is the last trace
  of the identical tagline `SERVICES-CRITIQUE.md` recorded, and `eyebrow` is seeded verbatim from
  the `/ai` COPY object. Flagged rather than changed, because changing it means changing the
  journey.
- **`content/services/geo-landing-pages.ts` `lede` and `figure.trigger` use curly quotation
  marks.** Pre-existing, the same defect Round B flagged on the booking page, house rules do not
  mention them, left alone.
- **`/images/counties/rockland.jpg` is a visibly low-resolution, upscaled photograph** and it is
  the area-pages cold open background. It survives because the hero masks and darkens it heavily,
  and because it is the only remaining licensed landscape not already carrying a flagship. It
  would not survive being used as a plate.
- **The complaints chart's largest bar fills its track**, which is the geometry Round B argued
  about on the Luca chart. Judged differently here because these are counts rather than a ratio,
  and mitigated by naming the exclusion in the chart title. Worth an argument if somebody
  disagrees; it is on the writing, not on the metric.

## Unknown product facts, for the owner, not writable

1. **Does RealtyLT actually manage the Google Business Profile, or advise on it?** The local SEO
   page describes profile work as something we do. The post now tells readers that only the profile
   owner can make several of these changes and that a practitioner profile belongs to the
   practitioner. Whether the engagement is "we do it" or "we do it with you" is a fact about the
   business that neither surface states.
2. **Do the area pages ship with a human editing step by default, or on request?** The post's whole
   argument is that the difference between a real page and a scaled-content case is a person who
   knows the place reading it before it goes live, and the service page now says a person reads it.
   If that is an option rather than the default, the page is over-claiming and should be corrected
   before launch.
3. Round A's and Round B's remain open: whether the voice agent records audio, whether review
   automation as built sends the Google link to everybody, what the website review widget's
   selection rule is, whether the booking layer sends a real calendar invitation, and what calendar
   access it requests.
