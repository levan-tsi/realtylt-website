#!/usr/bin/env node
/**
 * Gives every recent CLOSED SALE the coordinate of its own street address, so the CMA and
 * market-report maps can place comps.
 *
 * WHY THIS EXISTS. idx_sold rows arrive with NO lat/lng (the onekey2 feed serves no coordinates),
 * so the store is `sold_geocodes` (PK listing_key) — the exact table the reports read. Sold
 * geocoding ran only from THIS kind of manual pass and stalled ~2026-08-06, so every sale closed
 * since sat un-mappable. The hourly cron (app/api/cron/idx-sync) now keeps NEW sales current; this
 * script fills the historical backlog.
 *
 * THE GEOCODER IS THE U.S. CENSUS BUREAU'S: free, keyless, 10,000 addresses per POST, and NOT MLS
 * Grid — this makes ZERO media.mlsgrid.com or Data-API calls. Same parser and same believability
 * gate as scripts/backfill-geocodes.mjs (lib/idx/geocode.mjs#rejectReason), shared rather than
 * reimplemented so a backfill and the cron can never disagree about where a house is.
 *
 * A "miss" (an address Census cannot place) is left UNWRITTEN — a sold row carries no tried-marker,
 * so the next run simply asks again. Writes go straight to sold_geocodes with the service-role key
 * (the store is not visitor-writable) and merge on the listing_key PK, so a re-run is idempotent.
 *
 *   node scripts/backfill-sold-geocodes.mjs               # last 6 months, everything pending
 *   node scripts/backfill-sold-geocodes.mjs --months 12
 *   node scripts/backfill-sold-geocodes.mjs --limit 2000
 *   node scripts/backfill-sold-geocodes.mjs --dry        # measure, write nothing
 */
import fs from "node:fs";
import { censusCsvRow, parseCensusBatch, rejectReason, withoutUnit } from "../lib/idx/geocode.mjs";

const ENV = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = (n) => {
  const m = ENV.match(new RegExp("^" + n + "=(.*)$", "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};
const SB = env("SUPABASE_URL").replace(/\/+$/, "") + "/rest/v1";
const ANON = env("SUPABASE_ANON_KEY");
const SERVICE = env("SUPABASE_SERVICE_ROLE_KEY");
if (!SERVICE) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing — sold_geocodes is not visitor-writable (npx vercel env pull .env.local)");
const R = { apikey: ANON, Authorization: `Bearer ${ANON}` }; // reads: anon is enough
const W = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const ZIPS = JSON.parse(fs.readFileSync(new URL("../lib/idx/zip-centroids.json", import.meta.url), "utf8"));
const centroidOf = (zip) => ZIPS[zip] ?? null;

const arg = (n, d = null) => {
  const i = process.argv.indexOf("--" + n);
  return i === -1 ? d : process.argv[i + 1];
};
const flag = (n) => process.argv.includes("--" + n);
const MONTHS = Math.max(1, Math.min(60, Number(arg("months", "6")) || 6));
const LIMIT = arg("limit") ? Number(arg("limit")) : null;
const DRY = flag("dry");

/** Census takes 10k per POST; 1,000 keeps a failure cheap and the run observable. */
const CENSUS_BATCH = 1000;
const WRITE_BATCH = 200;

/** PostgREST clamps a plain limit to 1,000 rows — page with Range or you silently get a prefix. */
async function page(path, onRows) {
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SB}/${path}`, { headers: { ...R, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`${path} ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    if (!Array.isArray(rows) || rows.length === 0) return;
    if (onRows(rows) === false) return;
    if (rows.length < 1000) return;
  }
}

/** Which of these listing_keys already have a sold_geocodes row. */
async function alreadyGeocoded(keys) {
  const have = new Set();
  const CH = 150;
  for (let i = 0; i < keys.length; i += CH) {
    const slice = keys.slice(i, i + CH).map((k) => encodeURIComponent(k));
    const r = await fetch(`${SB}/sold_geocodes?listing_key=in.(${slice.join(",")})&select=listing_key`, { headers: R });
    if (!r.ok) throw new Error(`sold_geocodes read ${r.status}: ${(await r.text()).slice(0, 200)}`);
    for (const x of await r.json()) have.add(x.listing_key);
  }
  return have;
}

/** Closed sales in the window with no sold_geocodes entry, newest first. */
async function listPending() {
  const since = new Date(Date.now() - MONTHS * 30.44 * 864e5).toISOString().slice(0, 10);
  const all = [];
  await page(
    `idx_sold?close_date=gte.${since}&address=not.is.null&select=listing_key,address,city,state,zip&order=close_date.desc`,
    (rows) => {
      for (const r of rows) {
        if (!r.address) continue;
        // A zip we do not serve moves the home hundreds of miles (a Kingston row stamped 43164/Ohio),
        // so blank the QUERY zip and let the city carry it — `zip` stays stored for source_address.
        all.push({
          id: r.listing_key, address: r.address, city: r.city ?? "", state: r.state ?? "NY",
          zip: r.zip ?? "", queryZip: r.zip && centroidOf(r.zip) ? r.zip : "",
        });
        if (LIMIT && all.length >= LIMIT) return false;
      }
    },
  );
  const have = await alreadyGeocoded(all.map((r) => r.id));
  return all.filter((r) => !have.has(r.id));
}

async function geocodeBatch(rows, streetOnly = false) {
  const fd = new FormData();
  const lines = rows.map((r) => censusCsvRow(r, streetOnly ? withoutUnit(r.address) : r.address));
  fd.append("addressFile", new Blob([lines.join("\n") + "\n"], { type: "text/csv" }), "a.csv");
  fd.append("benchmark", "Public_AR_Current");
  const res = await fetch("https://geocoding.geo.census.gov/geocoder/locations/addressbatch", {
    method: "POST", body: fd, signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error("census http " + res.status);
  const { hits, misses } = parseCensusBatch(await res.text(), rows);
  // SECOND PASS on the building rather than the unit, once only.
  if (!streetOnly && misses.length) {
    const retryable = misses.filter((r) => withoutUnit(r.address) && withoutUnit(r.address) !== r.address);
    if (retryable.length) {
      const second = await geocodeBatch(retryable, true);
      const placed = new Set(second.hits.map((h) => h.id));
      return { hits: [...hits, ...second.hits], misses: misses.filter((m) => !placed.has(String(m.id))) };
    }
  }
  return { hits, misses };
}

/** The CRM's stored shape: `street, city, ST zip`. */
const srcAddr = (r) => `${r.address}, ${r.city ?? ""}, ${r.state ?? "NY"} ${r.zip}`.replace(/\s+/g, " ").trim();

async function upsert(records, stats) {
  if (DRY) { stats.saved += records.length; return; }
  const now = new Date().toISOString();
  for (let i = 0; i < records.length; i += WRITE_BATCH) {
    const body = records.slice(i, i + WRITE_BATCH).map((x) => ({ ...x, created_at: now, updated_at: now }));
    const r = await fetch(`${SB}/sold_geocodes`, {
      method: "POST",
      headers: { ...W, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`sold_geocodes upsert ${r.status}: ${(await r.text()).slice(0, 300)}`);
    stats.saved += body.length;
  }
}

const stats = { saved: 0, missed: 0, rejected: new Map() };
const pending = await listPending();
console.log(`sold-geocode: ${pending.length} closed sales pending in the last ${MONTHS} months`);
const zipOf = new Map(pending.map((r) => [r.id, r.zip]));
const rowById = new Map(pending.map((r) => [r.id, r]));

for (let i = 0; i < pending.length; i += CENSUS_BATCH) {
  const slice = pending.slice(i, i + CENSUS_BATCH);
  const t0 = Date.now();
  try {
    const { hits, misses } = await geocodeBatch(slice);
    const ok = [];
    for (const h of hits) {
      const why = rejectReason(h, centroidOf(zipOf.get(h.id)));
      if (why) {
        const k = why.replace(/[\d.]+km/, "Nkm");
        stats.rejected.set(k, (stats.rejected.get(k) ?? 0) + 1);
        continue;
      }
      const row = rowById.get(h.id);
      if (!row) continue;
      ok.push({
        listing_key: h.id, lat: h.lat, lng: h.lng, source: h.source,
        precision: h.precision, matched_address: h.matchedAddress, source_address: srcAddr(row),
      });
    }
    stats.missed += misses.length;
    await upsert(ok, stats);
    console.log(
      `${Math.min(i + CENSUS_BATCH, pending.length)}/${pending.length}  placed ${ok.length}  unplaced ${misses.length}  ${Math.round((Date.now() - t0) / 1000)}s`,
    );
  } catch (e) {
    // A batch that fails is a batch to retry, not a run to abandon: the next invocation picks up
    // exactly the rows this one did not write.
    console.log(`${Math.min(i + CENSUS_BATCH, pending.length)}/${pending.length}  BATCH FAILED: ${String(e).slice(0, 200)}`);
  }
}

console.log(`\ndone${DRY ? " (dry run — nothing written)" : ""}: saved ${stats.saved}, unplaceable ${stats.missed}`);
if (stats.rejected.size) {
  console.log("rejected by the quality gate:");
  for (const [why, n] of [...stats.rejected].sort((a, b) => b[1] - a[1])) console.log(`  ${n}  ${why}`);
}
