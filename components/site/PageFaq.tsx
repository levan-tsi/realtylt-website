import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PageFaqItem } from "@/lib/page-faqs";

/** The marketing-page FAQ block — the services Faq pattern (components/services/Faq.tsx),
 * generalized for /buying, /selling, /financing (round 39).
 *
 * Same reasons as the original: native <details>, so every answer is in the HTML whether
 * or not it is expanded and whether or not JavaScript runs; the first row open so the
 * section reads as content rather than a wall of closed drawers. The matching FAQPage
 * JSON-LD comes from lib/page-faqs.ts and is emitted by the page, not here. */
export function PageFaq({ topic, faqs }: { topic: string; faqs: PageFaqItem[] }) {
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
              The questions people actually ask about {topic}, answered the way we would answer
              them on the phone. If yours is not here, ask us and we will add it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border-t border-line">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 transition-colors hover:text-porchlight-deep [&::-webkit-details-marker]:hidden">
                  <h3 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-porchlight-deep">
                    {f.q}
                  </h3>
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-2xl font-light leading-none text-ink-soft transition-all duration-300 group-open:rotate-45 group-open:text-porchlight"
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
