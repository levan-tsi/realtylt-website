"use client";

import { useEffect, useRef, useState } from "react";
import {
  boundsOfPins,
  createPinFetcher,
  dotStyleVars,
  MAP_FONT,
  pinResultSet,
  popupNode,
  popupPlacement,
  spreadPins,
  type MapViewProps,
} from "./map-shared";
import { saveResultSet } from "@/lib/idx/result-set";
import { planMarkers } from "./pin-thinning";
import { loadMaps } from "@/lib/idx/maps-loader";
import type { MapBounds, MapPin } from "@/lib/idx/types";

/** Official Google Maps results map (live-site parity — Brivity renders Google Maps).
 * Loads only when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; SearchClient falls back to the
 * Leaflet/OSM view without it. `pins` seeds the first paint and frames the initial view (auto-
 * fit on page/filter/sort change, as before). Once `filtersQuery` is set, the map fetches its
 * own pin set for the live viewport via /api/idx/pins (debounced, race-safe) and renders it
 * Zillow-style: price pills for every home the screen has room to label, small dots for the
 * rest (planMarkers — screen-space thinning; ./pin-thinning.ts carries the reasoning). Every
 * marker is a single clickable home; there are no count circles.
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

export default function GoogleMapView({ pins, selectedId, onSelect, onToggleSave, filtersQuery, favorites, initialBounds, fitKey, onBoundsChange }: MapViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const initialBoundsRef = useRef(initialBounds);
  initialBoundsRef.current = initialBounds;
  const fitKeyRef = useRef(fitKey);
  fitKeyRef.current = fitKey;
  /** The fitKey the map last fitted for — the refit gate's memory. */
  const lastFitKeyRef = useRef<string | undefined>(undefined);
  const onBoundsChangeRef = useRef(onBoundsChange);
  onBoundsChangeRef.current = onBoundsChange;
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
  // Markers actually DRAWN this frame (pills + dots after thinning) — what the "zoom in for
  // more" banner reports, because a visitor can count what is on screen.
  const [drawnCount, setDrawnCount] = useState<number | null>(null);
  const fetcherRef = useRef<ReturnType<typeof createPinFetcher> | null>(null);
  // Spread pins, cached by the RAW pin-array reference (draw() runs on every idle AND every
  // selectedId change — re-fanning 3,000 same-centroid stacks on a mere card hover would be
  // wasted CPU). Keyed on the raw array, not a filtered copy: a fresh .filter() result is a
  // new reference every call and would defeat the cache.
  const spreadCacheRef = useRef<{ source: MapPin[]; spread: MapPin[] } | null>(null);
  const getSpread = (source: MapPin[]) => {
    if (spreadCacheRef.current?.source !== source) {
      spreadCacheRef.current = { source, spread: spreadPins(source.filter((p) => p.lat && p.lng)) };
    }
    return spreadCacheRef.current.spread;
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

        // Whether the InfoWindow is showing right now — the deliberate-close listeners below
        // are page-wide (window keydown, document pointerdown) and must be inert while no
        // popup exists: without this, EVERY Escape press on /search blurred whatever control
        // the visitor was typing in.
        let popupOpen = false;
        // Which pin the open popup belongs to — the idempotence key. Re-rendering an InfoWindow
        // that is ALREADY showing this pin restarts Google's open pipeline, and mid-relayout the
        // window transiently hit-tests over the chip under a stationary pointer; Chromium then
        // fires synthetic boundary events, the chip "re-enters", and openPopup runs again —
        // an open/close flicker loop that left top-edge hover previews permanently invisible
        // (watched locally: five mouseenter firings in 80ms with the popup never settling).
        let shownForId: string | null = null;
        // Deferred close, shared by every chip and by the popup itself.
        let closeTimer: ReturnType<typeof setTimeout> | undefined;
        const cancelClose = () => {
          if (closeTimer) clearTimeout(closeTimer);
          closeTimer = undefined;
        };
        const scheduleClose = (ms = 180) => {
          cancelClose();
          closeTimer = setTimeout(() => {
            if (!pinnedRef.current) {
              popupOpen = false;
              shownForId = null;
              info.close(); // a pinned popup is never closed by the pointer
            }
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
          if (el?.closest?.(".rlt-price-chip") || el?.closest?.(".rlt-map-dot") || el?.closest?.(".gm-style-iw")) {
            cancelClose();
            return;
          }
          scheduleClose();
        };
        document.addEventListener("mousemove", onDocMove, { passive: true });

        // A deliberate close (Escape / click-outside) must WIN even if closing hands focus back
        // to the chip that opened it — its own focus handler (below) treats a focus-visible
        // refocus as "preview me" and would reopen the exact popup just closed. Verified live
        // this reopen race is real and timing-dependent (sometimes the refocus fires before the
        // next check, sometimes after), so blur() alone wasn't reliable — this timestamp is a
        // hard, deterministic guard: the focus handler refuses to reopen for a short window
        // after ANY deliberate close, regardless of what triggers the refocus or when.
        let suppressReopenUntil = 0;
        // Easy to close three ways (owner's ask): the X on the photo, Escape, or a click
        // anywhere outside the popup — including a PINNED one, which onDocMove above
        // deliberately leaves alone (a passing pointer must never outrank a deliberate choice,
        // but a deliberate Escape or outside click is exactly that).
        const onDocKey = (e: KeyboardEvent) => {
          if (e.key !== "Escape" || !popupOpen) return;
          pinnedRef.current = null;
          suppressReopenUntil = Date.now() + 400;
          popupOpen = false;
          shownForId = null;
          info.close();
          // Pull focus only when it sits somewhere that can REOPEN the popup (a chip's focus
          // handler, or inside the window Google is about to tear down) — never an unrelated
          // control the visitor was typing in.
          const ae = document.activeElement as HTMLElement | null;
          if (ae?.closest?.(".rlt-price-chip") || ae?.closest?.(".rlt-map-dot") || ae?.closest?.(".gm-style-iw")) ae.blur?.();
        };
        // POINTERDOWN, the same event the chips pin on, so the ordering is deterministic:
        // this document-capture listener always runs before a chip's own target-phase handler
        // (return early keeps a chip press pinning), and an outside press always closes.
        // The mousedown version had a real, watched-live failure: a chip press scrolled the
        // page (focusCard), and the press's own compatibility mousedown — dispatched at the
        // same screen coordinates AFTER the scroll — landed on the map div and read as
        // "outside", unpinning the popup the pointerdown had just pinned.
        const onDocDown = (e: Event) => {
          const el = e.target as Element | null;
          if (el?.closest?.(".rlt-price-chip") || el?.closest?.(".gm-style-iw") || el?.closest?.(".rlt-map-dot")) return;
          if (!popupOpen) return;
          pinnedRef.current = null;
          suppressReopenUntil = Date.now() + 400;
          popupOpen = false;
          shownForId = null;
          info.close();
        };
        // keydown on WINDOW, capture phase — confirmed live that even a document-level capture
        // listener never saw Escape: the Maps JS SDK registers its own document-level capture
        // listener during map init, BEFORE this one exists (this runs inside loadMaps().then()),
        // and same-node/same-phase listeners fire in registration order, so theirs won. window
        // sits topologically OUTSIDE document in the capture chain, so a window listener always
        // fires first regardless of registration order — the fix that actually holds.
        window.addEventListener("keydown", onDocKey, true);
        document.addEventListener("pointerdown", onDocDown, true);
        cleanupRef.current = () => {
          document.removeEventListener("mousemove", onDocMove);
          window.removeEventListener("keydown", onDocKey, true);
          document.removeEventListener("pointerdown", onDocDown, true);
        };

        // The pin set the overlay draws from: viewport-fetched pins once the first fetch has
        // landed, else the seed (results-page) pins — same fallback the Leaflet engine uses.
        const activeSource = () => (fetchedPinsRef.current ?? pinsRef.current).filter((p) => p.lat && p.lng);

        fitToPins(map, spreadPins(activeSource()), initialBoundsRef.current);
        lastFitKeyRef.current = fitKeyRef.current; // the mount fit covers the current place

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
              setViewportTotal(total);
              overlay?.draw?.();
            },
          });
          requestViewport();
        }

        // HTML marker overlay — a price pill for every home the screen can label, a small dot
        // for the rest (planMarkers), in the current viewport at the current zoom.
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
          const gb = map.getBounds();
          if (!proj || !gb) return; // before the first idle there is nothing to place against
          const sel = selectedRef.current;
          // The raw ref (not a fresh .filter()) keys the spread cache — see getSpread.
          const spread = getSpread(fetchedPinsRef.current ?? pinsRef.current);
          // The viewport's own pixel box, in the same projection space as the pins — the
          // corners are just two more projected points, so cull + collision share one space.
          const swPt = proj.fromLatLngToDivPixel(gb.getSouthWest());
          const nePt = proj.fromLatLngToDivPixel(gb.getNorthEast());
          const favSet = new Set(favoritesRef.current ?? []);
          const plan = planMarkers({
            pins: spread,
            project: (lat, lng) => proj.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng)),
            viewport: {
              left: Math.min(swPt.x, nePt.x),
              right: Math.max(swPt.x, nePt.x),
              top: Math.min(swPt.y, nePt.y),
              bottom: Math.max(swPt.y, nePt.y),
            },
            selectedId: sel,
            isSaved: (p) => !!p.saved || favSet.has(p.id),
          });
          setDrawnCount(plan.length);

          // Dots paint first so every pill sits above every dot — DOM order is z-order here.
          const frag = document.createDocumentFragment();
          for (const m of [...plan.filter((x) => x.kind === "dot"), ...plan.filter((x) => x.kind === "pill")]) {
            const p = m.pin;
            const pos = new google.maps.LatLng(p.lat, p.lng);
            const active = p.id === sel;
            // Hearted listings read differently at a glance — white chip, red heart, same
            // red as the card's FavoriteButton (owner's ask: saved homes visible ON the map).
            // SOLID = you can still buy it. HOLLOW = already spoken for (Pending / Under
            // Contract). Deliberately NOT a new hue: the site runs monochrome with one accent.
            const spokenFor = p.status === "Pending" || p.status === "Under Contract";
            const saved = !!p.saved || favSet.has(p.id);
            const label = spokenFor ? `${m.label} — ${p.address} — ${p.status}` : `${m.label} — ${p.address}`;

            let marker: HTMLButtonElement;
            if (m.kind === "dot") {
              // A dot is the same home wearing less ink — same colour language, same
              // interaction contract (hover previews, press pins). 24px hit target around a
              // 12px mark (globals.css .rlt-map-dot) keeps the tap-target gate honest.
              marker = document.createElement("button");
              marker.type = "button";
              marker.className = "rlt-map-dot";
              marker.setAttribute("aria-label", label);
              marker.style.cssText = `position:absolute;left:${m.x}px;top:${m.y}px;transform:translate(-50%,-50%);${dotStyleVars(saved, spokenFor)}`;
            } else {
              const chip = document.createElement("button");
              chip.type = "button";
              chip.className = "rlt-price-chip";
              chip.setAttribute("aria-label", label);
              chip.style.cssText = `position:absolute;left:${m.x}px;top:${m.y}px;transform:translate(-50%,-100%);${
                active
                  ? "--chip-bg:#1c729a;background:var(--chip-bg);color:#fff;box-shadow:0 0 0 2px #fff,0 3px 12px rgb(0 0 0/.45);z-index:1000"
                  : saved
                    ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#000;box-shadow:0 0 0 1.5px #ef4444,0 3px 10px rgb(0 0 0/.35);z-index:500"
                    : spokenFor
                      ? "--chip-bg:#ffffff;background:var(--chip-bg);color:#4a4a4a;box-shadow:0 0 0 1.5px #4a4a4a,0 2px 8px rgb(0 0 0/.22)"
                      : "--chip-bg:#000;background:var(--chip-bg);color:#fff;box-shadow:0 2px 8px rgb(0 0 0/.3)"
              };font:700 11px/1 ${MAP_FONT};padding:7px 9px;white-space:nowrap;border:0;cursor:pointer;border-radius:8px`;
              if (saved) {
                const heart = document.createElement("span");
                heart.style.color = "#ef4444";
                heart.textContent = "♥ ";
                chip.appendChild(heart);
                chip.appendChild(document.createTextNode(m.label));
              } else {
                chip.textContent = m.label;
              }
              marker = chip;
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
              // IDEMPOTENT for the pin already showing: a redundant re-open restarts Google's
              // open pipeline and (via synthetic boundary events under a stationary pointer)
              // can loop it forever — see shownForId above. Pinning an already-previewed home
              // only needs the pin recorded, not a re-render.
              if (popupOpen && shownForId === p.id) {
                if (pinned) pinnedRef.current = p.id;
                return;
              }
              const node = popupNode(p, {
                onClose: () => {
                  pinnedRef.current = null;
                  popupOpen = false;
                  shownForId = null;
                  info.close();
                },
                onToggleSave: (id) => onToggleSaveRef.current?.(id),
                // View Listing pressed: the walk the listing page offers is THE HOMES THIS MAP
                // IS SHOWING — the viewport pin fetch, which holds up to PIN_CAP homes the
                // grid's saved page never did (the grid's own save covers only its 150).
                onNavigate: () => {
                  const set = pinResultSet(activeSource(), window.location.pathname + window.location.search);
                  if (set) saveResultSet(set);
                },
              });
              // The popup must be part of its own hover target. Without this, moving the pointer
              // off the chip and ONTO the preview closes the thing you were reaching for, and
              // its heart and X are unreachable unless you click first.
              node.addEventListener("mouseenter", cancelClose);
              node.addEventListener("mouseleave", () => scheduleClose());
              // Measure the card's REAL height before opening. An InfoWindow body always
              // renders ABOVE its anchor + pixelOffset tip, so "open below the chip" needs the
              // tip pushed a full card-height down — the earlier +26 nudged it 52px and the
              // card still ran off the top of the map (verified live: only the VIEW LISTING
              // button survived the clip). Heights genuinely vary (pager row, status badge).
              node.style.cssText += ";position:absolute;visibility:hidden;left:-9999px;top:0";
              document.body.appendChild(node);
              const measured = node.offsetHeight || 300;
              node.remove();
              node.style.position = "relative";
              node.style.visibility = "";
              node.style.left = "";
              node.style.top = "";
              info.setContent(node);
              // Stay within the MAP BOX instead of always opening the same direction. The
              // InfoWindow is clipped by the map container (overflow-hidden), so the room that
              // matters is the intersection of the map's rect and the window — a chip just
              // under the map's top edge can have a whole page of window above it and still
              // no room at all.
              const chipRect = marker.getBoundingClientRect();
              const mapRect = el.getBoundingClientRect();
              const placement = popupPlacement(chipRect, {
                top: Math.max(mapRect.top, 0),
                bottom: Math.min(mapRect.bottom, window.innerHeight),
              });
              info.setOptions({
                // Above: 26px clears a pill hanging over its anchor; a dot only rises 12px from
                // its centre, so 16px clears it without leaving a moat. Below: the tip lands
                // measured+40 under the anchor, so the body (whose bottom sits a tail's height
                // above the tip) starts just beneath the marker instead of overlapping it.
                pixelOffset: new google.maps.Size(0, placement === "above" ? (m.kind === "dot" ? -16 : -26) : measured + 40),
                // A PINNED popup may pan the map to keep itself fully in view — the flip
                // handles the common top-edge case without motion, the pan covers everything
                // else (horizontal edges included). A passing hover must never lurch the map,
                // so previews keep the pan disabled. The redraw a pan triggers is safe now
                // that dismissal is the document-level authority (onDocMove), not a per-chip
                // mouseleave that a rebuilt chip would orphan.
                disableAutoPan: !pinned,
              });
              info.setPosition(pos);
              info.open({ map });
              popupOpen = true;
              shownForId = p.id;
              if (pinned) pinnedRef.current = p.id;
            };
            marker.addEventListener("mouseenter", () => {
              cancelClose();
              if (pinnedRef.current) return; // a deliberate choice outranks a passing pointer
              // draw() rebuilding this marker under a stationary pointer fires a synthetic
              // mouseenter — within the deliberate-close window that reopened the popup the
              // visitor just Escaped (reproduced: Escape during post-zoom settle, pointer on
              // the marker, pin fetch lands, popup back). Same guard the focus handler earned.
              if (Date.now() < suppressReopenUntil) return;
              openPopup(false);
            });
            // Keyboard parity: the markers are real buttons, so tabbing to one previews it too.
            // Guarded to keyboard focus only — a mouse press also focuses, and re-opening the
            // popup mid-press was part of what was eating the click. Also guarded against the
            // reopen race a deliberate close (Escape/outside-click, above) can trigger.
            marker.addEventListener("focus", (e) => {
              if (!(e.target as HTMLElement).matches(":focus-visible")) return;
              if (Date.now() < suppressReopenUntil) return;
              cancelClose();
              if (!pinnedRef.current) openPopup(false);
            });
            marker.addEventListener("blur", () => scheduleClose());
            // PIN ON THE PRESS, not on the click. A click event only fires when mousedown and
            // mouseup land on the SAME element, and overlay.draw() rebuilds every marker on each
            // map idle — so a redraw between press and release silently swallowed the click and
            // the popup was never pinned. Pressing is also the honest moment: that is when the
            // visitor chose this home.
            marker.addEventListener("pointerdown", () => {
              cancelClose();
              pinnedRef.current = p.id;
              openPopup(true);
              onSelectRef.current?.(p.id);
            });
            // Keyboard pinning. Enter/Space on a button fires only `click` — never pointerdown
            // — so a keyboard user could preview a home (focus, above) but never PIN it, and
            // tabbing onward closed the popup before its links were reachable. detail === 0
            // is the keyboard-activation signature; mouse clicks (detail ≥ 1) already pinned
            // on the press and are ignored here.
            marker.addEventListener("click", (e) => {
              if (e.detail !== 0) return;
              cancelClose();
              pinnedRef.current = p.id;
              openPopup(true);
              onSelectRef.current?.(p.id);
            });
            frag.appendChild(marker);
          }
          container.appendChild(frag);
        };
        overlay.setMap(map);
        overlayRef.current = overlay;
        // Redraw markers on every settle (pan/zoom) so their pixel positions stay correct,
        // (when opted in) fetch the new viewport's pins, and report the settled box so the
        // results grid can scope itself to it.
        map.addListener("idle", () => {
          overlay.draw();
          requestViewport();
          const settled = toBounds(map.getBounds());
          if (settled) onBoundsChangeRef.current?.(settled);
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
    setDrawnCount(null);
    setViewportTotal(null);
    fetcherRef.current?.cancel();
    fetcherRef.current = createPinFetcher({
      filtersQuery,
      onData: (p, total) => {
        fetchedPinsRef.current = p;
        setViewportTotal(total);
        overlayRef.current?.draw?.();
      },
    });
    const b = toBounds(map.getBounds());
    if (b) fetcherRef.current.request(b);
    overlayRef.current?.draw?.();
  }, [filtersQuery]);

  // New seed pins: redraw (an idle won't fire on its own without a user move), and refit ONLY
  // when the PLACE changed (fitKey — the caller ties it to the results' county/city/q, so a
  // county click flies the map there while a price tweak, a page turn, or the grid's own
  // viewport-scoped refetch leaves the visitor's viewport alone). The fitKey gate is what
  // keeps the round-23 loop shut: refetch → new pins → (no refit) → no idle → no refetch.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof google === "undefined") return;
    if (fitKey !== lastFitKeyRef.current) {
      lastFitKeyRef.current = fitKey;
      fitToPins(map, spreadPins(pins.filter((p) => p.lat && p.lng)), initialBounds);
    }
    overlayRef.current?.draw?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins, initialBounds, fitKey]);

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
      {viewportTotal !== null && drawnCount !== null && viewportTotal > drawnCount && (
        // bottom-12 on phones: at 390px this and the legend are wider than the map together,
        // and both bottom-2 meant the banner sat ON the legend ("LOCATIONS APPROXIMATE" read
        // "LOCA" — screenshotted). Stacked clear of it until sm, side by side after.
        // drawnCount (markers actually painted after thinning), not the fetch size — a
        // visitor can count what is on screen, so the banner reports exactly that.
        <p className="pointer-events-none absolute bottom-14 right-2 z-[5] rounded-lg border border-line bg-white/95 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-stone sm:bottom-2">
          {drawnCount.toLocaleString()} of {viewportTotal.toLocaleString()} homes shown. Zoom in for more
        </p>
      )}
      <div ref={divRef} className="h-full min-h-96 w-full" />
    </div>
  );
}
