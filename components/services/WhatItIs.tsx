import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Service } from "@/lib/services";

/** Plain-language prose, with the stack pinned beside it. The aside is what a technical
 * buyer scans for and an assistant quotes when asked "what is it built on". */
export function WhatItIs({ service }: { service: Service }) {
  return (
    <section className="bg-paper py-16 md:py-24" aria-labelledby="what-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[1.45fr_1fr] lg:gap-20 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="What it is" as="h2">
            <span id="what-heading">
              {service.name}, <strong className="font-bold">in plain terms</strong>
            </span>
          </SectionHeading>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone">
            {service.whatItIs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={140} className="lg:pt-2">
          <aside className="border-t-2 border-ink pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">
              What it runs on
            </p>
            <ul className="mt-5 divide-y divide-[#e3e6ea] border-y border-[#e3e6ea]">
              {service.specs.map((s) => (
                <li key={s} className="flex items-center gap-3 py-3.5">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-porchlight" />
                  <span className="text-sm text-ink-soft">{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-stone">
              Built on the tools you already run, not instead of them.
            </p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
