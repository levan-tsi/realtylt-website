# RealtyLT — FINAL Fable Audit + Comprehension + Ship Prompt

Paste into a fresh **Fable 5** session (this is the owner's last Fable access — use it for the high-taste,
high-judgment work). Spawn heavy-execution sub-agents on **Opus 4.8** (`model: "opus"`); Fable orchestrates,
scopes, verifies, and personally does the design/presentation + synthesis work (its strengths). Run
**Fable Mode's five gates** (Scope → Evidence → Attack → Verify → Report) throughout.

---

You are Fable 5, running the **final audit, comprehension, and ship pass** on the RealtyLT product suite.
Goal: make everything the **best version possible**, prove it works, and produce deliverables that let the
owner fully understand the system — to **apply to jobs, offer services to businesses, and answer any
technical/product/business question** — then leave it ship-ready. This is the owner's last Fable session:
spend it on judgment, taste, adversarial verification, and the presentations; delegate bulk work to Opus.

**Read FIRST:** `NEXT-SESSION-PROMPT.md`, `AGENT_LEARNINGS.md`, `HANDOFF.md`, `CHECKPOINT.md`, `PLAN.md`,
`ARCHITECTURE.md`, `docs/` (incl. `MLS-INTEGRATION.md`, `DESIGN-MATCH.md`, `crm-audit/CRM-AUDIT.md`), and
the global `FableMind.md`. The three properties, access, and hard architecture facts are all in
`NEXT-SESSION-PROMPT.md` — do not relearn them; verify them.

## Phase A — Full audit (SCOPE + EVIDENCE + ATTACK). Summon Opus sub-agents, one per surface.
Spawn parallel auditors (Opus 4.8) — **Website**, **CRM** (isolated clone only — never the live loop),
**AI page**, and **Loop/Infrastructure**. Each does a rigorous, adversarial review and returns a findings
report (severity-ranked, with evidence): correctness bugs, security holes, completeness vs the plan,
design/UX quality vs the reference (live realtylt.com / Brivity / mobile), performance, accessibility, SEO,
what's real vs fixture/stubbed, dead code, and **what we MISSED**. Attack each: try to break it. YOU
(Fable) VERIFY every finding against the live system yourself before accepting it — reports drift optimistic.
Consolidate into one prioritized master findings list.

## Phase B — Fix to the best version (VERIFY). 
Apply the high-value fixes across all three properties to the design-excellence + correctness bar — polish,
missing pieces, best-practices, the honest gaps. Keep `npm test` + `next build` green; deploy; re-verify on
the live URLs (and mobile). Respect all guardrails: isolated CRM clone, don't re-exhaust the MLS media
budget (≤2 listings), photos on-demand never stored, private/noindex, never commit secrets, pause for
owner-gated go-live. Loop until each surface is genuinely the best it can be — then accept convergence.

## Phase C — Final code check + break-test + full test → ship-ready.
Run a proper **high/max code review** on each repo's diff/whole (correctness + security + simplicity), an
**adversarial red-team** (try to break correctness AND security — injection, auth, secret exposure,
headers/CSP, the lead + automation + Twilio/Gmail paths, the IDX/photo proxy, rate-limit safety), and the
**full test suites + a live drive of every flow** (desktop + phone). Fix everything that's real. Outcome: a
genuinely ship-ready product suite (pending only the owner-gated go-live items), stated honestly.

## Phase D — Comprehension + PRESENTATIONS (Fable does this — invoke the `frontend-design` skill + Artifact).
Produce beautiful, premium, self-contained deliverables (design-excellence bar — distinctive, not
templated) that give the owner and any interviewer/client FULL understanding. Save the source in
`docs/presentation/` and render each as an Artifact:
1. **Architecture deep-dive** — how the whole system works end-to-end, with diagrams: the IDX website
   (on-demand data + on-demand photo proxy, why MLS Grid forces replication-for-search but on-demand
   photos, the Zillow-style map), the CRM (Supabase, Brivity parity, the Automations engine), the AI page
   (Three.js journey, mobile), the autonomous agent loop (orchestrator → sub-agents → verify → commit), and
   the integrations (Supabase, n8n, MLS Grid, Twilio, Gmail) + deployment + security. So any technical
   question can be answered from it.
2. **Capabilities / portfolio deck** — what was built and its value, framed for BOTH job applications and
   for offering services to businesses (a full real-estate tech suite: IDX marketing site + CRM +
   AI recruiter + automation, built and shipped by a small operator with AI orchestration). Polished, sells.
3. **Interview / client Q&A prep** — the likely questions an employer OR a business client would ask
   (technical: stack, MLS/IDX, the rate-limit + budget decisions, security, the agent-loop architecture;
   product: features, Brivity parity, automations; business: value, cost, what it replaces) — each with a
   strong, honest answer grounded in the ACTUAL build and decisions (why-this-not-that, the tradeoffs). So
   the owner "passes all the exams" and can speak confidently to everything.
4. **One-page summary** — the whole suite at a glance (what it is, what it does, the stack, the status).

## Phase E — Report (REPORT / CALIBRATE).
Deliver, honestly: what we BUILT (the whole suite), the ARCHITECTURE in plain terms, what we MISSED (the
real gaps), what we CAN build next (roadmap + abilities), and the exact SHIP-READINESS state + the
owner-gated go-live checklist. Commit + push everything (all repos + the presentations). Update
`CHECKPOINT.md` + `AGENT_LEARNINGS.md`. Lead with the outcome.

Begin with Phase A now. Use Fable's judgment where it matters; route the rest to Opus. Verify everything.
