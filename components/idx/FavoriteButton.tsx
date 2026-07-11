"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite, SAVED_EVENT } from "@/lib/saved";

/** Heart toggle — saves to device (localStorage). */
export function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(id));
    const sync = () => setFav(isFavorite(id));
    window.addEventListener(SAVED_EVENT, sync);
    return () => window.removeEventListener(SAVED_EVENT, sync);
  }, [id]);

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Remove from saved homes" : "Save this home"}
      title={fav ? "Remove from saved homes" : "Save this home"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavorite(id));
      }}
      className={`grid h-9 w-9 place-items-center rounded-full bg-ink/55 backdrop-blur transition-all hover:scale-110 hover:bg-ink/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`h-[18px] w-[18px] transition-colors ${
          fav ? "fill-red-500 stroke-red-500" : "fill-transparent stroke-paper"
        }`}
        strokeWidth="1.8"
      >
        <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
      </svg>
    </button>
  );
}
