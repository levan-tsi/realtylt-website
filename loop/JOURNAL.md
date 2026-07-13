# Loop Journal — RealtyLT Autonomous Launch Loop

Each cycle appends a dated entry: what it did, what it VERIFIED (with evidence), and what's next.
The watchdog appends its passes here too. Newest at the top.

---

## 2026-07-13 — CYCLE 1 (Phase-4 watch): all three green; found + fixed a REAL duplicate-contact bug

**Did:** watch pass on all three properties (2 parallel Opus sub-agents on the website + AI-page repos; I took
the CRM/data layer myself — never two agents in one tree). Website + AI page came back GREEN with no product
regressions. **The cycle's real find was in the DATA layer, not in either app.**

**The bug (mine to find, not the agents'):** yesterday's migration 0013 mirrors `public.leads` → `public.contacts`
via an AFTER-INSERT trigger. But the live n8n workflow **"RealtyLT Capture Lead"** (`ayoG2IadpWFgfFmH`) was
ALREADY inserting contacts itself (`Save to leads -> Save to contacts`). So since 2026-07-13 **every chatbot
lead would have created TWO contacts for the same person.** It was invisible to tests, to the build, and to
traffic — no chatbot lead happened to arrive in the window — and 0013's `[leadid:N]` guard *structurally*
cannot catch it (the trigger fires BEFORE n8n's contact row exists, so looking backward finds nothing).
Found by reading the LIVE DATA (a contact 26ms newer than a lead, carrying no `[leadid:]` marker → a second
producer must exist) and then reading the live workflow.

**Fixed, both halves (they must stay in sync):**
- CRM migration **`0014_lead_contact_dedup.sql`** — the DB trigger becomes the SINGLE producer of contacts from
  leads and dedups ACROSS producers on normalized phone/email; a repeat lead now ATTACHES to the existing
  person (appends `[leadid:N]`, backfills only blank fields, never overwrites). Applied to the live DB.
  Also delivers the "cross-lead dedup by email/phone" 0013 had deferred.
- **n8n** — removed the redundant `Save to contacts` node, republished (active `0b06afc3…`).

**VERIFIED (independently, on the real systems — did not trust any agent's "done"):**
- Live DB, rolled-back probes: new person → exactly **1** contact; repeat lead as `+1 917-900-7324` matched the
  stored `9179007324` → **0 new contacts**, attached. leads=1/contacts=8 before AND after (zero residue).
- Re-read the **published** n8n active version: 6 nodes, no contacts insert, chain intact, still active.
- Re-ran the website gates MYSELF: **103/103 tests, `next build` exit 0**. Live: `noindex`+CSP+HSTS intact,
  IDX `fixtureMode:false` / 5,362 listings, `/ai` + standalone both 200.
- Read the website agent's gate change (`git show`, not `git diff` — rtk strips deletions on Windows): it
  loosened a freshness assertion from `<24h` to tiered. Scrutinized it — legitimate (no refresh cron exists, so
  it went red daily from time alone) and **>72h still FAILs**. Not a neutered gate.

**Commits:** website `4ef3f2b`+`a09a598`+`bb23d88` (watch tooling + learnings; NO product code), ai-page
`6f117cf` (watch harness), CRM clone `76a8fde`+`c6bb072` (0014 + docs, pushed to `fix/brivity-parity`).

**Next cycle:** the suite is green, but 0014 + the n8n change landed TODAY. Run ONE clean confirmation watch
(especially the lead→contact path end-to-end) before declaring convergence. **STOP CRITERION: if the next watch
is fully green with ZERO new findings, write "ALL SHIP-READY — awaiting owner go-live" to CHECKPOINT and
`touch loop/STOP`.** Did NOT stop this cycle — a watch that just found a real production bug has not yet
earned a clean bill of health. New OWNER ACTION items are in CHECKPOINT (stray test contact; mirrored leads
land Unassigned; the AI-page standalone noindex trap — do NOT "just add noindex", it would suppress /ai at launch).

## 2026-07-13 — HANDOFF from the manual orchestrator session (loop going live)
The manual multi-cycle orchestration is COMPLETE and the suite is **functionally launch-ready**. Start each
cycle by ASSESSING, not rebuilding — most of this is done + independently verified. True state:
- **Website** (main): CONVERGED, ship-ready pending owner go-live. IDX real (5,362 OneKey listings,
  fixtureMode:false), 0 CSP violations, tests green, noindex + security intact, /api/lead rate-limited.
- **AI page** (windows-main, CLI-deploy): CONVERGED. Portrait brain-framing fixed, mobile smooth, recruit
  modal + chat wired, boot watchdog. Live chat works on the /ai proxy (CSP+CORS fixed). Golden re-baseline
  is OWNER-gated — do NOT re-baseline unprompted.
- **CRM** (isolated clone /root/realtylt-crm-fix, fix/brivity-parity — NEVER touch /root/realtylt-crm):
  CONVERGED on Brivity parity + a REAL automations engine (enroll→schedule→tick→dispatch via n8n, Test
  Mode default ON) + TCPA opt-out. Gates 476 vitest / 74 e2e.
- **Cross-suite CONNECTION (was the big gap, now FIXED + verified live):** website/AI/chatbot leads write
  to public.leads; the CRM reads public.contacts — they were disconnected. Migration 0013 adds an
  exception-safe AFTER-INSERT trigger `mirror_lead_to_contact()` mirroring leads→contacts. It had a silent
  bug (leads carry intent 'buy' but contacts.intent CHECK wants 'buyer' → insert failed and was swallowed);
  fixed to map the vocab + `raise warning` on failure (CRM clone commit 1cc7af2, applied live). GOTCHA:
  exception-safe triggers must RAISE WARNING, never silently swallow.
- **What's LEFT = owner-gated only** (record under OWNER ACTION, don't do): website PRELAUNCH-off + prod MLS
  key + domain/DNS; CRM prod-Supabase decision + merge fix/brivity-parity + app.realtylt.com cutover;
  automations env (N8N_DISPATCH_*, tick scheduler, Test-Mode-off) + MLS_PROVIDER=snapshot flag; Twilio A2P +
  inbound-STOP webhook + owner cell for SMS test; RAG-demo n8n CORS toggle; AI golden re-baseline.
  Plus small non-blocking refinements the loop MAY pick up: mirrored-lead routing/assignment (lands
  Unassigned), cross-lead dedup by email/phone, backfill the 1 pre-existing lead (id 13).
- So: this loop's job now is the **Phase-4 WATCH role** — periodically re-verify all three live (desktop +
  phone), assert real behavior (IDX pools live data, photos on-view, lead→CRM mirror works, chat/automations
  run), catch regressions, do small high-value refinements. Don't churn mature domains; accept convergence.
  If a full watch pass is green with only owner-gated items left, note "ALL SHIP-READY" and `touch loop/STOP`.

## 2026-07-12 — loop built (not yet launched)
Autonomous launch-loop infrastructure created (`loop/`): `LOOP_PROMPT.md` (per-cycle orchestrator, Opus
4.8, summons the 3 property sub-agents), `WATCHDOG_PROMPT.md` (coach + safety brake), `run-cycle.sh` /
`loop.sh` / `watchdog-cycle.sh`, `start-loop.ps1`, `README.md`. Not launched — a manual Fable session is
currently doing the first pass; the loop takes over when that finishes (`start-loop.ps1`). All three
properties' state is in git + `CHECKPOINT.md` + `AGENT_LEARNINGS.md`.
