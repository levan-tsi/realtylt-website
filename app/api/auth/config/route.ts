import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

// Runtime-only: reads the anon Supabase config per-request so it works even when the env vars
// are runtime-only (not available at build). The anon key is publishable (RLS-protected), so
// returning it to the browser is equivalent to a NEXT_PUBLIC var.
export const dynamic = "force-dynamic";

export function GET() {
  const cfg = getSupabaseConfig();
  if (!cfg) return NextResponse.json({ enabled: false }, { headers: { "cache-control": "no-store" } });
  return NextResponse.json(
    { enabled: true, url: cfg.url, anonKey: cfg.anonKey },
    { headers: { "cache-control": "no-store" } },
  );
}
