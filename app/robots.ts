import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: the rebuild lives on a temp URL and must not be indexed.
  // Flip to public by removing PRELAUNCH from the environment.
  if (process.env.PRELAUNCH === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    // Faceted /search URLs are deliberately NOT disallowed here. Every filter combination is
    // a near-duplicate of the same inventory and none of them should be in the index — but
    // blocking the crawl would also stop it following those pages to the listings themselves,
    // and listing URLs are not in the sitemap (the live feed rotates). So the facets are
    // crawlable and marked `noindex, follow` in app/search/page.tsx instead: seen, followed,
    // not indexed.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
