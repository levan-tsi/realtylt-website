import "server-only";

/** Supabase project URL + anon key, read server-side from the same env the blog uses
 * (`SUPABASE_URL` / `SUPABASE_ANON_KEY` — already configured in Vercel). The anon key is
 * publishable (RLS-protected), so it is safe to hand to the browser client as a prop; we do
 * that from the server layout rather than minting NEXT_PUBLIC_* vars. Returns null when
 * unconfigured so the whole account layer degrades gracefully (site still renders). */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
