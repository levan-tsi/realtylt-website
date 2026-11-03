# Round 24 page lane: the final walk-through checklist (approval 22)

2026-11-03, branch `r24-walkthrough` from `origin/main` 3aabe4a, worktree `realtylt-website-r24p`.
One branch per page. Source: the Nov 2 refresh draft
`realtylt-agents/company/agents/seo/drafts/2026-11-02-final-walk-through-checklist.md`, its second
reader's 15 notes (approval 22 through the panel), the brief
`company/pieces/realtylt/final-walk-through-checklist/brief.md`, the run log
`realtylt-study/logs/seo-2026-11-02.log` (the two B7 holds: line 74, the "usually the day of
closing or the day before" timing; line 207, the "30 minutes ... an hour or more" durations), and
its three `*Editor:` lookups (the Senate page for GOL 5-1311; no first-hand note from Levan; the
printable PDF not built).

## What changed

| Piece | Where | What |
|---|---|---|
| The post | `content/blog/real-estate-posts.ts` `FINAL_WALK_THROUGH_POST` | Rewritten in place and built as a flagship (it had no scenes): the opener the second reader asked for; "does not replace the inspection" in place of "does not reopen"; the risk-of-loss rule restated against the statute's text (eminent domain added, the immaterial case as "the contract still stands and the price is reduced"); timing as advice (as close to closing as practical, after the move-out, read the contract), no typical duration and no "the seller is normally not present" (no named source found: both B7 holds resolved by removing the figure, the argument kept); air conditioning "if the weather allows", its instructions first, a system that cannot be tested noted for the attorney; "broom clean" on the 2020 Penfield court's reading as reported (Smith, Gambrell and Russell, December 16, 2020); the remedies as possible, negotiated, agreed by both sides, and the lender told; "a suggested planning schedule" with the contract's dates first; the Closing Disclosure's three business days (CFPB); "the short list to print and carry" in place of "one-page" (no PDF exists); the FAQ answers to match; a Sources section with read dates. |
| Its scenes | `content/blog/walkthrough-scenes.ts` (new) | 10: jobs (tiles), loss (tiles, the statute's two cases), fits (grid), timing (steps), groups (tiles), broom (tiles), problem (steps), roadmap (steps), bag (grid), quiz. Hero "3 jobs" on the existing cover. |
| Its quiz | `content/blog/walkthrough-quiz.ts` (+ test) | Ten questions, the porch light on a pass; the test also holds that no question asks for a duration and that the post prints no typical duration. |
| Registration | `content/blog/posts.ts` | Title "Final walk-through checklist for New York buyers: what to test before closing", excerpt, description (151 characters), `updated: 2026-11-03`, `flagship`. Slug, date and aliases unchanged. |
| Tests | `lib/blog/flagship.test.ts` | The post added to the topic content contract table. |

## B18

| | Live (origin/main 3aabe4a) | Page |
|---|---|---|
| Words | 1,119 | 2,803 ("14 min read") |
| H2 / H3 | 7 / 10 | 9 / 12 |
| Scenes | 0 | 10 |

## Sources read on 2026-11-03

- GOL 5-1311: nysenate.gov answered 403 to the script (as on 2026-10-31); Justia 403 too. FindLaw's copy, "Current as of January 01, 2026", read: 1(a) before title or possession, destroyed without the purchaser's fault or taken by eminent domain, a material part: the vendor cannot enforce and the purchaser recovers what was paid; an immaterial part: neither is deprived of the right to enforce, with an abatement of the price; unless the contract expressly provides otherwise. THE OFFICIAL SENATE PAGE IS A QUESTION FOR THE ORCHESTRATOR'S CHROME READ.
- Broom clean: Smith, Gambrell and Russell, "Court Answers an Existential Question: How Clean is 'Broom Clean'?", December 16, 2020, on Witter v. Nitschke, Penfield Town Justice Court (small claims): "free of garbage, refuse, trash, and other debris at the time of surrender"; "does not impose the duty on the seller to have the property professionally cleaned"; "Courts have concluded that property is not 'broom-clean' if the sellers fail to remove their possessions". The decision itself is on nycourts.gov (2020 NY Slip Op 20323, from the search result), which refuses scripts: A QUESTION FOR THE CHROME READ.
- CFPB, "What is a Closing Disclosure?": "at least three business days before you close"; compare with the Loan Estimate; last reviewed May 2, 2023 (a script got 403; read through WebFetch).
- NYSBA LegalEase, the attorney's role: the closing date and "the required physical condition of the property" among the attorney's questions; nothing on the walk-through itself.
- Searched for a named source on the walk-through's typical timing, length and attendance (government and lender pages): none found; vendor and portal blogs only, not used.

## The second reader's 15 notes

| # | Applied? | One line |
|---|---|---|
| 1 | Applied | The two outcome lines open the page; the definition follows. |
| 2 | Applied | "Too many buyers treat as a formality" gone. |
| 3 | Applied | "Does not replace the inspection ... ask your attorney what your contract allows", and the counter example rewritten. |
| 4 | Applied | No duration anywhere; the FAQ says why; quiz question 4 replaced. |
| 5 | Applied | Timing and attendance as advice around the contract; broom clean sourced; "Six questions" never printed (the FAQ has no count). |
| 6 | Applied | "Whatever the season" gone; the instructions and the attorney note, in the list and the short list. |
| 7 | Applied | "Most" gone; possible, negotiated, both sides agree, the lender may have to approve. |
| 8 | Applied | "A suggested planning schedule; it is not a legal timetable"; the one legal deadline (the Closing Disclosure) sourced. |
| 9 | Applied, with a question | Checked against FindLaw's copy, current January 1, 2026; the Senate page needs the Chrome read. |
| 10 | Applied | "One-page" gone; no PDF promised (the designer's sheet stays open). |
| 11 | Not on the page | The `written_by` frontmatter and the INPUT/THE SHAPE notes are the draft's, never published. |
| 12 | Not applied | The porch light is the owner's quiz motif for RealtyLT (his rule of 2026-10-31); the pass line says it in plain words too. |
| 13 | Applied | The live post on origin/main was the baseline: every section and fact kept or replaced with a dated source. |
| 14 | As on every page | "Checked by Levan" is his desk step before main. |
| 15 | Instrument | THE TEACHING applies to the AI line; this is a RealtyLT buyer guide. |

## The gate (2026-11-03, on 35a7359; the push adds only this NOTES file)

- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: exit 0, 172 files, 2,486 tests passed, 0 failed (the 15 new: the walk-through quiz file and the post in the topic contract table).
- `next build`: exit 0, 129 of 129 pages.
- The probe (`PROBE_SLUGS=wt:final-walk-through-checklist`, exit 0, `shots-wt/report.json`): HTTP 200 at 320, 390 and 1440; scrollWidth equals innerWidth at all three; 10 scenes, 0 hidden reveals; smallest scene text 12 px; the first paragraph is the opener; console only the `/_vercel/insights` 404; the quiz at 390 "1 of 10", a wrong run fails 2 of 10, the right run passes 10 of 10 ("The porch light is on", "Talk to Levan" to /connect), JavaScript off 10 items and 10 `<details>`; "14 min read", 17 rail rows, none twice, the sheet matches; one author card; footer info@ and (914) 415-7185; vendor 0, em dashes 0, "Editor:" 0, broker 0, the AI line present; rail tone 0 under 4.5:1 at 390, 1440, 1680. Rendered words in `#article-root` 3,761.
- `overflow.mjs ... /blog/final-walk-through-checklist 320`: "nothing past the edge", exit 0.

## The frames (looked at, `shots-wt/`, git-ignored)

The 1440 top ("3 jobs" on the cover, the H1 in sentence case, the dek); the loss tiles at 320; the timing steps and the problem steps at 390; the quiz pass state at 390 (the porch light). Nothing needed changing from the frames; two scene lines had echoed body sentences (the contract test caught them) and three quiz choices too, rewritten before the gate.

## Open for him or the orchestrator

- The orchestrator's Chrome read: https://www.nysenate.gov/legislation/laws/GOB/5-1311 (confirm the text matches the FindLaw copy) and the Witter v. Nitschke decision on nycourts.gov (2020 NY Slip Op 20323), both saved beside the piece in `sources-browser/`.
- His own practice, if he wants it on the page: how long his buyers' walk-throughs take, and whether the seller attends (the page now says "ask your agent").
- The cover and hero `listings/house-11.jpg` ("Parrrington House", chuck b., CC BY 2.0, from the live page): not a New York house; a licensed New York house front (the D1 lane's White Plains photo, CC BY 4.0) would fit.
- The printable PDF of the short list (the designer's), then a link on the page.
