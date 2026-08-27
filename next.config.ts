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
  // …googletagmanager = the Ads gtag (live-site custom-code parity); maps.googleapis =
  // the official Google Maps results map (env-gated). googleads.g.doubleclick.net serves the
  // Ads conversion script (/pagead/viewthroughconversion/<AW id>) that gtag injects — without
  // it the owner's Google Ads conversions never fire (measured 2026-07-26: script-src-elem
  // violation on every page).
  // news.google.com serves swg/js/v1/publisher.js — Google's "Add to Preferred Sources"
  // button (components/site/PreferredSourceButton.tsx, renders only once the site serves as
  // realtylt.com). Measured 2026-08-26 by injecting the official embed on /buying: the script
  // loads from this host and renders the button AS AN IFRAME from the same host, so
  // news.google.com must be in frame-src below as well — script-src alone left a 60px empty
  // frame and two frame-src violations.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://www.googletagmanager.com https://maps.googleapis.com https://googleads.g.doubleclick.net https://news.google.com",
  // …fonts.googleapis.com: the Google Maps JS API injects its own font stylesheet on any page
  // with a map. Blocking it threw 3 style-src-elem violations per /search view (cosmetic only —
  // the map and its controls render — but it is our CSP producing console noise on our own
  // highest-traffic page).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // The owner's Google Calendar appointment scheduler on /connect + gtag's conversion frame,
  // plus the ambient Vimeo hero background video on the home page (player.vimeo.com iframe).
  // …news.google.com: the Preferred Sources button IS an iframe from that host (see script-src).
  "frame-src 'self' https://calendar.google.com https://td.doubleclick.net https://player.vimeo.com https://news.google.com",
  // …plus Supabase Storage: blog cover images uploaded from the CRM "Website" section
  // live in the public `blog-media` bucket (docs/BLOG-CMS.md). The rendered value is
  // additionally pinned to OUR project origin at render time (lib/blog/db.ts safeCover).
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.mlsgrid.com https://*.public.blob.vercel-storage.com https://*.supabase.co https://maps.googleapis.com https://maps.gstatic.com https://streetviewpixels-pa.googleapis.com https://www.google.com https://googleads.g.doubleclick.net https://www.googletagmanager.com",
  // …fonts.gstatic.com is the other half of the Maps font pair: allowing only the stylesheet
  // let it load and then request font files, which turned 3 violations into 191. Allow both or
  // neither.
  "font-src 'self' data: https://fonts.gstatic.com",
  // …plus Supabase (client accounts / auth): sign-in, token refresh, and portal reads/writes
  // go to our project origin https://<ref>.supabase.co over the anon key (docs/CLIENT-ACCOUNTS.md).
  // …and the beacon endpoints gtag actually posts conversions/measurements to. Measured
  // 2026-07-26 on prod: 7 CSP violations on EVERY page (ad.doubleclick.net, analytics.google.com,
  // stats.g.doubleclick.net, www.google.com/ccm) — i.e. the owner's Google Ads conversion
  // tracking and part of GA4 were being dropped site-wide. Every scratch probe had been
  // filtering these out as third-party "noise", which is why it went unnoticed.
  // 2026-08-21: `https://realtylt-crm-web.vercel.app` added because the chat cutover (115ec56,
  // the night before) moved the widget's WEBHOOK_URL from the n8n webhook to the CRM's
  // /api/chat/agent and nothing here followed. Measured on production before changing anything:
  // a fetch to that origin from the site's own page context returns "Failed to fetch" and the
  // console reads "Refused to connect because it violates the document's Content Security
  // Policy" — so every chat message a visitor sent was being dropped in the browser. The CRM
  // side was already correct (OPTIONS preflight returns 204 with
  // access-control-allow-origin for both realtylt.com and the temp host, methods POST/OPTIONS,
  // header x-rlt-chat-token). One exact origin, no wildcard; `lib/chat-csp.test.ts` now fails if
  // the widget's URL and this list ever drift apart again.
  "connect-src 'self' https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.mlsgrid.com https://n8n.srv1017745.hstgr.cloud https://realtylt-crm-web.vercel.app https://*.supabase.co https://maps.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://stats.g.doubleclick.net https://www.google.com",
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
  // posthog-js posts events to trailing-slash paths (/relay-ph/e/). Next's automatic 308
  // normalization breaks those POSTs in the browser (measured: fetch throws "Failed to
  // fetch" on the 308 hop; without the slash the same POST returns {"status":"Ok"}).
  // MEASURED before shipping the flag: with it on, /buying/ serves the same 200 content
  // /buying does instead of redirecting; every page declares a canonical URL, so the
  // duplicate form is harmless to SEO, and no redirects[] entry depends on slash
  // normalization. Middleware is not needed.
  skipTrailingSlashRedirect: true,
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
    // LOCAL (same-origin) paths the Image component will accept. Next's default is
    // [{ pathname: "/**", search: "" }] — an EMPTY query string only — so MlsImage's retry
    // URLs (/api/media/{id}/{n}?r=1, the cache-buster that heals a throttled photo) logged
    // "using a query string which is not configured in images.localPatterns. This config will
    // be required starting in Next.js 16." on every page with a listing photo. The first entry
    // restores the default for everything else; the second omits `search`, which is how Next
    // spells "any query string" (matchLocalPattern only compares `search` when it is defined).
    // Narrow on purpose: only the media proxy's own path may carry a query.
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/api/media/**" },
    ],
    // Never let the optimizer render SVG (an SVG can carry inline script) — default is
    // false; pinned explicitly so a future edit can't silently enable an XSS vector.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  async redirects() {
    // Every URL Google already knows about comes with the domain when the apex swings here.
    // These are the paths the LIVE site publishes in its own footer + HTML sitemap that this
    // site does not answer to; without them, launch day turns each one into a 404.
    return [
      { source: "/index", destination: "/", permanent: true },
      { source: "/top_areas", destination: "/top-areas", permanent: true },
      { source: "/homevalue", destination: "/home-value", permanent: true },
      { source: "/home_value", destination: "/home-value", permanent: true },
      { source: "/realestateagent/search", destination: "/who-we-are", permanent: true },
      // Same underscore-vs-hyphen split as /home_value, on the page a visitor is most likely
      // to arrive at from a policy link.
      { source: "/privacy_policy", destination: "/privacy-policy", permanent: true },
      // Live calls it /tos ("terms-conditions"); ours carries the terms and the DMCA notice.
      { source: "/tos", destination: "/dmca-terms", permanent: true },
      // The old portal's four sections have the same names as ours, so this maps one to one.
      { source: "/myportal", destination: "/portal", permanent: true },
      { source: "/myportal/:path*", destination: "/portal/:path*", permanent: true },
      // The vendor published a deep HTML area index — /sitemap/NY/<County>-County/City/<City>/
      // Listings/Page/N and School-District, Neighborhood and Postal-Code trees beneath it,
      // for 22 counties including many we do not serve. None of that shape exists here, and
      // the honest destination for all of it is the index of the areas we DO work in.
      // `:path+` (one or more segments), NOT `:path*`: redirects run before the filesystem,
      // and `*` also matches the bare /sitemap — which is now our own HTML site map page
      // (app/sitemap/page.tsx, round 41). /sitemap.xml stays the generated crawler file.
      { source: "/sitemap/:path+", destination: "/top-areas", permanent: true },
    ];
  },
  async rewrites() {
    // /ai is a separate Vercel project (realtylt-ai-page) — proxy it under this domain.
    // The AI page uses RELATIVE asset URLs; from the document at /ai (no trailing slash)
    // they resolve against "/", so its root namespaces (styles.css, src/, assets/, vendor/)
    // are proxied too. These are afterFiles rewrites — real routes and /public files
    // (images/, og.png) always win; the marketing site must not claim these paths.
    return [
      // PostHog ingestion + assets, proxied under our own origin (round 39). The browser
      // only ever talks to /relay-ph, so the CSP above needed no new origins — 'self'
      // already covers script/connect/worker. posthog-js requests trailing-slash paths
      // (/relay-ph/e/?...); Next's 308 normalization preserves method+body, measured on
      // the dev server before shipping. lib/posthog-proxy.test.ts pins these two rewrites
      // to the init component's api_host.
      { source: "/relay-ph/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/relay-ph/:path*", destination: "https://us.i.posthog.com/:path*" },
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
    // Do NOT try to add a Cache-Control here for /search. Now that it renders its results on
    // the server it is a dynamic route, and Next overwrites the header with
    // `private, no-cache, no-store` whatever this config says — measured on production, the
    // rule had no effect at all. Crawl budget on faceted /search URLs is handled where it
    // belongs instead, in app/robots.ts.
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
