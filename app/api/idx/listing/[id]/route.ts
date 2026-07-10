import { NextResponse } from "next/server";
import { getIdxClient, isFixtureMode } from "@/lib/idx";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const listing = await getIdxClient().getListing(id);
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    return NextResponse.json({ listing, fixtureMode: isFixtureMode() });
  } catch (e) {
    console.error("[idx/listing]", e);
    return NextResponse.json({ error: "Listing is temporarily unavailable." }, { status: 502 });
  }
}
