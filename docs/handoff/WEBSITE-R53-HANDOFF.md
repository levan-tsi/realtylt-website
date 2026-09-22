# Handoff: website home + search redesign, after round 53 (2026-09-22)

Read this first. The /website command's built-in brief is stale (a round-11 design brief); this file
and the owner's words below are the live brief.

## 1. The owner's verdict on round 53 (verbatim, 2026-09-22)

> "to be honest, black and white color is on each other was better. And it's not even near close to
> our AI page. Um, it needs way more multiple rounds of polish and uh, subagents and all of that."

So: round 53's navy "blue hour" palette is REJECTED (worse than the old black and white), and the level
is far below realtylt.com/ai. He wants many more rounds, with subagents building, checking and polishing.

His original ask (2026-09-21), still standing: make home and search listings "really, really good and
amazing futuristic ... on the at least same level, if not more, [as] our AI page ... maybe different
animations, transitions"; first home, then search listings; do NOT touch the AI page or other pages;
work ONLY LOCALLY, do not deploy; show it to him locally; "if its good we might deploy later".

## 2. Where everything is

- Worktree `C:\Users\Levan\realtylt-website-r53`, branch `design/futuristic-r53` (22 local commits on top
  of main `784dea6`; nothing merged, nothing pushed; main and realtylt.com are untouched).
- A production build of the branch may still be running: `http://localhost:3102` (`next start -p 3102`
  from the worktree). If it is not: `cd` there, `npx next build`, `npx next start -p 3102`. For editing,
  use a dev server on **:3101** (never :3100, which is the main tree's; never run a dev server and a
  build on the same `.next` at once; stop one first).
- Record of the round with every measurement: `docs/parity/DESIGN-ROUND53.md`; checkpoint top block:
  `POLISH_CHECKPOINT.md` (both on the branch). Videos of round 53 (mp4, untracked):
  `docs/design-r53-video/`.
- Memory: `website-round53-blue-hour-2026-09-21`, `feedback-website-r53-verdict-black-white`,
  `scoped-theme-by-token-repoint`, `canvas-additive-accumulate-intro`, `verify-cls-needs-production-build`.

## 3. What round 53 built (keep, change, or drop; judge each)

- **Scoped theme mechanism** (`app/globals.css` `.nocturne` re-points the site's colour/type tokens;
  `night:` Tailwind variant; `.daylight` escape; `lib/site.ts` NIGHT_ROUTES = `/`, `/search`; Header,
  Footer, FooterShell, NightLabel read it). KEEP the mechanism: it lets two pages change while every other
  page stays byte-identical (a checker verified 12/12 computed-style checks equal to live on 4 day pages).
  CHANGE its values: the navy palette (#0b1a2e ground, #122640 raised, #e8eef6 text, #93a3b8 muted,
  #28a8e0 actions) is what he rejected.
- **Type:** Bricolage Grotesque (the /ai page's own file, `public/fonts/bricolage.woff2`, preloaded),
  sentence case. He did not comment on type.
- **Home hero "map of lights"** (`components/home/HeroLights.tsx` + `app/api/lights` + `lib/idx/lights.ts`
  + `lib/geo/hudson-water.ts`): every active for-sale listing (15,084 with measured addresses) drawn as a
  warm light on a canvas, the Hudson from Natural Earth (public domain), lights come on north to south,
  a mouse "lantern" names the town + real count, click opens `/search?city=Town`. Data comes from our own
  Supabase only (never MLS Grid), a static route regenerated hourly (~72KB brotli). Performance tuned
  (accumulating intro, tone-mapped density). It is a 2D canvas, not the /ai page's 3D.
- **"Where we work"** tiles (`components/home/AreaLights.tsx`): each county/borough drawn in its own lights.
- /search: night filter bar, phone "Filters" fold, night Google basemap, light price chips, night popup.
- The "Why work with us" carousel was cut to 2 slides (search, save search) because the other 3 showed
  day pages; the three files are listed in `components/home/WhyCarousel.tsx`.

## 4. Fixes from round 53 that are worth keeping whatever the look becomes

These are behaviour fixes, not styling; carry them into any redo:
- Text typed into the search box before the page finishes loading was wiped (LIVE bug today):
  `components/search/LocationSuggest.tsx` seeds its value from the server-rendered input.
- Suggest town index fetched in parallel + one retry on a cold server (`app/api/idx/suggest/route.ts`);
  suggested town counts use /search's own scope (Beacon 80/80); picking a town opens the exact city;
  Recent/Saved rows re-run their stored search.
- /search layout shift 0.477 -> 0.015 on a production build (a label that wrapped the results row until
  the map landed); the result count keeps its shape while loading.
- Map preview popups shifted sideways to stay inside the map; the map's "N of M" note moved into the
  legend (it covered Google's button); marker labels without em dashes.
Gates on the branch: `npx tsc --noEmit` clean, `npx vitest run` 1504 passing (main is 1466).

## 5. Why it is "not even near" the /ai page (honest assessment to start from)

- /ai is ONE cinematic, scroll-driven 3D experience (Three.js; the camera travels galaxy -> Earth ->
  brain; sections are chapters of the journey). Round 53 kept the old page's STRUCTURE (hero, intake,
  featured rail, review, new listings, areas, why carousel, ledger, footer) and re-coloured it, with one
  2D canvas at the top. Below the hero it is still a conventional section stack.
- So the next attempt needs a real concept for the whole home page, not a palette: e.g. a scroll-driven
  3D journey down the Hudson (terrain or a stylised valley, the listings as lights, the camera travelling
  Poughkeepsie -> the harbour, sections arriving as chapters), transitions between sections, motion that
  answers the visitor. Reuse what /ai already proved (its repo `C:\Users\Levan\realtylt-ai-page`, `web/`,
  `DESIGN.md`) rather than inventing a second engine. Keep phones and reduced motion first-class.
- Colour: black and white per the owner. Probably a black ground with white type like /ai (he compared
  directly to /ai), but ASK ONE QUESTION FIRST: black ground + white type, or white page + black?
  Anti-slop rules still bind (no gradient text/buttons, no purple primary, no neon cyan, no em dashes in
  visitor copy, no arrow CTAs).

## 6. Open owner decisions carried from round 53

1. /search on a phone: the list shows 50, then becomes 150 when the map below it mounts its viewport;
   it breaks paging and Back on a phone. Should the phone list follow the map at all?
2. The listing page is still the day design; every search ends there (the walkthrough's #1 lift).
3. The home footer form repeats the intake's contact fields.
4. A county chip keeps a typed town in the box (narrows instead of switching).

## 7. How to run the next session

- SCOPE (one question to him, then work): the colour question above.
- Plan a real concept, write it into `docs/parity/DESIGN-ROUND54.md` before building, look at /ai first
  (screens at 1440 and 390, scroll through it).
- Rounds with subagents (his per-session grant; pass `model: "opus"`): builder -> fresh-eyes checker ->
  polisher -> walkthrough, repeated. Re-verify every subagent "done" yourself: gates in the foreground,
  diffs read, screenshots LOOKED at, flows driven. Keep subagents off the same files at the same time.
- LOCAL ONLY. Never push main without his explicit go (a push deploys realtylt.com). Commit on the branch
  with explicit pathspecs.
- Safety: abort `/api/lead` in every probe (live CRM), block `/api/media/` unless photos matter (MLS
  rate limits), never add an MLS Grid call to a page.
- Useful scripts on the branch (`scripts/_scratch-r53-*.mjs`, gitignored, copy them): `shot`, `el`,
  `overflow`, `prodperf` (LCP/CLS on a build), `cls` (shift sources), `live-flows` (11 user-flow checks,
  `BASE=` any host), `nojs`, `perf` (canvas frame times), `video` (walkthrough recordings).
- Before he looks: production build on :3102, a short video, and the exact URLs.
