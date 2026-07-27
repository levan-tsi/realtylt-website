# FLAGSHIP BLOG — handoff brief (single agent, ~700k, build it scene by scene)

## STATUS / PROGRESS (updated 2026-07-26, session 2)

**Live and verified on production** (`realtylt-website.vercel.app/blog/ai-chat-assistant-real-estate-website`),
read by eye at 1440 and 390 DPR3, zero page errors, no horizontal overflow, 0 em dashes, 0 arrow
glyphs, 1 H1 / 9 H2 / 3 JSON-LD blocks intact:

| # | scene | key | state |
|---|---|---|---|
| 1 | Cold open (11:40pm as a lit clock) | hero, `ColdOpen` | DONE |
| 2 | Response gap (two stamps, the cooling line) | `response-gap` | DONE |
| 3 | Leads calculator (interactive) | `leads-calculator` | DONE |
| 4 | Four moves | `four-moves` | DONE |
| 5 | The teardown / watch it handle a real lead | `teardown` | DONE |
| 6 | Where it goes wrong (three failure modes) | `failure-modes` | DONE |
| 7 | Animated flow diagram | — | **DELIBERATELY NOT BUILT** (see below) |
| 8 | The pull quote | `pull-quote` | DONE |
| 9 | The funnel | `funnel` | DONE |
| + | "In short" (skimmable summary) | `in-short` | DONE (added from research) |
| + | Floating table of contents | `FlagshipToc` | DONE |

**The storyboard is complete.** Scene 9 also suppresses the template's generic "Ask us" band on
the flagship, so the piece has one ending rather than two.

**SCENE 7 WAS CUT ON PURPOSE.** The storyboard called for an animated flow diagram
(visitor / chat / MLS / text / CRM / booked). That is exactly the chain the teardown's "what
happened behind it" column already shows. Building it would have been the same content twice
with different graphics. The stretch it was meant to fill is now broken by scene 6 instead.

Verified band order (no two adjacent bands share a background, longest band ~1128px):
cold open (black) / prose / in-short / prose / gap (black) / calc (mist) / prose /
four moves (black) / prose / quote (navy) / teardown (mist) / prose / failure modes (mist) /
prose / funnel (black). Re-measure with `scripts/_scratch-rhythm.mjs`.

## THE FLOATING ToC (owner asked for it, 2026-07-26 session 3)

`components/blog/FlagshipToc.tsx`, rows curated in `content/blog/ai-chat-scenes.ts`
(`FLAGSHIP_TOC`). Ports the service-page rail (tick spine in the left gutter, expands on hover
or focus, pill + bottom sheet below 1360px) and shares scroll-spy / jumps / reduced-motion via
`lib/toc/scroll-spy`. Three things it does that the services rail does not:

1. **It flips contrast with the band underneath it.** The flagship alternates BLACK, NAVY,
   MIST and WHITE full-bleed bands and the rail sits over all of them. Every band is tagged
   `data-band`; scenes get theirs from the scene registry. `useBandTone` finds whichever band
   owns the rail's own vertical position (geometry, not hit-testing, so it is cheap on scroll).
2. **Scenes are real destinations** (`scene-<key>` anchors), ticked slightly heavier so the
   reader can see there is something to LOOK at before jumping.
3. **Rows above the active one are mid-toned**, so the spine shows progress, not just position.

**THE FOCUS-RING TRAP (cost two attempts).** `globals.css` says it outright: its
`:focus-visible` rule is UNLAYERED and Tailwind v4 emits utilities inside `@layer utilities`,
so the global rule beats EVERY `focus-visible:outline-*` utility regardless of specificity.
globals.css handles dark SURFACES with `.bg-ink :focus-visible`, but this rail is
`position:fixed` outside `<article>`, so it is never a descendant and never inherits that fix.
The only thing that wins is an **inline `outlineColor`**, which overrides just the colour and
leaves width/offset to the site-wide rule. River navy is 1.5:1 on ink; white is 21:1.

**THE ARCHITECTURE IS BUILT — read this before adding a scene.**
- `lib/blog/markdown.tsx` treats a standalone `[[scene:key]]` line as a scene slot. Every
  non-flagship render path DROPS the marker, so it can never leak as literal text.
  `hasScenes()` IS the flagship flag (no extra field to keep in sync); `renderFlagshipBands()`
  splits a body into alternating prose / scene bands.
- `components/blog/scenes/registry.tsx` maps key -> component. Unknown key renders nothing.
- Scene COPY lives in `content/blog/ai-chat-scenes.ts`, not in the components. That is the
  shape the other ~19 topics clone.
- Adding a scene = component + one registry line + one marker in the markdown. That is all.

**Two rules learned the hard way (do not relearn these):**
1. **Scenes REPLACE the markdown they stage, they do not decorate it.** Scenes 4 and 8 lifted
   their text out of the body; leaving the markdown in place makes the reader read the same
   sentences twice. The scene probe asserts each staged sentence appears exactly once.
2. **Resting style must BE the final state**; only attach animation under
   `.reveal.is-visible`. Never pair a delay with `animation-fill-mode: both` — it paints the
   `from` state during the delay, so no-JS readers, reduced-motion readers and every static
   screenshot catch an empty frame. That bug ate a pass.

**HARNESS CORRECTION (the previous session's note was wrong, verified on this machine).**
`:3000` is **`wslrelay.exe`** (the WSL CRM port forward), NOT this repo. The realtylt-website
dev server runs on **:3100** and that is correct here, not a mistake. Test via `127.0.0.1:3100`.
Do not "fix" this back to :3000.

**KNOWN ISSUE — local dev server is wedged.** The shared :3100 server (PID owned by the
concurrent session, up since 05:39) started returning HTTP 500 on **every** route mid-session,
after a watched file was deleted. `tsc` and `vitest` are clean, so it is a wedged dev compiler,
not a code fault. I could not restart another session's process. Everything since is verified
against the **Vercel production build** instead, which is authoritative and cannot interfere.
To restore the local loop: `npx kill-port 3100 && npm run dev -- -p 3100`.

**Verification harness** (all gitignored under `scripts/_scratch-*`):
- `scripts/_scratch-scenes.mjs [baseUrl]` — frames EVERY scene at 1440 + 390 DPR3 and probes
  H1/H2/JSON-LD, marker leak, em dashes, arrow glyphs, overflow and duplicate staged text.
- `scripts/_scratch-calc.mjs [baseUrl]` — drives the calculator's controls and asserts the
  result changes (default 16/month, next-day 27, within-minutes correctly 0).
- `scripts/_scratch-rhythm.mjs` — prints every band's height and background colour in order, so
  you can see the light/dark alternation and find the gaps that still need a scene.
- `scripts/_scratch-toc.mjs` — asserts every curated ToC row resolves to a real element (a
  curated list rots silently), that the rail flips contrast over dark vs light bands, that a
  jump lands and sets `aria-current`, and that the mobile pill + sheet work.
- `scripts/_scratch-audit.mjs` — the polish audit: display-type scale across every scene (catches
  a heading that has drifted out of its role), focus-ring colour over dark AND light bands,
  every internal link's status code, mobile tap targets, and whether the ToC pill collides with
  the site chat launcher.
- All default to production. Pass `http://127.0.0.1:3100` once the local server is back.

**CONCURRENT EDITOR — confirmed active this session.** The other session is building the IDX
photo band (`components/idx/MlsImage.tsx`, `lib/idx/photo-band.ts` + its 12 new tests) in this
same working tree. Their work was left unstaged and untouched throughout; every commit here was
staged file-by-file. Run `git status --short` before every `git add` and never `git add -A`.
`npx vitest run` covers both of us, so a green 394/394 also confirms nothing of theirs broke.

**Note on scene 6 ("what it does NOT do"):** the prose section already IS that content and it
is strong. A scene there would duplicate it unless it REPLACES the section (rule 1). Decide
deliberately rather than adding a decorative band.


Written 2026-07-26 by the previous session (Fable→Opus 4.8). This is the complete, self-contained
brief for building the RealtyLT flagship content piece. A fresh agent should be able to execute the
whole thing from this file. Read it fully before touching code.

## THE MISSION (owner's words, distilled)
Turn the **AI Chat Assistant blog post** into the single most valuable, memorable, high-end piece of
content on the site — so generous it builds real trust, so well-designed it can be **chopped into a
video, carousels, and photos for every platform**, and every view funnels the reader back to RealtyLT.
The strategy is **give-give-give**: teach so much, so beautifully, that the reader thinks *"I could
never do this myself — I'll just hire him."* This piece is the TEMPLATE; once it's great, the same
treatment gets cloned for the other ~19 service topics, and the scenes become the storyboard for
short-form video + Instagram/LinkedIn carousels that drive leads.

Owner's emphasis (2026-07-26, verbatim intent): the blog itself does NOT have to carry every
interaction — the real prize is **rich VISUALS, ANIMATIONS, design graphs/graphics, and visual
examples**, "really really high-end, minimalistic Apple-style design," built so parts can be cut into
video and carousels. Interactivity (like the calculator below) is a welcome bonus, not the point. If
we can take the on-page experience up to that level too, do it — but the north star is
**beautiful, teaching, repurposable-into-content**.

## THE TARGET
- Post: **`/blog/ai-chat-assistant-real-estate-website`** — "Your Website Answered That Buyer at
  11:40pm. Did You?"
- Content source: `content/blog/ai-posts.ts` → `AI_CHAT_ASSISTANT_POST` (markdown string). **The
  writing is already excellent** — genuinely valuable, honest, teaches the mechanics, the objections,
  the failure modes. Do NOT rewrite it wholesale; STAGE it. Keep the voice (no em dashes, no arrow
  glyphs — house rule).
- Repo: `C:\Users\Levan\realtylt-website` (Next 15 / TS / Tailwind v4). Branch `main`.

## CURRENT STATE (what renders today)
`/blog/[slug]/page.tsx` renders a **conventional text article**: a dark hero (title + excerpt +
author/date/read-time + share row), one 16:9 cover photo, then the body in a constrained ~44rem
column with a sticky ToC rail on the left, "Keep reading" related cards, and an "Ask us" CTA. The body
comes from a small **safe markdown renderer** (`lib/blog/markdown.tsx`) that emits React nodes (never
HTML) — headings, paragraphs, lists, one pull-quote style, links. **There are zero in-article visuals,
zero interactivity, zero memorable scenes.** That is the entire opportunity.

## THE ARCHITECTURE REALITY + DECISION (important — read before building)
The generic markdown template renders a **narrow text column**. It physically cannot deliver
full-bleed, Apple-minimalist, interactive/animated SCENES. So this post needs a **bespoke flagship
rendering path**. Recommended approach (pick/refine, but this is the clean one):
1. Add a **flagship flag** to the article (e.g. `post.flagship === true` in the content/types) OR
   special-case this slug in `app/blog/[slug]/page.tsx`, so it renders a **bespoke full-width
   composition** instead of the 44rem markdown column.
2. Build a **registry of scene components** (`components/blog/scenes/*`) — each scene a self-contained,
   full-bleed React section. A tiny **embed mechanism** lets scenes interleave with prose: either
   (a) a marker in the markdown (e.g. a line `[[scene:teardown]]`) that `markdown.tsx` maps to a
   registered component, or (b) a hand-authored scene array for this post. (a) scales to all 19 later;
   (b) is faster for one. Recommend (a) for the long game.
3. Keep SEO/structured-data intact (the JSON-LD in the page). Scenes are visual; the crawlable prose
   must still be in the DOM (accessibility + SEO — the whole point of the post is to be quotable by
   search + AI assistants).

## THE STORYBOARD — 9 SCENES (each = a scroll moment + a carousel card + a video beat)
Design language: **Apple-minimalist** — huge whitespace, big confident type, ONE accent (porchlight
azure `#28a8e0`), restrained purposeful motion (scroll-reveal, not confetti), alternating light/dark
full-bleed "scenes." Reuse the visual language already established on the /services pages (see below).
Every scene MUST be screenshot-clean (a carousel slide) and screen-record-clean (a video beat).

1. **Cold open — "11:40pm."** Cinematic near-black, huge type, one glowing phone/clock detail. The
   hook + the carousel cover + the video's first frame.
2. **The response-gap visualizer** (animated) — the 78% stat as "9 hours vs. 8 seconds," an animated
   race/timeline. Signature motion beat.
3. **The leads-lost calculator** (interactive) — ALREADY STARTED, see below. Give + repurposable tool.
4. **"What it actually does" — the 4 moves** as clean animated cards (each = one carousel slide).
5. **The teardown / "watch it handle a real lead"** (the centerpiece) — the real 11:40pm conversation,
   animated: messages appear, MLS search fires, the text goes out, the appointment books. The
   demonstration + the money video segment. This is where the graphics/animation budget goes.
6. **"What it does NOT do"** — the honest, trust-building scene as stark minimalist type.
7. **Animated flow diagram** — visitor → chat → MLS → text → voice → CRM → booked, Apple-style motion.
   (This is literally the /services "how it works" flow, elevated to animation.)
8. **The big pull-quote** — one cinematic full-screen line (carousel/video quote card). The post
   already has the perfect line: "The measure of an AI assistant is not how human it sounds…"
9. **The funnel** — "talk to it live right now" → `/ai#chat` (the REAL assistant) → work-with-me /
   `/services/ai-chat-assistant`.

## WHAT'S ALREADY BUILT (starting assets)
- **`components/blog/LeadsLostCalculator.tsx`** — a polished, self-contained CLIENT component for
  scene 3. Two inputs (monthly inquiries slider + reply-speed buttons) → a big result ("leads you're
  likely losing / month" + $/year), Apple-minimalist, give-give-give (shows results freely, no email
  wall), CTA into /services/ai-chat-assistant. **STATUS: written, NOT wired into any page, NOT
  verified in the browser.** Next agent: wire it via the embed mechanism, verify on phone+PC, and
  adapt its styling into the final scene language. It's a strong start, not sacred — reshape as needed.

## THE DESIGN SYSTEM TO STAY WITHIN (reuse for consistency)
Tokens in `app/globals.css` @theme: `--color-river #102c54` (navy), `--color-porchlight #28a8e0`
(azure accent), ink/paper/mist neutrals, **Lato** everywhere. The previous session established a
coherent "signal" language on the /services/* pages that this flagship should echo: rounded corners
(rounded-xl/2xl/3xl), a low-alpha **porchlight signal-glow** on ink sections (radial-gradient behind
content via `isolate`+`-z-10`), a CSS **live-dot** breathing dot, a **svc-ping** sonar pulse, short
**porchlight signal-lead** accents, hover-lift cards, top-edge **light-catch** on dark panels
(`inset_0_1px_0_rgb(255_255_255/0.07)` in the shadow). All CSS animations collapse under the global
`@media (prefers-reduced-motion: reduce)` block — HONOR IT (this site's a11y standard). No arrow
glyphs, no `///`-style tech garnish (the owner had me strip a `///` this session — he reads that as
AI-generated). Restraint = luxury; the owner rejects anything that looks vibe-coded/AI-generic.

## RENDER + VERIFY HARNESS (gotchas that cost real time — don't relearn them)
- **SAME repo as `/website` → SAME dev-server discipline: ONE Next process per repo.** Two
  servers share one `.next` and serve broken JS chunks, so never run a second.
  `netstat -ano | grep -E ':300[0-9]|:3100'` FIRST and REUSE whatever is already up.
  **The port is :3100, and that is correct** — `:3000` on this machine is `wslrelay.exe` (the
  WSL CRM forward), not this repo, so a Next server cannot have it. Test via
  **127.0.0.1:3100**. (An earlier note in this file claimed :3100 was a mistake and told the
  next agent to move to :3000. That was wrong, verified by process inspection; it has been
  corrected here so nobody burns time on it again.)
- **Playwright IS in realtylt-website** — use `scripts/_scratch-shot.mjs <url> <outbase> [width]`
  (quick shot) and `scripts/_scratch-map.mjs <url> <outbase>` (deep map, 1440+390 + inventory); write
  scratch probes as `scripts/_scratch-*.mjs` (gitignored). Prefix node with
  `export NODE_OPTIONS='--use-system-ca'` (AVG MITM). `MSYS_NO_PATHCONV=1` if a leading-slash URL arg
  gets mangled to `C:/Program Files/Git/...`.
- Full-page captures show sections BLACK/empty because `.reveal` sits at opacity:0 until the scroll
  observer fires → capture with Playwright `reducedMotion: 'reduce'` (the CSS forces reveal content
  visible under reduced-motion). READ every PNG with your own eyes.
- Next dev "Fast Refresh had to perform a full reload" can make `generateStaticParams` routes 404
  until a clean dev-server restart — NOT a code bug (it compiles clean); restart to confirm.

## DEPLOY
Vercel git-linked: push to `main` auto-deploys **production** (`realtylt-website.vercel.app` — the
realtylt.com rebuild, NOT the live realtylt.com yet). Poll `npx vercel inspect <newest>` until Ready,
then verify the prod URL serves the change. **Concurrent editor caution:** another session actively
builds the IDX/listing gallery in this same repo and pushes to `main`. Commit PATH-SCOPED (only your
blog/scene files), check `git status` before each commit, leave their IDX + `docs/services/*.png` QA
artifacts alone. `git pull`/be in sync before pushing.

## GUARDRAILS (owner's standing rules)
Single agent, work to ~700k. Build scene by scene: commit-before → build → render FOREGROUND at 1440
desktop + 390 DPR3 mobile → READ the PNGs → keep only if clearly better → commit-after → deploy
incrementally so the owner checks on Vercel. Apple-minimalist RESTRAINT — the wow comes from craft +
whitespace + one signature per scene, NOT from piling on effects. Phone AND PC must both be perfect.
Verify (don't trust): every scene read with your own eyes on both form factors, zero JS errors,
reduced-motion respected, a11y (crawlable prose stays in the DOM).

## AFTER THE FLAGSHIP (the payoff, for context)
This post becomes: (1) the template cloned to the other ~19 service topics; (2) the storyboard for a
screen-recorded demo VIDEO; (3) carousel decks (each scene = a slide) for IG/LinkedIn; (4) still
photos. All of it funnels to `/services/*`, `/ai#chat` (the live assistant), and work-with-me. That
lead-gen loop — give enormous value everywhere → remind them RealtyLT built it → they reach out — is
the actual goal. Build the flagship so every scene is a ready content asset.

## VIDEO / AVATAR / VISUAL-GENERATION (owner ideas 2026-07-26 — the content-production layer)
The blog scenes above ARE the video storyboard. To produce the actual video + platform content:
- **Talking-avatar presenter (HeyGen / "HyperFrames by HeyGen" MCP).** Owner's idea: a talking
  avatar narrates the piece. Script = the blog's own words (they're already tight). Needs the HeyGen
  MCP authenticated (`mcp__claude_ai_HyperFrames_by_HeyGen__authenticate`) + a chosen avatar/voice.
- **Reuse the LIVE 3D brain as premium B-roll.** `realtylt.com/ai` (repo `realtylt-ai-page`) is a
  real-time Three.js galaxy→brain journey. Screen-record it (the render harness + deep-link stages
  `#p=` / `galaxy|solar|brain|paths` exist in that repo) → instant high-end B-roll for the videos, no
  new production. This ties every video back to the flagship /ai experience.
- **Higgsfield MCP (image/video/animation) — BLOCKED ON CREDITS.** Checked 2026-07-26: account is
  free plan, **0 credits**, so it can't generate anything yet. It IS connected. Owner: top up /
  subscribe, then it can produce the cold-open image, animated graphics, and short video clips. Models
  worth trying once funded: `nano_banana_pro` (4K/text/diagrams — good for the design graphs),
  `soul_2` (editorial/portrait), plus `generate_video` for the animated scene clips.
- **Recipe for one high-end explainer video:** avatar intro → blog scene cards (screen-record the
  scroll) → live 3D brain B-roll → the real chat teardown → CTA. Then chop the scene cards into
  IG/LinkedIn carousels and stills. Every asset does double duty (page + video + carousel).
- **First cheap proof (no credits needed):** screen-record the finished blog scenes + the live 3D
  brain, and cut a 30-60s silent motion reel — proves the "high-end Apple-minimalist content" bar
  before spending on avatar/generation.

## STATUS AT HANDOFF
Service-page design (the prior task) is DONE + deployed (prod, all ~20 /services pages elevated;
the `///` garnish removed). This flagship blog is NET-NEW and barely started: only the plan (this
file) + the unwired `LeadsLostCalculator.tsx` exist. Everything is committed to `main`. Related
memory: `[[project-flagship-blog]]`, `[[project-website-service-pages-design]]`,
`[[design-anti-ai-slop-palette]]`.
