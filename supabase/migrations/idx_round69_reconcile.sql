-- ═══ Round 69: the daily FULL RECONCILIATION against the feed ═══════════════════════════════
--
-- Owner, 2026-10-19: a caller said a listing "showed active on our page" that Zillow and the MLS
-- showed sold. "I thought we ran like a million checks." That listing (KEY1014212, 72 Gleneida
-- Avenue, Carmel) turned out to be ACTIVE in the feed - a commercial mixed-use listing the MLS
-- still carries as Active while Zillow shows the house's last residential sale. But the full
-- check he asked for (scripts/reconcile-feed.mjs, read-only, 46,614 feed rows vs 27,507 of ours)
-- found a real class of miss: 14 rows we served that the feed no longer lists - 12 purged from the
-- feed entirely, one Closed, one MlgCanView=false - and EVERY one of them had a ModificationTimestamp
-- that never moved when the status or the flag changed. The hourly delta asks the feed for rows
-- modified after its watermark, so a status change that does not bump the timestamp is invisible
-- to it for ever. MLS Grid's own docs say the timestamp moves on every change; the feed shows it
-- does not always. (0.05% of the active set over about ten weeks; the other 14 "stale" rows in that
-- run were closings from the same hour, caught by the next hourly tick as designed.)
--
-- THE CURE is not a smarter delta - no timestamp query can see a change with no timestamp. It is
-- a SET comparison: once a day, walk the feed's whole on-market set (ids only, ~94 pages of 500,
-- about three minutes under the 2 req/s cap), diff it against every row we serve, ask the feed BY
-- ID what each row we have and it does not is today (Closed / Hold / Canceled / hidden / gone),
-- and deactivate only what the feed confirms. The same diff names the rows the feed lists in a
-- served county and type that we do not serve, so the route can restore them.
--
-- THIS MIGRATION is the database side:
--   idx_reconcile_seen           the walk's id set (truncated at each run's start)
--   idx_sync_state.reconcile     the run's state (resume cursor, then the result)
--   idx_reconcile_apply()        write seen ids / state / deactivations (secret-gated)
--   idx_reconcile_candidates()   the diff, both directions (secret-gated)
--   idx_reconcile_schedule()     the pg_cron job that fires /api/cron/idx-reconcile daily
--   idx_health_snapshot()        now also returns the reconcile state, for the watch
--
-- Same security shape as the sync: SECURITY DEFINER functions gated by the sha256 of CRON_SECRET
-- held in idx_sync_config; the seen table has RLS on and no grants, so nothing but these functions
-- can touch it. anon/authenticated keep exactly the access they had.
--
-- APPLIED to prod 2026-10-19 via the Supabase MCP (migration idx_round69_reconcile).

alter table public.idx_sync_state add column if not exists reconcile jsonb;

comment on column public.idx_sync_state.reconcile is
  'Round 69: state of the daily feed reconciliation (startedAt, nextLink cursor, pages, scanned; then completedAt + summary). Written only by idx_reconcile_apply.';

create table if not exists public.idx_reconcile_seen (
  id text primary key,
  status text,
  served boolean not null default false,
  ts text
);
alter table public.idx_reconcile_seen enable row level security;
revoke all on table public.idx_reconcile_seen from public, anon, authenticated;

comment on table public.idx_reconcile_seen is
  'Round 69: the ids the daily reconciliation walk saw in the feed''s on-market set (truncated at each run''s start). served = in a county and PropertyType the site serves. No grants: only the secret-gated idx_reconcile_* functions read or write it.';

-- Write side: seen ids (upsert), the run state, and the deactivations the route decided on.
create or replace function public.idx_reconcile_apply(
  _secret text,
  _reset boolean default false,
  _seen jsonb default '[]'::jsonb,
  _state jsonb default null,
  _deactivate_ids text[] default '{}'::text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
set statement_timeout = '120s'
as $$
declare
  n_deactivated int := 0;
  n_seen int := 0;
begin
  if not exists (
    select 1 from idx_sync_config
    where secret_sha256 = encode(digest(coalesce(_secret, ''), 'sha256'), 'hex')
  ) then
    raise exception 'idx_reconcile_apply: bad secret';
  end if;

  if _reset then
    truncate table idx_reconcile_seen;
  end if;

  insert into idx_reconcile_seen (id, status, served, ts)
  select e->>'id', e->>'status', coalesce((e->>'served')::boolean, false), e->>'ts'
  from jsonb_array_elements(_seen) e
  where coalesce(e->>'id', '') <> ''
  on conflict (id) do update
    set status = excluded.status, served = excluded.served, ts = excluded.ts;

  -- The same statement the hourly sync uses: never a delete, the row stays for history and
  -- comes back through the normal upsert if the feed lists it again.
  update idx_listings set is_active = false, updated_at = now()
  where id = any(_deactivate_ids) and is_active;
  get diagnostics n_deactivated = row_count;

  if _state is not null then
    update idx_sync_state set reconcile = _state where id = 1;
  end if;

  select count(*) into n_seen from idx_reconcile_seen;
  return jsonb_build_object('seen_total', n_seen, 'deactivated', n_deactivated);
end;
$$;

comment on function public.idx_reconcile_apply(text, boolean, jsonb, jsonb, text[]) is
  'Round 69: the reconciliation route''s only write path. Secret-gated (sha256 in idx_sync_config). Upserts seen ids, stores the run state on idx_sync_state.reconcile, deactivates the ids the route confirmed off-market with the feed.';

-- Read side: the diff. stale = rows we serve that the walk did not see (candidates; the route
-- confirms each with the feed before anything is deactivated). missing = served rows the walk
-- saw that we do not serve (never stored, or deactivated and back on the market).
create or replace function public.idx_reconcile_candidates(_secret text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
set statement_timeout = '60s'
as $$
declare
  stale text[];
  missing text[];
  n_seen int;
  n_active int;
begin
  if not exists (
    select 1 from idx_sync_config
    where secret_sha256 = encode(digest(coalesce(_secret, ''), 'sha256'), 'hex')
  ) then
    raise exception 'idx_reconcile_candidates: bad secret';
  end if;

  select coalesce(array_agg(x.id), '{}') into stale from (
    select l.id from idx_listings l
    where l.is_active and not exists (select 1 from idx_reconcile_seen s where s.id = l.id)
    order by l.id limit 5000
  ) x;

  select coalesce(array_agg(x.id), '{}') into missing from (
    select s.id from idx_reconcile_seen s
    where s.served and not exists (select 1 from idx_listings l where l.id = s.id and l.is_active)
    order by s.id limit 500
  ) x;

  select count(*) into n_seen from idx_reconcile_seen;
  select count(*) into n_active from idx_listings where is_active;

  return jsonb_build_object(
    'stale', to_jsonb(stale), 'missing', to_jsonb(missing),
    'seen_total', n_seen, 'active_total', n_active);
end;
$$;

comment on function public.idx_reconcile_candidates(text) is
  'Round 69: the two-way diff between the walk''s seen set and the rows we serve. Secret-gated. Bounded (5,000 stale / 500 missing per call).';

-- The schedule: four ticks between 05:05 and 05:50 New York time (09:05 to 09:50 UTC while on
-- daylight time). The route itself decides what a tick does - start a run, resume one that ran
-- out of its 300 s, finish one whose walk is done, or nothing when today's run is complete - so
-- the extra ticks are free insurance, not extra work.
create or replace function public.idx_reconcile_schedule(_secret text, _url text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1 from idx_sync_config
    where secret_sha256 = encode(digest(coalesce(_secret, ''), 'sha256'), 'hex')
  ) then
    raise exception 'idx_reconcile_schedule: bad secret';
  end if;
  if _url !~ '^https://[a-z0-9.-]+/api/cron/idx-reconcile$' then
    raise exception 'idx_reconcile_schedule: unexpected url shape';
  end if;

  if exists (select 1 from cron.job where jobname = 'idx-daily-reconcile') then
    perform cron.unschedule('idx-daily-reconcile');
  end if;

  perform cron.schedule(
    'idx-daily-reconcile',
    '5,20,35,50 9 * * *',
    format(
      'select net.http_get(url:=%L, headers:=jsonb_build_object(''Authorization'', %L), timeout_milliseconds:=10000)',
      _url, 'Bearer ' || _secret
    )
  );
  return 'scheduled daily (four ticks 09:05-09:50 UTC): ' || _url;
end;
$$;

comment on function public.idx_reconcile_schedule(text, text) is
  'Round 69: installs or moves the pg_cron job idx-daily-reconcile that fires /api/cron/idx-reconcile. Secret-gated; url shape checked.';

-- The watch reads one more key: the reconcile state, so a run that stops happening is a problem
-- the hourly health check can name. Everything else in this function is round 50's, unchanged.
create or replace function public.idx_health_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select watermark, baseline_complete, last_synced_at, last_run, reconcile
    from public.idx_sync_state where id = 1
  ),
  a as (
    select
      count(*) filter (where is_active) as active_total,
      count(*) filter (where is_active and status = 'Active') as active_status_active,
      count(*) filter (where is_active and status = 'Coming Soon') as active_coming_soon,
      count(*) filter (where is_active and status in ('Pending','Under Contract')) as active_pending,
      count(*) filter (where is_active and coalesce(photos_servable, 0) = 0) as active_no_photo,
      count(*) filter (where is_active and coalesce(photos_servable, 0) = 0
                         and listed_at is not null
                         and (listed_at::timestamptz) < now() - interval '7 days') as active_no_photo_older_7d,
      count(*) filter (where is_active and updated_at > now() - interval '24 hours') as touched_24h,
      count(*) filter (where price_changed_at > now() - interval '24 hours') as repriced_24h,
      count(*) filter (where status_changed_at > now() - interval '24 hours') as restatused_24h
    from public.idx_listings
  )
  select jsonb_build_object(
    'at', now(),
    'watermark', s.watermark,
    'baseline_complete', s.baseline_complete,
    'last_synced_at', s.last_synced_at,
    'minutes_since_sync', case when s.last_synced_at is null then null
                               else round(extract(epoch from (now() - s.last_synced_at)) / 60) end,
    'last_run', s.last_run,
    'reconcile', s.reconcile,
    'active_total', a.active_total,
    'active_status_active', a.active_status_active,
    'active_coming_soon', a.active_coming_soon,
    'active_pending', a.active_pending,
    'active_no_photo', a.active_no_photo,
    'active_no_photo_older_7d', a.active_no_photo_older_7d,
    'touched_24h', a.touched_24h,
    'repriced_24h', a.repriced_24h,
    'restatused_24h', a.restatused_24h
  )
  from a left join s on true;
$$;
