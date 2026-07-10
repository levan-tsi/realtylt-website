import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Pre-launch: the rebuild lives on a temp URL and must not be indexed.
  // Flip to public by removing PRELAUNCH from the environment.
  if (process.env.PRELAUNCH === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
