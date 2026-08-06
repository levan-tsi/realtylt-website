"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import type { MapBounds, MapPin } from "@/lib/idx/types";
import { buildClusterIndex, clusterExpansionZoom, getClusterEntries } from "./clustering";
import {
  boundsOfPins,
  chipPrice,
  clusterBubbleHtml,
  clusterTier,
  createPinFetcher,
  MAP_FONT as FONT,
  popupNode,
  spreadPins,
  type MapViewProps,
} from "./map-shared";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map. `pins` seeds the first paint and frames the initial view (page/
 * filter/sort change auto-fits it, as before); once `filtersQuery` is set, ClusterLayer takes
 * over — it fetches its own pin set for the live viewport via /api/idx/pins and clusters it
 * with supercluster, Zillow-style: a dense borough shows a handful of count bubbles at low
 * zoom instead of thousands of unrenderable markers, and clicking a bubble zooms into it.
 * Individual (unclustered) pins still plot as the familiar black price chip (floored $875K /
 * $1.3M, live-style) with the shared photo-pager popup. Client-only — next/dynamic ssr:false. */

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
    };font:700 11px/1 ${FONT};padding:7px 9px;white-space:nowrap;border-radius:8px">${
      saved ? '<span style="color:#ef4444">♥</span> ' : ""
    }${chipPrice(price)}</span>`,
    iconSize: [0, 0],
  });

/** Fit the map to `initialBounds` (a chosen county's real extent) when given, else to the
 * pins' own bounds — whenever either changes (new page, filter, sort, or county). Deferred a
 * macrotask so the synchronous `moveend` from fitBounds(animate:false) can't run sibling
 * setState mid-commit. maxZoom caps a single-listing page from zooming to the street. */
function FitPins({ pins, initialBounds }: { pins: MapPin[]; initialBounds?: MapBounds | null }) {
  const map = useMap();
  useEffect(() => {
    const b = initialBounds ?? boundsOfPins(pins);
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
  }, [pins, initialBounds, map]);
  return null;
}

/** Mounts the SHARED vanilla-DOM popup mini-card (photo pager + View Listing) inside a
 * react-leaflet Popup, so both map engines show the identical thing. Built once per open —
 * the pager's own listeners live on the node. Easy to close three ways (owner's ask): the X on
 * the photo, Escape, or a click anywhere outside the popup — this component only EXISTS while
 * the popup is open, so its effect is exactly the open→close window to listen in. */
function PopupCard({ pin, onToggleSave }: { pin: MapPin; onToggleSave?: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useMap();
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const node = popupNode(pin, { onClose: () => map.closePopup(), onToggleSave });
    host.appendChild(node);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") map.closePopup();
    };
    // mousedown (not click) so an outside press closes before a DIFFERENT marker's own click
    // handler runs — same ordering LocationSuggest's outside-click-close relies on.
    const onOutside = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(".leaflet-popup")) return; // never self-close
      map.closePopup();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      host.removeChild(node);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
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

/** Cluster bubble icon — sized via the same tier used by the Google engine so the two look
 * identical. iconSize matches the tier's diameter (unlike the price chip, a cluster bubble's
 * anchor is its own centre, not a pin tip below it). */
const clusterIcon = (count: number) => {
  const { size } = clusterTier(count);
  return divIcon({
    className: "",
    html: clusterBubbleHtml(count),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

/** Viewport-fetched, clustered pin layer (Zillow-style). Fetches its own pin set for the live
 * map bounds via /api/idx/pins (debounced, race-safe — createPinFetcher) and reclusters on
 * every pan/zoom settle with supercluster. `seedPins` (the results page) render immediately;
 * once the first viewport fetch resolves, its pins take over — a filter change drops the old
 * viewport set at once so the map never shows the previous search under new chips. */
function ClusterLayer({
  seedPins,
  filtersQuery,
  favorites,
  selectedId,
  onSelect,
  onToggleSave,
}: {
  seedPins: MapPin[];
  filtersQuery: string;
  favorites?: string[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onToggleSave?: (id: string) => void;
}) {
  const map = useMap();
  const [fetchedPins, setFetchedPins] = useState<MapPin[] | null>(null);
  const [viewportTotal, setViewportTotal] = useState<number | null>(null);
  const fetcherRef = useRef<ReturnType<typeof createPinFetcher> | null>(null);
  // Bumped on every moveend/zoomend so the cluster recompute below (which reads live map
  // state, not React state) actually re-renders — Leaflet's bounds/zoom aren't props.
  const [, tick] = useReducer((n: number) => n + 1, 0);

  const requestViewport = () => {
    const b = map.getBounds();
    fetcherRef.current?.request({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  };

  // New filters (or first mount): drop any pins fetched under the OLD filters and start a
  // fresh fetcher + fetch for the current viewport.
  useEffect(() => {
    setFetchedPins(null);
    setViewportTotal(null);
    fetcherRef.current = createPinFetcher({
      filtersQuery,
      onData: (p, total) => {
        setFetchedPins(p);
        setViewportTotal(total);
      },
    });
    requestViewport();
    return () => fetcherRef.current?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersQuery, map]);

  useMapEvents({
    moveend() {
      requestViewport();
      tick();
    },
    zoomend() {
      tick();
    },
  });

  const favSet = useMemo(() => new Set(favorites ?? []), [favorites]);
  const activePins = useMemo(() => {
    const base = (fetchedPins ?? seedPins).filter((p) => p.lat && p.lng);
    return spreadPins(base).map((p) => ({ ...p, saved: favSet.has(p.id) || p.saved }));
  }, [fetchedPins, seedPins, favSet]);

  const index = useMemo(() => buildClusterIndex(activePins), [activePins]);
  const pinsById = useMemo(() => new Map(activePins.map((p) => [p.id, p])), [activePins]);

  const b = map.getBounds();
  const bounds: MapBounds = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
  const entries = getClusterEntries(index, pinsById, bounds, map.getZoom());

  return (
    <>
      {viewportTotal !== null && fetchedPins !== null && viewportTotal > fetchedPins.length && (
        <p className="pointer-events-none absolute bottom-2 right-2 z-[500] rounded-lg border border-line bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
          Showing {fetchedPins.length.toLocaleString()} of {viewportTotal.toLocaleString()} — zoom in for more
        </p>
      )}
      {entries.map((e) =>
        e.kind === "cluster" ? (
          <Marker
            key={`c-${e.id}`}
            position={[e.lat, e.lng]}
            icon={clusterIcon(e.count)}
            eventHandlers={{
              click: () => map.setView([e.lat, e.lng], clusterExpansionZoom(index, e.id), { animate: true }),
            }}
          />
        ) : (
          <Marker
            key={e.pin.id}
            position={[e.pin.lat, e.pin.lng]}
            icon={priceIcon(e.pin.price, e.pin.id === selectedId, !!e.pin.saved)}
            title={`${chipPrice(e.pin.price)} — ${e.pin.address}, ${e.pin.city}`}
            zIndexOffset={e.pin.id === selectedId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(e.pin.id) }}
          >
            <Popup minWidth={252}>
              <PopupCard pin={e.pin} onToggleSave={onToggleSave} />
            </Popup>
          </Marker>
        ),
      )}
    </>
  );
}

export default function MapView({ pins, selectedId, onSelect, onToggleSave, filtersQuery, favorites, initialBounds }: MapViewProps) {
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
        {/* The initial frame always fits the chosen county's real extent (or the results page's
            own bounds, for a free-text search) — clustering takes it from there without ever
            re-fitting on its own (that would fight a visitor's pan). */}
        <FitPins pins={located} initialBounds={initialBounds} />
        {filtersQuery ? (
          <ClusterLayer
            seedPins={located}
            filtersQuery={filtersQuery}
            favorites={favorites}
            selectedId={selectedId}
            onSelect={onSelect}
            onToggleSave={onToggleSave}
          />
        ) : (
          <PinLayer pins={located} selectedId={selectedId} onSelect={onSelect} onToggleSave={onToggleSave} />
        )}
      </MapContainer>
    </div>
  );
}
