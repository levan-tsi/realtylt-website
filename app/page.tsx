import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { ValleyDivider } from "@/components/valley-line/ValleyLine";
import { LeadForm } from "@/components/leads/LeadForm";
import { ListingCarousel } from "@/components/idx/ListingCarousel";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { GOOGLE_REVIEWS_URL, TESTIMONIALS } from "@/content/testimonials";
import { getIdxClient, isFixtureMode } from "@/lib/idx";
import { COUNTIES } from "@/lib/site";

// Re-render hourly in live mode so the listing rails + "Data last updated" stay honest.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "RealtyLT | Levan Tsiklauri | United Real Estate — Hudson Valley Homes",
  description:
    "Let's find home. Search Hudson Valley homes for sale across Dutchess, Westchester, Putnam, Rockland, Ulster and Orange counties — or get your home's value and a cash offer in 24 hours.",
};

const WHY_US = [
  {
    title: "Two ways to sell",
    body: "A guaranteed cash offer in 24 hours, or a full-service listing for maximum profit. We show you both — you decide.",
  },
  {
    title: "Tools buyers actually use",
    body: "Pro photography, 3D walkthroughs, and listings syndicated to the MLS plus 100+ search sites.",
  },
  {
    title: "Transparency, start to finish",
    body: "Real-time updates on showings, feedback, and offers. You always know what's happening with your sale.",
  },
  {
    title: "Local, seven days a week",
    body: "Based in Lagrangeville, working the whole mid-Hudson region. Fast answers — evenings and weekends included.",
  },
];

export default async function HomePage() {
  const idx = getIdxClient();
  const fixture = isFixtureMode();
  const [featured, fresh] = await Promise.all([idx.getFeatured(8), idx.getNew(8)]);
  const dataLastUpdated =
    [...featured, ...fresh].map((l) => l.modificationTimestamp).sort().pop() ??
    new Date().toISOString();

  return (
    <>
      {/* ── Hero */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="home-hero">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero/hudson-twilight.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-zoom object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
        </div>
        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-porchlight">
            Hudson Valley · New York
          </p>
          <h1
            id="home-hero"
            className="mt-3 font-display text-5xl font-semibold leading-[1.04] tracking-tight text-paper md:text-7xl"
          >
            Let&rsquo;s find <span className="text-porchlight">home</span>.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-paper/80">
            Homes for sale across six counties of the mid-Hudson region — and an agent who answers
            seven days a week.
          </p>

          {/* Search bar → /search */}
          <form action="/search" role="search" className="mt-9 flex w-full max-w-2xl">
            <label htmlFor="home-search" className="sr-only">
              Search for homes by town, zip, or address
            </label>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder="Town, ZIP, or address — try “Beacon”"
              className="w-full rounded-[2px] border border-paper/25 bg-ink/60 px-5 py-4 text-paper backdrop-blur placeholder:text-paper/50 focus:border-paper/50 focus:outline-none focus:ring-2 focus:ring-porchlight/70"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Search
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/selling" variant="outline-light">Sell your home</Button>
            <Button href="/home-value" variant="outline-light">See your home&rsquo;s value</Button>
          </div>
        </div>
      </section>

      {/* ── Home value split */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="value-heading">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Find your home value" as="h2">
              <span id="value-heading">What is your home really worth?</span>
            </SectionHeading>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              If you&rsquo;re thinking about selling, start with a real number. We belong to one of
              the strongest real estate brokerages in the area, and we&rsquo;ve built our
              reputation on straight answers and careful work — from pricing to closing.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-stone">
              Tell us about your home and we&rsquo;ll put our market analysis — and our network of
              local experts — to work on an accurate estimate. No obligation, no pressure.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink">
              {[
                "A market analysis built from 15 comparable sales",
                "Your cash-offer number alongside the list price",
                "Honest advice on timing, prep, and what to skip",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5 text-porchlight-deep">✓</span> {li}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={140}>
            <div className="rounded-[2px] border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(16_24_32/0.25)] md:p-8">
              <h3 className="font-display text-2xl text-ink">Tell us about your home</h3>
              <p className="mb-5 mt-1 text-sm text-stone">We usually reply within the hour.</p>
              <LeadForm
                withAddress
                defaultReason="I'm interested in selling a home"
                submitLabel="Send Message"
                successTitle="Got it — thanks."
                successBody="We'll start on your home's numbers and reach out shortly."
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Featured listings */}
      <section className="bg-mist py-16 md:py-20" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Hand-picked" as="h2">
              <span id="featured-heading">Featured listings</span>
            </SectionHeading>
            <Button href="/search" variant="outline">See more listings</Button>
          </Reveal>
          <div className="mt-8">
            <ListingCarousel listings={featured} ariaLabel="Featured listings carousel" />
          </div>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
        </div>
      </section>

      {/* ── New listings */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="new-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Fresh on the market" as="h2">
              <span id="new-heading">New listings</span>
            </SectionHeading>
            <Button href="/search?sort=newest" variant="outline">See more listings</Button>
          </Reveal>
          <div className="mt-8">
            <ListingCarousel listings={fresh} ariaLabel="New listings carousel" />
          </div>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
        </div>
      </section>

      {/* ── Counties strip (Valley Line tease) */}
      <section className="bg-paper pb-16" aria-labelledby="counties-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <ValleyDivider />
          <h2 id="counties-heading" className="sr-only">
            Counties we serve
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-2 gap-y-3">
            {COUNTIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/top-areas/${c.slug}`}
                  className="rounded-[2px] border border-ink/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-porchlight hover:bg-porchlight/10"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Testimonials */}
      <section className="bg-mist py-16 md:py-20" aria-labelledby="home-reviews-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="From our clients" align="center" as="h2">
              <span id="home-reviews-heading">Kind words, real closings</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} as="li" delay={i * 120}>
                <TestimonialCard t={t} />
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 text-center">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-river underline-offset-4 hover:underline"
            >
              See all our Google reviews →
            </a>
          </p>
        </div>
      </section>

      {/* ── Why work with us */}
      <section className="bg-ink py-16 text-paper md:py-24" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading eyebrow="Why work with us" dark align="center" as="h2">
              <span id="why-heading">The tools of a big brokerage, the attention of one agent</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} as="li" delay={i * 100}>
                <div className="h-full rounded-[2px] border border-paper/10 bg-ink-soft p-6">
                  <p className="font-display text-xl text-paper">{w.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-paper/65">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <div className="mt-14 grid grid-cols-2 gap-8 border-t border-paper/10 pt-10 text-center md:grid-cols-4">
            <StatCounter value={6} label="Counties served" />
            <StatCounter value={24} suffix="h" label="Cash offer turnaround" />
            <StatCounter value={100} suffix="+" label="Sites your listing reaches" />
            <StatCounter value={7} label="Days a week we answer" />
          </div>
          <div className="mt-12 text-center">
            <Button href="/connect" size="lg">Talk to us</Button>
          </div>
        </div>
      </section>
    </>
  );
}
