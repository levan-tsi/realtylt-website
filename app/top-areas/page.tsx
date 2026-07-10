import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ValleyMap } from "@/components/valley-line/ValleyMap";
import { COUNTY_CONTENT } from "@/content/counties";

export const metadata: Metadata = {
  title: "Top Areas — Six Counties Along the Hudson",
  description:
    "Explore the six Hudson Valley counties we serve — Westchester, Rockland, Putnam, Orange, Dutchess and Ulster — with local market notes, commute times, and homes for sale in each.",
};

const fmtM = (n: number) => `$${Math.round(n / 1000)}K`;

export default function TopAreasPage() {
  return (
    <>
      {/* ── Hero: the Valley Line */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="areas-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">Top areas</p>
            <h1 id="areas-hero" className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Six counties, <span className="text-porchlight">one river</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-paper/80">
              Everything we do happens along the Hudson — from Westchester&rsquo;s commuter villages
              in the south to Ulster&rsquo;s Catskill towns in the north. Each county has its own
              price band, commute story, and way of life. Pick a marker and start exploring.
            </p>
            <ul className="mt-8 space-y-2.5 border-t border-paper/10 pt-6">
              {COUNTY_CONTENT.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/top-areas/${c.slug}`}
                    className="group flex items-baseline justify-between gap-4 rounded-[2px] px-2 py-1.5 transition-colors hover:bg-paper/5"
                  >
                    <span className="font-semibold text-paper group-hover:text-porchlight">{c.name}</span>
                    <span className="font-mono text-xs text-paper/50">median {fmtM(c.medianPrice)} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Reveal delay={120}>
            <ValleyMap />
          </Reveal>
        </div>
      </section>

      {/* ── County cards */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="county-cards">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Choose your county" as="h2">
              <span id="county-cards">Where do you see yourself?</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTY_CONTENT.map((c, i) => (
              <Reveal key={c.slug} as="li" delay={(i % 3) * 110}>
                <article className="lift group relative h-full overflow-hidden rounded-[2px] border border-ink/10 bg-white">
                  <Link href={`/top-areas/${c.slug}`} className="absolute inset-0 z-10" aria-label={`Explore ${c.name}`} />
                  <div className="photo-zoom relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={c.heroImage}
                      alt={`${c.name} landscape`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-3 left-3 rounded-[2px] bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-porchlight backdrop-blur">
                      median {fmtM(c.medianPrice)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl text-ink group-hover:text-porchlight-deep">{c.name}</h3>
                    <p className="mt-1 text-sm text-stone">{c.tagline}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-stone">
                      {c.towns.slice(0, 4).join(" · ")}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA */}
      <section className="bg-mist py-14" aria-label="Get local advice">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center lg:px-8">
          <p className="max-w-xl font-display text-2xl text-ink">
            Not sure which county fits? That&rsquo;s literally our job.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/connect" size="lg">Talk it through with us</Button>
            <Button href="/search" variant="outline" size="lg">Browse all listings</Button>
          </div>
        </div>
      </section>
    </>
  );
}
