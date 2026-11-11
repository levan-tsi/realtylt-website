import type { Metadata } from "next";
import Link from "next/link";
import { Constellation } from "@/components/services/Constellation";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { jsonLdScript } from "@/lib/jsonld";
import { getServices, type Service } from "@/lib/services";
import { SITE } from "@/lib/site";

/* Round 28 (2026-11-11, the owner's word: AI is for business owners, a real estate office is one
 * example among several). The hub speaks to a local owner and groups the services by the job an
 * owner wants done, not by the old flagship/core/more tiers (which stay in the content files, for
 * the /ai hub). "Twenty things that used to need a person" is gone: the brand never hints that
 * anyone loses a job (company/BRAND.md section 3). The close is the two free doors (CTA-2 version
 * E), the quiz address as text until it answers. */
export const metadata: Metadata = {
  title: "AI services for local business owners",
  description:
    "AI services for local business owners: calls answered, reviews asked for, bookings and follow-ups run, paperwork off the desk, and a person approving what matters.",
  alternates: { canonical: `${SITE.url}/services` },
  openGraph: {
    type: "website",
    title: "AI services for local business owners, by RealtyLT AI",
    description:
      "Calls answered, reviews asked for, bookings and follow-ups run and paperwork off the desk, on the tools a business already uses, with a person approving what matters.",
    url: `${SITE.url}/services`,
    // Declaring `openGraph` replaces the layout's object, images included — without this the
    // hub page shared with no picture while every /services/<slug> page under it had one.
    images: [{ url: `${SITE.url}/og-realtylt.png`, width: 1200, height: 630 }],
  },
};

function ServiceCard({ service, large = false }: { service: Service; large?: boolean }) {
  return (
    <article
      className={`group relative flex h-full flex-col rounded-2xl border border-line bg-card transition-colors hover:border-ink/35 ${
        large ? "p-7 md:p-8" : "p-6"
      }`}
    >
      <Link href={`/services/${service.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">{service.name}</span>
      </Link>
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
              className="rounded-lg border border-line px-2 py-1 text-[11px] leading-none text-ink-soft"
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

/** The owner's jobs, in the order an owner asks for them. Every service appears exactly once; a
 * slug that is not in the registry is skipped, and any registry entry not named here falls into
 * the last group, so a new service can never vanish from the hub. Two card grids are never
 * adjacent (the template tell the old "quiet ones" list was written to avoid): cards, rows, cards,
 * rows. */
const GROUPS: {
  id: string;
  eyebrow: string;
  lead: string;
  strong: string;
  intro: string;
  slugs: string[];
  layout: "cards-large" | "cards" | "rows";
}[] = [
  {
    id: "answer",
    eyebrow: "Answer every customer",
    lead: "The calls, chats and bookings",
    strong: "nobody had time for",
    intro:
      "For the roofer on a ladder, the front desk already with someone, the salon mid-appointment and the office out on a showing. Each one answers from what the owner approved and passes anything it cannot check to a person.",
    slugs: ["ai-voice-agents", "ai-chat-assistant", "ai-appointment-booking", "ai-scheduling"],
    layout: "cards-large",
  },
  {
    id: "win",
    eyebrow: "Win more work",
    lead: "Reviews, follow-ups and",
    strong: "being found nearby",
    intro:
      "Asking every customer for a review, following up on every inquiry, waking the old customer list, and showing up when someone nearby searches.",
    slugs: [
      "review-automation",
      "lead-qualification",
      "database-reactivation",
      "marketing-automation",
      "local-seo",
      "geo-landing-pages",
      "skip-tracing-lead-generation",
    ],
    layout: "rows",
  },
  {
    id: "desk",
    eyebrow: "Take the busywork off the desk",
    lead: "The retyping, the chasing",
    strong: "and the paperwork",
    intro:
      "Apps connected so the next step starts itself, invoices and reminders sent on the day, documents read and filed, and the customer list kept current. The team approves; the retyping goes.",
    slugs: [
      "workflow-automation",
      "invoicing-and-payments",
      "document-processing",
      "crm-sync",
      "data-enrichment",
      "ai-agent-workforce",
    ],
    layout: "cards",
  },
  {
    id: "build",
    eyebrow: "Start here, or go further",
    lead: "The plan first, then",
    strong: "what is built around it",
    intro:
      "The one-hour assessment that says what to build first and what to leave alone, the custom build for the step no app fixes, the owner's own face and voice on video, and the system that ties the rest together.",
    slugs: ["ai-readiness-assessment", "custom-automation", "ai-clone", "the-singularity"],
    layout: "rows",
  },
];

function Rows({ items }: { items: Service[] }) {
  return (
    <ul className="mt-10 grid gap-x-16 sm:grid-cols-2">
      {items.map((s, i) => (
        <Reveal key={s.slug} as="li" delay={(i % 2) * 80} className="min-w-0">
          <Link
            href={`/services/${s.slug}`}
            className="group flex items-baseline gap-5 border-t border-line py-5"
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
              <span className="mt-1 block t-small leading-relaxed text-stone">{s.title}</span>
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

export default function ServicesIndexPage() {
  const services = getServices();
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const named = new Set(GROUPS.flatMap((g) => g.slugs));
  const groups = GROUPS.map((g, gi) => ({
    ...g,
    items: [
      ...g.slugs.map((slug) => bySlug.get(slug)).filter((s): s is Service => Boolean(s)),
      ...(gi === GROUPS.length - 1 ? services.filter((s) => !named.has(s.slug)) : []),
    ],
  }));

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
      <section className="daylight bg-ink" aria-labelledby="services-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
          <div className="self-center">
            <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-paper/60">
              <Link href="/" className="inline-block py-1.5 transition-colors hover:text-paper">
                Home
              </Link>
              <span aria-hidden className="px-2 text-paper/30">
                /
              </span>
              <span className="text-paper/80">AI services</span>
            </nav>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-paper/60">
              RealtyLT AI
            </p>
            <h1 id="services-title" className="t-h1 mt-3 max-w-2xl text-paper">
              AI services for <strong>local business owners</strong>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/80">
              A roofer on a ladder, a dental office with a full front desk, a salon mid-appointment, a
              real estate office out on a showing: the phone still rings, the reviews still need asking
              for and the paperwork still piles up. We set up AI that answers, books, follows up and
              files, on the tools the business already uses, and a person on the team approves
              everything that matters.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-paper/70">
              Each service has its own page saying exactly what we do, what the owner provides and what
              stays with a person. One of them you can talk to right now.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button href="/services/ai-readiness-assessment" variant="light" size="lg">
                Start with an assessment
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
            <figure className="rounded-2xl border border-paper/15 bg-ink-soft p-5 md:p-6">
              <Constellation
                count={services.length}
                lit={null}
                label={`The RealtyLT AI hub: ${services.length} service nodes around one core`}
              />
              <figcaption className="mt-4 border-t border-paper/10 pt-4 text-xs uppercase tracking-[0.18em] text-paper/60">
                {services.length} services
                <span aria-hidden className="px-2 text-paper/25">
                  /
                </span>
                one core
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {groups.map((g, gi) => (
        <section
          key={g.id}
          className={`${g.layout === "rows" ? "sec-sm" : "sec"} ${gi % 2 === 1 ? "bg-mist" : "bg-paper"}`}
          aria-labelledby={`${g.id}-heading`}
        >
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <Reveal>
              <SectionHeading eyebrow={g.eyebrow} as="h2">
                <span id={`${g.id}-heading`}>
                  {g.lead} <strong>{g.strong}</strong>
                </span>
              </SectionHeading>
              <p className="mt-4 max-w-2xl leading-relaxed text-stone">{g.intro}</p>
            </Reveal>

            {g.layout === "rows" ? (
              <Rows items={g.items} />
            ) : (
              <ul
                className={`mt-10 grid gap-6 ${
                  g.layout === "cards-large" ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {g.items.map((s, i) => (
                  <Reveal key={s.slug} as="li" delay={(i % 3) * 90} className="min-w-0">
                    <ServiceCard service={s} large={g.layout === "cards-large"} />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {/* ── Close: the two free doors (CTA-2 section 4, version E). The quiz address is text, not a
          link, until it answers (CTA-2 section 0). */}
      <section className="daylight sec-sm bg-ink text-paper" aria-labelledby="close-heading">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center lg:px-8">
          <Reveal>
            <h2 id="close-heading" className="t-h2">
              Two free places <strong>to start</strong>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-paper/85">
              Five free assessments and five free websites, by application.
            </p>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-paper/75">
              Apply through the free AI quiz:{" "}
              <span className="whitespace-nowrap font-bold text-paper">realtylt.com/ai/assessment</span>
            </p>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper/75">
              Not knowing which service comes first is the normal place to be. In one hour with the
              owner, the assessment maps how the business really runs, cuts the ideas that should not
              be built, and puts the rest in order with the reason for each spot beside it. Then we
              write the plan.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/services/ai-readiness-assessment" variant="light" size="lg">
                Read about the assessment
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
