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
    // Listing photos are the ONE /api/ path a visitor's browser actually loads: every tile and
    // gallery renders /api/media/{id}/{n} (the only compliant way to show MLS photos — the raw
    // MediaURL must not appear on the site). Blocking them cost real search surface, measured
    // 2026-09-20 in Search Console's live test on /api/media/KEY1048465/0: "Page cannot be
    // crawled: Blocked by robots.txt". So no listing photo could reach Google Images (24 on the
    // home page, 100 on /search, 28 on a listing page), and worse, every listing page's JSON-LD
    // `image` named a URL Google was forbidden to fetch. The longest matching rule wins, so this
    // allow beats the /api/ block for photos only; lead, revalidate, cron, idx and reports stay
    // shut. Crawling here is cheap and does NOT touch MLS: the route is storage-first (mirrored
    // photos 302 to the public Supabase bucket), CDN-cached for a day, and its stale-source gate
    // refuses to proxy rows whose signed URLs have expired.
    rules: [{ userAgent: "*", allow: ["/", "/api/media/"], disallow: ["/api/"] }],
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
