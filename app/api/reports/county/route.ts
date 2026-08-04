import { NextResponse } from "next/server";
import { SERVED_AREAS, type CountySlug } from "@/lib/site";
import { getCountyActiveSlim } from "@/lib/idx/db";
import { getCommittedSnapshot } from "@/lib/idx/snapshot";

/** WHICH COUNTY IS THIS TOWN IN?
 *
 * The CMA generator defaulted its county to Dutchess and never derived it from the address it
 * had been handed. Measured on our own data, that is not a cosmetic default — it silently
 * values the wrong market:
 *
 *   Yonkers home, county=dutchess  -> 24 comps in Beacon/Fishkill/Hyde Park, median $312/sq ft
 *   Yonkers home, county=westchester -> 24 comps in Yonkers,                median $426/sq ft
 *
 * On an 1,800 sq ft home that is roughly $562,000 against $767,000, on a page whose entire
 * purpose is the number, under a heading naming the seller's own street.
 *
 * So the town decides the county, from our own inventory rather than a hand-written table that
 * would drift the first time a new town appeared in the feed. Answers are cached in-instance:
 * the mapping only changes when a town gains its first listing.
 */

const TTL_MS = 60 * 60 * 1000;
type TownFacts = { county: CountySlug | null; medianSqft: number | null };
const cache = new Map<string, { facts: TownFacts; at: number }>();

const median = (xs: number[]) =>
  xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : null;

export async function GET(req: Request) {
  const town = (new URL(req.url).searchParams.get("town") || "").trim().toLowerCase();
  const empty: TownFacts = { county: null, medianSqft: null };
  if (town.length < 2) return NextResponse.json(empty);

  const hit = cache.get(town);
  if (hit && Date.now() - hit.at < TTL_MS) return NextResponse.json(hit.facts);

  // Same DB-first, snapshot-fallback shape as the comps route, and the same guarantee: no MLS
  // call on a request path, ever.
  let facts: TownFacts = empty;
  for (const area of SERVED_AREAS) {
    const db = await getCountyActiveSlim(area.slug as CountySlug);
    const inTown = (db?.rows ?? []).filter((l) => l.city.trim().toLowerCase() === town);
    if (inTown.length) {
      facts = {
        county: area.slug as CountySlug,
        // Median over EVERY active home in the town, not over a comp set. The comps route,
        // asked without a subject size, ranks by lowest price — so its median is the median of
        // the town's cheapest two dozen listings (600 sq ft of co-op in Yonkers), which is not
        // what "typical for homes near you" means to a person about to value a house.
        medianSqft: median(inTown.map((l) => l.sqft).filter((n) => n > 0)),
      };
      break;
    }
  }
  if (!facts.county) {
    const snap = getCommittedSnapshot();
    const inTown = (snap?.listings ?? []).filter((l) => l.city.trim().toLowerCase() === town);
    if (inTown.length) {
      facts = {
        county: (inTown[0].county as CountySlug) ?? null,
        medianSqft: median(inTown.map((l) => l.sqft).filter((n) => n > 0)),
      };
    }
  }

  cache.set(town, { facts, at: Date.now() });
  return NextResponse.json(facts);
}
