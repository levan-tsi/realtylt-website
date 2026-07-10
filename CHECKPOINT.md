# CHECKPOINT — RealtyLT Website

## ⚠️ OWNER KEYS STILL NEEDED (the one external blocker — everything else proceeds)

Paste into the secrets store (`.env`, from `.env.example`) when ready:

1. `MLS_API_KEY` — MLS/IDX API key (OneKey MLS via MLS Grid; TEST key first, swap PRODUCTION at launch)
2. `MLS_API_ENDPOINT` — MLS Grid feed base URL
3. `MLS_FEED_ID` — board/feed identifier (live site uses mlsId=280)
4. `CRM_LEAD_WEBHOOK` — app.realtylt.com lead-intake endpoint
5. `CRM_API_TOKEN` — CRM auth token (if required)

Until supplied: IDX runs on the realistic fixture mock; lead forms run in stub mode (logged, not
delivered). Also pending from owner (non-blocking): Who-We-Are copy + blog posts (Drive), real
social URLs (live site's footer socials point to Brivity's accounts — omitted for now).

## Status — updated 2026-07-10 (Phase A, main agent)

| Phase | State |
|---|---|
| A — understand/plan/scaffold | IN PROGRESS — capture ✅ reconcile ✅ spec ✅ plan/arch ✅ scaffold ⏳ |
| B — Builder (whole site) | not started |
| C — QA | not started |

Done so far:
- Live site captured to `docs/reference/` (15 pages × 1280+390 + sitemap-live.json + page-inventory.json)
- Brief reconciled vs live. Flags: **Reviews page missing live (build fresh)**; **Orange County is a
  6th serviced area** (added); live footer socials point to Brivity + broken mailto (won't replicate);
  `/home_value` vs `/homevalue` duplication (canonical /home-value + redirects)
- Design spec: `docs/superpowers/specs/2026-07-10-realtylt-website-design.md` (Hudson Twilight /
  Valley Line direction; IA; tech decisions incl. Leaflet map, Saved-instead-of-SignIn)
- `PLAN.md` (backlog + build order) + `ARCHITECTURE.md` (routes, lib/idx, lib/leads, mortgage, SEO)

Next step: scaffold Next.js project (tokens, fonts, shell, .env.example, lib types, redirects),
verify build, commit `feat/scaffold` → merge `develop`, then dispatch Builder (Phase B).

## Decisions log (why)

- 6 county pages incl. Orange — live search proves Orange is serviced; static pages + localized copy for SEO (brief §8)
- Sign In → "Saved" (localStorage favorites/saved-searches + alert opt-in lead) — no user backend; honest > fake login
- Leaflet/OSM map — no API key, works in mock mode, removes an owner blocker
- Fixture IDX = OneKey-shaped data incl. compliance fields; attribution block always rendered
- Fonts: Fraunces display + Nunito body (brief) + Spline Sans Mono data; accent `porchlight #E8B04B`
- Manual scaffold (no create-next-app) — non-empty repo
