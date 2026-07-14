import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceFigure } from "@/components/services/ServiceFigure";
import { aiJourneyHref, type Service } from "@/lib/services";

/** Ink hero. No photo: a house on an AI voice-agent page would be decoration pretending
 * to be information. The figure carries the picture weight instead, and it says something. */
export function ServiceHero({ service }: { service: Service }) {
  return (
    <section className="bg-ink" aria-labelledby="service-title">
      {/* Breadcrumb sits at the top of the section, not inside the vertically-centred
          column — otherwise it floats level with the middle of the figure. */}
      <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-paper/60">
          <Link href="/" className="inline-block py-1.5 transition-colors hover:text-paper">
            Home
          </Link>
          <span aria-hidden className="px-2 text-paper/30">
            /
          </span>
          <Link href="/services" className="inline-block py-1.5 transition-colors hover:text-paper">
            AI Services
          </Link>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-14 pt-6 md:pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8">
        <div className="self-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-paper/60">
            {service.eyebrow}
          </p>
          <h1
            id="service-title"
            className="mt-3 max-w-xl text-4xl font-light leading-[1.12] text-paper md:text-[46px]"
          >
            {service.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/80">{service.lede}</p>

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="What it runs on">
            {service.specs.map((s) => (
              <li
                key={s}
                className="border border-paper/25 px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-paper/85"
              >
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button href="#service-lead" variant="light" size="lg">
              Talk to us about this
            </Button>
            {/* /ai is a rewrite to the separate journey project, not an RSC route —
                a plain anchor, or Next's prefetch 404s (same as the footer's link). */}
            <a
              href={aiJourneyHref(service)}
              className="inline-block border-b border-paper/40 py-1 text-sm font-bold text-paper transition-colors hover:border-paper"
            >
              See it running on the AI page
            </a>
          </div>
        </div>

        <Reveal delay={120} className="lg:self-center">
          <ServiceFigure figure={service.figure} />
        </Reveal>
      </div>
    </section>
  );
}
