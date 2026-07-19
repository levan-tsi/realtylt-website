import type { MapBounds, MapPin } from "@/lib/idx/types";

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

/** Popup mini-card markup shared by both map engines (Google gets it as an HTML string). */
export function popupHtml(p: MapPin): string {
  const bb = [p.beds > 0 && `${p.beds} bd`, p.baths > 0 && `${p.baths} ba`].filter(Boolean).join(" / ");
  return `<div style="min-width:180px;font-family:${MAP_FONT}">
<p style="margin:0;font-weight:700">${chipPrice(p.price)}${bb ? ` · ${bb}` : ""}</p>
<p style="margin:4px 0">${p.address}, ${p.city} ${p.zip}</p>
<p style="margin:4px 0;font-size:11px;color:#6E7681">Listed with ${p.office}</p>
<a href="/listing/${p.id}" style="color:#102c54;font-weight:700">View listing</a>
</div>`;
}
