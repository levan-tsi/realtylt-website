/** Committed MLS snapshot — the deploy-bundled listings store (data/mls-snapshot.json).
 *
 * WHY a committed file: the free-tier Vercel Blob store got PAUSED (30 days) after the
 * photo backfill exceeded the plan's operation limit. A paused store 403s every read,
 * so the old Blob-snapshot read path regressed the live site to fixture data. A file
 * bundled into the deploy cannot be paused, quota'd, or 403'd — the request path now
 * depends on nothing external for listings data.
 *
 * Refresh: `node scripts/export-snapshot.mjs` (pages /api/cron/sync-mls), then commit +
 * deploy — manual/periodic for now; a durable auto-refresh store (e.g. Supabase) is a
 * pending owner decision. Each listing carries its PERMANENT MediaURLs (captured at refresh
 * time); the /api/media proxy serves them behind an immutable CDN cache, so the request path
 * never calls the MLS Grid DATA API (the suspension fix — see docs/mls-fix/). A listing with
 * no stored photos falls back to the branded NoPhoto placeholder.
 */

import { parseSnapshot, type MlsSnapshot } from "./replication";
import rawSnapshot from "./snapshot-data";

let cached: MlsSnapshot | null | undefined;

/** The validated committed snapshot, or null when the file is a stub/invalid. */
export function getCommittedSnapshot(): MlsSnapshot | null {
  if (cached === undefined) {
    const snap = parseSnapshot(rawSnapshot);
    cached = snap && snap.listings.length ? snap : null;
    if (!cached) console.error("[idx-snapshot] data/mls-snapshot.json missing or invalid");
  }
  return cached;
}
