/** THE NIGHT STYLE (round 57.12): the MapLibre map's look, written as a style document with tokens.
 *
 * The owner's approved design (docs/parity/DESIGN-ROUND57.md §5, §7, §9): a dark place, "a little
 * darker with moonlight", the warm lights of the homes the only warmth, the /ai page's black and one
 * glow. So the ground is near black; the relief comes from a hillshade lit by the moon (the night
 * flight's moon, from the west-south-west, ../night/shots.ts MOON) in a cold silver-blue; the water
 * is blue-black and darker than the land; roads are hairlines of the same moonlight, which is what
 * makes a city brighter than a hillside; buildings rise only close in, black on black. No label of
 * the style's own: our territory and town names are drawn by the page in our type (../g3d/labels.ts,
 * towns.ts), so the style needs no glyphs and no sprite, and asks exactly two hosts, both keyless:
 *
 *  - tiles.openfreemap.org: OpenFreeMap's vector tiles (the OpenMapTiles schema, OpenStreetMap
 *    data). "Using our public instance is completely free: there are no limits on the number of map
 *    views or requests. There's no registration, no user database, no API keys, and no cookies ...
 *    Attribution is required ... OpenFreeMap © OpenMapTiles Data from OpenStreetMap. You do not need
 *    to display the OpenFreeMap part, but it is nice if you do." (openfreemap.org, read 2026-09-24).
 *  - s3.amazonaws.com: the Terrain Tiles on AWS Open Data (Mapzen's joerd, terrarium PNGs), whose
 *    licence page asks that the sources be named ("United States 3DEP (formerly NED) and global
 *    GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey", "ETOPO1 ... NOAA"): the
 *    footer's credit does (components/site/SceneCredit.tsx). */
import type { StyleSpecification } from "maplibre-gl";

export const ML_HOSTS = ["tiles.openfreemap.org", "s3.amazonaws.com"] as const;

/** What the map's corner says (openfreemap.org's required wording, OpenStreetMap's own form). */
export const ATTRIBUTION = "© OpenStreetMap contributors · © OpenMapTiles · OpenFreeMap";

/** The night's tokens. Ground tones are near black and cool; the moon is the one light the style
 * casts (the hillshade's lit faces), the road hairline its reflection. */
export const NIGHT = {
  land: "#0a0c10",
  /** Built-up land (landuse residential, commercial): a shade up, so a town reads as a place. */
  town: "#0f1218",
  wood: "#07090c",
  water: "#010309",
  /** Rivers and streams drawn as lines, a touch above the water so a river reads at any zoom. */
  stream: "#0a1426",
  road: "#9fb0cc",
  building: "#080a0e",
  buildingTop: "#12161e",
  moon: "#8fa6d0",
  shadow: "#000000",
  sky: "#000000",
  horizon: "#0a0e17",
  fog: "#06080d",
} as const;

/** The terrain's height, 1 = true. Chosen by frames (the record's round 12): the valley is low
 * relief (the Highlands and the Shawangunks a few hundred metres, the Catskills a thousand), and
 * at the territory's 145 km true heights barely read. */
export const EXAGGERATION = 1.6;
/** Buildings rise from this zoom (the chapters' 6 to 9 km close shots are zoom 13 to 14 on a laptop):
 * below it they are a few pixels tall and cost triangles for nothing. */
export const BUILDINGS_MINZOOM = 13;

const OFM = "https://tiles.openfreemap.org/planet";
const DEM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

/** A road class's hairline: its brightest alpha and its width, px, at zoom 8 and at zoom 16. */
const ROADS: readonly { id: string; classes: string[]; alpha: number; w8: number; w16: number; minzoom: number }[] = [
  { id: "road-minor", classes: ["minor", "service"], alpha: 0.16, w8: 0.3, w16: 1.0, minzoom: 12 },
  { id: "road-tertiary", classes: ["tertiary"], alpha: 0.2, w8: 0.3, w16: 1.1, minzoom: 10 },
  { id: "road-secondary", classes: ["secondary"], alpha: 0.24, w8: 0.35, w16: 1.2, minzoom: 8 },
  { id: "road-primary", classes: ["primary", "trunk"], alpha: 0.3, w8: 0.45, w16: 1.4, minzoom: 6 },
  { id: "road-motorway", classes: ["motorway"], alpha: 0.36, w8: 0.55, w16: 1.6, minzoom: 5 },
];

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function nightStyle(o: { terrain?: boolean; buildings?: boolean; exaggeration?: number; hillshade?: boolean } = {}): StyleSpecification {
  const terrain = o.terrain ?? true;
  const buildings = o.buildings ?? true;
  const hillshade = o.hillshade ?? true;
  const layers: StyleSpecification["layers"] = [
    { id: "land", type: "background", paint: { "background-color": NIGHT.land } },
    { id: "wood", type: "fill", source: "omt", "source-layer": "landcover", filter: ["==", ["get", "class"], "wood"], paint: { "fill-color": NIGHT.wood, "fill-antialias": false } },
    {
      id: "town",
      type: "fill",
      source: "omt",
      "source-layer": "landuse",
      filter: ["match", ["get", "class"], ["residential", "commercial", "industrial", "retail"], true, false],
      paint: { "fill-color": NIGHT.town, "fill-antialias": false },
    },
    ...(hillshade
      ? [
          {
            id: "relief",
            type: "hillshade" as const,
            source: "dem",
            paint: {
              "hillshade-illumination-direction": 250,
              "hillshade-illumination-altitude": 30,
              "hillshade-exaggeration": 0.6,
              "hillshade-shadow-color": NIGHT.shadow,
              "hillshade-highlight-color": rgba(NIGHT.moon, 0.3),
              "hillshade-accent-color": NIGHT.shadow,
            },
          },
        ]
      : []),
    { id: "water", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": NIGHT.water, "fill-antialias": false } },
    // The shore, a moonlit hairline: where the land meets the water is what makes the Hudson, the
    // Sound and the harbour read at every height (the water alone is barely darker than the land).
    {
      id: "shore",
      type: "line",
      source: "omt",
      "source-layer": "water",
      paint: { "line-color": NIGHT.road, "line-opacity": 0.22, "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0.5, 16, 1.2] as unknown as number },
    },
    {
      id: "stream",
      type: "line",
      source: "omt",
      "source-layer": "waterway",
      filter: ["match", ["get", "class"], ["river", "canal"], true, false],
      paint: { "line-color": NIGHT.stream, "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0.4, 16, 1.6] },
    },
    ...ROADS.map((r) => ({
      id: r.id,
      type: "line" as const,
      source: "omt",
      "source-layer": "transportation",
      minzoom: r.minzoom,
      filter: ["all", ["match", ["get", "class"], r.classes, true, false], ["!=", ["get", "brunnel"], "tunnel"]] as unknown as ["==", string, string],
      layout: { "line-cap": "round" as const, "line-join": "round" as const },
      paint: {
        "line-color": NIGHT.road,
        // Fades in over its first zoom, so a class never pops in.
        "line-opacity": ["interpolate", ["linear"], ["zoom"], r.minzoom, 0, r.minzoom + 1, r.alpha] as unknown as number,
        "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, r.w8, 16, r.w16] as unknown as number,
      },
    })),
    ...(buildings
      ? [
          {
            id: "buildings",
            type: "fill-extrusion" as const,
            source: "omt",
            "source-layer": "building",
            minzoom: BUILDINGS_MINZOOM,
            filter: ["!=", ["get", "hide_3d"], true] as unknown as ["==", string, string],
            paint: {
              "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, NIGHT.building, 120, NIGHT.buildingTop] as unknown as string,
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6] as unknown as number,
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as unknown as number,
              "fill-extrusion-opacity": 0.95,
              "fill-extrusion-vertical-gradient": true,
            },
          },
        ]
      : []),
  ];
  return {
    version: 8,
    name: "RealtyLT night",
    sources: {
      omt: { type: "vector", url: OFM, attribution: ATTRIBUTION },
      dem: { type: "raster-dem", tiles: [DEM], encoding: "terrarium", tileSize: 256, maxzoom: 15 },
    },
    ...(terrain ? { terrain: { source: "dem", exaggeration: o.exaggeration ?? EXAGGERATION } } : {}),
    sky: {
      "sky-color": NIGHT.sky,
      "horizon-color": NIGHT.horizon,
      "fog-color": NIGHT.fog,
      "fog-ground-blend": 0.6,
      "horizon-fog-blend": 0.7,
      "sky-horizon-blend": 0.6,
      "atmosphere-blend": 0,
    },
    layers,
  };
}
