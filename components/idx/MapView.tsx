"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import type { MapBounds, MapPin } from "@/lib/idx/types";
import { planMarkers } from "./pin-thinning";
import {
  boundsOfPins,
  chipPrice,
  chipStateStyles,
  createPinFetcher,
  dotHtml,
  MAP_FONT as FONT,
  pinResultSet,
  popupNode,
  spreadPins,
  type MapViewProps,
} from "./map-shared";
import { saveResultSet } from "@/lib/idx/result-set";
import "leaflet/dist/leaflet.css";

/** Leaflet/OSM results map. `pins` seeds the first paint and frames the initial view (page/
 * filter/sort change auto-fits it, as before); once `filtersQuery` is set, ThinnedLayer takes
 * over — it fetches its own pin set for the live viewport via /api/idx/pins and renders it
 * Zillow-style (./pin-thinning.ts): a price pill for every home the screen has room to label,
 * a small dot for the rest, no count circles. Pills are the familiar black price chip (floored
 * $875K / $1.3M, live-style) with the shared photo-pager popup. Client-only — next/dynamic
 * ssr:false. */

// Hearted listings read differently at a glance: white chip, ink text, the same red heart
// the card's FavoriteButton fills (owner's ask — saved homes visible ON the map).
// Two boxes since round 24b (transparent hit shell + .rlt-chip-face hugging the price) —
// geometry in globals.css, state ink in chipStateStyles, shared with the Google engine.
const priceIcon = (price: number, active: boolean, saved: boolean) => {
  const st = chipStateStyles({ active, saved, spokenFor: false });
  return divIcon({
    className: "",
    html: `<span class="rlt-price-chip" style="display:inline-block;transform:translate(-50%,-100%);${st.outer}"><span class="rlt-chip-face" style="${st.face};font:700 11px/1 ${FONT}">${
      saved ? '<span style="color:#ef4444">♥</span> ' : ""
    }${chipPrice(price)}</span></span>`,
    iconSize: [0, 0],
  });
};

/** Fit the map to `initialBounds` (a chosen county's real extent) when given, else to the
 * pins' own bounds — on mount and then ONLY when `fitKey` (the results' place) changes, the
 * same refit gate the Google engine runs: a grid refetch or filter tweak never yanks the
 * visitor's viewport, and the viewport-scoped grid cannot loop through a refit. Deferred a
 * macrotask so the synchronous `moveend` from fitBounds(animate:false) can't run sibling
 * setState mid-commit. maxZoom caps a single-listing page from zooming to the street. */
function FitPins({ pins, initialBounds, fitKey }: { pins: MapPin[]; initialBounds?: MapBounds | null; fitKey?: string }) {
  const map = useMap();
  const lastFitKeyRef = useRef<string | undefined>(undefined);
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current && fitKey === lastFitKeyRef.current) return;
    fitted.current = true;
    lastFitKeyRef.current = fitKey;
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
  }, [pins, initialBounds, fitKey, map]);
  return null;
}

/** Mounts the SHARED vanilla-DOM popup mini-card (photo pager + View Listing) inside a
 * react-leaflet Popup, so both map engines show the identical thing. Built once per open —
 * the pager's own listeners live on the node. Easy to close three ways (owner's ask): the X on
 * the photo, Escape, or a click anywhere outside the popup — this component only EXISTS while
 * the popup is open, so its effect is exactly the open→close window to listen in. */
function PopupCard({ pin, onToggleSave, onNavigate }: { pin: MapPin; onToggleSave?: (id: string) => void; onNavigate?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useMap();
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const node = popupNode(pin, { onClose: () => map.closePopup(), onToggleSave, onNavigate });
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
  }, [pin, map, onToggleSave, onNavigate]);
  return <div ref={ref} />;
}

/** The set the listing page will walk if this popup's View Listing is followed — the pins the
 * layer is drawing from, in fetch order (see pinResultSet). Both layers pass their own list. */
const writePinSet = (pins: readonly MapPin[]) => {
  const set = pinResultSet(pins, window.location.pathname + window.location.search);
  if (set) saveResultSet(set);
};

function PinLayer({ pins, selectedId, onSelect, onToggleSave }: MapViewProps) {
  const onNavigate = useCallback(() => writePinSet(pins), [pins]);
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
              <PopupCard pin={p} onToggleSave={onToggleSave} onNavigate={onNavigate} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

/** Dot icon — the same home wearing less ink (shared markup via dotHtml, so the two engines
 * look identical). iconSize [0,0]: the span centres itself on the point with its own inline
 * translate, the same pattern as the price chip above. */
const dotIcon = (label: string, saved: boolean, spokenFor: boolean) =>
  divIcon({
    className: "",
    html: dotHtml({ label, saved, spokenFor }),
    iconSize: [0, 0],
  });

/** Viewport-fetched, thinned pin layer (Zillow-style). Fetches its own pin set for the live
 * map bounds via /api/idx/pins (debounced, race-safe — createPinFetcher) and re-plans on
 * every pan/zoom settle with planMarkers. `seedPins` (the results page) render immediately;
 * once the first viewport fetch resolves, its pins take over — a filter change drops the old
 * viewport set at once so the map never shows the previous search under new chips. */
function ThinnedLayer({
  seedPins,
  filtersQuery,
  favorites,
  selectedId,
  onSelect,
  onToggleSave,
  onBoundsChange,
}: {
  seedPins: MapPin[];
  filtersQuery: string;
  favorites?: string[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onToggleSave?: (id: string) => void;
  onBoundsChange?: (b: MapBounds) => void;
}) {
  const map = useMap();
  const [fetchedPins, setFetchedPins] = useState<MapPin[] | null>(null);
  const [viewportTotal, setViewportTotal] = useState<number | null>(null);
  const fetcherRef = useRef<ReturnType<typeof createPinFetcher> | null>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;
  // Bumped on every moveend/zoomend so the marker re-plan below (which reads live map
  // state, not React state) actually re-renders — Leaflet's bounds/zoom aren't props.
  const [, tick] = useReducer((n: number) => n + 1, 0);

  const requestViewport = () => {
    const b = map.getBounds();
    const box = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
    fetcherRef.current?.request(box);
    onBoundsChangeRef.current?.(box);
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
  // The walk covers the whole viewport fetch (up to PIN_CAP homes), not just the drawn plan —
  // the plan is re-thinned every zoom tick, the fetch is the stable "what this map is showing".
  const onNavigate = useCallback(() => writePinSet(fetchedPins ?? seedPins), [fetchedPins, seedPins]);

  // Screen-space plan for the live viewport — container points share one pixel space with
  // the container box, so the planner's cull + collision math needs no conversion.
  const size = map.getSize();
  const plan = planMarkers({
    pins: activePins,
    project: (lat, lng) => map.latLngToContainerPoint([lat, lng]),
    viewport: { left: 0, top: 0, right: size.x, bottom: size.y },
    selectedId,
  });

  return (
    <>
      {viewportTotal !== null && fetchedPins !== null && viewportTotal > plan.length && (
        // bottom-12 on phones: side by side with the legend the two badges overlap at 390px
        // (same collision fixed on the Google engine — keep the pair in step).
        <p className="pointer-events-none absolute bottom-12 right-2 z-[500] rounded-lg border border-line bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone sm:bottom-2">
          {plan.length.toLocaleString()} of {viewportTotal.toLocaleString()} homes shown. Zoom in for more
        </p>
      )}
      {plan.map((m) =>
        m.kind === "dot" ? (
          <Marker
            key={m.pin.id}
            position={[m.pin.lat, m.pin.lng]}
            icon={dotIcon(`${m.label} — ${m.pin.address}, ${m.pin.city}`, !!m.pin.saved, m.pin.status === "Pending" || m.pin.status === "Under Contract")}
            title={`${m.label} — ${m.pin.address}, ${m.pin.city}`}
            eventHandlers={{ click: () => onSelect?.(m.pin.id) }}
          >
            <Popup minWidth={252}>
              <PopupCard pin={m.pin} onToggleSave={onToggleSave} onNavigate={onNavigate} />
            </Popup>
          </Marker>
        ) : (
          <Marker
            key={m.pin.id}
            position={[m.pin.lat, m.pin.lng]}
            icon={priceIcon(m.pin.price, m.pin.id === selectedId, !!m.pin.saved)}
            title={`${m.label} — ${m.pin.address}, ${m.pin.city}`}
            zIndexOffset={m.pin.id === selectedId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect?.(m.pin.id) }}
          >
            <Popup minWidth={252}>
              <PopupCard pin={m.pin} onToggleSave={onToggleSave} onNavigate={onNavigate} />
            </Popup>
          </Marker>
        ),
      )}
    </>
  );
}

export default function MapView({ pins, selectedId, onSelect, onToggleSave, filtersQuery, favorites, initialBounds, fitKey, onBoundsChange }: MapViewProps) {
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
        <FitPins pins={located} initialBounds={initialBounds} fitKey={fitKey} />
        {filtersQuery ? (
          <ThinnedLayer
            seedPins={located}
            filtersQuery={filtersQuery}
            favorites={favorites}
            selectedId={selectedId}
            onSelect={onSelect}
            onToggleSave={onToggleSave}
            onBoundsChange={onBoundsChange}
          />
        ) : (
          <PinLayer pins={located} selectedId={selectedId} onSelect={onSelect} onToggleSave={onToggleSave} />
        )}
      </MapContainer>
    </div>
  );
}
