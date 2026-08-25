# ROUND A — services hygiene. What shipped, what did not, and what the owner has to answer.

**Built 2026-08-25.** Scope was `SERVICES-CRITIQUE.md`, entirely. Ten commits on `main`, not
pushed: the orchestrator verifies and pushes.

```
e6aa61e  A1  the ten placeholder posts leave the index and the sitemap
5910ce0  A2  review-automation now describes a mechanic that is actually allowed
69daf1e  A3  the unsourceable 78% leaves the chat service page
4a390af  A4  lead-qualification says the fair housing rule it sells against
ec0a412  A5  document-processing stops promising a thing it cannot guarantee
d976d05  A7  the services table-of-contents sheet opens above the chat launcher
2d15ca3  A6  limits becomes a field, a section, and twenty backfills
ea35aa3  A8  the three thin pages, filled from their own researched posts
32995c5  A9  the zombie-claims guard now reads the commercial surface too
4e59d6f  A10 three copy corrections found by looking at the rendered pages
```

---

## What shipped

### A1 — placeholders out of the index and the sitemap
`app/blog/[slug]/page.tsx`, `app/sitemap.ts`, `app/blog/placeholder-noindex.test.ts`.

Ten consumer posts render "[Placeholder draft. The owner's final article replaces this text.]".
All ten were in `sitemap.xml` and carried no robots directive, so the only thing keeping them
out of Google was the site-wide `PRELAUNCH` disallow — the switch the OWNER flips at launch.
"We launched" and "we submitted ten thin pages" were the same action.

The mechanism already existed: `post.placeholder` is a boolean on both `BlogPost` and
`Article`. `generateMetadata` now emits `robots: { index: false, follow: true }` for it and the
sitemap filters it out. `follow` stays on, the same posture `app/search/page.tsx` takes for its
filtered facets. A CRM publish under the same slug clears `placeholder` and the URL returns to
the sitemap on its own.

The test sets no env on purpose, so it asserts the behaviour that must hold on the day the
global block comes off.

### A2 — review-automation rewritten compliant (critique §1)
The page described review gating in `lede`, `figure.footnote` and `howItWorks[2]` while its own
FAQ defined gating as the thing you must not do and claimed "This asks everyone." Everyone got
the *survey*; only the fives got the *review link*, and the link is what the rule is about.

Every surface now describes one mechanic: **everyone gets the same Google link whatever they
scored, and a low score ALSO opens a private line to the owner** — as well as, never instead
of. The figure was rewritten so the transcript shows a **four** getting the link and a call the
same day, which is the harder and more convincing version of the same product.

Two FAQs added: "What is review gating?" (naming the practice and drawing the line at *whether
the unhappy customer still gets the link*), and the website-embed answer now cites the rule.
The embed is "a selection of recent reviews"; the words "your best feedback" are gone, and the
spec chip "puts the best up front" became "the same link for everyone".

Sources, both read in the critique's quotation of the primary document:
- Google contribution policy, `support.google.com/contributionpolicy/answer/7400114`, under
  "We do not allow merchants to": *"Discourage or prohibit negative reviews, or selectively
  solicit positive reviews from customers."*
- 16 CFR 465.7(b), 89 FR 68077, 22 August 2024. It turns on **misrepresentation**, not on
  selection, which is why the label carries the weight.

**Kept deliberately:** the H1, "More 5-star reviews, without the awkward ask". Asking everyone
consistently does produce more five-star reviews in absolute terms; the headline describes an
outcome, not the gating mechanic, and changing it drifts further from the `/ai` COPY than the
fix requires. Flagged rather than changed.

### A3 — the 78% dies on the services surface (critique §2a)
Asserted three times on `ai-chat-assistant.ts` (`why`, `stat`, FAQ) while `relatedPosts` pointed
at the post whose second section proves it has no published report, no stated sample and no
methodology, and ends "So this article does not use it."

Replaced with Harvard Business Review, *The Short Life of Online Sales Leads* (2011), Oldroyd /
McElheran / Elkington:

| where | now |
|---|---|
| `stat` | **23%** — of 2,241 US companies never answered a website inquiry at all |
| `why` | contacting inside the hour made a firm nearly seven times likelier to reach a decision maker **than waiting one more hour** |
| FAQ | the 1.25m-lead study in full, with the caveat that it is cross-industry 2011 work and *the shape is what carries over, not the multiple* |

`grep` over `content/services/**`: 78 appeared in no other service file.

### A4 — fair housing on the page that sells the mechanic (critique §3)
Measured across the twenty, `lead-qualification` was the only regulated-risk service silent
about its own regulation, while `useCases[2]` sold "routing by area" — a defensible operational
practice and the classic fair-housing proxy.

Moved from its own post, not invented: the *change your order, never their access* rule with
42 U.S.C. 3604 and NAR Article 10 named; the area-routing caveat inline in the use case; the
post's own "Is it legal to score and route leads with software?" FAQ, including the Article 10
point that building to the federal floor is not building to the standard a REALTOR already
agreed to. Carries the post's own "none of this is legal advice".

### A5 — no "never" on document-processing (critique §5)
`why` said "so deadlines never slip through a PDF". Reworded to the critique's own suggestion:
*a deadline is flagged the day the contract lands, not the week it expires.* The critique named
only `why`; `useCases[0]` was titled "The deadline that never slips" and made the same promise
in three fewer words, so it went too.

### A6 — limits becomes a field (critique §4)
`limits: string[]`, **required** on `Service`. New `components/services/Limits.tsx`, rendered
between `UseCases` and `SeeItLive`. A "Limits" row added to `lib/services/toc.ts`. Twenty
backfills, three to five entries each.

No new visual language: mist ground (this site's alt-section background, already used by the
outcome band on the same page, and it keeps the paper / mist / ink rhythm intact), the FAQ's
sticky-heading two-column layout, hairline-divided rows. A bulleted list with the porchlight dot
was drawn and rejected — the dot is this site's affirmative marker, and putting it in front of
"it will not invent a price" makes a limitation read as a feature.

Five lifted from their own flagship posts (chat, voice, reactivation, qualification, workflow).
The voice page's were already the best writing on the surface; they were just buried inside
three FAQ answers where an AI answer will not lift them.

The other fifteen are grounded **only** in claims those pages already make or in plain product
truths. Every one was re-checked in the second pass against the page it sits on. Examples of the
grounding: skip-tracing's "trusts, LLCs and recently transferred properties come back flagged"
is that page's own FAQ; ai-clone's "we recommend being straightforward that a video was made
with an AI avatar" is that page's own FAQ; document-processing's "anything it is not confident
about is flagged for a person" is that page's own FAQ. **No limit asserts a new fact about the
product from the negative side.** No page needed fewer than three entries to stay honest.

Guards: `lib/services/index.test.ts` now runs the em-dash and arrow-glyph checks over limits
copy and requires >=3 entries, each over 40 characters and ending in a full stop — two limits is
a hedge, one is a disclaimer. `lib/services/toc.test.ts` requires the row and a non-empty
section for every service in the registry.

### A7 — the ServiceToc sheet z-fix (critique §5)
`z-[70]` to `z-[1000000]`, the same one-token value `ListingGallery`, `QualifyingWizard` and the
two blog rails already use. Verified in a real browser, not by reading the class: computed
z-index 1000000, six rows, and the element painted at the launcher's bottom-right corner while
the sheet is open is a navigation row of the dialog. `/rlt-chat.js` is on the page and is
z-index 999998 (launcher) / 999999 (panel).

### A8 — the three thin pages filled from their own posts
| page | words | shape (whatItIs / howItWorks / useCases / faqs) |
|---|---|---|
| lead-qualification | 786 → 1,492 | 2/3/3/3 → 3/4/5/5 |
| database-reactivation | 1,075 → 1,476 | 2/3/3/4 → 3/4/5/5 |
| workflow-automation | 1,113 → 1,477 | 2/3/3/5 → 3/4/5/6 |

For reference the better core pages sit at chat 1,531, voice 1,618, skip-tracing 1,445.

Moved, not written: the traceability step and the outcomes report from the qualification post;
"why nobody works it", the consent check promoted to the FIRST step of the chain, and the
47 CFR 64.1200 dates from the reactivation post; the CHI 2005 interruption figure with its
caveat, the "start with the boring one" ranking rule, and the 1-in-20 silent-failure asymmetry
from the workflow post.

**Also fixed, and it was the odd one:** `lead-qualification` and `database-reactivation` each had
a 3,400+ word researched post behind them and did not link to it, recommending two siblings
instead. Own flagship first now, two cards, matching what `ai-chat-assistant` and
`ai-voice-agents` already do. Two cards and not three because `RelatedPosts` is a two-column
grid and an odd count leaves a visible empty cell.

`geo-landing-pages` and `local-seo` had no related reading. Each gets **one** honest link to the
chat post rather than a filler pair. For `local-seo` the two pages make the same argument one
step apart (*the agent they call is the one they find first* / *being first buys the
conversation*). For `geo-landing-pages`, workflow-automation was considered and **rejected**:
nothing on that page is about wiring tools together, so that link would have been filler; the
chat post earns it because `howItWorks[2]` there sells lead capture on your own ground. A single
card renders as a half-width card and looks deliberate — checked, `local-seo-related-1440.png`.

### A9 — the zombie guard covers the commercial surface
`lib/blog/zombie-claims.test.ts` reads `content/services/*.ts` from the directory, so service
twenty-one is covered the day somebody writes it, and the "names at least one file" probe now
asserts twenty service files were actually matched — a glob that silently matches nothing is a
beautiful pass wearing a directory read.

**Proved red before green, against real content rather than a synthetic string:** checked the
pre-A3 `ai-chat-assistant.ts` out of `69daf1e^` into the working tree and ran the test. It
failed naming lines 14, 30 and 105. Restored (`git status` clean on that path), green.

The lesson worth keeping: the blog killed this figure on 2026-08-02 and wrote the guard on
08-03, and the page selling the thing went on asserting it for three more weeks. A retraction
that covers the article and not the commercial surface has retracted nothing.

---

## Deliberately NOT done, and why

1. **The unsourced 73% on review-automation** (`why`, `stat`, one FAQ). Critique §2b wants
   BrightLocal's Local Consumer Review Survey 2026 in its place, and specifically the 74% who
   only care about reviews from the last three months, because recency is that page's own
   argument. That is Round B's job — review-automation is the first topic in that wave — and it
   needs the primary document read, not a figure copied out of a critique. Left untouched and
   flagged. **It is still an unsourced number on a page I otherwise rewrote for honesty.**
2. **`stat.source`, made required** (critique §2, second half). Not done. Making it required
   forces `review-automation` to either source its 73% or drop it, which is item 1 above and
   belongs to Round B. The chat page's number carries its derivation in the visible copy beside
   it instead. Recommend Round B does the field and the source together.
3. **Tier reassignment.** `lead-qualification` stays `more`; reactivation and workflow stay
   `core`; `skip-tracing` stays `flagship` with no post. The critique itself files this under
   "one thing worth deciding rather than fixing". Owner call, not taken.
4. **`video` on any of the twenty.** Films are out of scope this round by instruction and are
   owner-held.
5. **The `/ai` page COPY drift.** See the cross-repo finding below. Different repo, not touched.

---

## Unknown product facts — the owner has to answer these, they are not writable

1. **Does the voice agent record AUDIO, or only store a transcript?** (critique §5.) The page
   says it "logs every call so the record is there", which does not answer it. The flagship post
   spends a paragraph on New York Penal Law § 250.00 (one-party consent) against California
   Penal Code § 632 (all-party) and advises assuming the stricter rule when the caller is out of
   state. If it records audio, the page should say so and say what it does about the caller's
   state. **If it only stores a transcript, saying that plainly is a selling point.** Nothing was
   written either way.

2. **Does review automation, as built today, send the Google link to everybody?** A2 rewrote the
   page to describe the compliant mechanic. If the implementation still gates, **the page is now
   ahead of the build and the build is what has to change** — the critique's own second option
   was "if the product genuinely does gate, say so plainly", and that option was not taken
   because the compliant version is both legal and better. Someone has to confirm.

3. **Does the website review widget pull "best" or "recent" reviews?** The page now says a
   labelled selection of recent reviews. Under 16 CFR 465.7(b) the label is the load-bearing
   part, so the widget's actual selection rule and its on-screen label both have to match what
   the page now claims.

---

## Other defects found while in here, NOT fixed (all pre-existing, all out of Round A scope)

- **`/ai` page, DIFFERENT REPO (`~/realtylt-ai-page`).** The 78% is alive there:
  `web/src/main.js:642` carries `why: '78% of deals close with whoever responds first…'`, and
  the file's own comment at line 638 records that `index.html` says "78% of deals" **five
  times**. The service page and the 3D journey now disagree, and the journey is the side that is
  wrong. `content/services/types.ts` names that COPY object as the source of truth, so this is a
  real drift and it should be resolved by fixing `/ai`, not by reverting the page.
- **`database-reactivation.why`**: *"The average database holds tens of thousands in unworked
  commission."* Unsourced, and it is a dollar claim its own flagship post explicitly refuses to
  make — the post says no independent study of cold database response rates exists in any
  vertical, which is exactly why it built a calculator instead. Same class of defect as the 78%.
- **`skip-tracing-lead-generation.why` and one FAQ**: *"at a fraction of vendor pricing."* An
  unsourced comparative price claim, and the rollout plan's own standing rail says vendor pricing
  rendered in JavaScript is uncitable and the number should be refused.
- **`ai-voice-agents`**: *"reaches a new lead in seconds rather than the industry-standard
  hours"* and *"runs every hour of every day at a fraction of that [an ISA salary]"*. The first
  now has real research available to it — the HBR 42-hour average that A3 brought onto the chat
  page — and should cite it or drop the phrase. The second is an unsourced cost comparison.
- **`skip-tracing` useCases**: *"A list where 40% of the numbers are dead"*. Reads as a measured
  figure; it is an illustration.

Method note: this list came from one pattern sweep over visitor-facing strings in all twenty
files, for percentages, "fraction of", "industry-standard", "most agents/businesses" and
"average database". It is not a full claim audit.

---

## Verification

All gates FOREGROUND, on the disk as committed.

```
$ npx tsc --noEmit
TypeScript: No errors found

$ npm test
 Test Files  93 passed (93)
      Tests  1143 passed (1143)
   Duration  13.35s

$ node scripts/check-svg-crop.mjs
PASS  ai-chat-assistant-real-estate-website          20 text nodes in role="img" graphics
PASS  ai-voice-agent-missed-calls-real-estate        30 text nodes in role="img" graphics
PASS  database-reactivation-old-real-estate-leads    24 text nodes in role="img" graphics
PASS  ai-lead-qualification-real-estate-scoring      20 text nodes in role="img" graphics
PASS  workflow-automation-real-estate-business       22 text nodes in role="img" graphics

116 text node(s) checked, 0 cropped.
```

Baseline before this round: **92 files / 1118 tests**. After: **93 / 1143**. Up, never sideways.

### Rendered, on the existing `:3100` dev server (reused, never a second one)

```
/blog/top-5-renovations-increase-home-value-ny   <meta name="robots" content="noindex, follow">
/blog/ai-chat-assistant-real-estate-website      (no robots meta — correct)
/sitemap.xml                                     6 blog URLs, all ten placeholders absent,
                                                 the CRM-published post still present
#limits                                          present on all 20, opacity 1
390px DPR3                                       18px body in the limits rows
320px                                            docW == winW on four pages, no overflow
ToC sheet @390                                   computed z-index 1000000, 6 rows incl. Limits
```

Probe rails held: `**/api/lead` and `**/api/media/**` aborted in every browser run, no
MLS/DATA-API call on any page or probe path.

### Screenshots — `docs/blog-flagship/r-a/`

`{slug}-limits-1440.png` and `{slug}-limits-390.png` and `{slug}-outcome-{1440,390}.png` for
review-automation, ai-chat-assistant, lead-qualification, document-processing,
workflow-automation, database-reactivation, local-seo. Plus
`lead-qualification-whatitis-{1440,390}.png`, `local-seo-related-1440.png`,
`lead-qualification-related-1440.png`, `toc-sheet-390.png`.

**The first shot run produced three blank mist rectangles and reported success.** The sections
were there; the `Reveal` wrapper had never fired, because `scrollIntoViewIfNeeded` does not move
a viewport that already contains the element, so the IntersectionObserver never fired. The probe
now walks the page down in wheel steps and asserts the computed opacity of a row before it
photographs it. A probe that photographs an empty box and reports success is worse than no
probe, and this one did it once before it was caught by looking at the PNG.

Three copy corrections came out of reading the images rather than the source, and are commit
A10: the chat outcome band stated the same fact twice side by side, the lead-qualification fair
housing paragraph rendered as a nine-line wall beside two three-line paragraphs, and one
"never" had survived into the appointment-booking limits.

The probe scripts are `scripts/_scratch-rounda-shots.mjs` and `scripts/_scratch-rounda-toc.mjs`.
They are gitignored by repo convention (`scripts/_scratch-*`), so they are on disk, not in the
commits.
