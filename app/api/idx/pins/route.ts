import { NextResponse } from "next/server";
import { getIdxClient } from "@/lib/idx";
import type { MapPin } from "@/lib/idx";
import { parseFilterParams } from "@/lib/idx/query";

/** Map pins for the ENTIRE filtered result set (not one grid page) — the /search map
 * plots every matching listing, Zillow-style, while the card grid stays at 12/page.
 * Same filter params as /api/idx/search; paging/sort are ignored. Payload is a slim
 * projection served from the committed snapshot — never MLS Grid. Every field ships
 * because the popup renders all of them (office = MLS compliance "Listed with" line). */

/** Zip-centroid pins are approximate (the feed has no coordinates) — 4 decimals
 * (~11 m) is plenty, and trimming float noise cut the full-set payload ~10%
 * (1,081,085 → 972,484 bytes measured on the 5,360-pin snapshot). */
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

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
        lat: round4(l.lat),
        lng: round4(l.lng),
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
