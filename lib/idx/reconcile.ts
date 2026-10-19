/** The daily feed RECONCILIATION — the pure part (planning, classification, state), unit-tested.
 *
 * WHY THIS EXISTS (2026-10-19). The hourly sync is a timestamp delta: it asks MLS Grid for every
 * row modified after its watermark and deactivates what it sees go off the market. That is the
 * documented replication model and it works — for changes that move ModificationTimestamp. The
 * full check run that day (scripts/reconcile-feed.mjs: the feed's 46,614 on-market rows against
 * our 27,507) found 14 rows we still served that the feed had closed, hidden or purged, and
 * every one of them had a ModificationTimestamp that never moved when it happened. No timestamp
 * query can see a change that carries no timestamp. So once a day the route walks the feed's
 * whole on-market set (ids only), diffs it against every row we serve, asks the feed BY ID what
 * each unexplained row is today, and deactivates only what the feed confirms is off the market.
 * The same diff names on-market rows in a served area that we do not serve, so they can be
 * restored. Nothing here talks to the network; app/api/cron/idx-reconcile does.
 */

/** What the walk keeps per feed row — enough to diff and to say whether we would serve it. */
export interface OnMarketRow {
  id: string;
  status: string;
  /** In a county AND a PropertyType the site serves, and viewable — i.e. a row we should hold. */
  served: boolean;
  ts: string;
}

export interface ReconcileSummary {
  feedOnMarket: number;
  active: number;
  /** Rows we serve that the walk did not see (candidates, before the feed was asked by id). */
  stale: number;
  probed: number;
  offMarket: number;
  absent: number;
  /** Candidates the feed still lists on-market when asked by id (the walk skipped them). */
  keptOnMarket: number;
  deactivated: number;
  missing: number;
  restored: number;
  /** Candidates not reached inside this tick's time budget; the next tick continues. */
  left: number;
  dry: boolean;
}

export interface ReconcileState {
  startedAt: string;
  /** The feed's @odata.nextLink to resume the walk from; null once the walk is done. */
  nextLink: string | null;
  pages: number;
  scanned: number;
  /** Set when the finish phase ran to the end for real. */
  completedAt?: string;
  /** Set instead of completedAt by a dry run (nothing written to listings). */
  dryAt?: string;
  /** Set when the finish phase refused to judge (see sanityOk); the watch names it. */
  error?: string;
  summary?: ReconcileSummary;
}

export type TickPlan = "noop" | "start" | "resume" | "finish";

export const RECONCILE = {
  /** A completed run is good for this long; the schedule fires four ticks a day, one starts. */
  minHoursBetweenRuns: 20,
  /** A run that has not completed within this is abandoned and started over. */
  staleRunHours: 6,
  /** The walk must have seen at least this share of what we serve, or the diff is not trusted:
   * the feed's on-market set spans more counties than ours, so a healthy walk is always larger. */
  minSeenShare: 0.5,
} as const;

const HOUR = 3600_000;

/** Validate a stored state just enough never to resume from garbage. */
export function parseReconcileState(raw: unknown): ReconcileState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const s = raw as ReconcileState;
  if (typeof s.startedAt !== "string" || Number.isNaN(Date.parse(s.startedAt))) return null;
  if (s.nextLink !== null && typeof s.nextLink !== "string") return null;
  if (typeof s.pages !== "number" || typeof s.scanned !== "number") return null;
  return s;
}

/** What this tick should do. `force` ignores the once-a-day rule but never abandons a fresh run
 * in progress — forcing while a walk is half done just continues it. */
export function planTick(state: ReconcileState | null, nowMs: number, force = false): TickPlan {
  if (!state) return "start";
  const fresh = nowMs - Date.parse(state.startedAt) < RECONCILE.staleRunHours * HOUR;
  if (!state.completedAt) {
    if (!fresh) return "start";
    return state.nextLink ? "resume" : "finish";
  }
  if (force) return "start";
  const done = Date.parse(state.completedAt);
  return Number.isNaN(done) || nowMs - done >= RECONCILE.minHoursBetweenRuns * HOUR ? "start" : "noop";
}

/** Sort the ids we asked about by what the feed answered: still showable (the walk skipped them),
 * off the market (status, flag, area or type says so), or absent from the feed entirely (MLS
 * Grid drops MlgCanView=false rows after seven days). Only called with the rows of a request
 * that SUCCEEDED, so absence means gone, never "the request failed". */
export function classifyProbe<T extends { ListingId?: string; ListingKey?: string }>(
  ids: readonly string[],
  rows: readonly T[],
  showable: (row: T) => boolean,
): { offMarket: string[]; onMarket: string[]; absent: string[] } {
  const byId = new Map<string, T>();
  for (const r of rows) {
    const id = r.ListingId ?? r.ListingKey;
    if (id) byId.set(id, r);
  }
  const offMarket: string[] = [];
  const onMarket: string[] = [];
  const absent: string[] = [];
  for (const id of ids) {
    const r = byId.get(id);
    if (!r) absent.push(id);
    else if (showable(r)) onMarket.push(id);
    else offMarket.push(id);
  }
  return { offMarket, onMarket, absent };
}

/** Refuse to judge from a walk that plainly did not see the feed (a truncated or broken walk
 * would otherwise nominate most of our inventory as stale — the probe gate would still protect
 * every row, but at thousands of requests, and a protection should not be the only wall). */
export function sanityOk(seenTotal: number, activeTotal: number): boolean {
  return seenTotal > 0 && seenTotal >= activeTotal * RECONCILE.minSeenShare;
}
