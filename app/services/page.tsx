import type { Metadata } from "next";
import Link from "next/link";
import { Constellation } from "@/components/services/Constellation";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { jsonLdScript } from "@/lib/jsonld";
import { getServices, type Service } from "@/lib/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Services: Assistants, Voice Agents, and Automation",
  description:
    "Twenty things that used to need a person. AI chat assistants, voice agents, skip tracing, lead qualification, and workflow automation, built on the tools you already run.",
  alternates: { canonical: `${SITE.url}/services` },
  openGraph: {
    type: "website",
    title: "AI Services by RealtyLT",
    description:
      "AI chat assistants, voice agents, skip tracing, lead qualification, and workflow automation, built on the tools you already run.",
    url: `${SITE.url}/services`,
  },
};

function ServiceCard({ service, large = false }: { service: Service; large?: boolean }) {
  return (
    <article
      className={`group relative flex h-full flex-col border border-[#dddddd] bg-white transition-colors hover:border-ink/35 ${
        large ? "p-7 md:p-8" : "p-6"
      }`}
    >
      <Link
        href={`/services/${service.slug}`}
        className="absolute inset-0 z-10"
        aria-label={service.name}
      />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
        {service.eyebrow}
      </p>
      <h3
        className={`mt-3 font-bold leading-snug text-ink ${large ? "text-xl" : "text-base"}`}
      >
        {service.name}
      </h3>
      <p className={`mt-2.5 leading-relaxed text-stone ${large ? "" : "line-clamp-2 text-sm"}`}>
        {service.title}
      </p>

      {large && (
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {service.specs.slice(0, 3).map((s) => (
            <li
              key={s}
              className="border border-[#dddddd] px-2 py-1 text-[11px] leading-none text-ink-soft"
            >
              {s}
            </li>
          ))}
        </ul>
      )}

      <p
        className={`mt-auto text-sm font-bold text-ink underline-offset-4 group-hover:underline ${
          large ? "pt-6" : "pt-5"
        }`}
      >
        Read the page
      </p>
    </article>
  );
}

export default function ServicesIndexPage() {
  const services = getServices();
  const flagship = services.filter((s) => s.tier === "flagship");
  const core = services.filter((s) => s.tier === "core");
  const more = services.filter((s) => s.tier === "more");

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "RealtyLT AI services",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${SITE.url}/services/${s.slug}`,
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "AI Services", item: `${SITE.url}/services` },
    ],
  };

  return (
    <>
      {[itemList, breadcrumb].map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(block) }}
        />
      ))}

      {/* ── Hero */}
      <section className="bg-ink" aria-labelledby="services-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
          <div className="self-center">
            <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-paper/60">
              <Link href="/" className="inline-block py-1.5 transition-colors hover:text-paper">
                Home
              </Link>
              <span aria-hidden className="px-2 text-paper/30">
                /
              </span>
              <span className="text-paper/80">AI Services</span>
            </nav>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-paper/60">
              RealtyLT AI
            </p>
            <h1
              id="services-title"
              className="mt-3 max-w-2xl text-4xl font-light leading-[1.12] text-paper md:text-[50px]"
            >
              Twenty things that used to <strong className="font-bold">need a person</strong>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/80">
              Assistants that answer in seconds, voice agents that never miss a call, pipelines that
              turn a map into a phone list, and automation that quietly removes the busywork. Each
              one has a page, and one of them you can talk to right now.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button href="/services/ai-audit" variant="light" size="lg">
                Start with an audit
              </Button>
              {/* /ai is a rewrite to the separate journey project — plain anchor. */}
              <a
                href="/ai"
                className="inline-block border-b border-paper/40 py-1 text-sm font-bold text-paper transition-colors hover:border-paper"
              >
                Fly through the AI page
              </a>
            </div>
          </div>

          <Reveal delay={120} className="lg:self-center">
            <figure className="border border-paper/15 bg-ink-soft p-5 md:p-6">
              <Constellation count={20} lit={null} label="The RealtyLT AI hub: twenty service nodes around one core" />
              <figcaption className="mt-4 border-t border-paper/10 pt-4 text-xs uppercase tracking-[0.18em] text-paper/60">
                Twenty nodes
                <span aria-hidden className="px-2 text-paper/25">
                  /
                </span>
                one core
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── Flagship */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="flagship-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Start here" as="h2">
              <span id="flagship-heading">
                The three that <strong className="font-bold">change a week</strong>
              </span>
            </SectionHeading>
            <p className="mt-4 max-w-2xl leading-relaxed text-stone">
              Answer every inquiry in seconds, answer every call at any hour, and build the list you
              are going to call. Most businesses feel the difference from these three before anything
              else.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {flagship.map((s, i) => (
              <Reveal key={s.slug} as="li" delay={i * 110} className="min-w-0">
                <ServiceCard service={s} large />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Core */}
      <section className="bg-mist py-16 md:py-24" aria-labelledby="core-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="The hub" as="h2">
              <span id="core-heading">
                Everything else on the <strong className="font-bold">brain</strong>
              </span>
            </SectionHeading>
          </Reveal>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {core.map((s, i) => (
              <Reveal key={s.slug} as="li" delay={(i % 3) * 90} className="min-w-0">
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── More */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="more-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="And the quiet ones" as="h2">
              <span id="more-heading">
                The plumbing nobody <strong className="font-bold">brags about</strong>
              </span>
            </SectionHeading>
            <p className="mt-4 max-w-2xl leading-relaxed text-stone">
              Sync, scheduling, documents, qualification, enrichment, and being found. None of it is
              exciting. All of it is where the hours go.
            </p>
          </Reveal>

          {/* A LIST, not a third card grid. Three identical card grids in a row is the
              template tell, and a seven-item card grid leaves a dead cell at any column
              count. Rows have neither problem. */}
          <ul className="mt-10 grid gap-x-16 sm:grid-cols-2">
            {more.map((s, i) => (
              <Reveal key={s.slug} as="li" delay={(i % 2) * 80} className="min-w-0">
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex items-baseline gap-5 border-t border-[#dddddd] py-5"
                >
                  <span
                    aria-hidden
                    className="shrink-0 text-xs font-bold tabular-nums tracking-[0.16em] text-porchlight-deep"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-bold leading-snug text-ink-soft transition-colors group-hover:text-ink group-hover:underline group-hover:underline-offset-4">
                      {s.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-stone">{s.title}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Close */}
      <section className="bg-ink py-16 text-paper md:py-20" aria-labelledby="close-heading">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center lg:px-8">
          <Reveal>
            <h2 id="close-heading" className="text-3xl font-light leading-tight md:text-4xl">
              Not sure which one you <strong className="font-bold">need first?</strong>
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper/75">
              That is the normal place to be. The audit exists for exactly this: we map how your
              business actually runs, rank what is worth automating by what it pays back, and build
              the first one.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/services/ai-audit" variant="light" size="lg">
                Read about the audit
              </Button>
              <Button href="/connect" variant="outline-light" size="lg">
                Just talk to us
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
