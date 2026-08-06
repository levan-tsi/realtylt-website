import type { MapBounds, MapPin } from "@/lib/idx/types";
import { listingPath } from "@/lib/idx/listing-url";

/** Shared map math — used by both the Leaflet fallback and the Google Maps view.
 * `pins` seeds the FIRST paint (the current results page, so the map is never empty while the
 * viewport fetch is in flight); once the map settles, both engines fetch their own pin set for
 * the visible viewport via `/api/idx/pins` (see `createPinFetcher`) and cluster it client-side
 * with supercluster (./clustering.ts) — Zillow-style, so a dense borough never tries to draw
 * every pin. Same-zip listings share a centroid, so `spreadPins` fans leaf pins out
 * deterministically and the chip labels are FLOORED like live ($875K / $1.3M). */

/** Props both map engines accept. `pins` seeds the first paint; `filtersQuery` (the same
 * query string sent to /api/idx/search, minus paging) is what each engine appends its own
 * viewport bounds to when fetching /api/idx/pins. `favorites` lets a fetched pin (not
 * necessarily on the current results page) still show its saved-heart state. Clicking a chip
 * calls `onSelect(id)` so the results panel can scroll to and highlight a matching card when
 * one exists; `selectedId` highlights the matching chip when a card is hovered/focused. */
export interface MapViewProps {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Toggle a listing's saved-heart from the popup (SearchClient wires SavedProvider in). */
  onToggleSave?: (id: string) => void;
  /** api-shaped filters (no page/pageSize/bounds) — appended with the live viewport's bounds
   * to fetch /api/idx/pins. Omitted (or unset) means the map stays page-coupled, the old
   * behaviour, which the map-shared tests and any caller that hasn't opted in still get. */
  filtersQuery?: string;
  /** Ids the visitor has hearted — merged onto viewport-fetched pins the results page never saw. */
  favorites?: string[];
  /** Frame to fit on mount and on every filter change, in place of boundsOfPins(pins) — set
   * this to a chosen county's real extent (county-bounds.ts) so picking "Queens" frames the
   * WHOLE borough (and its viewport fetch pulls every pin in it) rather than whatever the
   * current results page happens to contain. Falls back to boundsOfPins(pins) when unset,
   * e.g. a free-text search with no predefined box. */
  initialBounds?: MapBounds | null;
}

export const MAP_FONT = "Lato,Helvetica,Arial,sans-serif";

/** Chip price label — FLOORED like live realtylt.com (never rounds up): `$875K` under $1M,
 * `$1.3M` / `$4.79M` over (up to 3 significant figures, trailing zeros trimmed). */
export function chipPrice(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1_000_000) {
    const m = Math.floor(n / 10_000) / 100; // floor to 2 decimals of millions (3 sig figs)
    return `$${m.toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  return `$${Math.floor(n / 1000)}K`;
}

/** Deterministic golden-angle spiral so listings sharing a zip-centroid don't stack into
 * one unclickable chip. Coordinates are approximate (zip-centroid) already, so a small fan
 * out is honest; the "Locations approximate" badge stays. Single-occupant coordinates are
 * returned untouched. Offsets are seeded by stable id order, so they never jitter between
 * renders. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 2.39996 rad
const SPIRAL_STEP_DEG = 0.0016; // ≈ 175m per √ring at NY latitude — inside a zip's footprint

export function spreadPins(pins: MapPin[]): MapPin[] {
  const groups = new Map<string, MapPin[]>();
  for (const p of pins) {
    const key = `${p.lat.toFixed(5)}:${p.lng.toFixed(5)}`;
    const bin = groups.get(key);
    if (bin) bin.push(p);
    else groups.set(key, [p]);
  }
  const out: MapPin[] = [];
  for (const members of groups.values()) {
    if (members.length === 1) {
      out.push(members[0]);
      continue;
    }
    const ordered = [...members].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    ordered.forEach((p, i) => {
      if (i === 0) {
        out.push(p);
        return;
      }
      const angle = i * GOLDEN_ANGLE;
      const radius = SPIRAL_STEP_DEG * Math.sqrt(i);
      const lat = p.lat + radius * Math.cos(angle);
      // Longitude degrees shrink with latitude — divide so the visual spread stays circular.
      const lng = p.lng + (radius * Math.sin(angle)) / Math.cos((p.lat * Math.PI) / 180);
      out.push({ ...p, lat, lng });
    });
  }
  return out;
}

/** Bounding box that contains every located pin — the frame the map fits on each page/
 * filter/sort change. Returns null when there's nothing to frame. */
export function boundsOfPins(pins: MapPin[]): MapBounds | null {
  const located = pins.filter((p) => p.lat && p.lng);
  if (located.length === 0) return null;
  let north = -90,
    south = 90,
    east = -180,
    west = 180;
  for (const p of located) {
    if (p.lat > north) north = p.lat;
    if (p.lat < south) south = p.lat;
    if (p.lng > east) east = p.lng;
    if (p.lng < west) west = p.lng;
  }
  return { north, south, east, west };
}

/** Debounced `/api/idx/pins` fetcher shared by both map engines. `.request(bounds)` schedules
 * a fetch after `debounceMs` of quiet (a drag/zoom fires many intermediate bounds; only the
 * last one should hit the network). A sequence counter drops any response that isn't from the
 * most recent request, so a slow fetch for a bounds the visitor already panned away from can
 * never clobber fresher data — the classic race a plain debounce misses. */
export function createPinFetcher(opts: {
  filtersQuery: string;
  onData: (pins: MapPin[], total: number) => void;
  onError?: () => void;
  debounceMs?: number;
}) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;
  const request = (bounds: MapBounds) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const mySeq = ++seq;
      const qs = new URLSearchParams(opts.filtersQuery);
      qs.set("north", String(bounds.north));
      qs.set("south", String(bounds.south));
      qs.set("east", String(bounds.east));
      qs.set("west", String(bounds.west));
      fetch(`/api/idx/pins?${qs.toString()}`)
        .then((r) => (r.ok ? (r.json() as Promise<{ pins: MapPin[]; total: number }>) : Promise.reject(r.status)))
        .then((data) => {
          if (mySeq !== seq) return; // a newer request already superseded this one
          opts.onData(data.pins, data.total);
        })
        .catch(() => {
          if (mySeq === seq) opts.onError?.();
        });
    }, opts.debounceMs ?? 400);
  };
  const cancel = () => {
    if (timer) clearTimeout(timer);
    // Also invalidate anything already IN FLIGHT — a cancelled fetcher must never deliver.
    // Without this, a filter change that cancelled the old fetcher could still receive the
    // old query's pins a beat later and paint the previous search over the new one.
    seq++;
  };
  return { request, cancel };
}

/** Rough footprint of the popup mini-card (photo frame 158 + price/address/office lines ~72 +
 * the View Listing button ~42, plus a little breathing room) — enough to decide which side of
 * its anchor has room, without waiting for a real layout pass. Same technique as
 * LocationSuggest's dropdown: measure the space above vs. below and open toward the side that
 * actually has it, rather than always the same direction and hoping. */
const POPUP_HEIGHT = 300;
const POPUP_MARGIN = 16;

/** Given the anchor chip's viewport rect, which side should the popup open on so it stays
 * visible? `clip` is the box the popup is actually CLIPPED by — for the Google engine that is
 * the intersection of the map container (overflow-hidden) and the window, NOT the window
 * alone: a chip 9px under the map's top edge had 400px of window above it, so a window-only
 * measure said "above" and the card rendered decapitated behind the map's edge (watched
 * live). The chip already sits visually above its pin, so "above" is the default look — this
 * only flips to "below" when there truly isn't room above. */
export function popupPlacement(
  anchorRect: { top: number; bottom: number },
  clip: { top: number; bottom: number },
): "above" | "below" {
  const spaceAbove = anchorRect.top - clip.top - POPUP_MARGIN;
  const spaceBelow = clip.bottom - anchorRect.bottom - POPUP_MARGIN;
  return spaceAbove >= POPUP_HEIGHT || spaceAbove >= spaceBelow ? "above" : "below";
}

/** Cluster bubble size/label tier — Zillow-style: the more homes inside it, the bigger the
 * bubble and the bigger its number, so the map's own density reads at a glance without opening
 * anything. Four tiers keep the largest bubble (a whole dense county at low zoom) readable
 * without swallowing the map. */
export function clusterTier(count: number): { size: number; font: number } {
  if (count < 10) return { size: 34, font: 12 };
  if (count < 50) return { size: 42, font: 13 };
  if (count < 200) return { size: 50, font: 14 };
  return { size: 58, font: 15 };
}

/** Cluster count label — exact under 1,000 (supercluster's own tiles rarely exceed that per
 * bubble at a usable zoom), abbreviated to one decimal above it ("9.7k"), same floored-trim
 * spirit as chipPrice. */
export function clusterLabel(count: number): string {
  if (count < 1000) return String(count);
  const k = count / 1000;
  return `${k.toFixed(k < 10 ? 1 : 0).replace(/\.0$/, "")}k`;
}

/** The cluster bubble's shared visual language (monochrome ink circle, white border, one
 * shadow scale) as a standalone CSS string — `.rlt-cluster-bubble` in globals.css carries the
 * class-level rules (hover/focus, transition); this is only the per-bubble size that varies. */
function clusterBubbleStyle(count: number): string {
  const { size, font } = clusterTier(count);
  return `width:${size}px;height:${size}px;font-size:${font}px`;
}

/** Real DOM node for a cluster bubble (GoogleMapView's OverlayView appends live elements). */
export function buildClusterBubble(count: number, onClick: () => void): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "rlt-cluster-bubble";
  b.setAttribute("aria-label", `${count} homes — click to zoom in`);
  b.style.cssText = clusterBubbleStyle(count);
  b.textContent = clusterLabel(count);
  b.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return b;
}

/** Same bubble as an HTML string (Leaflet's `divIcon` takes markup, not a live node — it builds
 * its own container and injects this). */
export function clusterBubbleHtml(count: number): string {
  return `<span class="rlt-cluster-bubble" style="${clusterBubbleStyle(count)}" role="button" aria-label="${count} homes — click to zoom in">${clusterLabel(count)}</span>`;
}

/** Popup mini-card shared by both map engines, built as a real DOM node so the photo pager's
 * arrow buttons carry live listeners (Google's InfoWindow accepts an element directly; the
 * Leaflet view mounts it via a ref). Owner's ask: the popup shows the listing's PICTURES,
 * lets you flip through them without opening the listing, and links through to it.
 *
 * MLS-safety: photos load through the /api/media proxy ONE at a time — the pager swaps the
 * single <img>'s src per click, so opening a popup costs one request and each arrow press
 * exactly one more. Indices past the real set 302 to the branded coming-soon still, so a
 * stale photoCount can never show a broken frame. Inline styles on purpose: InfoWindow
 * content renders outside the app's stylesheet. */
export function popupNode(
  p: MapPin,
  opts: { onClose?: () => void; onToggleSave?: (id: string) => void } = {},
): HTMLElement {
  const { onClose, onToggleSave } = opts;
  const bb = [p.beds > 0 && `${p.beds} bd`, p.baths > 0 && `${p.baths} ba`].filter(Boolean).join(" / ");
  const root = document.createElement("div");
  // Edge-to-edge: both engines' popup chrome is stripped to a bare 16px-rounded shell
  // (globals.css), so the photo IS the popup's top — no white mat around it (owner: "white
  // box is too big… make it little bit bigger than pics and info").
  root.style.cssText = `position:relative;width:252px;font-family:${MAP_FONT}`;

  // The photo's two corner controls (owner: "one side X exit and one side heart to save"):
  // heart top-LEFT toggles the favorite (flips locally at once; the chips follow via the
  // provider), X top-RIGHT closes — the engines' stock X floats in dead white space above
  // the content and is hidden in globals.css.
  const cornerBtn = (side: "left" | "right", label: string) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.style.cssText =
      `position:absolute;top:6px;${side}:6px;z-index:5;width:26px;height:26px;border-radius:9999px;` +
      "border:0;cursor:pointer;background:rgb(0 0 0/.55);display:grid;place-items:center;padding:0";
    return b;
  };
  if (onClose) {
    const x = cornerBtn("right", "Close");
    x.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    x.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    });
    root.appendChild(x);
  }
  if (onToggleSave) {
    let saved = !!p.saved;
    const heartSvg = () =>
      `<svg width="13" height="13" viewBox="0 0 24 24" fill="${saved ? "#ef4444" : "none"}" stroke="${saved ? "#ef4444" : "#fff"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    const h = cornerBtn("left", "Save this home");
    h.setAttribute("aria-pressed", String(saved));
    h.innerHTML = heartSvg();
    h.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      saved = !saved;
      h.innerHTML = heartSvg();
      h.setAttribute("aria-pressed", String(saved));
      onToggleSave(p.id);
    });
    root.appendChild(h);
  }

  // EVERY popup has a photo frame. photoCount is photos_servable, so 0 means "nothing mirrored
  // yet" — the card shows /api/media/{id}/0 for exactly those listings too (the route answers with
  // a cover substitute or the branded still), and a popup that silently dropped its picture while
  // the card beside it showed one was the same disagreement in the other direction.
  {
    const n = Math.max(1, p.photoCount);
    const frame = document.createElement("div");
    frame.style.cssText =
      "position:relative;width:252px;height:158px;overflow:hidden;background:#eceff3";
    const img = document.createElement("img");
    img.alt = `${p.address}, ${p.city}`;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    // Indices past what storage/proxy can serve answer 503 text/plain (deliberately
    // undecodable) — a plain <img> would show a dead frame mid-pager. Settle those on the
    // branded still instead, once, no retry loop. (Owner-reported: "34 pics… letting me
    // switch but not loading.")
    img.addEventListener("error", () => {
      if (!img.src.endsWith("/images/mls/coming-soon-notext.svg")) img.src = "/images/mls/coming-soon-notext.svg";
    });
    let idx = 0;
    const show = (to: number) => {
      idx = ((to % n) + n) % n;
      img.src = `/api/media/${p.id}/${idx}`;
      counter.textContent = `${idx + 1} / ${n}`;
    };
    const counter = document.createElement("span");
    counter.style.cssText =
      "position:absolute;right:6px;bottom:6px;padding:2px 7px;border-radius:8px;background:rgb(0 0 0/.7);color:#fff;font:700 10px/1.6 " +
      MAP_FONT + ";letter-spacing:.08em";
    frame.appendChild(img);
    // STATUS BADGE — the same fact the card has always carried, and since the chips went hollow
    // for Pending this round a visitor now LEARNS the distinction from the map and then opens a
    // popup that says nothing about it. Only non-Active statuses appear (Pending, Coming Soon),
    // exactly like ListingCard's chip: solid ink, 8px radius, 10px bold uppercase.
    // It sits bottom-LEFT rather than the card's top-left because both top corners of a popup are
    // controls (heart, close) — pairing it with the photo counter on the bottom edge keeps the
    // controls clean and gives the frame a deliberate two-corner rhythm instead of a crowded one.
    if (p.status && p.status !== "Active") {
      const badge = document.createElement("span");
      badge.textContent = p.status;
      badge.style.cssText =
        "position:absolute;left:6px;bottom:6px;padding:3px 8px;border-radius:8px;background:#000000;" +
        `color:#fff;font:700 10px/1.4 ${MAP_FONT};letter-spacing:.14em;text-transform:uppercase`;
      frame.appendChild(badge);
    }
    if (n > 1) {
      const arrow = (side: "left" | "right", label: string, step: number) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", label);
        b.style.cssText =
          `position:absolute;top:50%;${side}:6px;transform:translateY(-50%);width:28px;height:28px;` +
          "border-radius:9999px;border:0;cursor:pointer;background:rgb(255 255 255/.92);" +
          "box-shadow:0 1px 4px rgb(0 0 0/.25);display:grid;place-items:center;padding:0";
        b.innerHTML =
          `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${side === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}"/></svg>`;
        b.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          show(idx + step);
        });
        return b;
      };
      frame.appendChild(arrow("left", "Previous photo", -1));
      frame.appendChild(arrow("right", "Next photo", 1));
      frame.appendChild(counter);
    }
    show(0);
    root.appendChild(frame);
  }

  // Feed strings go in as TEXT — the old popupHtml interpolated them into markup, and an
  // address is not a place to trust angle brackets.
  const line = (txt: string, css: string) => {
    const el = document.createElement("p");
    el.style.cssText = css;
    el.textContent = txt;
    root.appendChild(el);
  };
  line(`${chipPrice(p.price)}${bb ? ` · ${bb}` : ""}`, "margin:10px 12px 0;font-weight:700;font-size:14px;color:#000000");
  line(`${p.address}, ${p.city} ${p.zip}`, "margin:3px 12px 0;font-size:12px;color:#000000");
  line(`Listed with ${p.office}`, "margin:3px 12px 0;font-size:11px;color:#6E7681");

  const link = document.createElement("a");
  link.href = listingPath(p);
  link.textContent = "View Listing";
  link.style.cssText =
    "display:block;margin:10px 12px 12px;padding:8px 0;border-radius:8px;background:#000000;color:#fff;" +
    `text-align:center;font:700 11px/1.4 ${MAP_FONT};letter-spacing:.12em;text-transform:uppercase;text-decoration:none`;
  root.appendChild(link);

  return root;
}
