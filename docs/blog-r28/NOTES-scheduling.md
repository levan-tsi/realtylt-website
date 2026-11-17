# Round 28 refresh lane: the AI scheduling post, re-aimed at local business owners

2026-11-11, branch `r28-schedule` from `origin/main` 3aabe4a, worktree `realtylt-website-r28`. His order of 2026-11-11:
the AI posts are for business owners, a real estate office one example among several. The slug is kept. Base: the SEO
agent's refresh draft of 2026-11-08, its second reader's notes, and the live post.

## What changed

| Piece | What |
|---|---|
| `content/blog/ai-posts.ts` AI_SCHEDULING_POST | Title phrase "AI scheduling assistant"; the opener says the owner's problem, what we do and what the page teaches in the first 60 words; the story a plumber's Saturday repair in a managed building (the apartment's owner, the building manager, the tenant owed notice); the examples a contractor, a cleaning firm, a dental office with an interpreter, a salon with a visiting stylist, a gym, a tutoring agency, a picture framer, a home inspector and a real estate office as one of them; the headings "Who has to say yes before an appointment is real" and "What an AI scheduling assistant can honestly do across calendars it does not own"; added "Is it worth automating", "Who this fits, and who it does not", "What to do first", the quiz and two FAQs (the first message to the customer, the chase); "Can it stop a double booking?" answered without a promise; the calendar platform's "fine-tuned, identical inputs may differ" line removed (not on the page read today); PEARL described as a research paper, not a benchmark; the closing line goes to the quiz (CTA-2 section 4, version B), plain text until the address answers. |
| `content/blog/scheduling-scenes.ts` | The staged exchange is the plumber's assistant and the building manager (was the listing side and a buyer); the four permission cards (the place, the way in with a super, the professionals on a bigger job, a real estate closing named once); the calculator's hints and options; the offer and funnel texts; the calculator note's unsourced line about a showing platform's index removed; four new scenes: worth-it, fits, roadmap, quiz; heading labels for the renamed and new headings. |
| `content/blog/scheduling-quiz.ts` (+ test) | Ten questions from the SEO agent's draft; the test holds the usual checks and that no right answer teaches that silence or a delivered message confirms. |
| `content/blog/posts.ts` | Title "AI scheduling assistant for appointments other people must confirm", seo title, excerpt, description, `updated: 2026-11-11`. The cover stays the live one (a clock, an object plate: B17 warns; no licence-clean photo of people at work was in the photo bank). |
| `app/redirects.test.ts` | Round 24's 30 s on the three slow checks. |

## B18 (against origin/main 3aabe4a)

Live 4,000 words, 13 H2, 16 scenes; this page 4,058 words, 16 H2, 20 scenes (the gate's count); 20.3 minutes (a WARN).

## The gates

- `review_gate.py --kind blog` on the chain copy: exit 0, 0 fails.
- The blind second reader (`final_check.py --item approval:37`, review_log): 5 reads, 4 FAIL (each fixed in the text),
  PASS on read 5; approval 37 review to checked.
