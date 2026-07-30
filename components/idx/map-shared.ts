import type { MapBounds, MapPin } from "@/lib/idx/types";
import { listingPath } from "@/lib/idx/listing-url";

/** Shared map math — used by both the Leaflet fallback and the Google Maps view.
 * The results map is PAGE-COUPLED: it plots exactly the current page's listings as black
 * price chips (owner's ask — "the map shows that page's homes; page 2 swaps both"), so no
 * clustering or viewport refetch. Same-zip listings share a centroid, so `spreadPins` fans
 * them out deterministically and the chip labels are FLOORED like live ($875K / $1.3M). */

/** Props both map engines accept. `pins` is the current page's listings; clicking a chip
 * calls `onSelect(id)` so the results panel can scroll to and highlight that card;
 * `selectedId` highlights the matching chip when a card is hovered/focused. */
export interface MapViewProps {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Toggle a listing's saved-heart from the popup (SearchClient wires SavedProvider in). */
  onToggleSave?: (id: string) => void;
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

  if (p.photoCount > 0) {
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
      if (!img.src.endsWith("/images/mls/coming-soon-notext.webp")) img.src = "/images/mls/coming-soon-notext.webp";
    });
    let idx = 0;
    const show = (n: number) => {
      idx = ((n % p.photoCount) + p.photoCount) % p.photoCount;
      img.src = `/api/media/${p.id}/${idx}`;
      counter.textContent = `${idx + 1} / ${p.photoCount}`;
    };
    const counter = document.createElement("span");
    counter.style.cssText =
      "position:absolute;right:6px;bottom:6px;padding:2px 7px;border-radius:8px;background:rgb(0 0 0/.7);color:#fff;font:700 10px/1.6 " +
      MAP_FONT + ";letter-spacing:.08em";
    frame.appendChild(img);
    if (p.photoCount > 1) {
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
