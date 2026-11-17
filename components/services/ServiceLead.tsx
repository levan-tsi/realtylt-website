import Image from "next/image";
import { LeadForm } from "@/components/leads/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";
import type { Service } from "@/lib/services";

/** The closing call (round 28): the two free doors of the AI plan, worded exactly as the CTA
 * pack has them (realtylt-agents company/plans/ai-week1/CTA-2, section 4; versions C, D and
 * E). Line 1 and the address line are fixed; line 2 is the one variable.
 *
 * The quiz address is written as TEXT, not a link, until it answers (CTA-2 section 0: the
 * quiz is not live). The posts do the same. When it opens, the address becomes the button.
 *
 * The form stays as the working way in today. It reuses the one LeadForm and the one
 * /api/lead pipeline; `source` lands in the CRM as /services/<slug>. */
const DOORS = {
  both: { lead: "Two free places", strong: "to start", reason: "Five free assessments and five free websites, by application." },
  assessment: { lead: "The free", strong: "AI assessment", reason: "Five businesses get the full assessment free, by application." },
  website: { lead: "A free", strong: "website", reason: "Five businesses get a plain website built free, by application." },
} as const;

export function ServiceLead({ service }: { service: Service }) {
  const door = DOORS[service.door ?? "both"];
  return (
    <section
      id="service-lead"
      className="daylight scroll-mt-24 bg-ink py-16 text-paper md:py-24"
      aria-labelledby="lead-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:px-8">
        <Reveal>
          <h2 id="lead-heading" className="t-h2 text-paper">
            {door.lead} <strong>{door.strong}</strong>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/85">{door.reason}</p>
          <p className="mt-6 max-w-md leading-relaxed text-paper/75">
            Apply through the free AI quiz:{" "}
            <span className="whitespace-nowrap font-bold text-paper">realtylt.com/ai/assessment</span>
          </p>
          <p className="mt-3 max-w-md leading-relaxed text-paper/75">
            The quiz is free. Or tell us about the business in the form, and we reply.
          </p>

          <div className="mt-9 flex items-center gap-5 border-t border-paper/15 pt-8">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <Image
                src="/images/levan-portrait.jpg"
                alt=""
                fill
                sizes="64px"
                className="object-cover object-top grayscale"
              />
            </div>
            <div>
              <p className="font-bold text-paper">Levan Tsiklauri</p>
              <p className="mt-0.5 text-sm text-paper/60">Builds these for local businesses.</p>
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
          <div className="rounded-3xl border border-paper/20 bg-white/[0.04] p-6 shadow-panel md:p-8">
            <LeadForm
              dark
              hideReason
              source={`/services/${service.slug}`}
              submitLabel="Send it over"
              successTitle="Got it."
              successBody="We will read what you sent and reply by email or phone."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
