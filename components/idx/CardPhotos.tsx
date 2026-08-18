"use client";

import { useState } from "react";
import { MlsImage } from "./MlsImage";

/** Search-card photo pager — the owner's ask: "the pictures should have a small arrow where
 * you could move and switch between pictures" without opening the listing.
 *
 * MLS-safety: exactly ONE photo is mounted at a time (keyed MlsImage), so a card costs one
 * media request and each arrow press exactly one more — no prefetch, no burst. MlsImage
 * keeps its whole retry/queue/placeholder contract per photo.
 *
 * The whole card is wrapped by an absolute Link at z-10; the controls sit at z-20 and stop
 * propagation so flipping photos never navigates. Arrows are hover/focus-revealed on fine
 * pointers and always visible on touch, and every control clears the 24px tap floor. */
export function CardPhotos({
  id,
  cover,
  count,
  alt,
  sizes,
  priority = false,
}: {
  /** Listing id — photos beyond the cover are addressed as /api/media/{id}/{n}. */
  id: string;
  /** The cover photo's same-origin path (the one URL the slim card actually carries). */
  cover: string;
  /** How many photos the media proxy can serve (idx_listings.photos_servable); <=1 = no pager. */
  count: number;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const [i, setI] = useState(0);
  const n = Math.max(1, count);
  const go = (step: number) => setI((cur) => (((cur + step) % n) + n) % n);
  const src = i === 0 ? cover : `/api/media/${id}/${i}`;

  // `--rlt-ring-on-photo` answers globals.css's `.photo-zoom :focus-visible`. That rule pulls a
  // control's ring inside its own body so it never lands on somebody's photograph, and defaults
  // the colour to PAPER because it was written for the listing gallery, whose controls are
  // `bg-ink/55..70`. This arrow is the opposite body — `bg-white/90` — so the default drew a white
  // ring inside a white pill: 36 invisible focus stops on /search, measured in round 34. Ink here
  // is >=15:1 over any photograph, because the 0.9 alpha floors the pill at rgb(230).
  const arrowCls =
    "absolute top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full " +
    "bg-white/90 text-ink shadow-raise ring-1 ring-black/10 transition-opacity " +
    "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(pointer:coarse)]:opacity-100 " +
    "hover:bg-white [--rlt-ring-on-photo:var(--color-ink)]";

  return (
    <>
      <MlsImage key={src} src={src} alt={alt} sizes={sizes} priority={priority && i === 0} />
      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            className={`${arrowCls} left-2`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            className={`${arrowCls} right-2`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <span
            aria-hidden
            className="absolute bottom-2 right-2 z-20 rounded-lg bg-ink/70 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-paper"
          >
            {i + 1} / {n}
          </span>
          <span className="sr-only" aria-live="polite">
            Photo {i + 1} of {n}
          </span>
        </>
      )}
    </>
  );
}
