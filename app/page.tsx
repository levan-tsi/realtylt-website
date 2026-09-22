import type { Metadata } from "next";
import Link from "next/link";
import { Button, PRESS } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialBand } from "@/components/ui/TestimonialBand";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { DriftRail } from "@/components/idx/DriftRail";
import { RailPager } from "@/components/idx/RailPager";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { HeroLights } from "@/components/home/HeroLights";
import { AreaLights, type AreaGroup } from "@/components/home/AreaLights";
import { HomeIntake } from "@/components/home/HomeIntake";
import { WhyCarousel } from "@/components/home/WhyCarousel";
import { TESTIMONIALS } from "@/content/testimonials";
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import { getActiveSaleCount, isDbConfigured } from "@/lib/idx/db";
import { BOROUGHS, COUNTIES, OG_DEFAULTS, SITE, TOP_AREA_GROUPS } from "@/lib/site";

// Re-render hourly in live mode so the listing rails + "Data last updated" stay honest.
export const revalidate = 600; // keep listing rails + "Data last updated" fresh in live mode

export const metadata: Metadata = {
  title: "RealtyLT | Hudson Valley & NYC Homes for Sale",
  description:
    "Let's find home. Search homes for sale across the Hudson Valley and all five NYC boroughs, or get your home's value and a cash offer in 24 hours.",
  // EXPLICIT, because the self-canonical idiom inherited from app/layout.tsx resolves to `/index`
  // HERE and nowhere else. In a production build the root page is prerendered to index.html, so a
  // relative canonical resolves against the pathname `/index`, and `/index` 308-redirects to `/`.
  // Production was telling Google that the canonical version of its most important page is a
  // redirect, while the sitemap listed `/`. Dev cannot see it: dev does not prerender, and the same
  // page on :3100 renders clean. Verified against `next build` output. Guarded by app/canonical.test.ts.
  alternates: { canonical: "/" },
  // og:url gets the same explicit value for the same reason: the layout's `url: "./"` would
  // resolve to /index here exactly as the canonical did. A page-level openGraph REPLACES the
  // layout's block, so the shared card fields ride along. Guarded by app/canonical.test.ts.
  openGraph: { ...OG_DEFAULTS, images: [...OG_DEFAULTS.images], url: "/" },
};

/** The area tiles, in the order and with the links the nav's Top Areas uses (TOP_AREA_GROUPS
 * is built from COUNTIES and BOROUGHS in this same order), plus the feed slug each tile draws. */
const AREA_TILES: AreaGroup[] = [
  {
    id: "hudson-valley",
    label: "Hudson Valley",
    items: COUNTIES.map((c, i) => ({ slug: c.slug, name: c.name.replace(" County", ""), href: TOP_AREA_GROUPS[0].items[i].href })),
  },
  {
    id: "nyc",
    label: "New York City",
    items: BOROUGHS.map((b, i) => ({ slug: b.slug, name: b.name, href: TOP_AREA_GROUPS[1].items[i].href })),
  },
];

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
  // The hero's number. Null when there is no database or it does not answer: the sentence then
  // simply says "Homes for sale", rather than print a number nobody measured.
  const activeCount = isDbConfigured() ? await getActiveSaleCount().catch(() => null) : null;

  return (
    // Blue hour (round 53): this wrapper re-points the colour and type tokens for everything
    // inside it (app/globals.css `.nocturne`); lib/site.ts NIGHT_ROUTES dresses the chrome to match.
    <div className="nocturne">
      {/* ── Hero: BLUE HOUR ON THE HUDSON (round 53). The owner's developer friend said the /ai page
          reads futuristic and this one reads 2020, and it did: a greyscale photograph under a
          serif headline with one bold word, uppercase pills, a white shelf of a header. The new
          first screen is one living picture instead: the territory at night, drawn only in light,
          where every light is an active listing at its address (components/home/HeroLights.tsx).
          The words sit where the map is quiet: left of it on a laptop, under it on a phone.
          The number is rendered HERE, on the server, from the same scope a default /search
          counts, so it is true with JavaScript off and it matches the page the search opens. */}
      <section className="relative isolate overflow-hidden bg-paper" aria-labelledby="home-hero">
        {/* The city's own glow on the low sky, where the lights are densest. Its source is the
            five boroughs at the bottom of the map. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(90% 50% at 68% 92%, rgba(40,74,118,0.5), rgba(11,26,46,0) 70%)" }}
        />
        <HeroLights className="absolute inset-x-0 bottom-[168px] top-[92px] lg:inset-y-auto lg:bottom-6 lg:left-auto lg:right-0 lg:top-[104px] lg:w-[62%] xl:w-[60%]" />
        {/* No JavaScript, no canvas: the night, the glow and the words still stand, and the
            search box is a plain GET form. The count does not need the map to be true. */}
        {/* A PHONE splits the words around the map instead of laying them over it: the
            headline over the quiet north (Ulster and Dutchess are sparse, and a scrim holds
            it), the search box under the harbour, where the city's lights have ended and a
            thumb already is. Over the city itself no line of text could hold its contrast. */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-paper via-paper/80 to-transparent lg:hidden" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-paper via-paper/90 to-transparent lg:hidden" />
        {/* The hero hands over to the page with no edge: the city's glow falls to night before
            the section ends, so the intake below reads as the same night, not a new band. */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 hidden h-28 bg-gradient-to-t from-paper to-transparent lg:block" />
        <div className="pointer-events-none relative mx-auto flex min-h-[max(680px,100svh)] max-w-[1250px] flex-col justify-between px-4 pb-10 pt-32 lg:justify-center lg:px-8 lg:pb-24 lg:pt-40">
          <div className="pointer-events-auto max-w-[35rem]">
            <h1 id="home-hero" className="t-display rise text-ink">
              Let&rsquo;s find home.
            </h1>
            <p className="t-lead rise rise-2 mt-5 max-w-[29rem] text-stone lg:mt-6">
              {activeCount ? (
                <>
                  <span className="font-semibold tabular-nums text-ink">{activeCount.toLocaleString("en-US")}</span> homes for sale
                  right now, from Poughkeepsie to the five boroughs. Every light on the map is one of them.
                </>
              ) : (
                <>Homes for sale right now, from Poughkeepsie to the five boroughs. Every light on the map is one of them.</>
              )}
            </p>
          </div>

          <div className="pointer-events-auto max-w-[35rem] lg:mt-10">
            {/* One instrument (components/search-instrument.test.ts pins the geometry: 16px body,
                8px inset, 8px gap, so the action never touches the field, the owner's standing
                note). Glass over the night rather than a black shelf. */}
            <form
              action="/search"
              role="search"
              className="search-instrument rise rise-3 relative flex w-full max-w-[34rem] items-center gap-2 rounded-2xl border border-line-strong bg-night-deep/70 p-2 backdrop-blur-md transition-colors focus-within:border-stone hover:border-stone/70 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-porchlight"
            >
              <label htmlFor="home-search" className="sr-only">
                Search for homes by town, zip, or address
              </label>
              <LocationSuggest
                id="home-search"
                dark
                anchor="form"
                placeholder="Town, zip or address"
                className="w-full bg-transparent px-4 py-3 text-[17px] text-ink placeholder:text-stone focus:outline-none"
              />
              <button
                type="submit"
                className={`shrink-0 rounded-lg bg-ink px-6 py-3 text-[15px] font-semibold text-paper ${PRESS} hover:bg-ink-soft`}
              >
                Search
              </button>
            </form>
            <p className="rise rise-4 mt-5 flex flex-wrap gap-x-7 gap-y-3 text-[15px] lg:mt-6">
              <Link
                href="/home-value"
                className={`inline-flex min-h-[24px] items-center text-ink underline decoration-line-strong underline-offset-[6px] hover:decoration-porchlight ${PRESS}`}
              >
                What is my home worth?
              </Link>
              <Link
                href="/selling"
                className={`inline-flex min-h-[24px] items-center text-ink underline decoration-line-strong underline-offset-[6px] hover:decoration-porchlight ${PRESS}`}
              >
                Sell with us
              </Link>
            </p>
          </div>
        </div>
        {/* What the lights are, said once and small, with the data's source: this is listing
            data on a map, so it carries the MLS credit the rails below carry. */}
        <p className="pointer-events-none absolute bottom-6 right-28 hidden max-w-[17rem] text-right text-[13px] leading-snug text-stone lg:block">
          Each light is a home listed on OneKey&reg; MLS, placed at its address. Point at one to see
          the town.
        </p>
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <ScrollCue targetId="value" label="Scroll to the next section" />
        </div>
      </section>

      {/* ── The intake (round 50, owner-directed). This was "Find Your Home Value" beside a
          "Tell Us About Your Home" form, and the footer then asked the same six fields again:
          "the same feeling in form" twice on one page. Now the section asks one question (buy,
          sell, or both), follows the answer with the two or three that matter, and only then
          asks for a name, on the page rather than in a pop-up. The seller copy that stood here
          is not lost: the ledger under "Why Work With Us" carries the 24h offer and the 100+
          sites, and the details step says what a seller gets back. id="value" stays: it is the
          scroll cue's target and the section's job is still the same first conversation. */}
      <section id="value" className="sec bg-paper" aria-labelledby="value-heading">
        <HomeIntake />
      </section>

      {/* ── Featured listings. Heading stays centred: it sits over a symmetric card grid, which
          is the one case where centring is structure rather than decoration. */}
      <section className="sec bg-paper" aria-labelledby="featured-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="featured-heading">Featured listings</span>
            </SectionHeading>
          </Reveal>
          {/* FEATURED DRIFTS, NEW LISTINGS DOES NOT, and that asymmetry is the point. Round 31
              made these two sections differ in WEIGHT so a visitor can tell they have moved:
              Featured is the loud one (centred heading over a symmetric set), New Listings is
              deliberately quiet. Giving both of them ambient motion would collapse that back into
              one repeated shape, which is the exact defect that decision fixed. The showcase
              moves; the quiet one stays a paged grid. */}
          <DriftRail listings={featured} ariaLabel="Featured listings" />
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-10 text-center">
            <Button href="/search" variant="outline">See more listings</Button>
          </div>
        </div>
      </section>

      {/* ── Testimonial band — live: ONE centered quote with arrows between the two rails */}
      <TestimonialBand items={TESTIMONIALS} />

      {/* ── New listings. Deliberately NOT the same section again.
          This and Featured above were identical objects — centred heading, card grid, MLS
          attribution, and a centred outline pill carrying the same four words, "See More
          Listings", twice on one page. A visitor scrolling past could not tell they had moved.
          The fix is hierarchy, not new wording: Featured stays the loud one (centred heading
          over a symmetric grid, which is the one place centring is structure rather than
          decoration, and a pill), and this one is quiet — heading left, its link inline beside
          it, no second pill. Two sections that differ in WEIGHT read as two sections; two that
          differ only in their heading text read as one repeated shape. The link is also named
          for where it actually goes, since it does not lead to the same place Featured's does. */}
      <section className="sec bg-paper" aria-labelledby="new-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <SectionHeading as="h2">
                <span id="new-heading">New listings</span>
              </SectionHeading>
              <Button href="/search?sort=newest" variant="ghost">
                See all new listings
              </Button>
            </div>
          </Reveal>
          <div className="mt-10">
            <RailPager listings={fresh} ariaLabel="New listings" />
          </div>
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
        </div>
      </section>

      {/* ── Where we work (round 53). It used to be eleven uppercase pills in two labelled rows,
          which said the names and nothing else. Now each area is a tile that draws its own homes
          for sale as lights, from the same data as the hero (components/home/AreaLights.tsx),
          with its real count: the hero's night, one place at a time. The two groups stay
          apart, because the distinction is the business's real footprint (lib/site.ts). */}
      <section className="sec bg-paper" aria-labelledby="areas-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <SectionHeading as="h2">
                <span id="areas-heading">Where we work</span>
              </SectionHeading>
              <p className="max-w-md text-stone">
                Six counties of the Hudson Valley and all five boroughs. Every light is a home
                for sale there right now.
              </p>
            </div>
          </Reveal>
          <div className="mt-10">
            <AreaLights groups={AREA_TILES} />
          </div>
        </div>
      </section>

      {/* ── Why work with us — live: light gray section, centered heading.
          .sec, not .sec-lg (round 36): the closing band used to trail ~200px of empty mist
          under TALK TO US — the largest padding step wrapped around the page's least dense
          block. The ledger gives the section real mass, so it takes the middle step. */}
      <section className="sec bg-mist" aria-labelledby="why-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <Reveal>
            <SectionHeading align="center" as="h2">
              <span id="why-heading">Why work with us?</span>
            </SectionHeading>
          </Reveal>
          {/* Our own product screenshots in a laptop carousel. */}
          <Reveal>
            <div className="mt-12">
              <WhyCarousel />
            </div>
          </Reveal>
          {/* "From the best tools and technology… we're the top choice for buyers and sellers"
              was the last vendor sentence on the page — a superlative with nothing behind it,
              sitting over the most templated block on the web: four big numbers, four small
              caps labels ("11 / 24h / 100+ / 7"), four across. Round 36 replaced the device
              with a LEDGER: each fact is a hairline-ruled row — the number in the display
              face, the claim as a sentence, and the thing a visitor can DO about it — because
              the assessment's rule was that a number that stays must be one a visitor can act
              on. "11 counties & boroughs" is gone as a numeral: the areas strip above states
              it by name, interactively, which is a better version of the same fact.
              The numbers still render on the SERVER with no count-up, no observer and no
              interim state — StatCounter's "never show a number that is not true" rule carries
              over by construction, and components/ui/field-float.test.ts now guards it here. */}
          <Reveal>
            <p className="mx-auto mt-10 max-w-xl text-center leading-[1.75] text-stone">
              Every screen above is our own product, running on live MLS data. The rest of the
              case is three numbers.
            </p>
          </Reveal>
          <Reveal>
            <ul className="mt-16 border-t border-line">
              {[
                {
                  n: "24h",
                  claim: "A written cash offer on your home, inside twenty-four hours.",
                  act: "See your number",
                  href: "/home-value",
                },
                {
                  n: "100+",
                  claim: "Search sites your listing reaches when we take it to market.",
                  act: "How we sell",
                  href: "/selling",
                },
                {
                  n: "7",
                  claim: "Days a week a person answers the phone.",
                  act: `Call ${SITE.phone}`,
                  href: SITE.phoneHref,
                },
              ].map((f) => (
                <li
                  key={f.n}
                  className="flex flex-col gap-2 border-b border-line py-8 md:grid md:grid-cols-[11rem_1fr_auto] md:items-baseline md:gap-x-8"
                >
                  {/* The figure in the display face at section size (round 53): on the night
                      page the ledger is the one place numbers lead, so they are set to be read
                      from across the room. */}
                  <span className="t-h2 tabular-nums text-ink">{f.n}</span>
                  <p className="leading-[1.7] text-stone">{f.claim}</p>
                  {/* self-start: in the stacked phone row the Button would stretch and centre
                      its text against an otherwise left-aligned ledger. */}
                  <Button href={f.href} variant="ghost" className="self-start md:self-baseline">
                    {f.act}
                  </Button>
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="mt-12 text-center">
            <Button href="/connect">Talk to us</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
