# RealtyLT Website — Ship-Ready Handoff

**Live (private/noindex):** https://realtylt-website.vercel.app · **Repo:** github.com/levan-tsi/realtylt-website (`main`) · **Date:** 2026-07-11

## Score: 9.0 / 10 (pre-launch private build — ship-ready pending an owner go-live flip)

| Dimension | Score | Notes |
|---|---|---|
| Design vs live realtylt.com | 9.5 | ~94% avg (home/search/connect/home-value 95, buying/selling 94, financing 93). Residual gap = Brivity's product-mockup photos we don't have. |
| Real MLS data | 9.0 | 251 live OneKey listings, 6 counties, verified vs Homes.com/Redfin. **Photos pending** (media-CDN cooldown; self-heals via daily cron). |
| Functionality | 9.5 | search/filters/map/pagination/favorites/save-search/calculator/lead-forms all working on real data. |
| Security | 9.5 | CSP + full headers, JSON-LD XSS fix, /api/lead hardening, honeypot, red-teamed. 0 CSP violations live. |
| Ship-readiness | 9.0 | 0 console/CSP errors all routes, a11y clean, SEO + JSON-LD, perf good (FCP ~344ms), noindex. |

66/66 tests, build green, no secrets committed.

## Architecture (for whoever picks this up)
- Next.js 15 App Router + TS + Tailwind v4. Design tokens in `app/globals.css` (Lato, grays, brand navy/azure).
- **IDX:** `ReplicatedIdxClient` reads a Vercel Blob snapshot; the daily Vercel Cron `/api/cron/sync-mls` (6:00 UTC, secret-gated) is the ONLY caller of MLS Grid (OneKey `onekey2`, per-account 2 req/s limit — never call it from the request path). Photos copied into Blob incrementally, budget-aware. Fixture fallback is honestly labeled (`isSampleData`).
- **Leads:** every form → `/api/lead` → `CRM_LEAD_WEBHOOK` (Supabase edge fn `website-lead` → CRM `leads` table). `LEAD_TEST_MODE=1` forces stub (use for QA — never pollute prod).
- **/ai:** rewrite-proxied to the separate `realtylt-ai-page` Vercel project.
- Secrets are Vercel env only: `MLS_API_KEY/ENDPOINT/FEED_ID`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `CRM_LEAD_WEBHOOK`, `NEXT_PUBLIC_SITE_URL`, `PRELAUNCH`.

## TO GO PUBLIC (owner steps — ~15 min)
1. **Let photos backfill** — the daily cron fills them once the MLS media-CDN cooldown clears (stop manual MLS testing so the window resets). Verify a listing shows real photos.
2. **Swap MLS test key → production key** in Vercel env (`MLS_API_KEY`), redeploy.
3. **Delete the stray CRM test row** if still present ("QA Footer", qa-footer@example.com) — CRM-side.
4. **Flip to public:** set `NEXT_PUBLIC_SITE_URL=https://realtylt.com`, remove `PRELAUNCH` env, redeploy (drops noindex).
5. **Point the domain:** add realtylt.com to this Vercel project + update DNS (after turning off the current Brivity site).
6. **Re-probe:** `node scripts/final-probe.mjs` + `node scripts/verify-live-mls.mjs` → 0 console/CSP, real data.

## Deferred (not blockers)
- Blog content from Google Drive (design done, 10 stubs; import posts later).
- Optional: Vercel WAF rate-limit on `/api/lead`; nonce-based strict CSP if the site leaves static generation.

## Separate track — CRM (app.realtylt.com), parked on owner decisions
The CRM is built by its autonomous loop (Phase G complete). It is NOT live: domain SSL-mismatched (not on Vercel), preview login points at a deleted Supabase project, production 129 commits behind. Needs: ops fixes (env repoint, promote, DNS), loop policy, Brivity access for pixel match, provider keys (Resend/Twilio; MLS handled). Full plan: `docs/crm-audit/CRM-AUDIT.md`.
