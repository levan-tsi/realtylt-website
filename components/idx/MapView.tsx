"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { divIcon, type LatLngBounds } from "leaflet";
import Link from "next/link";
import type { MapPin } from "@/lib/idx/types";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map. Receives the ENTIRE filtered result set as slim pins
 * (/api/idx/pins) — every match is plotted, Zillow-style, independent of grid paging.
 * Hundreds+ of pins stay fast via zoom-level grid clustering (custom, ~30 lines — no
 * extra dependency, no new CSP asset) and viewport culling of unclustered markers.
 * Client-only — import via next/dynamic ssr:false. */

const FONT = "Lato,Helvetica,Arial,sans-serif";
/** Stop clustering at street-ish zoom — pins are individually readable there. */
const SINGLES_ZOOM = 15;

function shortPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 >= 50_000 ? 2 : 1).replace(/\.0+$/, "")}M`;
  return `$${Math.round(n / 1000)}K`;
}

interface Cluster {
  lat: number;
  lng: number;
  count: number;
  members: MapPin[];
}

/** Grid-bin pins at ~84px cells for the zoom (256·2^z px world → 84·360/(256·2^z) deg),
 * then greedily merge groups whose centroids land within ~a cell of a bigger one —
 * grid edges otherwise put two centroids arbitrarily close and the count circles
 * overlap (seen live at 3.8k pins: one cluster's circle intercepted another's clicks). */
function clusterize(pins: MapPin[], zoom: number): { clusters: Cluster[]; singles: MapPin[] } {
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

function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pins.length) return;
    const lats = pins.map((p) => p.lat);
    const lngs = pins.map((p) => p.lng);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [36, 36], maxZoom: 13 },
    );
  }, [pins, map]);
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
                View listing →
              </Link>
            </div>
          </Popup>
        </Marker>
        );
      })}
    </>
  );
}

export default function MapView({ pins }: { pins: MapPin[] }) {
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
      <FitBounds pins={located} />
      <PinLayer pins={located} />
    </MapContainer>
    </div>
  );
}
