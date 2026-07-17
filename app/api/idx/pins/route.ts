import { NextResponse } from "next/server";
import { getIdxClient, PIN_CAP } from "@/lib/idx";
import type { MapPin } from "@/lib/idx";
import { inBounds, parseBounds, parseFilterParams } from "@/lib/idx/query";

/** Map pins for the /search map. The SearchClient sends the current viewport box
 * (north/south/east/west) and gets back only the listings inside it, capped at PIN_CAP —
 * so a dense borough loads a small, fast payload instead of every match. `total` is the
 * true in-bounds count so the map can say "showing N of M — zoom in to see all". Without
 * a bbox the whole filtered set ships (backward-compatible). Same filter params as
 * /api/idx/search; paging/sort are ignored. Slim projection, never MLS Grid — every field
 * ships because the popup renders all of them (office = MLS "Listed with" line). */

/** Zip-centroid pins are approximate (the feed has no coordinates) — 4 decimals
 * (~11 m) is plenty, and trimming float noise cut the full-set payload ~10%
 * (1,081,085 → 972,484 bytes measured on the 5,360-pin snapshot). */
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  try {
    const client = getIdxClient();
    const filters = parseFilterParams(q);
    const bounds = parseBounds(q);

    let pins: MapPin[];
    let total: number;
    if (client.searchPins) {
      // DB-backed slim path — one bbox-scoped query (capped) when bounds are sent, else
      // the whole filtered set paged server-side (PostgREST caps a response at 1000 rows).
      const result = await client.searchPins(filters, bounds);
      pins = result.pins.map((p) => ({ ...p, lat: round4(p.lat), lng: round4(p.lng) }));
      total = result.total;
    } else {
      // Snapshot/fixture path (no DB): fetch the whole filtered set, then clip to the
      // viewport box and cap in-memory so the bounded contract matches the DB path.
      const result = await client.search({
        ...filters,
        page: 1,
        pageSize: Number.MAX_SAFE_INTEGER, // the whole filtered set, unpaged
      });
      let located: MapPin[] = result.listings
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
      if (bounds) {
        located = located.filter((p) => inBounds(p, bounds));
        total = located.length; // true in-bounds count
        located = located.slice(0, PIN_CAP);
      } else {
        total = result.total;
      }
      pins = located;
    }
    return NextResponse.json(
      { pins, total },
      // The store changes at most hourly — let the CDN absorb map traffic.
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (e) {
    console.error("[idx/pins]", e);
    return NextResponse.json({ error: "Pins are temporarily unavailable." }, { status: 502 });
  }
}
