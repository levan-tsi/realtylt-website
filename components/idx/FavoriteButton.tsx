"use client";

import { useState } from "react";
import { PRESS } from "@/components/ui/Button";
import { useSaved } from "@/components/auth/SavedProvider";

/** Heart toggle — saves to the client's account when signed in, otherwise to this device.
 * Device saves migrate into the account automatically on the next sign-in.
 * `tone`: "onPhoto" (dark scrim, for text-over-image tiles) or "onLight" (outline heart on a
 * white card body — live realtylt.com's search-card spot). Both keep a ≥36px tap target. */
export function FavoriteButton({
  id,
  className = "",
  tone = "onPhoto",
  showLabel = false,
}: {
  id: string;
  className?: string;
  tone?: "onPhoto" | "onLight";
  /** Render the visible "Save" / "Saved" word beside the heart (the listing sub-nav does — a bare
   * heart there reads as decoration next to two labelled buttons). */
  showLabel?: boolean;
}) {
  const { isFavorite, toggleFavorite } = useSaved();
  const fav = isFavorite(id);
  const onLight = tone === "onLight";
  // Saving a home should feel like something happened. The pop is tied to the ACT, not to the
  // state: keying it off `fav` alone would set every already-saved heart bouncing on page load
  // and on every re-render, which reads as a glitch rather than a confirmation. Removing a home
  // gets no pop either — taking something away should not celebrate.
  const [pop, setPop] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Remove from saved homes" : "Save this home"}
      title={fav ? "Remove from saved homes" : "Save this home"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!fav) setPop(true);
        void toggleFavorite(id);
      }}
      className={`${
        showLabel ? "inline-flex h-9 items-center gap-1.5 rounded-xl px-3" : "grid h-9 w-9 place-items-center rounded-full"
      } ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 ${showLabel ? "" : "hover:scale-110"} ${
        onLight
          ? "text-stone hover:bg-mist hover:text-ink focus-visible:outline-river"
          : "bg-ink/55 backdrop-blur hover:bg-ink/75 focus-visible:outline-paper"
      } ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        onAnimationEnd={() => setPop(false)}
        className={`h-[18px] w-[18px] transition-colors duration-200 ${pop ? "heart-pop" : ""} ${
          fav
            ? "fill-red-500 stroke-red-500"
            : onLight
              ? "fill-transparent stroke-stone group-hover:stroke-ink"
              : "fill-transparent stroke-paper"
        }`}
        strokeWidth="1.8"
      >
        <path d="M12 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.5.5.5-.5a4.8 4.8 0 0 1 6.8 6.8L12 20.3z" />
      </svg>
      {showLabel && (
        <span className="text-xs font-bold uppercase tracking-[0.1em]">{fav ? "Saved" : "Save"}</span>
      )}
    </button>
  );
}
