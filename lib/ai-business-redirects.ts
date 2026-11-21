/** THE AI BUSINESS MOVED OUT (2026-11-20).
 *
 * The AI services, the AI posts and the /ai journey left realtylt.com for their own site. Every
 * address Google, a share or a saved link knows answers here with a permanent redirect to the SAME
 * PATH there (slugs and the /services/ and /blog/ prefixes did not change), so the ranking passes on
 * and the moved pages' own relative links keep working.
 *
 * ONE DATA FILE, read by next.config.ts redirects() and by app/redirects.test.ts, so the rules the
 * site serves and the list the test checks cannot drift apart.
 *
 * The posts are listed one by one on purpose: the real-estate posts stay under /blog, so a
 * /blog/:path* wildcard would take them too.
 */

export const NEW_SITE = "https://excelsiormind.com";

/** The 21 service pages (the hub, /services, is redirected too). */
export const MOVED_SERVICE_SLUGS = [
  "ai-chat-assistant",
  "ai-voice-agents",
  "skip-tracing-lead-generation",
  "ai-agent-workforce",
  "ai-clone",
  "marketing-automation",
  "database-reactivation",
  "workflow-automation",
  "ai-readiness-assessment",
  "custom-automation",
  "ai-appointment-booking",
  "invoicing-and-payments",
  "review-automation",
  "crm-sync",
  "ai-scheduling",
  "document-processing",
  "lead-qualification",
  "data-enrichment",
  "local-seo",
  "geo-landing-pages",
  "the-singularity",
] as const;

/** The 20 AI blog posts. */
export const MOVED_POST_SLUGS = [
  "the-singularity-self-improving-ai-system",
  "custom-automation-real-estate-bespoke-build",
  "ai-assessment-small-business-what-not-to-automate",
  "ai-clone-real-estate-agent-video-avatar",
  "invoicing-and-payments-real-estate-brokerage",
  "ai-scheduling-real-estate-showing-confirmations",
  "data-enrichment-real-estate-stale-contact-records",
  "document-processing-real-estate-contract-deadlines",
  "marketing-automation-real-estate-email-deliverability",
  "ai-agent-workforce-real-estate-assistants",
  "crm-sync-real-estate-duplicate-contact-records",
  "geo-landing-pages-real-estate-doorway-pages",
  "local-seo-real-estate-map-pack-google-business-profile",
  "ai-appointment-booking-no-shows-real-estate",
  "automated-google-review-requests-real-estate",
  "ai-lead-qualification-real-estate-scoring",
  "database-reactivation-old-real-estate-leads",
  "ai-voice-agent-missed-calls-real-estate",
  "workflow-automation-real-estate-business",
  "ai-chat-assistant-real-estate-website",
] as const;

/** The file the moved pages published that the new site serves at the same path: the PDF two of
 * the posts link. */
export const MOVED_FILES = ["/downloads/three-question-sheet.pdf"] as const;

/** WITHDRAWN, NOT MOVED: the five films and their posters. The films carry this site's name in
 * the picture, so the new site does not publish them, and a redirect there would be a permanent
 * redirect to a 404. They are gone from public/ and answer 404 here, which is the true answer. */
export const WITHDRAWN_FILES = [
  "/video/film-1140pm.mp4",
  "/video/film-942pm.mp4",
  "/video/film-qualify.mp4",
  "/video/film-reactivation.mp4",
  "/video/film-workflow.mp4",
  "/video/film-1140pm-poster.jpg",
  "/video/film-942pm-poster.jpg",
  "/video/film-qualify-poster.jpg",
  "/video/film-reactivation-poster.jpg",
  "/video/film-workflow-poster.jpg",
] as const;

/** Older addresses that already redirected to a moved page, each sent to its FINAL address on the
 * new site in one hop (a hop to the old target here would chain into a second redirect):
 *  - the AI audit's service page and post, renamed to "assessment" on 2026-10-31;
 *  - the skip tracing post, removed on 2026-10-31 at the owner's word; it came from the AI cohort,
 *    so it goes to the AI blog, not to the real estate one. */
export const RETIRED_PATHS: readonly (readonly [from: string, to: string])[] = [
  ["/services/ai-audit", "/services/ai-readiness-assessment"],
  ["/blog/ai-audit-small-business-what-not-to-automate", "/blog/ai-assessment-small-business-what-not-to-automate"],
  ["/blog/skip-tracing-real-estate-legal-owner-phone-numbers", "/blog"],
];

/** Addresses under /ai whose same path on the new site is not a page, each sent in ONE hop to one
 * that is, and served BEFORE the generic /ai/:path* rule (Next takes the first match):
 *  - the journey's thank-you page lives under /assets/ there;
 *  - /ai/index.html is the journey itself, the new site's root;
 *  - the free quiz and the assessment start are not live there; the way in is the contact page. */
export const AI_PATH_TAILS: readonly (readonly [from: string, to: string])[] = [
  ["/ai/thanks.html", "/assets/thanks.html"],
  ["/ai/index.html", "/"],
  ["/ai/quiz", "/connect"],
  ["/ai/quiz/:path*", "/connect"],
  ["/ai/assessment", "/connect"],
];

export interface MovedRedirect {
  source: string;
  destination: string;
  statusCode: 301;
}

/** Every moved PAGE address, old path to new path. The journey maps onto the new site's root. */
export function movedPagePaths(): [from: string, to: string][] {
  return [
    ["/ai", "/"],
    ["/services", "/services"],
    ...MOVED_SERVICE_SLUGS.map((s): [string, string] => [`/services/${s}`, `/services/${s}`]),
    ...MOVED_POST_SLUGS.map((s): [string, string] => [`/blog/${s}`, `/blog/${s}`]),
    ...RETIRED_PATHS.map(([from, to]): [string, string] => [from, to]),
  ];
}

/** The exact rules next.config.ts serves. 301, not Next's `permanent` (308): the brief asks for a
 * literal 301, and search engines treat both as permanent.
 *
 * TRAILING SLASH, MEASURED 2026-11-20 on the production build: with `skipTrailingSlashRedirect`
 * on, /services/ai-voice-agents/ still answers 301 to the same destination as the bare path,
 * because Next compiles every redirect source with an optional trailing slash
 * (`.next/routes-manifest.json`: `^(?!/_next)/services/ai-voice-agents(?:/)?$`), and that manifest
 * is what Vercel routes from. So no slash-form rules are needed. */
export function aiBusinessRedirects(): MovedRedirect[] {
  const to = (p: string) => `${NEW_SITE}${p}`;
  return [
    ...movedPagePaths().map(([from, dest]): MovedRedirect => ({ source: from, destination: to(dest), statusCode: 301 })),
    // The /ai addresses whose same path there is not a page, first, then the generic rule.
    ...AI_PATH_TAILS.map(([from, dest]): MovedRedirect => ({ source: from, destination: to(dest), statusCode: 301 })),
    // Anything else under /ai (/ai/styles.css, /ai/assets/... and the like) maps onto the new
    // site's root namespace.
    { source: "/ai/:path*", destination: `${NEW_SITE}/:path*`, statusCode: 301 },
    ...MOVED_FILES.map((f): MovedRedirect => ({ source: f, destination: to(f), statusCode: 301 })),
  ];
}
