# Round 15 blog lane: the AI post rebuilt to its old depth, the quiz, relatable pictures

2026-10-31, branch `r14-blog-preview`. The owner's verdict on round 14's AI page: smaller and
more confusing than the old version, background picture not relatable, include the questions we
ask an owner, update the old sources rather than cutting the depth, and a quiz at the end.

## What changed

| | Round 14 | Round 15 |
|---|---|---|
| `AI_AUDIT_POST` words (markdown, H1 excluded) | 1,779 | 7,574 |
| H2 / H3 | 11 / 7 | 20 / 26 |
| Scenes | 8 | 22 |
| Cover / cold-open field | antique switch box / abacus | a receptionist on the phone at a front desk |
| Plates | none | a bakery counter; a mechanic with a laptop |

- Restored from the August version, in substance: what an audit is for; start with one job
  written down; you are not behind; what should not be automated (with the property business
  case); why ranking by the average gets it wrong (argument kept, the 2013 numbers dropped);
  the failure rate nobody can give you (argument kept, the 2010 paper cited for its definitions,
  no rate); what the order gets sorted by; how to run one yourself; what an audit does not do;
  ten FAQ answers.
- New: what the audit is and how it runs; the questions we ask (18 of the field kit's 37, in six
  groups, plus what to send before the call); what you get at the end (time, the report, no
  price); who should stay on the job (augment, the four checks, the approval gate); why this is
  different from an automation agency; your roadmap week by week; an "Apply it" line closing
  every section; one invented, labelled example per section; the opener rule (comment above the
  constant).
- The firm-size chart now reads ONE survey and ONE reference period (the Census working paper),
  now against six months on. Round 14 put two surveys side by side.
- Multi-panel bars stack at every width (`Bars.tsx`), with `min-w-0` guards in the bar row.
- New scene kind `quiz` (`components/blog/scenes/primitives/Quiz.tsx`, pure logic in
  `lib/blog/quiz.ts`), registered in the registry and the flagship types; band "night" maps to
  dark in `sceneBand`.
- The skip tracing post is removed (owner's word): entry, markdown, scenes file, imports, the
  related-post rows on three service pages, two inbound links in the data enrichment post, the
  slug in two scripts. `/blog/skip-tracing-real-estate-legal-owner-phone-numbers` answers 308 to
  `/blog` from `next.config.ts`; `app/redirects.test.ts` holds it. Its cover image and
  attribution row stay.

## Probe

`node docs/blog-r15/probe.mjs http://127.0.0.1:3108 <outdir>` against `next start` on the
production build: both posts at 320, 390, 768, 1024, 1280, 1440; one frame per AI scene at 390;
the quiz driven through a fail and a pass (390), the pass at 1440 and with reduced motion; the
quiz with JavaScript off; the removed post's redirect; the two free files; the sitemap.
`report.json` is the last run. `sweep.mjs` walks 300 to 1600 px for any scene element past the
right edge.

| File | What it shows |
|---|---|
| `tops-390.jpg` | Both posts' cold opens at 390 |
| `ai-1440-top.jpg` | The AI cold open at 1440, the receptionist on the phone behind the title |
| `ai-390-scenes-1..5.jpg` | All 21 figure and plate scenes at 390, four or five per file, in page order |
| `bars-1024-1280-1440.jpg` | The multi-panel bars at laptop widths, stacked |
| `quiz-390-fail.jpg` | A question, an answered question with its why, the black hole result |
| `quiz-390-pass.jpg` | The pass run, the galaxy and lit brain, and the same with reduced motion |
| `quiz-1440-pass.jpg` | The pass at 1440 |
| `quiz-390-nojs.jpg` | JavaScript off: the ten questions as a list, the first answer opened |

## Gate lines (as run, 2026-10-31)

- `npx tsc --noEmit`: "TypeScript: No errors found", exit 0
- `npx vitest run`: Test Files 169 passed (169), Tests 2399 passed (2399) (baseline 2,377)
- `npm run build` (next build): exit 0, "Compiled successfully", static pages 129/129 (130 before;
  the removed post)
- Probe, both pages, six widths: HTTP 200; `scrollWidth === innerWidth` at every width; no scene
  element past the right edge; 0 reveals left hidden; smallest scene text 11px (the existing
  eyebrows); console 2 lines per page, both the Vercel Analytics script that exists only on
  Vercel, 0 other errors
- Quiz at 390: "1 of 10" row, choices 358x60 px at 16px; learning run 3 of 10, fail state, focus
  on "The black hole: try again"; pass run 10 of 10, pass state, focus on the result heading, one
  link "Talk to us about running the audit" to /connect; pass at 1440 and with reduced motion
- JavaScript off: the list renders, 10 items, 10 `<details>`
- `/blog/skip-tracing-real-estate-legal-owner-phone-numbers`: 308, location /blog
- `/downloads/three-question-sheet.pdf` 200 application/pdf 48,138 bytes;
  `/downloads/seller-disclosure-prep-sheet-ny.pdf` 200 application/pdf 278,007 bytes
- `/sitemap.xml`: 104 URLs, no skip tracing URL

## Not reproduced

The two-panel overflow reported at 1024 to 1440 did not reproduce in headless Chromium at any
width from 300 to 1600, with overlay or forced classic scrollbars. The panels now stack, which
removes the side-by-side layout the report was about.
