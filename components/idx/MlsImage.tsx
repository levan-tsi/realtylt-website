"use client";

import Image from "next/image";
import { useState } from "react";
import { NoPhoto } from "./ListingCard";

/** MLS photo that HEALS ITSELF: the media proxy answers 503 on transient upstream
 * throttles (media.mlsgrid.com 429 bursts), so onError fires and this retries with a
 * cache-buster at 2s and 8s before settling on the branded placeholder. Fixes "some
 * pics don't appear until you reload". */
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
  const [state, setState] = useState<"loading" | "waiting" | "failed">("loading");

  if (state === "failed") return <NoPhoto />;

  const bustedSrc = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}r=${attempt}`;
  return (
    <>
      {state === "waiting" && <NoPhoto />}
      <Image
        key={bustedSrc}
        src={bustedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className={className}
        onLoad={() => setState("loading")}
        onError={() => {
          if (attempt < RETRY_DELAYS_MS.length) {
            setState("waiting");
            setTimeout(() => {
              setAttempt((a) => a + 1);
              setState("loading");
            }, RETRY_DELAYS_MS[attempt]);
          } else {
            setState("failed");
          }
        }}
      />
    </>
  );
}
