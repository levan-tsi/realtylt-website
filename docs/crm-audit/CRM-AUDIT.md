# RealtyLT CRM — Brivity-Parity & Ship-Readiness Audit

**Date:** 2026-07-11 · **Auditor:** read-only audit round (no code changes)
**Code audited:** isolated clone `/root/realtylt-crm-review` (WSL), branch `agent-work` @ `a7de43a` (merge of `page/final-qa-and-hardening`) — 129 commits ahead of `master`
**Live systems checked (read-only):** Supabase project `wpfmhmnceflfruhssqqb`, Vercel project `realtylt-crm-web`, deployed preview + production URLs, `app.realtylt.com` DNS
**Safety:** the running loop (`/root/realtylt-crm`, tmux crmloop/crmwatch/crmaudit) was **not touched** — no edits, no commits, no builds, no tmux/process interaction. Chrome was not driven; Brivity was not logged into.

---

## 1. Executive summary

The codebase is in far better shape than "5 placeholder sidebar items" suggests: the loop has completed its entire Brivity build queue (F1–F9 foundation, P1–P26 pages, D1/D3 deploy prep) plus later phases through **Phase G (chatbot integration + final QA), now AWAITING_REVIEW at cycle 140**. The app is a real, polished, dark-theme Brivity-shaped CRM wired to live Supabase data, with 430 passing unit tests and 72 passing e2e tests at the gated tip.

**The product is not reachable by anyone today.** All three deployment legs are broken, and none of them can be fixed by the loop (it has no Vercel/DNS credentials):

1. **Preview (current code) cannot log in** — Vercel env `NEXT_PUBLIC_SUPABASE_URL` points at a **dead Supabase project** (`nyoqsdpjdsrdxtireumm.supabase.co`, connection fails; the real project is `wpfmhmnceflfruhssqqb`). Sign-in dies with "Failed to fetch" (verified in a real browser, screenshot `01b-login-failed.png`).
2. **Production serves the October 2025 prototype** — Vercel production tracks `master`, whose tip is `76734ad` (2025-10-28, mock-data leads UI). 129 commits behind the real app.
3. **app.realtylt.com never reaches Vercel** — DNS resolves to `34.210.134.29` (old nginx/PHP host) which returns **HTTP 410 Gone**. The domain *is* attached to the Vercel project; only DNS was never switched.

Functionally, the biggest Brivity gaps are not missing pages but missing **engines**: email/SMS actually sending (provider is a deterministic fixture), auto-plans actually executing, inbound leads actually routing, and MLS data actually being live (CMA/market-report comps are a fixture cluster around Huntington, NY).

---

## 2. How this audit was done

- Fresh isolated clone: `git clone /root/realtylt-crm /root/realtylt-crm-review` (read from clone only; loop repo untouched).
- Static inventory of `apps/web` (routes, components, data layer, tests, migrations, control docs).
- Live checks, all read-only: Supabase `list_tables` + security advisors; Vercel project/team inspection via MCP; HTTP probes of preview/production/domain; a Playwright (bundled Chromium, not the user's Chrome) session against the deployment-protection share link (generated with the authed Vercel account, expires ~24 h).
- Visual evidence: the loop commits its own e2e screenshots — all 47 copied to `docs/crm-audit/repo-evidence/` (dated 2026-07-11, current tip). My 3 live-preview shots (`00-landing`, `01-login`, `01b-login-failed`) are alongside.

---

## 3. Current-state inventory

### 3.1 Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **14.0.3** App Router, React 18, TypeScript |
| Styling | Tailwind 3, Lucide icons, custom design system (`components/ui/*`: Button, Card, Badge, Input, Select, Textarea, Modal, Table, EmptyState, Avatar, PageHeader, StatCard, Tabs, Skeleton) |
| Data | Supabase (`@supabase/ssr` server client), project `wpfmhmnceflfruhssqqb`; only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` needed; RLS enforces access |
| Monorepo | Turborepo — `apps/web` + `packages/database` (migrations/checks) + `packages/config` |
| Tests | Vitest (430 tests / 32 files at last gate) + Playwright e2e (24 spec files, 72 passing) |
| Auth | Supabase SSR session; `middleware.ts` protects `/dashboard`; **signups disabled by design** — single durable login `demo@realtylt.com` |
| PWA | manifest + icons (192/512/maskable) with e2e coverage |

### 3.2 Route map (46 pages) — what exists vs stubbed

**Real, data-wired (server actions + `lib/data/*` → live Supabase):**

| Area | Routes | Notes |
|---|---|---|
| Dashboard | `/dashboard` | Take-Action cards (5 New Leads, 3 Tasks Due…), Reports row, Recent Activity, Activity Tracking goals — real queries |
| People | `/dashboard/people`, `/people/[id]` | Table w/ COLUMNS·SORT·FILTER·bulk; Person detail = Brivity 3-column (summary / composer Note-Email-Text-Call-Appointment-Other + timeline / details rail) |
| Leads | `/dashboard/leads` | People scoped to `stage='lead'` + smart filters; chatbot-lead detail + read-only transcript window (Phase G) |
| Tasks | `/dashboard/tasks` | Overdue/Today/Upcoming/Completed, create/complete/assign, contact links, mobile row treatment |
| Transactions | `/dashboard/transactions`, `/[id]` | Status table + detail w/ stage control |
| Opportunities | `/dashboard/opportunities` | Pipeline board — **backed by `contacts` query, not a distinct deals entity** |
| Messages | `/dashboard/messages` | Unified inbox + composer — **DB rows only; no real email/text transport** |
| Reporting | `/dashboard/reporting` | Business dashboard + tabs from real aggregates (`lib/reports/kpis`, `lib/data/reporting.ts` 322 L) |
| Calendar | `/dashboard/calendar` | Month view + create event |
| CMA | `/dashboard/cma`, `/cma/build`, `/cma/[id]/preview` (public share) | Full wizard → report renderer (price, comps, map) → public share with view tracking + lead-capture form (anon RPCs) |
| Market Reports | `/dashboard/market-reports`, `/build`, `/[id]` | Wizard + engagement tracking; email send = fixture |
| Search | `/dashboard/search` | MLS-style filter UI — stub backend (fixture comps) |
| Settings (17) | users, roles, sources, tags, dates, property-types, templates, auto-plans, lead-routing, lead-ponds, financials, goals, business, personal, import (CSV wizard) | Full CRUD, each with `actions.ts` |
| Agents | `/dashboard/agents`, `/agents/[worker]` | RealtyLT-specific AI worker-fleet panel (beyond Brivity) |
| Auth | `/`, `/login`, `/signup`, `/auth/callback`, `/auth/signout` | Landing + auth flows |

**Placeholder (`ComingSoon` component) — 5 pages, deliberate:** `/dashboard/marketer`, `/recruiter`, `/website`, `/phone`, `/appstore`. These were 404s until Phase G created real routes; the loop queued an **owner decision: keep vs delete** the nav items.

28 `actions.ts` server-action files exist — every CRUD surface submits for real. No REST API routes (all server actions).

### 3.3 Database (live, verified via Supabase)

All 23 tables the code references exist live, **RLS enabled on every one**: organizations(1), users(1), contacts(8), tasks(4), listings(3), transactions(2), activities(3), invitations(0), roles(3), sources(5), tags(5), date_types(5), property_types(6), templates(5), auto_plans(2), auto_plan_steps(5), lead_routing_rules(1), lead_ponds(1), lead_pond_members(0), cma_reports(0), cma_report_comps(0), mls_listings(8 fixture comps), market_reports(0). Chatbot tables untouched as required: n8n_chat_histories(120), chat_logs(60), leads(3). Plus live-only extras not used by the app: audit_log, api_keys, webhooks, webhook_deliveries, rag_demo_chunks(81).

**Data volume is demo-seed thin** — fine for review, not a launch dataset.

**Schema-drift finding:** repo migrations (0001–0008) only contain DDL for 11 of the 23 tables + the transcript view. The 12 settings/automation tables (roles, sources, tags, date_types, property_types, templates, auto_plans, auto_plan_steps, lead_routing_rules, lead_ponds, lead_pond_members, invitations) were applied live (via Supabase MCP) but their DDL is not reproducible from the repo. Not a runtime bug; a disaster-recovery/reproducibility gap.

### 3.4 Quality state

- Last gate (cycle 139): `next build` 0 errors, `tsc` 0, vitest 430 passing, e2e 72 passing, 0 timeouts. 56 unit/spec files, 24 e2e specs incl. `full-app-qa`, `anon-security`, responsive suites at 1280/390.
- Design: consistent dark violet system; committed screenshots show polished dashboard, people table, person detail, CMA report w/ map, mobile nav. Empty/loading/focus states have dedicated screenshots (`design-pages-people-empty/loading/focus`).
- Security advisors (live Supabase): **1 ERROR** — `chatbot_transcript_by_phone` view is SECURITY DEFINER; **WARNs** — `verify_api_key` callable by `anon`, `record_cma_view`/`submit_cma_lead` anon-callable (intentional for public CMA share but should be rate-limited/reviewed), leaked-password protection disabled; **INFO** — chatbot tables RLS-on-no-policy (deny-all; intentional).

---

## 4. Deployed state (the P0 section)

| Leg | URL | State |
|---|---|---|
| Preview (agent-work) | `realtylt-crm-web-git-agent-work-…vercel.app` | Build READY; UI renders behind deployment protection (bypassed via share link); **login broken** — client bundle carries `NEXT_PUBLIC_SUPABASE_URL=https://nyoqsdpjdsrdxtireumm.supabase.co`, which no longer exists (connection fails). Browser shows "Failed to fetch". |
| Production | `realtylt-crm-web.vercel.app` | HTTP 200 but serves **master = Oct 2025 prototype** (tip `76734ad`, "Add Leads navigation link"). |
| Custom domain | `app.realtylt.com` | Attached to the Vercel project, but DNS → `34.210.134.29` (nginx 1.20.2 / PHP 8.4.23 — the old host) returning **410 Gone**. Never pointed at Vercel. |

Likely cause of the dead Supabase URL: an earlier Vercel-Supabase integration created project `nyoqsdpjdsrdxtireumm`, which was later deleted (possibly during the 2026-07-01 Supabase security cleanup). The BUILD_QUEUE D2 note (2026-06-30) recorded the deploy as "connects to Supabase" — true then, dead now.

**None of this is fixable by the loop** — it has no GitHub push cred for master promotion policy, no Vercel token, no DNS access. These are owner/operator actions (≈30–60 min total).

---

## 5. Brivity-parity gap analysis

Reference: the repo's own `BRIVITY_SPEC.md` (built from a live walkthrough of app.brivity.com) + standard Brivity surface. "NEEDS-BRIVITY" = pixel/behavior-precise matching requires viewing the real UI again.

| # | Brivity capability | Status | Priority | Effort | Notes |
|---|---|---|---|---|---|
| 1 | Global shell: sidebar (16 items), topbar search, apps switcher, bell, activity-feed slide-out | **HAVE** | — | — | Sidebar actually has 18+ items (adds CMA, Market Reports, Agents) |
| 2 | Dashboard: Take-Action cards, activity feed, goals widget | **HAVE** | P2 polish | S | NEEDS-BRIVITY for exact card set/metrics |
| 3 | People table: columns/sort/filter, bulk actions, row actions | **HAVE** | P2 | S | NEEDS-BRIVITY for exact column catalog |
| 4 | Person detail: 3-col, composer (Note/Email/Text/Call/Appt/Other), timeline, details rail | **HAVE** | P2 | S | Brivity's "AI assist" in composer absent (P3) |
| 5 | Leads view (stage-scoped people) | **HAVE** | — | — | |
| 6 | **Inbound lead capture → auto contact + routing** (websites, Zillow, ponds, first-to-claim) | **PARTIAL** | **P1** | M | Chatbot leads (`public.leads`) get a read-only detail/transcript view, but are **not converted into CRM contacts** and `lead_routing_rules` are config-only — no runtime engine claims/assigns anything |
| 7 | Lead ponds (shared pools + claiming) | PARTIAL | P2 | S–M | Settings CRUD done; claiming flow in Leads view unverified/likely absent |
| 8 | **Auto Plans that actually fire** (emails/texts/tasks on schedule) | **PARTIAL** | **P1** | L | Builder + steps CRUD exist; **no execution engine** (no cron/queue) — plans never run |
| 9 | Templates (email/text) | **HAVE** | — | — | |
| 10 | **Email sending (individual + mass)** | **MISSING** | **P1** | M | `lib/email/provider.ts` only implements a deterministic **fixture**; "Resend/SendGrid plugs in here" is the designed seam. No mass-email UI |
| 11 | Texting/SMS + A2P registration | **MISSING** | P2 | M–L | No Twilio; Brivity texting is core for many teams |
| 12 | Dialer / Phone | **MISSING** (ComingSoon) | P2–P3 | L | Owner call: build vs keep placeholder vs delete |
| 13 | Tasks (views, assign, contact links) | **HAVE** | — | — | |
| 14 | Calendar + appointments | **HAVE** (basic) | P2 | S | NEEDS-BRIVITY (event types, sync expectations) |
| 15 | Transactions/listings + detail | **HAVE** | P2 | M | Brivity adds date/task checklists per transaction — absent |
| 16 | Opportunities pipeline | PARTIAL | P2 | M | Board exists but rides on `contacts`; no distinct deal entity/stages history |
| 17 | Messages unified inbox (2-way email/text threads) | **PARTIAL** | **P1** (with #10) | L | Today an activity log with composer; real 2-way sync needs providers |
| 18 | Reporting (Business Dashboard, Agent Activity, Call/Text, Tasks, Appointments, Lead Source) | **HAVE** | P2 | S | Real aggregates; NEEDS-BRIVITY for metric-for-metric parity |
| 19 | CMA (Brivity CMA product) | **HAVE** structurally | **P1** for realism | M | Wizard→report→public share→lead capture all real; **comps are fixture MLS** — needs One Key (or MLS Grid) live provider; mind MLS Grid compliance constraints |
| 20 | Market reports (recurring, emailed) | **HAVE** structurally | P1 (same deps) | M | Fixture MLS + fixture email; no recurring scheduler |
| 21 | MLS/IDX search, saved searches, listing alerts | PARTIAL UI | P2 | L | Search page is a filter shell over fixtures; alerts/saved searches absent |
| 22 | Website builder (Brivity Web) | ComingSoon | P3 | — | realtylt.com already exists; recommend **delete or repoint** nav item |
| 23 | Marketer (design center/ads) | ComingSoon | P3 | — | Owner decision |
| 24 | Recruiter | ComingSoon | P3 | — | Owner decision |
| 25 | Add-Ons / App store / billing | ComingSoon | P3 | — | Owner decision |
| 26 | Settings suite (Users/Roles/Sources/Tags/Dates/Financials/Goals/PropTypes/LeadPond/LeadRouting/Templates/AutoPlans/Import) | **HAVE** — all 17 | — | — | Best-covered area |
| 27 | Multi-user teams: invites, roles enforcement, per-agent assignment | **PARTIAL** | **P1** (before real team use) | M | Single org/single user live; `invitations` table exists (0 rows); signups disabled; invite-accept flow unverified |
| 28 | Notifications (bell w/ real events) | PARTIAL | P2 | S–M | Bell exists in topbar; live event wiring unverified |
| 29 | Mobile apps | PARTIAL | P3 | — | Responsive + PWA manifest instead — reasonable substitute |

**Bottom line:** page-level parity with Brivity's core CRM is essentially complete (and the UI is genuinely good). The parity debt is concentrated in the four engines — **lead intake/routing, auto-plan execution, real email/SMS, real MLS data** — plus multi-user onboarding.

---

## 6. Ship-readiness — what's actually broken or blocking

**P0 — nobody can use the product (owner actions, ~30–60 min, zero loop conflict):**
1. Vercel env: set `NEXT_PUBLIC_SUPABASE_URL=https://wpfmhmnceflfruhssqqb.supabase.co` + matching anon key on **Production and Preview** targets of `realtylt-crm-web`; redeploy. (Also remove any dangling Supabase-integration env.)
2. Promote current code to production: the loop is at a natural gate (**Phase G AWAITING_REVIEW**) — review, then fast-forward `master` (or repoint production branch to the release branch) so production stops serving the 2025 prototype.
3. DNS: point `app.realtylt.com` at Vercel (CNAME `cname.vercel-dns.com`) at the current host's DNS panel; the domain is already attached in Vercel.

**P1 — before real agents use it:**
4. Auth hygiene: demo password `demo123456` is written in a migration comment (`packages/database/migrations/0005_demo_seed.sql:12`); rotate it (coordinate — the loop's e2e reads `E2E_TEST_PASSWORD` from env in WSL) and enable Supabase leaked-password protection. Decide the real-user onboarding path (signups disabled; invitations flow unfinished).
5. Supabase advisor ERROR: `chatbot_transcript_by_phone` SECURITY DEFINER view; WARN: `verify_api_key` anon-executable. Review/harden (the CMA public RPCs are intentional but deserve rate limiting).
6. Fixture engines (see parity table #6/8/10/19): features demo perfectly but simulate — email never sends, plans never run, comps aren't real, inbound leads don't route.
7. Migration drift: back-fill repo DDL for the 12 live-only tables (pure additive doc/SQL work).

**P2 — quality:**
8. Loop's own queued owner decisions: (a) transcript seed credential, (b) keep-vs-delete the 5 placeholder nav items (I recommend: delete Website/Recruiter/Add-Ons from nav, keep Phone + Marketer as roadmap placeholders).
9. Thin demo data — seed a realistic dataset before showing the CRM to anyone.
10. Live-only clutter tables (rag_demo_chunks, api_keys, webhooks…) — confirm ownership before touching (chatbot/other projects may use them).

**Verified NOT broken (worth saying):** no dead nav links remain (Phase G fixed the 5 × 404s), all forms have server actions, RLS is on everywhere, anon security has its own e2e, responsive 390 px is covered by tests + screenshots, build/type/lint/test gates are green at the tip.

---

## 7. Prioritized execution plan (for the editing rounds)

**Coordination model:** the loop owns this repo and its deploy. Code tasks should go in as **queue items at the Phase G review gate** (its designed interface), or with the loop paused. Rounds 0 and the Supabase-side items need no coordination at all.

### Round 0 — unblock the product (owner + any agent with Vercel/DNS creds; NO repo changes)
| Task | Where | Safe w/ loop running? |
|---|---|---|
| Fix Supabase env on both Vercel targets, redeploy, verify login on preview w/ demo creds | Vercel dashboard/CLI | ✅ |
| Review Phase G → promote to production (`master` fast-forward or production-branch switch) | GitHub + Vercel | ✅ (it's the loop's own gate) |
| DNS cutover `app.realtylt.com` → Vercel; verify TLS + login on the domain | DNS panel | ✅ |
| Enable leaked-password protection; review `verify_api_key`/SECURITY DEFINER advisors | Supabase dashboard/SQL | ✅ (coordinate anything touching demo user pwd with loop e2e env) |

### Round 1 — the four engines (queue into loop OR paused-loop editing)
1. **Real email provider** — implement `ResendEmailProvider` behind the existing `EmailProvider` interface (`apps/web/lib/email/provider.ts`), env `EMAIL_PROVIDER=resend` + key; wire Messages composer + market-report send. (M)
2. **Auto-plan execution engine** — scheduled runner (Vercel cron route or Supabase pg_cron) that walks `auto_plans`/`auto_plan_steps` for enrolled contacts, creates tasks/sends templates, logs to `activities`. Files: new `app/api/cron/…` or edge function + `lib/data/auto-plans.ts`. (L)
3. **Chatbot lead intake + routing execution** — on new `public.leads` row: create/match `contacts` (stage=lead), apply `lead_routing_rules`/pond assignment, surface claim flow in `/dashboard/leads`. Files: `lib/chatbot/lead-context.ts`, new intake action/trigger, leads components. Also closes the n8n-side "leads not saved to CRM" gap. (M)
4. **Live MLS provider** — One Key (or MLS Grid within its compliance constraints) implementation behind `MlsProvider` (`apps/web/lib/cma/mls/provider.ts`), env `MLS_PROVIDER`; feeds CMA comps, market reports, search. (M–L, needs key)
5. **Team onboarding** — finish invitations accept flow; per-agent assignment enforcement via `roles`. (M)

### Round 2 — parity depth
6. SMS/texting via Twilio (+ A2P registration flow stub) → composer + auto-plan steps. (M–L)
7. Opportunities as first-class deals (table + stage history) instead of contacts view. (M)
8. Transaction checklists/key dates (uses `date_types`). (M)
9. Notifications bell wired to `activities`; global search across people/transactions/tasks. (S–M)
10. Repo migration back-fill for the 12 live-only tables; realistic seed dataset. (S)

### Round 3 — NEEDS-BRIVITY pixel pass (requires Brivity access)
11. Side-by-side against app.brivity.com: dashboard cards, People columns, person-detail rail sections/order, reporting tab metrics, auto-plan builder UX, messages layout, opportunity board columns. Mark-and-fix diffs. (S–M each)
12. Resolve the 5 placeholder nav items per owner decision; phone/dialer scoping if kept.

---

## 8. What I need from the user (Levan)

1. **Round 0 go-ahead + creds**: 5 minutes in Vercel (env fix) — or authorize an agent session with the already-authed `npx vercel` CLI to do it; DNS panel access for `app.realtylt.com`; confirmation to promote Phase G to production.
2. **Loop policy for code rounds**: (a) feed tasks into the loop's queue at the current AWAITING_REVIEW gate *(recommended — zero conflict, it's the designed interface)*, (b) pause the loop for a direct editing round, or (c) isolated branch + merge later (merge-conflict risk with an active loop; least recommended).
3. **Brivity access** for the Round 3 pixel pass — a logged-in session or fresh screenshots of: dashboard, People, a person detail, Reporting tabs, an auto-plan builder, Messages. (All rows tagged NEEDS-BRIVITY block on this.)
4. **Provider keys/decisions**: Resend (or preferred) email key; Twilio (if SMS in scope); One Key MLS vs MLS Grid for live comps.
5. **Owner decisions the loop already queued**: transcript seed credential; keep-vs-delete Marketer/Recruiter/Website/Phone/Add-Ons nav items.
6. **Demo password rotation** timing (must update the loop's `E2E_TEST_PASSWORD` env in the same step or its e2e goes red).

---

## Appendix — evidence files (this folder)

- `00-landing-1280.png`, `01-login-1280.png`, `01b-login-failed.png` — live preview via Vercel share link (protection bypassed; login failure captured).
- `repo-evidence/` — 47 screenshots committed by the loop at the audited tip (dashboard, people ±empty/loading/focus, person detail, leads, tasks, transactions detail, reporting, settings-personal, CMA report/price/comps/map, agents panel, login, shell, mobile 390 variants, mobile nav open).
- Deployed-preview share link (expires ≈2026-07-12 04:02 ET): `https://realtylt-crm-web-git-agent-work-levans-projects-a543d940.vercel.app/?_vercel_share=if6yojPORZ2c9hVelHyCZExg2ogFQLJq`
