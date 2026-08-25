import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** What the service will NOT do. The structural gap the blog standard closed and the
 * commercial surface had not (SERVICES-CRITIQUE.md §4).
 *
 * `docs/blog-flagship/STANDARD.md` §1 makes `hasLimitsSection` a required boolean for every
 * flagship post, on the grounds that a business owner's fourth question is "what will it not
 * do, where does this break". All five flagships carry it. The twenty service pages, which are
 * the ones that rank and the ones an AI answer lifts from, had nowhere to put it, and five of
 * them contained no limiting language anywhere at all.
 *
 * NO NEW VISUAL LANGUAGE. Mist ground, because it sits between a paper section (UseCases) and
 * an ink one (SeeItLive) and mist is this site's alt-section background, already used by the
 * outcome band on the same page. The layout is the FAQ's: a sticky heading column and a column
 * of hairline-divided rows. A bulleted list with the porchlight dot was drawn first and
 * rejected on sight, because the dot is this site's affirmative marker and putting it in front
 * of "it will not invent a price" makes a limitation read as a feature. */
export function Limits({ service }: { service: Service }) {
  return (
    <section id="limits" className="scroll-mt-24 bg-mist py-16 md:py-24" aria-labelledby="limits-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.75fr] lg:gap-20 lg:px-8">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="Limits" as="h2">
              <span id="limits-heading">
                What it <strong className="font-bold">does not do</strong>
              </span>
            </SectionHeading>
            <p className="mt-5 max-w-sm leading-relaxed text-stone">
              Every other section on this page is selling you something. This is the one that
              says where it stops. If a vendor cannot tell you this about their own product, you
              have learned something anyway.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ul className="border-t border-line">
            {service.limits.map((limit) => (
              <li
                key={limit}
                className="border-b border-line py-5 text-lg leading-relaxed text-ink-soft"
              >
                {limit}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
