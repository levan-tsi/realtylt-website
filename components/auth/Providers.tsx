import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SavedProvider } from "@/components/auth/SavedProvider";

/** Client account layer. AuthProvider fetches the anon Supabase config at runtime
 * (/api/auth/config) so it works even when the env vars are runtime-only. When Supabase is
 * unconfigured the providers stay inert and the site still works (device-local saves only). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>{children}</SavedProvider>
    </AuthProvider>
  );
}
