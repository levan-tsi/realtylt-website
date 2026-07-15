import { NextResponse } from "next/server";
import { mlsGridDataFetch, runInRefreshContext } from "@/lib/idx/mls-fetch";

/** Feed DIAGNOSTIC (secret-gated, manual): tally what the onekey2 feed ACTUALLY contains —
 * CountyOrParish and PropertyType value spreads — without storing anything. Exists because
 * assumptions about feed values silently drop inventory (e.g. NYC boroughs arriving under
 * unexpected county names, or condo/co-op stock under a PropertyType the sync filter
 * excludes). A few paced pages, aggregate counts only, never called by any page.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`.
 * Params: ?pages=N (default 2, max 6) · ?order=desc|asc (default desc = newest-modified
 * window) · ?status=Active|... (default Active) · ?typeFilter=1 (apply the sync's
 * PropertyType filter; default OFF so exclusions become visible).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PAGE_SIZE = 500;
const PAGE_GAP_MS = 1100; // strictly under MLS Grid's 2 req/sec per-account cap
const STATUSES = new Set(["Active", "Pending", "Coming Soon", "Closed", "Withdrawn", "Expired"]);
const NYC = new Set(["kings", "new york", "richmond", "bronx", "queens", "brooklyn", "manhattan", "staten island"]);

interface Row {
  ListingId?: string;
  CountyOrParish?: string;
  PropertyType?: string;
  PropertySubType?: string;
  StandardStatus?: string;
  City?: string;
  ListPrice?: number;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const endpoint = process.env.MLS_API_ENDPOINT?.replace(/\/$/, "");
  const apiKey = process.env.MLS_API_KEY;
  const feedId = process.env.MLS_FEED_ID || "onekey2";
  if (!endpoint || !apiKey) {
    return NextResponse.json({ error: "No MLS credentials configured" }, { status: 503 });
  }

  const q = new URL(req.url).searchParams;
  const pages = Math.min(6, Math.max(1, Number(q.get("pages")) || 2));
  const order = q.get("order") === "asc" ? "asc" : "desc";
  const status = STATUSES.has(q.get("status") ?? "") ? (q.get("status") as string) : "Active";
  const withTypeFilter = q.get("typeFilter") === "1";

  const parts = [
    `OriginatingSystemName eq '${feedId}'`,
    "MlgCanView eq true",
    `StandardStatus eq '${status}'`,
  ];
  if (withTypeFilter) parts.push("PropertyType in ('Residential','Residential Income')");
  const select = "ListingId,CountyOrParish,PropertyType,PropertySubType,StandardStatus,City,ListPrice";

  const county: Record<string, number> = {};
  const type: Record<string, number> = {};
  const nycByType: Record<string, number> = {};
  const sampleNyc: Row[] = [];
  let scanned = 0;

  try {
    await runInRefreshContext(async () => {
      for (let page = 0; page < pages; page++) {
        if (page > 0) await new Promise((r) => setTimeout(r, PAGE_GAP_MS));
        const query = [
          `$filter=${encodeURIComponent(parts.join(" and "))}`,
          `$select=${select}`,
          ...(order === "desc" ? [`$orderby=${encodeURIComponent("ModificationTimestamp desc")}`] : []),
          `$top=${PAGE_SIZE}`,
          `$skip=${page * PAGE_SIZE}`,
        ].join("&");
        const res = await mlsGridDataFetch(`${endpoint}/Property?${query}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            "Accept-Encoding": "gzip",
          },
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) throw new Error(`MLS Grid ${res.status}: ${(await res.text()).slice(0, 300)}`);
        const rows = ((await res.json()) as { value?: Row[] }).value ?? [];
        scanned += rows.length;
        for (const p of rows) {
          const c = (p.CountyOrParish ?? "(empty)").trim().toLowerCase();
          county[c] = (county[c] ?? 0) + 1;
          const t = p.PropertyType ?? "(empty)";
          type[t] = (type[t] ?? 0) + 1;
          if (NYC.has(c.replace(/\s+county$/, ""))) {
            const key = `${c} | ${t} | ${p.PropertySubType ?? "-"}`;
            nycByType[key] = (nycByType[key] ?? 0) + 1;
            if (sampleNyc.length < 8) sampleNyc.push(p);
          }
        }
        if (rows.length < PAGE_SIZE) break;
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `probe failed: ${msg}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, scanned, status, order, withTypeFilter, county, type, nycByType, sampleNyc });
}
