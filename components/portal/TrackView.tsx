"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

/** Records a `view_listing` activity event when a signed-in client opens a listing.
 * No-op when signed out. Fires once per mounted listing. */
export function TrackView({
  listingId,
  meta,
}: {
  listingId: string;
  meta?: Record<string, unknown>;
}) {
  const { track, user } = useAuth();
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (fired.current === listingId) return;
    fired.current = listingId;
    track("view_listing", listingId, meta);
  }, [user, listingId, track, meta]);

  return null;
}
