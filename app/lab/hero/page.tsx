import { getIdxClient } from "@/lib/idx";
import { type ValleyPoint } from "@/components/lab/HeroValley";
import { type TraverseHome } from "@/components/lab/HeroTraverse";
import { HeroStage } from "@/components/lab/HeroStage";

/** LOCAL DESIGN LAB — three candidate home-page heroes, side by side with the real thing.
 *
 * NOT PART OF THE SITE. Owner's instruction: "make it as a test locally to show me, dont deploy
 * or anything. if it will be good enough we will add, or keep working until it is, or just keep
 * vimeo video." So this route exists to be LOOKED AT and argued with, and the live hero is
 * untouched — app/page.tsx still plays the Vimeo clip exactly as before.
 *
 * noindex regardless of the PRELAUNCH flag, so it can never be found even if it does reach a
 * deploy. It is not linked from anywhere and it is not in the sitemap.
 *
 * Read docs/parity/HERO-LAB.md for what each variant is arguing and what it would cost. */
export const metadata = { robots: { index: false, follow: false } };
export const revalidate = 0;

const VALLEY = { north: 42.35, south: 40.9, east: -73.35, west: -74.75 };

/** Lat/lng for the light field. PostgREST returns at most 1000 rows a request, so this pages;
 * 6,000 dots draw comfortably at 60fps and are far past the point where the valley reads. */
async function valleyPoints(): Promise<ValleyPoint[]> {
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!base || !key) return [];
  const out: ValleyPoint[] = [];
  for (let page = 0; page < 6; page++) {
    const url =
      `${base}/rest/v1/idx_listings?is_active=eq.true&property_type=neq.Rental&price=gt.0` +
      `&lat=gt.${VALLEY.south}&lat=lt.${VALLEY.north}&lng=gt.${VALLEY.west}&lng=lt.${VALLEY.east}` +
      `&select=lat,lng,price,city&order=id.asc&limit=1000&offset=${page * 1000}`;
    const r = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000),
    }).catch(() => null);
    if (!r?.ok) break;
    const rows = (await r.json()) as ValleyPoint[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

export default async function HeroLab() {
  const idx = getIdxClient();

  // The valley field: real coordinates for real active listings. Capped — the point is made
  // long before ten thousand dots, and the canvas stays cheap.
  // Read the coordinates DIRECTLY rather than through searchPins. Two reasons, both learned
  // the hard way here: the bounded path caps at PIN_CAP = 800, which renders as a faint
  // scatter (the valley's SHAPE is the whole argument for this variant and it only emerges
  // with density), and the unbounded path returned nothing at this size. A lab page reading
  // four columns straight out of PostgREST is honest; this is not a production path and it
  // must not become one without going back through the real client.
  const points = await valleyPoints();

  // The traverse set: only homes whose photos are ALREADY mirrored into our own Storage, so
  // hovering never touches the MLS media host.
  let homes: TraverseHome[] = [];
  try {
    const r = await idx.search({ pageSize: 24, sort: "featured" });
    homes = r.listings
      .filter((l) => (l.photoCount ?? 0) > 0 && l.photos[0])
      .slice(0, 8)
      .map((l) => ({ id: l.id, photo: l.photos[0], address: l.address, city: l.city, price: l.price }));
  } catch {
    homes = [];
  }

  return <HeroStage points={points} homes={homes} />;
}
