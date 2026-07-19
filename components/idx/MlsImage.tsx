"use client";

import Image from "next/image";
import { useState } from "react";
import { NoPhoto } from "./ListingCard";

/** MLS photo that HEALS ITSELF: the media proxy answers 503 on transient upstream
 * throttles (media.mlsgrid.com 429 bursts), so onError fires and this retries with a
 * cache-buster at 2s and 8s. While the first byte is still in flight — including across
 * those retries — a quiet skeleton shimmer holds the frame so the visitor never sees the
 * broken/placeholder flash. Only after every retry is exhausted does it settle on the
 * branded placeholder. Fixes "some pics don't appear until you reload". */
const RETRY_DELAYS_MS = [2000, 8000];

export function MlsImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "object-cover",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed) return <NoPhoto />;

  const bustedSrc = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}r=${attempt}`;
  return (
    <>
      {/* Skeleton shimmer until the first byte lands (and between silent retries) — never a
          flash of the placeholder. Static block for reduced-motion users. */}
      {!loaded && <div className="absolute inset-0 animate-pulse bg-mist motion-reduce:animate-none" aria-hidden />}
      <Image
        key={bustedSrc}
        src={bustedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (attempt < RETRY_DELAYS_MS.length) {
            setTimeout(() => setAttempt((a) => a + 1), RETRY_DELAYS_MS[attempt]);
          } else {
            setFailed(true);
          }
        }}
      />
    </>
  );
}
