import type { NextConfig } from "next";
import path from "node:path";

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
};

export default nextConfig;
