"use client";

import { useEffect, useRef } from "react";
import { boundsOfPins, chipPrice, MAP_FONT, popupNode, spreadPins, type MapViewProps } from "./map-shared";
import { loadMaps } from "@/lib/idx/maps-loader";

/** Official Google Maps results map (live-site parity — Brivity renders Google Maps).
 * Loads only when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; SearchClient falls back to the
 * Leaflet/OSM view without it. PAGE-COUPLED: plots exactly the current page's listings as
 * black price chips (floored, live-style), auto-fits them on page/filter/sort change, and a
 * chip click scrolls to + highlights its card via onSelect. Same-zip listings are fanned out
 * (spreadPins). Rendered as an OverlayView so no mapId/AdvancedMarker requirement. No new deps. */

declare global {
  // Minimal surface of the Maps JS API we touch — avoids @types/google.maps as a dep.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var google: any;
}


export default function GoogleMapView({ pins, selectedId, onSelect }: MapViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayRef = useRef<any>(null);

  // Fit the map to the current page's pins. Degenerate/tiny boxes (a single listing, or many
  // sharing a zip) get a zoom clamp so the map doesn't slam to street level.
  const fitToPins = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map: any,
    located: MapViewProps["pins"],
  ) => {
    const b = boundsOfPins(located);
    if (!b) return;
    map.fitBounds(
      new google.maps.LatLngBounds({ lat: b.south, lng: b.west }, { lat: b.north, lng: b.east }),
      48,
    );
    if (b.north - b.south < 0.02 && b.east - b.west < 0.02) {
      google.maps.event.addListenerOnce(map, "idle", () => {
        if ((map.getZoom() ?? 0) > 14) map.setZoom(14);
      });
    }
  };

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const el = divRef.current;
    if (!key || !el) return;
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let overlay: any;

    loadMaps(key)
      .then(() => {
        if (disposed) return;
        const map = new google.maps.Map(el, {
          center: { lat: 41.5, lng: -74.0 },
          zoom: 9,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          // Owner: no ctrl-to-zoom overlay — wheel zooms directly on hover.
          gestureHandling: "greedy",
        });
        mapRef.current = map;
        const info = new google.maps.InfoWindow();

        const located = () => spreadPins(pinsRef.current.filter((p) => p.lat && p.lng));

        fitToPins(map, located());

        // HTML chip overlay — one floored price chip per listing on the page.
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
          const sel = selectedRef.current;
          for (const p of located()) {
            const pos = new google.maps.LatLng(p.lat, p.lng);
            const pt = proj.fromLatLngToDivPixel(pos);
            const active = p.id === sel;
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "rlt-price-chip";
            chip.setAttribute("aria-label", `${chipPrice(p.price)} — ${p.address}`);
            // Hearted listings read differently at a glance — white chip, red heart, same
            // red as the card's FavoriteButton (owner's ask: saved homes visible ON the map).
            chip.style.cssText = `position:absolute;left:${pt.x}px;top:${pt.y}px;transform:translate(-50%,-100%);${
              active
                ? "--chip-bg:#1c729a;background:var(--chip-bg);color:#fff;box-shadow:0 0 0 2px #fff,0 3px 12px rgb(0 0 0/.45);z-index:1000"
                : p.saved
                  ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#000;box-shadow:0 0 0 1.5px #ef4444,0 3px 10px rgb(0 0 0/.35);z-index:500"
                  : "--chip-bg:#000;background:var(--chip-bg);color:#fff;box-shadow:0 2px 8px rgb(0 0 0/.3)"
            };font:700 11px/1 ${MAP_FONT};padding:5px 8px;white-space:nowrap;border:0;cursor:pointer;border-radius:8px`;
            if (p.saved) {
              const heart = document.createElement("span");
              heart.style.color = "#ef4444";
              heart.textContent = "♥ ";
              chip.appendChild(heart);
              chip.appendChild(document.createTextNode(chipPrice(p.price)));
            } else {
              chip.textContent = chipPrice(p.price);
            }
            chip.addEventListener("click", () => {
              onSelectRef.current?.(p.id);
              info.setContent(popupNode(p));
              info.setPosition(pos);
              info.open({ map });
            });
            container.appendChild(chip);
          }
        };
        overlay.setMap(map);
        overlayRef.current = overlay;
        // Redraw chips on every settle (pan/zoom) so their pixel positions stay correct.
        map.addListener("idle", () => overlay.draw());
      })
      .catch((e: unknown) => console.error("[maps]", e));

    return () => {
      disposed = true;
      overlay?.setMap(null);
      mapRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  // New page/filter/sort: refit the frame to the new pins and redraw the chips (an idle
  // won't fire on its own without a user move).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof google === "undefined") return;
    fitToPins(map, spreadPins(pins.filter((p) => p.lat && p.lng)));
    overlayRef.current?.draw?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins]);

  // A card hover/focus highlights the matching chip — redraw with the new active id.
  useEffect(() => {
    overlayRef.current?.draw?.();
  }, [selectedId]);

  return (
    <div className="relative h-full min-h-96 w-full">
      <p className="pointer-events-none absolute bottom-2 left-2 z-[5] rounded-lg border border-[#dddddd] bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
        Locations approximate
      </p>
      <div ref={divRef} className="h-full min-h-96 w-full" />
    </div>
  );
}
