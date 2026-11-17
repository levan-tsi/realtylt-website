# Round 28 refresh lane: the AI voice agent post, re-aimed at local business owners

2026-11-11, branch `r28-voice` from `origin/r24-voice-agent` 900b34f (his Approve of 11-11 11:26 is on that page; it was
never merged: origin/main is still 3aabe4a). Worktree `realtylt-website-r28`. His order of 2026-11-11: the AI posts are
for business owners, a real estate office one example among several. The slug is kept.

## What changed

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` AI_VOICE_AGENTS_POST | The opener is an owner's problem in an owner's words ("When the phone rings while your hands are full ..."), the target phrase "ai voice agent for small business" and "Below is ..." in the first 60 words; the 9:42 story is a roof-leak call to a roofer; the examples are a roofer, a plumber's water heater, a dental office, an accounting office, a salon, a gym, a heating and cooling company and a real estate office as one of them; the heading "What an AI voice agent for small business does"; the FAQ "for a small business" and "Does it take over the front desk?" (no: it takes the repeatable first contact off the desk); the "under a second" figure removed (the second reader: a promised response time with no test behind it); the self-check in "What to do about it" written as a description, not a second ask; the closing line is the quiz (CTA-2 section 4, version B), as plain text: the address does not answer yet; the sources re-read 2026-11-11 (HBR and PNAS kept for the argument, with links). |
| `content/blog/voice-agent-scenes.ts` | The teardown is the roof-leak call (the service area answered from the record, the cost refused, a visit booked); the four moves and the outbound grid without listings, price drops or open houses; the call path "Your services"; the calculator without the commission input and the 5 percent close rate: it stops at conversations a year (headline 3); the plate caption, the fits grid, the worth-it example and the funnel footnote re-aimed; the heading label for the renamed heading. The film (a real estate call, his licensed voice) is kept as rendered: it is the real estate example. |
| `content/blog/voice-quiz.ts` | The header comment only; the ten questions were already for any owner. |
| `content/blog/posts.ts` | Title "AI voice agent for small business: answering the calls an owner misses", seo title, excerpt, description, `updated: 2026-11-11`. |
| `docs/blog-r28/` | The round's probe (round 24's, its calculator reader fixed to read counts as well as dollars: the instrument read an empty string on a count headline), `look.mjs`, `sideways.mjs`, `blame3.mjs` (walks the DOM to the element that widens the page). |

## B18 (against origin/main 3aabe4a, `realtylt-website-r28live`)

Live 2,564 words, 10 H2, 15 scenes; this page 4,485 words, 13 H2, 20 scenes (the gate's count). Over the 20-minute
ceiling (22.4 minutes): a WARN, as the round-24 page was (4,572 words).

## The gates (the tree at 900b34f plus these changes; the commit adds only this file)

- The SOP's code gate `review_gate.py --kind blog` on the chain copy `company/pieces/ai/<slug>/post.md` (written from this
  page by `runs/r28-refresh/to_post.py`): exit 0, 0 fails.
- The blind second reader (`final_check.py`, gpt-6.1-sol): four passes, one finding each (the AB 2905 read date; the
  self-check read as a second ask; the opener as a real scenario and "under a second" as a promise), each fixed in the
  text; pass 5 PASS on the final text.
- `npx tsc --noEmit` exit 0; `npx vitest run` exit 0, 172 files, 2,472 tests; `next build` exit 0, 129 pages.
- The probe at 320, 390, 1440 on the production build (127.0.0.1:3110): HTTP 200, scroll width = screen width, 20 scenes,
  0 hidden reveals, console only the local `/_vercel/insights` 404, quiz 1 of 10, a wrong run 3 of 10, the right run 10 of
  10, JavaScript off 10 items, the calculator moves (90 to 432 a year with the first slider), 26 rail rows none twice,
  one author card, broker 0, vendor names 0, em dashes 0, rail tone 0 under 4.5:1. `sideways.mjs` at 390 and 320:
  scrollX 0 at five depths (a first build scrolled 63 px at 390: two bare URLs in Sources; now short links).

## Open

- The quiz's pass state (the template's, every AI post) links "Talk to us about an AI assessment" to /connect; when
  `realtylt.com/ai/assessment` answers, the closing lines and that link should point at it.
- AB 2905 (leginfo answered 403) and the official NY and CA statute pages: the orchestrator's browser.
