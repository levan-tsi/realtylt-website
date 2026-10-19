import { NextResponse } from "next/server";
import { applyIdxSync, applyReconcile, getMirrorState, getReconcileCandidates, getReconcileState } from "@/lib/idx/db";
import { runInRefreshContext } from "@/lib/idx/mls-fetch";
import { isShowable, MlsGridClient, toOnMarketRow } from "@/lib/idx/mls-grid";
import { mirrorDeps } from "@/lib/idx/mirror-deps";
import { mirrorPhotos } from "@/lib/idx/photo-mirror";
import {
  classifyProbe,
  parseReconcileState,
  planTick,
  sanityOk,
  type OnMarketRow,
  type ReconcileState,
  type ReconcileSummary,
} from "@/lib/idx/reconcile";
import { storageWriteConfig } from "@/lib/idx/storage";

/** DAILY FULL RECONCILIATION of the listing store against the MLS Grid feed (secret-gated).
 *
 * WHY (2026-10-19, lib/idx/reconcile.ts has the long form): the hourly delta deactivates what it
 * SEES change, and a status change whose ModificationTimestamp does not move is invisible to a
 * timestamp query for ever. The full check that day found 14 such rows we still served (closed,
 * hidden or purged in the feed). No delta can catch them; a set comparison can.
 *
 * WHAT A TICK DOES (pg_cron fires four, 09:05-09:50 UTC; lib/idx/reconcile.ts planTick decides):
 *   start   truncate the seen set, begin the walk
 *   resume  continue the walk from the stored @odata.nextLink (a walk is ~94 pages at one page
 *           per 1.1 s; a Vercel function has 300 s, so a slow feed day spans two ticks)
 *   finish  the walk is done: diff it against every row we serve, ask the feed BY ID what each
 *           unexplained row is today, deactivate only the rows it confirms are off the market,
 *           restore served on-market rows we do not hold (bounded, photos mirrored best effort)
 *   noop    today's run is complete
 *
 * THE GATE: a row is deactivated only when the feed, asked by id, answers with a row that fails
 * the delta's own showability test (lib/idx/mls-grid.ts isShowable) or does not answer at all
 * (MLS Grid drops hidden rows after seven days). A row the walk merely skipped (pages shift as
 * the feed changes under them) answers "still on the market" and is left alone, and recorded as
 * seen so it is not asked again. A walk that saw less than half of what we serve is refused
 * (sanityOk) and the watch names it; nothing is judged from it.
 *
 * Budget: ≤ 1 feed request per 1.1 s throughout, ids-only pages (~100 KB), one request per 25
 * probed ids, one per 25 restored rows WITH media. About 100 to 130 requests a day in all.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`. Params: ?force=1 (ignore the once-a-day rule;
 * never abandons a run in progress), ?dry=1 (walk and judge, write nothing to listings; the
 * state records dryAt so the next tick finishes for real from the same walk).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PAGE_GAP_MS = 1100; // strictly under MLS Grid's 2 req/sec per-account cap
const WALK_BUDGET_MS = 175_000; // no new walk page after this; the rest of the tick judges
const TICK_BUDGET_MS = 270_000; // no new feed request after this (maxDuration 300 s)
const PROBE_BATCH = 25;
const RESTORE_BATCH = 25;
const RESTORE_CAP = 100; // restored rows per run; the rest wait for tomorrow (or the delta)
const MIRROR_CAP = 50;
const MIRROR_PHOTO_BUDGET = 400;
const MIRROR_CONCURRENCY = 4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  const dry = q.get("dry") === "1";
  const force = q.get("force") === "1";
  const timeLeft = () => TICK_BUDGET_MS - (Date.now() - started);

  try {
    const stored = parseReconcileState(await getReconcileState());
    const plan = planTick(stored, started, force);
    if (plan === "noop") return NextResponse.json({ ok: true, quiet: true, plan, reconcile: stored });

    const mls = new MlsGridClient();
    let s: ReconcileState;
    if (plan === "start" || !stored) {
      s = { startedAt: new Date(started).toISOString(), nextLink: null, pages: 0, scanned: 0 };
      await applyReconcile({ secret, reset: true, state: s });
    } else {
      s = stored;
    }

    // THE WALK: the feed's whole on-market set, ids only, each page written to the seen set
    // with the cursor beside it, so a tick that dies mid-walk loses one page, not the walk.
    if (plan !== "finish") {
      let walked = 0;
      await runInRefreshContext(async () => {
        while (Date.now() - started < WALK_BUDGET_MS) {
          if (walked > 0) await sleep(PAGE_GAP_MS);
          const page = await mls.walkOnMarket(s.nextLink);
          walked++;
          s.nextLink = page.nextLink;
          s.pages += 1;
          s.scanned += page.rows.length;
          await applyReconcile({ secret, seen: page.rows, state: s });
          if (!s.nextLink) break;
        }
      });
      if (s.nextLink) {
        const out = { ok: true, plan, phase: "walk", partial: true, pages: s.pages, scanned: s.scanned, ms: Date.now() - started };
        console.log("[idx-reconcile]", JSON.stringify(out));
        return NextResponse.json(out);
      }
    }

    // THE JUDGEMENT.
    const cand = await getReconcileCandidates(secret);
    if (!sanityOk(cand.seenTotal, cand.activeTotal)) {
      s.error = `the walk saw ${cand.seenTotal} on-market rows against ${cand.activeTotal} we serve; refusing to judge from it`;
      await applyReconcile({ secret, state: s });
      console.error("[idx-reconcile]", s.error);
      return NextResponse.json({ ok: false, plan, error: s.error }, { status: 502 });
    }

    const summary: ReconcileSummary = {
      feedOnMarket: cand.seenTotal,
      active: cand.activeTotal,
      stale: cand.stale.length,
      probed: 0,
      offMarket: 0,
      absent: 0,
      keptOnMarket: 0,
      deactivated: 0,
      missing: cand.missing.length,
      restored: 0,
      left: 0,
      dry,
    };
    const deactivate: string[] = [];
    const stillOn: OnMarketRow[] = [];
    const offMarketBy: Record<string, number> = {};

    await runInRefreshContext(async () => {
      // Ask the feed, by id, what every candidate is today.
      for (let i = 0; i < cand.stale.length; i += PROBE_BATCH) {
        if (timeLeft() < 15_000) break;
        await sleep(PAGE_GAP_MS);
        const ids = cand.stale.slice(i, i + PROBE_BATCH);
        const rows = await mls.probeByIds(ids);
        const c = classifyProbe(ids, rows, isShowable);
        deactivate.push(...c.offMarket, ...c.absent);
        summary.probed += ids.length;
        summary.offMarket += c.offMarket.length;
        summary.absent += c.absent.length;
        summary.keptOnMarket += c.onMarket.length;
        const on = new Set(c.onMarket);
        for (const r of rows) {
          const id = r.ListingId ?? r.ListingKey;
          if (!id) continue;
          if (on.has(id)) {
            const row = toOnMarketRow(r);
            if (row) stillOn.push(row);
          } else {
            const k = r.MlgCanView === false ? `${r.StandardStatus ?? "?"} (hidden)` : (r.StandardStatus ?? "?");
            offMarketBy[k] = (offMarketBy[k] ?? 0) + 1;
          }
        }
      }
      summary.left = Math.max(0, cand.stale.length - summary.probed);

      // Restore served on-market rows we do not hold: full rows with media, mirrored like the
      // sync mirrors, upserted through the sync's own RPC. Never in a dry run, never before every
      // candidate has been judged, and bounded so a restore can never crowd out the judgement.
      if (!dry && summary.left === 0) {
        const cfg = storageWriteConfig();
        const todo = cand.missing.slice(0, RESTORE_CAP);
        for (let j = 0; j < todo.length; j += RESTORE_BATCH) {
          if (timeLeft() < 40_000) break;
          await sleep(PAGE_GAP_MS);
          const listings = await mls.fetchFullByIds(todo.slice(j, j + RESTORE_BATCH));
          if (!listings.length) continue;
          if (cfg) {
            const prior = await getMirrorState(listings.map((l) => l.id));
            const outcomes = await mirrorPhotos(
              listings.map((l) => ({
                id: l.id,
                photos: l.photos,
                modificationTimestamp: l.modificationTimestamp,
                priorMirrored: prior.get(l.id)?.mirrored,
                priorMirroredTs: prior.get(l.id)?.ts,
                priorPhotoCount: prior.get(l.id)?.count,
              })),
              mirrorDeps(cfg),
              {
                cap: MIRROR_CAP,
                photoBudget: MIRROR_PHOTO_BUDGET,
                timeBudgetMs: Math.max(0, timeLeft() - 20_000),
                concurrency: MIRROR_CONCURRENCY,
                failFastAfter: 24,
              },
            );
            const byId = new Map(outcomes.map((o) => [o.id, o]));
            for (const l of listings) {
              const o = byId.get(l.id);
              if (!o) continue;
              l.photosMirrored = o.photosMirrored;
              l.photosMirroredTs = o.photosMirroredTs;
              l.photosMirroredCount = o.photosMirroredCount;
            }
          }
          const out = await applyIdxSync({ secret, upserts: listings });
          summary.restored += out.upserted;
        }
      }
    });

    if (!dry && deactivate.length) {
      const out = await applyReconcile({ secret, deactivateIds: deactivate, seen: stillOn });
      summary.deactivated = out.deactivated;
    } else if (stillOn.length) {
      await applyReconcile({ secret, seen: stillOn });
    }

    s.summary = summary;
    const nowIso = new Date().toISOString();
    if (dry) s.dryAt = nowIso;
    else if (summary.left === 0) s.completedAt = nowIso;
    await applyReconcile({ secret, state: s });

    const out = {
      ok: true,
      plan,
      phase: dry ? "dry" : summary.left ? "finish-partial" : "complete",
      ...summary,
      offMarketBy,
      deactivatedIds: deactivate.slice(0, 100),
      missingIds: cand.missing.slice(0, 50),
      ms: Date.now() - started,
    };
    console.log("[idx-reconcile]", JSON.stringify(out));
    return NextResponse.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[idx-reconcile] failed:", msg);
    return NextResponse.json({ error: `Reconciliation failed: ${msg}` }, { status: 502 });
  }
}
