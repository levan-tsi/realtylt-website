"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import type { MapPin } from "@/lib/idx/types";
import { boundsOfPins, chipPrice, MAP_FONT as FONT, popupNode, spreadPins, type MapViewProps } from "./map-shared";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map. PAGE-COUPLED: receives exactly the current page's listings as
 * slim pins and plots one black price chip per listing (floored $875K / $1.3M, live-style).
 * The frame auto-fits the page's pins on every page/filter/sort change; a chip click scrolls
 * to and highlights its card (onSelect). Same-zip listings are fanned out (spreadPins) so no
 * chip hides another. Client-only — import via next/dynamic ssr:false. */

// Hearted listings read differently at a glance: white chip, ink text, the same red heart
// the card's FavoriteButton fills (owner's ask — saved homes visible ON the map).
const priceIcon = (price: number, active: boolean, saved: boolean) =>
  divIcon({
    className: "",
    html: `<span class="rlt-price-chip" style="display:inline-block;transform:translate(-50%,-100%);${
      active
        ? "--chip-bg:#1c729a;background:var(--chip-bg);color:#fff;box-shadow:0 0 0 2px #fff,0 3px 12px rgb(0 0 0/.45);z-index:1000"
        : saved
          ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#000;box-shadow:0 0 0 1.5px #ef4444,0 3px 10px rgb(0 0 0/.35);z-index:500"
          : "--chip-bg:#000;background:var(--chip-bg);color:#fff;box-shadow:0 2px 8px rgb(0 0 0/.3)"
    };font:700 11px/1 ${FONT};padding:5px 8px;white-space:nowrap;border-radius:8px">${
      saved ? '<span style="color:#ef4444">♥</span> ' : ""
    }${chipPrice(price)}</span>`,
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

/** Mounts the SHARED vanilla-DOM popup mini-card (photo pager + View Listing) inside a
 * react-leaflet Popup, so both map engines show the identical thing. Built once per open —
 * the pager's own listeners live on the node. */
function PopupCard({ pin, onToggleSave }: { pin: MapPin; onToggleSave?: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useMap();
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const node = popupNode(pin, { onClose: () => map.closePopup(), onToggleSave });
    host.appendChild(node);
    return () => {
      host.removeChild(node);
    };
  }, [pin, map, onToggleSave]);
  return <div ref={ref} />;
}

function PinLayer({ pins, selectedId, onSelect, onToggleSave }: MapViewProps) {
  return (
    <>
      {pins.map((p) => {
        const active = p.id === selectedId;
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={priceIcon(p.price, active, !!p.saved)}
            title={`${chipPrice(p.price)} — ${p.address}, ${p.city}`}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
          >
            <Popup minWidth={252}>
              <PopupCard pin={p} onToggleSave={onToggleSave} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function MapView({ pins, selectedId, onSelect, onToggleSave }: MapViewProps) {
  // Rows without coordinates come through as lat/lng 0 — never pin (or fit) Null Island.
  // Same-zip listings are fanned out so every chip stays clickable.
  const located = useMemo(() => spreadPins(pins.filter((p) => p.lat && p.lng)), [pins]);

  return (
    <div className="relative h-full min-h-96 w-full">
      {/* The live feed carries no coordinates — pins sit at zip-centroid (approximate). */}
      <p className="pointer-events-none absolute bottom-2 left-2 z-[500] rounded-lg border border-line bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
        Locations approximate
      </p>
      <MapContainer
        center={[41.5, -74.0]}
        zoom={9}
        // Owner: no ctrl-to-zoom nagging — the wheel zooms directly when the cursor is on
        // the map.
        scrollWheelZoom
        className="h-full min-h-96 w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitPins pins={located} />
        <PinLayer pins={located} selectedId={selectedId} onSelect={onSelect} onToggleSave={onToggleSave} />
      </MapContainer>
    </div>
  );
}
