# Website round 70 handoff: his look at the home page's polish, his one pick, then ship on his word

Written 2026-11-08 by round 69's home-page worker (the WEBSITE lane of Agentic OS round 27, Opus, alone). Process he
set and keeps: nothing with a look change reaches `main` before he has seen it; when he says deploy, deploy (never hand
him a command).

## 0. START HERE

- **The branch:** `r69-home` in the worktree `C:/Users/Levan/realtylt-website-r53` (`git -C` on every git call; check
  `git -C C:/Users/Levan/realtylt-website-r53 branch --show-current` first). Cut from `origin/main` `3aabe4a` after
  `design/futuristic-r53` was fast-forwarded to it (r53 had nothing origin/main lacked). Nine commits, `13f4632` to the
  record's last; nothing on `main`. :3102 is the production build of the branch's code.
- **The preview, behind his Vercel sign-in:** https://realtylt-website-git-r69-home-levans-projects-a543d940.vercel.app
  (built from the pushed branch; see DESIGN-ROUND69.md §5 for the check). His comparison: the preview against live
  realtylt.com; for the one taste pair, the preview's home page with and without `?r69=labels-on`.
- **His decision page:** `docs/parity/r69-home-decision.html` (self-contained, 500 KB; the orchestrator publishes it).
  Three groups: the first screen on a laptop window (fixed, before and after at 1366 x 657, 1536 x 730, 1280 x 800),
  the footer's sign-off (fixed, before and after), and his pick (the two fact-less labels: kept or dropped).
- **Read next:** `docs/parity/DESIGN-ROUND69.md` (§1 the audit, §2 each commit and its verification, §3 the gates,
  §4 his pick and the open items, §5 the preview); `POLISH_CHECKPOINT.md` top block.
- **Deploy is NOT ordered.** When he says deploy: §2 below, first thing.

## 1. His pick: what each answer means

- **B, labels dropped (the branch's default, recommended):** delete `components/home/look-switch.ts` and its test, the
  `LOOK_SWITCH_SCRIPT` import and `<script>` in `app/page.tsx`, the two `:root[data-r69~="labels-on"]` rule blocks in
  `app/globals.css`; then bake the drop: remove `eyebrow="Start here"` in `components/home/HomeIntake.tsx` and the
  "Reach out" `<p data-r69-label>` in `components/site/Footer.tsx`, give the footer's `<address>` `mt-9` in place of
  `mt-4`, and delete the two default rule blocks (the `display: none` on `p.t-eyebrow:has(+ h2 #value-heading)` and
  `footer [data-r69-label]`, and the address margin). Rewrite `look-switch.test.ts` as a pin that the two labels are gone and the address keeps `mt-9`.
- **A, labels kept:** delete the switch the same way and all four label rule blocks in `app/globals.css`; the labels then draw
  as live (the `data-r69-label` attribute can stay or go).
- **No answer:** deploy with B (the default) is fine only on his word; the switch is inert without the query.

## 2. The deploy, when he says so

The R68 handoff §3 procedure, with this round's names: fetch; if `origin/main` moved past `3aabe4a`, merge it into
`r69-home` and re-run the gate; the gate on the head in the FOREGROUND (`npx tsc --noEmit`; `npx vitest run`, 2,471 is
the floor, exit 0; the :3102 rebuild with `scripts/_scratch-r62-rebuild.ps1`; `node scripts/qa-crawl.mjs
http://127.0.0.1:3102`); this round touched no plate, film or map style, so the calibration and the walks are not part
of this deploy's gate; `git -C C:/Users/Levan/realtylt-website-r53 push origin HEAD:main` (a PUBLIC deploy); verify on
realtylt.com in a browser (plain fetches get Vercel's 429 challenge): the home page at 1366 x 657 and 1280 x 800 whole,
the footer's sign-off on two pages, the intake's first answer by Space.

## 3. Open (his calls or a later round)

1. **The sign-off with his supervising broker** (§4 of the record): the footer now prints the state's record; whether
   `SITE.legalName` ("Levan Tsiklauri | United Real Estate": the default page title, the structured data, the privacy
   and DMCA pages) should carry the licensed name too, and whether the blog author card's "Realtor®, licensed real
   estate salesperson, United RE Hudson Valley Edge" should read the same.
2. **The first film's weight** (1,339 KB on a phone, fetched on load): deferring it to the first scroll is a product
   call (a fast scroller would lose the first flight).
3. **The header's "Top areas" opens on keyboard focus**, so a keyboard visitor tabs through eleven areas to pass it:
   a header round (every page), not a home-page polish.
4. The rest of DESIGN-ROUND68 §1's eight moves are other pages (the three-across cards, /services' numbers, /reviews,
   the calculators, the blog's label and glow, the Title Case names).

## 4. The rules that bind (R69 handoff §5, plus this round's)

- Worktree only; `export NODE_OPTIONS='--use-system-ca'`; `MSYS_NO_PATHCONV=1`; the Bash tool's grep is rewritten by a
  hook (use the Grep tool); `git commit -F - -- <paths>` with options before `--`; a file staged in part is committed
  WITHOUT a pathspec (a pathspec commits the whole working file), after `git diff --cached --stat` shows only yours.
- ONE server, :3102, rebuilt only with `scripts/_scratch-r62-rebuild.ps1`; `scripts/_scratch-*` is gitignored (this
  round's instruments: `scripts/_scratch-r69/`); `docs/parity/r69-home-shots/` is gitignored.
- A rule in `app/globals.css` inside `@layer components` (lines 203 to 474) loses to any Tailwind utility on the same
  property; a rule that must beat a utility goes outside every layer.
- Python or a heredoc that writes a file on Windows: bytes or `newline=""`, and no doubled backslash escapes through a
  heredoc (the Write or Edit tool for those); a text-mode pipe into `git apply` writes CRLF and the patch fails.
- A source-pinning test reads the working file, which is CRLF on this checkout: normalise `\r\n` first.
