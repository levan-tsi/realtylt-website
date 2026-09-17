/** THE CRM DOOR'S CONTRACT — record_site_visit, as the CRM session published it 2026-09-17
 * (realtylt-crm docs/handoff/SITE-VISITS-ANON-2026-09-17.md). Kept here as ONE pure module so
 * the API route, the beacon and the tests cannot drift from each other or from the door.
 *
 * The call (SERVER-SIDE ONLY, /api/activity is the only caller):
 *   POST {SUPABASE_URL}/rest/v1/rpc/record_site_visit  (anon key)
 *   { p_secret, p_email, p_phone, p_type, p_path, p_listing_id, p_meta }
 *   -> { matched: boolean }   matched:false = no such contact yet; a NO-OP, never retried.
 *
 * Identity: email and/or phone; exact email beats phone; oldest contact wins (the CRM's 0247
 * rule). Meta keys the door keeps: address/city/price (listing fallback), title/label, kind —
 * everything else is dropped server-side, so we drop it client-side too and never ship more. */

export const ACTIVITY_TYPES = [
  "view_page",
  "view_listing",
  "submit_form",
  "save_listing",
  "view_report",
  "generate_report",
  "raise_hand",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const META_KEYS = ["address", "city", "price", "title", "label", "kind"] as const;

export interface ActivityBeacon {
  type: ActivityType;
  path: string;
  listingId?: string;
  meta?: Record<string, string | number>;
  email?: string;
  phone?: string;
}

const str = (v: unknown, max: number): string | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
};

/** Parse an untrusted request body into a beacon, or say why not. The route answers a plain
 * 400 for `null`; nothing here throws. */
export function parseBeacon(body: unknown): ActivityBeacon | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const type = typeof b.type === "string" && (ACTIVITY_TYPES as readonly string[]).includes(b.type) ? (b.type as ActivityType) : null;
  const path = str(b.path, 300);
  if (!type || !path || !path.startsWith("/")) return null;
  const email = str(b.email, 200)?.toLowerCase();
  const phone = str(b.phone, 40);
  if ((!email || !email.includes("@")) && !phone) return null;
  const listingId = str(b.listingId, 40);
  let meta: Record<string, string> | undefined;
  if (b.meta && typeof b.meta === "object") {
    meta = {};
    for (const k of META_KEYS) {
      const v = str((b.meta as Record<string, unknown>)[k], 200);
      if (v !== undefined) meta[k] = v;
    }
    if (Object.keys(meta).length === 0) meta = undefined;
  }
  return {
    type,
    path,
    ...(email && email.includes("@") ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(listingId ? { listingId } : {}),
    ...(meta ? { meta } : {}),
  };
}

/** The exact RPC body the door expects. */
export function buildRpcBody(beacon: ActivityBeacon, secret: string): Record<string, unknown> {
  return {
    p_secret: secret,
    p_email: beacon.email ?? null,
    p_phone: beacon.phone ?? null,
    p_type: beacon.type,
    p_path: beacon.path,
    p_listing_id: beacon.listingId ?? null,
    p_meta: beacon.meta ?? {},
  };
}
