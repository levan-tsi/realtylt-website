import { permanentRedirect, redirect } from "next/navigation";
import { getListingCached } from "@/components/listing/ListingDetail";
import { listingPath } from "@/lib/idx/listing-url";

export const dynamicParams = true;
export const revalidate = 600;

// Legacy /listing/<KEY> URLs permanently redirect to the canonical SEO slug and keep resolving
// forever (bookmarks, old external links, our own lead-source strings). Next's RSC helper emits
// a 308 permanent redirect — SEO-equivalent to 301 (Google consolidates both identically); a
// literal 301 would require request middleware, which we intentionally don't add here.
export default async function LegacyListingRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getListingCached(id);
  // Gone from the market: the search, not "not found" (this old form carries no town to read).
  if (!l) redirect("/search");
  permanentRedirect(listingPath(l));
}
