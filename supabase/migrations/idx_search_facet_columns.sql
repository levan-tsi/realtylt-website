-- ═══ /search's MORE panel could only ask five questions ═══════════════════════════════════
--
-- Owner, 2026-08-06: "when we click on more we only have like 6 filters — on my real active
-- page it's everything you can filter with, pool and every other detail."
--
-- The panel held sqft / garage / lot / year / tax. Everything else the feed carries was
-- unreachable, not because it was missing but because nothing had promoted it to a column.
--
-- WHY COLUMNS AND NOT A JSONB PREDICATE — this is settled, painfully, by the migration next
-- door (idx_more_facts_columns.sql). `listing` is a fat jsonb that TOASTs, so a predicate over
-- it has to detoast every candidate row; combined with PostgREST's exact count and the ORDER
-- BY that blew the anon role's statement timeout, DbIdxClient.search() silently fell back to a
-- stale snapshot, and "Built 2000+" answered ZERO against a true 4,713. Expression indexes on
-- the jsonb paths did NOT help — the bitmap heap recheck detoasts anyway. So: generated,
-- STORED, indexed partial on is_active, exactly like price/beds/county already are.
--
-- WHAT THE FEED ACTUALLY SUPPORTS. Measured 2026-08-06 across 6,000 active rows before any of
-- this was written, because a filter that cannot answer is worse than no filter (the same rule
-- that keeps Open Houses and Price Reduced off the panel — OneKey replicates neither):
--
--   propertySubType   97.4% filled, a clean RESO scalar:
--                     Single Family 2,680 · Co-op 962 · Condo 733 · Duplex 596 · Apartment 243
--                     · Multi Family 180 · Triplex 166 · Mixed Use 68 · Quadruplex 39
--   Central Air       2,021 of 6,000   (cooling array)
--   basement, real    3,049            (excludes None / Common / Crawl Space / See Remarks)
--   Waterfront/access   230            (lotFeatures — small, but it is a real differentiator)
--   First Floor Bed   1,958            (interiorFeatures; aging-in-place, big in this market)
--   Eat-in Kitchen    2,137            (interiorFeatures)
--
-- NOT BUILT, AND WHY — POOL. There is no structured pool field to filter on. "pool" appears in
-- 659 of 4,000 sampled active rows and 650 of those are in the free-text `description`; ZERO
-- are in exteriorFeatures, features, interiorFeatures or lotFeatures. mls-grid.ts SELECT_FIELDS
-- never requests RESO's PoolPrivateYN / PoolFeatures. A description ILIKE '%pool%' would match
-- "no pool", "pool table" and "community pool" alike, which is precisely the filter-that-cannot
-- -answer this project refuses to ship. Real pool data needs a SELECT_FIELDS change plus
-- confirmation that OneKey populates those fields. Same for fireplace (FireplaceYN/
-- FireplacesTotal are not selected either, and "Fireplace" appears 0 times in interiorFeatures).
--
-- A NULL still never satisfies a filter, which is the honest behaviour: a listing that does not
-- state whether it has central air must not appear under "Central air". The booleans below are
-- computed from arrays that are present on 93-99% of rows, so a false is a real false; the row
-- that omits the array entirely yields NULL and is excluded, same as year_built already does.
--
-- jsonb_contains (@>) and jsonb_exists_any (?|) are both IMMUTABLE (checked in pg_proc on this
-- database), which is what lets them appear in a generated column at all. The function form is
-- used rather than the ?| operator so no client can mistake it for a bind placeholder.
--
-- The ALTER rewrites the table (171 MB, 31,536 rows) under an ACCESS EXCLUSIVE lock. Run while
-- the site is still pre-launch and private, and NOT while the project is IO-starved: earlier
-- today a plain count over this table took 75s+; it was re-measured at 341ms immediately before
-- this was applied.

alter table public.idx_listings
  add column if not exists property_sub_type text
    generated always as (listing ->> 'propertySubType') stored,

  add column if not exists has_central_air boolean
    generated always as (jsonb_contains(listing -> 'cooling', '["Central Air"]'::jsonb)) stored,

  -- "Has a basement" means a usable one. None / Common / Crawl Space / Storage Space /
  -- See Remarks / Bilco Door(s) are all present in the feed and none of them is what someone
  -- ticking this box is asking for.
  add column if not exists has_basement boolean
    generated always as (jsonb_exists_any(listing -> 'basement',
      array['Finished', 'Full', 'Partially Finished', 'Partial', 'Walk-Out Access'])) stored,

  add column if not exists has_waterfront boolean
    generated always as (jsonb_exists_any(listing -> 'lotFeatures',
      array['Waterfront', 'Water Access'])) stored,

  add column if not exists has_first_floor_bed boolean
    generated always as (jsonb_contains(listing -> 'interiorFeatures',
      '["First Floor Bedroom"]'::jsonb)) stored,

  add column if not exists has_eat_in_kitchen boolean
    generated always as (jsonb_contains(listing -> 'interiorFeatures',
      '["Eat-in Kitchen"]'::jsonb)) stored;

-- Partial on is_active, like every other search index on this table: /search never asks about
-- a row that is off-market, so the inactive half has no business in the index.
create index if not exists idx_listings_sub_type_active
  on public.idx_listings (property_sub_type) where is_active;
create index if not exists idx_listings_central_air_active
  on public.idx_listings (has_central_air) where is_active;
create index if not exists idx_listings_basement_active
  on public.idx_listings (has_basement) where is_active;
create index if not exists idx_listings_waterfront_active
  on public.idx_listings (has_waterfront) where is_active;
create index if not exists idx_listings_first_floor_bed_active
  on public.idx_listings (has_first_floor_bed) where is_active;
create index if not exists idx_listings_eat_in_kitchen_active
  on public.idx_listings (has_eat_in_kitchen) where is_active;
