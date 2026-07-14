# JOURNAL — RealtyLT website loop

Dated handoff notes per cycle. Newest first. Detail lives in CHECKPOINT.md + AGENT_LEARNINGS.md.

## 2026-07-13 (cycle 2) — CLIENT-FACING CMA + MARKET REPORTS (owner §5b) built + verified + deploy READY

Turned the `/portal/reports` placeholder into a real feature. A logged-in client generates a
home-value CMA (from comparable ACTIVE listings) or a county/town market report, recalculates the
CMA live (comp toggles + condition slider, persisted), and raises their hand / messages the agent
(→ `/api/lead` → CRM lead + notification, + `raise_hand` activity).

- **DB:** `portal_reports` table (migration `portal_reports`, RLS client-scoped, advisors clean).
  It's the SINGLE client surface: `source='client'` self-serve rows + `source='agent'` rows the CRM
  mirrors in. Discovered the CRM's `cma_reports` public-read policy is **anon-only**, so a logged-in
  portal client can't read it → the mirror contract (CRM service role) is the coordination item.
- **Compute:** `lib/reports/{cma,market}.ts` (pure, 15 tests) + `/api/reports/{comps,market}` from the
  committed snapshot — no MLS/photo calls. Market shows a trimmed p10–p90 "typical range" (raw min/max
  was $22K–$65M); dropped a "new this month" metric (OneKey DaysOnMarket resets → not trustworthy).
- **UI:** `ReportGenerator` / `ReportDetail` / `TalkToAgent` + list & `[id]` pages, on-brand.
- **Verified:** `scripts/e2e-reports.mjs` 17/17 PASS (0 console/CSP, noindex intact, 1280+390 shots);
  live recalc $930K→$1.042M at +12%; 160/160 unit tests, build green, `tsc` clean. Test user
  SQL-created then DELETED — zero residue (leads unchanged at 1, contacts back to 8). **Vercel deploy
  of the UI commit `0e686cf` = READY.** Commits `77fab2a` · `0e686cf` · `44f9857`.

Also this cycle: **delete-own-report** action (E2E now 18/18); **verified the `source='agent'`
render path** with a mock mirrored CMA (badge + note + estimate from stored comps, `docs/accounts/
reports-agent-*.png`); **live regression sweep of the deploy = ALL PASS** (0 console/CSP/overflow,
IDX 5,362 intact, 0 media calls); and a drive-by **blog date bugfix** (`lib/blog/db.ts` — `new Date()`
choked on Postgres µs + `+00` → fell back to *today*, mis-dating posts; now uses the `YYYY-MM-DD`
prefix). 161/161 unit tests green. Commits `77fab2a` `0e686cf` `44f9857` `eb3815b` `2727271`
`827ad24` `9951b15`.

**CRM-loop coordination (surfaced, not done here):** mirror published `cma_reports`/market reports into
`portal_reports` via service role (client_id via `portal_clients.contact_id`) — full spec in
`docs/CLIENT-ACCOUNTS.md`. Client self-serve reports need no CRM dependency and work today.

**Next:** design polish + IDX data-display verification on the rest of the portal/site (tasks 2/3),
where real work remains; owner-gated pieces unchanged (Vercel env + signups).

## 2026-07-13 — CLIENT ACCOUNTS feature built (consumer portal ↔ CRM)

Built the owner's big new CLIENT ACCOUNTS feature end-to-end and verified it working against
the real Supabase; deployed with the account layer gracefully dormant pending a 2-var owner step.

- **DB:** `portal_clients / portal_favorites / portal_saved_searches / portal_activity` (RLS,
  linked to CRM contacts via a signup trigger; staff-table guard). Migrations applied to
  `wpfmhmnceflfruhssqqb`. Advisor clean.
- **Website:** Supabase Auth (`@supabase/ssr`, runtime config via `/api/auth/config`), sign-in/
  register modal, header account menu, account-aware favorites + saved searches (device→account
  migration on login), activity tracking (view/save/save-search), and the `/portal` hub
  (overview + activity timeline, collections, searches w/ alert toggles, reports placeholder,
  profile). CSP += `*.supabase.co`; `/portal` noindex.
- **Verified:** 12/12 Playwright E2E (local, real Supabase, test users cleaned up — zero
  residue); DB persistence + CRM-contact linkage + RLS all confirmed; `tsc` clean, 146 tests,
  build green; **live sweep ALL PASS** (no regression, 0 real media calls).
- Commits: `91863cd` (foundation) · `02b1d8f` (portal + activity + E2E) · `e59e278` (Vercel
  build type-fix) · `699f4fc` (runtime config) + docs.

**Blocked on owner (feature dormant on prod until done):** (1) add `SUPABASE_URL` +
`SUPABASE_ANON_KEY` to Vercel Production (classifier-gated; also fixes the blog's prod DB read);
(2) enable Supabase signups + redirect allowlist. See CHECKPOINT "CLIENT ACCOUNTS" + docs/CLIENT-ACCOUNTS.md.

**Next session:** once the owner enables the 2 env vars, re-run the live E2E (`node
scripts/e2e-accounts.mjs login` against the deploy with a fresh confirmed test user) to confirm
the deployed auth works, then design the CRM-side per-contact activity view (CRM loop) using the
`portal_clients.contact_id` join. Otherwise continue data-display / design polish where real work
remains.
