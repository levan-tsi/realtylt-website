"use client";

import { useEffect, useRef, useState } from "react";
import {
  boundsOfPins,
  buildClusterBubble,
  chipPrice,
  createPinFetcher,
  MAP_FONT,
  popupNode,
  popupPlacement,
  spreadPins,
  type MapViewProps,
} from "./map-shared";
import { buildClusterIndex, clusterExpansionZoom, getClusterEntries, type ClusterIndex } from "./clustering";
import { loadMaps } from "@/lib/idx/maps-loader";
import type { MapBounds, MapPin } from "@/lib/idx/types";

/** Official Google Maps results map (live-site parity — Brivity renders Google Maps).
 * Loads only when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; SearchClient falls back to the
 * Leaflet/OSM view without it. `pins` seeds the first paint and frames the initial view (auto-
 * fit on page/filter/sort change, as before). Once `filtersQuery` is set, the map fetches its
 * own pin set for the live viewport via /api/idx/pins (debounced, race-safe) and clusters it
 * with supercluster — Zillow-style: a dense borough shows a handful of count bubbles at low
 * zoom instead of thousands of unrenderable chips, and clicking a bubble zooms into it.
 * Rendered as an OverlayView so no mapId/AdvancedMarker requirement. */

declare global {
  // Minimal surface of the Maps JS API we touch — avoids @types/google.maps as a dep.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var google: any;
}

/** google.maps.LatLngBounds has its OWN accessors — getNorthEast()/getSouthWest(), each a
 * LatLng with lat()/lng() methods — NOT Leaflet's getNorth/getSouth/getEast/getWest. Module
 * scope so both the mount effect's viewport fetch and the filtersQuery-change effect share one
 * conversion. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toBounds(b: any): MapBounds | null {
  if (!b) return null;
  const ne = b.getNorthEast();
  const sw = b.getSouthWest();
  return { north: ne.lat(), east: ne.lng(), south: sw.lat(), west: sw.lng() };
}

export default function GoogleMapView({ pins, selectedId, onSelect, onToggleSave, filtersQuery, favorites, initialBounds }: MapViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const initialBoundsRef = useRef(initialBounds);
  initialBoundsRef.current = initialBounds;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;
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

  // Viewport-fetched pins (Zillow-style clustering source) — null until the first fetch for
  // the live bounds resolves, so the overlay falls back to `pins` (the results page) until then.
  const fetchedPinsRef = useRef<MapPin[] | null>(null);
  const [viewportTotal, setViewportTotal] = useState<number | null>(null);
  const [fetchedCount, setFetchedCount] = useState<number | null>(null);
  const fetcherRef = useRef<ReturnType<typeof createPinFetcher> | null>(null);
  // Cluster index, cached by the RAW pin-array reference it was built from (draw() runs on
  // every idle AND every selectedId change — rebuilding a supercluster index over thousands of
  // points on a mere card hover would be wasted CPU the visitor would feel as jank).
  const indexCacheRef = useRef<{ source: MapPin[]; index: ClusterIndex; byId: Map<string, MapPin> } | null>(null);

  const getIndex = (source: MapPin[]) => {
    if (indexCacheRef.current?.source !== source) {
      indexCacheRef.current = { source, index: buildClusterIndex(source), byId: new Map(source.map((p) => [p.id, p])) };
    }
    return indexCacheRef.current;
  };

  // Fit the map to `initialBounds` (a chosen county's real extent) when given, else to the
  // seed pins' own bounds. Degenerate/tiny boxes (a single listing, or many sharing a zip) get
  // a zoom clamp so the map doesn't slam to street level.
  const fitToPins = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map: any,
    located: MapViewProps["pins"],
    boundsOverride?: MapBounds | null,
  ) => {
    const b = boundsOverride ?? boundsOfPins(located);
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
        // behaviour: the map should not lurch out from under a passing pointer. Because this
        // disables Google's own keep-in-view behaviour, the popup can otherwise render partly
        // off the map's own box — popupPlacement (below) is what keeps it on screen instead.
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

        // Easy to close three ways (owner's ask): the X on the photo, Escape, or a click
        // anywhere outside the popup — including a PINNED one, which onDocMove above
        // deliberately leaves alone (a passing pointer must never outrank a deliberate choice,
        // but a deliberate Escape or outside click is exactly that).
        const onDocKey = (e: KeyboardEvent) => {
          if (e.key !== "Escape") return;
          pinnedRef.current = null;
          info.close();
          // Closing can hand focus back to the chip that opened it, and the chip's OWN focus
          // handler below treats a focus-visible refocus as "preview me" — reopening the very
          // popup Escape just closed (observed live: Escape appeared to do nothing). Blurring
          // whatever now has focus stops that refocus from ever firing.
          (document.activeElement as HTMLElement | null)?.blur?.();
        };
        // mousedown (not click) so it closes before a DIFFERENT chip's own pointerdown re-pins —
        // the same ordering the chips' own PIN ON THE PRESS logic below relies on.
        const onDocDown = (e: MouseEvent) => {
          const el = e.target as Element | null;
          if (el?.closest?.(".rlt-price-chip") || el?.closest?.(".gm-style-iw") || el?.closest?.(".rlt-cluster-bubble")) return;
          pinnedRef.current = null;
          info.close();
        };
        // keydown on WINDOW, capture phase — confirmed live that even a document-level capture
        // listener never saw Escape: the Maps JS SDK registers its own document-level capture
        // listener during map init, BEFORE this one exists (this runs inside loadMaps().then()),
        // and same-node/same-phase listeners fire in registration order, so theirs won. window
        // sits topologically OUTSIDE document in the capture chain, so a window listener always
        // fires first regardless of registration order — the fix that actually holds.
        window.addEventListener("keydown", onDocKey, true);
        document.addEventListener("mousedown", onDocDown, true);
        cleanupRef.current = () => {
          document.removeEventListener("mousemove", onDocMove);
          window.removeEventListener("keydown", onDocKey, true);
          document.removeEventListener("mousedown", onDocDown, true);
        };

        // The pin set the overlay draws from: viewport-fetched pins once the first fetch has
        // landed, else the seed (results-page) pins — same fallback the Leaflet engine uses.
        const activeSource = () => (fetchedPinsRef.current ?? pinsRef.current).filter((p) => p.lat && p.lng);

        fitToPins(map, spreadPins(activeSource()), initialBoundsRef.current);

        // ── Viewport pin fetch (Zillow-style: cluster over what's actually on screen). Only
        // wired when the caller opted in with filtersQuery; otherwise the map stays exactly the
        // old page-coupled behaviour.
        const requestViewport = () => {
          if (!filtersQuery) return;
          const b = toBounds(map.getBounds());
          if (!b) return;
          fetcherRef.current?.request(b);
        };
        if (filtersQuery) {
          fetcherRef.current = createPinFetcher({
            filtersQuery,
            onData: (p, total) => {
              if (disposed) return;
              fetchedPinsRef.current = p;
              setFetchedCount(p.length);
              setViewportTotal(total);
              overlay?.draw?.();
            },
          });
          requestViewport();
        }

        // HTML chip/bubble overlay — one price chip per unclustered listing, one count bubble
        // per cluster, in the current viewport at the current zoom.
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
          const zoom = map.getZoom() ?? 9;
          const { index, byId } = getIndex(activeSource());
          const bounds =
            toBounds(map.getBounds()) ??
            boundsOfPins(activeSource()) ?? { north: 90, south: -90, east: 180, west: -180 };
          const entries = getClusterEntries(index, byId, bounds, zoom);
          // Same-centroid leaf pins still get fanned out so no chip hides another — spread only
          // the pins actually rendering individually this frame (clusters already absorbed the
          // rest), keyed back by id since spreadPins doesn't preserve input order.
          const spreadById = new Map(
            spreadPins(entries.filter((e) => e.kind === "pin").map((e) => e.pin)).map((p) => [p.id, p]),
          );

          for (const entry of entries) {
            if (entry.kind === "cluster") {
              const pos = new google.maps.LatLng(entry.lat, entry.lng);
              const pt = proj.fromLatLngToDivPixel(pos);
              const bubble = buildClusterBubble(entry.count, () => {
                map.panTo(pos);
                map.setZoom(clusterExpansionZoom(index, entry.id));
              });
              bubble.style.position = "absolute";
              bubble.style.left = `${pt.x}px`;
              bubble.style.top = `${pt.y}px`;
              bubble.style.transform = "translate(-50%,-50%)";
              container.appendChild(bubble);
              continue;
            }

            const p = spreadById.get(entry.pin.id) ?? entry.pin;
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
            // Contract). Deliberately NOT a new hue: the site runs monochrome with one accent.
            const spokenFor = p.status === "Pending" || p.status === "Under Contract";
            const saved = p.saved || (favoritesRef.current?.includes(p.id) ?? false);
            chip.style.cssText = `position:absolute;left:${pt.x}px;top:${pt.y}px;transform:translate(-50%,-100%);${
              active
                ? "--chip-bg:#1c729a;background:var(--chip-bg);color:#fff;box-shadow:0 0 0 2px #fff,0 3px 12px rgb(0 0 0/.45);z-index:1000"
                : saved
                  ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#000;box-shadow:0 0 0 1.5px #ef4444,0 3px 10px rgb(0 0 0/.35);z-index:500"
                  : spokenFor
                    ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#4a4a4a;box-shadow:0 0 0 1.5px #4a4a4a,0 2px 8px rgb(0 0 0/.22)"
                    : "--chip-bg:#000;background:var(--chip-bg);color:#fff;box-shadow:0 2px 8px rgb(0 0 0/.3)"
            };font:700 11px/1 ${MAP_FONT};padding:7px 9px;white-space:nowrap;border:0;cursor:pointer;border-radius:8px`;
            if (spokenFor) chip.setAttribute("aria-label", `${chipPrice(p.price)} — ${p.address} — ${p.status}`);
            if (saved) {
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
              // Stay within the viewport instead of always opening the same direction: measure
              // the chip's real position (same technique as LocationSuggest's dropdown) and
              // flip below its anchor when there isn't room above for it — the bug this fixes
              // is disableAutoPan (above) trading Google's own keep-in-view behaviour away.
              const chipRect = chip.getBoundingClientRect();
              const placement = popupPlacement(chipRect, window.innerHeight);
              // 26px clears the chip's own height; the popup opens flush against whichever
              // side was chosen instead of overlapping the chip that opened it.
              info.setOptions({ pixelOffset: new google.maps.Size(0, placement === "above" ? -26 : 26) });
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
        // Redraw chips on every settle (pan/zoom) so their pixel positions stay correct, and
        // (when opted in) fetch the new viewport's pins.
        map.addListener("idle", () => {
          overlay.draw();
          requestViewport();
        });
      })
      .catch((e: unknown) => console.error("[maps]", e));

    return () => {
      disposed = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      fetcherRef.current?.cancel();
      overlay?.setMap(null);
      mapRef.current = null;
      overlayRef.current = null;
    };
    // filtersQuery intentionally starts the effect over (a fresh fetcher, a fresh map) only via
    // the dedicated effect below — re-running this whole mount effect on every filter change
    // would tear down and rebuild the Google Map instance itself, which is far more than a new
    // search needs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A filter change: drop the old viewport's fetched pins (they belong to the previous search)
  // and start a fresh fetcher for the current bounds — mirrors the mount-time wiring above but
  // runs on every later change instead of only once.
  useEffect(() => {
    const map = mapRef.current;
    if (!filtersQuery || !map || typeof google === "undefined") return;
    fetchedPinsRef.current = null;
    setFetchedCount(null);
    setViewportTotal(null);
    fetcherRef.current?.cancel();
    fetcherRef.current = createPinFetcher({
      filtersQuery,
      onData: (p, total) => {
        fetchedPinsRef.current = p;
        setFetchedCount(p.length);
        setViewportTotal(total);
        overlayRef.current?.draw?.();
      },
    });
    const b = toBounds(map.getBounds());
    if (b) fetcherRef.current.request(b);
    overlayRef.current?.draw?.();
  }, [filtersQuery]);

  // New page/filter/sort: refit the frame — to the chosen county's real extent when given, else
  // the new seed pins' own bounds — and redraw (an idle won't fire on its own without a user
  // move). Viewport-fetched pins (once any exist) are left alone here — re-fitting on every
  // fetch would fight a visitor's own pan/zoom.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof google === "undefined") return;
    fitToPins(map, spreadPins(pins.filter((p) => p.lat && p.lng)), initialBounds);
    overlayRef.current?.draw?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, initialBounds]);

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
          {/* @design-allow the swatch is a MINIATURE of the map's price chip, which is 8px at
              ~26px tall — so at 10px tall it is 3px. On the UI scale it would read as a pill. */}
          <span aria-hidden className="inline-block h-2.5 w-4 rounded-[3px] bg-black" />
          For sale
        </span>
        <span className="flex items-center gap-1.5">
          {/* @design-allow miniature of the map chip, same reason as above. */}
          <span aria-hidden className="inline-block h-2.5 w-4 rounded-[3px] bg-white ring-[1.5px] ring-[#4a4a4a]" />
          Pending
        </span>
        <span>Locations approximate</span>
      </div>
      {viewportTotal !== null && fetchedCount !== null && viewportTotal > fetchedCount && (
        <p className="pointer-events-none absolute bottom-2 right-2 z-[5] rounded-lg border border-line bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone">
          Showing {fetchedCount.toLocaleString()} of {viewportTotal.toLocaleString()} — zoom in for more
        </p>
      )}
      <div ref={divRef} className="h-full min-h-96 w-full" />
    </div>
  );
}
