/** THE TERRITORY'S NAMES (round 57), as pure arithmetic: which of our areas the hero shot names,
 * and where each name goes so no two touch and none lands on the page's words.
 *
 * The owner, on round 56's opening shot: "it's not visibly understood that it's New York's five
 * boroughs and Westchester and up." From the altitude that holds the whole territory Google's map
 * names towns (White Plains, Poughkeepsie, "New York"), never a county or a borough, so the areas
 * we serve are named by us, in our type, at the hero shot only (G3dGround.tsx draws them).
 *
 * Each name stands at its area's middle (an anchor chosen on land, not on water, and inside the
 * area's listing box, tested), projected with our own camera maths (camera.ts). Placement is
 * greedy in priority order: a name tries its own spot, then a little above, below and to either
 * side, and is dropped if every spot touches the words, the header, a fixed corner, a name
 * already placed, or one of Google's own city names (GOOGLE_CITY_LABELS, projected the same way,
 * so ours never sits on "New York"). Dropping is the honest failure: a name that cannot be read
 * cleanly is not drawn. */
import { BOROUGHS, COUNTIES, areaName } from "@/lib/site";
import { projectWith, cameraFrame, type MapCamera, type Viewport } from "./camera";

export type Tier = "county" | "borough";

export interface AreaLabel {
  /** The area's slug (lib/site.ts). */
  id: string;
  text: string;
  tier: Tier;
  lat: number;
  lng: number;
}

/** A box in window pixels, top left. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** An area projected: its name's size and the pixel its middle falls on. */
export interface LabelItem {
  id: string;
  text: string;
  tier: Tier;
  /** The anchor's pixel (the middle of the name when it can stand there). */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlacedLabel extends Box {
  id: string;
  text: string;
  tier: Tier;
}

/** Where each area's name stands. Picked by hand on the map so the middle of the word sits on
 * land: Manhattan on the park (the island's south is where Google writes "New York"), Brooklyn
 * and Queens inland, the Bronx north of the Cross Bronx, Staten Island on the Greenbelt,
 * Westchester between White Plains and the reservoirs, Rockland west of the Tappan Zee, Putnam
 * round Carmel, Orange between Goshen and Newburgh, Dutchess east of Poughkeepsie, Ulster west of
 * the river at New Paltz and Kerhonkson. */
const ANCHORS: Record<string, [number, number]> = {
  manhattan: [40.785, -73.965],
  brooklyn: [40.645, -73.945],
  queens: [40.715, -73.81],
  bronx: [40.845, -73.875],
  "staten-island": [40.585, -74.14],
  westchester: [41.13, -73.77],
  rockland: [41.16, -74.04],
  putnam: [41.43, -73.75],
  orange: [41.4, -74.32],
  dutchess: [41.76, -73.74],
  ulster: [41.8, -74.2],
};

/** Who wins a crowded spot: Manhattan first (the one name every stranger knows), then the
 * boroughs by size, then the counties by how much of the frame they own. */
const PRIORITY = ["manhattan", "brooklyn", "queens", "bronx", "staten-island", "westchester", "dutchess", "rockland", "orange", "putnam", "ulster"] as const;

export const TERRITORY_LABELS: readonly AreaLabel[] = PRIORITY.map((id) => {
  const b = BOROUGHS.find((x) => x.slug === id);
  if (b) return { id, text: areaName(b.name), tier: "borough" as const, lat: ANCHORS[id][0], lng: ANCHORS[id][1] };
  const c = COUNTIES.find((x) => x.slug === id)!;
  return { id, text: areaName(c.name.replace(/ County$/, "")), tier: "county" as const, lat: ANCHORS[id][0], lng: ANCHORS[id][1] };
});

/** Google's own names that read at the hero's altitude over our territory (seen on the round-57
 * frames at 1440 and 390): ours must not sit on them. "New York" is the city's big label; the
 * towns are Google's small ones, drawn with a dot on either side of the word, so each is kept
 * clear as a box centred on the town (googleLabelBox). Where Google names the same PLACE (none of
 * ours: Google names cities and towns, we name counties and boroughs), Google's would carry it. */
export const GOOGLE_CITY_LABELS: readonly AreaLabel[] = [
  { id: "g-new-york", text: "New York", tier: "county", lat: 40.7128, lng: -74.006 },
  ...(
    [
      ["White Plains", 41.034, -73.763],
      ["New Rochelle", 40.911, -73.782],
      ["Yonkers", 40.931, -73.899],
      ["Stamford", 41.053, -73.539],
      ["Newark", 40.735, -74.172],
      ["Poughkeepsie", 41.7, -73.921],
      ["Newburgh", 41.503, -74.01],
      ["Kingston", 41.927, -73.997],
      ["Peekskill", 41.29, -73.92],
      ["West Point", 41.391, -73.956],
    ] as const
  ).map(([text, lat, lng]) => ({ id: `g-${text}`, text, tier: "borough" as const, lat, lng })),
];

/** Where Google's own labels are, as boxes, estimated from the round-57 frames at 1440 and 390:
 * the city's name ~10.5 px a character and 22 px tall, written to the RIGHT of its dot ("• New
 * York" on both frames); a town's ~6 px a character and 16 px tall, written on EITHER side of its
 * dot ("• Stamford", "White Plains •"), so a town's box is centred on the town and one and a half
 * words wide. */
export function googleBoxes(cam: MapCamera, vp: Viewport): Box[] {
  const out: Box[] = [];
  for (const g of labelItems(cam, vp, (text, tier) => (tier === "county" ? { w: Math.round(text.length * 10.5 + 16), h: 22 } : { w: Math.round(text.length * 9 + 16), h: 16 }), GOOGLE_CITY_LABELS)) {
    out.push(g.tier === "county" ? { x: g.x - 8, y: g.y - g.h / 2, w: g.w, h: g.h } : { x: g.x - g.w / 2, y: g.y - g.h / 2, w: g.w, h: g.h });
  }
  return out;
}

/** Project the labels for a camera and window. `measure` gives a name's box (the component reads
 * the rendered text; the tests estimate it). Areas behind the eye or off the window are left out. */
export function labelItems(
  cam: MapCamera,
  vp: Viewport,
  measure: (text: string, tier: Tier) => { w: number; h: number },
  labels: readonly AreaLabel[] = TERRITORY_LABELS,
): LabelItem[] {
  const frame = cameraFrame(cam);
  const out: LabelItem[] = [];
  for (const l of labels) {
    const p = projectWith(frame, vp, l.lat, l.lng, 0);
    if (!p || p.x < 0 || p.y < 0 || p.x > vp.width || p.y > vp.height) continue;
    const { w, h } = measure(l.text, l.tier);
    out.push({ id: l.id, text: l.text, tier: l.tier, x: p.x, y: p.y, w, h });
  }
  return out;
}

const hits = (a: Box, b: Box, gap: number) => a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

/** The positions a name tries, as multiples of its own width and height from centred-on-anchor.
 * Sideways only by 0.35 of its width, so the anchor is always under the word: at 0.6 the first
 * phone frame put "Manhattan" over the Hudson's New Jersey shore. */
const TRIES: readonly [number, number][] = [
  [0, 0],
  [0, -1.1],
  [0, 1.1],
  [0.35, 0],
  [-0.35, 0],
  [0.35, -1.1],
  [-0.35, -1.1],
  [0.35, 1.1],
  [-0.35, 1.1],
  [0, -2.2],
  [0, 2.2],
];

/** Greedy placement in the order given. `pad`: room kept from the words and corners; `gap`:
 * between two names; `edge`: from the window's edges. `google`: Google's own labels (estimated
 * boxes), kept clear by `gap` only: they are small and the words are what must breathe. */
export function placeLabels(
  items: readonly LabelItem[],
  obstacles: readonly Box[],
  vp: { width: number; height: number },
  opts: { pad?: number; gap?: number; edge?: number; google?: readonly Box[] } = {},
): PlacedLabel[] {
  const pad = opts.pad ?? 10, gap = opts.gap ?? 8, edge = opts.edge ?? 8;
  const google = opts.google ?? [];
  const placed: PlacedLabel[] = [];
  for (const it of items) {
    for (const [fx, fy] of TRIES) {
      const b: Box = { x: Math.round(it.x - it.w / 2 + fx * it.w), y: Math.round(it.y - it.h / 2 + fy * it.h), w: it.w, h: it.h };
      if (b.x < edge || b.y < edge || b.x + b.w > vp.width - edge || b.y + b.h > vp.height - edge) continue;
      if (obstacles.some((o) => hits(b, o, pad))) continue;
      if (google.some((o) => hits(b, o, 2))) continue;
      if (placed.some((p) => hits(b, p, gap))) continue;
      placed.push({ id: it.id, text: it.text, tier: it.tier, ...b });
      break;
    }
  }
  return placed;
}
