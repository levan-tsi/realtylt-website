import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Faq } from "@/components/services/Faq";
import { HowItWorks } from "@/components/services/HowItWorks";
import { MoreServices } from "@/components/services/MoreServices";
import { Outcome } from "@/components/services/Outcome";
import { RelatedPosts } from "@/components/services/RelatedPosts";
import { SeeItLive } from "@/components/services/SeeItLive";
import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceLead } from "@/components/services/ServiceLead";
import { UseCases } from "@/components/services/UseCases";
import { VideoBlock } from "@/components/services/VideoBlock";
import { WhatItIs } from "@/components/services/WhatItIs";
import { jsonLdScript } from "@/lib/jsonld";
import {
  getOtherServices,
  getService,
  getServices,
  serviceStructuredData,
  serviceUrl,
} from "@/lib/services";

/** ONE template for every service. Twenty page.tsx files would be twenty copies of this
 * that drift apart within a month; the content lives in content/services/<slug>.ts and
 * this route renders any of them. */

// The registry is static, so every service is known at build time and nothing else can
// resolve. Unlike the blog (where the CRM publishes new slugs after a build), a service
// only exists once someone writes its file, so an unknown slug is always a 404.
export async function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };

  const url = serviceUrl(service);
  return {
    title: service.seo.title,
    description: service.seo.description,
    keywords: service.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: service.seo.title,
      description: service.seo.description,
      url,
      siteName: "RealtyLT",
      images: [{ url: `${new URL(url).origin}/og.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: service.seo.title,
      description: service.seo.description,
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const services = getServices();
  const nodeIndex = services.findIndex((s) => s.slug === service.slug);

  return (
    <>
      {/* Service + FAQPage + BreadcrumbList (+ VideoObject once a walkthrough exists).
          One <script> each: a malformed block can't take the others down with it. */}
      {serviceStructuredData(service).map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(block) }}
        />
      ))}

      <ServiceHero service={service} />
      <Outcome service={service} />
      <WhatItIs service={service} />
      <HowItWorks service={service} />
      <UseCases service={service} />
      <SeeItLive service={service} nodeIndex={nodeIndex} />
      <VideoBlock service={service} />
      <Faq service={service} />
      <RelatedPosts service={service} />
      <ServiceLead service={service} />
      <MoreServices services={getOtherServices(service.slug, 6)} />
    </>
  );
}
