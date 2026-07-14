import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** The steps, on a rail. Ink section: it is the spine of the page and it should read
 * that way. Big index numerals carry the hierarchy, so no icons are needed and none are
 * invented. */
export function HowItWorks({ service }: { service: Service }) {
  return (
    <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="how-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="How it works" dark as="h2">
            <span id="how-heading">
              What happens, <strong className="font-bold">in order</strong>
            </span>
          </SectionHeading>
        </Reveal>

        <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:mt-16 lg:gap-x-16">
          {service.howItWorks.map((step, i) => (
            <Reveal key={step.title} as="li" delay={(i % 2) * 110}>
              <div className="flex gap-6 border-t border-paper/15 pt-6">
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
      </div>
    </section>
  );
}
