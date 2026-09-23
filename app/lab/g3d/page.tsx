import type { Metadata } from "next";
import { preload } from "react-dom";
import { notFound } from "next/navigation";
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
import { G3dGround } from "@/components/home/g3d/G3dGround";
import { G3dAreaChapter } from "@/components/home/g3d/G3dAreaChapter";
import { AREA_ROWS } from "@/components/home/night/areas";
import { AREA_FLIGHT } from "@/components/home/night/shots";
import { HomeIntake } from "@/components/home/HomeIntake";
import { WhyCarousel } from "@/components/home/WhyCarousel";
import { TESTIMONIALS } from "@/content/testimonials";
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import { getActiveSaleCount, isDbConfigured } from "@/lib/idx/db";
import { SITE } from "@/lib/site";
import { listingPath } from "@/lib/idx/listing-url";

/** ROUND 56's LAB: the home page on Google's real 3D map (docs/parity/DESIGN-ROUND56.md §5.1).
 *
 * The home page's own sections, copied as they are (so the frames judge the real words over the
 * real map), on components/home/g3d/G3dGround.tsx instead of the night flight. Nothing here is on
 * the home page. It exists only on a machine that sets RLT_LAB=1 (read per request, so a
 * production build without the variable answers 404) and is never indexed.
 *
 * `?look=scrim` (default) or `?look=veil`, `?veil=0.42`, `?scrim=0.62` for the two looks. */
export const dynamic = "force-dynamic";

/** The night flight's still (scripts/make-night-poster.mjs): our artwork, the map's load cover. */
const POSTER = "/images/home-night-poster.webp";

export const metadata: Metadata = {
  title: "Real map lab",
  robots: { index: false, follow: false },
};

export default async function G3dLabPage() {
  if (process.env.RLT_LAB !== "1") notFound();
  // Our poster is the load cover (G3dGround): fetched with the document, not when the CSS asks.
  preload(POSTER, { as: "image", fetchPriority: "high" });
  const idx = getIdxClient();
  const [featured, fresh] = await Promise.all([idx.getFeatured(24), idx.getNew(24)]);
  const fixture = isSampleData();
  const dataLastUpdated = await getDataLastUpdated(new Date().toISOString());
  const activeCount = isDbConfigured() ? await getActiveSaleCount().catch(() => null) : null;

  return (
    <div className="nocturne isolate relative">
      {/* The site footer stands over the fixed map here, as it does over the night flight on the
          home page (components/site/FooterShell.tsx does that for "/" only). Lab-only. */}
      <style>{`footer{position:relative;z-index:10}`}</style>
      <G3dGround
        poster={POSTER}
        tail={{ shot: "region" }}
        featured={featured
          .filter((l) => l.lat && l.lng)
          .slice(0, 8)
          .map((l) => ({ id: l.id, lat: l.lat, lng: l.lng, title: `$${l.price.toLocaleString("en-US")}, ${l.address}, ${l.city}`, href: listingPath(l) }))}
      >
        <section data-shot="hero" data-veil="0" className="relative min-h-[100svh]" aria-labelledby="home-hero">
          <div data-lantern aria-hidden className="absolute inset-0 z-0" />
          <div className="rlt-hero-pad pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1250px] flex-col justify-between px-4 pb-10 pt-32 lg:justify-end lg:px-8 lg:pb-24 lg:pt-40">
            <div data-quiet className="pointer-events-auto max-w-[36rem]">
              <p className="t-eyebrow text-stone">Hudson Valley and New York City</p>
              <h1 id="home-hero" className="t-display rise mt-4 text-ink">
                Let&rsquo;s find home.
              </h1>
            </div>

            <div data-quiet className="pointer-events-auto mt-10 max-w-[36rem] lg:mt-9">
              <p className="t-lead rise rise-2 max-w-[30rem] text-ink-soft">
                {activeCount ? (
                  <>
                    <span className="font-semibold tabular-nums text-ink">{activeCount.toLocaleString("en-US")}</span> homes for sale
                    right now, from Poughkeepsie to the five boroughs. The bright lights below are them.
                  </>
                ) : (
                  <>Homes for sale right now, from Poughkeepsie to the five boroughs. The bright lights below are them.</>
                )}
              </p>
              <form
                action="/search"
                role="search"
                className="search-instrument rise rise-3 relative mt-7 flex w-full max-w-[34rem] items-center gap-2 rounded-2xl border border-line-strong bg-night-deep/70 p-2 backdrop-blur-md transition-colors focus-within:border-stone hover:border-stone/70 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-porchlight"
              >
                <label htmlFor="home-search" className="sr-only">
                  Search for homes by town, zip, or address
                </label>
                <LocationSuggest
                  id="home-search"
                  dark
                  anchor="form"
                  placeholder="Town, zip or address"
                  className="w-full bg-transparent px-4 py-3 text-[17px] text-ink placeholder:text-stone focus:outline-none max-[359px]:px-3"
                />
                <button type="submit" className={`shrink-0 rounded-lg bg-ink px-6 py-3 text-[15px] font-semibold text-paper ${PRESS} hover:bg-ink-soft max-[359px]:px-4`}>
                  Search
                </button>
              </form>
              <p className="rise rise-4 mt-5 flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
                <Link href="/home-value" className={`inline-flex min-h-[24px] items-center text-ink underline decoration-line-strong underline-offset-[6px] hover:decoration-porchlight ${PRESS}`}>
                  What is my home worth?
                </Link>
                <Link href="/selling" className={`inline-flex min-h-[24px] items-center text-ink underline decoration-line-strong underline-offset-[6px] hover:decoration-porchlight ${PRESS}`}>
                  Sell with us
                </Link>
              </p>
              <p className="mt-10 hidden max-w-[26rem] text-[13px] leading-snug text-stone lg:block">
                The bright lights are homes listed on OneKey&reg; MLS, each standing where it stands;
                the faint ones are the towns' own light, seen from orbit. Point at a home to see its town.
              </p>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-3 z-10 hidden justify-center lg:flex">
            <ScrollCue targetId="value" label="Scroll to the next section" />
          </div>
        </section>

        <section id="value" data-shot="dutchess" data-veil="0.5" data-veil-phone="0.68" className="sec" aria-labelledby="value-heading">
          <HomeIntake />
        </section>

        <section data-shot="highlands" data-veil="0.74" data-veil-phone="0.85" className="sec" aria-labelledby="featured-heading">
          <div data-quiet className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              <SectionHeading align="center" as="h2">
                <span id="featured-heading" className="mask-line">
                  <span>Featured listings</span>
                </span>
              </SectionHeading>
            </Reveal>
            <DriftRail listings={featured} ariaLabel="Featured listings" />
            <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
            <div className="mt-10 text-center">
              <Button href="/search" variant="outline">See more listings</Button>
            </div>
          </div>
        </section>

        <div data-shot="highlands" data-veil="0" data-veil-phone="0.3">
          <TestimonialBand items={TESTIMONIALS} />
        </div>

        <section data-shot="westchester" data-veil="0.74" data-veil-phone="0.85" className="sec" aria-labelledby="new-heading">
          <div data-quiet className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              <div className="flex flex-wrap items-baseline-last justify-between gap-x-8 gap-y-3">
                <SectionHeading as="h2">
                  <span id="new-heading" className="mask-line">
                    <span>New listings</span>
                  </span>
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

        <section data-shot={AREA_FLIGHT.join(",")} data-veil="0.2" data-veil-phone="0.72" className="sec lg:min-h-[240vh]" aria-labelledby="areas-heading">
          <div className="mx-auto max-w-[1250px] px-4 lg:sticky lg:top-24 lg:px-8">
            <div data-quiet className="lg:max-w-[38rem]">
              <Reveal>
                <SectionHeading as="h2">
                  <span id="areas-heading" className="mask-line">
                    <span>Where we work</span>
                  </span>
                </SectionHeading>
                <p className="mt-5 max-w-md text-stone">
                  Six counties of the Hudson Valley and all five boroughs. Every bright light is a
                  home for sale there right now.
                </p>
              </Reveal>
              <G3dAreaChapter rows={AREA_ROWS} />
            </div>
          </div>
        </section>

        <section data-shot="harbour" data-veil="0.7" data-veil-phone="0.9" className="sec" aria-labelledby="why-heading">
          <div data-quiet className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              <SectionHeading align="center" as="h2">
                <span id="why-heading" className="mask-line">
                  <span>Why work with us?</span>
                </span>
              </SectionHeading>
            </Reveal>
            <Reveal>
              <div className="mt-12">
                <WhyCarousel />
              </div>
            </Reveal>
            <Reveal>
              <p className="mx-auto mt-10 max-w-xl text-center leading-[1.75] text-stone">
                Every screen above is our own product, running on live MLS data. The rest of the
                case is three numbers.
              </p>
            </Reveal>
            <Reveal>
              <ul className="mt-16 border-t border-line">
                {[
                  { n: "24h", claim: "A written cash offer on your home, inside twenty-four hours.", act: "See your number", href: "/home-value" },
                  { n: "100+", claim: "Search sites your listing reaches when we take it to market.", act: "How we sell", href: "/selling" },
                  { n: "7", claim: "Days a week a person answers the phone.", act: `Call ${SITE.phone}`, href: SITE.phoneHref },
                ].map((f) => (
                  <li key={f.n} className="flex flex-col gap-2 border-b border-line py-8 md:grid md:grid-cols-[11rem_1fr_auto] md:items-baseline md:gap-x-8">
                    <span className="t-h2 tabular-nums text-ink">{f.n}</span>
                    <p className="leading-[1.7] text-stone">{f.claim}</p>
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
      </G3dGround>
    </div>
  );
}
