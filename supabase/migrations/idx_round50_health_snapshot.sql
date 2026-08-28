-- ═══ Round 50, item 9: something finally WATCHES the data ══════════════════════════════════
--
-- Owner: "do we chech data that its properly migrating and no erros and other things ?" The
-- honest round-49 answer was that the sync self-heals and we LOOK per session, but nothing
-- watches. This function is the read side of the watcher: ONE call returning the aggregates
-- the n8n workflow "IDX Data Watcher" (n8n.srv1017745.hstgr.cloud) evaluates every 3 hours.
--
-- WHY A SECURITY DEFINER FUNCTION AND NOT A GRANT. The n8n Postgres credential is the n8n_bot
-- role, which holds no grant on idx_listings or idx_sync_state (checked 2026-08-28). Granting it
-- SELECT would be loosening a control to get numbers; this hands it the numbers and nothing
-- else. No listing data leaves; the function is STABLE and reads only. anon/authenticated are
-- not granted execute (revoked from public).
--
-- WHAT IT MEASURES, borrowed from scripts/inventory-health.mjs where the thresholds were
-- learned: sync freshness (minutes since idx_sync_state.last_synced_at; the cron is hourly),
-- the active count (an abnormal swing between two ticks is the sync deactivating or flooding),
-- zero-photo rows SPLIT BY AGE (young ones are a queue the mirror drains; ones older than 7
-- days are the regression signal - measured 2026-08-04: 1,705 zero-photo rows, 1,250 of them
-- first seen inside 3 days), and the 24h churn counts the round-50 trigger now records.
--
-- APPLIED to prod 2026-08-28 via the Supabase MCP (migration idx_round50_health_snapshot).

create or replace function public.idx_health_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select watermark, baseline_complete, last_synced_at, last_run
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

revoke all on function public.idx_health_snapshot() from public;
grant execute on function public.idx_health_snapshot() to n8n_bot;

comment on function public.idx_health_snapshot() is
  'Round 50: read-only aggregates for the n8n data-integrity watcher (sync freshness, active counts, zero-photo rows by age, 24h churn). SECURITY DEFINER; n8n_bot may execute, has no table grants.';
