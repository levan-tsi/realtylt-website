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
  // "/" is in the unit token because the feed writes unit lists ("#1F/1R/2F/2R").
  return String(address ?? "")
    .replace(/\s+(?:#|apt\.?|unit|ste\.?|suite|fl\.?|floor|bldg\.?|building|rm\.?|room)\s*[\w/-]+\s*$/i, "")
    .replace(/\s+#[\w/-]+\s*$/i, "")
    .trim();
}

/** Queens zips (Glen Oaks/Floral Park, Long Island City/Astoria, 113xx-114xx, the Rockaways). */
const QUEENS_ZIP = /^(?:1100[45]|111\d\d|11[34]\d\d|1169\d)$/;

/** The street line for the second ask, after the address as written missed: the building
 * rather than the unit, and in a Queens zip the hyphen the feed dropped.
 *
 * Queens numbers a house "cross street - house" (37-20 Prince Street). The feed often writes
 * it without the hyphen, and Census answers No_Match for "3720 Prince Street"; asked again with
 * the hyphen back, 33 of 38 such live rows matched Exact (measured 2026-10-04). Only as a
 * retry and only in a Queens zip: parts of the Rockaways number houses the ordinary way, and a
 * four-digit number anywhere else is just a number. Returns withoutUnit(address) otherwise. */
export function retryStreet(address, zip) {
  const street = withoutUnit(address);
  const m = QUEENS_ZIP.test(String(zip ?? "").trim()) ? /^(\d{2,3})(\d{2})(\s.+)$/.exec(street) : null;
  return m ? `${m[1]}-${m[2]}${m[3]}` : street;
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
    // The second field is Census echoing the address it was SENT ("street, city, ST, zip"): the
    // street as asked, which on the second ask is retryStreet()'s line, not row.address.
    const [id, askedAddress, match, exactness, matchedAddress, coord] = parts;
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
      askedAddress: askedAddress || null,
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

/** "STREET, CITY, ST, ZIP" (Census, asked and matched) or "STREET, CITY, ST ZIP[, USA]" (a Google
 * ask and answer) → its parts; null when it is not that shape. */
function addressParts(s) {
  const m = /^(.*),\s*([^,]*?)\s*,\s*[A-Za-z]{2}\s*,?\s*(\d{5})?(?:-\d{4})?\s*(?:,\s*USA)?\s*$/.exec(String(s ?? ""));
  return m ? { street: m[1].trim(), city: m[2].trim(), zip: m[3] ?? "" } : null;
}

const DIRECTIONAL = {
  n: "n", s: "s", e: "e", w: "w", ne: "ne", nw: "nw", se: "se", sw: "sw",
  north: "n", south: "s", east: "e", west: "w", northeast: "ne", northwest: "nw", southeast: "se", southwest: "sw",
};

/** Name words with a common short form, and the ordinals the feed spells out (Fifth Avenue). */
const NAME_WORD = {
  saint: "st", mount: "mt", fort: "ft",
  first: "1st", second: "2nd", third: "3rd", fourth: "4th", fifth: "5th", sixth: "6th", seventh: "7th",
  eighth: "8th", ninth: "9th", tenth: "10th", eleventh: "11th", twelfth: "12th",
};

/** Words that say what KIND of road it is, not which road: the USPS suffixes in both spellings,
 * and the route vocabulary (TIGER names a route by its system, "US HWY 9W", where the feed writes
 * "Route 9W"). Rule A compares the directional and the name, so these drop on both sides; "St"
 * for Saint drops with them, the same on both sides. */
const STREET_KIND = new Set(
  ("street st avenue ave av road rd drive dr lane ln court ct boulevard blvd place pl terrace ter " +
    "highway hwy route rte rt parkway pkwy circle cir turnpike tpke expressway expy square sq trail trl " +
    "plaza plz alley aly crescent cres extension ext way us state county co ny sr cr").split(" "),
);

/** A street line reduced to "directional|name": no unit, no house number, case, punctuation,
 * suffix and spelling normalised. */
function streetIdentity(street) {
  const words = withoutUnit(street)
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9-]+/g, " ")
    .trim()
    // The house number is not this rule's business (an ordinal street name is not a house number).
    .replace(/^(?!\d+(?:st|nd|rd|th)\b)\d[\w-]*\s*/, "")
    .split(/[\s-]+/)
    .filter(Boolean);
  const dirs = [];
  const name = [];
  for (const raw of words) {
    const w = NAME_WORD[raw] ?? raw;
    if (DIRECTIONAL[w]) dirs.push(DIRECTIONAL[w]);
    else if (!STREET_KIND.has(w)) name.push(w);
  }
  return `${dirs.join(" ")}|${name.join(" ")}`;
}

/** Is this coordinate believable for this listing? Returns null when it is, else the reason.
 * `centroid` may be null when the zip is unknown to the centroid table — then the only
 * evidence left is the geocoder's own confidence, so demand its best grade.
 *
 * Rules A and B read the hit's `askedAddress` (what the geocoder was sent) against its
 * `matchedAddress`; a hit without both is judged as before. `centroidOf` (zip → centroid) is the
 * caller's own table, for rule B; without it rule B is off. */
export function rejectReason(hit, centroid, centroidOf) {
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
  const asked = addressParts(hit.askedAddress);
  const matched = addressParts(hit.matchedAddress);
  // Rule A. A Non_Exact answer can land on the wrong street inside the 15 km gate: KEY1041042
  // "50 North Broadway #6H, White Plains" came back as 50 S BROADWAY (round 66). Refuse it when
  // the matched street's directional or name is not the street that was sent. A directional on
  // one side only is a difference. Exact answers matched the street as written.
  if (hit.precision === "Non_Exact" && asked && matched &&
    streetIdentity(asked.street) !== streetIdentity(matched.street))
    return `Non_Exact match on another street: asked "${asked.street}", matched "${matched.street}"`;
  const km = haversineMeters(hit.lat, hit.lng, centroid[0], centroid[1]) / 1000;
  if (km <= MAX_ZIP_KM) return null;
  // Rule B. The feed's zip can be the typo: round 66's 12 gate rejections (16 in the Google pass)
  // were the right building against a mistyped zip (12545 for 12546, 11023 for 10023 and the like)
  // or five Kingston homes 15.1 to 16.5 km from 12401. When the answer carries another zip and the
  // same city as asked, the 15 km test is taken against the matched zip's centroid. The Kingston
  // five carry the zip they were asked with and stay out: the 15 km gate is not widened.
  const typoZip =
    asked && matched && matched.zip && matched.zip !== asked.zip && asked.city &&
    asked.city.toLowerCase() === matched.city.toLowerCase()
      ? centroidOf?.(matched.zip)
      : null;
  if (typoZip && haversineMeters(hit.lat, hit.lng, typoZip[0], typoZip[1]) / 1000 <= MAX_ZIP_KM) return null;
  return `${km.toFixed(1)}km from its zip centroid`;
}
