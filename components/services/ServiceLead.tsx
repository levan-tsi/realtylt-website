import Image from "next/image";
import { LeadForm } from "@/components/leads/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";
import type { Service } from "@/lib/services";

/** The conversion surface. Reuses the one LeadForm and the one /api/lead pipeline; the
 * only thing that changes is `source`, which lands in the CRM as /services/<slug> so it is
 * obvious which service the person was reading when they asked. */
export function ServiceLead({ service }: { service: Service }) {
  return (
    <section
      id="service-lead"
      className="scroll-mt-24 bg-ink py-16 text-paper md:py-24"
      aria-labelledby="lead-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:px-8">
        <Reveal>
          <h2 id="lead-heading" className="text-3xl font-light leading-tight text-paper md:text-4xl">
            Want {service.name} <strong className="font-bold">running in your business?</strong>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-paper/75">
            Tell us what you do today and we will tell you honestly whether this is the right place to
            start. If it is not, we will say which one is.
          </p>

          <div className="mt-9 flex items-center gap-5 border-t border-paper/15 pt-8">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <Image
                src="/images/levan-portrait.jpg"
                alt=""
                fill
                sizes="64px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="font-bold text-paper">Levan Tsiklauri</p>
              <p className="mt-0.5 text-sm text-paper/60">
                Builds these. Answers the phone himself.
              </p>
              <a
                href={SITE.phoneHref}
                className="mt-1.5 inline-block border-b border-paper/40 py-1 text-sm font-bold text-paper transition-colors hover:border-paper"
              >
                {SITE.phone}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={130}>
          <div className="border border-paper/20 bg-white/[0.04] p-6 md:p-8">
            <LeadForm
              dark
              hideReason
              source={`/services/${service.slug}`}
              submitLabel="Send it over"
              successTitle="Got it."
              successBody="We will read what you sent and come back to you today, usually within the hour."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
