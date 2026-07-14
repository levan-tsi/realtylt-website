/** The services read API + the structured data every service page emits.
 *
 * Mirrors lib/blog: the content collection is a typed TS array, this module is the only
 * thing the routes talk to. The JSON-LD builders live here (not inside the page) so they
 * are unit-testable without rendering React — see index.test.ts.
 */

import { SERVICES } from "@/content/services";
import type { Service } from "@/content/services/types";
import { SITE } from "@/lib/site";

export type { Figure, FaqItem, Service, ServiceTier, ServiceVideo } from "@/content/services/types";

export function getServices(): Service[] {
  return SERVICES;
}

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/** Everything except `slug`, in registry order. Used for the "more services" rail. */
export function getOtherServices(slug: string, limit = 6): Service[] {
  return SERVICES.filter((s) => s.slug !== slug).slice(0, limit);
}

/** Canonical URL for a service page. */
export function serviceUrl(service: Service): string {
  return `${SITE.url}/services/${service.slug}`;
}

/** The deep link that opens this service's panel in the /ai journey.
 * `/ai` is served by a rewrite to the separate Vercel project (next.config.ts), so this
 * is a same-origin path, not an external URL. Render it with a plain <a>: Next's <Link>
 * would prefetch an RSC payload that does not exist and 404. */
export function aiJourneyHref(service: Service): string {
  return `/ai#${service.aiKey}`;
}

/* ── Structured data ─────────────────────────────────────────────────────────
 * GEO is the whole point of these pages. `Service` tells a crawler what is sold and by
 * whom; `FAQPage` is the part an assistant actually quotes; `VideoObject` activates the
 * moment a walkthrough is attached to a service. Each is emitted in its own <script>
 * (same as the blog's BlogPosting) so a malformed block can never take the others down. */

export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${serviceUrl(service)}#service`,
    name: service.name,
    serviceType: service.eyebrow,
    description: service.seo.description,
    url: serviceUrl(service),
    provider: {
      "@type": "Organization",
      name: SITE.name,
      legalName: SITE.legalName,
      url: SITE.url,
      telephone: SITE.phoneE164,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.locality,
        addressRegion: SITE.address.region,
        postalCode: SITE.address.postalCode,
        addressCountry: "US",
      },
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Hudson Valley, New York" },
      { "@type": "Country", name: "United States" },
    ],
    // The spec chips ARE the offer detail — no prices are published, so no Offer node
    // (an Offer without a price is worse than no Offer: it invites a rich-result warning).
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.name} capabilities`,
      itemListElement: service.specs.map((spec) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: spec },
      })),
    },
  };
}

export function faqJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${serviceUrl(service)}#faq`,
    mainEntity: service.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "AI Services", item: `${SITE.url}/services` },
      { "@type": "ListItem", position: 3, name: service.name, item: serviceUrl(service) },
    ],
  };
}

/** Null until a walkthrough is recorded (HeyGen / Higgsfield). The field exists from day
 * one so attaching a video is a content edit, not a code change. */
export function videoJsonLd(service: Service) {
  const v = service.video;
  if (!v) return null;
  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE.url}${u}`);
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${serviceUrl(service)}#video`,
    name: v.name,
    description: v.description,
    thumbnailUrl: abs(v.thumbnailUrl),
    uploadDate: v.uploadDate,
    duration: v.duration,
    contentUrl: abs(v.contentUrl),
    ...(v.embedUrl ? { embedUrl: v.embedUrl } : {}),
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

/** Everything a service page puts in <script type="application/ld+json">, in order. */
export function serviceStructuredData(service: Service): object[] {
  const video = videoJsonLd(service);
  return [
    serviceJsonLd(service),
    faqJsonLd(service),
    breadcrumbJsonLd(service),
    ...(video ? [video] : []),
  ];
}
