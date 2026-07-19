"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wrapIndex } from "@/lib/leads/listing-intents";

/** Full-screen photo lightbox for the listing detail gallery. The server renders the gallery
 * grid as-is (so it keeps its no-JS <details> "Show all photos" fallback); this client wrapper
 * delegates clicks/Enter on any `[data-lightbox-index]` tile to open the overlay at that photo.
 * Overlay: prev/next arrows + counter, Esc closes, focus trapped + restored, touch swipe,
 * neighbors preloaded, fixed layout (no shift). */
export function ListingGallery({
  photos,
  address,
  children,
}: {
  photos: string[];
  address: string;
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

  // Delegate click + keyboard activation from the server-rendered tiles.
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
          index={index}
          setIndex={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  photos,
  address,
  index,
  setIndex,
  onClose,
}: {
  photos: string[];
  address: string;
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);

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

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Tab") {
        // Focus trap.
        const f = panelRef.current?.querySelectorAll<HTMLElement>("button");
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
    [go, onClose],
  );

  const neighbors = [(index + 1) % count, (index - 1 + count) % count];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}, ${address}`}
      onKeyDown={onKeyDown}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      className="rlt-fade-in fixed inset-0 z-[1000000] flex flex-col bg-ink/95"
    >
      {/* Top bar: counter + close (fixed height — no layout shift as photos change) */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-paper sm:px-6">
        <span className="font-mono text-sm tabular-nums text-paper/80" aria-live="polite">
          {index + 1} / {count}
        </span>
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

      {/* Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-16">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-paper transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:left-3 sm:h-12 sm:w-12"
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
          className="max-h-full max-w-full select-none object-contain"
          draggable={false}
        />

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-paper transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper sm:right-3 sm:h-12 sm:w-12"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Warm the neighbours so paging is instant (hidden, no layout impact). */}
      <div className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
        {neighbors.map((n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={n} src={photos[n]} alt="" />
        ))}
      </div>
    </div>
  );
}
