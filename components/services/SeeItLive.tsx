import { Constellation } from "@/components/services/Constellation";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { aiJourneyHref, type Service } from "@/lib/services";

/** The bridge back to realtylt.com/ai — the one place a visitor can actually touch this
 * stuff. `nodeIndex` is the service's position in the registry, so each page lights a
 * different node on the hub and the band never repeats itself across the site. */
export function SeeItLive({ service, nodeIndex }: { service: Service; nodeIndex: number }) {
  return (
    <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="live-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="See it live" dark as="h2">
            <span id="live-heading">
              Easier to understand when you can <strong className="font-bold">touch it</strong>
            </span>
          </SectionHeading>
          <p className="mt-6 max-w-lg leading-relaxed text-paper/75">
            Everything on this page is a node on the RealtyLT AI page: a galaxy that reshapes into a
            brain, with every service hanging off the core. Open the {service.name} node to read the
            same thing in its own habitat, and talk to the chat assistant while you are there,
            because that one is genuinely live.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {/* Plain anchors: /ai is a rewrite to the separate journey project (next.config.ts),
                not an RSC route — Next's <Link> would prefetch a payload that does not exist. */}
            {/* Label is service-agnostic on purpose: "Open the Skip Tracing & Lead
                Generation node" is a button two-thirds the width of the column. */}
            <a
              href={aiJourneyHref(service)}
              className="inline-flex items-center justify-center rounded-[4px] bg-paper px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-mist"
            >
              Open it on the AI page
            </a>
            <a
              href="/ai"
              className="inline-block border-b border-paper/40 py-1 text-sm font-bold text-paper transition-colors hover:border-paper"
            >
              Start at the galaxy
            </a>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <figure className="border border-paper/15 bg-ink-soft p-5 md:p-6">
            <Constellation
              count={12}
              lit={nodeIndex}
              label={`The AI page hub, with the ${service.name} node lit`}
            />
            <figcaption className="mt-4 border-t border-paper/10 pt-4 text-xs uppercase tracking-[0.18em] text-paper/60">
              <span className="text-porchlight">{service.name}</span>
              <span aria-hidden className="px-2 text-paper/25">
                /
              </span>
              one node on the hub
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
