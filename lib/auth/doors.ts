import "server-only";
import { getSupabaseConfig } from "@/lib/supabase/config";

/** Which account doors are actually open on the Supabase project right now. */
export interface AuthDoors {
  /** The project will accept a NEW account today (dashboard: allow new users to sign up). */
  signupOpen: boolean;
  /** Google OAuth is configured on the project. */
  google: boolean;
  /** Apple OAuth is configured on the project. */
  apple: boolean;
}

const SHUT: AuthDoors = { signupOpen: false, google: false, apple: false };

/** Cache the answer for a minute. It changes about once a year, and the header waits on this
 * call before it can render an honest control, so paying a round trip per page load would be
 * a visible cost for a constant. */
const TTL_MS = 60_000;
let cache: { at: number; doors: AuthDoors } | null = null;

/** ASK THE AUTH SERVER, DON'T CARRY A FLAG.
 *
 * Whether a visitor can create an account, and whether Google sign-in exists, are Supabase
 * DASHBOARD settings — not code and not env. A build-time constant for them rots the moment
 * the owner flips a toggle, in whichever direction hurts more: either the site keeps offering
 * a door that 422s, or it keeps hiding one that works. `/auth/v1/settings` is the same
 * unauthenticated endpoint the Supabase client library reads, so this is the project's own
 * answer, refreshed on its own.
 *
 * Anything we could not confirm counts as SHUT: the cost of hiding a working button for sixty
 * seconds is a visitor who calls us; the cost of showing a broken one is a visitor who thinks
 * we are broken. */
export async function getAuthDoors(): Promise<AuthDoors> {
  const cfg = getSupabaseConfig();
  if (!cfg) return SHUT;
  if (cache && Date.now() - cache.at < TTL_MS) return cache.doors;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/settings`, {
      headers: { apikey: cfg.anonKey },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`settings ${res.status}`);
    const s = (await res.json()) as {
      disable_signup?: boolean;
      external?: Record<string, boolean | undefined>;
    };
    const doors: AuthDoors = {
      signupOpen: s.disable_signup === false,
      google: s.external?.google === true,
      // Apple joined 2026-08-22 on the owner's ask. Same rule as Google and for the same measured
      // reason: `/auth/v1/settings` lists every provider the project knows about with a boolean,
      // so this is the project's own answer rather than a constant that rots when he flips a
      // dashboard toggle. Measured that day: disable_signup true, external.google false,
      // external.apple false — so the site correctly showed neither button and no signup.
      apple: s.external?.apple === true,
    };
    cache = { at: Date.now(), doors };
    return doors;
  } catch {
    return cache?.doors ?? SHUT;
  }
}

/** Tests only — the module-level cache would otherwise leak between cases. */
export function __resetAuthDoorsCache() {
  cache = null;
}
