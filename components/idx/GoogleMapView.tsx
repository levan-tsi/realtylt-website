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


export default function GoogleMapView({ pins, selectedId, onSelect, onToggleSave }: MapViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  /** The listing the visitor CLICKED. Owned by click and the popup's X only — hover never
   * writes it, which is what keeps a passing pointer from closing a chosen popup. */
  const pinnedRef = useRef<string | null>(null);
  /** Tears down the document-level pointer listener when the map unmounts. */
  const cleanupRef = useRef<(() => void) | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onToggleSaveRef = useRef(onToggleSave);
  onToggleSaveRef.current = onToggleSave;
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
        // disableAutoPan is REQUIRED, not cosmetic. Opening a popup used to recentre the map to
        // fit it; that fires `idle`, `idle` calls overlay.draw(), and draw() rebuilds every chip
        // from scratch — so the chip the pointer was over got destroyed mid-hover and its
        // `mouseleave` never fired, leaving the preview stuck open. It is also just better
        // behaviour: the map should not lurch out from under a passing pointer.
        const info = new google.maps.InfoWindow({ disableAutoPan: true });

        // Deferred close, shared by every chip and by the popup itself.
        let closeTimer: ReturnType<typeof setTimeout> | undefined;
        const cancelClose = () => {
          if (closeTimer) clearTimeout(closeTimer);
          closeTimer = undefined;
        };
        const scheduleClose = (ms = 180) => {
          cancelClose();
          closeTimer = setTimeout(() => {
            if (!pinnedRef.current) info.close(); // a pinned popup is never closed by the pointer
          }, ms);
        };
        // ONE AUTHORITATIVE RULE for dismissing a preview, instead of a mouseleave on each chip.
        // Per-chip listeners cannot be trusted here: overlay.draw() rebuilds every chip on each
        // map idle, and an element removed from the DOM fires no mouseleave at all, so a preview
        // gets orphaned open with the pointer nowhere near it. This asks the only question that
        // matters — is the pointer over a chip, or over the preview itself? — and it keeps
        // working no matter how many times the chips are rebuilt underneath it.
        // Deferred, so crossing the small gap between the chip and the popup does not dismiss it.
        const onDocMove = (e: MouseEvent) => {
          if (pinnedRef.current) return; // a deliberate choice outranks a passing pointer
          const el = e.target as Element | null;
          if (el?.closest?.(".rlt-price-chip") || el?.closest?.(".gm-style-iw")) {
            cancelClose();
            return;
          }
          scheduleClose();
        };
        document.addEventListener("mousemove", onDocMove, { passive: true });
        cleanupRef.current = () => document.removeEventListener("mousemove", onDocMove);

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
            // SOLID = you can still buy it. HOLLOW = already spoken for (Pending / Under
            // Contract). The owner could not tell them apart on the map, and 4,775 of the
            // 11,609 homes on it are Pending — nearly half the pins were promising something
            // they could not deliver. Deliberately NOT a new hue: the site runs monochrome with
            // one accent, and Zillow's yellow here would be the loudest thing on the page. Fill
            // versus outline is the same distinction and it survives being colour-blind.
            const spokenFor = p.status === "Pending" || p.status === "Under Contract";
            chip.style.cssText = `position:absolute;left:${pt.x}px;top:${pt.y}px;transform:translate(-50%,-100%);${
              active
                ? "--chip-bg:#1c729a;background:var(--chip-bg);color:#fff;box-shadow:0 0 0 2px #fff,0 3px 12px rgb(0 0 0/.45);z-index:1000"
                : p.saved
                  ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#000;box-shadow:0 0 0 1.5px #ef4444,0 3px 10px rgb(0 0 0/.35);z-index:500"
                  : spokenFor
                    ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#4a4a4a;box-shadow:0 0 0 1.5px #4a4a4a,0 2px 8px rgb(0 0 0/.22)"
                    : "--chip-bg:#000;background:var(--chip-bg);color:#fff;box-shadow:0 2px 8px rgb(0 0 0/.3)"
            };font:700 11px/1 ${MAP_FONT};padding:5px 8px;white-space:nowrap;border:0;cursor:pointer;border-radius:8px`;
            if (spokenFor) chip.setAttribute("aria-label", `${chipPrice(p.price)} — ${p.address} — ${p.status}`);
            if (p.saved) {
              const heart = document.createElement("span");
              heart.style.color = "#ef4444";
              heart.textContent = "♥ ";
              chip.appendChild(heart);
              chip.appendChild(document.createTextNode(chipPrice(p.price)));
            } else {
              chip.textContent = chipPrice(p.price);
            }
            // HOVER PREVIEWS, CLICK PINS (owner: "when you bring mouse to the price it should
            // show the pic and info like when you click it… it should still have click function
            // to keep it there").
            //
            // The trap this avoids is the one that broke the Top Areas caret: a handler must
            // never ask "is it open right now" when the pointer arriving is exactly what opened
            // it. So hover and pin are SEPARATE state — `pinnedRef` is owned by click alone, and
            // hover only ever acts when nothing is pinned. Leaving a chip therefore cannot close
            // a popup the visitor deliberately kept, and clicking a second chip re-pins cleanly.
            const openPopup = (pinned: boolean) => {
              cancelClose();
              const node = popupNode(p, {
                onClose: () => {
                  pinnedRef.current = null;
                  info.close();
                },
                onToggleSave: (id) => onToggleSaveRef.current?.(id),
              });
              // The popup must be part of its own hover target. Without this, moving the pointer
              // off the chip and ONTO the preview closes the thing you were reaching for, and
              // its heart and X are unreachable unless you click first.
              node.addEventListener("mouseenter", cancelClose);
              node.addEventListener("mouseleave", () => scheduleClose());
              info.setContent(node);
              // Lift the preview clear of the chip that opened it. Without this the popup lands
              // on top of its own chip, so "hover to peek, click to keep" cannot work — the
              // click hits the popup, and since the popup is a LINK to the listing it navigates
              // instead of pinning. 26px is the chip's height plus a hair, measured.
              info.setOptions({ pixelOffset: new google.maps.Size(0, -26) });
              info.setPosition(pos);
              info.open({ map });
              if (pinned) pinnedRef.current = p.id;
            };
            chip.addEventListener("mouseenter", () => {
              cancelClose();
              if (pinnedRef.current) return; // a deliberate choice outranks a passing pointer
              openPopup(false);
            });
            // Keyboard parity: the chips are real buttons, so tabbing to one previews it too.
            // Guarded to keyboard focus only — a mouse press also focuses, and re-opening the
            // popup mid-press was part of what was eating the click.
            chip.addEventListener("focus", (e) => {
              if (!(e.target as HTMLElement).matches(":focus-visible")) return;
              cancelClose();
              if (!pinnedRef.current) openPopup(false);
            });
            chip.addEventListener("blur", () => scheduleClose());
            // PIN ON THE PRESS, not on the click. A click event only fires when mousedown and
            // mouseup land on the SAME element, and overlay.draw() rebuilds every chip on each
            // map idle — so a redraw between press and release silently swallowed the click and
            // the popup was never pinned. Pressing is also the honest moment: that is when the
            // visitor chose this home.
            chip.addEventListener("pointerdown", () => {
              cancelClose();
              pinnedRef.current = p.id;
              openPopup(true);
              onSelectRef.current?.(p.id);
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
      cleanupRef.current?.();
      cleanupRef.current = null;
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
      {/* A distinction nobody can decode is decoration. The legend says what solid and hollow
          mean, in the same breath as the existing accuracy disclaimer. */}
      <div className="pointer-events-none absolute bottom-2 left-2 z-[5] flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-2.5 w-4 rounded-[3px] bg-black" />
          For sale
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-2.5 w-4 rounded-[3px] bg-white ring-[1.5px] ring-[#4a4a4a]" />
          Pending
        </span>
        <span>Locations approximate</span>
      </div>
      <div ref={divRef} className="h-full min-h-96 w-full" />
    </div>
  );
}
