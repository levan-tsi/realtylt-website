/** IDX entry point — factory picks the data source (ARCHITECTURE.md "lib/idx"):
 *  1. Vercel Blob snapshot (ReplicatedIdxClient) when a Blob store is linked — the
 *     production path: the sync cron replicates MLS Grid into Blob; requests never
 *     call the feed (see lib/idx/replication.ts for why).
 *  2. Direct MLS Grid (MlsGridClient) when only the MLS keys are present — local
 *     live-mode dev without a Blob store. NOT serverless-safe (per-instance syncs
 *     burst past the per-account 2 req/sec cap).
 *  3. Deterministic fixture otherwise (tests, keyless dev) — UI shows a sample notice. */

import { FixtureIdxClient } from "./fixture";
import { MlsGridClient } from "./mls-grid";
import { ReplicatedIdxClient } from "./replicated";
import type { IdxClient } from "./types";

export * from "./types";

/** True when running on sample data (no Blob store, no MLS keys) — UI shows the notice. */
export function isFixtureMode(): boolean {
  return !(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT)
  );
}

// Module-level singletons — the clients' in-memory caches must persist across requests.
let fixtureClient: FixtureIdxClient | undefined;
let replicatedClient: ReplicatedIdxClient | undefined;
let liveClient: MlsGridClient | undefined;

export function getIdxClient(): IdxClient {
  if (process.env.BLOB_READ_WRITE_TOKEN) return (replicatedClient ??= new ReplicatedIdxClient());
  if (process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT)
    return (liveClient ??= new MlsGridClient());
  return (fixtureClient ??= new FixtureIdxClient());
}
