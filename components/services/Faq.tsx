import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** The part an AI assistant actually quotes.
 *
 * Native <details>, so the answers are in the HTML whether or not they are expanded, and
 * whether or not JavaScript runs. An accordion built out of useState would hide the text
 * from the crawler that this whole section exists to feed. */
export function Faq({ service }: { service: Service }) {
  return (
    <section id="faq" className="scroll-mt-24 bg-paper py-16 md:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1fr_1.75fr] lg:gap-20 lg:px-8">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="Questions" as="h2">
              <span id="faq-heading">
                Asked and <strong className="font-bold">answered</strong>
              </span>
            </SectionHeading>
            <p className="mt-5 max-w-sm leading-relaxed text-stone">
              The questions people actually ask about {service.name}, answered the way we would
              answer them on the phone. If yours is not here, ask us and we will add it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-[#dddddd]">
            {service.faqs.map((f, i) => (
              // First one open: a column of seven closed rows is a section a visitor scrolls
              // past. The rest stay closed, and their answers are in the HTML regardless.
              <details key={f.q} open={i === 0} className="group border-b border-[#dddddd]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 transition-colors hover:text-porchlight-deep [&::-webkit-details-marker]:hidden">
                  <h3 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-porchlight-deep">
                    {f.q}
                  </h3>
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-2xl font-light leading-none text-ink-soft transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-stone">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
