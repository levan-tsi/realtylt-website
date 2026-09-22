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
  // ACTIVE ONLY, because that is the question /search answers.
  //
  // This index counted every row of every status, and the dropdown printed that number as
  // "128 homes" next to a town the results page then showed 75 of. /search defaults to
  // quick=active (lib/idx/query.ts, owner's call 2026-08-06, because 41% of the default scope
  // was Pending and nothing on the page said so). A suggestion that promises a bigger number
  // than the page it leads to is a suggestion that makes the page look broken. Measured today:
  // 27,632 rows in the table, 17,727 of them Active; Beacon 158 against 116.
  //
  // It closes a second hole for free. The 20-page cap silently truncated at 20,000 of 27,632
  // rows in id.asc order, so every town late in that order was undercounted as well as
  // over-counted — Beacon suggested 128 rather than either true figure. Active fits in 18
  // pages, and the cap is now 40 so it keeps fitting; the page count comes from the exact total,
  // so the extra headroom costs nothing until the inventory needs it.
  //
  // IN PARALLEL since round 53. The pages used to be fetched one after another (18 of them, a
  // few hundred ms each), so a cold instance spent seconds building while the first keystrokes
  // were answered from the 350ms race below without any towns: typing "Pough" offered four
  // street addresses and not Poughkeepsie (3 of 6 cold runs in a fresh-eyes review). The first
  // page now also asks for the exact count, and every other page is fetched at once.
  const base = `${url.replace(/\/+$/, "")}/rest/v1/idx_listings?select=city,zip&status=eq.Active&order=id.asc&limit=1000`;
  const page = async (n: number, count = false) => {
    const res = await fetch(`${base}&offset=${n * 1000}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, ...(count ? { Prefer: "count=exact" } : {}) },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok && res.status !== 416) throw new Error(`suggest index: Supabase REST ${res.status}`);
    const total = Number(res.headers.get("content-range")?.split("/")[1]);
    return { rows: res.status === 416 ? [] : ((await res.json()) as { city?: string; zip?: string }[]), total };
  };
  const first = await page(0, true);
  const pageCount = Math.min(40, Math.ceil((Number.isFinite(first.total) ? first.total : 40_000) / 1000));
  const rest = await Promise.all(Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => page(i + 1).then((r) => r.rows)));
  for (const rows of [first.rows, ...rest]) {
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
    // 800ms, up from 350 (round 53): with the pages now fetched in parallel a cold build is two
    // round trips, so this wait usually ends with the towns in hand instead of without them.
    await Promise.race([indexBuilding, new Promise((r) => setTimeout(r, 800))]);
  }
  // Lost that race: this answer has counties and addresses but no towns. Say so, and the box asks
  // once more a moment later (round 53 walkthrough: typing "Beacon" on a fresh server offered four
  // Beacon street addresses and not Beacon, and nothing refreshed the list until another key).
  const partial = indexBuilding !== null && cityIndex.length === 0;

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
  return NextResponse.json({ suggestions: ordered.slice(0, 8), ...(partial ? { partial: true } : {}) });
}
