"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Listing } from "@/lib/idx/types";
import { ListingCard } from "./ListingCard";

/** Horizontal scroll-snap carousel of listing cards with arrow controls. */
export function ListingCarousel({ listings, ariaLabel }: { listings: Listing[]; ariaLabel: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  function scrollBy(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 20 : 360;
    el.scrollBy({ left: dir * w * 2, behavior: "smooth" });
  }

  if (listings.length === 0) {
    return (
      <p className="rounded-[2px] border border-dashed border-ink/20 p-8 text-center text-sm text-stone">
        No listings to show right now — check back soon or{" "}
        <a href="/search" className="text-river underline underline-offset-2">
          browse all homes
        </a>
        .
      </p>
    );
  }

  return (
    <div className="relative" role="group" aria-label={ariaLabel}>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((l) => (
          <li key={l.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
            <ListingCard listing={l} />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          aria-label="Previous listings"
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <span aria-hidden>←</span>
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          aria-label="Next listings"
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
