# Round 22 page lane: three pages on the owner's answers of 2026-11-01

2026-11-01 evening (20:40 to about 22:30 ET), branch `r21-blog-preview`, from ed1f4ce. The owner's
answers of 20:03 ET (`realtylt-agents/company/DECISIONS-LEDGER.md`): no "in our experience" number,
an example of how the deposit is held in escrow by the attorney; Kingston's rule as the law stands,
no wait on his confirmation; the investing hero swapped for one of the post's own towns; the
renovations stub written "on our level". Nothing goes to production: the branch is pushed, Vercel
builds the preview, the orchestrator puts the links on his desk.

## Preview URLs (after the push)

- https://realtylt-website-git-r21-blog-preview-levans-projects-a543d940.vercel.app/blog/timeline-selling-a-house-ny
- https://realtylt-website-git-r21-blog-preview-levans-projects-a543d940.vercel.app/blog/best-places-to-invest-hudson-valley
- https://realtylt-website-git-r21-blog-preview-levans-projects-a543d940.vercel.app/blog/top-5-renovations-increase-home-value-ny

## What changed, per page

### 1. The selling timeline (`content/blog/seller-posts.ts`, `timeline-scenes.ts`, `timeline-quiz.ts`, `posts.ts`)

- Every "in our experience" and "from our own transactions" duration is gone: the second paragraph,
  the glance list, the closing-place line, two FAQ answers, the Sources note, the excerpt and the
  search description, the glance scene (its lede, facts, chips and source), the contract-path
  scene's fact, and quiz question 1. No public source we could read gives a typical duration for a
  New York phase, so no number stands in their place; each phase now says what sets its pace.
- What the page says instead, sourced: the standard New York residential contract of sale (the
  11-2000 form prepared by the bar association's real property section with three other legal
  bodies) leaves the loan commitment date (paragraph 8) and the closing date and place
  (paragraph 15) blank for each deal; the two time limits the law does fix are the disclosure
  statement before the buyer signs (Real Property Law 462) and the inspector's written report
  within five business days (NYSBA LegalEase).
- The example he asked for, a new H3 "Where the deposit sits until closing": paragraph 6 of the
  standard contract, the seller's attorney as escrowee holding the deposit in a segregated account
  "until Closing or sooner termination of this contract", paid to the seller at closing; the
  10-business-day objection window if the sale fails; then the timeline (from signing to the
  closing date the contract sets, which depends on the deal) and an invented example.
- Quiz question 1 is now "who holds the buyer's deposit until closing?". The glance scene prints
  "5 business days" and "Before signing" and a "Pace" chip per phase; the contract-path scene's
  fact is "Escrow".
- `post.md` (`realtylt-agents/company/pieces/realtylt/timeline-selling-a-house-ny/post.md`) carries
  the page's markdown as built, the new meta description and a round-22 built line; its chain line
  is untouched.

### 2. The investing guide (`best-towns-scenes.ts`, `investing-posts.ts`, `posts.ts`, a new photo)

- The hero and cover: `public/images/editorial/beacon-main-street.jpg`, Beacon's Main Street (brick
  mixed-use buildings, shops below and apartments above), CC BY 4.0, Ajay Suresh, April 7, 2026,
  licence read on the Wikimedia Commons file page on 2026-11-01 (FlickreviewR 2 confirmed the
  licence on April 8, 2026); centre-cropped to 4:3, 1024x768, 210 KB; row added to
  `public/images/ATTRIBUTIONS.md`. Why not `counties/dutchess.jpg` (the brief's default): it is the
  cover of the relocating guide, and his rule drawn on 20:03 is "never a cover reused from another
  post"; the Rockland photo it replaces was itself shared with another post and `/financing`.
  `cover` (the blog card, the OG image) and the cold open's `hero.photo` both point at it.
- Kingston: one sentence read as a pending confirmation ("treat the rule as in force for a covered
  building until HCR or your attorney says otherwise"). It now states the law as it stands: no
  published city decision on the 2025 survey was found on November 1, 2026, so the law is the 2022
  adoption the Court of Appeals upheld, and rent stabilization applies to a covered building. The
  timeline scene's last step says "November 1, 2026: the 2022 rule stands". The reader's step
  ("count the units, confirm the year, ask HCR and your attorney about that building") stays, as
  he said. The FAQ already stated the law; nothing else waited on him.
- The author line: unchanged (the author card carries him).

### 3. The renovations page (new: `renovations-post.ts`, `renovations-scenes.ts`, `renovations-quiz.ts` + test)

- Written from the old 2025 post (the piece's `old-post-2025.md`): its structure is kept (how value
  is calculated, five projects with cost, resale value and cost recouped, the Hudson Valley
  section, the low-return projects, the close). Its numbers are not: they were labelled 2025 but are
  the 2024 report's Middle Atlantic figures (the garage door's $4,383, $8,922, 203.6% and the stone
  veneer's 158.6% are on the 2024 page). The 2025 report's figures were read from its public pages
  on jlconline.com; no 2026 report exists there (`/cost-vs-value/2026/` answered 404 on 2026-11-01).
- THE LICENCE (the reason the page is shaped as it is): the report's "Re-Use and Licensing
  Guidelines" (September 18, 2025) allow excerpts in a narrative, cap the sum of all excerpts by one
  publisher in all formats at data from five projects, forbid a chart or table that simulates the
  report's own display and any use in a calculator, and prescribe the citation "Remodeling 2025
  Cost vs. Value Report (www.costvsvalue.com)" and the Zonda Media acknowledgement. Our basement
  post already quotes one project (the basement remodel), so this page quotes four: the garage door
  (336.6% region, 323.4% New York City), the steel entry door (219.8%, 195.2%), manufactured stone
  veneer (200.7%, 192.8%) and the minor midrange kitchen (107.2%, 103.1%). The fifth renovation is
  the condition work the report does not price, from Fannie Mae's appraisal rules (the C1 to C6
  scale; a C6 loan cannot be sold to Fannie Mae until repaired to C5). The old post's vinyl siding,
  deck, upscale kitchen and pool figures are gone; the low-return section rests on the report's own
  narrative (the editors' "the more complex the project, the lower the return", the bedroom turned
  into a bath, added square footage, the value of similar homes nearby) and Fannie Mae's lower of
  price and appraised value. A test (`renovations-quiz.test.ts`, "stays inside the report's excerpt
  cap") fails if the page, the quiz's explanations or any scene prints a percentage the four
  projects do not account for, or names another project of the report.
- Sections (14 H2): how a renovation adds value at sale; the 2025 figures and how to read them (the
  2024 to 2025 swing of the garage door as the lesson); the five; why outside work leads; projects
  that rarely pay back; what an older Hudson Valley house adds (the EPA lead rule for pre-1978
  homes, EPA runs it in New York; the permit and certificate of occupancy trail, linked to the
  disclosure and inspection guides); before you spend (six steps); five FAQ, each with its source in
  the answer; next step with (914) 875-2424, info@ and "Book a consultation"; Sources, dated.
- Scenes (8): formula (tiles, the invented $10,000 / $8,000 / 80% example, labelled), ranked (bars of
  cost recouped only, two panels, the 100% line, the citation and the copyright line), condition
  (steps C1 to C6), older-house (tiles), plan (steps), calculator (the reader's quote times the
  reader's own estimate; no report figure in it), quiz (ten questions, porch light), talk (offer).
- Registration: `posts.ts` entry now flagship, `placeholder: false`, `updated: 2026-11-01`, new
  title "The top 5 renovations that increase home value in New York" (the old one said "your homes
  value"), search title "Top 5 renovations that increase home value in NY" (48 characters, sentence
  case), search description 153 characters, cover kept (`listings/house-16.jpg`, a kitchen, CC BY
  2.0, used by no other post; it is the DB fallback cover in `lib/blog/db.ts`). `PLACEHOLDER_BODY`
  removed (it had no other user). `lib/blog/flagship.test.ts` holds the topic contract for it.
- The date: the stub carried 2025-10-24, the old site list's date, shared with the first-time buyer
  checklist, and `repost-seo.test.ts` requires one date per reposted article; 2025-11-26 (the Drive
  copy's date) is also taken, so it reads 2025-10-23. An open question below.
- `post.md` written with `<!-- chain: step=2 agent=seo status=handed at=2026-11-01T21:13:59-05:00 -->`,
  the frontmatter, the page's markdown and the "Data points for a visual" block (dp1 to dp6, plan-1
  and plan-2), which opens with the licence limits the Designer must keep.

## Tests changed, and why

- `app/blog/placeholder-noindex.test.ts`: it named this slug as THE placeholder and needed "one live
  stub to test". With no stub left it now (a) asserts no real post is a placeholder and the last
  stub is a real article that says nothing about robots, and (b) holds the noindex, sitemap and
  /blog guards on a synthetic placeholder added to POSTS for that file only (`vi.mock`).
- `lib/blog/index.test.ts`: "falls back to the excerpt" looked for a post without a
  seoDescription; the stub was the only one. It now uses a copy with the override removed.
- `app/redirects.test.ts`: the destination check got 30 s; its dynamic import of every post crossed
  the 5 s default in two full runs under load (5,291 ms), 8 of 8 alone. Instrument, not product.
- New: `content/blog/renovations-quiz.test.ts` (the quiz shape, numbers and headings, and the
  excerpt cap).

## The B18 numbers (readingTime's count: whitespace split of the markdown)

| | Words before | Words after | H2 | H3 | Scenes | Reading time |
|---|---|---|---|---|---|---|
| Timeline | 3,117 | 3,670 | 12 to 12 | 17 to 18 | 11 to 11 | 16 to 18 min |
| Investing | 3,057 | 3,064 | 13 to 13 | 5 to 5 | 12 to 12 | 15 to 15 min |
| Renovations | the stub: 3 placeholder paragraphs, no H2 | 2,642 | 0 to 14 | 0 to 5 | 0 to 8 | 13 min |

Nothing teaches less: the timeline lost its unsourced ranges and gained the deposit section, the
contract's blanks and the two fixed limits; the investing guide changed one sentence.

## The gate lines (as run, 2026-11-01, on 45a214b; the push adds only this folder)

- `npx tsc --noEmit`: exit 0, "TypeScript: No errors found" (run twice: before and after the look fixes).
- `npx vitest run`: exit 0, "PASS (2553) FAIL (0)", 174 test files (round 21: 173 / 2,514). Earlier
  full runs on this round's tree: two red runs, each the one `app/redirects.test.ts` destination
  check at about 5,291 ms against the 5 s default under load (the file alone 8 of 8, exit 0), then
  the instrument fix (30 s), then two green full runs (2,553 each).
- `next build`: exit 0, "Compiled successfully in 18.6s", "Generating static pages (129/129)" (the
  renovations page was already one of the 129 as a stub). Built in a detached scratch worktree of
  the branch (`git worktree add --detach <scratch>/laneA/wt`, `node_modules` a junction to this
  worktree's, `node node_modules/next/dist/bin/next build`), because the stale `next start -p 3108`
  (pid 23324) still holds this worktree's `.next`. Served with `next start -p 3110 -H 127.0.0.1`.
  The first build's log was condensed by a CLI proxy (it printed "2 routes"); the final build was
  run through node directly so the real lines were kept.
- Probe (`node docs/blog-r22/probe.mjs http://127.0.0.1:3110 docs/blog-r22/shots`, `shots/report.json`):
  - all three pages at 320, 390 and 1440: HTTP 200, scrollWidth equals innerWidth, no scene element
    past the right edge, 0 hidden reveals, smallest scene text 12 px (investing) and 11 px (timeline
    and renovations, the eyebrows and the offer's "Talk with us"); the first prose paragraph is the
    opener on all three; console: 2 lines per page, both `/_vercel/insights/script.js` (404 off Vercel);
  - quiz at 390 on all three: "1 of 10", choices 358x60; a wrong-answer run fails (3 of 10, "The
    house stays dark: try again"), the right-answer run passes 10 of 10 ("The porch light is on",
    link "Talk to Levan -> /connect"); JavaScript off: 10 items, 10 `<details>` on each;
  - calculators: investing $2,880 to $3,600, renovations $8,000 to $16,000 when the first slider moves;
  - investing "15 min read", 16 rail rows; timeline "18 min read", 13 rows; renovations "13 min
    read", 16 rows; none twice, every phone sheet matches its rail; one author card each; footer
    info@ and Rachel's (914) 415-7185 on each; "broker" 0, vendor or model names 0, "in our
    experience" / "our own sales or transactions" / "in our transactions" 0, em dash 0, "Placeholder
    draft" 0, the AI line present; robots meta absent on all three (the renovations page is indexable);
    og:image beacon-main-street.jpg (investing), selling.jpg (timeline), house-16.jpg (renovations);
    the investing cold open loads `/images/editorial/beacon-main-street.jpg`;
  - rail tone: 0 steps under 4.5:1 at 390, 1440 and 1680 on all three (lowest 6.55:1 at 1680).
- `/sitemap.xml` on the build: 105 URLs (104 before), the renovations page in it.
- `brand_check.py <post.md> --brand realtylt`: PASS, exit 0 on all three. Renovations: WARN F10 x1
  (the frontmatter read as the first lines, as on every piece) and F5 x48 (the report's dollar
  figures and the invented example; market facts on a RealtyLT piece); timeline F10 x1, F5 x3;
  investing F10 x1, F5 x11.

## The shots (looked at, in `shots/`, git-ignored)

Tops at 320, 390 and 1440 on all three; every scene at 390; the 320 frames of the calculators, the
bars, the glance, the contract path, the condition scale, the older-house card and the formula; the
author card and the footer at 390; the phone sheets; the open rail at 1680; the quiz question, fail
and pass results.

What looking changed (fixed, rebuilt, re-shot):

1. The renovations calculator at 390 printed "$20,000" into its slider (the value box was 5.5 rem,
   sized for four-figure rents); it is 7.5 rem now, the width other five-figure calculators use.
2. The timeline glance fact read "Before / The buyer signs: when the disclosure statement is due";
   it reads "Before signing / When the disclosure statement must reach the buyer".

Looked at and kept: the Beacon cold open at 390 and 1440 (the cornice and the brick fronts carry
the title; the hero mask keeps the type clear); the bars (cost recouped only, the citation and the
copyright line under them); the C1 to C6 path; the porch light pass and the dark house fail.

## Sources read this round (all on 2026-11-01)

- Remodeling 2025 Cost vs. Value Report, Journal of Light Construction with Zonda:
  https://www.jlconline.com/cost-vs-value/2025/middle-atlantic/ (the region with national columns),
  https://www.jlconline.com/cost-vs-value/2025/middle-atlantic/new-york-ny/ and
  https://www.jlconline.com/cost-vs-value/2025/middle-atlantic/albany-ny/ (read, not used),
  https://www.jlconline.com/cost-vs-value/2025/methodology (September 18, 2025),
  https://www.jlconline.com/cost-vs-value/2025/what-the-numbers-mean/ (September 18, 2025),
  https://www.jlconline.com/cost-vs-value/2025-cost-vs-value-report-key-trends (September 15, 2025),
  https://www.jlconline.com/cost-vs-value/2025/re-use-and-licensing-guidelines (September 18, 2025);
  https://www.jlconline.com/cost-vs-value/2024/middle-atlantic/ (the old post's real year).
- Fannie Mae Selling Guide B4-1.3-06 (06/04/2025):
  https://selling-guide.fanniemae.com/sel/b4-1.3-06/property-condition-and-quality-construction-improvements
- EPA, Lead Renovation, Repair and Painting Program (updated June 17, 2026):
  https://www.epa.gov/lead/renovation-repair-and-painting-program
- Residential Contract of Sale, 11-2000 edition (long form; the short form read too), as published
  by Justia Forms:
  https://forms.justia.com/new-york/statewide/real-estate/title/residential-contract-of-sale-2000-long-form-42326.html
  (paragraphs 3(a), 6, 8 and 15).
- NYSBA LegalEase, https://nysba.org/legalease-buying-and-selling-real-estate/ (re-read: no
  duration, no escrow holder named).
- Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Beacon,_NY_(55194236052).jpg (the
  licence and the author).

## What I refused, and why

- Census API for the age of Hudson Valley housing: api.census.gov now answers "Missing Key"; no
  key was used and no workaround tried. The page makes no claim about how old local houses are.
- nycourts.gov copies of the contract's escrow clause (in decisions that quote it): not fetched
  (the site refuses scripts); the Justia copy of the form itself was read instead.
- costvsvalue.com answered a script with a redirect and then 403; not retried. The citation keeps
  "www.costvsvalue.com" as the guidelines require, and the links go to the jlconline.com pages read.
- ICE's "average days to close a purchase loan" (national, and only seen through third parties):
  not used; the rule asks for a New York duration from a source read.
- A sixth Cost vs. Value project anywhere on the page (the old post's deck, vinyl siding, upscale
  kitchen): the publisher's five-project cap.
- The old post's pool section and its "influx of buyers from New York City" deck argument: no
  source; dropped rather than kept as our opinion.

## What needs the orchestrator's browser

- Nothing is blocking. To confirm by eye if wanted: www.costvsvalue.com (403 to a script) is the
  report's own front door; the jlconline.com pages it redirects to were read.

## Open questions for the orchestrator

1. The licence. Is the bars scene (cost recouped only, four projects, two panels) inside "may not
   take the form of a chart or table that simulates the manner in which the data is displayed"?
   I read the report's display as its cost, value and recouped table and drew one measure as bars;
   the safest alternative is to delete the `ranked` scene (the figures stay in the prose). The
   permission route the guidelines give is an email to the publisher (address on the guidelines
   page). The Designer's data points carry the same warning.
2. The phone in "Next step". The brief asked for (914) 875-2424 on the renovations page; the two
   round-21 pages say (914) 415-7185 (Rachel's line, the footer's number by his 2026-10-31 rule).
   The pages now differ; pick one.
3. The renovations date: 2025-10-23 (moved a day from the shared 2025-10-24 by the one-date rule).
4. The renovations cover is the old stub's kitchen photo; a New York house front with a garage or an
   entry door would fit the page's five better. None licensed is in the repo.
5. The Kingston sentence states the law from the sources; if the city has acted on the 2025 survey
   since, that one sentence and the scene's last step change.

## My mistakes this round, recorded

- One Bash call carried a stray `python -X utf8 -I -` (a bare stdin read) between two steps. The
  hook that refuses `python -` did not match the `-I -` form; the call hung until the harness moved
  it to the background, and I stopped it. The `sed` before it had half-applied (one of two
  substitutions); I found that by reading the file and finished the edit with the Edit tool.
- A one-off `python -X utf8 -I /dev/null` and a multi-line `sed` that could never match ran as
  no-ops; nothing changed, but they were careless.
- The first build's log went through a CLI output proxy that condensed it ("2 routes"); the gate
  line above comes from the second build, run through node directly.

## Follow-up (2026-11-01, 21:52 to 22:10 ET, the coordinator's three items)

This section supersedes open questions 1 to 3 above and the `ranked` bars scene described under
the renovations page.

1. **The phone.** The renovations "Next step" line no longer types a number: it reads `SITE.phone`
   from `lib/site.ts` ((914) 415-7185, Rachel's line since 2026-10-13), as the two round-21 pages
   show. `post.md` carries the resolved number. (914) 875-2424 stays only where the site puts it:
   the author card.
2. **The licence, the safe route.** The `ranked` bars scene and its three constants are gone. The
   four projects are now a numbered prose list in "The 2025 figures for New York" (each in words
   and figures, region and city: 336.6% and 323.4%, 219.8% and 195.2%, 200.7% and 192.8%, 107.2%
   and 103.1%) with "Source: Remodeling 2025 Cost vs. Value Report (www.costvsvalue.com)". No scene
   prints a report figure (the scenes file's rule says so). The "Data points for a visual" block in
   `post.md` now opens with "NO CHART, NO TABLE": no bar chart, table or graphic of the report's
   figures; a slide may state one figure in words with the citation and the copyright line; dp2 and
   dp4 changed to match. The renovations page has 7 scenes now (was 8).
3. **The date stays 2025-10-23:** `lib/blog/repost-seo.test.ts` ("carries an honest date pair")
   requires a reposted consumer article's date on or before 2026-09-24, so 2026-11-01 fails it.
   The cover stays the kitchen photo (open).

Gates on fd789c6 (the push adds only this note): `npx tsc --noEmit` exit 0 ("No errors found");
`npx vitest run` exit 0, PASS (2553) FAIL (0); `next build` in a fresh detached scratch worktree
exit 0, "Compiled successfully", 129/129; the probe on the three pages at 320, 390 and 1440: 200,
no sideways scroll, nothing past the edge, opener first, quiz 1 of 10 then fail and 10 of 10 pass,
JavaScript off 10 and 10, one author card, footer info@ and (914) 415-7185, "broker" 0, vendor
names 0, "in our experience" 0, em dash 0, robots absent, rail tone lowest 6.55:1; the renovations
page "14 min read", 16 rail rows, 7 scenes, (914) 875-2424 once on the rendered page (the author
card); the built HTML has the prose list and no `scene-ranked`. `brand_check.py` on the renovations
`post.md`: PASS, exit 0 (WARN F10 x1, F5 x48).
