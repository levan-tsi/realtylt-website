/** The sold-photo window judgement, as testable code instead of prose.
 *
 * Every rule here was paid for. Both rate-limit trips in docs/parity/PHOTO-BACKFILL-STATUS.md came
 * from a shortcut, not from the runner: sizing a window off the DAILY budget while the HOUR was
 * spent, and relaunching 50 minutes after a 429 because the counters looked green.
 * scripts/sold-window.mjs encoded the first. The second stayed a sentence in a console message —
 * PENALTY_HOURS was printed and never enforced, and the runner exits 0 after it stops on a 429, so
 * neither a human nor a loop could tell a penalised stop from a clean finish. Both are code now.
 *
 * Plain .mjs, like lib/idx/geocode.mjs, so the runner scripts and vitest share one copy.
 *
 * Full law: docs/vendor/mlsgrid/README.md "ACTUAL ENFORCEMENT THRESHOLDS".
 */

export const RULES = {
  /** Their warning tier is 40,000 per ROLLING 24h; we aim under it. */
  DAILY_TARGET: 38_000,
  /** Headroom for the hourly sync's own media work, which spends whether or not we run. */
  DAILY_RESERVE: 1_500,
  /** ~2.5 GB at ~415 KB/photo, inside the 3,072 MB/hr warning. */
  HOURLY_CAP: 6_000,
  HOURLY_TARGET: 7_000,
  /** Headroom inside the hour, and the DAILY budget already had its equivalent while this did not.
   *  The hourly sync spends ~500/hr whether or not a window runs, and /api/media/ proxies the
   *  media host for any photo not yet mirrored — so the site's own visitors and every probe that
   *  does not block that route are spending against the same cap. Sizing a window to the whole
   *  remaining hour hands all of that nothing. */
  HOURLY_RESERVE: 700,
  /** Below this a window is not worth the quota churn. */
  FLOOR: 3_000,
  /** After ANY 429. Counters measure OUR spend, not the host's penalty state, so green counters
   *  are not permission to resume — only elapsed time is. */
  PENALTY_HOURS: 4,
  /** 1.7, NOT 2.0 — and the 2.0 that used to be here caused a real 429 on 2026-08-21.
   *
   *  backfill-sold-photos.mjs has defaulted to 1.7 since 2026-08-12 with the comment "two 429
   *  trips found the real ceiling below the published 2 RPS". This wrapper then passed --rps 2.0
   *  on every launch, overriding the one value the ledger had already paid for twice. The
   *  arithmetic says why it had to fail eventually: 2.0/s sustained is 7,200 requests an hour,
   *  which IS the account's hourly cap, leaving nothing for the hourly sync or for the site
   *  serving its own photos. Measured during the incident: the runner held ~117 photos/minute
   *  (7,020/hr) for eleven clean minutes, degraded to 84 and 91 as the backoff engaged, and
   *  stopped after six 429s with 1,579 photos landed. 1.7/s is 6,120/hr and leaves ~1,000. */
  NORMAL_RPS: 1.7,
  /** Below NORMAL, or "drop the rate after a 429" means nothing. It was 1.7 when normal was 2.0;
   *  now that normal IS 1.7, the post-429 rate has to go further down to still be a retreat. */
  COOLING_RPS: 1.4,
  /** How long we keep the slower rate after a 429, once the 4-hour stop has been served. */
  COOLING_HOURS: 24,
};

const HOUR_MS = 3_600_000;

/**
 * Decide whether a sold-photo window may open, and how big it may be.
 *
 * Pure: every input is passed in, so the whole judgement is testable without a network, a
 * filesystem or a clock.
 */
export function windowDecision({
  last1h,
  last24h,
  penaltyAt = null,
  runnerAlive = false,
  now = Date.now(),
  rules = RULES,
} = {}) {
  if (!Number.isFinite(last1h) || !Number.isFinite(last24h)) {
    throw new TypeError("windowDecision needs finite last1h / last24h spend counts");
  }

  // The doors, always both, always sized to the smaller. Reported even when something else
  // blocks the launch, because the ledger wants the numbers either way.
  const daily = Math.max(0, rules.DAILY_TARGET - last24h - rules.DAILY_RESERVE);
  const hourly = Math.max(
    0,
    Math.min(rules.HOURLY_CAP, rules.HOURLY_TARGET - last1h - rules.HOURLY_RESERVE),
  );
  const size = Math.min(daily, hourly);

  // A 429 in the last COOLING_HOURS means the rate itself is suspect, not just that one window.
  const cooling = Number.isFinite(penaltyAt) && now < penaltyAt + rules.COOLING_HOURS * HOUR_MS;
  const rps = cooling ? rules.COOLING_RPS : rules.NORMAL_RPS;
  const base = { daily, hourly, size, rps, cooling };

  // ONE media runner ever — the account's caps are shared by the hourly sync and every runner.
  if (runnerAlive) {
    return { ...base, launch: false, reason: "runner-live", resumeAt: null };
  }

  // The stop is served in TIME, and nothing else lifts it.
  if (Number.isFinite(penaltyAt)) {
    const clearsAt = penaltyAt + rules.PENALTY_HOURS * HOUR_MS;
    if (now < clearsAt) {
      return { ...base, launch: false, reason: "penalty", resumeAt: clearsAt };
    }
  }

  if (size < rules.FLOOR) {
    return { ...base, launch: false, reason: "shut", resumeAt: null };
  }

  return { ...base, launch: true, reason: "ok", resumeAt: null };
}

/** Minutes remaining on a penalty, rounded up — for the operator-facing line. */
export function minutesUntil(resumeAt, now = Date.now()) {
  return Math.max(0, Math.ceil((resumeAt - now) / 60_000));
}

// ── the markers ───────────────────────────────────────────────────────────────────────────────
// Both paths live HERE and nowhere else. The runner writes them and the window reads them, and a
// writer and a reader that disagree about a path is the quietest kind of broken instrument: the
// window would report "no penalty" for ever and be believed. Repo-root relative, matching
// scripts/.photo-backfill-watermark.local; both scripts are run as `node scripts/...` from root.

/** Stamped by the runner when it stops on a 429. Presence alone means nothing — the TIME does. */
export const PENALTY_FILE = "scripts/.media-penalty.local";
/** Holds the live runner's pid. ONE media runner ever: the account's caps are shared. */
export const RUNNER_LOCK = "scripts/.media-runner.local";

/** Distinguishes "no marker" from "a marker that cannot be read", because those must NOT lead to
 *  the same decision.
 *
 *  The first version returned null for both, with a comment congratulating itself for not
 *  returning epoch 0. That was the wrong thing to be proud of: null and epoch-0 have the identical
 *  outcome — the window LAUNCHES. A stamp that exists but is garbled is evidence that a 429 was
 *  recorded and the record was damaged, so the safe direction is to refuse, not to wave it
 *  through. `present` is what lets the caller tell the two apart. */
export function readPenaltyState(readFile, file = PENALTY_FILE) {
  let raw;
  try {
    raw = readFile(file);
  } catch {
    return { present: false, at: null }; // no marker is the normal case
  }
  const at = Date.parse(String(raw).trim());
  return { present: true, at: Number.isFinite(at) ? at : null };
}

/** The recorded 429 time in epoch ms, or null when there is no readable marker.
 *  Kept for callers that only need the timestamp; anything deciding whether to LAUNCH should use
 *  readPenaltyState, so a corrupt stamp cannot read as "no penalty". */
export function readPenaltyAt(readFile, file = PENALTY_FILE) {
  return readPenaltyState(readFile, file).at;
}

/** True when the lock names a process that is actually still running.
 *  A hard-killed runner leaves its lock behind, so presence is not liveness — the pid is checked.
 *  `isAlive` is injected so this is testable without spawning anything. */
export function isRunnerAlive(readFile, isAlive, file = RUNNER_LOCK) {
  let raw;
  try {
    raw = readFile(file);
  } catch {
    return false;
  }
  const pid = Number.parseInt(String(raw).trim().split(/\s+/)[0], 10);
  if (!Number.isInteger(pid) || pid <= 0) return false;
  return isAlive(pid);
}

/** Whether a pid is running, for the real callers. `kill(pid, 0)` signals nothing and throws
 *  ESRCH when the process is gone; it works on Windows too. */
export function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e?.code === "EPERM"; // alive but owned by another user
  }
}
