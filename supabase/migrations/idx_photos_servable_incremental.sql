-- idx_refresh_photos_servable_recent() — the same truth as idx_refresh_photos_servable(), computed
-- ONLY for the listings that could have changed since the last run. DRAFT 2026-10-15, NOT APPLIED:
-- rehearse rolled back with predictions first, apply on the owner's word (the practice for every
-- change to the live project).
--
-- WHY (the 2026-10-15 outage, record docs/parity/AI-WORKSPACE-2026-10-10.md section 13e):
-- the hourly job 3 (`idx-photos-servable-refresh`, :27) recomputes the contiguous mirrored-photo
-- prefix for ALL 45,592 listings by scanning ALL 833,146 objects of the mls-photos bucket with
-- split_part + regexp per row, a window function and a group by. pg_stat_statements since
-- 2026-10-05: 250 calls, mean 101.7 s, max 196.5 s, 25,432 s of database time in ten days. On the
-- Micro compute (1 GB, work_mem 3.5 MB) that is a disk sort every hour and a memory spike the
-- instance cannot absorb when anything else is running: on 2026-10-15 it took 170 s at 17:27 UTC
-- under test load, failed with "job startup timeout" at 18:27, and the project's API layer died
-- from 18:15 to 23:13 UTC. Measured the same evening: listings updated in the last 24 h = 1,640
-- (0 in the last 2 h); objects created in the last 24 h = 4,948; `storage.objects` already carries
-- `name_prefix_search (name text_pattern_ops)` and `idx_objects_bucket_id_name (bucket_id, name
-- COLLATE "C")`, so `name LIKE '<id>/%'` is an index range scan per candidate.
--
-- WHAT CHANGES: job 3 runs the recent version hourly (candidates = rows never computed, rows the
-- sync touched in the window, rows whose objects were uploaded in the window); the full recompute
-- keeps the gaps-and-deletions guarantee once a day at a quiet hour (09:27 UTC = 05:27 ET).
-- Contract unchanged: photos_servable = contiguous prefix in Storage clamped to the feed claim.

create or replace function public.idx_refresh_photos_servable_recent(p_since interval default interval '3 hours')
returns integer
language plpgsql
set search_path to ''
as $$
declare
  changed integer;
begin
  with cand as (
    select l.id
      from public.idx_listings l
     where l.photos_servable is null
        or l.updated_at > now() - p_since
    union
    select distinct split_part(o.name, '/', 1)
      from storage.objects o
     where o.bucket_id = 'mls-photos'
       and o.created_at > now() - p_since
  ),
  idxs as (
    select c.id,
           nullif(regexp_replace(split_part(o.name, '/', 2), '\D', '', 'g'), '')::int as i
      from cand c
      join storage.objects o
        on o.bucket_id = 'mls-photos'
       -- a RANGE, not LIKE: a LIKE pattern built from the joined row is not a constant, so the
       -- planner cannot turn it into an index range (the first read-only test with LIKE timed
       -- out); the range below is sargable on idx_objects_bucket_id_name (bucket_id, name
       -- COLLATE "C"); '0' is the next ASCII character after '/'.
       and o.name collate "C" >= (c.id || '/') collate "C"
       and o.name collate "C" <  (c.id || '0') collate "C"
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
      join cand c on c.id = l.id
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

-- Maintenance only, never an RPC (same as the full function).
revoke execute on function public.idx_refresh_photos_servable_recent(interval) from public;
revoke execute on function public.idx_refresh_photos_servable_recent(interval) from anon;
revoke execute on function public.idx_refresh_photos_servable_recent(interval) from authenticated;

-- The objects-side candidate branch scans created_at over the bucket; this partial index keeps
-- that to the recent slice. If the storage schema refuses the index to the postgres role, drop
-- the index statement AND the second half of `cand` (the sync bumps updated_at on every listing
-- whose photos it mirrors, so the listings-side branch alone covers the hourly case; the daily
-- full pass covers the backfill uploads).
create index if not exists idx_objects_mls_photos_created
  on storage.objects (created_at)
  where bucket_id = 'mls-photos';

-- Job 3 becomes the hourly recent pass (its 15-minute statement_timeout is no longer needed);
-- the full recompute moves to once a day.
select cron.alter_job(
  job_id := 3,
  command := $$select public.idx_refresh_photos_servable_recent(interval '3 hours')$$
);
select cron.schedule(
  'idx-photos-servable-full-daily',
  '27 9 * * *',
  $$set statement_timeout = '15min'; select public.idx_refresh_photos_servable()$$
);

-- ROLLBACK: select cron.alter_job(job_id := 3, command := $$set statement_timeout = '15min'; select public.idx_refresh_photos_servable()$$);
--           select cron.unschedule('idx-photos-servable-full-daily');
--           drop index if exists storage.idx_objects_mls_photos_created;
--           drop function if exists public.idx_refresh_photos_servable_recent(interval);
-- PREDICTIONS for the rehearsal: the recent pass over the last 24 h of candidates answers in a few
-- seconds and changes 0 rows right after a full pass (measured read-only on 2026-10-15: see the
-- record); job 3's next run shows a duration under 10 s in cron.job_run_details.
