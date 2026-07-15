import { NextResponse } from "next/server";
import { MlsGridClient } from "@/lib/idx/mls-grid";
import { runInRefreshContext } from "@/lib/idx/mls-fetch";
import { EPOCH_TS } from "@/lib/idx/replication";
import type { Listing } from "@/lib/idx/types";

/** MLS snapshot EXPORT endpoint (secret-gated, manual).
 *
 * WHY this no longer touches Vercel Blob or photos: the free-tier Blob store was PAUSED
 * for 30 days after the photo backfill exceeded the plan's operation limit — a paused
 * store 403s every read AND write, which broke the old Blob-snapshot pipeline and
 * regressed the live site to fixture data. Listings data now ships as a COMMITTED file
 * (data/mls-snapshot.json) bundled into the deploy; this route exists to rebuild that
 * file: it replicates the six-county Active feed from the MLS Grid DATA API (separate
 * budget from the paused Blob and from the media CDN, which this route never calls) and
 * returns the slice as JSON. Each listing carries its PERMANENT MediaURLs (MLS Grid docs: "the
 * media never updates and retains the original Media URL"), captured once here so the request
 * path never re-resolves photos live (that per-view DATA call suspended the account — see
 * docs/mls-fix/AUDIT.md). The /api/media proxy serves those URLs behind an immutable CDN cache.
 *
 * Refresh procedure: `node scripts/export-snapshot.mjs` pages this endpoint with the
 * `watermark` param (MLS Grid's documented resume model: ModificationTimestamp-ascending
 * + `gt <watermark>`), merges the slices, writes data/mls-snapshot.json — then commit +
 * deploy. The vercel.json cron schedule was removed (a scheduled run had nowhere durable
 * to persist); a durable auto-refresh store (e.g. Supabase) is a pending owner decision.
 *
 * Paging bounds: each call keeps ≤ KEPT_LIMIT listings so the response body stays well
 * under Vercel's 4.5MB function-response cap, and pages sequentially with PAGE_GAP_MS
 * gaps — strictly under the per-ACCOUNT 2 req/sec MLS Grid limit (the Round-2 lesson).
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. Params: ?watermark=<ISO> (resume point,
 * default epoch = start of the Active window), ?maxPages=N (cap per call, default 20).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const KEPT_LIMIT = 800; // per-response listings cap — keeps the JSON body (now incl. photo URLs) < 4.5MB
const DEFAULT_MAX_PAGES = 20; // ≤20 sequential feed requests per call (~10k rows scanned)
const PAGE_GAP_MS = 1100; // stay strictly under MLS Grid's 2 req/sec per-account cap
const TIME_BUDGET_MS = 240_000; // headroom under maxDuration to serialize the response

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.MLS_API_KEY || !process.env.MLS_API_ENDPOINT) {
    return NextResponse.json({ error: "No MLS credentials configured" }, { status: 503 });
  }

  const started = Date.now();
  const q = new URL(req.url).searchParams;
  let watermark = q.get("watermark") || EPOCH_TS;
  if (Number.isNaN(Date.parse(watermark))) {
    return NextResponse.json({ error: "Invalid watermark" }, { status: 400 });
  }
  const maxPages = Math.min(30, Math.max(1, Number(q.get("maxPages")) || DEFAULT_MAX_PAGES));

  const mls = new MlsGridClient();
  const byId = new Map<string, Listing>();
  let scanned = 0;
  let pages = 0;
  let complete = false;
  try {
    // runInRefreshContext authorizes the DATA-API calls below (mlsGridDataFetch throws on any
    // request-path call in production — the suspension guard, lib/idx/mls-fetch.ts).
    await runInRefreshContext(async () => {
      // One feed page per iteration so the kept-count bound can stop between pages —
      // replicateDeep owns the query/resume mechanics, this loop owns pacing + bounds.
      while (!complete && byId.size < KEPT_LIMIT && pages < maxPages) {
        if (Date.now() - started >= TIME_BUDGET_MS) break;
        if (pages > 0) await new Promise((r) => setTimeout(r, PAGE_GAP_MS));
        const slice = await mls.replicateDeep({
          watermark,
          maxPages: 1,
          deadline: started + TIME_BUDGET_MS,
        });
        pages += slice.pages;
        scanned += slice.scanned;
        complete = slice.complete;
        if (!complete && slice.watermark === watermark) {
          throw new Error(`watermark stuck at ${watermark} — aborting to avoid a loop`);
        }
        watermark = slice.watermark;
        // Keep each listing's PERMANENT MediaURLs so the /api/media proxy serves them without
        // ever re-resolving photos from the DATA API on a request path.
        for (const l of slice.listings) byId.set(l.id, l);
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync-mls] export slice failed:", msg);
    return NextResponse.json({ error: `MLS replication failed: ${msg}` }, { status: 502 });
  }

  const listings = [...byId.values()];
  const summary = {
    ok: true,
    syncedAt: new Date().toISOString(),
    watermark,
    complete,
    scanned,
    pages,
    kept: listings.length,
    ms: Date.now() - started,
  };
  console.log("[sync-mls]", JSON.stringify(summary));
  return NextResponse.json({ ...summary, listings });
}
