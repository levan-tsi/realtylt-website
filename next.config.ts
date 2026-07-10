import type { NextConfig } from "next";
import path from "node:path";

// The AI recruiter journey is its own Vercel project; the stable production alias.
const AI_PAGE_URL = "https://realtylt-ai-page.vercel.app";

const nextConfig: NextConfig = {
  // A stray lockfile in the user home dir makes Next infer the wrong workspace root
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Live-mode listing photos are external MLS Grid CDN URLs; without an allowed host
    // every next/image render throws. TODO: confirm the real feed's media host(s) when
    // owner MLS keys arrive and tighten/extend this pattern accordingly.
    remotePatterns: [{ protocol: "https", hostname: "**.mlsgrid.com" }],
  },
  async redirects() {
    return [
      { source: "/index", destination: "/", permanent: true },
      { source: "/top_areas", destination: "/top-areas", permanent: true },
      { source: "/homevalue", destination: "/home-value", permanent: true },
      { source: "/home_value", destination: "/home-value", permanent: true },
      { source: "/realestateagent/search", destination: "/who-we-are", permanent: true },
    ];
  },
  async rewrites() {
    // /ai is a separate Vercel project (realtylt-ai-page) — proxy it under this domain.
    // The AI page uses RELATIVE asset URLs; from the document at /ai (no trailing slash)
    // they resolve against "/", so its root namespaces (styles.css, src/, assets/, vendor/)
    // are proxied too. These are afterFiles rewrites — real routes and /public files
    // (images/, og.png) always win; the marketing site must not claim these paths.
    return [
      { source: "/ai", destination: `${AI_PAGE_URL}/` },
      { source: "/ai/:path*", destination: `${AI_PAGE_URL}/:path*` },
      { source: "/styles.css", destination: `${AI_PAGE_URL}/styles.css` },
      { source: "/src/:path*", destination: `${AI_PAGE_URL}/src/:path*` },
      { source: "/assets/:path*", destination: `${AI_PAGE_URL}/assets/:path*` },
      { source: "/vendor/:path*", destination: `${AI_PAGE_URL}/vendor/:path*` },
    ];
  },
  async headers() {
    // Pre-launch: belt-and-suspenders noindex on every route (robots.ts also disallows).
    // Flip to public by removing PRELAUNCH from the environment.
    if (process.env.PRELAUNCH !== "1") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
