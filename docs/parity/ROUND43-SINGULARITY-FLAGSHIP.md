# Round 43 — the Singularity flagship, topic 21 (2026-08-27)

One builder, one session. The twenty-first flagship post, which round 42's log closed by naming as
the one thing deliberately left undone: *"The Singularity BLOG POST is still unwritten."* This is
that post, plus the photography, the guards and the counts it needed.

Slug `the-singularity-self-improving-ai-system`, cluster `building`, `placeholder: false`, top of
`POSTS` per the newest-first law.

---

## 1. The argument, and why it needed literature nobody in the cohort had used

The nearest sibling is the agent workforce post, which already spends two cited charts on MAST
(arXiv:2503.13657) and tau-bench (arXiv:2406.12045). Re-running either would have made topic 21
read as a second draft of topic 11, which is exactly what `siblingOverlap` exists to catch.

So the post asks a different question. Not whether several agents can work together, but whether
anything can improve **itself**, and what has to be standing outside it before the word means
anything. That question has a real literature and it is not flattering to the category.

| what the post claims | primary, read where | the number |
|---|---|---|
| Self review with no outside signal makes reasoning **worse** | Huang, Chen, Mishra, Zheng, Yu, Song, Zhou (Google DeepMind + UIUC), *Large Language Models Cannot Self-Correct Reasoning Yet*, ICLR 2024, arXiv:2310.01798v2. arXiv PDF, `pdftotext -layout` | Table 3, GPT-4 on GSM8K: 95.5 at one call, 91.5 after one round of self review, 89.0 after two. Same table, GPT-3.5 on CommonSenseQA: 75.8 to 38.1 after one round |
| An outside signal reverses it | same paper, Table 2 (oracle labels) | GPT-4 GSM8K 95.5 to 97.5; GPT-3.5 GSM8K 75.9 to 84.3 and CommonSenseQA 75.8 to 89.7 |
| Reflection works when something can run the answer | Shinn, Cassano, Berman, Gopinath, Narasimhan, Yao (Northeastern, MIT, Princeton), *Reflexion*, arXiv:2303.11366v4 | Table 1, HumanEval (PY): 91.0 Reflexion against 80.1 for GPT-4, the paper's own stated SOTA |
| One change at a time, not twenty | Sculley and nine co-authors (Google), *Hidden Technical Debt in Machine Learning Systems*, NeurIPS 2015 | quoted: "the CACE principle: Changing Anything Changes Everything", and the configuration-debt section's "the number of lines of configuration can far exceed the number of lines of the traditional code" |
| Most proposed changes fail their own test | Kohavi, Crook, Longbotham (Microsoft Experimentation Platform), *Online Experimentation at Microsoft*, 3rd Workshop on Data Mining Case Studies, 2009 | quoted verbatim from section 5, *Most Ideas Fail to Show Value*: "Evaluating well-designed and executed experiments that were designed to improve a key metric, only about one-third were successful at improving the key metric!" |
| The offline replay is an estimate and disagrees with live results | Gilotte, Calauzenes, Nedelec, Abraham, Dolle (Criteo Research), *Offline A/B testing for Recommender Systems*, WSDM 2018, arXiv:1801.07030v1 | Table 3 false-negative rate across 39 real online A/B tests: 0.64, 0.33, 0.28, 0.16; precision of the best estimator 0.56 |

All five URLs answered 200 before they shipped. Every number above was read in the primary in this
session, not carried from memory.

### The number that was wrong, and how it was caught

The draft said *"the older model went from 75.9 percent to 95.5 on the same grade school set"*.
That is wrong. 95.5 is GPT-**4**'s standard-prompting score, not GPT-3.5's oracle score. The
correct figure is **84.3**.

It was caught by cross-checking one table against another rather than by reading more carefully.
`pdftotext` renders both of the paper's tables with the row labels floated into a block above the
data rows, so the label-to-row mapping is not visually recoverable from the text dump. What IS
recoverable: Table 2 and Table 3 must print the SAME standard-prompting baselines. Table 3's
1-call rows are 75.9/75.8/26.0 (GPT-3.5) and 95.5/82.0/49.0 (GPT-4). Table 2's first and third
data rows are exactly those. That pins all four rows, and the second and fourth are therefore the
oracle rows: 84.3 and 97.5.

The same technique confirmed the Criteo table, whose columns pdftotext also floats: the paper's
own prose says "the FNR goes from 0.64 (CIS) to 0.33 (NCIS)" and separately that CIS is the
estimator whose correlation "seems to be negative", which matches the -0.15 on that row. Two
independent sentences, one mapping.

**The rule this is worth writing down as:** when a PDF-to-text dump floats a table's row labels,
do not read the mapping off the layout. Find a second table that must agree with it on some cells
and pin the mapping with those.

### Which cell the chart uses, and why not the worse one

The chart draws GPT-4 on GSM8K, where self review cost 6.5 points. The same table has GPT-3.5 on
CommonSenseQA falling from 75.8 to 38.1, which is a far more dramatic picture and would have been
cherry picking: the older model on the benchmark where the failure mode is strongest. The strongest
model on the flagship reasoning benchmark is the conservative reading. The collapse is named in the
chart's own note and in the body, where it belongs, as the mechanism rather than as the headline.

The four bars come from **two tables**, which is the hazard the agent workforce post recorded when
it kept all four tau-bench bars inside one table. It is safe here for a checkable reason rather
than an asserted one: both tables print 95.5 for this cell, so the fourth bar is measured from the
identical baseline. The basis line says so on screen.

---

## 2. Claims deliberately NOT made

Carried forward from `content/services/the-singularity.ts`, whose header records the same three
divergences from `COPY.singularity` on the /ai page:

- **"it improves faster than you can shop for a replacement"** (the panel's closer). A comparative
  rate claim against every other product a business owns, with no measurement of this system or of
  any of them.
- **"remembers everything"** (a panel `specs` chip). An absolute the product's own limits
  contradict. The post replaces it with the literal version: a record persists and a set of written
  instructions persists, and nothing it was not connected to is in there at all.
- **"gets better with every deal"** (a panel `specs` chip). A rate nobody measured, and the post's
  own Kohavi citation says the opposite is the normal week.

Three more the post refused on its own account:

- **No money on the calculator.** Turning an unread transcript into a lost commission needs a rate
  for how often a poor answer costs a deal. Nobody publishes one for this trade, so the arithmetic
  stops at a COUNT: conversations a year nobody reads. The note says exactly that, and says that
  the one judgement in the chain (a "sample" means about one in five) is printed on screen so a
  reader can disagree with it.
- **No improvement rate anywhere.** Not in the body, not in a scene, not in the FAQ.
- **No deletion promise.** The memory scene's closing turn is a statement about the boundary of
  what the system knows, not a promise about erasure. Where the data lives and whether it can be
  deleted is a contract question the post tells the reader to put to any vendor in writing, which
  is what the service page already does.

**Guard: `zombie-claims.test.ts` round K**, four entries. Each was proved red by injecting the
claim into `content/blog/singularity-scenes.ts` and running the suite (exit 1 on all five injected
strings, exit 0 on the restored file). The "remembers everything" pattern is deliberately narrow:
the service page's own lede says the system "remembers every call, every chat and every deal they
touch", which is a BOUNDED claim and true, and the pattern was checked against the whole of
`content/` to confirm it does not match it.

---

## 3. The seven-step diagram that could not be read

The loop scene first shipped with seven hops and captions up to 44 characters. The rendered 1440
screenshot showed the caption row as an unreadable pile of overlapping text.

`Diagram.tsx` lays the SVG out on a 1080-unit viewBox, divides it by `steps.length`, and centres
one **unwrapped** `<text>` per hop. So the character budget per caption is 1080/steps, and at seven
steps that is 154 units against captions needing 230 or more.

Measured across the cohort before choosing a fix rather than guessing at one: **all eighteen other
diagrams use exactly six steps, with captions of 32 characters or fewer.** That is the proven
budget. The "read" hop was folded into "the week", which it was always half of, and the captions
were cut to a maximum of 29. Re-shot at 1440, 390 and 320: clean, no overlap, and at 320 it scrolls
inside its own container behind the "scroll to follow the chain" hint exactly as the primitive
intends.

Three strings had to move with it: the scene heading (seven to six), the lede (which counted
boxes), and one body sentence that said "steps five to seven". A count in prose that describes a
graphic is a thing that rots silently, and this is the second time in this repo a rail label or a
count has needed to move with the thing it describes.

---

## 4. Photography: every editorial image in the library was already spent

`public/images/ATTRIBUTIONS.md` marks all 34 files in `public/images/editorial/` as SPENT except
`mailbox-mist.jpg`, which belongs to the skip-tracing and marketing family and is wrong for this
topic. Every listing, county, hero and lifestyle photograph is used by one of the other thirty
posts. Topic 21 arrived at an empty shelf.

Three photographs were sourced, each with its licence, title and photographer read **on its own
rendered Flickr page in Chromium** (`scripts/_scratch-h-owner.mjs`, matching on the licence URL
rather than the anchor text), not out of a search index:

| file | subject | licence |
|---|---|---|
| `ships-barograph.jpg` | a recording barometer, its drum ruled across the days of the week in three languages | CC0 1.0, Piet Krom |
| `punched-tape.jpg` | two strips of punched paper tape with QUALITY TESTED printed along them | CC BY 2.0, crabchick |
| `wind-tunnel-model.jpg` | a yellow full-scale test model on trestles at the mouth of the NASA Ames 40x80 tunnel, 1961 | CC BY 2.0, rawpixel repost of a NASA original |

**Tried and rejected, with the reason:**

- *Concorde Wind Tunnel Models* (CC BY 2.0, six yellow wing variants in a case). The best subject
  of the lot for this argument and unusable: the source is 768x1024 **portrait**, and `Plate.tsx`
  renders 16:9 rising to 21:9 with `object-cover`, so a wide crop keeps a thin horizontal band and
  loses the stack entirely. Downloaded, looked at, deleted.
- *Supersonic Transport Model in the shop* (CC BY 2.0). Landscape, striking, and carrying a visible
  **rawpixel watermark** in the corner. Rejected.
- *Rockwell XFV-12A* (PDM). A cutaway line drawing rather than a photograph.
- Wikimedia field-trial and balance-scale lines were searched and abandoned for thin supply rather
  than for quality.

The rawpixel provenance on the shipped plate is recorded in **both** halves in ATTRIBUTIONS: the
page states "Original from NASA. Digitally enhanced by rawpixel" and the reposter licenses it
CC BY 2.0, while the underlying NASA photograph is a US government work. Recording only the
convenient half of that would have been the same class of error as the HeyGen ownership claim round
J fixed.

---

## 5. What the guards caught, in the order they caught it

1. **`flagship.test.ts` scene-echo**, on the first run with topic 21 in the table: one grid card
   body repeated a body sentence verbatim ("Whatever the replay counts as a win is what the system
   will slowly become good at"). A scene REPLACES the prose it stages. The card was rewritten to say
   something the prose does not.
2. **`lib/blog/index.test.ts` meta description band**: the first `seoDescription` was 210 characters
   against a 80 to 170 band. Shortened to 163.
3. **The rendered screenshot**, which is the only thing that caught the diagram. No unit test could
   have: every string was well-formed, every type checked, and the payload was valid. "It compiles"
   really is not verification.
4. **A second table**, which is the only thing that caught the wrong oracle figure.

Nothing else went red.

---

## 6. Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm test` (foreground) | **99 files / 1384 tests**, all green. Baseline in: 99 / 1373. Baseline out: 99 / 1384 |
| `scripts/toc-align-probe.mjs` | **21/21** posts centred at 390 DPR3, delta 0, launcher gap 23 to 56px. The new post sits at delta 0 with a 51px gap |
| screenshots at 1440 / 390 / 320 | captured and READ. `docs/blog-flagship/r21/` |
| horizontal overflow | none at any of the three widths (`scrollWidth === clientWidth`) |
| page errors | none |
| em dashes in rendered copy | 0 |

Measured on the rendered page against `docs/blog-flagship/standard.json`:

| metric | floor | this post |
|---|---|---|
| proseWords | 3587 | **6558** |
| sections (H2) | 19 | **23** |
| citations | 4 | **5** |
| faqQuestions | 5 | **7** |
| bodyImages | 6 | **6** |
| dataGraphics | 2 | **3** |
| cost / calculator / limits / how-to | all true | all true |

`bodyImages` is at the floor rather than above it, and that is a choice rather than an oversight:
one plate, the same count the AI chat assistant post ships with, because the fourth honest
photograph for this topic did not exist and padding the page with a decorative one would have cost
more than the metric is worth.

`scripts/flagship-standard.mjs` gained the slug in its `POSTS` list so the cohort measurement covers
21 posts. It runs against a deployed host and belongs in the next round that runs it; `--ratchet`
was deliberately NOT run, because raising a monotonic standard on the strength of one new post is
how a high-water mark stops meaning anything.

---

## 7. Cross-links

- The post links **`/services/the-singularity`** twice (the calculator's primary action and the
  closing section) and **`/ai#singularity`** twice (the close and the final paragraph).
- The service page's `relatedPosts` now leads with the post, as every other service page leads with
  its own flagship. It shipped without it for exactly one day because the page landed first.
- `cluster: "building"`, which is where the three posts the service page already pointed at live, so
  "Keep reading" offers the automation essays rather than three consumer stubs.
- Propagated from the registry with no further work: `sitemap.xml`, `llms.txt`, `/blog`.

---

## 8. Open, for whoever picks this up

- **The /ai lane owes one line.** `BLOG_POST` in `realtylt-ai-page/web/src/main.js` has no
  `singularity` key, with a comment saying the box lights when the post lands. It has landed:

  ```js
  singularity: { slug: 'the-singularity-self-improving-ai-system',
                 title: 'The Answer Was Wrong in March. It Was Still Wrong in October.', read: '28 min read' },
  ```

  Read time is `lib/blog/toc.ts` `readingTime` over the markdown: 5,624 words / 200, rounded = 28.
  `SERVICE_SLUG` already carries `singularity: 'the-singularity'` from round 42.

- **`COPY.singularity` and the two website surfaces still diverge**, deliberately, on the three
  claims in section 2. If they are ever made to agree, the panel is the side that changes. Round K
  of the zombie table now enforces that direction on the website.

- **`bodyImages` will sit at the cohort floor until this post gets a second plate.** Worth doing on
  a round that is sourcing photography anyway; not worth a round of its own.
