/** The ONE gateway to the MLS Grid DATA API (api.mlsgrid.com/v2, hard 2 req/sec per-ACCOUNT
 * cap). Calling it from a request/render path is what burst past the cap and got the account
 * SUSPENDED (docs/mls-fix/AUDIT.md; docs/MLS-INTEGRATION.md "Round 2"). This wrapper makes that
 * structurally impossible: it THROWS when a committed snapshot exists AND the caller is not
 * inside the scheduled refresh. Every production request path serves listings + photo URLs from
 * the committed snapshot and never reaches here.
 *
 * Exemptions, by design:
 * - Local-dev / bootstrap with no snapshot: nothing else can serve data, so direct DATA calls
 *   are allowed (this is the documented, NOT-serverless-safe `MlsGridClient` fallback).
 * - The scheduled refresh (cron/export): wrap the replication in `runInRefreshContext`.
 *
 * media.mlsgrid.com IMAGE downloads do NOT go through here — that host has a separate budget and
 * is fetched at most once per photo behind an immutable CDN cache (see app/api/media/.../route).
 */

import { getCommittedSnapshot } from "./snapshot";

let refreshDepth = 0;
let dataCallCount = 0;

/** Marks `fn` as the scheduled-refresh context so DATA-API calls inside it are allowed. */
export async function runInRefreshContext<T>(fn: () => Promise<T>): Promise<T> {
  refreshDepth++;
  try {
    return await fn();
  } finally {
    refreshDepth--;
  }
}

/** GET/POST the MLS Grid DATA API. Throws on any request-path call in production. */
export function mlsGridDataFetch(url: string, init?: RequestInit): Promise<Response> {
  if (refreshDepth === 0 && getCommittedSnapshot()) {
    throw new Error(
      "MLS Grid DATA API called from a non-refresh (request) path. Serve listings and photo " +
        "URLs from the committed snapshot instead (lib/idx/snapshot, lib/idx/media). The DATA " +
        "API's per-account 2 req/sec cap suspends the account when hit per view/crawl.",
    );
  }
  dataCallCount++;
  return fetch(url, init);
}

/** How many DATA-API calls this process has made — for tests + observability. */
export function mlsGridDataCallCount(): number {
  return dataCallCount;
}

/** Test hook — reset the DATA-API call counter. */
export function __resetMlsGridDataCallCount(): void {
  dataCallCount = 0;
}
