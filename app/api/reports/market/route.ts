import { NextResponse } from "next/server";
import { SERVED_AREAS, type CountySlug } from "@/lib/site";
import { getCountyActiveSlim } from "@/lib/idx/db";
import { getCommittedSnapshot } from "@/lib/idx/snapshot";
import { TYPES } from "@/lib/idx/query";
import type { PropertyType } from "@/lib/idx";
import { computeMarketStats } from "@/lib/reports/market";

/** Current-market report for a county (optionally a town) — DB first (Supabase
 * idx_listings, kept current by the hourly sync), committed snapshot as the fallback.
 * No CRM round-trip: the client can run/refresh a real market report on demand. */

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const county = q.get("county") as CountySlug | null;
  if (!county || !SERVED_AREAS.some((c) => c.slug === county)) {
    return NextResponse.json({ error: "A valid county is required." }, { status: 400 });
  }
  const typeParam = q.get("propertyType") as PropertyType | null;
  const propertyType = typeParam && TYPES.includes(typeParam) ? typeParam : undefined;
  const town = (q.get("town") || "").trim().toLowerCase();

  const db = await getCountyActiveSlim(county);
  const snap = db ? null : getCommittedSnapshot();
  if (!db && !snap) return NextResponse.json({ error: "Market data is unavailable." }, { status: 503 });

  const countyRows = db ? db.rows : (snap?.listings ?? []).filter((l) => l.county === county);
  const dataLastUpdated = db?.dataLastUpdated ?? snap?.syncedAt ?? "";

  const listings = countyRows.filter((l) => {
    if (propertyType && l.propertyType !== propertyType) return false;
    if (town && l.city.toLowerCase() !== town) return false;
    return true;
  });

  // Distinct towns in the county — powers the town picker in the generator.
  const towns = Array.from(new Set(countyRows.map((l) => l.city)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const stats = computeMarketStats(listings, dataLastUpdated);
  return NextResponse.json({ stats, towns });
}
