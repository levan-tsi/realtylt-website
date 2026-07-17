import type { MapBounds, MapPin } from "@/lib/idx/types";

/** Shared map math — used by both the Leaflet fallback and the Google Maps view. */

/** Props both map engines accept — pins to plot, the frame to fit when the county
 * changes, and a callback fired with the current viewport box on load + every settle. */
export interface MapViewProps {
  pins: MapPin[];
  fitBounds: MapBounds;
  onBoundsChange: (b: MapBounds) => void;
}

export const MAP_FONT = "Lato,Helvetica,Arial,sans-serif";
/** Stop clustering at street-ish zoom — pins are individually readable there. */
export const SINGLES_ZOOM = 15;

export function shortPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 >= 50_000 ? 2 : 1).replace(/\.0+$/, "")}M`;
  return `$${Math.round(n / 1000)}K`;
}

export interface Cluster {
  lat: number;
  lng: number;
  count: number;
  members: MapPin[];
}

/** Grid-bin pins at ~84px cells for the zoom (256·2^z px world → 84·360/(256·2^z) deg),
 * then greedily merge groups whose centroids land within ~a cell of a bigger one —
 * grid edges otherwise put two centroids arbitrarily close and the count circles
 * overlap (seen live at 3.8k pins: one cluster's circle intercepted another's clicks). */
export function clusterize(pins: MapPin[], zoom: number): { clusters: Cluster[]; singles: MapPin[] } {
  if (zoom >= SINGLES_ZOOM) return { clusters: [], singles: pins };
  const cell = 84 / 2 ** zoom;
  const bins = new Map<string, MapPin[]>();
  for (const p of pins) {
    const key = `${Math.floor(p.lat / cell)}:${Math.floor(p.lng / cell)}`;
    const bin = bins.get(key);
    if (bin) bin.push(p);
    else bins.set(key, [p]);
  }
  const centroid = (members: MapPin[]) => ({
    lat: members.reduce((s, p) => s + p.lat, 0) / members.length,
    lng: members.reduce((s, p) => s + p.lng, 0) / members.length,
  });
  const groups = [...bins.values()]
    .map((members) => ({ ...centroid(members), count: members.length, members }))
    .sort((a, b) => b.count - a.count);
  const merged: Cluster[] = [];
  const gap = cell * 0.8; // ≈ icon diameter + breathing room, in map degrees
  for (const g of groups) {
    const host = merged.find((m) => Math.abs(m.lat - g.lat) < gap && Math.abs(m.lng - g.lng) < gap);
    if (host) {
      host.members = host.members.concat(g.members);
      host.count = host.members.length;
      Object.assign(host, centroid(host.members));
    } else {
      merged.push({ ...g, members: [...g.members] });
    }
  }
  return {
    clusters: merged.filter((m) => m.count > 1),
    singles: merged.filter((m) => m.count === 1).map((m) => m.members[0]),
  };
}

/** Popup mini-card markup shared by both map engines (Google gets it as an HTML string). */
export function popupHtml(p: MapPin): string {
  const bb = [p.beds > 0 && `${p.beds} bd`, p.baths > 0 && `${p.baths} ba`].filter(Boolean).join(" / ");
  return `<div style="min-width:180px;font-family:${MAP_FONT}">
<p style="margin:0;font-weight:700">${shortPrice(p.price)}${bb ? ` · ${bb}` : ""}</p>
<p style="margin:4px 0">${p.address}, ${p.city} ${p.zip}</p>
<p style="margin:4px 0;font-size:11px;color:#6E7681">Listed with ${p.office}</p>
<a href="/listing/${p.id}" style="color:#102c54;font-weight:700">View listing</a>
</div>`;
}
