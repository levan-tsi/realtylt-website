// ONE MLS Grid DATA request: what does the FEED say its Active count is, against what we hold?
//
// WHY: every "how many listings do we have" answer on this project comes from our Supabase
// mirror. That is the right number for the site (it is what the site serves), but it is OUR
// copy — asking the feed is the only way to know the copy is complete. This costs a single
// $count request (no rows returned) and is safe to re-run.
//
// READ THE COMPARISON CAREFULLY. County is NOT a filterable field on MLS Grid v2
// (docs/vendor/mlsgrid/README.md), so the feed can only tell us its total for the WHOLE
// onekey2 territory — which includes Nassau, Suffolk and Sullivan, counties this website
// deliberately does not ingest. A feed total larger than ours is therefore EXPECTED; what
// would be alarming is the reverse, or a gap far wider than those counties can explain.
//
// Usage: node scripts/verify-active-count.mjs [--status Active]

import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const KEY = grab("MLS_API_KEY");
const ENDPOINT = grab("MLS_API_ENDPOINT").replace(/\/+$/, "");
const FEED = grab("MLS_FEED_ID") || "onekey2";
const SB = grab("SUPABASE_URL").replace(/\/+$/, "");
const ANON = grab("SUPABASE_ANON_KEY");
if (!KEY || !ENDPOINT) throw new Error("MLS_API_KEY / MLS_API_ENDPOINT missing — npx vercel env pull .env.local");

const argv = process.argv.slice(2);
const status = argv.includes("--status") ? argv[argv.indexOf("--status") + 1] : "Active";

// $top=0 with $count=true returns the count and ZERO rows — the cheapest question we can ask.
const filter = `OriginatingSystemName eq '${FEED}' and MlgCanView eq true and StandardStatus eq '${status}'`;
const url = `${ENDPOINT}/Property?$filter=${encodeURIComponent(filter)}&$count=true&$top=1&$select=ListingId`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json", "Accept-Encoding": "gzip" },
  signal: AbortSignal.timeout(30_000),
});
if (!res.ok) throw new Error(`MLS Grid ${res.status}: ${(await res.text()).slice(0, 200)}`);
const body = await res.json();
const feedCount = body["@odata.count"] ?? body["@odata.totalCount"] ?? null;

// Our side, same status, from the mirror the site actually serves.
const ours = await fetch(
  `${SB}/rest/v1/idx_listings?select=id&is_active=eq.true&status=eq.${encodeURIComponent(status)}`,
  { headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, Prefer: "count=exact", Range: "0-0" } },
);
const mirror = Number(ours.headers.get("content-range")?.split("/")[1] ?? NaN);

console.log(`status            : ${status}`);
console.log(`feed (whole ${FEED}) : ${feedCount === null ? "no count returned — see raw keys: " + Object.keys(body).join(",") : feedCount.toLocaleString()}`);
console.log(`our mirror        : ${Number.isNaN(mirror) ? "?" : mirror.toLocaleString()}`);
if (feedCount !== null && !Number.isNaN(mirror)) {
  const gap = feedCount - mirror;
  console.log(`gap               : ${gap.toLocaleString()} (expected: the counties we do not ingest — Nassau, Suffolk, Sullivan)`);
  console.log(gap < 0 ? "ALARM: we hold MORE than the feed reports — investigate." : "shape OK: feed >= mirror.");
}
