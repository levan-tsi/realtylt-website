import { NextResponse } from "next/server";
import { DEFAULT_PAGE_SIZE, getIdxClient, isSampleData, MAX_PAGE_SIZE } from "@/lib/idx";
import type { SearchParams, SortKey } from "@/lib/idx";
import { num, parseFilterParams, SORTS } from "@/lib/idx/query";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;

  const sort = q.get("sort") as SortKey | null;

  const params: SearchParams = {
    ...parseFilterParams(q),
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    // Clamp to ≥1 — page/pageSize of 0 pass the `>= 0` check but break paging math
    // (Math.ceil(total / 0) = Infinity → totalPages serializes as null).
    page: Math.max(1, num(q.get("page")) ?? 1),
    pageSize: Math.min(Math.max(1, num(q.get("pageSize")) ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
  };

  try {
    const result = await getIdxClient().search(params);
    return NextResponse.json({ ...result, fixtureMode: isSampleData() });
  } catch (e) {
    console.error("[idx/search]", e);
    return NextResponse.json({ error: "Search is temporarily unavailable." }, { status: 502 });
  }
}
