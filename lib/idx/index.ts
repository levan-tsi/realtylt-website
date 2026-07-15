/** IDX entry point — factory picks the data source (ARCHITECTURE.md "lib/idx"):
 *  1. Supabase idx_listings (DbIdxClient) whenever Supabase env is configured — the
 *     production path. Kept fresh by the hourly sync cron; RLS serves active rows only,
 *     so delisted listings vanish promptly. Falls back INTERNALLY to the committed
 *     snapshot until the baseline pull completes (or on any DB error) — the site never
 *     breaks mid-migration. See lib/idx/db.ts.
 *  2. Committed snapshot (ReplicatedIdxClient) when Supabase is unconfigured but
 *     data/mls-snapshot.json holds listings. Requests never call MLS Grid (rate caps).
 *  3. Direct MLS Grid (MlsGridClient) when neither exists but MLS keys are present —
 *     local live-mode dev. NOT serverless-safe (per-instance syncs burst past the
 *     per-account 2 req/sec cap).
 *  4. Deterministic fixture otherwise (tests, keyless dev) — UI shows a sample notice. */

import { DbIdxClient } from "./db";
import { FixtureIdxClient } from "./fixture";
import { MlsGridClient } from "./mls-grid";
import { ReplicatedIdxClient } from "./replicated";
import { getCommittedSnapshot } from "./snapshot";
import type { IdxClient } from "./types";

export * from "./types";

function dbConfigured(): boolean {
  return !!(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_ANON_KEY?.trim());
}

/** True when running on sample data (no DB, no committed snapshot, no MLS keys) — UI notice. */
export function isFixtureMode(): boolean {
  return !(
    dbConfigured() ||
    getCommittedSnapshot() ||
    (process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT)
  );
}

// Module-level singletons — the clients' in-memory state must persist across requests.
let fixtureClient: FixtureIdxClient | undefined;
let replicatedClient: ReplicatedIdxClient | undefined;
let liveClient: MlsGridClient | undefined;
let dbClient: DbIdxClient | undefined;

export function getIdxClient(): IdxClient {
  if (dbConfigured()) return (dbClient ??= new DbIdxClient());
  if (getCommittedSnapshot()) return (replicatedClient ??= new ReplicatedIdxClient());
  if (process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT)
    return (liveClient ??= new MlsGridClient());
  return (fixtureClient ??= new FixtureIdxClient());
}

/** True when the data being SERVED is sample data — env-level fixture mode OR a
 * client's last-resort fixture fallback (unusable snapshot). Drives the on-page
 * "sample data" notice honestly in every case. */
export function isSampleData(): boolean {
  return (
    isFixtureMode() ||
    (replicatedClient?.servingFixture ?? false) ||
    (dbClient?.servingFixture ?? false)
  );
}
