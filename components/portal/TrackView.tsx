"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { sendActivity } from "@/lib/activity/beacon";

/** Records a `view_listing` activity event when a client opens a listing.
 *
 * Two mutually exclusive worlds, one mount point (round 51, D12):
 *  - SIGNED IN: the portal path, unchanged - track() writes portal_activity directly.
 *  - SIGNED OUT with a stamped lead identity (they submitted a form on this device): the
 *    anonymous beacon -> /api/activity -> the CRM's record_site_visit door. The beacon
 *    no-ops for strangers with no identity, so an anonymous visitor still sends nothing.
 * Waits for auth to settle (`ready`) before choosing, so a signed-in visitor is never
 * double-counted by the anon path racing the session load. Fires once per mounted listing. */
export function TrackView({
  listingId,
  meta,
}: {
  listingId: string;
  meta?: Record<string, unknown>;
}) {
  const { track, user, ready } = useAuth();
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (fired.current === listingId) return;
    fired.current = listingId;
    if (user) {
      track("view_listing", listingId, meta);
      return;
    }
    const m: Record<string, string | number> = {};
    for (const k of ["address", "city", "price"] as const) {
      const v = meta?.[k];
      if (typeof v === "string" || typeof v === "number") m[k] = v;
    }
    sendActivity("view_listing", { listingId, meta: m });
  }, [ready, user, listingId, track, meta]);

  return null;
}
