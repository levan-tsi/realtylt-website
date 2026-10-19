// FULL RECONCILIATION of our mirror against the MLS Grid feed — READ-ONLY by default.
//
// Why this exists (2026-10-19): a caller reported a listing that "showed active on our page"
// while Zillow showed the address sold. The hourly delta sync is designed to see every status
// flip, but a delta can only ever be as complete as the windows it processed; the only way to
// KNOW the mirror matches the feed is to ask the feed for its whole on-market set and diff it
// against every row we serve. This script does exactly that, and writes a report.
//
// What it measures:
//   STALE   = rows we serve (is_active) that the feed no longer lists as on-market
//             (Closed / Withdrawn / Expired / Canceled / MlgCanView false / gone) — the bug class.
//   MISSING = on-market feed rows in a served county + type that we do NOT serve.
//   DRIFT   = rows both sides have, where the feed's ModificationTimestamp is newer than ours
//             (a change the delta has not applied) or the status label disagrees.
// Then it asks the feed, unfiltered, what each STALE id is today (batches of 25) so the report
// says WHY each one is stale, not just that it is.
//
// Budget: one $top=500 page per 1.3 s (strictly under the 2 req/s account cap even while the
// hourly sync runs beside it), ~110-130 pages for the whole onekey2 on-market set, plus one
// request per 25 stale ids. No $expand=Media — pages are ids + a few fields, ~100 KB each.
//
// Usage:  node scripts/reconcile-feed.mjs [--out DIR] [--apply]
//   --apply  deactivate the STALE rows through the secret-gated idx_sync_apply RPC
//            (same path the hourly sync uses). Without it nothing is written anywhere.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const KEY = grab("MLS_API_KEY");
const ENDPOINT = grab("MLS_API_ENDPOINT").replace(/\/+$/, "");
const FEED = grab("MLS_FEED_ID") || "onekey2";
const SB = grab("SUPABASE_URL").replace(/\/+$/, "");
const SB_KEY = grab("SUPABASE_SERVICE_ROLE_KEY") || grab("SUPABASE_ANON_KEY");
const SECRET = grab("CRON_SECRET");
if (!KEY || !ENDPOINT || !SB || !SB_KEY) throw new Error("env missing — npx vercel env pull .env.local");

const argv = process.argv.slice(2);
const opt = (f, d) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : d);
const OUT = opt("--out", "scripts/_scratch-reconcile");
const APPLY = argv.includes("--apply");
const GAP_MS = 1300;
const PROBE_BATCH = 25;
const PROBE_MAX_BATCHES = Number(opt("--probe-batches", "200"));
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const feedHeaders = { Authorization: `Bearer ${KEY}`, Accept: "application/json", "Accept-Encoding": "gzip" };
const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` };

async function feedGet(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: feedHeaders, signal: AbortSignal.timeout(60_000) });
    if (res.ok) return res.json();
    const body = await res.text();
    if (res.status === 429 || res.status >= 500) {
      const wait = 15_000 * (attempt + 1);
      console.log(`  feed ${res.status}; waiting ${wait / 1000}s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`MLS Grid ${res.status}: ${body.slice(0, 300)}`);
  }
  throw new Error("feed kept failing");
}

// ---- 1. The feed's whole on-market set (ids + a few fields) -------------------------------
const SALE = ["Active", "Active Under Contract", "Coming Soon", "Pending"];
const filter = `OriginatingSystemName eq '${FEED}' and MlgCanView eq true and StandardStatus in (${SALE.map((s) => `'${s}'`).join(",")})`;
const select = "ListingId,StandardStatus,ModificationTimestamp,PropertyType,CountyOrParish,MlgCanView";
let url = `${ENDPOINT}/Property?$filter=${encodeURIComponent(filter)}&$select=${select}&$top=500`;
const feed = new Map();
let pages = 0;
let nonMonotonic = 0;
let prevTs = "";
const t0 = Date.now();
console.log("walking the feed's on-market set…");
while (url) {
  const body = await feedGet(url);
  for (const r of body.value ?? []) {
    if (!r.ListingId) continue;
    if (prevTs && r.ModificationTimestamp < prevTs) nonMonotonic++;
    prevTs = r.ModificationTimestamp ?? prevTs;
    feed.set(r.ListingId, { s: r.StandardStatus, ts: r.ModificationTimestamp, t: r.PropertyType, c: r.CountyOrParish });
  }
  pages++;
  if (pages % 10 === 0) console.log(`  ${pages} pages, ${feed.size} rows, ${Math.round((Date.now() - t0) / 1000)}s`);
  url = body["@odata.nextLink"] ?? null;
  if (url) await sleep(GAP_MS);
}
console.log(`feed: ${feed.size} on-market rows in ${pages} pages, ${nonMonotonic} out-of-order timestamps, ${Math.round((Date.now() - t0) / 1000)}s`);
writeFileSync(`${OUT}/feed-onmarket.json`, JSON.stringify([...feed], null, 0));

// ---- 2. Every row we serve -----------------------------------------------------------------
const db = new Map();
for (let offset = 0; ; offset += 1000) {
  const r = await fetch(
    `${SB}/rest/v1/idx_listings?select=id,status,property_type,county,modification_ts,updated_at&is_active=eq.true&order=id.asc&limit=1000&offset=${offset}`,
    { headers: sbHeaders, signal: AbortSignal.timeout(60_000) },
  );
  if (!r.ok) throw new Error(`db ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const rows = await r.json();
  for (const x of rows) db.set(x.id, x);
  if (rows.length < 1000) break;
}
console.log(`db: ${db.size} active rows`);

// ---- 3. The diff ----------------------------------------------------------------------------
const normCounty = (c) =>
  (c ?? "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\bcounty\b/g, "")
    .trim();
const dbCounties = new Set([...db.values()].map((x) => (x.county ?? "").toLowerCase()));
const countyAlias = { kings: "brooklyn", "new york": "manhattan", richmond: "staten island" };
const served = (row) => {
  const c = normCounty(row.c);
  return dbCounties.has(countyAlias[c] ?? c);
};
const SERVED_TYPES = new Set(["Residential", "Residential Income", "Land", "Commercial Sale", "Business Opportunity", "Residential Lease"]);

const stale = [...db.entries()].filter(([id]) => !feed.has(id)).map(([id, x]) => ({ id, ...x }));
const missing = [...feed.entries()]
  .filter(([id, f]) => !db.has(id) && served(f) && SERVED_TYPES.has(f.t))
  .map(([id, f]) => ({ id, ...f }));
const drift = [];
const labelOk = (ours, theirs) =>
  ours === theirs ||
  (ours === "Pending" && (theirs === "Pending" || theirs === "Active Under Contract")) ||
  (ours === "Under Contract" && theirs === "Active Under Contract");
for (const [id, x] of db) {
  const f = feed.get(id);
  if (!f) continue;
  const tsBehind = f.ts && x.modification_ts && f.ts > x.modification_ts;
  const statusOff = !labelOk(x.status, f.s);
  if (tsBehind || statusOff) drift.push({ id, ours: x.status, theirs: f.s, ourTs: x.modification_ts, theirTs: f.ts, tsBehind, statusOff });
}

const tally = (rows, key) => {
  const m = new Map();
  for (const r of rows) m.set(r[key] ?? "?", (m.get(r[key] ?? "?") ?? 0) + 1);
  return Object.fromEntries([...m].sort((a, b) => b[1] - a[1]));
};
console.log(`\nSTALE (we serve, feed does not list on-market): ${stale.length}`);
console.log("  by status:", tally(stale, "status"));
console.log("  by type:", tally(stale, "property_type"));
console.log("  by county:", tally(stale, "county"));
console.log("  by mod year:", tally(stale.map((s) => ({ y: (s.modification_ts ?? "?").slice(0, 4) })), "y"));
console.log(`MISSING (feed on-market in a served county+type, we do not serve): ${missing.length}`);
console.log("  by type:", tally(missing, "t"));
console.log("  by county:", tally(missing, "c"));
console.log(`DRIFT (both sides, feed newer or label differs): ${drift.length}`);
console.log("  tsBehind:", drift.filter((d) => d.tsBehind).length, " statusOff:", drift.filter((d) => d.statusOff).length);

// ---- 4. WHY is each stale row stale? Ask the feed, unfiltered, in batches -------------------
const why = [];
const absent = [];
const probeSelect = "ListingId,StandardStatus,MlsStatus,MlgCanView,ModificationTimestamp,StatusChangeTimestamp,PropertyType,CountyOrParish,OffMarketDate";
const batches = Math.min(PROBE_MAX_BATCHES, Math.ceil(stale.length / PROBE_BATCH));
console.log(`\nprobing ${Math.min(stale.length, batches * PROBE_BATCH)} stale ids in ${batches} unfiltered requests…`);
for (let b = 0; b < batches; b++) {
  const ids = stale.slice(b * PROBE_BATCH, (b + 1) * PROBE_BATCH).map((s) => s.id).filter((id) => /^[A-Za-z0-9_-]{1,40}$/.test(id));
  if (!ids.length) break;
  await sleep(GAP_MS);
  const f = `OriginatingSystemName eq '${FEED}' and ListingId in (${ids.map((i) => `'${i}'`).join(",")})`;
  const body = await feedGet(`${ENDPOINT}/Property?$filter=${encodeURIComponent(f)}&$select=${probeSelect}&$top=${ids.length}`);
  const seen = new Set();
  for (const r of body.value ?? []) {
    seen.add(r.ListingId);
    why.push({ id: r.ListingId, status: r.StandardStatus, mls: r.MlsStatus, canView: r.MlgCanView, ts: r.ModificationTimestamp, statusTs: r.StatusChangeTimestamp, type: r.PropertyType, county: r.CountyOrParish, off: r.OffMarketDate });
  }
  for (const id of ids) if (!seen.has(id)) absent.push(id);
  if ((b + 1) % 20 === 0) console.log(`  ${b + 1}/${batches} batches`);
}
console.log(`probe: ${why.length} found, ${absent.length} absent from the feed entirely`);
console.log("  found by StandardStatus:", tally(why, "status"));
console.log("  found by MlgCanView:", tally(why.map((w) => ({ v: String(w.canView) })), "v"));
console.log("  found by mod year:", tally(why.map((w) => ({ y: (w.ts ?? "?").slice(0, 4) })), "y"));

const report = {
  at: new Date().toISOString(),
  feedOnMarket: feed.size,
  feedPages: pages,
  nonMonotonic,
  dbActive: db.size,
  stale: stale.length,
  missing: missing.length,
  drift: drift.length,
  probe: { found: why.length, absent: absent.length },
};
writeFileSync(`${OUT}/report.json`, JSON.stringify({ report, stale, missing, drift, why, absent }, null, 1));
console.log(`\nwritten ${OUT}/report.json`, JSON.stringify(report));

// ---- 5. Optional: deactivate the stale rows through the sync's own RPC ---------------------
if (APPLY) {
  if (!SECRET) throw new Error("CRON_SECRET missing — cannot apply");
  // Only rows the feed CONFIRMED are not on-market (probed and found off-market, or absent for
  // good — MLS Grid drops MlgCanView=false rows from the feed after 7 days). A row the probe never
  // reached stays untouched.
  const confirmed = new Set([...why.filter((w) => !SALE.includes(w.status) || w.canView === false).map((w) => w.id), ...absent]);
  const ids = stale.map((s) => s.id).filter((id) => confirmed.has(id));
  console.log(`\napplying: deactivating ${ids.length} confirmed-stale rows`);
  let done = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const r = await fetch(`${SB}/rest/v1/rpc/idx_sync_apply`, {
      method: "POST",
      headers: { ...sbHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ _secret: SECRET, _deactivate_ids: ids.slice(i, i + 500) }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!r.ok) throw new Error(`idx_sync_apply ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const out = await r.json();
    done += out.deactivated ?? 0;
  }
  console.log(`deactivated ${done}`);
}
