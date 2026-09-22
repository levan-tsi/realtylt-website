import type { Metadata } from "next";
import { preload } from "react-dom";
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
import { NightGround } from "@/components/home/night/NightGround";
import { AreaChapter } from "@/components/home/night/AreaChapter";
import { AREA_ROWS } from "@/components/home/night/areas";
import { AREA_FLIGHT } from "@/components/home/night/shots";
import { HomeIntake } from "@/components/home/HomeIntake";
import { WhyCarousel } from "@/components/home/WhyCarousel";
import { TESTIMONIALS } from "@/content/testimonials";
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import { getActiveSaleCount, isDbConfigured } from "@/lib/idx/db";
import { OG_DEFAULTS, SITE } from "@/lib/site";

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

export default async function HomePage() {
  // The display face, fetched with the page instead of discovered by the stylesheet (round 53):
  // without it the header's text swapped face after first paint and moved /search's content.
  preload("/fonts/bricolage.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
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
    // ── THE NIGHT FLIGHT (round 54). The page is one aerial scene and scrolling is the camera
    // flying through it: the harbour, up the river to Dutchess, the Highlands, the Tappan Zee,
    // the eleven areas one at a time, back over the harbour and out to the whole region. The
    // scene is a fixed canvas BEHIND everything (components/home/night/NightGround.tsx); every
    // section below says which shot it holds the camera on and how far it dims the scene so its
    // own words can be read. Nothing here needs the scene: the headline, the count, the search
    // box, the listings and every link are server-rendered and work with no JavaScript at all.
    //
    // `isolate` makes this element the stacking context, so the fixed canvas (z-0) sits above
    // the ground colour and below the content (z-10) without escaping into the footer.
    // `.nocturne` re-points the site's tokens to the night (app/globals.css).
    <div className="nocturne isolate relative">
      <NightGround poster="/images/home-night-poster.webp">
        {/* ── Hero. The establishing shot: high over the harbour looking north up the valley,
            the whole territory one shape of light. The words sit bottom left, over New Jersey,
            where the scene has no lights; on a phone the headline is high and the search box is
            low, with the region burning between them. */}
        <section
          data-shot="hero"
          data-veil="0"
          className="relative min-h-[100svh]"
          aria-labelledby="home-hero"
        >
          {/* The lantern's field. The canvas is behind the page and takes no pointer events, so
              this empty layer forwards them: near the cursor the land brightens, the nearest
              town is named with its real count, and a click opens that town's search. It sits
              UNDER the words and the form, which are the only things here worth clicking. */}
          <div data-lantern aria-hidden className="absolute inset-0 z-0" />
          {/* rlt-hero-pad: without JavaScript the header carries one more row (the folded link
              list), so the words start one row lower there (app/globals.css). */}
          {/* pointer-events-none on the column, auto on the two blocks of words: the lantern's field
              lies under this and would otherwise never see the pointer, because a full-width
              column covers the whole first screen whether or not it has words at that point. */}
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
                    right now, from Poughkeepsie to the five boroughs. Every light below is one of them.
                  </>
                ) : (
                  <>Homes for sale right now, from Poughkeepsie to the five boroughs. Every light below is one of them.</>
                )}
              </p>
              {/* One instrument (components/search-instrument.test.ts pins the geometry: 16px
                  body, 8px inset, 8px gap, so the action never touches the field, the owner's
                  standing note). Glass over the night rather than a black shelf. */}
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
                  // max-[359px]: at 320 the placeholder read "Town, zip or ac": 152px of words in
                  // 108px, because the empty field also reserved the clear button's 23px. The night
                  // rule in globals.css drops that reserve while the placeholder shows, and 8px off
                  // the field's inset and 16px off the action's bring the room to 155px.
                  className="w-full bg-transparent px-4 py-3 text-[17px] text-ink placeholder:text-stone focus:outline-none max-[359px]:px-3"
                />
                <button
                  type="submit"
                  className={`shrink-0 rounded-lg bg-ink px-6 py-3 text-[15px] font-semibold text-paper ${PRESS} hover:bg-ink-soft max-[359px]:px-4`}
                >
                  Search
                </button>
              </form>
              <p className="rise rise-4 mt-5 flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
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
              {/* What the lights are, said once and small, with the data's source: this is
                  listing data drawn on the land, so it carries the MLS credit the rails below
                  carry. In the text column, never over the city. */}
              <p className="mt-10 hidden max-w-[26rem] text-[13px] leading-snug text-stone lg:block">
                Every light is a home listed on OneKey&reg; MLS, standing where it stands. Point at
                one to see the town.
              </p>
            </div>
          </div>
          {/* From lg only. On a phone the search box and its two links already end the first
              screen, and the cue sat on top of "What is my home worth?". */}
          <div className="absolute inset-x-0 bottom-3 z-10 hidden justify-center lg:flex">
            <ScrollCue targetId="value" label="Scroll to the next section" />
          </div>
        </section>

        {/* ── The intake (round 50, owner-directed). One question (buy, sell, or both), then the
            two or three that matter, then a name. The camera has climbed the river to Dutchess,
            where our office is; the scene dims a third so the panel reads over it. */}
        <section id="value" data-shot="dutchess" data-veil="0.5" data-veil-phone="0.68" className="sec" aria-labelledby="value-heading">
          <HomeIntake />
        </section>

        {/* ── Featured listings, over the Highlands: the gorge looking south, with Storm King and
            Bear Mountain dark against the light beyond them. Cards need to be read, so the scene
            is veiled here (dimmed in the shader, not covered by a band) and keeps moving behind. */}
        <section data-shot="highlands" data-veil="0.74" data-veil-phone="0.85" className="sec" aria-labelledby="featured-heading">
          <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              <SectionHeading align="center" as="h2">
                <span id="featured-heading">Featured listings</span>
              </SectionHeading>
            </Reveal>
            {/* FEATURED DRIFTS, NEW LISTINGS DOES NOT, and that asymmetry is the point (round 31):
                two sections that differ in WEIGHT read as two sections. */}
            <DriftRail listings={featured} ariaLabel="Featured listings" />
            <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
            <div className="mt-10 text-center">
              <Button href="/search" variant="outline">See more listings</Button>
            </div>
          </div>
        </section>

        {/* ── Testimonial: the one held shot on the page. No veil, so the Highlands stand at full
            strength behind a single quote, and the camera only drifts. */}
        <div data-shot="highlands" data-veil="0" data-veil-phone="0.3">
          <TestimonialBand items={TESTIMONIALS} />
        </div>

        {/* ── New listings, over the Tappan Zee: the river cut diagonally through the frame with
            Westchester near and Rockland beyond. Deliberately NOT Featured again — heading left,
            its link inline beside it, no second pill. */}
        <section data-shot="westchester" data-veil="0.74" data-veil-phone="0.85" className="sec" aria-labelledby="new-heading">
          <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
            <Reveal>
              {/* Last baselines, not box bottoms (round 53 polish). */}
              <div className="flex flex-wrap items-baseline-last justify-between gap-x-8 gap-y-3">
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

        {/* ── Where we work: THE chapter where the scene is the content. The camera arrives over
            each area in turn as the list scrolls (this section holds eleven shots, one per row),
            that area's homes burn and the rest of the map falls to near black. Hovering a row or
            reaching it with the keyboard flies there at once. On a phone it is a plain tappable
            list; the scene frames whichever row was last touched.
            The tall block and the sticky list give the flight room to breathe on a laptop; on a
            phone the section is its natural height and nothing is pinned. */}
        <section
          data-shot={AREA_FLIGHT.join(",")}
          data-veil="0.2"
          data-veil-phone="0.72"
          className="sec lg:min-h-[240vh]"
          aria-labelledby="areas-heading"
        >
          <div className="mx-auto max-w-[1250px] px-4 lg:sticky lg:top-24 lg:px-8">
            {/* The index keeps to the left half from lg and the scene owns the right, where the
                county the page is on is burning on its own. `data-quiet` hands the scene that
                box so the words never have a contour through them. */}
            <div data-quiet className="lg:max-w-[38rem]">
              <Reveal>
                <SectionHeading as="h2">
                  <span id="areas-heading">Where we work</span>
                </SectionHeading>
                <p className="mt-5 max-w-md text-stone">
                  Six counties of the Hudson Valley and all five boroughs. Every light is a home
                  for sale there right now.
                </p>
              </Reveal>
              <AreaChapter rows={AREA_ROWS} />
            </div>
          </div>
        </section>

        {/* ── Why work with us: arriving over the harbour, the densest light on the map, and then
            the camera rises and pulls back to the whole region as the page ends. */}
        <section data-shot="harbour,region" data-veil="0.7" data-veil-phone="0.9" className="sec" aria-labelledby="why-heading">
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
            {/* A LEDGER, not four big numbers: each fact is a hairline-ruled row — the number in
                the display face, the claim as a sentence, and the thing a visitor can DO about
                it. Rendered on the SERVER with no count-up and no interim state. */}
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
                    {/* The figure in the display face at section size: on the night page the
                        ledger is the one place numbers lead. */}
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
      </NightGround>
    </div>
  );
}
