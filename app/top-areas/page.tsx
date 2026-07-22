import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { COUNTY_CONTENT } from "@/content/counties";
import { BOROUGH_CONTENT } from "@/content/boroughs";
import { fmtM } from "@/lib/format";

export const metadata: Metadata = {
  title: "Top Areas | Hudson Valley Counties & NYC Boroughs",
  description:
    "Explore the six Hudson Valley counties (Westchester, Rockland, Putnam, Orange, Dutchess, Ulster) and all five NYC boroughs we serve, with local market notes and homes for sale in each.",
};

export default function TopAreasPage() {
  return (
    <>
      {/* ── Hero — thin photo band, centered light+bold title */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="areas-hero">
        <div className="absolute inset-0">
          <Image
            src="/images/counties/dutchess.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative mx-auto max-w-[1250px] px-4 py-16 text-center lg:px-8">
          <h1 id="areas-hero" className="text-3xl font-light text-paper md:text-4xl">
            Top <strong className="font-bold">Areas</strong>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-paper/85">
            Everything we do happens along the Hudson, from Westchester&rsquo;s commuter villages
            in the south to Ulster&rsquo;s Catskill towns in the north. Each county has its own
            price band, commute story, and way of life.
          </p>
        </div>
      </section>

      {/* ── County cards */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="county-cards">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="county-cards">Where Do You See Yourself?</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTY_CONTENT.map((c, i) => (
              <Reveal key={c.slug} as="li" delay={(i % 3) * 110}>
                <article className="lift group relative h-full overflow-hidden border border-[#dddddd] bg-white">
                  <Link href={`/top-areas/${c.slug}`} className="absolute inset-0 z-10" aria-label={`Explore ${c.name}`} />
                  <div className="photo-zoom relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={c.heroImage}
                      alt={`${c.name} landscape`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute bottom-3 left-3 bg-ink/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper">
                      median {fmtM(c.medianPrice)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-ink">{c.name}</h3>
                    <p className="mt-1 text-sm text-stone">{c.tagline}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-stone">
                      {c.towns.slice(0, 4).join(" · ")}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── NYC boroughs */}
      <section className="border-t border-[#eeeeee] bg-paper pb-16 md:pb-24" aria-labelledby="borough-cards">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="borough-cards">The Five Boroughs</span>
            </SectionHeading>
          </Reveal>
          <p className="mx-auto mt-3 max-w-2xl text-center text-stone">
            We list and sell across New York City too. Browse current homes for sale in each borough.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BOROUGH_CONTENT.map((b, i) => (
              <Reveal key={b.slug} as="li" delay={(i % 3) * 110}>
                <article className="lift group relative h-full overflow-hidden border border-[#dddddd] bg-white">
                  <Link href={`/top-areas/${b.slug}`} className="absolute inset-0 z-10" aria-label={`Explore ${b.name}`} />
                  <div className="flex items-center justify-between bg-ink px-5 py-4">
                    <h3 className="text-lg font-bold text-paper">{b.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-paper/60">New York City</span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-stone">{b.tagline}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-ink underline decoration-ink/20 underline-offset-4 transition-colors group-hover:decoration-ink">
                      See homes for sale
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
        <div className="mx-auto flex max-w-[1250px] flex-col items-center gap-5 px-4 text-center lg:px-8">
          <p className="max-w-xl text-2xl font-light text-ink">
            Not sure which county fits? That&rsquo;s literally our job.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/connect">Talk It Through With Us</Button>
            <Button href="/search" variant="outline">Browse All Listings</Button>
          </div>
        </div>
      </section>
    </>
  );
}
