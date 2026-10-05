# Website round 67 handoff: polish round 66's look, place the last homes, then ship

Written 2026-10-04 evening by the round 66 orchestrator (Fable 5.1). Process he set and keeps: Fable
orchestrates, a Haiku scout reads, Opus builders build ONE AT A TIME, the orchestrator re-verifies every
builder on the running build before the next starts, and nothing with a look change reaches `main`
before he has seen it.

## 0. START HERE

- **Branch** `design/futuristic-r53` in the worktree `C:\Users\Levan\realtylt-website-r53` (HEAD 81614f4
  or later; `git -C` on every git call). **Nothing from rounds 65 or 66 is on `main`** (live realtylt.com
  = `e2507d9`). The preview he looks at is branch `r66-preview` (= `bb40dc7`, the same code; the later
  commits are docs and one database migration record):
  https://realtylt-website-git-r66-preview-levans-projects-a543d940.vercel.app (his Vercel sign-in).
  His decision page: https://claude.ai/artifact/7zWea3QXvKMAbzzXqrDo4G.
- **Read next:** `POLISH_CHECKPOINT.md` top block, then `docs/parity/DESIGN-ROUND66.md` §0, §6a, §6d,
  §6e, §6f. The rules that bind are round 65's handoff §5 (`docs/handoff/WEBSITE-R65-HANDOFF.md`) plus
  round 66's traps in section 4 below.
- **His verdicts so far (2026-10-04):** preview a's framing; the darker water; the relief; **the green
  stays** ("let's keep green"); his logo with the navy lifted (lift3) shipped without objection; the
  blog titles in sentence case. He asked for this handoff "to work and polish more".
- **Deploy is NOT yet ordered.** When he says deploy, section 3 is the procedure, and it goes first.
- **Never hand him a terminal command.** The `!` prefix in his terminal runs a plain Windows command
  shell; two of the orchestrator's one-liners failed on him this round. Give him clicks (Notepad, the
  Run dialog, a web page) or do it yourself.

## 1. His words (2026-10-04 evening, a voice note, cleaned)

"I'm not sure on the green, I kind of like it. Should we bring another colour or keep it with just dark
ones? Recommend, or continue polishing both and see which is best. We always had the Maps API in the
environment because the search uses Google Maps, use it. Supabase had warnings on the security check:
check that and make sure everything is safe, we don't put APIs on the front. What else is left for the
next session?" Then: "Let's keep green, but prepare the handoff for the next session to work and polish
more."

The orchestrator's answer on the green, which he accepted: keep it, keep it dark, no third colour family
(a brighter or warmer hue pulls the eye off the lamps; round 38's lesson). Polish the HUE, not the
amount: the woods' fill measures a touch teal on the blue-grey land (OKLCH hue 171 to 186 on the plate
against a forest green near 145).

## 2. The polish list, ranked by what he will see

1. **The green's hue, one study then one re-render.** Restore the renderer-only `?pal=` study option
   (e37bc0d shows the wiring; it must stay inert without its parameter, the fingerprint tests prove it)
   with three park/wood fills at the SAME darkness as today's `#0c1810`: as shipped; a step greener
   (less blue in the fill, for example `#0b190c`); a step warmer olive (for example `#10190c`). Render
   the Highlands' second stop (53 % wood), Dutchess-county, Queens (Flushing Meadows) and the hero at
   both aspects, composed on the real page, 1:1 crops, the OKLCH hue and the WCAG blend number measured
   as builder 1 did (`scripts/_scratch-r66/look/measure.mjs`, `tables.mjs`). Show him three tiles; on
   his pick, bake, remove the option, re-pin the fingerprints, ONE re-render with the five steps of
   round 66's runner (`scripts/_scratch-r66/rr-*.log` show what a good run prints; the script was
   `scratchpad/rr66.sh`, re-create it from DESIGN-ROUND66 §6c; ~85 min; both manifests must come back
   unchanged), then calibration, walks, contrast, hover, taps.
2. **The Google geocoding pass: DONE 2026-10-04 late evening** (320 placed of 811; the lights' scope at 97.7 % placed; record §6g). The key is in the worktree's `.env.local` (gitignored). To repeat later for new misses:
   `node scripts/backfill-geocodes.mjs --google --retry --dry`, read the counts, then without `--dry`.
   About 811 rows: 430 with a house number can be placed; 360 with none cannot by any geocoder; 12 are
   zip typos (item 3). Afterwards re-query the headline numbers and the per-county table (DESIGN-ROUND66
   §6b) and put them in the record.
3. **Two geocoder rules** in `lib/idx/geocode.mjs` `rejectReason`, with tests: refuse a Census Non_Exact
   answer whose street directional or name differs from the ask ("50 North Broadway" placed at "50 S
   Broadway", KEY1041042); and when the feed's zip is a typo but the matched city agrees, measure the 15
   km gate against the matched zip (about ten homes; the five Kingston 12401 homes at 15.1 to 16.5 km).
4. **A listing page with JavaScript off** shows 18 controls that do nothing (offer, share, save, the
   photo viewer, the tour strip). Either they work without JavaScript (a form post, a plain link) or
   they step aside the way the header menu and the page pill do (`data-js-only`).
5. **The phone's Highlands horizon:** the tall camera sees to the horizon and a dense row of lamps sits
   behind "Featured listings" (2,609 far homes in the frame's top tenth). A horizon fade on the lights
   layer for the tall aspect at that stop, or the plate's top band darkened, measured so the words stay
   at 4.5:1 and the calibration stays 0.00.
6. **/connect's booking widget** is a white third-party card on the dark page (Google's calendar; known
   since round 60). Options: the vendor's dark theme if one exists, a dark frame around it with the
   site's own "Call or text" first, or a plain dark booking form that posts to the same calendar.
7. **/financing on the phone:** the pre-approval text sits over a busy photo; no probe measures it.
   A grade on the photo under the words, or the words on the night ground below the photo.
8. **realtylt.com/ai's typeface.** The /ai page is its own repo (`~/realtylt-ai-page`) and still sets
   Bricolage Grotesque, the family the main site used until round 65 moved everything to Schibsted
   Grotesk; the two sites no longer share a face. His call: move /ai to Schibsted for one brand voice,
   or keep Bricolage there (it was his pick for /ai). Not a website-repo task; it rides the /ai lane.
9. **Open from earlier rounds, still true:** the `<title>` tags keep Title Case by round 63's rule (his
   call if he wants them in sentence case too); the published-CMA enumeration and raw MLS MediaURLs
   items in `docs/parity/PRELAUNCH-AUDIT.md` need a paired CRM change.
10. **Cleanup:** delete the `r65-preview-a/b/c` branches on origin once he no longer needs them; the
    `scripts/_scratch-r66/` folder holds about 1.2 GB of study raws, encodes and sheets (gitignored);
    keep `look/sheets`, `logo/sheets`, `final/`, `owner/` and `ratio/` until the round is live, delete
    `look/raw`, `look/enc`, `look/page*` now.

## 3. The deploy, when he says so (first thing that session)

1. `git -C C:/Users/Levan/realtylt-website-r53 fetch origin`; confirm `origin/main` is still `e2507d9`
   (if it moved, merge it into the branch first and re-run the gate).
2. The gate on the branch head, in the FOREGROUND: `npx tsc --noEmit`; `npx vitest run` (2,222 is the
   floor, exit code 0, never a grep of the summary); `node scripts/qa-crawl.mjs` against the :3102
   production build (`powershell -File scripts/_scratch-r62-rebuild.ps1`); calibration laptop and
   `--phone` (`scripts/_scratch-r58-calib.mjs`, then `--shots=putnam,region`); the walks both surfaces.
3. Push the branch head to main from the worktree (the main checkout at `C:\Users\Levan\realtylt-website`
   is not touched): `git -C C:/Users/Levan/realtylt-website-r53 push origin HEAD:main` (a public deploy
   of realtylt.com; every push to main is public).
4. Verify LIVE on a regenerated page (`node scripts/_scratch-r64-watch.mjs`): header and footer present,
   the logo served from `/logo-realtylt-navy.png` (the old path is gone; if a browser cache shows the
   cyan wordmark, a hard reload; the file name changed for this reason), the hero plate and the first
   film, the Where we work sentence, a blog post title in sentence case, no runtime errors.
5. Then his look on a real iPhone (the lights on the lifted map, the parks, a flick through the counties).

## 4. The rules that bind (round 65 handoff §5, plus round 66's traps)

- Worktree only; `export NODE_OPTIONS='--use-system-ca'`; `MSYS_NO_PATHCONV=1` for leading-slash args;
  no python; the Bash tool's `grep` is rewritten by a hook (inside a script file it is the real grep).
- ONE server, :3102, rebuilt only with `scripts/_scratch-r62-rebuild.ps1`; timing probes run alone; the
  first walk after a rebuild can show a one-off long frame (173.8 ms seen; 48.4 on the second run).
- The calibration script's fourth stop reads NaN unless asked first (`--shots=putnam,region`).
- Between re-render runs three flight matrices change in their z column alone (the terrain's near and
  far planes); calibration decides, not the diff.
- The encoders write LF manifests that git shows as modified under autocrlf: `git diff -w` empty means
  line endings only; `git checkout --` them.
- A scratch script outside the repo cannot import playwright: run it from `scripts/_scratch-*`.
- Long heredocs and `node -e` strings with apostrophes or backticks break the Bash tool's command: write
  files with the Write tool, run scripts from files.
- NEVER `git worktree remove --force` or any recursive delete on a tree that may hold a junction; remove
  the link first with PowerShell `(Get-Item $p -Force).Delete()` and verify it is gone (round 66 lost
  the main `node_modules` this way; `npm install` repaired it).
- Secrets: never in a commit, a doc, a log or the chat; name variables by name. The browser Maps key is
  referrer-locked by design and is never used for a bulk job. Revealing a key is the owner's step; the
  permission system refuses it for the agent, and that refusal is not to be worked around.
- Commits with pathspecs and real reasoning; the Fable co-author line on the orchestrator's commits; a
  builder signs as itself. The commit classifier refuses "production" / "applied live" in messages.
- Subagents never touch RLS, auth, CSP, the MLS sync or the lead path.

## 5. State at writing (2026-10-04 evening)

- Gates on `bb40dc7` (= the preview): tsc clean; vitest 161 files, 2,222 of 2,222; crawler ALL PASS;
  calibration 0.00 px hero / Queens / Dutchess / Putnam both surfaces, region 0.10; walks 16 films / 0
  fades both; phone contrast kit p95 at or above the floors; hover 50 of 50; taps 30 of 30.
- Database: the Census retry placed 45 homes (04e516a; the hourly sync carries the Queens hyphen retry,
  c4a267c); Supabase's four RLS-off tables and the SECURITY DEFINER view fixed (31dc8e2, applied).
- **The Google key is his step, no terminal:** Win+R, paste
  `notepad C:\Users\Levan\realtylt-website-r53\.env.local`, Enter; at the very end of the file add one
  line `GOOGLE_MAPS_API_KEY=` followed by the key from Google Cloud (project realtylt-crm, Credentials,
  "Maps Platform API Key", Show key; it allows the Geocoding API with no application restriction); save.
  The session then verifies by NAME only (`grep -c '^GOOGLE_MAPS_API_KEY=' .env.local`) and runs item 2.
  Cost: Google's Geocoding API includes a monthly free allowance (10,000 calls at the time of writing);
  at list price $5 per 1,000, 811 calls would be about $4 at most.
- Memory: `~/realtylt-claude-config/memory/website-round66-2026-10-04.md` and the `MEMORY.md` pointer.
