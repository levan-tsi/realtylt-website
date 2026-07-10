import { NextResponse } from "next/server";
import { DEFAULT_PAGE_SIZE, getIdxClient, isFixtureMode, MAX_PAGE_SIZE } from "@/lib/idx";
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
    // Clamp to ≥1 — page/pageSize of 0 pass the `>= 0` check but break paging math
    // (Math.ceil(total / 0) = Infinity → totalPages serializes as null).
    page: Math.max(1, num(q.get("page")) ?? 1),
    pageSize: Math.min(Math.max(1, num(q.get("pageSize")) ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
  };

  try {
    const result = await getIdxClient().search(params);
    return NextResponse.json({ ...result, fixtureMode: isFixtureMode() });
  } catch (e) {
    console.error("[idx/search]", e);
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 502 });
  }
}
