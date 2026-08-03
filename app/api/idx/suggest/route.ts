import { NextResponse } from "next/server";
import { SERVED_AREAS } from "@/lib/site";
import { listingPath } from "@/lib/idx/listing-url";
import { addressFilterClause, addressTokens } from "@/lib/idx/address-query";

/** Location autocomplete for the hero + search inputs — live-site parity (its quick-search
 * suggests areas as you type). Suggestions come from OUR replicated inventory: county names
 * (static), then cities and ZIPs read once from the idx_listings generated columns and
 * cached in-instance for an hour. No external API, no per-keystroke DB work. */

export const dynamic = "force-dynamic";

interface Suggestion {
  label: string;
  /** What the search page should receive. */
  q: string;
  kind: "county" | "city" | "zip" | "address";
  count?: number;
  /** Direct href when the suggestion maps to a first-class filter (county). */
  href?: string;
  /** County slug for county suggestions — the search page filters instead of free-texting. */
  county?: string;
}

const INDEX_TTL_MS = 60 * 60 * 1000;
let indexBuiltAt = 0;
let indexBuilding: Promise<void> | null = null;
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

/** Live address lookup against our own replicated inventory. Active rows only — suggesting a
 * home that sold last spring would be worse than suggesting nothing. Never throws: a failed
 * lookup degrades to area suggestions rather than breaking the keystroke. */
async function addressMatches(q: string, limit: number) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return [];
  // Tokenising and the filter body live in lib/idx/address-query.ts — this is the only place on
  // the site where a visitor's raw keystrokes are concatenated into a PostgREST filter, so it is
  // unit-tested there rather than reasoned about here.
  const tokens = addressTokens(q);
  if (!tokens.length) return [];
  const clause = addressFilterClause(tokens);
  try {
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/rest/v1/idx_listings` +
        `?select=id,address,city,zip&status=eq.Active&and=(${clause})` +
        `&order=address.asc&limit=${limit}`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(2_500),
      },
    );
    if (!res.ok) return [];
    return (await res.json()) as { id: string; address: string; city: string; zip: string }[];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  // Never block a keystroke on the index build (cold instances took seconds and served
  // NOTHING). Counties answer instantly; cities/zips join as soon as the build lands —
  // briefly wait for an in-flight build so the second keystroke usually gets everything.
  if (Date.now() - indexBuiltAt > INDEX_TTL_MS && !indexBuilding) {
    indexBuilding = buildIndex()
      .catch(() => {})
      .finally(() => {
        indexBuilding = null;
      });
  }
  if (indexBuilding && cityIndex.length === 0) {
    await Promise.race([indexBuilding, new Promise((r) => setTimeout(r, 350))]);
  }

  const out: Suggestion[] = [];
  // Borough areas ("The Bronx") and their postal cities ("Bronx") would double up —
  // the county entry wins, the duplicate city row is skipped.
  const areaNames = new Set(
    SERVED_AREAS.flatMap((c) => [c.name.toLowerCase(), c.name.toLowerCase().replace(/^the /, "")]),
  );
  for (const c of SERVED_AREAS) {
    if (c.name.toLowerCase().includes(q)) {
      out.push({ label: `${c.name}, NY`, q: c.name, kind: "county", href: `/search?county=${c.slug}`, county: c.slug });
    }
  }
  for (const c of cityIndex) {
    if (out.length >= 8) break;
    if (c.name.toLowerCase().startsWith(q) && !areaNames.has(c.name.toLowerCase())) {
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

  // ── ADDRESSES. The owner's ask: typing a street address should find that home, not just its
  // town. Areas alone means somebody who knows exactly which house they want has to search the
  // whole county and scroll for it.
  //
  // Deliberately NOT part of the cached index: there are ~27,600 active listings and holding
  // every address in instance memory to answer a keystroke is the wrong trade. This is one
  // indexed ILIKE against a column we already store, capped at 4 rows, and it only runs when
  // the query actually looks like an address (a house number, or long enough to be a street
  // name) — so ordinary town typing never pays for it.
  const looksLikeAddress = /^\d+\s+\S/.test(q) || (q.length >= 4 && /[a-z]/.test(q));
  if (looksLikeAddress && out.length < 8) {
    const addrs = await addressMatches(q, 4);
    for (const a of addrs) {
      if (out.length >= 8) break;
      out.push({
        label: `${a.address}, ${a.city}`,
        q: a.address,
        kind: "address",
        href: listingPath({ id: a.id, address: a.address, city: a.city, zip: a.zip }),
      });
    }
  }

  // An exact house match is what they meant. Put addresses first when the query opened with a
  // house number; otherwise areas still lead, because "Beacon" is a town before it is a street.
  const startsWithNumber = /^\d+\s+\S/.test(q);
  const ordered = startsWithNumber
    ? [...out.filter((s) => s.kind === "address"), ...out.filter((s) => s.kind !== "address")]
    : out;
  return NextResponse.json({ suggestions: ordered.slice(0, 8) });
}
