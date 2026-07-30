-- idx_listings.photos_servable — how many of a listing's photos the site can ACTUALLY serve.
-- Applied to the live project 2026-07-30. See docs/mls-fix/PHOTO-MIRRORING.md.
--
-- WHY
-- Two numbers existed before this and both were wrong:
--   • jsonb_array_length(listing->'photos') is the feed's CLAIM. Measured on 27,986 active rows:
--     12,905 (46%) claim more photos than the mirror can serve, and 615 claim photos while serving
--     none. That is the owner-reported bug — a map popup promising "8 pics" over a listing page
--     that shows one.
--   • listing->photosMirrored is wiped to 0 by the sync's full-JSONB upsert
--     (`set listing = excluded.listing`), so 9,186 active rows carried marker 0 while their photos
--     sat in Storage. Map popups read that marker and therefore showed no photo at all.
--
-- A real COLUMN survives the JSONB replace, so it is the one number the card counter, the map
-- popup counter and the listing page can all agree on.

alter table public.idx_listings add column if not exists photos_servable smallint;

comment on column public.idx_listings.photos_servable is
  'Contiguous mirrored-photo prefix in Storage (mls-photos/<id>/<n>.jpg), clamped to the feed claim. Maintained by idx_refresh_photos_servable(); null = never computed.';

-- Recompute from Storage — the only source that is true. ZERO MLS Grid contact.
-- The CONTIGUOUS PREFIX, not the object count: a listing holding objects {0,1,3} can only walk
-- 0..1 before index 2 dies, so 2 is what a pager may promise. (Measured: 28,167 of 28,251
-- mirrored listings are a clean prefix from 0; 84 have a gap; 63 are missing the cover.)
create or replace function public.idx_refresh_photos_servable()
returns integer
language plpgsql
as $$
declare
  changed integer;
begin
  with idxs as (
    select split_part(o.name, '/', 1) as id,
           nullif(regexp_replace(split_part(o.name, '/', 2), '\D', '', 'g'), '')::int as i
    from storage.objects o
    where o.bucket_id = 'mls-photos'
  ),
  ranked as (
    select id, i, (row_number() over (partition by id order by i)) - 1 as rn
    from idxs
    where i is not null
  ),
  prefix as (
    select id, coalesce(min(rn) filter (where i <> rn), count(*))::int as n
    from ranked
    group by id
  ),
  truth as (
    select l.id,
           least(
             coalesce(p.n, 0),
             coalesce(jsonb_array_length(l.listing -> 'photos'), 0)
           )::smallint as n
    from public.idx_listings l
    left join prefix p on p.id = l.id
  )
  update public.idx_listings l
     set photos_servable = t.n
    from truth t
   where t.id = l.id
     and l.photos_servable is distinct from t.n;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Not an API surface: a maintenance job called by pg_cron only. Postgres grants EXECUTE to PUBLIC
-- by default, which would publish it as an anon-callable PostgREST RPC.
revoke execute on function public.idx_refresh_photos_servable() from public;
revoke execute on function public.idx_refresh_photos_servable() from anon;
revoke execute on function public.idx_refresh_photos_servable() from authenticated;

-- Hourly, 20 minutes after the sync fires at :07 (that run is capped at 300s and does the
-- mirroring), so the column reflects what the newest run actually uploaded.
select cron.schedule(
  'idx-photos-servable-refresh',
  '27 * * * *',
  $$select public.idx_refresh_photos_servable()$$
);
