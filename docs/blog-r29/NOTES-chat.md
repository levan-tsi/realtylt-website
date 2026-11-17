# Round 29 refresh lane A: the AI chat post, re-aimed at local business owners

2026-11-14, branch `r29-posts-a` from `origin/main` 3aabe4a, worktree `realtylt-website-r29a`. His order of 2026-11-14: "this
redone has to be the best ones ... to bring organic traffic. For the business owners". The slug is kept.

## What changed

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` AI_CHAT_ASSISTANT_POST | Title phrase "ai chatbot for small business" (the real estate phrases that already get impressions stay in the description, the opener and the FAQ: "ai chatbot for real estate", "live chat for real estate", "real estate chat"); the opener says what we do and what the page teaches; the story is a furnace in Fishkill at twenty to midnight (an invented example); the examples a heating and cooling company, a salon, a piano tuner, a dental, accounting or insurance office, a real estate office as one of them; HBR 2011 kept for the argument with its 2,241-company audit added; added "Is it worth automating", "Who this fits, and who it does not", "What to do first" (with the assessment interview), the quiz, Sources; "What it costs, and how long it takes" became "What it takes to run" (no price); the airline chatbot decision of 2024 (who owns a chatbot's answer) and the Census Bureau's May 2026 AI-use survey added; six owner questions added to the FAQ (what is it, do I need one, cost, live chat vs AI chat, real estate, ...), the live MLS question kept; unsourced claims cut (the ten million visitors line of the California law, the WCAG quotation: two refused sites, listed for the orchestrator's browser; "hundreds of pages", "most of your visitors", delivery times); the closing is the free website door (CTA-2 version D in plain text, without the count "five"). |
| `content/blog/ai-chat-scenes.ts` | The teardown is the furnace conversation, booked from the live calendar and texted; the four moves, the failure cards, the in-short, the plate caption, the system diagram and the funnel re-aimed; the calculator stops at conversations a year (the commission input and the 5 percent close rate removed); three new scenes: fits, roadmap, quiz; heading labels. The film stays (a real estate example, said in its caption). |
| `content/blog/chat-quiz.ts` (+ test) | Ten questions from the post; the test holds ten, four distinct choices, every number in a why in the post, every why naming a real heading, and that the right answer to the unknown question offers a person. |
| `content/blog/posts.ts` | Title, seo title, excerpt, description, `updated: 2026-11-14`; the cover stays `lifestyle/buying.jpg`. |
| `lib/blog/flagship.test.ts`, `lib/blog/toc.test.ts` | The pinned rail, section and question counts of this post, and its FAQ list. |
| `docs/blog-r29/` | Round 28's probe (the quiz and rail waits lengthened for `next dev`), sideways, look, overflow. |

## B18 (against origin/main 3aabe4a)

Live 3,044 words, 10 H2, 14 scenes (the gate's count); this page 4,664 words, 13 H2, 17 scenes; 23.3 minutes, over the 20-minute
ceiling as round 28's pages were (a WARN).

## The gates

- `review_gate.py --kind blog` on the chain copy: exit 0, 0 fails.
- The blind second reader (`final_check.py --item approval:31`): 12 reads, 11 FAIL (one to four findings each, all fixed in
  the text) then PASS on read 12; approval 31 review to checked.
- `npx tsc --noEmit` exit 0; vitest on this post's files (`chat-quiz.test.ts`, `flagship.test.ts`, `toc.test.ts`,
  `titles.test.ts`, `zombie-claims.test.ts`) green; the full run and `next build` are the orchestrator's.
- The probe at 320, 390 and 1440 on `next dev -p 3121`: HTTP 200, scroll width = screen width, 17 scenes, 0 hidden reveals,
  quiz 1 of 10 / 6 of 10, JavaScript off 10 items, the calculator moves, 22 rail rows none twice, one author card, broker 0,
  vendor names 0, em dashes 0, rail tone 0 under 4.5:1; `sideways.mjs` scrollX 0 at 390 and 320. Console: only the local
  `/_vercel/insights` 404. The system diagram's own width (752 px) is its scroll container, as before.

## Open

- w3.org (WCAG 2.2) and FindLaw's section 17940 refused the script: the WCAG quotation and the ten-million-visitors definition
  are out of the text until read in the orchestrator's browser.
- The cover is still the house photograph.
