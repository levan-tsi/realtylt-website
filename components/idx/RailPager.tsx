"use client";

import { useEffect, useRef, useState } from "react";
import type { Listing } from "@/lib/idx/types";
import { ListingCard } from "./ListingCard";

const PER_PAGE = 8;

/** Home-page listing rail with live-style paging: the same 4-col grid (a peek-swipe rail on
 * mobile), a page at a time, driven by ‹ › chevron controls and a "N / M" indicator. Every
 * page holds PER_PAGE cards of equal-aspect tiles, so swaps never shift layout. Wrap-around
 * (matching live's always-active arrows) keeps the controls simple and avoids focus loss. */
export function RailPager({
  listings,
  ariaLabel,
  eager = false,
}: {
  listings: Listing[];
  ariaLabel: string;
  /** Prioritise the first row's images (LCP) — used by the topmost rail only. */
  eager?: boolean;
}) {
  const [page, setPage] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const pageCount = Math.max(1, Math.ceil(listings.length / PER_PAGE));

  // Clamp if the pool ever shrinks below the current page.
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  // A page swap is a discrete change, not a scroll gesture: snap the mobile swipe rail back
  // to its start instantly, so it reads the same under reduced-motion.
  useEffect(() => {
    track.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [page]);

  if (listings.length === 0) {
    return (
      <p className="mt-10 border border-dashed border-ink/20 p-8 text-center text-sm text-stone">
        No listings to show right now.{" "}
        <a href="/search" className="text-river underline underline-offset-2">
          Browse all homes
        </a>
        .
      </p>
    );
  }

  const start = page * PER_PAGE;
  const shown = listings.slice(start, start + PER_PAGE);

  return (
    <div role="group" aria-roledescription="carousel" aria-label={ariaLabel}>
      <ul
        ref={track}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4"
      >
        {shown.map((l, i) => (
          <li key={l.id} className="w-[85%] shrink-0 snap-center sm:w-auto">
            <ListingCard listing={l} priority={eager && page === 0 && i < 4} />
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="mt-7 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
            aria-label="Previous listings"
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <Chevron dir="left" />
          </button>
          <span aria-hidden className="min-w-[4.5ch] text-center text-sm tabular-nums text-stone">
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => (p + 1) % pageCount)}
            aria-label="Next listings"
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <Chevron dir="right" />
          </button>
          <span aria-live="polite" className="sr-only">
            Page {page + 1} of {pageCount}
          </span>
        </div>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );
}
