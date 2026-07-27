"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { requestMediaSlot } from "@/lib/idx/media-queue";
import { NoPhoto } from "./ListingCard";

/** MLS photo that HEALS ITSELF: the media proxy answers 503 on transient upstream
 * throttles (media.mlsgrid.com 429 bursts), so onError fires and this retries with a
 * cache-buster at ~1.5s and ~4s. While the first byte is still in flight — including across
 * those retries — a quiet skeleton shimmer holds the frame so the visitor never sees the
 * broken/placeholder flash. Fixes "some pics don't appear until you reload".
 *
 * WHO OWNS THE FAILURE (the "photo coming soon beside real photos" bug, 2026-07-26):
 *  • `onUnavailable` given → this component renders NOTHING once every candidate is exhausted and
 *    tells the parent, which drops the tile from its surviving set. That is the ONLY correct
 *    behaviour inside a multi-photo band: a placeholder next to real pictures reads as broken.
 *  • no `onUnavailable` → legacy standalone behaviour, settle on the branded placeholder.
 * `fallbackSrcs` lets a single-tile surface (a card cover) walk to the next real photo before it
 * gives up, so a listing whose 0.jpg died still shows a photo instead of the coming-soon artwork.
 *
 * THROTTLED: every attempt takes a slot from lib/idx/media-queue first (see that file — a 48-tile
 * gallery used to fire 48 concurrent proxy requests and 429 the media host into manufacturing its
 * own placeholders). Retries are jittered so a wall of tiles that failed together does not come
 * back in lockstep. */
const RETRY_DELAYS_MS = [1500, 4000];
const RETRY_JITTER_MS = 1200;

export function MlsImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "object-cover",
  fallbackSrcs,
  throttle = false,
  maxRetries = RETRY_DELAYS_MS.length,
  onLoaded,
  onUnavailable,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Further candidates to try (in order) before declaring this tile unavailable. */
  fallbackSrcs?: readonly string[];
  /** Hold the FIRST attempt behind the media queue too. Set it on many-tile surfaces that mount
   * after hydration (the opened photo grid, the lightbox rail) — the handful of tiles rendered in
   * the server HTML must not be gated, or the page would ship with no photo at all without JS. */
  throttle?: boolean;
  /** How many times to retry before giving up. The full ladder is for a transient throttle; once
   * the page has already watched a photo die for good, further failures are almost certainly real
   * and a shorter ladder settles the gallery in seconds instead of half a minute. */
  maxRetries?: number;
  /** Called once the photo has actually rendered — lets an owner know the tile is real. */
  onLoaded?: () => void;
  /** Called once every candidate has failed. When provided, this renders nothing instead of
   * the branded placeholder — the parent owns the surviving set and removes the tile. */
  onUnavailable?: () => void;
}) {
  // `candidate` walks src → fallbackSrcs[0] → … ; `attempt` is the retry counter within one candidate.
  const [candidate, setCandidate] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const candidates = [src, ...(fallbackSrcs ?? [])];
  const current = candidates[Math.min(candidate, candidates.length - 1)];
  const bustedSrc = attempt === 0 ? current : `${current}${current.includes("?") ? "&" : "?"}r=${attempt}`;

  // One queue slot per attempt: the request waits until the queue says go, and the slot is handed
  // back the moment the attempt settles (or the tile unmounts). Every RETRY is queued even on an
  // unthrottled tile — that is what stops a wall of failed tiles re-bursting together.
  const needsSlot = throttle || attempt > 0 || candidate > 0;
  const [admitted, setAdmitted] = useState(!throttle);
  const releaseRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (failed) return;
    if (!needsSlot) {
      releaseRef.current = () => {};
      setAdmitted(true);
      return;
    }
    setAdmitted(false);
    // The hero (priority) is the photo the visitor is looking at — it jumps the rail.
    const release = requestMediaSlot(() => setAdmitted(true), priority);
    releaseRef.current = release;
    return release;
  }, [bustedSrc, needsSlot, failed, priority]);

  if (failed) return onUnavailable ? null : <NoPhoto />;

  return (
    <>
      {/* Skeleton shimmer while queued and until the first byte lands (and between silent
          retries) — never a flash of the placeholder. Static block for reduced-motion users. */}
      {!loaded && <div className="absolute inset-0 animate-pulse bg-mist motion-reduce:animate-none" aria-hidden />}
      {admitted && (
        <Image
          key={bustedSrc}
          src={bustedSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => {
            releaseRef.current();
            setLoaded(true);
            onLoaded?.();
          }}
          onError={() => {
            releaseRef.current();
            // Unmount the failed <img> immediately: an errored image is a "broken frame" in the
            // DOM (complete, naturalWidth 0) for as long as it hangs around between retries. The
            // skeleton holds the box instead.
            setAdmitted(false);
            if (attempt < Math.min(maxRetries, RETRY_DELAYS_MS.length)) {
              const wait = RETRY_DELAYS_MS[attempt] + Math.random() * RETRY_JITTER_MS;
              setTimeout(() => setAttempt((a) => a + 1), wait);
            } else if (candidate < candidates.length - 1) {
              // This photo is gone for good — walk to the next real candidate rather than
              // settling for the branded placeholder.
              setCandidate((c) => c + 1);
              setAttempt(0);
            } else {
              setFailed(true);
              onUnavailable?.();
            }
          }}
        />
      )}
    </>
  );
}
