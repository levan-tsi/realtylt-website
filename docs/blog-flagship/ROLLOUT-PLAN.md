# BLOGS + SERVICES ROLLOUT — the launch-week map (owner order 2026-08-25)

## PROGRESS (updated as rounds land; orchestrator-verified + pushed to the private prod)

| round | shipped | state |
|---|---|---|
| A | services hygiene: placeholders noindexed + out of sitemap · review-gating rewritten compliant · the 78% dead on services · fair-housing on lead-qual · `limits` field + 20 backfills · ToC z-fix · 3 thin pages enriched · zombie guard over services | VERIFIED, LIVE |
| B | topics 6-7: **review automation**, **AI appointment booking** · the unsourceable 73% killed, 74% sourced in its place · 5 more unsourced claims dead · `stat.source` rendered | VERIFIED, LIVE |
| C | topics 8-9: **local SEO**, **geo/area pages** · argued as two different products (overlap 0 across all 9) · 10 more claims killed incl. the citations-drive-map-pack myth · zombie guard rotted list replaced with a directory read | VERIFIED, LIVE |
| — | the blog INDEX stops listing the ten stubs (noindex settled Google; a person clicking still landed on "[Placeholder draft...]") | VERIFIED, LIVE |
| D | topics 10-11: **CRM sync**, **AI agent workforce** · 6 unsourced service claims killed · 9 defects found by looking | VERIFIED, LIVE |
| E | **the photograph shortage solved**: 14 new CC BY editorial plates, 5 unspent · topics 12-13: **skip tracing** (DPPA + FCRA, the legally heaviest page in the set), **marketing automation** (CAN-SPAM, the 0.3% ceiling, the three RFCs) · 8 more service claims killed incl. **three fabricated Hudson Valley addresses** live on the skip-tracing page · a wrong REASON caught in the second pass | VERIFIED, LIVE |
| — | **D5 stopped lying**: `visibleUpdated` was /updated/i over the whole body, so a post that used the word in prose was credited with a revision line it did not carry. It still failed on the dates, which is why the lie survived four rounds. Now reads the rendered `time[datetime]`; proved both ways | VERIFIED, LIVE |
| — | **the /ai page stopped disagreeing with the services surface** on seven claims (ai-page repo, LOCAL, awaiting the owner's deploy go): the reviews panel literally described REVIEW GATING, plus the dead 73%, "fraction of vendor pricing", "tens of thousands in unworked commission", "never slip through a PDF", "unlimited parallel agents", and CRM-sync's absolutes | LOCAL, owner-gated |
| F | 7 new CC BY / CC0 plates (4 unspent) · topics 14-15: **document processing** (FUNSD, DocVQA, Reg Z's two definitions of "business day"), **data enrichment** (the FTC's 6(b) data-broker study, the CCPA right to correct, and a decay rate that does not survive being followed) · 8 more service claims killed incl. **an invented person with an invented phone number** live on the enrichment page · **the plate is 16:9 on a phone and 21:9 on a laptop**, so Round E's alt-text rule was half right · six chart notes caught restating their own prose · **two more /ai COPY keys corrected**, both contradicted by their own page | building |

**Standing cohort state:** 15 flagship posts, all green on `flagship-standard.mjs`, sibling
overlap 0 across the whole cohort, zero new scene components in fourteen consecutive topics, 1251
tests. New posts score 17/19 on `score-flagship`: C3 (film) is owner-held and D5 (a real revision
date) cannot be true on the day a post ships. Neither is ever faked or re-baselined. **5 topics
have no flagship post**: ai-scheduling, invoicing-and-payments, ai-clone, ai-audit,
custom-automation.

**The photograph problem is closed, with a rule.** `public/images/editorial/` holds 21
photographs under CC BY 2.0 or CC0, 17 spent and **4 unspent**, each licence read on its own
source page. The rule that makes them go further than they look: a post needs **two plates of its
own**, not six, because four images arrive free on every post. The committed pipeline is
`find-plates.mjs`, `fetch-plates.mjs`, `plate-swatch.mjs` and `check-plate-licence.mjs`; run
`export MSYS_NO_PATHCONV=1` first in git-bash or every `/images/...` argument is rewritten into a
Windows path and nothing loads. See ROUND-E-LOG.md E0 and ROUND-F-LOG.md F0 for the ten candidates
those two rounds rejected and why.

**Round F corrected the alt-text half of that rule.** The Plate primitive renders 1088x466 at a
1440 viewport, which is 21:9, and 358x201 at 390, which is 16:9. Both fill the container width, so
the phone crop is a VERTICAL SUPERSET of the desktop one and alt text written from the 21:9 crop
is accurate and incomplete. `plate-swatch.mjs` now draws both and labels which to write from.

**Owner questions still open** (surfaced by the rounds, never written onto a page): does the
voice agent record audio or only store a transcript (NY one-party vs CA all-party) · does review
automation as built send the Google link to everyone (the page now describes the compliant
mechanic, so the BUILD is what changes if it still gates) · does the review widget select "best"
or "recent" (the FTC rule turns on the label) · does the booking layer send a real calendar
invitation and what calendar access does it request · do we manage the Business Profile or advise
on it · is the human editing step on area pages default or optional (the geo post's argument
rests on it) · the services tier assignments vs the blog cohort (3 services have far more
researched material than their page uses) · **Round E adds five, all about whether the builds do
what the two new pages now say they do**: do skip-tracing builds record a source and a date on
every enriched row, what permitted purpose is our own enrichment account established under, does
the pipeline scrub the do-not-call registry before anything dials, do marketing builds set up
SPF/DKIM/DMARC on the client's sending domain or assume it, and is Google Postmaster Tools set up
for the clients we send for. **Round F adds six, same shape**: do document-processing builds abstain or always return a value with a confidence, where does a flagged value go and who works that queue, do we store the source document and page number with every extracted value, what is our default overwrite behaviour on an enrichment pass, do enrichment builds write a source and a date onto every appended value, and does the BatchData response carry an age we could pass through. See ROUND-E-LOG.md and ROUND-F-LOG.md.

**Also carried:** `standard.json` has NOT been ratcheted since Round B, and Rounds C, D, E and F
each measured it and declined for the same reason. After Round F `available` measures **proseWords
5,503 / citations 5 / faqQuestions 8 / dataGraphics 3**, which would put **six** of the thirteen
older posts below the bar by construction (ai-chat, ai-voice, database-reactivation, ai-lead,
workflow-automation and ai-appointment are all under 5,503 words, five carry 2 data graphics rather
than 3, and six carry fewer than 8 FAQ questions). Closing it honestly is a six-post writing job,
not a flag flip, **and the gap grows with every round that ships a long post.** Worth doing
deliberately in a round with room for it.

**The order:** blogs + services for all ~20 topics in this repo. The AI Chat Assistant post is the
design standard. Videos untouched ("leave videos alone for now"). Workflow: Opus 5 subagents build
one round at a time; the Fable orchestrator verifies every round with its own gate runs and renders;
a separate checker agent audits the whole body of work at the end.

## Where the board stands (verified 2026-08-25)

- **15 flagship posts green as of Round F** (chat, voice, reactivation, qualification, workflow,
  review, booking, local-seo, geo, crm-sync, agent-workforce, skip-tracing, marketing-automation,
  document-processing, data-enrichment): `flagship-standard.mjs` prints all 15 meet the standard;
  the template and the primitive set are proven fourteen topics deep with ZERO new components.
  **5 topics have no flagship post.**
- **20 service pages exist**, disciplined, but `SERVICES-CRITIQUE.md` records: one legal-risk
  mechanic described as compliant (review gating, §1), the debunked 78% asserted 3x on the chat
  page whose own relatedPosts link debunks it (§2), the only regulated-risk page silent on its
  regulation (lead-qual fair housing, §3), **no limits field anywhere** (§4), a "never" promise on
  document-processing (§5), the ServiceToc mobile sheet under the chat launcher, two pages with
  empty relatedPosts, and three thin pages sitting on rich researched posts (tier mismatch).
- **10 consumer placeholder posts** are indexable and in the sitemap rendering
  "[Placeholder draft...]" — a per-post noindex + sitemap drop is owed (must not rely on the
  global prelaunch noindex, which the owner will flip at launch).
- **C3 of score-flagship needs a film.** Videos are owner-held, so every NEW topic lands 18/19
  with C3 honestly red. Never fake it; never re-baseline. `flagship-standard.mjs` (no film
  column) must be fully green, ratcheted at the START of the first blog round.
- The Singularity service page + SERVICE_SLUG (the /ai panel link waits on it) is owner-voice
  work — drafted for his pick, never self-approved.

## The waves

**ROUND A — fix what is WRONG before building what is missing (services hygiene).**
Placeholders noindexed + out of sitemap · critique §1 review-automation rewritten compliant ·
§2 chat 78%x3 → the HBR figures the flagship rests on · §3 lead-qual fair-housing paragraph +
legality FAQ lifted from its post · §5 document-processing "never" softened · `limits: string[]`
added to the Service type, rendered between UseCases and SeeItLive, 20 backfills (3 lifted from
posts) · ServiceToc sheet z-fix · the 3 thin pages enriched from their own posts (move what
exists; tier REASSIGNMENT stays an owner call) · zombie-claims guard extended over services.
Unknown product facts (e.g. whether calls are recorded) are REPORTED, never written.

**ROUNDS B.. — the 15 topics, ~2 per builder round, in session-11's order:**
~~review-automation, ai-appointment-booking, local-seo, geo-landing-pages, crm-sync,
ai-agent-workforce, skip-tracing-lead-generation, marketing-automation~~ (done through Round E),
~~document-processing, data-enrichment~~ (done through Round F), **ai-scheduling,
invoicing-and-payments, ai-clone, ai-audit, custom-automation** (5 left).
Per topic: research (its OWN primary source, read in the primary document — the zombie-stat rule);
write to the ratcheted standard (prose/sections/citations/FAQ/images/graphics/cost/calculator/
limits/how-to, overlap vs nearest sibling at the ceiling); scenes from the existing primitives
(zero new components is the proven bar; a bespoke component needs the calculator-lesson test:
"is this really not expressible as data?"); its calculator refuses a DIFFERENT number, stated;
its SERVICE page synced from the post in the same round (limits, FAQ, stat, relatedPosts).
Gate: flagship-standard green + score-flagship 18/19 (C3 film = owner-gated) + check-svg-crop +
zombie-claims + tsc + tests, all foreground. Deploy to the private prod, verify there.

**ROUND S — the Singularity page**: drafted in the owner's picked voice (candidate B, "the
tipping point"), rendered candidates for his review. Blocks the /ai panel link until he approves.

**FINAL — the checker**: a separate fresh-eyes agent re-runs every gate, reads strips of every
page at 1440/390, spot-checks claims against primary sources, and reports what the builders and
the orchestrator both missed. Then the orchestrator closes: handoff + scorecard updated.

## Standing rails for every builder (each earned the hard way)

Pathspec commits, never `git add -A` · `**/api/lead` intercepted in every probe · no MLS/media
calls in page or probe paths · no films/avatar/HeyGen · no CSP/security/RLS edits · no em dashes,
no arrow glyphs, design rules per CLAUDE.md · scenes REPLACE the markdown they stage · resting
style IS the final state · foreground gates only · the :3100 dev server may be wedged — the
Vercel build is authoritative · SVG crop guard re-proven on shipped posts before trusting it on
a new one · every claim either carries a primary source or the site already makes it.

**Three corrections to this list, each earned by a round finding the previous version false:**

- **"Vendor pricing rendered in JS is uncitable" is NOT a general rule** (Round D). Anthropic's
  and Google's per-token prices are readable in served HTML; only OpenAI refused, with a 403,
  which is bot-blocking rather than JavaScript. Check each vendor page yourself and refuse a
  number only for a reason you verified this round.
- **A refusal needs a CHECK, not a plausible reason** (Rounds D and E). Both rounds caught
  themselves asserting an unverified fact as the stated grounds for refusing a figure. If the
  reason is "we followed them and they all led to vendors", follow them.
- **Photographs: two plates per post, judged at the 21:9 crop, licence read on the source page**
  (Round E). Five unspent plates are in `public/images/editorial/`, and the pipeline is now
  COMMITTED rather than scratch: `find-plates.mjs`, `fetch-plates.mjs`, `plate-swatch.mjs`,
  `check-plate-licence.mjs`. CC BY-SA is forbidden and there is a committed test for it.
  **`scripts/fetch-images.mjs` is marked DO NOT RUN**: its failure path writes an empty
  ATTRIBUTIONS.md, which would delete the whole licence record.
