import type { Metadata } from "next";
import Link from "next/link";
import { Button, PRESS } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { TestimonialBand } from "@/components/ui/TestimonialBand";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { LeadForm } from "@/components/leads/LeadForm";
import { DriftRail } from "@/components/idx/DriftRail";
import { RailPager } from "@/components/idx/RailPager";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LocationSuggest } from "@/components/search/LocationSuggest";
import { HomeHeroVideo } from "@/components/home/HomeHeroVideo";
import { WhyCarousel } from "@/components/home/WhyCarousel";
import { TESTIMONIALS } from "@/content/testimonials";
import { getDataLastUpdated, getIdxClient, isSampleData } from "@/lib/idx";
import { TOP_AREA_GROUPS } from "@/lib/site";

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
              the bottom gradient is what the type actually sits on. Round 12 eased it once
              (85%->80%, 92->88, 58->50). Round 27 eased it again, harder (80%->68%, 88->68,
              50->38), because the owner named the result: below the headline the photograph
              died into a flat black slab, in every render state — video, poster, no-JS and
              reduced motion were each driven and shot. The search instrument carries its own
              ground (bg-black/45 + blur), so the gradient only has to hold the eyebrow, the
              headline and the two outline pills. Floors re-proven after the ease with the
              committed scripts/verify-hero-contrast.mjs gate at 1440 and 390. */}
          <div aria-hidden className="absolute inset-0 bg-black/20" />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-black/68 via-black/38 to-transparent"
          />
          {/* Third layer, added WITH the round-27 ease: a left-edge vignette under the type
              column only. Easing the bottom gradient exposed bright photo patches behind the
              11px eyebrow (the gate measured it at 2.61:1 against a 4.5 floor), and the wrong
              fix was re-darkening the whole frame — that rebuilds the slab. Light falling off
              toward the title side is how a photograph grades itself; the subject side of the
              picture stays open. Measured back over the floor by the same gate at 1440 and 390. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[62%] bg-gradient-to-r from-black/40 to-transparent"
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
          {/* text-paper/85, not /70: at 11px over live photography, 30% translucency was the
              margin the AA floor could not spare once the scrim eased. */}
          <p className="t-eyebrow rise text-paper/85">Hudson Valley &amp; New York City</p>
          <h1 id="home-hero" className="t-display rise rise-2 mt-5 text-paper">
            Let&rsquo;s Find <strong>Home</strong>
          </h1>

          {/* One instrument, two quiet paths. The owner rejected the butted-together control
              twice now — pre-round-11, and again reviewing this round: round 11's "4px inset"
              measured 0px between the input's edge and the button's, so the white button read
              as bricked into the bar. Round 27 gives the control the geometry the /home-value
              instrument already proves out: one shared body, real air on every side of the
              action. Radii stay concentric on the site scale — container 16px (the panel step,
              which this ~64px object is) = button 8px + 8px inset, with an explicit 8px gap
              so input text can never touch the button. The two secondary CTAs keep no boxes:
              the picture is the luxury. */}
          <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <form
              action="/search"
              role="search"
              /* THE FRONT DOOR'S PRIMARY CONTROL HAD ALMOST NO FOCUS STATE. The input
                 carries `focus:outline-none` and hands its focus state to this container,
                 which answered with `bg-black/45 -> /55`: measured over the hero photograph
                 that is a shift of about 4 in 255 per channel, under 0.4% of the pixels in
                 the field's own box. The site's stated floor is focus-visible >= 3:1, and a
                 keyboard visitor arriving at the one control the page is built around got
                 essentially nothing.
                 The ring is drawn on the INSTRUMENT, not the input, because the input has no
                 edges of its own — and it is scoped with `has-[input:focus-visible]` rather
                 than `focus-within` so that tabbing on to the Search button shows that
                 button's own ring instead of two rings at once. White, because on a
                 photograph the site's navy ring would be the invisible option. */
              className="search-instrument relative flex w-full max-w-[600px] items-center gap-2 rounded-2xl border border-paper/30 bg-black/45 p-2 backdrop-blur-[2px] transition-colors focus-within:bg-black/55 hover:border-paper/45 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-paper"
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
                className={`shrink-0 rounded-lg bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink ${PRESS} hover:bg-mist`}
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
                className={`inline-flex min-h-[40px] items-center rounded-xl border border-paper/60 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper ${PRESS} hover:border-paper hover:bg-paper hover:text-ink`}
              >
                Sell Your Home
              </Link>
              <Link
                href="/home-value"
                className={`inline-flex min-h-[40px] items-center rounded-xl border border-paper/60 px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper ${PRESS} hover:border-paper hover:bg-paper hover:text-ink`}
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
        {/* lg:items-center, because the two columns are not the same height and never will be:
            the form is a tall panel and the copy beside it is five lines shorter. Left-aligned
            at the top it left ~545px of dead white under the copy, which is exactly the "unused
            extra space" complaint. Centred, the shorter column sits against the middle of the
            taller one and the section reads as one object. */}
        <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <Reveal>
            {/* The eyebrow is the section's entry point, and it is the first one on this page:
                every home-page section had been a bare centred h2, so nothing told a reader
                which section they had arrived in before the headline did. */}
            <SectionHeading as="h2" eyebrow="For sellers">
              <span id="value-heading">Find Your Home Value</span>
            </SectionHeading>
            {/* The owner's own words, verbatim — his copy, not ours to rewrite. What round 11
                changed was the SETTING: the opening paragraph reads a size up in the darker ink
                so the block has an entry point, the measure is tighter (~62 characters rather
                than 90), and the paragraphs are spaced further apart.
                Round 19 moved his THIRD paragraph out of here and onto the form. It is an
                instruction — "Enter your information on this page" — and it was sitting at the
                bottom of a text column on the far side of the page from the thing it instructs.
                Not a rewrite: the same sentence, next to what it is about. */}
            {[
              "So, you're ready to sell your home! Congratulations, you've come to the right place. We belong to one of the strongest real estate brokerages in the area. We have great confidence in our brand and you can, too. We demand excellence throughout the home-selling process.",
              "We have established a solid reputation for impeccable customer service and marketing strategies. When you entrust the sale of your home to us, you are putting your faith in our entire network of experts in Real estate sales, Real estate purchases, Loan processing and Marketing.",
            ].map((p, i) => (
              <p
                key={i}
                className={
                  // Two paragraphs of one block were set at two sizes AND two leadings —
                  // 17px/1.7 then 16px/1.75. Nobody decides that; 17px is not a step on this
                  // site's scale and a 1px difference is not a decision, it is drift. One size
                  // and one leading now, with the colour still carrying the lead-in.
                  i === 0
                    ? "mt-7 max-w-md leading-[1.7] text-ink-soft"
                    : "mt-5 max-w-md leading-[1.7] text-stone"
                }
              >
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={140}>
            {/* The form is an OBJECT, not loose fields on a page. It had been a bare heading over
                naked inputs sitting directly on the white, next to a column of body copy — so the
                densest, most important thing in the section was the one thing with no edges. Every
                other form on the site that matters sits in a panel; this one now does too. 24px is
                the large-feature-panel step, which is what this is. */}
            <div className="rounded-3xl border border-line bg-mist p-6 md:p-8 lg:p-10">
              <h3 className="t-h3 text-ink">Tell Us About Your Home</h3>
              <p className="mb-7 mt-3 max-w-md leading-[1.7] text-stone">
                Enter your information on this page to discover what your home is worth. We have
                experts in every area that have access to the resources needed to provide an
                accurate estimate.
              </p>
              {/* Live home-page form: First/Last 2-up, then Email, Phone, Property Address,
                  Message stacked single-column (no interest dropdown). Wiring/validation/
                  honeypot unchanged; intent still reaches the CRM via the hidden reason. */}
              {/* redirectOnSuccess: this is the home page's primary conversion, and it had no
                  page view behind it to count. The inline success stays the default everywhere
                  a redirect would cost more than it measures (see LeadForm's prop comment). */}
              <LeadForm
                splitName
                withAddress
                stackAddressRow
                hideReason
                redirectOnSuccess
                defaultReason="I'm interested in selling a home"
                submitLabel="Send Message"
                successTitle="Got it. Thanks."
                successBody="We'll start on your home's numbers and reach out shortly."
              />
            </div>
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
          {/* FEATURED DRIFTS, NEW LISTINGS DOES NOT, and that asymmetry is the point. Round 31
              made these two sections differ in WEIGHT so a visitor can tell they have moved:
              Featured is the loud one (centred heading over a symmetric set), New Listings is
              deliberately quiet. Giving both of them ambient motion would collapse that back into
              one repeated shape, which is the exact defect that decision fixed. The showcase
              moves; the quiet one stays a paged grid. */}
          <DriftRail listings={featured} ariaLabel="Featured listings" />
          <MlsAttribution dataLastUpdated={dataLastUpdated} fixtureMode={fixture} className="mt-6" />
          <div className="mt-10 text-center">
            <Button href="/search" variant="outline">See More Listings</Button>
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
                <span id="new-heading">New Listings</span>
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

      {/* ── Areas strip. No top padding of its own: the hairline rule is what separates it
          from the listings above, and a second gap on top of that rule reads as a mistake.

          It used to be eleven identical pills centre-justified into one bag, which wrapped 7 + 4
          so the second row read as an orphaned remnant, and which silently mixed two different
          kinds of place — "THE BRONX" sat at the end of the county row as though it were a
          county. The distinction is true and it is the business's actual footprint, so the
          structure now carries it instead of throwing it away. lib/site.ts already said these
          are "presented separately (Top Areas flyout, home areas strip)"; only the flyout was
          doing it. Sharing TOP_AREA_GROUPS also means this strip and the nav flyout can never
          drift, and it retires the borough-slug branch this file was reimplementing inline.

          Left-aligned on purpose — but NOT for the reason this comment used to give. It said
          "every other section below the hero centres its heading", and that stopped being true
          when New Listings was deliberately made the quiet one and moved its heading left. The
          page's actual rule is the one Featured states: a heading centres only where it sits over
          a symmetric grid, and reads left everywhere else. This strip is a left label against a
          ragged row of pills, so it reads left. */}
      <section className="bg-paper pb-20 md:pb-28" aria-labelledby="areas-heading">
        <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
          <h2 id="areas-heading" className="sr-only">
            Areas we serve
          </h2>
          <div className="space-y-8 border-t border-line pt-12">
            {TOP_AREA_GROUPS.map((group) => (
              <div key={group.id} className="flex flex-col gap-3 md:flex-row md:gap-10">
                {/* pt-2.5 optically sets the 11px label against the pills' text rather than
                    their box, which sits 36px tall. */}
                <h3 className="t-eyebrow shrink-0 text-ink md:w-36 md:pt-2.5">{group.label}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`inline-flex min-h-[36px] items-center rounded-full border border-line px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-stone ${PRESS} hover:border-ink hover:bg-ink hover:text-paper`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
