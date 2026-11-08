# Round 69 (2026-11-08): the home page's polish, on his order "Polish our main page as well"

The WEBSITE lane of Agentic OS round 27, worker 1 (Opus), alone, in the worktree `C:/Users/Levan/realtylt-website-r53`
on the branch `r69-home`, against the :3102 production build. Nothing deployed; `main` untouched. Standing orders that
bind the round: nothing with a look change reaches `main` before he has seen it; respect convergence (he approved this
look through seven previews: surgical, reversible, looked-at); where a move is taste, two or three looks differing in
ONE variable, shot, for his pick.

## 0. The state the round found (14:38 to 14:42 EST)

- `git fetch origin`: `origin/main..design/futuristic-r53` = 0, `design/futuristic-r53..origin/main` = 24; local
  `main` 31 behind `origin/main` (not touched). r53 had no commit missing from origin/main, so it was fast-forwarded to
  `origin/main` (`3aabe4a`, 2026-10-31 18:50 -0400, the blog rounds 14 to 17 and the info@ footer), and `r69-home` was
  cut from there. The lockfile did not change (no `npm ci`). The worktree carried another session's uncommitted
  `CLAUDE.md` edit (the "read these first" table); it rides along untouched and is never committed by this round.
- :3102 rebuilt with `scripts/_scratch-r62-rebuild.ps1` (14:39:15 to 14:41:22): `status 200`.
- Disk: 7.1 GB free at the start, 5.8 GB at 15:05 (the orchestrator's note), 11 GB at 15:14. Shots are JPEG in
  `docs/parity/r69-home-shots/` (gitignored by this round's first commit); no plate or film was re-rendered.

## 1. The home page with fresh eyes (written before any change)

Instruments (all in `scripts/_scratch-r69/`, gitignored, named so a later round can re-run them): `shot-home.mjs`
(viewport tiles down the page, JPEG, `--nojs`, `--reduced`, `--q=`), `hero-fit.mjs` (the first screen at ten laptop
windows), `lcp.mjs` (the paint timeline, CDP-throttled), `lh.mjs` (Lighthouse 12.8.2 from the npx cache, three runs per
form factor, media and lead blocked), `axe.mjs` (axe-core 4.14 from the scratchpad, never in the repo), `taborder.mjs`,
`form-states.mjs` (the footer form with `/api/lead` fulfilled locally), `contrast.mjs` (round 68's phone kit, headless).
The before shots: `docs/parity/r69-home-shots/before/` (390, 768, 1280, 1920; 50 tiles), `before-nojs/` (390, 1280),
`before-reduced/`, `before-320/`, `before-form/`.

### 1a. What reads right (and stays)

- The one memorable thing is still the right one: a real night map of the territory with every listed home a lamp,
  the counties as camera stops. At 1920 x 1080 the first screen is the best of the site (the headline over New Jersey's
  dark, the valley burning to the right); nothing else in the category looks like it.
- One family (Schibsted Grotesk) in sentence case, one serif moment (the testimonial's italic), no gradient, no glow,
  no arrow CTAs; the only colour is the lamp yellow and the two blues of the mark. Render-text checks on the served
  HTML: 0 em dashes, 0 en dashes, 0 "broker", 0 arrow glyphs; the only phone number printed is (914) 415-7185 (4
  times, all from `SITE.phone`); "REALTOR" once, in the membership line.
- The headline's first line is the brand ("Let's find home."), and the line under it says what we do for the reader
  with a measured number ("15,633 homes for sale right now, from Poughkeepsie to the five boroughs"). That pairing is
  his approved hero; it stays.
- States are already designed: the search box's history, no-match note and keyboard rows (`LocationSuggest`); the
  footer form's required fields, the consent line ("Please tick the box above ..."), the server error ("Something went
  wrong on our end. Call or text (914) 415-7185 instead."), "Sending..." and the success redirect, all observed with
  `/api/lead` fulfilled locally (`before-form/`).
- No script: the plate stands, the words say nothing about lights, every list is plain and every link works
  (`before-nojs/`, looked at). Reduced motion: no rise, no flight; the plates hold (`before-reduced/`).
- 0 horizontal overflow at 320, 390, 768, 1280 and 1920 (`shot-home.mjs` prints `scrollWidth - innerWidth`).
- Contrast at rest on the phone (round 68's kit, headless, the harbour and Queens stops): 14 texts, 0 under the floor
  at p95; the two p99 misses are the accepted single-lamp class ("Every screen above ..." p99 1.19, p95 6.48).
- The three-across card kit (DESIGN-ROUND68 §1 move 1) does not appear on the home page: its only cards are listing
  cards, which are things you open, and the "three numbers" are already a ruled ledger. Moves 3 to 8 are other pages.

### 1b. What reads as a kit, or breaks (measured)

1. **The laptop's first screen does not fit most laptop windows.** The hero's column is 864 px tall from 1280 wide
   (160 px top padding + 608 of words + 96 bottom; 841 at 1024, where the headline is 88 px). Below an 864 px window the section grows past the fold, and
   the bottom-left credit corner (MlGround's `CLEAR_STYLE`: an ellipse of 320 x 88 px at the window's bottom-left that
   erases the page's own content there, on purpose, so no word of ours sits under the map credit) eats the small
   lights line. `hero-fit.mjs`, share of the line's box inside the corner: 1280 x 800 **0.51**, 1280 x 720 0.61,
   1024 x 768 0.59, 1440 x 789 (a 1440 x 900 laptop's browser window) 0.38, 1536 x 730 (a 1536 x 864 Windows laptop)
   0.33; 1366 x 657 (a 1366 x 768 laptop, the commonest Windows window) puts the two boxed links across the fold (top
   653 of 657) and the line below it. At 1440 x 900, 1680 x 940 and 1920 x 969: 0.00, as approved. Seen at 1280 x 800:
   "...ome listed on OneKey® MLS, standing where it / ...town and price." with the first words faded out
   (`before/home-1280-00.jpg`). **A defect: mine to fix.**
2. **The intake's first answers are links that claim to be toggle buttons.** "Buying / Selling / Both" are anchors
   (so they work with no script) carrying `aria-pressed`, which no link may carry: axe `aria-allowed-attr` critical x3
   at all four widths, the one Lighthouse accessibility failure (95). **A defect: mine.**
3. **The footer's sign-off lacks the licence type and uses the short brokerage name.** It reads "© 2026 Levan
   Tsiklauri | United Real Estate. Each office is independently owned and operated." 19 NYCRR 175.25 (the Department of
   State's text as quoted in `jvc-research/round43/f/VERDICTS-sell.md` §L1, read 2026-11-05) asks an advertisement that
   names a salesperson to print the brokerage's name ((c)(2)), the name as licensed ((c)(3)) and the licence type
   ((c)(4)); the state's record (data.ny.gov, rows updated 2026-11-04) reads "REAL ESTATE SALESPERSON" and "UNITED REAL
   ESTATE HUDSON VALLEY EDGE". The films' end cards already say "Licensed Real Estate Salesperson, United Real Estate
   Hudson Valley Edge". **A defect against the public record; the wording is the record's, and the final word is his
   and his supervising broker's (collected as a question, §4).**
4. **The headline is counted late as the page's largest paint.** Its entrance (`.rise`, 0.45 s) starts at opacity 0,
   and Chrome does not count a first paint at opacity 0, so the headline is recorded only when the web font's swap
   repaints it. `lcp.mjs` on a phone profile (4x CPU, 1.6 Mbps, 150 ms): headline recorded at 3,416 to 4,256 ms
   (four runs); with the rise starting at 1 % opacity, 2,024 to 2,296 ms (three runs); with the rise off, 2,036 to
   2,516 ms. Lighthouse mobile (median of three): performance 53, LCP 5.79 s with the headline as the element, TBT
   1,266 ms; desktop: 96, LCP 1.23 s (the plate). Real visitors' LCP (the field data Google ranks on) uses the same
   rule. **A defect with an invisible fix: mine.**
5. **The map credit comes before the hero's search in the keyboard order**, because MlGround renders it ahead of the
   page's content (it is `fixed`, so the order is invisible to the eye). `taborder.mjs` at 1280: header (30 stops),
   then the credit's line, then the credit's (i), then UP to the search; and one Tab landed on the page itself (stop
   30): the line's first link held focus when the five-second timer folded the line into the (i) and unmounted it.
   **A defect: mine** (move the credit after the content; nothing moves on screen).
6. **Two labels over headings carry no fact** (DESIGN-ROUND68 §1 move 2 on the home page): "Start here" over "Tell us
   what you're planning." and, in the shared footer, "Reach out" over the address. The others carry one: "Hudson
   Valley and New York City" (the territory), "Question 1" (the step), "Hudson Valley" / "New York City" (the two lists).
   **Taste: his look** (tiles, §4).

### 1c. Measured, not changed (each with its reason)

- **The map's weight.** Lighthouse's byte list on a phone: the first film (`/flights/hero--dutchess-tall-1170.mp4`,
  1,339 KB) is fetched on load so the first scroll plays it; the elevation texture 367 KB; the ads tag 194 KB; the
  lights 128 KB; the first plate 72 KB. Total 2,967 KB mobile, 2,404 KB desktop. The film loader already reads the
  line's speed and Save-Data (`plate-controller.ts` `lineMbps`); deferring the first film to the first scroll would cost
  a fast scroller the first flight. A product call, not a polish: §4.
- **Lighthouse SEO 69 and best-practices 74/75 are the lab, not the site:** :3102 sends `X-Robots-Tag: noindex,
  nofollow` (the local lab's), `/_vercel/insights/script.js` 404s off Vercel, and the third-party cookie is the Google
  Ads tag (a product decision). Every failed request on load, listed: only those three (and the media this probe blocks).
- **The phone ledger over Manhattan's lights** read poorly in one tile (`before/home-390-11.jpg`): that tile was taken
  mid-flight; at the settled harbour stop the claims read 6.40 and 6.46 at p99 (kit above). Not a defect.
- **The header's "Top areas" opens on keyboard focus** (`Header.tsx` `onFocus: setFlyoutHover(true)`), so a keyboard
  visitor tabs through its eleven areas to reach "Financing" (stops 12 to 23). Shared by every page, deliberate since
  the round that split hover from click (the comment at `Header.tsx:57`); an open item for a header round, not this one.
- **axe without scripting** could not run (Runtime.evaluate cannot settle a promise with scripting off); the no-script
  path is covered by `components/listing/nojs.test.ts` and the looked-at `before-nojs/` tiles.

### 1d. The ranked moves

| # | Move | Kind | Cost |
|---|---|---|---|
| 1 | The laptop's first screen fits from 1366 x 657 up: on windows under 864 px tall the column's top padding, its gaps and the headline scale with the window; under 760 the small lights line steps aside; under 700 the count takes its short form. Nothing changes at 864 px and taller. | defect | CSS in `globals.css` + two hook classes |
| 2 | The intake's first answers: the button role and the pressed state arrive with hydration (the round 68 pattern), Space answers as Enter does | defect | `HomeIntake.tsx` |
| 3 | The footer sign-off: "© 2026 Levan Tsiklauri, Licensed Real Estate Salesperson, United Real Estate Hudson Valley Edge. Each office is independently owned and operated." from `lib/site.ts` constants | defect (record) | `site.ts`, `Footer.tsx` |
| 4 | The entrance starts at 1 % opacity, so the headline's first paint counts | defect (invisible) | one keyframe |
| 5 | The map credit after the page's content in the DOM | defect (invisible) | `MlGround.tsx`, a block moved |
| 6 | The two fact-less labels ("Start here", "Reach out"): kept or dropped | taste, his pick | the branch drops them; `?r69=labels-on` on the home page draws them (one build, both looks) |

## 2. What changed, each commit with its verification (on the rebuilt :3102)

Every change was written test first (the test run red, then green). The after shots: `docs/parity/r69-home-shots/after/`
(390, 768, 1280, 1920), `after-short/` (1366 x 657, 1536 x 730, 1280 x 800, 1440 x 789), `labels-on/`; the before
shots are named in §1.

- **`2a08254` the laptop's first screen on a short window** (`app/globals.css`, three height queries, laptops only;
  `app/page.tsx` marks the small line `data-hero-claim`; `components/home/laptop-first-screen.test.ts`). Under 864 px
  tall: top padding 136 px, the gaps 24 / 24 / 16 / 24, the headline `min(width size, 11.6svh)`; under 760 the small
  line steps aside; under 700 the count takes its phone form and the headline 11svh. `hero-fit.mjs` after
  (`scripts/_scratch-r69/hero-fit-after.txt`): the line in the corner 0.00 and the links in it 0.00 at all ten windows;
  1440 x 900, 1680 x 940 and 1920 x 969 identical to before (eyebrow top 196 / 236 / 265 px, headline 100 px). Headline
  at 1280 x 800 92.8 px, 1440 x 789 91.5, 1536 x 730 84.7, 1366 x 657 72.3, 1024 x 768 88 (its width size). No script:
  the no-script padding still wins where that header is a row taller (1024 x 768: header 167, eyebrow 180). Looked at:
  `after-short/` against `fit-before/`.
- **`d32ba1e` the intake's first answers** (`components/home/HomeIntake.tsx`, `components/home/intake-a11y.test.ts`):
  the served HTML's three anchors carry no role and no `aria-pressed`; after hydration `role=button pressed=false` x3;
  Space on "Selling" opens "How soon do you want to sell?" with focus on it; Back shows Selling pressed=true
  (`verify-moves.mjs`). axe after: 0 violations at 390, 768, 1280 and 1920 (`axe-after.txt`).
- **`844375b` + `301c9cf` the footer's sign-off** (`lib/site.ts` `licensee`, `licenseType`, `brokerage`;
  `components/site/Footer.tsx`; `components/site/signoff.test.ts`): "© 2026 Levan Tsiklauri, Licensed Real Estate
  Salesperson, United Real Estate Hudson Valley Edge. Each office is independently owned and operated." on every page.
  `SITE.legalName` (the default title, the structured data, the privacy and DMCA pages) is unchanged: a question (§4).
  `301c9cf`: balanced wrapping split the brokerage's name at 1280 ("United Real Estate / Hudson Valley Edge", looked at);
  each name is kept whole from `sm`, so the line breaks after "Salesperson," (2 lines at 1280, 4 at 390, 0 overflow at
  320).
- **`c83fa0d` the entrance from 1 % opacity** (`app/globals.css` `@keyframes rise-in`, `components/home/first-bundle.test.ts`):
  `lcp.mjs` after, phone profile, four runs: the headline recorded at 1,952 / 2,404 / 2,132 / 3,004 ms, each before the
  font landed (2,909 to 3,145 ms) and at the fallback paint's size (35,723); before, four runs, 3,416 / 3,468 / 4,144 /
  4,256 ms, each after the font (`lcp-after.txt`). The blog's entrance shares the keyframe: the same invisible change.
- **`0c536dd` the map credit after the content** (`components/home/ml/MlGround.tsx`, the block moved;
  `components/home/ml/credit-order.test.ts`): `taborder.mjs` after: header (stops 0 to 29), then the search (30), the
  two links, the scroll cue, the intake; no stop on the page itself. The served HTML: the credit after the search and
  before the footer. The line and the (i) draw where they did (`after/home-1280-00.jpg`, looked at).
- **`cdfd4a0` the look switch and the labels** (`components/home/look-switch.ts` + test, `app/page.tsx`,
  `components/site/Footer.tsx` `data-r69-label`, `app/globals.css` outside every `@layer`): default, "Start here" and
  "Reach out" `display: none`, the address 36 px under the logo; `?r69=labels-on`, both drawn, the address 73 px under
  the logo as live (`verify-moves.mjs`). The first build had the rules inside `@layer components`, where the address's
  own `mt-4` utility won (16 px measured): moved out, and the test now fails if they go back in (planted: the rule moved
  back inside reports `@layer components`).

## 3. The gates (on the :3102 build of the branch's code, rebuilt 15:47:20 to 15:48:58)

The code built is the committed code: after the last commit, `git diff HEAD --stat -- app components lib
next.config.ts package.json` printed nothing.

Each gate's printed line, the clock read before and after it, the exit code echoed by the shell (never a grep of
the summary standing in for it).

- **tsc** (15:57:14 to 15:58:13): `npx tsc --noEmit` printed "TypeScript: No errors found", `tsc exit=0`.
- **vitest, foreground** (16:01:03 to 16:01:55, `rtk proxy npx vitest run`): " Test Files  176 passed (176)" /
  "      Tests  2471 passed (2471)", `vitest exit=0`. (The run before it through the shell's wrapper, 15:58:27 to
  16:00:29, printed "PASS (2471) FAIL (0)", exit 0.) The 17 new tests: laptop-first-screen 4, intake-a11y 3, signoff 3,
  first-bundle +1, credit-order 2, look-switch 4. Round 68's floor was 2,282; origin/main at the start carried the
  blog rounds' tests (2,454 before this round's 17, by subtraction; not run separately).
- **crawler** (16:02:29 to 16:07:00): `node scripts/qa-crawl.mjs http://127.0.0.1:3102` printed "PASS  crawl: all 349
  internal links resolve", "PASS  mobile 390: no horizontal overflow on any page", six "PASS  county ...: 6 cards all
  in-county", "ALL PASS", `crawl exit=0`.
- **focus paint, the pinned copy with the base replaced** (`scripts/_scratch-r69/focus-paint.mjs`: `verify-focus-paint.mjs`
  with `http://localhost:3100` made `http://127.0.0.1:3102` and its output folder moved into the round's scratch):
  1440 (16:07 to 16:14:25) "checked 427 focusable elements across 7 pages at 1440x900" and "1 paint NOTHING on focus:
  0.00%  /  A  81x44  "© OpenStreetMap contributors"", exit 1; 390 (16:17:23 to 16:20:57) "checked 329 focusable
  elements across 7 pages at 390x844" and the same one reading, exit 1. That reading is round 68's known instrument
  case (an 81 x 44 box at the window's bottom edge where the link is 158 x 14): re-proved the way a visitor reaches it
  (`credit-focus.mjs`): a real Tab from "Talk to us", the content's last control, reached "© OpenStreetMap
  contributors" (the new order) and 908 of 21,600 corner pixels changed, the ring drawn (`scripts/_scratch-r69/
  credit-focus.png`, looked at).
- **dialogs probe** (16:21:17 to 16:24:51, `scripts/_scratch-r60-dialogs.mjs --tag=r69-dlg`, `dialogs exit=0`): at 1440
  and 390, signin, flyout or menu, save, suggest, quiz, quiz2, offer, connect, wizard each "light=0 contrast=0
  small16=0"; tour "light=1" (the selected day, a white button at 16.4:1, the known class since round 60); gallery at
  390 clean; "1440 gallery FAILED locator.dispatchEvent: Timeout 30000ms exceeded", twice. Not this round: today's first
  listing (`KEY1020470`) renders no `[data-lightbox-index]` tile when its photos are blocked by CDP (0, against 11 when
  they are aborted by a page route), and the round touched no listing file (`git diff --name-only 3aabe4a..HEAD`: 15
  files, none under `components/listing`, `components/idx` or the listing routes). An instrument item for the next
  listing round: the probe should pick a listing whose photos are mirrored.
- **axe** (axe-core 4.14): before, `aria-allowed-attr` critical x3 at 390, 768, 1280, 1920; after, "0 violation
  rules" at all four (`axe-before.txt`, `axe-after.txt`).
- **0 overflow at 320**: `shot-home.mjs after-320 320` printed "w=320 h=11355 tiles=14 overflow 0"; 390, 768, 1280 and
  1920 "overflow 0" (the after set), and the decision page 0 at 1280 and 390.
- **Lighthouse 12.8.2 on the home page, media and lead blocked, median of three** (`lh.mjs`; one JSON per run kept):

  | | perf | FCP | LCP | TBT | CLS | a11y | best | seo |
  |---|---|---|---|---|---|---|---|---|
  | mobile before (14:52) | 53 (51, 53, 60) | 1.24 s | 5.79 s | 1,266 ms | 0.003 | 95 | 75 | 69 |
  | mobile after (16:28) | 59 (56, 61, 59) | 1.24 s | 5.69 s | 786 ms | 0.003 | **100** | 75 | 69 |
  | desktop before | 96 (97, 95, 96) | 0.34 s | 1.23 s | 96 ms | 0.001 | 95 | 74 | 69 |
  | desktop after (16:28) | 90 (96, 90, 75) | 0.33 s | 1.93 s | 79 ms | 0.002 | 100 | 74 | 69 |
  | desktop after, rerun alone (16:35) | 97 (97, 95, 97) | 0.34 s | 1.24 s | 64 ms | 0.002 | 100 | 74 | 69 |

  What it shows: accessibility 95 to 100 (the intake's attribute); the desktop's first after run had one 75 (the push
  to origin ran in the same minutes) and the rerun alone is level with before; Lighthouse's SIMULATED mobile LCP (5.79
  to 5.69 s) and TBT move inside their run-to-run spread, so no gain is claimed from them. The entrance's gain is the
  real browser's (§2: the headline recorded 1.2 to 2 s earlier on a throttled phone). SEO 69 and best-practices 74/75
  are the lab's, unchanged (§1c). Mobile bytes 2,967 KB before, 2,968 after (the look switch's 0.2 KB of script).
- **Not run, with the reason:** calibration and the walks (round 68's map gates): no plate, film, map style or camera
  changed; the credit block moved inside MlGround's JSX and nothing else in that file.

## 4. His pick, the questions for him, and what stays open

**His pick (one variable, both looks from one build):** the two labels that carry no fact, "Start here" over the
intake's heading and "Reach out" over the footer's address. B, dropped, is the branch's default and the
recommendation: each block already opens with its own heading or the logo, the frontend-design lens counts an unneeded
label over a heading as a generated tell, and DESIGN-ROUND68 §1 move 2 named it; the labels that carry a fact stay. A,
kept, is live today. On the preview: the home page as it opens (B) and with `?r69=labels-on` (A). The tiles:
`docs/parity/r69-home-decision.html` (self-contained, 500 KB of which 368 KB are its 14 JPEGs), group 3. The page also
shows the two fixes he sees before main (the laptop's first screen at three windows, the footer's sign-off), each before
and after.

**Questions for him (collected here, never asked in the chat):**

1. **The sign-off, with his supervising broker.** The footer now reads "© 2026 Levan Tsiklauri, Licensed Real Estate
   Salesperson, United Real Estate Hudson Valley Edge. Each office is independently owned and operated.", the state's
   record of his licence. Example: a page with no title of its own is still titled "RealtyLT | Levan Tsiklauri | United Real
   Estate" (`app/layout.tsx`), and the structured data names "Levan Tsiklauri | United Real Estate". What each answer changes: "the footer's words
   are right, use them everywhere" changes `SITE.legalName` (the title default, the structured data, the privacy and
   DMCA pages) and the blog author card's "United RE Hudson Valley Edge"; "the short name is fine" reverts the footer
   line to `SITE.legalName` with the licence type added; "my broker wants other words" is one constant in `lib/site.ts`.
2. **The REALTOR® line.** "Member of the National Association of REALTORS®" is a membership claim (the association's
   manual allows the mark only to show membership). Example: his NRDS number in our memory is 650537157; no primary
   source in this repo shows the membership current. What each answer changes: "a member" keeps the line; "not now"
   takes the line off every page (the test `components/site/legal-marks.test.ts` names it).
3. **The labels pick** (above). Example: the intake as it opens on the preview, against `?r69=labels-on`. What each
   answer changes: R70 handoff §1 lists the edits for each.

**Open, not his call today (each measured, §1c):** the first film's 1,339 KB fetched on load on a phone (a product
call); the header's "Top areas" opening on keyboard focus (a header round); Lighthouse mobile's TBT, mostly the page's
own scripts and the ads tag (the bootup list in §3); the blog author card's "Realtor®, licensed real estate
salesperson" (the association's manual names a title use of the mark as incorrect: the blog's next round, on his answer
to question 2).

## 5. The preview

- **Pushed** `r69-home` only (16:35:18 to 16:35:23, `* [new branch] r69-home -> r69-home`); `main` and
  `design/futuristic-r53` not pushed; no Vercel command run.
- **The preview:** https://realtylt-website-git-r69-home-levans-projects-a543d940.vercel.app, behind his Vercel
  sign-in. At 16:37:28 an unauthenticated request answered `302` to `https://vercel.com/sso-api?...` with "Protected by
  Vercel Authentication" (the expected answer; measured beside it, a branch with no deployment answers `404
  DEPLOYMENT_NOT_FOUND`, and `r68-preview` answers the same 302). Whether the build had finished cannot be read without
  his sign-in (the `gh` CLI here is not logged in): his first open of the link shows it.
- **His comparison:** the preview against https://realtylt.com at his laptop's own window (most laptops are the short
  windows of §1b.1), then the preview's home page with `?r69=labels-on` for the one pick.
