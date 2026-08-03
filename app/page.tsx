import type { Metadata } from "next";
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
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import { COUNTIES, SERVED_AREAS } from "@/lib/site";
import { boroughPath } from "@/content/boroughs";

// Re-render hourly in live mode so the listing rails + "Data last updated" stay honest.
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

export const metadata: Metadata = {
  title: "RealtyLT | Hudson Valley & NYC Homes for Sale",
  description:
    "Let's find home. Search homes for sale across the Hudson Valley and all five NYC boroughs, or get your home's value and a cash offer in 24 hours.",
};

export default async function HomePage() {
  const idx = getIdxClient();
  // Pull a 24-deep pool per rail (exactly 3 pages of 8) so the rails page like live's.
  const [featured, fresh] = await Promise.all([idx.getFeatured(24), idx.getNew(24)]);
  const fixture = isSampleData(); // after the awaits — reflects what was actually served
  // The feed's refresh time, NOT the newest edit among whatever happens to be in these two rails.
  // "Data last updated" is a claim about how current the SITE is, so deriving it from a handful of
  // rail listings understates it: home read 5:01 AM while /search and the listing pages read
  // 12:08 PM off the same feed. Same accessor every other surface uses.
  const dataLastUpdated = await getDataLastUpdated(new Date().toISOString());

  return (
    <>
      {/* ── Hero. The photograph carries the WHOLE section — headline, search and the scroll
          cue all sit on it. Before round 11 the picture stopped at the headline and the search
          control, the most important control on the site, sat on a flat black shelf underneath
          it; the owner named that as the thing that made the page look unfinished. */}
      <section className="relative isolate overflow-hidden bg-ink" aria-labelledby="home-hero">
        <div className="absolute inset-0">
          {/* Poster — art-directed, and ONE fetch per visitor via <source media>.
              Desktop with motion gets the ambient Vimeo clip's own first frame, so the video
              fades in over an identical picture and never flashes a black boot; that file
              stands or falls with the clip and is the one hero asset still carrying no licence
              record (see ATTRIBUTIONS.md — it needs an owner decision, not a patch).
              Everyone else — every phone, and every reduced-motion visitor at any width — gets
              the Hudson Highlands above Breakneck Ridge, which we do hold a licence for. It
              replaced the vendor's unlicensed kitchen shot, and it says where this business
              works, which a kitchen never did. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- art-directed <picture>, single fetch */}
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet="/images/hero/valley-aerial.jpg" />
            <source media="(min-width: 1024px)" srcSet="/images/hero/hero-vimeo-frame.jpg" />
            <img
              src="/images/hero/valley-aerial.jpg"
              alt=""
              fetchPriority="high"
              decoding="async"
              className="hero-zoom absolute inset-0 h-full w-full object-cover object-center grayscale"
            />
          </picture>
          {/* Desktop-only ambient Vimeo background video, faded in over the poster. */}
          <HomeHeroVideo />
          {/* Scrim, two layers. A light overall wash keeps the picture readable as a picture;
              the bottom gradient is what the type actually sits on. Round 12 eased it (85%->80%,
              92->88, 58->50): the control stack is half its former height, so the gradient can
              hand the mid-frame back to the photograph. Floors re-measured after the ease with
              scripts/_scratch-r12-contrast.mjs — every hero text target clears with margin. */}
          <div aria-hidden className="absolute inset-0 bg-black/20" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black/88 via-black/50 to-transparent"
          />
        </div>

        {/* Mobile height is viewport-relative (svh, so browser chrome never causes a jump):
            with the control stack compacted to one bar + one text row, a fixed 540px hero
            ended mid-screen — the photograph should own the first phone viewport the way it
            owns the desktop one. max() keeps 540px as the floor for short/landscape phones. */}
        {/* pb tightened round 13 ("could be a little lower"): the group hangs closer to the
            section's bottom edge, and the scroll cue's own block below shrank to match. */}
        <div className="relative mx-auto flex min-h-[max(540px,82svh)] max-w-[1250px] flex-col justify-end px-4 pb-3 pt-24 md:min-h-[660px] md:pb-4 lg:px-16">
          {/* THE ARRIVAL. The hero is the page's thesis and it was landing all at once, fully
              formed, like a printed slide. Now the photograph settles (hero-zoom, 8s, 1.08 -> 1)
              while the words arrive in the order you would read them: place, promise, then the
              instrument to act on it. Reuses the site's existing .rise ladder rather than
              inventing a second motion vocabulary.
              LCP is safe here and it was measured, not assumed: the LCP element on this page is
              the hero IMAGE (median 1592ms on the dev server across 5 reps), and the image is
              never faded — only scaled, which does not delay its paint. Fading the headline
              instead of the photograph is the whole reason this costs nothing.
              Reduced motion is covered by the global block at the foot of globals.css, which
              collapses every animation to 0.01ms — so those visitors get the finished hero. */}
          <p className="t-eyebrow rise text-paper/70">Hudson Valley &amp; New York City</p>
          <h1 id="home-hero" className="t-display rise rise-2 mt-5 text-paper">
            Let&rsquo;s Find <strong>Home</strong>
          </h1>

          {/* One instrument, two quiet paths. The owner rejected both prior states of this
              control — input and button butted together (pre-11) and separated by a gap (11).
              The third reading is the right one: they share a single container, connected
              because they share a body, breathing because of the 4px inset. The two secondary
              CTAs lost their boxes entirely: four floating rectangles covered the picture,
              and the picture is the luxury. Radii stay concentric on the site scale —
              container 12px = button 8px + 4px inset. */}
          <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <form
              action="/search"
              role="search"
              className="search-instrument relative flex w-full max-w-[560px] items-center rounded-xl border border-paper/30 bg-black/45 p-1 backdrop-blur-[2px] transition-colors focus-within:bg-black/55 hover:border-paper/45"
            >
              <label htmlFor="home-search" className="sr-only">
                Search for homes by town, zip, or address
              </label>
              <LocationSuggest
                id="home-search"
                dark
                anchor="form"
                placeholder="Search for Homes"
                className="w-full bg-transparent px-4 py-2.5 text-paper placeholder:text-paper/60 focus:outline-none"
              />
              {/* Not <Button>: its 12px radius and lifting hover are wrong for a control that
                  lives inside another control — the nested action keeps still and lets the
                  container carry the focus state. */}
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-mist"
              >
                Search
              </button>
            </form>
            {/* Owner-directed, two refinements in one day: first "give it a box or proper
                recognizable CTA" (pills), then "similar box shape type as search but see
                through background" — so they share the search instrument's geometry now:
                12px corners, outlined, transparent fill with the photo showing through.
                Compact (40px) so they never re-become the big boxes that covered the video. */}
            <div className="flex items-center gap-x-3">
              <Link
                href="/selling"
                className="inline-flex min-h-[40px] items-center rounded-xl border border-paper/60 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
              >
                Sell Your Home
              </Link>
              <Link
                href="/home-value"
                className="inline-flex min-h-[40px] items-center rounded-xl border border-paper/60 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
              >
                See Home Value
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue — subtle "more below" chevron, now sitting on the photograph. */}
        <div className="relative flex justify-center pb-4">
          <ScrollCue targetId="value" label="Scroll to home value" />
        </div>
      </section>

      {/* ── Home value split — "Find Your Home Value" + "Tell Us About Your Home" form */}
      <section id="value" className="sec bg-paper" aria-labelledby="value-heading">
        <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <SectionHeading as="h2">
              <span id="value-heading">Find Your Home Value</span>
            </SectionHeading>
            {/* The owner's own words, verbatim — his copy, not ours to rewrite. What changed in
                round 11 is the SETTING: the opening paragraph reads a size up in the darker ink
                so the block has an entry point, the measure is tighter (max-w-md ~62 characters
                rather than a 90-character line), and the paragraphs are spaced further apart.
                Three dense grey paragraphs at one size was a wall. */}
            {[
              "So, you're ready to sell your home! Congratulations, you've come to the right place. We belong to one of the strongest real estate brokerages in the area. We have great confidence in our brand and you can, too. We demand excellence throughout the home-selling process.",
              "We have established a solid reputation for impeccable customer service and marketing strategies. When you entrust the sale of your home to us, you are putting your faith in our entire network of experts in Real estate sales, Real estate purchases, Loan processing and Marketing.",
              "Enter your information on this page to discover what your home is worth. We have experts in every area that have access to the resources needed to provide an accurate estimate.",
            ].map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "mt-7 max-w-md text-[17px] leading-[1.7] text-ink-soft"
                    : "mt-5 max-w-md leading-[1.75] text-stone"
                }
              >
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={140}>
            <h3 className="t-h3 mb-6 text-ink">Tell Us About Your Home</h3>
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

      {/* ── Featured listings. Heading stays centred: it sits over a symmetric card grid, which
          is the one case where centring is structure rather than decoration. */}
      <section className="sec bg-paper" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="featured-heading">Featured Listings</span>
            </SectionHeading>
          </Reveal>
          {/* Mobile: swipeable card rail; ≥sm a 4-col grid — paged 8 at a time */}
          <div className="mt-10">
            <RailPager listings={featured} ariaLabel="Featured listings" eager />
          </div>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-10 text-center">
            <Button href="/search" variant="outline">See More Listings</Button>
          </div>
        </div>
      </section>

      {/* ── Testimonial band — live: ONE centered quote with arrows between the two rails */}
      <TestimonialBand items={TESTIMONIALS} />

      {/* ── New listings */}
      <section className="sec bg-paper" aria-labelledby="new-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="new-heading">New Listings</span>
            </SectionHeading>
          </Reveal>
          <div className="mt-10">
            <RailPager listings={fresh} ariaLabel="New listings" />
          </div>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-10 text-center">
            <Button href="/search?sort=newest" variant="outline">See More Listings</Button>
          </div>
        </div>
      </section>

      {/* ── Counties strip. No top padding of its own: the hairline rule is what separates it
          from the listings above, and a second gap on top of that rule reads as a mistake. */}
      <section className="bg-paper pb-20 md:pb-28" aria-labelledby="counties-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <h2 id="counties-heading" className="sr-only">
            Counties we serve
          </h2>
          <ul className="flex flex-wrap justify-center gap-2 border-t border-line pt-12">
            {SERVED_AREAS.map((c) => (
              <li key={c.slug}>
                <Link
                  // Both counties and boroughs now have Top Areas pages; boroughs map their
                  // internal slug to the readable URL (bronx → /top-areas/the-bronx).
                  href={
                    COUNTIES.some((k) => k.slug === c.slug)
                      ? `/top-areas/${c.slug}`
                      : (boroughPath(c.slug) ?? `/search?county=${c.slug}`)
                  }
                  className="inline-flex min-h-[36px] items-center rounded-full border border-line px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-stone transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Why work with us — live: light gray section, centered heading */}
      <section className="sec-lg bg-mist" aria-labelledby="why-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="why-heading">Why Work With Us?</span>
            </SectionHeading>
          </Reveal>
          {/* Our own product screenshots in a laptop carousel. */}
          <Reveal>
            <div className="mt-12">
              <WhyCarousel />
            </div>
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-10 max-w-xl text-center leading-[1.75] text-stone">
              From the best tools and technology to transparency throughout the entire process,
              we&rsquo;re the top choice for buyers and sellers.
            </p>
          </Reveal>
          <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-12 text-center md:grid-cols-4">
            <StatCounter value={11} label="Counties & boroughs served" />
            <StatCounter value={24} suffix="h" label="Cash offer turnaround" />
            <StatCounter value={100} suffix="+" label="Sites your listing reaches" />
            <StatCounter value={7} label="Days a week we answer" />
          </div>
          <div className="mt-14 text-center">
            <Button href="/connect">Talk To Us</Button>
          </div>
        </div>
      </section>
    </>
  );
}
