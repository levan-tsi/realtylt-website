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
// Reseeded for round 24 so the new select facets actually rotate into the combos.
let seed = 20260807;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
const pick = (a) => a[Math.floor(rnd() * a.length)];

const COUNTIES = ["dutchess", "westchester", "orange", "queens", "brooklyn", "ulster", ""];
// [param, value, predicate over the raw OneKey jsonb]. Value "1" = the boolean toggles;
// everything else is a round-24 select token.
const FACETS = [
  ["washerDryer", "1", (l) => l.interiorFeatures?.includes("Washer/Dryer Hookup")],
  ["formalDining", "1", (l) => l.interiorFeatures?.includes("Formal Dining")],
  ["municipalUtilities", "1", (l) => l.sewer?.includes("Public Sewer") && l.waterSource?.includes("Public")],
  ["centralAir", "1", (l) => l.cooling?.includes("Central Air")],
  ["basement", "1", (l) => l.basement?.some((v) => ["Finished", "Full", "Partially Finished", "Partial", "Walk-Out Access"].includes(v))],
  ["eatInKitchen", "1", (l) => l.interiorFeatures?.includes("Eat-in Kitchen")],
  ["firstFloorBed", "1", (l) => l.interiorFeatures?.includes("First Floor Bedroom")],
  // Round-24 select facets — one token, one exact feed value.
  ["heating", "natural-gas", (l) => l.heating?.includes("Natural Gas")],
  ["heating", "oil", (l) => l.heating?.includes("Oil")],
  ["parking", "attached", (l) => l.parkingFeatures?.includes("Attached")],
  ["parking", "driveway", (l) => l.parkingFeatures?.includes("Driveway")],
  ["basementFinished", "1", (l) => l.basement?.includes("Finished")],
  ["basementWalkout", "1", (l) => l.basement?.includes("Walk-Out Access")],
  ["nearTransit", "1", (l) => l.lotFeatures?.includes("Near Public Transit")],
];

let checkedRows = 0, violations = 0;
for (let round = 0; round < 12; round++) {
  const county = pick(COUNTIES);
  const nFacets = 1 + Math.floor(rnd() * 2); // 1-2 facets per combo
  const facets = [];
  while (facets.length < nFacets) {
    const f = pick(FACETS);
    // one value per param — two heating tokens in one query would AND to nothing
    if (!facets.some((g) => g[0] === f[0])) facets.push(f);
  }
  const priceMax = pick(["", "400000", "750000", "1500000"]);
  const qs = new URLSearchParams({ pageSize: "50", status: "Active" });
  if (county) qs.set("county", county);
  if (priceMax) qs.set("priceMax", priceMax);
  for (const [k, v] of facets) qs.set(k, v);

  const res = await fetch(`${base}/api/idx/search?${qs}`).then((r) => r.json());
  const rows = res.listings ?? [];
  const label = `${county || "ALL"} ${facets.map((f) => (f[1] === "1" ? f[0] : `${f[0]}=${f[1]}`)).join("+")}${priceMax ? " <=$" + priceMax : ""}`;
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
    for (const [k, v, predicate] of facets) {
      if (!predicate(L)) { console.log(`  VIOLATION ${row.id}: fails ${k}=${v}`); violations++; }
    }
    if (priceMax && db.price > +priceMax) { console.log(`  VIOLATION ${row.id}: price ${db.price} > ${priceMax}`); violations++; }
    if (county && db.county !== county) { console.log(`  VIOLATION ${row.id}: county ${db.county} != ${county}`); violations++; }
    if (L.status ? L.status !== "Active" && db.listing.status !== "Active" : false) { console.log(`  VIOLATION ${row.id}: status`); violations++; }
  }
  console.log(`combo ${round + 1}: ${label} -> total ${res.total}, checked ${rows.length} rows`);
}
console.log(`\nchecked ${checkedRows} row-predicate sets, violations: ${violations}`);
