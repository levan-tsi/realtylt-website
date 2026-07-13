import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/** Auth redirect target for magic links, email confirmations, password resets, and OAuth.
 * Exchanges the `code` for a session (persisted to cookies) then bounces to `next` (default
 * the portal). Same-origin `next` only, so an attacker can't turn this into an open redirect. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/portal";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/portal";

  if (code) {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(new URL("/?auth_error=1", url.origin));
      }
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
