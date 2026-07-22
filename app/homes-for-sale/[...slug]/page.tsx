import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetail, listingMetadata } from "@/components/listing/ListingDetail";
import { listingIdFromSlug } from "@/lib/idx/listing-url";

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
  if (!id) notFound();
  return <ListingDetail id={id} />;
}
