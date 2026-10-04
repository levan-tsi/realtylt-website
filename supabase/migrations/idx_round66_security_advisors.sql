-- Round 66 (2026-10-04), the owner's order: "make sure everything is safe". Applied to the shared
-- Supabase project through the MCP connector as migration idx_round66_security_advisors.
-- 1. Four tables had row level security off, so the anon and authenticated roles could read or
--    change every row through the REST API. site_watch_state is read and written only by the
--    website's health-watch cron with the service role (app/api/cron/health-watch/route.ts), and
--    the three _backup_r0822_* tables are backups nothing reads. RLS on with no policy locks all
--    four to the service role, which bypasses RLS.
alter table public.site_watch_state enable row level security;
alter table public._backup_r0822_report_views enable row level security;
alter table public._backup_r0822_report_opens enable row level security;
alter table public._backup_r0822_counters enable row level security;
-- 2. zip_centroids was a SECURITY DEFINER view (the linter's one ERROR): it answered every caller
--    with centroids over every idx_listings row, past the "site reads active listings" policy.
--    As a security-invoker view it runs as the caller, so anon and authenticated see centroids of
--    the active rows they may read, and the service role sees all.
alter view public.zip_centroids set (security_invoker = on);
