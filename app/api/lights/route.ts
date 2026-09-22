import { NextResponse } from "next/server";
import { getLightRows, isDbConfigured } from "@/lib/idx/db";
import { packLights } from "@/lib/idx/lights";
import { SERVED_REGION } from "@/components/idx/county-bounds";

/** The home hero's light map (round 53): every active for-sale home's position, packed
 * (lib/idx/lights.ts). A STATIC route regenerated at most once an hour, so the database sees one
 * read an hour however many people open the home page, and nothing here ever reaches MLS Grid.
 * The hero asks for it after first paint; if it fails the hero keeps its poster. */
export const revalidate = 3600;

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ v: 1, box: SERVED_REGION, data: "", towns: [], counts: [] });
  try {
    const rows = await getLightRows();
    return NextResponse.json(packLights(rows, SERVED_REGION));
  } catch {
    // An empty answer, not an error: the hero's poster already shows the lights.
    return NextResponse.json({ v: 1, box: SERVED_REGION, data: "", towns: [], counts: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
