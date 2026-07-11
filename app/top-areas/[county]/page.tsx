import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { COUNTY_CONTENT, getCounty } from "@/content/counties";
import { fmtM } from "@/lib/format";
import { getIdxClient, isSampleData } from "@/lib/idx";
import { SITE, type CountySlug } from "@/lib/site";

export function generateStaticParams() {
  return COUNTY_CONTENT.map((c) => ({ county: c.slug }));
}
export const dynamicParams = false;
// Re-render hourly in live mode so listing counts + "Data last updated" stay honest.
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county } = await params;
  const c = getCounty(county);
  if (!c) return { title: "Area not found" };
  return {
    title: `${c.name} Homes for Sale — ${c.tagline}`,
    description: `${c.overview.slice(0, 155)}…`,
    alternates: { canonical: `${SITE.url}/top-areas/${c.slug}` },
  };
}

export default async function CountyPage({ params }: { params: Promise<{ county: string }> }) {
  const { county } = await params;
  const c = getCounty(county);
  if (!c) notFound();

  const result = await getIdxClient().search({ county: c.slug as CountySlug, pageSize: 6 });
  const fixture = isSampleData();

  return (
    <>
      {/* ── Hero */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="county-hero">
        <div className="absolute inset-0">
          <Image
            src={c.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative mx-auto max-w-[1250px] px-4 py-20 md:py-24 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.14em] text-paper/60">
            <Link href="/top-areas" className="hover:text-paper">Top Areas</Link> / {c.short}
          </nav>
          <h1 id="county-hero" className="mt-3 text-4xl font-light leading-tight text-paper md:text-5xl">
            {c.short} <strong className="font-bold">County</strong>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-paper/85">{c.tagline}</p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-paper/60">Median price</dt>
              <dd className="mt-1 text-2xl font-bold text-paper">{fmtM(c.medianPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-paper/60">Homes on market here</dt>
              <dd className="mt-1 text-2xl font-bold text-paper">{result.total}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Local knowledge */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="local-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="local-heading">Living in <strong className="font-bold">{c.short}</strong></span>
            </SectionHeading>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <Reveal>
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-ink-soft">The market</h3>
              <p className="mt-3 leading-relaxed text-stone">{c.overview}</p>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-ink-soft">The lifestyle</h3>
              <p className="mt-3 leading-relaxed text-stone">{c.lifestyle}</p>
            </Reveal>
            <Reveal delay={200}>
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-ink-soft">The commute</h3>
              <p className="mt-3 leading-relaxed text-stone">{c.commute}</p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <div className="h-full bg-mist p-7">
                <h3 className="text-xl font-bold text-ink">Why buy here</h3>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {c.whyBuy.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span aria-hidden className="mt-0.5 font-bold">✓</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full border border-[#dddddd] bg-white p-7">
                <h3 className="text-xl font-bold text-ink">Towns we work</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.towns.map((t) => (
                    <li key={t}>
                      <Link
                        href={`/search?q=${encodeURIComponent(t)}`}
                        className="inline-block border border-[#cccccc] px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Pre-filtered listings */}
      <section className="bg-mist py-16 md:py-20" aria-labelledby="county-listings">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="county-listings">Homes for Sale in {c.short}</span>
            </SectionHeading>
          </Reveal>
          {result.listings.length === 0 ? (
            <p className="mt-8 border border-dashed border-[#cccccc] p-10 text-center text-sm text-stone">
              Nothing on the market right this moment — save a search and we&rsquo;ll flag new
              {" " + c.short} listings for you.
            </p>
          ) : (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.listings.map((l) => (
                <li key={l.id}>
                  <ListingCard listing={l} variant="plain" />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 text-center">
            <Button href={`/search?county=${c.slug}`} variant="outline">
              See All {result.total} Listings
            </Button>
          </div>
          <MlsAttribution dataLastUpdated={result.dataLastUpdated} fixtureMode={fixture} className="mt-8" />
        </div>
      </section>

      {/* ── Area CTA */}
      <section className="bg-ink py-14 text-paper" aria-label={`Work with us in ${c.name}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center lg:px-8">
          <p className="max-w-2xl text-2xl font-light md:text-3xl">
            Buying or selling in {c.short}? We know these roads.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/connect" variant="light">Talk To A Local Agent</Button>
            <Button href="/home-value" variant="outline-light">
              What&rsquo;s My {c.short} Home Worth?
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
