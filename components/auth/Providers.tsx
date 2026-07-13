import type { ReactNode } from "react";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SavedProvider } from "@/components/auth/SavedProvider";

/** Server wrapper: reads the anon Supabase config server-side and hands it to the client
 * auth/saved providers. When Supabase is unconfigured, the providers render in an inert
 * "accounts disabled" state and the site still works (device-local saves only). */
export function Providers({ children }: { children: ReactNode }) {
  const cfg = getSupabaseConfig();
  return (
    <AuthProvider url={cfg?.url ?? null} anonKey={cfg?.anonKey ?? null}>
      <SavedProvider>{children}</SavedProvider>
    </AuthProvider>
  );
}
