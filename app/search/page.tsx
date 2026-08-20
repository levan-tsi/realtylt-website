import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient, type SearchPayload } from "@/components/search/SearchClient";
import { getIdxClient, isSampleData } from "@/lib/idx";
import { parseSearchRequest } from "@/lib/idx/query";

type RawParams = Record<string, string | string[] | undefined>;

const BASE_METADATA: Metadata = {
  title: "Search Listings | Hudson Valley Homes for Sale",
  description:
    "Search homes for sale across the Hudson Valley and all five NYC boroughs. Filter by price, beds, baths, and more, and browse in grid or map view.",
};

/** One search page, an unbounded number of URLs: every combination of county, beds, price,
 * type, sort and page is its own address over the same inventory. The bare /search is the one
 * worth ranking — the filtered variants are near-duplicates of it and of the county pages.
 * They stay CRAWLABLE (`follow`) on purpose: listing URLs are not in the sitemap because the
 * live feed rotates, so these pages are how a crawler walks to the homes themselves. Seen and
 * followed, just not indexed. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}): Promise<Metadata> {
  const filtered = Object.keys(await searchParams).length > 0;
  return filtered ? { ...BASE_METADATA, robots: { index: false, follow: true } } : BASE_METADATA;
}

/** Reading searchParams makes this route dynamic — which is the point. The page used to be a
 * static shell that shipped ZERO listings: SearchClient reads useSearchParams, so Next served
 * the Suspense fallback for the whole server pass and the browser had to parse the HTML, boot
 * the JS, hydrate, fetch /api/idx/search and only then paint. Measured on production, that put
 * the first card at 3,224ms cold / 752ms warm against the home page's 389ms, because the home
 * rails are server-rendered. Now the first page of results comes down inside the HTML. */
function toUrlParams(sp: RawParams): URLSearchParams {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    // A repeated param (?county=a&county=b) arrives as an array; the UI only ever writes one
    // of each, so take the first and let parseSearchRequest validate it.
    const one = Array.isArray(v) ? v[0] : v;
    if (typeof one === "string") q.set(k, one);
  }
  return q;
}

/** The first page of results, or null if the read fails — never a broken page. A null payload
 * puts SearchClient back on exactly its old path (skeleton, then fetch), so the worst case is
 * the behaviour we already shipped. */
async function loadFirstPage(q: URLSearchParams): Promise<SearchPayload | null> {
  try {
    const result = await getIdxClient().search(parseSearchRequest(q));
    return { ...result, fixtureMode: isSampleData() };
  } catch (e) {
    console.error("[search] server render fell back to the client fetch:", e);
    return null;
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const q = toUrlParams(await searchParams);
  const initial = await loadFirstPage(q);

  return (
    <>
      {/* Live search page has no hero band — filters start right under the nav. */}
      <h1 className="sr-only">Search Listings: Hudson Valley homes for sale</h1>
      {/* THE NO-JS MESSAGE MOVED TO loading.tsx, and it had to. A <noscript> here read "The homes
          below are today's Hudson Valley listings" — but loading.tsx wraps this route in a Suspense
          boundary, so everything this file returns is STREAMED into `<div hidden id="S:0">` and
          revealed by an inline `$RC(...)` call. Without scripting nothing reveals it, so that
          message sat in a hidden div and never reached one of the visitors it was written for,
          promising homes that were not on screen. The route's fallback IS in the shell, which is
          the part that renders without JavaScript, so the message lives there now. Full
          measurements in loading.tsx. */}
      {/* The route is dynamic, so this boundary never fires on a fresh load — SearchClient's
          useSearchParams resolves during the server pass and the real UI is in the HTML. It
          still covers a client-side navigation INTO /search, where the RSC payload is in
          flight, and reserving a viewport's worth of height keeps that swap off-screen (the
          same 0.62 CLS lesson from round 14). */}
      <Suspense
        fallback={
          <div data-js-only className="mx-auto min-h-[88vh] max-w-[1400px] px-4 py-16 text-sm text-stone lg:px-8">
            Loading search…
          </div>
        }
      >
        {/* The round-23 side rail retired in round 24b (owner: Saved and Plan "look faar") —
            its destinations live in the result meta row now, next to the quick filters, and
            the freed width went to the cards and the map. */}
        <SearchClient initial={initial} />
      </Suspense>
    </>
  );
}
