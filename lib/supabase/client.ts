"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/** The portal-typed client. We cast through the top-level supabase-js `SupabaseClient` type:
 * @supabase/ssr bundles a supabase-js whose generic arity differs from the top-level package,
 * so the `<Database>` schema doesn't reach `.from()` on its own — the cast restores typed
 * table access (the runtime object is unchanged). */
export type SupabaseBrowserClient = SupabaseClient<Database>;

/** Browser Supabase client (session stored in cookies via @supabase/ssr, so the auth
 * callback route handler can read it too). Created once by AuthProvider from the url/anonKey
 * the server layout passed down. */
export function createBrowserSupabase(url: string, anonKey: string): SupabaseBrowserClient {
  return createBrowserClient<Database>(url, anonKey) as unknown as SupabaseBrowserClient;
}
