-- ═══ Round 24: the MORE panel learns four dropdowns and one toggle ══════════════════════
--
-- Owner, 2026-08-07: "drop down filters are still less and needs adding more check zillow and
-- my live page for examples." Both references were enumerated first — live realtylt.com's
-- (Brivity) advanced search offers heating (9 checkboxes), basement detail, parking kind,
-- stories and style; Zillow's More panel adds days-on-market, 55+, HOA max, basement,
-- must-haves. Continued from idx_search_facet_columns.sql / idx_round23_facet_columns.sql —
-- same mechanism, same rules, read the first header for WHY these are generated STORED
-- columns and never jsonb predicates.
--
-- WHAT WAS MEASURED FIRST (2026-08-07, in-surface: is_active AND NOT rental AND price ≥ 10k,
-- 25,130 rows — count within the surface that will offer the filter, the Apartment lesson):
--
--   Heating:  Natural Gas 8,854 · Oil 3,610 · Electric 2,281 · Heat Pump 703 · Propane 567
--   Basement: Finished 6,545 · Walk-Out Access 4,193
--   Parking:  Driveway 9,238 · Attached 2,582 · Assigned 2,033 · Detached 1,384
--   Lot:      Near Public Transit 2,871
--
-- Ships as SELECTS (his word was "drop downs"): Heating fuel (5 tokens), Parking (4),
-- Basement (Any / Yes / Finished / Walk-out — the yes/no has_basement column keeps serving
-- "Yes"), plus a Near-public-transit toggle. "Days on market" also ships this round but needs
-- NO column: listed_at already answers it (the newDays window the API has had since round 7).
--
-- "Finished" deliberately does NOT match "Partially Finished" — containment is exact-element,
-- and a buyer asking for a finished basement is not asking for half of one.
--
-- NOT BUILT, AND WHY — carried from round 23, all needing SELECT_FIELDS sync changes (probe
-- once and carefully when taken; the account has a suspension history): ArchitecturalStyle
-- (his live site's style checkboxes), Levels/StoriesTotal (stories), SeniorCommunityYN (55+),
-- NewConstructionYN, FireplaceYN, Pool, Flooring (hardwood), AssociationFeeFrequency (Max
-- HOA). School district still needs its dynamic values source (suggest-index pattern).
-- ExteriorFeatures was measured and REFUSED: its top value is "Mailbox" (389 of a 3,000
-- sample) — nothing there is a question a buyer asks with a straight face.
--
-- The token → value maps are duplicated in lib/idx/types.ts (HEATING_VALUES, PARKING_VALUES,
-- BASEMENT_*_VALUE, NEAR_TRANSIT_VALUE) — SQL cannot import TypeScript — and
-- lib/idx/facets.test.ts pins this file against them so they cannot drift.
--
-- The ALTER rewrites the table under an ACCESS EXCLUSIVE lock (143 MB at apply time).
-- APPLY THE ALTER ALONE, THEN THE INDEXES SEPARATELY: the round-23 apply timed out through
-- the MCP on the single combined statement and ROLLED BACK CLEAN — verify columns exist
-- (information_schema) and no ALTER is still running (pg_stat_activity) before any retry.

alter table public.idx_listings
  add column if not exists has_heat_natural_gas boolean
    generated always as (jsonb_contains(listing -> 'heating', '["Natural Gas"]'::jsonb)) stored,

  add column if not exists has_heat_oil boolean
    generated always as (jsonb_contains(listing -> 'heating', '["Oil"]'::jsonb)) stored,

  add column if not exists has_heat_electric boolean
    generated always as (jsonb_contains(listing -> 'heating', '["Electric"]'::jsonb)) stored,

  add column if not exists has_heat_propane boolean
    generated always as (jsonb_contains(listing -> 'heating', '["Propane"]'::jsonb)) stored,

  add column if not exists has_heat_pump boolean
    generated always as (jsonb_contains(listing -> 'heating', '["Heat Pump"]'::jsonb)) stored,

  add column if not exists has_basement_finished boolean
    generated always as (jsonb_contains(listing -> 'basement', '["Finished"]'::jsonb)) stored,

  add column if not exists has_basement_walkout boolean
    generated always as (jsonb_contains(listing -> 'basement', '["Walk-Out Access"]'::jsonb)) stored,

  add column if not exists has_park_attached boolean
    generated always as (jsonb_contains(listing -> 'parkingFeatures', '["Attached"]'::jsonb)) stored,

  add column if not exists has_park_detached boolean
    generated always as (jsonb_contains(listing -> 'parkingFeatures', '["Detached"]'::jsonb)) stored,

  add column if not exists has_park_driveway boolean
    generated always as (jsonb_contains(listing -> 'parkingFeatures', '["Driveway"]'::jsonb)) stored,

  add column if not exists has_park_assigned boolean
    generated always as (jsonb_contains(listing -> 'parkingFeatures', '["Assigned"]'::jsonb)) stored,

  add column if not exists has_near_transit boolean
    generated always as (jsonb_contains(listing -> 'lotFeatures', '["Near Public Transit"]'::jsonb)) stored;

-- Partial on is_active, like every other search index on this table. Applied AFTER the ALTER
-- lands (separate statements — see the header).
create index if not exists idx_listings_heat_natural_gas_active
  on public.idx_listings (has_heat_natural_gas) where is_active;
create index if not exists idx_listings_heat_oil_active
  on public.idx_listings (has_heat_oil) where is_active;
create index if not exists idx_listings_heat_electric_active
  on public.idx_listings (has_heat_electric) where is_active;
create index if not exists idx_listings_heat_propane_active
  on public.idx_listings (has_heat_propane) where is_active;
create index if not exists idx_listings_heat_pump_active
  on public.idx_listings (has_heat_pump) where is_active;
create index if not exists idx_listings_basement_finished_active
  on public.idx_listings (has_basement_finished) where is_active;
create index if not exists idx_listings_basement_walkout_active
  on public.idx_listings (has_basement_walkout) where is_active;
create index if not exists idx_listings_park_attached_active
  on public.idx_listings (has_park_attached) where is_active;
create index if not exists idx_listings_park_detached_active
  on public.idx_listings (has_park_detached) where is_active;
create index if not exists idx_listings_park_driveway_active
  on public.idx_listings (has_park_driveway) where is_active;
create index if not exists idx_listings_park_assigned_active
  on public.idx_listings (has_park_assigned) where is_active;
create index if not exists idx_listings_near_transit_active
  on public.idx_listings (has_near_transit) where is_active;
