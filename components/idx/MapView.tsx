"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import Link from "next/link";
import type { Listing } from "@/lib/idx/types";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map with price pins. Client-only — import via next/dynamic ssr:false. */

function shortPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 >= 50_000 ? 2 : 1).replace(/\.0+$/, "")}M`;
  return `$${Math.round(n / 1000)}K`;
}

function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();
  useEffect(() => {
    if (!listings.length) return;
    const lats = listings.map((l) => l.lat);
    const lngs = listings.map((l) => l.lng);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [36, 36], maxZoom: 13 },
    );
  }, [listings, map]);
  return null;
}

export default function MapView({ listings }: { listings: Listing[] }) {
  // Feed rows without coordinates map to lat/lng 0 — never pin (or fit bounds to) Null Island.
  const located = useMemo(() => listings.filter((l) => l.lat && l.lng), [listings]);
  const pins = useMemo(
    () =>
      located.map((l) => ({
        listing: l,
        icon: divIcon({
          className: "",
          html: `<span style="display:inline-block;transform:translate(-50%,-100%);background:#101820;color:#E8B04B;font:600 11px/1 'Spline Sans Mono',monospace;padding:5px 7px;border-radius:2px;white-space:nowrap;box-shadow:0 2px 8px rgb(0 0 0/.35)">${shortPrice(l.price)}</span>`,
          iconSize: [0, 0],
        }),
      })),
    [located],
  );

  return (
    <div className="relative h-full min-h-96 w-full">
      {/* The live feed carries no coordinates — pins sit at zip-centroid (approximate). */}
      <p className="pointer-events-none absolute bottom-1 left-1 z-[500] bg-white/85 px-1.5 py-0.5 text-[10px] text-stone">
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
      <FitBounds listings={located} />
      {pins.map(({ listing: l, icon }) => (
        <Marker key={l.id} position={[l.lat, l.lng]} icon={icon}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{shortPrice(l.price)} · {l.beds} bd / {l.baths} ba</p>
              <p style={{ margin: "4px 0" }}>
                {l.address}, {l.city} {l.zip}
              </p>
              <p style={{ margin: "4px 0", fontSize: 11, color: "#6E7681" }}>Listed with {l.listOfficeName}</p>
              <Link href={`/listing/${l.id}`} style={{ color: "#2B6CB0", fontWeight: 700 }}>
                View listing →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
    </div>
  );
}
