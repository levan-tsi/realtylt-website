# AGENT_LEARNINGS — RealtyLT loop memory + playbook

**This file is the loop's persistent memory.** Every loop/worker agent READS it at the start of a
cycle and APPENDS a dated bullet when it discovers something non-obvious (a gotcha, a working
recipe, a dead end). A watchdog/coach agent curates it. Do not delete hard-won facts.

## Operating style
Work like Fable regardless of model: think first + name assumptions, radical honesty (never call unverified
work "done"), verify independently against the live system, own mistakes plainly, be resourceful
(know-it/find-it/do-it), recommend don't just list, lead with the outcome, high bar + respect convergence,
production-safe, and LEARN + REMEMBER (append here; use the skill-creator skill for reusable techniques;
save important facts about Levan to `~/realtylt-claude-config/memory/`). Full version: the global
`FableMind.md` (auto-loaded into every session incl. headless loop cycles). Builds on Karpathy/Superpowers/
design-excellence — never replaces them or any skill.

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

## Phase-1 verification cycle (2026-07-12) — hard-won recipes + gotchas
- **SAFE local verification recipe (no MLS/media budget impact):** `npm run build` reads the COMMITTED
  snapshot → real data (`fixtureMode:false`, 5362) WITHOUT MLS keys; media has no keys locally so
  `/api/media` returns the placeholder with ZERO MLS calls. So run the heavy suites (qa-crawl, qa-a11y-scan,
  verify-calc-menu, verify-saved-flow, qa-flows2 lead tests) against a LOCAL `next start`:
  `$env:LEAD_TEST_MODE='1'; $env:CRM_LEAD_WEBHOOK=''; npx next start -p 3777` — double-safe leads, no budget hit.
  Only probe the DEPLOYED `/api/media` for real photos on 1–2 listings, ONCE.
- **`qa-search-flows.mjs` is FIXTURE-CALIBRATED → it emits FALSE FAILs against the real 5,362-listing
  snapshot.** Its price/sort assertions concatenate the adjacent beds count into the price (e.g. "$525,000"+
  "3 Bed" → parses 5250003), filter state accumulates across its sequential UI steps (so "beds 4+ = 0 cards"
  is spurious), the town lists are the old 60-row fixture towns, and its home-rail card selector is stale
  (reports 0 cards though the SSR HTML has 16 `/listing/` links). **Don't trust its FAILs on real data —
  verify filter correctness at the API layer instead:** `/api/idx/search?priceMin/priceMax/bedsMin/bathsMin/
  sqftMin/propertyType/county/q/sort=…` then assert the returned set. Done 2026-07-12: ALL filters/sort/text
  correct (price-range 1075 in-range, bedsMin=4→2332, Multi-Family→427, ulster→506, asc/desc monotonic).
- **`verify-live-mls.mjs` had a stale Round-2 assertion** ("photos are Blob URLs") that Round 6 broke when
  photos moved to the `/api/media` proxy → it false-failed all 6 counties. Fixed to assert on-demand proxy
  paths (`/^\/api\/media\//`). Now ALL PASS. Lesson: when architecture changes, sweep the verify scripts too.
- **Feed reality — zero specs are NORMAL:** OneKey multi-family / land rows often carry beds/baths/sqft = 0
  (e.g. 8 Elm St Wawarsing 0/0/0 multi-family; 2930 Gomer 5bd/4ba but LivingArea 0). The UI now DROPS any
  zero spec (`specParts` in lib/format.ts) so cards/detail/map never render "0 Bed • 0 Bath • 0 Sq. Ft.".
  The prose description may still mention beds the structured field lacks — that's the feed, not a bug.
- **Media-CDN budget cooldown observed 2026-07-12** (`X-Media-Status: unavailable`, 740-byte placeholder) —
  every listing shows the branded "Photo coming soon" SVG. The failure CONTRACT is correct (200 SVG, never a
  broken tile). Did NOT retry-probe (each probe delays reset). Real photos were verified in Round 6; they
  self-heal once the trailing window clears. For DESIGN screenshots this is fine — layout is still assessable.
- **IDX spot-check vs Zillow/Redfin (2026-07-12) all matched:** 490 Peekskill Hollow Rd (3bd/2ba/2030sqft ==
  Zillow), 2930 Gomer St ($975k, 5bd/4ba, Keller Williams == Redfin), 107 Larchdale (1ba/1440sqft == records),
  2012 Hawthorn Way (townhouse/2139sqft == external). The site pools the real OneKey feed correctly.
- **Design vs live realtylt.com:** live Brivity pages frequently fail to render in a capture (search stuck on
  "Searching…" spinner; top_areas blank) — the deployed rebuild is usually MORE complete. Residual design gap
  is Brivity's product-mockup screenshots (financing phone/laptop, selling laptops) which we intentionally do
  not clone, plus live's embedded Google-Calendar booking on /connect (we use "Call to book" CTAs). ~93–95%.

## 2026-07-12 — Orchestrator (cycle 1 cross-property): chat-on-proxy unblock + coordination
- **/ai proxy live chat needed a TWO-LAYER fix:** (1) website CSP `connect-src` had to include
  `https://n8n.srv1017745.hstgr.cloud` (commit a059648); (2) the n8n "RealtyLT Website Chatbot"
  webhook's CORS lives in TWO places — the Webhook node `options.allowedOrigins` (governs preflight)
  AND the Respond node's ACAO origin-echo expression (governs the final response) — and the workflow
  must be re-PUBLISHED for either to take effect. Verified end-to-end from the proxy origin: real AI
  reply, 0 CSP violations.
- **Chat payload shapes:** the widget POSTs `{sessionId, message}` to /webhook/realtylt-chat; the RAG
  demo POSTs `{question}` to /webhook/rag-demo. A wrong payload makes the workflow bail BEFORE the
  Respond node → empty 200 carrying the Webhook node's static headers (looks like a CORS bug, isn't).
- **STILL OPEN:** the "RAG Demo" n8n workflow (oko57sV2rGelSE86) allows only the standalone ai-page
  origin — the RAG demo is dead on the /ai proxy AND will be dead on realtylt.com at launch. It is not
  MCP-manageable until the owner enables "Available in MCP" in that workflow's settings (or edits
  Allowed Origins directly in the n8n UI).
- **One repo = one writer.** This cycle an interactive session committed to main (`git add -A`) while
  the website agent worked the same tree and swept its in-progress files into an unrelated commit.
  Reconciled via rebase, but: before starting work, check `git log -3 --format='%ci %s'` for
  minutes-old commits by someone else; if found, coordinate before touching the tree.

## 2026-07-12 — WATCHDOG cycle 1: gate honesty (a "green" suite that never RAN is a FAIL, not a pass)
- **Exit-0 ≠ verified. A gate only counts if its assertions actually EXECUTED.** Cycle 1 exposed the
  trap live: the loop machine's stale `E2E_TEST_PASSWORD` makes Playwright `globalSetup` THROW, so
  `npm run e2e` runs zero specs — yet `npm run test` (unit) stays green and masks it, so a cycle could
  report "all gates green" while e2e never ran a single case. LOOP_PROMPT's "keep npm test + next build
  green" is exactly the hole: green can mean "the suite silently didn't run."
- **Rule, every cycle:** before citing a suite as passing, confirm it EXECUTED — a non-zero, EXPECTED
  test/spec count in the output. A suite that skipped for any reason (missing/stale secret, throwing
  `globalSetup`, an empty test filter, `0 passed`) is UNVERIFIED, not passing. Never let one gate's
  green stand in for a SEPARATE gate that can no-op — name each gate's real executed count
  (unit N/N, e2e N/N, build ok). If a required gate can't run (e.g. stale secret), say so plainly and
  record it under OWNER ACTION NEEDED; do NOT report the property "verified" on the strength of the
  gates that did run.

## 2026-07-13 — PHASE 3A (combined website + /ai + connections launch-readiness)
- **`verify-saved-flow.mjs` was a FLAKY gate (the feature is fine, the SCRIPT wasn't) — hardened to 6/6
  deterministic.** Three independent races: (1) step-2 read the header saved-count once after a fixed
  300ms timer, but the header re-renders on the `rlt:saved-change` EVENT → poll with `waitForFunction`
  instead; (2) step-3 read the save note via `p[role="status"].first()`, but **SearchClient has TWO
  `role="status"` live regions** — the save note AND the "N listings found" results strip — so `.first()`
  grabbed "5362 listings found" when the note hadn't rendered yet → read the note by TEXT
  (`getByText(/to this device/i)`); (3) step-5 filled `input[name]` UNSCOPED (page also has the footer
  LeadForm) → scope to `section[aria-labelledby="alerts-heading"]`.
  **GOTCHA that cost real time: `Locator.waitForSelector()` DOES NOT EXIST** (it's a `Page`/`Frame`
  method only) — `someLocator.waitForSelector(...)` throws a TypeError that a surrounding try/catch
  silently turns into a "no success status" product-looking FAIL. Use `locator.locator(sel).waitFor()`.
  The lead forms themselves (footer + alert opt-in, same shared `LeadForm`) verify clean: submit →
  `/api/lead` 200 → success `div[role="status"]`.
- **Media-CDN budget RESET (2026-07-13):** deployed `/api/media/KEY1023749/0` and `/1` returned real
  JPEGs (582KB / 740KB, `X-Media-Status: ok`) — photos self-healed since the 07-12 cooldown exactly as
  predicted. Probed ONE listing (2 photos) then STOPPED (budget discipline).
- **/ai proxy LIVE CHAT verified end-to-end from the real UI:** sent one message through the chat widget
  on `realtylt-website.vercel.app/ai` → REAL assistant reply (chat webhook 200, **no `.demo-tag`**), 0 CSP
  violations. The chat node is `#hub button.cluster.live` (the only `.live` cluster; reveals `#chatbox`).
  Real-vs-fallback detector: a fallback reply carries `<i class="demo-tag">`, a real one does not.
- **RAG demo on the proxy degrades GRACEFULLY (expected):** the `rag-demo` webhook is CORS-blocked from
  the proxy origin (owner-gated, workflow oko57sV2rGelSE86) → the page shows the badged
  "DEMO MODE — SAMPLE REPLY" fallback (`.demo-tag` present), NOT a break. That CORS block is a console
  error but **NOT a CSP violation** — leave the n8n side alone.
- **AI-page STANDALONE origin lacks its own `x-robots-tag`/noindex + CSP** — the `/ai` proxy adds those.
  So `realtylt-ai-page.vercel.app` (the origin behind the proxy) is publicly indexable. Left as
  OWNER-GATED: baking noindex into the origin could later suppress indexing of `realtylt.com/ai` at
  launch (the proxy may forward origin headers), so it's a launch-SEO decision, not a silent fix.
- **AI-page real-GPU harness launch (reused):** `chromium.launch({ headless:false, args:['--ignore-gpu-
  blocklist','--enable-gpu-rasterization'] })`. Journey beats deep-linked via `#p=<frac>` (galaxy 0.08,
  dive 0.45, brain 0.72, hub 1.0). Both origins x desktop+390 rendered clean (13 nodes, real GPU fps,
  brain well-framed in portrait, 0 CSP/console, no h-overflow, safe-area supported).
- **Connection proofs (both paths, then cleaned):** website footer form (id 20) and /ai recruit modal
  (id 21) both landed in `public.leads` via `/api/lead` → website-lead edge fn; deleted both, verified 0
  orphans (table back to the single genuine lead id 13). Mark test rows "TEST — phase3A …" + a unique tag
  so deletion is exact. NOTE: a Postgres data-modifying CTE (`WITH del AS (DELETE … RETURNING) SELECT
  count(*) FROM leads …`) reads the PRE-delete snapshot — verify deletion with a SEPARATE follow-up query.

## 2026-07-12 — FABLE FINAL AUDIT (4-surface audit → best-version fixes → deployed+verified → presentations)
- **4-surface parallel audit** (website / CRM-isolated-clone / ai-page / loop+infra). **No CRITICALs. Secret
  hygiene CLEAN across all 3 repos** (`git log --all -p` = 0 secret hits — verified independently). Each
  finding re-verified against the live system before acceptance.
- **THE AUTOMATIONS ENGINE IS REAL** (supersedes the old "ours only builds plans" note): the CRM engine
  enrolls contacts, schedules + ticks steps on a cron, branches on conditions, **dispatches real SMS/email
  via n8n → Twilio/Gmail**, logs every run, and **defaults to Test Mode ON** (inert without `N8N_DISPATCH_*`
  env). The risk moved from "it's fake" to **compliance**: `automation_optouts` had a READER (`isOptedOut`)
  but **no writer**, and SMS had no STOP footer. FIXED on `fix/brivity-parity` (4daebe3): `withOptOutNotice`
  (sms-only "Reply STOP", no double-stamp), `recordOptOut` writer + `markOptedOut` server action +
  OptOutButton UI, canonical `optoutAddress` shared by writer AND gate so a recorded opt-out is honored.
  0005_demo_seed made non-clobbering (9384597). 476 unit tests green. **OWNER-GATED:** inbound Twilio STOP
  webhook (n8n) + A2P 10DLC + merge/promote. NOTE the "stale-password → dishonest green" worry is real for
  the loop's e2e globalSetup, but the CRM sign-in specs FAIL RED on a bad password (they don't false-pass).
- **Website has NO auto-refresh cron** — `vercel.json` is bare `{}`; the "daily cron 6:00 UTC" claim in
  HANDOFF was stale (corrected, bb6e6e5). Refresh is MANUAL (export→commit→deploy); a durable store is an
  owner decision (Blob removed, Vercel FS read-only — a cron alone can't persist a snapshot).
- **Deployed `website-lead` edge fn has NO rate limit + blanket `*.vercel.app` CORS** (read via Supabase
  `get_edge_function`; honeypot+field-caps only). Added a best-effort per-IP sliding-window limiter IN THE
  ROUTE (`lib/leads` `leadRateLimited`, 8/60s → 429; 735beaf). Verified live: 11 rapid **honeypot** POSTs →
  200×8, 429×3, **0 leads created**. Edge-fn hardening (shared `x-rlt-secret` + tighter CORS) + Vercel WAF =
  owner-gated.
- **`/api/idx/pins` ships the whole set on the default map view** (~1.08MB). Trimmed via 4-dp coord rounding
  (91aa3cd → 972KB, −10%). All 10 pin fields ARE consumed by the MapView popup — can't drop fields, only
  round coords (pins are approximate zip-centroids anyway).
- **Featured rail was silently "newest"** because OneKey abbreviates the owner's office to **"United RE
  Hudson Valley Edge"** (6 listings, all in the owner's 6-county footprint). Regex `/united re(al estate)?\b/i`
  matches ONLY it (not "United Realty NY Inc" / "KW Hudson Valley United"); flipped 6 `isFeatured` flags in
  the snapshot (7c70bcd). Verified live: the home rail now headlines the 6 owner listings. (Owner: confirm
  that office is yours — snapshot lacks agent-name to prove it's Levan personally vs brokerage-mates.)
- **AI page (windows-main, CLI-deploy):** `import brainModel.json with { type: 'json' }` is a HARD
  SyntaxError below Chrome 123 / Safari 17.2 → the loader spins FOREVER on old phones (owner's #1 audience).
  Added an ADDITIVE classic-script **boot watchdog** in index.html (`#bootfallback` overlay; reveals if
  `#loader` persists 12s OR on `webglcontextlost`; self-heals on a late boot; a "Work with me" mailto + a
  reload). Verified live BOTH paths (healthy=dormant, main.js-blocked→fallback+CTA). **16px lead inputs
  gotcha:** the `.rc-field input` base rule sits AFTER the `@media` override with EQUAL specificity, so the
  base wins on mobile — use `#rc-form input` (id specificity) to beat it; `#leadgate input` wins by order.
  Also `overscroll-behavior:contain` on `#chatlog`, excluded `web/src/*.best.js` from deploy, bumped the
  `?v=` stamp + versioned `styles.css?v=`. Deployed + verified 0 console errors desktop+390, camera rig
  untouched.
- **Standalone ai-page origin** (`realtylt-ai-page.vercel.app`) still serves no noindex/CSP/x-frame-options
  (the `/ai` proxy adds them) → publicly indexable pre-launch. Left OWNER-GATED (adding noindex to the origin
  could suppress realtylt.com/ai at launch if the proxy forwards it — can't safely test while PRELAUNCH=1).
- **Fable credits exhausted mid-session** → per owner, subagents route to **Opus 4.8** (the 4 auditors ran on
  Fable before the wall; the Phase-C review + later agents on Opus). Main session stayed on Fable.
- **Deliverables:** `docs/presentation/{architecture,portfolio,qa-prep,one-pager}.html` (4 premium
  self-contained Artifacts, shared brand system, theme-aware) + `docs/OWNER-GO-LIVE.md` (consolidated
  owner-gated checklist). Committed e429d94.

## 2026-07-13 — PHASE 4 WATCH cycle 1 (website): no product regressions; TWO watch-gate defects fixed
- **A browser sweep of the DEPLOYED site is a BULK PHOTO TEST in disguise — this is the easiest way to
  blow the media budget by accident.** Loading `/`, `/search` and `/listing/*` in a real browser fires one
  `/api/media/{id}/{idx}` request PER CARD PHOTO: a single 8-route × 2-viewport pass = **125 media
  requests**. `scripts/final-probe.mjs` (hardcoded to the deployed base) has exactly this hazard — do NOT
  point a browser at prod without stubbing media. New `scripts/watch-live-sweep.mjs` is the safe watch tool:
  it `page.route('**/api/media/**')`-fulfills a 1×1 PNG, so a full sweep costs **ZERO** MLS media calls,
  and it checks 8 routes × {1280, 390} for 200 / console errors / CSP violations / horizontal overflow.
  Verify real photos SEPARATELY on ≤2 listings via plain `fetch` (no browser).
- **`net::ERR_ABORTED` on OSM tiles is NOT a failure — it is Leaflet cancelling a superseded viewport.**
  A `requestfailed`-counting probe false-FAILs `/search` forever. Proven: 9 tiles requested → 9× HTTP 200 →
  9 `leaflet-tile-loaded`, map visible; the 12 aborted tiles were for the pre-fitBounds view and **0 of 12**
  were ever needed. Rule: ignore `ERR_ABORTED` in request-failure probes, and assert the map with a POSITIVE
  signal instead (`img.leaflet-tile-loaded` > 0), which is what actually carries meaning.
- **A gate that can only go red with the passage of time is a DISHONEST gate.** `verify-live-mls.mjs`
  asserted snapshot freshness `< 24h`, but there is **no refresh cron** (`vercel.json` is bare) — refresh is
  manual — so the gate turned red every single day with zero regression behind it, training the watcher to
  ignore red. Now TIERED: `<24h` PASS, `24–72h` **WARN** (aging by design, no action), `>72h` FAIL (refresh).
  72h matches the standing policy "materially stale (>~3 days) → refresh". Generalize: assert what the system
  actually GUARANTEES, not what you wish it did.
- **`export-snapshot.mjs` does NOT need the MLS key locally** — it authenticates with `CRON_SECRET` (already
  in `.env.local`) and pulls through the DEPLOYED Vercel runtime, so it respects the "never call
  api.mlsgrid.com directly" boundary. Refresh IS runnable from this machine when genuinely stale.
- **LEAD SAFETY — clearing `CRM_LEAD_WEBHOOK` in the shell is NOT protection.** `.env.local` CONTAINS a real
  `CRM_LEAD_WEBHOOK`, and `$env:VAR=''` in PowerShell *removes* the var → Next then loads the real webhook
  from `.env.local` → a "safe" local test would hit the prod CRM. The ONLY true guard is **`LEAD_TEST_MODE=1`**
  (`lib/leads/index.ts`: `if (!webhook || testMode)` → stub). Run double-safe: `LEAD_TEST_MODE=1` **plus**
  `CRM_LEAD_WEBHOOK=http://127.0.0.1:9/blackhole` (non-empty, dead port). **Proof-of-safety before submitting
  any valid lead: the response must be `{"ok":true,"stub":true}`** — `stub:true` is emitted only on the
  no-webhook path, so it is positive evidence the CRM was never called.
- **The honeypot field is `rlt_hp`, not `company`/`website`** (deliberately non-semantic: a `website` field
  gets filled by Chrome autofill and would silently drop REAL leads). A honeypot probe with the wrong field
  name is just a normal lead submission — it returns `stub:true` instead of a bare `{"ok":true}`. Tell them
  apart by that: honeypot = `{"ok":true}` with **no** `stub` key (dropped before `submitLead`).
- **Watch-cycle evidence (all re-verified live this cycle):** 20/20 deployed routes 200 + 404 correct;
  `x-robots-tag: noindex, nofollow` + CSP + HSTS + `X-Frame-Options: DENY` intact on /, /search, /ai, /listing,
  /api; IDX ALL PASS real OneKey data (`fixtureMode:false`, 6 counties = **5,362**); sweep 16/16 PASS (0 console
  errors, 0 CSP violations, 0 h-overflow at 1280+390); photos real JPEGs (`X-Media-Status: ok`, 2 probes only);
  qa-crawl ALL PASS (137 links), a11y CLEAN, calc 4/4, saved-flow 6/6; leads local stub 200/`stub:true`,
  honeypot silent-200, invalid-400, prod reject-paths 405/415/413/400; unit **103/103 executed**, build green.
- **Zillow/Redfin spot-check (2 listings, both MATCH):** *2930 Gomer St, Yorktown* — ours $975,000 / 5bd / 4ba /
  Multi-Family / Keller Williams Realty Partner **==** Redfin ($975,000, 5bd, 4ba, "legal 3 family", Keller
  Williams Realty Partner). Redfin also shows 3,428 sqft where our `LivingArea` is **0** — that is the known
  OneKey multi-family zero-spec quirk (Redfin's sqft comes from public records, not the MLS field), and the UI
  correctly DROPS the zero rather than printing "0 Sq. Ft." (`zeroSpec=false` on the live listing page).
  *490 Peekskill Hollow Rd, Putnam Valley* — ours $789,000 / 3bd / 2ba / 2,030 sqft **==** Redfin ($789,000,
  for sale, 3bd/2ba/2,030 sqft). **Gotcha: the WebSearch SUMMARY for this address claimed "not currently for
  sale, est. $582,940" — the live Redfin page says $789,000 FOR SALE.** Search-result summaries serve stale
  cached facts; always fetch the actual page before believing a "your data is wrong" signal. (Zillow 403s
  bots — use Redfin/OneKey/homes.com as the second source.)

## 2026-07-13 — PHASE 4 WATCH (ai-page): green pass, no regression, nothing deployed
- **A "known advisory FAIL" with no recorded MAGNITUDE is a blind spot.** `agent/verify.mjs` beats-vs-goldens
  has been FAIL for weeks (goldens predate the redesign — re-baseline is OWNER-GATED), but nobody ever wrote
  DOWN the drift %, so a genuine visual regression could hide inside a gate that is "always red". Recording
  the numbers now as the comparison baseline for the next watcher — **galaxy within 7.75%, dive over 11.18%,
  brain over 15.47%, hub over 12.81%** (all `drew=true`; nodes 13/13 PASS, ring 7/7 PASS, js-errors none).
  Rule: when a gate is knowingly red, log its NUMBER every cycle — "still failing" is not evidence, "failing
  by the same amount" is.
- **`verify.mjs` takes `VERIFY_URL`** → point the repo's own gate straight at the LIVE deploy
  (`VERIFY_URL=https://realtylt-ai-page.vercel.app/ node agent/verify.mjs`). No local server, so **no port to
  free** — sidesteps the whole 8756-in-use gotcha for a watch pass.
- **You cannot measure "is the brain clipped?" with a luminance-threshold bbox on this page** — the backdrop
  is a STARFIELD, so the stars themselves are "lit" and the bbox runs to the frame edge (my detector reported
  `CLIPPED:true` on beats that are, on inspection, beautifully framed with generous margins). Brightness can't
  separate subject from background here. Judge framing with EYES on the screenshot; a density histogram only
  works on the HUB beat (where the node chrome is the dense mass). Framing verdict this cycle: **holds** —
  brain fully inside frame, reads as a brain, at desktop 1440 AND 390 portrait, on BOTH origins.
- **Provable lead safety for a watch pass:** `context.route('**/api/lead')` + `('**/functions/v1/website-lead')`
  → `fulfill()` locally, and keep a **stub HIT COUNTER**. The POST is answered inside the browser and never
  touches the network, and the counter (`leadStubHits: 1` per run) is positive PROOF the submit path executed
  AND that nothing reached the CRM. Better evidence than "I chose not to submit".
- **Playwright `devices['iPhone 14 Pro']` is a 393x659 CSS viewport** (screenshots come out 1179x1980 @DSF3),
  i.e. noticeably SHORTER than a real iPhone's ~844pt. For a framing check that's conservative in our favour —
  if the brain fits at 659pt tall it fits on the real device — but don't quote it as "390x844".
- **Real-GPU fps, live, both origins (headed Chromium, `--ignore-gpu-blocklist`):** desktop hub 70–89 / brain
  94–97; emulated-mobile hub+brain 144–145. The mobile numbers run on the desktop GPU and are NOT a real-device
  reading — the owner's real-phone pass is still the only true mobile perf gate.
- **The `rag-demo` CORS block stays EXPECTED and owner-gated:** on the proxy the RAG tab degrades to the badged
  "DEMO MODE — SAMPLE REPLY" (`.demo-tag` present) = PASS, not a bug. It logs a console CORS error but **zero CSP
  violations**. Live chat itself returned a REAL assistant reply (webhook 200, no `.demo-tag`) through the proxy.

## 2026-07-13 — Phase-4 watch cycle 1 (orchestrator): the cross-producer trigger trap

- **A mirroring DB trigger must dedup across PRODUCERS, not just against itself.** Migration 0013 added an
  AFTER INSERT trigger on `public.leads` that mirrors each lead into `public.contacts`. But the live n8n
  workflow **"RealtyLT Capture Lead"** (`ayoG2IadpWFgfFmH`, the chatbot's `capture_lead` tool) was ALREADY
  inserting contacts itself (`Save to leads -> Save to contacts`). Result: from 2026-07-13 every chatbot lead
  would have created **TWO contacts for the same person**. 0013's `[leadid:N]` guard could never catch it — it
  only dedups the trigger against ITSELF, and the trigger fires **BEFORE** n8n's contact row exists, so
  looking backward for a duplicate finds nothing. **Fixed in 0014** (trigger = the single producer; dedup
  across producers on normalized phone/email; repeat leads ATTACH to the existing person) **+ removed the
  redundant n8n node.** Both halves are required and must stay in sync.
- **THE GENERAL LESSON: before adding a feeder/mirror/sync into a table, enumerate every EXISTING writer of
  that table** (n8n workflows, edge functions, app code, other triggers) — do not assume the table has one
  producer just because your code path has one. Grep the automations, not just the repo. A second producer
  turns "idempotent" into "duplicated", and an AFTER-INSERT trigger is blind to rows written *after* it runs.
- **This class of bug is INVISIBLE to tests and to traffic.** It shipped clean, all gates green, and nothing
  broke — because no chatbot lead happened to arrive in the window. It was only found by *reading the live
  data* (a contact existed whose `created_at` was 26ms after a lead, with no `[leadid:]` marker → so something
  else wrote it) and then reading the live n8n workflow. **Watch passes must inspect real production DATA and
  the live automations, not just probe endpoints and re-run the suite.**
- **Verify destructive-ish DB behavior with `begin; ... rollback;` through the Supabase MCP.** A single
  `execute_sql` call accepts multiple statements, so you can insert a probe lead, assert exactly how many
  contacts the trigger created, and roll it all back — real proof against the live schema, zero rows persisted.
  (Confirmed leads=1/contacts=8 unchanged before and after.) Far better than reasoning about the SQL.
- **n8n edit hygiene:** `update_workflow` writes a DRAFT — you must call `publish_workflow` for production to
  use it, then RE-READ `get_workflow_details` and check **`activeVersion`** (not the top-level `nodes`) to
  confirm what production actually runs. `setWorkflowMetadata.description` is capped at **255 chars**.

## 2026-07-13 — CLIENT ACCOUNTS build (website consumer portal ↔ CRM) — hard-won infra gotchas
- **Website client auth = Supabase Auth on the SAME project as the CRM** (`wpfmhmnceflfruhssqqb`), so a
  client's login IS the identity the CRM knows. Tell clients from staff via
  `raw_user_meta_data->>'account_type'`: signup passes `account_type:'portal'` → a trigger creates a
  `portal_clients` row + links/creates the CRM contact; a guard in `handle_new_user()` early-returns for
  portals so clients never pollute the CRM `public.users` staff table. Contract: `docs/CLIENT-ACCOUNTS.md`.
- **Supabase env is RUNTIME-ONLY on Vercel, NOT available at BUILD.** A Server Component that reads
  `process.env.SUPABASE_URL` to bake config into a STATIC page renders `null` on the deploy (works locally
  where `.env.local` is present at build). Fix: read the anon config via a **`force-dynamic` API route**
  (`/api/auth/config`) that the client fetches at runtime. (The blog reads the same vars at request-time,
  which is why IT works and the build-time bake didn't.)
- **…and `SUPABASE_URL`/`SUPABASE_ANON_KEY` are NOT set in the Vercel project at all** (only in local
  `.env.local`) — so the blog has been silently serving static-only on prod (its "return [] on failure"
  policy hides it), and client accounts can't work until they're added. **Adding prod env vars is
  classifier-gated** (production secret-store write) → OWNER action: `vercel env add SUPABASE_URL production`
  + `SUPABASE_ANON_KEY` (both non-secret) → redeploy. Design the feature to **degrade gracefully** when the
  config is absent (enabled:false → "accounts unavailable", device-local saves still work) so the deploy is
  safe pre-enablement.
- **The project has SIGNUPS DISABLED** → GoTrue returns `"Signups not allowed for this instance"` on
  `signUp`. Owner toggles Auth → Providers → Email "Allow new users to sign up" + the redirect-URL allowlist.
- **GoTrue 500 "Database error querying schema" on password login for a SQL-created `auth.users`** = NULL
  token columns. GoTrue scans `confirmation_token / recovery_token / email_change / email_change_token_new`
  (etc.) into non-nullable Go strings; a manual INSERT leaves them NULL → scan error. Fix: set them all to
  `''`. Also insert a matching `auth.identities` row (provider 'email', `identity_data.sub = user id`).
  Verify creds at the token endpoint (`POST /auth/v1/token?grant_type=password`) BEFORE driving the browser.
- **`@supabase/ssr` 0.5.2 bundles a supabase-js with a different generic arity than the top-level package**
  → `createBrowserClient<Database>()` doesn't type `.from()` (rows come back `never`). Fix: cast
  `as unknown as SupabaseClient<Database>` and define a minimal `Database` type for just the `portal_*`
  tables. And **`cookies.setAll(cookiesToSet)` needs an EXPLICIT param type** — a fresh Vercel install
  resolved it to `any` under `noImplicitAny` and FAILED THE BUILD even though local `next build` + `tsc`
  were green.
- **Local `next build` green ≠ Vercel build green.** A fresh `npm install` on Vercel resolved contextual
  types differently → build ERROR. Always confirm the deployment reached **READY** (`list_deployments`
  state / build logs), not just local green — the live `/route` still 404'd because the build errored.
- **Windows: rebuilding while a `next start` server holds `.next` corrupts it** (`ENOENT pages-manifest` /
  "Could not find a production build") → kill the server (PowerShell `Get-NetTCPConnection -LocalPort … |
  Stop-Process`) BEFORE `npm run build`, or `rm -rf .next` and rebuild clean.
- **Cleanup for a SQL-created portal test user:** deleting `auth.users` cascades `portal_clients` →
  favorites/searches/activity + `auth.identities`, but the linked **contact** (source `Website Account`) is
  `ON DELETE SET NULL`, NOT cascaded → delete it by email too. Verify zero residue (contacts back to 8,
  leads 1).
- **E2E budget guard:** driving a browser over the deploy fires one `/api/media` per card photo — stub
  `**/api/media/**` with a 1×1 PNG (a full sweep = 125 requests → **0** real MLS calls).
