-- ═══ Round 23: three more questions the MORE panel can honestly answer ═══════════════════
--
-- Owner's standing ask ("work on filters, add more whatever is important... then test it in
-- every few random way to confirm the data is correct compare to one key mls"), continued from
-- idx_search_facet_columns.sql — same mechanism, same rules, so read that header for WHY these
-- are generated STORED columns and never jsonb predicates (short version: `listing` TOASTs,
-- a predicate detoasts every candidate row, the anon statement timeout fires, and search()
-- silently serves a stale snapshot).
--
-- WHAT WAS MEASURED FIRST (2026-08-06, inside the Active for-sale surface — the Apartment
-- trap's lesson is to count within the surface that will offer the filter):
--
--   Washer/Dryer Hookup   2,585 of 16,826   (interiorFeatures)
--   Formal Dining         3,264             (interiorFeatures)
--   Public Sewer          1,492 of a 2,000-row sample   (sewer — vocabulary is clean:
--                         Public Sewer / Septic Tank / Cesspool / Septic Needed / None…)
--   Public water          1,516 of the same sample      (waterSource: Public / Well /
--                         Private / Shared Well / Spring…)
--
-- "Municipal water and sewer" ships as ONE toggle over BOTH booleans: the buyer question it
-- answers is "no well, no septic", which is a single decision in this market. The columns stay
-- separate facts so a future control can split them without another rewrite.
--
-- NOT BUILT, AND WHY — MAX HOA. AssociationFee is replicated (2,929 numeric values, median
-- $580) but AssociationFeeFrequency is NOT in SELECT_FIELDS, so a row's number cannot be told
-- monthly from annual. A "$500/mo max" filter over mixed-frequency values would lie. It joins
-- pool and fireplace on the needs-a-SELECT_FIELDS-change list (a sync change — out of scope
-- this round, probe once and carefully when taken).
-- NOT BUILT — SCHOOL DISTRICT. 79% filled and internally consistent (135 distinct values,
-- zero normalization collisions), but a hardcoded 135-option select would rot into dead
-- options as inventory shifts (the filter-that-cannot-answer rule, again). It needs a small
-- dynamic values source (the suggest-index pattern) — designed, deferred, recorded in
-- DESIGN-ROUND23.md.
--
-- A NULL still never satisfies a filter: a listing that does not state its sewer must not
-- appear under "Municipal water and sewer".
--
-- The ALTER rewrites the table under an ACCESS EXCLUSIVE lock. Applied while the site is
-- pre-launch and private, and NOT while the project is IO-starved (it was starved earlier
-- today; a probe answered in 366ms immediately before this was applied).

alter table public.idx_listings
  add column if not exists has_washer_dryer boolean
    generated always as (jsonb_contains(listing -> 'interiorFeatures',
      '["Washer/Dryer Hookup"]'::jsonb)) stored,

  add column if not exists has_formal_dining boolean
    generated always as (jsonb_contains(listing -> 'interiorFeatures',
      '["Formal Dining"]'::jsonb)) stored,

  add column if not exists has_public_sewer boolean
    generated always as (jsonb_contains(listing -> 'sewer',
      '["Public Sewer"]'::jsonb)) stored,

  add column if not exists has_public_water boolean
    generated always as (jsonb_contains(listing -> 'waterSource',
      '["Public"]'::jsonb)) stored;

-- Partial on is_active, like every other search index on this table.
create index if not exists idx_listings_washer_dryer_active
  on public.idx_listings (has_washer_dryer) where is_active;
create index if not exists idx_listings_formal_dining_active
  on public.idx_listings (has_formal_dining) where is_active;
create index if not exists idx_listings_public_sewer_active
  on public.idx_listings (has_public_sewer) where is_active;
create index if not exists idx_listings_public_water_active
  on public.idx_listings (has_public_water) where is_active;
