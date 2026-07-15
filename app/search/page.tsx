import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "Search Listings | Hudson Valley Homes for Sale",
  description:
    "Search homes for sale across the Hudson Valley and all five NYC boroughs. Filter by price, beds, baths and more, in grid or map view.",
};

export default function SearchPage() {
  return (
    <>
      {/* Live search page has no hero band — filters start right under the nav. */}
      <h1 className="sr-only">Search Listings: Hudson Valley homes for sale</h1>
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1400px] px-4 py-16 text-sm text-stone lg:px-8">Loading search…</div>
        }
      >
        <SearchClient />
      </Suspense>
    </>
  );
}
