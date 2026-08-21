import { describe, expect, it } from "vitest";
import {
  isRunnerAlive,
  minutesUntil,
  readPenaltyAt,
  readPenaltyState,
  RULES,
  windowDecision,
} from "./media-window";

/** A readFile that serves one canned file and throws ENOENT for anything else, like fs does. */
const serving = (contents: string | null) => () => {
  if (contents === null) throw new Error("ENOENT");
  return contents;
};

const NOW = Date.UTC(2026, 7, 20, 21, 34);
const HOUR = 3_600_000;

/** A quiet account: nothing spent, nothing penalised. Individual tests move one thing. */
const quiet = { last1h: 0, last24h: 0, now: NOW };

describe("the two doors", () => {
  it("sizes a window to the SMALLER door, not the roomier one", () => {
    // The first rate-limit trip: the daily budget looked healthy, so a window was sized off it
    // while the HOUR was already spent.
    const d = windowDecision({ ...quiet, last1h: 6_000, last24h: 0 });
    expect(d.daily).toBe(36_500); // 38,000 - 0 - 1,500
    expect(d.hourly).toBe(300); // 7,000 - 6,000 - 700 reserve
    expect(d.size).toBe(300);
    expect(d.launch).toBe(false);
    expect(d.reason).toBe("shut");
  });

  it("holds the hourly cap even when the hour is untouched", () => {
    const d = windowDecision(quiet);
    expect(d.size).toBe(RULES.HOURLY_CAP);
  });

  it("keeps hourly headroom for the sync and the site's own photo proxy", () => {
    // The 2026-08-21 429: the window was sized to the whole remaining hour and run at 2.0/s,
    // which is 7,200 requests an hour — the account cap exactly, with nothing left for the
    // hourly sync or for visitors loading listing photos through /api/media/.
    const d = windowDecision({ ...quiet, last1h: 2_000 });
    expect(d.hourly).toBe(7_000 - 2_000 - RULES.HOURLY_RESERVE);
    expect(d.rps).toBe(1.7); // never 2.0 again: 1.7/s is 6,120/hr and leaves ~1,000 spare
  });

  it("retreats BELOW the normal rate after a 429, not to the same number", () => {
    const cooling = windowDecision({ ...quiet, penaltyAt: NOW - 5 * HOUR });
    expect(cooling.rps).toBeLessThan(RULES.NORMAL_RPS);
  });

  it("keeps the daily reserve for the hourly sync's own media work", () => {
    const d = windowDecision({ ...quiet, last24h: 34_000 });
    expect(d.daily).toBe(2_500); // not 4,000 — the sync spends whether or not we run
    expect(d.launch).toBe(false);
  });

  it("never reports a negative door once a budget is overspent", () => {
    const d = windowDecision({ ...quiet, last1h: 9_000, last24h: 41_000 });
    expect(d.daily).toBe(0);
    expect(d.hourly).toBe(0);
    expect(d.size).toBe(0);
  });

  it("opens at the floor and not a download below it", () => {
    const atFloor = windowDecision({ ...quiet, last24h: 38_000 - 1_500 - RULES.FLOOR });
    expect(atFloor.size).toBe(RULES.FLOOR);
    expect(atFloor.launch).toBe(true);

    const justUnder = windowDecision({ ...quiet, last24h: 38_000 - 1_500 - RULES.FLOOR + 1 });
    expect(justUnder.size).toBe(RULES.FLOOR - 1);
    expect(justUnder.launch).toBe(false);
  });
});

describe("the 4-hour penalty", () => {
  // The second rate-limit trip: a relaunch 50 minutes after a 429, because the spend counters
  // had gone green. They measure OUR spend, not the host's penalty state.
  it("refuses a relaunch 50 minutes after a 429 even when both doors are wide open", () => {
    const d = windowDecision({ ...quiet, penaltyAt: NOW - 50 * 60_000 });
    expect(d.size).toBe(RULES.HOURLY_CAP); // the doors ARE open
    expect(d.launch).toBe(false); // and it still refuses
    expect(d.reason).toBe("penalty");
    expect(minutesUntil(d.resumeAt!, NOW)).toBe(190); // 4h - 50m
  });

  it("still refuses one minute early", () => {
    const d = windowDecision({ ...quiet, penaltyAt: NOW - (4 * HOUR - 60_000) });
    expect(d.launch).toBe(false);
    expect(d.reason).toBe("penalty");
  });

  it("lets the window open once the four hours are served", () => {
    const d = windowDecision({ ...quiet, penaltyAt: NOW - 4 * HOUR });
    expect(d.launch).toBe(true);
    expect(d.reason).toBe("ok");
  });

  it("comes back at the slower measured rate, not the published one", () => {
    const d = windowDecision({ ...quiet, penaltyAt: NOW - 5 * HOUR });
    expect(d.cooling).toBe(true);
    expect(d.rps).toBe(RULES.COOLING_RPS);
  });

  it("returns to the normal rate once the cooling day has passed", () => {
    const d = windowDecision({ ...quiet, penaltyAt: NOW - 25 * HOUR });
    expect(d.cooling).toBe(false);
    expect(d.rps).toBe(RULES.NORMAL_RPS);
  });

  it("treats a missing marker as no penalty rather than as time zero", () => {
    // A null penaltyAt must not be read as epoch 0, which would look like a penalty served
    // 56 years ago AND would silently pin the rate.
    const d = windowDecision({ ...quiet, penaltyAt: null });
    expect(d.launch).toBe(true);
    expect(d.cooling).toBe(false);
    expect(d.rps).toBe(RULES.NORMAL_RPS);
  });
});

describe("one runner ever", () => {
  it("refuses to launch a second runner beside a live one", () => {
    const d = windowDecision({ ...quiet, runnerAlive: true });
    expect(d.launch).toBe(false);
    expect(d.reason).toBe("runner-live");
  });

  it("reports a live runner before a penalty, because the operator must stop the runner first", () => {
    const d = windowDecision({ ...quiet, runnerAlive: true, penaltyAt: NOW - 60_000 });
    expect(d.reason).toBe("runner-live");
  });
});

describe("reading the penalty marker", () => {
  it("reads a stamped ISO time back as the moment of the 429", () => {
    expect(readPenaltyAt(serving("2026-08-20T21:34:00.000Z\n"))).toBe(
      Date.parse("2026-08-20T21:34:00.000Z"),
    );
  });

  it("reads a missing marker as no penalty", () => {
    expect(readPenaltyAt(serving(null))).toBeNull();
  });

  it("separates a MISSING marker from an UNREADABLE one, because they must not decide alike", () => {
    // The first version returned null for both and the comment congratulated itself for not
    // returning epoch 0. Wrong thing to be proud of: null and epoch-0 have the SAME outcome, the
    // window launches. A stamp that exists but is garbled is evidence of a 429 whose record got
    // damaged, so the callers serve it as a penalty. `present` is what lets them tell.
    expect(readPenaltyState(serving(null))).toEqual({ present: false, at: null });
    expect(readPenaltyState(serving("not a date"))).toEqual({ present: true, at: null });
    expect(readPenaltyState(serving(""))).toEqual({ present: true, at: null });
    expect(readPenaltyState(serving("1755691200000"))).toEqual({ present: true, at: null });
  });

  it("still parses a well-formed stamp through either reader", () => {
    const iso = "2026-08-20T21:34:00.000Z";
    expect(readPenaltyState(serving(iso)).at).toBe(Date.parse(iso));
    expect(readPenaltyAt(serving(iso))).toBe(Date.parse(iso));
  });

  it("feeds windowDecision a real block when the marker is fresh", () => {
    const at = readPenaltyAt(serving("2026-08-20T21:00:00.000Z"));
    const d = windowDecision({ last1h: 0, last24h: 0, penaltyAt: at, now: NOW });
    expect(d.reason).toBe("penalty");
  });
});

describe("reading the runner lock", () => {
  it("reports a runner alive when the locked pid is running", () => {
    expect(isRunnerAlive(serving("4242\n2026-08-20T21:00:00Z\n"), (pid) => pid === 4242)).toBe(true);
  });

  it("treats a lock left by a hard-killed runner as stale, not as a live runner", () => {
    // Presence is not liveness. A stale lock that blocked for ever would silently stop the loop.
    expect(isRunnerAlive(serving("4242\n"), () => false)).toBe(false);
  });

  it("reads a missing or unparseable lock as no runner", () => {
    expect(isRunnerAlive(serving(null), () => true)).toBe(false);
    expect(isRunnerAlive(serving("nonsense"), () => true)).toBe(false);
    expect(isRunnerAlive(serving("-1"), () => true)).toBe(false);
  });
});

describe("input validation", () => {
  it("throws rather than sizing a window off an unreadable spend count", () => {
    // media_spend() returning an unexpected shape must not become size=NaN, which compares
    // false against the floor and would quietly look like a shut door for ever.
    expect(() => windowDecision({ last1h: NaN, last24h: 0 })).toThrow(/finite/);
    expect(() => windowDecision({ last1h: 0, last24h: undefined as unknown as number })).toThrow(/finite/);
  });
});
