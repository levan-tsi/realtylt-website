import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import type { Database } from "@/lib/supabase/database.types";

/** Shape of the array @supabase/ssr passes to `setAll`. Annotated explicitly because a fresh
 * install can resolve the contextual param type to `any` under noImplicitAny (Vercel builds). */
type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Server Supabase client bound to the request cookies — used by the auth callback route to
 * exchange a code for a session and persist it. Returns null when Supabase is unconfigured. */
export async function createServerSupabase() {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(cfg.url, cfg.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component (read-only cookies) — safe to ignore; the browser
          // client refreshes the session on the next client render.
        }
      },
    },
  });
}
