"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import Link from "next/link";
import type { MapPin } from "@/lib/idx/types";
import { boundsOfPins, chipPrice, MAP_FONT as FONT, spreadPins, type MapViewProps } from "./map-shared";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map. PAGE-COUPLED: receives exactly the current page's listings as
 * slim pins and plots one black price chip per listing (floored $875K / $1.3M, live-style).
 * The frame auto-fits the page's pins on every page/filter/sort change; a chip click scrolls
 * to and highlights its card (onSelect). Same-zip listings are fanned out (spreadPins) so no
 * chip hides another. Client-only — import via next/dynamic ssr:false. */

const priceIcon = (price: number, active: boolean) =>
  divIcon({
    className: "",
    html: `<span class="rlt-price-chip" style="display:inline-block;transform:translate(-50%,-100%);${
      active
        ? "background:#1c729a;box-shadow:0 0 0 2px #fff,0 3px 12px rgb(0 0 0/.45);z-index:1000"
        : "background:#000;box-shadow:0 2px 8px rgb(0 0 0/.3)"
    };color:#fff;font:700 11px/1 ${FONT};padding:5px 8px;white-space:nowrap;border-radius:3px">${chipPrice(price)}</span>`,
    iconSize: [0, 0],
  });

/** Fit the map to the current page's pins whenever they change (new page, filter, or sort).
 * Deferred a macrotask so the synchronous `moveend` from fitBounds(animate:false) can't run
 * sibling setState mid-commit. maxZoom caps a single-listing page from zooming to the street. */
function FitPins({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  useEffect(() => {
    const b = boundsOfPins(pins);
    if (!b) return;
    const id = setTimeout(() => {
      map.fitBounds(
        [
          [b.south, b.west],
          [b.north, b.east],
        ],
        { padding: [40, 40], maxZoom: 14, animate: false },
      );
    }, 0);
    return () => clearTimeout(id);
  }, [pins, map]);
  return null;
}

function PinLayer({ pins, selectedId, onSelect }: MapViewProps) {
  return (
    <>
      {pins.map((p) => {
        const active = p.id === selectedId;
        const bb = [p.beds > 0 && `${p.beds} bd`, p.baths > 0 && `${p.baths} ba`]
          .filter(Boolean)
          .join(" / ");
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={priceIcon(p.price, active)}
            title={`${chipPrice(p.price)} — ${p.address}, ${p.city}`}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {chipPrice(p.price)}
                  {bb ? ` · ${bb}` : ""}
                </p>
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

export default function MapView({ pins, selectedId, onSelect }: MapViewProps) {
  // Rows without coordinates come through as lat/lng 0 — never pin (or fit) Null Island.
  // Same-zip listings are fanned out so every chip stays clickable.
  const located = useMemo(() => spreadPins(pins.filter((p) => p.lat && p.lng)), [pins]);

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
        <FitPins pins={located} />
        <PinLayer pins={located} selectedId={selectedId} onSelect={onSelect} />
      </MapContainer>
    </div>
  );
}
