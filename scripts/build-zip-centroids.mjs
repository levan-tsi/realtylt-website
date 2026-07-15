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

// Generous bounding boxes around the served region: the six Hudson Valley counties
// (SW of Yonkers to N of Saugerties) plus the five NYC boroughs (Staten Island's
// south shore to the Bronx's north edge).
const BOXES = [
  { lat: [40.82, 42.2], lng: [-74.85, -73.35] }, // Hudson Valley
  { lat: [40.49, 40.94], lng: [-74.27, -73.68] }, // NYC boroughs
];

const csv = readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/).slice(1);
const out = {};
for (const line of csv) {
  const [zip, lat, lng] = line.split(",").map((s) => s.trim());
  const la = Number(lat);
  const ln = Number(lng);
  if (BOXES.some((b) => la >= b.lat[0] && la <= b.lat[1] && ln >= b.lng[0] && ln <= b.lng[1])) {
    out[zip] = [Math.round(la * 1e4) / 1e4, Math.round(ln * 1e4) / 1e4];
  }
}
writeFileSync("lib/idx/zip-centroids.json", JSON.stringify(out));
console.log(`wrote ${Object.keys(out).length} zips to lib/idx/zip-centroids.json`);
