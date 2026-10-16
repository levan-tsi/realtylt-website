import { describe, expect, it } from "vitest";
import {
  alertKey,
  classifyDbApi,
  decideRestart,
  judge,
  shouldAlert,
  THRESHOLDS,
  type DbApiProbe,
  type ProbeResult,
  type WatchInput,
} from "./checks";

const healthy = (): WatchInput => ({
  snap: {
    at: "2026-09-17T12:00:00Z",
    watermark: "2026-09-17T11:30:00Z",
    baseline_complete: true,
    minutes_since_sync: 24,
    active_total: 27_400,
    active_status_active: 17_700,
    active_coming_soon: 120,
    active_pending: 9_500,
    active_no_photo: 47,
    active_no_photo_older_7d: 37,
    touched_24h: 1_600,
    repriced_24h: 3,
    restatused_24h: 5,
  },
  counts: { leads_1h: 1, leads_24h: 4, signups_1h: 0, signups_24h: 2, chat_1h: 3, chat_24h: 9 },
  site: { ok: true, status: 200, ms: 900 },
  search: { ok: true, status: 200, ms: 400 },
  crm: { ok: true, status: 200, ms: 700 },
  prev: { active_total: 27_450, active_no_photo_older_7d: 35 },
});

describe("the health watch judge", () => {
  it("a healthy platform raises nothing", () => {
    const v = judge(healthy());
    expect(v.problems).toEqual([]);
    expect(v.critical).toBe(false);
    expect(v.facts.length).toBeGreaterThan(8);
  });

  it("a down website or CRM is CRITICAL (the notify-right-away class)", () => {
    const down = healthy();
    down.site = { ok: false, status: 500, ms: 300 };
    down.crm = { ok: false, status: 0, ms: 12_000 };
    const v = judge(down);
    expect(v.critical).toBe(true);
    expect(v.problems.join(" ")).toMatch(/website is down/);
    expect(v.problems.join(" ")).toMatch(/CRM is down/);
  });

  it("floods read as an attack signal and are critical", () => {
    const flood = healthy();
    flood.counts = { ...flood.counts, leads_1h: 40, signups_1h: 25 };
    const v = judge(flood);
    expect(v.critical).toBe(true);
    expect(v.problems.join(" ")).toMatch(/form spam/);
    expect(v.problems.join(" ")).toMatch(/bot registrations/);
  });

  it("data drift (stale sync, count swing, frozen feed) is a problem but not the critical class", () => {
    const drift = healthy();
    drift.snap = { ...drift.snap!, minutes_since_sync: 500, touched_24h: 0, active_total: 20_000 };
    const v = judge(drift);
    expect(v.critical).toBe(false);
    expect(v.problems.join(" ")).toMatch(/sync is stale/i);
    expect(v.problems.join(" ")).toMatch(/frozen/);
    expect(v.problems.join(" ")).toMatch(/swung -2[67]/); // 27,450 -> 20,000 is ~-27%
  });

  it("Bot Protection's challenge (429) reads as up, never as an alarm - the edge answered", () => {
    const c = healthy();
    c.site = { ok: false, status: 429, ms: 700 };
    c.search = { ok: false, status: 429, ms: 300 };
    const v = judge(c);
    expect(v.problems).toEqual([]);
    expect(v.facts.find(([k]) => k === "Website")?.[1]).toContain("up (bot-challenged)");
  });

  it("a slow site trips the floor; a missing snapshot is named, not thrown", () => {
    const slow = healthy();
    slow.site = { ok: true, status: 200, ms: THRESHOLDS.slowSiteMs + 1 };
    slow.snap = null;
    const v = judge(slow);
    expect(v.problems.join(" ")).toMatch(/took/);
    expect(v.problems.join(" ")).toMatch(/snapshot query returned nothing/);
  });

  it("with the API layer up, ONE missed snapshot is a fact (a slow minute); the second miss in a row is the problem (2026-10-16)", () => {
    const up = { auth: { ok: true, status: 200, ms: 90 }, rest: { ok: true, status: 200, ms: 80 }, state: "up" as const };
    const once = healthy();
    once.snap = null;
    once.dbApi = up;
    const v1 = judge(once);
    expect(v1.problems).toEqual([]);
    expect(v1.facts.find(([k]) => k === "Listing store")?.[1]).toMatch(/did not answer within 15 s .* alerts if the next check misses too/);
    const again = healthy();
    again.snap = null;
    again.dbApi = up;
    again.prev = { ...again.prev, snap_missing: true };
    const v2 = judge(again);
    expect(v2.problems.join(" ")).toMatch(/snapshot query returned nothing/);
    expect(v2.facts.find(([k]) => k === "Listing store")?.[1]).toBe("the snapshot query returned nothing");
    const down = healthy();
    down.snap = null;
    down.dbApi = { ...up, auth: { ok: false, status: 522, ms: 20_000 }, rest: { ok: false, status: 522, ms: 20_000 }, state: "down" };
    expect(judge(down).problems.join(" ")).toMatch(/snapshot query returned nothing/);
  });
});

describe("the re-alert throttle", () => {
  const now = 1_800_000_000_000;
  it("no problems never alerts; a new problem set alerts at once", () => {
    expect(shouldAlert([], {}, now)).toBe(false);
    expect(shouldAlert(["a"], {}, now)).toBe(true);
    expect(shouldAlert(["a"], { lastAlertKey: "b", lastAlertAt: now - 1000 }, now)).toBe(true);
  });
  it("the SAME problem set repeats only after 6 hours", () => {
    const state = { lastAlertKey: "a|b", lastAlertAt: now - THRESHOLDS.realertMs + 60_000 };
    expect(shouldAlert(["a", "b"], state, now)).toBe(false);
    expect(shouldAlert(["a", "b"], { ...state, lastAlertAt: now - THRESHOLDS.realertMs - 1 }, now)).toBe(true);
  });
  it("keys on problem FAMILIES: a standing stale sync whose minutes change every run stays muted", () => {
    const at = (minutes: number) => {
      const s = healthy();
      s.snap = { ...s.snap!, minutes_since_sync: minutes };
      return judge(s).problems;
    };
    expect(at(314)).not.toEqual(at(324)); // the text moves every run...
    const state = { lastAlertKey: alertKey(at(314)), lastAlertAt: now - 10 * 60_000 };
    expect(shouldAlert(at(324), state, now)).toBe(false); // ...the family does not
    const plusFlood = healthy();
    plusFlood.snap = { ...plusFlood.snap!, minutes_since_sync: 334 };
    plusFlood.counts = { ...plusFlood.counts, leads_1h: 40 };
    expect(shouldAlert(judge(plusFlood).problems, state, now)).toBe(true); // a new family alerts at once
  });
});

const probeOf = (status: number, error?: "timeout" | "network"): ProbeResult => ({
  ok: status >= 200 && status < 300,
  status,
  ms: status ? 300 : THRESHOLDS.dbApiTimeoutMs,
  ...(error ? { error } : {}),
});

describe("the Supabase API-layer probe (2026-10-15)", () => {
  it("is down only when BOTH legs time out, fail to connect or answer 5xx", () => {
    expect(classifyDbApi(probeOf(0, "timeout"), probeOf(0, "timeout"))).toBe("down");
    expect(classifyDbApi(probeOf(522), probeOf(522))).toBe("down");
    expect(classifyDbApi(probeOf(0, "timeout"), probeOf(522))).toBe("down");
    expect(classifyDbApi(probeOf(0, "network"), probeOf(503))).toBe("down");
  });

  it("a 401 or 404 is the edge and the service answering, so up; one live leg is up", () => {
    expect(classifyDbApi(probeOf(401), probeOf(0, "timeout"))).toBe("up");
    expect(classifyDbApi(probeOf(522), probeOf(404))).toBe("up");
    expect(classifyDbApi(probeOf(200), probeOf(200))).toBe("up");
  });

  const down: DbApiProbe = { auth: probeOf(0, "timeout"), rest: probeOf(522), state: "down" };

  it("a down API layer is the FIRST problem, critical, in plain words", () => {
    const v = judge({ ...healthy(), dbApi: down });
    expect(v.critical).toBe(true);
    expect(v.problems[0]).toBe(
      "Supabase API layer is down (Auth: timeout after 20 s, REST: 522) - logins, the CRM's crons and the website's listings all fail until it is restarted.",
    );
    expect(v.facts.find(([k]) => k === "Supabase API (Auth + REST)")?.[1]).toBe("DOWN (Auth timeout after 20 s, REST 522 in 300ms)");
  });

  it("an answering API layer raises nothing and shows both legs", () => {
    const v = judge({ ...healthy(), dbApi: { auth: probeOf(200), rest: probeOf(200), state: "up" } });
    expect(v.problems).toEqual([]);
    expect(v.facts.find(([k]) => k === "Supabase API (Auth + REST)")?.[1]).toBe("up (Auth 200 in 300ms, REST 200 in 300ms)");
  });

  it("the problem line ends with what the watch did about it", () => {
    const line = (restart: WatchInput["restart"]) => judge({ ...healthy(), dbApi: down, restart }).problems[0];
    const noToken = decideRestart({ dbApi: "down", secondProbe: "down", status: null, tokenPresent: false });
    expect(line({ requested: false, why: noToken.why, status: null })).toMatch(
      / The watch could not restart it: set SUPABASE_MANAGEMENT_TOKEN and SUPABASE_PROJECT_REF on Vercel, or restart by hand: Supabase dashboard > project > Settings > General > Restart project\.$/,
    );
    expect(line({ requested: true, requestedAt: "2026-10-15T23:23:31.000Z", status: "ACTIVE_HEALTHY", httpStatus: 200 })).toContain(
      "The watch asked Supabase to restart the project at 23:23 UTC (the control plane read ACTIVE_HEALTHY; the restart call answered 200).",
    );
    expect(line({ requested: true, requestedAt: "2026-10-15T23:23:31.000Z", status: "ACTIVE_HEALTHY", httpStatus: 403 })).toMatch(
      /the restart call answered 403: restart by hand: Supabase dashboard > project > Settings > General > Restart project\.$/,
    );
    expect(line({ requested: true, requestedAt: "2026-10-15T23:23:31.000Z", status: "ACTIVE_HEALTHY", httpStatus: 0 })).toContain("answered nothing");
  });
});

describe("decideRestart", () => {
  const base = { dbApi: "down", secondProbe: "down", status: "ACTIVE_HEALTHY", tokenPresent: true } as const;

  it("restarts when down twice, the token is set and the control plane says it runs", () => {
    expect(decideRestart(base).restart).toBe(true);
    expect(decideRestart({ ...base, status: "ACTIVE_UNHEALTHY" }).restart).toBe(true);
  });

  it("never restarts a layer that answered, the first time or 30 s later", () => {
    expect(decideRestart({ ...base, dbApi: "up", secondProbe: null }).restart).toBe(false);
    expect(decideRestart({ ...base, secondProbe: "up" })).toEqual({
      restart: false,
      why: "The API layer answered again on the second probe 30 s later.",
    });
    expect(decideRestart({ ...base, secondProbe: null }).restart).toBe(false);
  });

  it("without the token: no restart, and the sentence that tells him how", () => {
    expect(decideRestart({ ...base, tokenPresent: false })).toEqual({
      restart: false,
      why: "The watch could not restart it: set SUPABASE_MANAGEMENT_TOKEN and SUPABASE_PROJECT_REF on Vercel, or restart by hand: Supabase dashboard > project > Settings > General > Restart project.",
    });
  });

  it("RESTARTING, COMING_UP, PAUSED or anything else: no restart, and it says why", () => {
    for (const status of ["RESTARTING", "COMING_UP", "PAUSED", "INACTIVE", "UPGRADING", "SOMETHING_NEW"]) {
      const d = decideRestart({ ...base, status });
      expect(d.restart, status).toBe(false);
      expect(d.why).toMatch(/^The watch did not restart it: the control plane reports /);
      expect(d.why).toContain(status);
    }
    expect(decideRestart({ ...base, status: "RESTARTING" }).why).toMatch(/already under way/);
    expect(decideRestart({ ...base, status: "PAUSED" }).why).toMatch(/paused/);
    const unread = decideRestart({ ...base, status: null });
    expect(unread.restart).toBe(false);
    expect(unread.why).toMatch(/did not say what state the project is in/);
  });
});

describe("the CRM probe: its /api/health, else the login page", () => {
  it("a 503 from /api/health names the CRM's database layer, critically", () => {
    const v = judge({ ...healthy(), crm: { ok: false, status: 503, ms: 400 }, crmVia: "health" });
    expect(v.critical).toBe(true);
    expect(v.problems).toEqual([
      "app.realtylt.com/api/health answered 503 - the CRM's database layer is down: the login page may load, but nobody can sign in and its crons fail.",
    ]);
  });

  it("while /api/health is not live, a login-page answer is labelled as only that", () => {
    const v = judge({ ...healthy(), crmVia: "login-page" });
    expect(v.problems).toEqual([]);
    expect(v.facts.find(([k]) => k === "CRM (app.realtylt.com)")?.[1]).toBe("up (200, 700ms) - CRM answered (login page only)");
  });

  it("a live /api/health shows the CRM's own database timings", () => {
    const v = judge({ ...healthy(), crmVia: "health", crmDb: { auth: 12, rest: 9 } });
    expect(v.facts.find(([k]) => k === "CRM (app.realtylt.com)")?.[1]).toBe("up (200, 700ms) - database: auth 12ms, rest 9ms");
  });
});
