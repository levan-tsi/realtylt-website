// Round 23 §2: "test it in every few random way to confirm the data is correct compare to
// one key mls". Extends the round-22 pass (365 rows, six facets, zero violations): random
// filter COMBOS against the live DB through our own API, then every returned row's RAW
// `listing` jsonb (the OneKey replica) re-checked against every predicate independently.
// A filter test that only asserts "the count changed" is worthless — this checks obedience.
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const SB = env.SUPABASE_URL;
const KEY = env.SUPABASE_ANON_KEY;
const base = (process.env.BASE ?? "http://localhost:3100").replace(/\/+$/, "");

// Seeded PRNG so the "random ways" are reproducible in the handoff.
let seed = 20260806;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
const pick = (a) => a[Math.floor(rnd() * a.length)];

const COUNTIES = ["dutchess", "westchester", "orange", "queens", "brooklyn", "ulster", ""];
const FACETS = [
  ["washerDryer", (l) => l.interiorFeatures?.includes("Washer/Dryer Hookup")],
  ["formalDining", (l) => l.interiorFeatures?.includes("Formal Dining")],
  ["municipalUtilities", (l) => l.sewer?.includes("Public Sewer") && l.waterSource?.includes("Public")],
  ["centralAir", (l) => l.cooling?.includes("Central Air")],
  ["basement", (l) => l.basement?.some((v) => ["Finished", "Full", "Partially Finished", "Partial", "Walk-Out Access"].includes(v))],
  ["eatInKitchen", (l) => l.interiorFeatures?.includes("Eat-in Kitchen")],
  ["firstFloorBed", (l) => l.interiorFeatures?.includes("First Floor Bedroom")],
];

let checkedRows = 0, violations = 0;
for (let round = 0; round < 8; round++) {
  const county = pick(COUNTIES);
  const nFacets = 1 + Math.floor(rnd() * 2); // 1-2 facets per combo
  const facets = [];
  while (facets.length < nFacets) {
    const f = pick(FACETS);
    if (!facets.includes(f)) facets.push(f);
  }
  const priceMax = pick(["", "400000", "750000", "1500000"]);
  const qs = new URLSearchParams({ pageSize: "50", status: "Active" });
  if (county) qs.set("county", county);
  if (priceMax) qs.set("priceMax", priceMax);
  for (const [k] of facets) qs.set(k, "1");

  const res = await fetch(`${base}/api/idx/search?${qs}`).then((r) => r.json());
  const rows = res.listings ?? [];
  const label = `${county || "ALL"} ${facets.map((f) => f[0]).join("+")}${priceMax ? " <=$" + priceMax : ""}`;
  if (!rows.length) {
    console.log(`combo ${round + 1}: ${label} -> total ${res.total} (no rows to check)`);
    continue;
  }
  // Raw jsonb for the returned ids, straight from the replica table.
  const ids = rows.map((l) => l.id);
  const raw = await fetch(
    `${SB}/rest/v1/idx_listings?select=id,price,county,listing&id=in.(${ids.map(encodeURIComponent).join(",")})`,
    { headers: { apikey: KEY, authorization: `Bearer ${KEY}` } },
  ).then((r) => r.json());
  const byId = new Map(raw.map((r) => [r.id, r]));
  for (const row of rows) {
    const db = byId.get(row.id);
    if (!db) { console.log(`  MISSING raw row for ${row.id}`); violations++; continue; }
    const L = db.listing;
    checkedRows++;
    for (const [k, predicate] of facets) {
      if (!predicate(L)) { console.log(`  VIOLATION ${row.id}: fails ${k}`); violations++; }
    }
    if (priceMax && db.price > +priceMax) { console.log(`  VIOLATION ${row.id}: price ${db.price} > ${priceMax}`); violations++; }
    if (county && db.county !== county) { console.log(`  VIOLATION ${row.id}: county ${db.county} != ${county}`); violations++; }
    if (L.status ? L.status !== "Active" && db.listing.status !== "Active" : false) { console.log(`  VIOLATION ${row.id}: status`); violations++; }
  }
  console.log(`combo ${round + 1}: ${label} -> total ${res.total}, checked ${rows.length} rows`);
}
console.log(`\nchecked ${checkedRows} row-predicate sets, violations: ${violations}`);
