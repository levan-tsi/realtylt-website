import type { CountySlug } from "@/lib/site";
import type { MapBounds } from "@/lib/idx/types";

/** Approximate lat/lng extent of each served area's listings, measured from the
 * idx_listings zip centroids (min/max, rounded to 4 decimals). The /search map frames
 * the chosen county with these, then the viewport fetch loads only what is in frame —
 * so picking "Queens" never pulls all 4,600 pins. Coordinate-less rows are excluded from
 * the measurement, so every box hugs real listings. */
export const COUNTY_BOUNDS: Record<CountySlug, MapBounds> = {
  dutchess: { south: 41.4884, north: 42.0637, west: -73.9721, east: -73.5129 },
  westchester: { south: 40.8902, north: 41.3869, west: -73.9679, east: -73.5333 },
  putnam: { south: 41.3331, north: 41.5376, west: -73.9346, east: -73.577 },
  rockland: { south: 41.0082, north: 41.2902, west: -74.1884, east: -73.9085 },
  ulster: { south: 41.6064, north: 42.1357, west: -74.7481, east: -73.9465 },
  orange: { south: 41.1793, north: 41.8151, west: -74.7341, east: -73.7902 },
  bronx: { south: 40.7977, north: 40.9359, west: -73.9344, east: -73.7892 },
  brooklyn: { south: 40.57, north: 40.7338, west: -74.0408, east: -73.8604 },
  manhattan: { south: 40.6822, north: 40.8729, west: -74.0193, east: -73.9149 },
  queens: { south: 40.5705, north: 40.7943, west: -73.9633, east: -73.6697 },
  "staten-island": { south: 40.5065, north: 40.6391, west: -74.2317, east: -74.0676 },
};

/** The whole served region (six Hudson Valley counties + five boroughs) — the default
 * frame when no county is chosen. Matches the served-region boxes in
 * scripts/build-zip-centroids.mjs. */
export const SERVED_REGION: MapBounds = { south: 40.49, north: 42.14, west: -74.75, east: -73.51 };

/** Frame for the current county filter (or the whole region when none). */
export function boundsForCounty(county: string): MapBounds {
  return COUNTY_BOUNDS[county as CountySlug] ?? SERVED_REGION;
}
