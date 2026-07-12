# RealtyLT — Next-Session Orchestrator Prompt

Paste the block below into a fresh session. Set the session model to **Fable 5**; spawn the
persistent loop/worker agents on **Opus 4.8** (Agent tool `model: "opus"`).

---

You are the lead orchestrator driving the RealtyLT product suite to **launch-ready**. You run on
Fable 5; spawn your loop/worker sub-agents on **Opus 4.8** (`model: "opus"`). Work in long,
substantial cycles — each agent pushes to ~700k tokens per session, then saves state and reports;
YOU (main) verify its work with real evidence, brainstorm the highest-value next step, and
re-summon. Keep going until the products are ready to ship. Never ask permission for reversible
work — decide, record, proceed; only pause for production go-live (domain/DNS/promote) and deleting
others' data.

## The three properties
1. **Marketing website** — repo `levan-tsi/realtylt-website` (local `C:\Users\Levan\realtylt-website`).
   Next.js 15 App Router + TS + Tailwind v4. Live PRIVATE/noindex at **https://realtylt-website.vercel.app**.
   Design matched to live realtylt.com (Lato, brand navy/azure, black CTAs). Read `HANDOFF.md`,
   `CHECKPOINT.md`, `docs/MLS-INTEGRATION.md`, `docs/DESIGN-MATCH.md`, `PLAN.md`, `ARCHITECTURE.md`,
   `docs/reference/` (live-site screenshots) FIRST.
2. **CRM** — repo `levan-tsi/realtylt-crm` (app.realtylt.com). Built by a LIVE autonomous loop in
   WSL at `/root/realtylt-crm` (tmux `crmloop`/`crmwatch`, branch `agent-work`). A Brivity-parity
   fix branch **`fix/brivity-parity`** exists with a working preview. CRM audit: `docs/crm-audit/CRM-AUDIT.md`
   (in the website repo). Brivity reference: `docs/brivity-ref/BRIVITY_REFERENCE.md` (in `/root/realtylt-crm-fix`).
3. **AI recruiter page** — repo `levan-tsi/realtylt-ai-page`, branch `windows-main`, deployed to
   **https://realtylt-ai-page.vercel.app** (CLI-deploy only, NOT git-connected — updates need
   `vercel deploy --prod` from the repo). The website `/ai` proxies it.

## Access / tools
- **Vercel CLI** authed as `levan-3774` (team levans-projects-a543d940). Login gotcha: device code
  prints to stderr; needs a real console window. Deploy via PowerShell `Start-Process npx.cmd
  -ArgumentList vercel,deploy,--prod,--yes -Wait -NoNewWindow -RedirectStandardOutput o.txt
  -RedirectStandardError e.txt`.
- **Supabase MCP** — CRM/data project `wpfmhmnceflfruhssqqb` (leads, chatbot, CRM tables).
- **n8n MCP** — the live MLS Grid API key is in workflow **"RealtyLT MLS Search"** (`3s0QKDLDwhMkqqdb`);
  **Twilio SMS creds** are in **"RealtyLT Twilio SMS"** (`k6s9fbkHv2rVezYB`) — extract from the HTTP node.
- **Chrome browser MCP** — the owner is logged into **https://app.brivity.com/dashboard**; use it
  READ-ONLY to study Brivity (never click mutating controls, never modify Brivity data).
- **Gmail MCP** (owner's Gmail) is available for the email-send research/integration.
- **CRM demo login:** `demo@realtylt.com` / `RealtyLT2026!` (works on the fixed previews).

## HARD architecture facts (do NOT relearn the hard way)
- **MLS Grid is a REPLICATION API, not search** — you can only `$filter` on ListingId / StandardStatus /
  ModificationTimestamp / PropertyType / OriginatingSystemName / MlgCanView (NOT county/price/beds/city).
  So listing DATA must be a local snapshot (`data/mls-snapshot.json`, ~10MB, refreshed via
  `node scripts/export-snapshot.mjs` → commit → deploy). County/price/beds are filtered client-side.
- **Photos = ON-DEMAND, never stored** (owner's explicit rule). `/api/media/[id]/[idx]` fetches a
  listing's Media live from MLS Grid on view, streams same-origin, aggressively CDN-caches (s-maxage
  ~3000, under the ~1h signed-URL validity), falls back to a branded placeholder on error. Do NOT
  bulk-download or store photos. Do NOT reintroduce **Vercel Blob** (its free-tier limit paused the
  store — it's fully removed).
- **Media-CDN per-account budget** exhausts fast and is a TRAILING-WINDOW 429 — every probe keeps it
  warm and delays reset. Do NOT bulk-test photos; verify with 1–2 listings max, then leave it alone.
- **Classifier blocks direct shell calls to api.mlsgrid.com** with the token — all MLS access goes
  through the Vercel runtime (the deployed cron/proxy) or the n8n workflow, never local curl.
- Website is PRIVATE/noindex via `PRELAUNCH=1` env (robots + X-Robots-Tag). Keep it until go-live.
  Security hardening (CSP + headers, JSON-LD escaping, /api/lead hardening, honeypot `rlt_hp`,
  `LEAD_TEST_MODE`) must stay intact — verify 0 CSP violations after any change.
- Leads: forms → `/api/lead` → Supabase edge fn `website-lead` → CRM `leads` table. NEVER submit test
  leads to prod (use `LEAD_TEST_MODE=1` / a stub) — it pollutes real data.
- **CRM safety:** the autonomous loop OWNS `/root/realtylt-crm`. NEVER touch it, tmux, the loop, or
  its branches. All CRM code work happens in an ISOLATED clone (`/root/realtylt-crm-fix` or a fresh
  clone) on a fix branch; deploy previews only; production/merge is owner-gated.
- NEVER commit secrets (`.env*`, tokens). Small commits; push per phase; keep tests + `next build` green.

## Orchestration shape (how to split the work)
Split by PROPERTY, not by one all-in agent. Run **three specialized Opus-4.8 loop agents in PARALLEL** —
one for the Website (Phase 1), one for the AI page (Phase 1B), one for the CRM (Phase 2) — because they are
different repos/stacks and parallel = faster + deeper (an all-in agent blows its context and goes shallow).
HARD RULE: never run two agents on the SAME repo/branch/tree at once (they collide) — but across the three
DIFFERENT repos they run safely in parallel. YOU (Fable orchestrator) hold the FULL PICTURE: you own the
cross-property connections (AI page → CRM lead, website → CRM lead, shared MLS key, one brand), curate the
shared `AGENT_LEARNINGS.md`, and verify each agent's work independently. Then Phase 3 is a single combined
agent that tests the WHOLE suite end-to-end, and Phase 4 watches it.

## THE WORK — run these phases; loop each until genuinely converged, verifying between cycles

### Phase 1 — Website: test, polish, verify IDX correctness (loop, Opus 4.8, ~700k/cycle)
Bring the site as close as possible to the plan (`PLAN.md`/`ARCHITECTURE.md`) and the live-realtylt.com
design (`docs/reference/`). Drive EVERY page + flow with Playwright at 1280 AND 390 against the live
site side-by-side; fix bugs, a11y, SEO, responsiveness; push design similarity to ~95%+. **Verify the
IDX end-to-end:** that it pools LIVE data correctly and the data + photos are CORRECT — spot-check
several real listings' address/price/beds/photos against **Zillow** (and the live realtylt.com) and
record the comparison. Confirm the per-listing page pools on-demand (one dynamic `/listing/[id]`
template, opens whichever is requested, no pre-built pages, no stored pics). Once the media budget has
recovered, confirm real photos render on-view (a couple listings) — do not re-exhaust it. Keep everything
private/noindex + secure. Report evidence; main verifies on the live URL between cycles.

### Phase 1B — AI recruiter page: MOBILE-first polish + connect to CRM (Opus 4.8, ~700k/cycle)
The AI page (`C:\Users\Levan\realtylt-ai-page`, branch `windows-main`, CLI-deploy only to
realtylt-ai-page.vercel.app; the marketing `/ai` proxies it) is largely built but needs real polish —
**mobile/phone is the priority: most people will use it on their phone.** Read the ai-page repo's own docs
FIRST (`DESIGN.md`, `AGENT_BRIEF`/`REFERENCE_3D_UI.md`/`IMPROVEMENTS.md` and its render/verify harness) and
the owner's aipage-archive memories — there is a LOT of hard-won 3D work; do NOT break the camera rig or the
galaxy→brain journey.
- **Phone experience must be perfect:** every scroll step, the galaxy, the brain, the "become the light"/
  services reveal, and all touch interactions must be smooth (60fps on a real mobile GPU), notch/safe-area
  correct (viewport-fit), portrait-first, no jank, no overflow, no broken taps. Test on REAL phone viewports
  (390 + mobile emulation, touch, portrait) using Playwright + the repo's render/verify harness, and iterate.
- **Fix the brain framing (owner-reported):** when the services/neural view is shown, the brain is not fully
  visible and doesn't clearly read AS a brain — **zoom the camera out a bit so the whole brain shape is
  recognizable**, especially on phone. Verify it reads as a brain at both desktop and mobile framings.
- **Connect it to the CRM/everything:** the "Work with me" recruit CTA + the live chat/assistant should feed
  submissions into the CRM as a lead/recruit (same pipeline as the website leads — Supabase `leads` /
  the n8n flow), so AI-page interest lands in the CRM. Wire and verify it end-to-end (safe test).
- **Research-then-apply:** if you don't know how to do proper mobile WebGL/Three.js responsive polish
  (touch/orbit controls, devicePixelRatio + performance scaling, responsive camera framing, scroll-driven
  animation on mobile), RESEARCH the correct techniques first, learn them, THEN apply — do not guess.
- Deploy via CLI (`vercel deploy --prod`, it's NOT git-connected — a stray Mac harness file needs the
  existing `.vercelignore`); verify the polished version renders at realtylt-ai-page.vercel.app AND via the
  marketing `/ai` proxy under the strict CSP (0 violations). Append what you learn to `AGENT_LEARNINGS.md`.

### Phase 2 — CRM: Brivity-parity + operational LOOP (Opus 4.8, ~700k/cycle, ISOLATED)
Spawn a looping CRM agent that: uses **Chrome (read-only) to study live Brivity** and **Playwright +
the demo login to test our CRM preview**, side-by-side; **brainstorms the highest-value gaps to make it
100% accurate to Brivity and fully operational to ship**; and fixes them in the isolated clone on
`fix/brivity-parity`, deploying previews. Top known gap: an **auto-plan EXECUTION engine** (Brivity runs
a 72-step plan across 1,174 people; ours only builds plans).

**Build an "Automations" page + a working automation engine (high priority).** Add a CRM page where the
owner creates workflows/automations — a builder of **trigger → condition → action** rules (and multi-step
sequences like Brivity Auto Plans) — and an **execution engine that runs them automatically** in the
background (on the trigger, on schedule, or after a delay). Actions must include: **send SMS**,
**place/route a call** (Twilio), **send email** (Gmail/email), create/assign a task, update lead
status/stage, add to a lead pond, wait N days, branch on a condition. This subsumes the auto-plan
execution engine. Make it genuinely operational (run history/logs, enable/pause, a safe test mode), not a stub.

**RESEARCH FIRST — how to properly connect the send-integrations** (do real research, don't guess): the
correct production-grade way to wire **Twilio** (SMS + voice/calls, inbound-reply webhooks, status
callbacks, STOP/opt-out + TCPA compliance, a Messaging Service/number) and **Gmail / email** (Gmail API +
OAuth vs SMTP vs a provider like Resend — deliverability, SPF/DKIM, reply handling, unsubscribe). Evaluate
doing it **directly from the CRM** vs **routing through n8n** (n8n already holds the Twilio creds + has
Gmail nodes and is a real automation backend — using n8n as the execution backend the CRM calls into may
be the fastest correct path; the CRM's Automations UI could create/trigger n8n workflows). Pick the best
approach, document the tradeoffs, implement it end-to-end, and TEST a real send safely (sandbox/owner's own
number/email — never spam real contacts). Twilio creds: n8n "RealtyLT Twilio SMS"; Gmail: MCP / owner's
account. Owner wants iMessage/FaceTime eventually — Twilio + Gmail now.

Also flag/fix: the loop machine's stale `E2E_TEST_PASSWORD` makes its phase gates dishonest; the email
provider is currently a fixture; CMA/market comps run on MLS fixtures (use the real MLS key). Loop until the
CRM is genuinely Brivity-accurate + operational; main verifies each cycle vs Brivity.

### Phase 3 — Combined launch loop across website + AI page + CRM (Opus 4.8, until launch-ready)
Once Phases 1–1B–2 have converged, run a combined agent that works across ALL THREE properties (website,
AI page, CRM) and their connections: test that everything works end-to-end (incl. mobile), brainstorm what
else needs improving, improve, re-test — looping until the whole product suite is genuinely ready to launch. Same rules: isolated CRM clone, on-demand IDX,
private/noindex, never re-exhaust the media budget, verify with Playwright + Zillow/Brivity references,
never commit secrets.

### Phase 4 — Watch: keep it running smooth & correct (Opus 4.8, ongoing)
Once the products are built and launch-ready, DON'T stop — run an ongoing **watcher/health-monitor** that
keeps checking everything works smoothly and correctly: periodically drive the live website + AI page +
CRM with Playwright (desktop AND phone viewports), hit the key endpoints, and assert real behavior — IDX
pools live data (spot-check vs Zillow), photos load on-view, the map/search/lead-forms/calculator work, the
AI-page journey runs smooth on mobile, the CRM routes + login + automations run, Twilio/Gmail sends succeed
(safe test), 0 console/CSP errors, no regressions, no broken tiles, no stale data. On any breakage: diagnose, fix (or isolate + report if owner-gated), re-verify. Watch until the owner
says stop. This is the "make sure everything works smooth and right" guarantee after the build converges.

## Memory, self-improvement & accumulated experience (carry it forward)
- **`AGENT_LEARNINGS.md` (in the website repo) is the loop's persistent memory + playbook** — it already
  holds every hard-won gotcha, recipe, and dead end from the prior agents (MLS-is-replication-not-search,
  media-budget trailing-window, Blob-removed, the request-path-sync rate-limit bug, Vercel login,
  classifier boundaries, CRM safety, Playwright/Windows gotchas, etc.). EVERY loop/worker agent READS it
  at cycle start and APPENDS a dated bullet whenever it learns something non-obvious. Never delete facts.
- **Run a watchdog/coach meta-agent (Opus 4.8) every few cycles** (like the /ai loop's watchdog): it reads
  the loop's recent commits + reports, judges regressions / wasted tokens / spec-drift / dishonest test
  gates, and makes ONE improvement to the PLAYBOOK (`AGENT_LEARNINGS.md`) or process — never to product
  code. This is how the loop self-improves.
- **Persistent cross-session memory:** the orchestrator (Fable) also maintains `C:\Users\Levan\realtylt-claude-config\memory\`
  (`project-realtylt-website.md`, `project-realtylt-crm.md`, `mls-grid-api-constraints.md`,
  `infra-vercel-cli-login.md`, `MEMORY.md` index) — update it when project state or a durable fact
  changes, so future sessions recall it automatically.
- **Verification is a first-class habit:** each cycle proves its claims with real evidence (Playwright
  screenshots, live-endpoint probes, side-by-side vs Zillow / live realtylt.com / Brivity) — and MAIN
  re-verifies independently before accepting "done." Do the best we can, always push for better.

## Owner go-live items (do NOT do unattended — surface for the owner)
- **Website public launch:** unset `PRELAUNCH`, set `NEXT_PUBLIC_SITE_URL=https://realtylt.com`, swap the
  MLS test→production key, point the realtylt.com domain at Vercel (after Brivity is turned off). Blog
  posts import from the owner's Google Drive.
- **CRM production:** decide the real production Supabase project (THREE are referenced: `wpfmhmnceflfruhssqqb`
  = has the data; `nyoqsdpjdsrdxtireumm` = deleted; `malzosoenwkqaowmbgrl` = a third in prod env), merge
  `fix/brivity-parity` through the loop (agent-work → master; may need pausing the loop), promote, DNS
  cutover (app.realtylt.com currently SSL-mismatched on the old host, production ~129 commits behind).
- Provider keys: Twilio (from n8n — wired now), email/Resend, MLS production key.

Begin with Phase 1 now. Report as you go; do not wait.
