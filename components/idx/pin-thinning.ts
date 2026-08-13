import type { MapPin } from "@/lib/idx/types";
import { chipPrice } from "./map-shared";

/** Zillow-style screen-space label thinning — the round-23 replacement for count bubbles.
 *
 * One vocabulary, one rule: EVERY marker on the map is a single home. A home whose price pill
 * fits without touching an already-placed pill renders as a PILL; one that collides renders as
 * a DOT; a dot that would sit invisibly under a pill (or on top of another dot) is dropped —
 * it is unclickable at that zoom anyway, and the "Showing N of M" banner tells the truth about
 * what is drawn. Zooming in frees pixel room, so dots become pills on their own; there is no
 * mode switch and there are no count circles.
 *
 * Who gets a pill is decided in a STABLE priority order — the selected home first (a hovered
 * card's chip must always exist to highlight), then saved (hearted) homes, then homes you can
 * still buy, then Pending/Under Contract, ties broken by a deterministic hash of the id. Stable
 * beats clever here: the same viewport must plan the same markers on every draw (draw runs on
 * each idle AND each card hover), or the map flickers; and a hash reads as Zillow's "arbitrary
 * sample" without biasing the visible market toward a price band the way price-sorting would.
 *
 * Pure math on projected pixels — both map engines pass their own `project`; nothing here
 * touches the DOM, so the whole planner is testable without a map. */

export interface PlannedMarker {
  pin: MapPin;
  kind: "pill" | "dot";
  /** Projected pixel position, in the caller's own projection space (anchor: a pill hangs
   * above this point like the existing chips; a dot centres on it). */
  x: number;
  y: number;
  /** The pill's text — ALWAYS the floored price (owner: "price must always show"). Dots carry
   * it too, for their aria-labels. */
  label: string;
}

/** Rendered-marker budget. Every marker is a live DOM node rebuilt on each map idle, so this
 * is a draw-performance cap, not a data cap (the fetch cap is PIN_CAP). The planning itself is
 * cheap — 3.93ms/draw over 3,000 pins, guarded <8ms by pin-thinning.bench.test.ts — so the cap
 * bounds the DOM rebuild. In practice thinning self-limits far below it (measured 171 markers
 * on the 1440 default six-county frame); the cap is the backstop for a dense borough viewport
 * at a mid zoom. Priority order above decides who survives it, so it always drops tail dots. */
export const MARKER_CAP = 600;

// Round 24b: the pill's VISIBLE face shrank to hug the price (3px 6px padding — owner:
// "just the size of the price"), and the collision box follows the FACE, not the button's
// transparent 24px hit shell. Denser labelling is the point: a smaller box means more
// prices fit before thinning to dots. The shells of two adjacent pills may overlap a few
// transparent pixels; any tap ON a face still resolves to that face's own pill.
const PILL_H = 18; // 11px/1 line + 3px vertical padding ×2, + a hair for the face's border ring
const PILL_GAP = 3; // min air between two pills before one of them becomes a dot
const DOT_CLEARANCE = 10; // a dot closer than this to an accepted dot is invisible — drop it
/** Where the INK actually is, relative to the anchor. The chip button carries 4px of
 * transparent padding whose bottom edge sits on the anchor, and that padding doubles as the
 * teardrop tail's height — so the painted face runs from 4px above the anchor upward, NOT from
 * the anchor upward. Measured on the rendered map (50/50 faces): 17px tall, and the width
 * estimate above runs 1.8–3.8px wide of the real glyph box. The collision rect keeps using
 * PILL_H: every rect there is shifted identically, so label-vs-label separation is unaffected,
 * and it is deliberately the generous box. This one answers a different question — "is a home
 * HIDDEN here" — and for that the box has to be where the ink is. */
const PILL_TAIL = 4;
const PILL_FACE_H = 17;
/** Pins this far outside the viewport still plan — half a wide pill, so a chip whose anchor
 * sits just past the edge can still show its inner half instead of popping in mid-pan. */
const EDGE_MARGIN = 48;

/** The same estimate the eye makes: label glyphs at 700 11px Lato run ~7px average, plus the
 * face's 6px horizontal padding ×2, plus the heart a saved chip prepends. */
function estimatePillWidth(label: string, saved: boolean): number {
  return label.length * 7 + 12 + (saved ? 12 : 0);
}

/** djb2 — tiny, deterministic, unsigned. Not cryptographic and does not need to be: it only
 * has to spread ids evenly and return the same answer on every draw. */
function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
  return h;
}

interface Rect {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** Uniform-grid spatial index over rects — collision tests stay O(1)-ish per candidate
 * instead of O(placed), which matters at 3,000 candidate pins per draw. */
function rectGrid(cell: number) {
  const cells = new Map<number, Rect[]>();
  // Pack the two cell coordinates into one integer key — string keys allocate on every probe.
  const key = (cx: number, cy: number) => cx * 100003 + cy;
  const span = function* (rect: Rect) {
    const x0 = Math.floor(rect.l / cell);
    const x1 = Math.floor(rect.r / cell);
    const y0 = Math.floor(rect.t / cell);
    const y1 = Math.floor(rect.b / cell);
    for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) yield key(cx, cy);
  };
  return {
    collides(rect: Rect): boolean {
      for (const k of span(rect)) {
        const bin = cells.get(k);
        if (!bin) continue;
        for (const r of bin) {
          if (rect.l < r.r && rect.r > r.l && rect.t < r.b && rect.b > r.t) return true;
        }
      }
      return false;
    },
    add(rect: Rect) {
      for (const k of span(rect)) {
        const bin = cells.get(k);
        if (bin) bin.push(rect);
        else cells.set(k, [rect]);
      }
    },
  };
}

export function planMarkers(opts: {
  pins: MapPin[];
  /** lat/lng → pixels in the caller's projection space (Google: fromLatLngToDivPixel;
   * Leaflet: latLngToContainerPoint). Return null for a point it cannot project. */
  project: (lat: number, lng: number) => { x: number; y: number } | null;
  /** The visible pixel box in that same space — project the map bounds' corners to get it. */
  viewport: { left: number; top: number; right: number; bottom: number };
  selectedId?: string | null;
  /** Saved (hearted) — affects priority and the pill-width estimate. Defaults to pin.saved. */
  isSaved?: (pin: MapPin) => boolean;
  maxMarkers?: number;
}): PlannedMarker[] {
  const { pins, project, viewport, selectedId = null, isSaved = (p) => !!p.saved, maxMarkers = MARKER_CAP } = opts;

  // Project + cull first (cheapest test), then order by tier and hash.
  const candidates: { pin: MapPin; x: number; y: number; tier: number; hash: number; saved: boolean }[] = [];
  for (const pin of pins) {
    const pt = project(pin.lat, pin.lng);
    if (!pt) continue;
    if (
      pt.x < viewport.left - EDGE_MARGIN ||
      pt.x > viewport.right + EDGE_MARGIN ||
      pt.y < viewport.top - EDGE_MARGIN ||
      pt.y > viewport.bottom + EDGE_MARGIN
    )
      continue;
    const saved = isSaved(pin);
    const spokenFor = pin.status === "Pending" || pin.status === "Under Contract";
    const tier = pin.id === selectedId ? 0 : saved ? 1 : spokenFor ? 3 : 2;
    candidates.push({ pin, x: pt.x, y: pt.y, tier, hash: hashId(pin.id), saved });
  }
  candidates.sort((a, b) => a.tier - b.tier || a.hash - b.hash || (a.pin.id < b.pin.id ? -1 : 1));

  const pills = rectGrid(64);
  // The pill FACES, with no separation margin — a different question from the one `pills`
  // answers. See the dot test below.
  const faces = rectGrid(64);
  const dots = rectGrid(32);
  const out: PlannedMarker[] = [];
  for (const c of candidates) {
    if (out.length >= maxMarkers) break;
    const label = chipPrice(c.pin.price);
    const w = estimatePillWidth(label, c.saved);
    // A pill hangs above its anchor point, tip at (x, y) — same as the chips' -50%/-100%.
    // Two boxes, because "may another LABEL go here" and "is a home HIDDEN here" are not the
    // same question. This one carries PILL_GAP on every side so two labels never touch.
    const rect: Rect = {
      l: c.x - w / 2 - PILL_GAP,
      r: c.x + w / 2 + PILL_GAP,
      t: c.y - PILL_H - PILL_GAP,
      b: c.y + PILL_GAP,
    };
    // The selected home is ALWAYS a pill — the results panel highlight must have something to
    // point at — but its rect still registers so later pills keep clear of it.
    if (c.tier === 0 || !pills.collides(rect)) {
      pills.add(rect);
      faces.add({ l: c.x - w / 2, r: c.x + w / 2, t: c.y - PILL_TAIL - PILL_FACE_H, b: c.y - PILL_TAIL });
      out.push({ pin: c.pin, kind: "pill", x: c.x, y: c.y, label });
      continue;
    }
    // Dot fallback: centred on the point. Dropped only when it would be INVISIBLE — genuinely
    // behind a pill's painted face, or on top of a dot already accepted.
    //
    // This test used to run against the pill COLLISION rect (the one above), so a home whose
    // anchor merely grazed a neighbouring label's 3px breathing margin was deleted from the
    // map outright. Measured at street zoom over Poughkeepsie: 15 homes in view, 9 drawn, and
    // every one of the 6 missing was outside the pill's actual face — sitting in the margin,
    // or below the face where a dot shows perfectly well. A separation margin exists to keep
    // two labels from touching; it is not a claim about what the visitor can see.
    //
    // The face test is a POINT test on the dot's centre: a rect covers more than half of a
    // dot exactly when it contains its centre, and half a dot is still a mark you can see and
    // press (the hit target is 24px and reaches out from under any label).
    if (faces.collides({ l: c.x, r: c.x, t: c.y, b: c.y })) continue;
    const dotRect: Rect = {
      l: c.x - DOT_CLEARANCE / 2,
      r: c.x + DOT_CLEARANCE / 2,
      t: c.y - DOT_CLEARANCE / 2,
      b: c.y + DOT_CLEARANCE / 2,
    };
    if (dots.collides(dotRect)) continue;
    dots.add(dotRect);
    out.push({ pin: c.pin, kind: "dot", x: c.x, y: c.y, label });
  }
  // The test above can only see the pills placed BEFORE this candidate, but priority order goes
  // on accepting pills afterwards and both engines paint every dot UNDER every pill. So a pill
  // taken later buries a dot the loop already approved, and that dot still counted itself in
  // "N of M homes shown". Measured on the live map at mid zoom: 21 such dots across three
  // markets, up to 96% of the mark covered. The face index is complete now, so one pass removes
  // exactly the marks that are not there — the same question the loop asks, asked once the
  // answer is knowable.
  return out.filter((m) => m.kind === "pill" || !faces.collides({ l: m.x, r: m.x, t: m.y, b: m.y }));
}
