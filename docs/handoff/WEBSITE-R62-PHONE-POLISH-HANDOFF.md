# Website round 62 handoff: THE PHONE (written 2026-09-26)

## 0. START HERE

**The owner's words (2026-09-26, after testing realtylt.com on his phone):** "It's not as good as the
computer. Computer is amazing, but phone, it's not looking as effective. Map is not really shown. Also
on the bottom of the left side it has like a dark cloud around it, and that has to be gone as well. It
needs a lot of polish for the phone version."

**And then, the round's real goal in his words:** "It has to figure out the way how to show what we have
on the phone too, properly. It lost all the effect on the phone." This is a DESIGN problem before it is a
polish problem: on a laptop the effect is the lit night map as the page's ground, the lights you can
point at, and the flight between places, with the words set beside it. On a phone the same page stacks
the words over the map and covers it, so the effect disappears. The planner's first job is to decide how
the phone shows the effect, then build it. Directions to weigh, measured and looked at, not assumed:
- give the map its own moments on a phone: a first screen where the lit territory fills most of the
  screen and the words are few and small (the headline and the search), the rest below the fold;
- between sections, let the map breathe: a stretch of the page with no words where the plate and the
  film play full screen (the phone's scroll is the flight), instead of every section's text over it;
- scrims only as big as the words they protect, never a wash over the whole map;
- the lights sized and spaced for a thumb and a small screen, the tap label readable;
- the county list on a phone: a compact form that leaves the place visible (for example a horizontal
  row of chips or a short list under the picture, not over it).
Make two or three phone compositions of the first screen and one county stop, look at them side by side
(frames at 390 x 844), pick the one that brings the effect back, record why in the round's record, then
split the build across the three builders.

**The process he ordered for this round:** ONE Opus session (no Fable orchestrator: usage is spent). That
session plans the round itself, then runs **three builder agents, one at a time** (Agent tool,
`model: "opus"`, each finishing and being verified before the next starts), each polishing a part of
the phone version. The session is both the planner and the verifier: after each builder it re-runs the
gates itself on a rebuild from HEAD and LOOKS at the phone frames before starting the next. Then it
pushes to `main` (a PUBLIC deploy: realtylt.com is live) only after the full gate, and verifies live.

**The desktop is approved ("amazing"). Nothing on the 1440 layout may regress.** Every change is
scoped to the phone (below the page's `lg` / 1024 px breakpoint, or `max-width` queries), and every
builder proves the 1440 frames unchanged.

## 1. What the orchestrator saw on 2026-09-26 (Chrome as an iPhone 13, 390 x 664 viewport, 3x)

Frames: `scripts/_scratch-r62/phone/` (gitignored; probe `scripts/_scratch-r62-phone.mjs` takes the
top screen and three stops and prints what paints at four bottom-left points).

1. **The first screen (hero):** the map is a thin band on the right: the county names Dutchess, Putnam,
   Westchester and a scatter of lights squeezed between the headline and the paragraph. The territory
   plate for the phone (`public/plates/hero-tall-*`) is framed for a tall window but most of it sits
   under the words and their scrims; the city (NYC, where most lights are) is not visible on the first
   screen at all. "Map is not really shown."
2. **The bottom-left dark cloud:** at the bottom-left, where the map credit's (i) now sits (24 px), a
   dark vignette still darkens the ground. Likely cause, to verify first: the ground's keep-out and shade
   for the credit corner (`CREDIT_CORNER` in `components/home/ml/MlGround.tsx`, used by `setAvoid` and a
   mask/shade described near line 332 "the credit corner's hole") was sized for the old two-line
   credit (about 176 x 40 px) and still paints its shade, and/or the `footShade` / `[data-g3d-shades]`
   layer. The credit is now only the (i) on a phone. Remove the cloud; keep the (i) legible (it has its
   own text shadow).
3. **The scroll stops (Where we work, the counties):** on a phone the list and the paragraph cover most
   of the plate; the county's signature place (Poughkeepsie's grid, the bridges) is mostly under the
   words and their dark backing ("data-quiet" scrims). The map reads as texture, not as the place.
4. **The chat launcher** (navy, bottom-right) and the (i) (bottom-left) both sit over the map at every
   stop; check they do not collide with the list's last row (the Dutchess county frame shows the launcher
   over "1,66…" homes).

## 2. The round's scope (the planner turns this into three builders' briefs)

A suggested split (the session decides and may change it after its own look):

- **Builder 1: the first screen on a phone.** The map must SHOW: reframe what the phone sees (the
  tall territory camera in `components/home/ml/shots.ts` `ML_SHOTS.hero.tall` and its plate, re-rendered
  with `node scripts/make-plates.mjs --only=hero --aspect=tall` and re-calibrated to 0.00 px), or move
  the words so the lit city has room (the headline, the count sentence, the search and the two boxed
  links: spacing, sizes, what can go below the fold), and lighten the scrims where the words do not
  need them. Remove the bottom-left dark cloud. The first screen should read: our name, the lit
  territory with the city visible, the search.
- **Builder 2: the scroll stops on a phone.** Every chapter and county stop: the signature place visible
  between the words (camera centre and range for `tall` in `shots.ts`, re-render those plates
  `--aspect=tall`, calibrate), the scrims only where text is, the list and the paragraph spacing, the
  launcher and the (i) clear of every control. The films for `tall` were recorded from the old cameras:
  if a tall camera moves, the adjacent tall films must be re-recorded (`scripts/make-flights.mjs
  --aspect=tall --only=...`, the lossless masters are under `scripts/_scratch-r57/58/flights/master/`
  for re-encodes only) and their joins re-measured, or that pair falls back to the fade over until
  re-recorded (the engine already fades when a clip is missing). Budget the time for it.
- **Builder 3: the rest of the phone site and the final polish.** /search on a phone (the pills, the
  map/grid toggle, the map height, the list), the listing page, the footer, the header's menu, forms,
  the chat panel on a phone, tap targets, spacing rhythm, type sizes, anything that looks cramped or
  unfinished at 390 and 320; then a full walk of the site on a phone, fixing what makes a visitor
  hesitate.

## 3. Where everything is

- Worktree `C:\Users\Levan\realtylt-website-r53` (git-bash `/c/Users/Levan/realtylt-website-r53`),
  branch `design/futuristic-r53`, identical to `main` at the time of writing (`2735223`). **realtylt.com
  is LIVE: every push to `main` is a public deploy.** Push only after the gate below; verify live after.
- Read first: `CLAUDE.md` (standing rules, incl. the GOOGLE MAPS KEYS section), `POLISH_CHECKPOINT.md`
  top block, `docs/parity/DESIGN-ROUND61.md` (the map round: first second, density, dead links, SEO,
  Maps), `docs/parity/DESIGN-ROUND60.md` (the dark site), `docs/parity/DESIGN-ROUND59.md` (lights,
  county plates, the film), `docs/parity/DESIGN-ROUND58.md` §3 (what a plate is).
- The home page's ground: `components/home/ml/MlGround.tsx` (the ground, the scrims, the names, the
  credit), `components/home/plates/` (the plate engine and the film), `components/home/ml/shots.ts`
  (the cameras, `tall` = phone), `components/home/g3d/glyph.ts` (the lights), `scripts/make-plates.mjs`
  (render plates; `--deep`, `--only`, `--aspect`), `scripts/make-flights.mjs` (record and encode films).
- Probes (gitignored, keep them): `scripts/_scratch-r58-*` (calib, transition, boot, reduced, nojs,
  widths), `_scratch-r57l-*` (frames `--phone`, hover `--phone`, contrast), `_scratch-r59-*` (credit,
  live, density), `_scratch-r60-*` (light scan, contrast walker, dialogs, nojs), `_scratch-r61-*`
  (longtask, mapcheck, gone), `_scratch-r62-phone.mjs`.
- Google Maps keys: the browser key allows local http://localhost and 127.0.0.1 on ports 3000, 3001,
  3021, 3100, 3101, 3102, 3777 (details in `CLAUDE.md` and the CRM's
  `docs/handoff/GOOGLE-MAPS-KEYS-2026-09-26.md`). A new local port must be added in the console.

## 4. How to run (unchanged)

`export NODE_OPTIONS='--use-system-ca'` in git-bash before any node/npm. ONE server on the shared
`.next`: the production preview on :3102 (PowerShell: stop the :3102 listener, `npx next build`, then
`$env:RLT_LAB='1'; Start-Process node node_modules\next\dist\bin\next start -p 3102`). Never a dev
server beside it, never `next build` while it runs. Gates in the FOREGROUND. Pointer and timing probes
run ALONE on a WARM server (the first run after a restart under-counts).

## 5. The gate before any push (the session runs it itself after each builder and before pushing)

- `npx tsc --noEmit` clean; `npx vitest run` green, count only up (2259 at the time of writing).
- Phone frames at every stop (`node scripts/_scratch-r57l-frames.mjs --phone`) and at 320 wide, LOOKED
  at; the same frames at 1440 unchanged from before the round (compare side by side).
- `node scripts/_scratch-r58-calib.mjs --shots=hero,queens,dutchess-county` and `--phone`: 0.00 px with
  matching light counts (any re-rendered plate must be in the list).
- `node scripts/_scratch-r58-transition.mjs --phone` and at 1440: films still play, no worse frames.
- Phone taps `node scripts/_scratch-r57l-hover.mjs --phone --stop=hero` 30 of 30; hover at 1440 50 of 50.
- `node scripts/_scratch-r61-longtask.mjs --phone`: no task over ~150 ms.
- `node scripts/_scratch-r60-light.mjs` and `_scratch-r60-contrast.mjs`: nothing new under the floor.
- `node scripts/_scratch-r58-reduced.mjs`, `_scratch-r58-nojs.mjs`, `_scratch-r60-nojs.mjs`.
- `node scripts/qa-crawl.mjs http://127.0.0.1:3102` ALL PASS.
- After the push: `node scripts/_scratch-r59-live.mjs --base=https://realtylt.com` (the two noindex
  checks FAIL by design: the site is indexable) and a look at the live phone frames.

## 6. Rules that bind

Black ground, white type, the warm yellow lights the only warmth; no gradients, no new hues (the
parks-and-water tints are the owner's pending decision, not this round's); radii 8/12/16/24/pill; body
and controls 16 px on a phone; tap targets 24 px or more; focus rings 3:1; reduced motion clean; works
with JavaScript off; no em dashes in visitor copy; no MLS Grid call anywhere; probes block `/api/media/`
and `/api/lead`; never `git add -A`; pathspec commits; never a key in a doc, commit or chat; never write
TypeScript through a bash heredoc. The map credit stays at its legal minimum (five seconds then the (i)
on a laptop, the (i) alone on a phone). Commit messages end with the session's model attribution line.

## 7. Open items carried (not this round unless the session has room)

The parks-and-water tint (his decision: `docs/design-r61/tints-*.jpg`); /search on MapLibre (1 to 2
builder sessions, his call); the five unwritten seller articles (the blog stand-ins redirect for now);
the /ai repo's chat script still has the white panel; Vercel Preview copies of the browser Maps key may
hold the old key; a Google Cloud budget alert.
