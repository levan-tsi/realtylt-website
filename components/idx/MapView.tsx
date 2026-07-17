"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { divIcon, type LatLngBounds } from "leaflet";
import Link from "next/link";
import type { MapPin } from "@/lib/idx/types";
import type { MapViewProps } from "./map-shared";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map. Receives the ENTIRE filtered result set as slim pins
 * (/api/idx/pins) — every match is plotted, Zillow-style, independent of grid paging.
 * Hundreds+ of pins stay fast via zoom-level grid clustering (custom, ~30 lines — no
 * extra dependency, no new CSP asset) and viewport culling of unclustered markers.
 * Client-only — import via next/dynamic ssr:false. */

// Clustering + chip math shared with GoogleMapView (components/idx/map-shared.ts).
import { clusterize, MAP_FONT as FONT, shortPrice } from "./map-shared";

const priceIcon = (price: number) =>
  divIcon({
    className: "",
    html: `<span style="display:inline-block;transform:translate(-50%,-100%);background:#000;color:#fff;font:700 11px/1 ${FONT};padding:5px 8px;white-space:nowrap;box-shadow:0 2px 8px rgb(0 0 0/.3)">${shortPrice(price)}</span>`,
    iconSize: [0, 0],
  });

const clusterIcon = (count: number) => {
  const d = count >= 100 ? 46 : count >= 10 ? 40 : 34;
  return divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;transform:translate(-50%,-50%);width:${d}px;height:${d}px;border-radius:9999px;background:#000;color:#fff;font:700 12px/1 ${FONT};border:2px solid rgb(255 255 255/.85);box-shadow:0 2px 10px rgb(0 0 0/.35);cursor:pointer">${count}</span>`,
    iconSize: [0, 0],
  });
};

/** Frames the county/region box and reports the viewport up to the SearchClient so it can
 * load only the pins in view. Fits on mount and whenever the frame changes (county chip);
 * emits the current box on every pan/zoom-end. Panning never refits (that would fight the
 * user) — only a new `fitBounds` frame moves the map. */
function ViewportSync({ fitBounds, onBoundsChange }: Pick<MapViewProps, "fitBounds" | "onBoundsChange">) {
  const map = useMap();
  const emit = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  }, [map, onBoundsChange]);
  useMapEvents({ moveend: emit });
  useEffect(() => {
    // Defer the fit: fitBounds(animate:false) fires `moveend` synchronously, and doing that
    // inside the effect would run sibling setState (PinLayer, the parent) mid-commit — a
    // React error. A macrotask hop lands the move (and the emit it triggers) safely after
    // commit. animate:false keeps it motion-free (prefers-reduced-motion friendly).
    const id = setTimeout(() => {
      map.fitBounds(
        [
          [fitBounds.south, fitBounds.west],
          [fitBounds.north, fitBounds.east],
        ],
        { padding: [24, 24], maxZoom: 14, animate: false },
      );
      emit();
    }, 0);
    return () => clearTimeout(id);
  }, [fitBounds, map, emit]);
  return null;
}

function PinLayer({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  const [view, setView] = useState<{ zoom: number; bounds: LatLngBounds }>(() => ({
    zoom: map.getZoom(),
    bounds: map.getBounds().pad(0.5),
  }));
  useMapEvents({
    moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds().pad(0.5) }),
  });

  const { clusters, singles } = useMemo(() => clusterize(pins, view.zoom), [pins, view.zoom]);
  // Only mount markers near the viewport — keeps the DOM small when zoomed in deep.
  const visible = useMemo(
    () => singles.filter((p) => view.bounds.contains([p.lat, p.lng])),
    [singles, view.bounds],
  );

  return (
    <>
      {clusters.map((c) => (
        <Marker
          key={`c-${c.members[0].id}-${c.count}`}
          position={[c.lat, c.lng]}
          icon={clusterIcon(c.count)}
          eventHandlers={{
            click: () => {
              const lats = c.members.map((p) => p.lat);
              const lngs = c.members.map((p) => p.lng);
              map.fitBounds(
                [
                  [Math.min(...lats), Math.min(...lngs)],
                  [Math.max(...lats), Math.max(...lngs)],
                ],
                { padding: [48, 48], maxZoom: Math.min(view.zoom + 3, 16) },
              );
            },
          }}
        />
      ))}
      {visible.map((p) => {
        const bb = [p.beds > 0 && `${p.beds} bd`, p.baths > 0 && `${p.baths} ba`]
          .filter(Boolean)
          .join(" / ");
        return (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={priceIcon(p.price)}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{shortPrice(p.price)}{bb ? ` · ${bb}` : ""}</p>
              <p style={{ margin: "4px 0" }}>
                {p.address}, {p.city} {p.zip}
              </p>
              <p style={{ margin: "4px 0", fontSize: 11, color: "#6E7681" }}>Listed with {p.office}</p>
              <Link href={`/listing/${p.id}`} style={{ color: "#102c54", fontWeight: 700 }}>
                View listing
              </Link>
            </div>
          </Popup>
        </Marker>
        );
      })}
    </>
  );
}

export default function MapView({ pins, fitBounds, onBoundsChange }: MapViewProps) {
  // Rows without coordinates come through as lat/lng 0 — never pin (or fit) Null Island.
  const located = useMemo(() => pins.filter((p) => p.lat && p.lng), [pins]);

  return (
    <div className="relative h-full min-h-96 w-full">
      {/* The live feed carries no coordinates — pins sit at zip-centroid (approximate). */}
      <p className="pointer-events-none absolute bottom-2 left-2 z-[500] border border-[#dddddd] bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
        Locations approximate
      </p>
    <MapContainer
      center={[41.5, -74.0]}
      zoom={9}
      scrollWheelZoom={false}
      className="h-full min-h-96 w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ViewportSync fitBounds={fitBounds} onBoundsChange={onBoundsChange} />
      <PinLayer pins={located} />
    </MapContainer>
    </div>
  );
}
