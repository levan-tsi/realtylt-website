# Round 28 refresh lane: the Google reviews post, re-aimed at local business owners

2026-11-11, branch `r28-reviews` from `origin/main` 3aabe4a, worktree `realtylt-website-r28b`. His order of 2026-11-11:
the AI posts are for business owners, a real estate office one example among several. The slug is kept. Base: the SEO
agent's refresh draft of 2026-11-09 (already re-aimed in part: two electricians), its second reader's notes, and the live
post.

## What changed

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` REVIEW_AUTOMATION_POST | Title phrase "how to get more Google reviews" (keyword map: AC 9 to 10); the opener says what we do and what the page teaches in the first 60 words; the examples a painter, a bike shop, a plumber, a cleaning company, a gym, a salon, a landscaper, a dental and an accounting office and a real estate office as one of them; added "Is it worth automating", "Who this fits, and who it does not", "What to do first", the quiz and three owner FAQs from the map ("How do I get more Google reviews?", "... without begging customers?", "How should a business respond to Google reviews?"); "What it costs, and how long it takes" became "What it takes to run" (no price; the second reader read the per-message billing line as our pricing); the heading "in the only study that measured money" became "in a study that measured money" (an exclusivity claim); every unsourced number or generalisation the second reader found was cut or marked invented (17 passes); the closing line goes to the quiz (CTA-2 section 4, version B), plain text until the address answers; sources re-read 2026-11-11 with short links. |
| `content/blog/review-scenes.ts` | The staged exchange is a home-service job and a late part, the owner unnamed (was a closing, a lender and Levan); the in-short, the incentive card, the failure card, the calculator's first input and note, the study note and the funnel footnote re-aimed; three new scenes: fits (grid), roadmap (steps), quiz; heading labels for the new and renamed headings. |
| `content/blog/review-quiz.ts` (+ test) | Ten questions from the SEO agent's draft; the test holds ten, four distinct choices, every number in a why in the post, every why naming a real heading, and that no right answer sends the link to some customers only. |
| `content/blog/posts.ts` | Title "How to get more Google reviews: ask every customer on the day the job ends", seo title, excerpt, description, `updated: 2026-11-11`, cover `/images/lifestyle/beacon-main-street.jpg`. |
| `public/images/lifestyle/beacon-main-street.jpg` + `ATTRIBUTIONS.md` | Beacon's Main Street of local shops (ajay_suresh, CC BY 4.0, Wikimedia), scaled to 1920 x 1280, 472 KB; from the designer's licence-clean photo bank. |
| `content/blog/titles.test.ts` | "Google" added to the names a sentence-case title may capitalise (the file says a new name goes on the list on purpose). |
| `lib/blog/flagship.test.ts` | The pinned rail of this post, updated to the new headings and scenes. |
| `app/redirects.test.ts` | Round 24's 30 s on the three slow checks (they timed out at 5 s under load on this branch). |

## B18 (against origin/main 3aabe4a)

Live 4,265 words, 13 H2, 13 scenes; this page 4,305 words, 16 H2, 16 scenes (the gate's count); 21.5 minutes, over the
20-minute ceiling as the live post was (a WARN).

## The gates

- `review_gate.py --kind blog` on the chain copy: exit 0, 0 fails.
- The blind second reader (`final_check.py --item approval:39`, review_log): 15 reads, 13 FAIL (one to five findings
  each, every one fixed in the text), PASS on read 11 and, after the test-driven fixes, on read 15 (the final text);
  approval 39 review to checked.
- On the final tree (13:50 to 13:53 ET): `npx tsc --noEmit` exit 0; `npx vitest run --maxWorkers=2` exit 0, 172 files,
  2,471 tests; `next build` exit 0, 129 pages. The machine's commit memory was short (0.1 to 4 GB free from 13:24 ET,
  another session's load): three builds crashed in static generation and one vitest run ran out of heap; the passing
  build ran with `CIRCLE_NODE_TOTAL=2` (Next's default worker count reads it: one static worker, the same output).
- The probe at 320, 390 and 1440 on the production build: HTTP 200, scroll width = screen width, 16 scenes, 0 hidden
  reveals, console only the local `/_vercel/insights` 404, quiz 1 of 10, a wrong run 3 of 10, the right run 10 of 10,
  JavaScript off 10 items, the calculator moves, 24 rail rows none twice, one author card, broker 0, vendor names 0, em
  dashes 0, rail tone 0 under 4.5:1, the share image the Beacon cover. `sideways.mjs`: scrollX 0 at five depths at 390
  and 320. After the frames: the dek still said "the one study that measured money" and the funnel statement said "it
  will happen again this week" (an unsourced claim); both re-worded, the gate re-run (above), 390 sideways 0 again.

## Open

- The quiz's pass state (the template's) links "Talk to us about an AI assessment" to /connect.
- The hero's cold-open counter still reads "12 reviews" (the template's for this post; it matches the story).
- The cold-open photo is the template's Hudson river picture; the cover and the share image are the Beacon street.
