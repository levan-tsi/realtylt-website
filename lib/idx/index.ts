/** IDX entry point — factory picks the live MLS Grid client when owner keys are present,
 * else the deterministic fixture (ARCHITECTURE.md "lib/idx"). */

import { FixtureIdxClient } from "./fixture";
import { MlsGridClient } from "./mls-grid";
import type { IdxClient } from "./types";

export * from "./types";
export { FixtureIdxClient } from "./fixture";
export { MlsGridClient } from "./mls-grid";

/** True when running on sample data (no owner MLS keys) — UI shows the "sample data" notice. */
export function isFixtureMode(): boolean {
  return !(process.env.MLS_API_KEY && process.env.MLS_API_ENDPOINT);
}

export function getIdxClient(): IdxClient {
  return isFixtureMode() ? new FixtureIdxClient() : new MlsGridClient();
}
