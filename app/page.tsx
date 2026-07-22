import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialBand } from "@/components/ui/TestimonialBand";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { LeadForm } from "@/components/leads/LeadForm";
import { RailPager } from "@/components/idx/RailPager";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { HomeHeroVideo } from "@/components/home/HomeHeroVideo";
import { WhyCarousel } from "@/components/home/WhyCarousel";
import { TESTIMONIALS } from "@/content/testimonials";
import { getIdxClient, isSampleData } from "@/lib/idx";
import { COUNTIES, SERVED_AREAS } from "@/lib/site";

// Re-render hourly in live mode so the listing rails + "Data last updated" stay honest.
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

export const metadata: Metadata = {
  title: "RealtyLT | Levan Tsiklauri | United Real Estate | Hudson Valley & NYC Homes",
  description:
    "Let's find home. Search homes for sale across the Hudson Valley and all five NYC boroughs, or get your home's value and a cash offer in 24 hours.",
};

export default async function HomePage() {
  const idx = getIdxClient();
  // Pull a 24-deep pool per rail (exactly 3 pages of 8) so the rails page like live's.
  const [featured, fresh] = await Promise.all([idx.getFeatured(24), idx.getNew(24)]);
  const fixture = isSampleData(); // after the awaits — reflects what was actually served
  const dataLastUpdated =
    [...featured, ...fresh].map((l) => l.modificationTimestamp).sort().pop() ??
    new Date().toISOString();

  return (
    <>
      {/* ── Hero — live: dark B/W photo, "Let's Find Home" bottom-left, search strip below */}
      <section className="relative isolate bg-ink" aria-labelledby="home-hero">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            {/* Static poster — the ambient Vimeo clip's OWN first frame (fetched via its
                oEmbed thumbnail, 1920w, public/images/hero/hero-vimeo-frame.jpg). Using the
                video's own frame means poster-mode looks identical to the video's opening, so
                mobile, reduced-motion and no-JS visitors see the same image and the desktop
                video never flashes black while it loads. (Old dark asset hom.png kept in repo.) */}
            <Image
              src="/images/hero/hero-vimeo-frame.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center grayscale"
            />
            {/* Desktop-only ambient Vimeo background video, faded in over the poster. */}
            <HomeHeroVideo />
            {/* Scrim: a light overall wash + a stronger bottom gradient so the white
                headline clears contrast over either the poster or the video. */}
            <div className="absolute inset-0 bg-black/25" />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
            />
          </div>
          {/* Live: ~670px photo band, headline alone bottom-left (h1 lands ~y=796 @1280) */}
          <div className="relative mx-auto flex min-h-[420px] max-w-[1250px] flex-col justify-end px-4 pb-10 pt-24 md:min-h-[655px] lg:px-16">
            <h1
              id="home-hero"
              className="text-5xl font-light leading-tight text-paper md:text-[60px]"
            >
              Let&rsquo;s Find <span className="font-bold">Home</span>
            </h1>
          </div>
        </div>

        {/* Search strip — live: dark bar with search input + white outline CTAs */}
        <div className="mx-auto flex max-w-[1250px] flex-col gap-3 px-4 py-5 lg:flex-row lg:px-8">
          <form action="/search" role="search" className="flex flex-1">
            <label htmlFor="home-search" className="sr-only">
              Search for homes by town, zip, or address
            </label>
            <LocationSuggest
              id="home-search"
              dark
              placeholder="Search for Homes"
              className="w-full border border-paper/30 bg-white/10 px-5 py-[23px] text-paper placeholder:text-paper/60 focus:border-paper/60 focus:outline-none"
            />
            <Button type="submit" variant="outline-light" className="shrink-0">
              Search
            </Button>
          </form>
          <Button href="/selling" variant="outline-light" className="py-[23px]">
            Sell Your Home
          </Button>
          <Button href="/home-value" variant="outline-light" className="py-[23px]">
            See Home Value
          </Button>
        </div>

        {/* Scroll cue — subtle "more below" chevron, like live's */}
        <div className="flex justify-center pb-6">
          <ScrollCue targetId="value" label="Scroll to home value" />
        </div>
      </section>

      {/* ── Home value split — live: "Find Your Home Value" + "Tell Us About Your Home" form */}
      <section id="value" className="bg-paper py-[60px]" aria-labelledby="value-heading">
        <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="value-heading">Find Your Home Value</span>
            </SectionHeading>
            <p className="mt-5 max-w-lg leading-relaxed text-stone">
              If you&rsquo;re thinking about selling, start with a real number. We belong to one of
              the strongest real estate brokerages in the area, and we&rsquo;ve built our
              reputation on straight answers and careful work, from pricing to closing.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-stone">
              Tell us about your home and we&rsquo;ll put our market analysis and our network of
              local experts to work on an accurate estimate. No obligation, no pressure.
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
            {/* Live home-page form: First/Last 2-up, then Email, Phone, Property Address,
                Message stacked single-column (no interest dropdown). Wiring/validation/
                honeypot unchanged; intent still reaches the CRM via the hidden reason. */}
            <LeadForm
              splitName
              withAddress
              stackAddressRow
              hideReason
              defaultReason="I'm interested in selling a home"
              submitLabel="Send Message"
              successTitle="Got it. Thanks."
              successBody="We'll start on your home's numbers and reach out shortly."
            />
          </Reveal>
        </div>
      </section>

      {/* ── Featured listings — live: centered heading, 4-col grid, centered SEE MORE */}
      <section className="bg-paper pt-16 pb-8 md:pt-20" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2" bold>
              <span id="featured-heading">Featured Listings</span>
            </SectionHeading>
          </Reveal>
          {/* Mobile: swipeable card rail; ≥sm the live 4-col grid — paged 8 at a time */}
          <RailPager listings={featured} ariaLabel="Featured listings" eager />
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-8 text-center">
            <Button href="/search" variant="outline">See More Listings</Button>
          </div>
        </div>
      </section>

      {/* ── Testimonial band — live: ONE centered quote with arrows between the two rails */}
      <TestimonialBand items={TESTIMONIALS} />

      {/* ── New listings */}
      <section className="bg-paper pt-16 pb-8 md:pt-20" aria-labelledby="new-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2" bold>
              <span id="new-heading">New Listings</span>
            </SectionHeading>
          </Reveal>
          <RailPager listings={fresh} ariaLabel="New listings" />
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-8 text-center">
            <Button href="/search?sort=newest" variant="outline">See More Listings</Button>
          </div>
        </div>
      </section>

      {/* ── Counties strip */}
      <section className="bg-paper pb-16" aria-labelledby="counties-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <h2 id="counties-heading" className="sr-only">
            Counties we serve
          </h2>
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-3 border-t border-[#dddddd] pt-10">
            {SERVED_AREAS.map((c) => (
              <li key={c.slug}>
                <Link
                  // Boroughs have no editorial /top-areas page yet — send them to search.
                  href={
                    COUNTIES.some((k) => k.slug === c.slug)
                      ? `/top-areas/${c.slug}`
                      : `/search?county=${c.slug}`
                  }
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
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2" bold>
              <span id="why-heading">Why Work With Us?</span>
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-2xl text-center text-stone">
              The tools of a big brokerage, the attention of one agent: from the best tools and
              technology to transparency throughout the entire process.
            </p>
          </Reveal>
          {/* Live's laptop CAROUSEL of device screenshots (replaces our 4 static cards). */}
          <Reveal>
            <WhyCarousel />
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-[#dddddd] pt-10 text-center md:grid-cols-4">
            <StatCounter value={11} label="Counties & boroughs served" />
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
