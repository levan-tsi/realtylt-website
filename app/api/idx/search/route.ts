import { NextResponse } from "next/server";
import { getIdxClient, isFixtureMode } from "@/lib/idx";
import type { PropertyType, SearchParams, SortKey } from "@/lib/idx";
import { COUNTIES, type CountySlug } from "@/lib/site";

const SORTS: SortKey[] = ["newest", "price-asc", "price-desc"];
const TYPES: PropertyType[] = ["Residential", "Multi-Family"];

function num(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const county = q.get("county") as CountySlug | null;
  const sort = q.get("sort") as SortKey | null;
  const type = q.get("propertyType") as PropertyType | null;

  const params: SearchParams = {
    q: q.get("q")?.slice(0, 100) || undefined,
    county: county && COUNTIES.some((c) => c.slug === county) ? county : undefined,
    priceMin: num(q.get("priceMin")),
    priceMax: num(q.get("priceMax")),
    bedsMin: num(q.get("bedsMin")),
    bathsMin: num(q.get("bathsMin")),
    sqftMin: num(q.get("sqftMin")),
    propertyType: type && TYPES.includes(type) ? type : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    page: num(q.get("page")),
    pageSize: Math.min(num(q.get("pageSize")) ?? 12, 100),
  };

  try {
    const result = await getIdxClient().search(params);
    return NextResponse.json({ ...result, fixtureMode: isFixtureMode() });
  } catch (e) {
    console.error("[idx/search]", e);
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 502 });
  }
}
