"use client";

import { useEffect, useRef } from "react";
import { clusterize, MAP_FONT, popupHtml, shortPrice, type MapViewProps } from "./map-shared";

/** Official Google Maps results map (live-site parity — Brivity renders Google Maps).
 * Loads only when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; SearchClient falls back to the
 * Leaflet/OSM view without it. Same clustering, chips, and popups as the fallback —
 * rendered as an OverlayView so no mapId/AdvancedMarker requirement. No new deps. */

declare global {
  // Minimal surface of the Maps JS API we touch — avoids @types/google.maps as a dep.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var google: any;
}

let loader: Promise<void> | null = null;
function loadMaps(key: string): Promise<void> {
  if (typeof google !== "undefined" && google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__rltMapsReady`;
    s.async = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__rltMapsReady = () => resolve();
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}

export default function GoogleMapView({ pins, fitBounds, onBoundsChange }: MapViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const onBoundsRef = useRef(onBoundsChange);
  onBoundsRef.current = onBoundsChange;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayRef = useRef<any>(null);
  // Last frame we fit to — a new one (county chip) refits; pin updates never do.
  const fitRef = useRef(fitBounds);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const el = divRef.current;
    if (!key || !el) return;
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let overlay: any;

    loadMaps(key).then(() => {
      if (disposed) return;
      const map = new google.maps.Map(el, {
        center: { lat: 41.5, lng: -74.0 },
        zoom: 9,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
        gestureHandling: "cooperative",
      });
      mapRef.current = map;
      const info = new google.maps.InfoWindow();

      const located = () => pinsRef.current.filter((p) => p.lat && p.lng);

      // Frame the county/region box. Emit that box straight away so pins load immediately
      // instead of waiting only for `idle` (a degraded map may never fire it); `idle` then
      // refines to the true padded viewport on every settle.
      const frame = (b: MapViewProps["fitBounds"]) => {
        map.fitBounds(
          new google.maps.LatLngBounds({ lat: b.south, lng: b.west }, { lat: b.north, lng: b.east }),
          24,
        );
        onBoundsRef.current({ north: b.north, south: b.south, east: b.east, west: b.west });
      };
      frame(fitRef.current);

      // HTML chip overlay — same visuals as the Leaflet view.
      overlay = new google.maps.OverlayView();
      overlay.onAdd = function () {
        this.container = document.createElement("div");
        this.getPanes().overlayMouseTarget.appendChild(this.container);
      };
      overlay.onRemove = function () {
        this.container?.remove();
      };
      overlay.draw = function () {
        const container: HTMLDivElement = this.container;
        if (!container) return;
        container.innerHTML = "";
        const proj = this.getProjection();
        if (!proj) return;
        const zoom = map.getZoom() ?? 9;
        const mapBounds = map.getBounds();
        const { clusters, singles } = clusterize(located(), zoom);

        for (const c of clusters) {
          const d = c.count >= 100 ? 46 : c.count >= 10 ? 40 : 34;
          const pt = proj.fromLatLngToDivPixel(new google.maps.LatLng(c.lat, c.lng));
          const chip = document.createElement("button");
          chip.type = "button";
          chip.setAttribute("aria-label", `${c.count} listings — zoom in`);
          chip.style.cssText = `position:absolute;left:${pt.x}px;top:${pt.y}px;transform:translate(-50%,-50%);display:grid;place-items:center;width:${d}px;height:${d}px;border-radius:9999px;background:#000;color:#fff;font:700 12px/1 ${MAP_FONT};border:2px solid rgb(255 255 255/.85);box-shadow:0 2px 10px rgb(0 0 0/.35);cursor:pointer`;
          chip.textContent = String(c.count);
          chip.addEventListener("click", () => {
            const b = new google.maps.LatLngBounds();
            for (const m of c.members) b.extend({ lat: m.lat, lng: m.lng });
            map.fitBounds(b, 48);
          });
          container.appendChild(chip);
        }

        for (const p of singles) {
          const pos = new google.maps.LatLng(p.lat, p.lng);
          if (mapBounds && !mapBounds.contains(pos)) continue;
          const pt = proj.fromLatLngToDivPixel(pos);
          const chip = document.createElement("button");
          chip.type = "button";
          chip.setAttribute("aria-label", `${shortPrice(p.price)} — ${p.address}`);
          chip.style.cssText = `position:absolute;left:${pt.x}px;top:${pt.y}px;transform:translate(-50%,-100%);background:#000;color:#fff;font:700 11px/1 ${MAP_FONT};padding:5px 8px;white-space:nowrap;box-shadow:0 2px 8px rgb(0 0 0/.3);border:0;cursor:pointer`;
          chip.textContent = shortPrice(p.price);
          chip.addEventListener("click", () => {
            info.setContent(popupHtml(p));
            info.setPosition(pos);
            info.open({ map });
          });
          container.appendChild(chip);
        }
      };
      overlay.setMap(map);
      overlayRef.current = overlay;
      // On every settle: report the padded viewport so pins load for what's in view (emit
      // FIRST so a draw error can never suppress the fetch), then redraw chips. A too-tight
      // or empty box simply returns nothing — fast and cheap.
      map.addListener("idle", () => {
        const b = map.getBounds();
        if (b) {
          const ne = b.getNorthEast();
          const sw = b.getSouthWest();
          onBoundsRef.current({ north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng() });
        }
        overlay.draw();
      });
    }).catch((e: unknown) => console.error("[maps]", e));

    return () => {
      disposed = true;
      overlay?.setMap(null);
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  // New pins arrive AFTER the map has settled (the fetch is triggered by the last move),
  // so redraw the chip overlay explicitly — an idle won't fire again until the next move.
  useEffect(() => {
    overlayRef.current?.draw?.();
  }, [pins]);

  // Refit only when the county frame changes (a chip) — never on pin updates, so panning
  // is never fought. Emit the new frame straight away (don't depend only on idle); idle
  // refines to the true viewport after the move settles.
  useEffect(() => {
    if (fitRef.current === fitBounds) return;
    fitRef.current = fitBounds;
    const map = mapRef.current;
    if (!map || typeof google === "undefined") return;
    map.fitBounds(
      new google.maps.LatLngBounds(
        { lat: fitBounds.south, lng: fitBounds.west },
        { lat: fitBounds.north, lng: fitBounds.east },
      ),
      24,
    );
    onBoundsRef.current({ north: fitBounds.north, south: fitBounds.south, east: fitBounds.east, west: fitBounds.west });
  }, [fitBounds]);

  return (
    <div className="relative h-full min-h-96 w-full">
      <p className="pointer-events-none absolute bottom-2 left-2 z-[5] border border-[#dddddd] bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
        Locations approximate
      </p>
      <div ref={divRef} className="h-full min-h-96 w-full" />
    </div>
  );
}
