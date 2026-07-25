# Parity round 7 (2026-07-25): full MLS inventory + cover-photo bug + placeholder + live compare

Owner findings: (1) onekeymls.com/homes-for-sale/orange-county-ny shows 2,473 listings; our
/search?county=orange shows 1,268 — SAME ~half gap on every county. (2) Some cards show the
no-photo placeholder while the DETAIL page has photos (cover bug). (3) The no-photo
placeholder itself should be a nicer branded image. (4) With remaining budget: compare ours
vs live realtylt.com and report what's missing.

## 1. INVENTORY GAP — get ALL the listings with proper data
KNOWN FACT (orchestrator): lib/idx/mls-grid.ts:474 filters
`PropertyType in ('Residential','Residential Income')`. OneKey's portal includes more
(their filters expose Condo/Co-op/Townhome categories, Land, Commercial; rentals are a
separate section). Likely the gap. INVESTIGATE BEFORE CHANGING:
- I1. Ground truth from the FEED: use the existing secret-gated paced probe
  (/api/cron/mls-probe on the DEPLOYED site — read docs/mls-fix/ first) to get per-
  PropertyType $count=true totals for CountyOrParish 'Orange' (and one more county as a
  check). ONE paced request per count query, 1.1s+ gaps, <= ~10 requests total for this
  investigation. NEVER call api.mlsgrid.com directly from local scripts and NEVER from any
  request path.
- I2. Ground truth from ONEKEY's portal: fetch their orange-county page + filter UI
  (public site, Playwright fine) to see which categories make up 2,473 (their "homes for
  sale" scope — does it include Land? Commercial? Co-ops as separate type?).
- I3. COMPLIANCE check: docs/mls-fix/AUDIT.md + MLS Grid docs + memory notes — confirm
  which PropertyTypes our IDX agreement allows us to DISPLAY (sale types are typically
  fine; Residential Lease/rentals often restricted — if restricted, EXCLUDE and say so).
- I4. Then implement: widen the sync PropertyType filter to the allowed set; extend the
  type mapper (line ~618: map each raw type to our UI PropertyType union — extend the
  union + UI filter chips/labels as needed: Land, Commercial, Condo/Co-op if the feed
  separates them; check propertySubType coverage first — condos may already be inside
  'Residential'); verify no OTHER shrink filters exist in the pipeline (price floors,
  status mapping, is_active RLS, snapshot filters, search-page defaults).
- I5. RE-BASELINE the new types into Supabase using the ESTABLISHED bounded pattern
  (scripts/ baseline/backfill runners through the DEPLOYED endpoint, paced, resumable
  watermark, UPSERT_BATCH small, statement-timeout aware). Bounded chunks; stop on any
  429 wave and note the resume command. Then covers-first photo mirroring for the new
  rows (scripts/backfill-photos.mjs pattern, --covers-only first, cap later).
- I6. ACCEPTANCE: our /search?county=orange total within ~5% of the feed's own per-type
  sum for the allowed set (document any honest delta: rentals excluded, compliance
  exclusions, inactive lag). Verify at least 3 counties + 1 borough. Update the county
  pages' medians/counts still compute (borough/county aggregates unchanged or improved).
  UI: new types get honest filter labels; cards render sensibly for Land (no beds/baths
  -> hide, show acres) and Commercial. Tests for the mapper + card fallbacks.

## 2. COVER-PHOTO BUG (placeholder card, photos on detail)
Root-cause hypothesis (orchestrator, high confidence): the mirror bookkeeping counts a
CONTIGUOUS prefix — when photo 0's download failed but 1..n uploaded, photosMirrored=0;
the media route's storage-probe heals per-index (detail asks idx 1..n -> 302s) but the
CARD asks idx 0 -> no 0.jpg object -> 503 -> placeholder. Fix BOTH ends:
- P1. Route: extend the storage-probe path — when idx==0 is missing but the listing is
  supposed to have photos, probe indices 1..3 and 302 to the first that exists (a cover
  substitute beats a placeholder). Cache-safe: same headers as the existing probe branch.
- P2. Data: a bounded repair pass that re-attempts JUST the missing covers for listings
  with photos.length>0 and no 0.jpg (fresh URLs via the deployed paced endpoint —
  extend backfill-photos.mjs with a --covers-repair mode or similar; resumable; report
  how many covers healed vs CDN-refused).
- P3. Card client: MlsImage already retries/self-heals; verify the card falls back
  gracefully if the route still 503s (it does — placeholder) — no change beyond P1.

## 3. BETTER NO-PHOTO PLACEHOLDER
Replace the gray SVG-glyph tile with a tasteful branded IMAGE placeholder (e.g. a soft
duotone photo of a Hudson Valley house/porch in our ink/mist palette with the RealtyLT
mark + "Photo coming soon"). Constraints: self-made or properly-licensed imagery ONLY (no
scraping someone's photo); must not look like a real listing photo of THIS property
(explicitly generic/branded so it cannot mislead); small file (<80KB), works at card AND
gallery sizes, keep the SVG as the final fallback. Anti-slop rules apply. Wire it into
the media route's "empty"/"unavailable" responses and the card NoPhoto component.

## 4. REMAINING BUDGET: LIVE-SITE COMPARE + GAP REPORT
After 1-3 are verified: fresh full-page pairs (live realtylt.com vs ours) for
home/search/listing-detail/buying/selling/financing/home-value/connect/blog at 1440+390,
plus click-probes of live's interactive elements (read-only, NEVER submit live forms).
Produce a MISSING/DIFFERENT list ranked by visibility — that list is the deliverable for
the owner, not fixes (fix only quick obvious wins if budget allows).

## GUARDRAILS (this round touches the MLS-SENSITIVE area — read before acting)
- READ FIRST: docs/mls-fix/AUDIT.md, docs/mls-fix/PHOTO-MIRRORING.md, lib/idx/mls-grid.ts
  header comments, POLISH_CHECKPOINT.md notes.
- MLS Grid DATA API: only via the deployed paced endpoints (cron/probe). NEVER from local
  scripts directly, NEVER per-view/request-path. Stay < 2 req/sec ACCOUNT-wide; assume the
  hourly cron is also running. Bounded, resumable chunks for any re-baseline; STOP on 429
  waves (30-60min cooldown) — we are suspension-sensitive.
- Supabase: DML through the existing secret-gated RPC/patterns only; DDL/migrations via
  MCP apply_migration if truly needed (expression indexes if new-type queries seq-scan);
  NEVER touch RLS/policies/storage security. Statement timeouts: small batches.
- Photos: storage growth check before mirroring new types (covers-only first; report GB).
- Standard set: ONE dev server (start it — none is running: cd repo && NODE_OPTIONS=
  '--use-system-ca' npm run dev), foreground probes in scripts/_scratch-*.mjs, LOOK at
  screenshots, tsc+tests green after each numbered item, page-scoped commits, never push,
  no secrets, intercept /api/lead locally, anti-slop rules.
