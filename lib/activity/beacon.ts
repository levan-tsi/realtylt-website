"use client";

import { readLeadIdentity, stampLeadIdentity } from "./identity";
import type { ActivityType } from "./contract";

/** THE ANONYMOUS ACTIVITY BEACON (round 51, D12): a visitor who filled a form but has no
 * account gets their meaningful actions onto their CRM record, the way Brivity does it.
 *
 * Fires ONLY when a lead identity is stamped (a real submit happened on this device) — an
 * anonymous stranger sends nothing, exactly as before. Signed-in visitors are the CALLER'S
 * responsibility to exclude (TrackView's signed-in path already records them; firing both
 * would double-count). One beacon per (type, path, listingId) per page load; keepalive so a
 * navigation right after a click does not lose the event. Fire-and-forget: no retries, no
 * blocking, and matched:false server-side is a no-op by contract. */

const fired = new Set<string>();

export function sendActivity(
  type: ActivityType,
  opts: { path?: string; listingId?: string; meta?: Record<string, string | number> } = {},
): void {
  if (typeof window === "undefined") return;
  const identity = readLeadIdentity();
  if (!identity) return;
  const path = opts.path ?? window.location.pathname;
  const key = `${type}|${path}|${opts.listingId ?? ""}`;
  if (fired.has(key)) return;
  fired.add(key);
  try {
    void fetch("/api/activity", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        path,
        listingId: opts.listingId,
        meta: opts.meta,
        email: identity.email,
        phone: identity.phone,
      }),
    }).catch(() => {});
  } catch {
    /* never let tracking break a page */
  }
}

/** The submit-moment pair: remember who this device belongs to, then record the submit
 * itself. Called from the lead surfaces right after the CRM accepted the lead. */
export function stampAndRecordSubmit(
  id: { email?: string; phone?: string },
  opts: { path?: string; listingId?: string; kind?: string } = {},
): void {
  stampLeadIdentity(id);
  sendActivity("submit_form", {
    path: opts.path,
    listingId: opts.listingId,
    meta: opts.kind ? { kind: opts.kind } : undefined,
  });
}
