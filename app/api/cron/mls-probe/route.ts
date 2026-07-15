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
 *
 * RAW-ROW mode: ?ids=KEY1,KEY2 (max 20) — one request returning the exact raw rows with a
 * WIDER $select than the sync uses (StreetDirPrefix/StreetDirSuffix/UnitNumber, …) plus the
 * feed's photo COUNT per listing, so stored mappings can be audited against the source and
 * candidate fields tested before they join SELECT_FIELDS. Unsupported fields self-heal the
 * same way the sync does (drop the named field, retry) and are reported in the response.
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

  const idsParam = q.get("ids");
  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[A-Za-z0-9_-]{1,40}$/.test(s)) // keeps the $filter uninjectable
      .slice(0, 20);
    if (!ids.length) return NextResponse.json({ error: "no valid ids" }, { status: 400 });
    const select = new Set([
      "ListingId", "StreetNumber", "StreetDirPrefix", "StreetName", "StreetSuffix",
      "StreetDirSuffix", "UnitNumber", "City", "PostalCode", "CountyOrParish", "ListPrice",
      "BedroomsTotal", "BathroomsTotalInteger", "BathroomsHalf", "LivingArea", "LotSizeAcres",
      "YearBuilt", "PropertyType", "PropertySubType", "StandardStatus", "ListOfficeName",
      "ModificationTimestamp",
    ]);
    const filter =
      `OriginatingSystemName eq '${feedId}' and MlgCanView eq true and ` +
      `ListingId in (${ids.map((i) => `'${i}'`).join(",")})`;
    const dropped: string[] = [];
    type RawRow = Record<string, unknown> & {
      Media?: { MediaURL?: string; MediaCategory?: string }[];
    };
    try {
      const rows = await runInRefreshContext(async () => {
        for (let attempt = 0; attempt < 8; attempt++) {
          const query = [
            `$filter=${encodeURIComponent(filter)}`,
            `$select=${[...select].join(",")}`,
            "$expand=Media",
            `$top=${Math.max(ids.length, 1)}`,
          ].join("&");
          const res = await mlsGridDataFetch(`${endpoint}/Property?${query}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
              "Accept-Encoding": "gzip",
            },
            signal: AbortSignal.timeout(30_000),
          });
          if (res.ok) return ((await res.json()) as { value?: RawRow[] }).value ?? [];
          const body = await res.text();
          const badField = res.status === 400 ? /The field '(\w+)'/.exec(body)?.[1] : undefined;
          if (badField && body.includes("$select") && select.has(badField)) {
            select.delete(badField);
            dropped.push(badField);
            continue;
          }
          throw new Error(`MLS Grid ${res.status}: ${body.slice(0, 300)}`);
        }
        throw new Error("request kept failing after removing rejected fields");
      });
      const out = rows.map(({ Media, ...rest }) => ({
        ...rest,
        mediaCount: (Media ?? []).filter(
          (m) => !!m.MediaURL && (!m.MediaCategory || m.MediaCategory === "Photo"),
        ).length,
      }));
      return NextResponse.json({
        ok: true, mode: "ids", requested: ids, found: out.length,
        droppedSelectFields: dropped, rows: out,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: `probe failed: ${msg}` }, { status: 502 });
    }
  }

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
