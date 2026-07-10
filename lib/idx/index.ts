/** IDX entry point — factory picks the live MLS Grid client when owner keys are present,
 * else the deterministic fixture (ARCHITECTURE.md "lib/idx"). */

import { FixtureIdxClient } from "./fixture";
import { MlsGridClient } from "./mls-grid";
import type { IdxClient } from "./types";

export * from "./types";

/** True when running on sample data (no owner MLS keys) — UI shows the "sample data" notice. */
export function isFixtureMode(): boolean {
  return !(process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT);
}

// Module-level singletons — MlsGridClient's 15-min replication cache must persist
// across requests; a fresh client per call would re-replicate the full feed every time.
let fixtureClient: FixtureIdxClient | undefined;
let liveClient: MlsGridClient | undefined;

export function getIdxClient(): IdxClient {
  return isFixtureMode()
    ? (fixtureClient ??= new FixtureIdxClient())
    : (liveClient ??= new MlsGridClient());
}
