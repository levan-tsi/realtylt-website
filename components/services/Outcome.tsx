import { Reveal } from "@/components/ui/Reveal";
import type { Service } from "@/lib/services";

/** The stakes, stated once, in large type. This is `COPY.why` from the /ai journey.
 * The stat is pulled out as the visual only when it is a number we already publish. */
export function Outcome({ service }: { service: Service }) {
  const { stat, why } = service;

  return (
    <section className="bg-mist py-14 md:py-20" aria-labelledby="outcome-heading">
      <h2 id="outcome-heading" className="sr-only">
        Why it matters
      </h2>
      <div
        className={`mx-auto max-w-7xl px-4 lg:px-8 ${
          stat ? "grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-16" : ""
        }`}
      >
        {stat && (
          <Reveal className="lg:border-r lg:border-ink/10 lg:pr-16">
            <p className="text-7xl font-semibold leading-none tracking-tight text-ink md:text-8xl">
              {stat.value}
            </p>
            <span aria-hidden className="mt-5 block h-[3px] w-12 rounded-full bg-porchlight" />
            <p className="mt-4 max-w-[16rem] text-sm leading-snug text-stone">{stat.label}</p>
            {/* The derivation, beside the number rather than in a footnote nobody scrolls to.
                A figure this size is the most quoted thing on the page, so it is the one that
                most needs to say where it came from. */}
            {stat.source && (
              <p className="mt-3 max-w-[16rem] text-xs leading-snug text-stone/80">
                <a
                  href={stat.source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-ink/20 underline-offset-2 hover:decoration-ink/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  {stat.source.text}
                </a>
              </p>
            )}
          </Reveal>
        )}

        <Reveal delay={stat ? 120 : 0}>
          <p
            className={`text-2xl font-light leading-[1.45] text-ink-soft md:text-[28px] ${
              stat ? "" : "mx-auto max-w-4xl"
            }`}
          >
            {why}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
