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
| 6 | The two fact-less labels ("Start here", "Reach out"): kept or dropped | taste, his pick | behind `?r69labels=off` for the tiles |
