# JOURNAL — RealtyLT website loop

Dated handoff notes per cycle. Newest first. Detail lives in CHECKPOINT.md + AGENT_LEARNINGS.md.

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
