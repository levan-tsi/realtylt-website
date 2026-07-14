import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** Concrete situations, not benefits. Every card is a scene a working agent recognises,
 * which is also what makes them quotable when somebody asks an assistant "what would I
 * actually use this for".
 *
 * Bordered cards rather than a hairline-gap grid on purpose: services carry three or four
 * cases, and an odd count in a two-column gap grid leaves a visible empty cell. */
export function UseCases({ service }: { service: Service }) {
  return (
    <section className="bg-paper py-16 md:py-24" aria-labelledby="cases-heading">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Use cases" as="h2">
            <span id="cases-heading">
              Where it <strong className="font-bold">earns its keep</strong>
            </span>
          </SectionHeading>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {service.useCases.map((c, i) => (
            <Reveal key={c.title} as="li" delay={(i % 2) * 100} className="min-w-0">
              <article className="h-full border border-[#dddddd] bg-white p-7 transition-colors hover:border-ink/35 md:p-9">
                <p
                  aria-hidden
                  className="text-xs font-bold tabular-nums tracking-[0.2em] text-porchlight-deep"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{c.title}</h3>
                <p className="mt-3 leading-relaxed text-stone">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
