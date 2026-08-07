-- ═══ Round 24b: the Keywords box, and a Views toggle ════════════════════════════════════
--
-- Owner: "not sure if filters when you click more have everything double check those too
-- with zillow." The item-by-item audit lives in docs/parity/DESIGN-ROUND24.md §8; the two
-- gaps our replica can honestly close are Zillow's KEYWORDS box and its Views must-have.
--
-- MEASURED FIRST (2026-08-07, in-surface: 25,118 for-sale on-market rows ≥ $10k):
--   description (PublicRemarks, stored app-shaped under listing->>'description'): 25,062
--   filled — 99.8%. "pool" appears in 3,468 remarks, "fireplace" in 3,640, "horse" in 207.
--   lotFeatures "Views": 804.
--
-- KEYWORDS is the crown piece: pool and fireplace are sync-gated as structured facts
-- (PoolPrivateYN / FireplaceYN are not in SELECT_FIELDS), but the remarks the feed already
-- ships answer them the same way Zillow's own keyword box does — full text, stemmed,
-- websearch syntax (quoted phrases, -exclusions). The column is a generated STORED tsvector
-- with a GIN index, so the hot path never touches the fat jsonb (the de-TOAST rule from
-- idx_more_facts_columns.sql binds here too); PostgREST queries it with wfts(english).
--
-- The ALTER rewrites the table (ACCESS EXCLUSIVE). Apply the ALTER alone, then the indexes
-- — the round-23 MCP timeout rolled back clean; verify columns + pg_stat_activity before
-- any retry.

alter table public.idx_listings
  add column if not exists remarks_tsv tsvector
    generated always as (to_tsvector('english', coalesce(listing ->> 'description', ''))) stored,

  add column if not exists has_views boolean
    generated always as (jsonb_contains(listing -> 'lotFeatures', '["Views"]'::jsonb)) stored;

create index if not exists idx_listings_remarks_tsv_active
  on public.idx_listings using gin (remarks_tsv) where is_active;
create index if not exists idx_listings_views_active
  on public.idx_listings (has_views) where is_active;
