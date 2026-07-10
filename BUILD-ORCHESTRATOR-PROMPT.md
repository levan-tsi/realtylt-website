# RealtyLT Website — Build Session Prompt  (paste into a new Fable session)

You are the lead engineer **and** orchestrator building the **RealtyLT marketing website**
(realtylt.com) to a deploy-ready state. Work entirely inside `C:\Users\Levan\realtylt-website`
(Windows — use the Bash/PowerShell tools; WSL Ubuntu is available if you want it). **Stack: Next.js**
(App Router, TypeScript, Tailwind). Do NOT stop to ask — decide, record the decision + rationale, and
proceed. Only surface the one genuine external blocker (owner keys, bottom).

--------------------------------------------------------------------------------
## PHASE A — Understand, verify, plan, scaffold  (YOU do this yourself; do not dispatch yet)
1. Read `docs/BRIEF.txt` (the authoritative developer brief) in full.
2. **The brief is TEXT-ONLY — there are no reference pictures, so the LIVE site is your visual ground
   truth.** Use **Playwright** (`page.goto('https://realtylt.com')`) — or the Claude Chrome extension —
   to open the live site and walk EVERY nav page + the footer (Home, Search, Buying, Selling, Top Areas
   + the 5 county views, Financing, Home Value, Who We Are, Blog, Connect, Reviews). **Screenshot each
   page at 1280 AND 390 and save them under `docs/reference/`** — that folder is the visual reference
   the whole build checks its work against. Reconcile the brief against reality: confirm every page/
   section/form/CTA/legal link the brief lists, and FLAG anything the brief missed. This is the "is it
   mapped properly / what's missing" check — and since the map is words only, the pictures come from here.
3. Use the `brainstorming` skill on: information architecture, the design direction, and the technical
   architecture. **Design bar (non-negotiable, CLAUDE.md §5):** premium, distinctive, alive — the
   RealtyLT `/ai` page is the taste reference; NOT a Brivity clone and NOT a framework-default template.
   The brief's palette (Nunito; grey/black menu; brand blue) is the STARTING point — add one distinct
   accent + fresh hero imagery.
4. Decide + WRITE DOWN the architecture in the repo:
   - `PLAN.md` — the page/feature/component backlog + build order (independent pages can parallelize).
   - `ARCHITECTURE.md` — Next.js routes per the page map; a typed `lib/idx` for MLS/IDX behind a
     realistic FIXTURE mock; `lib/leads` that POSTs the lead payload (name/email/phone/message/
     interest-reason/source/timestamp) to the CRM webhook (stubbed until supplied); pure-JS mortgage
     calc; SEO base (schema.org RealEstateAgent + listings, sitemap, robots, OG); the design system +
     shared header/footer; and the **secrets/config area** (brief §4) — ALL keys read from env at
     runtime, NEVER hardcoded, with ONE `.env.example` of labeled slots.
   - `CHECKPOINT.md` — live status; at the TOP, list exactly which owner keys are still needed.
5. Scaffold the Next.js project + design system + shared shell + `.env.example`. Commit on a branch.

## PHASE B — Build  (summon ONE Builder sub-agent)
When the plan + scaffold are ready, dispatch a **Builder** sub-agent to build the WHOLE site per
`PLAN.md`/`ARCHITECTURE.md`: every page, IDX search/results behind the mock, all lead forms → the
webhook stub, the mortgage calc, full SEO, legal pages, mobile-first responsive — to the `/ai`-page
design bar. It works with TDD + systematic-debugging, and **verifies each page with Playwright at 1280
AND 390, side-by-side against the `docs/reference/` live-site screenshots** (match the structure, then
improve on it — never a pixel clone). Commits on its branch, keeps `CHECKPOINT.md` current, reports evidence.
(If the site is large, it may fan out per page — but one Builder owns the build phase.)

## PHASE C — QA / debug / fill the gaps  (summon a SECOND sub-agent)
When the build is done, dispatch a **QA** sub-agent to INDEPENDENTLY test and check EVERYTHING against
the brief + the `docs/reference/` live-site screenshots: use **Playwright** to drive every page + every
flow at 1280 + 390, re-capture each page and diff it against its reference (structure/sections/CTAs all
present and improved, nothing dropped), run `next build` + tests, and catch bugs, regressions, missing
sections, broken forms, console errors, a11y and SEO gaps.
It FIXES what it finds (red-before-fix where testable), lists anything it could not fill, and **reports
back to you (main)**. You reconcile the report, integrate the fixes, and update `CHECKPOINT.md`.

--------------------------------------------------------------------------------
## TOKEN DISCIPLINE  (this is a hard rule)
Every agent + sub-agent should do SUBSTANTIAL work per session — push productively toward **~700k
tokens**, NOT open→tiny-change→close. But do NOT blow past it: if a sub-agent nears its budget before
finishing, it SAVES state to the repo (`CHECKPOINT.md` + committed code) and reports exactly what's
left, so the next sub-agent resumes cleanly instead of the job dying half-done.
**When YOU (main) reach ~700k tokens:** STOP, commit all state (PLAN/ARCHITECTURE/CHECKPOINT + code),
tell the user, and OUTPUT a ready-to-paste **HANDOFF PROMPT** for a fresh session that names: the repo
path + branch, the last completed item, the exact next step, and any open decisions — so a new session
continues exactly where you left off.

## GUARDRAILS  (do silently, never ask)
Never commit secrets (`.env*` is git-ignored — verify `git status` never lists it). Feature branches +
an integration branch; small commits; `CHECKPOINT.md` current every cycle so progress survives a
restart. This site is **realtylt.com**; the CRM is **app.realtylt.com** (already built); the recruiting
page is **realtylt.com/ai** (already built) — keep the brand consistent across all three and wire the
lead forms to the CRM webhook.

## THE ONE EXTERNAL BLOCKER (do NOT stall on it)
The OWNER supplies, into the secrets store: `[MLS_API_KEY]`, `[MLS_API_ENDPOINT]` (+ board/feed id) and
`[CRM_LEAD_WEBHOOK]` (+ token). Until then: build the IDX + lead layers behind typed interfaces with a
realistic mock/fixture, mark only feed-dependent e2e as pending, and keep building ALL UI/logic/pages/
SEO/design to deploy-ready. Keep ONE note at the top of `CHECKPOINT.md` listing the exact missing values.

**Begin with Phase A now.** Report as you go; do not wait for me.
