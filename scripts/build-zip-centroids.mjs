/** One-off: build lib/idx/zip-centroids.json — zip → [lat, lng] for the served region.
 *
 * The onekey2 MLS Grid subscription serves NO Latitude/Longitude fields, so the search map
 * pins listings at their zip centroid (plus a small deterministic jitter; MapView shows a
 * "Locations approximate" note). Source: US Census-derived zip centroids (public domain),
 * e.g. https://gist.github.com/erichurst/7882666 (CSV: ZIP,LAT,LNG).
 *
 * Usage: node scripts/build-zip-centroids.mjs <path-to-csv>
 */
import { readFileSync, writeFileSync } from "node:fs";

// Generous bounding box around the six served counties (Dutchess, Westchester,
// Putnam, Rockland, Ulster, Orange) — SW of Yonkers to N of Saugerties.
const LAT = [40.82, 42.2];
const LNG = [-74.85, -73.35];

const csv = readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/).slice(1);
const out = {};
for (const line of csv) {
  const [zip, lat, lng] = line.split(",").map((s) => s.trim());
  const la = Number(lat);
  const ln = Number(lng);
  if (la >= LAT[0] && la <= LAT[1] && ln >= LNG[0] && ln <= LNG[1]) {
    out[zip] = [Math.round(la * 1e4) / 1e4, Math.round(ln * 1e4) / 1e4];
  }
}
writeFileSync("lib/idx/zip-centroids.json", JSON.stringify(out));
console.log(`wrote ${Object.keys(out).length} zips to lib/idx/zip-centroids.json`);
