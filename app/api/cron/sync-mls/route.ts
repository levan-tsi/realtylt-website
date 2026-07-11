import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { MlsGridClient } from "@/lib/idx/mls-grid";
import {
  applyCachedPhotos,
  PHOTO_PREFIX,
  planPhotoFetches,
  SNAPSHOT_PATHNAME,
  SYNC_STATE_PATHNAME,
} from "@/lib/idx/replication";

/** Scheduled MLS replication (Vercel Cron + stale-triggered self-calls; see vercel.json
 * and ReplicatedIdxClient.maybeTriggerSync). Each run:
 *   1. replicates the six-county Active working set from MLS Grid (2-3 sequential,
 *      rate-gapped requests — the ONLY place api.mlsgrid.com is ever called);
 *   2. incrementally copies listing photos into Vercel Blob, budget- and time-bounded
 *      (media.mlsgrid.com has a hard per-ACCOUNT request budget — never mass-fetch;
 *      photo 0 of every listing first, so partial coverage still gives every card an
 *      image; stops cleanly on 429 and resumes next run);
 *   3. publishes mls/listings.json with durable Blob photo URLs for the site to read.
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`; manual triggers must
 * send the same header. Optional query params: ?force=1 (skip freshness guard),
 * ?photoBudget=N (override the per-run photo budget — use small values when probing).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_PHOTO_BUDGET = 150;
const PHOTO_GAP_MS = 250; // pace media CDN requests
const TIME_BUDGET_MS = 240_000; // leave headroom under maxDuration for the final put
const MIN_SYNC_GAP_MS = 5 * 60_000; // overlapping triggers must not double-hit MLS Grid
const ATTEMPT_GAP_MS = 10 * 60_000; // global gap between MLS attempts, success OR failure

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "No Blob store configured" }, { status: 503 });
  }
  if (!process.env.MLS_API_KEY || !process.env.MLS_API_ENDPOINT) {
    return NextResponse.json({ error: "No MLS credentials configured" }, { status: 503 });
  }

  const started = Date.now();
  const q = new URL(req.url).searchParams;
  const photoBudget = Math.min(
    500,
    Math.max(0, Number(q.get("photoBudget") ?? process.env.MLS_PHOTO_BUDGET ?? DEFAULT_PHOTO_BUDGET) || 0),
  );

  const force = q.get("force") === "1"; // manual operator override — NEVER script in a loop
  // Guard 1 — snapshot freshness (cheap: blob metadata only).
  const existing = await list({ prefix: SNAPSHOT_PATHNAME, limit: 1 });
  const prevUploadedAt = existing.blobs[0]?.uploadedAt;
  if (!force && prevUploadedAt && Date.now() - +new Date(prevUploadedAt) < MIN_SYNC_GAP_MS) {
    return NextResponse.json({ skipped: "snapshot is fresh", uploadedAt: prevUploadedAt });
  }
  // Guard 2 — GLOBAL attempt claim, shared by every serverless instance via Blob. MLS Grid
  // blocks the whole ACCOUNT when concurrent syncs push past 2 req/sec (and touching the
  // API while blocked re-arms the block), so at most one attempt — success OR failure —
  // is allowed per ATTEMPT_GAP_MS cluster-wide. The claim is written BEFORE replicating.
  const claim = await list({ prefix: SYNC_STATE_PATHNAME, limit: 1 });
  const lastAttempt = claim.blobs[0]?.uploadedAt;
  if (!force && lastAttempt && Date.now() - +new Date(lastAttempt) < ATTEMPT_GAP_MS) {
    return NextResponse.json({ skipped: "a sync was attempted recently", lastAttempt }, { status: 202 });
  }
  await put(SYNC_STATE_PATHNAME, JSON.stringify({ attemptAt: new Date().toISOString() }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });

  // 1. Replicate listing data. On failure the previous snapshot stays in place untouched.
  let replicated;
  try {
    replicated = await new MlsGridClient().replicate();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[sync-mls] replication failed — previous snapshot kept:", msg);
    return NextResponse.json({ error: `MLS replication failed: ${msg}` }, { status: 502 });
  }

  // 2. Ground truth of already-cached photos (list is paginated).
  const cachedUrls = new Map<string, string>();
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PHOTO_PREFIX, cursor, limit: 1000 });
    for (const b of page.blobs) cachedUrls.set(b.pathname, b.url);
    cursor = page.cursor;
  } while (cursor);

  // 3. Incremental photo top-up.
  const plan = planPhotoFetches(replicated, new Set(cachedUrls.keys()), photoBudget);
  let uploaded = 0;
  let failed = 0;
  let budgetExhausted = false;
  for (const { pathname, url } of plan) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (res.status === 429) {
        budgetExhausted = true; // media budget window exhausted — resume next run
        break;
      }
      if (!res.ok) {
        failed++;
      } else {
        const blob = await put(pathname, await res.arrayBuffer(), {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: res.headers.get("content-type") ?? "image/jpeg",
          cacheControlMaxAge: 31_536_000, // photos are immutable at their pathname
        });
        cachedUrls.set(pathname, blob.url);
        uploaded++;
      }
    } catch (e) {
      failed++;
      console.error(`[sync-mls] photo ${pathname}:`, e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, PHOTO_GAP_MS));
  }

  // 4. Publish the snapshot — only durable Blob photo URLs ever reach the site.
  const listings = applyCachedPhotos(replicated, cachedUrls);
  const syncedAt = new Date().toISOString();
  await put(SNAPSHOT_PATHNAME, JSON.stringify({ syncedAt, listings }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 300,
  });

  const summary = {
    ok: true,
    syncedAt,
    listings: listings.length,
    withPhotos: listings.filter((l) => l.photos.length).length,
    photosCachedTotal: cachedUrls.size,
    photosUploaded: uploaded,
    photosFailed: failed,
    photosPlanned: plan.length,
    budgetExhausted,
    ms: Date.now() - started,
  };
  console.log("[sync-mls]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
