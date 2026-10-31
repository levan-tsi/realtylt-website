# Round 15 seller lane: the real form, the prep sheet v2, the quiz data, the author card, the footer

2026-10-31, branch `r15-seller` (from `r14-blog-preview` at 8c26198). The owner's morning words:
list the real form beside the prep sheet, a ten-question quiz, the footer showing info@ beside
Rachel's line, and his name, email and number at the end of every post.

## What changed

| Piece | Where | What |
|---|---|---|
| The real form | `content/blog/seller-posts.ts` | Linked twice in the seller post: in "The current form is the February 2025 revision" ("download the real form from the Department of State (PDF, seven pages)") and in the free-file paragraph above the offer scene ("the real form, DOS-1614-f (Rev. 02/25)"). The link is the state's PDF, not a copy. |
| The offer scene | `content/blog/seller-disclosure-scenes.ts` | Two pages now, and the state's form linked on both. The scene type allows one button (`lib/blog/flagship.ts`, not this lane's file), so the form's link lives in the paragraph directly above it. |
| Prep sheet v2 | `public/downloads/seller-disclosure-prep-sheet-ny.pdf`, `scripts/build-seller-prep-sheet.mjs`, `scripts/seller-prep-sheet/fonts/` | Two US Letter pages, 289,774 bytes. Page 1 as before plus "Fill in the state's form; this sheet gets the paper ready." and the form's address; page 2 the ten questions in the form's own words, where each answer comes from, and the three rules. |
| Quiz data | `content/blog/seller-disclosure-quiz.ts` (+ test) | `SELLER_DISCLOSURE_QUIZ`, ten questions; not wired (the AI lane builds the component). |
| Author card | `components/blog/AuthorCard.tsx` (+ test), `app/blog/[slug]/page.tsx` | Per cluster (`isConsumer`, the same split as "Keep reading"); his contact row on every post; now on the non-flagship posts too. The chat assistant's paragraph only on its own post. |
| Footer | `components/site/Footer.tsx` | info@realtylt.com added under (914) 415-7185; levan@ kept (five short lines read cleanly at 320 and 390). |

## The form, checked 2026-10-31 (in Levan's Chrome; dos.ny.gov answers 403 to a script)

- `https://dos.ny.gov/property-condition-disclosure-statement-eff-7125`: 200, redirects to
  `https://dos.ny.gov/system/files/documents/2025/05/dos-1614-f-property-condition-disclosure-statement_04.2025-eff.-07.2025.pdf`,
  application/pdf, 1,560,442 bytes, Last-Modified Thu, 29 May 2025. Same bytes count as round 14's read.
- The brief's `.../2024/03/dos-1614-f-property-condition-disclosure-statement.pdf`: **404**. Not used.
- The PDF's text, decoded in the browser from its content streams: 7 pages ("Page 1 of 7" to "Page 7 of 7"), every
  footer "DOS-1614-f (Rev. 02/25)", questions 1 to 56 all present, no 57. `pdftotext` could not be run on it: the
  file cannot be fetched by a script and a browser download was not asked for.

## The shots (all looked at)

| File | What it shows |
|---|---|
| `prep-sheet-page-1.jpg`, `prep-sheet-page-2.jpg` | The two pages of the PDF, shot from the same HTML at print size (no PDF renderer on this box; `pdftotext` on the PDF confirms two pages and the text) |
| `seller-390-real-form-1.jpg`, `seller-390-real-form-2.jpg` | The two body paragraphs with "the real form" links |
| `seller-390-offer.jpg` | The free-file scene, two pages |
| `card-*.jpg` | The author card: seller 320 and 390, AI audit 390 and 1440, the inspection post (non-flagship) 390 and 1440, the chat post 390 |
| `footer-*.jpg` | The footer's contact block at 320, 390, 1440 |

Probe: `node docs/blog-r15-seller/probe.mjs http://127.0.0.1:3109 <outdir>` against `next start`; round 14's
`docs/blog-r14/probe.mjs` was run on the same build for the scenes.

## The gate lines (as run, 2026-10-31)

- `npx tsc --noEmit`: exit 0, "TypeScript: No errors found"
- `npx vitest run`: exit 0, Test Files 169 passed (169), Tests 2405 passed (2405) (baseline 2,377)
- `npm run build`: exit 0, "Compiled successfully in 23.1s", static pages 130/130
- Round 15 probe, 4 posts x 320/390/1440: all 200; scrollWidth equals innerWidth on all 12; one card per page;
  "broker" in no card; every contact link 44 px tall at 16 px; footer lines "1097 Route 55 Suite 9 | Lagrangeville,
  NY 12540 | (914) 415-7185 | info@realtylt.com | levan@realtylt.com"; console: the same 2 Vercel Analytics lines
  (`/_vercel/insights/script.js` 404 and its refused script) on every page, 0 others.
- Round 14 probe on this build: seller and AI pages 200 at 390 and 1440, no sideways scroll, 0 hidden reveals, no
  scene past the edge, smallest scene text 11 px (the eyebrows, as in round 14), contents sheet 11 links.
- Files: `/downloads/seller-disclosure-prep-sheet-ny.pdf` 200 application/pdf 289,774 bytes;
  `/downloads/three-question-sheet.pdf` 200 application/pdf 48,138 bytes.

## Follow-up (2026-10-31 ~12:20 ET): the opening sentences

The owner's rule for every post: the first sentences say what the post covers and what the reader learns, then the
story. Three sentences now open `SELLER_DISCLOSURE_POST`, above the existing first paragraph (kept); a one-line
comment above the constant names the rule. `seller-390-top.jpg` shows the top of the page at 390 (the new paragraph
is the first prose under the cold open; scrollWidth 390; console: the 2 Vercel Analytics lines only).
Gate: `npx tsc --noEmit` exit 0 "TypeScript: No errors found"; `npx vitest run` exit 0, Test Files 169 passed (169),
Tests 2405 passed (2405); `npm run build` exit 0, static pages 130/130.
