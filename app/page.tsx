import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialBand } from "@/components/ui/TestimonialBand";
import { LeadForm } from "@/components/leads/LeadForm";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { TESTIMONIALS } from "@/content/testimonials";
import { getIdxClient, isFixtureMode } from "@/lib/idx";
import { COUNTIES } from "@/lib/site";

// Re-render hourly in live mode so the listing rails + "Data last updated" stay honest.
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

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
      {/* ── Hero — live: dark B/W photo, "Let's Find Home" bottom-left, search strip below */}
      <section className="relative isolate bg-ink" aria-labelledby="home-hero">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero/hudson-twilight.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-70 grayscale"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          {/* Live: shorter photo band, headline alone bottom-left (no subtitle) */}
          <div className="relative mx-auto flex min-h-[340px] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 lg:px-8">
            <h1
              id="home-hero"
              className="text-5xl font-light leading-tight text-paper md:text-[60px]"
            >
              Let&rsquo;s Find <span className="font-bold">Home</span>
            </h1>
          </div>
        </div>

        {/* Search strip — live: dark bar with search input + white outline CTAs */}
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 lg:flex-row lg:px-8">
          <form action="/search" role="search" className="flex flex-1">
            <label htmlFor="home-search" className="sr-only">
              Search for homes by town, zip, or address
            </label>
            <input
              id="home-search"
              type="search"
              name="q"
              placeholder="Search for Homes"
              className="w-full border border-paper/30 bg-white/10 px-5 py-4 text-paper placeholder:text-paper/60 focus:border-paper/60 focus:outline-none"
            />
            <Button type="submit" variant="outline-light" className="shrink-0">
              Search
            </Button>
          </form>
          <Button href="/selling" variant="outline-light" className="py-4">
            Sell Your Home
          </Button>
          <Button href="/home-value" variant="outline-light" className="py-4">
            See Home Value
          </Button>
        </div>
      </section>

      {/* ── Home value split — live: "Find Your Home Value" + "Tell Us About Your Home" form */}
      <section className="bg-paper py-16 md:py-24" aria-labelledby="value-heading">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="value-heading">Find Your Home Value</span>
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
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
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
            <h3 className="text-2xl font-light text-ink">Tell Us About Your Home</h3>
            <p className="mb-5 mt-1 text-sm text-stone">We usually reply within the hour.</p>
            <LeadForm
              withAddress
              defaultReason="I'm interested in selling a home"
              submitLabel="Send Message"
              successTitle="Got it — thanks."
              successBody="We'll start on your home's numbers and reach out shortly."
            />
          </Reveal>
        </div>
      </section>

      {/* ── Featured listings — live: centered heading, 4-col grid, centered SEE MORE */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="featured-heading">Featured Listings</span>
            </SectionHeading>
          </Reveal>
          {/* Mobile matches live: swipeable card rail; ≥sm the live 4-col grid */}
          <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {featured.map((l, i) => (
              <li key={l.id} className="w-[85%] shrink-0 snap-center sm:w-auto">
                <ListingCard listing={l} priority={i < 4} />
              </li>
            ))}
          </ul>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-8 text-center">
            <Button href="/search" variant="outline">See More Listings</Button>
          </div>
        </div>
      </section>

      {/* ── Testimonial band — live: ONE centered quote with arrows between the two rails */}
      <TestimonialBand items={TESTIMONIALS} />

      {/* ── New listings */}
      <section className="bg-paper py-16 md:py-20" aria-labelledby="new-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="new-heading">New Listings</span>
            </SectionHeading>
          </Reveal>
          <ul className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {fresh.map((l) => (
              <li key={l.id} className="w-[85%] shrink-0 snap-center sm:w-auto">
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-8 text-center">
            <Button href="/search?sort=newest" variant="outline">See More Listings</Button>
          </div>
        </div>
      </section>

      {/* ── Counties strip */}
      <section className="bg-paper pb-16" aria-labelledby="counties-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 id="counties-heading" className="sr-only">
            Counties we serve
          </h2>
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-3 border-t border-[#dddddd] pt-10">
            {COUNTIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/top-areas/${c.slug}`}
                  className="border border-[#cccccc] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-stone transition-colors hover:border-ink hover:text-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Why work with us — live: light gray section, centered heading */}
      <section className="bg-mist py-16 md:py-24" aria-labelledby="why-heading">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="why-heading">Why Work With Us?</span>
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-2xl text-center text-stone">
              The tools of a big brokerage, the attention of one agent — from the best tools and
              technology to transparency throughout the entire process.
            </p>
          </Reveal>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w, i) => (
              <Reveal key={w.title} as="li" delay={i * 100}>
                <div className="h-full border border-[#dddddd] bg-white p-6">
                  <p className="text-lg font-bold text-ink">{w.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <div className="mt-14 grid grid-cols-2 gap-8 border-t border-[#dddddd] pt-10 text-center md:grid-cols-4">
            <StatCounter value={6} label="Counties served" />
            <StatCounter value={24} suffix="h" label="Cash offer turnaround" />
            <StatCounter value={100} suffix="+" label="Sites your listing reaches" />
            <StatCounter value={7} label="Days a week we answer" />
          </div>
          <div className="mt-12 text-center">
            <Button href="/connect">Talk To Us</Button>
          </div>
        </div>
      </section>
    </>
  );
}
