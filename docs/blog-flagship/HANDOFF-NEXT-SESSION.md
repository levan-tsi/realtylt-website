# HANDOFF — next session (Fable orchestrator + ONE builder)

**Paste this file as the kickoff. It is the whole brief.** Read it, then
`docs/blog-flagship/HANDOFF-BLOG-VERIFICATION.md`, which is job 1 in full detail.

Working model the owner wants: **Fable orchestrates and verifies; ONE Opus 5 builder does the
work, one job at a time; Fable re-runs the gates itself and looks at the rendered result before
anything is pushed or deployed.**

---

## STATE, so nothing is re-derived

**Done and live on the private prod** (`realtylt-website.vercel.app`, noindex, launch switches
still the owner's):
- **20 flagship blog posts**, one per AI service, all green on `flagship-standard.mjs`, sibling
  overlap 0 across the cohort, zero new scene components in 19 consecutive topics, **1333 tests**.
- **20 service pages** reworked: a `limits` ("what it does not do") section added to all twenty,
  review-gating rewritten compliant, fair-housing added to lead-qualification, ~50 unsourced or
  fabricated claims killed and guarded in `lib/blog/zombie-claims.test.ts`.
- Ten consumer placeholder stubs are noindexed, out of the sitemap and **no longer listed on
  /blog**; they still resolve by direct URL and still need real articles or deletion (owner call).
- Related-posts is curated per topic (was "the three newest" for all 30 posts).
- Calculator sliders were a 4px touch target on mobile; now 44px, proven by drag at five offsets.

**Deployed to production this session:** the `/ai` journey (repo `realtylt-ai-page`, stamp
`20260825g`). The unsourceable 78% is now gone from the page, from its FAQ JSON-LD and from
`llms.txt`, **and therefore from `realtylt.com/ai`**, which is a `next.config.ts` rewrite to that
project. Verified on prod after deploy.

**Round logs** (each says what it did NOT do): `docs/blog-flagship/ROUND-A..I-LOG.md`,
`CHECKER-REPORT.md` (independent audit), `ROLLOUT-PLAN.md` (board + the ratchet decision),
`OWNER-QUESTIONS.md` (everything only the owner can answer).

---

## JOB 1 — verify all twenty posts. **Full brief: `HANDOFF-BLOG-VERIFICATION.md`.**

The owner's words: *make sure the numbers are correct from proper sources, because it was
supposed to do deep research and brainstorm on those first, and I am not sure it did.* Also:
relevance, truth, design and text at the **AI Chat Assistant standard**, and that links work.

The short version of why it needs a round: earlier verified rounds still contained fabricated
addresses, an invented person with an invented phone number, invented hour figures, dates written
from memory, a statute cited from the **wrong subdivision**, and a **misread source**. All found
by reading, none by a gate. The checker sampled 17 of ~89 citations and found 1 wrong; Round I
read 15 more and found 0. **Nobody has read all 89.** That is the gap.

Deliverable: `docs/blog-flagship/BLOG-VERIFICATION-REPORT.md` with a table of every citation, its
operative sentence quoted, and a verdict; a relevance paragraph per post; a **forced design
ranking naming the weakest three** and what fixes them.

---

## JOB 2 — the missing boxes. **The owner reported this and the cause is confirmed.**

His report: *"I don't think all of the services have a services-page box where you click and it
takes you to the service page, and for blogs the same — at least they are not in production."*

**Diagnosed, not guessed.** `realtylt-ai-page/web/src/main.js` ~line 814 has a `BLOG_POST` map
that decides whether a service panel shows its "read the guide" card. It lists **five** topics —
chat, voice, workflow, reactivation, qualify — the five posts that existed when it was written.
Its own comment says *"it lights up per-service as the other topics land."* **All twenty have
landed and the map was never updated**, so fifteen of twenty panels show no blog card.
`SERVICE_SLUG` (~line 797) does map all twenty, so the service link should be present everywhere —
**verify that rather than trusting it**, since the owner reported both as missing.

Build: complete the map for all twenty. Slugs and titles are verified below. **Read times must be
read from the live post, not invented** — including re-checking the five that already exist, since
those posts were rewritten and some are now wrong.

| key | slug | title |
|---|---|---|
| chat | ai-chat-assistant-real-estate-website | Your Website Answered That Buyer at 11:40pm. Did You? |
| voice | ai-voice-agent-missed-calls-real-estate | Nobody Leaves a Voicemail Anymore. They Call the Next Agent. |
| workflow | workflow-automation-real-estate-business | The Busywork Tax: What Workflow Automation Actually Removes |
| reactivation | database-reactivation-old-real-estate-leads | They Said Not Right Now. That Was Three Years Ago. |
| qualify | ai-lead-qualification-real-estate-scoring | All Three Leads Look the Same. Two Are Worth Your Morning. |
| reviews | automated-google-review-requests-real-estate | Twelve Five-Star Reviews. The Newest One Is From 2023. |
| book | ai-appointment-booking-no-shows-real-estate | You Booked the Showing for Nine Days Out. Nobody Came. |
| localseo | local-seo-real-estate-map-pack-google-business-profile | Three Businesses Show Up. Yours Is Not One of Them. |
| geopages | geo-landing-pages-real-estate-doorway-pages | Nine Town Pages. The Only Thing That Changed Was the Town. |
| crmsync | crm-sync-real-estate-duplicate-contact-records | She Is In Your CRM Twice. Only One of Them Knows She Sold. |
| agents | ai-agent-workforce-real-estate-assistants | Four Assistants Ran Overnight. Nobody Read What They Did. |
| data | skip-tracing-real-estate-legal-owner-phone-numbers | You Have Her Number. She Never Gave It to You. |
| marketing | marketing-automation-real-estate-email-deliverability | You Sent It to Fourteen Hundred People. Five Pressed One Button. |
| docs | document-processing-real-estate-contract-deadlines | It Read the Date Correctly. The Date Was Not the Deadline. |
| enrich | data-enrichment-real-estate-stale-contact-records | The Empty Fields Got Filled. So Did the Ones That Were Already Right. |
| scheduling | ai-scheduling-real-estate-showing-confirmations | You Said It Was Confirmed. One of the Three People Had Not Replied. |
| pay | invoicing-and-payments-real-estate-brokerage | The Referral Closed in July. Nobody Here Raised an Invoice. |
| clone | ai-clone-real-estate-agent-video-avatar | Fourteen Videos Went Out in Your Face. You Have Watched None of Them. |
| consult | ai-audit-small-business-what-not-to-automate | You Had Eleven Ideas. The Hour Crossed Four of Them Off. |
| plus | custom-automation-real-estate-bespoke-build | It Ran Every Morning for Two Years. Then a Field Came Back With a New Word in It. |

Then: assert all **forty** destinations return 200; open all twenty panels at **1440 and 390
DPR3**, confirm both links are visible and clickable, and **screenshot and read them** — the
complaint is visual, so a DOM assertion does not answer it. Watch whether the new card breaks the
mobile sheet now that fifteen more panels have one.

**ai-page rails:** touch `web/src/main.js` only, plus the cache stamp in `web/index.html`
(currently `20260825g` — bump it or the browser serves cached JS and the change is invisible).
Do not touch the scene files, `styles.css` or `gravitype.js`. `export
NODE_OPTIONS='--use-system-ca'`. Serve `web/` on `:8756`, reuse a running server. Renders
FOREGROUND and headed (`agent/_shot.mjs`); backgrounded renders exit 144 with no output. Gates
before done: `agent/_r15_sweep.mjs both` = 72/0, `agent/_r23_cursorlaw.mjs` = 13/0, zero JS
errors, all four beats render.

---

## JOB 3 — the owner answered one of the open questions; close it properly

**His answer:** *"Robo calls are recorded with Vapi. But our personal calls are not recorded."*

This resolves `OWNER-QUESTIONS.md` §1.3 and, importantly, **resolves it in favour of what the
flagship post already says.** The voice post states that the agent tells the caller the call is
recorded — that is about the **AI agent's** calls, which Vapi records, so the claim was correct.
His personal calls are out of that post's scope.

Two things to do, and the second matters legally:
1. `content/services/ai-voice-agents.ts` currently states the RULE without saying which side we
   are on (Round I). Update it to say plainly that **the AI agent's calls are recorded and the
   agent discloses that at the start of the call**, and that this is separate from a person's own
   phone. Keep the one-party/all-party rule and the assume-the-stricter-rule posture.
2. **Ask the owner to confirm the recording toggle in the Vapi dashboard once**, because he said
   "not sure". The page should not assert it until he has looked. Until then, keep the current
   rule-only wording and put the confirmation at the top of `OWNER-QUESTIONS.md`.

---

## JOB 4 — everything else before launch

Work `OWNER-QUESTIONS.md` top-down with the owner. Three items carry legal exposure and are still
unanswered: **does review automation as built send the Google link to everyone** (the pages now
describe the compliant mechanic, so if the build still gates, the build changes); **does the
review widget show "best" or "recent"** (the FTC rule turns on the label); **does the
skip-tracing pipeline scrub the do-not-call registry before anything dials.**

Also standing, none of them blocking:
- **The launch switches are the owner's**: `NEXT_PUBLIC_SITE_URL`, apex DNS, `PRELAUNCH=1`, in
  that order. Never remove noindex.
- **Films.** Every new post scores 17/19 rather than 19/19 because C3 wants a film and videos are
  owner-held. Never faked, never re-baselined. If he releases videos, that is a round.
- **The ratchet.** Decided and written up in `ROLLOUT-PLAN.md` ("The ratchet, decided"): never
  raise `proseWords`; the other four metrics are a separate deliberate round on the five ORIGINAL
  posts, ratcheted at the START of that round and closed by writing.
- **Ten consumer placeholder posts** need real articles or deletion.
- **One `SyntaxError` seen once in ten observations** on `/services/ai-chat-assistant`, never
  reproduced; every inline script, JSON-LD block and same-origin script parsed clean. Not in our
  bytes. Watch it on the Vercel build.
- **Vercel Web Analytics is still off** — the lone console 404 on the /ai page is that script.

---

## STANDING LAWS (each earned the hard way; do not relearn them)

- **Pathspec commits**, never `git add -A`. A second session may share the tree.
- **Never invent a number, a fact, a REASON, or a SPECIFIC** (address, person, price, reference,
  or a detail about a photograph). Four separate rounds did, and every instance shipped past its
  own author's review.
- **A refusal needs a checked reason.** Two rounds refused figures for reasons that were false
  when followed.
- **Read the operative sentence in the primary document**, never a summary, even a unanimous one.
  This rule has now caught: "23 minutes 15 seconds" (real figure 25:26), "$16,000 per text",
  the 78%, the 73%, and a statute cited from the wrong subdivision.
- **Verify per-item facts in a real browser, not by curl-grep.** Flickr serves curl a JS shell
  with no licence in it and the obvious grep pattern cannot match CC0 at all; `bls.gov` and
  `dos.ny.gov` block browser-like agents but answer a plain one; `nysenate.gov` is the inverse —
  200 to a default curl agent, 403 to anything browser-like; EUR-Lex serves a JS shell.
- **Prove every instrument against a known-good AND a known-bad before believing it.** An
  orchestrator's own link checker reported all 89 citations dead when the checker was what broke.
- **Look at the rendered result.** Every defect that mattered was found by eye, not by a gate.
- **`**/api/lead` posts to the live CRM** — intercept it in every probe.
- **No MLS/DATA-API/`media.mlsgrid.com` calls** in any page or probe path (suspension history).
- Never re-baseline a red gate; triage it.
