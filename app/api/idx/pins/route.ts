import { NextResponse } from "next/server";
import { getIdxClient } from "@/lib/idx";
import type { MapPin } from "@/lib/idx";
import { parseFilterParams } from "@/lib/idx/query";

/** Map pins for the ENTIRE filtered result set (not one grid page) — the /search map
 * plots every matching listing, Zillow-style, while the card grid stays at 12/page.
 * Same filter params as /api/idx/search; paging/sort are ignored. Payload is a slim
 * projection (~100 bytes/listing) served from the Blob snapshot — never MLS Grid. */

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  try {
    const result = await getIdxClient().search({
      ...parseFilterParams(q),
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER, // the whole filtered set, unpaged
    });
    const pins: MapPin[] = result.listings
      .filter((l) => l.lat && l.lng) // never ship Null Island rows
      .map((l) => ({
        id: l.id,
        price: l.price,
        lat: l.lat,
        lng: l.lng,
        address: l.address,
        city: l.city,
        zip: l.zip,
        beds: l.beds,
        baths: l.baths,
        office: l.listOfficeName,
      }));
    return NextResponse.json(
      { pins, total: result.total },
      // Snapshot changes at most a few times a day — let the CDN absorb map traffic.
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (e) {
    console.error("[idx/pins]", e);
    return NextResponse.json({ error: "Pins are temporarily unavailable." }, { status: 502 });
  }
}
