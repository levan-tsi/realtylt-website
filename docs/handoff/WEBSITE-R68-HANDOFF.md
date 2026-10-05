# Website round 68 handoff: his green pick, the one re-render, then ship on his word

Written 2026-10-04 night by the round 67 orchestrator (Fable 5.1). Process he set and keeps: Fable
orchestrates, Opus builders build ONE AT A TIME, the orchestrator re-verifies every builder on the running
build before the next starts, and nothing with a look change reaches `main` before he has seen it.

## 0. START HERE

- **Branch** `design/futuristic-r53` in the worktree `C:\Users\Levan\realtylt-website-r53` (HEAD `6099d92`
  or later; `git -C` on every git call). **Nothing from rounds 65 to 67 is on `main`** (live realtylt.com
  = `e2507d9`). His previews, both behind his Vercel sign-in: `r66-preview` (round 66, `bb40dc7`) and
  **`r67-preview` (= `6914fbb`, this round's work):**
  https://realtylt-website-git-r67-preview-levans-projects-a543d940.vercel.app
- **His decision page for the green:** https://claude.ai/artifact/6BzWKcRVtjtPvfVAVWtb1b (1 today, 2
  recommended `#0b1907`, 3 `#071a06`; its source is the session scratchpad's `round67-green-pick.html`
  built by `build-decision.mjs` from `scripts/_scratch-r67/owner/*.jpg`).
- **Read next:** `POLISH_CHECKPOINT.md` top block, then `docs/parity/DESIGN-ROUND67.md` §1 (the study's
  arithmetic and method) and §3 (every result with its numbers).
- **Deploy is NOT yet ordered.** When he says deploy, section 3 is the procedure, and it goes first.
- **Never hand him a terminal command.** Give him clicks (Notepad, the Run dialog, a web page) or do it.

## 1. His pick on the green, and what each answer means

He has three tiles. The study (DESIGN-ROUND67 §1, §3a) found that a hue move at the shipped amount of
colour cannot be seen (0.006 to 0.008 in OKLab on the plate; round 66 read 0.018 to 0.020 as a step), so
version 2 is the first visible step and version 3 is a step louder; both hold the darkness and the blend.

**If he picks 1 (today):** remove the study option and render nothing. Revert what `7f9cf37` added:
`PALETTES`, `greenOf`, the `green` parameters of `tiledLayers` / `plateLayers` and `nightStyle`, the `pal`
passthrough in `MlGround.tsx`, and the round 67 `describe` in `style.test.ts`. The four fingerprints must
come back unchanged (the option is inert without its id, so they do).

**If he picks 2 or 3:** bake it, then ONE re-render, then the gates, then his look:
1. `style.ts`: `NIGHT.wood` and `NIGHT.park` to the hex (`#0b1907` or `#071a06`); remove the option as
   above. `style.test.ts`: the round 67 describe goes; the three plate fingerprints and the live one are
   re-pinned ON PURPOSE (run the file, copy the new 16-hex shas into the four `toBe` lines, keep the
   "re-pinned on purpose: round 67's green" comment). Also the round 66 "city parks" test asserts
   `NIGHT.park === NIGHT.wood`: keep them equal. tsc, the style test, commit.
2. Rebuild :3102 (`powershell -File scripts/_scratch-r62-rebuild.ps1`).
3. The five steps, in the FOREGROUND or as one background shell script with a log per step
   (round 66's logs `scripts/_scratch-r66/rr-*.log` show what a good run prints), the box otherwise idle:
   - `node scripts/make-plates.mjs --stage=shoot --deep=1 --headless` (34 plates, about 6 minutes, 0 errors;
     every shot is deep now, the hero and the region in the live style)
   - `node scripts/make-plates.mjs --stage=encode --deep=1` (136 files to `public/plates`, about 25 MB;
     `components/home/plates/plates.gen.ts` must come back UNCHANGED; then
     `git checkout -- docs/design-r59/plates-wide.jpg docs/design-r59/plates-tall.jpg`, the encoder overwrites them)
   - `node --experimental-strip-types scripts/make-flights.mjs --stage=shoot --headless` (32 pairs both
     aspects, about 47 minutes; NEVER `--only`: a partial run rewrites `flights.gen.ts` with only what it
     recorded)
   - `node --experimental-strip-types scripts/make-flights.mjs --stage=grade` (about 4 minutes; the
     first/last frames against their plates print as "mean 0.00 levels" to a few tenths)
   - `node --experimental-strip-types scripts/make-flights.mjs --stage=encode` (about 20 minutes, 96
     clips, about 100 MB; `flights.gen.ts` may change in its z columns alone, indices 2, 6, 10, 14 of a
     matrix: the terrain's planes, harmless; the encoders write LF manifests that git shows as modified
     under autocrlf: `git diff -w` empty means line endings only, `git checkout --` them)
4. The gates on the rebuilt server: calibration laptop and `--phone` (`scripts/_scratch-r58-calib.mjs`,
   then `--shots=putnam,region`: 0.00 px, the region 0.10 / 0.06); the walks both surfaces
   (`scripts/_scratch-r58-transition.mjs`: 16 films / 0 fades); the phone contrast kit
   (`scripts/_scratch-r57l-contrast.mjs --phone`: 0 under the floor at p95); hover and taps
   (`scripts/_scratch-r57l-hover.mjs`); the crawler (`node scripts/qa-crawl.mjs http://127.0.0.1:3102`);
   `npx tsc --noEmit`; `npx vitest run` in the foreground, exit code 0, 2,277 or more.
5. ONE commit for the pictures and the manifests (plates + films, about 125 MB of binary; never a second
   encode in history: round 59 had to rewrite history for one), then `git push origin HEAD:refs/heads/r67-preview`
   for his look. Then the record's §3a gets the baked value and the measured hue on the new plates.

## 2. What round 67 did (all on the branch, all verified by the orchestrator on the running build)

- `7f9cf37` the renderer-only `?pal=` study option (inert without its id; fingerprints pinned);
  `1b4cb64`, `ae059ba`, `da565c8`, `e404609`, `d9a2e01`, `af373be`, `6099d92` the record.
- `1bf6777` (Opus builder 1) the two geocoder rules: a Non_Exact Census answer on another street is
  refused (compared against the street SENT, read from Census's echo field), and a feed zip typo is judged
  against the matched zip when the city agrees; 18 tests; nothing already stamped is re-judged.
- `f98e547` the /connect booking sheet in a mount (Google's embed has no theme parameter).
- `28a3f78` (Opus builder 2) a listing page with JavaScript off shows no control that does nothing:
  tour/offer, the photo viewer's triggers, Share, Save step aside; one noscript block with the number and
  "Book a time"; visible dead buttons 21 to 12 at 390, 32 to 13 at 1440; scripting-on pixel-identical.
- `9275148` the orchestrator's follow-ups: the lead form on every surface steps aside without scripting
  (its no-script submit was a GET with the visitor's details in the URL), a listing's photos show without
  scripting (`[data-mls-img]` lifted), card photo arrows step aside.
- `1e8c0be` (Opus builder 3) the phone's Highlands horizon: `highlands.tall` carries `horizon: 0.16`, a
  linear ramp on the lights' alpha from the top edge (unlit, lit, featured; the film blends source and
  destination bands by the frame shown); "Featured listings" p99 2.2 to 7.9; calibration 0.00; laptop
  unchanged.
- `6914fbb` the home page's MLS line a step lighter on the night map (night-only, through the component's
  className): 4.27 to 4.41 between the Highlands stops became 6.15 to 6.36; the `dark` variant is NOT the
  way (under the night root `--color-paper` is the night).
- Measured and closed without a change: /financing's phone hero (7.6 to 18.7 against the photo pixels).

## 3. The deploy, when he says so (first thing that session)

1. `git -C C:/Users/Levan/realtylt-website-r53 fetch origin`; confirm `origin/main` is still `e2507d9`
   (if it moved, merge it into the branch first and re-run the gate).
2. The gate on the branch head, in the FOREGROUND: `npx tsc --noEmit`; `npx vitest run` (2,277 is the
   floor, exit code 0, never a grep of the summary); `node scripts/qa-crawl.mjs http://127.0.0.1:3102`
   against the :3102 production build (`powershell -File scripts/_scratch-r62-rebuild.ps1`); calibration
   laptop and `--phone` (`scripts/_scratch-r58-calib.mjs`, then `--shots=putnam,region`); the walks both
   surfaces; the phone contrast kit.
3. If his green pick is still pending, deploy WITHOUT it is fine: the option is inert and the plates are
   round 66's; the re-render can follow as its own deploy.
4. Push the branch head to main from the worktree (the main checkout at `C:\Users\Levan\realtylt-website`
   is not touched): `git -C C:/Users/Levan/realtylt-website-r53 push origin HEAD:main` (a PUBLIC deploy of
   realtylt.com; every push to main is public).
5. Verify LIVE on a regenerated page (`node scripts/_scratch-r64-watch.mjs`): header and footer present,
   the logo served from `/logo-realtylt-navy.png`, the hero plate and the first film, the Where we work
   sentence, a listing page's lead card, /connect's mount, no runtime errors; the geocode runner's next
   hourly tick logs no new rejection class it should not (the two rules apply to new geocodes only).
6. Then his look on a real iPhone (the lifted map, the parks, the Highlands horizon, a flick through the
   counties, a listing with the phone's data saver / scripting off if he likes).

## 4. Open after this round (owner's calls or a later round)

1. **The lead form without scripting could WORK instead of stepping aside:** accept
   `application/x-www-form-urlencoded` in `/api/lead` behind an origin check (`Sec-Fetch-Site: same-origin`
   or an Origin allowlist) and redirect to /thank-you. It loosens the JSON-only content-type guard, which
   exists because a form post is a cross-site simple request: a security decision, his, with the check
   designed first. Until then the noscript line (number + email) stands.
2. The closed photo grid's 33 tiles carry `role="button"` without scripting (set the role once hydrated);
   the mortgage calculator's four buttons and the header's top-areas caret do nothing without scripting.
3. "See more listings" at the Highlands' second stop keeps a p99 of 1.24 (mid-distance lamps under the
   button; a 0.3 band would dim the top third): left by design, as round 65 left its single-lamp p99s.
4. The horizon band is a share of the window's height, measured at 390x844; other phone sizes could put
   the horizon elsewhere (the cover fit). A 320x568 and a 430x932 reading would settle it.
5. realtylt.com/ai's typeface (Bricolage there, Schibsted here): his call, the /ai lane.
6. The `<title>` tags keep Title Case by round 63's rule; the published-CMA enumeration and raw MLS
   MediaURLs items in `docs/parity/PRELAUNCH-AUDIT.md` need a paired CRM change.
7. Cleanup: the `r65-preview-a/b/c` branches on origin once he no longer needs them; `scripts/_scratch-r67/`
   holds about 450 MB (the hue study's `raw` 140 MB and `page` composites, deletable once he has picked;
   keep `owner/` and `hue/sheets` until the round is live); `scripts/_scratch-r66/` 143 MB (keep
   `look/sheets`, `logo/sheets`, `final/`, `owner/`, `ratio/` until live).
8. The 16 geocoder rows refused in the Google pass (zip typos) would place under rule B on an owner-approved
   `node scripts/backfill-geocodes.mjs --google --retry` (they are stamped; a few cents).

## 5. The rules that bind (round 67's handoff §4, plus this round's traps)

- Worktree only; `export NODE_OPTIONS='--use-system-ca'`; `MSYS_NO_PATHCONV=1` for any leading-slash
  argument (`/financing` became `C:/Program Files/Git/financing` once this round); no python; the Bash
  tool's `grep` is rewritten by a hook (use `-e` for each pattern; `\|` alternation breaks).
- `git commit -F - -- <paths>`: the options BEFORE the `--` (the other order made `-F` a pathspec).
- ONE server, :3102, rebuilt only with `scripts/_scratch-r62-rebuild.ps1`; the crawler's base is a
  positional argument (`node scripts/qa-crawl.mjs http://127.0.0.1:3102`), not a flag.
- The calibration script's fourth stop reads NaN unless asked first (`--shots=putnam,region`).
- Under the night root `--color-paper` IS the night: `text-paper/NN` is dark ink there. The `dark` variant
  of `MlsAttribution` (and any "ink section" variant) is for day pages only. Measure, do not assume.
- A colour judged on the swatch lies: the plate's blend adds 15 to 50 hue degrees of blue to a fill (the
  moonlit relief over steep woods). Judge a map colour on the RENDERED plate, after the arithmetic.
- Reading a claude.ai artifact that embeds data-URI images dumps the base64 into the context: build the
  next decision page from its source file, never from a read.
- Between re-render runs three flight matrices change in their z column alone; calibration decides.
- NEVER `git worktree remove --force` or any recursive delete on a tree that may hold a junction.
- Secrets: never in a commit, a doc, a log or the chat; the Google server key lives in the worktree's
  `.env.local` (gitignored) and is verified by name only.
- Commits with pathspecs and real reasoning; the Fable co-author line on the orchestrator's commits; a
  builder signs as itself. Subagents never touch RLS, auth, CSP, the MLS sync or the lead path.
- Headless Chrome does not paint Google's booking page: /connect's mount is checked with a white page
  served in its place (`scripts/_scratch-r67/connect/shot.mjs after white`).

## 6. State at writing (2026-10-04 night)

- Gates on `6914fbb` (the final build on :3102): tsc clean; vitest 163 files, 2,277 of 2,277, exit 0;
  calibration 0.00 px at the hero, Queens, Dutchess County and Putnam on both surfaces, the region 0.10
  laptop / 0.06 phone; the phone contrast kit at the two Highlands stops 0 under the floor at p95; the
  crawler's result is in the checkpoint's top block.
- The decision page is published and private to him; `r67-preview` is deployed behind his sign-in.
- Memory: `~/realtylt-claude-config/memory/website-round67-2026-10-04.md` and the `MEMORY.md` pointer.
