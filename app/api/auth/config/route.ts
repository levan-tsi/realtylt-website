import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getAuthDoors } from "@/lib/auth/doors";

// Runtime-only: reads the anon Supabase config per-request so it works even when the env vars
// are runtime-only (not available at build). The anon key is publishable (RLS-protected), so
// returning it to the browser is equivalent to a NEXT_PUBLIC var.
//
// It also carries WHICH DOORS ARE OPEN (see lib/auth/doors.ts), because the browser has to
// know that before it can decide whether "Sign up" and "Continue with Google" are honest
// controls or dead ends. Both default to false, so a failure here hides options rather than
// offering broken ones.
export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = getSupabaseConfig();
  if (!cfg) return NextResponse.json({ enabled: false }, { headers: { "cache-control": "no-store" } });
  const doors = await getAuthDoors();
  return NextResponse.json(
    { enabled: true, url: cfg.url, anonKey: cfg.anonKey, signupOpen: doors.signupOpen, google: doors.google },
    { headers: { "cache-control": "no-store" } },
  );
}
