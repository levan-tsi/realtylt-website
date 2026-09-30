-- idx-photos-servable-refresh: the hourly job's statement timeout. Applied to the live project
-- 2026-09-30 (round 65) with cron.alter_job; kept here so the schedule in the repo is the truth.
--
-- WHY
-- The cluster's default statement_timeout is 120 s (postgresql.conf). idx_refresh_photos_servable()
-- reads every listing's photo array (jsonb_array_length(listing -> 'photos'): a detoast of all 42k
-- rows, measured 32 s alone on the 379 MB table) and sorts the 832k photo object names (6 s), then
-- updates. Its successful runs took 116 to 120 s (cron.job_run_details, September 2026); from
-- 2026-09-27 14:27 every run died at 120.0 s with "canceling statement due to statement timeout"
-- (116 failed of 168 runs in the last seven days). While it failed, photos_servable stayed 0 for
-- every listing that arrived after the last success: 597 new listings in three days, none of them
-- eligible for the Featured and New rails (RAIL_MIN_PHOTOS) or for "with photos" search.
--
-- THE FIX
-- pg_cron runs its jobs through a plain libpq connection here (cron.use_background_workers = off),
-- and Postgres 13+ applies statement_timeout to each statement of a multi-statement command
-- separately, so a SET in front of the call gives the function its own budget. 15 minutes is far
-- above the ~2 to 3 minutes it needs and far below the hour between runs (the MLS sync runs at
-- :07 and is capped at 300 s; this job runs at :27).
--
-- Reversal: select cron.alter_job(3, command := $$select public.idx_refresh_photos_servable()$$);

select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'idx-photos-servable-refresh'),
  command := $$set statement_timeout = '15min'; select public.idx_refresh_photos_servable()$$
);
