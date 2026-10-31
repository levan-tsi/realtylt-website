// One-off backfill of listing-agent contacts into idx_agent_contacts (round 14, 2026-10-30).
//
// WHY: the hourly sync (app/api/cron/idx-sync) now writes agent name / email / phone for every
// listing it upserts, but only for listings that CHANGE. This script fills the rows that already
// exist. INTERNAL DATA ONLY: nothing here touches idx_listings.listing or any public surface.
//
// How: pages the OneKey feed with a narrow $select (no Media expand, so up to 5,000 rows per
// request is allowed: docs/vendor/mlsgrid/api-documentation--api-version-2.0.md:84), follows
// @odata.nextLink (same doc, line 103), paced at one request per 1.1 s (account cap 2 req/s;
// docs/vendor/mlsgrid/home.md "Rate limits"). Only listings that are is_active in idx_listings
// are written, so the set matches the mirror. Upserts in batches of 500.
//
// Usage (Node 22.18+; imports the TypeScript module directly):
//   node scripts/backfill-agent-contacts.mjs [--dry-run] [--env <path to .env.local>] [--max-pages N]
// Credentials are read from the env file and never printed.

import { readFileSync, existsSync } from "node:fs";
import { agentContactOf, writeAgentContacts, AGENT_CONTACT_FIELDS } from "../lib/idx/agent-contacts.ts";

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};
const DRY = flag("--dry-run");
const MAX_PAGES = Number(opt("--max-pages", "200"));
const PAGE_TOP = 2000;
const GAP_MS = 1100;
const BATCH = 500;

const envPath = [opt("--env", ""), ".env.local", "../realtylt-website/.env.local"].find((p) => p && existsSync(p));
if (!envPath) throw new Error("no .env.local found; pass --env <path>");
const envText = readFileSync(envPath, "utf8");
const grab = (k) => (envText.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const MLS = grab("MLS_API_ENDPOINT").replace(/\/$/, "");
const KEY = grab("MLS_API_KEY");
const FEED = grab("MLS_FEED_ID") || "onekey2";
const SB = grab("SUPABASE_URL").replace(/\/+$/, "");
const SRK = grab("SUPABASE_SERVICE_ROLE_KEY");
if (!MLS || !KEY || !SB || !SRK) throw new Error("MLS_API_ENDPOINT / MLS_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
const REST = `${SB}/rest/v1`;
const sbH = { apikey: SRK, Authorization: `Bearer ${SRK}` };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const t0 = Date.now();

// 1. The mirror's active ids (paged by id so the set is exact).
async function activeIds() {
  const ids = new Set();
  let from = 0;
  for (;;) {
    const r = await fetch(`${REST}/idx_listings?select=id&is_active=eq.true&order=id.asc`, {
      headers: { ...sbH, Range: `${from}-${from + 999}`, "Range-Unit": "items" },
    });
    if (!r.ok) throw new Error(`active ids ${r.status}`);
    const rows = await r.json();
    for (const x of rows) ids.add(x.id);
    if (rows.length < 1000) break;
    from += 1000;
  }
  return ids;
}

// 2. Feed paging.
const select = new Set([
  "ListingKey", "ListingId", ...AGENT_CONTACT_FIELDS, "StandardStatus", "MlsStatus", "ModificationTimestamp",
]);
const droppedFields = [];
const statuses = ["Active", "Active Under Contract", "Coming Soon", "Pending"];
const filter = `OriginatingSystemName eq '${FEED}' and MlgCanView eq true and StandardStatus in (${statuses.map((s) => `'${s}'`).join(",")})`;
const firstUrl = () =>
  `${MLS}/Property?$filter=${encodeURIComponent(filter)}&$select=${[...select].join(",")}&$top=${PAGE_TOP}`;

async function get(url) {
  const first = url === null; // null = first page, rebuilt after each dropped field
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(first ? firstUrl() : url, { headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" } });
    if (res.ok) return res.json();
    const body = await res.text();
    if (res.status === 429) {
      await sleep(15_000 * (attempt + 1));
      continue;
    }
    const bad = /The field '(\w+)'/.exec(body)?.[1];
    if (res.status === 400 && bad && select.has(bad) && first) {
      select.delete(bad);
      droppedFields.push(bad);
      continue;
    }
    throw new Error(`MLS Grid ${res.status}: ${body.slice(0, 200)}`);
  }
  throw new Error("MLS Grid kept failing");
}

const ids = await activeIds();
console.log(`mirror active ids: ${ids.size}`);

const rows = new Map(); // listing_id -> row (dedup)
let pages = 0;
let scanned = 0;
let url = null;
while ((url !== undefined) && pages < MAX_PAGES) {
  if (pages > 0) await sleep(GAP_MS);
  const data = await get(url);
  pages++;
  const value = data.value ?? [];
  scanned += value.length;
  for (const p of value) {
    const id = p.ListingId ?? p.ListingKey;
    if (id && ids.has(id)) rows.set(id, agentContactOf(p, id));
  }
  console.log(`page ${pages}: ${value.length} feed rows, ${rows.size} matched so far`);
  url = data["@odata.nextLink"];
  if (DRY) break;
}
if (droppedFields.length) console.log(`feed rejected and dropped from $select: ${droppedFields.join(",")}`);

const all = [...rows.values()];
const stats = {
  pages,
  scanned,
  rows: all.length,
  distinctAgents: new Set(all.map((r) => r.agent_mls_id).filter(Boolean)).size,
  withEmail: all.filter((r) => r.agent_email).length,
  withPhone: all.filter((r) => r.agent_phone).length,
};
if (DRY) {
  console.log("DRY RUN (first page only, nothing written):", JSON.stringify(stats));
  process.exit(0);
}
const out = await writeAgentContacts(REST, SRK, all, BATCH);
console.log("DONE", JSON.stringify({ ...stats, ...out, minutes: +((Date.now() - t0) / 60000).toFixed(1) }));
if (out.failed) process.exitCode = 1;
