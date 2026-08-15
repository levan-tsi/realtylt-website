#!/usr/bin/env node
/**
 * COMMITTED GATE — are the coordinates on the map actually where the homes are?
 *
 * The map cannot be trusted just because a backfill reported success: the backfill and the
 * stored value come from the SAME geocoder, so checking one against the other proves only that
 * the copy worked. This asks a DIFFERENT geocoder about the same street address and measures
 * the disagreement.
 *
 *   stored source census  ->  cross-checked against GOOGLE
 *   stored source google  ->  cross-checked against the CENSUS one-line API
 *
 * Two homes at the same address must land in the same place whoever is asked. A median
 * disagreement of a few tens of metres is two geocoders arguing about which end of the roof to
 * use. A median in the hundreds of metres means the coordinates are not addresses.
 *
 * It also pins the OWNER'S OWN EXAMPLE — KEY918376, 7 Ferris Lane, Poughkeepsie, whose detail
 * page Street View shows the true house because Street View geocodes the ADDRESS while the
 * search map used to read a zip centroid 729 m away.
 *
 * And it checks a contract no unit test can reach: that JS addrKey() and SQL idx_addr_key()
 * agree on real rows. They are compared inside idx_sync_apply to decide whether a geocode
 * still applies, so if they ever drift, every geocode silently stops being honoured and the
 * map quietly reverts to zip centroids with nothing failing.
 *
 *   node scripts/verify-geocode-truth.mjs             # 45 homes (about $0.20 of Google)
 *   node scripts/verify-geocode-truth.mjs --n 120
 *   node scripts/verify-geocode-truth.mjs --json out.json
 */
import fs from "node:fs";
import { addrKey, haversineMeters } from "../lib/idx/geocode.mjs";

const ENV = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = (n) => {
  const m = ENV.match(new RegExp("^" + n + "=(.*)$", "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};
const SB = env("SUPABASE_URL").replace(/\/+$/, "") + "/rest/v1";
const KEY = env("SUPABASE_ANON_KEY");
const GKEY = env("GOOGLE_MAPS_API_KEY") || env("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
const H = (extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...extra });

const arg = (n, d = null) => {
  const i = process.argv.indexOf("--" + n);
  return i === -1 ? d : process.argv[i + 1];
};
const N = Number(arg("n", 45));

/** The gate. A median beyond this is not "two geocoders rounding differently". */
const MEDIAN_LIMIT_M = 150;
/** The owner's named example must be right, not just the population. */
const FERRIS_LIMIT_M = 150;
/** Worth a human look, not automatically a failure — rural parcels legitimately disagree. */
const OUTLIER_M = 300;

const sel = "id,address,city,zip,county,lat,lng,listing";

async function countActiveGeocoded() {
  const r = await fetch(`${SB}/idx_listings?is_active=eq.true&geocoded=is.true&select=id`, {
    headers: H({ Range: "0-0", Prefer: "count=exact" }),
  });
  return Number(r.headers.get("content-range")?.split("/")[1] ?? 0);
}

/** N homes spread evenly across the whole active geocoded set, ordered by id — ids are not
 * grouped by county, so even offsets give a wide geographic spread without a random seed that
 * would make two runs incomparable. */
async function sample(total) {
  const rows = [];
  for (let i = 0; i < N; i++) {
    const off = Math.floor((i * total) / N);
    const r = await fetch(`${SB}/idx_listings?is_active=eq.true&geocoded=is.true&select=${sel}&order=id.asc`, {
      headers: H({ Range: `${off}-${off}` }),
    });
    const [row] = await r.json();
    if (row) rows.push(row);
  }
  return rows;
}

async function google(row) {
  const q = encodeURIComponent(`${row.address}, ${row.city ?? ""}, NY ${row.zip}`.trim());
  const j = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${GKEY}`, {
    signal: AbortSignal.timeout(20_000),
  }).then((r) => r.json()).catch(() => null);
  const best = j?.results?.[0];
  const loc = best?.geometry?.location;
  const type = best?.geometry?.location_type;
  if (!loc || !(type === "ROOFTOP" || type === "RANGE_INTERPOLATED")) return null;
  return { lat: loc.lat, lng: loc.lng, how: `google/${type}` };
}

async function censusOneLine(row) {
  const q = encodeURIComponent(`${row.address}, ${row.city ?? ""}, NY ${row.zip}`.trim());
  const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${q}&benchmark=Public_AR_Current&format=json`;
  const j = await fetch(url, { signal: AbortSignal.timeout(20_000) }).then((r) => r.json()).catch(() => null);
  const m = j?.result?.addressMatches?.[0]?.coordinates;
  if (!m) return null;
  return { lat: m.y, lng: m.x, how: "census/oneline" };
}

/** Does the SQL that guards every geocode agree with the JS that writes them? */
async function addrKeyContract(rows) {
  const bad = [];
  for (const row of rows.slice(0, 12)) {
    const r = await fetch(`${SB}/rpc/idx_addr_key`, {
      method: "POST", headers: H(), body: JSON.stringify({ _listing: row.listing }),
    });
    if (!r.ok) return { checked: 0, bad: [`rpc idx_addr_key ${r.status}`] };
    const sql = JSON.parse(await r.text());
    const js = addrKey(row.address, row.zip);
    if (sql !== js) bad.push(`${row.id}: sql=${JSON.stringify(sql)} js=${JSON.stringify(js)}`);
  }
  return { checked: Math.min(rows.length, 12), bad };
}

// ── run ──────────────────────────────────────────────────────────────────────────────────
const total = await countActiveGeocoded();
console.log(`active listings on a measured coordinate: ${total}`);
const rows = await sample(total);
console.log(`sampling ${rows.length} of them, cross-checking each against an independent geocoder\n`);

const results = [];
for (const row of rows) {
  // Census supplied ~96% of stored values, so Google is the independent witness for almost
  // every row; fall back to the Census one-line API (a different service from the batch one)
  // when Google will not give a building-grade answer.
  const check = (await google(row)) ?? (await censusOneLine(row));
  if (!check) {
    results.push({ ...row, skipped: true });
    continue;
  }
  const d = haversineMeters(row.lat, row.lng, check.lat, check.lng);
  results.push({ ...row, d, how: check.how });
}

const measured = results.filter((r) => !r.skipped).sort((a, b) => a.d - b.d);
const pct = (p) => measured.length ? measured[Math.min(measured.length - 1, Math.floor(p * measured.length))].d : NaN;

const BUCKETS = [25, 50, 100, 150, 300, 600, 1200, Infinity];
const hist = new Map(BUCKETS.map((b) => [b, 0]));
for (const r of measured) for (const b of BUCKETS) if (r.d <= b) { hist.set(b, hist.get(b) + 1); break; }

console.log("distance between our stored coordinate and an independent geocode");
let cum = 0;
for (const b of BUCKETS) {
  const n = hist.get(b);
  cum += n;
  const label = b === Infinity ? "  > 1200m" : `  <= ${String(b).padStart(4)}m`;
  console.log(`${label}  ${String(n).padStart(3)}  ${"#".repeat(n)}${n ? ` (${((cum / measured.length) * 100).toFixed(0)}% cumulative)` : ""}`);
}
console.log(`\n  n=${measured.length}  median ${pct(0.5).toFixed(0)}m  p90 ${pct(0.9).toFixed(0)}m  max ${measured.length ? measured[measured.length - 1].d.toFixed(0) : "-"}m`);
console.log(`  ${results.filter((r) => r.skipped).length} skipped (no independent building-grade answer)`);

const outliers = measured.filter((r) => r.d > OUTLIER_M);
if (outliers.length) {
  console.log(`\n${outliers.length} beyond ${OUTLIER_M}m — each one investigated by hand in the round doc:`);
  for (const o of outliers) console.log(`  ${o.d.toFixed(0).padStart(6)}m  ${o.id}  ${o.address}, ${o.city} ${o.zip} (${o.county}) via ${o.how}`);
}

// The owner's own example.
const fr = await fetch(`${SB}/idx_listings?id=eq.KEY918376&select=${sel}`, { headers: H() }).then((r) => r.json());
let ferrisFail = false;
if (!fr[0]) {
  console.log("\nKEY918376 is no longer active — cannot check the owner's example.");
} else {
  const truth = await google(fr[0]);
  const d = truth ? haversineMeters(fr[0].lat, fr[0].lng, truth.lat, truth.lng) : NaN;
  ferrisFail = !(d < FERRIS_LIMIT_M);
  console.log(`\nKEY918376  7 Ferris Lane, Poughkeepsie: ${d.toFixed(0)}m from an independent rooftop geocode  ${ferrisFail ? "FAIL" : "OK"}`);
}

const contract = await addrKeyContract(rows);
console.log(`addrKey contract: ${contract.checked} rows compared JS vs SQL, ${contract.bad.length} mismatches`);
for (const b of contract.bad) console.log(`  ${b}`);

if (arg("json")) fs.writeFileSync(arg("json"), JSON.stringify({ total, measured: measured.map(({ listing, ...r }) => r) }, null, 1));

const medianFail = !(pct(0.5) <= MEDIAN_LIMIT_M);
const fail = medianFail || ferrisFail || contract.bad.length > 0;
console.log(`\n${fail ? "FAIL" : "PASS"}: median ${pct(0.5).toFixed(0)}m (limit ${MEDIAN_LIMIT_M}m), KEY918376 ${ferrisFail ? "off" : "ok"}, addrKey ${contract.bad.length ? "DRIFTED" : "agrees"}`);
process.exit(fail ? 1 : 0);
