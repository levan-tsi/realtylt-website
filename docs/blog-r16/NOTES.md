# Round 16 blog lane: the five fixes on the AI audit post

2026-10-31, branch `r14-blog-preview`, from 6b111d3. The owner approved both pages on the design
and asked for five fixes on the AI post before the merge: the floating list showing rows twice and
filling the screen, its text going dark, the 38-minute read, a paragraph on why the audit comes
first, and the "Apply it" lines woven into the text. The seller post's text is untouched; it only
gets the shared rail code.

## The numbers

| | Before (6b111d3) | After |
|---|---|---|
| `AI_AUDIT_POST` words (`readingTime`'s own count: whitespace split of the markdown) | 7,574 | 3,878 |
| Reading time in the cold open | 38 min | 19 min (read from the rendered page) |
| H2 / H3 | 20 / 26 | 15 / 28 |
| Scenes | 22 | 22 |
| "Apply it" (file and rendered page) | 14 | 0 |
| AI rail rows | 32 (four labels twice) | 18, no words twice |
| Seller rail rows | 12 | 12 (same labels, same order) |
| Seller post words / reading time | 1,995 / 10 min | 1,995 / 10 min |
| Rendered words in `#article-root`, scene text included (AI / seller) | not measured | 6,174 / 3,097 |

## Fix 1: the rail (lib/blog/flagship.ts `flagshipToc`, `railWords`)

Cause confirmed: every H2 became a row and every labelled scene became a row, and several scene
labels repeated their own section's heading label. The rule now, in shared code:

- a scene row never appears when a heading row carries the same words (lowercase, punctuation and
  figure numbering stripped, articles dropped), anywhere on the page;
- nor when every word of its label is already in the label of the section it sits in ("Not to
  automate" under "What not to automate" goes; "The booking" under "What it does" stays);
- no two rows carry the same words.

An earlier draft also capped each section at one figure row. It dropped real destinations on six
other approved posts ("The path", "The teardown", "What it connects to"...), so it was taken out;
which scenes are destinations stays each post's call through the scene's `label`.

Across the twenty-one flagship posts (`docs/blog-r16/rail-diff.ts`), twelve carried at least one
repeated row and lose only the repeat. The three frozen rails in `lib/blog/flagship.test.ts` that
had enshrined a repeat (local SEO "The top slot" and "The rules"; area pages "The policy" and
"Sameness"; agent workforce "What it is", "Where it fails", "The brief") lose those scene rows and
nothing else.

On the AI post: the shared rule removes seven scene rows (Who uses AI, The three questions, Not to
automate, Who stays on the job, How the audit runs, What you get, Your roadmap). Five H2 merges
(below) remove five heading rows. Two editorial calls in `content/blog/audit-scenes.ts`: the
heading label "AI in small firms" became "Who uses AI" and "Worth automating?" became "The three
questions", and the figures "By firm size" and "Where the use goes" no longer carry a label (they
sit inside "How small businesses use AI in 2026", whose row stands for them). Stale heading-label
keys for the five headings that became H3 are removed.

AI rail after, in order: What an audit is for, One job written down, Who uses AI, The person stays,
The three questions, Your numbers, What not to automate, Who stays on the job, Rank by worst day,
How the audit runs, The questions we ask, What you get, Run it yourself, Your roadmap, Common
questions, Quiz, Next step, Sources. The phone sheet at 390 shows the same 18 in the same order.

Tests added (`lib/blog/flagship.test.ts`, "flagshipToc: one entry per section, no row twice"):
`railWords` normalisation; the rule on a synthetic outline; the real AI post's rail (no repeated
words, rows <= H2 count + scenes whose label says something no heading says, rows <= 18, each of
the four labels the owner saw twice appears once); and no repeated words on any of the 21 rails.

## Fix 2: the rail's text going dark (components/blog/FlagshipToc.tsx)

Proved before fixing with `docs/blog-r16/tone-drive.mjs`: walks each page top to bottom in 200 px
steps, reads the rail's label colour and card colour (through a canvas, because the night tokens
come back as `oklab()`), samples the real page pixels under the viewport middle with the rail
hidden, and computes the label's contrast on its open card over the page.

Findings, before (`tone-before.txt`):

- The rail itself only renders where the gutter holds a readable label: at 1440 and 1536 the page
  shows the pill (fixed ink, 16.41:1 everywhere); at 1680 the rail shows.
- At 1680 the open rail read **1.06:1** on 50 of 263 steps (AI) and 24 of 100 (seller). Every one
  of those steps sat on a band TAGGED dark: the cold open and every dark scene (AI: by-firm-size,
  why-not, the-person-stays, three-gates, stay-on-job, plate-garage, audit-day, report, roadmap,
  quiz; seller: form-timeline, four-answers, lead-paint, quiz). No failure sat on an untagged band.
- Cause, which was not the suspected fallback: the site root carries `.nocturne`
  (app/layout.tsx), which re-points `--color-paper` to the night (#131417). The rail's dark palette
  used `text-paper/65` and `font-bold text-paper`, so over a dark band it printed night-on-black.
  That is "went dark, then came back" exactly: dark while a dark band holds the middle of the
  screen, back as soon as a prose band does. The untagged regions (related posts, footer) fell back
  to "light", which under the night tokens is light text on a night card, so they read fine.

Fix: the dark palette uses `text-moon` / `text-moon/70` and a moon focus ring (the moon is never
re-pointed); the fallback now keeps the tone of the nearest tagged band above the viewport middle
instead of "light"; the related-posts section is tagged `data-band="light"`. The footer is a shared
site component and is left untagged; the fallback covers it.

After (`tone-after.txt`, also in `report.json`): AI and seller at 390, 1440 and 1680, **0 steps
under 4.5:1**; lowest 6.55:1 with the rail open at 1680, 16.41:1 on the pill. The drive is part of
`docs/blog-r16/probe.mjs` so it stays checked.

Frames: `rail-1680-open-dark.jpg` (open over "The person stays", a dark band) and
`rail-1680-open-light.jpg` (open over the prose before "What should not be automated"). The brief
asked for 1440; at 1440 the rail does not render (the pill does), so they are at 1680.

## Fix 3: the cut (content/blog/ai-posts.ts `AI_AUDIT_POST`)

Method as briefed: one claim once, an example in two or three sentences, no closing summary
sentences, FAQ answers that restated a section cut to one line pointing at it. Every source still
cited is kept (all six are); no number changed.

| Section (before) | Words before | Words after | What went and why |
|---|---|---|---|
| Opener | 333 | 205 | Two to four sentences kept as the opener rule says; the eleven-idea example cut to two sentences; the "every section ends with apply" line removed with the labels. Fix 4 paragraph added here. |
| What an AI audit is for | 200 | 106 | The "meeting with a document attached" set-up dropped; the removal argument kept in one paragraph. |
| Start with one job written down | 226 | 117 | Kept the step and the dental example; the "everything below starts one step later" bridge cut. |
| How small businesses use AI in 2026 | 764 | 422 (with the next row) | One survey, one reference period kept. Dropped from the text: the November 2025 wording change, the 17 to 20 percent range since December and the 20 to 23 percent expectation (no teaching rests on them), the May story's 20-employee line; the 100 to 249 band and the six-month expectations now live only in the chart that prints them. "By firm size" and "By trade" H3s merged into the body. |
| Where small firms use AI, and what it does to the team | 316 | (merged above as H3 "What it does to the team") | Same teaching (augment, 44 percent, 2.3 up and 2.0 down); the 41/40 percent function shares and the 16 percent software line left to the charts. |
| The three questions | 669 | 342 | All three questions and their examples kept, shorter; the NIST paragraph kept with both quotes and the date, its "written by people with nothing to sell" aside cut. |
| What should not be automated | 434 | 253 | The list as one sentence (the tiles scene prints it as four); the property case kept. |
| Who should stay on the job | 431 | 229 | Augment, the approval gate built into the system, the four checks, the fixed-message exception, the plumbing example all kept; the "time back for the customer on the phone" paragraph cut (the bakery and garage plates carry it). |
| Why ranking by the average outcome gets it wrong | 271 | 383 (with the next two rows) | Kept the shape argument and the A/B example. |
| The failure rate nobody can give you | 286 | (merged above as H3) | Kept: no 2026 survey, the report whose data is closed, the Amsterdam paper's finding (now quoted as "result in meaningless figures"), how the definitions skewed. Cut: the padded-forecast anecdote's second sentence. |
| What the order gets sorted by | 333 | (merged above as H3) | The three criteria in order kept; the impact and risk scores kept; the Friday-list example kept. |
| Why this is different from an automation agency | 132 | (H3 under how the audit runs) | Kept in three sentences. |
| What the audit is and how it runs | 565 | 269 (with the H3 above) | All seven steps kept as one line each; the audit-day scene prints them again in full. |
| The questions we ask in an audit | 700 | 466 | All 18 questions kept. The six "Why we ask" lines folded into one sentence; "What to send before the call" from a four-item list to one sentence. |
| What you get at the end | 437 | 157 | The report's contents as one sentence; "what an audit does not do" from five paragraphs to three sentences; the duplicate one-line report example cut. |
| How to run one yourself in one evening | 195 | 92 | Five steps kept; the "Free file" line dropped because the sheet scene right after it carries the same link. |
| Your roadmap, week by week | 265 | 225 (with the next row) | Five stages kept, shorter; the cleaning-company example kept. |
| Who this fits | 84 | (H3 under the roadmap) | Kept, one example instead of three. |
| Common questions | 625 | 304 | All ten questions kept (they feed the FAQ structured data). Answers that restated a section are one line pointing at it; the new ones (readiness assessment, can I do it myself, do I need to know AI, audit vs workflow automation) kept. |
| Next step | 40 | 40 | Untouched. |
| Sources | 268 | 268 | Untouched; all six still cited. |
| **Total** | **7,574** | **3,878** | |

The quiz as the test that nothing was lost: each of the ten answers was checked against the new
text with a string match (19.8 percent and the wider 46 percent; the first question; the rule never
decided; the third question removes the most and is a fact about the business; 2.0 percent down
and 2.3 up; containment first and the saving last; read from the record or say there is none; the
send step cannot run without approval, built into the system; 75 minutes on the last real week,
nothing pitched; no 2026 survey and a number whose method nobody can check). All ten taught. The
quiz's "why" lines name sections by their words; every named section still exists as an H2 or H3.

Rules checked on the new text: 0 em dashes, 0 "broker", no price or fee, every number from a named
source, every invented example labelled, four question marks in prose (the four checks, which are
the checks themselves), the existing topic contract's "scene repeats a body sentence" test green.

## Fix 4: why the audit comes first

The opener's second paragraph: "The audit comes before any building for a plain reason. The three
questions cross off the ideas that would have been built wrong, before anyone pays for them, and
the hours a job takes are measured before a tool is chosen. A build that skips the audit usually
automates the wrong job, or the right job on a rule nobody had settled."

## Fix 5: the "Apply it" lines

All 14 removed. Each point woven into its section's closing sentences or dropped where the section
already said it: shorter list (what an audit is for), write tonight's job down (one job), count the
typing (not behind), stop at the first no (three questions, now the intro), ask where the fact is
read from (property), name the approver (who stays), write the worst day and sort by it (ranking),
ask how a rate was measured (failure rate), the two scores (the order), ask what they would not
build (agency), bring the admin person (before the call), answer the 18 in writing (questions
intro), every number says how it is known (what you get). Dropped as already said: "look for the
writing around a job" (the bakery paragraph says it). 0 on the page, 0 in the file.

## Gate (as run, 2026-10-31)

- `npx tsc --noEmit`: "TypeScript: No errors found", exit 0
- `npx vitest run`: Test Files 171 passed (171), Tests 2451 passed (2451) (round 15 handoff: 2,427)
- `next build`: exit 0, "Compiled successfully in 10.1s", "Generating static pages (129/129)"
- Probe (`node docs/blog-r16/probe.mjs http://127.0.0.1:3108 docs/blog-r16/shots` against
  `next start` on that build; `report.json`):
  - both pages at 320, 390, 768, 1024, 1280, 1440: HTTP 200, `scrollWidth === innerWidth`, no scene
    element past the right edge, 0 reveals left hidden, smallest scene text 11px (the eyebrows),
    22 scenes on the AI page and 8 on the seller page;
  - console: 2 lines per page, both from `/_vercel/insights/script.js` answering 404 off Vercel
    (`console-404.mjs` lists the only failing request), 0 other errors;
  - quiz at 390: "1 of 10", choices 358x60 at 16px; first-choice run fails 4 of 10 with focus on
    "The black hole: try again"; pass run 10 of 10, focus on "The galaxy is out and the brain is
    lit", one link "Talk to us about running the audit -> /connect"; pass at 1440 10 of 10; pass with
    reduced motion 10 of 10;
  - JavaScript off: the list, 10 items, 10 `<details>`;
  - `/blog/skip-tracing-real-estate-legal-owner-phone-numbers`: 308, location /blog;
  - `/downloads/three-question-sheet.pdf` 200 application/pdf 48,138 bytes;
    `/downloads/seller-disclosure-prep-sheet-ny.pdf` 200 application/pdf 289,774 bytes;
  - `/sitemap.xml`: 104 URLs, no skip tracing URL;
  - AI page: cold open reads "19 min read"; 18 rail rows, 0 repeated; author card present; footer
    has info@realtylt.com and (914) 415-7185; 0 "Apply it"; 0 "broker";
  - seller page: "10 min read"; 12 rail rows, 0 repeated; author card present; footer has both
    contact lines; 0 "Apply it"; 0 "broker";
  - rail-tone drive: 0 steps under 4.5:1 on either page at 390, 1440 and 1680.

## Frames (looked at)

| File | What it shows |
|---|---|
| `ai-390-scenes-1..5.jpg` | All 22 AI scenes at 390 in page order, five per sheet |
| `ai-390-top.jpg`, `ai-1440-top.jpg` | The cold open (unchanged) |
| `rail-1680-open-dark.jpg` | The open rail over a dark band: light labels on the night card |
| `rail-1680-open-light.jpg` | The open rail over a prose band |
| `sheet-390-ai.jpg` | The phone sheet, the same 18 rows |

## Tools in this folder

`probe.mjs` (round 15's plus the round 16 block), `tone-drive.mjs` (standalone or imported),
`rail-rows.ts` and `rail-diff.ts` (run with `npx vite-node --config vitest.config.ts <file>`:
the two posts' rails and reading times; every flagship's rail before and after the rule),
`console-404.mjs`, `sheets.mjs` (the contact sheets from the probe's frames). `shots/` holds the
raw PNGs and is not committed.

## Left open

- The rail only appears from about 1680 wide; at 1440 the pill and its sheet stand in. That is the
  existing measured-gutter behaviour, not changed here.
- The scenes kept their own text; three repeat body numbers by design (the charts print the figures
  the paragraph above cites). None repeats a body sentence (the contract test).
