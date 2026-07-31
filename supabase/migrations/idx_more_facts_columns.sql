-- ═══ /search's MORE panel was silently serving STALE SNAPSHOT DATA ════════════════════════
--
-- Symptom, measured 2026-07-31 on production: "Built 2000+" returned ZERO homes while the
-- feed holds 4,713 active listings built in 2000 or later. "Built before 1970" returned
-- 6,070 against a true 18,004.
--
-- Cause: those four filters were the only ones still reading out of the `listing` jsonb —
--     listing->yearBuilt=gte.2000   listing->lotAcres=gte.5
--     listing->garageSpaces=gte.2   listing->taxAnnual=lte.5000
-- Every other filter (price, beds, baths, sqft, county, propertyType, status) has been a
-- STORED generated column since the table was built. `listing` is a fat jsonb column that
-- TOASTs, so a predicate over it has to detoast rows; combined with PostgREST's exact count
-- and the ORDER BY, that blew the anon role's statement timeout. Measured as anon:
--     no filter + exact count ............ 1,117ms  ok
--     year>=2000, no count ................. 319ms  ok
--     year>=2000 + exact count ........... TIMEOUT at ~3.2s
--     garage>=2 / tax<=5000 / lot>=5 ..... TIMEOUT, all three
-- DbIdxClient.search() catches that and falls back to the committed snapshot, so nobody saw
-- an error — the visitor just got stale results and a wrong count. Silent wrong data is the
-- worst failure shape there is.
--
-- Expression indexes on the jsonb paths already existed (idx_listings_{year,lot,garage,tax}
-- _expr) and did NOT fix it: the bitmap heap recheck still detoasts every candidate row.
--
-- Fix: promote the four facts to generated columns like every other fact, and index them the
-- way price and county are indexed (partial, WHERE is_active). round()::int mirrors how beds
-- and sqft already guard against a jsonb number that renders with a decimal point. All four
-- source fields are always a JSON `number` when present (checked across all 29,153 rows), so
-- the casts cannot break the sync's upsert; absent simply yields NULL, which is honest — a
-- row that does not state its year must not match a year filter.
--
-- The ALTER rewrites the table (24 MB heap, 29,153 rows) under an ACCESS EXCLUSIVE lock —
-- seconds, and only idx_listings.

alter table public.idx_listings
  add column if not exists year_built    integer generated always as ((round((listing ->> 'yearBuilt')::numeric))::integer) stored,
  add column if not exists lot_acres     numeric generated always as ((listing ->> 'lotAcres')::numeric) stored,
  add column if not exists garage_spaces integer generated always as ((round((listing ->> 'garageSpaces')::numeric))::integer) stored,
  add column if not exists tax_annual    numeric generated always as ((listing ->> 'taxAnnual')::numeric) stored;

create index if not exists idx_listings_active_year   on public.idx_listings (year_built)    where is_active;
create index if not exists idx_listings_active_lot    on public.idx_listings (lot_acres)     where is_active;
create index if not exists idx_listings_active_garage on public.idx_listings (garage_spaces) where is_active;
create index if not exists idx_listings_active_tax    on public.idx_listings (tax_annual)    where is_active;

-- FOLLOW-UP, deliberately not done here: once the code above is deployed and nothing queries
-- the jsonb paths any more, the four old expression indexes are dead weight that the hourly
-- sync pays for on every upsert. Drop them in a later migration, AFTER the deploy — dropping
-- them first would leave the old code scanning unindexed:
--   drop index if exists idx_listings_year_expr, idx_listings_lot_expr,
--                        idx_listings_garage_expr, idx_listings_tax_expr;
