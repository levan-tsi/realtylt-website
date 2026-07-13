import { NextResponse } from "next/server";
import { COUNTIES, type CountySlug } from "@/lib/site";
import { getCommittedSnapshot } from "@/lib/idx/snapshot";
import { TYPES } from "@/lib/idx/query";
import type { PropertyType } from "@/lib/idx";
import { computeMarketStats } from "@/lib/reports/market";

/** Current-market report for a county (optionally a town), computed live from the committed
 * MLS snapshot. No CRM round-trip: the client can run/refresh a real market report because
 * the whole active-listing set ships in the deploy bundle. */

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const county = q.get("county") as CountySlug | null;
  if (!county || !COUNTIES.some((c) => c.slug === county)) {
    return NextResponse.json({ error: "A valid county is required." }, { status: 400 });
  }
  const typeParam = q.get("propertyType") as PropertyType | null;
  const propertyType = typeParam && TYPES.includes(typeParam) ? typeParam : undefined;
  const town = (q.get("town") || "").trim().toLowerCase();

  const snap = getCommittedSnapshot();
  if (!snap) return NextResponse.json({ error: "Market data is unavailable." }, { status: 503 });

  const listings = snap.listings.filter((l) => {
    if (l.county !== county) return false;
    if (propertyType && l.propertyType !== propertyType) return false;
    if (town && l.city.toLowerCase() !== town) return false;
    return true;
  });

  // Distinct towns in the county — powers the town picker in the generator.
  const towns = Array.from(
    new Set(snap.listings.filter((l) => l.county === county).map((l) => l.city)),
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const stats = computeMarketStats(listings, snap.syncedAt);
  return NextResponse.json({ stats, towns });
}
