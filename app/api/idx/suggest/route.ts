import { NextResponse } from "next/server";
import { SERVED_AREAS } from "@/lib/site";

/** Location autocomplete for the hero + search inputs — live-site parity (its quick-search
 * suggests areas as you type). Suggestions come from OUR replicated inventory: county names
 * (static), then cities and ZIPs read once from the idx_listings generated columns and
 * cached in-instance for an hour. No external API, no per-keystroke DB work. */

export const dynamic = "force-dynamic";

interface Suggestion {
  label: string;
  /** What the search page should receive. */
  q: string;
  kind: "county" | "city" | "zip";
  count?: number;
  /** Direct href when the suggestion maps to a first-class filter (county). */
  href?: string;
  /** County slug for county suggestions — the search page filters instead of free-texting. */
  county?: string;
}

const INDEX_TTL_MS = 60 * 60 * 1000;
let indexBuiltAt = 0;
let cityIndex: { name: string; count: number }[] = [];
let zipIndex: { zip: string; city: string; count: number }[] = [];

async function buildIndex(): Promise<void> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return;
  const cities = new Map<string, number>();
  const zips = new Map<string, { city: string; count: number }>();
  for (let page = 0; page < 20; page++) {
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/rest/v1/idx_listings?select=city,zip&order=id.asc&limit=1000&offset=${page * 1000}`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) throw new Error(`suggest index: Supabase REST ${res.status}`);
    const rows = (await res.json()) as { city?: string; zip?: string }[];
    for (const r of rows) {
      const city = r.city?.trim();
      const zip = r.zip?.trim();
      if (city) cities.set(city, (cities.get(city) ?? 0) + 1);
      if (zip && /^\d{5}$/.test(zip)) {
        const cur = zips.get(zip);
        if (cur) cur.count += 1;
        else zips.set(zip, { city: city ?? "", count: 1 });
      }
    }
    if (rows.length < 1000) break;
  }
  cityIndex = [...cities.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  zipIndex = [...zips.entries()]
    .map(([zip, v]) => ({ zip, city: v.city, count: v.count }))
    .sort((a, b) => b.count - a.count);
  indexBuiltAt = Date.now();
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  if (Date.now() - indexBuiltAt > INDEX_TTL_MS) {
    try {
      await buildIndex();
    } catch {
      // stale (or empty) index still serves; counties below never depend on the DB
    }
  }

  const out: Suggestion[] = [];
  for (const c of SERVED_AREAS) {
    if (c.name.toLowerCase().includes(q)) {
      out.push({ label: `${c.name}, NY`, q: c.name, kind: "county", href: `/search?county=${c.slug}`, county: c.slug });
    }
  }
  for (const c of cityIndex) {
    if (out.length >= 8) break;
    if (c.name.toLowerCase().startsWith(q)) {
      out.push({ label: `${c.name}, NY`, q: c.name, kind: "city", count: c.count });
    }
  }
  if (/^\d{2,5}$/.test(q)) {
    for (const z of zipIndex) {
      if (out.length >= 8) break;
      if (z.zip.startsWith(q)) {
        out.push({ label: `${z.zip} (${z.city})`, q: z.zip, kind: "zip", count: z.count });
      }
    }
  }
  return NextResponse.json({ suggestions: out.slice(0, 8) });
}
