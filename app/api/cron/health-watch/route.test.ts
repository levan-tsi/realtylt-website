import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { alertKey } from "@/lib/watch/checks";
import { GET } from "./route";

/** The watch end to end with every outside call mocked: nothing here reaches Supabase, the
 * Management API, the CRM or the live site. */

const SB = "https://proj.supabase.co";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const gateway522 = () => new Response("<html><title>522: Connection timed out</title></html>", { status: 522, headers: { "content-type": "text/html" } });

const SNAP = {
  watermark: "2026-10-15T23:00:00Z",
  baseline_complete: true,
  minutes_since_sync: 16,
  active_total: 27_400,
  active_status_active: 17_700,
  active_coming_soon: 120,
  active_pending: 9_500,
  active_no_photo: 47,
  active_no_photo_older_7d: 37,
  touched_24h: 1_600,
  repriced_24h: 3,
  restatused_24h: 5,
};
const COUNTS = { leads_1h: 0, leads_24h: 2, signups_1h: 0, signups_24h: 1, chat_1h: 1, chat_24h: 6 };

interface Platform {
  /** How many rounds of the Auth + REST probe answer 522 (Infinity = the whole outage). */
  apiDownRounds?: number;
  /** The CRM's /api/health: not live yet (404), live, or reporting its database down. */
  crmHealth?: "missing" | "ok" | 503;
  controlPlane?: string;
  restartStatus?: number;
  /** site_watch_state as stored (readable even in an outage, to test the throttle override). */
  state?: unknown;
  /** The ops-alert door never answers (its 25 s limit fires). */
  doorTimesOut?: boolean;
  /** idx_health_snapshot() answers 504 (the query passed its limit) while the API layer is up. */
  snapMissing?: boolean;
}

interface Call {
  url: string;
  method: string;
  authorization: string | null;
  body?: string;
}

function stubPlatform(opts: Platform) {
  const calls: Call[] = [];
  const unexpected: string[] = [];
  let authRounds = 0;
  let restRounds = 0;
  const outage = (opts.apiDownRounds ?? 0) === Infinity;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      calls.push({ url, method, authorization: new Headers(init?.headers).get("authorization"), body: typeof init?.body === "string" ? init.body : undefined });
      if (url === "https://realtylt.com/" || url === "https://realtylt.com/api/idx/search?limit=1") return new Response("ok");
      if (url === "https://app.realtylt.com/api/health") {
        if (opts.crmHealth === "ok") return json({ ok: true, db: { auth: 12, rest: 9 } });
        if (opts.crmHealth === 503) return json({ ok: false }, 503);
        return new Response("Not Found", { status: 404 });
      }
      if (url === "https://app.realtylt.com/") return new Response("<html>Sign in</html>");
      if (url === "https://app.realtylt.com/api/site/ops-alert") {
        if (opts.doorTimesOut) throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
        return json({ ok: true, status: "sent" });
      }
      if (url === "https://api.supabase.com/v1/projects/wpfmhmnceflfruhssqqb/restart") return json({}, opts.restartStatus ?? 200);
      if (url === "https://api.supabase.com/v1/projects/wpfmhmnceflfruhssqqb") return json({ ref: "wpfmhmnceflfruhssqqb", status: opts.controlPlane ?? "ACTIVE_HEALTHY" });
      if (url === `${SB}/auth/v1/health`) return ++authRounds <= (opts.apiDownRounds ?? 0) ? gateway522() : json({ name: "GoTrue" });
      if (url === `${SB}/rest/v1/idx_sync_state?select=id&limit=1`) return ++restRounds <= (opts.apiDownRounds ?? 0) ? gateway522() : json([{ id: 1 }]);
      if (url === `${SB}/rest/v1/site_watch_state?id=eq.1&select=state`) return opts.state ? json([{ state: opts.state }]) : outage ? gateway522() : json([]);
      if (url === `${SB}/rest/v1/site_watch_state` && method === "POST") return outage ? gateway522() : new Response(null, { status: 201 });
      if (url === `${SB}/rest/v1/rpc/idx_health_snapshot`) return outage ? gateway522() : opts.snapMissing ? new Response("statement timeout", { status: 504 }) : json(SNAP);
      if (url === `${SB}/rest/v1/rpc/site_watch_counts`) return outage ? gateway522() : json(COUNTS);
      unexpected.push(`${method} ${url}`);
      return new Response("unexpected", { status: 599 });
    }),
  );
  return { calls, unexpected };
}

async function runWatch() {
  const pending = GET(new Request("https://realtylt-website.vercel.app/api/cron/health-watch", { headers: { authorization: "Bearer cron-secret" } }));
  for (let i = 0; i < 20; i++) await vi.advanceTimersByTimeAsync(5_000);
  const res = await pending;
  return { status: res.status, report: await res.json() };
}

const NO_TOKEN =
  "The watch could not restart it: set SUPABASE_MANAGEMENT_TOKEN and SUPABASE_PROJECT_REF on Vercel, or restart by hand: Supabase dashboard > project > Settings > General > Restart project.";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-15T23:23:00Z"));
  vi.stubEnv("CRON_SECRET", "cron-secret");
  vi.stubEnv("SUPABASE_URL", SB);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
  vi.stubEnv("SITE_EMAIL_SECRET", "site-secret");
  vi.stubEnv("SUPABASE_MANAGEMENT_TOKEN", "sbp_test");
  vi.stubEnv("SUPABASE_PROJECT_REF", "wpfmhmnceflfruhssqqb");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const sent = (calls: Call[]) => calls.filter((c) => c.url === "https://app.realtylt.com/api/site/ops-alert").map((c) => JSON.parse(c.body!));

describe("the health watch route", () => {
  it("an outage with the token: probes twice 30 s apart, restarts once, mails URGENT, skips the dead state write", async () => {
    const { calls, unexpected } = stubPlatform({ apiDownRounds: Infinity });
    const { status, report } = await runWatch();
    expect(status).toBe(200);
    expect(unexpected).toEqual([]);
    expect(calls.filter((c) => c.url === `${SB}/auth/v1/health`)).toHaveLength(2);
    const authProbe = calls.find((c) => c.url === `${SB}/auth/v1/health`)!;
    expect(authProbe.authorization).toBe("Bearer service-key");
    const restarts = calls.filter((c) => c.url.endsWith("/restart"));
    expect(restarts).toHaveLength(1);
    expect(restarts[0]).toMatchObject({ method: "POST", authorization: "Bearer sbp_test" });
    expect(report.restart).toEqual({ requested: true, requestedAt: "2026-10-15T23:23:30.000Z", status: "ACTIVE_HEALTHY", httpStatus: 200 });
    expect(report.problems[0]).toBe(
      "Supabase API layer is down (Auth: 522, REST: 522) - logins, the CRM's crons and the website's listings all fail until it is restarted. The watch asked Supabase to restart the project at 23:23 UTC (the control plane read ACTIVE_HEALTHY; the restart call answered 200). The next check in 10 minutes looks again.",
    );
    expect(report.critical).toBe(true);
    expect(report.mail).toBe("sent");
    const [mail] = sent(calls);
    expect(mail.subject).toMatch(/^URGENT - RealtyLT watch:/);
    expect(mail.html).toContain("What to do:");
    expect(mail.text).toContain("Settings > General > Restart project");
    expect(calls.some((c) => c.url === `${SB}/rest/v1/site_watch_state` && c.method === "POST")).toBe(false);
    expect(report.facts["CRM (app.realtylt.com)"]).toMatch(/^up \(200, \d+ms\) - CRM answered \(login page only\)$/);
    expect(report.dbApi.first.state).toBe("down");
    expect(report.dbApi.second.state).toBe("down");
  });

  it("a restart it requested is mailed even when the throttle would have muted the same problems", async () => {
    const state = { lastAlertKey: "db-api-down|snapshot-missing", lastAlertAt: Date.parse("2026-10-15T23:13:00Z") };
    const { calls } = stubPlatform({ apiDownRounds: Infinity, state });
    const { report } = await runWatch();
    expect(alertKey(report.problems)).toBe(state.lastAlertKey); // the throttle matched...
    expect(report.restart.requested).toBe(true);
    expect(report.mail).toBe("sent"); // ...and the mail went anyway
    expect(sent(calls)).toHaveLength(1);
  });

  it("without the token: no Management API call, and the line says how to fix it", async () => {
    vi.stubEnv("SUPABASE_MANAGEMENT_TOKEN", "");
    const { calls } = stubPlatform({ apiDownRounds: Infinity });
    const { report } = await runWatch();
    expect(calls.filter((c) => c.url.startsWith("https://api.supabase.com"))).toEqual([]);
    expect(report.problems[0].endsWith(NO_TOKEN)).toBe(true);
    expect(report.restart).toEqual({ requested: false, why: NO_TOKEN, status: null });
    expect(report.mail).toBe("sent");
  });

  it("a control plane already RESTARTING: it reads the status, does not restart, and says why", async () => {
    const { calls } = stubPlatform({ apiDownRounds: Infinity, controlPlane: "RESTARTING" });
    const { report } = await runWatch();
    expect(calls.filter((c) => c.url.endsWith("/restart"))).toEqual([]);
    expect(calls.filter((c) => c.url === "https://api.supabase.com/v1/projects/wpfmhmnceflfruhssqqb")).toHaveLength(1);
    expect(report.restart).toMatchObject({ requested: false, status: "RESTARTING" });
    expect(report.problems[0]).toContain("the control plane reports RESTARTING, so a restart is already under way");
  });

  it("a blip (down, then up 30 s later): no restart, no Supabase problem, the state is written", async () => {
    const { calls } = stubPlatform({ apiDownRounds: 1, crmHealth: "ok" });
    const { report } = await runWatch();
    expect(calls.filter((c) => c.url.endsWith("/restart"))).toEqual([]);
    expect(report.restart).toBeNull();
    expect(report.problems).toEqual([]);
    expect(report.dbApi.first.state).toBe("down");
    expect(report.dbApi.second.state).toBe("up");
    expect(report.mail).toBe("not-needed");
    expect(calls.some((c) => c.url === `${SB}/rest/v1/site_watch_state` && c.method === "POST")).toBe(true);
  });

  it("healthy, with the CRM's /api/health live: no wait, no Management call, the CRM's own timings in the facts", async () => {
    const { calls, unexpected } = stubPlatform({ crmHealth: "ok" });
    const { report } = await runWatch();
    expect(unexpected).toEqual([]);
    expect(report.problems).toEqual([]);
    expect(report.mail).toBe("not-needed");
    expect(calls.filter((c) => c.url === `${SB}/auth/v1/health`)).toHaveLength(1);
    expect(calls.filter((c) => c.url.startsWith("https://api.supabase.com"))).toEqual([]);
    expect(calls.some((c) => c.url === "https://app.realtylt.com/")).toBe(false);
    expect(report.facts["CRM (app.realtylt.com)"]).toMatch(/- database: auth 12ms, rest 9ms$/);
    expect(report.facts["Supabase API (Auth + REST)"]).toMatch(/^up \(Auth 200 in \d+ms, REST 200 in \d+ms\)$/);
  });

  it("the CRM's /api/health answering 503 names its database layer and does not fall back to the login page", async () => {
    const { calls } = stubPlatform({ crmHealth: 503 });
    const { report } = await runWatch();
    expect(report.problems).toEqual([
      "app.realtylt.com/api/health answered 503 - the CRM's database layer is down: the login page may load, but nobody can sign in and its crons fail.",
    ]);
    expect(calls.some((c) => c.url === "https://app.realtylt.com/")).toBe(false);
    expect(report.mail).toBe("sent");
  });

  it("the door not answering in 25 s: one post only, 'maybe-sent', and the throttle is armed as if sent (2026-10-16: a retry mailed twice)", async () => {
    const { calls } = stubPlatform({ crmHealth: 503, doorTimesOut: true });
    const { report } = await runWatch();
    expect(calls.filter((c) => c.url === "https://app.realtylt.com/api/site/ops-alert")).toHaveLength(1);
    expect(report.mail).toMatch(/^maybe-sent:no answer within 25 s/);
    const stateWrite = calls.find((c) => c.url === `${SB}/rest/v1/site_watch_state` && c.method === "POST");
    expect(stateWrite?.body).toMatch(/"lastAlertAt":\d+/);
  });

  it("the snapshot query missing ONCE while the API layer is up: no mail, the miss is remembered; the next miss alerts", async () => {
    const first = stubPlatform({ crmHealth: "ok", snapMissing: true });
    const run1 = await runWatch();
    expect(run1.report.problems).toEqual([]);
    expect(run1.report.mail).toBe("not-needed");
    expect(run1.report.facts["Listing store"]).toMatch(/did not answer within 15 s/);
    const write1 = first.calls.find((c) => c.url === `${SB}/rest/v1/site_watch_state` && c.method === "POST");
    expect(write1?.body).toContain('"snap_missing":true');
    const { calls } = stubPlatform({ crmHealth: "ok", snapMissing: true, state: { prev: { active_total: 27_450, snap_missing: true } } });
    const run2 = await runWatch();
    expect(run2.report.problems).toEqual(["The health snapshot query returned nothing: idx_health_snapshot() is missing or unreachable."]);
    expect(run2.report.mail).toBe("sent");
    expect(sent(calls)).toHaveLength(1);
  });
});
