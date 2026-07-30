import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search/SearchClient";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search Listings | Hudson Valley Homes for Sale",
  description:
    "Search homes for sale across the Hudson Valley and all five NYC boroughs. Filter by price, beds, baths, and more, and browse in grid or map view.",
};

export default function SearchPage() {
  return (
    <>
      {/* Live search page has no hero band — filters start right under the nav. */}
      <h1 className="sr-only">Search Listings: Hudson Valley homes for sale</h1>
      {/* The live search hydrates client-side; give no-JS visitors a clear path rather than a
          stuck "Loading search…". */}
      <noscript>
        <div className="mx-auto max-w-[1400px] px-4 py-16 lg:px-8">
          <p className="text-xl font-light text-ink">Our live listing search needs JavaScript turned on.</p>
          <p className="mt-2 text-sm text-stone">
            Enable it to browse Hudson Valley homes in grid or map view, or call us at{" "}
            <a href={SITE.phoneHref} className="font-bold text-ink underline underline-offset-2">{SITE.phone}</a>{" "}
            and we&rsquo;ll run a search for you.
          </p>
        </div>
      </noscript>
      {/* The fallback has to RESERVE the search UI's height, not just announce it. SearchClient
          reads useSearchParams, so Next renders this fallback for the whole server pass and swaps
          in the real UI on hydration — measured at 1440: main went 148px -> 771px and dragged the
          footer up the page with it, for a CLS of 0.62 (Google calls anything over 0.25 poor).
          Holding a viewport's worth of space keeps everything below it off-screen, where a shift
          costs nothing, and the swap reads as the page arriving instead of jumping. */}
      <Suspense
        fallback={
          <div data-js-only className="mx-auto min-h-[88vh] max-w-[1400px] px-4 py-16 text-sm text-stone lg:px-8">
            Loading search…
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </>
  );
}
