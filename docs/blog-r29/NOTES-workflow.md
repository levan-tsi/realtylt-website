# Round 29 refresh lane A: the workflow automation post, re-aimed at local business owners

2026-11-14, branch `r29-posts-a` (cut from `origin/main` 3aabe4a), worktree `realtylt-website-r29a`. His order of 2026-11-14:
"this redone has to be the best ones ... to bring organic traffic. For the business owners". The slug is kept.

BASE: `origin/r24-workflow` (round 24's page, which his click of 2026-11-11 approved on a preview page that was never merged:
approval row 24 is `pushed`). Its post, scenes (20), quiz and test are carried verbatim, then changed as below. Approval row 24
is NOT touched by this lane: the orchestrator decides what happens to it.

## What changed on top of round 24

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` WORKFLOW_AUTOMATION_POST | Opener names the owners (a roofer, a plumbing or heating company, a dental, accounting or insurance office, a salon, spa or gym, a real estate or title office) and the quotes nobody follows up, without a promised outcome; new section "How to follow up on every quote without chasing it" (a roofer; the day-3 note is DRAFTED and approved by the owner, day 7 puts a call on the owner's list; 10 x 2 x 4 = 80 minutes a week, invented; what the owner gets, provides and approves, what it does not do; HBR 2011 for the direction on speed) and a scene of the same wiring in six kinds of business; new section "What the AI readiness assessment hands over"; "What it costs, and how long it takes" became "What it takes to run" (no price, no delivery time); three owner questions (how do I follow up on quotes automatically, what should a small business automate first, what is workflow automation for a real estate or title office; the Search Console phrases "title company workflow automation" and "real estate workflow automation" stay served); the one-person answer carries the Small Business Administration's 2026 figure; the closing line goes to the quiz (CTA-2 version B, plain text). Cut for the blind reader: the other platform's error-workflow paragraph (its URL trips the vendor-name check, F8), the 700-hour total (the paper's own 700 does not match 24 x 25 h 42 min, a source discrepancy), delivery times, exceptions to the approval rule, "Go and get the highlighter". |
| `content/blog/workflow-scenes.ts` | Round 24's 20 scenes plus quote-chain (diagram) and by-trade (grid); in-short, cost tiles, funnel footnote and the watchable-rules card re-aimed; heading labels for the new and renamed headings. |
| `content/blog/workflow-quiz.ts` (+ test) | Round 24's quiz; question 5 became the quote chain's day 7. |
| `content/blog/posts.ts` | Title "Workflow automation for small business: follow up every quote, then wire the next job", seo title, excerpt, description, `updated: 2026-11-14`. |
| `lib/blog/toc.test.ts` | Counts: 16 H2, 9 H3, 25 in all. |

## B18 (against origin/main 3aabe4a)

Live 2,766 words (the gate's count), 10 H2, 14 scenes; round 24's page 4,393; this page 5,144 words (the gate's count), 15 H2,
22 scenes; 25.7 minutes, over the 20-minute ceiling as round 24's page was (a WARN).

## The gates

- `review_gate.py --kind blog` on the chain copy: exit 0, 0 fails.
- The blind second reader, run WITHOUT `--item` (approval 24 is decided by him and is not touched): 6 reads, 5 FAIL then PASS on read 6.
- `npx tsc --noEmit` exit 0; vitest on this post's files green; the full run and `next build` are the orchestrator's.
- The probe at 320, 390 and 1440 on `next dev -p 3121`: HTTP 200, scroll width = screen width, 22 scenes, 0 hidden reveals once
  hydrated (the first 1440 pass ran before hydration: re-checked with `dbg2`-style wait, none hidden), quiz 1 of 10 / 6 of 10,
  JavaScript off 10 items, the calculator moves, one author card, broker 0, em dashes 0; `sideways.mjs` scrollX 0 at 390 and 320.
  The diagram scenes (rebuilt chain, quote chain) are 752 px wide inside their own scroller, as before.

## Open

- The film says the reply goes out by itself; the page says a person approves it (round 24's open item, still true).
- The site header shows (914) 415-7185 while BRAND says (914) 875-2424 (a shared component, not changed here).
