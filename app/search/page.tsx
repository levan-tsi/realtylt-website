import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "Search Listings — Hudson Valley Homes for Sale",
  description:
    "Search homes for sale across Orange, Dutchess, Westchester, Putnam, Rockland and Ulster counties. Filter by price, beds, baths and more — grid or map view.",
};

export default function SearchPage() {
  return (
    <>
      <header className="bg-ink py-10 text-paper">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Search listings</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Every home on the market, six counties deep
          </h1>
        </div>
      </header>
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
