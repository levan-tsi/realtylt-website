/** IDX entry point — factory picks the data source (ARCHITECTURE.md "lib/idx"):
 *  1. Committed snapshot (ReplicatedIdxClient) whenever data/mls-snapshot.json holds
 *     listings — the production path. The snapshot ships INSIDE the deploy bundle, so
 *     requests never call Vercel Blob (a paused free-tier store 403s reads — the
 *     regression this fixed) or MLS Grid (rate caps). See lib/idx/snapshot.ts.
 *  2. Direct MLS Grid (MlsGridClient) when the snapshot is unusable but MLS keys are
 *     present — local live-mode dev. NOT serverless-safe (per-instance syncs burst
 *     past the per-account 2 req/sec cap).
 *  3. Deterministic fixture otherwise (tests, keyless dev) — UI shows a sample notice. */

import { FixtureIdxClient } from "./fixture";
import { MlsGridClient } from "./mls-grid";
import { ReplicatedIdxClient } from "./replicated";
import { getCommittedSnapshot } from "./snapshot";
import type { IdxClient } from "./types";

export * from "./types";

/** True when running on sample data (no committed snapshot, no MLS keys) — UI notice. */
export function isFixtureMode(): boolean {
  return !(
    getCommittedSnapshot() ||
    (process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT)
  );
}

// Module-level singletons — the clients' in-memory state must persist across requests.
let fixtureClient: FixtureIdxClient | undefined;
let replicatedClient: ReplicatedIdxClient | undefined;
let liveClient: MlsGridClient | undefined;

export function getIdxClient(): IdxClient {
  if (getCommittedSnapshot()) return (replicatedClient ??= new ReplicatedIdxClient());
  if (process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT)
    return (liveClient ??= new MlsGridClient());
  return (fixtureClient ??= new FixtureIdxClient());
}

/** True when the data being SERVED is sample data — env-level fixture mode OR the
 * replicated client's last-resort fixture fallback (unusable snapshot). Drives the
 * on-page "sample data" notice honestly in both cases. */
export function isSampleData(): boolean {
  return isFixtureMode() || (replicatedClient?.servingFixture ?? false);
}
