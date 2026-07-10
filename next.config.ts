import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // A stray lockfile in the user home dir makes Next infer the wrong workspace root
  outputFileTracingRoot: path.join(__dirname),
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
