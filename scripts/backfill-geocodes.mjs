#!/usr/bin/env node
/**
 * Gives every active listing the coordinate of its own street address.
 *
 * WHY THIS EXISTS. The onekey2 subscription does not serve Latitude/Longitude — a $select
 * naming them answers `400 The field 'Latitude' does not exist or is unable to be retrieved`
 * (re-proven three times in round 28, and NOT re-tested here: this script makes zero MLS Grid
 * calls). So lib/idx/mls-grid.ts#coordsOf puts every home at its ZIP CENTROID plus a
 * deterministic jitter inside a fixed 1.77 x 1.86 km box — the same box for a zip holding 12
 * homes and a zip holding 177. At borough zoom a whole zip is a 30 x 32 px square with empty
 * ground between the squares, which is the "batched in circles / cramped-down circles" the
 * owner is looking at. His own example: KEY918376, 7 Ferris Lane, Poughkeepsie. The detail
 * page's Street View shows the real house because Street View geocodes the ADDRESS; the search
 * map put the pin 678 m away because it read the stored centroid.
 *
 * THE GEOCODER IS THE U.S. CENSUS BUREAU'S: free, keyless, 10,000 addresses per POST. Same
 * endpoint the CRM's sold/on-market backfills use.
 *
 * IT NEVER WRITES idx_listings DIRECTLY. Everything goes through the secret-gated
 * idx_geocode_apply RPC, which stores the answer in idx_geocodes and projects it onto the row.
 * idx_sync_apply then MERGES idx_geocodes over every future upsert, so the hourly sync cannot
 * put the home back on its zip centroid. That merge is the whole reason this is durable;
 * scripts/verify-geocode-durability.mjs is the committed proof that it holds.
 *
 *   node scripts/backfill-geocodes.mjs --seed     # import the geocodes the CRM already found
 *   node scripts/backfill-geocodes.mjs            # Census-geocode everything still pending
 *   node scripts/backfill-geocodes.mjs --limit 500
 *   node scripts/backfill-geocodes.mjs --retry    # re-ask for rows an earlier run could not place
 *   node scripts/backfill-geocodes.mjs --dry      # measure, write nothing
 */
import fs from "node:fs";
import { addrKey, censusCsvRow, parseCensusBatch, parseSourceAddress, rejectReason, withoutUnit } from "../lib/idx/geocode.mjs";

const ENV = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = (n) => {
  const m = ENV.match(new RegExp("^" + n + "=(.*)$", "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};
const SB = env("SUPABASE_URL").replace(/\/+$/, "") + "/rest/v1";
const KEY = env("SUPABASE_ANON_KEY");
const SECRET = env("CRON_SECRET");
const H = (extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...extra });

const ZIPS = JSON.parse(fs.readFileSync(new URL("../lib/idx/zip-centroids.json", import.meta.url), "utf8"));
const centroidOf = (zip) => ZIPS[zip] ?? null;

const arg = (n, d = null) => {
  const i = process.argv.indexOf("--" + n);
  return i === -1 ? d : process.argv[i + 1];
};
const flag = (n) => process.argv.includes("--" + n);
const LIMIT = arg("limit") ? Number(arg("limit")) : null;
const DRY = flag("dry");

/** Census takes 10k per POST; 1,000 keeps a failure cheap and the run observable. */
const CENSUS_BATCH = 1000;
/** Small write batches: idx_geocode_apply updates idx_listings, which the hourly sync and
 * scripts/backfill-photos.mjs also update. PostgreSQL offers no way to force row lock order,
 * so the contract is small batches plus the jittered retry below. */
const WRITE_BATCH = 200;

/** PostgREST clamps a plain limit to 1,000 rows — page with Range or you silently get a prefix. */
async function page(path, onRows) {
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${SB}/${path}`, { headers: H({ Range: `${from}-${from + 999}` }) });
    if (!r.ok) throw new Error(`${path} ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const rows = await r.json();
    if (!Array.isArray(rows) || rows.length === 0) return;
    if (onRows(rows) === false) return;
    if (rows.length < 1000) return;
  }
}

/** Active homes still standing on a zip centroid, oldest listing id first (stable paging). */
async function listPending() {
  const out = [];
  const triedFilter = flag("retry") ? "" : "&listing->>geocodeTried=is.null";
  await page(
    `idx_listings?is_active=eq.true&geocoded=is.null${triedFilter}` +
      `&select=id,address,city,zip&address=not.is.null&order=id.asc`,
    (rows) => {
      for (const r of rows) {
        if (!r.address) continue;
        // A zip we do not serve is worse than no zip at all: the feed carries a Kingston
        // listing stamped 43164 (Ohio) and a Carmel one stamped 14477 (Albion), and handing
        // either to a geocoder moves the home hundreds of miles. Blank it and let the CITY
        // carry the query — that is why 12 zip-less rows had no coordinate at all.
        //
        // `zip` stays the STORED value because addrKey() must match the SQL idx_addr_key(),
        // which reads listing->>'zip'; only `queryZip` — what we hand the geocoder — is blanked.
        out.push({
          id: r.id, address: r.address, city: r.city ?? "", state: "NY",
          zip: r.zip ?? "",
          queryZip: r.zip && centroidOf(r.zip) ? r.zip : "",
        });
        if (LIMIT && out.length >= LIMIT) return false;
      }
    },
  );
  return out;
}

/** 40P01 is the hourly sync or the photo backfill holding the same rows — back off and retry. */
async function apply(rows, misses) {
  if (DRY) return { saved: 0, applied: 0, missed: 0 };
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`${SB}/rpc/idx_geocode_apply`, {
      method: "POST",
      headers: H(),
      body: JSON.stringify({ _secret: SECRET, _rows: rows, _misses: misses }),
    });
    if (r.ok) return await r.json();
    const text = await r.text();
    if (!text.includes("40P01") || attempt === 3) throw new Error(`idx_geocode_apply ${r.status}: ${text.slice(0, 300)}`);
    const wait = 500 * 2 ** attempt + Math.floor(Math.random() * 400);
    console.log(`  deadlocked with another writer — retrying in ${wait}ms (attempt ${attempt + 1}/4)`);
    await new Promise((s) => setTimeout(s, wait));
  }
  throw new Error("idx_geocode_apply: unreachable");
}

async function write(hits, misses, stats) {
  for (let i = 0; i < hits.length; i += WRITE_BATCH) {
    const out = await apply(hits.slice(i, i + WRITE_BATCH), []);
    stats.saved += out.saved ?? 0;
    stats.applied += out.applied ?? 0;
  }
  for (let i = 0; i < misses.length; i += WRITE_BATCH) {
    const out = await apply([], misses.slice(i, i + WRITE_BATCH));
    stats.missed += out.missed ?? 0;
  }
}

// ── seed: the geocodes the CRM already paid for ──────────────────────────────────────────
//
// listing_geocodes (CRM migration 0151) holds 26,112 rows built on 2026-08-06 from THIS table's
// own address column, so the address strings line up exactly. Re-geocoding them would be
// thousands of pointless requests. Every row still passes the same gate as a fresh one, and its
// source_address must still describe the address the listing carries TODAY — a geocode is an
// answer about an address, not about an id.
async function seed(stats) {
  const pending = new Map(
    (await listPending()).map((r) => [r.id, r]),
  );
  console.log(`seed: ${pending.size} active listings pending`);
  const hits = [];
  await page(`listing_geocodes?select=listing_id,lat,lng,source,precision,matched_address,source_address`, (rows) => {
    for (const g of rows) {
      const row = pending.get(g.listing_id);
      if (!row) continue;
      const parsed = parseSourceAddress(g.source_address);
      if (!parsed || addrKey(parsed.address, parsed.zip) !== addrKey(row.address, row.zip)) {
        stats.rejected.set("source address no longer matches the listing", (stats.rejected.get("source address no longer matches the listing") ?? 0) + 1);
        continue;
      }
      const why = rejectReason({ lat: g.lat, lng: g.lng, precision: g.precision }, centroidOf(row.zip));
      if (why) {
        const k = why.replace(/[\d.]+km/, "Nkm");
        stats.rejected.set(k, (stats.rejected.get(k) ?? 0) + 1);
        continue;
      }
      hits.push({
        id: g.listing_id, lat: g.lat, lng: g.lng,
        source: g.source, precision: g.precision,
        matchedAddress: g.matched_address, addrKey: addrKey(row.address, row.zip),
      });
    }
  });
  console.log(`seed: ${hits.length} accepted, ${[...stats.rejected.values()].reduce((a, b) => a + b, 0)} rejected`);
  await write(hits, [], stats);
}

// ── census pass ──────────────────────────────────────────────────────────────────────────
async function geocodeBatch(rows, streetOnly = false) {
  const fd = new FormData();
  const lines = rows.map((r) => censusCsvRow(r, streetOnly ? withoutUnit(r.address) : r.address));
  fd.append("addressFile", new Blob([lines.join("\n") + "\n"], { type: "text/csv" }), "a.csv");
  fd.append("benchmark", "Public_AR_Current");
  const res = await fetch("https://geocoding.geo.census.gov/geocoder/locations/addressbatch", {
    method: "POST",
    body: fd,
    signal: AbortSignal.timeout(300_000),
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

// ── the paid fallback, opt-in on purpose ─────────────────────────────────────────────────
//
// Google finds addresses the Census file simply does not have, but it BILLS at about $5 per
// thousand, so nobody should spend the owner's money by running a script with no arguments.
// `--google` is that consent and the run prints the bill before it starts.
//
// ROOFTOP and RANGE_INTERPOLATED are a building. GEOMETRIC_CENTER and APPROXIMATE are a street
// or a postcode — which is the very thing this whole exercise exists to stop showing, and
// Google answers OK with one of those for almost any junk it is handed. They are not accepted.
const GOOGLE_OK = new Set(["ROOFTOP", "RANGE_INTERPOLATED"]);
const GOOGLE_CONCURRENCY = 5;

async function googleOne(row, key) {
  const q = encodeURIComponent(`${row.address}, ${row.city ?? ""}, ${row.state ?? "NY"} ${row.queryZip ?? row.zip}`.trim());
  const j = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${key}`, {
    signal: AbortSignal.timeout(20_000),
  })
    .then((r) => r.json())
    .catch(() => null);
  const best = j?.results?.[0];
  const loc = best?.geometry?.location;
  const type = best?.geometry?.location_type;
  if (!loc || !GOOGLE_OK.has(type)) return null;
  return {
    id: row.id, lat: loc.lat, lng: loc.lng, source: "google", precision: type,
    matchedAddress: best.formatted_address ?? null, addrKey: addrKey(row.address, row.zip),
  };
}

async function google(stats) {
  const key = env("GOOGLE_MAPS_API_KEY") || env("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  if (!key) throw new Error("--google needs a Google Maps key in .env.local");
  const pending = await listPending();
  console.log(
    `google: ${pending.length} listings, about $${((pending.length * 5) / 1000).toFixed(2)} at $5/1000`,
  );
  if (DRY) return;
  const zipOf = new Map(pending.map((r) => [r.id, r.zip]));
  for (let i = 0; i < pending.length; i += WRITE_BATCH) {
    const slice = pending.slice(i, i + WRITE_BATCH);
    const found = [];
    for (let j = 0; j < slice.length; j += GOOGLE_CONCURRENCY) {
      const got = await Promise.all(slice.slice(j, j + GOOGLE_CONCURRENCY).map((r) => googleOne(r, key)));
      for (const h of got) if (h) found.push(h);
    }
    const ok = [];
    for (const h of found) {
      const why = rejectReason(h, centroidOf(zipOf.get(h.id)));
      if (why) {
        const k = why.replace(/[\d.]+km/, "Nkm");
        stats.rejected.set(k, (stats.rejected.get(k) ?? 0) + 1);
        continue;
      }
      ok.push(h);
    }
    const placedIds = new Set(ok.map((h) => h.id));
    const unplaced = slice.filter((r) => !placedIds.has(r.id)).map((r) => ({ id: r.id, addrKey: addrKey(r.address, r.zip) }));
    await write(ok, unplaced, stats);
    console.log(`${Math.min(i + WRITE_BATCH, pending.length)}/${pending.length}  placed ${ok.length}  unplaced ${unplaced.length}`);
  }
}

async function census(stats) {
  const pending = await listPending();
  console.log(`census: ${pending.length} active listings pending`);
  const zipOf = new Map(pending.map((r) => [r.id, r.zip]));
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
        ok.push(h);
      }
      const unplaced = [...misses.map((m) => ({ id: m.id, addrKey: addrKey(m.address, m.zip) }))];
      await write(ok, unplaced, stats);
      console.log(
        `${Math.min(i + CENSUS_BATCH, pending.length)}/${pending.length}  placed ${ok.length}  unplaced ${misses.length}  ${Math.round((Date.now() - t0) / 1000)}s`,
      );
    } catch (e) {
      // A batch that fails is a batch to retry, not a run to abandon: the next invocation picks
      // up exactly the rows this one did not write.
      console.log(`${Math.min(i + CENSUS_BATCH, pending.length)}/${pending.length}  BATCH FAILED: ${String(e).slice(0, 200)}`);
    }
  }
}

const stats = { saved: 0, applied: 0, missed: 0, rejected: new Map() };
if (flag("seed")) await seed(stats);
else if (flag("google")) await google(stats);
else await census(stats);

console.log(`\ndone${DRY ? " (dry run — nothing written)" : ""}: saved ${stats.saved}, applied to listings ${stats.applied}, marked unplaceable ${stats.missed}`);
if (stats.rejected.size) {
  console.log("rejected by the quality gate:");
  for (const [why, n] of [...stats.rejected].sort((a, b) => b[1] - a[1])) console.log(`  ${n}  ${why}`);
}
