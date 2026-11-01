# Round 21 page lane: two refreshed posts from the agents' content chain

2026-11-01, branch `r21-blog-preview` (from `origin/main` 3aabe4a, the live site). The agents'
content chain drafted two refreshes, a second reader (the other model family) wrote 17 items on
each, and the final check held both: the investing post on unsourced town claims, the timeline
post on the code gate's B8 (an inspection-timing sentence that read as an unmarked example). This
lane built both as flagship pages at their existing addresses, in the round 14 to 17 method: the
constant rewritten in place, a scenes file and a quiz data file (+ test) per post, the scene lines
of each draft turned into the scene kinds the template supports, dated primary sources.

## Preview URLs (after the push)

- https://realtylt-website-git-r21-blog-preview-levans-projects-a543d940.vercel.app/blog/best-places-to-invest-hudson-valley
- https://realtylt-website-git-r21-blog-preview-levans-projects-a543d940.vercel.app/blog/timeline-selling-a-house-ny

## What changed

| Piece | Where | What |
|---|---|---|
| Investing post | `content/blog/investing-posts.ts` `BEST_TOWNS_POST` | Opener rule; 11 teaching sections + Next step + Sources; every town claim now carries a dated primary source or became a per-building test; Kingston rewritten on the June 18, 2025 Court of Appeals ruling and the city's 2025 survey; HUD FY2027 figures left as editor's notes (below). |
| Its scenes | `content/blog/best-towns-scenes.ts` | 12 scenes: strategies (grid), fit (grid), fmr (steps: how to read a Fair Market Rent), poughkeepsie (tiles), beacon (flow: the street-level test), white-plains (tiles), kingston-vacancy (bars, by year and by building size, the 5% line), kingston-timeline (steps), newburgh (grid), numbers (calculator: rent x share kept x 12), first-month (steps), quiz. Hero "5 towns", the post's cover photo. |
| Its quiz | `content/blog/best-towns-quiz.ts` (+ test) | Ten questions, porch light on a pass. |
| Timeline post | `content/blog/seller-posts.ts` `SELLING_TIMELINE_POST` | Opener rule; the five phases kept with all 17 subsections; disclosure facts and the real form now match the seller disclosure post; B8 fixed with the bar association's own words; binding moment, binder warning, appraisal rule, FHA repairs, OneKey MLS counties and Form TP-584 sourced. |
| Its scenes | `content/blog/timeline-scenes.ts` | 11 scenes: glance (steps, our typical ranges, labelled), week-one (tiles, with the 56-question form), offers (grid), contract-path (steps), after-contract (flow: three questions, not a fixed sequence), closing-folder (tiles), blueprint (summary), first-month (steps), fit (grid), quiz, talk (offer). Hero "5 phases". |
| Its quiz | `content/blog/timeline-quiz.ts` (+ test) | Ten questions, porch light on a pass. |
| Registration | `content/blog/posts.ts` | Both entries: `flagship`, `updated: 2026-11-01`, the draft's titles (target phrases), new excerpts and search descriptions (155 characters each). Slugs and aliases unchanged. |
| Tests | `lib/blog/flagship.test.ts` | Both posts added to the topic content contract (every marker has a payload, no echo of a body sentence, labels, bands, quiz shape, rail without repeats). |
| Tests | `lib/blog/zombie-claims.test.ts` | The retired "73%" pattern matched Kingston's 3.73% (a decimal); it now skips a number preceded by a digit or a point. |
| Tools | `docs/blog-r21/probe.mjs`, `overflow.mjs`, `.gitignore` | The round's probe (round 16's, narrowed to these two pages); the element-past-the-edge finder; shots ignored. |

## The numbers (readingTime's own count: whitespace split of the markdown)

| | Investing, live (3aabe4a) | Investing, page | Timeline, live | Timeline, page |
|---|---|---|---|---|
| Words | 1,057 | 2,982 | 1,407 | 3,117 |
| Reading time | 5 min | 15 min ("15 min read" in the cold open) | 7 min | 16 min ("16 min read") |
| H2 / H3 (Sources included) | 10 / 5 | 13 / 5 | 9 / 17 | 12 / 17 |
| Scenes | 0 | 12 | 0 | 11 |
| Rail rows (1680) and phone sheet | none (not a flagship) | 16, none twice, sheet matches | none | 13, none twice, sheet matches |
| Rendered words in `#article-root` | not measured | 4,320 | not measured | 4,190 |

B18 holds: neither page is smaller than the live post in words, H2 or scenes.

## HUD FY2027 Fair Market Rents: not fetched (refused)

`huduser.gov` answered every script with HTTP 202 and an empty body on 2026-11-01 (the county
summary pages under `/portal/datasets/fmr/fmrs/FY2027_code/2027summary.odn` for Dutchess, Orange,
Ulster, Westchester, Putnam and Rockland, and `/portal/datasets/fmr.html`); the web reader got an
empty page too. A retry with browser headers was refused by the session's own guard as
bot-check circumvention, rightly. So the three county figures stay as italic editor's notes on the
page ("Editor: HUD USER refused our script on November 1, 2026. Read the FY2027 two-bedroom Fair
Market Rent and HUD's own area name for Dutchess County on HUD USER (linked above) and put them here
with the date read."), the benchmark scene teaches the method and prints no figure, and the FY2026
ranking claim is gone. They must be read in a browser and typed in before this page reaches main.

## Facts found in this round (dated, read 2026-11-01 unless noted)

- Marist College is now **Marist University** (marist.edu/about: main campus in Poughkeepsie, 6,382 students). Vassar: 2,514 students.
- Poughkeepsie: $10 million DRI, eighth round (governor.ny.gov, March 11, 2025); 10 projects totaling $9.7 million named May 14, 2026 (governor.ny.gov).
- White Plains: $10 million DRI, seventh round, and "the busiest Metro North train station in the lower Hudson Valley" (governor.ny.gov, February 8, 2024); county government at 148 Martine Avenue; SDNY courthouse at 300 Quarropas Street.
- Beacon: Dia Beacon an 8 to 10 minute walk from Beacon station, about 80 minutes from Grand Central (MTA Away package page, 2024 to 2025, expired).
- Kingston: the Court of Appeals upheld the emergency declaration on June 18, 2025 (2025 NY Slip Op 03691). The city's 2025 Rental Vacancy Survey (published August 2025, read with pdftotext) found 7.04% net vacancy in sampled covered buildings, above the 5% line, except buildings of more than 22 units at 3.73%; 6 to 14 units 7.91%, 15 to 22 units 14.29%; 2019 6.7%, 2022 1.57%.
- Newburgh: East End Historic District, National Register record published September 12, 1985 (NPS).
- Fannie Mae Selling Guide B2-1.2-01 (topic dated June 1, 2022): for a purchase, "the lower of the sales price or the current appraised value".
- CFPB's reconsideration-of-value post is dated October 6, 2022 and dates no 2024 guidance, so the live post's "federal regulators issued guidance on these requests in 2024" was removed.
- NYSBA LegalEase (undated): contract upstate usually by an agent, downstate usually by the seller's attorney; a binder "may constitute a binding contract"; "Once you sign a contract, your rights and obligations are determined"; inspect "before or after signing a contract"; a written inspection report within five business days.
- HGAR, March 25, 2020: OneKey MLS served Manhattan, Westchester, Putnam, Rockland, Sullivan, Orange, Nassau, Suffolk, Queens, Brooklyn and the Bronx.
- HUD HOC reference guide, "Repair Conditions" (archived page): required repairs for FHA cover occupant health and safety, the property's security as collateral, and structural integrity.
- NYS Tax, TP-584-I (8/25): Form TP-584 is filed with the county's recording officer when the deed is presented; TP-584-NYC in the city.
- The disclosure form facts are round 15's, checked in the owner's Chrome on 2026-10-31 (dos.ny.gov refuses scripts and was not fetched).

## The second reader's items

### Investing post (17)

| # | Applied? | Why, in one line |
|---|---|---|
| 1 | Already fixed | The draft's frontmatter carries no model name; nothing on the page does. |
| 2 | Applied, not verbatim | The opener follows the owner's rule (covers, leaves with, who for); the suggested "We help you compare towns" line is a service claim, not used. |
| 3 | Applied | Vassar, Marist University (renamed), WMCHealth and the state's Metro-North line, each linked; "lower-cost option for commuters" removed. |
| 4 | Applied | "Moderate against rents" is now each building's test, in the body, the FAQ and the meta. |
| 5 | Applied | Dia Beacon and the 80 minutes from the MTA; price against rent is a conditional street-level test; "walkable Main Street" and "compact supply" removed. |
| 6 | Applied | County government and the federal courthouse sourced; the stability inference separated; "prices and entry costs are high" removed. |
| 7 | Applied | The FY2026 ranking is gone from the body and the FAQ; the lookup is an editor's note. |
| 8 | Applied | A benchmark, not a floor or ceiling; comparables above and below; week 2 and quiz question 3 match. |
| 9 | Applied | The invented example now calls renovation and commute possible reasons to check. |
| 10 | Applied | The Court of Appeals ruling, the 2025 survey, exemptions and other rental laws; the open city decision is said out loud. |
| 11 | Applied | Unsourced migration and investment claims removed; Newburgh's National Register district sourced; "disinvestment" removed. |
| 12 | Applied | Stability defined as a strategy with its checks; Newburgh advice framed on experience and reserve. |
| 13 | Applied | The command endings folded into the prose; one "Start week 1 tonight" kept as the closing line of the four-week scene. |
| 14 | Partly | The pass and fail text are real (porch light, "The house stays dark: try again"); labelling the wrong choices as wrong is not done, it would empty the quiz; each "why" names the right answer and the section. |
| 15 | Applied (calculator); worksheet not built | A real calculator: two defined inputs, every multiplier on screen, linked to the ROI guide. No printable worksheet was made this round. |
| 16 | Applied | "People often ask" and the repeated contents sentence removed. |
| 17 | Not applied | "Written with an AI assistant and checked by Levan." is the owner's own rule; his check is the desk step before main. |

### Timeline post (17)

| # | Applied? | Why, in one line |
|---|---|---|
| 1 | Already fixed; second half not applied | No model name anywhere; a human author in the frontmatter is not needed, the author card carries him. |
| 2 | Partly | Durations moved after the opener and split before and after the listing; they stay "in our experience" ranges, labelled as from our own transactions, because no named transaction record exists to cite (question below). |
| 3 | Not applied | The $500 credit is a statutory fact that existed until March 20, 2024, kept with its dated NYSBA source, as the owner's rule allows (F5 will warn). |
| 4 | Not applied (name); applied (source) | OneKey MLS is a real institution, not a vendor word; its counties now come from HGAR's 2020 release and "most" became "much of". |
| 5 | Applied | The "most common reason" ranking and the sale-price comparison removed; the quiz no longer tests it. |
| 6 | Applied | The evening estimate removed; showings, negotiation and pre-approval lines turned into advice or "in our experience". |
| 7 | Applied | The binding moment in the bar association's words, the binder warning, the deposit; escrow by the seller's attorney marked "in our transactions"; scenes, blueprint, FAQ and quiz agree. |
| 8 | Applied | B8: "before or after signing a contract" with its source; phase 4 is a conditional flow, and its lede says the order varies. |
| 9 | Applied | The appraisal rule from Fannie Mae B2-1.2-01; FHA repairs from HUD; VA dropped (not sourced); quiz question 7 matches. |
| 10 | Applied | No lender-ordered appraisal or loan approval; a cash buyer may still order an appraisal; example and quiz question 10 match. |
| 11 | Applied | The form note resolved with round 15's browser-verified facts and the same sources as the disclosure post. |
| 12 | Applied | "The order we suggest"; "slowest doors" removed. |
| 13 | Partly | The home value link is informational; the end carries the phone, info@ and one "Book a consultation" button, no second ask. |
| 14 | Applied | The offer board shows the five comparisons, paired as the list pairs them. |
| 15 | Not applied (porch light); applied (FAQ) | The porch light and "try again" are the owner's quiz rule; the FAQ answers now start with the answer. |
| 16 | Applied | The lane had the live post: every section and fact kept or replaced with a dated source; never smaller. |
| 17 | Applied by test | `timeline-quiz.test.ts` fails if a "why" names a section the post does not have or a number the post does not print. |

## The gate lines (as run, 2026-11-01, on the final disk)

- `npx tsc --noEmit`: exit 0, "TypeScript: No errors found".
- `npx vitest run`: exit 0, Test Files 173 passed (173), Tests 2514 passed (2514) (round 17: 171 / 2,454). One earlier full run had one timeout in `app/redirects.test.ts` ("every destination is a route that exists", 5,000 ms) under load; the file alone passed 8/8 and the next two full runs passed.
- `next build`: exit 0, "Compiled successfully", "Generating static pages (129/129)". Built in a detached scratch worktree of this branch with the lane's uncommitted files copied in (`node_modules` a junction to this worktree's), because a stale `next start -p 3108` from round 17 still serves this worktree's `.next` and the session could not stop it.
- Probe (`node docs/blog-r21/probe.mjs http://127.0.0.1:3110 docs/blog-r21/shots` against `next start` on that build; `shots/report.json`):
  - both pages at 320, 390 and 1440: HTTP 200, scrollWidth equals innerWidth, no scene element past the right edge, 0 hidden reveals, smallest scene text 12 px (investing, the eyebrows) and 11 px (timeline, the blueprint eyebrow); the first prose paragraph is the opener on both;
  - console: 2 lines per page, both `/_vercel/insights/script.js` (404 off Vercel), 0 others;
  - quiz at 390 on both: "1 of 10", choices 358 px wide at least 60 tall; a wrong-answer run fails (0 of 10, "The house stays dark: try again"), the right-answer run passes 10 of 10 ("The porch light is on", link "Talk to Levan -> /connect"); JavaScript off: 10 items, 10 `<details>` on both;
  - calculator: the headline moved from $2,880 to $3,600 a year when the rent slider moved to $2,500;
  - investing: "15 min read", 16 rail rows, none twice, the sheet matches; timeline: "16 min read", 13 rows, none twice, the sheet matches; one author card each; footer has info@realtylt.com and (914) 415-7185; "Apply it" 0; "broker" 0; the AI line present; editor's notes 3 (investing, the HUD figures) and 0 (timeline);
  - rail-tone drive: 0 steps under 4.5:1 at 390, 1440 and 1680 on both (lowest 6.55:1 with the rail open at 1680).
- `node docs/blog-r21/overflow.mjs <base> <route> 320`: "nothing past the edge" on both posts.

## The shots (looked at, in `shots/`, git-ignored)

Tops at 320, 390 and 1440; every scene at 390 (`towns-390-scene-*`, `timeline-390-scene-*`); the
320 frames of the calculator, the Kingston bars, the glance and phase 4; the author card and the
footer at 390; the phone sheets; the open rail at 1680; the quiz question, pass and fail results.
The largest file is 1.1 MB.

What looking changed (each fixed, rebuilt and re-shot):

1. At 320 and 390 the pages scrolled sideways: the Steps primitive keeps a chip value on one line,
   and long values ("You, your agent, your attorney", "Stabilization, registration, short-term
   limits") ran past the edge. Those steps now carry a short chip or a body line.
2. Kingston's true-date timeline at 390 was 4,188 px tall (a two-month pair beside a three-year one)
   and then printed year marks beside the wrong events; it is a numbered path now.
3. The HUD editor's notes carried a markdown link inside italics; the renderer printed it raw and
   unbreakable (445 px at 320). The notes now say "on HUD USER (linked above)".
4. The benchmark scene's example printed its label twice ("An example, not data" and "An invented
   example:"); the second is gone. Its fact "The figure most investors use" was an unsourced claim;
   it reads "The unit size this guide reads".

## Open for the owner or the orchestrator

- The three HUD FY2027 two-bedroom figures and HUD's area names (read in a browser, typed in with the date read). The page shows the italic notes until then.
- Kingston: we found no published city decision on the 2025 survey; the post says to treat the rule as in force for a covered building until HCR or an attorney says otherwise. A legal judgment for Levan (or an attorney) to confirm.
- The "in our experience" durations and "in our transactions the deposit is commonly held in escrow by the seller's attorney": his own practice, his to confirm.
- Titles: both pages now use the draft's titles (the target phrases) for the H1 and the search title; the addresses are unchanged.
- The investing hero reuses the cover (`counties/rockland.jpg`, Harriman State Park), which is not one of the five towns.
- No printable worksheet for the investing post (the second reader's item 15).
- The "Levan Tsiklauri, licensed New York real estate salesperson, Poughkeepsie" line at the foot of both drafts was left off the pages: the author card carries him, and the final check flagged the line as an unsourced licensing claim.

## Orchestrator, 2026-11-01 about 11:00 ET: the three HUD figures filled

huduser.gov answers a script with HTTP 202 and an empty body, and the old `fmrs/FY2027_code/` paths answer 404: the FY 2027 documentation system moved to `https://www.huduser.gov/datasets/fmr/fmr2027` (a state and county picker; the summary URL is `.../fmr2027/summary?year=2027&reporttype=county&states=36&counties=<state fips><county fips>99999`). Read in the owner's Chrome and saved beside the piece (`realtylt-agents/company/pieces/realtylt/best-places-to-invest-hudson-valley/sources-browser/`): Dutchess and Orange = the Kiryas Joel-Poughkeepsie-Newburgh, NY MSA, two-bedroom $2,131 (FY2026 $1,979); Ulster = the Kingston, NY MSA, $1,878 ($1,818); Westchester = the New York, NY HUD Metro FMR Area with Putnam, Rockland and the five boroughs (Westchester added from FY2025; a local rent survey of December 2024), $2,971 ($2,910). The three editor notes and the Sources line replaced in `BEST_TOWNS_POST`; the ranking (the New York area the highest of the three) restated on the FY2027 figures. Other posts still carry FY2026 figures (`FIRST_RENTAL_POST`, `HOUSE_HACKING_POST`): their own refreshes.
