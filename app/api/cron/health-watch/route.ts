import { NextResponse } from "next/server";
import {
  alertKey,
  classifyDbApi,
  decideRestart,
  facts,
  judge,
  shouldAlert,
  THRESHOLDS,
  type DbApiProbe,
  type ProbeResult,
  type RestartOutcome,
  type WatchInput,
} from "@/lib/watch/checks";
import { composeAlert, composeDigest } from "@/lib/watch/email";
import { sendWatchMail } from "@/lib/watch/send";

/** THE PLATFORM HEALTH WATCH (round 51, owner-directed 2026-09-17: the watching moves off n8n,
 * "our page should handle that", and it covers the CRM and the website, not just the listing
 * data - weekly all-clear, IMMEDIATELY when something is serious, attacked or anomalous).
 *
 * Fired by Supabase pg_cron (hourly at :23 plain, Mondays 11:23 UTC with ?mode=digest) AND,
 * since 2026-10-15, by a Vercel cron every 10 minutes (vercel.json). The second trigger exists
 * because the first lives inside the thing it watches: from 14:15 to 19:13 ET on 2026-10-15
 * Supabase's API layer died, pg_net's calls out of the project got no answer, and this watch
 * never ran. The two triggers do not double-alert: both read the same site_watch_state, and
 * the judge's 6 hour throttle keys on the problem families (alertKey in checks.ts).
 * Vercel docs, read 2026-10-15:
 *  - https://vercel.com/docs/cron-jobs/usage-and-pricing - "Pro 100 cron jobs Once per minute
 *    Per-minute" (minimum interval; Hobby is "Once per day"), so a 10-minute schedule needs the Pro team.
 *  - https://vercel.com/docs/cron-jobs - "To trigger a cron job, Vercel makes an HTTP GET
 *    request to your project's production deployment URL, using the path provided in your
 *    project's vercel.json file."
 *  - https://vercel.com/docs/cron-jobs/manage-cron-jobs - "The value of the variable will be
 *    automatically sent as an Authorization header when Vercel invokes your cron job." (the
 *    variable is CRON_SECRET), so the bearer check below admits both triggers unchanged.
 * Auth: `Authorization: Bearer ${CRON_SECRET}` exactly like /api/cron/idx-sync.
 *
 * WHAT RUNS HERE: probes of realtylt.com, the search API and app.realtylt.com from the public
 * edge; a direct probe of Supabase's API layer (Auth health + one REST read); the listing
 * store's idx_health_snapshot(); site_watch_counts() for the flood signals.
 *
 * TAKING CARE OF IT: when the API layer reads down, the watch looks again 30 s later, and if
 * it is still down it may restart the project through the Supabase Management API
 * (decideRestart in checks.ts says when; SUPABASE_MANAGEMENT_TOKEN + SUPABASE_PROJECT_REF
 * enable it). A restart it requested is always mailed, whatever the throttle says.
 * The judge and its thresholds live in lib/watch/checks.ts (unit-tested); the state that makes
 * swings and re-alert throttling possible lives in site_watch_state (id=1, jsonb). Alerts go
 * through lib/watch/send.ts (the CRM's ops-alert door since 51e; ARMED on prod).
 *
 * The route never throws for a failed probe - a down site is a REPORT, not an exception; only
 * a bad secret or a broken store answers non-200. */

export const dynamic = "force-dynamic";
/** Worst case when the API layer is down: about 20 s of first probes, the 30 s wait, 20 s for
 * the second probe (the control-plane read runs beside it), 10 s for the restart call and
 * 25 s for a mail with its retry = about 105 s; the state write is skipped while REST is
 * dead. https://vercel.com/docs/functions/configuring-functions/duration (read 2026-10-15):
 * "Pro 300s (5 minutes) 800s" (default, maximum), so 120 is inside the Pro limit. */
export const maxDuration = 120;

const SITE = "https://realtylt.com";
const CRM = "https://app.realtylt.com";

function restConfig(): { root: string; base: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const root = url.replace(/\/+$/, "");
  return { root, base: `${root}/rest/v1`, key };
}

async function probe(url: string, init?: RequestInit, timeoutMs = 12_000): Promise<ProbeResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { ...init, redirect: "follow", signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
    // Read a little so a hung body counts as slow rather than as instantly "up".
    await res.arrayBuffer().catch(() => undefined);
    return { ok: res.ok, status: res.status, ms: Date.now() - t0 };
  } catch (e) {
    const error = (e as { name?: unknown } | null)?.name === "TimeoutError" ? "timeout" : "network";
    return { ok: false, status: 0, ms: Date.now() - t0, error };
  }
}

/** Supabase's API layer, asked directly with the service key, 20 s per leg. A 522 HTML page
 * from the gateway is down; a 401/404 is the edge and the service answering (classifyDbApi). */
async function probeDbApi(cfg: { root: string; key: string }): Promise<DbApiProbe> {
  const init = { headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` } };
  const [auth, rest] = await Promise.all([
    probe(`${cfg.root}/auth/v1/health`, init, THRESHOLDS.dbApiTimeoutMs),
    probe(`${cfg.root}/rest/v1/idx_sync_state?select=id&limit=1`, init, THRESHOLDS.dbApiTimeoutMs),
  ]);
  return { auth, rest, state: classifyDbApi(auth, rest) };
}

/** The CRM: its own GET /api/health (a CRM builder is adding it, 2026-10-15: 200
 * {ok:true, db:{auth:ms, rest:ms}}, or 503 when its database layer is down). Until that route
 * is live it answers 404 (or the login page, through a sign-in redirect), and the watch falls
 * back to probing the login page, labelled as such in the facts. */
async function probeCrm(): Promise<{ crm: ProbeResult; via: "health" | "login-page"; db: { auth?: number; rest?: number } | null }> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${CRM}/api/health`, { redirect: "follow", signal: AbortSignal.timeout(12_000), cache: "no-store" });
    const body = await res.text().catch(() => "");
    const ms = Date.now() - t0;
    if (!res.ok && res.status !== 404) return { crm: { ok: false, status: res.status, ms }, via: "health", db: null };
    if (res.ok) {
      let j: { ok?: unknown; db?: { auth?: unknown; rest?: unknown } } | null = null;
      try {
        j = JSON.parse(body);
      } catch {
        /* not the health JSON: the login page behind a redirect */
      }
      if (j?.ok === true) {
        const msOf = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
        return { crm: { ok: true, status: res.status, ms }, via: "health", db: { auth: msOf(j.db?.auth), rest: msOf(j.db?.rest) } };
      }
    }
  } catch (e) {
    const error = (e as { name?: unknown } | null)?.name === "TimeoutError" ? "timeout" : "network";
    return { crm: { ok: false, status: 0, ms: Date.now() - t0, error }, via: "health", db: null };
  }
  return { crm: await probe(`${CRM}/`), via: "login-page", db: null };
}

/** The Supabase Management API, bearer-auth with a personal access token
 * (https://supabase.com/docs/reference/api/introduction: "All API requests require an access
 * token to be included in the Authorization header: Authorization Bearer <access_token>").
 *  - GET /v1/projects/{ref} answers the project with `status` (ACTIVE_HEALTHY,
 *    ACTIVE_UNHEALTHY, COMING_UP, RESTARTING, INACTIVE, ...):
 *    https://supabase.com/docs/reference/api/v1-get-project ("Gets a specific project that
 *    belongs to the authenticated user"; scope projects:read). On 2026-10-15 it read
 *    ACTIVE_HEALTHY while the API layer was dead: the control plane does not see this failure.
 *  - POST /v1/projects/{ref}/restart answers 200 {}:
 *    https://supabase.com/docs/reference/api/v1-restart-a-project ("Restarts the given
 *    project"; scope projects:write).
 * Both are off unless the owner sets SUPABASE_MANAGEMENT_TOKEN and SUPABASE_PROJECT_REF. */
const MANAGEMENT = "https://api.supabase.com/v1/projects";

function management(): { token: string; ref: string } | null {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const ref = process.env.SUPABASE_PROJECT_REF;
  return token && ref ? { token, ref } : null;
}

async function controlPlaneStatus(m: { token: string; ref: string }): Promise<string | null> {
  try {
    const res = await fetch(`${MANAGEMENT}/${encodeURIComponent(m.ref)}`, {
      headers: { Authorization: `Bearer ${m.token}` },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const project = (await res.json()) as { status?: unknown };
    return typeof project.status === "string" ? project.status : null;
  } catch {
    return null;
  }
}

async function requestRestart(m: { token: string; ref: string }): Promise<number> {
  try {
    const res = await fetch(`${MANAGEMENT}/${encodeURIComponent(m.ref)}/restart`, {
      method: "POST",
      headers: { Authorization: `Bearer ${m.token}` },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    return res.status;
  } catch {
    return 0;
  }
}

async function rpc<T>(cfg: { base: string; key: string }, fn: string): Promise<T | null> {
  try {
    const res = await fetch(`${cfg.base}/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface WatchState {
  prev?: { active_total?: number; active_no_photo_older_7d?: number; snap_missing?: boolean } | null;
  lastAlertKey?: string | null;
  lastAlertAt?: number | null;
  lastReport?: unknown;
}

async function readState(cfg: { base: string; key: string }): Promise<WatchState> {
  try {
    const res = await fetch(`${cfg.base}/site_watch_state?id=eq.1&select=state`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return {};
    const rows = (await res.json()) as { state: WatchState }[];
    return rows[0]?.state ?? {};
  } catch {
    return {};
  }
}

async function writeState(cfg: { base: string; key: string }, state: WatchState): Promise<void> {
  try {
    await fetch(`${cfg.base}/site_watch_state`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([{ id: 1, state, updated_at: new Date().toISOString() }]),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    /* state is a convenience; the next run recomputes */
  }
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const cfg = restConfig();
  if (!cfg) return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 500 });

  const mode = new URL(req.url).searchParams.get("mode") === "digest" ? "digest" : "check";

  const [site, search, crmProbe, firstDb, snap, counts, state] = await Promise.all([
    probe(`${SITE}/`),
    probe(`${SITE}/api/idx/search?limit=1`),
    probeCrm(),
    probeDbApi(cfg),
    rpc<WatchInput["snap"]>(cfg, "idx_health_snapshot"),
    rpc<WatchInput["counts"]>(cfg, "site_watch_counts"),
    readState(cfg),
  ]);

  // The API layer read down: look once more 30 s later (a blip is not an outage) with the
  // control plane read beside it, then decideRestart says whether to act - at most one
  // restart call per invocation.
  let dbApi = firstDb;
  let restart: RestartOutcome | null = null;
  if (firstDb.state === "down") {
    const mgmt = management();
    await new Promise((resolve) => setTimeout(resolve, THRESHOLDS.dbApiRecheckMs));
    const [second, status] = await Promise.all([probeDbApi(cfg), mgmt ? controlPlaneStatus(mgmt) : Promise.resolve(null)]);
    dbApi = second;
    const decision = decideRestart({ dbApi: firstDb.state, secondProbe: second.state, status, tokenPresent: !!mgmt });
    if (decision.restart && mgmt) {
      const requestedAt = new Date().toISOString();
      restart = { requested: true, requestedAt, status: status ?? "unknown", httpStatus: await requestRestart(mgmt) };
    } else if (second.state === "down") {
      restart = { requested: false, why: decision.why, status };
    }
  }

  const input: WatchInput = {
    snap,
    counts,
    site,
    search,
    crm: crmProbe.crm,
    crmVia: crmProbe.via,
    crmDb: crmProbe.db,
    dbApi,
    restart,
    prev: state.prev ?? null,
  };
  const verdict = judge(input);
  const now = Date.now();

  let mail: string = "not-needed";
  if (mode === "digest") {
    const m = composeDigest(verdict.problems, verdict.facts);
    mail = await sendWatchMail(m.subject, m.html, m.text);
  } else if (restart?.requested || shouldAlert(verdict.problems, state, now)) {
    // A restart the watch requested is ALWAYS mailed, throttle or not: the owner must know it acted.
    const m = composeAlert(verdict.problems, verdict.facts, verdict.critical);
    mail = await sendWatchMail(m.subject, m.html, m.text);
    // "maybe-sent" (the door did not answer in 25 s) counts as sent for the throttle: the
    // door was most likely sending, and a re-send 10 minutes later would be the duplicate.
    if (mail.startsWith("sent") || mail.startsWith("maybe-sent")) {
      state.lastAlertKey = alertKey(verdict.problems);
      state.lastAlertAt = now;
    }
  } else if (verdict.problems.length === 0) {
    state.lastAlertKey = null;
    state.lastAlertAt = null;
  }

  const report = {
    ok: true,
    mode,
    at: new Date(now).toISOString(),
    problems: verdict.problems,
    critical: verdict.critical,
    mail,
    restart,
    dbApi: { first: firstDb, second: firstDb.state === "down" ? dbApi : null },
    facts: Object.fromEntries(facts(input)),
  };
  state.prev = {
    active_total: snap?.active_total,
    active_no_photo_older_7d: snap?.active_no_photo_older_7d,
    snap_missing: snap == null,
  };
  state.lastReport = report;
  // With the API layer down the write cannot land; skipping it keeps its 10 s inside maxDuration.
  if (dbApi.state === "up") await writeState(cfg, state);

  return NextResponse.json(report);
}
