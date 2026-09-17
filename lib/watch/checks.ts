/** THE PLATFORM HEALTH WATCH — the judge, pure and unit-tested.
 *
 * Owner, 2026-09-17: "not just idx ... if everything works properly on crm and website weekly
 * and if something is serious or risky notify right away, if its being attacked or some
 * anomaly, but not from n8n - our page should handle that." So the watch runs ON the platform
 * (app/api/cron/health-watch, fired by Supabase pg_cron like the hourly MLS sync) and this file
 * is the part that decides: given the numbers, is anything wrong, and is it wrong enough to
 * say so again.
 *
 * WHAT IT JUDGES:
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
}

export interface WatchInput {
  snap: HealthSnapshot | null;
  counts: WatchCounts | null;
  site: ProbeResult | null;
  search: ProbeResult | null;
  crm: ProbeResult | null;
  /** What the previous run stored (site_watch_state.state.prev). */
  prev: { active_total?: number; active_no_photo_older_7d?: number } | null;
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
} as const;

export interface Judgement {
  problems: string[];
  /** True when at least one problem is the site or CRM being down or a flood — the "right
   * away" class the owner named, as opposed to data drift. */
  critical: boolean;
  facts: [string, string][];
}

const n = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : Number(v));

export function judge(input: WatchInput): Judgement {
  const { snap, counts, site, search, crm, prev } = input;
  const problems: string[] = [];
  let critical = false;
  const bad = (msg: string, isCritical = false) => {
    problems.push(msg);
    if (isCritical) critical = true;
  };

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
  return [
    ["Website", probe(site)],
    ["Listing search API", probe(search)],
    ["CRM (app.realtylt.com)", probe(crm)],
    ["Last MLS sync", s.minutes_since_sync == null ? "unknown" : `${s.minutes_since_sync} min ago (watermark ${s.watermark ?? "?"})`],
    ["Active listings", `${num(s.active_total)} (${num(s.active_status_active)} active, ${num(s.active_coming_soon)} coming soon, ${num(s.active_pending)} pending)`],
    ["No servable photo", `${num(s.active_no_photo)} total, ${num(s.active_no_photo_older_7d)} older than 7 days`],
    ["Touched in 24h", `${num(s.touched_24h)} rows; ${num(s.repriced_24h)} re-priced, ${num(s.restatused_24h)} status changes`],
    ["Leads", `${num(c.leads_1h)} last hour, ${num(c.leads_24h)} last 24h`],
    ["New accounts", `${num(c.signups_1h)} last hour, ${num(c.signups_24h)} last 24h`],
    ["Chat sessions", `${num(c.chat_1h)} last hour, ${num(c.chat_24h)} last 24h`],
  ];
}

/** The same-problems re-alert throttle: a problem set alerts at most every 6 hours, but a set
 * that CHANGED (new problem appeared, one resolved) alerts immediately. */
export function shouldAlert(
  problems: string[],
  state: { lastAlertKey?: string | null; lastAlertAt?: number | null },
  now: number,
): boolean {
  if (problems.length === 0) return false;
  const key = problems.join("|");
  if (state.lastAlertKey === key && state.lastAlertAt && now - state.lastAlertAt < THRESHOLDS.realertMs) return false;
  return true;
}
