/** ORIENTATION INSIDE A COUNTY (round 57.3, brief item 9, kept or dropped by frames). The county and
 * borough chapters of "Where we work" are SATELLITE (map-options.ts: HYBRID's pins and shields
 * cluttered them), so the photograph carries no names and a stranger cannot tell Newburgh from
 * Goshen. Our own quiet names for two or three principal places per area, in the territory names'
 * style at a smaller size, drawn only while the map holds that area's shot (G3dGround).
 *
 * Towns for the six counties (the county seat or the largest, and one each on the river and
 * inland where the county spans both); neighbourhoods a stranger knows for the five boroughs.
 * Positions are the places' own centres (rounded to 0.001 degree, about 100 m). */
import type { AreaLabel } from "./labels";

type Row = readonly [string, number, number];

const TOWNS: Record<string, readonly Row[]> = {
  ulster: [
    ["Kingston", 41.927, -73.997],
    ["New Paltz", 41.747, -74.087],
    ["Saugerties", 42.078, -73.953],
  ],
  dutchess: [
    ["Poughkeepsie", 41.7, -73.921],
    ["Beacon", 41.505, -73.97],
    ["Rhinebeck", 41.927, -73.912],
  ],
  orange: [
    ["Newburgh", 41.503, -74.01],
    ["Middletown", 41.446, -74.422],
    ["Goshen", 41.402, -74.324],
  ],
  putnam: [
    ["Carmel", 41.43, -73.68],
    ["Brewster", 41.397, -73.617],
    ["Cold Spring", 41.42, -73.955],
  ],
  rockland: [
    ["Nyack", 41.091, -73.918],
    ["New City", 41.148, -73.989],
    ["Suffern", 41.115, -74.149],
  ],
  westchester: [
    ["White Plains", 41.034, -73.763],
    ["Yonkers", 40.931, -73.899],
    ["New Rochelle", 40.911, -73.782],
  ],
  bronx: [
    ["Riverdale", 40.9, -73.906],
    ["Fordham", 40.861, -73.89],
    ["Mott Haven", 40.809, -73.923],
  ],
  manhattan: [
    ["Harlem", 40.811, -73.946],
    ["Midtown", 40.754, -73.984],
    ["Financial District", 40.707, -74.011],
  ],
  queens: [
    ["Astoria", 40.772, -73.93],
    ["Flushing", 40.767, -73.833],
    ["Jamaica", 40.702, -73.789],
  ],
  brooklyn: [
    ["Williamsburg", 40.714, -73.957],
    ["Park Slope", 40.672, -73.977],
    ["Coney Island", 40.575, -73.985],
  ],
  "staten-island": [
    ["St. George", 40.644, -74.077],
    ["Great Kills", 40.554, -74.151],
    ["Tottenville", 40.505, -74.24],
  ],
};

/** Every place, for the layer's spans (one per place, placed per shot). */
export const TOWN_LABELS: readonly (AreaLabel & { area: string })[] = Object.entries(TOWNS).flatMap(([area, rows]) =>
  rows.map(([text, lat, lng]) => ({ id: `t-${area}-${text.toLowerCase().replace(/[^a-z]+/g, "-")}`, text, tier: "borough" as const, lat, lng, area })),
);

/** The places named at an area's shot (the county slug `focusOf` gives), in priority order. */
export function townsOf(area: string | null): readonly (AreaLabel & { area: string })[] {
  return area ? TOWN_LABELS.filter((t) => t.area === area) : [];
}
