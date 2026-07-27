"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wrapIndex } from "@/lib/leads/listing-intents";
import { loadMaps } from "@/lib/idx/maps-loader";
import { requestMediaSlot } from "@/lib/idx/media-queue";

/** Photo lightbox for the listing detail gallery, matching the live site's viewer: a big main
 * photo with a scrollable rail of every other photo (click to select), plus Photos / Street View /
 * Map View tabs and an "In Person Tour" CTA. The band above it (ListingPhotos) owns which photos
 * exist, so `photos` here is already the SURVIVING set and "i / N" can never over-count; a tile
 * that dies inside the viewer reports up through `onUnavailable` and leaves the set too. Any
 * `[data-lightbox-index]` element in `children` opens the overlay at that photo (delegated), and
 * `data-lightbox-tab` opens it straight onto Street View / Map View. Street View + Map geocode the
 * REAL address client-side via the existing Maps key (honest — the listing's own location, not the
 * zip-centroid used for privacy on the search map); the tabs hide when no key/geocode is available. */
export function ListingGallery({
  photos,
  address,
  mapQuery,
  onUnavailable,
  children,
}: {
  photos: string[];
  address: string;
  /** Full "street, city, state zip" for geocoding Street View + Map. Omit to show Photos only. */
  mapQuery?: string;
  /** Called with a photo whose bytes never arrive — the owner drops it from the surviving set. */
  onUnavailable?: (src: string) => void;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("photos");
  const open = index !== null;

  const onActivate = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-lightbox-index]");
      if (!el) return;
      // Native buttons already synthesise a click from Enter/Space — handling the keydown too
      // would open the same photo twice.
      if ("key" in e) {
        if (el.tagName === "BUTTON") return;
        if (e.key !== "Enter" && e.key !== " ") return;
      }
      e.preventDefault();
      const i = Number(el.dataset.lightboxIndex);
      if (!Number.isInteger(i) || i < 0 || i >= photos.length) return;
      setTab((el.dataset.lightboxTab as Tab) || "photos");
      setIndex(i);
    },
    [photos.length],
  );

  // The surviving set can shrink while the viewer is open (a photo 503s in the rail): keep the
  // index inside it, and close when nothing is left rather than showing an empty frame.
  useEffect(() => {
    if (index === null) return;
    if (photos.length === 0) setIndex(null);
    else if (index >= photos.length) setIndex(photos.length - 1);
  }, [photos.length, index]);

  return (
    <>
      <div onClick={onActivate} onKeyDown={onActivate} className="contents">
        {children}
      </div>
      {open && index < photos.length && (
        <Lightbox
          photos={photos}
          address={address}
          mapQuery={mapQuery}
          index={index}
          setIndex={setIndex}
          initialTab={tab}
          onUnavailable={onUnavailable}
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
  initialTab,
  onUnavailable,
  onClose,
}: {
  photos: string[];
  address: string;
  mapQuery?: string;
  index: number;
  setIndex: (i: number) => void;
  initialTab: Tab;
  onUnavailable?: (src: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab);

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
  // Opened straight onto Street View / Map but the address will not geocode (key without the
  // Geocoding API, blocked referrer, rural address): fall back to Photos rather than a dead panel.
  useEffect(() => {
    if (coords === null && tab !== "photos") setTab("photos");
  }, [coords, tab]);

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
              <GalleryImg
                key={photos[index]}
                src={photos[index]}
                alt={`${address}, photo ${index + 1}`}
                front
                className="max-h-full max-w-full select-none rounded-lg object-contain"
                onUnavailable={onUnavailable}
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
                  <GalleryImg src={src} alt="" lazy className="h-full w-full object-cover" onUnavailable={onUnavailable} />
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

      {/* Warm the neighbours so paging is instant — through the queue like everything else, and
          behind the visible frame + the nearby thumbnails in line. */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        {neighbors.map((n) => (
          <GalleryImg key={photos[n]} src={photos[n]} alt="" className="h-px w-px" />
        ))}
      </div>
    </div>
  );
}

/** A viewer photo that follows the same contract as MlsImage: the media proxy answers 503 while
 * the host throttles, so retry quietly at 2s and 8s, and only then declare the photo gone. It then
 * renders NOTHING and tells the owner, which removes it from the surviving set — the placeholder
 * SVG must never appear inside the viewer pretending to be a photo of this house. */
function GalleryImg({
  src,
  alt,
  className,
  lazy = false,
  front = false,
  onUnavailable,
}: {
  src: string;
  alt: string;
  className: string;
  lazy?: boolean;
  /** The frame the visitor is looking at — jumps ahead of the thumbnail rail in the queue. */
  front?: boolean;
  onUnavailable?: (src: string) => void;
}) {
  const [attempt, setAttempt] = useState(0);
  const [gone, setGone] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // Two gates, both required. VISIBILITY: a thumbnail 40 rows down the rail must not fetch at all
  // (native loading="lazy" cannot be combined with the queue — an off-screen tile would sit on its
  // slot). CONCURRENCY: of the thumbnails that ARE near the viewport, at most six fetch at once.
  // Opening a 48-photo viewer used to put 48 requests on the wire and 429 the media host.
  const [near, setNear] = useState(!lazy);
  const [admitted, setAdmitted] = useState(false);
  const releaseRef = useRef<() => void>(() => {});
  const busted = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}r=${attempt}`;

  useEffect(() => {
    if (near || gone) return;
    const el = imgRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, gone]);

  useEffect(() => {
    if (gone || !near) return;
    setAdmitted(false);
    const release = requestMediaSlot(() => setAdmitted(true), front);
    releaseRef.current = release;
    return release;
  }, [busted, gone, near, front]);

  if (gone) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={near && admitted ? busted : undefined}
      alt={alt}
      className={className}
      draggable={false}
      onLoad={() => releaseRef.current()}
      onError={() => {
        releaseRef.current();
        setAdmitted(false); // never leave a broken frame in the DOM between retries
        if (attempt < GALLERY_RETRY_MS.length) {
          setTimeout(() => setAttempt((a) => a + 1), GALLERY_RETRY_MS[attempt] + Math.random() * 1200);
        } else {
          setGone(true);
          onUnavailable?.(src);
        }
      }}
    />
  );
}
const GALLERY_RETRY_MS = [1500, 4000];

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
