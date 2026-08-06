import Supercluster from "supercluster";
import type { MapBounds, MapPin } from "@/lib/idx/types";

/** Zillow-style clustering over the map's pins — a thin, testable wrapper around
 * `supercluster` (a spatial index, not a component). One index per pin set; `getClusterEntries`
 * is cheap to call on every pan/zoom `idle` (no rebuild). radius=60px groups anything a Zillow
 * user would call "the same cluster" at that zoom; maxZoom=17 means past that every home always
 * renders as its own pin — a visitor zoomed to street level never sees a bubble hiding a home. */

interface PinProps {
  pinId: string;
}

export type ClusterIndex = Supercluster<PinProps>;

export type ClusterEntry =
  | { kind: "pin"; pin: MapPin }
  | { kind: "cluster"; id: number; count: number; lat: number; lng: number };

export function buildClusterIndex(pins: MapPin[]): ClusterIndex {
  const index = new Supercluster<PinProps>({ radius: 60, maxZoom: 17, minZoom: 0 });
  index.load(
    pins
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        type: "Feature" as const,
        properties: { pinId: p.id },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
      })),
  );
  return index;
}

/** Cluster/pin entries visible in `bounds` at `zoom` (rounded — supercluster indexes at integer
 * zoom levels). `pinsById` recovers the full MapPin for a leaf feature, which only carries the
 * id in its GeoJSON properties. A leaf whose id isn't in the map (shouldn't happen — the index
 * is built from the same pin set) is dropped rather than crashing the draw. */
export function getClusterEntries(
  index: ClusterIndex,
  pinsById: Map<string, MapPin>,
  bounds: MapBounds,
  zoom: number,
): ClusterEntry[] {
  const bbox: [number, number, number, number] = [bounds.west, bounds.south, bounds.east, bounds.north];
  const z = Math.max(0, Math.min(20, Math.round(zoom)));
  return index.getClusters(bbox, z).flatMap((f): ClusterEntry[] => {
    const [lng, lat] = f.geometry.coordinates;
    if ("cluster" in f.properties && f.properties.cluster) {
      return [{ kind: "cluster", id: f.properties.cluster_id, count: f.properties.point_count, lat, lng }];
    }
    const pin = pinsById.get((f.properties as PinProps).pinId);
    return pin ? [{ kind: "pin", pin }] : [];
  });
}

/** Zoom level a cluster click should land on — one past the point it stops being a single
 * bubble, capped so the last click on the tightest cluster always lands on individual pins. */
export function clusterExpansionZoom(index: ClusterIndex, clusterId: number): number {
  return Math.min(20, index.getClusterExpansionZoom(clusterId));
}
