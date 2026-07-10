import type { MetadataRoute } from "next";
import { POSTS } from "@/content/blog/posts";
import { COUNTY_CONTENT } from "@/content/counties";
import { FIXTURE_LISTINGS } from "@/lib/idx/fixture-data";
import { isFixtureMode } from "@/lib/idx";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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
    { url: `${base}/connect`, priority: 0.7, changeFrequency: "yearly", lastModified: now },
    { url: `${base}/privacy-policy`, priority: 0.2, changeFrequency: "yearly", lastModified: now },
    { url: `${base}/dmca-terms`, priority: 0.2, changeFrequency: "yearly", lastModified: now },
  ];

  const counties: MetadataRoute.Sitemap = COUNTY_CONTENT.map((c) => ({
    url: `${base}/top-areas/${c.slug}`,
    priority: 0.8,
    changeFrequency: "weekly",
    lastModified: now,
  }));

  const posts: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    priority: 0.5,
    changeFrequency: "monthly",
    lastModified: new Date(p.date),
  }));

  // Listing URLs only in fixture mode are stable enough to publish; the live feed
  // rotates, so keep the sitemap to evergreen pages when the real MLS is connected.
  const listings: MetadataRoute.Sitemap = isFixtureMode()
    ? FIXTURE_LISTINGS.map((l) => ({
        url: `${base}/listing/${l.id}`,
        priority: 0.4,
        changeFrequency: "weekly" as const,
        lastModified: new Date(l.modificationTimestamp),
      }))
    : [];

  return [...staticPages, ...counties, ...posts, ...listings];
}
