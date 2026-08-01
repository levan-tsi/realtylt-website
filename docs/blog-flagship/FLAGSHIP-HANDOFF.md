# FLAGSHIP BLOG — handoff brief (single agent, ~700k, build it scene by scene)

## NEXT SESSION'S JOB (owner 2026-08-01) — THE FILMS. Resume HERE.

**Single agent, one long session, no subagents.** The five posts are done and mechanically green.
The films are the weak link, and the owner named the reason himself: **every film draws from the
same seven clips.**

### The actual defect, measured

| film | clips used |
|---|---|
| voice | shot1, shot2, shot6, shot7 |
| reactivation | shot1, shot2, shot3, shot4, shot5, shot6 |
| qualify | shot1, shot2, shot3, shot4, shot5, shot6 |
| workflow | shot2, shot3, shot5, shot6, shot7 |

`shot6-keys-porch` and `shot2-empty-office` appear in **every single film**. Somebody who reads two
posts watches the same keys-on-a-porch shot close both. That is the strongest "mass-produced" signal
on the whole blog, and it undoes the point of the treatment.

### What the owner asked for

1. **Generate NEW, topic-specific footage per post.** Roughly 3-4 fresh clips each, keeping the
   shared library only for genuinely generic beats. 15 credits a clip, ~1000 credits available, so
   ~200 credits covers all four. See the Flow operating notes below.
2. **Transitions.** Every film is hard cuts today. Design them; do not just crossfade everything.
3. **Sound effects.** There are NONE today: narration only, no bed, no design. A ring, a notification,
   a room tone under a beat. `realtylt-stories/scripts/music-gen.py` proves ElevenLabs Music works
   and is commercially licensed (a paid ad cannot carry a music claim); the same account does sound
   effects. Mix them UNDER the voice and MEASURE the separation, do not eyeball it.
4. **Research first: what actually makes these perform organically and bring leads.** Use the
   `last30days` skill plus real benchmarks. What is already established and should not be re-derived:
   - **Hook rule** (r/NewTubers 349-video study): a concrete, checkable number in the first seconds.
     No greeting, no atmosphere. Warmups correlate with flops.
   - **Meta benchmarks 2026:** hook rate median 28%, top decile 45%, **under 15% means kill it**.
     Hold rate 25-40% solid for a 15-30s cut. Best-performing length band is **15-30s**.
   - **85% of feed video is watched with sound off**, captions add ~12% watch time and ~16% reach.
     The captions ARE the script.
   - Honest tension to resolve, not ignore: **organic reach rewards native, scrappy, un-ad-like
     video**, which pulls directly against the Apple-minimalist house style. Decide deliberately
     per surface rather than splitting the difference by accident.

### AUDIO IS THE ONE THING NOBODY HAS EVER CHECKED

Every film so far is verified by measured duration and `silencedetect` only. **No human and no agent
has ever listened to any of them.** If you add sound design you are stacking on an unverified layer.
Get the owner to listen, or state plainly in your report that the audio is unverified.

### The pipelines, and which is which

- **`scripts/film/reactivation/`, `qualify/`, `workflow/` are the CURRENT pattern**: two-layer, where
  ffmpeg cuts the picture bed from real footage and Playwright draws transparent type over it,
  authored at 1280x720 (the footage's native size), crf 23. `workflow/cut.mjs` is the best of them:
  it DERIVES `FILM_LEN` and `FADE_AT` from the measured schedule so they cannot drift apart.
- **`scripts/film/voice/` is the older single-layer stage**, with `broll.mjs` compositing footage
  under it afterwards. It works and is finished; do not rebuild it unless you are improving it.
- B-roll lives at `scripts/film/footage/` with a ledger. `shot7-signup-callback` has no recorded
  prompt, so it cannot be regenerated. **Record the prompt for every new clip.**

### Film traps, every one of them paid for. Do not relearn these.

- **A fade-to-black constant does NOT follow from the schedule.** The voice film grew from 45s to 60s
  and `FADE_AT` stayed at 44.5, so the entire new beat and the CTA faded to black. Derive it, or move
  it every single time the length changes.
- **A higher z-index does not clear what is behind it.** Two centred beats both visible render
  straight through each other. Every beat needs an explicit `out`.
- **Probe individual frames before committing to a full render.** Both faults above were found by
  probing three frames and would have cost a full render each.
- **`colorchannelmixer` takes TWELVE parameters.** Feeding it a 3x3 silently misassigns channels; a
  cut came back entirely VIOLET, the exact palette the house rules ban.
- **A `lighten` blend contaminates coloured type.** It takes the per-channel max, and the azure accent
  is low-red, so warm footage behind it drags the colour toward magenta (measured: V chroma 125 to
  130, past neutral). **Key on the film's own luma instead** so a text pixel is 100% film.
- **Bright footage destroys thin type, and gain alone cannot fix it.** Dark enough for the small type
  is too dark to see the picture. Use a scrim: image bright at the edges, darkened through the middle
  where the type sits. The voice film's `broll.mjs` has a working one.
- **Chroma must be pulled toward neutral in the same pass as luma**, or darkened warm shots come back
  magenta.
- **Never run a B-roll script with its own output as its input.** It is not idempotent.

### Google Flow, as actually operated

Owner's PERSONAL Google account `levan.realtylt@gmail.com` holds the AI Pro subscription (the
Workspace account lost Flow bundling; settled, do not reopen). **15 credits per clip**, ~1000
available. Settings that are already correct: confirm-before-generating ON, 16:9, x1, Omni Flash,
visible watermarking OFF.

- **Omni Flash generates 720p.** Its "1080p" download is an AI upscale, and it is only offered for
  clips generated in the current project. Do not mix upscaled and native clips in one film: the
  inconsistent sharpness looks worse than uniform 720p.
- Download via the item's ⋮ menu → Download → **720p Original Size**. The big toolbar download button
  fetches a ~23MB export that **stalled indefinitely** and never completed.
- **Never click a menu item by coordinate** — the page re-lays out between screenshot and click, and
  a Download click once landed on the wrong item. Use `find` to get an element ref, click the ref.
- **The approval card sometimes renders with no buttons.** Do not re-prompt the generation; type
  "Approve" as a chat message and the buttons come back.
- Downloads land in `C:/Users/Levan/Downloads`.
- **Every generated screen is unreadable pseudo-text.** Never plan a shot whose payoff is words on a
  device; caption typography carries the meaning.

### State at handoff

Five AI-service posts, all measured on PRODUCTION 2026-08-01: chat 19/19, voice 19/19, reactivation
19/19, workflow 19/19, qualification 18/19 (D5 only, and it cannot pass honestly until that post
takes a real revision). 565 tests green. Fifteen posts total; the other ten are consumer topics the
owner has explicitly put OUT OF SCOPE.

`/ai` has 20 service nodes, 5 wired with a blog card, but **only 3 are live** — the page needs an
explicit `vercel promote` and the owner approves those. `robots.txt` is `Disallow: /`; everything
stays dark for a single go-live.

**Open, owner-gated:** promote `/ai` (3 cards to 5) · `/search` ships 13MB of unresized MLS photos
because full-size Supabase originals are served straight into small cards (the mirror is fine, the
resizer is missing; those files belong to the concurrent session) · **original data of our own is
gated on LAUNCH**, not on effort: 37 chat sessions and 18 exchanges in 30 days, mostly the owner's
own testing, because there is no public traffic yet.


## STATUS (2026-08-01, session 11: TOPIC 5 IS LIVE, and every AI-service post is now a flagship)

**Five flagships are live.** Measured on production with `node scripts/score-flagship.mjs <slug>`:

| topic | slug | gate | film |
|---|---|---|---|
| 1 chat | `ai-chat-assistant-real-estate-website` | 19/19 | 39s |
| 2 voice | `ai-voice-agent-missed-calls-real-estate` | 19/19 | 60s |
| 3 reactivation | `database-reactivation-old-real-estate-leads` | 19/19 | 49s, real footage |
| 4 qualification | `ai-lead-qualification-real-estate-scoring` | 18/19 (D5, see below) | 53s, real footage |
| 5 workflow | `workflow-automation-real-estate-business` | **19/19** | **59s, real footage** |

Topic 5 added **ZERO new components**, four topics in a row. There is no longer an untreated
AI-service post: the 9/19 the gate used to score is gone.

**Topic 5 passes D5 honestly**, which is worth understanding rather than copying. It shipped
2026-07-13 as a plain 1,200 word article and was genuinely rebuilt on 08-01, so `updated` is a
true statement about a real revision. That is the ONLY way to pass D5. Topic 4 still cannot, and
still should not fake it.

### THE ZOMBIE STAT THIS TOPIC ALMOST PUBLISHED, and the rule that caught it

The interruption research everybody quotes is Mark, Gonzalez and Harris, *No Task Left Behind?*
(CHI 2005, UC Irvine). The figure attributed to it across the entire internet is **"23 minutes and
15 seconds"** to return to interrupted work, usually beside **"81.9 percent resumed the same
day"**. **Neither number is in the paper.** Verified by extracting the text of a freshly fetched
copy: `23 min. 15` and `81.9` are both ABSENT. The published figures are **25 min 26 sec** and
**77.2 percent**, and both are on the page.

This is now the second correction of this shape (topic 3 corrected "$16,000 per text"). The rule
that produced both: **read the operative sentence in the primary source, never a summary of it,
even when the summary is unanimous.** `pdftotext` is on this machine and handles a two-column
CHI paper fine; use it without `-layout`, which interleaves the columns and scrambles the numbers.

### A REAL DEFECT NO PROBE COULD SEE, and why it is worth remembering

`StatBars` reserved a fixed 78px for its value text. That is correct for `15%` and `60x`, which is
everything the first four topics charted, and it silently **crops** `25 min 26 sec` to
`25 min 26`. **An SVG does not overflow, it crops**, so no overflow check, no scrollWidth check
and no DOM assertion can find it. Only looking at the picture finds it.

Fixed in the primitive rather than worked around in content: the reserve is derived from the
longest `display` string and floored at the old 90, so the four shipped charts keep byte-identical
geometry (verified live: track width still exactly 550 on all four, 506 on the new one).

**`node scripts/check-svg-crop.mjs` is the standing guard**, and it is committed rather than
scratch. It calls `getBBox()` on every `text` node in every `svg[role="img"]` across all five
posts and fails if any ink reaches more than 1.5 user units past an edge. Its first version was
WRONG and flagged two shipped charts, because a label anchored at x=0 reports x = -0.83 from its
glyph side bearing; the threshold is documented in the file with the measurement that sets it (the
real defect was 24.7u, the widest innocent bearing is 0.83u). **Run it against the shipped posts
before believing it about a new one.**

### THE FADE TRAP IS NOW STRUCTURALLY GONE

The three earlier films wrote the film's length into two scripts by hand and the fade point into
one, and a render was lost when the cut grew and the hardcoded fade did not move. `scripts/film/
workflow/cut.mjs` derives `FILM_LEN` and `FADE_AT` from the measured schedule and every other
script imports them. `bg.mjs` additionally asserts each beat starts exactly where the previous one
ended, so a mistyped boundary fails the cut instead of quietly shifting the picture off the voice.
**Copy `scripts/film/workflow/` rather than `qualify/` for the next film.**

Verify a finished film on the FINISHED FILE, not on the stage: a 30-frame contact sheet
(`fps=1/2,scale=256:-1,tile=6x5`) read against the schedule, `silencedetect` against the line
boundaries, and `signalstats` YAVG sampled through the tail to prove the fade lands where the
schedule says (this one: 41 at t=58.4, 21 at t=58.9).

### Sources used, so topic 6 does not reuse one

Five topics, five different bodies of evidence. Topic 5 used:
- **Mark, Gonzalez and Harris, CHI 2005**, `https://ics.uci.edu/~gmark/CHI2005.pdf` (author-hosted,
  free, complete). 24 information workers, 700+ hours, timed to the second. The ACM DOI page
  bot-blocks and could not be read, so it is deliberately NOT cited.
- **Zapier's own help pages** for the 95-percent-in-7-days auto-pause default and the run status
  vocabulary. Both re-checked live for the operative phrase after deploy.
- **n8n's docs** for the error workflow and Error Trigger.

**Vendor PRICING was investigated and deliberately not cited**: n8n's and Zapier's pricing pages
render their numbers in JavaScript, so the figures could not be read from the source. The post
refuses to print a price instead, which is the topic-3 pattern.

### Remaining topics, in the order I would do them

`review-automation`, `ai-appointment-booking`, `local-seo`, `geo-landing-pages`, `crm-sync`,
`ai-agent-workforce`, `skip-tracing-lead-generation`, `marketing-automation`,
`document-processing`, `data-enrichment`, `ai-scheduling`, `invoicing-and-payments`, `ai-clone`,
`ai-audit`, `custom-automation`.

**Each needs its own DIFFERENT third-party study**, and the bar is now five in a row.

## EARLIER STATUS (2026-07-31, session 10: TOPICS 3 AND 4 ARE LIVE, and the films now use real footage)

**Four flagships are live.** Measured on production with `node scripts/score-flagship.mjs <slug>`:

| topic | slug | gate | film |
|---|---|---|---|
| 1 chat | `ai-chat-assistant-real-estate-website` | 19/19 | 39s |
| 2 voice | `ai-voice-agent-missed-calls-real-estate` | 19/19 | 45s |
| 3 reactivation | `database-reactivation-old-real-estate-leads` | **19/19** | **49s, real footage** |
| 4 qualification | `ai-lead-qualification-real-estate-scoring` | **18/19** (D5, see below) | **53s, real footage** |

Topics 3 and 4 each added **ZERO new components**. Three topics in a row now. The primitive set
is right and should be left alone.

### THE ONE CHECK TOPIC 4 DOES NOT PASS, and why it is the gate that is wrong

**D5 wants `dateModified` later than `datePublished`. A post written and shipped in one day has
not been revised, so it cannot pass D5 without a fabricated date.** Topics 1, 2 and 3 pass it only
because each was genuinely revised on a later day than it was written. Topic 4 was not, so it is
18/19 and `updated` is deliberately unset with a comment in `content/blog/posts.ts` saying so.

Do not "fix" this by inventing a date. Either set `updated` when the article takes its first real
revision, or change the check to distinguish "has been maintained" from "was published today".
The self-grading rule in SCORECARD.md exists for exactly this shape of temptation.

### THE FILM RECIPE CHANGED: real footage, two layers

`scripts/film/reactivation/` and `scripts/film/qualify/` are the pattern now. Both are committed,
both run from a clean checkout, and the b-roll they need is committed too at
`scripts/film/footage/` (6 clips, 13MB, with the ledger). **Do not touch `scripts/film/voice/` or
`public/video/film-942pm.mp4`** — the owner was reworking that film in parallel.

| step | command | note |
|---|---|---|
| 1 | `node scripts/film/<topic>/vo.mjs` | ElevenLabs LT clone. Generates, MEASURES, writes `schedule.json`. `--keep` reuses audio. |
| 2 | `node scripts/film/<topic>/bg.mjs` | Cuts the b-roll into the picture bed. **Every segment boundary is a measured line boundary.** |
| 3 | `node scripts/film/<topic>/render.mjs` | Transparent PNGs (`omitBackground`). `--probe 0,17,25` composites single frames OVER the real bg. |
| 4 | `node scripts/film/<topic>/assemble.mjs` | Overlay onto bg, VO mix, one encode, poster from frame zero, `silencedetect`. |

**Why two layers and not a `<video>` in the stage.** Putting the clips inside the HTML would make
the bundled Chromium decode H.264 (it often cannot) and would make every frame depend on a seek
completing before the screenshot fires. Compositing in ffmpeg is deterministic and cannot land on
a stale frame.

**Authored at 1280x720, not 1920x1080.** That is the footage's native resolution, so nothing is
upscaled and there is one encode generation. The earlier films authored at 1920 because their
pictures were drawn rather than shot; both shipped at 1280x720 anyway.

**CRF 23, not 16.** Flat dark graphics compress to almost nothing (the voice film is 45s in
1.3MB). Real moving footage does not. 23 lands a 50s film at ~4.7MB, in the same range as the
chat film, and `preload="none"` with a poster means a reader who scrolls past downloads none of it.

**A black bed is a design choice, not a gap.** Three of topic 4's nine picture beats are black,
because the beats that ask a viewer to stop and read a regulation are worse with footage under
them.

### Faults found by LOOKING, that the gate cannot see

- **`text-transform: uppercase` corrupts a legal citation.** It rendered `64.1200(f)(5)` as
  `(F)(5)`. On pages whose argument is that the details are checkable, that is not cosmetic.
- **An alpha that reads as restraint over a photograph reads as a rendering fault over black.**
  The fair housing footnote at `rgba(255,255,255,.44)` was nearly invisible on a black bed; .62.
- **A foot-only scrim leaves the top third unprotected.** Both films put type in the TOP third
  over sunlit kitchens. Gradients are two-ended now: dark at both ends, clear through the middle.
- **A probe frame landing mid-fade lies.** The footnote above looked dimmer than it is because
  t=42 was 0.1s into a 0.5s fade. Sample after the fade completes before believing a probe.
- **The FIRST node of a `diagram` needs the SHORTEST caption.** Captions are centred under their
  node and the first node sits at the very start of the scroll container, so anything wider than
  the node spacing is clipped by the container edge at 390px. 33 characters lost a letter; 19 is
  safe. The existing comment warned about the third node, which was the wrong node.
- **Eyebrows run ~40% wider than the same words in body text** (uppercase plus tracking). 45
  characters wrapped to two rows at 390 with one word alone. Keep them near 33.

### RESEARCH FINDINGS worth carrying to every future topic

A full sweep of what practitioners say plus a hunt for primary statistics produced a **zombie
stat list. Do not cite any of these**, they are repeated everywhere and none survive checking:

- **"80% of sales require 5 follow-ups" / "44% give up after one"**, attributed to the National
  Sales Executive Association. **That association does not exist.**
- **"82% of real estate transactions come from repeat and referral"** — no primary source, and
  NAR's own Member Profile contradicts it.
- **"Only 3% of the market is ready to buy now"** — Chet Holmes asked for a show of hands at
  seminars. It is a heuristic, not research.
- **Every response-rate figure for cold database SMS** ("30-60% response", "5-25% conversion").
  All vendor marketing. **There is no independent study of this in any vertical**, which is itself
  a finding and is why topic 3 quotes none.
- **"$16,000 per text"** — a real number from a different statute (FTC), not the TCPA. Agents
  believe it; correcting it is a credibility win and topic 3 does.

Sources that DID survive and are reusable:
- **NAR 2025 Home Buyers and Sellers Generational Trends** (free, NAR-hosted, complete, all
  exhibits): `https://cms.nar.realtor/sites/default/files/2025-03/2025-home-buyers-and-sellers-generational-trends-report-04-01-2025.pdf`.
  Topic 3 uses Exhibit 7-1, topic 4 uses Exhibit 6-23. **Note the period**: published 2025, survey
  mailed July 2024, covers the twelve months to June 2024. Say so on screen.
  NAR's newer full 2025 Profile is a **paid** product and its free "highlights" PDF is 6 pages of
  front matter, so this is the best free primary available.
- **Cornell LII** for federal law. eCFR blocks programmatic access; LII does not and carries the
  same text.
- **Twilio's own docs** for messaging deliverability thresholds.

### Remaining topics, in the order I would do them

`review-automation`, `ai-appointment-booking`, `local-seo`, `geo-landing-pages`, `crm-sync`,
`ai-agent-workforce`, `skip-tracing-lead-generation`, `marketing-automation`,
`document-processing`, `data-enrichment`, `ai-scheduling`, `invoicing-and-payments`, `ai-clone`,
`ai-audit`, `custom-automation`. `workflow-automation` still has an untreated post at 9/19.

**Each topic needs its own DIFFERENT third-party study.** Four topics have now used four
different ones and reusing a fifth time would make the citations decorative. Search for the
evidence that fits the argument before writing the argument.

## EARLIER STATUS (2026-07-30, session 9: TOPIC 2 IS LIVE and the template is proven)

**`/blog/ai-voice-agent-missed-calls-real-estate` passes 19/19 on the gate**, verified on
production 2026-07-31 (`node scripts/score-flagship.mjs ai-voice-agent-missed-calls-real-estate`,
`published=2026-07-30 modified=2026-07-31`). The shipped chat post still passes 19/19 too, so the
primitive extraction caused no regression. An earlier line here said 18/19; that was written
before the post took its first real revision and was stale, not wrong at the time.

**The template worked. Topic 2 added ZERO bespoke components.** The four scenes it needed were
generalised out of topic 1's one-off code instead of copied:

| new primitive | generalised from | what a topic now varies |
|---|---|---|
| `StatBars` | `ResponseCurve` | bars, which one is lit, `max` (100 for shares, omit for ratios), source, **required caveat** |
| `Diagram` | `SystemDiagram` | steps, eyebrow/heading/lede, band, `idBase` |
| `Conversation` | `Teardown` | turns, events, side labels, and `layout: "bubbles" | "transcript"` |
| `Plate` | (new) | a photograph plus a caption that does real work |

`ColdOpen` now takes `moment`, `suffix`, `photo` and `signature` as props (`"porchlight"` for
the chat piece's breath, `"ring"` for a phone nobody answers), so a topic owns its hero without
a second hero component. Defaults reproduce topic 1 exactly.

**Two honesty rules are now STRUCTURAL rather than cultural.** `StatBars` requires a `note` and
`Conversation` requires a `note`, so a topic physically cannot ship a cited chart without saying
where the evidence stops, or a staged demonstration that does not admit it is staged.
`lib/blog/flagship.test.ts` is now `describe.each` over a TOPICS table rather than a block to
copy per topic, and it asserts those notes are non-empty and that every `sourceHref` is https.

**What is left of the primitive plan:** only `Timeline` (from `ResponseGap`), and the chat
post's own `ResponseCurve` / `SystemDiagram` / `Teardown` have NOT yet been migrated onto the
primitives that were extracted from them. That migration is safe to do with
`_scratch-shots.mjs before / after --diff` (noise floor ~0.0007) and is the obvious next job.
The calculator stays bespoke by design.

### THE VOICE FILM, and why the recipe is now committed

`public/video/film-942pm.mp4` (45s, 1280x720, 1.3MB) is topic 2's own film. The chat film was
never an option here: it is narrated around a buyer MESSAGING a website and being texted
listings, so reusing it would have put a video about the wrong channel on a page arguing that
you should say what is true.

**The sources are COMMITTED, under `scripts/film/voice/`, not scratch.** The chat film's stage
and pipeline live under gitignored `scripts/_scratch-*`, which means the shipped artifact cannot
be regenerated from a clean checkout. That is fixed for this one:

| step | command | note |
|---|---|---|
| 1 | `node scripts/film/voice/vo.mjs` | ElevenLabs LT clone. Generates the lines, MEASURES them, writes `schedule.json`. `--keep` reuses existing audio. |
| 2 | `node scripts/film/voice/render.mjs` | 1350 lossless PNGs at 1920x1080. **Headless is fine** here: no /ai galaxy, so no GPU. `--probe 0,17,35` frames single moments instead. |
| 3 | `node scripts/film/voice/assemble.mjs` | VO mix, crf 16 master, crf 18 web copy, poster from FRAME ZERO, and a `silencedetect` pass that proves every gap is a scheduled beat. |

Needs `npm i ffmpeg-static --no-save` (it is not in package.json) and `ELEVENLABS_API_KEY`.

Rules this film encodes, on top of the ad rules already in this file:
- **The cut is DERIVED FROM THE VOICE.** Step 1 runs before the stage exists; the stage's beat
  times ARE the measured line boundaries. Never speed up a real person's voice to fit a stage.
- **The poster is frame zero.** The hook number is the reason anyone presses play, so the still
  the player shows must be the frame the film opens on.
- **The narration discloses that it is a clone**, in the on-page caption. On a piece arguing
  that an AI voice must say what it is, narrating with a synthetic copy of a real person and
  staying quiet about it is the exact hypocrisy the piece warns about.

Faults found by probing frames, both of which a single still would have hidden:
- **A higher z-index does not clear what is behind it.** "They call the next agent." rendered
  straight through the 9:42 clock, because the clock's fade-out was scheduled 2.3s too late.
  Sequence the outgoing beat against the narration, then check the frame.
- **Do not run the caption band under a beat that is already a held statement.** Two of the
  eight lines printed the same sentence twice at two sizes. Those captions were dropped; the
  words are still on screen, larger, so it is not a dropout.

### PREMISES THAT WERE WRONG, corrected against primary sources

The brief for this session asserted **"NY is two-party consent for recording"**. It is not.
[NY Penal Law 250.00](https://www.nysenate.gov/legislation/laws/PEN/250.00) defines mechanical
overhearing as recording *"without the consent of at least one party thereto, by a person not
present thereat"*, so a participant may record. New York is ONE-party. The post says so and
argues we should disclose anyway, which is a better section than the wrong premise would have
produced. **Verify every factual premise before building on it, including the brief's.**

Every external claim on the page carries a link that was checked for a 200 before shipping:
HBR/Oldroyd, the FCC's Feb 2024 declaratory ruling, NY Penal 250.00, Cal. Penal 632, CA AB 2905.

### Known, and NOT fixed here

**The /ai page's "from the blog" cards point at a 500 on the live site.** On production
`SERVICES_BASE` resolves to `https://realtylt.com/...`, and the rebuilt marketing site is not on
the apex yet, so `realtylt.com/blog/<slug>` redirects to www and returns **500**. This already
affected the shipped `chat` card. The voice entry was added to `BLOG_POST` and pushed, but the
deployment was deliberately **left on preview and NOT promoted**: promoting would put a second
broken link on a live page. Promote both once the marketing site is on the apex.

## EARLIER STATUS (updated 2026-07-30, session 8: the first ad is CUT)

**"The $6,000 lead" is DONE and rendered in both formats.** Watch these two files, then decide
what the next ad is:

- `C:/Users/Levan/realtylt-stories/out/six-thousand-lead-9x16.mp4` — 1080x1920, 32.5s, 15.7MB.
  **This is the ad format** (Facebook/IG Reels/Shorts).
- `C:/Users/Levan/realtylt-stories/out/six-thousand-lead-16x9.mp4` — 1920x1080, 32.5s, 25.6MB.
  For YouTube and the site.

Both are gitignored (`out/`); the repo holds everything needed to re-render them.

**The story, six shots:** a $6,000 lead messages at 11:40pm / the office is dark / something
answers anyway, and it never guesses / it sends real riverfront listings in Beacon from the live
MLS / the call is booked before the coffee finishes / that commission stays with the agent,
closing on realtylt.com/ai. Narrated in the owner's own cloned voice (LT).

**Every number in it is defensible.** $6,000 is the blog's LeadsCalculator default commission,
11:40pm is the post's own frame, and "it never guesses" is the product's documented behaviour.
There is deliberately no invented response-time figure ("answers in 8 seconds") — nobody has
measured one, and the whole pitch is that the assistant does not make things up.

### What was built, and the three rules it encodes

`C:/Users/Levan/realtylt-stories` is now the content factory. `src/ads/six-thousand-lead.ts` is
the cut as DATA; `src/ads/Ad.tsx` renders it; one definition drives both deliveries so the two
formats cannot drift apart. A second ad is a second data file, not new components.

1. **Shot lengths are DERIVED FROM THE VOICE, not guessed.** `scripts/vo-gen.py <slug>` generates
   the lines, `scripts/vo-prep.mjs <slug>` measures each one into `timing.json`, and every shot is
   its line's length plus headroom. Retime the cut to the voice; never speed up a real person's
   voice.
2. **Nothing is spliced.** Each line is an independent `<Audio>` at an absolute frame, so the
   assembly physically cannot clip a tail — that was the fault the owner heard in the ffmpeg-mixed
   blog film, and it is now structurally impossible rather than patched. `silencedetect` confirms
   every gap is a deliberate beat (1.2s / 1.4s / 1.3s).
3. **The vertical cut never upscales.** A 1080x720 window over the 1280x720 source is a modest
   side crop at native resolution. Cropping 16:9 to 9:16 the obvious way would have meant a 2.67x
   blowup of 720p footage.

### Two faults only a contact sheet could find

Single stills looked perfect while the cut had both of these. Build the sheet
(`fps=1,scale=270:480,tile=6x6`) for every ad:

- **Frame one carried no text.** Frame one is the thumbnail and the number is the whole reason
  anyone stops scrolling. The hook shot's caption now sits at full opacity from frame 0, no delay,
  no fade.
- **Text dropped out for ~0.6s at every cut.** In a sound-off format the captions ARE the script,
  so that is a dropout, not a beat. Now ~0.26s.

Caveat on the sheet: at 1fps it lands mid-fade and reads as a missing caption. Confirm any
suspected gap by sampling the caption band at 15fps across that cut, not from the sheet.

### Google Flow, as actually operated

Owner's personal Google AI Pro account `levan.realtylt@gmail.com` (the Workspace account lost Flow
bundling 2026-07-07; settled, do not reopen). **1050 credits before this session, 15 per clip**, so
two clips cost 30. Settings that were already correct: confirm-before-generating ON, video 16:9,
x1, Omni Flash, visible watermarking OFF. Download via the item's ⋮ menu → Download → **720p
Original Size** (1080p is an upscale of the same 720p source and would not match the other clips).

Gotchas that cost time here:
- **The approval card sometimes renders with no buttons.** Typing "Approve" as a chat message
  re-prompts it and the buttons appear. 
- **Menu coordinates shift between the screenshot and the click** (the page re-lays out). Use
  `find` to get an element ref and click the ref, never a coordinate, for menu items.
- Prompts and the full footage ledger live in `public/footage/FOOTAGE.md`, including what
  generation reliably gets wrong: **every phone screen is gibberish pseudo-text**, so never plan a
  shot whose payoff is words on a device — the caption typography carries the meaning instead.

### What is NOT done

- **The owner has not watched it yet.** That is the next thing.
- **His voice clone still wants a fresh 2-3 minute recording.** He knows; one gentle reminder max.
- The other queued ideas below (click-to-listen blog audio, blog-as-video, davinci.ai) are
  untouched, as is the blog TEMPLATE work (5 of 9 scenes still bespoke — see TEMPLATE PLAN).

**The hook rule (r/NewTubers 349-video study; applies to EVERY video):** open with a concrete,
checkable number that pays off the promise; no atmosphere, no greeting, no warmup.

**Owner ideas queued (2026-07-30, his direction — scope before building):**
- **Click-to-listen on every blog post**: NotebookLM-generated audio (podcast-hosts style) or
  LT-voice TTS read-through, in a floating player that follows the reader with pause/play
  while they scroll. Decide the voice per lane; the player is a real build item.
- **Blog-as-video**: each post also as a full watchable video (talking-head avatar — his clone
  once the new voice recording lands, or Flow's experimental avatar). He wants a credit-cost +
  quality analysis BEFORE committing; run a small test and show him.
- **davinci.ai** (davinci.ai/app/home): third-party AI suite he has an account on (image,
  video, music, voice, browser editor, Nano Banana Pro). Logged in; driveable via Chrome.
- **Gemini app** on the personal account can also generate images/video — alternate surface.

**Chrome-driving notes:** the claude-in-chrome extension disconnects every few actions
(service-worker restarts) — reconnect via tabs_context_mcp createIfEmpty and continue; batch
actions; never schedule a critical click after a long wait. Flow downloads land in
`C:/Users/Levan/Downloads` (the owner often downloads himself — check there first).

**The blog film is DONE for now** (v4, 39s, live + byte-verified): slow galaxy drift → one
scroll-speed dive → labeled brain with ignition cascade + idle spin; LT-clone VO with the
$6,000 hook. Capture recipe = pinned golden path + CDP virtual time (below — never re-learn
it). Only re-voice it after his new clone recording, and only if he asks.

## EARLIER STATUS (2026-07-29, session 6: the film is narrated + /ai links in)

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

The narration (LT clone, natural rate; STORY V2, owner 2026-07-29: hook + sell the money).
Grounded in the r/NewTubers 349-video hits-vs-flops study (found via the last30days skill):
hits open with a CONCRETE, CHECKABLE number or claim that pays off the promise; atmospheric
warmups and greetings correlate with flops; pace is baseline, not a differentiator. The $6,000
is the LeadsCalculator's own default commission, so the page defends the film's hook number.

| start | line |
|---|---|
| 0.30 | Last night, a six thousand dollar lead messaged your website. |
| 4.90 | A real question. Most sites would answer with a form. |
| 9.10 | This is the AI that answers for you. And it never guesses. |
| 13.85 | It says so, honestly. Then it texts real listings from the live MLS. |
| 20.10 | Search, text, transcript, all in the CRM. The call: booked by morning. |
| 26.20 | It answered at eleven forty. You called at nine. |
| 30.80 | Keep the next one. Realty L T dot com, slash A I. |

**THE FLIGHT IS CAPTURED IN PINNED MODE — never scroll-record it again.** Two supersessions of
the old recipe, both measured:
1. The quality governor dims a scroll capture (screenshot cadence reads as single-digit fps) —
   pinning it (`__qt.force(0)` + truncate `__qt.tiers`) helps but is NOT enough, because
2. **the real-user scroll path draws a ~7x sparser galaxy than the pinned golden path** (bright
   pixels 0.128% vs 0.957% at p=0.05), and settling does not recover it (0.3-4s tested, flat).
   Every scroll-driven capture was structurally dim — this was the owner's "galaxy still dimmed".
The recorder is now `_scratch-film-flight3.mjs` (v3, 2026-07-29 evening): after the REAL-TIME
boot, CDP virtual time advances the page exactly one film frame per capture, so all real-time
motion (ignition wave, twinkle, drift) plays at natural speed instead of ~9x fast - the owner
read that compression as "stopping and shaking". At the hold, `__pinwave` fires the page's own
arrival cascade and `__pinspin` eases in the hub idle spin (~2x live rate, reads on film).
Screenshot starvation under paused virtual time is handled by a nudge-and-retry. v2
(`_scratch-film-flight2.mjs`) is the same pinned sweep without virtual time: serve the ai-page repo locally, boot
`#p=...,noscroll` (pinned), sweep journey-p per frame via the page's `__pinp` hook (added
2026-07-29, pinned-only, deployed). One more trap it fixes: the OLD keys were SCROLL FRACTIONS,
which land deeper in the journey than the same journey-p — that is why the old hold showed the
hub labels. Labels need journey p > 0.85; the keys now end at 0.92 so the hold is the fully
labeled brain ("AI chat assistant" lit) at golden density.

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
