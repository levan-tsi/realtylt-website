"use client";

import { useSaved } from "@/components/auth/SavedProvider";

/** Heart toggle — saves to the client's account when signed in, otherwise to this device.
 * Device saves migrate into the account automatically on the next sign-in.
 * `tone`: "onPhoto" (dark scrim, for text-over-image tiles) or "onLight" (outline heart on a
 * white card body — live realtylt.com's search-card spot). Both keep a ≥36px tap target. */
export function FavoriteButton({
  id,
  className = "",
  tone = "onPhoto",
}: {
  id: string;
  className?: string;
  tone?: "onPhoto" | "onLight";
}) {
  const { isFavorite, toggleFavorite } = useSaved();
  const fav = isFavorite(id);
  const onLight = tone === "onLight";

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? "Remove from saved homes" : "Save this home"}
      title={fav ? "Remove from saved homes" : "Save this home"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleFavorite(id);
      }}
      className={`grid h-9 w-9 place-items-center rounded-full transition-all hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 ${
        onLight
          ? "text-stone hover:bg-mist hover:text-ink focus-visible:outline-river"
          : "bg-ink/55 backdrop-blur hover:bg-ink/75 focus-visible:outline-paper"
      } ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`h-[18px] w-[18px] transition-colors ${
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
    </button>
  );
}
