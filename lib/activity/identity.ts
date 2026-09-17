/** THE LEAD IDENTITY STAMP — how a visitor who filled a form but has no account stays
 * recognisable to the activity beacons (round 51, D12: Brivity tracks a lead from the moment a
 * form is submitted; we now do the same).
 *
 * Written at the ONE moment identity is honestly known: a successful lead submit (the person
 * just typed this email/phone into our form). Device-local (localStorage), their own data on
 * their own device, same idea as the saved-homes store. Never read server-side; the beacon
 * carries it to /api/activity, which is the only thing that talks to the CRM's door.
 *
 * Storage is injectable so the pure logic is testable in the node test environment; the
 * default export pair uses window.localStorage and swallows storage failures (Safari private
 * mode throws on write, and tracking is never worth breaking a page over). */

export interface LeadIdentity {
  email?: string;
  phone?: string;
  /** ISO of the submit that stamped it. */
  at: string;
}

export const IDENTITY_KEY = "rlt:lead-identity:v1";

/** 90 days: long enough to follow a real house hunt, short enough that a shared computer does
 * not attribute a stranger's browsing forever. */
export const IDENTITY_TTL_MS = 90 * 24 * 3600 * 1000;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function parseIdentity(raw: string | null, now: number): LeadIdentity | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!v || typeof v !== "object") return null;
  const o = v as Partial<LeadIdentity>;
  const email = typeof o.email === "string" && o.email.includes("@") ? o.email.trim().toLowerCase().slice(0, 200) : undefined;
  const phone = typeof o.phone === "string" && o.phone.trim() ? o.phone.trim().slice(0, 40) : undefined;
  if (!email && !phone) return null;
  const at = typeof o.at === "string" ? Date.parse(o.at) : NaN;
  if (!Number.isFinite(at) || now - at > IDENTITY_TTL_MS) return null;
  return { email, phone, at: new Date(at).toISOString() };
}

export function stampIdentityIn(store: StorageLike, id: { email?: string; phone?: string }, now: number): void {
  const email = id.email?.trim().toLowerCase();
  const phone = id.phone?.trim();
  if (!email && !phone) return;
  try {
    store.setItem(IDENTITY_KEY, JSON.stringify({ email, phone, at: new Date(now).toISOString() }));
  } catch {
    /* storage unavailable — the visitor simply stays anonymous */
  }
}

export function readIdentityFrom(store: StorageLike, now: number): LeadIdentity | null {
  try {
    return parseIdentity(store.getItem(IDENTITY_KEY), now);
  } catch {
    return null;
  }
}

/** Browser conveniences. */
export function stampLeadIdentity(id: { email?: string; phone?: string }): void {
  if (typeof window === "undefined") return;
  stampIdentityIn(window.localStorage, id, Date.now());
}

export function readLeadIdentity(): LeadIdentity | null {
  if (typeof window === "undefined") return null;
  return readIdentityFrom(window.localStorage, Date.now());
}
