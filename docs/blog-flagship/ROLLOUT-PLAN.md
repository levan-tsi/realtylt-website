# BLOGS + SERVICES ROLLOUT — the launch-week map (owner order 2026-08-25)

## PROGRESS (updated as rounds land; orchestrator-verified + pushed to the private prod)

| round | shipped | state |
|---|---|---|
| A | services hygiene: placeholders noindexed + out of sitemap · review-gating rewritten compliant · the 78% dead on services · fair-housing on lead-qual · `limits` field + 20 backfills · ToC z-fix · 3 thin pages enriched · zombie guard over services | VERIFIED, LIVE |
| B | topics 6-7: **review automation**, **AI appointment booking** · the unsourceable 73% killed, 74% sourced in its place · 5 more unsourced claims dead · `stat.source` rendered | VERIFIED, LIVE |
| C | topics 8-9: **local SEO**, **geo/area pages** · argued as two different products (overlap 0 across all 9) · 10 more claims killed incl. the citations-drive-map-pack myth · zombie guard rotted list replaced with a directory read | VERIFIED, LIVE |
| — | the blog INDEX stops listing the ten stubs (noindex settled Google; a person clicking still landed on "[Placeholder draft...]") | VERIFIED, LIVE |
| D | topics 10-11: CRM sync, AI agent workforce | building |

**Standing cohort state:** 9 flagship posts, all green on `flagship-standard.mjs`, sibling
overlap 0 across the cohort, zero new scene components in nine consecutive topics, 1188+ tests.
New posts score 17/19 on `score-flagship`: C3 (film) is owner-held and D5 (a real revision date)
cannot be true on the day a post ships. Neither is ever faked or re-baselined.

**Owner questions still open** (surfaced by the rounds, never written onto a page): does the
voice agent record audio or only store a transcript (NY one-party vs CA all-party) · does review
automation as built send the Google link to everyone (the page now describes the compliant
mechanic, so the BUILD is what changes if it still gates) · does the review widget select "best"
or "recent" (the FTC rule turns on the label) · does the booking layer send a real calendar
invitation and what calendar access does it request · do we manage the Business Profile or advise
on it · is the human editing step on area pages default or optional (the geo post's argument
rests on it) · the services tier assignments vs the blog cohort (3 services have far more
researched material than their page uses).

**Also carried:** `standard.json` was NOT ratcheted after Round C — `available` measures
3675/21/6, which would put five shipped posts below the bar by construction. Closing that is a
five-post writing job, not a flag flip.

**The order:** blogs + services for all ~20 topics in this repo. The AI Chat Assistant post is the
design standard. Videos untouched ("leave videos alone for now"). Workflow: Opus 5 subagents build
one round at a time; the Fable orchestrator verifies every round with its own gate runs and renders;
a separate checker agent audits the whole body of work at the end.

## Where the board stands (verified 2026-08-25)

- **5 flagship posts live and green** (chat, voice, reactivation, qualification, workflow):
  `flagship-standard.mjs` prints all 5 meet the standard; template + primitives proven — topic 5
  added ZERO new components. **15 topics have no flagship post.**
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
review-automation, ai-appointment-booking, local-seo, geo-landing-pages, crm-sync,
ai-agent-workforce, skip-tracing-lead-generation, marketing-automation, document-processing,
data-enrichment, ai-scheduling, invoicing-and-payments, ai-clone, ai-audit, custom-automation.
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
a new one · vendor pricing rendered in JS is uncitable — refuse the number · every claim either
carries a primary source or the site already makes it.
