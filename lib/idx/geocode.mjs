// Address → coordinate, and the rules for believing the answer.
//
// Plain .mjs ON PURPOSE (the adjacent .d.ts types it for tsc): scripts/backfill-geocodes.mjs
// runs under bare `node` and cannot import TypeScript, and the hourly cron route needs the
// SAME parser and the SAME quality gate. Two copies of "is this coordinate believable" is how
// a backfill and a cron end up disagreeing about where a house is.
//
// The geocoder is the U.S. Census Bureau's: free, keyless, 10,000 addresses per POST. The CRM
// measured it against Google's ROOFTOP answers on ten listings and it agreed to a mean of
// about 70 m, which is well inside what a street-level map needs.

/** The address a geocode was measured FOR.
 *
 * MUST stay byte-identical to the SQL idx_addr_key(jsonb) — the merge in idx_sync_apply
 * compares the two, and a mismatch would silently decline every geocode this script writes.
 * scripts/verify-geocode-durability.mjs checks the two implementations against each other on
 * real rows rather than trusting that they look the same. */
export function addrKey(address, zip) {
  // Normalise each PART before joining. Trimming the joined string instead leaves whitespace
  // that touches the separator ("7 Ferris Lane |12601"), so one feed row with a trailing space
  // would key differently from the same home without one and its geocode would stop applying —
  // silently, because a declined geocode just looks like a home that was never geocoded.
  const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  return `${norm(address)}|${norm(zip)}`;
}

/** The street line WITHOUT its unit designator.
 *
 * The Census geocoder matches street RANGES, not apartments: "8 Knightsbridge #C" comes back
 * No_Match while the building itself is squarely in its file. A unit shares a rooftop with its
 * building, so dropping the suffix and retrying beats leaving the home on its zip centroid. */
export function withoutUnit(address) {
  return String(address ?? "")
    .replace(/\s+(?:#|apt\.?|unit|ste\.?|suite|fl\.?|floor|bldg\.?|building|rm\.?|room)\s*[\w-]+\s*$/i, "")
    .replace(/\s+#[\w-]+\s*$/i, "")
    .trim();
}

/** One Census batch row: id, street, city, state, zip. Commas are the delimiter, so they go.
 * `queryZip` is the zip to ASK with — blank when the stored one is not a zip we serve, so a
 * mis-stamped row is matched on its city instead of being thrown into another state. */
export function censusCsvRow(row, street) {
  return [row.id, street ?? row.address, row.city ?? "", row.state ?? "NY", row.queryZip ?? row.zip]
    .map((v) => String(v ?? "").replace(/[",\r\n]/g, " ").trim())
    .join(",");
}

/** Parse a Census addressbatch response into hits and the rows it could not place.
 * Census answers quoted CSV; every field is quoted, so splitting on '","' is enough. */
export function parseCensusBatch(text, rows) {
  const byId = new Map(rows.map((r) => [String(r.id), r]));
  const hits = [];
  const misses = [];
  for (const line of String(text).trim().split(/\r?\n/)) {
    if (!line) continue;
    const parts = line.split('","').map((s) => s.replace(/^"|"$/g, ""));
    const [id, , match, exactness, matchedAddress, coord] = parts;
    const row = byId.get(id);
    if (!row) continue;
    if (match !== "Match" || !coord) {
      misses.push(row);
      continue;
    }
    const [lng, lat] = coord.split(",").map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
      misses.push(row);
      continue;
    }
    hits.push({
      id: String(id),
      lat,
      lng,
      source: "census",
      precision: exactness || null,
      matchedAddress: matchedAddress || null,
      addrKey: addrKey(row.address, row.zip),
    });
  }
  // Rows the response never mentioned at all are misses too (Census drops malformed lines).
  const seen = new Set([...hits.map((h) => h.id), ...misses.map((m) => String(m.id))]);
  for (const r of rows) if (!seen.has(String(r.id))) misses.push(r);
  return { hits, misses };
}

/** Pull the address and zip back out of a stored `source_address`.
 *
 * The CRM's listing_geocodes rows record what was actually sent to the geocoder, built as
 * `${address}, ${city}, NY ${zip}`. Re-deriving the address lets the seed check that the
 * coordinate still answers the address the listing carries TODAY instead of assuming an id is
 * forever bound to one address. Returns null when the string is not that shape.
 *
 * Split from the RIGHT: the state+zip tail and the city are one field each, and everything
 * before them is the street line — which may itself contain a comma. */
export function parseSourceAddress(sourceAddress) {
  const parts = String(sourceAddress ?? "").split(",");
  if (parts.length < 3) return null;
  const tail = parts[parts.length - 1].trim();
  const m = /^[A-Za-z]{2}\s+(\d{5})/.exec(tail);
  if (!m) return null;
  const address = parts.slice(0, parts.length - 2).join(",").trim();
  if (!address) return null;
  return { address, city: parts[parts.length - 2].trim(), zip: m[1] };
}

export function haversineMeters(aLat, aLng, bLat, bLng) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** The served region, with room to spare (OneKey reaches into CT/NJ/PA edges). Anything
 * outside this is not a home in this market, whatever the geocoder said. */
const REGION = { south: 39.5, north: 45.5, west: -76.5, east: -71.0 };

/** How far a believable geocode may sit from the centroid of its own ZIP.
 *
 * NOT a tuning knob for "how tidy the map looks" — it is the test for the one failure mode
 * this geocoder actually has: Census matching a same-named street in another county. Measured
 * over the 24,041 geocodes the CRM had already found, the 99th percentile distance from the
 * home's own zip centroid is 7.8 km (Exact) and 9.0 km (Non_Exact), and large rural NY zips
 * legitimately reach past 10 km — so 15 km rejects gross errors without touching real homes.
 * It caught 12 rows out of 24,041. */
export const MAX_ZIP_KM = 15;

/** Grades that mean "a building", as opposed to a street or a postcode. */
const BUILDING_GRADE = new Set(["Exact", "ROOFTOP", "RANGE_INTERPOLATED"]);

/** Is this coordinate believable for this listing? Returns null when it is, else the reason.
 * `centroid` may be null when the zip is unknown to the centroid table — then the only
 * evidence left is the geocoder's own confidence, so demand its best grade. */
export function rejectReason(hit, centroid) {
  if (!Number.isFinite(hit.lat) || !Number.isFinite(hit.lng)) return "not a number";
  if (hit.lat === 0 || hit.lng === 0) return "null island";
  if (hit.lat < REGION.south || hit.lat > REGION.north || hit.lng < REGION.west || hit.lng > REGION.east)
    return "outside the served region";
  if (!centroid) {
    // No usable zip: either the feed left it blank or it names a zip outside the served region
    // (measured on live rows — a Kingston listing carrying 43164, which is Ohio). The only
    // evidence left is the geocoder's own confidence, so demand a building-grade answer.
    return BUILDING_GRADE.has(hit.precision ?? "")
      ? null
      : `no zip centroid to check against and precision is ${hit.precision ?? "unknown"}`;
  }
  const km = haversineMeters(hit.lat, hit.lng, centroid[0], centroid[1]) / 1000;
  return km > MAX_ZIP_KM ? `${km.toFixed(1)}km from its zip centroid` : null;
}
