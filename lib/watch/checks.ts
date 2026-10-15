/** THE PLATFORM HEALTH WATCH — the judge, pure and unit-tested.
 *
 * Owner, 2026-09-17: "not just idx ... if everything works properly on crm and website weekly
 * and if something is serious or risky notify right away, if its being attacked or some
 * anomaly, but not from n8n - our page should handle that." So the watch runs ON the platform
 * (app/api/cron/health-watch, fired by a Vercel cron every 10 minutes and by Supabase pg_cron
 * hourly) and this file is the part that decides: given the numbers, is anything wrong, is it
 * wrong enough to say so again, and may the watch restart Supabase's API layer itself.
 *
 * WHAT IT JUDGES:
 *  - the SUPABASE API LAYER answered (Auth + REST probed directly, 2026-10-15: that layer died
 *    for five hours while Postgres and pg_cron ran on, and nothing here named it);
 *  - the WEBSITE answered (realtylt.com and the search API, fetched from outside the app);
 *  - the CRM answered (app.realtylt.com);
 *  - the LISTING DATA is healthy (the idx_health_snapshot() aggregates: sync freshness,
 *    active-count swings, zero-photo rows by age, a frozen feed);
 *  - the ATTACK / ANOMALY first cut: floods of leads, signups or chat sessions in one hour.
 *    These are first-party signals (our own tables). Baselines measured 2026-09-17: leads and
 *    signups are ~0/week pre-launch, so the floors are generous; raise them after launch if
 *    real traffic ever trips them honestly.
 *
 * NOT JUDGED HERE: Vercel edge/error logs (no Vercel token in the runtime - the sessions read
 * those through the dashboard/MCP) and email deliverability. The digest says so rather than
 * pretending.
 */

import { familyOf, MANUAL_RESTART } from "./instructions";

export interface HealthSnapshot {
  at?: string;
  watermark?: string;
  baseline_complete?: boolean;
  minutes_since_sync?: number | null;
  last_run?: { upserted?: number; deactivated?: number } | null;
  active_total?: number;
  active_status_active?: number;
  active_coming_soon?: number;
  active_pending?: number;
  active_no_photo?: number;
  active_no_photo_older_7d?: number;
  touched_24h?: number;
  repriced_24h?: number;
  restatused_24h?: number;
}

export interface WatchCounts {
  leads_1h?: number;
  leads_24h?: number;
  signups_1h?: number;
  signups_24h?: number;
  chat_1h?: number;
  chat_24h?: number;
}

export interface ProbeResult {
  ok: boolean;
  status: number;
  ms: number;
  /** Set when no HTTP answer came back: the timeout fired, or the connection failed. */
  error?: "timeout" | "network";
}

/** The Supabase API layer, probed directly (GET /auth/v1/health and one REST read) rather than
 * inferred from the rpc calls: a dead API layer makes those come back null, which reads only
 * as "the snapshot query returned nothing" and never names the real fault. */
export type DbApiState = "up" | "down";

export interface DbApiProbe {
  auth: ProbeResult;
  rest: ProbeResult;
  state: DbApiState;
}

/** What the watch did about a down API layer: decideRestart() decides, the route acts. */
export type RestartOutcome =
  | { requested: true; requestedAt: string; status: string; httpStatus: number }
  | { requested: false; why: string; status: string | null };

export interface WatchInput {
  snap: HealthSnapshot | null;
  counts: WatchCounts | null;
  site: ProbeResult | null;
  search: ProbeResult | null;
  crm: ProbeResult | null;
  /** What the previous run stored (site_watch_state.state.prev). */
  prev: { active_total?: number; active_no_photo_older_7d?: number } | null;
  /** The Supabase API layer; when the first probe read down, the confirming probe 30 s later. */
  dbApi?: DbApiProbe | null;
  /** What the watch did about a down API layer (absent while it is up). */
  restart?: RestartOutcome | null;
  /** Which CRM URL answered: its /api/health, or the login page while that route is not live
   * (404). On 2026-10-15 the login page answered 200 all through the outage while nobody could
   * sign in, so a login-page answer is labelled as exactly that. */
  crmVia?: "health" | "login-page";
  /** The database timings the CRM's /api/health reported, in ms. */
  crmDb?: { auth?: number; rest?: number } | null;
}

export const THRESHOLDS = {
  syncStaleMinutes: 180,
  activeFloor: 5000,
  activeSwing: 0.15,
  noPhotoShare: 0.04,
  slowSiteMs: 8000,
  leadsPerHour: 15,
  signupsPerHour: 10,
  chatPerHour: 100,
  realertMs: 6 * 3600 * 1000,
  dbApiTimeoutMs: 20_000,
  dbApiRecheckMs: 30_000,
} as const;

export interface Judgement {
  problems: string[];
  /** True when at least one problem is the site, the CRM or Supabase's API layer being down,
   * or a flood — the "right away" class the owner named, as opposed to data drift. */
  critical: boolean;
  facts: [string, string][];
}

const n = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : Number(v));

/** Down only when BOTH legs failed to answer: a timeout, no connection, or a 5xx (the gateway's
 * 522 HTML page included). A 401 or 404 means the edge and the service answered: up. */
export function classifyDbApi(auth: ProbeResult, rest: ProbeResult): DbApiState {
  const dead = (p: ProbeResult) => p.status === 0 || p.status >= 500;
  return dead(auth) && dead(rest) ? "down" : "up";
}

/** May the watch restart the project? Only when the API layer read down twice 30 s apart, a
 * management token is set, and the control plane says the project is running (on 2026-10-15
 * it read ACTIVE_HEALTHY while the API layer was dead - the control plane does not see this
 * failure). Any other control-plane state means something is already happening to the
 * project, or a restart cannot help; the watch then says why and leaves it to a person. */
export function decideRestart(input: {
  dbApi: DbApiState;
  secondProbe: DbApiState | null;
  status: string | null;
  tokenPresent: boolean;
}): { restart: boolean; why: string } {
  const { dbApi, secondProbe, status, tokenPresent } = input;
  if (dbApi === "up") return { restart: false, why: "The API layer answered." };
  if (secondProbe !== "down")
    return {
      restart: false,
      why: secondProbe === "up" ? "The API layer answered again on the second probe 30 s later." : "The second probe did not run.",
    };
  if (!tokenPresent)
    return {
      restart: false,
      why: `The watch could not restart it: set SUPABASE_MANAGEMENT_TOKEN and SUPABASE_PROJECT_REF on Vercel, or restart by hand: ${MANUAL_RESTART}.`,
    };
  if (status === "ACTIVE_HEALTHY" || status === "ACTIVE_UNHEALTHY")
    return { restart: true, why: `The control plane reads ${status} while the API layer does not answer.` };
  if (!status)
    return {
      restart: false,
      why: `The watch did not restart it: the Supabase control plane did not say what state the project is in. Restart by hand: ${MANUAL_RESTART}.`,
    };
  if (status === "RESTARTING" || status === "COMING_UP")
    return {
      restart: false,
      why: `The watch did not restart it: the control plane reports ${status}, so a restart is already under way. The next check in 10 minutes looks again; if it is still down then, restart by hand: ${MANUAL_RESTART}.`,
    };
  if (status === "PAUSED" || status === "INACTIVE" || status === "PAUSING")
    return {
      restart: false,
      why: `The watch did not restart it: the control plane reports ${status} - the project is paused, which a restart does not undo. Restore it from the project's page in the Supabase dashboard.`,
    };
  return {
    restart: false,
    why: `The watch did not restart it: the control plane reports ${status}, a state in which a restart could interfere. Check the project in the Supabase dashboard; if nothing is in progress, restart by hand: ${MANUAL_RESTART}.`,
  };
}

const leg = (p: ProbeResult): string =>
  p.status ? String(p.status) : p.error === "timeout" ? `timeout after ${THRESHOLDS.dbApiTimeoutMs / 1000} s` : "no answer";

function restartLine(r: RestartOutcome | null): string {
  if (!r) return "";
  if (!r.requested) return ` ${r.why}`;
  if (r.httpStatus >= 200 && r.httpStatus < 300)
    return ` The watch asked Supabase to restart the project at ${r.requestedAt.slice(11, 16)} UTC (the control plane read ${r.status}; the restart call answered ${r.httpStatus}). The next check in 10 minutes looks again.`;
  return ` The watch asked Supabase to restart the project, but the restart call answered ${r.httpStatus || "nothing"}: restart by hand: ${MANUAL_RESTART}.`;
}

export function judge(input: WatchInput): Judgement {
  const { snap, counts, site, search, crm, prev, dbApi, restart } = input;
  const problems: string[] = [];
  let critical = false;
  const bad = (msg: string, isCritical = false) => {
    problems.push(msg);
    if (isCritical) critical = true;
  };

  // Supabase's API layer first: when it is down, most lines below are its consequences (the
  // snapshot and counts come back null, search fails, nobody can log in to the CRM).
  if (dbApi?.state === "down")
    bad(
      `Supabase API layer is down (Auth: ${leg(dbApi.auth)}, REST: ${leg(dbApi.rest)}) - logins, the CRM's crons and the website's listings all fail until it is restarted.${restartLine(restart ?? null)}`,
      true,
    );

  // The platform itself. A 429 on the public probes is Vercel's Bot Protection CHALLENGING
  // this server-side fetch (live since 2026-09-17; only real browsers pass) - the edge
  // answered, which is what an up/down probe can honestly measure from here. It is "up
  // (bot-challenged)" in the facts, never an alarm; 5xx, nothing, and slowness still are.
  const challenged = (p: ProbeResult | null) => !!p && p.status === 429;
  if (!site) bad("The website probe did not run.", true);
  else if (!site.ok && !challenged(site)) bad(`realtylt.com answered ${site.status || "nothing"} - the website is down or erroring.`, true);
  else if (site.ms > THRESHOLDS.slowSiteMs) bad(`realtylt.com took ${(site.ms / 1000).toFixed(1)}s to answer (floor ${THRESHOLDS.slowSiteMs / 1000}s).`, true);
  if (search && !search.ok && !challenged(search)) bad(`The listing search API answered ${search.status || "nothing"} - visitors cannot search.`, true);
  if (!crm) bad("The CRM probe did not run.", true);
  else if (!crm.ok && input.crmVia === "health" && crm.status === 503)
    bad("app.realtylt.com/api/health answered 503 - the CRM's database layer is down: the login page may load, but nobody can sign in and its crons fail.", true);
  else if (!crm.ok) bad(`app.realtylt.com answered ${crm.status || "nothing"} - the CRM is down.`, true);

  // The listing data.
  if (!snap) {
    bad("The health snapshot query returned nothing: idx_health_snapshot() is missing or unreachable.");
  } else {
    const min = n(snap.minutes_since_sync);
    if (!Number.isFinite(min) || min > THRESHOLDS.syncStaleMinutes)
      bad(`MLS sync is stale: last sync ${Number.isFinite(min) ? `${min} minutes` : "an unknown time"} ago (watermark ${snap.watermark ?? "unknown"}). The cron is hourly.`);
    if (snap.baseline_complete === false) bad("baseline_complete is false: the store believes it is mid-baseline.");
    const active = n(snap.active_total);
    if (!(active >= THRESHOLDS.activeFloor)) bad(`Only ${active} active listings in the store; the feed carries roughly 25,000 to 30,000.`);
    if (prev && n(prev.active_total) > 0) {
      const swing = (active - n(prev.active_total)) / n(prev.active_total);
      if (Math.abs(swing) > THRESHOLDS.activeSwing)
        bad(`Active listings swung ${(swing * 100).toFixed(1)}% since the last check (${prev.active_total} to ${active}).`);
    }
    const oldNoPhoto = n(snap.active_no_photo_older_7d);
    if (active > 0 && oldNoPhoto / active > THRESHOLDS.noPhotoShare)
      bad(`${oldNoPhoto} active listings older than 7 days have no servable photo (${((oldNoPhoto / active) * 100).toFixed(1)}% of actives; floor ${THRESHOLDS.noPhotoShare * 100}%). The photo mirror may have stopped.`);
    if (prev && n(prev.active_no_photo_older_7d) > 0 && oldNoPhoto > n(prev.active_no_photo_older_7d) * 2 && oldNoPhoto - n(prev.active_no_photo_older_7d) > 100)
      bad(`Stale zero-photo rows doubled since the last check (${prev.active_no_photo_older_7d} to ${oldNoPhoto}).`);
    if (n(snap.touched_24h) === 0) bad("No listing row was touched in 24 hours: the feed is frozen or the sync is not writing.");
  }

  // The flood / anomaly first cut.
  if (counts) {
    if (n(counts.leads_1h) > THRESHOLDS.leadsPerHour)
      bad(`${counts.leads_1h} leads arrived in the last hour (normal is a handful a day) - possible form spam. LEAD_TEST_MODE and the honeypot are the dials.`, true);
    if (n(counts.signups_1h) > THRESHOLDS.signupsPerHour)
      bad(`${counts.signups_1h} new accounts in the last hour - possible bot registrations. Consider pausing signupOpen.`, true);
    if (n(counts.chat_1h) > THRESHOLDS.chatPerHour)
      bad(`${counts.chat_1h} chat sessions in the last hour - possible abuse of the assistant.`, true);
  }

  return { problems, critical, facts: facts(input) };
}

export function facts(input: WatchInput): [string, string][] {
  const { snap, counts, site, search, crm } = input;
  const s = snap ?? {};
  const c = counts ?? {};
  const probe = (p: ProbeResult | null) =>
    p ? `${p.ok ? "up" : p.status === 429 ? "up (bot-challenged)" : "DOWN"} (${p.status}, ${p.ms}ms)` : "not probed";
  const num = (v: unknown) => (v == null ? "?" : Number(v).toLocaleString("en-US"));
  const crmFact =
    input.crmVia === "login-page"
      ? `${probe(crm)} - CRM answered (login page only)`
      : input.crmVia === "health" && crm?.ok && input.crmDb
        ? `${probe(crm)} - database: auth ${input.crmDb.auth ?? "?"}ms, rest ${input.crmDb.rest ?? "?"}ms`
        : probe(crm);
  const db = input.dbApi;
  const legFact = (p: ProbeResult) => (p.status ? `${p.status} in ${p.ms}ms` : leg(p));
  return [
    ["Website", probe(site)],
    ["Listing search API", probe(search)],
    ["CRM (app.realtylt.com)", crmFact],
    ["Supabase API (Auth + REST)", db ? `${db.state === "up" ? "up" : "DOWN"} (Auth ${legFact(db.auth)}, REST ${legFact(db.rest)})` : "not probed"],
    ["Last MLS sync", s.minutes_since_sync == null ? "unknown" : `${s.minutes_since_sync} min ago (watermark ${s.watermark ?? "?"})`],
    ["Active listings", `${num(s.active_total)} (${num(s.active_status_active)} active, ${num(s.active_coming_soon)} coming soon, ${num(s.active_pending)} pending)`],
    ["No servable photo", `${num(s.active_no_photo)} total, ${num(s.active_no_photo_older_7d)} older than 7 days`],
    ["Touched in 24h", `${num(s.touched_24h)} rows; ${num(s.repriced_24h)} re-priced, ${num(s.restatused_24h)} status changes`],
    ["Leads", `${num(c.leads_1h)} last hour, ${num(c.leads_24h)} last 24h`],
    ["New accounts", `${num(c.signups_1h)} last hour, ${num(c.signups_24h)} last 24h`],
    ["Chat sessions", `${num(c.chat_1h)} last hour, ${num(c.chat_24h)} last 24h`],
  ];
}

/** The throttle's key: the problem FAMILIES (lib/watch/instructions.ts), not the full lines.
 * Most lines carry live numbers ("last sync 314 minutes ago"), so a key on the text changed
 * every run and the 6 hour throttle never muted a standing problem - with the 10-minute
 * trigger that would have been a mail every 10 minutes. A line no family claims keys as
 * itself. */
export function alertKey(problems: string[]): string {
  return problems.map((p) => familyOf(p) ?? p).join("|");
}

/** The same-problems re-alert throttle: a problem set alerts at most every 6 hours, but a set
 * that CHANGED (new problem appeared, one resolved) alerts immediately. */
export function shouldAlert(
  problems: string[],
  state: { lastAlertKey?: string | null; lastAlertAt?: number | null },
  now: number,
): boolean {
  if (problems.length === 0) return false;
  const key = alertKey(problems);
  if (state.lastAlertKey === key && state.lastAlertAt && now - state.lastAlertAt < THRESHOLDS.realertMs) return false;
  return true;
}
