-- ROUND 30 — TRUE COORDINATES. Applied to the live project 2026-08-15.
--
-- THE PROBLEM. The onekey2 subscription serves no Latitude/Longitude: a $select naming them
-- answers `400 The field 'Latitude' does not exist or is unable to be retrieved` (proven by
-- experiment in round 28, three times). So lib/idx/mls-grid.ts#coordsOf places every listing at
-- its ZIP CENTROID plus a deterministic jitter inside a fixed 1.77 x 1.86 km box — the same box
-- for a zip holding 12 homes and one holding 177. Verified from the database alone: 31,840 rows
-- across 283 zips, every single one inside its own zip's box. Real geography cannot do that.
-- At borough zoom a whole zip is a 30 x 32 px square with empty ground between the squares,
-- which is the "batched in circles / cramped-down circles" the owner reported.
--
-- THE FIX is data, not rendering: geocode the street address, which the feed does serve in full.
-- Re-placing pins at render time instead would break bbox agreement, because the viewport query
-- filters on the stored lat/lng column — the grid and the map would disagree at every edge.
--
-- THE DURABILITY PROBLEM, and why this is not just an UPDATE. idx_listings.lat/lng are
-- GENERATED ALWAYS from listing->>'lat'/'lng', and idx_sync_apply upserts with
-- `set listing = excluded.listing` — a full JSONB REPLACE. A geocode written into the JSONB
-- alone survives exactly until that listing's next feed touch and then reverts to the centroid,
-- silently, with nothing failing anywhere. So the geocode lives in a side table the MLS sync
-- does not write, and the upsert MERGES it in. Proven by scripts/verify-geocode-durability.mjs,
-- which drives the real RPC against the real database and carries a control that must move.

-- ── 1. the address a geocode was measured FOR ────────────────────────────────────────────
--
-- Each PART is normalised before joining. Trimming the joined string instead leaves whitespace
-- touching the separator ("7 ferris lane |12601"), so one feed row with a trailing space would
-- key differently from the same home without one and its geocode would stop applying — silently,
-- because a declined geocode looks exactly like a home that was never geocoded.
--
-- MUST stay byte-identical to lib/idx/geocode.mjs#addrKey. verify-geocode-durability.mjs
-- compares the two implementations on 25 real rows rather than trusting that they look alike.
create or replace function public.idx_addr_key(_listing jsonb)
returns text language sql immutable as $$
  select lower(
    btrim(regexp_replace(coalesce(_listing->>'address',''), '\s+', ' ', 'g'))
    || '|' ||
    btrim(regexp_replace(coalesce(_listing->>'zip',''), '\s+', ' ', 'g'))
  )
$$;

-- ── 2. where measured coordinates live ───────────────────────────────────────────────────
create table if not exists public.idx_geocodes (
  id              text primary key,
  lat             double precision not null,
  lng             double precision not null,
  source          text not null,          -- 'census' | 'google'
  precision       text,                   -- 'Exact' | 'Non_Exact' | 'ROOFTOP' | 'RANGE_INTERPOLATED'
  addr_key        text not null,
  matched_address text,
  geocoded_at     timestamptz not null default now()
);

-- RLS on with NO policies: only the SECURITY DEFINER RPCs below may read or write this table.
-- It is keyed by listing id and holds rows for homes that have since gone off market, and MLS
-- Grid compliance requires those to be invisible (idx_listings' own policy serves is_active
-- rows only). Nothing on the request path needs it: the coordinate it carries is projected into
-- idx_listings.listing, which is where every surface already reads it.
alter table public.idx_geocodes enable row level security;

-- ── 3. which homes stand on a measured coordinate ────────────────────────────────────────
-- A generated column for the same reason status/county/lat/lng are: filtering on
-- listing->>'geocoded' de-TOASTs the whole JSONB of every candidate row, and both the backfill's
-- "what is left" query and the map's honesty caveat need this cheaply.
alter table public.idx_listings
  add column if not exists geocoded boolean
  generated always as (((listing ->> 'geocoded'::text))::boolean) stored;

create index if not exists idx_listings_pending_geocode
  on public.idx_listings (is_active, geocoded);

-- ── 4. the merge: the sync cannot move a geocoded pin ────────────────────────────────────
-- Same signature as before. A CHANGED one would create an OVERLOAD rather than replace this
-- function, and both would then be callable.
--
-- The rule lives here, in the single write path every producer goes through — the hourly cron,
-- scripts/baseline-to-db.mjs, scripts/backfill-photos.mjs and anything added later — instead of
-- in each caller, because a caller that forgets is a caller that silently moves 27,000 homes
-- back to their zip centroid and nothing fails.
create or replace function public.idx_sync_apply(
  _secret text,
  _upserts jsonb DEFAULT '[]'::jsonb,
  _deactivate_ids text[] DEFAULT '{}'::text[],
  _watermark text DEFAULT NULL::text,
  _baseline_complete boolean DEFAULT NULL::boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
SET statement_timeout TO '120s'
AS $function$
declare
  n_upserted int := 0;
  n_deactivated int := 0;
begin
  if not exists (
    select 1 from idx_sync_config
    where secret_sha256 = encode(digest(coalesce(_secret, ''), 'sha256'), 'hex')
  ) then
    raise exception 'idx_sync_apply: bad secret';
  end if;

  with rows as (
    select e as listing from jsonb_array_elements(_upserts) e
  ), up as (
    insert into idx_listings (id, listing, is_active, updated_at)
    select
      r.listing->>'id',
      case
        -- A geocode measured for THIS address wins over the feed's centroid.
        when g.id is not null and g.addr_key = public.idx_addr_key(r.listing)
          then r.listing || jsonb_build_object('lat', g.lat, 'lng', g.lng, 'geocoded', true)
        -- No geocode, or one measured for a different address: keep the feed's value, and do
        -- NOT claim the position is real.
        else r.listing
      end,
      true, now()
    from rows r
    left join idx_geocodes g on g.id = r.listing->>'id'
    where coalesce(r.listing->>'id', '') <> ''
    on conflict (id) do update
      set listing = excluded.listing, is_active = true, updated_at = now()
    returning 1
  )
  select count(*) into n_upserted from up;

  update idx_listings set is_active = false, updated_at = now()
  where id = any(_deactivate_ids) and is_active;
  get diagnostics n_deactivated = row_count;

  -- Watermark only moves forward; compare as timestamps (mixed ms-precision ISO strings
  -- do not compare correctly as text).
  update idx_sync_state
     set watermark = case
           when _watermark is not null and _watermark::timestamptz > watermark::timestamptz
           then _watermark else watermark end,
         baseline_complete = coalesce(_baseline_complete, baseline_complete),
         last_synced_at = now(),
         last_run = jsonb_build_object(
           'upserted', n_upserted, 'deactivated', n_deactivated,
           'watermark', coalesce(_watermark, watermark), 'at', now())
   where id = 1;

  return jsonb_build_object('upserted', n_upserted, 'deactivated', n_deactivated);
end;
$function$;

-- ── 5. the only writer for idx_geocodes ──────────────────────────────────────────────────
-- Gated by the same CRON_SECRET as idx_sync_apply (there is no service-role key on this
-- stack's request path).
--
-- _rows   : [{id, lat, lng, source, precision, addrKey, matchedAddress}] — geocodes found.
-- _misses : [{id, addrKey}] — addresses no geocoder could place. These stamp
--           listing->'geocodeTried' so each hourly tick spends its budget on listings nobody
--           has tried yet instead of re-asking the same ~500 unanswerable addresses forever.
--
-- geocodeTried is DELIBERATELY not defended by the merge above: a full JSONB replace drops it,
-- so any listing the feed touches again earns a fresh attempt. That is what we want — Census
-- adds addresses over time and a re-listed home may have been corrected — and it costs only a
-- few free lookups.
--
-- It also projects onto the live row so the map is right NOW rather than at the listing's next
-- feed touch, which for a quiet listing can be weeks. The projection is conditional on the
-- address key still matching, exactly as the merge is: a geocode is an answer about an address,
-- not about an id.
--
-- Batches are expected to be small. This updates idx_listings, which the hourly sync and
-- scripts/backfill-photos.mjs also update, so 40P01 deadlocks are possible; PostgreSQL gives no
-- way to force row lock order from SQL, so the contract is small batches plus a jittered retry
-- in the caller — the same arrangement backfill-photos.mjs already runs under.
drop function if exists public.idx_geocode_apply(text, jsonb);

create or replace function public.idx_geocode_apply(
  _secret text,
  _rows jsonb DEFAULT '[]'::jsonb,
  _misses jsonb DEFAULT '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
set statement_timeout to '60s'
as $function$
declare
  n_saved int := 0;
  n_applied int := 0;
  n_missed int := 0;
begin
  if not exists (
    select 1 from idx_sync_config
    where secret_sha256 = encode(digest(coalesce(_secret, ''), 'sha256'), 'hex')
  ) then
    raise exception 'idx_geocode_apply: bad secret';
  end if;

  with incoming as (
    select
      e->>'id'                          as id,
      (e->>'lat')::double precision     as lat,
      (e->>'lng')::double precision     as lng,
      coalesce(e->>'source','unknown')  as source,
      e->>'precision'                   as precision,
      coalesce(e->>'addrKey','')        as addr_key,
      e->>'matchedAddress'              as matched_address
    from jsonb_array_elements(_rows) e
    where coalesce(e->>'id','') <> ''
      and coalesce(e->>'addrKey','') <> ''
      and (e->>'lat') is not null and (e->>'lng') is not null
      and (e->>'lat')::double precision <> 0
      and (e->>'lng')::double precision <> 0
  ), saved as (
    insert into idx_geocodes (id, lat, lng, source, precision, addr_key, matched_address, geocoded_at)
    select id, lat, lng, source, precision, addr_key, matched_address, now()
    from incoming
    on conflict (id) do update set
      lat = excluded.lat, lng = excluded.lng, source = excluded.source,
      precision = excluded.precision, addr_key = excluded.addr_key,
      matched_address = excluded.matched_address, geocoded_at = now()
    returning 1
  ), applied as (
    update idx_listings l
       set listing = l.listing || jsonb_build_object('lat', i.lat, 'lng', i.lng, 'geocoded', true),
           updated_at = now()
      from incoming i
     where l.id = i.id
       and i.addr_key = public.idx_addr_key(l.listing)
    returning 1
  )
  select (select count(*) from saved), (select count(*) from applied)
    into n_saved, n_applied;

  with missed as (
    select e->>'id' as id, coalesce(e->>'addrKey','') as addr_key
    from jsonb_array_elements(_misses) e
    where coalesce(e->>'id','') <> ''
  ), stamped as (
    update idx_listings l
       set listing = l.listing || jsonb_build_object(
             'geocodeTried', to_char(now() at time zone 'utc','YYYY-MM-DD"T"HH24:MI:SS"Z"'))
      from missed m
     where l.id = m.id
       and m.addr_key = public.idx_addr_key(l.listing)
       and l.listing->>'geocoded' is null
    returning 1
  )
  select count(*) into n_missed from stamped;

  return jsonb_build_object('saved', n_saved, 'applied', n_applied, 'missed', n_missed);
end;
$function$;
