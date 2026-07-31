import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient, type SearchPayload } from "@/components/search/SearchClient";
import { getIdxClient, isSampleData } from "@/lib/idx";
import { parseSearchRequest } from "@/lib/idx/query";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search Listings | Hudson Valley Homes for Sale",
  description:
    "Search homes for sale across the Hudson Valley and all five NYC boroughs. Filter by price, beds, baths, and more, and browse in grid or map view.",
};

/** Reading searchParams makes this route dynamic — which is the point. The page used to be a
 * static shell that shipped ZERO listings: SearchClient reads useSearchParams, so Next served
 * the Suspense fallback for the whole server pass and the browser had to parse the HTML, boot
 * the JS, hydrate, fetch /api/idx/search and only then paint. Measured on production, that put
 * the first card at 3,224ms cold / 752ms warm against the home page's 389ms, because the home
 * rails are server-rendered. Now the first page of results comes down inside the HTML. */
type RawParams = Record<string, string | string[] | undefined>;

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
      {/* The results and the filter bar are real HTML now, so a no-JS visitor gets homes rather
          than a dead end. What they cannot do is CHANGE the search — every control is React —
          so point them at the pages that work without it. */}
      <noscript>
        <div className="mx-auto max-w-[1400px] px-4 pt-10 text-sm text-stone lg:px-8">
          Filtering, the map and saved searches need JavaScript. The homes below are today&rsquo;s
          Hudson Valley listings; browse them by{" "}
          <a href="/top-areas" className="font-bold text-ink underline underline-offset-2">area</a>{" "}
          or call us at{" "}
          <a href={SITE.phoneHref} className="font-bold text-ink underline underline-offset-2">{SITE.phone}</a>{" "}
          and we&rsquo;ll run a search for you.
        </div>
      </noscript>
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
        <SearchClient initial={initial} />
      </Suspense>
    </>
  );
}
