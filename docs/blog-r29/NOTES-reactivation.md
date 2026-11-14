# Round 29 refresh lane B: the database reactivation post, re-aimed at local business owners

2026-11-14, branch `r29-posts-b` from `origin/main` 3aabe4a, worktree `realtylt-website-r29b`. His order of 2026-11-11 and
2026-11-14. The slug is kept.

## Why the SEO agent's draft of 2026-11-05 was blocked (read first, not repeated here)

The agent's own log (`seo-2026-11-05.log`, step 7) says: brand check FAIL, F5, "a dollar figure on a public piece (no price
on any page or post)" at the $500 statutory damages line (and, before the polish rounds, $53,088); its draft's `.review.md`
by the second family lists 35 notes: unsourced prevalence and timing claims, the NAR exhibit never read, a 2023 to "three
years" timeline that did not add up, a vendor's opt-out threshold, a price discussion, internal production notes in the text.
This page: no figure in digits anywhere in the text, no vendor named, no price, no percentage without a source read today,
the NAR figures taken from the 2026 release itself, every legal statement quoted from the regulation or statute read today.

## What changed

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` DATABASE_REACTIVATION_POST | Title on "how to follow up with old leads"; opener with what we do and what the page teaches; an invented heating-company story (a furnace tune-up); added "What is database reactivation?", "How do you follow up with old leads?", "Is it worth automating at all?", "Who this fits, and who it does not", "What to do first", the quiz and four FAQs; the rules section rewritten from the regulation's words with an invented worked count by channel; email and 10DLC added with sources; the price paragraph, the vendor threshold, the FTC ceiling and every unsourced rate removed. |
| `content/blog/reactivation-scenes.ts` | In-short, the NAR chart (the 2026 release replaces the 2025 exhibit), the four moves, the consent checks, the teardown (a furnace tune-up replaces the real estate valuation), failure modes, calculator (average job, booked jobs), funnel and hero re-aimed; new scenes fits, roadmap, quiz. The film scene is kept as it is: it shows a real estate CRM record (one example among several). |
| `content/blog/reactivation-quiz.ts` (+ test) | Ten questions; the test holds ten, four distinct choices, every number in a why in the post, every why naming a real heading, and that no right answer treats a list as contactable on a hunch. |
| `content/blog/posts.ts` | Title, seo title, excerpt, description, `updated: 2026-11-14`. Cover unchanged. |

## B18 (against origin/main 3aabe4a)

Live 2,837 words, 10 H2, 13 scenes; this page 3,854 words, 13 H2, 16 scenes (the gate's count).

## The gates

- `review_gate.py --kind blog` on the chain copy: exit 0, 0 fails.
- The blind second reader (`final_check.py --item approval:102`): 5 reads, 4 FAIL (one to four findings each, all fixed in
  the text), PASS on read 5; approval 102 review to checked.
- `npx tsc --noEmit` exit 0; vitest on the files this branch touches (flagship, the quiz, titles) green.
- Probe at 320, 390 and 1440 on `next dev` (port 3122): HTTP 200, page scroll width = screen width (the revival-path diagram is its own 752 px scroller, as on the live page), 16 scenes, 0 hidden reveals, console only the local `/_vercel/insights` 404, quiz fail and pass states, calculator moves, one author card, broker 0, vendor names 0, em dashes 0. `sideways.mjs`: scrollX 0 at five depths at 390 and 320. The probe's rail count read 0 once (it reads before hydration); a read after 4 seconds gave 23 rows, none twice. The NAR chart scene went from the light to the dark band after its labels read faintly in the frame.

## Open

- The film (49 seconds) and its caption ("a licensed clone of my own voice") are the live real estate film, unchanged.
- The statements are federal only. New York law is not covered (no source read); the page says so.
