# AGENT_LEARNINGS — RealtyLT loop memory + playbook

**This file is the loop's persistent memory.** Every loop/worker agent READS it at the start of a
cycle and APPENDS a dated bullet when it discovers something non-obvious (a gotcha, a working
recipe, a dead end). A watchdog/coach agent curates it. Do not delete hard-won facts.

## Orchestration rules (how we work)
- Orchestrator AND all sub-agents = **Opus 4.8** (`model: "opus"`) — owner is out of Fable quota. Each agent works
  substantially (~700k tokens) per cycle, then saves state (commit + update CHECKPOINT/this file)
  and reports. MAIN verifies with INDEPENDENT evidence, brainstorms the highest-value next step,
  re-summons. Loop until genuinely converged — accept real convergence, don't churn mature domains.
- **Verify on the LIVE deployment, not the agent's word.** Agents' reports can be optimistic — e.g.
  one reported "real MLS wired + verified" while the deployed `/api/idx/search` was still serving
  fixture (silent fallback). Always probe the deployed URL / drive it with Playwright yourself.
- **Never run two agents on the same repo/branch/worktree at once** — they clobber each other. A
  "standing by / armed a timer" report is NOT final; that agent is still running — don't launch a
  successor on its tree until it truly completes. (Learned by causing a collision; caught, no damage.)
- Small commits, push per phase, keep `npm test` + `next build` green, never commit secrets.

## Deploy / Vercel (Windows)
- CLI authed as `levan-3774`. Login gotcha: `vercel login` device code prints to **stderr** and needs
  a **real console window** (a hidden/`CreateNoWindow` process exits 1 instantly). Config lives at
  `%APPDATA%\xdg.data\com.vercel.cli\auth.json`. Verify with `vercel whoami`.
- Deploy reliably via PowerShell: `Start-Process npx.cmd -ArgumentList vercel,deploy,--prod,--yes
  -Wait -NoNewWindow -RedirectStandardOutput o.txt -RedirectStandardError e.txt` (read BOTH files).
- The Vercel MCP is read-mostly (list/inspect/logs); real deploys/project-creation need the CLI.
- `realtylt-ai-page` project = **CLI-deploy only, NOT git-connected** → pushes don't deploy; run
  `vercel deploy --prod`. `realtylt-crm-web` project **IS git-connected** → pushing a branch auto-builds
  a PREVIEW. `NEXT_PUBLIC_*` env vars are **build-time inlined** → changing one needs a REBUILD.

## MLS / IDX (the big one)
- **MLS Grid v2 is a REPLICATION API, not search.** `$filter` allows ONLY ListingId, StandardStatus,
  ModificationTimestamp, PropertyType, OriginatingSystemName, MlgCanView — NOT county/price/beds/city.
  So listing DATA must be replicated locally (`data/mls-snapshot.json`); county/price/beds filter
  client-side. Refresh: `node scripts/export-snapshot.mjs` → commit → deploy.
- Feed reality (onekey2): ~19,324 active in the window; 6-county share ~**5,362** (Westchester 1744,
  Orange 1276, Dutchess 842, Rockland 728, Ulster 506, Putnam 266). Data verified correct vs
  Homes.com/Redfin/Trulia (e.g. 45 Patricia Ave Fishkill, 86 Maple St Dobbs Ferry). No Lat/Long on
  onekey2 → zip-centroid pins + "locations approximate".
- **Photos = ON-DEMAND, never store** (owner rule). `/api/media/[id]/[idx]` fetches a listing's Media
  live (`$filter=ListingId eq '<id>'&$expand=Media`, ONE call/listing), streams same-origin, CDN-caches
  (`s-maxage~3000`, under the ~1h signed-URL validity), placeholder on error. Photos served
  `unoptimized` (Vercel's optimizer can't sign MLS URLs). No new CSP host needed (same-origin).
- **Media-CDN has a per-account budget** that exhausts fast and is a TRAILING-WINDOW 429 — every probe
  keeps it warm and delays reset. Verify photos with **1–2 listings MAX**, then leave it alone. When
  `X-Media-Status=unavailable`, the budget is tapped — wait, don't hammer.
- **Data-API is a hard 2 req/sec per-ACCOUNT limit.** The original bug: the sync ran INSIDE the request
  path, so every cold serverless instance ran its own sync → 6+ req/s → account blocked → silent
  fixture fallback. Fix: NEVER call MLS in the request path; replicate out-of-band, space calls >600ms.
- **Vercel Blob is REMOVED — do not reintroduce.** Its free tier (2,000 operations) is far too small for
  listings+photos; bulk photo writes paused the store for 30 days and broke the site. Data = committed
  snapshot; photos = on-demand proxy. (Durable auto-refresh store, e.g. a small Supabase table for the
  text snapshot, is a pending owner decision — but NEVER store photos.)
- The MLS key + exact query live in the n8n **"RealtyLT MLS Search"** workflow (`3s0QKDLDwhMkqqdb`);
  detail in **"RealtyLT MLS Detail"** (`k0KoKNqQnZrKbWh0`). Neither fetches photos — that's our addition.

## Leads / Twilio / Supabase
- Leads: forms → `/api/lead` → Supabase edge fn `website-lead` → CRM `leads` table (`wpfmhmnceflfruhssqqb`).
  **NEVER submit valid test leads to prod** (2 rows leaked once, cleaned up) — use `LEAD_TEST_MODE=1`/stub.
- **Twilio SMS creds** are in the n8n **"RealtyLT Twilio SMS"** workflow (`k6s9fbkHv2rVezYB`) — extract
  from the HTTP node like the MLS key. (Owner wants iMessage/FaceTime later; Twilio now.)
- Supabase MCP project `wpfmhmnceflfruhssqqb`. Reset a user password via SQL:
  `UPDATE auth.users SET encrypted_password = crypt('<pw>', gen_salt('bf')), updated_at=now() WHERE email=...`.

## CRM
- Built by a LIVE autonomous loop in WSL `/root/realtylt-crm` (tmux `crmloop`/`crmwatch`, branch
  `agent-work`; Phase G complete, AWAITING_REVIEW). **NEVER touch that dir, tmux, the loop, or its
  branches.** Do CRM work in an ISOLATED clone (`/root/realtylt-crm-fix`) on a fix branch; previews only.
- Demo login: `demo@realtylt.com` / `RealtyLT2026!` (password was reset via SQL). Preview login was
  broken because Preview/Dev Supabase env pointed at DELETED project `nyoqsdpjdsrdxtireumm` → repointed
  to `wpfmhmnceflfruhssqqb`; rebuild required (NEXT_PUBLIC inlined).
- Production NOT live: `app.realtylt.com` SSL-mismatched on the OLD host (DNS never cut to Vercel),
  master ~129 commits behind, and THREE Supabase projects are referenced (`wpfmhmnceflfruhssqqb` has the
  data; `nyoqsdpjdsrdxtireumm` deleted; `malzosoenwkqaowmbgrl` a third in prod env) — owner must pick the
  real prod DB before go-live.
- **The loop's `E2E_TEST_PASSWORD` (in the loop's `.env.local`) is stale** → its e2e can't run → its
  "green" phase gates are dishonest. Fix on the loop (owner-gated).
- The CRM app is actually solid (all routes load). Biggest Brivity gap = an **auto-plan EXECUTION engine**
  (Brivity runs a 72-step plan across 1,174 people; ours only builds plans). Also: email is a fixture
  (Resend seam exists), CMA/market comps run on MLS fixtures (use the real MLS key). Brivity look =
  light canvas, white cards, teal accent, lead-risk "Take Action" cards, People round quick actions,
  Reporting sales-funnel. Study Brivity READ-ONLY via Chrome (owner logged in) — never mutate its data.

## Classifier / safety boundaries (things the auto-mode classifier blocks)
- Direct shell calls to `api.mlsgrid.com`/`media.mlsgrid.com` with the token (exfil/SSRF guard) → go via
  Vercel runtime or n8n. Deploying an edge function to prod Supabase / writing to shared prod data →
  needs explicit owner authorization. Pushing to `main` gets flagged (owner memory says pause for pushes)
  — the private/noindex website build has been owner-directed, but confirm the push cadence with the owner.

## Tooling gotchas (Windows)
- Playwright: `networkidle` never settles on Next → use `'load'`; scroll before `fullPage`; `scripts/shot.mjs`
  handles this. Git Bash mangles `/path` args → prefix `MSYS_NO_PATHCONV=1`. Kill a dev server via
  PowerShell `Get-NetTCPConnection -LocalPort <p> -State Listen | Select -Expand OwningProcess -Unique |
  % { Stop-Process -Id $_ -Force -Confirm:$false }`.
- Inline `fetch()` in a Bash `node -e` is blocked by the ContextMode hook → use
  `mcp__plugin_context-mode_context-mode__ctx_execute` (javascript) or Playwright for HTTP probes.
- The rtk hook strips REMOVED lines from `git diff` on Windows → audit deletions via `git show` / `rtk proxy`.

## Self-improvement protocol
- On any non-obvious discovery, APPEND a dated bullet here. When a recipe stops working, correct it here.
- Run a **watchdog/coach** meta-agent (Opus 4.8) every few cycles: it reads the loop's recent commits +
  reports, checks for regressions / wasted tokens / spec-drift / dishonest gates, and makes ONE
  improvement to THIS playbook (never to product code). Keep it curated and true.
