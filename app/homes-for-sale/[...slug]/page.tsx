import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingDetail, getListingCached, listingMetadata } from "@/components/listing/ListingDetail";
import { goneListingSearch, listingIdFromSlug } from "@/lib/idx/listing-url";

// The canonical listing route: /homes-for-sale/<STATE>/<city>/<zip>/<address>/bid-38-<id>.
// The trailing bid-38-<id> segment carries our listing KEY; the rest are SEO keywords.
export const dynamicParams = true;
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = listingIdFromSlug(slug);
  if (!id) return { title: "Listing not found" };
  return listingMetadata(id);
}

export default async function HomesForSaleListing({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const id = listingIdFromSlug(slug);
  // A home no longer on the market (sold, expired, withdrawn) or a mangled old address: the
  // visitor lands on the search for that town, not on "not found" (lib/idx/listing-url.ts
  // goneListingSearch). Temporary (307), because an expired or withdrawn home can come back on the
  // market under the same key, and then this address serves it again.
  if (!id || !(await getListingCached(id))) redirect(goneListingSearch(slug));
  return <ListingDetail id={id} />;
}
