# Round 24 page lane: workflow automation for small business (approval 24)

2026-11-03, branch `r24-workflow` from `origin/main` 3aabe4a (the live site), worktree
`realtylt-website-r24p`. One branch per page, so his Approve on this page merges only this page.
Source: the 06:00 cycle's refresh draft
`realtylt-agents/company/agents/seo/drafts/2026-11-03-workflow-automation-real-estate-business.md`,
its second reader's 24 notes (`.review.md`, approval 24 through the panel), the brief
`company/pieces/ai/workflow-automation-real-estate-business/brief.md`, the run log
`realtylt-study/logs/seo-2026-11-03.log` (B7 holds on lines 65 and 330, the F10 warn).

## What changed

| Piece | Where | What |
|---|---|---|
| The post | `content/blog/ai-posts.ts` `WORKFLOW_AUTOMATION_POST` | Rewritten in place: the opener says what we do and what the reader learns (F10); stories set in small businesses of any kind, each labelled invented; the study's 25 min 26 sec stated as elapsed time before same-day resumption, "more than two intervening activities", never a cost per task; jobs scored for impact and risk 1 to 5 with the four checks' floors (one yes: risk at least 3, a person approves every result; two or more: at least 4, the binding part with that person alone), the wording of the published assessment post; the four kinds of step (fixed, written rule, model interpretation, a person's decision) and what stops the chain; a person approves anything a customer reads; the platform documentation narrowed to what it says (the 95 percent in 7 days default pause, errored runs in the run history, the error workflow); the safe test on a copy with test records and logins, testing the approval step too; "a suggested starting plan" for the quarterly check; the assessment's deliverable as its service page states it (a written plan); four new sections; a Sources section. |
| Its scenes | `content/blog/workflow-scenes.ts` | 14 kept (copy fixed: no platform name, the reply drafted for approval, no unsourced prevalence), 6 added: worth-it (flow), cost-shape (tiles), first-month (steps), fits (grid), roadmap (steps), quiz. Hero "4 weeks" in place of "25 minutes" (the second reader's note 3). The film is kept as rendered; its caption now says the film's reply goes out by itself and ours waits for approval. |
| Its quiz | `content/blog/workflow-quiz.ts` (+ test) | Ten questions; the test holds every `why` number to the post, every named heading to a real one, and the two corrections (elapsed time, the risk floor of 3). |
| Registration | `content/blog/posts.ts` | Title "Workflow automation for small business: which small jobs to wire first" (the target phrase), search title, excerpt, description, `updated: 2026-11-03`. Slug unchanged. |
| Tests | `lib/blog/toc.test.ts`, `app/redirects.test.ts` | The toc counts (14 H2, 6 H3); the three slow redirect checks get 30 s (they crossed 5 s with the PC at 100 percent CPU; 8 of 8 alone), the same fix round 21 made on its branch. |
| Tools | `docs/blog-r24/` | The probe (round 22's, the page named on the command line, platform names added to the vendor check), the overflow finder. |

## B18 (readingTime's count, the whitespace split of the markdown)

| | Live (origin/main 3aabe4a) | Page |
|---|---|---|
| Words | 2,793 | 4,393 ("22 min read") |
| H2 / H3 | 10 / 6 | 14 / 6 |
| Scenes | 14 | 20 |
| Rendered words in `#article-root` | not measured | 7,072 |

Not smaller on any measure. Note: the cycle measured the live post at `realtylt-website` local main 0259695, which is 31 commits behind `origin/main`; the live text on 3aabe4a is the one compared here (2,793 words, already linking `/services/ai-readiness-assessment`). The brief's 4,000-word cap is passed by 393 words: the second reader's qualifications (the scoring floors, the approval gate, the safe test) added length that cutting would have removed.

## Sources re-read on 2026-11-03

- Mark, Gonzalez and Harris, CHI 2005 (ics.uci.edu PDF, read with pypdf): 7 managers, 9 analysts, 8 developers; 25 h 42 min per person, over 700 hours; 11 min 4 sec in a working sphere; 57 percent of working spheres interrupted; 77.2 percent resumed the same day; same-day resumption 25 min 26 sec; self-resumed 21 min 28 sec (90.1 percent), externally 61 min 37 sec (9.9 percent); "more than two intervening activities occur before it is" resumed.
- The help center on error settings: "By default, Zapier automatically pauses a Zap if it hits an error 95% or more percent of the times that it has run in the last 7 days." The run status page: "If a Zap errors repeatedly each time it runs, it will automatically turn off"; a handled error does not turn it off. The visitor copy names neither platform (the brand rule); the links carry the sources.
- The error-handling docs: "For each workflow, you can set an error workflow in Workflow Settings. It runs if an execution fails ... The error workflow must start with the Error Trigger."
- Our own: `content/services/ai-audit.ts` (the assessment ends with a written plan, not a build); the scoring wording of `AI_AUDIT_POST` (the four checks, one yes and two or more).

## The second reader's 24 notes

| # | Applied? | One line |
|---|---|---|
| 1 | Applied | The opener is the outcome: less retyping, a first job with a named owner and a failure alert. |
| 2 | Applied | The forty jobs and ninety seconds inside "In this invented example"; the title no longer carries "ninety-second". |
| 3 | Applied | Elapsed time before resumption, not a cost; quiz question 2 tests exactly that. |
| 4 | Applied | The third bar "though the study measured desk work, not your reminders". |
| 5 | Applied | "Almost every", "most people", "almost nobody", "nearly every chain" removed; the first month is "in our builds". |
| 6 | Applied | Impact and risk scoring sets the order; frequency only feeds the scores; quiz question 3. |
| 7 | Applied | The floors stated: one yes at least 3, two or more at least 4. |
| 8 | Applied | Four kinds of step; what stops the chain for a person. |
| 9 | Applied | The reply is drafted and approved; the salon's confirmations drafted for her approval, a fixed one alone only on her written decision after a trial; the rebuilt chain, the FAQ and the roadmap carry the gate. |
| 10 | Applied | Labelled our screening questions; the four-line outcome brief (baseline, target, quality, owner). |
| 11 | Applied, as our method | The impact 1 or 2 rule is our assessment's verdict rule 3 (the workflow-audit skill's `references/scoring.md`), stated as "in our method"; quiz question 7 says so. The quarterly job "usually scores too low on impact". |
| 12 | Applied | The 1-in-20 chain "is not paused by that rule; its failed runs are recorded"; who hears depends on the setup. |
| 13 | Applied | The requirement: failure reported to a named owner, failed work kept, report tested. |
| 14 | Partly | No cost comparison; "in our builds ... usually running within days" stays, from our own service page's FAQ (his claim, question below). |
| 15 | Applied | Selection criteria in place of the unnamed ranking. |
| 16 | Applied | "Can break when", a chain with no judgement step needs no person, "fewer chances to type an order wrong". |
| 17 | Applied | A copy, test records, test logins; the approval step tested. |
| 18 | Applied | "A suggested starting plan", more often for a busy customer-facing chain, against the outcome brief, retries with a limit, a person still approving. |
| 19 | Applied | The section-ending commands folded into the prose; the offer scene kept (a free setting, not a booking ask; its button says "Ask for the setting"). |
| 20 | Applied | The defensive and decorative lines removed. |
| 21 | Applied | "Common questions"; the answers start with the answer. |
| 22 | Applied (visitor copy); kept (links) | No platform name in visitor copy; the body's links and the Sources lines point to the documentation without naming it. A citation is not an endorsement; the URLs show the domain on hover. |
| 23 | Applied | The assessment's deliverable is the written plan its page states; "checked by Levan" is his desk step before main, as on every page. |
| 24 | Applied | The live post on origin/main was the baseline; every live section kept; no figure the audit could not extract. |

## The gate (2026-11-03, on cc52d92; the push adds only this NOTES file)

- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: exit 0, 172 files, 2,471 tests passed, 0 failed (an earlier full run at 100 percent CPU had five 5-second timeouts in `components/design-system.test.ts` and `lib/dark-surfaces.test.ts`; both files 24 of 24 alone; the re-run on the committed tree green with no change).
- `next build`: exit 0, 129 of 129 pages.
- The probe (`PROBE_SLUGS=wf:workflow-automation-real-estate-business node docs/blog-r24/probe.mjs http://127.0.0.1:3124 docs/blog-r24/shots-wf2`, exit 0, `shots-wf2/report.json`): HTTP 200 at 320, 390 and 1440; scrollWidth equals innerWidth at all three; 20 scenes, 0 hidden reveals; smallest scene text 11 px (the in-short eyebrow, as on the live template); the first paragraph is the opener; console: only `/_vercel/insights/script.js` (404 off Vercel); the quiz at 390 "1 of 10", choices 358 px wide, a wrong-answer run fails 0 of 10, the right-answer run passes 10 of 10 ("The galaxy is out and the brain is lit", link to /connect), JavaScript off 10 items and 10 `<details>`; the calculator headline moved $7,800 to $33,800 with the first slider; "22 min read", 24 rail rows, none twice, the phone sheet matches the rail; one author card; footer info@ and (914) 415-7185; vendor names 0, em dashes 0, "Editor:" 0, the AI line present; rail tone 0 steps under 4.5:1 at 390, 1440 and 1680.
- `MSYS_NO_PATHCONV=1 node docs/blog-r24/overflow.mjs http://127.0.0.1:3124 /blog/workflow-automation-real-estate-business 320`: exit 0; the only elements past the edge are the rebuilt-chain diagram's SVG nodes inside its own horizontal scroller ("Scroll to follow the chain"), the live template's design; the page itself does not scroll sideways.

## The frames (looked at, `shots-wf/` and `shots-wf2/`, git-ignored)

The tops at 1440 and 390 (the "4 weeks" hero on the Orange County river photo, the H1 in sentence case), the worth-it flow at 390 (five gates, the tray, the verdict, the example), the rebuilt chain at 320 (the scroller), the cost tiles, the roadmap, the quiz pass state at 390. What looking changed: the rebuilt chain's heading said "with nobody in the middle of it" while the reply now waits for a person (rewritten); the flow example and the roadmap close carried a second "invented" label under the template's own "An invented example, not data" (removed).

## Open for him or the orchestrator

- The film says the reply goes out by itself; the page says a person approves it. The caption names the difference. Re-cut line 6 of `scripts/film/workflow/vo.mjs` (his voice clone, an ElevenLabs render: a paid generation, his word) or keep.
- "In our builds, a simple chain is usually running within days": from our own service page; his confirmation.
- The two platforms are linked but not named: fine, or name them in the Sources list.
- The hero photo is still `counties/orange.jpg` (a Hudson landscape) and the cover `lifestyle/financing.jpg`; neither changed.
