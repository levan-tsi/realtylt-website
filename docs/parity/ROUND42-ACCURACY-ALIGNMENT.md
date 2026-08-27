# Round 42 — accuracy + alignment (2026-08-27)

One builder, one session, on the owner's orders of 2026-08-26. Four beats: the HeyGen ownership
claim, the phone contents pill, a full link and claim sweep, and the Singularity service page,
plus one widget nit. Everything below was measured on this box against the dev server on :3100.

Commits: `c941698` (pill), `885f8d8` (ownership), `8788f0e` (widget), `c3c70fe` (singularity),
and this log.

---

## 1. The HeyGen ownership claim was wrong on FIVE surfaces

Owner, verbatim: *"The video blog said the model is yours and not licensed. We use HeyGen for AI
clone videos. It is HeyGen's model, you license/rent the platform from them. It should be
accurate."*

He is right. What is true: the avatar renders on a HeyGen-class platform and the voice on an
ElevenLabs-class engine, both **licensed** from the vendors who built them. What a client owns is
the material at both ends: their likeness, the footage, the scripts and the finished videos.

The claim was live in five places, and the last two were found only by a second sweep run **after**
the first three were fixed and believed to be all of them. That is the 78% shape exactly: one
retraction, several surfaces, and the ones nobody opens are the ones that keep talking.

| # | surface | before | after |
|---|---------|--------|-------|
| 1 | `clone-scenes.ts` CONSENT_PATH caption | "The model / Yours, not licensed on" | "The model / Licensed, not owned" |
| 2 | `ai-posts.ts` AI_CLONE_POST FAQ | "the likeness and voice model are yours" | splits the question; says the technology is licensed and nobody is selling you a model you own |
| 3 | `services/ai-clone.ts` FAQ | "Who owns the avatar and the voice?" / "**You do.**" | names the two licensed platforms and what is actually yours |
| 4 | `clone-scenes.ts` diagram **lede** | "makes the third one yours rather than borrowed" | "make the third one lawful rather than lifted" |
| 5 | `clone-scenes.ts` diagram **alt text** | "a model that stays yours" | "a licensed model built only from it" |

Surfaces 4 and 5 are the interesting ones. The lede is prose a reader skims and the alt text is
read only by a screen reader, so both would have survived any number of visual audits while the
caption two lines away had already been corrected.

**Adjacent change, deliberate.** The same service page's `limits` said "The likeness and the voice
are yours" to mean something narrower and true (it speaks as nobody else). It now says that
without borrowing the ownership words, which is what let the guard cover the phrase at all.

**Not changed, deliberate.** The blog post still does not name the tool. That is the post's own
standing constraint (the pipeline is owner-held, so the article is about what a synthetic likeness
may and may not do, never about how ours is produced) and accuracy did not require breaking it.
"the vendors who built them" is honest and matches the cost section's existing "whichever platform
renders the result". The SERVICE page names the vendors, because that is where the ownership
question is asked.

**Guard:** `zombie-claims.test.ts` round J. First entry in that table that is neither a number nor
a hedge but a statement about who owns what. Proved to catch all five original sentences, and
proved NOT to catch the four legitimate "stays yours" lines elsewhere on the site (a lead, a plan
page, an audit deliverable, and "Traffic that is not rented" on local-seo, which is an ordinary
organic-versus-paid claim and stays). Suite red on a restored claim, green after.

---

## 2. The phone contents pill: 34px left of centre on all twenty flagship posts

Owner: *"on phone some blogs, the hovering listing on the bottom where you can click and jump to
different places in the blog was misaligned."*

**Measured before touching anything**, 390 DPR3:

| surface | pill centre | viewport centre | delta |
|---|---|---|---|
| all 20 flagship posts | 161 | 195 | **-34** |
| service pages (ServiceToc) | 195 | 195 | 0 |
| 10 legacy posts | no trigger rendered | | |

"Some blogs" is the twenty. The ten legacy posts render no pill at all, which is why it read as
some rather than all.

**Cause.** `FlagshipToc` dodged the chat launcher *sideways*: `fixed inset-x-4 bottom-5
right-[5.25rem]` with `justify-center` centres the pill inside the band that EXCLUDES the launcher
gutter. The offset is exactly half the excluded gutter: 84/2 - 16/2 = 34.

**Fix.** Dodge on WIDTH instead. The bubble measures 60x60 at (314,768) and sits 16px off the right
edge, so a centred pill capped at `max-w-[calc(100%-10.5rem)]` ends 84px from the edge and clears
it by 8px at any width. The cap is a percentage of the CONTAINER, not `100vw`, because vw includes
the scrollbar and would hand the pill ~15px it does not have on a desktop browser below 1360px.

**Considered and rejected, with the measurement that killed each:**

- *Cap the width and keep the prefix.* Natural pill widths on the twenty run **219 to 286px**. A
  centred pill at 390 can be at most 222px. Truncation eats from the END, so this cuts the ACTIVE
  LABEL and keeps the boilerplate, which is backwards for a navigation control.
- *Copy `ArticleToc`/`ServiceToc` verbatim* (`left-1/2 -translate-x-1/2 max-w-[86vw]`). At 390 that
  allows 335px, and a 286px pill centred spans 52 to 338 against a bubble starting at 314: a 24px
  overlap. This is the collision the sideways dodge was invented to solve, so it would have traded
  the owner's bug for the older one.
- *Lift the pill above the launcher.* Works, but leaves flagship posts with a pill floating 84px
  up while every other page on the site keeps one at `bottom-5`. Trades one inconsistency for
  another.

**Shipped instead:** centred, width-capped, and "On this page /" hidden below 560px so the label
survives. The hamburger already says what the control is and the sheet's own header repeats the
phrase in full on open.

**After, all 20 posts:** centre 195, delta 0, launcher gap 23 to 56px, no truncation.
**Across widths** on the widest-label post: 320/360/390/430/559/560/768/1024/1359 all delta 0, no
overlap, no horizontal overflow; the prefix returns at exactly 560 as designed. At 320 the pill
truncates to "When they ..." with an 8px gap to the bubble, which is the overflow width and
acceptable.

Before/after crops of the bottom band for all twenty: `docs/toc-align/before` and
`docs/toc-align/after`.

**Two guards, both proved red on the old class first:**
- `components/toc-centering.test.ts` — all three ToC components centre their trigger and none
  dodges sideways with an asymmetric inset. Runs in `npm test`.
- `scripts/toc-align-probe.mjs` — measures the rendered pill on every flagship post at 390 DPR3 and
  exits non-zero on off-centre, overlap or overflow. **Per post** on purpose: the class is shared,
  but the width that decides clearance is set by each post's longest label, so one page passing
  proves nothing about the other nineteen.

Two instrument bugs were found and fixed while building the unit guard, and both would have been
green-looking holes: it first searched only BACKWARDS from `data-toc-trigger` for the placement
class, which reported "no fixed wrapper" on the two components whose class follows the attribute;
and once fixed it latched onto ServiceToc's DESKTOP RAIL (`fixed top-1/2 ... min-[1360px]:block`)
instead of the pill. Narrowed to `fixed` + `bottom-`.

---

## 3. Links and claims

`scripts/_scratch-link-sweep.mjs`, run against 53 pages: `/blog`, `/services`, all 30 blog posts,
all 21 service pages.

**3,212 anchors seen. 0 internal problems.** Every internal path resolves 200, every same-page
`#id` exists in the rendered DOM, every internal hash target exists on its destination page.

**240 unique external links:** 196 answer 200. The rest are WAF and bot responses, not dead links,
and each was checked in a real browser:

| host | request API | real browser | verdict |
|---|---|---|---|
| `developers.facebook.com` (Graph API versioning) | 400 | **200, "Versioning - Graph API"** | live |
| `www.nysenate.gov` (CVR 50/51/50-F, GBS 518, PEN 250) | 403 | **200, "NYS Open Legislation"** | live |
| `dl.acm.org` (CHI/CACM) | 403 | 403 challenge | **live, proved by control** |
| `www.bls.gov` | 403 | 403 "Access Denied" | **cannot verify from this box** |
| `dos.ny.gov` | 403 | 403 Cloudflare challenge | **cannot verify from this box** |
| `www.facebook.com/sharer` (30 share buttons) | 400 | n/a | share intent, expected |

**The control experiment**, because a 403 on its own says nothing about whether a page exists:
request a URL on the same host that certainly does not exist and compare.

```
bls   real  403 "Access Denied"     bls   bogus 403 "Access Denied"      -> status carries no information
dos   real  403 "Just a moment..."  dos   bogus 403 "Just a moment..."   -> status carries no information
acm   real  403 "Just a moment..."  acm   bogus 404 "ACM Error: 404"     -> WAF passes 404s through, so the real one EXISTS
```

So the ACM citation is positively confirmed. BLS and dos.ny.gov are honestly **unverified**: both
return an identical challenge for a real and an invented URL, so nothing this machine can observe
distinguishes a live page from a dead one. The paths are unchanged from the rounds that verified
them and are well-formed, and that is the whole of the evidence. Recorded here rather than
reported as green.

**`/ai` is not served by this app.** The Three.js journey is a separate Vercel project mapped onto
the same domain: the dev server 404s `/ai` while `realtylt-website.vercel.app/ai` answers **200**.
The first sweep reported twenty-one dead `/ai#key` links that are not dead. The probe now checks
`/ai` against the deployed host and skips its hash targets, because that page is hash-ROUTED
(`main.js` has a popstate route and an `openSingularity` handler), so `getElementById` is the wrong
instrument and would report a working deep link as dead. Verified separately: `/ai` answers 200 and
keeps the fragment. Whether each hash opens its panel belongs to the ai-page lane.

**Claims.** The headline number on both pages this round rewrote was re-verified word for word
against the primary (Nightingale and Farid, PNAS 119(8), 2022, read on PMC):

- "315 participants classified, one at a time, 128 of the 800 faces" — matches
- "The average accuracy is 48.2% ... close to chance performance of 50%" — matches
- "219 new participants, with training and trial-by-trial feedback" — matches
- "The average accuracy improved slightly to 59.0%" — matches
- "there was no improvement in accuracy over time" — matches "got no better with practice"

---

## 4. `/services/the-singularity`

The twenty-first service page, and the only /ai panel that had no indexable page behind it. Source
is `COPY.singularity` in `realtylt-ai-page/web/src/main.js` (the owner's own pick, round 25
candidate B). Two deliberate divergences, both documented at the top of the file:

1. The panel's lede ends *"Every other tool you own peaked the day you installed it. This one is
   past that point: it improves faster than you can shop for a replacement."* The first sentence is
   an argument and survives in `why`. The second is a comparative RATE claim against every other
   product a business owns, with no measurement of this system or of any of them. Not carried.
2. `specs` said "remembers everything" (an absolute the page's own limits contradict four lines
   later) and "gets better with every deal" (a rate nobody measured). Both replaced.

No `stat`: every number that could go there would be about this system's own rate of improvement
and nobody has measured it.

**If the panel and the page should agree word for word, `COPY.singularity` is the side to change.**

Three counts assumed twenty and were all found before writing the file rather than by a red suite
afterwards: the registry length and `AI_COPY_KEYS` in `lib/services/index.test.ts` (which needed
`"singularity"` because it is set by `if (EYE_PROTO) COPY.singularity = {...}` rather than declared
in the literal), and the `content/services/` source count in `zombie-claims.test.ts`.

Verified 200 at 1440/390/320, no horizontal overflow, all four JSON-LD nodes present, and it
propagated to every map generated from the registry: `sitemap.xml` and `llms.txt` both moved from
20 to 21 service entries, and it appears on `/services` and `/sitemap`.

---

## 4b. Widget persona placeholder

The `/ai` persona swapped the greeting and the chips and never swapped the input. Both strings are
`CONFIG` keys now (`PLACEHOLDER` / `AI_PLACEHOLDER`) and the choice comes from `currentPersona()`,
matching the greeting, so the persona keeps sticking to the conversation rather than the page.

Verified against the real file in a browser. The website has no `/ai` route, so the probe served a
real `/ai` pathname and let `/rlt-chat.js` load from the dev server underneath it: `/ai` gets the
service prompt, `/air-conditioning` (the trap `detectPersona`'s own comment warns about) gets the
listing prompt, `/services/ai-clone` and `/blog` unchanged.

**THE /ai PAGE CARRIES A BYTE COPY OF `rlt-chat.js` AND MUST RE-COPY IT.**

---

## Gates

`npx tsc --noEmit` clean. `npm test` **99 files / 1373 tests**, all green, run in the foreground
before every commit. Baseline in: 98 files / 1364. Baseline out: 99 / 1373.

## Open, for whoever picks this up

- **BLS and dos.ny.gov citations are unverified from this box** (see the control above). Worth one
  check from a residential connection before launch.
- **`ArticleToc` and `ServiceToc` still cap at `max-w-[86vw]`.** Both are centred and both measure
  clear of the launcher today (ServiceToc: 200px wide, 19px gap) because their labels are short and
  fixed. A long section label on either would overlap the bubble, which is the collision
  `FlagshipToc` now solves with a width cap. Not touched this round: nothing is broken, and it is
  the adjacent-code rule.
- **The /ai lane owes two things**: re-copy `public/rlt-chat.js`, and add
  `singularity: 'the-singularity'` to `SERVICE_SLUG` in `main.js` so the Singularity panel's THE
  SERVICE PAGE box lights up now that the page exists.
- **The Singularity BLOG POST is still unwritten.** Deliberately out of scope this round.
