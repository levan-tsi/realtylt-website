import { NextResponse } from "next/server";
import { COUNTIES, type CountySlug } from "@/lib/site";
import { getCommittedSnapshot } from "@/lib/idx/snapshot";
import { TYPES } from "@/lib/idx/query";
import type { PropertyType } from "@/lib/idx";
import type { Comp } from "@/lib/reports/types";

/** Comparable ACTIVE listings for a client CMA, sourced from the committed MLS snapshot
 * (no MLS/photo calls — the whole active set ships in the deploy bundle). The browser does
 * the valuation math (lib/reports/cma) so recalculation is instant; this route just returns
 * the candidate comp set nearest the subject. */

const MAX_COMPS = 24;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const county = q.get("county") as CountySlug | null;
  if (!county || !COUNTIES.some((c) => c.slug === county)) {
    return NextResponse.json({ error: "A valid county is required." }, { status: 400 });
  }
  const typeParam = q.get("propertyType") as PropertyType | null;
  const propertyType = typeParam && TYPES.includes(typeParam) ? typeParam : undefined;
  const beds = numOrUndef(q.get("beds"));
  const sqft = numOrUndef(q.get("sqft"));
  const town = (q.get("town") || "").trim().toLowerCase();

  const snap = getCommittedSnapshot();
  if (!snap) return NextResponse.json({ comps: [], dataLastUpdated: "" });

  const candidates = snap.listings.filter((l) => {
    if (l.county !== county) return false;
    if (l.price <= 0) return false;
    if (propertyType && l.propertyType !== propertyType) return false;
    if (beds != null && l.beds > 0 && Math.abs(l.beds - beds) > 1) return false;
    if (sqft != null && sqft > 0 && l.sqft > 0) {
      if (l.sqft < sqft * 0.6 || l.sqft > sqft * 1.5) return false;
    }
    return true;
  });

  // Rank: same-town first, then comps that actually carry a usable $/sqft (sqft>0) — a
  // zero-sqft OneKey multi-family/land row can't drive the estimate — then closest in sqft
  // (or lowest price when the subject sqft is unknown).
  const townRank = (city: string) => (town && city.toLowerCase() === town ? 0 : 1);
  const dist = (s: number) => (s > 0 && sqft != null && sqft > 0 ? Math.abs(s - sqft) : Infinity);
  const ranked = [...candidates].sort((a, b) => {
    const at = townRank(a.city);
    const bt = townRank(b.city);
    if (at !== bt) return at - bt;
    const au = a.sqft > 0 ? 0 : 1;
    const bu = b.sqft > 0 ? 0 : 1;
    if (au !== bu) return au - bu;
    if (sqft != null && sqft > 0) return dist(a.sqft) - dist(b.sqft);
    return a.price - b.price;
  });

  const comps: Comp[] = ranked.slice(0, MAX_COMPS).map((l) => ({
    id: l.id,
    address: l.address,
    city: l.city,
    price: l.price,
    beds: l.beds,
    baths: l.baths,
    sqft: l.sqft,
    pricePerSqft: l.sqft > 0 ? Math.round(l.price / l.sqft) : 0,
    propertyType: l.propertyType,
    listOfficeName: l.listOfficeName,
  }));

  return NextResponse.json({ comps, dataLastUpdated: snap.syncedAt });
}

function numOrUndef(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
