import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/blog";
import { COUNTY_CONTENT } from "@/content/counties";
import { BOROUGH_CONTENT } from "@/content/boroughs";
import { FIXTURE_LISTINGS } from "@/lib/idx/fixture-data";
import { isFixtureMode } from "@/lib/idx";
import { listingPath } from "@/lib/idx/listing-url";
import { getServices } from "@/lib/services";
import { SITE } from "@/lib/site";

// Regenerate hourly — harmless in fixture mode, honest once the live feed rotates.
// (A CRM publish also revalidates /sitemap.xml through /api/revalidate.)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1, changeFrequency: "daily", lastModified: now },
    { url: `${base}/search`, priority: 0.9, changeFrequency: "daily", lastModified: now },
    { url: `${base}/selling`, priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/buying`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/home-value`, priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/financing`, priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/top-areas`, priority: 0.8, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/who-we-are`, priority: 0.6, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/reviews`, priority: 0.6, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/blog`, priority: 0.7, changeFrequency: "weekly", lastModified: now },
    { url: `${base}/services`, priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { url: `${base}/connect`, priority: 0.7, changeFrequency: "yearly", lastModified: now },
    { url: `${base}/privacy-policy`, priority: 0.2, changeFrequency: "yearly", lastModified: now },
    { url: `${base}/dmca-terms`, priority: 0.2, changeFrequency: "yearly", lastModified: now },
  ];

  const counties: MetadataRoute.Sitemap = [...COUNTY_CONTENT, ...BOROUGH_CONTENT].map((a) => ({
    url: `${base}/top-areas/${a.slug}`,
    priority: 0.8,
    changeFrequency: "weekly",
    lastModified: now,
  }));

  // The per-service SEO/GEO surface. `/ai#voice` is not a URL Google can rank — these are.
  // Flagship pages carry the deepest content, so they get the higher priority.
  const services: MetadataRoute.Sitemap = getServices().map((s) => ({
    url: `${base}/services/${s.slug}`,
    priority: s.tier === "flagship" ? 0.9 : s.tier === "core" ? 0.7 : 0.6,
    changeFrequency: "monthly",
    lastModified: now,
  }));

  // Static stubs + everything published from the CRM (docs/BLOG-CMS.md).
  const posts: MetadataRoute.Sitemap = (await getArticles()).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    priority: 0.5,
    changeFrequency: "monthly",
    lastModified: new Date(p.date),
  }));

  // Listing URLs only in fixture mode are stable enough to publish; the live feed
  // rotates, so keep the sitemap to evergreen pages when the real MLS is connected.
  const listings: MetadataRoute.Sitemap = isFixtureMode()
    ? FIXTURE_LISTINGS.map((l) => ({
        url: `${base}${listingPath(l)}`,
        priority: 0.4,
        changeFrequency: "weekly" as const,
        lastModified: new Date(l.modificationTimestamp),
      }))
    : [];

  return [...staticPages, ...counties, ...services, ...posts, ...listings];
}
