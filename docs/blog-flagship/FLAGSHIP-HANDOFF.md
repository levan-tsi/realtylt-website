# FLAGSHIP BLOG — handoff brief (single agent, ~700k, build it scene by scene)

## STATUS (updated 2026-07-29, session 6: the film is narrated + /ai links in)

**The film is narrated by the OWNER'S OWN CLONED VOICE.** The ask was "an ElevenLabs voice
explaining details"; mid-session the owner saved `ELEVENLABS_API_KEY` as a **Windows user env
var** (read it via `(Get-ItemProperty HKCU:\Environment).ELEVENLABS_API_KEY` — a running session
does not inherit a fresh setx). The account carries his clone: voice **`LT`,
id `7AxhG2AEa5XhwSrAudqY`** — use it for RealtyLT narration; he confirmed it is his. The first
pass used free Edge TTS (`edge-tts` + truststore, voice AndrewMultilingualNeural) — keep that as
the no-key fallback. **The clone reads ~1.4x slower than Edge: retime the FILM to the voice,
never speed up a real person's voice.** The close and CTA beats moved later in film.html and the
cut is now **36s** (fade 35.5-36.0). The flight was retaken per the owner (other agents were
loading the GPU during the old capture); measured old-vs-new bright-pixel density 0.215% vs
0.227% — the master was never actually dim, the **crf 20 web encode was crushing the dark
starfield**, so the web copy now encodes at **crf 18** (1436 kb/s, 6.2MB).

The narration (LT clone, natural rate; timed to the film clock; none reads the screen except the
close, on purpose):

| start | line |
|---|---|
| 0.30 | Eleven forty at night. This is when buyers shop. |
| 4.15 | A real question. Most sites would answer with a form. |
| 9.10 | This is the AI behind that website. And it never guesses. |
| 13.85 | It says so, honestly. Then it texts real listings from the live MLS. |
| 20.10 | Search, text, transcript, all in the CRM. The call: booked by morning. |
| 26.20 | It answered at eleven forty. You called at nine. |
| 30.80 | Try it yourself, at realty L T dot com, slash A I. |

Retimed beats in film.html: .close in 25.30 / text up 25.80, out 29.30; .cta in 29.60 / .in up
29.90 / .f 30.90. Stage render range is [0,6]+[12,36]. Pipeline: `_scratch-vo/gen11.py lt` (per
line: `gen11.py lt 1.0 <i>`), then `_scratch-vo/assemble36.mjs` (VO mix, master crf 16 from the
frame sequence, web crf 18). Narrated 1080p master for YouTube:
`scripts/_scratch-video/film-master-1080-vo-lt.mp4`, local only.

Traps that cost time in this pass:
- **AVG MITMs Python TLS too**: `pip install truststore` + `truststore.inject_into_ssl()` before
  edge-tts, or every request dies on CERTIFICATE_VERIFY_FAILED.
- **`tpad stop_mode=clone` clones the LAST frame, which is mid-fade** on this cut. Measure the
  fade with signalstats YAVG (16.8 clean, 0.2 black), trim to the clean frame, hold THAT.
- **astats `reset` is in FRAMES, not seconds** — `reset=0.25` silently gives a cumulative average
  that reads flat and proves nothing. Verify alignment with `silencedetect` against the schedule.
- **The player had `muted` + `loop`** from its silent days; a narrated film needs neither (play is
  user-initiated, and a looping narration restarts itself forever). Both removed.
- The VO pipeline (gen.py + assemble.mjs) is gitignored under `scripts/_scratch-vo/`; the words
  and offsets above are the durable copy. One generation from the 1080p master
  (`scripts/_scratch-video/film-master-1080.mp4`, local only): crf 14 narrated master, then the
  web 720 copy from it. A narrated master for YouTube sits beside it as
  `film-master-1080-vo.mp4`.

**The /ai page now links back to this post.** In repo `realtylt-ai-page` (branch `windows-main`,
deploys by push + `npx vercel promote`): each service panel shows a bordered "from the blog" card
below "Read the use cases and FAQ", driven by a `BLOG_POST` map keyed like `SERVICE_SLUG`, plus a
crawlable link in the sr-only SEO mirror. Only `chat` is mapped today; add one line there as each
new topic ships. The owner explicitly did NOT want a services directory in the /ai outro (built,
then removed on his correction).

## EARLIER STATUS (2026-07-28, session 5: the film re-cut and the template)

**The page is live and green.** `node scripts/score-flagship.mjs ai-chat-assistant-real-estate-website`
passes 19/19 mechanical checks. The same gate scores the untreated workflow post 9/19 and exits 1,
which is how you know it is a gate and not a rubber stamp.

### What this session changed

**1. The film was re-cut.** 50s to 31s, and rebuilt from scratch rather than re-encoded.
- The old cut opened on 18 seconds of near-static galaxy with the /ai page's nav, hero copy and
  "Work with me" button in shot. It read as a screen recording of a website.
- **The quality fix was the capture method, not the bitrate.** Playwright's `recordVideo` is a
  fixed low-bitrate VP8 encoder with no quality knob (881 kb/s), and a moving starfield is the
  worst case there is for it. Every frame is now a LOSSLESS PNG screenshot. Result: shorter film,
  higher bitrate, SMALLER file (4.7MB / 1267 kb/s, was 5.3MB / 881 kb/s).
- Structure: the hook is a question landing at 11:40pm in the first two seconds; the flight is
  3.6s of travel plus a held brain; it ends on `/ai#chat` instead of trailing off.
- 30fps, not 60. The flight cannot be captured at 60 (each frame costs ~230ms of real time, so
  60fps would double both the capture time and the ambient drift baked into it).

**2. A real hydration bug, found and fixed.** The post threw React #418 on every load and the
hydrated DOM carried TWO `RealEstateAgent` JSON-LD blocks. A previous session saw the duplicate,
called it "a transient hydration artifact" and moved on. It reproduced on every load. Cause: the
system diagram's `<title>` had two text children, and React treats `<title>` as document metadata
and does not reconcile several children inside it. React threw away and regenerated the whole page
tree on the client every time. See the commit for the diagnosis path (control post, unminified dev
error, component stack).

**3. The template landed.** See TEMPLATE PLAN below for what is done and what is left.

### The film: how to rebuild or re-cut it

Everything is scripted. `npm i ffmpeg-static --no-save` gives ffmpeg without touching package.json.

| step | script | note |
|---|---|---|
| 1 | `scripts/_scratch-stage/film.html` | The stage. ONE film clock, with a deliberate 6.0s to 12.0s hole for the flight, so both sources share a timeline and the fades line up. `__seek(t)` freezes and seeks it. |
| 2 | `node scripts/_scratch-film-stage.mjs` | Renders the stage beats to lossless PNGs at 1920x1080, numbered on the film clock. |
| 3 | `node scripts/_scratch-film-flight.mjs` | Records the galaxy-to-brain flight, **headed**, into the same numbered sequence. ~5 min. |
| 4 | ffmpeg | See the encode command in the commit; master is crf 16 at 1920x1080, web is crf 20 at 1280x720. |

Traps, each of which cost real time:

- **The /ai page cannot be captured headless.** No real GPU, so the page detects no acceleration
  and drops into reduced mode: the galaxy and brain are never drawn. Launch
  `chromium.launch({headless:false, channel:"chrome"})`.
- **Do not try to pin the page's clock.** Virtualising `requestAnimationFrame` and
  `performance.now` to make the scene advance one frame per captured frame trips the /ai page's
  own boot health check, and it falls back to "the real-time 3D experience couldn't start on this
  device". `scripts/_scratch-film-pin.mjs` is the evidence. Capture in real time and keyframe the
  ramp instead.
- **The journey is not linear in `p`.** `scripts/_scratch-film-calib.mjs` measures the settled
  mapping: 0.05 to 0.28 grows the galaxy, 0.28 to 0.40 is the collapse, the brain only resolves
  its labels past 0.55. An even ramp spends four of six seconds on a brain that has stopped
  changing, which is exactly what the old cut did.
- **Strip the /ai furniture with `opacity`, never `display:none`.** `#chapters` is what gives that
  document its scroll height, and scroll is what drives the journey. Hide it and the flight dies.
  The strip list is `#topbar, #totop, #chapters, #brainhint`. Keep the brain's node labels: they
  are drawn on the canvas, and "AI chat assistant" lit on the brain is the whole point of the shot.
- **ffmpeg's `fade` filter blacks out everything OUTSIDE its window.** `fade=t=in:st=6` makes the
  first six seconds black. Use a per-frame brightness expression for fades at interior cut points.
- **The 1080p master is NOT committed.** A 13MB binary three scripts can regenerate does not belong
  in git. Rebuild it for a YouTube upload.

### Hosting: decided, with evidence

**The film stays first-party in `/public`.** The owner asked to consider Vercel Blob first.
Checked: the only Blob store on this project (`realtylt-mls`, 135MB, 281 files) is **SUSPENDED**,
so Blob is not currently a working host and moving the film there would put it behind a disabled
store. Beyond that, the page is not slower today: `preload="none"` with a poster means zero bytes
load until someone presses play, so 4.7MB in `/public` costs a reader nothing and is served by the
same CDN as every other asset, with no third-party script and no cookies. `VideoObject` JSON-LD is
emitted either way, driven by the article's own `film` field so the page cannot advertise a video
it does not serve.

**Revisit when films multiply, not before.** Nineteen topics at ~5MB each is ~95MB of binaries in
git, and THAT is the real argument for moving off-repo. The template already reduces the pressure:
the /ai flight is a shared segment cut once, so only a topic's own demonstration is new footage.

**YouTube is a separate job, and worth doing.** Rebuild the 1080p master and upload it to the
owner's channel for reach. Keep the on-page player first-party regardless, so the page carries no
third-party cookies.

### The one thing the film still needs

A **9:16 cut** for Reels, Shorts and TikTok. At 390px the 16:9 film's body text is ~4px and
unreadable inline; a viewer has to go fullscreen. The stage is authored at a fixed 1920x1080, so a
vertical version means a second layout in `film.html` at 1080x1920 (phone centred, event track
below it instead of beside it) and a second render pass. The recorder and the encode need no
changes.

## EARLIER STATUS (2026-07-26, session 2)

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


## TEMPLATE PLAN — turning one great post into ~19

**Goal: a new topic = one content file + a markdown body with markers, and NO new components.**

### Where it stands (2026-07-28)

| step | state |
|---|---|
| 1. Collapse bespoke scenes into primitives | **4 of 9 done.** `Grid`, `Statement`, `Summary`, `Film` exist and cover 6 scenes. 5 bespoke scenes remain. |
| 2. One typed content file per topic | **DONE.** `lib/blog/flagship.ts` holds the shape; `content/blog/ai-chat-scenes.ts` holds this topic's words and exports `AI_CHAT_FLAGSHIP`. |
| 3. Derive the ToC instead of curating it | **DONE.** `parseOutline` + `flagshipToc`. The curated array is deleted. |
| 4. Make the scorecard a gate | **DONE.** `scripts/score-flagship.mjs <slug>`. |
| 5. The per-topic content checklist | **DONE**, and it is executable: it IS the gate's output. |
| 6. The film as a repeatable recipe | **DONE.** See the film section above. Segment A (the /ai flight) is shared across topics; only a topic's own demonstration is new. |

**How it works now.** A `[[scene:key]]` marker resolves against the CURRENT POST's content object
(`Article.flagship`), not a global table. So two topics can both place `[[scene:four-moves]]` and
get their own words, their own column count and their own band. A key with no payload renders
nothing, so a typo in a CRM-published body degrades to a missing scene rather than a broken page.

`kind: "component"` is the honest escape hatch: it names a scene that is not yet a primitive, and
the calculator, whose model is genuinely per-topic and cannot be data. That is what lets the rest
migrate one at a time.

**How to verify a conversion changed nothing.** `node scripts/_scratch-shots.mjs before`, do the
work, `node scripts/_scratch-shots.mjs after`, then `--diff`. It frames all 12 scenes at 1440 and
390 DPR3 and prints SSIM. The harness's own noise floor is about 0.0007 (scenes you did not touch
move by that much), so anything at 0.999+ is unchanged and anything below it is real.

### What is left, in order

1. **`Timeline`** from `ResponseGap` (two stamps, a cooling line, a duration).
2. **`Conversation`** from `Teardown` (turns plus a parallel event track). The film's stage is the
   same idea, so the two should agree on shape.
3. **`Diagram`** from `SystemDiagram` (n labelled nodes on a spine, each with what it connects to).
   Watch the `<title>` trap: ONE text child, or the page throws away its hydrated tree.
4. **`StatBars`** from `ResponseCurve` (caption, n bars, a source, a caveat).
5. **`Calculator` stays bespoke.** Its model is per-topic and is not expressible as data. Give it
   props rather than imports and leave it as a `component`.
6. Then write topic 2 and see what the shape actually gets wrong. Do not build primitives 5 through
   8 speculatively for topics that do not exist yet.

### The original analysis (kept for reference)

Every scene on the page is really an instance of one of these:

| primitive | today's instances | shape |
|---|---|---|
| `Summary` | In short | eyebrow + n one-line claims |
| `StatBars` | Response curve | caption + n bars + source + caveat |
| `Timeline` | Response gap | two stamps + a cooling/building line + duration |
| `Grid` | Four moves, Failure modes | n items (lead + body), 2 or 3 col, dark or light |
| `Conversation` | Teardown | turns + a parallel event track |
| `Diagram` | System diagram | n labelled nodes on a spine, each with what it connects to |
| `Statement` | Pull quote, Funnel close | one held line, optional actions |
| `Film` | Reel | video + poster + caption |
| `Calculator` | Leads calculator | the ONE genuinely per-topic component |

Each takes its content as **props**, not imports. Eight primitives cover every topic.

### Adding a topic, concretely

1. Write the markdown body with `[[scene:key]]` markers where the scenes go. An FAQ-shaped
   section is required for `FAQPage`: its heading must match `FAQ_SECTION_RE` and the questions
   must be `###`.
2. Write the content file next to `content/blog/ai-chat-scenes.ts`, exporting a
   `FlagshipContent`: a payload per marker, a `band` on each, a `label` on the ones that are
   navigation destinations, short `headingLabels` for the prose rows, and the `film`.
3. Set `markdown`, `film` and `flagship` on the post in `content/blog/posts.ts`.
4. Run the gate: `node scripts/score-flagship.mjs <slug> http://127.0.0.1:3100`.

`lib/blog/flagship.test.ts` is the wiring guard: every marker has a payload, every payload is
placed, no short label points at a heading that no longer exists, every scene declares a band.
Copy that describe block for a new topic.

### What a topic must SUPPLY to pass the gate

The gate prints this list and fails on any of it: a cited third-party source · imagery through
the body (2+, all with alt) · an original data graphic or diagram as a real `role="img"` asset ·
a film · FAQPage + BlogPosting + BreadcrumbList + VideoObject schema · a direct-answer summary ·
3+ cluster links · a real freshness signal (visible "Updated" AND `dateModified` later than
`datePublished`) · 1200+ words · 5+ scene anchors · no overflow, no page errors, no em dashes,
no arrow glyphs, no leaked markers.

It deliberately does NOT score A1, A2, A3, B3 or the qualitative half of E2. Those are judgement,
a script cannot judge them, and a script that pretended to would be the build grading its own
homework. A human reads for those.

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
