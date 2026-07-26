"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wrapIndex } from "@/lib/leads/listing-intents";
import { loadMaps } from "@/lib/idx/maps-loader";

/** Photo lightbox for the listing detail gallery, matching the live site's viewer: a big main
 * photo with a scrollable rail of every other photo (click to select), plus Photos / Street View /
 * Map View tabs and an "In Person Tour" CTA. The server renders the gallery grid as-is (keeping its
 * no-JS <details> "Show all photos" fallback); this client wrapper delegates clicks/Enter on any
 * `[data-lightbox-index]` tile to open the overlay at that photo. Street View + Map geocode the REAL
 * address client-side via the existing Maps key (honest — the listing's own location, not the
 * zip-centroid used for privacy on the search map); the tabs hide when no key/geocode is available. */
export function ListingGallery({
  photos,
  address,
  mapQuery,
  children,
}: {
  photos: string[];
  address: string;
  /** Full "street, city, state zip" for geocoding Street View + Map. Omit to show Photos only. */
  mapQuery?: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const openAt = useCallback(
    (i: number) => {
      if (i >= 0 && i < photos.length) setIndex(i);
    },
    [photos.length],
  );

  const onActivate = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-lightbox-index]");
      if (!el) return;
      if ("key" in e && e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openAt(Number(el.dataset.lightboxIndex));
    },
    [openAt],
  );

  return (
    <>
      <div onClick={onActivate} onKeyDown={onActivate} className="contents">
        {children}
      </div>
      {open && (
        <Lightbox
          photos={photos}
          address={address}
          mapQuery={mapQuery}
          index={index}
          setIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}

type Tab = "photos" | "street" | "map";

function Lightbox({
  photos,
  address,
  mapQuery,
  index,
  setIndex,
  onClose,
}: {
  photos: string[];
  address: string;
  mapQuery?: string;
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const [tab, setTab] = useState<Tab>("photos");

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // Geocode the real address ONCE on open. Street View / Map tabs appear only if it resolves, so a
  // key without the Geocoding/Street-View APIs (or a blocked referrer) simply shows Photos — never a
  // dead tab. undefined = still checking, null = unavailable, value = ready.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null | undefined>(
    mapsKey && mapQuery ? undefined : null,
  );
  useEffect(() => {
    if (!mapsKey || !mapQuery) return;
    let disposed = false;
    (async () => {
      try {
        await loadMaps(mapsKey);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g: any = (globalThis as any).google;
        const res = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
          new g.maps.Geocoder().geocode({ address: mapQuery }, (r: unknown[], status: string) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const loc = (r as any)?.[0]?.geometry?.location;
            resolve(status === "OK" && loc ? { lat: loc.lat(), lng: loc.lng() } : null);
          });
        });
        if (!disposed) setCoords(res);
      } catch {
        if (!disposed) setCoords(null);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [mapsKey, mapQuery]);
  const hasPlace = Boolean(coords);

  const count = photos.length;
  const go = useCallback((delta: number) => setIndex(wrapIndex(index, delta, count)), [index, count, setIndex]);

  // Remember + restore focus; lock body scroll while open.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      restoreRef.current?.focus?.();
    };
  }, []);

  // Keep the active thumbnail visible in the rail as you page.
  useEffect(() => {
    if (tab !== "photos") return;
    railRef.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index, tab]);

  const openTour = () => {
    // Live parity: keep the gallery OPEN and let the tour sheet render one layer above it, so the
    // visitor fills it right over the photos and returns to the gallery on close (no jump to a box
    // below the pics). ListingLeadCTAs listens for this on window; its sheet sits at a higher z.
    window.dispatchEvent(new CustomEvent("listing:request-tour"));
  };

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (tab === "photos" && e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (tab === "photos" && e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        const f = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]),iframe,[href]");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [go, onClose, tab],
  );

  const neighbors = [(index + 1) % count, (index - 1 + count) % count];
  const tabBtn = (t: Tab, label: string) =>
    (t === "photos" || hasPlace) && (
      <button
        key={t}
        type="button"
        onClick={() => setTab(t)}
        aria-pressed={tab === t}
        className={`min-h-11 border-b-2 px-3 text-sm font-bold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper ${
          tab === t ? "border-paper text-paper" : "border-transparent text-paper/60 hover:text-paper"
        }`}
      >
        {label}
      </button>
    );

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos for ${address}`}
      onKeyDown={onKeyDown}
      className="rlt-fade-in fixed inset-0 z-[1000000] flex flex-col bg-ink/95"
    >
      {/* Top bar: tabs (left) + counter/close (right). Fixed height, no shift. */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-2 text-paper sm:px-6">
        <div role="tablist" aria-label="View" className="flex items-center gap-1">
          {tabBtn("photos", "Photos")}
          {tabBtn("street", "Street View")}
          {tabBtn("map", "Map View")}
        </div>
        <div className="flex items-center gap-3">
          {tab === "photos" && (
            <span className="font-mono text-sm tabular-nums text-paper/80" aria-live="polite">
              {index + 1} / {count}
            </span>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="grid h-11 w-11 place-items-center rounded-full text-paper/90 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 lg:flex-row lg:p-4">
        {tab === "photos" ? (
          <>
            {/* Main photo + arrows */}
            <div
              className="relative flex min-h-0 flex-1 items-center justify-center"
              onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                if (touchX.current == null) return;
                const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
                if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
                touchX.current = null;
              }}
            >
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-paper transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:left-3"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={photos[index]}
                src={photos[index]}
                alt={`${address}, photo ${index + 1}`}
                className="max-h-full max-w-full select-none rounded-lg object-contain"
                draggable={false}
              />
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-paper transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:right-3"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>

            {/* Thumbnail rail — vertical column on desktop (scroll to choose), horizontal strip on mobile */}
            <div
              ref={railRef}
              className="flex shrink-0 gap-2 overflow-x-auto overflow-y-hidden lg:h-full lg:w-40 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden"
            >
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  data-thumb={i}
                  onClick={() => setIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded lg:h-24 lg:w-full ${
                    i === index ? "ring-2 ring-paper" : "opacity-70 hover:opacity-100"
                  } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          </>
        ) : coords ? (
          <MapPane tab={tab} coords={coords} />
        ) : null}
      </div>

      {/* Bottom CTA bar — the live viewer surfaces the tour action right in the gallery */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-4 py-2 text-paper sm:px-6">
        <p className="truncate text-xs text-paper/70">{address}</p>
        <button
          type="button"
          onClick={openTour}
          className="inline-flex min-h-11 items-center gap-2 rounded bg-paper px-5 text-sm font-bold text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          In Person Tour
        </button>
      </div>

      {/* Warm the neighbours so paging is instant. */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        {neighbors.map((n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={n} src={photos[n]} alt="" />
        ))}
      </div>
    </div>
  );
}

/** Street View / Map tab body. Maps JS + the address geocode are already resolved by the Lightbox
 * (this tab only renders when coords exist), so this just paints a google.maps.StreetViewPanorama or
 * Map at the real location. */
function MapPane({ tab, coords }: { tab: "street" | "map"; coords: { lat: number; lng: number } }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = (globalThis as any).google;
    if (!g?.maps) return;
    if (tab === "map") {
      const map = new g.maps.Map(ref.current, {
        center: coords,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: false,
        gestureHandling: "cooperative",
      });
      new g.maps.Marker({ position: coords, map });
    } else {
      new g.maps.StreetViewPanorama(ref.current, {
        position: coords,
        pov: { heading: 0, pitch: 0 },
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
      });
    }
  }, [tab, coords]);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-ink-soft">
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
