# Loop Journal — RealtyLT Autonomous Launch Loop

Each cycle appends a dated entry: what it did, what it VERIFIED (with evidence), and what's next.
The watchdog appends its passes here too. Newest at the top.

---

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
