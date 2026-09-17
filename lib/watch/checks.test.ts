import { describe, expect, it } from "vitest";
import { judge, shouldAlert, THRESHOLDS, type WatchInput } from "./checks";

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

  it("a slow site trips the floor; a missing snapshot is named, not thrown", () => {
    const slow = healthy();
    slow.site = { ok: true, status: 200, ms: THRESHOLDS.slowSiteMs + 1 };
    slow.snap = null;
    const v = judge(slow);
    expect(v.problems.join(" ")).toMatch(/took/);
    expect(v.problems.join(" ")).toMatch(/snapshot query returned nothing/);
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
});
