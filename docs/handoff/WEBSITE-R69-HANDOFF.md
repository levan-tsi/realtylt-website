# Website round 69 handoff: his two looks, his green pick, then ship on his word

Written 2026-10-05 by the round 68 agent (Fable 5.1, alone). Process he set and keeps: nothing with a
look change reaches `main` before he has seen it; when he says deploy, deploy (never hand him a command).

## 0. START HERE

- **Branch** `design/futuristic-r53` in the worktree `C:\Users\Levan\realtylt-website-r53` (`git -C` on
  every git call). **Nothing from rounds 65 to 68 is on `main`** (live realtylt.com = `e2507d9`). Check
  `git -C ... branch --show-current` first: round 68 left the worktree on `design/futuristic-r53` after
  its preview branch work, and :3102 rebuilt on that head.
- **His two previews, both behind his Vercel sign-in:**
  - `r68-preview` = round 68's head on today's green:
    https://realtylt-website-git-r68-preview-levans-projects-a543d940.vercel.app
  - `r68-green2-preview` = the same plus the park green baked as `#0a190a` and every plate and film
    re-rendered (see §1): https://realtylt-website-git-r68-green2-preview-levans-projects-a543d940.vercel.app
  - `r67-preview` (round 67's close) and `r66-preview` still exist; nothing points at them now.
- **His decision page for the green** (tiles): https://claude.ai/artifact/6BzWKcRVtjtPvfVAVWtb1b.
- **Read next:** `POLISH_CHECKPOINT.md` top block, then `docs/parity/DESIGN-ROUND68.md` (§1 the
  fresh-eyes assessment with eight moves that are his calls; §2 what was fixed; §3 the gates), then
  `docs/handoff/WEBSITE-R68-HANDOFF.md` §3 (the deploy procedure, unchanged).
- **Deploy is NOT yet ordered.** When he says deploy, R68 handoff §3 is the procedure, first thing.

## 1. The green: what each answer now means

Round 67 recommended `#0b1907` (tile 2). Baked into `NIGHT.wood` it breaks two laws of the night style
(`style.test.ts`: every colour at least as blue as it is red, "the listings' lights are the only warm
thing"; the plate's built land adds no hue): blue 7 against red 11. Round 68 baked the nearest lawful
hex, `#0a190a` (same L 0.195, chroma 0.036 against 0.040, hue 144 against 139; 0.005 from tile 2 in
OKLab, 0.013 from today's `#0c1810`), on branch `r68-green2`, re-pinned the six fingerprints, dropped
the `h3` study option, and re-rendered the 34 plates and 96 clips (the commit on that branch with the
pictures; calibration and walk numbers in the checkpoint's top block).

- **He picks today's green (1):** merge nothing from `r68-green2`; on `design/futuristic-r53` remove the
  study option (R68 handoff §1 "if he picks 1"), and the fingerprints come back unchanged.
- **He picks the green he sees on `r68-green2-preview` (2):** `git -C ... merge r68-green2` into
  `design/futuristic-r53` (fast-forward or a trivial merge), then remove `PALETTES`, `greenOf`, the
  `green` parameters and MlGround's `pal` passthrough and the round 67 describe (the output is
  identical, so no second render; the fingerprints stay as `r68-green2` pinned them), tsc, the style
  test, commit.
- **He wants it louder (3, `#071a06`):** that hex also breaks the law (blue 6, red 7); the lawful
  neighbour is `#071a07`. Bake it on `design/futuristic-r53` the way `f81c5df` did, re-pin, rebuild
  :3102, and run `bash scripts/_scratch-r68/rr.sh` (about 80 minutes, logs under `scripts/_scratch-r68/`),
  then calibration both surfaces, the walks, the crawler, ONE commit for the pictures.
- **He cannot tell `r68-green2-preview` from `r68-preview`:** that is an answer too (0.013 in OKLab is
  under round 66's visible step of 0.018); say so and offer the louder lawful step above.

## 2. What round 68 did (all verified on the rebuilt :3102, record §2)

`d0dc227` the no-script trio (grid tiles' role on hydration, the header caret, the calculator's buttons
and noscript line) · `fc07f93` the listing bar's stuck marker · `23ff5d1` the /buying dangling "We",
the /selling badge, the /financing "company,where" and "Loan Officer" · `528c76c` mock thumbnails blank
on a lost photo (`MlsImage.blankWhenUnavailable`) · `c40104f` the map credit's focus ring · `81dbb3a`
the record. Gates: tsc clean, vitest 2,282 of 2,282, crawler ALL PASS, dialogs probe clean, light scan
at baseline, focus paint clean (the one reported miss proved painted by a real Tab), 0 overflow at 320.

## 3. The deploy, when he says so

R68 handoff §3, unchanged, with one addition: if he has picked the green and `r68-green2` is merged,
the gate includes calibration both surfaces and the walks on the merged head before the push (round 68 read 4 to 6 frames over 34 ms at the Westchester stops on the green films against 0 to 2 on today's, possibly the file cache on fresh files: settle it there).

## 4. Open after this round

1. The eight design moves of DESIGN-ROUND68 §1 (his calls; the first three are small).
2. The lead form could WORK without scripting behind an origin check (a security decision, his).
3. `<title>` case, the CMA / MediaURL items, the preview branches (`r65-preview-a/b/c`, `r66-preview`,
   `r67-preview`) and about 1.2 GB of gitignored study files once the round is live.
4. The repo's `CLAUDE.md` still says the site is a private noindex preview; it has been public since
   September (memory [[website-is-live-pushes-are-public]]). Round 68 corrected that paragraph.

## 5. The rules that bind (R68 handoff §5, plus this round's)

- Worktree only; `export NODE_OPTIONS='--use-system-ca'`; `MSYS_NO_PATHCONV=1` for leading-slash
  arguments; the Bash tool's `grep` is rewritten by a hook (a space inside a pattern breaks it: use the
  Grep tool for anything but a single word); `git commit -F - -- <paths>` with the options before `--`.
- ONE server, :3102, rebuilt only with `scripts/_scratch-r62-rebuild.ps1`; the crawler's base is
  positional; `verify-focus-paint.mjs` is pinned to :3100 (copy it with the base replaced).
- `scripts/_scratch-*` is gitignored: a round's instruments live on disk only; name them in the record.
- A server page cannot pass a function to a client component (the build fails at export): a boolean.
- A JSX `{/* comment */}` between two text runs eats the line break on both sides: put `{" "}` first.
