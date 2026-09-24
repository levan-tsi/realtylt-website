/** THE ADDRESS LIGHTS, FINISHED (round 57.3): the pure rules behind the hover label, the click, the
 * phone's tap and the county rows, kept out of the component so each is tested
 * (interaction.test.ts). No DOM, no Google here.
 *
 * Google's markers on maps 3.66 have no hover event and cannot take focus (measured in round 56,
 * scripts/_scratch-r56-tab.mjs): hover is our projection of the drawn homes plus a 14 px hit test
 * (controller.ts, G3dGround.tsx), and the keyboard reaches the featured homes through their cards
 * on the page. */
import { project } from "./camera";
import type { G3dCamera } from "./cameras";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The gap between the light and its label, css px. */
export const OFFSET = 10;
/** A label closer than this to an edge of the window flips to the other side. */
export const EDGE = 24;
/** The step, css px, of the search for a place further from the light (round 57.5). */
export const SCAN = 8;
/** How much further than its near side the label may go (round 57.5): past this a label reads as
 * belonging to nothing, so the last resort (which may overlap words) is the better answer. */
export const SCAN_MAX = 160;

export type LabelSide = "above-right" | "above-left" | "below-right" | "below-left" | "right" | "left";

const hits = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Where the hovered home's label stands: above and to the right of its light, OFFSET px clear of
 * the light's keep-out box (`keep`: half its side, the lit glyph's radius plus a little for the
 * projection's error), flipped left or below within EDGE px of an edge, and never on `avoid` (the
 * Google logo's corner, the header, and since round 57.5 the page's words). Whatever happens, it
 * never covers the light: every side stands wholly above, below or beside the keep-out box, and the
 * last resort only slides sideways or further away. Whole pixels, so the text stays crisp. */
export function placeHoverLabel(
  light: { x: number; y: number },
  size: { w: number; h: number },
  vp: { width: number; height: number },
  opts: { keep: number; avoid?: readonly Rect[] },
): { x: number; y: number; side: LabelSide } {
  const { w, h } = size;
  const k = opts.keep;
  const avoid = opts.avoid ?? [];
  const right = Math.round(light.x + OFFSET);
  const left = Math.round(light.x - OFFSET - w);
  const above = Math.floor(light.y - k - OFFSET - h);
  const below = Math.ceil(light.y + k + OFFSET);
  const wantRight = right + w <= vp.width - EDGE;
  const wantAbove = above >= EDGE;
  const order: [LabelSide, number, number][] = [];
  const hs: [string, number][] = wantRight ? [["right", right], ["left", left]] : [["left", left], ["right", right]];
  const vs: [string, number][] = wantAbove ? [["above", above], ["below", below]] : [["below", below], ["above", above]];
  for (const [vn, y] of vs) for (const [hn, x] of hs) order.push([`${vn}-${hn}` as LabelSide, x, y]);
  const fits = (x: number, y: number) =>
    x >= EDGE && x + w <= vp.width - EDGE && y >= EDGE && y + h <= vp.height - EDGE && !avoid.some((a) => hits({ x, y, w, h }, a));
  for (const [side, x, y] of order) if (fits(x, y)) return { x, y, side };
  // Round 57.5: beside the light, level with it and wholly to one side of its keep-out box (a light
  // in a narrow gap between two blocks of words has no room above or below).
  const mid = Math.round(light.y - h / 2);
  const besideR = Math.ceil(light.x + k + OFFSET), besideL = Math.floor(light.x - k - OFFSET - w);
  for (const [side, x] of (wantRight ? [["right", besideR], ["left", besideL]] : [["left", besideL], ["right", besideR]]) as [LabelSide, number][]) {
    if (fits(x, mid)) return { x, y: mid, side };
  }
  // Round 57.5: when the near sides land on words (the phone's hero: the headline above, the count
  // below), the label moves further up or down, in SCAN px steps, nearest first, still wholly above
  // or wholly below the light, at the preferred side, the other, or slid inside the window.
  const scanXs = [wantRight ? right : left, wantRight ? left : right, Math.min(Math.max(wantRight ? right : left, EDGE), vp.width - EDGE - w)];
  for (let d = SCAN; d <= SCAN_MAX; d += SCAN) {
    for (const [vn, y] of vs.map(([vn, y]) => [vn, vn === "above" ? y - d : y + d] as const)) {
      for (const x of scanXs) if (fits(x, y)) return { x, y, side: `${vn}-${x >= light.x ? "right" : "left"}` as LabelSide };
    }
  }
  // The last resort (a small window, a light in a corner, the phone's header): keep a vertical
  // side, which is what keeps the light clear, prefer one wholly on screen and off `avoid`, and
  // slide the label along it inside the window; past an avoided box sideways if it must.
  const room = vp.width - 2 * EDGE - w;
  const slide = room >= 0 ? Math.min(Math.max(wantRight ? right : left, EDGE), vp.width - EDGE - w) : Math.round((vp.width - w) / 2);
  const onScreen = (y: number) => y >= 0 && y + h <= vp.height;
  const sides: ["above" | "below", number][] = wantAbove ? [["above", above], ["below", below]] : [["below", below], ["above", above]];
  for (const [vn, y] of sides) {
    if (onScreen(y) && !avoid.some((a) => hits({ x: slide, y, w, h }, a))) return { x: slide, y, side: `${vn}-${slide >= light.x ? "right" : "left"}` as LabelSide };
  }
  const [vn, y] = sides.find(([, yy]) => onScreen(yy)) ?? sides[0];
  let x = slide;
  for (const a of avoid) {
    if (!hits({ x, y, w, h }, a)) continue;
    const past = Math.ceil(a.x + a.w + 2);
    const before = Math.floor(a.x - w - 2);
    if (past + w <= vp.width) x = past;
    else if (before >= 0) x = before;
  }
  return { x, y, side: `${vn}-${x >= light.x ? "right" : "left"}` as LabelSide };
}

export interface LabelPin {
  price: number;
  beds: number;
  baths: number;
  address: string;
  city: string;
}

export interface LabelContent {
  town: string;
  price: string | null;
  /** "3 bd, 2 ba", only when both are known. */
  facts: string | null;
  /** The street address: the phone's tap target. */
  address: string | null;
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const num = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10));

/** What the label says, in the brief's order: the town, the price, then beds and baths. The lights
 * carry only a place and a town; the price comes from the pins route a moment later (G3dGround
 * priceNear), so the town shows at once and the rest follows. */
export function labelContent(town: string, pin: LabelPin | null): LabelContent {
  const name = town || pin?.city || "";
  if (!pin) return { town: name, price: null, facts: null, address: null };
  return {
    town: name,
    price: pin.price > 0 ? money(pin.price) : null,
    facts: pin.beds > 0 && pin.baths > 0 ? `${num(pin.beds)} bd, ${num(pin.baths)} ba` : null,
    address: pin.address || null,
  };
}

export type ClickAction = "fly" | "route" | "tab" | "none";

/** What a click on a light does. A modifier (ctrl, cmd, shift) or the middle button: the listing
 * in a new tab, no fly-in (the page stays where it is). A plain click over a steady, still map: a
 * short fly-in, then the listing. Mid-flight, before the map is steady, or with reduced motion:
 * the listing at once (a fly-in that waits for a map would break the 1 s promise). */
export function clickAction(
  e: { button: number; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean },
  map: { steady: boolean; flying: boolean; reduced: boolean },
): ClickAction {
  if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey || e.shiftKey))) return "tab";
  if (e.button !== 0) return "none";
  if (map.reduced || map.flying || !map.steady) return "route";
  return "fly";
}

/** The fly-in's duration, ms: long enough to read as going to the home, short enough that the click
 * reaches the listing well inside a second (the route follows at the landing). */
export const FLY_IN_MS = 600;
/** The fly-in's camera: over the home, tilted 60 degrees, facing the way the map already faces (a
 * turn on top of a descent reads as a lurch), down to 1.5 km but never more than FLY_IN_DEPTH times
 * closer than where it starts. Round 57.3's first frames: from the territory shot (145 km) straight
 * to 1.5 km in 700 ms, the middle frame was a grey smear of tiles Google had not streamed yet; a
 * sixth of the range (24 km from the territory, 8 km from a county, 3.5 km from a borough) keeps
 * the picture a picture all the way down, and from a close shot it is the 1.5 km of the brief. */
export const FLY_IN_DEPTH = 6;
export function flyInCamera(home: { lat: number; lng: number }, from: G3dCamera): G3dCamera {
  const range = Math.round(Math.max(1500, (from.range > 0 ? from.range : 25_000) / FLY_IN_DEPTH));
  return { center: { lat: home.lat, lng: home.lng, altitude: 0 }, range, tilt: 60, heading: from.heading, fov: from.fov };
}

export interface TapState {
  /** The home whose label the phone is showing, or null. */
  shown: number | null;
}
export type TapEvent = { kind: "light"; i: number } | { kind: "label" } | { kind: "elsewhere" };

/** THE PHONE: tap, then open. The first tap on a light names it (the label, with the address as
 * the thing to tap); a second tap, on the light or the label, opens it; a tap anywhere else puts
 * the label away. */
export function tapNext(s: TapState, e: TapEvent): { state: TapState; action: "show" | "open" | "hide" | "none" } {
  if (e.kind === "light") return s.shown === e.i ? { state: s, action: "open" } : { state: { shown: e.i }, action: "show" };
  if (e.kind === "label") return s.shown === null ? { state: s, action: "none" } : { state: s, action: "open" };
  return s.shown === null ? { state: s, action: "none" } : { state: { shown: null }, action: "hide" };
}

/** Where on screen a featured home should stand when its card has focus (round 57.3). At the
 * featured rail the page covers most of the map (the heading, four cards, the credit, the button),
 * and a home flown to the middle of the window sat under a card, its label over the NEXT card (the
 * first frame of the focus state). So the map is flown to put the home on OPEN map: the grid point
 * furthest from every solid thing on the page (up to `reach` px, more is no better), nearest the
 * focused card among equals, clear of the edges and of `avoid` (the logo corner). Null when
 * nothing is open by at least `min` px: then the light only brightens where it is. */
export function openPoint(
  solids: readonly Rect[],
  vp: { width: number; height: number },
  near: { x: number; y: number },
  opts: { avoid?: readonly Rect[]; step?: number; margin?: number; reach?: number; min?: number } = {},
): { x: number; y: number } | null {
  const step = opts.step ?? 16, margin = opts.margin ?? 40, reach = opts.reach ?? 80, min = opts.min ?? 28;
  const all = [...solids, ...(opts.avoid ?? [])];
  let best: { x: number; y: number } | null = null;
  let bestScore = -Infinity;
  for (let y = margin; y <= vp.height - margin; y += step) {
    for (let x = margin; x <= vp.width - margin; x += step) {
      let clear = Infinity;
      for (const r of all) {
        const dx = Math.max(r.x - x, 0, x - (r.x + r.w)), dy = Math.max(r.y - y, 0, y - (r.y + r.h));
        clear = Math.min(clear, Math.hypot(dx, dy));
        if (clear < min) break;
      }
      if (clear < min) continue;
      const score = Math.min(clear, reach) - 0.04 * Math.hypot(x - near.x, y - near.y);
      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }
  }
  return best;
}

/** The camera, at `base`'s range, tilt, heading and lens, whose view puts `home` at `target` (css
 * px): Newton's method on the center's latitude and longitude with a numerical Jacobian of our own
 * projection (camera.ts); four steps bring it within a pixel. */
export function cameraShowing(
  home: { lat: number; lng: number; alt?: number },
  target: { x: number; y: number },
  base: G3dCamera,
  vp: { width: number; height: number },
): G3dCamera {
  const view = { ...vp, fov: base.fov };
  const at = (lat: number, lng: number) => project({ ...base, center: { lat, lng, altitude: base.center.altitude } }, view, home.lat, home.lng, home.alt ?? 0);
  let lat = home.lat, lng = home.lng;
  const h = 1e-5;
  for (let k = 0; k < 6; k++) {
    const p = at(lat, lng);
    if (!p) break;
    const ex = target.x - p.x, ey = target.y - p.y;
    if (Math.hypot(ex, ey) < 0.25) break;
    const pa = at(lat + h, lng), pb = at(lat, lng + h);
    if (!pa || !pb) break;
    const a = (pa.x - p.x) / h, c = (pa.y - p.y) / h, b = (pb.x - p.x) / h, d = (pb.y - p.y) / h;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-9) break;
    lat += (d * ex - b * ey) / det;
    lng += (-c * ex + a * ey) / det;
  }
  return { ...base, center: { lat: Math.round(lat * 1e7) / 1e7, lng: Math.round(lng * 1e7) / 1e7, altitude: base.center.altitude } };
}
