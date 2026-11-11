import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** The steps, on a rail. Ink section: it is the spine of the page and it should read
 * that way. Big index numerals carry the hierarchy, so no icons are needed and none are
 * invented. */
export function HowItWorks({ service }: { service: Service }) {
  return (
    <section id="how-it-works" className="daylight scroll-mt-24 bg-ink py-16 text-paper md:py-24" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="How it works" dark as="h2">
            <span id="how-heading">
              What we do, <strong>step by step</strong>
            </span>
          </SectionHeading>
        </Reveal>

        <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:mt-16 lg:gap-x-16">
          {service.howItWorks.map((step, i) => (
            <Reveal key={step.title} as="li" delay={(i % 2) * 110}>
              <div className="relative flex gap-6 border-t border-paper/15 pt-6">
                {/* porchlight signal lead on the step's top rule — the page's connective accent */}
                <span aria-hidden className="absolute -top-px left-0 h-px w-10 bg-porchlight" />
                <span
                  aria-hidden
                  className="shrink-0 text-3xl font-light leading-none tabular-nums text-porchlight"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold leading-snug text-paper">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-paper/70">{step.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        {/* Round 28: who does what. Inside this section rather than a section of its own, so the
            page keeps its rhythm and its table of contents (lib/services/toc.ts). */}
        {service.handoff && (
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:mt-20 lg:gap-16">
            {(
              [
                ["What the owner provides", service.handoff.provides],
                ["What a person still approves", service.handoff.approves],
              ] as const
            ).map(([label, items], i) => (
              <Reveal key={label} delay={i * 110}>
                <h3 className="text-xl font-bold leading-snug text-paper">{label}</h3>
                <ul className="mt-5 border-t border-paper/15">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 border-b border-paper/15 py-4 leading-relaxed text-paper/80">
                      <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-porchlight" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
