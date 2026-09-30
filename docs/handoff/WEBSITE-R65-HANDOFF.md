# Website round 65 handoff: the map, the motion, the look (written 2026-09-30)

## 0. START HERE

**Team (his order):** Fable 5.1 (`claude-fable-5-1`) is the ORCHESTRATOR. Opus 5.5 subagents are the
BUILDERS (Agent tool, `model: "opus"`), run ONE AT A TIME (one server, one shared `.next`), each one's
work re-verified by the orchestrator before the next starts. The orchestrator works to **700-800k
tokens** and must not stop early. It keeps the builders going too (brief them for long, deep work and
resume them with SendMessage rather than letting a round end thin). **At least FIVE rounds of builder
work and polish before anything is shown to him.** The FINAL polish pass is the orchestrator's own
(Fable), after the builders, and it also runs to the 700-800k mark.

**Both surfaces:** phone AND desktop. He said so twice: "both need polish, phone version and desktop
too". Every task below is judged at 390x844, 390x664 and 320x568 (@3x) AND at 1440x900 (@2x),
1920x1080 and 1920x~940 (his own laptop window, Chrome with a bookmarks bar).

**Show before ship.** realtylt.com is LIVE: every push to `main` is a public deploy. This round's
look changes (colour, font, brightness, framing) go to him as a **preview** first. Push the work to a
branch (e.g. `git push origin HEAD:r65-preview`); Vercel builds a preview URL for it (find it with the
Vercel connector `list_deployments`, project `prj_0envsZqHojmxmbjnVCqqeXhUFQIl`, team
`team_LxVTdG0G7zPU5WSoNnZOpf8p`). Send him that link and side-by-side images. Merge to `main` only on
his yes. Pure bug fixes may still ship to `main` after the gate.

## 1. His words (2026-09-30, lightly cleaned; these ARE the brief)

> "Fable should start brainstorming and analyzing what and how to fix the map on the phone, because
> some transitions are not smooth and the map looks low quality or pixelated. On the scroll we had
> transitions from one to another, and in the beginning it just appears. Maybe we should balance it
> out so transitions are better, nice and smooth movements from one to another. Now it just appears.
> Some of them move, but some just appear. So maybe we should make all of them transition."

> "We are using a lot of Jersey area. There are no listings there. I get it, it's close and it shows,
> but maybe we can optimize it so most of the Jersey area is covered with the text and it's a closer
> look, more zoomed in, as little Jersey as possible. If Staten Island gets hidden that's fine, or
> maybe show some part of it. On the phone everything is really squeezed in and looks really low
> quality. If zooming will help, that would be nice. If not, I'm not sure. Brainstorm, do a few
> things, compare and see, then take the direction."

> "The colour of our logo was blue, and I don't like the white. Maybe we should try blue. I don't
> know if it's gonna show."

> "A font: we should find something better, for all the text."

> "My friend said it looks really dark. Maybe use a little lighter grey on the backgrounds. Maybe blur
> it out... I think blurring is not good... or light it up a little bit. The idea was it's dark and the
> lights are light, but maybe light it up a bit more, in general not too dark on the map. Maybe give a
> little more colour to the water, very blue."

> "Work and polish at least five rounds of agents before you show me. Fable orchestrator, all the
> agents, let it work till 700-800k, don't let it close earlier. The final polish should be finished
> by the Fable orchestrator, till 700-800k."

## 2. What he has already said about these (read before designing, these bind)

- **He REJECTED a zoomed-in phone hero on 2026-09-28** (P4: 60 km on the city, heading 20; live as
  469c218, reverted in 95ff9c7): "no this looks worse, some dots are on the ocean, bring it back".
  At 60 km the south-shore/Rockaway lights sat at the water's edge and read as lights ON the ocean,
  and the valley counties' names were gone. Two days later he asks again for "more zoomed in, less
  Jersey" on the phone. So: a closer phone frame is allowed, but it must (a) keep lights visibly on
  land, not at the shore against black water, (b) keep the territory reading as the territory (he
  says Staten Island may go; he did not say the valley counties may go), (c) be SHOWN to him on his
  phone (preview) with the current one side by side before shipping. Memory:
  `feedback-website-r64-phone-hero-keep-wide-view`.
- **The laptop hero was reframed and approved on 2026-09-27** (832d192: heading -15, pitch 60,
  110.8 km, centre 40.8866/-74.3111). He now still sees "a lot of Jersey". Options: let the words
  (the left ~40%) cover the NJ land and push the territory right/larger; a closer camera; a
  different bearing. Builder 2 of round 64 found that at heading 8 the old camera was already the
  tightest fit of the whole territory right of the words; getting closer means turning, cropping
  the north, or letting western Orange sit under the words. Its tools: `scripts/_scratch-r64-heroopts.mjs`,
  `scripts/_scratch-r64-heromock.mjs` (the real page with a swapped plate, exact lights/names),
  `scripts/_scratch-r64-phoneopts.mjs`, `scripts/_scratch-r64-phonemock.mjs`; the 4 phone options
  it rendered are in `scripts/_scratch-r64/phone/` (P1 75 km, P2 45 km, P3 95 km, P4 60 km).
- **Water colour:** on 2026-09-26 he said "don't touch the parks and the colours, keep them". On
  2026-09-30 he asks for "a little more colour to the water, very blue" and a lighter map. His LATEST
  words win: the water may go bluer now. Parks: not mentioned this time; leave them unless the
  lighter-map work needs a matching step (and say so). Round 61's tint studies are in
  `docs/design-r61/tints-*.jpg`; the style lives in `components/home/ml/style.ts` (the green/water
  pairs near its top, the `park` and `water` layers). A colour change means RE-RENDERING every plate
  (`scripts/make-plates.mjs`) and RE-RECORDING/RE-ENCODING every film (`scripts/make-flights.mjs`),
  because the map pictures are baked: plan it as one pass, after the palette is decided.
- **Dark site:** round 60 made the whole site dark on his order ("we're making it dark"). His friend
  finds it too dark; he asks for "a little lighter grey on the backgrounds" and a lighter map, NOT a
  light theme and not blur. Tokens: `app/globals.css` `.nocturne` (the root is `.nocturne`,
  `color-scheme: dark`), `--color-night`, `--color-night-deep`, `--color-paper`, `--color-ink`. Keep
  contrast floors (4.5:1 text, 3:1 large and focus rings) measured, not assumed.
- **Logo:** the live logo is `public/logo-realtylt-night.png` (white wordmark, blue R mark); the day
  logo `public/logo-realtylt.png` exists. He wants the blue back ("I don't like the white. Maybe try
  blue. I don't know if it's gonna show."). Try it on the dark ground and on the map; if the brand
  blue is too dark to read on near-black, show a lifted tint of the same blue beside it. Brand blue:
  take it from the logo file's own pixels, do not invent one. No vendor names in anything he or a
  visitor sees.
- **Fonts today:** display `Bricolage` (self-hosted `public/fonts/bricolage.woff2`, `--font-display`,
  the headlines), body `Lato` (`next/font/google`, app/layout.tsx; "inherited from the old vendor
  theme rather than chosen", per its own comment), serif `Newsreader` (testimonials). He wants
  "something better, for all the text". Invoke the `frontend-design` skill (it bans the templated
  defaults); propose 3 pairings side by side on the real pages (home first screen, /selling, a
  listing, the blog) with licences (Google Fonts / OFL or self-hosted with a recorded licence), then
  pick. Keep iOS inputs >= 16px, body >= 16px on mobile, CLS 0 (font metrics / size-adjust).
- **Sentence case** everywhere (round 63); the blog post titles are still Title Case (his call, never
  answered: ask once, in the report).

## 3. The transitions ("some move, some just appear")

Facts measured in rounds 63-64 (production build, desktop Chrome, `node scripts/_scratch-r58-transition.mjs`):
- Phone walk: **15 films, 1 fade**. The fade is the long stretch to the harbour (no film is
  recorded for a non-adjacent jump), plus the first move BACK up the page (films behind are only
  fetched once the visitor turns).
- **Laptop walk: only 8-9 films played, 7-8 FADED** (round 64 builder 3, every setup including before
  its change). That is his "some just appear" on the desktop. Find out why per transition (clip not
  ready: `warmFilms` waits for calm on the laptop (`calm()`, 350 ms), the laptop keeps 4 decoders
  (`FILMS_KEPT`), and 2880 clips (~1.2 MB) take longer to buffer since a62cc72; or no film recorded
  for that pair) and make every adjacent transition a film. Round 63's phone-only fixes in
  `components/home/plates/plate-controller.ts` (fly on crossing in `MlGround.apply`, `routeHop`
  through the stops between, load the next hop's clip at once, a third decoder during a route) were
  kept OFF the laptop on purpose then (the laptop was approved); now the laptop is in scope.
- "In the beginning it just appears": check the FIRST transitions on both (hero -> dutchess, and the
  plate's first reveal: the cover/plate fade-in on load, `ml:reveal`), and the harbour/region tail.
- A real iPhone has never been measured (the probes are desktop Chrome with software video decode).
  The round-63 flick probe `scripts/_scratch-r63-swipe.mjs` simulates iOS momentum.
- Target: every scroll between adjacent stops MOVES (a film), on both, with no frame over ~34 ms
  added; far jumps may route through the stops between (phone already does) or get a new recorded
  flight. Report films/fades per walk before and after.

## 4. Quality ("low quality / pixelated", phone AND desktop)

Round 64 (docs/parity/DESIGN-ROUND64-QUALITY.md) already did: hero/region plates rendered one zoom
deeper in the live style (continuous roads), laptop films also at 2880, lights drawn at 3x on
phones. What is left, from its stage-A ranking: dense borough AVIFs at q50 (building edges soft),
phone films at 1170 crf 28 "slightly soft", and the phone hero's density itself (at 140 km every
road is 1-2 device px; highways fuse into bright knots: 0.097% of the middle band). The last one is
what he sees; it is a FRAMING question (§2) as much as a rendering one. Measure at device pixels
(1:1 crops) before and after, always.

## 5. The rules that bind (all learned the hard way)

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53` (== origin/main
  `1d74f01` at writing). git-bash: `export NODE_OPTIONS='--use-system-ca'`; `MSYS_NO_PATHCONV=1` for
  leading-slash args. No python on this box (use node).
- ONE server, :3102, production build, rebuilt ONLY with `powershell -File scripts/_scratch-r62-rebuild.ps1`.
- MLS: never add an MLS Grid call; probes abort `/\/api\/(media|lead)/`.
- Tests: `npx tsc --noEmit` and `npx vitest run` in the FOREGROUND (2290 passing now; only up).
  **Gate every push on vitest's EXIT CODE** (`if npx vitest run > log 2>&1; then push; fi`); a grep
  of its summary let a red test go live on 2026-09-27.
- Commits: explicit pathspecs only, never `git add -A`/`.`; real reasoning; end with the
  Co-Authored-By line the harness gives.
- **ISR:** the home page regenerates every 10 min; on Vercel a regenerated `/` has
  `usePathname() === "/index"`. Use `isHomePath()` (lib/site.ts), never `=== "/"`. Verify header and
  footer on a REGENERATED live page (`scripts/_scratch-r64-watch.mjs`), not only right after deploy.
- Laptop "unchanged" claims: A/B against the pre-round commit built in a temp worktree, same session
  (live data moves hourly; old references lie). Memory: `verify-ab-against-pre-round-build-same-session`.
- Baked assets: plates/films regenerate through `make-plates` / `make-flights`. The recorders' raw
  records for many pairs were deleted on 09-25: a naive `make-flights` run REWRITES `flights.gen.ts`
  with only the pairs it recorded. Diff every manifest; only intended lines may change.
  `make-plates` encode overwrites `docs/design-r59/plates-*.jpg`: restore them from git.
- Calibration 0.00 px (`scripts/_scratch-r58-calib.mjs`, laptop and `--phone`), taps 30/30,
  hover 50/50, the phone contrast kit (`scripts/_scratch-r57l-contrast.mjs --phone`, p95 >= 4.5),
  the 20-page walker (`scripts/_scratch-r60-contrast.mjs`), `scripts/qa-crawl.mjs`, JS-off and
  reduced-motion probes: the full list is round 62's handoff §5 (`WEBSITE-R62-PHONE-POLISH-HANDOFF.md`).
- Anti-slop: no gradient text/buttons, no purple, no neon, no em dashes in visitor copy, no arrow
  CTAs; radii 8/12/16/24/full; sentence case.

## 6. Suggested plan (the orchestrator may change it, and says why)

1. Orchestrator: brainstorm + measure (films vs fades per transition on both, 1:1 quality crops,
   the logo in blue on the real header, the current darkness in numbers: background and map
   luminance). Write `docs/parity/DESIGN-ROUND65.md` first.
2. Builder A: transitions on both surfaces (§3).
3. Builder B: framing options for phone and laptop, composed on the real page (§2), rendered as a
   preview set; the orchestrator picks candidates to SHOW, not to ship.
4. Builder C: the look. Lighter greys, map light and bluer water (one palette decision, then ONE
   re-render of every plate and film), the blue logo, the font.
5. Builders D and E: polish rounds on everything above, at every size, until nothing makes the
   orchestrator hesitate.
6. Orchestrator final polish to 700-800k, then the preview link and before/after sheets to him.
   Push to `main` only on his yes (bug fixes excepted).

## 7. State at writing

Live `1d74f01`: header/footer ISR fix (6fc27e3), Featured rail sub-pixel (5f5655f), laptop hero
reframed (832d192), deep live-style hero/region plates + 2880 laptop films (28a3086, a62cc72),
county labels for short windows (e7b2740), phone hero back to the 140 km view (95ff9c7). Records:
`docs/parity/DESIGN-ROUND63.md`, `DESIGN-ROUND64-QUALITY.md`, `POLISH_CHECKPOINT.md` top.
