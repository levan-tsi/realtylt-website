import type { NextConfig } from "next";
import path from "node:path";

// The AI recruiter journey is its own Vercel project; the stable production alias.
const AI_PAGE_URL = "https://realtylt-ai-page.vercel.app";

// Content-Security-Policy — ONE policy applied to every route (Next.js sends a
// duplicate CSP header when multiple `source` rules match the same path, and browsers
// enforce the INTERSECTION of duplicates, which would silently break the /ai WebGL app).
// So this single policy must satisfy both the marketing site AND the proxied Three.js
// journey under /ai. Notes on each directive:
//  - script-src needs 'unsafe-inline' for Next.js's inline hydration/RSC bootstrap
//    scripts (this site is statically generated — a nonce-based CSP would force every
//    page dynamic and cannot cover the separately-built /ai app served via rewrite).
//    'unsafe-eval'/'wasm-unsafe-eval' + blob: worker-src keep the WebGL journey working.
//  - style-src 'unsafe-inline' is required by Next's injected styles + Leaflet's inline
//    marker/style attributes.
//  - img-src allows OSM map tiles + (live-mode) MLS Grid listing photos + data:/blob:.
//  - frame-ancestors 'none' / object-src 'none' / base-uri 'self' / form-action 'self'
//    are the high-value hardening directives (clickjacking, base-tag & form hijacking).
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  // …plus Supabase Storage: blog cover images uploaded from the CRM "Website" section
  // live in the public `blog-media` bucket (docs/BLOG-CMS.md). The rendered value is
  // additionally pinned to OUR project origin at render time (lib/blog/db.ts safeCover).
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.mlsgrid.com https://*.public.blob.vercel-storage.com https://*.supabase.co",
  "font-src 'self' data:",
  // …plus Supabase (client accounts / auth): sign-in, token refresh, and portal reads/writes
  // go to our project origin https://<ref>.supabase.co over the anon key (docs/CLIENT-ACCOUNTS.md).
  "connect-src 'self' https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.mlsgrid.com https://n8n.srv1017745.hstgr.cloud https://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Security headers applied to every response (both pre-launch and public).
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // A stray lockfile in the user home dir makes Next infer the wrong workspace root
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Live-mode listing photos are external MLS Grid CDN URLs; without an allowed host
    // every next/image render throws. The optimizer (/_next/image?url=…) will only ever
    // fetch hosts matching this pattern, so the abuse surface is limited to https images
    // on mlsgrid.com subdomains. TODO: confirm the real feed's media host(s) when owner
    // MLS keys arrive and tighten this to the exact CDN host.
    // NOTE: live MLS photos never reach the optimizer anymore — they're served through the
    // CDN-cached /api/media proxy and rendered `unoptimized` (see that route + ListingCard).
    // This allowance stays as belt-and-suspenders for any stray direct mlsgrid URL.
    remotePatterns: [
      { protocol: "https", hostname: "**.mlsgrid.com" },
      // Replicated MLS photos live in Vercel Blob (public store). Rendered `unoptimized`
      // (isLiveMlsPhoto), so this is belt-and-suspenders like the mlsgrid allowance.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Blog cover images published from the CRM (Supabase Storage, public bucket).
      // safeCover() only ever renders URLs on our own project origin under
      // /storage/v1/object/public/ — this pattern is the optimizer's allowance for them.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    // Never let the optimizer render SVG (an SVG can carry inline script) — default is
    // false; pinned explicitly so a future edit can't silently enable an XSS vector.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
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
    // Security headers apply on every route, always. Pre-launch also adds a
    // belt-and-suspenders noindex header (robots.ts disallows too); flip to public
    // by removing PRELAUNCH from the environment.
    const headers = [...SECURITY_HEADERS];
    if (process.env.PRELAUNCH === "1") {
      headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
