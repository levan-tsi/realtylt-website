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

/** The library, served from our own origin (public/maplibre/<version>/, the package's files). */
export const MAPLIBRE_URL = "/maplibre/6.11.2/maplibre-gl.mjs";

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

/** THE PLATE STYLE (round 59, docs/parity/DESIGN-ROUND59.md §2): the county plates are rendered
 * ONCE (scripts/make-plates.mjs), so they can afford what the live ladder leaves out for streaming.
 * The owner: "when you stand on Dutchess you don't see the city or any buildings or street lines or
 * anything, just highway lines and the river". Measured at the Dutchess county camera, the tiles
 * already carry 275 minor roads that the live ladder drew at alpha 0.05 (a fade-in from zoom 12).
 * Here every class is drawn from zoom 10 at a CONSTANT alpha, one step apart from the street to the
 * motorway, a touch wider than the live hairlines so a street survives the AVIF; footpaths and
 * tracks only as bridges (the Walkway over the Hudson is a path) and the railways faint. Still the
 * moon's one blue-grey for every line. */
const PLATE_ROADS: readonly { id: string; classes: string[]; alpha: number; w8: number; w16: number }[] = [
  { id: "road-minor", classes: ["minor", "service"], alpha: 0.3, w8: 0.4, w16: 1.4 },
  { id: "road-tertiary", classes: ["tertiary"], alpha: 0.36, w8: 0.45, w16: 1.5 },
  { id: "road-secondary", classes: ["secondary"], alpha: 0.42, w8: 0.5, w16: 1.6 },
  { id: "road-primary", classes: ["primary", "trunk"], alpha: 0.48, w8: 0.6, w16: 1.8 },
  { id: "road-motorway", classes: ["motorway"], alpha: 0.56, w8: 0.7, w16: 2.0 },
];
/** Where every plate class starts: low enough that no class fades in at a county camera. */
export const PLATE_ROADS_MINZOOM = 10;
/** The plate's built land and buildings: a shade up from the live `town`, so a town reads as a
 * place with no name, and the buildings a shade above the town they stand in. */
export const PLATE = {
  town: "#141922",
  park: "#07090c",
  building: "#151a23",
  buildingTop: "#1f2632",
  buildingsMinzoom: 12,
  railAlpha: 0.16,
  bridgePathAlpha: 0.3,
} as const;

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/** THE TERRAIN'S DETAIL, the heaviest thing the map loads (measured on the running lab: 20 terrarium
 * PNGs, 1.5 MB, before the territory was drawn; 405, 38 MB, over a walk through every stop, against
 * 13 and 524 vector tiles). A terrarium PNG is 256 px; declared as 512 the map asks for the tiles one
 * zoom lower (a quarter as many, half the ground resolution), and past DEM_MAXZOOM it stretches the
 * last level. At night the relief is a soft moonlit shading, so the lower detail is chosen by frames
 * (the record's round 12). `?dem=256:15` puts back the full detail. */
export const DEM_TILE = 512;
export const DEM_MAXZOOM = 12;

/** THE SLOW LINE'S TERRITORY (round 57.13, ./slow-line.ts): drawn from a second copy of the same
 * vector tiles capped at `maxzoom` (measured at the territory: 9 full tiles at 1440 and 12 on a
 * phone, 1.1 and 1.6 MB gzipped, one tile 80 to 240 KB; the capped copy asks for a handful), shown
 * below zoom `below`; the full tiles from `fullFrom`, so between the two both are drawn and the
 * ground never goes bare while the full tiles arrive (the chapters and counties are zoom 12.8 up). */
export const COARSE = { maxzoom: 6, below: 11.5, fullFrom: 10 } as const;

/** `plate`: the plate style (the renderer's `?plate=` path only). `deep`: the plate is rendered at
 * twice the css size (one zoom deeper, the same ground): its zoom stops move up one and its widths
 * double, so the picture's lines are what the plain render would draw. */
export type PlateOpt = { deep?: boolean };

/** The deep render's terrain level: the one the plain render would draw at one zoom less. A 512 px
 * terrarium tile is asked for at floor(zoom) - 1 (measured: the camera's centre elevation at the
 * Dutchess and Putnam plates matched the plain render's to the millimetre with this level, and
 * stood 1 to 5 m off with the deeper one, which moves the whole projection by up to 0.6 px). The map
 * clamps its centre to that terrain, so the recorded matrix then equals the live map's, doubled. */
export const deepDemMaxzoom = (deepZoom: number, demMaxzoom = DEM_MAXZOOM) => Math.min(demMaxzoom, Math.floor(deepZoom - 1) - 1);

export function nightStyle(o: { terrain?: boolean; buildings?: boolean; exaggeration?: number; hillshade?: boolean; demTile?: number; demMaxzoom?: number; coarse?: { below: number; maxzoom: number }; plate?: PlateOpt | false } = {}): StyleSpecification {
  const terrain = o.terrain ?? true;
  const buildings = o.buildings ?? true;
  const hillshade = o.hillshade ?? true;
  const base = o.plate ? plateLayers(hillshade, buildings, o.plate.deep ? 1 : 0) : tiledLayers(hillshade, buildings);
  const layers: StyleSpecification["layers"] = o.coarse ? withCoarse(base, o.coarse) : base;
  return {
    version: 8,
    name: "RealtyLT night",
    sources: {
      omt: { type: "vector", url: OFM, attribution: ATTRIBUTION },
      ...(o.coarse ? { "omt-coarse": { type: "vector" as const, url: OFM, maxzoom: o.coarse.maxzoom } } : {}),
      ...(terrain || hillshade ? { dem: { type: "raster-dem" as const, tiles: [DEM], encoding: "terrarium" as const, tileSize: o.demTile ?? DEM_TILE, maxzoom: Math.min(15, o.demMaxzoom ?? DEM_MAXZOOM) } } : {}),
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

/** Each layer of the full tiles gets a coarse copy under it (the same paint, from `omt-coarse`,
 * below `c.below`), and itself starts at COARSE.fullFrom; a layer that starts at or above
 * `c.below` has no copy. */
function withCoarse(layers: StyleSpecification["layers"], c: { below: number }): StyleSpecification["layers"] {
  const out: StyleSpecification["layers"] = [];
  for (const l of layers) {
    if (!("source" in l) || l.source !== "omt") {
      out.push(l);
      continue;
    }
    const min = l.minzoom ?? 0;
    if (min < c.below) out.push({ ...l, id: `${l.id}-coarse`, source: "omt-coarse", maxzoom: c.below } as typeof l);
    out.push({ ...l, minzoom: Math.max(min, COARSE.fullFrom) });
  }
  return out;
}

/** The plate style's layers (PLATE_ROADS, PLATE). `dz`: the deep render's zoom shift (0 or 1): every
 * zoom stop moves up by it and every width doubles with it, so a line keeps its size in the picture. */
function plateLayers(hillshade: boolean, buildings: boolean, dz: number): StyleSpecification["layers"] {
  const k = 2 ** dz;
  const width = (w8: number, w16: number) => ["interpolate", ["exponential", 1.5], ["zoom"], 8 + dz, w8 * k, 16 + dz, w16 * k] as unknown as number;
  const live = tiledLayers(hillshade, false);
  const pick = (id: string) => live.find((l) => l.id === id)!;
  const notTunnel = ["!=", ["get", "brunnel"], "tunnel"];
  const line = (id: string, filter: unknown[], alpha: number, w8: number, w16: number) => ({
    id,
    type: "line" as const,
    source: "omt",
    "source-layer": "transportation",
    minzoom: PLATE_ROADS_MINZOOM,
    filter: filter as unknown as ["==", string, string],
    layout: { "line-cap": "round" as const, "line-join": "round" as const },
    // A constant alpha: the plate is one camera, nothing streams in, so nothing fades in.
    paint: { "line-color": NIGHT.road, "line-opacity": alpha, "line-width": width(w8, w16) },
  });
  return [
    pick("land"),
    pick("wood"),
    // Parks as dark as the wood: Central Park, Prospect Park and Flushing Meadows are the shapes a
    // borough is known by, a dark field inside the lit grid.
    { id: "park", type: "fill", source: "omt", "source-layer": "park", filter: ["==", ["get", "class"], "park"], paint: { "fill-color": PLATE.park, "fill-antialias": false } },
    {
      id: "town",
      type: "fill",
      source: "omt",
      "source-layer": "landuse",
      filter: ["match", ["get", "class"], ["residential", "commercial", "industrial", "retail", "railway"], true, false],
      paint: { "fill-color": PLATE.town, "fill-antialias": false },
    },
    ...(hillshade ? [pick("relief")] : []),
    pick("water"),
    { ...pick("shore"), paint: { "line-color": NIGHT.road, "line-opacity": 0.22, "line-width": width(0.5, 1.2) } } as StyleSpecification["layers"][number],
    { ...pick("stream"), paint: { "line-color": NIGHT.stream, "line-width": width(0.4, 1.6) } } as StyleSpecification["layers"][number],
    line("rail", ["all", ["match", ["get", "class"], ["rail"], true, false], notTunnel], PLATE.railAlpha, 0.3, 1.0),
    ...PLATE_ROADS.map((r) => line(r.id, ["all", ["match", ["get", "class"], r.classes, true, false], notTunnel], r.alpha, r.w8, r.w16)),
    // Footpaths and tracks only where they cross water or a road: the Walkway over the Hudson is one.
    line("road-bridge-path", ["all", ["match", ["get", "class"], ["path", "track"], true, false], ["==", ["get", "brunnel"], "bridge"]], PLATE.bridgePathAlpha, 0.4, 1.4),
    ...(buildings
      ? [
          {
            id: "buildings",
            type: "fill-extrusion" as const,
            source: "omt",
            "source-layer": "building",
            minzoom: PLATE.buildingsMinzoom + dz,
            filter: ["!=", ["get", "hide_3d"], true] as unknown as ["==", string, string],
            paint: {
              "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, PLATE.building, 120, PLATE.buildingTop] as unknown as string,
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6] as unknown as number,
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as unknown as number,
              "fill-extrusion-opacity": 0.95,
              "fill-extrusion-vertical-gradient": true,
            },
          },
        ]
      : []),
  ];
}

function tiledLayers(hillshade: boolean, buildings: boolean): StyleSpecification["layers"] {
  return [
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
}
