-- ═══ Round 51: the platform watches itself - state, counts, and the pg_cron that fires it ═══
--
-- Owner, 2026-09-17: "not just idx ... crm and website weekly and if something is serious or
-- risky notify right away, if its being attacked or some anomaly, but not from n8n - our page
-- should handle that." The watch itself is app/api/cron/health-watch (lib/watch/*); this
-- migration gives it the three things the platform side needs:
--
--  1. site_watch_state - one row of jsonb the route reads/writes (previous counts for swing
--     detection, the re-alert throttle, the last report so a session can read what the watch
--     last saw without hitting the route). Service-role only; anon/authenticated get nothing.
--  2. site_watch_counts() - the flood/anomaly numbers (leads, auth signups, chat sessions,
--     last hour and last 24h). SECURITY DEFINER because auth.users is not reachable through
--     PostgREST and the service role should not need a grant on it either; the function
--     returns AGGREGATES only. Execute is revoked from public/anon/authenticated - the
--     service role's BYPASSRLS covers the route.
--  3. Two pg_cron jobs, the same mechanism that fires the hourly MLS sync (Vercel Hobby crons
--     are daily-only): hourly checks at :23, the Monday digest 11:23 UTC. Same bearer secret
--     as idx-hourly-sync, same vercel.app host (the proven pattern).
--
-- Alerts leave through Resend once RESEND_API_KEY exists in the Vercel env; until then the
-- route computes + stores + returns "no-transport" and the n8n IDX watcher keeps guard (see
-- lib/watch/send.ts). APPLIED to prod 2026-09-17 via the Supabase MCP.

create table if not exists public.site_watch_state (
  id int primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
revoke all on table public.site_watch_state from public, anon, authenticated;

insert into public.site_watch_state (id, state) values (1, '{}'::jsonb)
on conflict (id) do nothing;

create or replace function public.site_watch_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'leads_1h',   (select count(*) from public.leads where created_at > now() - interval '1 hour'),
    'leads_24h',  (select count(*) from public.leads where created_at > now() - interval '24 hours'),
    'signups_1h', (select count(*) from auth.users where created_at > now() - interval '1 hour'),
    'signups_24h',(select count(*) from auth.users where created_at > now() - interval '24 hours'),
    'chat_1h',    (select count(distinct session_id) from public.chat_logs where created_at > now() - interval '1 hour'),
    'chat_24h',   (select count(distinct session_id) from public.chat_logs where created_at > now() - interval '24 hours')
  );
$$;

revoke all on function public.site_watch_counts() from public, anon, authenticated;

comment on table public.site_watch_state is
  'Round 51: the health watch''s one-row state (prev counts for swing detection, re-alert throttle, last report). Written by /api/cron/health-watch with the service role.';
comment on function public.site_watch_counts() is
  'Round 51: flood/anomaly aggregates for the health watch (leads, signups, chat sessions; 1h + 24h). SECURITY DEFINER, aggregates only.';

-- The schedules. cron.schedule upserts by jobname, so re-running this is safe.
-- <CRON_SECRET> is the value of the Vercel env var of the same name - NEVER committed here;
-- the applied jobs carry the real bearer inside the database (read cron.job to see them),
-- exactly as idx-hourly-sync already does.
select cron.schedule(
  'site-health-watch',
  '23 * * * *',
  $cmd$select net.http_get(url:='https://realtylt-website.vercel.app/api/cron/health-watch', headers:=jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'), timeout_milliseconds:=45000)$cmd$
);
select cron.schedule(
  'site-health-digest',
  '23 11 * * 1',
  $cmd$select net.http_get(url:='https://realtylt-website.vercel.app/api/cron/health-watch?mode=digest', headers:=jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>'), timeout_milliseconds:=45000)$cmd$
);
