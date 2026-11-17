# Round 29 refresh lane A: the appointment booking post, re-aimed at local business owners

2026-11-14, branch `r29-posts-a` (cut from `origin/main` 3aabe4a), worktree `realtylt-website-r29a`. His order of 2026-11-14:
"this redone has to be the best ones ... to bring organic traffic. For the business owners". The slug is kept; the post ranks
position 3.0 for "how to reduce no shows" (the audit's Search Console read), so the phrase moves into the title, the opener and a heading.

## What changed

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` AI_APPOINTMENT_BOOKING_POST | Title phrase "how to reduce no-shows"; the opener says what we do and what the page teaches; the story is a landscaper's estimate visit in Wappingers Falls, nine days out (an invented example, the Delavan showing is gone); the examples a roofer, a salon, a piano tuner, a dental or accounting office, a real estate office as one of them; new "How to reduce no-shows: three moves"; a 2026 source added (a systematic review and meta-analysis of 10 randomised trials, 8,236 people, March 6, 2026: attendance 11 percent higher with reminders, risk ratio 1.11, 95% CI 1.05 to 1.19; text alone 1.14 with an interval of 0.99 to 1.31, said plainly), the 2015 clinic study and the 2008 trial kept for the argument with their years; added "Is it worth automating" (a salon: 30 appointments, 3 no-shows, 3 x 52 = 156 empty slots, 117 hours a year, invented; a roofer at one miss a month leaves it alone), "Who this fits, and who it does not", "What to do first" (with the assessment interview), the quiz and Sources; "What it costs, and how long it takes" became "What it takes to run" (no price; the per-message billing line, unsourced, is gone); the heading "The gap nobody measures, because it does not look like a loss" became "The gap between the ask and the day does not look like a loss" (the post then cites a study that measured it); owner questions added (how do I reduce no-shows, what is a good no-show rate, what should a confirmation and reminder text say: the Search Console phrase "no-show reduction confirmation texts" stays served); the closing line goes to the quiz (CTA-2 version B, plain text). Cut as unsourced or promissory: "almost nobody tracks", the beach no-show line, "the first thing people switch off", the under-three-days cutoff. |
| `content/blog/booking-scenes.ts` | The staged exchange is a patio estimate (the homeowner, the assistant, an estimator, the reminder at noon on the day); the why-they-drop grid, the plate caption, the calculator note, the failure cards, the in-short, the funnel re-aimed (no commission or listing figure; the calculator was already trade-neutral); three new scenes: fits, roadmap, quiz; heading labels. |
| `content/blog/booking-quiz.ts` (+ test) | Ten questions from the post; the test holds ten, four distinct choices, every number in a why in the post, every why naming a real heading, and that the carry-over answer is the direction, never the percentages. |
| `content/blog/posts.ts` | Title "How to reduce no-shows: AI appointment booking and reminders for a local business", seo title, excerpt, description, `updated: 2026-11-14`; the cover stays `counties/rockland.jpg`. |
| `lib/blog/flagship.test.ts` | The pinned rail of this post. |

## B18 (against origin/main 3aabe4a)

Live 3,628 words (the gate's count), 12 H2, 14 scenes; this page 4,314 words, 16 H2, 17 scenes; 21.6 minutes, over the 20-minute ceiling as the live post's neighbours were (a WARN).

## The gates

- `review_gate.py --kind blog` on the chain copy: exit 0, 0 fails.
- The blind second reader: 8 reads (6 FAIL, 2 PASS); approval 92 (the SEO cycle's own draft of 2026-11-13, in `review`; this page took the row over through the SOP upsert) review to checked.
- `npx tsc --noEmit` exit 0; vitest on this post's files and `app/blog` green; the full run and `next build` are the orchestrator's.
- The probe at 320, 390 and 1440 on `next dev -p 3121` (its waits lengthened to 15 s for the dev server's slow hydration): HTTP 200, scroll width = screen width, 17 scenes, 0 hidden reveals, quiz 1 of 10 / 9 of 10, JavaScript off 10 items, the calculator moves, 24 rail rows none twice, rail tone 0 under 4.5:1; `sideways.mjs` scrollX 0 at 390 and 320. Console: only the local `/_vercel/insights` 404. The booking path diagram is 752 px wide inside its own scroller, as before.

## Open

- The two house photographs (the empty curb and the evening visit) are the live post's plates; the cover is the Harriman landscape.
- FCC and eCFR (consent for reminder texts) refused the script: no consent or TCPA claim is in the text; it says only what our setup does.
