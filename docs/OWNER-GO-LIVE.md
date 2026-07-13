# RealtyLT — Owner Go-Live Checklist

Consolidated from the final audit (2026-07-12). Everything here is **owner-gated** — it needs your
decision, an account/DNS action, or a production promote. The build itself is done and verified; these are
the switches only you should flip. Ordered by property. Nothing below has been done automatically.

## Website (realtylt.com) — ~15 min to public
1. **Let photos backfill / confirm the media budget is warm** — verify a listing shows real photos (the
   on-demand proxy self-heals once the trailing-window cooldown clears; don't manually hammer it).
2. **Swap the MLS test key → production key** in Vercel env (`MLS_API_KEY`), redeploy.
3. **Flip to public** — set `NEXT_PUBLIC_SITE_URL=https://realtylt.com`, remove the `PRELAUNCH` env,
   redeploy (drops the noindex).
4. **Point the domain** — add realtylt.com to the `realtylt-website` Vercel project + update DNS, after
   turning off the current Brivity-hosted site.
5. **Snapshot refresh cadence (decision).** There is **no automated refresh cron** — the listing snapshot is
   refreshed manually (`node scripts/export-snapshot.mjs` → commit → deploy). Decide a durable auto-refresh
   store (e.g. a small Supabase table for the text snapshot — **never store photos**) or commit to a
   documented manual cadence. Blob is intentionally removed; Vercel's filesystem is read-only, so a cron
   alone can't persist a snapshot.
6. **Optional hardening for launch:** enable a **Vercel WAF rate-limit** on `/api/lead` (the in-app per-IP
   limit is best-effort/per-instance; WAF is the durable edge layer). Consider deploying the edge-function
   hardening (a shared `x-rlt-secret` from the route + tightening the CORS off blanket `*.vercel.app`).

## AI recruiter page (realtylt.com/ai)
7. **Standalone-origin indexing (SEO decision).** `realtylt-ai-page.vercel.app` serves no `noindex` of its
   own (the `/ai` proxy adds it pre-launch). It carries a `rel=canonical` to realtylt.com/ai. Decide whether
   to add `X-Robots-Tag: noindex` on the standalone origin — but **test first** that the `/ai` proxy doesn't
   forward that header, or realtylt.com/ai could be suppressed at launch. Safe to defer.
8. **RAG "Doc Q&A" demo** — dead on the real user path because the `rag-demo` n8n workflow's Allowed Origins
   only permit the standalone origin. Add the proxy/realtylt.com origins in the n8n UI + republish, or leave
   it as the current graceful "demo mode" fallback.
9. **Re-baseline the AI-page visual goldens** — the beat/journey golden images predate the redesign; approve
   fresh baselines when convenient.

## CRM (app.realtylt.com) — the biggest set
10. **Pin the production Supabase project.** Three are referenced historically; the code targets only
    `wpfmhmnceflfruhssqqb` (which holds the data). Set `NEXT_PUBLIC_SUPABASE_URL` + anon key to that project
    on **both** Production and Preview Vercel targets, delete any dangling Supabase-integration env, and
    confirm it's the DB of record. (This was the cause of the preview "Failed to fetch" login.)
11. **Refresh `E2E_TEST_PASSWORD`** on the loop machine so the CRM e2e suite actually runs — today a stale
    password makes `globalSetup` throw, so e2e silently runs zero specs while unit stays green. Also make CI
    **fail on a 0-spec run** so a skipped suite can never read as a pass.
12. **Merge + promote** — merge `fix/brivity-parity` (the audited compliance/opt-out fixes) and the loop's
    `agent-work` → `master` through the loop (pause it first), promote to production, then **cut
    `app.realtylt.com` DNS** to Vercel (it's currently SSL-mismatched on the old host; master is ~129 commits
    behind the built branch).
13. **Turn on real automation sends (only after 14–16).** The engine defaults to **test mode** (delivers
    nothing). Before flipping it: (14) register the sending number for **A2P 10DLC**; (15) wire the **inbound
    Twilio STOP webhook** in n8n to write `automation_optouts` (the in-CRM opt-out writer + STOP footer are
    already built; the inbound path is the missing piece); (16) rotate the n8n dispatch webhook's **static
    shared secret** to a long random value held as an n8n Header-Auth credential, and add a rate/volume cap.
17. **Supabase security advisors** (apply carefully — shared prod DB the live chatbot uses):
    - **ERROR:** `chatbot_transcript_by_phone` is a SECURITY DEFINER view. Recreate as `security_invoker`
      *only after* confirming its consumers still see rows under RLS (the chatbot tables are RLS-on/deny-all).
    - **WARN:** `verify_api_key`, `submit_cma_lead`, `record_cma_view` are anon-executable SECURITY DEFINER
      functions. The two CMA RPCs are intentional for the public share flow — **rate-limit** them (don't
      revoke). Review whether `verify_api_key` needs `anon` EXECUTE (likely revoke).
    - Enable **leaked-password protection** (HaveIBeenPwned) in Supabase Auth.
    - Make `0005_demo_seed.sql` non-clobbering before any re-run (already patched on `fix/brivity-parity`).

## Provider keys / accounts
18. Twilio (wired via n8n; needs A2P), Gmail/email deliverability (SPF/DKIM if moving off Gmail-send),
    MLS **production** key, and the durable-snapshot store decision (#5).

---
**Bottom line:** the products are built and verified. Going public is this checklist — mostly account,
DNS, and key actions, plus the deliberate switch that turns on real messaging. None of it is code work.
