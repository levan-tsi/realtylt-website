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
            <p className="text-6xl font-semibold leading-none tracking-tight text-ink md:text-7xl">
              {stat.value}
            </p>
            <p className="mt-3 max-w-[16rem] text-sm leading-snug text-stone">{stat.label}</p>
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
