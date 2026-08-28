-- ═══ Round 50: the store remembers a re-pricing and a status change ════════════════════════
--
-- Owner-approved funnel item (round 49 ranked it, round 50 brief item 6c): price-drop and
-- status-change badges on saved homes, "Price cut $15k - 3 days ago".
--
-- WHY A TRIGGER AND NOT THE SYNC. The feed does not replicate a "price reduced" flag (the
-- facet migrations already record that OneKey ships neither Open Houses nor Price Reduced),
-- and RESO's OriginalListPrice / PriceChangeTimestamp are not in mls-grid.ts SELECT_FIELDS,
-- so whether OneKey populates them is a HYPOTHESIS nobody has measured. What we DO have is a
-- store that sees every listing again every hour: idx_sync_apply upserts the whole `listing`
-- jsonb (insert ... on conflict (id) do update set listing = excluded.listing), and `price`
-- and `status` are generated STORED columns off that jsonb. So the moment of change is
-- observable in one place, on the row, with the old value in OLD and the new one in
-- NEW.listing. A BEFORE UPDATE OF listing trigger records it there. The sync's schedule, its
-- query and its RPC are untouched; the MLS is not asked anything new.
--
-- GENERATED COLUMNS ARE NOT YET COMPUTED IN A BEFORE TRIGGER, so the new price is read from
-- NEW.listing->>'price' (the same expression that generates the column) and compared with
-- OLD.price, which IS the stored value.
--
-- ONLY REAL RE-PRICINGS. Both sides must be known numbers: a listing arriving without a
-- ListPrice (auction, "call for price") and later getting one is not a cut, and a NULL on
-- either side records nothing. Increases are recorded too (previous_price > price is what the
-- site reads as a cut; the badge simply stays quiet on a rise). A status change is stamped
-- whenever the generated status flips, so "Pending - 2 days ago" and "Back on market" can
-- both be said truthfully.
--
-- The stamps are OUR observation time (the hourly tick), not the MLS's own timestamp, which
-- is exact to within an hour and is stated as "N days ago", never as a date.
--
-- Additive only: three nullable columns, one function, one trigger. No RLS, no grants, no
-- change to idx_sync_apply. Old rows carry NULLs until their first change is observed.

alter table public.idx_listings
  add column if not exists previous_price numeric,
  add column if not exists price_changed_at timestamptz,
  add column if not exists status_changed_at timestamptz;

create or replace function public.idx_listings_track_changes()
returns trigger
language plpgsql
as $$
declare
  new_price numeric := nullif(NEW.listing->>'price', '')::numeric;
  new_status text := NEW.listing->>'status';
begin
  if OLD.price is not null and new_price is not null and OLD.price <> new_price then
    NEW.previous_price := OLD.price;
    NEW.price_changed_at := now();
  end if;
  if OLD.status is not null and new_status is not null and OLD.status <> new_status then
    NEW.status_changed_at := now();
  end if;
  return NEW;
end;
$$;

drop trigger if exists idx_listings_track_changes on public.idx_listings;
create trigger idx_listings_track_changes
  before update of listing on public.idx_listings
  for each row
  execute function public.idx_listings_track_changes();

comment on column public.idx_listings.previous_price is
  'The list price this row carried before its most recent observed re-pricing (trigger idx_listings_track_changes). NULL until a change is observed.';
comment on column public.idx_listings.price_changed_at is
  'When the hourly sync observed the most recent re-pricing. Observation time, not the MLS timestamp.';
comment on column public.idx_listings.status_changed_at is
  'When the hourly sync observed the most recent status change (Active / Coming Soon / Pending / Under Contract).';
