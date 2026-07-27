"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { wrapIndex } from "@/lib/carousel";

// Live realtylt.com "Why Work With Us?" is a Bootstrap carousel (#promo-slider-1) of five
// device screenshots + captions. The live slides are the IDX vendor's stock product mockups
// (a Seattle search page, a seller transaction dashboard, "Your Agent / 555-1212" placeholder
// contacts) — a competitor's demo of markets we do not serve, in branding that is not ours.
//
// These five are OUR OWN product instead: real screenshots of this site running against the
// live One Key feed, composited into a CSS-drawn laptop shell by scripts/build-why-slides.mjs
// (re-run it when these surfaces change). Every caption describes a surface we actually ship
// — the seller-transaction-dashboard slide has no equivalent here and was replaced with
// /home-value rather than staged, and the live captions' "virtual tours, 3D walkthroughs and
// videos" went with it because our listing pages carry photos, not tours.
const SLIDES = [
  {
    src: "/images/why/our-listing-gallery.webp",
    caption: "Every photo, the map, the schools and the monthly payment on one page",
  },
  {
    src: "/images/why/our-search.webp",
    caption: "Search all available homes for sale",
  },
  {
    src: "/images/why/our-home-value.webp",
    caption: "Find out what your home is worth, from fifteen real comps",
  },
  {
    src: "/images/why/our-market-insights.webp",
    caption: "Market insights for the neighborhood around every listing",
  },
  {
    src: "/images/why/our-save-search.webp",
    caption: "Save any search and turn on alerts for new matches",
  },
];

const N = SLIDES.length;
const AUTO_ADVANCE_MS = 6000;
// Live's Bootstrap carousel opens on the SECOND slide ("Search all available homes for
// sale" — the `item active` in the source markup); match that as the starting frame.
const INITIAL_INDEX = 1;

export function WhyCarousel() {
  const [index, setIndex] = useState(INITIAL_INDEX);
  const [paused, setPaused] = useState(false);
  const [motionOk, setMotionOk] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((next: number) => setIndex((i) => wrapIndex(next, N)), []);
  const prev = useCallback(() => setIndex((i) => wrapIndex(i - 1, N)), []);
  const next = useCallback(() => setIndex((i) => wrapIndex(i + 1, N)), []);

  // Only auto-advance when the user has not asked for reduced motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motionOk || paused) return;
    const t = window.setInterval(() => setIndex((i) => wrapIndex(i + 1, N)), AUTO_ADVANCE_MS);
    return () => window.clearInterval(t);
  }, [motionOk, paused]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchStartX.current = null;
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="What working with us looks like"
        className="relative"
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Viewport — device screenshots keep their own aspect via object-contain on the
            section's light background, so no mockup is cropped or stretched. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={s.src}
                alt={s.caption}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                priority={i === INITIAL_INDEX}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Side arrows — inline SVG chevrons, 44px tap targets, high-contrast focus ring. */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm ring-1 ring-black/10 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-mist md:-left-3 lg:-left-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm ring-1 ring-black/10 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-mist md:-right-3 lg:-right-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Caption + slide indicator (matches live's h3 caption under the device). */}
      <p className="mx-auto mt-6 max-w-xl text-center text-lg font-medium text-ink">
        {SLIDES[index].caption}
      </p>

      {/* Dots — clickable, each a 24px+ tap target. */}
      <div className="mt-5 flex items-center justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show slide ${i + 1} of ${N}`}
            aria-current={i === index ? "true" : undefined}
            className="grid h-6 w-6 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-mist"
          >
            <span
              aria-hidden
              className={`block h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-ink" : "w-2 bg-ink/25 hover:bg-ink/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Screen-reader announcement of the active slide. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {index + 1} of {N}: {SLIDES[index].caption}
      </span>
    </div>
  );
}
