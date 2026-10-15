/** What each watch problem means and what to do about it, in plain words (owner, 2026-10-15:
 * a monitor that "checks and takes care of this type of issue, notifies us if it can't fix,
 * with the error log and instructions what to fix").
 *
 * One entry per problem FAMILY the judge (checks.ts) can emit. A family is matched on the
 * stable part of the problem line - the numbers in the line change every run, the family does
 * not - which is also why the re-alert throttle keys on families (alertKey in checks.ts).
 * instructions.test.ts drives the judge through every branch and fails on a problem line that
 * maps to no entry (an orphan), maps to two, or an entry no line reaches.
 *
 * Constraints: the mail shell is ASCII only, so no glyphs here; the owner works from
 * dashboards, never a terminal, so "what to do" names a dashboard path, a cron job, a SQL
 * statement for the Supabase SQL editor, or a URL to open. Cron job ids on the Supabase
 * project: 2 = the MLS sync (idx-hourly-sync, :07), 7 = this watch (site-health-watch, :23). */

export interface Instruction {
  family: string;
  match: RegExp;
  what: string;
  did: string;
  todo: string;
}

/** The hand restart, named once: the problem line and the instructions both point at it. */
export const MANUAL_RESTART = "Supabase dashboard > project > Settings > General > Restart project";

const ALERTED =
  "Sent this alert. It checks every 10 minutes (Vercel cron) and hourly at :23 (Supabase cron job 7), and repeats the same problem at most every 6 hours.";

const SYNC_RUNS =
  "select jobid, status, start_time, return_message from cron.job_run_details where jobid = 2 order by start_time desc limit 5;";
const SYNC_STATE = "select last_synced_at, watermark, baseline_complete, last_run from idx_sync_state where id = 1;";

export const INSTRUCTIONS: readonly Instruction[] = [
  {
    family: "db-api-down",
    match: /^Supabase API layer is down/,
    what:
      "Supabase's API layer (Auth and REST) stopped answering. The database itself may still run, but every login, every listing read and every call pg_cron makes (this watch, the MLS sync) goes nowhere.",
    did:
      "Probed Auth and REST from Vercel, then again 30 s later. When SUPABASE_MANAGEMENT_TOKEN is set and the control plane reads ACTIVE_HEALTHY or ACTIVE_UNHEALTHY, it asked Supabase to restart the project; the problem line says what came back. It looks again in 10 minutes.",
    todo: `If it is still down, restart by hand: ${MANUAL_RESTART}. Once it answers, check in the SQL editor that the crons recovered: select jobid, status, start_time, return_message from cron.job_run_details where jobid in (2, 7) order by start_time desc limit 10;`,
  },
  {
    family: "site-probe-missing",
    match: /^The website probe did not run/,
    what: "The watch could not run its check of realtylt.com. This is a fault in the watch itself, not proof the site is down.",
    did: ALERTED,
    todo: "Open https://realtylt.com in a browser. Then Vercel dashboard > realtylt-website > Logs, filtered to /api/cron/health-watch, for the error.",
  },
  {
    family: "site-down",
    match: /^realtylt\.com answered .* - the website is down or erroring/,
    what: "realtylt.com did not serve its home page to an outside visitor (an error code, or no answer at all).",
    did: ALERTED,
    todo: "Open https://realtylt.com. If it fails: Vercel dashboard > realtylt-website > Deployments; if the newest deployment broke it, use Instant Rollback on the previous one. Logs filtered to 5xx show the failing route.",
  },
  {
    family: "site-slow",
    match: /^realtylt\.com took /,
    what: "realtylt.com answered, but slower than the 8 s floor; visitors leave before a page that slow appears.",
    did: ALERTED,
    todo: "If the Supabase line in this mail is down or slow, fix that first: the pages read listings from it. Otherwise Vercel dashboard > realtylt-website > Observability shows the slow routes.",
  },
  {
    family: "search-down",
    match: /^The listing search API answered /,
    what: "The listing search (/api/idx/search) failed, so visitors cannot search. It reads the listings through Supabase REST.",
    did: ALERTED,
    todo: "Open https://realtylt.com/api/idx/search?limit=1. If the Supabase line in this mail is down, fix that first; otherwise Vercel dashboard > realtylt-website > Logs, filtered to /api/idx/search.",
  },
  {
    family: "crm-probe-missing",
    match: /^The CRM probe did not run/,
    what: "The watch could not run its check of app.realtylt.com. This is a fault in the watch itself, not proof the CRM is down.",
    did: ALERTED,
    todo: "Open https://app.realtylt.com in a browser. Then Vercel dashboard > realtylt-website > Logs, filtered to /api/cron/health-watch, for the error.",
  },
  {
    family: "crm-down",
    match: /^app\.realtylt\.com answered .* - the CRM is down/,
    what: "app.realtylt.com did not answer an outside visitor (an error code, or no answer at all).",
    did: ALERTED,
    todo: "Open https://app.realtylt.com. If it fails: Vercel dashboard > the CRM project > Deployments (roll back a bad deploy with Instant Rollback) and Logs filtered to 5xx.",
  },
  {
    family: "crm-db-down",
    match: /^app\.realtylt\.com\/api\/health answered/,
    what: "The CRM's own health check says its database layer is down: the login page may still load, but nobody can sign in and the CRM's crons and webhooks fail.",
    did: ALERTED,
    todo: `Open https://app.realtylt.com/api/health to see which part failed. If the Supabase line in this mail is down too, restart the project: ${MANUAL_RESTART}. Otherwise Vercel dashboard > the CRM project > Logs, filtered to /api/health.`,
  },
  {
    family: "snapshot-missing",
    match: /^The health snapshot query returned nothing/,
    what: "The listing-store check idx_health_snapshot() returned nothing: Supabase REST did not answer, or the function is missing.",
    did: ALERTED,
    todo: "If the Supabase line in this mail is down, fix that first. Otherwise run in the SQL editor: select public.idx_health_snapshot(); and read the error it gives.",
  },
  {
    family: "sync-stale",
    match: /^MLS sync is stale/,
    what: "The hourly MLS sync has not finished a run for over 3 hours, so new listings, price changes and status changes are not reaching the site.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_RUNS} then ${SYNC_STATE} If the job ran but failed, Vercel dashboard > realtylt-website > Logs, filtered to /api/cron/idx-sync. Never start a second sync or photo runner by hand while one runs (MLS Grid rate limits).`,
  },
  {
    family: "baseline-incomplete",
    match: /^baseline_complete is false/,
    what: "The listing store believes it is still loading the full MLS feed, so the hourly sync behaves as a baseline load.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_STATE} If no baseline load was started on purpose, the flag was reset by mistake; have a session look at the sync before changing it.`,
  },
  {
    family: "active-floor",
    match: /^Only .* active listings in the store/,
    what: "Far fewer active listings than the feed carries (roughly 25,000 to 30,000): a sync run deactivated rows it should not have, or a load failed.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_STATE} (last_run shows upserted and deactivated). Have a session look before the next sync at :07; do not re-run a baseline by hand (MLS Grid rate limits).`,
  },
  {
    family: "active-swing",
    match: /^Active listings swung /,
    what: "The active-listing count moved more than 15% between two checks: one sync run added or removed a large block of listings.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_STATE} A large deactivated number with no matching market news means the sync misread the feed; have a session look before the next sync at :07.`,
  },
  {
    family: "no-photo-share",
    match: /active listings older than 7 days have no servable photo/,
    what: "More than 4% of active listings older than a week show no photo. The photo mirror inside the hourly sync has probably stopped.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_STATE} (last_run carries the mirror's numbers), and ${SYNC_RUNS} Vercel Logs filtered to /api/cron/idx-sync show mirror errors. The photos_servable recount runs at :27 (cron job idx-photos-servable-refresh).`,
  },
  {
    family: "no-photo-doubled",
    match: /^Stale zero-photo rows doubled/,
    what: "Listings older than a week with no photo doubled since the last check: the photo mirror is falling behind fast.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_STATE} (last_run carries the mirror's numbers). Vercel dashboard > realtylt-website > Logs, filtered to /api/cron/idx-sync, show mirror errors.`,
  },
  {
    family: "feed-frozen",
    match: /^No listing row was touched in 24 hours/,
    what: "No listing changed in 24 hours. A live MLS feed changes hundreds of rows a day, so the sync is not writing.",
    did: ALERTED,
    todo: `In the SQL editor: ${SYNC_RUNS} then ${SYNC_STATE} If the job runs but writes nothing, Vercel Logs filtered to /api/cron/idx-sync show why.`,
  },
  {
    family: "lead-flood",
    match: /leads arrived in the last hour/,
    what: "More than 15 leads in one hour. Normal is a handful a day, so this is most likely form spam.",
    did: ALERTED,
    todo: "Look at them in the SQL editor: select * from public.leads order by created_at desc limit 30; If it is spam, set LEAD_TEST_MODE=1 on Vercel and redeploy (leads stop reaching the CRM), and block the source in Vercel dashboard > realtylt-website > Firewall.",
  },
  {
    family: "signup-flood",
    match: /new accounts in the last hour/,
    what: "More than 10 new accounts in one hour, likely bot registrations.",
    did: ALERTED,
    todo: "Look at them in the SQL editor: select id, email, created_at from auth.users order by created_at desc limit 30; If they are bots, Supabase dashboard > Authentication > Sign In / Providers > turn off Allow new users to sign up (the site's sign-up door closes with it).",
  },
  {
    family: "chat-flood",
    match: /chat sessions in the last hour/,
    what: "More than 100 chat sessions in one hour, likely abuse of the assistant (and its model costs).",
    did: ALERTED,
    todo: "See who in the SQL editor: select session_id, count(*) from public.chat_logs where created_at > now() - interval '1 hour' group by 1 order by 2 desc limit 20; If one source floods, block it in Vercel dashboard > realtylt-website > Firewall.",
  },
];

export function instructionFor(problem: string): Instruction | null {
  return INSTRUCTIONS.find((i) => i.match.test(problem)) ?? null;
}

export function familyOf(problem: string): string | null {
  return instructionFor(problem)?.family ?? null;
}
